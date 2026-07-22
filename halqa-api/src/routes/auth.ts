import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, signAccess, signRefresh, verifyRefresh } from '../lib/auth';
import { logSecurity, newFamilyId } from '../lib/security';
import { earlyTurnUnlocked } from '../lib/score-bands';
import { feeDiscountBps, discountReason } from '../lib/discounts';
import { createHash } from 'node:crypto';

const router = Router();
const cleanPhone = (v: string) => v.replace(/\s+/g, '').replace(/^\+92/, '0');
const publicUser = { id: true, fullName: true, username: true, phone: true, email: true, cnic: true, creditScore: true, role: true, kycLevel: true, kycStatus: true, paymentStreak:true, averageRating:true, ratingCount:true, isBanned:true, defaultFlag:true, banReason:true, cooldownUntil:true, salaryAccountLinked:true, salaryAccountRef:true, phoneVerified:true, addressLine:true, city:true, occupationType:true, employerName:true, committeesCompletedClean:true, earlyTurnVerifiedAt:true, incomeVerifiedAt:true, chequeSecuredAt:true, cnicCaptured:true, createdAt: true } as const;
// Never send the PIN hash or biometric credential id to the client; we only
// expose booleans + the derived tenure/discount status the UI needs.
const pinHash = (pin: string) => createHash('sha256').update(`halqa-pin:${process.env.JWT_SECRET || 'dev'}:${pin}`).digest('hex');
const otpHash = (code: string) => createHash('sha256').update(`halqa-otp:${code}`).digest('hex');
const withHasPin = <T extends { pinHash?: string | null; biometricCredId?: string | null; creditScore: number; committeesCompletedClean: number; earlyTurnVerifiedAt: Date | null; incomeVerifiedAt: Date | null; chequeSecuredAt: Date | null; salaryAccountLinked: boolean }>(u: T) => {
  const { pinHash: _p, biometricCredId: _b, ...rest } = u;
  return { ...rest, hasPin: !!_p, hasBiometric: !!_b, earlyTurnUnlocked: earlyTurnUnlocked(u), feeDiscountBps: feeDiscountBps(u), discountReason: discountReason(u) };
};
const credentials = z.object({ identity: z.string().trim().min(1), password: z.string().min(8).max(128) });
const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');
// Passwords must mix letters and digits. 8-char floor is enforced by the zod
// schemas; this stops single-class passwords ("aaaaaaaa", "12345678").
const passwordStrongEnough=(pw:string)=>/[a-zA-Z]/.test(pw)&&/[0-9]/.test(pw);
// Account lockout: 5 straight failures lock sign-in for 15 minutes. The IP
// rate limiter alone can't stop a distributed slow brute-force against ONE
// account; this can. The response stays identical whether the password was
// right or wrong while locked, so probing a locked account leaks nothing.
const LOCK_AFTER=5, LOCK_MINUTES=15;
// Demo kill-switch: SECURITY_RELAXED=true in .env disables lockout, password
// policy and replay-burning for live demos with shared accounts. It can NEVER
// apply in production — the NODE_ENV guard hard-disables it there.
const relaxed=()=>process.env.SECURITY_RELAXED==='true'&&process.env.NODE_ENV!=='production';
// Timing defense: when the identity doesn't exist we still burn one bcrypt
// compare against this throwaway hash, so "user not found" and "wrong
// password" take the same time and usernames can't be enumerated by clock.
const DUMMY_HASH=bcrypt.hashSync('halqa-timing-defense-not-a-real-password', 12);

router.post('/register', async (req, res, next) => {
  try {
    const body = z.object({
      fullName: z.string().trim().min(2).max(80), username: z.string().trim().min(3).max(30),
      phone: z.string().trim().min(11).max(15), email: z.string().trim().email(), password: z.string().trim().min(8).max(128),
      referredBy: z.string().trim().min(3).max(30).optional(),
      // KYC-grade identity at signup (payment-app standard). CNIC optional at
      // the API so older clients keep working; the web form requires it.
      cnic: z.string().trim().regex(/^\d{13}$/, 'CNIC must be exactly 13 digits').optional(),
      // Version of the User Agreement / Privacy Policy shown at signup; its
      // acceptance is recorded in the security log as legal evidence.
      termsVersion: z.string().trim().max(20).optional(),
      // Underwriting profile + app PIN, all optional so older clients and the
      // test seeders keep registering unchanged.
      addressLine: z.string().trim().max(120).optional(),
      city: z.string().trim().max(60).optional(),
      occupationType: z.enum(['EMPLOYED','BUSINESS_OWNER','HOUSEWIFE','STUDENT','SELF_EMPLOYED','RETIRED','OTHER']).optional(),
      employerName: z.string().trim().max(80).optional(),
      pin: z.string().trim().regex(/^\d{4,6}$/, 'PIN must be 4 to 6 digits').optional(),
      cnicCaptured: z.boolean().optional(),
    }).parse(req.body);
    if (!relaxed() && !passwordStrongEnough(body.password)) return res.status(400).json({ error: 'Password must contain both letters and numbers' });
    const username = body.username.trim().toLowerCase();
    const email = body.email.trim().toLowerCase();
    const phone = cleanPhone(body.phone);
    const exists = await prisma.user.findFirst({ where: { OR: [{ username }, { email }, { phone }, ...(body.cnic ? [{ cnic: body.cnic }] : [])] } });
    if (exists) return res.status(409).json({ error: 'Username, email, phone, or CNIC already exists' });
    // Referral loyalty: an existing member's username can be named at signup;
    // the referrer earns a bonus (funded from Halqa's own Mudarib share) when
    // this member completes their first clean cycle. Invalid codes are ignored
    // silently — a typo must never block a signup.
    const referrer = body.referredBy ? await prisma.user.findUnique({ where: { username: body.referredBy.toLowerCase() } }) : null;
    // Identity ladder: Level 0 = nothing on file, Level 1 = CNIC recorded
    // (unlocks hosting), Level 2 = bank-verified (unlocks bank custody). A
    // signup that provides a CNIC starts at Level 1.
    // Phone ownership: mark verified if a fresh OTP was confirmed for this phone
    // in the last 30 minutes (the signup wizard does this before register).
    const phoneOtpOk = await prisma.securityEvent.findFirst({ where: { type: 'PHONE_OTP_VERIFIED', identity: phone, createdAt: { gt: new Date(Date.now() - 30 * 60_000) } } });
    const user = await prisma.user.create({ data: {
      fullName: body.fullName.trim(), username, email, phone, cnic: body.cnic ?? null, kycLevel: body.cnic ? 1 : 0,
      passwordHash: await bcrypt.hash(body.password, 12), referredById: referrer?.id ?? null,
      phoneVerified: !!phoneOtpOk,
      addressLine: body.addressLine ?? null, city: body.city ?? null, occupationType: body.occupationType ?? null,
      employerName: body.occupationType === 'EMPLOYED' ? (body.employerName ?? null) : null,
      pinHash: body.pin ? pinHash(body.pin) : null,
      cnicCaptured: body.cnicCaptured ?? false,
    }, select: { ...publicUser, pinHash: true, biometricCredId: true } });
    const payload = { userId: user.id, role: user.role };
    const refreshToken = signRefresh(payload);
    await prisma.refreshToken.create({ data: { tokenHash: tokenHash(refreshToken), userId: user.id, familyId: newFamilyId(), expiresAt: new Date(Date.now() + 30 * 86400000) } });
    await logSecurity(req, 'REGISTER', { userId: user.id, identity: username });
    // Timestamped acceptance of the User Agreement + Privacy Policy shown at
    // signup — the record a court asks for when a member claims "I never agreed".
    if (body.termsVersion) await logSecurity(req, 'TOS_ACCEPTED', { userId: user.id, identity: username, detail: `version ${body.termsVersion}` });
    res.status(201).json({ user: withHasPin(user), accessToken: signAccess(payload), refreshToken });
  } catch (error) { next(error); }
});

// Phone OTP at signup: request a 6-digit code for a phone number (no auth — the
// account does not exist yet). Stored hashed against the phone in the security
// log; delivered on the WhatsApp/SMS rail once a provider connects. In non-prod
// the code is returned inline so the demo flows end-to-end.
router.post('/phone-otp', async (req, res, next) => {
  try {
    const phone = cleanPhone(z.object({ phone: z.string().trim().min(11).max(15) }).parse(req.body).phone);
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await prisma.securityEvent.create({ data: { type: 'PHONE_OTP', identity: phone, detail: JSON.stringify({ codeHash: otpHash(code), expiresAt: Date.now() + 10 * 60_000 }) } });
    await logSecurity(req, 'PHONE_OTP_SENT', { identity: phone });
    res.status(201).json({ otpSent: true, ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {}) });
  } catch (error) { next(error); }
});
const OTP_MAX_ATTEMPTS = 5;
router.post('/phone-otp/verify', async (req, res, next) => {
  try {
    const body = z.object({ phone: z.string().trim().min(11).max(15), code: z.string().trim().regex(/^\d{6}$/) }).parse(req.body);
    const phone = cleanPhone(body.phone);
    const event = await prisma.securityEvent.findFirst({ where: { type: 'PHONE_OTP', identity: phone }, orderBy: { createdAt: 'desc' } });
    const detail = event?.detail ? JSON.parse(event.detail) as { codeHash: string; expiresAt: number; attempts?: number } : null;
    if (!detail || !event) return res.status(404).json({ error: 'Request a code first' });
    if (Date.now() > detail.expiresAt) return res.status(410).json({ error: 'The code expired — request a new one' });
    if (otpHash(body.code) !== detail.codeHash) {
      // Cap wrong guesses per code: after OTP_MAX_ATTEMPTS the code is burned so
      // a live OTP can't be brute-forced within its window (mirrors the password
      // lockout). The user must request a fresh code.
      const attempts = (detail.attempts ?? 0) + 1;
      if (attempts >= OTP_MAX_ATTEMPTS) await prisma.securityEvent.delete({ where: { id: event.id } });
      else await prisma.securityEvent.update({ where: { id: event.id }, data: { detail: JSON.stringify({ ...detail, attempts }) } });
      return res.status(400).json({ error: attempts >= OTP_MAX_ATTEMPTS ? 'Too many wrong attempts — request a new code' : 'Incorrect code' });
    }
    // Consume the code on success — single-use, so a stolen/known code cannot be
    // replayed even within the 10-minute window.
    await prisma.$transaction([
      prisma.securityEvent.delete({ where: { id: event.id } }),
      prisma.securityEvent.create({ data: { type: 'PHONE_OTP_VERIFIED', identity: phone } }),
    ]);
    res.json({ verified: true });
  } catch (error) { next(error); }
});

// App PIN: set (or change) the 4-6 digit PIN asked on every app open. Setting a
// PIN when one already exists requires the current PIN; first-time set is open
// to the authenticated session (the user just proved their password to log in).
router.post('/set-pin', requireAuth, async (req, res, next) => {
  try {
    const body = z.object({ pin: z.string().trim().regex(/^\d{4,6}$/, 'PIN must be 4 to 6 digits'), currentPin: z.string().trim().optional() }).parse(req.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { pinHash: true } });
    if (user.pinHash && user.pinHash !== pinHash(body.currentPin ?? '')) return res.status(403).json({ error: 'Current PIN is incorrect' });
    await prisma.user.update({ where: { id: req.auth!.userId }, data: { pinHash: pinHash(body.pin) } });
    await logSecurity(req, 'PIN_SET', { userId: req.auth!.userId });
    res.json({ hasPin: true });
  } catch (error) { next(error); }
});
// Verify the PIN on app open. Rate-limited by the /auth limiter; a wrong PIN
// never reveals whether one is set.
router.post('/verify-pin', requireAuth, async (req, res, next) => {
  try {
    const { pin } = z.object({ pin: z.string().trim().regex(/^\d{4,6}$/) }).parse(req.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId }, select: { pinHash: true } });
    if (!user.pinHash) return res.json({ verified: true, hasPin: false });
    if (user.pinHash !== pinHash(pin)) { await logSecurity(req, 'PIN_FAIL', { userId: req.auth!.userId }); return res.status(401).json({ error: 'Incorrect PIN' }); }
    res.json({ verified: true, hasPin: true });
  } catch (error) { next(error); }
});

// Optional biometric (fingerprint/Face) unlock. The client registers a WebAuthn
// platform credential and sends us its id so "biometric enabled" persists; the
// private key never leaves the device and the assertion is verified client-side
// on unlock. Send null to disable. Prototype-grade convenience over the PIN.
router.post('/set-biometric', requireAuth, async (req, res, next) => {
  try {
    const { credentialId } = z.object({ credentialId: z.string().trim().min(1).max(512).nullable() }).parse(req.body);
    await prisma.user.update({ where: { id: req.auth!.userId }, data: { biometricCredId: credentialId } });
    res.json({ hasBiometric: !!credentialId });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = credentials.parse(req.body);
    const value = body.identity.trim().toLowerCase();
    const phone = cleanPhone(value);
    const user = await prisma.user.findFirst({ where: { OR: [{ username: value }, { email: value }, { phone }] } });
    if (!relaxed() && user?.lockUntil && user.lockUntil > new Date()) { await logSecurity(req, 'ACCOUNT_LOCKED', { userId: user.id, identity: value }); return res.status(423).json({ error: 'Too many failed sign-ins. This account is temporarily locked — try again in a few minutes.' }); }
    const passwordOk = user ? await bcrypt.compare(body.password.trim(), user.passwordHash) : (await bcrypt.compare(body.password.trim(), DUMMY_HASH), false);
    if (!user || !passwordOk) {
      if (user && !relaxed()) {
        const fails = user.failedLogins + 1;
        const nowLocked = fails >= LOCK_AFTER;
        await prisma.user.update({ where: { id: user.id }, data: { failedLogins: fails, lockUntil: nowLocked ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null } });
        await logSecurity(req, nowLocked ? 'ACCOUNT_LOCKED' : 'LOGIN_FAIL', { userId: user.id, identity: value, detail: `attempt ${fails}` });
      } else await logSecurity(req, 'LOGIN_FAIL', { identity: value, detail: user ? 'relaxed mode — not counted' : 'unknown identity' });
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    if (user.failedLogins > 0 || user.lockUntil) await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockUntil: null } });
    const payload = { userId: user.id, role: user.role };
    const refreshToken = signRefresh(payload);
    await prisma.refreshToken.create({ data: { tokenHash: tokenHash(refreshToken), userId: user.id, familyId: newFamilyId(), expiresAt: new Date(Date.now() + 30 * 86400000) } });
    await logSecurity(req, 'LOGIN_OK', { userId: user.id, identity: value });
    const safe = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { ...publicUser, pinHash: true, biometricCredId: true } });
    res.json({ user: withHasPin(safe), accessToken: signAccess(payload), refreshToken });
  } catch (error) { next(error); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = z.object({ refreshToken: z.string() }).parse(req.body).refreshToken;
    const payload = verifyRefresh(token);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: tokenHash(token) } });
    if (!stored || stored.expiresAt < new Date()) return res.status(401).json({ error: 'Refresh token expired' });
    if (stored.userId !== payload.userId) return res.status(401).json({ error: 'Refresh token invalid' });
    // Reuse detection: a valid token that has ALREADY been rotated (revokedAt
    // set) can only mean it was captured and replayed. The legitimate client
    // holds the newer token; this request is the attacker. Burn the whole
    // family — every session descended from that login — and force re-auth.
    if (stored.revokedAt && !relaxed()) {
      await prisma.refreshToken.deleteMany({ where: { familyId: stored.familyId } });
      await logSecurity(req, 'TOKEN_REUSE_REVOKED', { userId: stored.userId, detail: `family ${stored.familyId} revoked on replay` });
      return res.status(401).json({ error: 'Session security alert: this session was revoked. Please sign in again.' });
    }
    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user) return res.status(403).json({ error: 'Account unavailable' });
    const nextPayload = { userId: user.id, role: user.role }; const nextRefresh = signRefresh(nextPayload);
    // Rotate in the SAME family: mark the old token revoked (kept as a tripwire
    // for replay), issue the successor. One-time-use tokens by construction.
    await prisma.$transaction([
      prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } }),
      prisma.refreshToken.create({ data: { tokenHash: tokenHash(nextRefresh), userId: user.id, familyId: stored.familyId, expiresAt: new Date(Date.now() + 30 * 86400000) } }),
    ]);
    await logSecurity(req, 'TOKEN_REFRESH', { userId: user.id });
    res.json({ accessToken: signAccess(nextPayload), refreshToken: nextRefresh });
  } catch (error) { next(error); }
});

router.post('/logout',requireAuth,async(req,res)=>{const token=z.object({refreshToken:z.string().optional()}).parse(req.body).refreshToken;
  // Revoke the whole family the presented token belongs to (not just that one
  // row), so logging out truly ends the session chain rather than leaving
  // rotated siblings alive.
  if(token){const row=await prisma.refreshToken.findUnique({where:{tokenHash:tokenHash(token)}});if(row)await prisma.refreshToken.deleteMany({where:{familyId:row.familyId}});}
  else await prisma.refreshToken.deleteMany({where:{userId:req.auth!.userId}});
  await logSecurity(req,'LOGOUT',{userId:req.auth!.userId});res.status(204).end()});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: { ...publicUser, pinHash: true, biometricCredId: true } });
  res.json(user ? withHasPin(user) : user);
});

// Change password (logged-in). Closes the audited "no way to rotate a
// password" gap; revokes every refresh token so stolen sessions die with it.
router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    // The CURRENT password is only compared, never validated — a member whose
    // legacy password is short must still be able to change it. Only the NEW
    // password carries the length/strength rules.
    const body = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(8).max(128) }).parse(req.body);
    const user = await prisma.user.findUniqueOrThrow({ where: { id: req.auth!.userId } });
    if (!(await bcrypt.compare(body.currentPassword.trim(), user.passwordHash))) return res.status(401).json({ error: 'Current password is incorrect' });
    if (body.currentPassword.trim() === body.newPassword.trim()) return res.status(400).json({ error: 'The new password must be different' });
    if (!relaxed() && !passwordStrongEnough(body.newPassword.trim())) return res.status(400).json({ error: 'Password must contain both letters and numbers' });
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(body.newPassword.trim(), 12) } }),
      prisma.refreshToken.deleteMany({ where: { userId: user.id } }),
    ]);
    await logSecurity(req, 'PASSWORD_CHANGED', { userId: user.id });
    res.json({ message: 'Password updated. Other sessions were signed out.' });
  } catch (error) { next(error); }
});

export default router;
