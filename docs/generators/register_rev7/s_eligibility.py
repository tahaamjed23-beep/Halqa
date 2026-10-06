# -*- coding: utf-8 -*-
"""Pass 11: the chairman's ruling of 5 October 2026. The two month income wait is dropped, seats follow real bureau
history rather than a blanket quarantine, security may stand in place of credit history, the host is paid a share of the
profit their circle makes, and an account must open in under ten minutes."""
from common import I, sub, section

# Steps on the critical path of opening an account, with the seconds each is allowed. Measured against the journey of
# sections D and AC on 5 October 2026: twenty one screens stand between the welcome screen and a verified account, which
# does not fit ten minutes. The budget below moves everything not needed to OPEN an account into the journey of JOINING
# a circle, where the member is already committed and a slower step is tolerable.
BUDGET = [
    ('Welcome', 5, 'keep'), ('Phone number', 20, 'keep'), ('One time code', 25, 'keep; autofill the code'),
    ('PIN set and confirmed', 25, 'keep; one screen with two steps'),
    ('Name and date of birth', 40, 'keep; read both from the CNIC where the capture succeeds'),
    ('Address and city', 50, 'keep, since the bank needs it to open the account'),
    ('CNIC front, back and review', 90, 'keep; read the fields rather than ask them again'),
    ('Liveness', 45, 'keep'), ('Identity check', 45, 'keep; show progress, never a blank wait'),
    ('Bank account opening and the biometric check', 180, 'the bank\'s own journey; the longest step and not Halqa\'s '
                                                          'to shorten'),
    ('Biometric unlock offer', 10, 'keep; one tap, skippable'),
]
MOVED = [
    ('Occupation and employer', 'joining a circle'), ('Income declaration', 'joining a circle'),
    ('Income verification upload', 'joining a circle between strangers'),
    ('Income verification status', 'joining a circle between strangers'),
    ('Verification levels', 'an explanation reached from the account screen'),
    ('Bureau instruction', 'joining a circle between strangers'),
    ('Bureau instruction confirmation', 'joining a circle between strangers'),
    ('Adverse action disclosure', 'the refusal it belongs to'),
]

MATRIX = [
    ('has real, substantial bureau history and a good score', 'any seat', 'P1'),
    ('has a mid score', 'the middle seats', 'P1'),
    ('has a low score', 'the last seats', 'P1'),
    ('has a record too thin to score properly', 'the middle seats, and the first positions after one clean circle, '
                                                'known or unknown', 'P1'),
    ('has no credit history at all, so no or very limited score factors', 'the last seats, and any seat after one '
                                                                          'clean circle, known or unknown', 'P1'),
]

SECURITY = [
    ('enrolment in an asset committee whose dates and pot align with the circle', 'P1'),
    ('points, which may be bought with money', 'P2'),
    ('money of roughly the same amount in the member\'s savings account at the partner bank', 'P1'),
]


def build():
    income = [
        I('Remove the two month wait as the normal route into a circle between strangers: documentary proof verifies on '
          'the same day, and the observation of two salary credits (MIN_MONTHS in the salary pattern engine) is kept '
          'only as the fallback for a member with no document and no history at the partner bank (5 October)',
          'lib/salary-pattern.ts:30', 'Claude', 'P0', 2),
        I('Payslip, statement and the partner bank\'s own statement data (D10) each verify income immediately, with no '
          'waiting period', 'lib/salary-pattern.ts', 'Claude', 'P0', 2),
        I('Joining screens state which proof verifies at once and which route needs observation, so no member is left '
          'waiting without knowing why', 'new page', 'Claude', 'P1'),
        I('Members are assumed to be working adults aged 18 or over; no screen implies that unemployment is expected '
          '(5 October)', 'content', 'Claude', 'P1'),
        I('Measure how many members verify by document against how many fall to observation, and report it monthly; if '
          'the fallback is common the assumption behind this ruling is wrong', 'reporting', 'Claude', 'P2'),
        I('Exceptional case path: a member with no document and no history is told the wait, its length and what ends '
          'it, and is offered the security route instead', 'new page', 'Claude', 'P1'),
    ]
    seats = [
        I('Remove the blanket quarantine that holds every new member to the last seats whatever their score, and replace '
          'it with the matrix below (5 October)', 'lib/score-bands.ts', 'Claude', 'P0', 2),
        I('Clean circles required before the first positions open reduced from two to one (REQUIRED_CLEAN_CIRCLES)',
          'lib/score-bands.ts', 'Claude', 'P0'),
        I('Manual verification by telephone removed as a condition of early turns, since it cannot scale to 100,000 '
          'members', 'lib/score-bands.ts', 'Claude', 'P1'),
    ]
    seats += [I('Seat eligibility: a member who %s may take %s' % (who, what), 'lib/score-bands.ts', 'Claude', pri)
              for who, what, pri in MATRIX]
    seats += [
        I('A member with no bureau record is distinguished in code from a member with a thin record and from a member '
          'with a genuinely low score; the three carry different seat rights and must not collapse into one band',
          'lib/score-bands.ts', 'Claude', 'P0', 2),
        I('No score counts as good until TASDEEQ publishes its band cutoffs, so the band gate stays provisional and '
          'every member falls to the thin or absent history rows (chairman, 5 October)', 'lib/score-bands.ts', 'Claude',
          'P0'),
        I('Remove the spawn score of 700, which reads as a good band and would defeat the ruling above; a member with '
          'no history carries no score at all until one is earned or read from the bureau', 'prisma/schema.prisma',
          'Claude', 'P0'),
        I('Recalibrate the cutoffs in one place once TASDEEQ\'s bands arrive, as the engine already allows',
          'lib/score-bands.ts', 'Claude', 'P1'),
        I('A clean circle is defined in code: every instalment paid, no late charge outstanding, no default after '
          'collection, the circle closed', 'lib/score-bands.ts', 'Claude', 'P0'),
        I('The seat map shows which seats are open to the member and the reason the others are closed, with the route to '
          'open them', 'new page', 'Claude', 'P1'),
        I('Tests for every row of the matrix, including the move from thin history to any seat after one clean circle',
          'tests', 'Claude', 'P1'),
    ]
    sec = [
        I('Security route: a member needs no credit history where the pot is recoverable from security they hold '
          '(5 October)', 'new lib/security.ts', 'Claude', 'P1', 2),
    ]
    sec += [I('Security accepted: %s' % what, 'new lib/security.ts', 'Claude', pri) for what, pri in SECURITY]
    sec += [
        I('Sources combine: points, savings and an asset committee are added together and tested against the pot',
          'new lib/security.ts', 'Claude', 'P1'),
        I('Relaxation of 10 per cent: security counts as sufficient at 90 per cent of the pot or more, in every case '
          '(5 October)', 'new lib/security.ts', 'Claude', 'P1'),
        I('The member signs a clause not to withdraw the money for the circle\'s duration', 'new page', 'Claude', 'P1'),
        I('The bank places the hold on the member\'s own account; Halqa never holds the money, so the no custody '
          'position stands (5 October)', 'integration', 'Claude', 'P0', 2),
        I('Held money sits in the partner bank\'s savings product and earns its profit for the member throughout the '
          'lock, so giving security costs the member nothing (chairman, 5 October: not too harsh)', 'integration',
          'Bank', 'P0'),
        I('The savings product used for security is the same one that holds instalments between payday and the 8th '
          '(D12), so the bank needs no second product', 'bank', 'Bank', 'P1'),
        I('Profit earned on held security shown to the member during the circle', 'new page', 'Claude', 'P2'),
        I('The hold is released the moment the member\'s last instalment is paid, automatically', 'integration',
          'Claude', 'P1'),
        I('The security route does NOT open the gate for a member whose score is low on substantial, real credit '
          'factors; security cannot buy past a known bad record (5 October)', 'new lib/security.ts', 'Claude', 'P0'),
        I('An asset committee offered as security must align with the circle\'s dates and pot, so the member cannot '
          'collect and run (5 October)', 'lib/asset-committee.ts', 'Claude', 'P1', 2),
        I('Security is rechecked when a member trades for an earlier turn, since the pot at risk changes',
          'lib/turn-swap.ts', 'Claude', 'P1'),
        I('Points pledged as security are frozen in the points ledger and cannot be spent or transferred',
          'lib/points-ledger.ts', 'Claude', 'P1'),
        I('Counsel on the hold: whether a bank lien over a member\'s own savings is enforceable in Pakistan and what '
          'the member must sign for it', 'legal', 'Counsel', 'P0'),
        I('Shariah view on holding a member\'s savings as security for a committee, for the Islamic window', 'bank',
          'Bank', 'P1'),
        I('Tests: security short by 9 per cent passes, short by 11 per cent fails, and a combination of sources is '
          'added correctly', 'tests', 'Claude', 'P1'),
    ]
    host_pay = [
        I('Host commission: 10 per cent of the profit the circle made for Halqa, not of its revenue, paid at the end of '
          'each circle (5 October)', 'new lib/host-commission.ts', 'Claude', 'P2', 2),
        I('Profit of a circle defined in code: Halqa\'s share of the fees actually collected, less the running cost of '
          'each payment taken, less points and fee waivers issued on that circle at 1 point = Rs 1, less anything Halqa '
          'itself bore on a default', 'new lib/host-commission.ts', 'Claude', 'P2', 2),
        I('Commission floored at zero: a circle that made Halqa nothing pays the host nothing, and no commission is ever '
          'negative', 'new lib/host-commission.ts', 'Claude', 'P2'),
        I('Commission calculated only when the circle closes with every member collected and no arrears open',
          'new lib/host-commission.ts', 'Claude', 'P2'),
        I('The host chooses points or cash; cash is paid by the bank to the host\'s account, points through the points '
          'ledger at 1 point = Rs 1 (5 October)', 'new page', 'Claude', 'P2'),
        I('Worked example shown to the host before they create a circle: on 12 members at Rs 10,000 a month the circle '
          'earns Halqa about Rs 7,200 and the host about Rs 720', 'content', 'Claude', 'P2'),
        I('Running estimate of the commission shown during the circle, marked as an estimate', 'new page', 'Claude',
          'P2'),
        I('Commission statement for the host: fees collected, costs deducted, profit and the 10 per cent',
          'new page', 'Claude', 'P2'),
        I('Commission recorded as a cost of the circle in the business model, so the Rs 50 contribution a member a '
          'month is restated net of it', 'documents', 'Claude', 'P1'),
        I('Tax treatment of a host\'s commission confirmed, and withholding applied if it is due', 'tax', 'Tax adviser',
          'P2'),
        I('Commission terms in the host agreement, including that it is discretionary on a circle that ends early',
          'legal', 'Counsel', 'P2'),
        I('A host may not take commission on a circle in which they themselves defaulted', 'new lib/host-commission.ts',
          'Claude', 'P2'),
        I('Controls against a host creating circles of friends purely to earn commission: limits per host and a review '
          'of circles that fail early', 'new lib/host-commission.ts', 'Claude', 'P2'),
        I('Tests for the profit formula at a clean circle, a circle with a default and a circle with heavy points '
          'issuance', 'tests', 'Claude', 'P2'),
    ]
    host_elig = [
        I('To create a circle a member needs one of: a good score with substantial proof; two clean known committees; or '
          'the security of AQ3 (5 October)', 'routes/committees.ts', 'Claude', 'P1', 2),
        I('Remove the hosting gate of a score of 700 or more, which cannot stand while no score counts as good',
          'lib/score-bands.ts', 'Claude', 'P1'),
        I('The host route is shown to a member who does not yet qualify, with what is missing', 'new page', 'Claude',
          'P2'),
        I('Security pledged to qualify as a host is tested against the pot of the circle being created, with the same '
          '10 per cent relaxation', 'new lib/security.ts', 'Claude', 'P1'),
        I('Tests for each of the three host routes, and for refusal when none is met', 'tests', 'Claude', 'P1'),
    ]
    speed = [
        I('Account opening must complete in under ten minutes, measured from the welcome screen to a verified account '
          '(chairman, 5 October)', 'app', 'Claude', 'P0'),
        I('MEASURED 5 OCTOBER: twenty one screens stand between the welcome screen and a verified account, which does '
          'not fit ten minutes even when nothing goes wrong. The steps below are the budget that does',
          'review', 'Claude', 'P0'),
    ]
    speed += [I('Time budget, %s: %d seconds (%s)' % (name, secs, note), 'app', 'Claude', 'P1')
              for name, secs, note in BUDGET]
    speed += [I('Move %s off account opening and into %s, since it is not needed to hold an account' % (name, where),
                'app', 'Claude', 'P0', 2) for name, where in MOVED]
    speed += [
        I('Total budget of the steps above is 535 seconds, just under nine minutes, leaving a minute for the member to '
          'think; any new step on this path must take time from another', 'review', 'Claude', 'P1'),
        I('Time to open an account measured in the application and reported, with the slowest step named', 'analytics',
          'Claude', 'P1'),
        I('Alert when the median time to open an account passes eight minutes', 'monitoring', 'Claude', 'P2'),
        I('Fields read from the CNIC rather than typed again: name, date of birth, CNIC number and expiry',
          'new lib/cnic-read.ts', 'Claude', 'P1', 2),
        I('Every screen on the path loads in under one second on a low end handset over a third generation connection',
          'app', 'Claude', 'P1'),
        I('The bank\'s own account opening journey timed with the bank, and shortened where the bank allows', 'bank',
          'Bank', 'P1'),
        I('A member who abandons the journey resumes where they left off, with nothing typed twice', 'app', 'Claude',
          'P1'),
        I('End to end test that walks the whole path and fails if it exceeds ten minutes of scripted interaction',
          'tests', 'Claude', 'P1', 2),
    ]
    return section('AQ', 'Eligibility, Security, Host Pay and Speed', [
        sub('AQ1', 'Income without the Wait', income, 'The two month observation stops being the normal route (5 '
                                                      'October). Items 396, 471 and 962 are rewritten in place.'),
        sub('AQ2', 'Seat Eligibility', seats, 'The blanket quarantine of items 475 and 920 is replaced by a matrix of '
                                              'real bureau history and score.'),
        sub('AQ3', 'Security in Place of Credit History', sec, 'Where the pot is recoverable from security the member '
                                                               'holds, no credit history is required. The money stays '
                                                               'in the member\'s own account, held by the bank, and '
                                                               'earns the bank\'s profit throughout.'),
        sub('AQ4', 'Host Commission', host_pay, 'Ten per cent of the profit the circle made for Halqa, paid when the '
                                                'circle closes.'),
        sub('AQ5', 'Host Eligibility', host_elig),
        sub('AQ6', 'Ten Minutes to an Account', speed, 'The chairman\'s limit, and the measurement that shows the '
                                                       'journey does not meet it today.'),
    ], 'The chairman\'s ruling of 5 October 2026. Most members are working adults, so waiting is designed out; what '
       'remains is a test of whether the pot is recoverable, by history or by security.', loop=11)
