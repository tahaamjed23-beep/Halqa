# HALQA — Full Project Report
*Compiled 21 July 2026. Every technical claim below reflects the live codebase and was re-verified against the running production system on this date. Figures that are estimates are marked as such; figures that are measured are marked verified.*

Live web: **https://halqa-seven.vercel.app** · Live API: **https://halqa-api-delta.vercel.app**
Test state: **299 automated integration assertions passing**, both packages type-clean, both builds clean.

---

## 0. What Halqa is, in one paragraph

Halqa is digital infrastructure for the Pakistani committee (kameti / ROSCA) — a rotating savings circle where a group contributes a fixed amount each round and one member collects the whole pool each round until everyone has had a turn. Halqa does not replace the committee; it records it, schedules it, enforces it, and gives each member a portable proof of reliability. Critically, **Halqa never holds member money** — contributions move directly between members over Pakistan's own payment rails, and Halqa keeps the ledger. That single design choice (record-keeper, not fund-holder) is what keeps Halqa a software company rather than a licensed financial institution at this stage.

---

## 1. How we work (the mechanics)

**The lifecycle of a circle, precisely:**

1. **Create.** A host (reliability score ≥ 700, identity on file) sets the name, member cap, contribution per round, period in days, a minimum-to-start floor, and an optional goal (Hajj, education, wedding, home, business). Options: a turn-order adjustment (early turns pay a small declining fee that flows to later turns), and "let Halqa fill empty seats."

2. **Form.** Members join by invite code (one-tap WhatsApp share) up to the cap. While forming, **anyone can join and anyone can leave** — no money has moved, nothing is locked. The minimum-to-start is simply the floor below which the host cannot press Start.

3. **Start (the lock).** In one database transaction: turn order is computed and frozen, all rounds are created, round 1's installments are generated as PENDING, and status flips to ACTIVE. **From this instant, no new member can join** ("Committee has already started"). This is deliberate — it makes turn order non-arguable and protects everyone who committed early.

4. **Run.** Each round, members pay their installment (one-tap through a payment rail, or a recorded reference for cash/bank). When everyone has paid, the host releases the payout to that round's recipient and the circle advances. Late payers are handled by the enforcement stack (Section 3).

5. **Complete.** After the last round, everyone has contributed equally and everyone has collected once. Clean completions raise reliability scores.

**Turn order is earned, not random.** In credit-weighted mode, members are ranked: identity-verified (CNIC on file) ahead of unverified, then by reliability score, then by join time. An unproven newcomer is automatically slotted late — meaning they pay every installment *before* they ever collect, so their maximum possible damage to the circle is zero rupees. Position is the collateral.

**Halqa's own seats (opt-in).** If a host enables "let Halqa fill empty seats," Halqa contributes into the unfilled positions so the circle starts full. Halqa's seats take the *first* turns (the host's choice, to minimise Halqa's own capital exposure): Halqa collects early and auto-pays its share into every subsequent round, so the real members holding later turns are still paid on schedule. These circles carry a higher management fee, disclosed before the host confirms.

---

## 2. Our functions (what's live)

**Member-facing, live on the internet today:**
- Multi-step signup (phone → name → email → CNIC → password → review) with an international phone selector (🇵🇰 +92 default, 51 countries, searchable) and terms accepted with a recorded timestamp
- Create / join / pay / collect / chat across a circle's full lifecycle
- Goal circles (Hajj, education, wedding, home, business) with named goals
- Gateway-style checkout: order summary, branded rail cards (Raast, JazzCash, Easypaisa, bank, cash), processing state, success receipt, and an explicit failure ("Oops / Try again") screen that leaves the installment untouched
- Linked payment methods (Raast ID / wallet / IBAN), saved once, masked at rest, reused at checkout and for auto-pay
- Auto-pay: a per-circle standing mandate that collects the installment automatically on the due date
- Turn marketplace: list a future turn at a premium; other members (or outside buyers) bid; seller accepts
- Credit Passport: a signed, shareable proof of committee history that a landlord/employer/lender can verify with no Halqa account
- Credit report page: score gauge and band, 12-installment history, score-movement chart, factor breakdown
- Settings hub: sign-in & security, account preferences, data privacy, advertising, notifications, payments (linked methods), legal, help
- Six-document legal corpus accepted at signup; About page (mission, kameti context, numbers)
- Urdu + English, rotating regional greetings, gold-and-white theme, mobile-first, PWA meta

**Business engine, live:**
- Late fees (2% / 5% / 10% by lateness tier) — platform revenue
- Consent-gated goal-intent lead feed (the data-monetisation pipe)
- Turn-marketplace service margin
- Halqa-fill management fee

**Parked behind one feature flag (returns at the licensed stage, nothing deleted):**
- The eleven earning engines / four-sleeve Vault / scheme Terminal / escrow treasury / bank-custody rail

---

## 3. Default-prevention system (the machine)

The core problem a committee platform must solve: a member collects their payout, then stops paying. Halqa runs a seven-layer defence, all live:

1. **Identity is the entry ticket.** Signup records name, phone, email, and CNIC. Every obligation is tied to a government identity; a username can be abandoned, a CNIC cannot.
2. **Position is the collateral.** Verified-first, score-weighted turn ordering slots unproven members last — they pay in full before they can collect, so their maximum damage is zero. (Money Fellows' #1 real-world tool, built the no-deposit way.)
3. **The payment can't be dodged quietly.** Locked schedules, reminders, and a hidden internal grace window (≈23% of the period, never disclosed) so an honest one-day slip doesn't nuke anyone.
4. **Progressive late fees.** 2% / 5% / 10% of the installment by lateness tier — platform revenue and deterrent — plus score deltas of −10 / −20 / −40.
5. **Payout holdback.** A member behind on payments cannot collect a payout. No paying-yourself-with-the-group's-money.
6. **Default consequences.** Post-payout default = feature lock (no joining, hosting, or marketplace), a public flag, and a recovery case (outstanding + penalties + 10% rehabilitation fee). Every record is CNIC-linked, timestamped, court-usable evidence — the exact thing informal committees never have.
7. **Circle-level and platform protections.** Optional guarantor for early turns (guarantor's own score is at risk), host reputation (public and permanent), fund-the-gap (kills desperate-stranger admissions), and auto-pay (the installment collects itself). Rehabilitation exists (clear the case → cooldown) so defaulters re-enter rather than vanish.

**The one piece still gated:** real card/wallet auto-debit execution (the mandate is captured in-app today; live execution needs the merchant account in Section 8). That is the last ~15% of Money Fellows' machine.

---

## 4. Credit system

- **Reliability score.** Every account starts at 700. On-time payments, clean completions, and streaks raise it; late/missed installments and post-payout defaults lower it (−10 to −200 by severity). The score gates hosting (≥700), early turn positions, and marketplace bidding (≥650).
- **Identity ladder (kycLevel).** 0 = nothing on file · 1 = CNIC recorded (unlocks hosting) · 2 = bank-verified (unlocks bank-custody circles). A CNIC-bearing signup starts at Level 1.
- **Host reputation.** A public, permanent track-record card (circles run, completion rate, member ratings) shown before anyone joins.
- **Credit events ledger.** Every score change is an immutable, reasoned, timestamped record — the raw material of a real bureau.
- **Credit Passport.** A member can export a cryptographically signed summary (clean completions, on-time %, total recorded, expiry) as a link that any third party verifies with no Halqa account. This is Halqa's bridge to formal credit for the ~100M Pakistanis with committee discipline but no bank footprint.

---

## 5. Computer-science / engineering stack

- **Frontend:** React + TypeScript, Vite build, code-split lazy routes, PWA, client-side list caching for instant paint on serverless cold starts. Strict TypeScript, zero `any` leaks in the type-check gate.
- **Backend:** Node + Express + TypeScript, Prisma ORM over PostgreSQL. Deployed as Vercel serverless functions; the Express app is cleanly separated from the long-lived server (socket chat + cron), so the same code runs both ways.
- **Database:** PostgreSQL on Supabase (Singapore), reached through the transaction pooler (`pgbouncer`) for serverless; Prisma transaction budget raised to 25s for the multi-write start/advance transactions over the cross-region pooler.
- **Money correctness:** every amount is stored and computed in **paisa as BigInt** — no floating-point currency anywhere. All money movements are **double-entry ledger** rows (debit/credit) with idempotency keys, so a retried request can never double-charge or double-pay.
- **Scheduling:** a delinquency sweep (reminders → auto-debit → penalties → escalation) runs via Vercel Cron daily; it also drives auto-pay collection before any penalty fires.
- **Payment abstraction:** a provider layer (`payment-provider.ts`) with a sandbox that auto-confirms today and a live branch keyed by environment credentials per rail — the routes and settlement path are provider-agnostic, so going live is a credential drop, not a rewrite.
- **Testing/CI:** 299 integration assertions exercise the full lifecycle plus attack simulations (lockout, replay, SQL-injection, weak passwords), self-healing between runs; Monte-Carlo and Pakistan-calibrated simulations back the default and profit models.

---

## 6. Financial-technology stack

- **Rails modelled:** Raast, JazzCash, Easypaisa, bank transfer, cash — each a first-class payment method with its own brand, flow, and (for wallets) account entry.
- **No-custody settlement:** money moves member → member; Halqa records the movement and, for its own fee/marketplace margin, will receive into its own merchant account (revenue collection, not customer custody).
- **Auto-debit mandate:** standing, per-circle, timestamped consent — the software half of Money Fellows' auto-collection, built without touching customer funds.
- **Turn marketplace:** a future payout position is a tradeable asset; premiums are capped (≤50% of payout) and Shariah-labelled circles allow free swaps only.
- **Parked (licensed stage):** the eleven earning engines (float sweep on idle pool days, deposit mudarabah, patience-weighted distribution, early-fee dividend, streak bonus, prize draw, etc.), the four-sleeve Vault (money-market / income / gold-linked / crypto with double-confirm), and escrow/bank-custody — all built, tested, and flag-hidden.

---

## 7. Cybersecurity & financial-fraud prevention (measured 21 July 2026)

**Transport & headers (verified live):**
- TLS everywhere; HSTS on both apps (web with `preload`, 2-year max-age)
- Full Content-Security-Policy on **both** web and API (API default-src `none`; web scoped to self + the API origin)
- Clickjacking blocked (web `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`)
- `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo/payment all denied)

**Application security (verified live):**
- Unauthenticated access → 401 (profile and committees both refused without a token)
- SQL-injection login attempt → 400, rejected (Prisma parameterises every query; injection is impossible by construction)
- Rate limiting active platform-wide; auth endpoints hard-limited to 30 attempts / 15 min in production
- Per-account lockout after 5 failed sign-ins; bcrypt (cost 12) password hashing; short-lived JWT access tokens with rotating refresh tokens and stolen-token-reuse detection
- Append-only audit log on every sensitive action; double-entry ledger with idempotency keys prevents double-spend

**Supply chain & secrets (verified):**
- Web dependencies: **0 known vulnerabilities**; API: 1 low-severity advisory in a build-adjacent dependency (non-exploitable at runtime, tracked)
- All secrets in Vercel encrypted environment variables; **zero secrets in source control**; internal deploy URLs behind Vercel SSO

**Financial-fraud controls specific to committees:**
- Position-as-collateral ordering (a fraudster cannot get an early payout without a proven record)
- Payout holdback (cannot collect while behind)
- CNIC-linked, timestamped evidence chain for recovery/legal action
- Duplicate-account prevention (one person, one account; unique CNIC / phone / email)
- Marketplace bidding gated by reliability score; feature-lock on default

**Honest current grade: B+.** The gaps, all named: (1) the database password exposed earlier in a chat session has not been rotated (chairman's decision, on record); (2) demo data still present in the production database (wipe before real users); (3) no second factor yet (WhatsApp OTP is the planned free 2FA); (4) the application connects with the master database role rather than a least-privilege app role; (5) no external penetration-test certificate yet (only required when a bank partner demands it).

---

## 8. The plan — from here to fully operational in ~one month

**The governing principle (the whole legal strategy in one line):** Halqa does not hold customer money, so Halqa needs **no financial licence** to operate — only to *exist as a company* and to *ride a licensed partner's payment rails*. The heavy licences are named and deliberately avoided.

### Gate 1 — Become a real company (Week 1–2, ~Rs 20–30k)
| Step | Exact name / body | Cost (PKR) | Timeline |
|---|---|---|---|
| Incorporate | **Private Limited Company** — SECP (Securities & Exchange Commission of Pakistan), Companies Act 2017, via the **eZfile / LEAP** portal | ~3,000–5,000 (Rs 1,000 name reservation + ~2,000 filing) DIY | 2–5 working days |
| Tax number | **NTN (National Tax Number)** — FBR (Federal Board of Revenue), IRIS portal | Free | 1–2 days |
| Sales-tax on services | PRA / SRB / FBR-ICT registration | Free | ~1 week |
| Company bank account | Any scheduled bank | Free + Rs 10–50k minimum balance | 1–2 weeks |
| Trademark | "Halqa" word + logo — **IPO-Pakistan**, Trade Marks Ordinance 2001 | ~5,000–15,000/class | file in days; grant 1–2 yrs |

### Gate 2 — Turn on real money (Week 2–4, per-transaction cost only)
| Step | Exact name / body | Cost | Timeline |
|---|---|---|---|
| Payment aggregation | **Merchant Services Agreement** with a licensed aggregator — **PayFast** (by APPS) or **Safepay**. *This is a contract, not a licence you obtain.* | Setup ~free; MDR per transaction: Safepay **3.3% + Rs 33**; wallets 1.5–3%; **Raast ≈ 0%** (state-subsidised) | 1–3 weeks |
| Identity verification | **NADRA Verisys Corporate Agreement** (CNIC verification) | ~Rs 50–100k setup (quote); ~Rs 30–75/check | 2–6 weeks (deferrable past launch) |
| 2FA / OTP | **WhatsApp Business Cloud API** (Meta) | Free tier | 1 day |
| Legal cover | Fintech-counsel **legal opinion letter** confirming non-licensable activity | Rs 50,000–100,000 | 1–2 weeks |
| Domain | halqa.pk via **PKNIC** | ~Rs 3,500/2 yrs | 1 day |

**One-month critical path:** SECP (days) → NTN (days) → bank account (1–2 wks, parallel with the merchant application) → merchant agreement + Raast-first integration + WhatsApp OTP (1–3 wks) → wipe demo seed, rotate the DB password, run the pen-test → open to first real hosts. **Total ~Rs 80,000–180,000, 4–8 weeks, app already live throughout.**

### The licences we deliberately do NOT get (know the names)
- **EMI (Electronic Money Institution)** — SBP (State Bank of Pakistan), *Regulations for Electronic Money Institutions, 2019* — **Rs 200 million** startup capital. Needed only if Halqa ever holds customer funds in a wallet. → reach via a bank/EMI partner, never buy.
- **PSO / PSP (Payment System Operator / Provider)** — SBP, under the Payment Systems & Electronic Fund Transfers Act 2007. → the aggregator already is one; Halqa rents that status.
- **NBFC (Non-Banking Finance Company) — Investment Finance Services** — SECP, *NBFC & Notified Entities Regulations, 2008* (public-limited company, 3-yr renewable). Needed only if Halqa lends its own money at scale (large-scale real-money gap-funding). → via a bank partner.

**Three red-line triggers** that would require the heavy licences: (1) holding the pot (custody), (2) real-money gap-funding at scale (lending), (3) formal credit-bureau reporting.

**Compliance obligations we DO carry regardless** (these are laws, not licences): AML Act 2010, PECA 2016 (cyber-crime), Electronic Transactions Ordinance 2002 (which makes our timestamped records legally admissible), and the forthcoming personal-data-protection framework.

---

## 9. Market research — Money Fellows (Egypt), and how Halqa compares

**Who they are (verified figures from public sources):** Money Fellows digitised the Egyptian *gam'eya* (the exact ROSCA equivalent of the kameti). Reported: **8.5M registered users, ~350k monthly actives, US$1.5B+ processed, US$60M+ raised, profitable.** They are the proof that a digitised ROSCA works at national scale — which is why they are the right benchmark, not a Western fintech.

**Their default-prevention machine:** credit assessment *before* a user joins a circle; new users denied early slots; the platform covers a missed share and then collects from the defaulter; national-ID KYC + OTP; a prepaid card (Banque Misr) for disbursement; slot-based service fees paid by users.

### How Halqa is SIMILAR (~75% of the mechanics)
- Same core object: a digital ROSCA with fixed contribution, rotating payout, locked schedule.
- Same #1 anti-default tool: **turn position is earned** — unproven members are pushed late so they pay before they collect. (Halqa built this without deposits.)
- Same platform-fills-slots idea (their "cover a missed share" ≈ our fund-the-gap).
- Same identity spine: national ID + OTP.
- Same auto-collection end-goal (our auto-pay mandate is the software half; execution lands with the merchant account).

### How Halqa is DIFFERENT (this is the moat)
| Dimension | Money Fellows | Halqa |
|---|---|---|
| **Who pays** | Users pay slot-based service fees | **Members pay Rs 0, ever.** Revenue = late fees + consented data-leads + marketplace margin + business commerce (Section 10 idea) |
| **Social structure** | Pools strangers into platform-formed circles | **Keeps the real-world host and the real social circle** — how Pakistani kametis actually work; trust is pre-existing, not manufactured |
| **The extra product** | Prepaid card | **Credit Passport** — portable proof of reliability that bridges the unbanked to formal credit; and a **turn marketplace** (sell/buy positions, even across circles) |
| **Custody** | Holds/moves funds (regulated e-money posture) | **No custody** — records and schedules; money moves member-to-member on Raast/wallets. This is why Halqa needs no EMI licence at launch |
| **Data model** | Card/transaction data | **Consented goal-intent** (Hajj savers → tour operators, etc.) — sold as leads now, and as closed group-buying commerce later |

**Scorecard:** mechanics ~75% similar · social architecture ~30% similar (we keep the host; they pool strangers) · business model ~35% similar (they charge users; we never do). **Halqa today runs roughly 85% of their default-prevention machine**, missing only live auto-debit execution.

**The x-factor beyond Money Fellows — "Goal Direct-Pay":** a 12-member Hajj circle is a bulk buyer. Instead of just handing over cash, Halqa group-negotiates the Hajj package (or the wedding hall, or the school fees) so the member gets *more than their money was worth*, the merchant gets a pre-qualified bulk customer, and the merchant pays Halqa commission. It needs no licence (the merchant invoices the member) and it is something no ROSCA app anywhere does. This is the next build.

---

## 10. VAPT — Vulnerability Assessment & Penetration Test (self-assessed, 21 July 2026)

*Scope: the live production web app, API, and database. Methodology: OWASP Top-10-aligned manual probing + automated dependency audit + header/config review. This is an internal assessment; an external certificate is a Gate-2 item only if a bank partner requires it.*

| OWASP category | Finding | Status |
|---|---|---|
| A01 Broken Access Control | Unauth requests to profile/committees → 401; host-only routes enforce host; member-only routes enforce membership | **PASS** |
| A02 Cryptographic Failures | TLS+HSTS everywhere; bcrypt(12) passwords; signed passport tokens; DB encrypted at rest | **PASS** |
| A03 Injection | SQLi login attempt → 400; Prisma parameterises all queries; Zod validates every input | **PASS** |
| A04 Insecure Design | No-custody design removes the single biggest attack surface (there is no pot to steal) | **PASS** |
| A05 Security Misconfiguration | Full CSP both apps, security headers present, secrets in encrypted env, none in git | **PASS** |
| A06 Vulnerable Components | Web 0 vulns; API 1 low-severity (build-adjacent, non-runtime) | **PASS (1 low, tracked)** |
| A07 Auth Failures | 30/15min auth rate limit; 5-attempt lockout; refresh-token rotation + reuse detection | **PASS** |
| A08 Data/Software Integrity | Double-entry ledger + idempotency keys; append-only audit log | **PASS** |
| A09 Logging & Monitoring | Structured request logging; audit trail; Vercel + Supabase logs | **PARTIAL — no alerting yet** |
| A10 SSRF | No user-supplied URL fetching in the API | **N/A** |

**Open items (prioritised):**
1. **HIGH — rotate the exposed database password** (leaked in a chat session; still active). Chairman's decision, on record.
2. **HIGH — wipe demo data** from production before real users.
3. **MEDIUM — add a second factor** (WhatsApp OTP, free) and move the app to a **least-privilege database role** instead of the master role.
4. **MEDIUM — add alerting** on 5xx spikes and auth-failure bursts.
5. **LOW — resolve the single low-severity dependency advisory** at the next dependency bump.
6. **LATER — commission an external pen-test** and Supabase Pro point-in-time backups when a bank partner or scale requires it.

**Overall posture: B+ / strong for a pilot.** No critical or high *code* vulnerabilities were found; the two HIGH items are operational hygiene the chairman has explicitly deferred, and both are minutes to fix when he chooses.

---

### Appendix — sources for licensing/market figures
SECP incorporation & fees (secp.gov.pk) · SBP EMI Regulations 2019, Rs 200M capital (sbp.org.pk/psd/2019) · SBP Raast & P2M subsidy (sbp.org.pk/dfs/Raast.html; psd/2025) · SECP NBFC Investment Finance Services (secp.gov.pk/licensing/nbfcs) · NADRA verification (nadra.gov.pk) · payment-gateway MDR (PayFast/Safepay public pricing & simpaisa.com) · Money Fellows metrics (public press/company disclosures). Full licensing detail in `docs/ROADMAP-LICENSING-AND-COSTS.md`.
