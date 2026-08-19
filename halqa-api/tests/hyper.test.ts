import { describe, expect, it } from 'vitest';
import {
  HYPER,
  HYPER_TICKETS_PAISA,
  allowedSeats,
  aprEquivalentBps,
  assessEntry,
  commitment,
  drawOrder,
  isValidCycleLength,
  lateRung,
  maxAllInCostPaisa,
  potPaisa,
  pseudonym,
  rosterFor,
  verifyDraw,
  withinAprCeiling,
} from '../src/lib/hyper';

const RS = (n: number) => BigInt(n) * 100n;

describe('HYPER parameters', () => {
  it('sets the roster to the cycle length: one collection a day', () => {
    expect(rosterFor(60)).toBe(60);
    expect(rosterFor(48)).toBe(48);
  });

  it('accepts 48 to 60 day cycles and rejects anything shorter', () => {
    expect(isValidCycleLength(48)).toBe(true);
    expect(isValidCycleLength(60)).toBe(true);
    expect(isValidCycleLength(47)).toBe(false);
    expect(isValidCycleLength(61)).toBe(false);
    // 15 and 30 exist only behind a Safety Vault pledge
    expect(isValidCycleLength(30)).toBe(false);
    expect(isValidCycleLength(30, true)).toBe(true);
  });

  it('offers exactly the four specified daily tickets', () => {
    expect(HYPER_TICKETS_PAISA).toEqual([10_000n, 50_000n, 100_000n, 200_000n]);
  });

  it('produces the specified pot range across the ticket and cycle bounds', () => {
    // Rs 100 a day over 60 days
    expect(potPaisa(10_000n, 60)).toBe(RS(6_000));
    // Rs 2,000 a day over 60 days
    expect(potPaisa(200_000n, 60)).toBe(RS(120_000));
  });
});

describe('the APR-equivalent ceiling', () => {
  // Worked example from the specification: Rs 500 a day, 30-day cycle,
  // pot Rs 15,000. These are the numbers the design was argued from.
  const c = 50_000n; // Rs 500 in paisa
  const days = 30;

  it('reproduces the worked table from the specification', () => {
    const pct = (paisa: bigint) => Math.round(aprEquivalentBps(paisa, days, c) / 100);
    expect(pct(RS(276))).toBe(48);   // 1.84% of pot
    expect(pct(RS(450))).toBe(78);   // 3.0% of pot
    expect(pct(RS(750))).toBe(130);  // 5.0% of pot
    expect(pct(RS(1_500))).toBe(260); // 10% of pot, nano-lender territory
  });

  it('shows why "just charge 10%" cannot be executed naively', () => {
    // Rs 1,500 on a Rs 15,000 pot feels like a modest 10%. It is 260% APR.
    const tenPercentOfPot = RS(1_500);
    expect(withinAprCeiling(tenPercentOfPot, days, c)).toBe(false);
  });

  it('holds the published 48% ceiling', () => {
    expect(HYPER.MAX_APR_BPS).toBe(4800);
    const cap = maxAllInCostPaisa(days, c);
    expect(withinAprCeiling(cap, days, c)).toBe(true);
    expect(withinAprCeiling(cap + 100n, days, c)).toBe(false);
  });

  it('permits a larger absolute fee on a longer cycle, as the formula requires', () => {
    // The advance amortises over more days, so the same rupee cost is a lower
    // rate. This is exactly why the cycle floor exists.
    expect(maxAllInCostPaisa(60, c)).toBeGreaterThan(maxAllInCostPaisa(30, c));
  });

  it('never divides by zero on a degenerate cycle', () => {
    expect(aprEquivalentBps(RS(100), 1, c)).toBe(0);
    expect(maxAllInCostPaisa(1, c)).toBe(0n);
  });
});

describe('entry gating', () => {
  const ok = {
    creditScore: 700, cleanCompletedCircles: 2, incomeVerified: true,
    hasVerifiedRaast: true, activeHyperCircles: 0,
  };

  it('admits a member who clears every gate', () => {
    expect(assessEntry(ok)).toEqual({ allowed: true, reasons: [] });
  });

  it('refuses on score, and says so', () => {
    const v = assessEntry({ ...ok, creditScore: 649 });
    expect(v.allowed).toBe(false);
    expect(v.reasons[0]).toContain('650');
  });

  it('refuses without two clean completed circles', () => {
    expect(assessEntry({ ...ok, cleanCompletedCircles: 1 }).allowed).toBe(false);
  });

  it('refuses without verified income', () => {
    expect(assessEntry({ ...ok, incomeVerified: false }).allowed).toBe(false);
  });

  it('refuses without Raast, because wallet rails eat the pot', () => {
    const v = assessEntry({ ...ok, hasVerifiedRaast: false });
    expect(v.allowed).toBe(false);
    expect(v.reasons.join(' ')).toContain('Raast');
  });

  it('allows only one HYPER circle at a time', () => {
    expect(assessEntry({ ...ok, activeHyperCircles: 1 }).allowed).toBe(false);
    expect(HYPER.MAX_CONCURRENT).toBe(1);
  });

  it('reports every failed gate at once rather than one at a time', () => {
    const v = assessEntry({ ...ok, creditScore: 400, incomeVerified: false, hasVerifiedRaast: false });
    expect(v.reasons.length).toBe(3);
  });
});

describe('the commit-reveal ballot', () => {
  const entropies = Array.from({ length: 12 }, (_, i) => ({ userId: `u${i}`, nonce: `n${i}` }));

  it('publishes a commitment that does not leak the seed', () => {
    const c = commitment('secret-seed');
    expect(c).toHaveLength(64);
    expect(c).not.toContain('secret-seed');
  });

  it('is deterministic: the same inputs always give the same order', () => {
    expect(drawOrder('seed', entropies)).toEqual(drawOrder('seed', entropies));
  });

  it('returns every member exactly once', () => {
    const order = drawOrder('seed', entropies);
    expect(order).toHaveLength(entropies.length);
    expect(new Set(order).size).toBe(entropies.length);
  });

  it('changes the order when the seed changes', () => {
    expect(drawOrder('seed-a', entropies)).not.toEqual(drawOrder('seed-b', entropies));
  });

  it('changes the order when any member contributes different entropy', () => {
    const tampered = [{ userId: 'u0', nonce: 'DIFFERENT' }, ...entropies.slice(1)];
    expect(drawOrder('seed', tampered)).not.toEqual(drawOrder('seed', entropies));
  });

  it('verifies a published order against the revealed seed', () => {
    const seed = 'seed';
    const c = commitment(seed);
    const order = drawOrder(seed, entropies);
    expect(verifyDraw(c, seed, entropies, order)).toBe(true);
  });

  it('catches a server that reveals a seed which does not match its commitment', () => {
    const order = drawOrder('seed', entropies);
    expect(verifyDraw(commitment('seed'), 'other-seed', entropies, order)).toBe(false);
  });

  it('catches a published order that was quietly reshuffled after the draw', () => {
    const seed = 'seed';
    const order = drawOrder(seed, entropies);
    const swapped = [order[1], order[0], ...order.slice(2)];
    expect(verifyDraw(commitment(seed), seed, entropies, swapped)).toBe(false);
  });
});

describe('anonymity and seat access', () => {
  it('labels members by seat, never by name', () => {
    expect(pseudonym(0)).toBe('Member #1');
    expect(pseudonym(6)).toBe('Member #7');
  });

  it('restricts everyone below Excellent to the last three seats in stage 1', () => {
    expect(allowedSeats(60, 'GOOD')).toEqual([58, 59, 60]);
    expect(allowedSeats(48, 'DECENT')).toEqual([46, 47, 48]);
  });

  it('opens every seat to Excellent', () => {
    expect(allowedSeats(60, 'EXCELLENT')).toHaveLength(60);
  });
});

describe('the daily late ladder', () => {
  it('leaves a payment inside the 12-hour grace untouched', () => {
    expect(lateRung(0)).toBeNull();
    expect(lateRung(11)).toBeNull();
    expect(HYPER.GRACE_HOURS).toBe(12);
  });

  it('steps 5, 10 then 15 per cent at 12, 36 and 60 hours', () => {
    expect(lateRung(12)).toMatchObject({ rung: 1, penaltyBps: 500, scoreDelta: -20 });
    expect(lateRung(36)).toMatchObject({ rung: 2, penaltyBps: 1000, scoreDelta: -40 });
    expect(lateRung(60)).toMatchObject({ rung: 3, penaltyBps: 1500, scoreDelta: -60 });
  });

  it('stays on the final rung rather than escalating without limit', () => {
    expect(lateRung(500)).toMatchObject({ rung: 3, penaltyBps: 1500 });
  });

  it('keeps the post-payout default far heavier than any lateness', () => {
    expect(HYPER.POST_PAYOUT_DEFAULT).toBe(-200);
    expect(Math.abs(HYPER.POST_PAYOUT_DEFAULT)).toBeGreaterThan(Math.abs(HYPER.SCORE_DAMAGE[2]));
  });
});
