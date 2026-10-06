# -*- coding: utf-8 -*-
"""Pass 3: what every screen needs to be complete. One item for each state and each check of every screen: the 31
screens that exist, the screens listed as missing in section D, the screens the bank route adds, and the administrative
console. The screen itself is built under its own item elsewhere; these items make it complete."""
from common import I, sub, section

AMOUNTS = ('the instalment, the Rs 85 fee, the PSP service fee on a wallet or card, and the takaful or insurance fee '
           'by name')

# (name, where, kind, priority, options)
EXISTING = [
    ('Home', 'HomePage.tsx', 'dash', 'P1', dict(empty='a member with no circles: Start a committee and Join with a code',
                                                 skip=('pull', 'skeleton'))),
    ('Committees', 'CirclesPage.tsx', 'list', 'P1', dict(empty='no circles yet: Start a committee and Join with a code',
                                                         search=1, filt='status, cadence and role',
                                                         skip=('search', 'filters', 'empty'))),
    ('Committee, turns tab', 'CommitteePage.tsx', 'tab', 'P1', {}),
    ('Committee, payments tab', 'CommitteePage.tsx', 'tab', 'P1', dict(filt='paid, unpaid, late', skip=('filter',))),
    ('Committee, members tab', 'CommitteePage.tsx', 'tab', 'P1', {}),
    ('Committee, safety tab', 'ProtectionCenter.tsx', 'tab', 'P1', {}),
    ('Committee, messages tab', 'CommitteePage.tsx', 'list', 'P1', dict(empty='no messages yet, with a first message '
                                                                              'prompt')),
    ('Committee, rules tab', 'CommitteePage.tsx', 'info', 'P1', {}),
    ('Create a circle', 'CreateCirclePage.tsx', 'form', 'P1', {}),
    ('Pay', 'PayPage.tsx', 'money', 'P0', dict(amounts=AMOUNTS, skip=('review', 'amounts'))),
    ('Schedule', 'SchedulePage.tsx', 'list', 'P1', dict(empty='nothing due, with the next due date')),
    ('Activity', 'ActivityPage.tsx', 'list', 'P1', dict(empty='no activity yet', search=1,
                                                        filt='paid, received, due and date')),
    ('Statement', 'StatementPage.tsx', 'list', 'P1', dict(empty='no payments in the chosen dates', filt='date range')),
    ('Credit report', 'CreditPage.tsx', 'detail', 'P1', {}),
    ('Account', 'ProfilePage.tsx', 'info', 'P1', {}),
    ('Settings', 'SettingsPage.tsx', 'info', 'P1', {}),
    ('Appearance', 'AppearancePage.tsx', 'form', 'P2', {}),
    ('Devices', 'DevicesPage.tsx', 'list', 'P0', dict(empty='only this device')),
    ('Limits', 'LimitsPage.tsx', 'detail', 'P2', {}),
    ('Fees', 'FeesPage.tsx', 'info', 'P0', {}),
    ('Payment methods', 'CardsPage.tsx', 'list', 'P1', dict(empty='no payment method: Add a bank account or wallet')),
    ('Auto-pay', 'AutoPayPage.tsx', 'detail', 'P1', {}),
    ('Verification', 'VerifyPage.tsx', 'detail', 'P1', {}),
    ('Rewards', 'RewardsPage.tsx', 'detail', 'P2', {}),
    ('Invite', 'ReferPage.tsx', 'info', 'P2', dict(share=1)),
    ('Notifications', 'NoticesPage.tsx', 'list', 'P1', dict(empty='no notifications')),
    ('Support', 'SupportPage.tsx', 'list', 'P1', dict(empty='no requests: Contact support')),
    ('Search', 'SearchPage.tsx', 'list', 'P2', dict(empty='no results: what was searched and a suggestion', skip=('c1',))),
    ('Hyper', 'HyperPage.tsx', 'detail', 'P2', dict(experimental=1)),
    ('Turn market', 'MarketplacePage.tsx', 'list', 'P2', dict(empty='no turns listed in the member\'s circles')),
    ('About', 'AboutPage.tsx', 'info', 'P2', {}),
    ('Sign in', 'AuthPage.tsx', 'form', 'P0', {}),
]

MISSING = {
    'Onboarding': [
        ('Welcome', 'info', 'P0'), ('Phone number entry', 'form', 'P0'), ('Passcode entry', 'form', 'P0'),
        ('Set the application PIN', 'form', 'P0'), ('Confirm the application PIN', 'form', 'P0'),
        ('Forgotten PIN recovery', 'form', 'P0'), ('Biometric enrolment offer', 'form', 'P1'),
        ('Name and date of birth', 'form', 'P0'), ('Address and city', 'form', 'P1'),
        ('Occupation and employer', 'form', 'P1'), ('Income declaration', 'form', 'P1'),
        ('Income verification upload', 'capture', 'P1'), ('Income verification status', 'detail', 'P1')],
    'Identity': [
        ('CNIC front capture', 'capture', 'P0'), ('CNIC back capture', 'capture', 'P0'),
        ('CNIC manual entry', 'form', 'P0'), ('CNIC review before submission', 'form', 'P0'),
        ('Identity check in progress', 'detail', 'P0'), ('Identity check failed', 'result', 'P0'),
        ('Liveness instructions', 'info', 'P1'), ('Liveness capture', 'capture', 'P1'),
        ('Verification levels', 'info', 'P1'), ('Bureau instruction', 'form', 'P1'),
        ('Bureau instruction confirmation', 'result', 'P1'), ('Adverse action disclosure', 'info', 'P1')],
    'Accounts and payment routes': [
        ('Linked accounts', 'list', 'P1'), ('Add a bank account', 'form', 'P1'), ('Add a wallet account', 'form', 'P1'),
        ('Account title check in progress', 'detail', 'P1'), ('Account title mismatch', 'result', 'P1'),
        ('Set the default collection account', 'form', 'P1'), ('Remove a linked account', 'form', 'P1'),
        ('Mandate explainer', 'info', 'P0'), ('Authorise a mandate', 'money', 'P0'), ('Mandate authorised', 'result', 'P0'),
        ('Mandates', 'list', 'P1'), ('Change a mandate ceiling', 'money', 'P1'), ('Cancel a mandate', 'form', 'P0'),
        ('Mandate cancelled', 'result', 'P0'), ('Mandate collection failed', 'result', 'P0'),
        ('Advance notice of a different amount', 'info', 'P1')],
    'Circles': [
        ('Circle templates', 'list', 'P1'), ('Cadence chooser', 'form', 'P1'), ('Roster size chooser', 'form', 'P1'),
        ('Seat chooser', 'form', 'P0'), ('Join a circle', 'form', 'P0'), ('Split disclosure', 'info', 'P0'),
        ('Mutual guarantee signing', 'form', 'P0'), ('Undertaking signing', 'form', 'P0'),
        ('Signature capture', 'capture', 'P0'), ('Agreement archive', 'list', 'P1'),
        ('Confirming window countdown', 'detail', 'P1'), ('Withdraw before the start', 'form', 'P0'),
        ('Waiting list position', 'detail', 'P2')],
    'Host': [
        ('Host admission queue', 'list', 'P1'), ('Applicant detail', 'detail', 'P1'),
        ('Admission decision record', 'result', 'P1'), ('Roster fill request', 'form', 'P2'),
        ('Order of turns assignment, fixed or by ballot', 'form', 'P1'), ('Circle policy settings', 'form', 'P1'),
        ('Circle risk band explainer', 'info', 'P2'), ('Mandate coverage across the roster', 'detail', 'P1'),
        ('Reminder composer', 'form', 'P2'), ('Removal against the published test', 'form', 'P1'),
        ('Member vote on a removal', 'form', 'P1'), ('Host accountability record', 'list', 'P2'),
        ('Circle dissolution', 'form', 'P2')],
    'Money': [
        ('Payment method chooser', 'form', 'P0'), ('Payment confirmation with the full split', 'money', 'P0'),
        ('Payment pending', 'detail', 'P0'), ('Payment failed', 'result', 'P0'), ('Receipt', 'result', 'P0'),
        ('Dispute a payment', 'form', 'P0'), ('Dispute status', 'detail', 'P1'),
        ('Payout destination confirmation', 'money', 'P0'), ('Payout released', 'result', 'P0'),
        ('Payout receipt', 'result', 'P0'), ('Shortfall explanation on a payout', 'info', 'P1'),
        ('Set off explanation', 'info', 'P1'), ('Partial payment record', 'detail', 'P1'),
        ('Arrears position', 'detail', 'P1'), ('Fee schedule', 'info', 'P0'), ('Fee applied to this circle', 'info', 'P0'),
        ('Discount eligibility', 'info', 'P2'), ('Guarantee cheque registration', 'form', 'P2')],
    'Recovery': [
        ('Late notice, first step', 'info', 'P1'), ('Late notice, second step', 'info', 'P1'),
        ('Late notice, third step', 'info', 'P1'), ('Hardship declaration', 'form', 'P1'),
        ('Revised date agreement', 'form', 'P1'), ('Cure confirmation', 'result', 'P1'),
        ('Restitution arithmetic', 'info', 'P1'), ('Recovery case status', 'detail', 'P1'),
        ('Write off record', 'detail', 'P2')],
    'Leaving a circle': [
        ('Exit ladder chooser', 'form', 'P1'), ('Exit arithmetic', 'info', 'P1'), ('Exit cooling window', 'detail', 'P1'),
        ('Exit confirmation with PIN and face', 'money', 'P1'), ('Seat transfer to a replacement', 'form', 'P1'),
        ('Guarantee release', 'result', 'P1')],
    'Rewards': [
        ('Points ledger', 'list', 'P2'), ('Fee waivers', 'list', 'P2'), ('Redeem points against a fee', 'money', 'P2'),
        ('Referral invitations', 'list', 'P2')],
    'Takaful or insurance': [
        ('Takaful or insurance explainer', 'info', 'P1'), ('Takaful or insurance acceptance', 'form', 'P1'),
        ('Takaful or insurance certificate', 'detail', 'P1'), ('Claim lodged', 'form', 'P1'),
        ('Claim status', 'detail', 'P1')],
    'Savings at the bank': [
        ('Bank savings explainer', 'info', 'P2'), ('Bank savings subscription', 'form', 'P2'),
        ('Bank savings holding', 'detail', 'P2'), ('Bank savings redemption', 'form', 'P2')],
    'Support': [
        ('Help centre', 'list', 'P1'), ('Help article', 'info', 'P1'), ('Contact support', 'form', 'P1'),
        ('Complaint record', 'detail', 'P1'), ('Service status', 'info', 'P2')],
    'Settings': [
        ('Notification preferences', 'form', 'P1'), ('Language', 'form', 'P1'), ('Data export request', 'form', 'P1'),
        ('Account closure', 'form', 'P1')],
}

BANK = {
    'Bank account': [
        ('Open the bank account', 'info', 'P0'), ('Bank onboarding in progress', 'detail', 'P0'),
        ('Bank account opened', 'result', 'P0'), ('Bank account refused', 'result', 'P0'),
        ('Link an existing account at the bank', 'form', 'P1'), ('Committee account balance', 'detail', 'P1'),
        ('Account restricted notice', 'info', 'P1')],
    'Key facts and complaints': [
        ('Key fact statement', 'form', 'P0'), ('Complaint form', 'form', 'P1'), ('Complaints', 'list', 'P1'),
        ('Complaint detail', 'detail', 'P1')],
    'Device security': [
        ('Transaction PIN set up', 'form', 'P0'), ('Transaction PIN entry', 'form', 'P0'),
        ('New device registered', 'info', 'P0'), ('Cooling off after a device change', 'detail', 'P0')],
    'Points and marketplace': [
        ('Points balance and history', 'list', 'P2'), ('Buy points (Mashreq)', 'money', 'P2'),
        ('Points purchase receipt', 'result', 'P2'), ('Marketplace catalogue', 'list', 'P2'),
        ('Marketplace category', 'list', 'P2'), ('Marketplace product', 'detail', 'P2'), ('Cart', 'form', 'P2'),
        ('Checkout with points', 'money', 'P2'), ('Order placed', 'result', 'P2'), ('Order tracking', 'detail', 'P2'),
        ('Orders', 'list', 'P2'), ('Return request', 'form', 'P2')],
    'Turn market': [
        ('Turn listing detail', 'detail', 'P2'), ('Create a turn listing', 'form', 'P2'), ('Make an offer', 'money', 'P2'),
        ('Offers received', 'list', 'P2'), ('Host approval of a trade', 'form', 'P2'), ('Trade settled', 'result', 'P2'),
        ('Trade history', 'list', 'P2')],
    'Asset financing': [
        ('Asset catalogue', 'list', 'P3'), ('Financing application', 'form', 'P3'), ('Financing decision', 'result', 'P3'),
        ('Repayment schedule', 'detail', 'P3')],
    'Members abroad': [
        ('Joining from the UAE (Mashreq)', 'info', 'P3'), ('Opening the account from the UAE application', 'info', 'P3')],
    'Credit history': [
        ('Reported records', 'list', 'P1'), ('Dispute a reported record', 'form', 'P1')],
    'Hyper': [
        ('Hyper design chooser', 'form', 'P2'), ('Hyper daily payment', 'detail', 'P2'),
        ('Hyper collection day', 'detail', 'P2'), ('Hyper stopped', 'info', 'P2')],
}

ADMIN = [
    'Circles at risk', 'Reconciliation exceptions', 'Identity queue', 'Dispute queue', 'Mandate failures',
    'Complaints queue', 'Fraud queue', 'Collections queue', 'Marketplace orders', 'Points liability',
    'Reports to the bank', 'Partner connection status', 'Feature switches', 'Audit log viewer', 'Member lookup',
]


def states(n, where, kind, pri, o):
    out = []
    sk = set(o.get('skip', ()))

    def a(text, owner='Claude', p=None, st='Open', key=None):
        if key not in sk:
            out.append(I(text, where, owner, p or pri, 1, st))

    if kind == 'admin':
        a('%s: laid out for a desktop screen' % n)
        a('%s: loading state' % n)
        a('%s: error state with a retry' % n)
        a('%s: empty state' % n)
        a('%s: filters and sorting' % n)
        a('%s: pages loaded in turn, with a count' % n)
        a('%s: open only to named administrators, with every view and action logged' % n)
        a('%s: export of the current view' % n)
        a('%s: end to end test' % n)
        return out
    existing = where.endswith('.tsx')
    a('%s: rebuilt to the common rules of C1: one answer first, no box around a section, no card inside a card' % n, key='c1')
    if o.get('experimental'):
        a('%s: labelled Experimental at the top' % n)
    if kind in ('dash', 'list', 'detail', 'tab'):
        a('%s: loading skeleton in the final layout, never a full screen spinner' % n, key='skeleton')
        a('%s: error state with the reason in plain words and a retry' % n)
        a('%s: offline state showing the last data held and when it was fetched, with actions disabled' % n)
        a('%s: deep link restores the screen with its state' % n, st='Done' if existing else 'Open')
    if kind in ('dash', 'list'):
        a('%s: pull to refresh' % n, key='pull')
    if kind == 'list':
        a('%s: empty state: %s' % (n, o.get('empty', 'the reason and one action')), key='empty')
        a('%s: pages loaded as the member scrolls, with an end of list marker' % n)
        if o.get('search'):
            a('%s: search within the list' % n, key='search')
        if o.get('filt'):
            a('%s: filters: %s' % (n, o['filt']), key='filters')
    if kind == 'dash':
        a('%s: empty state: %s' % (n, o.get('empty', 'the reason and one action')))
    if kind in ('detail', 'tab'):
        a('%s: not found and no access states, each with a route back' % n)
        if o.get('filt'):
            a('%s: filter: %s' % (n, o['filt']), key='filter')
    if kind in ('form', 'money'):
        a('%s: each field checked as it is typed, with one specific message under the field (fields in section AD)' % n)
        a('%s: submitting state: the button busy and a second tap ignored' % n)
        a('%s: a refusal from the server shown with the reason and what to change' % n)
        a('%s: offline: submission held back with a message, and entered data kept' % n)
        a('%s: the keyboard never hides the focused field or the main button' % n)
        a('%s: leaving with unsaved changes asks for confirmation' % n)
        a('%s: success state stating what happened and what comes next' % n)
    if kind == 'money':
        a('%s: review step showing every amount before confirmation: %s' % (n, o.get('amounts', 'the amount and every '
                                                                                                 'charge')), key='review')
        a('%s: transaction PIN required before the action' % n, p='P0')
        a('%s: refused during the two hour cooling off after a device change, with the time remaining' % n, p='P0')
        a('%s: one request per confirmation, carried by an idempotency key' % n, p='P0')
        a('%s: receipt after completion, saved to Activity' % n)
        a('%s: amounts shown as Rs with thousands grouped and no stray decimals' % n, key='amounts')
    if kind == 'result':
        a('%s: every figure and reference shown matches the ledger' % n)
        a('%s: the next step offered' % n)
        a('%s: share as an image or a PDF with account numbers masked' % n)
    if kind == 'capture':
        a('%s: the reason for the camera stated before the system asks' % n)
        a('%s: camera refused: how to allow it in settings, and a typed route where one exists' % n)
        a('%s: guide frame and live hints while capturing' % n)
        a('%s: low light and glare detected, with advice' % n)
        a('%s: review and retake before submission' % n)
        a('%s: upload progress and a retry on failure' % n)
    if kind == 'info':
        a('%s: deep link opens it directly' % n, st='Done' if existing else 'Open')
        if o.get('share'):
            a('%s: share text in English and Urdu, with no emoji' % n)
    a('%s: checked in dark mode, with no hard coded white or black' % n)
    a('%s: Urdu text for every string, by a translator' % n, owner='Translator')
    a('%s: right to left layout checked with the Urdu text' % n)
    a('%s: usable at the largest system text size, with nothing cut off' % n)
    a('%s: usable at 320 pixels wide' % n)
    a('%s: every control named for screen readers, in a logical focus order' % n)
    a('%s: contrast of every text and control checked' % n)
    a('%s: screen view and main action recorded, with no personal data in the events' % n, p='P2')
    if kind in ('dash', 'list', 'detail', 'tab', 'form', 'money', 'capture'):
        a('%s: component test of every state' % n)
        a('%s: end to end test of its main path' % n)
    a('%s: visual regression snapshot at three widths' % n, p='P2')
    a('%s: copy checked against the content rules: plain words, at most one line under a title, no eyebrow labels' % n)
    return out


def build():
    subs = []
    items = []
    for n, where, kind, pri, o in EXISTING:
        items += states(n, where, kind, pri, o)
    retire = [
        I('Vault: no states are built; the screen is withdrawn and its route removed (D12)', 'VaultPage.tsx', 'Claude',
          'P0'),
        I('Where idle money sits (the scheme terminal of investment products): withdrawn with its route, since Halqa '
          'invests no member money', 'TerminalPage.tsx', 'Claude', 'P0'),
        I('Save for something: kept behind its flag; states built only when the bank\'s financing product is agreed (D13)',
          'AssetPage.tsx', 'Claude', 'P3'),
    ]
    subs.append(sub('AC1', 'Screens That Exist', items + retire, 'The 27 pages kept in the application today, the committee '
                                                                  'page counted by its tabs, each with every state it needs. '
                                                                  'Deep links already work on every one (item 51). The vault '
                                                                  'and the scheme terminal are withdrawn; Save for something '
                                                                  'is held.'))
    k = 2
    for group, rows in MISSING.items():
        its = []
        for n, kind, pri in rows:
            its += states(n, 'new page', kind, pri, {})
        subs.append(sub('AC%d' % k, 'Missing Screens: %s' % group, its))
        k += 1
    for group, rows in BANK.items():
        its = []
        for n, kind, pri in rows:
            o = dict(amounts=AMOUNTS) if kind == 'money' and n.startswith(('Payment', 'Pay')) else {}
            if n.startswith('Hyper'):
                o['experimental'] = 1
            its += states(n, 'new page', kind, pri, o)
        subs.append(sub('AC%d' % k, 'Bank Route Screens: %s' % group, its))
        k += 1
    its = []
    for n in ADMIN:
        its += states('Administration, %s' % n.lower(), 'admin', 'admin', 'P2', {})
    subs.append(sub('AC%d' % k, 'Administration Console', its, 'Pages for Halqa\'s own operations, used on a computer.'))
    return section('AC', 'Screen States and Checks', subs,
                   'Every screen, with one item for each state it must show and each check it must pass: loading, empty, '
                   'error, offline, dark mode, Urdu and right to left, large text, narrow handsets, screen readers, '
                   'contrast, events and tests. Building the screen itself is its own item in sections C, D and Y.',
                   loop=3)
