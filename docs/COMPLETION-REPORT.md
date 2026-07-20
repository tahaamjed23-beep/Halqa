# Halqa — Detailed completion report
### Every subsystem: what it is, what provably works, the honest percentage with its justification, and exactly what the missing part is.
*2026-07-14. Method: a percentage here measures completeness against Stage-1 scope (record-only prototype). "Verified" cites the actual evidence — automated checks, CI locks, or live browser walks — not intention. Current suite: 25 unit + 283 integration checks (262 when the demo security kill-switch is on). Companion quick-table: COMPLETION-SCORECARD.md.*

---

## 1. Core committee lifecycle — **100%, fully functional**
**What it is:** the entire kameti loop as software — create (all five tiers, goal tags, protection knobs, the new 30–90% deposit-coverage slider), invite/join (score gate ≥550, first-circle cap ≤Rs 25k, pre-join preview with host reputation), consent collection, start (credit-weighted or ballot ordering, deposit sizing, round/payment generation), monthly rounds (record → track → release), payout with 15% holdback, cycle completion (deposit returns, profit split, score +25, penalty routing to charity/never-late).
**Verified by:** the integration suite runs multiple full lifecycles end-to-end — Classic, Bazaar, Priority, Sigma, guarantee-pool and auto-cover variants — every run, twice consecutively. Seven live circles seeded through the public API (nothing injected around it), from Rs 50k to Rs 500k pots.
**The missing 0%:** nothing known within scope. Two scope notes, not gaps: no committee restart/merge tooling (deliberately out of scope), host cap of 5 active circles is policy.

## 2. The ledger — **100%, fully functional**
**What it is:** double-entry, integer-paisa (BigInt), every entry with debit/credit accounts, reason code, reference and idempotency key. Every balance in the product is a *derivation* from entries, never a stored number that could drift.
**Verified by:** the conservation test (cycle bonuses ≡ real profit created, to the paisa) is a CI assertion; idempotency proven by replay tests (same key twice → one entry); the referral bonus's once-ever guarantee is enforced *by* ledger idempotency and tested across two suite runs.
**Missing:** nothing functional. Production wish-list item: periodic ledger snapshotting for O(1) balance reads at millions of entries (a performance optimization, irrelevant at demo scale).

## 3. Profit engines — **100%, fully functional (as computations)**
**What it is:** float sweep (per-payment day-count accrual, clamped against backdating), Mudarabah deposit yield on the coverage-sized deposits, patience tilt (capital-days × 1.0→2.0 weights), early-bird 1.25× boost, staking streak (+5%/clean round, cap +20%), deterministic prize draw (hiba, principal never staked), the ≤10% declining early fee (immediate-dividend and pooled modes), and the five tier bundles over these levers.
**Verified by:** the Rs 15,000-promise ladder is a CI test (Classic 0 → Priority ~7.6k → Bazaar ~6.3k → Sigma monthly ~13.9k → Sigma pooled **15,639** at the 70% coverage default); conservation holds; the backtest grid (rates ±30% × payer behaviour) and the coverage sweep (30→90%) are reproducible scripts.
**The honest asterisk (by design, not defect):** all yield is *computed* at dated indicative rates — nothing is deployed. That's the record-only stage itself; the conversion to real yield is ghost protocol 05.

## 4. Protection stack — **100% built and tested; effectiveness modelled, not yet lived**
**What it is:** eleven layers — score gates (550/700), first-circle cap, credit-weighted ordering, graduated deposits (host-configurable 30–90%, cap +5pp, credit-adjusted per member), 15% payout holdback with clean-payment release, reminders + peer nudges, the hidden grace window (clamped 2–14 days, never displayed), progressive fixed penalties (2/5/10%, → charity in halal tiers), vault auto-cover, guarantor option, ban + forfeiture + rehabilitation path.
**Verified by:** each layer has integration coverage (403s for the caps, holdback force-release at completion, auto-cover settling an overdue installment from the vault with penalty still applied, penalty-routing assertions).
**The honest distinction:** the *mechanisms* are 100% functional. The *outcome numbers* (0.27% defaults, ~84% recovery at the 70% default) are calibrated-simulation results — CI-locked so they can't drift, but still model, not history. The pilot converts them; ghost 03 measures them live.

## 5. Sukoon Vault — **100%, fully functional**
**What it is:** parking payouts, top-ups from Rs 100, four yield tiers (Standard/Income/Gold 🟢, Crypto 🟠 double-gated: UI double-confirm AND API `acknowledgeExtremeRisk` else HTTP 428; personal-only, permanently barred from committees), full sweep (principal + profit − 5% on profit only), and auto-cover as opt-in self-insurance.
**Verified by:** tier-gate tests (the 428 path), auto-cover end-to-end, sweep math; 27 seeded vaults (Rs 1,500 → Rs 200,000) created through the real deposit API.
**Missing:** partial withdrawals (currently full-sweep only) — a UX nicety deferred, not a correctness gap.

## 6. Authentication & sessions — **100%, attack-tested**
**What it is:** register (with optional referral handle), login, JWT access (30 min) + refresh (30 days) with **rotation and family-based reuse detection** (a replayed token burns every descendant session), logout (kills the whole family), in-app change-password (revokes all sessions), unique `jti` per token.
**Verified by:** the suite literally performs the attacks — steals and replays a token (confirms 401 + family burn + audit row), hammers wrong passwords (confirms 423 lockout), registers weak passwords (confirms 400).
**Missing:** logged-out self-service password *reset* — requires an SMS/email OTP rail we don't have yet (Rafa answers this honestly in-app). This is the largest genuine functional gap in the product.

## 7. Security barrier — **100% of in-scope items built; currently DISARMED by your order**
**What it is:** two layers. *App-layer:* per-account lockout (5 fails → 15 min, even for the correct password), bcrypt timing defense against username enumeration, letters+digits password policy, append-only SecurityEvent audit trail (IP, device, detail on every auth event), boot-time JWT-secret validation (production refuses weak/equal secrets), strict headers (CSP default-src 'none', HSTS, no-referrer, no x-powered-by), CORS allowlist, layered rate limits, 1 MB body cap. *Kill-switch:* `SECURITY_RELAXED=true` currently disables lockout/policy/replay-burn for demos; hard-impossible in production via NODE_ENV guard; suite auto-detects and reports which mode it tested.
**Verified by:** attack simulations in the armed suite (283 checks); relaxed-mode behaviour verified live (6 failures then correct password → 200); headers verified by curl; `npm audit --omit=dev` = 0 vulnerabilities on both packages.
**Missing (deliberately, until unlocks):** 2FA/step-up, secrets vault, WAF/DDoS, monitoring pager, backups/DR, pen test — all specified to checklist level in ghost 04. These are the difference between "bank-grade application security" (have) and "production security shell" (specified, awaiting budget).

## 8. Reputation & bank-facing surfaces — **95%**
**What it is:** Credit Passport (signed export, public verification link, 90-day validity, no-account verification), host reputation card at join, and the receivables pack (host-only JSON export: forward inflow schedule, per-member reliability/KYC/on-time %/collateral, record-only disclaimer).
**Verified by:** passport issue/verify tests; receivables field assertions + non-host 403; the export button clicked live in the browser with the downloaded JSON inspected.
**The missing 5%:** passport revocation UI (tokens expire naturally but can't be manually revoked early) and a PDF-pretty version of the receivables pack (currently raw JSON — fine for a banker's analyst, not for a banker's eyes).

## 9. Turn market — **95%**
**What it is:** free swaps in halal tiers (mutual consent, no consideration), premium listings/bids in conventional tiers only (≤50% of payout, 10% marketplace fee on premium only), Shariah gate blocking premiums in Sukoon/Bazaar.
**Verified by:** swap and premium lifecycle tests including the halal-tier block.
**Missing 5%:** market-depth UX (sorting, notifications on bids) — mechanics complete.

## 10. Terminal / growth laboratory — **95%**
**What it is:** two tabs (Halqa engine sleeves vs 26 market schemes), Low/Med/High/Extreme bands, dated "rate verified" stamps with staleness warnings, per-scheme education, projection modeller, crypto visible only at ceiling 10 with red banner + double-confirm.
**Verified by:** catalog sync dedupe regression test (the 38-row orphan bug is covered), browser walks; rates carry source links.
**Missing 5%:** rates are manually curated (by design at this stage — a live feed is a ghost-05 byproduct); minor polish.

## 11. Rafa assistant — **90%**
**What it is:** CSS-3D mascot reacting to real events (pay→nod, deposit→coin, payout→celebrate), idle behaviours, page-following interactive tutorial, ~120-intent FAQ with honest fallbacks, greetings, bottom-sheet on phones, LLM scaffold (POSTs to `window.RAFA_LLM_URL` if ever configured; 6s timeout; honest fallback) — currently inert by design.
**Verified by:** KB truthfulness audited twice (answers about non-existent features were rewritten; password answer updated when change-password shipped); mounted on both app branches (the committee-page gap was found and fixed).
**Missing 10%:** no Urdu KB yet; LLM endpoint unconfigured (deliberate — no key ships in a prototype).

## 12. Web app shell, PWA & mobile — **90%**
**What it is:** React/TS/Vite, installable PWA (manifest, theme-color), responsive to 375px (Rafa becomes bottom sheet ≤600px, 44px touch targets), typography pass, total bank-mention removal behind `SHOW_BANK_RAIL=false`, per-turn personal growth chart in every committee's Growth tab.
**Verified by:** production builds clean; desktop + 375px walks; personal chart verified live (turn #1 shows the loan-shape, correct receive amount).
**Missing 10%:** no offline mode (PWA installs but needs network); the personal chart's profit line is a scaled reference estimate, clearly labelled indicative, not the exact allocator output (exact-per-position API endpoint is a known upgrade).

## 13. Urdu / RTL — **70%** (largest genuine in-scope gap)
**What it is:** typed dictionary + `useLang` with module-level shared state (the sibling-page bug was found live and fixed), one-tap toggle, full RTL flip, persisted choice.
**Verified by:** live browser test — nav, hero, trust banner flip instantly both directions.
**Missing 30%:** deep pages (create flow, committee tabs, vault, terminal) remain English; Rafa KB untranslated. The foundation makes each additional string a one-line dictionary entry — it's translation labour, not engineering.

## 14. Simulations & evidence base — **100% (as models)**
**What it is:** the dual-arm 100k Pakistan-calibrated model (5 segments, Eid/school-fee seasonality, identical seeded randomness across arms), the hostile red-team Monte Carlo, the rate×behaviour backtest grid, the coverage sweep, the bonus-report tool.
**Verified by:** 8 CI assertions including determinism and second-seed robustness; headline claims cannot drift without failing the build.
**Standing caveat (stated everywhere, on purpose):** calibrated models, not ledger history — the pilot's job.

## 15. Demo environment — **100%**
27 realistic accounts (rickshaw driver at 615/Rs 1.5k → importer at 725/Rs 200k), 7 circles across the full spectrum: Rs 500,000 professional Sigma pot, Rs 200k halal Bazaar, three working/lower-class circles at different round-states, a forming circle for join demos, and the 20-month × 20-member wedding-goal fund. All seeded through the public API by idempotent scripts; full roster with passwords in DEMO-ACCOUNTS.md.

## 16. Dormant by design
Bank-custody sandbox rail (statement matching, guarantee pools, Level-2 KYC gates) — **~90% built, feature-flagged OFF**, one flag restores it when a real partner exists. Ghost-protocols vault — six production systems specified to activation-checklist level, zero app references.

## 17. Engineering infrastructure — **the honest debt list**
No migration history (prisma db push; fine solo, needs `migrate` before a second engineer) · no automated DB backups on this dev machine · no staging environment · in-process rate limits (reset on restart; Redis at production) · dev Postgres occasionally killed by Windows memory pressure (0xC0000142; restart runbook exists; irrelevant to production hosting) · CI runs locally per change, not in a hosted pipeline.

---

## The bottom line
| Band | Verdict |
|---|---|
| Stage-1 product scope | **~95% complete; every core flow functional and demoable today** |
| Evidence quality | headline claims are automated tests, not slides |
| Biggest true gaps | logged-out password reset · Urdu depth (70%) · infra debt (§17) |
| Production scope | 0% built, ~100% specified (ghost vault) — by regulatory design, not omission |
