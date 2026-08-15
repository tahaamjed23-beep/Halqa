import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { assertMember } from '../lib/guards';
import { audit } from '../lib/audit';
import {
  availableRungs, computeRestitution, tallyVote, RUNG_LABEL,
  VOTE, CONFIRMATION_WINDOW_HOURS, type ExitRung,
} from '../lib/exit-ladder';

// The exit ladder. There is no cancel button; there are five rungs and an
// arithmetic identity that makes a leaver whole without Halqa holding a pool.
// See lib/exit-ladder.ts for the reasoning behind every number here.
const router = Router();
router.use(requireAuth);

// The confirmation window opens when the host locks the roster at start.
const inWindow = (committee: { status: string; scheduleLockedAt: Date | null }) =>
  committee.status === 'FORMING' ||
  (committee.scheduleLockedAt !== null &&
    Date.now() - committee.scheduleLockedAt.getTime() < CONFIRMATION_WINDOW_HOURS * 3_600_000);

/** What this member may do right now, and what each option would cost them. */
router.get('/committee/:id/options', async (req, res, next) => {
  try {
    const committeeId = req.params.id;
    await assertMember(committeeId, req.auth!.userId);

    const committee = await prisma.committee.findUniqueOrThrow({
      where: { id: committeeId },
      include: {
        members: { where: { status: 'ACTIVE' } },
        rounds: { where: { status: 'CLOSED' }, select: { roundNumber: true, recipientId: true } },
      },
    });
    const me = committee.members.find(m => m.userId === req.auth!.userId);
    if (!me) return res.status(403).json({ error: 'Not an active member of this circle' });

    const paidCount = await prisma.payment.count({
      where: { payerId: req.auth!.userId, status: { in: ['PAID', 'LATE'] }, round: { committeeId } },
    });

    const rungs = availableRungs({
      inConfirmationWindow: inWindow(committee),
      hasCollected: me.hasReceived,
      substituteAvailable: false,   // set true once a verified replacement is attached
      hardshipFiled: false,
    });

    // Price every rung the member could take, so the choice is made with the
    // number in front of them rather than after the fact.
    const roundsAlreadyPaid = committee.rounds.map(r => r.roundNumber);
    const quotes = (['WINDOW', 'SUBSTITUTION', 'GROUP_VOTE', 'HARDSHIP'] as ExitRung[]).map(rung => {
      const q = computeRestitution({
        contributionPaisa: committee.contributionPaisa,
        installmentsPaid: paidCount,
        roundsAlreadyPaid,
        rung,
      });
      return {
        rung, label: RUNG_LABEL[rung], available: rungs.includes(rung),
        restitutionDuePaisa: q.totalDuePaisa.toString(),
        finePaisa: q.finePaisa.toString(),
        netToLeaverPaisa: q.netToLeaverPaisa.toString(),
        note: q.note,
      };
    });

    res.json({
      hasCollected: me.hasReceived,
      inConfirmationWindow: inWindow(committee),
      installmentsPaid: paidCount,
      available: rungs,
      quotes,
      vote: VOTE,
      // A member who already collected is not exiting; they hold the pot and
      // owe the remainder, which is the post-payout default path instead.
      blockedReason: me.hasReceived
        ? 'You have already received your pot. Leaving now is a default, not an exit, and is handled under recovery.'
        : null,
    });
  } catch (error) { next(error); }
});

const openSchema = z.object({
  rung: z.enum(['WINDOW', 'SUBSTITUTION', 'GROUP_VOTE', 'HARDSHIP']),
  reason: z.string().max(2_000).optional(),
  voiceNoteUrl: z.string().url().optional(),
  substituteUserId: z.string().optional(),
});

router.post('/committee/:id', async (req, res, next) => {
  try {
    const committeeId = req.params.id;
    const input = openSchema.parse(req.body);
    await assertMember(committeeId, req.auth!.userId);

    const committee = await prisma.committee.findUniqueOrThrow({
      where: { id: committeeId },
      include: {
        members: { where: { status: 'ACTIVE' } },
        rounds: { where: { status: 'CLOSED' }, select: { roundNumber: true } },
      },
    });
    const me = committee.members.find(m => m.userId === req.auth!.userId);
    if (!me) return res.status(403).json({ error: 'Not an active member of this circle' });
    if (me.hasReceived) {
      return res.status(409).json({ error: 'You have already collected. Leaving now is a default, not an exit.' });
    }

    const open = await prisma.exitRequest.findFirst({
      where: { committeeId, userId: req.auth!.userId, status: 'OPEN' },
    });
    if (open) return res.status(409).json({ error: 'You already have an open exit request on this circle' });

    const allowed = availableRungs({
      inConfirmationWindow: inWindow(committee),
      hasCollected: false,
      substituteAvailable: Boolean(input.substituteUserId),
      hardshipFiled: input.rung === 'HARDSHIP',
    });
    if (!allowed.includes(input.rung)) {
      return res.status(409).json({ error: `${RUNG_LABEL[input.rung]} is not available on this circle right now` });
    }

    const installmentsPaid = await prisma.payment.count({
      where: { payerId: req.auth!.userId, status: { in: ['PAID', 'LATE'] }, round: { committeeId } },
    });
    const restitution = computeRestitution({
      contributionPaisa: committee.contributionPaisa,
      installmentsPaid,
      roundsAlreadyPaid: committee.rounds.map(r => r.roundNumber),
      rung: input.rung,
    });

    // A window withdrawal and a substitution resolve immediately. Only a vote
    // has to wait, and only a vote can leave a member hanging — which is why
    // it escalates rather than expiring.
    const immediate = input.rung === 'WINDOW' || input.rung === 'SUBSTITUTION';

    const request = await prisma.$transaction(async tx => {
      const created = await tx.exitRequest.create({
        data: {
          committeeId, memberId: me.id, userId: req.auth!.userId,
          rung: input.rung,
          status: immediate ? 'APPROVED' : 'OPEN',
          reason: input.reason ?? null,
          voiceNoteUrl: input.voiceNoteUrl ?? null,
          substituteUserId: input.substituteUserId ?? null,
          installmentsPaid,
          restitutionDuePaisa: restitution.totalDuePaisa,
          finePaisa: restitution.finePaisa,
          fineToMembersPaisa: restitution.fineToMembersPaisa,
          fineToPlatformPaisa: restitution.fineToPlatformPaisa,
          closesAt: immediate ? null : new Date(Date.now() + VOTE.windowHours * 3_600_000),
          decidedAt: immediate ? new Date() : null,
        },
      });
      if (restitution.debts.length) {
        // Resolve each owing round to the member who actually received it, so
        // the debt is against a person rather than a round number.
        const rounds = await tx.round.findMany({
          where: { committeeId, roundNumber: { in: restitution.debts.map(d => d.roundNumber) } },
          select: { roundNumber: true, recipientId: true },
        });
        const byRound = new Map(rounds.map(r => [r.roundNumber, r.recipientId]));
        await tx.restitutionDebt.createMany({
          data: restitution.debts
            .filter(d => byRound.get(d.roundNumber))
            .map(d => ({
              requestId: created.id,
              debtorUserId: byRound.get(d.roundNumber)!,
              roundNumber: d.roundNumber,
              amountPaisa: d.amountPaisa,
            })),
        });
      }
      if (immediate) {
        await tx.committeeMember.update({ where: { id: me.id }, data: { status: 'EXITED', exitedAt: new Date() } });
      }
      return created;
    });

    await audit(prisma, req.auth!.userId, 'EXIT_REQUESTED', 'ExitRequest', request.id, { committeeId, rung: input.rung, immediate });
    res.status(201).json({ request, restitution: { ...restitution, totalDuePaisa: restitution.totalDuePaisa.toString(), debts: restitution.debts.map(d => ({ ...d, amountPaisa: d.amountPaisa.toString() })) } });
  } catch (error) { next(error); }
});

const voteSchema = z.object({ approve: z.boolean() });

router.post('/:requestId/vote', async (req, res, next) => {
  try {
    const { approve } = voteSchema.parse(req.body);
    const request = await prisma.exitRequest.findUniqueOrThrow({
      where: { id: req.params.requestId },
      include: { committee: { include: { members: { where: { status: 'ACTIVE' } } } } },
    });
    if (request.status !== 'OPEN') return res.status(409).json({ error: 'This request is already decided' });
    if (request.userId === req.auth!.userId) return res.status(403).json({ error: 'You cannot vote on your own exit' });
    await assertMember(request.committeeId, req.auth!.userId);

    await prisma.exitVote.upsert({
      where: { requestId_userId: { requestId: request.id, userId: req.auth!.userId } },
      create: { requestId: request.id, userId: req.auth!.userId, approve },
      update: { approve },
    });

    const votes = await prisma.exitVote.findMany({ where: { requestId: request.id } });
    const votesFor = votes.filter(v => v.approve).length;
    const votesAgainst = votes.length - votesFor;
    // Everybody active except the requester may vote. The host votes as one
    // member and has no veto: rebuilding organiser power is the fraud topology
    // this product exists to avoid.
    const eligibleVoters = request.committee.members.filter(m => m.userId !== request.userId).length;
    const outcome = tallyVote({ eligibleVoters, votesFor, votesAgainst });

    const closed = request.closesAt !== null && request.closesAt.getTime() <= Date.now();
    let status: 'OPEN' | 'APPROVED' | 'DECLINED' | 'ESCALATED' = request.status as 'OPEN';
    if (outcome.quorumMet) status = outcome.approved ? 'APPROVED' : 'DECLINED';
    else if (closed) status = 'ESCALATED';   // never traps the member

    const updated = await prisma.$transaction(async tx => {
      const row = await tx.exitRequest.update({
        where: { id: request.id },
        data: {
          votesFor, votesAgainst, quorumMet: outcome.quorumMet, status,
          decidedAt: status === 'OPEN' ? null : new Date(),
        },
      });
      if (status === 'APPROVED') {
        await tx.committeeMember.update({ where: { id: request.memberId }, data: { status: 'EXITED', exitedAt: new Date() } });
      }
      return row;
    });

    await audit(prisma, req.auth!.userId, 'EXIT_VOTED', 'ExitRequest', request.id, { approve, status });
    res.json({ request: updated, outcome });
  } catch (error) { next(error); }
});

/** Settle the restitution debts at cycle close. Idempotent per debt row. */
router.post('/:requestId/settle', async (req, res, next) => {
  try {
    const request = await prisma.exitRequest.findUniqueOrThrow({
      where: { id: req.params.requestId },
      include: { debts: true, committee: true },
    });
    if (request.committee.hostId !== req.auth!.userId) {
      return res.status(403).json({ error: 'Only the host settles restitution at cycle close' });
    }
    if (request.status !== 'APPROVED') return res.status(409).json({ error: 'Only an approved exit can be settled' });

    const now = new Date();
    await prisma.$transaction([
      prisma.restitutionDebt.updateMany({
        where: { requestId: request.id, settledAt: null },
        data: { settledAt: now },
      }),
      prisma.exitRequest.update({ where: { id: request.id }, data: { status: 'SETTLED', settledAt: now } }),
    ]);
    await audit(prisma, req.auth!.userId, 'EXIT_SETTLED', 'ExitRequest', request.id, { debts: request.debts.length });
    res.json({ ok: true, settled: request.debts.length });
  } catch (error) { next(error); }
});

router.get('/committee/:id', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    const requests = await prisma.exitRequest.findMany({
      where: { committeeId: req.params.id },
      include: { debts: true, votes: true, user: { select: { id: true, fullName: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests.map(r => ({
      ...r,
      restitutionDuePaisa: r.restitutionDuePaisa.toString(),
      finePaisa: r.finePaisa.toString(),
      fineToMembersPaisa: r.fineToMembersPaisa.toString(),
      fineToPlatformPaisa: r.fineToPlatformPaisa.toString(),
      debts: r.debts.map(d => ({ ...d, amountPaisa: d.amountPaisa.toString() })),
    })));
  } catch (error) { next(error); }
});

export default router;
