import { redirect } from 'next/navigation';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/dashboard');
  }

  const service = createSupabaseServiceClient();
  const { count: unreadCount } = await service
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('read', false)
    .lte('visible_at', new Date().toISOString());

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-navy-950">Your dashboard</h1>
      <DashboardNav unreadNotifications={unreadCount ?? 0} />
      <div className="pt-6">{children}</div>
    </main>
  );
}
