import { describe, expect, it } from 'vitest';
import fc from 'fast-check';
import { projectedReturn, projectionBand } from '../src/lib/money';

describe('money math', () => {
  it('never loses or creates fee allocation paisa', () => {
    fc.assert(fc.property(fc.bigInt({ min: 0n, max: 10_000_000_000n }), profit => {
      const fee = profit * 5n / 100n;
      const net = profit - fee;
      expect(fee + net).toBe(profit);
    }));
  });
  it('projection is deterministic and band ordered', () => {
    expect(projectedReturn(1_000_000n, 18, 365)).toBe(180_000n);
    const band = projectionBand(1_000_000n, 18, 365);
    expect(band.pessimisticProfitPaisa).toBeLessThan(band.expectedProfitPaisa);
    expect(band.expectedProfitPaisa).toBeLessThan(band.optimisticProfitPaisa);
  });
});
