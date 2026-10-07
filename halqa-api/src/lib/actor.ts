// ---------------------------------------------------------------------------
// WHO IS DOING THIS
//
// Work register AF3, per model: "every change recorded in the audit log with
// the actor".
//
// Sixty write sites across the routes, and whether each one wrote an audit
// entry depended on whoever wrote that line remembering to. A count of them on
// 2026-10-07 found roughly a quarter with no entry at all: five of eight writes
// to Payment, three of five to Round, four of eleven to Committee. Adding the
// missing ones by hand fixes today and nothing else, because the next write
// somebody adds is a coin toss again.
//
// So the actor is carried on the request instead, and the Prisma layer writes
// the entry. A handler cannot forget, because it is not asked to remember.
//
// WHY ASYNC LOCAL STORAGE. The alternative is threading a userId through every
// function that might write, including the engines, which would put a parameter
// nobody reads into a hundred signatures. Node keeps a value with the async
// chain of a single request, which is exactly the shape of the problem: one
// actor, one request, every write beneath it.
// ---------------------------------------------------------------------------
import { AsyncLocalStorage } from 'node:async_hooks';
import type { NextFunction, Request, Response } from 'express';

export type ActorContext = {
  /** The signed in member, or null for an unauthenticated request. */
  userId: string | null;
  /** The route, so an entry says what was being done and not only to what. */
  route: string;
  /** The caller's address, for a security question asked later. */
  ip: string | null;
};

// The REQUEST is what is stored, not a snapshot of it. Each router mounts
// requireAuth itself, so req.auth does not exist yet when an app-level
// middleware runs; reading it at the moment an entry is written gets the right
// actor from one mount instead of seventeen.
type Held = { req: Request } | { fixed: ActorContext };
const storage = new AsyncLocalStorage<Held>();

/** The actor of the request this code is running inside, if any. */
export function currentActor(): ActorContext | undefined {
  const held = storage.getStore();
  if (!held) return undefined;
  if ('fixed' in held) return held.fixed;
  const req = held.req;
  const auth = (req as Request & { auth?: { userId?: string } }).auth;
  return {
    userId: auth?.userId ?? null,
    route: `${req.method} ${req.baseUrl || ''}${req.route?.path ?? req.path}`,
    ip: req.ip ?? null,
  };
}

/** Runs `fn` with this actor in scope, including everything it awaits. */
export const withActor = <T>(context: ActorContext, fn: () => T): T => storage.run({ fixed: context }, fn);

/**
 * Express middleware. Mounted once, before the routers.
 *
 * Safe to mount before the sign-in middleware, because the request itself is
 * what is kept and req.auth is read later, by which time requireAuth has run.
 */
export function actorContext(req: Request, _res: Response, next: NextFunction) {
  storage.run({ req }, next);
}
