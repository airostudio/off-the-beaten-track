'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddProductForm() {
  const router = useRouter();
  const [category, setCategory] = useState<'hotel' | 'car_rental' | 'insurance'>('hotel');
  const [name, setName] = useState('');
  const [partner, setPartner] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [publicPrice, setPublicPrice] = useState('');
  const [memberPrice, setMemberPrice] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    setError(null);
    const res = await fetch('/api/admin/travel-products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        name,
        partner,
        affiliateUrl,
        destinationCity: destinationCity || undefined,
        publicPrice: publicPrice || undefined,
        memberPrice: memberPrice || undefined,
      }),
    });
    const json = await res.json();
    if (!res.ok) {
      setStatus('error');
      setError(json.error ?? 'Failed to save');
      return;
    }
    setName('');
    setPartner('');
    setAffiliateUrl('');
    setDestinationCity('');
    setPublicPrice('');
    setMemberPrice('');
    setStatus('idle');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mb-6 grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-3">
      <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm">
        <option value="hotel">Hotel</option>
        <option value="car_rental">Car rental</option>
        <option value="insurance">Insurance</option>
      </select>
      <input required placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm" />
      <input required placeholder="Partner" value={partner} onChange={(e) => setPartner(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm" />
      <input required placeholder="Affiliate URL" value={affiliateUrl} onChange={(e) => setAffiliateUrl(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm sm:col-span-2" />
      <input placeholder="Destination city" value={destinationCity} onChange={(e) => setDestinationCity(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm" />
      <input placeholder="Public price ($)" type="number" step="0.01" value={publicPrice} onChange={(e) => setPublicPrice(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm" />
      <input placeholder="Member price ($, genuine only)" type="number" step="0.01" value={memberPrice} onChange={(e) => setMemberPrice(e.target.value)} className="rounded-md border border-slate-200 px-2 py-1.5 text-sm" />
      <button type="submit" disabled={status === 'saving'} className="rounded-md bg-navy-950 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-3">
        {status === 'saving' ? 'Adding…' : 'Add product'}
      </button>
      {error && <p className="text-xs text-red-600 sm:col-span-3">{error}</p>}
    </form>
  );
}
