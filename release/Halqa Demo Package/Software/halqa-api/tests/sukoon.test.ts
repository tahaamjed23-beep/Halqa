import { describe, expect, it } from 'vitest';
import { floatHeldDays, patienceWeightTenths, pickPrizeIndex, roundFloatProfit } from '../src/lib/sukoon';

const day = 86_400_000;

describe('float sweep', () => {
  it('earns the scheme rate for exactly the days a payment sat in the pool', () => {
    const payout = new Date('2026-07-01T00:00:00Z');
    const paidAt = new Date(payout.getTime() - 20 * day);
    // 2,000,000 paisa at 10.8% for 20 days = 2,000,000 * 0.108 * 20/365 ≈ 11,835 paisa
    const profit = roundFloatProfit([{ amountPaisa: 2_000_000n, paidAt }], 10.8, payout);
    expect(profit).toBe(11_835n);
  });
  it('ignores unpaid rows and clamps negative or absurd windows', () => {
    const payout = new Date('2026-07-01T00:00:00Z');
    expect(roundFloatProfit([{ amountPaisa: 2_000_000n, paidAt: null }], 10.8, payout)).toBe(0n);
    expect(floatHeldDays(new Date(payout.getTime() + 5 * day), payout)).toBe(0);
    expect(floatHeldDays(new Date(payout.getTime() - 400 * day), payout)).toBe(90);
  });
  it('sums profit across members', () => {
    const payout = new Date('2026-07-01T00:00:00Z');
    const paidAt = new Date(payout.getTime() - 10 * day);
    const one = roundFloatProfit([{ amountPaisa: 1_000_000n, paidAt }], 11, payout);
    const three = roundFloatProfit(Array(3).fill({ amountPaisa: 1_000_000n, paidAt }), 11, payout);
    expect(three).toBe(one * 3n);
  });
});

describe('bazaar patience weights', () => {
  it('runs linearly from 1.0x (first) to 2.0x (last)', () => {
    expect(patienceWeightTenths(1, 12)).toBe(10n);
    expect(patienceWeightTenths(12, 12)).toBe(20n);
    expect(patienceWeightTenths(1, 3)).toBe(10n);
    expect(patienceWeightTenths(2, 3)).toBe(15n);
    expect(patienceWeightTenths(3, 3)).toBe(20n);
  });
  it('is monotonic and safe at the edges', () => {
    for (let n = 2; n <= 30; n++) {
      let previous = 0n;
      for (let p = 1; p <= n; p++) {
        const weight = patienceWeightTenths(p, n);
        expect(weight >= previous).toBe(true);
        previous = weight;
      }
    }
    expect(patienceWeightTenths(1, 1)).toBe(10n);
    expect(patienceWeightTenths(99, 12)).toBe(20n);
  });
});

describe('prize draw pick', () => {
  it('is deterministic for the same seed and within range', () => {
    const a = pickPrizeIndex('circle-1:3', 7);
    expect(a).toBe(pickPrizeIndex('circle-1:3', 7));
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThan(7);
    expect(pickPrizeIndex('anything', 0)).toBe(-1);
  });
  it('varies across rounds', () => {
    const picks = new Set(Array.from({ length: 12 }, (_, round) => pickPrizeIndex(`circle-1:${round}`, 12)));
    expect(picks.size).toBeGreaterThan(3);
  });
});
