# -*- coding: utf-8 -*-
"""Pass 8: how every rule is proven. Test cases for each engine, end to end journeys, performance and security tests."""
from common import I, sub, section

CASES = {
    'Fee': ('lib/fee-book.ts', 'P0', [
        'Rs 85 charged on a monthly instalment of Rs 10,000',
        'Rs 85 charged on instalments of Rs 2,000 and of Rs 25,000, the fee flat whatever the size',
        'the same fee for the first seat and the last seat',
        'no charge of any kind for an early turn',
        'Hyper: Rs 15 a day on Design 1 and on Design 2',
        'PSP service fee of 1.5 per cent added only when a wallet or card is used',
        'no PSP service fee on a debit under the bank\'s mandate',
        'PSP service fee rounded to the paisa the way the PSP rounds',
        'discount of 80 per cent for a guarantee cheque and 50 per cent for verified income, never stacked',
        'points used against a fee never exceed the fee',
        'points for paying on time never exceed half the fee on that instalment, Rs 42.50',
        'the fee shown before payment equals the fee charged and the fee on the receipt',
        'the fee schedule version is recorded with every charge',
        'no fee is ever expressed as a rate except the PSP service fee',
    ]),
    'Split': ('lib/split.ts', 'P0', [
        'contribution, takaful or insurance fee, the Rs 85 fee and any PSP service fee add up to the amount debited',
        'Hyper Design 1: Rs 300, Rs 135 and Rs 15 make Rs 450',
        'Hyper Design 2: Rs 333.33, Rs 151.67 and Rs 15 make Rs 500, with the thirds rounded so the circle balances over '
        '26 days',
        'each part posted to its own ledger account in one transaction',
        'the ledger balances after every posting',
        'identity one: the pot equals the contribution multiplied by the number of rounds',
        'identity two: the roster equals collectors per period multiplied by the number of periods',
        'a configuration that breaks either identity is refused at creation',
        'a circle without takaful or insurance posts no such part',
    ]),
    # Rewritten to the chairman's ruling of 5 October 2026, which withdrew the
    # blanket quarantine and the fixed score per turn. The test is now whether
    # the pot is recoverable from the member, by record or by security.
    'Seat eligibility': ('lib/score-bands.ts', 'P0', [
        'a real bureau record with a good score opens every seat, once TASDEEQ publishes its bands',
        'no score counts as good until TASDEEQ publishes its bands, so a scored member stops at the middle seats',
        'a mid score on a real record opens the middle seats only',
        'a low score on a real record is held to the last seats',
        'a record too thin to score opens the middle seats',
        'no bureau record at all starts in the last seats',
        'a low score on no record is not treated as a bad record',
        'one clean committee, known or unknown, opens every seat where the record could not speak',
        'a clean committee does not excuse a low score resting on a real record',
        'security covering the pot, less the relaxation of ten per cent, opens every seat',
        'security below the relaxation does not count',
        'security sources combine, and the total is what is tested',
        'security cannot buy past a low score on a real record',
        'the last seats are the final three, never earlier than the second half of the circle',
        'the middle seats are the second half of the circle',
        'tiers scale to a circle of 20 in the same proportions',
        'tenure alone no longer decides a seat: the blanket quarantine is gone',
        'a host cannot open an early seat on a circle between strangers',
        "on a known circle the host's invitation stands in the matrix's place, as the affordability tests do",
        'tiers are checked at joining, at every turn listing and at every bid, through one engine',
        'tiers are recalculated at the close of every committee, from the clean completions it records',
        'the ballot places members only in seats their tier allows',
        'the member is told why the seats above are closed and how to open them',
    ]),
    'Affordability': ('lib/affordability.ts', 'P0', [
        'all instalments together within a third of verified income',
        'within 40 per cent including loans reported by TASDEEQ',
        'the weighted load and forward liability tests apply from the fourth committee',
        'the tests apply to circles between strangers and Hyper, not to known circles',
        'a refusal gives the reason and the amount that would fit',
        'income from the member\'s own transfers and from loans is excluded',
    ]),
    'Identity confidence': ('lib/identity-score.ts', 'P1', [
        'a name match of 0.90 or more passes',
        'a name match from 0.80 to 0.90 goes to a person',
        'a name match below 0.80 fails with the reason',
        'a face match is required at level 2 and above',
        'address and job checks raise the level as specified',
        'levels 1 to 3 set from the combined checks',
        'an expired CNIC lowers the level until it is renewed',
    ]),
    'Salary pattern': ('lib/salary-pattern.ts', 'P1', [
        'salary from one employer on about the same day each month is detected',
        'daily circles: Rs 1,000 or more on five days of every week for eight weeks passes',
        'four days in one week fails the daily test',
        'transfers from the member\'s own accounts are excluded',
        'loan disbursements are excluded',
        'the payday learned is used as the first debit date',
        'a late salary moves the first attempt to the day it arrives, before the 8th',
    ]),
    'Collection': ('lib/collection-policy.ts', 'P0', [
        'methods tried in the order: bank mandate, saved card, approval, by hand',
        'first attempt on the payday',
        'a retry each morning after a failure, five attempts at most, all before the 8th',
        'the second method tried once on the last attempt where the member has one',
        'no late charge before the 8th',
        'late charges of 2, 5 and 10 per cent after the 8th, as the delay grows',
        'daily circles: 5, 10 and 15 per cent at 12, 36 and 60 hours',
        'arrears recorded against the round, never as a negative balance held by Halqa',
        'arrears taken from the member\'s own pot on their turn',
        'a debit never exceeds the mandate ceiling of one instalment',
        'a cancelled mandate is never debited',
        'cancelling a mandate moves the member to approval or payment by hand',
        'a retried job never debits twice',
        'a member without a partner bank account stays on approval and payment by hand',
        'Hyper collects only by mandate or saved card',
        'a partial payment is recorded and the balance stays due',
        'payment by a verified family member is recorded as such',
        'an advance payment is accepted and applied to the next instalment',
    ]),
    'Payout': ('lib/payout.ts', 'P0', [
        'the pot paid to the collector\'s verified account on the 8th, the same day',
        'the account title checked before every payout',
        'a payout to another bank goes by interbank transfer',
        'a payout to a wallet that would exceed its monthly limit goes to the bank account instead',
        'payouts paused on a circle with an open reconciliation break',
        'a shortfall from a late member explained on the payout, with the takaful or insurance claim where it applies',
        'the payout receipt matches the ledger to the paisa',
        'a payout account changed in the last two hours is refused',
    ]),
    'Reconciliation': ('lib/reconcile.ts', 'P0', [
        'every ledger entry matched to one bank entry',
        'an unmatched entry becomes a break and pauses payouts on its circle',
        'a duplicate bank entry is detected',
        'a partial match is held for review',
        'a break resolved with a reason releases the pause',
        'the daily statement is ingested once even if delivered twice',
    ]),
    'Points': ('lib/points-ledger.ts', 'P2', [
        'one point equals one rupee in every calculation',
        'the ledger is append only; no entry is edited or deleted',
        'no route exists from points to cash',
        'points move between members only as the price of a turn',
        'points are frozen while a member is in default',
        'purchases stay within the daily and monthly limits agreed with the bank',
        'members on Raqami cannot buy points',
        'unused points lapse only under the rule stated before purchase',
        'a returned order credits its points back',
        'the end of circle reward equals the profit on the member\'s balance, converted at one point a rupee',
    ]),
    'Turn market': ('lib/turn-swap.ts', 'P2', [
        'a price above 100 per cent of the pot is refused',
        'a buyer whose band does not allow the earlier turn is refused',
        'forward liability and affordability are checked again for the buyer',
        'no trade settles without the host\'s approval',
        'settlement swaps the turns, moves the points and charges the fee in one transaction',
        'a cooling off period runs before settlement',
        'a trade is cancelled if either member defaults before settlement',
        'no trade is possible in Hyper or asset circles',
        'the maximum number of trades per member per circle is enforced',
        'a trade between linked accounts is refused',
    ]),
    'Recovery': ('services/delinquency.ts', 'P1', [
        'the steps run in order, each only if the one before fails',
        'at step two the account is restricted and the score falls by 200',
        'at step three the operator is notified of the claim; Halqa pays nothing itself',
        'no step contacts a relative or a contact of the member',
        'a hardship plan pauses the ladder until its date',
        'a cure clears the restriction and records the recovery',
    ]),
    'Leaving a circle': ('lib/exit-ladder.ts', 'P1', [
        'each rung shows its arithmetic before the member confirms',
        'restitution owed is calculated to the paisa',
        'a seat transfer passes the replacement\'s band and affordability checks',
        'the vote passes only with the stated majority',
        'the guarantee is released when the exit settles',
    ]),
    'Agreements and consent': ('lib/agreements.ts', 'P0', [
        'acceptance recorded with the version, the hash, the address and the time',
        'withdrawal within 24 hours costs nothing',
        'joining is refused until the key fact statement is accepted',
        'no bureau report is requested without the member\'s instruction',
        'no report is sent to the bureau without consent to reporting',
        'a withdrawn consent stops the processing it covered',
    ]),
    'Credit reporting': ('lib/bureau-report.ts', 'P1', [
        'every field of the data set filled from the ledger',
        'the monthly submission fails its checks on any missing field',
        'a member is told before a first adverse report',
        'a disputed record is marked while the dispute is open',
        'a corrected record is resubmitted',
    ]),
    'Device security': ('lib/security.ts', 'P0', [
        'a device is bound at first sign in',
        'a new device starts a two hour cooling off',
        'financial actions are refused during the cooling off',
        'a new device sends an alert to the member',
        'five wrong transaction PINs lock financial actions for fifteen minutes',
        'a session ends after inactivity',
    ]),
    'Ballot': ('lib/parchi.ts', 'P2', [
        'the seed\'s fingerprint is published before the draw',
        'each member\'s tap contributes to the draw',
        'the result can be reproduced from the revealed seed',
        'the draw places members only in seats their eligibility allows',
        'a circle that cannot be seated at all is reported, never fixed by promoting somebody',
        'the seats themselves are published and can be recomputed by anyone holding the proof',
    ]),
    'Hyper': ('lib/hyper.ts', 'P2', [
        'each day\'s payers are assigned to that day\'s collectors, with no pool',
        'Design 1: 400 members, 50 days, 8 collecting a day',
        'Design 2: 390 members, 26 days with Sundays off, 15 collecting a day',
        'one daily circle per member',
        'the daily income floor is enforced at joining',
        'the stress index stops new days when losses would pass the takaful or insurance limit',
    ]),
}

JOURNEYS = [
    'sign up to a verified account at the bank', 'host creates a circle and admits members',
    'member joins with a code and accepts the key facts', 'member authorises a mandate',
    'first collection succeeds on payday', 'collection fails, retries and succeeds before the 8th',
    'member pays by hand through Raast', 'member pays by wallet and sees the PSP service fee',
    'payout on the 8th to the collector', 'late payment with arrears set off at the member\'s payout',
    'hardship plan agreed and cured', 'member leaves through the exit ladder', 'member disputes a payment',
    'member files a complaint and receives a reply', 'end of circle reward credited as points',
    'points used against a fee', 'marketplace order placed and delivered', 'turn listed, offered, approved and settled',
    'member joins Hyper and pays daily', 'account closure after the last circle', 'data export requested and delivered',
    'device change with the cooling off', 'forgotten PIN reset', 'transaction PIN set and used',
    'the whole application in Urdu', 'the whole application in dark mode', 'offline and back online without losing work',
    'bank refuses the account opening', 'account title mismatch corrected', 'takaful or insurance claim followed to '
                                                                             'payment by the operator',
    'circle completes and members are invited to host', 'host removes a member against the published test',
    'ballot sets the order of turns', 'member abroad joins through Mashreq\'s UAE route', 'reported record disputed and '
                                                                                         'corrected',
]

PERF = [
    'collection run for 100,000 members on one payday, within the bank\'s rate limits',
    'payout batch on the 8th for every circle due', 'reconciliation of 100,000 statement lines',
    'notification fan out on the evening before payday', 'interface service under load: 95th percentile response time',
    'database connection pool under load', 'cold start time of every serverless function',
    'application start on a two gigabyte handset', 'first screen over a slow mobile connection',
    'chat and live update connections at peak', 'scheduled jobs sharded and finishing within their windows',
    'points purchases at a launch peak',
]

SEC = [
    'sign in bypass attempts on every route', 'access to another member\'s circle, payment, receipt and profile by '
                                              'changing identifiers',
    'rate limits enforced on sign in, codes and financial actions', 'token expiry, refresh rotation and revocation',
    'forged and replayed webhooks from the bank and the PSP', 'injection through every input',
    'script injection through chat, names and support text', 'file uploads checked for type, size and content',
    'no secret in the application bundle', 'content security policy blocks inline scripts',
    'cross origin requests limited to the application', 'the application cannot be framed by another site',
    'PIN guessing stopped by the lockout', 'phone number enumeration at sign up and sign in prevented',
    'one time code timing and reuse attacks', 'administrative routes closed to members',
    'logs and error reports free of personal data', 'dependencies free of known high severity flaws',
    'transaction PIN required on every financial route', 'cooling off enforced on the server, not only on screen',
]


def build():
    subs = []
    k = 1
    for engine, (where, pri, cases) in CASES.items():
        items = [I('Test, %s: %s' % (engine.lower(), c), where, 'Claude', pri) for c in cases]
        subs.append(sub('AI%d' % k, engine, items))
        k += 1
    subs.append(sub('AI%d' % k, 'End to End Journeys', [I('Journey test: %s' % j, 'tests', 'Claude', 'P1', 2)
                                                         for j in JOURNEYS]))
    k += 1
    subs.append(sub('AI%d' % k, 'Performance', [I('Load test: %s' % p, 'tests', 'Claude', 'P2', 2) for p in PERF]))
    k += 1
    subs.append(sub('AI%d' % k, 'Security Tests', [I('Security test: %s' % s, 'tests', 'Claude', 'P1') for s in SEC]))
    k += 1
    base = [
        I('Test database seeded from fixtures for every circle type and state', 'tests', 'Claude', 'P1', 2),
        I('Coverage measured for the engines, with a floor that only rises', 'pipeline', 'Claude', 'P2'),
        I('Flaky tests tracked and fixed within a week', 'process', 'Claude', 'P2'),
        I('Simulation of 10,000 circles across a year to check the ledger always balances', 'tests', 'Claude', 'P2', 2),
        I('Existing Monte Carlo and Pakistan simulations kept as regression checks', 'tests', 'Claude', 'P3'),
    ]
    subs.append(sub('AI%d' % k, 'Test Foundations', base))
    return section('AI', 'Tests', subs, 'Each business rule with its own test case, then the journeys a member takes from '
                                        'start to finish, the load the service must carry, and the attacks it must '
                                        'resist. Items 568 to 591 are broken down here by rule and by journey.', loop=8)
