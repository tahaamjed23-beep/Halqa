# HALQA — DEPLOY RUNBOOK
### Status: cloud database is LIVE (Supabase, schema + seed pushed 2026-07-20). What remains is ~15 minutes of clicks.

## Already done
- ✅ Supabase Postgres live at project `lvxvncbflhlzsmvhgphq` (Singapore) — full schema + seed (5 demo users, 30 schemes)
- ✅ Git repository initialised locally with a clean .gitignore (no secrets, no tools, no data committed)
- ✅ App is env-ready: API reads `PORT`, `DATABASE_URL`, `WEB_ORIGIN`, `JWT_*`; web reads `VITE_API_URL`
- ✅ Simple mode on, sandbox payments, fund-the-gap, WhatsApp invites — all tested (271 integration assertions)

## Remaining steps (your clicks; I do all config)

### 1. GitHub (~3 min)
- github.com → New repository → name `halqa`, **Private** → create
- Then either install `gh` CLI and run `gh auth login`, or give me the repo URL and add credentials when git prompts on push
- I run: `git remote add origin <url> && git push -u origin master`

### 2. Render — the API (~5 min)  [render.com, free tier]
- Sign up with GitHub → New → Web Service → pick the `halqa` repo
- Root directory: `halqa-api` · Build: `npm install && npx prisma generate` · Start: `npx tsx src/server.ts`
- Environment variables (Settings → Environment):
  - `DATABASE_URL` = the Supabase **pooler** string (Session mode, port 5432 — from Supabase → Connect → Session pooler). **Reset the DB password first** (Supabase → Settings → Database → Reset) since the old one was exposed in chat, and use the NEW one here.
  - `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` = two long random strings (I can generate)
  - `NODE_ENV` = `production`
  - `WEB_ORIGIN` = your Vercel URL (add after step 3, then redeploy)
- Copy the Render URL (e.g. `https://halqa-api.onrender.com`)

### 3. Vercel — the web app (~4 min)  [you already have an account]
- vercel.com → Add New → Project → import the `halqa` repo
- Root directory: `halqa-web` · Framework: Vite (auto-detected)
- Environment variable: `VITE_API_URL` = the Render URL from step 2
- Deploy → copy the Vercel URL → paste it into Render's `WEB_ORIGIN` → redeploy API

### 4. After it's live (I do)
- OWASP ZAP scan against the live URL (free VAPT)
- Smoke test: register, create circle, invite, sandbox pay, collect
- Point a domain when you buy one (Vercel → Domains)

## Free-tier caveats (honest)
- Render free spins down after ~15 min idle → first request takes ~30s to wake. Fine for pilot; $7/mo removes it.
- Supabase free pauses after 7 days of NO connections — live traffic keeps it awake.
- The demo seed (taha/ayesha/etc, password halqa123) is in the cloud DB — before real users, tell me and I'll wipe demo data.
