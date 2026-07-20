// Seed wave 2: upper-middle-class professionals + two big circles (pot up to
// Rs 500,000) + a 20-month lower-class wedding fund. Idempotent like wave 1.
// Note: contribution stays at Rs 25,000 max so the first-circle newcomer cap
// (≤25k/installment until one completed cycle) is respected by design.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const base = 'http://127.0.0.1:4101/api';

async function req(path, { token, method = 'GET', body } = {}) {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`${method} ${path} -> ${r.status} ${JSON.stringify(data)}`);
  return data;
}

const NEW_PEOPLE = [
  ['asim.banker',    'asim1234',    'Asim Raza',        'bank operations manager', 760, 150000],
  ['hina.doctor',    'hina1234',    'Dr Hina Siddiqui', 'general physician',       750, 120000],
  ['faisal.itexport','faisal1234',  'Faisal Mirza',     'IT services exporter',    745, 130000],
  ['kamran.engineer','kamran1234',  'Kamran Butt',      'site engineer',           740, 90000],
  ['sadia.lecturer', 'sadia1234',   'Sadia Khan',       'college lecturer',        735, 70000],
  ['zoya.dentist',   'zoya1234',    'Zoya Hassan',      'dentist',                 730, 95000],
  ['omar.importer',  'omar1234',    'Omar Farooqi',     'electronics importer',    725, 200000],
  ['rabia.boutique', 'rabia1234',   'Rabia Ahmed',      'boutique owner',          720, 80000],
  ['mahnoor.pharma', 'mahnoor1234', 'Mahnoor Javed',    'pharmaceutical rep',      715, 60000],
  ['bilal.estate',   'bilalE1234',  'Bilal Chaudhry',   'property dealer',         705, 110000],
];

const ALL_LOGINS = {
  // wave-1 + originals we reuse as members
  'rukhsana.bibi':'rukhsana1234','farzana.bibi':'farzana1234','shabana.teacher':'shabana1234','yusuf.karyana':'yusuf1234',
  'nadia.parlor':'nadia1234','imran.tailor':'imran1234','bushra.stitch':'bushra1234','tahira.maid':'tahira1234',
  'danish.gig':'danish1234','akram.mechanic':'akram1234','javed.driver':'javed1234','saleem.rickshaw':'saleem1234',
  'taha':'halqa123','ahmed':'halqa123','sana':'halqa123','ayesha':'halqa123','bilal':'halqa123',
};

const tokens = {};
let phoneSeq = 5500000;
for (const [username, password, fullName] of NEW_PEOPLE) {
  phoneSeq += 7;
  try {
    const r = await req('/auth/register', { method: 'POST', body: { fullName, username, phone: `0345${phoneSeq}`, email: `${username.replace('.', '_')}@halqa.pk`, password } });
    tokens[username] = r.accessToken; console.log(`registered ${username}`);
  } catch {
    const r = await req('/auth/login', { method: 'POST', body: { identity: username, password } });
    tokens[username] = r.accessToken; console.log(`exists    ${username}`);
  }
}
for (const [username,, , , score] of NEW_PEOPLE) await prisma.user.updateMany({ where: { username }, data: { creditScore: score } });
for (const [username,, , , , rupees] of NEW_PEOPLE) {
  const me = await prisma.user.findUnique({ where: { username } });
  const v = await req('/vault', { token: tokens[username] });
  if (Number(v.balancePaisa) > 0) continue;
  await req('/vault/deposit', { token: tokens[username], method: 'POST', body: { amountPaisa: String(rupees * 100), idempotencyKey: `seed2-vault-${me.id}` } });
  console.log(`vault +Rs ${rupees}  ${username}`);
}
for (const [username, password] of Object.entries(ALL_LOGINS)) {
  if (tokens[username]) continue;
  const r = await req('/auth/login', { method: 'POST', body: { identity: username, password } });
  tokens[username] = r.accessToken;
}

const CIRCLES = [
  // Rs 500,000 pot: 20 professionals × Rs 25,000 — the upper-middle flagship.
  ['Clifton Professionals Circle', 'asim.banker', { tier: 'SIGMA', earlyFeeBps: 1000, dividendPooled: true }, 25000, 20,
    ['hina.doctor','faisal.itexport','kamran.engineer','sadia.lecturer','zoya.dentist','omar.importer','rabia.boutique','mahnoor.pharma','bilal.estate','rukhsana.bibi','farzana.bibi','shabana.teacher','yusuf.karyana','nadia.parlor','imran.tailor','bushra.stitch','danish.gig','sana','ayesha'],
    true, 8, {}],
  // Rs 200,000 pot: 10 × Rs 20,000, fully-halal Bazaar for the cautious professional.
  ['Gulberg Khandan Bazaar', 'omar.importer', { tier: 'BAZAAR' }, 20000, 10,
    ['hina.doctor','kamran.engineer','sadia.lecturer','zoya.dentist','rabia.boutique','mahnoor.pharma','bilal.estate','faisal.itexport','yusuf.karyana'],
    true, 4, {}],
  // The long game: 20 members × Rs 2,500 × 20 monthly rounds ≈ 20-month wedding
  // fund — exactly how lower-income families actually save for a shaadi.
  ['Shaadi Bachat Circle', 'rukhsana.bibi', { tier: 'SUKOON' }, 2500, 20,
    ['farzana.bibi','shabana.teacher','yusuf.karyana','nadia.parlor','imran.tailor','bushra.stitch','tahira.maid','danish.gig','akram.mechanic','javed.driver','saleem.rickshaw','taha','ahmed','bilal','ayesha','sana','sadia.lecturer','mahnoor.pharma','zoya.dentist'],
    true, 9, { goalType: 'WEDDING', goalName: 'Beti ki shaadi fund' }],
];

for (const [name, host, extras, rupees, cap, members, start, payN, goal] of CIRCLES) {
  if (await prisma.committee.findFirst({ where: { name } })) { console.log(`circle ok ${name}`); continue; }
  const c = await req('/committees', { token: tokens[host], method: 'POST', body: {
    name, mode: 'ROTATING', memberCap: cap, contributionPaisa: String(rupees * 100), cadencePreset: 'SHORT', periodDays: 30,
    minMembersToStart: 3, reinvestRatio: 0, riskTolerance: 3, distributionMode: 'SHARE', orderMode: 'CREDIT_WEIGHTED',
    joinPolicy: 'INVITE_ONLY', custodyMode: 'RECORDED', tier: extras.tier, prizeDrawEnabled: false,
    earlyFeeBps: extras.earlyFeeBps || 0, dividendPooled: extras.dividendPooled || false, depositCoverageBps: 7000,
    ...goal,
  } });
  for (const m of members) await req('/committees/join', { token: tokens[m], method: 'POST', body: { inviteCode: c.inviteCode } });
  console.log(`created   ${name} (${members.length + 1} members, pot Rs ${(rupees * (members.length + 1)).toLocaleString()})`);
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
    await req('/payments', { token: tokens[uname], method: 'POST', body: { roundId: round.id, paidVia: 'RAAST', txnRef: `SEED2-${p.id.slice(-6)}`, idempotencyKey: `seed2-pay-${p.id}` } });
    paid++;
  }
  console.log(`started   ${name} — round 1: ${paid}/${round.payments.length} recorded`);
}

console.log('SEED WAVE 2 COMPLETE');
await prisma.$disconnect();
