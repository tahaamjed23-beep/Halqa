// Rewards — streaks, points and the partner ladder.
//
// On-time payment is the single input the whole model rests on: expected loss,
// the price, the score and the value of the data asset all move with it. So the
// reward system is attached to that one behaviour and to nothing else.
//
// Two currencies, deliberately kept apart:
//   * POINTS buy retail discounts. They are a loyalty balance.
//   * SCORE gates which positions a member may claim. It is a risk measure.
// Points never buy score and score is never sold. Blur the two and the score
// stops measuring risk, which is the only thing making it worth furnishing to
// a credit bureau.
//
// The ladder is funded by somebody else. Each tier's reward is the RETAILER's
// own promotional discount, offered to an audience qualified by a year or more
// of demonstrated payment behaviour — customer acquisition spend for them,
// reaching a segment they cannot otherwise identify. Halqa earns an affiliate
// commission on the resulting order. The reward is the retailer's discount and
// the revenue is the retailer's commission, so the scheme funds itself and
// grows with members rather than with circles.
//
// Hard rules encoded below:
//   * paying a contribution FOR another member earns points but no streak and
//     no score — a wealthier friend cannot buy anybody a credit record;
//   * score gain is capped per cycle so it cannot be farmed with tiny circles;
//   * a miss resets the streak but confiscates nothing already earned;
//   * rewards release only against contributions that actually SETTLED;
//   * nothing is ever redeemable for cash — cash-redeemable points are a stored
//     value instrument, which is regulated activity. This one rule keeps the
//     whole scheme outside that perimeter.

export type RewardEventKind =
  | 'PAID_ON_TIME'
  | 'PAID_EARLY'
  | 'CIRCLE_COMPLETED_CLEAN'
  | 'PAID_FOR_ANOTHER'
  | 'MISSED';

export type RewardOutcome = {
  points: number;          // added to the member's balance (never negative)
  scoreDelta: number;      // applied to creditScore, subject to the cycle cap
  streakDelta: number;     // +1 advances, 0 leaves alone, -1 means "reset"
  multiplierApplied: number;
  reason: string;
};

// Base points per event, before the streak multiplier.
export const POINTS = {
  PAID_ON_TIME: 10,
  PAID_EARLY: 15,          // three or more days before the due date
  CIRCLE_COMPLETED_CLEAN: 200,
  PAID_FOR_ANOTHER: 50,
  MISSED: 0,
} as const;

// Score movement per event. Deliberately small on the upside and meaningful on
// the downside — the score is a risk measure, not a loyalty balance.
export const SCORE_DELTA = {
  PAID_ON_TIME: 2,
  PAID_EARLY: 2,
  CIRCLE_COMPLETED_CLEAN: 200,
  PAID_FOR_ANOTHER: 0,     // deliberately neutral
  MISSED: 0,               // handled by the delinquency ladder, not here
} as const;

/** Most score a member can gain from on-time payments in one cycle. */
export const SCORE_GAIN_CAP_PER_CYCLE = 40;

/** Streak multiplier on POINTS only: +5% per consecutive clean round, ceiling +50%. */
export const STREAK_MULTIPLIER_STEP = 0.05;
export const STREAK_MULTIPLIER_CEILING = 1.50;

export const streakMultiplier = (streak: number): number =>
  Math.min(STREAK_MULTIPLIER_CEILING, 1 + Math.max(0, streak) * STREAK_MULTIPLIER_STEP);

export type LadderTier = {
  rounds: number;             // consecutive clean rounds required
  /** Ceiling on the partner discount, in paisa. */
  rewardCapPaisa: bigint;
  /** The Halqa charge a member may waive instead of taking the discount. */
  alternative: string | null;
  label: string;
};

// Six tiers plus a completion award. Caps rise faster than the streak so the
// ladder keeps pulling; the top tier is reachable in three years of clean
// monthly payment, which is a realistic horizon for a committee member.
export const LADDER: LadderTier[] = [
  { rounds: 3,  rewardCapPaisa:   50_000n, alternative: null, label: 'Five per cent with a partner retailer' },
  { rounds: 6,  rewardCapPaisa:  100_000n, alternative: 'Delivery waived', label: 'Ten per cent, plus delivery waived' },
  { rounds: 12, rewardCapPaisa:  200_000n, alternative: 'One month of the Halqa charge waived', label: 'Twelve per cent' },
  { rounds: 18, rewardCapPaisa:  300_000n, alternative: 'Position placement fee waived on the next circle', label: 'Category offer' },
  { rounds: 24, rewardCapPaisa:  400_000n, alternative: 'Early position fee waived on the next circle', label: 'Fifteen per cent' },
  { rounds: 36, rewardCapPaisa:  600_000n, alternative: 'Early position fee and one month of charges waived', label: 'Top tier offer' },
];

export const COMPLETION_REWARD_CAP_PAISA = 150_000n;

/** The highest tier a streak has unlocked, or null below the first rung. */
export const tierFor = (streak: number): LadderTier | null => {
  let unlocked: LadderTier | null = null;
  for (const tier of LADDER) if (streak >= tier.rounds) unlocked = tier;
  return unlocked;
};

/** The next rung and how many clean rounds remain to reach it. */
export const nextTier = (streak: number): { tier: LadderTier; roundsAway: number } | null => {
  const tier = LADDER.find(t => t.rounds > streak);
  return tier ? { tier, roundsAway: tier.rounds - streak } : null;
};

export type ApplyInput = {
  kind: RewardEventKind;
  /** Streak BEFORE this event. */
  currentStreak: number;
  /** Score already gained from on-time payments in the current cycle. */
  scoreGainedThisCycle: number;
  /** False when the contribution has not actually settled — nothing releases
   *  against an assertion, only against a settlement. */
  settled: boolean;
};

export function applyRewardEvent(input: ApplyInput): RewardOutcome {
  const none: RewardOutcome = { points: 0, scoreDelta: 0, streakDelta: 0, multiplierApplied: 1, reason: 'Not settled' };
  if (!input.settled && input.kind !== 'MISSED') return none;

  if (input.kind === 'MISSED') {
    return {
      points: 0, scoreDelta: 0, streakDelta: -1, multiplierApplied: 1,
      reason: 'Missed contribution. Streak reset; points already earned are kept.',
    };
  }

  // Paying for somebody else is deliberately inert on both the streak and the
  // score. It earns points, and nothing that could be mistaken for a record.
  if (input.kind === 'PAID_FOR_ANOTHER') {
    return {
      points: POINTS.PAID_FOR_ANOTHER, scoreDelta: 0, streakDelta: 0, multiplierApplied: 1,
      reason: 'Paid a contribution for another member. Points only, by design.',
    };
  }

  const multiplier = streakMultiplier(input.currentStreak);
  const base = POINTS[input.kind];
  const points = Math.round(base * multiplier);

  // The per-cycle cap applies to routine on-time gains, never to a completion,
  // which is the one event that proves the whole cycle rather than a month.
  const wanted = SCORE_DELTA[input.kind];
  const scoreDelta = input.kind === 'CIRCLE_COMPLETED_CLEAN'
    ? wanted
    : Math.max(0, Math.min(wanted, SCORE_GAIN_CAP_PER_CYCLE - input.scoreGainedThisCycle));

  return {
    points, scoreDelta,
    streakDelta: input.kind === 'CIRCLE_COMPLETED_CLEAN' ? 0 : 1,
    multiplierApplied: multiplier,
    reason: input.kind === 'PAID_EARLY' ? 'Paid three or more days early'
      : input.kind === 'CIRCLE_COMPLETED_CLEAN' ? 'Completed a circle with a clean record'
      : 'Paid on or before the due date',
  };
}

export type RewardsSummary = {
  points: number;
  streak: number;
  longestStreak: number;
  multiplier: number;
  currentTier: LadderTier | null;
  next: { tier: LadderTier; roundsAway: number } | null;
  /** Every tier with whether the member has reached it — drives the UI ladder. */
  ladder: Array<LadderTier & { unlocked: boolean }>;
};

export function summarise(points: number, streak: number, longestStreak: number): RewardsSummary {
  return {
    points, streak, longestStreak,
    multiplier: streakMultiplier(streak),
    currentTier: tierFor(streak),
    next: nextTier(streak),
    ladder: LADDER.map(t => ({ ...t, unlocked: streak >= t.rounds })),
  };
}
