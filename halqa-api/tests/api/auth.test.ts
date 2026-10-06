// Endpoints of /api/auth. Each one: it works, it refuses bad input, and where
// it needs a signed-in member, it refuses a request without access.
import { afterAll, describe, expect, it } from 'vitest';
import { api, auth, cleanup, makeMember, uniq } from './_harness';

afterAll(cleanup);

describe('POST /api/auth/register', () => {
  it('success: makes the account and returns a token', async () => {
    const username = uniq('r').slice(0, 28);
    const res = await api().post('/api/auth/register').send({
      fullName: 'Reg Member', username, password: 'halqa123a',
      phone: '+923001234501', email: `${username}@halqa.test`,
    });
    expect(res.status).toBe(201);
    expect(res.body.user.username).toBe(username.toLowerCase());
    expect(typeof res.body.accessToken).toBe('string');
    expect(res.body.user.passwordHash).toBeUndefined();  // never leaves the service
  });

  it('refused for invalid input: a password under eight characters', async () => {
    const username = uniq('r').slice(0, 28);
    const res = await api().post('/api/auth/register').send({
      fullName: 'Reg Member', username, password: 'short1',
      phone: '+923001234502', email: `${username}@halqa.test`,
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBeTruthy();   // the shared code list, lib/errors.ts
  });

  it('refused for invalid input: no email at all', async () => {
    const res = await api().post('/api/auth/register').send({
      fullName: 'Reg Member', username: uniq('r').slice(0, 28), password: 'halqa123a',
      phone: '+923001234503',
    });
    expect(res.status).toBe(400);
  });

  it('refused for invalid input: a CNIC that is not thirteen digits', async () => {
    const username = uniq('r').slice(0, 28);
    const res = await api().post('/api/auth/register').send({
      fullName: 'Reg Member', username, password: 'halqa123a',
      phone: '+923001234504', email: `${username}@halqa.test`, cnic: '123',
    });
    expect(res.status).toBe(400);
  });

  it('refuses a username already taken, and says which field', async () => {
    const first = await makeMember();
    const res = await api().post('/api/auth/register').send({
      fullName: 'Reg Member', username: first.username, password: 'halqa123a',
      phone: '+923001234505', email: `${uniq('e')}@halqa.test`,
    });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/exists/i);
  });
});

describe('POST /api/auth/login', () => {
  it('success: returns a token for the right password', async () => {
    const m = await makeMember();
    const res = await api().post('/api/auth/login').send({ identity: m.username, password: 'halqa123a' });
    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('refused for invalid input: no password', async () => {
    const m = await makeMember();
    const res = await api().post('/api/auth/login').send({ identity: m.username });
    expect(res.status).toBe(400);
  });

  it('refused for a member without access: the wrong password', async () => {
    const m = await makeMember();
    const res = await api().post('/api/auth/login').send({ identity: m.username, password: 'wrongpass123' });
    expect(res.status).toBe(401);
    expect(JSON.stringify(res.body)).not.toMatch(/hash/i);  // never says why in detail
  });
});

describe('GET /api/auth/me', () => {
  it('success: returns the signed-in member', async () => {
    const m = await makeMember();
    const res = await api().get('/api/auth/me').set(auth(m));
    expect(res.status).toBe(200);
    expect(res.body.id ?? res.body.user?.id).toBe(m.id);
  });

  it('refused for a member without access: no token', async () => {
    const res = await api().get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('refused for a member without access: a token that is not ours', async () => {
    const res = await api().get('/api/auth/me').set({ Authorization: 'Bearer not.a.real.token' });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/set-pin', () => {
  it('success: sets the app PIN', async () => {
    const m = await makeMember();
    const res = await api().post('/api/auth/set-pin').set(auth(m)).send({ pin: '1357' });
    expect(res.status).toBeLessThan(300);
  });

  it('refused for invalid input: a PIN that is not four to six digits', async () => {
    const m = await makeMember();
    expect((await api().post('/api/auth/set-pin').set(auth(m)).send({ pin: '12' })).status).toBe(400);
    expect((await api().post('/api/auth/set-pin').set(auth(m)).send({ pin: 'abcd' })).status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/auth/set-pin').send({ pin: '1357' })).status).toBe(401);
  });
});

describe('POST /api/auth/verify-pin', () => {
  it('success: accepts the PIN just set', async () => {
    const m = await makeMember();
    await api().post('/api/auth/set-pin').set(auth(m)).send({ pin: '2468' });
    const res = await api().post('/api/auth/verify-pin').set(auth(m)).send({ pin: '2468' });
    expect(res.status).toBe(200);
  });

  it('refused for invalid input: a PIN of the wrong shape', async () => {
    const m = await makeMember();
    expect((await api().post('/api/auth/verify-pin').set(auth(m)).send({ pin: 'xx' })).status).toBe(400);
  });

  it('refused for a member without access: no token', async () => {
    expect((await api().post('/api/auth/verify-pin').send({ pin: '2468' })).status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('refused for invalid input: no refresh token in the body', async () => {
    expect((await api().post('/api/auth/refresh').send({})).status).toBe(400);
  });

  it('refused for a member without access: a refresh token that was never issued', async () => {
    // A token that will not even parse is the client's problem, so it must come
    // back 401 and not 500. It answered 500 until 2026-10-06, which told the
    // caller to retry something that can only ever fail.
    const res = await api().post('/api/auth/refresh').send({ refreshToken: 'nope' });
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('SIGN_IN_REQUIRED');
  });

  it('refused for a member without access: a well formed token we never signed', async () => {
    const forged = ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      'eyJ1c2VySWQiOiJ4IiwiaWF0IjoxNzAwMDAwMDAwfQ', 'bm90YXNpZ25hdHVyZQ'].join('.');
    const res = await api().post('/api/auth/refresh').send({ refreshToken: forged });
    expect(res.status).toBe(401);
  });
});
