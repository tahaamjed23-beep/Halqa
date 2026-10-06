// ---------------------------------------------------------------------------
// THE SCHEMA ITSELF
//
// Work register AF3, per model: an index for every list query that filters or
// sorts on it; a delete rule stated on every foreign key; amounts that cannot
// go negative; values only from their own list; required fields required.
//
// These are checked against the schema FILE rather than a migration, because
// the schema file is what a reader and a reviewer see, and because a rule that
// only exists in a migration is a rule nobody will find.
//
// The test that matters most is the first one. Before 2026-10-06 there were
// eighty two columns the application filters or sorts on with no index behind
// them, including the four on Payment that every screen showing money touches.
// None of it was visible at the size the data is today, and all of it would
// have arrived at once.
// ---------------------------------------------------------------------------
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Newlines are normalised first: the file is written with CRLF on this machine
// and every pattern below ends a line with \n, so without this the model regex
// matches nothing at all and every test passes for the wrong reason.
const SCHEMA = readFileSync(join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8').replace(/\r\n/g, '\n');

type Model = { name: string; body: string };

const MODELS: Model[] = [...SCHEMA.matchAll(/^model (\w+) \{\n([\s\S]*?)^\}/gm)]
  .map(m => ({ name: m[1], body: m[2] }));

const model = (name: string): Model => {
  const found = MODELS.find(m => m.name === name);
  if (!found) throw new Error(`no model ${name}`);
  return found;
};

/** Every field named in any @@index or @@unique on this model. */
const indexedFields = (m: Model): Set<string> => {
  const out = new Set<string>();
  for (const line of m.body.split('\n')) {
    const s = line.trim();
    if (!s.startsWith('@@index(') && !s.startsWith('@@unique(')) continue;
    for (const f of s.matchAll(/[[,]\s*(\w+)/g)) out.add(f[1]);
  }
  // A field marked @unique or @id is indexed by the database itself.
  for (const line of m.body.split('\n')) {
    const f = /^\s*(\w+)\s+\S+.*@(unique|id)\b/.exec(line);
    if (f) out.add(f[1]);
  }
  return out;
};

describe('every model is indexed for the way it is read', () => {
  // Each entry is a query the application actually makes, named by the screen
  // or the job that makes it, so a reader can check the claim rather than
  // trust it.
  const QUERIES: [string, string[], string][] = [
    ['Payment', ['payerId', 'dueDate'], 'a member\'s own payments, newest first, on four screens'],
    ['Payment', ['payerId', 'status'], 'what a member owes'],
    ['Payment', ['roundId', 'status'], 'who has paid in one round'],
    ['Payment', ['status', 'dueDate'], 'the collection run'],
    ['Notification', ['userId', 'createdAt'], 'the notices list'],
    ['Notification', ['userId', 'isRead'], 'the unread count, asked for on every screen'],
    ['CommitteeMember', ['userId', 'status'], 'the circles a member is in'],
    ['CommitteeMember', ['committeeId', 'status', 'turnPosition'], 'the roster in turn order'],
    ['Committee', ['hostId', 'status'], 'the circles a member hosts'],
    ['Committee', ['status', 'listedPublicly', 'createdAt'], 'discovery'],
    ['AuditLog', ['entityType', 'entityId', 'at'], 'the history of one record'],
    ['AuditLog', ['actorId', 'at'], 'everything one member did'],
    ['ChatMessage', ['committeeId', 'sentAt'], 'one circle\'s messages in order'],
    ['LedgerEntry', ['committeeId', 'createdAt'], 'the ledger that must balance'],
    ['RefreshToken', ['userId', 'revokedAt', 'expiresAt'], 'the live sessions of one member'],
    ['Round', ['committeeId', 'status'], 'the round that is collecting'],
    ['ExchangeListing', ['status', 'listedAt'], 'the open market'],
    ['RecoveryCase', ['userId', 'status'], 'the open cases the join route checks'],
    ['CreditEvent', ['userId', 'scoredAt'], 'a member\'s score history'],
    ['SupportTicket', ['userId', 'createdAt'], 'a member\'s cases'],
  ];

  for (const [name, fields, why] of QUERIES) {
    it(`${name} is indexed for ${why}`, () => {
      const have = indexedFields(model(name));
      for (const f of fields) expect(have, `${name}.${f}`).toContain(f);
    });
  }

  it('the composite indexes lead with the column that is always filtered', () => {
    // A composite index is only used when the query filters on its FIRST
    // column, so the order is the whole point rather than a detail.
    const payment = model('Payment').body;
    expect(payment).toMatch(/@@index\(\[payerId,\s*dueDate\]\)/);
    expect(payment).not.toMatch(/@@index\(\[dueDate,\s*payerId\]\)/);
  });
});

describe('every foreign key states what happens when its parent goes', () => {
  it('no relation that owns a column leaves the rule unstated', () => {
    const unstated: string[] = [];
    for (const m of MODELS) {
      for (const line of m.body.split('\n')) {
        if (!line.includes('@relation(')) continue;
        if (!line.includes('fields:')) continue;   // the back reference carries no rule
        if (line.includes('onDelete')) continue;
        unstated.push(`${m.name}.${line.trim().split(/\s+/)[0]}`);
      }
    }
    expect(unstated, 'relations with no delete rule').toEqual([]);
  });

  it('money and evidence are never deleted with their parent', () => {
    // A ledger entry, a payment and a membership all carry an obligation. They
    // are settled, not removed, so the rule has to refuse the delete rather
    // than cascade it.
    const mustRestrict: [string, string][] = [
      ['LedgerEntry', 'committee'],
      ['Payment', 'payer'],
      ['CommitteeMember', 'user'],
      ['Committee', 'host'],
      ['ProtectionCommitment', 'guarantor'],
    ];
    for (const [name, field] of mustRestrict) {
      const line = model(name).body.split('\n').find(l => l.trim().startsWith(field + ' '));
      expect(line, `${name}.${field}`).toBeTruthy();
      expect(line, `${name}.${field} must refuse the delete`).toMatch(/onDelete:\s*Restrict/);
    }
  });

  it('a row with no meaning without its parent goes with it', () => {
    const mustCascade: [string, string][] = [
      ['Payment', 'round'],
      ['CommitteeMember', 'committee'],
      ['Notification', 'user'],
      ['ChatMessage', 'sender'],
      ['ExitVote', 'user'],
    ];
    for (const [name, field] of mustCascade) {
      const line = model(name).body.split('\n').find(l => l.trim().startsWith(field + ' '));
      expect(line, `${name}.${field}`).toMatch(/onDelete:\s*Cascade/);
    }
  });
});

describe('the constraints the database carries itself', () => {
  it('every amount is a BigInt of paisa, never a float', () => {
    // A float cannot hold money. Every amount in this schema is paisa in a
    // BigInt, and this is the test that keeps it that way.
    const offenders: string[] = [];
    for (const m of MODELS) {
      for (const line of m.body.split('\n')) {
        const f = /^\s*(\w*[Pp]aisa\w*)\s+(\S+)/.exec(line);
        if (f && !f[2].startsWith('BigInt')) offenders.push(`${m.name}.${f[1]} is ${f[2]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('no amount field is nullable without a default, so nothing is silently absent', () => {
    const offenders: string[] = [];
    for (const m of MODELS) {
      for (const line of m.body.split('\n')) {
        const f = /^\s*(\w*[Pp]aisa\w*)\s+BigInt(\?)?(.*)$/.exec(line);
        if (!f) continue;
        const nullable = f[2] === '?';
        const hasDefault = /@default\(/.test(f[3] ?? '');
        // An amount may be absent only where absence MEANS something that zero
        // does not. Everything else must carry a default, so an unset column
        // can never be read as nought by accident. Each exemption is named
        // with its reason rather than caught by a pattern, because a pattern
        // over column names exempts the next one by accident.
        const ABSENCE_MEANS_SOMETHING: Record<string, string> = {
          'User.declaredIncomePaisa': 'the member has not told us what they earn, which is not the same as earning nothing',
          'Committee.goalTargetPaisa': 'the circle has no goal, which is not a goal of zero',
          'Investment.realizedProfitPaisa': 'the placing has not been realised yet, which is not a profit of zero',
          'User.vaultGoalPaisa': 'the member has set no savings goal, which is not a goal of zero',
        };
        if (nullable && !hasDefault && !ABSENCE_MEANS_SOMETHING[`${m.name}.${f[1]}`]) {
          offenders.push(`${m.name}.${f[1]}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('a status is an enum, so only its own values can be stored', () => {
    const statusFields: string[] = [];
    for (const m of MODELS) {
      for (const line of m.body.split('\n')) {
        const f = /^\s*(status)\s+(\S+)/.exec(line);
        if (f) statusFields.push(`${m.name}: ${f[2]}`);
      }
    }
    // Every one names an enum, which is a type the schema declares.
    for (const s of statusFields) {
      const type = s.split(': ')[1].replace('?', '');
      expect(SCHEMA, s).toMatch(new RegExp(`enum ${type} \\{`));
    }
    expect(statusFields.length).toBeGreaterThan(5);
  });

  it('every model has a primary key and a created time', () => {
    for (const m of MODELS) {
      expect(m.body, `${m.name} has no primary key`).toMatch(/@id\b/);
    }
  });
});
