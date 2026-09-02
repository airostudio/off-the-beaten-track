import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveViewer } from '@/lib/tiers';
import { checkSearchLimit } from '@/lib/rateLimit';
import { getActiveProviders } from '@/lib/flights/registry';
import { dedupeOffers } from '@/lib/flights/dedupe';
import { rankOffers } from '@/lib/flights/valueScore';
import { applyTierAccess } from '@/lib/flights/applyTierAccess';
import { buildAlternativeRoutes, buildMixedCabinItineraries, type HubItinerary } from '@/lib/flights/hubItineraries';

const schema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  passengers: z.coerce.number().int().min(1).max(9).default(1),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  longHaulCabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('PREMIUM_ECONOMY'),
  longHaulThresholdHours: z.coerce.number().min(1).max(20).default(6),
});

/**
 * Step 2 of the AI trip planner (section 52): runs the categorised search —
 * Best Value, Cheapest, Fastest, Best Member Deal (all from the existing
 * FlightValueScore ranking), plus Smart Route and Most Comfortable from the
 * Alternative Route Engine / Smart Mixed Cabin built in Phase 3. Counts as a
 * single search against the viewer's daily quota even though it fans out
 * internally, same accounting as the flexible-date calendar.
 */
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid trip request', issues: parsed.error.issues }, { status: 400 });
  }

  const viewer = await resolveViewer();
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const withinLimit = await checkSearchLimit(viewer, ipAddress);
  if (!withinLimit) {
    return NextResponse.json({ error: 'Daily search limit reached', upgrade: viewer.tier !== 'MEMBER' }, { status: 429 });
  }

  const { origin, destination, departureDate, passengers, cabin, longHaulCabin, longHaulThresholdHours } = parsed.data;

  const [standardResults, smartRoutes, mixedCabinRoutes] = await Promise.all([
    (async () => {
      const providers = getActiveProviders();
      const settled = await Promise.allSettled(providers.map((p) => p.searchFlights({ origin, destination, departureDate, cabin, passengers })));
      const raw = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
      if (raw.length === 0) return [];
      return applyTierAccess(rankOffers(dedupeOffers(raw)), viewer);
    })(),
    buildAlternativeRoutes(origin, destination, departureDate, cabin, passengers),
    buildMixedCabinItineraries(origin, destination, departureDate, passengers, { longHaulCabin, shortHaulCabin: 'ECONOMY', longHaulThresholdHours }),
  ]);

  const bestValue = standardResults.find((o) => o.badges.includes('BEST_VALUE')) ?? standardResults[0] ?? null;
  const cheapest = standardResults.find((o) => o.badges.includes('CHEAPEST')) ?? null;
  const fastest = standardResults.find((o) => o.badges.includes('FASTEST')) ?? null;
  const bestMemberDeal = standardResults.find((o) => o.badges.includes('BEST_MEMBER_DEAL')) ?? null;

  return NextResponse.json({
    tier: viewer.tier,
    bestValue,
    cheapest,
    fastest,
    bestMemberDeal,
    smartRoute: shapeItinerary(smartRoutes[0], viewer),
    mostComfortable: shapeItinerary(mixedCabinRoutes[0], viewer),
    offerCount: standardResults.length,
  });
}

function shapeItinerary(it: HubItinerary | undefined, viewer: Awaited<ReturnType<typeof resolveViewer>>) {
  if (!it) return null;
  return {
    hub: it.hub,
    totalPublicPrice: it.totalPublicPrice,
    totalMemberPrice: viewer.limits.canSeeMemberPrice ? it.totalMemberPrice : null,
    lockedSaving:
      !viewer.limits.canSeeMemberPrice && it.totalMemberPrice != null
        ? {
            saving: it.totalPublicPrice - it.totalMemberPrice,
            savingPercentage: Math.round(((it.totalPublicPrice - it.totalMemberPrice) / it.totalPublicPrice) * 100),
          }
        : undefined,
    totalDurationMinutes: it.totalDurationMinutes,
    layoverMinutes: it.layoverMinutes,
    overnightLayover: it.overnightLayover,
    currency: it.currency,
    leg1: {
      airline: it.leg1.airline,
      origin: it.leg1.origin,
      destination: it.leg1.destination,
      departureAt: it.leg1.departureAt,
      arrivalAt: it.leg1.arrivalAt,
      cabin: it.leg1.cabin,
      bookingUrl: it.leg1.bookingUrl,
    },
    leg2: {
      airline: it.leg2.airline,
      origin: it.leg2.origin,
      destination: it.leg2.destination,
      departureAt: it.leg2.departureAt,
      arrivalAt: it.leg2.arrivalAt,
      cabin: it.leg2.cabin,
      bookingUrl: it.leg2.bookingUrl,
    },
  };
}
