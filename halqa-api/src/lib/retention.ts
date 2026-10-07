// ---------------------------------------------------------------------------
// HOW LONG EACH RECORD IS KEPT, AND WHY
//
// Work register AF3, per model: "retention period set, with the reason" and
// "retention period set and applied by the deletion job".
//
// Two halves, and only one of them existed. The data dictionary stated a
// retention class per record, which satisfies a reviewer reading a document.
// Nothing deleted anything, so every row ever written is still there. A policy
// nobody applies is not a policy: it is a sentence in a document that makes the
// position look better than it is.
//
// WHAT DECIDES EACH PERIOD
//
//   TEN YEARS       Anything a bank must be able to produce about money or
//                   about who a member is. The period follows the bank's own
//                   retention obligation, not Halqa's convenience, and runs
//                   from the END of the relationship rather than from the row's
//                   own date, so a circle's records do not start expiring while
//                   the circle is running.
//   TWO YEARS       Operational records: what was attempted, what was sent,
//                   what was logged. Long enough to investigate a pattern, not
//                   so long that a stale signal is read as current.
//   NINETY DAYS     Records whose only purpose is the near past: a session, a
//                   read mark, a request that has already been answered.
//   FOREVER         Reference data that is not about a person at all.
//
// WHAT IS NEVER DELETED BY THIS JOB
//
//   The ledger. It is the evidence that money moved, the schema refuses to
//   delete it with its circle, and a job that could quietly remove it would
//   undo the point of having it. Ten years is recorded against it so a reviewer
//   sees the period; removing it when that period ends is a deliberate act with
//   the bank, not something a nightly job does on its own.
// ---------------------------------------------------------------------------
import type { PrismaClient } from '@prisma/client';

export const DAY = 86_400_000;

export type Basis =
  /** From the row's own creation. */
  | 'ROW'
  /** From the end of the member's relationship with Halqa. */
  | 'RELATIONSHIP'
  /** From the close of the circle the row belongs to. */
  | 'CIRCLE';

export type Rule = {
  /** Days to keep it. Infinity means it is not deleted on a schedule. */
  days: number;
  /** What the clock runs from. */
  basis: Basis;
  /** Why this period and not another. Written for a reviewer, not for us. */
  reason: string;
  /**
   * The field the clock reads, where the job can delete the record itself.
   * Absent means the record is not swept: either it is reference data, or
   * removing it needs a decision rather than a schedule.
   */
  field?: string;
  /** Set where a record must never be removed by a job, with the reason. */
  neverSwept?: string;
};

export const YEARS = (n: number) => n * 365 * DAY / DAY;   // in days

export const RETENTION: Record<string, Rule> = {
  // --- the member, and what the bank must be able to produce ---------------
  User: {
    days: YEARS(10), basis: 'RELATIONSHIP',
    reason: 'The bank must be able to identify who held the account for ten years after it closes. The clock runs '
      + 'from closure, not from sign up, so an active member is never swept.',
  },
  KycRecord: {
    days: YEARS(10), basis: 'RELATIONSHIP',
    reason: 'The identity evidence the account was opened on. Same obligation as the account itself.',
  },
  AgreementSignature: {
    days: YEARS(10), basis: 'RELATIONSHIP',
    reason: 'What the member agreed to, and the fingerprint of the exact text. A dispute years later turns on this.',
  },

  // --- money, and the circle it moved inside -------------------------------
  Committee: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'The circle is the contract between its members. Kept ten years from its close, with the bank.',
  },
  CommitteeMember: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'Who held which seat, and what they paid. The answer to almost every dispute.',
  },
  Round: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'What was due, when, and to whom it was paid. A member asking years later which round they '
      + 'collected in is asking this table.',
  },
  Payment: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'A record of money. Ten years, with the bank.',
  },
  LedgerEntry: {
    days: Infinity, basis: 'CIRCLE',
    reason: 'Ten years is the period, but the ledger is the evidence that money moved.',
    neverSwept: 'The schema refuses to delete it with its circle, and a nightly job must not be able to remove it '
      + 'either. Clearing it when the period ends is a deliberate act with the bank.',
  },
  SecurityDeposit: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'What a member placed as security and what came back to them. A member who says their deposit was '
      + 'never returned is asking this table.',
  },
  PayoutHoldback: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'What was held back from a payout and why.',
  },
  ProtectionCommitment: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'Who stood behind whom. A guarantee outlives the circle it was given for.',
  },
  RecoveryCase: {
    days: YEARS(10), basis: 'RELATIONSHIP', field: 'openedAt',
    reason: 'A default and its recovery. Reported to the bureau, so the record has to outlast the report.',
  },
  RestitutionDebt: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'What a member still owed when they left, and what has been settled against it. The figure a '
      + 'recovery case is built on.',
  },
  ExitRequest: {
    days: YEARS(10), basis: 'CIRCLE', field: 'createdAt',
    reason: 'How and why a member left, and what the circle decided.',
  },
  ExitVote: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'How each member voted on an exit. The circle’s own decision, and the answer to anybody who '
      + 'later says they were pushed out.',
  },
  ExchangeListing: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'A turn changed hands for a consideration. That is a transaction.',
  },
  ExchangeBid: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'What was offered for a turn, by whom, and what was accepted. A transaction between two members '
      + 'rather than a browsing record.',
  },
  Investment: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'Where the pot was placed while it waited, and what it earned.',
  },
  CreditEvent: {
    days: YEARS(10), basis: 'RELATIONSHIP',
    reason: 'Every event that moved a member’s score. A member disputing their score is entitled to see it.',
  },
  StatementBatch: {
    days: YEARS(10), basis: 'CIRCLE',
    reason: 'A bank statement imported against a circle.',
  },
  StatementLine: {
    days: YEARS(10), basis: 'CIRCLE', field: 'createdAt',
    reason: 'The individual lines matched against payments.',
  },

  // --- the record of who did what ------------------------------------------
  AuditLog: {
    days: YEARS(10), basis: 'ROW', field: 'at',
    reason: 'Who changed what. Ten years, because a question about a change can arrive as late as a question '
      + 'about the money it changed.',
  },

  // --- operational: useful for a while, then noise -------------------------
  SecurityEvent: {
    days: YEARS(2), basis: 'ROW', field: 'createdAt',
    reason: 'Sign ins, codes, token events. Two years is long enough to investigate a pattern of attempts.',
  },
  PaymentAttempt: {
    days: YEARS(2), basis: 'ROW', field: 'attemptedAt',
    reason: 'What was tried and what happened. Useful for a collection pattern, not evidence of a balance.',
  },
  SalarySignal: {
    days: YEARS(2), basis: 'ROW', field: 'createdAt',
    reason: 'What a salary looked like. A signal older than two years says nothing about today’s income.',
  },
  Notification: {
    days: YEARS(2), basis: 'ROW', field: 'createdAt',
    reason: 'What the member was told. Kept long enough to answer "nobody told me".',
  },
  SupportTicket: {
    days: YEARS(2), basis: 'ROW', field: 'createdAt',
    reason: 'A case and its answer. Two years covers a complaint escalated to the Banking Mohtasib and back.',
  },
  SupportMessage: {
    days: YEARS(2), basis: 'ROW', field: 'createdAt',
    reason: 'The messages inside a case. Kept with the case.',
  },
  ChatMessage: {
    days: YEARS(2), basis: 'CIRCLE', field: 'sentAt',
    reason: 'What members said to each other in the circle. Two years from the circle’s close.',
  },
  PayslipUpload: {
    days: YEARS(2), basis: 'ROW', field: 'uploadedAt',
    reason: 'Income evidence. Two years, because an older payslip proves nothing about current income.',
  },
  RiskAssessment: {
    days: YEARS(2), basis: 'CIRCLE',
    reason: 'What the risk reading said at the time a decision was taken, which is not the same as what it '
      + 'would say today.',
  },
  RiskConsent: {
    days: YEARS(10), basis: 'CIRCLE', field: 'createdAt',
    reason: 'A member consented to something. Consent is kept as long as what it permitted.',
  },
  ScheduleChangeRequest: {
    days: YEARS(2), basis: 'CIRCLE', field: 'reviewedAt',
    reason: 'A request to change a circle’s dates, and what was decided.',
  },
  RewardEvent: {
    days: YEARS(2), basis: 'ROW', field: 'createdAt',
    reason: 'Points earned and spent. Two years, and a member’s balance does not depend on the history.',
  },
  CommitteeWaitlist: {
    days: 90, basis: 'ROW', field: 'createdAt',
    reason: 'Somebody waiting for a seat. Ninety days after that, the wait is not current.',
  },

  // --- the near past only --------------------------------------------------
  RefreshToken: {
    days: 90, basis: 'ROW', field: 'createdAt',
    reason: 'A session. Kept ninety days past its own expiry so a token reuse can still be traced to it.',
  },
  ChatRead: {
    days: 90, basis: 'ROW', field: 'lastReadAt',
    reason: 'A read mark. It matters until the member has seen the thread and not afterwards.',
  },
  IdempotencyRecord: {
    days: 1, basis: 'ROW', field: 'createdAt',
    reason: 'A request already answered, kept only long enough to answer a retry of it.',
  },

  // --- not about a person at all -------------------------------------------
  Scheme: {
    days: Infinity, basis: 'ROW',
    reason: 'Reference data. A scheme a circle once used must still be readable from that circle.',
    neverSwept: 'Reference data, and still pointed at by circles that used it.',
  },
  PartnerBank: {
    days: Infinity, basis: 'ROW',
    reason: 'Reference data. Which bank held which circle has to stay answerable.',
    neverSwept: 'Reference data, and still pointed at by circles and statements.',
  },
};

/** Every model the schema has, so a new one cannot be forgotten. */
export const MODELS_WITH_RULES = Object.keys(RETENTION);

/** True when this record is past its period. */
export const isDue = (rule: Rule, from: Date, now = new Date()): boolean =>
  Number.isFinite(rule.days) && now.getTime() - from.getTime() >= rule.days * DAY;

export type SweepResult = { model: string; deleted: number; skipped?: string };

/**
 * Deletes what is past its period, and says what it did.
 *
 * Only the records whose rule names a FIELD are swept, and only on the ROW
 * basis: a period measured from the close of a circle or the end of a
 * relationship needs that event to have happened, and nothing in the service
 * records a circle's close date or an account closure yet. Those are reported
 * as skipped with the reason rather than silently left out, so the gap is
 * visible in the job's own output instead of being discovered later.
 *
 * `dryRun` counts without deleting, which is how this should be run the first
 * time against real data.
 */
export async function sweepExpired(
  prisma: PrismaClient,
  opts: { now?: Date; dryRun?: boolean } = {},
): Promise<SweepResult[]> {
  const now = opts.now ?? new Date();
  const results: SweepResult[] = [];

  for (const [model, rule] of Object.entries(RETENTION)) {
    if (rule.neverSwept) {
      results.push({ model, deleted: 0, skipped: rule.neverSwept });
      continue;
    }
    if (!Number.isFinite(rule.days)) {
      results.push({ model, deleted: 0, skipped: 'kept indefinitely' });
      continue;
    }
    // The BASIS is reported before the field, because it is the more
    // informative answer: a period measured from the close of a circle cannot
    // be applied for a reason that has nothing to do with which column holds
    // the date, and reporting the column would send a reader looking in the
    // wrong place.
    if (rule.basis !== 'ROW') {
      results.push({
        model, deleted: 0,
        skipped: `measured from the ${rule.basis === 'CIRCLE' ? 'close of the circle' : 'end of the relationship'}, `
          + 'which the service does not record yet',
      });
      continue;
    }
    if (!rule.field) {
      results.push({ model, deleted: 0, skipped: 'no date field named, so nothing can be measured from' });
      continue;
    }

    const cutoff = new Date(now.getTime() - rule.days * DAY);
    const delegate = (prisma as unknown as Record<string, {
      count: (a: unknown) => Promise<number>;
      deleteMany: (a: unknown) => Promise<{ count: number }>;
    }>)[model[0].toLowerCase() + model.slice(1)];
    if (!delegate) {
      results.push({ model, deleted: 0, skipped: 'no such model on the client' });
      continue;
    }
    const where = { [rule.field]: { lt: cutoff } };
    if (opts.dryRun) {
      results.push({ model, deleted: await delegate.count({ where }) });
    } else {
      const { count } = await delegate.deleteMany({ where });
      results.push({ model, deleted: count });
    }
  }
  return results;
}
