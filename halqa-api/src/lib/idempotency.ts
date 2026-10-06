// ---------------------------------------------------------------------------
// DOING A THING ONCE
//
// Work register, per endpoint: "idempotency key accepted and enforced".
//
// Accepted it already was: six routes take an idempotencyKey and pass it to the
// ledger, which carries a unique constraint on it, so money has never been at
// risk of being posted twice. What was missing is the layer above that.
//
// A client on a Pakistani mobile network loses a response often. It retries,
// because retrying is the right thing to do. The retry reached the ledger's
// unique constraint and came back as a 409 conflict, which to the client is
// indistinguishable from "your payment failed". So the member pays again, by
// hand, and now there are two payments and a support case.
//
// The fix is not to stop the duplicate: the ledger already does that. It is to
// give the retry the SAME ANSWER the first attempt gave, so a lost response is
// a lost response rather than a false failure.
//
// Scope. The key is scoped to the member and the route. One member cannot
// replay or block another member's request by guessing a key, and the same key
// sent to a different action is a different request rather than a replay of the
// wrong one.
//
// Window. A record is kept for 24 hours. Long enough to cover any retry a real
// client makes, short enough that a key reused next month is a new request.
// ---------------------------------------------------------------------------
import type { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { jsonSafe } from './money';

/** How long a completed request is remembered. */
export const WINDOW_HOURS = 24;

/**
 * The key a client sends. Long enough that two clients do not collide by
 * accident, short enough to index.
 */
export const idempotencyKey = z.string().trim().min(8).max(128);

export type Replayed<T> = { replayed: true; statusCode: number; body: T };
export type Fresh<T> = { replayed: false; statusCode: number; body: T };
export type Outcome<T> = Replayed<T> | Fresh<T>;

/**
 * Runs `work` once for this member, this route and this key.
 *
 * A second call with the same three returns what the first one answered,
 * including its status code, without running the work again.
 *
 * The record is written in the SAME transaction as the work wherever the work
 * takes one: a record written afterwards can be lost between the two, and then
 * the retry runs the work a second time, which is the whole thing this exists
 * to prevent. Where the work manages its own transaction, it is handed the
 * transaction client to use.
 */
export async function once<T>(
  prisma: PrismaClient,
  args: { userId: string; route: string; key: string },
  work: (tx: Prisma.TransactionClient) => Promise<{ statusCode: number; body: T }>,
): Promise<Outcome<T>> {
  const where = { userId_route_key: { userId: args.userId, route: args.route, key: args.key } };

  const seen = await prisma.idempotencyRecord.findUnique({ where });
  if (seen) {
    return { replayed: true, statusCode: seen.statusCode, body: seen.responseJson as T };
  }

  try {
    return await prisma.$transaction(async tx => {
      const result = await work(tx);
      await tx.idempotencyRecord.create({
        data: {
          key: args.key,
          userId: args.userId,
          route: args.route,
          statusCode: result.statusCode,
          responseJson: jsonSafe(result.body) as Prisma.InputJsonValue,
        },
      });
      return { replayed: false as const, statusCode: result.statusCode, body: result.body };
    });
  } catch (error) {
    // Two requests with the same key arriving at the same moment: one commits,
    // the other loses the race on the unique constraint. The loser is a retry
    // like any other, so it reads what the winner wrote rather than failing.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const winner = await prisma.idempotencyRecord.findUnique({ where });
      if (winner) {
        return { replayed: true, statusCode: winner.statusCode, body: winner.responseJson as T };
      }
    }
    throw error;
  }
}

/**
 * Removes records past the window.
 *
 * Returns how many went, so a caller can log it. Nothing depends on this having
 * run: an old record is harmless, it is only a row.
 */
export async function sweep(prisma: PrismaClient, now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - WINDOW_HOURS * 3_600_000);
  const { count } = await prisma.idempotencyRecord.deleteMany({ where: { createdAt: { lt: cutoff } } });
  return count;
}

/** True when this record is old enough to sweep. Separated so it can be tested. */
export const isExpired = (createdAt: Date, now = new Date()): boolean =>
  now.getTime() - createdAt.getTime() >= WINDOW_HOURS * 3_600_000;
