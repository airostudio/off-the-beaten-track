import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

/** Toggle featured, or expire a deal immediately (section 29). */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const update: Record<string, unknown> = {};
  if (typeof body.featured === 'boolean') update.featured = body.featured;
  if (body.expireNow === true) update.expires_at = new Date().toISOString();

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { error } = await service.from('deals').update(update).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: adminId,
    action: 'deal_updated',
    entity: 'deals',
    entity_id: params.id,
    metadata: update,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const service = createSupabaseServiceClient();
  const { error } = await service.from('deals').delete().eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({ actor_id: adminId, action: 'deal_deleted', entity: 'deals', entity_id: params.id });

  return NextResponse.json({ ok: true });
}
