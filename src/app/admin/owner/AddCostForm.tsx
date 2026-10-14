'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function AddCostForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('hosting');
  const [amount, setAmount] = useState('');
  const [recurring, setRecurring] = useState(true);
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    const res = await fetch('/api/admin/costs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category, amount, recurring }),
    });
    if (!res.ok) {
      setStatus('error');
      return;
    }
    setName('');
    setAmount('');
    setStatus('idle');
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-5">
      <input required placeholder="Cost name (e.g. Vercel Pro)" value={name} onChange={(e) => setName(e.target.value)} className="input sm:col-span-2" />
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
        <option value="hosting">Hosting</option>
        <option value="api">API / data</option>
        <option value="tooling">Tooling</option>
        <option value="marketing">Marketing</option>
        <option value="payroll">Payroll</option>
        <option value="other">Other</option>
      </select>
      <input required type="number" step="0.01" placeholder="Amount ($)" value={amount} onChange={(e) => setAmount(e.target.value)} className="input" />
      <label className="flex items-center gap-2 text-sm text-navy-700">
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />
        Monthly
      </label>
      <button type="submit" disabled={status === 'saving'} className="rounded-md bg-navy-950 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-60 sm:col-span-5">
        {status === 'saving' ? 'Adding…' : 'Add cost'}
      </button>
      {status === 'error' && <p className="text-xs text-red-600 sm:col-span-5">Failed to add — try again.</p>}
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
