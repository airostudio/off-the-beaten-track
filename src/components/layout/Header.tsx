'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  const transparentEligible = pathname === '/';

  useEffect(() => {
    if (!transparentEligible) return;
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [transparentEligible]);

  const isTransparent = transparentEligible && !scrolled;

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        isTransparent
          ? 'border-b border-white/0 bg-transparent'
          : 'border-b border-slate-200/70 bg-white/90 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className={`text-lg font-bold tracking-tight ${isTransparent ? 'text-white' : 'text-navy-950'}`}
        >
          Off the Beaten Track
        </Link>
        <nav
          className={`hidden items-center gap-8 text-sm font-medium md:flex ${
            isTransparent ? 'text-white/90' : 'text-navy-700'
          }`}
        >
          <Link href="/search" className={isTransparent ? 'hover:text-white' : 'hover:text-navy-950'}>
            Search flights
          </Link>
          <Link href="/plan" className={isTransparent ? 'hover:text-white' : 'hover:text-navy-950'}>
            Trip planner
          </Link>
          <Link href="/deals" className={isTransparent ? 'hover:text-white' : 'hover:text-navy-950'}>
            Deals
          </Link>
          <Link href="/membership" className={isTransparent ? 'hover:text-white' : 'hover:text-navy-950'}>
            Membership
          </Link>
          <Link href="/dashboard" className={isTransparent ? 'hover:text-white' : 'hover:text-navy-950'}>
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className={`hidden text-sm font-semibold sm:block ${isTransparent ? 'text-white/90' : 'text-navy-700'}`}
          >
            Sign in
          </Link>
          <Link
            href="/membership"
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isTransparent
                ? 'bg-white text-navy-950 hover:bg-slate-100'
                : 'bg-navy-950 text-white hover:bg-navy-800'
            }`}
          >
            Become a member
          </Link>
        </div>
      </div>
    </header>
  );
}
