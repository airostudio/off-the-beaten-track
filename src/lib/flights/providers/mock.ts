import type { FlightProvider } from '@/lib/flights/provider';
import { NotImplementedError } from '@/lib/flights/provider';
import type { FlightSearchRequest, NormalisedFlightOffer, FareDetails, FlightOrder } from '@/types/flight';

const AIRLINES = [
  { code: 'QF', name: 'Qantas', rating: 4.4 },
  { code: 'SQ', name: 'Singapore Airlines', rating: 4.7 },
  { code: 'PR', name: 'Philippine Airlines', rating: 3.9 },
  { code: 'TG', name: 'Thai Airways', rating: 4.1 },
  { code: 'MH', name: 'Malaysia Airlines', rating: 4.0 },
  { code: 'JQ', name: 'Jetstar', rating: 3.4 },
];

const HUBS = ['SIN', 'BKK', 'KUL', 'HKG'];

/** Deterministic pseudo-random generator seeded from a string, so the same
 * search produces stable-but-varied results instead of Math.random() noise. */
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (Math.imul(48271, h) + 1) % 2147483647;
    return (h < 0 ? h + 2147483647 : h) / 2147483647;
  };
}

function minutesBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

/**
 * Demo/dev provider used whenever FLIGHT_PROVIDER_API_KEY is unset, so
 * development is never blocked on external credentials. Generates
 * plausible offers including a subset with a genuine-shaped member rate
 * (representing a negotiated/commission-shared fare) so the member-pricing
 * UI can be exercised honestly — real providers must populate memberPrice
 * only from an actual negotiated rate or reward, never fabricate one.
 */
export class MockFlightProvider implements FlightProvider {
  readonly id = 'mock';
  readonly name = 'Demo Fares (Mock Provider)';

  async searchFlights(request: FlightSearchRequest): Promise<NormalisedFlightOffer[]> {
    const rand = seededRandom(`${request.origin}-${request.destination}-${request.departureDate}-${request.cabin}`);
    const offerCount = 6 + Math.floor(rand() * 4);
    const offers: NormalisedFlightOffer[] = [];

    const cabinMultiplier: Record<string, number> = {
      ECONOMY: 1,
      PREMIUM_ECONOMY: 1.7,
      BUSINESS: 3.4,
      FIRST: 5.5,
    };

    for (let i = 0; i < offerCount; i++) {
      const airline = AIRLINES[Math.floor(rand() * AIRLINES.length)];
      const stops = rand() < 0.3 ? 0 : rand() < 0.7 ? 1 : 2;
      const stopoverAirports = stops > 0 ? HUBS.slice(0, stops).sort(() => rand() - 0.5) : [];

      const departureAt = new Date(`${request.departureDate}T${String(6 + Math.floor(rand() * 16)).padStart(2, '0')}:${rand() < 0.5 ? '00' : '30'}:00Z`);
      const baseDurationMinutes = 300 + Math.floor(rand() * 900) + stops * 120;
      const arrivalAt = new Date(departureAt.getTime() + baseDurationMinutes * 60000);

      const basePrice = (550 + rand() * 900) * cabinMultiplier[request.cabin];
      const stopDiscount = 1 - stops * 0.08;
      const publicPrice = Math.round(basePrice * stopDiscount * 100); // minor units (cents)

      // ~55% of mock offers simulate a genuine negotiated member rate.
      const memberEligible = rand() < 0.55;
      const memberDiscountPct = 0.1 + rand() * 0.25; // 10-35%, matches "save 15-35% on selected fares"
      const memberPrice = memberEligible ? Math.round(publicPrice * (1 - memberDiscountPct)) : null;

      const taxes = Math.round(publicPrice * 0.12);
      const fees = Math.round(publicPrice * 0.02);

      offers.push({
        id: `mock-${request.origin}-${request.destination}-${request.departureDate}-${i}`,
        provider: this.id,
        airline: airline.name,
        flightNumber: `${airline.code}${100 + Math.floor(rand() * 800)}`,
        origin: request.origin,
        destination: request.destination,
        departureAt: departureAt.toISOString(),
        arrivalAt: arrivalAt.toISOString(),
        durationMinutes: minutesBetween(departureAt, arrivalAt),
        stops,
        stopoverAirports,
        aircraft: rand() < 0.5 ? 'Airbus A350' : 'Boeing 787-9',
        cabin: request.cabin,
        fareClass: request.cabin === 'ECONOMY' ? 'Y' : request.cabin === 'PREMIUM_ECONOMY' ? 'W' : 'J',
        baggage: {
          carryOn: '7kg',
          checked: request.cabin === 'ECONOMY' ? '23kg' : '32kg x2',
        },
        cancellationPolicy: rand() < 0.4 ? 'Non-refundable' : 'Refundable with fee',
        changesPolicy: rand() < 0.5 ? 'Changes permitted, fee applies' : 'Free changes within 24h',
        publicPrice,
        memberPrice,
        taxes,
        fees,
        currency: 'AUD',
        bookingUrl: `https://example-affiliate.invalid/redirect?offer=mock-${i}`,
        offerExpiresAt: new Date(Date.now() + 30 * 60000).toISOString(),
        lastVerifiedAt: new Date().toISOString(),
        affiliateCommission: Math.round(publicPrice * 0.03) / 100,
        memberEligible,
      });
    }

    return offers;
  }

  async getFareDetails(offerId: string): Promise<FareDetails> {
    return {
      offerId,
      fareRules: 'Standard fare rules apply. Changes and cancellations subject to airline policy.',
      refundable: false,
      changeFee: 15000,
      baggage: { carryOn: '7kg', checked: '23kg' },
    };
  }

  async getFareRules(): Promise<string> {
    return 'Standard fare rules apply. See airline conditions of carriage for full details.';
  }

  async getSeatAvailability(): Promise<number | null> {
    return null; // never fabricate a seat count
  }

  async getBaggage(): Promise<NormalisedFlightOffer['baggage']> {
    return { carryOn: '7kg', checked: '23kg' };
  }

  async createOrder(): Promise<FlightOrder> {
    throw new NotImplementedError(this.name, 'createOrder');
  }
  async cancelOrder(): Promise<void> {
    throw new NotImplementedError(this.name, 'cancelOrder');
  }
  async getOrder(): Promise<FlightOrder> {
    throw new NotImplementedError(this.name, 'getOrder');
  }
  async refreshOffer(offerId: string): Promise<NormalisedFlightOffer> {
    throw new NotImplementedError(this.name, 'refreshOffer');
  }
}
