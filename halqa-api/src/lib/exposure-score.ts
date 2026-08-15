// HYPER exposure score — one number that collapses every possible failure
// pattern in a daily committee onto a single, live, dimensionless ratio.
//
// A 400-member / 60-day circle can fail in unlimited ways: ten members stop on
// day three, forty on day thirty, one on day fifty-nine. Enumerating those is
// hopeless and unnecessary, because the arithmetic collapses.
//
// A member who collects on day k and stops immediately costs the circle the
// contributions they still owe, LESS the fees they already paid:
//
//     cost(k) = c·(T − k) − φ·k
//
// Summed over n defaulters whose collection days average k̄, every individual
// day cancels out and only two numbers survive:
//
//     damage = n · (c + φ) · (T − k̄)
//
// Divide that by the fee income the circle would earn if nobody defaulted
// (φ·N·T) and you get a ratio that is independent of circle size, contribution
// and currency:
//
//     R = n · (c + φ) · (T − k̄)  ÷  (φ · N · T)
//
// R = 1 is exact break-even: fee income equals what was advanced. Below 1 the
// circle funds itself; above 1 it does not. Because R is computed from defaults
// ALREADY OBSERVED it is a measurement, not a forecast, which is what makes it
// safe to wire to automatic actions rather than to a report somebody reads.
//
// The default rate alone cannot do this job. Twelve members walking on day 50
// and the same twelve walking on day 5 are identical default rates and opposite
// outcomes; R separates them (0.19 versus 1.75 on the reference circle).

export type ExposureBand =
  | 'SELF_FUNDING'   // R < 0.80  — paying for itself with margin
  | 'DESIGN'         // 0.80–1.00 — where a normal cycle sits
  | 'ABSORBING'      // 1.00–1.25 — the circle's own other revenue covers it
  | 'COVER'          // 1.25–1.60 — the cover facility pays
  | 'TAKAFUL';       // > 1.60    — aggregate cap reached, reinsurance attaches

// Thresholds live here alone so retuning is a one-line change. They are set
// against the reference daily product (Rs 250/day, 60 days, 400 members,
// Rs 15,000 pot, 15% fee → Rs 900,000 of fee income) and against the other
// revenue that circle earns before day one: auction premiums, the fee uplift
// and late fees, which together absorb roughly a quarter of the fee income.
export const EXPOSURE_THRESHOLDS = { design: 0.80, breakEven: 1.00, cover: 1.25, takaful: 1.60 } as const;

export const bandOf = (r: number): ExposureBand =>
  r >= EXPOSURE_THRESHOLDS.takaful ? 'TAKAFUL'
  : r >= EXPOSURE_THRESHOLDS.cover ? 'COVER'
  : r >= EXPOSURE_THRESHOLDS.breakEven ? 'ABSORBING'
  : r >= EXPOSURE_THRESHOLDS.design ? 'DESIGN'
  : 'SELF_FUNDING';

export const BAND_LABEL: Record<ExposureBand, string> = {
  SELF_FUNDING: 'Self funding',
  DESIGN: 'Design band',
  ABSORBING: 'Absorbing',
  COVER: 'Cover engages',
  TAKAFUL: 'Takaful attaches',
};

// What the platform does on its own when a band is entered. These are the
// automatic actions; nothing here needs a human to notice a number moved.
export const BAND_ACTION: Record<ExposureBand, string> = {
  SELF_FUNDING: 'No action. The committee is paying for itself with margin.',
  DESIGN: 'No action. This is where a normal cycle sits.',
  ABSORBING: 'Tighten new admissions to this tier and raise the next cohort\'s auction reserve. Circle revenue still covers the shortfall.',
  COVER: 'Engage the cover facility. Every member is still paid on time; Halqa carries it and pursues the defaulters as advances.',
  TAKAFUL: 'Aggregate cap reached. Notify the takaful operator and freeze new circles on this tier pending review.',
};

export type Defaulter = {
  /** 1-based day (or round) on which this member COLLECTED the pot. */
  collectedOnDay: number;
};

export type ExposureInput = {
  members: number;             // N — roster size
  totalDays: number;           // T — cycle length in collection periods
  contributionPaisa: bigint;   // c — one contribution
  feePaisa: bigint;            // φ — Halqa's fee per contribution
  /** Members who collected and then stopped paying. Members who stopped
   *  BEFORE collecting are excluded: they never received a pot, so they cost
   *  the circle nothing beyond a roster gap (see exit-ladder.ts). */
  defaulters: Defaulter[];
};

export type ExposureResult = {
  score: number;                  // R, rounded to 4dp
  band: ExposureBand;
  label: string;
  action: string;
  defaulterCount: number;
  meanCollectionDay: number;      // k̄
  damagePaisa: bigint;            // n·(c+φ)·(T−k̄)
  maxFeeIncomePaisa: bigint;      // φ·N·T
  netPositionPaisa: bigint;       // maxFeeIncome − damage (negative = loss)
  coverEngaged: boolean;
  takafulAttached: boolean;
  /** How many more defaulters at the current mean day would tip the next band.
   *  Null once the top band is reached. */
  headroomDefaulters: number | null;
};

const round4 = (n: number) => Math.round(n * 10_000) / 10_000;

export function assessExposure(input: ExposureInput): ExposureResult {
  const { members, totalDays, contributionPaisa, feePaisa } = input;
  const n = input.defaulters.length;

  const maxFeeIncomePaisa = feePaisa * BigInt(members) * BigInt(totalDays);

  // A circle with no fee income has no denominator — treat any damage as
  // unbounded rather than dividing by zero.
  if (maxFeeIncomePaisa <= 0n || members <= 0 || totalDays <= 0) {
    const band: ExposureBand = n > 0 ? 'TAKAFUL' : 'SELF_FUNDING';
    return {
      score: n > 0 ? Number.POSITIVE_INFINITY : 0, band, label: BAND_LABEL[band], action: BAND_ACTION[band],
      defaulterCount: n, meanCollectionDay: 0, damagePaisa: 0n, maxFeeIncomePaisa: 0n,
      netPositionPaisa: 0n, coverEngaged: n > 0, takafulAttached: n > 0, headroomDefaulters: null,
    };
  }

  if (n === 0) {
    return {
      score: 0, band: 'SELF_FUNDING', label: BAND_LABEL.SELF_FUNDING, action: BAND_ACTION.SELF_FUNDING,
      defaulterCount: 0, meanCollectionDay: 0, damagePaisa: 0n, maxFeeIncomePaisa,
      netPositionPaisa: maxFeeIncomePaisa, coverEngaged: false, takafulAttached: false,
      headroomDefaulters: headroom(0, 0, input, maxFeeIncomePaisa),
    };
  }

  // Clamp each collection day into [1, T]: a day outside the cycle is a data
  // error, and clamping keeps a bad row from inverting the sign of the damage.
  const days = input.defaulters.map(d => Math.min(Math.max(d.collectedOnDay, 1), totalDays));
  const meanCollectionDay = days.reduce((a, b) => a + b, 0) / n;

  // damage = n · (c + φ) · (T − k̄). Days remaining is scaled by 1000 before the
  // bigint multiply so a fractional mean day survives integer arithmetic.
  const daysRemainingMilli = BigInt(Math.round(Math.max(0, totalDays - meanCollectionDay) * 1000));
  const damagePaisa = (BigInt(n) * (contributionPaisa + feePaisa) * daysRemainingMilli) / 1000n;

  const score = round4(Number(damagePaisa) / Number(maxFeeIncomePaisa));
  const band = bandOf(score);

  return {
    score, band, label: BAND_LABEL[band], action: BAND_ACTION[band],
    defaulterCount: n, meanCollectionDay: round4(meanCollectionDay),
    damagePaisa, maxFeeIncomePaisa,
    netPositionPaisa: maxFeeIncomePaisa - damagePaisa,
    coverEngaged: score >= EXPOSURE_THRESHOLDS.cover,
    takafulAttached: score >= EXPOSURE_THRESHOLDS.takaful,
    headroomDefaulters: headroom(score, meanCollectionDay, input, maxFeeIncomePaisa),
  };
}

// How many additional defaulters, at the current mean collection day, would
// push the circle into the next band. Answers the only operational question a
// host or an underwriter actually asks: how much room is left?
function headroom(score: number, meanDay: number, input: ExposureInput, maxFee: bigint): number | null {
  const next = [EXPOSURE_THRESHOLDS.design, EXPOSURE_THRESHOLDS.breakEven, EXPOSURE_THRESHOLDS.cover, EXPOSURE_THRESHOLDS.takaful]
    .find(t => t > score);
  if (next === undefined) return null;
  // Use the current mean day, or the midpoint of the cycle when there are no
  // defaults yet and therefore no mean to speak of.
  const k = meanDay > 0 ? meanDay : (input.totalDays + 1) / 2;
  const perDefaulter = Number(input.contributionPaisa + input.feePaisa) * Math.max(0, input.totalDays - k);
  if (perDefaulter <= 0) return null;
  const roomPaisa = (next - score) * Number(maxFee);
  return Math.max(0, Math.floor(roomPaisa / perDefaulter));
}

/** Convenience: the reference daily product, for previews and documentation. */
export const REFERENCE_HYPER = {
  members: 400,
  totalDays: 60,
  contributionPaisa: 25_000n,   // Rs 250
  feePaisa: 3_750n,             // 15% of the contribution
  potPaisa: 1_500_000n,         // Rs 15,000 — the hard cap on this product
} as const;
