export type UserTier = 'GUEST' | 'FREE' | 'MEMBER';

export interface Profile {
  id: string;
  email: string;
  fullName: string | null;
  tier: UserTier;
  homeAirport: string | null;
  createdAt: string;
}

export interface TravelPreferences {
  userId: string;
  homeAirport: string | null;
  preferredAirlines: string[];
  avoidedAirlines: string[];
  preferredCabin: CabinClass;
  longHaulCabin: CabinClass;
  longHaulThresholdHours: number;
  maxStops: number;
  minConnectionMinutes: number;
  maxConnectionMinutes: number;
  favouriteDestinations: string[];
}

export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';

/** Tier-gated capability limits. Mirrors subscription_plans + guest defaults. */
export interface TierLimits {
  tier: UserTier;
  searchesPerDay: number | null; // null = unlimited
  alertsLimit: number | null;
  earlyAccessHours: number;
  cacheTtlSeconds: number;
  canSeeMemberPrice: boolean;
}

export const TIER_LIMITS: Record<UserTier, TierLimits> = {
  GUEST: {
    tier: 'GUEST',
    searchesPerDay: 5,
    alertsLimit: 0,
    earlyAccessHours: 24,
    cacheTtlSeconds: 60 * 60, // 1hr public cache
    canSeeMemberPrice: false,
  },
  FREE: {
    tier: 'FREE',
    searchesPerDay: 20,
    alertsLimit: 3,
    earlyAccessHours: 12,
    cacheTtlSeconds: 15 * 60, // 15min moderate cache
    canSeeMemberPrice: false,
  },
  MEMBER: {
    tier: 'MEMBER',
    searchesPerDay: null,
    alertsLimit: null,
    earlyAccessHours: 0,
    cacheTtlSeconds: 60, // near-live
    canSeeMemberPrice: true,
  },
};
