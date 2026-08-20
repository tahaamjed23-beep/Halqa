-- A savings target on the vault.
--
-- The vault screen showed a balance, two sleeves and a projection. Nothing on
-- it told a member why they were saving, so there was no reason to come back.
-- These two columns hold the target and its name; the progress bar on the
-- vault screen is drawn from them.
--
-- Additive and idempotent: safe to run against a live database.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vaultGoalPaisa" BIGINT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "vaultGoalName" TEXT;
