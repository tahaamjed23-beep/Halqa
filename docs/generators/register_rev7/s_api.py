# -*- coding: utf-8 -*-
"""Pass 5a: what every endpoint of the interface service needs. Facts per endpoint (sign in, schema check, audit log,
unbounded lists, idempotency) were read from the code on 5 October 2026 into endpoint_audit.json."""
import io, json, os
from common import I, sub, section

HERE = os.path.dirname(os.path.abspath(__file__))

RETIRE = {
    ('vault', None): 'the vault is withdrawn and savings move to the bank (D12)',
    ('schemes', None): 'Halqa invests no member money, so the catalogue of twenty investment products goes',
    ('committees', '/:id/invest'): 'Halqa invests no member money',
    ('committees', '/:id/liquidate'): 'Halqa invests no member money',
    ('committees', '/:id/investments'): 'Halqa invests no member money',
    ('committees', '/:id/default-cover/:paymentId'): 'there is no Halqa cover; takaful or insurance only (29 September)',
    ('committees', '/:id/deposits'): 'no deposits are held from members',
    ('committees', '/:id/deposits/:depositId/confirm'): 'no deposits are held from members',
    ('partner', '/committees/:id/guarantee-fund'): 'there is no guarantee fund; takaful or insurance only',
    ('risk', '/portfolio/optimize'): 'there is no portfolio to optimise',
    ('risk', '/committee/:id/profit-plan'): 'no profit is planned from member money',
    ('risk', '/catalog'): 'the investment catalogue goes with the schemes',
    ('auth', '/change-password'): 'sign in is by PIN; there is no password',
}
PUBLIC = {('auth', '/register'), ('auth', '/phone-otp'), ('auth', '/phone-otp/verify'), ('auth', '/login'),
          ('auth', '/refresh'), ('committees', '/preview/:inviteCode')}
REWORK = {
    ('committees', '/:id/payout'): 'rework as a payout instruction to the bank, never a payment by Halqa',
    ('partner', '/kyc'): 'rework as the bank\'s onboarding result received by signed webhook',
    ('rewards', '/record'): 'remove: rewards are issued only by the server from events, never recorded by the client',
    ('profile', '/passport'): 'decision needed: the shareable credit passport and its public check, now that reporting '
                              'runs through TASDEEQ or the bank',
    ('exchange', '/'): 'rework the listing in points (D9)',
    ('exchange', '/:id/bid'): 'rework the bid as an offer in points (D9)',
    ('exchange', '/:id/bids/:bidId/accept'): 'rework acceptance as a points transfer with host approval (D9)',
    ('protection', '/delinquency/run'): 'restrict to the scheduler and named administrators',
    ('profile', '/leads/summary'): 'review: what it returns and who may see it',
}

NEW = [
    ('bank', 'POST', '/bank/onboarding/start', 'start account opening at the bank and return the bank\'s link'),
    ('bank', 'POST', '/bank/webhooks', 'receive signed events from the bank: onboarding, account status, mandate, debit, '
                                       'credit, statement ready'),
    ('bank', 'GET', '/bank/accounts', 'list the member\'s accounts at the partner bank'),
    ('bank', 'POST', '/bank/accounts/link', 'link an existing account at the partner bank'),
    ('bank', 'POST', '/bank/accounts/:id/title-check', 'check the account title before a payout'),
    ('bank', 'GET', '/bank/accounts/:id/balance', 'show the committee account balance'),
    ('mandates', 'POST', '/mandates', 'create a mandate with the bank, ceiling one instalment'),
    ('mandates', 'GET', '/mandates', 'list the member\'s mandates'),
    ('mandates', 'GET', '/mandates/:id', 'show a mandate and its events'),
    ('mandates', 'PATCH', '/mandates/:id', 'change a mandate ceiling within the rule'),
    ('mandates', 'POST', '/mandates/:id/cancel', 'cancel a mandate at the bank and in Halqa together'),
    ('collections', 'POST', '/collections/run', 'run the day\'s collections, sharded and resumable, for the scheduler only'),
    ('collections', 'GET', '/collections/calendar', 'show every planned attempt for the member'),
    ('payouts', 'POST', '/payouts/:roundId/instruct', 'instruct the bank to pay the collector on the payout date'),
    ('payouts', 'GET', '/payouts/:id', 'show a payout and its status at the bank'),
    ('reconciliation', 'POST', '/reconciliation/statements', 'ingest the bank\'s daily statement'),
    ('reconciliation', 'GET', '/reconciliation/breaks', 'list breaks for administrators'),
    ('reconciliation', 'POST', '/reconciliation/breaks/:id/resolve', 'resolve a break with a reason'),
    ('fees', 'GET', '/fees/schedule', 'return the fee schedule: Rs 85, the PSP service fee rule, Hyper Rs 15'),
    ('fees', 'GET', '/fees/quote', 'quote the full cost of a payment by method'),
    ('psp', 'POST', '/psp/cards/session', 'open the PSP\'s card saving page'),
    ('psp', 'POST', '/psp/wallets/link', 'link a wallet through the PSP'),
    ('psp', 'POST', '/psp/webhooks', 'receive signed PSP events: charge, refund, dispute, settlement'),
    ('psp', 'DELETE', '/psp/tokens/:id', 'remove a saved card or wallet at the PSP'),
    ('points', 'GET', '/points', 'return the points balance'),
    ('points', 'GET', '/points/history', 'list points entries with reasons'),
    ('points', 'POST', '/points/purchase', 'buy points with money (Mashreq only), within the agreed limits'),
    ('points', 'POST', '/points/redeem-fee', 'use points against a fee'),
    ('marketplace', 'GET', '/marketplace/catalogue', 'list products by category'),
    ('marketplace', 'GET', '/marketplace/products/:id', 'show a product'),
    ('marketplace', 'POST', '/marketplace/orders', 'place an order paid in points'),
    ('marketplace', 'GET', '/marketplace/orders', 'list the member\'s orders'),
    ('marketplace', 'GET', '/marketplace/orders/:id', 'show an order and its delivery status'),
    ('marketplace', 'POST', '/marketplace/orders/:id/return', 'request a return'),
    ('marketplace', 'POST', '/marketplace/webhooks', 'receive signed merchant events: shipped, delivered, refunded'),
    ('turns', 'GET', '/turns/listings', 'list turns for sale in the member\'s circles'),
    ('turns', 'POST', '/turns/listings', 'list a turn with an asking price in points'),
    ('turns', 'POST', '/turns/listings/:id/offers', 'make an offer'),
    ('turns', 'POST', '/turns/offers/:id/accept', 'accept an offer, pending host approval'),
    ('turns', 'POST', '/turns/trades/:id/approve', 'host approval of a trade'),
    ('turns', 'POST', '/turns/trades/:id/cancel', 'cancel a trade before settlement'),
    ('bureau', 'POST', '/bureau/consent', 'record the member\'s consent to reporting'),
    ('bureau', 'POST', '/bureau/instruction', 'record the member\'s instruction for a report on joining'),
    ('bureau', 'GET', '/bureau/records', 'list what was reported for the member'),
    ('bureau', 'POST', '/bureau/disputes', 'dispute a reported record'),
    ('bureau', 'POST', '/bureau/submissions/run', 'prepare and send the monthly submission, for the scheduler only'),
    ('complaints', 'POST', '/complaints', 'open a complaint with a number'),
    ('complaints', 'GET', '/complaints', 'list the member\'s complaints'),
    ('complaints', 'GET', '/complaints/:id', 'show a complaint and its timeline'),
    ('complaints', 'POST', '/complaints/:id/escalate', 'hand a complaint to the bank\'s complaint unit'),
    ('disputes', 'POST', '/disputes', 'open a dispute on a payment'),
    ('disputes', 'GET', '/disputes/:id', 'show a dispute and its status'),
    ('kfs', 'GET', '/kfs/:circleId', 'return the key fact statement for a circle'),
    ('kfs', 'POST', '/kfs/:circleId/accept', 'record acceptance of the key fact statement'),
    ('consents', 'GET', '/consents', 'list the member\'s consents'),
    ('consents', 'POST', '/consents/:purpose/withdraw', 'withdraw a consent where the law allows'),
    ('devices', 'POST', '/devices/bind', 'bind this device, starting the cooling off'),
    ('devices', 'GET', '/devices/cooling-off', 'return whether a cooling off is running and its end'),
    ('security', 'POST', '/security/transaction-pin', 'set the transaction PIN'),
    ('security', 'POST', '/security/transaction-pin/verify', 'check the transaction PIN for a financial action'),
    ('security', 'POST', '/security/block', 'ask the bank to block digital channels at once'),
    ('notifications', 'GET', '/notifications/preferences', 'return the member\'s notification choices'),
    ('notifications', 'PATCH', '/notifications/preferences', 'change notification choices, alerts staying on'),
    ('privacy', 'POST', '/privacy/export', 'request a full export of the member\'s record'),
    ('privacy', 'POST', '/privacy/close-account', 'close the account when nothing is owed'),
    ('takaful', 'GET', '/takaful/:circleId', 'show the operator, the fee by name and the certificate'),
    ('takaful', 'POST', '/takaful/claims', 'lodge a claim with the operator\'s reference'),
    ('takaful', 'GET', '/takaful/claims/:id', 'show the operator\'s claim status'),
    ('admin', 'GET', '/admin/queues/:name', 'serve each administrative queue'),
    ('admin', 'POST', '/admin/queues/:name/:id/decide', 'record an administrator\'s decision with a reason'),
    ('admin', 'GET', '/admin/audit', 'search the audit log'),
    ('admin', 'GET', '/admin/reports/bank', 'produce the monthly report pack for the bank'),
    ('health', 'GET', '/health', 'report the service, database and partner connections for monitoring'),
]


def is_list(method, path):
    return method == 'GET' and not path.rstrip('/').split('/')[-1].startswith(':')


def build():
    data = json.loads(io.open(os.path.join(HERE, 'endpoint_audit.json'), encoding='utf-8').read())
    eps = data['endpoints']
    existing, retire, rework = [], [], []
    for e in eps:
        f, m, p, line = e['file'], e['method'], e['path'], e['line']
        n = '%s /api/%s%s' % (m, f, p if p != '/' else '')
        where = 'routes/%s.ts:%d' % (f, line)
        why = RETIRE.get((f, p)) or RETIRE.get((f, None))
        if why:
            retire.append(I('%s: remove the endpoint and its handler; %s' % (n, why), where, 'Claude', 'P0'))
            continue
        if (f, p) in REWORK:
            rework.append(I('%s: %s' % (n, REWORK[(f, p)]), where, 'Chairman' if 'decision' in REWORK[(f, p)] else
                            'Claude', 'P1', 2))
        mut = m in ('POST', 'PUT', 'PATCH', 'DELETE')
        pri = 'P0' if f in ('auth', 'payments', 'committees') else 'P1'
        a = lambda t, st='Open', p=pri, w=where: existing.append(I('%s: %s' % (n, t), w, 'Claude', p, 1, st))
        a('input checked against a schema before any logic', 'Done' if e['validates'] else 'Open')
        if (f, p) in PUBLIC:
            a('open without sign in by design; limited to what that step needs', 'Done')
        else:
            a('sign in required', 'Done' if e['auth'] else 'Open', 'P0')
            a('access checked against membership, hosting or ownership of the record before acting')
        a('rate limit for this route; the global limit of 1,500 requests in 15 minutes is in place', 'Partly done')
        if mut:
            a('idempotency key accepted and enforced', 'Done' if e['idem'] else 'Open')
            a('audit log entry with the actor, the action and the record', 'Done' if e['audit'] else 'Open')
            if e['tx']:
                a('writes made in one database transaction', 'Done')
            else:
                a('writes made in one database transaction, or shown to need none')
        if is_list(m, p) or e['findmany']:
            a('every list bounded with a limit and cursor pagination', 'Open' if e['unbounded'] else 'Partly done')
        a('response carries no internal field and no other member\'s personal data')
        a('error responses use the shared error codes and plain messages')
        a('described in the interface specification with its request, response and errors', p='P2')
        a('integration test: success', p='P1')
        if (f, p) not in PUBLIC:
            a('integration test: refused for a member without access', p='P1')
        a('integration test: refused for invalid input', p='P1')
    new = []
    for f, m, p, purpose in NEW:
        n = '%s /api%s' % (m, p)
        mut = m in ('POST', 'PUT', 'PATCH', 'DELETE')
        pri = 'P2' if f in ('marketplace', 'turns', 'points') else ('P1' if f not in ('bank', 'mandates', 'payouts',
                                                                                     'reconciliation', 'devices',
                                                                                     'security', 'kfs') else 'P0')
        w = 'new routes/%s.ts' % f
        b = lambda t, eff=1, p=pri: new.append(I('%s: %s' % (n, t), w, 'Claude', p, eff))
        b('build: %s' % purpose, 2)
        b('input checked against a schema')
        if f in ('bank', 'psp', 'marketplace') and p.endswith('webhooks'):
            b('signature and time stamp verified, replays refused, before any write')
        elif 'scheduler only' in purpose or f == 'admin':
            b('open only to the scheduler or to named administrators')
        elif f != 'health':
            b('sign in and access checks')
        b('rate limit for this route')
        if mut:
            b('idempotency key enforced')
            b('audit log entry')
        if is_list(m, p):
            b('bounded with cursor pagination')
        b('errors use the shared codes')
        b('described in the interface specification', p='P2')
        b('integration tests: success, refusal and invalid input')
    shared = [
        I('Shared error code list with a member facing sentence for each code, in English and Urdu', 'lib/errors.ts',
          'Claude', 'P1', 2),
        I('Interface specification generated from the schemas and published for the bank', 'docs', 'Claude', 'P1', 2),
        I('Request identifier on every response and in every log line', 'app.ts', 'Claude', 'P1'),
        I('Per route rate limits, tighter on sign in, codes and financial actions', 'app.ts', 'Claude', 'P0', 2),
        I('Idempotency middleware with a stored response for a repeated key', 'new lib/idempotency.ts', 'Claude', 'P0', 2),
        I('Access check helpers: isMember, isHost, owns, isAdmin, used by every route', 'lib/guards.ts', 'Claude', 'P0', 2),
        I('Response shaping helpers that strip internal fields in one place', 'lib/guards.ts', 'Claude', 'P1'),
        I('Versioned interface paths so the native application and the web application can differ', 'app.ts', 'Claude',
          'P2'),
        I('Contract tests for every endpoint the bank or the PSP calls', 'tests', 'Claude', 'P1', 2),
        I('Socket channel (chat and live updates) checked for sign in, access and rate limits', 'socket.ts', 'Claude',
          'P1'),
    ]
    return section('AE', 'Interface Service Endpoints', [
        sub('AE1', 'Endpoints to Remove', retire, 'Endpoints that implement withdrawn designs: the vault, investment of '
                                                  'member money, deposits held, Halqa cover and passwords.'),
        sub('AE2', 'Endpoints to Rework', rework),
        sub('AE3', 'Endpoints Kept', existing, 'Each kept endpoint with every check it needs: items 501, 502, 542, '
                                               '545, 546 and 547 broken down by endpoint. Done means the code '
                                               'already does it, as read on 5 October 2026.'),
        sub('AE4', 'New Endpoints for the Bank Route', new),
        sub('AE5', 'Shared Pieces', shared),
    ], 'The 123 endpoints in seventeen route files, and the new ones the partnership needs.', loop=5)
