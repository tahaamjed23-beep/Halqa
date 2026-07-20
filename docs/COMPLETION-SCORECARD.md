# Halqa — Completion scorecard
*2026-07-14. Percentages are honest engineering estimates of "done for this stage," where Stage 1 = record-only prototype. "Functional" means working end-to-end, exercised by automated tests and/or verified live in the browser. Suite: 25 unit + 283 integration checks (262 in relaxed demo mode).*

## Fully functional — use in a demo without fear (95–100%)
| Subsystem | % | Evidence |
|---|---|---|
| Committee lifecycle (create → join → consent → start → rounds → payments → payout → complete) | 100% | full lifecycle integration-tested; live circles seeded |
| Double-entry ledger (integer paisa, reason codes, idempotency, conservation) | 100% | conservation asserted by tests; every seed rupee ledgered |
| Profit engines: float sweep, Mudarabah deposits, patience tilt, early-bird, streak, prize draw, early fee (all five tiers) | 100% | Rs 15,000-promise + ladder CI-locked; per-tier tests |
| Protection stack: score gates, graduated deposits (30–90% configurable), 15% holdback, credit-weighted ordering, hidden grace, progressive penalties, bans + rehabilitation | 100% | each layer integration-tested |
| First-circle newcomer cap (Rs 25k until one clean cycle) | 100% | 403-path tested |
| Vault: parking, top-ups, 4 tiers incl. gated crypto, sweep, auto-cover | 100% | tier gates + auto-cover settlement tested |
| Auth & sessions: register, login, refresh rotation + reuse detection, logout, change-password | 100% | attack simulations in suite |
| Security barrier: lockout, timing defense, password policy, audit log, headers, secret validation (demo kill-switch currently ON) | 100% built | verified by attack tests when armed |
| Turn market: free swaps (halal tiers), premium listings (conventional, capped) | 95% | tested; UI polish possible |
| Credit Passport (signed export + public verification link) | 95% | issue + verify tested |
| Bank receivables pack (host JSON export) | 100% | fields + host-only 403 tested; browser-verified |
| Referral loyalty (Rs 250 from Halqa's share on first completed cycle) | 100% | once-ever ledger guarantee tested |
| Rafa assistant: 3D bot, page-following tutorial, ~120-intent FAQ | 90% | KB honest; LLM hook inert by design |
| Terminal / growth lab (31 schemes, bands, education, projections) | 95% | catalog synced; regression-checked |
| Personal per-turn growth chart + committee Growth tab | 90% | browser-verified; profit line is an estimate, not the exact allocator |
| PWA / phone layout | 90% | installable; walked at 375px |
| Urdu / RTL foundation | 70% | toggle + nav/hero/trust live; deep pages pending |
| Simulations & backtests (100k dual-arm Pakistan model, red-team, rate grid) | 100% | 8 CI assertions incl. dual-seed |
| Demo population (27 users, 7 circles incl. Rs 500k pot + 20-month shaadi fund) | 100% | seeded via real API, idempotent scripts |

## Built but dormant by design
| Subsystem | % | Why dormant |
|---|---|---|
| Bank-custody/guarantee sandbox rail (statement matching, guarantee pools) | 90% | feature-flagged OFF — Stage 2 material |
| Rafa LLM answer hook | scaffold | inert until an endpoint is configured |

## Not built in-app — by regulatory design (ghost-protocols/ specs ready)
Real custody & payments (01) · NADRA KYC / account linkage / eCIB (02) · collections & takaful (03) · production security shell: 2FA, vault, WAF, DR (04) · real treasury placements (05) · AML program (06). Each spec contains final schemas, API surfaces, provider shortlists and activation checklists — ~1–2 days code activation each once licence + partner + budget exist.

## Known honest gaps (the "engineering debt" list)
- No self-service password reset while logged out (change-password exists in-app) — needs SMS/email OTP rail.
- No DB migrations history (prisma db push, not migrate) · no automated backups · no staging environment.
- Rate limits are in-process (reset on restart); fine for demo, Redis-backed at production.
- Simulation ≠ history: all default/recovery numbers are calibrated-model outputs until the pilot generates ledger data.
- Postgres on this dev machine occasionally dies under memory pressure (0xC0000142) — restart runbook exists; irrelevant to production hosting.

## The one-line honest summary
**Stage-1 scope: ~95% complete and functionally demoable end-to-end today; production scope: specified to the day-plan level but intentionally unbuilt pending licence, partner and budget.**
