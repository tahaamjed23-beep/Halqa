import { describe, expect, it } from 'vitest';
import {
  band, allowedPositions, positionsForTier, mayBuyTurns, fromTasdeeq, startOrder, startOrderByStanding,
  eligiblePositions, earlyTurnUnlocked, seatTier, seatReason, securityCovers, lowOnRealFactors,
  standingOf, seatsOpenOnJoin, BUREAU_CONNECTED,
  BAND_CUTOFFS, REQUIRED_CLEAN_CIRCLES, SECURITY_RELAXATION_BPS, TASDEEQ_BANDS_PUBLISHED,
  type MemberStanding,
} from '../src/lib/score-bands';

// Seat eligibility under the chairman's ruling of 2026-10-05. The test is no
// longer tenure but recoverability: credit history, a clean circle, or pledged
// security. These lock the matrix so a retune is deliberate, not an accident.

const M = (over: Partial<MemberStanding> = {}): MemberStanding =>
  ({ creditScore: 700, committeesCompletedClean: 0, creditStanding: 'NONE', ...over });

describe('score bands', () => {
  it('maps scores to the four bands at the documented cutoffs', () => {
    expect(band(300)).toBe('BAD');
    expect(band(BAND_CUTOFFS.decent - 1)).toBe('BAD');
    expect(band(BAND_CUTOFFS.decent)).toBe('DECENT');
    expect(band(649)).toBe('DECENT');
    expect(band(BAND_CUTOFFS.good)).toBe('GOOD');
    expect(band(749)).toBe('GOOD');
    expect(band(BAND_CUTOFFS.excellent)).toBe('EXCELLENT');
    expect(band(850)).toBe('EXCELLENT');
  });

  it('seat tiers map to the right blocks of seats', () => {
    expect(positionsForTier('ANY', 10)).toEqual([1,2,3,4,5,6,7,8,9,10]);
    expect(positionsForTier('MIDDLE', 10)).toEqual([6,7,8,9,10]);
    expect(positionsForTier('MIDDLE', 7)).toEqual([4,5,6,7]);   // floor(7/2)=3 → positions >3
    expect(positionsForTier('LAST', 10)).toEqual([8,9,10]);
    expect(positionsForTier('LAST', 20)).toEqual([18,19,20]);
    expect(positionsForTier('LAST', 4)).toEqual([3,4]);          // max(cap-3,floor/2)=max(1,2)=2 → >2
    expect(positionsForTier('LAST', 3)).toEqual([2,3]);          // clamped to the second half
  });

  it('the last tier can always claim the very last seat and never the first', () => {
    for (const cap of [3,4,5,8,10,12,20]) {
      expect(positionsForTier('LAST', cap)).toContain(cap);
      expect(positionsForTier('LAST', cap)).not.toContain(1);
    }
  });

  it('allowedPositions still works for callers that think in bands', () => {
    expect(allowedPositions('GOOD', 10)).toEqual(positionsForTier('ANY', 10));
    expect(allowedPositions('DECENT', 10)).toEqual(positionsForTier('MIDDLE', 10));
    expect(allowedPositions('BAD', 10)).toEqual(positionsForTier('LAST', 10));
  });

  it('only BAD is barred from buying marketplace turns', () => {
    expect(mayBuyTurns(540)).toBe(false);
    expect(mayBuyTurns(550)).toBe(true);
    expect(mayBuyTurns(700)).toBe(true);
    expect(mayBuyTurns(800)).toBe(true);
  });
});

describe('the seat matrix of 5 October 2026', () => {
  it('no credit record at all starts in the last seats', () => {
    expect(seatTier(M({ creditStanding: 'NONE' }))).toBe('LAST');
    expect(eligiblePositions(10, M({ creditStanding: 'NONE' }))).not.toContain(1);
  });

  it('a record too thin to score starts in the middle seats', () => {
    expect(seatTier(M({ creditStanding: 'THIN' }))).toBe('MIDDLE');
  });

  it('a mid score on a real record opens the middle seats', () => {
    expect(seatTier(M({ creditStanding: 'SCORED', creditScore: 600 }))).toBe('MIDDLE');
  });

  it('a low score on a real record is held to the last seats', () => {
    const low = M({ creditStanding: 'SCORED', creditScore: 500 });
    expect(lowOnRealFactors(low)).toBe(true);
    expect(seatTier(low)).toBe('LAST');
  });

  it('a low score on no record is NOT treated as a bad record', () => {
    // The same number, but nothing behind it: this member is untested, not bad.
    expect(lowOnRealFactors(M({ creditStanding: 'NONE', creditScore: 500 }))).toBe(false);
  });

  it('one clean circle opens every seat where history could not speak', () => {
    expect(REQUIRED_CLEAN_CIRCLES).toBe(1);
    expect(seatTier(M({ creditStanding: 'NONE', committeesCompletedClean: 1 }))).toBe('ANY');
    expect(seatTier(M({ creditStanding: 'THIN', committeesCompletedClean: 1 }))).toBe('ANY');
    expect(eligiblePositions(12, M({ committeesCompletedClean: 1 }))).toContain(1);
  });

  it('a clean circle does not excuse a genuinely low score', () => {
    expect(seatTier(M({ creditStanding: 'SCORED', creditScore: 500, committeesCompletedClean: 3 }))).toBe('LAST');
  });

  it('no score counts as good until TASDEEQ publishes its bands', () => {
    expect(TASDEEQ_BANDS_PUBLISHED).toBe(false);
    // An excellent score on a real record still tops out at the middle seats.
    expect(seatTier(M({ creditStanding: 'SCORED', creditScore: 820 }))).toBe('MIDDLE');
  });

  it('the blanket quarantine is gone: tenure alone no longer decides seats', () => {
    // Before 5 October every new member was held to the last seats whatever
    // their standing. A thin-file newcomer now reaches the middle seats at once.
    expect(seatTier(M({ creditStanding: 'THIN', committeesCompletedClean: 0 }))).toBe('MIDDLE');
  });
});

describe('security in place of credit history', () => {
  const POT = 1_200_000; // Rs 12,000 in paisa

  it('security at or above 90 per cent of the pot counts', () => {
    expect(SECURITY_RELAXATION_BPS).toBe(1_000);
    expect(securityCovers(POT, POT)).toBe(true);
    expect(securityCovers(POT, Math.ceil(POT * 0.90))).toBe(true);
    expect(securityCovers(POT, Math.ceil(POT * 0.91))).toBe(true);
  });

  it('security below the relaxation does not count', () => {
    expect(securityCovers(POT, Math.floor(POT * 0.89))).toBe(false);
    expect(securityCovers(POT, 0)).toBe(false);
    expect(securityCovers(POT, null)).toBe(false);
    expect(securityCovers(null, POT)).toBe(false);
  });

  it('security opens every seat to a member with no credit record', () => {
    const m = M({ creditStanding: 'NONE', potPaisa: POT, securityPaisa: POT });
    expect(seatTier(m)).toBe('ANY');
    expect(eligiblePositions(12, m)).toContain(1);
  });

  it('security cannot buy past a low score on a real record', () => {
    const m = M({ creditStanding: 'SCORED', creditScore: 480, potPaisa: POT, securityPaisa: POT });
    expect(seatTier(m)).toBe('LAST');
  });

  it('sources combine: the caller adds them and the total is tested', () => {
    const points = 400_000, savings = 500_000, asset = 200_000; // 11,000 of 12,000
    expect(securityCovers(POT, points + savings + asset)).toBe(true);   // 91.6 per cent
    expect(securityCovers(POT, points + savings)).toBe(false);          // 75 per cent
  });
});

describe('what the member is told', () => {
  it('names the route out of the last seats', () => {
    expect(seatReason(M({ creditStanding: 'NONE' }))).toContain('no credit record');
    expect(seatReason(M({ creditStanding: 'NONE' }))).toContain('security');
    expect(seatReason(M({ creditStanding: 'THIN' }))).toContain('too short to judge');
    expect(seatReason(M({ committeesCompletedClean: 1 }))).toBe('Every seat is open to you.');
    expect(seatReason(M({ creditStanding: 'SCORED', creditScore: 480 }))).toContain('Paying cleanly raises your score');
  });

  it('earlyTurnUnlocked now means every seat is open, not a served quarantine', () => {
    expect(earlyTurnUnlocked(M({ committeesCompletedClean: 1 }))).toBe(true);
    expect(earlyTurnUnlocked(M({ creditStanding: 'NONE' }))).toBe(false);
  });
});

describe('start ordering', () => {
  it('never places a riskier member ahead of a safer one', () => {
    const members = [
      { creditScore: 500, turnPosition: 8, joinedAt: 1 },
      { creditScore: 520, turnPosition: 9, joinedAt: 2 },
      { creditScore: 800, turnPosition: 2, joinedAt: 3 },
      { creditScore: 600, turnPosition: 6, joinedAt: 4 },
      { creditScore: 720, turnPosition: 1, joinedAt: 5 },
    ];
    const ordered = [...members].sort(startOrder);
    const rank = (s: number) => band(s) === 'BAD' ? 2 : band(s) === 'DECENT' ? 1 : 0;
    for (let i = 1; i < ordered.length; i++) {
      expect(rank(ordered[i].creditScore)).toBeGreaterThanOrEqual(rank(ordered[i - 1].creditScore));
    }
    expect(band(ordered[0].creditScore)).not.toBe('BAD');
    expect(band(ordered[ordered.length - 1].creditScore)).toBe('BAD');
  });

  it('preserves each member\'s pick within their band', () => {
    const members = [
      { creditScore: 800, turnPosition: 5, joinedAt: 1 },
      { creditScore: 720, turnPosition: 2, joinedAt: 2 },
    ];
    const ordered = [...members].sort(startOrder);
    expect(ordered[0].turnPosition).toBe(2);
    expect(ordered[1].turnPosition).toBe(5);
  });

  it('ordering by full standing keeps the same invariant', () => {
    const members = [
      { ...M({ creditStanding: 'NONE' }), turnPosition: 9, joinedAt: 1 },
      { ...M({ committeesCompletedClean: 1 }), turnPosition: 2, joinedAt: 2 },
      { ...M({ creditStanding: 'THIN' }), turnPosition: 6, joinedAt: 3 },
    ];
    const ordered = [...members].sort(startOrderByStanding);
    expect(seatTier(ordered[0])).toBe('ANY');
    expect(seatTier(ordered[ordered.length - 1])).toBe('LAST');
  });
});

describe('the TASDEEQ scale', () => {
  it('maps 200-600 onto 300-850, clamped', () => {
    expect(fromTasdeeq(200)).toBe(300);
    expect(fromTasdeeq(600)).toBe(850);
    expect(fromTasdeeq(100)).toBe(300);
    expect(fromTasdeeq(700)).toBe(850);
    expect(fromTasdeeq(400)).toBe(575);
  });
});

describe('the blocks of seats themselves', () => {
  it('the middle seats are the second half of the circle', () => {
    expect(positionsForTier('MIDDLE', 12)).toEqual([7, 8, 9, 10, 11, 12]);
    expect(positionsForTier('MIDDLE', 20)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('the last seats are the final three, never earlier than the second half', () => {
    expect(positionsForTier('LAST', 12)).toEqual([10, 11, 12]);
    expect(positionsForTier('LAST', 20)).toEqual([18, 19, 20]);
    // In a circle of 4 the final three would reach seat 2, which is the first
    // half: the clamp holds it back, because early money is what needs guarding.
    expect(positionsForTier('LAST', 4)).toEqual([3, 4]);
    expect(positionsForTier('LAST', 3)).toEqual([2, 3]);
  });

  it('scales to a circle of 20 in the same proportions', () => {
    for (const cap of [6, 12, 20, 36]) {
      const last = positionsForTier('LAST', cap);
      const middle = positionsForTier('MIDDLE', cap);
      expect(middle.length).toBe(cap - Math.floor(cap / 2));
      expect(last.every(p => middle.includes(p))).toBe(true);   // LAST sits inside MIDDLE
      expect(middle.every(p => p > cap / 2)).toBe(true);        // MIDDLE never reaches the first half
    }
  });
});

describe('one standing for every caller', () => {
  it('reads a stored row the same way wherever it is asked', () => {
    const row = { creditScore: 700, committeesCompletedClean: 0 };
    expect(seatTier(standingOf(row))).toBe(seatTier(standingOf({ ...row })));
  });

  it('while no bureau is connected, a member with a score has a record too thin to judge', () => {
    expect(BUREAU_CONNECTED).toBe(false);
    expect(standingOf({ creditScore: 700, committeesCompletedClean: 0 }).creditStanding).toBe('THIN');
    expect(seatTier(standingOf({ creditScore: 700, committeesCompletedClean: 0 }))).toBe('MIDDLE');
  });

  it('a member with nothing on file at all is still held to the last seats', () => {
    expect(standingOf({}).creditStanding).toBe('NONE');
    expect(seatTier(standingOf({}))).toBe('LAST');
  });

  it('a standing already settled by the bureau is never overwritten', () => {
    expect(standingOf({ creditScore: 700, creditStanding: 'SCORED' }).creditStanding).toBe('SCORED');
    expect(standingOf({ creditScore: 400, creditStanding: 'SCORED' }).creditStanding).toBe('SCORED');
    expect(seatTier(standingOf({ creditScore: 400, creditStanding: 'SCORED' }))).toBe('LAST');
  });

  it('carries pledged security and the pot it is pledged against', () => {
    const s = standingOf({ creditScore: 0, securityPledgedPaisa: 900_000 }, 1_000_000);
    expect(seatTier(s)).toBe('ANY');
    expect(seatTier(standingOf({ creditScore: 0, securityPledgedPaisa: 899_999 }, 1_000_000))).toBe('LAST');
  });

  it('a clean committee opens every seat through the same mapping', () => {
    expect(seatTier(standingOf({ creditScore: 700, committeesCompletedClean: REQUIRED_CLEAN_CIRCLES }))).toBe('ANY');
  });
});

describe('what a host may and may not do', () => {
  const lastOnly = M({ creditStanding: 'NONE' });

  it('a host cannot open an early seat on a circle between strangers', () => {
    expect(seatTier(lastOnly)).toBe('LAST');
    expect(seatsOpenOnJoin(true, 12, lastOnly)).toEqual(positionsForTier('LAST', 12));
    expect(seatsOpenOnJoin(true, 12, lastOnly)).not.toContain(1);
  });

  it('on a known circle the host\'s invitation stands in the matrix\'s place', () => {
    // The host is vouching, which is the social collateral a committee has
    // always run on, and seats on an invited circle are host-assigned.
    expect(seatsOpenOnJoin(false, 12, lastOnly)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it('the public route is the same engine, so the two cannot drift apart', () => {
    for (const standing of [M({ creditStanding: 'NONE' }), M({ creditStanding: 'THIN' }),
                            M({ creditStanding: 'SCORED', creditScore: 400 }),
                            M({ committeesCompletedClean: 1 })]) {
      expect(seatsOpenOnJoin(true, 12, standing)).toEqual(eligiblePositions(12, standing));
    }
  });
});
