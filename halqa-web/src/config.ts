// Front-end feature flags. Flip a value here to turn a surface back on — no
// other code changes needed.

// Host-eligibility surfacing (the "Halqa reliability · Eligible to host" card on
// the dashboard and the "Hosting" row on the profile). Disabled on request
// 2026-07-07; set to true to bring both back exactly as they were.
export const SHOW_HOST_ELIGIBILITY = false;

// Bank / payment-partner rail (bank verification, bank-custody circles,
// guarantee pools, partner enforcement gates). Hidden from the whole
// front-end on request 2026-07-08 — set to true to bring every bank surface
// back. The backend rail is untouched, so nothing is lost by flipping this.
export const SHOW_BANK_RAIL = false;

// SIMPLE MODE (Kazi pivot, 2026-07-20): the stripped "just lend and pay"
// committee app for the customer-acquisition stage. When true, the whole
// investment layer (Vault, Terminal, earning engines, tiers, turn market) is
// hidden — the app is create / join / pay / collect only. All that code stays
// intact; flip to false to bring the full licensed product back. See the
// SIMPLE_MODE gates in Shell, App, CreateCirclePage and CommitteePage.
export const SIMPLE_MODE = true;
