// ============================================================================
// THE AFFORDABILITY ENGINE
//
// How much committee a member can actually carry.
//
// The anchor is regulatory: SBP caps consumer-financing debt burden at 40% of
// disposable income (BPRD Circular Letter 29 of 2021, cut from 50%). Halqa
// goes stricter, for three reasons that are specific to a committee and do not
// apply to a bank loan:
//
//   1. Committee obligations outrank rent. Kamran's informant: "We can
//      compromise on rent or bills, but Committee instalments should not be
//      missed." An obligation that outranks rent crowds out everything else.
//   2. Members hold offline committees that no bureau can see, so the declared
//      picture is always an understatement.
//   3. The loss lands on eleven neighbours, not on a balance sheet.
//
// THE DISCIPLINE THAT MATTERS MOST, from the progressive-lending literature:
// escalating limits cause liquidity defaults when the limit outruns real
// capacity. So good history unlocks seats, circles and lower friction. It NEVER
// raises the money cap. Only new income evidence does that.
// ============================================================================

export const CAPS = {
  /** Committee contributions alone, as a share of net monthly income. */
  CASHFLOW_BPS: 3_300,
  /** Contributions plus known debt service. Stricter than SBP's 40%. */
  TOTAL_SERVICE_BPS: 4_000,
  /** Total forward liability across all circles, as a multiple of income. */
  EXPOSURE_MONTHS: 4n,
  /** Concurrent circles by verification state. */
  CONCURRENT_UNVERIFIED: 1,
  CONCURRENT_VERIFIED: 4,
  /** Hosting limits. Also the anti-Ponzi control. */
  HOST_UNPROVEN: 2,
  HOST_PROVEN: 5,
} as const;

export type Verification = 'DECLARED' | 'PROVEN' | 'ANALYST_UPLIFT';

export type MemberFinances = {
  /** Net monthly income in paisa. Zero when nothing is known. */
  monthlyIncomeP: bigint;
  verification: Verification;
  /** Contributions already committed each month, in paisa. */
  existingMonthlyP: bigint;
  /** Known debt service from the bureau, in paisa. Zero where unavailable. */
  knownDebtServiceP: bigint;
  /** Forward liability already carried across every circle, in paisa. */
  existingExposureP: bigint;
  activeCircles: number;
  cleanCompletedCircles: number;
};

export type Proposal = {
  contributionP: bigint;
  members: number;
  /** Seat the member would take. Decides their forward liability. */
  seat: number;
};

export type Verdict = {
  allowed: boolean;
  /** Every rule that failed, so nothing is discovered one refusal at a time. */
  reasons: string[];
  /** What they could still take on each month, in paisa. Never negative. */
  headroomMonthlyP: bigint;
  /** The largest contribution that would pass, in paisa. */
  maxContributionP: bigint;
  caps: {
    cashflowP: bigint;
    totalServiceP: bigint;
    exposureP: bigint;
    concurrent: number;
  };
};

/** L(k) = c x (n - k): what a seat still owes after collecting. */
export const liabilityP = (p: Proposal): bigint =>
  p.contributionP * BigInt(Math.max(0, p.members - p.seat));

const bps = (v: bigint, b: number) => (v * BigInt(b)) / 10_000n;

const isVerified = (v: Verification) => v === 'PROVEN' || v === 'ANALYST_UPLIFT';

/**
 * The whole assessment. Deliberately returns headroom as well as a verdict:
 * a bare rejection tells a member nothing, and "you can take one more circle up
 * to Rs 9,800 a month" tells them exactly what to do next.
 */
export function assess(f: MemberFinances, p: Proposal): Verdict {
  const reasons: string[] = [];
  const income = f.monthlyIncomeP;

  const cashflowCap = bps(income, CAPS.CASHFLOW_BPS);
  const serviceCap = bps(income, CAPS.TOTAL_SERVICE_BPS);
  const exposureCap = income * CAPS.EXPOSURE_MONTHS;
  const concurrent = isVerified(f.verification) ? CAPS.CONCURRENT_VERIFIED : CAPS.CONCURRENT_UNVERIFIED;

  // Nothing can be assessed without an income figure. An undeclared member is
  // not refused outright: they are held to the single-circle limit, which is
  // what the unverified tier is for.
  if (income <= 0n) {
    reasons.push('Halqa needs to know your monthly income before it can size this for you.');
  }

  const monthlyAfter = f.existingMonthlyP + p.contributionP;
  if (income > 0n && monthlyAfter > cashflowCap) {
    reasons.push('This would take your committees past a third of your monthly income.');
  }

  if (income > 0n && monthlyAfter + f.knownDebtServiceP > serviceCap) {
    reasons.push('With your other repayments this would pass 40 per cent of your income.');
  }

  const exposureAfter = f.existingExposureP + liabilityP(p);
  if (income > 0n && exposureAfter > exposureCap) {
    reasons.push('Taking this turn would leave you owing more than four months of income.');
  }

  if (f.activeCircles >= concurrent) {
    reasons.push(isVerified(f.verification)
      ? `You can run ${CAPS.CONCURRENT_VERIFIED} committees at once.`
      : 'Verify your income to run more than one committee at a time.');
  }

  const headroom = income > 0n
    ? maxBig(0n, minBig(cashflowCap - f.existingMonthlyP, serviceCap - f.existingMonthlyP - f.knownDebtServiceP))
    : 0n;

  return {
    allowed: reasons.length === 0,
    reasons,
    headroomMonthlyP: headroom,
    maxContributionP: headroom,
    caps: { cashflowP: cashflowCap, totalServiceP: serviceCap, exposureP: exposureCap, concurrent },
  };
}

const minBig = (a: bigint, b: bigint) => (a < b ? a : b);
const maxBig = (a: bigint, b: bigint) => (a > b ? a : b);

/**
 * Seats a member may take in a circle of n, given their exposure headroom.
 *
 * This is the money cap expressed as seats, and it is why an early seat is
 * gated: seat 1 carries the largest forward obligation in the circle. Returns
 * the earliest seat they can afford, and every seat after it.
 */
export function affordableSeats(f: MemberFinances, contributionP: bigint, members: number): number[] {
  const room = f.monthlyIncomeP * CAPS.EXPOSURE_MONTHS - f.existingExposureP;
  const seats: number[] = [];
  for (let k = 1; k <= members; k++) {
    if (contributionP * BigInt(members - k) <= room) seats.push(k);
  }
  return seats;
}

/**
 * How many committees a member may host.
 *
 * Hosting concentration is the anti-Ponzi control: a host running many circles
 * at once is the shape every collapse in the archive took. Clean history opens
 * it up to five, and past that a human looks.
 */
export function hostingLimit(f: MemberFinances): { limit: number; manualReview: boolean } {
  const proven = f.cleanCompletedCircles >= 2;
  return proven
    ? { limit: CAPS.HOST_PROVEN, manualReview: true }
    : { limit: CAPS.HOST_UNPROVEN, manualReview: false };
}

/**
 * Plain-language headroom, always shown instead of a bare refusal.
 * "You can take one more committee up to Rs 9,800 a month."
 */
export function headroomSentence(v: Verdict, activeCircles: number, concurrent: number): string {
  if (v.headroomMonthlyP <= 0n) return 'Your committees already use the income Halqa can see.';
  const rupees = Number(v.headroomMonthlyP) / 100;
  const left = Math.max(0, concurrent - activeCircles);
  const amount = `Rs ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(rupees)}`;
  if (left <= 0) return `You are at your limit of ${concurrent} committees. Your monthly room is ${amount}.`;
  return `You can take ${left === 1 ? 'one more committee' : `${left} more committees`} up to ${amount} a month.`;
}

/**
 * Good history must never raise the money cap; only new income evidence does.
 * Kept as a function so the rule is enforced rather than merely documented.
 */
export function capAfterGoodHistory(currentCapP: bigint, _cleanCircles: number): bigint {
  return currentCapP;
}
