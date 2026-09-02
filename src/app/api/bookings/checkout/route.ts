import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { getStripe } from '@/lib/stripe/client';

const schema = z.object({ dbOfferId: z.string().uuid() });

/**
 * Direct booking checkout (section 32/Phase 5). Collects real payment via a
 * one-time Stripe Checkout Session — a second path alongside affiliate
 * redirects, never a replacement. Order creation with the flight provider
 * happens only after payment is confirmed by the webhook, never here.
 */
export async function POST(request: NextRequest) {
  const viewer = await resolveViewer();
  if (!viewer.userId) {
    return NextResponse.json({ error: 'You must be signed in to book directly' }, { status: 401 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid booking request' }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { data: offer } = await service.from('flight_offers').select('*').eq('id', parsed.data.dbOfferId).maybeSingle();

  if (!offer) {
    return NextResponse.json({ error: 'Fare not found — please search again' }, { status: 404 });
  }
  if (offer.offer_expires_at && new Date(offer.offer_expires_at) < new Date()) {
    return NextResponse.json({ error: 'This fare has expired. Please search again for a current price.' }, { status: 410 });
  }

  const price = viewer.limits.canSeeMemberPrice && offer.member_price != null ? offer.member_price : offer.public_price;

  const { data: booking, error: bookingError } = await service
    .from('bookings')
    .insert({
      user_id: viewer.userId,
      offer_id: offer.id,
      status: 'pending',
      payment_status: 'unpaid',
      amount: price,
      currency: offer.currency,
    })
    .select('id')
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: bookingError?.message ?? 'Could not start booking' }, { status: 500 });
  }

  const stripe = getStripe();
  const origin = request.headers.get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: offer.currency.toLowerCase(),
          unit_amount: price,
          product_data: {
            name: `${offer.airline} ${offer.origin} → ${offer.destination}`,
            description: `${offer.cabin.replace('_', ' ')} · Departs ${new Date(offer.departure_at).toLocaleDateString('en-AU')}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { booking_id: booking.id },
    success_url: `${origin}/dashboard/upcoming?booking=success`,
    cancel_url: `${origin}/search?booking=cancelled`,
  });

  await service.from('bookings').update({ stripe_checkout_session_id: session.id }).eq('id', booking.id);

  return NextResponse.json({ url: session.url });
}
