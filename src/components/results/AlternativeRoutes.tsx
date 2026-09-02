'use client';

import { useEffect, useState } from 'react';
import { formatMoney, formatDuration, formatTime } from '@/lib/format';
import type { CabinClass } from '@/types/user';

interface RouteLeg {
  airline: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  cabin: string;
  bookingUrl: string;
}

interface Itinerary {
  hub: string;
  totalPublicPrice: number;
  totalMemberPrice: number | null;
  lockedSaving?: { saving: number; savingPercentage: number };
  totalDurationMinutes: number;
  layoverMinutes: number;
  overnightLayover: boolean;
  currency: string;
  leg1: RouteLeg;
  leg2: RouteLeg;
}

export function AlternativeRoutes({
  origin,
  destination,
  departureDate,
  cabin,
  passengers,
  mode,
  title,
  description,
}: {
  origin: string;
  destination: string;
  departureDate: string;
  cabin: CabinClass;
  passengers: number;
  mode: 'alternative' | 'mixed-cabin';
  title: string;
  description: string;
}) {
  const [itineraries, setItineraries] = useState<Itinerary[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open || itineraries !== null) return;
    setLoading(true);
    fetch('/api/flights/routes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin, destination, departureDate, cabin, passengers, mode }),
    })
      .then((r) => r.json())
      .then((json) => setItineraries(json.itineraries ?? []))
      .catch(() => setItineraries([]))
      .finally(() => setLoading(false));
  }, [open, itineraries, origin, destination, departureDate, cabin, passengers, mode]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mb-3 mr-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-700 transition hover:border-navy-950"
      >
        {title}
      </button>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mb-3 text-xs text-slate-500">{description}</p>

      {loading && <div className="h-20 animate-pulse rounded-lg bg-slate-100" />}

      {!loading && itineraries && itineraries.length === 0 && (
        <p className="text-sm text-slate-500">No feasible combinations found via our transit hubs right now.</p>
      )}

      {!loading &&
        itineraries?.map((it) => (
          <div key={it.hub} className="mb-3 rounded-xl border border-amber-200 bg-amber-50/60 p-3 last:mb-0">
            <div className="mb-2 flex items-center justify-between">
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                Self-transfer via {it.hub}
              </span>
              <div className="text-right">
                {it.totalMemberPrice != null ? (
                  <p className="font-bold text-navy-950">{formatMoney(it.totalMemberPrice, it.currency)}</p>
                ) : it.lockedSaving ? (
                  <p className="text-xs text-member-600">
                    Members save {formatMoney(it.lockedSaving.saving, it.currency)}
                  </p>
                ) : null}
                <p className={it.totalMemberPrice != null ? 'text-xs text-slate-500 line-through' : 'font-bold text-navy-950'}>
                  {formatMoney(it.totalPublicPrice, it.currency)}
                </p>
              </div>
            </div>

            <Leg leg={it.leg1} />
            <p className="my-1 pl-2 text-xs text-slate-500">
              {it.overnightLayover ? 'Overnight layover' : `${formatDuration(it.layoverMinutes)} layover`} in {it.hub} —
              you'll collect and re-check baggage between these two separate bookings.
            </p>
            <Leg leg={it.leg2} />

            <p className="mt-2 text-xs text-slate-500">
              Total flying time {formatDuration(it.totalDurationMinutes)} · booked as two separate tickets
            </p>
          </div>
        ))}
    </div>
  );
}

function Leg({ leg }: { leg: RouteLeg }) {
  return (
    <div className="flex items-center justify-between pl-2 text-sm">
      <span className="text-navy-900">
        {leg.origin} {formatTime(leg.departureAt)} → {leg.destination} {formatTime(leg.arrivalAt)}
      </span>
      <span className="text-xs text-slate-500">
        {leg.airline} · {leg.cabin.replace('_', ' ')}
      </span>
    </div>
  );
}
