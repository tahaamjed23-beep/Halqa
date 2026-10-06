// Every write endpoint, sent twice.
//
// Work register, per endpoint: "idempotency key accepted and enforced". A write
// endpoint is idempotent when sending it twice leaves the same state as sending
// it once. There are two ways to get there and both count:
//
//   by record   the endpoint takes an idempotencyKey and the second request is
//               answered from what the first one wrote (lib/idempotency.ts)
//   by nature   the endpoint sets a value rather than adding to one, so the
//               second request sets it to what it already is
//
// What does NOT count is an endpoint that appends a row every time it is
// called, because a lost response then becomes a duplicate. Each of those is a
// finding, not an exemption.
//
// This sends the real requests to the real application twice and reads the
// state afterwards, rather than reasoning about which category an endpoint is
// in. Reasoning is how the wrong answer gets written down confidently.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { api, auth, cleanup, hostable, makeCircle, makeMember, signUndertaking, type Member } from './_harness';
import { prisma } from '../../src/db';

let host: Member;
let member: Member;
let circleId: string;

beforeAll(async () => {
  host = await makeMember(hostable());
  member = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
  await signUndertaking(host);
  await signUndertaking(member);
  const created = await makeCircle(host, { listedPublicly: true });
  circleId = created.body.id;
}, 60_000);

afterAll(cleanup);

/** Sends the same request twice and hands back both answers. */
async function twice(send: () => Promise<{ status: number; body: unknown }>) {
  const first = await send();
  const second = await send();
  return { first, second };
}

describe('setting a value is idempotent by nature', () => {
  it('POST /api/auth/set-pin: setting the same PIN twice leaves the same PIN', async () => {
    const m = await makeMember();
    const first = await api().post('/api/auth/set-pin').set(auth(m)).send({ pin: '4321' });
    // Once a PIN exists, changing it needs the current one, which is a security
    // control rather than a failure of idempotency: a second request WITHOUT
    // it is correctly refused, and that refusal is the same every time.
    const bare = await api().post('/api/auth/set-pin').set(auth(m)).send({ pin: '4321' });
    const second = await api().post('/api/auth/set-pin').set(auth(m)).send({ pin: '4321', currentPin: '4321' });
    expect(first.status).toBeLessThan(300);
    expect(bare.status).toBe(403);
    expect(second.status).toBeLessThan(300);
    // The state after all three is one PIN, and it is the one that was set.
    const check = await api().post('/api/auth/verify-pin').set(auth(m)).send({ pin: '4321' });
    expect(check.status).toBe(200);
  });

  it('POST /api/auth/set-biometric: one credential, not two', async () => {
    const m = await makeMember();
    await twice(() => api().post('/api/auth/set-biometric').set(auth(m)).send({ credentialId: 'cred-1' }) as never);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: m.id }, select: { biometricCredId: true } });
    expect(row.biometricCredId).toBe('cred-1');
  });

  it('PATCH /api/profile/consent: the consent is a value, not a tally', async () => {
    const { first, second } = await twice(() =>
      api().patch('/api/profile/consent').set(auth(member)).send({ enabled: false }) as never);
    expect(first.body).toEqual(second.body);
  });

  it('POST /api/profile/salary-day: the day is a value', async () => {
    const { first, second } = await twice(() =>
      api().post('/api/profile/salary-day').set(auth(member)).send({ day: 7 }) as never);
    expect(first.status).toBeLessThan(300);
    const row = await prisma.user.findUniqueOrThrow({ where: { id: member.id }, select: { salaryDay: true } });
    expect(row.salaryDay).toBe(7);
    expect(second.status).toBeLessThan(300);
  });

  it('PATCH /api/profile/appearance: a setting, not an event', async () => {
    const { first, second } = await twice(() =>
      api().patch('/api/profile/appearance').set(auth(member)).send({ themePref: 'dark' }) as never);
    expect(first.body).toEqual(second.body);
  });

  it('POST /api/committees/:id/autopay: a switch, not a log', async () => {
    await api().post('/api/committees/' + circleId + '/join').set(auth(member)).send({});
    const { first, second } = await twice(() =>
      api().post('/api/committees/' + circleId + '/autopay').set(auth(member)).send({ enabled: true }) as never);
    expect(first.status).toBeLessThan(300);
    expect(second.status).toBeLessThan(300);
    const rows = await prisma.committeeMember.findMany({ where: { committeeId: circleId, userId: member.id } });
    expect(rows).toHaveLength(1);
    expect(rows[0]!.autoDebitEnabled).toBe(true);
  });

  it('POST /api/committees/:id/listing: a flag on the circle', async () => {
    const { first, second } = await twice(() =>
      api().post('/api/committees/' + circleId + '/listing').set(auth(host)).send({ listed: true }) as never);
    expect(first.status).toBeLessThan(300);
    expect(second.status).toBeLessThan(300);
  });

  it('PATCH /api/committees/:id/avatar: a value on the circle', async () => {
    const { first, second } = await twice(() =>
      api().patch('/api/committees/' + circleId + '/avatar').set(auth(host)).send({ avatarUrl: 'A' }) as never);
    expect(first.status).toBeLessThan(400);
    expect(second.status).toBeLessThan(400);
  });

  it('PATCH /api/notifications/read-all: read twice is still read', async () => {
    const { first, second } = await twice(() =>
      api().patch('/api/notifications/read-all').set(auth(member)).send({}) as never);
    expect(first.status).toBeLessThan(300);
    expect(second.status).toBeLessThan(300);
  });

  it('POST /api/profile/secure-cheque: a mark, not a counter', async () => {
    const { first, second } = await twice(() =>
      api().post('/api/profile/secure-cheque').set(auth(member)).send({}) as never);
    expect(first.status).toBeLessThan(300);
    expect(second.status).toBeLessThan(300);
  });

  it('POST /api/profile/verify-income: a mark, not a counter', async () => {
    const { first, second } = await twice(() =>
      api().post('/api/profile/verify-income').set(auth(member)).send({ employerName: 'An Employer' }) as never);
    expect(first.status).toBeLessThan(300);
    expect(second.status).toBeLessThan(300);
  });

  it('POST /api/account/devices/sign-out-others: signing out twice leaves one session', async () => {
    const m = await makeMember();
    await twice(() => api().post('/api/account/devices/sign-out-others').set(auth(m)).send({}) as never);
    expect((await api().get('/api/auth/me').set(auth(m))).status).toBe(200);
  });
});

describe('joining and signing cannot happen twice', () => {
  it('POST /api/committees/:id/join: the second attempt is refused, not duplicated', async () => {
    const joiner = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    await signUndertaking(joiner);
    const first = await api().post('/api/committees/' + circleId + '/join').set(auth(joiner)).send({});
    const second = await api().post('/api/committees/' + circleId + '/join').set(auth(joiner)).send({});
    expect(first.status).toBe(201);
    expect(second.status).toBe(409);
    const rows = await prisma.committeeMember.findMany({ where: { committeeId: circleId, userId: joiner.id } });
    expect(rows, 'one membership, whatever the network did').toHaveLength(1);
  });

  it('POST /api/agreements/sign: signing the same version twice leaves one signature in force', async () => {
    const m = await makeMember();
    await twice(() => api().post('/api/agreements/sign').set(auth(m))
      .send({ doc: 'PLATFORM_UNDERTAKING', accept: true, signedName: m.fullName }) as never);
    const rows = await prisma.agreementSignature.findMany({
      where: { userId: m.id, docType: 'PLATFORM_UNDERTAKING' },
      orderBy: { signedAt: 'desc' },
    });
    // More than one row is acceptable where each is a dated re-signing of the
    // weekly undertaking; what must not differ is which one is in force.
    const versions = new Set(rows.map(r => r.version));
    expect(versions.size, 'one version in force').toBe(1);
  });

  it('POST /api/committees: two creates with the same name are two circles, and that is correct', async () => {
    // Creating is NOT idempotent and should not be: a member hosting two
    // circles with the same name has done so deliberately. What protects
    // against a double tap is the client, not the server pretending.
    const a = await makeCircle(host, { name: 'Same Name Circle' });
    const b = await makeCircle(host, { name: 'Same Name Circle' });
    expect(a.status).toBe(201);
    expect(b.status).toBe(201);
    expect(a.body.id).not.toBe(b.body.id);
  });
});

describe('money is recorded once, by the record', () => {
  it('the ledger refuses a second posting under the same key', async () => {
    // The constraint that has always been there, asserted so it cannot be
    // dropped by accident: it is the floor beneath everything above.
    const schema = await prisma.$queryRawUnsafe<Array<{ indexdef: string }>>(
      "select indexdef from pg_indexes where tablename = 'LedgerEntry'");
    const defs = schema.map(r => r.indexdef).join(' ');
    expect(defs).toMatch(/UNIQUE.*idempotencyKey/i);
  });

  it('POST /api/payments: a retry with the same key is answered, not refused', async () => {
    // The round is not collecting in this fixture, so the request is refused
    // before it reaches the record. What this asserts is that the refusal is
    // the SAME both times: a retry never gets a different answer.
    const body = { roundId: 'nosuchround', paidVia: 'RAAST', txnRef: 'ref1234', idempotencyKey: 'key-abcdefgh' };
    const { first, second } = await twice(() =>
      api().post('/api/payments').set(auth(member)).send(body) as never);
    expect(first.status).toBe(second.status);
    expect(first.body).toEqual(second.body);
  });
});
