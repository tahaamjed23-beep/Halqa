// ============================================================================
// ASSET COMMITTEES
//
// A committee whose pot buys a thing rather than paying out cash: a phone, a
// bike, a solar panel, an appliance. The member joins to own something, and
// the committee is how they afford it without a loan.
//
// THE OWNERSHIP PROBLEM, which is what makes this hard.
//
// In a cash committee the member who collects on day one gets money and still
// owes eleven more payments. That is fine, because money is fungible and the
// obligation is recorded. With an asset, the same member walks away holding a
// phone while owing most of its price, and nothing about a phone stops them.
//
// The resolution is that the asset is delivered to everyone on the same day, at
// the end of the cycle, and the ordering decides only who is charged what.
// Nobody takes possession while they still owe a large balance, so there is
// nothing to repossess and no trustee holding title over an occupied house.
//
// Where an asset can be secured at the device level (a financed handset that
// can be locked, a solar unit with a controller), early delivery is offered as
// a variant. Where it cannot, it is not offered at all, however much anyone
// would like it to be. That refusal is deliberate.
// ============================================================================

export type AssetCategory = 'PHONE' | 'APPLIANCE' | 'SOLAR' | 'BIKE' | 'TOOLS' | 'OTHER';

export type AssetSpec = {
  id: string;
  category: AssetCategory;
  name: string;
  /** Retail cash price today, in paisa. */
  priceP: bigint;
  /**
   * Can the supplier lock or disable it remotely if payments stop? Only these
   * may be delivered before the cycle ends.
   */
  securable: boolean;
};

export const DELIVERY = {
  /** Everyone receives on the same day, at the close of the cycle. */
  ON_COMPLETION: 'ON_COMPLETION',
  /** Delivered at the member's turn. Requires a securable asset. */
  AT_TURN: 'AT_TURN',
} as const;
export type DeliveryMode = (typeof DELIVERY)[keyof typeof DELIVERY];

/**
 * Which delivery modes an asset may be sold under. An unsecurable asset is
 * completion-only, always: the alternative is unsecured lending in disguise.
 */
export function allowedDelivery(asset: AssetSpec): DeliveryMode[] {
  return asset.securable
    ? [DELIVERY.ON_COMPLETION, DELIVERY.AT_TURN]
    : [DELIVERY.ON_COMPLETION];
}

export function deliveryAllowed(asset: AssetSpec, mode: DeliveryMode): boolean {
  return allowedDelivery(asset).includes(mode);
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export type AssetPlan = {
  asset: AssetSpec;
  members: number;
  rounds: number;
  /** What each member pays per round, in paisa. */
  contributionP: bigint;
  /** What each member pays across the cycle. */
  totalP: bigint;
  /** Difference from paying cash today. Zero on a completion-delivery circle. */
  premiumP: bigint;
  deliveryMode: DeliveryMode;
};

/**
 * Size the committee from the asset price, not from a number a host typed.
 *
 * The contribution is the price divided by the rounds, rounded UP to the paisa
 * so the pot can never come up short of the supplier invoice. The rounding
 * residue stays with the member as a tiny credit rather than becoming margin.
 */
export function planFor(asset: AssetSpec, rounds: number, deliveryMode: DeliveryMode = DELIVERY.ON_COMPLETION): AssetPlan {
  const n = Math.max(1, Math.trunc(rounds));
  const contributionP = (asset.priceP + BigInt(n) - 1n) / BigInt(n);   // ceiling division
  const totalP = contributionP * BigInt(n);
  return {
    asset, members: n, rounds: n, contributionP, totalP,
    premiumP: totalP - asset.priceP,
    deliveryMode,
  };
}

/**
 * The total cost of ownership, laid out so a member can compare it against
 * buying outright and against a bank instalment plan. Halqa's own charge is
 * the ordinary per-installment fee and nothing else; there is no margin on the
 * asset, because a margin on the asset is a mark-up on credit.
 */
export function totalCostOfOwnership(plan: AssetPlan, feePerInstallmentP: bigint) {
  const halqaFeesP = feePerInstallmentP * BigInt(plan.rounds);
  return {
    cashPriceP: plan.asset.priceP,
    paidToCircleP: plan.totalP,
    halqaFeesP,
    allInP: plan.totalP + halqaFeesP,
    /** Cost above the cash price, as basis points of the cash price. */
    upliftBps: plan.asset.priceP > 0n
      ? Number(((plan.totalP + halqaFeesP - plan.asset.priceP) * 10_000n) / plan.asset.priceP)
      : 0,
  };
}

// ---------------------------------------------------------------------------
// Ownership and default
// ---------------------------------------------------------------------------

export type OwnershipEvent = {
  round: number;
  /** Whether the member holds the asset after this round. */
  delivered: boolean;
  /** What they still owe at that point, in paisa. */
  owedP: bigint;
};

/**
 * When each member takes possession, and what they still owe when they do.
 *
 * Under completion delivery every member has owed zero by the time they hold
 * the thing, which is the whole point: there is no repossession problem
 * because there is never an outstanding balance against a delivered asset.
 */
export function ownershipSchedule(plan: AssetPlan, turn: number): OwnershipEvent[] {
  return Array.from({ length: plan.rounds }, (_, i) => {
    const round = i + 1;
    const paid = plan.contributionP * BigInt(round);
    const owedP = plan.totalP - paid;
    const delivered = plan.deliveryMode === DELIVERY.ON_COMPLETION
      ? round === plan.rounds
      : round >= turn;
    return { round, delivered, owedP: owedP > 0n ? owedP : 0n };
  });
}

/** What a member still owes if they stop after `roundsPaid` rounds. */
export function outstandingAfter(plan: AssetPlan, roundsPaid: number): bigint {
  const paid = plan.contributionP * BigInt(Math.max(0, Math.min(plan.rounds, roundsPaid)));
  const rest = plan.totalP - paid;
  return rest > 0n ? rest : 0n;
}

export type DefaultOutcome = {
  /** The asset can be locked or recovered. */
  recoverable: boolean;
  outstandingP: bigint;
  /** What the member gets back if the asset is recovered and resold. */
  refundableP: bigint;
  action: 'NONE_DELIVERED' | 'LOCK_DEVICE' | 'RECOVER_AND_SETTLE' | 'PURSUE_AS_DEBT';
};

/**
 * What happens when somebody stops paying.
 *
 * Before delivery there is nothing to recover, so it is an ordinary committee
 * exit and the restitution engine handles it. After delivery it depends
 * entirely on whether the asset can be secured, which is why unsecurable
 * assets are never delivered early in the first place.
 */
export function onDefault(plan: AssetPlan, roundsPaid: number, delivered: boolean): DefaultOutcome {
  const outstandingP = outstandingAfter(plan, roundsPaid);
  if (!delivered) {
    return { recoverable: true, outstandingP, refundableP: plan.contributionP * BigInt(roundsPaid), action: 'NONE_DELIVERED' };
  }
  if (plan.asset.securable) {
    return { recoverable: true, outstandingP, refundableP: 0n, action: 'LOCK_DEVICE' };
  }
  return { recoverable: false, outstandingP, refundableP: 0n, action: 'PURSUE_AS_DEBT' };
}

/**
 * Buying out early. A member may always clear the balance and take the asset,
 * at the cash price with no penalty, because charging to settle early is a
 * charge for time and that is the thing this product exists to avoid.
 */
export function earlyBuyoutP(plan: AssetPlan, roundsPaid: number): bigint {
  return outstandingAfter(plan, roundsPaid);
}

/** A starter catalogue. Securable items are the ones a supplier can lock. */
export const CATALOGUE: AssetSpec[] = [
  { id: 'phone-entry',  category: 'PHONE',     name: 'Entry smartphone',      priceP: 3_500_000n,  securable: true },
  { id: 'phone-mid',    category: 'PHONE',     name: 'Mid-range smartphone',  priceP: 7_500_000n,  securable: true },
  { id: 'solar-basic',  category: 'SOLAR',     name: 'Home solar kit',        priceP: 12_000_000n, securable: true },
  { id: 'bike-70',      category: 'BIKE',      name: 'Motorcycle 70cc',       priceP: 16_500_000n, securable: true },
  { id: 'fridge',       category: 'APPLIANCE', name: 'Refrigerator',          priceP: 9_500_000n,  securable: false },
  { id: 'washer',       category: 'APPLIANCE', name: 'Washing machine',       priceP: 5_500_000n,  securable: false },
  { id: 'sewing',       category: 'TOOLS',     name: 'Sewing machine',        priceP: 3_000_000n,  securable: false },
];
