'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CabinClass } from '@/types/user';
import { AirportAutocomplete } from './AirportAutocomplete';

const CABINS: { value: CabinClass; label: string }[] = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
];

function defaultDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

export function SearchWidget() {
  const router = useRouter();
  const [origin, setOrigin] = useState('MEL');
  const [destination, setDestination] = useState('MNL');
  const [departureDate, setDepartureDate] = useState(defaultDate(30));
  const [returnDate, setReturnDate] = useState(defaultDate(44));
  const [cabin, setCabin] = useState<CabinClass>('ECONOMY');
  const [passengers, setPassengers] = useState(1);
  const [includeNearbyAirports, setIncludeNearbyAirports] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[A-Za-z]{3}$/.test(origin) || !/^[A-Za-z]{3}$/.test(destination)) {
      setError('Pick an airport from the dropdown for both From and To.');
      return;
    }
    setError(null);
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate,
      returnDate,
      cabin,
      passengers: String(passengers),
      includeNearbyAirports: String(includeNearbyAirports),
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-6 lg:items-end lg:p-5"
    >
      <AirportAutocomplete label="From" value={origin} onChange={setOrigin} placeholder="City or airport" />
      <AirportAutocomplete label="To" value={destination} onChange={setDestination} placeholder="City or airport" />
      <Field label="Departure">
        <input
          type="date"
          value={departureDate}
          onChange={(e) => setDepartureDate(e.target.value)}
          required
          className="input"
        />
      </Field>
      <Field label="Return">
        <input
          type="date"
          value={returnDate}
          onChange={(e) => setReturnDate(e.target.value)}
          className="input"
        />
      </Field>
      <Field label="Cabin">
        <select value={cabin} onChange={(e) => setCabin(e.target.value as CabinClass)} className="input">
          {CABINS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex gap-2 lg:flex-col">
        <Field label="Passengers">
          <input
            type="number"
            min={1}
            max={9}
            value={passengers}
            onChange={(e) => setPassengers(Number(e.target.value))}
            className="input"
          />
        </Field>
      </div>
      <label className="col-span-full flex items-center gap-2 text-xs text-navy-700 lg:col-span-2">
        <input
          type="checkbox"
          checked={includeNearbyAirports}
          onChange={(e) => setIncludeNearbyAirports(e.target.checked)}
        />
        Also check nearby airports
      </label>
      {error && <p className="col-span-full text-xs font-medium text-red-600">{error}</p>}
      <button
        type="submit"
        className="col-span-full rounded-xl bg-accent-500 px-6 py-3 font-semibold text-white transition hover:bg-accent-600 lg:col-span-1"
      >
        Search flights
      </button>
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          padding: 0.6rem 0.9rem;
        }
        :global(.input:focus) {
          outline: none;
          border-color: #ff6b4a;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-navy-700">{label}</span>
      {children}
    </label>
  );
}
