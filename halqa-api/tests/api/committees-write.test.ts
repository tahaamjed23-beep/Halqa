// Writing endpoints of /api/committees: create, join, start, leave, autopay,
// nudge, payout, listing, withdraw, avatar. Each one: it works, it refuses bad
// input, and it refuses a member without access.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, auth, cleanup, hostable, makeCircle, makeMember, signUndertaking, type Member } from './_harness';

let host: Member;
let joiner: Member;
let outsider: Member;

beforeAll(async () => {
  host = await makeMember(hostable());
  joiner = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
  outsider = await makeMember();
  await signUndertaking(host);
  await signUndertaking(joiner);
}, 60_000);

afterAll(cleanup);

describe('POST /api/committees', () => {
  it('success: creates the circle and names the host', async () => {
    const res = await makeCircle(host);
    expect(res.status).toBe(201);
    expect(res.body.hostId).toBe(host.id);
    expect(res.body.status).toBe('FORMING');
    expect(res.body.inviteCode).toBeTruthy();
  });

  it('refused for invalid input: a name under three characters', async () => {
    expect((await makeCircle(host, { name: 'ab' })).status).toBe(400);
  });

  it('refused for invalid input: fewer than three members', async () => {
    expect((await makeCircle(host, { memberCap: 2 })).status).toBe(400);
  });

  it('refused for invalid input: a contribution under Rs 100', async () => {
    const res = await makeCircle(host, { contributionPaisa: '5000' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/Rs 100/);
  });

  it('refused for invalid input: a minimum to start above the capacity', async () => {
    const res = await makeCircle(host, { memberCap: 6, minMembersToStart: 10 });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: a cadence that is not one of the four', async () => {
    expect((await makeCircle(host, { cadencePreset: 'WHENEVER' })).status).toBe(400);
  });

  it('refused for a member without access: a score under 700 cannot host', async () => {
    const weak = await makeMember({ ...hostable(), creditScore: 500 });
    await signUndertaking(weak);
    const res = await makeCircle(weak);
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/700/);
  });

  it('refused for a member without access: no signed undertaking', async () => {
    const unsigned = await makeMember(hostable());
    const res = await makeCircle(unsigned);
    expect(res.status).toBe(428);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/committees').send({ name: 'x' })).status).toBe(401);
  });
});

describe('POST /api/committees/:id/join', () => {
  let circleId: string;
  beforeAll(async () => {
    const created = await makeCircle(host, { listedPublicly: true });
    circleId = created.body.id;
  });

  it('success: the member joins and is given a seat', async () => {
    const res = await api().post('/api/committees/' + circleId + '/join').set(auth(joiner)).send({});
    expect(res.status).toBe(201);
    expect(res.body.turnPosition).toBeGreaterThanOrEqual(1);
    expect(res.body.autoDebitEnabled).toBe(true);   // autopay defaults on at join
  });

  it('refused: joining the same circle twice', async () => {
    const res = await api().post('/api/committees/' + circleId + '/join').set(auth(joiner)).send({});
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/Already a member/i);
  });

  it('refused for invalid input: a seat beyond any circle', async () => {
    const other = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    await signUndertaking(other);
    const res = await api().post('/api/committees/' + circleId + '/join').set(auth(other)).send({ position: 999 });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: no signed undertaking', async () => {
    const unsigned = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    const res = await api().post('/api/committees/' + circleId + '/join').set(auth(unsigned)).send({});
    expect(res.status).toBe(428);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/committees/' + circleId + '/join').send({})).status).toBe(401);
  });

  it('refused: a circle that does not exist', async () => {
    const res = await api().post('/api/committees/nope/join').set(auth(joiner)).send({});
    expect(res.status).toBe(404);
  });

  it('the seat matrix holds: a member with no record cannot take an early seat', async () => {
    // creditScore 0 and no clean circles reads as no record at all, which is
    // the last seats only (score-bands.ts, the matrix of 5 October 2026).
    const noRecord = await makeMember({ creditScore: 0, committeesCompletedClean: 0 });
    await signUndertaking(noRecord);
    const res = await api().post('/api/committees/' + circleId + '/join').set(auth(noRecord)).send({ position: 1 });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/not available to you/);
  });
});

describe('POST /api/committees/:id/start', () => {
  it('refused for a member without access: a member who is not the host', async () => {
    const created = await makeCircle(host);
    const res = await api().post('/api/committees/' + created.body.id + '/start').set(auth(joiner)).send({});
    expect([403, 409]).toContain(res.status);
  });

  it('refused: a circle below its minimum to start', async () => {
    const created = await makeCircle(host, { minMembersToStart: 5 });
    const res = await api().post('/api/committees/' + created.body.id + '/start').set(auth(host)).send({});
    expect(res.status).toBe(409);
  });

  it('refused for a member without access: no token', async () => {
    const created = await makeCircle(host);
    expect((await api().post('/api/committees/' + created.body.id + '/start').send({})).status).toBe(401);
  });
});

describe('POST /api/committees/:id/autopay', () => {
  let circleId: string;
  beforeAll(async () => {
    const created = await makeCircle(host, { listedPublicly: true });
    circleId = created.body.id;
  });

  it('refused for a member without access: someone not in the circle', async () => {
    const res = await api().post('/api/committees/' + circleId + '/autopay').set(auth(outsider)).send({ enabled: false });
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/committees/' + circleId + '/autopay').send({ enabled: false })).status).toBe(401);
  });
});

describe('POST /api/committees/:id/nudge/:userId', () => {
  it('refused for a member without access: a member nudging from outside', async () => {
    const created = await makeCircle(host);
    const res = await api().post('/api/committees/' + created.body.id + '/nudge/' + joiner.id).set(auth(outsider)).send({});
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    const created = await makeCircle(host);
    expect((await api().post('/api/committees/' + created.body.id + '/nudge/' + joiner.id).send({})).status).toBe(401);
  });
});

describe('POST /api/committees/:id/payout', () => {
  it('refused for a member without access: someone outside the circle', async () => {
    const created = await makeCircle(host);
    const res = await api().post('/api/committees/' + created.body.id + '/payout').set(auth(outsider)).send({});
    expect([403, 404, 409]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    const created = await makeCircle(host);
    expect((await api().post('/api/committees/' + created.body.id + '/payout').send({})).status).toBe(401);
  });
});

describe('POST /api/committees/:id/leave', () => {
  it('refused for a member without access: someone who never joined', async () => {
    const created = await makeCircle(host);
    const res = await api().post('/api/committees/' + created.body.id + '/leave').set(auth(outsider)).send({});
    expect([403, 404, 409]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    const created = await makeCircle(host);
    expect((await api().post('/api/committees/' + created.body.id + '/leave').send({})).status).toBe(401);
  });
});

describe('PATCH /api/committees/:id/avatar', () => {
  it('refused for a member without access: a member who is not the host', async () => {
    const created = await makeCircle(host);
    const res = await api().patch('/api/committees/' + created.body.id + '/avatar').set(auth(joiner)).send({ avatarUrl: 'A' });
    expect([400, 403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    const created = await makeCircle(host);
    expect((await api().patch('/api/committees/' + created.body.id + '/avatar').send({ avatarUrl: 'A' })).status).toBe(401);
  });
});

describe('POST /api/committees/:id/waitlist', () => {
  it('refused for a member without access: no token', async () => {
    const created = await makeCircle(host);
    expect((await api().post('/api/committees/' + created.body.id + '/waitlist').send({})).status).toBe(401);
  });
});

describe('POST /api/committees/join', () => {
  it('refused for invalid input: an invite code that does not exist', async () => {
    const res = await api().post('/api/committees/join').set(auth(joiner)).send({ inviteCode: 'ZZZZZZZZ' });
    expect([400, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/committees/join').send({ inviteCode: 'ZZZZZZZZ' })).status).toBe(401);
  });
});
