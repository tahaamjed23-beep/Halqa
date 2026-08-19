import { describe, expect, it } from 'vitest';
import {
  CAPS, affordableSeats, assess, capAfterGoodHistory, headroomSentence,
  hostingLimit, liabilityP, type MemberFinances, type Proposal,
} from '../src/lib/affordability';

const RS = (n: number) => BigInt(Math.round(n * 100));

const member = (o: Partial<MemberFinances> = {}): MemberFinances => ({
  monthlyIncomeP: RS(60_000), verification: 'PROVEN', existingMonthlyP: 0n,
  knownDebtServiceP: 0n, existingExposureP: 0n, activeCircles: 0,
  cleanCompletedCircles: 3, ...o,
});
const plan = (o: Partial<Proposal> = {}): Proposal => ({ contributionP: RS(10_000), members: 12, seat: 12, ...o });

describe('the cash-flow cap', () => {
  it('allows a committee inside a third of income', () => {
    // Rs 60,000 income, 33% is Rs 19,800. A Rs 10,000 committee fits.
    expect(assess(member(), plan()).allowed).toBe(true);
  });

  it('refuses one that pushes past a third', () => {
    const v = assess(member({ existingMonthlyP: RS(15_000) }), plan());
    expect(v.allowed).toBe(false);
    expect(v.reasons.join(' ')).toContain('third of your monthly income');
  });

  it('is stricter than the regulator, deliberately', () => {
    // SBP caps at 40%; committees outrank rent, so Halqa holds contributions
    // alone to 33% and only the combined figure to 40%.
    expect(CAPS.CASHFLOW_BPS).toBeLessThan(CAPS.TOTAL_SERVICE_BPS);
    expect(CAPS.TOTAL_SERVICE_BPS).toBe(4000);
  });

  it('counts known debt service toward the 40 per cent', () => {
    const v = assess(member({ knownDebtServiceP: RS(15_000) }), plan());
    expect(v.allowed).toBe(false);
    expect(v.reasons.join(' ')).toContain('40 per cent');
  });
});

describe('forward exposure', () => {
  it('refuses a seat that leaves a member owing more than four months of income', () => {
    // Rs 20,000 income affords a Rs 6,000 monthly contribution, but seat 1 of a
    // 24-round circle owes Rs 138,000 afterwards, against a Rs 80,000 ceiling.
    // The contribution is affordable; the SEAT is not.
    const v = assess(member({ monthlyIncomeP: RS(20_000) }), plan({ contributionP: RS(6_000), members: 24, seat: 1 }));
    expect(v.allowed).toBe(false);
    expect(v.reasons.join(' ')).toContain('four months');
  });

  it('allows the same member the same committee at a late seat', () => {
    // Identical contribution, identical circle. Only the seat changed, and with
    // it the forward obligation. This is the whole point of gating by seat.
    const v = assess(member({ monthlyIncomeP: RS(20_000) }), plan({ contributionP: RS(6_000), members: 24, seat: 24 }));
    expect(v.allowed).toBe(true);
  });

  it('prices the seat, not the circle', () => {
    expect(liabilityP(plan({ seat: 1 }))).toBe(RS(110_000));
    expect(liabilityP(plan({ seat: 12 }))).toBe(0n);
  });

  it('offers only the seats a member can carry', () => {
    const seats = affordableSeats(member({ monthlyIncomeP: RS(20_000) }), RS(6_000), 24);
    expect(seats).not.toContain(1);
    expect(seats).toContain(12);
    expect(Math.min(...seats)).toBeGreaterThan(1);
  });
});

describe('concurrency', () => {
  it('holds an unverified member to a single committee', () => {
    const v = assess(member({ verification: 'DECLARED', activeCircles: 1 }), plan());
    expect(v.allowed).toBe(false);
    expect(v.reasons.join(' ')).toContain('Verify your income');
    expect(CAPS.CONCURRENT_UNVERIFIED).toBe(1);
  });

  it('lets a verified member run four', () => {
    expect(assess(member({ activeCircles: 3 }), plan()).allowed).toBe(true);
    expect(assess(member({ activeCircles: 4 }), plan()).allowed).toBe(false);
  });

  it('limits hosting, which is the anti-Ponzi control', () => {
    expect(hostingLimit(member({ cleanCompletedCircles: 0 })).limit).toBe(2);
    const proven = hostingLimit(member({ cleanCompletedCircles: 5 }));
    expect(proven.limit).toBe(5);
    expect(proven.manualReview).toBe(true);
  });
});

describe('what a member is told', () => {
  it('reports every failed rule at once, not one at a time', () => {
    const v = assess(member({ existingMonthlyP: RS(19_000), knownDebtServiceP: RS(9_000), activeCircles: 9 }), plan({ seat: 1 }));
    expect(v.reasons.length).toBeGreaterThan(2);
  });

  it('always gives headroom in plain language rather than a bare refusal', () => {
    const v = assess(member(), plan());
    expect(headroomSentence(v, 0, 4)).toContain('Rs');
    expect(headroomSentence(v, 0, 4)).toContain('more committee');
  });

  it('says so plainly when there is no room left', () => {
    const v = assess(member({ existingMonthlyP: RS(19_800) }), plan());
    expect(headroomSentence(v, 1, 4)).toContain('already use');
  });

  it('asks for income rather than refusing a member it knows nothing about', () => {
    const v = assess(member({ monthlyIncomeP: 0n, verification: 'DECLARED' }), plan());
    expect(v.reasons.join(' ')).toContain('needs to know your monthly income');
  });
});

describe('the progressive-lending discipline', () => {
  it('never raises the money cap for good history', () => {
    // Escalating limits cause liquidity defaults when the limit outruns real
    // capacity. History unlocks seats and friction, never the amount.
    const cap = RS(19_800);
    expect(capAfterGoodHistory(cap, 0)).toBe(cap);
    expect(capAfterGoodHistory(cap, 20)).toBe(cap);
  });

  it('does raise how many circles a proven member may run', () => {
    expect(CAPS.CONCURRENT_VERIFIED).toBeGreaterThan(CAPS.CONCURRENT_UNVERIFIED);
  });
});
