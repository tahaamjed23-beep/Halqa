// How long each record is kept, and whether anything actually deletes it.
//
// Work register AF3: "retention period set, with the reason" and "retention
// period set and applied by the deletion job".
//
// The point of these tests is the second half. A retention policy that nothing
// applies is a sentence in a document: it makes the position look better than
// it is, and the first person to find out is whoever asks why a row from three
// years ago is still there. So the job is tested against real rows, and the
// records it deliberately does NOT touch are tested too, because a job that
// could quietly remove the ledger would be worse than no job at all.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RETENTION, DAY, isDue, sweepExpired, type Rule } from '../src/lib/retention';
import { prisma } from '../src/db';

const SCHEMA = readFileSync(join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8').replace(/\r\n/g, '\n');
const MODELS = [...SCHEMA.matchAll(/^model (\w+) \{/gm)].map(m => m[1]);

const RUN = `ret${Date.now().toString(36)}`;
let userId = '';

beforeAll(async () => {
  const user = await prisma.user.create({
    data: {
      fullName: 'Retention Test', username: `${RUN}u`, email: `${RUN}@halqa.test`,
      phone: `+923${String(Date.now()).slice(-9)}`, passwordHash: 'x',
    },
  });
  userId = user.id;
}, 30_000);

afterAll(async () => {
  await prisma.auditLog.deleteMany({ where: { actorId: userId } });
  await prisma.notification.deleteMany({ where: { userId } });
  await prisma.securityEvent.deleteMany({ where: { userId } });
  await prisma.user.deleteMany({ where: { id: userId } });
});

describe('every record has a period and a reason', () => {
  it('no model in the schema is missing a rule', () => {
    const missing = MODELS.filter(m => !RETENTION[m]);
    expect(missing, 'a model with no retention rule').toEqual([]);
  });

  it('no rule names a model the schema does not have', () => {
    const extra = Object.keys(RETENTION).filter(m => !MODELS.includes(m));
    expect(extra, 'a rule for a model that does not exist').toEqual([]);
  });

  it('every reason is a sentence, not a label', () => {
    for (const [model, rule] of Object.entries(RETENTION)) {
      expect(rule.reason.length, `${model}: the reason is too short to be one`).toBeGreaterThan(40);
      // A reason that only restates the period explains nothing.
      expect(rule.reason, `${model}: the reason only restates the number`).not.toMatch(/^(ten years|two years|ninety days)\.?$/i);
    }
  });

  it('every period is either a real number of days or explicitly forever', () => {
    for (const [model, rule] of Object.entries(RETENTION)) {
      expect(Number.isFinite(rule.days) ? rule.days > 0 : rule.days === Infinity,
        `${model}: ${rule.days} is not a period`).toBe(true);
    }
  });

  it('anything kept forever says why it is never swept', () => {
    for (const [model, rule] of Object.entries(RETENTION)) {
      if (!Number.isFinite(rule.days)) {
        expect(rule.neverSwept, `${model} is kept forever with no reason given`).toBeTruthy();
      }
    }
  });

  it('the money records are kept ten years, as the bank requires', () => {
    for (const model of ['Payment', 'Round', 'Committee', 'CommitteeMember', 'CreditEvent', 'RecoveryCase']) {
      const rule = RETENTION[model] as Rule;
      expect(rule.days, `${model} must be ten years`).toBe(10 * 365);
    }
  });

  it('a period about money runs from the END of the circle, not the row', () => {
    // Otherwise a circle's own records start expiring while it is still
    // running, which is the subtle way a retention policy destroys evidence.
    for (const model of ['Payment', 'Round', 'CommitteeMember']) {
      expect((RETENTION[model] as Rule).basis, model).toBe('CIRCLE');
    }
    expect((RETENTION.User as Rule).basis).toBe('RELATIONSHIP');
  });

  it('the operational records are kept two years, not ten', () => {
    for (const model of ['SecurityEvent', 'PaymentAttempt', 'SalarySignal', 'Notification']) {
      expect((RETENTION[model] as Rule).days, model).toBe(2 * 365);
    }
  });
});

describe('the clock', () => {
  it('a record inside its period is not due', () => {
    const rule = RETENTION.Notification as Rule;
    const now = new Date('2026-10-07T00:00:00Z');
    const recent = new Date(now.getTime() - 30 * DAY);
    expect(isDue(rule, recent, now)).toBe(false);
  });

  it('a record past its period is due', () => {
    const rule = RETENTION.Notification as Rule;
    const now = new Date('2026-10-07T00:00:00Z');
    const old = new Date(now.getTime() - (2 * 365 + 1) * DAY);
    expect(isDue(rule, old, now)).toBe(true);
  });

  it('a record kept forever is never due', () => {
    const now = new Date('2026-10-07T00:00:00Z');
    const ancient = new Date('2000-01-01T00:00:00Z');
    expect(isDue(RETENTION.LedgerEntry as Rule, ancient, now)).toBe(false);
    expect(isDue(RETENTION.Scheme as Rule, ancient, now)).toBe(false);
  });

  it('the boundary belongs to the past: exactly at the period, it goes', () => {
    const rule = RETENTION.Notification as Rule;
    const now = new Date('2026-10-07T00:00:00Z');
    expect(isDue(rule, new Date(now.getTime() - 2 * 365 * DAY), now)).toBe(true);
  });
});

describe('the job deletes what is past its period', () => {
  it('an old notice goes and a recent one stays', async () => {
    const old = await prisma.notification.create({
      data: {
        userId, type: 'GENERAL', message: 'an old notice',
        createdAt: new Date(Date.now() - (2 * 365 + 5) * DAY),
      },
    });
    const recent = await prisma.notification.create({
      data: { userId, type: 'GENERAL', message: 'a recent notice' },
    });

    await sweepExpired(prisma);

    expect(await prisma.notification.findUnique({ where: { id: old.id } }),
      'a notice past its period must go').toBeNull();
    expect(await prisma.notification.findUnique({ where: { id: recent.id } }),
      'a notice inside its period must stay').not.toBeNull();
  });

  it('a dry run counts and deletes nothing', async () => {
    const old = await prisma.securityEvent.create({
      data: {
        type: 'PHONE_OTP', userId, identity: 'dry-run-test',
        createdAt: new Date(Date.now() - (2 * 365 + 5) * DAY),
      },
    });
    const counted = await sweepExpired(prisma, { dryRun: true });
    const line = counted.find(r => r.model === 'SecurityEvent');
    expect(line!.deleted, 'the dry run must COUNT the row').toBeGreaterThan(0);
    expect(await prisma.securityEvent.findUnique({ where: { id: old.id } }),
      'and must not delete it').not.toBeNull();
    await prisma.securityEvent.delete({ where: { id: old.id } });
  });

  it('the ledger is never touched, whatever its age', async () => {
    // The one record a nightly job must not be able to remove. It is the
    // evidence that money moved.
    const result = await sweepExpired(prisma);
    const ledger = result.find(r => r.model === 'LedgerEntry');
    expect(ledger!.deleted).toBe(0);
    expect(ledger!.skipped, 'and it must say why it was skipped').toBeTruthy();
  });

  it('it reports what it skipped and why, rather than leaving it out', async () => {
    const result = await sweepExpired(prisma, { dryRun: true });
    // Every model appears, swept or not, so a gap is visible in the output
    // instead of being discovered a year later.
    expect(result.length).toBe(Object.keys(RETENTION).length);
    for (const line of result) {
      if (line.deleted === 0 && RETENTION[line.model]!.basis !== 'ROW') {
        expect(line.skipped, `${line.model} was not swept and did not say why`).toBeTruthy();
      }
    }
  });

  it('the periods measured from a circle or a relationship are named as not yet applied', async () => {
    // Honest about the gap: nothing records when a circle closed or when an
    // account was closed, so those periods cannot be measured yet. The job
    // says so rather than appearing to have handled them.
    const result = await sweepExpired(prisma, { dryRun: true });
    const payment = result.find(r => r.model === 'Payment');
    expect(payment!.skipped).toMatch(/close of the circle/);
    const user = result.find(r => r.model === 'User');
    expect(user!.skipped).toMatch(/end of the relationship/);
  });
});
