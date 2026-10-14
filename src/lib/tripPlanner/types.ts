import type { CabinClass } from '@/types/user';

/**
 * Structured trip request extracted from a free-text query (section 52's "AI
 * Travel Search" — "Find me the cheapest way for two people to travel from
 * Melbourne to the Philippines..."). Always shown back to the user before any
 * search runs, since extraction (rule-based or Claude) can misread intent
 * and every search call has a real cost.
 */
export interface TripIntent {
  originQuery: string | null; // free-text as understood, e.g. "Melbourne"
  destinationQuery: string | null; // e.g. "the Philippines"
  departureDate: string; // resolved ISO date — best-effort guess
  returnDate: string | null;
  passengers: number;
  cabin: CabinClass;
  longHaulCabin: CabinClass;
  longHaulThresholdHours: number;
  maxStops: number | null; // null = no stated preference
  notes: string[]; // assumptions made during extraction, shown to the user
}

export const DEFAULT_INTENT: TripIntent = {
  originQuery: null,
  destinationQuery: null,
  departureDate: '',
  returnDate: null,
  passengers: 1,
  cabin: 'ECONOMY',
  longHaulCabin: 'PREMIUM_ECONOMY',
  longHaulThresholdHours: 6,
  maxStops: null,
  notes: [],
};
