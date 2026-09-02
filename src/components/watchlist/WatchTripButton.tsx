'use client';

import { useState } from 'react';
import type { CabinClass } from '@/types/user';

export function WatchTripButton({
  origin,
  destination,
  departureDate,
  returnDate,
  cabin,
  priceWhenWatched,
  currency,
}: {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string | null;
  cabin: CabinClass;
  priceWhenWatched: number; // minor units
  currency: string;
}) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'watched' | 'error'>('idle');

  async function handleClick() {
    setStatus('saving');
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, departureDate, returnDate, cabin, priceWhenWatched, currency }),
    });
    if (res.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    setStatus(res.ok ? 'watched' : 'error');
  }

  if (status === 'watched') {
    return <p className="text-center text-xs font-semibold text-member-600">Watching this trip ✓</p>;
  }

  return (
    <button
      onClick={handleClick}
      disabled={status === 'saving'}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:border-navy-950 disabled:opacity-60"
    >
      {status === 'saving' ? 'Saving…' : status === 'error' ? 'Try again' : 'Watch this trip'}
    </button>
  );
}
