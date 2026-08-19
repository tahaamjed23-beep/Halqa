-- Additive migration, 2026-08-19.
-- A committee gets a group picture, the way a WhatsApp group has one. Members
-- recognise a photo far faster than a name in a list.
--
-- ADDITIVE ONLY. Safe to run before the code that uses it ships.
ALTER TABLE "Committee" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
