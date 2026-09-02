import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-500">
        <nav className="mb-6 flex flex-wrap gap-x-6 gap-y-2 text-navy-700">
          <Link href="/search" className="hover:text-navy-950">Flights</Link>
          <Link href="/hotels" className="hover:text-navy-950">Hotels</Link>
          <Link href="/cars" className="hover:text-navy-950">Car rental</Link>
          <Link href="/insurance" className="hover:text-navy-950">Travel insurance</Link>
          <Link href="/deals" className="hover:text-navy-950">Deals</Link>
          <Link href="/dashboard/referrals" className="hover:text-navy-950">Refer a friend</Link>
        </nav>
        <p className="mb-2">
          Off the Beaten Track is a flight metasearch service. We may earn a commission when you book
          through a partner link. Membership savings are calculated against genuine public/retail fares —
          see our savings methodology for details.
        </p>
        <p>
          Membership does not guarantee a discount on every flight. Fares can change until booked. Cancel
          anytime.
        </p>
        <p className="mt-4 text-slate-400">© {new Date().getFullYear()} Off the Beaten Track.</p>
      </div>
    </footer>
  );
}
