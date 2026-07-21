// Forward-liability security engine.
//
// The dangerous moment in any rotating committee is the EARLY payout: a member
// who receives the pot in round 2 of 20 has taken the whole pool and still owes
// 18 installments. That forward liability — the contribution multiplied by the
// installments still owed AFTER payout — is the exact amount at risk if they
// walk. Late positions carry almost none (they have already paid most of what
// they owe and are net owed money), so real committees survive by demanding
// security in proportion to this figure, and only from early recipients, at the
// exact moment the exposure appears.
//
// This module sizes the required security to the recipient's forward liability
// and decides how to satisfy it from three sources that already exist in the
// schema:
//   * cash the member has posted            (SecurityDeposit, status HELD)
//   * a slice withheld from their own pot    (PayoutHoldback)
//   * a host-verified legal instrument       (ProtectionCommitment — a personal
//     guarantee and/or a signed undertaking, enforceable by the members via
//     summary procedure under Order XXXVII CPC)
//
// A host-verified commitment covers the liability legally, so the member can
// take (almost) their full pot now instead of having it withheld — the signed
// paper does the work the cash holdback would otherwise do. Without one, the
// shortfall is auto-withheld from the pot itself (capped), never stranding a payout.
//
// The gate is OPT-IN per circle (policy.forwardLiabilityGateEnabled). When off,
// the engine still reports the exposure for display but changes nothing about
// the payout, so existing circles behave exactly as before.

export type SecurityPolicy = {
  // Master switch. When false/absent the engine is display-only.
  forwardLiabilityGateEnabled?: boolean;
  // Fraction of forward liability that must be secured, in basis points.
  // Defaults to the circle's depositCoverageBps when unset.
  securityCoverageBps?: number;
  // Fraction of forward liability a HOST-VERIFIED commitment (PG + signed
  // undertaking) is treated as covering. Defaults to 100%.
  commitmentCoverageBps?: number;
  // Ceiling on how much of the pot may be auto-withheld as security, in basis
  // points of the pot. Protects the whole point of an early payout — liquidity.
  maxPotHoldbackBps?: number;
  // When true, a residual shortfall that the capped pot holdback cannot cover
  // blocks the payout until the member posts more security. Off by default: the
  // pot holdback collateralises what it can and the payout proceeds.
  blockOnSecurityShortfall?: boolean;
};

export type PostedSecurity = {
  heldDepositPaisa: bigint;    // SecurityDeposit rows in status HELD (+accrued yield)
  heldHoldbackPaisa: bigint;   // PayoutHoldback rows in status HELD from earlier rounds
  commitmentVerified: boolean; // ProtectionCommitment.verifiedByHostAt is set
};

export type ForwardLiabilityInput = {
  contributionPaisa: bigint;
  roundNumber: number;         // the round this recipient is being paid in (1-based)
  totalRounds: number;         // rounds in the cycle == installments each member owes
  payoutPaisa: bigint;         // gross pot for this round
  bufferHoldbackPaisa: bigint; // the flat payoutBufferBps holdback already computed
  defaultReleasePayments: number; // requiredCleanPayments for a non-security holdback
  depositCoverageBps: number;  // committee.depositCoverageBps — fallback coverage
  posted: PostedSecurity;
  policy: SecurityPolicy;
};

export type ForwardLiabilityResult = {
  enabled: boolean;                // gate active for this payout (policy + early position)
  positionsRemaining: number;      // installments still owed after this payout
  forwardLiabilityPaisa: bigint;   // contribution × positionsRemaining
  coverageBps: number;             // coverage applied
  requiredSecurityPaisa: bigint;   // coverage × forward liability
  heldDepositPaisa: bigint;
  heldHoldbackPaisa: bigint;
  commitmentCoverPaisa: bigint;    // portion covered by a verified commitment
  postedSecurityPaisa: bigint;     // deposit + prior holdback + commitment cover
  securityShortfallPaisa: bigint;  // max(0, required − posted), before touching the pot
  securityHoldbackPaisa: bigint;   // slice taken from the pot to cover the shortfall (capped)
  residualShortfallPaisa: bigint;  // still uncovered after the capped pot holdback
  holdbackPaisa: bigint;           // final holdback to create for this round
  holdbackReleasePayments: number; // requiredCleanPayments for that holdback
  satisfied: boolean;              // required liability fully covered
  gated: boolean;                  // payout must be blocked (Secure circles that opt in)
};

const bps = (value: bigint, rate: number): bigint => (value * BigInt(Math.round(rate))) / 10_000n;
const maxBig = (a: bigint, b: bigint): bigint => (a > b ? a : b);
const minBig = (a: bigint, b: bigint): bigint => (a < b ? a : b);

export function assessForwardLiability(input: ForwardLiabilityInput): ForwardLiabilityResult {
  const positionsRemaining = Math.max(0, input.totalRounds - input.roundNumber);
  const forwardLiabilityPaisa = input.contributionPaisa * BigInt(positionsRemaining);
  const coverageBps = input.policy.securityCoverageBps ?? input.depositCoverageBps;
  const requiredSecurityPaisa = bps(forwardLiabilityPaisa, coverageBps);

  const commitmentCoverageBps = input.policy.commitmentCoverageBps ?? 10_000;
  const commitmentCoverPaisa = input.posted.commitmentVerified
    ? minBig(forwardLiabilityPaisa, bps(forwardLiabilityPaisa, commitmentCoverageBps))
    : 0n;
  const heldDepositPaisa = input.posted.heldDepositPaisa;
  const heldHoldbackPaisa = input.posted.heldHoldbackPaisa;
  const postedSecurityPaisa = heldDepositPaisa + heldHoldbackPaisa + commitmentCoverPaisa;
  const shortfallBeforePot = maxBig(0n, requiredSecurityPaisa - postedSecurityPaisa);

  const enabled = input.policy.forwardLiabilityGateEnabled === true && positionsRemaining > 0 && input.payoutPaisa > 0n;

  // Gate OFF: report the exposure for display, but leave the payout untouched —
  // the flat buffer holdback and its release schedule stand exactly as before.
  if (!enabled) {
    return {
      enabled: false, positionsRemaining, forwardLiabilityPaisa, coverageBps, requiredSecurityPaisa,
      heldDepositPaisa, heldHoldbackPaisa, commitmentCoverPaisa, postedSecurityPaisa,
      securityShortfallPaisa: shortfallBeforePot, securityHoldbackPaisa: 0n,
      residualShortfallPaisa: shortfallBeforePot, holdbackPaisa: input.bufferHoldbackPaisa,
      holdbackReleasePayments: input.defaultReleasePayments,
      satisfied: postedSecurityPaisa >= requiredSecurityPaisa, gated: false,
    };
  }

  const maxPotHoldbackPaisa = minBig(input.payoutPaisa, bps(input.payoutPaisa, input.policy.maxPotHoldbackBps ?? 6_000));
  const securityHoldbackPaisa = minBig(shortfallBeforePot, maxPotHoldbackPaisa);
  const residualShortfallPaisa = maxBig(0n, shortfallBeforePot - securityHoldbackPaisa);
  const satisfied = residualShortfallPaisa === 0n;
  const gated = input.policy.blockOnSecurityShortfall === true && !satisfied;

  // The final holdback is the larger of the flat buffer and the security slice —
  // the buffer is itself security, so the two are never stacked. A security-
  // driven holdback releases only once the recipient has cleared ALL remaining
  // installments (forward liability back to zero), not after a flat two.
  const securityDriven = securityHoldbackPaisa > input.bufferHoldbackPaisa;
  const holdbackPaisa = minBig(input.payoutPaisa, maxBig(input.bufferHoldbackPaisa, securityHoldbackPaisa));
  const holdbackReleasePayments = securityDriven ? Math.max(1, positionsRemaining) : input.defaultReleasePayments;

  return {
    enabled: true, positionsRemaining, forwardLiabilityPaisa, coverageBps, requiredSecurityPaisa,
    heldDepositPaisa, heldHoldbackPaisa, commitmentCoverPaisa, postedSecurityPaisa,
    securityShortfallPaisa: shortfallBeforePot, securityHoldbackPaisa, residualShortfallPaisa,
    holdbackPaisa, holdbackReleasePayments, satisfied, gated,
  };
}
