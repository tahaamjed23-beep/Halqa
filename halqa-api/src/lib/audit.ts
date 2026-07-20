import type { Prisma, PrismaClient } from '@prisma/client';

type Db = PrismaClient | Prisma.TransactionClient;
export const audit = (db: Db, actorId: string | null, action: string, entityType: string, entityId: string, payload: Prisma.InputJsonValue = {}) =>
  db.auditLog.create({ data: { actorId, action, entityType, entityId, payloadJson: payload } });

export const ledger = (db: Db, data: {
  committeeId?: string; actorId?: string; debit: string; credit: string; amountPaisa: bigint;
  reason: string; refType: string; refId: string; idempotencyKey: string;
}) => db.ledgerEntry.create({ data });
