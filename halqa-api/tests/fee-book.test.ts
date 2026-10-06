import { describe, expect, it } from 'vitest';
import {
  FEES, cycleFeePaisa, feeShareBps, feeSchedule, marketplaceCutPaisa,
  maxPremiumPaisa, penaltyDestination, quoteInstallmentFee, rehabilitationFeePaisa,
} from '../src/lib/fee-book';

const RS = (n: number) => BigInt(Math.round(n * 100));

// Updated 5 October 2026 to the chairman's pricing. The fee was Rs 50 here,
// which did not cover the Rs 35 it costs to collect a payment; it is now Rs 85,
// being that cost plus Rs 50. The turn price cap was half the pot and is now
// the whole pot (29 September 2026).
describe('the one member fee', () => {
  it('is Rs 85 flat per instalment', () => {
    expect(quoteInstallmentFee().totalPaisa).toBe(RS(85));
    expect(FEES.PER_INSTALLMENT_PAISA).toBe(RS(85));
  });

  it('does not change with the size of the committee', () => {
    // The fee that scaled with the pot is what killed Razq.
    expect(feeShareBps(RS(500))).toBe(1700);    // 17% of a tiny turn
    expect(feeShareBps(RS(10_000))).toBe(85);   // 0.85% of a normal turn
    expect(quoteInstallmentFee().totalPaisa).toBe(RS(85));
  });

  it('adds the uplift only on a circle Halqa filled', () => {
    expect(quoteInstallmentFee({ halqaFilled: true }).totalPaisa).toBe(RS(127.5));
  });

  it('applies the verified-income discount and shows it as a credit', () => {
    const q = quoteInstallmentFee({ discountBps: 8000 });
    expect(q.totalPaisa).toBe(RS(17));
    expect(q.discountPaisa).toBe(RS(68));
    expect(q.lines.some(l => l.amountPaisa < 0n)).toBe(true);
  });

  it('never discounts more than 80 per cent, however large the input', () => {
    expect(quoteInstallmentFee({ discountBps: 99_999 }).totalPaisa).toBe(RS(17));
  });

  it('OPEN QUESTION: the largest discount now falls below the cost of collecting', () => {
    // On the withdrawn grid, Rs 500 less 80 per cent still left Rs 100, above
    // the Rs 35 it costs to collect. On the flat Rs 85 it leaves Rs 17, so a
    // fully discounted instalment loses Rs 18. Recorded here rather than
    // quietly changed: the percentages are the chairman's to set.
    expect(quoteInstallmentFee({ discountBps: 8000 }).totalPaisa).toBeLessThan(FEES.RUNNING_COST_PAISA);
  });

  it('quotes the whole cycle so nothing is discovered later', () => {
    expect(cycleFeePaisa(12)).toBe(RS(1_020));
    expect(cycleFeePaisa(12, { discountBps: 8000 })).toBe(RS(204));
  });
});

describe('marketplace', () => {
  it('takes 10 per cent of the premium and nothing from the pot', () => {
    expect(marketplaceCutPaisa(RS(1_000))).toBe(RS(100));
    expect(marketplaceCutPaisa(0n)).toBe(0n);
  });
  it('caps the price of a turn at the whole pot, not half of it', () => {
    expect(maxPremiumPaisa(RS(60_000))).toBe(RS(60_000));
  });
});

describe('penalties', () => {
  it('routes to Halqa on an ordinary circle', () => {
    expect(penaltyDestination(false)).toBe('PLATFORM');
  });
  it('routes to the circle on a Shariah-labelled one', () => {
    // A fixed penalty retained as income is impermissible, so it cannot be ours.
    expect(penaltyDestination(true)).toBe('CIRCLE_POOL');
  });
  it('charges 10 per cent to rehabilitate a defaulted member', () => {
    expect(rehabilitationFeePaisa(RS(10_000))).toBe(RS(1_000));
  });
});

describe('the published schedule', () => {
  it('lists every charge a member can meet', () => {
    const codes = feeSchedule().map(r => r.code);
    // RAIL is gone: "moving the money is free" stopped being true when the
    // payment partner's 1.5 per cent went on wallet and card payments.
    for (const c of ['INSTALLMENT','PSP','TAKAFUL','HYPER','JOIN','CREATE','PAYOUT','MARKETPLACE','DISCOUNT']) {
      expect(codes).toContain(c);
    }
  });
  it('states plainly that Halqa never takes a share of the pot', () => {
    expect(feeSchedule().find(r => r.code === 'PAYOUT')?.value).toBe('Free');
  });
});
