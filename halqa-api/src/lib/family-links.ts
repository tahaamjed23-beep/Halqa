import type { Prisma, PrismaClient } from '@prisma/client';

type Db = PrismaClient | Prisma.TransactionClient;

// Family / linked-account policy (Oraan model, consented in clause 7(e) of the
// member undertaking): while a member sits in unresolved post-payout default,
// the accounts LINKED to them share the consequence — payouts withheld, new
// joins declined — until the obligation clears. Linkage is derived from what
// the platform can actually observe, not self-declaration:
//   * referral edges (either direction — who brought whom),
//   * guarantee edges (guarantor <-> guaranteed member),
//   * a shared device (household members using the same phone).
export async function linkedUserIds(db: Db, userId: string): Promise<string[]> {
  const me = await db.user.findUnique({ where: { id: userId }, select: { referredById: true, deviceId: true } });
  if (!me) return [];
  const [referred, guaranteesGiven, guaranteesReceived, sameDevice] = await Promise.all([
    db.user.findMany({ where: { referredById: userId }, select: { id: true } }),
    db.protectionCommitment.findMany({ where: { guarantorUserId: userId }, select: { membership: { select: { userId: true } } } }),
    db.protectionCommitment.findMany({ where: { membership: { userId }, guarantorUserId: { not: null } }, select: { guarantorUserId: true } }),
    me.deviceId ? db.user.findMany({ where: { deviceId: me.deviceId, id: { not: userId } }, select: { id: true } }) : Promise.resolve([]),
  ]);
  const ids = new Set<string>();
  if (me.referredById) ids.add(me.referredById);
  for (const row of referred) ids.add(row.id);
  for (const row of guaranteesGiven) ids.add(row.membership.userId);
  for (const row of guaranteesReceived) if (row.guarantorUserId) ids.add(row.guarantorUserId);
  for (const row of sameDevice) ids.add(row.id);
  ids.delete(userId);
  return [...ids];
}

// The linked account (if any) whose unresolved post-payout default puts this
// member under the linked-account hold. Scoped tightly: the linked user must
// carry the defaultFlag (a certified post-payout default, not a mere late
// payment) AND still have an OPEN recovery case.
export async function linkedOpenDefault(db: Db, userId: string): Promise<{ userId: string; fullName: string } | null> {
  const linked = await linkedUserIds(db, userId);
  if (!linked.length) return null;
  const offender = await db.user.findFirst({
    where: { id: { in: linked }, defaultFlag: true, recoveryCases: { some: { status: 'OPEN' } } },
    select: { id: true, fullName: true },
  });
  return offender ? { userId: offender.id, fullName: offender.fullName } : null;
}
