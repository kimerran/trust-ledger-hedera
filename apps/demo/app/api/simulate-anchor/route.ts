import { NextRequest, NextResponse } from 'next/server';

/**
 * Simulate anchor endpoint — no longer needed.
 *
 * In the current architecture, HCS anchoring happens automatically within
 * POST /decisions on the API server. This endpoint is kept as a no-op
 * for backwards compatibility with any existing client code.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();

  return NextResponse.json({
    success: true,
    message: 'HCS anchoring is now automatic — decisions are anchored when submitted via POST /decisions',
    decisionId: body.decisionId,
  });
}
