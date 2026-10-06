// Doing a thing once. Work register, per endpoint: "idempotency key accepted
// and enforced".
//
// The ledger already refused a duplicate POSTING, with a unique constraint, so
// money was never at risk of moving twice. What these prove is the layer above
// it: a retry gets the SAME ANSWER the first attempt gave, rather than a
// conflict that reads to a client as a failure and sends the member off to pay
// a second time by hand.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { once, sweep, isExpired, idempotencyKey, WINDOW_HOURS } from '../src/lib/idempotency';
import { prisma } from '../src/db';

const RUN = `idem${Date.now().toString(36)}`;
let userId = '';

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      fullName: 'Idempotency Test', username: `${RUN}u`, email: `${RUN}@halqa.test`,
      phone: `+923${String(Date.now()).slice(-9)}`, passwordHash: 'x',
    },
  });
  userId = user.id;
}, 30_000);

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { actorId: userId } });
  await prisma.idempotencyRecord.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
});

describe('the key a client sends', () => {
  it('is long enough that two clients do not collide by accident', () => {
    expect(idempotencyKey.safeParse('short').success).toBe(false);
    expect(idempotencyKey.safeParse('abcdefgh').success).toBe(true);
  });

  it('has a ceiling, so it cannot be used to store something else', () => {
    expect(idempotencyKey.safeParse('a'.repeat(129)).success).toBe(false);
  });
});

describe('the work runs once', () => {
  it('runs on the first call and returns what it produced', async () => {
    let runs = 0;
    const out = await once(prisma, { userId, route: 'test', key: `${RUN}-a` }, async () => {
      runs++;
      return { statusCode: 201, body: { paid: true, amount: '1000' } };
    });
    expect(runs).toBe(1);
    expect(out.replayed).toBe(false);
    expect(out.statusCode).toBe(201);
    expect(out.body).toEqual({ paid: true, amount: '1000' });
  });

  it('does NOT run on the second call, and answers exactly as the first did', async () => {
    let runs = 0;
    const work = async () => { runs++; return { statusCode: 201, body: { attempt: runs } }; };
    const first = await once(prisma, { userId, route: 'test', key: `${RUN}-b` }, work);
    const second = await once(prisma, { userId, route: 'test', key: `${RUN}-b` }, work);
    expect(runs).toBe(1);
    expect(second.replayed).toBe(true);
    expect(second.statusCode).toBe(first.statusCode);
    expect(second.body).toEqual(first.body);
  });

  it('keeps the status code, so a retry is not told something different', async () => {
    const first = await once(prisma, { userId, route: 'test', key: `${RUN}-c` },
      async () => ({ statusCode: 202, body: { queued: true } }));
    const retry = await once(prisma, { userId, route: 'test', key: `${RUN}-c` },
      async () => ({ statusCode: 500, body: { no: true } }));
    expect(first.statusCode).toBe(202);
    expect(retry.statusCode).toBe(202);
    expect(retry.body).toEqual({ queued: true });
  });

  it('the same key on a DIFFERENT route is a different request', async () => {
    let runs = 0;
    const work = async () => { runs++; return { statusCode: 201, body: { runs } }; };
    await once(prisma, { userId, route: 'route-one', key: `${RUN}-d` }, work);
    await once(prisma, { userId, route: 'route-two', key: `${RUN}-d` }, work);
    expect(runs).toBe(2);
  });

  it('one member cannot replay or block another by guessing a key', async () => {
    const other = await prisma.user.create({
      data: {
        fullName: 'Other', username: `${RUN}v`, email: `${RUN}v@halqa.test`,
        phone: `+923${String(Date.now() + 7).slice(-9)}`, passwordHash: 'x',
      },
    });
    try {
      let runs = 0;
      const work = async () => { runs++; return { statusCode: 201, body: { runs } }; };
      await once(prisma, { userId, route: 'test', key: `${RUN}-shared` }, work);
      const theirs = await once(prisma, { userId: other.id, route: 'test', key: `${RUN}-shared` }, work);
      expect(runs).toBe(2);
      expect(theirs.replayed).toBe(false);
    } finally {
      await prisma.idempotencyRecord.deleteMany({ where: { userId: other.id } });
      await prisma.user.delete({ where: { id: other.id } });
    }
  });

  it('a failure is NOT remembered, so a retry after a real failure runs again', async () => {
    // This half matters as much as the other: remembering a failure would make
    // a transient fault permanent for twenty four hours.
    let runs = 0;
    const failing = async () => { runs++; throw new Error('the bank was unreachable'); };
    await expect(once(prisma, { userId, route: 'test', key: `${RUN}-e` }, failing)).rejects.toThrow();
    await expect(once(prisma, { userId, route: 'test', key: `${RUN}-e` }, failing)).rejects.toThrow();
    expect(runs).toBe(2);
  });

  it('the record is written in the same transaction as the work', async () => {
    // If the work commits and the record does not, the retry does the work
    // twice, which is the whole thing this exists to prevent. The proof is that
    // a failure AFTER the work leaves neither behind.
    const key = `${RUN}-f`;
    await expect(once(prisma, { userId, route: 'test', key }, async tx => {
      await tx.auditLog.create({
        data: { actorId: userId, action: 'IDEM_TEST', entityType: 'Test', entityId: key, payloadJson: {} },
      });
      throw new Error('fails after the write');
    })).rejects.toThrow();
    const record = await prisma.idempotencyRecord.findUnique({
      where: { userId_route_key: { userId, route: 'test', key } },
    });
    expect(record).toBeNull();
    const written = await prisma.auditLog.findFirst({ where: { entityId: key } });
    expect(written, 'the work must have rolled back with the record').toBeNull();
  });

  it('two requests at the same moment: the work runs once and both get its answer', async () => {
    let runs = 0;
    const work = async () => {
      runs++;
      await new Promise(r => setTimeout(r, 20));
      return { statusCode: 201, body: { only: 'once' } };
    };
    const key = `${RUN}-race`;
    const [a, b] = await Promise.all([
      once(prisma, { userId, route: 'test', key }, work),
      once(prisma, { userId, route: 'test', key }, work),
    ]);
    expect(a.body).toEqual({ only: 'once' });
    expect(b.body).toEqual({ only: 'once' });
    expect(a.statusCode).toBe(b.statusCode);
  });
});

describe('the window', () => {
  it('is twenty four hours: long enough for any real retry, short enough to reuse a key later', () => {
    expect(WINDOW_HOURS).toBe(24);
    const now = new Date('2026-10-06T12:00:00Z');
    expect(isExpired(new Date('2026-10-06T11:00:00Z'), now)).toBe(false);
    expect(isExpired(new Date('2026-10-05T11:00:00Z'), now)).toBe(true);
    expect(isExpired(new Date('2026-10-05T12:00:00Z'), now)).toBe(true);
  });

  it('the sweep removes what is past the window and nothing else', async () => {
    const old = await prisma.idempotencyRecord.create({
      data: {
        key: `${RUN}-old`, userId, route: 'test', statusCode: 200, responseJson: {},
        createdAt: new Date(Date.now() - (WINDOW_HOURS + 1) * 3_600_000),
      },
    });
    const fresh = await prisma.idempotencyRecord.create({
      data: { key: `${RUN}-fresh`, userId, route: 'test', statusCode: 200, responseJson: {} },
    });
    await sweep(prisma);
    expect(await prisma.idempotencyRecord.findUnique({ where: { id: old.id } })).toBeNull();
    expect(await prisma.idempotencyRecord.findUnique({ where: { id: fresh.id } })).not.toBeNull();
  });
});
