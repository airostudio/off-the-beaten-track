'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DealRowActions({ dealId, featured, expired }: { dealId: string; featured: boolean; expired: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function toggleFeatured() {
    setBusy(true);
    await fetch(`/api/admin/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !featured }),
    });
    setBusy(false);
    router.refresh();
  }

  async function expireNow() {
    setBusy(true);
    await fetch(`/api/admin/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expireNow: true }),
    });
    setBusy(false);
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    await fetch(`/api/admin/deals/${dealId}`, { method: 'DELETE' });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex gap-2 text-xs">
      <button onClick={toggleFeatured} disabled={busy} className="font-semibold text-accent-600 hover:underline disabled:opacity-50">
        {featured ? 'Unfeature' : 'Feature'}
      </button>
      {!expired && (
        <button onClick={expireNow} disabled={busy} className="font-semibold text-amber-600 hover:underline disabled:opacity-50">
          Expire now
        </button>
      )}
      <button onClick={remove} disabled={busy} className="font-semibold text-red-600 hover:underline disabled:opacity-50">
        Delete
      </button>
    </div>
  );
}
