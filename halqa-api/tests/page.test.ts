// Bounded lists. Work register: "every list bounded with a limit and cursor
// pagination"; the September operational scan called the same thing unbounded
// queries. These lock the ceiling so a later change cannot quietly remove it.
import { describe, expect, it } from 'vitest';
import { readPage, sendPage, asPage, MAX_PAGE, DEFAULT_PAGE, pageQuery } from '../src/lib/page';

describe('reading the page out of a query string', () => {
  it('a request that asks for nothing gets the default, not everything', () => {
    expect(readPage({}).take).toBe(DEFAULT_PAGE);
    expect(readPage(undefined).take).toBe(DEFAULT_PAGE);
  });

  it('a request may ask for fewer', () => {
    expect(readPage({ limit: '5' }).take).toBe(5);
  });

  it('a request cannot ask for more than the ceiling', () => {
    expect(readPage({ limit: '5000' }).take).toBe(MAX_PAGE);
    expect(readPage({ limit: String(MAX_PAGE + 1) }).take).toBe(MAX_PAGE);
  });

  it('nonsense is clamped rather than refused, because the ceiling is ours to keep', () => {
    expect(readPage({ limit: 'all of them' }).take).toBe(DEFAULT_PAGE);
    expect(readPage({ limit: '0' }).take).toBe(DEFAULT_PAGE);
    expect(readPage({ limit: '-10' }).take).toBe(DEFAULT_PAGE);
  });

  it('no cursor means the first page, with no skip', () => {
    expect(readPage({}).cursorArgs).toEqual({});
  });

  it('a cursor steps PAST the row it names, so no page repeats a row', () => {
    expect(readPage({ cursor: 'abc' }).cursorArgs).toEqual({ cursor: { id: 'abc' }, skip: 1 });
  });

  it('an unknown query parameter is ignored, not an error', () => {
    expect(readPage({ nonsense: 'x', limit: '7' }).take).toBe(7);
  });

  it('the schema itself refuses a limit above the ceiling, for callers that check', () => {
    expect(pageQuery.safeParse({ limit: MAX_PAGE + 1 }).success).toBe(false);
    expect(pageQuery.safeParse({ limit: MAX_PAGE }).success).toBe(true);
  });
});

describe('answering with a page', () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => ({ id: `r${i}` }));

  it('a full page offers the last row as the next cursor', () => {
    expect(asPage(rows(10), 10).nextCursor).toBe('r9');
  });

  it('a short page says there is no more, so nobody asks again to find out', () => {
    expect(asPage(rows(3), 10).nextCursor).toBeNull();
  });

  it('an empty page says there is no more', () => {
    expect(asPage([], 10).nextCursor).toBeNull();
  });

  it('sendPage keeps the body an array, so no existing client breaks', () => {
    const headers: Record<string, string> = {};
    let body: unknown;
    sendPage({ setHeader: (k, v) => { headers[k] = v; }, json: b => { body = b; return b; } }, rows(10), 10);
    expect(Array.isArray(body)).toBe(true);
    expect((body as unknown[]).length).toBe(10);
    expect(headers['X-Next-Cursor']).toBe('r9');
    expect(headers['X-Page-Limit']).toBe('10');
  });

  it('sendPage leaves the cursor header empty on the last page', () => {
    const headers: Record<string, string> = {};
    sendPage({ setHeader: (k, v) => { headers[k] = v; }, json: b => b }, rows(2), 10);
    expect(headers['X-Next-Cursor']).toBe('');
  });
});
