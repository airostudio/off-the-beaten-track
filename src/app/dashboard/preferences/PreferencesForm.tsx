'use client';

import { useState } from 'react';
import type { TravelPreferences } from '@/types/user';

export function PreferencesForm({ initial }: { initial: Partial<TravelPreferences> | null }) {
  const [homeAirport, setHomeAirport] = useState(initial?.homeAirport ?? '');
  const [preferredCabin, setPreferredCabin] = useState(initial?.preferredCabin ?? 'ECONOMY');
  const [longHaulCabin, setLongHaulCabin] = useState(initial?.longHaulCabin ?? 'PREMIUM_ECONOMY');
  const [longHaulThresholdHours, setLongHaulThresholdHours] = useState(initial?.longHaulThresholdHours ?? 6);
  const [maxStops, setMaxStops] = useState(initial?.maxStops ?? 1);
  const [minConnectionMinutes, setMinConnectionMinutes] = useState(initial?.minConnectionMinutes ?? 90);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('saving');
    const res = await fetch('/api/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeAirport,
        preferredCabin,
        longHaulCabin,
        longHaulThresholdHours,
        maxStops,
        minConnectionMinutes,
      }),
    });
    setStatus(res.ok ? 'saved' : 'error');
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
      <Field label="Home airport">
        <input
          value={homeAirport}
          onChange={(e) => setHomeAirport(e.target.value.toUpperCase().slice(0, 3))}
          maxLength={3}
          className="input"
        />
      </Field>
      <Field label="Preferred cabin">
        <select value={preferredCabin} onChange={(e) => setPreferredCabin(e.target.value as any)} className="input">
          <option value="ECONOMY">Economy</option>
          <option value="PREMIUM_ECONOMY">Premium Economy</option>
          <option value="BUSINESS">Business</option>
          <option value="FIRST">First</option>
        </select>
      </Field>
      <Field label="Long-haul cabin (Smart Mixed Cabin)">
        <select value={longHaulCabin} onChange={(e) => setLongHaulCabin(e.target.value as any)} className="input">
          <option value="ECONOMY">Economy</option>
          <option value="PREMIUM_ECONOMY">Premium Economy</option>
          <option value="BUSINESS">Business</option>
        </select>
      </Field>
      <Field label="Long-haul threshold (hours)">
        <input
          type="number"
          min={1}
          max={20}
          value={longHaulThresholdHours}
          onChange={(e) => setLongHaulThresholdHours(Number(e.target.value))}
          className="input"
        />
      </Field>
      <Field label="Max stops">
        <input
          type="number"
          min={0}
          max={3}
          value={maxStops}
          onChange={(e) => setMaxStops(Number(e.target.value))}
          className="input"
        />
      </Field>
      <Field label="Minimum connection (minutes)">
        <input
          type="number"
          min={20}
          max={600}
          value={minConnectionMinutes}
          onChange={(e) => setMinConnectionMinutes(Number(e.target.value))}
          className="input"
        />
      </Field>
      <button
        type="submit"
        disabled={status === 'saving'}
        className="w-full rounded-xl bg-navy-950 px-4 py-2.5 font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
      >
        {status === 'saving' ? 'Saving…' : 'Save preferences'}
      </button>
      {status === 'saved' && <p className="text-sm text-member-600">Saved.</p>}
      {status === 'error' && <p className="text-sm text-red-600">Could not save. Try again.</p>}
      <style jsx>{`
        :global(.input) {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.9rem;
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
