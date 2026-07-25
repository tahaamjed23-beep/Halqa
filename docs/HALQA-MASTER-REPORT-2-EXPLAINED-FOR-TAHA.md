# Halqa — Explained For You (Taha), From Scratch
### Everything in Report 1, in plain English, with examples
### So you can explain any part of it to anyone, with zero prior finance

> How to use this: read it once end-to-end. Every technical word from the investor
> report is defined here in plain language, with a worked example, and a "**say it
> like this**" line you can repeat almost verbatim in a meeting. If someone asks you
> *"what does X mean?"*, this doc has the answer.

---

## 1 · The whole idea in three sentences
A *committee* (kameti) is a group who each put in a fixed amount every month, and
each month one person takes the whole pile, until everyone has had a turn. It's how
most of Pakistan saves and borrows — but people get robbed by the organiser, or the
early-taker stops paying, and your money earns nothing while you wait. **Halqa is a
committee that can't be stolen from, punishes people who don't pay, and makes your
money grow while you wait.**

---

## 2 · The single most important concept: SAVER vs CONSUMER

Everything else hangs on this, so understand it cold.

- In a committee, **when you take your turn changes what you are doing.**
- If you take a **late** turn (say, 9th out of 10): you pay in for months first, then
  collect at the end. You're basically **saving**. You are a **SAVER**.
- If you take an **early** turn (say, 1st): you get the big pile *before* you've paid
  most of it. You're basically **borrowing** from the group and paying it back over
  the coming months. You are a **CONSUMER**.

**Worked example** — 10 people, Rs 10,000 each per month, Rs 100,000 pile:
- Person 1 (consumer) gets Rs 100,000 in month 1 after paying only Rs 10,000. They
  still owe 9 more payments = Rs 90,000. **If they vanish, the group loses.** This is
  where nearly all the risk is.
- Person 10 (saver) pays Rs 10,000 for 9 months, then collects Rs 100,000. They can't
  really cheat anyone — they always paid in more than they'd taken out.

**Why this matters:** we can be *relaxed* with savers (low risk) and *strict* with
consumers (high risk). One set of rules for everyone would be dumb. **Say it like
this:** *"A committee is really two things at once — saving and borrowing. We treat
the saver and the borrower differently, because only the borrower can hurt the group."*

---

## 3 · The finance words you must be able to explain

**ROSCA** — the academic name for a committee: "Rotating Savings and Credit
Association." *Say it like this:* "ROSCA is just the technical word for a kameti."

**Pot / pile** — the total money collected each round that one member takes.

**Forward liability** — how much a person *still owes* after they've taken the pot.
Example: consumer in turn 1 has Rs 90,000 of forward liability. *This is the number we
must secure.*

**Default** — when someone stops paying what they owe. *Say it like this:* "A default
is a broken promise to pay."

**Probability of Default (PD)** — the chance someone defaults (e.g. 2%).
**Loss Given Default (LGD)** — if they default, how much you actually lose (e.g. you
lose 100% of an unsecured loan, but maybe only 30% if you repossess an asset and sell
it). **Expected Loss (EL) = PD × LGD × amount.** *Example:* PD 2% × LGD 50% × Rs 100k =
Rs 1,000 expected loss. Banks set aside money ("provisions") for this. We do too.

**Collateral** — something valuable the borrower puts up that you can take if they
don't pay (a house for a mortgage, the phone for phone-financing). *Say it like this:*
"Collateral is the safety net — if you don't pay, we take the thing."

**Set-off / lien / pledged** — if a person has money parked *with us* (their own
money) and they miss a payment, we're allowed to take it from *their own* parked money
to cover it. That's "set-off." "Pledged" means that parked money is locked as a
promise against their committee. *Important:* if the money isn't locked (pledged), we
can't rely on it — they'd just withdraw it before defaulting.

**First-loss / guarantee fund** — a pot of *Halqa's own* money we use to instantly pay
the group when someone defaults, so members never lose. "First-loss" = we take the hit
first. *Say it like this:* "If someone doesn't pay, we cover it out of our own pocket
so you never lose — that's why you trust us over a normal committee."

**Credit guarantee** — an outside company that promises to reimburse *us* if defaults
spike beyond normal. Pakistan has one built for this called **NCGCL**. *Think of it as
insurance for our guarantee fund.*

**Takaful** — Islamic insurance (no interest, members pool donations to help whoever's
hit). Important nuance: **credit-life takaful only pays if a borrower dies or becomes
disabled — NOT if they simply refuse to pay.** So takaful is a nice extra for members,
but the real default cover is the *credit guarantee* above. *Say it like this:*
"Takaful covers death and disability; a credit guarantee covers actual default —
they're different tools."

**Float** — money that sits idle for a short time between when it's collected and when
it's paid out. If everyone pays on the 1st and the winner is paid on the 30th, that
pile sits for a month. We can invest it for that month and give the profit to savers.
*Say it like this:* "Float is money waiting around — we make it earn something instead
of sleeping."

**Interest / riba** — extra money charged for lending. Forbidden in Islam (riba).
Committees are popular partly because they charge **no interest**. Our fees are for
*service and position*, not interest — that keeps it Shariah-friendly.

**Ijara / Murabaha** — two Islamic ways to sell something on installments without
charging interest. **Ijara** = lease-to-own (you rent it, and it becomes yours after
the last payment; until then *we own it*). **Murabaha** = we buy it, sell it to you at
a disclosed markup, you pay in installments. Both let us **keep legal ownership until
you finish paying** — which is how we can lawfully take the asset back if you stop.
*Say it like this:* "We don't 'seize' anything — until you finish paying, the phone is
legally still ours, so taking it back is just us collecting our own property."

**Collective Investment Scheme (CIS)** — when you pool lots of people's money and
manage it for a return, the regulator calls that a "fund" and it needs a licence.
*Why you care:* a giant 10,000-person committee with random payouts can start to look
like a CIS — which is why the huge committees must be tested in the sandbox first.

**Money-market fund / Islamic income fund** — a very safe kind of investment fund that
earns a modest return (~10–11% right now in Pakistan) and you can pull your money out
in a day or two. This is where the **Vault** puts savers' money.

---

## 4 · The regulator / licence words

**SECP** — Securities and Exchange Commission of Pakistan. The regulator for companies,
funds, and non-bank finance. **Akif Saeed is its Chairman** (the boss). **SBP** — State
Bank of Pakistan — the *banking* regulator (payments, e-money).

**Licence** — official permission to do a regulated activity. Different activities need
different licences:
- **EMI (Electronic Money Institution)** — needed only if you *hold people's money* /
  issue a wallet. **We avoid this by never holding the pot.**
- **NBFC (Non-Banking Finance Company)** — needed to *lend* or run finance activities
  (like our asset product at scale). Oraan has this one ("Investment Finance Services").
- **Distributor registration** — a *light* SECP registration that lets us *offer* an
  existing fund to users (for the Vault) without being a fund manager ourselves.
- **Investment Adviser** — needed if we *recommend* specific funds (heavier bar).

**AMC (Asset Management Company)** — a licensed company that runs investment funds.
**Mahaana** is Pakistan's first fully-digital AMC. We don't need to *be* one — we can
*plug into* one.

**Trustee / CDC** — In a Pakistani fund, the law splits two jobs: the AMC *decides* how
to invest, but a separate **Trustee** *physically holds* the money and assets. The main
trustee is **CDC (Central Depository Company)**. *Why this is gold for us:* if the
Vault's money is held by CDC (not by us), **we can offer savings/investment without
holding anyone's money and without a heavy licence.** *Say it like this:* "Your money
sits with CDC, a licensed custodian — not with Halqa. Even if Halqa disappeared, your
money is still yours."

**Regulatory Sandbox** — a "learner's permit" from SECP: they let you test a new
financial product with real users, at small scale, under supervision, *without* a full
licence, for ~6 months. Then they decide whether to license it. **This is the single
most valuable thing Akif can give us** — it's how Money Fellows got started in Egypt.

**KYC (Know Your Customer) / CDD** — the identity checks you must do (CNIC, etc.) so you
know who your users really are.

**NADRA Verisys** — NADRA's service to confirm a CNIC is real and belongs to the person.

**Credit bureau (TASDEEQ / DataCheck / eCIB)** — companies that keep everyone's
borrowing/repayment history. If we can *report* a defaulter to a bureau, it damages
their credit everywhere — a powerful deterrent. *Reading* a score needs a partner
agreement; *reporting* needs a licence.

---

## 5 · The CS / tech words (the app under the hood)

**Frontend / Backend** — frontend is what the user sees (the app screens); backend is
the server brain that stores data and does the logic.
- **TypeScript** — the programming language we use (JavaScript with safety checks).
- **React + Vite** — tools to build the app's screens fast. **Capacitor** — wraps the
  web app into a real Android/iOS app.
- **Node.js + Express** — the backend server. **Prisma** — the tool that talks to the
  database in a safe, typed way. **PostgreSQL** — the database (where all the data
  lives).
- **Vercel** — where the app is hosted (runs "serverless" = we don't manage servers).
  **Supabase** — managed PostgreSQL in the cloud. **"Region sin1"** — we put the app in
  Singapore right next to the database; before that they were far apart and the app was
  ~60× slower. *Lesson you can quote:* "co-locating the server and database fixed the
  slowness."

**Double-entry ledger** — the accounting method where every rupee movement is recorded
twice (a debit and a matching credit) so nothing is ever lost or invented. *Why it
matters:* it's how banks keep books, and it's how we "record the money without holding
it." *Say it like this:* "We write every payment down twice so the books always
balance and there's no pile of money to steal."

**JWT / bcrypt / OTP / PIN / WebAuthn** — security pieces. **JWT** = the login token
that proves you're you. **bcrypt** = the safe way we scramble passwords. **OTP** = the
one-time code texted to your phone. **PIN** = the 4-digit code every time you open the
app. **WebAuthn** = fingerprint/face unlock.

**getUserMedia / Geolocation / Nominatim** — the camera (to scan your CNIC), the GPS
(to record your home), and the service that turns GPS coordinates into an address.

**API** — a way for two systems to talk. E.g. a "Raast API" lets our app ask a bank to
collect a payment. *Say it like this:* "An API is a plug — it lets our app connect to
the bank, the fund, or the bureau."

**Raast / RTP / PISP** — Pakistan's instant payment system (Raast). **RTP** = we send
a payment *request*, the user taps "approve." **PISP** = the upcoming feature where the
user approves *once* and then we can auto-collect every month (true auto-debit). It's
"in testing." *Say it like this:* "Real auto-debit isn't live in Pakistan yet — even
Oraan doesn't have it — but Raast is building it, and we're first in line."

**Card-on-file (MIT)** — like your Netflix/Claude subscription: your card stays saved
and gets charged automatically each month, and you can't just remove it while you owe.
This *does* work in Pakistan today for people with cards. It's our best auto-collect
for now.

---

## 6 · The model, walked through with one story

Meet **Amna** (wants Rs 100,000 now for her shop) and **Bilal** (wants to save Rs
10,000/month with discipline).

1. **They sign up.** Both give CNIC (scanned by camera), home location (GPS), and job.
   Bilal (a **saver**) needs nothing more. Amna (a **consumer**, wants an early turn)
   must show she can afford the payments — her income or her husband's — and signs a
   **personal guarantee (PG)**.
2. **Eligibility filter.** Amna is only shown committees whose monthly payment she can
   actually afford (matched to her income "band"). She can't join one that would break
   her — so she can't blow up in it. *This is the cheapest way to prevent default:
   never let the wrong person in.*
3. **They join a committee.** Bilal takes a late turn (low risk, no PG). Amna takes an
   early turn — so she must **pledge some money in her Vault** or her turn is secured
   another way.
4. **Money moves.** Each month everyone's payment is auto-collected (card-on-file or
   Raast) and routed straight to that month's winner. **Halqa never holds the pile.**
5. **Bilal's money grows.** While Bilal waits for his late turn, his contributions sit
   in the **Vault** — invested in a safe fund **held by CDC**, earning ~10–11%. A normal
   committee would've let that money rot.
6. **If Amna misses a payment (recovery ladder):**
   - First we retry the auto-charge.
   - Then we take it from **Amna's own pledged Vault money** (nobody else is touched).
   - If it's an **asset committee** (she financed a phone), we can **remotely lock the
     phone** and, if needed, **take it back** (legally — we still own it until she
     finishes paying) and resell it.
   - If there's still a gap, **Halqa's guarantee fund pays the group immediately** so
     no member loses. We then chase Amna: report her to the **credit bureau**, and if
     needed use her signed PG to get a **court order** to recover.
   - A **credit guarantee (NCGCL)** reimburses our fund if a whole bad month happens.
7. **The result:** Bilal got growth and safety; the group never lost money; Amna had
   every reason to pay and every consequence if she didn't. *That's the whole machine.*

---

## 7 · The three products, in one line each
1. **The Committee** — the digital kameti (the core; buildable now).
2. **The Vault** — savers' money grows in a CDC-held fund (needs an AMC partner + a
   light licence).
3. **Asset Committees** — buy things on installments where the item is the collateral
   (needs a finance partner/licence + some capital).
Plus two advanced ones for later/sandbox: **Hyper "Bazaar" committees** (huge, random-
payout, tradeable turns) and **Float** (savers earn on money-in-waiting).

---

## 8 · "What takes what" — remember these five buckets
- **TODAY** = we can build it now (the committee, the app, scoring, filtering).
- **PARTNER** = needs a handshake deal, no licence (AMC for vault, PSP for card
  auto-debit, TASDEEQ for bureau reads, takaful company).
- **LICENCE** = needs SECP/SBP permission (distributor for vault, NBFC for asset
  finance, Raast PISP for real auto-debit).
- **SANDBOX** = needs supervised testing (hyper committees, the guarantee model, float).
- **CAPITAL** = needs money (the guarantee fund, asset inventory, NBFC minimum equity).

*Say it like this:* "Some things we build tomorrow, some need a partner, some need a
licence, some need to be tested in the sandbox, and some need funding — and I know
exactly which is which."

---

## 9 · Rehearsal — the hard questions and how to answer

**"How do you make money without holding the money?"** — "We record it, we don't hold
it. Committee money moves person-to-person; savings sit with CDC. We earn fees for the
service, the guarantee, and fund distribution."

**"How is this not a Ponzi / how won't the organiser run off?"** — "There's no central
pile to run off with — every rupee is recorded and moves directly between members. The
thing that makes committees dangerous, the pot in one person's hands, we deleted."

**"What stops people defaulting?"** — "Three things: we only let people into
committees they can afford; the borrower posts their own money or the asset as
collateral; and if they still default, we cover the group and then report them to the
bureau and take them to court. Default becomes pointless and expensive."

**"Does auto-debit actually work here?"** — "Not true auto-debit yet — nobody in
Pakistan has it, including Oraan. Today we use card-on-file and Raast one-tap. Raast is
launching real auto-debit soon and we're built to switch on instantly."

**"Why should the SECP let you do this?"** — "Because we want to do it *properly* —
supervised in your sandbox, custody handled by CDC, defaults guaranteed and insured.
We're asking to prove the numbers under your eye before we scale."

**"What do you still need?"** — "A sandbox slot, an AMC/CDC intro for the vault, a bank
for collection, and a lawyer to lock the exact structure. I've listed every open
question honestly."

---

## 10 · The honest bits (say these too — candour wins with a regulator)
- True auto-debit isn't live yet; we're ready for it.
- Our default numbers are a *simulation* until the sandbox gives us real ones.
- The vault, the guarantee, and asset finance each need a partner or a licence — we
  haven't got them yet.
- The huge "Bazaar" committees are powerful but are a sandbox experiment, not a launch
  feature, because at that scale they brush against fund/lottery rules.

You now know every word in the investor report. If you can retell §6 (Amna & Bilal) and
§8 (the five buckets) from memory, you can hold your own in that meeting.
