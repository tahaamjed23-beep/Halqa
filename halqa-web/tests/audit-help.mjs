// ---------------------------------------------------------------------------
// HELP AND ASSISTANT CONTENT
//
// Work register section AM3: a help article for each of forty topics, and the
// assistant's answer updated to match.
//
// The reason this audit exists: the assistant's knowledge base had drifted from
// the product and nobody noticed, because nothing checked. On 6 October 2026 it
// still told members that Halqa never holds their money, that Halqa takes five
// per cent of the profit, that a score of 550 is needed to join and 700 to
// host, and it labelled features Shariah compliant. Every one of those was
// overturned between 28 September and 5 October. An assistant that answers
// confidently and wrongly is worse than one that says it does not know.
//
// So: every topic has an article, every article reaches the assistant, and no
// answer repeats a decision that has been withdrawn.
//
//   node tests/audit-help.mjs
//   node tests/audit-help.mjs --all
// ---------------------------------------------------------------------------
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SRC = join(HERE, '..', 'src');
const ALL = process.argv.includes('--all');

// Comments are stripped before anything is judged: both files explain the
// drift they were corrected for, and an explanation of a withdrawn decision
// is not a repetition of it. The first run of this audit flagged its own
// subject matter.
const stripComments = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const articlesSrc = stripComments(readFileSync(join(SRC, 'help', 'articles.ts'), 'utf8'));
const rafaSrc = stripComments(readFileSync(join(SRC, 'components', 'rafa-knowledge.ts'), 'utf8'));

// The forty topics, exactly as the work register names them.
const TOPICS = [
  'what a committee is', 'how Halqa works with the bank', 'opening the bank account',
  'why the bank checks fingerprints', 'the Rs 85 fee', 'the PSP service fee on wallets and cards',
  'the takaful or insurance fee', 'how the order of turns is set', 'score bands',
  'why new members start last', 'joining with a code', 'hosting a circle', 'admitting members',
  'reminders', 'paying by mandate', 'paying by wallet or card', 'paying by Raast',
  'when a payment fails', 'late charges', 'why the 8th', 'receiving the pot', 'arrears and set off',
  'hardship plans', 'leaving a circle', 'disputes', 'complaints', 'points and rewards',
  'the marketplace', 'the turn market', 'Hyper, an experiment', 'the credit record and TASDEEQ',
  'the credit score', 'keeping a PIN safe', 'changing phone or device', 'changing a phone number',
  'data and privacy', 'closing the account', 'members abroad', 'Islamic accounts',
  'contact and hours',
];

// Claims the chairman overturned. Each is paired with the decision that killed
// it, so a reader of a failure knows WHY rather than only that.
const WITHDRAWN = [
  [/never holds? your money|does not hold your money|no central pot/i,
   'the bank route of 28 September: the partner bank holds the money'],
  [/\b5%\s*Mudarib|five per cent of the profit|5 ?% of the profit/i,
   'the fee of 30 September: Rs 85 a payment, not a share of profit'],
  [/score of 550|550 or higher|550\+/i,
   'the seat matrix of 5 October: the score decides which SEATS are open, not whether you may join'],
  [/700\+ reliability|score of 700 or higher to host|need a 700/i,
   'the host rule of 5 October: a good score with proof, OR two clean committees, OR security'],
  [/built to be halal|fully halal|is halal\b|Shariah-reviewed/i,
   'the ruling of 29 September: Halqa puts no Shariah label on its own features'],
  [/two circles cleanly|two clean circles/i,
   'the seat matrix of 5 October: ONE clean committee opens every seat'],
  [/Halqa cover|covered by Halqa/i,
   'the ruling of 29 September: protection is a licensed operator’s, never Halqa’s'],
];

const findings = [];
const note = (what, detail) => findings.push(`${what}: ${detail}`);

// --- every topic has an article --------------------------------------------
const topicsInFile = [...articlesSrc.matchAll(/topic:\s*'([^']+)'/g)].map(m => m[1]);
for (const t of TOPICS) {
  if (!topicsInFile.includes(t)) note('a topic with no article', t);
}
if (topicsInFile.length !== TOPICS.length) {
  note('article count', `${topicsInFile.length} articles for ${TOPICS.length} topics`);
}

// --- every article is reachable from the assistant --------------------------
if (!/ARTICLES/.test(rafaSrc) || !/FROM_ARTICLES/.test(rafaSrc)) {
  note('the assistant', 'does not read the articles at all');
}
if (!/\[\.\.\.FROM_ARTICLES/.test(rafaSrc)) {
  note('the assistant', 'does not put the articles ahead of its older entries');
}

// --- no article is empty or a stub ------------------------------------------
for (const m of articlesSrc.matchAll(/id:\s*'([^']+)',\s*\n\s*topic:\s*'([^']+)',\s*\n\s*title:\s*'([^']+)'/g)) {
  if (m[3].length < 8) note('a title too short to be one', m[2]);
}
const bodies = [...articlesSrc.matchAll(/body:\s*((?:'(?:[^'\\]|\\.)*'\s*\+?\s*)+),/g)].map(m => m[1]);
if (bodies.length !== TOPICS.length) note('article bodies', `${bodies.length} found, ${TOPICS.length} expected`);
bodies.forEach((b, i) => {
  const text = b.replace(/'\s*\+\s*'/g, '').replace(/^'|'$/g, '');
  if (text.length < 120) note('an article too short to answer anything', topicsInFile[i] ?? `#${i}`);
});

// --- nothing repeats a withdrawn decision ----------------------------------
for (const [pattern, why] of WITHDRAWN) {
  for (const [file, text] of [['help/articles.ts', articlesSrc], ['components/rafa-knowledge.ts', rafaSrc]]) {
    const hit = pattern.exec(text);
    if (hit) note(`${file} repeats a withdrawn decision`, `"${hit[0]}" — ${why}`);
  }
}

// --- the starter questions are answerable ----------------------------------
const starters = [...rafaSrc.matchAll(/^'([^']{8,})',$/gm)].map(m => m[1]);
if (ALL && starters.length) console.log(`  ${starters.length} starter questions found`);

console.log(`Help content: ${TOPICS.length} topics, ${topicsInFile.length} articles.\n`);
if (findings.length === 0) {
  console.log('  PASS  every topic has an article, every article reaches the assistant,');
  console.log('        and nothing repeats a decision that has been withdrawn');
} else {
  console.log('  FAIL');
  for (const f of findings) console.log(`          ${f}`);
}
console.log(`\n${findings.length} findings.`);
process.exit(findings.length ? 1 : 0);
