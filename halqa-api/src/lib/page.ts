// ---------------------------------------------------------------------------
// BOUNDED LISTS
//
// Work register: "every list bounded with a limit and cursor pagination". The
// September operational scan found the same thing from the other end and
// called it unbounded queries.
//
// A list endpoint with no `take` is a promise to return everything, for ever.
// It is fine on the first day and it is an outage on the day somebody has
// 40,000 notifications: the database does the work, the server holds the rows
// in memory, serialises them, and the member waits for a screen that shows
// twenty. Nobody notices until the data arrives, and by then it is live.
//
// So every list takes a limit it cannot exceed and a cursor to continue from.
// The cursor is the id of the last row the caller received, which is stable
// under inserts in a way that an offset is not: page 2 by offset silently
// skips a row when a new one lands at the top, and that is how a member's
// payment vanishes from their own history.
// ---------------------------------------------------------------------------
import { z } from 'zod';

/** The most any single request may ever return, whatever it asks for. */
export const MAX_PAGE = 100;
export const DEFAULT_PAGE = 50;

export const pageQuery = z.object({
  limit: z.coerce.number().int().min(1).max(MAX_PAGE).optional(),
  // The id of the last row already received. Absent means the first page.
  cursor: z.string().trim().min(1).max(60).optional(),
});

export type PageQuery = z.infer<typeof pageQuery>;

/**
 * Reads the limit and cursor out of a query string, ignoring anything else.
 *
 * A bad limit is clamped rather than refused: a client asking for 5,000 rows
 * has made a mistake about what is reasonable, not an error, and the ceiling
 * is the service's business to enforce quietly. A malformed cursor IS refused,
 * because silently serving page one to somebody asking for page nine is how a
 * caller loops for ever.
 */
export function readPage(query: unknown): { take: number; cursorArgs: { cursor: { id: string }; skip: number } | Record<string, never> } {
  const raw = (query ?? {}) as Record<string, unknown>;
  // The limit is read leniently and clamped, which is what the comment above
  // promises. Running it through pageQuery instead made an out of range limit
  // fall back to the DEFAULT rather than the CEILING, so asking for 5,000 rows
  // quietly gave 50 where it should give 100. The schema is still exported for
  // callers that want to validate rather than clamp.
  const asked = Number(raw.limit);
  const limit = Number.isFinite(asked) && asked >= 1 ? Math.floor(asked) : undefined;
  const cursorRaw = typeof raw.cursor === 'string' ? raw.cursor.trim() : '';
  const cursor = cursorRaw.length >= 1 && cursorRaw.length <= 60 ? cursorRaw : undefined;
  return {
    take: Math.min(MAX_PAGE, Math.max(1, limit ?? DEFAULT_PAGE)),
    // `skip: 1` steps past the cursor row itself, so a page never repeats the
    // last row of the one before it.
    cursorArgs: cursor ? { cursor: { id: cursor }, skip: 1 } : {},
  };
}

/**
 * The envelope a bounded list answers with.
 *
 * `nextCursor` is null when the page that was just returned is the last one,
 * so a caller knows to stop without making one more request to find out.
 */
export type Page<T> = { items: T[]; nextCursor: string | null };

export function asPage<T extends { id: string }>(rows: T[], take: number): Page<T> {
  return {
    items: rows,
    // A full page MIGHT have more behind it; a short page certainly does not.
    nextCursor: rows.length === take ? rows[rows.length - 1]!.id : null,
  };
}

/**
 * Sends a bounded list the way every existing client already reads it: as a
 * plain array, with the cursor for the next page in a response header.
 *
 * The web app consumes eight of these endpoints as arrays, and the preview
 * module stubs them as arrays. Changing the body to {items, nextCursor} would
 * have been tidier and would have broken all of them at once, which is not a
 * trade worth making for tidiness. The bound itself — the thing that actually
 * prevents the outage — does not depend on the shape.
 *
 * A client that ignores the header behaves exactly as it does today. A client
 * that wants more passes ?cursor= with the value it was given.
 */
export function sendPage<T extends { id: string }>(
  res: { setHeader: (k: string, v: string) => void; json: (b: unknown) => unknown },
  rows: T[],
  take: number,
  // Where the rows being SENT are a filtered subset of the rows the database
  // returned, the cursor must come from the unfiltered set: otherwise the next
  // page starts after the last row that survived the filter and everything
  // between it and the real end of the page is lost. /discover filters.
  cursorOverride?: string | null,
): void {
  const next = cursorOverride !== undefined
    ? cursorOverride
    : rows.length === take ? rows[rows.length - 1]!.id : null;
  res.setHeader('X-Next-Cursor', next ?? '');
  res.setHeader('X-Page-Limit', String(take));
  res.json(rows);
}

/**
 * The largest circle the service will create, from the memberCap ceiling on
 * POST /api/committees.
 *
 * Some lists are not pages and cannot be: a payment matrix is the whole grid
 * or it is useless to the host who asked for it. Those are bounded by the
 * CIRCLE instead, and this is the number that bounds them. Keeping it here,
 * next to the page ceiling, is what stops the two drifting apart the day
 * somebody raises the cap.
 */
export const MAX_CIRCLE_MEMBERS = 150;
