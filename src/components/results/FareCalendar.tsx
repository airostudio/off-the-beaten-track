'use client';

import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/format';
import type { CabinClass } from '@/types/user';

interface CalendarDay {
  date: string;
  price: number | null;
  memberPrice: number | null;
}

interface CalendarResponse {
  days: CalendarDay[];
  cheapestDay: CalendarDay | null;
  savingVsSelected: number;
}

const RANGE_OPTIONS = [1, 3, 7] as const;

export function FareCalendar({
  origin,
  destination,
  centerDate,
  cabin,
}: {
  origin: string;
  destination: string;
  centerDate: string;
  cabin: CabinClass;
}) {
  const [range, setRange] = useState<1 | 3 | 7>(3);
  const [data, setData] = useState<CalendarResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/flights/calendar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, centerDate, cabin, rangeDays: range }),
    })
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, [open, origin, destination, centerDate, cabin, range]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-6 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:border-navy-950"
      >
        Show flexible dates
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Flexible dates</p>
        <div className="flex gap-1">
          {RANGE_OPTIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                range === r ? 'bg-navy-950 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              ±{r}d
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="h-16 animate-pulse rounded-lg bg-slate-100" />}

      {!loading && data && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {data.days.map((d) => {
              const price = d.memberPrice ?? d.price;
              const isCheapest = data.cheapestDay && d.date === data.cheapestDay.date;
              const isSelected = d.date === centerDate;
              return (
                <div
                  key={d.date}
                  className={`min-w-[84px] rounded-lg border p-2 text-center text-xs ${
                    isSelected
                      ? 'border-navy-950 bg-navy-950 text-white'
                      : isCheapest
                        ? 'border-member-500 bg-member-50'
                        : 'border-slate-200'
                  }`}
                >
                  <p className={isSelected ? 'text-slate-200' : 'text-slate-500'}>
                    {new Date(`${d.date}T00:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                  </p>
                  <p className="mt-1 font-semibold">{price != null ? formatMoney(price, 'AUD') : '—'}</p>
                  {isCheapest && !isSelected && <p className="mt-0.5 text-member-600">Cheapest</p>}
                </div>
              );
            })}
          </div>

          {data.savingVsSelected > 0 && data.cheapestDay && (
            <p className="mt-3 text-sm text-member-600">
              Save {formatMoney(data.savingVsSelected, 'AUD')} by flying on{' '}
              {new Date(`${data.cheapestDay.date}T00:00:00Z`).toLocaleDateString('en-AU', {
                day: 'numeric',
                month: 'long',
              })}{' '}
              instead.
            </p>
          )}
        </>
      )}
    </div>
  );
}
