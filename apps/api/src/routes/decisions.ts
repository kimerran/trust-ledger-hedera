import { Router } from 'express';
import { z } from 'zod';
import { ulid } from 'ulid';
import { eq, and, desc } from 'drizzle-orm';
import pino from 'pino';
import { db } from '../../db/index';
import { decisions, auditEvents, workflowRuns } from '../../db/schema';
import { tenantGuard } from '../middleware/tenantGuard';
import { hashDecision } from '@trustledger/shared';
import { signWithKMS } from '../services/kmsService';
import { anchorDecision } from '../services/anchorService';
import { verifyDecision } from '../services/verificationService';

import { broadcastEvent } from './events';

const router = Router();
const log = pino({ name: 'decisions-route' });

// ─── Validation schemas ───────────────────────────────────────────────────────

const topFeatureSchema = z.object({
  name: z.string(),
  value: z.unknown(),
  contribution: z.number(),
});

const submitDecisionSchema = z.object({
  modelId: z.string().uuid(),
  decisionType: z.string().min(1),
  outcome: z.string().min(1),
  confidence: z.number().min(0).max(1),
  topFeatures: z.array(topFeatureSchema),
  metadata: z.record(z.unknown()).optional(),
});

// ─── GET /decisions/public/:id/verify (no auth) ──────────────────────────────

router.get('/public/:id/verify', async (req, res) => {
  const { id } = req.params;

  try {
    const [decision] = await db
      .select()
      .from(decisions)
      .where(eq(decisions.id, id))
      .limit(1);

    if (!decision) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Decision not found' },
      });
      return;
    }

    const result = await verifyDecision(decision);
    res.json({ success: true, data: result });
  } catch (err) {
    log.error({ err, id }, 'Public verification failed');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Verification failed' },
    });
  }
});

// ─── POST /decisions ──────────────────────────────────────────────────────────

router.post('/', tenantGuard, async (req, res) => {
  const parsed = submitDecisionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: parsed.error.message },
    });
    return;
  }

  const { modelId, decisionType, outcome, confidence, topFeatures, metadata } = parsed.data;
  const tenantId = req.tenantId;
  const decisionId = ulid();

  const payload: Record<string, unknown> = {
    confidence,
    decisionType,
    modelId,
    outcome,
    topFeatures,
  };

  const inputHash = hashDecision(payload);

  try {
    // 1. Persist in PENDING state
    await db.insert(decisions).values({
      id: decisionId,
      tenantId,
      modelId,
      decisionType,
      outcome,
      confidence: confidence.toFixed(4),
      topFeatures,
      inputHash,
      status: 'PENDING',
      metadata: metadata ?? null,
    });

    await db.insert(auditEvents).values({
      tenantId,
      decisionId,
      eventType: 'DECISION_SUBMITTED',
      payload: { decisionId, inputHash },
    });
    broadcastEvent(tenantId, 'DECISION_SUBMITTED', { decisionId, inputHash });

    // 2. Sign with KMS (or local dev key)
    let signature: string;
    try {
      signature = await signWithKMS(inputHash);
      await db
        .update(decisions)
        .set({ signature, status: 'SIGNED', updatedAt: new Date() })
        .where(and(eq(decisions.id, decisionId), eq(decisions.tenantId, tenantId)));

      await db.insert(auditEvents).values({
        tenantId,
        decisionId,
        eventType: 'DECISION_SIGNED',
        payload: { decisionId },
      });
      broadcastEvent(tenantId, 'DECISION_SIGNED', { decisionId });
    } catch (err) {
      log.error({ err, decisionId }, 'KMS signing failed');
      await db
        .update(decisions)
        .set({ status: 'FAILED', errorMessage: 'KMS signing failed', updatedAt: new Date() })
        .where(and(eq(decisions.id, decisionId), eq(decisions.tenantId, tenantId)));

      await db.insert(auditEvents).values({
        tenantId,
        decisionId,
        eventType: 'DECISION_FAILED',
        payload: { decisionId, reason: 'KMS signing failed' },
      });
      broadcastEvent(tenantId, 'DECISION_FAILED', { decisionId, reason: 'KMS signing failed' });

      res.status(500).json({
        success: false,
        error: { code: 'SIGNING_FAILED', message: 'Failed to sign decision' },
      });
      return;
    }

    // 3. Anchor to HCS (risk assessment + HCS submission)
    const startTime = Date.now();
    const workflowRunId = ulid();

    await db.insert(workflowRuns).values({
      id: workflowRunId,
      tenantId,
      decisionId,
      workflowName: 'hcs-anchor',
      status: 'RUNNING',
      input: payload,
    });

    try {
      const anchorResult = await anchorDecision({
        decisionId,
        inputHash,
        signature,
        modelId,
        decisionType,
        outcome,
        confidence,
        topFeatures: topFeatures as unknown[],
      });

      // Update decision to ANCHORED
      await db
        .update(decisions)
        .set({
          riskLevel: anchorResult.riskAssessment.riskLevel,
          riskSummary: anchorResult.riskAssessment.summary,
          txHash: anchorResult.hcsResult.consensusTimestamp || anchorResult.hcsResult.transactionId,
          sequenceNumber: anchorResult.hcsResult.sequenceNumber,
          hcsTopicId: anchorResult.hcsResult.topicId,
          status: 'ANCHORED',
          updatedAt: new Date(),
        })
        .where(and(eq(decisions.id, decisionId), eq(decisions.tenantId, tenantId)));

      await db.insert(auditEvents).values({
        tenantId,
        decisionId,
        eventType: 'DECISION_ANCHORED',
        payload: {
          decisionId,
          topicId: anchorResult.hcsResult.topicId,
          sequenceNumber: anchorResult.hcsResult.sequenceNumber,
          transactionId: anchorResult.hcsResult.transactionId,
        },
      });
      broadcastEvent(tenantId, 'DECISION_ANCHORED', {
        decisionId,
        topicId: anchorResult.hcsResult.topicId,
        sequenceNumber: anchorResult.hcsResult.sequenceNumber,
      });

      // Update workflow run to SUCCESS
      await db
        .update(workflowRuns)
        .set({
          status: 'SUCCESS',
          output: {
            riskAssessment: anchorResult.riskAssessment,
            hcsResult: anchorResult.hcsResult,
          },
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
        })
        .where(eq(workflowRuns.id, workflowRunId));
    } catch (err) {
      log.error({ err, decisionId }, 'HCS anchoring failed');

      await db
        .update(decisions)
        .set({ status: 'FAILED', errorMessage: 'HCS anchoring failed', updatedAt: new Date() })
        .where(and(eq(decisions.id, decisionId), eq(decisions.tenantId, tenantId)));

      await db.insert(auditEvents).values({
        tenantId,
        decisionId,
        eventType: 'DECISION_FAILED',
        payload: { decisionId, reason: 'HCS anchoring failed' },
      });
      broadcastEvent(tenantId, 'DECISION_FAILED', { decisionId, reason: 'HCS anchoring failed' });

      await db
        .update(workflowRuns)
        .set({
          status: 'FAILED',
          errorMessage: 'HCS anchoring failed',
          completedAt: new Date(),
          durationMs: Date.now() - startTime,
        })
        .where(eq(workflowRuns.id, workflowRunId));

      res.status(500).json({
        success: false,
        error: { code: 'ANCHOR_FAILED', message: 'Failed to anchor decision to HCS' },
      });
      return;
    }

    log.info({ decisionId, tenantId, status: 'ANCHORED' }, 'Decision submitted, signed, and anchored');

    const [decision] = await db
      .select()
      .from(decisions)
      .where(and(eq(decisions.id, decisionId), eq(decisions.tenantId, tenantId)))
      .limit(1);

    res.status(201).json({ success: true, data: decision });
  } catch (err) {
    log.error({ err, decisionId }, 'Failed to submit decision');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create decision' },
    });
  }
});

// ─── GET /decisions ───────────────────────────────────────────────────────────

router.get('/', tenantGuard, async (req, res) => {
  const tenantId = req.tenantId;

  try {
    const rows = await db
      .select()
      .from(decisions)
      .where(eq(decisions.tenantId, tenantId))
      .orderBy(desc(decisions.createdAt))
      .limit(100);

    res.json({ success: true, data: rows });
  } catch (err) {
    log.error({ err, tenantId }, 'Failed to list decisions');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch decisions' },
    });
  }
});

// ─── GET /decisions/:id ───────────────────────────────────────────────────────

router.get('/:id', tenantGuard, async (req, res) => {
  const { id } = req.params;
  const tenantId = req.tenantId;

  try {
    const [decision] = await db
      .select()
      .from(decisions)
      .where(and(eq(decisions.id, id), eq(decisions.tenantId, tenantId)))
      .limit(1);

    if (!decision) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Decision not found' },
      });
      return;
    }

    res.json({ success: true, data: decision });
  } catch (err) {
    log.error({ err, id, tenantId }, 'Failed to get decision');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch decision' },
    });
  }
});

// ─── GET /decisions/:id/verify ────────────────────────────────────────────────

router.get('/:id/verify', tenantGuard, async (req, res) => {
  const { id } = req.params;
  const tenantId = req.tenantId;

  try {
    const [decision] = await db
      .select()
      .from(decisions)
      .where(and(eq(decisions.id, id), eq(decisions.tenantId, tenantId)))
      .limit(1);

    if (!decision) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Decision not found' },
      });
      return;
    }

    const result = await verifyDecision(decision);

    // Update status to VERIFIED if all layers pass
    if (result.overall === 'PASS' && decision.status === 'ANCHORED') {
      await db
        .update(decisions)
        .set({ status: 'VERIFIED', updatedAt: new Date() })
        .where(and(eq(decisions.id, id), eq(decisions.tenantId, tenantId)));

      await db.insert(auditEvents).values({
        tenantId,
        decisionId: id,
        eventType: 'DECISION_VERIFIED',
        payload: { decisionId: id, overall: result.overall },
      });
      broadcastEvent(tenantId, 'DECISION_VERIFIED', { decisionId: id, overall: result.overall });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    log.error({ err, id, tenantId }, 'Verification failed');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Verification failed' },
    });
  }
});

// ─── GET /decisions/:id/proof ─────────────────────────────────────────────────

router.get('/:id/proof', tenantGuard, async (req, res) => {
  const { id } = req.params;
  const tenantId = req.tenantId;

  try {
    const [decision] = await db
      .select()
      .from(decisions)
      .where(and(eq(decisions.id, id), eq(decisions.tenantId, tenantId)))
      .limit(1);

    if (!decision) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Decision not found' },
      });
      return;
    }

    const network = process.env.HEDERA_NETWORK === 'mainnet' ? 'Hedera Mainnet' : 'Hedera Testnet';

    const proof: Record<string, unknown> = {
      decisionId: decision.id,
      tenantId: decision.tenantId,
      inputHash: decision.inputHash,
      signature: decision.signature,
      riskLevel: decision.riskLevel,
      txHash: decision.txHash,
      hcsTopicId: decision.hcsTopicId,
      sequenceNumber: decision.sequenceNumber,
      network,
      status: decision.status,
      createdAt: decision.createdAt,
      proofGeneratedAt: new Date().toISOString(),
    };

    res
      .setHeader('Content-Disposition', `attachment; filename="proof-${id}.json"`)
      .setHeader('Content-Type', 'application/json')
      .json({ success: true, data: proof });
  } catch (err) {
    log.error({ err, id, tenantId }, 'Failed to generate proof');
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate proof' },
    });
  }
});

export default router;
