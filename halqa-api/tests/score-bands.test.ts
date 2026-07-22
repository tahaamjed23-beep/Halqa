import { describe, expect, it } from 'vitest';
import { band, allowedPositions, mayBuyTurns, fromTasdeeq, startOrder, BAND_CUTOFFS } from '../src/lib/score-bands';

// Score bands replaced credit-weighted ordering: score only limits WHICH seats
// a member may claim, never reorders anyone. These lock the boundaries so a
// retune is a deliberate change, not an accident.
describe('score bands', () => {
  it('maps scores to the four bands at the documented cutoffs', () => {
    expect(band(300)).toBe('BAD');
    expect(band(BAND_CUTOFFS.decent - 1)).toBe('BAD');
    expect(band(BAND_CUTOFFS.decent)).toBe('DECENT');
    expect(band(649)).toBe('DECENT');
    expect(band(BAND_CUTOFFS.good)).toBe('GOOD');
    expect(band(700)).toBe('GOOD'); // the spawn score lands in GOOD → new users unblocked
    expect(band(749)).toBe('GOOD');
    expect(band(BAND_CUTOFFS.excellent)).toBe('EXCELLENT');
    expect(band(850)).toBe('EXCELLENT');
  });

  it('GOOD and EXCELLENT may claim any seat', () => {
    expect(allowedPositions('GOOD', 10)).toEqual([1,2,3,4,5,6,7,8,9,10]);
    expect(allowedPositions('EXCELLENT', 6)).toEqual([1,2,3,4,5,6]);
  });

  it('DECENT is limited to the second half', () => {
    expect(allowedPositions('DECENT', 10)).toEqual([6,7,8,9,10]);
    expect(allowedPositions('DECENT', 7)).toEqual([4,5,6,7]); // floor(7/2)=3 → positions >3
  });

  it('BAD is limited to the last three seats, clamped to the second half in small circles', () => {
    expect(allowedPositions('BAD', 10)).toEqual([8,9,10]);          // last 3
    expect(allowedPositions('BAD', 20)).toEqual([18,19,20]);        // last 3 of a big circle
    expect(allowedPositions('BAD', 4)).toEqual([3,4]);              // max(cap-3,floor/2)=max(1,2)=2 → >2
    expect(allowedPositions('BAD', 3)).toEqual([2,3]);              // clamped to the second half; seat 1 always excluded
  });

  it('a BAD member can always claim the very last seat (anti-default invariant)', () => {
    for (const cap of [3,4,5,8,10,12,20]) {
      expect(allowedPositions('BAD', cap)).toContain(cap);
      // and never the first seat
      expect(allowedPositions('BAD', cap)).not.toContain(1);
    }
  });

  it('only BAD is barred from buying marketplace turns', () => {
    expect(mayBuyTurns(540)).toBe(false); // BAD
    expect(mayBuyTurns(550)).toBe(true);  // DECENT can buy
    expect(mayBuyTurns(700)).toBe(true);  // GOOD
    expect(mayBuyTurns(800)).toBe(true);  // EXCELLENT
  });

  // Regression: start-time compaction must never hand an early seat to a
  // riskier member when a circle starts under capacity (the adversarial review
  // found this hole — a BAD pick of seat 8 collapsing to seat 1 in a 3-member
  // start). Ordering by startOrder guarantees safer bands take earlier seats.
  it('start ordering never places a riskier member ahead of a safer one', () => {
    // A 10-cap circle that starts with only three BAD members (picked 8,9,10)
    // plus a couple of GOOD members who picked early seats.
    const members = [
      { creditScore: 500, turnPosition: 8, joinedAt: 1 },  // BAD
      { creditScore: 520, turnPosition: 9, joinedAt: 2 },  // BAD
      { creditScore: 800, turnPosition: 2, joinedAt: 3 },  // EXCELLENT
      { creditScore: 600, turnPosition: 6, joinedAt: 4 },  // DECENT
      { creditScore: 720, turnPosition: 1, joinedAt: 5 },  // GOOD
    ];
    const ordered = [...members].sort(startOrder);
    const rank = (s: number) => band(s) === 'BAD' ? 2 : band(s) === 'DECENT' ? 1 : 0;
    // After compaction to contiguous 1..N, ranks must be non-decreasing — no
    // riskier member ever sits earlier than a safer one.
    for (let i = 1; i < ordered.length; i++) {
      expect(rank(ordered[i].creditScore)).toBeGreaterThanOrEqual(rank(ordered[i - 1].creditScore));
    }
    // Concretely: seat 1 goes to the safest (EXCELLENT/GOOD), never a BAD member.
    expect(band(ordered[0].creditScore)).not.toBe('BAD');
    expect(band(ordered[ordered.length - 1].creditScore)).toBe('BAD');
  });

  it('start ordering preserves each member\'s pick WITHIN their band', () => {
    const members = [
      { creditScore: 800, turnPosition: 5, joinedAt: 1 }, // EXCELLENT picked 5
      { creditScore: 720, turnPosition: 2, joinedAt: 2 }, // GOOD picked 2 (same rank 0)
    ];
    const ordered = [...members].sort(startOrder);
    // Same band-rank → the earlier pick (2) comes first.
    expect(ordered[0].turnPosition).toBe(2);
    expect(ordered[1].turnPosition).toBe(5);
  });

  it('maps the TASDEEQ 200-600 scale onto our 300-850 scale, clamped', () => {
    expect(fromTasdeeq(200)).toBe(300);
    expect(fromTasdeeq(600)).toBe(850);
    expect(fromTasdeeq(100)).toBe(300); // clamps below the floor
    expect(fromTasdeeq(700)).toBe(850); // clamps above the ceiling
    expect(fromTasdeeq(400)).toBe(575); // midpoint
  });
});
