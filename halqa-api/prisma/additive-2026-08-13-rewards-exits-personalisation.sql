-- Additive migration, 2026-08-13.
-- Rewards ledger, the five-rung exit ladder with its restitution engine,
-- personalisation, gold-goal circles, and the cached HYPER exposure score.
--
-- ADDITIVE ONLY. Nothing is dropped, renamed or retyped, so old and new code
-- both stay correct while a deploy rolls out. Safe to run against production
-- before the code that uses it ships.

BEGIN;

-- --------------------------------------------------------------- User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "longestStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rewardPoints" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "scoreGainedThisCycle" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "accentColor" TEXT NOT NULL DEFAULT 'lime';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "themePref" TEXT NOT NULL DEFAULT 'system';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "langPref" TEXT NOT NULL DEFAULT 'en';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "textScale" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "highContrast" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "notifyPrefsJson" JSONB;

-- Seed longestStreak from the streak members have already earned, so nobody
-- loses credit for a run they built before this shipped.
UPDATE "User" SET "longestStreak" = "paymentStreak" WHERE "longestStreak" < "paymentStreak";

-- --------------------------------------------------------------- Committee
ALTER TABLE "Committee" ADD COLUMN IF NOT EXISTS "goldGoalGrams" DOUBLE PRECISION;
ALTER TABLE "Committee" ADD COLUMN IF NOT EXISTS "exposureScore" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "Committee" ADD COLUMN IF NOT EXISTS "exposureBand" TEXT NOT NULL DEFAULT 'SELF_FUNDING';
ALTER TABLE "Committee" ADD COLUMN IF NOT EXISTS "exposureAt" TIMESTAMP(3);

-- --------------------------------------------------------------- Enums
DO $$ BEGIN
  CREATE TYPE "RewardKind" AS ENUM
    ('PAID_ON_TIME','PAID_EARLY','CIRCLE_COMPLETED_CLEAN','PAID_FOR_ANOTHER','MISSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ExitRung" AS ENUM
    ('WINDOW','SUBSTITUTION','GROUP_VOTE','HARDSHIP','ABANDONMENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ExitStatus" AS ENUM
    ('OPEN','APPROVED','DECLINED','ESCALATED','WITHDRAWN','SETTLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- --------------------------------------------------------------- RewardEvent
CREATE TABLE IF NOT EXISTS "RewardEvent" (
  "id"          TEXT PRIMARY KEY,
  "userId"      TEXT NOT NULL,
  "committeeId" TEXT,
  "roundId"     TEXT,
  "kind"        "RewardKind" NOT NULL,
  "points"      INTEGER NOT NULL DEFAULT 0,
  "scoreDelta"  INTEGER NOT NULL DEFAULT 0,
  "streakAfter" INTEGER NOT NULL DEFAULT 0,
  "multiplier"  DOUBLE PRECISION NOT NULL DEFAULT 1,
  "reason"      TEXT NOT NULL,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RewardEvent_userId_createdAt_idx"
  ON "RewardEvent"("userId","createdAt");
DO $$ BEGIN
  ALTER TABLE "RewardEvent" ADD CONSTRAINT "RewardEvent_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- --------------------------------------------------------------- ExitRequest
CREATE TABLE IF NOT EXISTS "ExitRequest" (
  "id"                  TEXT PRIMARY KEY,
  "committeeId"         TEXT NOT NULL,
  "memberId"            TEXT NOT NULL,
  "userId"              TEXT NOT NULL,
  "rung"                "ExitRung" NOT NULL,
  "status"              "ExitStatus" NOT NULL DEFAULT 'OPEN',
  "reason"              TEXT,
  "voiceNoteUrl"        TEXT,
  "installmentsPaid"    INTEGER NOT NULL DEFAULT 0,
  "restitutionDuePaisa" BIGINT NOT NULL DEFAULT 0,
  "finePaisa"           BIGINT NOT NULL DEFAULT 0,
  "fineToMembersPaisa"  BIGINT NOT NULL DEFAULT 0,
  "fineToPlatformPaisa" BIGINT NOT NULL DEFAULT 0,
  "substituteUserId"    TEXT,
  "votesFor"            INTEGER NOT NULL DEFAULT 0,
  "votesAgainst"        INTEGER NOT NULL DEFAULT 0,
  "quorumMet"           BOOLEAN NOT NULL DEFAULT false,
  "closesAt"            TIMESTAMP(3),
  "decidedAt"           TIMESTAMP(3),
  "settledAt"           TIMESTAMP(3),
  "createdAt"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "ExitRequest_committeeId_status_idx"
  ON "ExitRequest"("committeeId","status");
DO $$ BEGIN
  ALTER TABLE "ExitRequest" ADD CONSTRAINT "ExitRequest_committeeId_fkey"
    FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ExitRequest" ADD CONSTRAINT "ExitRequest_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- --------------------------------------------------------------- ExitVote
CREATE TABLE IF NOT EXISTS "ExitVote" (
  "id"        TEXT PRIMARY KEY,
  "requestId" TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "approve"   BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "ExitVote_requestId_userId_key"
  ON "ExitVote"("requestId","userId");
DO $$ BEGIN
  ALTER TABLE "ExitVote" ADD CONSTRAINT "ExitVote_requestId_fkey"
    FOREIGN KEY ("requestId") REFERENCES "ExitRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ExitVote" ADD CONSTRAINT "ExitVote_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- --------------------------------------------------------------- RestitutionDebt
-- One row per earlier recipient who owes the leaver exactly one contribution,
-- because their pot was one contribution larger than everybody's after them.
CREATE TABLE IF NOT EXISTS "RestitutionDebt" (
  "id"           TEXT PRIMARY KEY,
  "requestId"    TEXT NOT NULL,
  "debtorUserId" TEXT NOT NULL,
  "roundNumber"  INTEGER NOT NULL,
  "amountPaisa"  BIGINT NOT NULL,
  "settledAt"    TIMESTAMP(3),
  "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "RestitutionDebt_requestId_idx"
  ON "RestitutionDebt"("requestId");
DO $$ BEGIN
  ALTER TABLE "RestitutionDebt" ADD CONSTRAINT "RestitutionDebt_requestId_fkey"
    FOREIGN KEY ("requestId") REFERENCES "ExitRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

COMMIT;
