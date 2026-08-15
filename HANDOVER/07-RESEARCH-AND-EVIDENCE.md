# 07 · RESEARCH AND EVIDENCE

Every citable number and finding, with attribution. **Use these rather than
inventing figures.** Where something is modelled rather than measured, it says so.

---

## 1 · Market statistics — Pakistan

| Figure | Source |
|---|---|
| **13%** of adults hold a bank account | Global Findex (via Kamran 2017) |
| **36%** of Pakistanis save; only **4% of savers** use a formal institution | Financial Inclusion Insights (FII) |
| **63%** hide cash at home | FII |
| **33% of savers** use committees | FII |
| **37%** of adults used a committee | SBP survey |
| **12% of committee users have LOST MONEY** to organizer or member fraud | FII Wave 3 |
| **19%** use the pot for a one-time durable purchase | FII |
| **Only 31%** can send or receive an SMS | FII |
| Just over **half** own a phone | FII |
| **Women participate at 2× men's rate** | FII |
| **~100 million** Pakistanis lack formal financial services | World Bank |
| **~Rs 4 trillion** rotates through committees annually — the 3rd-largest savings channel | Dawn / press |
| **~52 million** adults participate (34–41% range) | Derived from SBP + population |
| **~41%** of Pakistanis have participated in a ROSCA; **~$5bn** rotates annually | Oraan's own research |

**Read the first two together:** only 13% have a bank account, and of those who
manage to save, 33% use a committee while 63% hide cash in the house.
**The committee is not competing with banks. It is competing with a cupboard.**

---

## 2 · The academic literature — five sources

Report: `docs/HALQA-ROSCA-LITERATURE-REPORT.pdf` (13 pp).
Four read in full or near-full text. Two links were blocked (Scribd, SciSpace 403)
and were found on open hosts; the Kamran paper was extracted from his 191-page
dissertation PDF using `pdf-parse` v2 (class API:
`new PDFParse({data}).getText()`).

### 2.1 · THE CENTRAL CONTRADICTION — and the resolution to always use

- **Khan (2013)**, *J. Economics & Sustainable Development* 4:19, fieldwork in Dera
  Ghazi Khan: regular income is a **PRECONDITION**; the poor are excluded as risky;
  *"ROSCAs cannot provide funding for the poor people and thus cannot substitute
  microfinance."*
- **Kamran (2018)**, dissertation, University of Jyväskylä: committees *"can neither
  substitute for the formal financial institutions."*
- **Kamran (2017)**, *EJBO* 22:2, 30 unbanked informants: committees GIVE control,
  and **not one informant had ever experienced a member default.**

**The resolution:** the committee filters on income **REGULARITY**, not income
**LEVEL**. Destitute/irregular → excluded (Khan is right). Regularly-earning
unbanked — a tailor on Rs 17k, a driver on Rs 22k → served well (Kamran is right).

> **STOP claiming we serve "the poorest" or that committees substitute for formal
> finance.** Both are disprovable in ten minutes. Say **"on-ramp to formal
> finance"** instead.

**Why this is good news:** the literature names income regularity as the binding
constraint, and the payday engine attacks exactly that variable.

### 2.2 · THE VALIDATION — Mehmood et al. (2018)

*"Save My Money: Digitizing Informal Savings in Pakistan"* — Information Technology
University Lahore + University of Washington, Gates Foundation and Karandaaz
funded.

They independently derived Halqa's architecture eight years ago:

> *"Holding money deposits is not allowed without a license, and therefore the
> money flowing in and out of the ROSCA app could be directed to an individual's
> mobile wallet with the ROSCA app serving as a conduit."*

**They also map four models:**
1. **Record-keeping app only** — the authors warn payment legitimacy *"can be
   questioned and subject to fraud, limiting usefulness for credit rating."*
   **This is why notebook competitors cannot build our asset.**
2. **Social groups, payments through wallets** — creates a real payment history
   usable for credit rating; default risk sits with members. **This is Halqa
   exactly.**
3. **Rating system connecting strangers** — our marketplace and public tier.
4. **Institutional ROSCAs** — a bank carries default risk. Excluded by directive.

### 2.3 · FINDINGS THAT CHANGED THE PRODUCT (Kamran 2017 interviews)

**1 · The committee protects money from RELATIVES, not just from yourself.**
> *"If you keep the money yourself, then when someone asks for money, you cannot
> refuse them… When the money is in someone else's possession, then people cannot
> ask for the money."* — Sami, 22, grocery shopkeeper

In a society where refusing a relative's request is socially costly, money at home
is not really yours. Putting it in a committee makes it **legitimately
unavailable** and gives you a socially acceptable way to say no. **Locked, and
visibly locked, is a feature people are actively buying.**

**2 · Committee payments outrank RENT.**
> *"I know that I have to pay the Committee instalment; it is necessary. We can
> compromise on rent or [utility] bills, but Committee [instalments] should not be
> missed."* — Bano, 36, housemaid, Rs 15,000/month

⇒ Committee repayment is the household's **HIGHEST-priority** obligation, so the
Sakh and Passport export **the hardest signal a family has** — not a weak proxy to
treat cautiously.

**3 · The organizer is guarantor of last resort.**
> *"They are our neighbours. They do not run away… Even if someone does run away,
> then the person who created the first Committee is responsible. It is his job to
> decide whether to accept someone into the Committee."* — Khan, 44, taxi driver

The organizer covers a defaulter **from his own pocket**. The person who *chooses*
the members bears the loss when they fail — cleaner incentive alignment than any
bank's underwriting.

⚠️ **This quote is also the basis for the corrected circle-authenticity design:
the organizer is the hub BY DESIGN.** See `03` C1i.

⚠️ **OPEN QUESTION:** our no-custody model removed this guarantee and we have not
decided whether to reproduce it or state plainly that seat arithmetic replaces it.

**4 · Locality is the fraud control.** Members assess **traceability, not
character**: *"if he is local, then we know he lives here. His house and shop are
here."*

**5 · Privacy anxiety is real.** Members fear carrying the pot home and fear
neighbours knowing it arrived and coming to ask for loans. **Digital settlement
solves both incidentally** — a benefit we would never have listed ourselves.

**6 · Emergency turn swaps and organizer discretion** are the informal relief
system; forbearance is rationed (*"once or twice… only genuine need"*).

---

## 3 · Theory that underpins design decisions

### Ghatak — joint liability and the peer selection effect

Where liability is joint and membership self-selected, **safe borrowers club
together and risky borrowers are screened out** — positive assortative matching,
achieved by borrowers' own local knowledge rather than the lender's underwriting.
**Joint liability functions as social collateral** substituting for physical
collateral, and works because peers monitor and sanction at a cost no institution
can match.

*Used for:* the mutual member-to-member guarantee, and originally for the (now
killed) leniency tier.

### Progressive / step lending — dynamic incentives

Borrowers repay to access a larger next loan. Broadly positive, **but with a
specific warning: escalating limits INCREASE liquidity defaults when the limit
outruns the borrower's actual repayment capacity**, particularly once borrowers
treat the limit itself as evidence of what they can afford.

⇒ **The rule taken from it:** good history unlocks better seats, more circles and
lower friction — **it NEVER raises the money cap.** Only new income evidence does.
Behaviour and capacity are different variables and must not substitute for one
another.

### Andrew Chen — the cold-start problem / atomic networks

Most marketplaces die because they need liquidity that does not exist yet. **A
committee is a pre-formed atomic network** — ten to fifteen people who already
trust each other, already do this monthly, and already have a leader. **We are not
assembling a network; we are digitising one that arrived complete.**

⇒ Every conventional metric is wrong for us. Measure **cost per organizer** (one
organizer delivers 10–15 pre-trusting members), **circles completed clean** (not
MAU), **circles per organizer** (his second circle re-acquires the whole group for
free), and **member-to-organizer conversion** (the only compounding loop).

### Hamilton Helmer — 7 Powers

Assessed honestly, Halqa holds three of seven with a path to a fourth:

| Power | Have it? |
|---|---|
| **Counter-positioning** | **Yes — the strongest.** See below. |
| **Cornered resource** | **Emerging.** Informal repayment data exists nowhere else in recorded form. |
| **Switching costs** | **Yes, compounding.** A member's Sakh is portable out but not reproducible on a competitor's platform. |
| **Network economies** | **Partial.** Strong within a circle, weak across circles until the marketplace has liquidity. **Do not overclaim.** |
| Scale economies | No — costs are near-linear |
| Branding | Not yet — years away |
| Process power | No |

**Counter-positioning — why incumbents rationally will not copy us:**
- **Custody competitors (Oraan, Money Fellows):** their float and regulatory
  investment are assets on the balance sheet. Adopting no-custody writes both off.
  They can add features; they cannot subtract their own model.
- **Banks:** cannot offer a zero-fee committee — it cannibalises the deposits and
  loans the committee competes with. **UBL is the live proof.**
- **The wallets (JazzCash, Easypaisa):** they are EMIs. Holding balances *is* their
  licence and their business.

> **Every serious competitor makes money by HOLDING money. We make money by
> RECORDING it.**

---

## 4 · Verified legal facts (Pakistan)

| Fact | Detail |
|---|---|
| **Minimum to operate legally** | SECP private-limited company via eservices.secp.gov.pk + FBR NTN (auto-integrated via IRIS). **Halqa currently has NEITHER.** |
| **Record-only needs NO licence** | EMI (SBP) only if you issue/hold e-money; NBFC lending licence (SECP) only if you lend; NBFC **Investment Finance Services** only if you pool and invest members' funds |
| **SECP Regulatory Sandbox** | Real, cohorts since 2020, and its rules allow **unregistered startups intending to register** to apply — the single best door Akif can open |
| **Jail?** | Signing a PG then defaulting is **CIVIL, NO JAIL**. The only jail route was **§489-F PPC** (dishonoured cheque, up to 3 years) — **cheques were dropped** — and even that is punishment-only (*"recovery cannot be made through this process"*). §420 fraud needs proven deception. **DON'T claim we can jail defaulters.** |
| **Asset recovery** | **Order XXXVII CPC summary suit** — our undertaking and PG qualify as a written contract/guarantee for a fixed sum; 10-day leave-to-defend; decree executable → attachment and sale of assets. **Needs a court decree first**; months if uncontested; cannot self-seize |
| **Electronic records** | Admissible under the **Electronic Transactions Ordinance 2002** |
| **SBP debt-burden ratio** | **40% of disposable income** for consumer financing — BPRD Circular Letter 29 of 2021, reduced from 50% (temporarily 60% during COVID) |
| **SBP conduct framework** | **Business Conduct and Fair Treatment of Consumers Regulatory Framework**, October 2025 — covers the full product lifecycle **including termination** |
| **SBP cooling period** | Two-hour hold on branchless-banking cash-outs, since April 2023 |

### Bureau access

- **eCIB (SBP's own):** membership restricted to regulated FIs. **Closed, full
  stop**, without becoming the NBFC/MFB we deliberately avoid.
- **TASDEEQ and DataCheck** (the two SBP-licensed private bureaus): no public
  signup; a bespoke negotiated contract. Under the **Credit Bureaus Act 2015**:
  - **Pull** (read scores with consumer consent) — doable as a subscriber.
    **Karandaaz, a non-bank, signed a TASDEEQ data agreement** — precedent it is
    possible.
  - **Report** (furnish) — a *non-credit-institution* furnisher historically needed
    Federal-Government notification.
- ⚠️ **2 August update (web-verified) — this softens the constraint materially:**
  TASDEEQ's own site states it ingests data from **non-financial "non-conventional
  sources — Utilities, Telecommunication, Insurance."** So Halqa can likely join as
  an **alternative-data CONTRIBUTOR** in that category — **no FI licence, no bank
  partner needed for the private bureau.** Bureaus run on **reciprocity**, so
  furnishing typically *earns* read access.
- **TASDEEQ scale is 200 (very poor) → 600 (excellent)**, not 300–850. Intermediate
  cutoffs are not public.
- **TO CONFIRM** with TASDEEQ commercial and counsel: (1) committee data qualifies
  under contributor terms, (2) exact consent wording the Act mandates, (3) whether
  furnishing default vs positive-only data changes the requirement.

### NADRA

- **Multi-Biometric Verification System (MBVS)** with facial recognition; APIs
  exposed to onboarded institutions via the **Nishan Pakistan portal** (2025).
- **Contactless biometric verification** was built for the banking and payments
  industry **at SBP's request**.
- Reported costs: facial-recognition certificate **Rs 20**; **Easypaisa charges
  users Rs 99 for a FAILED biometric check.**
- **Verisys** (CNIC check): needs a company and a signed agreement;
  invoice-based, unpublished (~Rs 30–75/check estimated); **deferrable past
  launch** since we already collect CNIC.

---

## 5 · Rail and cost economics

| Rail | Cost |
|---|---|
| Card (Safepay) | **3.3% + Rs 33** |
| Wallets (PayFast) | **1.5–3%** |
| **Raast** | **≈ 0%** (P2P free; P2M government-subsidised 0.5% capped Rs 100) |

```
Rs 20,000 installment:
  Card:    20,000 × 3.3% + 33 = Rs 693
  Wallet:                       Rs 300–600
  Raast:                      ≈ Rs 0

A 12-member circle, one full cycle on card rails = Rs 52,272 in fees,
with no member revenue to absorb it.
```

**Chairman's ceiling: no member ever pays more than Rs 300 to make a payment at
this tier.** Card is therefore not offered on standard circles.

**Other costs:** SECP incorporation — name Rs 1,000 + incorporation ~Rs 1,800–2,500;
DIY under Rs 5k, agents bundle to Rs 15–25k, 2–5 days. FBR NTN free. Company bank
account free + Rs 10–50k minimum balance. WhatsApp Business Cloud API free tier for
OTP; SMS Rs 2–3.5 only for non-WhatsApp users. Legal opinion Rs 50–100k.

**Gate totals:** Gate 1 (company) ~Rs 20–30k, two weeks. Gate 2 (real money)
Rs 80,000–180,000 over 4–8 weeks.

---

## 6 · Internal simulation results — MODELLED, NOT MEASURED

- Monte-Carlo plus a **120,000-agent Pakistan-calibrated agent-based model** on the
  real 2025 calendar.
- Defaults **2.48% → 0.99%** with the controls applied.
- Produces the **0.3–1.4% default band** quoted in reports.

> **These are models, not measurements, and must be labelled as such wherever
> quoted.** The band becomes a fact only when measured against the first hundred
> completed circles.

Report: `docs/SIMULATION-2025-REPORT.md`.

---

## 7 · The nano-lending crackdown — essential context

Full detail in `08`. The numbers:

- Loans **Rs 1,000–25,000**, 7–90 days, up to **~220% APR**.
- Recovery ladder: harvest contacts + gallery + SMS at install → reminders → agent
  calls → **call the borrower's contacts to shame them** → **morph gallery photos
  into obscene images sent to family** → app-to-app rollover debt spiral.
- **Rawalpindi: Rs 13,000 borrowed → Rs 100,000 owed → suicide → FIA crackdown,
  20+ arrests.**
- **400+ apps blocked** across 2023–24.
- SECP Circulars **3/10/14/15 of 2023 + 8 of 2024**: no contact-list or gallery
  access **even with consent**; may contact ONLY a separately-consented guarantor;
  single-app exposure cap **Rs 25,000**; APR cap **10× the policy rate** all-in;
  mandatory Key Fact Statement; **borrower data must stay IN Pakistan**; whitelist
  plus self-assessment to operate.
- **Google Play, 31 May 2023:** personal-loan apps **and facilitators** may NOT
  access contacts, photos, precise location, phone numbers or external storage.
  **Pakistan named.** READ_SMS and call-log = default-handler only.

---

## 8 · Comparable-company figures

| Company | Reported |
|---|---|
| **Money Fellows** (EG) | 8M downloads · 1M+ served · ~350k MAU · **$1.5bn processed** · 2M+ circles · **profitable 2025** · ~$60M raised · **<8% of slots need own capital** |
| **Hakbah** (SA) | 1.3M+ users · ~70% youth · ~$9M raised · SAMA sandbox |
| **Mapan** (ID) | GO-JEK acquisition 2017 · $15M later round · agent commission **10% electronics / 5% other** |
| **The Money Club** (IN) | 200k+ users · ~17,000 clubs · ~Rs 40 crore pooled · $1.7M pre-Series A |
| **MyPaisaa** (IN) | **<$980k raised** · ~20,000 installs |
| **Shriram Chits** (IN) | ~Rs 3,000 crore turnover · **2.2M subscribers** · 465 branches · **65,000 agents** |
| **Margadarsi** (IN) | **Rs 14,341 crore** turnover · **6M+ subscribers over 60 years** |
| **KSFE** (IN) | **680+ branches** · state-owned · **death waiver up to ₹10 lakh** |
| **Saradha** (IN) | **₹2,500 crore** · ~1.7M depositors → BUDS Act 2019 |
| **Esusu** (US) | **$130M Series B at $1bn**, Jan 2022, SoftBank Vision Fund 2 |
| **Mission Asset Fund** (US) | 6–12 per circle · $50–200/mo · $300–2,400 loans · zero interest · **average +168 credit points** |
| **Yahoo Tanda** (US) | ~37,000 installs · dead in 4 months |
| **StokFella** (ZA) | ~42,000 members in an R50bn / 11M-member market |
| **SadaPay** (PK) | Sold to Papara 2024, reported **sub-$50M** vs $120M prior valuation |
| **South African stokvels** | ~800,000 groups · ~11M members · ~R50bn |
| **Indian chit sector** | **$50bn+** |
| **Nigeria** | **38M+ adults** outside the formal financial sector |

---

## 9 · Verification status of the codebase

**As of 31 July 2026:**
- Both packages **type-clean**
- **60 of 60** unit tests passing
- **352 of 352** integration checks passing
- Web dependencies: **zero known vulnerabilities**
- Security posture assessed **B+**, no critical or high-severity code
  vulnerability found; open items are operational (see `10`)

Yes boss
