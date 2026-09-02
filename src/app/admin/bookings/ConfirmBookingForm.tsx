'use client';

import { useState } from 'react';

export function ConfirmBookingForm({ affiliateClickId }: { affiliateClickId: string }) {
  const [amount, setAmount] = useState('');
  const [commission, setCommission] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    const res = await fetch('/api/admin/bookings/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ affiliateClickId, amount, commission }),
    });
    setStatus(res.ok ? 'done' : 'error');
  }

  if (status === 'done') {
    return <p className="text-xs font-semibold text-member-600">Confirmed — member reward credited.</p>;
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        step="0.01"
        placeholder="Amount ($)"
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-28 rounded-md border border-slate-200 px-2 py-1 text-xs"
      />
      <input
        type="number"
        step="0.01"
        placeholder="Commission ($)"
        required
        value={commission}
        onChange={(e) => setCommission(e.target.value)}
        className="w-32 rounded-md border border-slate-200 px-2 py-1 text-xs"
      />
      <button
        type="submit"
        disabled={status === 'saving'}
        className="rounded-md bg-navy-950 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
      >
        {status === 'saving' ? 'Confirming…' : 'Confirm booking'}
      </button>
      {status === 'error' && <span className="text-xs text-red-600">Failed — try again.</span>}
    </form>
  );
}
