# -*- coding: utf-8 -*-
"""Phases for Claude and milestones for everyone else.

Claude's open items are packed into phases of at most 100 items and at most 100 effort points, each sized for one
Claude Pro usage window. Effort points: a small item counts 1, a medium item 3, a large item 8. Items that need a partner
first carry a gate: H2 (the bank's interface documents and test environment) or H3 (the agreements and test environments
of the PSP, TASDEEQ and the message providers). Phases run in blocks; a block never mixes gates, so a gated phase can be
started the day its gate opens. Items held by people are assigned to milestones H1 to H6."""
from collections import Counter, OrderedDict

CAP_ITEMS = 100
CAP_POINTS = 100
POINTS = {1: 1, 2: 3, 4: 8}

GATE_SUB = {
    'T1': 'H2', 'T2': 'H2', 'T3': 'H2', 'T4': 'H2', 'T5': 'H2', 'T6': 'H2', 'U': 'H2', 'V1': 'H2', 'V2': 'H3',
    'X2': 'H2', 'X3': 'H3', 'AG1': 'H2', 'AG2': 'H3', 'AG3': 'H2', 'AG4': 'H3', 'AG5': 'H3', 'AG6': 'H3',
    'AC15': 'H2', 'AC18': 'H2', 'AC20': 'H2', 'AC21': 'H2', 'AC22': 'H3',
}
GATE_API = (('/api/bank', 'H2'), ('/api/mandates', 'H2'), ('/api/payouts', 'H2'), ('/api/reconciliation', 'H2'),
            ('/api/points/purchase', 'H2'), ('/api/security/block', 'H2'), ('/api/psp', 'H3'), ('/api/bureau', 'H3'),
            ('/api/marketplace/webhooks', 'H3'))
GATE_MODEL = {'BankAccount': 'H2', 'BankOnboarding': 'H2', 'Mandate': 'H2', 'MandateEvent': 'H2',
              'BankInstruction': 'H2', 'BankWebhookEvent': 'H2', 'ReconciliationBreak': 'H2', 'PointsPurchase': 'H2',
              'PspCharge': 'H3', 'BureauSubmission': 'H3', 'BureauDispute': 'H3'}

# The order of work inside a block, by sub-section where one is named and otherwise by section. Corrections come
# first: the follow up of 29 September to 5 October, the removals, the retired terms on screen, the fee rules and the
# endpoints and models to remove. The application, its controls and the documents follow. Inside a gated block the
# connection itself comes first, then the records, the endpoints and the screens that use it.
TRACK = ['AA2', 'AQ1', 'AQ2', 'AQ6', 'E', 'C3', 'Y1', 'F', 'AE1', 'AF1', 'AF2', 'AE2', 'AA', 'C', 'Y', 'G', 'X', 'D', 'AE', 'AF', 'AC',
         'AD', 'AQ', 'M', 'AJ', 'L', 'AB', 'K', 'S', 'Z', 'AO', 'AL', 'H', 'J', 'AH', 'AI', 'N', 'AG', 'T', 'U', 'V', 'W', 'I',
         'A', 'B', 'O', 'AK', 'P', 'AM', 'R', 'Q', 'AN', 'AP']
TRACK_GATED = ['AG', 'T', 'AF', 'AE', 'U', 'X', 'V', 'AC', 'AH', 'AI']
PRI_ORDER = {'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3}

# Blocks in order: (label, gate, priorities)
BLOCKS = [
    ('Corrections, the application and the documents for the bank', None, ('P0', 'P1')),
    ('Work on the bank\'s interfaces', 'H2', ('P0', 'P1')),
    ('Work on the partners\' interfaces', 'H3', ('P0', 'P1')),
    ('Public launch', None, ('P2',)),
    ('Public launch on the bank\'s interfaces', 'H2', ('P2',)),
    ('Public launch on the partners\' interfaces', 'H3', ('P2',)),
    ('Scale', None, ('P3',)),
    ('Scale on the bank\'s interfaces', 'H2', ('P3',)),
    ('Scale on the partners\' interfaces', 'H3', ('P3',)),
]

SHORT = {'A': 'visual system', 'B': 'navigation', 'C': 'screens', 'D': 'missing screens', 'E': 'removals',
         'F': 'fee rules', 'G': 'collection', 'H': 'takaful or insurance', 'I': 'savings', 'J': 'credit data',
         'K': 'registrations', 'L': 'platform', 'M': 'security', 'N': 'testing', 'O': 'content', 'P': 'measurement',
         'Q': 'distribution', 'R': 'operations', 'S': 'partner bank', 'T': 'bank integration',
         'U': 'collection with the bank', 'V': 'points and marketplace', 'W': 'turn market', 'X': 'credit bands',
         'Y': 'product changes', 'Z': 'bank meeting and documents', 'AA': 'follow up', 'AB': 'regulatory compliance',
         'AC': 'screen states', 'AD': 'fields', 'AE': 'endpoints', 'AF': 'database', 'AG': 'partner connections',
         'AH': 'messages', 'AI': 'tests', 'AJ': 'security review', 'AK': 'accessibility', 'AL': 'governance',
         'AM': 'operations', 'AN': 'growth', 'AO': 'the two banks', 'AP': 'features measured',
         'AQ': 'eligibility, security and speed'}
BIG = {'AC', 'AD', 'AE', 'AF', 'AG', 'AH', 'AI', 'AL', 'AB', 'AM'}

CHECKS = OrderedDict([
    ('Build', 'the interface service tests and the web build pass, and every changed screen is reached in the preview'),
    ('Tests', 'the new tests run in the suite and pass'),
    ('Documents', 'each document is filed in HALQA CORPORATE in the house style'),
    ('Partners', 'each connection passes against the provider\'s test environment'),
    ('Controls', 'each control is shown working, with evidence kept for the bank\'s review'),
])
DOC_WHERE = ('document', 'documentation', 'drafts', 'Google Docs', 'presentation', 'content', 'website', 'design',
             'meeting', 'risk register', 'governance', 'reporting', 'finance', 'process', 'operations', 'review',
             'docs', 'compliance', 'decision', 'product', 'register', 'status', 'HANDOVER', '07 Internal', 'analytics',
             'marketing', 'distribution')
CTRL_WHERE = ('infrastructure', 'pipeline', 'security', 'monitoring')


def gate_of(item):
    sub = item['sub'] or item['sec']
    if sub in GATE_SUB:
        return GATE_SUB[sub]
    if item['sub'] == 'AE4':
        for prefix, g in GATE_API:
            if item['text'].split(':')[0].split(' ', 1)[-1].startswith(prefix):
                return g
    if item['sub'] == 'AF4':
        return GATE_MODEL.get(item['text'].split(':')[0])
    return None


def check_of(item):
    w = item['where']
    if item['sec'] == 'AI' or w.startswith('test'):
        return 'Tests'
    if w.startswith('integration'):
        return 'Partners'
    if w.startswith(CTRL_WHERE):
        return 'Controls'
    if w.startswith(DOC_WHERE):
        return 'Documents'
    return 'Build'


def milestone_of(item):
    o, p, t = item['owner'], item['pri'], item['text'].lower()
    if p == 'P3':
        return 'H6'
    if o in ('Counsel', 'Tax adviser'):
        return 'H1' if p in ('P0', 'P1') else 'H4'
    if o == 'Bank':
        return 'H2' if p in ('P0', 'P1') else 'H4'
    if o == 'Partner':
        return 'H3' if p in ('P0', 'P1') else 'H4'
    if o in ('Translator', 'Tester', 'Auditor'):
        return 'H4'
    if any(k in t for k in ('incorporat', 'national tax number', 'sales tax', 'trademark', 'director', 'shareholding',
                            'memorandum', 'counsel', 'bookkeeping', 'chart of accounts', 'confidentiality')):
        return 'H1'
    if item['sec'] in ('S', 'T', 'Z', 'AO') or any(k in t for k in ('bank', 'mashreq', 'raqami')):
        return 'H2' if p in ('P0', 'P1') else 'H5'
    if any(k in t for k in ('safepay', 'psp', 'tasdeeq', 'whatsapp', 'sms', 'merchant', 'takaful', 'insurance',
                            'translator', 'software house', 'supplier')):
        return 'H3' if p in ('P0', 'P1') else 'H5'
    if any(k in t for k in ('launch', 'campaign', 'store', 'press', 'social', 'advertis', 'marketing', 'host')):
        return 'H5'
    return {'P0': 'H1', 'P1': 'H4'}.get(p, 'H5')


MILESTONES = OrderedDict([
    ('H1', ('Company and counsel', 'The company incorporated, its board and shareholding settled, counsel engaged and '
                                   'the opinions and reviews that come before any agreement.')),
    ('H2', ('Bank agreement', 'Heads of terms and the services agreement signed, the bank\'s approvals obtained, and its '
                              'interface documents and test environment opened to Halqa.')),
    ('H3', ('Partners', 'The PSP, TASDEEQ, the WhatsApp and SMS providers and the takaful or insurance operator chosen '
                        'by the bank, each under agreement with a test environment.')),
    ('H4', ('Pilot readiness', 'Penetration test passed, translations done, policies approved, store accounts and '
                               'declarations in place, and the testers\' and auditors\' work complete.')),
    ('H5', ('Launch', 'The public launch with the bank: store listings, announcement, campaigns and the host '
                      'programme.')),
    ('H6', ('Scale', 'Work for later stages: members abroad, asset financing and growth beyond the first year.')),
])


SUBLABEL = {'AQ1': 'income without the wait', 'AQ2': 'seat eligibility', 'AQ3': 'security', 'AQ4': 'host commission',
            'AQ5': 'host eligibility', 'AQ6': 'ten minutes to an account', 'AE1': 'endpoints to remove', 'AE2': 'endpoints to rework', 'AE3': 'checks on kept endpoints',
            'AE4': 'new endpoints', 'AE5': 'shared interface work', 'AF1': 'models to remove',
            'AF2': 'models to review', 'AF3': 'checks on kept models', 'AF4': 'new models',
            'AF5': 'shared database work', 'AC1': 'states of existing screens', 'AC24': 'administration console',
            'AL8': 'drafts for counsel', 'AO3': 'answers for the bank', 'AA2': 'follow up', 'C3': 'retired terms',
            'Y1': 'fees', 'AD10': 'field rules in code', 'AI19': 'journey tests', 'AI20': 'performance tests',
            'AI21': 'security tests', 'AI22': 'test foundations'}


PROPER = {'NADRA', 'PSP', 'TASDEEQ', 'SMS', 'WhatsApp', 'Hyper', 'Urdu', 'Raast', 'Mashreq', 'Raqami', 'Halqa'}


def _lower(t):
    return ' '.join(w if (w in PROPER or w.isupper()) else w.lower() for w in t.split(' '))


def _label(it):
    code = it['sub'] or it['sec']
    if code in SUBLABEL:
        return SUBLABEL[code], ''
    if it['sec'] in BIG and it['subtitle']:
        return SHORT[it['sec']], _lower(it['subtitle'].split(': ')[-1])
    return SHORT[it['sec']], ''


def _join(parts):
    return parts[0] if len(parts) == 1 else ', '.join(parts[:-1]) + ' and ' + parts[-1]


def _title(items):
    count, first = Counter(), {}
    for k, it in enumerate(items):
        lab = _label(it)
        count[lab] += 1
        first.setdefault(lab, k)
    top = [lab for lab, n in count.most_common(3) if n >= 0.12 * len(items)] or [count.most_common(1)[0][0]]
    top.sort(key=lambda lab: first[lab])
    groups = OrderedDict()
    for g, d in top:
        groups.setdefault(g, [])
        if d:
            groups[g].append(d)
    parts = [g + (': ' + _join(ds) if ds else '') for g, ds in groups.items()]
    t = '; '.join(parts)
    return t[:1].upper() + t[1:]


def _pack(block, k, slack=4, full=False):
    """Greedy packing toward an even share of the block across k phases, never above the caps. With full, the caps
    alone apply, which gives the least number of phases."""
    tp = sum(POINTS[it['eff']] for it in block)
    ti = len(block)
    lim_p = CAP_POINTS if full else min(CAP_POINTS, -(-tp // k) + slack)
    lim_i = CAP_ITEMS if full else min(CAP_ITEMS, -(-ti // k) + slack)
    out, cur, pts = [], [], 0
    for it in block:
        p = POINTS[it['eff']]
        if cur and (len(cur) >= lim_i or pts + p > lim_p):
            out.append((cur, pts))
            cur, pts = [], 0
        cur.append(it)
        pts += p
    if cur:
        out.append((cur, pts))
    return out


def plan(items):
    """items: every item dict with keys n, sec, sub, subtitle, text, where, owner, pri, eff, status. Sets item['phase']
    and returns (phases, milestones)."""
    for it in items:
        it['gate'] = gate_of(it) if it['owner'] == 'Claude' else None
        it['phase'] = ''
        it['milestone'] = milestone_of(it) if it['owner'] != 'Claude' else ''
        if it['owner'] != 'Claude' and it['status'] != 'Done':
            it['phase'] = it['milestone']
    work = [it for it in items if it['owner'] == 'Claude' and it['status'] != 'Done']
    phases = []
    for label, gate, pris in BLOCKS:
        block = [it for it in work if it['gate'] == gate and it['pri'] in pris]
        if not block:
            continue
        track = TRACK_GATED + [c for c in TRACK if c not in TRACK_GATED] if gate else TRACK
        order = {c: i for i, c in enumerate(track)}
        key = lambda it: (PRI_ORDER[it['pri']], order.get(it['sub'], order.get(it['sec'], 99)), it['n'])
        block.sort(key=key)
        k = len(_pack(block, 1, full=True))
        packed = None
        for slack in range(0, 101):
            packed = _pack(block, k, slack=slack)
            if len(packed) <= k:
                break
        for cur, pts in packed:
            phases.append(dict(block=label, gate=gate, items=cur, points=pts))
    seen = Counter()
    for k, ph in enumerate(phases, 1):
        ph['n'] = k
        for it in ph['items']:
            it['phase'] = str(k)
        t = _title(ph['items'])
        seen[t] += 1
        ph['title'] = t if seen[t] == 1 else '%s, part %d' % (t, seen[t])
        ph['pris'] = Counter(it['pri'] for it in ph['items'])
        subs = Counter(it['sub'] or it['sec'] for it in ph['items'])
        ph['scope'] = ', '.join('%s (%d)' % (s, c) for s, c in subs.most_common())
        ph['checks'] = [c for c in CHECKS if any(check_of(it) == c for it in ph['items'])]
    for t, n in seen.items():
        if n > 1:
            first = next(ph for ph in phases if ph['title'] == t)
            first['title'] = '%s, part 1' % t
    ms = OrderedDict((m, []) for m in MILESTONES)
    for it in items:
        if it['owner'] != 'Claude':
            ms[it['milestone']].append(it)
    return phases, ms
