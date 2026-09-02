import { NextRequest, NextResponse } from 'next/server';

/**
 * Verifies the Vercel Cron / manual-trigger secret. Every /api/cron/* route
 * must call this first so the (expensive) provider queries can't be hit by
 * anyone who finds the URL.
 */
export function verifyCronRequest(request: NextRequest): NextResponse | null {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 500 });
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return null;
}
