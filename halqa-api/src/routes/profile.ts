import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { reputationFor } from '../lib/reputation';
import { issuePassport } from '../lib/passport';
import { audit } from '../lib/audit';

const router = Router();
router.use(requireAuth);
router.get('/credit', async (req, res) => res.json(await prisma.creditEvent.findMany({ where: { userId: req.auth!.userId }, orderBy: { scoredAt: 'desc' }, take: 50 })));

router.get('/reputation/:userId', async (req, res) => {
  const reputation = await reputationFor(req.params.userId);
  if (!reputation) return res.status(404).json({ error: 'User not found' });
  res.json(reputation);
});

// Member-consented export of their own verified history (Credit Passport).
// Issuing is an explicit act by the owner of the history — audited.
router.post('/passport', async (req, res, next) => {
  try {
    const issued = await issuePassport(req.auth!.userId);
    if (!issued) return res.status(404).json({ error: 'User not found' });
    await audit(prisma, req.auth!.userId, 'CREDIT_PASSPORT_ISSUED', 'User', req.auth!.userId, { generatedAt: issued.passport.generatedAt, expiresAt: issued.passport.expiresAt });
    res.status(201).json(issued);
  } catch (error) { next(error); }
});
router.get('/summary', async (req, res) => {
  const userId = req.auth!.userId;
  const [payments, memberships, hosted, nextInstallment, nextPayout,profitLedger] = await Promise.all([
    prisma.payment.findMany({ where: { payerId: req.auth!.userId, status: 'PAID' } }),
    prisma.committeeMember.count({ where: { userId, status: 'ACTIVE' } }),
    prisma.committee.count({ where: { hostId: req.auth!.userId, status: { in: ['FORMING','ACTIVE'] } } }),
    prisma.payment.findFirst({ where: { payerId: userId, status: { in: ['PENDING','LATE'] }, round: { status: 'COLLECTING' } }, include: { round: { include: { committee: { select: { id: true, name: true } } } } }, orderBy: { dueDate: 'asc' } }),
    prisma.round.findFirst({ where: { recipientId: userId, status: { in: ['PENDING','COLLECTING','INVESTED'] }, committee: { mode: { not: 'INVESTMENT' } } }, include: { committee: { select: { id: true, name: true } } }, orderBy: { payoutDate: 'asc' } }),
    prisma.ledgerEntry.aggregate({where:{credit:`user:${userId}:external`,reason:'CAPITAL_DAYS_PROFIT_DISTRIBUTION'},_sum:{amountPaisa:true}}),
  ]);
  const totalInvestmentProfitPaisa = profitLedger._sum.amountPaisa ?? 0n;
  const totalRecordedPaisa = payments.reduce((sum, payment) => sum + payment.amountPaisa, 0n);
  res.json({
    balancePaisa: totalRecordedPaisa + totalInvestmentProfitPaisa,
    totalRecordedPaisa,
    totalInvestmentProfitPaisa,
    activeCommittees: memberships,
    hostedCommittees: hosted,
    nextInstallment: nextInstallment ? { dueAt: nextInstallment.dueDate, amountPaisa: nextInstallment.amountPaisa, committee: nextInstallment.round.committee } : null,
    nextPayout: nextPayout ? { payoutAt: nextPayout.payoutDate, amountPaisa: nextPayout.payoutPaisa, committee: nextPayout.committee, roundNumber: nextPayout.roundNumber } : null,
  });
});

// Data-sharing consent (Kazi pivot): the member opts in to receive relevant
// offers for their savings goals. Only consented members ever enter a partner
// lead feed. Off by default; togglable any time.
router.get('/consent', async (req, res) => {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { dataConsent: true } });
  res.json({ dataConsent: u.dataConsent });
});
router.patch('/consent', async (req, res, next) => {
  try {
    const { enabled } = z.object({ enabled: z.boolean() }).parse(req.body);
    const u = await prisma.user.update({ where: { id: req.auth!.userId }, data: { dataConsent: enabled }, select: { dataConsent: true } });
    await audit(prisma, req.auth!.userId, 'DATA_CONSENT_SET', 'User', req.auth!.userId, { enabled });
    res.json({ dataConsent: u.dataConsent });
  } catch (error) { next(error); }
});

// The intent-data revenue feed (Kazi pivot). Aggregated demand per savings goal
// so a partner (e.g. a Hajj operator) can size the market; the contactable
// lead list is returned ONLY for members who have opted in via /consent.
// This is the scaffold — commercial access will be partner-scoped and metered.
router.get('/leads/summary', async (req, res) => {
  const goals = await prisma.committee.groupBy({ by: ['goalType'], where: { goalType: { not: null }, status: { in: ['FORMING', 'ACTIVE'] } }, _count: { _all: true } });
  const consentedByGoal = await Promise.all(goals.map(async g => ({
    goal: g.goalType,
    circles: g._count._all,
    consentedMembers: await prisma.committeeMember.count({ where: { committee: { goalType: g.goalType }, status: 'ACTIVE', user: { dataConsent: true } } }),
  })));
  res.json({ goals: consentedByGoal });
});

export default router;
