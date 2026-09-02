import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveViewer } from '@/lib/tiers';
import { checkSearchLimit } from '@/lib/rateLimit';
import { getActiveProviders } from '@/lib/flights/registry';
import { dedupeOffers } from '@/lib/flights/dedupe';
import { rankOffers } from '@/lib/flights/valueScore';
import { applyTierAccess } from '@/lib/flights/applyTierAccess';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getNearbyAirports } from '@/lib/flights/nearbyAirports';
import { logProviderCalls } from '@/lib/flights/logProviderCall';
import type { NormalisedFlightOffer, ClientFlightOffer } from '@/types/flight';

const searchSchema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  passengers: z.coerce.number().int().min(1).max(9).default(1),
  includeNearbyAirports: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = searchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid search request', issues: parsed.error.issues }, { status: 400 });
  }

  const viewer = await resolveViewer();
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;

  const withinLimit = await checkSearchLimit(viewer, ipAddress);
  if (!withinLimit) {
    return NextResponse.json(
      {
        error: 'Daily search limit reached',
        upgrade: viewer.tier !== 'MEMBER',
        message:
          viewer.tier === 'GUEST'
            ? 'Create a free account for more searches, or become a member for unlimited search.'
            : 'You have reached your free daily search limit. Members get unlimited search.',
      },
      { status: 429 }
    );
  }

  const req = parsed.data;
  const providers = getActiveProviders();
  const service = createSupabaseServiceClient();

  const startedAt = Date.now();
  const results = await Promise.allSettled(providers.map((p) => p.searchFlights(req)));
  const rawOffers: NormalisedFlightOffer[] = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  await logProviderCalls(service, req, providers.map((p) => p.id), results, startedAt);

  // Nearby/alternative airport search (section 12): also query alternate
  // origin/destination airports and merge them in, clearly labelled so the
  // airport swap is never hidden from the traveller.
  if (req.includeNearbyAirports) {
    const nearbyOrigins = getNearbyAirports(req.origin);
    const nearbyDestinations = getNearbyAirports(req.destination);
    const alternatePairs = [
      ...nearbyOrigins.map((a) => ({ origin: a.code, destination: req.destination, note: a.extraNote })),
      ...nearbyDestinations.map((a) => ({ origin: req.origin, destination: a.code, note: a.extraNote })),
    ];

    const alternateResults = await Promise.allSettled(
      alternatePairs.flatMap((pair) =>
        providers.map((p) =>
          p
            .searchFlights({ ...req, origin: pair.origin, destination: pair.destination })
            .then((offers) => offers.map((o) => ({ ...o, alternateAirportNote: pair.note })))
        )
      )
    );
    rawOffers.push(...alternateResults.flatMap((r) => (r.status === 'fulfilled' ? r.value : [])));
  }

  // Provider fallback (section 44): if every live provider failed, fall back
  // to the most recent cached offers for this route rather than a hard
  // error — but ALWAYS marked as cached, never presented as live pricing.
  if (rawOffers.length === 0) {
    const { data: cached } = await service
      .from('flight_offers')
      .select('*')
      .eq('origin', req.origin)
      .eq('destination', req.destination)
      .eq('cabin', req.cabin)
      .order('last_verified_at', { ascending: false })
      .limit(10);

    if (!cached || cached.length === 0) {
      return NextResponse.json(
        { error: 'No fares available right now. Please try again shortly.' },
        { status: 502 }
      );
    }

    const offers: ClientFlightOffer[] = cached.map((o) => mapCachedOfferToClient(o, viewer));
    return NextResponse.json({
      tier: viewer.tier,
      searchId: null,
      offers,
      cacheFallback: true,
      membershipPitch:
        viewer.tier !== 'MEMBER'
          ? 'Members see the freshest fares and genuine member pricing first. Save up to 35% on selected deals.'
          : null,
    });
  }

  const deduped = dedupeOffers(rawOffers);
  const ranked = rankOffers(deduped);
  const offers = applyTierAccess(ranked, viewer);

  const { data: searchRow } = await service
    .from('searches')
    .insert({
      user_id: viewer.userId,
      session_id: viewer.userId ? null : request.cookies.get('otbt_session')?.value ?? null,
      tier: viewer.tier,
      origin: req.origin,
      destination: req.destination,
      departure_date: req.departureDate,
      return_date: req.returnDate ?? null,
      cabin: req.cabin,
      passengers: req.passengers,
      ip_address: ipAddress,
    })
    .select('id')
    .single();

  // Record cheapest-per-airline observations for fare history graphs (section 14),
  // independent of any single search_id so history survives across searches.
  const routeKey = `${req.origin}-${req.destination}`;
  const cheapestByAirline = new Map<string, (typeof deduped)[number]>();
  for (const o of deduped) {
    const existing = cheapestByAirline.get(o.airline);
    if (!existing || o.publicPrice < existing.publicPrice) cheapestByAirline.set(o.airline, o);
  }
  await service.from('fare_observations').insert(
    Array.from(cheapestByAirline.values()).map((o) => ({
      route_key: routeKey,
      origin: req.origin,
      destination: req.destination,
      outbound_date: req.departureDate,
      inbound_date: req.returnDate ?? null,
      airline: o.airline,
      cabin: req.cabin,
      provider_id: o.provider,
      price: o.publicPrice,
      currency: o.currency,
    }))
  );

  if (searchRow) {
    await service.from('flight_offers').insert(
      deduped.map((o) => ({
        search_id: searchRow.id,
        provider_id: o.provider,
        airline: o.airline,
        flight_number: o.flightNumber,
        origin: o.origin,
        destination: o.destination,
        departure_at: o.departureAt,
        arrival_at: o.arrivalAt,
        duration_minutes: o.durationMinutes,
        stops: o.stops,
        cabin: o.cabin,
        fare_class: o.fareClass,
        public_price: o.publicPrice,
        member_price: o.memberPrice,
        currency: o.currency,
        baggage: o.baggage,
        cancellation_policy: o.cancellationPolicy,
        changes_policy: o.changesPolicy,
        booking_url: o.bookingUrl,
        affiliate_commission: o.affiliateCommission,
        offer_expires_at: o.offerExpiresAt,
        last_verified_at: o.lastVerifiedAt,
      }))
    );
  }

  return NextResponse.json({
    tier: viewer.tier,
    searchId: searchRow?.id ?? null,
    offers,
    membershipPitch:
      viewer.tier !== 'MEMBER'
        ? 'Members see the freshest fares and genuine member pricing first. Save up to 35% on selected deals.'
        : null,
  });
}

/** Converts a cached `flight_offers` DB row into a client offer, always marked as non-live. */
function mapCachedOfferToClient(row: Record<string, any>, viewer: Awaited<ReturnType<typeof resolveViewer>>): ClientFlightOffer {
  const minutes = Math.round((Date.now() - new Date(row.last_verified_at).getTime()) / 60000);
  const label =
    minutes < 60
      ? `Last checked ${minutes} minute${minutes === 1 ? '' : 's'} ago`
      : minutes < 1440
        ? `Last checked ${Math.round(minutes / 60)} hour${Math.round(minutes / 60) === 1 ? '' : 's'} ago`
        : 'Last checked more than a day ago';

  const showMemberPrice = viewer.limits.canSeeMemberPrice && row.member_price != null;

  return {
    id: `cached-${row.id}`,
    provider: row.provider_id,
    airline: row.airline,
    flightNumber: row.flight_number,
    origin: row.origin,
    destination: row.destination,
    departureAt: row.departure_at,
    arrivalAt: row.arrival_at,
    durationMinutes: row.duration_minutes,
    stops: row.stops,
    stopoverAirports: [],
    aircraft: null,
    cabin: row.cabin,
    fareClass: row.fare_class,
    baggage: row.baggage ?? { carryOn: '7kg', checked: null },
    cancellationPolicy: row.cancellation_policy ?? 'Contact provider',
    changesPolicy: row.changes_policy ?? 'Contact provider',
    publicPrice: row.public_price,
    memberPrice: showMemberPrice ? row.member_price : null,
    taxes: 0,
    fees: 0,
    currency: row.currency,
    bookingUrl: row.booking_url,
    offerExpiresAt: row.offer_expires_at,
    lastVerifiedAt: row.last_verified_at,
    affiliateCommission: row.affiliate_commission,
    memberEligible: row.member_price != null,
    valueScore: 50,
    scoreBreakdown: { price: 50, duration: 50, stops: 50, flexibility: 50, memberDiscount: 0, historicalPercentile: 50 },
    badges: [],
    lockedMemberFare:
      !showMemberPrice && row.member_price != null
        ? {
            saving: row.public_price - row.member_price,
            savingPercentage: Math.round(((row.public_price - row.member_price) / row.public_price) * 100),
          }
        : undefined,
    priceFreshness: { lastVerifiedAt: row.last_verified_at, isLive: false, label },
  };
}
