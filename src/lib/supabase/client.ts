import { createBrowserClient } from '@supabase/ssr';

/** Browser Supabase client. Uses the anon key only — never the service role key. */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
