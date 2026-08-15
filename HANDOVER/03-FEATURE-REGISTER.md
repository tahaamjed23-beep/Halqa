# 03 · THE COMPLETE FEATURE REGISTER

Every feature, in four states: **A** shipped and live · **B** built but hidden ·
**C** specified, not built · **D** refused, with the reason.

Stage tags: `FUNCTIONAL` works today, no licence · `BUILD` buildable now ·
`GATE-2` needs the merchant agreement · `STAGE-2` needs the CDC/AMC structure.

---

# A · SHIPPED AND LIVE

## A1 · Onboarding and identity

- **Multi-step signup wizard**, 7 steps: phone → OTP → name → profile → email →
  CNIC → account → password → PIN → review.
- **Phone OTP.** `/auth/phone-otp` and `/auth/phone-otp/verify`. 6-digit, stored
  hashed in `SecurityEvent` keyed by phone (no user exists yet), 30-minute window
  checked at register, sets `User.phoneVerified`. Sandbox surfaces `devCode`
  inline. Register remains backwards-compatible so seeders are unaffected.
- **App PIN.** `User.pinHash` (SHA-256 with a JWT_SECRET pepper, never returned —
  only a `hasPin` boolean via `withHasPin`). Endpoints `/auth/set-pin`,
  `/auth/verify-pin`. `components/PinLock.tsx` is a full-screen keypad shown on
  **every app open** (in-memory `unlocked` state in App.tsx, resets on reload).
  Forgot PIN → password re-login.
- **Optional biometric unlock** alongside the PIN (`lib/webauthn.ts`).
- **CNIC capture by device camera** (`components/CnicCapture.tsx`) — scans the
  whole card Oraan-style. 13-digit, unique, required at signup (optional at API
  level for back-compat).
- **Live GPS home pin** at signup, reverse-geocoded, member-initiated, one-time
  precise. Stored as `homeLat` / `homeLng` / `homeLocationAt`.
- **Profile fields:** `addressLine`, `city`, `occupationType` (enum EMPLOYED /
  BUSINESS_OWNER / SELF_EMPLOYED / HOUSEWIFE / STUDENT / RETIRED / OTHER),
  `employerName`, `locality` (broad area, sector, colony), `jobTitle` (public
  profession; **the husband's job when occupation is HOUSEWIFE**). Pakistani city
  datalist provided.
- **Uniqueness enforced** on CNIC, phone and email.
- **KYC levels:** registering a CNIC sets `kycLevel` 1, which unlocks hosting.
  Level 2 is account verification, reserved for second-stage custody products.

## A2 · Circle lifecycle

| State | What is true | Ends by |
|---|---|---|
| **FORMING** | Members join by invite code up to the cap. Nothing committed — anyone may leave, no money has moved. The minimum-to-start is a floor on pressing Start, not a lock on members. | Host presses Start |
| **ACTIVE** | Turn order frozen, all rounds created with dates, round 1 open. Joining refused. Each round: members pay, host releases payout, circle advances. | Final round settles |
| **COMPLETED** | Everyone contributed identically and collected once. A clean completion raises the Sakh and counts toward unlocking earlier turns. | — |
| **CANCELLED** | Available only from FORMING, because nothing is owed there. | — |

- **Start is one atomic write.** Seat order frozen, every round created, round 1's
  installments generated, status flipped — all inside a single database
  transaction. A half-applied start would leave turn position (the collateral of
  the whole model) disputable. Transaction budget 25 seconds because this is the
  largest write in the system and crosses a connection pooler
  (`transactionOptions {maxWait: 10s, timeout: 25s}` fixes P2028 over pgbouncer).
- **Pick-your-slot at join.** The slot map shows only band-eligible free seats;
  tap to claim; fixed at start. A claimed slot is **permanent** — nobody is ever
  silently moved.
- **Compaction:** if a circle starts under capacity, seats compact by band, then
  chosen seat, then join time — so the eligibility guarantee holds against the
  circle's actual size.
- **Circle status badges:** OPEN / PRIVATE / FULL / RUNNING / COMPLETED, with a
  host visibility toggle (`Committee.listedPublicly`,
  `POST /committees/:id/listing`).
- **Circle variants:** daily circles (under 7 days = plain rotations only), **mega
  circles up to 150 members** (period ≤ 30 days if more than 30 members), **goal
  circles** (`goalType` / `goalName` / `goalTarget`).
- **Waitlist** (`CommitteeWaitlist`). "Join next cycle" for running circles was
  DEFERRED.
- **Group chat** per circle (`ChatMessage`, `ChatRead`). **Socket.io is dead on
  serverless by design** — the UI shows a down banner.

## A3 · Payments and collection

- **Checkout is gateway-style:** order summary → branded rail cards (Raast,
  JazzCash, Easypaisa, bank transfer, cash) → processing state → receipt, plus an
  explicit failure path ("Oops / retry") that leaves the installment untouched.
- **Saved payment instruments.** Raast ID, wallet or IBAN, captured once, masked
  at rest, max 5, one preferred (`User.paymentMethodsJson`,
  `/profile/payment-methods` CRUD).
- **Card linking** with cardholder, brand-detected number (4-4-4-4), expiry, CVC,
  billing address. **Stores ONLY brand + last4 + expiry + holder + address — PAN
  and CVC are never persisted** (PCI).
- **Mandate OTP.** Linking a method creates a `SecurityEvent` of type
  `WA_MANDATE_OTP` with `{methodId, codeHash, expiresAt 10min}` and a WhatsApp-rail
  code message. `POST /payment-methods/:id/verify` sets `verified: true`.
- **Account title check** at linking — the aggregator returns the registered holder
  name, which must match the member's CNIC name. Proves ownership.
- **Auto-collection, always on.** Standing per-circle mandate, on by default at
  join, with recorded consent (`CommitteeMember.autoDebitEnabled` /
  `autoDebitRail` / `autoDebitMandateAt`; `POST /committees/:id/autopay`). The
  member cannot remove it — only replace the instrument. `lib/auto-debit.ts`
  `runAutoDebit` runs first in `evaluateDelinquencies`; sandbox settles, live rail
  awaits webhook, 501 soft-fails.
- **The delinquency cron is the real collector** — daily 02:00 UTC on production
  via Vercel Cron hitting `GET /api/cron/delinquency` with a `CRON_SECRET` bearer.
  node-cron does not run serverless. The UI says "Collect now (optional)" rather
  than "Pay installment".
- **WhatsApp receipts.** `lib/whatsapp.ts` `queueWhatsApp` writes a `Notification`
  of type `WHATSAPP_RECEIPT` plus an `AuditLog` `WHATSAPP_QUEUED` **inside the
  settle transaction**, so every debit gets `RCPT-<paymentid8>`. Gateway dispatch
  is partner-stage (`WHATSAPP_GATEWAY_URL`).
- **Day-before balance check** notification (reminder level 1 → 2).
- **Early-bird bonus:** ×1.25 if at least 75% of payments land 3+ days early.

## A4 · Payday collection and salary verification — THE FLAGSHIP

Shipped in commit `6052124`. The most consequential product decision made, and it
came from a chacha saying *"I pay as soon as my pay arrives."*

**The mechanism.** The evening before the declared payday, a balance-check notice
goes out. On the payday **morning** — while the balance is at its monthly maximum
and *before* the installment is even due — the mandate executes. If the charge
fails, a retry ladder runs to the due date alongside a Raast one-tap request and a
WhatsApp nudge. Only if every attempt fails does the member meet the late-fee
ladder.

**The due date stops being the collection event; payday becomes the collection
event, and the due date becomes the deadline for failures.**

**Verification — the payday proves itself.** There is no open banking in Pakistan
and by standing directive no bank partner, so the declared payday is verified from
evidence the platform legitimately owns, in four layers:

| Signal | How it works |
|---|---|
| **Account title** | At linking the aggregator returns the registered holder name; must match the CNIC name. |
| **Our own collection pattern** | The strongest signal and it costs nothing. Every attempt is logged by calendar day (`PaymentAttempt`). The first successful collection of each month marks a day money was provably present; two or more consistent months prove the payday. **If a member declares the wrong day, the retry ladder finds the true one.** |
| **Credit alerts** | Opt-in, on-device notification reading. Only aggregates leave the phone: a day, a coarse amount band, a source class (`SalarySignal`). Two consistent months verify. |
| **Payslip** | One photo, downscaled on the device (`PayslipUpload`). Documentary verification on day one. |

**Engine:** `src/lib/salary-pattern.ts`. Constants `MISDECLARE_SCORE_DELTA = -15`,
`DAY_TOLERANCE = 3`, `CLUSTER_TOLERANCE = 5`, `MIN_MONTHS = 2`. Functions
`readPattern()`, `readSignals()`, `evaluateSalaryPattern()`.

**Consequences for a false declaration:** verification cleared, the salary fee
discount stops (it now requires **VERIFIED**, not merely *linked*), a **−15**
credit event recorded with its reason, and the member told plainly why with
instructions to correct it. Once per window, so nobody is punished twice for the
same error.

**The salary anchor is replace-only** — it cannot be deleted while circles are
active. An integration test was updated to expect this.

**Honest limits:** three escapes always survive — keep the account empty, reroute
the salary, revoke the mandate at the bank. Each is a **deliberate act**,
timestamped against a signed consent, which converts "I forgot" into documented
bad faith. Passive default (money arrived, then got spent before the due date) is
deleted entirely; active evasion becomes rare, visible and evidenced.

**Still gated:** execution against a live instrument awaits the Gate-2 merchant
agreement. Wallet and card users are covered from day one; cardless bank accounts
get Raast one-tap until SBP's pull-payment scheme ships (in testing; realistically
9–15 months away).

## A5 · The Sakh credit system

- Score 300–850, opening 700, bands and seat rights per `02`.
- **Cutoffs live in exactly one file:** `halqa-api/src/lib/score-bands.ts`.
- **Credit-weighted turn REORDERING was removed** (22 July) — score now only gates
  *which free slots you may claim*, plus marketplace access. Nobody is ever moved.
- **Discover shows only circles where you have an eligible free slot** — never
  surfaces seats you cannot take.
- **Tenure quarantine overrides bands for new members:** every new member,
  regardless of score, may take only one of the **last 3 turns** of any committee
  of any size or duration. Unlocks after **2 clean completed committees + manual
  verification** ("calling around").
- **Credit events** (`CreditEvent`) with reasons; score-movement chart.
- **Credit Passport** — signed, verifiable without a Halqa account; renders as
  HTML in browsers (`lib/passport.ts`).
- **CreditPage** — bureau dashboard reached from Profile.
- **Bureau-impact audit queue** — a `BUREAU_IMPACT_QUEUED` audit entry on miss or
  default, feeding a future TASDEEQ export.

## A6 · Legal and contractual rails

- **Weekly e-signed platform undertaking** (*iqrarnama*), 7-day expiry, 10 clauses:
  liquidated demand → Order XXXVII, **acceleration**, auto-collect + salary,
  TASDEEQ / DataCheck / eCIB consent + delegated credit check, arbitration, linked
  accounts (7e), record-only status.
  - **Adopted signature:** typed `signedName` must match `user.fullName` exactly
    (400 otherwise) plus an optional drawn PNG ≤ 80 KB, stored with SHA-256 + IP +
    timestamp (`AgreementSignature`).
  - Gates create / join / waitlist / pay with **HTTP 428 `UNDERTAKING_REQUIRED`**.
  - Web: `AgreementGate` overlay on both App branches; `api.ts` fires a
    `halqa:undertaking-required` event on 428.
- **Mutual member-to-member personal guarantee** (`MUTUAL_PG`), auto-signed inside
  the join/create transaction. `/start` requires all ACTIVE members' PG (policy
  flag `mutualPgRequired`, new circles only). **The text says NOT TO HALQA** — it
  is a member-to-member obligation.
  - `MutualPgSheet` modal in CirclesPage; both join paths route through a
    `pgTarget` state. PG text readable pre-join via `/agreements/text` when the
    committee is FORMING.
- **Legal corpus v1.0-2026-07-20** in `halqa-web/src/legal/content.ts` — agreement,
  privacy, cookies, ads, community, fees. `TERMS_VERSION` accepted at signup →
  `TOS_ACCEPTED` security event. The agreement has 20 sections.
- **Cheque wording fully replaced** by undertaking + PG (the §489-F route was
  abandoned).
- **Undertaking and PG texts are lawyer-UNREVIEWED templates.** Budgeted Gate-2
  item.

## A7 · Turn marketplace

- List, bid, accept (`ExchangeListing`, `ExchangeBid`).
- Premium **capped at 50% of payout**; each bid must beat the floor; **Halqa takes
  10% of the accepted premium**.
- Shariah-labelled tiers permit **zero-premium swaps only**.
- Marketplace shows "Turn #X / Y" (exchange `totalTurns`).
- Barred for the Rebuilding band (below 550).

## A8 · Anti-default machinery

- **Forward-liability gate** (`src/lib/forward-liability.ts`) — early-payout
  security = coverage × contribution × rounds-still-owed. Opt-in at create
  (`forwardLiabilityGate`, `blockOnSecurityShortfall`). Satisfied by held deposits,
  prior holdbacks, or a host-VERIFIED `ProtectionCommitment`; otherwise a pot
  holdback **capped at 60%**, released as `positionsRemaining` clean payments land.
- **Family linkage** (`src/lib/family-links.ts`) — linked = referral in both
  directions + guarantor edges + shared `deviceId`. A `linkedOpenDefault` (default
  flag AND an open RecoveryCase) → **join 403 + payout 409**.
- **Delinquency service** (`services/delinquency.ts`) with the escalating ladder.
- **Recovery cases** (`RecoveryCase`) for outstanding + penalties + a 10%
  rehabilitation fee.
- **Grace window is INTERNAL and never shown:**
  `postDueGraceDays = clamp(round(0.23 × period), 2, 14)` **minus 2** since 21
  July (30d → 5, 45d → 8). Score and bureau damage accrue **from the first late
  day regardless**.
- **Salary-linked discount:** payout `earlyFee` and `slotFee` × 0.8 for a
  salary-linked recipient. Income and employer verification give up to an **80%
  discount** on Halqa's charges — a discount, not a gate.

## A9 · Interface and platform

- **React + TypeScript on Vite.** Pages: Home, Circles, Committee, CreateCircle,
  Marketplace, Credit, Profile, Settings, Vault, Terminal, About, Auth.
- **Urdu and English** (`lib/i18n.ts`), **15 rotating regional greetings** on Home
  (Urdu, Punjabi, Pashto, Sindhi, Roman Urdu).
- **Mobile-first, installable as a PWA.** `halqa-web/public/phone.html` is a
  390×844 bezel iframe of the live app for demos.
- **Rafa** — a 3D assistant bot with a knowledge base in
  `components/rafa-knowledge.ts`: romanised-Urdu synonyms, typo tolerance, context
  memory. Mounted on both App branches.
- **Settings hub**, 8 sections. **Corporate footer.** About page (reached by
  clicking the logo). Sign-out confirmation.
- **Charts:** `PersonalGrowthChart`, `ProjectionChart`.
- **ErrorBoundary**, list caching, `RiskConsole`, `ProtectionCenter`,
  `MemberStatus`, `HostCard`, `LegalFooter`.
- **Feature flags** in `halqa-web/src/config.ts`: `SIMPLE_MODE`,
  `SHOW_HOST_ELIGIBILITY=false`, `SHOW_BANK_RAIL=false`.

## A10 · Security stack

- TLS + HSTS; CSP on both apps (helmet).
- **bcrypt cost 12**; JWT with **rotating refresh tokens and reuse detection** that
  burns the whole token family (`RefreshToken`).
- **Per-account lockout:** 5 failures → HTTP 423 for 15 minutes; 30 attempts per
  15 minutes globally.
- **Enumeration-resistant timing**; `assertSecretsStrong` at boot.
- **Prisma parameterises every query** — injection is structurally unavailable.
- **Append-only audit log** (`AuditLog`) and a `SecurityEvent` table.
- `SECURITY_RELAXED=true` in `.env` disables lockout, password and replay checks
  for local testing; the suite auto-detects and skips those.
- Web dependencies report **zero known vulnerabilities**. Posture assessed **B+**
  with gaps named in `10`.

## A11 · Engineering invariants

- **All money is integer paisa in BigInt.** No floating point anywhere — binary
  floating point cannot represent most decimal fractions exactly and the residue
  is invisible until reconciliation fails. Rates apply as **basis points with
  integer division**.
- **Every movement is a double-entry pair** (`LedgerEntry`), so the ledger is
  self-checking.
- **Every write carries an idempotency key**, so a retried request — normal on
  mobile networks and under serverless timeouts — is applied once.
- **Production migrations are additive-only hand-written SQL**, so old and new
  code both stay correct during a deploy.

## A12 · Referral

`User.referredById`; **Rs 250 to the referrer** on the referred member's first
completion. The first-circle installment cap was **REMOVED** by the chairman.

---

# B · BUILT BUT HIDDEN BEHIND FLAGS

Complete and tested, switched off behind one flag. **They are not unfinished** —
switched on today, several would constitute pooling or deploying member funds, the
exact activity the NBFC regime regulates. They return under the Stage-2 trustee
structure.

- **Vault sleeves** — tiers STANDARD / INCOME / GOLD / CRYPTO. CRYPTO needs an
  `acknowledgeExtremeRisk` 428 gate with "high risk" wording. Allocation sliders
  summing to 100, auto-cover, parking.
- **Earning engines** — `profit-engine.ts`, `sukoon.ts`. Float sweep, deposit
  *mudarabah*, patience tilt, prize *hiba* (halal). Priority and Sigma tiers use a
  conventional early fee (**not Shariah-reviewed**; the consent text says so; Sigma
  fee cap 10%).
- **Scheme terminal** (`TerminalPage`, `Scheme`, `scheme-catalog.ts`,
  `sync-schemes.ts`).
- **Escrow treasury / guarantee pool** — needs custody.
- **Security deposits** (`SecurityDeposit`) and **payout holdbacks**
  (`PayoutHoldback`) — FUTURE, only if custody ever exists.
- **Bank rail / BANK_CUSTODY** — Soneri sandbox partner seeded at boot via
  `syncPartnerCatalog`; bank KYC → Level 2. **`SHOW_BANK_RAIL=false`.** The code
  stays in the tree but is **not documented as a roadmap item** per the no-bank
  directive.
- **Committee tiers** — DB enum `CLASSIC` / `SUKOON` / `BAZAAR` / `PRIORITY` /
  `SIGMA`, renamed at the **display layer only** (no migration) in
  `components/ui.tsx` `tierLabel`:

  | Enum | Display |
  |---|---|
  | CLASSIC | **Basic** |
  | SUKOON | **Earn** |
  | BAZAAR | **Earn & Share** |
  | PRIORITY | **Early Access** |
  | SIGMA | **Maximum** |

- **Host-configurable float window** — `Committee.expectedPaymentLeadDays`,
  IMPLEMENTED 18 July. Slider "How early do members usually pay?" (0..periodDays)
  with `floatFactor = (lead + 7) / (period + 7)` scaling the float share of the
  bonus estimate (halal × (0.75 + 0.25f), fee tiers × (0.9 + 0.1f)).
- **Deposit coverage** host-configurable 30–90%, default 70%
  (`Committee.depositCoverageBps`).
- **Group staking streak** — +5% per clean round float bonus, cap +50%.

**RULE: never delete these for being non-Shariah or dormant.** See `04`.

---

# C · SPECIFIED, NOT YET BUILT

## C1 · The Discipline Layer

Full spec: `docs/HALQA-DISCIPLINE-LAYER-2026-08-09.pdf`.

### C1a · The 24-hour confirmation window `BUILD`

A new state `CONFIRMING` between FORMING and ACTIVE. Host presses Start → roster
locks to new joiners → **24 hours in which any member may withdraw with no fine,
no score effect and no record**. Agreements are signed here. All members see the
same countdown, the final roster, the seat order, the amount, and their own total
forward obligation in rupees. The window runs from Start (not from each member's
join) so everyone reconsiders together. Sub-minimum withdrawals drop it back to
FORMING.

*Precedent: SBP already mandates a 2-hour cooling period on branchless-banking
cash-outs (April 2023).*

### C1b · The exit ladder — NO CANCEL BUTTON `BUILD`

| # | Level | Mechanism |
|---|---|---|
| 1 | **Window withdrawal** | During CONFIRMING. Free, silent, unrecorded. |
| 2 | **Substitution** | A replacement takes the seat and pays the leaver their contributions to date, member-to-member. No fine; leaver made whole *immediately*. **Target ~90% of exits — the UI should push hard toward it.** |
| 3 | **Group-approved exit** | No replacement. Member states a reason; a majority must approve. Contributions restored **at the end of the cycle**. Fine = one installment. |
| 4 | **Hardship exit** | Recorded statement to the Halqa helpline, evidence reviewed. Fine waived. Annotated **hardship, not default** — and that distinction must survive into the Passport. |
| 5 | **Abandonment** | Not an exit. Full late-fee ladder, feature lock, recovery case. **Restitution withheld and set off against what is owed.** |

**Boundary:** all of this governs members who have **not yet collected**. A member
who takes the pot and stops paying is post-payout default — the −200 event.

### C1c · The restitution arithmetic — the key engineering result `BUILD`

The chairman's rule is that a leaver's money returns at the end of the cycle. The
problem: **Halqa holds no pool, so there is nothing to refund from.** The
resolution is that the members who already collected are precisely who owes it.

Worked example — 12 members, Rs 10,000, pot Rs 120,000. The member at seat 9
leaves after round 4 having paid Rs 40,000, collected nothing, no replacement
found:

```
Circle contracts to 11 payers → remaining pots = 11 × 10,000 = Rs 110,000

Seat 11 (never collected):   pays 110,000, receives 110,000  → square
Seat 3  (collected 120,000): pays 110,000                    → ahead by 10,000
Seats 1, 2, 3, 4 each ahead by 10,000  →  4 × 10,000 = Rs 40,000
                                          = exactly what the leaver is owed
```

**General rule the engine implements:** where a member exits before collecting
having paid *p* installments and the circle contracts, **each member who collected
in rounds 1…p owes the leaver exactly *c*, settled at completion.** Total = *p × c*,
nominal, with **no time value — which is the deterrent.**

Ledger invariant at close: every continuing member ends at `received − paid = 0`
and every exited member is returned to zero. Recursive for multiple exits.
Obligations are created as scheduled settlements at the final round and collected
through the ordinary mandate machinery.

**Note:** a mid-cycle exit shrinks every remaining pot by one contribution — a
member expecting Rs 120,000 for a wedding now receives Rs 110,000. That harm is
real, and it is why exits need group consent and why the fine exists.

### C1d · The group vote `BUILD`

- Written reason plus an **optional voice note** (literacy: only 31% of committee
  users can send or receive a text message).
- Posted to circle chat; all members notified in-app and by WhatsApp.
- **72-hour window.** Simple majority of votes cast, excluding the requester, with
  a 50% participation quorum.
- **If quorum fails it escalates to Halqa review rather than failing** — a member
  must not be trapped because peers did not open the app.
- **The host votes as one member and breaks ties. No veto, no unilateral
  approval** — restoring organizer power over exits would rebuild the asymmetry
  the fraud cases run on.
- Every vote, abstention and comment is a permanent ledger entry.

### C1e · Fines and destinations `BUILD`

| Event | Fine | Destination |
|---|---|---|
| Window withdrawal | None | — |
| Substitution | None | — (group unharmed) |
| Group-approved exit | One installment | **70% to remaining members**, 30% platform admin |
| Hardship exit | Waived | — |
| Abandonment | Late-fee ladder + recovery + 10% rehabilitation | Platform (circle pool on Shariah circles) |

### C1f · The hardship path `BUILD`

Helpline, recorded statement, evidence reviewed. Four outcomes in order of
preference: **bring the turn forward** (usually the humane and commercially correct
answer at once); **deferral** with group consent (a true deferral with a repayment
date, not UBL's "installment holiday"); **hardship exit**; **structured settlement**
where a payout was already taken.

### C1g · The affordability engine `BUILD`

Anchor: **SBP caps consumer-financing debt burden at 40% of disposable income**
(BPRD Circular Letter 29 of 2021, reduced from 50%). Halqa goes **stricter**:

| Cap | Rule |
|---|---|
| **Cash-flow** | `Σ contributions ≤ 33% of net monthly income` AND `Σ contributions + known debt service ≤ 40%` (TASDEEQ where available) |
| **Forward exposure** | `Σ L(k) ≤ 4 × net monthly income`, worst case where every circle pays out early |
| **Concurrency** | Members: 1 unverified → up to 4 verified. **Hosts: 2 unproven → 5 with clean history → manual review** (also the anti-Ponzi control) |

Why stricter than the regulator: committee obligations outrank rent so they crowd
out everything else; members hold offline committees no bureau sees; and the loss
lands on eleven neighbours, not a balance sheet.

Verification tiers: declared-only → one small circle. Payslip **or salary pattern
proven from our own collection outcomes** (free, no document) → full caps.
Additional income → the member contacts Halqa with proof, and an analyst uplift is
filed against a named reviewer with an expiry.

**Critical discipline from the progressive-lending literature:** escalating limits
cause liquidity defaults when the limit outruns real capacity. So **good history
unlocks seats, circles and lower friction — it NEVER raises the money cap. Only
new income evidence does.** Always show headroom in plain language ("you can take
one more circle up to Rs 9,800 a month"), never a bare rejection.

### C1h · Join authentication `BUILD` / `GATE-2`

- **PIN always** at join-commit, exit request and payout release.
- **Device biometric** (FaceID / fingerprint) layered where supported; never leaves
  the device.
- **NADRA face match** (Multi-Biometric Verification System, procurable via the
  **Nishan Pakistan portal** launched 2025; contactless biometric verification was
  built for banking and payments at SBP's request). Once at onboarding, re-triggered
  on: new device, above-threshold contribution, first-half seat, **any exit or
  hardship request** (this stops an impersonated exit), and 90-day dormancy.
- **Cost discipline:** the NADRA facial certificate is reported at Rs 20;
  Easypaisa charges users Rs 99 for a *failed* check. Do not face-check trivial
  actions.
- **Never store raw templates or images** — only the result and NADRA's reference
  ID.

### C1i · Circle authenticity — CORRECTED DESIGN `BUILD`

**This section was rewritten twice. Read the history so you do not revert it.**

- **v1 (rejected):** a "leniency tier" called Apna Halqa giving lighter controls to
  circles where everyone knows each other. **The chairman killed it:** *"no i dont
  want too much leniency, there will still be autodebit and insurance."*
- **v2 (rejected):** a mesh test — all members must know each other, host removed
  from the graph, check connectivity. **The chairman corrected it:** *"the idea is
  that the host knows everyone, and this is only for tier 1 committees, the other
  one as we discussed open ones, dont require this."*

He is right, and the literature agrees — Kamran's informant: *"It is his job to
decide whether to accept someone into the Committee."* **The organizer is the hub
by design.** The star topology is the real structure, not a fraud signal.

**v3 — the current design, awaiting his approval:**

**Nothing is relaxed for anyone.** Auto-debit, takaful, identity, affordability
caps, the exit ladder and the 24-hour window apply to **every circle**. This only
ever *tightens*.

- **Tier 1 (closed circles):** the host declares they know each member, and it is
  tested **from both ends**.
- **Open circles:** claim no relationship, so nothing is tested. Governed by score
  bands, strict seat gates, full verification and lower ceilings.

**The paired declaration.** The host answers two questions per member: *how* do you
know them (relative / neighbour / colleague / customer or supplier /
friend-of-a-friend) and *how long* (under a year / 1–3 / 3+). The member answers
the same two questions about the host, **separately, without seeing the host's
answer**. The answers must agree.

*Why a fraudster cannot beat it:* he controls only one side of every answer. To
pass eleven spokes he needs eleven real people to independently produce matching
categories, having been briefed on the exact wording in advance. Two taps per
person, zero permissions.

**Three corroborations that cost nothing:**
1. **Consistency with what we already know.** Both home pins exist from signup. A
   *relative* in another city is normal; a **"neighbour" in another city is a
   contradiction.** Same for "colleague" against declared employer. We are not
   testing proximity — we are testing whether the *stated relationship* survives
   contact with everything else we can see.
2. **Invitation trail.** In Tier 1 the host should have invited each member
   directly. A member arriving via a twice-forwarded link is not someone the host
   knows.
3. **Answer independence.** Eleven declarations completing within seconds of each
   other from one network means one person is filling in the forms.

**The contact check fits here**, sharpened: the host having members saved is
*expected* and proves little. The half that matters is **each member having the
host saved** — the direction a fraudster cannot manufacture. Done **on-device with
hashed matching** so no address book ever reaches us (see `08` for why this
boundary is existential).

**Host accountability makes it self-policing** — Kamran's finding written down. The
host signs a per-member declaration. If someone they vouched for defaults, the
host's own Sakh takes the hit and their hosting limits tighten.

**Failure handling:** a mismatched spoke flags that member — remove them, or the
circle converts to Open with stricter controls. Only clustered fraud signals
(several members on one handset, numbers registered in a burst) block a start.

**Build order for the whole Discipline Layer:** 1 CONFIRMING window (smallest
change, largest legal return) → 2 affordability engine → 3 exit ladder +
restitution engine + vote → 4 hardship path and helpline → 5 NADRA face (start the
Nishan paperwork in parallel) → 6 circle authenticity last.

## C2 · Committee mechanics catalogued from field research `BUILD`

From `docs/HALQA-COMMITTEE-DOSSIER-2026-08-06.pdf`.

- **Net-off settlement ("hissa kat lo")** — the mechanic the chairman named. When a
  member's turn arrives, **their own installment for that round is deducted from
  the pot** instead of paid in cash. A Rs 120,000 pot in a 12 × Rs 10,000 circle
  pays out Rs 110,000 and the recipient owes nothing that month.
  - Host toggle at creation, default off, shown to every joiner before committing.
  - **The ledger still writes BOTH legs** — the obligation is created and settled
    by an internal set-off entry with its own receipt, timestamp and idempotency
    key, settlement method `NET_OFF`. **Only the cash nets; the record never
    does.** This preserves the double-entry invariant and the credit history.
  - Counts as **on-time at full weight**, annotated as auto-settled.
  - Interactions: if already paid before payout day, no net-off occurs. Late fees
    for others are unchanged. A marketplace-bought seat nets off for the buyer.
    Deductions stack with the forward-liability holdback. Unobjectionable on
    Shariah tiers — it is set-off of a debt, not a charge.
- **Declared organizer compensation** — the host may claim **seat 1 as organizer's
  privilege**, shown on the circle card before anyone joins. (Note the tension:
  seat 1 is also maximum liability `L(1) = c(n−1)`, so a host claiming it takes the
  largest forward obligation in the circle — exactly the skin in the game the
  literature says organizers should hold.) Plus an optional **recorded
  member-to-member tip** at payout, off by default, capped, every rupee on the
  ledger. **No hidden margin, no organizer access to the pot, no Halqa fee on
  members.**
- **Half-shares ("aadhi kameti") and multi-slots** — two people share one seat at
  *c*/2 each, splitting the pot; or one member holds two seats. First-class
  sub-membership; **joint and several liability** stated plainly at join; payout
  splits by recorded ratio; scoring accrues at half exposure. Multi-slot members
  carry summed liability and count twice against concentration limits. The UI hides
  all of it behind one question: "Full seat or half seat?"
- **Verifiable parchi draw** — the ballot ceremony *is* the institution; a
  server-side `random()` replaces theatre with a black box, and black boxes get
  accused. **Commit-reveal:** the server commits to a hashed seed before the
  ceremony; each member's tap adds entropy; the ordering derives from the combined
  value; the seed is revealed after so anyone can recompute the result. Keeps the
  theatre, keeps the honesty. **No competitor in the archive has this.**
- **Daily and weekly circles** — bazaar traders run "roz ki bisi" with 30–60
  members. The period is already parametric; the payday engine anchors to the
  trading day instead of a salary date.
- **Ramzan conventions** — pause for the Eid month, or double the month before it.
  Host-set schedule exception, visible at creation.
- **Replacement protocol** — host-approved substitution; paid months transfer to
  the **seat, not the person**; the replacement signs the full agreement set; both
  events are permanent ledger entries; an unfilled exit falls back to the
  marketplace, then to Halqa-fill.
- **Death and incapacity** — the universal convention: a deceased member who had
  collected is not pursued if the family cannot pay; one who had not collected is
  paid out early. Recorded as the default convention in the mutual guarantee now,
  priced properly by **circle-level takaful at Stage 2**.
  - *Validated by KSFE (Kerala's state chit operator), which formally waives future
    liability up to ₹10 lakh on a prized chitty when a subscriber dies.*
- **Progressive contribution caps for new members** — from The Money Club's
  graduated exposure: the *amounts*, not only the seats, should scale with history.

## C3 · Approved growth directions (2 August)

**Approved, build toward these:**
- **TASDEEQ two-way membership (flagship)** — join the private bureau as a non-FI
  **alternative-data contributor** (the same category as telcos and utilities,
  which TASDEEQ already ingests). Furnish consented committee-repayment data → the
  member builds formal credit, Halqa becomes the only source of informal-committee
  data, and reciprocity earns score reads back. The legitimate version of "sell
  score access."
- **Organizer incentives** — reward the group leader on **VALUE, not recruitment
  depth** (recruitment-chain compensation is an illegal pyramid; FIA and SECP
  prosecute). Mechanisms: a completion bounty per clean-finished circle,
  **single-level** revenue share on their circles' fee revenue, tiered "Verified
  Organizer" status, free Halqa-fill and fee waivers, accelerated Sakh, first
  access to new products. **NEVER multi-level.**
- **Formal-finance on-ramp** — N clean circles → a pre-approved product via
  referral; the institution pays origination, **never the member**.
- **Remittance committees** — a diaspora worker commits monthly, payout to family in
  Pakistan. **HARD LINE: Halqa never holds or moves FX** — ride a licensed
  remittance rail or a Roshan Digital Account; the partner bears the licence and
  the heavier AML/KYC. Tailwind: SBP subsidises formal remittances (~US$30bn
  economy), so this is policy-aligned and possibly development-fundable.
- **Employer-endorsed committees** — the employer *endorses*, does not run or see.
  Free income verification and a perfect payday pull. Chairman: **"for later."**

**Fresh batch, liked but not prioritised:**
- **Gold committees** — the pot buys gold; the inflation hedge the late-turn saver
  needs; culturally native. **Never hold the metal.**
- **Credit-builder committee** — a circle marketed as "join to build your credit
  score," powered by TASDEEQ furnishing. Makes the bureau integration a product
  people join *for*.
- **Seasonal Islamic committees** — Qurbani, Ramadan, Hajj. Timed, sticky, near-zero
  competition.
- **Merchant-sponsored committees** — a brand (phone, solar, appliance) subsidises a
  "save for X" circle for guaranteed bulk demand; free to members. Solar is strong.
- **White-label engine to licensed FIs** — MFBs and NBFCs have licence and capital
  and lack the committee product; B2B revenue with **their** regulatory burden.
- **Aggregate market-insights product** — anonymised informal-savings trends sold to
  banks, FMCG and policymakers. **Never individual profiles.**
- **Government / BISP channel** — route social-protection transfers into committees.
  Huge scale, policy-aligned, development-fundable, and a government relationship
  is a moat.

## C4 · The gold-goal committee — the X-factor `FUNCTIONAL now`

Researched and adversarially verified 22 July. **The single strongest near-term
differentiator.**

A normal PKR rotating committee where the host sets the goal in **grams or tolas of
gold**, not rupees. The app shows the live PKR/gram rate, sizes contributions to
the gram target, and on payout day gives cash plus a one-tap "buy gold now" — or
auto-converts the pot at **that day's spot price**. The member carries price risk
until their turn.

**Why it beats Oraan:** Oraan Gold **locks today's price for delivery 6–10 months
later** — *deferred* gold-for-currency, which is riba under the majority *Bay'
al-Sarf* view (gold↔currency must be spot / same-session), yet they market it as
Shariah-compliant. A **spot-settled** gold-goal committee is genuinely cleaner —
and only that variant should be labelled Shariah-compliant.

**Hard dependency:** physical *allocated* gold delivery needs a refiner or vault
partner (Phase 3). Until then ship only the **cash-payout plus assisted-purchase**
variant — no custody, no licence. Exact contract wording is **mufti-to-confirm**
(an AAOIFI Standard 57 edge case over a multi-month tenure).

**Other verified differentiators, all FUNCTIONAL:** make the turn-pricing fee curve
(early fee → late bonus) the **public headline** — Oraan and Money Fellows both
price slots this way, which validates it; market the mutual guarantee as hard as
Money Fellows markets its company one; add "earned early slot" progression; show a
gram-and-PKR side-by-side ledger.

## C5 · Device data — the clean menu, not yet built

Governing rule: **volunteered, purpose-bound, minimal — never harvested.**

- **Location:** keep the one-time precise GPS home pin; **add server-side IP
  geolocation** (city-level, zero permission) as a free fraud cross-check. Do NOT
  pursue background or continuous location.
- **SMS Retriever API** for our own OTP autofill (zero permission).
- **Android Contact Picker** — the member picks one invitee (zero permission).
- **Photo Picker** for payslip and CNIC (zero permission).
- **Guarantor and next-of-kin numbers** — SECP-permitted because they are given
  deliberately and third-party consented; also closes the death/incapacity gap.
- **First-party telemetry** (zero permission, legal): device fingerprint (model as
  a wealth proxy), behavioural biometrics (tap, scroll and typing — fraud plus
  is-it-really-you), session timing (opens, dwell, pre-miss behaviour — **the best
  default predictor we own**), stress proxies (battery, storage), IP and VPN
  intelligence, email-age / SIM-freshness / WhatsApp-presence lookups.
- **THE strategic move — incentivised volunteering beats scraping:** reward a Sakh
  boost or fee discount for uploading a bank statement, linking salary, adding a
  guarantor, verifying income. Same payload, consented, survives every filter
  forever, and is *better* data because it is structured rather than parsed.
- **Usage rule (business, not morality):** grey telemetry is fine kept
  **invisible-and-defensive** (fraud, security, risk pricing); never
  **visible-and-extractive** (profiling inferred wealth for sale) — the second is a
  hit-piece paragraph that kills the trust moat even though it is legal.

---

# D · REFUSED — AND WHY

| Refused | Reason |
|---|---|
| **Auction / bidding committees (chit funds)** | The discovered price is interest in substance (~45–55% implied APR in the worked example). Fatal to riba-free positioning. India regulates precisely this family. |
| **"Lucky committee"** (winner stops paying) | A lottery, not a committee. Most participants pay more than they can ever receive. Reputationally poisonous. |
| **Installment holidays** | Dissolves the commitment device. A committee where missing a month is free has stopped being one. UBL ships this — see `06`. |
| **Platform default cover from Halqa's balance sheet** | Drifts toward NBFC/EMI. Money Fellows carries it *licensed*; we are not. **Note: Akif told us to do the opposite** — cover defaults and insure with takaful. This tension is unresolved; see `04`. |
| **Member fees of any kind** | Kazi's "Razq" died of fees. Oraan's committee product stalled with fees. Permanent Rs 0. |
| **Bank partner — ever** | Chairman directive, 28 July. See `04`. |
| **Custody of member money** | The entire architecture rests on its absence. |
| **Contact list harvesting** | Google Play bans personal-loan apps from contacts; SECP banned it even with consent. This is THE predatory-app signature. Only on-device hashed matching is acceptable. |
| **Gallery / photo access** | Same. The banned apps morphed gallery photos into obscene images to coerce borrowers. |
| **READ_SMS / call log** | Same. Default-SMS-handler only under Play policy. |
| **Android Accessibility Service to read bank-app balances** | Explicitly requested by the chairman as a "loophole"; **declined with reasons on record.** (1) It is the predatory-app signature technique and the fastest Play delisting trigger — human reviewers pattern-match Pakistani finance apps. (2) It is not a scalpel: Accessibility reads the *entire* bank screen. "We only read the balance" is the same capability-not-intent lie the banned apps told about contacts. (3) It detonates the moat — the whole pitch is "we're the one that doesn't do what those apps did," and a screenshot of that permission ends the sentence. |
| **Background / continuous location** | A separate Play declaration a committee app cannot clear; the permission dialog alone costs more trust than the data is worth. Disappearance is detected better, and free, from our own telemetry. |
| **QUERY_ALL_PACKAGES** | Banned. |
| **Selling individual intent-data leads** | Legal, but "sells poor people's dreams" is a hostile-journalist headline. Reframed as **Goal Direct-Pay** — we negotiate a better deal and the merchant pays commission. |
| **Public default flag / wall of shame** | Rhymes hardest with the loan-app scandal. The flag stays **INTERNAL** (gating hosting and marketplace), never public, never visible outside the member's own circles. |
| **Credit-weighted turn reordering** | Removed 22 July — confusing and felt unfair. Score now only gates which slots you may *claim*. |
| **Multi-level organizer compensation** | An illegal pyramid. FIA and SECP prosecute. Single-level only. |
| **Claiming we can jail defaulters** | Verified false. Default on a PG is civil. Cheques (§489-F) were dropped from the model. |
| **Cheques as an instrument** | Dropped; replaced by the undertaking and PG. |
| **kameti.pk as a reference** | *"slop and random shit, dont bring it up again."* |
| **Removing a feature for being non-Shariah** | Never. Keep it working, just do not label it Shariah. |
| **Leniency tier for known circles** | Killed 9 August. Auto-debit and insurance stay universal. Replaced by authenticity *detection* that only tightens. |
| **Rounded pill / badge UI elements** | *"found in all ai slop."* Use ledger rules and hard edges. |
| **First-circle installment cap** | Removed by the chairman. |
| **Safety fund in simple create** | Removed — custody optics. |
| **User-facing "Secure" / "Strong" circle labels** | Removed alongside the reordering change. |

Yes boss
