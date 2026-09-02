import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { OnboardingWizard } from './OnboardingWizard';

export default async function OnboardingPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/onboarding');

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-1 text-2xl font-bold text-navy-950">Let's set up your travel profile</h1>
      <p className="mb-6 text-sm text-slate-500">Takes about 30 seconds. You can change any of this later.</p>
      <OnboardingWizard />
    </main>
  );
}
