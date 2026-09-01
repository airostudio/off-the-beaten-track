import Link from 'next/link';
import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/format';
import { BillingPortalButton } from './BillingPortalButton';

export default async function BillingPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const { data: subscription } = await service
    .from('subscriptions')
    .select('*, plan:subscription_plans(*)')
    .eq('user_id', viewer.userId ?? '')
    .maybeSingle();

  if (!subscription) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
        <p className="font-semibold text-navy-950">You're on a free account</p>
        <p className="mt-1 text-sm text-slate-500">Upgrade to unlock member fares, unlimited search and early access.</p>
        <Link
          href="/membership"
          className="mt-4 inline-block rounded-xl bg-accent-500 px-5 py-2.5 font-semibold text-white hover:bg-accent-600"
        >
          View plans
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6">
      <p className="text-sm text-slate-500">Current plan</p>
      <p className="text-xl font-bold text-navy-950">{subscription.plan?.name ?? 'Membership'}</p>
      <p className="mt-1 text-sm text-slate-500">
        {formatMoney(subscription.plan?.price ?? 0, subscription.plan?.currency ?? 'AUD')} /{' '}
        {subscription.plan?.billing_interval}
      </p>
      <p className="mt-1 text-sm capitalize text-slate-500">Status: {subscription.status.replace('_', ' ')}</p>
      {subscription.cancel_at_period_end && (
        <p className="mt-1 text-sm text-amber-600">Cancels at end of current period.</p>
      )}
      <div className="mt-4">
        <BillingPortalButton />
      </div>
    </div>
  );
}
