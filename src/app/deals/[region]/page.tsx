import type { Metadata } from 'next';
import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/format';
import type { CabinClass } from '@/types/user';

export const revalidate = 900;

const CABIN_SLUGS: Record<string, CabinClass> = {
  economy: 'ECONOMY',
  'premium-economy': 'PREMIUM_ECONOMY',
  business: 'BUSINESS',
  first: 'FIRST',
};

function regionLabel(slug: string): string {
  return slug
    .split('-')
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: { params: { region: string } }): Promise<Metadata> {
  const label = regionLabel(params.region);
  return {
    title: `${label} Flight Deals | Off the Beaten Track`,
    description: `The latest ${label} flight deals we've discovered. Members see them first.`,
  };
}

export default async function DealsByRegionPage({ params }: { params: { region: string } }) {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const label = regionLabel(params.region);

  const { data: rules } = await service.from('deal_release_rules').select('*').eq('tier', viewer.tier).maybeSingle();
  const releaseDelayMinutes = rules?.release_delay_minutes ?? 1440;
  const cutoff = new Date(Date.now() - releaseDelayMinutes * 60000).toISOString();

  const cabin = CABIN_SLUGS[params.region.toLowerCase()];
  let query = service.from('deals').select('*').lte('discovered_at', cutoff).order('discovered_at', { ascending: false }).limit(30);

  if (cabin) {
    query = query.eq('cabin', cabin);
  } else {
    // Place-based slug: match against the deal's own region tag, or the
    // destination airport's city/country for deals recorded without one.
    const { data: matchingAirports } = await service
      .from('airports')
      .select('iata')
      .or(`city.ilike.${params.region.replace(/-/g, ' ')}%,country.ilike.${params.region.replace(/-/g, ' ')}%`);
    const codes = (matchingAirports ?? []).map((a) => a.iata);
    query =
      codes.length > 0
        ? query.or(`region.ilike.%${params.region.replace(/-/g, ' ')}%,destination.in.(${codes.join(',')})`)
        : query.ilike('region', `%${params.region.replace(/-/g, ' ')}%`);
  }

  const { data: deals } = await query;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold text-navy-950">{label} flight deals</h1>
      <p className="mt-1 text-sm text-slate-500">
        {viewer.tier === 'MEMBER'
          ? "You're seeing these the moment we find them."
          : `Members see deals immediately — your account sees them ${Math.round(releaseDelayMinutes / 60)}h later.`}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(deals ?? []).map((d) => (
          <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="font-semibold text-navy-950">{d.route}</p>
            <p className="mt-1 text-xl font-bold text-navy-950">{formatMoney(d.member_price ?? d.public_price, 'AUD')}</p>
            {d.discount_percentage && (
              <p className="text-sm font-semibold text-member-600">{Math.round(d.discount_percentage)}% below historical average</p>
            )}
            <p className="mt-2 text-xs text-slate-400">{new Date(d.discovered_at).toLocaleDateString()}</p>
          </div>
        ))}
        {(!deals || deals.length === 0) && (
          <p className="col-span-full text-slate-500">No {label.toLowerCase()} deals released to your tier yet — check back soon.</p>
        )}
      </div>
    </main>
  );
}
