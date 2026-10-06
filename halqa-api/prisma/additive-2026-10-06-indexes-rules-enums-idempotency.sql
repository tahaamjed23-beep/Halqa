-- Halqa, additive migration of 6 October 2026
--
-- 43 indexes, 34 foreign key delete rules, three status columns moved from free
-- text to an enum, and the IdempotencyRecord table.
--
-- WHY IT IS NEEDED BEFORE THE DEPLOY. The Vercel build runs `prisma generate`
-- and nothing else, so no migration runs on a deploy. The code being deployed
-- reads IdempotencyRecord and the three enum columns; without this, those
-- requests fail in production the moment the deploy lands.
--
-- WHAT WAS CHANGED FROM PRISMA'S OWN OUTPUT. Prisma writes an enum conversion
-- as DROP COLUMN then ADD COLUMN with a default, which discards every value.
-- Production holds SupportTicket rows marked CLOSED, and that script would have
-- reopened all of them. The three conversions below use a cast instead, which
-- keeps the values. Each column's existing values were read first and all are
-- valid members of their new enum.
--
-- RE-RUNNABLE. Every statement is guarded, so this reaches the intended
-- state from wherever the database starts and is safe to run twice. The
-- rehearsal found an index that already existed; production cannot be
-- introspected from here, so it converges rather than assumes.
--
-- SAFETY. Nothing here drops a column, a table or a row. The DROP CONSTRAINT
-- lines are each followed immediately by the same constraint with its delete
-- rule stated. Run inside one transaction, so a failure anywhere leaves the
-- database exactly as it was.

BEGIN;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WaitlistStatus') THEN
    CREATE TYPE "WaitlistStatus" AS ENUM ('WAITING', 'OFFERED', 'JOINED', 'WITHDRAWN');
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PayslipStatus') THEN
    CREATE TYPE "PayslipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');
  END IF;
END $$;

-- CreateEnum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TicketStatus') THEN
    CREATE TYPE "TicketStatus" AS ENUM ('OPEN', 'ANSWERED', 'CLOSED');
  END IF;
END $$;

-- DropForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT IF EXISTS "LedgerEntry_committeeId_fkey";

-- DropForeignKey
ALTER TABLE "SecurityDeposit" DROP CONSTRAINT IF EXISTS "SecurityDeposit_membershipId_fkey";

-- DropForeignKey
ALTER TABLE "ProtectionCommitment" DROP CONSTRAINT IF EXISTS "ProtectionCommitment_guarantorUserId_fkey";

-- DropForeignKey
ALTER TABLE "Investment" DROP CONSTRAINT IF EXISTS "Investment_committeeId_fkey";

-- DropForeignKey
ALTER TABLE "Investment" DROP CONSTRAINT IF EXISTS "Investment_roundId_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeListing" DROP CONSTRAINT IF EXISTS "ExchangeListing_committeeId_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeBid" DROP CONSTRAINT IF EXISTS "ExchangeBid_bidderId_fkey";

-- DropForeignKey
ALTER TABLE "CreditEvent" DROP CONSTRAINT IF EXISTS "CreditEvent_userId_fkey";

-- DropForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_senderId_fkey";

-- DropForeignKey
ALTER TABLE "ChatRead" DROP CONSTRAINT IF EXISTS "ChatRead_userId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleChangeRequest" DROP CONSTRAINT IF EXISTS "ScheduleChangeRequest_committeeId_fkey";

-- DropForeignKey
ALTER TABLE "ScheduleChangeRequest" DROP CONSTRAINT IF EXISTS "ScheduleChangeRequest_requestedById_fkey";

-- DropForeignKey
ALTER TABLE "PaymentAttempt" DROP CONSTRAINT IF EXISTS "PaymentAttempt_userId_fkey";

-- DropForeignKey
ALTER TABLE "SalarySignal" DROP CONSTRAINT IF EXISTS "SalarySignal_userId_fkey";

-- DropForeignKey
ALTER TABLE "PayslipUpload" DROP CONSTRAINT IF EXISTS "PayslipUpload_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExitRequest" DROP CONSTRAINT IF EXISTS "ExitRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExitVote" DROP CONSTRAINT IF EXISTS "ExitVote_userId_fkey";

-- AlterTable
-- The cast keeps every value. Prisma writes this as DROP COLUMN then ADD
-- COLUMN, which would have set every row back to the default.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'CommitteeWaitlist' AND column_name = 'status' AND data_type = 'text') THEN
    ALTER TABLE "CommitteeWaitlist" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "CommitteeWaitlist" ALTER COLUMN "status" TYPE "WaitlistStatus" USING "status"::"WaitlistStatus";
    ALTER TABLE "CommitteeWaitlist" ALTER COLUMN "status" SET DEFAULT 'WAITING';
  END IF;
END $$;

-- AlterTable
-- The cast keeps every value. Prisma writes this as DROP COLUMN then ADD
-- COLUMN, which would have set every row back to the default.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'PayslipUpload' AND column_name = 'status' AND data_type = 'text') THEN
    ALTER TABLE "PayslipUpload" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "PayslipUpload" ALTER COLUMN "status" TYPE "PayslipStatus" USING "status"::"PayslipStatus";
    ALTER TABLE "PayslipUpload" ALTER COLUMN "status" SET DEFAULT 'PENDING';
  END IF;
END $$;

-- AlterTable
-- The cast keeps every value. Prisma writes this as DROP COLUMN then ADD
-- COLUMN, which would have set every row back to the default.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name = 'SupportTicket' AND column_name = 'status' AND data_type = 'text') THEN
    ALTER TABLE "SupportTicket" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TABLE "SupportTicket" ALTER COLUMN "status" TYPE "TicketStatus" USING "status"::"TicketStatus";
    ALTER TABLE "SupportTicket" ALTER COLUMN "status" SET DEFAULT 'OPEN';
  END IF;
END $$;

-- CreateTable
CREATE TABLE IF NOT EXISTS "IdempotencyRecord" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "responseJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IdempotencyRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "IdempotencyRecord_createdAt_idx" ON "IdempotencyRecord"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "IdempotencyRecord_userId_route_key_key" ON "IdempotencyRecord"("userId", "route", "key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "User_referredById_idx" ON "User"("referredById");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Committee_hostId_status_idx" ON "Committee"("hostId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Committee_status_listedPublicly_createdAt_idx" ON "Committee"("status", "listedPublicly", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommitteeWaitlist_committeeId_status_idx" ON "CommitteeWaitlist"("committeeId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommitteeMember_userId_status_idx" ON "CommitteeMember"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CommitteeMember_committeeId_status_turnPosition_idx" ON "CommitteeMember"("committeeId", "status", "turnPosition");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Round_committeeId_roundNumber_idx" ON "Round"("committeeId", "roundNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Round_committeeId_status_idx" ON "Round"("committeeId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Round_recipientId_payoutDate_idx" ON "Round"("recipientId", "payoutDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_payerId_dueDate_idx" ON "Payment"("payerId", "dueDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_payerId_status_idx" ON "Payment"("payerId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_roundId_status_idx" ON "Payment"("roundId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Payment_status_dueDate_idx" ON "Payment"("status", "dueDate");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LedgerEntry_committeeId_createdAt_idx" ON "LedgerEntry"("committeeId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "LedgerEntry_refType_refId_idx" ON "LedgerEntry"("refType", "refId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SecurityDeposit_membershipId_status_idx" ON "SecurityDeposit"("membershipId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ProtectionCommitment_guarantorUserId_idx" ON "ProtectionCommitment"("guarantorUserId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutHoldback_committeeId_status_idx" ON "PayoutHoldback"("committeeId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayoutHoldback_membershipId_status_idx" ON "PayoutHoldback"("membershipId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RecoveryCase_committeeId_status_idx" ON "RecoveryCase"("committeeId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Scheme_isActive_riskScore_idx" ON "Scheme"("isActive", "riskScore");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RiskConsent_committeeId_status_idx" ON "RiskConsent"("committeeId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Investment_roundId_status_idx" ON "Investment"("roundId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExchangeListing_status_listedAt_idx" ON "ExchangeListing"("status", "listedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExchangeListing_committeeId_status_idx" ON "ExchangeListing"("committeeId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExchangeListing_sellerId_status_idx" ON "ExchangeListing"("sellerId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExchangeBid_listingId_status_premiumPaisa_idx" ON "ExchangeBid"("listingId", "status", "premiumPaisa");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExchangeBid_bidderId_status_idx" ON "ExchangeBid"("bidderId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CreditEvent_userId_scoredAt_idx" ON "CreditEvent"("userId", "scoredAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ChatMessage_committeeId_sentAt_idx" ON "ChatMessage"("committeeId", "sentAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_entityType_entityId_at_idx" ON "AuditLog"("entityType", "entityId", "at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_actorId_at_idx" ON "AuditLog"("actorId", "at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "AuditLog_action_at_idx" ON "AuditLog"("action", "at");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_revokedAt_expiresAt_idx" ON "RefreshToken"("userId", "revokedAt", "expiresAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "PayslipUpload_userId_uploadedAt_idx" ON "PayslipUpload"("userId", "uploadedAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExitRequest_committeeId_createdAt_idx" ON "ExitRequest"("committeeId", "createdAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "ExitRequest_userId_status_idx" ON "ExitRequest"("userId", "status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "RestitutionDebt_debtorUserId_settledAt_idx" ON "RestitutionDebt"("debtorUserId", "settledAt");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "SupportTicket_userId_createdAt_idx" ON "SupportTicket"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "LedgerEntry" DROP CONSTRAINT IF EXISTS "LedgerEntry_committeeId_fkey";
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecurityDeposit" DROP CONSTRAINT IF EXISTS "SecurityDeposit_membershipId_fkey";
ALTER TABLE "SecurityDeposit" ADD CONSTRAINT "SecurityDeposit_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "CommitteeMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProtectionCommitment" DROP CONSTRAINT IF EXISTS "ProtectionCommitment_guarantorUserId_fkey";
ALTER TABLE "ProtectionCommitment" ADD CONSTRAINT "ProtectionCommitment_guarantorUserId_fkey" FOREIGN KEY ("guarantorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" DROP CONSTRAINT IF EXISTS "Investment_committeeId_fkey";
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Investment" DROP CONSTRAINT IF EXISTS "Investment_roundId_fkey";
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeListing" DROP CONSTRAINT IF EXISTS "ExchangeListing_committeeId_fkey";
ALTER TABLE "ExchangeListing" ADD CONSTRAINT "ExchangeListing_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExchangeBid" DROP CONSTRAINT IF EXISTS "ExchangeBid_bidderId_fkey";
ALTER TABLE "ExchangeBid" ADD CONSTRAINT "ExchangeBid_bidderId_fkey" FOREIGN KEY ("bidderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditEvent" DROP CONSTRAINT IF EXISTS "CreditEvent_userId_fkey";
ALTER TABLE "CreditEvent" ADD CONSTRAINT "CreditEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" DROP CONSTRAINT IF EXISTS "ChatMessage_senderId_fkey";
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRead" DROP CONSTRAINT IF EXISTS "ChatRead_userId_fkey";
ALTER TABLE "ChatRead" ADD CONSTRAINT "ChatRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleChangeRequest" DROP CONSTRAINT IF EXISTS "ScheduleChangeRequest_committeeId_fkey";
ALTER TABLE "ScheduleChangeRequest" ADD CONSTRAINT "ScheduleChangeRequest_committeeId_fkey" FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleChangeRequest" DROP CONSTRAINT IF EXISTS "ScheduleChangeRequest_requestedById_fkey";
ALTER TABLE "ScheduleChangeRequest" ADD CONSTRAINT "ScheduleChangeRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentAttempt" DROP CONSTRAINT IF EXISTS "PaymentAttempt_userId_fkey";
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SalarySignal" DROP CONSTRAINT IF EXISTS "SalarySignal_userId_fkey";
ALTER TABLE "SalarySignal" ADD CONSTRAINT "SalarySignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PayslipUpload" DROP CONSTRAINT IF EXISTS "PayslipUpload_userId_fkey";
ALTER TABLE "PayslipUpload" ADD CONSTRAINT "PayslipUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitRequest" DROP CONSTRAINT IF EXISTS "ExitRequest_userId_fkey";
ALTER TABLE "ExitRequest" ADD CONSTRAINT "ExitRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExitVote" DROP CONSTRAINT IF EXISTS "ExitVote_userId_fkey";
ALTER TABLE "ExitVote" ADD CONSTRAINT "ExitVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdempotencyRecord" DROP CONSTRAINT IF EXISTS "IdempotencyRecord_userId_fkey";
ALTER TABLE "IdempotencyRecord" ADD CONSTRAINT "IdempotencyRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT;
