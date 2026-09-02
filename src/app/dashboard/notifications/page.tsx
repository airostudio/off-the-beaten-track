import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { NotificationsList } from './NotificationsList';

export default async function NotificationsPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const { data: notifications } = await service
    .from('notifications')
    .select('*')
    .eq('user_id', viewer.userId ?? '')
    .lte('visible_at', new Date().toISOString())
    .order('sent_at', { ascending: false })
    .limit(50);

  return <NotificationsList initial={notifications ?? []} />;
}
