import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { TIER_LIMITS, type UserTier, type TierLimits } from '@/types/user';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '@/types/subscription';

export interface Viewer {
  tier: UserTier;
  userId: string | null;
  limits: TierLimits;
  /** True when MEMBER access comes from a referral credit rather than a paid subscription. */
  isComplimentaryMember: boolean;
}

/**
 * Resolves the current viewer's tier from server-side, webhook-backed
 * subscription data — never from client-supplied state. This is the single
 * source of truth every API route and server component must call.
 *
 * MEMBER access comes from either a genuinely active Stripe subscription, or
 * an unexpired referral credit (profiles.membership_credit_expires_at,
 * granted by the referral program — section 34) — never fabricated.
 */
export async function resolveViewer(): Promise<Viewer> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { tier: 'GUEST', userId: null, limits: TIER_LIMITS.GUEST, isComplimentaryMember: false };
  }

  const service = createSupabaseServiceClient();
  const [{ data: subscription }, { data: profile }] = await Promise.all([
    service
      .from('subscriptions')
      .select('status')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    service.from('profiles').select('membership_credit_expires_at').eq('id', user.id).maybeSingle(),
  ]);

  const isPaidMember = !!subscription && ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status);
  const hasReferralCredit =
    !!profile?.membership_credit_expires_at && new Date(profile.membership_credit_expires_at) > new Date();

  const isMember = isPaidMember || hasReferralCredit;
  const tier: UserTier = isMember ? 'MEMBER' : 'FREE';

  return {
    tier,
    userId: user.id,
    limits: TIER_LIMITS[tier],
    isComplimentaryMember: !isPaidMember && hasReferralCredit,
  };
}
