'use client';

import { useState } from 'react';

export function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — the link is still visible to select manually
    }
  }

  return (
    <button
      onClick={copy}
      className="rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  );
}
