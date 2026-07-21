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
