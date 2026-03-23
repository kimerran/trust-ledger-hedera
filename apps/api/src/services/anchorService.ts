import Anthropic from '@anthropic-ai/sdk';
import { submitHCSMessage, type HCSMessageResult } from './hcsService';
import { getKMSKeyArn } from './kmsService';
import pino from 'pino';

const log = pino({ name: 'anchor-service' });

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AnchorInput {
  decisionId: string;
  inputHash: string;
  signature: string;
  modelId: string;
  decisionType: string;
  outcome: string;
  confidence: number;
  topFeatures: unknown[];
}

export interface RiskAssessment {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  summary: string;
}

export interface AnchorResult {
  riskAssessment: RiskAssessment;
  hcsResult: HCSMessageResult;
}

// ─── Risk assessment via Claude ──────────────────────────────────────────────

async function assessRisk(input: AnchorInput): Promise<RiskAssessment> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    log.warn('ANTHROPIC_API_KEY not set — returning default risk assessment');
    return {
      riskLevel: 'MEDIUM',
      summary: 'Risk assessment unavailable — ANTHROPIC_API_KEY not configured.',
    };
  }

  try {
    const anthropic = new Anthropic({ apiKey });
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system:
        'You are a risk assessment AI for financial and regulated AI decisions. Always respond with valid JSON only — no markdown, no explanation. Schema: {"riskLevel": "LOW"|"MEDIUM"|"HIGH", "summary": "<1-2 sentences>"}',
      messages: [
        {
          role: 'user',
          content: [
            'Assess the risk of this AI decision:',
            `Type: ${input.decisionType}`,
            `Outcome: ${input.outcome}`,
            `Confidence: ${input.confidence}`,
            `Top features: ${JSON.stringify(input.topFeatures)}`,
            '',
            'Respond with JSON only.',
          ].join('\n'),
        },
      ],
    });

    const text =
      response.content[0]?.type === 'text' ? response.content[0].text : '{}';
    return JSON.parse(text) as RiskAssessment;
  } catch (err) {
    log.error({ err }, 'Risk assessment failed');
    return {
      riskLevel: 'MEDIUM',
      summary: 'Risk assessment failed — using default.',
    };
  }
}

// ─── Main anchor function ────────────────────────────────────────────────────

/**
 * Orchestrates the full anchoring pipeline:
 * 1. Risk assessment via Claude Haiku
 * 2. Submit to Hedera Consensus Service (HCS)
 *
 * The KMS signing is done before this function is called (in the decisions route).
 */
export async function anchorDecision(input: AnchorInput): Promise<AnchorResult> {
  log.info({ decisionId: input.decisionId }, 'Starting anchor pipeline');

  // 1. Risk assessment
  log.info({ decisionId: input.decisionId }, 'Assessing risk with Claude');
  const riskAssessment = await assessRisk(input);
  log.info(
    { decisionId: input.decisionId, riskLevel: riskAssessment.riskLevel },
    'Risk assessment complete',
  );

  // 2. Build HCS message
  const hcsMessage = {
    v: 1,
    type: 'DECISION_ANCHOR',
    decisionId: input.decisionId,
    hash: input.inputHash,
    signature: input.signature,
    kmsKeyArn: getKMSKeyArn(),
    modelId: input.modelId,
    decisionType: input.decisionType,
    outcome: input.outcome,
    riskLevel: riskAssessment.riskLevel,
    riskSummary: riskAssessment.summary,
    timestamp: new Date().toISOString(),
  };

  // 3. Submit to HCS
  log.info({ decisionId: input.decisionId }, 'Submitting to HCS');
  const hcsResult = await submitHCSMessage(JSON.stringify(hcsMessage));
  log.info(
    {
      decisionId: input.decisionId,
      topicId: hcsResult.topicId,
      sequenceNumber: hcsResult.sequenceNumber,
    },
    'HCS anchor complete',
  );

  return { riskAssessment, hcsResult };
}
