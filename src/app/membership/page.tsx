import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { PlanCard } from '@/components/membership/PlanCard';

export const revalidate = 300;

export default async function MembershipPage() {
  const service = createSupabaseServiceClient();
  const { data: plans } = await service
    .from('subscription_plans')
    .select('*')
    .eq('active', true)
    .order('price', { ascending: true });

  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-navy-950">Members know first.</h1>
        <p className="mx-auto mt-3 max-w-xl text-slate-600">
          Paid members get the freshest fares, genuine member pricing and early access to every deal we
          discover. Members can save up to 35% on selected deals.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {(plans ?? []).map((plan, i) => (
          <PlanCard
            key={plan.id}
            name={plan.name}
            price={plan.price}
            currency={plan.currency}
            interval={plan.billing_interval}
            priceId={plan.stripe_price_id}
            features={plan.features ?? []}
            highlighted={i === 1}
          />
        ))}
        {(!plans || plans.length === 0) && (
          <p className="col-span-full text-center text-slate-500">
            Plans are being configured. Run the Supabase seed migration and connect Stripe prices to
            continue.
          </p>
        )}
      </div>

      <p className="mt-8 text-center text-xs text-slate-400">
        Cancel anytime. Membership does not guarantee every flight is discounted. Fares can change until
        booked.
      </p>
    </main>
  );
}
