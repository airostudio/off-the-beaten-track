'use client';

import { useState } from 'react';
import type { CabinClass } from '@/types/user';

export function CreateAlertButton({
  origin,
  destination,
  cabin,
  suggestedMaxPrice,
}: {
  origin: string;
  destination: string;
  cabin: CabinClass;
  suggestedMaxPrice?: number; // dollars, not cents
}) {
  const [open, setOpen] = useState(false);
  const [maxPrice, setMaxPrice] = useState(suggestedMaxPrice ? Math.round(suggestedMaxPrice) : '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setMessage(null);
    const res = await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, cabin, maxPrice: maxPrice ? Number(maxPrice) : undefined }),
    });
    const json = await res.json();
    if (res.status === 401) {
      window.location.href = `/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }
    if (!res.ok) {
      setStatus('error');
      setMessage(json.message ?? json.error ?? 'Could not create alert');
      return;
    }
    setStatus('saved');
    setMessage(`We'll watch ${origin} → ${destination} for you.`);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:border-navy-950"
      >
        Create fare alert
      </button>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-3 text-xs">
      <p className="mb-2 font-semibold text-navy-900">
        Alert me: {origin} → {destination}
      </p>
      <label className="mb-2 block">
        <span className="mb-1 block text-slate-500">Notify below (AUD, optional)</span>
        <input
          type="number"
          min={1}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value === '' ? '' : Number(e.target.value))}
          className="w-full rounded-md border border-slate-200 px-2 py-1"
          placeholder="e.g. 1000"
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="rounded-md bg-navy-950 px-3 py-1.5 font-semibold text-white disabled:opacity-60"
        >
          {status === 'saving' ? 'Saving…' : 'Save alert'}
        </button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-md px-3 py-1.5 text-slate-500">
          Cancel
        </button>
      </div>
      {message && (
        <p className={`mt-2 ${status === 'error' ? 'text-red-600' : 'text-member-600'}`}>{message}</p>
      )}
    </form>
  );
}
