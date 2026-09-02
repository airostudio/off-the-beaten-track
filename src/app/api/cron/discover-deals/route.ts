import { NextRequest, NextResponse } from 'next/server';
import { verifyCronRequest } from '@/lib/cronAuth';
import { getActiveProviders } from '@/lib/flights/registry';
import { dedupeOffers } from '@/lib/flights/dedupe';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { computeDealScore, DEAL_DISCOUNT_THRESHOLD, MIN_OBSERVATIONS_FOR_DEAL } from '@/lib/deals/dealScore';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Deal-discovery background worker (section 15). Scans popular routes even
 * when nobody is searching, compares the current cheapest fare to a genuine
 * historical average from fare_observations, and records a deal only when
 * there's real, auditable evidence of a below-average price.
 *
 * Trigger via Vercel Cron (see vercel.json) or manually:
 *   curl -X POST /api/cron/discover-deals -H "Authorization: Bearer $CRON_SECRET"
 */
export async function POST(request: NextRequest) {
  const authError = verifyCronRequest(request);
  if (authError) return authError;

  const service = createSupabaseServiceClient();
  const { data: routes } = await service.from('routes').select('origin, destination').order('popularity', { ascending: false }).limit(15);

  if (!routes || routes.length === 0) {
    return NextResponse.json({ scanned: 0, dealsCreated: 0, message: 'No routes seeded in `routes` table.' });
  }

  const providers = getActiveProviders();
  const departureDate = defaultScanDate();

  let dealsCreated = 0;
  const results: Array<{ route: string; currentPrice: number | null; historicalAverage: number | null; deal: boolean }> = [];

  for (const route of routes) {
    const searchRequest = {
      origin: route.origin,
      destination: route.destination,
      departureDate,
      cabin: 'ECONOMY' as const,
      passengers: 1,
    };

    const settled = await Promise.allSettled(providers.map((p) => p.searchFlights(searchRequest)));
    const rawOffers = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
    if (rawOffers.length === 0) {
      results.push({ route: `${route.origin}-${route.destination}`, currentPrice: null, historicalAverage: null, deal: false });
      continue;
    }

    const deduped = dedupeOffers(rawOffers);
    const cheapest = deduped.reduce((min, o) => (o.publicPrice < min.publicPrice ? o : min), deduped[0]);
    const routeKey = `${route.origin}-${route.destination}`;

    // Record this scan as an observation too, so history builds even on quiet routes.
    await service.from('fare_observations').insert({
      route_key: routeKey,
      origin: route.origin,
      destination: route.destination,
      outbound_date: departureDate,
      airline: cheapest.airline,
      cabin: 'ECONOMY',
      provider_id: cheapest.provider,
      price: cheapest.publicPrice,
      currency: cheapest.currency,
    });

    const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const { data: history } = await service
      .from('fare_observations')
      .select('price')
      .eq('route_key', routeKey)
      .gte('captured_at', since);

    const priorObservations = (history ?? []).length;
    const historicalAverage =
      priorObservations > 0 ? Math.round(history!.reduce((sum, h) => sum + h.price, 0) / priorObservations) : null;

    const isDeal =
      historicalAverage !== null &&
      priorObservations >= MIN_OBSERVATIONS_FOR_DEAL &&
      cheapest.publicPrice <= historicalAverage * (1 - DEAL_DISCOUNT_THRESHOLD);

    results.push({ route: routeKey, currentPrice: cheapest.publicPrice, historicalAverage, deal: isDeal });

    if (isDeal && historicalAverage) {
      const discountPercentage = Math.round(((historicalAverage - cheapest.publicPrice) / historicalAverage) * 100);
      const { data: deal } = await service
        .from('deals')
        .insert({
          route: `${route.origin} → ${route.destination}`,
          origin: route.origin,
          destination: route.destination,
          outbound_date: departureDate,
          airline: cheapest.airline,
          cabin: 'ECONOMY',
          public_price: cheapest.publicPrice,
          member_price: cheapest.memberEligible ? cheapest.memberPrice : null,
          historical_average: historicalAverage,
          discount_percentage: discountPercentage,
          deal_score: computeDealScore(discountPercentage, priorObservations),
          discovered_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        })
        .select('id')
        .single();

      if (deal) {
        dealsCreated++;
        await notifyMatchingAlerts(service, deal.id, route.origin, route.destination, cheapest.publicPrice);
      }
    }
  }

  return NextResponse.json({ scanned: routes.length, dealsCreated, results });
}

function defaultScanDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 45);
  return d.toISOString().slice(0, 10);
}

/** Notifies users with a matching active alert, respecting deal_release_rules per tier. */
async function notifyMatchingAlerts(
  service: ReturnType<typeof createSupabaseServiceClient>,
  dealId: string,
  origin: string,
  destination: string,
  price: number
) {
  const { data: alerts } = await service
    .from('alerts')
    .select('id, user_id, max_price')
    .eq('origin', origin)
    .eq('destination', destination)
    .eq('active', true);

  if (!alerts || alerts.length === 0) return;

  const matching = alerts.filter((a) => a.max_price === null || price <= a.max_price);
  if (matching.length === 0) return;

  const { data: rules } = await service.from('deal_release_rules').select('tier, release_delay_minutes');
  const delayByTier = new Map((rules ?? []).map((r) => [r.tier, r.release_delay_minutes]));

  const userIds = matching.map((a) => a.user_id);
  const { data: profiles } = await service.from('profiles').select('id, tier').in('id', userIds);
  const tierByUser = new Map((profiles ?? []).map((p) => [p.id, p.tier]));

  const priceLabel = `$${(price / 100).toFixed(0)}`;
  const notifications = matching.map((alert) => {
    const tier = tierByUser.get(alert.user_id) ?? 'FREE';
    const delayMinutes = delayByTier.get(tier) ?? 0;
    return {
      user_id: alert.user_id,
      alert_id: alert.id,
      deal_id: dealId,
      channel: 'in_app',
      title: `${origin} → ${destination} dropped to ${priceLabel}`,
      body: `We found a fare below your alert threshold.`,
      visible_at: new Date(Date.now() + delayMinutes * 60000).toISOString(),
    };
  });

  await service.from('notifications').insert(notifications);
}
