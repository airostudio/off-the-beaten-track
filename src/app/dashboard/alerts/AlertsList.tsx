'use client';

import { useState } from 'react';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { formatMoney } from '@/lib/format';

interface Alert {
  id: string;
  origin: string;
  destination: string;
  max_price: number | null;
  cabin: string;
  flexible_days: number;
  active: boolean;
}

export function AlertsList({ initial }: { initial: Alert[] }) {
  const [alerts, setAlerts] = useState(initial);

  async function toggle(id: string, active: boolean) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, active } : a)));
    await fetch(`/api/alerts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active }),
    });
  }

  async function remove(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
  }

  if (alerts.length === 0) {
    return (
      <EmptyState
        title="No fare alerts yet"
        body="Create an alert from a search results page to get notified when a route drops below your target price."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {alerts.map((a) => (
        <li key={a.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
          <div>
            <p className="font-semibold text-navy-950">
              {a.origin} → {a.destination}
            </p>
            <p className="text-sm text-slate-500">
              {a.max_price ? `Below ${formatMoney(a.max_price, 'AUD')}` : 'Any price'} · {a.cabin.replace('_', ' ')}
              {a.flexible_days ? ` · ±${a.flexible_days} days` : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-500">
              <input type="checkbox" checked={a.active} onChange={(e) => toggle(a.id, e.target.checked)} />
              Active
            </label>
            <button onClick={() => remove(a.id)} className="text-xs font-semibold text-red-600 hover:underline">
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
