import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '@/types/subscription';

export default async function AdminOverviewPage() {
  const service = createSupabaseServiceClient();

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: memberCount },
    { count: freeCount },
    { count: searches30d },
    { count: deals30d },
    { count: affiliateClicks30d },
    { data: activeSubs },
  ] = await Promise.all([
    service.from('profiles').select('id', { count: 'exact', head: true }).eq('tier', 'MEMBER'),
    service.from('profiles').select('id', { count: 'exact', head: true }).eq('tier', 'FREE'),
    service.from('searches').select('id', { count: 'exact', head: true }).gte('created_at', since30d),
    service.from('deals').select('id', { count: 'exact', head: true }).gte('discovered_at', since30d),
    service.from('affiliate_clicks').select('id', { count: 'exact', head: true }).gte('created_at', since30d),
    service.from('subscriptions').select('plan:subscription_plans(price)').in('status', ACTIVE_SUBSCRIPTION_STATUSES),
  ]);

  const mrrCents = (activeSubs ?? []).reduce((sum: number, s: any) => sum + (s.plan?.price ?? 0), 0);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Metric label="Paid members" value={memberCount ?? 0} />
      <Metric label="Free accounts" value={freeCount ?? 0} />
      <Metric label="MRR (est.)" value={`$${(mrrCents / 100).toFixed(0)}`} />
      <Metric label="Searches (30d)" value={searches30d ?? 0} />
      <Metric label="Deals discovered (30d)" value={deals30d ?? 0} />
      <Metric label="Affiliate clicks (30d)" value={affiliateClicks30d ?? 0} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy-950">{value}</p>
    </div>
  );
}
