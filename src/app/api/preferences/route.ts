import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  homeAirport: z.string().length(3).toUpperCase(),
  preferredCabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
  longHaulCabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
  longHaulThresholdHours: z.coerce.number().min(1).max(20),
  maxStops: z.coerce.number().int().min(0).max(3),
  minConnectionMinutes: z.coerce.number().int().min(20).max(600),
});

export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid preferences', issues: parsed.error.issues }, { status: 400 });
  }

  const { error } = await supabase.from('travel_preferences').upsert({
    user_id: user.id,
    home_airport: parsed.data.homeAirport,
    preferred_cabin: parsed.data.preferredCabin,
    long_haul_cabin: parsed.data.longHaulCabin,
    long_haul_threshold_hours: parsed.data.longHaulThresholdHours,
    max_stops: parsed.data.maxStops,
    min_connection_minutes: parsed.data.minConnectionMinutes,
    updated_at: new Date().toISOString(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
