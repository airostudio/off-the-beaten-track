'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AirportAutocomplete } from '@/components/search/AirportAutocomplete';
import type { CabinClass } from '@/types/user';

const STEPS = ['home', 'destinations', 'cabin', 'flexible', 'frequency'] as const;
type Step = (typeof STEPS)[number];

const CABINS: { value: CabinClass; label: string }[] = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First' },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const step: Step = STEPS[stepIndex];

  const [homeAirport, setHomeAirport] = useState('');
  const [dream1, setDream1] = useState('');
  const [dream2, setDream2] = useState('');
  const [dream3, setDream3] = useState('');
  const [preferredCabin, setPreferredCabin] = useState<CabinClass>('ECONOMY');
  const [flexible, setFlexible] = useState(true);
  const [flexibleDays, setFlexibleDays] = useState(3);
  const [tripsPerYear, setTripsPerYear] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dreamDestinations = [dream1, dream2, dream3].filter((d) => /^[A-Za-z]{3}$/.test(d));

  function canAdvance(): boolean {
    if (step === 'home') return /^[A-Za-z]{3}$/.test(homeAirport);
    if (step === 'destinations') return dreamDestinations.length > 0;
    return true;
  }

  function next() {
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
    else handleSubmit();
  }
  function back() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    const res = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        homeAirport,
        dreamDestinations,
        preferredCabin,
        flexibleDays: flexible ? flexibleDays : 0,
        tripsPerYear,
      }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? 'Something went wrong — try again.');
      setSubmitting(false);
      return;
    }
    router.push('/dashboard?onboarded=1');
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <div className="mb-6 flex gap-1.5">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= stepIndex ? 'bg-accent-500' : 'bg-slate-200'}`} />
        ))}
      </div>

      {step === 'home' && (
        <StepShell title="Where do you normally fly from?">
          <AirportAutocomplete label="Home airport" value={homeAirport} onChange={setHomeAirport} placeholder="City or airport" />
        </StepShell>
      )}

      {step === 'destinations' && (
        <StepShell title="Where would you love to visit?">
          <div className="space-y-3">
            <AirportAutocomplete label="Dream destination 1" value={dream1} onChange={setDream1} placeholder="City or airport" />
            <AirportAutocomplete label="Dream destination 2 (optional)" value={dream2} onChange={setDream2} placeholder="City or airport" />
            <AirportAutocomplete label="Dream destination 3 (optional)" value={dream3} onChange={setDream3} placeholder="City or airport" />
          </div>
        </StepShell>
      )}

      {step === 'cabin' && (
        <StepShell title="What's your typical cabin?">
          <div className="grid grid-cols-2 gap-2">
            {CABINS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setPreferredCabin(c.value)}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  preferredCabin === c.value ? 'border-navy-950 bg-navy-950 text-white' : 'border-slate-200 text-navy-700'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </StepShell>
      )}

      {step === 'flexible' && (
        <StepShell title="Are your travel dates flexible?">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFlexible(true)}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium ${flexible ? 'border-navy-950 bg-navy-950 text-white' : 'border-slate-200 text-navy-700'}`}
            >
              Yes, flexible
            </button>
            <button
              type="button"
              onClick={() => setFlexible(false)}
              className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium ${!flexible ? 'border-navy-950 bg-navy-950 text-white' : 'border-slate-200 text-navy-700'}`}
            >
              No, fixed dates
            </button>
          </div>
          {flexible && (
            <label className="mt-4 block text-sm">
              <span className="mb-1 block font-medium text-navy-700">± how many days?</span>
              <input
                type="number"
                min={1}
                max={14}
                value={flexibleDays}
                onChange={(e) => setFlexibleDays(Number(e.target.value))}
                className="w-24 rounded-lg border border-slate-200 px-3 py-2"
              />
            </label>
          )}
        </StepShell>
      )}

      {step === 'frequency' && (
        <StepShell title="How many trips do you take a year?">
          <input
            type="number"
            min={1}
            max={20}
            value={tripsPerYear}
            onChange={(e) => setTripsPerYear(Number(e.target.value))}
            className="w-24 rounded-lg border border-slate-200 px-3 py-2"
          />
          <p className="mt-3 text-sm text-slate-500">
            We'll create a fare alert for {dreamDestinations.length || 'each'} destination
            {dreamDestinations.length === 1 ? '' : 's'} you told us about.
          </p>
        </StepShell>
      )}

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={back}
          disabled={stepIndex === 0}
          className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-500 disabled:opacity-0"
        >
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance() || submitting}
          className="rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600 disabled:opacity-60"
        >
          {submitting ? 'Setting up…' : stepIndex === STEPS.length - 1 ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}

function StepShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold text-navy-950">{title}</h2>
      {children}
    </div>
  );
}
