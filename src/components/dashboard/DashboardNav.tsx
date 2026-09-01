import Link from 'next/link';

const LINKS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/alerts', label: 'Flight alerts' },
  { href: '/dashboard/trips', label: 'Tracked trips' },
  { href: '/dashboard/saved-searches', label: 'Saved searches' },
  { href: '/dashboard/deals', label: 'Member deals' },
  { href: '/dashboard/preferences', label: 'Travel preferences' },
  { href: '/dashboard/billing', label: 'Billing' },
];

export function DashboardNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-px text-sm font-medium text-slate-600">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="whitespace-nowrap rounded-t-lg px-3 py-2 hover:bg-slate-100 hover:text-navy-950"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
