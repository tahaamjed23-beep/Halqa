// Which changes leave a record, and which do not.
//
// Work register AF3, per model: "every change recorded in the audit log with
// the actor".
//
// Whether a write left an audit entry depended on whoever wrote that line
// remembering to. Auditing every write at the database layer was tried and
// taken out again: it doubled the round trips of every request and took this
// suite from 34 seconds to 536 (the reason is recorded in src/db.ts). So the
// entries stay in the handlers, inside the transaction, where they carry the
// detail only the handler knows — and this test is what stops the gaps coming
// back, by naming every write path that has no entry near it.
//
// It is deliberately a LIST rather than a rule. A write that genuinely needs no
// entry is named here with the reason, so an exemption is a decision somebody
// made and can be argued with, not a silence.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..', 'src');

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (p.endsWith('.ts')) out.push(p);
  }
  return out;
}

const FILES = walk(SRC).map(p => ({
  rel: p.slice(SRC.length + 1).replace(/\\/g, '/'),
  text: readFileSync(p, 'utf8').replace(/\r\n/g, '\n'),
}));

/** Models whose changes must be accountable: money, access, eligibility. */
const MUST_BE_RECORDED = [
  'User', 'Committee', 'CommitteeMember', 'Round', 'Payment', 'RecoveryCase',
  'ExchangeListing', 'ExchangeBid', 'AgreementSignature', 'ExitRequest', 'RestitutionDebt',
];

const WRITES = ['create', 'createMany', 'update', 'updateMany', 'upsert', 'delete', 'deleteMany'];

/**
 * Write sites that carry no audit entry, deliberately, with the reason.
 *
 * Each key is `file:model.operation`. Anything not listed here and not audited
 * is a finding.
 */
const EXEMPT: Record<string, string> = {
  // Empty, and that is the finding. The first pass of this test listed twelve
  // exemptions written from a reading of the files. Every one turned out to be
  // unnecessary: those writes DO carry a record, just not always through the
  // audit() helper — some post to the ledger, some write a CreditEvent, and
  // registration writes a SecurityEvent, which is the right log for an account
  // being created. The exemptions were excusing work that had already been
  // done.
  //
  // So nothing is exempt. A write on a model that matters leaves a record, and
  // if one ever does not, this test names it rather than an exemption hiding
  // it. Anything added here needs a reason a reader can argue with.
};

type Site = { file: string; model: string; op: string; audited: boolean };

function writeSites(): Site[] {
  const sites: Site[] = [];
  for (const f of FILES) {
    if (f.rel === 'db.ts' || f.rel.startsWith('lib/audit')) continue;
    for (const model of MUST_BE_RECORDED) {
      const accessor = model[0]!.toLowerCase() + model.slice(1);
      for (const op of WRITES) {
        const pattern = new RegExp(`(?:prisma|tx)\\.${accessor}\\.${op}\\(`, 'g');
        for (const m of f.text.matchAll(pattern)) {
          // "Near" is the enclosing handler: from the previous route or
          // function boundary to the next one. An entry anywhere in the same
          // operation counts, because that is where it belongs.
          const before = f.text.slice(0, m.index);
          const startOfBlock = Math.max(
            before.lastIndexOf('\nrouter.'),
            before.lastIndexOf('\nexport async function'),
            before.lastIndexOf('\nexport function'),
            before.lastIndexOf('\nasync function'),
            0,
          );
          const after = f.text.slice(m.index);
          const nextBlock = after.search(/\n(?:router\.|export (?:async )?function|async function)/);
          const block = f.text.slice(startOfBlock, m.index + (nextBlock > 0 ? nextBlock : after.length));
          // A record counts whichever shape it takes:
          //   audit(...)          the helper
          //   auditLog.create     an entry written directly
          //   ledger(...)         a money posting, which is its own record
          //   logSecurity(...)    the security log, which is the right place
          //                       for a sign in or an account being created
          //   creditEvent.create  the score history, which is what a member
          //   rewardEvent.create  disputing their score actually reads
          // Looking only for audit() and ledger() reported three false gaps.
          //   ledgerEntry.create  a posting written directly, as gap-fund does
          const RECORDS =
            /\baudit\(|auditLog\.create|\bledger\(|ledgerEntry\.create|logSecurity\(|creditEvent\.create|rewardEvent\.create/;
          sites.push({ file: f.rel, model, op, audited: RECORDS.test(block) });
        }
      }
    }
  }
  return sites;
}

describe('every change that matters leaves a record', () => {
  const sites = writeSites();

  it('there are write sites to check at all', () => {
    expect(sites.length).toBeGreaterThan(20);
  });

  it('no write is both unaudited and unexplained', () => {
    const findings = sites
      .filter(s => !s.audited)
      .filter(s => !EXEMPT[`${s.file}:${s.model}.${s.op}`])
      .map(s => `${s.file}: ${s.model}.${s.op}`);
    // Each entry in this list is a change nobody can be named for. Either the
    // handler writes an entry, or the exemption above says why it does not
    // need one. A third option, saying nothing, is what this test removes.
    expect([...new Set(findings)], 'write paths with no audit entry and no stated reason').toEqual([]);
  });

  it('every exemption names a write that actually exists', () => {
    // An exemption for a write that has been deleted or renamed is a licence
    // nobody is using, and it hides the next real gap.
    const actual = new Set(sites.map(s => `${s.file}:${s.model}.${s.op}`));
    const stale = Object.keys(EXEMPT).filter(k => !actual.has(k));
    expect(stale, 'exemptions for writes that no longer exist').toEqual([]);
  });

  it('the money models are audited wherever a route writes them', () => {
    const routeSites = sites.filter(s => s.file.startsWith('routes/'));
    const unaudited = routeSites
      .filter(s => !s.audited && ['Payment', 'Round', 'LedgerEntry', 'RecoveryCase'].includes(s.model))
      .filter(s => !EXEMPT[`${s.file}:${s.model}.${s.op}`])
      .map(s => `${s.file}: ${s.model}.${s.op}`);
    expect([...new Set(unaudited)]).toEqual([]);
  });
});

describe('the actor is available wherever an entry is written', () => {
  it('lib/actor.ts carries the request, so a handler deep in a call can still name who', () => {
    const actor = FILES.find(f => f.rel === 'lib/actor.ts');
    expect(actor, 'lib/actor.ts must exist').toBeTruthy();
    expect(actor!.text).toMatch(/AsyncLocalStorage/);
    expect(actor!.text).toMatch(/export function currentActor/);
  });

  it('it is mounted before the routers, so every request carries one', () => {
    const app = FILES.find(f => f.rel === 'app.ts')!;
    const mount = app.text.indexOf('app.use(actorContext)');
    const firstRouter = app.text.indexOf("app.use('/api/");
    expect(mount, 'actorContext must be mounted').toBeGreaterThan(0);
    expect(mount).toBeLessThan(firstRouter);
  });
});
