'use client';

import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/format';

interface HistoryResponse {
  hasData: boolean;
  current?: number;
  low?: number;
  high?: number;
  average?: number;
  series?: { date: string; price: number }[];
  observations?: number;
}

export function FareHistory({ origin, destination }: { origin: string; destination: string }) {
  const [data, setData] = useState<HistoryResponse | null>(null);

  useEffect(() => {
    setData(null);
    fetch(`/api/flights/history?origin=${origin}&destination=${destination}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ hasData: false }));
  }, [origin, destination]);

  if (!data) return null;

  if (!data.hasData) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        We're still building price history for {origin} → {destination}. Check back after a few more
        searches.
      </div>
    );
  }

  const { current = 0, low = 0, high = 0, average = 0, series = [] } = data;
  const max = Math.max(...series.map((s) => s.price), 1);
  const min = Math.min(...series.map((s) => s.price));
  const range = Math.max(max - min, 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        30-day fare history · {origin} → {destination}
      </p>

      {series.length > 1 && (
        <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="mb-3 h-12 w-full text-accent-500">
          <polyline
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            points={series
              .map((s, i) => {
                const x = (i / (series.length - 1)) * 100;
                const y = 30 - ((s.price - min) / range) * 28 - 1;
                return `${x},${y}`;
              })
              .join(' ')}
          />
        </svg>
      )}

      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <Stat label="Current" value={current} highlight />
        <Stat label="30-day low" value={low} />
        <Stat label="30-day high" value={high} />
        <Stat label="Average" value={average} />
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div>
      <p className="text-slate-400">{label}</p>
      <p className={`font-semibold ${highlight ? 'text-navy-950' : 'text-slate-600'}`}>
        {formatMoney(value, 'AUD')}
      </p>
    </div>
  );
}
