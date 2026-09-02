/**
 * DealScore: 0-100. Rewards a bigger discount off a genuine historical
 * average and more supporting observations (more data = more confidence
 * the "average" is real, not a fluke from one or two searches).
 */
export function computeDealScore(discountPercentage: number, observationCount: number): number {
  const discountComponent = Math.min(discountPercentage * 2, 70); // 35%+ off caps this component
  const confidenceComponent = Math.min(observationCount * 3, 30); // 10+ observations caps this component
  return Math.round(discountComponent + confidenceComponent);
}

/** Minimum discount below the historical average before we call something a "deal". */
export const DEAL_DISCOUNT_THRESHOLD = 0.15;

/** Minimum prior observations required before we trust a historical average. */
export const MIN_OBSERVATIONS_FOR_DEAL = 4;
