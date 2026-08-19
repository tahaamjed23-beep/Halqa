import { describe, expect, it } from 'vitest';
import {
  CAPS, affordablePotP, affordableSeats, assess, capAfterGoodHistory, concurrencyWeight,
  durationWeight, headroomSentence, hostingLimit, ratingWeight, weightedLoadBps,
  type Holding, type MemberFinances,
} from '../src/lib/affordability';

const RS = (n: number) => BigInt(Math.round(n * 100));

const hold = (o: Partial<Holding> = {}): Holding =>
  ({ contributionP: RS(2_500), rounds: 12, roundsRemaining: 12, seat: 12, grade: 'B', ...o });

const member = (o: Partial<MemberFinances> = {}): MemberFinances => ({
  monthlyIncomeP: RS(30_000), verification: 'PROVEN', knownDebtServiceP: 0n,
  holdings: [], cleanCompletedCircles: 3, ...o,
});

describe('spreading is the product', () => {
  it('lets someone on Rs 30,000 a month collect a Rs 30,000 pot', () => {
    // Across 12 members that is Rs 2,500 a month, which is 8% of income.
    // The pot size is not the test; the installment is.
    expect(assess(member(), hold({ contributionP: RS(2_500), rounds: 12 })).allowed).toBe(true);
  });

  it('lets the same member take a far bigger pot if it is spread further', () => {
    // Rs 2,500 a month across 24 members is a Rs 60,000 pot at the same monthly
    // cost, so it must also pass.
    expect(assess(member(), hold({ contributionP: RS(2_500), rounds: 24 })).allowed).toBe(true);
  });

  it('refuses the same pot squeezed into too few months', () => {
    // Rs 30,000 over 3 members is Rs 10,000 a month, past the cap once anything
    // else exists.
    const v = assess(member({ holdings: [hold({ contributionP: RS(2_000) })] }),
                     hold({ contributionP: RS(10_000), rounds: 3 }));
    expect(v.allowed).toBe(false);
  });

  it('reports the pot a member could afford at a given length', () => {
    expect(affordablePotP(member(), 12)).toBe(RS(9_900) * 12n);
    expect(affordablePotP(member(), 24)).toBeGreaterThan(affordablePotP(member(), 12));
  });
});

describe('the first three committees are judged only on the monthly cost', () => {
  it('does not interrogate a member running one affordable committee', () => {
    const v = assess(member({ holdings: [hold()] }), hold());
    expect(v.allowed).toBe(true);
    expect(v.lenientTier).toBe(true);
  });

  it('stays lenient at a third committee', () => {
    const v = assess(member({ holdings: [hold(), hold()] }), hold());
    expect(v.allowed).toBe(true);
    expect(v.lenientTier).toBe(true);
  });

  it('still refuses anything genuinely unaffordable, even the first', () => {
    const v = assess(member(), hold({ contributionP: RS(15_000) }));
    expect(v.allowed).toBe(false);
    expect(v.reasons.join(' ')).toContain('third of your monthly income');
  });
});

describe('the algorithm starts at the fourth committee', () => {
  it('leaves the lenient tier once three are held', () => {
    expect(assess(member({ holdings: [hold(), hold(), hold()] }), hold()).lenientTier).toBe(false);
  });

  it('weights each committee past the third more heavily', () => {
    expect(concurrencyWeight(1)).toBe(1);
    expect(concurrencyWeight(3)).toBe(1);
    expect(concurrencyWeight(4)).toBeCloseTo(1.15);
    expect(concurrencyWeight(6)).toBeCloseTo(1.45);
  });

  it('catches a fifth committee that the plain monthly test would wave through', () => {
    const four = Array.from({ length: 4 }, () => hold({ contributionP: RS(2_000) }));
    const v = assess(member({ holdings: four }), hold({ contributionP: RS(2_000) }));
    expect(v.loadBps).toBeGreaterThan(0);
    expect(v.allowed).toBe(false);
  });
});

describe('the circle rating counts toward the load', () => {
  it('treats a shaky circle as a heavier commitment than a healthy one', () => {
    expect(ratingWeight('A')).toBeLessThan(ratingWeight('B'));
    expect(ratingWeight('D')).toBeGreaterThan(ratingWeight('C'));
  });

  it('raises the load when the same committees sit in worse-rated circles', () => {
    const good = member({ holdings: [hold({ grade: 'A' }), hold({ grade: 'A' }), hold({ grade: 'A' })] });
    const bad = member({ holdings: [hold({ grade: 'D' }), hold({ grade: 'D' }), hold({ grade: 'D' })] });
    expect(weightedLoadBps(bad, hold({ grade: 'D' })))
      .toBeGreaterThan(weightedLoadBps(good, hold({ grade: 'A' })));
  });
});

describe('duration barely counts, and never against a cheap long committee', () => {
  it('adds only a few per cent for a long commitment', () => {
    expect(durationWeight(12)).toBe(1);
    expect(durationWeight(24)).toBeCloseTo(1.05);
  });

  it('never refuses a long committee that a short one of the same cost would pass', () => {
    expect(assess(member(), hold({ contributionP: RS(2_500), rounds: 6 })).allowed).toBe(true);
    expect(assess(member(), hold({ contributionP: RS(2_500), rounds: 36 })).allowed).toBe(true);
  });
});

describe('forward liability is a generous backstop, not the main test', () => {
  it('allows liability far above four months of income when it is spread', () => {
    // The old rule capped exposure at four months and refused this. It is a
    // Rs 2,500 monthly commitment; refusing it was wrong.
    expect(assess(member(), hold({ contributionP: RS(2_500), rounds: 36, seat: 1 })).allowed).toBe(true);
  });

  it('offers early seats to a member whose monthly cost is small', () => {
    expect(affordableSeats(member(), RS(2_500), 24)).toContain(1);
  });

  it('still catches somebody stacking committees past a year of income', () => {
    const many = Array.from({ length: 5 }, () => hold({ contributionP: RS(2_000), rounds: 36, seat: 1 }));
    const v = assess(member({ holdings: many }), hold({ contributionP: RS(2_000), rounds: 36, seat: 1 }));
    expect(v.allowed).toBe(false);
  });
});

describe('what a member is told', () => {
  it('gives headroom rather than a bare refusal', () => {
    expect(headroomSentence(assess(member(), hold()), 0)).toContain('Rs');
  });

  it('asks for income rather than refusing a member it knows nothing about', () => {
    const v = assess(member({ monthlyIncomeP: 0n, verification: 'DECLARED' }), hold());
    expect(v.reasons.join(' ')).toContain('needs to know your monthly income');
  });

  it('holds an unverified member to a single committee', () => {
    expect(assess(member({ verification: 'DECLARED', holdings: [hold()] }), hold()).allowed).toBe(false);
  });
});

describe('the progressive-lending discipline', () => {
  it('never raises the money cap for good history', () => {
    const cap = RS(9_900);
    expect(capAfterGoodHistory(cap, 0)).toBe(cap);
    expect(capAfterGoodHistory(cap, 20)).toBe(cap);
  });

  it('does raise how many circles a proven member may run', () => {
    expect(CAPS.CONCURRENT_VERIFIED).toBeGreaterThan(CAPS.CONCURRENT_UNVERIFIED);
    expect(hostingLimit(member({ cleanCompletedCircles: 0 })).limit).toBe(2);
  });
});
