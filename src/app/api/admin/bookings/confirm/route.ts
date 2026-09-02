import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { splitCommission } from '@/lib/commissionSharing';

const schema = z.object({
  affiliateClickId: z.string().uuid(),
  amount: z.coerce.number().positive(), // dollars
  commission: z.coerce.number().nonnegative(), // dollars
  currency: z.string().length(3).default('AUD'),
});

/**
 * Admin-confirmed booking outcome (section 27/46). In production this would
 * be a webhook from the affiliate network/GDS; until that integration
 * exists, an admin records the real outcome here. Splits the commission via
 * the Commission Sharing Engine and credits the member's reward — this is
 * what feeds the dashboard Savings Meter.
 */
export async function POST(request: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid confirmation', issues: parsed.error.issues }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { data: click } = await service
    .from('affiliate_clicks')
    .select('id, user_id, offer_id')
    .eq('id', parsed.data.affiliateClickId)
    .maybeSingle();

  if (!click) return NextResponse.json({ error: 'Affiliate click not found' }, { status: 404 });

  const amountCents = Math.round(parsed.data.amount * 100);
  const commissionCents = Math.round(parsed.data.commission * 100);

  const { data: booking, error: bookingError } = await service
    .from('bookings')
    .insert({
      user_id: click.user_id,
      offer_id: click.offer_id,
      status: 'confirmed',
      amount: amountCents,
      currency: parsed.data.currency,
    })
    .select('id')
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: bookingError?.message ?? 'Failed to create booking' }, { status: 500 });
  }

  await service.from('affiliate_clicks').update({ confirmed_commission: parsed.data.commission }).eq('id', click.id);

  const { memberReward, platformMargin } = splitCommission(parsed.data.commission);

  const { data: commissionRow } = await service
    .from('commissions')
    .insert({
      affiliate_click_id: click.id,
      booking_id: booking.id,
      amount: parsed.data.commission,
      currency: parsed.data.currency,
      status: 'confirmed',
      platform_share: platformMargin,
      member_share: memberReward,
    })
    .select('id')
    .single();

  // Only a signed-in member's booking earns a reward — a guest checkout has
  // no account to credit the cashback to.
  if (click.user_id && commissionRow) {
    await service.from('member_rewards').insert({
      booking_id: booking.id,
      commission: parsed.data.commission,
      member_reward: memberReward,
      platform_margin: platformMargin,
      status: 'credited',
    });
  }

  await service.from('audit_logs').insert({
    actor_id: adminId,
    action: 'booking_confirmed',
    entity: 'bookings',
    entity_id: booking.id,
    metadata: { amount: parsed.data.amount, commission: parsed.data.commission },
  });

  return NextResponse.json({ bookingId: booking.id, memberReward, platformMargin });
}
