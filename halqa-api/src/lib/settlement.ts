import type { Committee, Payment, Prisma, Round } from '@prisma/client';
import { audit, ledger } from './audit';
import { clampScore } from './money';
import { debitReceiptText, queueWhatsApp } from './whatsapp';

// Single settlement path for a contribution, shared by the member-recorded
// payment route and partner statement matching so both produce identical
// penalties, ledger entries, holdback releases and score events.
export async function settleContribution(tx: Prisma.TransactionClient, args: {
  round: Round & { committee: Committee };
  payment: Payment;
  paidVia: string;
  txnRef: string;
  idempotencyKey: string;
  actorId: string;
  now?: Date;
}): Promise<Payment> {
  const { round, payment, paidVia, txnRef, idempotencyKey, actorId } = args;
  const now = args.now ?? new Date();
  const payerId = payment.payerId;
  const daysDiff = (round.dueDate.getTime() - now.getTime()) / 86400000;
  const isEarly = daysDiff >= 3;
  const lateDays = Math.max(0, Math.ceil(-daysDiff));
  const isLate = lateDays > 0;

  let penaltyPaisa = 0n;
  if (isLate) {
    const progressiveRateBps = BigInt(lateDays > round.graceDays ? 1000 : lateDays >= 4 ? 500 : round.committee.latePenaltyBps);
    penaltyPaisa = (round.committee.contributionPaisa * progressiveRateBps) / 10000n;
  }

  // Payment.amountPaisa is the principal obligation only. Penalties use a
  // separate ledger account so they can never inflate the investable pool.
  const claimed = await tx.payment.updateMany({ where: { id: payment.id, status: { not: 'PAID' } }, data: { status: 'PAID', paidVia, txnRef, paidAt: now, amountPaisa: round.committee.contributionPaisa, penaltyPaisa } });
  if (claimed.count !== 1) throw Object.assign(new Error('Payment was already recorded'), { status: 409 });
  const row = await tx.payment.findUniqueOrThrow({ where: { id: payment.id } });
  await tx.committeeMember.update({ where: { committeeId_userId: { committeeId: round.committeeId, userId: payerId } }, data: { paidPrincipalPaisa: { increment: round.committee.contributionPaisa } } });

  await ledger(tx, { committeeId: round.committeeId, actorId, debit: `user:${payerId}:external`, credit: `committee:${round.committeeId}:escrow`, amountPaisa: round.committee.contributionPaisa, reason: 'CONTRIBUTION_RECORDED_STAGE_1', refType: 'Payment', refId: row.id, idempotencyKey });

  if (penaltyPaisa > 0n) {
    await ledger(tx, { committeeId: round.committeeId, actorId, debit: `user:${payerId}:external`, credit: `committee:${round.committeeId}:default_reserve`, amountPaisa: penaltyPaisa, reason: 'PROGRESSIVE_LATE_PENALTY_RECORDED', refType: 'Payment', refId: row.id, idempotencyKey: `${idempotencyKey}:penalty` });
  }
  if (round.committee.insuranceReserveBps > 0) {
    const reservePaisa = round.committee.contributionPaisa * BigInt(round.committee.insuranceReserveBps) / 10_000n;
    if (reservePaisa > 0n) await ledger(tx, { committeeId: round.committeeId, actorId, debit: `user:${payerId}:external`, credit: `committee:${round.committeeId}:default_reserve`, amountPaisa: reservePaisa, reason: 'DEFAULT_RESERVE_CONTRIBUTION_RECORDED', refType: 'Payment', refId: row.id, idempotencyKey: `${idempotencyKey}:reserve` });
  }

  const held = await tx.payoutHoldback.findMany({ where: { membership: { committeeId: round.committeeId, userId: payerId }, status: 'HELD' } });
  for (const holdback of held) {
    const nextClean = holdback.cleanPayments + 1;
    if (nextClean >= holdback.requiredCleanPayments) {
      await tx.payoutHoldback.update({ where: { id: holdback.id }, data: { cleanPayments: nextClean, status: 'RELEASED', releasedAt: now } });
      await ledger(tx, { committeeId: round.committeeId, actorId, debit: `committee:${round.committeeId}:escrow`, credit: `user:${payerId}:external`, amountPaisa: holdback.amountPaisa, reason: 'PAYOUT_HOLDBACK_RELEASED', refType: 'PayoutHoldback', refId: holdback.id, idempotencyKey: `${idempotencyKey}:holdback:${holdback.id}` });
    } else await tx.payoutHoldback.update({ where: { id: holdback.id }, data: { cleanPayments: nextClean } });
  }

  const checkpoint = `payment:${row.id}`;
  let delta = 0;
  let reason = '';
  let streakIncrement = 1;

  if (isEarly) {
    delta = 6;
    reason = 'Paid at least three days early';
  } else if (!isLate) {
    delta = 4;
    reason = 'Contribution recorded on time';
  } else {
    delta = lateDays > round.graceDays ? -40 : lateDays >= 4 ? -20 : -10;
    reason = `Contribution recorded ${lateDays} day(s) late`;
    streakIncrement = 0; // Reset streak
  }

  if (isLate) {
    const alreadyScored = await tx.creditEvent.count({ where: { userId: payerId, roundId: round.id, checkpoint: { startsWith: 'delinquency:' } } });
    if (alreadyScored) { delta = 0; reason = `Late payment resolved after ${lateDays} day(s); delinquency score already applied`; }
  }

  const event = await tx.creditEvent.create({ data: { userId: payerId, committeeId: round.committeeId, roundId: round.id, checkpoint, delta, reason } }).catch(() => null);
  if (event) {
    const user = await tx.user.findUniqueOrThrow({ where: { id: payerId } });
    await tx.user.update({
      where: { id: user.id },
      data: {
        creditScore: clampScore(user.creditScore + delta),
        paymentStreak: streakIncrement > 0 ? { increment: 1 } : 0,
      },
    });
  }
  await audit(tx, actorId, 'PAYMENT_RECORDED', 'Payment', row.id, { paidVia, txnRef, amountPaisa: row.amountPaisa.toString(), penaltyPaisa: penaltyPaisa.toString(), stage: 'RECORD_ONLY' });
  // Every debit of a member's money produces a WhatsApp receipt (queued in the
  // same transaction; a gateway dispatcher sends it once a provider connects).
  await queueWhatsApp(tx, { userId: payerId, kind: 'DEBIT_RECEIPT', refType: 'Payment', refId: row.id, text: debitReceiptText({ committeeName: round.committee.name, roundNumber: round.roundNumber, amountPaisa: row.amountPaisa, rail: paidVia, txnRef, paymentId: row.id, penaltyPaisa }) });
  return row;
}
