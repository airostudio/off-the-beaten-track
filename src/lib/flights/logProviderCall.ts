import { createSupabaseServiceClient } from '@/lib/supabase/server';
import type { NormalisedFlightOffer, FlightSearchRequest } from '@/types/flight';

/**
 * Records one provider_api_logs row per provider per search, so the admin
 * dashboard's provider performance and API-error metrics (section 30) are
 * backed by real call outcomes instead of static placeholders.
 */
export async function logProviderCalls(
  service: ReturnType<typeof createSupabaseServiceClient>,
  request: FlightSearchRequest,
  providerIds: string[],
  settled: PromiseSettledResult<NormalisedFlightOffer[]>[],
  startedAt: number
) {
  const latencyMs = Date.now() - startedAt;
  const rows = settled.map((result, i) => ({
    provider_id: providerIds[i],
    request: { origin: request.origin, destination: request.destination, departureDate: request.departureDate, cabin: request.cabin },
    response_status: result.status === 'fulfilled' ? 200 : 502,
    latency_ms: latencyMs,
    error: result.status === 'rejected' ? String(result.reason).slice(0, 500) : null,
  }));

  await service.from('provider_api_logs').insert(rows);
}
