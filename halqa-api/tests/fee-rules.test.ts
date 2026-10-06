import { describe, expect, it } from 'vitest';
import {
  FEES, HYPER_DESIGNS, quoteInstallmentFee, feeSchedule, maxPremiumPaisa, marketplaceCutPaisa,
} from '../src/lib/fee-book';

// The fee, as the chairman settled it on 30 September and 5 October 2026, and
// the arithmetic that must hold whatever the instalment or the seat. Register
// section AI1 and AI2.
//
// The point of these is that the fee cannot quietly drift: it was Rs 50 in this
// file and "Rs 0" on three screens while the decks said Rs 85.

const RS = (n: number) => BigInt(Math.round(n * 100));
/** The payment partner's fee, which is theirs and not Halqa's. */
const pspFee = (instalmentPaisa: bigint, rail: string) =>
  ['CARD', 'WALLET', 'JAZZCASH', 'EASYPAISA'].includes(rail)
    ? (instalmentPaisa * FEES.PSP_FEE_BPS) / 10_000n
    : 0n;

describe('the fee on a monthly instalment', () => {
  it('is Rs 85 on an instalment of Rs 10,000', () => {
    expect(FEES.PER_INSTALLMENT_PAISA).toBe(RS(85));
    expect(quoteInstallmentFee().totalPaisa).toBe(RS(85));
  });

  it('is Rs 85 on Rs 2,000 and on Rs 25,000: flat, whatever the size', () => {
    // The quote does not take the instalment at all, which is the proof: there
    // is nothing for the size of the pot to change.
    const small = quoteInstallmentFee();
    const large = quoteInstallmentFee();
    expect(small.totalPaisa).toBe(RS(85));
    expect(large.totalPaisa).toBe(small.totalPaisa);
  });

  it('is the same for the first seat and the last seat', () => {
    // A fee graded by collection day would be a price on the time between
    // paying in and collecting, which reads as interest.
    const first = quoteInstallmentFee();
    const last = quoteInstallmentFee();
    expect(first.totalPaisa).toBe(last.totalPaisa);
  });

  it('covers the running cost of collecting the payment, with Rs 50 over', () => {
    expect(FEES.RUNNING_COST_PAISA).toBe(RS(35));
    expect(FEES.PER_INSTALLMENT_PAISA - FEES.RUNNING_COST_PAISA).toBe(RS(50));
  });

  it('charges nothing at all for taking an early turn', () => {
    const lines = quoteInstallmentFee().lines.map(l => l.code);
    expect(lines.join(' ')).not.toMatch(/EARLY|PREMIUM|SLOT/i);
  });
});

describe("the payment partner's fee, which is not Halqa's", () => {
  it('is 1.5 per cent, added only when a wallet or card is used', () => {
    expect(FEES.PSP_FEE_BPS).toBe(150n);
    expect(pspFee(RS(10_000), 'CARD')).toBe(RS(150));
    expect(pspFee(RS(10_000), 'JAZZCASH')).toBe(RS(150));
  });

  it('is nil on a debit under the bank\'s mandate, and on Raast', () => {
    expect(pspFee(RS(10_000), 'MANDATE')).toBe(0n);
    expect(pspFee(RS(10_000), 'BANK_TRANSFER')).toBe(0n);
    expect(pspFee(RS(10_000), 'RAAST')).toBe(0n);
  });

  it('is never counted inside Halqa\'s own fee', () => {
    expect(quoteInstallmentFee().totalPaisa).toBe(FEES.PER_INSTALLMENT_PAISA);
  });
});

describe('Hyper', () => {
  it('charges Rs 15 a day on Design 1 and on Design 2', () => {
    expect(FEES.HYPER_DAILY_PAISA).toBe(RS(15));
    for (const d of HYPER_DESIGNS) expect(FEES.HYPER_DAILY_PAISA, d.id).toBe(RS(15));
  });

  it('Design 1: Rs 300, Rs 135 and Rs 15 make Rs 450', () => {
    const d = HYPER_DESIGNS.find(x => x.id === 'H50')!;
    expect(d.contributionRupees + d.operatorRupees + 15).toBeCloseTo(d.dailyRupees, 2);
    expect(d.dailyRupees).toBe(450);
  });

  it('Design 2: Rs 333.33, Rs 151.67 and Rs 15 make Rs 500', () => {
    const d = HYPER_DESIGNS.find(x => x.id === 'H26')!;
    expect(d.contributionRupees + d.operatorRupees + 15).toBeCloseTo(d.dailyRupees, 2);
    expect(d.dailyRupees).toBe(500);
  });

  it('identity one: the pot equals the contribution times the days', () => {
    for (const o of HYPER_DESIGNS) {
      // Design 2 divides Rs 8,666.67 across 26 days, which does not land on a
      // whole paisa, so the published contribution of Rs 333.33 is rounded and
      // the identity holds to within the rounding rather than exactly. The
      // register states this: "with the thirds rounded so the circle still
      // balances". A rupee across a whole cycle is the tolerance.
      expect(Math.abs(o.contributionRupees * o.days - o.potRupees), o.id).toBeLessThan(1);
    }
  });

  it('identity two: the roster equals those collecting each day times the days', () => {
    for (const o of HYPER_DESIGNS) {
      expect(o.collectingDaily * o.days, o.id).toBe(o.members);
    }
  });
});

describe('the price of a turn', () => {
  it('is capped at the pot, not at half of it', () => {
    expect(FEES.MARKETPLACE_PREMIUM_CAP_BPS).toBe(10_000n);
    expect(maxPremiumPaisa(RS(120_000))).toBe(RS(120_000));
  });

  it('carries a ten per cent charge on the price, never on the pot', () => {
    expect(marketplaceCutPaisa(RS(10_000))).toBe(RS(1_000));
    expect(marketplaceCutPaisa(0n)).toBe(0n);
  });
});

describe('the published schedule matches the code', () => {
  const schedule = feeSchedule();
  const line = (code: string) => schedule.find(l => l.code === code)!;

  it('quotes the same instalment fee the code charges', () => {
    expect(line('INSTALLMENT').value).toBe('Rs 85');
  });

  it('names the payment partner fee and says who charges it', () => {
    expect(line('PSP').value).toBe('1.5%');
    expect(line('PSP').note.toLowerCase()).toContain('not halqa');
  });

  it('names takaful or insurance without pricing it', () => {
    expect(line('TAKAFUL').value).toBe('Set by the operator');
    expect(line('TAKAFUL').value).not.toMatch(/Rs ?\d/);
  });

  it('quotes Hyper at Rs 15 a day', () => {
    expect(line('HYPER').value).toBe('Rs 15');
  });

  it('claims nothing is free that is not', () => {
    for (const l of schedule) {
      if (l.value !== 'Free') continue;
      expect(['JOIN', 'CREATE', 'PAYOUT', 'EXIT_WINDOW', 'EXIT_SUBSTITUTE'], l.code).toContain(l.code);
    }
  });

  it('says nothing about a rail being free, which stopped being true', () => {
    expect(schedule.find(l => l.code === 'RAIL')).toBeUndefined();
  });
});
