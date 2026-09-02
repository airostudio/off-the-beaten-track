import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { CopyLinkButton } from './CopyLinkButton';
import { EmptyState } from '@/components/dashboard/EmptyState';

export default async function ReferralsPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();

  const { data: profile } = await service
    .from('profiles')
    .select('referral_code, membership_credit_expires_at')
    .eq('id', viewer.userId ?? '')
    .maybeSingle();

  const { data: referrals } = await service
    .from('referrals')
    .select('id, credited_at, reward_days')
    .eq('referrer_id', viewer.userId ?? '')
    .order('credited_at', { ascending: false });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const referralLink = `${siteUrl}/signup?ref=${profile?.referral_code ?? ''}`;

  const creditActive = profile?.membership_credit_expires_at && new Date(profile.membership_credit_expires_at) > new Date();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="text-sm font-semibold text-navy-950">Refer a friend, get 30 days free</p>
        <p className="mt-1 text-sm text-slate-500">
          Your friend gets 30 days of membership when they sign up. You get 30 days added to yours —
          stacks every time.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            readOnly
            value={referralLink}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600"
          />
          <CopyLinkButton link={referralLink} />
        </div>
      </div>

      {creditActive && (
        <div className="rounded-2xl border border-member-500/30 bg-member-50 p-4 text-sm text-member-600">
          You have complimentary membership access until{' '}
          {new Date(profile!.membership_credit_expires_at!).toLocaleDateString('en-AU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
          , from referral credits.
        </div>
      )}

      <div>
        <p className="mb-3 text-sm font-semibold text-navy-950">Your referrals</p>
        {!referrals || referrals.length === 0 ? (
          <EmptyState title="No referrals yet" body="Share your link above — you'll see credits appear here." />
        ) : (
          <ul className="space-y-2">
            {referrals.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 text-sm">
                <span className="text-navy-900">Friend joined</span>
                <span className="text-member-600">+{r.reward_days} days credited</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
