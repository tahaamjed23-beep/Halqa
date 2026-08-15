// The exit ladder and the restitution engine.
//
// A committee is a promise to eleven other people. A one-tap cancel button
// would be a promise nobody has to keep, so there isn't one. But a member whose
// circumstances genuinely change must have a way out that does not destroy
// them, so leaving is a ladder of five rungs:
//
//   1 WINDOW       inside the 24h confirmation window — free, silent, no record
//   2 SUBSTITUTION a replacement pays the leaver their paid-to-date directly.
//                  No fine. This is the intended route for most exits.
//   3 GROUP_VOTE   72h vote, majority of votes cast excluding the requester,
//                  50% quorum. No quorum escalates to Halqa review rather than
//                  trapping the member. The host votes as one member and breaks
//                  ties, with NO veto — rebuilding organiser power is the fraud
//                  topology this whole product exists to avoid.
//   4 HARDSHIP     recorded statement to the helpline, fine waived, annotated
//                  as hardship and expressly NOT as a default.
//   5 ABANDONMENT  not an exit. Full recovery machinery; restitution withheld
//                  and set off.
//
// This governs members who have NOT yet collected. A member who takes the pot
// and then stops is not exiting — that is the post-payout default event and is
// handled by the delinquency and recovery path.
//
// THE RESTITUTION ARITHMETIC — the result that makes the rule implementable.
//
// The chairman's rule is that a leaver gets their money back at the end of the
// cycle. Halqa holds no pool it could pay them from, so the arithmetic has to
// do the work. It does, exactly:
//
//   * a member exits after paying p installments without having collected;
//   * the circle contracts, so every remaining pot shrinks from n·c to (n−1)·c;
//   * the members who ALREADY collected in rounds 1…p each received the larger
//     pot, so each of them ends the cycle ahead by exactly c;
//   * therefore each of those p members owes the leaver exactly c, settled at
//     completion. Total = p·c, and the leaver is made whole.
//
// It needs no float, no reserve and no custody. It is a ledger identity rather
// than a payment promise, and it holds recursively when several members leave.
// Settlement is in nominal rupees with no time value added, which is itself the
// deterrent against casual exit.
//
// Invariant at close: every continuing member has (received − paid) = 0, and
// every exited member is returned to zero. That is a statement an auditor can
// test rather than a policy they have to trust.

export type ExitRung = 'WINDOW' | 'SUBSTITUTION' | 'GROUP_VOTE' | 'HARDSHIP' | 'ABANDONMENT';

export const RUNG_LABEL: Record<ExitRung, string> = {
  WINDOW: 'Window withdrawal',
  SUBSTITUTION: 'Substitution',
  GROUP_VOTE: 'Group approved exit',
  HARDSHIP: 'Hardship exit',
  ABANDONMENT: 'Abandonment',
};

/** Exit fine, in installments. Substitution and hardship are free by design. */
export const FINE_INSTALLMENTS: Record<ExitRung, number> = {
  WINDOW: 0, SUBSTITUTION: 0, GROUP_VOTE: 1, HARDSHIP: 0, ABANDONMENT: 0,
};

// Where an exit fine goes. The remaining members' pots shrank, so most of it is
// theirs; the rest covers the administration of the exit. Halqa never profits
// from distress, which is why the platform share is the minority share.
export const FINE_SPLIT = { members: 0.70, platform: 0.30 } as const;

export const VOTE = {
  windowHours: 72,
  /** Share of votes CAST (excluding the requester) needed to approve. */
  approvalShare: 0.50,
  /** Share of eligible voters who must vote for the result to stand. */
  quorumShare: 0.50,
} as const;

/** The 24h confirmation window between FORMING and ACTIVE. */
export const CONFIRMATION_WINDOW_HOURS = 24;

export type ExitEligibilityInput = {
  /** True while the circle is inside its 24h confirmation window. */
  inConfirmationWindow: boolean;
  /** True once this member has received their pot. */
  hasCollected: boolean;
  /** A verified replacement is standing by. */
  substituteAvailable: boolean;
  /** The member filed a recorded hardship statement. */
  hardshipFiled: boolean;
};

/** Which rungs are open to this member right now, in the order to offer them. */
export function availableRungs(input: ExitEligibilityInput): ExitRung[] {
  // A member who already collected cannot exit at all. They hold the pot and
  // owe the remainder; leaving is default, not exit.
  if (input.hasCollected) return [];
  if (input.inConfirmationWindow) return ['WINDOW'];
  const rungs: ExitRung[] = [];
  if (input.substituteAvailable) rungs.push('SUBSTITUTION');
  rungs.push('GROUP_VOTE');
  if (input.hardshipFiled) rungs.push('HARDSHIP');
  return rungs;
}

export type RestitutionInput = {
  contributionPaisa: bigint;
  /** Installments the leaver paid before exiting. */
  installmentsPaid: number;
  /** Round numbers (1-based) already paid out when the exit is approved. Each
   *  of those recipients received the pre-contraction pot. */
  roundsAlreadyPaid: number[];
  rung: ExitRung;
};

export type RestitutionDebt = {
  /** 1-based round whose recipient owes this slice. */
  roundNumber: number;
  amountPaisa: bigint;
};

export type RestitutionResult = {
  /** What the leaver is owed in total, settled at cycle completion. */
  totalDuePaisa: bigint;
  /** Who owes what. One contribution each, from every earlier recipient. */
  debts: RestitutionDebt[];
  finePaisa: bigint;
  fineToMembersPaisa: bigint;
  fineToPlatformPaisa: bigint;
  /** Net to the leaver at completion: restitution less any fine. */
  netToLeaverPaisa: bigint;
  /** Abandonment forfeits restitution, which is set off against what is owed. */
  withheld: boolean;
  note: string;
};

export function computeRestitution(input: RestitutionInput): RestitutionResult {
  const c = input.contributionPaisa;
  const fineInstallments = FINE_INSTALLMENTS[input.rung];
  const finePaisa = c * BigInt(fineInstallments);
  const fineToMembersPaisa = (finePaisa * BigInt(Math.round(FINE_SPLIT.members * 100))) / 100n;
  const fineToPlatformPaisa = finePaisa - fineToMembersPaisa;

  // Abandonment is not an exit. Restitution is withheld and set off against the
  // recovery case rather than paid out.
  if (input.rung === 'ABANDONMENT') {
    return {
      totalDuePaisa: 0n, debts: [], finePaisa: 0n, fineToMembersPaisa: 0n, fineToPlatformPaisa: 0n,
      netToLeaverPaisa: 0n, withheld: true,
      note: 'Abandonment. Restitution withheld and set off against the recovery case.',
    };
  }

  // A window withdrawal happens before the circle is running: nothing has been
  // collected and nothing has been paid out, so there is nothing to restore.
  if (input.rung === 'WINDOW') {
    return {
      totalDuePaisa: 0n, debts: [], finePaisa: 0n, fineToMembersPaisa: 0n, fineToPlatformPaisa: 0n,
      netToLeaverPaisa: 0n, withheld: false,
      note: 'Withdrawn inside the confirmation window. Free, silent, and no record is kept.',
    };
  }

  // A substitute pays the leaver their paid-to-date DIRECTLY, so the circle
  // never contracts and no earlier recipient owes anything.
  if (input.rung === 'SUBSTITUTION') {
    const paid = c * BigInt(Math.max(0, input.installmentsPaid));
    return {
      totalDuePaisa: paid, debts: [], finePaisa: 0n, fineToMembersPaisa: 0n, fineToPlatformPaisa: 0n,
      netToLeaverPaisa: paid, withheld: false,
      note: 'Replacement pays the leaver their paid-to-date directly. The circle does not contract.',
    };
  }

  // Group vote and hardship both contract the circle, so the restitution
  // identity applies: every member who already collected owes exactly one
  // contribution, because their pot was one contribution larger than it will
  // be for everybody after them.
  const debts: RestitutionDebt[] = input.roundsAlreadyPaid
    .filter(r => r > 0)
    .sort((a, b) => a - b)
    .map(roundNumber => ({ roundNumber, amountPaisa: c }));
  const totalDuePaisa = c * BigInt(debts.length);

  return {
    totalDuePaisa, debts, finePaisa, fineToMembersPaisa, fineToPlatformPaisa,
    netToLeaverPaisa: totalDuePaisa - finePaisa,
    withheld: false,
    note: `${debts.length} earlier recipient${debts.length === 1 ? '' : 's'} each return one contribution at cycle close. Settled nominally, with no time value added.`,
  };
}

export type VoteTally = {
  eligibleVoters: number;   // active members excluding the requester
  votesFor: number;
  votesAgainst: number;
};

export type VoteOutcome = {
  cast: number;
  quorumMet: boolean;
  approved: boolean;
  escalated: boolean;       // no quorum — goes to Halqa review, never traps the member
  note: string;
};

export function tallyVote(t: VoteTally): VoteOutcome {
  const cast = t.votesFor + t.votesAgainst;
  const quorumMet = t.eligibleVoters > 0 && cast >= Math.ceil(t.eligibleVoters * VOTE.quorumShare);
  if (!quorumMet) {
    return {
      cast, quorumMet: false, approved: false, escalated: true,
      note: 'Quorum not reached. Escalated to Halqa review — a silent circle never traps a member.',
    };
  }
  const approved = t.votesFor > cast * VOTE.approvalShare;
  return {
    cast, quorumMet: true, approved, escalated: false,
    note: approved ? 'Approved by majority of votes cast.' : 'Declined by majority of votes cast.',
  };
}

/** Ledger check: at close every continuing member nets to zero and every
 *  exited member is returned to zero. Returns the imbalance in paisa. */
export function restitutionImbalance(
  entries: Array<{ receivedPaisa: bigint; paidPaisa: bigint; restitutionPaisa: bigint }>,
): bigint {
  return entries.reduce((sum, e) => sum + (e.receivedPaisa + e.restitutionPaisa - e.paidPaisa), 0n);
}
