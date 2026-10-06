import { Router } from 'express';
import { once } from '../lib/idempotency';
import { readPage, sendPage } from '../lib/page';
import { safeRouter } from '../lib/safe-router';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { assertMember } from '../lib/guards';
import { settleContribution } from '../lib/settlement';
import { initiatePayment, type Rail } from '../lib/payment-provider';
import { requireFreshUndertaking } from '../lib/agreements';

// safeRouter, not Router: a rejected promise in any handler below reaches the
// error handler instead of hanging the request (lib/safe-router.ts).
const router = safeRouter();
router.use(requireAuth);
// Recording money movements requires a live weekly undertaking (the 428 tells
// the web client to open the signing overlay). Read endpoints stay open.
const undertakingGate = requireFreshUndertaking(prisma);

// One-tap pay through the rail integration layer. In sandbox this initiates
// and auto-confirms the installment in a single call; when a rail is live it
// returns the payment instruction and awaits the provider's confirmation.
router.post('/initiate', undertakingGate, async (req, res, next) => {
  try {
    const input = z.object({
      roundId: z.string(), rail: z.enum(['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CASH']),
      idempotencyKey: z.string().min(8),
    }).parse(req.body);
    const round = await prisma.round.findUnique({ where: { id: input.roundId }, include: { committee: true } });
    if (!round) return res.status(404).json({ error: 'Round not found' });
    if (round.status !== 'COLLECTING') return res.status(409).json({ error: 'Round is not collecting payments' });
    await assertMember(round.committeeId, req.auth!.userId);
    const payment = await prisma.payment.findUnique({ where: { roundId_payerId: { roundId: round.id, payerId: req.auth!.userId } } });
    if (!payment) return res.status(404).json({ error: 'Payment obligation not found' });
    if (payment.status === 'PAID') return res.json({ settled: true, payment });
    const instruction = await initiatePayment(input.rail as Rail, payment.amountPaisa);
    if (!instruction.autoConfirm) return res.json({ settled: false, instruction });
    const settled = await prisma.$transaction(tx => settleContribution(tx, { round, payment, paidVia: input.rail, txnRef: instruction.reference, idempotencyKey: input.idempotencyKey, actorId: req.auth!.userId }));
    // Salary-pattern evidence: a manual payment is also proof money was
    // present today (lib/salary-pattern.ts). Logging must never block paying.
    await prisma.paymentAttempt.create({ data: { userId: req.auth!.userId, paymentId: payment.id, rail: input.rail, outcome: 'COLLECTED', source: 'MANUAL', amountPaisa: payment.amountPaisa, calendarDay: new Date().getDate() } }).catch(() => {});
    res.status(201).json({ settled: true, payment: settled, instruction });
  } catch (error) { next(error); }
});

router.get('/mine', async (req, res) => {
  // Had no bound at all: every payment the member ever made, on every load of
  // four different screens. Fine at twelve rows, an outage at twelve thousand.
  const { take, cursorArgs } = readPage(req.query);
  const rows = await prisma.payment.findMany({
    where: { payerId: req.auth!.userId },
    include: { round: { include: { committee: { select: { id: true, name: true } } } } },
    orderBy: [{ dueDate: 'desc' }, { id: 'desc' }], take, ...cursorArgs,   // id breaks ties, so a cursor is sound
  });
  sendPage(res, rows, take);
});

router.post('/', undertakingGate, async (req, res, next) => {
  try {
    const input = z.object({
      roundId: z.string(), paidVia: z.enum(['RAAST','JAZZCASH','EASYPAISA','BANK_TRANSFER','CASH']),
      txnRef: z.string().trim().min(4).max(100), idempotencyKey: z.string().min(8),
    }).parse(req.body);
    const round = await prisma.round.findUnique({ where: { id: input.roundId }, include: { committee: true } });
    if (!round) return res.status(404).json({ error: 'Round not found' });
    if (round.status !== 'COLLECTING') return res.status(409).json({ error: 'Round is not collecting payments' });
    await assertMember(round.committeeId, req.auth!.userId);
    const payment = await prisma.payment.findUnique({ where: { roundId_payerId: { roundId: round.id, payerId: req.auth!.userId } } });
    if (!payment) return res.status(404).json({ error: 'Payment obligation not found' });
    if (payment.status === 'PAID') return res.json(payment);
    // Recorded once, whatever the network does. A retry with the same key gets
    // the answer the first attempt gave rather than a conflict from the
    // ledger's unique constraint, which read to the client as a failure and
    // sent the member off to pay a second time by hand.
    const outcome = await once(prisma, { userId: req.auth!.userId, route: 'POST /api/payments', key: input.idempotencyKey },
      async tx => {
        const updated = await settleContribution(tx, { round, payment, paidVia: input.paidVia, txnRef: input.txnRef, idempotencyKey: input.idempotencyKey, actorId: req.auth!.userId });
        return { statusCode: 201, body: updated };
      });
    if (!outcome.replayed) {
      await prisma.paymentAttempt.create({ data: { userId: req.auth!.userId, paymentId: payment.id, rail: input.paidVia, outcome: 'COLLECTED', source: 'MANUAL', amountPaisa: payment.amountPaisa, calendarDay: new Date().getDate() } }).catch(() => {});
    }
    res.status(outcome.statusCode).json(outcome.body);
  } catch (error) { next(error); }
});

export default router;
