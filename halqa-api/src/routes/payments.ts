import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { assertMember } from '../lib/guards';
import { settleContribution } from '../lib/settlement';
import { initiatePayment, type Rail } from '../lib/payment-provider';
import { requireFreshUndertaking } from '../lib/agreements';

const router = Router();
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
    res.status(201).json({ settled: true, payment: settled, instruction });
  } catch (error) { next(error); }
});

router.get('/mine', async (req, res) => {
  res.json(await prisma.payment.findMany({ where: { payerId: req.auth!.userId }, include: { round: { include: { committee: { select: { id: true, name: true } } } } }, orderBy: { dueDate: 'desc' } }));
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
    const updated = await prisma.$transaction(tx => settleContribution(tx, { round, payment, paidVia: input.paidVia, txnRef: input.txnRef, idempotencyKey: input.idempotencyKey, actorId: req.auth!.userId }));
    res.status(201).json(updated);
  } catch (error) { next(error); }
});

export default router;
