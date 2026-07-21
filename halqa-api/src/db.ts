import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  // Serverless + a cross-region pooler makes multi-write transactions (circle
  // start, payout advance) legitimately slow; the 5s default expired mid-start
  // in production (P2028). Budget stays under the function's 30s ceiling.
  transactionOptions: { maxWait: 10_000, timeout: 25_000 },
});
