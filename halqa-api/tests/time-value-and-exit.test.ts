import { describe, it, expect } from 'vitest';
import { assessTimeValue, positionAdjustment, DEFAULT_ANNUAL_RATE } from '../src/lib/time-value';
import {
  availableRungs, computeRestitution, tallyVote, restitutionImbalance, FINE_SPLIT,
} from '../src/lib/exit-ladder';
import { applyRewardEvent, summarise, streakMultiplier, tierFor, nextTier, SCORE_GAIN_CAP_PER_CYCLE } from '../src/lib/rewards';

// Reference monthly circle: 12 members, Rs 20,000 a month, Rs 240,000 pot.
const CIRCLE = { contributionPaisa: 2_000_000n, totalRounds: 12 };

describe('time value of a turn', () => {
  const tv = assessTimeValue(CIRCLE);

  it('makes the first position worth money and the last cost money', () => {
    expect(tv.positions[0].valuePaisa > 0n).toBe(true);
    expect(tv.positions[11].valuePaisa < 0n).toBe(true);
  });

  it('places the neutral position near the middle, not at the end', () => {
    expect(tv.neutralPosition).toBeGreaterThan(5);
    expect(tv.neutralPosition).toBeLessThan(8);
    // The naive schedule tapers to zero at the LAST seat; this is the finding.
    expect(tv.neutralPosition).toBeLessThan(CIRCLE.totalRounds);
  });

  it('puts the spread near a tenth of the pot at an ordinary cost of money', () => {
    const potPaisa = 24_000_000n;
    const ratio = Number(tv.spreadPaisa) / Number(potPaisa);
    expect(ratio).toBeGreaterThan(0.07);
    expect(ratio).toBeLessThan(0.13);
  });

  it('balances exactly: what the early half pays is what the late half receives', () => {
    expect(tv.balanced).toBe(true);
    expect(tv.totalFeesPaisa).toBe(tv.totalCreditsPaisa);
    const net = tv.positions.reduce((s, p) => s + p.feePaisa, 0n);
    expect(net).toBe(0n);
  });

  it('charges early positions and credits late ones', () => {
    expect(positionAdjustment(CIRCLE, 1) > 0n).toBe(true);
    expect(positionAdjustment(CIRCLE, 12) < 0n).toBe(true);
  });

  it('flattens as the discount rate approaches zero', () => {
    const flat = assessTimeValue({ ...CIRCLE, annualRate: 0.0001 });
    expect(Number(flat.spreadPaisa)).toBeLessThan(Number(tv.spreadPaisa) / 10);
  });

  it('widens as the cost of money rises', () => {
    const dear = assessTimeValue({ ...CIRCLE, annualRate: 0.30 });
    expect(dear.spreadPaisa > tv.spreadPaisa).toBe(true);
    expect(dear.neutralPosition).toBeLessThanOrEqual(tv.neutralPosition);
  });

  it('uses the documented default rate when none is given', () => {
    expect(tv.annualRate).toBe(DEFAULT_ANNUAL_RATE);
  });
});

describe('exit ladder', () => {
  it('offers nothing to a member who already collected', () => {
    expect(availableRungs({ inConfirmationWindow: false, hasCollected: true, substituteAvailable: true, hardshipFiled: true })).toEqual([]);
  });

  it('offers only the free window while the circle is confirming', () => {
    expect(availableRungs({ inConfirmationWindow: true, hasCollected: false, substituteAvailable: false, hardshipFiled: false })).toEqual(['WINDOW']);
  });

  it('prefers substitution, then the vote, then hardship', () => {
    const rungs = availableRungs({ inConfirmationWindow: false, hasCollected: false, substituteAvailable: true, hardshipFiled: true });
    expect(rungs).toEqual(['SUBSTITUTION', 'GROUP_VOTE', 'HARDSHIP']);
  });
});

describe('restitution arithmetic', () => {
  it('makes the leaver whole from the members who collected early', () => {
    // Exit after four installments, four rounds already paid out.
    const r = computeRestitution({
      contributionPaisa: 1_000_000n, installmentsPaid: 4, roundsAlreadyPaid: [1, 2, 3, 4], rung: 'HARDSHIP',
    });
    // Four earlier recipients each return exactly one contribution.
    expect(r.debts).toHaveLength(4);
    expect(r.debts.every(d => d.amountPaisa === 1_000_000n)).toBe(true);
    expect(r.totalDuePaisa).toBe(4_000_000n);
    // Hardship waives the fine.
    expect(r.finePaisa).toBe(0n);
    expect(r.netToLeaverPaisa).toBe(4_000_000n);
  });

  it('charges one installment on a group-approved exit and splits it 70/30', () => {
    const r = computeRestitution({
      contributionPaisa: 1_000_000n, installmentsPaid: 4, roundsAlreadyPaid: [1, 2, 3, 4], rung: 'GROUP_VOTE',
    });
    expect(r.finePaisa).toBe(1_000_000n);
    expect(r.fineToMembersPaisa).toBe(700_000n);
    expect(r.fineToPlatformPaisa).toBe(300_000n);
    expect(r.fineToMembersPaisa + r.fineToPlatformPaisa).toBe(r.finePaisa);
    expect(Number(r.fineToMembersPaisa) / Number(r.finePaisa)).toBeCloseTo(FINE_SPLIT.members, 6);
  });

  it('pays a substituted leaver their paid-to-date and contracts nothing', () => {
    const r = computeRestitution({
      contributionPaisa: 1_000_000n, installmentsPaid: 5, roundsAlreadyPaid: [1, 2, 3], rung: 'SUBSTITUTION',
    });
    expect(r.totalDuePaisa).toBe(5_000_000n);
    expect(r.debts).toHaveLength(0);
  });

  it('withholds restitution on abandonment', () => {
    const r = computeRestitution({
      contributionPaisa: 1_000_000n, installmentsPaid: 4, roundsAlreadyPaid: [1, 2, 3, 4], rung: 'ABANDONMENT',
    });
    expect(r.withheld).toBe(true);
    expect(r.totalDuePaisa).toBe(0n);
  });

  it('costs nothing inside the confirmation window', () => {
    const r = computeRestitution({
      contributionPaisa: 1_000_000n, installmentsPaid: 0, roundsAlreadyPaid: [], rung: 'WINDOW',
    });
    expect(r.totalDuePaisa).toBe(0n);
    expect(r.finePaisa).toBe(0n);
  });

  it('closes the ledger to exactly zero', () => {
    // Three continuing members net zero; the leaver paid 4 and is restored 4.
    const imbalance = restitutionImbalance([
      { receivedPaisa: 11_000_000n, paidPaisa: 12_000_000n, restitutionPaisa: 1_000_000n },
      { receivedPaisa: 11_000_000n, paidPaisa: 12_000_000n, restitutionPaisa: 1_000_000n },
      { receivedPaisa: 12_000_000n, paidPaisa: 12_000_000n, restitutionPaisa: 0n },
      { receivedPaisa: 0n, paidPaisa: 4_000_000n, restitutionPaisa: 4_000_000n },
    ]);
    expect(imbalance).toBe(0n);
  });
});

describe('exit vote', () => {
  it('escalates rather than trapping a member when nobody votes', () => {
    const out = tallyVote({ eligibleVoters: 11, votesFor: 1, votesAgainst: 1 });
    expect(out.quorumMet).toBe(false);
    expect(out.escalated).toBe(true);
    expect(out.approved).toBe(false);
  });

  it('approves on a majority of votes cast once quorum is met', () => {
    const out = tallyVote({ eligibleVoters: 11, votesFor: 5, votesAgainst: 2 });
    expect(out.quorumMet).toBe(true);
    expect(out.approved).toBe(true);
  });

  it('declines on a tie, because approval needs more than half of votes cast', () => {
    const out = tallyVote({ eligibleVoters: 8, votesFor: 3, votesAgainst: 3 });
    expect(out.quorumMet).toBe(true);
    expect(out.approved).toBe(false);
  });
});

describe('rewards', () => {
  it('never lets points buy score when paying for somebody else', () => {
    const out = applyRewardEvent({ kind: 'PAID_FOR_ANOTHER', currentStreak: 20, scoreGainedThisCycle: 0, settled: true });
    expect(out.points).toBeGreaterThan(0);
    expect(out.scoreDelta).toBe(0);
    expect(out.streakDelta).toBe(0);
  });

  it('caps score gain per cycle but keeps paying points', () => {
    const out = applyRewardEvent({ kind: 'PAID_ON_TIME', currentStreak: 5, scoreGainedThisCycle: SCORE_GAIN_CAP_PER_CYCLE, settled: true });
    expect(out.scoreDelta).toBe(0);
    expect(out.points).toBeGreaterThan(0);
  });

  it('releases nothing against an unsettled contribution', () => {
    const out = applyRewardEvent({ kind: 'PAID_ON_TIME', currentStreak: 5, scoreGainedThisCycle: 0, settled: false });
    expect(out.points).toBe(0);
    expect(out.scoreDelta).toBe(0);
  });

  it('resets the streak on a miss without confiscating points', () => {
    const out = applyRewardEvent({ kind: 'MISSED', currentStreak: 12, scoreGainedThisCycle: 0, settled: false });
    expect(out.streakDelta).toBe(-1);
    expect(out.points).toBe(0);
  });

  it('caps the streak multiplier at fifty per cent', () => {
    expect(streakMultiplier(0)).toBe(1);
    expect(streakMultiplier(100)).toBe(1.5);
    expect(streakMultiplier(4)).toBeCloseTo(1.2, 6);
  });

  it('unlocks ladder tiers in order and reports the next rung', () => {
    expect(tierFor(2)).toBeNull();
    expect(tierFor(3)!.rounds).toBe(3);
    expect(tierFor(30)!.rounds).toBe(24);
    expect(nextTier(30)!.tier.rounds).toBe(36);
    expect(nextTier(36)).toBeNull();
  });

  it('summarises a member for the ladder UI', () => {
    const s = summarise(1200, 13, 20);
    expect(s.currentTier!.rounds).toBe(12);
    expect(s.next!.roundsAway).toBe(5);
    expect(s.ladder.filter(t => t.unlocked)).toHaveLength(3);
  });
});
