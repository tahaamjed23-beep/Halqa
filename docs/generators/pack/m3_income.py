# -*- coding: utf-8 -*-
"""Maths 03: income account verification, formal and informal."""
import sys, statistics
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import os
import docgen as D
from mcommon import rs, num, pct, ABOUT, formal, informal, glossary

WTS = dict(rec=0.35, amt=0.25, day=0.20, nar=0.10, emp=0.10)


def dayd(a, b):
    d = abs(a - b)
    return min(d, 31 - d)


def salary_score(credits, declared_employer_match, narration_hit):
    """credits: list of (month_index, day_of_month, amount) from one remitter, last 4 months."""
    months = len({m for m, _, _ in credits})
    amts = [a for _, _, a in credits]
    days = [d for _, d, _ in credits]
    med_a, med_d = statistics.median(amts), statistics.median(days)
    f_rec = min(1.0, months / 4.0)
    f_amt = sum(1 for a in amts if abs(a - med_a) <= 0.15 * med_a) / len(amts)
    f_day = sum(1 for d in days if dayd(d, med_d) <= 3) / len(days)
    f = dict(rec=f_rec, amt=f_amt, day=f_day, nar=1.0 if narration_hit else 0.0, emp=1.0 if declared_employer_match else 0.0)
    S = sum(WTS[k] * f[k] for k in WTS)
    return S, f, med_a


A_CRED = [(1, 1, 58500), (2, 1, 59000), (3, 2, 60000), (4, 1, 59500)]
SA, FA, INC_A = salary_score(A_CRED, True, True)
B_CRED = [(1, 3, 41000), (3, 19, 25000), (4, 28, 52000)]
SB, FB, _ = salary_score(B_CRED, False, False)


def verdict(S):
    return 'Verified' if S >= 0.75 else ('Manual review' if S >= 0.50 else 'Not verified')


WEEKS_FAIL = [6, 5, 6, 6, 5, 4, 6, 6]
WEEKS_PASS = [6, 5, 6, 6, 5, 5, 6, 6]
assert verdict(SA) == 'Verified' and verdict(SB) == 'Not verified'

# ------------------------------------------------------------------ formal
f = []
f.append('<h2>1. Halqa, and what this model decides</h2>' + ABOUT + D.para(
    'Every member of an unknown committee, and every Hyper member, must name an income account: an account in their own '
    'name, at a bank or a wallet such as JazzCash, Easypaisa, NayaPay or SadaPay, into which their income arrives. The '
    'auto debit is taken from the member&rsquo;s wallet at the payment partner, which is either this account or is funded from it by standing instruction. This model decides whether the named account is the member&rsquo;s own, whether '
    'it receives their income, and, for Hyper, whether it receives at least Rs 1,000 on at least five days of '
    'every week.'))
f.append('<h2>2. Evidence</h2>' + D.table([
    ['Evidence', 'What it proves', 'When'],
    ['Title inquiry through the payment partner', 'The account&rsquo;s registered holder matches the name on the CNIC', 'Always'],
    ['Account statement, downloaded by the member from their bank or wallet', 'What arrives, from whom and when: 4 months for a salaried member, 8 weeks for Hyper', 'Always'],
    ['Payslip', 'Employer and net pay, checked against the salary credit', 'Salaried, optional'],
    ['Collection outcomes', 'The days on which money was present, from the auto debit itself: a 120 day window, at least 2 months', 'Once collections run'],
    ['Transaction history from the partner, with consent', 'Replaces the statement where the account is held at the partner', 'Where available'],
], widths=['32%', '48%', '20%']))
f.append('<h2>3. Integrity checks on a statement</h2>' + D.bullets([
    'Every line balances: opening balance plus credits minus debits equals the closing balance, line by line.',
    'Dates run in order with no gaps in the statement period, and the account number and title match the title inquiry.',
    'The file carries the issuing institution&rsquo;s own format and metadata, and has not been edited after issue.',
    'Any failed check sends the account to manual review; confirmed tampering refuses the account and is recorded against the member.',
]))
f.append('<h2>4. Which credits count as income</h2>' + D.table([
    ['Counted', 'Not counted'],
    ['Salary credits from an employer', 'Transfers from the member&rsquo;s own other accounts, identified by the same title'],
    ['Business receipts from customers', 'Reversals and refunds'],
    ['Payouts from platforms such as Careem, inDrive, Bykea and foodpanda', 'Loan disbursements, identified by the lender or the narration'],
    ['Transfers for goods or services', 'Committee pots received from Halqa circles'],
    ['', 'Round trips: 80 per cent or more sent back to the same counterparty within 24 hours'],
], widths=['50%', '50%']))
f.append('<h2>5. The salary pattern test</h2>' + D.para(
    'For each remitter who has paid the account in at least three of the last four calendar months, five measures are '
    'scored between 0 and 1 and weighted.')
    + D.formula('S = 0.35 f<sub>rec</sub> + 0.25 f<sub>amt</sub> + 0.20 f<sub>day</sub> + 0.10 f<sub>nar</sub> + 0.10 f<sub>emp</sub>')
    + D.table([
        ['Measure', 'Definition'],
        ['f<sub>rec</sub> Recurrence', 'Months with a credit from the remitter, divided by 4'],
        ['f<sub>amt</sub> Amount', 'Share of those credits within 15 per cent of their median amount'],
        ['f<sub>day</sub> Timing', 'Share within 3 days of the median day of the month, measured round the month end: '
                                   'd(a, b) = min(|a &minus; b|, 31 &minus; |a &minus; b|), so day 1 and day 29 are 3 apart'],
        ['f<sub>nar</sub> Narration', '1 if the narration contains SALARY, SAL, PAYROLL or the employer&rsquo;s name, otherwise 0'],
        ['f<sub>emp</sub> Employer', '1 if the remitter&rsquo;s name matches the declared employer with a similarity of 0.85 or more, otherwise 0'],
    ], widths=['24%', '76%'])
    + D.table([['Score S', 'Decision'], ['0.75 or more', 'Verified. Verified income is the median of the salary credits'],
               ['0.50 to 0.75', 'Manual review, with a payslip or the employer&rsquo;s confirmation'], ['Below 0.50', 'Not verified']],
              widths=['24%', '76%']))
f.append('<h2>6. The daily income test for Hyper</h2>'
         + D.formula('Q<sub>d</sub> = sum of counted credits on day d; &nbsp; day qualifies if Q<sub>d</sub> &ge; Rs 1,000; &nbsp; week qualifies if at least 5 days qualify')
         + D.bullets([
             'Weeks run Monday to Sunday. The account qualifies only if all of the last 8 weeks qualify.',
             'If one counterparty that is not an employer or a platform provides more than 60 per cent of counted credits, '
             'the account goes to manual review, since staged transfers look exactly like that.',
             'The median weekly total of counted credits is passed to the affordability model, which decides whether the '
             'member can carry Rs 450 or Rs 500 a day. The floor proves daily income exists; affordability is a separate test.',
         ]))
f.append('<h2>7. Worked examples</h2>' + D.table([
    ['Case', 'Evidence', 'Scores', 'Result'],
    ['A. Salaried', 'Four credits from ABC Textiles (Private) Limited: %s on days 1, 1, 2 and 1, narrated SALARY; declared employer ABC Textiles'
     % ', '.join(rs(a) for _, _, a in A_CRED),
     'rec %s, amt %s, day %s, nar %s, emp %s; S = %s' % tuple([num(FA[k], 2) for k in ('rec', 'amt', 'day', 'nar', 'emp')] + [num(SA, 2)]),
     '%s. Income %s' % (verdict(SA), rs(INC_A))],
    ['B. Irregular transfers', 'Three credits from one individual: %s, on days 3, 19 and 28' % ', '.join(rs(a) for _, _, a in B_CRED),
     'rec %s, amt %s, day %s; S = %s' % (num(FB['rec'], 2), num(FB['amt'], 2), num(FB['day'], 2), num(SB, 2)), verdict(SB)],
    ['C. Hyper applicant', 'Qualifying days in each of 8 weeks: %s' % ', '.join(str(x) for x in WEEKS_FAIL),
     'Week 6 has 4 qualifying days', 'Not qualified'],
    ['D. Hyper applicant', 'Qualifying days in each of 8 weeks: %s' % ', '.join(str(x) for x in WEEKS_PASS), 'Every week has 5 or more',
     'Qualified; affordability next'],
], widths=['16%', '42%', '26%', '16%']))
f.append('<h2>8. After joining</h2>' + D.bullets([
    'The auto debit itself keeps testing the account: the first successful collection each month marks a day money was present.',
    'A declared pay day contradicted by those days removes the verification and costs the member 15 points.',
    'The account is re-verified every 90 days and before each new unknown committee.',
]))
f.append('<h2>9. Technical Process</h2>' + D.steps([
    'Intake. For a wallet at the payment partner, the transaction history is read through the partner&rsquo;s account '
    'information interface with the member&rsquo;s consent. For any other account, the member uploads the statement file '
    'issued by their bank or wallet application.',
    'Integrity. The file&rsquo;s text and metadata are read; the producer and the creation and modification dates are checked; '
    'the running balance is recomputed line by line; the account number and title are compared with the title inquiry.',
    'Classification. Each credit is labelled counted or not counted by the rules in section 4: own transfers by matching title, '
    'reversals, loan disbursements by lender name or narration, Halqa pots by reference, and round trips by the 24 hour rule.',
    'Scoring. Counted credits are grouped by remitter and the five measures and S are computed. For Hyper, daily totals, '
    'qualifying days and qualifying weeks are computed.',
    'Output. The verdict, the verified monthly income or median weekly total, and the inferred pay day are stored with a '
    'fingerprint of the statement and the version of the rules, and passed to the affordability model.',
    'Review. Cases between 0.50 and 0.75, and every failed integrity check, go to a reviewer with the statement and the scores.',
]))
f.append('<h2>10. Model Surface</h2>' + D.para(
    'The salary pattern score combines five measures. The figure places simulated remitter patterns by the three measures that '
    'vary continuously, recurrence, steadiness of amount and steadiness of day, and colours each by the decision once narration '
    'and employer match are added.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'income-account.png'), 'Salary pattern decisions for 900 simulated statements by recurrence, amount steadiness and day steadiness. '
               'Green: score 0.75 or more, verified. Amber: 0.50 to 0.75, manual review. Red: below 0.50, not verified.', '92%'))
f.append(D.summary(
    'A member names the account their income comes into. Halqa checks that the account is in their name and reads their '
    'statement: a salary arriving from the same employer on about the same day each month proves a salary account, and '
    'Rs 1,000 or more arriving on at least five days of every week for eight weeks proves daily income for Hyper. Money '
    'the member moves in from their own accounts, loans and round trips do not count.'))
formal('03 Income Account Verification Model.pdf', 'Income Account Verification: Model',
       'How Halqa decides that a member&rsquo;s named account is their own and receives their income, monthly or daily.',
       'HQ-MF-03', 'The payment partner, NayaPay or SadaPay, and Mr Akif Saeed', ''.join(f), running='Income Account Verification Model')

# ------------------------------------------------------------------ informal
i = []
i.append(D.para('This explains how Halqa checks the account a member says their income comes into. The '
                'check is required for every unknown committee and for Hyper.'))
i.append('<h2>1. The words used</h2>' + glossary([
    ['Income account', 'The bank or wallet account, in the member&rsquo;s own name, where their pay or daily earnings arrive'],
    ['Title inquiry', 'Asking the bank for the account holder&rsquo;s registered name, to compare with the CNIC'],
    ['Credit', 'Money coming into the account'],
    ['Remitter', 'Whoever sent the money, such as an employer'],
    ['Median', 'The middle value when numbers are put in order. It ignores one unusually big or small month'],
    ['Round trip', 'Money sent in and then straight back out, used to fake income'],
]))
i.append('<h2>2. Checking for a salary</h2>' + D.bullets([
    'The account must be in the member&rsquo;s own name.',
    'Halqa looks at the last four months and finds anyone who paid in at least three of them.',
    'It scores five things: how regular the payments are, whether the amounts are similar, whether they arrive on about '
    'the same day, whether the note says salary, and whether the sender is the employer the member named.',
    'A score of 0.75 or more means verified. Example: four payments of about Rs 59,000 from ABC Textiles on the 1st or '
    '2nd, marked salary, score a full 1.00, and the member&rsquo;s income is taken as Rs 59,250.',
    'Three random transfers from a friend on different days score %s and are rejected.' % num(SB, 2),
]))
i.append('<h2>3. Checking for daily income, Hyper</h2>' + D.bullets([
    'A day counts if at least Rs 1,000 of real income arrives that day.',
    'A week counts if at least five of its days count.',
    'All of the last eight weeks must count. One week with only four good days is a fail.',
    'Money from the member&rsquo;s own accounts, loans, refunds and committee pots never counts.',
    'Passing this only proves daily income exists. The affordability test then checks whether the member can carry the daily payment.',
]))
i.append('<h2>4. After joining</h2>' + D.para(
    'The monthly collection keeps checking. If collections keep succeeding on a different day from the pay day the member '
    'declared, the verification is removed and the member loses 15 points.'))
i.append('<h2>5. Model Surface</h2>' + D.para(
    'Each dot in the picture is one person&rsquo;s statement. It is placed by how many months a salary arrived, how steady the '
    'amount was and how steady the day was. Green dots are clearly salaries, amber ones are checked by a person, and red ones '
    'are not accepted.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'income-account.png'), 'Statements placed by months with a credit, steady amount and steady day. Green: verified. Amber: checked '
               'by a person. Red: not verified.', '92%'))
i.append('<h2>6. Process</h2>' + D.steps([
    'If the member&rsquo;s wallet is with the payment partner, the system reads its history directly, with permission. '
    'Otherwise the member uploads the statement from their bank&rsquo;s app.',
    'The system checks the file has not been edited and that every line adds up.',
    'It removes money that does not count, such as transfers from the member&rsquo;s own accounts, loans and refunds.',
    'It scores what is left for a salary, or counts the days with Rs 1,000 or more for Hyper.',
    'It saves the result with the income figure and the pay day, and checks again every 90 days.',
]))
i.append(D.summary(
    'Halqa checks that the income account is in the member&rsquo;s name and receives their income. A salary from '
    'the same employer on about the same day each month passes. For Hyper, Rs 1,000 or more on at least five days of every '
    'week for eight weeks passes. Fake income, such as money moved in from the member&rsquo;s own accounts, does not count.'))
informal('03 Income Account Verification Explained.pdf', 'Income Account Verification, Explained',
         'How Halqa checks that an account receives the member&rsquo;s income.', 'HQ-MI-03', ''.join(i),
         running='Income Account Verification Explained')
print('A', round(SA, 3), FA, 'income', INC_A, '| B', round(SB, 3), FB)
