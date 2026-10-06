# -*- coding: utf-8 -*-
"""Pass 6: what every outside connection needs. One group of items for each operation with the bank, the PSP, NADRA
through the bank, TASDEEQ, the WhatsApp provider, SMS, push, email, the liveness service and the monitoring services."""
from common import I, sub, section

OPS = {
    'Partner Bank': ('Bank', [
        ('account opening hand off', 'P0'), ('account opening result', 'P0'), ('account status inquiry', 'P0'),
        ('account title inquiry', 'P0'), ('balance inquiry', 'P1'), ('internal transfer from payer to collector', 'P0'),
        ('interbank transfer by Raast to another bank', 'P1'), ('Raast request to pay, now and later', 'P1'),
        ('request to pay status', 'P1'), ('mandate or standing instruction creation', 'P0'),
        ('mandate authorisation by the member at the bank', 'P0'), ('mandate ceiling change', 'P1'),
        ('mandate cancellation', 'P0'), ('mandate status events', 'P0'), ('debit under a mandate', 'P0'),
        ('debit result events', 'P0'), ('payout credit to the collector', 'P0'), ('daily statement download', 'P0'),
        ('settlement report', 'P1'), ('profit on committee balances for the reward', 'P2'),
        ('account restriction and freeze notices', 'P1'), ('dormant account notice', 'P2'),
        ('channel block request', 'P0'), ('dispute hand over', 'P0'), ('complaint hand over', 'P1'),
        ('fraud signal feed', 'P1'), ('customer data change events', 'P2'), ('monthly report delivery', 'P2'),
    ]),
    'PSP': ('Partner', [
        ('customer creation', 'P1'), ('card saving page with 3-D Secure', 'P1'), ('wallet linking', 'P1'),
        ('merchant initiated charge on a saved card or wallet', 'P1'), ('refund', 'P1'),
        ('dispute notification and evidence', 'P1'), ('signed event delivery', 'P1'), ('settlement report', 'P1'),
        ('saved token removal', 'P1'),
    ]),
    'NADRA through the Bank': ('Bank', [
        ('biometric verification result shared with consent', 'P1'),
        ('Verisys result for the permitted fallback cases', 'P2'),
    ]),
    'TASDEEQ': ('Partner', [
        ('subscriber report on the member\'s instruction', 'P1'), ('monthly data submission', 'P1'),
        ('correction of a submitted record', 'P1'), ('dispute from the bureau', 'P1'),
    ]),
    'WhatsApp Provider': ('Partner', [
        ('message template submission and approval', 'P1'), ('template message sending', 'P1'),
        ('delivery and read status events', 'P2'), ('opt out handling', 'P1'), ('rate and spend limits', 'P2'),
    ]),
    'SMS Provider': ('Partner', [
        ('one time code sending', 'P0'), ('delivery reports', 'P1'), ('masked sender identity registration', 'P2'),
    ]),
    'Push Notifications': ('Claude', [
        ('device token registration for Android and iOS', 'P1'), ('push sending', 'P1'), ('receipt tracking', 'P2'),
        ('token clean up on sign out', 'P1'),
    ]),
    'Email': ('Claude', [('transactional email sending', 'P2'), ('bounce and complaint handling', 'P2')]),
    'Liveness Service': ('Claude', [
        ('liveness session creation', 'P1'), ('liveness result and face match', 'P1'),
        ('deletion of images after the check', 'P0'),
    ]),
    'Monitoring Services': ('Claude', [
        ('error reports with personal data removed', 'P0'), ('uptime checks', 'P1'), ('performance traces', 'P2'),
    ]),
}

STEPS = [
    ('contract written: request, response, errors and limits, agreed with the provider', 1, None),
    ('client built behind one module, with nothing else calling the provider directly', 2, None),
    ('timeouts, retries with backoff and a limit on attempts', 1, None),
    ('idempotency key or reference on every request that changes anything', 1, None),
    ('every provider error mapped to a reason and a sentence the member understands', 1, None),
    ('tested against the provider\'s sandbox', 1, 'sandbox'),
    ('contract test that fails the build if the provider\'s format changes', 1, None),
    ('monitored, with an alert to a named person on failure or delay', 1, None),
    ('runbook entry: what to do when it fails', 1, None),
    ('credentials held in the managed secret store and rotated', 1, None),
]


def build():
    subs = []
    k = 1
    for group, (owner, ops) in OPS.items():
        items = []
        for op, pri in ops:
            n = '%s, %s' % (group, op)
            for text, eff, kind in STEPS:
                o = 'Claude'
                if kind == 'sandbox' and owner in ('Bank', 'Partner'):
                    items.append(I('%s: sandbox access granted' % n, 'integration', owner, pri))
                items.append(I('%s: %s' % (n, text), 'integration', o, pri, eff))
        subs.append(sub('AG%d' % k, group, items))
        k += 1
    access = [
        I('Bank: technical contact named and the integration method chosen: APIs, the bank\'s kit, or files', 'bank',
          'Bank', 'P0'),
        I('Bank: interface documents received and read', 'bank', 'Bank', 'P0'),
        I('Bank: Halqa\'s outbound addresses fixed and placed on the bank\'s allow list; item 779 covers the bank\'s addresses at Halqa', 'infrastructure',
          'Claude', 'P1'),
        I('Bank: mutual TLS certificates for item 777 exchanged, with their expiry tracked', 'infrastructure', 'Claude', 'P1'),
        I('Bank: message signing keys exchanged and rotation agreed', 'infrastructure', 'Claude', 'P1'),
        I('Bank: the cut over plan of item 797 rehearsed in the test environment', 'integration', 'Claude', 'P1', 2),
        I('PSP: pricing confirmed against the 1.5 per cent service fee shown to members (5 October)', 'commercial',
          'Chairman', 'P0'),
        I('TASDEEQ: first contact made and the subscriber and data furnisher terms obtained', 'commercial', 'Chairman',
          'P0'),
        I('WhatsApp: business account verified in the company\'s name and a provider chosen', 'commercial', 'Chairman',
          'P1'),
        I('SMS: provider chosen with Pakistani delivery and sender identity', 'commercial', 'Chairman', 'P1'),
        I('Integration map kept current: every provider, every operation, owner and status', 'docs', 'Claude', 'P1'),
    ]
    subs.append(sub('AG%d' % k, 'Access and Agreements', access))
    return section('AG', 'Connections to Partners', subs, 'Every operation with an outside party, each with its contract, '
                                                          'client, retries, idempotency, error mapping, sandbox test, '
                                                          'contract test, monitoring, runbook and credentials.', loop=6)
