import { Router } from 'express';
import { z } from 'zod';
import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { audit, ledger } from '../lib/audit';
import { paisaInput, projectedReturn } from '../lib/money';
import { FLOAT_MUDARIB_FEE_PCT, FLOAT_SCHEME_SLUG } from '../lib/sukoon';

// Payout Parking (Sukoon Vault): a member can choose to leave a round payout
// recorded in a personal vault, where it accrues the Islamic money-market
// rate until they sweep it out. Full-sweep only, so accrual is always
// computed over the entries since the last withdrawal — no drift, no cron.
const router = Router();
router.use(requireAuth);

const vaultAccount = (userId: string) => `user:${userId}:vault`;
const clampDays = (ms: number) => Math.max(0, Math.min(365, Math.floor(ms / 86_400_000)));

// Vault yield tiers — all Shariah-compliant, opt-in higher yield for a little
// more volatility. STANDARD = the money-market sleeve; INCOME = an Islamic
// income fund; GOLD = a gold-linked allocation (a halal inflation hedge).
const VAULT_TIERS = ['STANDARD', 'INCOME', 'GOLD'] as const;
const VAULT_TIER_SLUG: Record<string, string> = { STANDARD: FLOAT_SCHEME_SLUG, INCOME: 'islamic-income-fund-basket', GOLD: 'gold-linked-allocation' };
const tierScheme = (db: PrismaClient | Prisma.TransactionClient, tier: string) =>
  db.scheme.findUnique({ where: { slug: VAULT_TIER_SLUG[tier] ?? FLOAT_SCHEME_SLUG } });

async function vaultState(db: PrismaClient | Prisma.TransactionClient, userId: string, ratePct: number) {
  const account = vaultAccount(userId);
  const entries = await db.ledgerEntry.findMany({ where: { OR: [{ credit: account }, { debit: account }] }, orderBy: { createdAt: 'asc' } });
  let balance = 0n;
  let lastSweep = 0;
  for (const entry of entries) {
    if (entry.credit === account) balance += entry.amountPaisa;
    if (entry.debit === account) { balance -= entry.amountPaisa; lastSweep = entry.createdAt.getTime(); }
  }
  const now = Date.now();
  const openEntries = entries.filter(entry => entry.credit === account && entry.createdAt.getTime() > lastSweep);
  const accrued = openEntries.reduce((sum, entry) => sum + projectedReturn(entry.amountPaisa, ratePct, clampDays(now - entry.createdAt.getTime())), 0n);
  return { balance, accrued, openEntries };
}

router.get('/', async (req, res, next) => {
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { vaultParkingEnabled: true, vaultTier: true, vaultAutoCover: true } });
    const scheme = await tierScheme(prisma, user.vaultTier);
    const state = await vaultState(prisma, req.auth!.userId, scheme?.indicativeRatePct ?? 0);
    res.json({ enabled: user.vaultParkingEnabled, tier: user.vaultTier, tiers: VAULT_TIERS, autoCover: user.vaultAutoCover, balancePaisa: state.balance.toString(), accruedProfitPaisa: state.accrued.toString(), ratePct: scheme?.indicativeRatePct ?? 0, scheme: scheme ? { name: scheme.name, shariahCompliant: scheme.shariahCompliant, rateAsOf: scheme.rateAsOf } : null });
  } catch (error) { next(error); }
});

router.post('/toggle', async (req, res, next) => {
  try {
    const { enabled } = z.object({ enabled: z.boolean() }).parse(req.body);
    const user = await prisma.user.update({ where: { id: req.auth!.userId }, data: { vaultParkingEnabled: enabled } });
    await audit(prisma, req.auth!.userId, 'VAULT_PARKING_TOGGLED', 'User', user.id, { enabled });
    res.json({ enabled: user.vaultParkingEnabled });
  } catch (error) { next(error); }
});

// Auto-cover: the anti-default safety net. When enabled, an installment that
// slips past its due date is settled automatically from this member's vault
// (if the balance covers it) through the normal settlement path — the small
// late penalty and score hit still apply, but the miss never escalates.
router.post('/auto-cover', async (req, res, next) => {
  try {
    const { enabled } = z.object({ enabled: z.boolean() }).parse(req.body);
    const user = await prisma.user.update({ where: { id: req.auth!.userId }, data: { vaultAutoCover: enabled } });
    await audit(prisma, req.auth!.userId, 'VAULT_AUTO_COVER_TOGGLED', 'User', user.id, { enabled });
    res.json({ autoCover: user.vaultAutoCover });
  } catch (error) { next(error); }
});

// Choose the yield tier (STANDARD / INCOME / GOLD). The chosen tier's dated
// rate applies to the vault's open entries from here on.
router.post('/tier', async (req, res, next) => {
  try {
    const { tier } = z.object({ tier: z.enum(VAULT_TIERS) }).parse(req.body);
    const scheme = await tierScheme(prisma, tier);
    if (!scheme?.isActive) return res.status(409).json({ error: 'That vault tier is not available right now' });
    const user = await prisma.user.update({ where: { id: req.auth!.userId }, data: { vaultTier: tier } });
    await audit(prisma, req.auth!.userId, 'VAULT_TIER_SET', 'User', user.id, { tier });
    res.json({ tier: user.vaultTier, ratePct: scheme.indicativeRatePct, scheme: { name: scheme.name, shariahCompliant: scheme.shariahCompliant, rateAsOf: scheme.rateAsOf } });
  } catch (error) { next(error); }
});

// Top-up savings: any amount can be recorded into the vault, not just parked
// payouts. Same Mudarabah sleeve, same per-entry accrual, same full-sweep
// withdrawal — a halal savings pocket that needs no committee and no partner.
router.post('/deposit', async (req, res, next) => {
  try {
    const { amountPaisa, idempotencyKey } = z.object({ amountPaisa: paisaInput, idempotencyKey: z.string().min(8) }).parse(req.body);
    if (amountPaisa < 10_000n) return res.status(400).json({ error: 'Vault deposits start at Rs 100' });
    if (amountPaisa > 10_000_000_000n) return res.status(400).json({ error: 'Vault deposits exceed the prototype safety limit' });
    await ledger(prisma, { actorId: req.auth!.userId, debit: `user:${req.auth!.userId}:external`, credit: vaultAccount(req.auth!.userId), amountPaisa, reason: 'VAULT_TOPUP_RECORDED', refType: 'User', refId: req.auth!.userId, idempotencyKey });
    await audit(prisma, req.auth!.userId, 'VAULT_TOPUP', 'User', req.auth!.userId, { amountPaisa: amountPaisa.toString(), stage: 'RECORD_ONLY' });
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { vaultTier: true } });
    const scheme = await tierScheme(prisma, user.vaultTier);
    const state = await vaultState(prisma, req.auth!.userId, scheme?.indicativeRatePct ?? 0);
    res.status(201).json({ balancePaisa: state.balance.toString(), accruedProfitPaisa: state.accrued.toString() });
  } catch (error) { next(error); }
});

router.post('/withdraw', async (req, res, next) => {
  try {
    const { idempotencyKey } = z.object({ idempotencyKey: z.string().min(8) }).parse(req.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { vaultTier: true } });
    const scheme = await tierScheme(prisma, user.vaultTier);
    const result = await prisma.$transaction(async tx => {
      const state = await vaultState(tx, req.auth!.userId, scheme?.indicativeRatePct ?? 0);
      if (state.balance <= 0n) throw Object.assign(new Error('The vault is empty'), { status: 409 });
      const feePaisa = state.accrued * FLOAT_MUDARIB_FEE_PCT / 100n;
      const netProfitPaisa = state.accrued - feePaisa;
      await ledger(tx, { actorId: req.auth!.userId, debit: vaultAccount(req.auth!.userId), credit: `user:${req.auth!.userId}:external`, amountPaisa: state.balance, reason: 'VAULT_SWEEP_PRINCIPAL_RECORDED', refType: 'User', refId: req.auth!.userId, idempotencyKey });
      if (netProfitPaisa > 0n) await ledger(tx, { actorId: req.auth!.userId, debit: `user:${req.auth!.userId}:vault_investment`, credit: `user:${req.auth!.userId}:external`, amountPaisa: netProfitPaisa, reason: 'VAULT_PARKING_PROFIT_SIMULATED', refType: 'User', refId: req.auth!.userId, idempotencyKey: `${idempotencyKey}:profit` });
      if (feePaisa > 0n) await ledger(tx, { actorId: req.auth!.userId, debit: `user:${req.auth!.userId}:vault_investment`, credit: 'platform:fees', amountPaisa: feePaisa, reason: 'VAULT_MUDARIB_FEE_5_PERCENT', refType: 'User', refId: req.auth!.userId, idempotencyKey: `${idempotencyKey}:fee` });
      await audit(tx, req.auth!.userId, 'VAULT_SWEPT', 'User', req.auth!.userId, { principalPaisa: state.balance.toString(), profitPaisa: netProfitPaisa.toString(), feePaisa: feePaisa.toString(), stage: 'SIMULATED' });
      return { principalPaisa: state.balance, profitPaisa: netProfitPaisa, feePaisa };
    });
    res.json(result);
  } catch (error) { next(error); }
});

export default router;
