# HALQA — Strategic, Feature & Ideological Scan
Date: 2026-07-07 · Method: full code read of every engine + route + page, then
verified build/test baseline. Nothing below is asserted from docs alone; where
docs and code disagreed, code won.

Verified baseline before changes: API `tsc` clean · web `tsc` clean · 7/7
unit/property tests · 33-check integration lifecycle passing against live
Postgres. Same suite re-run green after today's changes.

---

## A. STRATEGIC ISSUES (what decides whether this wins)

**S1 — The trust paradox is the whole game.**
Halqa's shape ("committee app + someone controls a pooled investment") is the
exact silhouette of the scams it prevents (the Rs 420M case in the market
audit). Slickness alone makes it look MORE suspicious to the target user.
- *Solution shipped today:* verifiable **host reputation card** shown BEFORE
  joining (invite-code preview endpoint — inspect the host's completions,
  on-time %, missed payments, default flags without joining), and inside every
  circle. Derived only from recorded events, labeled "never self-reported."
- *Solution shipped today:* **Credit Passport** — the trust layer becomes
  portable and third-party checkable, which no committee app or AMC offers.
- *Still open:* launch strategy must be invite-only among real circles;
  first-cycle fee waiver worth doing (trivial cost, large signal).

**S2 — Stale market data is credibility death.**
Quoting a 12.08% T-Bill when the policy rate moved months ago reads as either
negligence or deceit — fatal for a trust-first product.
- *Solution shipped today:* rates re-anchored to what the market audit actually
  verified (SBP policy 11.5% of 15 Jun 2026; NSC 13.24–13.68% of 6 Jul 2026),
  every scheme now carries a **"Rate verified [date]"** stamp in the terminal,
  wizard and projections, and anything >45 days old shows **"⚠ rate review
  due"** automatically. Unverified instruments deliberately kept their old
  dates so the staleness flag tells the truth instead of hiding it.
- *Still open:* a weekly admin rate-refresh routine (30 min/week per PART 10).

**S3 — Regulatory silhouette of INVESTMENT mode.**
The original owner spec (D5) locked "low-risk only, r ≤ 0.25". The current
build allows 100%-allocation circles into risk-8 equity ETFs. As Stage-1
simulation this is legal, but *marketing* it is the fastest way to look like an
unlicensed collective investment scheme to SECP before a partner exists.
- *Recommendation (not code):* lead all public positioning with ROTATING mode
  ("a safer committee"), keep INVESTMENT mode de-emphasized/preview-labeled
  until the Stage-2 partner and counsel exist. The mode caps and consent-hash
  system already built are exactly the right seam for this.

**S4 — Distribution gap.** Browser-only product for a phone-first market.
Capacitor wrap is the highest-leverage non-feature work remaining (plan #7).

**S5 — Partnership clock.** Neem / SBP sandbox lead times are months. The
working record-only ledger is the demo asset; outreach should start now, in
parallel, per STRATEGY-AND-PARTNERSHIP-PATH.md ranking.

## B. FEATURE ISSUES (found by reading the code, with dispositions)

**F1 — Doc/code drift (fixed today).** MASTER-EXECUTION-PLAN listed "no
scheduler" as gap #1; the hourly delinquency scheduler exists and is wired
(`services/delinquency.ts`, `server.ts`). A comment in committees.ts claimed
the scheduler was "not-yet-built." Both corrected. Lesson: the plan docs are
one build behind the code; trust the code.

**F2 — Cadence→tenor foot-gun (fixed today).** A 30-day rotating circle could
select a 45-day-liquidity instrument; the risk engine scored the mismatch but
nothing prevented it. Now enforced in BOTH places per the spec's own principle:
the wizard hides schemes whose liquidity exceeds `period − 7 days` (with an
explanation of how many were hidden and why), and the API rejects them
(HTTP 400) for ROTATING/HYBRID. INVESTMENT circles are exempt by design —
capital is locked to maturity there. Verified live: 45-day Defence certificate
into a 30-day circle → rejected with a plain-language error.

**F3 — No pre-join host inspection (fixed today).** Joining was code→commit
blind. Now: "Check before joining" resolves an invite code to the circle's
terms + full host record, join is a second, informed step.

**F4 — Recipient-miss deadlock (open, decision needed).** If a recipient
misses the 7-day eligibility deadline, payout blocks forever — there is no
skip/reorder. This is the documented product decision (engineering report
blocker #10). Recommended design: host-triggered, audited "defer recipient one
position" that swaps with the next eligible member and notifies everyone. Money
path — should be built with its own integration test, not rushed.

**F5 — KYC gate unsatisfiable (open).** Production hosting requires kycLevel 2
but no endpoint can grant it. CNIC upload + admin review queue (defer OCR/
liveness) is next per the plan. Schema fields already exist.

**F6 — COMPOUND rollover is notification-only (open).** At cycle end a
COMPOUND circle notifies "remains recorded for the next cycle" but no new
rounds are generated. True multi-cycle rollover is unimplemented (blocker #10's
second half). Should be stated honestly in any demo.

**F7 — Credit engine is sound.** Verified bidirectional: +6 early / +4 on-time
/ −10/−20/−40 escalation with idempotent delinquency dedup, +25 completion,
−150-class post-receipt default via scheduler, guarantor −25. Books-balance
property test passes. No action needed beyond the F4/F6 decisions.

## C. IDEOLOGICAL ISSUES (what the product claims to be)

**I1 — Language discipline: good.** "Recorded, not secured" is enforced
across ledger reasons (`_RECORDED_STAGE_1`), audit payloads (`RECORD_ONLY`),
and UI copy. The Credit Passport and reputation card shipped today keep the
same discipline ("verified from recorded events, never self-reported").

**I2 — Shariah posture is backwards for the demographic.** The default
first-listed scheme is a conventional T-Bill; the Shariah filter exists only in
the Terminal's portfolio tab. For this market, Shariah-first is both the
ethically consistent and commercially correct default. Recommendation: Shariah
toggle in the create wizard, Islamic instruments listed first, and the Meezan
partnership track (#3 in the partner ranking) framed as identity, not just
custody. Cheap; high resonance.

**I3 — The honest headline.** Projections still lead with nominal profit.
The truthful, more persuasive frame for a 20%+ inflation economy is purchasing-
power protection of the held-back slice, with nominal profit secondary
(plan §2.3). Open.

**I4 — Urdu/RTL and lakh/crore formatting absent.** English-only money UI for
a mass Pakistani demographic contradicts the inclusion narrative. Open; number
formatting is the cheap first step.

**I5 — Fees align with users.** 5% of realized profit + 10% of turn premium,
recorded not collected in Stage 1 — earn-when-they-earn is the right ideology.
Add the fee floor waiver (no fee below ~Rs 200 member profit) when fees go live.

---

## Shipped today (all verified)

1. Rate refresh to audit-verified figures + `RateStamp` freshness system
   (45-day staleness threshold) across Terminal, wizard, projections.
2. Cadence→tenor liquidity gate — UI filter + API enforcement + live negative
   test.
3. Host reputation: `lib/reputation.ts`, `GET /profile/reputation/:userId`,
   `GET /committees/preview/:inviteCode` (pre-join), `HostCard` component in
   CirclesPage preview + CommitteePage members panel.
4. Credit Passport MVP: `lib/passport.ts` (HMAC-signed, 90-day expiry,
   tamper-evident), `POST /profile/passport` (audited, consent-framed),
   public `GET /api/verify/:token` (rate-limited), ProfilePage panel with
   copyable verification link. Tamper test verified (signature rejection).
5. Doc/comment drift fixes (scheduler status).

Verification after changes: API tsc clean · web tsc clean · vitest 7/7 ·
integration lifecycle all checks passing · web production build clean ·
7-check endpoint smoke (preview 404/200, reputation, passport issue, verify
valid, verify tampered → 422, tenor gate → 400) all PASS.

## Recommended next moves, in order

1. F4 recipient-deferral decision + implementation with integration test.
2. KYC capture (CNIC upload + admin review queue).
3. Shariah-first wizard defaults (I2) + purchasing-power headline (I3).
4. Capacitor Android wrap → closed pilot with 3–5 real circles.
5. SBP sandbox + Neem outreach in parallel (uses this build as the demo).
