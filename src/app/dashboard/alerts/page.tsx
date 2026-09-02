import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { AlertsList } from './AlertsList';

export default async function AlertsPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const { data: alerts } = await service
    .from('alerts')
    .select('*')
    .eq('user_id', viewer.userId ?? '')
    .order('created_at', { ascending: false });

  return (
    <div>
      {viewer.limits.alertsLimit !== null && (
        <p className="mb-4 text-sm text-slate-500">
          Free accounts can track up to {viewer.limits.alertsLimit} active alerts.{' '}
          <a href="/membership" className="font-semibold text-accent-600">
            Members get unlimited alerts.
          </a>
        </p>
      )}
      <AlertsList initial={alerts ?? []} />
    </div>
  );
}
