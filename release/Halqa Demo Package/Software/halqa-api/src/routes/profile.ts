import { Router } from 'express';
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
export default router;
