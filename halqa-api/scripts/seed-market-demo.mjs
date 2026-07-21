// Marketplace + discovery demo for the Taha world, via the public API only.
//   node scripts/seed-market-demo.mjs https://halqa-api-delta.vercel.app/api
// Creates: (a) OPEN discoverable circles hosted by OTHER members so Taha sees
// them under "Open now"; (b) a WAIT-NEXT-CYCLE circle (started, listed); (c) a
// circle Taha is IN with a turn listed at a premium and a 3-way bid war so the
// Market tab shows real listings.
const base = process.argv[2] || 'https://halqa-api-delta.vercel.app/api';
const stamp = Date.now().toString().slice(-6);
const call = async (path, { token, method = 'GET', body } = {}) => {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  return { status: r.status, data: await r.json().catch(() => ({})) };
};
const ok = (label, r, tolerate = [409]) => { if (![200, 201].includes(r.status) && !tolerate.includes(r.status)) throw new Error(`${label}: ${r.status} ${JSON.stringify(r.data).slice(0, 150)}`); console.log(`${label}: ${r.status}`); return r.data; };

const taha = (await call('/auth/login', { method: 'POST', body: { identity: '03001234567', password: 'halqa123' } })).data.accessToken;
if (!taha) throw new Error('taha login failed');

// Fresh members (CNIC → kycLevel 1, so they can host).
const NAMES = [['Sadia Rehman', 'sadia.r'], ['Bilal Ahmed', 'bilal.a'], ['Nida Aslam', 'nida.a'], ['Faisal Iqbal', 'faisal.i'], ['Rabia Khan', 'rabia.k'], ['Owais Malik', 'owais.m']];
const M = [];
for (let i = 0; i < NAMES.length; i++) {
  const [fullName, u] = NAMES[i];
  const reg = await call('/auth/register', { method: 'POST', body: { fullName, username: `${u}.${stamp}`, phone: `035${String(3000000 + i)}${stamp.slice(-2)}`, email: `${u}.${stamp}@halqa.pk`, cnic: `61101${stamp.slice(-5)}${String(300 + i).slice(-3)}`, password: 'halqa123' } });
  if (reg.data.accessToken) { M.push({ token: reg.data.accessToken, id: reg.data.user.id, fullName }); console.log(`registered ${fullName}`); }
}
if (M.length < 5) throw new Error('registrations incomplete');

// (a) OPEN discoverable circle — hosted by Sadia, listed, forming, room to spare.
const open1 = ok('OPEN Clifton Ladies Circle', await call('/committees', { token: M[0].token, method: 'POST', body: {
  name: 'Clifton Ladies Circle', memberCap: 8, contributionPaisa: '1500000', cadencePreset: 'MID', periodDays: 30,
  minMembersToStart: 4, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'OPEN_UNTIL_FULL', listedPublicly: true,
  goalType: 'CUSTOM', goalName: 'Neighbourhood savings',
} }));
for (const m of M.slice(1, 4)) ok(`${m.fullName} joins open1`, await call('/committees/join', { token: m.token, method: 'POST', body: { inviteCode: open1.inviteCode } }));

// (a2) A second OPEN circle, random-ballot (no Secure badge) for contrast.
const open2 = ok('OPEN Gulshan Traders Daily', await call('/committees', { token: M[1].token, method: 'POST', body: {
  name: 'Gulshan Traders Daily', memberCap: 10, contributionPaisa: '300000', cadencePreset: 'SHORT', periodDays: 12,
  minMembersToStart: 4, reinvestRatio: 0, orderMode: 'RANDOM_BALLOT', joinPolicy: 'OPEN_UNTIL_FULL', listedPublicly: true,
  goalType: 'BUSINESS', goalName: 'Bazaar stock',
} }));
for (const m of [M[2], M[4]]) ok(`${m.fullName} joins open2`, await call('/committees/join', { token: m.token, method: 'POST', body: { inviteCode: open2.inviteCode } }));

// (b) WAIT-NEXT-CYCLE circle — hosted by Nida, listed, started (ACTIVE).
const wnc = ok('WAIT DHA Professionals', await call('/committees', { token: M[2].token, method: 'POST', body: {
  name: 'DHA Professionals Circle', memberCap: 4, contributionPaisa: '5000000', cadencePreset: 'MID', periodDays: 30,
  minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'OPEN_UNTIL_FULL', listedPublicly: true,
  goalType: 'HOME', goalName: 'Property down-payment',
} }));
for (const m of [M[3], M[4], M[5]]) ok(`${m.fullName} joins wnc`, await call('/committees/join', { token: m.token, method: 'POST', body: { inviteCode: wnc.inviteCode } }));
for (const m of [M[2], M[3], M[4], M[5]]) ok(`${m.fullName} consents wnc`, await call(`/risk/committee/${wnc.id}/consent`, { token: m.token, method: 'POST', body: { accepted: true } }));
ok('start wnc (→ WAIT_NEXT_CYCLE)', await call(`/committees/${wnc.id}/start`, { token: M[2].token, method: 'POST', body: {} }));

// (c) Market bid war — a circle TAHA is in, started; a member lists a turn.
const mk = ok('create Market Circle', await call('/committees', { token: M[0].token, method: 'POST', body: {
  name: 'Saddar Market Circle', memberCap: 6, contributionPaisa: '1000000', cadencePreset: 'MID', periodDays: 30,
  minMembersToStart: 4, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY', listedPublicly: false,
} }));
ok('taha joins market', await call('/committees/join', { token: taha, method: 'POST', body: { inviteCode: mk.inviteCode } }));
for (const m of M.slice(1, 5)) ok(`${m.fullName} joins market`, await call('/committees/join', { token: m.token, method: 'POST', body: { inviteCode: mk.inviteCode } }));
ok('taha consents market', await call(`/risk/committee/${mk.id}/consent`, { token: taha, method: 'POST', body: { accepted: true } }));
for (const m of [M[0], ...M.slice(1, 5)]) ok(`consent market`, await call(`/risk/committee/${mk.id}/consent`, { token: m.token, method: 'POST', body: { accepted: true } }));
ok('start market', await call(`/committees/${mk.id}/start`, { token: M[0].token, method: 'POST', body: {} }));

const md = (await call(`/committees/${mk.id}`, { token: taha })).data;
const round1 = (md.rounds || []).find(r => r.status === 'COLLECTING');
const tokById = new Map([[taha, taha], ...M.map(m => [m.id, m.token])].map(([, t], i) => [i, t]));
const tokenOf = uid => (uid === md.members.find(x => x.user.username === 'taha')?.userId ? taha : M.find(m => m.id === uid)?.token);
// Everyone pays round 1 so anyone can list/bid.
const rails = ['RAAST', 'JAZZCASH', 'EASYPAISA'];
let i = 0;
for (const p of round1.payments) { const t = tokenOf(p.payerId); if (t) ok(`pay r1`, await call('/payments/initiate', { token: t, method: 'POST', body: { roundId: round1.id, rail: rails[i++ % 3], idempotencyKey: `mk-${round1.id}-${p.payerId}` } })); }
// Seller = a later-turn demo member; three others bid escalating premiums.
const laterDemo = (md.members || []).filter(m => m.turnPosition > 1 && M.some(x => x.id === m.userId)).sort((a, b) => b.turnPosition - a.turnPosition);
const seller = laterDemo[0];
const listing = ok('list turn (premium Rs 1,500)', await call('/exchange', { token: tokenOf(seller.userId), method: 'POST', body: { committeeId: mk.id, premiumPaisa: '150000' } }));
if (listing.id) {
  const bidders = laterDemo.slice(1).filter(m => m.turnPosition > 1).slice(0, 3);
  const prices = ['200000', '270000', '350000'];
  for (let b = 0; b < bidders.length; b++) ok(`bid Rs ${Number(prices[b]) / 100}`, await call(`/exchange/${listing.id}/bid`, { token: tokenOf(bidders[b].userId), method: 'POST', body: { premiumPaisa: prices[b] } }), [400, 409]);
}
console.log('\nMarket + discovery demo complete.');
