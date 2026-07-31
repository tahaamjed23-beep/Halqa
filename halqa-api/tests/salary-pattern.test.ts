import { describe, expect, it } from 'vitest';
import { CLUSTER_TOLERANCE, DAY_TOLERANCE, dayDistance, readPattern, readSignals } from '../src/lib/salary-pattern';

// The salary-pattern verifier: our own collection outcomes by calendar day are
// the evidence, and the rules here are what "verified payday" means. Pure
// functions — no DB — so the maths is pinned independently of the sweep.

const at = (iso: string) => new Date(iso);
const collected = (iso: string, day: number) => ({ calendarDay: day, outcome: 'COLLECTED', attemptedAt: at(iso) });
const failed = (iso: string, day: number) => ({ calendarDay: day, outcome: 'FAILED', attemptedAt: at(iso) });

describe('salary pattern', () => {
  it('wrap-around day distance treats month-end and month-start as neighbours', () => {
    expect(dayDistance(1, 29)).toBe(3);
    expect(dayDistance(15, 15)).toBe(0);
    expect(dayDistance(5, 20)).toBe(15);
    expect(dayDistance(31, 1)).toBe(1);
  });

  it('one month of data is a cold start, never a verdict', () => {
    const read = readPattern([collected('2026-05-02T09:00:00Z', 2)]);
    expect(read.monthsObserved).toBe(1);
    expect(read.consistent).toBe(false);
  });

  it('two consistent months learn the payday from the first success of each month', () => {
    const read = readPattern([
      failed('2026-05-25T09:00:00Z', 25),
      collected('2026-06-02T09:00:00Z', 2),
      collected('2026-06-15T09:00:00Z', 15), // later same-month success is ignored
      collected('2026-07-03T09:00:00Z', 3),
    ]);
    expect(read.monthsObserved).toBe(2);
    expect(read.consistent).toBe(true);
    expect(read.learnedDay).toBeGreaterThanOrEqual(2);
    expect(read.learnedDay).toBeLessThanOrEqual(3);
  });

  it('scattered successes are inconsistent — no payday is invented', () => {
    const read = readPattern([
      collected('2026-05-04T09:00:00Z', 4),
      collected('2026-06-18T09:00:00Z', 18),
      collected('2026-07-27T09:00:00Z', 27),
    ]);
    expect(read.consistent).toBe(false);
    expect(read.learnedDay).toBeNull();
  });

  it('retry drift within the cluster tolerance still verifies', () => {
    const read = readPattern([
      collected('2026-05-01T09:00:00Z', 1),
      collected('2026-06-04T09:00:00Z', 1 + CLUSTER_TOLERANCE - 1),
      collected('2026-07-02T09:00:00Z', 2),
    ]);
    expect(read.consistent).toBe(true);
  });

  it('credit-alert signals verify on two consistent months and count distinct months', () => {
    const read = readSignals([
      { dayOfMonth: 1, observedMonth: '2026-06' },
      { dayOfMonth: 2, observedMonth: '2026-07' },
    ]);
    expect(read.monthsObserved).toBe(2);
    expect(read.consistent).toBe(true);
    expect(read.learnedDay).toBeGreaterThanOrEqual(1);
  });

  it('the misdeclare boundary is wider than the verify boundary', () => {
    // A declared day within DAY_TOLERANCE of the learned day verifies; beyond
    // it, the consequence path fires. The two constants must stay ordered so
    // honest jitter never reads as a lie.
    expect(DAY_TOLERANCE).toBeLessThanOrEqual(CLUSTER_TOLERANCE);
  });
});
