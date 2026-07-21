// Fill the LIVE app with OPEN, discoverable circles + real turn-marketplace
// activity, entirely through the public API (undertaking-aware).
//
//   node scripts/seed-open-circles.mjs https://halqa-api-delta.vercel.app/api
//
// Registers fresh Pakistani-named hosts (avoids the five-hosted cap on the demo
// trio), each signs the weekly undertaking, then opens credit-weighted circles
// listed in Discover with room to join. One extra circle is started and a turn
// listed + bid so the marketplace shows live trades. Idempotent-ish: names are
// date-stamped and every step tolerates 409s.
const base = process.argv[2] || 'https://halqa-api-delta.vercel.app/api';
const stamp = new Date().toISOString().slice(0, 10);
const uniq = Math.random().toString(36).slice(2, 6);

const call = async (path, { token, method = 'GET', body } = {}) => {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
};
const ok = (label, r, allow = [200, 201, 409]) => { if (!allow.includes(r.status)) throw new Error(`${label}: ${r.status} ${JSON.stringify(r.data).slice(0, 200)}`); console.log(`  ${label}: ${r.status}`); return r.data; };
const sign = async (token, fullName) => ok('sign undertaking', await call('/agreements/sign', { token, method: 'POST', body: { doc: 'PLATFORM_UNDERTAKING', accept: true, signedName: fullName } }));

// A fresh, KYC-1 (cnic set), undertaking-signed host with a linked account.
let cnicSeq = Date.now() % 1000000;
const makeUser = async (fullName, username) => {
  const phone = `03${Math.floor(10 + Math.random() * 89)}${String(Date.now()).slice(-7)}`;
  const cnic = String(3520200000000 + (cnicSeq++)).slice(0, 13);
  const reg = await call('/auth/register', { method: 'POST', body: { fullName, username, phone, email: `${username}@halqa.pk`, password: 'halqa123x', cnic } });
  const token = reg.data.accessToken || (await call('/auth/login', { method: 'POST', body: { identity: username, password: 'halqa123x' } })).data.accessToken;
  if (!token) throw new Error(`could not create/login ${username}: ${JSON.stringify(reg.data).slice(0, 160)}`);
  await sign(token, fullName);
  await call('/profile/payment-methods', { token, method: 'POST', body: { rail: 'RAAST', accountNo: phone, accountTitle: fullName, preferred: true } });
  console.log(`host ready: ${fullName} (@${username})`);
  return { token, fullName, username };
};

// Demo trio join circles to make them look alive (need fresh undertakings too).
const login = async (identity) => (await call('/auth/login', { method: 'POST', body: { identity, password: 'halqa123' } })).data.accessToken;
const trio = { sana: await login('sana'), ayesha: await login('ayesha'), bilal: await login('bilal') };
for (const [name, tok] of Object.entries(trio)) { if (tok) await sign(tok, { sana: 'Sana Butt', ayesha: 'Ayesha Noor', bilal: 'Bilal Raza' }[name]); }
const joiners = Object.values(trio).filter(Boolean);

const OPEN = [
  { name: 'Gulshan Homemakers', cap: 10, rs: 5000, days: 30, goalType: 'HOME', goalName: 'Home setup fund' },
  { name: 'Saddar Shopkeepers', cap: 8, rs: 10000, days: 15, goalType: 'BUSINESS', goalName: 'Stock rotation' },
  { name: 'Clifton Hajj Savers', cap: 12, rs: 15000, days: 30, goalType: 'HAJJ', goalName: 'Hajj 2027' },
  { name: 'DHA School Fees', cap: 6, rs: 8000, days: 30, goalType: 'EDUCATION', goalName: 'Term fees' },
  { name: 'Johar Wedding Circle', cap: 15, rs: 6000, days: 30, goalType: 'WEDDING', goalName: 'Shaadi bachat' },
  { name: 'Model Town Teachers', cap: 10, rs: 4000, days: 30, goalType: 'EDUCATION', goalName: 'Staff bachat' },
  { name: 'Anarkali Traders', cap: 8, rs: 20000, days: 15, goalType: 'BUSINESS', goalName: 'Seasonal stock' },
  { name: 'F-10 Umrah Circle', cap: 12, rs: 12000, days: 30, goalType: 'HAJJ', goalName: 'Umrah together' },
  { name: 'Bahria Home Builders', cap: 20, rs: 25000, days: 45, goalType: 'HOME', goalName: 'Construction fund' },
  { name: 'Hayatabad Doctors', cap: 6, rs: 15000, days: 30, goalType: 'CUSTOM', goalName: 'Clinic upgrade' },
  { name: 'Satellite Town Tailors', cap: 10, rs: 3000, days: 15, goalType: 'BUSINESS', goalName: 'Machine fund' },
  { name: 'Gulberg Jahez Circle', cap: 12, rs: 8000, days: 30, goalType: 'WEDDING', goalName: 'Beti ki shaadi' },
  { name: 'Cantt Daily Wagers', cap: 8, rs: 2000, days: 7, goalType: 'CUSTOM', goalName: 'Weekly bachat' },
  { name: 'North Nazimabad Aunties', cap: 14, rs: 5000, days: 30, goalType: 'HOME', goalName: 'Ghar ka saman' },
];

const hosts = [];
for (const [full, un] of [
  ['Rabia Khan', `rabia_${uniq}`], ['Imran Sheikh', `imran_${uniq}`], ['Fatima Malik', `fatima_${uniq}`],
  ['Usman Qureshi', `usman_${uniq}`], ['Khadija Iqbal', `khadija_${uniq}`], ['Salman Baig', `salman_${uniq}`],
]) hosts.push(await makeUser(full, un));

console.log('\n— Opening discoverable circles —');
for (let i = 0; i < OPEN.length; i++) {
  const c = OPEN[i]; const host = hosts[i % hosts.length];
  const created = ok('create open circle', await call('/committees', { token: host.token, method: 'POST', body: {
    name: `${c.name} ${stamp}`, memberCap: c.cap, contributionPaisa: String(c.rs * 100), cadencePreset: c.days <= 15 ? 'SHORT' : 'MID',
    periodDays: c.days, minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'OPEN_UNTIL_FULL',
    listedPublicly: true, goalType: c.goalType, goalName: c.goalName,
  } }));
  // Partly fill so it stays OPEN with room (leave several seats).
  if (created.inviteCode) for (const j of joiners.slice(0, 2)) await call('/committees/join', { token: j, method: 'POST', body: { inviteCode: created.inviteCode } });
}

console.log('\n— Marketplace: an active circle with a listed turn + bid —');
const mHost = hosts[0];
const m = ok('create market circle', await call('/committees', { token: mHost.token, method: 'POST', body: {
  name: `Tariq Road Traders ${stamp}-${uniq}`, memberCap: 4, contributionPaisa: '1000000', cadencePreset: 'SHORT',
  periodDays: 15, minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY', listedPublicly: false,
} }));
if (m.inviteCode && joiners.length >= 2) {
  await call('/committees/join', { token: joiners[0], method: 'POST', body: { inviteCode: m.inviteCode } });
  await call('/committees/join', { token: joiners[1], method: 'POST', body: { inviteCode: m.inviteCode } });
  ok('start market circle', await call(`/committees/${m.id}/start`, { token: mHost.token, method: 'POST', body: {} }));
  const detail = (await call(`/committees/${m.id}`, { token: mHost.token })).data;
  const round = (detail.rounds || []).find(r => r.status === 'COLLECTING');
  const tokById = { [detail.host?.id]: mHost.token };
  joiners.forEach((t, i) => { const mem = (detail.members || [])[i + 1]; if (mem) tokById[mem.userId] = t; });
  const later = (detail.members || []).filter(mm => mm.turnPosition > 1 && tokById[mm.userId]);
  const seller = later[later.length - 1];
  if (round && seller) {
    const sTok = tokById[seller.userId];
    ok('seller pays r1', await call('/payments/initiate', { token: sTok, method: 'POST', body: { roundId: round.id, rail: 'RAAST', idempotencyKey: `open-${round.id}-${seller.userId}` } }));
    const listing = ok('list a turn', await call('/exchange', { token: sTok, method: 'POST', body: { committeeId: m.id, premiumPaisa: '120000' } }));
    const bidder = later.find(mm => mm.userId !== seller.userId) || (detail.members || []).find(mm => mm.turnPosition === 1 && tokById[mm.userId]);
    if (listing.id && bidder) {
      const bTok = tokById[bidder.userId];
      await call('/payments/initiate', { token: bTok, method: 'POST', body: { roundId: round.id, rail: 'JAZZCASH', idempotencyKey: `open-${round.id}-${bidder.userId}` } });
      ok('place a bid', await call(`/exchange/${listing.id}/bid`, { token: bTok, method: 'POST', body: { premiumPaisa: '180000' } }));
    }
  }
}

console.log('\nOpen-circle + marketplace enrichment complete.');
