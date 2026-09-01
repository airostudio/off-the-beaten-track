import { createSupabaseServiceClient } from '@/lib/supabase/server';

export default async function AdminProvidersPage() {
  const service = createSupabaseServiceClient();
  const { data: providers } = await service.from('providers').select('*').order('id');

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-slate-500">
          <tr>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Cost/query</th>
            <th className="px-4 py-3">Avg latency</th>
            <th className="px-4 py-3">Failure rate</th>
          </tr>
        </thead>
        <tbody>
          {(providers ?? []).map((p) => (
            <tr key={p.id} className="border-b border-slate-100">
              <td className="px-4 py-3 font-medium text-navy-950">{p.name}</td>
              <td className="px-4 py-3">{p.enabled ? 'Enabled' : 'Disabled'}</td>
              <td className="px-4 py-3">${Number(p.cost_per_query ?? 0).toFixed(3)}</td>
              <td className="px-4 py-3">{p.avg_latency_ms ? `${p.avg_latency_ms}ms` : '—'}</td>
              <td className="px-4 py-3">{p.failure_rate ? `${(p.failure_rate * 100).toFixed(1)}%` : '—'}</td>
            </tr>
          ))}
          {(!providers || providers.length === 0) && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                No providers registered. Seed the `providers` table (e.g. 'mock') to see stats here.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
