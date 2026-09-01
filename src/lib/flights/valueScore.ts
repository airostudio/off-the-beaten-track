import type { NormalisedFlightOffer, ScoredFlightOffer, FlightBadge, FlightValueScoreBreakdown } from '@/types/flight';

/**
 * FlightValueScore: 0-100 composite ranking so results aren't sorted by
 * price alone (section 10). Weighted blend of price, duration, stops,
 * fare flexibility and genuine member discount.
 */
function scoreOffer(offer: NormalisedFlightOffer, cheapestPrice: number, fastestMinutes: number): FlightValueScoreBreakdown {
  const effectivePrice = offer.memberPrice ?? offer.publicPrice;

  const price = clamp(100 - ((effectivePrice - cheapestPrice) / cheapestPrice) * 100, 0, 100);
  const duration = clamp(100 - ((offer.durationMinutes - fastestMinutes) / fastestMinutes) * 100, 0, 100);
  const stops = clamp(100 - offer.stops * 25, 0, 100);
  const flexibility = offer.cancellationPolicy === 'Refundable with fee' ? 70 : 40;
  const memberDiscount = offer.memberEligible && offer.memberPrice
    ? clamp(((offer.publicPrice - offer.memberPrice) / offer.publicPrice) * 200, 0, 100)
    : 0;
  const historicalPercentile = 50; // Phase 2: derive from fare_observations

  return { price, duration, stops, flexibility, memberDiscount, historicalPercentile };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

const WEIGHTS = {
  price: 0.35,
  duration: 0.2,
  stops: 0.15,
  flexibility: 0.1,
  memberDiscount: 0.15,
  historicalPercentile: 0.05,
};

export function rankOffers(offers: NormalisedFlightOffer[]): ScoredFlightOffer[] {
  if (offers.length === 0) return [];

  const cheapestPrice = Math.min(...offers.map((o) => o.memberPrice ?? o.publicPrice));
  const fastestMinutes = Math.min(...offers.map((o) => o.durationMinutes));

  const scored = offers.map((offer) => {
    const breakdown = scoreOffer(offer, cheapestPrice, fastestMinutes);
    const valueScore = Math.round(
      breakdown.price * WEIGHTS.price +
        breakdown.duration * WEIGHTS.duration +
        breakdown.stops * WEIGHTS.stops +
        breakdown.flexibility * WEIGHTS.flexibility +
        breakdown.memberDiscount * WEIGHTS.memberDiscount +
        breakdown.historicalPercentile * WEIGHTS.historicalPercentile
    );
    return { ...offer, valueScore, scoreBreakdown: breakdown, badges: [] as FlightBadge[] };
  });

  const bestValue = [...scored].sort((a, b) => b.valueScore - a.valueScore)[0];
  const cheapest = [...scored].sort((a, b) => (a.memberPrice ?? a.publicPrice) - (b.memberPrice ?? b.publicPrice))[0];
  const fastest = [...scored].sort((a, b) => a.durationMinutes - b.durationMinutes)[0];
  const bestMemberDeal = [...scored]
    .filter((o) => o.memberEligible && o.memberPrice)
    .sort((a, b) => b.scoreBreakdown.memberDiscount - a.scoreBreakdown.memberDiscount)[0];
  const bestPremiumEconomy = [...scored]
    .filter((o) => o.cabin === 'PREMIUM_ECONOMY')
    .sort((a, b) => b.valueScore - a.valueScore)[0];

  for (const offer of scored) {
    if (offer.id === bestValue?.id) offer.badges.push('BEST_VALUE');
    if (offer.id === cheapest?.id) offer.badges.push('CHEAPEST');
    if (offer.id === fastest?.id) offer.badges.push('FASTEST');
    if (offer.id === bestMemberDeal?.id) offer.badges.push('BEST_MEMBER_DEAL');
    if (offer.id === bestPremiumEconomy?.id) offer.badges.push('BEST_PREMIUM_ECONOMY');
  }

  return scored.sort((a, b) => b.valueScore - a.valueScore);
}
