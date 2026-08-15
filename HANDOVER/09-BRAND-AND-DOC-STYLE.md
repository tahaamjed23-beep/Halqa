# 09 · BRAND AND DOCUMENT STYLE

Both were learned through explicit rejection. **Read the bans before producing
anything visual.**

---

## 1 · The brand — approved and shipped 2 August 2026

This **supersedes** the 20 July ruling of "gold and white, not dark green."

### Why it reversed

The chairman pasted JazzCash and Easypaisa screenshots: *"look at these guys and
look at us, we look like ai slop. we must look even more appealing than these."*

The market read that produced the new direction: the category's visual space is
split between **banks** (corporate green and navy) and the **400 predatory loan
apps** that spent two years teaching Pakistan to distrust bright green, red urgency
badges and countdown timers. **The territory for calm, permanent and visibly halal
was left vacant by the predators** — and that is where Halqa now sits.

Gold is retained as real brand equity but **demoted from lead to accent**:
gold-led reads as greed and rhymes with the loan apps.

### The palette — "Evergreen & Saved Gold"

| Name | Hex | Use |
|---|---|---|
| **Deep Pine** | `#07160F` | App ground, hero backgrounds |
| **Halqa Pine** | `#123D30` | Primary — buttons, active nav, avatars |
| **Pine Mid** | `#1B5140` | Gradient mid-tone |
| **Live Gold** | `#D9A93C` | The active turn, every call to action. Upgraded from antique `#C6A15B` so it survives a phone screen in daylight |
| **Bright Gold** | `#F0C356` | Highlights |
| **Ivory** | `#F6F1E4` | Ground — replaces clinical white because dignity has warmth |
| **Ink** | `#0E1512` | Body text |

### The logo — "The Register"

The poor's financial system does not run on an app or a bank. **It runs on a
notebook** — a name in a column, a stroke against each month.

So the mark is **ten tally marks arranged in a ring** — the organizer's register
bent into the shape of the word *halqa* (circle). **Nine ivory strokes are the
members who have paid; the tenth, gold and reaching inward, is whose turn it is
now.**

It reads as a circle, a clock, a register and a sunburst at once, and it holds
legibility down to 24 pixels because **the eye catches the one stroke that breaks
the pattern before it reads any detail.**

Shipped as `RegisterMark` in `halqa-web/src/components/ui.tsx`, used by `Logo`,
`HalqaOrb` and the App splash. Alternates kept but not chosen: *The Fold*,
*The Turn*.

**Source SVG** (also in `halqa-web/public/favicon.svg` with a pine rounded-rect
backing):

```svg
<svg viewBox="0 0 100 100">
  <g stroke="currentColor" stroke-width="7" stroke-linecap="round">
    <line x1="50" y1="9" x2="50" y2="25"/><line x1="71" y1="13.6" x2="63" y2="27.5"/>
    <line x1="86.4" y1="29" x2="72.5" y2="37"/><line x1="91" y1="50" x2="75" y2="50"/>
    <line x1="86.4" y1="71" x2="72.5" y2="63"/><line x1="71" y1="86.4" x2="63" y2="72.5"/>
    <line x1="50" y1="91" x2="50" y2="75"/><line x1="29" y1="86.4" x2="37" y2="72.5"/>
    <line x1="13.6" y1="71" x2="27.5" y2="63"/>
  </g>
  <line x1="9" y1="50" x2="31" y2="50" stroke="#D9A93C" stroke-width="9" stroke-linecap="round"/>
</svg>
```

### The score name — Sakh

**Sakh** is the Urdu word for economic credibility — exactly what the 300–850
number measures. It needs no tooltip for a Pakistani user and cannot be borrowed by
a foreign competitor.

### Voice — Roman Urdu first, English underneath

Hero: **"Apni committee, apnay log. Hisaab humara."**
Sub: *"Your committee. Your people. We keep the record — and we never hold your
money."*

**This is not stylistic.** Only 31% of committee users can read a text message, and
women — who participate at twice the rate of men — are least served by dense
English screens.

Ledger-row copy from the brand board, showing the register:

```
|||  Paisa kabhi Halqa ke paas nahi        no custody
||   Members pay Rs 0                      koi fees nahi
|    Raast · JazzCash · Easypaisa          har rail
|||  Har payment ka record                 sakh banti hai
```

### What shipped into the app (2 August, uncommitted working tree)

- `halqa-web/src/index.css` — `:root` palette; **all 13 near-black surfaces → pine**
  (`background:#171714` → `#123D30`); near-black ink → `#0E1512`; page ground →
  ivory `#F6F1E4`; muted antique gold `#b88a22` → Live Gold `#D9A93C`;
  `.auth-story` gradient → pine; `.orb` → pine; `.splash-ring` and `.brand-mark` →
  pine with a gold mark
- `halqa-web/src/components/ui.tsx` — `RegisterMark` component; `Logo` and
  `HalqaOrb` use it
- `halqa-web/src/App.tsx` — splash uses `RegisterMark`
- `halqa-web/public/favicon.svg` — **replaced a stock purple Vite mark** that had
  been shipping the whole time
- `halqa-web/public/manifest.webmanifest` + `index.html` — `theme_color` `#123D30`,
  `background_color` `#F6F1E4`

⚠️ **Mirrors not yet updated:** `halqa-web/dist/` and
`android/app/src/main/assets/public/` also hold copies of `favicon.svg` and
`icons.svg`.

⚠️ **Verification incomplete.** The auth screen was screenshotted and confirmed
correct (pine gradient, Register mark, gold accents). The **logged-in interior was
never visually verified** — the user stopped the backend start. Do that before
claiming the rebrand is fully checked.

**Reference:** `docs/HALQA-BRAND-BOARD.html` — published artifact, product-forward
JazzCash/Easypaisa-grade layout, **not** an editorial/Behance-style board (v1 was
rejected as exactly that).

---

## 2 · The design bans — each after an explicit rejection

| Banned | His words / the reason |
|---|---|
| **Rounded pill and badge elements** | *"these round boxes are found in all ai slop remove them completely and use alternatives"* — the universal AI tell. Use **ledger rules** (hairline rows with tally ticks), hard-edged borders, and left gold rules instead. |
| **Accent lines under headings** | A hallmark of AI-generated slides. Use whitespace or background colour. |
| **Decorative colour bars and accent stripes** | Header/footer bars spanning the width, vertical sidebar stripes, thin edge stripes on cards, single-side borders. AI filler. Use a subtle background tint, a shadow, or an icon. |
| **Italic kicker / teaser lines** | *"those like mini italic texts give away u are ai"* |
| **"As we discussed previously" boxes** | *"remove these disgusting boxes saying previously we mentioned, i hate that"* — no correction boxes, no self-referential meta. **Just state the correct fact.** |
| **Heavy black-background formatting** | *"what is this formatting black, just normal white page with black text and maybe graphs"* |
| **Editorial / Behance-style brand boards** | v1 rejected as *"ai slop."* Be product-forward, like JazzCash and Easypaisa. |
| **Cream / beige default backgrounds** | Use white or the brand palette. |
| **Text-only slides** | Every slide needs a visual element. |

---

## 3 · Document style — the register

**Formal-human.** Clear declarative sentences. Never casual — he specifically
rejected *"not WE DONT HOLD money"* phrasing.

**Benchmark: JP Morgan pitchbook discipline.**

### Rules

- **Figures are labelled Exhibits** — `EXHIBIT 1`, `EXHIBIT 2` — in small italic
  caption text above the table.
- **Mechanisms must be specific enough that "how?" never arises.** His example: do
  not say "payout holdback"; say *the release endpoint refuses while any round
  contribution is unpaid, plus linked-default withhold, plus a forward-liability
  pot slice capped at 60%.*
- **Mark provenance explicitly:** `verified` (we ran it), `modelled` (simulation),
  `reported` (third-party press). Never blur these.
- **Stage-tag capabilities:** `FUNCTIONAL` / `BUILD` / `GATE-2` / `STAGE-2`.
- **All figures in PKR.** US$ only in the international-competitor table.
- **Attribute every academic claim** to the study it came from.
- **State limitations honestly.** Every strong document in this set contains an
  "honest limits" or "what this is not" passage, and they consistently strengthen
  rather than weaken the case.

### The two registers — both must be maintained

**Meeting register** — bullets, numbers, counters. For pitch prep.

**Learning register** — for the chairman himself. Define every term at first use.
Show the rupee arithmetic he can verify by hand. Give a worked example. Add a
self-test question. Use physics and maths analogies (conservation laws,
control-versus-treatment, exponentials). He is 17, studies maths/chemistry/physics,
and has **zero finance background**.

Learning volumes build via:
`node docs/build-reports-pdf.mjs learning HALQA-LEARNING-VOLUMES "<title>"`

---

## 4 · The house HTML/PDF template

Every current report uses this. Copy it rather than inventing a new one.

```css
@page { size: A4; margin: 19mm 17mm; }
body{background:#fff;color:#0E1512;font-family:Georgia,'Times New Roman',serif;
     font-size:10.3pt;line-height:1.55;-webkit-print-color-adjust:exact;print-color-adjust:exact}
h1{font-size:15.5pt;font-weight:normal;padding-bottom:2mm;
   border-bottom:1.5px solid #123D30;color:#123D30}
h2{font-size:11.4pt;padding-bottom:1mm;border-bottom:1px solid #D9A93C}
th{background:#123D30;color:#F6F1E4;font-weight:bold}
td,th{border:1px solid #123D30;padding:1.8mm 2.3mm;font-size:9pt}
.box{border:1px solid #123D30;border-left:4px solid #D9A93C;background:#FBF8F0;
     padding:3.5mm 4.5mm;page-break-inside:avoid}
.math{font-family:Consolas,monospace;font-size:9.2pt;padding-left:4mm}
.exh{font-size:8.6pt;color:#4C574F;font-style:italic}   /* EXHIBIT captions */
.flag{font-size:9pt;font-style:italic;color:#4C574F}    /* caveats, sources */
.brk{page-break-before:always}
```

**Cover pattern:** the Register mark SVG in pine, `HALQA` at 32pt with `.2em`
letter-spacing, a 52mm gold rule, the title, an italic date line, then a short
grey paragraph stating what the document is and how to read its provenance marks.

**Stat strip:** a flex row bordered top and bottom in pine with gold dividers,
big pine numbers over small grey labels.

**Render to PDF** with headless Chrome — see `05` section 9. Use `--headless=new`
with `Start-Process -Wait`; plain `--headless` sometimes silently fails to write.

---

## 5 · Naming conventions

- The product is **Halqa** (Arabic/Urdu *halqa* = circle, ring, gathering).
- The score is **Sakh**.
- The logo is **The Register**.
- The palette is **Evergreen & Saved Gold**.
- Circles are **circles** or **committees**, never "groups."
- The organizer is the **host**.
- A member's turn is their **seat** or **turn**, never "slot" in user-facing copy
  (internally `slot` is fine).
- Documents are named `HALQA-<TOPIC>-<YYYY-MM-DD>.html/.pdf` in `docs/`.

Yes boss
