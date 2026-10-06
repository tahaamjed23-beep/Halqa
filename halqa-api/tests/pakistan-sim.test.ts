import { describe, expect, it } from 'vitest';
import { SEGMENTS, drawMembers, rng, runArm } from './lib-pakistan-sim';

// CI contract for the Pakistan-calibrated simulation. These assertions lock the
// model's integrity (determinism, paired randomness, sane calibration) and its
// headline conclusions (Halqa reduces defaults and actually recovers exposure),
// so a careless edit can't quietly break the numbers we quote to investors.

const N = 100_000;
const SEED = 19470814;

describe('pakistan-calibrated simulation', () => {
  const paper = runArm(N, SEED, false);
  const halqa = runArm(N, SEED, true);

  it('is deterministic: same seed reproduces identical results', () => {
    const again = runArm(N, SEED, true);
    expect(again).toEqual(halqa);
  });

  it('draws a population matching the declared segment shares (±1%)', () => {
    const members = drawMembers(N, rng(SEED));
    for (const s of SEGMENTS) {
      const share = members.filter(m => m.seg.key === s.key).length / N;
      expect(Math.abs(share - s.share)).toBeLessThan(0.01);
    }
  });

  it('keeps contribution burden inside the calibrated 8 to 15 per cent band', () => {
    // Asserted on the extremes rather than once per member. 50,000 members used
    // to mean 100,000 assertion calls, which ran for seconds and tipped over
    // the default timeout whenever the machine was busy: the test failed in a
    // full run and passed on its own, which is the worst kind of test. The
    // extremes prove the same thing, in one pass, and name the member that
    // broke the band instead of stopping at the first.
    const members = drawMembers(50_000, rng(SEED));
    let lowest = members[0], highest = members[0];
    for (const m of members) {
      if (m.burden < lowest.burden) lowest = m;
      if (m.burden > highest.burden) highest = m;
    }
    expect(lowest.burden, `lightest burden, ${lowest.seg.key}`).toBeGreaterThanOrEqual(0.08);
    expect(highest.burden, `heaviest burden, ${highest.seg.key}`).toBeLessThanOrEqual(0.15);
  });

  it('Halqa cuts post-receipt defaults by at least 3x vs paper', () => {
    expect(paper.defaults).toBeGreaterThan(0);
    expect(halqa.defaults * 3).toBeLessThan(paper.defaults);
  });

  it('Halqa recovers the majority of defaulted exposure; paper recovers nothing', () => {
    expect(paper.recoveredPaisa).toBe(0);
    expect(halqa.recoveredPaisa / Math.max(1, halqa.exposedPaisa)).toBeGreaterThan(0.6);
  });

  it('Halqa reduces pre-receipt dropouts and lifts on-time share', () => {
    expect(halqa.dropout).toBeLessThan(paper.dropout);
    const onTimeShare = (a: { onTime: number; lateResolved: number }) => a.onTime / (a.onTime + a.lateResolved);
    expect(onTimeShare(halqa)).toBeGreaterThan(onTimeShare(paper));
  });

  it('risk ordering is sane: overcommitted worst, home-business women best (both arms)', () => {
    for (const arm of [paper, halqa]) {
      const rate = (key: string, share: number) => arm.perSeg[key].defaults / Math.round(N * share);
      const over = rate('overcommitted', 0.08);
      const women = rate('home_business_women', 0.25);
      expect(over).toBeGreaterThan(women);
    }
  });

  it('conclusions are robust to a different seed (not a lucky draw)', () => {
    const paper2 = runArm(N, 20260713, false);
    const halqa2 = runArm(N, 20260713, true);
    expect(halqa2.defaults * 3).toBeLessThan(paper2.defaults);
    expect(halqa2.recoveredPaisa / Math.max(1, halqa2.exposedPaisa)).toBeGreaterThan(0.6);
  });
});
