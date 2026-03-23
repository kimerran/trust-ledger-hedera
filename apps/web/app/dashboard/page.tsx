import type { Metadata } from 'next';
import { auth } from '../../lib/auth';
import { decisionsApi } from '../../lib/api';
import { StatsBar } from '../../components/StatsBar';
import { LiveFeed } from '../../components/LiveFeed';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'TrustLedger real-time decision monitoring dashboard',
};

export default async function DashboardPage() {
  const session = await auth();
  const token = (session as { accessToken?: string } | null)?.accessToken ?? '';

  let decisions: Awaited<ReturnType<typeof decisionsApi.list>> = [];
  try {
    if (token) {
      decisions = await decisionsApi.list(token);
    }
  } catch (err) {
    console.error('[dashboard] API fetch failed:', err);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0D5752]">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Real-time AI decision audit trail monitoring
        </p>
      </div>

      <StatsBar decisions={decisions} />

      <Card className="border border-[#E0F2F1] shadow-[0_4px_16px_rgba(13,87,82,0.10)]">
        <CardHeader>
          <CardTitle className="text-[#0D5752]">Live Event Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <LiveFeed />
        </CardContent>
      </Card>
    </div>
  );
}
