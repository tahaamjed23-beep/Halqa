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

// Linked payment methods — the member's own wallet / Raast / bank identifiers,
// used to prefill checkout and to power the auto-debit mandate. Pointers only:
// no balances, no card numbers (cards belong on the licensed aggregator's
// hosted page, never here). Stored as a small JSON array on the user.
type LinkedMethod = { id: string; rail: string; accountNo: string; label: string; preferred: boolean };
const methodsOf = (raw: unknown): LinkedMethod[] => (Array.isArray(raw) ? raw as LinkedMethod[] : []);
const maskAccount = (value: string) => value.length <= 4 ? value : `${'•'.repeat(Math.max(0, value.length - 4))}${value.slice(-4)}`;
const publicMethod = (m: LinkedMethod) => ({ ...m, accountNo: maskAccount(m.accountNo) });

router.get('/payment-methods', async (req, res) => {
  const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true } });
  res.json({ methods: methodsOf(u.paymentMethodsJson).map(publicMethod) });
});

router.post('/payment-methods', async (req, res, next) => {
  try {
    const input = z.object({
      rail: z.enum(['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER']),
      accountNo: z.string().trim().min(11, 'Enter the full account / wallet number').max(34),
      label: z.string().trim().max(40).optional(),
      preferred: z.boolean().optional(),
    }).parse(req.body);
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true } });
    const existing = methodsOf(u.paymentMethodsJson);
    if (existing.length >= 5) return res.status(409).json({ error: 'A maximum of five linked methods is allowed' });
    const method: LinkedMethod = {
      id: `pm_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
      rail: input.rail, accountNo: input.accountNo.replace(/\s+/g, ''),
      label: input.label || (input.rail === 'RAAST' ? 'Raast ID' : input.rail === 'BANK_TRANSFER' ? 'Bank account' : `${input.rail === 'JAZZCASH' ? 'JazzCash' : 'Easypaisa'} wallet`),
      preferred: input.preferred ?? existing.length === 0, // the first link becomes preferred automatically
    };
    const next_ = method.preferred ? existing.map(m => ({ ...m, preferred: false })) : existing;
    await prisma.user.update({ where: { id: req.auth!.userId }, data: { paymentMethodsJson: [...next_, method] } });
    await audit(prisma, req.auth!.userId, 'PAYMENT_METHOD_LINKED', 'User', req.auth!.userId, { rail: method.rail, label: method.label });
    res.status(201).json({ method: publicMethod(method) });
  } catch (error) { next(error); }
});

router.post('/payment-methods/:id/preferred', async (req, res, next) => {
  try {
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true } });
    const methods = methodsOf(u.paymentMethodsJson);
    if (!methods.some(m => m.id === req.params.id)) return res.status(404).json({ error: 'Linked method not found' });
    const updated = methods.map(m => ({ ...m, preferred: m.id === req.params.id }));
    await prisma.user.update({ where: { id: req.auth!.userId }, data: { paymentMethodsJson: updated } });
    res.json({ methods: updated.map(publicMethod) });
  } catch (error) { next(error); }
});

// Salary-linked account (Money Fellows model): the member designates one
// linked method as the account their salary lands in. Auto-collection from a
// salary account is the most certain collection there is, so it earns a
// disclosed 20% reduction on the early/slot fees at payout. Consent is clause
// 4 of the signed undertaking; the flag is togglable any time.
router.post('/payment-methods/:id/salary', async (req, res, next) => {
  try {
    const { enabled } = z.object({ enabled: z.boolean().default(true) }).parse(req.body ?? {});
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true } });
    const method = methodsOf(u.paymentMethodsJson).find(m => m.id === req.params.id);
    if (!method) return res.status(404).json({ error: 'Linked method not found' });
    const updated = await prisma.user.update({ where: { id: req.auth!.userId }, data: { salaryAccountLinked: enabled, salaryAccountRef: enabled ? method.id : null }, select: { salaryAccountLinked: true, salaryAccountRef: true } });
    await audit(prisma, req.auth!.userId, 'SALARY_ACCOUNT_SET', 'User', req.auth!.userId, { enabled, methodRail: method.rail });
    res.json(updated);
  } catch (error) { next(error); }
});

router.delete('/payment-methods/:id', async (req, res, next) => {
  try {
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true } });
    const methods = methodsOf(u.paymentMethodsJson);
    const target = methods.find(m => m.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'Linked method not found' });
    let remaining = methods.filter(m => m.id !== req.params.id);
    if (target.preferred && remaining.length) remaining = remaining.map((m, i) => ({ ...m, preferred: i === 0 }));
    const me = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { salaryAccountRef: true } });
    await prisma.user.update({ where: { id: req.auth!.userId }, data: { paymentMethodsJson: remaining, ...(me.salaryAccountRef === req.params.id ? { salaryAccountLinked: false, salaryAccountRef: null } : {}) } });
    await audit(prisma, req.auth!.userId, 'PAYMENT_METHOD_REMOVED', 'User', req.auth!.userId, { rail: target.rail });
    res.json({ methods: remaining.map(publicMethod) });
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
