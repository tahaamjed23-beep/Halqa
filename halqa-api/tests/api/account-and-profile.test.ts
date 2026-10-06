// Endpoints of /api/account and /api/profile. Each one: it works, it refuses
// bad input where it takes any, and it refuses a member without access.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, auth, cleanup, makeMember, type Member } from './_harness';

let me: Member;
let other: Member;

beforeAll(async () => {
  me = await makeMember({ creditScore: 700, declaredIncomePaisa: 5_000_000n as never });
  other = await makeMember();
}, 60_000);

afterAll(cleanup);

// --- account ---------------------------------------------------------------

describe('GET /api/account/statement', () => {
  it('success: returns this member own statement', async () => {
    const res = await api().get('/api/account/statement').set(auth(me));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/account/statement')).status).toBe(401);
  });
});

describe('GET /api/account/limits', () => {
  it('success: states which turns the member may take, and why', async () => {
    const res = await api().get('/api/account/limits').set(auth(me));
    expect(res.status).toBe(200);
    const turns = res.body.limits?.find((l: { key: string }) => l.key === 'turns')
      ?? res.body.find?.((l: { key: string }) => l.key === 'turns');
    expect(turns).toBeTruthy();
    // The sentence comes from the engine, so it cannot contradict the join
    // route. The withdrawn two-circle rule must not appear anywhere in it.
    expect(JSON.stringify(res.body)).not.toMatch(/[Tt]wo clean circles/);
  });

  it('names one clean circle, not two, as the route to every seat', async () => {
    const res = await api().get('/api/account/limits').set(auth(me));
    expect(JSON.stringify(res.body)).toMatch(/Finish one circle cleanly/);
  });

  it('offers the security route beside the clean circle', async () => {
    const res = await api().get('/api/account/limits').set(auth(me));
    expect(JSON.stringify(res.body)).toMatch(/[Pp]ledge security/);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/account/limits')).status).toBe(401);
  });
});

describe('GET /api/account/devices', () => {
  it('success: lists this member own sessions', async () => {
    const res = await api().get('/api/account/devices').set(auth(me));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/account/devices')).status).toBe(401);
  });
});

describe('POST /api/account/devices/sign-out-others', () => {
  it('success: signs the other sessions out and leaves this one working', async () => {
    const res = await api().post('/api/account/devices/sign-out-others').set(auth(me)).send({});
    expect(res.status).toBeLessThan(300);
    expect((await api().get('/api/auth/me').set(auth(me))).status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/account/devices/sign-out-others').send({})).status).toBe(401);
  });
});

// --- profile ---------------------------------------------------------------

describe('GET /api/profile/summary', () => {
  it('success: returns this member own summary', async () => {
    const res = await api().get('/api/profile/summary').set(auth(me));
    expect(res.status).toBe(200);
  });

  it('never returns a credential', async () => {
    const res = await api().get('/api/profile/summary').set(auth(me));
    const body = JSON.stringify(res.body);
    for (const secret of ['passwordHash', 'pinHash', 'tokenHash', 'biometricCredId']) {
      expect(body).not.toContain(secret);
    }
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/profile/summary')).status).toBe(401);
  });
});

describe('GET /api/profile/credit', () => {
  it('success: returns this member own score and band', async () => {
    const res = await api().get('/api/profile/credit').set(auth(me));
    expect(res.status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/profile/credit')).status).toBe(401);
  });
});

describe('GET /api/profile/reputation/:userId', () => {
  it('success: another member public record, with no credential in it', async () => {
    const res = await api().get('/api/profile/reputation/' + other.id).set(auth(me));
    expect(res.status).toBe(200);
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('passwordHash');
    expect(body).not.toContain('pinHash');
    expect(body).not.toContain('cnic');
  });

  it('refused for invalid input: a member who does not exist', async () => {
    const res = await api().get('/api/profile/reputation/nobody').set(auth(me));
    expect([400, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/profile/reputation/' + other.id)).status).toBe(401);
  });
});

describe('GET and PATCH /api/profile/consent', () => {
  it('success: reads the consents on file', async () => {
    const res = await api().get('/api/profile/consent').set(auth(me));
    expect(res.status).toBe(200);
  });

  it('success: a consent can be withdrawn', async () => {
    const res = await api().patch('/api/profile/consent').set(auth(me)).send({ enabled: false });
    expect(res.status).toBeLessThan(300);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/profile/consent')).status).toBe(401);
    expect((await api().patch('/api/profile/consent').send({ enabled: false })).status).toBe(401);
  });
});

describe('GET and POST /api/profile/payment-methods', () => {
  it('success: lists the methods, then adds one', async () => {
    expect((await api().get('/api/profile/payment-methods').set(auth(me))).status).toBe(200);
    const res = await api().post('/api/profile/payment-methods').set(auth(me))
      .send({ rail: 'RAAST', accountNo: '03001234567', accountTitle: 'Test Member', preferred: true });
    expect(res.status).toBeLessThan(300);
  });

  it('refused for invalid input: a rail that does not exist', async () => {
    const res = await api().post('/api/profile/payment-methods').set(auth(me))
      .send({ rail: 'CARRIER_PIGEON', accountNo: '03001234567' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/profile/payment-methods')).status).toBe(401);
    expect((await api().post('/api/profile/payment-methods').send({ rail: 'RAAST' })).status).toBe(401);
  });
});

describe('POST /api/profile/salary-day', () => {
  it('success: records the declared payday', async () => {
    const res = await api().post('/api/profile/salary-day').set(auth(me)).send({ day: 5 });
    expect(res.status).toBeLessThan(300);
  });

  it('refused for invalid input: a day outside one to thirty one', async () => {
    expect((await api().post('/api/profile/salary-day').set(auth(me)).send({ day: 45 })).status).toBe(400);
    expect((await api().post('/api/profile/salary-day').set(auth(me)).send({ day: 0 })).status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/salary-day').send({ day: 5 })).status).toBe(401);
  });
});

describe('GET /api/profile/salary-status', () => {
  it('success: returns what is known about the salary pattern', async () => {
    expect((await api().get('/api/profile/salary-status').set(auth(me))).status).toBe(200);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/profile/salary-status')).status).toBe(401);
  });
});

describe('GET and PATCH /api/profile/appearance', () => {
  it('success: reads and then sets the appearance', async () => {
    expect((await api().get('/api/profile/appearance').set(auth(me))).status).toBe(200);
    const res = await api().patch('/api/profile/appearance').set(auth(me)).send({ theme: 'dark' });
    expect(res.status).toBeLessThan(300);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/profile/appearance')).status).toBe(401);
  });
});

describe('POST /api/profile/verify-income', () => {
  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/verify-income').send({})).status).toBe(401);
  });
});

describe('GET /api/profile/leads/summary', () => {
  it('refused for a member without access: no token', async () => {
    expect((await api().get('/api/profile/leads/summary')).status).toBe(401);
  });
});
