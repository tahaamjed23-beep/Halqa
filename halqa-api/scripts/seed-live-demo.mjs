// One-shot demo enrichment for the LIVE deployment, done entirely through the
// public API (no direct DB writes): two circles for the demo users and real
// marketplace activity, so the app looks alive when the chairman demos it.
//
//   node scripts/seed-live-demo.mjs https://halqa-api-delta.vercel.app/api
//
// Idempotent-ish: names carry a date stamp, and every step tolerates 409s from
// re-runs (already joined / already listed / cap reached).
const base = process.argv[2] || 'https://halqa-api-delta.vercel.app/api';
const stamp = new Date().toISOString().slice(0, 10);

const call = async (path, { token, method = 'GET', body } = {}) => {
  const r = await fetch(base + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({}));
  return { status: r.status, data };
};
const need = (label, r, ok = [200, 201]) => {
  if (!ok.includes(r.status) && r.status !== 409) throw new Error(`${label}: ${r.status} ${JSON.stringify(r.data).slice(0, 160)}`);
  console.log(`${label}: ${r.status}${r.status === 409 ? ' (already done — fine)' : ''}`);
  return r.data;
};

const login = async (identity) => (await call('/auth/login', { method: 'POST', body: { identity, password: 'halqa123' } })).data.accessToken;
const [sana, ayesha, bilal] = await Promise.all(['sana', 'ayesha', 'bilal'].map(login));
if (!sana || !ayesha || !bilal) throw new Error('demo logins failed — is the demo seed still present?');
console.log('logged in: sana, ayesha, bilal');

// ---- Circle A: an ACTIVE goal circle with marketplace activity ----
const a = need('create Hajj circle', await call('/committees', { token: sana, method: 'POST', body: {
  name: `Gulberg Hajj Circle ${stamp}`, memberCap: 5, contributionPaisa: '500000', cadencePreset: 'MID',
  periodDays: 30, minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY',
  goalType: 'HAJJ', goalName: `Hajj 2027 · Gulberg`,
} }));
if (a.inviteCode) {
  need('ayesha joins A', await call('/committees/join', { token: ayesha, method: 'POST', body: { inviteCode: a.inviteCode } }));
  need('bilal joins A', await call('/committees/join', { token: bilal, method: 'POST', body: { inviteCode: a.inviteCode } }));
  for (const [who, tok] of [['sana', sana], ['ayesha', ayesha], ['bilal', bilal]]) need(`${who} consents A`, await call(`/risk/committee/${a.id}/consent`, { token: tok, method: 'POST', body: { accepted: true } }));
  need('start A', await call(`/committees/${a.id}/start`, { token: sana, method: 'POST', body: {} }));

  const detail = (await call(`/committees/${a.id}`, { token: sana })).data;
  const round = (detail.rounds || []).find(r => r.status === 'COLLECTING');
  const tokens = { sana, ayesha, bilal };
  const nameOf = id => (detail.members || []).find(m => m.userId === id)?.user?.username;
  if (round) {
    // A later-turn member pays their installment (sandbox) then lists the turn
    // at a premium; another member bids — the marketplace shows real activity.
    const later = (detail.members || []).filter(m => m.turnPosition > 1 && tokens[nameOf(m.userId)]);
    const seller = later[later.length - 1]; const bidder = later.find(m => m.userId !== seller?.userId) || (detail.members || []).find(m => m.turnPosition === 1);
    if (seller) {
      const sTok = tokens[nameOf(seller.userId)];
      need('seller pays r1', await call('/payments/initiate', { token: sTok, method: 'POST', body: { roundId: round.id, rail: 'RAAST', idempotencyKey: `demo-${round.id}-${seller.userId}` } }));
      const listing = need('list turn at premium', await call('/exchange', { token: sTok, method: 'POST', body: { committeeId: a.id, premiumPaisa: '150000' } }));
      if (listing.id && bidder) {
        const bTok = tokens[nameOf(bidder.userId)];
        need('bidder pays r1', await call('/payments/initiate', { token: bTok, method: 'POST', body: { roundId: round.id, rail: 'JAZZCASH', idempotencyKey: `demo-${round.id}-${bidder.userId}` } }));
        need('bid placed', await call(`/exchange/${listing.id}/bid`, { token: bTok, method: 'POST', body: { premiumPaisa: '150000' } }));
      }
    }
  }
}

// ---- Circle B: a FORMING circle (shows fund-the-gap + invites) ----
const b = need('create Traders circle', await call('/committees', { token: sana, method: 'POST', body: {
  name: `Karachi Traders Weekly ${stamp}`, memberCap: 8, contributionPaisa: '200000', cadencePreset: 'SHORT',
  periodDays: 12, minMembersToStart: 3, reinvestRatio: 0, orderMode: 'CREDIT_WEIGHTED', joinPolicy: 'INVITE_ONLY',
  goalType: 'BUSINESS', goalName: 'Shop stock rotation',
} }));
if (b.inviteCode) {
  need('ayesha joins B', await call('/committees/join', { token: ayesha, method: 'POST', body: { inviteCode: b.inviteCode } }));
  need('bilal joins B', await call('/committees/join', { token: bilal, method: 'POST', body: { inviteCode: b.inviteCode } }));
}
console.log('\nDemo enrichment complete.');
