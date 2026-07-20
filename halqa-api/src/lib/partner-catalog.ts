import type { PrismaClient } from '@prisma/client';

// Partner rail registry. Sandbox partners simulate the bank leg (KYC checks,
// statement feeds, custody) with production-shaped data so the integration
// surface is real even before a commercial agreement is signed.
export const partnerCatalog = [
  { name: 'Soneri Bank', shortCode: 'SONERI', custodyEnabled: true, kycEnabled: true, raastEnabled: true, sandbox: true, isActive: true },
] as const;

// Strategy-catalog ids whose GUARDED status was explicitly parked "pending a
// licensed partner": 75 auto-debit mandates, 96 statement matching, 99 licensed
// default cover (guaranteed payouts).
export const PARTNER_UNLOCKS = [75, 96, 99] as const;

export async function syncPartnerCatalog(db: PrismaClient) {
  for (const partner of partnerCatalog) {
    await db.partnerBank.upsert({ where: { shortCode: partner.shortCode }, create: partner, update: partner });
  }
}

export const activePartner = (db: PrismaClient) =>
  db.partnerBank.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'asc' } });

export const guaranteeFundAccount = (committeeId: string) => `committee:${committeeId}:guarantee_fund`;

export async function guaranteeFundBalance(db: PrismaClient, committeeId: string): Promise<bigint> {
  const account = guaranteeFundAccount(committeeId);
  const entries = await db.ledgerEntry.findMany({ where: { committeeId, OR: [{ credit: account }, { debit: account }] }, select: { credit: true, debit: true, amountPaisa: true } });
  let balance = 0n;
  for (const entry of entries) { if (entry.credit === account) balance += entry.amountPaisa; if (entry.debit === account) balance -= entry.amountPaisa; }
  return balance;
}

// Oraan-style disclosed slot pricing: the earliest payout position pays the full
// committee slotFeeBps, declining linearly to zero for the final position. The
// fee funds the circle's own guarantee pool — it is never redistributed to
// other members or the platform.
export const slotFeeBpsForRound = (slotFeeBps: number, roundNumber: number, totalRounds: number) =>
  slotFeeBps <= 0 || totalRounds <= 1 ? 0 : Math.round(slotFeeBps * (totalRounds - roundNumber) / (totalRounds - 1));
