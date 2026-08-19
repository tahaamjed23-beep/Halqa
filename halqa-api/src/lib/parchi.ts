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
