import { projectedReturn } from './money';

// Sukoon/Bazaar profit engine — the halal return floor.
//
// Instead of pricing the early slots (riba risk), returns come from real,
// Shariah-compliant instruments on money that is genuinely idle:
//   1. Float sweep — the collected pool earns for the days it waits between
//      each payment and the round payout (Mudarabah on an Islamic
//      money-market sleeve).
//   2. Deposits that earn — recorded security deposits accrue at an Islamic
//      deposit scheme's rate for the depositor (their capital, their profit).
//   3. Patience weighting (Bazaar only) — the pooled float profit is shared
//      with a disclosed tilt toward later turn positions, because their
//      capital carries the circle longest. Funded by real profit only —
//      never by charging the early receiver.
//   4. Prize draw (opt-in) — half of a round's net float profit is given as a
//      hiba (gift) to one on-time payer, chosen deterministically from the
//      round seed. Principal is never staked; framing requires Shariah
//      sign-off before production.

export const FLOAT_SCHEME_SLUG = 'islamic-money-market-fund-basket';
export const DEPOSIT_SCHEME_SLUG = 'islamic-mudarabah-deposit-basket';
export const FLOAT_MUDARIB_FEE_PCT = 5n; // platform share of float profit, consistent with the investment fee

// Days a paid contribution actually sat in the pool before the payout date.
// Clamped so a stale backdated record can never fabricate months of profit.
export function floatHeldDays(paidAt: Date, payoutDate: Date): number {
  return Math.max(0, Math.min(90, Math.floor((payoutDate.getTime() - paidAt.getTime()) / 86_400_000)));
}

// Gross simulated float profit for one round: each PAID contribution earns the
// float scheme's rate for exactly the days it was held.
export function roundFloatProfit(payments: { amountPaisa: bigint; paidAt: Date | null }[], annualRatePct: number, payoutDate: Date): bigint {
  let profit = 0n;
  for (const payment of payments) {
    if (!payment.paidAt) continue;
    profit += projectedReturn(payment.amountPaisa, annualRatePct, floatHeldDays(payment.paidAt, payoutDate));
  }
  return profit;
}

// Bazaar patience weights, in tenths so bigint math stays exact: position 1
// weighs 10, the final position 20, linear in between. Disclosed at creation.
export function patienceWeightTenths(turnPosition: number, memberCount: number): bigint {
  if (memberCount <= 1) return 10n;
  const clamped = Math.max(1, Math.min(memberCount, turnPosition));
  return BigInt(10 + Math.round(10 * (clamped - 1) / (memberCount - 1)));
}

// Early-bird boost: a member who recorded at least three quarters of their
// paid contributions three or more days before the due date carries a 1.25x
// weight in the completion profit split. Early money genuinely sits in the
// float longer, so the boost is funded by profit the early payer helped
// create — a profit-sharing ratio agreed up front, not a charge on anyone.
export const EARLY_BIRD_DAYS = 3;
export function qualifiesEarlyBird(earlyCount: number, paidCount: number): boolean {
  return paidCount > 0 && earlyCount * 4 >= paidCount * 3;
}
// Weights multiply: base patience weight (tenths) x 5/4 when the boost
// applies, kept as integer math (x5 vs x4) so proportions stay exact.
export const earlyBirdFactor = (qualified: boolean): bigint => (qualified ? 5n : 4n);

// Deterministic prize pick (djb2 over the seed) so replays and tests agree.
export function pickPrizeIndex(seed: string, count: number): number {
  if (count <= 0) return -1;
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) hash = ((hash * 33) ^ seed.charCodeAt(i)) >>> 0;
  return hash % count;
}
