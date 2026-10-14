import TripPlanner from './TripPlanner';

export default function PlanPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-2xl font-bold text-navy-950">AI Trip Planner</h1>
      <p className="mt-1 mb-6 max-w-2xl text-sm text-slate-500">
        Describe your trip in your own words. We'll extract the details, let you confirm them, then search
        thousands of real combinations across cabins and routes — never a fabricated fare.
      </p>
      <TripPlanner />
    </main>
  );
}
