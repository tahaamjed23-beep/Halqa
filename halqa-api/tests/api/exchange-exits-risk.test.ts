// Endpoints of /api/exchange, /api/exits, /api/protection, /api/risk and
// /api/schemes. Each one: it works, it refuses bad input, and it refuses a
// member without access.
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

// --- exchange: the turn market ---------------------------------------------

describe('GET /api/exchange', () => {
  it('success: lists the open listings', async () => {
    const res = await api().get('/api/exchange').set(auth(host));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/exchange')).status).toBe(401);
  });
});

describe('POST /api/exchange', () => {
  it('refused for invalid input: no circle named', async () => {
    const res = await api().post('/api/exchange').set(auth(host)).send({ premiumPaisa: '0' });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: a premium that is not a number of paisa', async () => {
    const res = await api().post('/api/exchange').set(auth(host))
      .send({ committeeId: circleId, premiumPaisa: 'lots' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().post('/api/exchange').set(auth(outsider))
      .send({ committeeId: circleId, premiumPaisa: '0' });
    expect([403, 404]).toContain(res.status);
  });

  it('refused: a circle that is still forming and does not allow turn sales', async () => {
    const res = await api().post('/api/exchange').set(auth(host))
      .send({ committeeId: circleId, premiumPaisa: '0' });
    expect(res.status).toBe(409);
  });

  it('refused for a member without access: no token', async () => {
    const res = await api().post('/api/exchange').send({ committeeId: circleId, premiumPaisa: '0' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/exchange/:id/bid', () => {
  it('refused: a listing that is not open', async () => {
    const res = await api().post('/api/exchange/nosuchlisting/bid').set(auth(host)).send({ premiumPaisa: '1000' });
    expect(res.status).toBe(404);
  });

  it('refused for invalid input: a premium that is not a number of paisa', async () => {
    const res = await api().post('/api/exchange/nosuchlisting/bid').set(auth(host)).send({ premiumPaisa: 'lots' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/exchange/x/bid').send({ premiumPaisa: '1000' })).status).toBe(401);
  });
});

describe('POST /api/exchange/:id/bids/:bidId/accept', () => {
  it('refused for invalid input: an idempotency key under eight characters', async () => {
    const res = await api().post('/api/exchange/x/bids/y/accept').set(auth(host)).send({ idempotencyKey: 'short' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    const res = await api().post('/api/exchange/x/bids/y/accept').send({ idempotencyKey: 'abcdefgh' });
    expect(res.status).toBe(401);
  });
});

// --- exits: the five-rung ladder -------------------------------------------

describe('GET /api/exits/committee/:id/options', () => {
  it('success: returns the rungs open to a member of the circle', async () => {
    const res = await api().get('/api/exits/committee/' + circleId + '/options').set(auth(host));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().get('/api/exits/committee/' + circleId + '/options').set(auth(outsider));
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/exits/committee/' + circleId + '/options')).status).toBe(401);
  });
});

describe('POST /api/exits/committee/:id', () => {
  it('refused for invalid input: a rung that is not one of the four', async () => {
    const res = await api().post('/api/exits/committee/' + circleId).set(auth(host)).send({ rung: 'CANCEL' });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: a reason over two thousand characters', async () => {
    const res = await api().post('/api/exits/committee/' + circleId).set(auth(host))
      .send({ rung: 'WINDOW', reason: 'x'.repeat(2_001) });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().post('/api/exits/committee/' + circleId).set(auth(outsider)).send({ rung: 'WINDOW' });
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/exits/committee/' + circleId).send({ rung: 'WINDOW' })).status).toBe(401);
  });
});

describe('POST /api/exits/:requestId/vote', () => {
  it('refused for invalid input: no vote in the body', async () => {
    expect((await api().post('/api/exits/x/vote').set(auth(host)).send({})).status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/exits/x/vote').send({ approve: true })).status).toBe(401);
  });
});

describe('POST /api/exits/:requestId/settle', () => {
  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/exits/x/settle').send({})).status).toBe(401);
  });
});

describe('GET /api/exits/committee/:id', () => {
  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/exits/committee/' + circleId)).status).toBe(401);
  });
});

// --- protection ------------------------------------------------------------

describe('GET /api/protection/committee/:id', () => {
  it('success: returns the protection standing to a member', async () => {
    const res = await api().get('/api/protection/committee/' + circleId).set(auth(host));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().get('/api/protection/committee/' + circleId).set(auth(outsider));
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/protection/committee/' + circleId)).status).toBe(401);
  });
});

describe('GET /api/protection/recovery/mine', () => {
  it('success: returns this member own recovery cases and nobody else', async () => {
    expect((await api().get('/api/protection/recovery/mine').set(auth(host))).status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/protection/recovery/mine')).status).toBe(401);
  });
});

describe('PUT /api/protection/committee/:id/commitment', () => {
  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().put('/api/protection/committee/' + circleId + '/commitment')
      .set(auth(outsider)).send({ kind: 'GUARANTOR' });
    expect([400, 403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    const res = await api().put('/api/protection/committee/' + circleId + '/commitment').send({});
    expect(res.status).toBe(401);
  });
});

describe('POST /api/protection/delinquency/run', () => {
  it('refused for a member without access: an ordinary member cannot run the collector', async () => {
    // It charges late fees, moves scores and queues bureau reports. Production
    // refused it already; until 2026-10-06 any signed-in member could set it
    // off anywhere else, which on a staging copy of real data is the same
    // damage without the production guard.
    const res = await api().post('/api/protection/delinquency/run').set(auth(outsider)).send({});
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/Admin/);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/protection/delinquency/run').send({})).status).toBe(401);
  });
});

// --- risk ------------------------------------------------------------------

describe('GET /api/risk/committee/:id', () => {
  it('success: returns the risk reading to a member of the circle', async () => {
    const res = await api().get('/api/risk/committee/' + circleId).set(auth(host));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: someone outside the circle', async () => {
    const res = await api().get('/api/risk/committee/' + circleId).set(auth(outsider));
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/risk/committee/' + circleId)).status).toBe(401);
  });
});

describe('GET /api/risk/committee/:id/projection', () => {
  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/risk/committee/' + circleId + '/projection')).status).toBe(401);
  });
});

describe('PATCH /api/risk/committee/:id/policy', () => {
  it('refused for a member without access: a member who is not the host', async () => {
    const res = await api().patch('/api/risk/committee/' + circleId + '/policy')
      .set(auth(outsider)).send({ payoutBufferBps: 1500 });
    expect([400, 403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    const res = await api().patch('/api/risk/committee/' + circleId + '/policy').send({ payoutBufferBps: 1500 });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/risk/committee/:id/refresh', () => {
  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/risk/committee/' + circleId + '/refresh').send({})).status).toBe(401);
  });
});

describe('POST /api/risk/committee/:id/consent', () => {
  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/risk/committee/' + circleId + '/consent').send({})).status).toBe(401);
  });
});
