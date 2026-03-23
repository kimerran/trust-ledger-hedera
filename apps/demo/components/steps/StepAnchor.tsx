'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import { UnderTheHood } from '@/components/UnderTheHood';

interface StepAnchorProps {
  decisionId: string;
  inputHash: string;
  signature: string;
  decisionPayload: string;
  onNext: () => void;
}

export function StepAnchor({ decisionId, inputHash, signature, decisionPayload, onNext }: StepAnchorProps) {
  // Build a sample HCS message to show what was submitted
  const hcsMessage = {
    v: 1,
    type: 'DECISION_ANCHOR',
    decisionId,
    hash: inputHash,
    signature: signature?.slice(0, 32) + '...',
    modelId: '00000000-0000-0000-0000-000000000001',
    riskLevel: 'MEDIUM',
    riskSummary: 'Risk assessment performed by Claude Haiku',
    timestamp: new Date().toISOString(),
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: HCS Anchor</CardTitle>
        <CardDescription>
          The API automatically anchors every decision to the Hedera Consensus Service (HCS).
          When you submitted the decision in Step 1, the API signed it with AWS KMS, ran an LLM
          risk assessment via Claude, and submitted the proof to an HCS topic — all in one request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-md bg-muted/50 text-sm space-y-3">
          <p className="font-medium">Anchor Pipeline (executed automatically):</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Canonicalize payload (RFC 8785) and compute SHA-256 hash</li>
            <li>Sign with AWS KMS (<code className="text-xs">ECDSA_SHA_256</code>)</li>
            <li>Risk assessment via Claude Haiku</li>
            <li>Submit proof message to Hedera Consensus Service (HCS)</li>
            <li>Update database with HCS topic ID, sequence number, and transaction ID</li>
          </ol>
        </div>

        <UnderTheHood defaultOpen>
          <CodeBlock title="HCS Message (submitted to Hedera topic)" language="json">
            {JSON.stringify(hcsMessage, null, 2)}
          </CodeBlock>
        </UnderTheHood>

        <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm text-blue-800 dark:text-blue-200">
          The HCS message is immutable and ordered by Hedera consensus. It can be independently
          verified by querying the Hedera Mirror Node REST API.
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onNext}>Next: Verify</Button>
        </div>
      </CardContent>
    </Card>
  );
}
