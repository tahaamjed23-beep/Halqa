import { Router } from 'express';
import { once } from '../lib/idempotency';
import { idParam, twoIdParams } from '../lib/params';
import { readPage, sendPage } from '../lib/page';
import { safeRouter } from '../lib/safe-router';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, requireAdmin } from '../lib/auth';
import { assertHost, assertMember } from '../lib/guards';
import { audit, ledger } from '../lib/audit';
import { assessForwardLiability, type SecurityPolicy } from '../lib/forward-liability';
import { evaluateDelinquencies } from '../services/delinquency';

// safeRouter, not Router: a rejected promise in any handler below reaches the
// error handler instead of hanging the request (lib/safe-router.ts).
const router = safeRouter();
router.use(requireAuth);

// Dev/test-only trigger for the hourly delinquency pass (reminders, vault
// auto-cover, penalties, escalation). In production the scheduler owns this.
// The collector charges late fees, moves credit scores and queues bureau
// reports. Production refuses it outright, because only the scheduler may run
// it there; everywhere else it is now admin-only too, so a member on a staging
// copy of real data cannot set it off either.
router.post('/delinquency/run', requireAdmin, async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'The delinquency pass is scheduler-only in production' });
    const result = await evaluateDelinquencies();
    // Who set off a pass that charges late fees and queues bureau reports is
    // the first question asked afterwards.
    await audit(prisma, req.auth!.userId, 'DELINQUENCY_PASS_RUN', 'System', 'delinquency', {
      cases: Array.isArray(result) ? result.length : undefined,
    });
    res.json(result);
  } catch (error) { next(error); }
});

const policyOf = (value: unknown) => (value && typeof value === 'object' ? value : {}) as Record<string, unknown>;

router.get('/committee/:id', async (req, res, next) => {
  try {
    idParam.parse(req.params);
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
    const totalRounds = committee.rounds.length;
    const securityPolicy = policyOf(committee.riskPolicyJson) as SecurityPolicy;
    const matrix = committee.members.map(member => {
      const payment = activeRound?.payments.find(item => item.payerId === member.userId);
      const remainingDues = committee.contributionPaisa * BigInt(Math.max(0, committee.memberCap - committee.currentRound));
      const heldDeposit = member.securityDeposits.filter(item => item.status === 'HELD').reduce((sum, item) => sum + item.amountPaisa + item.accruedYieldPaisa, 0n);
      const heldPayout = member.payoutHoldbacks.filter(item => item.status === 'HELD').reduce((sum, item) => sum + item.amountPaisa, 0n);
      // Forward-liability preview for this member's OWN turn: security they must
      // hold against the installments still owed after they take the pot. Shown
      // for every position so a host can see, before payout, exactly where the
      // early-turn exposure sits and whether it is covered.
      const commitmentVerified = Boolean(member.protectionCommitment?.verifiedByHostAt);
      const memberRound = committee.rounds.find(round => round.roundNumber === member.turnPosition);
      const potPaisa = memberRound?.payoutPaisa ?? committee.contributionPaisa * BigInt(committee.members.length);
      const security = assessForwardLiability({
        contributionPaisa: committee.contributionPaisa, roundNumber: member.turnPosition, totalRounds,
        payoutPaisa: potPaisa > 0n ? potPaisa : committee.contributionPaisa, bufferHoldbackPaisa: 0n, defaultReleasePayments: 2,
        depositCoverageBps: committee.depositCoverageBps,
        posted: { heldDepositPaisa: heldDeposit, heldHoldbackPaisa: heldPayout, commitmentVerified },
        policy: securityPolicy,
      });
      return {
        membershipId: member.id, user: member.user, turnPosition: member.turnPosition, hasReceived: member.hasReceived, status: member.status,
        currentPayment: payment ? { id: payment.id, status: payment.status, dueDate: payment.dueDate, penaltyPaisa: payment.penaltyPaisa } : null,
        daysToDeadline: payment ? Math.ceil((payment.dueDate.getTime() - now) / 86_400_000) : null,
        remainingDuesPaisa: remainingDues, heldDepositPaisa: heldDeposit, heldPayoutPaisa: heldPayout,
        commitment: member.protectionCommitment, commitmentVerified,
        defaultImpactPaisa: remainingDues + heldDeposit + heldPayout,
        forwardLiabilityPaisa: security.forwardLiabilityPaisa, securityCoverageBps: security.coverageBps,
        requiredSecurityPaisa: security.requiredSecurityPaisa, postedSecurityPaisa: security.postedSecurityPaisa,
        securityShortfallPaisa: security.securityShortfallPaisa, securitySatisfied: security.satisfied, securityGateActive: security.enabled,
      };
    });
    res.json({
      committeeId: committee.id, policy: policyOf(committee.riskPolicyJson), payoutBufferBps: committee.payoutBufferBps,
      forwardLiabilityGateEnabled: securityPolicy.forwardLiabilityGateEnabled === true,
      latePenaltyBps: committee.latePenaltyBps, activeRound: activeRound ? { id: activeRound.id, roundNumber: activeRound.roundNumber, dueDate: activeRound.dueDate, payoutDate: activeRound.payoutDate } : null,
      openRecoveryCases: committee.recoveryCases.length, matrix,
      partnerGates: [
        { key: 'AUTO_DEBIT', label: 'Raast/JazzCash auto-debit', status: 'PARTNER_REQUIRED' },
        // Roadmap (ghost protocol 07): defaults follow the CNIC into the
        // national credit system, so a Halqa defaulter can't borrow anywhere.
        { key: 'CREDIT_BUREAU', label: 'TASDEEQ / DataCheck bureau reporting — defaults recorded against the CNIC', status: 'PARTNER_AGREEMENT_REQUIRED' },
        { key: 'ECIB', label: 'SBP eCIB reporting via partner institution', status: 'LEGAL_AND_PARTNER_REQUIRED' },
        { key: 'DEFAULT_INSURANCE', label: 'Licensed default insurance', status: 'INSURER_REQUIRED' },
        { key: 'PAYROLL', label: 'Employer payroll deduction (salary-linked collection)', status: 'EMPLOYER_REQUIRED' },
      ],
    });
  } catch (error) { next(error); }
});

router.put('/committee/:id/commitment', async (req, res, next) => {
  try {
    idParam.parse(req.params);
    const membership = await assertMember(req.params.id, req.auth!.userId);
    const input = z.object({
      guarantorUsername: z.string().trim().min(2).max(40).optional(),
      promissoryRef: z.string().trim().min(4).max(120).optional(),
      autoDebitRef: z.string().trim().min(4).max(120).optional(),
      acceptedTerms: z.literal(true),
    }).parse(req.body);
    let guarantorUserId: string | undefined;
    if (input.guarantorUsername) {
      // Only the three columns the check below needs. Reading the whole row
      // pulled passwordHash and pinHash into memory to answer a question about
      // somebody's score, which is one careless response away from leaking.
      const guarantor = await prisma.user.findUnique({
        where: { username: input.guarantorUsername.toLowerCase() },
        select: { id: true, isBanned: true, creditScore: true },
      });
      if (!guarantor || guarantor.isBanned || guarantor.creditScore < 700 || guarantor.id === req.auth!.userId) return res.status(400).json({ error: 'Guarantor must be another unrestricted Halqa user with score 700+' });
      guarantorUserId = guarantor.id;
    }
    const row = await prisma.$transaction(async tx => {
      const row = await tx.protectionCommitment.upsert({
        where: { membershipId: membership.id },
        update: { guarantorUserId, promissoryRef: input.promissoryRef, autoDebitRef: input.autoDebitRef, acceptedTermsAt: new Date() },
        create: { membershipId: membership.id, guarantorUserId, promissoryRef: input.promissoryRef, autoDebitRef: input.autoDebitRef, acceptedTermsAt: new Date() },
      });
      await audit(tx, req.auth!.userId, 'PROTECTION_COMMITMENT_RECORDED', 'CommitteeMember', membership.id, { hasGuarantor: Boolean(guarantorUserId), hasPromissoryRef: Boolean(input.promissoryRef), hasAutoDebitRef: Boolean(input.autoDebitRef), stage: 'RECORD_ONLY' });
      return row;
    });
    res.json(row);
  } catch (error) { next(error); }
});

router.post('/committee/:id/commitment/:membershipId/verify', async (req, res, next) => {
  try {
    twoIdParams('id', 'membershipId').parse(req.params);
    await assertHost(req.params.id, req.auth!.userId);
    const commitment = await prisma.protectionCommitment.findFirst({ where: { membershipId: req.params.membershipId, membership: { committeeId: req.params.id } } });
    if (!commitment) return res.status(404).json({ error: 'Protection commitment not found' });
    const row = await prisma.$transaction(async tx => {
      const row = await tx.protectionCommitment.update({ where: { id: commitment.id }, data: { verifiedByHostAt: new Date() } });
      await audit(tx, req.auth!.userId, 'PROTECTION_COMMITMENT_VERIFIED', 'ProtectionCommitment', row.id, { stage: 'RECORD_ONLY' });
      return row;
    });
    res.json(row);
  } catch (error) { next(error); }
});

router.post('/committee/:id/peer-nudge/:userId', async (req, res, next) => {
  try {
    twoIdParams('id', 'userId').parse(req.params);
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
  // Had no bound at all.
  const { take, cursorArgs } = readPage(req.query);
  const rows = await prisma.recoveryCase.findMany({
    where: { userId: req.auth!.userId },
    include: { committee: { select: { id: true, name: true } }, round: { select: { roundNumber: true } } },
    orderBy: [{ openedAt: 'desc' }, { id: 'desc' }], take, ...cursorArgs,   // id breaks ties, so a cursor is sound
  });
  sendPage(res, rows, take);
});

router.post('/recovery/:id/resolve', async (req, res, next) => {
  try {
    const input = z.object({ txnRef: z.string().trim().min(4).max(120), idempotencyKey: z.string().min(8) }).parse(req.body);
    const recovery = await prisma.recoveryCase.findFirst({ where: { id: req.params.id, userId: req.auth!.userId, status: 'OPEN' }, include: { payment: true } });
    if (!recovery) return res.status(404).json({ error: 'Open recovery case not found' });
    const rehabilitationFee = recovery.outstandingPaisa / 10n;
    // Recorded once. A retry gets the same answer rather than a conflict, on
    // the one route where the member is already in difficulty and a second
    // transfer is the last thing they can afford.
    const outcome = await once(prisma,
      { userId: req.auth!.userId, route: 'POST /api/protection/recovery/:id/resolve', key: input.idempotencyKey },
      async tx => {
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
      return {
        statusCode: 200,
        body: { message: 'Recovery payment recorded. A six-month low-risk cooldown applies after all cases are cleared.' },
      };
    });
    res.status(outcome.statusCode).json(outcome.body);
  } catch (error) { next(error); }
});

export default router;
