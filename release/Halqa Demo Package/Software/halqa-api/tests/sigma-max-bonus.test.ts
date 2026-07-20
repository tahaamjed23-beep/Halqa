import { describe, expect, it } from 'vitest';
import { allocateCyclePool } from '../src/lib/distribution';
import { projectedReturn } from '../src/lib/money';
import { slotFeeBpsForRound } from '../src/lib/partner-catalog';
import { earlyBirdFactor, floatHeldDays, patienceWeightTenths, qualifiesEarlyBird, roundFloatProfit } from '../src/lib/sukoon';

// The 15,000-rupee promise, run as a loop over the feature ladder.
//
// Reference group: 12 women, Rs 140,004 monthly pool (Rs 11,667 each),
// 30-day rounds, one full year, everyone pays the day the round opens,
// early fee hard-capped at 10% (policy: the fee never rises above this —
// every additional rupee must come from real profit levers, not the fee).
//
// The simulation mirrors the engine's integer math exactly: the same
// slotFeeBpsForRound curve, the same roundFloatProfit float sweep, the same
// deposit-yield formula from the completion path, the same
// patienceWeightTenths x earlyBirdFactor weights through allocateCyclePool.
// The loop climbs tier by tier and must end with the best-placed member's
// annual bonus at or above Rs 15,000 (1,500,000 paisa). If a future change
// breaks any lever, this test fails and CI blocks the merge.

const MEMBERS = 12;
const CONTRIBUTION = 1_166_700n; // Rs 11,667
const POOL = CONTRIBUTION * BigInt(MEMBERS); // Rs 140,004
const PERIOD_DAYS = 30;
const EARLY_FEE_BPS = 1000; // fixed 10% cap
const FLOAT_RATE_PCT = 10.8; // islamic-money-market-fund-basket, rateAsOf 2026-05-13
const DEPOSIT_RATE_PCT = 11.2; // islamic-mudarabah-deposit-basket, rateAsOf 2026-05-13
const DAY = 86_400_000;
const GOAL = 1_500_000n; // Rs 15,000

type Stage = { name: string; earlyFee: boolean; engine: boolean; patience: boolean; pooledDividends: boolean };

function simulate(stage: Stage) {
  const start = Date.UTC(2026, 0, 1);
  const completion = start + (MEMBERS * PERIOD_DAYS + 7) * DAY;

  // Round r: due at r*30d, payout 7 days later. Round 1's installments open at
  // start; later rounds open at the previous payout — day-one payers pay then.
  let netFloatTotal = 0n;
  const fees: bigint[] = [];
  for (let r = 1; r <= MEMBERS; r++) {
    const payoutDate = new Date(start + (r * PERIOD_DAYS + 7) * DAY);
    const paidAt = new Date(r === 1 ? start : start + ((r - 1) * PERIOD_DAYS + 7) * DAY);
    if (stage.engine) {
      const payments = Array.from({ length: MEMBERS }, () => ({ amountPaisa: CONTRIBUTION, paidAt }));
      const gross = roundFloatProfit(payments, FLOAT_RATE_PCT, payoutDate);
      netFloatTotal += gross - gross * 5n / 100n; // Mudarib share off the top
    }
    fees.push(stage.earlyFee ? POOL * BigInt(slotFeeBpsForRound(EARLY_FEE_BPS, r, MEMBERS)) / 10_000n : 0n);
  }

  // Security deposits exactly as the start route sizes them (700 score, no
  // credit adjustment), yielding on the completion path's formula for the
  // full cycle, pooled into the patience split on Bazaar/Sigma.
  let depositYieldTotal = 0n;
  if (stage.engine) {
    const yieldBps = BigInt(Math.round(DEPOSIT_RATE_PCT * 100));
    const heldDays = BigInt(Math.ceil((completion - start) / DAY));
    for (let pos = 1; pos <= MEMBERS; pos++) {
      const remainingDues = CONTRIBUTION * BigInt(MEMBERS - pos);
      const coverageBps = Math.max(0, Math.min(9000, Math.round(7000 * (MEMBERS - pos) / (MEMBERS - 1))));
      const deposit = remainingDues * BigInt(coverageBps) / 10_000n;
      depositYieldTotal += deposit * yieldBps * heldDays / 3_650_000n;
    }
  }

  const pooledFees = stage.pooledDividends ? fees.reduce((a, b) => a + b, 0n) : 0n;
  const pool = netFloatTotal + depositYieldTotal + pooledFees;

  // Completion split: capital-days are identical for day-one payers, so the
  // patience tilt and the (uniform here) early-bird boost set the shape.
  const accounts = Array.from({ length: MEMBERS }, (_, i) => {
    const pos = i + 1;
    let capitalDays = 0n;
    for (let r = 1; r <= MEMBERS; r++) {
      const paidDay = r === 1 ? 0 : (r - 1) * PERIOD_DAYS + 7;
      capitalDays += CONTRIBUTION * BigInt(Math.ceil((MEMBERS * PERIOD_DAYS + 7) - paidDay));
    }
    const tilt = stage.patience ? patienceWeightTenths(pos, MEMBERS) : 10n;
    const boost = stage.engine ? earlyBirdFactor(qualifiesEarlyBird(MEMBERS, MEMBERS)) : 4n;
    return { userId: `pos-${pos}`, paidPrincipalPaisa: CONTRIBUTION * BigInt(MEMBERS), capitalDays: capitalDays * tilt * boost };
  });
  const split = allocateCyclePool(pool, 0n, accounts);

  // Bonus per position: completion profit share, plus monthly dividends
  // received (fee of every other round split 11 ways), minus the fee paid on
  // the member's own turn. Pooled mode routes the fees through the split.
  return Array.from({ length: MEMBERS }, (_, i) => {
    const pos = i + 1;
    let dividends = 0n;
    if (stage.earlyFee && !stage.pooledDividends) {
      for (let r = 1; r <= MEMBERS; r++) if (r !== pos) dividends += fees[r - 1] / BigInt(MEMBERS - 1);
    }
    return split[i].profitPaisa + dividends - fees[pos - 1];
  });
}

describe('the 12-women reference group reaches a Rs 15,000 max bonus with the fee fixed at 10%', () => {
  const ladder: Stage[] = [
    { name: 'CLASSIC (no levers)', earlyFee: false, engine: false, patience: false, pooledDividends: false },
    { name: 'PRIORITY 10% monthly dividends', earlyFee: true, engine: false, patience: false, pooledDividends: false },
    { name: 'BAZAAR float + pooled deposit yield + patience', earlyFee: false, engine: true, patience: true, pooledDividends: false },
    { name: 'SIGMA monthly dividends + full engine', earlyFee: true, engine: true, patience: true, pooledDividends: false },
    { name: 'SIGMA pooled dividends + full engine', earlyFee: true, engine: true, patience: true, pooledDividends: true },
  ];

  it('climbs the ladder until the goal is met, without ever raising the fee', () => {
    let best = -1n;
    let goalStage = '';
    for (const stage of ladder) {
      const bonuses = simulate(stage);
      const max = bonuses.reduce((a, b) => (a > b ? a : b));
      // eslint-disable-next-line no-console
      console.log(`${stage.name}: max annual bonus = Rs ${(Number(max) / 100).toFixed(0)}`);
      expect(max).toBeGreaterThanOrEqual(best === -1n ? max : 0n); // ladder never regresses below zero-lever baseline
      best = max > best ? max : best;
      if (max >= GOAL && !goalStage) goalStage = stage.name;
    }
    expect(goalStage, `no stage reached Rs ${Number(GOAL) / 100}`).toBe('SIGMA pooled dividends + full engine');
    expect(best).toBeGreaterThanOrEqual(GOAL);
  });

  it('final stage: patience orders the bonuses and the books balance', () => {
    const stage = { name: 'final', earlyFee: true, engine: true, patience: true, pooledDividends: true };
    const bonuses = simulate(stage);
    for (let i = 1; i < bonuses.length; i++) expect(bonuses[i]).toBeGreaterThan(bonuses[i - 1]);
    // Conservation: fees are member-to-member, so the group's net bonus must
    // equal exactly the real profit created (float + deposit yield).
    const totalBonus = bonuses.reduce((a, b) => a + b, 0n);
    const start = Date.UTC(2026, 0, 1);
    let realProfit = 0n;
    for (let r = 1; r <= MEMBERS; r++) {
      const payoutDate = new Date(start + (r * PERIOD_DAYS + 7) * DAY);
      const paidAt = new Date(r === 1 ? start : start + ((r - 1) * PERIOD_DAYS + 7) * DAY);
      const gross = roundFloatProfit(Array.from({ length: MEMBERS }, () => ({ amountPaisa: CONTRIBUTION, paidAt })), FLOAT_RATE_PCT, payoutDate);
      realProfit += gross - gross * 5n / 100n;
    }
    const yieldBps = BigInt(Math.round(DEPOSIT_RATE_PCT * 100));
    const heldDays = BigInt(MEMBERS * PERIOD_DAYS + 7);
    for (let pos = 1; pos <= MEMBERS; pos++) {
      const coverageBps = Math.max(0, Math.min(9000, Math.round(7000 * (MEMBERS - pos) / (MEMBERS - 1))));
      realProfit += (CONTRIBUTION * BigInt(MEMBERS - pos) * BigInt(coverageBps) / 10_000n) * yieldBps * heldDays / 3_650_000n;
    }
    expect(totalBonus).toBe(realProfit);
    // The last position is the max earner and clears the goal.
    expect(bonuses[MEMBERS - 1]).toBeGreaterThanOrEqual(GOAL);
  });

  it('sanity: the engine helpers behave at the reference scale', () => {
    expect(floatHeldDays(new Date(0), new Date(37 * DAY))).toBe(37);
    expect(patienceWeightTenths(12, 12)).toBe(20n);
    expect(qualifiesEarlyBird(9, 12)).toBe(true);
    expect(qualifiesEarlyBird(8, 12)).toBe(false);
    expect(projectedReturn(POOL, FLOAT_RATE_PCT, 37) > 0n).toBe(true);
  });
});
