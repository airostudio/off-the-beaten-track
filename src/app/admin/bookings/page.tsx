import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { ConfirmBookingForm } from './ConfirmBookingForm';

export default async function AdminBookingsPage() {
  const service = createSupabaseServiceClient();
  const { data: clicks } = await service
    .from('affiliate_clicks')
    .select('id, partner, created_at, user_id, confirmed_commission, offer:flight_offers(airline, origin, destination, public_price, currency)')
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Confirm the real outcome of a "Book" click (until a live affiliate-network webhook is wired up).
        Confirming splits the commission via the Commission Sharing Engine and credits the member's
        savings meter.
      </p>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3">Clicked</th>
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Member?</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {(clicks ?? []).map((c: any) => (
              <tr key={c.id} className="border-b border-slate-100">
                <td className="px-4 py-3 text-slate-500">{new Date(c.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  {c.offer ? `${c.offer.airline} · ${c.offer.origin} → ${c.offer.destination}` : '—'}
                </td>
                <td className="px-4 py-3">{c.user_id ? 'Yes' : 'Guest'}</td>
                <td className="px-4 py-3">
                  {c.confirmed_commission != null ? `Confirmed ($${c.confirmed_commission})` : 'Pending'}
                </td>
                <td className="px-4 py-3">
                  {c.confirmed_commission == null && <ConfirmBookingForm affiliateClickId={c.id} />}
                </td>
              </tr>
            ))}
            {(!clicks || clicks.length === 0) && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No affiliate clicks recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
