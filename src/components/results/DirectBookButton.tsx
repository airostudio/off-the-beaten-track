'use client';

import { useState } from 'react';

export function DirectBookButton({ dbOfferId }: { dbOfferId: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setStatus('loading');
    setError(null);
    const res = await fetch('/api/bookings/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dbOfferId }),
    });

    if (res.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    const json = await res.json();
    if (!res.ok) {
      setStatus('error');
      setError(json.error ?? 'Could not start checkout');
      return;
    }

    window.location.href = json.url;
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={status === 'loading'}
        className="w-full rounded-lg border border-navy-950 px-4 py-2 text-center text-sm font-semibold text-navy-950 transition hover:bg-navy-950 hover:text-white disabled:opacity-60"
      >
        {status === 'loading' ? 'Starting checkout…' : 'Book directly'}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
