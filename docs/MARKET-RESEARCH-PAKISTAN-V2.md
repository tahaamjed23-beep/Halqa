# HALQA — THE COMMITTEE ECONOMY OF PAKISTAN
## Full market research, second edition
*The committee system as it actually operates · the failure files · the success evidence · nine international precedents · market data · six customer personas · competitor teardowns · differentiation · charts. Pakistan-focused throughout. Terms in **bold** are in the glossary. Figures marked (~) are calibrated approximations from the cited sources; the source list is at the end.*

---

# PART A — THE COMMITTEE SYSTEM IN PAKISTAN (know the instrument before the market)

## A1. What it is called, and what it actually is
The same instrument answers to several names — **kameti** (Punjab/urban Sindh), **BC** ("beesi/bachat committee", the older Urdu usage), simply "committee" among office workers. Formally it is a **ROSCA** — rotating savings and credit association. One organiser (almost always a woman in household circles, a senior trader in bazaar circles) collects a fixed installment from every member each cycle and hands the whole pot to one member per turn until everyone has collected once.

## A2. The variants that actually exist on the ground (this is what most fintech decks miss)
- **Fixed-order kameti** — turn order set at formation, usually by need or seniority; the organiser typically takes turn 1 as her fee-in-kind (an interest-free loan for doing the work). The commonest household form.
- **Qura (lottery) kameti** — each month's recipient drawn by lot from those who haven't collected. Felt as fairer; religiously comfortable (no one "buys" priority); adds suspense that keeps engagement high. Our prize-draw and ballot features map to this native behaviour.
- **Bazaar/daily committees** — traders in cloth, sarafa (gold) and electronics markets run *daily-collection* committees (Rs 500–5,000/day) as working-capital machines; the organiser is often a respected market elder. Sizes reach 50–100+ members and pots run into tens of lakhs. This is the segment where committee = business finance, not household saving.
- **Value/commodity committees** — installments pegged to gold (tola committees) or paid in kind; a folk **inflation hedge** that shows the demand our gold-linked tier serves.
- **Office committees** — salaried groups deducting on payday; the highest-discipline segment (salary timing = payment timing), and the natural target for a payroll channel.
- **Double-shift structures** — one person holding 2–3 "hands" (shares) in a single committee, or membership in several simultaneous committees — which is exactly the **over-commitment** failure mode our simulation models at 8% of the population.

## A3. Typical parameters (what "normal" looks like)
| Parameter | Household kameti | Office committee | Bazaar daily |
|---|---|---|---|
| Members | 10–20 | 10–30 | 30–100+ |
| Installment | Rs 1,000–25,000/mo | Rs 5,000–50,000/mo | Rs 500–5,000/day |
| Pot | Rs 20k–3 lakh | Rs 1–10 lakh | Rs 50k–5 lakh/turn |
| Cycle | 10–20 months | 10–30 months | rolling |
| Organiser reward | turn 1 / respect | turn 1 or none | turn 1 + status |

## A4. Why Pakistanis trust it more than banks (the four honest reasons)
1. **Riba-aversion.** For a large share of the population, bank interest is haram; the committee is interest-free by construction. (This is why the Federal Shariat Court's court-ordered transition to an interest-free system matters — official timelines point to the late 2020s: the whole formal system is being dragged toward the committee's ethics, not away from it.)
2. **Social collateral beats paperwork.** Your neighbour knowing your family is stronger security, in practice, than a form. The economics literature (Besley–Coate–Loury, AER 1993) formalised why socially-embedded ROSCAs default so rarely without any legal enforcement.
3. **Commitment device.** People know they cannot save alone; the committee makes stopping socially expensive. Behavioural economics calls this a commitment device; aunties call it "warna paise urr jate hain."
4. **Zero friction.** No forms, no minimum balance, no branch visit, no literacy requirement. Any redesign that adds friction loses; this is why Halqa preserves the loop and only adds a spine.

## A5. Scale of the committee economy — the data
| Indicator | Figure | Source |
|---|---|---|
| Adults who have participated | ~41% | Oraan research cited in TechCrunch (2021) — 2021 baseline |
| Annual flow rotating in committees | ~US$5B (~Rs 1.4T) — **2021 baseline; likely understates 2025-26 nominal flows after the inflation wave.** A 2022 Dawn analysis (Tehseen Gilani, "The faults in our committees") independently estimated annual committee flows at ~**Rs 4 trillion** on its own assumptions — treating our US$5B figure as conservative | TechCrunch (2021); Dawn (2022, op-ed estimate) |
| Women's formal financial inclusion at the time | low single digits (~7% per 2020-22 industry estimates); Findex 2025 confirms large gender gaps persist | TechCrunch (2021); Findex 2025 |
| Preferred savings instrument among informal savers | committees rank first in inclusion surveys | Karandaaz/Findex-class surveys |
| Informal economy share of GDP | ~35–40% (commonly cited range; pin to a specific PBS/academic paper before print) | PBS/academic estimates |
| Currency in circulation (the cash economy committees swim in) | ~Rs 9+ trillion (cite the exact SBP monthly series before print) | SBP series |

## A6. How many people are actually in committees — the sizing pyramid (derived, not asserted)
*Investors distrust claimed market numbers and trust derivations. This one is built from stated inputs; every step is checkable.*

| Step | Figure | Basis |
|---|---|---|
| Population | ~240M | PBS |
| Adults (18+) | ~140M | PBS age structure |
| **Ever participated in a committee (41%)** | **~57M adults** | Oraan/TechCrunch participation rate × adults |
| **Currently active in ≥1 committee (est. half of ever-participants)** | **~25–30M adults** | conservative activity assumption; consistent with inclusion surveys ranking committees the #1 savings device |
| Households touched (avg ~1.5 active members/participating household) | **~15–18M of ~35M households** | derivation |
| Average active-member contribution implied | **~Rs 4,000–4,700/month** | check: Rs 1.4T annual flow ÷ 12 ÷ ~25–30M actives — plausible blend of Rs 1–5k household circles and larger bazaar/office circles ✓ |

The internal consistency is the point: the $5B flow, the 41% participation and a Rs 4–5k average installment all triangulate. If anything the flow figure (2021-era) understates today's nominal market after the 2022–23 inflation wave repriced installments upward.

**Demographic skews (from Oraan's user data + inclusion surveys):**
- **Gender:** organisers and members skew heavily female in household circles (Oraan: 84% women); bazaar/office circles skew male. Blended, women are a majority of participants — the mirror image of formal finance, where they're ~a quarter of account holders.
- **Age:** concentration in 25–50 (the saving-for-life-events years); qura committees skew younger, fixed-order skew older.
- **Geography:** urban + peri-urban dominant for cash circles (Karachi, Lahore, Faisalabad, Rawalpindi corridors); rural participation runs through commodity/gold variants and family networks. Every one of the 139 microfinance districts is committee territory.
- **Income:** the committee spans classes — Rs 500/day bazaar circles to Rs 100k/month professional circles — which is why our product had to be configurable (deposit coverage, tiers, pot sizes) rather than one-size.

**Chart — where Pakistan's household savings actually sit (directional):**

| Instrument | Relative usage | |
|---|---|---|
| Committees/kameti | very high | ████████████████████ |
| Cash at home | very high | ██████████████████ |
| Gold/jewellery | high | ██████████████ |
| Bank savings accounts | medium | ████████ |
| National Savings | medium-low | ██████ |
| Mutual funds/stocks | very low | ██ |

*The committee is not a niche — it is the incumbent savings system of the country. The formal instruments are the challengers.*

---

# PART B — GOOD CASES: what committees demonstrably achieve

- **Women's capital formation.** The overwhelmingly documented use-case: a home-based worker (stitching, food, parlour) uses her payout as the only lump-sum capital she will ever access — a sewing machine, a freezer, initial stock. Oraan's data (84% women, 170+ cities) confirms the gender skew persists online.
- **Life-event funding.** Weddings (the single biggest committee goal — our 20-month "shaadi fund" circles mirror an entrenched practice), school admissions (fee season = kameti season), Hajj/Umrah savings, home construction milestones ("committee per storey" is a real pattern).
- **Bazaar working capital.** Daily committees give traders inventory finance at zero interest with zero paperwork, faster than any bank SME desk. This segment's discipline (daily contact, business reputation at stake) is exceptional — and it is *completely unserved* by every digital committee product so far, including Oraan.
- **Discipline outcomes.** Field studies across ROSCA literature repeatedly find default rates in socially-embedded circles of ~1–2% — outperforming much of the subcontinent's *formal* microcredit in stress years. The instrument works; that's precisely why 41% use it. Halqa's pitch is never "your committee is broken" — it is "your committee deserves infrastructure."

---

# PART C — BAD CASES: the failure files (learn each; investors will cite them)

## C1. The organiser-flight frauds (custody failures)
- **The Sidra Humaid case, Karachi 2022 — Rs 420M (verified: Dawn, Express Tribune, Geo).** The definitive modern cautionary tale, and the details are the lesson. A social-media influencer with a home food business ran ballot committees across **117 WhatsApp groups** — hundreds of members, mostly home-based women entrepreneurs — **keeping no written records of depositors at all**. Monthly pots went to "ghost members" and family while everyone kept paying; when it collapsed she announced on social media she had "no means to pay," filed for bankruptcy, and went into hiding. Structurally a **Ponzi wearing kameti clothing** — possible only because one person held everyone's money with no ledger anyone could audit. Read our architecture against each verified fact: 117 WhatsApp groups → one auditable platform; no written records → an immutable double-entry ledger; ghost members → identity-gated membership visible to all; central collection → record-only, money never touches the organiser; "no means to pay" → graduated collateral posted *before* the first round. Cite this case by name in every meeting — it is the product-requirements document written by the villain.
- **The pattern behind it** is old: "committee committees" (organisers of organisers), neighbourhood collectors vanishing before the last turns, online kameti groups that dissolve mid-cycle. FIA cybercrime dockets have grown steadily as committees moved to WhatsApp — moving online *without infrastructure* made the custody problem worse, not better.

## C2. The religiously-framed investment frauds (trust-exploitation failures)
- **Double Shah, Wazirabad 2005–07 — tens of billions of rupees.** "Double your money in 15–30 days"; an entire district's savings evaporated. Not a committee — but it poisoned trust in *any* informal money scheme in Punjab for a generation.
- **The Modaraba/Mudarabah scandals, ~2013–14 — billions, fronted by religious figures**, largely in KP: fake "halal profit-sharing" vehicles exploiting exactly the riba-aversion that makes committees popular. **Direct lesson for Halqa:** claiming halal status falsely is the single fastest way to die in this market — hence our refusal to label anything Shariah-compliant without a scholar's sign-off, and the visible 🟠 "not Shariah-reviewed" quarantine. Our honesty labels are a *scar-tissue response to real history*, and should be presented as such.

## C3. The quiet, everyday failure modes (no headlines, constant losses)
| Failure mode | What happens | Halqa's specific answer |
|---|---|---|
| Early-taker default | collects pot, stops paying | graduated deposits + holdback + ordering + ban |
| Organiser dies/relocates | records lost, circle dissolves | the ledger survives people |
| Silent shrinkage | late payments compound; pots arrive short/late | enforcement + Safety Fund + auto-cover |
| Inflation erosion | late turns receive devalued rupees | patience tilt + gold hedge |
| Dispute ("I paid, she says I didn't") | no records; relationships burn | reference-tagged, double-entry records |
| Exclusion of the honest-but-unlucky | one bad month = social exile | grace window + auto-cover + rehabilitation path |

*The bad cases are not an argument against committees — they are the product-requirements document Halqa was built from.*

---

# PART D — INTERNATIONAL EXAMPLES: nine precedents, and what each proves

| # | Country | Case | Scale | The lesson for Halqa |
|---|---|---|---|---|
| 1 | **India** | **Chit funds** under the Chit Funds Act 1982 (amended 2019): registrars, licensed foremen, security deposits, commission capped (5%, raised to 7%) | multi-billion-$ regulated industry; giants like Shriram Chits and Margadarsi manage crores of subscribers | **The endgame exists**: committee → regulated financial instrument is a proven national trajectory. Also proves auction-pricing of turns at scale (our early-fee is the tamer cousin). |
| 2 | **India (contrast)** | **Saradha & similar "chit" scams** (~2013, ~₹2,500 crore) | mass losses, national scandal | These were **custody frauds wearing chit clothing** — unregulated collective schemes, not real chits. The distinction (instrument ≠ custody abuse) is your strongest defence line. |
| 3 | **Egypt** | **Money Fellows** — digitised gam'eya (the Egyptian kameti) — *live-verified July 2026* | **8.5M+ users, US$1.5B+ in transactions, profitable in Egypt; total funding >$60M including a $13M pre-Series C (2024/25)**; card issuance, credit layering | **The clearest proof the whole model works in a Muslim-majority, cash-heavy, inflation-prone economy directly comparable to Pakistan — at profitability.** Their sequence (digitise circles → add payments/credit) is the map. |
| 4 | **Indonesia** | **Mapan** (arisan platform), acquired by **Gojek** (2017) | millions of arisan participants | Big-tech *acquires* rather than rebuilds community-finance networks — the strategic exit precedent, and why wallets are likelier buyers than killers. |
| 5 | **USA** | **Esusu Financial** — reports informal/rent payments to credit bureaus — *live-verified July 2026* | raised **$130M at a $1B valuation** (2022, confirmed) | **The Credit-Passport thesis, validated at unicorn scale**: turning invisible payment discipline into bureau-visible credit files is independently a billion-dollar business — before any lending. Named after the West-African esusu. |
| 6 | **South Africa** | **Stokvels** — NASASA-recognised savings clubs — *live-verified July 2026* | ~11M participants across **~800,000+ groups**, ~R50B (~$3B)/yr | A national federation + recognition regime shows the *cooperative-formalisation* path (an alternative regulatory route worth knowing when talking to SECP). |
| 7 | **Kenya** | **Chamas** (+ Chamasoft-class tooling, M-Pesa rails) | hundreds of thousands of chamas; KES hundreds of billions | Mobile-money rails + group savings co-evolve; group accounts became a *bank product category* (chama accounts) — the white-label future in miniature. |
| 8 | **West Africa/diaspora** | **Susu/esusu/tontines**; collectors charge a fee to *hold* savings | centuries-old; susu collectors are licensed in Ghana | People will *pay* for committee infrastructure (susu collectors charge ~1 day's deposit/month) — evidence for the service-fee line. |
| 9 | **Korea (historical)** | **Kye** circles financed households and small firms pre-banking; largely absorbed by formal banking by the 1990s | once a dominant share of household credit | The century-scale arc: ROSCAs are *proto-banks*; whoever formalises them inherits their book. Pakistan is decades earlier on the same curve — that's the opportunity's size. |

**The composite proof:** Egypt proves the model in our twin economy; India proves the regulated endgame; the US proves the data layer alone is worth $1B; Indonesia proves the exit; Ghana proves people pay fees for it. No market with committee culture has produced the *full stack* (yield + protection + credit identity + receivables) — including Money Fellows. That stack is the open crown, and it is what Halqa already built in software.

---

# PART E — MARKET DATA & SIZING (the numbers an investor checks)

## E1. The financial-system backdrop
| Metric | Figure | Source |
|---|---|---|
| Population / adults | ~240M / ~140M | PBS |
| Unbanked concentration | 1 of 8 countries holding over half of the world's 1.3B unbanked (with India, China, Indonesia, Bangladesh, Egypt, Nigeria, Mexico); ~30-pt gender gap; women's phone ownership 24% vs 89% | World Bank Findex 2025 (verified) |
| The inclusion gap in one line | global account ownership hit **79%** (Findex 2025) and South Asia **78%** — while Pakistan's 180M+ adults sit at roughly **1-in-5 account ownership** (1-in-10 by stricter "financially included" measures, FinDev/Kantar) — the region's outlier and the world's densest unserved market | Findex 2025 / FinDev Gateway (verified) |
| Wallet reach (the rails) | JazzCash ~21M monthly active users; easypaisa ~18M MAU; **Easypaisa Bank granted Pakistan's first digital retail banking licence Jan 28, 2025** | TechJuice/Dawn/SBP coverage (verified) |
| Banking-sector deposits | ~Rs 30+ trillion | SBP |
| Islamic banking share | ~a fifth of the system, rising under the FSC's court-ordered interest-free transition (official timelines point to the late 2020s) | SBP |
| Microfinance | 12.34M borrowers (≈72% of ALL borrowers in the financial system) · Rs 604B loans (avg ~Rs 49k) · Rs 733B deposits · 4,145 branches | PMN MicroWatch Dec-2024 (bibliography should cite the exact issue) |
| Credit bureau coverage | eCIB ~12M borrowers vs **100M+ credit-invisible adults** | SBP/eCIB |
| Policy rate path 2025 | 13% → 12% (Jan) → 11% (May), held | SBP MPC |
| Raast | free instant P2P since 2021; billions of transactions cumulatively | SBP |
| Remittances | ~US$30B+/yr | SBP |
| Digital-bank licensees | Easypaisa Bank, Hugo, KT, Mashreq, Raqami | SBP (2023) |

## E2. Sizing funnel (honest, bottom-up)
| Funnel stage | Definition | Size |
|---|---|---|
| **TAM** | the committee economy's annual rotating flow | ~US$5B/yr (~Rs 1.4T) |
| **SAM** | digitally-organisable participants over ~5 yrs (smartphone slice of the 41% + host-assisted members) | 15–25M adults |
| **SOM (36–48 mo)** | host-led acquisition, MFB-partner scale | 0.25–1M members ≈ **Rs 11–45B balances** |

**Chart — what our balances mean to whom (the "material-to-an-MFB" chart):**

| Holder | Deposits | Halqa @1M members vs it | |
|---|---|---|---|
| Banking sector | ~Rs 30,000B | 0.15% | ▏ |
| MFB sector (all) | ~Rs 733B | **~6%** | ████ |
| One mid-size MFB | ~Rs 60–80B | **~60%+** | ████████████████ |

*Same Rs 45B, three audiences: invisible to HBL, strategic to the MFB sector, transformational to a single MFB. We pitch where the bar is long.*

## E3. Seasonality (from our 2025 calibration — when the market breathes)
| Month | Stress events | Committee implication |
|---|---|---|
| Jan | school admissions, winter bills, weddings | high stress + high demand (new-year circles form) |
| Mar–Apr | Ramadan → Eid-ul-Fitr → Shawwal weddings | lateness peak #1; gift-cash inflows too |
| Jun | Eid-ul-Adha (qurbani) | the single worst lateness month (our sim: 9.8% paper-arm late rate) |
| Jul–Aug | monsoon/floods + school fees | default peak (sim: worst month) |
| Sep–Oct | post-flood food inflation | recovery months |
| Nov–Feb | wedding season | highest circle formation + shaadi-goal demand |

---

# PART F — TARGET CUSTOMERS: six personas, properly drawn

## F0. Segment sizing — how many of each exist, and how many we can win
*(Population figures (~) from PBS LFS employment structure; "currently in committees" applies the participation pyramid from A6 to each segment's known propensity; "obtainable" is our 5-year host-led reach.)*

| Persona | Population (~) | Currently in committees (~) | Committee propensity | Our obtainable slice (5yr) |
|---|---|---|---|---|
| Organiser aunties (active hosts) | ~2–3M organisers | ~2–3M (definitionally) | — | 50–150k hosts → the whole funnel |
| Home-business women | ~4–5M | ~2.5–3M | very high | 300–600k |
| Salaried lower-middle | ~25M employees | ~8–10M | high (office circles) | 400–800k |
| Bazaar traders/shopkeepers | ~6–7M | ~3–4M | very high (incl. daily circles) | 150–400k |
| Young gig/freelance | ~3–4M | ~0.7–1M | rising | 100–300k |
| Upper-middle professionals | ~2–3M households | ~0.8–1.2M | medium-high | 50–150k |
| **Total obtainable** | | **~25–30M active nationally** | | **~1–2.4M members** — matching the SOM |

The mapping to revenue: 1M obtained members ≈ Rs 45B balances ≈ Rs 16–19 crore/month (v5 model) — i.e., **winning just ~4% of currently-active committee members** builds the full-scale business. The market does not need to be created or even grown; it needs to be *equipped*.

**F0. Segment sizing first (how many of each exist, and how many we can win):**

| Persona | Population in segment (~) | Est. currently in committees | Our 5-yr obtainable | Value per member |
|---|---|---|---|---|
| Organiser aunties | 3–4M women organise circles | nearly all | 100–300k hosts | keystone: each = 6–20 members |
| Home-business women | 4–5M home-based women workers (LFS) | 2–3M | 0.5–1M | high discipline, medium balance |
| Salaried lower-middle | ~25M employed formal-ish | 8–10M (office circles) | 0.5–1M | steady, payroll-linkable |
| Bazaar traders | 6–7M retail/wholesale workers | 2–3M (incl. daily circles) | 100–300k | largest balances, receivables demand |
| Young gig/freelance | 2–4M | <1M (thin participation) | 200–500k | longest LTV runway, cheapest CAC |
| Upper-middle professionals | 2–3M households | 1M+ (large-pot circles) | 50–150k | biggest rupee-days per head |

Blended, the obtainable pool behind our 0.25–1M member SOM is ~1.5–3M realistically reachable members through host-led growth — meaning the SOM assumes winning only **a sixth to a third of the reachable pool**, not the market. That head-room is what makes the funnel defensible in diligence.

**F1. The Organiser Auntie (the keystone — she is distribution).** 38–55, urban/peri-urban, runs 1–3 committees of 10–20 women, keeps records in a diary, WhatsApp group per circle; her currency is *izzat* (reputation). Pain: chasing late payers strains friendships; one default lands on *her* honour; the diary is the single point of failure. Halqa's offer: the app chases so she doesn't have to; reputation card grows her standing; host tools; she pays nothing (host-free). **Win her = win 6–20 members at once; CAC ≈ a demo over chai.**
**F2. The Home-Business Woman.** 25–45, stitching/food/parlour, income Rs 30–60k, saves for equipment and children's fees; phone-comfortable, bank-shy (or bank-refused). Best discipline profile in our sim (0.53% paper default — better than salaried men). Offer: protected saving + first-ever credit identity → the Passport is her business's birth certificate.
**F3. The Salaried Clerk/Teacher/Driver.** 25–50, Rs 40–90k, has a salary account he barely uses beyond withdrawal; joins office committees. Offer: payday-aligned circles, early-bird rewards for his punctuality, credit file toward a future motorcycle/house loan. Later: the payroll channel makes him near-zero-risk.
**F4. The Bazaar Trader.** 30–60, karyana/cloth/spare-parts, cash businesses, Rs 30–150k, runs *daily* committees for stock. Under-served by every digital player. Offer: receivables → working-capital financing (the origination line), high-frequency circles, gold hedge (traders think in gold). Hardest UX (cash-native), highest value per user.
**F5. The Young Gig Rider/Freelancer.** 20–30, Rs 35–70k volatile, fully digital, completely thin-file. Offer: the Passport as his first credit artifact; vault as his first savings product; app-native onboarding. Highest churn risk, cheapest to acquire, longest LTV runway.
**F6. The Professional Circle (upper-middle).** Doctors/engineers/importers, Rs 150k+, pots to Rs 500k+, financially literate, yield-sensitive. Offer: Sigma-tier returns, allocation layer, gold, big-pot protection (deposits + Safety Fund). Smallest segment, largest balances per head — disproportionate share of **rupee-days**.
*(Later: the Diaspora Brother — remit-to-committee against the $30B corridor; wedding/education goals are literally what remittances fund.)*

---

# PART G — COMPETITOR TEARDOWNS

## G1. The paper committee (incumbent, ~99% share)
Price: free. Trust: native. Distribution: total. **Weaknesses:** 0% recovery, 0% yield, 0 records, organiser-dependency, inflation losses on late turns. **Our line:** we don't compete with her circle — we equip it. The moment the pitch sounds like "replace your kameti," we lose; the pitch is "your kameti, with a spine."

## G2. Oraan (the licensed pioneer) — *live-verified July 2026*
Founded 2018 (Halima Iqbal, Farwah Tapal); first women-led fintech seed (~$3M, 2021); **SECP-registered** (NTN 5039622-0; NBFC licence SECP/LRD/107/OFSPL/2023). **Current scale (their own claim, verified on oraan.com / Play Store): 600,000+ women saving through committees and gold installments** — a ~60× jump from the 10k of the 2021 press cycle, and the single most important market fact in this document: **digital committees have crossed from experiment to mass adoption, and Oraan proved it with our exact demographic.** Plans: 5 or 10-month committees from ~Rs 1,000/month; gold installments as a second product; "fee calculator" pricing; heavy fraud-protection messaging. **Model:** service-fee facilitator; backend-matched circles which Oraan itself underwrites. **Strengths:** licence + scale + brand among urban women; category education already paid for. **Structural weaknesses (unchanged by scale):** (1) fee-based revenue — no yield engine, and adding one cannibalises the fee (**innovator's dilemma**); (2) stranger-matching discards social collateral, so default risk sits on Oraan's own book and grows with scale; (3) blanket "Shariah-compliant" marketing vs our granular per-feature labelling — in a post-Modaraba-scandal market, *specific* honesty beats broad claims under scrutiny; (4) no credit passport, no receivables/institutional products — the layers where the real economics live. **Posture:** public respect, always — their 600k users de-risk our category better than any slide we could make; our pitch is the *depth* they structurally can't add.

## G3. Wallets — JazzCash / easypaisa (the distribution giants) — *live-verified July 2026*
Verified scale: **JazzCash ~21M monthly active users; easypaisa ~18M MAU (~14M app users)** — and on **January 28, 2025 Easypaisa Bank received Pakistan's first digital retail banking licence**, adding nano-loans, savings, insurance and disbursements to its wallet. **Verified absence:** neither wallet currently ships a real committee product — searches surface no live kameti feature at either. That absence is strategic information: the two players with the most distribution in the country have looked at this category (both have piloted adjacent savings features) and not built the machine — because a committee feature inside a wallet is a *record-keeper*, not an underwriting machine (no graduated collateral, no ordering, no yield engines, no receivables layer), and the wallet era's own lesson (SimSim: free + first, still lost) is that features don't beat community distribution. **Realistic relationship:** rails today, white-label licensees or acquirers tomorrow (the Gojek–Mapan precedent). **The real risk, sharpened by 2025:** Easypaisa Bank now has the *licence class* to do custody-committees seriously if it chooses — our answer is speed, the assurance layer (slow to copy), the host network (can't be bought in a sprint), and being cheaper to partner with than to replicate.

## G4. MFBs & digital banks
Own licences, deposits, field forces; lack host networks and committee software. Deposit-hungry (concentration problem) and data-hungry (thin-file underwriting). **Classified as buyers, not rivals** — the entire v5 business model sells to them. Watch item: an MFB building in-house; same answer as G3.

## G5. Register-keeper apps & WhatsApp — *live-verified July 2026*
A verified cluster now exists: **Kameti.pk** (online committee management, payment tracking, withdraw-date assignment), **Kameti – Digital Guru** (automated reports/notifications, App Store), **iKAMETI**, **Circlys** and similar. Every one of them digitises the *bookkeeping* and nothing else — no enforcement, no collateral, no yield, no credit identity, no custody protection. They matter for two reasons: (1) they prove organisers actively search for committee software (demand validation at zero marketing cost); (2) they are our cheapest acquisition pool — an organiser already using a register app has self-identified as our Organiser Auntie persona. WhatsApp remains the biggest "register app" of all — and the Sidra Humaid case ran on **117 WhatsApp groups with no written records**, which is the one-line proof that digitising *communication* without digitising *accountability* changes nothing.

## G6. Savings substitutes (fighting for the same rupee)
National Savings (~12–13%, paperwork, offices), bank term deposits (~11%, minimums, riba-perception), gold (beloved, illiquid, theft-risk), prize bonds (haram-debated, falling limits). None rotate liquidity, none carry social commitment. Our vault distributes several of them (trail income) rather than fighting them.

**The competitor matrix:**

| Capability | Paper | Oraan | Wallet feature | Register apps | **Halqa** |
|---|---|---|---|---|---|
| Native trust/distribution | ██████ | ██ | ████ | ██ | ████ (host-led) |
| Enforcement/protection | ▏ | ███ | ▏ | ▏ | ██████ |
| Yield on idle money | — | — | — | — | ██████ |
| Credit identity | — | — | — | — | ██████ |
| Receivables/bank products | — | — | — | — | ██████ |
| Shariah architecture | ████ | ██ | ▏ | ▏ | █████ |
| Licence today | n/a | ██████ | ████ | — | (path proven) |
| Price to member | free | ~Rs 1,000/mo | free | free | Rs 49/mo |

---

# PART H — WHAT SEPARATES US (the differentiation, sharpened)

1. **We digitise *existing* circles; everyone else replaces them.** Oraan matches strangers (and must eat the risk itself); wallets bolt on features. We inherit the social collateral instead of discarding it — the single deepest design difference, and the reason our protection stack works at all.
2. **The only yield engine in the category** — float sweep + remunerated collateral + patience tilt, at full published rates to members (the bank's Mudarib share sits upstream, as in any Islamic account; we take no second cut).
3. **The only credit-identity layer** — Passport now, eCIB at licence; Esusu's $1B valuation is the comp for this layer *alone*.
4. **The only receivables machinery** — packs, origination, servicing, institutional turn-market, securitization path: the lines that make *banks* pay us.
5. **Honesty as architecture** — scar tissue from Double Shah and the Modaraba scandals turned into product: 🟢/🟠 labels everywhere, penalties to charity, "guaranteed" appearing nowhere. In this market the drawn line *is* the brand.
6. **Assurance as the slow-to-copy moat** — 283 automated end-to-end checks, paisa-exact double-entry, decision-paired 100k+ simulations. Screens copy in weeks; *assurance* is months of judgment — and it's what bank due-diligence actually audits.

---

# PART I — THE SIMULATION (the evidence, summarised for this report)
120,000 synthetic members / 10,441 committees calibrated to HIES/LFS incomes, living **real calendar 2025**: Ramadan and both Eids, school-fee months, the July–August floods (rural-weighted), wedding season (~9% of households hosting a shaadi at 4–10 months' income), medical/funeral/job-loss shocks, the actual SBP rate path and CPI. **Decision-paired dual-arm design:** the same people live the year twice — paper vs Halqa — with every random event identical across arms, so outcome gaps are *caused*, not lucky; fully deterministic and re-runnable. **Results:** defaults **2.48% → 0.99%** (2.5×), recovery on default **0% → 75.3%**, on-time **91.5% → 94.0%**, wedding-goal completion **84.0% → 86.1%**, worst segment (over-committed) **10.4% → 0.94%**, ~**Rs 69.7M** member yield at real 2025 rates. Lateness peaks at Eid-ul-Adha; defaults peak in the floods — the model bleeds where Pakistan bleeds, which is the credibility check. Full methodology + defence: `docs/SIMULATION-2025-REPORT.md`.

# PART J — EXPECTED PROFITS (channel model v5, summarised)
| Scale | Balances | Halqa/yr | Monthly |
|---|---|---|---|
| 250k members | ~Rs 11B | ~Rs 530–570M | ~Rs 4.4–4.8 crore |
| 1M | ~Rs 45B | ~Rs 1.9–2.3B | ~Rs 16–19 crore |
| 2M | ~Rs 100B | ~Rs 4.2–5B | ~Rs 35–42 crore |
Majority institution-paid (bank channel commission, receivables fees, AMC trail, data); member pays Rs 49/month; member profit share untouched. Line-by-line: `docs/BUSINESS-MODEL-V5.md`.

# PART K — RISK REGISTER (market-side)
Licence timing (record-only bridges; Oraan precedent; raise sized for it) · wallet entry (assurance moat + white-label conversion; Mapan exit precedent) · rate compression (majority-rate-independent fee mix) · trust cold-start (record-only = zero custody trust needed; host-led) · Shariah scrutiny (labels + board milestone; Modaraba-scandal scar tissue as narrative) · a second Sidra-Humaid headline hitting the *category* (our answer: that fraud is architecturally impossible here — publish the explanation *before* the next scandal, own the trust narrative).

---

## GLOSSARY
**ROSCA** — rotating savings and credit association; the committee's formal name. **Kameti/BC/gam'eya/arisan/chama/stokvel/tanda/susu/kye** — the same instrument in Pakistan/Egypt/Indonesia/Kenya/South Africa/Mexico/West Africa/Korea. **Qura** — turn-by-lottery variant. **Social collateral** — community pressure as security. **Commitment device** — a structure that makes stopping your own saving costly. **Ponzi** — paying old participants with new participants' money; requires custody + opacity. **Foreman** — India's licensed chit organiser. **Chit Funds Act 1982** — India's regulation of committees; the "endgame exists" precedent. **NBFC/MFB/EMI/digital bank** — SECP non-bank licence / microfinance bank / wallet licence / SBP's new full-digital licences. **eCIB** — the State Bank's credit bureau. **Thin-file/credit-invisible** — no formal credit history. **Findex** — World Bank financial-inclusion survey. **PMN MicroWatch** — the microfinance sector's quarterly datasheet. **CASA** — cheap, stable current/savings deposits. **Deposit concentration** — reliance on few large depositors. **TAM/SAM/SOM** — total/serviceable/obtainable market. **Rupee-days** — balance × time earning; our scale metric. **Innovator's dilemma** — incumbents can't copy what cannibalises their revenue. **Receivables/securitization/sukuk** — money due to arrive / bundling it into tradeable paper / the Islamic certificate form. **Trail commission/bancassurance** — recurring distribution fees paid by AMCs/insurers. **FSC riba directive** — the court-ordered move to interest-free banking (official timelines point to the late 2020s). **s.489-F** — criminal liability for bounced cheques; post-licence enforcement tool. **Agent-based simulation / decision-paired dual-arm** — modelling individuals and running identical random lives through two worlds so differences are causal.

## VERIFIED SOURCES & CALIBRATION NOTES
*This appendix reflects two independent verification passes: our own live web verification (July 2026) and an external source-by-source audit of the full document (July 2026). Facts are grouped by confidence, and the calibration notes state exactly how each softer figure should be read.*

### Tier 1 — Independently confirmed by both passes (cite confidently)
- **Oraan:** 600,000+ women saving via committees and gold (2026 public materials); SECP-registered, NBFC licence SECP/LRD/107/OFSPL/2023; founded 2018 by Halima Iqbal & Farwah Tapal; $3M seed (2021, TechCrunch).
- **Sidra Humaid fraud:** Rs 420M, 117 WhatsApp groups, no written records, no means to repay — Dawn ("Gullible depositors lose Rs420m"), Express Tribune, Geo.
- **Global Findex 2025:** 79% global account ownership (+28pp since 2011); 1.3B unbanked with eight countries holding over half (Pakistan among them: Bangladesh, China, Egypt, India, Indonesia, Mexico, Nigeria, Pakistan); South Asia ~78%; large persistent gender gaps.
- **Pakistan inclusion:** ~1-in-10 effectively included under stricter measures (FinDev Gateway framing, 180M+ adults); ~30-pt gender gap consistent with Findex.
- **Easypaisa Bank:** first Digital Retail Bank licence, SBP, January 28, 2025 (SBP press release + multiple outlets).
- **Wallets:** JazzCash ~21M MAU, easypaisa ~18M MAU (2025 trade coverage; within reported ranges).
- **Money Fellows (Egypt):** 8.5M+ users, US$1.5B+ transactions, profitable in Egypt; >$60M total raised including $13M pre-Series C (2024/25).
- **South Africa stokvels:** ~11M members, ~800,000+ groups, ~R50B/yr; NASASA as the recognised body (multiple 2024–26 sources).
- **Esusu Financial (US):** $130M Series B at $1B valuation (2022); credit-passport thesis at unicorn scale.
- **India:** Chit Funds Act 1982 (amended 2019) — licensed foremen, security deposits, capped commissions; large licensed operators (Shriram Chits, Margadarsi) at multi-billion-dollar scale.
- **Register-app cluster:** Kameti.pk, Kameti – Digital Guru and similar exist as bookkeeping-only tools (Play Store listings).
- **Academic foundation:** Besley, Coate & Loury, *American Economic Review* 1993 — canonical ROSCA economics and social collateral.

### Tier 2 — Confirmed but time-stamped (state the provenance when citing)
- **~US$5B (~Rs 1.4T) annual committee flow and 41% ever-participation:** Oraan research cited in TechCrunch (2021). A **2021 baseline** — likely understates 2025–26 nominal flows after the inflation wave. Independent support: Dawn op-ed (Tehseen Gilani, 2022, "The faults in our committees") estimates ~**Rs 4 trillion**/yr on its own assumptions — a credible op-ed estimate, not an official statistic, but it brackets our figure from above.
- **Women's ~7% formal inclusion:** a 2020–22 industry estimate repeated at the time of Oraan's raise; no clean 2025/26 source states it verbatim. Cite as "low single digits per 2020–22 industry estimates" and lean on Findex 2025's gender gap for the current picture.
- **FSC riba transition:** the judgment and appeal/implementation process are real; phrase the horizon as "official timelines point to the late 2020s," not a specific year.

### Tier 3 — Uncontroversial but needing a pinned citation before print
- **Informal economy ~35–40% of GDP** (attach the specific PBS/academic paper).
- **Currency in circulation ~Rs 9+ trillion** (attach the exact SBP monthly series and date).
- **Microfinance sector table** — 12.34M borrowers, Rs 604B loans, Rs 733B deposits (attach the exact PMN MicroWatch issue, Dec-2024).
- **Country colour on Korea kye, Ghana susu licensing, Kenya chamas/M-Pesa** — descriptions accurate per development-finance literature; add per-country citations only if hard numbers are quoted.

### Derivations (ours — internally consistent, keep inputs' provenance visible)
- **Sizing pyramid** 240M → ~140M adults → ~57M ever (41%) → ~25–30M active: arithmetic on the 2021 participation base; implied ~Rs 4,000–4,700/month per active member triangulates cleanly against the flow estimate.
- **Rs 45B balances at 1M members:** consistent with ~Rs 4,000–4,500 average contributions and 10–12 months in-system, on inflation-repriced installments.

Figures marked (~) throughout are calibrated approximations.
