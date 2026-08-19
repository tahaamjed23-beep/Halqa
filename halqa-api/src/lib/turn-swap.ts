// ============================================================================
// TURN SWAPS AND THE CIRCLE RATING
//
// Selling a turn moves forward liability between two people. Seat 1 in a
// twelve-member circle owes eleven more contributions after collecting; the
// last seat owes nothing. So a swap can quietly hand somebody an obligation
// they were never assessed for.
//
// The old check looked at the buyer only. That is half a check: it lets a
// member sell their way OUT of a seat their band would not have allowed them
// to take, and it lets a seller land themselves with an earlier seat than they
// qualify for. Both sides, both seats, every time.
// ============================================================================

import { forwardObligationPaisa } from './exit-ladder';

export type SwapParty = {
  userId: string;
  /** Seat this party holds today. */
  seat: number;
  creditScore: number;
  band: string;
  /** Completed circles with a clean record; gates the tenure quarantine. */
  cleanCompletedCircles: number;
  /** Sum of forward liability across every other circle, in paisa. */
  existingExposureP: bigint;
  /** Verified net monthly income, in paisa. Zero when unverified. */
  monthlyIncomeP: bigint;
};

export type SwapContext = {
  members: number;
  contributionP: bigint;
  /** Members still inside the tenure quarantine may take only the last 3 seats. */
  quarantineSeats: number;
};

export type SwapCheck = { ok: boolean; reasons: string[] };

/** L(k) = c x (n - k). What a seat still owes after collecting. */
export const liabilityAt = (seat: number, ctx: SwapContext): bigint =>
  ctx.contributionP * BigInt(Math.max(0, ctx.members - seat));

/**
 * A new member may take only one of the last three seats, whatever their score,
 * until they have two clean completed circles. A swap must not be a way around
 * that, which is precisely what an unchecked marketplace would become.
 */
function quarantined(p: SwapParty): boolean {
  return p.cleanCompletedCircles < 2;
}

function bandAllowsSeat(band: string, seat: number, ctx: SwapContext): boolean {
  const n = ctx.members;
  switch (band) {
    case 'EXCELLENT':
    case 'GOOD':      return true;
    case 'DECENT':    return seat > Math.floor(n / 2);          // second half only
    default:          return seat > n - 3;                       // last three only
  }
}

/**
 * Forward exposure cap: total liability across every circle stays under four
 * months of verified income. Unverified income cannot clear the cap at all,
 * which is deliberate — an unverified member may hold a late seat, where the
 * liability is small, and nothing more.
 */
function withinExposure(p: SwapParty, newSeat: number, ctx: SwapContext): boolean {
  const after = p.existingExposureP - liabilityAt(p.seat, ctx) + liabilityAt(newSeat, ctx);
  if (after <= 0n) return true;
  if (p.monthlyIncomeP <= 0n) return false;
  return after <= p.monthlyIncomeP * 4n;
}

/**
 * Validate a swap from BOTH ends. Seller takes the buyer's seat and vice versa,
 * so each party is checked against the seat they are moving into.
 */
export function checkSwap(seller: SwapParty, buyer: SwapParty, ctx: SwapContext): SwapCheck {
  const reasons: string[] = [];
  const pairs: [SwapParty, number, string][] = [
    [buyer, seller.seat, 'The buyer'],
    [seller, buyer.seat, 'The seller'],
  ];

  for (const [party, newSeat, who] of pairs) {
    if (quarantined(party) && newSeat <= ctx.members - ctx.quarantineSeats) {
      reasons.push(`${who} has not completed two clean circles yet, so they may only hold one of the last ${ctx.quarantineSeats} turns.`);
    }
    if (!bandAllowsSeat(party.band, newSeat, ctx)) {
      reasons.push(`${who}'s score does not allow turn ${newSeat}.`);
    }
    if (!withinExposure(party, newSeat, ctx)) {
      reasons.push(`${who} would owe more than their verified income supports.`);
    }
  }
  return { ok: reasons.length === 0, reasons };
}

/** What each side's obligation becomes, so both can see it before agreeing. */
export function swapPreview(seller: SwapParty, buyer: SwapParty, ctx: SwapContext) {
  return {
    seller: {
      from: liabilityAt(seller.seat, ctx), to: liabilityAt(buyer.seat, ctx),
      collectsAt: buyer.seat,
    },
    buyer: {
      from: liabilityAt(buyer.seat, ctx), to: liabilityAt(seller.seat, ctx),
      collectsAt: seller.seat,
    },
    cycleTotalP: forwardObligationPaisa(ctx.contributionP, ctx.members),
  };
}

// ---------------------------------------------------------------------------
// The circle rating
//
// A buyer is taking on the risk of everyone else in the circle, not just of the
// seat. A listing that shows only the premium is hiding the thing that decides
// whether the pot ever arrives.
// ---------------------------------------------------------------------------

export type CircleHealth = {
  members: number;
  /** Mean credit score across active members. */
  meanScore: number;
  /** Installments paid on time, as a share of all due so far. */
  onTimeRate: number;
  /** Members currently carrying a default flag. */
  flagged: number;
  /** Rounds completed out of the total. */
  roundsDone: number;
  totalRounds: number;
};

export type Rating = { grade: 'A' | 'B' | 'C' | 'D'; score: number; note: string };

/**
 * One letter, from the three things that actually predict a circle failing:
 * how reliable the members have been, whether anyone is already in default,
 * and how much of the cycle is still to run.
 */
export function rateCircle(h: CircleHealth): Rating {
  // Weighted so a live circle can actually earn the top grade. Paying behaviour
  // carries the most, then the members' standing. Progress is worth only a
  // little: a fresh circle is not a bad circle, it has simply not proved itself.
  const scorePart = Math.max(0, Math.min(45, ((h.meanScore - 550) / 300) * 45));
  const onTimePart = Math.max(0, Math.min(45, h.onTimeRate * 45));
  const flagPenalty = Math.min(40, h.flagged * 20);
  const progress = h.totalRounds > 0 ? h.roundsDone / h.totalRounds : 0;
  const progressPart = progress * 10;               // a nearly finished circle is safer

  const score = Math.round(Math.max(0, scorePart + onTimePart + progressPart - flagPenalty));
  const grade: Rating['grade'] = score >= 75 ? 'A' : score >= 55 ? 'B' : score >= 35 ? 'C' : 'D';
  const note =
    h.flagged > 0 ? `${h.flagged} member${h.flagged > 1 ? 's are' : ' is'} in default.`
    : h.onTimeRate >= 0.95 ? 'Everyone has paid on time so far.'
    : h.onTimeRate >= 0.8 ? 'Mostly paid on time.'
    : 'Payments have been unreliable.';
  return { grade, score, note };
}
