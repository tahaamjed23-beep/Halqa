# Ghost Protocol 07 — Credit Bureau Linkage (TASDEEQ / DataCheck / eCIB)

**Goal (chairman, 2026-07-21):** a Halqa defaulter must never get a loan again.
Defaults follow the CNIC into the national credit system, so the cost of
walking away from a circle is a ruined financial life — the strongest legal
deterrent available without any court.

## Why this works
- **TASDEEQ** is an SBP-licensed private credit bureau that accepts data from
  fintechs, BNPL and payday lenders — not only banks. **DataCheck** is the
  second private bureau. Every regulated lender in Pakistan screens against
  these before approving anything.
- **eCIB** is the State Bank's bureau; only regulated financial institutions
  report into it. Halqa reaches it **via the partner institution** (custody
  bank / NBFC partner reports the default on the circle's behalf).
- Money Fellows runs the identical play with iScore in Egypt: report every
  payment (positive and negative), so members also *build* credit by paying on
  time — the carrot that makes the stick legitimate.

## Consent basis (already live in the app)
Clause 5 of the weekly-renewed PLATFORM_UNDERTAKING (src/lib/agreements.ts):
members consent to reporting of positive and negative payment behaviour to
licensed bureaus and, via partners, to eCIB, plus delegated credit-assessment
authority. Signed electronically under ETO 2002, versioned + hashed.

## Data feed (already accumulating)
- `CreditEvent` rows — every on-time / late / missed checkpoint per user per round.
- `AuditLog` action `BUREAU_IMPACT_QUEUED` — written by the delinquency service
  for every missed installment and post-payout default, with user, stage,
  days-late and amount. This is the export queue.
- `KycRecord.cnicNumber` — the CNIC the record attaches to.

## Activation steps
1. Sign a **data-provider / member agreement with TASDEEQ** (and DataCheck).
   Commercial agreement, not a licence. Provide: subscriber data format
   mapping, monthly (later real-time) submission file, dispute-handling contact.
2. Build the exporter: `BUREAU_IMPACT_QUEUED` + `CreditEvent` →
   bureau-format file (CNIC, name, obligation, DPD bucket, status, amount).
   Include POSITIVE history, not just defaults.
3. eCIB: route through the partner institution once the custody/NBFC partner
   is live; the partner reports circle receivables performance under its own
   eCIB membership.
4. In-app: surface "reported to bureau" status on the defaulter's recovery
   case; surface "your on-time history builds your national credit file" to
   everyone else (the carrot).

## Guardrails (SECP has banned 142 lending apps — mostly for abusive recovery)
- Report **truthfully and only per consent**; run a dispute/correction flow.
- Never contact-list shaming, never harassment — bureau + mandate + summary
  suit are the only channels.
- Positive reporting matters as much as negative: it is what makes Halqa a
  credit-building product (Credit Passport ↔ bureau file) instead of a
  collections app.
