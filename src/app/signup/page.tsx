import Link from 'next/link';
import { AuthForm } from '@/components/layout/AuthForm';

export default function SignupPage({ searchParams }: { searchParams: { ref?: string } }) {
  const referralCode = searchParams.ref?.trim().toUpperCase() || undefined;

  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-1 text-2xl font-bold text-navy-950">Create your free account</h1>
      <p className="mb-6 text-sm text-slate-500">
        Free accounts unlock alerts and delayed member deals. Upgrade any time for the freshest fares first.
      </p>
      {referralCode && (
        <div className="mb-6 rounded-xl bg-member-50 p-3 text-sm text-member-600">
          You were invited by a friend — sign up now and you'll both get 30 days of membership, free.
        </div>
      )}
      <AuthForm mode="signup" referralCode={referralCode} />
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-accent-600">
          Sign in
        </Link>
      </p>
    </main>
  );
}
