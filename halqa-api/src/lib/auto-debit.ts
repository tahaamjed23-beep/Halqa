import type { PrismaClient } from '@prisma/client';
import { prisma } from '../db';
import { settleContribution } from './settlement';
import { initiatePayment, type Rail } from './payment-provider';

// Auto-collect (standing auto-debit mandate).
//
// This is Money Fellows' final default-prevention weapon, built the no-custody
// way: a member who has switched on auto-pay for a circle has each due
// installment collected automatically at the deadline, rather than relying on
// them to remember. The member's mandate is captured in-app (software consent,
// recorded with a timestamp); the actual pull runs through the provider layer.
//
// Payday pull (2026-07-31): collection is additionally attempted on the
// member's salary day — declared or learned — even before the due date, while
// the balance is at its monthly maximum. "As soon as money arrives, it is
// taken" is a scheduling decision, not a new rail: rounds are open from day
// one, early settlement is allowed (and earns the early-bird bonus), and a
// pull that lands early can never be pulled twice thanks to the idempotency
// key and the PAID status.
//
// Every attempt — success, awaiting, failure — is logged as a PaymentAttempt
// row by calendar day. That log is the salary-pattern verifier's evidence
// (lib/salary-pattern.ts): the day retries start succeeding is the payday.
//
// In sandbox the pull auto-confirms and the installment settles immediately,
// so the whole loop is demonstrable today. When a real rail is live the pull
// is initiated and left PENDING for the provider's webhook to confirm — Halqa
// never touches the money, it only schedules the collection. A live rail whose
// integration isn't wired yet throws 501; we swallow that per-payment so one
// unimplemented rail can never crash the whole nightly pass.

export type AutoDebitSummary = { attempted: number; collected: number; awaiting: number; failed: number; paydayPulls: number; touchedUserIds: string[] };

// Collect on the day it's due (and any time after). A member who wants to pay
// manually still has their full grace window — auto-debit only fires for those
// who explicitly opted in, and only once the installment is actually due, OR
// on their salary day ahead of it.
const DUE_WINDOW_MS = 1 * 86_400_000;

const logAttempt = (db: PrismaClient, data: { userId: string; paymentId: string; rail: string; outcome: string; source: string; amountPaisa: bigint; now: Date }) =>
  db.paymentAttempt.create({ data: {
    userId: data.userId, paymentId: data.paymentId, rail: data.rail, outcome: data.outcome, source: data.source,
    amountPaisa: data.amountPaisa, calendarDay: data.now.getDate(), attemptedAt: data.now,
  } }).catch(() => {});

export async function runAutoDebit(now = new Date(), db: PrismaClient = prisma): Promise<AutoDebitSummary> {
  const summary: AutoDebitSummary = { attempted: 0, collected: 0, awaiting: 0, failed: 0, paydayPulls: 0, touchedUserIds: [] };
  const today = now.getDate();
  const touched = new Set<string>();
  const due = await db.payment.findMany({
    where: {
      status: 'PENDING',
      round: { status: 'COLLECTING', committee: { status: 'ACTIVE' } },
      OR: [
        { dueDate: { lte: new Date(now.getTime() + DUE_WINDOW_MS) } },
        // Payday pull: not yet due, but today is the payer's salary day.
        { payer: { OR: [{ salaryDay: today }, { salaryDayLearned: today }] } },
      ],
    },
    include: { round: { include: { committee: true } }, payer: { select: { isBanned: true, salaryDay: true, salaryDayLearned: true } } },
  });
  for (const payment of due) {
    const membership = await db.committeeMember.findUnique({
      where: { committeeId_userId: { committeeId: payment.round.committeeId, userId: payment.payerId } },
    });
    if (!membership || membership.status !== 'ACTIVE' || !membership.autoDebitEnabled) continue;
    if (payment.payer.isBanned) continue;
    const isDue = payment.dueDate.getTime() <= now.getTime() + DUE_WINDOW_MS;
    const isPayday = payment.payer.salaryDay === today || payment.payer.salaryDayLearned === today;
    if (!isDue && !isPayday) continue;
    summary.attempted++;
    if (!isDue) summary.paydayPulls++;
    touched.add(payment.payerId);
    const rail = ((membership.autoDebitRail as Rail | null) ?? 'RAAST');
    try {
      const instruction = await initiatePayment(rail, payment.amountPaisa);
      if (!instruction.autoConfirm) {
        // Live rail: the pull is initiated; the provider webhook will settle it.
        // Nothing to record yet beyond a one-time member notice.
        await db.notification.create({ data: { userId: payment.payerId, type: 'AUTOPAY_INITIATED', message: `Auto-pay started your ${payment.round.committee.name} installment via ${rail}. It will confirm shortly.` } }).catch(() => {});
        await logAttempt(db, { userId: payment.payerId, paymentId: payment.id, rail, outcome: 'AWAITING', source: 'AUTO_DEBIT', amountPaisa: payment.amountPaisa, now });
        summary.awaiting++;
        continue;
      }
      await db.$transaction(tx => settleContribution(tx, {
        round: payment.round, payment, paidVia: rail,
        txnRef: instruction.reference, idempotencyKey: `autodebit:${payment.id}`, actorId: payment.payerId, now,
      }));
      await db.notification.create({ data: { userId: payment.payerId, type: 'AUTOPAY_COLLECTED', message: isDue ? `Auto-pay collected your ${payment.round.committee.name} installment on time via ${rail}. No action needed.` : `Payday collection: your ${payment.round.committee.name} installment was collected via ${rail} on your salary day — before it was even due. No action needed.` } }).catch(() => {});
      await logAttempt(db, { userId: payment.payerId, paymentId: payment.id, rail, outcome: 'COLLECTED', source: 'AUTO_DEBIT', amountPaisa: payment.amountPaisa, now });
      summary.collected++;
    } catch {
      // Live-but-unimplemented rail (501), a race with a manual payment, or a
      // provider hiccup: skip this one, punish nothing, retry next pass.
      await logAttempt(db, { userId: payment.payerId, paymentId: payment.id, rail, outcome: 'FAILED', source: 'AUTO_DEBIT', amountPaisa: payment.amountPaisa, now });
      summary.failed++;
    }
  }
  summary.touchedUserIds = [...touched];
  return summary;
}
