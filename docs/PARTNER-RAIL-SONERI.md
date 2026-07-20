# Partner Rail — Bank-Partner Feature Package (Soneri sandbox)

Date: 2026-07-07. Status: implemented and verified (62/62 integration checks).

## Why this package

The strategy catalog always had a GUARDED tier parked "pending a licensed
partner": #75 auto-debit mandates, #96 statement matching, #98 payroll
deduction, #99 licensed default cover. This package activates #96 and #99 and
the KYC path on a **sandbox partner rail** shaped like a real bank integration
(Soneri Bank as the imagined partner). When a commercial agreement exists, the
sandbox flag flips and the simulated legs (instant KYC, pasted statements)
swap for the bank's APIs — the data model, ledger accounts, and product rules
do not change.

Inspiration: Oraan (SECP-registered, ~PKR 5B/yr rotates through Pakistani
committees). Their model: the platform collects and disburses, vets members,
charges **higher management fees for earlier payout slots**, and lets members
pick their slot. Two deliberate differences here:

1. **Slot fees fund the circle's own guarantee pool** — never other members
   (locked conflict decision: no member-to-member redistribution, #47/50/51
   rejected) and never the platform. Early turns carry the circle's credit
   risk; their fee capitalises the pool that protects everyone. Causal, not
   extractive.
2. **Coverage is bounded and honest.** Guaranteed payouts reach only as far as
   the pool's recorded balance. PENDING/LATE installments still block payout —
   only scheduler-escalated MISSED ones are coverable, and never the
   recipient's own installment. Defaulters owe the pool via a RecoveryCase.

## What was added

**Schema** (`prisma db push`, no data loss):
- `PartnerBank`, `StatementBatch`, `StatementLine` models; `CustodyMode` and
  `StatementLineStatus` enums.
- `Committee.custodyMode/partnerId/payoutGuaranteed/slotFeeBps`;
  `User.bankVerifiedAt/bankVerifyRef`.

**API**:
- `lib/partner-catalog.ts` — partner registry (synced at boot like schemes),
  guarantee-fund ledger account helpers, linear slot-fee schedule
  (position 1 pays `slotFeeBps`, final position pays 0).
- `lib/settlement.ts` — contribution settlement extracted from
  `routes/payments.ts` so manual records and statement matching share one
  path (penalties, ledger, holdbacks, score events identical).
- `routes/partner.ts` — `GET /api/partner` (descriptor + unlocks),
  `POST /api/partner/kyc` (CNIC format + ISO-13616 IBAN checksum → KYC
  Level 2; closes the "nothing can grant Level 2" gap),
  `POST /api/partner/committees/:id/statements` (deterministic matching:
  amount must equal the installment AND narration must name exactly one
  unpaid member; DUPLICATE refs idempotent),
  `GET /api/partner/committees/:id/guarantee-fund` (member transparency).
- `routes/committees.ts` — creation gates (custody needs partner + Level 2
  host; guarantee needs ≥0.5% slot fee; investment mode excluded), payout
  slot-fee ledger, guarantee coverage with recovery cases, fund balance on
  detail.

**Web**: bank-verification panel (Profile), partner-rail section with live
slot-fee schedule (Create), custody/guarantee banner + host statement-import
panel + guarantee-aware payout gating (Committee), partner-unlock labels
(Terminal strategy map).

**Ledger reasons added**: `SLOT_FEE_TO_GUARANTEE_POOL_RECORDED`,
`GUARANTEE_POOL_COVERED_MISSED_INSTALLMENT`.

## Verified behaviour (integration suite)

- Bad IBAN checksum rejected; valid PK IBAN grants Level 2 instantly (sandbox).
- Guarantee without funding source rejected; slot fee without custody rejected.
- Statement line with wrong amount stays UNMATCHED; exact line settles the
  named member through the standard settlement path.
- Payout with a MISSED installment: blocked while the pool is short, released
  once funded; coverage, slot fee, and the defaulter's open RecoveryCase all
  ledgered; fund endpoint shows the residual balance.

## Language discipline

Sandbox custody is still *recorded*, not *secured*. The consent text for
bank-custody circles states that custody is simulated in the sandbox and that
guarantees reach only as far as the pool's recorded balance.
