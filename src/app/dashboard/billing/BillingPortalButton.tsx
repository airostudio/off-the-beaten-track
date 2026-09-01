'use client';

import { useState } from 'react';

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function openPortal() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const json = await res.json();
      if (json.url) window.location.href = json.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={openPortal}
      disabled={loading}
      className="rounded-xl bg-navy-950 px-4 py-2.5 font-semibold text-white hover:bg-navy-800 disabled:opacity-60"
    >
      {loading ? 'Opening…' : 'Manage billing'}
    </button>
  );
}
