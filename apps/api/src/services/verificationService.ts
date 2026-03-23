import pino from 'pino';
import { hashDecision } from '@trustledger/shared';
import { verifyWithKMS, getKMSKeyArn } from './kmsService';
import { verifyHCSMessage } from './hcsService';
import type {
  VerificationResult,
  VerificationOverall,
  HashMatchLayer,
  SignatureLayer,
  OnchainAnchorLayer,
} from '@trustledger/shared';

const log = pino({ name: 'verification-service' });

interface DecisionRecord {
  id: string;
  inputHash: string;
  signature: string | null;
  txHash: string | null;
  sequenceNumber: number | null;
  hcsTopicId: string | null;
  topFeatures: unknown;
  decisionType: string;
  outcome: string;
  confidence: string;
  modelId: string;
}

// ─── Layer 1: Hash verification ───────────────────────────────────────────────

async function verifyHashLayer(decision: DecisionRecord): Promise<HashMatchLayer> {
  const payload: Record<string, unknown> = {
    confidence: parseFloat(decision.confidence),
    decisionType: decision.decisionType,
    modelId: decision.modelId,
    outcome: decision.outcome,
    topFeatures: decision.topFeatures,
  };

  const computed = hashDecision(payload);
  const stored = decision.inputHash;
  const pass = computed === stored;

  if (!pass) {
    log.warn(
      { decisionId: decision.id, computed, stored },
      'Hash verification failed — payload mismatch',
    );
  }

  return { pass, computed, stored };
}

// ─── Layer 2: Signature verification ─────────────────────────────────────────

async function verifySignatureLayer(decision: DecisionRecord): Promise<SignatureLayer> {
  const kmsKeyArn = getKMSKeyArn();

  if (!decision.signature) {
    return { pass: false, algorithm: 'ECDSA_SHA_256', kmsKeyArn };
  }

  try {
    const pass = await verifyWithKMS(decision.inputHash, decision.signature);
    return { pass, algorithm: 'ECDSA_SHA_256', kmsKeyArn };
  } catch (err) {
    log.error({ err, decisionId: decision.id }, 'KMS verify call failed');
    return { pass: false, algorithm: 'ECDSA_SHA_256', kmsKeyArn };
  }
}

// ─── Layer 3: HCS anchor verification ────────────────────────────────────────

async function verifyOnchainLayer(decision: DecisionRecord): Promise<OnchainAnchorLayer> {
  const chain = process.env.HEDERA_NETWORK === 'mainnet' ? 'hedera-mainnet' : 'hedera-testnet';

  if (!decision.hcsTopicId || decision.sequenceNumber == null) {
    return {
      pass: false,
      txHash: decision.txHash,
      sequenceNumber: null,
      topicId: decision.hcsTopicId,
      chain,
    };
  }

  try {
    const result = await verifyHCSMessage(decision.hcsTopicId, decision.sequenceNumber);

    if (result.pass && result.message) {
      // Optionally verify the message content matches our decision
      try {
        const parsed = JSON.parse(result.message) as { decisionId?: string; hash?: string };
        if (parsed.decisionId !== decision.id) {
          log.warn(
            { decisionId: decision.id, hcsDecisionId: parsed.decisionId },
            'HCS message decisionId mismatch',
          );
          return {
            pass: false,
            txHash: decision.txHash,
            sequenceNumber: decision.sequenceNumber,
            topicId: decision.hcsTopicId,
            chain,
          };
        }
      } catch {
        // If message isn't JSON, just check existence
      }
    }

    return {
      pass: result.pass,
      txHash: decision.txHash,
      sequenceNumber: decision.sequenceNumber,
      topicId: decision.hcsTopicId,
      chain,
    };
  } catch (err) {
    log.error(
      { err, decisionId: decision.id, topicId: decision.hcsTopicId },
      'HCS verification failed',
    );
    return {
      pass: false,
      txHash: decision.txHash,
      sequenceNumber: decision.sequenceNumber,
      topicId: decision.hcsTopicId,
      chain,
    };
  }
}

// ─── Overall result computation ───────────────────────────────────────────────

function computeOverall(
  hashMatch: HashMatchLayer,
  signatureValid: SignatureLayer,
  onchainAnchor: OnchainAnchorLayer,
): VerificationOverall {
  const results = [hashMatch.pass, signatureValid.pass, onchainAnchor.pass];
  const passing = results.filter(Boolean).length;

  if (passing === 3) return 'PASS';
  if (passing === 0) return 'FAIL';
  return 'PARTIAL';
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function verifyDecision(decision: DecisionRecord): Promise<VerificationResult> {
  log.info({ decisionId: decision.id }, 'Starting three-layer verification');

  // All three layers run independently — never skip any
  const [hashMatch, signatureValid, onchainAnchor] = await Promise.all([
    verifyHashLayer(decision),
    verifySignatureLayer(decision),
    verifyOnchainLayer(decision),
  ]);

  const overall = computeOverall(hashMatch, signatureValid, onchainAnchor);

  log.info(
    {
      decisionId: decision.id,
      overall,
      hashMatch: hashMatch.pass,
      signatureValid: signatureValid.pass,
      onchainAnchor: onchainAnchor.pass,
    },
    'Verification complete',
  );

  return {
    decisionId: decision.id,
    layers: { hashMatch, signatureValid, onchainAnchor },
    overall,
    verifiedAt: new Date().toISOString(),
  };
}
