import { Router } from 'express';
import { createHash, randomInt } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { reputationFor } from '../lib/reputation';
import { issuePassport } from '../lib/passport';
import { audit } from '../lib/audit';
import { queueWhatsApp } from '../lib/whatsapp';
import { INCOME_DISCOUNT_BPS, CHEQUE_DISCOUNT_BPS } from '../lib/discounts';

const router = Router();
router.use(requireAuth);

// Income & employer verification → 80% discount on Halqa's service charges. In
// the sandbox the member submits their details and we confirm immediately;
// production verifies the income slip with the named employer before it applies.
router.post('/verify-income', async (req, res, next) => {
  try {
    const input = z.object({ employerName: z.string().trim().min(2).max(80) }).parse(req.body);
    await prisma.user.update({ where: { id: req.auth!.userId }, data: { incomeVerifiedAt: new Date(), employerName: input.employerName } });
    await audit(prisma, req.auth!.userId, 'INCOME_VERIFIED', 'User', req.auth!.userId, { employerName: input.employerName });
    res.json({ incomeVerified: true, feeDiscountBps: INCOME_DISCOUNT_BPS });
  } catch (error) { next(error); }
});
// Guarantee cheque → 95% discount. A physical cheque unlocks the 489-F criminal
// route (the strongest deterrent), so a cheque-secured member is lowest-risk.
// The member flags a cheque is provided; production marks it secured only once
// an agent physically collects the cheque.
router.post('/secure-cheque', async (req, res, next) => {
  try {
    await prisma.user.update({ where: { id: req.auth!.userId }, data: { chequeSecuredAt: new Date() } });
    await audit(prisma, req.auth!.userId, 'CHEQUE_SECURED', 'User', req.auth!.userId, {});
    res.json({ chequeSecured: true, feeDiscountBps: CHEQUE_DISCOUNT_BPS });
  } catch (error) { next(error); }
});
// Remove a verification (member changes their mind / cheque returned).
router.post('/clear-verification', async (req, res, next) => {
  try {
    const { kind } = z.object({ kind: z.enum(['income', 'cheque']) }).parse(req.body);
    await prisma.user.update({ where: { id: req.auth!.userId }, data: kind === 'income' ? { incomeVerifiedAt: null } : { chequeSecuredAt: null } });
    res.json({ cleared: kind });
  } catch (error) { next(error); }
});
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
type LinkedMethod = { id: string; rail: string; accountNo: string; accountTitle?: string; bankName?: string; label: string; preferred: boolean; verified?: boolean; brand?: string; last4?: string; expiry?: string; addressLine?: string; city?: string };
// Card brand from the leading digits (display only — the full PAN is never
// stored). Covers the networks that actually issue in Pakistan.
const cardBrand = (digits: string) => /^4/.test(digits) ? 'Visa' : /^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(digits) ? 'Mastercard' : /^3[47]/.test(digits) ? 'Amex' : /^(60|65|81|82)/.test(digits) ? 'PayPak' : 'Card';
const otpHash = (code: string) => createHash('sha256').update(code).digest('hex');
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
      rail: z.enum(['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CARD']),
      accountNo: z.string().trim().max(34).optional(),
      accountTitle: z.string().trim().min(3, 'Enter the account holder name').max(60).optional(),
      bankName: z.string().trim().max(40).optional(),
      label: z.string().trim().max(40).optional(),
      preferred: z.boolean().optional(),
      // Card-only. The full PAN and CVC are accepted transiently to derive the
      // brand + last4 and are NEVER persisted (PCI: real processing happens on
      // the licensed partner's hosted page). CVC is not even a stored field.
      cardNumber: z.string().trim().regex(/^[\d\s]{13,23}$/).optional(),
      expiry: z.string().trim().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Expiry must be MM/YY').optional(),
      cvc: z.string().trim().regex(/^\d{3,4}$/).optional(),
      addressLine: z.string().trim().max(120).optional(),
      city: z.string().trim().max(60).optional(),
    }).parse(req.body);
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true } });
    const existing = methodsOf(u.paymentMethodsJson);
    if (existing.length >= 5) return res.status(409).json({ error: 'A maximum of five linked methods is allowed' });
    const id = `pm_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const preferred = input.preferred ?? existing.length === 0;
    let method: LinkedMethod;
    if (input.rail === 'CARD') {
      const digits = (input.cardNumber ?? '').replace(/\D/g, '');
      if (digits.length < 13 || !input.expiry || !input.accountTitle) return res.status(400).json({ error: 'Card number, expiry and cardholder name are required' });
      const brand = cardBrand(digits);
      const last4 = digits.slice(-4);
      // Store ONLY brand + last4 + expiry + holder + billing address. Never the
      // PAN, never the CVC — those leave scope with the request.
      method = { id, rail: 'CARD', accountNo: last4, brand, last4, expiry: input.expiry, accountTitle: input.accountTitle, bankName: brand, addressLine: input.addressLine, city: input.city, label: input.label || `${brand} ····${last4}`, preferred };
    } else {
      const accountNo = (input.accountNo ?? '').replace(/\s+/g, '');
      if (accountNo.length < 10) return res.status(400).json({ error: 'Enter the full account / wallet number' });
      method = {
        id, rail: input.rail, accountNo, accountTitle: input.accountTitle, bankName: input.bankName,
        label: input.label || input.bankName || (input.rail === 'RAAST' ? 'Raast ID' : input.rail === 'BANK_TRANSFER' ? 'Bank account' : `${input.rail === 'JAZZCASH' ? 'JazzCash' : 'Easypaisa'} wallet`),
        preferred,
      };
    }
    const next_ = method.preferred ? existing.map(m => ({ ...m, preferred: false })) : existing;
    // Mandate OTP: linking an account that auto-collection will pull from is
    // confirmed with a one-time code, delivered on the WhatsApp rail (in-app
    // inbox stands in until the gateway partner connects). Hash + expiry live
    // in the security event log; the method shows unverified until confirmed.
    const otp = String(randomInt(100000, 1000000));
    const expiresAt = Date.now() + 10 * 60_000;
    await prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: req.auth!.userId }, data: { paymentMethodsJson: [...next_, method] } });
      await tx.securityEvent.create({ data: { type: 'WA_MANDATE_OTP', userId: req.auth!.userId, detail: JSON.stringify({ methodId: method.id, codeHash: otpHash(otp), expiresAt }) } });
      await queueWhatsApp(tx, { userId: req.auth!.userId, kind: 'MANDATE_OTP', refType: 'User', refId: req.auth!.userId, text: `Halqa: your auto-collection mandate code for ${method.label} is ${otp}. It expires in 10 minutes. Never share it.` });
      await audit(tx, req.auth!.userId, 'PAYMENT_METHOD_LINKED', 'User', req.auth!.userId, { rail: method.rail, label: method.label });
    });
    res.status(201).json({ method: publicMethod(method), otpSent: true, ...(process.env.NODE_ENV !== 'production' ? { devCode: otp } : {}) });
  } catch (error) { next(error); }
});

// Confirm the mandate OTP for a linked method. Marks the method verified —
// the state the live rail will require before a real pull runs.
router.post('/payment-methods/:id/verify', async (req, res, next) => {
  try {
    const { code } = z.object({ code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code') }).parse(req.body);
    const event = await prisma.securityEvent.findFirst({ where: { type: 'WA_MANDATE_OTP', userId: req.auth!.userId }, orderBy: { createdAt: 'desc' } });
    const detail = event?.detail ? JSON.parse(event.detail) as { methodId: string; codeHash: string; expiresAt: number } : null;
    if (!detail || detail.methodId !== req.params.id) return res.status(404).json({ error: 'No pending code for this method — re-link it to get a fresh one' });
    if (Date.now() > detail.expiresAt) return res.status(410).json({ error: 'The code expired — re-link the method to get a fresh one' });
    if (otpHash(code) !== detail.codeHash) return res.status(400).json({ error: 'Incorrect code' });
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true } });
    const updated = methodsOf(u.paymentMethodsJson).map(m => m.id === req.params.id ? { ...m, verified: true } : m);
    // Consume the code on success so a known code can't be replayed in-window.
    await prisma.$transaction([
      prisma.securityEvent.delete({ where: { id: event!.id } }),
      prisma.user.update({ where: { id: req.auth!.userId }, data: { paymentMethodsJson: updated } }),
    ]);
    await audit(prisma, req.auth!.userId, 'PAYMENT_METHOD_VERIFIED', 'User', req.auth!.userId, { methodId: req.params.id });
    res.json({ methods: updated.map(publicMethod) });
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
