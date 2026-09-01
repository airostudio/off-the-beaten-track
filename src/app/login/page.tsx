import Link from 'next/link';
import { AuthForm } from '@/components/layout/AuthForm';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="mb-1 text-2xl font-bold text-navy-950">Welcome back</h1>
      <p className="mb-6 text-sm text-slate-500">Sign in to see your member fares.</p>
      <AuthForm mode="login" />
      <p className="mt-6 text-center text-sm text-slate-500">
        New here?{' '}
        <Link href="/signup" className="font-semibold text-accent-600">
          Create a free account
        </Link>
      </p>
    </main>
  );
}
