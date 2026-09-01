import { createSupabaseServiceClient } from '@/lib/supabase/server';
import type { Viewer } from '@/lib/tiers';

/**
 * Enforces per-tier daily search limits (API cost protection, section 43).
 * Counts rows in `searches` for this user (or IP for guests) since midnight UTC.
 * Returns true if the caller is within their limit.
 */
export async function checkSearchLimit(viewer: Viewer, ipAddress: string | null): Promise<boolean> {
  if (viewer.limits.searchesPerDay === null) return true;

  const service = createSupabaseServiceClient();
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);

  let query = service
    .from('searches')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since.toISOString());

  query = viewer.userId ? query.eq('user_id', viewer.userId) : query.eq('ip_address', ipAddress ?? 'unknown');

  const { count } = await query;
  return (count ?? 0) < viewer.limits.searchesPerDay;
}
