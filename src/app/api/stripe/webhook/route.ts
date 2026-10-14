import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe/client';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getProviderById } from '@/lib/flights/registry';

export const runtime = 'nodejs';

/**
 * Single source of truth for subscription state. Client code must never
 * infer membership from anything but this webhook-populated `subscriptions`
 * table (see resolveViewer in src/lib/tiers.ts).
 */
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature verification failed` }, { status: 400 });
  }

  const service = createSupabaseServiceClient();

  // Idempotency: skip events we've already processed.
  const { data: alreadyProcessed } = await service
    .from('webhook_events')
    .select('id')
    .eq('id', event.id)
    .maybeSingle();
  if (alreadyProcessed) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.mode === 'subscription') {
        const userId = session.client_reference_id;
        if (userId && session.subscription && session.customer) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await upsertSubscription(service, userId, sub);
        }
      } else if (session.mode === 'payment' && session.metadata?.booking_id) {
        await confirmDirectBooking(service, session);
      }
      break;
    }
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.user_id;
      if (userId) await upsertSubscription(service, userId, sub);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      await service.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id);
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription) {
        // 3-day grace period before access is revoked.
        const graceEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        await service
          .from('subscriptions')
          .update({ status: 'past_due', grace_period_ends_at: graceEnd })
          .eq('stripe_subscription_id', invoice.subscription as string);
      }
      break;
    }
    default:
      break;
  }

  await service.from('webhook_events').insert({ id: event.id, type: event.type, payload: event as unknown as object });

  return NextResponse.json({ received: true });
}

async function upsertSubscription(
  service: ReturnType<typeof createSupabaseServiceClient>,
  userId: string,
  sub: Stripe.Subscription
) {
  const priceId = sub.items.data[0]?.price.id;
  const { data: plan } = await service
    .from('subscription_plans')
    .select('id')
    .eq('stripe_price_id', priceId)
    .maybeSingle();

  await service.from('subscriptions').upsert(
    {
      user_id: userId,
      plan_id: plan?.id ?? null,
      stripe_customer_id: sub.customer as string,
      stripe_subscription_id: sub.id,
      status: sub.status,
      current_period_start: new Date(sub.current_period_start * 1000).toISOString(),
      current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end,
      grace_period_ends_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'stripe_subscription_id' }
  );

  await service.from('profiles').update({ tier: ['active', 'trialing', 'past_due'].includes(sub.status) ? 'MEMBER' : 'FREE' }).eq('id', userId);
}

/**
 * Confirms a direct-booking payment (section 32/Phase 5). Only after Stripe
 * confirms payment do we call the flight provider's createOrder() — this is
 * the one place in the app that actually attempts to issue a ticket.
 */
async function confirmDirectBooking(service: ReturnType<typeof createSupabaseServiceClient>, session: Stripe.Checkout.Session) {
  const bookingId = session.metadata!.booking_id;

  const { data: booking } = await service
    .from('bookings')
    .update({
      payment_status: 'paid',
      stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
      amount: session.amount_total ?? undefined,
    })
    .eq('id', bookingId)
    .select('id, offer_id')
    .single();

  if (!booking?.offer_id) return;

  const { data: offer } = await service.from('flight_offers').select('provider_id').eq('id', booking.offer_id).maybeSingle();
  const provider = offer?.provider_id ? getProviderById(offer.provider_id) : null;

  if (!provider) {
    // No provider available to ticket with (e.g. Duffel key set but adapter
    // still unimplemented) — payment is captured, but the booking needs
    // manual follow-up rather than a false "confirmed" status.
    await service.from('bookings').update({ status: 'redirected' }).eq('id', bookingId);
    return;
  }

  try {
    const order = await provider.createOrder(booking.offer_id);
    await service.from('bookings').update({ status: 'confirmed', provider_order_id: order.id }).eq('id', bookingId);
  } catch {
    // Payment succeeded but ticketing failed — needs a human to resolve
    // (refund or manual issuance). Never silently claim 'confirmed' here.
    await service.from('bookings').update({ status: 'redirected' }).eq('id', bookingId);
  }
}
