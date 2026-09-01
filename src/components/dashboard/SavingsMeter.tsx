import { formatMoney } from '@/lib/format';

export function SavingsMeter({
  membershipCostCents,
  verifiedSavingsCents,
  currency,
}: {
  membershipCostCents: number;
  verifiedSavingsCents: number;
  currency: string;
}) {
  const net = verifiedSavingsCents - membershipCostCents;
  const multiplier = membershipCostCents > 0 ? verifiedSavingsCents / membershipCostCents : 0;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Member savings meter</p>
      <div className="mt-3 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-lg font-bold text-navy-950">{formatMoney(membershipCostCents, currency)}</p>
          <p className="text-xs text-slate-500">Membership cost</p>
        </div>
        <div>
          <p className="text-lg font-bold text-member-600">{formatMoney(verifiedSavingsCents, currency)}</p>
          <p className="text-xs text-slate-500">Verified savings</p>
        </div>
        <div>
          <p className={`text-lg font-bold ${net >= 0 ? 'text-member-600' : 'text-slate-500'}`}>
            {net >= 0 ? '+' : ''}
            {formatMoney(net, currency)}
          </p>
          <p className="text-xs text-slate-500">Net benefit</p>
        </div>
      </div>
      {verifiedSavingsCents > 0 && (
        <p className="mt-4 text-center text-sm text-slate-600">
          Your membership has paid for itself {multiplier.toFixed(1)}×
        </p>
      )}
    </div>
  );
}
