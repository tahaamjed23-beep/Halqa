import { describe, expect, it } from 'vitest';
import { ERRORS, AppError, errorBody, codeForStatus, withErrorCode, type ErrorCode } from '../src/lib/errors';
import { limits } from '../src/lib/rate-limits';

// The shared error list and the per route rate limits. Both replaced things
// that were effectively absent: failures used to answer with a bare sentence
// and no code, and one global ceiling of 1,500 requests in 15 minutes was the
// only limit standing in front of sign in.

const CODES = Object.keys(ERRORS) as ErrorCode[];

describe('the shared error list', () => {
  it('gives every code a status, an English sentence and an Urdu one', () => {
    expect(CODES.length).toBeGreaterThan(10);
    for (const code of CODES) {
      const m = ERRORS[code];
      expect(m.status, code).toBeGreaterThanOrEqual(400);
      expect(m.status, code).toBeLessThan(600);
      expect(m.en.length, code).toBeGreaterThan(10);
      expect(m.ur.length, code).toBeGreaterThan(5);
      expect(m.ur, code).not.toBe(m.en);                    // Urdu, not a copy
      expect(/[؀-ۿ]/.test(m.ur), code).toBe(true); // in Urdu script
    }
  });

  it('never leaks an internal word into a sentence a member reads', () => {
    const forbidden = /prisma|sql|undefined|null|stack|exception|P2\d{3}|token|hash/i;
    for (const code of CODES) {
      expect(forbidden.test(ERRORS[code].en), code).toBe(false);
      expect(forbidden.test(ERRORS[code].ur), code).toBe(false);
    }
  });

  it('maps a bare status to the nearest code', () => {
    expect(codeForStatus(400)).toBe('VALIDATION_FAILED');
    expect(codeForStatus(401)).toBe('SIGN_IN_REQUIRED');
    expect(codeForStatus(403)).toBe('NOT_ALLOWED');
    expect(codeForStatus(404)).toBe('NOT_FOUND');
    expect(codeForStatus(409)).toBe('CONFLICT');
    expect(codeForStatus(429)).toBe('TOO_MANY_REQUESTS');
    expect(codeForStatus(418)).toBe('SERVICE_ERROR');
  });

  it('builds a body carrying the code, both languages and any detail', () => {
    const body = errorBody('WRONG_PIN');
    expect(body.code).toBe('WRONG_PIN');
    expect(body.error).toBe(ERRORS.WRONG_PIN.en);
    expect(body.messageUr).toBe(ERRORS.WRONG_PIN.ur);
    expect(errorBody('VALIDATION_FAILED', { field: 'cnic' })).toHaveProperty('details');
  });

  it('an AppError carries its own status', () => {
    expect(new AppError('NOT_ALLOWED').status).toBe(403);
    expect(new AppError('PIN_LOCKED').status).toBe(423);
  });
});

describe('every error response carries a shared code', () => {
  // withErrorCode is exactly what app.ts applies to every outgoing body.
  it('an inline failure keeps its own sentence and gains the code and the Urdu', () => {
    const out = withErrorCode(409, { error: 'That seat is taken' }) as Record<string, unknown>;
    expect(out.code).toBe('CONFLICT');
    expect(out.error).toBe('That seat is taken');      // the route's own words survive
    expect(out.messageUr).toBe(ERRORS.CONFLICT.ur);    // and the member gets Urdu
  });

  it('a body that already names its code is left alone', () => {
    const body = { code: 'WRONG_PIN', error: 'nope' };
    expect(withErrorCode(401, body)).toBe(body);
  });

  it('a successful response is never rewritten', () => {
    const ok = { fine: true };
    expect(withErrorCode(200, ok)).toBe(ok);
    expect(withErrorCode(201, ok)).toBe(ok);
    expect(withErrorCode(304, ok)).toBe(ok);
  });

  it('an array or an empty body is never rewritten into an object', () => {
    const list: unknown[] = [];
    expect(withErrorCode(404, list)).toBe(list);
    expect(withErrorCode(500, null)).toBe(null);
    expect(withErrorCode(500, undefined)).toBe(undefined);
  });

  it('covers every status the service actually answers with', () => {
    for (const status of [400, 401, 402, 403, 404, 409, 422, 423, 429, 500, 503]) {
      const out = withErrorCode(status, { error: 'x' }) as Record<string, unknown>;
      expect(typeof out.code, String(status)).toBe('string');
      expect(ERRORS[out.code as ErrorCode], String(status)).toBeDefined();
      expect(typeof out.messageUr, String(status)).toBe('string');
    }
  });
});

describe('per route rate limits', () => {
  it('builds a distinct limiter for each class of route', () => {
    for (const make of [limits.signIn, limits.code, limits.financial, limits.write, limits.read, limits.admin]) {
      expect(typeof make()).toBe('function');
    }
  });

  it('refuses with the shared code, so a throttled member is told why in both languages', () => {
    // What the limiters' handler writes when the ceiling is passed. Driving a
    // limiter to its ceiling belongs in the integration run, where real
    // requests go over HTTP; here the body itself is what matters.
    const body = errorBody('TOO_MANY_REQUESTS');
    expect(body.code).toBe('TOO_MANY_REQUESTS');
    expect(body.error).toBe(ERRORS.TOO_MANY_REQUESTS.en);
    expect(body.messageUr).toBe(ERRORS.TOO_MANY_REQUESTS.ur);
    expect(ERRORS.TOO_MANY_REQUESTS.status).toBe(429);
  });
});
