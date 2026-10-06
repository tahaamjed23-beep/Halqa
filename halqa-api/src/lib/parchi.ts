// ============================================================================
// THE PARCHI DRAW
//
// The ballot ceremony IS the institution. In a real committee the slips go into
// a bowl, somebody's child pulls them out, and everyone watches. That ritual is
// not decoration: it is the reason nobody argues about the order afterwards.
//
// Replacing it with a server-side random() replaces theatre with a black box,
// and black boxes get accused. So the draw is commit-reveal:
//
//   1. The server commits to a sealed seed and publishes only its fingerprint.
//   2. Every member taps once; each tap contributes entropy.
//   3. The order derives from the combined value.
//   4. The seed is published afterwards, so anyone can recompute and check.
//
// The theatre is kept and the honesty is provable. No competitor in the archive
// has this.
// ============================================================================

import { createHash, randomBytes } from 'node:crypto';

export const sha256 = (v: string) => createHash('sha256').update(v).digest('hex');

/** A fresh sealed seed. Kept secret until the reveal. */
export const newSeed = () => randomBytes(32).toString('hex');

/**
 * Published BEFORE anyone taps. Binds the server to a seed it can no longer
 * change without the mismatch being obvious at reveal time.
 */
export const commitment = (seed: string) => sha256(`halqa-parchi:${seed}`);

export type Entropy = { userId: string; nonce: string };

/** What a member's tap contributes. Unguessable and unique to them. */
export const tap = (userId: string) => ({ userId, nonce: randomBytes(16).toString('hex') });

/**
 * The order itself.
 *
 * Sorting the member entropies before combining makes the result independent of
 * the order taps arrived in, so a member who taps first gains nothing and the
 * server cannot influence the outcome by reordering what it received.
 */
export function draw(seed: string, taps: Entropy[]): string[] {
  const combined = [seed, ...taps.map(t => `${t.userId}:${t.nonce}`).sort()].join('|');
  return taps
    .map(t => ({ userId: t.userId, ticket: sha256(`${combined}#${t.userId}`) }))
    .sort((a, b) => (a.ticket < b.ticket ? -1 : a.ticket > b.ticket ? 1 : 0))
    .map(x => x.userId);
}

export type DrawProof = {
  commitment: string;
  seed: string;
  taps: Entropy[];
  order: string[];
  drawnAt: string;
};

export function proofOf(seed: string, taps: Entropy[], drawnAt = new Date().toISOString()): DrawProof {
  return { commitment: commitment(seed), seed, taps, order: draw(seed, taps), drawnAt };
}

export type Verification = { valid: boolean; failure?: string };

/**
 * Anyone can run this: a member, a journalist, a regulator. It is the whole
 * point of publishing the seed.
 */
export function verify(proof: DrawProof): Verification {
  if (commitment(proof.seed) !== proof.commitment) {
    return { valid: false, failure: 'The published seed does not match the sealed fingerprint.' };
  }
  const recomputed = draw(proof.seed, proof.taps);
  if (recomputed.length !== proof.order.length) {
    return { valid: false, failure: 'The published order has a different number of members.' };
  }
  for (let i = 0; i < recomputed.length; i++) {
    if (recomputed[i] !== proof.order[i]) {
      return { valid: false, failure: `The published order differs from the draw at position ${i + 1}.` };
    }
  }
  return { valid: true };
}

/** Everyone must have tapped before the draw can run. */
export function readyToDraw(memberIds: string[], taps: Entropy[]): { ready: boolean; missing: string[] } {
  const tapped = new Set(taps.map(t => t.userId));
  const missing = memberIds.filter(id => !tapped.has(id));
  return { ready: missing.length === 0, missing };
}

// ---------------------------------------------------------------------------
// THE DRAW AGAINST THE SEAT MATRIX
//
// draw() above answers "in what order did the slips come out of the bowl". It
// does not answer "may this member sit in that seat", and until 2026-10-06 it
// was the only thing the ballot did: a member whose eligibility reached no
// further than the last three seats could be drawn into turn 1 and collect the
// whole pot in round 1 of 20. The anti-default invariant the join route and the
// turn market both enforce was walked around simply by letting the bowl decide.
//
// So the ballot keeps the bowl and gains the matrix. Seats are handed out in
// ticket order, but a member is only ever offered a seat their tier allows.
//
// The tiers nest — LAST is inside MIDDLE is inside ANY — so the assignment is
// safe when the most constrained members are served first out of their own
// smaller block. Serving them last is what strands people: the open members
// take the late seats they did not need and nothing is left.
//
// Nothing here is random. The ticket order comes from the sealed seed and every
// member's tap, and the tiers come from the stored standings, so the whole
// placement is reproducible by anyone holding the proof.
// ---------------------------------------------------------------------------

import { positionsForTier, type SeatTier } from './score-bands';

export type Contender = { userId: string; tier: SeatTier };

/** Most constrained first. Ties keep ballot order, which is already fair. */
const TIER_ORDER: Record<SeatTier, number> = { LAST: 0, MIDDLE: 1, ANY: 2 };

export type SeatDraw = {
  /** userId to turn position, 1-based. */
  seats: Record<string, number>;
  /** The ballot order the seats were handed out in, for the record. */
  order: string[];
  /** Members no lawful seat was left for. Empty on a circle that can be seated. */
  unseated: string[];
};

/**
 * Seats everyone the ballot drew, inside the matrix.
 *
 * A circle can be unseatable: four members who may only sit in the last three
 * seats cannot all be seated, whatever the draw. That is a fault in how the
 * circle was filled, not in the ballot, so it is reported rather than hidden by
 * quietly promoting somebody.
 */
export function drawSeats(seed: string, taps: Entropy[], contenders: Contender[], cap: number): SeatDraw {
  const order = draw(seed, taps);
  const tierOf = new Map(contenders.map(c => [c.userId, c.tier]));
  const rank = new Map(order.map((id, i) => [id, i]));
  const queue = [...order].sort((a, b) =>
    TIER_ORDER[tierOf.get(a) ?? 'ANY'] - TIER_ORDER[tierOf.get(b) ?? 'ANY'] || rank.get(a)! - rank.get(b)!);

  const taken = new Set<number>();
  const seats: Record<string, number> = {};
  const unseated: string[] = [];
  for (const userId of queue) {
    const allowed = positionsForTier(tierOf.get(userId) ?? 'ANY', cap);
    const seat = allowed.find(p => !taken.has(p));
    if (seat === undefined) { unseated.push(userId); continue; }
    taken.add(seat);
    seats[userId] = seat;
  }
  return { seats, order, unseated: unseated.sort((a, b) => rank.get(a)! - rank.get(b)!) };
}

/** Can this set of members be seated at all? Asked before the bowl is sealed. */
export function seatable(contenders: Contender[], cap: number): { ok: boolean; reason?: string } {
  if (contenders.length > cap) return { ok: false, reason: `${contenders.length} members for ${cap} seats.` };
  for (const tier of ['LAST', 'MIDDLE'] as const) {
    const block = positionsForTier(tier, cap).length;
    const needing = contenders.filter(c => TIER_ORDER[c.tier] <= TIER_ORDER[tier]).length;
    if (needing > block) {
      return { ok: false, reason: `${needing} members may only take the ${tier === 'LAST' ? 'last' : 'later'} `
        + `${block} seat${block === 1 ? '' : 's'} of this circle. Fill it with members who can sit earlier, `
        + 'or ask them to pledge security covering the pot.' };
    }
  }
  return { ok: true };
}

export type SeatProof = DrawProof & { contenders: Contender[]; cap: number; seats: Record<string, number> };

export function seatProofOf(seed: string, taps: Entropy[], contenders: Contender[], cap: number, drawnAt = new Date().toISOString()): SeatProof {
  const { seats } = drawSeats(seed, taps, contenders, cap);
  return { ...proofOf(seed, taps, drawnAt), contenders, cap, seats };
}

/** The same public check as verify(), extended to the seats themselves. */
export function verifySeats(proof: SeatProof): Verification {
  const base = verify(proof);
  if (!base.valid) return base;
  const recomputed = drawSeats(proof.seed, proof.taps, proof.contenders, proof.cap).seats;
  for (const [userId, seat] of Object.entries(proof.seats)) {
    if (recomputed[userId] !== seat) return { valid: false, failure: `The published seat for one member does not match the draw.` };
  }
  if (Object.keys(recomputed).length !== Object.keys(proof.seats).length) {
    return { valid: false, failure: 'The published seats cover a different set of members.' };
  }
  // Belt and braces: even a proof that recomputes must obey the matrix.
  for (const c of proof.contenders) {
    const seat = proof.seats[c.userId];
    if (seat !== undefined && !positionsForTier(c.tier, proof.cap).includes(seat)) {
      return { valid: false, failure: `Seat ${seat} is outside what one member's eligibility allows.` };
    }
  }
  return { valid: true };
}
