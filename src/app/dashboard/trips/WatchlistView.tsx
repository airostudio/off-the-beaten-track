'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { formatMoney } from '@/lib/format';

interface WatchedTrip {
  id: string;
  origin: string;
  destination: string;
  departure_date: string;
  return_date: string | null;
  cabin: string;
  price_when_watched: number;
  latest_price: number | null;
  currency: string;
}

export function WatchlistView({ initial }: { initial: WatchedTrip[] }) {
  const [trips, setTrips] = useState(initial);

  async function remove(id: string) {
    setTrips((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/watchlist/${id}`, { method: 'DELETE' });
  }

  if (trips.length === 0) {
    return (
      <EmptyState
        title="You're not watching any trips"
        body='Click "Watch this trip" on any search result to track its price here.'
      />
    );
  }

  return (
    <ul className="space-y-3">
      {trips.map((t) => {
        const current = t.latest_price ?? t.price_when_watched;
        const change = current - t.price_when_watched;
        return (
          <li key={t.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-navy-950">
                  {t.origin} → {t.destination}
                </p>
                <p className="text-sm text-slate-500">
                  {t.departure_date} · {t.cabin.replace('_', ' ')}
                </p>
              </div>
              <button onClick={() => remove(t.id)} className="text-xs font-semibold text-red-600 hover:underline">
                Stop watching
              </button>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-slate-400">When watched</p>
                <p className="font-semibold text-navy-950">{formatMoney(t.price_when_watched, t.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Current</p>
                <p className="font-semibold text-navy-950">{formatMoney(current, t.currency)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Change</p>
                <p className={`font-semibold ${change < 0 ? 'text-member-600' : change > 0 ? 'text-red-500' : 'text-slate-500'}`}>
                  {change === 0 ? '—' : `${change > 0 ? '+' : ''}${formatMoney(change, t.currency)}`}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
