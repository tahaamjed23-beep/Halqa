# Ghost 01 — Custody & real payment rails
*Unlocks needed: SECP NBFC licence + MFB partner. Code activation: ~1 day (designs below are final).*

## Architecture
One **omnibus escrow account** at the partner MFB, mirrored by the existing per-user/per-committee virtual balances on Halqa's double-entry ledger. The MFB holds the money; Halqa holds the truth. Segregation is logical (ledger) + contractual (trust/escrow agreement), reconciled daily against the bank statement.

- **Collection leg:** member pays their installment via Raast (preferred, free), card/wallet via PSP, or agent cash-in at MFB branches. Every credit into escrow carries a reference `HLQ-{committeeId}-{roundNo}-{memberShort}` — the same reference format the prototype's partner-rail statement matcher already parses.
- **Payout leg:** on round release, a disbursement instruction moves pot − holdback from escrow to the recipient's linked bank account/wallet (02 handles linkage). Two-man rule above Rs 250k (ops approver + system).
- **No commingling:** Halqa's own revenue (5% Mudarib share) sweeps weekly from escrow to the corporate operating account, only after profit realization posts on the ledger.

## Provider shortlist (decision pre-made, contracts pending)
- **Raast integration:** via the partner MFB's existing Raast membership (fastest; no separate PSP licence needed) — this is the default path.
- **PSP fallback for cards/wallets:** 1LINK/PayFast-class aggregator; only if member research shows meaningful non-Raast demand.
- **Agent cash-in:** the MFB's branch + agent network (their 350+ branches are the physical rail).

## Schema (migration G1)
```prisma
model CustodyAccount { id String @id @default(cuid()); provider String; externalRef String @unique; type CustodyType; currency String @default("PKR"); createdAt DateTime @default(now()) }
enum CustodyType { OMNIBUS_ESCROW OPERATING CHARITY }
model SettlementInstruction {
  id String @id @default(cuid()); direction SettleDirection; amountPaisa BigInt; status SettleStatus @default(PENDING)
  ledgerEntryId String @unique  // every real-money move is born from a ledger entry — never the reverse
  externalRef String?; bankRef String?; failureReason String?
  createdAt DateTime @default(now()); executedAt DateTime?; reconciledAt DateTime?
  @@index([status]) }
enum SettleDirection { COLLECT DISBURSE SWEEP REFUND }
enum SettleStatus { PENDING SENT CONFIRMED FAILED RECONCILED }
```

## API surface (new routes, feature-flagged `STAGE=CUSTODY`)
- `POST /api/custody/collect-intent` — member declares an incoming payment; returns the reference to put on the Raast transfer.
- `POST /api/custody/webhook/:provider` — signed provider callbacks (HMAC verified) that confirm credits/debits; idempotent by bankRef.
- `POST /api/custody/disburse` — internal, invoked by the existing payout route when STAGE=CUSTODY; creates a SettlementInstruction from the payout ledger entry.
- `GET /api/custody/recon/:date` — the daily reconciliation report (below).

## The settlement engine (worker)
A queue worker (BullMQ/Redis) drains PENDING instructions: submit → poll/webhook confirm → mark CONFIRMED → ledger already balanced (the instruction *came from* a ledger entry, so no double-posting is possible). Failures: retry ×3 with backoff → FAILED + ops alert + member notification. Kill-switch env `SETTLEMENT_PAUSED=true` freezes the worker without touching the API.

## Reconciliation (the non-negotiable)
Daily job at 23:30 PKT: pull the escrow statement (MFB API/SFTP), match every line to a SettlementInstruction by bankRef/amount/date, mark RECONCILED. Output: matched count, unmatched bank lines (investigate = possible unrecorded credit), unmatched instructions (investigate = possible failed disbursement). **Rule: an unreconciled day blocks the next day's disbursements** until an ops override with reason is logged.

## Activation checklist
- [ ] Escrow + operating + charity accounts opened at MFB; trust/escrow agreement signed
- [ ] Webhook HMAC secrets exchanged; UAT credentials in the secrets vault (04)
- [ ] Migration G1; `STAGE=CUSTODY` flag on staging; four money paths green in UAT
- [ ] Recon runs 3 consecutive UAT days clean; kill-switch tested
- [ ] Pilot allowlist only; daily recon report to founder + MFB ops for first 30 days

## Activation tests (added to the suite)
Collect-intent → simulated webhook credit → payment auto-settles (mirrors today's partner-rail test) · payout creates instruction → simulated confirm → recon matches · webhook replay is idempotent · unreconciled day blocks disbursement · sweep only after realized profit.
