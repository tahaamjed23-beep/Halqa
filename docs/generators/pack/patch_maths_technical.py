# -*- coding: utf-8 -*-
"""Adds a Technical Process section and a Model Surface section (a coloured 3D figure) to every maths document,
formal and informal, and removes the phrase 'in plain words'. Each insertion anchor must occur exactly once."""
import io

FIG = "os.path.join(D.HERE, 'out', 'figs', '@NAME@')"

F = {}   # formal inserts, keyed by file
I = {}   # informal inserts

# ------------------------------------------------------------------ 01 Hyper
F['m1_hyper.py'] = """f.append('<h2>8. Technical Process</h2>' + D.table([
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
    + D.figure(@FIG@, 'Stress index of an Option 1 circle by day and by defaults after collection. Green, 0 to 33: normal '
               'operation. Amber, 34 to 66: new joins blocked. Red, 67 to 100: the next day is not opened.', '92%'))
""".replace('@FIG@', FIG.replace('@NAME@', 'hyper-stress.png'))
I['m1_hyper.py'] = """i.append('<h2>8. Model Surface</h2>' + D.para(
    'The picture shows the health score for every day of the cycle and every number of members who took the pot and stopped. '
    'The flat green area is a healthy circle. As more members stop after collecting, the surface climbs into amber, where no one '
    'new may join, and then red, where the circle does not open the next day.')
    + D.figure(@FIG@, 'Health score of an Option 1 circle. Green: normal. Amber: new joins blocked. Red: the next day is not opened.', '92%'))
i.append('<h2>9. Process</h2>' + D.steps([
    'Every evening, after the day&rsquo;s payments and the grace time, the system counts who has taken the pot and stopped paying.',
    'It works out how much they still owe and compares it with the cover limit.',
    'It works out the score, sets the colour and shows it to the host.',
    'If the colour is amber it stops new members joining; if red, or if the money owed passes the cover limit, it does not open the next day.',
    'Every result is saved, so the operator and the host can see exactly what happened and when.',
]))
""".replace('@FIG@', FIG.replace('@NAME@', 'hyper-stress.png'))

# ------------------------------------------------------------------ 02 Affordability
F['m2_afford.py'] = """f.append('<h2>7. Technical Process</h2>' + D.table([
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
    + D.figure(@FIG@, 'Room for a new instalment by verified income and other loan repayments, with Rs 5,000 a month already '
               'held in committees. Blue: limited by the one third test. Orange: limited by the 40 per cent test with loans. Red: '
               'no room, so the member cannot join.', '92%'))
""".replace('@FIG@', FIG.replace('@NAME@', 'affordability.png'))
I['m2_afford.py'] = """i.append('<h2>6. Model Surface</h2>' + D.para(
    'The picture shows how much more a member could take on, for every income and every level of other loan repayments, when '
    'they already pay Rs 5,000 a month into committees. Higher income raises the surface; loans pull it down. The colour shows '
    'which rule stops the member first.')
    + D.figure(@FIG@, 'Room for a new instalment. Blue: the one third rule decides. Orange: the 40 per cent rule with loans '
               'decides. Red: no room.', '92%'))
i.append('<h2>7. Process</h2>' + D.steps([
    'When a member asks to join, the system takes their verified income, their committees on Halqa and the loan repayments in '
    'their credit report.',
    'It runs the five tests and finds the one with the least room.',
    'It tells the member yes or no, how much room is left, and the reason for any no.',
    'It saves the decision and its inputs, so it can be explained later.',
]))
""".replace('@FIG@', FIG.replace('@NAME@', 'affordability.png'))

# ------------------------------------------------------------------ 03 Income
F['m3_income.py'] = """f.append('<h2>9. Technical Process</h2>' + D.steps([
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
    + D.figure(@FIG@, 'Salary pattern decisions for 900 simulated statements by recurrence, amount steadiness and day steadiness. '
               'Green: score 0.75 or more, verified. Amber: 0.50 to 0.75, manual review. Red: below 0.50, not verified.', '92%'))
""".replace('@FIG@', FIG.replace('@NAME@', 'income-account.png'))
I['m3_income.py'] = """i.append('<h2>5. Model Surface</h2>' + D.para(
    'Each dot in the picture is one person&rsquo;s statement. It is placed by how many months a salary arrived, how steady the '
    'amount was and how steady the day was. Green dots are clearly salaries, amber ones are checked by a person, and red ones '
    'are not accepted.')
    + D.figure(@FIG@, 'Statements placed by months with a credit, steady amount and steady day. Green: verified. Amber: checked '
               'by a person. Red: not verified.', '92%'))
i.append('<h2>6. Process</h2>' + D.steps([
    'If the member&rsquo;s wallet is with the payment partner, the system reads its history directly, with permission. '
    'Otherwise the member uploads the statement from their bank&rsquo;s app.',
    'The system checks the file has not been edited and that every line adds up.',
    'It removes money that does not count, such as transfers from the member&rsquo;s own accounts, loans and refunds.',
    'It scores what is left for a salary, or counts the days with Rs 1,000 or more for Hyper.',
    'It saves the result with the income figure and the pay day, and checks again every 90 days.',
]))
""".replace('@FIG@', FIG.replace('@NAME@', 'income-account.png'))

# ------------------------------------------------------------------ 04 Identity
F['m4_kyc.py'] = """f.append('<h2>8. Technical Process</h2>' + D.steps([
    'CNIC. The number and details are sent to NADRA Verisys under the corporate agreement and the response is compared with '
    'what the member entered. A failure is a hard stop.',
    'Face. A liveness session runs on the phone camera; the captured image is compared with the CNIC photograph, and the '
    'similarity becomes the face score.',
    'Names. The names on the CNIC, the wallet title and the application are normalised, removing honorifics and standardising '
    'spellings, and compared by edit distance.',
    'Address. The typed address is placed on the map and compared with the one time location pin by great circle distance, '
    'and with the address on a utility bill.',
    'Account, phone and job. The wallet title is matched; the phone number is confirmed by passcode and may hold only one '
    'account; the job is confirmed from the income evidence.',
    'Score. K is computed, the level is set, and the name is screened against the sanctions lists. Duplicates by CNIC, phone '
    'or device are refused or shown to the host.',
    'Records. Images are encrypted at rest and every access is logged. The decision is stored with each score and the version '
    'of the rules.',
]))
f.append('<h2>9. Model Surface</h2>' + D.para(
    'K combines six scores. The figure shows the three that vary most, name, face and address, with the account, phone and job '
    'scores held at 1.00, 1.00 and 0.80 as in the example, and colours each combination by the level it reaches.')
    + D.figure(@FIG@, 'Identity confidence by name, face and address scores. Green: K of 0.92 or more, level 3, Hyper. Amber: '
               '0.85 to 0.92, level 2, unknown committees. Red: below 0.85, not enough for an unknown committee.', '92%'))
""".replace('@FIG@', FIG.replace('@NAME@', 'identity.png'))
I['m4_kyc.py'] = """i.append('<h2>7. Model Surface</h2>' + D.para(
    'Each dot is one combination of how well the name, the face and the address matched. Green combinations are good enough for '
    'Hyper, amber for unknown committees, and red for neither.')
    + D.figure(@FIG@, 'Name, face and address matches. Green: Hyper. Amber: unknown committees. Red: neither.', '92%'))
i.append('<h2>8. Process</h2>' + D.steps([
    'The CNIC is checked with NADRA.',
    'The member takes a live selfie, which is checked for liveness and matched to the CNIC photograph.',
    'The names on the CNIC, the wallet and the form are compared.',
    'The address is compared with a location pin and a utility bill.',
    'The scores are combined into one number, which sets the member&rsquo;s level.',
]))
""".replace('@FIG@', FIG.replace('@NAME@', 'identity.png'))

# ------------------------------------------------------------------ 05 Takaful
F['m5_takaful.py'] = """f.append('<h2>9. Technical Process</h2>' + D.steps([
    'Enrolment. When a circle starts, a file goes to the operator listing each covered member, the circle, the seat, the '
    'instalment, the cover and the contribution.',
    'Contributions. The takaful part of every debit is paid by the payment partner straight into the participants&rsquo; risk '
    'fund account, and a daily file of contributions paid goes to the operator.',
    'Claims. The arrears engine detects the trigger, three consecutive misses after grace by a member who has collected, and '
    'assembles the evidence pack: the payment record, the mandate history and the undertaking. The operator pays each member '
    'left short in that member&rsquo;s own name.',
    'Recoveries. Amounts later recovered from the defaulter are paid to the fund and recorded against the claim.',
    'Reporting. A monthly file of members covered, contributions, defaults, claims and recoveries; commission is computed only '
    'on contributions the operator has received.',
]))
f.append('<h2>10. Model Surface</h2>' + D.para(
    'The contribution depends on the default rate and on the operator&rsquo;s wakalah fee, with the safety loading at 20 per '
    'cent. The figure shows the contribution per Rs 10,000 instalment of a 12 member monthly circle on the base case formula, '
    'coloured by its share of the instalment.')
    + D.figure(@FIG@, 'Contribution per Rs 10,000 instalment by default rate after collection and wakalah fee. Green: under 3 per '
               'cent of the instalment. Amber: 3 to 6 per cent. Red: over 6 per cent.', '92%'))
""".replace('@FIG@', FIG.replace('@NAME@', 'takaful.png'))
I['m5_takaful.py'] = """i.append('<h2>7. Model Surface</h2>' + D.para(
    'The picture shows what the cover costs on each Rs 10,000 instalment, for every default rate and every fee the operator '
    'might charge. More defaults, or a higher fee, raise the cost. Green is cheap, amber is moderate, red is expensive.')
    + D.figure(@FIG@, 'Cost of cover per Rs 10,000 instalment. Green: under 3 per cent. Amber: 3 to 6 per cent. Red: over 6 per cent.', '92%'))
i.append('<h2>8. Process</h2>' + D.steps([
    'When a circle starts, the operator is told who is covered.',
    'Every payment sends the takaful part straight to the fund.',
    'If a member takes the pot and misses three payments in a row, the system sends the operator the evidence.',
    'The operator pays each member left short directly.',
    'Anything later recovered from the defaulter goes back to the fund.',
]))
""".replace('@FIG@', FIG.replace('@NAME@', 'takaful.png'))

# ------------------------------------------------------------------ 06 Credit
F['m6_credit.py'] = """f.append('<h2>10. Technical Process</h2>' + D.steps([
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
    + D.figure(@FIG@, 'Chance of default by Halqa score and points to double the odds, anchored at 700 for odds of 30 to 1. Green: '
               'Excellent. Light green: Good. Amber: Fair. Red: Rebuilding.', '92%'))
""".replace('@FIG@', FIG.replace('@NAME@', 'credit.png'))
I['m6_credit.py'] = """i.append('<h2>7. Model Surface</h2>' + D.para(
    'The picture links a score to the chance that someone with that score defaults. Low scores sit on the high, red side; high '
    'scores fall to almost nothing on the green side. The other direction shows how steep the scale is made.')
    + D.figure(@FIG@, 'Chance of default by score. Green: Excellent. Light green: Good. Amber: Fair. Red: Rebuilding.', '92%'))
i.append('<h2>8. Process</h2>' + D.steps([
    'Every payment, late payment, completion or default adds or takes away points.',
    'The total is the score, and the score sets the band.',
    'The band decides which seats the member may take.',
    'The member can see every event that changed their score.',
]))
""".replace('@FIG@', FIG.replace('@NAME@', 'credit.png'))

EXTRA = {
    'm3_income.py': [("'auto debit is taken from it. This model decides whether the named account is the member&rsquo;s own, whether '",
                      "'auto debit is taken from the member&rsquo;s wallet at the payment partner, which is either this account or is funded "
                      "from it by standing instruction. This model decides whether the named account is the member&rsquo;s own, whether '")],
}

for fn in F:
    p = fn
    s = io.open(p, encoding='utf-8').read()
    for a, b in EXTRA.get(fn, []):
        assert s.count(a) == 1, (fn, a[:60])
        s = s.replace(a, b)
    assert s.count('f.append(D.summary(') == 1 and s.count('i.append(D.summary(') == 1, fn
    s = s.replace('f.append(D.summary(', F[fn] + 'f.append(D.summary(', 1)
    s = s.replace('i.append(D.summary(', I[fn] + 'i.append(D.summary(', 1)
    s = s.replace(', in plain words.', '.').replace(', in plain words', '')
    if 'import os' not in s:
        s = s.replace('import docgen as D', 'import os\nimport docgen as D', 1)
    io.open(p, 'w', encoding='utf-8').write(s)
    print('patched', fn)
