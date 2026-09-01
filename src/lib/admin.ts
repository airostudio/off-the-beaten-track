import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

/** Returns the current user's id if they are an admin, otherwise null. */
export async function requireAdmin(): Promise<string | null> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const service = createSupabaseServiceClient();
  const { data } = await service.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
  return data ? user.id : null;
}
