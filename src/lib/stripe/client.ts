import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

/** Lazily-instantiated Stripe client. Server-only — never import from client components. */
export function getStripe(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeClient = new Stripe(key, { apiVersion: '2024-06-20' });
  }
  return stripeClient;
}
