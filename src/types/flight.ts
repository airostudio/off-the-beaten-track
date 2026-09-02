import type { CabinClass } from './user';

export interface FlightSearchRequest {
  origin: string;
  destination: string;
  departureDate: string; // ISO date
  returnDate?: string;
  cabin: CabinClass;
  passengers: number;
  flexibleDays?: number;
}

export interface BaggageAllowance {
  carryOn: string;
  checked: string | null;
}

/**
 * The canonical shape every FlightProvider adapter must normalise its
 * raw API response into. Nothing downstream (ranking, UI, DB) should
 * ever see a provider-specific shape.
 */
export interface NormalisedFlightOffer {
  id: string;
  provider: string;
  airline: string;
  flightNumber: string | null;
  origin: string;
  destination: string;
  departureAt: string; // ISO datetime
  arrivalAt: string;
  durationMinutes: number;
  stops: number;
  stopoverAirports: string[];
  aircraft: string | null;
  cabin: CabinClass;
  cabinPerSegment?: CabinClass[]; // for mixed-cabin itineraries
  fareClass: string | null;
  baggage: BaggageAllowance;
  cancellationPolicy: string;
  changesPolicy: string;

  /** Genuine public/retail fare as returned by the provider, in minor units. */
  publicPrice: number;
  /**
   * Genuine negotiated/member fare, in minor units. MUST be null unless a
   * real member-only rate, commission-share reward, or lower service fee
   * exists for this offer. Never synthesised.
   */
  memberPrice: number | null;
  taxes: number;
  fees: number;
  currency: string;

  bookingUrl: string;
  offerExpiresAt: string | null;
  lastVerifiedAt: string;
  affiliateCommission: number | null;

  /** Whether a genuine member rate is available for this specific offer. */
  memberEligible: boolean;

  /**
   * Set when this offer flies from/to a nearby alternate airport rather than
   * the one the traveller searched — must always be surfaced in the UI so
   * the airport swap is never hidden (section 12).
   */
  alternateAirportNote?: string;
}

export interface FlightValueScoreBreakdown {
  price: number;
  duration: number;
  stops: number;
  flexibility: number;
  memberDiscount: number;
  historicalPercentile: number;
}

export interface ScoredFlightOffer extends NormalisedFlightOffer {
  valueScore: number; // 0-100
  scoreBreakdown: FlightValueScoreBreakdown;
  badges: FlightBadge[];
}

export type FlightBadge =
  | 'BEST_VALUE'
  | 'CHEAPEST'
  | 'FASTEST'
  | 'BEST_MEMBER_DEAL'
  | 'BEST_PREMIUM_ECONOMY';

/**
 * What the client actually receives. For non-members this hides the raw
 * memberPrice behind a locked summary rather than sending it to the
 * client and hiding it with CSS.
 */
export interface ClientFlightOffer extends Omit<ScoredFlightOffer, 'memberPrice'> {
  memberPrice: number | null; // present only when viewer.canSeeMemberPrice
  lockedMemberFare?: {
    saving: number;
    savingPercentage: number;
  };
  priceFreshness: {
    lastVerifiedAt: string;
    isLive: boolean;
    label: string; // e.g. "Verified 2 minutes ago"
  };
  /** Stable flight_offers row id, when one exists — lets a "Book" click be recorded (section 31). */
  dbOfferId?: string;
}

export interface FareDetails {
  offerId: string;
  fareRules: string;
  refundable: boolean;
  changeFee: number | null;
  baggage: BaggageAllowance;
}

export interface FlightOrder {
  id: string;
  offerId: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}
