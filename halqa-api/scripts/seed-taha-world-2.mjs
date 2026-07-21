// Continuation of seed-taha-world: circles 2 and 3. Fresh registrants now get
// kycLevel 1 (CNIC on file) from the deployed register fix, so one of them can
// host. Run: node scripts/seed-taha-world-2.mjs https://halqa-api-delta.vercel.app/api
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

const PEOPLE = [['Bushra Iqbal', 'bushra.iqbal'], ['Danish Ansari', 'danish.ansari'], ['Hira Shafqat', 'hira.shafqat'], ['Kamran Bashir', 'kamran.bashir']];
const roster = [];
for (let i = 0; i < PEOPLE.length; i++) {
  const [fullName, username] = PEOPLE[i];
  const reg = await call('/auth/register', { method: 'POST', body: {
    fullName, username: `${username}.${stamp}`, phone: `034${String(2000000 + i)}${stamp.slice(-2)}`,
    email: `${username}.${stamp}@halqa.pk`, cnic: `42101${stamp.slice(-5)}${String(200 + i).slice(-3)}`, password: 'halqa123',
  } });
  if (reg.data.accessToken) { roster.push({ token: reg.data.accessToken, id: reg.data.user.id, fullName, kyc: reg.data.user.kycLevel }); console.log(`registered ${fullName} (kycLevel ${reg.data.user.kycLevel})`); }
  else console.log(`register ${fullName}: ${reg.status}`);
}
if (roster.length < 4) throw new Error('registrations incomplete');

// ---- Circle 2: Bushra hosts, taha is a MEMBER with a PAID receipt ----
const host2 = roster[0];
const c2 = ok('create DHA Business', await call('/committees', { token: host2.token, method: 'POST', body: {
  name: 'DHA Business Circle', memberCap: 5, contributionPaisa: '2500000', cadencePreset: 'MID', periodDays: 30,
  minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY', goalType: 'BUSINESS', goalName: 'Stock expansion',
} }));
ok('taha joins C2', await call('/committees/join', { token: taha, method: 'POST', body: { inviteCode: c2.inviteCode } }));
for (const m of roster.slice(1)) ok(`${m.fullName} joins C2`, await call('/committees/join', { token: m.token, method: 'POST', body: { inviteCode: c2.inviteCode } }));
ok('host consents', await call(`/risk/committee/${c2.id}/consent`, { token: host2.token, method: 'POST', body: { accepted: true } }));
ok('taha consents', await call(`/risk/committee/${c2.id}/consent`, { token: taha, method: 'POST', body: { accepted: true } }));
for (const m of roster.slice(1)) ok(`${m.fullName} consents`, await call(`/risk/committee/${c2.id}/consent`, { token: m.token, method: 'POST', body: { accepted: true } }));
ok('start C2', await call(`/committees/${c2.id}/start`, { token: host2.token, method: 'POST', body: {} }));
const d2 = (await call(`/committees/${c2.id}`, { token: taha })).data;
const r2 = (d2.rounds || []).find(r => r.status === 'COLLECTING');
ok('taha pays C2 (receipt state)', await call('/payments/initiate', { token: taha, method: 'POST', body: { roundId: r2.id, rail: 'RAAST', idempotencyKey: `tw2-${r2.id}-taha` } }));
for (const m of roster.slice(1, 3)) ok(`${m.fullName} pays C2`, await call('/payments/initiate', { token: m.token, method: 'POST', body: { roundId: r2.id, rail: 'JAZZCASH', idempotencyKey: `tw2-${r2.id}-${m.id}` } }));

// ---- Circle 3: taha hosts, left FORMING with the Halqa-fill opt-in visible ----
const c3 = ok('create Wedding Fund', await call('/committees', { token: taha, method: 'POST', body: {
  name: 'Wedding Fund — Cousins', memberCap: 10, contributionPaisa: '500000', cadencePreset: 'SHORT', periodDays: 15,
  minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY', goalType: 'WEDDING', goalName: 'Areeba ki shaadi', allowHalqaFill: true,
} }));
for (const m of roster.slice(1)) ok(`${m.fullName} joins C3`, await call('/committees/join', { token: m.token, method: 'POST', body: { inviteCode: c3.inviteCode } }));
console.log('\nCircles 2 and 3 complete.');
