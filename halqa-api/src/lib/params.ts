// ---------------------------------------------------------------------------
// PATH PARAMETERS
//
// Work register: "input checked against a schema before any logic", per
// endpoint. Twenty-seven endpoints took no body at all and so had nothing to
// validate — except the part of their input that nobody was checking: the path.
//
// `/api/committees/:id` with a 4 KB id, a SQL fragment or an empty string went
// straight into a Prisma query. Prisma itself is safe from injection, so this
// was never an exploit; what it was is a database round trip on behalf of a
// caller who could not possibly be served, and an error shaped by whatever
// Prisma happened to say rather than by us. At the top of a hot route, with an
// id the caller controls the length of, that is a cheap thing to hand away.
//
// So the id is checked first, against what an id can actually be.
// ---------------------------------------------------------------------------
import { z } from 'zod';

// cuid and cuid2 (what Prisma's @default(cuid()) mints) are lowercase
// alphanumeric, 7 to 32 characters. Allowing a dash and an underscore too
// leaves room for a future scheme without reopening this file, and still
// refuses everything that is plainly not an id.
export const ID = z.string().trim().min(7).max(64).regex(/^[a-z0-9][a-z0-9_-]*$/i, 'That is not a valid id');

/** Just `:id`, which is most of them. */
export const idParam = z.object({ id: ID });

/** For routes carrying two ids, such as a nudge or a bid acceptance. */
export const twoIdParams = (a: string, b: string) => z.object({ [a]: ID, [b]: ID });

/**
 * A circle's invite code, as committees.ts actually mints it: the letters HLQ,
 * a dash, and eight characters of a UUID in capitals. The dash matters — a
 * schema of letters and digits only refused every real code, which is the kind
 * of validation that is worse than none.
 */
export const inviteCodeParam = z.object({
  inviteCode: z.string().trim().min(4).max(24).regex(/^[A-Za-z0-9-]+$/, 'An invite code is letters, numbers and a dash'),
});

/**
 * Reads and checks the parameters of a request, throwing the same ZodError any
 * other schema failure throws, so the shared error handler turns it into the
 * same 400 with the same code and the same Urdu sentence.
 */
export const checkParams = <T extends z.ZodTypeAny>(schema: T, params: unknown): z.infer<T> =>
  schema.parse(params);
