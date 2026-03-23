'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CodeBlock } from '@/components/CodeBlock';
import { UnderTheHood } from '@/components/UnderTheHood';

interface StepProofProps {
  decisionId: string;
  proof: Record<string, unknown> | null;
  onFetchProof: () => void;
  onStartOver: () => void;
  isLoading: boolean;
}

export function StepProof({ decisionId, proof, onFetchProof, onStartOver, isLoading }: StepProofProps) {
  const handleDownload = () => {
    if (!proof) return;
    const blob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trustledger-proof-${decisionId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="border border-[#E0F2F1] rounded-xl shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
      <CardHeader>
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#5F9EA0] mb-1">Step 5 of 5</p>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#0D5752] text-white flex items-center justify-center text-xs font-bold shrink-0">
            5
          </div>
          <CardTitle className="text-[#0D5752]">Proof &amp; Summary</CardTitle>
        </div>
        <CardDescription className="text-[#5F9EA0]">
          Fetch the complete audit proof artifact — a self-contained JSON document that any auditor
          can use to independently verify this decision.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!proof ? (
          <Button
            onClick={onFetchProof}
            disabled={isLoading}
            className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
          >
            {isLoading ? 'Fetching proof...' : `GET /decisions/${decisionId}/proof`}
          </Button>
        ) : (
          <>
            <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm space-y-2">
              <p className="font-semibold text-green-800 dark:text-green-200">
                Demo Complete
              </p>
              <p className="text-green-700 dark:text-green-300">
                The full audit trail has been created: decision submitted, hash computed, KMS signed,
                anchored on-chain (simulated), and independently verified. The proof artifact below
                can be provided to any auditor.
              </p>
            </div>

            <CodeBlock title="Audit Proof Artifact">
              {JSON.stringify(proof, null, 2)}
            </CodeBlock>

            <UnderTheHood>
              <CodeBlock title={`GET /decisions/${decisionId}/proof — Response`}>
                {JSON.stringify({ success: true, data: proof }, null, 2)}
              </CodeBlock>
            </UnderTheHood>

            <div className="flex items-center justify-between pt-2">
              <Button variant="outline" onClick={onStartOver}>
                Start Over
              </Button>
              <Button
                onClick={handleDownload}
                className="shadow-[0_2px_6px_rgba(13,87,82,0.3)]"
              >
                Download Proof JSON
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
