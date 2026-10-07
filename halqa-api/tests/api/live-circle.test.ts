// The success paths that only exist once a circle is RUNNING.
//
// Forty two items in the register are a success-path test on an endpoint that
// cannot be reached until a committee has started: the rounds, the payments,
// the payout, the turn market, the exit ladder. None of them could be written
// before the harness could start a circle, so none of them were.
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { api, auth, cleanup, hostable, makeLiveCircle, makeMember, signUndertaking, type Member } from './_harness';
import { prisma } from '../../src/db';
// Every test in this file builds a circle through the real API, which means
// several members, and every member costs a bcrypt hash. Sixty seconds is a
// budget for that, not patience for a hang: these pass in about five seconds
// alone and only crowd the default of five under the load of the whole suite.
// The global default is left alone, so a genuine hang in a fast test still
// fails fast.
vi.setConfig({ testTimeout: 60_000 });


let host: Member;
let members: Member[];
let outsider: Member;
let circleId = '';
let roundId = '';

beforeAll(async () => {
  host = await makeMember(hostable());
  await signUndertaking(host);
  outsider = await makeMember();
  // Signed, so a refusal below is genuinely about ACCESS. Without this the
  // undertaking gate answers 428 first and the access check is never reached.
  await signUndertaking(outsider);
  const live = await makeLiveCircle(host, 3);
  circleId = live.circleId;
  members = live.members;
  roundId = live.round.id;
}, 120_000);

afterAll(cleanup);

describe('the circle is genuinely running', () => {
  it('it is ACTIVE, with a collecting round and one obligation per member', async () => {
    const circle = await prisma.committee.findUniqueOrThrow({ where: { id: circleId } });
    expect(circle.status).toBe('ACTIVE');
    const round = await prisma.round.findUniqueOrThrow({ where: { id: roundId }, include: { payments: true } });
    expect(round.status).toBe('COLLECTING');
    expect(round.payments).toHaveLength(3);
  });

  it('every member holds exactly one seat, and no seat is held twice', async () => {
    const rows = await prisma.committeeMember.findMany({ where: { committeeId: circleId, status: 'ACTIVE' } });
    expect(rows).toHaveLength(3);
    expect(new Set(rows.map(r => r.turnPosition)).size).toBe(3);
  });

  it('there is one round per seat, so everybody gets a turn', async () => {
    const circle = await prisma.committee.findUniqueOrThrow({ where: { id: circleId } });
    const rounds = await prisma.round.count({ where: { committeeId: circleId } });
    expect(rounds).toBe(circle.memberCap);
  });
});

describe('GET /api/committees/:id', () => {
  it('success: a member sees the running circle', async () => {
    const res = await api().get(`/api/committees/${circleId}`).set(auth(host));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ACTIVE');
  });
});

describe('GET /api/committees/:id/payment-matrix', () => {
  it('success: the host sees every round and who has paid', async () => {
    const res = await api().get(`/api/committees/${circleId}/payment-matrix`).set(auth(host));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('GET /api/committees/:id/receivables-pack', () => {
  it('success: the host can take the pack for a running circle', async () => {
    const res = await api().get(`/api/committees/${circleId}/receivables-pack`).set(auth(host));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/payments', () => {
  it('success: a member records their contribution and it is marked paid', async () => {
    const payer = members[1]!;
    const res = await api().post('/api/payments').set(auth(payer))
      .send({ roundId, paidVia: 'RAAST', txnRef: 'TXN-0001', idempotencyKey: `pay-${payer.id}` });
    expect(res.status).toBe(201);
    const row = await prisma.payment.findUniqueOrThrow({
      where: { roundId_payerId: { roundId, payerId: payer.id } },
    });
    expect(row.status).toBe('PAID');
    expect(row.txnRef).toBe('TXN-0001');
  });

  it('the retry with the same key is answered, not refused', async () => {
    // This is the defect the idempotency record exists for: before it, a retry
    // hit the ledger's unique key and came back 409, which a client reads as a
    // failure, and the member pays a second time by hand.
    const payer = members[1]!;
    const retry = await api().post('/api/payments').set(auth(payer))
      .send({ roundId, paidVia: 'RAAST', txnRef: 'TXN-0001', idempotencyKey: `pay-${payer.id}` });
    expect(retry.status).toBeLessThan(400);
    const rows = await prisma.payment.findMany({ where: { roundId, payerId: payer.id } });
    expect(rows, 'one payment, whatever the network did').toHaveLength(1);
  });

  it('refused for a member without access: somebody outside the circle', async () => {
    const res = await api().post('/api/payments').set(auth(outsider))
      .send({ roundId, paidVia: 'RAAST', txnRef: 'TXN-0002', idempotencyKey: 'out-abcdefgh' });
    expect([403, 404]).toContain(res.status);
  });

  it('no ledger entry is half written', async () => {
    const entries = await prisma.ledgerEntry.findMany({ where: { committeeId: circleId } });
    expect(entries.length).toBeGreaterThan(0);
    for (const e of entries) {
      expect(e.debit, 'an entry with no debit account').toBeTruthy();
      expect(e.credit, 'an entry with no credit account').toBeTruthy();
      expect(e.amountPaisa > 0n, 'an entry of zero or less').toBe(true);
    }
  });
});

describe('GET /api/payments/mine', () => {
  it('success: the payer sees their own payment, and the bound is reported', async () => {
    const res = await api().get('/api/payments/mine').set(auth(members[1]!));
    expect(res.status).toBe(200);
    expect(res.headers['x-page-limit']).toBe('50');
    expect(res.body.some((p: { roundId: string }) => p.roundId === roundId)).toBe(true);
  });
});

describe('GET /api/exits/committee/:id/options', () => {
  it('success: a member of a running circle is offered the rungs', async () => {
    const res = await api().get(`/api/exits/committee/${circleId}/options`).set(auth(members[2]!));
    expect(res.status).toBe(200);
  });
});

describe('GET /api/risk/committee/:id', () => {
  it('success: the risk reading of a running circle', async () => {
    const res = await api().get(`/api/risk/committee/${circleId}`).set(auth(host));
    expect(res.status).toBe(200);
  });
});

describe('GET /api/risk/committee/:id/projection', () => {
  it('success: the projection of a running circle', async () => {
    const res = await api().get(`/api/risk/committee/${circleId}/projection`).set(auth(host));
    expect(res.status).toBe(200);
  });
});

describe('GET /api/protection/committee/:id', () => {
  it('success: the protection standing of a running circle', async () => {
    const res = await api().get(`/api/protection/committee/${circleId}`).set(auth(host));
    expect(res.status).toBe(200);
  });
});

describe('POST /api/chat/:committeeId', () => {
  it('success: a member posts and the message comes back in the thread', async () => {
    const posted = await api().post(`/api/chat/${circleId}`).set(auth(members[1]!)).send({ body: 'Paid mine today' });
    expect(posted.status).toBeLessThan(300);
    const read = await api().get(`/api/chat/${circleId}`).set(auth(host));
    expect(read.status).toBe(200);
    expect(JSON.stringify(read.body)).toContain('Paid mine today');
  });
});

describe('POST /api/exchange', () => {
  it('a listing is either made or refused with a reason, never a fault', async () => {
    const seller = members[2]!;
    const res = await api().post('/api/exchange').set(auth(seller))
      .send({ committeeId: circleId, premiumPaisa: '0' });
    expect(res.status).toBeLessThan(500);
    if (res.status >= 400) expect(res.body.error, 'a refusal must say why').toBeTruthy();
  });
});

describe('POST /api/committees/:id/payout', () => {
  it('refused with a reason while contributions are outstanding', async () => {
    // Two of the three have not paid, so the payout must refuse and say so
    // rather than paying out money that is not there.
    const res = await api().post(`/api/committees/${circleId}/payout`).set(auth(host))
      .send({ idempotencyKey: 'payout-abcdefgh' });
    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/not paid|locked|contribution/i);
  });
});

describe('POST /api/committees/:id/nudge/:userId', () => {
  it('success: the host nudges a member who has not paid', async () => {
    const res = await api().post(`/api/committees/${circleId}/nudge/${members[2]!.id}`).set(auth(host)).send({});
    expect(res.status).toBe(201);
    const notice = await prisma.notification.findFirst({
      where: { userId: members[2]!.id, type: 'PAYMENT_NUDGE' },
      orderBy: { createdAt: 'desc' },
    });
    expect(notice, 'the nudge must reach the member as a notice').not.toBeNull();
  });
});

describe('POST /api/committees/:id/leave', () => {
  it('a member of a running circle is given the ladder, not a cancel button', async () => {
    const res = await api().post(`/api/committees/${circleId}/leave`).set(auth(members[2]!)).send({});
    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.body.error).toBeTruthy();
  });
});
