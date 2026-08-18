// Read-only production schema check. Confirms every column the current code
// selects actually exists in prod, so a deploy cannot 500 on a missing column.
// Reads nothing but information_schema. Never writes.
//
//   node src/scripts/check-prod-schema.mjs .env.prod.tmp
import { readFileSync } from 'node:fs';

const envFile = process.argv[2] || '.env.prod.tmp';
let url = null;
for (const ln of readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  if (ln.startsWith('DATABASE_URL=')) {
    url = ln.slice('DATABASE_URL='.length).trim().replace(/^["']|["']$/g, '');
  }
}
if (!url) { console.error('no DATABASE_URL in ' + envFile); process.exit(1); }
// the pg driver rejects pgbouncer as an unknown connection option
url = url.replace(/([?&])pgbouncer=true&?/, '$1').replace(/[?&]$/, '');

// what the additive migrations are supposed to have added, by table
const EXPECTED = {
  User: ['locality', 'jobTitle', 'homeLat', 'homeLng', 'longestStreak', 'rewardPoints',
         'scoreGainedThisCycle', 'avatarUrl', 'displayName', 'accentColor', 'themePref',
         'langPref', 'textScale', 'highContrast', 'notifyPrefsJson'],
  Committee: ['goldGoalGrams', 'exposureScore', 'exposureBand', 'exposureAt'],
};

const { default: pg } = await import('pg');
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();
console.log('connected to', new URL(url).host);

let missingTotal = 0;
for (const [table, cols] of Object.entries(EXPECTED)) {
  const { rows } = await client.query(
    'select column_name from information_schema.columns where table_name = $1', [table]);
  const have = new Set(rows.map(r => r.column_name));
  const missing = cols.filter(c => !have.has(c));
  missingTotal += missing.length;
  console.log(`${table}: ${cols.length - missing.length}/${cols.length} present` +
              (missing.length ? `  MISSING -> ${missing.join(', ')}` : '  all present'));
}
const { rows: tabs } = await client.query(
  `select table_name from information_schema.tables where table_schema='public' order by 1`);
console.log('tables in prod:', tabs.length);
await client.end();
console.log(missingTotal ? `RESULT: NOT SAFE TO DEPLOY, ${missingTotal} column(s) missing`
                         : 'RESULT: schema matches, safe to deploy');
process.exit(missingTotal ? 2 : 0);
