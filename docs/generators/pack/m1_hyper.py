# -*- coding: utf-8 -*-
"""Maths 01: Hyper default threshold, formal and informal."""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import os
import docgen as D
from mcommon import rs, num, pct, ABOUT, formal, informal, glossary

# ------------------------------------------------------------------ the numbers
O1 = dict(name='Option 1', c=300.0, N=50, m=8, n=400)
O2 = dict(name='Option 2', c=8666.6666667 / 26, N=26, m=15, n=390)
for o in (O1, O2):
    o['P'] = o['c'] * o['N']
    o['L'] = lambda t, o=o: o['c'] * (o['N'] - t)
    o['EL_exact'] = o['c'] * (o['N'] - 1) / 2
    o['EL_plan'] = o['P'] / 2
assert round(O1['P']) == 15000 and O1['m'] * O1['N'] == O1['n']
assert round(O2['P'], 2) == 8666.67 and O2['m'] * O2['N'] == O2['n']

C_COVER = 8 * O1['P']
W = dict(sev=0.45, bre=0.20, beh=0.15, per=0.10, tim=0.10)


def stress(d, D_, tbar, A, R, o=O1, C=C_COVER):
    E = D_ * o['c'] * (o['N'] - tbar)
    f1 = min(1.0, E / (C + o['P']))
    f2 = min(1.0, D_ / (C / o['P']))
    f3 = min(1.0, R / float(o['n']))
    f4 = min(1.0, A / 6.0)
    f5 = d / float(o['N'])
    S = 100 * (W['sev'] * f1 + W['bre'] * f2 + W['beh'] * f3 + W['per'] * f4 + W['tim'] * f5)
    band = 'Green' if S <= 33 else ('Amber' if S <= 66 else 'Red')
    return E, (f1, f2, f3, f4, f5), round(S, 1), band


PATH = [(5, 0, 0, 0, 4), (12, 1, 3, 1, 14), (20, 3, 8, 2, 30), (30, 6, 14, 3, 52), (38, 9, 20, 4, 74), (45, 13, 26, 5, 96)]
ACTION = {5: 'Normal operation, reminders only', 12: 'Normal operation, case tracked', 20: 'Host notified, operator put on notice',
          30: 'New joins blocked, arrears settled first', 38: 'Claim prepared, roster informed',
          45: 'Next day not opened, restitution arithmetic published'}
PATH_ROWS = []
for d, D_, tbar, A, R in PATH:
    E, f, S, band = stress(d, D_, tbar, A, R)
    PATH_ROWS.append((d, D_, tbar, A, R, E, f, S, band))
# the Hyper document publishes these indices; the model must reproduce them
assert [r[7] for r in PATH_ROWS] == [1.2, 11.8, 28.6, 49.5, 64.0, 72.1], [r[7] for r in PATH_ROWS]

RATES = [0.01, 0.10, 0.30, 0.50, 1.00]


def loss(o, p):
    return o['n'] * p * o['EL_plan']


def cover_day(o, p):
    return p * o['EL_plan'] / o['N']


# ------------------------------------------------------------------ formal
f = []
f.append('<h2>1. Halqa and the Hyper committee</h2>' + ABOUT + D.para(
    'Hyper runs in two fixed configurations. Every daily payment splits at source into a contribution to the pot, a '
    'takaful contribution to a participants&rsquo; risk fund held by a licensed operator, and Halqa&rsquo;s fee. Each '
    'day&rsquo;s payers pay that day&rsquo;s collectors directly, so no party holds a pool. This document sets out the '
    'arithmetic that decides whether a circle can pay every member, the cover it needs, and the index that warns the '
    'host before it cannot.'))
f.append('<h2>2. Notation</h2>' + D.table([
    ['Symbol', 'Meaning', 'Option 1', 'Option 2'],
    ['n', 'Members on the roster', '400', '390'],
    ['N', 'Collection days in the cycle', '50', '26 (Sundays excluded)'],
    ['m', 'Members collecting each day', '8', '15'],
    ['c', 'Daily contribution into the pot', rs(O1['c']), rs(O2['c'], 2)],
    ['P', 'Pot, collected once', rs(O1['P']), rs(O2['P'], 2)],
    ['t', 'The day on which a member collects', '1 to 50', '1 to 26'],
    ['p', 'Share of members who default after collecting', '', ''],
    ['C', 'Cover limit written by the takaful operator', '', ''],
    ['E', 'Unrecovered exposure from defaults after collection', '', ''],
], widths=['10%', '50%', '20%', '20%']))
f.append('<h2>3. The two identities</h2>' + D.para(
    'In a rotating committee every member pays in exactly what they collect, so money paid in must equal money paid out '
    'every day. Two identities follow, and both are asserted in code at creation; a configuration that breaks either is refused.')
    + D.formula('P = c &times; N &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; n = m &times; N', 'Identity 1 (pot) and identity 2 (roster)')
    + D.table([
        ['Check', 'Option 1', 'Option 2'],
        ['Identity 1', '300 &times; 50 = 15,000', '333.33 &times; 26 = 8,666.67'],
        ['Identity 2', '8 &times; 50 = 400', '15 &times; 26 = 390'],
        ['Paid in each day, contributions only', rs(O1['c'] * (O1['n'] - O1['m']) + O1['c'] * O1['m']), rs(O2['c'] * O2['n'])],
        ['Paid out each day', rs(O1['m'] * O1['P']), rs(O2['m'] * O2['P'])],
    ], numeric=(1, 2), widths=['44%', '28%', '28%']))
f.append('<h2>4. Forward liability</h2>' + D.para(
    'A member who collects on day t has paid t contributions and still owes one for each remaining day. That remaining '
    'obligation is the forward liability, the amount the circle would lose if the member stopped paying immediately after collecting.')
    + D.formula('L(t) = c &times; (N &minus; t)', 'Forward liability of a member who collects on day t')
    + D.table([['Collection day, Option 1', 'Paid by then', 'Still owed, L(t)', 'Share of the pot']]
              + [[str(t), rs(O1['c'] * t), rs(O1['L'](t)), pct(O1['L'](t) / O1['P'], 0)] for t in (1, 10, 25, 40, 50)],
              numeric=(1, 2, 3))
    + D.para('On Option 2 the same line runs from %s on day 1 to nil on day 26.' % rs(O2['L'](1), 2)))
f.append('<h2>5. Five results</h2>'
         + '<h3>5.1 Arrears before collection recover themselves</h3>' + D.para(
             'A member who has missed j contributions by their own collection day receives P &minus; j &times; c, and the j '
             'missed contributions are paid that day to the members they left short. A member who missed every day receives '
             'nothing. Arrears before collection are a timing gap, not a loss.')
         + D.formula('Received on day t = P &minus; j &times; c')
         + '<h3>5.2 The only loss is default after collection</h3>' + D.para(
             'A member who collects on day t and then stops owes L(t), and there is no pot of theirs left to recover it from. '
             'The worst case is day 1: %s on Option 1, %s of the pot.' % (rs(O1['L'](1)), pct(O1['L'](1) / O1['P'], 0)))
         + '<h3>5.3 Expected loss, and the cover it requires</h3>' + D.para(
             'If defaulters are spread evenly across collection days, the average forward liability is exactly c(N &minus; 1)/2: '
             '%s on Option 1 and %s on Option 2. Halqa plans with half a pot, P/2 (%s and %s), which is slightly higher and '
             'therefore conservative.' % (rs(O1['EL_exact']), rs(O2['EL_exact'], 2), rs(O1['EL_plan']), rs(O2['EL_plan'], 2)))
         + D.formula('Expected loss per cycle = n &times; p &times; P/2 &nbsp;&nbsp;&nbsp;&nbsp; Cover per member per day = p &times; (P/2) / N')
         + D.table([['Default rate p', 'Option 1 loss', 'Option 1 cover a day', 'Option 2 loss', 'Option 2 cover a day']]
                   + [[pct(p, 0), rs(loss(O1, p)), rs(cover_day(O1, p), 2), rs(loss(O2, p)), rs(cover_day(O2, p), 2)] for p in RATES],
                   numeric=(1, 2, 3, 4))
         + D.para('As a share of cycle value, expected loss is half the default rate on either option. At a 100 per cent '
                  'default rate the cover required, %s a day on Option 1, equals the whole daily margin of takaful '
                  'contribution and fee together. The configuration prices cover for a 50 per cent rate: Rs 75 a day, '
                  'building a fund of %s over the cycle.' % (rs(cover_day(O1, 1.0)), rs(400 * 75 * 50)))
         + '<h3>5.4 The hard stop</h3>' + D.para(
             'Unrecovered exposure on day d is the sum of forward liability for every member who collected and then stopped, '
             'less anything since recovered. The circle cannot complete once E exceeds the cover limit C, because the pots '
             'still owed would exceed the contributions still due. No further day opens until E is brought below C.')
         + D.formula('E(d) = &Sigma; c &times; (N &minus; t<sub>i</sub>) &minus; recovered(d), over every member i who collected and stopped; stop when E &gt; C')
         + '<h3>5.5 Daily shortfall</h3>' + D.para(
             'Each missed payment leaves one collector short by c. Because P = c &times; N, exactly N missed payments equal one '
             'pot: 50 on Option 1 and 26 on Option 2. One missed payment is %s of a day&rsquo;s outflow on Option 1.'
             % pct(O1['c'] / (O1['m'] * O1['P']), 2)))
f.append('<h2>6. The stress index</h2>' + D.para(
    'A score from 0 to 100, recomputed at the close of every day and shown to the host. Five measures are each scaled to '
    'between 0 and 1 and weighted.')
    + D.formula('S = 100 &times; (0.45 f<sub>1</sub> + 0.20 f<sub>2</sub> + 0.15 f<sub>3</sub> + 0.10 f<sub>4</sub> + 0.10 f<sub>5</sub>)')
    + D.table([
        ['Measure', 'Definition', 'Weight'],
        ['f<sub>1</sub> Severity', 'min(1, E / (C + P)): exposure against cover plus one pot', '45%'],
        ['f<sub>2</sub> Breadth', 'min(1, D / (C / P)): defaults after collection against the number of pots cover absorbs', '20%'],
        ['f<sub>3</sub> Behaviour', 'min(1, R / n): share of the roster with a prior late payment', '15%'],
        ['f<sub>4</sub> Persistence', 'min(1, A / 6): age of outstanding arrears in 12 hour periods, capped at 6', '10%'],
        ['f<sub>5</sub> Timing', 'd / N: the day reached out of the cycle', '10%'],
    ], numeric=(2,), widths=['18%', '70%', '12%'])
    + D.table([
        ['Band', 'Score', 'Action'],
        ['Green', '0 to 33', 'Normal operation. Reminders only. Cases tracked'],
        ['Amber', '34 to 66', 'New joins blocked. Host notified. Arrears settled first on each collection day. Operator put on notice'],
        ['Red', '67 to 100', 'Next day not opened. Claim prepared. Restitution arithmetic published. Wound down if not cleared in two days'],
        ['Hard stop', 'any', 'Applies whenever E exceeds C, whatever the score'],
    ], widths=['14%', '14%', '72%']))
f.append('<h2>7. Worked path of an Option 1 circle under stress</h2>' + D.para(
    'Cover is set at 8 pots, %s, one day of outflow. D is the number of defaults after collection, t&#772; their average '
    'collection day, A the age of arrears in 12 hour periods and R the members with a prior late payment.' % rs(C_COVER))
    + D.table([['Day', 'D', 't&#772;', 'A', 'R', 'E', 'f<sub>1</sub>', 'f<sub>2</sub>', 'f<sub>3</sub>', 'f<sub>4</sub>', 'f<sub>5</sub>', 'S', 'Band']]
              + [[str(d), str(D_), str(tb), str(A), str(R), rs(E), num(fs[0], 3), num(fs[1], 3), num(fs[2], 3), num(fs[3], 3),
                  num(fs[4], 2), num(S, 1), band] for d, D_, tb, A, R, E, fs, S, band in PATH_ROWS],
              numeric=tuple(range(0, 12)))
    + D.table([['Day', 'Action taken']] + [[str(r[0]), ACTION[r[0]]] for r in PATH_ROWS], widths=['12%', '88%']))
f.append('<h2>8. Technical Process</h2>' + D.table([
    ['Input', 'Source', 'Refreshed'],
    ['Roster, seats and collection days', 'The circle record', 'At formation'],
    ['Payments and misses', 'The partner&rsquo;s signed webhooks, through the ledger and the arrears records', 'Every debit'],
    ['Defaults after collection and their collection days', 'The arrears engine: a member who has collected and then misses three consecutive days after grace', 'Daily'],
    ['Cover limit C', 'The takaful policy record agreed with the operator', 'At formation and on any change'],
    ['Members with a prior late payment', 'The standing history', 'Daily'],
], widths=['30%', '50%', '20%']) + D.steps([
    'When the grace window of the day closes, the job reads the arrears records and computes E(d): the forward liability of every '
    'member who collected and stopped, less anything since recovered.',
    'It computes the five measures and S, and assigns the band.',
    'It applies the action: amber blocks new joins, red keeps the next day closed, and the hard stop applies whenever E exceeds C.',
    'It writes the day&rsquo;s stress record, with every input, the result, the parameter version and the action taken, to an '
    'append only table.',
    'It notifies the host and, from amber, the operator; at red it publishes the restitution arithmetic to the roster.',
]) + D.para('The weights and thresholds are versioned parameters. A change applies only to circles formed after it, so no running '
            'circle has its rules changed part way.'))
f.append('<h2>9. Model Surface</h2>' + D.para(
    'The stress index depends on five measures at once, so it is shown as a surface over the two that move most: the day reached '
    'and the number of members who collected and then stopped. The other measures are set as in the worked path: defaulters '
    'collected on average at half the day reached, arrears are aged at half the number of defaults, and members with a prior '
    'late payment are twice the day reached.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'hyper-stress.png'), 'Stress index of an Option 1 circle by day and by defaults after collection. Green, 0 to 33: normal '
               'operation. Amber, 34 to 66: new joins blocked. Red, 67 to 100: the next day is not opened.', '92%'))
f.append(D.summary(
    'A Hyper circle only loses money when a member takes the pot and then stops paying. Missing payments before a turn '
    'is not a loss, because those payments are taken out of that member&rsquo;s own pot. On average each such default '
    'costs about half a pot, so the cover needed is easy to work out for any default rate. A score from 0 to 100 warns '
    'the host early, and the circle stops before it can promise money that does not exist.'))

formal('01 Hyper Default Threshold Model.pdf', 'Hyper Committee: Default Threshold Model',
       'The arithmetic that decides whether a daily circle can pay every member, the cover it needs, and the index that '
       'warns the host before it cannot.', 'HQ-MF-01', 'Takaful operators, the payment partner and Mr Akif Saeed',
       ''.join(f), running='Hyper Default Threshold Model')

# ------------------------------------------------------------------ informal
i = []
i.append(D.para('This explains how a Hyper circle can go wrong, how much money it can lose, and how Halqa sees trouble '
                'coming. Every number uses Option 1: 400 members, 50 days, Rs 450 a day, of which Rs 300 goes into the '
                'pot, and a pot of Rs 15,000.'))
i.append('<h2>1. The words used</h2>' + glossary([
    ['Pot', 'The Rs 15,000 a member collects once, on their day'],
    ['Contribution', 'The Rs 300 a day that goes into the pot. The other Rs 150 is takaful and Halqa&rsquo;s fee'],
    ['Forward liability', 'How much a member still owes after collecting. Collecting on day 10 means 40 days are still owed'],
    ['Default after collection', 'Taking the pot and then stopping. This is the only way the circle loses money'],
    ['Arrears', 'Payments a member has missed but still owes'],
    ['Exposure', 'The total still owed by everyone who took the pot and stopped'],
    ['Cover', 'The takaful fund that pays members left short. The limit it will pay is written by the operator'],
    ['Default rate', 'The share of members who take the pot and stop. 5 per cent means 20 of 400'],
]))
i.append('<h2>2. Two rules that keep it balanced</h2>' + D.bullets([
    'Pot = daily contribution &times; days: Rs 300 &times; 50 = Rs 15,000. Everyone pays in exactly what they take out.',
    'Members = collectors a day &times; days: 8 &times; 50 = 400. Every day is funded by that day&rsquo;s payers.',
    'If either rule breaks, some day would need money from outside, so the app refuses to create that circle.',
]))
i.append('<h2>3. What a member still owes after collecting</h2>' + D.para(
    'The earlier a member collects, the more they still owe. This is why early seats go only to members with a good record.')
    + D.table([['Collects on day', 'Has paid', 'Still owes', 'Share of the pot']]
              + [[str(t), rs(300 * t), rs(O1['L'](t)), pct(O1['L'](t) / 15000, 0)] for t in (1, 10, 25, 40, 50)], numeric=(1, 2, 3)))
i.append('<h2>4. Missing payments before a turn is not a loss</h2>' + D.bullets([
    'Example: a member misses 3 days, then collects on day 20. They receive Rs 15,000 &minus; 3 &times; Rs 300 = Rs 14,100.',
    'The Rs 900 kept back goes straight to the members they left short. Nobody ends up losing.',
    'So the only real danger is a member who collects first and stops afterwards.',
]))
i.append('<h2>5. How much cover is needed</h2>' + D.bullets([
    'A member who collects on day 1 and disappears leaves Rs 14,700 unpaid. One who collects on day 50 leaves nothing.',
    'Spread over all days, the average is about half a pot, Rs 7,500. That is the planning figure for one default.',
    'So the loss for a cycle is members &times; default rate &times; half a pot. At 5 per cent: 400 &times; 0.05 &times; Rs 7,500 = Rs 150,000.',
    'Per member per day, the cover needed is Rs 150 &times; the default rate. At 50 per cent that is Rs 75, exactly the '
    'takaful part of each payment. The fund is built to survive half the roster defaulting.',
]) + D.table([['Default rate', 'Loss over the cycle', 'Cover needed a day']]
             + [[pct(p, 0), rs(loss(O1, p)), rs(cover_day(O1, p), 2)] for p in RATES], numeric=(1, 2)))
i.append('<h2>6. When the circle must stop</h2>' + D.para(
    'Exposure is everything still owed by members who took the pot and stopped. Once it is bigger than the cover limit, '
    'the circle would be promising pots it cannot pay, so no new day opens until it is back under the limit.'))
i.append('<h2>7. The stress index</h2>' + D.para(
    'A health score from 0 to 100 that the host sees every day. Higher is worse. It looks at five things:')
    + D.bullets([
        'How big the exposure is compared with the cover (45 per cent of the score).',
        'How many members have taken the pot and stopped (20 per cent).',
        'How many members have ever been late (15 per cent).',
        'How long unpaid money has been outstanding (10 per cent).',
        'How far into the cycle the circle is (10 per cent).',
    ])
    + D.table([['Day', 'Stopped after collecting', 'Exposure', 'Score', 'Colour', 'What happens']]
              + [[str(r[0]), str(r[1]), rs(r[5]), num(r[7], 1), r[8], ACTION[r[0]]] for r in PATH_ROWS], numeric=(1, 2, 3)))
i.append('<h2>8. Model Surface</h2>' + D.para(
    'The picture shows the health score for every day of the cycle and every number of members who took the pot and stopped. '
    'The flat green area is a healthy circle. As more members stop after collecting, the surface climbs into amber, where no one '
    'new may join, and then red, where the circle does not open the next day.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'hyper-stress.png'), 'Health score of an Option 1 circle. Green: normal. Amber: new joins blocked. Red: the next day is not opened.', '92%'))
i.append('<h2>9. Process</h2>' + D.steps([
    'Every evening, after the day&rsquo;s payments and the grace time, the system counts who has taken the pot and stopped paying.',
    'It works out how much they still owe and compares it with the cover limit.',
    'It works out the score, sets the colour and shows it to the host.',
    'If the colour is amber it stops new members joining; if red, or if the money owed passes the cover limit, it does not open the next day.',
    'Every result is saved, so the operator and the host can see exactly what happened and when.',
]))
i.append(D.summary(
    'A Hyper circle only loses money if someone takes the pot and then stops paying. Missed days before a turn are '
    'taken out of that person&rsquo;s own pot, so they do not count. Each real default costs about half a pot, the '
    'takaful fund is sized for half the members defaulting, and a daily score turns green, amber or red so the circle '
    'is stopped long before it runs out of money.'))

informal('01 Hyper Default Threshold Explained.pdf', 'Hyper Default Threshold, Explained',
         'How a daily circle can lose money, how much, and how Halqa sees it coming.',
         'HQ-MI-01', ''.join(i), running='Hyper Default Threshold Explained')
print('ok')
