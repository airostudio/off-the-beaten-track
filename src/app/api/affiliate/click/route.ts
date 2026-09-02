import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

const schema = z.object({
  offerId: z.string().uuid().optional(),
  partner: z.string().default('affiliate'),
});

/**
 * Records a "Book" click (section 31) so it can later be reconciled with a
 * confirmed booking and commission. Fire-and-forget from the client via
 * fetch(..., { keepalive: true }) alongside the normal link navigation.
 */
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid click payload' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from('affiliate_clicks')
    .insert({
      user_id: user?.id ?? null,
      offer_id: parsed.data.offerId ?? null,
      partner: parsed.data.partner,
    })
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clickId: data.id }, { status: 201 });
}
