# HALQA — STACK & REQUIREMENTS REGISTER
### List 1: every product we use today, exactly. List 2: every external thing we will need, exactly.
*Format per entry: **Product (version)** — exact function — how we use it — which Halqa function it links to — [stage tag]. Versions read from package.json / tool folders on 19 July 2026.*

---

## LIST 1 — WHAT WE USE TODAY (the complete inventory)

### Runtime & language

1. **Node.js v22.22.0 (portable install, `.tools/node-v22.22.0-win-x64`)** — JavaScript/TypeScript server runtime — executes the API process (`tsx src/server.ts`) and every build/test script — links to: the entire `halqa-api` backend — [FUNCTIONAL]
2. **TypeScript 5.8.3** — statically-typed language compiled by `tsc` — every line of API and web source; `tsc -p`/`tsc -b` typechecks gate every release — links to: all code; money-type safety in ledger/engine paths — [FUNCTIONAL]
3. **tsx** — TypeScript executor with watch mode — runs the dev server (`tsx watch src/server.ts`), the seed script, and the simulations without a compile step — links to: dev loop, `prisma/seed.ts`, `tests/pakistan-2025-sim.ts` — [FUNCTIONAL]

### API framework & HTTP layer

4. **Express 4.22.2** — HTTP routing framework — defines the REST API: `routes/auth.ts`, `committees.ts`, `payments.ts`, `vault.ts`, `exchange.ts`, `schemes.ts`, `risk.ts`, `protection.ts`, `partner.ts`, `profile.ts`, `notifications.ts` — links to: every client-server interaction — [FUNCTIONAL]
5. **cors 2.8.6** — Cross-Origin Resource Sharing middleware — allows the web app on port 4100 to call the API on 4101 and blocks other origins — links to: browser security of every API call — [FUNCTIONAL]
6. **helmet 8.2.0** — security-header middleware — sets HSTS, X-Content-Type-Options, frame protection etc. on every response — links to: baseline web hardening of the whole API — [FUNCTIONAL]
7. **express-rate-limit 8.5.2** — request throttling middleware — caps request rates per IP (login brute-force, spam protection); currently in relaxed demo profile, production profile is a switch — links to: `lib/security.ts` auth protection — [FUNCTIONAL]
8. **socket.io 4.8.3 (server) + socket.io-client 4.8.3 (web)** — WebSocket real-time channel — pushes live events (payment recorded, payout ready, notifications) to connected clients without polling — links to: Halqa Pulse notifications, live committee updates, Rafa reactions — [FUNCTIONAL]

### Data layer

9. **PostgreSQL 17.10 (portable, `.tools/postgresql-17.10`, port 54339)** — ACID relational database — single source of truth for every table: users, committees, memberships, rounds, installments, ledger entries, deposits, schemes, listings, bids, audit rows, notifications — links to: everything persistent — [FUNCTIONAL]
10. **Prisma 5.22.0 (+ @prisma/client 5.22.0)** — ORM and schema manager — `prisma/schema.prisma` declares every model; `db:push` migrates; the generated client gives typed queries and `$transaction` atomicity — links to: every database read/write; the ledger's all-or-nothing money paths — [FUNCTIONAL]
11. **Our double-entry ledger (own code, `lib/audit.ts` `ledger()` + `LedgerEntry` model)** — financial bookkeeping engine — every value movement is one debit+credit row in BigInt paisa with reason, refType/refId, actor, idempotency key; balances are derived, never stored — links to: payments, payouts, fees, deposits, vault, marketplace, Safety Fund — the money core — [FUNCTIONAL]
12. **Our audit trail (own code, `audit()` + `AuditLog` model)** — append-only action log — records every significant non-money action (tier set, allocation set, member banned, listing created) with actor and payload — links to: compliance/forensics across all routes — [FUNCTIONAL]

### Validation, auth, logging

13. **Zod 3.25.76** — runtime schema validation — every route input parsed against a declared schema (amount bounds, enum legality, allocation sums to 100) before any logic runs — links to: every endpoint's first line of defence — [FUNCTIONAL]
14. **jsonwebtoken 9.0.3** — JWT signing/verification — issues short-lived access + longer refresh tokens; `requireAuth` middleware verifies on every protected route — links to: sessions for all users — [FUNCTIONAL]
15. **bcryptjs 3.0.3** — password hashing — one-way salted hashes at registration/login; platform can never read a password — links to: `lib/auth.ts` credentials — [FUNCTIONAL]
16. **pino 10.3.1 + pino-http 11.0.0** — structured JSON logging — request logs and app events with timings, machine-parseable for production observability — links to: every request; ops debugging — [FUNCTIONAL]
17. **dotenv 17.4.2** — environment configuration — loads `DATABASE_URL`, ports, JWT secrets from `.env` so secrets never live in code — links to: all runtime config — [FUNCTIONAL]
18. **node-cron 4.5.0** — in-process scheduler — time-based jobs (due-date nudges/round checks); note the accrual engine deliberately does NOT use it (compute-on-read) — links to: notification scheduling — [FUNCTIONAL]

### Frontend

19. **React 18.3.1 + react-dom** — component UI framework — renders the entire SPA: Shell, Dashboard, Circles, Market, Terminal, Vault, Profile, Create flow, Committee page, Rafa — links to: every screen — [FUNCTIONAL]
20. **Vite 6.4.3 (+ @vitejs/plugin-react 4.3.4)** — build tool & dev server — instant HMR in dev on port 4100; production bundling with code-splitting (lazy pages) — links to: build/deploy of the web app — [FUNCTIONAL]
21. **Tailwind CSS 4.3.2 (+ @tailwindcss/vite)** — utility CSS framework — available alongside our hand-written `index.css` design system — links to: styling layer — [FUNCTIONAL]
22. **recharts 3.9.2** — React charting library — AreaCharts for vault growth projections and the committee Growth tab; the coverage trade-off curve — links to: Vault "Projected growth", PersonalGrowthChart — [FUNCTIONAL]
23. **lucide-react 1.23.0** — icon set — every interface icon (PiggyBank for Vault, Landmark for Terminal, etc.) — links to: navigation and panels app-wide — [FUNCTIONAL]
24. **Capacitor 8.4.1 (@capacitor/core, /cli, /android, /ios)** — native mobile wrapper — `mobile:sync` builds the web app into real Android/iOS shells (`cap open android` produces an installable APK project) — links to: the store-distributable phone app; the PWA + `phone.html` frame are the browser-side siblings — [FUNCTIONAL]
25. **Our i18n layer (own code, `lib/i18n.ts`)** — translation + RTL engine — key-based strings with one-tap English↔Urdu flip and right-to-left layout — links to: Shell nav, first-touch screens — [FUNCTIONAL]
26. **Rafa NLP (own code, `components/rafa-knowledge.ts`)** — retrieval chatbot engine — ~130 curated answers matched via bounded Levenshtein typo tolerance, romanised-Urdu synonym folding, and conversation-context bias — links to: the in-app guide/mascot — [FUNCTIONAL]

### Engines (own code — the crown jewels)

27. **Profit engine (`lib/profit-engine.ts`, `lib/sukoon.ts`, `lib/distribution.ts`)** — yield computation — capital-days accounting, patience weights in exact tenths, early-bird ×1.25, remainder-safe distribution — links to: every engine payout figure — [FUNCTIONAL]
28. **Risk engine (`lib/risk-engine.ts`)** — committee risk scoring — six weighted factors (.22 credit/.18 behaviour/.18 instrument/.16 liquidity/.14 allocation/.12 concentration) → 0-10 score with Low/Med/High bands — links to: create-flow risk mascot, policy recommendations — [FUNCTIONAL]
29. **Settlement engine (`lib/settlement.ts`)** — installment resolution — grace logic, progressive penalties (2/5/10%), score deltas (−10/−20/−40), auto-cover pull from vault — links to: every payment's consequences — [FUNCTIONAL]
30. **Reputation engine (`lib/reputation.ts`) + Credit Passport (`lib/passport.ts`)** — behaviour scoring and verifiable history export — on-time ratios, streaks, exportable repayment record — links to: ordering, gating, the future bureau rail — [FUNCTIONAL]

### Testing & CI

31. **vitest** — unit test runner — engine arithmetic tests including the locked reference outputs (Rs 15,600 bonus etc.) — links to: every engine formula — [FUNCTIONAL]
32. **supertest 7.2.2** — HTTP assertion library — drives the API in-process for endpoint tests — links to: route correctness — [FUNCTIONAL]
33. **fast-check 4.8.0** — property-based testing — generates thousands of random inputs to hunt edge cases in money math (no negative balances, conservation invariants) — links to: ledger/engine robustness — [FUNCTIONAL]
34. **Custom integration harness (`tests/integration.mjs`)** — end-to-end scenario suite — 271 assertions walking real lifecycles (create→join→pay→payout→default→recover) against a live server — links to: whole-system correctness — [FUNCTIONAL]
35. **2025 Pakistan simulation (`tests/pakistan-2025-sim.ts`)** — agent-based model — 120k agents, dual-arm decision-paired randomness, deterministic seed 20250101 — links to: the defensibility of every default/recovery claim — [FUNCTIONAL]
36. **GitHub Actions (`.github/workflows/ci.yml`)** — continuous integration — runs typechecks/tests on every push so regressions can't land silently — links to: all of the above, automatically — [FUNCTIONAL]

### Document & ops tooling

37. **Chrome headless (`--print-to-pdf`)** — HTML→PDF renderer — produces the investor memorandum, pitch book and dossier PDFs from print-CSS HTML — links to: docs pipeline — [FUNCTIONAL]
38. **Portable toolchain (`.tools/` Node + PostgreSQL)** — zero-install environment — the whole stack runs from the project folder on any Windows machine — links to: dev/demo portability — [FUNCTIONAL]

---

## LIST 2 — WHAT WE WILL NEED, EXACTLY (the acquisition register)

### A. Banking & escrow [BANK PARTNER unless noted]

1. **Client-money omnibus escrow account** — trust-status PKR account holding all member funds, bankruptcy-remote from Halqa — opened at the partner Islamic MFB/bank under SBP client-money treatment; title on the account: "<Bank> in trust for Halqa member funds"; our ledger is the sub-register — links to: every collection and payout — [BANK PARTNER]
2. **Virtual IBAN issuance under that escrow** — one virtual PK-format IBAN per committee (Pakistani IBAN = 24 chars: `PK` + 2 check digits + 4-char bank code + 16-digit account number; virtual ranges are a standard corporate-collections product on bank cores) — every circle's members pay to *their circle's own IBAN*; the bank's feed auto-tags inflows by IBAN → our reconciliation maps them to circle sub-ledgers with zero manual matching — links to: collections attribution — [BANK PARTNER]
3. **Investment settlement account** — second physical account for the cash legs of fund purchases/redemptions, so in-flight investment cash never mingles with payout-ready cash — links to: treasury netting engine — [BANK PARTNER]
4. **Charity disbursement account** — third account receiving all penalty flows, outbound only to the designated charity; auditable proof of iltizam bi-tasadduq — links to: settlement engine penalties — [BANK PARTNER]
5. **Halqa operating account** — our own corporate account for fees (`platform:fees` made physical), strictly outside the client-money perimeter — links to: revenue collection — [FUNCTIONAL to open; meaningful at scale]
6. **Bank statement API / feed** — daily (ideally intraday) machine-readable statements — REST/webhook if the core supports it, else standard **MT940/CAMT.053** files — feeds the reconciliation module that diffs bank truth vs ledger truth — links to: daily reconciliation gate — [BANK PARTNER]
7. **Auto-debit / standing-instruction rails** — direct-debit mandates against member accounts for installments — via the partner core's SI module and/or **Raast Request-to-Pay** — links to: `autoDebitMandateRequired` policy flag, on-time-rate uplift — [LICENCE+BANK]

### B. Payment rails [BANK PARTNER / PARTNER]

8. **Raast (SBP)** — Pakistan's instant payment system — specifically: **Raast P2P** for disbursements to member accounts, **Raast Request-to-Pay** for installment collection, **Raast Alias** directory (pay to phone number) — links to: collections + payouts at zero/near-zero fee — [BANK PARTNER]
9. **1Link** — national interbank switch — **IBFT** for payout disbursement to any bank, **1Bill** to present a Halqa installment as a bill payable inside every bank app and at agent counters (OTC cash) — links to: reaching members without our app's rails — [BANK PARTNER]
10. **JazzCash Business API + easypaisa merchant/API** — mobile-wallet collection endpoints (~21M and ~18M MAU respectively) — wallet-to-escrow installment payment for the unbanked segment — links to: collections coverage — [PARTNER]
11. **Pre-bank interim aggregator** — one of **Kuickpay**, **PayFast (APPS)**, or **Safepay** — hosted checkout + collection accounts usable *before* the full bank integration, for early paid pilots — links to: bridging revenue collection — [FUNCTIONAL→PARTNER]

### C. Asset management & investments [LICENCE]

12. **AMC institutional/distribution agreement** — named candidate funds, all Shariah-compliant: **Al Meezan**: Meezan Rozana Amdani Fund (daily-dividend money market — the float sleeve), Meezan Islamic Income Fund (income sleeve), Meezan Gold Fund (gold sleeve); **Alfalah Asset Management**: Alfalah Islamic Rozana Amdani Fund (the Bank Alfalah relationship angle); **NBP Funds**: NBP Islamic Daily Dividend Fund; **UBL Funds**: Al-Ameen Islamic Cash Fund — links to: every engine sleeve and vault tier — [LICENCE]
13. **Fund order + NAV integration** — unit purchase/redemption API or **CDC's Emlaak Financials** platform (the digital multi-AMC fund-distribution rail — one integration, many AMCs) + daily NAV feed (published via **MUFAP**) — links to: treasury order engine, the dated rates the app displays — [LICENCE]
14. **CDC (Central Depository Company) trusteeship visibility** — fund units sit with the fund trustee (typically CDC); we need statement access confirming unit holdings that our per-circle unit registry reconciles against — links to: money-map honesty, audits — [LICENCE]
15. **Distribution trail agreements (~0.5%/yr)** — the contract under which the AMC pays us on placed AUM — links to: revenue line 3 — [LICENCE]

### D. Identity, compliance & credit data [LICENCE]

16. **NADRA Verisys / BioVerisys** — citizen identity verification against the national database (CNIC verification; biometric where required) — upgrade path from our in-app verification levels to bank-grade KYC — links to: member verification, escrow onboarding — [LICENCE]
17. **KYC/AML screening SaaS — Shufti Pro** (Pakistani-founded; alternatives: Sumsub) — document + face verification, sanctions/PEP screening — links to: onboarding compliance at scale — [LICENCE]
18. **eCIB (SBP credit registry)** — mandatory monthly reporting in SBP-prescribed batch record formats once licensed as a reporting institution — our reporting adapter maps ledger events → eCIB layout — links to: Credit Passport becoming a real credit file — [LICENCE]
19. **Private credit bureaus — DataCheck Ltd and Tasdeeq (Aequitas Information Services)** — richer scoring + API inquiry; membership agreements for both reporting and pulling reports during member risk checks — links to: reputation engine enrichment, partner underwriting — [LICENCE]
20. **SECP NBFC licence** — the authorisation for arranging/servicing financial products (NBFC Rules 2003 framework; exact category per counsel — precedent: Oraan's licence SECP/LRD/107/OFSPL/2023) — links to: everything in sections A-C becoming legal — [LICENCE]
21. **Retained Shariah advisor + annual Shariah audit** — a recognised Shariah advisory firm certifying the Mudarabah structures, the fee schedules, the penalty-to-charity flow, and the labelling policy — links to: the halal label being an audited fact, not a claim — [LICENCE]
22. **Statutory auditor** — a QCR-rated firm (candidates: A.F. Ferguson/PwC, KPMG Taseer Hadi, EY Ford Rhodes, Yousuf Adil/Deloitte) — annual audit of both corporate accounts and client-money reconciliation — links to: licence upkeep, partner trust — [LICENCE]

### E. Insurance & protection [PARTNER]

23. **Group credit takaful treaty** — named operator candidates: **Pak-Qatar Family Takaful**, **Salaam Takaful**, **EFU Life Window Takaful**, **Jubilee Family Window Takaful** — covers a member's outstanding committee obligation on death/disability; distributed in-app at a 15-20% channel share — links to: circle protection + revenue line 6 — [PARTNER]
24. **Platform cyber-liability & crime insurance** — covers breach/fraud scenarios on the platform itself — links to: partner due-diligence checkbox — [LICENCE]

### F. Communications [PARTNER]

25. **WhatsApp Business Platform (Cloud API)** via a Business Solution Provider — candidates: **Infobip**, **Gupshup**, **Twilio** — templated installment reminders, invites, receipts inside the app Pakistanis already use — links to: smart-nudge engine reach, host acquisition loop — [PARTNER]
26. **Corporate SMS aggregator** — Jazz/Telenor enterprise SMS or the same BSPs — fallback nudges + OTPs for feature-phone members — links to: notifications, auth — [PARTNER]
27. **Transactional email** — **Amazon SES** or **Resend** — statements, passport exports, receipts — links to: notifications module — [FUNCTIONAL to add]

### G. Production infrastructure [LICENCE for residency]

28. **Pakistan-resident production hosting** — SBP/SECP outsourcing and data-localisation expectations point to in-country or approved hosting: local DCs (e.g., **Jazz Cloud / Systems Ltd**) or cloud regions with regulator sign-off; architecture stays our Docker-able Node+Postgres — links to: the entire deployed platform — [LICENCE]
29. **Managed PostgreSQL with PITR** — production-grade Postgres with point-in-time recovery, encrypted at rest — links to: the ledger's durability — [LICENCE]
30. **Secrets management + KMS/HSM** — **HashiCorp Vault** or cloud KMS for JWT keys, DB credentials, bank API keys — links to: key custody — [LICENCE]
31. **WAF/CDN — Cloudflare** — DDoS protection and edge caching in front of API+web — links to: availability under attack — [LICENCE]
32. **Observability — Sentry (errors) + Grafana/Prometheus (metrics) + pino log shipping** — production eyes on every request and job — links to: ops — [LICENCE]
33. **Penetration test + code audit engagement** — an external security firm's report — a document every bank partner's vendor-risk team will demand — links to: partnership due diligence — [BANK PARTNER prerequisite]

---

*Reading order for tomorrow: List 1 proves the machine exists and is engineered like a bank system (ledger, idempotency, property tests, CI, simulation). List 2 proves we know exactly what we're asking his world for — down to the IBAN format and the fund names, including his own former house's Alfalah Islamic Rozana Amdani Fund.*
