# 08 · REGULATORY AND LEGAL POSITION

---

## 1 · The three red lines

Halqa requires **no financial licence** while three conditions hold. Each maps to
exactly one licence, and each is avoided by architecture rather than by contract.

| # | Red line | Licence it would trigger | How it is avoided |
|---|---|---|---|
| **1** | **Holding the pot** | **SBP EMI** — *Regulations for Electronic Money Institutions, 2019*, **Rs 200M capital** | Money settles payer-to-recipient. Halqa issues no balances and holds none. Even Stage-2 savings sit with CDC. |
| **2** | **Lending or pooling at scale** | **SECP NBFC** — Investment Finance Services, *NBFC Regulations 2008*, needs a **public** limited company, 3-year renewal | Members fund each other. Stage-2 funds are deployed only by a licensed AMC under its own licence. |
| **3** | **Formal credit-bureau reporting** | Bureau membership under the *Credit Bureaus Act 2015* | Bureau *writes* are out of scope for stages one and two. **s.11(1)**: membership for a furnisher that is not a credit institution "shall be notified by the Federal Government accordingly" — not a purely commercial choice. |
| **4** | **Member paying member for position** | **SECP P2P permission** — lending NBFC + **Rs 20M** additional equity, *NBFC Regulations 2008* | Defined as "the extension of loans by the lender to the borrower through the P2P Lending Platform". Removed by routing all position money member↔Halqa (ruling of 2026-09-22). |
| **5** | **Own cover facility** | **SECP insurer registration** — *Insurance Ordinance 2000* s.6(1), and s.5(1) admits only a public company | s.2(xxvii) catches any promise to pay on a contingent loss "in consideration of a premium received". Cover must be written by a licensed takaful operator and distributed by Halqa as a corporate insurance agent. |

Adjacent: **operating a payment system** would trigger **PSO/PSP** under the
*Payment Systems and EFT Act 2007*. Halqa operates none — it initiates over a
licensed aggregator's. Stated precisely: **s.4(1)** makes designation
discretionary ("The State Bank **may**, if it finds it to be necessary in the
public interest, by a written order designate a Payment System a Designated
Payment System") and **s.14(1)** lets SBP prohibit any person from issuing or
using a Payment Instrument. There is no licence to avoid; there is a discretion
SBP may exercise over Halqa at any time.

**The clause that carries the whole no-custody design** is *Companies Act 2017*
**s.84(1)**: "no company shall invite, accept or renew deposits from the public".
The Explanation defines a deposit as "any deposit of money with, and includes any
amount borrowed by, a company", excluding "an advance against sale of goods or
**provision of services in the ordinary course of business**" — which is what
lets Halqa charge its own fee in advance. **s.84(2)(a)** sets a penalty of not
less than the amount of deposit accepted; **s.84(3)** adds imprisonment up to two
years and a fine up to Rs 5 million for **every officer in default**, personally.

Full clause-by-clause verification, with the errors it found:
`Halqa — Licensing Verification and Clause Authority` (Google Doc, 2026-09-22).

> **The regulated activities do not occur anywhere in the architecture, so the
> licences that govern them cannot apply.** This is not a workaround. It was
> designed in from the first line of code and survives scrutiny because it is
> architectural.

**Independent validation:** Mehmood et al. (2018), ITU Lahore + University of
Washington, Gates/Karandaaz funded, published this exact structure as the correct
legal design for a Pakistani digital ROSCA. See `07`.

---

## 2 · The two gates

### Gate 1 — become a company (~Rs 20–30k, weeks 1–2)

- SECP private limited incorporation via eZfile / eservices.secp.gov.pk
  (~Rs 3–5k self-filed, 2–5 working days)
- FBR **National Tax Number** (free, 1–2 days, auto-integrated via IRIS)
- Provincial sales-tax registration
- Corporate operating account (1–2 weeks, in parallel) — **this is Halqa's own
  account for its own revenue, not a partnership and not customer money**
- Trademark filing with IPO-Pakistan

**Halqa currently has NEITHER the company NOR the NTN.** This is the first
blocking step for everything else.

### Gate 2 — turn on real money (weeks 2–4, Rs 80,000–180,000 total)

| Step | Detail | Cost |
|---|---|---|
| **Payment aggregation** | **Merchant Services Agreement** with PayFast or Safepay. **A commercial contract, not a licence** — which is why the hardest-sounding step is a negotiation of weeks rather than an approval of months. | Per transaction: card 3.3% + Rs 33; wallets 1.5–3%; **Raast ≈ 0%** |
| **Identity** | NADRA Verisys corporate agreement. Deferrable past launch. | ~Rs 50–100k setup; Rs 30–75/check |
| **Second factor** | WhatsApp Business Cloud API | Free tier |
| **Legal** | Counsel opinion on non-licensable activity + review of the undertaking and PG texts | Rs 50–100k |

**The binding sequence is incorporation → NTN → merchant agreement**, because the
aggregator contracts with a registered company holding a tax number. **Nothing on
the critical path is engineering work.**

### Gate 3 — scale via partner

Never buy an EMI or NBFC licence. Reach anything requiring one through a partner
who already holds it.

---

## 3 · Stage 2 — the licence it actually needs

An **SECP mutual-fund distributor registration** — a simplified registration
permitting distribution of multiple AMCs' funds.

- **Not EMI**, because Halqa holds no balances.
- **Not NBFC**, because Halqa deploys no funds.
- **Investment-adviser licensing avoided** by presenting an execution-only menu
  and recommending nothing.

The money path: **member → CDC collection account → fund units in the member's own
name.** The model already operates in market — Pakistan's first digital-only AMC
runs exactly this, CDC-custodied, with a Rs 1,000 minimum.

**NO BANK IS INVOLVED AT ANY STAGE.** Chairman directive, 28 July. See `04`.

---

## 4 · The nano-lending crackdown — the defining recent precedent

**Any Pakistani credit-adjacent product is now judged against this.**

### How the predatory apps worked

Loans of **Rs 1,000–25,000** over 7–90 days at up to **~220% APR**. The ticket was
too small to underwrite, so the model was: **don't screen, price for mass default,
make recovery cheap via social coercion.**

The recovery ladder: harvest contacts + gallery + SMS at install → reminders →
agent calls → **call the borrower's contacts to shame them** → **morph gallery
photos into obscene images sent to family** → app-to-app rollover debt spiral.

**Rawalpindi: Rs 13,000 borrowed → Rs 100,000 owed → suicide → FIA crackdown, 20+
arrests.**

### What got banned — most of it "even with consent"

**SECP Circulars 3, 10, 14, 15 of 2023 and 8 of 2024:**
- No contact-list or gallery access **even with consent**
- May contact **only a separately-consented guarantor**
- Single-app exposure cap **Rs 25,000**
- APR cap **10× the policy rate**, all-in
- Mandatory **Key Fact Statement**
- **Borrower data must stay IN Pakistan**
- Whitelist plus self-assessment to operate; SECP now publishes a live whitelist

**Google Play, 31 May 2023:** personal-loan apps **and facilitators** may NOT
access contacts, photos, precise location, phone numbers or external storage.
**Pakistan was named.** READ_SMS and call-log are default-handler only.
**400+ apps blocked** across 2023–24.

### The six consequences for Halqa

1. **Our "legal deterrence only, no surveillance or out-of-court pressure" red line
   is now a NAMED criminal pattern** — 400 bans, 20+ arrests. Cite it concretely;
   do not abstract it.
2. **Never request contacts, gallery, SMS, or precise-location-as-lender.** The
   shipped credit-alert listener is defensible **only** because it is: notification
   access not SMS, opt-in, parsed on-device, and uploads aggregates only. **Those
   four properties MUST be stated in plain words on the consent screen and the
   store listing.**
3. **Data residency** (in-Pakistan) binds licensed lenders. We are not one, **but
   our DB is in Singapore** — this becomes a migration the moment we touch anything
   lending-adjacent, or if the personal-data law generalises it.
4. **Our guarantor design is already compliant** — member-signed, member-to-member,
   never to Halqa; sponsor consent recorded at invitation time.
5. **Positioning — the best single line for any room:** *"They had to manufacture
   leverage over people they knew nothing about. We don't — the committee brings
   its own."* Those apps had to coerce because they lent to strangers with no
   collateral. We don't: the seat is collateral, exposure is capped at ~2
   installments, the circle is pre-existing, and the record is ETO-admissible.
6. **SECP chose whitelist, not prohibition** → a sandbox-friendly posture. **BUT
   anything lending-shaped is scrutinised on the RECOVERY MODEL first.**

---

## 5 · The hit-piece surface — the risk below the legal threshold

**For a trust-moat company the journalist threshold is BELOW the legal one.** A
devastating exposé is a bigger extinction risk than the regulator.

Things that are legal, survive Google and SECP, and would still end us:

| Risk | Headline it writes | Mitigation |
|---|---|---|
| **Selling consented goal-intent leads** | *"sells poor people's dreams"* | **Reframed to Goal Direct-Pay** — we negotiate a better deal, the merchant pays commission. Never a sold lead list. |
| **Late fees as Halqa profit** | *"profits when the poor fall behind"* | Route to circle pool on Shariah circles; keep low and visible elsewhere. |
| **Public default flag** | *"publicly shames missed payers"* — **rhymes hardest with the loan-app scandal** | **Keep the flag INTERNAL** (gates hosting and marketplace). Never a public wall, never visible outside the member's own circles. |
| **Non-removable salary anchor / payday pull** | *"drains wages, can't switch off"* | Add member-facing "why this protects you" and a **pause-with-reason that costs score, not access**. Never market it as inescapable. |
| **Hidden grace window** | *"conceals real deadlines to trap into fees"* | Frame as *"we forgive honest slips."* |
| Grey telemetry used extractively; 50% marketplace premiums; CNIC/face/GPS pile-up; Singapore data residency; targeting the financially stressed | Various | See the usage rule below. |

**The pattern:** anything that reads as **the platform extracting FROM the member**
(rather than protecting them) is the story regardless of legality.

**The defence is not secrecy** — secrecy makes the break explosive. It is building
*and framing* each mechanism as genuinely member-protective, so the honest answer
to a journalist is boring.

### 🔴 LIVE RED ALERTS — in the model now

1. **Intent-data sale** (mitigated by the Direct-Pay reframe, but the code and
   docs must follow)
2. **Public default flag** (must stay internal)
3. **"Can't turn off the pull"** (needs the pause-with-reason)

**Fix framing and mechanics before scaling.**

### The usage rule — business, not morality

> Grey telemetry is fine kept **INVISIBLE-AND-DEFENSIVE** (fraud, security, risk
> pricing). Never **VISIBLE-AND-EXTRACTIVE** (profiling inferred wealth for sale).
> The second is a hit-piece paragraph that kills the trust moat even though it is
> perfectly legal.

---

## 6 · The regulatory strategy — first clean actor

### The precedent pattern

- India regulated after **Saradha** (2013) → Banning of Unregulated Deposit
  Schemes Act 2019 → the first digital-native chit operator remains sub-scale a
  decade later.
- SECP built the digital-lending whitelist after the **nano-lending deaths**.
- **Pakistan will regulate digital committees after its first large platform
  fraud**, and the rules will be drafted around whichever operator is most visible
  at that moment.

### The two success templates

**Money Fellows** entered the **Central Bank of Egypt sandbox** before scale,
moving from grey market to formal recognition — which unlocked its bank
partnerships. **Hakbah** entered the **SAMA sandbox** and made the regulator its
first partner. **Both bought legitimacy cheaply by arriving early.**

### The move

Approach SECP **voluntarily**, before regulation arrives, while Akif Saeed is
mentoring. Present the architecture in full. Seek the **SECP Regulatory Sandbox** —
which explicitly permits **unregistered startups intending to register** to apply.

Put on the table the three lines no licence attaches to — no custody, no lending,
no pooling — and the **model clause** a future Pakistani committee framework needs:

> *A facilitator that never holds, guarantees, or auctions member funds, and
> provides records admissible under the Electronic Transactions Ordinance 2002, is
> a registrar of private arrangements, not a deposit-taker.*

**Whoever gets that sentence into the first consultation paper owns the category's
legal ground.** And note: **it cannot be written about a custodian** — every
competitor who might lobby against us is one.

### What India's statute teaches about scope

The Chit Funds Act 1982 regulates the **foreman** — the person conducting the chit.
In a Pakistani analogue, **Halqa's hosts would be the regulated persons, not the
platform**. And the auction family the Act really polices is one Halqa already
refuses. A record-only facilitator of non-auction, member-settled committees sits
outside every operative clause.

---

## 7 · What the Discipline Layer buys with the regulator

The four mechanisms in `03` C1 were specified as product design but read as a
compliance posture — and that is the point.

Set against SBP's **Business Conduct and Fair Treatment of Consumers Regulatory
Framework** (October 2025), which governs disclosure, delivery, complaints **and
termination**, Halqa can show:

- **Informed consent** captured biometrically after a mandatory cooling window
- A **documented, member-initiated termination path** with restitution arithmetic
  that is published rather than discretionary
- An **affordability gate stricter than the regulator's own** debt-burden ratio
  (33% vs 40%)
- A **hardship route** ending in a recorded statement and a waived fine rather than
  a collections call

**Read that list against the accusations that removed 400 lending apps — lending
beyond capacity, collecting by pressure, hoarding personal data — and it inverts
every one.** That is the substance behind the first-clean-actor approach: not a
claim of good intentions, but four mechanisms, each with a number attached.

---

## 8 · Legal instruments in the product

| Instrument | Status |
|---|---|
| **Weekly platform undertaking** (*iqrarnama*) — 10 clauses, 7-day expiry, adopted signature (typed name matching account + optional drawn PNG), SHA-256 + IP + timestamp | Live. **Lawyer-UNREVIEWED template.** |
| **Mutual member-to-member PG** — auto-signed at join; `/start` requires all members'. **Text says NOT TO HALQA.** | Live. **Lawyer-UNREVIEWED template.** |
| **Legal corpus v1.0-2026-07-20** — agreement (20 sections), privacy, cookies, ads, community, fees | Live |
| **Cheques (§489-F)** | **Dropped from the model** |

**Clauses in the undertaking:** liquidated demand → Order XXXVII, acceleration,
auto-collect + salary, TASDEEQ/DataCheck/eCIB consent + delegated credit check,
arbitration, linked accounts, record-only status.

### Four questions for counsel at Gate 2

1. SECP classification of the record-only model
2. TASDEEQ contributor terms and the consent wording the Credit Bureaus Act 2015
   mandates
3. Payroll-deduction formalities (for employer committees)
4. The tripartite trustee form for Stage 2. **Note the constraint found
   2026-09-22:** *ETO 2002* **s.31(1)(c)** excludes "a trust defined to the Trust
   Act 1882 ... but excluding constructive, implied and resulting trusts" from the
   Ordinance, so an express trust cannot be created or evidenced electronically.
   Any trustee form needs paper execution. Use contract, not trust, wherever the
   onboarding must stay digital.
5. Whether Halqa is a **reporting entity** under *AML Act 2010* s.2(xxxiv). The
   definition of "financial institution" in **s.2(xiv)** includes "any person
   carrying on" (d) money or value transfer and (xii) "carrying out business as
   intermediary". If it bites, s.7 STRs and s.7A CDD follow.
6. The **adverse-action duty** in *Credit Bureaus Act 2015* **s.31**: a user who
   restricts a member on the strength of a bureau report must hand over the report,
   the bureau's contact details, the statutory summary of rights, and a statement
   that the bureau did not make the decision. **Not built.**
7. Whether surfacing one member's `creditScore` to other members in a circle is
   authorised disclosure under **s.26** (fine up to Rs 5M, or 3 months, or both).

### Bureau access — the operative clause

Halqa is **not** a "credit institution" as defined in **s.2(l)** (banking company,
microfinance bank, financial institution, modaraba, leasing company, investment
bank, financing company, unit trust, NBFC, or a Federal-Government-notified body).
It therefore **cannot** use s.19(1)(a). Every pull must run through **s.19(1)(b)** —
"on written or electronic request or instructions of the debtor, to whom it
relates, received from such debtor or **through a duly constituted attorney
thereof**". Consumer-permissioned access is lawful and needs no licence, but the
consent wording and the attorney relationship are **product requirements**, not
paperwork.

---

## 9 · Shariah position

- **Non-Shariah features stay fully functional.** Halqa simply never *claims*
  compliance where it does not apply, and keeps a halal path adjacent. Labelling is
  about honesty, not pruning. See `04`.
- **Late fees on Shariah-labelled circles route to the circle's own pool**, not to
  Halqa — a fixed penalty retained as income is impermissible.
- **Shariah tiers permit zero-premium turn swaps only.**
- **Priority and Sigma tiers use a conventional early fee and are NOT
  Shariah-reviewed** — the consent text says so explicitly.
- **The auction family is refused** partly because the discovered price is interest
  in substance.
- **The gold-goal committee must be spot-settled** to be labelled Shariah —
  deferred gold-for-currency is riba under the majority *Bay' al-Sarf* view. Exact
  contract wording is **mufti-to-confirm** (AAOIFI Standard 57 edge case).
- **Net-off settlement is unobjectionable** on Shariah tiers — it is set-off of a
  debt, not a charge.

---

## 10 · Open regulatory risks

| Risk | Status |
|---|---|
| **DB password exposed in chat and NOT rotated** | Chairman said "forget it" — **on record.** Flag it; do not act. |
| **Demo seed data still in the production DB** (taha/halqa123 etc.) | **Wipe before real users.** |
| **Data residency** — DB in Singapore | Becomes a migration if we touch lending-adjacent activity or the PDP law generalises |
| **Undertaking and PG unreviewed** | Gate-2 budgeted item |
| **Committee classification by SECP** | Unresolved; the reason for the sandbox approach |
| **Google Play classification** | A committee is arguably peer-lending, and precise location is on Google's prohibited list for personal-loan apps. **Have the savings-app classification argument ready before Play submission; downgrade the home pin to coarse locality if it bites.** |
| **Sandbox exclusion II** | *SBP Regulatory Sandbox Guidelines 2025* bar "Similar product/solution already deployed in the market at commercial scale". JazzCash Committee launched 13 Aug 2026. Answer it on **mechanism**, and prefer applying jointly with the aggregator under **s.3.1(c)**. |
| **Prize draw vs PPC s.294-A** | `prizeDrawEnabled` exists in schema and create route (wizard hard-codes `false`). The second limb of 294-A punishes *publishing* a proposal to pay on the drawing of a lot. Keep it off, or take advice before marketing it. |

---

## 11 · Verification against the live product — 2026-09-22

The architecture above is sound. **The shipped code does not implement it.** Every
item below was confirmed in source, and the production API answers `401` (mounted)
rather than `404` on each route named.

| Finding | Where | Clause engaged |
|---|---|---|
| **Members pay members for position.** Turn marketplace ledgers a premium `debit buyer:external → credit seller:external`, Halqa takes 10% | `halqa-api/src/routes/exchange.ts` | SECP P2P definition — one member pays another for earlier money, Halqa is the online intermediary |
| **Early fee distributed to other members, "never to Halqa"** | `halqa-api/src/routes/committees.ts` (Sigma/Bazaar engine text) | Same. The exact inverse of the 2026-09-22 ruling |
| **Vault holds member balances that accrue a money-market rate** | `halqa-api/src/routes/vault.ts`, mounted unconditionally | *Companies Act 2017* **s.84(1)** — a deposit of money with a company |
| **Security deposits held with `accruedYieldPaisa`; payout holdbacks held** | Prisma `SecurityDeposit`, `PayoutHoldback` | **s.84(1)**, same |
| **`SIMPLE_MODE = false`** — the investment layer is NOT hidden | `halqa-web/src/config.ts:21` | The record says the vault was stripped from the UI. The flag that would strip it is off |
| Float sweep takes a 5% mudarib fee on idle pool days | `halqa-api/src/lib/sukoon.ts` | Managing others' money for a fee, and the money must sit somewhere |
| `custodyMode: BANK_CUSTODY` exists; consent text says custody is *simulated* | `routes/committees.ts`; gated by `SHOW_BANK_RAIL = false` | Correctly gated. Live EMI question the moment it is switched on |

**Remedy is removal, not drafting.** No sandbox application should be filed while
the code contradicts the application.

Yes boss
