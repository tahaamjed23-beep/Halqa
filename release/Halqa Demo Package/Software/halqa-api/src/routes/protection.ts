import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { assertHost, assertMember } from '../lib/guards';
import { audit, ledger } from '../lib/audit';
import { evaluateDelinquencies } from '../services/delinquency';

const router = Router();
router.use(requireAuth);

// Dev/test-only trigger for the hourly delinquency pass (reminders, vault
// auto-cover, penalties, escalation). In production the scheduler owns this.
router.post('/delinquency/run', async (_req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'The delinquency pass is scheduler-only in production' });
    res.json(await evaluateDelinquencies());
  } catch (error) { next(error); }
});

const policyOf = (value: unknown) => (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;

router.get('/committee/:id', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    const committee = await prisma.committee.findUniqueOrThrow({
      where: { id: req.params.id },
      include: {
        members: { where: { status: { in: ['ACTIVE', 'BANNED'] } }, include: { user: { select: { id: true, fullName: true, creditScore: true, defaultFlag: true, cooldownUntil: true } }, securityDeposits: true, protectionCommitment: { include: { guarantor: { select: { id: true, fullName: true, creditScore: true } } } }, payoutHoldbacks: true } },
        rounds: { include: { payments: true }, orderBy: { roundNumber: 'asc' } },
        recoveryCases: { where: { status: 'OPEN' } },
      },
    });
    const now = Date.now();
    const activeRound = committee.rounds.find(round => round.status === 'COLLECTING' || round.status === 'INVESTED');
    const matrix = committee.members.map(member => {
      const payment = activeRound?.payments.find(item => item.payerId === member.userId);
      const remainingDues = committee.contributionPaisa * BigInt(Math.max(0, committee.memberCap - committee.currentRound));
      const heldDeposit = member.securityDeposits.filter(item => item.status === 'HELD').reduce((sum, item) => sum + item.amountPaisa + item.accruedYieldPaisa, 0n);
      const heldPayout = member.payoutHoldbacks.filter(item => item.status === 'HELD').reduce((sum, item) => sum + item.amountPaisa, 0n);
      return {
        membershipId: member.id, user: member.user, turnPosition: member.turnPosition, hasReceived: member.hasReceived, status: member.status,
        currentPayment: payment ? { id: payment.id, status: payment.status, dueDate: payment.dueDate, penaltyPaisa: payment.penaltyPaisa } : null,
        daysToDeadline: payment ? Math.ceil((payment.dueDate.getTime() - now) / 86_400_000) : null,
        remainingDuesPaisa: remainingDues, heldDepositPaisa: heldDeposit, heldPayoutPaisa: heldPayout,
        commitment: member.protectionCommitment,
        defaultImpactPaisa: remainingDues + heldDeposit + heldPayout,
      };
    });
    res.json({
      committeeId: committee.id, policy: policyOf(committee.riskPolicyJson), payoutBufferBps: committee.payoutBufferBps,
      latePenaltyBps: committee.latePenaltyBps, activeRound: activeRound ? { id: activeRound.id, roundNumber: activeRound.roundNumber, dueDate: activeRound.dueDate, payoutDate: activeRound.payoutDate } : null,
      openRecoveryCases: committee.recoveryCases.length, matrix,
      partnerGates: [
        { key: 'AUTO_DEBIT', label: 'Raast/JazzCash auto-debit', status: 'PARTNER_REQUIRED' },
        { key: 'CREDIT_BUREAU', label: 'Licensed credit-bureau reporting', status: 'LEGAL_AND_PARTNER_REQUIRED' },
        { key: 'DEFAULT_INSURANCE', label: 'Licensed default insurance', status: 'INSURER_REQUIRED' },
        { key: 'PAYROLL', label: 'Employer payroll deduction', status: 'EMPLOYER_REQUIRED' },
      ],
    });
  } catch (error) { next(error); }
});

router.put('/committee/:id/commitment', async (req, res, next) => {
  try {
    const membership = await assertMember(req.params.id, req.auth!.userId);
    const input = z.object({
      guarantorUsername: z.string().trim().min(2).max(40).optional(),
      promissoryRef: z.string().trim().min(4).max(120).optional(),
      autoDebitRef: z.string().trim().min(4).max(120).optional(),
      acceptedTerms: z.literal(true),
    }).parse(req.body);
    let guarantorUserId: string | undefined;
    if (input.guarantorUsername) {
      const guarantor = await prisma.user.findUnique({ where: { username: input.guarantorUsername.toLowerCase() } });
      if (!guarantor || guarantor.isBanned || guarantor.creditScore < 700 || guarantor.id === req.auth!.userId) return res.status(400).json({ error: 'Guarantor must be another unrestricted Halqa user with score 700+' });
      guarantorUserId = guarantor.id;
    }
    const row = await prisma.protectionCommitment.upsert({
      where: { membershipId: membership.id },
      update: { guarantorUserId, promissoryRef: input.promissoryRef, autoDebitRef: input.autoDebitRef, acceptedTermsAt: new Date() },
      create: { membershipId: membership.id, guarantorUserId, promissoryRef: input.promissoryRef, autoDebitRef: input.autoDebitRef, acceptedTermsAt: new Date() },
    });
    await audit(prisma, req.auth!.userId, 'PROTECTION_COMMITMENT_RECORDED', 'CommitteeMember', membership.id, { hasGuarantor: Boolean(guarantorUserId), hasPromissoryRef: Boolean(input.promissoryRef), hasAutoDebitRef: Boolean(input.autoDebitRef), stage: 'RECORD_ONLY' });
    res.json(row);
  } catch (error) { next(error); }
});

router.post('/committee/:id/commitment/:membershipId/verify', async (req, res, next) => {
  try {
    await assertHost(req.params.id, req.auth!.userId);
    const commitment = await prisma.protectionCommitment.findFirst({ where: { membershipId: req.params.membershipId, membership: { committeeId: req.params.id } } });
    if (!commitment) return res.status(404).json({ error: 'Protection commitment not found' });
    const row = await prisma.protectionCommitment.update({ where: { id: commitment.id }, data: { verifiedByHostAt: new Date() } });
    await audit(prisma, req.auth!.userId, 'PROTECTION_COMMITMENT_VERIFIED', 'ProtectionCommitment', row.id, { stage: 'RECORD_ONLY' });
    res.json(row);
  } catch (error) { next(error); }
});

router.post('/committee/:id/peer-nudge/:userId', async (req, res, next) => {
  try {
    await assertMember(req.params.id, req.auth!.userId);
    await assertMember(req.params.id, req.params.userId);
    if (req.params.userId === req.auth!.userId) return res.status(400).json({ error: 'You cannot nudge yourself' });
    const since = new Date(Date.now() - 24 * 60 * 60_000);
    const recent = await prisma.auditLog.count({ where: { actorId: req.auth!.userId, action: 'PEER_PAYMENT_NUDGE', entityId: req.params.userId, at: { gte: since } } });
    if (recent >= 2) return res.status(429).json({ error: 'Peer nudge limit reached for today' });
    const committee = await prisma.committee.findUniqueOrThrow({ where: { id: req.params.id }, select: { name: true } });
    await prisma.$transaction(async tx => {
      await tx.notification.create({ data: { userId: req.params.userId, type: 'PEER_PAYMENT_NUDGE', message: `A member of ${committee.name} sent a private contribution reminder. Clear the installment to protect your score, deposit and payout holdback.` } });
      await audit(tx, req.auth!.userId, 'PEER_PAYMENT_NUDGE', 'User', req.params.userId, { committeeId: req.params.id });
    });
    res.status(201).json({ message: 'Private reminder sent' });
  } catch (error) { next(error); }
});

router.get('/recovery/mine', async (req, res) => {
  res.json(await prisma.recoveryCase.findMany({ where: { userId: req.auth!.userId }, include: { committee: { select: { id: true, name: true } }, round: { select: { roundNumber: true } } }, orderBy: { openedAt: 'desc' } }));
});

router.post('/recovery/:id/resolve', async (req, res, next) => {
  try {
    const input = z.object({ txnRef: z.string().trim().min(4).max(120), idempotencyKey: z.string().min(8) }).parse(req.body);
    const recovery = await prisma.recoveryCase.findFirst({ where: { id: req.params.id, userId: req.auth!.userId, status: 'OPEN' }, include: { payment: true } });
    if (!recovery) return res.status(404).json({ error: 'Open recovery case not found' });
    const rehabilitationFee = recovery.outstandingPaisa / 10n;
    await prisma.$transaction(async tx => {
      await tx.payment.update({ where: { id: recovery.paymentId }, data: { status: 'PAID', paidAt: new Date(), paidVia: 'RECOVERY_TRANSFER', txnRef: input.txnRef, penaltyPaisa: recovery.penaltyPaisa + rehabilitationFee } });
      await ledger(tx, { committeeId: recovery.committeeId, actorId: req.auth!.userId, debit: `user:${req.auth!.userId}:external`, credit: `committee:${recovery.committeeId}:default_recovery`, amountPaisa: recovery.outstandingPaisa + recovery.penaltyPaisa + rehabilitationFee, reason: 'DEFAULT_RECOVERY_RECORDED', refType: 'RecoveryCase', refId: recovery.id, idempotencyKey: input.idempotencyKey });
      await tx.recoveryCase.update({ where: { id: recovery.id }, data: { status: 'PAYMENT_RECORDED', resolvedAt: new Date() } });
      const open = await tx.recoveryCase.count({ where: { userId: req.auth!.userId, status: 'OPEN', id: { not: recovery.id } } });
      if (!open) {
        const cooldownUntil = new Date(); cooldownUntil.setMonth(cooldownUntil.getMonth() + 6);
        await tx.user.update({ where: { id: req.auth!.userId }, data: { isBanned: false, banReason: null, cooldownUntil } });
        await tx.committeeMember.updateMany({ where: { userId: req.auth!.userId, status: 'BANNED' }, data: { status: 'EXITED', exitedAt: new Date() } });
      }
      await audit(tx, req.auth!.userId, 'DEFAULT_RECOVERY_RECORDED', 'RecoveryCase', recovery.id, { txnRef: input.txnRef, rehabilitationFeePaisa: rehabilitationFee.toString(), stage: 'RECORD_ONLY' });
    });
    res.json({ message: 'Recovery payment recorded. A six-month low-risk cooldown applies after all cases are cleared.' });
  } catch (error) { next(error); }
});

export default router;
