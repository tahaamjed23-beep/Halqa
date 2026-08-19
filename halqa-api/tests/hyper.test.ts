import { describe, expect, it } from 'vitest';
import {
  HYPER,
  advancePaisa,
  assessEntry,
  bidAllowed,
  bidAprBps,
  buildDayBook,
  daysOutstanding,
  guidePricePaisa,
  isBalanced,
  lateRung,
  maxBidPaisa,
  rosterSize,
  totalContributionPaisa,
  validateBid,
} from '../src/lib/hyper';

const RS = (n: number) => BigInt(Math.round(n * 100));
const asRupees = (p: bigint) => Number(p) / 100;

describe('HYPER shape', () => {
  it('runs 30 days with 7 collecting each day, so the roster is 210', () => {
    expect(HYPER.DAYS).toBe(30);
    expect(HYPER.SEATS_PER_DAY).toBe(7);
    expect(rosterSize()).toBe(210);
  });

  it('charges Rs 500 a day and pays a Rs 15,000 pot', () => {
    expect(HYPER.DAILY_PAISA).toBe(RS(500));
    expect(HYPER.POT_PAISA).toBe(RS(15_000));
  });

  it('balances exactly: what a member pays in equals what they collect', () => {
    expect(totalContributionPaisa()).toBe(HYPER.POT_PAISA);
    expect(isBalanced()).toBe(true);
  });

  it('balances at the circle level too', () => {
    const membersIn = BigInt(rosterSize()) * totalContributionPaisa();
    const paidOut = BigInt(rosterSize()) * HYPER.POT_PAISA;
    expect(membersIn).toBe(paidOut);
  });
});

describe('the advance an early day represents', () => {
  it('advances the pot less whatever the member has already paid', () => {
    // Day 1: paid Rs 500, collects Rs 15,000, so Rs 14,500 is advanced.
    expect(advancePaisa(1)).toBe(RS(14_500));
    // Day 15: paid Rs 7,500, so Rs 7,500 is advanced.
    expect(advancePaisa(15)).toBe(RS(7_500));
  });

  it('advances nothing on the last day, because it is all already paid', () => {
    expect(advancePaisa(30)).toBe(0n);
    expect(daysOutstanding(30)).toBe(0);
  });

  it('shrinks steadily as the cycle runs', () => {
    for (let d = 2; d <= HYPER.DAYS; d++) {
      expect(advancePaisa(d)).toBeLessThan(advancePaisa(d - 1));
    }
  });
});

describe('the bid ceiling', () => {
  it('caps the first day at about Rs 276, the specification worked example', () => {
    const cap = maxBidPaisa(1);
    expect(Math.round(asRupees(cap))).toBe(276);
  });

  it('prices that cap at exactly the published 48 per cent', () => {
    expect(bidAprBps(maxBidPaisa(1), 1)).toBeLessThanOrEqual(HYPER.MAX_APR_BPS);
    expect(bidAprBps(maxBidPaisa(1), 1)).toBeGreaterThan(HYPER.MAX_APR_BPS - 100);
  });

  it('refuses the bid that reads as a modest ten per cent of the pot', () => {
    // Rs 1,500 on a Rs 15,000 pot feels small and is far past the ceiling.
    expect(bidAllowed(RS(1_500), 1)).toBe(false);
    expect(bidAprBps(RS(1_500), 1)).toBeGreaterThan(20_000); // over 200% APR
  });

  it('falls towards nothing for the last days, because they are worth nothing', () => {
    expect(maxBidPaisa(29)).toBeLessThan(maxBidPaisa(15));
    expect(maxBidPaisa(15)).toBeLessThan(maxBidPaisa(1));
    expect(maxBidPaisa(30)).toBe(0n);
  });

  it('never lets any bid on any day exceed the ceiling', () => {
    for (let d = 1; d <= HYPER.DAYS; d++) {
      const cap = maxBidPaisa(d);
      expect(bidAprBps(cap, d)).toBeLessThanOrEqual(HYPER.MAX_APR_BPS);
      if (cap > 0n) expect(bidAllowed(cap + RS(1), d)).toBe(false);
    }
  });

  it('keeps the guide price below the hard cap', () => {
    for (let d = 1; d <= HYPER.DAYS; d++) {
      expect(guidePricePaisa(d)).toBeLessThanOrEqual(maxBidPaisa(d));
    }
  });

  it('prices a free day at zero rather than dividing by zero', () => {
    expect(bidAprBps(0n, 1)).toBe(0);
    expect(bidAprBps(RS(50), 30)).toBe(0);
  });
});

describe('the auction book', () => {
  it('lays out every day with its seats and ceiling', () => {
    const book = buildDayBook();
    expect(book).toHaveLength(30);
    expect(book[0].seats).toBe(7);
    expect(book[0].maxBidPaisa).toBe(maxBidPaisa(1));
    expect(book.every(d => !d.full)).toBe(true);
  });

  it('marks a day full once seven have taken it', () => {
    const book = buildDayBook({ 3: 7 });
    expect(book[2].full).toBe(true);
    expect(validateBid(RS(10), 3, book[2])).toMatchObject({ accepted: false });
  });

  it('requires a bid to beat the standing bid', () => {
    const book = buildDayBook({}, { 1: RS(100) });
    expect(validateBid(RS(100), 1, book[0]).accepted).toBe(false);
    expect(validateBid(RS(101), 1, book[0]).accepted).toBe(true);
  });

  it('refuses a bid above the ceiling even when it beats the standing bid', () => {
    const book = buildDayBook({}, { 1: RS(200) });
    const v = validateBid(RS(5_000), 1, book[0]);
    expect(v.accepted).toBe(false);
    expect(v.reason).toContain('ceiling');
  });

  it('refuses a day outside the cycle', () => {
    const book = buildDayBook();
    expect(validateBid(RS(10), 31, book[0]).accepted).toBe(false);
  });
});

describe('entry gating', () => {
  const ok = {
    creditScore: 700, cleanCompletedCircles: 2, salarySlipVerified: true,
    hasDailyEarningJob: true, vaultBalancePaisa: 0n,
    hasVerifiedRaast: true, activeHyperCircles: 0,
  };

  it('admits a member who clears every gate', () => {
    expect(assessEntry(ok)).toEqual({ allowed: true, reasons: [] });
  });

  it('always requires a salary slip, with no substitute', () => {
    const v = assessEntry({ ...ok, salarySlipVerified: false });
    expect(v.allowed).toBe(false);
    expect(v.reasons.join(' ')).toContain('salary slip');
  });

  it('accepts a vault balance in place of daily earnings', () => {
    expect(assessEntry({
      ...ok, hasDailyEarningJob: false, vaultBalancePaisa: HYPER.MIN_VAULT_PAISA,
    }).allowed).toBe(true);
  });

  it('refuses a member with neither daily earnings nor the vault balance', () => {
    const v = assessEntry({
      ...ok, hasDailyEarningJob: false, vaultBalancePaisa: HYPER.MIN_VAULT_PAISA - 1n,
    });
    expect(v.allowed).toBe(false);
    expect(v.reasons.join(' ')).toContain('daily earnings');
  });

  it('refuses on score, history, Raast and concurrency', () => {
    expect(assessEntry({ ...ok, creditScore: 649 }).allowed).toBe(false);
    expect(assessEntry({ ...ok, cleanCompletedCircles: 1 }).allowed).toBe(false);
    expect(assessEntry({ ...ok, hasVerifiedRaast: false }).allowed).toBe(false);
    expect(assessEntry({ ...ok, activeHyperCircles: 1 }).allowed).toBe(false);
  });
});

describe('the daily late ladder', () => {
  it('leaves a payment inside the 12-hour grace untouched', () => {
    expect(lateRung(11)).toBeNull();
    expect(HYPER.GRACE_HOURS).toBe(12);
  });

  it('steps 5, 10 then 15 per cent at 12, 36 and 60 hours', () => {
    expect(lateRung(12)).toMatchObject({ rung: 1, penaltyBps: 500, scoreDelta: -20 });
    expect(lateRung(36)).toMatchObject({ rung: 2, penaltyBps: 1000, scoreDelta: -40 });
    expect(lateRung(60)).toMatchObject({ rung: 3, penaltyBps: 1500, scoreDelta: -60 });
  });

  it('keeps the post-payout default heavier than any lateness', () => {
    expect(Math.abs(HYPER.POST_PAYOUT_DEFAULT)).toBeGreaterThan(Math.abs(HYPER.SCORE_DAMAGE[2]));
  });
});
