# Halqa — Licences, Procedures, Costs: The Future Plan
*Written 21 July 2026. Every rupee figure here was checked against a live source; the sources are listed at the end. Where a number can't be pinned down publicly, it says so plainly instead of pretending.*

This document exists so that when you sit across from a lawyer, a bank, or an investor, you already know the map better than they expect a 17-year-old to. Read it once slowly. It is written to teach, not to list.

---

## 1. The one idea the whole plan hangs on: *do we touch the money?*

Every cost and every licence in Pakistani fintech flows from a single question: **does your company ever hold the customer's money, even for a second?**

Picture two versions of Halqa.

**Version A — the notebook.** Twelve women run a committee. Each month Ayesha sends her Rs 10,000 *straight to* whoever's turn it is, using Raast on her own banking app. Halqa never receives that money. Halqa just writes in a very clever notebook: "Ayesha paid, on time; Sana collected; here's whose turn is next; here's Ayesha's reliability score." That is exactly what Halqa is today.

**Version B — the pot.** The same twelve women send their Rs 10,000 *to Halqa*, Halqa holds Rs 120,000 in its own account for a few days, then Halqa pays it out to whoever's turn it is.

Version A is a **software company**. It needs no financial licence at all — the same way Google Calendar needs no banking licence to remind you about a payment. Version B is a **financial institution** the moment that pot exists, and Pakistan regulates pots very heavily, because a pot is exactly how every committee scam in history worked (the pot vanishes).

**Halqa's entire launch strategy is to stay Version A for as long as humanly possible, and to reach Version B only through a partner who already has the licence — never by getting the heavy licence ourselves.** Hold that thought; the rest of the document is just the consequences of it.

---

## 2. What we actually need to launch (Version A) — and it is NOT a "licence"

To operate legally as the notebook, you need to *exist as a real company* and *plug into someone else's money pipes.* That's it. Here is each piece, what it really is, and what it costs.

### 2.1 Becoming a company — SECP registration `[FUNCTIONAL — do this first]`
**SECP** is the Securities and Exchange Commission of Pakistan — think of it as the office that keeps the official list of every company in the country. Registering here does **not** give you permission to run a financial service. It just turns "Taha's idea" into "Halqa (Private) Limited," a legal person that can open a bank account and sign contracts.

You want a **Private Limited Company** ("Pvt Ltd"). The whole thing is done online through SECP's portal (currently called **eZfile / LEAP**). The steps, in the order they happen:

1. **Reserve the name** "Halqa" — a Rs 1,000 fee. You're checking nobody else already took it.
2. **File incorporation** — the fee depends on your declared "authorized capital" (a paper number, keep it small, e.g. Rs 100,000). At the minimum, online filing is on the order of **Rs 1,800–2,500**.
3. You receive a **Certificate of Incorporation** — your company now exists.

Worked example of the trap: agencies advertise "company registration Rs 15,000–25,000." That is not the government fee — it's the government fee (a few thousand) plus their service charge plus your tax number plus document drafting, bundled so you can't see the seams. **If you do it yourself on eZfile, the real out-of-pocket is under Rs 5,000.** Budget 15–20k only if you want an agent to hold your hand. Timeline: **2 to 5 working days.**

### 2.2 Getting a tax identity — FBR NTN `[FUNCTIONAL]`
**FBR** is the Federal Board of Revenue — the tax people. Your company needs an **NTN (National Tax Number)** before a bank will open an account for it. This is **free** and largely falls out of the SECP process. No licence, just a number. A day or two.

### 2.3 A company bank account `[FUNCTIONAL]`
Any commercial bank. It's **free to open**, but the bank will want a **minimum balance** parked in it — realistically **Rs 10,000–50,000** depending on the bank. This account is where your *revenue* lands (the aggregator pays your fees into it). Note carefully: this is *your company's* account for *your company's* money. It is **not** a pot — customer committee money never flows through it in Version A. Timeline: **1–2 weeks.**

### 2.4 Plugging into the money pipes — the payment aggregator `[FUNCTIONAL, when you want real payments]`
This is the piece people wrongly call "the payment licence." **You do not get a payment licence. You sign a merchant agreement with a company that already has one.**

A **payment aggregator** (in Pakistan: **PayFast** by APPS, **Safepay**, and newer ones) is a licensed business whose whole job is to be the pipe between your app and every bank/wallet in the country. They carry the crushing regulatory burden of moving money; you just become their *merchant*, the way a corner shop becomes a Visa merchant. You sign an agreement, they give you API keys, and now your app can trigger real Raast transfers and wallet payments.

What it costs — and this is the line in your table that was garbled:

- **Setup:** usually free to low. There is sometimes a small **monthly platform fee**; there is no "free up to Rs 10,000/month" tier in the way your table phrased it — that was a scrambled memory of the monthly fee.
- **The real cost is per transaction, called MDR (Merchant Discount Rate)** — a percentage skimmed off each payment. Published example: **Safepay charges 3.3% + Rs 33** per transaction. PayFast doesn't publish its rate, but wallet payments through it run about **1.5%–3%** and card payments **2.5%–3.5%**.

Here's the money-saving insight that should shape the whole product: **Raast is almost free.** Raast is the State Bank's own instant-transfer rail. Person-to-person Raast is **0%** by law, and even person-to-merchant Raast is under a **government subsidy** (a Rs 3.5 billion pot) that reimburses the merchant **0.5% or Rs 100, whichever is lower**, per QR transaction — running for the next few years. Wallets (Easypaisa/JazzCash) cost you 1.5–3%; Raast costs you almost nothing. **So every screen in Halqa should nudge the user toward Raast and treat wallets as the expensive fallback.** On a Rs 10,000 payment, that's the difference between paying ~Rs 5 and paying ~Rs 250.

### 2.5 Verifying the CNIC — NADRA Verisys `[FUNCTIONAL, but you can defer it]`
**NADRA** is the National Database and Registration Authority — they hold the identity record of every Pakistani. **Verisys** is their check-a-CNIC service: you send a CNIC number and a name, they tell you if it's real and matches.

To use it as a business you must be a registered company that has signed an agreement with NADRA. The pricing is **invoice-based and not published** — NADRA bills you monthly for the checks you ran. Public reference points are a Rs 10 SMS check and a Rs 300 one-off portal check; the negotiated corporate per-check rate is commonly discussed in roughly the **Rs 30–75** band, but *you will only know your number when NADRA quotes you in writing.* Your table's "35–60 per check" is a fair estimate, not a fact — treat it as a placeholder.

**The strategic point:** you do **not** need this to launch. Halqa already *collects* the CNIC at signup and stores it as the legal record. You can turn on live NADRA verification later — and even then, only verify the members who matter (say, anyone taking an early turn, or anyone a host asks to vet), rather than paying to verify every casual signup. It's a dial you turn up when revenue justifies it, not a launch cost.

### 2.6 The OTP / login code `[FUNCTIONAL]`
Sending a login code by SMS costs about **Rs 2–3.5 per message** through a bulk SMS gateway — your table is right. But note: **WhatsApp's Business Cloud API has a free tier**, and almost every Pakistani has WhatsApp. Starting with WhatsApp OTP means this line begins at **Rs 0** and only becomes an SMS cost for the few users without WhatsApp.

---

## 3. What we do NOT need yet — the heavy licences (Version B territory)

These are the licences everyone panics about. You need to *know their names* so you can confidently tell an investor "we don't need that yet, and here's exactly when we would." There are two, from two different regulators.

### 3.1 The SBP route — becoming a money-holder yourself
**SBP** is the State Bank of Pakistan — the central bank. If Halqa ever wants to hold customer money in a wallet, the licence is an **EMI (Electronic Money Institution)**, granted under the **Regulations for Electronic Money Institutions, 2019.**

The number that ends the conversation: an EMI needs **Rs 200 million** of startup capital, held at all times (it scales up from there as the money you hold grows). That is not a licence you buy on the way to launch; it is a licence you reach after raising serious investment, if ever. There is also a lighter SBP category, **PSO/PSP (Payment System Operator / Provider)**, for running payment rails — but you don't need that either, because *the aggregator in §2.4 already is one.* You're renting their PSP status.

### 3.2 The SECP route — becoming a lender/investment company
The other heavy licence lives at SECP, not SBP: an **NBFC (Non-Banking Finance Company)** licence for **Investment Finance Services**, under the **NBFC & Notified Entities Regulations, 2008.** This is the one that would bite if Halqa starts *lending its own money at scale* — which is exactly what "fund-the-gap with real money" becomes if we're not careful. Two things to know: it requires incorporating as a **public** limited company (heavier than our Pvt Ltd) and a formal SECP grant, renewed every three years.

**When would we actually trip these?** Three triggers, and we should treat each as a bright red line:
1. **We start holding the pot** (custody) → EMI territory (or use a partner).
2. **We fund empty slots with real Halqa money, at scale** → that's lending → NBFC territory (or use a partner bank).
3. **We start formally reporting members to a credit bureau** → separate regulatory conversation.

Until we cross one of those on purpose, with a lawyer's sign-off, Halqa is a software company and none of §3 applies.

---

## 4. The plan, in the order it happens

Think of it as three gates. You do not touch a gate until the one before it is paying for it.

**Gate 1 — Legitimacy (weeks, ~Rs 20–30k all-in).** Register **Halqa (Pvt) Ltd** at SECP, get the **FBR NTN**, open the **company bank account.** Now you're a real company that can sign things. Nothing here is a financial licence; it's just existing.

**Gate 2 — Real payments (a few weeks after Gate 1, cost = per-transaction MDR only).** Sign the **merchant agreement with PayFast or Safepay.** Wire their keys into the payment layer we already built. Prefer **Raast** everywhere to keep MDR near zero. Turn on **WhatsApp OTP** (free) and, when it's worth it, the **NADRA Verisys** agreement for identity checks. At this gate Halqa collects real money *between members* and earns from late fees, the turn-marketplace margin, and consented goal-leads — all without holding a pot.

**Gate 3 — Scale, and only with a partner (months/years away, investor money).** If and when funding the pot or gap-funding at scale becomes the growth lever, **do not buy the EMI or NBFC licence.** Partner with a bank or an existing EMI who already holds it, and let Halqa remain the brains and the interface. The Rs 200M EMI capital requirement is the whole reason the partner route wins.

**One recurring cost across all gates:** a lawyer. Before any real marketing spend, pay a Pakistani corporate/fintech lawyer (~Rs 50,000–100,000) for an **opinion letter** confirming that Version-A Halqa needs no SBP/SECP financial licence. That single document is what lets you sleep, and what an investor's own lawyer will ask for first.

---

## 5. Your table, corrected in one glance

| Your line | The honest version |
|---|---|
| SECP registration 15–25k | Government fee is a few thousand; DIY under Rs 5k. The 15–25k is agent bundling. `[FUNCTIONAL]` |
| Corporate bank account: free, 10–50k min deposit | Correct. `[FUNCTIONAL]` |
| NADRA API setup 50–100k | Plausible but unpublished — get it in writing. And **defer it past launch.** `[FUNCTIONAL, deferrable]` |
| Verisys 35–60/check | Estimate, not a fact (public refs: Rs 10 SMS / Rs 300 portal; corporate rate negotiated). `[FUNCTIONAL, deferrable]` |
| SMS OTP 2–3.5/text | Right — but start on **free WhatsApp OTP**. `[FUNCTIONAL]` |
| Aggregator "free up to 10k/month platform fee" | Garbled. Setup low; real cost is **per-transaction MDR**. Safepay 3.3%+Rs33; PayFast wallets ~1.5–3%. `[FUNCTIONAL]` |
| Raast 0% | Correct and better than you think — P2P free, P2M subsidised. **Push Raast everywhere.** `[FUNCTIONAL]` |
| Wallets 1.5–2.5% | Right (market 1.5–3%). The expensive fallback to Raast. `[FUNCTIONAL]` |

**The two names to never confuse in a meeting:** *SECP* registers your *company* (cheap, do it now). *SBP EMI* / *SECP NBFC* are the *financial licences* you're deliberately avoiding by staying a notebook and using a partner. Get those two straight and you'll sound like you've done this before.

---

### Sources
- SECP company incorporation fee calculator — https://www.secp.gov.pk/company-formation/fee-calculator/company-incorporation-fee-calculator/
- SECP registration of company — https://www.secp.gov.pk/company-formation/registration-of-company/
- SECP NBFC Investment Finance Services licensing — https://www.secp.gov.pk/licensing/nbfcs/investment-finance-services/
- SBP EMI regulations 2019 (Rs 200M capital) — https://www.sbp.org.pk/psd/2019/C1-Annex-A.pdf and https://www.sbp.org.pk/PS/EMI.htm
- SBP Raast (P2P free) — https://www.sbp.org.pk/dfs/Raast.html
- SBP Raast P2M subsidy circular — https://www.sbp.org.pk/psd/2025/c3.htm
- NADRA verification services & fee structure — https://www.nadra.gov.pk/verification and https://www.nadra.gov.pk/feeStructure
- PayFast fees review — https://rapidgateway.pk/resources/payfast-pakistan-review
- Payment-gateway MDR explainer — https://www.simpaisa.com/blogs/understanding-payment-gateway-fees-in-pakistan-mdr-setup-hidden-costs/
