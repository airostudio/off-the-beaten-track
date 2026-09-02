'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ICONS = {
  search: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <circle cx="11" cy="11" r="7" strokeLinecap="round" />
      <path d="M21 21l-4.3-4.3" strokeLinecap="round" />
    </svg>
  ),
  deals: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path d="M12 2l2.4 4.8L20 8l-4 4 1 5.6L12 15l-5 2.6 1-5.6-4-4 5.6-1.2z" strokeLinejoin="round" />
    </svg>
  ),
  watchlist: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  trips: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path d="M3 12h18M3 12l4-6h4l-2 6M3 12l4 6h4l-2-6M13 6h4l4 6-4 6h-4" strokeLinejoin="round" />
    </svg>
  ),
  account: (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" strokeLinecap="round" />
    </svg>
  ),
};

const LINKS: { href: string; label: string; icon: keyof typeof ICONS }[] = [
  { href: '/search', label: 'Search', icon: 'search' },
  { href: '/deals', label: 'Deals', icon: 'deals' },
  { href: '/dashboard/trips', label: 'Watchlist', icon: 'watchlist' },
  { href: '/dashboard/upcoming', label: 'Trips', icon: 'trips' },
  { href: '/dashboard', label: 'Account', icon: 'account' },
];

/** Sticky bottom nav for mobile (section 39). Hidden on desktop, where the header nav covers this. */
export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      {LINKS.map((l) => {
        const active = pathname === l.href || (l.href !== '/search' && pathname.startsWith(l.href));
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              active ? 'text-accent-600' : 'text-slate-500'
            }`}
          >
            {ICONS[l.icon]}
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
