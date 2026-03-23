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
    <Card className="border border-[#E0F2F1] rounded-xl shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
      <CardHeader>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9EA0] mb-1">Step 2 of 5</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0D5752] text-white flex items-center justify-center text-xs font-bold shrink-0">
            2
          </div>
          <CardTitle className="text-[#0D5752]">HCS Anchor</CardTitle>
        </div>
        <CardDescription className="text-[#5F9EA0]">
          The API automatically anchors every decision to the Hedera Consensus Service (HCS).
          When you submitted the decision in Step 1, the API signed it with AWS KMS, ran an LLM
          risk assessment via Claude, and submitted the proof to an HCS topic — all in one request.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-md bg-[#E0F2F1] border border-[#B2DFDB] text-sm space-y-3">
          <p className="font-medium text-[#0D5752]">Anchor Pipeline (executed automatically):</p>
          <ol className="list-decimal list-inside space-y-1 text-[#5F9EA0]">
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

        <div className="p-3 rounded-md bg-[#E0F2F1] border border-[#B2DFDB] text-sm text-[#0D5752]">
          The HCS message is immutable and ordered by Hedera consensus. It can be independently
          verified by querying the Hedera Mirror Node REST API.
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={onNext}
            className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
          >
            Next: Verify
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
