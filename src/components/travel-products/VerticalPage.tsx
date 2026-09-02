import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { resolveViewer } from '@/lib/tiers';
import { ProductCard } from './ProductCard';

export async function VerticalPage({
  category,
  title,
  intro,
}: {
  category: 'hotel' | 'car_rental' | 'insurance';
  title: string;
  intro: string;
}) {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const { data: products } = await service
    .from('travel_products')
    .select('*')
    .eq('category', category)
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold text-navy-950">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-500">{intro}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(products ?? []).map((p) => (
          <ProductCard key={p.id} product={p} canSeeMemberPrice={viewer.limits.canSeeMemberPrice} />
        ))}
        {(!products || products.length === 0) && (
          <p className="col-span-full text-slate-500">
            No {title.toLowerCase()} deals listed yet — check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
