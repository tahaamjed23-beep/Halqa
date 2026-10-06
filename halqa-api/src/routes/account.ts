import { safeRouter } from '../lib/safe-router';
import { readPage } from '../lib/page';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { audit } from '../lib/audit';
import { earlyTurnUnlocked, band, seatTier, seatReason, standingOf, REQUIRED_CLEAN_CIRCLES,
  type SeatTier } from '../lib/score-bands';

// What each block of seats is called on screen.
const SEAT_LABEL: Record<SeatTier, string> = {
  ANY: 'Any turn', MIDDLE: 'The later half of a circle', LAST: 'The last turns only',
};
import { CAPS } from '../lib/affordability';

// ---------------------------------------------------------------------------
// THE ACCOUNT PAGES EVERY WALLET HAS AND HALQA DID NOT
//
//   A STATEMENT for a period, with the totals a member would otherwise work out
//   on paper, and every line that made them.
//
//   THE LIMITS that actually apply, and what would lift them. A member refused
//   at the door with no explanation assumes the app is broken; a member who can
//   see the ceiling and the route past it does the thing that lifts it.
//
//   THE DEVICES signed in, and a way to sign the others out. A password change
//   already does this silently; nobody could see what it was doing.
// ---------------------------------------------------------------------------

// safeRouter, not Router: a rejected promise in any handler below reaches the
// error handler instead of hanging the request (lib/safe-router.ts).
const router = safeRouter();
router.use(requireAuth);

// ---- statement -------------------------------------------------------------
router.get('/statement', async (req, res, next) => {
  try {
    const { from, to } = z.object({
      from: z.string().datetime().optional(),
      to: z.string().datetime().optional(),
    }).parse({ from: req.query.from, to: req.query.to });

    // Default to this month, which is the period a member means when they say
    // "my statement" without qualifying it.
    const now = new Date();
    const start = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = to ? new Date(to) : now;

    const statementPage = readPage(req.query);
    const [payments, rounds, user] = await Promise.all([
      prisma.payment.findMany({
        where: { payerId: req.auth!.userId, OR: [{ paidAt: { gte: start, lte: end } }, { paidAt: null, round: { dueDate: { gte: start, lte: end } } }] },
        include: { round: { select: { roundNumber: true, dueDate: true, committee: { select: { id: true, name: true } } } } },
        orderBy: [{ paidAt: 'desc' }, { id: 'desc' }],   // id breaks ties, so a cursor is sound
        // Was a flat 300 with no cursor, so a member with a longer history
        // could not reach the older rows of their own statement.
        take: statementPage.take, ...statementPage.cursorArgs,
      }),
      prisma.round.findMany({
        where: { recipientId: req.auth!.userId, payoutDate: { gte: start, lte: end } },
        select: { id: true, roundNumber: true, payoutPaisa: true, payoutDate: true, status: true, committee: { select: { id: true, name: true } } },
        orderBy: [{ payoutDate: 'desc' }, { id: 'desc' }],
        take: statementPage.take,   // was unbounded
      }),
      prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { fullName: true, username: true, phone: true } }),
    ]);

    const paidIn = payments.filter(p => p.status === 'PAID')
      .reduce((sum, p) => sum + p.amountPaisa, 0n);
    const penalties = payments.reduce((sum, p) => sum + p.penaltyPaisa, 0n);
    const collected = rounds.reduce((sum, r) => sum + r.payoutPaisa, 0n);
    const stillDue = payments.filter(p => p.status !== 'PAID')
      .reduce((sum, p) => sum + p.amountPaisa, 0n);

    res.json({
      member: user,
      from: start.toISOString(),
      to: end.toISOString(),
      totals: {
        paidInPaisa: paidIn.toString(),
        collectedPaisa: collected.toString(),
        penaltiesPaisa: penalties.toString(),
        stillDuePaisa: stillDue.toString(),
        netPaisa: (collected - paidIn).toString(),
        instalments: payments.filter(p => p.status === 'PAID').length,
        payouts: rounds.length,
        onTimeRate: payments.length
          ? Math.round(payments.filter(p => p.status === 'PAID').length / payments.length * 100)
          : null,
      },
      lines: [
        ...payments.map(p => ({
          id: p.id,
          at: (p.paidAt ?? p.round.dueDate).toISOString(),
          direction: 'OUT' as const,
          kind: 'INSTALMENT',
          status: p.status,
          amountPaisa: p.amountPaisa.toString(),
          penaltyPaisa: p.penaltyPaisa.toString(),
          rail: p.paidVia,
          reference: p.txnRef,
          committee: p.round.committee.name,
          committeeId: p.round.committee.id,
          turn: p.round.roundNumber,
        })),
        ...rounds.map(r => ({
          id: r.id,
          at: r.payoutDate.toISOString(),
          direction: 'IN' as const,
          kind: 'PAYOUT',
          status: r.status,
          amountPaisa: r.payoutPaisa.toString(),
          penaltyPaisa: '0',
          rail: null,
          reference: null,
          committee: r.committee.name,
          committeeId: r.committee.id,
          turn: r.roundNumber,
        })),
      ].sort((a, b) => b.at.localeCompare(a.at)),
    });
  } catch (error) { next(error); }
});

// ---- limits ----------------------------------------------------------------
router.get('/limits', async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId },
      select: {
        creditScore: true, kycLevel: true, committeesCompletedClean: true,
        earlyTurnVerifiedAt: true, incomeVerifiedAt: true, chequeSecuredAt: true,
        declaredIncomePaisa: true, cnic: true, isBanned: true,
      },
    });
    const [activeMemberships, hosted] = await Promise.all([
      prisma.committeeMember.count({ where: { userId: req.auth!.userId, status: 'ACTIVE' } }),
      prisma.committee.count({ where: { hostId: req.auth!.userId, status: { in: ['FORMING', 'ACTIVE'] } } }),
    ]);

    const verified = !!user.earlyTurnVerifiedAt;
    // One standing, read through the engine, so this screen and the join route
    // answer "which turns may I take" with the same rule and the same sentence.
    const standing = standingOf(user);
    const income = user.declaredIncomePaisa ?? 0n;
    // The affordability engine's own ceiling, so the number a member reads here
    // is the number that refuses them at the door.
    const monthlyCeiling = income * BigInt(CAPS.CASHFLOW_BPS) / 10_000n;

    res.json({
      level: user.kycLevel,
      levelName: user.kycLevel >= 2 ? 'Bank verified' : user.kycLevel >= 1 ? 'Identity on file' : 'Basic',
      limits: [
        {
          key: 'committees',
          label: 'Committees at once',
          used: activeMemberships,
          cap: user.incomeVerifiedAt ? CAPS.CONCURRENT_VERIFIED : 1,
          note: user.incomeVerifiedAt ? 'Your income is verified' : 'Verify your income to hold more than one',
        },
        {
          key: 'hosting',
          label: 'Circles you host',
          used: hosted,
          cap: verified ? 50 : 5,
          note: verified ? 'Verified host' : 'Five while your record is still building',
        },
        {
          key: 'monthly',
          label: 'Instalments a month',
          usedPaisa: null,
          capPaisa: monthlyCeiling.toString(),
          note: income > 0n
            ? 'A third of what you told us you earn'
            : 'Tell us your income and this is worked out for you',
        },
        {
          key: 'turns',
          // The seat matrix of 5 October 2026. The sentence is seatReason's, so
          // this card and the refusal the join route gives cannot disagree.
          label: 'Turns you may take',
          value: SEAT_LABEL[seatTier(standing)],
          note: seatReason(standing),
        },
      ],
      raise: [
        { key: 'cnic', done: !!user.cnic, label: 'Put your CNIC on file', gain: 'Unlocks hosting' },
        { key: 'income', done: !!user.incomeVerifiedAt, label: 'Verify your income', gain: 'Six committees instead of one, and 80% off the fee' },
        { key: 'cheque', done: !!user.chequeSecuredAt, label: 'Leave a guarantee cheque', gain: 'Takes the fee to almost nothing' },
        { key: 'clean', done: user.committeesCompletedClean >= REQUIRED_CLEAN_CIRCLES,
          label: `Finish ${REQUIRED_CLEAN_CIRCLES === 1 ? 'one circle' : `${REQUIRED_CLEAN_CIRCLES} circles`} cleanly`,
          gain: 'Opens every turn position' },
        { key: 'security', done: false, label: 'Pledge security that covers the pot',
          gain: 'Opens every turn position without a credit check' },
      ],
      band: band(user.creditScore),
    });
  } catch (error) { next(error); }
});

// ---- devices ---------------------------------------------------------------
router.get('/devices', async (req, res, next) => {
  try {
    // A refresh token family is a device: one sign-in, one family, renewed in
    // place. The security log tells us what that sign-in looked like.
    const [tokens, events] = await Promise.all([
      prisma.refreshToken.findMany({
        where: { userId: req.auth!.userId, revokedAt: null, expiresAt: { gt: new Date() } },
        select: { id: true, familyId: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
      prisma.securityEvent.findMany({
        where: { userId: req.auth!.userId, type: { in: ['LOGIN', 'REGISTER'] } },
        select: { ip: true, userAgent: true, createdAt: true, type: true },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    const describe = (ua?: string | null) => {
      if (!ua) return 'A device';
      if (/iPhone|iPad/i.test(ua)) return 'iPhone or iPad';
      if (/Android/i.test(ua)) return 'Android phone';
      if (/Windows/i.test(ua)) return 'Windows computer';
      if (/Mac OS/i.test(ua)) return 'Mac';
      return 'A device';
    };

    // A session and a sign-in are two independent lists, so pairing them by
    // position was a guess. The sign-in closest in time to the moment a token
    // family was created is the one that made it.
    const nearest = (at: Date) => events.reduce<typeof events[number] | null>((best, e) => {
      const d = Math.abs(e.createdAt.getTime() - at.getTime());
      if (d > 120_000) return best;                        // more than two minutes apart is not it
      if (!best) return e;
      return d < Math.abs(best.createdAt.getTime() - at.getTime()) ? e : best;
    }, null);

    res.json({
      sessions: tokens.map((t, i) => {
        const e = nearest(t.createdAt);
        return {
          id: t.familyId,
          signedInAt: t.createdAt.toISOString(),
          device: describe(e?.userAgent),
          // Never the full address: it is the member's own location history.
          place: e?.ip ? e.ip.split('.').slice(0, 2).join('.') + '.x.x' : null,
          current: i === 0,
        };
      }),
      recent: events.slice(0, 10).map(e => ({
        at: e.createdAt.toISOString(),
        what: e.type === 'REGISTER' ? 'Account opened' : 'Signed in',
        device: describe(e.userAgent),
      })),
    });
  } catch (error) { next(error); }
});

/** Sign every other device out. The one asking keeps its own session. */
router.post('/devices/sign-out-others', async (req, res, next) => {
  try {
    const keep = await prisma.refreshToken.findFirst({
      where: { userId: req.auth!.userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }, select: { familyId: true },
    });
    // Both writes together: revoking the other sessions and recording that it
    // happened. A member who signs every other device out and later disputes it
    // needs the entry to exist, and it only exists if the revoke committed.
    const { count } = await prisma.$transaction(async tx => {
      const result = await tx.refreshToken.updateMany({
        where: {
          userId: req.auth!.userId, revokedAt: null,
          ...(keep ? { familyId: { not: keep.familyId } } : {}),
        },
        data: { revokedAt: new Date() },
      });
      await audit(tx, req.auth!.userId, 'SESSIONS_REVOKED', 'User', req.auth!.userId, { count: result.count });
      return result;
    });
    res.json({ signedOut: count });
  } catch (error) { next(error); }
});

export default router;
