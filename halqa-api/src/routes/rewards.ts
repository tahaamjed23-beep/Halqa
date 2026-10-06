import { safeRouter } from '../lib/safe-router';
import { readPage } from '../lib/page';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { audit } from '../lib/audit';
import {
  applyRewardEvent, summarise, LADDER, COMPLETION_REWARD_CAP_PAISA,
  type RewardEventKind,
} from '../lib/rewards';

// Rewards surface. Points buy partner discounts; the credit score gates
// positions. The two never cross (lib/rewards.ts), and nothing here is ever
// redeemable for cash — a cash-redeemable balance would be a stored-value
// instrument, which is regulated activity.
// safeRouter, not Router: a rejected promise in any handler below reaches the
// error handler instead of hanging the request (lib/safe-router.ts).
const router = safeRouter();
router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId },
      select: { rewardPoints: true, paymentStreak: true, longestStreak: true, scoreGainedThisCycle: true },
    });
    // The history is a list inside an envelope, so the bound is reported in
    // the header the same way and the envelope is unchanged for every client.
    const { take, cursorArgs } = readPage(req.query);
    const events = await prisma.rewardEvent.findMany({
      where: { userId: req.auth!.userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],   // id breaks ties, so a cursor is sound
      take, ...cursorArgs,
    });
    res.setHeader('X-Next-Cursor', events.length === take ? events[events.length - 1]!.id : '');
    res.setHeader('X-Page-Limit', String(take));
    res.json({
      ...summarise(user.rewardPoints, user.paymentStreak, user.longestStreak),
      scoreGainedThisCycle: user.scoreGainedThisCycle,
      completionRewardCapPaisa: COMPLETION_REWARD_CAP_PAISA.toString(),
      history: events.map(e => ({ ...e, createdAt: e.createdAt.toISOString() })),
    });
  } catch (error) { next(error); }
});

// The ladder itself, with no member context. Used on marketing surfaces and by
// the partner grid before a member has any streak at all.
router.get('/ladder', (_req, res) => {
  res.json({
    tiers: LADDER.map(t => ({ ...t, rewardCapPaisa: t.rewardCapPaisa.toString() })),
    completionRewardCapPaisa: COMPLETION_REWARD_CAP_PAISA.toString(),
  });
});

const recordSchema = z.object({
  kind: z.enum(['PAID_ON_TIME', 'PAID_EARLY', 'CIRCLE_COMPLETED_CLEAN', 'PAID_FOR_ANOTHER', 'MISSED']),
  committeeId: z.string().optional(),
  roundId: z.string().optional(),
  settled: z.boolean().default(true),
});

/**
 * Record a reward event and move the member's balances atomically.
 *
 * The whole point of routing this through one place is that the rules in
 * lib/rewards.ts — the per-cycle score cap, the streak multiplier, the fact
 * that paying for somebody else earns points but never score — cannot be
 * bypassed by a caller that forgets one of them.
 */
export async function recordReward(userId: string, input: z.infer<typeof recordSchema>) {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { paymentStreak: true, longestStreak: true, scoreGainedThisCycle: true },
  });

  const outcome = applyRewardEvent({
    kind: input.kind as RewardEventKind,
    currentStreak: user.paymentStreak,
    scoreGainedThisCycle: user.scoreGainedThisCycle,
    settled: input.settled,
  });

  const streakAfter = outcome.streakDelta < 0 ? 0 : user.paymentStreak + outcome.streakDelta;
  const longestAfter = Math.max(user.longestStreak, streakAfter);

  const [event] = await prisma.$transaction([
    prisma.rewardEvent.create({
      data: {
        userId,
        committeeId: input.committeeId ?? null,
        roundId: input.roundId ?? null,
        kind: input.kind,
        points: outcome.points,
        scoreDelta: outcome.scoreDelta,
        streakAfter,
        multiplier: outcome.multiplierApplied,
        reason: outcome.reason,
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        rewardPoints: { increment: outcome.points },
        paymentStreak: streakAfter,
        longestStreak: longestAfter,
        scoreGainedThisCycle: outcome.scoreDelta > 0
          ? { increment: outcome.scoreDelta }
          : input.kind === 'CIRCLE_COMPLETED_CLEAN' ? 0 : undefined,
        creditScore: outcome.scoreDelta !== 0 ? { increment: outcome.scoreDelta } : undefined,
      },
    }),
  ]);

  return { event, outcome, streakAfter };
}

// Dev-only manual trigger. In production reward events are emitted by the
// settlement path, never by a client, so a member cannot mint their own points.
router.post('/record', async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Reward events are emitted by settlement, not by clients' });
    }
    const input = recordSchema.parse(req.body);
    const result = await recordReward(req.auth!.userId, input);
    await audit(prisma, req.auth!.userId, 'REWARD_RECORDED', 'RewardEvent', result.event.id, { kind: input.kind, points: result.outcome.points });
    res.json(result);
  } catch (error) { next(error); }
});

export default router;
