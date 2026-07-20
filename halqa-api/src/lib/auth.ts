import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type { Role } from '@prisma/client';
import { prisma } from '../db';

type TokenPayload = { userId: string; role: Role };
const accessSecret = () => process.env.JWT_SECRET!;
const refreshSecret = () => process.env.JWT_REFRESH_SECRET!;

export const signAccess = (payload: TokenPayload) => jwt.sign(payload, accessSecret(), { expiresIn: '30m' });
// jwtid makes every refresh token globally unique even when two are signed in
// the same second — required now that rotation keeps old tokens as replay
// tripwires (identical tokens would collide on the unique tokenHash).
export const signRefresh = (payload: TokenPayload) => jwt.sign(payload, refreshSecret(), { expiresIn: '30d', jwtid: randomUUID() });
export const verifyRefresh = (token: string) => jwt.verify(token, refreshSecret()) as TokenPayload;

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.auth = jwt.verify(token, accessSecret()) as TokenPayload;
    return next();
  } catch {
    return res.status(401).json({ error: 'Session expired' });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.auth?.role !== 'ADMIN') return res.status(403).json({ error: 'Admin access required' });
  const admin = await prisma.user.findUnique({ where: { id: req.auth.userId }, select: { role: true, isBanned: true } });
  if (!admin || admin.role !== 'ADMIN' || admin.isBanned) return res.status(403).json({ error: 'Admin access required' });
  return next();
}
