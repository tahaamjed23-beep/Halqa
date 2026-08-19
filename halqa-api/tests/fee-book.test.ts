import { describe, expect, it } from 'vitest';
import {
  FEES, cycleFeePaisa, feeShareBps, feeSchedule, marketplaceCutPaisa,
  maxPremiumPaisa, penaltyDestination, quoteInstallmentFee, rehabilitationFeePaisa,
} from '../src/lib/fee-book';

const RS = (n: number) => BigInt(Math.round(n * 100));

describe('the one member fee', () => {
  it('is Rs 50 flat per installment', () => {
    expect(quoteInstallmentFee().totalPaisa).toBe(RS(50));
    expect(FEES.PER_INSTALLMENT_PAISA).toBe(RS(50));
  });

  it('does not change with the size of the committee', () => {
    // The fee that scaled with the pot is what killed Razq.
    expect(feeShareBps(RS(500))).toBe(1000);    // 10% of a tiny turn
    expect(feeShareBps(RS(10_000))).toBe(50);   // 0.5% of a normal turn
    expect(quoteInstallmentFee().totalPaisa).toBe(RS(50));
  });

  it('adds the uplift only on a circle Halqa filled', () => {
    expect(quoteInstallmentFee({ halqaFilled: true }).totalPaisa).toBe(RS(75));
  });

  it('applies the verified-income discount and shows it as a credit', () => {
    const q = quoteInstallmentFee({ discountBps: 8000 });
    expect(q.totalPaisa).toBe(RS(10));
    expect(q.discountPaisa).toBe(RS(40));
    expect(q.lines.some(l => l.amountPaisa < 0n)).toBe(true);
  });

  it('never discounts more than 80 per cent, however large the input', () => {
    expect(quoteInstallmentFee({ discountBps: 99_999 }).totalPaisa).toBe(RS(10));
  });

  it('quotes the whole cycle so nothing is discovered later', () => {
    expect(cycleFeePaisa(12)).toBe(RS(600));
    expect(cycleFeePaisa(12, { discountBps: 8000 })).toBe(RS(120));
  });
});

describe('marketplace', () => {
  it('takes 10 per cent of the premium and nothing from the pot', () => {
    expect(marketplaceCutPaisa(RS(1_000))).toBe(RS(100));
    expect(marketplaceCutPaisa(0n)).toBe(0n);
  });
  it('caps a premium at half the payout', () => {
    expect(maxPremiumPaisa(RS(60_000))).toBe(RS(30_000));
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
    for (const c of ['INSTALLMENT','JOIN','CREATE','PAYOUT','RAIL','MARKETPLACE','DISCOUNT']) {
      expect(codes).toContain(c);
    }
  });
  it('states plainly that Halqa never takes a share of the pot', () => {
    expect(feeSchedule().find(r => r.code === 'PAYOUT')?.value).toBe('Free');
  });
});
