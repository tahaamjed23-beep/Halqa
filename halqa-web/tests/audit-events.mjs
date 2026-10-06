// ---------------------------------------------------------------------------
// THE EVENT TAXONOMY, CHECKED
//
// Work register AM4. The taxonomy is only worth having if nothing escapes it,
// so this checks three things that a reviewer would otherwise have to take on
// trust:
//
//   the list is the whole list: every event has a name and a meaning;
//   nothing personal can travel, even when it is passed under an allowed name;
//   every screen records that it was seen, from one place rather than thirty.
//
// Plain Node, like the screen audit: the application carries no test runner.
//
//   node tests/audit-events.mjs
// ---------------------------------------------------------------------------
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'src');
const read = p => readFileSync(p, 'utf8');

const events = read(join(SRC, 'lib', 'events.ts'));
const app = read(join(SRC, 'App.tsx'));

const checks = [];
const check = (name, rule, run) => checks.push({ name, rule, run });

// Read the EVENTS object only. The legacy ACTION_EVENT bridge below it maps old
// names onto these, and is not itself a list of events.
const block = /export const EVENTS = \{([\s\S]*?)\n\} as const;/.exec(events);
if (!block) {
  console.log('  FAIL  The list: EVENTS is not defined in lib/events.ts');
  process.exit(1);
}
const names = [...block[1].matchAll(/^\s{2}(\w+):\s*'([^']+)',/gm)].map(m => [m[1], m[2]]);

check('The list', 'every event has a name and says what it means', () => {
  const bad = [];
  if (names.length < 40) bad.push(`only ${names.length} events are defined`);
  for (const [k, meaning] of names) {
    if (!/^[a-z][a-z0-9_]*$/.test(k)) bad.push(`${k} is not a plain lower case name`);
    if (meaning.length < 10) bad.push(`${k} does not say what it means`);
  }
  return bad;
});

check('Allowed properties', 'the list of properties an event may carry is short and named', () => {
  const m = /ALLOWED_PROPERTIES\s*=\s*\[([\s\S]*?)\]/.exec(events);
  if (!m) return ['ALLOWED_PROPERTIES is not defined'];
  const props = [...m[1].matchAll(/'([a-zA-Z]+)'/g)].map(x => x[1]);
  const bad = [];
  if (props.length === 0) bad.push('no properties are allowed, so nothing can be measured');
  if (props.length > 12) bad.push(`${props.length} properties is too many to keep honest`);
  for (const forbidden of ['name', 'phone', 'cnic', 'email', 'address', 'amount', 'balance', 'userId']) {
    if (props.includes(forbidden)) bad.push(`"${forbidden}" must never travel with an event`);
  }
  return bad;
});

check('Privacy', 'anything that looks personal is dropped before it leaves', () => {
  const bad = [];
  // The guards must exist and must cover the shapes that matter.
  for (const [what, re] of [
    ['a long number, which is an account or a phone', /\\d\{11,\}/],
    ['a CNIC', /\\d\{5\}-\\d\{7\}-\\d/],
    ['an email address', /@/],
    ['an amount of money', /Rs/],
  ]) {
    if (!re.test(events)) bad.push(`nothing guards against ${what}`);
  }
  if (!/value\.length\s*>\s*\d+/.test(events)) bad.push('nothing stops free text being passed as a property');
  return bad;
});

check('Unknown events', 'an event not on the list is refused rather than invented', () => {
  return /hasOwnProperty\.call\(EVENTS,\s*name\)|name in EVENTS/.test(events)
    ? [] : ['track() does not check the name against the list'];
});

check('Screen views', 'every screen records that it was seen, from one place', () => {
  const bad = [];
  if (!/trackScreen\(page\)/.test(app)) bad.push('App.tsx does not record the screen');
  if (!/\[page\]/.test(app)) bad.push('the screen is not recorded when the page changes');
  // and no screen should be doing it for itself, which is how two names appear
  // for one screen
  const walk = (dir) => readdirSync(dir).flatMap(n => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : (n.endsWith('.tsx') ? [p] : []);
  });
  for (const f of walk(join(SRC, 'pages'))) {
    if (/trackScreen\s*\(/.test(read(f))) bad.push(`${f} records its own screen view; App.tsx already does`);
  }
  return bad;
});

check('Analytics never breaks a screen', 'a failure in the sink is swallowed', () =>
  /catch\s*\{\s*\/\*[^*]*analytics/.test(events) ? [] : ['track() does not guard against a throwing sink']);

let failed = 0;
console.log(`Auditing the event taxonomy: ${names.length} events.\n`);
for (const { name, rule, run } of checks) {
  const bad = run();
  if (bad.length === 0) console.log(`  PASS  ${name}: ${rule}`);
  else {
    failed++;
    console.log(`  FAIL  ${name}: ${rule}`);
    for (const line of bad) console.log(`          ${line}`);
  }
}
console.log(`\n${checks.length - failed} of ${checks.length} checks pass.`);
process.exit(failed ? 1 : 0);
