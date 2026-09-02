'use client';

import { useState } from 'react';

interface Rule {
  tier: 'GUEST' | 'FREE' | 'MEMBER';
  release_delay_minutes: number;
  allow_booking: boolean;
  allow_price_visibility: boolean;
}

export function ReleaseRulesEditor({ initial }: { initial: Rule[] }) {
  const [rules, setRules] = useState(initial);
  const [savingTier, setSavingTier] = useState<string | null>(null);

  async function save(rule: Rule) {
    setSavingTier(rule.tier);
    await fetch('/api/admin/deal-release-rules', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier: rule.tier,
        releaseDelayMinutes: rule.release_delay_minutes,
        allowBooking: rule.allow_booking,
        allowPriceVisibility: rule.allow_price_visibility,
      }),
    });
    setSavingTier(null);
  }

  function update(tier: Rule['tier'], patch: Partial<Rule>) {
    setRules((prev) => prev.map((r) => (r.tier === tier ? { ...r, ...patch } : r)));
  }

  return (
    <div className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-navy-950">Member-first release timing</p>
      <table className="w-full text-left text-sm">
        <thead className="text-slate-500">
          <tr>
            <th className="py-1 pr-4">Tier</th>
            <th className="py-1 pr-4">Delay (minutes)</th>
            <th className="py-1 pr-4">Booking allowed</th>
            <th className="py-1 pr-4">Price visible</th>
            <th className="py-1"></th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.tier} className="border-t border-slate-100">
              <td className="py-2 pr-4 font-medium text-navy-900">{r.tier}</td>
              <td className="py-2 pr-4">
                <input
                  type="number"
                  min={0}
                  value={r.release_delay_minutes}
                  onChange={(e) => update(r.tier, { release_delay_minutes: Number(e.target.value) })}
                  className="w-24 rounded-md border border-slate-200 px-2 py-1"
                />
              </td>
              <td className="py-2 pr-4">
                <input
                  type="checkbox"
                  checked={r.allow_booking}
                  onChange={(e) => update(r.tier, { allow_booking: e.target.checked })}
                />
              </td>
              <td className="py-2 pr-4">
                <input
                  type="checkbox"
                  checked={r.allow_price_visibility}
                  onChange={(e) => update(r.tier, { allow_price_visibility: e.target.checked })}
                />
              </td>
              <td className="py-2">
                <button
                  onClick={() => save(r)}
                  disabled={savingTier === r.tier}
                  className="rounded-md bg-navy-950 px-3 py-1 text-xs font-semibold text-white disabled:opacity-60"
                >
                  {savingTier === r.tier ? 'Saving…' : 'Save'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
