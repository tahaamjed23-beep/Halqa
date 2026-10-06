// Per route rate limits. Work register item: "Per route rate limits, tighter on
// sign in, codes and financial actions".
//
// Before this file the service had ONE global limit of 1,500 requests in 15
// minutes, which is no limit at all for the routes that matter: a single
// address could try 1,500 PINs, or ask for 1,500 one time codes at the SMS
// provider's expense, and never touch the ceiling.
//
// Limits are counted per member where the request is signed in, and per address
// otherwise, so one bad address cannot lock out a whole office behind the same
// connection, and one stolen session cannot hide behind a clean address.
import rateLimit, { ipKeyGenerator, type Options } from 'express-rate-limit';
import type { Request } from 'express';
import { errorBody } from './errors';

const relaxed = () => process.env.SECURITY_RELAXED === 'true';
const production = () => process.env.NODE_ENV === 'production';

// In a relaxed demo and in the test suites the ceilings lift, so a seeded run
// is not throttled. They are never lifted in production.
const scale = (limit: number) => production() ? limit : relaxed() ? limit * 100 : limit * 20;

// Keyed on the member when the request is signed in, and on the address
// otherwise. The address goes through ipKeyGenerator, which collapses an IPv6
// address to its /64: a single IPv6 subscriber is normally handed a whole /64,
// so keying on the full address let one caller walk through billions of
// addresses and never reach any ceiling. Using the raw req.ip here was a hole
// in every limit below, for IPv6 callers only, and the library says so out
// loud at startup.
const keyBy = (req: Request) =>
  (req as Request & { auth?: { userId?: string } }).auth?.userId ?? (req.ip ? ipKeyGenerator(req.ip) : 'unknown');

const make = (windowMinutes: number, limit: number, extra: Partial<Options> = {}) => rateLimit({
  windowMs: windowMinutes * 60_000,
  limit: scale(limit),
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: keyBy,
  handler: (_req, res) => res.status(429).json(errorBody('TOO_MANY_REQUESTS')),
  ...extra,
});

export const limits = {
  // Signing in and proving who you are. Tight: these are the brute force paths.
  signIn: () => make(15, 20),
  // One time codes cost money to send and are a spam vector.
  code: () => make(15, 5),
  // Anything that moves money or changes where money goes.
  financial: () => make(15, 30),
  // Ordinary writes: joining, posting, editing.
  write: () => make(15, 120),
  // Reads. Generous, but not unlimited.
  read: () => make(15, 600),
  // Administrative consoles, which only named administrators reach anyway.
  admin: () => make(15, 300),
};

// The class a router falls into when nothing more specific is set.
export const routerLimit = {
  auth: limits.signIn,
  payments: limits.financial,
  exchange: limits.financial,
  exits: limits.financial,
  rewards: limits.write,
  committees: limits.write,
  agreements: limits.write,
  profile: limits.write,
  account: limits.write,
  protection: limits.write,
  partner: limits.read,
  risk: limits.read,
  notifications: limits.read,
  support: limits.write,
  chat: limits.write,
} as const;
