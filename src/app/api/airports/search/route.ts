import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

/** Airport autocomplete, backed by the full world-airports table (section: "every airport"). */
export async function GET(request: NextRequest) {
  const q = new URL(request.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ airports: [] });

  const service = createSupabaseServiceClient();
  const isCodeQuery = /^[A-Za-z]{2,3}$/.test(q);

  const query = service.from('airports').select('iata, name, city, country').limit(8);

  const { data, error } = isCodeQuery
    ? await query.ilike('iata', `${q}%`)
    : await query.or(`city.ilike.%${q}%,name.ilike.%${q}%,country.ilike.%${q}%,iata.ilike.${q}%`);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Exact/prefix IATA matches first, then alphabetical by city.
  const sorted = (data ?? []).sort((a, b) => {
    const aExact = a.iata.toUpperCase() === q.toUpperCase() ? 0 : 1;
    const bExact = b.iata.toUpperCase() === q.toUpperCase() ? 0 : 1;
    if (aExact !== bExact) return aExact - bExact;
    return a.city.localeCompare(b.city);
  });

  return NextResponse.json({ airports: sorted });
}
