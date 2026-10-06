// ---------------------------------------------------------------------------
// CONTRAST
//
// Work register: "contrast of every text and control checked" on each screen,
// and WCAG 2.2 success criteria 1.4.3 (text) and 1.4.11 (controls and graphics)
// in section AK.
//
// Checking contrast screen by screen, by eye, is how an answer goes stale. Every
// colour in the application now comes from a token, which the screen audit
// enforces, so the question "is this screen readable" reduces to "is every pair
// of tokens that can meet readable". That is arithmetic, and it is below.
//
// The thresholds are WCAG's:
//   4.5 to 1   ordinary text
//   3.0 to 1   large text (18.66px bold or 24px), and controls and their borders
//
// Both themes are checked. Dark mode redefines the tokens, so a pair that passes
// in light can fail in dark, which is exactly the failure nobody finds by eye.
//
//   node tests/audit-contrast.mjs            report
//   node tests/audit-contrast.mjs --all      every pair with its ratio
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'src');
const ALL = process.argv.includes('--all');
const read = p => readFileSync(p, 'utf8');

// ------------------------------------------------------------ the colours --
/** Pull `--name:#hex` pairs out of a block of CSS. */
function tokensIn(css) {
  const out = {};
  for (const m of css.matchAll(/--([\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})\b/g)) out[m[1]] = m[2];
  return out;
}

const tokensCss = read(join(SRC, 'tokens.css'));
const walletCss = read(join(SRC, 'styles-wallet.css'));

/** The text of a balanced {...} block starting at `from`. */
function blockAt(css, from) {
  const open = css.indexOf('{', from);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') { depth--; if (depth === 0) return css.slice(open + 1, i); }
  }
  return '';
}

// The LIGHT values are the base :root block only. tokens.css also carries a
// prefers-color-scheme block further down, and reading the file as a whole let
// the dark values overwrite the light ones, which quietly made the audit judge
// the wrong colours.
const light = tokensIn(blockAt(tokensCss, tokensCss.indexOf(':root')));

// DARK is the light set with both dark blocks laid over it: the one that
// follows the system setting, and the one the member chooses by hand. Anything
// neither names keeps its light value, which is how the application behaves.
const darkFromSystem = /@media \(prefers-color-scheme: dark\)/.exec(tokensCss);
const darkByChoiceCss = /:root\[data-theme="dark"\]/.exec(tokensCss);
const dark = {
  ...light,
  ...(darkFromSystem ? tokensIn(blockAt(tokensCss, darkFromSystem.index)) : {}),
  ...(darkByChoiceCss ? tokensIn(blockAt(tokensCss, darkByChoiceCss.index)) : {}),
  ...tokensIn(blockAt(walletCss, walletCss.indexOf(':root[data-theme="dark"]'))),
};

// ------------------------------------------------------------- the maths --
function rgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map(c => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6); // ignore the alpha channel
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
}

/** Relative luminance, WCAG 2.x. */
function luminance(hex) {
  const [r, g, b] = rgb(hex).map(v => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function ratio(a, b) {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// ------------------------------------------- the pairs that actually meet --
// Each pair is a foreground that genuinely sits on that background somewhere in
// the application, with the threshold its role demands.
const PAIRS = [
  // ordinary text on the page and on a card
  ['ink', 'bg', 4.5, 'primary text on the page'],
  ['ink', 'surface', 4.5, 'primary text on a card'],
  ['ink', 'surface-2', 4.5, 'primary text in a well'],
  ['ink-2', 'bg', 4.5, 'secondary text on the page'],
  ['ink-2', 'surface', 4.5, 'secondary text on a card'],
  ['muted', 'bg', 4.5, 'supporting text on the page'],
  ['muted', 'surface', 4.5, 'supporting text on a card'],
  // text on a coloured surface: ink on the bright brand, white on the deep
  ['on-soft', 'l200', 4.5, 'text on the softest brand tint'],
  ['on-soft', 'l300', 4.5, 'text on the light brand colour'],
  ['on-accent', 'l400', 4.5, 'text on the bright brand colour'],
  ['on-accent', 'l500', 4.5, 'text on the brand colour'],
  ['on-deep', 'l700', 4.5, 'text on the deepest brand colour'],
  ['on-deep', 'l900', 4.5, 'text on the darkest brand colour'],
  // status text on its own tint
  ['ok', 'ok-bg', 4.5, 'a success message'],
  ['warn', 'warn-bg', 4.5, 'a warning message'],
  ['bad', 'bad-bg', 4.5, 'a failure message'],
  ['info', 'info-bg', 4.5, 'an information message'],
  // controls and the lines that bound them, which are 3 to 1 (WCAG 1.4.11)
  ['line-control', 'surface', 3, 'the border of an input or a ghost button'],
  ['line-control', 'bg', 3, 'the border of a control on the page'],
  ['l700', 'surface', 3, 'the edge of a brand control on a card'],
];

// Listed so each exemption is deliberate rather than forgotten.
const EXEMPT = [
  ['faint', 'surface', 'placeholder and disabled text, exempt under WCAG 1.4.3, which excludes inactive controls'],
  ['line', 'surface', 'a hairline between two rows. It separates, it does not bound a control, and nothing depends '
    + 'on seeing it: the rows are told apart by their text. WCAG 1.4.11 covers controls and meaningful graphics'],
  ['ok-line', 'ok-bg', 'the edge of a tinted message. The message is understood from its words and its icon, both of '
    + 'which carry 4.5 to 1; the edge is decoration'],
  ['warn-line', 'warn-bg', 'as above'],
  ['bad-line', 'bad-bg', 'as above'],
  ['info-line', 'info-bg', 'as above'],
];

function run(theme, tokens) {
  const bad = [];
  const rows = [];
  for (const [fg, bg, need, what] of PAIRS) {
    if (!tokens[fg] || !tokens[bg]) { bad.push(`${theme}: ${fg} or ${bg} is not defined`); continue; }
    const r = ratio(tokens[fg], tokens[bg]);
    rows.push([theme, what, fg, bg, r, need]);
    if (r < need) {
      bad.push(`${theme}: ${what} (${fg} on ${bg}) is ${r.toFixed(2)} to 1, needs ${need}`);
    }
  }
  return { bad, rows };
}

const l = run('light', light);
const d = run('dark', dark);
const bad = [...l.bad, ...d.bad];

console.log(`Contrast across ${PAIRS.length} pairs, in both themes.\n`);
if (ALL) {
  for (const [theme, what, fg, bg, r, need] of [...l.rows, ...d.rows]) {
    console.log(`  ${r >= need ? 'pass' : 'FAIL'}  ${theme.padEnd(5)} ${r.toFixed(2).padStart(6)} to 1 (needs ${need})  ${what}`);
  }
  console.log('');
  for (const [fg, bg, why] of EXEMPT) {
    console.log(`  exempt  ${fg} on ${bg}: ${why}, ratio ${ratio(light[fg], light[bg]).toFixed(2)}`);
  }
  console.log('');
}
if (bad.length === 0) {
  console.log('  PASS  every pair of tokens that can meet is readable, in light and in dark');
} else {
  console.log('  FAIL  these pairs are not readable:');
  for (const line of bad) console.log(`          ${line}`);
}
console.log(`\n${PAIRS.length * 2 - bad.length} of ${PAIRS.length * 2} pairs pass.`);
process.exit(bad.length ? 1 : 0);
