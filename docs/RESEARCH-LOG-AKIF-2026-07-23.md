# Halqa — Research Log (evidence base for the Akif direction)
### 23 Jul 2026 · five analyst briefs, verbatim, with every source URL

> This is the sourced evidence behind [MODEL-DIRECTION-AKIF-2026-07-23.md](./MODEL-DIRECTION-AKIF-2026-07-23.md).
> Keep it for the full product report's footnotes. Confidence / [UNVERIFIED] tags
> are the analysts' own. Headline facts, one line each:
>
> - **Vault is legal without an EMI/NBFC licence.** Money sits with **CDC (trustee)**,
>   units in the member's name, Halqa = **distributor** (SECP distributor
>   registration only). **Mahaana** = Pakistan's first digital AMC, CDC-custodied,
>   the model to copy. Islamic money-market ≈ **10–11%**.
> - **No true auto-debit in Pakistan today** (not even Oraan). **Raast RTP** = one-tap
>   now; **Raast PISP pull** = in testing, "very soon" (Raast CEO, Jun 2026).
> - **Egypt legalised the *platform*, not the gam'eya** — CBE sandbox's 2nd cohort was
>   for ROSCAs; **Banque Misr** holds the money. Money Fellows publishes **no default
>   rate** (the "7–8%" is vacancy-fill). $1.5bn processed, profitable 2025.
> - **Oraan IS SECP-licensed** — NBFC Investment Finance Services `SECP/LRD/107/OFSPL/2023`.
>   (Corrects the meeting assumption.) Sandbox admits **unregistered** startups.
> - **Takaful ≠ default cover** (death/disability only). Default is covered by a
>   **credit guarantee — NCGCL** (Rs 2bn PMIC–NCGCL precedent, Jan 2026).

---

# Brief 1 — Pakistan investment-custody rails (CDC / AMC / Mahaana / MTS / fund yields)

## 1. CDC as Trustee and Custodian — the AMC↔Trustee separation
Pakistan's mutual funds run on a mandatory three-party trust under the **NBFC
Regulations 2008** and **NBFC Rules 2003**: unit-holder (investor), AMC (manages),
Trustee (holds). **All fund cash and securities are registered in the Trustee's
name — the AMC has no custody.** CDC is the Trustee for most funds.
- "The Trustee performs the functions of the custodian of the assets of the fund
  whereas the Fund Manager takes the investment/operational decisions." — PSX.
- Trustee duties: safekeeping of all assets, daily NAV monitoring, compliance
  oversight, and all asset movements require Trustee involvement (AMC can't move
  assets unilaterally).
- If an AMC fails/defrauds, fund assets are ring-fenced in the Trustee's name and
  transferred to a new AMC in an orderly wind-down. Investor money was never on the
  AMC's books. Investor pays a **collection account in the Trustee's name**; units
  are allocated in the investor's own name.
- Sources: [MUFAP](https://www.mufap.com.pk/WebPost/WebPostById?title=100151) ·
  [PSX blog](https://www.psx.com.pk/psx/psx-blog-articles/what-is-a-mutual-fund-how-does-it-work) ·
  [CDC Trustee & Custodial](https://www.cdcpakistan.com/businesses/trustee-custodial-services/) ·
  [SECP NBFC Regs 2008 (upd. May 2023)](https://www.secp.gov.pk/document/non-banking-finance-companies-and-notified-entities-regulations-2008-updated-till-may-17-2023/)

## 2. Routing savings into funds without an EMI/deposit licence
Platform never holds money: investor → **Trustee (CDC) collection account** → units
in investor's own name → platform is pure **distribution/facilitation**.
- Confirmed by **Emlaak Financials** (CDC's own digital multi-AMC marketplace,
  2022) — distributes across AMCs without holding investor money.
  [CDC](https://www.cdcpakistan.com/media-center/cdc-launches-new-fintech-initiative-of-mutual-fund-digital-platform-emlaak-financials/) ·
  [Profit](https://profit.pakistantoday.com.pk/2022/08/05/emlaak-pakistans-first-mutual-fund-marketplace/)
- **Licence needed — SECP two-tier distributor framework** (2016, operative):
  Tier 1 single-AMC distributor = exempt from licence, needs IFMP certification;
  Tier 2 multi-AMC distributor = **SECP distributor registration** (not full NBFC),
  full IFMP certification. To *advise/recommend* funds → **SECP Investment Advisory
  Services licence** (public-ltd; industry cites PKR 50–150M equity [UNVERIFIED]).
  Digital KYC allowed since **SECP Circular 35 of 2020**.
- **SBP EMI licence NOT required** if the platform only routes payment instructions
  bank→Trustee and never stores client funds.
- Sources: [SECP simplified distributor rules](https://www.secp.gov.pk/media-center/press-releases/secp-approves-simplified-regulatory-requirements-for-mutual-fund-distributors/) ·
  [SECP Investment Advisory licensing](https://www.secp.gov.pk/licensing/nbfcs/investment-advisory-services/) ·
  [SECP digital account opening](https://www.secp.gov.pk/media-center/press-releases/secp-allows-digital-accounts-opening-for-mutual-fund-investors/)

## 3. Pakistan's first digital-only AMC — Mahaana Wealth
Mahaana Wealth Limited (inc. 0198242; Public Interest Co.), licensed as **AMC +
Investment Adviser NBFC**, **CDC-custodied**, MUFAP member, $2.1M pre-seed (Aug
2022). First under SECP's **Digital AMC framework** (reduced equity/fund-size
thresholds vs traditional AMC's PKR 230M min [UNVERIFIED exact figure]).
- Mahaana states: *"All of your funds are stored with the Central Depository Company
  (CDC). Mahaana does not have direct access to your funds."*
- Funds (all Shariah): **Islamic Cash Fund (MICF)** AA+f, **min PKR 1,000**,
  redeem 1–2 business days; Islamic Index ETF (PSX, Mar 2024); Income & Real Return;
  Retirement.
- Other players: Emlaak (CDC aggregator), Al Meezan (largest Islamic AMC), NBP
  Funds, UBL/Al-Ameen, JS Investments. Mahaana is "first" = full AMC licence +
  Digital-AMC category + digital-native (no branches).
- Sources: [Mahaana company info](https://www.mahaana.com/company-information) ·
  [Mahaana FAQs](https://www.mahaana.com/faqs) ·
  [ProPakistani — first digital-AMC fund](https://propakistani.pk/2023/04/27/first-fund-launched-under-digital-amc-framework-of-secp/) ·
  [PhoneWorld — Digital AMC framework](https://www.phoneworld.com.pk/secp-launches-digital-amc-framework-to-transform-pakistans-mutual-fund-industry/)

## 4. Margin Trading System (MTS) — PSX/NCCPL
Leveraged equity financing run by **NCCPL**: Financee posts ≥**15%**, Financier
funds **85%**, max markup **KIBOR+8%**, max **60 days**, ¼ auto-released every 15th
day, T+1 settlement, undisclosed market. Financiers can be brokers, banks/FIs (≥A3),
mutual funds, investment finance cos, or any corporate approved by NCCPL Board+SECP;
must be CDC participant + NCCPL clearing member.
- **Relevance to Halqa = speculative (analyst's honest call).** Most plausible:
  deploy the collection→payout **float** as a secured *Financier* (KIBOR+8%, 15-day
  auto-release aligns with a kameti cycle) — but needs NCCPL membership; later-stage,
  not near-term. Other reads: licence-study, MTS-style structured product, or general
  literacy. Direct retail relevance is unclear.
- Sources: [NCCPL MTS](https://www.nccpl.com.pk/en/products-services/margin-trading-system-mts) ·
  [PSX Margin Trading](https://www.psx.com.pk/psx/product-and-services/products/margin-trading-mt) ·
  [SECP MTS approval](https://www.secp.gov.pk/media-center/press-releases/securities-and-exchange-commission-of-pakistan-secp-approved-the-concept-of-margin-trading-system-mts/)

## 5. Retail fund yields / minimums / liquidity (MUFAP, ~Jul 2026)
Conventional MMFs ~**10.4–10.7%** 1-yr (ABL Cash, AL Habib Cash, Atlas MMF, NIT
MMF). Islamic MMFs ~**10.3%** 1-yr (ABL/AL Habib/NIT Islamic; Mahaana MICF ~10–11%
est.). Islamic Income ~**9%** (Meezan Islamic Income, etc.). Rate environment
falling from ~22% (2024) → ~10–11% MMF yields; NBP Islamic MMF 14.1% FY25.
- Minimums: Mahaana MICF **PKR 1,000**; most retail funds PKR 5,000 (SIP from 500);
  bank channel (SC) PKR 50,000. Redemption: MMFs daily, paid 1–3 working days
  (Mahaana 1–2; MUFAP says open-end redeemable ≤6 working days [UNVERIFIED exact
  reg]). ETFs T+2. Industry AUM crossed **PKR 3.93tn** (Jun 2025); Shariah funds up
  6.7× since 2019.
- Sources: [MUFAP performance](https://www.mufap.com.pk/Industry/IndustryStatDaily?tab=1) ·
  [Mahaana FAQs](https://www.mahaana.com/faqs) · [SC Pakistan mutual funds](https://www.sc.com/pk/wealth-solutions/invest/mutual-funds/)

---

# Brief 2 — Auto-debit / Raast reality

## Can a non-bank pull funds on a schedule today? Essentially no.
Framework = **PSEFT Act 2007** + SBP PSO/PSP rules. PSO (switching, no custody),
PSP (acceptance/gateway/initiation, routes through a bank), EMI (deduct **own wallet
balance** only, cannot pull a user's **bank account**). **No non-bank can debit a
bank account without per-transaction auth, absent a bank partner + mandate.**

**Works today:** (A) **intra-bank standing instruction** — LIVE, but set up at the
member's own bank, platform has no control; (B) **wallet auto-deduction** (Easypaisa/
JazzCash to 1LINK **1BILL** billers) — LIVE, wallet balance only, must be a
registered biller; (C) **card-on-file MIT** — LIVE but low card penetration. No SBP
e-mandate framework exists for bank-account pull.

## Raast — live vs roadmap
LIVE: Bulk/G2P (2021), P2P (Feb 2022), P2M + RTP "Now"/"Later" (Dec 2023, mandatory
for all REs Mar 2024), PISP participant category (Aug 2024; Haball first PISP;
K-Electric PoC Oct 2024), limited cross-border (2025).
- **"RTP Later" is NOT auto-debit** — customer must approve each request or it
  expires (per Bank Alfalah merchant docs).
- **PISP true pull payment = ANNOUNCED / IN TESTING, not live.** Raast CEO Ahson
  Saeed (Jun 24, 2026): consent taken up front, then payments pulled — *"already in
  testing… in the process of being launched very soon."* One-time mandate + tokenised
  pulls, no per-transaction OTP. **No SBP go-live circular as of Jul 2026.**
  PISP role open to "fintechs, aggregators, business platforms… with SBP in-principle
  approval" (Raast Participation Criteria, PSP&OD Circular 01/2025, Feb 2025).

## How Oraan/NayaPay/SadaPay/Easypaisa/JazzCash actually collect
- **Oraan**: SECP-registered; no confirmed SBP EMI/PSO; site lists user-initiated
  bank transfer / wallet / cash — **[UNVERIFIED but] almost certainly Raast RTP +
  reminders + in-app confirmation, not true pull.**
- **NayaPay/SadaPay** (EMIs): wallet-balance auto-pay to billers / none; no cross-bank
  pull. **Easypaisa** (first Digital Retail Bank, Jan 2025) & **JazzCash**: intra-
  wallet/1BILL recurring LIVE; third-party bank-account pull NOT live.
- **Bottom line: nobody uses true cross-bank auto-debit today. Standard = Raast RTP
  (one-tap) or reminder + manual push.**

## Implication for Halqa
Now: **Raast RTP** (request → member one-tap approves; near-frictionless for
smartphone users, all banks mandated since Mar 2024) via Raast participation or a
bank/EMI partner. 6–18 mo: **Raast PISP pull** the day SBP opens it (needs PISP
status/bank partner). Watch for the SBP go-live circular.
- Sources: [SBP Raast Participation Criteria (Feb 2025)](https://www.sbp.org.pk/press/2025/Pr-22-Feb-2025.pdf) ·
  [SBP PSP&OD C1-Annex](https://www.sbp.org.pk/psd/2025/C1-Annex.pdf) ·
  [Raast CEO on PISP pull — The News, Jun 2026](https://www.thenews.pk/print/1422144-raast-projected-to-process-500bn-in-transactions-this-year) ·
  [Bank Alfalah Raast P2M/RTP](https://www.bankalfalah.com/business-banking/retail-payment-solution/raast-p2m-qr/) ·
  [K-Electric PISP PoC](https://www.ke.com.pk/k-electric-and-state-bank-of-pakistan-collaborate-to-enable-seamless-bill-payments-via-raast/) ·
  [Haball PISP](https://www.techjuice.pk/haball-secures-pso-psp-approval-to-transform-b2b-payments/) ·
  [SBP P2M launch](https://propakistani.pk/2023/12/06/sbp-rolls-out-much-awaited-raast-p2m-service/) ·
  [SBP EMI Regs 2023](https://www.sbp.org.pk/psd/2023/C3-Enclosure-Regulations-EMIs.pdf) ·
  [1LINK 1BILL](https://1link.net.pk/products-services/bill-payment-service) ·
  [Easypaisa digital bank](https://imrozepakistan.com/national/business/easypaisa-becomes-pakistans-first-digital-retail-bank/) ·
  [Raast timeline](https://en.wikipedia.org/wiki/Raast)

---

# Brief 3 — Egypt / Money Fellows (regulation, credit, defaults)

## Legal basis
No "gam'eya law" — it's a private civil contract. Two regulators by activity: **CBE**
(payments/e-money, Banking Law 194/2020) and **FRA** (non-bank finance, Fintech Law
5/2022). **Money Fellows operates via the CBE Regulatory Sandbox — its 2nd cohort was
explicitly designated for ROSCAs** (Money Fellows + Dayrah). No standalone ROSCA law
enacted yet [UNVERIFIED post-2024]; FRA's own sandbox (Decree 163/2024, "CORBEH")
granted Egypt's first digital NBFS licence to Oliv Finance (Dec 2024), a separate
track.
- Sources: [AmCham Egypt](https://www.amcham.org.eg/publications/industry-insight/issue/89/financial-digitization) ·
  [GlobalLegalInsights Egypt](https://www.globallegalinsights.com/practice-areas/fintech-laws-and-regulations/egypt/) ·
  [ICLG Egypt 2025-26](https://iclg.com/practice-areas/fintech-laws-and-regulations/egypt) ·
  [CBE sandbox](https://www.cbe.org.eg/en/financial-technology/regulatory-sandbox)

## Money handling & scale
Money Fellows = private tech company, **not a bank/EMI**; operating authority = CBE
sandbox. Money custody via **Banque Misr** (state bank); **Mastercard–Banque Misr–
Money Fellows prepaid card** launched Jan 2025 (card **issued by Banque Misr**).
Morocco expansion via Attijariwafa Bank — bank-partner model is core. Scale: 8M+
downloads, 1M+ customers, 350k MAU, **$1.5bn** processed across 2M+ circles, $60M+
funding, **profitable 2025**.
- Sources: [ffnews / Mastercard-Banque Misr card](https://ffnews.com/newsarticle/paytech/mastercard-banque-misr-and-money-fellows-collaborate-to-launch-prepaid-card-to-drive-financial-inclusion-in-egypt-through-online-money-circles/) ·
  [500 Global](https://500.co/content/egypt-s-money-fellows-uses-an-old-school-lending-tool-to-drive-financial-inclusion-in-egypt/) ·
  [LaunchBase Africa](https://launchbaseafrica.com/2025/10/21/how-money-fellows-hit-profitability-by-digitising-egypts-informal-gameya-and-processing-1-5b/) ·
  [TechNext24](https://technext24.com/2025/10/22/money-fellows-has-8-million-users-and-1b/)

## Credit & defaults
**iScore** (est. 2005, CBE-supervised, 913 subscribers) covers ~all formally banked;
limited into the unbanked (50M+ unbanked). Money Fellows blogs about improving your
iScore → implies it reports credit-product data [INFERRED, not confirmed]; may report
via Banque Misr [UNVERIFIED]. **No published default rate.** The quoted **"7–8%"** =
share of **empty slots Money Fellows fills with its own working capital** (funded by a
**$2.25M Symbiotics debt facility**, 2022) — a vacancy mechanism, NOT a default rate.
Risk controls: app-based legally-binding contracts + late fees; **position-based
tiering** (early slots → higher-trust users; new users → later "saver" positions);
behavioral scoring at entry. No disclosed guarantee fund/insurance.
- Sources: [Decisimo iScore](https://decisimo.com/credit-data/egypt-credit-bureau-i-score.html) ·
  [Symbiotics debt facility](https://symbioticsgroup.com/press-release-money-fellow/) ·
  [TechCrunch Series C](https://techcrunch.com/2025/05/04/moneyfellows-raises-13m-to-take-its-group-savings-model-outside-egypt/)

## Structural enablers Egypt had (Pakistan gaps)
Single willing regulator (CBE ROSCA sandbox cohort); **national rails for the
unbanked** — Meeza (35M cards, national-ID only), Fawry (300k agents), InstaPay (12M
users, EGP 2.9tn); a **state-bank partner** (Banque Misr) incentivised by inclusion;
iScore for the formal segment. **Pakistan gaps:** no committee-specific sandbox
cohort; SECP/SBP jurisdiction split; eCIB closed to non-FIs; no Meeza-equivalent;
bank partner must be negotiated. **Framing:** Egypt legalised the *platform* via a
sandbox cohort + let a bank do the licensed money functions.
- Sources: [TransFi Egypt rails](https://www.transfi.com/blog/egypts-payment-rails-how-they-work---meeza-instapay-mobile-wallet-growth) ·
  [Zawya](https://www.zawya.com/en/business/fintech/egypts-money-fellows-logs-15bln-transactions-ew2p6l70)

---

# Brief 4 — Oraan status · SECP sandbox · takaful/guarantee

## Oraan — actually SECP-licensed
Oraan Financial Services (Pvt) Ltd holds **NBFC "Investment Finance Services" licence
`SECP/LRD/107/OFSPL/2023`** (2023; NTN 5039622-0). Pre-2023 = SECP sandbox. IFS-NBFC
also permits leasing/housing/**microfinancing**. Most-likely fund mechanic (inference):
a **technology facilitator** routing rupees member-to-member via a bank/payment
partner, not holding the pool. Chairman's uncertainty likely = the pre-2023 phase or
the SBP-side payment flow.
- Sources: [CxO Forum — Oraan NBFC](https://news.cxoforum.global/oraan-obtains-nbfc-license-aiming-to-revolutionize-financial-inclusion-nationwide/) ·
  [SECP IFS licensing](https://www.secp.gov.pk/licensing/nbfcs/investment-finance-services/) ·
  [Dawn — Oraan seed](https://www.dawn.com/news/1648752)

## SECP Regulatory Sandbox
Guidelines Dec 2019. Cohorts: **1st** (apps Feb–Mar 2020; 6 entities incl. FINJA P2P
& First Digital General Takaful → 2 successes, frameworks amended); **2nd** (2021, 5
solutions); **3rd** (~2022, not detailed); **4th** (apps May 2023, theme **Islamic
finance — micro/nano-finance, sukuk fractionalization, *new takaful models*** +
conventional robo/AI/fractionalization). **No 5th cohort announced as of Jul 2026.**
Eligibility: **unregistered startups intending to register are explicitly allowed**;
no min capital to apply; 6-month supervised live test at limited scale; apply
**sandbox@secp.gov.pk**. (SBP launched a *separate* sandbox Aug 2025 — committees sit
with SECP.)
- Sources: [SECP sandbox](https://www.secp.gov.pk/regulatory-sandbox/what-is-regulatory-sandbox/) ·
  [SECP 4th cohort](https://propakistani.pk/2023/04/29/secp-announces-fourth-cohort-under-its-regulatory-sandbox/) ·
  [SECP 2nd cohort](https://www.secp.gov.pk/media-center/press-releases/secp-approves-various-technology-driven-solutions-under-2nd-cohort-of-regulatory-sandbox/) ·
  [SBP sandbox launch](https://propakistani.pk/2025/08/26/sbp-launches-regulatory-sandbox-to-boost-fintech-innovation/)

## Takaful / credit-default insurance
**Credit-life takaful** (EFU Hemayah, Pak-Qatar Family Takaful, **Salaam Family
Takaful** — digital-only, licence handed by Chairman Akif Saeed May 2024) covers
**death/disability only — NOT wilful default.** For default itself: **credit
guarantee** — **National Credit Guarantee Company (NCGCL)**, launched Jan 2024
(Karandaaz 56% + MoF 44%), NBFC, six guarantee products incl. a **Gender** stream.
Live precedent: **PMIC–NCGCL Rs 2.0bn Loan Portfolio Guarantee, Jan 2026** for a
microfinance book. **No "committee-default takaful" product exists** — a gap the SECP
4th cohort's "new takaful models" invited. Recommended stack: **sandbox → NBFC → NCGCL
portfolio guarantee → group credit-life takaful as a member benefit.**
- Sources: [EFU Credit Life](https://www.efulife.com/corporate-benefits/credit-life-scheme-for-financial-institutions) ·
  [Pak-Qatar Family Takaful](https://pqftl.com.pk/about/) ·
  [Salaam Family Takaful — Arab News](https://www.arabnews.com/node/2511826/pakistan) ·
  [NCGCL launch](https://profit.pakistantoday.com.pk/2024/01/12/national-credit-guarantee-company-launched-to-bolster-financial-accessibility-for-smes/) ·
  [NCGCL (Wikipedia)](https://en.wikipedia.org/wiki/National_Credit_Guarantee_Company) ·
  [PMIC–NCGCL Rs 2bn](https://pmic.pk/blog/2026/01/20/pmic-ncgcl-sign-a-loan-portfolio-guarantee-to-boost-financing-for-priority-sectors/)

---

# Brief 5 — ROSCA economics (why people love / distrust committees)

## Market size (Pakistan)
~**Rs 4tn (~$5bn/yr)** rotating; **3rd-largest savings channel** (after bank deposits
& national savings); **34–41%** of adults have participated, **~90% aware**; only
**14% of women** (56% men) hold a formal account; **85%** rely on informal credit.
- Sources: [Dawn — committees $5bn](https://www.dawn.com/news/1725956) ·
  [Dawn/World Bank — 3rd-largest](https://www.dawn.com/news/950117/committees-system-country-s-third-largest-savings-channel) ·
  [Karandaaz K-FIS 2024](https://www.brandsynario.com/karandaaz-releases-k-fis-2024-on-financial-inclusion-trends-in-pakistan/)

## Efficiencies (why they love it)
Interest-free lump sum; commitment device (defeats self-control); no credit history/
collateral (the only credit for ~100M unbanked); social accountability (exclusion +
reputation enforce repayment); shields women's savings from household spending
pressure; speed/simplicity; enables indivisible purchases; cultural/religious fit (no
riba; only ~9% of the excluded trust banks).
- Sources: [Besley–Coate–Loury, AER 1993](http://eprints.lse.ac.uk/1613/) ·
  [Ashraf–Karlan–Yin (commitment savings), HBS](https://www.hbs.edu/ris/Publication%20Files/09-100.pdf) ·
  [Anderson–Baland–Moene (enforcement)](https://econ.cms.arts.ubc.ca/wp-content/uploads/sites/38/2013/05/pdf_paper_siwan-anderson-enforcement-organizational-design.pdf) ·
  [Anderson–Baland, QJE 2002 (women's savings)](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=244530) ·
  [TechCrunch/Oraan](https://techcrunch.com/2021/09/26/oraan-raises-3m-to-increase-financial-inclusion-among-pakistani-women/)

## Inefficiencies (why they distrust it)
Organiser absconds (Sidra Humaid **$2M / 200 women**; Karachi **Rs 420M**; Islamabad
~$200k [UNVERIFIED]); early taker stops paying; no legal recourse (verbal/cash);
0% nominal return vs **~11.7%** inflation; timing risk; illiquidity/rigidity; opacity/
no record; trust breaks among online strangers (the digital-fraud failure mode).
**No aggregate default/fraud data exists — the opacity is itself the risk.**
- Sources: [Vice — Sidra Humaid](https://www.vice.com/en/article/sidra-humaid-committee-scam-pakistan/) ·
  [Dawn — Karachi Rs420m](https://www.dawn.com/news/1724659) ·
  [Dawn — risks/no recourse](https://www.dawn.com/news/1725956) ·
  [Dawn — no inflation hedge](https://www.dawn.com/news/1846983) ·
  [Wikipedia — ROSCA](https://en.wikipedia.org/wiki/Rotating_savings_and_credit_association) ·
  [Meer — committee benefits/risks](https://www.meer.com/en/84578-pakistans-committee-system-benefits-and-risks)
