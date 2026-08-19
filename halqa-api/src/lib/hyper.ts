// ============================================================================
// HYPER COMMITTEES
//
// Daily contributions over a 60-day cycle. Seven members collect each day, so
// the roster is 420. Every member pays Rs 500 a day for 60 days and collects
// that same Rs 30,000 once, which balances exactly at both the member and the
// circle level.
//
// Members buy their collection day at an opening auction. The earlier the day,
// the larger the advance, so the earlier days carry a premium and the last days
// clear at nil.
//
// THE CONSTRAINT THAT MAKES THE AUCTION SAFE
//
// A premium paid for an earlier day is a real cost of money, and daily cadence
// turns a small rupee figure into a very large annualised rate. That rate is
// the number a hostile journalist or an SECP reviewer computes, and it is what
// killed the 400 banned lending apps. So every bid is capped at the point where
// the member's all-in cost reaches 48% APR-equivalent. Above that the bid is
// refused outright rather than merely discouraged.
//
// The cap is not decoration: it falls from a meaningful figure on day 1 to a
// few rupees by the final week, which is the economically correct shape,
// because a late day is worth nothing to bid for.
// ============================================================================

export const HYPER = {
  /** Cycle length in days. One cohort collects per day. */
  DAYS: 60,
  /** Daily contribution, in paisa. Rs 500. */
  DAILY_PAISA: 50_000n,
  /** What one member collects on their day. Equals what they pay in. */
  POT_PAISA: 3_000_000n,
  /** Members collecting per day. 7 x 60 = a 420-member roster. */
  SEATS_PER_DAY: 7,
  /** Entry gates. */
  MIN_SCORE: 650,
  MIN_CLEAN_CIRCLES: 2,
  /** A member with no daily earnings must hold this much in the vault instead. */
  MIN_VAULT_PAISA: 1_500_000n,
  /** One HYPER at a time: daily obligations compound too fast to stack. */
  MAX_CONCURRENT: 1,
  /** Daily cadence: the standing grace formula returns zero, so it is fixed. */
  GRACE_HOURS: 12,
  LATE_LADDER: [
    { afterHours: 12, penaltyBps: 500 },
    { afterHours: 36, penaltyBps: 1000 },
    { afterHours: 60, penaltyBps: 1500 },
  ],
  SCORE_DAMAGE: [-20, -40, -60],
  POST_PAYOUT_DEFAULT: -200,
  /** The published ceiling on a member's total cost of an early day. */
  MAX_APR_BPS: 4800,
  /** Auction length before the cycle starts. */
  AUCTION_HOURS: 24,
} as const;

/** 7 a day across the whole cycle. */
export const rosterSize = () => HYPER.SEATS_PER_DAY * HYPER.DAYS;

/** What a member pays in across the whole cycle. Equals the pot, by design. */
export const totalContributionPaisa = () => HYPER.DAILY_PAISA * BigInt(HYPER.DAYS);

/**
 * The cycle balances only if what one member pays in equals what they collect.
 * Asserted rather than assumed, because a change to any constant that broke it
 * would silently turn the product into a loss-maker or a lottery.
 */
export const isBalanced = () => totalContributionPaisa() === HYPER.POT_PAISA;

// ---------------------------------------------------------------------------
// The advance, and what an early day is really worth
// ---------------------------------------------------------------------------

/**
 * Net cash advanced to a member who collects on day d.
 *
 * By day d they have paid d daily installments, so collecting the pot advances
 * them the difference. The last day advances nothing: it is already paid.
 */
export function advancePaisa(day: number): bigint {
  const d = Math.max(1, Math.min(HYPER.DAYS, Math.trunc(day)));
  const paidSoFar = HYPER.DAILY_PAISA * BigInt(d);
  const advance = HYPER.POT_PAISA - paidSoFar;
  return advance > 0n ? advance : 0n;
}

/** Days the advance stays outstanding before it is fully repaid. */
export const daysOutstanding = (day: number) =>
  Math.max(0, HYPER.DAYS - Math.max(1, Math.min(HYPER.DAYS, Math.trunc(day))));

/**
 * APR-equivalent of a premium paid for day d, in basis points.
 *
 *   average outstanding = advance / 2   (it amortises linearly to zero)
 *   APR = premium / (advance/2) x 365 / daysOutstanding
 *
 * Returns 0 where nothing is advanced or nothing is outstanding, because there
 * is no borrowing to price.
 */
export function bidAprBps(premiumPaisa: bigint, day: number): number {
  const advance = advancePaisa(day);
  const outstanding = daysOutstanding(day);
  if (advance <= 0n || outstanding <= 0 || premiumPaisa <= 0n) return 0;
  return Number((premiumPaisa * 2n * 365n * 10_000n) / (advance * BigInt(outstanding)));
}

/**
 * The most a member may bid for day d and still sit inside the ceiling.
 * This is the number the auction enforces, not a suggestion.
 */
export function maxBidPaisa(day: number): bigint {
  const advance = advancePaisa(day);
  const outstanding = daysOutstanding(day);
  if (advance <= 0n || outstanding <= 0) return 0n;
  return (BigInt(HYPER.MAX_APR_BPS) * advance * BigInt(outstanding)) / (2n * 365n * 10_000n);
}

export function bidAllowed(premiumPaisa: bigint, day: number): boolean {
  return premiumPaisa <= maxBidPaisa(day);
}

/**
 * A guide price for a day, used to seed the auction and to show a member what
 * the market has been paying. Scales with the advance and the time it is out,
 * held at two thirds of the hard cap so the ceiling stays a ceiling.
 */
export function guidePricePaisa(day: number): bigint {
  return (maxBidPaisa(day) * 2n) / 3n;
}

// ---------------------------------------------------------------------------
// Entry gating
// ---------------------------------------------------------------------------

export type HyperEntry = {
  creditScore: number;
  cleanCompletedCircles: number;
  /** A payslip on file. Required of everyone, with no substitute. */
  salarySlipVerified: boolean;
  /** Verified daily-earning work: a trader, a driver, a shopkeeper. */
  hasDailyEarningJob: boolean;
  /** Vault balance, which stands in for daily earnings when there are none. */
  vaultBalancePaisa: bigint;
  hasVerifiedRaast: boolean;
  activeHyperCircles: number;
};

export type EntryVerdict = { allowed: boolean; reasons: string[] };

/**
 * A daily committee only works if money arrives daily. So: a payslip is
 * required of everyone, and on top of that a member must either earn daily or
 * hold enough in the vault to cover the gaps. One or the other, never neither.
 */
export function assessEntry(e: HyperEntry): EntryVerdict {
  const reasons: string[] = [];
  if (e.creditScore < HYPER.MIN_SCORE) reasons.push(`A score of ${HYPER.MIN_SCORE} or above is required`);
  if (e.cleanCompletedCircles < HYPER.MIN_CLEAN_CIRCLES) {
    reasons.push(`${HYPER.MIN_CLEAN_CIRCLES} completed committees with a clean record are required`);
  }
  if (!e.salarySlipVerified) reasons.push('A salary slip must be on file');
  if (!e.hasDailyEarningJob && e.vaultBalancePaisa < HYPER.MIN_VAULT_PAISA) {
    reasons.push('Either daily earnings or a minimum vault balance is required');
  }
  // Daily cadence multiplies collection events by sixty. On wallet rails at
  // 1.5% the fees alone would consume a large share of a single pot.
  if (!e.hasVerifiedRaast) reasons.push('A verified Raast credential is required');
  if (e.activeHyperCircles >= HYPER.MAX_CONCURRENT) reasons.push('Only one HYPER committee at a time');
  return { allowed: reasons.length === 0, reasons };
}

// ---------------------------------------------------------------------------
// The auction
// ---------------------------------------------------------------------------

export type DayBook = {
  day: number;
  seats: number;
  taken: number;
  /** Standing highest bid on this day. */
  topBidPaisa: bigint;
  guidePaisa: bigint;
  maxBidPaisa: bigint;
  full: boolean;
};

export function buildDayBook(taken: Record<number, number> = {}, topBids: Record<number, bigint> = {}): DayBook[] {
  return Array.from({ length: HYPER.DAYS }, (_, i) => {
    const day = i + 1;
    const t = taken[day] ?? 0;
    return {
      day,
      seats: HYPER.SEATS_PER_DAY,
      taken: t,
      topBidPaisa: topBids[day] ?? 0n,
      guidePaisa: guidePricePaisa(day),
      maxBidPaisa: maxBidPaisa(day),
      full: t >= HYPER.SEATS_PER_DAY,
    };
  });
}

export type BidVerdict = { accepted: boolean; reason?: string };

export function validateBid(premiumPaisa: bigint, day: number, book: DayBook): BidVerdict {
  if (day < 1 || day > HYPER.DAYS) return { accepted: false, reason: 'That day is not in this cycle' };
  if (book.full) return { accepted: false, reason: 'That day is full' };
  if (premiumPaisa < 0n) return { accepted: false, reason: 'A bid cannot be negative' };
  if (premiumPaisa <= book.topBidPaisa) return { accepted: false, reason: 'Your bid must beat the standing bid' };
  if (!bidAllowed(premiumPaisa, day)) {
    return { accepted: false, reason: 'That bid is above the cost ceiling Halqa allows for this day' };
  }
  return { accepted: true };
}

/** Which rung of the late ladder a payment has reached, given hours overdue. */
export function lateRung(hoursOverdue: number): { rung: number; penaltyBps: number; scoreDelta: number } | null {
  let hit: { rung: number; penaltyBps: number; scoreDelta: number } | null = null;
  HYPER.LATE_LADDER.forEach((step, i) => {
    if (hoursOverdue >= step.afterHours) {
      hit = { rung: i + 1, penaltyBps: step.penaltyBps, scoreDelta: HYPER.SCORE_DAMAGE[i] };
    }
  });
  return hit;
}
