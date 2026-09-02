import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/format';
import { AddProductForm } from './AddProductForm';

export default async function AdminTravelProductsPage() {
  const service = createSupabaseServiceClient();
  const { data: products } = await service.from('travel_products').select('*').order('created_at', { ascending: false });

  return (
    <div>
      <AddProductForm />
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-slate-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Public</th>
              <th className="px-4 py-3">Member</th>
              <th className="px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-b border-slate-100">
                <td className="px-4 py-3 capitalize">{p.category.replace('_', ' ')}</td>
                <td className="px-4 py-3 font-medium text-navy-950">{p.name}</td>
                <td className="px-4 py-3">{p.partner}</td>
                <td className="px-4 py-3">{p.public_price ? formatMoney(p.public_price, p.currency) : '—'}</td>
                <td className="px-4 py-3">{p.member_price ? formatMoney(p.member_price, p.currency) : '—'}</td>
                <td className="px-4 py-3">{p.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
            {(!products || products.length === 0) && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No travel products yet — add one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
