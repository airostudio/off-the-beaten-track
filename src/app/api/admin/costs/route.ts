import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireSuperAdmin } from '@/lib/admin';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

const schema = z.object({
  name: z.string().min(1),
  category: z.enum(['hosting', 'api', 'tooling', 'marketing', 'payroll', 'other']).default('other'),
  amount: z.coerce.number().positive(), // dollars
  currency: z.string().length(3).default('AUD'),
  recurring: z.boolean().default(true),
});

/** Owner-entered real operating costs (hosting, tooling, etc) — the app has no way to observe these itself. */
export async function POST(request: NextRequest) {
  const ownerId = await requireSuperAdmin();
  if (!ownerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid cost entry', issues: parsed.error.issues }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from('admin_costs')
    .insert({
      name: parsed.data.name,
      category: parsed.data.category,
      amount: Math.round(parsed.data.amount * 100),
      currency: parsed.data.currency,
      recurring: parsed.data.recurring,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cost: data }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const ownerId = await requireSuperAdmin();
  if (!ownerId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = new URL(request.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

  const service = createSupabaseServiceClient();
  const { error } = await service.from('admin_costs').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
