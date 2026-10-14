import { formatMoney, formatDuration, formatTime } from '@/lib/format';

interface RouteLeg {
  airline: string;
  origin: string;
  destination: string;
  departureAt: string;
  arrivalAt: string;
  cabin: string;
  bookingUrl: string;
}

export interface ShapedItinerary {
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

export function PlannerItineraryCard({ title, itinerary }: { title: string; itinerary: ShapedItinerary }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-600">{title}</p>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
          Self-transfer via {itinerary.hub}
        </span>
        <div className="text-right">
          {itinerary.totalMemberPrice != null ? (
            <p className="font-bold text-navy-950">{formatMoney(itinerary.totalMemberPrice, itinerary.currency)}</p>
          ) : itinerary.lockedSaving ? (
            <p className="text-xs text-member-600">Members save {formatMoney(itinerary.lockedSaving.saving, itinerary.currency)}</p>
          ) : null}
          <p className={itinerary.totalMemberPrice != null ? 'text-xs text-slate-500 line-through' : 'font-bold text-navy-950'}>
            {formatMoney(itinerary.totalPublicPrice, itinerary.currency)}
          </p>
        </div>
      </div>

      <Leg leg={itinerary.leg1} />
      <p className="my-1 pl-2 text-xs text-slate-500">
        {itinerary.overnightLayover ? 'Overnight layover' : `${formatDuration(itinerary.layoverMinutes)} layover`} in{' '}
        {itinerary.hub} — two separate bookings, baggage re-check required.
      </p>
      <Leg leg={itinerary.leg2} />

      <p className="mt-2 text-xs text-slate-500">Total flying time {formatDuration(itinerary.totalDurationMinutes)}</p>
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
