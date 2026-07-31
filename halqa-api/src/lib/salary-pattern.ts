import type { PrismaClient } from '@prisma/client';
import { prisma } from '../db';
import { clampScore } from './money';
import { audit } from './audit';

// Salary-day verification (chairman's directive, 2026-07-31).
//
// Nobody in Pakistan can look inside a member's account (no open banking, and
// no bank partner by doctrine), so "is this the salary account?" is answered
// from signals we legitimately own:
//   PATTERN — our own collection attempts by calendar day. The first
//             successful collection of each month marks a day money was
//             demonstrably present; two-plus consistent months prove the
//             payday. Self-generating, self-correcting, needs no permission.
//   ALERTS  — opt-in on-device credit-alert summaries (SalarySignal rows,
//             aggregates only). Two consistent months verify.
//   PAYSLIP — one photo; documentary proof (routes/profile.ts).
// A member whose DECLARED day the pattern contradicts loses the verification,
// loses the salary fee discount (committees.ts pays it only while verified),
// takes a recorded −15 score event, and is told plainly why. Discovery
// mid-committee is exactly when this fires — the sweep evaluates after every
// collection pass.

export const MISDECLARE_SCORE_DELTA = -15;
export const PATTERN_WINDOW_DAYS = 120;
// A pull can land a day or two after wages arrive (retry ladder), so the
// tolerance for "same payday" is wider than the tolerance for "you lied".
export const DAY_TOLERANCE = 3;
export const CLUSTER_TOLERANCE = 5;
export const MIN_MONTHS = 2;

// Distance between two calendar days on the wrap-around month circle:
// day 1 and day 29 are 3 apart, not 28 — month-end paydays drift across the
// boundary and must not read as inconsistency.
export const dayDistance = (a: number, b: number) => {
  const d = Math.abs(a - b);
  return Math.min(d, 31 - d);
};

export type AttemptRow = { calendarDay: number; outcome: string; attemptedAt: Date };
export type PatternRead = { monthsObserved: number; learnedDay: number | null; consistent: boolean };

// First COLLECTED attempt of each calendar month = the earliest day that month
// on which money was provably present. Median of those days is the learned
// payday; the read is consistent when every month sits inside the cluster.
export function readPattern(attempts: AttemptRow[]): PatternRead {
  const firstSuccessByMonth = new Map<string, number>();
  const successes = attempts
    .filter(a => a.outcome === 'COLLECTED')
    .sort((x, y) => x.attemptedAt.getTime() - y.attemptedAt.getTime());
  for (const a of successes) {
    const key = `${a.attemptedAt.getUTCFullYear()}-${a.attemptedAt.getUTCMonth()}`;
    if (!firstSuccessByMonth.has(key)) firstSuccessByMonth.set(key, a.calendarDay);
  }
  const days = [...firstSuccessByMonth.values()];
  if (days.length < MIN_MONTHS) return { monthsObserved: days.length, learnedDay: days[0] ?? null, consistent: false };
  const sorted = [...days].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const consistent = days.every(d => dayDistance(d, median) <= CLUSTER_TOLERANCE);
  return { monthsObserved: days.length, learnedDay: consistent ? median : null, consistent };
}

export type SignalRow = { dayOfMonth: number; observedMonth: string };

// Two-plus months of credit alerts clustered on the same day verify by
// observation. Months are distinct by construction (unique constraint).
export function readSignals(signals: SignalRow[]): PatternRead {
  const days = signals.map(s => s.dayOfMonth);
  if (days.length < MIN_MONTHS) return { monthsObserved: days.length, learnedDay: days[0] ?? null, consistent: false };
  const sorted = [...days].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const consistent = days.every(d => dayDistance(d, median) <= CLUSTER_TOLERANCE);
  return { monthsObserved: new Set(signals.map(s => s.observedMonth)).size, learnedDay: consistent ? median : null, consistent };
}

export type SalaryEvaluation = {
  declaredDay: number | null;
  learnedDay: number | null;
  monthsObserved: number;
  verified: boolean;
  method: string | null;
  misdeclared: boolean;
};

// The evaluator the daily sweep calls for every member it attempted to collect
// from. Verifies honestly-declared paydays, learns undeclared ones, and fires
// the one-time misdeclaration consequence when the evidence contradicts the
// claim. Never throws — collection must not fail on a scoring hiccup.
export async function evaluateSalaryPattern(userId: string, db: PrismaClient = prisma): Promise<SalaryEvaluation | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { id: true, salaryDay: true, salaryDayLearned: true, salaryVerifiedAt: true, salaryVerifyMethod: true, salaryAccountLinked: true, creditScore: true },
  });
  if (!user) return null;
  const since = new Date(Date.now() - PATTERN_WINDOW_DAYS * 86_400_000);
  const [attempts, signals] = await Promise.all([
    db.paymentAttempt.findMany({ where: { userId, attemptedAt: { gte: since } }, select: { calendarDay: true, outcome: true, attemptedAt: true } }),
    db.salarySignal.findMany({ where: { userId, createdAt: { gte: since } }, select: { dayOfMonth: true, observedMonth: true } }),
  ]);
  const pattern = readPattern(attempts);
  const alerts = readSignals(signals);
  const evidence = pattern.consistent ? pattern : alerts.consistent ? alerts : null;
  const method = pattern.consistent ? 'PATTERN' : alerts.consistent ? 'ALERTS' : null;

  let misdeclared = false;
  const result: SalaryEvaluation = {
    declaredDay: user.salaryDay,
    learnedDay: evidence?.learnedDay ?? user.salaryDayLearned,
    monthsObserved: Math.max(pattern.monthsObserved, alerts.monthsObserved),
    verified: !!user.salaryVerifiedAt,
    method: user.salaryVerifyMethod,
    misdeclared,
  };
  if (!evidence || evidence.learnedDay == null) return result;

  // Record what the evidence taught us regardless of the declared value.
  if (user.salaryDayLearned !== evidence.learnedDay) {
    await db.user.update({ where: { id: userId }, data: { salaryDayLearned: evidence.learnedDay } }).catch(() => {});
  }
  result.learnedDay = evidence.learnedDay;

  if (user.salaryDay != null && dayDistance(user.salaryDay, evidence.learnedDay) > DAY_TOLERANCE) {
    // The declared payday is contradicted by observed reality. One-time
    // consequence per window: verification cleared (which alone removes the
    // salary fee discount), −15 recorded with its reason, member told plainly.
    misdeclared = true;
    result.misdeclared = true;
    const already = await db.creditEvent.findFirst({ where: { userId, checkpoint: 'salary:misdeclared', scoredAt: { gte: since } }, select: { id: true } });
    if (!already) {
      await db.$transaction(async tx => {
        await tx.creditEvent.create({ data: { userId, checkpoint: 'salary:misdeclared', delta: MISDECLARE_SCORE_DELTA, reason: `Declared salary day ${user.salaryDay} but collections only succeed around day ${evidence.learnedDay}` } });
        await tx.user.update({ where: { id: userId }, data: { creditScore: clampScore(user.creditScore + MISDECLARE_SCORE_DELTA), salaryVerifiedAt: null, salaryVerifyMethod: null } });
        await tx.notification.create({ data: { userId, type: 'SALARY_MISDECLARED', message: `Your declared salary day (${user.salaryDay}) does not match when your payments actually clear (around day ${evidence.learnedDay}). The salary discount is paused and your reliability score was adjusted. Update your salary day in Settings to fix this.` } });
        await audit(tx, userId, 'SALARY_MISDECLARED', 'User', userId, { declaredDay: user.salaryDay, learnedDay: evidence.learnedDay });
      }).catch(() => {});
      result.verified = false;
      result.method = null;
    }
    return result;
  }

  // Declared and observed agree (or nothing was declared): verify on the
  // evidence. PAYSLIP verification is never downgraded by a pattern read.
  if (!user.salaryVerifiedAt && user.salaryAccountLinked) {
    await db.$transaction(async tx => {
      await tx.user.update({ where: { id: userId }, data: { salaryVerifiedAt: new Date(), salaryVerifyMethod: method, ...(user.salaryDay == null ? { salaryDay: evidence.learnedDay } : {}) } });
      await tx.notification.create({ data: { userId, type: 'SALARY_VERIFIED', message: `Your salary account is verified (${method === 'PATTERN' ? 'by your payment history' : 'by your credit alerts'}). The salary discount now applies at your payouts.` } });
      await audit(tx, userId, 'SALARY_VERIFIED', 'User', userId, { method, learnedDay: evidence.learnedDay });
    }).catch(() => {});
    result.verified = true;
    result.method = method;
  }
  return result;
}
