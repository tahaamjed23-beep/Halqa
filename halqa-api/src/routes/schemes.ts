import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAdmin, requireAuth } from '../lib/auth';
import { paisaInput, projectionBand } from '../lib/money';
import { audit } from '../lib/audit';

const router = Router();
const schemeInput = z.object({
  name: z.string().min(2), slug: z.string().regex(/^[a-z0-9-]+$/), category: z.string().min(2),
  issuer: z.string().min(2), tenorDays: z.number().int().positive(), indicativeRatePct: z.number().min(0).max(100),
  minAmountPaisa: paisaInput, shariahCompliant: z.boolean(),
  rateAsOf: z.coerce.date(), sourceUrl: z.string().url(), isActive: z.boolean().default(true),
  riskScore: z.number().int().min(1).max(10).default(2), liquidityDays: z.number().int().min(0).max(3650).default(1),
  volatilityBps: z.number().int().min(0).max(10000).default(100), creditRiskBps: z.number().int().min(0).max(10000).default(50),
  regulatoryStatus: z.string().min(2).max(80).default('CURATED'), eligibilityNotes: z.string().max(500).nullable().optional(),
});

router.get('/', async (_req, res) => res.json(await prisma.scheme.findMany({ where: { isActive: true }, orderBy: [{ riskScore: 'asc' }, { indicativeRatePct: 'desc' }] })));
router.get('/:id/projection', async (req, res, next) => {
  try {
    const query = z.object({ principal: z.string().regex(/^\d{1,15}$/), days: z.coerce.number().int().min(1).max(3650) }).parse(req.query);
    const scheme = await prisma.scheme.findUnique({ where: { id: req.params.id } });
    if (!scheme) return res.status(404).json({ error: 'Scheme not found' });
    const principalPaisa = BigInt(query.principal);
    res.json({ scheme, principalPaisa, days: query.days, ...projectionBand(principalPaisa, scheme.indicativeRatePct, query.days), disclaimer: 'Indicative only. Returns not guaranteed. Not investment advice.' });
  } catch (error) { next(error); }
});
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const input = schemeInput.parse(req.body);
    const riskLevel = input.riskScore <= 3 ? 'low' : input.riskScore <= 6 ? 'medium' : input.riskScore <= 8 ? 'high' : 'extreme';
    const scheme = await prisma.scheme.create({ data: { ...input, riskLevel } });
    await audit(prisma, req.auth!.userId, 'SCHEME_CREATED', 'Scheme', scheme.id, { slug: scheme.slug });
    res.status(201).json(scheme);
  } catch (error) { next(error); }
});

router.patch('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const input = schemeInput.partial().parse(req.body);
    const current = await prisma.scheme.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ error: 'Scheme not found' });
    const riskScore = input.riskScore ?? current.riskScore;
    const scheme = await prisma.scheme.update({ where: { id: current.id }, data: { ...input, riskLevel: riskScore <= 3 ? 'low' : riskScore <= 6 ? 'medium' : riskScore <= 8 ? 'high' : 'extreme' } });
    await audit(prisma, req.auth!.userId, 'SCHEME_UPDATED', 'Scheme', scheme.id, { changedFields: Object.keys(input) });
    res.json(scheme);
  } catch (error) { next(error); }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const current = await prisma.scheme.findUnique({ where: { id: req.params.id } });
    if (!current) return res.status(404).json({ error: 'Scheme not found' });
    const scheme = await prisma.scheme.update({ where: { id: current.id }, data: { isActive: false } });
    await audit(prisma, req.auth!.userId, 'SCHEME_DEACTIVATED', 'Scheme', scheme.id, {});
    res.json(scheme);
  } catch (error) { next(error); }
});

export default router;
