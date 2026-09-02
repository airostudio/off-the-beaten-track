'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { ClientFlightOffer } from '@/types/flight';
import { FlightCard } from '@/components/results/FlightCard';
import { CreateAlertButton } from '@/components/alerts/CreateAlertButton';
import { FareHistory } from '@/components/results/FareHistory';
import { FareCalendar } from '@/components/results/FareCalendar';
import { AlternativeRoutes } from '@/components/results/AlternativeRoutes';
import type { CabinClass } from '@/types/user';

interface SearchResponse {
  tier: 'GUEST' | 'FREE' | 'MEMBER';
  offers: ClientFlightOffer[];
  membershipPitch: string | null;
  cacheFallback?: boolean;
  error?: string;
  message?: string;
}

export function SearchResults() {
  const params = useSearchParams();
  const [data, setData] = useState<SearchResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const origin = params.get('origin');
    const destination = params.get('destination');
    const departureDate = params.get('departureDate');
    if (!origin || !destination || !departureDate) {
      setStatus('error');
      setErrorMessage('Missing search parameters.');
      return;
    }

    setStatus('loading');
    fetch('/api/flights/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        departureDate,
        returnDate: params.get('returnDate') || undefined,
        cabin: params.get('cabin') || 'ECONOMY',
        passengers: Number(params.get('passengers') || 1),
        includeNearbyAirports: params.get('includeNearbyAirports') === 'true',
      }),
    })
      .then(async (res) => {
        const json = await res.json();
        if (!res.ok) throw new Error(json.message ?? json.error ?? 'Search failed');
        return json as SearchResponse;
      })
      .then((json) => {
        setData(json);
        setStatus('ready');
      })
      .catch((err) => {
        setErrorMessage(err.message);
        setStatus('error');
      });
  }, [params]);

  if (status === 'loading') {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200/60" />
        ))}
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        {errorMessage ?? 'Something went wrong.'}
      </div>
    );
  }

  if (!data || data.offers.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-500">
        No fares found for this route yet. Try adjusting your dates.
      </div>
    );
  }

  const cheapest = Math.min(...data.offers.map((o) => (o.memberPrice ?? o.publicPrice) / 100));

  return (
    <div>
      {data.cacheFallback && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-800">
          <p className="font-semibold">Live fares are temporarily unavailable.</p>
          <p className="text-sm">
            We're showing our most recently checked prices for this route — each one is clearly timestamped
            below. Try again shortly for live pricing.
          </p>
        </div>
      )}

      {data.membershipPitch && (
        <div className="mb-6 rounded-2xl bg-navy-950 p-5 text-white">
          <p className="font-semibold">{data.membershipPitch}</p>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">{data.offers.length} fares found</p>
        <CreateAlertButton
          origin={params.get('origin')!}
          destination={params.get('destination')!}
          cabin={(params.get('cabin') as CabinClass) || 'ECONOMY'}
          suggestedMaxPrice={cheapest}
        />
      </div>

      <FareCalendar
        origin={params.get('origin')!}
        destination={params.get('destination')!}
        centerDate={params.get('departureDate')!}
        cabin={(params.get('cabin') as CabinClass) || 'ECONOMY'}
      />

      <div className="mb-6">
        <FareHistory origin={params.get('origin')!} destination={params.get('destination')!} />
      </div>

      <div className="mb-2 flex flex-wrap">
        <AlternativeRoutes
          origin={params.get('origin')!}
          destination={params.get('destination')!}
          departureDate={params.get('departureDate')!}
          cabin={(params.get('cabin') as CabinClass) || 'ECONOMY'}
          passengers={Number(params.get('passengers') || 1)}
          mode="alternative"
          title="Show alternative routes"
          description="Same cabin, routed via a transit hub — sometimes cheaper than flying direct. Each is two separate bookings; baggage must be re-checked."
        />
        <AlternativeRoutes
          origin={params.get('origin')!}
          destination={params.get('destination')!}
          departureDate={params.get('departureDate')!}
          cabin={(params.get('cabin') as CabinClass) || 'ECONOMY'}
          passengers={Number(params.get('passengers') || 1)}
          mode="mixed-cabin"
          title="Show Smart Mixed Cabin"
          description="Premium Economy only on the leg that's actually long-haul — Economy on the rest. Based on your travel preferences, or a 6-hour default."
        />
      </div>

      <div className="space-y-4">
        {data.offers.map((offer) => (
          <FlightCard key={offer.id} offer={offer} />
        ))}
      </div>
    </div>
  );
}
