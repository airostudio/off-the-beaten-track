export interface SubscriptionPlan {
  id: string;
  name: string;
  stripeProductId: string;
  stripePriceId: string;
  billingInterval: 'month' | 'year';
  price: number; // minor units
  currency: string;
  active: boolean;
  searchLimit: number | null;
  alertsLimit: number | null;
  earlyAccessHours: number;
  features: string[];
}

export type SubscriptionStatus =
  | 'trialing'
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'
  | 'paused';

export interface Subscription {
  id: string;
  userId: string;
  planId: string | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export const ACTIVE_SUBSCRIPTION_STATUSES: SubscriptionStatus[] = ['trialing', 'active', 'past_due'];
