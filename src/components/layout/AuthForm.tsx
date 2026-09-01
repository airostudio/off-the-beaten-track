'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setError(null);
    const supabase = createSupabaseBrowserClient();

    const { error: authError } =
      mode === 'signup'
        ? await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setStatus('error');
      setError(authError.message);
      return;
    }

    if (mode === 'signup') {
      setStatus('sent');
    } else {
      window.location.href = '/dashboard';
    }
  }

  if (status === 'sent') {
    return (
      <p className="text-sm text-navy-700">
        Check your email to confirm your account, then sign in.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-navy-900">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-accent-500 focus:outline-none"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-navy-900">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 focus:border-accent-500 focus:outline-none"
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-xl bg-navy-900 px-4 py-2.5 font-semibold text-white transition hover:bg-navy-800 disabled:opacity-60"
      >
        {status === 'loading' ? 'Please wait…' : mode === 'signup' ? 'Create free account' : 'Sign in'}
      </button>
    </form>
  );
}
