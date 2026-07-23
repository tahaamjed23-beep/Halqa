-- Additive-only migration, 2026-07-23: live home location captured at signup.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "homeLat" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "homeLng" DOUBLE PRECISION;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "homeLocationAt" TIMESTAMP(3);
