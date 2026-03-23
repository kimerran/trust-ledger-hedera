'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VerificationLayerCard } from '@/components/VerificationLayerCard';
import { UnderTheHood } from '@/components/UnderTheHood';
import { CodeBlock } from '@/components/CodeBlock';
import type { VerificationResult } from '@trustledger/shared';

interface StepVerifyProps {
  decisionId: string;
  verification: VerificationResult | null;
  onVerify: () => void;
  onNext: () => void;
  isLoading: boolean;
}

const overallVariant: Record<string, 'success' | 'warning' | 'destructive'> = {
  PASS: 'success',
  PARTIAL: 'warning',
  FAIL: 'destructive',
};

export function StepVerify({ decisionId, verification, onVerify, onNext, isLoading }: StepVerifyProps) {
  return (
    <Card className="border border-[#E0F2F1] rounded-xl shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
      <CardHeader>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9EA0] mb-1">Step 3 of 5</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0D5752] text-white flex items-center justify-center text-xs font-bold shrink-0">
            3
          </div>
          <CardTitle className="text-[#0D5752]">Three-Layer Verification</CardTitle>
        </div>
        <CardDescription className="text-[#5F9EA0]">
          Independently verify the decision&apos;s integrity through three layers: hash recompute,
          KMS signature verification, and HCS anchor lookup via the Hedera Mirror Node.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!verification ? (
          <>
            <div className="p-4 rounded-md bg-[#E0F2F1] border border-[#B2DFDB] text-sm space-y-2">
              <p className="font-medium text-[#0D5752]">Three verification layers:</p>
              <ol className="list-decimal list-inside space-y-1 text-[#5F9EA0]">
                <li><strong>Hash Match</strong> — Recompute canonical hash from input features and compare</li>
                <li><strong>Signature Valid</strong> — Verify KMS ECDSA signature against stored hash</li>
                <li><strong>HCS Anchor</strong> — Query Hedera Mirror Node for the anchored message</li>
              </ol>
            </div>
            <Button
              onClick={onVerify}
              disabled={isLoading}
              className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
            >
              {isLoading ? 'Verifying...' : `GET /decisions/${decisionId}/verify`}
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-muted-foreground">Overall:</span>
              <Badge variant={overallVariant[verification.overall] ?? 'destructive'}>
                {verification.overall}
              </Badge>
            </div>

            {verification.overall === 'PARTIAL' && (
              <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-sm text-yellow-800 dark:text-yellow-200">
                Layer 3 (HCS anchor) shows FAIL because the mock HCS message doesn&apos;t exist on
                the Hedera Mirror Node. With real Hedera credentials configured, all three layers pass.
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <VerificationLayerCard
                title="Layer 1: Hash Match"
                pass={verification.layers.hashMatch.pass}
                details={{
                  computed: verification.layers.hashMatch.computed,
                }}
              />
              <VerificationLayerCard
                title="Layer 2: Signature Valid"
                pass={verification.layers.signatureValid.pass}
                details={{
                  algorithm: verification.layers.signatureValid.algorithm,
                }}
              />
              <VerificationLayerCard
                title="Layer 3: HCS Anchor"
                pass={verification.layers.onchainAnchor.pass}
                details={{
                  topicId: verification.layers.onchainAnchor.topicId,
                  sequenceNumber: verification.layers.onchainAnchor.sequenceNumber,
                  chain: verification.layers.onchainAnchor.chain,
                }}
              />
            </div>

            <UnderTheHood>
              <CodeBlock title={`GET /decisions/${decisionId}/verify — Response`}>
                {JSON.stringify({ success: true, data: verification }, null, 2)}
              </CodeBlock>
            </UnderTheHood>

            <div className="flex justify-end pt-2">
              <Button
                onClick={onNext}
                className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
              >
                Next: Proof &amp; Summary
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
