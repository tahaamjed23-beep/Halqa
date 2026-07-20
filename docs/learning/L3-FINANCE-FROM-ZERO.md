# Learning Volume 3 — FINANCE FROM ZERO
### The actual finance course: money, interest, risk, instruments, Islamic finance, and the banking words investors use. Written for a strong A-level student with no finance background. Examples throughout.

---

## Chapter 1 — Money over time (the one idea all finance is built on)

**Finance is the study of moving money through time.** Savings move today's money to the future; loans move future money to today. Everything else — banks, funds, sukuk, committees — is machinery for doing this, and every price in finance (every interest rate, every yield) is the price of time.

### 1.1 Interest and yield
If you lend Rs 100,000 for a year at 12%/yr, you get back Rs 112,000. The 12,000 is the price the borrower paid to have your money for a year. Two words you'll meet:
- **Interest** — a *fixed, promised* charge for the use of money (this exact fixedness is what Islamic finance forbids; Chapter 5).
- **Yield / return** — the general word for what an investment actually produced, promised or not. A fund's yield varies; a loan's interest doesn't.

### 1.2 Annualisation (do this arithmetic in your sleep)
Rates are quoted per year, but money rarely sits exactly a year:

> profit = principal × annual rate × (days ÷ 365)

Rs 50,000 at 10.8% for 45 days: 50,000 × 0.108 × 45/365 = **Rs 666**. This one formula is Halqa's entire float engine.

### 1.3 Compounding (the exponential you already know)
Simple return: profit is paid out; the base never grows. Compound return: profit stays in and itself earns — the base grows geometrically. Rs 100,000 at 12%:
- Simple, 10 years: 100,000 + 10 × 12,000 = **Rs 220,000**.
- Compound, 10 years: 100,000 × (1.12)^10 = **Rs 310,585**.
The gap (Rs 90,585) is profit-on-profit. As a physics student: simple growth is linear, compound is exponential — same distinction as constant velocity vs constant growth *rate*. Rule of thumb: money at r% doubles in roughly **72 ÷ r** years (the "rule of 72": at 12%, ~6 years — check: 1.12^6 = 1.97 ✓).

### 1.4 Inflation and real return
Inflation = the general price level rising = each rupee buying less. If your savings earn 11% but inflation is 13%, your **real return** is ≈ 11 − 13 = **−2%**: you have more rupees that buy less stuff. This is why "keeping cash safe at home" is actually losing ~13%/yr, why a paper committee's idle pool is "melting ice", and why gold matters here (Chapter 4) — it tends to hold *real* value when the rupee doesn't.

### 1.5 The risk–return–liquidity triangle
Every investment has three dials:
- **Return** — what it earns.
- **Risk** — how uncertain that earning is (including losing principal).
- **Liquidity** — how fast you can turn it back into cash without loss.

Iron law: **you can maximise two, never all three.** A government T-bill: safe + liquid → modest return. Property: good return + fairly safe → illiquid (months to sell). Crypto: huge *possible* return → terrible on both other dials. When someone offers high return, safe, AND instant access — that's not an investment, that's a scam's sales pitch, and it's precisely the promise every Ponzi makes. Every scheme card in Halqa's Terminal is one point on this triangle with all three dials disclosed.

### 1.6 Diversification
Don't hold one asset; hold several that fail differently. Math view: combining imperfectly-correlated risks lowers total variance without proportionally lowering return — the only free lunch in finance. It's why Halqa's engine has *two* profit sources (market yield AND member-to-member fee): when rates fell 30% in the stress test, the fee component didn't move, and the floor held at Rs 13,821.

---

## Chapter 2 — Banks, deposits, and where "bank profit" comes from

A bank is a matching machine: it takes **deposits** (your savings, which the bank owes back to you) and makes **loans** (money it's owed by borrowers), earning the **spread** between what it charges borrowers (say 18%) and what it pays depositors (say 11%).

Words you'll hear from bankers, decoded:
- **Deposit mobilisation** — a bank's constant hunt for more deposits. Deposits are a bank's raw material; without them it cannot lend. Cheap, stable, *granular* deposits (many small savers) are gold; **concentration** (a few huge depositors) is dangerous — if one leaves, the bank wobbles. *This is why organised committee savings genuinely interest banks: thousands of small, sticky savers.*
- **GLP (gross loan portfolio)** — the total of all loans a bank has out.
- **NPL (non-performing loan)** — a loan that's stopped being repaid. The bank's nightmare metric.
- **CAR (capital adequacy ratio)** — the cushion of the bank's own money it must hold against losses; regulators set minimums. A bank near its CAR floor must raise capital or shrink.
- **Receivables** — money contractually *due to arrive*. A committee's future rounds are receivables. Banks routinely lend against receivables (it's called receivables financing) IF they can see a schedule and judge the payers — which is exactly what Halqa's exportable "bank pack" provides: the schedule, each payer's reliability score, and the collateral behind them.
- **Thin-file borrower** — someone with little or no credit history, whom a bank can't assess. Pakistan's informal economy is almost entirely thin-file. Halqa's Credit Passport exists to thicken those files.
- **Underwriting** — the act of judging a risk before taking it (deciding whether to make the loan). Data that improves underwriting is worth real money to lenders.

**Microfinance banks (MFBs)** are banks specialised in small loans/deposits for lower-income customers (U Bank, Khushhali, ex-FINCA). Pakistan's microfinance sector (Dec 2024): **12.34M borrowers, Rs 604B loans (avg ~Rs 49k), Rs 733B deposits**. Notice: the average microfinance loan ≈ one committee payout. The two instruments already do the same job in people's lives; only one currently builds a credit file.

---

## Chapter 3 — Funds: what a "money-market fund" actually is

A **fund** pools many people's money and buys a basket of assets; you own units of the basket. A professional manages it for a small fee; your unit price tracks the basket's value. Types, arranged along the risk dial:

- **Money-market fund (~10.8–10.9%)** — holds the safest, shortest-term paper (T-bills, overnight bank placements). Near-cash: low risk, high liquidity, modest return. *This is where Halqa's float sits — because committee money must never be gambled and must be available by payout day.*
- **Income fund (~12.1–12.2%)** — mostly bonds/sukuk; a bit more return, a bit of wobble. Halqa's vault "Income" tier.
- **Balanced / asset-allocation (~13–16%)** — mixes bonds and shares; medium volatility.
- **Equity fund / ETF (~17–18%)** — owns shares of companies. An **ETF** (exchange-traded fund) is a fund that itself trades on the stock exchange like a single share, typically tracking an index (e.g., the PSX top-100). Highest mainstream returns, biggest swings; suitable for years-long horizons, not next month's payout.
- **REIT (~14.4%)** — a fund owning rental property; you earn rent + revaluation without buying a building.

The other instruments in Halqa's catalog: **T-bills/PIBs** (lending to the government short/long term — the "risk-free" PKR benchmark, ~11.5–13.8%), **National Savings certificates** (state retail savings products, ~12.8–13.7%), **bank term deposits** (~11.2–11.5%), **gold-linked** (~15% indicative), **Murabaha trade finance** (~13.4%, Chapter 5), **sukuk** (Chapter 5), microfinance deposits and private credit (~13–16.5%, higher yield, real credit risk, slow exits), and one **crypto basket** ("~30%", speculative, can halve in weeks, not backed by any state — in Halqa it's personal-vault-only behind double confirmation, and permanently barred from committees).

---

## Chapter 4 — Gold (why Pakistan trusts it, and why Halqa speaks it)

Gold pays no interest and runs no business — so why hold it? Because it is nobody's promise. Every rupee, deposit and bond is someone's liability that inflation or default can erode; gold just *is*. In a country with recurring double-digit inflation and a sliding currency, gold has been the household's real store of value for generations (it's literally the form weddings save in). Hard evidence of its status: at U Microfinance Bank, **roughly half the entire loan book is backed by gold** — it is the collateral ordinary Pakistan actually pledges. Short-term it's volatile (it can drop 10% in a quarter); long-term it holds purchasing power. Halqa meets this culture where it lives: a gold-linked vault tier, and an optional per-circle "gold hedge" that routes 5–50% of each pool into gold-linked allocation (auto-disabled for very short circles, because gold takes ~3 days to liquidate and payout day waits for no fund).

---

## Chapter 5 — Islamic finance (Halqa's identity — learn this properly)

### 5.1 Riba: the core prohibition
**Riba** = any *guaranteed, predetermined* charge for the use of money itself. In practice: interest. The prohibition's logic: money should not breed money by mere passage of time; profit must come from **real economic activity** — trade, assets, enterprise — and the profit-taker must bear some of the venture's **risk**. Fixed interest transfers all risk to the borrower while guaranteeing the lender — that asymmetry is what's forbidden.

Consequence: **variable profit from real assets = permissible; fixed charge for time = riba.** Now re-read Halqa's engines with this lens: money-market/Mudarabah yields are variable profit from real instruments (🟢); the early-turn fee is a charge for *time* (getting money sooner) — which is why the app labels it 🟠 and refuses to call it halal until scholars rule. The label placement isn't marketing caution; it's the definition applied honestly.

### 5.2 The contracts (each with its one-line worked example)
- **Mudarabah** — one party brings capital (*rab-ul-maal*), the other brings work (*mudarib*); profit splits by a pre-agreed **ratio** (not a pre-agreed amount!); monetary loss falls on the capital, the worker loses only effort. *Example: you give a trader Rs 100k at 80/20. Venture makes 20k → you get 16k, he gets 4k. Venture loses 10k → you bear the 10k, he earned nothing for his months of work.* Halqa's entire revenue model is a Mudarabah: members' idle money is the capital, Halqa is the mudarib, ratio 95/5. **No profit → no Halqa revenue.** That is a structural honesty guarantee: the platform cannot earn unless members do.
- **Musharakah** — like Mudarabah but both sides contribute capital; both share losses proportionally. (Vocabulary — not currently a Halqa feature.)
- **Sukuk** — Islamic "bonds": certificates of ownership in real assets whose *income* you receive (rent, tolls), rather than interest on a loan. Pakistan's government issues them (~11.8%); companies too (~14%).
- **Murabaha** — cost-plus trade: the financier *buys the actual goods* and resells them to the client at a disclosed markup, payable later. Profit from trade in a real thing, not from lending cash. (~13.4% in the catalog.)
- **Hiba** — a gift, freely given. Halqa's prize draw is structured as hiba: only realised profit is gifted, nobody stakes anything, so the gambling structure (stake → chance of loss) is absent. Compare a lottery: you *pay* for a ticket and most people lose their stake. In the draw, the "losers" lose nothing — they keep their exact normal share.
- **Iltizam bi-tasadduq** — a classical solution to a real dilemma: late payers need a penalty (or everyone pays late), but if the penalty enriches the counterparty, it's effectively interest on the delay. Resolution: the offender pays, but the money goes to **charity**. Halqa implements this in code: halal-tier penalties route to charity at completion. This single detail signals more fiqh literacy than any brochure.
- **Gharar** — excessive uncertainty/ambiguity in a contract. Islamic law demands disclosed, dated, defined terms — which happens to be identical to what good consumer-protection law demands. Halqa's dated rates, disclosed splits, and consent screens serve both masters at once.
- **Takaful** — mutual insurance: members contribute to a shared pool that compensates whoever suffers the insured loss; surplus can return to members. (Future partnership category. Note how Halqa's auto-cover is even cleaner: your own savings cover your own slip — no pool, no premium, no moral hazard.)

### 5.3 The chit-fund contrast (one paragraph you should be able to reproduce)
India's chit funds auction each month's pot: whoever accepts the biggest discount takes it, and the discount is distributed to the others. Functionally, the early taker pays the group for time-value of money — interest in costume — plus the auction makes the price opaque and desperate-bidder-driven. Halqa's halal tiers refuse to price the turns at all (profit comes only from real instruments); its conventional tier prices turns by a **fixed, capped, disclosed, declining formula** instead of an auction — and still wears the 🟠 label, because a cap doesn't settle the fiqh question. Knowing exactly where your own product might be non-compliant, and saying so in the UI, is rarer than certification.

---

## Chapter 6 — Startup finance (the vocabulary of the meeting itself)

- **TAM / SAM / SOM** — total market / the slice you could serve / the slice you can win *now*. Halqa's honest version: US$5B/yr rotates in committees (TAM); the digitally-reachable share of the 41% over ~5 years, maybe 15–25M adults (SAM); thousands of host-led circles (SOM). Distrust any pitch whose SOM is a percentage of TAM with no mechanism.
- **Unit economics** — profit per unit served, after direct costs. Halqa's unit is an *earning balance*: marginal cost of one more earning-day ≈ a database row; marginal revenue = 5% of the yield on it. Positive from early on, by construction.
- **CAC / LTV** — cost to acquire a customer / lifetime value of that customer. A business is healthy when LTV ≫ CAC. Halqa's CAC is structurally low (one host brings 6–20 members; the Rs 250 referral bonus pays only on a *completed first cycle* — you cannot farm it with fake signups) and LTV compounds (vault balances grow).
- **Take rate** — the platform's cut of the flow it facilitates. Halqa: **5% of profit created, 0% of principal.** Contrast with a flat monthly fee (which extracts even when members earn nothing) — the difference is both ethics and regulatory survivability.
- **Burn / runway** — monthly net spend / months of cash left at that spend. What kills startups isn't usually the idea; it's runway hitting zero before the milestone.
- **SAFE / valuation cap** — the standard early-stage instrument: money now, shares later at the next priced round, with a cap on the valuation used. If terms come up in a first meeting: "not running a priced process — exploring fit." Never negotiate live.
- **Pre-money / post-money / dilution** — company value before the cheque / after (pre + cheque) / the ownership % founders give up. Rs 20M in at Rs 80M pre → post 100M → investor owns 20%.
- **Cap table** — the ownership ledger. Yours is one line (you), which sophisticated investors like: no messy co-founder disputes or dead equity.
- **Due diligence** — the investor's verification phase: books, code, claims, references. Halqa's edge: a double-entry ledger and 262 automated checks make diligence *fast*, and offering the audit proactively ("bring your technical adviser") signals you have nothing buried.

---

## Chapter 7 — Regulation in Pakistan (the map)

- **SBP** (State Bank of Pakistan) — the central bank; regulates banks, MFBs, wallets/EMIs, and runs **Raast**, the free instant transfer rail (the reason committee payments cost nothing to move).
- **SECP** (Securities & Exchange Commission of Pakistan) — regulates securities, funds, and **NBFCs** (non-bank financial companies — entities that may manage/hold client money without being full banks). **This is Halqa's gating licence** for custody and real investment. Precedent: Oraan, a digital-committee startup, obtained exactly this licence (SECP/LRD/107/OFSPL/2023) — the path is proven, which converts "is this even legal?" into "execute the known process."
- **KYC / AML** — know-your-customer (verify identities) and anti-money-laundering (detect dirty money moving). Record-only Stage 1 has minimal AML surface (Halqa never touches funds); the full program is a licensing deliverable.
- The two-stage logic in one line: **record-only requires no licence and builds trust + data; the licence converts computed yield into real yield.** Every "indicative" label in the app marks exactly the boundary between the stages.

---

## Chapter 8 — Fraud patterns (know the enemy)

- **Ponzi** — pays "returns" to old investors out of *new investors' deposits*. Needs two ingredients: opacity (no one can see where money is) and promised fixed returns. Collapses when inflow slows. Halqa's structural answers: no custody, open ledger, and the word "guaranteed" existing nowhere.
- **Custody frauds wearing committee clothing** — Karachi's Rs 400M online-kameti scam, India's Saradha: an operator collected everyone's money centrally and vanished. The committee *instrument* wasn't the flaw; central custody was. Record-only design makes this fraud physically impossible rather than merely forbidden.
- **The triangle test** (from Chapter 1): high return + safe + liquid promised together = walk away. Your fastest scam detector for life.

---

## Final self-test
1. Rs 75,000 sits 40 days at 11.2%/yr — profit? *(75,000 × 0.112 × 40/365 ≈ Rs 920)*
2. Inflation 12%, savings rate 10% — what's happening to your money, precisely? *(Nominal +10%, real ≈ −2%: more rupees, less purchasing power.)*
3. Why does a fixed "10% return, always, withdraw anytime" pitch violate the triangle — and which fraud is it the signature of? *(Claims all three dials at once; Ponzi.)*
4. In a Mudarabah that loses money, what exactly does each side lose? *(Capital-provider: the money. Manager: their effort/time — no fee.)*
5. Why do banks care about *granular* deposits, and what does a committee platform offer them? *(Concentration risk; thousands of small sticky savers.)*
6. Why does the penalties-to-charity rule exist — what would be wrong with the group keeping the penalty? *(Enriching the counterparty for delay ≈ interest on time; charity breaks the enrichment while keeping the deterrent.)*
