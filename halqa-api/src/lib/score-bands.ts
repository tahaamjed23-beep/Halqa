// Score bands — the slot-eligibility system that replaced credit-weighted
// ordering (Taha's call, 2026-07-22). Credit no longer REORDERS anyone: it
// only limits WHICH slots you may claim when joining a circle, and whether
// you may buy turns on the marketplace. A claimed slot is never taken away.
//
//   BAD       → may claim only the LAST slots of a circle (see clamp below);
//               barred from buying marketplace turns.
//   DECENT    → may claim any slot in the SECOND HALF of the order.
//   GOOD /
//   EXCELLENT → any free slot. The two differ only as labels — hosting keeps
//               its own ≥700 gate, and TASDEEQ's top band will map here.
//
// Default is an early-turn problem: someone who collects the pot in round 2
// of 20 still owes 18 installments and can run; the last seats are OWED money
// and cannot. Restricting risky members to late seats keeps the protective
// intent of credit-weighted ordering with none of the reshuffling surprise.
//
// Cutoffs live in this file alone so retuning is a one-line change. They are
// aligned to TASDEEQ's published scale, which runs 200 (very poor) → 600
// (excellent) — tasdeeq.com/credit-score. TASDEEQ does NOT publish its
// intermediate band cutoffs publicly; those arrive with the data-member kit.
// The quartering below is therefore provisional (PARTNER AGREEMENT to make
// real): once TASDEEQ's PD bands are in hand, recalibrate here and nowhere
// else. Until then new accounts spawn at 700 (GOOD).
export type ScoreBand = 'BAD' | 'DECENT' | 'GOOD' | 'EXCELLENT';

// On Halqa's 300–850 scale. ≥550 was the old hard join gate — it survives as
// the BAD/DECENT boundary now that BAD members may join (late seats only).
export const BAND_CUTOFFS = { decent: 550, good: 650, excellent: 750 } as const;

export const band = (score: number): ScoreBand =>
  score >= BAND_CUTOFFS.excellent ? 'EXCELLENT'
  : score >= BAND_CUTOFFS.good ? 'GOOD'
  : score >= BAND_CUTOFFS.decent ? 'DECENT'
  : 'BAD';

export const BAND_LABEL: Record<ScoreBand, string> = { BAD: 'Rebuilding', DECENT: 'Fair', GOOD: 'Good', EXCELLENT: 'Excellent' };

// TASDEEQ (200–600) → Halqa (300–850): linear, invertible, clamped.
// 200→300 and 600→850; our cutoffs 550/650/750 sit at TASDEEQ ≈382/455/527.
// Wired for the day the data-member agreement lets us pull a score at signup.
export const fromTasdeeq = (t: number) => Math.round(300 + (Math.min(600, Math.max(200, t)) - 200) * (550 / 400));

// Which turn positions a band may claim in a circle of `cap` members.
// BAD gets the last three seats, clamped so tiny circles still protect the
// early money (never earlier than the second half); DECENT gets the second
// half; GOOD/EXCELLENT everything.
export const allowedPositions = (b: ScoreBand, cap: number): number[] => {
  const all = Array.from({ length: cap }, (_, i) => i + 1);
  if (b === 'BAD') return all.filter(p => p > Math.max(cap - 3, Math.floor(cap / 2)));
  if (b === 'DECENT') return all.filter(p => p > Math.floor(cap / 2));
  return all;
};

export const mayBuyTurns = (score: number) => band(score) !== 'BAD';

// Tenure quarantine (Taha, 2026-07-23). A NEW member — whatever their score —
// may only take one of the LAST turns of any circle. Turn position is the
// collateral in the no-deposit model: a late-turn taker pays in before they
// ever collect, so their loss to the group is zero. Early turns unlock only
// after they finish REQUIRED_CLEAN_CIRCLES circles cleanly AND are manually
// verified ("called around"). A new member is treated exactly like the BAD
// band for position purposes, regardless of their actual score.
export const REQUIRED_CLEAN_CIRCLES = 2;
export type MemberTenure = { creditScore: number; committeesCompletedClean: number; earlyTurnVerifiedAt: Date | string | null };
export const earlyTurnUnlocked = (m: MemberTenure) =>
  m.committeesCompletedClean >= REQUIRED_CLEAN_CIRCLES && m.earlyTurnVerifiedAt != null;
// Positions a member may claim: unlocked members fall back to their score band;
// everyone else is quarantined to the last turns (same set as the BAD band).
export const eligiblePositions = (cap: number, m: MemberTenure): number[] =>
  earlyTurnUnlocked(m) ? allowedPositions(band(m.creditScore), cap) : allowedPositions('BAD', cap);

// Ordering weight for start-time seat assignment: safer bands rank lower and so
// take the earlier seats. When a circle starts under capacity and seats are
// compacted to a contiguous 1..N, ordering by this weight first guarantees a
// risky member can never collapse into an early seat — the anti-default
// invariant holds against the ACTUAL started size, not the original cap.
// Members keep their own pick order only WITHIN their band.
export const bandRank = (score: number): number => { const b = band(score); return b === 'BAD' ? 2 : b === 'DECENT' ? 1 : 0; };

// Compare two members for start ordering. Safer band first; then each member's
// chosen turn position; then join time as a stable deterministic tiebreak.
export const startOrder = (a: { creditScore: number; turnPosition: number; joinedAt: number }, b: { creditScore: number; turnPosition: number; joinedAt: number }) =>
  bandRank(a.creditScore) - bandRank(b.creditScore) || a.turnPosition - b.turnPosition || a.joinedAt - b.joinedAt;
