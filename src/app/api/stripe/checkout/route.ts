import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getStripe } from '@/lib/stripe/client';
import { createSupabaseServerClient, createSupabaseServiceClient } from '@/lib/supabase/server';

const schema = z.object({ priceId: z.string().min(1) });

/** Creates a Stripe Checkout session for a subscription plan. Prices are never hard-coded here. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'priceId is required' }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'You must be signed in to subscribe' }, { status: 401 });
  }

  const service = createSupabaseServiceClient();
  const { data: plan } = await service
    .from('subscription_plans')
    .select('*')
    .eq('stripe_price_id', parsed.data.priceId)
    .eq('active', true)
    .maybeSingle();

  if (!plan) {
    return NextResponse.json({ error: 'Unknown or inactive plan' }, { status: 404 });
  }

  const { data: existing } = await service
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  const stripe = getStripe();
  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: existing?.stripe_customer_id,
    customer_email: existing?.stripe_customer_id ? undefined : user.email,
    client_reference_id: user.id,
    line_items: [{ price: plan.stripe_price_id, quantity: 1 }],
    subscription_data: { metadata: { user_id: user.id, plan_id: plan.id } },
    allow_promotion_codes: true,
    success_url: `${origin}/dashboard/billing?checkout=success`,
    cancel_url: `${origin}/dashboard/billing?checkout=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
