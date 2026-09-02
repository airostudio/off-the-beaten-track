import Link from 'next/link';

const LINKS = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/notifications', label: 'Notifications', badge: true },
  { href: '/dashboard/alerts', label: 'Flight alerts' },
  { href: '/dashboard/trips', label: 'Tracked trips' },
  { href: '/dashboard/upcoming', label: 'Upcoming trips' },
  { href: '/dashboard/saved-searches', label: 'Saved searches' },
  { href: '/dashboard/deals', label: 'Member deals' },
  { href: '/dashboard/preferences', label: 'Travel preferences' },
  { href: '/dashboard/referrals', label: 'Refer a friend' },
  { href: '/dashboard/billing', label: 'Billing' },
];

export function DashboardNav({ unreadNotifications = 0 }: { unreadNotifications?: number }) {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 pb-px text-sm font-medium text-slate-600">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className="relative whitespace-nowrap rounded-t-lg px-3 py-2 hover:bg-slate-100 hover:text-navy-950"
        >
          {l.label}
          {l.badge && unreadNotifications > 0 && (
            <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
