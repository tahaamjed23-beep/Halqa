// ---------------------------------------------------------------------------
// THE INTEGRATION HARNESS
//
// Work register, section AE: every endpoint needs three checks — it works, it
// refuses bad input, and it refuses a member without access. None of them
// existed before 2026-10-06, because supertest had never finished installing
// and the only integration suite (tests/integration.mjs) needed a server
// listening on a port and a hand-seeded database.
//
// This drives the Express app IN PROCESS. No port, no server to start, no
// fixture file to keep in step: each test makes the members it needs, and
// every row it makes carries a per-run tag so a run never collides with the
// demo data or with another run.
// ---------------------------------------------------------------------------
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/db';

/** Unique per run, so repeated runs and parallel files never collide. */
export const RUN = `it${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
let n = 0;
export const uniq = (what: string) => `${what}${RUN}${++n}`;

export const api = () => request(app);

export type Member = {
  id: string;
  username: string;
  token: string;
  phone: string;
  fullName: string;
};

/**
 * A real member, made through the real sign-up endpoint, so the row is exactly
 * what the application itself would have written. Anything a test needs beyond
 * that (a score, a verified income) is set afterwards and said out loud.
 */
// A block of mobile numbers this process owns: the low digits of the clock
// give each run its own block, and the counter walks within it.
// Blocks of identifiers this module instance owns, and the counter walks
// within them. Picked at RANDOM, not from the clock: vitest gives every test
// file its own module instance, so two files loading in the same millisecond
// drew the same block and collided on the unique phone and CNIC columns. That
// failed one file in setup and read as a flaky suite.
const block = () => Math.floor(Math.random() * 900_000);
const PHONE_BASE = 3_000_000_000 + block() * 1_000;
const CNIC_BASE = 1_000_000_000_000 + block() * 1_000_000;

export async function makeMember(over: Record<string, unknown> = {}): Promise<Member> {
  const seq = ++n;
  const username = uniq('m').slice(0, 28);
  const fullName = 'Test Member';
  // A Pakistani mobile unique to this member. Built from the run tag and the
  // counter, never from the clock: two test FILES starting in the same
  // millisecond used to mint the same number and one of them failed on the
  // uniqueness check, which read as a flaky test rather than what it was.
  const phone = '+92' + String(PHONE_BASE + seq).padStart(10, '0');
  const res = await api().post('/api/auth/register').send({
    fullName, username, password: 'halqa123a', phone,
    email: `${username}@halqa.test`,
  });
  if (res.status !== 201) {
    throw new Error(`register failed ${res.status}: ${JSON.stringify(res.body).slice(0, 300)}`);
  }
  const id = res.body.user.id as string;
  const token = res.body.accessToken as string;
  if (Object.keys(over).length) await prisma.user.update({ where: { id }, data: over as never });
  return { id, username, token, phone, fullName };
}

export const auth = (m: Member) => ({ Authorization: `Bearer ${m.token}` });

/**
 * A member who may host: a CNIC on file (identity level 1) and a score of 700.
 *
 * The CNIC comes from the same owned block as the phone. Three test files used
 * to build it from the clock, so two files starting in the same millisecond
 * collided on the unique column and one of them failed in setup. That read as
 * a flaky suite and was nothing of the kind.
 */
export const hostable = () => ({
  cnic: String(CNIC_BASE + ++n).slice(-13),
  kycLevel: 1,
  creditScore: 700,
});

/**
 * Signs the weekly undertaking, which create, join and pay all demand with a
 * 428 until it is on file (the iqrarnama of 21 July). The signed name must
 * match the member's own name exactly, which is itself a rule worth exercising.
 */
export async function signUndertaking(m: Member) {
  const res = await api().post('/api/agreements/sign').set(auth(m))
    .send({ doc: 'PLATFORM_UNDERTAKING', accept: true, signedName: m.fullName });
  if (res.status >= 400) {
    throw new Error(`signing the undertaking failed ${res.status}: ${JSON.stringify(res.body).slice(0, 300)}`);
  }
  return res;
}

/**
 * A circle hosted by `host`, formed and open. Hosting needs a CNIC on file
 * (identity level 1), so the host is given one.
 */
export async function makeCircle(host: Member, over: Record<string, unknown> = {}) {
  return api().post('/api/committees').set(auth(host)).send({
    name: uniq('Circle').slice(0, 40),
    contributionPaisa: '1000000',
    memberCap: 6,
    periodDays: 30,
    mode: 'ROTATING',
    cadencePreset: 'MID',
    minMembersToStart: 3,
    ...over,
  });
}

/** Tidies up only what this run made. Never touches demo or seeded rows. */
export async function cleanup() {
  const users = await prisma.user.findMany({ where: { username: { contains: RUN } }, select: { id: true } });
  const ids = users.map(u => u.id);
  if (!ids.length) return;
  const committees = await prisma.committee.findMany({ where: { hostId: { in: ids } }, select: { id: true } });
  const cids = committees.map(c => c.id);
  if (cids.length) {
    // The ledger and the money rows are RESTRICT now, on purpose: a circle
    // with entries against it cannot be deleted, because the ledger is
    // evidence and must not vanish with the thing it is evidence about
    // (schema of 6 October). A test tidying up has to clear them explicitly,
    // which is the correct shape of this problem rather than a workaround.
    await prisma.ledgerEntry.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.creditEvent.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.recoveryCase.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.exchangeBid.deleteMany({ where: { listing: { committeeId: { in: cids } } } });
    await prisma.exchangeListing.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.riskConsent.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.investment.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.chatMessage.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.committeeWaitlist.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.payoutHoldback.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.securityDeposit.deleteMany({ where: { membership: { committeeId: { in: cids } } } });
    await prisma.protectionCommitment.deleteMany({ where: { membership: { committeeId: { in: cids } } } });
    await prisma.payment.deleteMany({ where: { round: { committeeId: { in: cids } } } });
    await prisma.round.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.committeeMember.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.agreementSignature.deleteMany({ where: { committeeId: { in: cids } } });
    await prisma.committee.deleteMany({ where: { id: { in: cids } } });
  }
  await prisma.paymentAttempt.deleteMany({ where: { userId: { in: ids } } });
  await prisma.idempotencyRecord.deleteMany({ where: { userId: { in: ids } } });
  await prisma.creditEvent.deleteMany({ where: { userId: { in: ids } } });
  await prisma.committeeMember.deleteMany({ where: { userId: { in: ids } } });
  await prisma.agreementSignature.deleteMany({ where: { userId: { in: ids } } });
  await prisma.auditLog.deleteMany({ where: { actorId: { in: ids } } });
  await prisma.notification.deleteMany({ where: { userId: { in: ids } } });
  await prisma.securityEvent.deleteMany({ where: { userId: { in: ids } } });
  await prisma.refreshToken.deleteMany({ where: { userId: { in: ids } } });
  await prisma.user.deleteMany({ where: { id: { in: ids } } });
}

/**
 * A circle that is RUNNING: started, with a collecting round and a payment
 * obligation for every member.
 *
 * Forty two success-path tests in the register need one of these and could not
 * be written without it, because almost everything interesting about a
 * committee only exists once it starts: the rounds, the payments, the payout,
 * the turn market, the exit ladder.
 *
 * Starting is deliberately two-stage — FORMING opens a 24-hour confirmation
 * window, and the circle activates when the window has run — so a member can
 * withdraw before anybody is committed. A test cannot wait a day, so the window
 * is moved into the past directly, which is the one thing here that reaches
 * past the API rather than through it.
 */
export async function makeLiveCircle(host: Member, memberCount = 3) {
  const { prisma } = await import('../../src/db');
  const created = await makeCircle(host, {
    memberCap: memberCount, minMembersToStart: memberCount, listedPublicly: true,
    // No security deposits: the schema calls 0 "the live product default", and
    // a fixture standing in for a real circle should not demand deposits that
    // the real product does not take.
    depositCoverageBps: 0,
  });
  if (created.status !== 201) throw new Error(`circle not created: ${created.status} ${JSON.stringify(created.body).slice(0, 200)}`);
  const circleId = created.body.id as string;

  // The host holds a seat too, so only the rest need to join.
  const members: Member[] = [host];
  for (let i = 1; i < memberCount; i++) {
    const m = await makeMember({ creditScore: 700, committeesCompletedClean: 1 });
    await signUndertaking(m);
    const joined = await api().post(`/api/committees/${circleId}/join`).set(auth(m)).send({});
    if (joined.status !== 201) throw new Error(`member ${i} could not join: ${joined.status} ${JSON.stringify(joined.body).slice(0, 200)}`);
    members.push(m);
  }

  const opened = await api().post(`/api/committees/${circleId}/start`).set(auth(host)).send({});
  if (opened.status >= 400) throw new Error(`window would not open: ${opened.status} ${JSON.stringify(opened.body).slice(0, 300)}`);

  // Move the confirmation window into the past so the circle can activate now.
  await prisma.committee.update({
    where: { id: circleId },
    data: { confirmingSince: new Date(Date.now() - 25 * 3_600_000) },
  });

  const activated = await api().post(`/api/committees/${circleId}/start`).set(auth(host)).send({});
  if (activated.status >= 400) throw new Error(`circle would not activate: ${activated.status} ${JSON.stringify(activated.body).slice(0, 300)}`);

  const round = await prisma.round.findFirst({
    where: { committeeId: circleId, status: 'COLLECTING' },
    include: { payments: true },
  });
  if (!round) throw new Error('the circle started with no collecting round');
  return { circleId, members, round };
}
