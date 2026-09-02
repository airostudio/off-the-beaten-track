import type { CabinClass } from '@/types/user';
import type { NormalisedFlightOffer } from '@/types/flight';
import { getActiveProviders } from './registry';
import { dedupeOffers } from './dedupe';

/**
 * Common Australia<->Asia/Pacific transit hubs used to construct alternative
 * routings and mixed-cabin itineraries (sections 11 & 12). Each itinerary
 * built from this list is two genuinely queried, separately priced legs
 * summed together — never a single fabricated through-fare.
 */
export const TRANSIT_HUBS = ['SIN', 'BKK', 'KUL', 'HKG'];

export interface HubItinerary {
  hub: string;
  leg1: NormalisedFlightOffer; // origin -> hub
  leg2: NormalisedFlightOffer; // hub -> destination
  totalPublicPrice: number;
  totalMemberPrice: number | null; // only when BOTH legs have a genuine member rate
  totalDurationMinutes: number; // flying time only, excludes ground time at the hub
  layoverMinutes: number;
  overnightLayover: boolean;
  currency: string;
}

function addDaysToIsoDate(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

async function queryOffers(
  origin: string,
  destination: string,
  departureDate: string,
  cabin: CabinClass,
  passengers: number
): Promise<NormalisedFlightOffer[]> {
  const providers = getActiveProviders();
  const settled = await Promise.allSettled(
    providers.map((p) => p.searchFlights({ origin, destination, departureDate, cabin, passengers }))
  );
  const raw = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  return dedupeOffers(raw);
}

async function cheapestOffer(
  origin: string,
  destination: string,
  departureDate: string,
  cabin: CabinClass,
  passengers: number
): Promise<NormalisedFlightOffer | null> {
  const offers = await queryOffers(origin, destination, departureDate, cabin, passengers);
  if (offers.length === 0) return null;
  return offers.reduce((min, o) => (o.publicPrice < min.publicPrice ? o : min), offers[0]);
}

/**
 * Finds the cheapest leg-2 offer that departs at least `minConnectionMinutes`
 * after `earliestDepartureIso`, checking the connecting day first and the
 * next day as a fallback (flagged as an overnight layover) — so a
 * constructed itinerary never silently implies an impossible connection.
 */
async function cheapestConnectingOffer(
  origin: string,
  destination: string,
  earliestDepartureIso: string,
  cabin: CabinClass,
  passengers: number,
  minConnectionMinutes = 60
): Promise<{ offer: NormalisedFlightOffer; overnightLayover: boolean } | null> {
  for (const dayOffset of [0, 1]) {
    const date = addDaysToIsoDate(earliestDepartureIso.slice(0, 10), dayOffset);
    const offers = await queryOffers(origin, destination, date, cabin, passengers);
    const earliestMs = new Date(earliestDepartureIso).getTime() + minConnectionMinutes * 60000;
    const eligible = offers.filter((o) => new Date(o.departureAt).getTime() >= earliestMs);
    if (eligible.length > 0) {
      const cheapest = eligible.reduce((min, o) => (o.publicPrice < min.publicPrice ? o : min), eligible[0]);
      return { offer: cheapest, overnightLayover: dayOffset > 0 };
    }
  }
  return null;
}

function combineLegs(
  hub: string,
  leg1: NormalisedFlightOffer,
  leg2: NormalisedFlightOffer,
  overnightLayover: boolean
): HubItinerary {
  const layoverMinutes = Math.round((new Date(leg2.departureAt).getTime() - new Date(leg1.arrivalAt).getTime()) / 60000);
  const totalMemberPrice =
    leg1.memberEligible && leg1.memberPrice != null && leg2.memberEligible && leg2.memberPrice != null
      ? leg1.memberPrice + leg2.memberPrice
      : null;

  return {
    hub,
    leg1,
    leg2,
    totalPublicPrice: leg1.publicPrice + leg2.publicPrice,
    totalMemberPrice,
    totalDurationMinutes: leg1.durationMinutes + leg2.durationMinutes,
    layoverMinutes,
    overnightLayover,
    currency: leg1.currency,
  };
}

/** Alternative Route Engine (section 12): same cabin both legs, via each transit hub. */
export async function buildAlternativeRoutes(
  origin: string,
  destination: string,
  departureDate: string,
  cabin: CabinClass,
  passengers: number
): Promise<HubItinerary[]> {
  const results = await Promise.all(
    TRANSIT_HUBS.filter((hub) => hub !== origin && hub !== destination).map(async (hub) => {
      const leg1 = await cheapestOffer(origin, hub, departureDate, cabin, passengers);
      if (!leg1) return null;
      const leg2Result = await cheapestConnectingOffer(hub, destination, leg1.arrivalAt, cabin, passengers, 60);
      if (!leg2Result) return null;
      return combineLegs(hub, leg1, leg2Result.offer, leg2Result.overnightLayover);
    })
  );
  return (results.filter(Boolean) as HubItinerary[]).sort((a, b) => a.totalPublicPrice - b.totalPublicPrice).slice(0, 3);
}

export interface MixedCabinPreferences {
  longHaulCabin: CabinClass;
  shortHaulCabin: CabinClass;
  longHaulThresholdHours: number;
}

/**
 * Smart Mixed Cabin (section 11): probes each leg in Economy to learn its
 * real duration, then re-prices only the leg(s) that clear the long-haul
 * threshold in the traveller's preferred cabin — "you only pay for Premium
 * Economy where it matters."
 */
export async function buildMixedCabinItineraries(
  origin: string,
  destination: string,
  departureDate: string,
  passengers: number,
  prefs: MixedCabinPreferences
): Promise<HubItinerary[]> {
  const thresholdMinutes = prefs.longHaulThresholdHours * 60;

  const results = await Promise.all(
    TRANSIT_HUBS.filter((hub) => hub !== origin && hub !== destination).map(async (hub) => {
      const probe1 = await cheapestOffer(origin, hub, departureDate, 'ECONOMY', passengers);
      if (!probe1) return null;
      const probe2Result = await cheapestConnectingOffer(hub, destination, probe1.arrivalAt, 'ECONOMY', passengers, 60);
      if (!probe2Result) return null;

      const leg1Cabin = probe1.durationMinutes >= thresholdMinutes ? prefs.longHaulCabin : prefs.shortHaulCabin;
      const leg2Cabin = probe2Result.offer.durationMinutes >= thresholdMinutes ? prefs.longHaulCabin : prefs.shortHaulCabin;

      const leg1 = leg1Cabin === 'ECONOMY' ? probe1 : await cheapestOffer(origin, hub, departureDate, leg1Cabin, passengers);
      if (!leg1) return null;

      const leg2Result =
        leg2Cabin === 'ECONOMY'
          ? probe2Result
          : await cheapestConnectingOffer(hub, destination, leg1.arrivalAt, leg2Cabin, passengers, 60);
      if (!leg2Result) return null;

      return combineLegs(hub, leg1, leg2Result.offer, leg2Result.overnightLayover);
    })
  );
  return (results.filter(Boolean) as HubItinerary[]).sort((a, b) => a.totalPublicPrice - b.totalPublicPrice).slice(0, 3);
}
