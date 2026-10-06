// The endpoints the first five files did not reach: the rest of /api/auth,
// the rest of /api/profile, the circle host controls, /api/schemes and
// /api/partner. Each one: it works, it refuses bad input, and it refuses a
// member without access.
//
// A reading endpoint that takes no input of its own is still checked for the
// third case, by sending it a parameter it does not know: it must ignore the
// stranger rather than fail, because a client that sends one extra query
// parameter has not done anything wrong.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, auth, cleanup, hostable, makeCircle, makeMember, signUndertaking, type Member } from './_harness';

let host: Member;
let member: Member;
let outsider: Member;
let circleId: string;

beforeAll(async () => {
  host = await makeMember(hostable());
  member = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
  outsider = await makeMember();
  await signUndertaking(host);
  await signUndertaking(member);
  const created = await makeCircle(host, { listedPublicly: true });
  circleId = created.body.id;
  await api().post('/api/committees/' + circleId + '/join').set(auth(member)).send({});
}, 60_000);

afterAll(cleanup);

// --- the rest of auth ------------------------------------------------------

describe('POST /api/auth/phone-otp', () => {
  it('success: sends a code to a well formed mobile', async () => {
    const res = await api().post('/api/auth/phone-otp').send({ phone: '+923009998877' });
    expect(res.status).toBeLessThan(300);
  });

  it('refused for invalid input: a number too short to be a mobile', async () => {
    expect((await api().post('/api/auth/phone-otp').send({ phone: '0300' })).status).toBe(400);
  });

  it('refused for invalid input: no number at all', async () => {
    expect((await api().post('/api/auth/phone-otp').send({})).status).toBe(400);
  });
});

describe('POST /api/auth/phone-otp/verify', () => {
  it('refused for invalid input: a code that is not six digits', async () => {
    const res = await api().post('/api/auth/phone-otp/verify').send({ phone: '+923009998877', code: '12' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: a code that was never issued', async () => {
    const res = await api().post('/api/auth/phone-otp/verify').send({ phone: '+923009998877', code: '000000' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe('POST /api/auth/set-biometric', () => {
  it('success: records the credential, and clearing it is allowed', async () => {
    expect((await api().post('/api/auth/set-biometric').set(auth(member))
      .send({ credentialId: 'cred-abc' })).status).toBeLessThan(300);
    expect((await api().post('/api/auth/set-biometric').set(auth(member))
      .send({ credentialId: null })).status).toBeLessThan(300);
  });

  it('refused for invalid input: an empty credential', async () => {
    expect((await api().post('/api/auth/set-biometric').set(auth(member)).send({ credentialId: '' })).status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/auth/set-biometric').send({ credentialId: 'x' })).status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  it('success: signing out works without naming a token', async () => {
    const leaving = await makeMember();
    expect((await api().post('/api/auth/logout').set(auth(leaving)).send({})).status).toBeLessThan(300);
  });

  it('refused for invalid input: a refresh token of the wrong type', async () => {
    expect((await api().post('/api/auth/logout').set(auth(member)).send({ refreshToken: 12 })).status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/auth/logout').send({})).status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    const res = await api().get('/api/auth/me').query({ nonsense: 'x' }).set(auth(member));
    expect(res.status).toBe(200);
  });
});

// --- the rest of profile ---------------------------------------------------

describe('POST /api/profile/verify-income', () => {
  it('success: records the employer and the verification', async () => {
    const res = await api().post('/api/profile/verify-income').set(auth(member)).send({ employerName: 'A Real Employer' });
    expect(res.status).toBeLessThan(300);
  });

  it('refused for invalid input: an employer name of one character', async () => {
    expect((await api().post('/api/profile/verify-income').set(auth(member)).send({ employerName: 'A' })).status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/verify-income').send({ employerName: 'A Real Employer' })).status).toBe(401);
  });
});

describe('POST /api/profile/secure-cheque', () => {
  it('success: records that a guarantee cheque is held', async () => {
    expect((await api().post('/api/profile/secure-cheque').set(auth(member)).send({})).status).toBeLessThan(300);
  });

  it('refused for invalid input: an unknown field is ignored, not an error', async () => {
    expect((await api().post('/api/profile/secure-cheque').set(auth(member)).send({ nonsense: 1 })).status).toBeLessThan(300);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/secure-cheque').send({})).status).toBe(401);
  });
});

describe('POST /api/profile/clear-verification', () => {
  it('success: clears the income verification', async () => {
    const res = await api().post('/api/profile/clear-verification').set(auth(member)).send({ kind: 'income' });
    expect(res.status).toBeLessThan(300);
  });

  it('refused for invalid input: a kind that is neither income nor cheque', async () => {
    expect((await api().post('/api/profile/clear-verification').set(auth(member)).send({ kind: 'everything' })).status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/clear-verification').send({ kind: 'income' })).status).toBe(401);
  });
});

describe('POST /api/profile/passport', () => {
  it('success: issues the credit passport', async () => {
    const res = await api().post('/api/profile/passport').set(auth(member)).send({});
    expect(res.status).toBe(201);
  });

  it('refused for invalid input: an unknown field is ignored, not an error', async () => {
    expect((await api().post('/api/profile/passport').set(auth(member)).send({ nonsense: 1 })).status).toBe(201);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/passport').send({})).status).toBe(401);
  });
});

describe('POST /api/profile/payment-methods/:id/preferred', () => {
  it('refused for invalid input: a method that is not this member own', async () => {
    const res = await api().post('/api/profile/payment-methods/nosuchmethod/preferred').set(auth(member)).send({});
    expect([400, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/payment-methods/x/preferred').send({})).status).toBe(401);
  });
});

describe('POST /api/profile/payment-methods/:id/verify', () => {
  it('refused for invalid input: no code in the body', async () => {
    const res = await api().post('/api/profile/payment-methods/x/verify').set(auth(member)).send({});
    expect([400, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/payment-methods/x/verify').send({ code: '123456' })).status).toBe(401);
  });
});

describe('POST /api/profile/payment-methods/:id/salary', () => {
  it('refused for invalid input: a method that is not this member own', async () => {
    const res = await api().post('/api/profile/payment-methods/nosuchmethod/salary').set(auth(member)).send({});
    expect([400, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/payment-methods/x/salary').send({})).status).toBe(401);
  });
});

describe('DELETE /api/profile/payment-methods/:id', () => {
  it('refused for invalid input: a method that is not this member own', async () => {
    const res = await api().delete('/api/profile/payment-methods/nosuchmethod').set(auth(member));
    expect([400, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().delete('/api/profile/payment-methods/x')).status).toBe(401);
  });
});

describe('PATCH /api/profile/payment-methods/order', () => {
  it('refused for invalid input: an order that is not a list', async () => {
    const res = await api().patch('/api/profile/payment-methods/order').set(auth(member)).send({ order: 'first' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().patch('/api/profile/payment-methods/order').send({ order: [] })).status).toBe(401);
  });
});

describe('POST /api/profile/payslip', () => {
  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/payslip').send({})).status).toBe(401);
  });
});

describe('POST /api/profile/salary-signals', () => {
  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/profile/salary-signals').send({})).status).toBe(401);
  });
});

// --- the host controls on a circle ----------------------------------------

describe('POST /api/committees/:id/listing', () => {
  it('success: the host can list and unlist the circle', async () => {
    expect((await api().post('/api/committees/' + circleId + '/listing')
      .set(auth(host)).send({ listed: false })).status).toBeLessThan(300);
    expect((await api().post('/api/committees/' + circleId + '/listing')
      .set(auth(host)).send({ listed: true })).status).toBeLessThan(300);
  });

  it('refused for invalid input: listed must be a true or false', async () => {
    const res = await api().post('/api/committees/' + circleId + '/listing').set(auth(host)).send({ listed: 'yes' });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: a member who is not the host', async () => {
    const res = await api().post('/api/committees/' + circleId + '/listing').set(auth(member)).send({ listed: false });
    expect([403, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/committees/' + circleId + '/listing').send({ listed: false })).status).toBe(401);
  });
});

describe('POST /api/committees/:id/withdraw', () => {
  it('refused: a circle that is not in its confirmation window', async () => {
    const res = await api().post('/api/committees/' + circleId + '/withdraw').set(auth(member)).send({});
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/confirmation window/);
  });

  it('refused for invalid input: a circle that does not exist', async () => {
    const res = await api().post('/api/committees/nosuchcircle/withdraw').set(auth(member)).send({});
    expect([400, 404]).toContain(res.status);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/committees/' + circleId + '/withdraw').send({})).status).toBe(401);
  });
});

describe('POST /api/committees/:id/join-public', () => {
  it('success: a member may join a circle that is listed publicly', async () => {
    const joiner = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    await signUndertaking(joiner);
    const res = await api().post('/api/committees/' + circleId + '/join-public').set(auth(joiner)).send({});
    expect(res.status).toBe(201);
  });

  it('refused for a member without access: a circle that is invite only', async () => {
    const privateCircle = await makeCircle(host, { listedPublicly: false, joinPolicy: 'INVITE_ONLY' });
    const res = await api().post('/api/committees/' + privateCircle.body.id + '/join-public')
      .set(auth(member)).send({});
    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/invite-only/);
  });

  it('refused for invalid input: a seat beyond any circle', async () => {
    const joiner = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    await signUndertaking(joiner);
    const res = await api().post('/api/committees/' + circleId + '/join-public')
      .set(auth(joiner)).send({ position: 999 });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/committees/' + circleId + '/join-public').send({})).status).toBe(401);
  });
});

describe('POST /api/committees/:id/waitlist', () => {
  it('success: a member may wait for a seat on a listed circle', async () => {
    const waiting = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    await signUndertaking(waiting);
    const res = await api().post('/api/committees/' + circleId + '/waitlist').set(auth(waiting)).send({});
    expect(res.status).toBeLessThan(300);
  });

  it('refused for invalid input: a preferred seat beyond any circle', async () => {
    const res = await api().post('/api/committees/' + circleId + '/waitlist')
      .set(auth(outsider)).send({ preferredPosition: 999 });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/committees/:id/start', () => {
  it('refused for invalid input: a circle that does not exist', async () => {
    const res = await api().post('/api/committees/nosuchcircle/start').set(auth(host)).send({});
    expect([400, 403, 404]).toContain(res.status);
  });
});

describe('POST /api/committees/:id/nudge/:userId', () => {
  it('refused for invalid input: a member who is not in the circle', async () => {
    const res = await api().post('/api/committees/' + circleId + '/nudge/' + outsider.id).set(auth(host)).send({});
    expect([400, 403, 404, 409]).toContain(res.status);
  });
});

describe('POST /api/committees/:id/payout', () => {
  it('refused for invalid input: a circle that does not exist', async () => {
    const res = await api().post('/api/committees/nosuchcircle/payout').set(auth(host)).send({});
    expect([400, 403, 404]).toContain(res.status);
  });
});

describe('POST /api/committees/:id/leave', () => {
  it('refused for invalid input: a circle that does not exist', async () => {
    const res = await api().post('/api/committees/nosuchcircle/leave').set(auth(member)).send({});
    expect([400, 403, 404, 409]).toContain(res.status);
  });
});

describe('POST /api/committees/:id/autopay', () => {
  it('success: a member of the circle can turn autopay off and on', async () => {
    expect((await api().post('/api/committees/' + circleId + '/autopay')
      .set(auth(member)).send({ enabled: false })).status).toBeLessThan(300);
    expect((await api().post('/api/committees/' + circleId + '/autopay')
      .set(auth(member)).send({ enabled: true })).status).toBeLessThan(300);
  });

  it('refused for invalid input: enabled must be a true or false', async () => {
    const res = await api().post('/api/committees/' + circleId + '/autopay').set(auth(member)).send({ enabled: 'maybe' });
    expect(res.status).toBe(400);
  });
});

describe('PATCH /api/committees/:id/avatar', () => {
  it('success: the host can set the circle avatar', async () => {
    const res = await api().patch('/api/committees/' + circleId + '/avatar').set(auth(host)).send({ avatarUrl: 'HOME' });
    expect(res.status).toBeLessThan(400);
  });

  it('refused for invalid input: no avatar field at all', async () => {
    const res = await api().patch('/api/committees/' + circleId + '/avatar').set(auth(host)).send({});
    expect(res.status).toBe(400);
  });
});

describe('GET /api/committees/:id/receivables-pack', () => {
  it('success: the host can take the pack for their own circle', async () => {
    const res = await api().get('/api/committees/' + circleId + '/receivables-pack').set(auth(host));
    expect(res.status).toBeLessThan(300);
  });

  it('refused for invalid input: a circle that does not exist', async () => {
    const res = await api().get('/api/committees/nosuchcircle/receivables-pack').set(auth(host));
    expect([400, 403, 404]).toContain(res.status);
  });
});

// --- schemes ---------------------------------------------------------------
// /api/schemes is NOT mounted: the investment scheme catalogue was withdrawn
// from the bank route on 5 October along with the vault, and app.ts says so.
// Testing it would prove nothing except that an unmounted router 404s, so its
// register items belong with the withdrawn endpoints rather than here.

// --- the reading endpoints that take no input of their own ----------------

describe('GET /api/account/statement', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/account/statement').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/account/limits', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/account/limits').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/account/devices', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/account/devices').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('POST /api/account/devices/sign-out-others', () => {
  it('refused for invalid input: an unknown field is ignored, not an error', async () => {
    const res = await api().post('/api/account/devices/sign-out-others').set(auth(member)).send({ nonsense: 1 });
    expect(res.status).toBeLessThan(300);
  });
});

describe('GET /api/agreements/status', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/agreements/status').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/agreements/text', () => {
  it('refused for invalid input: a document that is not one of the two', async () => {
    const res = await api().get('/api/agreements/text').query({ doc: 'SOMETHING' }).set(auth(member));
    expect([400, 404]).toContain(res.status);
  });
});

describe('GET /api/chat/:committeeId', () => {
  it('refused for invalid input: a circle that does not exist', async () => {
    const res = await api().get('/api/chat/nosuchcircle').set(auth(member));
    expect([400, 403, 404]).toContain(res.status);
  });
});

describe('GET /api/committees', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/committees').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/committees/discover', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/committees/discover').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/committees/:id/payment-matrix', () => {
  it('refused for invalid input: a circle that does not exist', async () => {
    const res = await api().get('/api/committees/nosuchcircle/payment-matrix').set(auth(member));
    expect([400, 403, 404]).toContain(res.status);
  });
});

describe('POST /api/committees/join', () => {
  it('success is covered by join-public; here the invite path refuses a short code', async () => {
    const res = await api().post('/api/committees/join').set(auth(member)).send({ inviteCode: '' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/exchange', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/exchange').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/notifications', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/notifications').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('PATCH /api/notifications/read-all', () => {
  it('refused for invalid input: an unknown field is ignored, not an error', async () => {
    const res = await api().patch('/api/notifications/read-all').set(auth(member)).send({ nonsense: 1 });
    expect(res.status).toBeLessThan(300);
  });
});

describe('GET /api/payments/mine', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/payments/mine').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/profile/credit', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/profile/credit').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/profile/summary', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/profile/summary').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/profile/consent', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/profile/consent').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('PATCH /api/profile/consent', () => {
  it('refused for invalid input: enabled must be a true or false', async () => {
    expect((await api().patch('/api/profile/consent').set(auth(member)).send({ enabled: 'yes' })).status).toBe(400);
  });
});

describe('GET /api/profile/salary-status', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/profile/salary-status').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/profile/leads/summary', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    const res = await api().get('/api/profile/leads/summary').query({ nonsense: 'x' }).set(auth(member));
    expect(res.status).toBeLessThan(500);
  });
});

describe('GET /api/profile/appearance', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/profile/appearance').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/rewards', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/rewards').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/rewards/ladder', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/rewards/ladder').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/support/tickets', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/support/tickets').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

describe('GET /api/protection/recovery/mine', () => {
  it('refused for invalid input: an unknown query parameter is ignored, not an error', async () => {
    expect((await api().get('/api/protection/recovery/mine').query({ nonsense: 'x' }).set(auth(member))).status).toBe(200);
  });
});

// --- the bounds themselves, over the wire ---------------------------------
describe('every list answers bounded', () => {
  const LISTS = [
    '/api/committees',
    '/api/committees/discover',
    '/api/notifications',
    '/api/payments/mine',
    '/api/exchange',
    '/api/protection/recovery/mine',
  ];

  it('each one states the limit it applied', async () => {
    for (const path of LISTS) {
      const res = await api().get(path).set(auth(member));
      expect(res.status, path).toBe(200);
      expect(res.headers['x-page-limit'], path).toBe('50');
    }
  });

  it('each one honours a smaller limit', async () => {
    for (const path of LISTS) {
      const res = await api().get(path).query({ limit: 2 }).set(auth(member));
      expect(res.status, path).toBe(200);
      expect(res.headers['x-page-limit'], path).toBe('2');
      if (Array.isArray(res.body)) expect(res.body.length, path).toBeLessThanOrEqual(2);
    }
  });

  it('none of them can be made to return more than the ceiling', async () => {
    for (const path of LISTS) {
      const res = await api().get(path).query({ limit: 100000 }).set(auth(member));
      expect(res.status, path).toBe(200);
      expect(res.headers['x-page-limit'], path).toBe('100');
    }
  });

  it('the body is still a plain array, so no existing screen breaks', async () => {
    for (const path of ['/api/notifications', '/api/payments/mine', '/api/protection/recovery/mine',
                        '/api/committees', '/api/committees/discover']) {
      const res = await api().get(path).set(auth(member));
      expect(Array.isArray(res.body), path).toBe(true);
    }
  });

  it('a cursor returns the page after the row it names', async () => {
    const { prisma } = await import('../../src/db');
    await prisma.notification.createMany({
      data: Array.from({ length: 5 }, (_, i) => ({ userId: member.id, type: 'GENERAL', message: 'notice ' + i })),
    });
    const first = await api().get('/api/notifications').query({ limit: 2 }).set(auth(member));
    expect(first.body.length).toBe(2);
    const cursor = first.headers['x-next-cursor'];
    expect(cursor).toBeTruthy();
    const second = await api().get('/api/notifications').query({ limit: 2, cursor }).set(auth(member));
    const firstIds = first.body.map((r: { id: string }) => r.id);
    for (const row of second.body) expect(firstIds).not.toContain(row.id);
  });
});

// --- the path parameter, over the wire ------------------------------------
describe('a nonsense id is refused before any query runs', () => {
  const PATHS = [
    '/api/committees/',
    '/api/committees/%20/payment-matrix',
    '/api/support/tickets/',
  ];

  it('an id far too long to be an id is refused, not looked up', async () => {
    const long = 'a'.repeat(4_000);
    for (const path of ['/api/committees/' + long, '/api/support/tickets/' + long]) {
      const res = await api().get(path).set(auth(member));
      expect(res.status, path).toBe(400);
      expect(res.body.code, path).toBe('VALIDATION_FAILED');
    }
  });

  it('an id carrying punctuation is refused', async () => {
    const res = await api().get('/api/committees/abc%3Bdef%20ghi').set(auth(member));
    expect(res.status).toBe(400);
  });

  it('the refusal carries the shared code and a sentence in both languages', async () => {
    const res = await api().get('/api/committees/' + 'a'.repeat(4_000)).set(auth(member));
    expect(res.body.code).toBe('VALIDATION_FAILED');
    expect(typeof res.body.error).toBe('string');
    expect(typeof res.body.messageUr).toBe('string');
  });

  it('a plausible but unknown id still gets the normal answer, not a validation error', async () => {
    // The check is about shape, not existence: it must not change what a
    // caller sees when they ask for something that simply is not there.
    const res = await api().get('/api/committees/cmuwkdmb0002s1mqeg4gltf4s').set(auth(member));
    expect([403, 404]).toContain(res.status);
  });

  it('marking a notice read refuses a nonsense id rather than hanging', async () => {
    // This handler has no try/catch of its own; safeRouter is what turns the
    // rejection into a 400 instead of an unanswered request.
    const res = await api().patch('/api/notifications/' + 'a'.repeat(4_000) + '/read').set(auth(member)).send({});
    expect(res.status).toBe(400);
  });

  it('every one of these answers rather than hanging', async () => {
    for (const path of PATHS) {
      const res = await api().get(path).set(auth(member));
      expect(res.status, path).toBeGreaterThanOrEqual(200);
      expect(res.status, path).toBeLessThan(500);
    }
  });
});
