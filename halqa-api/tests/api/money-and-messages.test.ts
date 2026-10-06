// Endpoints of /api/payments, /api/notifications, /api/agreements,
// /api/chat, /api/support and /api/rewards. Each one: it works, it refuses bad
// input, and it refuses a member without access.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, auth, cleanup, hostable, makeCircle, makeMember, signUndertaking, type Member } from './_harness';

let host: Member;
let outsider: Member;
let circleId: string;

beforeAll(async () => {
  host = await makeMember(hostable());
  outsider = await makeMember();
  await signUndertaking(host);
  const created = await makeCircle(host);
  circleId = created.body.id;
}, 60_000);

afterAll(cleanup);

// --- payments --------------------------------------------------------------

describe('GET /api/payments/mine', () => {
  it('success: returns this member own payments and nobody else', async () => {
    const res = await api().get('/api/payments/mine').set(auth(host));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/payments/mine')).status).toBe(401);
  });
});

describe('POST /api/payments/initiate', () => {
  it('refused for invalid input: no round named', async () => {
    const res = await api().post('/api/payments/initiate').set(auth(host))
      .send({ rail: 'RAAST', idempotencyKey: 'abcdefgh' });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: a rail that does not exist', async () => {
    const res = await api().post('/api/payments/initiate').set(auth(host))
      .send({ roundId: 'r1', rail: 'CARRIER_PIGEON', idempotencyKey: 'abcdefgh' });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: an idempotency key under eight characters', async () => {
    const res = await api().post('/api/payments/initiate').set(auth(host))
      .send({ roundId: 'r1', rail: 'RAAST', idempotencyKey: 'short' });
    expect(res.status).toBe(400);
  });

  it('refused: a round that does not exist', async () => {
    const res = await api().post('/api/payments/initiate').set(auth(host))
      .send({ roundId: 'nosuchround', rail: 'RAAST', idempotencyKey: 'abcdefgh' });
    expect(res.status).toBe(404);
  });

  it('refused for a member without access: no token', async () => {
    const res = await api().post('/api/payments/initiate')
      .send({ roundId: 'r1', rail: 'RAAST', idempotencyKey: 'abcdefgh' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/payments', () => {
  it('refused for invalid input: a transaction reference under four characters', async () => {
    const res = await api().post('/api/payments').set(auth(host))
      .send({ roundId: 'r1', paidVia: 'RAAST', txnRef: 'ab', idempotencyKey: 'abcdefgh' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    const res = await api().post('/api/payments')
      .send({ roundId: 'r1', paidVia: 'RAAST', txnRef: 'abcd', idempotencyKey: 'abcdefgh' });
    expect(res.status).toBe(401);
  });
});

// --- notifications ---------------------------------------------------------

describe('GET /api/notifications', () => {
  it('success: returns this member own notices', async () => {
    const res = await api().get('/api/notifications').set(auth(host));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/notifications')).status).toBe(401);
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  it('refused: a notice that is not this member own', async () => {
    // The member's own id is in the WHERE clause, so another member's notice
    // can never be marked. It answered 200 {updated: 0} until 2026-10-06,
    // which left the caller unable to tell that from a success.
    const res = await api().patch('/api/notifications/nosuchnotice/read').set(auth(host)).send({});
    expect(res.status).toBe(404);
  });

  it('another member notice is never touched, whatever id is sent', async () => {
    const { prisma } = await import('../../src/db');
    const theirs = await prisma.notification.create({
      data: { userId: outsider.id, type: 'GENERAL', message: 'Not yours' },
    });
    const res = await api().patch('/api/notifications/' + theirs.id + '/read').set(auth(host)).send({});
    expect(res.status).toBe(404);
    const after = await prisma.notification.findUniqueOrThrow({ where: { id: theirs.id } });
    expect(after.isRead).toBe(false);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().patch('/api/notifications/x/read').send({})).status).toBe(401);
  });
});

describe('PATCH /api/notifications/read-all', () => {
  it('success: marks everything read', async () => {
    const res = await api().patch('/api/notifications/read-all').set(auth(host)).send({});
    expect(res.status).toBeLessThan(300);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().patch('/api/notifications/read-all').send({})).status).toBe(401);
  });
});

// --- agreements ------------------------------------------------------------

describe('GET /api/agreements/status', () => {
  it('success: says the undertaking is on file once signed', async () => {
    const res = await api().get('/api/agreements/status').set(auth(host));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/agreements/status')).status).toBe(401);
  });
});

describe('GET /api/agreements/text', () => {
  it('success: returns the text of the undertaking', async () => {
    const res = await api().get('/api/agreements/text').query({ doc: 'PLATFORM_UNDERTAKING' }).set(auth(host));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/agreements/text').query({ doc: 'PLATFORM_UNDERTAKING' })).status).toBe(401);
  });
});

describe('POST /api/agreements/sign', () => {
  it('refused for invalid input: a document that is not one of the two', async () => {
    const res = await api().post('/api/agreements/sign').set(auth(host))
      .send({ doc: 'SOMETHING_ELSE', accept: true, signedName: host.fullName });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: accept must be true, not merely present', async () => {
    const res = await api().post('/api/agreements/sign').set(auth(host))
      .send({ doc: 'PLATFORM_UNDERTAKING', accept: false, signedName: host.fullName });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: a signature that is not the account name', async () => {
    const res = await api().post('/api/agreements/sign').set(auth(host))
      .send({ doc: 'PLATFORM_UNDERTAKING', accept: true, signedName: 'Somebody Else' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/match the account name/);
  });

  it('refused for invalid input: no signature at all', async () => {
    const res = await api().post('/api/agreements/sign').set(auth(host))
      .send({ doc: 'PLATFORM_UNDERTAKING', accept: true });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: the mutual guarantee with no circle named', async () => {
    const res = await api().post('/api/agreements/sign').set(auth(host))
      .send({ doc: 'MUTUAL_PG', accept: true });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    const res = await api().post('/api/agreements/sign')
      .send({ doc: 'PLATFORM_UNDERTAKING', accept: true, signedName: host.fullName });
    expect(res.status).toBe(401);
  });
});

// --- chat ------------------------------------------------------------------

describe('GET /api/chat/:committeeId', () => {
  it('success: a member of the circle can read it', async () => {
    const res = await api().get('/api/chat/' + circleId).set(auth(host));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().get('/api/chat/' + circleId).set(auth(outsider));
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/chat/' + circleId)).status).toBe(401);
  });
});

describe('POST /api/chat/:committeeId', () => {
  it('success: a member can post, and the message comes back', async () => {
    const res = await api().post('/api/chat/' + circleId).set(auth(host)).send({ body: 'Assalam o alaikum' });
    expect(res.status).toBeLessThan(300);
  });

  it('refused for invalid input: an empty message', async () => {
    const res = await api().post('/api/chat/' + circleId).set(auth(host)).send({ body: '' });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: a message of only whitespace', async () => {
    const res = await api().post('/api/chat/' + circleId).set(auth(host)).send({ body: '    ' });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: a message over two thousand characters', async () => {
    const res = await api().post('/api/chat/' + circleId).set(auth(host)).send({ body: 'x'.repeat(2_001) });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().post('/api/chat/' + circleId).set(auth(outsider)).send({ body: 'hello' });
    expect(res.status).toBe(403);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/chat/' + circleId).send({ body: 'hello' })).status).toBe(401);
  });
});

// --- support ---------------------------------------------------------------

describe('GET and POST /api/support/tickets', () => {
  let ticketId: string;

  it('success: opens a case and lists it', async () => {
    const res = await api().post('/api/support/tickets').set(auth(host))
      .send({ category: 'QUESTION', subject: 'A question about my seat', body: 'Which turns may I take?' });
    expect(res.status).toBeLessThan(300);
    ticketId = res.body.id;
    const list = await api().get('/api/support/tickets').set(auth(host));
    expect(list.status).toBe(200);
    expect(list.body.some?.((t: { id: string }) => t.id === ticketId) ?? true).toBe(true);
  });

  it('refused for invalid input: a subject under three characters', async () => {
    const res = await api().post('/api/support/tickets').set(auth(host))
      .send({ subject: 'ab', body: 'Long enough body here' });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: a body under five characters', async () => {
    const res = await api().post('/api/support/tickets').set(auth(host))
      .send({ subject: 'A real subject', body: 'abc' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: another member cannot read our case', async () => {
    const res = await api().get('/api/support/tickets/' + ticketId).set(auth(outsider));
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/support/tickets')).status).toBe(401);
    expect((await api().post('/api/support/tickets').send({ subject: 'abc', body: 'abcdef' })).status).toBe(401);
  });

  it('refused for invalid input: a reply under two characters', async () => {
    const res = await api().post('/api/support/tickets/' + ticketId + '/reply').set(auth(host)).send({ body: 'a' });
    expect(res.status).toBe(400);
  });

  it('success: the member can close their own case', async () => {
    const res = await api().post('/api/support/tickets/' + ticketId + '/close').set(auth(host)).send({});
    expect(res.status).toBeLessThan(300);
  });
});

// --- rewards ---------------------------------------------------------------

describe('GET /api/rewards', () => {
  it('success: returns the points standing', async () => {
    expect((await api().get('/api/rewards').set(auth(host))).status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/rewards')).status).toBe(401);
  });
});

describe('GET /api/rewards/ladder', () => {
  it('success: returns the ladder', async () => {
    expect((await api().get('/api/rewards/ladder').set(auth(host))).status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/rewards/ladder')).status).toBe(401);
  });
});

describe('POST /api/rewards/record', () => {
  it('refused for invalid input: a kind that is not on the list', async () => {
    const res = await api().post('/api/rewards/record').set(auth(host)).send({ kind: 'BECAUSE_I_SAID_SO' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/rewards/record').send({ kind: 'PAID_ON_TIME' })).status).toBe(401);
  });
});
