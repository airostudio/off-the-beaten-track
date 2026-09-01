import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/dashboard/EmptyState';
import { formatMoney } from '@/lib/format';

export default async function MemberDealsPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();

  const { data: rules } = await service.from('deal_release_rules').select('*').eq('tier', viewer.tier).maybeSingle();
  const releaseDelayMinutes = rules?.release_delay_minutes ?? 0;
  const cutoff = new Date(Date.now() - releaseDelayMinutes * 60000).toISOString();

  const { data: deals } = await service
    .from('deals')
    .select('*')
    .lte('discovered_at', cutoff)
    .order('discovered_at', { ascending: false })
    .limit(20);

  if (!deals || deals.length === 0) {
    return (
      <EmptyState
        title="No deals released to your tier yet"
        body={
          viewer.tier === 'MEMBER'
            ? 'We have not discovered a new deal in the last few hours. Check back soon.'
            : `Members see deals immediately. Your tier sees them ${releaseDelayMinutes / 60}h later.`
        }
      />
    );
  }

  return (
    <ul className="space-y-3">
      {deals.map((d) => (
        <li key={d.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold text-navy-950">{d.route}</p>
          <p className="text-sm text-slate-500">
            {formatMoney(d.member_price ?? d.public_price, 'AUD')}
            {d.discount_percentage ? ` · ${Math.round(d.discount_percentage)}% below average` : ''}
          </p>
        </li>
      ))}
    </ul>
  );
}
