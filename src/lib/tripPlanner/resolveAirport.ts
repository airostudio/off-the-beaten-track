import { createSupabaseServiceClient } from '@/lib/supabase/server';

/**
 * Common country → primary gateway airport, so "Philippines" resolves to
 * Manila rather than an arbitrary DB match. Falls back to a direct
 * city/name/country search against the full world-airports table for
 * anything not in this shortlist.
 */
const COUNTRY_PRIMARY_AIRPORT: Record<string, string> = {
  philippines: 'MNL',
  thailand: 'BKK',
  indonesia: 'CGK',
  bali: 'DPS',
  vietnam: 'SGN',
  japan: 'NRT',
  singapore: 'SIN',
  malaysia: 'KUL',
  australia: 'MEL',
  'new zealand': 'AKL',
  fiji: 'NAN',
  usa: 'LAX',
  'united states': 'LAX',
  uk: 'LHR',
  'united kingdom': 'LHR',
  france: 'CDG',
  'hong kong': 'HKG',
  china: 'PEK',
  india: 'DEL',
  'south korea': 'ICN',
  korea: 'ICN',
};

export interface ResolvedAirport {
  code: string;
  label: string; // "City, Country"
}

export async function resolveAirport(query: string | null): Promise<ResolvedAirport | null> {
  if (!query) return null;
  const cleaned = query.trim().replace(/^(the|a)\s+/i, '');
  if (!cleaned) return null;

  const shortlisted = COUNTRY_PRIMARY_AIRPORT[cleaned.toLowerCase()];
  const service = createSupabaseServiceClient();

  if (shortlisted) {
    const { data } = await service.from('airports').select('iata, city, country').eq('iata', shortlisted).maybeSingle();
    if (data) return { code: data.iata, label: `${data.city}, ${data.country}` };
  }

  // Exact 3-letter IATA code typed directly.
  if (/^[a-zA-Z]{3}$/.test(cleaned)) {
    const { data } = await service.from('airports').select('iata, city, country').eq('iata', cleaned.toUpperCase()).maybeSingle();
    if (data) return { code: data.iata, label: `${data.city}, ${data.country}` };
  }

  const { data } = await service
    .from('airports')
    .select('iata, city, country, name')
    .or(`city.ilike.${cleaned}%,name.ilike.%${cleaned}%,country.ilike.${cleaned}%`)
    .limit(5);

  if (!data || data.length === 0) return null;

  // Prefer a match whose city name starts with the query, then the shortest
  // airport name (major "X International" hubs tend to be more concise than
  // regional airfields sharing the same city name).
  const best = [...data].sort((a, b) => {
    const aCityMatch = a.city.toLowerCase().startsWith(cleaned.toLowerCase()) ? 0 : 1;
    const bCityMatch = b.city.toLowerCase().startsWith(cleaned.toLowerCase()) ? 0 : 1;
    if (aCityMatch !== bCityMatch) return aCityMatch - bCityMatch;
    return a.name.length - b.name.length;
  })[0];

  return { code: best.iata, label: `${best.city}, ${best.country}` };
}
