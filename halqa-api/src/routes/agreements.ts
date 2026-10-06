import { Router } from 'express';
import { safeRouter } from '../lib/safe-router';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth } from '../lib/auth';
import { assertMember } from '../lib/guards';
import { audit } from '../lib/audit';
import { clientIp } from '../lib/security';
import {
  MUTUAL_PG_VERSION, PLATFORM_UNDERTAKING_VERSION, UNDERTAKING_VALID_DAYS,
  hashText, mutualPgText, platformUndertakingText,
} from '../lib/agreements';

// safeRouter, not Router: a rejected promise in any handler below reaches the
// error handler instead of hanging the request (lib/safe-router.ts).
const router = safeRouter();
router.use(requireAuth);

// Drives the signing overlay: is the weekly undertaking live, and (optionally)
// has the caller signed the mutual PG for a specific circle?
router.get('/status', async (req, res, next) => {
  try {
    const userId = req.auth!.userId;
    const now = new Date();
    const undertaking = await prisma.agreementSignature.findFirst({ where: { userId, docType: 'PLATFORM_UNDERTAKING', version: PLATFORM_UNDERTAKING_VERSION }, orderBy: { signedAt: 'desc' } });
    const committeeId = typeof req.query.committeeId === 'string' ? req.query.committeeId : undefined;
    const mutualPg = committeeId
      ? await prisma.agreementSignature.findFirst({ where: { userId, committeeId, docType: 'MUTUAL_PG', version: MUTUAL_PG_VERSION }, orderBy: { signedAt: 'desc' } })
      : null;
    res.json({
      undertaking: undertaking ? { signedAt: undertaking.signedAt, expiresAt: undertaking.expiresAt, fresh: Boolean(undertaking.expiresAt && undertaking.expiresAt > now) } : { signedAt: null, expiresAt: null, fresh: false },
      renewalDays: UNDERTAKING_VALID_DAYS,
      mutualPg: mutualPg ? { signedAt: mutualPg.signedAt } : null,
    });
  } catch (error) { next(error); }
});

// The exact text the member signs (personalised, versioned, hashed).
router.get('/text', async (req, res, next) => {
  try {
    // An unrecognised doc used to fall through to the undertaking, so a typo in
    // the parameter showed the member a DIFFERENT legal document and said
    // nothing. For a paper somebody is about to sign that is the one default
    // that cannot be allowed to be quiet. Absent still means the undertaking,
    // which is what every existing client relies on.
    const asked = req.query.doc;
    if (asked !== undefined && asked !== 'MUTUAL_PG' && asked !== 'PLATFORM_UNDERTAKING') {
      return res.status(400).json({ error: 'Ask for PLATFORM_UNDERTAKING or MUTUAL_PG' });
    }
    const doc = asked === 'MUTUAL_PG' ? 'MUTUAL_PG' : 'PLATFORM_UNDERTAKING';
    if (doc === 'MUTUAL_PG') {
      const committeeId = typeof req.query.committeeId === 'string' ? req.query.committeeId : '';
      if (!committeeId) return res.status(400).json({ error: 'committeeId is required for the mutual guarantee text' });
      const committee = await prisma.committee.findUnique({ where: { id: committeeId } });
      if (!committee) return res.status(404).json({ error: 'Committee not found' });
      // Members read the guarantee they signed; PROSPECTIVE members read it
      // before joining a forming circle — the contract is shown, not sprung.
      if (committee.status !== 'FORMING') await assertMember(committeeId, req.auth!.userId);
      const text = mutualPgText(committee.name, committee.contributionPaisa, committee.memberCap, committee.cycleNumber);
      return res.json({ doc, version: MUTUAL_PG_VERSION, text, textHash: hashText(text) });
    }
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId } });
    const text = platformUndertakingText(user.fullName, user.cnic);
    res.json({ doc, version: PLATFORM_UNDERTAKING_VERSION, text, textHash: hashText(text), renewalDays: UNDERTAKING_VALID_DAYS });
  } catch (error) { next(error); }
});

// E-sign. The undertaking is renewable (7-day validity, a new row per
// renewal); the mutual PG is recorded per committee — normally written
// automatically at join, this endpoint lets a member (re)sign explicitly.
router.post('/sign', async (req, res, next) => {
  try {
    const input = z.object({
      doc: z.enum(['PLATFORM_UNDERTAKING', 'MUTUAL_PG']), committeeId: z.string().optional(), accept: z.literal(true),
      // Adopted digital signature: the member types their full legal name
      // (verified against the account) and may add a drawn signature (small
      // PNG data-URL). Required for the undertaking — a checkbox is not a sign.
      signedName: z.string().trim().min(3).max(120).optional(),
      signatureData: z.string().startsWith('data:image/png;base64,').max(80_000).optional(),
    }).parse(req.body);
    const userId = req.auth!.userId;
    const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const normalize = (value: string) => value.trim().replace(/\s+/g, ' ').toLowerCase();
    if (input.doc === 'PLATFORM_UNDERTAKING') {
      if (!input.signedName) return res.status(400).json({ error: 'Type your full legal name as your signature' });
      if (normalize(input.signedName) !== normalize(user.fullName)) return res.status(400).json({ error: `The signature must match the account name exactly: ${user.fullName}` });
    }
    if (input.doc === 'MUTUAL_PG') {
      if (!input.committeeId) return res.status(400).json({ error: 'committeeId is required for the mutual guarantee' });
      await assertMember(input.committeeId, userId);
      const committee = await prisma.committee.findUniqueOrThrow({ where: { id: input.committeeId } });
      const text = mutualPgText(committee.name, committee.contributionPaisa, committee.memberCap, committee.cycleNumber);
      const row = await prisma.$transaction(async tx => {
        const row = await tx.agreementSignature.create({ data: { userId, committeeId: committee.id, docType: 'MUTUAL_PG', version: MUTUAL_PG_VERSION, textHash: hashText(text), ip: clientIp(req) } });
        await audit(tx, userId, 'MUTUAL_PG_SIGNED', 'Committee', committee.id, { version: MUTUAL_PG_VERSION, textHash: row.textHash });
        return row;
      });
      return res.status(201).json({ signedAt: row.signedAt, version: row.version, textHash: row.textHash });
    }
    const text = platformUndertakingText(user.fullName, user.cnic);
    const expiresAt = new Date(Date.now() + UNDERTAKING_VALID_DAYS * 86_400_000);
    const row = await prisma.$transaction(async tx => {
      const row = await tx.agreementSignature.create({ data: { userId, docType: 'PLATFORM_UNDERTAKING', version: PLATFORM_UNDERTAKING_VERSION, textHash: hashText(text), signedName: input.signedName, signatureData: input.signatureData, expiresAt, ip: clientIp(req) } });
      await audit(tx, userId, 'PLATFORM_UNDERTAKING_SIGNED', 'User', userId, { version: PLATFORM_UNDERTAKING_VERSION, textHash: row.textHash, signedName: input.signedName, hasDrawnSignature: Boolean(input.signatureData), expiresAt: expiresAt.toISOString() });
      return row;
    });
    res.status(201).json({ signedAt: row.signedAt, expiresAt, version: row.version, textHash: row.textHash });
  } catch (error) { next(error); }
});

export default router;
