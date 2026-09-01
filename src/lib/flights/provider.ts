import type { FlightSearchRequest, NormalisedFlightOffer, FareDetails, FlightOrder } from '@/types/flight';

/**
 * Every flight data source (mock, Duffel, Amadeus, NDC, ...) implements this
 * interface. Nothing outside `src/lib/flights/providers/*` should know which
 * concrete provider is in use — search/ranking/UI code only ever talks to
 * this contract and to NormalisedFlightOffer.
 */
export interface FlightProvider {
  readonly id: string;
  readonly name: string;

  searchFlights(request: FlightSearchRequest): Promise<NormalisedFlightOffer[]>;
  getFareDetails(offerId: string): Promise<FareDetails>;
  getFareRules(offerId: string): Promise<string>;
  getSeatAvailability(offerId: string): Promise<number | null>;
  getBaggage(offerId: string): Promise<NormalisedFlightOffer['baggage']>;

  // Future direct-booking surface (Phase 5). Mock/metasearch-only providers
  // may throw NotImplementedError until real order APIs are wired up.
  createOrder(offerId: string): Promise<FlightOrder>;
  cancelOrder(orderId: string): Promise<void>;
  getOrder(orderId: string): Promise<FlightOrder>;
  refreshOffer(offerId: string): Promise<NormalisedFlightOffer>;
}

export class NotImplementedError extends Error {
  constructor(provider: string, method: string) {
    super(`${provider} does not implement ${method} yet`);
    this.name = 'NotImplementedError';
  }
}
