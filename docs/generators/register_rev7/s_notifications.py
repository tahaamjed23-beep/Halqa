# -*- coding: utf-8 -*-
"""Pass 7: what every member must be told, and when. Each event with its trigger, its text in each channel and
language, its template approval and its test."""
from common import I, sub, section

# (event, channels: a = in application, p = push, w = WhatsApp, s = SMS, e = email; locked alert; priority)
EVENTS = {
    'Account and identity': [
        ('one time code for sign in or recovery', 's', 1, 'P0'), ('welcome after sign up', 'ap', 0, 'P1'),
        ('identity check submitted', 'a', 0, 'P1'), ('identity check passed', 'apw', 0, 'P1'),
        ('identity check failed, with the reason and next step', 'apw', 0, 'P0'),
        ('bank account opened', 'apw', 0, 'P0'), ('bank account refused, with the reason', 'apw', 0, 'P0'),
        ('CNIC about to expire', 'apw', 0, 'P2'), ('account restricted by the bank', 'apw', 1, 'P1'),
    ],
    'Security': [
        ('new device registered', 'aps', 1, 'P0'), ('cooling off started after a device change', 'ap', 1, 'P0'),
        ('PIN changed', 'aps', 1, 'P0'), ('transaction PIN changed', 'aps', 1, 'P0'),
        ('sign in from a new device', 'aps', 1, 'P0'), ('digital channels blocked at the member\'s request', 'aps', 1,
                                                       'P0'),
    ],
    'Mandates and collection': [
        ('mandate authorised', 'apw', 1, 'P0'), ('mandate cancelled', 'apw', 1, 'P0'),
        ('reminder the evening before payday', 'pw', 0, 'P0'), ('instalment collected', 'ap', 1, 'P0'),
        ('collection failed, with the reason', 'apw', 1, 'P0'), ('retry scheduled for tomorrow morning', 'ap', 1, 'P1'),
        ('last attempt today, with the manual route', 'apw', 1, 'P0'),
        ('instalment due tomorrow, for members who pay by hand', 'pw', 0, 'P1'),
        ('due date reached and unpaid', 'apw', 1, 'P0'), ('advance notice of a different amount', 'apw', 1, 'P1'),
        ('PSP service fee charged on a wallet or card payment', 'a', 1, 'P1'),
    ],
    'Late payment': [
        ('late notice, first step', 'apw', 1, 'P0'), ('late notice, second step', 'apw', 1, 'P0'),
        ('late notice, third step', 'apw', 1, 'P0'), ('arrears set off at the member\'s payout', 'ap', 1, 'P1'),
        ('hardship plan agreed', 'apw', 0, 'P1'), ('account restricted for arrears', 'apw', 1, 'P1'),
    ],
    'Circles and turns': [
        ('invited to a circle', 'pw', 0, 'P1'), ('admitted by the host', 'apw', 0, 'P1'),
        ('admission declined, with the reason', 'ap', 0, 'P1'), ('waiting list position changed', 'a', 0, 'P2'),
        ('circle starts', 'apw', 0, 'P1'), ('turn due next month', 'apw', 0, 'P1'),
        ('payout sent to the member\'s account', 'apw', 1, 'P0'), ('payout failed, with the next step', 'apw', 1, 'P0'),
        ('circle completed', 'apw', 0, 'P1'), ('order of turns set by ballot, with the result', 'ap', 0, 'P2'),
        ('rules of the circle changed with the members\' approval', 'apw', 0, 'P2'),
    ],
    'For hosts': [
        ('new applicant waiting', 'ap', 0, 'P1'), ('member late in the host\'s circle', 'ap', 0, 'P1'),
        ('removal vote opened', 'ap', 0, 'P1'), ('mandate coverage below the circle\'s rule', 'a', 0, 'P2'),
    ],
    'Leaving and recovery': [
        ('exit request received', 'ap', 0, 'P1'), ('exit vote result', 'ap', 0, 'P1'), ('exit settled', 'apw', 1, 'P1'),
        ('takaful or insurance claim lodged by the operator', 'apw', 0, 'P1'),
        ('takaful or insurance claim paid by the operator', 'apw', 1, 'P1'),
    ],
    'Points, marketplace and turns': [
        ('end of circle reward credited as points', 'apw', 0, 'P2'), ('on time points credited', 'a', 0, 'P2'),
        ('points bought (Mashreq)', 'ap', 1, 'P2'), ('order placed', 'ap', 0, 'P2'), ('order shipped', 'ap', 0, 'P2'),
        ('order delivered', 'ap', 0, 'P2'), ('return accepted and points refunded', 'ap', 0, 'P2'),
        ('offer received on a listed turn', 'ap', 0, 'P2'), ('offer accepted, awaiting the host', 'ap', 0, 'P2'),
        ('trade settled', 'ap', 1, 'P2'), ('trade cancelled', 'ap', 0, 'P2'),
    ],
    'Service': [
        ('complaint received, with its number', 'ape', 0, 'P1'), ('complaint updated', 'ap', 0, 'P1'),
        ('complaint resolved, with the Banking Mohtasib route', 'ape', 0, 'P1'),
        ('dispute opened', 'ap', 0, 'P0'), ('dispute resolved', 'apw', 0, 'P0'),
        ('statement ready', 'ae', 0, 'P2'), ('terms updated, with what changed', 'ape', 0, 'P1'),
        ('service interruption and recovery', 'ap', 0, 'P2'), ('data export ready', 'ae', 0, 'P2'),
    ],
    'Hyper': [
        ('daily payment taken', 'p', 1, 'P2'), ('daily payment failed', 'ap', 1, 'P2'),
        ('collection day tomorrow', 'ap', 0, 'P2'), ('Hyper circle stopped by its limits', 'ap', 0, 'P2'),
    ],
}
CH = {'a': 'in the application', 'p': 'push', 'w': 'WhatsApp', 's': 'SMS', 'e': 'email'}


def build():
    subs = []
    k = 1
    for group, evs in EVENTS.items():
        items = []
        for ev, chans, locked, pri in evs:
            n = 'Notice: %s' % ev
            items.append(I('%s: trigger written in the notice job, with its timing' % n, 'lib/notices.ts', 'Claude', pri))
            for c in chans:
                items.append(I('%s: %s text in English' % (n, CH[c]), 'content', 'Claude', pri))
                items.append(I('%s: %s text in Urdu, by a translator' % (n, CH[c]), 'content', 'Translator', pri))
                if c == 'w':
                    items.append(I('%s: WhatsApp template submitted and approved in both languages' % n, 'commercial',
                                   'Partner', pri))
            if locked:
                items.append(I('%s: always sent, whatever the member\'s preferences, as a financial alert' % n,
                               'lib/notices.ts', 'Claude', pri))
            else:
                items.append(I('%s: respects the member\'s preferences and quiet hours' % n, 'lib/notices.ts', 'Claude',
                               pri))
            items.append(I('%s: logged with channel and delivery status' % n, 'NotificationLog', 'Claude', pri))
            items.append(I('%s: test that it fires once, at the right time, to the right member' % n, 'tests', 'Claude',
                           pri))
        subs.append(sub('AH%d' % k, group, items))
        k += 1
    rules = [
        I('No message carries a full account number, CNIC or balance of another member', 'content', 'Claude', 'P0'),
        I('Quiet hours from 10 at night to 8 in the morning for anything that is not a security alert', 'lib/notices.ts',
          'Claude', 'P1'),
        I('Roman Urdu as the first WhatsApp language where the member chose it', 'content', 'Claude', 'P2'),
        I('Every link in a message opens the application, never a web form asking for a PIN or code', 'content', 'Claude',
          'P0'),
        I('Notification centre groups messages by day and marks them read', 'NoticesPage.tsx', 'Claude', 'P1'),
    ]
    subs.append(sub('AH%d' % k, 'Rules for Every Message', rules))
    return section('AH', 'Messages to Members', subs, 'Every event a member or host must be told about, with its trigger, '
                                                      'its text in each channel in English and Urdu, its template '
                                                      'approval where WhatsApp is used, its log and its test.', loop=7)
