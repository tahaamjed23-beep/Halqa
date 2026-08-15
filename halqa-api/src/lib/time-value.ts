// Time value of a turn — the feature that makes a committee economically fair
// rather than merely nominally fair.
//
// Every member pays the same total and receives the same total, so on paper
// nobody gains. That is true in rupees and false in economics: a lump sum in
// month one is worth more than the same sum in month twelve, because you have
// the use of the money for eleven extra months. Members already know this,
// which is why they argue about who goes first.
//
// The value of holding position k is the present value of the pot received at
// k, less the present value of every contribution paid across the cycle:
//
//     value(k) = P / (1+i)^k  −  c · [1 − (1+i)^−T] / i
//
// The second term does not depend on k, so the whole spectrum is driven by the
// first. Setting value(k) = 0 and solving gives the NEUTRAL position — the seat
// at which the arrangement is economically flat. On a 12-round circle at an
// ordinary household cost of money that lands around position 6.4, not at the
// last position, which is where a naive fee schedule tapers to zero.
//
// So Halqa prices it in both directions:
//   * positions BEFORE neutral pay an early-position fee that tapers to zero
//     exactly at neutral;
//   * positions AFTER neutral are CREDITED out of the pool those fees created.
//
// The pool self-balances: what the early half pays is what the late half
// receives, so the circle settles its own time value internally and Halqa takes
// nothing from the transfer. Members finish economically level instead of level
// only in nominal rupees.

export type TimeValueInput = {
  contributionPaisa: bigint;
  totalRounds: number;
  /** Annual discount rate as a decimal, e.g. 0.12 for twelve per cent. This is
   *  the member's cost of money, not a rate Halqa charges or pays. */
  annualRate?: number;
  /** Pot for one round. Defaults to contribution × members, which for a
   *  standard circle is contribution × totalRounds. */
  potPaisa?: bigint;
};

export type PositionValue = {
  position: number;
  /** Present value of the pot received at this position, in paisa. */
  potPresentValuePaisa: bigint;
  /** Positive = this position is worth money; negative = it costs money. */
  valuePaisa: bigint;
  /** Fee charged (positive) or credit paid (negative), in paisa. */
  feePaisa: bigint;
};

export type TimeValueResult = {
  annualRate: number;
  monthlyRate: number;
  /** Present value of every contribution the member makes across the cycle. */
  contributionsPresentValuePaisa: bigint;
  /** The seat at which the arrangement is economically flat, to 2dp. */
  neutralPosition: number;
  /** Spread between the first and last position, in paisa. */
  spreadPaisa: bigint;
  positions: PositionValue[];
  /** Total collected from early positions. Equals totalCreditsPaisa by
   *  construction — the schedule is balanced, not a revenue line. */
  totalFeesPaisa: bigint;
  totalCreditsPaisa: bigint;
  balanced: boolean;
};

// Default cost of money for a Pakistani household. Deliberately conservative:
// informal credit runs far higher, which would widen the spread, so using a
// modest rate understates the effect rather than overstating it.
export const DEFAULT_ANNUAL_RATE = 0.12;

// Share of a position's economic value that the schedule actually transfers.
// Below 1.0 so the fee never fully strips the advantage of going early — the
// member keeps some of the benefit they competed for, and the credit to late
// positions stays affordable out of the same pool.
export const TRANSFER_SHARE = 0.60;

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Present value of an ordinary annuity of `c` for `n` periods at rate `i`. */
function annuityPv(c: number, i: number, n: number): number {
  if (i === 0) return c * n;
  return c * (1 - Math.pow(1 + i, -n)) / i;
}

export function assessTimeValue(input: TimeValueInput): TimeValueResult {
  const T = Math.max(1, input.totalRounds);
  const annualRate = input.annualRate ?? DEFAULT_ANNUAL_RATE;
  // Convert an annual rate to the per-round rate. Rounds are treated as months,
  // which is what every monthly circle in the product actually is.
  const i = Math.pow(1 + annualRate, 1 / 12) - 1;

  const c = Number(input.contributionPaisa);
  const P = Number(input.potPaisa ?? input.contributionPaisa * BigInt(T));

  const contributionsPv = annuityPv(c, i, T);

  // Neutral position: P/(1+i)^k = contributionsPv  →  k = ln(P/PV) / ln(1+i)
  const neutralRaw = i === 0 ? (T + 1) / 2 : Math.log(P / contributionsPv) / Math.log(1 + i);
  const neutralPosition = round2(Math.min(Math.max(neutralRaw, 1), T));

  const positions: PositionValue[] = [];
  for (let k = 1; k <= T; k++) {
    const potPv = P / Math.pow(1 + i, k);
    const value = potPv - contributionsPv;
    positions.push({
      position: k,
      potPresentValuePaisa: BigInt(Math.round(potPv)),
      valuePaisa: BigInt(Math.round(value)),
      feePaisa: 0n,
    });
  }

  // Charge a share of the positive value, credit a share of the negative one.
  // Both sides use the same share, so the pool is self-balancing before the
  // rounding reconciliation below.
  for (const p of positions) {
    p.feePaisa = BigInt(Math.round(Number(p.valuePaisa) * TRANSFER_SHARE));
  }

  // Rounding will not net to exactly zero. Push the residue onto the position
  // closest to neutral, where it is economically smallest and least visible.
  const net = positions.reduce((sum, p) => sum + p.feePaisa, 0n);
  if (net !== 0n) {
    let idx = 0;
    let best = Number.POSITIVE_INFINITY;
    positions.forEach((p, j) => {
      const d = Math.abs(p.position - neutralPosition);
      if (d < best) { best = d; idx = j; }
    });
    positions[idx].feePaisa -= net;
  }

  const totalFeesPaisa = positions.filter(p => p.feePaisa > 0n).reduce((s, p) => s + p.feePaisa, 0n);
  const totalCreditsPaisa = positions.filter(p => p.feePaisa < 0n).reduce((s, p) => s - p.feePaisa, 0n);

  return {
    annualRate,
    monthlyRate: i,
    contributionsPresentValuePaisa: BigInt(Math.round(contributionsPv)),
    neutralPosition,
    spreadPaisa: positions[0].valuePaisa - positions[T - 1].valuePaisa,
    positions,
    totalFeesPaisa,
    totalCreditsPaisa,
    balanced: totalFeesPaisa === totalCreditsPaisa,
  };
}

/** What one member at one position pays (positive) or receives (negative). */
export function positionAdjustment(input: TimeValueInput, position: number): bigint {
  const result = assessTimeValue(input);
  return result.positions.find(p => p.position === position)?.feePaisa ?? 0n;
}
