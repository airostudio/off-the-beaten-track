import type { FlightProvider } from '@/lib/flights/provider';
import { MockFlightProvider } from '@/lib/flights/providers/mock';

/**
 * Returns the list of active flight providers to fan a search out to.
 * Falls back to the mock provider whenever no live credentials are
 * configured, so local development is never blocked on external API keys.
 * Add real providers here (Duffel, Amadeus, ...) behind their own env var
 * checks — the search engine already queries every entry concurrently.
 */
export function getActiveProviders(): FlightProvider[] {
  const providers: FlightProvider[] = [];

  if (process.env.FLIGHT_PROVIDER_API_KEY) {
    // Real provider adapters plug in here, e.g.:
    // providers.push(new DuffelFlightProvider(process.env.FLIGHT_PROVIDER_API_KEY));
  }

  if (providers.length === 0) {
    providers.push(new MockFlightProvider());
  }

  return providers;
}
