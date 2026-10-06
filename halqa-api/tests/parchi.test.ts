import { describe, expect, it } from 'vitest';
import {
  commitment, draw, drawSeats, newSeed, proofOf, readyToDraw, seatProofOf, seatable, tap, verify, verifySeats,
  type Contender,
} from '../src/lib/parchi';
import { positionsForTier } from '../src/lib/score-bands';

const taps = Array.from({ length: 12 }, (_, i) => ({ userId: `u${i}`, nonce: `n${i}` }));

describe('the sealed commitment', () => {
  it('reveals nothing about the seed', () => {
    const seed = newSeed();
    const c = commitment(seed);
    expect(c).toHaveLength(64);
    expect(c).not.toContain(seed);
  });
  it('is different for every seed', () => {
    expect(commitment('a')).not.toBe(commitment('b'));
  });
});

describe('the draw', () => {
  it('is deterministic, which is what makes it checkable', () => {
    expect(draw('seed', taps)).toEqual(draw('seed', taps));
  });

  it('returns every member exactly once', () => {
    const order = draw('seed', taps);
    expect(order).toHaveLength(taps.length);
    expect(new Set(order).size).toBe(taps.length);
  });

  it('does not depend on who tapped first', () => {
    // Otherwise tapping early would be worth something, and the server could
    // steer the result simply by reordering what it received.
    const reversed = [...taps].reverse();
    expect(draw('seed', reversed)).toEqual(draw('seed', taps));
  });

  it('changes if the seed changes', () => {
    expect(draw('a', taps)).not.toEqual(draw('b', taps));
  });

  it('changes if any single member taps differently', () => {
    const tampered = [{ userId: 'u0', nonce: 'OTHER' }, ...taps.slice(1)];
    expect(draw('seed', tampered)).not.toEqual(draw('seed', taps));
  });

  it('spreads results across seeds rather than favouring one member', () => {
    const firsts = new Set(Array.from({ length: 40 }, (_, i) => draw(`seed${i}`, taps)[0]));
    expect(firsts.size).toBeGreaterThan(3);
  });
});

describe('verification', () => {
  it('accepts an honest draw', () => {
    expect(verify(proofOf('seed', taps)).valid).toBe(true);
  });

  it('catches a seed that does not match the fingerprint', () => {
    const p = proofOf('seed', taps);
    const v = verify({ ...p, seed: 'different' });
    expect(v.valid).toBe(false);
    expect(v.failure).toContain('fingerprint');
  });

  it('catches an order quietly reshuffled after the draw', () => {
    const p = proofOf('seed', taps);
    const swapped = [p.order[1], p.order[0], ...p.order.slice(2)];
    const v = verify({ ...p, order: swapped });
    expect(v.valid).toBe(false);
    expect(v.failure).toContain('position 1');
  });

  it('catches a member dropped from the published order', () => {
    const p = proofOf('seed', taps);
    expect(verify({ ...p, order: p.order.slice(1) }).valid).toBe(false);
  });
});

describe('readiness', () => {
  it('will not draw until everyone has tapped', () => {
    const r = readyToDraw(['a', 'b', 'c'], [tap('a'), tap('b')]);
    expect(r.ready).toBe(false);
    expect(r.missing).toEqual(['c']);
  });
  it('is ready once every member has', () => {
    expect(readyToDraw(['a', 'b'], [tap('a'), tap('b')]).ready).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// The draw against the seat matrix. Until 2026-10-06 the bowl could place a
// member whose eligibility reached no further than the last three seats into
// turn 1, which is exactly the default the matrix exists to prevent.
// ---------------------------------------------------------------------------
describe('the draw against the seat matrix', () => {
  const cap = 12;
  const mixed: Contender[] = [
    { userId: 'u0', tier: 'LAST' }, { userId: 'u1', tier: 'LAST' },
    { userId: 'u2', tier: 'MIDDLE' }, { userId: 'u3', tier: 'MIDDLE' }, { userId: 'u4', tier: 'MIDDLE' },
    ...Array.from({ length: 7 }, (_, i) => ({ userId: `u${i + 5}`, tier: 'ANY' as const })),
  ];

  it('places every member only in a seat their tier allows', () => {
    const { seats, unseated } = drawSeats('seed-a', taps, mixed, cap);
    expect(unseated).toEqual([]);
    for (const c of mixed) expect(positionsForTier(c.tier, cap)).toContain(seats[c.userId]);
  });

  it('gives every member exactly one seat and no seat to two members', () => {
    const { seats } = drawSeats('seed-a', taps, mixed, cap);
    const used = Object.values(seats);
    expect(used).toHaveLength(cap);
    expect(new Set(used).size).toBe(cap);
  });

  it('holds across many seeds, not just a lucky one', () => {
    for (let i = 0; i < 200; i++) {
      const { seats, unseated } = drawSeats(`seed-${i}`, taps, mixed, cap);
      expect(unseated).toEqual([]);
      for (const c of mixed) expect(positionsForTier(c.tier, cap)).toContain(seats[c.userId]);
    }
  });

  it('stays deterministic, so the placement can be recomputed', () => {
    expect(drawSeats('seed-a', taps, mixed, cap)).toEqual(drawSeats('seed-a', taps, mixed, cap));
  });

  it('a different seed moves the seats, so the ballot is still a ballot', () => {
    const a = drawSeats('seed-a', taps, mixed, cap).seats;
    const b = drawSeats('seed-b', taps, mixed, cap).seats;
    expect(Object.keys(a).some(id => a[id] !== b[id])).toBe(true);
  });

  it('every member\'s tap still changes the placement', () => {
    const a = drawSeats('seed-a', taps, mixed, cap).seats;
    const changed = [{ ...taps[0], nonce: 'different' }, ...taps.slice(1)];
    const b = drawSeats('seed-a', changed, mixed, cap).seats;
    expect(Object.keys(a).some(id => a[id] !== b[id])).toBe(true);
  });

  it('spreads the open members across the whole circle rather than parking them', () => {
    const seen = new Set<number>();
    for (let i = 0; i < 100; i++) {
      const { seats } = drawSeats(`seed-${i}`, taps, mixed, cap);
      seen.add(seats['u5']);
    }
    expect(seen.size).toBeGreaterThan(cap / 2);
  });

  it('an unseatable circle is reported, never fixed by promoting somebody', () => {
    // Four members for three last seats: no draw can seat them all.
    const crowded: Contender[] = Array.from({ length: 4 }, (_, i) => ({ userId: `u${i}`, tier: 'LAST' as const }));
    const tapsFour = taps.slice(0, 4);
    const { seats, unseated } = drawSeats('seed-a', tapsFour, crowded, cap);
    expect(unseated).toHaveLength(1);
    for (const id of Object.keys(seats)) expect(positionsForTier('LAST', cap)).toContain(seats[id]);
  });

  it('seatable says so before the bowl is sealed, with the reason', () => {
    expect(seatable(mixed, cap).ok).toBe(true);
    const crowded: Contender[] = Array.from({ length: 4 }, (_, i) => ({ userId: `u${i}`, tier: 'LAST' as const }));
    const verdict = seatable(crowded, cap);
    expect(verdict.ok).toBe(false);
    expect(verdict.reason).toContain('last');
    // Seven middle-only members cannot fit the six later seats of a twelve.
    const middleHeavy: Contender[] = Array.from({ length: 7 }, (_, i) => ({ userId: `m${i}`, tier: 'MIDDLE' as const }));
    expect(seatable(middleHeavy, cap).ok).toBe(false);
  });

  it('the seat proof verifies, and catches a seat quietly moved afterwards', () => {
    const proof = seatProofOf('seed-a', taps, mixed, cap);
    expect(verifySeats(proof)).toEqual({ valid: true });
    const moved = { ...proof, seats: { ...proof.seats, u0: 1 } };
    expect(verifySeats(moved).valid).toBe(false);
  });

  it('the seat proof still catches a seed that does not match the fingerprint', () => {
    const proof = seatProofOf('seed-a', taps, mixed, cap);
    expect(verifySeats({ ...proof, seed: 'another' }).valid).toBe(false);
  });

  it('a member with no standing on record is treated as open, not as privileged', () => {
    // An unknown tier defaults to ANY in the placement, which is why the join
    // route and seatable() are the gate: the ballot trusts what it is handed.
    const { seats } = drawSeats('seed-a', taps.slice(0, 2), [{ userId: 'u0', tier: 'LAST' }], cap);
    expect(positionsForTier('LAST', cap)).toContain(seats['u0']);
    expect(seats['u1']).toBeGreaterThan(0);
  });
});
