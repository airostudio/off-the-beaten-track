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
    // See src/lib/flights/providers/duffel.ts for the scaffold — it is not
    // wired in yet because it has no real API calls implemented, and doing
    // so would silently degrade search rather than improve it. Once real
    // methods are implemented there, uncomment:
    // providers.push(new DuffelFlightProvider(process.env.FLIGHT_PROVIDER_API_KEY));
  }

  if (providers.length === 0) {
    providers.push(new MockFlightProvider());
  }

  return providers;
}

/** Looks up a single provider by id, e.g. to call createOrder() on the provider a booking's offer came from. */
export function getProviderById(id: string): FlightProvider | null {
  return getActiveProviders().find((p) => p.id === id) ?? null;
}
