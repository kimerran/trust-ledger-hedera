import type { VerificationResult } from '@trustledger/shared';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface VerificationLayersProps {
  result: VerificationResult;
}

function LayerRow({
  label,
  pass,
  detail,
}: {
  label: string;
  pass: boolean;
  detail: string;
}) {
  return (
    <div className={`flex items-start gap-3 py-3 border-b border-[#E0F2F1] last:border-0 pl-3 border-l-4 ${pass ? 'border-l-emerald-500' : 'border-l-red-400'}`}>
      <span className={`mt-0.5 font-bold text-sm ${pass ? 'text-emerald-600' : 'text-red-500'}`}>
        {pass ? '\u2713' : '\u2717'}
      </span>
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <p className="text-xs text-muted-foreground font-mono mt-0.5 break-all">{detail}</p>
      </div>
    </div>
  );
}

export function VerificationLayers({ result }: VerificationLayersProps) {
  const { layers, overall, verifiedAt } = result;

  const overallVariant =
    overall === 'PASS' ? 'success' : overall === 'FAIL' ? 'destructive' : 'warning';

  return (
    <Card className="border border-[#E0F2F1] shadow-[0_4px_16px_rgba(13,87,82,0.10)] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Verification Result</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={overallVariant} className="text-sm px-3">
            {overall}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        <LayerRow
          label="Layer 1 — Hash Integrity"
          pass={layers.hashMatch.pass}
          detail={`Computed: ${layers.hashMatch.computed}`}
        />
        <LayerRow
          label="Layer 2 — KMS Signature"
          pass={layers.signatureValid.pass}
          detail={`Algorithm: ${layers.signatureValid.algorithm}`}
        />
        <LayerRow
          label="Layer 3 — HCS Anchor (Hedera)"
          pass={layers.onchainAnchor.pass}
          detail={
            layers.onchainAnchor.topicId
              ? `topic: ${layers.onchainAnchor.topicId}${layers.onchainAnchor.sequenceNumber != null ? ` | seq: ${layers.onchainAnchor.sequenceNumber}` : ''}`
              : 'Not yet anchored'
          }
        />
        <p className="text-xs text-muted-foreground pt-3">
          Verified at: {new Date(verifiedAt).toLocaleString()}
        </p>
      </CardContent>
    </Card>
  );
}
