import mapkit as k

W = 2560
C = {'client': '#1E4E8C', 'api': '#2E3A44', 'data': '#1E6B48', 'money': '#9A7616',
     'async': '#8A3B5E', 'sec': '#9E3524', 'obs': '#1F6F6B', 'scale': '#6B3FA0',
     'ext': '#7A5C10', 'gap': '#B5651D'}
FAMS = [(C['client'], 'Client'), (C['api'], 'Service'), (C['data'], 'Persistence'),
        (C['money'], 'Money correctness'), (C['async'], 'Async and scheduling'),
        (C['sec'], 'Security and threat model'), (C['obs'], 'Observability'),
        (C['scale'], 'Scale and performance'), (C['ext'], 'Integrations'), (C['gap'], 'Open gaps')]

o = [k.head('Halqa technical architecture',
            'Request path, data model, money correctness, concurrency, threat model, and the engineering '
            'required to carry 100,000 members.', W, FAMS, rev='Rev 4', date='25 September 2026')]

# ---- key figures ----------------------------------------------------------
KF = [('20,362', 'lines of TypeScript', 'across two deployments'),
      ('39', 'Prisma models', '43 index and unique declarations'),
      ('17', 'route modules, 34 libraries', 'Express on serverless functions'),
      ('30s', 'function execution ceiling', 'Vercel, region sin1'),
      ('18', 'test files', 'Vitest, in the API service')]
KW = (W - 80 - 4 * 18) // 5
for i, (fig, cap, note) in enumerate(KF):
    o.append(k.keyfigure(40 + i * (KW + 18), 150, KW, 100, C['api'], fig, cap, note))

# ---- request path ---------------------------------------------------------
PY, PH = 276, 232
o.append('<rect x="40" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.4"/>'
         % (PY, W - 80, PH, k.PANEL, C['api']))
o.append(k.label(58, PY + 28, 'Request path for a settled payment', 15, C['api'], weight=600))
o.append(k.label(58, PY + 44, 'EVERY STATE CHANGE FOLLOWS THIS ORDER, AND EVERY STEP CAN REJECT',
                 10, k.INK3, mono=True))
STEPS = [
    ('Client', ['React 18, Vite', 'fetch with idempotency key']),
    ('Edge', ['Cloudflare', 'CSP, HSTS, rate limit']),
    ('Function', ['Express handler', 'cold start under 400ms']),
    ('Guards', ['zod schema, then', 'membership and ownership']),
    ('Transaction', ['Prisma interactive tx', 'serializable where money moves']),
    ('Ledger', ['double entry written', 'inside the same tx']),
    ('Audit', ['append only row', 'actor, action, before, after']),
]
SW = (W - 116 - 6 * 26) // 7
for i, (t, lines) in enumerate(STEPS):
    x = 58 + i * (SW + 26)
    o.append(k.box(x, PY + 66, SW, 80, t, lines, col=C['api'], title_size=13.5))
    if i < 6:
        o.append(k.arrow('M%d %d H %d' % (x + SW, PY + 106, x + SW + 20), col=k.INK2, width=1.5, marker='m2'))
o.append(k.label(58, PY + 174, 'Rejection points, in order: rate limit at the edge, schema validation, '
                               'authentication, membership guard, state guard, idempotency replay, '
                               'balance assertion inside the transaction.', 12, k.INK2))
o.append(k.label(58, PY + 196, 'Nothing is written outside a transaction. A settlement that cannot write '
                               'its ledger pair does not settle.', 12, k.INK2))
o.append(k.label(58, PY + 216, 'Read path is separate: cached reference data, paginated lists with a cursor, '
                               'no aggregate computed per request.', 12, k.INK2))

COLS = [40, 550, 1060, 1570, 2080]
CW, CX = 470, [x + 235 for x in COLS]
R1 = 572

ROW1 = [
    ('client', 'Client', 'what ships to the handset', [
        'React 18 with TypeScript, bundled by Vite 5',
        '31 route level screens, around 40 shared components',
        '28 React.lazy boundaries, one per route',
        'Suspense fallbacks render skeletons, not spinners',
        'Design tokens as CSS custom properties on :root',
        'Dark theme by token redefinition, not a second stylesheet',
        'State is server state: no global store, fetch plus local state',
        'Optimistic updates only where the server is authoritative',
        'Service worker caches the shell and the last schedule read',
        'Installable through a web app manifest',
        'Feature flags are build time constants, tree shaken when off',
        'Target: first contentful paint under 2.5s on 3G, mid range Android',
    ]),
    ('api', 'Service', 'what runs per request', [
        'Node 22, Express 4, TypeScript with strict mode',
        '17 route modules mounted under /api',
        '34 domain libraries, pure functions, no I O inside them',
        'Prisma 5 as the data access layer, no raw SQL in routes',
        'Deployed as Vercel serverless functions, region sin1',
        '30 second execution ceiling per invocation',
        'Every request body, query and param validated by a zod schema',
        'Guards run after validation: requireAuth, assertMember, assertHost',
        'Errors normalised to a single shape, no stack in the response',
        'Business rules live in libraries, routes only orchestrate',
        'Payment provider behind one interface, one branch per rail',
        'No shared mutable state between invocations',
    ]),
    ('data', 'Persistence', 'Postgres, and how it is used', [
        'Supabase Postgres 15, primary in Singapore',
        '39 models, generated types shared with the client',
        'Money stored as BigInt in the minor unit, never a float',
        'Connection pooling on 6543, direct on 5432 for DDL',
        'Prisma directUrl set so migrations bypass the pooler',
        'Migrations versioned and applied in order, never db push',
        'Every foreign key that drives a list carries an index',
        'Composite indexes on roundId plus status, committeeId plus status',
        'Soft delete on every financial record, hard delete never',
        'Row level policies on anything the client reads directly',
        'Point in time recovery plus an independent nightly logical dump',
        'Restore rehearsed quarterly against a scratch project',
    ]),
    ('money', 'Money correctness', 'the invariants that must never break', [
        'Double entry: every movement writes a debit and a credit',
        'Sum of debits equals sum of credits, asserted in test',
        'Amounts are BigInt paisa, so no rounding error accumulates',
        'Idempotency key required on every state changing endpoint',
        'Replay of a key returns the original result, never a second write',
        'Payout guarded by a conditional update on status, so it fires once',
        'Optimistic concurrency on committee state transitions',
        'Serializable isolation where two writers could race a balance',
        'pot = contribution x rounds asserted at creation and refused if false',
        'roster = collecting per period x periods asserted the same way',
        'Reconciliation job compares ledger to provider settlement daily',
        'A reconciliation break holds payouts on that circle until cleared',
    ]),
    ('async', 'Async and scheduling', 'work that does not belong in a request', [
        'Queue for payouts, notifications, sweeps and reconciliation',
        'At least once delivery, so every consumer is idempotent',
        'Exponential backoff with jitter, capped retry count',
        'Dead letter queue with an alert on first entry',
        'Delinquency sweep sharded by committee id modulo worker count',
        'Sharding is what keeps the sweep inside its window at scale',
        'Scheduled runs authenticated by a shared secret header',
        'Webhook receiver verifies provider signature before any write',
        'Webhook handler is idempotent on the provider reference',
        'Outbox pattern for messages that must follow a committed write',
        'No cron job performs an unbounded scan',
        'Every job emits a start, finish and duration metric',
    ]),
]
hs = []
for i, (fam, t, s, items) in enumerate(ROW1):
    body, h = k.cluster(COLS[i], R1, CW, C[fam], t, s, items)
    o.append(body); hs.append(h)

R2 = R1 + max(hs) + 66
ROW2 = [
    ('async', 'Collection and mandates', 'the auto debit path end to end', [
        'Tier 1 default: initiation by the partner, one approval in app',
        'Tier 2: auto debit from the member’s wallet at the partner',
        'Tier 3: the member sends over Raast to the collector',
        'Halqa’s fee taken separately, by Request to Pay',
        'Mandate consent captured in app, valid under PS&EFT s.35(1)',
        'Mandate held by the partner, Halqa stores its reference only',
        'Amount cap, schedule and permitted payees set at creation',
        'Cancellation available in app and effective immediately, s.35(2)',
        'Cancelling the mandate does not cancel the commitment to the circle',
        'Disclosures at contracting, supporting the partner under s.30(2)',
        '21 days notice of a material change, supporting s.31(1)',
        'Failed debit returns a coded reason, retried on a capped schedule',
        'Arrears recorded against the round, never as a profile balance',
    ]),
    ('sec', 'Threat model', 'what an attacker would try, and what stops it', [
        'Broken object level authorisation: guards on every route, tested per role',
        'Identifier enumeration: opaque ids, and membership checked before read',
        'Replay of a payment: idempotency key, unique constraint enforced',
        'Forged settlement callback: provider signature verified, timestamp window',
        'Race on a payout: conditional update plus serializable isolation',
        'Privilege escalation through host role: host actions scoped to own circles',
        'Session theft: short lived tokens, device bound, server side revocation',
        'Credential stuffing: rate limit per address and per account, lockout',
        'One time passcode interception: rate limited, short expiry, device bound',
        'Injection: parameterised through Prisma, no string built SQL',
        'Cross site scripting: React escaping plus a strict content policy',
        'Supply chain: pinned versions, lockfile, scan on every build',
    ]),
    ('sec', 'Controls in depth', 'the configuration required before launch', [
        'Strict transport security with preload and subdomain coverage',
        'Content security policy: default none, script self, no inline script',
        'Frame ancestors none, base uri none, form action self',
        'Permissions policy scoped, with camera and location enabled for capture',
        'Cross origin limited to the two application origins',
        'Secrets in a managed store, rotated, never in the repository',
        'Identity images encrypted at rest with access logged per read',
        'PII minimised: no contact list, no message access, no screen reading',
        'Audit log append only, written in the same transaction as the action',
        'Administrative access separated, named accounts, two factor enforced',
        'Dependency and secret scanning fail the build on high severity',
        'External penetration test before any real money moves',
    ]),
    ('obs', 'Observability', 'what is measured and who is told', [
        'Structured JSON logs with a request id propagated end to end',
        'Request id returned to the client and shown in support tickets',
        'Error monitoring on both deployments with source maps uploaded',
        'Release tagging so a regression maps to a deploy',
        'Latency measured at p50, p95 and p99 per route',
        'Payment funnel instrumented: initiated, pending, settled, failed',
        'Alert thresholds on error rate, p99 latency and settlement failure',
        'Alerts reach a person, not a dashboard nobody opens',
        'Queue depth and dead letter count alerted separately',
        'Database connection saturation and slow query log monitored',
        'Business dashboard: signups, active circles, collection rate, default rate',
        'Public status page fed from the same checks',
    ]),
    ('scale', 'Scale to 100,000 members', 'the work that load actually requires', [
        'Load test at 100,000 accounts with realistic circle distribution',
        'Per route latency budget set, then measured against it',
        'Every list query bounded with a cursor, no offset pagination',
        'N plus one eliminated in the committee detail read',
        'Reference data cached, invalidated on write',
        'Chat to move from a 6 second poll to a push transport',
        'That single change removes the largest read load at scale',
        'Connection limit set explicitly for a serverless pool',
        'Read replica for reporting and dashboard queries',
        'Chart bundle to be reduced from 358 kilobytes',
        'Image assets compressed and served in a modern format',
        'Sweep window measured against roster growth every release',
    ]),
    ('ext', 'Integrations', 'and the counterparty behind each', [
        'Instant rail: Raast, operated by the State Bank',
        'Wallets: JazzCash and Easypaisa',
        'Interbank switch: 1LINK',
        'Electronic money institution: NayaPay or SadaPay',
        'Payment aggregator, for the fee only: PayFast or Safepay',
        'Identity: NADRA Verisys, corporate agreement',
        'Credit bureau: TASDEEQ, alternate DataCheck',
        'Messaging: WhatsApp Business Platform, approved templates',
        'Trustee: Central Depository Company of Pakistan',
        'Asset manager candidate: Mahaana Wealth',
        'Takaful candidates: Pak-Qatar General Takaful, Salaam Takaful',
        'Hosting Vercel, database Supabase, edge Cloudflare',
        'Every integration behind an interface with a sandbox implementation',
    ]),
]

_all = ROW1 + ROW2
ROW1, ROW2 = _all[:5], _all[5:10]
ROW3 = _all[10:]
hs2 = []
for i, (fam, t, s, items) in enumerate(ROW2):
    body, h = k.cluster(COLS[i], R2, CW, C[fam], t, s, items)
    o.append(body); hs2.append(h)

if ROW3:
    R3 = R2 + max(hs2) + 64
    hs3 = []
    for i, (fam, t, s, items) in enumerate(ROW3):
        body, h = k.cluster(COLS[i], R3, CW, C[fam], t, s, items)
        o.append(body); hs3.append(h)
    BR3 = R3 - 34
    o.append(k.line('M%d %d H %d' % (CX[0], BR3, CX[min(len(ROW3) - 1, 4)])))
    for i in range(len(ROW3)):
        o.append(k.line('M%d %d V %d' % (CX[i], BR3, R3)))
    _tail = R3 + max(hs3)
else:
    _tail = R2 + max(hs2)

# ---- gaps table -----------------------------------------------------------
GY = _tail + 56
rows = [('Gap', 'Present state', 'Consequence at load', 'Fix'),
        ('Schema migrations', 'none, schema pushed directly', 'no rollback, drift between environments',
         'adopt a versioned migration history and a directUrl'),
        ('Error monitoring', 'not configured on either deployment', 'failures are invisible until a member reports one',
         'instrument both deployments, upload source maps'),
        ('Job queue', 'long work runs inside a request', '30 second ceiling truncates payouts and sweeps',
         'move to a queue with retry and a dead letter'),
        ('Chat transport', 'polls every 6 seconds', 'largest single read load at 100,000 members',
         'replace with a push transport'),
        ('List bounds', '50 queries fetch without a limit, 33 in routes', 'response size grows with the table',
         'cursor pagination on every list'),
        ('Index coverage', '43 declarations across 39 models', 'sequential scans on the hot paths',
         'index every foreign key that drives a list'),
        ('Cache', 'none', 'reference data refetched per request',
         'cache the scheme catalogue and fee book'),
        ('Loading states', 'present on 3 of 31 screens', 'the interface reads as unfinished',
         'skeleton on every fetching screen'),
        ('Permissions policy', 'camera and geolocation set to empty', 'identity capture and the home pin fail in production',
         'enable camera for the capture origin'),
        ('Rate limits', '1,500 per 15 minutes globally', 'sized for test runs, not for traffic',
         'per route, per member and per address'),
        ('Seed data', 'demonstration rows still in production', 'real members would see fabricated circles',
         'wipe before the first real member'),
        ('Localisation', '17 Urdu strings', 'unusable for most of the addressable base',
         'complete the catalogue, then verify right to left')]
RH = 30
o.append('<rect x="40" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.4"/>'
         % (GY, W - 80, 54 + RH * len(rows), k.PANEL, C['gap']))
o.append(k.label(58, GY + 28, 'Open gaps, with the consequence each one has under load', 15, C['gap'], weight=600))
o.append(k.label(58, GY + 44, 'PRESENT STATE VERIFIED IN SOURCE, 24 SEPTEMBER 2026', 10, k.INK3, mono=True))
colx = [58, 400, 900, 1560]
for r, row in enumerate(rows):
    yy = GY + 54 + RH * r + 20
    if r == 0:
        o.append('<line x1="58" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1"/>'
                 % (yy + 8, W - 58, yy + 8, k.RULE))
    for ci, cell in enumerate(row):
        col = k.INK3 if r == 0 else (k.INK if ci == 0 else k.INK2)
        o.append(k.label(colx[ci], yy, cell, 10.5 if r == 0 else 12, col, mono=(r == 0),
                         weight=600 if (r > 0 and ci == 0) else None))

BR = R1 - 34
o.append(k.line('M%d %d H %d' % (CX[0], BR, CX[4])))
for i in range(5):
    o.append(k.line('M%d %d V %d' % (CX[i], BR, R1)))
o.append(k.label(CX[0] + 18, BR - 12, 'The stack, layer by layer', 11, k.INK3, mono=True))

BR2 = R2 - 34
o.append(k.line('M%d %d H %d' % (CX[0], BR2, CX[4])))
for i in range(5):
    o.append(k.line('M%d %d V %d' % (CX[i], BR2, R2)))
o.append(k.label(CX[0] + 18, BR2 - 12, 'Attack surface, instrumentation, load and integrations', 11, k.INK3, mono=True))

H = GY + 54 + RH * len(rows) + 60
k.build('halqa-map-tech', W, H, '\n'.join(o), png_name='HALQA-MAP-TECHNICAL',
        aria='Halqa technical architecture. Key figures, the request path for a settled payment through seven '
             'stages, groups covering client, service, persistence, money correctness, async work, threat model, '
             'controls, observability, scale and integrations, then a table of open gaps with the consequence '
             'each has under load and the fix.')
