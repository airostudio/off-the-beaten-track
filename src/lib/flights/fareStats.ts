import { createSupabaseServiceClient } from '@/lib/supabase/server';

export interface RouteFareStats {
  hasData: boolean;
  current?: number;
  low?: number;
  high?: number;
  average?: number;
  observations?: number;
}

/** Shared by /api/flights/history and the SEO flight landing pages — real observed prices only, never fabricated. */
export async function getRouteFareStats(origin: string, destination: string, days = 30): Promise<RouteFareStats> {
  const routeKey = `${origin}-${destination}`;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const service = createSupabaseServiceClient();
  const { data } = await service
    .from('fare_observations')
    .select('price, captured_at')
    .eq('route_key', routeKey)
    .gte('captured_at', since)
    .order('captured_at', { ascending: true });

  if (!data || data.length === 0) return { hasData: false };

  const prices = data.map((d) => d.price);
  return {
    hasData: true,
    current: prices[prices.length - 1],
    low: Math.min(...prices),
    high: Math.max(...prices),
    average: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    observations: data.length,
  };
}
