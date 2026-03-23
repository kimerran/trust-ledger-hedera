import {
  Client,
  TopicCreateTransaction,
  PrivateKey,
  AccountId,
} from '@hashgraph/sdk';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function main() {
  const accountId = process.env.HEDERA_ACCOUNT_ID;
  const privateKey = process.env.HEDERA_PRIVATE_KEY;

  if (!accountId || !privateKey) {
    console.error('Set HEDERA_ACCOUNT_ID and HEDERA_PRIVATE_KEY in .env first');
    console.error('Get free testnet credentials at https://portal.hedera.com');
    process.exit(1);
  }

  const network = process.env.HEDERA_NETWORK ?? 'testnet';
  const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
  // Support both hex ECDSA (0x...) and DER-encoded keys
  const key = privateKey.startsWith('0x')
    ? PrivateKey.fromStringECDSA(privateKey.slice(2))
    : PrivateKey.fromStringDer(privateKey);
  client.setOperator(AccountId.fromString(accountId), key);

  console.log(`Creating HCS topic on ${network}...`);
  console.log(`Operator: ${accountId}`);

  const tx = new TopicCreateTransaction().setTopicMemo('TrustLedger Audit Trail');
  const response = await tx.execute(client);
  const receipt = await response.getReceipt(client);
  const topicId = receipt.topicId!.toString();

  console.log(`\nTopic created: ${topicId}`);
  console.log(`\nAdd this to your .env:`);
  console.log(`HCS_TOPIC_ID=${topicId}`);
  console.log(`\nView on HashScan: https://hashscan.io/${network}/topic/${topicId}`);

  client.close();
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
