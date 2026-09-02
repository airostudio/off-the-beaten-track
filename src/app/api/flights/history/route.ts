import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

/**
 * Returns 30-day fare history for a route: current/low/high/average plus a
 * daily series for a sparkline. Backed entirely by real fare_observations
 * rows recorded from live searches (section 14) — never synthesised.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin')?.toUpperCase();
  const destination = searchParams.get('destination')?.toUpperCase();

  if (!origin || !destination) {
    return NextResponse.json({ error: 'origin and destination are required' }, { status: 400 });
  }

  const routeKey = `${origin}-${destination}`;
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from('fare_observations')
    .select('price, captured_at')
    .eq('route_key', routeKey)
    .gte('captured_at', since)
    .order('captured_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (!data || data.length === 0) {
    return NextResponse.json({ routeKey, hasData: false });
  }

  const prices = data.map((d) => d.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const current = prices[prices.length - 1];

  // Collapse to one point per day (min price that day) for a clean sparkline.
  const byDay = new Map<string, number>();
  for (const row of data) {
    const day = row.captured_at.slice(0, 10);
    byDay.set(day, Math.min(byDay.get(day) ?? Infinity, row.price));
  }
  const series = Array.from(byDay.entries()).map(([date, price]) => ({ date, price }));

  return NextResponse.json({ routeKey, hasData: true, current, low, high, average, series, observations: data.length });
}
