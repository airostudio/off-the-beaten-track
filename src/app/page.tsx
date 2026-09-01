import { HeroSlideshow } from '@/components/home/HeroSlideshow';

export default function HomePage() {
  return (
    <main>
      <HeroSlideshow />

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
