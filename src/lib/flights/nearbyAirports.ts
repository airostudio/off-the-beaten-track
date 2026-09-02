/**
 * Curated nearby/alternative airport map (section 12). Scoped to Phase 2 as
 * alternate direct city-pairs only — e.g. searching MEL also checks AVV, and
 * MNL also checks CEB — each still a single provider-returned itinerary, not
 * a constructed self-transfer routing (that's the Smart Route engine, Phase 3).
 *
 * `extraNote` must always be shown next to any alternate-airport result so a
 * traveller understands they'd be flying from/to a different airport.
 */
export interface NearbyAirport {
  code: string;
  extraNote: string;
}

const NEARBY_AIRPORTS: Record<string, NearbyAirport[]> = {
  MEL: [{ code: 'AVV', extraNote: 'Avalon Airport — ~55km further from central Melbourne' }],
  SYD: [{ code: 'BWU', extraNote: 'Bankstown — general aviation only, rarely has airline service' }],
  MNL: [{ code: 'CEB', extraNote: 'Cebu — a different city, ~570km from Manila' }],
  BKK: [{ code: 'DMK', extraNote: 'Don Mueang — Bangkok\'s secondary airport, mostly budget carriers' }],
  SIN: [{ code: 'JHB', extraNote: 'Johor Bahru, Malaysia — across the border, ~1hr from Singapore' }],
  KUL: [{ code: 'SZB', extraNote: 'Subang — closer to KL but far fewer international routes' }],
  DPS: [], // Denpasar (Bali) has no practical alternate for international arrivals
};

export function getNearbyAirports(code: string): NearbyAirport[] {
  return NEARBY_AIRPORTS[code.toUpperCase()] ?? [];
}
