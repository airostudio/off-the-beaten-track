import { NextRequest, NextResponse } from 'next/server';
import { verifyCronRequest } from '@/lib/cronAuth';
import { getActiveProviders } from '@/lib/flights/registry';
import { dedupeOffers } from '@/lib/flights/dedupe';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import type { CabinClass } from '@/types/user';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Refreshes latest_price for every active watched trip so the dashboard's
 * "price when watched vs current" comparison (section 36) reflects a real,
 * re-queried fare rather than a stale snapshot.
 *
 * Trigger via Vercel Cron (see vercel.json) or manually:
 *   curl -X POST /api/cron/refresh-watchlist -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  const authError = verifyCronRequest(request);
  if (authError) return authError;

  const service = createSupabaseServiceClient();
  const { data: trips } = await service
    .from('watched_trips')
    .select('id, origin, destination, departure_date, cabin')
    .eq('active', true);

  if (!trips || trips.length === 0) {
    return NextResponse.json({ refreshed: 0 });
  }

  const providers = getActiveProviders();
  let refreshed = 0;

  for (const trip of trips) {
    // Don't bother refreshing a trip whose departure date has passed.
    if (new Date(trip.departure_date) < new Date()) continue;

    const settled = await Promise.allSettled(
      providers.map((p) =>
        p.searchFlights({
          origin: trip.origin,
          destination: trip.destination,
          departureDate: trip.departure_date,
          cabin: trip.cabin as CabinClass,
          passengers: 1,
        })
      )
    );
    const rawOffers = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    if (rawOffers.length === 0) continue;

    const deduped = dedupeOffers(rawOffers);
    const cheapest = deduped.reduce((min, o) => {
      const price = o.memberEligible && o.memberPrice ? o.memberPrice : o.publicPrice;
      const minPrice = min.memberEligible && min.memberPrice ? min.memberPrice : min.publicPrice;
      return price < minPrice ? o : min;
    }, deduped[0]);
    const latestPrice = cheapest.memberEligible && cheapest.memberPrice ? cheapest.memberPrice : cheapest.publicPrice;

    await service
      .from('watched_trips')
      .update({ latest_price: latestPrice, latest_price_checked_at: new Date().toISOString() })
      .eq('id', trip.id);
    refreshed++;
  }

  return NextResponse.json({ refreshed, total: trips.length });
}
