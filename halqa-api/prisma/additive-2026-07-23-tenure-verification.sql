-- Additive-only migration, 2026-07-23: tenure quarantine + verification discounts
-- + biometric/CNIC-capture flags. All nullable/defaulted; idempotent; no rewrite.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "committeesCompletedClean" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "earlyTurnVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "incomeVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "chequeSecuredAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "biometricCredId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "cnicCaptured" BOOLEAN NOT NULL DEFAULT false;
