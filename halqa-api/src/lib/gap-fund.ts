import { randomUUID } from 'node:crypto';
import type { Prisma, PrismaClient } from '@prisma/client';

// Fund-the-gap (the Money Fellows move): a forming circle with empty slots can
// start anyway — Halqa fills the missing positions with sponsor slots instead
// of letting the circle die. Sponsor slots always take the LAST turn positions,
// so the platform pays into every round before it ever collects: zero default
// exposure to the members, and the sponsor payout at cycle end returns the
// platform's contributions (plus, at the licensed stage, the slot economics).
//
// Sponsor slots are held by indexed system users (halqa.gap.N) because a
// committee's members are unique per user. Their payments auto-settle the
// moment a round starts collecting, so the pool is always whole.

type Tx = PrismaClient | Prisma.TransactionClient;

export const GAP_USERNAME_PREFIX = 'halqa.gap.';
export const isGapUsername = (u: string) => u.startsWith(GAP_USERNAME_PREFIX);

export async function ensureSponsorUser(tx: Tx, index: number) {
  const username = `${GAP_USERNAME_PREFIX}${index}`;
  const existing = await tx.user.findUnique({ where: { username } });
  if (existing) return existing;
  return tx.user.create({ data: {
    fullName: 'Halqa Gap Fund',
    username,
    phone: `0300${String(9000000 + index)}`,
    email: `${username}@system.halqa.pk`,
    passwordHash: `!locked:${randomUUID()}`, // never a valid bcrypt hash — unsignable account
    creditScore: 700,
  } });
}

// Auto-settle every sponsor payment on a round: mark PAID and record the
// platform's contribution on the ledger so the pool is whole from day one.
export async function settleSponsorPayments(tx: Tx, roundId: string, committeeId: string) {
  const payments = await tx.payment.findMany({ where: { roundId, status: { not: 'PAID' } }, include: { payer: { select: { username: true } } } });
  for (const p of payments) {
    if (!isGapUsername(p.payer.username)) continue;
    await tx.payment.update({ where: { id: p.id }, data: { status: 'PAID', paidAt: new Date(), paidVia: 'BANK_TRANSFER', txnRef: `GAPFUND-${roundId.slice(-6)}` } });
    await tx.ledgerEntry.create({ data: {
      committeeId, actorId: p.payerId,
      debit: 'platform:gapfund', credit: `committee:${committeeId}:collections`,
      amountPaisa: p.amountPaisa, reason: 'GAP_FUND_CONTRIBUTION_RECORDED',
      refType: 'Payment', refId: p.id, idempotencyKey: `gapfund:${p.id}`,
    } });
  }
}
