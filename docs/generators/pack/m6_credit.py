# -*- coding: utf-8 -*-
"""Maths 06: credit scoring and the TASDEEQ link, formal and informal."""
import math, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import os
import docgen as D
from mcommon import rs, num, pct, ABOUT, formal, informal, glossary

SRC_T = 'TASDEEQ, tasdeeq.com, credit score and credit information report pages, read on 24 September 2026'
EVENTS = [
    ['New account', 'Opens at 700', '+700 start'],
    ['Instalment paid at least three days early', 'Settlement', '+6'],
    ['Instalment paid on time', 'Settlement', '+4'],
    ['Paid 1 to 3 days late', 'Delinquency ladder', '&minus;10'],
    ['Paid 4 or more days late', 'Delinquency ladder', '&minus;20'],
    ['Missed beyond the grace period', 'Delinquency ladder', '&minus;40'],
    ['Default after collecting the pot', 'Account restricted', '&minus;200'],
    ['Circle completed clean', 'Completion', '+25'],
    ['Guaranteed member defaults after collecting', 'Guarantor', '&minus;25'],
    ['Declared pay day contradicted by collections', 'Income account check', '&minus;15'],
]
BANDS = [['Rebuilding', 'Below 550', 'The last three seats, never earlier than the second half'],
         ['Fair', '550 to 649', 'Any free seat in the second half'],
         ['Good', '650 to 749', 'Any free seat'],
         ['Excellent', '750 and above', 'Any free seat']]


def to_tasdeeq(h):
    return 200 + (h - 300) * 400.0 / 550


ANCHOR, ODDS0, PDO = 700, 30.0, 40
FACTOR = PDO / math.log(2)
OFFSET = ANCHOR - FACTOR * math.log(ODDS0)
SCALE = [(o, OFFSET + FACTOR * math.log(o), 1 / (1 + o)) for o in (2, 5, 10, 30, 60, 100, 200)]
assert abs(SCALE[3][1] - 700) < 1e-9

FIELDS = [
    ['Member identity', 'CNIC number and name as verified with NADRA'],
    ['Record reference', 'Halqa circle and membership identifiers'],
    ['Institution type', 'Committee platform, a furnisher that is not a credit institution'],
    ['Obligation type', 'Committee, known or unknown, monthly or daily'],
    ['Instalment', 'Contribution per period, in rupees'],
    ['Term', 'Number of periods and the cycle start and end dates'],
    ['Collection', 'Date the member collected and the pot received'],
    ['Outstanding', 'Contributions still owed after collection: c &times; (n &minus; k). Nil before collection'],
    ['Days past due', 'Current days past due, and the worst in the last 12 months, in buckets 0, 1 to 29, 30 to 59, 60 to 89, 90 and above'],
    ['Status', 'Current, late, default after collection, closed and paid as agreed, exited with restitution, or hardship'],
    ['Guarantee', 'Members bound by the mutual guarantee, as co-obligors'],
]

# ------------------------------------------------------------------ formal
f = []
f.append('<h2>1. Halqa and the purpose of this document</h2>' + ABOUT + D.para(
    'Committee repayment history is recorded nowhere in Pakistan&rsquo;s credit system. Halqa records it instalment by '
    'instalment, against identities verified with NADRA. This document sets out what TASDEEQ publishes about its score, '
    'how Halqa&rsquo;s records map onto it, the record Halqa proposes to furnish, and how Halqa&rsquo;s internal score '
    'relates to TASDEEQ&rsquo;s scale.'))
f.append('<h2>2. What TASDEEQ publishes</h2>'
         + D.quote('TASDEEQ Credit Score assigns scores in a range from 200 (very poor) to 600 (excellent), with further bands '
                   'that provide more insight into how good a score is', SRC_T)
         + D.quote('Our credit score is based on a machine learning model and uses multiple data points', SRC_T)
         + D.bullets(['Published data points: overdues, demographics, loan size, multiple borrowing, details of co-borrower, '
                      'credit history length and institution type.',
                      'Purpose: the score &ldquo;provides insight into the probability of default of a customer&rdquo;.',
                      'A report &ldquo;consists of a borrower&rsquo;s personal data, credit data, dispute information and public record&rdquo;.',
                      'Coverage: members from banking and financial institutions &ldquo;providing insights on 18 million records&rdquo;.',
                      'Not published: the weight of each data point, the cut-offs of the further bands, and how often a score is refreshed.']))
f.append('<h2>3. The legal route</h2>'
         + D.quote('the amounts and nature of commercial transactions, facilities and services entered into or availed of credit '
                   'from non-financial companies and bodies and other lenders and authorities including but not limited to '
                   'retailers, insurance companies, utility providers and landlords as notified by the Federal Government',
                   'Credit Bureaus Act 2015, section 2(i)(iii), within the definition of credit information')
         + D.quote('The membership of other credit information furnisher, other than credit institution, to become a member of '
                   'credit bureaus shall be notified by the Federal Government accordingly.', 'Section 11(1)')
         + D.quote('on written or electronic request or instructions of the debtor, to whom it relates, received from such debtor '
                   'or through a duly constituted attorney thereof', 'Section 19(1)(b), a permitted purpose for issuing a report')
         + D.bullets(['Reading today: Halqa can obtain a member&rsquo;s report on the member&rsquo;s own electronic instruction '
                      'under section 19(1)(b), through a subscriber agreement.',
                      'Furnishing later: Halqa is not a credit institution, so furnishing committee data needs the Federal '
                      'Government notification in section 11(1). Until then Halqa builds and holds the record.',
                      'Disputes: a member may notify the bureau of an error under section 33(1), and Halqa as furnisher corrects its record.']))
f.append('<h2>4. How Halqa&rsquo;s records map onto TASDEEQ&rsquo;s data points</h2>' + D.table([
    ['TASDEEQ data point', 'Halqa equivalent'],
    ['Overdues', 'Days past due on every instalment, recorded when each payment settles'],
    ['Demographics', 'Age, city and occupation from verified onboarding; only what the format requires is sent'],
    ['Loan size', 'The forward liability at collection: the contributions still owed after the member takes the pot'],
    ['Multiple borrowing', 'The number of circles in which the member has collected and still owes'],
    ['Details of co-borrower', 'The mutual guarantee signed by every member of the circle'],
    ['Credit history length', 'Months since the member&rsquo;s first circle'],
    ['Institution type', 'A new type: committee platform'],
], widths=['30%', '70%']))
f.append('<h2>5. The record Halqa proposes to furnish</h2>' + D.table([['Field', 'Content']] + FIELDS, widths=['24%', '76%'])
         + D.bullets([
             'Before collection, a membership is a savings commitment: its payment history is reported, but no debt is shown.',
             'After collection, it is an interest free obligation equal to the contributions still owed, and it should count '
             'towards multiple borrowing and the member&rsquo;s debt burden.',
             'A default after collection is the committee equivalent of a write off. A completed circle is an account closed '
             'and paid as agreed. A hardship exit is closed with a hardship note, not as a default.',
             'Daily Hyper records are reported monthly, with days past due counted in calendar days.',
         ]))
f.append('<h2>6. Halqa&rsquo;s internal score today</h2>' + D.para(
    'Halqa scores members from 300 to 850. The score moves on each event below, as implemented in the application on '
    '24 September 2026, and it decides only which seats a member may claim when joining. It never reorders a circle.')
    + D.table([['Event', 'Where it comes from', 'Points']] + EVENTS, numeric=(2,), widths=['50%', '30%', '20%'])
    + D.table([['Band', 'Score', 'Seats a member may claim']] + BANDS, widths=['18%', '18%', '64%']))
f.append('<h2>7. The next version: a scorecard fitted to observed defaults</h2>' + D.para(
    'Event points are a starting rule, not a measure of risk. Once about 1,000 memberships have completed, Halqa will fit a '
    'logistic model of default after collection on its own records and scale it in the standard way, so that every fixed '
    'number of points halves or doubles the odds of repayment.')
    + D.formula('Score = Offset + Factor &times; ln(odds) &nbsp;&nbsp;&nbsp; Factor = PDO / ln 2 &nbsp;&nbsp;&nbsp; Offset = anchor score &minus; Factor &times; ln(anchor odds)')
    + D.para('With an illustrative anchor of 700 at odds of 30 to 1 and 40 points to double the odds (PDO), Factor = %s and Offset = %s:'
             % (num(FACTOR, 2), num(OFFSET, 2)))
    + D.table([['Odds of repaying', 'Probability of default', 'Score']]
              + [['%d to 1' % o, pct(pd, 1), num(s, 0)] for o, s, pd in SCALE], numeric=(1, 2), widths=['34%', '33%', '33%'])
    + D.para('Candidate inputs: worst days past due in 12 months, circles completed clean, months of history, forward '
             'liability against verified income, verification level, and whether the member has ever collected and then fallen behind.'))
f.append('<h2>8. Relating Halqa&rsquo;s scale to TASDEEQ&rsquo;s</h2>'
         + D.formula('TASDEEQ equivalent = 200 + (Halqa score &minus; 300) &times; 400 / 550')
         + D.table([['Halqa band boundary', 'Halqa score', 'TASDEEQ equivalent']]
                   + [['Rebuilding to Fair', '550', num(to_tasdeeq(550), 1)], ['Fair to Good', '650', num(to_tasdeeq(650), 1)],
                      ['Good to Excellent', '750', num(to_tasdeeq(750), 1)]], numeric=(1, 2), widths=['40%', '30%', '30%'])
         + D.bullets([
             'The straight line is for display only, because TASDEEQ does not publish its band cut-offs.',
             'TASDEEQ should score Halqa&rsquo;s raw records in its own model rather than take Halqa&rsquo;s score as an input; '
             'feeding one score into another double counts the same payments.',
         ]))
f.append('<h2>9. What Halqa asks of TASDEEQ</h2>' + D.bullets([
    'A subscriber agreement, so a member&rsquo;s report can be read on the member&rsquo;s own instruction.',
    'The furnishing specification and a pilot file for committee records, ready for the day section 11(1) notification is made.',
    'Support for that notification, since committee repayment is the credit history of people with no loan history.',
    'The cut-offs of the further bands, so Halqa&rsquo;s seat rules can use TASDEEQ&rsquo;s own lines.',
]))
f.append('<h2>10. Technical Process</h2>' + D.steps([
    'Events. Each payment outcome, completion, default and verification writes an event with its points to the score ledger, '
    'which is append only. The score is the sum of the events and the band follows from the score.',
    'Use. The band decides the seats offered at join, and the member sees the score with every event behind it.',
    'Bureau. The TASDEEQ report is released on the member&rsquo;s instruction; its score, open facilities, instalments and '
    'overdue amounts are stored and used by the affordability model and the seat rules.',
    'Scorecard. Once enough circles have completed, a logistic regression is fitted to observed defaults, validated on data '
    'held back, scaled with points to double the odds, and monitored for drift.',
    'Furnishing. When the Federal Government notifies furnishers other than credit institutions under section 11(1), the '
    'record in section 5 is sent monthly in the bureau&rsquo;s format.',
]))
f.append('<h2>11. Model Surface</h2>' + D.para(
    'The scaling ties a score to a chance of default through two choices: the anchor, 700 at odds of 30 to 1, and the points '
    'needed to double the odds. The figure shows the chance of default by score for a range of points to double the odds, '
    'coloured by the band each score falls in.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'credit.png'), 'Chance of default by Halqa score and points to double the odds, anchored at 700 for odds of 30 to 1. Green: '
               'Excellent. Light green: Good. Amber: Fair. Red: Rebuilding.', '92%'))
f.append(D.summary(
    'TASDEEQ gives people a score from 200 to 600 using overdue payments, loan size, how many loans they have, how long '
    'their history is and similar facts. Halqa can give TASDEEQ the same kind of facts about committee payments, which no '
    'one records today. The law already lets Halqa read a member&rsquo;s report when the member asks; sending data to '
    'TASDEEQ needs one government notification. Halqa&rsquo;s own score runs from 300 to 850, and a simple formula '
    'converts it for comparison.'))
formal('06 Credit Scoring and TASDEEQ.pdf', 'Credit Scoring and the TASDEEQ Link',
       'How TASDEEQ scores, how Halqa&rsquo;s committee records map onto it, the record Halqa proposes to furnish, and how '
       'the two scales relate.', 'HQ-MF-06', 'TASDEEQ', ''.join(f), running='Credit Scoring and TASDEEQ')

# ------------------------------------------------------------------ informal
i = []
i.append(D.para('This explains how TASDEEQ&rsquo;s credit score works as far as TASDEEQ has made public, how Halqa&rsquo;s '
                'score works, and how the two connect.'))
i.append('<h2>1. The words used</h2>' + glossary([
    ['Credit score', 'A number that estimates how likely a person is to repay'],
    ['Credit bureau', 'A company that collects repayment records from lenders and sells reports. TASDEEQ is one, licensed by the State Bank'],
    ['Furnisher', 'A company that sends repayment records to the bureau'],
    ['Subscriber', 'A company that buys reports from the bureau'],
    ['Days past due', 'How many days late a payment is'],
    ['Probability of default', 'The chance a person does not repay. 3 per cent means 3 people in 100'],
    ['Odds', 'Repayers per defaulter. Odds of 30 to 1 means 30 repay for every 1 who does not'],
    ['PDO', 'Points to double the odds: how many extra points make a person twice as safe'],
]))
i.append('<h2>2. How TASDEEQ scores</h2>' + D.bullets([
    'Scores run from 200, very poor, to 600, excellent.',
    'A computer model trained on past loans weighs seven kinds of fact: overdue payments, age and similar details, loan '
    'size, how many loans a person has, any co-borrower, how long their history is, and the type of lender.',
    'TASDEEQ has not published how much each fact counts or where its bands start and end.',
]))
i.append('<h2>3. How Halqa scores today</h2>' + D.table([['Event', 'Points']] + [[e[0], e[2]] for e in EVENTS], numeric=(1,))
         + D.para('The score only decides which seats a member may pick. Below 550 means the last few seats; 650 and above '
                  'means any seat.'))
i.append('<h2>4. The better version, later</h2>' + D.bullets([
    'Once about 1,000 memberships have finished, Halqa can measure who actually defaulted and fit the score to it.',
    'The standard way sets a score for a chosen safety level and adds a fixed number of points each time a person becomes '
    'twice as safe. With 700 meaning 30 to 1 odds and 40 points to double: 740 means 60 to 1, 660 means 15 to 1.',
]))
i.append('<h2>5. Converting between the two scales</h2>' + D.bullets([
    'Halqa runs 300 to 850 and TASDEEQ 200 to 600, so a straight line converts one to the other.',
    'Halqa 550 is about TASDEEQ 382, 650 is about 455, and 750 is about 527.',
    'This is only for comparison. TASDEEQ should use Halqa&rsquo;s actual payment records, not Halqa&rsquo;s score.',
]))
i.append('<h2>6. What the law allows</h2>' + D.bullets([
    'Reading: a member can ask TASDEEQ to give Halqa their report. Section 19(1)(b) of the Credit Bureaus Act allows this now.',
    'Sending: Halqa is not a bank, so it can only send data to TASDEEQ after the Federal Government notifies companies '
    'like it under section 11(1). That notification is the ask.',
]))
i.append('<h2>7. Model Surface</h2>' + D.para(
    'The picture links a score to the chance that someone with that score defaults. Low scores sit on the high, red side; high '
    'scores fall to almost nothing on the green side. The other direction shows how steep the scale is made.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'credit.png'), 'Chance of default by score. Green: Excellent. Light green: Good. Amber: Fair. Red: Rebuilding.', '92%'))
i.append('<h2>8. Process</h2>' + D.steps([
    'Every payment, late payment, completion or default adds or takes away points.',
    'The total is the score, and the score sets the band.',
    'The band decides which seats the member may take.',
    'The member can see every event that changed their score.',
]))
i.append(D.summary(
    'TASDEEQ&rsquo;s score runs from 200 to 600 and is built from facts like late payments and loan size. Halqa has the '
    'same kind of facts for committees, which no one has today. Halqa can already read a member&rsquo;s report if the '
    'member agrees, but sending its data to TASDEEQ needs a government notification. Halqa&rsquo;s own score, 300 to '
    '850, decides which seats a member can pick, and a simple formula shows the matching TASDEEQ number.'))
informal('06 Credit Scoring and TASDEEQ Explained.pdf', 'Credit Scoring and TASDEEQ, Explained',
         'How TASDEEQ and Halqa score people, and how the two connect.', 'HQ-MI-06', ''.join(i),
         running='Credit Scoring and TASDEEQ Explained')
print('factor', round(FACTOR, 3), 'offset', round(OFFSET, 3), [round(to_tasdeeq(x), 1) for x in (550, 650, 750)])
