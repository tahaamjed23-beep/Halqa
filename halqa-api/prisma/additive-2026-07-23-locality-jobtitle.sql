-- Additive-only migration for the 2026-07-23 signup change (commit 13d5687),
-- written 2026-07-28: the two public trust-line columns the code already
-- selects (src/lib/reputation.ts) and writes (src/routes/auth.ts).
-- locality = broad area within the city (sector/colony, never the house
-- number); jobTitle = public profession (husband's job for HOUSEWIFE).
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locality" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "jobTitle" TEXT;
