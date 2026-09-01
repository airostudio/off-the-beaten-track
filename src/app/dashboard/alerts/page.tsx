import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/dashboard/EmptyState';

export default async function AlertsPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const { data: alerts } = await service
    .from('alerts')
    .select('*')
    .eq('user_id', viewer.userId ?? '')
    .order('created_at', { ascending: false });

  if (!alerts || alerts.length === 0) {
    return (
      <EmptyState
        title="No fare alerts yet"
        body="Create an alert from a search to get notified when a route drops below your target price."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {alerts.map((a) => (
        <li key={a.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold text-navy-950">
            {a.origin} → {a.destination}
          </p>
          <p className="text-sm text-slate-500">
            Max {a.max_price ? `$${(a.max_price / 100).toFixed(0)}` : 'any'} · {a.cabin} · ±{a.flexible_days} days
          </p>
        </li>
      ))}
    </ul>
  );
}
