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

// Vault yield tiers. STANDARD / INCOME / GOLD are Shariah-compliant sleeves.
// CRYPTO is the deliberate exception: personal vault ONLY (committees can
// never touch it), explicitly NOT Shariah-reviewed and NOT government-backed,
// and switchable only with an explicit extreme-risk acknowledgement.
const VAULT_TIERS = ['STANDARD', 'INCOME', 'GOLD', 'CRYPTO'] as const;
const VAULT_TIER_SLUG: Record<string, string> = { STANDARD: FLOAT_SCHEME_SLUG, INCOME: 'islamic-income-fund-basket', GOLD: 'gold-linked-allocation', CRYPTO: 'crypto-basket' };
const tierScheme = (db: PrismaClient | Prisma.TransactionClient, tier: string) =>
  db.scheme.findUnique({ where: { slug: VAULT_TIER_SLUG[tier] ?? FLOAT_SCHEME_SLUG } });

// Portion sizing: a saver can split the vault across the four sleeves instead
// of riding a single tier. Stored as JSON percentages summing to 100; the
// accrual rate becomes the allocation-weighted blend of the sleeves' dated
// indicative rates. An empty string means "no split" — the single vaultTier
// governs, exactly as before.
function parseAllocation(raw: string): Partial<Record<(typeof VAULT_TIERS)[number], number>> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, number>;
    const entries = VAULT_TIERS.map(tier => [tier, Math.round(parsed[tier] ?? 0)] as const).filter(([, pct]) => pct > 0);
    const total = entries.reduce((sum, [, pct]) => sum + pct, 0);
    if (total !== 100) return null;
    return Object.fromEntries(entries);
  } catch { return null; }
}

async function tierTable(db: PrismaClient | Prisma.TransactionClient) {
  const schemes = await Promise.all(VAULT_TIERS.map(tier => tierScheme(db, tier)));
  return VAULT_TIERS.map((tier, index) => ({ tier, scheme: schemes[index] }));
}

// The rate the vault accrues at, plus the per-sleeve detail the client needs
// to render sizing, projections, risk and the money map.
async function vaultRates(db: PrismaClient | Prisma.TransactionClient, user: { vaultTier: string; vaultAllocation: string }) {
  const table = await tierTable(db);
  const allocation = parseAllocation(user.vaultAllocation);
  const shareOf = (tier: string) => allocation ? (allocation[tier as (typeof VAULT_TIERS)[number]] ?? 0) : (tier === user.vaultTier ? 100 : 0);
  let blendedRatePct = 0;
  let blendedRiskScore = 0;
  const tierDetails = table.map(({ tier, scheme }) => {
    const sharePct = shareOf(tier);
    blendedRatePct += (scheme?.indicativeRatePct ?? 0) * sharePct / 100;
    blendedRiskScore += (scheme?.riskScore ?? 2) * sharePct / 100;
    return {
      tier, sharePct,
      name: scheme?.name ?? tier,
      ratePct: scheme?.indicativeRatePct ?? 0,
      rateAsOf: scheme?.rateAsOf ?? null,
      shariahCompliant: scheme?.shariahCompliant ?? false,
      riskScore: scheme?.riskScore ?? 2,
      volatilityBps: scheme?.volatilityBps ?? 100,
      liquidityDays: scheme?.liquidityDays ?? 1,
      issuer: scheme?.issuer ?? '',
      sourceUrl: scheme?.sourceUrl ?? '',
    };
  });
  return { blendedRatePct, blendedRiskScore, allocation, tierDetails };
}

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
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { vaultParkingEnabled: true, vaultTier: true, vaultAutoCover: true, vaultAllocation: true } });
    const scheme = await tierScheme(prisma, user.vaultTier);
    const rates = await vaultRates(prisma, user);
    const state = await vaultState(prisma, req.auth!.userId, rates.blendedRatePct);
    res.json({
      enabled: user.vaultParkingEnabled, tier: user.vaultTier, tiers: VAULT_TIERS, autoCover: user.vaultAutoCover,
      balancePaisa: state.balance.toString(), accruedProfitPaisa: state.accrued.toString(),
      ratePct: rates.blendedRatePct, scheme: scheme ? { name: scheme.name, shariahCompliant: scheme.shariahCompliant, rateAsOf: scheme.rateAsOf } : null,
      allocation: rates.allocation, tierDetails: rates.tierDetails,
      blendedRatePct: rates.blendedRatePct, blendedRiskScore: rates.blendedRiskScore,
      mudaribFeePct: Number(FLOAT_MUDARIB_FEE_PCT), custodyStage: 'RECORD_ONLY',
    });
  } catch (error) { next(error); }
});

// Set the portion sizing. Percentages must be whole numbers summing to 100;
// any crypto share demands the same explicit acknowledgement as the tier
// switch — the API refuses a silent walk into a high-risk, non-Shariah asset.
router.post('/allocation', async (req, res, next) => {
  try {
    const { allocation, acknowledgeExtremeRisk } = z.object({
      allocation: z.record(z.enum(VAULT_TIERS), z.number().int().min(0).max(100)),
      acknowledgeExtremeRisk: z.boolean().optional(),
    }).parse(req.body);
    const entries = Object.entries(allocation).filter(([, pct]) => pct > 0);
    const total = entries.reduce((sum, [, pct]) => sum + pct, 0);
    if (total !== 100) return res.status(400).json({ error: 'Allocation percentages must add up to exactly 100' });
    if ((allocation.CRYPTO ?? 0) > 0 && acknowledgeExtremeRisk !== true) {
      return res.status(428).json({ error: 'Crypto is high-risk, not government-backed and not Shariah-compliant. Re-send with acknowledgeExtremeRisk: true to confirm you accept you could lose most of this portion.' });
    }
    for (const [tier] of entries) {
      const scheme = await tierScheme(prisma, tier);
      if (!scheme?.isActive) return res.status(409).json({ error: `The ${tier} sleeve is not available right now` });
    }
    // The largest share becomes the headline tier so older surfaces stay coherent.
    const primary = entries.sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'STANDARD';
    const user = await prisma.user.update({ where: { id: req.auth!.userId }, data: { vaultAllocation: JSON.stringify(Object.fromEntries(entries)), vaultTier: primary } });
    await audit(prisma, req.auth!.userId, 'VAULT_ALLOCATION_SET', 'User', user.id, { allocation: Object.fromEntries(entries), primary });
    const rates = await vaultRates(prisma, user);
    res.json({ allocation: rates.allocation, tier: user.vaultTier, blendedRatePct: rates.blendedRatePct, blendedRiskScore: rates.blendedRiskScore, tierDetails: rates.tierDetails });
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
    const { tier, acknowledgeExtremeRisk } = z.object({ tier: z.enum(VAULT_TIERS), acknowledgeExtremeRisk: z.boolean().optional() }).parse(req.body);
    // Crypto demands an explicit, per-request acknowledgement — the API itself
    // refuses a silent switch into an extreme-risk, non-Shariah asset.
    if (tier === 'CRYPTO' && acknowledgeExtremeRisk !== true) return res.status(428).json({ error: 'Crypto is high-risk, not government-backed and not Shariah-compliant. Re-send with acknowledgeExtremeRisk: true to confirm you accept you could lose most of this money.' });
    const scheme = await tierScheme(prisma, tier);
    if (!scheme?.isActive) return res.status(409).json({ error: 'That vault tier is not available right now' });
    // Switching the single tier clears any portion sizing — one control governs at a time.
    const user = await prisma.user.update({ where: { id: req.auth!.userId }, data: { vaultTier: tier, vaultAllocation: '' } });
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
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { vaultTier: true, vaultAllocation: true } });
    const rates = await vaultRates(prisma, user);
    const state = await vaultState(prisma, req.auth!.userId, rates.blendedRatePct);
    res.status(201).json({ balancePaisa: state.balance.toString(), accruedProfitPaisa: state.accrued.toString() });
  } catch (error) { next(error); }
});

router.post('/withdraw', async (req, res, next) => {
  try {
    const { idempotencyKey } = z.object({ idempotencyKey: z.string().min(8) }).parse(req.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { vaultTier: true, vaultAllocation: true } });
    const rates = await vaultRates(prisma, user);
    const result = await prisma.$transaction(async tx => {
      const state = await vaultState(tx, req.auth!.userId, rates.blendedRatePct);
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
