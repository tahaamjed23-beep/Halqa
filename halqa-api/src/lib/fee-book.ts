// ============================================================================
// THE FEE BOOK
//
// Every charge Halqa can make, in one file, in integer paisa.
//
// Fees used to be computed in the create flow, the committee route and the
// payout path, each with its own arithmetic. That is how a member ends up
// being quoted one number and charged another, and how the published policy
// drifts away from the code. Nothing outside this file may invent a fee.
//
// THE HEADLINE: Rs 50 per installment. Flat. It does not scale with the size
// of the committee, because a fee that grows with the pot is the thing that
// killed Razq, and because a member on a Rs 3,000 committee cannot subsidise
// one on a Rs 50,000 committee.
// ============================================================================

export const FEES = {
  /** The one member-facing charge. Rs 50 per installment recorded. */
  PER_INSTALLMENT_PAISA: 5_000n,

  /**
   * Halqa's cut of a marketplace premium, in basis points. Charged on the
   * premium only, never on the pot.
   */
  MARKETPLACE_CUT_BPS: 1_000n,          // 10%

  /** A premium may never exceed half the payout being sold. */
  MARKETPLACE_PREMIUM_CAP_BPS: 5_000n,  // 50%

  /**
   * Circles Halqa fills itself carry a higher management fee, because Halqa is
   * carrying the empty seats and paying into every round before it collects.
   */
  HALQA_FILL_UPLIFT_BPS: 5_000n,        // +50% on the per-installment fee

  /**
   * Verified income and employer earn up to an 80% discount on Halqa's own
   * charges. A discount, never a gate: verification must always be worth doing
   * and never be the price of entry.
   */
  MAX_VERIFICATION_DISCOUNT_BPS: 8_000n,

  /** Rehabilitation fee on a recovery case, on the outstanding amount. */
  REHABILITATION_BPS: 1_000n,           // 10%
} as const;

export type FeeLine = {
  code: string;
  label: string;
  /** What the member pays, in paisa. Negative means a credit. */
  amountPaisa: bigint;
  /** Plain-language reason, shown to the member verbatim. */
  note: string;
};

export type FeeQuote = {
  lines: FeeLine[];
  totalPaisa: bigint;
  /** What the fee would have been with no discount, for honest comparison. */
  grossPaisa: bigint;
  discountPaisa: bigint;
};

export type InstallmentFeeInput = {
  /** Circles Halqa filled carry the uplift. */
  halqaFilled?: boolean;
  /** 0..8000 bps, from verified income and employer. */
  discountBps?: number;
  /** Shariah-labelled circles route penalties to the circle, not to Halqa. */
  shariahLabelled?: boolean;
};

/**
 * What one installment costs a member. This is the only place the number is
 * produced, so the checkout screen, the receipt and the policy page cannot
 * disagree with each other.
 */
export function quoteInstallmentFee(input: InstallmentFeeInput = {}): FeeQuote {
  const lines: FeeLine[] = [];
  let gross = FEES.PER_INSTALLMENT_PAISA;

  lines.push({
    code: 'INSTALLMENT',
    label: 'Halqa fee',
    amountPaisa: FEES.PER_INSTALLMENT_PAISA,
    note: 'Rs 50 for each installment recorded. It does not change with the size of the committee.',
  });

  if (input.halqaFilled) {
    const uplift = (FEES.PER_INSTALLMENT_PAISA * FEES.HALQA_FILL_UPLIFT_BPS) / 10_000n;
    gross += uplift;
    lines.push({
      code: 'HALQA_FILL',
      label: 'Halqa-filled circle',
      amountPaisa: uplift,
      note: 'Halqa is paying into the empty seats in this committee so it could start full.',
    });
  }

  const bps = BigInt(Math.max(0, Math.min(Number(FEES.MAX_VERIFICATION_DISCOUNT_BPS), input.discountBps ?? 0)));
  const discount = (gross * bps) / 10_000n;
  if (discount > 0n) {
    lines.push({
      code: 'VERIFICATION_DISCOUNT',
      label: 'Verified income discount',
      amountPaisa: -discount,
      note: 'You verified your income, so Halqa charges you less.',
    });
  }

  return { lines, grossPaisa: gross, discountPaisa: discount, totalPaisa: gross - discount };
}

/** Halqa's cut of an accepted marketplace premium. */
export function marketplaceCutPaisa(premiumPaisa: bigint): bigint {
  if (premiumPaisa <= 0n) return 0n;
  return (premiumPaisa * FEES.MARKETPLACE_CUT_BPS) / 10_000n;
}

/** The highest premium a seller may ask for a given payout. */
export function maxPremiumPaisa(payoutPaisa: bigint): bigint {
  return (payoutPaisa * FEES.MARKETPLACE_PREMIUM_CAP_BPS) / 10_000n;
}

/**
 * What a member pays Halqa across a whole cycle, so the total can be shown
 * before they join rather than discovered one installment at a time.
 */
export function cycleFeePaisa(rounds: number, input: InstallmentFeeInput = {}): bigint {
  return quoteInstallmentFee(input).totalPaisa * BigInt(Math.max(0, rounds));
}

/**
 * The fee as a share of the committee, in basis points. A member deserves to
 * see that Rs 50 against a Rs 10,000 turn is one twentieth of one per cent,
 * and equally that against a Rs 500 turn it is ten per cent.
 */
export function feeShareBps(contributionPaisa: bigint, input: InstallmentFeeInput = {}): number {
  if (contributionPaisa <= 0n) return 0;
  return Number((quoteInstallmentFee(input).totalPaisa * 10_000n) / contributionPaisa);
}

/**
 * Where a penalty goes.
 *
 * Late fees are platform revenue, EXCEPT on Shariah-labelled circles, where a
 * fixed penalty retained as income is impermissible, so it routes to the
 * circle's own pool instead. Encoded here so the rule cannot be forgotten at
 * one of the several call sites that charge penalties.
 */
export function penaltyDestination(shariahLabelled: boolean): 'PLATFORM' | 'CIRCLE_POOL' {
  return shariahLabelled ? 'CIRCLE_POOL' : 'PLATFORM';
}

/** Rehabilitation fee charged to reopen a defaulted member's access. */
export const rehabilitationFeePaisa = (outstandingPaisa: bigint) =>
  (outstandingPaisa * FEES.REHABILITATION_BPS) / 10_000n;

/** The whole book, for the member-facing fee schedule screen. */
export function feeSchedule() {
  return [
    { code: 'INSTALLMENT', label: 'Each installment', value: 'Rs 50',
      note: 'Flat. It does not grow with the committee.' },
    { code: 'JOIN', label: 'Joining a committee', value: 'Free', note: '' },
    { code: 'CREATE', label: 'Starting a committee', value: 'Free', note: '' },
    { code: 'PAYOUT', label: 'Collecting your pot', value: 'Free',
      note: 'Halqa never takes a share of the pot.' },
    { code: 'RAIL', label: 'Moving the money', value: 'Free',
      note: 'Payments run over Raast, which does not charge for person-to-person transfers.' },
    { code: 'EXIT_WINDOW', label: 'Leaving in the first 24 hours', value: 'Free',
      note: 'Nothing is owed before a committee starts.' },
    { code: 'EXIT_SUBSTITUTE', label: 'Leaving with a replacement', value: 'Free',
      note: 'The group is not harmed, so there is nothing to charge.' },
    { code: 'EXIT_VOTE', label: 'Leaving by group approval', value: 'One installment',
      note: '70% of it goes to the members who stay, 30% to Halqa.' },
    { code: 'EXIT_HARDSHIP', label: 'Leaving on hardship', value: 'Waived',
      note: 'Reviewed case by case.' },
    { code: 'MARKETPLACE', label: 'Selling your turn', value: '10% of the premium',
      note: 'Charged on the premium only, never on the pot. The premium is capped at half the payout.' },
    { code: 'DISCOUNT', label: 'Verified income', value: 'Up to 80% off',
      note: 'Verification lowers what Halqa charges you. It is never required to join.' },
  ];
}
