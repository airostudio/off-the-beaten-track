import { redirect } from 'next/navigation';
import { requireSuperAdmin } from '@/lib/admin';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/format';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '@/types/subscription';
import { AddCostForm } from './AddCostForm';
import { DeleteCostButton } from './DeleteCostButton';

// Indicative Stripe AU domestic card rate — not pulled from real per-charge
// fee data (that needs balance_transaction webhooks we don't ingest yet),
// always labelled as an estimate rather than presented as exact.
const STRIPE_PERCENT_FEE = 0.0175;
const STRIPE_FIXED_FEE_CENTS = 30;

export default async function OwnerFinancePage() {
  const ownerId = await requireSuperAdmin();
  if (!ownerId) redirect('/admin');

  const service = createSupabaseServiceClient();
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { data: activeSubs },
    { data: commissions30d },
    { data: commissionsAllTime },
    { data: directBookings30d },
    { data: memberRewards30d },
    { data: providers },
    { data: logs30d },
    { data: costs },
  ] = await Promise.all([
    service.from('subscriptions').select('plan:subscription_plans(price, currency)').in('status', ACTIVE_SUBSCRIPTION_STATUSES),
    service.from('commissions').select('amount').in('status', ['confirmed', 'paid']).gte('created_at', since30d),
    service.from('commissions').select('amount').in('status', ['confirmed', 'paid']),
    service.from('bookings').select('amount, currency').eq('payment_status', 'paid').gte('booked_at', since30d),
    service.from('member_rewards').select('member_reward').gte('created_at', since30d),
    service.from('providers').select('id, cost_per_query'),
    service.from('provider_api_logs').select('provider_id').gte('created_at', since30d),
    service.from('admin_costs').select('*').order('created_at', { ascending: false }),
  ]);

  const mrrCents = (activeSubs ?? []).reduce((sum: number, s: any) => sum + (s.plan?.price ?? 0), 0);
  const arrCents = mrrCents * 12;

  const commissions30dCents = Math.round((commissions30d ?? []).reduce((sum, c) => sum + Number(c.amount), 0) * 100);
  const commissionsAllTimeCents = Math.round((commissionsAllTime ?? []).reduce((sum, c) => sum + Number(c.amount), 0) * 100);
  const directBookingRevenue30dCents = (directBookings30d ?? []).reduce((sum, b) => sum + (b.amount ?? 0), 0);

  const totalIncome30dCents = mrrCents + commissions30dCents + directBookingRevenue30dCents;

  const memberRewardsCents = Math.round((memberRewards30d ?? []).reduce((sum, r) => sum + Number(r.member_reward), 0) * 100);

  const queryCountByProvider = new Map<string, number>();
  for (const log of logs30d ?? []) {
    queryCountByProvider.set(log.provider_id, (queryCountByProvider.get(log.provider_id) ?? 0) + 1);
  }
  const providerApiCostCents = Math.round(
    (providers ?? []).reduce((sum, p) => sum + (queryCountByProvider.get(p.id) ?? 0) * Number(p.cost_per_query ?? 0) * 100, 0)
  );

  const stripeFeeCents = Math.round(
    totalIncome30dCents * STRIPE_PERCENT_FEE + ((activeSubs?.length ?? 0) + (directBookings30d?.length ?? 0)) * STRIPE_FIXED_FEE_CENTS
  );

  const recurringCostsCents = (costs ?? []).filter((c) => c.recurring).reduce((sum, c) => sum + c.amount, 0);
  const oneOffCosts30dCents = (costs ?? [])
    .filter((c) => !c.recurring && new Date(c.created_at) >= new Date(since30d))
    .reduce((sum, c) => sum + c.amount, 0);

  const totalCosts30dCents = providerApiCostCents + memberRewardsCents + stripeFeeCents + recurringCostsCents + oneOffCosts30dCents;
  const netCents = totalIncome30dCents - totalCosts30dCents;

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-navy-950 bg-navy-950 p-6 text-white">
        <p className="text-sm text-slate-300">Estimated net income (last 30 days)</p>
        <p className={`mt-1 text-3xl font-bold ${netCents >= 0 ? 'text-member-500' : 'text-red-400'}`}>
          {netCents >= 0 ? '+' : ''}
          {formatMoney(netCents, 'AUD')}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {formatMoney(totalIncome30dCents, 'AUD')} income − {formatMoney(totalCosts30dCents, 'AUD')} costs. Stripe fees
          are an estimate; everything else is computed from real records.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Income</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="MRR" value={formatMoney(mrrCents, 'AUD')} />
          <Metric label="ARR (est.)" value={formatMoney(arrCents, 'AUD')} />
          <Metric label="Affiliate commissions (30d)" value={formatMoney(commissions30dCents, 'AUD')} />
          <Metric label="Affiliate commissions (all-time)" value={formatMoney(commissionsAllTimeCents, 'AUD')} />
          <Metric label="Direct booking revenue (30d)" value={formatMoney(directBookingRevenue30dCents, 'AUD')} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Costs (30 days)</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Provider API costs" value={formatMoney(providerApiCostCents, 'AUD')} />
          <Metric label="Member reward payouts" value={formatMoney(memberRewardsCents, 'AUD')} />
          <Metric label="Stripe fees (est.)" value={formatMoney(stripeFeeCents, 'AUD')} />
          <Metric label="Recurring costs (monthly)" value={formatMoney(recurringCostsCents, 'AUD')} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Manual operating costs</h2>
        <div className="mb-3">
          <AddCostForm />
        </div>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {(costs ?? []).map((c) => (
                <tr key={c.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-navy-950">{c.name}</td>
                  <td className="px-4 py-3 capitalize">{c.category}</td>
                  <td className="px-4 py-3">{formatMoney(c.amount, c.currency)}</td>
                  <td className="px-4 py-3">{c.recurring ? 'Monthly' : 'One-off'}</td>
                  <td className="px-4 py-3">
                    <DeleteCostButton id={c.id} />
                  </td>
                </tr>
              ))}
              {(!costs || costs.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No manual costs entered yet — add hosting, tooling or marketing spend above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-navy-950">{value}</p>
    </div>
  );
}
