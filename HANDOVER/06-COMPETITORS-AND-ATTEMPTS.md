# 06 · COMPETITORS AND THE 25 ATTEMPTS

Condensed from `docs/HALQA-ATTEMPTS-ARCHIVE-2026-08-09.pdf` (21 pp, 25 cases,
9 markets) and `docs/HALQA-COMMITTEE-DOSSIER-2026-08-06.pdf` (16 pp).

Every case reduced to the same six questions, because the differences between
these companies are almost entirely **architectural** and almost never about
execution quality: **custody · member sourcing · order · who bears default ·
revenue · licence.**

---

## The finding, before the evidence

> Of twenty-five attempts, **every single failure held member money, guaranteed
> member money, or removed the rotation that makes a committee a committee.**
> Every durable success either kept the money outside itself, or paid a full
> regulatory toll to hold it legitimately.
>
> There is **no case of a well-executed no-custody committee product failing**,
> and **no case of an unlicensed custody product surviving.**

---

## The eight killers

| # | Killer | Cases |
|---|---|---|
| **1** | **Custody** — holding the pool | Punjab co-ops, TAG, SadaPay, Oraan's ceiling, Braid (by proxy), Sidra Humaid, Saradha |
| **2** | **Guarantee burden** — platform as payer of last resort | eMoneyPool |
| **3** | **Stranger pooling** — trust without a graph | Yahoo Tanda, Puddle, Oraan v1 |
| **4** | **Amputating the credit half** — no early pot | UBL Kommittee |
| **5** | **Adding interest** to a riba-defined culture | UBL Kommittee; every auction model in Pakistan |
| **6** | **Record without settlement** | Udhaar Book, DigiKhata |
| **7** | **Monetising the member** | Oraan v1; every subscription ROSCA app |
| **8** | **Regulatory ambush** — rules written after a scandal, around someone else's model | India post-Saradha; Pakistan post-nano-lending; the coming committee rules |

Halqa has an architectural answer to each — see `02`.

---

## PAKISTAN — six attempts

### 1 · UBL Kommittee Account — the most useful exhibit we have

A deposit product from one of Pakistan's largest banks, marketed under the
committee name. 12, 18 or 24 months; Rs 5,000–1,000,000 monthly; at the end you
receive your contributions plus a "bank contribution" of **one quarter, one half
or one full monthly installment** respectively. Early exit forfeits the bonus.
Missed months forgiven via an "installment holiday."

**Three amputations happened in translation:**
- **The rotation went** — nobody receives a pot early, deleting the credit half and
  the reason the early half of every real committee joins.
- **The peers went** — no group, no social spine, hence a "holiday" feature no
  genuine committee could offer and remain itself.
- **Interest came in** — a fixed return on deposits, riba in exactly the form
  committee culture defines itself against.

**The arithmetic the brochure does not print (modelled):**
```
24-month plan at Rs 100,000/month → pay in Rs 2,400,000, receive Rs 2,500,000
Rs 100,000 bonus on an average balance ≈ Rs 1,250,000 over 2 years ≈ 2% per annum
```
The saver surrenders everything a committee provides in exchange for materially
**less than an ordinary savings account** was paying.

`KILLER 4 + 5` — **The lesson, and it is the strongest single argument in the
pitch:** a balance-sheet institution **cannot** digitise the committee, because its
value lives in exactly the things a balance sheet must remove — peer credit
without interest, social enforcement without collateral, and money that never
becomes the institution's liability. **The same fact closes the category to
JazzCash and Easypaisa.**

### 2 · Oraan — the well-executed custody committee

Founded 2018 by Halima Iqbal, a former investment banker; $3M seed in 2021.
Custody, stranger pooling, **member fees**, platform absorbs default. Oraan's own
research put ROSCA participation at ~41% of Pakistanis and ~$5bn rotating annually.

**Oraan is not failing** and the archive must not pretend otherwise: through
2025–26 it launched fractional gold savings that reportedly grew ~75× in seven
months, signed a deal licensing its platform to a regional bank, and raised fresh
funding from Epic Angels with Wavemaker and i2i in July 2026.

**But read where the growth came from.** The engine is **gold savings and B2B
licensing — not the custody committee it was founded on.** After roughly eight
years the fee-charging, default-absorbing, stranger-pooling committee product had
not cracked the mass market.

`KILLER 1 + 3 + 7` — **the strongest domestic evidence that custody committees do
not scale in Pakistan even when executed well.** Its pivot concedes our thesis and
independently validates two items already on our roadmap (gold, white-labelling).

### 3–4 · Udhaar Book and DigiKhata — the notebook apps

Digital khata (merchant ledger) apps with committee registers built in. The
organizer records who paid, sends payment requests with one tap, exports PDF
proof. No custody — but only because **no money moves through them at all**.

**The decisive limitation is one word: the payments are asserted, not settled.**
The organizer types that Bilal paid; nothing verifies it. This is exactly the model
Mehmood et al. (2018) warned about — payment legitimacy *"can be questioned and
subject to fraud, limiting usefulness for credit rating."*

`KILLER 6` — Simultaneously **validation** (committee record-keeping is wanted),
**warning** (a register without settlement is a nicer notebook), and — should one
bolt on real settlement — **the most plausible fast follower**, since they already
hold millions of merchant relationships. **Halqa's ledger records settlements.
That single word is the moat.**

### 5 · The Sidra Humaid committees — the fraud template

A Karachi home-business owner ran monthly ballot committees through Facebook groups
for 7–10 years. December 2022: she announced she could not pay. **~Rs 420 million
across 117 committees** and roughly 200 contributors, kept with no written records.
She went into hiding.

Total concentrated custody; strangers from social media connected to *her* and not
to each other; ballot draws with no verifiability; new money paying old
obligations.

`KILLER 1 + 3` — the template generalises to two necessary preconditions:
**custody concentrated in one party, and trust extended beyond the radius where
members can verify each other.** The traditional committee caps the second through
locality (*"if he is local, then we know he lives here. His house and shop are
here"*) and the first through rotation. **Digitisation that removes locality
without replacing verification, or recreates central custody at internet scale,
industrialises the fraud rather than the committee.**

### 6 · The Punjab cooperative societies — the memory

1991–92: four Punjab financial cooperatives failed together amid misappropriation
allegations. Reported losses **Rs 10–23 billion across as many as 2.6 million
accounts**, a very large share of them small savers.

`KILLER 1` — the background radiation of this entire market. The cooperatives were
the last formal attempt to institutionalise community savings in Pakistan, and
their collapse taught two generations that **handing the pool to an institution is
how you lose it.** This is why *"your money never touches us"* is not a compliance
line here — it is the most persuasive sentence a Pakistani savings product can
say, and **only a no-custody operator can say it truthfully.**

### Adjacent — the custody road's body count

Not committee products, but the path Halqa refused:
- **TAG** — YC-backed super-app; SBP revoked approvals in 2022 amid findings that
  included document forgery; ordered to refund wallet balances and pull its apps.
  Dead.
- **SadaPay** — the category's poster child, a million users in record time; sold
  to Turkey's Papara in 2024 for a reported **sub-$50M, below its last valuation**,
  because EMI economics never closed.
- **Sector-wide:** roughly **half the entities that pursued or held EMI licences
  have withdrawn or shut.**

That is the toll of standing in the middle of the money, paid by companies whose
whole business was payments.

---

## THE LIVING — four models that work

### 7 · Money Fellows (Egypt) — custody done properly, at the price custody costs

Reported: **8M downloads, 1M+ customers served, ~350,000 monthly actives, $1.5bn
processed across 2M+ completed circles, profitability reached in 2025.** ~$60M
raised. Morocco entry planned with Attijariwafa Bank.

- **Custody:** yes — digital trustee and matchmaker.
- **Members:** strangers, matched and vetted with credit scoring.
- **Order:** **slot position is priced** — the service fee scales with how early
  you collect. **The fee IS the price of liquidity.**
- **Default:** **the platform.** It fills unsold slots and covers defaults from its
  own capital, with a reported **under 8% of active slots** requiring that
  injection.
- **Licence:** entered the **Central Bank of Egypt regulatory sandbox**, moving
  from grey market to formal recognition — which unlocked the Banque Misr card
  partnership.

**What it proves for us:** digitised committees scale to millions and to profit;
pricing the slot position works and is the same logic as our band-gated seats and
turn marketplace; credit-scoring the order works; **a sandbox is the door out of
the grey market.**

**What it carries that we refuse:** being the circle's counterparty is a permanent
balance-sheet exposure that took years of licensing and capital to make safe. It
monetises members. It pools strangers — which is *why* it must underwrite them.
The three choices are one choice, made three times.

### 8 · Hakbah (Saudi Arabia) — the regulator as first partner

Reported: **1.3M+ registered users**, ~70% young savers; ~$9M raised; operating
under a **SAMA sandbox permit**; Visa and Tarabut (open banking) integrations.

Hakbah's insight was institutional, not mechanical: it treated the *jam'iyya* as a
cultural institution to be respected rather than a market to be disrupted, and made
the central bank its **first partner instead of its eventual problem.** The closest
existing analogue to the posture Halqa intends with SECP.

### 9 · Mapan (Indonesia) — the organizer as the growth engine

Founded 2009 as RUMA; digitised the Indonesian *arisan*; acquired by GO-JEK in
2017 as its rural rail; later scaled past a million users with a $15M round.

- **Members recruited by village leader-agents**, largely women, who form and run
  circles in their own communities.
- **The pot is frequently delivered as goods**, not cash.
- **Revenue: margin on the goods**, shared with agents as commission — reported
  ~10% on electronics, ~5% on other categories.

**Two findings, both directly applicable:** the **unit of growth is the organizer,
compensated for organising**; and **a goods pot suppresses default** — a member
repaying "the refrigerator in the house" behaves better than one repaying an
abstraction, and a delivered good cannot be re-lent, re-hidden, or claimed by
relatives.

### 10 · The Money Club (India) — graduated trust as underwriting

Founded 2016 by two IIT Kharagpur alumni; $1.7M pre-Series A from SOSV and Venture
Catalysts. Reported 200,000+ users, ~17,000 clubs, ~Rs 40 crore pooled. Serves both
the user's own trusted circle and platform-formed verified clubs.

**The durable idea is graduated exposure:** members start in tiny clubs with small
amounts, and only sustained clean behaviour unlocks larger clubs and larger sums.
Underwriting by demonstrated history rather than documents.

**Their refinement, which we adopt:** the permitted **amounts**, not only the
permitted seats, should scale with history.

---

## INDIA — where the state built the cage

### 11–12 · Shriram Chits and Margadarsi — the regulated giants

**Shriram:** annual auction turnover approaching **Rs 3,000 crore**, **2.2 million
subscribers**, 465 branches, ~6,000 employees and **65,000 agents**.
**Margadarsi:** turnover ~**Rs 14,341 crore**, over **6 million subscribers across
sixty-plus years**.

Both: statutory foreman with a **100% security deposit** lodged with the Registrar
before a scheme may run; strangers recruited by a vast commissioned agent force;
**auction ordering**; commission capped by statute at 5% (7% after the 2019
amendment); per-scheme sanction under the Chit Funds Act 1982.

**The uncomfortable establishment:** custody committees **can** endure at enormous
scale — provided the operator pays the full statutory toll. That is a viable
business. It is not a startup, it is not capital-light, and **it is not available
in Pakistan, where no such framework exists to buy legitimacy from.**

`ENABLER` — and the single best proof anywhere that **committee distribution is an
agent business, not a marketing business.** 65,000 agents, not an advertising
budget, built 2.2 million subscribers.

### 13 · KSFE (Kerala) — the state as foreman

Established 1969, owned by the Kerala government, operating chitties under the Chit
Funds Act 1982 through **more than 680 branches**. Its *Pravasi Chitty* targets
non-resident Keralites (₹1 lakh–₹50 lakh over 25–60 months).

**The detail worth stealing:** on the death of a subscriber, **future liability for
the remaining installments on a prized chitty is waived, up to a stated limit
(typically ₹10 lakh).** That is precisely the death convention identified from
field practice — implemented formally by a state operator and **priced as
insurance rather than left to discretion.** It confirms both the convention and
the mechanism: this is a takaful event, and it belongs in circle-level cover at
Stage 2.

Also proof that the **diaspora committee is a real product** — relevant to the
approved remittance-committee direction.

### 14 · MyPaisaa — what full regulation costs a startup

India's first fully digital chit fund registered with the Registrar of Chits.
Reported: **under $980,000 raised** across five rounds, and roughly **20,000 app
installs** in its first two years.

`KILLER 8 (inverted)` — **the most instructive number in the archive.** In a chit
sector estimated above **$50 billion**, the first fully-digital registered operator
has raised under a million dollars. **When every scheme requires a sanction and a
100% security deposit, digital scale moves at the Registrar's pace.** Regulation of
this shape protects members and freezes innovation in the same motion — the
strongest possible argument for engaging Pakistan's regulator **before** the
framework is drafted.

### 15 · Saradha — the collapse that wrote the law

A West Bengal deposit scheme that collapsed in 2013 with reported losses around
**₹2,500 crore** affecting roughly **1.7 million depositors**. Not a chit fund in
substance — a Ponzi using the chit vocabulary.

Its consequence is the point: Saradha produced the **Banning of Unregulated Deposit
Schemes Act 2019**, criminalising deposit-taking outside licensed forms.

`KILLER 1 → 8` — **the sequence Pakistan has not yet run.** India regulated after
Saradha. SECP built the lending whitelist after the nano-lending deaths. **Pakistan
will regulate digital committees after its first large platform fraud**, and the
rules will be drafted around whichever operator is most visible at that moment.
This is the entire case for the first-clean-actor strategy.

### What the Chit Funds Act 1982 actually requires

Per-scheme sanction from a state Registrar of Chits · **security deposit of 100% of
the chit value** with the Registrar before the scheme runs · foreman's commission
capped at 5% (7% after the 2019 amendment, which also permitted video-conference
draws) · auction discount capped at 30% (40% in some states).

**Whom it binds:** the **foreman** — the person conducting the chit. In a Pakistani
analogue, **Halqa's hosts would be the regulated persons, not the platform** — and
the auction family the Act really polices is one Halqa already refuses.

---

## AFRICA

### 16 · StokFella (South Africa) — a decade, and a ceiling

Launched 2016 into a stokvel market of roughly **800,000 groups and 11 million
members holding around R50 billion.** Reported **~42,000 members** on the platform
as of 2025.

Not a failure — a **positioning lesson.** Forty-two thousand in a market of eleven
million is what happens when a product occupies the narrow space between the banks'
group accounts and a free notebook. **Be the rail and the record, or be squeezed
between them.**

### 17 · FNB Stokvel accounts (South Africa) — the bank product that works

FNB took stokvel banking fully digital, targeting the R50bn market with dedicated
group accounts — multiple signatories, group visibility, interest on balances.

**Set this beside UBL and the pattern completes itself.** Both are banks serving
group savings. **FNB succeeds because South African stokvels are frequently
*accumulating* clubs** — everyone saves, everyone gets paid at year end — so a bank
account genuinely serves the instrument. **UBL failed because the Pakistani
committee *rotates*,** and a bank cannot provide the early pot without becoming a
lender to eleven people it never underwrote.

> **Banks can hold group savings. Banks cannot rotate group credit.**
> Halqa's entire opportunity lives in that second sentence.

### 18 · Chamasoft (Kenya) — the pivot to bookkeeping

Kenya's chamas are numerous and substantial, and contributions already move
perfectly well over M-Pesa. Chamasoft serves them as a **management tool** —
invoicing, member statements, cashbooks, an e-wallet linked to M-Pesa.

**The instructive fact is what did not happen.** No consumer chama app has won
Kenya. Where an excellent payment rail already exists, **the platform layer that
survives is the record.** A preview of Pakistan after Raast matures.

### 19 · The Nigerian cohort — Thrifto, Adashi, CircleFunds, Ajo App

Four current platforms digitising *ajo*, *esusu* and *adashe* for a country where
**38+ million adults** remain outside the formal financial sector. Mostly
bank-integrated rather than holding funds; groups and collectors as the member
source.

**Adashi's decision to digitise the collector rather than the saver is the same
strategic bet as Halqa's organizer focus**, running simultaneously in another
market. Worth monitoring as the closest live comparable to our distribution thesis.

---

## UNITED STATES — six attempts, one survivor, one pivot

### 20 · Tanda by Yahoo Finance — four months

Launched January 2018, shut May 2018. Groups of five or nine; **~37,000 installs**;
never in the top 1,500 of the App Store's Finance category. Performance was
**encouraging in the Philippines and Mexico, poor in the United States.**

`KILLER 3` — a global brand with unlimited distribution could not make Americans
rotate money with strangers. **The trust graph is a precondition, not an output** —
and the geographic detail proves the constraint is **cultural, not technical.**

### 21 · eMoneyPool — nine years, and the cost of standing behind everyone

Founded Phoenix 2010 by brothers Francisco and Luis Cervera to digitise tandas and
cundinas. **It reported members' payment histories to credit bureaus.** Ceased
operations around November 2019.

`KILLER 2` — the most sympathetic failure in the archive, because **its core idea
was right and is now Halqa's rung three.** What killed it was standing behind the
pools with its own balance sheet while charging members too little to fund the
guarantee. Nine years is a long time to be right about the destination and wrong
about the vehicle.

### 22 · Esusu — the pivot that became a unicorn

Incorporated 31 May 2018 by Abbey Wemimo and Samir Goel, named for the West African
rotating savings practice, launched as a communal savings app. Finding the US ROSCA
market too thin, they pivoted to integrating with property-management software and
reporting **on-time rent payments** to Equifax, Experian and TransUnion. January
2022: **$130M Series B led by SoftBank Vision Fund 2 at a $1 billion valuation.**

> **THE SINGLE MOST IMPORTANT CASE IN THE ARCHIVE.**
> Esusu abandoned moving the money and kept only the recording of it — and that is
> where all the value turned out to be. They did not build a savings product. They
> built a machine that **converts an obligation people already honour into a formal
> credit record**, and that machine was worth a billion dollars.
>
> In America the obligation people already honour is **rent**.
> In Pakistan it is **the committee** — which Kamran's informants rank *above* rent.

**Halqa is the Esusu thesis applied to the largest un-recorded obligation stream in
Pakistan.** The instruction that follows: the committee is the funnel; **the credit
record is the company.**

### 23 · Braid — killed by the bank in the middle

San Francisco group-payments startup founded 2018–19 by Amanda Peyton, backed by
Index and Accel. Shut September 2023. Its sponsor-bank issue left the company, in
the founder's words, *"effectively in a coma from July 2022 to January 2023"* — a
payments company processing **zero payment volume** — after which macro conditions
and the SVB collapse closed the funding path.

`KILLER 1 (by proxy)` — a competent, well-funded team destroyed by an organ it did
not control. **Any architecture that requires someone else to hold the money
inherits that party's ability to switch you off.** A record-only design has no such
organ — **the concrete answer to anyone who calls Halqa's no-custody stance
ideological.**

### 24 · Puddle — adverse selection, on schedule

Early-2010s US platform letting people pool small amounts and draw credit lines
against the pool, with strangers participating.

`KILLER 3` — the textbook outcome. When the pool is anonymous and the social bond
is zero, the members most eager to draw are the least likely to repay, and the good
risks leave first. **A committee's underwriting IS its membership** — remove the
social selection and no amount of product design replaces it.

### 25 · Mission Asset Fund — the proof that the thesis is measurable

A San Francisco **non-profit** running "Lending Circles" based on the Mexican
tanda. Groups of **6–12 people**; contributions typically **$50–200/month**; each
month one member receives the pot as a **zero-interest loan** of **$300–2,400**.
MAF formalises the arrangement as a loan, services it, and **reports every monthly
payment to all three major credit bureaus.**

> **THE NUMBER TO PUT IN FRONT OF EVERY INVESTOR AND EVERY REGULATOR:**
> **Reported average credit score increase for participants: +168 points.**
>
> This is the entire Sakh and Credit Passport thesis, **already measured**, in a
> different country, by an organisation with no incentive to overstate it.
> Rotating committee participation, recorded properly and furnished to a bureau,
> moves a person's formal creditworthiness by a very large margin.

**Its one limitation is the one Halqa is built to solve:** MAF depends on
philanthropy because it serves small numbers at high touch. **The unsolved problem
it leaves is how to do this at commercial scale without charging the member** —
which is exactly what Halqa's merchant-and-institution revenue model answers.

---

## The five conclusions

**1 · Custody is the variable, and it is binary in effect.** Every failure held,
guaranteed, or depended on a third party that did. Every enduring custodian paid
the full regulatory toll first. **There is no middle path in the record** — and the
toll is not purchasable in Pakistan, because no framework exists to buy it from.

**2 · The trust graph is inherited, never manufactured.** Tanda and Puddle died of
stranger pooling with excellent funding. Money Fellows survives it only by
underwriting with its own capital. Mapan, MAF, the Nigerian collectors, Shriram's
agents and the Indian chit branches all begin from a group or a person that already
existed.

**3 · Distribution is agents, not advertising.** Shriram's 65,000 agents. Mapan's
village leaders. Adashi's thrift collectors. MAF's community organisations.
Margadarsi's branch network. **Not one case in twenty-five grew by acquiring
individual users through marketing.** The committee is sold by a person to their
own circle — which makes the offline organizer the correct acquisition target and
field sales the correct motion, however unfashionable that reads in a pitch.

**4 · The value is in the record, and it has been measured.** Esusu abandoned the
money and became a unicorn. eMoneyPool had the right idea and died carrying the
money. Chamasoft survives as the record where M-Pesa carries the money. MAF's
participants gained **+168 points**. Four independent cases, one conclusion.

**5 · Regulation arrives after the scandal and shapes itself around whoever is
visible.** India after Saradha; SECP after the nano-lending deaths. Money Fellows
and Hakbah both bought legitimacy cheaply by entering a **sandbox before scale**.
That door is currently open in Pakistan and will not stay open.

---

## Where Halqa sits

Halqa's design occupies **the only quadrant with no failures in it**: an intact
rotating instrument, inherited social circles, zero custody, zero member fees,
agent-led distribution, and a settled record furnished to a bureau.

Each element is independently validated by a success in the archive — the
instrument by Money Fellows, the circles by Mission Asset Fund, the no-custody rail
by Chamasoft, the agents by Mapan and Shriram, the record-as-product by Esusu, the
early regulator by Hakbah.

**No company in the archive holds all six at once.**

---

## The competitive threat we name wrongly

Every earlier document treated **Oraan** as the domestic competitor. That is wrong.

| Player | Real threat | Why |
|---|---|---|
| Oraan | **Low** | Custody, licence, member fees, stranger pooling — every structural choice is one we deliberately inverted. Proof of category, not a competitor for our position. |
| Money Fellows | **Low near-term** | Would enter with a custody model needing a Pakistani licensing programme; slow, capital-heavy, and stranger-pooling does not fit a market organised around pre-existing circles. |
| Notebook apps | **Low on substance, real on mindshare** | Cannot produce a credit history. But free, simple, already installed, and they shape what users expect a "committee app" to be. |
| **JazzCash / Easypaisa** | **HIGH — this is the real one** | Tens of millions of users, the wallet the money already sits in, a payments licence, agent networks, brand trust. If either ships a committee module they start with distribution we cannot match. |

**Why the wallets probably will not, and the defence:**
- **Their licence is the obstacle.** As EMIs, holding balances *is* the business. A
  no-custody committee contradicts the model; a custody one imports the exact
  deposit-taking scrutiny that makes committee products legally fraught for a
  licensed institution. **UBL is the live proof.**
- **Their user base is not organised in circles.** They have individuals; the
  committee needs pre-formed groups with an organizer. They would have to pool
  strangers — the Money Fellows problem, in a market that resists it.
- **Social products are not their competence.** Telco-adjacent wallets are
  transaction rails.

**The defensive move:** become the layer they would rather integrate than rebuild.
Ship the **Committee-as-a-Service API** earlier than instinct suggests — an
integration path *is* the consumer defence.

Yes boss
