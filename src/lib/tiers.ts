import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { TIER_LIMITS, type UserTier, type TierLimits } from '@/types/user';
import { ACTIVE_SUBSCRIPTION_STATUSES } from '@/types/subscription';

export interface Viewer {
  tier: UserTier;
  userId: string | null;
  limits: TierLimits;
}

/**
 * Resolves the current viewer's tier from server-side, webhook-backed
 * subscription data — never from client-supplied state. This is the single
 * source of truth every API route and server component must call.
 */
export async function resolveViewer(): Promise<Viewer> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { tier: 'GUEST', userId: null, limits: TIER_LIMITS.GUEST };
  }

  const service = createSupabaseServiceClient();
  const { data: subscription } = await service
    .from('subscriptions')
    .select('status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isMember = !!subscription && ACTIVE_SUBSCRIPTION_STATUSES.includes(subscription.status);
  const tier: UserTier = isMember ? 'MEMBER' : 'FREE';

  return { tier, userId: user.id, limits: TIER_LIMITS[tier] };
}
