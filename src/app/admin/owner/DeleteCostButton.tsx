'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function DeleteCostButton({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    setBusy(true);
    await fetch(`/api/admin/costs?id=${id}`, { method: 'DELETE' });
    setBusy(false);
    router.refresh();
  }

  return (
    <button onClick={remove} disabled={busy} className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50">
      Remove
    </button>
  );
}
