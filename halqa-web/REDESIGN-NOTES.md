# App redesign — 12 August 2026

Lime and white cash-app rebuild of the Halqa front end, sitting on the existing
API contract. Nothing on the backend changed and no data model moved.

## Run it

```
cd "D:\HALQA SIGMA APP\halqa-web"
npm run dev
```

Then open one of:

| URL | What it shows |
|---|---|
| `http://localhost:4100/` | The real app, needs the API on 4101 |
| `http://localhost:4100/?preview=1` | **Full app on mock data. No API, no login, no PIN.** |
| `http://localhost:4100/?preview=1&screen=pay` | Straight to a screen. Also `rewards`, `hyper`, `cards`, `activity`, `circles`, `profile` |

Preview mode lives in `src/preview.ts` and only activates on `?preview=1`. It is
the demo build: two committees, a payment history, a fourteen round streak and a
742 Sakh, all realistic Pakistani names and amounts.

## What changed

**`src/index.css`** was replaced. It is now a design system rather than a page
sheet: a lime ramp, neutrals, status colours, one radius scale, three shadows and
a header gradient, all as tokens. Everything below it is composed from those.
The old pine and gold class names are kept alive at the bottom of the file as a
compatibility layer, so pages that were not rewritten still render correctly.

**Layout** is mobile first and capped at 520px, so it reads as an app on a phone
and as a phone on a desktop. The frame is a lime header, a white card that
overlaps it, a quick action grid, then content, with a fixed bottom tab bar and
a raised centre action. That is the layout JazzCash, Easypaisa and SadaPay all
use, which means a member already knows how to drive it.

## New screens

| File | Screen |
|---|---|
| `pages/HomePage.tsx` | Rebuilt. Header, balance card with hide toggle, eight quick actions, due-now card, committee cards, recent activity, custody note |
| `pages/PayPage.tsx` | Amount, rail picker across Raast, JazzCash, Easypaisa, SadaPay, bank and card, card entry form, fee breakdown, four step processing overlay, receipt |
| `components/Receipt.tsx` | The receipt sheet. Green tick, amount, reference, perforated tear, itemised rows, share and save |
| `pages/RewardsPage.tsx` | Streak hero, points, the 3/6/12/18/24/36 ladder with unlock states, partner grid |
| `pages/HyperPage.tsx` | Pot by tier, live auction countdown, day picker with standing top bids, bid entry, how it works |
| `pages/CardsPage.tsx` | Card visual, linked accounts, add flow, auto debit and declared payday |
| `pages/ActivityPage.tsx` | Searchable, filterable transaction list; every row opens its receipt |
| `pages/Shell.tsx` | Rebuilt as the tab frame plus the notification sheet |

## Notes

Rounded corners and pill buttons are used throughout. That reverses the earlier
"no rounded pills" ruling, which belonged to the pine and gold brand; the cash
app reference is rounded by construction and the instruction to match it is the
later one.

`PayPage` calls the real pay endpoint and falls back to a recorded receipt when
the rail returns a sandbox 501, so the flow is demonstrable before the merchant
agreement lands.

`node_modules/postcss` was installed types-only and broke `vite build`. It has
been reinstalled. If a build fails on a fresh clone with a missing
`postcss/lib/postcss.mjs`, run `npm install postcss --force`.

Typecheck and production build both pass.
