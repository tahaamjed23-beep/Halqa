# HALQA — BUSINESS MODEL v5 (investor edition)
### The channel model: institutions pay us for what we deliver them; members pay almost nothing; our share of member profit stays untouched.
*Pakistan only. Organized the way an investor thinks: what earns NOW, what earns the day the licence lands, what earns at maturity — and which partner each line needs. Glossary at the end; every technical term in **bold** is defined there.*

---

## 0. The architecture in one paragraph (read this first)

Halqa is **not** a bank and takes no bank-like share. The licensed Islamic bank partner is the **Mudarib** on all deposited money — it invests the pools and takes its standard ~50% **Mudarib share** upstream, exactly as it does for any depositor; the ~11% profit rates our members see are *already net* of that. Halqa sits in the middle as **capital-light infrastructure** — the organiser, ledger, enforcement and data layer — and earns the way every successful channel business earns: **institutions pay us for the three things we uniquely deliver them** (granular deposits, underwritable receivables, verified thin-file borrowers), while members pay only a small visible service fee. Members keep their full published profit rate. That is the whole design: *don't tax the saver; charge the institutions who profit from her.*

---

## 1. REVENUE THAT WORKS TODAY — before any licence (record-only stage)

These lines are software/service fees, legal without custody, and they start the moment users do:

- **Circle service fee — Rs 49/member/month (host free).** The "account maintenance" analog, priced at ~0.4% of a typical installment — visible, flat, tiny. Oraan-style flat plans run ~Rs 1,000/month; we are ~20× cheaper. The host pays nothing because she *is* our distribution (**CAC** ≈ zero: one host imports 6–20 pre-trusted members).
- **Turn-market processing — 10% of premiums (already live in the code).** When members trade turn positions for a premium in the conventional tiers, the existing marketplace fee applies to the *premium only*, never the pot.
- **Early-turn-fee processing — 15% of the fee flow.** The optional pay-to-go-early flow (up to 10% of pot, declining to zero) currently moves member-to-member with us processing it free; a 15% processing cut on that flow is the "clearing fee" analog. Members who never use fee tiers never pay a rupee of this.
- **Safety-Fund service cut — 10% of slot fees.** The guarantee-pool administration charge — the cost of running the mutual protection machinery.
- **Passport verification fees — Rs 75 per inquiry (the lender pays, not the member).** Any lender, landlord or employer verifying a member's Credit Passport pays per check — the eCIB-inquiry analog. The member's document stays free to generate.
- **Premium host tools — Rs 499/month, optional.** Multi-circle dashboards, receivables-pack exports, analytics — the "business account" analog for power hosts running several circles.

*Why this matters to an investor:* the company is **revenue-generating before licensing** — small, but real, recurring, and entirely software-margin. Nothing here waits on SECP.

## 2. REVENUE THAT SWITCHES ON THE DAY OF LICENCE + BANK PARTNER

The licence converts recorded balances into **custodied** ones at the partner bank — and unlocks the institution-paid lines:

- **Deposit-mobilisation (channel) commission — ~1.25%/yr on balances placed, paid by the bank.** The centrepiece. Banks pay 1–2% all-in to gather deposits through branches and agents; we deliver them **granular, sticky, CASA-like** committee deposits — thousands of small savers, the exact cure for their **deposit concentration** problem — and are paid a channel commission *out of the bank's own ~4% spread*. The member's profit rate is untouched. This line alone, at scale, is our largest.
- **Payout processing — 0.25% capped at Rs 299 per disbursement.** The pay-order/RTGS-fee analog on each pot release; trivial per member, real at volume.
- **AMC distribution trail — ~0.5%/yr on allocated slices, paid by the fund manager.** When circles allocate into gold or market schemes, we are the distributor, and every distributor in Pakistan's mutual-fund industry earns a **trail commission** from the AMC — not from the investor. Member returns remain the fund's published NAV returns.
- **Takaful (bancassurance-style) commission — 15–20% of contributions, paid by the takaful operator.** Safety-Fund reinsurance and member micro-cover distributed through us earn the standard **bancassurance** commission — again institution-paid.

## 3. THE RECEIVABLES ENGINE — the deep well (licence + bank partner, scaling over 12–36 months)

You asked for more here, and this is genuinely where the model gets rich — because a committee is, in banking language, a **self-amortizing stream of receivables with behavioural collateral**, and we are the only ones who can see, score, and service it. Five distinct lines, none of which touch the member's profit share:

- **3a. Origination fees — 1–1.5% of financed amount.** A lender advances against a circle's **forward inflow schedule** (the receivables pack we already export: schedule + per-member reliability + collateral held). We sourced and underwrote the deal; the origination fee is ours. Zero credit risk stays on our book — we are the **originate-to-distribute** layer, not the lender.
- **3b. Servicing fees — ~0.5%/yr on the financed book.** After origination, someone must run the schedule: reminders, collections escalation, reconciliation, reporting to the financier. We already do all of it as software. **Servicing** is classic, sticky, annuity-like fee income — banks pay it happily because our marginal cost is a cron job.
- **3c. Payout-advance facilitation — ~1% origination + servicing.** The member-level product: the turn-9 member needs liquidity in month 3, and a financier advances against *her own scheduled payout* — a **factoring/discounting** structure on a receivable we can verify to the paisa. Two honest flavours: the halal route is the **turn market we already built** (she sells her position; the buyer pays the premium; our existing 10% fee applies); the conventional discounting route gets the same 🟠 not-Shariah-reviewed label as every other conventional lever. Either way, Halqa earns on flow, not on her profit.
- **3d. Institutional turn-market participation.** The quietly clever one: let the *bank itself* stand in the turn market as a **liquidity provider** — buying late positions at a premium from members who need cash now, collecting the pot at maturity. The bank gets a short-dated, collateral-backed, data-rich asset; members get instant liquidity at a transparent market price; Halqa collects the existing 10% marketplace fee on every institutional trade. No new system needed — it's the marketplace we already run, with a deeper pocket standing in it.
- **3e. Receivables securitization — 0.5–1% arrangement + ongoing servicing.** At scale, bundle hundreds of circles' inflow schedules into a rated pool — a **sukuk**-structurable instrument sold to banks/funds via **private placement**. We arrange (fee), we service (fee), the paper sits on institutional balance sheets. This converts Pakistan's oldest informal cash flow into a new institutional **asset class** — and the arranger of a new asset class owns its economics for years. (Our own future *revenue* can be securitized the same way later — **revenue-based financing**, non-dilutive — but the circles' receivables come first because banks buy seasoned, collateralized cash flows before they buy a startup's fee line.)

## 4. LONG-TERM LINES (24–48 months, additional partners)

- **Data & scoring licensing.** The reliability score and repayment histories, licensed to MFBs/lenders as **thin-file underwriting** feeds (per-score or subscription). Near-100% gross margin; structurally un-copyable because the data must be *earned* on our ledger, cycle by cycle. Feeds eCIB (consent-based, positive-first) while the commercial API feeds paying lenders.
- **White-label rails (committee-as-a-service).** License the entire engine — ledger, enforcement, engines, receivables machinery — to banks and digital banks wanting branded committee products on their own books. SaaS licence + per-member volume fees. We stop being one app and become the **infrastructure standard**.
- **Remit-to-committee (the diaspora line).** Overseas Pakistanis remit ~$30B+/yr, much of it to fund family obligations — weddings, school fees, exactly what committees save for. A remittance-rail partnership (RDA/bank corridors) letting a brother in Dubai pay his mother's installment directly earns us referral/FX share on a flow that is enormous, sticky, and emotionally locked-in.
- **Employer/payroll channel.** Salary-day goal circles for employer workforces (a Rozee-shaped partner): payroll-grade payment reliability, B2B pricing per enrolled employee.

## 5. WHAT THIS ADDS UP TO (and what it deliberately does not touch)

At 250,000 members (~Rs 11B balances, the scale a microfinance-bank partner cares about):

| Line | Payer | ~Rs/yr |
|---|---|---|
| Service fees (Rs 49) | member | 147M |
| Flow cuts (early fee / slot / market) | opt-in users | 90M |
| Channel commission (1.25%) | **bank** | 140M |
| Payout processing | custody-stage | 45M |
| Receivables: origination + servicing + advances | **lenders/bank** | 60–100M (book builds) |
| AMC trail + takaful commission + data | **AMC/takaful/lenders** | 45M |
| **Total** | | **~Rs 530–570M/yr ≈ Rs 4.4–4.8 crore/month ≈ 9–10× the original model** |

At 1M members: **~Rs 16–19 crore/month.** At 2M: **~Rs 35–42 crore/month.** The majority of every column is **institution-paid** — the revenue shape (recurring B2B2C fees, no balance-sheet risk) that commands the highest quality-of-earnings multiple.

**Deliberately untouched:** the member's share of engine profit (full published rates — the bank's Mudarib cut was always upstream, as in any Islamic savings account), her principal (0%, always), penalties (charity, always). The pitch line survives every audience: *"the institutions pay us; the auntie pays forty-nine rupees."*

## 6. Honest sensitivities (say them before they're asked)

- **Timing:** Sections 2–4 assume the SECP NBFC licence and a custody partner; Section 1 alone is modest (roughly Rs 25–35M/yr at 250k members). The raise funds the bridge.
- **Rate cycle:** the channel commission and trail float with deposit economics; the service fee, flow cuts, receivables fees and data lines are **rate-independent** — the mix is deliberately diversified against SBP easing.
- **Partner concentration:** one bank partner is a dependency; the mitigation is the white-label ambition (many institutions on one rail) and the fact that our data asset travels with us, not with any partner.

---

## GLOSSARY (noob-proof, in order of appearance)

- **Mudarib / Mudarabah** — Islamic profit-sharing contract; the working manager (Mudarib) invests capital and keeps a pre-agreed share of *actual* profit. Here: the bank is the Mudarib on deposits, at its standard ~50% — upstream of us, invisible to members as always.
- **Capital-light** — a business that grows revenue without growing a balance sheet (no lending book, no capital reserves). The highest-multiple shape in fintech.
- **CAC (customer acquisition cost)** — what it costs to gain a user. Ours ≈ a host's trust; she imports her circle.
- **CASA** — current & savings accounts; banking shorthand for cheap, stable, everyday deposits — the kind banks fight for. Committee money behaves like CASA.
- **Deposit concentration** — a bank's dependence on a few large depositors (dangerous: one exit wobbles the bank). Granular committee deposits are the cure — why the bank pays us.
- **Channel / deposit-mobilisation commission** — a fee banks pay third parties for delivering deposits; standard for agent networks. Paid from the bank's spread, not the depositor's return.
- **Spread / NIM (net interest margin)** — the gap between what a bank earns on assets and pays on deposits; the core of bank profit (~4–5% gross in Pakistan currently).
- **Trail commission** — the recurring fee a fund manager (AMC) pays a distributor for assets placed with it; industry-standard ~0.5%/yr. AMC pays, investor doesn't.
- **Bancassurance** — insurance sold through a financial channel; the channel earns 15–20% of contributions as commission. Takaful is the Islamic form.
- **Receivables** — money contractually due to arrive; a committee's remaining scheduled payments. **Forward inflow schedule** — the dated list of those payments.
- **Originate-to-distribute** — sourcing and structuring loans/financing that end up on *someone else's* balance sheet; you keep fees, they keep risk.
- **Origination fee / servicing fee** — one-time fee for sourcing a financing deal / recurring fee for administering it (collections, reporting).
- **Factoring / discounting** — selling a receivable today for slightly less than its face value, to get cash early. (Shariah-sensitive: sale-of-debt structures are contested, hence our 🟠 labelling or the turn-market alternative.)
- **Liquidity provider** — a deep-pocketed participant standing ready to buy in a market, so sellers can always exit. Here: the bank buying turn positions.
- **Securitization** — bundling many small cash-flow streams into one tradeable instrument institutions can buy. **Sukuk** — the Islamic certificate form. **Private placement** — selling such an instrument directly to a few institutions rather than the public market.
- **Asset class** — a category of investable things (T-bills, real estate…). Committee receivables becoming one is the long-game prize.
- **Revenue-based financing** — selling a share of your own future revenue for capital today; **non-dilutive** (no equity given up).
- **Thin-file** — a borrower with no formal credit history; unscoreable by banks; ~100M+ Pakistani adults. Our data's entire market.
- **eCIB** — the State Bank's credit bureau; where formal credit histories live and lenders inquire.
- **White-label** — your technology, their brand; licensing the rails to institutions.
- **RDA (Roshan Digital Account)** — SBP's channel for overseas Pakistanis to bank/invest at home; the remittance-corridor hook.
- **Quality of earnings** — how durable/recurring/risk-free revenue is; institution-paid recurring fees score highest.
