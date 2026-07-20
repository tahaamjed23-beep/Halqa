# Halqa Sigma Engineering Report

Date: 6 July 2026  
Scope: `D:\HALQA SIGMA APP`  
Status: functioning Stage 1 record-only prototype; not production financial infrastructure

## Executive status

Halqa runs locally as one role-aware customer application backed by Express, PostgreSQL, Prisma, and Socket.io. Members can join circles, record installments, see turns, inspect read-only investment performance, exchange future turns inside their circle, chat, receive notifications, and apply to host. Approved hosts receive management, risk-policy, investment, and lifecycle controls. Administrators retain approval authority.

The prototype must not be represented as holding money, executing investments, completing legal KYC, or settling payouts. Those operations remain recorded or simulated until regulated providers and production credentials are connected.

## Product and interface changes

- Rebuilt the web experience as a responsive gold, ivory, and graphite interface with consistent spacing, icons, controls, and contrast.
- Consolidated member and host journeys into one application. Host controls appear only after administrator approval and role refresh.
- Made member count independently configurable from 3 to 30; duration no longer determines group size.
- Added dashboard summaries for recorded savings, next payout, next installment, realized investment profit, and reliability score.
- Added complete circle views: recipient/turn, schedule, payment status, investment status, risk mandate, and chat.
- Added host-visible policy editing while a circle is forming. Members see policy and performance but cannot change either.
- Added 1/10 to 10/10 risk labels, explicit consent, stress projections, reserve controls, and liquidity controls.
- Added a scheme catalog and exact-conservation portfolio optimizer.
- Restricted marketplace transfers to future turns between members of the same circle.
- Removed the ungrounded Rami assistant and fake AI behavior.

## Financial and lifecycle correctness

- Money uses integer paisa; validated inputs reject negatives, decimals, unsafe integers, and oversized values.
- Installment principal is separated from penalties, preventing penalties from inflating the investable pool.
- Investment requires all current-round installments to be paid.
- Payout is blocked before the locked payout date and while investment remains active.
- The recipient must be paid by the seven-day eligibility deadline.
- Principal return and realized profit are separate append-only ledger entries.
- Cycle allocations conserve every paisa using BigInt and deterministic remainder handling.
- Profit is allocated by capital-days; principal is allocated by paid principal.
- Concurrent payment, investment, liquidation, payout, exchange, and deposit requests use conditional state claims.
- Membership positions are unique and swaps preserve database constraints.

## Risk model

The engine combines scheme volatility, liquidity, duration mismatch, concentration, issuer exposure, currency exposure, payout timing, reserve adequacy, and repayment behavior. Host mandates are bounded by mode:

- Rotating: maximum 3/10.
- Hybrid: maximum 6/10.
- Investment: maximum 8/10.

Portfolio weights normalize to exactly 10,000 basis points and allocations exactly equal supplied principal. Caps and member consent are API-enforced. Scores are decision aids, not forecasts or guarantees. Production data must show source and as-of date and reject stale observations.

## Default precautions

Implemented: hosting threshold and approval, due-date obligations, deterministic score events, payment gates, recipient eligibility deadline, payout/liquidity reserves, append-only ledger, idempotency controls, and same-circle marketplace restrictions.

Next controls:

- Define automatic skip/reorder behavior when a recipient misses eligibility; the current system blocks for manual resolution.
- Add a funded first-loss reserve with transparent pricing and legal ownership.
- Require stronger identity, device, and bank verification before payout.
- Add disputes, hardship rescheduling, collections, and dual-control overrides.
- Add velocity limits, device alerts, beneficiary cooling periods, and sanctions/PEP checks through approved providers.

## Investment strategy

Use liability-matched investing rather than maximizing headline yield. Every allocation should mature before its payout obligation and preserve a liquid reserve.

1. Build a maturity ladder aligned to payout dates.
2. Keep 10-15% in same-day liquidity, rising when repayment quality deteriorates.
3. Restrict rotating circles to short-duration, low-volatility instruments and low allocations.
4. Allow higher allocations only in explicit hybrid/investment circles after informed consent.
5. Optimize net return after tax, sales load, management fee, liquidity haircut, default reserve, and Halqa fee.
6. Reject allocations whose expected net gain is trivial relative to lock-up and default risk.
7. Support Shariah-only mandates and prevent hosts exceeding member-approved bounds.

Recommended additions: maturity ladder, scenario comparison, rate-freshness monitor, minimum-viable-profit test, default-reserve pricing, and regulated execution adapters. Higher nominal yield is not worthwhile when it creates payout-liquidity risk.

Sources reviewed:

- SBP Market Treasury Bills auction result, 13 May 2026: https://www.sbp.org.pk/ecodata/auction-tbills.pdf
- InvestPak auction results: https://investpak.sbp.org.pk/auction_results
- National Savings profit rates: https://savings.gov.pk/latest-profit-rates/
- MUFAP daily NAV and sales loads: https://mufap.com.pk/Industry/IndustryStatDaily?tab=3
- SECP CIS suitability and risk categorization: https://www.secp.gov.pk/document/circular-no-06-of-2022-requirements-for-assessing-suitability-and-risk-categorization-of-collective-investment-schemes-cis/
- SECP mutual fund/CIS master circular: https://www.secp.gov.pk/document/master-circular-for-mutual-funds-mf-collective-investment-schemes-cis-investment-advisory-services-ias-updated-september-30-2024/

## Verification evidence

- API TypeScript production build: passed.
- Web TypeScript and Vite production build: passed.
- Unit/property tests: 7 passed across 2 files.
- Randomized distribution checks: 2,000 cases with exact paisa conservation.
- Integration lifecycle: 33 checks passed across authentication, authorization, consent, deposits, installments, investment, liquidation, payout, and advancement.
- Deterministic stress simulation: 25,000 synthetic scenarios completed.
- Browser smoke test: login succeeded, dashboard rendered, and responsive viewport had no horizontal overflow.

Synthetic modeled loss frequency was 6.92% overall: rotating 3.71%, hybrid 6.94%, investment 10.16%; low-risk 3.11%, medium 10.78%, high 22.62%. These results validate ordering and software behavior only. They are not empirical forecasts or customer-return claims.

## Security status

Controls include bcrypt, rotating hashed refresh tokens, JWT verification, database-backed admin authorization, ban checks, Zod validation, Helmet, CORS, HTTP rate limiting, authenticated/member-checked sockets, socket throttling, uniqueness constraints, transactional claims, and audit records.

An official repository scan was started. Core application paths received manual sink-oriented review and five vendored PostgreSQL files were classified not applicable. The planned exhaustive 55-file independent-worker scan did not finish because the security-worker quota was exhausted. This report does not claim exhaustive security closure. Complete that scan, SBOM/dependency review, penetration testing, secret scanning, and external financial-controls audit before production.

## Remaining production blockers

1. Regulated custody, escrow, and payout partner; transfers are records only.
2. JazzCash, Easypaisa, Raast, and bank webhook signatures, settlement reconciliation, refunds, and chargebacks.
3. Production KYC: OTP ownership, authorized CNIC validation, OCR, liveness, sanctions/PEP checks, and retention policy.
4. Licensed investment/custody execution and regulatory model; investments are simulated.
5. Full owner operations console for disputes, freezes, schedule changes, reconciliation, governance, and dual-control overrides.
6. Production hosting, secret management, TLS, backups, migrations, monitoring, alerting, and disaster recovery.
7. Privacy policy, terms, consent evidence, disclosures, legal review, support, and complaint handling.
8. Capacitor/native packaging, push notifications, device/accessibility testing, signing, store metadata, and reviewer accounts.
9. Exhaustive security scan, penetration test, dependency audit, and remediation closure.
10. Product decision for recipient skipping/reordering and true compounding-circle rollover.

## Readiness

- Local functional prototype: strong.
- Partner/investor demonstration: suitable when labeled record-only/simulated.
- Closed pilot using real money: not ready.
- Public app-store financial launch: not ready.

The remaining gap is mainly regulated payment/custody integration, operations, compliance, and independently verified security.

## Local operation

Double-click `D:\HALQA SIGMA APP\START-HALQA.cmd`.

- Customer app: http://localhost:4100
- API health: http://localhost:4101/api/health
- Demo password: `halqa123`
- Usernames: `taha`, `ahmed`, `sana`, `ayesha`, `bilal`

## Protection and investment expansion update

Implemented after the original report:

- Expanded the live scheme catalog to government securities, National Savings, conventional and Islamic money-market/income funds, bank deposits, sukuk, multi-asset funds, gold, ETF/equity, REIT, invoice, trade-finance, microfinance, and hedged baskets. Every entry carries risk, liquidity, volatility, eligibility, date, source, and regulatory/execution status.
- Added host-configurable anti-default policy controls that lock when a committee starts: graduated deposits, rolling payout holdback, holdback release threshold, progressive fixed penalties, profit collateral, feature lock, smart and peer nudges, promissory/guarantor/mandate records, deposit yield, default reserve, post-receipt score penalty, and rehabilitation cooldown.
- Added a member-visible Protection tab with current deadline, remaining obligations, deposit and payout collateral, maximum default impact, commitment status, payment matrix, private peer nudges, and clearly labeled partner-gated controls.
- Added payout holdback creation and automatic release after clean subsequent payments.
- Added post-receipt default cases, collateral forfeiture, guarantor consequence, global feature lock, private notifications, collateral-covered missed installments, recovery recording, and six-month low-risk cooldown.
- Banned users can still authenticate to inspect and resolve recovery cases; money and marketplace mutation endpoints remain restricted.
- External auto-debit, credit-bureau reporting, licensed insurance, payroll deduction, custody, and execution are displayed as partner/legal gates and are not falsely represented as live.

Final verification after this update:

- PostgreSQL schema synchronization and Prisma generation passed.
- API TypeScript build passed.
- Web TypeScript/Vite production build passed.
- Unit/property suite: 7/7 passed.
- Integration lifecycle: 33/33 checks passed.
- Deterministic synthetic stress suite: 25,000 scenarios completed.
- New protection API smoke test passed for full policy persistence, commitment recording, and committee matrix retrieval.
- Browser smoke test passed at 590px: authenticated dashboard and Protection tab rendered without errors or horizontal overflow.
