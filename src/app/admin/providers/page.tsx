import { createSupabaseServiceClient } from '@/lib/supabase/server';

export default async function AdminProvidersPage() {
  const service = createSupabaseServiceClient();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [{ data: providers }, { data: logs }] = await Promise.all([
    service.from('providers').select('*').order('id'),
    service.from('provider_api_logs').select('provider_id, error, latency_ms').gte('created_at', since24h),
  ]);

  const statsByProvider = new Map<string, { queries: number; errors: number; totalLatency: number }>();
  for (const log of logs ?? []) {
    const stats = statsByProvider.get(log.provider_id) ?? { queries: 0, errors: 0, totalLatency: 0 };
    stats.queries++;
    if (log.error) stats.errors++;
    stats.totalLatency += log.latency_ms ?? 0;
    statsByProvider.set(log.provider_id, stats);
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-slate-500">
          <tr>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Queries (24h)</th>
            <th className="px-4 py-3">Cost/query</th>
            <th className="px-4 py-3">Avg latency (24h)</th>
            <th className="px-4 py-3">Failure rate (24h)</th>
          </tr>
        </thead>
        <tbody>
          {(providers ?? []).map((p) => {
            const stats = statsByProvider.get(p.id);
            const failureRate = stats && stats.queries > 0 ? (stats.errors / stats.queries) * 100 : null;
            const avgLatency = stats && stats.queries > 0 ? Math.round(stats.totalLatency / stats.queries) : null;
            return (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-medium text-navy-950">{p.name}</td>
                <td className="px-4 py-3">{p.enabled ? 'Enabled' : 'Disabled'}</td>
                <td className="px-4 py-3">{stats?.queries ?? 0}</td>
                <td className="px-4 py-3">${Number(p.cost_per_query ?? 0).toFixed(3)}</td>
                <td className="px-4 py-3">{avgLatency != null ? `${avgLatency}ms` : '—'}</td>
                <td className="px-4 py-3">{failureRate != null ? `${failureRate.toFixed(1)}%` : '—'}</td>
              </tr>
            );
          })}
          {(!providers || providers.length === 0) && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                No providers registered. Seed the `providers` table (e.g. 'mock') to see stats here.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
