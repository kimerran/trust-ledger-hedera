import { NextRequest, NextResponse } from 'next/server';

/**
 * Legacy CRE anchor endpoint — no longer used.
 *
 * HCS anchoring now happens automatically within the API's POST /decisions route.
 * This endpoint returns a deprecation notice.
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'CRE anchoring has been replaced by Hedera Consensus Service (HCS). Decisions are now anchored automatically when submitted via POST /decisions.',
      },
    },
    { status: 410 },
  );
}
