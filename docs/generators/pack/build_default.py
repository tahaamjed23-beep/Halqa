# -*- coding: utf-8 -*-
"""Default Prevention: every measure Halqa has in place to stop a default or recover its cost, in the order a
member meets them, with the law each relies on. Quotations are verified by lawcite."""
import os, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import docgen as D
import lawcite as L
from mcommon import rs

OUT = os.path.join(D.HERE, 'out', 'partnership')


def Q(key, text, prov):
    return L.cite(D, key, text, prov)


def P(*paras):
    return ''.join(D.para(p) for p in paras)


c, n = 10000, 12
b = []
b.append(P(
    'This document sets out every measure Halqa has in place to stop a member from defaulting, and to recover the cost if '
    'one does, in the order a member meets them. For each measure it states how it works and the law it relies on. The '
    'arithmetic behind the thresholds is in the maths documents HQ-MF-01 to HQ-MF-06.'))

b.append('<h2>1. Where the risk is</h2>' + D.bullets([
    'A member who falls behind before their own turn causes a delay, not a loss. On their collection day the instalments they '
    'missed are paid out of their own pot to the members they left short.',
    'The only real loss is a member who collects the pot and then stops paying. What they still owe is the forward liability: '
    'the instalment multiplied by the rounds left after their turn.',
    'So the design does two things: it keeps members who might not pay away from early seats, and it makes the remaining '
    'obligation after collection as small and as well secured as possible.',
]) + D.formula('L(k) = c &times; (n &minus; k)', 'Forward liability of a member who collects in round k of an n round circle with instalment c')
    + D.table([
        ['Seat collected, 12 members at Rs 10,000', 'Still owed after collecting', 'Who may hold this seat'],
        ['Round 1', rs(c * (n - 1)), 'Members in the Good or Excellent band only'],
        ['Round 6', rs(c * (n - 6)), 'Members in the Fair band or better'],
        ['Round 10', rs(c * (n - 10)), 'A new member, with no history on Halqa'],
        ['Round 12', rs(0), 'Anyone'],
    ], numeric=(1,), widths=['38%', '26%', '36%'])
    + P('A new member can take only the last three seats, so the most a new member can owe after collecting on a 12 member '
        'circle of Rs 10,000 is Rs 20,000, against Rs 110,000 in the first seat.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'forward-liability.png'), 'Amount still owed after collecting, by the size of the '
               'circle and the seat collected, at Rs 10,000 an instalment. Green: the last three seats, open to new members. Amber: the '
               'second half, open from the Fair band. Red: the first half, open only to the Good and Excellent bands.', '90%'))

b.append('<h2>2. Before a member joins</h2>' + P(
    'These checks decide who may join and which seats they may take. They apply in full to unknown committees and Hyper; on a '
    'known committee the host, who knows every member, admits them, and the identity check still applies.')
    + D.table([
        ['Measure', 'How it works', 'Basis'],
        ['Identity', 'CNIC checked with NADRA, a live face capture matched to the CNIC photograph, and the name matched across '
                     'the CNIC, the account and the application (Identity Verification Model, HQ-MF-04)', 'Contract Act 1872, s.11: only adults contract'],
        ['Age', 'The date of birth on the CNIC must show 18 or over', 'Contract Act 1872, s.11'],
        ['Income account', 'An account in the member&rsquo;s name that receives their income, checked by title inquiry and by its '
                           'statement (Income Account Verification Model, HQ-MF-03). It is the member&rsquo;s wallet at the payment '
                           'partner, or funds that wallet by standing instruction', 'The auto debit is taken from the wallet, PS&amp;EFT Act 2007, s.35'],
        ['Daily income, Hyper', 'Rs 1,000 or more received on at least 5 days of every week for the last 8 weeks', 'HQ-MF-03'],
        ['Affordability', 'All committees within a third of verified income, and within 40 per cent with other loan repayments; '
                          'stricter from the fourth committee (Affordability Model, HQ-MF-02)', 'State Bank limit of 40 per cent for banks, adopted voluntarily'],
        ['Credit report', 'A TASDEEQ report on the member&rsquo;s own instruction shows loans elsewhere', 'Credit Bureaus Act 2015, s.19(1)(b)'],
        ['Score bands', 'The member&rsquo;s standing decides which seats they may claim, and never reorders a started circle', 'HQ-MF-06'],
        ['New member rule', 'The last three seats only, until two clean circles and full verification', 'HQ-MF-01'],
        ['Forward liability gate', 'An early seat is withheld where the amount still owed after collecting would be too large', 'HQ-MF-01'],
        ['Exposure ceiling', 'From the fourth circle, total still owed across all circles at most a year of verified income', 'HQ-MF-02'],
        ['Circle limits', 'At most six circles; one Hyper at a time; a new host runs two circles until proven', 'Product rule'],
        ['Host admission', 'The host admits each member after seeing their standing and any related accounts', 'Product rule'],
        ['Open default lock', 'A member with an open default cannot join or create anything', 'Product rule'],
    ], widths=['17%', '55%', '28%'])
    + Q('BPRD', 'The total monthly amortization payments of consumer financing facilities, as prescribed in paragraph 1 of the '
                'regulation, should not exceed 40% of the net disposal income of the prospective borrower.', 'Regulation R-3')
    + Q('CBA', '(b) on written or electronic request or instructions of the debtor, to whom it relates, received from such debtor',
        'section 19(1)(b)')
    + P('Where a report leads Halqa to refuse a seat, the member is given the report, the bureau&rsquo;s details, the summary of '
        'rights and a statement that the bureau did not make the decision, as section 31 of the Credit Bureaus Act requires.'))

b.append('<h2>3. When a member joins</h2>' + P(
    'Joining binds the member by contract and, on unknown committees and Hyper, attaches automatic collection and cover.')
    + D.table([
        ['Measure', 'How it works', 'Basis'],
        ['Undertaking', 'Ten clauses signed in the application: the obligation to pay every instalment, the late ladder, the '
                        'arrears rule and acceleration on default', 'Electronic Transactions Ordinance 2002, ss.3 and 7'],
        ['Mutual guarantee', 'Every member guarantees the others; the circle does not start until all have signed', 'Contract Act 1872, ss.126 and 128'],
        ['Auto debit', 'Mandatory on unknown committees and Hyper, from the member&rsquo;s wallet at the payment partner, with an optional '
                       'backup card (Auto Debit, HQ-CP-02)', 'PS&amp;EFT Act 2007, s.35(1)'],
        ['Guarantee cheque', 'Optional: a paper cheque held on file, which takes 80 per cent off the fee', 'Penal Code, s.489-F; Code of Civil Procedure, Order XXXVII'],
        ['Confirming window', '24 hours in which any member may withdraw before the circle starts', 'Product rule'],
        ['Takaful cover', 'Mandatory on unknown committees and Hyper; pays the members left short if a member collects and stops paying', 'Insurance Ordinance 2000, Class 6'],
    ], widths=['17%', '55%', '28%'])
    + Q('ETO', 'No document, record, information, communication or transaction shall be denied legal recognition, admissibility, '
               'effect, validity, proof or enforceability on the ground that it is in electronic form and has not been attested by '
               'any witness.', 'section 3')
    + Q('CONTRACT', 'A contract of guarantee is a contract to perform the promise, or discharge the liability of a third person in case '
                    'of his default.', 'section 126')
    + Q('CONTRACT', 'The liability of the surety is coextensive with that of the principal debtor, unless it is otherwise provided by '
                    'the contract.', 'section 128')
    + Q('PSEFT', '(1) A preauthorized Electronic Fund Transfer from a Consumer\'s Account may be authorized by the Consumer either in '
                 'writing, or in any other accepted form.', 'section 35(1)')
    + P('The guarantee cheque is kept on paper because a cheque is a negotiable instrument, and the Electronic Transactions '
        'Ordinance does not apply to negotiable instruments.')
    + Q('ETO', '(a) a negotiable instrument as defined in section 13 of the Negotiable Instruments Act, 1881 (XXVI of 1881);',
        'section 31(1)(a)')
    + Q('INS', '"credit and suretyship business" means effecting and carrying out: (i) contracts of insurance against loss to the '
               'policy holder arising from failure, whether through insolvency or otherwise, of debtors to pay debts when they fall due',
        'section 4(4)(f)'))

b.append('<h2>4. While the circle runs</h2>' + P(
    'Collection is designed so that money is taken when it is most likely to be there, and a member who misses a payment is '
    'caught at once rather than at the end.')
    + D.bullets([
        'Payday collection: one attempt on the member&rsquo;s own payday, learned from the days on which past collections '
        'succeeded, before the due date.',
        'Reminders: the evening before, and before each attempt. Reminders come before the due date, not after it.',
        'Retries: at the due time, after 24 hours and after 48 hours, with a backup card charged once where one is held. Then no further '
        'automatic attempt; the member is told the reason at each step.',
        'Arrears netting: missed instalments are taken from the late member&rsquo;s own pot on their collection day and paid to '
        'the members they left short.',
        'Late ladder: grace, then three steps with stated penalties and standing damage. On Hyper the steps fall at 12, 36 and '
        '60 hours, with penalties of 5, 10 and 15 per cent. On Shariah labelled circles penalties are given to charity at the '
        'end of the circle.',
        'Stress index and hard stop, Hyper: the circle is scored from 0 to 100 every day. Amber blocks new joins; red stops '
        'the next day opening; and no day opens once unpaid exposure exceeds the cover limit (Hyper Default Threshold Model, HQ-MF-01).',
        'Host tools: the host sees who is late, by how long and at which step, and can send a reminder to a named member.',
    ])
    + Q('CONTRACT', 'reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for',
        'section 74')
    + P('Section 74 limits what a penalty can recover to reasonable compensation up to the stated amount. The late ladder&rsquo;s '
        'penalties are set to stay within that limit, and are stated in the undertaking before the member signs.'))

b.append('<h2>5. When a member stops paying</h2>' + P(
    'The steps below run in order. Most cases end at the first step, because a member who makes contact is given time.')
    + D.table([
        ['Step', 'What happens', 'Basis'],
        ['Hardship path', 'A member who makes contact gets a recorded statement, a waived fine and a new date', 'Product rule'],
        ['Restitution', 'What is owed is computed from the published arithmetic and shown to the member, never negotiated case by case', 'Undertaking'],
        ['Standing', 'Default after collecting costs 200 points and restricts the account; the member&rsquo;s guarantor loses 25', 'HQ-MF-06'],
        ['Guarantee call', 'The members left short rely on the mutual guarantee against the defaulter', 'Contract Act 1872, ss.126 and 128'],
        ['Takaful claim', 'The operator pays each member left short directly, in that member&rsquo;s own name', 'Corporate Insurance Agents Regulations 2020, reg 7(4)'],
        ['Acceleration', 'The whole remaining balance falls due', 'Undertaking'],
        ['Civil suit', 'An ordinary suit for the sum owed under the undertaking', 'Contract Act 1872'],
        ['Cheque', 'Where a guarantee cheque is held: presented, and if dishonoured, a summary suit on it, and a criminal '
                   'complaint only on counsel&rsquo;s advice', 'Penal Code, s.489-F; Order XXXVII'],
        ['Asset committee', 'The modaraba recovers its own asset under its lease', 'The modaraba&rsquo;s ijarah'],
    ], widths=['17%', '55%', '28%'])
    + Q('CIA', 'The insurer shall make the claim settlement directly in the name of the policyholder, life assured, his nominee or '
               'guardian, as the case may be.', 'regulation 7(4)')
    + Q('PPC489', 'Whoever dishonestly issues a cheque towards repayment of a loan or fulfilment of an obligation which is dishonoured '
                  'on presentation, shall be punished with imprisonment which may extend to three years or with fine, or with both',
        'section 489-F')
    + Q('CPC', 'All suits upon bills of exchange, hundies or promissory notes', 'Order XXXVII, rule 2(1)')
    + D.bullets([
        'The summary procedure of Order XXXVII applies only to bills of exchange, hundis and promissory notes. A cheque is a '
        'bill of exchange, so a dishonoured guarantee cheque can be sued on summarily. The undertaking itself is sued on by an '
        'ordinary civil suit.',
        'Whether section 489-F reaches a cheque given as security before the obligation fell due has been decided differently '
        'by the courts, so a criminal complaint is made only where counsel advises it.',
        'At no stage does Halqa or a host call a member to demand payment, and no contact list or message is ever read. '
        'The Commission and Google Play acted against lending applications in Pakistan over such practices, and Halqa does not use them.',
    ]))

loss_rows = [
    ['Layer', 'What it does to the loss'],
    ['Seat rules', 'Keeps unproven members in the last seats, where little is owed after collecting'],
    ['Affordability and income checks', 'Lowers the chance that a member cannot pay at all'],
    ['Auto debit on payday', 'Takes the instalment when the money is in the account'],
    ['Arrears netting', 'Turns a missed payment before collection into a delay, not a loss'],
    ['Hard stop on Hyper', 'Stops a circle before it can promise money that does not exist'],
    ['Guarantee and cheque', 'Give the members left short a claim they can enforce'],
    ['Takaful cover', 'Pays the members left short when a member collects and stops paying'],
]
b.append('<h2>6. What each layer does to the loss</h2>' + D.table(loss_rows, widths=['32%', '68%']) + P(
    'The takaful contribution is priced so that the fund survives one committee in five losing a fifth of its members from '
    'the earliest seats (Takaful Cover Pricing Model, HQ-MF-05). On Hyper the fixed contribution is sized for a default rate '
    'of 50 per cent, more than eight times the highest arrears rate reported for Pakistani microfinance, 6.01 per cent '
    '(VIS Credit Rating Company, 2026).'))

b.append('<h2>7. Technical Process</h2>'
         + '<h3>7.1 Admission</h3>' + D.steps([
             'Identity: the CNIC number is checked with NADRA; a live face capture is checked for liveness and matched to the CNIC '
             'photograph; the names on the CNIC, the wallet and the application are compared. The result is an identity confidence '
             'score, which sets the verification level (HQ-MF-04).',
             'Wallet and income: the wallet at the payment partner is linked on the partner&rsquo;s own screen and its title returned; '
             'the income account statement is read, checked for tampering and scored for a salary pattern or daily income (HQ-MF-03).',
             'Credit report: the member instructs TASDEEQ through TASDEEQ&rsquo;s own consent step, and the report is returned to Halqa.',
             'Affordability: the verified income, the committees held and the loan repayments in the report are tested (HQ-MF-02).',
             'Seats: the standing band, the new member rule, the forward liability gate and the exposure ceiling decide which seats '
             'are offered (HQ-MF-01 and HQ-MF-06).',
             'Every decision is stored with its inputs and reasons, so a refusal can be explained and, where a credit report was used, '
             'the notice under section 31 of the Credit Bureaus Act is generated from the same record.',
         ])
         + '<h3>7.2 Joining</h3>' + D.steps([
             'The undertaking and the guarantee are shown in full and signed with the PIN. The signed text is stored with its '
             'fingerprint and the time, so it can be proved unaltered.',
             'The mandate is created with the payment partner and the takaful enrolment is sent to the operator.',
             'The circle starts only when every member has signed and the 24 hour window has passed.',
         ])
         + '<h3>7.3 Monitoring</h3>' + D.steps([
             'Each evening the scheduler lists the collections due, including payday attempts.',
             'Each missed collection creates an arrears record against the round and starts the late ladder clock.',
             'A daily pass moves each late member along the ladder, sends the notices and updates standing.',
             'On Hyper the stress index and the hard stop are computed at the close of each day.',
         ])
         + '<h3>7.4 Recovery</h3>' + D.steps([
             'A default after collection opens a case holding the arithmetic of what is owed, the notices sent and the member&rsquo;s replies.',
             'Where cover applies, the claim file is sent to the operator with the arrears records and the undertaking.',
             'Where a suit is needed, the case file is passed to counsel with the signed undertaking, the ledger and the notices.',
         ]))

b.append('<h2>8. Laws relied on</h2>' + D.table([
    ['Law', 'Provision', 'Used for'],
    ['Contract Act 1872', 's.11', 'Only adults may join'],
    ['Contract Act 1872', 'ss.126 and 128', 'The mutual guarantee'],
    ['Contract Act 1872', 's.74', 'The limit on late penalties'],
    ['Electronic Transactions Ordinance 2002', 'ss.3 and 7', 'The undertaking, guarantee and mandate signed in the application'],
    ['Electronic Transactions Ordinance 2002', 's.31(1)(a)', 'The guarantee cheque kept on paper'],
    ['Payment Systems and Electronic Fund Transfers Act 2007', 's.35', 'The auto debit and the member&rsquo;s right to stop it'],
    ['Credit Bureaus Act 2015', 'ss.19(1)(b) and 31', 'Reading a report on the member&rsquo;s instruction; notice of a refusal'],
    ['Insurance Ordinance 2000', 's.4(4)(f)', 'Default cover as Class 6 credit business'],
    ['Corporate Insurance Agents Regulations 2020', 'reg 7(4)', 'Claims paid to the member left short'],
    ['Pakistan Penal Code 1860', 's.489-F', 'A dishonoured guarantee cheque'],
    ['Code of Civil Procedure 1908', 'Order XXXVII', 'A summary suit on the guarantee cheque'],
    ['BPRD Circular Letter No. 29 of 2021', 'Regulation R-3', 'The 40 per cent benchmark adopted for affordability'],
], widths=['38%', '18%', '44%']) + P('The full legal position, with every provision in context, is in the Legal Position (HQ-LG-01).'))

b.append(D.summary(
    'Halqa stops most defaults before they happen: it checks who a member is, that their income is real and what they already '
    'owe, and it keeps new members in the last seats, where they owe little after collecting. It takes each payment '
    'automatically on payday, and if a member falls behind before their turn, the missed money comes out of their own pot. '
    'Only a member who takes the pot and then stops paying causes a loss, and then the other members are protected by the '
    'guarantee they signed, by the takaful cover and, as a last step, by the courts.'))

body = ''.join(b)
txt = D.text_of(body)
for bad in ('—', '–'):
    assert bad not in txt, bad
for rx in (r'\byou\b', r'\byour\b', r'summary suit on the undertaking', r'liquidated demand'):
    assert not re.search(rx, txt, flags=re.I), rx
path = os.path.join(OUT, 'Default Prevention.pdf')
D.render(path, 'Default Prevention', 'Every measure that stops a member from defaulting, or recovers the cost if one does, with the law each relies on.',
         'HQ-CP-05', 'Mr Akif Saeed, takaful operators and prospective partners', body, version='2.0', running='Default Prevention')
print('Default Prevention', D.pdf_pages(path))
