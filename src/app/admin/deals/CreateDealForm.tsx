'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateDealForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [airline, setAirline] = useState('');
  const [cabin, setCabin] = useState('ECONOMY');
  const [publicPrice, setPublicPrice] = useState('');
  const [memberPrice, setMemberPrice] = useState('');
  const [historicalAverage, setHistoricalAverage] = useState('');
  const [region, setRegion] = useState('');
  const [featured, setFeatured] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setError(null);
    const res = await fetch('/api/admin/deals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin,
        destination,
        airline: airline || undefined,
        cabin,
        publicPrice,
        memberPrice: memberPrice || undefined,
        historicalAverage: historicalAverage || undefined,
        region: region || undefined,
        featured,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus('error');
      setError(json.error ?? 'Failed to create deal');
      return;
    }
    setOrigin('');
    setDestination('');
    setAirline('');
    setPublicPrice('');
    setMemberPrice('');
    setHistoricalAverage('');
    setRegion('');
    setFeatured(false);
    setStatus('idle');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mb-6 grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
      <input required placeholder="Origin (MEL)" maxLength={3} value={origin} onChange={(e) => setOrigin(e.target.value.toUpperCase())} className="input" />
      <input required placeholder="Destination (MNL)" maxLength={3} value={destination} onChange={(e) => setDestination(e.target.value.toUpperCase())} className="input" />
      <input placeholder="Airline" value={airline} onChange={(e) => setAirline(e.target.value)} className="input" />
      <select value={cabin} onChange={(e) => setCabin(e.target.value)} className="input">
        <option value="ECONOMY">Economy</option>
        <option value="PREMIUM_ECONOMY">Premium Economy</option>
        <option value="BUSINESS">Business</option>
        <option value="FIRST">First</option>
      </select>
      <input required placeholder="Public price ($)" type="number" step="0.01" value={publicPrice} onChange={(e) => setPublicPrice(e.target.value)} className="input" />
      <input placeholder="Member price ($, genuine only)" type="number" step="0.01" value={memberPrice} onChange={(e) => setMemberPrice(e.target.value)} className="input" />
      <input placeholder="Historical average ($)" type="number" step="0.01" value={historicalAverage} onChange={(e) => setHistoricalAverage(e.target.value)} className="input" />
      <input placeholder="Region (e.g. Asia)" value={region} onChange={(e) => setRegion(e.target.value)} className="input" />
      <label className="flex items-center gap-2 text-sm text-navy-700">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
        Featured
      </label>
      <button type="submit" disabled={status === 'saving'} className="rounded-md bg-navy-950 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-3">
        {status === 'saving' ? 'Creating…' : 'Create deal'}
      </button>
      {error && <p className="text-xs text-red-600 sm:col-span-4">{error}</p>}
      <style jsx>{`
        :global(.input) {
          border-radius: 0.375rem;
          border: 1px solid #e2e8f0;
          padding: 0.375rem 0.5rem;
          font-size: 0.875rem;
        }
      `}</style>
    </form>
  );
}
