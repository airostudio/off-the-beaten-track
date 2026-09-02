import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveViewer } from '@/lib/tiers';
import { checkSearchLimit } from '@/lib/rateLimit';
import { buildAlternativeRoutes, buildMixedCabinItineraries, type HubItinerary } from '@/lib/flights/hubItineraries';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  passengers: z.coerce.number().int().min(1).max(9).default(1),
  mode: z.enum(['alternative', 'mixed-cabin']),
});

/**
 * Alternative Route Engine + Smart Mixed Cabin (sections 11 & 12). Each
 * itinerary is two independently priced, real legs summed together, with
 * self-transfer risk (separate bookings, baggage re-check) always disclosed
 * — never hidden, and never a single fabricated through-fare.
 */
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request', issues: parsed.error.issues }, { status: 400 });
  }

  const viewer = await resolveViewer();
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const withinLimit = await checkSearchLimit(viewer, ipAddress);
  if (!withinLimit) {
    return NextResponse.json({ error: 'Daily search limit reached', upgrade: viewer.tier !== 'MEMBER' }, { status: 429 });
  }

  const { origin, destination, departureDate, cabin, passengers, mode } = parsed.data;

  let itineraries: HubItinerary[];
  if (mode === 'alternative') {
    itineraries = await buildAlternativeRoutes(origin, destination, departureDate, cabin, passengers);
  } else {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let prefs = { longHaulCabin: 'PREMIUM_ECONOMY' as const, shortHaulCabin: 'ECONOMY' as const, longHaulThresholdHours: 6 };
    if (user) {
      const { data: row } = await supabase
        .from('travel_preferences')
        .select('long_haul_cabin, long_haul_threshold_hours')
        .eq('user_id', user.id)
        .maybeSingle();
      if (row) {
        prefs = {
          longHaulCabin: row.long_haul_cabin ?? prefs.longHaulCabin,
          shortHaulCabin: 'ECONOMY',
          longHaulThresholdHours: row.long_haul_threshold_hours ?? prefs.longHaulThresholdHours,
        };
      }
    }
    itineraries = await buildMixedCabinItineraries(origin, destination, departureDate, passengers, prefs);
  }

  // Hide the raw memberPrice/legs from non-members the same way normal
  // search results are gated — locked-fare summary only.
  const shaped = itineraries.map((it) => ({
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
  }));

  return NextResponse.json({ mode, itineraries: shaped });
}
