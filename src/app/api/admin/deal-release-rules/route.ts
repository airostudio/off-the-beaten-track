import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

const schema = z.object({
  tier: z.enum(['GUEST', 'FREE', 'MEMBER']),
  releaseDelayMinutes: z.coerce.number().int().min(0).max(60 * 24 * 30),
  allowBooking: z.boolean(),
  allowPriceVisibility: z.boolean(),
});

/** Admin-configurable member-first release timing per tier (section 16). */
export async function PATCH(request: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid rule', issues: parsed.error.issues }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { error } = await service
    .from('deal_release_rules')
    .update({
      release_delay_minutes: parsed.data.releaseDelayMinutes,
      allow_booking: parsed.data.allowBooking,
      allow_price_visibility: parsed.data.allowPriceVisibility,
    })
    .eq('tier', parsed.data.tier);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: adminId,
    action: 'deal_release_rule_updated',
    entity: 'deal_release_rules',
    entity_id: parsed.data.tier,
    metadata: parsed.data,
  });

  return NextResponse.json({ ok: true });
}
