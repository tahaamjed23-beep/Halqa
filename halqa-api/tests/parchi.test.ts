import { describe, expect, it } from 'vitest';
import { commitment, draw, newSeed, proofOf, readyToDraw, tap, verify } from '../src/lib/parchi';

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
