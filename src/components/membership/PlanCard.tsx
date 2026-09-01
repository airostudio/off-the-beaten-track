'use client';

import { useState } from 'react';

export function PlanCard({
  name,
  price,
  currency,
  interval,
  priceId,
  features,
  highlighted,
}: {
  name: string;
  price: number;
  currency: string;
  interval: string;
  priceId: string;
  features: string[];
  highlighted?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        window.location.href = '/login?next=/membership';
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border p-6 shadow-card ${
        highlighted ? 'border-accent-500 bg-white ring-2 ring-accent-500' : 'border-slate-200 bg-white'
      }`}
    >
      <h3 className="text-lg font-semibold text-navy-950">{name}</h3>
      <p className="mt-2 text-3xl font-bold text-navy-950">
        {new Intl.NumberFormat('en-AU', { style: 'currency', currency }).format(price / 100)}
        <span className="text-sm font-normal text-slate-500">/{interval}</span>
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {features.map((f) => (
          <li key={f} className="flex gap-2">
            <span className="text-member-600">✓</span> {f}
          </li>
        ))}
      </ul>
      <button
        onClick={subscribe}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-navy-950 px-4 py-2.5 font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {loading ? 'Redirecting…' : 'Become a member'}
      </button>
    </div>
  );
}
