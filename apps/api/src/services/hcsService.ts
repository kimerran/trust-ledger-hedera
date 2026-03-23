import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  PrivateKey,
  AccountId,
} from '@hashgraph/sdk';
import pino from 'pino';

const log = pino({ name: 'hcs-service' });

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HCSMessageResult {
  topicId: string;
  sequenceNumber: number;
  transactionId: string;
  consensusTimestamp: string;
}

// ─── Client singleton ────────────────────────────────────────────────────────

let hederaClient: Client | null = null;

function getClient(): Client | null {
  if (hederaClient) return hederaClient;

  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  if (!accountId || !privateKey) {
    if (process.env.NODE_ENV !== 'production') {
      log.warn('HEDERA_ACCOUNT_ID or HEDERA_PRIVATE_KEY not set — using mock HCS');
      return null;
    }
    throw new Error('HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY are required');
  }

  try {
    const network = process.env.HEDERA_NETWORK ?? 'testnet';
    const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
    // Support both hex ECDSA (0x...) and DER-encoded keys
    const key = privateKey.startsWith('0x')
      ? PrivateKey.fromStringECDSA(privateKey.slice(2))
      : PrivateKey.fromStringDer(privateKey);
    client.setOperator(AccountId.fromString(accountId), key);

    hederaClient = client;
    return client;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      log.warn({ err }, 'Invalid Hedera credentials — using mock HCS');
      return null;
    }
    throw err;
  }
}

// ─── Topic management ────────────────────────────────────────────────────────

/**
 * Creates a new HCS topic. Returns the topic ID string (e.g. "0.0.12345").
 */
export async function createTopic(memo?: string): Promise<string> {
  const client = getClient();
  if (!client) {
    const mockId = `0.0.${100000 + Math.floor(Math.random() * 900000)}`;
    log.info({ topicId: mockId }, 'Mock HCS topic created');
    return mockId;
  }

  const tx = new TopicCreateTransaction();
  if (memo) tx.setTopicMemo(memo);

  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  const topicId = receipt.topicId!.toString();

  log.info({ topicId }, 'HCS topic created');
  return topicId;
}

/**
 * Returns the configured HCS topic ID, creating one if needed.
 */
export function getTopicId(): string {
  const topicId = process.env.HCS_TOPIC_ID;
  if (!topicId) {
    if (process.env.NODE_ENV !== 'production') {
      return '0.0.000000'; // Mock topic for dev
    }
    throw new Error('HCS_TOPIC_ID is required');
  }
  return topicId;
}

// ─── Message submission ──────────────────────────────────────────────────────

/**
 * Submits a message to the configured HCS topic.
 * Returns the topic ID, sequence number, transaction ID, and consensus timestamp.
 */
export async function submitHCSMessage(message: string): Promise<HCSMessageResult> {
  const topicIdStr = getTopicId();
  const client = getClient();

  if (!client) {
    // Dev mock — simulate HCS response
    const mockResult: HCSMessageResult = {
      topicId: topicIdStr,
      sequenceNumber: Math.floor(Math.random() * 100000) + 1,
      transactionId: `0.0.000000@${Math.floor(Date.now() / 1000)}.${Math.floor(Math.random() * 1_000_000_000)}`,
      consensusTimestamp: new Date().toISOString(),
    };
    log.info({ ...mockResult }, 'Mock HCS message submitted');
    return mockResult;
  }

  const topicId = TopicId.fromString(topicIdStr);

  const tx = new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(message);

  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);

  const sequenceNumber = Number(receipt.topicSequenceNumber);
  const transactionId = response.transactionId.toString();

  // Poll mirror node for the consensus timestamp (typically available within 5-10s)
  let consensusTimestamp = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const mirror = await verifyHCSMessage(topicIdStr, sequenceNumber);
    if (mirror.consensusTimestamp) {
      consensusTimestamp = mirror.consensusTimestamp;
      break;
    }
  }

  const result: HCSMessageResult = {
    topicId: topicIdStr,
    sequenceNumber,
    transactionId,
    consensusTimestamp,
  };

  log.info(
    { topicId: topicIdStr, sequenceNumber, consensusTimestamp },
    'HCS message submitted',
  );

  return result;
}

// ─── Mirror Node verification ────────────────────────────────────────────────

interface MirrorNodeMessage {
  consensus_timestamp: string;
  topic_id: string;
  sequence_number: number;
  message: string; // base64 encoded
  running_hash: string;
}

/**
 * Verifies an HCS message exists by querying the Hedera Mirror Node REST API.
 */
export async function verifyHCSMessage(
  topicId: string,
  sequenceNumber: number,
): Promise<{ pass: boolean; consensusTimestamp: string | null; message: string | null }> {
  const network = process.env.HEDERA_NETWORK ?? 'testnet';
  const mirrorBaseUrl =
    network === 'mainnet'
      ? 'https://mainnet.mirrornode.hedera.com'
      : 'https://testnet.mirrornode.hedera.com';

  try {
    const url = `${mirrorBaseUrl}/api/v1/topics/${topicId}/messages/${sequenceNumber}`;
    const resp = await fetch(url, { signal: AbortSignal.timeout(10_000) });

    if (!resp.ok) {
      log.warn({ status: resp.status, topicId, sequenceNumber }, 'Mirror node query failed');
      return { pass: false, consensusTimestamp: null, message: null };
    }

    const data = (await resp.json()) as MirrorNodeMessage;

    // Decode base64 message
    const decodedMessage = Buffer.from(data.message, 'base64').toString('utf-8');

    return {
      pass: true,
      consensusTimestamp: data.consensus_timestamp,
      message: decodedMessage,
    };
  } catch (err) {
    log.error({ err, topicId, sequenceNumber }, 'Mirror node verification failed');
    return { pass: false, consensusTimestamp: null, message: null };
  }
}
