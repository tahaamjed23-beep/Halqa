-- Support tickets and disputes.
--
-- Every wallet a Pakistani member already uses lets them say "this is wrong"
-- and get a reference back. Halqa's only route was an email address on a
-- settings page, which is not a route somebody in trouble will take.
--
-- Additive and idempotent: safe to run against a live database.
CREATE TABLE IF NOT EXISTS "SupportTicket" (
  "id"          TEXT PRIMARY KEY,
  "reference"   TEXT NOT NULL UNIQUE,
  "userId"      TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "category"    TEXT NOT NULL DEFAULT 'QUESTION',
  "subject"     TEXT NOT NULL,
  "body"        TEXT NOT NULL,
  "status"      TEXT NOT NULL DEFAULT 'OPEN',
  "paymentId"   TEXT,
  "committeeId" TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "SupportTicket_userId_idx" ON "SupportTicket"("userId");
CREATE INDEX IF NOT EXISTS "SupportTicket_status_idx" ON "SupportTicket"("status");

CREATE TABLE IF NOT EXISTS "SupportMessage" (
  "id"        TEXT PRIMARY KEY,
  "ticketId"  TEXT NOT NULL REFERENCES "SupportTicket"("id") ON DELETE CASCADE,
  "author"    TEXT NOT NULL,
  "body"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "SupportMessage_ticketId_idx" ON "SupportMessage"("ticketId");
