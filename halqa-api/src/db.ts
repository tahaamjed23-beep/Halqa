import { PrismaClient } from '@prisma/client';

// Serverless connection hygiene. On Vercel, many function instances each open
// their own Prisma pool against Supabase's pgbouncer; the default pool of 5 per
// instance exhausted the shared pooler under load (P2024: "Timed out fetching a
// new connection", then the 30s function timed out). Pinning connection_limit=1
// per instance keeps pgbouncer from being overwhelmed. We append the param to
// the existing DATABASE_URL at runtime, so no secret is ever read or rewritten.
const withPoolLimit = (raw?: string) => {
  if (!raw) return raw;
  if (/[?&]connection_limit=/.test(raw)) return raw;
  return `${raw}${raw.includes('?') ? '&' : '?'}connection_limit=1&pool_timeout=20`;
};

export const prisma = new PrismaClient({
  datasources: { db: { url: withPoolLimit(process.env.DATABASE_URL) } },
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  // Serverless + a cross-region pooler makes multi-write transactions (circle
  // start, payout advance) legitimately slow; the 5s default expired mid-start
  // in production (P2028). Budget stays under the function's 30s ceiling.
  transactionOptions: { maxWait: 10_000, timeout: 25_000 },
});

// WHY THERE IS NO MIDDLEWARE HERE.
//
// Auditing every write at this layer was tried on 2026-10-07 and taken out
// again. It worked, and it cost too much: an audit insert after every create,
// update and delete DOUBLED the round trips of every request, took the test
// suite from 34 seconds to 536, and broke 39 tests whose cleanups delete many
// rows and so produced an entry each. On a serverless function against a
// cross-region pooler, doubling the round trips of a payment is not a trade
// worth making for a row that says less than the one the handler writes.
//
// So the entries stay where they were: written by the handler, inside the same
// transaction as the change, carrying the detail only the handler knows. The
// gaps are closed one by one and tests/audit-coverage.test.ts is what keeps
// them closed, by failing when a write path has no entry.
