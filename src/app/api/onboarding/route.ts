import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const schema = z.object({
  homeAirport: z.string().length(3).toUpperCase(),
  dreamDestinations: z.array(z.string().length(3).toUpperCase()).min(1).max(3),
  preferredCabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']),
  flexibleDays: z.coerce.number().int().min(0).max(14),
  tripsPerYear: z.coerce.number().int().min(1).max(20),
});

/** Onboarding wizard (section 40): saves travel preferences and auto-creates a fare alert per dream destination. */
export async function POST(request: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid onboarding data', issues: parsed.error.issues }, { status: 400 });
  }
  const d = parsed.data;

  const { error: prefsError } = await supabase.from('travel_preferences').upsert({
    user_id: user.id,
    home_airport: d.homeAirport,
    preferred_cabin: d.preferredCabin,
    favourite_destinations: d.dreamDestinations,
    trips_per_year: d.tripsPerYear,
    updated_at: new Date().toISOString(),
  });
  if (prefsError) return NextResponse.json({ error: prefsError.message }, { status: 500 });

  await supabase.from('profiles').update({ home_airport: d.homeAirport }).eq('id', user.id);

  const { error: alertsError } = await supabase.from('alerts').insert(
    d.dreamDestinations.map((destination) => ({
      user_id: user.id,
      origin: d.homeAirport,
      destination,
      cabin: d.preferredCabin,
      flexible_days: d.flexibleDays,
      active: true,
    }))
  );
  if (alertsError) return NextResponse.json({ error: alertsError.message }, { status: 500 });

  return NextResponse.json({ ok: true, alertsCreated: d.dreamDestinations.length });
}
