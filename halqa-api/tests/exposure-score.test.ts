import { describe, it, expect } from 'vitest';
import { assessExposure, bandOf, REFERENCE_HYPER, EXPOSURE_THRESHOLDS } from '../src/lib/exposure-score';

const ref = (defaulters: Array<{ collectedOnDay: number }>) => assessExposure({
  members: REFERENCE_HYPER.members,
  totalDays: REFERENCE_HYPER.totalDays,
  contributionPaisa: REFERENCE_HYPER.contributionPaisa,
  feePaisa: REFERENCE_HYPER.feePaisa,
  defaulters,
});

const many = (n: number, day: number) => Array.from({ length: n }, () => ({ collectedOnDay: day }));

describe('HYPER exposure score', () => {
  it('is zero with no defaults and reports the full fee income as the net position', () => {
    const r = ref([]);
    expect(r.score).toBe(0);
    expect(r.band).toBe('SELF_FUNDING');
    // 400 members x 60 days x Rs 37.50 = Rs 900,000
    expect(r.maxFeeIncomePaisa).toBe(90_000_000n);
    expect(r.netPositionPaisa).toBe(90_000_000n);
  });

  it('collapses any pattern onto count and mean day only', () => {
    // Same count, same mean (30), completely different distributions.
    const clustered = ref(many(12, 30));
    const spread = ref([...many(6, 10), ...many(6, 50)]);
    expect(spread.score).toBeCloseTo(clustered.score, 6);
    expect(spread.damagePaisa).toBe(clustered.damagePaisa);
  });

  it('separates the same default rate landing early versus late', () => {
    // The design rate, 120 of 400, landing early versus late.
    const early = ref(many(120, 5));   // R = 2.11 — a claim
    const late = ref(many(120, 50));   // R = 0.38 — profitable
    expect(early.score).toBeGreaterThan(2.0);
    expect(late.score).toBeLessThan(0.40);
    expect(early.band).toBe('TAKAFUL');
    expect(late.band).toBe('SELF_FUNDING');
    // Identical rate, opposite outcome — the whole point of the score.
    expect(early.defaulterCount).toBe(late.defaulterCount);
    expect(early.netPositionPaisa < 0n).toBe(true);
    expect(late.netPositionPaisa > 0n).toBe(true);
  });

  it('puts the 30 per cent design case just past break even', () => {
    // 120 defaulters (30%) landing at the mid-cycle mean.
    const r = ref(many(120, 30.5));
    expect(r.score).toBeGreaterThan(1.0);
    expect(r.score).toBeLessThan(EXPOSURE_THRESHOLDS.cover);
    expect(r.band).toBe('ABSORBING');
    expect(r.coverEngaged).toBe(false);
  });

  it('engages cover and then takaful as damage rises', () => {
    expect(ref(many(150, 20)).coverEngaged).toBe(true);
    expect(ref(many(300, 10)).takafulAttached).toBe(true);
  });

  it('maps thresholds to bands at the exact boundaries', () => {
    expect(bandOf(0.79)).toBe('SELF_FUNDING');
    expect(bandOf(0.80)).toBe('DESIGN');
    expect(bandOf(1.00)).toBe('ABSORBING');
    expect(bandOf(1.25)).toBe('COVER');
    expect(bandOf(1.60)).toBe('TAKAFUL');
  });

  it('a default on the final day costs nothing, because the fees already paid cover it', () => {
    const r = ref(many(20, 60));
    expect(r.score).toBe(0);
    expect(r.netPositionPaisa).toBe(90_000_000n);
  });

  it('reports headroom that shrinks as the circle deteriorates', () => {
    const healthy = ref(many(10, 40));
    const strained = ref(many(90, 25));
    expect(healthy.headroomDefaulters).not.toBeNull();
    expect(strained.headroomDefaulters).not.toBeNull();
    expect(healthy.headroomDefaulters!).toBeGreaterThan(strained.headroomDefaulters!);
  });

  it('clamps out-of-range collection days instead of inverting the damage', () => {
    const r = ref([{ collectedOnDay: 900 }, { collectedOnDay: -5 }]);
    expect(r.damagePaisa >= 0n).toBe(true);
    expect(r.meanCollectionDay).toBeGreaterThan(0);
  });

  it('does not divide by zero when a circle earns no fees', () => {
    const r = assessExposure({ members: 0, totalDays: 0, contributionPaisa: 0n, feePaisa: 0n, defaulters: [] });
    expect(r.score).toBe(0);
    expect(r.band).toBe('SELF_FUNDING');
  });
});
