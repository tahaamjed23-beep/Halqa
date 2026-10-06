// Seat eligibility — which turns a member may claim when joining a circle.
// Credit never REORDERS anyone; it limits WHICH seats may be claimed, and a
// claimed seat is never taken away.
//
// REWRITTEN to the chairman's ruling of 2026-10-05, which withdrew the blanket
// quarantine that held every new member to the last seats whatever their
// score. Members are assumed to be working adults aged 18 or over, so the test
// is no longer "have you been here long enough" but "is the pot recoverable
// from you" — by credit history, or by security pledged.
//
//   Real bureau history and a good score → any seat
//   A mid score                          → the middle seats
//   A low score                          → the last seats
//   A record too thin to score           → the middle seats
//   No record at all                     → the last seats
//   One clean circle, known or unknown   → any seat, for the two rows above
//   Security covering the pot            → any seat
//
// Default is an early-turn problem: someone who collects in round 2 of 20 still
// owes 18 instalments and can run; the last seats are OWED money and cannot.
export type ScoreBand = 'BAD' | 'DECENT' | 'GOOD' | 'EXCELLENT';

// What the bureau actually knows about this member. A member with NO record is
// not the same as a member with a BAD record, and neither is the same as a thin
// file: the three carry different seat rights and must never collapse into one.
//   NONE   — no bureau record at all, so no meaningful score factors
//   THIN   — a record exists but is too slight to score properly
//   SCORED — a real, substantial record; the score means something
export type CreditStanding = 'NONE' | 'THIN' | 'SCORED';

// Which block of seats is open. ANY is every seat; MIDDLE is the second half;
// LAST is the final three, clamped so a tiny circle still protects early money.
export type SeatTier = 'ANY' | 'MIDDLE' | 'LAST';

// On Halqa's 300–850 scale. Aligned to TASDEEQ's published 200–600 scale, whose
// intermediate band cutoffs are NOT public; they arrive with the data-member
// kit. Retuning is a one-line change here and nowhere else.
export const BAND_CUTOFFS = { decent: 550, good: 650, excellent: 750 } as const;

// Chairman's answer, 2026-10-05: wait for TASDEEQ's bands. Until TASDEEQ
// publishes its real cutoffs, no score alone counts as good enough for an early
// seat, so a scored member tops out at the middle seats. A low score still
// means a low score — the caution runs one way only. Flip this to true on the
// day the bands arrive, and recalibrate BAND_CUTOFFS in the same change.
export const TASDEEQ_BANDS_PUBLISHED = false;

// Clean circles that open every seat to a member whose history cannot speak for
// them. Was 2 before 2026-10-05, with a manual telephone verification on top;
// the chairman dropped both, and the verification could never have scaled.
export const REQUIRED_CLEAN_CIRCLES = 1;

// Security may fall this far short of the pot and still count (chairman,
// 2026-10-05: a relaxation of 10 per cent of the pot).
export const SECURITY_RELAXATION_BPS = 1_000;

export const band = (score: number): ScoreBand =>
  score >= BAND_CUTOFFS.excellent ? 'EXCELLENT'
  : score >= BAND_CUTOFFS.good ? 'GOOD'
  : score >= BAND_CUTOFFS.decent ? 'DECENT'
  : 'BAD';

export const BAND_LABEL: Record<ScoreBand, string> = { BAD: 'Rebuilding', DECENT: 'Fair', GOOD: 'Good', EXCELLENT: 'Excellent' };

// TASDEEQ (200–600) → Halqa (300–850): linear, invertible, clamped.
export const fromTasdeeq = (t: number) => Math.round(300 + (Math.min(600, Math.max(200, t)) - 200) * (550 / 400));

// Seats a tier may claim in a circle of `cap` members.
export const positionsForTier = (tier: SeatTier, cap: number): number[] => {
  const all = Array.from({ length: cap }, (_, i) => i + 1);
  if (tier === 'LAST') return all.filter(p => p > Math.max(cap - 3, Math.floor(cap / 2)));
  if (tier === 'MIDDLE') return all.filter(p => p > Math.floor(cap / 2));
  return all;
};

// Kept so callers that still think in bands keep working. GOOD and EXCELLENT
// map to ANY here by definition of the band itself; whether a member actually
// reaches ANY is decided by seatTier below, which also weighs their standing.
export const TIER_OF_BAND: Record<ScoreBand, SeatTier> = { BAD: 'LAST', DECENT: 'MIDDLE', GOOD: 'ANY', EXCELLENT: 'ANY' };
export const allowedPositions = (b: ScoreBand, cap: number): number[] => positionsForTier(TIER_OF_BAND[b], cap);

export const mayBuyTurns = (score: number) => band(score) !== 'BAD';

// Security pledged against the pot: an aligned asset committee, points, or the
// member's own savings frozen by the bank. Sources COMBINE — the caller adds
// them up. Halqa never holds any of it; the bank places the hold on the
// member's own account and the money sits in the bank's savings product,
// earning its profit for the member throughout (chairman, 2026-10-05).
export const securityCovers = (potPaisa?: number | null, securityPaisa?: number | null): boolean => {
  if (!potPaisa || potPaisa <= 0 || !securityPaisa || securityPaisa <= 0) return false;
  return securityPaisa >= Math.ceil(potPaisa * (10_000 - SECURITY_RELAXATION_BPS) / 10_000);
};

export type MemberStanding = {
  creditScore: number;
  committeesCompletedClean: number;
  // Absent means NONE: a member we know nothing about is treated as a member
  // with no record, never as a good one.
  creditStanding?: CreditStanding | null;
  // Pledged security, and the pot it is pledged against. Both absent means no
  // security was offered.
  securityPaisa?: number | null;
  potPaisa?: number | null;
  // Retained only so older callers and rows still type-check. The manual
  // verification it recorded is no longer a condition of anything.
  earlyTurnVerifiedAt?: Date | string | null;
};

// A low score resting on a real, substantial bureau record is the one thing
// security cannot buy past, and the one thing a clean circle does not excuse
// (chairman, 2026-10-05). Such a member leaves the last seats by raising their
// score, which paying cleanly does.
export const lowOnRealFactors = (m: MemberStanding): boolean =>
  (m.creditStanding ?? 'NONE') === 'SCORED' && band(m.creditScore) === 'BAD';

export const seatTier = (m: MemberStanding): SeatTier => {
  if (lowOnRealFactors(m)) return 'LAST';
  if (securityCovers(m.potPaisa, m.securityPaisa)) return 'ANY';
  if (m.committeesCompletedClean >= REQUIRED_CLEAN_CIRCLES) return 'ANY';
  const standing = m.creditStanding ?? 'NONE';
  if (standing === 'SCORED') {
    const b = band(m.creditScore);
    if (b === 'DECENT') return 'MIDDLE';
    // GOOD or EXCELLENT: any seat, but only once TASDEEQ's bands are real.
    return TASDEEQ_BANDS_PUBLISHED ? 'ANY' : 'MIDDLE';
  }
  if (standing === 'THIN') return 'MIDDLE';
  return 'LAST';
};

// Is a bureau connected yet? TASDEEQ has not been contacted (register item
// 459), so no member has a bureau record today and `creditScore` is Halqa's own
// number, not a bureau's. Read strictly, the matrix would then put EVERY member
// in the last seats and no circle could ever fill its early ones.
//
// INTERIM READING, pending the chairman's confirmation: a member Halqa has a
// score for has a record, but one too slight to score properly, which is the
// chairman's own "if you don't possess enough history then mid for now, after 1
// full clean committee first positions open". So they sit at THIN, which opens
// the middle seats, and one clean committee opens the rest. A member with no
// score at all is NONE, and the last seats. Security still opens everything.
//
// Set this to true on the day TASDEEQ's data flows, and standing then comes
// from the bureau rather than from here.
export const BUREAU_CONNECTED = false;

// The one place a stored row becomes a standing. Every call site goes through
// it, so joining, the turn trade and the account payload cannot disagree about
// the rule. Pass the pot when the seat is being claimed in a known circle, so
// pledged security can be weighed against it.
export type StoredStanding = {
  creditScore?: number | null;
  committeesCompletedClean?: number | null;
  creditStanding?: CreditStanding | null;
  securityPledgedPaisa?: number | null;
};
export const standingOf = (u: StoredStanding, potPaisa?: number | null): MemberStanding => {
  const score = u.creditScore ?? 0;
  const stored = u.creditStanding ?? null;
  const standing: CreditStanding = stored ? stored : BUREAU_CONNECTED ? 'NONE' : score > 0 ? 'THIN' : 'NONE';
  return {
    creditScore: score,
    committeesCompletedClean: u.committeesCompletedClean ?? 0,
    creditStanding: standing,
    securityPaisa: u.securityPledgedPaisa ?? null,
    potPaisa: potPaisa ?? null,
  };
};

export const eligiblePositions = (cap: number, m: MemberStanding): number[] => positionsForTier(seatTier(m), cap);

// Which seats a circle opens to a member at joining.
//
// On a circle between strangers the matrix decides, and a host cannot widen it:
// the host of a public circle is a stranger to the joiner too, so letting the
// host hand out early seats would make the matrix advisory. On a known circle
// the host's invitation stands in its place — the host is vouching, which is
// the social collateral a committee has always run on, and seats there are
// host-assigned. This is the same split the affordability tests use.
export const seatsOpenOnJoin = (listedPublicly: boolean, cap: number, m: MemberStanding): number[] =>
  listedPublicly ? eligiblePositions(cap, m) : Array.from({ length: cap }, (_, i) => i + 1);

// True when every seat is open to this member. Kept under its old name because
// the account and sign-in payloads report it, but it no longer means "has
// served a quarantine" — it means "the pot is recoverable from this member".
export const earlyTurnUnlocked = (m: MemberStanding) => seatTier(m) === 'ANY';

// Why the seats above are closed, for the screen that has to say so.
export const seatReason = (m: MemberStanding): string => {
  if (lowOnRealFactors(m)) return 'Your credit record places you in the last seats. Paying cleanly raises your score.';
  if (seatTier(m) === 'ANY') return 'Every seat is open to you.';
  const standing = m.creditStanding ?? 'NONE';
  const more = Math.max(1, REQUIRED_CLEAN_CIRCLES - m.committeesCompletedClean);
  const after = `Complete ${more} clean committee${more === 1 ? '' : 's'} to open every seat, or pledge security that covers the pot.`;
  if (standing === 'NONE') return `You have no credit record yet, so you start in the last seats. ${after}`;
  if (standing === 'THIN') return `Your credit record is too short to judge, so you start in the middle seats. ${after}`;
  return `Your score opens the middle seats. ${after}`;
};

// Ordering weight for start-time seat assignment: safer members rank lower and
// so take the earlier seats. When a circle starts under capacity and seats are
// compacted to a contiguous 1..N, ordering by this weight first guarantees a
// riskier member can never collapse into an early seat — the anti-default
// invariant holds against the ACTUAL started size, not the original cap.
export const bandRank = (score: number): number => { const b = band(score); return b === 'BAD' ? 2 : b === 'DECENT' ? 1 : 0; };
export const tierRank = (tier: SeatTier): number => tier === 'LAST' ? 2 : tier === 'MIDDLE' ? 1 : 0;

// Compare two members for start ordering. Safer first; then each member's
// chosen turn position; then join time as a stable deterministic tiebreak.
export const startOrder = (a: { creditScore: number; turnPosition: number; joinedAt: number }, b: { creditScore: number; turnPosition: number; joinedAt: number }) =>
  bandRank(a.creditScore) - bandRank(b.creditScore) || a.turnPosition - b.turnPosition || a.joinedAt - b.joinedAt;

// The same comparison on full standing, for callers that hold it. Preferred
// over startOrder once the standing fields reach the database.
export const startOrderByStanding = (
  a: MemberStanding & { turnPosition: number; joinedAt: number },
  b: MemberStanding & { turnPosition: number; joinedAt: number },
) => tierRank(seatTier(a)) - tierRank(seatTier(b)) || a.turnPosition - b.turnPosition || a.joinedAt - b.joinedAt;
