// ---------------------------------------------------------------------------
// SCREEN AUDITS
//
// The work register asks the same few questions of every screen: does it hold
// up in dark mode, can a screen reader name every control, does the copy follow
// the rules, will it fit a 320 pixel handset. Asking them by hand, screen by
// screen, is how an answer goes stale the next time somebody edits a file.
// These ask them of the whole source tree in one run, so a screen cannot
// quietly stop satisfying them.
//
// Plain Node, no test runner: the web app does not carry one, and an audit that
// needs a new dependency is an audit nobody runs.
//
//   node tests/audit-screens.mjs          report and exit 1 on any failure
//   node tests/audit-screens.mjs --list   report every finding in full
// ---------------------------------------------------------------------------
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'src');
const FULL = process.argv.includes('--list');

function walk(dir, match) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p, match));
    else if (match.test(name)) out.push(p);
  }
  return out;
}

const tsx = () => [...walk(join(SRC, 'pages'), /\.tsx$/), ...walk(join(SRC, 'components'), /\.tsx$/)];
const read = p => readFileSync(p, 'utf8');
const where = p => relative(SRC, p).replace(/\\/g, '/');

/** Lines of a file with their 1-based numbers, skipping comments. */
function codeLines(text) {
  const out = [];
  let inBlock = false;
  text.split('\n').forEach((line, i) => {
    const t = line.trim();
    if (inBlock) { if (t.includes('*/')) inBlock = false; return; }
    // JSX comments open with {/*, so both forms are skipped here.
    if (t.startsWith('/*') || t.startsWith('{/*')) { if (!t.includes('*/')) inBlock = true; return; }
    if (t.startsWith('//') || t.startsWith('*')) return;
    out.push([i + 1, line]);
  });
  return out;
}

const checks = [];
const check = (name, rule, run) => checks.push({ name, rule, run });

// --------------------------------------------------------------- dark mode --
// A screen survives dark mode when it names no colour of its own: every colour
// comes from a token, which the dark block redefines. A hard coded white
// background or black text is the one thing that cannot follow the theme.
const HARD_COLOUR =
  /#(?:fff|ffffff|000|000000)\b|(?:color|background|background-color|border-color|fill|stroke)\s*:\s*(?:white|black)\b/i;

// A file may opt out of a check by naming it, with the reason, at the top:
//   // audit-allow: hard-coded-colour — a partner's brand mark, not Halqa's
// Three things genuinely must not follow the theme: another company's brand
// mark, a QR code (which has to be black on white to scan), and a screen that
// is withdrawn. Everything else fixes the colour rather than the rule.
const allows = file => {
  const head = read(file).slice(0, 2000);
  const out = new Set();
  for (const m of head.matchAll(/audit-allow:\s*([a-z-]+)/g)) out.add(m[1]);
  return out;
};

check('Dark mode', 'no screen hard codes white or black; every colour comes from a token', () => {
  const bad = [];
  for (const file of tsx()) {
    if (allows(file).has('hard-coded-colour')) continue;
    for (const [n, line] of codeLines(read(file))) {
      if (HARD_COLOUR.test(line)) bad.push(`${where(file)}:${n}  ${line.trim().slice(0, 100)}`);
    }
  }
  return bad;
});

check('Dark mode tokens', 'the dark block redefines the tokens every surface stands on', () => {
  const css = read(join(SRC, 'styles-wallet.css'));
  const bad = [];
  if (!/:root\[data-theme="dark"\]/.test(css)) bad.push('styles-wallet.css has no dark theme block');
  for (const token of ['--bg', '--ink', '--surface']) {
    if (!new RegExp(`:root\\[data-theme="dark"\\][^}]*${token}\\s*:`, 's').test(css)) {
      bad.push(`the dark block does not redefine ${token}`);
    }
  }
  return bad;
});

// ---------------------------------------------------------- screen readers --
// Every control a member can reach must say what it is. A button whose only
// content is an icon announces nothing, so it needs a label of its own.
check('Screen readers', 'every control is named; no icon-only button is left silent', () => {
  const bad = [];
  for (const file of tsx()) {
    const text = read(file);
    const re = /<button\b([^>]*)>([\s\S]{0,400}?)<\/button>/g;
    let m;
    while ((m = re.exec(text))) {
      const [, attrs, body] = m;
      if (/aria-label|title=/.test(attrs)) continue;
      if (body.replace(/<[^>]*>/g, '').trim().length > 0) continue;
      bad.push(`${where(file)}:${text.slice(0, m.index).split('\n').length}  ${m[0].replace(/\s+/g, ' ').slice(0, 90)}`);
    }
  }
  return bad;
});

check('Focus order', 'no control is jumped out of the natural order', () => {
  const bad = [];
  for (const file of tsx()) {
    for (const [n, line] of codeLines(read(file))) {
      const m = /tabIndex=\{?["']?(-?\d+)/.exec(line);
      if (m && Number(m[1]) > 0) bad.push(`${where(file)}:${n}  positive tabIndex ${m[1]}`);
    }
  }
  return bad;
});

// -------------------------------------------------------------------- copy --
// The rules for what a member reads: plain words, no slogans, no shouted
// labels, and none of the claims that later decisions made untrue.
const BANNED = [
  // "Unlock" is banned as marketing ("unlock rewards", "unlock custody"). It is
  // allowed where it literally means releasing the app's own lock, which is
  // what a PIN or a fingerprint does, so the lock screen keeps the plain word.
  // "Unlock" is banned as marketing ("unlock rewards", "unlock custody"). It is
  // allowed where it literally releases the app's own lock, which is what a PIN
  // or a fingerprint does, and allowed as the name of the lucide <Unlock/> icon.
  [/\bunlock\b(?![^<]{0,60}\b(pin|biometric|fingerprint|face|screen|device)\b)(?<!\b(pin|biometric|fingerprint|face|screen|device)\b[^<]{0,60}\bunlock)(?<!<)(?!\s*\/>)/i,
    'the word "unlock" used as marketing'],
  [/\bjourney\b/i, 'the word "journey"'],
  [/\btruly\b/i, 'the word "truly"'],
  [/Halqa the recorder/i, 'the recorder framing, banned 23 September 2026'],
  [/\bRs 0\b/, 'a claim that something costs Rs 0'],
  [/members never pay Halqa/i, 'a claim that members never pay Halqa'],
  [/no charge to contribute/i, 'a claim that contributing is free'],
  [/credit-weighted/i, 'credit weighted ordering, replaced by seat eligibility'],
  [/payout holdback/i, 'the payout holdback, withdrawn'],
];

check('Copy rules', 'no banned phrase survives where a member can read it', () => {
  const bad = [];
  for (const file of tsx()) {
    for (const [n, line] of codeLines(read(file))) {
      for (const [re, why] of BANNED) if (re.test(line)) bad.push(`${where(file)}:${n}  ${why}`);
    }
  }
  return bad;
});

check('Eyebrow labels', 'nothing is shouted at the member in capitals', () => {
  const bad = [];
  for (const file of tsx()) {
    for (const [n, line] of codeLines(read(file))) {
      const m = />\s*([A-Z]{3,}(?:\s+[A-Z]{3,})+)\s*</.exec(line);
      if (m) bad.push(`${where(file)}:${n}  "${m[1]}"`);
    }
  }
  return bad;
});

check('Dashes', 'no dash is used as punctuation in member-facing text', () => {
  const bad = [];
  for (const file of tsx()) {
    for (const [n, line] of codeLines(read(file))) {
      if (/[—–]/.test(line)) bad.push(`${where(file)}:${n}  ${line.trim().slice(0, 90)}`);
    }
  }
  return bad;
});

// ------------------------------------------- narrow handsets and big text --
// 320 pixels is the narrowest handset still in use in Pakistan, and a member
// who has turned the system text up must still be able to finish a payment.
check('Narrow handsets', 'no screen fixes a width wider than 320 pixels', () => {
  const bad = [];
  for (const file of tsx()) {
    for (const [n, line] of codeLines(read(file))) {
      const m = /\bwidth\s*:\s*['"]?(\d{3,4})px/.exec(line);
      if (m && Number(m[1]) > 320) bad.push(`${where(file)}:${n}  width ${m[1]}px`);
    }
  }
  return bad;
});

check('Large text', 'no screen fixes the height of a text block, which clips at large sizes', () => {
  const bad = [];
  for (const file of tsx()) {
    for (const [n, line] of codeLines(read(file))) {
      // A fixed height on a box that also carries text is what clips the text
      // when the member turns the system size up. Icons and avatars are square
      // and sized deliberately, so a matching width exempts the line.
      const h = /\bheight\s*:\s*['"]?(\d{2,4})px/.exec(line);
      if (h && Number(h[1]) >= 40 && !/width\s*:/.test(line)) {
        bad.push(`${where(file)}:${n}  fixed height ${h[1]}px`);
      }
    }
  }
  return bad;
});

// ------------------------------------------------------------------- run --
let failed = 0;
const files = tsx().length;
console.log(`Auditing ${files} screens and components.\n`);
for (const { name, rule, run } of checks) {
  const bad = run();
  if (bad.length === 0) {
    console.log(`  PASS  ${name}: ${rule}`);
  } else {
    failed++;
    console.log(`  FAIL  ${name}: ${rule}`);
    for (const line of FULL ? bad : bad.slice(0, 12)) console.log(`          ${line}`);
    if (!FULL && bad.length > 12) console.log(`          ... and ${bad.length - 12} more (run with --list)`);
  }
}
console.log(`\n${checks.length - failed} of ${checks.length} checks pass across ${files} files.`);
process.exit(failed ? 1 : 0);
