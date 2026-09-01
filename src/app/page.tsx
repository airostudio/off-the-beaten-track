import { SearchWidget } from '@/components/search/SearchWidget';

export default function HomePage() {
  return (
    <main>
      <section className="bg-navy-950">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-24">
          <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-5xl">
            Never overpay for a flight again.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-slate-300">
            We compare airlines, booking sites and smarter route combinations — then give members our
            strongest flight deals first.
          </p>
          <div className="mt-8">
            <SearchWidget />
          </div>
          <p className="mt-4 text-sm text-slate-400">Members save up to 35% on selected deals.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 sm:grid-cols-3">
          <ValueCard
            title="Better fares. Earlier."
            body="Our system continuously monitors airfare markets and surfaces opportunities automatically — members see them first."
          />
          <ValueCard
            title="Honest savings, always"
            body="Every member saving is calculated against a real public fare and logged for audit. No manufactured discounts, no fake countdowns."
          />
          <ValueCard
            title="Smart mixed-cabin"
            body="Premium Economy where the long flight is, Economy where it isn't. You only pay for comfort where it matters."
          />
        </div>
      </section>
    </main>
  );
}

function ValueCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
      <h3 className="mb-2 text-lg font-semibold text-navy-950">{title}</h3>
      <p className="text-sm text-slate-600">{body}</p>
    </div>
  );
}
