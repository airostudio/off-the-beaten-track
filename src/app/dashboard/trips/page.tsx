import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { WatchlistView } from './WatchlistView';

export default async function WatchlistPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const { data: trips } = await service
    .from('watched_trips')
    .select('*')
    .eq('user_id', viewer.userId ?? '')
    .eq('active', true)
    .order('created_at', { ascending: false });

  return (
    <div>
      <p className="mb-4 text-sm text-slate-500">
        Prices refresh automatically via our price-check worker. Watch a trip from any search result.
      </p>
      <WatchlistView initial={trips ?? []} />
    </div>
  );
}
