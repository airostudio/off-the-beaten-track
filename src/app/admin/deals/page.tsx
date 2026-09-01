import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/format';

export default async function AdminDealsPage() {
  const service = createSupabaseServiceClient();
  const { data: deals } = await service.from('deals').select('*').order('discovered_at', { ascending: false }).limit(50);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-slate-500">
          <tr>
            <th className="px-4 py-3">Route</th>
            <th className="px-4 py-3">Public</th>
            <th className="px-4 py-3">Member</th>
            <th className="px-4 py-3">Discount</th>
            <th className="px-4 py-3">Featured</th>
            <th className="px-4 py-3">Discovered</th>
          </tr>
        </thead>
        <tbody>
          {(deals ?? []).map((d) => (
            <tr key={d.id} className="border-b border-slate-100">
              <td className="px-4 py-3 font-medium text-navy-950">{d.route}</td>
              <td className="px-4 py-3">{formatMoney(d.public_price, 'AUD')}</td>
              <td className="px-4 py-3">{d.member_price ? formatMoney(d.member_price, 'AUD') : '—'}</td>
              <td className="px-4 py-3">{d.discount_percentage ? `${Math.round(d.discount_percentage)}%` : '—'}</td>
              <td className="px-4 py-3">{d.featured ? 'Yes' : 'No'}</td>
              <td className="px-4 py-3 text-slate-500">{new Date(d.discovered_at).toLocaleString()}</td>
            </tr>
          ))}
          {(!deals || deals.length === 0) && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                No deals discovered yet. The deal-discovery worker lands in Phase 2.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
