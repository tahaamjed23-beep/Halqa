# -*- coding: utf-8 -*-
"""Maths 02: affordability for unknown circles, formal and informal."""
import sys, statistics
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import os
import docgen as D
from mcommon import rs, num, pct, ABOUT, formal, informal, glossary

CASH, TOTAL, LOAD, EXPO_M = 0.33, 0.40, 0.40, 12
GRADE = {'A': 0.9, 'B': 1.0, 'C': 1.2, 'D': 1.5, 'Unrated': 1.1}
KAPPA = 0.5


def weight(j, grade, rounds):
    return (1 + 0.15 * max(0, j - 3)) * GRADE[grade] * (1.05 if rounds >= 18 else 1.0)


def assess(Y, holdings, new, B=0.0):
    """holdings/new: dicts with c, n, k, grade. Mirrors lib/affordability.ts."""
    allc = holdings + [new]
    monthly = sum(h['c'] for h in allc)
    res = {'T1': monthly <= CASH * Y, 'T2': monthly + B <= TOTAL * Y}
    lenient = len(holdings) < 3
    srt = sorted(allc, key=lambda h: h['c'])
    load = sum(weight(j, h['grade'], h['n']) * h['c'] / Y for j, h in enumerate(srt, 1))
    expo = sum(h['c'] * max(0, h['n'] - h['k']) for h in allc)
    res['T3'] = True if lenient else load <= LOAD
    res['T4'] = True if lenient else expo <= EXPO_M * Y
    head = max(0.0, min(CASH * Y - monthly, TOTAL * Y - monthly - B))
    return res, head, load, expo, lenient


# Example A and B: salaried member
salary = [58500, 59000, 60000]
YvA = statistics.median(salary)
YA = min(60000, YvA)
newA = dict(c=10000, n=12, k=10, grade='Unrated')
rA, hA, _, _, _ = assess(YA, [], newA)
rB, hB, _, _, _ = assess(YA, [], newA, B=12000)
# Example C: fourth circle
YC = 80000
holdC = [dict(c=3000, n=12, k=2, grade='A'), dict(c=4000, n=12, k=6, grade='B'), dict(c=5000, n=20, k=3, grade='C')]
newC = dict(c=6000, n=12, k=4, grade='B')
rC, hC, loadC, expoC, lenC = assess(YC, holdC, newC)
# Example D: Hyper Option 1, daily earner
W = 16000
YvD = KAPPA * 30 / 7 * W
YD = min(40000, YvD)
hyper = dict(c=13500, n=50, k=1, grade='Unrated')
rD, hD, _, _, _ = assess(YD, [], hyper)
need_Y = 13500 / CASH
need_W = need_Y * 7 / 30 / KAPPA
need_W07 = need_Y * 7 / 30 / 0.7
floor_week = 1000 * 5
assert rA['T1'] and rA['T2'] and rB['T2'] and not rD['T1'] and rC['T3'] and rC['T4'] and not lenC

TICK = lambda ok: 'Passes' if ok else 'Fails'

# ------------------------------------------------------------------ formal
f = []
f.append('<h2>1. Halqa, and where this test applies</h2>' + ABOUT + D.para(
    'This document sets out the test that decides whether a member can afford an unknown committee, including '
    'Hyper. It does not apply to known committees, where members are admitted by a host who knows them and bound by the '
    'mutual guarantee. The test is deliberately lenient about one committee a member can plainly pay, and progressively '
    'stricter about holding many at once, because that is where members get into difficulty.'))
f.append('<h2>2. Inputs</h2>' + D.table([
    ['Symbol', 'Input', 'Source'],
    ['Y<sub>d</sub>', 'Declared net monthly income', 'The member, at onboarding'],
    ['Y<sub>v</sub>', 'Verified monthly income', 'The income account, under the Income Account Verification model (HQ-MF-03)'],
    ['B', 'Monthly repayments on other loans', 'The member&rsquo;s TASDEEQ report, obtained on the member&rsquo;s instruction'],
    ['c<sub>i</sub>, n<sub>i</sub>, k<sub>i</sub>', 'Instalment, rounds and seat of each committee held', 'Halqa&rsquo;s own records'],
    ['g<sub>i</sub>', 'Health grade of each circle, A to D', 'Halqa&rsquo;s circle risk engine'],
], widths=['16%', '40%', '44%']))
f.append('<h2>3. The income figure used</h2>'
         + D.formula('Y = min(Y<sub>d</sub>, Y<sub>v</sub>)', 'The lower of declared and verified income; a member with no verified income cannot join an unknown committee')
         + D.bullets([
             '<span class="term">Salaried member.</span> Y<sub>v</sub> is the median of the last three monthly salary credits.',
             '<span class="term">Daily earner.</span> Y<sub>v</sub> = &kappa; &times; (30 / 7) &times; W&#771;, where W&#771; is the median '
             'weekly income receipts over the last 8 weeks and &kappa; is the share of receipts counted as income. Receipts '
             'of a driver or shopkeeper include fuel and stock, so &kappa; starts at 0.5 and is recalibrated on observed defaults.',
         ]))
f.append('<h2>4. The five tests</h2>'
         + D.formula('T1 &nbsp; &Sigma;c<sub>i</sub> + c<sub>new</sub> &le; 0.33 Y', 'Committees alone, at most a third of income')
         + D.formula('T2 &nbsp; &Sigma;c<sub>i</sub> + c<sub>new</sub> + B &le; 0.40 Y', 'With other repayments, at most 40 per cent of income')
         + D.quote('The total monthly amortization payments of consumer financing facilities, as prescribed in paragraph 1 of the '
                   'regulation, should not exceed 40% of the net disposal income of the prospective borrower.',
                   'State Bank of Pakistan, BPRD Circular Letter No. 29 of 23 September 2021, amending Regulation R-3 of the Prudential Regulations for Consumer Financing')
         + D.formula('T3 &nbsp; &Sigma;<sub>j</sub> w<sub>j</sub> &times; c<sub>j</sub> / Y &le; 0.40, &nbsp; w<sub>j</sub> = [1 + 0.15 &times; max(0, j &minus; 3)] &times; g<sub>j</sub> &times; d<sub>j</sub>',
                     'From the fourth committee: the weighted load, committees sorted smallest first')
         + D.table([['Weight', 'Values']] + [
             ['g, circle grade', 'A 0.9, B 1.0, C 1.2, D 1.5, unrated 1.1'],
             ['d, duration', '1.05 for a circle of 18 rounds or more, otherwise 1.0'],
             ['Concurrency', 'Nothing extra for the first three committees, then 15 per cent more for each one after'],
         ], widths=['24%', '76%'])
         + D.formula('T4 &nbsp; &Sigma; c<sub>i</sub> &times; (n<sub>i</sub> &minus; k<sub>i</sub>) &le; 12 Y', 'From the fourth committee: total forward liability at most a year of income')
         + D.bullets(['<span class="term">T5, concurrency.</span> Up to six committees with verified income. A host may run '
                      'two circles until proven, then five.',
                      '<span class="term">Hyper.</span> The new instalment is the monthly commitment: %s on Option 1 and %s on '
                      'Option 2. One Hyper circle at a time.' % (rs(13500), rs(13000)),
                      '<span class="term">Output.</span> A verdict with its reasons, and the headroom a member could still commit.'])
         + D.formula('Headroom = max(0, min(0.33 Y &minus; &Sigma;c, 0.40 Y &minus; &Sigma;c &minus; B))'))
f.append('<h2>5. Worked examples</h2>' + D.table([
    ['Case', 'Figures', 'Result'],
    ['A. Salaried, joining a 12 &times; Rs 10,000 unknown circle',
     'Salary credits %s, %s, %s; Y = %s; no other loans' % (rs(salary[0]), rs(salary[1]), rs(salary[2]), rs(YA)),
     '%s T1 and T2. Headroom %s' % (TICK(rA['T1'] and rA['T2']), rs(hA))],
    ['B. As A, with a TASDEEQ reported loan of %s a month' % rs(12000), 'T2: %s + %s = %s against a cap of %s' % (rs(10000), rs(12000), rs(22000), rs(TOTAL * YA)),
     '%s. Headroom falls to %s' % (TICK(rB['T2']), rs(hB))],
    ['C. Fourth committee, income %s' % rs(YC), 'Weighted load %s; forward liability %s against %s' % (pct(loadC, 1), rs(expoC), rs(EXPO_M * YC)),
     '%s all tests. Headroom %s' % (TICK(all(rC.values())), rs(hC))],
    ['D. Hyper Option 1, daily earner', 'Weekly receipts %s; Y<sub>v</sub> = 0.5 &times; 30/7 &times; %s = %s; declared %s'
     % (rs(W), num(W), rs(YvD), rs(40000)),
     '%s T1: %s is above a third of %s' % (TICK(rD['T1']), rs(13500), rs(YD))],
], widths=['30%', '46%', '24%'])
    + D.para('Case D shows the scale of Hyper. To carry Option 1 a member needs verified income of at least %s a month, '
             'which for a daily earner at &kappa; = 0.5 means weekly receipts of %s, about %s a day over seven days. The '
             'eligibility floor of Rs 1,000 on five days a week, %s a week, proves that daily income exists; it does not '
             'prove the member can carry Rs 450 a day. Both tests apply. At &kappa; = 0.7 the receipts needed fall to %s a week.'
             % (rs(need_Y), rs(need_W), rs(need_W / 7), rs(floor_week), rs(need_W07))))
f.append('<h2>6. Keeping the figures honest</h2>' + D.bullets([
    'Income is re-verified every 90 days and before each new unknown committee.',
    'A declared pay day contradicted by the days on which collections succeed removes the verification and costs the member 15 points.',
    'Loans elsewhere appear through the TASDEEQ report; committees held elsewhere cannot be seen, which is one reason the '
    'committee cap is a third of income rather than 40 per cent.',
    'Good history opens more seats and circles. It never raises the money cap; only new income evidence does.',
]))
f.append('<h2>7. Technical Process</h2>' + D.table([
    ['Input', 'Source'],
    ['Verified income', 'The income account engine (HQ-MF-03)'],
    ['Committees held', 'Halqa&rsquo;s circle records, as a monthly amount; Hyper counted at 30 days a month'],
    ['Other loan repayments', 'The TASDEEQ report released on the member&rsquo;s instruction: instalments of open facilities'],
    ['Exposure', 'Halqa&rsquo;s records: amounts still owed after collecting, across all circles'],
    ['Number of committees held', 'Halqa&rsquo;s circle records'],
], widths=['30%', '70%']) + D.steps([
    'The test runs when a member asks to join an unknown committee or Hyper, and again whenever the income is verified again or '
    'a new report is read.',
    'The five tests are computed; the binding test is the one with the least room.',
    'The result is returned as pass or fail, the room left in rupees, and a reason code for each test that failed, and is shown '
    'to the member.',
    'A decision record is stored with every input and the version of the rules.',
    'Where a credit report contributed to a refusal, the notice required by section 31 of the Credit Bureaus Act is generated '
    'from the same record.',
]))
f.append('<h2>8. Model Surface</h2>' + D.para(
    'The room for a new instalment depends on income, on loan repayments and on the committees already held. The surface shows '
    'the room by income and loan repayments for a member already holding Rs 5,000 a month in committees, coloured by the test '
    'that sets the limit.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'affordability.png'), 'Room for a new instalment by verified income and other loan repayments, with Rs 5,000 a month already '
               'held in committees. Blue: limited by the one third test. Orange: limited by the 40 per cent test with loans. Red: '
               'no room, so the member cannot join.', '92%'))
f.append(D.summary(
    'Before a member joins an unknown committee, Halqa checks their real income from the account it arrives in. All their '
    'committees together must stay under a third of that income, and with their other loans under 40 per cent, the same '
    'limit the State Bank sets for banks. From the fourth committee the rules get stricter. Hyper needs a steady income '
    'of about Rs 41,000 a month, not only the Rs 1,000 a day needed to qualify.'))
formal('02 Affordability Model.pdf', 'Affordability for Unknown Committees: Model',
       'The test that decides whether a member can afford an unknown committee or Hyper, and how much more they could take on.',
       'HQ-MF-02', 'The payment partner, lenders and Mr Akif Saeed', ''.join(f), running='Affordability Model')

# ------------------------------------------------------------------ informal
i = []
i.append(D.para('This explains how Halqa decides whether someone can afford an unknown committee. Known '
                'committees skip this test because the host knows the members.'))
i.append('<h2>1. The words used</h2>' + glossary([
    ['Net income', 'Money a person actually receives each month after deductions'],
    ['Verified income', 'Income Halqa has seen arrive in the member&rsquo;s own account, not only what they typed in'],
    ['Instalment', 'What a member pays into a committee each period'],
    ['Debt burden', 'All repayments together as a share of income'],
    ['Forward liability', 'What a member still owes after collecting the pot'],
    ['Headroom', 'How much more a member could commit each month and still pass'],
]))
i.append('<h2>2. The income Halqa believes</h2>' + D.bullets([
    'Halqa takes the lower of what the member says they earn and what their account shows.',
    'For a salaried member, it is the middle of their last three salary payments.',
    'For a daily earner, such as a rickshaw driver, only half of what comes in counts as income, because part of it pays '
    'for fuel or stock. The middle week of the last eight is used.',
]))
i.append('<h2>3. The rules</h2>' + D.bullets([
    'All committees together must be no more than a third of income.',
    'Committees plus other loan repayments must be no more than 40 per cent of income. The State Bank uses the same 40 per cent for banks.',
    'From a fourth committee, each extra committee counts for a bit more, and total money still owed cannot pass one year of income.',
    'Only six committees at a time, even with good income.',
]))
i.append('<h2>4. Examples</h2>' + D.bullets([
    'Salary of about Rs 59,000 and no loans: a Rs 10,000 committee passes, with Rs 9,470 of room left.',
    'Same person with a Rs 12,000 loan: still passes, but only Rs 1,600 of room is left.',
    'A driver whose account shows Rs 16,000 a week: Halqa counts about Rs 34,286 a month. Hyper Option 1 needs Rs 13,500 '
    'a month, more than a third of that, so the driver does not qualify yet.',
]))
i.append('<h2>5. Why Hyper needs more than Rs 1,000 a day</h2>' + D.para(
    'Rs 1,000 on five days a week proves someone earns daily. But Hyper takes Rs 450 every day. To keep that under a third '
    'of income, a daily earner needs about Rs 19,000 a week coming in, roughly Rs 2,700 a day. So the Rs 1,000 rule '
    'decides who may apply, and this test decides who can actually afford it.'))
i.append('<h2>6. Model Surface</h2>' + D.para(
    'The picture shows how much more a member could take on, for every income and every level of other loan repayments, when '
    'they already pay Rs 5,000 a month into committees. Higher income raises the surface; loans pull it down. The colour shows '
    'which rule stops the member first.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'affordability.png'), 'Room for a new instalment. Blue: the one third rule decides. Orange: the 40 per cent rule with loans '
               'decides. Red: no room.', '92%'))
i.append('<h2>7. Process</h2>' + D.steps([
    'When a member asks to join, the system takes their verified income, their committees on Halqa and the loan repayments in '
    'their credit report.',
    'It runs the five tests and finds the one with the least room.',
    'It tells the member yes or no, how much room is left, and the reason for any no.',
    'It saves the decision and its inputs, so it can be explained later.',
]))
i.append(D.summary(
    'Halqa only lets someone join an unknown committee if their verified income can carry it. Committees must stay '
    'under a third of income, and all repayments under 40 per cent. Hyper needs about Rs 41,000 a month of real income, '
    'so the Rs 1,000 a day rule is only the first gate.'))
informal('02 Affordability Explained.pdf', 'Affordability, Explained',
         'How Halqa decides whether someone can afford an unknown committee.', 'HQ-MI-02', ''.join(i),
         running='Affordability Explained')
print('A head', hA, 'B head', hB, 'C load', round(loadC, 4), 'expo', expoC, 'head', hC, 'D Y', round(YD), 'needY', round(need_Y), 'needW', round(need_W), round(need_W07))
