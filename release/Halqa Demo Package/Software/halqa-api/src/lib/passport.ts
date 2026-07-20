import { createHmac, timingSafeEqual } from 'node:crypto';
import { prisma } from '../db';
import { reputationFor } from './reputation';

// The Halqa Credit Passport: a signed, shareable snapshot of a member's verified
// committee history. ~100M Pakistanis have committee payment discipline and zero
// credit-bureau footprint; this makes that history portable with the member's
// consent. Stateless HMAC token — anyone with the token can verify it against
// the public /api/verify endpoint without an account.
const secret = () => process.env.PASSPORT_SECRET || process.env.JWT_SECRET || '';
const b64url = (value: Buffer | string) => Buffer.from(value).toString('base64url');

export interface PassportPayload {
  v: 1;
  userId: string;
  fullName: string;
  username: string;
  memberSince: string;
  creditScore: number;
  cleanCompletions: number;
  hostedCompleted: number;
  paymentsResolved: number;
  onTimePct: number | null;
  missedPayments: number;
  totalRecordedPaisa: string;
  defaultFlag: boolean;
  generatedAt: string;
  expiresAt: string;
}

export async function issuePassport(userId: string): Promise<{ token: string; passport: PassportPayload } | null> {
  const reputation = await reputationFor(userId);
  if (!reputation) return null;
  const recorded = await prisma.payment.aggregate({ where: { payerId: userId, status: 'PAID' }, _sum: { amountPaisa: true } });
  const now = new Date();
  const passport: PassportPayload = {
    v: 1,
    userId: reputation.userId,
    fullName: reputation.fullName,
    username: reputation.username,
    memberSince: new Date(reputation.memberSince).toISOString(),
    creditScore: reputation.creditScore,
    cleanCompletions: reputation.cleanCompletions,
    hostedCompleted: reputation.hostedCompleted,
    paymentsResolved: reputation.paymentsResolved,
    onTimePct: reputation.onTimePct,
    missedPayments: reputation.missedPayments,
    totalRecordedPaisa: (recorded._sum.amountPaisa ?? 0n).toString(),
    defaultFlag: reputation.defaultFlag,
    generatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 90 * 86_400_000).toISOString(),
  };
  const body = b64url(JSON.stringify(passport));
  const signature = createHmac('sha256', secret()).update(body).digest('base64url');
  return { token: `${body}.${signature}`, passport };
}

export function verifyPassport(token: string): { valid: true; passport: PassportPayload } | { valid: false; reason: string } {
  const parts = token.split('.');
  if (parts.length !== 2) return { valid: false, reason: 'Malformed passport token' };
  const [body, signature] = parts;
  const expected = createHmac('sha256', secret()).update(body).digest();
  let provided: Buffer;
  try { provided = Buffer.from(signature, 'base64url'); } catch { return { valid: false, reason: 'Malformed signature' }; }
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return { valid: false, reason: 'Signature does not match. The document was altered or not issued by Halqa.' };
  let passport: PassportPayload;
  try { passport = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')); } catch { return { valid: false, reason: 'Malformed passport body' }; }
  if (passport.v !== 1) return { valid: false, reason: 'Unsupported passport version' };
  if (new Date(passport.expiresAt).getTime() < Date.now()) return { valid: false, reason: `Passport expired on ${new Date(passport.expiresAt).toLocaleDateString()}. Ask the member for a fresh one.` };
  return { valid: true, passport };
}
