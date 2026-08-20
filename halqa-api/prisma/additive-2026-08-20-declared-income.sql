-- Declared monthly income, taken at signup.
--
-- The signup wizard has asked "roughly what do you earn a month" for a while
-- and thrown the answer away, because there was nowhere to put it. The
-- affordability engine then had to assume zero income for every member, which
-- makes it refuse every committee. These two columns are that missing store.
--
-- Declared, not verified. incomeVerifiedAt is the separate, stronger fact.
-- Additive and idempotent: safe to run against a live database.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "declaredIncomePaisa" BIGINT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "declaredIncomeAt" TIMESTAMP(3);
