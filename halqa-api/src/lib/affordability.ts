// ============================================================================
// THE AFFORDABILITY ENGINE
//
// How much committee a member can actually carry.
//
// WHAT THIS IS FOR, and what it is deliberately NOT for.
//
// The whole point of a committee is that a large sum becomes affordable by
// spreading it: a member on Rs 30,000 a month can absolutely collect a
// Rs 30,000 pot, because across twelve members that is Rs 2,500 a month. The
// pot size is not the test and never was. The monthly installment is.
//
// So the engine is as lenient as it can responsibly be about any ONE committee,
// and gets progressively stricter about holding MANY at once, because that is
// where members actually get into trouble: not one committee they can afford,
// but a fourth and a fifth stacked on top of three they already have.
//
// The regulatory anchor is SBP's 40% debt-burden cap (BPRD Circular Letter 29
// of 2021). Halqa holds committees alone to 33% and the combined figure to 40%.
// Committee obligations outrank rent, members hold offline committees no bureau
// can see, and the loss lands on eleven neighbours rather than a balance sheet.
//
// THE DISCIPLINE FROM THE PROGRESSIVE-LENDING LITERATURE: escalating limits
// cause liquidity defaults when the limit outruns real capacity. Good history
// unlocks seats, circles and lower friction. It NEVER raises the money cap.
// Only new income evidence does that.
// ============================================================================

export const CAPS = {
  /** Committee contributions alone, as a share of net monthly income. */
  CASHFLOW_BPS: 3_300,
  /** Contributions plus known debt service. Stricter than SBP's 40%. */
  TOTAL_SERVICE_BPS: 4_000,
  /**
   * Up to and including this many committees, the monthly burden test is the
   * ONLY test. A member running one or two committees they can plainly pay for
   * is not a risk to anybody and should not be interrogated.
   */
  LENIENT_CIRCLES: 3,
  /** From the fourth committee, the weighted load must stay under this. */
  LOAD_CEILING_BPS: 4_000,
  /**
   * Total forward liability, as a multiple of monthly income. Generous, and
   * only checked once a member is past the lenient tier: it exists to catch
   * somebody stacking six committees, not to block one long cheap one.
   */
  EXPOSURE_MONTHS: 12n,
  CONCURRENT_UNVERIFIED: 1,
  CONCURRENT_VERIFIED: 6,
  HOST_UNPROVEN: 2,
  HOST_PROVEN: 5,
} as const;

export type Verification = 'DECLARED' | 'PROVEN' | 'ANALYST_UPLIFT';
export type Grade = 'A' | 'B' | 'C' | 'D' | 'UNRATED';

/** One committee the member already holds, or is about to. */
export type Holding = {
  /** Monthly installment, in paisa. */
  contributionP: bigint;
  /** Total rounds, which is also the months it runs. */
  rounds: number;
  /** Rounds still to run. */
  roundsRemaining: number;
  /** Seat held. Decides forward liability. */
  seat: number;
  /** Health of the circle itself, from the marketplace rating. */
  grade?: Grade;
};

export type MemberFinances = {
  monthlyIncomeP: bigint;
  verification: Verification;
  /** Known debt service from the bureau, in paisa. Zero where unavailable. */
  knownDebtServiceP: bigint;
  holdings: Holding[];
  cleanCompletedCircles: number;
};

export type Verdict = {
  allowed: boolean;
  reasons: string[];
  /** What they could still commit each month, in paisa. Never negative. */
  headroomMonthlyP: bigint;
  /** Weighted load once past the lenient tier, in basis points of income. */
  loadBps: number;
  /** True while only the plain monthly test applies. */
  lenientTier: boolean;
  caps: { cashflowP: bigint; totalServiceP: bigint; concurrent: number };
};

// ---------------------------------------------------------------------------
// The weights
//
// Each is deliberately mild. They are meant to make the fourth and fifth
// committee progressively harder to add, not to refuse the first.
// ---------------------------------------------------------------------------

/**
 * The nth committee counts for more than the first. Nothing extra for the
 * first three, then 15% more for each one after.
 */
export const concurrencyWeight = (index: number): number =>
  1 + 0.15 * Math.max(0, index - CAPS.LENIENT_CIRCLES);

/**
 * A shaky circle is a heavier commitment than a healthy one, because the risk
 * a member carries is the risk of everyone else in it. Uses the same grade the
 * marketplace shows, so a member is never told a circle is fine in one place
 * and risky in another.
 */
export const ratingWeight = (g: Grade = 'UNRATED'): number =>
  g === 'A' ? 0.9 : g === 'B' ? 1.0 : g === 'C' ? 1.2 : g === 'D' ? 1.5 : 1.1;

/**
 * Duration barely matters, and that is the point. A longer committee has a
 * SMALLER monthly installment, which the burden test already rewards. The only
 * thing length adds is time for life to change, which is worth a few per cent
 * and no more. It must never be a reason to refuse a cheap long committee.
 */
export const durationWeight = (rounds: number): number => (rounds >= 18 ? 1.05 : 1.0);

/** L(k) = c x (n - k): what a seat still owes after collecting. */
export const liabilityP = (h: Holding): bigint =>
  h.contributionP * BigInt(Math.max(0, h.rounds - h.seat));

const bps = (v: bigint, b: number) => (v * BigInt(b)) / 10_000n;
const isVerified = (v: Verification) => v === 'PROVEN' || v === 'ANALYST_UPLIFT';
const minBig = (a: bigint, b: bigint) => (a < b ? a : b);
const maxBig = (a: bigint, b: bigint) => (a > b ? a : b);

/**
 * The weighted monthly load, in basis points of income.
 *
 * Sorted cheapest-first so the concurrency weight lands on the committees a
 * member is adding, not on the ones they already manage. Adding a fourth should
 * cost the fourth, not retroactively penalise the first.
 */
export function weightedLoadBps(f: MemberFinances, proposed?: Holding): number {
  if (f.monthlyIncomeP <= 0n) return 0;
  const all = [...f.holdings, ...(proposed ? [proposed] : [])]
    .slice()
    .sort((a, b) => Number(a.contributionP - b.contributionP));
  let total = 0;
  all.forEach((h, i) => {
    const w = concurrencyWeight(i + 1) * ratingWeight(h.grade) * durationWeight(h.rounds);
    const share = Number((h.contributionP * 10_000n) / f.monthlyIncomeP);
    total += share * w;
  });
  return Math.round(total);
}

/** Plain monthly commitment, unweighted, in paisa. */
export const committedMonthlyP = (f: MemberFinances): bigint =>
  f.holdings.reduce((sum, h) => sum + h.contributionP, 0n);

/** Total forward liability across everything held. */
export const totalExposureP = (f: MemberFinances): bigint =>
  f.holdings.reduce((sum, h) => sum + liabilityP(h), 0n);

/**
 * The assessment.
 *
 * Always returns headroom as well as a verdict, because a bare rejection tells
 * a member nothing and "you can take one more up to Rs 9,800 a month" tells
 * them exactly what to do next.
 */
export function assess(f: MemberFinances, proposed: Holding): Verdict {
  const reasons: string[] = [];
  const income = f.monthlyIncomeP;
  const cashflowCap = bps(income, CAPS.CASHFLOW_BPS);
  const serviceCap = bps(income, CAPS.TOTAL_SERVICE_BPS);
  const concurrent = isVerified(f.verification) ? CAPS.CONCURRENT_VERIFIED : CAPS.CONCURRENT_UNVERIFIED;
  const count = f.holdings.length;
  const lenientTier = count < CAPS.LENIENT_CIRCLES;

  if (income <= 0n) {
    reasons.push('Halqa needs to know your monthly income before it can size this for you.');
  }

  // ---- the test that always applies: can they pay it each month
  const monthlyAfter = committedMonthlyP(f) + proposed.contributionP;
  if (income > 0n && monthlyAfter > cashflowCap) {
    reasons.push('This would take your committees past a third of your monthly income.');
  }
  if (income > 0n && monthlyAfter + f.knownDebtServiceP > serviceCap) {
    reasons.push('With your other repayments this would pass 40 per cent of your income.');
  }

  // ---- from the fourth committee, the weighted load
  const loadBps = weightedLoadBps(f, proposed);
  if (!lenientTier && income > 0n && loadBps > CAPS.LOAD_CEILING_BPS) {
    reasons.push(`You are running ${count} committees already. Adding another stretches you further than Halqa will support.`);
  }

  // ---- a generous backstop, only past the lenient tier
  if (!lenientTier && income > 0n) {
    const exposure = totalExposureP(f) + liabilityP(proposed);
    if (exposure > income * CAPS.EXPOSURE_MONTHS) {
      reasons.push('Across all your committees you would owe more than a year of income.');
    }
  }

  if (count >= concurrent) {
    reasons.push(isVerified(f.verification)
      ? `You can run ${CAPS.CONCURRENT_VERIFIED} committees at once.`
      : 'Verify your income to run more than one committee at a time.');
  }

  const headroom = income > 0n
    ? maxBig(0n, minBig(cashflowCap - committedMonthlyP(f),
                        serviceCap - committedMonthlyP(f) - f.knownDebtServiceP))
    : 0n;

  return {
    allowed: reasons.length === 0,
    reasons,
    headroomMonthlyP: headroom,
    loadBps,
    lenientTier,
    caps: { cashflowP: cashflowCap, totalServiceP: serviceCap, concurrent },
  };
}

/**
 * The largest committee a member could join at a given length.
 *
 * This is the number that makes the point: at 12 months their headroom buys a
 * pot twelve times larger than their monthly room. Spreading is the product.
 */
export function affordablePotP(f: MemberFinances, rounds: number): bigint {
  const v = assess(f, { contributionP: 0n, rounds, roundsRemaining: rounds, seat: rounds });
  return v.headroomMonthlyP * BigInt(Math.max(1, rounds));
}

/**
 * Seats a member may take, by forward liability.
 *
 * Generous by design: the liability is not a lump they must hold, it is paid
 * from installments already tested above. This only stops the extreme case.
 */
export function affordableSeats(f: MemberFinances, contributionP: bigint, members: number): number[] {
  const room = f.monthlyIncomeP * CAPS.EXPOSURE_MONTHS - totalExposureP(f);
  const seats: number[] = [];
  for (let k = 1; k <= members; k++) {
    if (contributionP * BigInt(members - k) <= room) seats.push(k);
  }
  return seats;
}

export function hostingLimit(f: MemberFinances): { limit: number; manualReview: boolean } {
  const proven = f.cleanCompletedCircles >= 2;
  return proven
    ? { limit: CAPS.HOST_PROVEN, manualReview: true }
    : { limit: CAPS.HOST_UNPROVEN, manualReview: false };
}

/** Plain-language headroom, always shown instead of a bare refusal. */
export function headroomSentence(v: Verdict, activeCircles: number): string {
  if (v.headroomMonthlyP <= 0n) return 'Your committees already use the income Halqa can see.';
  const rupees = Number(v.headroomMonthlyP) / 100;
  const amount = `Rs ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(rupees)}`;
  const left = Math.max(0, v.caps.concurrent - activeCircles);
  if (left <= 0) return `You are at your limit of ${v.caps.concurrent} committees. Your monthly room is ${amount}.`;
  return `You can take ${left === 1 ? 'one more committee' : `${left} more committees`} up to ${amount} a month.`;
}

/** Good history must never raise the money cap; only income evidence does. */
export function capAfterGoodHistory(currentCapP: bigint, _cleanCircles: number): bigint {
  return currentCapP;
}
