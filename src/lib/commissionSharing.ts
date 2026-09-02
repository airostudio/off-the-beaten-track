/**
 * Commission Sharing Engine (section 46). When we earn an affiliate
 * commission on a confirmed booking, this fraction is returned to the
 * member as a genuine cashback/saving — this is how member value can exist
 * even when the underlying fare is identical to what anyone else sees.
 *
 * Only ever applied to a real, confirmed commission amount — never used to
 * manufacture a "member price".
 */
export const MEMBER_COMMISSION_SHARE = 0.35;

export function splitCommission(commissionAmount: number) {
  const memberReward = Math.round(commissionAmount * MEMBER_COMMISSION_SHARE * 100) / 100;
  const platformMargin = Math.round((commissionAmount - memberReward) * 100) / 100;
  return { memberReward, platformMargin };
}
