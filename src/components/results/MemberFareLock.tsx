import Link from 'next/link';
import { formatMoney } from '@/lib/format';

export function MemberFareLock({
  publicPrice,
  currency,
  saving,
  savingPercentage,
}: {
  publicPrice: number;
  currency: string;
  saving: number;
  savingPercentage: number;
}) {
  const memberPrice = publicPrice - saving;

  return (
    <div className="rounded-xl border border-member-500/30 bg-member-50 p-4">
      <p className="mb-1 text-xs font-bold uppercase tracking-wide text-member-600">Member deal</p>
      <p className="text-sm text-slate-500 line-through">{formatMoney(publicPrice, currency)}</p>
      <p className="text-2xl font-bold text-navy-950">{formatMoney(memberPrice, currency)}</p>
      <p className="mb-3 text-sm font-semibold text-member-600">
        You save {formatMoney(saving, currency)} · {savingPercentage}% cheaper
      </p>
      <Link
        href="/membership"
        className="block rounded-lg bg-navy-950 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-navy-800"
      >
        Unlock this fare
      </Link>
      <p className="mt-2 text-[11px] text-slate-500">
        Cancel anytime. Fares can change until booked. Not every flight is discounted.
      </p>
    </div>
  );
}
