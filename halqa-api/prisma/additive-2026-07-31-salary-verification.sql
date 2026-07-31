-- Additive-only migration, 2026-07-31: salary-day verification.
-- Declared + learned payday and the verification state on User; the three
-- evidence tables (collection attempts, opt-in credit-alert summaries, one
-- payslip photo). Apply on the session pooler BEFORE deploying this code.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "salaryDay" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "salaryDayLearned" INTEGER;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "salaryVerifiedAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "salaryVerifyMethod" TEXT;

CREATE TABLE IF NOT EXISTS "PaymentAttempt" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "paymentId" TEXT,
  "rail" TEXT NOT NULL,
  "calendarDay" INTEGER NOT NULL,
  "outcome" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "amountPaisa" BIGINT NOT NULL,
  "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PaymentAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PaymentAttempt_userId_attemptedAt_idx" ON "PaymentAttempt"("userId", "attemptedAt");

CREATE TABLE IF NOT EXISTS "SalarySignal" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "dayOfMonth" INTEGER NOT NULL,
  "amountBand" TEXT NOT NULL,
  "sourceClass" TEXT NOT NULL,
  "observedMonth" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalarySignal_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "SalarySignal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "SalarySignal_userId_observedMonth_sourceClass_key" ON "SalarySignal"("userId", "observedMonth", "sourceClass");

CREATE TABLE IF NOT EXISTS "PayslipUpload" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "image" BYTEA NOT NULL,
  "mime" TEXT NOT NULL,
  "sha256" TEXT NOT NULL,
  "sizeBytes" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewedAt" TIMESTAMP(3),
  CONSTRAINT "PayslipUpload_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PayslipUpload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "PayslipUpload_userId_idx" ON "PayslipUpload"("userId");
