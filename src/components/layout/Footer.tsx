export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10 text-sm text-slate-500">
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
