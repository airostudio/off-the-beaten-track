import { redirect } from 'next/navigation';
import Link from 'next/link';
import { requireAdmin } from '@/lib/admin';

const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/deals', label: 'Deals' },
  { href: '/admin/providers', label: 'Providers' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminId = await requireAdmin();
  if (!adminId) redirect('/login?next=/admin');

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      <h1 className="mb-6 text-2xl font-bold text-navy-950">Admin</h1>
      <nav className="mb-6 flex gap-1 border-b border-slate-200 text-sm font-medium text-slate-600">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-t-lg px-3 py-2 hover:bg-slate-100 hover:text-navy-950">
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </main>
  );
}
