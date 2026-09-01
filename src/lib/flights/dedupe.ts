import type { NormalisedFlightOffer } from '@/types/flight';

/** Collapses equivalent itineraries returned by multiple providers, keeping the cheapest. */
export function dedupeOffers(offers: NormalisedFlightOffer[]): NormalisedFlightOffer[] {
  const byKey = new Map<string, NormalisedFlightOffer>();

  for (const offer of offers) {
    const key = [
      offer.airline,
      offer.flightNumber,
      offer.departureAt,
      offer.arrivalAt,
      offer.cabin,
    ].join('|');

    const existing = byKey.get(key);
    if (!existing || offer.publicPrice < existing.publicPrice) {
      byKey.set(key, offer);
    }
  }

  return Array.from(byKey.values());
}
