import { prisma } from '../db';

// Reliability record derived from real payment/completion events only — never
// self-reported. This is the trust surface shown before joining a circle.
export async function reputationFor(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, fullName: true, username: true, creditScore: true, paymentStreak: true, createdAt: true, defaultFlag: true, isBanned: true } });
  if (!user) return null;
  const [hostedCompleted, hostedActive, cleanCompletions, payments] = await Promise.all([
    prisma.committee.count({ where: { hostId: user.id, status: 'COMPLETED' } }),
    prisma.committee.count({ where: { hostId: user.id, status: { in: ['FORMING', 'ACTIVE'] } } }),
    prisma.creditEvent.count({ where: { userId: user.id, checkpoint: 'committee_completed' } }),
    prisma.payment.findMany({ where: { payerId: user.id, status: { in: ['PAID', 'LATE', 'MISSED'] } }, select: { status: true, paidAt: true, dueDate: true } }),
  ]);
  const resolved = payments.length;
  const onTime = payments.filter(p => p.status === 'PAID' && p.paidAt && p.paidAt.getTime() <= p.dueDate.getTime()).length;
  const missed = payments.filter(p => p.status === 'MISSED').length;
  return {
    userId: user.id, fullName: user.fullName, username: user.username,
    creditScore: user.creditScore, paymentStreak: user.paymentStreak, memberSince: user.createdAt,
    hostedCompleted, hostedActive, cleanCompletions,
    paymentsResolved: resolved, onTimePct: resolved ? Math.round((onTime / resolved) * 100) : null,
    missedPayments: missed, defaultFlag: user.defaultFlag, isBanned: user.isBanned,
  };
}
