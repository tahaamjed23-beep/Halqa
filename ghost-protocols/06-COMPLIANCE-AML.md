# Ghost 06 — Compliance & AML program
*Unlock needed: SECP licence (obligations attach at custody). Code activation: ~1–2 days; the program is rules over event architecture that already exists.*

## Posture
Record-only Stage 1 has minimal AML surface (we never touch funds). Custody changes that overnight: Halqa becomes a reporting entity under AML/CFT rules. The design principle: **compliance as code** — every rule below is an automated check writing to the same append-only audit architecture as SecurityEvent, reviewed by a human, exportable to a regulator on demand.

## 1. Customer risk rating (CRR)
At KYC Level 1, each member gets a risk score updated on behaviour: base (occupation/geography per SBP guidance) + flags (PEP screen hit, high-velocity account, linked-account churn). High-risk = enhanced due diligence before L2, lower velocity limits. PEP/sanctions screening against NACTA + UNSC lists at onboarding and nightly diff (list files are public; parser is trivial).

## 2. Transaction monitoring rules (enforce mode at activation; all thresholds config, not code)
- Velocity: member cash-in > Rs 500k/month → review · > Rs 1M → hold + EDD.
- Structuring: ≥3 cash-ins just under a round threshold within 7 days → flag.
- Pass-through: vault deposit followed by sweep-out < 48h repeatedly (wash pattern) → flag.
- Committee-shaped anomalies: one payer funding many members' installments (proxy funding) · payout redirected to a never-before-seen account (02 makes this visible) · circles whose members share a device fingerprint (04's TrustedDevice doubles as this signal).
- Every flag → `ComplianceCase` (OPEN → REVIEWED → CLEARED/ESCALATED) with 4-eyes close-out.
```prisma
model ComplianceCase { id String @id @default(cuid()); userId String?; committeeId String?; rule String; severity Int; status String @default("OPEN"); notes String?; openedAt DateTime @default(now()); closedAt DateTime?; closedBy String? }
```

## 3. Regulatory reporting
STR (suspicious transaction report) template generation from a ComplianceCase → goAML format for FMU (Pakistan's FIU) · CTR thresholds per prevailing rules · monthly compliance summary (cases opened/closed, rules fired, response times) to the board and, when requested, SECP. eCIB monthly file per 02.

## 4. Record-keeping & governance
All KYC records, cases, and money-movement logs retained ≥ 5 years (regulatory floor) on the immutable-export path from 04 §5 · a designated Compliance Officer (first hire on the investor's cheque — this is a named-person legal requirement, not an engineering item) · annual AML training log, policy manual versioned in this repo.

## 5. What we can honestly tell SECP on day one
"Every rupee movement is born as a double-entry ledger row with a reason code and an idempotency key; every security and compliance event is an append-only audit row; our monitoring rules are code, versioned in git, with human 4-eyes closure. Inspect anything, any time." Few licence applicants can say that sentence truthfully. It is our regulatory moat as much as our engineering one.

## Activation checklist
- [ ] Compliance Officer engaged (fractional acceptable at pilot) · policy manual v1 adopted
- [ ] Migration G6 (ComplianceCase, RiskRating) · rules engine live in shadow mode 2 weeks → enforce
- [ ] NACTA/UNSC list sync job · goAML credentials from FMU · STR dry-run validated
- [ ] Retention/export jobs verified · monthly compliance report template approved
