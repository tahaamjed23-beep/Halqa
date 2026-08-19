-- Additive migration, 2026-08-19.
-- The 24-hour confirmation window: a new CONFIRMING state between FORMING and
-- ACTIVE, the timestamp the window opened, and a WITHDRAWN member status that
-- is deliberately NOT an exit.
--
-- ADDITIVE ONLY. Nothing is dropped, renamed or retyped, so old and new code
-- both stay correct while a deploy rolls out. Safe to run against production
-- before the code that uses it ships: old code never produces these values.

BEGIN;

-- New lifecycle state. Postgres will not add a value that already exists, so
-- the guard keeps this file safe to re-run.
DO $$ BEGIN
  ALTER TYPE "CommitteeStatus" ADD VALUE IF NOT EXISTS 'CONFIRMING';
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- A free withdrawal during the window is not a default and must never be read
-- as one. It gets its own status rather than reusing EXITED.
DO $$ BEGIN
  ALTER TYPE "MemberStatus" ADD VALUE IF NOT EXISTS 'WITHDRAWN';
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- When the host pressed Start. The deadline is this plus 24 hours, so the
-- countdown every member sees is derived from one stored fact, not from a
-- per-member timer that could drift.
ALTER TABLE "Committee" ADD COLUMN IF NOT EXISTS "confirmingSince" TIMESTAMP(3);

COMMIT;
