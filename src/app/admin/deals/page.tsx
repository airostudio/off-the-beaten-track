import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/format';
import { CreateDealForm } from './CreateDealForm';
import { DealRowActions } from './DealRowActions';
import { ReleaseRulesEditor } from './ReleaseRulesEditor';

export default async function AdminDealsPage() {
  const service = createSupabaseServiceClient();
  const [{ data: deals }, { data: rules }] = await Promise.all([
    service.from('deals').select('*').order('discovered_at', { ascending: false }).limit(50),
    service.from('deal_release_rules').select('*').order('tier'),
  ]);

  return (
    <div>
      <ReleaseRulesEditor initial={rules ?? []} />
      <CreateDealForm />
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
              <th className="px-4 py-3">Expires</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(deals ?? []).map((d) => {
              const expired = !!d.expires_at && new Date(d.expires_at) < new Date();
              return (
                <tr key={d.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-navy-950">{d.route}</td>
                  <td className="px-4 py-3">{formatMoney(d.public_price, 'AUD')}</td>
                  <td className="px-4 py-3">{d.member_price ? formatMoney(d.member_price, 'AUD') : '—'}</td>
                  <td className="px-4 py-3">{d.discount_percentage ? `${Math.round(d.discount_percentage)}%` : '—'}</td>
                  <td className="px-4 py-3">{d.featured ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(d.discovered_at).toLocaleString()}</td>
                  <td className={`px-4 py-3 ${expired ? 'text-red-500' : 'text-slate-500'}`}>
                    {d.expires_at ? new Date(d.expires_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <DealRowActions dealId={d.id} featured={d.featured} expired={expired} />
                  </td>
                </tr>
              );
            })}
            {(!deals || deals.length === 0) && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  No deals yet. Create one above, or wait for the deal-discovery worker to find one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
