import Link from 'next/link';

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-navy-950">
          Off the Beaten Track
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-navy-700 md:flex">
          <Link href="/search" className="hover:text-navy-950">Search flights</Link>
          <Link href="/deals" className="hover:text-navy-950">Deals</Link>
          <Link href="/membership" className="hover:text-navy-950">Membership</Link>
          <Link href="/dashboard" className="hover:text-navy-950">Dashboard</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-navy-700 sm:block">
            Sign in
          </Link>
          <Link
            href="/membership"
            className="rounded-full bg-navy-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            Become a member
          </Link>
        </div>
      </div>
    </header>
  );
}
