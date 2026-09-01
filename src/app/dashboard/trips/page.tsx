import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { formatMoney } from '@/lib/format';

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
        title="No tracked trips yet"
        body="Trips you book or watch will appear here with live price-change tracking."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {bookings.map((b: any) => (
        <li key={b.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold text-navy-950">
            {b.offer?.origin} → {b.offer?.destination}
          </p>
          <p className="text-sm text-slate-500">
            {b.status} · {b.amount ? formatMoney(b.amount, b.currency ?? 'AUD') : '—'}
          </p>
        </li>
      ))}
    </ul>
  );
}
