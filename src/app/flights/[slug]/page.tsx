import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { resolveRouteSlug, buildRouteSlug } from '@/lib/seo/routeSlug';
import { getRouteFareStats } from '@/lib/flights/fareStats';
import { formatMoney } from '@/lib/format';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

export const revalidate = 3600; // re-check fare stats hourly; never claim this is a live quote

/** Pre-renders the seeded popular routes for indexability; any other well-formed slug still resolves dynamically. */
export async function generateStaticParams() {
  const service = createSupabaseServiceClient();
  const { data: routes } = await service.from('routes').select('origin, destination').order('popularity', { ascending: false }).limit(20);
  const { data: airports } = await service.from('airports').select('iata, city');
  const cityByCode = new Map((airports ?? []).map((a) => [a.iata, a.city]));

  return (routes ?? [])
    .filter((r) => cityByCode.has(r.origin) && cityByCode.has(r.destination))
    .map((r) => ({ slug: buildRouteSlug(cityByCode.get(r.origin)!, cityByCode.get(r.destination)!) }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const resolved = await resolveRouteSlug(params.slug);
  if (!resolved) return {};

  const title = `${resolved.origin.label.split(',')[0]} to ${resolved.destination.label.split(',')[0]} Flights`;
  return {
    title: `${title} | Off the Beaten Track`,
    description: `Compare ${resolved.origin.code} to ${resolved.destination.code} flights. Members see the freshest fares and genuine member pricing first.`,
  };
}

export default async function FlightRoutePage({ params }: { params: { slug: string } }) {
  const resolved = await resolveRouteSlug(params.slug);
  if (!resolved) notFound();

  const { origin, destination } = resolved;
  const stats = await getRouteFareStats(origin.code, destination.code);

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 45);
  const defaultDateStr = defaultDate.toISOString().slice(0, 10);
  const searchUrl = `/search?origin=${origin.code}&destination=${destination.code}&departureDate=${defaultDateStr}&cabin=ECONOMY&passengers=1`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Flight',
    provider: { '@type': 'Organization', name: 'Off the Beaten Track' },
    departureAirport: { '@type': 'Airport', iataCode: origin.code, name: origin.label },
    arrivalAirport: { '@type': 'Airport', iataCode: destination.code, name: destination.label },
  };

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <p className="text-sm text-slate-500">
        {origin.label} → {destination.label}
      </p>
      <h1 className="mt-1 text-3xl font-bold text-navy-950">
        {origin.label.split(',')[0]} to {destination.label.split(',')[0]} flights
      </h1>
      <p className="mt-2 max-w-2xl text-slate-600">
        Compare {origin.code} → {destination.code} fares across airlines and route combinations. Members see
        the freshest deals and genuine member pricing first.
      </p>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Historical fare data (last 30 days)
        </p>
        {stats.hasData ? (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <Stat label="Most recent" value={stats.current!} />
              <Stat label="30-day low" value={stats.low!} />
              <Stat label="30-day high" value={stats.high!} />
              <Stat label="Average" value={stats.average!} />
            </div>
            <p className="mt-4 text-xs text-slate-400">
              Based on {stats.observations} real price {stats.observations === 1 ? 'check' : 'checks'} recorded
              from live searches — not a live quote. Search below for current pricing.
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-500">
            We don't have price history for this route yet — search below and we'll start tracking it.
          </p>
        )}
      </div>

      <Link
        href={searchUrl}
        className="mt-6 inline-block rounded-xl bg-accent-500 px-6 py-3 font-semibold text-white transition hover:bg-accent-600"
      >
        Search live {origin.code} → {destination.code} fares
      </Link>

      <p className="mt-8 text-xs text-slate-400">
        Fares shown on the search page are live provider results at the time of your search, not the
        historical figures above. Members save up to 35% on selected deals — see our membership page for
        details.
      </p>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-navy-950">{formatMoney(value, 'AUD')}</p>
    </div>
  );
}
