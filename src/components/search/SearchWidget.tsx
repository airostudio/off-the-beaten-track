'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { CabinClass } from '@/types/user';

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      origin,
      destination,
      departureDate,
      returnDate,
      cabin,
      passengers: String(passengers),
    });
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-card sm:grid-cols-2 lg:grid-cols-6 lg:items-end lg:p-5"
    >
      <Field label="From">
        <input
          value={origin}
          onChange={(e) => setOrigin(e.target.value.toUpperCase().slice(0, 3))}
          maxLength={3}
          required
          className="input"
          placeholder="MEL"
        />
      </Field>
      <Field label="To">
        <input
          value={destination}
          onChange={(e) => setDestination(e.target.value.toUpperCase().slice(0, 3))}
          maxLength={3}
          required
          className="input"
          placeholder="MNL"
        />
      </Field>
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
