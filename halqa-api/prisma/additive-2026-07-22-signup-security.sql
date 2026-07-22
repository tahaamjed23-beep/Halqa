-- Additive-only migration, 2026-07-22: signup-security + underwriting profile.
-- New nullable/defaulted User columns for the app PIN, phone verification, and
-- the address/occupation captured at signup. Idempotent; no data is rewritten.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "pinHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phoneVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "addressLine" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "occupationType" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "employerName" TEXT;
