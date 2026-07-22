# Ghost Protocol 07 — Credit Bureau Linkage (TASDEEQ / DataCheck / eCIB)

**Goal (chairman, 2026-07-21):** a Halqa defaulter must never get a loan again.
Defaults follow the CNIC into the national credit system, so the cost of
walking away from a circle is a ruined financial life — the strongest legal
deterrent available without any court.

## ⚠️ Access reality — no direct linkage for a non-FI (researched 2026-07-22)
There is **no official self-serve linkage** to any licensed bureau for Halqa as
a deliberately non-financial facilitator. This is a hard constraint, not a
to-do we can simply "sign up" for:
- **eCIB (SBP's own):** membership is restricted to regulated FIs only — Banks,
  DFIs, NBFCs, MFBs. SBP rule: no FI accesses eCIB without membership, and
  membership is offered only to those categories. **Closed to a non-FI** unless
  we become an NBFC/MFB (the licence we deliberately avoid). Reach it only via
  the partner institution reporting on the circle's behalf.
- **TASDEEQ & DataCheck (private bureaus):** no public "become a member" signup.
  Only a **bespoke negotiated commercial contract**, and under the Credit
  Bureaus Act 2015 it splits:
  - *Pull (read a score at signup, with written consumer consent):* achievable
    as a subscriber — **Karandaaz**, a non-bank, signed a TASDEEQ data-sharing
    agreement, so non-FI contracts exist. → **PARTNER AGREEMENT**.
  - *Report (furnish defaults):* a *non-credit-institution* furnisher requires
    **Federal-Government notification** (the route utilities/telcos took) — not
    a signup. Cleaner to furnish **through a member partner FI**. → **BANK PARTNER**.
- **TASDEEQ score scale = 200 (very poor) → 600 (excellent)**, NOT 300–850.
  Intermediate band cutoffs are not published; they arrive with the member kit.
  Halqa maps TASDEEQ→our 300–850 in `src/lib/score-bands.ts` (recalibrate there
  when the real bands land).
- **Keystone conclusion:** the bureau deterrent does **not** happen without the
  bank/aggregator partner, who is already a member of all three. Every bureau
  claim is stage-tagged **BANK PARTNER** (or PARTNER AGREEMENT for pull-only).
  Act-clause specifics are **lawyer-to-confirm** (SBP PDFs did not parse
  cleanly during research). Sources: SBP Credit Bureaus Act 2015; SBP eCIB FAQ;
  tasdeeq.com; datacheck.com.pk; Karandaaz–TASDEEQ press release.

## Why this works (once the partner is in place)
- **TASDEEQ** is an SBP-licensed private credit bureau that ingests data from
  non-bank furnishers (utilities, telcos, insurers) as well as banks.
  **DataCheck** is the second private bureau. Every regulated lender in Pakistan
  screens against these before approving anything.
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
