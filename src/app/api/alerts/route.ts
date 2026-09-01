import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { resolveViewer } from '@/lib/tiers';

const createSchema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  maxPrice: z.coerce.number().int().positive().optional(), // major units (dollars) from the client
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  travelMonth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  flexibleDays: z.coerce.number().int().min(0).max(30).default(0),
});

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ alerts: data });
}

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const viewer = await resolveViewer();
  if (viewer.limits.alertsLimit !== null) {
    const { count } = await supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('active', true);
    if ((count ?? 0) >= viewer.limits.alertsLimit) {
      return NextResponse.json(
        {
          error: 'Alert limit reached',
          upgrade: true,
          message: `Free accounts can track up to ${viewer.limits.alertsLimit} alerts. Become a member for unlimited alerts.`,
        },
        { status: 429 }
      );
    }
  }

  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid alert', issues: parsed.error.issues }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('alerts')
    .insert({
      user_id: user.id,
      origin: parsed.data.origin,
      destination: parsed.data.destination,
      max_price: parsed.data.maxPrice ? parsed.data.maxPrice * 100 : null,
      cabin: parsed.data.cabin,
      travel_month: parsed.data.travelMonth ?? null,
      flexible_days: parsed.data.flexibleDays,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ alert: data }, { status: 201 });
}
