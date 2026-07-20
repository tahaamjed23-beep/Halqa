// Seeds a realistic demo population: 12 middle/lower-class Pakistani profiles
// with varied reliability scores and vault balances, in 4 committees at
// different stages. Idempotent: existing users are logged into, existing
// circles (by name) are skipped. Run: node tests/seed-demo.mjs (API on 4101).
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const base = 'http://127.0.0.1:4101/api';

async function req(path, { token, method = 'GET', body } = {}) {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${JSON.stringify(data)}`);
  return data;
}

// [username, password, fullName, occupation-note, creditScore, vaultRupees]
const PEOPLE = [
  ['rukhsana.bibi',  'rukhsana1234', 'Rukhsana Bibi',    'stitching business, host',   780, 45000],
  ['farzana.bibi',   'farzana1234',  'Farzana Bibi',     'home food business, host',   745, 30000],
  ['shabana.teacher','shabana1234',  'Shabana Parveen',  'school teacher, host',       730, 22000],
  ['yusuf.karyana',  'yusuf1234',    'Yusuf Rehman',     'karyana shopkeeper, host',   720, 18000],
  ['nadia.parlor',   'nadia1234',    'Nadia Aslam',      'beautician',                 705, 12000],
  ['imran.tailor',   'imran1234',    'Imran Qureshi',    'tailor',                     690,  8000],
  ['bushra.stitch',  'bushra1234',   'Bushra Malik',     'garments worker',            685,  6000],
  ['tahira.maid',    'tahira1234',   'Tahira Khatoon',   'domestic worker',            670,  2500],
  ['danish.gig',     'danish1234',   'Danish Ali',       'delivery rider',             660,  4000],
  ['akram.mechanic', 'akram1234',    'Akram Shah',       'motorcycle mechanic',        655,  5000],
  ['javed.driver',   'javed1234',    'Javed Iqbal',      'school-van driver',          640,  3000],
  ['saleem.rickshaw','saleem1234',   'Saleem Ahmed',     'rickshaw driver',            615,  1500],
];

const tokens = {};
let phoneSeq = 4400000;
for (const [username, password, fullName] of PEOPLE) {
  phoneSeq += 7;
  try {
    const r = await req('/auth/register', { method: 'POST', body: { fullName, username, phone: `0333${phoneSeq}`, email: `${username.replace('.', '_')}@halqa.pk`, password } });
    tokens[username] = r.accessToken;
    console.log(`registered ${username}`);
  } catch {
    const r = await req('/auth/login', { method: 'POST', body: { identity: username, password } });
    tokens[username] = r.accessToken;
    console.log(`exists    ${username}`);
  }
}
// Reliability scores are earned in real life; for the demo population we set
// them directly so the profiles read true (hosts >700, strugglers in the 600s).
for (const [username,, , , score] of PEOPLE) await prisma.user.updateMany({ where: { username }, data: { creditScore: score } });

// Vault balances (top-ups via the real API so the ledger stays double-entry).
for (const [username,, , , , rupees] of PEOPLE) {
  if (!rupees) continue;
  const me = await prisma.user.findUnique({ where: { username } });
  const already = await req('/vault', { token: tokens[username] });
  if (Number(already.balancePaisa) > 0) { console.log(`vault ok  ${username}`); continue; }
  await req('/vault/deposit', { token: tokens[username], method: 'POST', body: { amountPaisa: String(rupees * 100), idempotencyKey: `seed-vault-${me.id}` } });
  console.log(`vault +Rs ${rupees}  ${username}`);
}

// Circles: [name, host, tier-extras, contributionRs, cap, members..., start?, payFirstN]
const CIRCLES = [
  ['Gulshan Sisters Circle', 'rukhsana.bibi', { tier: 'BAZAAR' }, 5000, 8,
    ['shabana.teacher','nadia.parlor','farzana.bibi','tahira.maid','bushra.stitch','javed.driver','imran.tailor'], true, 5],
  ['Liaquatabad Ustaad Kameti', 'farzana.bibi', { tier: 'CLASSIC' }, 3000, 6,
    ['akram.mechanic','saleem.rickshaw','danish.gig','javed.driver','imran.tailor'], true, 6],
  ['Korangi Traders Sigma', 'yusuf.karyana', { tier: 'SIGMA', earlyFeeBps: 1000, dividendPooled: true }, 8000, 6,
    ['rukhsana.bibi','shabana.teacher','nadia.parlor','imran.tailor','danish.gig'], true, 3],
  ['Eid Bachat Circle', 'shabana.teacher', { tier: 'SUKOON' }, 2000, 10,
    ['tahira.maid','bushra.stitch','saleem.rickshaw'], false, 0],
];

for (const [name, host, extras, rupees, cap, members, start, payN] of CIRCLES) {
  if (await prisma.committee.findFirst({ where: { name } })) { console.log(`circle ok ${name}`); continue; }
  const c = await req('/committees', { token: tokens[host], method: 'POST', body: {
    name, mode: 'ROTATING', memberCap: cap, contributionPaisa: String(rupees * 100), cadencePreset: 'SHORT', periodDays: 30,
    minMembersToStart: 3, reinvestRatio: 0, riskTolerance: 3, distributionMode: 'SHARE', orderMode: 'CREDIT_WEIGHTED',
    joinPolicy: 'INVITE_ONLY', custodyMode: 'RECORDED', tier: extras.tier, prizeDrawEnabled: false,
    earlyFeeBps: extras.earlyFeeBps || 0, dividendPooled: extras.dividendPooled || false, depositCoverageBps: 7000,
  } });
  for (const m of members) await req('/committees/join', { token: tokens[m], method: 'POST', body: { inviteCode: c.inviteCode } });
  console.log(`created   ${name} (${members.length + 1} members)`);
  if (!start) continue;
  for (const m of [host, ...members]) await req(`/risk/committee/${c.id}/consent`, { token: tokens[m], method: 'POST', body: { accepted: true } });
  await req(`/committees/${c.id}/start`, { token: tokens[host], method: 'POST', body: {} });
  const detail = await req(`/committees/${c.id}`, { token: tokens[host] });
  const round = detail.rounds.find(r => r.roundNumber === 1);
  const byUser = new Map(detail.members.map(m => [m.userId, m.user.username]));
  let paid = 0;
  for (const p of round.payments) {
    if (paid >= payN) break;
    const uname = byUser.get(p.payerId);
    if (!tokens[uname]) continue;
    await req('/payments', { token: tokens[uname], method: 'POST', body: { roundId: round.id, paidVia: 'RAAST', txnRef: `SEED-${p.id.slice(-6)}`, idempotencyKey: `seed-pay-${p.id}` } });
    paid++;
  }
  console.log(`started   ${name} — round 1: ${paid}/${round.payments.length} recorded`);
}

console.log('SEED COMPLETE');
await prisma.$disconnect();
