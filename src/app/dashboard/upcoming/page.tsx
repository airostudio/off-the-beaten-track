import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { formatMoney } from '@/lib/format';

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: 'Awaiting payment', className: 'bg-amber-100 text-amber-800' },
  confirmed: { label: 'Confirmed', className: 'bg-member-50 text-member-600' },
  redirected: { label: 'Booked via partner', className: 'bg-slate-100 text-slate-600' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-600' },
};

export default async function TripsPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const { data: bookings } = await service
    .from('bookings')
    .select('*, offer:flight_offers(*)')
    .eq('user_id', viewer.userId ?? '')
    .order('booked_at', { ascending: false });

  if (!bookings || bookings.length === 0) {
    return (
      <EmptyState
        title="No upcoming trips yet"
        body="Book directly from search results, or via a partner link, and it'll show up here."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b: any) => {
        const status = STATUS_LABEL[b.status] ?? STATUS_LABEL.redirected;
        return (
          <li key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-navy-950">
                  {b.offer?.airline ? `${b.offer.airline} · ` : ''}
                  {b.offer?.origin} → {b.offer?.destination}
                </p>
                <p className="text-sm text-slate-500">{b.amount ? formatMoney(b.amount, b.currency ?? 'AUD') : '—'}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}>{status.label}</span>
            </div>
            {b.provider_order_id && <p className="mt-2 text-xs text-slate-400">Order ref: {b.provider_order_id}</p>}
          </li>
        );
      })}
    </ul>
  );
}
