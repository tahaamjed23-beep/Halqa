// ---------------------------------------------------------------------------
// A ROUTER WHOSE HANDLERS CANNOT HANG THE REQUEST
//
// Express 4 does not understand promises. A handler written as
//
//     router.get('/mine', async (req, res) => { ... })
//
// that rejects — a parse failure, a database blip, anything at all — leaves
// Express with an unhandled rejection and NOTHING ELSE. No error reaches the
// error handler, no response is ever written, and the request simply hangs
// until the client gives up. The socket is held the whole time, so enough of
// them is an outage rather than a bug report.
//
// Seventeen handlers were written that way, found on 2026-10-06 when an
// integration test sent POST /api/auth/logout a refresh token of the wrong
// type and the test timed out instead of failing. The handlers that DO carry
// `try { ... } catch (error) { next(error) }` were always fine; the point of
// this file is that being fine should not depend on remembering.
//
// So the router itself takes responsibility. Every handler registered on it is
// wrapped so that a rejection becomes next(error), which is exactly what the
// careful handlers already do by hand. Nothing else about the router changes.
// ---------------------------------------------------------------------------
import { Router, type IRouter, type NextFunction, type Request, type Response } from 'express';

type AnyHandler = (...args: never[]) => unknown;

/** Turns a rejection into next(error), the way a hand written try/catch does. */
const wrap = (fn: AnyHandler) => {
  const wrapped = (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve((fn as unknown as (q: Request, s: Response, n: NextFunction) => unknown)(req, res, next))
      .catch(next);
  // Keep the name, so a stack trace still says which handler it was.
  Object.defineProperty(wrapped, 'name', { value: fn.name || 'handler' });
  return wrapped;
};

// Express decides a function is an ERROR handler by its arity: four arguments
// means (err, req, res, next). Wrapping one would change its arity to three and
// silently stop it being called at all, so those are left exactly as they are.
const isErrorHandler = (fn: AnyHandler) => fn.length >= 4;

const METHODS = ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'all', 'use'] as const;

/**
 * Drop-in replacement for `Router()`.
 *
 * Use it instead of Router() in a route file and every handler in that file,
 * including middleware mounted with .use(), reports its failures through the
 * error handler rather than hanging.
 */
export function safeRouter(): IRouter {
  const router = Router();
  for (const method of METHODS) {
    const original = (router[method] as (...args: unknown[]) => unknown).bind(router);
    (router as unknown as Record<string, unknown>)[method] = (...args: unknown[]) =>
      original(...args.map(arg =>
        typeof arg === 'function' && !isErrorHandler(arg as AnyHandler) ? wrap(arg as AnyHandler) : arg));
  }
  return router;
}
