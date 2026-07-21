import { describe, expect, it } from 'vitest';
import { assessForwardLiability, type ForwardLiabilityInput } from '../src/lib/forward-liability';

// Rs 10,000 contribution, 20-member circle, Rs 200,000 pot.
const CONTRIB = 1_000_000n;
const POT = 20_000_000n;

const base = (over: Partial<ForwardLiabilityInput> = {}): ForwardLiabilityInput => ({
  contributionPaisa: CONTRIB,
  roundNumber: 2,
  totalRounds: 20,
  payoutPaisa: POT,
  bufferHoldbackPaisa: POT * 1500n / 10_000n, // the flat 15% buffer = 3,000,000
  defaultReleasePayments: 2,
  depositCoverageBps: 7000,
  posted: { heldDepositPaisa: 0n, heldHoldbackPaisa: 0n, commitmentVerified: false },
  policy: { forwardLiabilityGateEnabled: true },
  ...over,
});

describe('forward liability sizing', () => {
  it('is contribution times the installments still owed after payout', () => {
    const r = assessForwardLiability(base({ roundNumber: 2 }));
    expect(r.positionsRemaining).toBe(18);
    expect(r.forwardLiabilityPaisa).toBe(18n * CONTRIB);
    // default coverage = depositCoverageBps (70%)
    expect(r.requiredSecurityPaisa).toBe(18n * CONTRIB * 7000n / 10_000n);
  });

  it('is zero for the final position — nothing owed after the last pot', () => {
    const r = assessForwardLiability(base({ roundNumber: 20 }));
    expect(r.positionsRemaining).toBe(0);
    expect(r.forwardLiabilityPaisa).toBe(0n);
    expect(r.requiredSecurityPaisa).toBe(0n);
    expect(r.enabled).toBe(false); // no exposure to gate
    expect(r.holdbackPaisa).toBe(base({ roundNumber: 20 }).bufferHoldbackPaisa);
  });
});

describe('gate disabled (display only)', () => {
  it('reports the exposure but leaves the holdback and release schedule untouched', () => {
    const input = base({ policy: {} }); // forwardLiabilityGateEnabled absent
    const r = assessForwardLiability(input);
    expect(r.enabled).toBe(false);
    expect(r.requiredSecurityPaisa).toBe(18n * CONTRIB * 7000n / 10_000n); // still computed for display
    expect(r.securityHoldbackPaisa).toBe(0n);
    expect(r.holdbackPaisa).toBe(input.bufferHoldbackPaisa); // unchanged
    expect(r.holdbackReleasePayments).toBe(2); // unchanged
    expect(r.gated).toBe(false);
  });
});

describe('gate enabled — satisfying the requirement', () => {
  it('auto-withholds the shortfall from the pot, capped at maxPotHoldbackBps', () => {
    const r = assessForwardLiability(base());
    // required 12,600,000; cap = 60% of 20,000,000 = 12,000,000
    expect(r.securityHoldbackPaisa).toBe(12_000_000n);
    expect(r.residualShortfallPaisa).toBe(600_000n);
    expect(r.holdbackPaisa).toBe(12_000_000n); // supersedes the 3,000,000 buffer
    expect(r.holdbackReleasePayments).toBe(18); // releases only when liability clears
    expect(r.satisfied).toBe(false);
    expect(r.gated).toBe(false); // block not requested — pot collateralises what it can
  });

  it('a host-verified guarantee / security cheque covers the liability, so the pot is not withheld', () => {
    const r = assessForwardLiability(base({ posted: { heldDepositPaisa: 0n, heldHoldbackPaisa: 0n, commitmentVerified: true } }));
    expect(r.commitmentCoverPaisa).toBe(18n * CONTRIB); // full forward liability, legally
    expect(r.securityShortfallPaisa).toBe(0n);
    expect(r.securityHoldbackPaisa).toBe(0n);
    expect(r.holdbackPaisa).toBe(base().bufferHoldbackPaisa); // only the flat buffer — member keeps the pot
    expect(r.holdbackReleasePayments).toBe(2);
    expect(r.satisfied).toBe(true);
  });

  it('a cash deposit reduces the shortfall taken from the pot', () => {
    const r = assessForwardLiability(base({ posted: { heldDepositPaisa: 2_600_000n, heldHoldbackPaisa: 0n, commitmentVerified: false } }));
    // required 12,600,000 − 2,600,000 posted = 10,000,000 taken from pot (under the 12,000,000 cap)
    expect(r.securityHoldbackPaisa).toBe(10_000_000n);
    expect(r.residualShortfallPaisa).toBe(0n);
    expect(r.satisfied).toBe(true);
  });
});

describe('gate enabled — blocking Secure circles', () => {
  it('gates the payout when a residual shortfall remains and blocking is requested', () => {
    const r = assessForwardLiability(base({ policy: { forwardLiabilityGateEnabled: true, blockOnSecurityShortfall: true } }));
    expect(r.residualShortfallPaisa).toBe(600_000n);
    expect(r.gated).toBe(true);
  });

  it('does not gate once posted security clears the residual', () => {
    const r = assessForwardLiability(base({
      policy: { forwardLiabilityGateEnabled: true, blockOnSecurityShortfall: true },
      posted: { heldDepositPaisa: 0n, heldHoldbackPaisa: 0n, commitmentVerified: true },
    }));
    expect(r.satisfied).toBe(true);
    expect(r.gated).toBe(false);
  });

  it('honours a 100% coverage override', () => {
    const r = assessForwardLiability(base({ policy: { forwardLiabilityGateEnabled: true, securityCoverageBps: 10_000 } }));
    expect(r.requiredSecurityPaisa).toBe(18n * CONTRIB); // full liability
    expect(r.securityHoldbackPaisa).toBe(12_000_000n); // still capped by the pot
    expect(r.residualShortfallPaisa).toBe(6_000_000n);
  });
});
