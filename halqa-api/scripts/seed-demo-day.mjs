// Demo-day seed: named NEW members (quarantined to late turns), EXPERIENCED
// members (2+ clean circles + verified → any turn unlocked), a spread of open
// committees with VARYING durations/amounts, and live turn-marketplace listings.
//
//   DATABASE_URL="<prod session-pooler url>" node scripts/seed-demo-day.mjs https://halqa-api-delta.vercel.app/api
//
// The API handles registration + undertaking; a direct Prisma update grants the
// experienced members their clean-completion credit + verification (there is no
// API for that — it's an ops/manual step). All demo passwords are shown below.
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const base = process.argv[2] || 'https://halqa-api-delta.vercel.app/api';
const stamp = new Date().toISOString().slice(0, 10);
const PWD = 'demo1234';

const call = async (path, { token, method = 'GET', body } = {}) => {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, data: await r.json().catch(() => ({})) };
};
const ok = (label, r, allow = [200, 201, 409]) => { if (!allow.includes(r.status)) throw new Error(`${label}: ${r.status} ${JSON.stringify(r.data).slice(0, 160)}`); return r.data; };
let cnicSeq = Date.now() % 1000000;
const makeUser = async (fullName, username) => {
  const phone = `03${Math.floor(10 + Math.random() * 89)}${String(Date.now()).slice(-7)}`;
  const cnic = String(3520200000000 + (cnicSeq++)).slice(0, 13);
  const reg = await call('/auth/register', { method: 'POST', body: { fullName, username, phone, email: `${username}@demo.halqa.pk`, password: PWD, cnic } });
  const token = reg.data.accessToken || (await call('/auth/login', { method: 'POST', body: { identity: username, password: PWD } })).data.accessToken;
  if (!token) throw new Error(`could not create/login ${username}: ${JSON.stringify(reg.data).slice(0, 160)}`);
  await call('/agreements/sign', { token, method: 'POST', body: { doc: 'PLATFORM_UNDERTAKING', accept: true, signedName: fullName } });
  await call('/profile/payment-methods', { token, method: 'POST', body: { rail: 'RAAST', accountNo: phone, accountTitle: fullName, preferred: true } });
  console.log(`  user: @${username}`);
  return { token, username, fullName };
};

// --- Named demo members -----------------------------------------------------
console.log('— New members (quarantined to late turns) —');
const NEW = [['Ali Raza', 'naya.ali'], ['Sara Bibi', 'naya.sara'], ['Bilal Ahmed', 'naya.bilal']];
const newUsers = [];
for (const [full, un] of NEW) newUsers.push(await makeUser(full, un));

console.log('— Experienced members (2+ clean circles + verified → any turn) —');
const EXP = [['Khan Sahib', 'senior.khan'], ['Fatima Noor', 'senior.fatima'], ['Usman Malik', 'senior.usman']];
const expUsers = [];
for (const [full, un] of EXP) expUsers.push(await makeUser(full, un));
// Grant the experienced members their unlock directly (ops/manual step).
await prisma.user.updateMany({ where: { username: { in: expUsers.map(u => u.username) } }, data: { committeesCompletedClean: 3, earlyTurnVerifiedAt: new Date() } });
console.log(`  unlocked ${expUsers.length} experienced members (3 clean circles + verified)`);
// Give a couple of members a verification discount so the discount tiers show.
await prisma.user.updateMany({ where: { username: 'senior.khan' }, data: { chequeSecuredAt: new Date() } });      // 95%
await prisma.user.updateMany({ where: { username: 'senior.fatima' }, data: { incomeVerifiedAt: new Date() } });   // 80%

// --- Open committees with VARYING durations / amounts -----------------------
console.log('\n— Open committees (varying dates & amounts) —');
const OPEN = [
  { name: 'Weekly Traders Circle', cap: 6, rs: 2000, days: 7, goal: 'BUSINESS', gn: 'Daily stock' },
  { name: 'Gulshan Homemakers', cap: 10, rs: 5000, days: 30, goal: 'HOME', gn: 'Home setup' },
  { name: 'Clifton Hajj Savers', cap: 12, rs: 15000, days: 30, goal: 'HAJJ', gn: 'Hajj 2027' },
  { name: 'DHA School Fees', cap: 8, rs: 8000, days: 15, goal: 'EDUCATION', gn: 'Term fees' },
  { name: 'Bahria Builders', cap: 20, rs: 25000, days: 45, goal: 'HOME', gn: 'Construction' },
  { name: 'Model Town Aunties', cap: 14, rs: 4000, days: 30, goal: 'HOME', gn: 'Ghar ka saman' },
  { name: 'F-10 Umrah Circle', cap: 12, rs: 12000, days: 30, goal: 'HAJJ', gn: 'Umrah' },
  { name: 'Anarkali Wedding Circle', cap: 10, rs: 6000, days: 60, goal: 'WEDDING', gn: 'Shaadi bachat' },
  { name: 'Cantt Yearly Savers', cap: 12, rs: 10000, days: 365, goal: 'CUSTOM', gn: 'Big yearly goal' },
];
const hosts = expUsers; // experienced members host (they can take any turn)
const joiners = [...newUsers, ...expUsers];
for (let i = 0; i < OPEN.length; i++) {
  const c = OPEN[i]; const host = hosts[i % hosts.length];
  const created = ok('open circle', await call('/committees', { token: host.token, method: 'POST', body: {
    name: `${c.name} ${stamp}`, memberCap: c.cap, contributionPaisa: String(c.rs * 100),
    cadencePreset: c.days <= 10 ? 'VERY_SHORT' : c.days <= 20 ? 'SHORT' : c.days <= 45 ? 'MID' : 'LONG',
    periodDays: c.days, minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED',
    joinPolicy: 'OPEN_UNTIL_FULL', listedPublicly: true, goalType: c.goal, goalName: c.gn,
  } }));
  // Fill a couple of late seats so each circle looks alive but stays open.
  if (created.inviteCode) for (const j of joiners.slice(0, 2)) await call('/committees/join', { token: j.token, method: 'POST', body: { inviteCode: created.inviteCode } });
  console.log(`  open: ${c.name} · ${c.cap}×Rs${c.rs} / ${c.days}d`);
}

// --- Marketplace: active circles with listed turns + bids -------------------
console.log('\n— Turn marketplace (multiple listings) —');
for (let m = 0; m < 3; m++) {
  const host = expUsers[m % expUsers.length];
  const circle = ok('market circle', await call('/committees', { token: host.token, method: 'POST', body: {
    name: `Turn Market ${stamp}-${m + 1}`, memberCap: 4, contributionPaisa: String((5000 + m * 5000) * 100),
    cadencePreset: 'SHORT', periodDays: 15, minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY', listedPublicly: false,
  } }));
  if (!circle.inviteCode) continue;
  const members = [expUsers[(m + 1) % expUsers.length], expUsers[(m + 2) % expUsers.length]];
  for (const j of members) await call('/committees/join', { token: j.token, method: 'POST', body: { inviteCode: circle.inviteCode } });
  ok('start', await call(`/committees/${circle.id}/start`, { token: host.token, method: 'POST', body: {} }));
  const detail = (await call(`/committees/${circle.id}`, { token: host.token })).data;
  const round = (detail.rounds || []).find(r => r.status === 'COLLECTING');
  const tokById = { [detail.host?.id]: host.token };
  members.forEach((j, i) => { const mem = (detail.members || [])[i + 1]; if (mem) tokById[mem.userId] = j.token; });
  const later = (detail.members || []).filter(mm => mm.turnPosition > 1 && tokById[mm.userId]);
  const seller = later[later.length - 1];
  if (round && seller) {
    const sTok = tokById[seller.userId];
    await call('/payments/initiate', { token: sTok, method: 'POST', body: { roundId: round.id, rail: 'RAAST', idempotencyKey: `dm-${round.id}-${seller.userId}` } });
    const listing = ok('list turn', await call('/exchange', { token: sTok, method: 'POST', body: { committeeId: circle.id, premiumPaisa: String((1000 + m * 500) * 100) } }));
    const bidder = later.find(mm => mm.userId !== seller.userId);
    if (listing.id && bidder) {
      const bTok = tokById[bidder.userId];
      await call('/payments/initiate', { token: bTok, method: 'POST', body: { roundId: round.id, rail: 'JAZZCASH', idempotencyKey: `dm-${round.id}-${bidder.userId}` } });
      await call(`/exchange/${listing.id}/bid`, { token: bTok, method: 'POST', body: { premiumPaisa: String((1800 + m * 700) * 100) } });
    }
    console.log(`  listing ${m + 1}: turn #${seller.turnPosition} of Turn Market ${m + 1}`);
  }
}

await prisma.$disconnect();
console.log('\n=== DEMO LOGINS (password for all: ' + PWD + ') ===');
console.log('NEW (quarantined to late turns):        ' + newUsers.map(u => u.username).join(', '));
console.log('EXPERIENCED (any turn, verified):       ' + expUsers.map(u => u.username).join(', '));
console.log('Login field = username OR phone. Demo-day seed complete.');
