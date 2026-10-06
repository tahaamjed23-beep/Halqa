// Reading endpoints of /api/committees. Each one: it works, it refuses bad
// input where it takes any, and it refuses a request without access.
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
  expect(created.status).toBe(201);
  circleId = created.body.id;
}, 60_000);

afterAll(cleanup);

describe('GET /api/committees', () => {
  it('success: lists the circles this member belongs to', async () => {
    const res = await api().get('/api/committees').set(auth(host));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((c: { id: string }) => c.id === circleId)).toBe(true);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/committees')).status).toBe(401);
  });

  it('shows another member nothing of ours', async () => {
    const res = await api().get('/api/committees').set(auth(outsider));
    expect(res.status).toBe(200);
    expect(res.body.some((c: { id: string }) => c.id === circleId)).toBe(false);
  });
});

describe('GET /api/committees/discover', () => {
  it('success: returns the circles open to this member', async () => {
    const res = await api().get('/api/committees/discover').set(auth(outsider));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('every circle it offers carries the seats this member may claim', async () => {
    const res = await api().get('/api/committees/discover').set(auth(outsider));
    for (const c of res.body) {
      expect(Array.isArray(c.eligiblePositions)).toBe(true);
      // Discover must never advertise a circle with no seat for the viewer.
      if (c.availability === 'OPEN') expect(c.eligiblePositions.length).toBeGreaterThan(0);
    }
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/committees/discover')).status).toBe(401);
  });
});

describe('GET /api/committees/:id', () => {
  it('success: returns the circle to its host', async () => {
    const res = await api().get(`/api/committees/${circleId}`).set(auth(host));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(circleId);
  });

  it('refused for invalid input: an id that is not a circle', async () => {
    // 403 rather than 404, and deliberately so: the membership check runs
    // first, so the answer is the same whether the circle does not exist or
    // exists and is none of the caller's business. A 404 here would let anyone
    // enumerate which circle ids are real.
    const res = await api().get('/api/committees/not-a-real-id').set(auth(host));
    expect(res.status).toBe(403);
  });

  it('refused for a member without access: a circle this member is not in', async () => {
    const res = await api().get(`/api/committees/${circleId}`).set(auth(outsider));
    expect(res.status).toBe(403);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get(`/api/committees/${circleId}`)).status).toBe(401);
  });
});

describe('GET /api/committees/preview/:inviteCode', () => {
  // The whole router sits behind requireAuth (committees.ts line 22), so the
  // invite preview needs a signed-in member even though its projection is
  // written for a stranger: it returns no member identities, only the circle's
  // shape and the host's reputation. Raised with the chairman as a question.
  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/committees/preview/ZZZZZZZZ')).status).toBe(401);
  });

  it('refused for invalid input: an invite code that does not exist', async () => {
    const res = await api().get('/api/committees/preview/ZZZZZZZZ').set(auth(outsider));
    expect(res.status).toBe(404);
  });

  it('success: a signed-in stranger sees the circle shape and no member names', async () => {
    const { prisma } = await import('../../src/db');
    const row = await prisma.committee.findUniqueOrThrow({ where: { id: circleId }, select: { inviteCode: true } });
    const res = await api().get(`/api/committees/preview/${row.inviteCode}`).set(auth(outsider));
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(circleId);
    expect(res.body.memberCap).toBe(6);
    // The host IS named, deliberately: a stranger deciding whether to join has
    // to know who runs the circle, and the host's record is the thing being
    // judged. What must not appear is the other members, and the preview
    // returns only how many there are.
    expect(res.body.host.username).toBe(host.username);
    expect(res.body.members).toBeUndefined();
    expect(typeof res.body.memberCount).toBe('number');
  });
});

describe('GET /api/committees/:id/payment-matrix', () => {
  it('success: returns who has paid, to a member of the circle', async () => {
    const res = await api().get(`/api/committees/${circleId}/payment-matrix`).set(auth(host));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().get(`/api/committees/${circleId}/payment-matrix`).set(auth(outsider));
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get(`/api/committees/${circleId}/payment-matrix`)).status).toBe(401);
  });
});

describe('GET /api/committees/:id/receivables-pack', () => {
  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().get(`/api/committees/${circleId}/receivables-pack`).set(auth(outsider));
    expect([401, 403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get(`/api/committees/${circleId}/receivables-pack`)).status).toBe(401);
  });
});
