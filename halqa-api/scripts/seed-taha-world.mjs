// Builds a realistic demo world around the chairman's account (taha) on the
// LIVE deployment, entirely through the public API:
//   - 8 named demo members (register returns tokens, so no extra logins)
//   - "Model Town Family Committee": taha hosts, ACTIVE, others paid, taha's
//     own installment left PENDING so the Pay button is visible to him
//   - a turn listed at a premium with an escalating bid war (3 bidders)
//   - "DHA Business Circle": taha as a MEMBER, his installment PAID (receipt)
//   - "Wedding Fund — Cousins": taha hosts, left FORMING (invite + fill flows)
// Run: node scripts/seed-taha-world.mjs https://halqa-api-delta.vercel.app/api
const base = process.argv[2] || 'https://halqa-api-delta.vercel.app/api';
const stamp = Date.now().toString().slice(-6);

const call = async (path, { token, method = 'GET', body } = {}) => {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, data: await r.json().catch(() => ({})) };
};
const ok = (label, r, tolerate = [409]) => {
  if (![200, 201].includes(r.status) && !tolerate.includes(r.status)) throw new Error(`${label}: ${r.status} ${JSON.stringify(r.data).slice(0, 140)}`);
  console.log(`${label}: ${r.status}`);
  return r.data;
};

const taha = (await call('/auth/login', { method: 'POST', body: { identity: '03001234567', password: 'halqa123' } })).data.accessToken;
if (!taha) throw new Error('taha login failed');
console.log('taha logged in');

// ---- 8 named members (register hands back tokens directly) ----
const PEOPLE = [
  ['Fatima Malik', 'fatima.malik'], ['Hassan Sheikh', 'hassan.sheikh'], ['Zainab Qureshi', 'zainab.q'],
  ['Usman Tariq', 'usman.tariq'], ['Maryam Javed', 'maryam.javed'], ['Ali Hamza', 'ali.hamza'],
  ['Noor Fatima', 'noor.fatima'], ['Imran Abbas', 'imran.abbas'],
];
const members = {};
for (let i = 0; i < PEOPLE.length; i++) {
  const [fullName, username] = PEOPLE[i];
  const reg = await call('/auth/register', { method: 'POST', body: {
    fullName, username: `${username}.${stamp}`, phone: `033${String(1000000 + i)}${stamp.slice(-2)}`,
    email: `${username}.${stamp}@halqa.pk`, cnic: `35202${stamp.slice(-5)}${String(100 + i).slice(-3)}`,
    password: 'halqa123',
  } });
  if (reg.data.accessToken) { members[username] = { token: reg.data.accessToken, id: reg.data.user.id, fullName }; console.log(`registered ${fullName}`); }
  else console.log(`register ${fullName}: ${reg.status} ${JSON.stringify(reg.data).slice(0, 90)}`);
}
const roster = Object.values(members);
if (roster.length < 6) throw new Error('too few registrations succeeded');

// ---- Circle 1: taha hosts, ACTIVE, bid war on the marketplace ----
const c1 = ok('create Model Town', await call('/committees', { token: taha, method: 'POST', body: {
  name: 'Model Town Family Committee', memberCap: Math.min(8, roster.length + 1), contributionPaisa: '1000000',
  cadencePreset: 'MID', periodDays: 30, minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY',
  goalType: 'CUSTOM', goalName: 'Family savings pot',
} }));
for (const m of roster.slice(0, 7)) ok(`${m.fullName} joins C1`, await call('/committees/join', { token: m.token, method: 'POST', body: { inviteCode: c1.inviteCode } }));
ok('taha consents C1', await call(`/risk/committee/${c1.id}/consent`, { token: taha, method: 'POST', body: { accepted: true } }));
for (const m of roster.slice(0, 7)) ok(`${m.fullName} consents C1`, await call(`/risk/committee/${c1.id}/consent`, { token: m.token, method: 'POST', body: { accepted: true } }));
ok('start C1', await call(`/committees/${c1.id}/start`, { token: taha, method: 'POST', body: {} }));

const d1 = (await call(`/committees/${c1.id}`, { token: taha })).data;
const round1 = (d1.rounds || []).find(r => r.status === 'COLLECTING');
const posOf = uid => (d1.members || []).find(m => m.userId === uid)?.turnPosition ?? 0;
const tokenOf = uid => roster.find(m => m.id === uid)?.token;
// Everyone except taha pays round 1 (mixed rails) — taha's stays PENDING so
// his Pay button is live in the app.
const rails = ['RAAST', 'JAZZCASH', 'EASYPAISA'];
let ri = 0;
for (const p of round1.payments) {
  const tok = tokenOf(p.payerId); if (!tok) { console.log(`skip payment (taha or unknown)`); continue; }
  ok(`pay r1 pos${posOf(p.payerId)}`, await call('/payments/initiate', { token: tok, method: 'POST', body: { roundId: round1.id, rail: rails[ri++ % 3], idempotencyKey: `tw-${round1.id}-${p.payerId}` } }));
}
// Seller = highest-position demo member; bidders = three other paid demo
// members with future turns. Escalating premiums = a real bid war on Market.
const demoMembers = (d1.members || []).filter(m => tokenOf(m.userId)).sort((a, b) => b.turnPosition - a.turnPosition);
const seller = demoMembers[0];
const listing = ok('list turn (premium Rs 1,500)', await call('/exchange', { token: tokenOf(seller.userId), method: 'POST', body: { committeeId: c1.id, premiumPaisa: '150000' } }));
if (listing.id) {
  const bidders = demoMembers.slice(1).filter(m => m.turnPosition > 1).slice(0, 3);
  const prices = ['200000', '260000', '320000'];
  for (let i = 0; i < bidders.length; i++) ok(`bid Rs ${Number(prices[i]) / 100} by ${roster.find(x => x.id === bidders[i].userId)?.fullName}`, await call(`/exchange/${listing.id}/bid`, { token: tokenOf(bidders[i].userId), method: 'POST', body: { premiumPaisa: prices[i] } }), [400, 409]);
}

// ---- Circle 2: taha is a MEMBER with a PAID receipt ----
const host2 = roster[0];
const c2 = ok('create DHA Business', await call('/committees', { token: host2.token, method: 'POST', body: {
  name: 'DHA Business Circle', memberCap: 6, contributionPaisa: '2500000', cadencePreset: 'MID', periodDays: 30,
  minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY', goalType: 'BUSINESS', goalName: 'Stock expansion',
} }));
ok('taha joins C2', await call('/committees/join', { token: taha, method: 'POST', body: { inviteCode: c2.inviteCode } }));
for (const m of roster.slice(1, 5)) ok(`${m.fullName} joins C2`, await call('/committees/join', { token: m.token, method: 'POST', body: { inviteCode: c2.inviteCode } }));
ok('host consents C2', await call(`/risk/committee/${c2.id}/consent`, { token: host2.token, method: 'POST', body: { accepted: true } }));
ok('taha consents C2', await call(`/risk/committee/${c2.id}/consent`, { token: taha, method: 'POST', body: { accepted: true } }));
for (const m of roster.slice(1, 5)) ok(`${m.fullName} consents C2`, await call(`/risk/committee/${c2.id}/consent`, { token: m.token, method: 'POST', body: { accepted: true } }));
ok('start C2', await call(`/committees/${c2.id}/start`, { token: host2.token, method: 'POST', body: {} }));
const d2 = (await call(`/committees/${c2.id}`, { token: taha })).data;
const r2 = (d2.rounds || []).find(r => r.status === 'COLLECTING');
ok('taha pays C2 (receipt visible)', await call('/payments/initiate', { token: taha, method: 'POST', body: { roundId: r2.id, rail: 'RAAST', idempotencyKey: `tw2-${r2.id}-taha` } }));
for (const m of roster.slice(1, 3)) { const pm = r2.payments.find(p => p.payerId === m.id); if (pm) ok(`${m.fullName} pays C2`, await call('/payments/initiate', { token: m.token, method: 'POST', body: { roundId: r2.id, rail: 'JAZZCASH', idempotencyKey: `tw2-${r2.id}-${m.id}` } })); }

// ---- Circle 3: taha hosts, left FORMING ----
const c3 = ok('create Wedding Fund', await call('/committees', { token: taha, method: 'POST', body: {
  name: 'Wedding Fund — Cousins', memberCap: 10, contributionPaisa: '500000', cadencePreset: 'SHORT', periodDays: 15,
  minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY', goalType: 'WEDDING', goalName: 'Areeba ki shaadi', allowHalqaFill: true,
} }));
for (const m of roster.slice(5, 8)) ok(`${m.fullName} joins C3`, await call('/committees/join', { token: m.token, method: 'POST', body: { inviteCode: c3.inviteCode } }));

console.log('\nTaha demo world complete.');
