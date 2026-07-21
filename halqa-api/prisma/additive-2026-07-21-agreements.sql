-- Additive-only migration, 2026-07-21: agreements feature + salary link.
-- Every statement is idempotent (IF NOT EXISTS / exception-guarded) and
-- nothing here drops or rewrites existing data.

CREATE TABLE IF NOT EXISTS "AgreementSignature" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "committeeId" TEXT,
  "docType" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "textHash" TEXT NOT NULL,
  "signedName" TEXT,
  "signatureData" TEXT,
  "signedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "ip" TEXT,
  CONSTRAINT "AgreementSignature_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AgreementSignature_userId_docType_signedAt_idx"
  ON "AgreementSignature"("userId","docType","signedAt");
CREATE INDEX IF NOT EXISTS "AgreementSignature_committeeId_docType_idx"
  ON "AgreementSignature"("committeeId","docType");

DO $$ BEGIN
  ALTER TABLE "AgreementSignature"
    ADD CONSTRAINT "AgreementSignature_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "AgreementSignature"
    ADD CONSTRAINT "AgreementSignature_committeeId_fkey"
    FOREIGN KEY ("committeeId") REFERENCES "Committee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "salaryAccountLinked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "salaryAccountRef" TEXT;
