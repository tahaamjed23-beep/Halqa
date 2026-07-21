# Codex task brief — Halqa (2026-07-21)

Self-contained. Do each task, keep 299+ integration assertions green, deploy, verify live.

## Repo map (Windows paths)
- API routes: `D:\HALQA SIGMA APP\halqa-api\src\routes\` — `committees.ts` `exchange.ts` `profile.ts` `auth.ts` `payments.ts` `protection.ts` `risk.ts` `vault.ts`
- API libs: `halqa-api\src\lib\` — `gap-fund.ts` `settlement.ts` `payment-provider.ts` `auto-debit.ts` `reputation.ts`; DB client `halqa-api\src\db.ts`; services `halqa-api\src\services\delinquency.ts`
- Prisma schema: `halqa-api\prisma\schema.prisma`; seed `prisma\seed.ts`
- Web pages: `halqa-web\src\pages\` — `HomePage.tsx` `CirclesPage.tsx` `CommitteePage.tsx` `CreateCirclePage.tsx` `MarketplacePage.tsx` `ProfilePage.tsx` `SettingsPage.tsx` `CreditPage.tsx` `AboutPage.tsx` `AuthPage.tsx`
- Web components: `halqa-web\src\components\` (`PhoneInput.tsx`, `ProtectionCenter.tsx`, `HostCard.tsx`, `rafa-knowledge.ts`)
- Web: types `halqa-web\src\types.ts`; styles `halqa-web\src\index.css`; feature flag `halqa-web\src\config.ts` (`SIMPLE_MODE=true`)
- Tests: `halqa-api\tests\integration.mjs`; demo seeds `halqa-api\scripts\seed-taha-world*.mjs`, `seed-live-demo.mjs`
- Reports: `docs\HALQA-FULL-REPORT-2026-07-21.md`, `docs\ROADMAP-LICENSING-AND-COSTS.md`

## Dev commands
Node/psql are portable under `D:\HALQA SIGMA APP\.tools\`. Add to PATH: `.tools\node-v22.22.0-win-x64`.
- Local Postgres: `.tools\postgresql-17.10\pgsql\bin\pg_ctl.exe -D "D:\HALQA SIGMA APP\.data\postgres" -l "D:\HALQA SIGMA APP\.data\pg.log" start` (port 54339, from `halqa-api\.env`)
- After schema edits: `cd halqa-api && npx prisma db push --skip-generate && npx prisma generate`, then **kill the API on 4101** (`netstat -ano | grep :4101` → `taskkill //F //PID <pid>`; `pkill -f tsx` MISSES it on Windows) and restart `npx tsx src/server.ts`.
- Run tests: from `halqa-api`, `node tests/integration.mjs` (needs the local API running on 4101). Expect `PASS:<n> FAIL:0`.
- Typecheck/build web: `cd halqa-web && npm run build` (runs `tsc -b && vite build`).
- Deploy (auth already on this machine): from each package dir `npx vercel@latest deploy --prod --yes`. Web project `halqa` → https://halqa-seven.vercel.app; API project `halqa-api` → https://halqa-api-delta.vercel.app.
- Prod DB column adds (non-destructive) via psql session pooler — the Supabase MCP `execute_sql` times out, use psql:
  `PGPASSWORD='6ZP.6cZPmgpRye5' psql "host=aws-0-ap-southeast-1.pooler.supabase.com port=5432 dbname=postgres user=postgres.lvxvncbflhlzsmvhgphq sslmode=require" -c 'ALTER TABLE "X" ADD COLUMN IF NOT EXISTS ...;'`
- Demo login: phone `03001234567` / `halqa123` (Taha, admin). Others: sana/ayesha/bilal `halqa123`.

---

## TASK 1 — Verify/fix Halqa gap-fund turn ordering (should be FIRST)
The host chose Halqa's filled seats take the **first** turns. Code is `halqa-api\src\routes\committees.ts` start route: `const ordered = [...sponsorMembers, ...orderedReal];` (sponsors first), then a loop assigns `turnPosition = i+1`. Sponsor memberships are created with placeholder `turnPosition: 1000+g` (gap-fund.ts) then reassigned.
- Repro: create a fresh circle (memberCap 6, min 3), join 3 members, consent all, start with `{fundGap:true}` OR create with `allowHalqaFill:true` and start with `{}`.
- Assert: the sponsor members (`user.username` starts `halqa.gap.`) hold turnPositions 1..N and every real member's position is greater. Integration test "Halqa sponsors take the FIRST turns" already covers this — run it.
- If a freshly-started circle still shows sponsors LAST, debug the reassignment (check nothing re-sorts `members` after; check the round-creation loop uses `ordered[i]`). Fix, add/extend the assertion, deploy.
- The circle in the screenshot (Halqa at 5–10) is stale (pre-fix). No migration needed for old circles; just confirm new ones are correct.

## TASK 2 — Seed marketplace "list turns" demos
Extend `halqa-api\scripts\seed-taha-world.mjs` (or a new `seed-market-demo.mjs`) to create several OPEN listings with bid wars, on the Taha world circles. Reuse the working pattern in `seed-live-demo.mjs`:
- A member with a **future, unreceived** turn must have **paid their current installment** before listing: `POST /payments/initiate {roundId,rail,idempotencyKey}`.
- List: `POST /exchange {committeeId, premiumPaisa}` (premium ≤ 50% of payout; Sukoon/Bazaar tiers require premium 0). Returns `{id}`.
- Bid: `POST /exchange/:id/bid {premiumPaisa}` — bidder needs score ≥ 650, a future unreceived turn in the same circle, current installment paid, and each bid must **exceed** the prior. Create 3 escalating bids per listing from different members.
- Accept (optional demo): `POST /exchange/:id/bids/:bidId/accept {idempotencyKey}`.
- Run it against production (`node scripts/seed-market-demo.mjs https://halqa-api-delta.vercel.app/api`). Verify listings show on the Market tab with "Turn #X / Y" and bids.

## TASK 3 — Circles page = DISCOVERY of new circles (OPEN + JOIN-NEXT-CYCLE), not ones the user is in
Dashboard (`HomePage.tsx`) already shows the user's own circles. Make `halqa-web\src\pages\CirclesPage.tsx` a **discovery** surface:
- Backend `GET /api/committees` (committees.ts ~line 39) already returns the union of (mine) + (FORMING & `listedPublicly:true`). On the Circles page, **filter to circles the user is NOT a member of and is not host** → these are the joinable "OPEN" ones. Keep the invite-code join box.
- Add a status label per discovered circle: **OPEN** (FORMING, `listedPublicly`, seats left) and **JOIN NEXT CYCLE** (see Task 6 waitlist; until built, show FULL circles that have host-enabled waitlist as "Join next cycle").
- Card shows: name, host reputation, contribution, period, seats filled `X/cap`, and if it has credit-weighting the **"Secure"** badge (Task 4).
- `Committee.listedPublicly` (bool) and `POST /committees/:id/listing {listed}` already exist (host visibility toggle in CommitteePage).

## TASK 4 — Make credit-weighting optional + "Secure" label
`CreateCirclePage.tsx` currently hardcodes `orderMode:'CREDIT_WEIGHTED'` in the create body. Backend enum already supports `RANDOM_BALLOT | HOST_ASSIGNED | CREDIT_WEIGHTED` (committees.ts input schema).
- Add a create toggle: **"Secure turn order (verified & reliable members go first)"** → on = `CREDIT_WEIGHTED`, off = `RANDOM_BALLOT`. Default on.
- Anywhere a circle is shown (discovery cards, committee header, marketplace), if `committee.orderMode === 'CREDIT_WEIGHTED'` render a small **🛡 Secure** badge with tooltip "Turn order is earned — verified, higher-reliability members rank first."
- Add `orderMode` to the web `Committee` type in `types.ts` (it may be missing) and to the committee GET payload if not already returned (the default `committeeInclude` returns all scalars, so likely present).

## TASK 5 — "Available turn slots" view (open slots with expected payout timeline)
In the discovery surface (and/or a "Available turns" section on the Market), for FORMING circles with `listedPublicly`, show each **open slot** as: *"Turn available in {committee name} — expected payout {date}"* with the projected payout timeline. If a circle has many open slots, list them all in this format.
- Compute projected payout dates client-side: for a forming circle, round k's payout ≈ `startDate + k * periodDays` (use "today" as the provisional start; label it "expected/provisional"). Show the next N open slots (cap = memberCap − currentMembers).
- This is a **join-with-preferred-position** teaser; joining still goes through the normal join flow (turn order finalises at start). Make copy clear it's provisional until the host starts.
- Optional backend helper: extend `GET /committees/preview/:inviteCode` or add `GET /committees/:id/slots` returning projected dates; or do it purely client-side from `periodDays` + `memberCap` + current member count.

## TASK 6 — JOIN NEXT CYCLE (waitlist) — the deferred piece
New capability: a member can register interest to join a circle's **next cycle** when it's full/running.
- Schema: add `CommitteeWaitlist` model (`committeeId`, `userId`, `createdAt`, `@@unique([committeeId,userId])`) OR a JSON list on Committee. Add host flag `acceptsWaitlist Boolean @default(false)`.
- Routes: `POST /committees/:id/waitlist` (join/leave), host toggle `acceptsWaitlist`. When a completed circle is re-run (or a new cycle created), notify waitlisted users.
- UI: on FULL/RUNNING circles with `acceptsWaitlist`, show "Join next cycle" → registers interest; host sees the waitlist count.
- Keep it minimal: this is a notify-list, not an auto-enrol. Migrate the prod column/table via psql.

---

## Guardrails
- Money is BigInt paisa; never floats. All mutations go through the double-entry ledger with idempotency keys.
- Brand: gold + white only; PKR only; no AI mentions anywhere; keep the honest Shariah labels.
- After each task: `npm run build` (web) + `npx tsc --noEmit` (api) clean, run `tests/integration.mjs` to `FAIL:0`, deploy both, verify the endpoint live with curl, then commit with a clear message ending `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- Serverless gotcha already fixed in `db.ts` (connection_limit=1). If timeouts return, check there first.
