# 10 · CURRENT STATE AND NEXT ACTIONS

**As of 9 August 2026.** Read this second, after `00`.

---

## 1 · Where the project actually is

| Dimension | State |
|---|---|
| **Product** | Live in production since 20 July 2026, **deliberately not opened to the public**. One real member. |
| **Code** | Both packages type-clean. **60/60 unit, 352/352 integration** passing (verified 31 July). |
| **Money** | **No real money has ever moved.** Every payment path is sandbox-settled. Blocked on a merchant agreement. |
| **Company** | **Does not exist.** No SECP registration, no FBR NTN. This blocks everything downstream. |
| **Brand** | v2 pine/gold implemented in the app, **uncommitted**, auth screen visually verified, interior not. |
| **Documents** | Current report set complete (see `11`). |
| **Regulator** | Mentored by the sitting SECP Chairman. No formal engagement yet. |

**The honest one-line summary:** the engineering is far ahead of the business.
Nothing on the critical path to real money is a coding problem.

---

## 2 · 🔴 BLOCKING — must happen before any push or deploy

### 2.1 · Apply BOTH pending production migrations

```
halqa-api/prisma/additive-2026-07-23-locality-jobtitle.sql
halqa-api/prisma/additive-2026-07-31-salary-verification.sql
```

**Why this is critical:** commit `13d5687` added `User.locality` and
`User.jobTitle` to the schema **with no migration**. Production does not have those
columns. The moment that commit deploys:

- `src/lib/reputation.ts:6` — an explicit Prisma `select` names both columns →
  **the host trust card, member profiles and the Credit Passport all break**
- `src/routes/auth.ts:95,98` — register writes both → **signup breaks**

Production is safe **only because the commit was never shipped.**

**Apply with the portable psql on the session pooler.** Remember the URL quirk:
`.env.dburl` carries `?pgbouncer=true` which psql rejects — strip everything after
`?` **and** rewrite `:6543` → `:5432`. Never `source` the file.

**The chairman applies these himself.** Do not do it for him.

### 2.2 · Push the four unpushed commits

```
6052124  Salary-day verification: payday pull, pattern engine, title fetch, payslip
8025fc6  Three master reports: investor/SECP, A-level explainer, meetings+findings
988f950  Model-direction + research log from Akif meeting 2 (cited)
13d5687  Signup: broad locality + public job; housewife husband-job; required e-sign
```

**Migrations first, then push.** Plus the uncommitted brand work and the August
docs, which are untracked.

---

## 3 · Immediate next actions, in order

### 3.1 · Gate 1 — make Halqa a company (~Rs 20–30k, two weeks)

SECP private limited via eservices.secp.gov.pk → FBR NTN → provincial sales tax →
corporate operating account → trademark filing.

**Nothing else in the business can proceed without this.** The payment aggregator
contracts with a registered company holding a tax number.

### 3.2 · Gate 2 — turn on real money (Rs 80,000–180,000, 4–8 weeks)

Merchant Services Agreement with PayFast or Safepay (**a commercial contract, not a
licence**) → WhatsApp Business Cloud API → counsel opinion + review of the
undertaking and PG → NADRA Verisys when worth it.

**This is the single most important milestone in the company.** Until it lands, the
ledger records assertions rather than settlements, and the entire credit-data
thesis is unproven.

### 3.3 · Answer the outstanding design questions

These are waiting on the chairman and block clean specification:

1. **Circle authenticity v3** — the paired-declaration design (`03` C1i). Presented
   9 August, **not yet approved.**
2. **The balance-sheet default-cover tension** — Akif says cover defaults and
   insure with takaful; the competitor archive says platform guarantee is what
   killed eMoneyPool. **Never put back to him for a ruling.**
3. **The organizer guarantee** — the traditional host covers a defaulter from his
   own pocket, and Kamran's informants cite that as their main reason for feeling
   safe. Removing custody removed it. Either reproduce it or state plainly that
   seat arithmetic replaces it. **Both defensible; silence is not.**
4. **Proposed numbers awaiting sign-off:** exit fine at one installment with a
   70/30 split · the 33% affordability cap · Tier 1 ceilings (Rs 25,000/month,
   Rs 300,000 pot).

### 3.4 · Build the Discipline Layer

Order matters — see `03` C1:
1. `CONFIRMING` state + 24-hour window (smallest change, largest legal return)
2. Affordability engine + headroom display
3. Exit ladder + restitution engine + group vote
4. Hardship path and helpline
5. NADRA face match (**start the Nishan portal paperwork in parallel** — it is the
   long pole)
6. Circle authenticity last

### 3.5 · Build the abuse-detection layer — before opening to the public

**From the strategy pre-mortem, and currently unmanaged.**

Halqa's core product is **manufactured, verifiable credibility** — which is exactly
what a fraudster needs most, and we hand it over free. The scenario: someone runs
three clean circles, reaches Sakh 780, shows the app to twenty people as proof of
trustworthiness, then runs a large committee **off** the platform in cash and
disappears. Headline: *"App used to defraud savers."*

Every large Pakistani committee fraud ran on borrowed credibility.

**Concretely:** cap concurrent circles per organizer · flag implausible growth ·
watch member concentration across a host's circles · **scope the Credit Passport
explicitly to on-platform history**, endorsing no outside arrangement.

Cheap to build, and it protects the one asset that cannot be rebuilt.

### 3.6 · Approach SECP as the first clean actor

While Akif is mentoring and before regulation arrives. Seek the sandbox. Get the
model clause into the first consultation paper. See `08` section 6.

### 3.7 · Field sales to existing offline organizers

The highest-return growth motion available and the one competitors will not run.
Every case in the archive that scaled did it through agents. See `06`.

---

## 4 · Operational and security open items

| Priority | Item |
|---|---|
| **HIGH** | **Wipe demo seed data from production** (taha/halqa123 etc.) before real users |
| **HIGH** | **DB password exposed in chat and NOT rotated** — chairman said "forget it", on record. **Do not act; flag it.** |
| **HIGH** | Abuse detection for credibility-by-proxy (3.5 above) |
| **MEDIUM** | Move the application off the master database role to a **least-privilege role** |
| **MEDIUM** | Add a **second factor** for admin access |
| **MEDIUM** | **Alerting** on error rates and failed-login bursts |
| **MEDIUM** | Retain counsel — the undertaking and PG are unreviewed drafts |
| **LOW** | External penetration test when a counterparty requires one |
| **LOW** | Update the `dist/` and Android mirrors of `favicon.svg` / `icons.svg` |
| **LOW** | Visually verify the rebranded **logged-in** interior (only the auth screen was checked) |

---

## 5 · Work that was in flight when this handover was written

### 5.1 · Google Slides decks — REQUESTED, NOT DELIVERED

The chairman asked for two presentations: **a Halqa pitch deck** with all the new
features in the established style, and **an explainer deck** for himself, both
detailed with implementation guidance, new logos, new ideas and new directions.

**Status: blocked and unstarted.** `pptxgenjs` failed to install from the npm
registry (undiagnosed — he interrupted to redirect). `sharp` is also absent.

**Route when resuming:** produce `.pptx` files, which Google Slides imports
natively. Options are (a) diagnose the npm failure, (b) use **python-pptx**
(Python 3.14.6 is present), or (c) build the OOXML directly.
**PowerPoint IS installed** at `C:\Program Files\Microsoft Office\root\Office16\POWERPNT.EXE`,
so PPTX → PDF → images for visual QA is possible via COM. **LibreOffice is not
installed.**

For the logo on slides: no `sharp`, so either rasterise the Register SVG via
headless Chrome (which works reliably here) or draw it with slide line shapes.

### 5.2 · Documents completed in this session

`HALQA-COMMITTEE-DOSSIER-2026-08-06.pdf` (16 pp) ·
`HALQA-DISCIPLINE-LAYER-2026-08-09.pdf` (16 pp) ·
`HALQA-ATTEMPTS-ARCHIVE-2026-08-09.pdf` (21 pp). See `11`.

---

## 6 · The five numbers that tell you whether this is working

When real money starts moving, these are the metrics that matter — and most of the
industry's conventional metrics are wrong for this business (see `07`, atomic
networks).

1. **Share of installments digitally settled** — the health of the collection rung,
   and **the single most important number in the company.** A ledger of assertions
   is worth nothing.
2. **Circles completed clean** — the atomic unit of value. Signups are vanity.
3. **Circles per organizer** — whether the growth loop compounds or leaks.
4. **Measured post-payout default in the first 100 completed circles** — the moment
   0.3–1.4% stops being a model and becomes a fact.
5. **Member-to-organizer conversion** — the only endogenous growth loop.

---

## 7 · The ladder — why the order cannot be changed

Each rung is only reachable because the one below it exists. Attempting them out of
order is the most common way companies in this category waste a year.

| Rung | Unlocks | Gate |
|---|---|---|
| **1 · Collection** | Settlement, not assertion. Without it there is no credible record, therefore no data asset, no bureau link, and no business. | Gate-2 merchant agreement |
| **2 · The record** | Verified repayment at volume — the raw material for everything above. | Circles **completed**, not signups |
| **3 · The bureau link** | The record becomes a formal credit signal; the member gains real benefit; we gain monopoly-supplier status. | TASDEEQ contributor agreement |
| **4 · Commerce and the on-ramp** | Merchants and institutions pay for access to outcomes. **This is where the revenue actually is.** | Referral and merchant partnerships |
| **5 · The savings layer** | Vault and Float via CDC trusteeship — yield, plus a pledged buffer that self-cures default. | SECP distributor registration |

---

## 8 · The pre-mortem — it is 2029 and Halqa failed. What happened?

| Cause | Mechanism, and the early-warning signal |
|---|---|
| **Collection never became real** | Raast pull-payments slipped; card-on-file too narrow for a cash-native base; wallet MDR failed the Rs 300 ceiling. Members went back to cash and the ledger recorded assertions. **Watch:** share of installments settled digitally. |
| **An organizer ran a Ponzi using our credibility** | Built a clean record on Halqa, showed the app as proof, ran a large offline scheme. **Currently unmanaged — see 3.5.** **Watch:** organizers running many simultaneous circles, unusual member concentration, implausible growth. |
| **The wallets shipped it** | Distribution beat product. **Watch:** any committee feature in a JazzCash or Easypaisa release note. |
| **Regulatory reclassification** | A high-profile committee fraud (not ours) triggered rules written for custody operators with no carve-out for record-only facilitators. **Watch:** consultation papers. |
| **We scaled before the loss model was real** | 0.3–1.4% stayed modelled, never measured; real losses landed outside the band; the guarantee promise broke. **Watch:** measured default in the first hundred completed circles. |
| **The founder ran out of runway doing everything** | The most common cause. Product, regulation, partnerships, research and brand all run through one 17-year-old's attention. |

---

## 9 · If you can only do five things

1. **Apply the two migrations, then push.** Everything is blocked behind a working
   production.
2. **Gate 1 and Gate 2.** Collection is rung one; nothing above it exists until the
   merchant agreement is signed.
3. **Build abuse detection** before opening to the public, not after the first
   incident.
4. **Approach SECP voluntarily** while the door is open and the mentor is engaged.
5. **Start field sales to existing offline organizers** — the highest-return growth
   motion, and the one every competitor will skip.

Yes boss
