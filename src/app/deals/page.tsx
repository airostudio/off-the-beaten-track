import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { formatMoney } from '@/lib/format';
import Link from 'next/link';

export default async function DealsPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();

  const { data: rules } = await service.from('deal_release_rules').select('*').eq('tier', viewer.tier).maybeSingle();
  const releaseDelayMinutes = rules?.release_delay_minutes ?? 1440;
  const cutoff = new Date(Date.now() - releaseDelayMinutes * 60000).toISOString();

  const { data: deals } = await service
    .from('deals')
    .select('*')
    .lte('discovered_at', cutoff)
    .order('discovered_at', { ascending: false })
    .limit(30);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-2xl font-bold text-navy-950">Deals we've discovered</h1>
      <p className="mt-1 text-sm text-slate-500">
        {viewer.tier === 'MEMBER'
          ? "You're seeing deals the moment we find them."
          : `Members see deals immediately. Your account sees them ${Math.round(releaseDelayMinutes / 60)}h later.`}
      </p>
      {viewer.tier !== 'MEMBER' && (
        <Link href="/membership" className="mt-3 inline-block text-sm font-semibold text-accent-600">
          Become a member for instant access →
        </Link>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {['philippines', 'thailand', 'bali', 'vietnam', 'japan', 'premium-economy', 'business'].map((slug) => (
          <Link
            key={slug}
            href={`/deals/${slug}`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-navy-700 transition hover:border-navy-950"
          >
            {slug.replace('-', ' ')}
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(deals ?? []).map((d) => (
          <div key={d.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <p className="font-semibold text-navy-950">{d.route}</p>
            <p className="mt-1 text-xl font-bold text-navy-950">
              {formatMoney(d.member_price ?? d.public_price, 'AUD')}
            </p>
            {d.discount_percentage && (
              <p className="text-sm font-semibold text-member-600">
                {Math.round(d.discount_percentage)}% below historical average
              </p>
            )}
            <p className="mt-2 text-xs text-slate-400">
              Discovered {new Date(d.discovered_at).toLocaleDateString()}
            </p>
          </div>
        ))}
        {(!deals || deals.length === 0) && (
          <p className="col-span-full text-slate-500">
            No deals released to your tier yet. Our deal-discovery workers land in Phase 2 — check back soon.
          </p>
        )}
      </div>
    </main>
  );
}
