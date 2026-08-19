// ============================================================================
// HYPER COMMITTEES
//
// Daily contributions, a random queue, and members who do not know each other
// and cannot see each other. Halqa runs the queue; there is no human organizer,
// which deletes the organizer-fraud topology entirely.
//
// THE GOVERNING CONSTRAINT, stated first because it decides everything else:
// anonymity removes the single strongest enforcement mechanism a committee has.
// Kamran's informant, a housemaid on Rs 15,000 a month: "We can compromise on
// rent or bills, but Committee instalments should not be missed." That ranking
// exists because the group is KNOWN. Strip the identities out and what remains
// is an unsecured 30-day advance to a stranger with a score penalty as the only
// consequence. HYPER is therefore the most heavily gated product on the
// platform, not the most open one.
//
// WHAT THIS FILE REPLACES: the first implementation ran an opening auction
// where members bid for a collection day. That is a chit fund. The discovered
// price is interest in substance, it is listed under refused features, and
// India regulates precisely that family. Seats here are drawn, never bought.
// ============================================================================

/** Daily ticket sizes. Fixed set; a member picks one, never an amount. */
export const HYPER_TICKETS_PAISA = [10_000n, 50_000n, 100_000n, 200_000n] as const;
export type HyperTicket = (typeof HYPER_TICKETS_PAISA)[number];

export const HYPER = {
  /** Cycles run 48 to 60 days. 60 is recommended and is the maximum. */
  MIN_DAYS: 48,
  MAX_DAYS: 60,
  RECOMMENDED_DAYS: 60,
  /** Shorter cycles exist only for members who pledged a Safety Vault. */
  PLEDGED_ONLY_DAYS: [15, 30],
  /** Entry gates. Every one of them, not any one of them. */
  MIN_SCORE: 650,
  MIN_CLEAN_CIRCLES: 2,
  /** One HYPER at a time: daily obligations compound too fast to stack. */
  MAX_CONCURRENT: 1,
  /** Daily cadence: the standing grace formula returns zero, so it is fixed. */
  GRACE_HOURS: 12,
  /** Late ladder, as a share of the installment, at each step of the clock. */
  LATE_LADDER: [
    { afterHours: 12, penaltyBps: 500 },
    { afterHours: 36, penaltyBps: 1000 },
    { afterHours: 60, penaltyBps: 1500 },
  ],
  /** Score damage at each rung, then the post-payout default. */
  SCORE_DAMAGE: [-20, -40, -60],
  POST_PAYOUT_DEFAULT: -200,
  /**
   * The single most important number in the design.
   *
   * Daily cadence turns every rupee of fee into a very large annualised rate,
   * and that annualised rate is the exact number a hostile journalist or an
   * SECP reviewer will compute. The 400 banned lending apps were killed by it.
   * 48% sits above what a microfinance bank charges and far below anything that
   * reads as predatory, so it is a number we can publish.
   */
  MAX_APR_BPS: 4800,
} as const;

/** A roster is exactly as long as the cycle: one collection per day. */
export const rosterFor = (days: number) => days;

export function isValidCycleLength(days: number, pledged = false): boolean {
  if (pledged && (HYPER.PLEDGED_ONLY_DAYS as readonly number[]).includes(days)) return true;
  return days >= HYPER.MIN_DAYS && days <= HYPER.MAX_DAYS;
}

/** Pot = one daily ticket from every member, once per day, for the whole cycle. */
export const potPaisa = (ticketPaisa: bigint, days: number) => ticketPaisa * BigInt(days);

// ---------------------------------------------------------------------------
// The APR-equivalent, and why it is computed this way
//
// The earliest seat in a daily circle is a genuinely short loan:
//
//   Seat 1, n rounds of c. Receives n·c on day 1 having paid c.
//   Net advance         = (n−1)c
//   Amortises by c/day to zero over (n−1) days
//   Average outstanding = (n−1)c / 2
//
// So for an all-in member cost F at seat 1:
//
//                    F              365          2 × 365 × F
//   APR       =  ───────────  ×  ───────  =  ─────────────────
//                (n−1)c / 2        n−1         (n−1)² × c
//
// Halqa's own cut is NOT the test. The borrower's total cost is the test,
// because that is the number that gets computed against us. Cover premium,
// access fee and any time-value premium paid to other members all count.
// ---------------------------------------------------------------------------

export function aprEquivalentBps(allInCostPaisa: bigint, days: number, ticketPaisa: bigint): number {
  const n = days;
  if (n <= 1 || ticketPaisa <= 0n) return 0;
  const denominator = BigInt(n - 1) * BigInt(n - 1) * ticketPaisa;
  // basis points, integer division throughout: no floating point on money
  return Number((allInCostPaisa * 2n * 365n * 10_000n) / denominator);
}

/** The largest all-in member cost that still clears the published ceiling. */
export function maxAllInCostPaisa(days: number, ticketPaisa: bigint): bigint {
  const n = days;
  if (n <= 1) return 0n;
  const denominator = BigInt(n - 1) * BigInt(n - 1) * ticketPaisa;
  return (BigInt(HYPER.MAX_APR_BPS) * denominator) / (2n * 365n * 10_000n);
}

export function withinAprCeiling(allInCostPaisa: bigint, days: number, ticketPaisa: bigint): boolean {
  return aprEquivalentBps(allInCostPaisa, days, ticketPaisa) <= HYPER.MAX_APR_BPS;
}

// ---------------------------------------------------------------------------
// Entry gating
// ---------------------------------------------------------------------------

export type HyperEntry = {
  creditScore: number;
  cleanCompletedCircles: number;
  incomeVerified: boolean;
  hasVerifiedRaast: boolean;
  activeHyperCircles: number;
  /** Stage 2 only: pledged Safety Vault units covering L(k) at the seat. */
  pledgeCoversLiability?: boolean;
};

export type EntryVerdict = { allowed: boolean; reasons: string[] };

export function assessEntry(e: HyperEntry): EntryVerdict {
  const reasons: string[] = [];
  if (e.creditScore < HYPER.MIN_SCORE) reasons.push(`A score of ${HYPER.MIN_SCORE} or above is required`);
  if (e.cleanCompletedCircles < HYPER.MIN_CLEAN_CIRCLES) {
    reasons.push(`${HYPER.MIN_CLEAN_CIRCLES} completed committees with a clean record are required`);
  }
  if (!e.incomeVerified) reasons.push('Verified income is required, by payslip or a proven salary pattern');
  // Daily cadence multiplies collection events by sixty. On wallet rails at
  // 1.5% the fees alone reach ~90% of a single pot. HYPER is a product on
  // Raast or it does not exist, so this is a creation-time gate.
  if (!e.hasVerifiedRaast) reasons.push('A verified Raast credential is required');
  if (e.activeHyperCircles >= HYPER.MAX_CONCURRENT) {
    reasons.push('Only one HYPER committee at a time');
  }
  return { allowed: reasons.length === 0, reasons };
}

// ---------------------------------------------------------------------------
// Seat assignment: a verifiable commit-reveal ballot
//
// The ballot ceremony IS the institution. A server-side random() replaces
// theatre with a black box, and black boxes get accused. So: the server
// commits to a hashed seed before the draw, every member's tap adds entropy,
// the ordering derives from the combined value, and the seed is revealed
// afterwards so anyone can recompute the result and check it.
//
// No competitor in the archive has this.
// ---------------------------------------------------------------------------

import { createHash } from 'node:crypto';

export const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/** Published before the draw. The seed itself stays secret until after. */
export const commitment = (serverSeed: string) => sha256(`halqa-ballot:${serverSeed}`);

/**
 * Derives the running order. Deterministic: the same inputs always produce the
 * same order, which is precisely what makes it checkable.
 */
export function drawOrder(serverSeed: string, entropies: { userId: string; nonce: string }[]): string[] {
  const combined = [serverSeed, ...entropies.map(e => `${e.userId}:${e.nonce}`).sort()].join('|');
  return entropies
    .map(e => ({ userId: e.userId, ticket: sha256(`${combined}#${e.userId}`) }))
    .sort((a, b) => (a.ticket < b.ticket ? -1 : a.ticket > b.ticket ? 1 : 0))
    .map(x => x.userId);
}

/** Anyone can run this against the revealed seed and confirm the published order. */
export function verifyDraw(
  publishedCommitment: string,
  revealedSeed: string,
  entropies: { userId: string; nonce: string }[],
  publishedOrder: string[],
): boolean {
  if (commitment(revealedSeed) !== publishedCommitment) return false;
  const recomputed = drawOrder(revealedSeed, entropies);
  return recomputed.length === publishedOrder.length
    && recomputed.every((id, i) => id === publishedOrder[i]);
}

// ---------------------------------------------------------------------------
// Presentation
// ---------------------------------------------------------------------------

/**
 * Members are pseudonymous to each other: no names, photos, phones or chat.
 * The label is stable for a cycle so people can follow the queue without ever
 * learning who anybody is.
 */
export const pseudonym = (seatIndex: number) => `Member #${seatIndex + 1}`;

/** Stage 1 seat access: everyone below Excellent takes one of the last 3 seats. */
export function allowedSeats(days: number, band: string): number[] {
  const n = rosterFor(days);
  if (band === 'EXCELLENT') return Array.from({ length: n }, (_, i) => i + 1);
  return [n - 2, n - 1, n];
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
