import type { Request } from 'express';
import { randomUUID } from 'node:crypto';
import { prisma } from '../db';

// One place to record every security-relevant event to an append-only table.
// Writes are best-effort: a logging failure must never break the auth flow it
// is observing (that would turn the audit log into a denial-of-service lever).
export type SecurityEventType =
  | 'REGISTER' | 'LOGIN_OK' | 'LOGIN_FAIL' | 'ACCOUNT_LOCKED'
  | 'PASSWORD_CHANGED' | 'TOKEN_REFRESH' | 'TOKEN_REUSE_REVOKED' | 'LOGOUT'
  | 'TOS_ACCEPTED';

// Prefer the real client IP behind a proxy, but never trust a forwarded header
// blindly for anything but logging (it is attacker-settable).
export const clientIp = (req: Request) =>
  (req.headers['x-forwarded-for']?.toString().split(',')[0].trim()) || req.socket.remoteAddress || 'unknown';

export async function logSecurity(
  req: Request,
  type: SecurityEventType,
  fields: { userId?: string | null; identity?: string | null; detail?: string } = {},
) {
  try {
    await prisma.securityEvent.create({
      data: {
        type,
        userId: fields.userId ?? null,
        identity: fields.identity ?? null,
        ip: clientIp(req),
        userAgent: req.headers['user-agent']?.toString().slice(0, 300) ?? null,
        detail: fields.detail ?? null,
      },
    });
  } catch { /* logging is best-effort — never block auth on an audit write */ }
}

export const newFamilyId = () => randomUUID();

// Boot-time secret validation. Weak or default signing secrets are the single
// most common catastrophic auth flaw: with a guessable secret, an attacker
// forges valid tokens for any account and no lockout or hashing can stop them.
// In production we refuse to start; in dev we warn loudly.
export function assertSecretsStrong() {
  const problems: string[] = [];
  const access = process.env.JWT_SECRET || '';
  const refresh = process.env.JWT_REFRESH_SECRET || '';
  const weak = new Set(['secret', 'changeme', 'jwt', 'dev', 'halqa', 'password', '']);
  for (const [name, value] of [['JWT_SECRET', access], ['JWT_REFRESH_SECRET', refresh]] as const) {
    if (!value) problems.push(`${name} is not set`);
    else if (value.length < 32) problems.push(`${name} is shorter than 32 chars`);
    else if (weak.has(value.toLowerCase())) problems.push(`${name} is a well-known weak value`);
  }
  if (access && refresh && access === refresh) problems.push('JWT_SECRET and JWT_REFRESH_SECRET must differ (an access token could otherwise be replayed as a refresh token)');
  if (problems.length) {
    const message = `Insecure JWT configuration: ${problems.join('; ')}`;
    if (process.env.NODE_ENV === 'production') throw new Error(message);
    console.warn(`[security] ${message} — refusing would be enforced in production.`);
  }
}
