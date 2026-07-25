# Halqa — Meetings & Market-Findings Report
### Everything we've learned: the Akif meetings, the model to build on, and the research
### Version 1.0 · July 2026 · Internal + shareable

> This is the evidence-and-conversations record behind Reports 1 and 2. It captures,
> in detail, what Akif Saeed (SECP Chairman) told us across two meetings, the model we
> must build upon, and every verified market finding — Oraan, Money Fellows/Egypt, the
> investment and payment rails, and the regulatory picture — with sources. Where a fact
> could not be confirmed it is marked **[UNVERIFIED]**; where a finding *corrects* an
> assumption, it is called out.

---

## Part I — The meetings

### 1 · Meeting 1 — Akif Saeed, SECP Chairman (record-only framing)

Context: Akif Saeed is the **sitting Chairman of the SECP** — ex-Commissioner
(Securities Market), ex-ADB, ex-AmEx corporate banking. He knows the NBFC / EMI / AMC /
CIS regimes cold. The first meeting was mentorship, not a pitch: the prize is guidance,
credibility, and access to the **regulatory sandbox** — he does not invest.

What we established and verified in/around that meeting:
- **Record-only keeps us out of the heavy regimes.** Because Halqa never holds the pot
  (money moves member-to-member on a double-entry ledger), we do **not** trigger the
  **EMI** licence (only needed to hold/issue e-money) or the **NBFC lending** licence
  (only needed to lend) — as long as we stay a facilitator.
- **The two committee killers**, in his own framing: the **operator who absconds** with
  the pool (Karachi ~Rs 400m; the Indian chit-fund history) and the **early recipient
  who stops paying**. Our model must kill both.
- **Legal reality on default (verified):** there is **no debtors' prison** in Pakistan
  for civil debt. The only criminal route is **§489-F PPC** (a dishonoured cheque,
  ≤3 years) — and even that is punishment-only, not recovery. Asset recovery runs
  through an **Order XXXVII CPC summary suit** → decree → attachment & sale of assets;
  months if uncontested. So our enforcement is: signed instruments (undertaking + PG) +
  reputation + the fact that unproven members can't take early money at all.
- **The ask that mattered:** the **SECP Regulatory Sandbox**.

### 2 · Meeting 2 — Akif Saeed (the product direction) — the important one

He was **impressed** — called Halqa **"original,"** and recalled that the **Oraan
founders also came to him** for guidance. This meeting turned into a real design brief.
He *superseded* some of our earlier "never" constraints (no vault, no balance-sheet
risk) — but precisely, not loosely. Point by point, everything he said:

1. **"Don't worry about"** licensing, insurance, and the **TASDEEQ** bureau partnership
   for now — he treats those as solvable later.
2. **Investigate the investment rails** so we can offer savings/investment **without
   holding money ourselves**: **CDC** (Central Depository Company), **margin trading
   (MTS)**, **mutual funds**, and **linking to a licensed online AMC** — he named
   Pakistan's *first* online AMC (we identified this as **Mahaana**; see Part III).
3. **Bring the Vault back** (we had scrapped it). His logic: a member who keeps money in
   an in-built savings/investment vault **cannot really default** — on a miss, we settle
   the group out of *their* parked money.
4. **Auto-debit:** he asked, pointedly, *does it truly work?* — and **hinted that Raast
   is getting a proper auto-debit feature.** (We verified this — see Part IV.)
5. **The SECP sandbox can work** for us.
6. **Halqa must cover defaults on its own balance sheet** — *and* **insure** that
   exposure. (This is new vs our earlier "no company capital at risk.")
7. **Filtering / eligibility (his mentor's doctrine):** *don't build recovery
   enforcement — build a system where there is no incentive to default, or the
   consequences are so great nobody does.* The practical tool: **only show a member the
   committees they qualify for.** A high-pot, high-installment committee should require a
   **standard verified income**; students and housewives get smaller, tailored ones.
8. **Keep barriers to entry LOW** — simple yet efficient. Don't drown the small saver in
   paperwork.
9. **Separate CONSUMERS from SAVERS.** Savers → vault + AMC-trustee investment. Consumers
   → enforce **personal guarantee (PG)** and stronger terms.
10. **Study Money Fellows and Egypt** — what regulation *let it exist*, its regulator,
    its credit system, its default & recovery history. And he noted **Oraan was not
    SECP-licensed** and he was unsure how it legally runs (we found this needs
    correcting — see Part II).
11. **The build spine:** **onboarding → collection → pooling products → prevention →
    recovery.**
12. **He mentioned margin trading** in the context of the tradeable-turn idea — our read
    is he was pointing at the *regulated machinery* (clearing/settlement) that a market
    in positions requires (see Report 1 §4.4). **[UNVERIFIED — exact intent; confirm
    with him.]**
13. **In ~2 weeks:** deliver a **full product report** covering *everything* —
    cybersecurity to marketing — and Taha must be able to answer any question on it.

**How to read the supersession precisely:** the vault is allowed **because CDC (a
licensed trustee) holds the money, not Halqa** — so we keep the record-only "we don't
custody money" spirit while adding the feature. "Cover defaults on the balance sheet" is
genuinely new capital-at-risk, softened by the credit guarantee + takaful.

### 3 · Other feedback / pivots
Additional feedback ("Kazi" and related) is captured in our project memory
(`kazi-feedback-and-pivot.md`) and should be folded into the final report.
**[TO DO — integrate the Kazi feedback here; not reproduced in this pass.]** The
LinkedIn exchange with Akif (his stated concerns: default risk, insurance, credit
bureaus, and how record-only deposits work) is consistent with Meeting 2 above.

---

## Part II — The model we must build upon (the synthesis)

Akif's brief + our research converge on one architecture:

- **Saver vs Consumer is the spine.** A committee is two transactions — saving (late
  turns) and borrowing (early turns). Nearly all default risk is on the consumer side.
  Treat them differently: light-touch savers, secured consumers, and let the system
  *infer* which a member is from *when* they want their money and *which product* they
  pick — so it still feels like an ordinary committee (Akif's "keep it simple / don't
  over-engineer it away from a real committee").
- **Prevention over enforcement.** Eligibility filtering (only show what they can
  afford), position quarantine (new members → late turns), and **cross-product
  collateral** (a *pledged* vault, or the financed asset) do most of the work — invisibly.
- **The vault returns via CDC.** Savings are routed to a money-market/Islamic-income
  fund held by CDC, units in the member's own name — growth for savers, and a pledged
  buffer that self-cures defaults, all without Halqa holding money.
- **Recovery is a ladder** ending in balance-sheet cover + a credit guarantee (NCGCL) +
  legal deterrence (undertaking/PG → Order XXXVII; bureau reporting). **Legal deterrence
  only** — no surveillance / out-of-court pressure.
- **Three products that reinforce each other:** the Committee (core), the Vault (savers),
  Asset Committees (asset-collateralised). Plus Hyper "Bazaar" committees and Float as
  sandbox/later products.

This is the model Reports 1 and 2 detail.

---

## Part III — Market findings (verified, with sources)

### The market is enormous
- **~Rs 4 trillion (~US$5bn/yr)** rotates through informal committees — Pakistan's
  **3rd-largest savings channel**, with **34–41%** of adults having participated and
  **~90%** aware. Only **14%** of women hold a formal account; **85%** of adults rely on
  informal credit. Sources: [Dawn](https://www.dawn.com/news/1725956),
  [Dawn/World Bank](https://www.dawn.com/news/950117/committees-system-country-s-third-largest-savings-channel),
  [Karandaaz K-FIS 2024](https://www.brandsynario.com/karandaaz-releases-k-fis-2024-on-financial-inclusion-trends-in-pakistan/).

### Why people LOVE committees (efficiencies — we keep them)
Interest-free lump sum ([Besley–Coate–Loury, AER 1993](http://eprints.lse.ac.uk/1613/));
forced-savings commitment device
([Ashraf–Karlan–Yin](https://www.hbs.edu/ris/Publication%20Files/09-100.pdf)); no credit
history/collateral needed
([TechCrunch/Oraan](https://techcrunch.com/2021/09/26/oraan-raises-3m-to-increase-financial-inclusion-among-pakistani-women/));
social accountability
([Anderson–Baland–Moene](https://econ.cms.arts.ubc.ca/wp-content/uploads/sites/38/2013/05/pdf_paper_siwan-anderson-enforcement-organizational-design.pdf));
shields women's savings ([Anderson–Baland, QJE 2002](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=244530));
speed & simplicity; enables big indivisible purchases; cultural/religious fit (no riba;
only ~9% of the excluded trust banks) ([Karandaaz](https://www.brandsynario.com/karandaaz-releases-k-fis-2024-on-financial-inclusion-trends-in-pakistan/)).

### Why people FEAR committees (inefficiencies — we kill them)
Organiser absconds — **Sidra Humaid: ~US$2m from 200 women**
([Vice](https://www.vice.com/en/article/sidra-humaid-committee-scam-pakistan/));
**Karachi: Rs 420m** ([Dawn](https://www.dawn.com/news/1724659)); early taker stops
paying ([Besley–Coate–Loury](http://eprints.lse.ac.uk/1613/)); no legal recourse; **0%
return** while **~11–12%** inflation erodes value ([Dawn](https://www.dawn.com/news/1846983));
timing risk; illiquidity/rigidity; opacity/no record; trust breaks among online strangers.
**Key line:** there is **no aggregate default/fraud data** for informal committees —
because the system keeps no records. The opacity *is* the risk; our record is the product.

---

## Part IV — Competitor & rails findings (verified)

### Oraan (Pakistan) — CORRECTION to the meeting assumption
Akif thought Oraan was unlicensed. **It is not:** Oraan Financial Services (Pvt) Ltd
holds an **SECP NBFC "Investment Finance Services" licence, `SECP/LRD/107/OFSPL/2023`
(2023)** ([CxO Forum](https://news.cxoforum.global/oraan-obtains-nbfc-license-aiming-to-revolutionize-financial-inclusion-nationwide/),
[SECP IFS](https://www.secp.gov.pk/licensing/nbfcs/investment-finance-services/));
before 2023 it ran under the **SECP sandbox**. His uncertainty likely referred to that
earlier phase or the **SBP-side payment flow**. Most likely mechanic: a **technology
facilitator** routing money member-to-member via a bank/payment partner. **Do not repeat
"Oraan is unlicensed"** — say "we'll walk the same sandbox → NBFC path, but
guarantee-backed and CDC-custodied from day one."

### Money Fellows (Egypt) — the template
- **Egypt never legalised the gam'eya.** The **Central Bank's regulatory sandbox
  dedicated a cohort to ROSCAs**, giving Money Fellows a supervised operating authority
  ([AmCham Egypt](https://www.amcham.org.eg/publications/industry-insight/issue/89/financial-digitization)).
- **It holds no bank/EMI licence itself** — **Banque Misr (a state bank) holds the money
  and now issues its prepaid card** (Mastercard–Banque Misr–Money Fellows, Jan 2025)
  ([ffnews](https://ffnews.com/newsarticle/paytech/mastercard-banque-misr-and-money-fellows-collaborate-to-launch-prepaid-card-to-drive-financial-inclusion-in-egypt-through-online-money-circles/)).
  **This validates our "don't hold money — use a licensed custodian" design.**
- **Scale:** ~**US$1.5bn** processed, ~**350k** MAU, **profitable 2025**
  ([LaunchBase Africa](https://launchbaseafrica.com/2025/10/21/how-money-fellows-hit-profitability-by-digitising-egypts-informal-gameya-and-processing-1-5b/)).
- **Honest nuance:** Money Fellows publishes **no default rate**; the quoted "**7–8%**"
  is **empty-slot fill** funded by a **US$2.25m Symbiotics debt facility**, *not* a
  default figure ([Symbiotics](https://symbioticsgroup.com/press-release-money-fellow/)).
  So our "Halqa covers defaults" promise is *more* than they actually do — say so
  precisely.
- **Enablers Egypt had (and Pakistan's gaps):** a single willing regulator (ROSCA
  sandbox cohort), national rails for the unbanked (Meeza cards, Fawry agents, InstaPay),
  a state-bank custodian, and iScore for the formal segment. Pakistan's gap: no
  committee-specific sandbox cohort yet; eCIB closed to non-FIs; no Meeza-equivalent.

### Investment rails — CDC / AMC / Mahaana / MTS / yields
- **CDC (trustee) legally holds all fund money** in its own name; the AMC only manages —
  under the **NBFC Regulations 2008**
  ([CDC](https://www.cdcpakistan.com/businesses/trustee-custodial-services/),
  [MUFAP](https://www.mufap.com.pk/WebPost/WebPostById?title=100151)).
- **Money flow for the vault:** member → **CDC collection account** → **units in the
  member's own name**; Halqa is a **distributor**, never a custodian. Live precedent:
  CDC's own **Emlaak Financials**
  ([CDC](https://www.cdcpakistan.com/media-center/cdc-launches-new-fintech-initiative-of-mutual-fund-digital-platform-emlaak-financials/)).
- **Mahaana Wealth** = Pakistan's **first digital-only AMC** (the one Akif named),
  CDC-custodied; its site states *"Mahaana does not have direct access to your funds"*;
  Islamic Cash Fund min **Rs 1,000**, redeem 1–2 days
  ([Mahaana](https://www.mahaana.com/faqs)).
- **Licence to distribute funds = a light SECP *distributor registration*** — **not**
  EMI, **not** full NBFC
  ([SECP](https://www.secp.gov.pk/media-center/press-releases/secp-approves-simplified-regulatory-requirements-for-mutual-fund-distributors/));
  an *Investment Adviser* licence only if we *recommend* funds.
- **Fund yields:** Islamic money-market ~**10–11%** (mid-2026) vs 5–8% on a bank account
  ([MUFAP](https://www.mufap.com.pk/Industry/IndustryStatDaily?tab=1)).
- **Margin Trading (MTS):** run by NCCPL; relevance to us is **speculative** (deploying
  committee *float* as a secured Financier, later-stage; needs NCCPL membership)
  ([NCCPL](https://www.nccpl.com.pk/en/products-services/margin-trading-system-mts)).

### Payment rails — the honest auto-debit picture
- **True cross-bank auto-debit does not exist in Pakistan today — for anyone, including
  Oraan.** What works now: **Raast RTP** (one-tap approve, live on all banks since Mar
  2024), intra-bank standing instructions, 1LINK 1BILL (biller/wallet), card-on-file MIT.
- **Akif's hint is correct:** SBP's **Raast PISP "pull payment"** (one-time consent, then
  auto-pull) is **in testing, "launching very soon"** per the Raast CEO (Jun 2026)
  ([SBP](https://www.sbp.org.pk/press/2025/Pr-22-Feb-2025.pdf),
  [The News](https://www.thenews.pk/print/1422144-raast-projected-to-process-500bn-in-transactions-this-year)).
  The move: **build on RTP + card-on-file now; be first-in-line for PISP.**

### Regulatory — sandbox, and takaful vs credit guarantee
- **SECP Regulatory Sandbox:** four cohorts run; the **4th (2023) theme was Islamic
  micro/nano-finance and *"new takaful models"*** — essentially Halqa; **unregistered
  startups intending to register are explicitly eligible** (`sandbox@secp.gov.pk`); no
  5th cohort announced as of mid-2026
  ([SECP](https://www.secp.gov.pk/regulatory-sandbox/what-is-regulatory-sandbox/),
  [ProPakistani](https://propakistani.pk/2023/04/29/secp-announces-fourth-cohort-under-its-regulatory-sandbox/)).
- **CORRECTION on "insure the defaults":** **takaful covers death/disability only, NOT
  wilful default** (EFU, Pak-Qatar, Salaam — the last licensed digitally by Akif himself,
  May 2024). The instrument that covers actual default is a **credit guarantee**: Pakistan
  has **NCGCL** (2024; Karandaaz + Ministry of Finance), with a live **Rs 2.0bn
  PMIC–NCGCL** portfolio-guarantee precedent (Jan 2026)
  ([NCGCL](https://en.wikipedia.org/wiki/National_Credit_Guarantee_Company),
  [PMIC–NCGCL](https://pmic.pk/blog/2026/01/20/pmic-ncgcl-sign-a-loan-portfolio-guarantee-to-boost-financing-for-priority-sectors/),
  [Salaam Takaful/Arab News](https://www.arabnews.com/node/2511826/pakistan)).
  So the correct stack: Halqa first-loss → NCGCL-style guarantee → credit-life takaful as
  a member benefit.

---

## Part V — What Akif asked us to deliver, and where we stand

| He asked for | Status |
|---|---|
| Efficiencies vs inefficiencies of committees | Done (Part III) |
| Collection standards | Done (Report 1 §7 — the waterfall + Raast/PISP reality) |
| Default-prevention standards | Done (Report 1 §5 — eligibility filtering, quarantine, buffers) |
| A real recovery mechanism | Done (Report 1 §6 — ladder + asset repossession + guarantee) |
| Model-structure ideas | Done (Report 1 §4 + the earlier direction doc's 7 structures) |
| Study Money Fellows / Egypt | Done (Part IV) |
| Vault via AMC/CDC trustee | Done (Report 1 §4.2) |
| Cover + insure defaults | Done (Report 1 §6, §8 — guarantee vs takaful corrected) |
| The full 2-week product report | Report 1 is the spine; open items in Report 1 §16 |

---

## Part VI — Master source list
- Committees market/fraud: [Dawn $5bn](https://www.dawn.com/news/1725956) · [Dawn/World Bank](https://www.dawn.com/news/950117/committees-system-country-s-third-largest-savings-channel) · [Karandaaz K-FIS 2024](https://www.brandsynario.com/karandaaz-releases-k-fis-2024-on-financial-inclusion-trends-in-pakistan/) · [Vice/Sidra Humaid](https://www.vice.com/en/article/sidra-humaid-committee-scam-pakistan/) · [Dawn Rs420m](https://www.dawn.com/news/1724659) · [Dawn inflation](https://www.dawn.com/news/1846983)
- ROSCA economics: [Besley–Coate–Loury](http://eprints.lse.ac.uk/1613/) · [Ashraf–Karlan–Yin](https://www.hbs.edu/ris/Publication%20Files/09-100.pdf) · [Anderson–Baland–Moene](https://econ.cms.arts.ubc.ca/wp-content/uploads/sites/38/2013/05/pdf_paper_siwan-anderson-enforcement-organizational-design.pdf) · [Anderson–Baland QJE](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=244530)
- Oraan: [CxO Forum](https://news.cxoforum.global/oraan-obtains-nbfc-license-aiming-to-revolutionize-financial-inclusion-nationwide/) · [SECP IFS](https://www.secp.gov.pk/licensing/nbfcs/investment-finance-services/) · [Dawn seed](https://www.dawn.com/news/1648752)
- Money Fellows/Egypt: [AmCham Egypt](https://www.amcham.org.eg/publications/industry-insight/issue/89/financial-digitization) · [ffnews card](https://ffnews.com/newsarticle/paytech/mastercard-banque-misr-and-money-fellows-collaborate-to-launch-prepaid-card-to-drive-financial-inclusion-in-egypt-through-online-money-circles/) · [LaunchBase Africa](https://launchbaseafrica.com/2025/10/21/how-money-fellows-hit-profitability-by-digitising-egypts-informal-gameya-and-processing-1-5b/) · [Symbiotics](https://symbioticsgroup.com/press-release-money-fellow/) · [TechCrunch](https://techcrunch.com/2025/05/04/moneyfellows-raises-13m-to-take-its-group-savings-model-outside-egypt/)
- Investment rails: [CDC Trustee](https://www.cdcpakistan.com/businesses/trustee-custodial-services/) · [SECP NBFC Regs 2008](https://www.secp.gov.pk/document/non-banking-finance-companies-and-notified-entities-regulations-2008-updated-till-may-17-2023/) · [Mahaana](https://www.mahaana.com/faqs) · [Emlaak/CDC](https://www.cdcpakistan.com/media-center/cdc-launches-new-fintech-initiative-of-mutual-fund-digital-platform-emlaak-financials/) · [SECP distributor](https://www.secp.gov.pk/media-center/press-releases/secp-approves-simplified-regulatory-requirements-for-mutual-fund-distributors/) · [MUFAP yields](https://www.mufap.com.pk/Industry/IndustryStatDaily?tab=1) · [NCCPL MTS](https://www.nccpl.com.pk/en/products-services/margin-trading-system-mts)
- Payments: [SBP Raast Criteria](https://www.sbp.org.pk/press/2025/Pr-22-Feb-2025.pdf) · [Raast CEO/The News](https://www.thenews.pk/print/1422144-raast-projected-to-process-500bn-in-transactions-this-year)
- Regulatory/insurance: [SECP Sandbox](https://www.secp.gov.pk/regulatory-sandbox/what-is-regulatory-sandbox/) · [SECP 4th cohort](https://propakistani.pk/2023/04/29/secp-announces-fourth-cohort-under-its-regulatory-sandbox/) · [NCGCL](https://en.wikipedia.org/wiki/National_Credit_Guarantee_Company) · [PMIC–NCGCL](https://pmic.pk/blog/2026/01/20/pmic-ncgcl-sign-a-loan-portfolio-guarantee-to-boost-financing-for-priority-sectors/) · [Salaam Takaful](https://www.arabnews.com/node/2511826/pakistan)

*Full analyst briefs (verbatim, all URLs) are preserved in `RESEARCH-LOG-AKIF-2026-07-23.md`.*
