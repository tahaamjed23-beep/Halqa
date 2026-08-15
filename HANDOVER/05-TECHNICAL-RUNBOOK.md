# 05 · TECHNICAL RUNBOOK

Everything needed to build, run, test and deploy. **Read the traps section before
running anything** — several of these cost hours to rediscover.

---

## 1 · Repository layout

Root: `D:\HALQA SIGMA APP` · Git branch `master` · remote
`https://github.com/tahaamjed23-beep/Halqa.git`

```
D:\HALQA SIGMA APP\
├── halqa-api\          Node + Express + TypeScript + Prisma  (port 4101)
├── halqa-web\          React + TypeScript + Vite             (port 4100)
├── docs\               ~75 files — reports, research, specs (see 11)
├── HANDOVER\           this folder
├── ghost-protocols\    00–07 production activation specs; NEVER referenced in
│                       app or investor docs
├── release\            "Halqa Demo Package" — a packaged copy for demos
├── .tools\             portable Node 22 + portable PostgreSQL (see below)
├── .data\              local Postgres cluster + logs
├── .claude\            settings, launch.json
├── .github\            CI
├── Git\ .research-tmp\ gitignored since 28 July
├── START-HALQA.cmd                 one-click local start
├── STOP-HALQA-DATABASE.cmd
├── LOAD-INVESTOR-DEMO.cmd
├── TOGGLE-INVESTOR-BRIEFING.cmd
├── BUILD-PHONE-ANDROID.cmd
├── BUILD-PHONE-APPLE-IOS.txt
├── DEPLOY.md
└── README.md
```

### API source map (`halqa-api/src`)

| Path | Contents |
|---|---|
| `app.ts` `server.ts` `db.ts` `socket.ts` | Express app, boot, Prisma client, socket.io |
| `lib/money.ts` | Integer-paisa BigInt arithmetic, basis-point rates |
| `lib/score-bands.ts` | **The only place band cutoffs live** |
| `lib/forward-liability.ts` | `L(k)` and the early-payout security gate |
| `lib/salary-pattern.ts` | Payday verification engine (see `03` A4) |
| `lib/auto-debit.ts` | `runAutoDebit`, mandate execution |
| `lib/settlement.ts` | `settleContribution` — the core money write |
| `lib/agreements.ts` | Undertaking + mutual PG |
| `lib/passport.ts` | Credit Passport generation and verification |
| `lib/family-links.ts` | Referral/guarantor/shared-device graph |
| `lib/risk-engine.ts` `lib/distribution.ts` `lib/reputation.ts` | Risk, ordering, trust |
| `lib/profit-engine.ts` `lib/sukoon.ts` | Earning engines (dormant) |
| `lib/gap-fund.ts` `lib/discounts.ts` `lib/partner-catalog.ts` `lib/scheme-catalog.ts` | Fill, discounts, partners, schemes |
| `lib/auth.ts` `lib/security.ts` `lib/guards.ts` `lib/audit.ts` | Auth, lockout, gates, audit log |
| `lib/payment-provider.ts` | Rail abstraction incl. title fetch |
| `lib/whatsapp.ts` | `queueWhatsApp` receipts |
| `routes/` | auth, committees, payments, profile, agreements, exchange, risk, vault, protection, schemes, partner, notifications |
| `services/delinquency.ts` | `evaluateDelinquencies` — the real collector |
| `scripts/` | seeders (`seed-investor-demo`, `seed-live-demo`, `seed-demo-day`, `seed-open-circles`, `seed-taha-world`, `wipe-demo`) + `simulate_radical.ts` |

### Web source map (`halqa-web/src`)

Pages: `Home` `Circles` `Committee` `CreateCircle` `Marketplace` `Credit`
`Profile` `Settings` `Vault` `Terminal` `About` `Auth` `Shell`.
Components: `ui.tsx` (incl. `RegisterMark`, `Logo`, `tierLabel`), `PinLock`,
`CnicCapture`, `AgreementGate`, `LinkedAccounts`, `RafaBot` + `rafa-knowledge.ts`,
`RiskConsole`, `ProtectionCenter`, `MemberStatus`, `HostCard`,
`PersonalGrowthChart`, `ProjectionChart`, `PhoneInput`, `ErrorBoundary`,
`LegalFooter`.
Lib: `api.ts`, `config.ts` (feature flags), `lib/i18n.ts`, `lib/webauthn.ts`,
`lib/events.ts`, `legal/content.ts`.

### Prisma models (34) and enums (22)

Core: `User` `Committee` `CommitteeMember` `CommitteeWaitlist` `Round` `Payment`
`LedgerEntry` · Money/risk: `SecurityDeposit` `ProtectionCommitment`
`PayoutHoldback` `RecoveryCase` `RiskAssessment` `RiskConsent` `Investment`
`Scheme` · Market: `ExchangeListing` `ExchangeBid` · Credit: `CreditEvent`
`KycRecord` `AgreementSignature` · Payday: `PaymentAttempt` `SalarySignal`
`PayslipUpload` · Comms: `ChatMessage` `ChatRead` `Notification` · Ops:
`AuditLog` `SecurityEvent` `RefreshToken` `ScheduleChangeRequest` `PartnerBank`
`StatementBatch` `StatementLine`.

---

## 2 · Toolchain — the portable stack

**There is no reliable system toolchain. Use these paths.**

```
Portable Node 22:  D:\HALQA SIGMA APP\.tools\node-v22.22.0-win-x64\node.exe
System Node:       C:\Program Files\nodejs  (v26.3.0, npm 11.16.0)
Postgres 18.4:     D:\HALQA SIGMA APP\.tools\postgresql-18.4-embedded\bin
Postgres 17.10:    D:\HALQA SIGMA APP\.tools\postgresql-17.10\pgsql\bin  (psql only)
```

### ⚠️ TRAP 1 — `npx` runs the wrong TypeScript

`npx tsc` downloads and runs an unrelated `tsc@2.0.4` package and prints *"This is
not the tsc command you are looking for."* **Always call local binaries:**

```powershell
# API typecheck
node .\node_modules\typescript\bin\tsc -p tsconfig.json --noEmit
# Web typecheck
node .\node_modules\typescript\bin\tsc -b
# Tests
node .\node_modules\vitest\vitest.mjs run
# Prisma
node .\node_modules\prisma\build\index.js db push
# tsx
node .\node_modules\tsx\dist\cli.mjs prisma\seed.ts
```

### ⚠️ TRAP 2 — the portable Node's npm is gutted

The old laptop's disk-space purge stripped it. **Use system npm** at
`C:\Program Files\nodejs\npm.cmd`.

### ⚠️ TRAP 3 — PowerShell `Get-Content -Raw` corrupts UTF-8

Windows PowerShell 5.1 reads BOM-less files as ANSI/CP1252. Round-tripping a
UTF-8 file through `Get-Content -Raw` + `WriteAllText` **double-encodes every
non-ASCII character** (— becomes â€"). This happened on 9 August and had to be
repaired.

**Always use** `[System.IO.File]::ReadAllText($path)` and
`[System.IO.File]::WriteAllText($path, $s, (New-Object System.Text.UTF8Encoding($false)))`.

To repair existing damage: encode with CP1252, decode as UTF-8.

### ⚠️ TRAP 4 — PowerShell has no `&&`

This is Windows PowerShell 5.1. Use `A; if ($?) { B }`.

---

## 3 · Running locally

### Start Postgres (does NOT survive a reboot — start it every session)

```powershell
.\.tools\postgresql-18.4-embedded\bin\pg_ctl.exe -D .data\postgres -l .data\pg-new.log start
```

**Port 54339.** Credentials in `halqa-api\.env`.

⚠️ The 17.10 binaries **cannot manage an 18 cluster** — use the 18.4 `pg_ctl`.
⚠️ If Postgres fails with "could not create listen socket", check the Windows
excluded port ranges (`netsh interface ipv4 show excludedportrange protocol=tcp`)
— a restart once moved the old port 54329 inside a winnat exclusion.

### Start the API (port 4101)

```powershell
cd halqa-api
node ..\.tools\node-v22.22.0-win-x64\node.exe .\node_modules\tsx\dist\cli.mjs src/server.ts
```

Boot runs `syncSchemeCatalog`, `syncPartnerCatalog` and the hourly delinquency cron.

⚠️ **Restarting on Windows:** `pkill -f tsx` misses it. Find the PID with
`Get-NetTCPConnection -LocalPort 4101` or `netstat -ano | findstr :4101`, then
`taskkill /F /PID <pid>`. Kills can race a new spawn (EADDRINUSE) — re-check the
port before starting.

### Start the web app (port 4100)

Use the preview tooling with `.claude/launch.json` (`halqa-web`, Vite, ~12 s cold
start). **Never run dev servers via a plain shell call.**

⚠️ **Vite binds to IPv6 `localhost` only** — `http://127.0.0.1:4100` refuses
connection. Use `http://localhost:4100`.

### Database schema

```powershell
node .\node_modules\prisma\build\index.js db push     # local only — NO migrations folder
node .\node_modules\tsx\dist\cli.mjs prisma\seed.ts   # seed
```

⚠️ `prisma generate` fails with EPERM if the API is running (DLL lock). Kill the
API first.

---

## 4 · Tests

```powershell
# Unit — 60 tests, no DB needed
cd halqa-api
node .\node_modules\vitest\vitest.mjs run

# Integration — 352 lifecycle checks; needs DB + API on 4101
node ..\.tools\node-v22.22.0-win-x64\node.exe tests\integration.mjs
```

**Suite counts as of 31 July 2026: 60 unit / 352 integration, all green.**

Unit tests: `money` `score-bands` `forward-liability` `agreements`
`risk-and-distribution` `salary-pattern` `sukoon` `sigma-max-bonus` `pakistan-sim`.

Integration covers the full lifecycle end to end — creation, joining, locking,
payment on every rail, payout release, late-fee ladder, vault auto-cover,
marketplace trades — plus adversarial cases: account lockout, token replay, SQL
injection, weak passwords. It is **re-run safe**: resets bilal's score, cancels
stale test circles by name prefix, clears sana's bank KYC, purges the vault
ledger, and signs the weekly undertaking for sana/ayesha/bilal.

### ⚠️ Known flakes — do NOT report these as broken

1. **`pakistan-sim.test.ts` "contribution burden"** flakes on a 5 s timeout on a
   cold JIT. It is a perf flake, not a logic failure — passes in 2.6 s once warm,
   or with `--testTimeout=120000`.
2. **Fresh-seed vault-cover failure.** The seed leaves bilal's round-1 installment
   in "Islamabad Builders Circle" already overdue. On the FIRST harness run his
   global `vaultAutoCover` flag drains the 2.5M vault into that seed payment
   (unordered `findMany` in `delinquency.ts` picks it first on PG18) and the
   vault-cover check fails. **Fix: settle that payment first, or simply run the
   harness twice — it self-heals.**

### Simulations

- `tests/monte-carlo.ts`, `tests/pakistan-2025-sim.ts` — a **120,000-agent
  agent-based model** on the real 2025 calendar. Defaults 2.48% → 0.99%. Report:
  `docs/SIMULATION-2025-REPORT.md`.
- These produce the **0.3–1.4% default band**. **They are models, not
  measurements**, and must be labelled as such wherever quoted.

### Demo accounts

`taha` / `ahmed` / `sana` / `ayesha` / `bilal`, password `halqa123`.
Wider population: `node tests/seed-demo.mjs` (12 users, passwords
`<first>1234`, roster in `docs/DEMO-ACCOUNTS.md`).
`SECURITY_RELAXED=true` in `.env` disables lockout/password/replay checks; the
suite auto-detects and skips those.

---

## 5 · Production

**Live since 20 July 2026** under the chairman's Vercel account (`tahaamjed23-3267`,
team `taha-s-project`).

| Piece | Detail |
|---|---|
| **Web** | https://halqa-seven.vercel.app — Vercel project `halqa`, root `halqa-web`, env `VITE_API_URL` |
| **API** | https://halqa-api-delta.vercel.app — project `halqa-api`, root `halqa-api`, serverless entry `api/index.ts`, **pinned to region `sin1`** |
| **DB** | Supabase `lvxvncbflhlzsmvhgphq` (Singapore). Transaction pooler **6543** + `pgbouncer=true` for serverless; session pooler **5432** for local psql |
| **Cron** | Vercel Cron daily 02:00 UTC → `GET /api/cron/delinquency` with a `CRON_SECRET` bearer. node-cron does not run serverless |
| **Sockets** | socket.io is **dead on serverless by design**; the UI shows a down banner |

⚠️ **`halqa-api.vercel.app` belongs to a STRANGER (402). Never use it.**

Prod env vars (encrypted in Vercel): `DATABASE_URL` `JWT_SECRET`
`JWT_REFRESH_SECRET` `NODE_ENV` `WEB_ORIGIN` `CRON_SECRET`. Local staging copies
live in gitignored `halqa-api/.env.*`.

### Deploy

```powershell
npx vercel@latest deploy --prod --yes    # from each package dir
```

- Build needs `npm install --include=dev` (NODE_ENV=production skips types
  otherwise) and `npx prisma generate`.
- Schema has the `rhel-openssl-3.0.x` binary target.
- If C: is tight, set `npm_config_cache` to a D: path.

### ⚠️ TRAP 5 — the serverless connection-pool bug (fixed, but know it)

Prisma's default pool of 5 per function instance exhausted Supabase's pgbouncer
under load → **P2024 "Timed out fetching a connection"** → 30 s function timeouts
→ the app showed "Failed to fetch" and Start/Bid/List/passport all silently
failed.

**Fix in `src/db.ts`:** append `connection_limit=1&pool_timeout=20` to
`DATABASE_URL` **at runtime** (never read or rewrite the secret). If mystery
timeouts return, check this first.

### ⚠️ TRAP 6 — production migrations

**NEVER blind `prisma db push` against production.** Write an **additive-only**
hand-written SQL file (pattern: `prisma/additive-YYYY-MM-DD-name.sql`) and apply
it with the portable psql on the **session pooler**.

Existing migration files:
```
additive-2026-07-21-agreements.sql
additive-2026-07-22-signup-security.sql
additive-2026-07-23-home-location.sql
additive-2026-07-23-locality-jobtitle.sql        ← PENDING
additive-2026-07-23-tenure-verification.sql
additive-2026-07-31-salary-verification.sql      ← PENDING
```

⚠️ **psql URL quirk:** `halqa-api/.env.dburl` is a **bare URL** carrying
`?pgbouncer=true`, which psql rejects with *"invalid URI query parameter"*. Strip
everything after `?` **and** rewrite `:6543` → `:5432`. Never `source` the file —
it executes/echoes.

### Other production notes

- The login field is **`identity`**, not `username` or `identifier`
  (`POST /api/auth/login`).
- Perf: pinning the API function to `sin1` (co-located with the Singapore
  Supabase DB) took discovery from ~10 s to sub-second.
- `transactionOptions {maxWait: 10s, timeout: 25s}` fixes P2028 on circle start
  over the pooler.

---

## 6 · Current repository state

**Branch `master`. Four commits ahead of `origin/master`, unpushed:**

```
6052124  Salary-day verification: payday pull, pattern engine, title fetch, payslip
8025fc6  Three master reports: investor/SECP, A-level explainer, meetings+findings
988f950  Model-direction + research log from Akif meeting 2 (cited)
13d5687  Signup: broad locality + public job; housewife husband-job; required e-sign
```

**Uncommitted working-tree changes** (the brand implementation of 2 August):
`halqa-web/index.html`, `public/favicon.svg`, `public/manifest.webmanifest`,
`src/App.tsx`, `src/components/ui.tsx`, `src/index.css`, plus
`.claude/settings.local.json`. Several deletions of stray artefacts. All the new
`docs/*` files from the August research are untracked.

### 🔴 THE LANDMINE — read before any push or deploy

Commit `13d5687` added two nullable columns to `schema.prisma` — `User.locality`
and `User.jobTitle` — **and no additive SQL file was ever written for them.** A
production `information_schema` query on 28 July returned only `homeLat` and
`occupationType`; **`locality` and `jobTitle` do not exist in production.**

Code that breaks the moment this deploys:
- `src/lib/reputation.ts:6` — an explicit Prisma `select` naming both columns, so
  the host trust card, member profiles and the Credit Passport all break.
- `src/routes/auth.ts:95,98` — register writes both, so **signup breaks**.

**Production is safe only because the commit was never shipped.** The SQL file
`additive-2026-07-23-locality-jobtitle.sql` has since been written. **Apply BOTH
pending migrations to production BEFORE the next push or deploy.**

---

## 7 · Migration history (previous machine)

The project was migrated from laptop `DESTROYER` (user `pc`) to this machine (user
`admin`) in late July 2026. Same path `D:\HALQA SIGMA APP`, so no path edits were
needed.

- **Migration bundle:** `D:\ClaudeCode_Full_Migration_2026-07-26_024908` (1.16 GB,
  14 folders, created at commit `988f950`). Contains `PROJECT\` with **plaintext
  `.env` files** plus `SECRETS_ENCRYPTED\PROJECT_SECRETS_ENCRYPTED.aes`. The
  working copy is now *ahead* of the bundle — it is a stale backup whose only
  unique assets are the encrypted secrets blob and the Claude session history.
- **Claude memory was NOT restored by the migration script** — 19 files were
  hand-copied from `CLAUDE_PROJECT_STATE\C_claude_projects\D--HALQA-SIGMA-APP\memory`
  into `C:\Users\admin\.claude\projects\D--HALQA-SIGMA-APP\memory` on 28 July.
- **The local database was REBUILT on 28 July.** The migrated cluster was corrupt
  beyond repair — `base/1,4,5` were empty **in the bundle too**, gutted on the old
  laptop, probably by its disk-space purge. The same purge stripped `initdb` and
  `pg_dump` from `.tools\postgresql-17.10` and gutted the portable Node's npm. The
  old data directory is kept at `.data\postgres-corrupt-2026-07-28` and is safe to
  delete.
- The replacement cluster is **PostgreSQL 18.4** from the `embedded-postgres` npm
  package, persisted to `.tools\postgresql-18.4-embedded\bin`.

---

## 8 · Formula reference

From `docs/HALQA-TECHNICAL-COMPENDIUM.md`. **Verify against current code before
citing line numbers.**

```
Forward liability      L(k) = c × (n − k)

Patience tenths        10 + round(10(k−1)/(n−1))
Early-bird             ×1.25 if ≥75% of payments land ≥3 days early
Grace (internal)       clamp(round(0.23 × period), 2, 14) − 2
Penalties              2% / 5% / 10%   score −10 / −20 / −40
Post-payout default    score −200
Marketplace premium    ≤ 50% of payout; Halqa fee = premium / 10
Float factor           (lead + 7) / (period + 7)
  halal tiers          × (0.75 + 0.25 × f)
  fee tiers            × (0.9 + 0.1 × f)
Risk weights           .22 / .18 / .18 / .16 / .14 / .12
Deposit (dormant)      remainingDues × clamp(coverageBase × (n−k)/(n−1)
                       + clamp((700 − score) × 10, −1000, +1500), 0,
                       base + 500 ≤ 9500) / 10⁴
Sigma pooled max       Rs 15,639 at 70% coverage (12-women reference),
                       locked in tests/sigma-max-bonus.test.ts
```

TASDEEQ mapping: their **200–600** scale maps linearly onto Halqa's **300–850**;
our 550/650/750 cutoffs sit at roughly TASDEEQ 382/455/527.

---

## 9 · Document rendering pipeline

All PDFs in `docs/` are produced by rendering HTML with headless Chrome:

```powershell
$chrome="C:\Program Files\Google\Chrome\Application\chrome.exe"
$uri="file:///" + ($src -replace '\\','/' -replace ' ','%20')
Start-Process -FilePath $chrome -ArgumentList "--headless=new","--disable-gpu",
  "--no-sandbox","--no-pdf-header-footer","--print-to-pdf=`"$out`"",$uri `
  -PassThru -Wait -WindowStyle Hidden
```

⚠️ Plain `--headless` sometimes silently fails to write the file. **Use
`--headless=new` with `Start-Process -Wait`.**

Page count check: read the PDF bytes as Latin-1 and count `/Type /Page[^s]`.

Also available: `docs/build-reports-pdf.mjs` (older markdown → PDF pipeline).

**PowerPoint is installed** at
`C:\Program Files\Microsoft Office\root\Office16\POWERPNT.EXE` — usable for
PPTX→PDF export via COM. **LibreOffice is NOT installed.** `pptxgenjs` and `sharp`
are **not installed** and an npm install of `pptxgenjs` failed on 9 August
(undiagnosed — the user interrupted). Python 3.14.6 is available.

---

## 10 · Environment summary

| Item | Value |
|---|---|
| OS | Windows 11 Pro 10.0.26200 |
| Shell | Windows PowerShell 5.1 (no `&&`, no ternary) |
| User | `admin` |
| Chrome | `C:\Program Files\Google\Chrome\Application\chrome.exe` |
| Local API | 4101 · Local web | 4100 · Local PG | 54339 |

Yes boss
