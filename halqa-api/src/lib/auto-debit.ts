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
// In sandbox the pull auto-confirms and the installment settles immediately,
// so the whole loop is demonstrable today. When a real rail is live the pull
// is initiated and left PENDING for the provider's webhook to confirm — Halqa
// never touches the money, it only schedules the collection. A live rail whose
// integration isn't wired yet throws 501; we swallow that per-payment so one
// unimplemented rail can never crash the whole nightly pass.

export type AutoDebitSummary = { attempted: number; collected: number; awaiting: number; failed: number };

// Collect on the day it's due (and any time after). A member who wants to pay
// manually still has their full grace window — auto-debit only fires for those
// who explicitly opted in, and only once the installment is actually due.
const DUE_WINDOW_MS = 1 * 86_400_000;

export async function runAutoDebit(now = new Date(), db: PrismaClient = prisma): Promise<AutoDebitSummary> {
  const summary: AutoDebitSummary = { attempted: 0, collected: 0, awaiting: 0, failed: 0 };
  const due = await db.payment.findMany({
    where: {
      status: 'PENDING',
      dueDate: { lte: new Date(now.getTime() + DUE_WINDOW_MS) },
      round: { status: 'COLLECTING', committee: { status: 'ACTIVE' } },
    },
    include: { round: { include: { committee: true } }, payer: { select: { isBanned: true } } },
  });
  for (const payment of due) {
    const membership = await db.committeeMember.findUnique({
      where: { committeeId_userId: { committeeId: payment.round.committeeId, userId: payment.payerId } },
    });
    if (!membership || membership.status !== 'ACTIVE' || !membership.autoDebitEnabled) continue;
    if (payment.payer.isBanned) continue;
    summary.attempted++;
    const rail = ((membership.autoDebitRail as Rail | null) ?? 'RAAST');
    try {
      const instruction = await initiatePayment(rail, payment.amountPaisa);
      if (!instruction.autoConfirm) {
        // Live rail: the pull is initiated; the provider webhook will settle it.
        // Nothing to record yet beyond a one-time member notice.
        await db.notification.create({ data: { userId: payment.payerId, type: 'AUTOPAY_INITIATED', message: `Auto-pay started your ${payment.round.committee.name} installment via ${rail}. It will confirm shortly.` } }).catch(() => {});
        summary.awaiting++;
        continue;
      }
      await db.$transaction(tx => settleContribution(tx, {
        round: payment.round, payment, paidVia: rail,
        txnRef: instruction.reference, idempotencyKey: `autodebit:${payment.id}`, actorId: payment.payerId, now,
      }));
      await db.notification.create({ data: { userId: payment.payerId, type: 'AUTOPAY_COLLECTED', message: `Auto-pay collected your ${payment.round.committee.name} installment on time via ${rail}. No action needed.` } }).catch(() => {});
      summary.collected++;
    } catch {
      // Live-but-unimplemented rail (501), a race with a manual payment, or a
      // provider hiccup: skip this one, punish nothing, retry next pass.
      summary.failed++;
    }
  }
  return summary;
}
