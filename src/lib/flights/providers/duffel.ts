import type { FlightProvider } from '@/lib/flights/provider';
import { NotImplementedError } from '@/lib/flights/provider';
import type { FlightSearchRequest, NormalisedFlightOffer, FareDetails, FlightOrder } from '@/types/flight';

/**
 * Scaffold for a real Duffel integration (https://duffel.com/docs/api).
 * Deliberately NOT wired into the provider registry yet — it has no real
 * API calls, so enabling it would silently degrade search (empty results)
 * rather than improve it. This exists so the next engineer implementing a
 * live provider has the exact shape to fill in, not a blank page.
 *
 * To bring this online:
 *   1. Implement each method below against Duffel's REST API using
 *      `apiKey` (server-only — never expose it to the client).
 *   2. Map every Duffel offer field into NormalisedFlightOffer. In
 *      particular: `memberPrice` must stay null unless Duffel (or a
 *      negotiated Duffel rate) genuinely returns a different price for
 *      members — never synthesise a discount here.
 *   3. In src/lib/flights/registry.ts, push `new DuffelFlightProvider(key)`
 *      behind the FLIGHT_PROVIDER_API_KEY check, alongside (not instead of)
 *      the mock provider until you're confident in production data quality.
 */
export class DuffelFlightProvider implements FlightProvider {
  readonly id = 'duffel';
  readonly name = 'Duffel';

  constructor(private readonly apiKey: string) {}

  async searchFlights(_request: FlightSearchRequest): Promise<NormalisedFlightOffer[]> {
    // POST https://api.duffel.com/air/offer_requests, then GET the offers,
    // normalising each into NormalisedFlightOffer.
    throw new NotImplementedError(this.name, 'searchFlights');
  }

  async getFareDetails(_offerId: string): Promise<FareDetails> {
    throw new NotImplementedError(this.name, 'getFareDetails');
  }

  async getFareRules(_offerId: string): Promise<string> {
    throw new NotImplementedError(this.name, 'getFareRules');
  }

  async getSeatAvailability(_offerId: string): Promise<number | null> {
    throw new NotImplementedError(this.name, 'getSeatAvailability');
  }

  async getBaggage(_offerId: string): Promise<NormalisedFlightOffer['baggage']> {
    throw new NotImplementedError(this.name, 'getBaggage');
  }

  async createOrder(_offerId: string): Promise<FlightOrder> {
    // POST https://api.duffel.com/air/orders — Phase 5 direct booking.
    throw new NotImplementedError(this.name, 'createOrder');
  }

  async cancelOrder(_orderId: string): Promise<void> {
    throw new NotImplementedError(this.name, 'cancelOrder');
  }

  async getOrder(_orderId: string): Promise<FlightOrder> {
    throw new NotImplementedError(this.name, 'getOrder');
  }

  async refreshOffer(_offerId: string): Promise<NormalisedFlightOffer> {
    throw new NotImplementedError(this.name, 'refreshOffer');
  }
}
