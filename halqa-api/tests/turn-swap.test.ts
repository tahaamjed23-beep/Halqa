import { describe, expect, it } from 'vitest';
import { checkSwap, liabilityAt, rateCircle, swapPreview, type SwapContext, type SwapParty } from '../src/lib/turn-swap';

const RS = (n: number) => BigInt(Math.round(n * 100));
const ctx: SwapContext = { members: 12, contributionP: RS(10_000), quarantineSeats: 3 };

const veteran = (over: Partial<SwapParty> = {}): SwapParty => ({
  userId: 'v', seat: 6, creditScore: 780, band: 'EXCELLENT',
  cleanCompletedCircles: 4, existingExposureP: 0n, monthlyIncomeP: RS(200_000), ...over,
});

describe('forward liability at a seat', () => {
  it('is the contribution times the rounds still to run', () => {
    expect(liabilityAt(1, ctx)).toBe(RS(110_000));   // owes 11 more
    expect(liabilityAt(12, ctx)).toBe(0n);           // owes nothing
  });
});

describe('a swap is checked from both ends', () => {
  it('allows a swap between two qualified members', () => {
    const r = checkSwap(veteran({ seat: 3 }), veteran({ userId: 'b', seat: 9 }), ctx);
    expect(r.ok).toBe(true);
  });

  it('stops a member buying their way into a seat the matrix closes to them', () => {
    // The seat matrix exists precisely to keep a member whose record cannot
    // speak for them off the early turns. The marketplace must not become the
    // way around it, which is the whole reason this check asks the engine.
    const newbie = veteran({ userId: 'n', seat: 11, cleanCompletedCircles: 0 });
    const r = checkSwap(veteran({ seat: 2 }), newbie, ctx);
    expect(r.ok).toBe(false);
    expect(r.reasons.join(' ')).toContain('turn 2');
  });

  it('a clean committee opens the early seats through the same engine', () => {
    // Under the matrix of 5 October 2026 one clean circle is enough, so this
    // swap is now allowed where the old two-circle quarantine refused it.
    const settled = veteran({ userId: 'n', seat: 11, cleanCompletedCircles: 1 });
    expect(checkSwap(veteran({ seat: 2 }), settled, ctx).ok).toBe(true);
  });

  it('stops a seller landing themselves in a seat their record forbids', () => {
    // The old check looked at the buyer only, so this passed. A low score on a
    // real bureau record is the one thing clean circles do not excuse, so four
    // completed circles do not get this seller into seat 2.
    const weakSeller = veteran({ userId: 's', seat: 11, creditScore: 420, creditStanding: 'SCORED' });
    const strongBuyer = veteran({ userId: 'b', seat: 2 });
    const r = checkSwap(weakSeller, strongBuyer, ctx);
    expect(r.ok).toBe(false);
    expect(r.reasons.join(' ')).toContain('seller');
  });

  it('security covering the pot opens the seat without a credit record', () => {
    // Pot is 12 x Rs 10,000 = Rs 120,000; the relaxation allows Rs 108,000.
    const secured = veteran({ userId: 'p', seat: 11, cleanCompletedCircles: 0, creditScore: 0,
      securityPledgedPaisa: 108_000 * 100 });
    expect(checkSwap(veteran({ seat: 2 }), secured, ctx).ok).toBe(true);
    const short = veteran({ userId: 'q', seat: 11, cleanCompletedCircles: 0, creditScore: 0,
      securityPledgedPaisa: 107_000 * 100 });
    expect(checkSwap(veteran({ seat: 2 }), short, ctx).ok).toBe(false);
  });

  it('refuses a seat that would push a member past four months of income', () => {
    const thin = veteran({ userId: 't', seat: 12, monthlyIncomeP: RS(20_000) });
    const r = checkSwap(veteran({ seat: 1 }), thin, ctx);
    expect(r.ok).toBe(false);
    expect(r.reasons.join(' ')).toContain('verified income');
  });

  it('refuses an unverified member any seat carrying real liability', () => {
    const unverified = veteran({ userId: 'u', seat: 12, monthlyIncomeP: 0n });
    expect(checkSwap(veteran({ seat: 1 }), unverified, ctx).ok).toBe(false);
  });

  it('reports every problem at once rather than one at a time', () => {
    const bad = veteran({ userId: 'x', seat: 12, creditScore: 420, creditStanding: 'SCORED',
      cleanCompletedCircles: 0, monthlyIncomeP: 0n });
    expect(checkSwap(veteran({ seat: 1 }), bad, ctx).reasons.length).toBeGreaterThan(1);
  });
});

describe('what both sides see before agreeing', () => {
  it('shows each party the obligation they are moving into', () => {
    const p = swapPreview(veteran({ seat: 2 }), veteran({ userId: 'b', seat: 10 }), ctx);
    expect(p.seller.to).toBe(liabilityAt(10, ctx));
    expect(p.buyer.to).toBe(liabilityAt(2, ctx));
    expect(p.buyer.collectsAt).toBe(2);
  });
});

describe('the circle rating', () => {
  const base = { members: 12, meanScore: 720, onTimeRate: 1, flagged: 0, roundsDone: 6, totalRounds: 12 };

  it('grades a clean, half-finished circle highly', () => {
    expect(rateCircle(base).grade).toBe('A');
  });

  it('drops hard when a member is in default', () => {
    const r = rateCircle({ ...base, flagged: 2 });
    expect(r.score).toBeLessThan(rateCircle(base).score);
    expect(r.note).toContain('default');
  });

  it('penalises unreliable payment', () => {
    expect(rateCircle({ ...base, onTimeRate: 0.4 }).grade).not.toBe('A');
  });

  it('treats a nearly finished circle as safer than a fresh one', () => {
    expect(rateCircle({ ...base, roundsDone: 11 }).score)
      .toBeGreaterThan(rateCircle({ ...base, roundsDone: 1 }).score);
  });

  it('never returns a score outside 0 to 100', () => {
    const worst = rateCircle({ members: 12, meanScore: 300, onTimeRate: 0, flagged: 9, roundsDone: 0, totalRounds: 12 });
    expect(worst.score).toBeGreaterThanOrEqual(0);
    expect(worst.grade).toBe('D');
  });
});
