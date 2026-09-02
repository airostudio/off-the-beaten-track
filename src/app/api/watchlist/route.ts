import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  departureDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  returnDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  priceWhenWatched: z.coerce.number().int().positive(),
  currency: z.string().length(3).default('AUD'),
});

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data, error } = await supabase
    .from('watched_trips')
    .select('*')
    .eq('user_id', user.id)
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trips: data });
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid watch request', issues: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('watched_trips')
    .insert({
      user_id: user.id,
      origin: parsed.data.origin,
      destination: parsed.data.destination,
      departure_date: parsed.data.departureDate,
      return_date: parsed.data.returnDate ?? null,
      cabin: parsed.data.cabin,
      price_when_watched: parsed.data.priceWhenWatched,
      currency: parsed.data.currency,
      latest_price: parsed.data.priceWhenWatched,
      latest_price_checked_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ trip: data }, { status: 201 });
}
