# HALQA — COMPLETE DEMAND REGISTER & BUSINESS MODEL REGISTER
### Everything we demand — from ourselves, from the bank, from every partner — and the business model, entry by entry.
*Format per entry: **Item** — exact function — how it links to Halqa — [stage tag]. Companion to HALQA-STACK-AND-REQUIREMENTS-REGISTER.md. Drafted 19 July 2026.*

---

# PART A — DEMANDS ON OURSELVES (build/institute — the obligations that make us partnerable)

### A1. Cybersecurity

1. **Information Security Management System (ISO 27001-aligned)** — documented security policies, asset register, risk assessments, control audits — the framework a bank's vendor-risk team scores us against — links to: passing partner due diligence — [BANK PARTNER prerequisite]
2. **Encryption in transit (TLS 1.2+) and at rest (AES-256 on DB volumes and backups)** — no plaintext member data anywhere — links to: DB hosting, backups — [LICENCE]
3. **Key management (KMS/HSM-backed)** — JWT signing keys, DB credentials, bank API keys held in a secrets vault with rotation schedules; no secrets in code or env files in production — links to: `dotenv` replacement path — [LICENCE]
4. **Role-based access control + admin MFA** — least-privilege internal access; every admin action MFA'd and logged to the audit trail — links to: AuditLog, internal ops — [LICENCE]
5. **Secure SDLC** — mandatory code review, dependency vulnerability scanning (npm audit/Snyk), CI-blocking security checks — links to: GitHub Actions pipeline — [FUNCTIONAL to formalise]
6. **Annual penetration test + remediation report** — external firm attacks the platform; findings fixed and evidenced — the single document every bank demands first — links to: partnership onboarding — [BANK PARTNER prerequisite]
7. **Incident response plan with regulator notification clocks** — defined severity levels, on-call roster, breach notification to partners/regulators within prescribed windows, member notification policy — links to: ops + compliance calendar — [LICENCE]
8. **Vulnerability disclosure policy** — a public security.txt / contact for researchers — links to: cheap external eyes — [FUNCTIONAL to add]
9. **DDoS/WAF protection (Cloudflare-class)** — availability under attack; rate-limit profiles armed (the production switch on express-rate-limit) — links to: API/web front door — [LICENCE]

### A2. Record-keeping & data governance

10. **Immutable financial records (append-only ledger + WORM backup tier)** — the double-entry ledger and audit trail are already append-only in design; production adds write-once backup storage so history cannot be edited even by us — links to: LedgerEntry/AuditLog — [FUNCTIONAL design → LICENCE storage]
11. **Retention schedule per law** — books of account 10 years (Companies Act 2017); CDD/KYC and transaction records minimum 5 years after relationship end (AML Act 2010); our schedule documented and enforced by automated archival — links to: DB archival jobs — [LICENCE]
12. **Point-in-time-recovery backups + tested restores** — PITR-enabled Postgres, backup restore drills on a calendar (an untested backup is a hope, not a control) — links to: managed Postgres — [LICENCE]
13. **Disaster recovery + business continuity plan** — declared RPO ≤ 15 minutes / RTO ≤ 4 hours, secondary site/region, annual failover drill — links to: hosting architecture — [LICENCE]
14. **Data classification & privacy program** — member PII classified, access-logged, consent-recorded; privacy policy aligned to PECA 2016 and the Personal Data Protection framework; data-subject request procedure — links to: profile/KYC data — [LICENCE]
15. **Daily reconciliation records** — every day's escrow-vs-ledger diff stored as a signed artifact; unexplained breaks freeze placements (already the design rule) — links to: treasury module — [LICENCE+BANK]

### A3. AML / CFT (the Financial Monitoring Unit will treat us as a reporting entity)

16. **AML/CFT program under the AML Act 2010** — board-approved policy, risk-based approach documentation, annual review — links to: compliance function — [LICENCE]
17. **Appointed Compliance Officer / MLRO** — a named, fit-and-proper individual owning AML; the person who signs STRs — links to: governance — [LICENCE]
18. **Tiered KYC/CDD/EDD** — simplified due diligence for low-value members (Asaan-Account-style thresholds), enhanced due diligence for high-value vault users and hosts moving large pools — links to: NADRA/Shufti onboarding flows — [LICENCE]
19. **Sanctions & proscribed-persons screening** — automated screening of every member against UNSC consolidated lists and **NACTA's proscribed persons/entities schedules**, plus PEP lists, at onboarding and on list updates — links to: Shufti Pro/screening adapter — [LICENCE]
20. **Transaction monitoring calibrated to committee behaviour** — rules engine on ledger events: velocity anomalies, structuring patterns (many just-below-threshold top-ups), mismatch between declared income band and committee exposure, dormant-then-burst behaviour, third-party payment detection (payer ≠ member). Critically: tuned so that the committee's NORMAL pattern (many small regular deposits) doesn't drown the system in false positives — links to: ledger stream + reputation engine — [LICENCE]
21. **STR/CTR filing to the FMU via goAML** — suspicious transaction reports and currency transaction reports filed electronically to Pakistan's Financial Monitoring Unit on its goAML portal within prescribed timelines — links to: monitoring engine output — [LICENCE]
22. **AML training + independent AML audit** — annual staff training with records; periodic independent testing of the program — links to: compliance calendar — [LICENCE]

### A4. Governance, financial & consumer protection

23. **Fit-and-proper sponsors and directors** — SECP clearance files for every sponsor/director of the NBFC — links to: licence application — [LICENCE]
24. **Minimum equity capital per SECP schedule** — the licence category's required paid-up capital parked and evidenced (order of magnitude Rs 50-100M depending on category; exact figure per counsel at filing) — links to: the raise — [LICENCE]
25. **Separated compliance and internal audit functions** — compliance reports to the board, not to operations; internal audit tests both — links to: governance chart — [LICENCE]
26. **Consumer protection framework** — plain-language disclosures (already our house style), complaint handling with published turnaround times, a named grievance officer, cooling-off on first commitments, fee schedules displayed before consent (already live in-app) — links to: consent flows, notifications — [FUNCTIONAL design → LICENCE formalisation]
27. **Related-party & conflict policy, whistleblower channel** — standard board hygiene a bank's counsel will ask for — links to: governance pack — [LICENCE]
28. **Financial audit + client-money assurance** — statutory audit plus a specific auditor's assurance on client-money segregation and reconciliation controls — links to: escrow regime — [LICENCE+BANK]

---

# PART B — DEMANDS ON THE PARTNER BANK (our term sheet, line by line)

29. **Escrow account suite (4 accounts)** — client-money omnibus (trust status, bankruptcy-remote), investment settlement, charity disbursement, plus our separate operating account — links to: the entire money path — [BANK PARTNER]
30. **Virtual IBAN range under the escrow** — one PK-format virtual IBAN per committee (PK + 2 check + 4-char bank code + 16-digit account), unlimited issuance, zero per-IBAN fees, auto-tagged inflow reporting — links to: collections attribution — [BANK PARTNER]
31. **Statement & event feed** — intraday webhook feed of credits/debits (fallback: end-of-day MT940/CAMT.053), timestamped to the second, with the virtual IBAN on every line — links to: reconciliation gate — [BANK PARTNER]
32. **Defined cutoffs and settlement SLAs** — published daily cutoff for same-day fund-order settlement; payout instructions executed T+0 within banking hours; a written SLA with remedies, not a verbal culture — links to: treasury netting calendar — [BANK PARTNER]
33. **API sandbox + UAT environment** — full test environment with fake money before a single real rupee flows; certification checklist for go-live — links to: integration engineering — [BANK PARTNER]
34. **Raast sponsorship** — the bank sponsors our access to Raast P2P (disbursements), Request-to-Pay (collections), and Alias directory — links to: near-zero-fee rails — [BANK PARTNER]
35. **Auto-debit / standing instruction execution** — the bank executes SI mandates our flow captures digitally; rejects reported same-day with reason codes — links to: `autoDebitMandateRequired`, on-time engine — [LICENCE+BANK]
36. **Digital member onboarding acceptance** — bank accepts our NADRA-verified digital KYC for escrow participation under tiered Asaan-style limits — no branch visits for a Rs 5,000/month committee member — links to: onboarding conversion — [LICENCE+BANK]
37. **Deposit-mobilisation agreement — exact terms** — ~1.25%/yr commission computed on **average daily balances**, paid monthly, no clawbacks on member churn, rate review annually not unilaterally — links to: revenue line 1 — [BANK PARTNER]
38. **Profit distribution on escrow balances** — the escrow itself sits in the bank's Islamic deposit pool; members' idle cash earns the bank's declared Mudarabah rate even before fund placement; declared monthly — links to: float engine floor — [BANK PARTNER]
39. **Intraday liquidity backstop** — a small committed intraday facility on the settlement account to bridge same-day timing gaps between redemptions and payouts (never overnight, never credit to members) — links to: payout punctuality — [BANK PARTNER]
40. **Bank Shariah board sign-off** — the partner's own Shariah committee certifies the escrow/placement structure, so the halal claim carries the bank's authority too — links to: Shariah architecture — [BANK PARTNER]
41. **Agent network access** — cash-in/cash-out for unbanked members at the bank's/partners' agent counters via 1Bill presentment — links to: collections coverage — [BANK PARTNER]
42. **Dispute & error-resolution procedure** — written procedure with timelines for misposted credits, duplicate debits, failed payouts; provisional credit rules — links to: member trust, support ops — [BANK PARTNER]
43. **Data-sharing & confidentiality agreement** — mutual: they see aggregate program data, never our member-level behavioural IP; we receive account-status webhooks — links to: moat protection — [BANK PARTNER]
44. **Non-exclusivity** — we explicitly refuse exclusivity; multi-bank future preserved (second escrow bank as concentration hedge) — links to: negotiating leverage, continuity — [BANK PARTNER]
45. **Uptime SLA + dedicated relationship/ops contact** — API availability commitment with maintenance windows; a named human for settlement exceptions — links to: ops — [BANK PARTNER]
46. **Co-branded trust assets** — permission to state "collections held in escrow at <Bank>" in-app and in material — the single most conversion-lifting sentence we can print — links to: growth — [BANK PARTNER]

# PART C — DEMANDS ON THE AMC / FUND PARTNERS

47. **Institutional share class, zero loads** — no front-end/back-end load on our flows; management fee as published; our trail (~0.5%) contracted in writing, paid monthly on average AUM — links to: member yield integrity + revenue line 3 — [LICENCE]
48. **T+0/T+1 redemption on the daily-dividend money-market fund** — with a published daily cutoff (e.g., 3:00 pm) our treasury calendar hard-codes — links to: liquidity ladder — [LICENCE]
49. **Order + NAV API (or CDC Emlaak integration)** — machine purchase/redemption and daily NAV feed with an SLA; sandbox first — links to: treasury order engine, dated rates in-app — [LICENCE]
50. **Daily unit-holding statements** — electronic confirmation of units held, reconciled nightly against our per-circle unit registry — links to: money map, audits — [LICENCE]
51. **Capacity & concentration comfort** — written confirmation the funds can absorb our projected flows without gating; our own concentration cap (no more than X% of any single fund's AUM, per policy) — links to: treasury risk policy — [LICENCE]
52. **Gold fund liquidity terms** — settlement window (~T+3) contractually stated; our 10-day minimum period rule maps to it — links to: gold hedge gating — [LICENCE]

# PART D — DEMANDS ON TAKAFUL, BUREAUS, COMMS & OTHERS

53. **Takaful group treaty** — per-mille group pricing, auto-enrolment without individual underwriting up to a free-cover limit, digital claims lodgement, claim turnaround SLA (target ≤ 15 working days), our 15-20% distribution share in writing, operator's Shariah certificate on the product — links to: circle protection + revenue line 6 — [PARTNER]
54. **Credit bureau memberships (eCIB + DataCheck + Tasdeeq)** — reporting specs and test files accepted before go-live; inquiry pricing tiered to volume; our reported data attributed to Halqa as furnisher (brand presence in credit files) — links to: Credit Passport rail — [LICENCE]
55. **WhatsApp BSP terms** — template pre-approvals for reminder/receipt/invite messages, branded sender, delivery reporting API, per-conversation pricing tier — links to: nudge engine — [PARTNER]
56. **SMS masking ("HALQA" sender ID)** — registered brand mask with the telcos, delivery reports — links to: OTPs, feature-phone nudges — [PARTNER]
57. **SECP Regulatory Sandbox (optional accelerant)** — apply for a sandbox cohort to run the custody pilot under supervisory comfort before full licensing — links to: the NOW→NEXT bridge — [LICENCE path]
58. **Charity partner MOU** — a named, audited charity receiving penalty flows, with public annual disclosure of amounts routed — links to: iltizam bi-tasadduq credibility — [PARTNER]
59. **Cyber & crime insurance policy** — platform-level cover; certificate available to partners — links to: vendor-risk checklists — [LICENCE]
60. **External counsel on retainer** — NBFC filing, client-money documentation, template member agreements, bank term-sheet negotiation — links to: everything in Parts B-D — [LICENCE]

---

# PART E — THE BUSINESS MODEL REGISTER (same format: line → function → mechanics/link → tag)

### Revenue lines

61. **Deposit-mobilisation commission** — pays us for originating balances — ~1.25%/yr on average daily escrow+placed balances, bank-paid monthly; at 1M members ≈ Rs 45B balances → ~Rs 56 crore/yr — links to: escrow suite + statement feed (items 29-31, 37) — [BANK PARTNER]
62. **Membership service fee** — recurring platform access — Rs 49/member/month, hosts free; collected in-app; ≈ Rs 4.9 crore/month at 1M members — links to: payments module; hardened by auto-debit (35) — [FUNCTIONAL]
63. **Early-access fee cut** — our sliver of the time-pricing engine — fee(k)=10%×(n−k)/(n−1) of pool; 90% redistributes to waiting members, **10% to Halqa** — links to: profit engine + settlement — [FUNCTIONAL]
64. **Turn-marketplace fee** — take-rate on position trades — 10% of premium (premium capped at 50% of payout; halal-labelled circles free-swap only) — links to: exchange routes — [FUNCTIONAL]
65. **Vault Mudarib share** — service share on personal-vault yield — 5% of accrued profit on sweep, never principal — links to: vault routes — [FUNCTIONAL]
66. **Receivables origination & servicing** — packaging committee inflow schedules for institutional financiers — 1-1.5% origination + 0.5%/yr servicing; risk stays on the financier's book — links to: Bank Pack export, ledger data — [LICENCE+BANK]
67. **AMC distribution trail** — paid for AUM placed — ~0.5%/yr on average placed balances across float + vault sleeves — links to: item 47's agreement — [LICENCE]
68. **Takaful distribution share** — paid for policies enrolled — 15-20% of contribution on the group treaty — links to: item 53 — [PARTNER]
69. **Credit-data & verification fees** — paid for passport verifications and data services to institutions — per-inquiry pricing; member's own export always free — links to: bureau rails (54) — [LICENCE]
70. **Future: receivables securitization arrangement fees** — structuring committee receivables into investable paper (sukuk-style) for institutional books — arrangement basis points at scale; explicitly a later-stage line — links to: items 66 + counsel — [LICENCE+BANK, later]

### Cost lines (what the revenue must clear)

71. **Payment rail costs** — Raast ≈ free by policy; 1Bill/IBFT per-transaction paisa-level fees; wallet cash-in commissions — links to: collections mix management — [BANK PARTNER]
72. **KYC unit cost** — per-verification NADRA/Shufti fee at onboarding (one-time per member; the reason tiered KYC matters) — links to: item 18 — [LICENCE]
73. **Comms unit cost** — WhatsApp per-conversation + SMS per-message; nudges are revenue-protective (they defend on-time rates) — links to: items 55-56 — [PARTNER]
74. **Infrastructure & security run-rate** — hosting, backups, WAF, monitoring, pen tests — links to: Part A — [LICENCE]
75. **Compliance run-rate** — MLRO + compliance staff, audits (statutory, Shariah, AML), licence fees, counsel — the price of being partnerable at all — links to: Parts A/B — [LICENCE]
76. **People** — engineering, ops/support (recovery team when custody starts), growth (host acquisition city by city) — links to: everything — [all stages]

### Unit economics & KPIs (the numbers the model is steered by)

77. **ARPU** — ≈ Rs 140-170/member/month blended at scale (Rs 49 fee + institution-paid lines averaged over members) — links to: revenue lines 61-69 — [LICENCE+BANK]
78. **Balance per member** — ~Rs 45,000 average recorded/deployed balance (the deposit-needle unit) — links to: mobilisation commission base — [LICENCE+BANK]
79. **CAC via hosts** — each host imports 6-20 members with her circle; host acquisition ≈ member acquisition at ~1/10th cost — the Rozee-style network math — links to: referral (Rs 250 on completed first cycle), host-free pricing — [FUNCTIONAL]
80. **Steering KPIs** — on-time rate (94.0% simulated), post-payout default (0.99%), recovery (75.3%), float days per rupee, blended vault rate, reconciliation breaks (target: zero) — links to: simulation + ledger analytics — [FUNCTIONAL]

---

*How to read this in a meeting: Parts A says "we hold ourselves to bank standards before you ask." Parts B-D say "and here is exactly what we need from you, in your own vocabulary." Part E says "and this is the machine it all feeds." Nothing here is aspiration-ware — every FUNCTIONAL tag is running code, and every other tag has a named counterparty type.*
