import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { SavingsMeter } from '@/components/dashboard/SavingsMeter';
import { DestinationHero } from '@/components/dashboard/DestinationHero';
import Link from 'next/link';

export default async function DashboardOverviewPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();

  const [{ count: alertCount }, { count: savedSearchCount }, { data: rewards }, { data: subscription }, { data: lastSearch }, { data: preferences }] =
    await Promise.all([
      service.from('alerts').select('id', { count: 'exact', head: true }).eq('user_id', viewer.userId).eq('active', true),
      service.from('saved_searches').select('id', { count: 'exact', head: true }).eq('user_id', viewer.userId),
      service
        .from('member_rewards')
        .select('member_reward, booking:bookings!inner(user_id)')
        .eq('booking.user_id', viewer.userId ?? ''),
      service
        .from('subscriptions')
        .select('*, plan:subscription_plans(price, currency)')
        .eq('user_id', viewer.userId ?? '')
        .maybeSingle(),
      service
        .from('searches')
        .select('destination')
        .eq('user_id', viewer.userId ?? '')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      service.from('travel_preferences').select('user_id').eq('user_id', viewer.userId ?? '').maybeSingle(),
    ]);

  const verifiedSavingsCents = (rewards ?? []).reduce((sum, r: any) => sum + Number(r.member_reward ?? 0), 0);
  const membershipCostCents = subscription?.plan?.price ?? 0;
  const currency = subscription?.plan?.currency?.toUpperCase() ?? 'AUD';

  return (
    <div className="space-y-6">
      {!preferences && (
        <div className="rounded-2xl border border-accent-500/30 bg-accent-500/5 p-4">
          <p className="font-semibold text-navy-950">Set up your travel profile</p>
          <p className="text-sm text-slate-600">
            Takes 30 seconds — we'll auto-create fare alerts for the destinations you tell us about.
          </p>
          <Link href="/onboarding" className="mt-2 inline-block text-sm font-semibold text-accent-600">
            Get started →
          </Link>
        </div>
      )}

      <DestinationHero initialCode={lastSearch?.destination ?? null} />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-sm text-slate-500">Membership status</p>
        <p className="mt-1 text-xl font-bold text-navy-950">
          {viewer.tier === 'MEMBER'
            ? viewer.isComplimentaryMember
              ? 'Member (referral credit)'
              : 'Active member'
            : 'Free account'}
        </p>
        {viewer.tier !== 'MEMBER' && (
          <Link href="/membership" className="mt-2 inline-block text-sm font-semibold text-accent-600">
            Upgrade for early access & member fares →
          </Link>
        )}
        {viewer.isComplimentaryMember && (
          <Link href="/dashboard/referrals" className="mt-2 inline-block text-sm font-semibold text-accent-600">
            Refer more friends to extend it →
          </Link>
        )}
      </div>

      <SavingsMeter
        membershipCostCents={membershipCostCents}
        verifiedSavingsCents={verifiedSavingsCents}
        currency={currency}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Active flight alerts" value={alertCount ?? 0} href="/dashboard/alerts" />
        <StatCard label="Saved searches" value={savedSearchCount ?? 0} href="/dashboard/saved-searches" />
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition hover:border-accent-500">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy-950">{value}</p>
    </Link>
  );
}
