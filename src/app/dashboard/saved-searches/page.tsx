import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/dashboard/EmptyState';

export default async function SavedSearchesPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const { data: searches } = await service
    .from('saved_searches')
    .select('*')
    .eq('user_id', viewer.userId ?? '')
    .order('created_at', { ascending: false });

  if (!searches || searches.length === 0) {
    return (
      <EmptyState
        title="No saved searches"
        body="Save a search from the results page to quickly re-run it or turn it into an alert."
      />
    );
  }

  return (
    <ul className="space-y-3">
      {searches.map((s) => (
        <li key={s.id} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="font-semibold text-navy-950">
            {s.origin} → {s.destination}
          </p>
          <p className="text-sm text-slate-500">
            {s.departure_date} {s.return_date ? `– ${s.return_date}` : ''} · {s.cabin}
          </p>
        </li>
      ))}
    </ul>
  );
}
