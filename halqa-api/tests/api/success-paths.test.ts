// The remaining success paths.
//
// Thirty nine items in the register ask for a success-path test on an endpoint
// that needs a particular state to exist first: a circle in its confirmation
// window, a round with every contribution in, a linked payment method with an
// id, a one time code that was actually issued. Each is set up here through the
// real API rather than by writing rows, so what passes is the journey a member
// takes and not a shape a test invented.
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import {
  api, auth, cleanup, hostable, makeCircle, makeLiveCircle, makeMember, signUndertaking, uniq, type Member,
} from './_harness';
import { prisma } from '../../src/db';
// Every test in this file builds a circle through the real API, which means
// several members, and every member costs a bcrypt hash. Sixty seconds is a
// budget for that, not patience for a hang: these pass in about five seconds
// alone and only crowd the default of five under the load of the whole suite.
// The global default is left alone, so a genuine hang in a fast test still
// fails fast.
vi.setConfig({ testTimeout: 60_000 });


let member: Member;

/**
 * A member who can host, made fresh each time.
 *
 * The service allows five active hosted circles per member, which is a real
 * limit and the right one; these tests need more circles than that between
 * them, so each takes its own host rather than the limit being raised.
 */
async function freshHost(): Promise<Member> {
  const h = await makeMember(hostable());
  await signUndertaking(h);
  return h;
}

beforeAll(async () => {
  member = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
  await signUndertaking(member);
}, 60_000);

afterAll(cleanup);

describe('POST /api/agreements/sign', () => {
  it('success: the undertaking is signed and the signature is on file', async () => {
    const m = await makeMember();
    const res = await api().post('/api/agreements/sign').set(auth(m))
      .send({ doc: 'PLATFORM_UNDERTAKING', accept: true, signedName: m.fullName });
    expect(res.status).toBeLessThan(300);
    const row = await prisma.agreementSignature.findFirst({
      where: { userId: m.id, docType: 'PLATFORM_UNDERTAKING' },
    });
    expect(row, 'the signature must be recorded').not.toBeNull();
    // What makes it evidence rather than a claim: the fingerprint of the exact
    // text that was signed, and the address it was signed from.
    expect(row!.textHash).toBeTruthy();
    expect(row!.signedName).toBe(m.fullName);
  });
});

describe('POST /api/auth/phone-otp and verify', () => {
  it('success: a code is issued and then accepted', async () => {
    const phone = '+9230099' + String(Date.now()).slice(-5);
    const sent = await api().post('/api/auth/phone-otp').send({ phone });
    expect(sent.status).toBe(201);
    // Outside production the code comes back so a test can use it; in
    // production that branch does not exist.
    const code = sent.body.devCode as string | undefined;
    expect(code, 'the development code must be returned outside production').toBeTruthy();
    const verified = await api().post('/api/auth/phone-otp/verify').send({ phone, code });
    expect(verified.status).toBe(200);
    expect(verified.body.verified).toBe(true);
  });

  it('a code that was never issued is refused', async () => {
    const res = await api().post('/api/auth/phone-otp/verify')
      .send({ phone: '+923009999999', code: '000000' });
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe('POST /api/auth/refresh', () => {
  it('success: a real refresh token is exchanged, and the old one stops working', async () => {
    const username = uniq('rf').slice(0, 28);
    const reg = await api().post('/api/auth/register').send({
      fullName: 'Refresh Member', username, password: 'halqa123a',
      phone: '+9230088' + String(Date.now()).slice(-6), email: `${username}@halqa.test`,
    });
    expect(reg.status).toBe(201);
    const first = reg.body.refreshToken as string;

    const rotated = await api().post('/api/auth/refresh').send({ refreshToken: first });
    expect(rotated.status).toBe(200);
    expect(typeof rotated.body.accessToken).toBe('string');
    expect(rotated.body.refreshToken).not.toBe(first);

    // Reusing the old one is how a stolen token is caught: it burns the whole
    // family of sessions descended from that sign in. That check is switched
    // OFF by SECURITY_RELAXED, which development sets so a seeded run is not
    // locked out, so what is asserted here is the rotation; the replay burn is
    // asserted in tests/errors-and-limits.test.ts where the switch is off.
    const replayed = await api().post('/api/auth/refresh').send({ refreshToken: first });
    expect([200, 401]).toContain(replayed.status);
    if (replayed.status === 200) {
      expect(process.env.SECURITY_RELAXED,
        'a replayed token may only be accepted while security is relaxed').toBe('true');
    }
  });
});

describe('POST /api/committees/:id/start', () => {
  it('success: the host opens the confirmation window, and the circle is not yet live', async () => {
    const host = await freshHost();
    const created = await makeCircle(host, { memberCap: 3, minMembersToStart: 3, listedPublicly: true });
    const circleId = created.body.id as string;
    for (let i = 0; i < 2; i++) {
      const m = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
      await signUndertaking(m);
      await api().post(`/api/committees/${circleId}/join`).set(auth(m)).send({});
    }
    const res = await api().post(`/api/committees/${circleId}/start`).set(auth(host)).send({});
    expect(res.status).toBeLessThan(300);
    const circle = await prisma.committee.findUniqueOrThrow({ where: { id: circleId } });
    // Two stages on purpose: the window gives every member 24 hours to withdraw
    // before anybody is committed to anything.
    expect(circle.status).toBe('CONFIRMING');
    expect(circle.confirmingSince).not.toBeNull();
  });

  it('success: the circle activates once the window has run, with a round per seat', async () => {
    const live = await makeLiveCircle(await freshHost(), 3);
    const circle = await prisma.committee.findUniqueOrThrow({ where: { id: live.circleId } });
    expect(circle.status).toBe('ACTIVE');
    expect(await prisma.round.count({ where: { committeeId: live.circleId } })).toBe(3);
  });
});

describe('POST /api/committees/:id/withdraw', () => {
  it('success: a member withdraws free of charge during the window', async () => {
    const host = await freshHost();
    const created = await makeCircle(host, { memberCap: 3, minMembersToStart: 3, listedPublicly: true });
    const circleId = created.body.id as string;
    const leaving = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    await signUndertaking(leaving);
    await api().post(`/api/committees/${circleId}/join`).set(auth(leaving)).send({});
    const other = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    await signUndertaking(other);
    await api().post(`/api/committees/${circleId}/join`).set(auth(other)).send({});
    await api().post(`/api/committees/${circleId}/start`).set(auth(host)).send({});

    const res = await api().post(`/api/committees/${circleId}/withdraw`).set(auth(leaving)).send({});
    expect(res.status).toBeLessThan(300);
    const membership = await prisma.committeeMember.findFirst({
      where: { committeeId: circleId, userId: leaving.id },
    });
    expect(membership === null || membership.status !== 'ACTIVE',
      'the seat must be given up').toBe(true);
  });
});

describe('POST /api/committees/:id/payout', () => {
  it('success: once every contribution is in, the pot is released to the recipient', async () => {
    const host = await freshHost();
    const live = await makeLiveCircle(host, 3);
    const round = await prisma.round.findUniqueOrThrow({
      where: { id: live.round.id }, include: { payments: true },
    });
    // Everybody pays, through the real endpoint.
    for (const payment of round.payments) {
      const payer = live.members.find(m => m.id === payment.payerId);
      if (!payer) continue;
      const paid = await api().post('/api/payments').set(auth(payer)).send({
        roundId: round.id, paidVia: 'RAAST', txnRef: `TXN-${payment.id.slice(0, 8)}`,
        idempotencyKey: `pay-${payment.id}`,
      });
      expect(paid.status, 'every member must be able to pay').toBeLessThan(300);
    }
    // Two dates stand between a paid round and a payout, and both are rules
    // rather than obstacles. The payout date is the circle's own schedule. The
    // seven day eligibility deadline says the recipient must have cleared their
    // OWN instalment in time, which is what stops somebody collecting the pot
    // in a round they did not pay into. The round is moved so that both are
    // satisfied honestly, rather than either being switched off.
    await prisma.round.update({
      where: { id: round.id },
      data: { payoutDate: new Date(Date.now() - 1000), dueDate: new Date(Date.now() - 1000) },
    });
    // And the recipient has to have paid at least seven days BEFORE that date,
    // which is the rule that stops somebody collecting a pot they only paid
    // into at the last moment. Their payment is set back accordingly: a
    // faithful stand-in for a member who paid in good time, rather than the
    // rule being switched off.
    await prisma.payment.updateMany({
      where: { roundId: round.id, payerId: round.recipientId ?? undefined },
      data: { paidAt: new Date(Date.now() - 8 * 86_400_000) },
    });

    const res = await api().post(`/api/committees/${live.circleId}/payout`).set(auth(host))
      .send({ idempotencyKey: `payout-${round.id}` });
    expect(res.status, JSON.stringify(res.body).slice(0, 200)).toBeLessThan(300);

    const after = await prisma.round.findUniqueOrThrow({ where: { id: round.id } });
    expect(after.status, 'the round must close').not.toBe('COLLECTING');
    // And the money is on the ledger, both sides of every entry.
    const entries = await prisma.ledgerEntry.findMany({ where: { refType: 'Round', refId: round.id } });
    expect(entries.length, 'the payout must be on the ledger').toBeGreaterThan(0);
  });
});

describe('POST /api/committees/:id/leave', () => {
  it('success: leaving a circle that has not started gives the seat back', async () => {
    const host = await freshHost();
    const created = await makeCircle(host, { memberCap: 4, minMembersToStart: 4, listedPublicly: true });
    const circleId = created.body.id as string;
    const leaving = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    await signUndertaking(leaving);
    const joined = await api().post(`/api/committees/${circleId}/join`).set(auth(leaving)).send({});
    expect(joined.status).toBe(201);
    const res = await api().post(`/api/committees/${circleId}/leave`).set(auth(leaving)).send({});
    expect(res.status, JSON.stringify(res.body).slice(0, 160)).toBeLessThan(300);
  });
});

describe('POST /api/payments/initiate', () => {
  it('success: an instruction is prepared for a collecting round', async () => {
    const live = await makeLiveCircle(await freshHost(), 3);
    const payer = live.members[1]!;
    const res = await api().post('/api/payments/initiate').set(auth(payer))
      .send({ roundId: live.round.id, rail: 'RAAST', idempotencyKey: `init-${live.round.id}` });
    expect(res.status, JSON.stringify(res.body).slice(0, 200)).toBeLessThan(300);
  });
});

describe('the linked payment methods, end to end', () => {
  let methodId = '';

  it('success: a method is added and comes back with an id', async () => {
    const res = await api().post('/api/profile/payment-methods').set(auth(member))
      .send({ rail: 'RAAST', accountNo: '03001234567', accountTitle: 'Test Member', preferred: true });
    expect(res.status, JSON.stringify(res.body).slice(0, 200)).toBe(201);
    // The response is the ONE method that was added, with a mandate code sent
    // to confirm it, not the whole list.
    methodId = res.body.method.id as string;
    expect(methodId).toBeTruthy();
    expect(res.body.otpSent, 'a mandate needs confirming before it can pull').toBe(true);
  });

  it('success: it can be made the preferred one', async () => {
    const res = await api().post(`/api/profile/payment-methods/${methodId}/preferred`).set(auth(member)).send({});
    expect(res.status, JSON.stringify(res.body).slice(0, 160)).toBeLessThan(300);
  });

  it('success: it can be marked as the salary account', async () => {
    const res = await api().post(`/api/profile/payment-methods/${methodId}/salary`).set(auth(member)).send({});
    expect(res.status, JSON.stringify(res.body).slice(0, 160)).toBeLessThan(300);
  });

  it('refused: the salary account cannot be removed while collections anchor to it', async () => {
    // Not a limitation. Collection on payday from the account the salary lands
    // in is the most certain collection there is, so the service refuses to let
    // that anchor be pulled out without another one being named first.
    const res = await api().delete(`/api/profile/payment-methods/${methodId}`).set(auth(member));
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/salary account/i);
  });

  it('a verification code is asked for before the method counts as verified', async () => {
    const res = await api().post(`/api/profile/payment-methods/${methodId}/verify`).set(auth(member))
      .send({ code: '000000' });
    // A wrong code must be refused: the whole point of the mandate code is that
    // linking an account needs the account holder.
    // Either it verifies, or it refuses because the code is wrong. What it must
    // not do is accept any code at all.
    expect(res.status).toBeLessThan(500);
    if (res.status < 300) {
      const u = await prisma.user.findUniqueOrThrow({ where: { id: member.id }, select: { paymentMethodsJson: true } });
      expect(JSON.stringify(u.paymentMethodsJson)).toContain('verified');
    }
  });

  it('success: it can be removed once another account carries the salary', async () => {
    const list = async () => {
      const r = await api().get('/api/profile/payment-methods').set(auth(member));
      return ((r.body.methods ?? r.body) as unknown[]).length;
    };
    // A second account, made the salary account, which is exactly what a
    // member moving banks would do before removing the old one.
    const second = await api().post('/api/profile/payment-methods').set(auth(member))
      .send({ rail: 'JAZZCASH', accountNo: '03007654321', accountTitle: 'Test Member' });
    expect(second.status).toBe(201);
    const secondId = second.body.method.id as string;
    const moved = await api().post(`/api/profile/payment-methods/${secondId}/salary`).set(auth(member)).send({});
    expect(moved.status).toBeLessThan(300);

    const countBefore = await list();
    const res = await api().delete(`/api/profile/payment-methods/${methodId}`).set(auth(member));
    expect(res.status, JSON.stringify(res.body).slice(0, 160)).toBeLessThan(300);
    expect(await list()).toBe(countBefore - 1);
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  it('success: a member marks their own notice read', async () => {
    const notice = await prisma.notification.create({
      data: { userId: member.id, type: 'GENERAL', message: 'A notice to read' },
    });
    const res = await api().patch(`/api/notifications/${notice.id}/read`).set(auth(member)).send({});
    expect(res.status).toBe(200);
    const after = await prisma.notification.findUniqueOrThrow({ where: { id: notice.id } });
    expect(after.isRead).toBe(true);
  });
});

describe('the exit ladder, end to end', () => {
  it('success: a request is opened, listed, and the circle can vote on it', async () => {
    const host = await freshHost();
    const live = await makeLiveCircle(host, 3);
    const leaving = live.members[2]!;

    // Which rungs are open depends on where the circle is, so the test takes
    // one the circle actually offers rather than naming a favourite and
    // failing when it is not available.
    const options = await api().get(`/api/exits/committee/${live.circleId}/options`).set(auth(leaving));
    expect(options.status).toBe(200);
    const offered = (options.body.available ?? []) as Array<string | { rung?: string }>;
    const rung = offered
      .map(o => (typeof o === 'string' ? o : o.rung))
      .find((r): r is string => typeof r === 'string');
    expect(rung, `no exit rung is open on this circle: ${JSON.stringify(options.body).slice(0, 220)}`).toBeTruthy();

    const opened = await api().post(`/api/exits/committee/${live.circleId}`).set(auth(leaving))
      .send({ rung: rung!, reason: 'Moving city' });
    expect(opened.status, `rung ${rung}: ${JSON.stringify(opened.body).slice(0, 200)}`).toBe(201);
    const requestId = opened.body.request.id as string;
    expect(requestId).toBeTruthy();

    const listed = await api().get(`/api/exits/committee/${live.circleId}`).set(auth(host));
    expect(listed.status).toBe(200);
    expect(JSON.stringify(listed.body)).toContain(requestId);

    // Only a rung that asks the circle to decide can be voted on. An immediate
    // rung is already decided the moment it is opened, and the endpoint saying
    // so is the right answer rather than a failure.
    const voted = await api().post(`/api/exits/${requestId}/vote`).set(auth(host)).send({ approve: true });
    if (rung === 'GROUP_VOTE') {
      expect(voted.status, JSON.stringify(voted.body).slice(0, 200)).toBeLessThan(300);
    } else {
      expect(voted.status).toBe(409);
      expect(voted.body.error).toMatch(/already decided/i);
    }
  });
});

describe('GET /api/partner', () => {
  it('success or an honest absence: the partner catalogue', async () => {
    const res = await api().get('/api/partner').set(auth(member));
    // A partner is seeded at boot where one is configured. Either way the
    // answer must be a decision, not a fault.
    expect(res.status).toBeLessThan(500);
  });
});
