import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VerificationLayers } from '../../../components/VerificationLayers';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  return {
    title: `Verify Decision ${params.id.slice(0, 10)}…`,
    description: 'Public cryptographic proof for an AI decision anchored on Hedera Consensus Service',
  };
}

/**
 * Public proof page — no auth required.
 * Fetches verification result from a public endpoint.
 */
export default async function PublicVerifyPage({ params }: { params: { id: string } }) {
  const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

  // Public endpoint — no auth required
  const res = await fetch(`${apiBase}/decisions/public/${params.id}/verify`, {
    cache: 'no-store',
  });

  if (res.status === 404) notFound();

  let verification: import('@trustledger/shared').VerificationResult | null = null;
  try {
    const json = (await res.json()) as { success: boolean; data: typeof verification };
    if (json.success) verification = json.data;
  } catch {
    // show error state
  }

  if (!verification) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold text-destructive">Verification Failed</h1>
          <p className="text-muted-foreground mt-2">Unable to retrieve proof for this decision.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <Badge variant="outline" className="mb-4">
          Public Proof
        </Badge>
        <h1 className="text-2xl font-bold">AI Decision Proof</h1>
        <p className="text-muted-foreground mt-1 font-mono text-sm">{params.id}</p>
      </div>

      <Card className="bg-[#E0F2F1] border border-[#B2DFDB]">
        <CardHeader>
          <CardTitle className="text-base text-[#0D5752]">What is this?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[#0D5752]">
          This page provides cryptographic proof that an AI decision was recorded, signed with
          AWS KMS, and anchored immutably to the Hedera Consensus Service (HCS). The three
          verification layers below confirm the integrity of the audit record.
        </CardContent>
      </Card>

      <VerificationLayers result={verification} />

      <p className="text-center text-xs text-muted-foreground">
        Powered by TrustLedger &middot; Hedera Consensus Service &middot; AWS KMS
      </p>
    </div>
  );
}
