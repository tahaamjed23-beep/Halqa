import { safeRouter } from '../lib/safe-router';
import { ID, idParam } from '../lib/params';
import { readPage, sendPage } from '../lib/page';
import { Router } from 'express';
import { createHash, randomInt } from 'node:crypto';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { reputationFor } from '../lib/reputation';
import { issuePassport } from '../lib/passport';
import { audit } from '../lib/audit';
import { queueWhatsApp } from '../lib/whatsapp';
import { INCOME_DISCOUNT_BPS, CHEQUE_DISCOUNT_BPS } from '../lib/discounts';
import { titleFetch, type Rail } from '../lib/payment-provider';
import { evaluateSalaryPattern } from '../lib/salary-pattern';

// safeRouter, not Router: a rejected promise in any handler below reaches the
// error handler instead of hanging the request (lib/safe-router.ts).
const router = safeRouter();
router.use(requireAuth);

// Income & employer verification → 80% discount on Halqa's service charges. In
// the sandbox the member submits their details and we confirm immediately;
// production verifies the income slip with the named employer before it applies.
router.post('/verify-income', async (req, res, next) => {
  try {
    const input = z.object({ employerName: z.string().trim().min(2).max(80) }).parse(req.body);
    await prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: req.auth!.userId }, data: { incomeVerifiedAt: new Date(), employerName: input.employerName } });
      await audit(tx, req.auth!.userId, 'INCOME_VERIFIED', 'User', req.auth!.userId, { employerName: input.employerName });
    });
    res.json({ incomeVerified: true, feeDiscountBps: INCOME_DISCOUNT_BPS });
  } catch (error) { next(error); }
});
// Guarantee cheque → 95% discount. A physical cheque unlocks the 489-F criminal
// route (the strongest deterrent), so a cheque-secured member is lowest-risk.
// The member flags a cheque is provided; production marks it secured only once
// an agent physically collects the cheque.
router.post('/secure-cheque', async (req, res, next) => {
  try {
    await prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: req.auth!.userId }, data: { chequeSecuredAt: new Date() } });
      await audit(tx, req.auth!.userId, 'CHEQUE_SECURED', 'User', req.auth!.userId, {});
    });
    res.json({ chequeSecured: true, feeDiscountBps: CHEQUE_DISCOUNT_BPS });
  } catch (error) { next(error); }
});
// Remove a verification (member changes their mind / cheque returned).
router.post('/clear-verification', async (req, res, next) => {
  try {
    const { kind } = z.object({ kind: z.enum(['income', 'cheque']) }).parse(req.body);
    // Clearing a verification raises the member's fee, so it is written down
    // with the clearing itself and in the same transaction as it.
    await prisma.$transaction([
      prisma.user.update({ where: { id: req.auth!.userId }, data: kind === 'income' ? { incomeVerifiedAt: null } : { chequeSecuredAt: null } }),
      prisma.auditLog.create({ data: {
        actorId: req.auth!.userId, action: 'VERIFICATION_CLEARED',
        entityType: 'User', entityId: req.auth!.userId, payloadJson: { kind },
      } }),
    ]);
    res.json({ cleared: kind });
  } catch (error) { next(error); }
});
router.get('/credit', async (req, res) => {
  // Was a fixed 50 with no cursor: a member could not see the event that moved
  // their score if fifty newer ones had landed since.
  const { take, cursorArgs } = readPage(req.query);
  const rows = await prisma.creditEvent.findMany({
    where: { userId: req.auth!.userId },
    orderBy: [{ scoredAt: 'desc' }, { id: 'desc' }],   // id breaks ties, so a cursor is sound
    take, ...cursorArgs,
  });
  sendPage(res, rows, take);
});

router.get('/reputation/:userId', async (req, res) => {
  z.object({ userId: ID }).parse(req.params);
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
    const u = await prisma.$transaction(async tx => {
      const u = await tx.user.update({ where: { id: req.auth!.userId }, data: { dataConsent: enabled }, select: { dataConsent: true } });
      await audit(tx, req.auth!.userId, 'DATA_CONSENT_SET', 'User', req.auth!.userId, { enabled });
      return u;
    });
    res.json({ dataConsent: u.dataConsent });
  } catch (error) { next(error); }
});

// Linked payment methods — the member's own wallet / Raast / bank identifiers,
// used to prefill checkout and to power the auto-debit mandate. Pointers only:
// no balances, no card numbers (cards belong on the licensed aggregator's
// hosted page, never here). Stored as a small JSON array on the user.
type LinkedMethod = { id: string; rail: string; accountNo: string; accountTitle?: string; bankName?: string; label: string; preferred: boolean; verified?: boolean; brand?: string; last4?: string; expiry?: string; addressLine?: string; city?: string; titleName?: string; titleMatch?: boolean };
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
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true, fullName: true } });
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
      // Title fetch — ownership verification at the moment of linking. The
      // registered holder name must belong to the member (CNIC name) before
      // this account can anchor auto-collection. Sandbox echoes; the live
      // aggregator API replaces the echo at Gate 2, and a live mismatch
      // refuses the link outright.
      const title = await titleFetch(input.rail as Rail, accountNo, u.fullName);
      if (title.title !== null && !title.matches) return res.status(400).json({ error: 'This account is not registered in your name. Auto-collection can only anchor to your own account.' });
      method = {
        id, rail: input.rail, accountNo, accountTitle: input.accountTitle, bankName: input.bankName,
        label: input.label || input.bankName || (input.rail === 'RAAST' ? 'Raast ID' : input.rail === 'BANK_TRANSFER' ? 'Bank account' : `${input.rail === 'JAZZCASH' ? 'JazzCash' : 'Easypaisa'} wallet`),
        preferred, titleName: title.title ?? undefined, titleMatch: title.matches || undefined,
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
    idParam.parse(req.params);
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true } });
    const methods = methodsOf(u.paymentMethodsJson);
    if (!methods.some(m => m.id === req.params.id)) return res.status(404).json({ error: 'Linked method not found' });
    const updated = methods.map(m => ({ ...m, preferred: m.id === req.params.id }));
    // Which rail money is pulled from is exactly the kind of change a member
    // later says they did not make, so both writes go together.
    await prisma.$transaction([
      prisma.user.update({ where: { id: req.auth!.userId }, data: { paymentMethodsJson: updated } }),
      prisma.auditLog.create({ data: {
        actorId: req.auth!.userId, action: 'PAYMENT_METHOD_PREFERRED',
        entityType: 'User', entityId: req.auth!.userId, payloadJson: { methodId: req.params.id },
      } }),
    ]);
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
    // Sandbox verifies the claim immediately (the verify-income posture) so the
    // full discount loop is exercisable; production earns verification from
    // evidence only — payslip, pattern or alerts (lib/salary-pattern.ts).
    const sandboxVerify = enabled && process.env.NODE_ENV !== 'production';
    const updated = await prisma.$transaction(async tx => {
      const updated = await tx.user.update({ where: { id: req.auth!.userId }, data: {
        salaryAccountLinked: enabled, salaryAccountRef: enabled ? method.id : null,
        ...(sandboxVerify ? { salaryVerifiedAt: new Date(), salaryVerifyMethod: 'SANDBOX' } : {}),
        ...(!enabled ? { salaryVerifiedAt: null, salaryVerifyMethod: null } : {}),
      }, select: { salaryAccountLinked: true, salaryAccountRef: true, salaryVerifiedAt: true, salaryVerifyMethod: true } });
      await audit(tx, req.auth!.userId, 'SALARY_ACCOUNT_SET', 'User', req.auth!.userId, { enabled, methodRail: method.rail });
      return updated;
    });
    res.json(updated);
  } catch (error) { next(error); }
});

router.delete('/payment-methods/:id', async (req, res, next) => {
  try {
    idParam.parse(req.params);
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { paymentMethodsJson: true } });
    const methods = methodsOf(u.paymentMethodsJson);
    const target = methods.find(m => m.id === req.params.id);
    if (!target) return res.status(404).json({ error: 'Linked method not found' });
    const me = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { salaryAccountRef: true } });
    // The salary anchor is replace-only, never delete (chairman's directive):
    // auto-collection's certainty rests on it. Mark another account as salary
    // first, then this one releases.
    if (me.salaryAccountRef === req.params.id) return res.status(409).json({ error: 'This is your salary account — collections anchor to it. Mark another account as your salary account first, then remove this one.' });
    let remaining = methods.filter(m => m.id !== req.params.id);
    if (target.preferred && remaining.length) remaining = remaining.map((m, i) => ({ ...m, preferred: i === 0 }));
    await prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: req.auth!.userId }, data: { paymentMethodsJson: remaining, ...(me.salaryAccountRef === req.params.id ? { salaryAccountLinked: false, salaryAccountRef: null } : {}) } });
      await audit(tx, req.auth!.userId, 'PAYMENT_METHOD_REMOVED', 'User', req.auth!.userId, { rail: target.rail });
    });
    res.json({ methods: remaining.map(publicMethod) });
  } catch (error) { next(error); }
});

// ---- Salary-day verification (2026-07-31) -------------------------------
// The payday is the collection event (auto-debit pulls on it, ahead of the due
// date), so the declared day is verified against evidence: our own collection
// pattern, opt-in credit alerts, or one payslip photo. lib/salary-pattern.ts
// holds the rules and the misdeclaration consequence.

// Declare (or clear) the salary day. 1–31; null = varies / not declared.
router.post('/salary-day', async (req, res, next) => {
  try {
    const { day } = z.object({ day: z.number().int().min(1).max(31).nullable() }).parse(req.body);
    await prisma.$transaction(async tx => {
      await tx.user.update({ where: { id: req.auth!.userId }, data: { salaryDay: day, ...(day === null ? {} : {}) } });
      await audit(tx, req.auth!.userId, 'SALARY_DAY_SET', 'User', req.auth!.userId, { day });
    });
    const evaluation = await evaluateSalaryPattern(req.auth!.userId);
    res.json({ salaryDay: day, evaluation });
  } catch (error) { next(error); }
});

// Current verification state, for the Settings chip.
router.get('/salary-status', async (req, res, next) => {
  try {
    const u = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { salaryDay: true, salaryDayLearned: true, salaryVerifiedAt: true, salaryVerifyMethod: true, salaryAccountLinked: true } });
    const payslip = await prisma.payslipUpload.findFirst({ where: { userId: req.auth!.userId }, orderBy: { uploadedAt: 'desc' }, select: { status: true, uploadedAt: true } });
    res.json({ ...u, payslip });
  } catch (error) { next(error); }
});

// One payslip, one photo — client downscales to a small JPEG so nobody is
// asked to fight an upload form. Sandbox accepts immediately (the same
// posture as verify-income); production holds PENDING for review.
router.post('/payslip', async (req, res, next) => {
  try {
    const { imageBase64 } = z.object({ imageBase64: z.string().min(64).max(1_400_000) }).parse(req.body);
    const match = imageBase64.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
    if (!match) return res.status(400).json({ error: 'Send the payslip as a single photo (JPEG or PNG)' });
    const bytes = Buffer.from(match[2], 'base64');
    if (bytes.length > 900_000) return res.status(413).json({ error: 'Photo too large — retake it or use the in-app camera' });
    const sha256 = createHash('sha256').update(bytes).digest('hex');
    const sandbox = process.env.NODE_ENV !== 'production';
    const upload = await prisma.$transaction(async tx => {
      const row = await tx.payslipUpload.create({ data: { userId: req.auth!.userId, image: bytes, mime: match[1], sha256, sizeBytes: bytes.length, status: sandbox ? 'ACCEPTED' : 'PENDING', reviewedAt: sandbox ? new Date() : null } });
      if (sandbox) await tx.user.update({ where: { id: req.auth!.userId }, data: { salaryVerifiedAt: new Date(), salaryVerifyMethod: 'PAYSLIP' } });
      await audit(tx, req.auth!.userId, 'PAYSLIP_UPLOADED', 'PayslipUpload', row.id, { sha256, sizeBytes: bytes.length, status: row.status });
      return row;
    });
    res.status(201).json({ status: upload.status, uploadedAt: upload.uploadedAt });
  } catch (error) { next(error); }
});

// Opt-in credit-alert summaries from the device's notification listener.
// Aggregates only — a coarse amount band, a day, a source class, a month.
// Raw alert text never leaves the phone; two consistent months verify.
router.post('/salary-signals', async (req, res, next) => {
  try {
    const { events } = z.object({ events: z.array(z.object({
      dayOfMonth: z.number().int().min(1).max(31),
      amountBand: z.string().trim().min(2).max(20),
      sourceClass: z.enum(['BANK', 'WALLET']),
      observedMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
    })).min(1).max(6) }).parse(req.body);
    for (const e of events) {
      await prisma.salarySignal.upsert({
        where: { userId_observedMonth_sourceClass: { userId: req.auth!.userId, observedMonth: e.observedMonth, sourceClass: e.sourceClass } },
        create: { userId: req.auth!.userId, ...e },
        update: { dayOfMonth: e.dayOfMonth, amountBand: e.amountBand },
      });
    }
    await audit(prisma, req.auth!.userId, 'SALARY_SIGNALS_RECORDED', 'User', req.auth!.userId, {
      count: events.length, months: events.map(e => e.observedMonth),
    });
    const evaluation = await evaluateSalaryPattern(req.auth!.userId);
    res.status(201).json({ recorded: events.length, evaluation });
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

// --- Personalisation ------------------------------------------------------
// A committee is a personal arrangement between people who mostly know each
// other; an application that looks like a bank statement gets opened once.
// None of this touches verification: displayName is what other members see,
// fullName remains the legal name matched against the CNIC.
const ACCENTS = ['lime', 'pine', 'sand', 'clay', 'indigo', 'plum'] as const;

const appearanceSchema = z.object({
  displayName: z.string().trim().min(2).max(40).nullable().optional(),
  avatarUrl: z.string().max(300_000).nullable().optional(),   // data URI or hosted URL
  accentColor: z.enum(ACCENTS).optional(),
  themePref: z.enum(['system', 'light', 'dark']).optional(),
  langPref: z.enum(['en', 'ur']).optional(),
  textScale: z.number().int().min(90).max(140).optional(),
  highContrast: z.boolean().optional(),
  notifyPrefs: z.object({
    push: z.boolean().optional(),
    whatsapp: z.boolean().optional(),
    email: z.boolean().optional(),
    // A reminder that arrives at two in the morning is not a reminder, it is a
    // reason to turn notifications off entirely. Quiet hours are 0-23 local.
    quietFrom: z.number().int().min(0).max(23).optional(),
    quietTo: z.number().int().min(0).max(23).optional(),
  }).optional(),
});

router.get('/appearance', requireAuth, async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId },
      select: {
        displayName: true, avatarUrl: true, accentColor: true, themePref: true,
        langPref: true, textScale: true, highContrast: true, notifyPrefsJson: true,
      },
    });
    res.json({ ...user, accents: ACCENTS });
  } catch (error) { next(error); }
});

router.patch('/appearance', requireAuth, async (req, res, next) => {
  try {
    const input = appearanceSchema.parse(req.body);
    const { notifyPrefs, ...rest } = input;
    const user = await prisma.$transaction(async tx => {
      const user = await tx.user.update({
        where: { id: req.auth!.userId },
        data: {
          ...rest,
          ...(notifyPrefs ? { notifyPrefsJson: notifyPrefs } : {}),
        },
        select: {
          displayName: true, avatarUrl: true, accentColor: true, themePref: true,
          langPref: true, textScale: true, highContrast: true, notifyPrefsJson: true,
        },
      });
      await audit(tx, req.auth!.userId, 'APPEARANCE_UPDATED', 'User', req.auth!.userId, { keys: Object.keys(input) });
      return user;
    });
    res.json(user);
  } catch (error) { next(error); }
});

// --- Collection order -----------------------------------------------------
// The member knows which of their accounts has money in it on which day; the
// platform does not. So they set the order the rails are tried in, and the
// first one that clears wins. One account is marked as the salary account,
// because collecting on payday from the account the salary lands in is the
// most certain collection there is.
const orderSchema = z.object({
  order: z.array(z.string()).min(1),          // method ids, most-preferred first
  salaryMethodId: z.string().nullable().optional(),
});

router.patch('/payment-methods/order', requireAuth, async (req, res, next) => {
  try {
    const input = orderSchema.parse(req.body);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: req.auth!.userId }, select: { paymentMethodsJson: true },
    });
    const methods = (Array.isArray(user.paymentMethodsJson) ? user.paymentMethodsJson : []) as LinkedMethod[];

    // Rank by the submitted order; anything not named keeps its relative place
    // at the end, so a stale client cannot silently drop a method.
    const rank = new Map(input.order.map((id, i) => [id, i]));
    const next = [...methods]
      .sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999))
      .map((m, i) => ({ ...m, order: i, preferred: i === 0 }));

    const salaryMethod = input.salaryMethodId ? next.find(m => m.id === input.salaryMethodId) : undefined;

    await prisma.$transaction(async tx => {
      await tx.user.update({
        where: { id: req.auth!.userId },
        data: {
          paymentMethodsJson: next as unknown as Prisma.InputJsonValue,
          ...(input.salaryMethodId !== undefined ? {
            salaryAccountLinked: Boolean(salaryMethod),
            salaryAccountRef: salaryMethod?.id ?? null,
          } : {}),
        },
      });
      await audit(tx, req.auth!.userId, 'COLLECTION_ORDER_SET', 'User', req.auth!.userId,
        { order: next.map(m => m.id), salaryMethodId: input.salaryMethodId ?? null });
    });
    res.json({ methods: next, salaryMethodId: salaryMethod?.id ?? null });
  } catch (error) { next(error); }
});

export default router;
