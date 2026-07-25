# Halqa — The Full Product & Company Report
### For the SECP Chairman, investors, and partners
### Version 1.0 · July 2026 · Confidential

> This document is the complete picture of Halqa: what we are building, how the
> money and the risk actually move, the technology, the regulatory path, and the
> economics. It is deliberately concrete. Where a claim depends on a decision only
> a lawyer, a regulator, or the founder can make, it is flagged **[TO DO]** and
> collected in §16. Nothing here is asserted without either a mechanism or a
> source. Capability is tagged by what it takes to ship:
> **[TODAY]** buildable now · **[PARTNER]** needs a commercial agreement ·
> **[LICENCE]** needs an SECP/SBP registration · **[SANDBOX]** needs supervised
> live testing · **[CAPITAL]** needs funding.

---

## 1 · Executive summary

Pakistan runs roughly **Rs 4 trillion (~US$5bn) a year** through informal savings
committees (ROSCAs / *kameti* / *beesi*) — the country's **third-largest savings
channel**, ahead of almost every formal product, and the only credit most of the
**~100 million unbanked** ever touch. It works on social trust and it is dying of
two diseases: the **organiser who absconds with the pot** (documented losses in the
hundreds of millions of rupees), and the **member who collects early and stops
paying**. There is no record, no recourse, and no return on your money while you
wait.

Halqa digitises the committee and cures both diseases without becoming a bank.
**We never hold the pot** — money moves member-to-member on a double-entry ledger,
so there is no central pool to steal. We remove default the way a good bank does:
not by chasing defaulters, but by **making default irrational** (you are only
offered what you can afford, and you post your own money or an asset as collateral)
and **making the money whole when it still happens** (Halqa covers the loss and
transfers the tail to a credit guarantee). And we give savers what a committee never
could — **a return on their money** — by routing it into a regulated fund held by a
licensed trustee, not by us.

The model has three products that reinforce each other: **the Committee** (the
core), **the Vault** (savings that grow), and **Asset Committees** (buy-now-pay-in-
installments where the asset is the collateral). The second and third are structurally
low-loss, and every member we move into them de-risks the first. We are asking the
SECP for the one thing that unlocks the rest: **a supervised sandbox to prove the
numbers**, exactly as Egypt's central bank did for Money Fellows.

---

## 2 · The market and the problem (why this is a Rs-4-trillion opportunity)

- **Size.** ~Rs 4tn/yr rotating informally; **34–41%** of adults have participated;
  **~90%** are aware of committees; only **14%** of women hold a formal account, and
  **85%** of adults rely on informal credit. This is not a niche — it is where
  Pakistan already saves and borrows.
- **Why people love committees (the efficiencies we KEEP):** interest-free lump sum
  (no *riba*), a forced-savings commitment device, no credit history or collateral
  required, social accountability, speed and simplicity, and cultural/religious fit
  where only ~9% of the excluded trust banks.
- **Why people fear them (the inefficiencies we KILL):** the organiser absconds; the
  early recipient defaults; there is no legal recourse; your money earns **0%** while
  inflation (~11–12%) erodes it; you might draw a late slot when you needed cash
  early; it is rigid and illiquid; there is no record of your reliability; and at
  digital scale, trust between strangers simply breaks — which is exactly how the
  large committee frauds happened.
- **The one-line thesis:** *keep every reason people love committees; delete every
  reason they fear them.* Our record IS the product — because the informal system
  keeps no records at all, and that opacity is itself the risk.

---

## 3 · The core insight — a committee is two different people

Every committee is two transactions wearing one coat:

- **Savers** take a **late** turn. They pay in for months, then collect at the end.
  They are *saving* with discipline. Their default risk to the group is near-zero —
  by the time they could walk, they have already paid in more than they will receive.
  Their only real complaint in a normal committee is that their money sat dead.
- **Consumers** take an **early** turn. They receive the lump sum before they have
  paid most of it in — they are *borrowing* from the group and repaying over the rest
  of the cycle. **Almost all default risk lives here.**

Worked example (10 people, Rs 10,000/month, Rs 100,000 pot): the person in turn 1
receives Rs 100,000 having paid Rs 10,000 — Rs 90,000 of *forward liability* (the
amount still owed). The person in turn 10 pays for nine months then collects; they
cannot meaningfully default.

**So we treat them differently, and this is the spine of everything below:** keep
friction *low* for the low-risk saver majority, and concentrate the controls on the
early-turn consumers who actually carry the risk. One rule can't do that; the split
can. Critically, the user never has to understand the jargon — they simply choose
**when** they want their money and **which product**, and the system assigns the risk
treatment silently, so it still *feels* like an ordinary committee.

---

## 4 · The products

### 4.1 The Committee — the core **[TODAY]**
A digital ROSCA. Members join, positions are assigned (chosen, balloted, or
graduated by reliability), and each cycle everyone contributes and one member
collects. **Halqa never holds the pot** — it records obligations and routes payments
member-to-member on a **double-entry ledger** (record-only). This is the same
posture that keeps us outside the EMI/deposit regime, and it is buildable and
runnable today.

- **Revenue:** a service/positioning fee (early turns priced higher, late turns
  earn a small bonus), plus a fee on secondary turn trades.

### 4.2 The Vault — savings that actually grow **[PARTNER]/[LICENCE]**
The feature we scrapped, revived correctly. Idle money — a saver waiting for turn 10,
or anyone — is routed into a **money-market / Islamic income fund**. The money is held
by the **Central Depository Company (CDC) as trustee**, with **fund units issued in
the member's own name**. **Halqa never touches the money.** This is not theory:
**Mahaana Wealth**, Pakistan's first digital-only AMC, runs exactly this and states
plainly that funds sit with CDC and it *"does not have direct access to your funds."*
Islamic money-market funds currently yield **~10–11%** vs 5–8% on a bank account.

Two modes:
1. **Growth Vault** — idle savings earn a return instead of dying to inflation. This
   single feature deletes the biggest reason savers dislike committees.
2. **Safety Vault (pledged)** — a member parks money that is **liened** to their
   committee. On a missed installment we settle the group from **their own** pledged
   units (clean set-off, not seizure). This is how a member "cannot default up to
   their buffer." *The vault must be pledged, not freely withdrawable, or it provides
   no protection — see §5.*

- **What it takes:** an **[LICENCE]** SECP multi-AMC **distributor registration**
  (not an EMI, not a full NBFC) plus an **[PARTNER]** AMC/CDC arrangement. CDC even
  runs *Emlaak Financials*, a live precedent for distributing funds without holding
  a rupee.
- **Revenue:** distribution fee / trailer on funds; premium on the pledged-vault
  guarantee.

### 4.3 Asset Committees — installments where the asset is the collateral **[PARTNER]/[LICENCE]/[CAPITAL]**
Buy a phone, bike, laptop, or appliance and pay in committee-style installments.
Structurally **low loss-given-default because the asset secures the debt** — but only
if structured correctly, which is the part your instinct ("find a way to get it back")
requires:

- **The legal structure (this is the "get it back" mechanism):** we do **not** "seize"
  anyone's property. The asset is financed as **Ijara (lease-to-own)** or **Murabaha
  with retained title / a registered charge** — Halqa or a licensed financing partner
  **retains legal ownership until the final installment is paid**. The member is a
  lessee/hire-purchaser. On default, repossession is us enforcing **our own ownership**
  — lawful and contractual, the same mechanism every auto and appliance financier in
  Pakistan uses. **[TO DO — lawyer to confirm ijara vs Murabaha vs charge for each
  asset class.]**
- **Recovery stack for this product:** (1) a **down payment** (skin in the game),
  (2) the **asset itself** as security, (3) **device-level control** where it applies
  — a financed phone can be **remotely locked** on default (standard in handset
  financing) and a vehicle **GPS-tracked**, (4) **repossession → resale** to recover
  principal, (5) **credit-guarantee** and **asset takaful** (loss/damage) on top.
- **Honest caveat:** loss-given-default is **low, not zero** — a repossessed asset is
  a used asset (depreciation) plus repossession/resale cost; the down payment, late
  fees, and guarantee close that gap. And this is the **most regulated** of the three
  products (extending credit = NBFC territory or a licensed BNPL/Islamic-bank
  partner), and it needs **working capital** to hold inventory — like Money Fellows'
  US$2.25m facility for its own exposure.
- **Revenue:** the financing margin (Murabaha markup / ijara rental), within Shariah
  limits.

### 4.4 Hyper "Bazaar" Committees — high-volume, balloted, tradeable **[SANDBOX]**
Very large committees (e.g., 10,000 members, small installments, longer or shorter
intervals), **ballot (*qura*) payout** (whoever's turn is drawn collects first),
**anonymised** (names hidden — irrelevant at scale, but we still hold the data), all
consumption users, and **turns tradeable on a marketplace**. This is the innovation
Akif's "look at margin trading" comment points at — a secondary market in positions.

**Be clear-eyed:** size alone is fine; the *combination* — pooling public money +
random payout + tradeable positions + anonymity — starts to look, legally, like a
**Collective Investment Scheme**, a **prize/lottery scheme**, and a **securities
market** at once, and it removes the social-trust basis that defines a committee.
That is why this is a **[SANDBOX]** product: run it small under SECP supervision to
prove it, exactly as Egypt's CBE ran a dedicated ROSCA sandbox cohort for Money
Fellows. The tradeable-turn market, at scale, needs proper clearing/settlement or a
licence (the MTS machinery is the reference model). **[TO DO — SECP read on the
CIS/lottery/derivative classification of this product.]**

### 4.5 Float for savers — your money works while it waits **[SANDBOX]/[PARTNER]**
On committees with an interval between collection and payout, the **pooled money sits
idle** (everyone pays on the 1st, the recipient is paid on the 30th). Today that float
is dead money. We put it to work: each contribution **buys fund units (CDC-held) in
the member's own name on pay-in and is redeemed on payout day**, so the ~1 month of
yield accrues to the saver (minus a Halqa fee). At ~10–11%/yr, one month ≈ **0.85%**
on the pool — modest but real, and unique. **Operational catch:** funds settle
T+1/T+2, so we need a liquidity buffer or same-day settlement to guarantee the payout
is never late; we only ever park in the safest instruments. This rides the Vault rail
and is a **later, premium** feature, not launch-day.

---

## 5 · Default PREVENTION — the doctrine and the machinery

Akif's mentor's rule: *"don't build ways to enforce recovery — build a system where
there is no incentive to default, or the consequences are so great no one does."*
Prevention is ~90% of the answer. Our stack, cheapest to strongest:

1. **Eligibility filtering (the cheapest prevention there is).** You cannot default
   on a commitment you were never allowed to take. Members are **only shown the
   committees they qualify for**, by verified income:
   - **Savers** (late slots) need only **CNIC + home location + job + bureau linkage**;
     **no PG**. Even a mid-cycle stop costs the group little (their paid-in offsets it).
   - **Consumers** (early slots) must show **income/means to pay** — salary slip, or a
     business/spouse's income (own or husband's only; anything else needs manual
     verification and app permission). We then **band** them so they are matched only
     to committees whose installment they can actually service. **PG required.**
   Students who earn nothing never see the Rs-50,000/month committee — so they can
   never blow up in it. The filter does a collections team's job, for free.
2. **Cross-product collateral (the pledged buffer).** Every member we move into the
   **Vault (pledged)** or an **Asset Committee** is pre-collateralised. On a miss, we
   self-cure from their own pledged units / the asset. We **incentivise adoption with
   fee discounts** — and the risk reduction is proportional to that adoption, so we
   price honestly for the rest. (The prior verification discounts — cheque 95% /
   income+employer 80% / salary 20% — are the same lever: we *price* people toward
   being safe.)
3. **Position quarantine.** New members start where risk is lowest — **late turns
   only**, until **2 clean completed circles + verification** graduate them to earlier
   turns. New risk never starts at the front.
4. **Identity + reputation.** Consented **CNIC, home locality, job**, a portable
   reliability record built from real payment events, and public trust signals on a
   member's profile. This is legitimate KYC and a deterrent by itself.

*The keep-it-a-committee test:* all of the above is either invisible (position, price)
or opt-in (products), so a normal saver still experiences a normal committee. That is
the line Akif warned us not to cross.

---

## 6 · Default RECOVERY — a real ladder (when prevention still fails)

Most of this is *not* "chase the money"; the first rungs make members whole, the last
keep the deterrent credible.

- **Rung 0 — Prevented.** Eligibility + pledged buffer + asset collateral mean most
  exposure is pre-secured before a default can occur.
- **Rung 1 — Self-cure.** Auto-debit retries; then draw the missed amount from the
  defaulter's **own pledged Vault** or **repossess the financed asset** (§4.3). No one
  else is touched.
- **Rung 2 — Halqa covers it (the trust product) [CAPITAL].** Halqa's **first-loss
  fund pays the group immediately**, so members **never lose a rupee**. This is the
  Money Fellows-style promise — the reason people trust us over a paper committee.
  Funded from the fee spread + late fees + a guarantee fee on protected committees.
- **Rung 3 — Insure the tail [PARTNER]/[LICENCE].** We cede the unexpected spike (a
  bad month, a fraud ring) to a **credit guarantee** — the correct instrument, **not
  takaful**. Pakistan has a dedicated one: **NCGCL** (National Credit Guarantee
  Company, 2024; Karandaaz + Ministry of Finance), with a live **Rs 2.0bn PMIC–NCGCL
  portfolio guarantee** precedent (Jan 2026). *Credit-life takaful* (EFU, Pak-Qatar,
  Salaam) sits on top as a **member benefit** — it covers death/disability only, not
  wilful default, so it is not our backstop.
- **Rung 4 — Pursue, legally (keeps the deterrent real) [LICENCE for bureau write].**
  E-signed weekly **undertaking (*iqrarnama*)** + mutual member↔member **personal
  guarantee** → fast **Order XXXVII CPC summary suit** → decree → **attachment & sale
  of assets**; the optional cheque tier arms **§489-F PPC**. And the strongest civil
  deterrent: **reporting the default to the credit bureau**, which damages the person's
  credit everywhere.

> **A hard line we will not cross:** deterrence stays **legal and transparent** —
> bureau reporting, courts, platform blacklist. We will **not** surveil users across
> other sites or use "out-of-court" pressure. That is illegal under Pakistan's data
> and cyber law, it is the exact behaviour of the committee fraudsters we are
> displacing, and it would end the SECP relationship on the spot. Legal deterrence is
> both stronger and defensible.

**Net:** Rungs 2–3 remove the *fear*, Rungs 0–1 remove the *incidence*, Rung 4 removes
the *temptation*. Enforcement is the smallest part.

---

## 7 · Money movement & collection (and why auto-debit is honest here)

- **We never hold the pot.** Committee money moves member-to-member; vault money sits
  with **CDC**. This is the root-cause fix for every mass fraud and the reason we stay
  outside the custody/EMI regime.
- **Collection is a waterfall matched to the user, not one rail:**
  - **[PARTNER] Card-on-file recurring (MIT)** — for carded, salaried consumers, the
    *SaaS model*: a valid instrument stays on file for the life of the committee and
    is auto-charged; removal is blocked unless replaced. This works in Pakistan today
    via a PSP/acquirer and is arguably our best near-term auto-debit for the consumer
    segment.
  - **[PARTNER] Wallet auto-deduct** — Easypaisa/JazzCash "charge-if-balance" via
    1LINK **1BILL**, for wallet-native users.
  - **[TODAY/PARTNER] Raast RTP** — we send a request, the member approves with one
    tap in their bank app. Live on all banks since 2024. Near-frictionless, but one tap.
  - **[LICENCE] Raast PISP "pull payment"** — true consent-then-pull auto-debit
    (one-time mandate, then silent scheduled pulls). The Raast CEO confirmed (June
    2026) it is **in testing, "launching very soon."** We architect for it so switching
    on is a config change, not a rebuild, and we get **PISP participant status** (via a
    bank/EMI partner or PSO/PSP approval) the day it ships.
- **Honest position to the regulator:** *true cross-bank auto-debit does not exist for
  anyone in Pakistan today, including Oraan* — so we run card-on-file / wallet / RTP
  now and are first-in-line for PISP. That candour is a feature.

---

## 8 · Credit scoring & bureau

- **Now [TODAY]:** we score on our own behavioural data (payment events, tenure,
  completions) — a 300–850 reliability score with bands (Bad / Decent / Good /
  Excellent) that gate which slots a member may take. Oraan and Money Fellows both
  underwrite on proprietary data; so do we.
- **Read a bureau score [PARTNER]:** a subscriber agreement with **TASDEEQ /
  DataCheck** (partner-gated; precedent: a non-bank, Karandaaz, signed with TASDEEQ).
  TASDEEQ's 200–600 scale maps into our 300–850 in code.
- **Report defaults / eCIB [LICENCE]:** writing to the bureau or reaching **eCIB**
  needs FI status (or a Gazette notification / a partner FI). This is a licence-stage
  capability. **[TO DO — bureau partnership terms.]**

---

## 9 · Technology & architecture (the CS layer)

- **Frontend:** **TypeScript + React + Vite**, PWA-capable, **Capacitor** for the
  Android/iOS wrappers. Urdu supported. In-app AI guide ("Rafa") on the **Anthropic
  (Claude) API**.
- **Backend:** **Node.js + Express (TypeScript)**, **Prisma ORM**, **PostgreSQL**. The
  core money engine is a **double-entry ledger** (record-only), so every rupee has a
  matching debit/credit and there is no pool to steal.
- **Hosting/infra:** **Vercel** serverless functions **co-located in region `sin1`
  (Singapore)** with the DB — this single co-location fix cut cross-region latency
  ~60× and was the difference between "unusably slow" and "instant." Managed Postgres
  on **Supabase** with **pgBouncer** connection pooling.
- **Security:** **JWT** access+refresh tokens, **bcrypt** password hashing, **phone
  OTP**, an **app PIN** (SHA-256, asked every open), **WebAuthn** biometric unlock,
  account lockout + IP rate-limiting + timing-defence against user enumeration.
- **Identity capture:** device-camera **CNIC scan** (getUserMedia), **live GPS home**
  (Geolocation API + **Nominatim** reverse-geocode). Future: **NADRA Verisys /
  Biometric Verisys** to verify the CNIC is real and belongs to the person.
- **Payments integration:** Raast (RTP now, PISP next), card-on-file via a PSP,
  wallet/1LINK 1BILL, and — for the Vault — **AMC/CDC fund APIs** (units issued in the
  member's name).
- **Future APIs:** TASDEEQ/DataCheck (bureau), takaful operator (credit-life),
  WhatsApp Business API (reminders/receipts), employer payroll (salary deduction).
- **Quality:** unit tests (**vitest**) + a custom integration harness (hundreds of
  end-to-end checks) + a Pakistan-calibrated default simulation.
- **Migration/DR:** the entire project — code, Git history, local DB, portable
  toolchain, and even the Claude Code build history — is packaged into a verified,
  encrypted, restorable migration bundle (this is operationally how we protect the IP).

---

## 10 · Regulatory & licensing roadmap (the ladder, grouped)

We climb the **same ladder Oraan did** — and note the correction: **Oraan *is*
SECP-licensed** (NBFC "Investment Finance Services", `SECP/LRD/107/OFSPL/2023`, 2023);
before that it ran under the **SECP sandbox**. Our differentiator is not "they're
unlicensed" — it is that we start **guarantee-backed and CDC-custodied** from day one.

- **[TODAY] Company + facilitator.** SECP private-limited company + FBR NTN. Run the
  record-only committee, own scoring, the app. No EMI/NBFC needed to facilitate.
- **[PARTNER] Commercial agreements (no licence):** AMC + CDC for the vault; a
  PSP/acquirer for card-on-file; a bank/EMI for Raast; TASDEEQ for bureau reads; a
  takaful operator for credit-life.
- **[LICENCE] SECP registrations:** a **multi-AMC distributor registration** (vault);
  eventually an **NBFC (Investment Finance Services)** for asset finance / holding the
  guarantee at scale / bureau write; **Raast PISP** status (SBP) for true auto-debit.
- **[SANDBOX] Supervised testing:** the **SECP Regulatory Sandbox** — unregistered
  startups intending to register are explicitly eligible (`sandbox@secp.gov.pk`); the
  4th cohort's theme was literally Islamic micro/nano-finance and *"new takaful
  models."* We pilot the **guarantee model, the hyper committees, and the float
  product** here to prove default numbers before scale. **This is the single
  highest-value door Akif can open.**
- **[CAPITAL] Funded steps:** the first-loss guarantee fund; asset-finance working
  capital; NBFC minimum equity; takaful/guarantee premiums.

**[TO DO — the SECP-only questions for Akif]:** (1) will SECP open/point us at a
**committee sandbox cohort**? (2) where exactly does "Halqa covers defaults on its
balance sheet" cross into needing an **NBFC/insurance** licence? (3) can we reach
**NCGCL guarantee + eCIB** inside the sandbox or only post-NBFC? (4) is the
**float-backstop** (savers' float part-funding the guarantee) allowed? (5) distributor-
to-an-AMC vs our **own NBFC** — which does he prefer given where this goes?

---

## 11 · Comparators (what we learned)

- **Oraan (Pakistan):** ~600k+ women savers; took the sandbox → NBFC path; most likely
  a technology facilitator routing money member-to-member via a partner. **Lesson:**
  the ladder works locally; we differentiate on guarantee + custody + the saver/consumer
  split.
- **Money Fellows (Egypt):** ~US$1.5bn processed, ~350k MAU, **profitable in 2025**.
  Crucially, **Egypt never legalised the gam'eya** — the **Central Bank's sandbox
  dedicated a cohort to ROSCAs**, and **Banque Misr (a state bank) holds the money**;
  Money Fellows is the tech layer. **It publishes no default rate** (the quoted "7–8%"
  is empty-slot fill funded by a debt facility, *not* defaults) — meaning our
  "Halqa covers defaults" promise goes *further* than they actually do. **Lesson:**
  legalise the *platform* via a sandbox + a bank/AMC custodian; the committee itself
  needs no new law.

---

## 12 · Business model & unit economics

Revenue lines, layered:
1. **Committee service/positioning fee** (early turns priced higher; late turns a
   small bonus) — the base, from day one.
2. **Turn-marketplace fee** (~10%) on secondary trades of positions.
3. **Guarantee fee** on "protected" committees — members pay a little to *never lose*;
   this is priced against our expected loss.
4. **Vault distribution fee / trailer** on funds routed to the AMC.
5. **Float spread** on in-flight committee money (saver keeps most; Halqa keeps a cut).
6. **Asset-finance margin** (Murabaha markup / ijara rental) on Asset Committees.
7. **Future:** card interchange, merchant commissions, and employer-payroll B2B.

**Loss side:** after the §5 prevention stack, our Pakistan-calibrated simulation puts
post-payout default at roughly **0.3%–1.4%** of pot value — a **provision**, not a
catastrophe: on a Rs-100m active book, ~Rs 0.3–1.4m expected loss, funded by the fee
spread + late fees + guarantee fee, with the **credit guarantee capping the tail**.
This is exactly how a bank provisions expected loss and transfers the unexpected loss.
**[TO DO — build the full financial model: guarantee-fund sizing, PD/LGD by segment,
P&L, CAC, break-even.]**

---

## 13 · Roadmap by feasibility (the "what unlocks what" map)

**Ship now [TODAY]:** company + NTN; record-only committees; saver/consumer split;
eligibility filtering; position quarantine; own reliability score; e-sign undertaking
+ PG; CNIC capture, PIN, biometric; the app, Urdu, Rafa; Raast RTP collection (via a
participation route).

**On a commercial agreement [PARTNER]:** the Vault (AMC + CDC); card-on-file & wallet
auto-debit (PSP/acquirer); bureau *reads* (TASDEEQ); credit-life takaful.

**On a registration/licence [LICENCE]:** distributor registration (vault); Raast PISP
(true auto-debit); NBFC (asset finance, guarantee at scale, bureau *write*).

**In the sandbox [SANDBOX]:** the guarantee/cover model; hyper "Bazaar" committees;
the float product; a novel committee-default takaful.

**With capital [CAPITAL]:** the first-loss fund; asset-finance working capital; NBFC
equity; premiums; team + go-to-market.

---

## 14 · Risk register (top risks + mitigations)

| Risk | Mitigation |
|---|---|
| A single fraud/default on our watch destroys trust | Never hold money; guarantee-backed; record everything; legal deterrence |
| Regulatory reclassification (esp. hyper committees) | Sandbox-first; conservative structuring; lawyer + SECP sign-off before scale |
| Collection failure (no true auto-debit yet) | Waterfall (card/wallet/RTP) now; PISP-ready; retry ladder |
| Cross-product adoption lower than hoped | Price honestly for the un-collateralised; discounts to drive adoption |
| Asset repossession is slow/partial | Retained-title structure; down payment; device lock/GPS; guarantee |
| Correlated default in a downturn | Guarantee + takaful tail cover; income-band limits; diversification |
| Capital to fund the guarantee | Sandbox proof → raise; start with vault-collateral (low capital) |
| Data-protection / consumer-protection exposure | Consent-based KYC only; legal deterrence only; PECA/PDPB compliance |

---

## 15 · The 2-week full-report table of contents (what we go deep on next)

Exec summary · market & segments · the saver/consumer thesis · onboarding & identity
(NADRA/CNIC/PIN/biometric) · collection (rails, mandates, reconciliation) · products
(committee, vault, asset, hyper, float) · prevention · recovery + balance-sheet cover
+ guarantee/takaful · scoring & bureau · **cybersecurity & data protection** ·
licensing & structure · financial model & unit economics · technology & architecture ·
comparators · risk register · go-to-market & marketing · roadmap & milestones.

---

## 16 · Open questions — **[TO DO]**, where I need your / a lawyer's / Akif's call

1. **SECP classification** of Halqa's overall structure (facilitator vs distributor vs
   NBFC) — lawyer + Akif.
2. **Vault licence** — does distributor registration alone suffice, or do we need an
   Investment Adviser licence? (Confirm equity thresholds.)
3. **Asset product** — exact Shariah/legal structure per asset class (ijara vs Murabaha
   vs registered charge) and repossession procedure — lawyer.
4. **Balance-sheet default cover** — the precise line where covering losses needs an
   NBFC/insurance licence.
5. **Float-backstop** — is using savers' consented float to part-fund the guarantee
   permitted? (Handle with care.)
6. **Hyper "Bazaar" committee** — CIS/lottery/derivative classification; can the
   tradeable-turn market run in the sandbox?
7. **Bureau** — TASDEEQ read terms; the path to eCIB/write.
8. **Own-NBFC vs partner-NBFC** — strategic sequencing.
9. **NBFC minimum capital** figures — verify current thresholds.
10. **The financial model** — full PD/LGD/EL build, guarantee-fund sizing, P&L.
11. **MTS relevance** — still speculative; confirm with Akif what he meant.

---

## 17 · The ask

Give us a **supervised sandbox** to prove the default numbers, and the two
introductions that make the rest real: **an AMC/CDC** for the vault and a **bank/EMI**
for collection. We will walk the regulated ladder — sandbox → distributor → NBFC — but
start **guarantee-backed and custody-free from day one**. The committee is how Pakistan
already saves; we are simply going to make it safe, make it grow, and write it down.
