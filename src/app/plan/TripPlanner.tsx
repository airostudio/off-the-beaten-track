'use client';

import { useState } from 'react';
import { FlightCard } from '@/components/results/FlightCard';
import { PlannerItineraryCard, type ShapedItinerary } from './PlannerItineraryCard';
import type { ClientFlightOffer } from '@/types/flight';
import type { CabinClass } from '@/types/user';

interface ResolvedAirport {
  code: string;
  label: string;
}

interface ParsedIntent {
  originQuery: string | null;
  destinationQuery: string | null;
  departureDate: string;
  returnDate: string | null;
  passengers: number;
  cabin: CabinClass;
  longHaulCabin: CabinClass;
  longHaulThresholdHours: number;
  maxStops: number | null;
  notes: string[];
}

interface RunResult {
  bestValue: ClientFlightOffer | null;
  cheapest: ClientFlightOffer | null;
  fastest: ClientFlightOffer | null;
  bestMemberDeal: ClientFlightOffer | null;
  smartRoute: ShapedItinerary | null;
  mostComfortable: ShapedItinerary | null;
}

const EXAMPLE = 'Find me the cheapest way for two people to travel from Melbourne to the Philippines for a month next June. Premium Economy on anything over six hours, Economy otherwise, and I don\'t mind stopping in Singapore, Bangkok or Kuala Lumpur.';

export default function TripPlanner() {
  const [query, setQuery] = useState('');
  const [parsing, setParsing] = useState(false);
  const [intent, setIntent] = useState<ParsedIntent | null>(null);
  const [origin, setOrigin] = useState<ResolvedAirport | null>(null);
  const [destination, setDestination] = useState<ResolvedAirport | null>(null);
  const [usedClaude, setUsedClaude] = useState(false);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleParse(e: React.FormEvent) {
    e.preventDefault();
    setParsing(true);
    setError(null);
    setResult(null);
    const res = await fetch('/api/trip-planner/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });
    const json = await res.json();
    setParsing(false);
    if (!res.ok) {
      setError(json.error ?? 'Could not understand that trip — try rephrasing.');
      return;
    }
    setIntent(json.intent);
    setOrigin(json.origin);
    setDestination(json.destination);
    setUsedClaude(json.usedClaude);
  }

  async function handleRun() {
    if (!intent || !origin || !destination) return;
    setRunning(true);
    setError(null);
    const res = await fetch('/api/trip-planner/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: origin.code,
        destination: destination.code,
        departureDate: intent.departureDate,
        passengers: intent.passengers,
        cabin: intent.cabin,
        longHaulCabin: intent.longHaulCabin,
        longHaulThresholdHours: intent.longHaulThresholdHours,
      }),
    });
    const json = await res.json();
    setRunning(false);
    if (!res.ok) {
      setError(json.message ?? json.error ?? 'Search failed — try again.');
      return;
    }
    setResult(json);
  }

  return (
    <div>
      <form onSubmit={handleParse} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
        <label className="mb-1 block text-sm font-semibold text-navy-900">Tell us about your trip</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={3}
          placeholder={EXAMPLE}
          className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-accent-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={parsing || query.trim().length < 3}
          className="mt-3 rounded-xl bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
        >
          {parsing ? 'Reading your trip…' : 'Plan my trip'}
        </button>
        {usedClaude === false && intent && (
          <p className="mt-2 text-xs text-slate-400">Parsed with our built-in extractor (no AI key configured).</p>
        )}
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {intent && (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-navy-950">Here's what we understood — check it before we search:</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="From">
              <input
                value={origin?.code ?? ''}
                onChange={(e) => setOrigin({ code: e.target.value.toUpperCase(), label: origin?.label ?? '' })}
                placeholder="Airport code, e.g. MEL"
                className="input"
              />
              {origin && <p className="mt-1 text-xs text-slate-500">{origin.label}</p>}
            </Field>
            <Field label="To">
              <input
                value={destination?.code ?? ''}
                onChange={(e) => setDestination({ code: e.target.value.toUpperCase(), label: destination?.label ?? '' })}
                placeholder="Airport code, e.g. MNL"
                className="input"
              />
              {destination && <p className="mt-1 text-xs text-slate-500">{destination.label}</p>}
            </Field>
            <Field label="Departure date">
              <input
                type="date"
                value={intent.departureDate}
                onChange={(e) => setIntent({ ...intent, departureDate: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Passengers">
              <input
                type="number"
                min={1}
                max={9}
                value={intent.passengers}
                onChange={(e) => setIntent({ ...intent, passengers: Number(e.target.value) })}
                className="input"
              />
            </Field>
            <Field label="Cabin">
              <select value={intent.cabin} onChange={(e) => setIntent({ ...intent, cabin: e.target.value as CabinClass })} className="input">
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
                <option value="FIRST">First</option>
              </select>
            </Field>
            <Field label="Long-haul cabin (Smart Mixed Cabin)">
              <select
                value={intent.longHaulCabin}
                onChange={(e) => setIntent({ ...intent, longHaulCabin: e.target.value as CabinClass })}
                className="input"
              >
                <option value="ECONOMY">Economy</option>
                <option value="PREMIUM_ECONOMY">Premium Economy</option>
                <option value="BUSINESS">Business</option>
              </select>
            </Field>
          </div>

          {intent.notes.length > 0 && (
            <ul className="mt-3 list-inside list-disc text-xs text-amber-700">
              {intent.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          )}

          <button
            onClick={handleRun}
            disabled={running || !origin?.code || !destination?.code}
            className="mt-4 rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
          >
            {running ? 'Searching thousands of combinations…' : 'Search'}
          </button>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          {result.bestValue && <ResultSection title="Best value" offer={result.bestValue} />}
          {result.cheapest && <ResultSection title="Cheapest" offer={result.cheapest} />}
          {result.fastest && <ResultSection title="Fastest" offer={result.fastest} />}
          {result.bestMemberDeal && <ResultSection title="Best member deal" offer={result.bestMemberDeal} />}
          {result.mostComfortable && <PlannerItineraryCard title="Most comfortable (Smart Mixed Cabin)" itinerary={result.mostComfortable} />}
          {result.smartRoute && <PlannerItineraryCard title="Smart route" itinerary={result.smartRoute} />}
          {!result.bestValue && !result.smartRoute && !result.mostComfortable && (
            <p className="text-sm text-slate-500">No combinations found for this route yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function ResultSection({ title, offer }: { title: string; offer: ClientFlightOffer }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-accent-600">{title}</p>
      <FlightCard offer={offer} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-navy-700">{label}</span>
      {children}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
        }
      `}</style>
    </label>
  );
}
