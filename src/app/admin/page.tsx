import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '@/types/subscription';
import { formatMoney } from '@/lib/format';

export default async function AdminOverviewPage() {
  const service = createSupabaseServiceClient();

  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: memberCount },
    { count: freeCount },
    { count: trialCount },
    { count: searches30d },
    { count: deals30d },
    { count: bookings30d },
    { count: affiliateClicks30d },
    { data: activeSubs },
    { data: savings30d },
    { count: apiErrors24h },
    { data: recentSearches },
  ] = await Promise.all([
    service.from('profiles').select('id', { count: 'exact', head: true }).eq('tier', 'MEMBER'),
    service.from('profiles').select('id', { count: 'exact', head: true }).eq('tier', 'FREE'),
    service.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'trialing'),
    service.from('searches').select('id', { count: 'exact', head: true }).gte('created_at', since30d),
    service.from('deals').select('id', { count: 'exact', head: true }).gte('discovered_at', since30d),
    service.from('bookings').select('id', { count: 'exact', head: true }).gte('booked_at', since30d),
    service.from('affiliate_clicks').select('id', { count: 'exact', head: true }).gte('created_at', since30d),
    service.from('subscriptions').select('plan:subscription_plans(price)').in('status', ACTIVE_SUBSCRIPTION_STATUSES),
    service.from('fare_savings').select('saving_amount, saving_percentage').gte('captured_at', since30d),
    service.from('provider_api_logs').select('id', { count: 'exact', head: true }).gte('created_at', since24h).not('error', 'is', null),
    service.from('searches').select('origin, destination').gte('created_at', since30d).limit(2000),
  ]);

  const mrrCents = (activeSubs ?? []).reduce((sum: number, s: any) => sum + (s.plan?.price ?? 0), 0);
  const arrCents = mrrCents * 12;

  const avgSavingCents =
    savings30d && savings30d.length > 0
      ? Math.round(savings30d.reduce((sum, s) => sum + s.saving_amount, 0) / savings30d.length)
      : null;
  const avgSavingPct =
    savings30d && savings30d.length > 0
      ? Math.round(savings30d.reduce((sum, s) => sum + Number(s.saving_percentage), 0) / savings30d.length)
      : null;

  const routeCounts = new Map<string, number>();
  for (const s of recentSearches ?? []) {
    const key = `${s.origin} → ${s.destination}`;
    routeCounts.set(key, (routeCounts.get(key) ?? 0) + 1);
  }
  const popularRoutes = Array.from(routeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Paid members" value={memberCount ?? 0} />
        <Metric label="Free accounts" value={freeCount ?? 0} />
        <Metric label="Trials" value={trialCount ?? 0} />
        <Metric label="MRR (est.)" value={formatMoney(mrrCents, 'AUD')} />
        <Metric label="ARR (est.)" value={formatMoney(arrCents, 'AUD')} />
        <Metric label="Searches (30d)" value={searches30d ?? 0} />
        <Metric label="Deals discovered (30d)" value={deals30d ?? 0} />
        <Metric label="Bookings (30d)" value={bookings30d ?? 0} />
        <Metric label="Affiliate clicks (30d)" value={affiliateClicks30d ?? 0} />
        <Metric
          label="Average member saving (30d)"
          value={avgSavingCents != null ? `${formatMoney(avgSavingCents, 'AUD')} (${avgSavingPct}%)` : '—'}
        />
        <Metric label="Provider API errors (24h)" value={apiErrors24h ?? 0} />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="mb-3 text-sm font-semibold text-navy-950">Popular routes (30d)</p>
        {popularRoutes.length === 0 ? (
          <p className="text-sm text-slate-400">No searches recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {popularRoutes.map(([route, count]) => (
              <li key={route} className="flex items-center justify-between text-sm">
                <span className="text-navy-900">{route}</span>
                <span className="text-slate-500">{count} searches</span>
              </li>
            ))}
          </ul>
        )}
      </div>
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
