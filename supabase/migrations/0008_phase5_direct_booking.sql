-- Phase 5: direct booking architecture. Payment is collected via a real
-- Stripe Checkout Session (one-time payment, separate from the subscription
-- flow); a confirmed payment triggers FlightProvider.createOrder(). This is
-- deliberately a second path alongside affiliate redirects, never a
-- replacement — see section 32.

-- 'pending' covers the window between starting checkout and Stripe
-- confirming payment.
alter table bookings drop constraint if exists bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('pending', 'redirected', 'confirmed', 'cancelled'));

alter table bookings add column if not exists provider_order_id text;
alter table bookings add column if not exists payment_status text not null default 'unpaid'
  check (payment_status in ('unpaid', 'paid', 'refunded'));
alter table bookings add column if not exists stripe_checkout_session_id text unique;
alter table bookings add column if not exists stripe_payment_intent_id text;

create index if not exists idx_bookings_stripe_session on bookings(stripe_checkout_session_id);
