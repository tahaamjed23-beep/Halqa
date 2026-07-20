import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, signAccess, signRefresh, verifyRefresh } from '../lib/auth';
import { createHash } from 'node:crypto';

const router = Router();
const cleanPhone = (v: string) => v.replace(/\s+/g, '').replace(/^\+92/, '0');
const publicUser = { id: true, fullName: true, username: true, phone: true, email: true, creditScore: true, role: true, kycLevel: true, kycStatus: true, paymentStreak:true, averageRating:true, ratingCount:true, isBanned:true, defaultFlag:true, banReason:true, cooldownUntil:true, createdAt: true } as const;
const credentials = z.object({ identity: z.string().trim().min(1), password: z.string().min(8).max(128) });
const tokenHash=(token:string)=>createHash('sha256').update(token).digest('hex');

router.post('/register', async (req, res, next) => {
  try {
    const body = z.object({
      fullName: z.string().trim().min(2).max(80), username: z.string().trim().min(3).max(30),
      phone: z.string().trim().min(11).max(15), email: z.string().trim().email(), password: z.string().trim().min(8).max(128),
    }).parse(req.body);
    const username = body.username.trim().toLowerCase();
    const email = body.email.trim().toLowerCase();
    const phone = cleanPhone(body.phone);
    const exists = await prisma.user.findFirst({ where: { OR: [{ username }, { email }, { phone }] } });
    if (exists) return res.status(409).json({ error: 'Username, email, or phone already exists' });
    const user = await prisma.user.create({ data: { fullName: body.fullName.trim(), username, email, phone, passwordHash: await bcrypt.hash(body.password, 12) }, select: publicUser });
    const payload = { userId: user.id, role: user.role };
    const refreshToken = signRefresh(payload);
    await prisma.refreshToken.create({ data: { tokenHash: tokenHash(refreshToken), userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400000) } });
    res.status(201).json({ user, accessToken: signAccess(payload), refreshToken });
  } catch (error) { next(error); }
});

router.post('/login', async (req, res, next) => {
  try {
    const body = credentials.parse(req.body);
    const value = body.identity.trim().toLowerCase();
    const phone = cleanPhone(value);
    const user = await prisma.user.findFirst({ where: { OR: [{ username: value }, { email: value }, { phone }] } });
    if (!user || !(await bcrypt.compare(body.password.trim(), user.passwordHash))) return res.status(401).json({ error: 'Invalid username or password' });
    const payload = { userId: user.id, role: user.role };
    const refreshToken = signRefresh(payload);
    await prisma.refreshToken.create({ data: { tokenHash: tokenHash(refreshToken), userId: user.id, expiresAt: new Date(Date.now() + 30 * 86400000) } });
    const safe = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: publicUser });
    res.json({ user: safe, accessToken: signAccess(payload), refreshToken });
  } catch (error) { next(error); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const token = z.object({ refreshToken: z.string() }).parse(req.body).refreshToken;
    const payload = verifyRefresh(token);
    const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: tokenHash(token) } });
    if (!stored || stored.expiresAt < new Date()) return res.status(401).json({ error: 'Refresh token expired' });
    if(stored.userId!==payload.userId)return res.status(401).json({error:'Refresh token invalid'});
    const user=await prisma.user.findUnique({where:{id:stored.userId}});
    if(!user)return res.status(403).json({error:'Account unavailable'});
    const nextPayload={userId:user.id,role:user.role};const nextRefresh=signRefresh(nextPayload);
    await prisma.$transaction([prisma.refreshToken.delete({where:{id:stored.id}}),prisma.refreshToken.create({data:{tokenHash:tokenHash(nextRefresh),userId:user.id,expiresAt:new Date(Date.now()+30*86400000)}})]);
    res.json({ accessToken: signAccess(nextPayload), refreshToken: nextRefresh });
  } catch (error) { next(error); }
});

router.post('/logout',requireAuth,async(req,res)=>{const token=z.object({refreshToken:z.string().optional()}).parse(req.body).refreshToken;await prisma.refreshToken.deleteMany({where:{userId:req.auth!.userId,...(token?{tokenHash:tokenHash(token)}:{})}});res.status(204).end()});

router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.auth!.userId }, select: publicUser });
  res.json(user);
});

export default router;
