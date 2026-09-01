import type { ScoredFlightOffer, ClientFlightOffer } from '@/types/flight';
import type { Viewer } from '@/lib/tiers';

function freshnessLabel(lastVerifiedAt: string, isLive: boolean): string {
  if (isLive) return 'Verified moments ago';
  const minutes = Math.round((Date.now() - new Date(lastVerifiedAt).getTime()) / 60000);
  if (minutes < 60) return `Last checked ${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Last checked ${hours} hour${hours === 1 ? '' : 's'} ago`;
  return 'Last checked earlier today';
}

/**
 * Converts scored provider offers into what a given viewer is entitled to
 * see. Members get the live member price; free/guest viewers see the
 * public price plus an honest, non-fabricated "what you could save" locked
 * summary computed from the same real offer — never a manufactured number.
 */
export function applyTierAccess(offers: ScoredFlightOffer[], viewer: Viewer): ClientFlightOffer[] {
  return offers.map((offer) => {
    const isLive = viewer.tier === 'MEMBER';
    const priceFreshness = {
      lastVerifiedAt: offer.lastVerifiedAt,
      isLive,
      label: freshnessLabel(offer.lastVerifiedAt, isLive),
    };

    if (viewer.limits.canSeeMemberPrice && offer.memberEligible && offer.memberPrice != null) {
      return { ...offer, priceFreshness };
    }

    const { memberPrice, ...rest } = offer;
    const lockedMemberFare =
      offer.memberEligible && memberPrice != null
        ? {
            saving: offer.publicPrice - memberPrice,
            savingPercentage: Math.round(((offer.publicPrice - memberPrice) / offer.publicPrice) * 100),
          }
        : undefined;

    return { ...rest, memberPrice: null, lockedMemberFare, priceFreshness };
  });
}
