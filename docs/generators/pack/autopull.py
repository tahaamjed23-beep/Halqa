# -*- coding: utf-8 -*-
"""The auto pull and technical sections of the Collection and Auto Debit Specification. Returns HTML in the source
format (h2/h3 with <b>, plain tables) so it passes through the same conversion as the rest of the document."""
import docgen as D
import lawcite as L


def row(*c):
    return '<tr>' + ''.join('<td>%s</td>' % x for x in c) + '</tr>'


def head(*c):
    return '<tr>' + ''.join('<th><b>%s</b></th>' % x for x in c) + '</tr>'


def table(h, rows):
    return '<table>' + head(*h) + ''.join(row(*r) for r in rows) + '</table>'


def section(num):
    q35 = L.cite(D, 'PSEFT', '(1) A preauthorized Electronic Fund Transfer from a Consumer\'s Account may be authorized by the '
                              'Consumer either in writing, or in any other accepted form. (2) A consumer may stop payment of a '
                              'Preauthorized Electronic Fund Transfer by notifying the Financial Institution.',
                 'section 35, Preauthorized Transfers')
    q7 = L.cite(D, 'EMI', '(h) Offer services via secured Application Programming Interfaces (APIs) and other secure methods to '
                          'other Financial Institutions, Third Party Service Providers (TPSPs) and other Fintech. In this regard, '
                          'the EMIs have to intimate SBP 30 days prior to offering these services.', 'paragraph 7.I(h)')
    h = []
    h.append('<h2><b>%d. Auto Pull</b></h2>' % num)
    h.append('<p>Auto pull, also called auto debit, is the second tier of the collection ladder. The member authorises it once, '
             'with the payment partner, NayaPay or SadaPay. After that the partner takes each instalment from the member&rsquo;s '
             'wallet at the partner on schedule and pays each part to its owner, without the member acting each time. Halqa tells the '
             'partner what to collect and when; it never holds the money and never holds the member&rsquo;s payment details. The '
             'full process, with every credential and message, is set out in Auto Debit (HQ-CP-02).</p>')
    h.append('<ul><li>Mandatory on unknown committees and on Hyper, as a condition of joining.</li>'
             '<li>Optional on known committees, where the member may instead approve each instalment in the application or send it '
             'over Raast.</li>'
             '<li>The wallet debited is the member&rsquo;s own wallet at the partner. Raast does not allow a payee to pull money from an '
             'account at another institution, so the member&rsquo;s income must be paid into that wallet, or moved into it by a '
             'standing instruction from the income account before each due date.</li>'
             '<li>In law it is a preauthorised electronic fund transfer. The member may stop it at any time.</li></ul>')
    h.append(q35)
    h.append('<h3><b>Setup</b></h3>' + table(
        ['Step', 'What happens', 'What Halqa stores'],
        [['1. Wallet', 'The member links their wallet at the partner, authenticating on the partner&rsquo;s own screen. The partner '
                       'returns the registered title, which must match the CNIC', 'A link identifier, the masked IBAN and the title'],
         ['2. Income', 'The member shows that income arrives in the wallet, or sets a standing instruction from the income account '
                       'to the wallet, dated before the due date', 'The income evidence and the standing instruction date'],
         ['3. Backup card', 'Optional. A debit card in the member&rsquo;s own name, held by the partner as a token', 'The partner&rsquo;s card reference only'],
         ['4. Terms', 'One screen in English and Urdu shows the amount and its three parts, the dates, the wallet, the limit of one '
                      'instalment per collection, and how to stop it', 'The version of the terms and a fingerprint of the text'],
         ['5. Consent', 'The member confirms with the Halqa PIN and then with the partner&rsquo;s own confirmation. Nothing is ticked in advance',
          'The time, the device and the fingerprint'],
         ['6. Mandate', 'The partner creates and stores the mandate, with the roster as permitted payees', 'The mandate reference only'],
         ]))
    h.append('<h3><b>Monthly Collection</b></h3>' + table(
        ['When', 'What happens'],
        [['Evening before', 'The member is told the amount and the date'],
         ['Payday', 'One attempt on the member&rsquo;s payday, learned from the days on which earlier collections succeeded'],
         ['Due date', 'The main attempt. If the wallet has too little money, the backup card is charged once where one is held'],
         ['24 hours after', 'Second attempt, after a reminder'],
         ['48 hours after', 'Third and final attempt. No further automatic attempt is made for that instalment'],
         ['After a final failure', 'The missed instalment is recorded as owed to the member left short, the late ladder starts, and '
                                   'the member is told the reason'],
         ]))
    h.append('<h3><b>Daily Collection</b></h3><ul>'
             '<li>One debit a day at the fixed time stated in the circle&rsquo;s terms: Rs 450 on Option 1 or Rs 500 on Option 2.</li>'
             '<li>The debit is split at source: the contribution to the one collector the member is assigned to that day, the takaful '
             'contribution to the operator&rsquo;s fund, and the fee to Halqa.</li>'
             '<li>If it fails, the partner tries once more within the 12 hour grace period. After that the day is recorded as arrears '
             'and the late ladder applies; the next day&rsquo;s debit is taken as normal.</li>'
             '<li>One message a day tells the member what was taken and what is due next.</li></ul>')
    h.append('<h3><b>Illustration</b></h3><p>Ayesha is in an unknown committee of 12 members at Rs 10,000 a month, due on the 5th. '
             'Her employer pays her salary into her wallet at the partner on the 1st. On the evening of the 31st she is told that '
             'Rs 11,121.67 will be taken: Rs 10,000 for the member collecting that month, Rs 546.67 for takaful cover and Rs 575 for '
             'Halqa&rsquo;s fee with sales tax. On the 1st the partner takes it from her wallet and each part reaches its owner the '
             'same day. Had her salary been late, the partner would have tried again on the 5th, then on the 6th and the 7th, telling '
             'her each time.</p>')
    h.append('<h3><b>Mandate Limits</b></h3>' + table(
        ['Limit', 'Effect'],
        [['Amount', 'No collection can exceed one instalment, including its takaful part and fee'],
         ['Frequency', 'No more than one collection per due instalment, plus the stated retries'],
         ['Payees', 'Only the members of the roster, the operator&rsquo;s fund and Halqa&rsquo;s fee account'],
         ['Scope', 'One mandate per member per circle; it cannot be used for any other circle'],
         ['Sources', 'Only the member&rsquo;s wallet and the named backup card'],
         ['End', 'The mandate ends when the circle completes or the member leaves'],
         ]))
    h.append('<h3><b>Revocation</b></h3><p>A member may stop the auto pull in the application or with the partner at any time, and '
             'the stop takes effect at once. Stopping it does not end the member&rsquo;s commitment to the circle: the member then pays '
             'each instalment by approving it or sending it over Raast. A member of an unknown committee or Hyper who stops it cannot '
             'join another such circle without an active mandate.</p>')
    h.append('<h3><b>Exclusions</b></h3><ul>'
             '<li>Holding any member&rsquo;s money, even for a moment.</li>'
             '<li>Holding a card number, a wallet PIN, a password or a one time password.</li>'
             '<li>Taking any amount other than the instalment the member authorised.</li>'
             '<li>Trying more often than the schedule above, or after the final attempt.</li>'
             '<li>Recording a missed payment as money owed to Halqa.</li></ul>')
    h.append('<p>The partner provides auto pull to Halqa through its interface, under the State Bank&rsquo;s regulations for '
             'electronic money institutions, and notifies the State Bank before it begins.</p>' + q7
             + '<p>The partner&rsquo;s charge for each automatic debit is still to be agreed. The Business Model assumes 1 per cent of '
               'the debit capped at Rs 10, and tests 1.5 per cent without a cap.</p>')
    return ''.join(h)


def technical(num):
    """The collection engine: components, records and the order in which they act."""
    h = []
    h.append('<h2><b>%d. Technical Process</b></h2>' % num)
    h.append('<p>The collection engine is the part of Halqa&rsquo;s server that decides what is due, instructs the partner, '
             'records the result and keeps the arrears. It runs the same way for every tier; only the instruction differs.</p>')
    h.append('<h3><b>Components</b></h3>' + table(
        ['Component', 'Function'],
        [['Scheduler', 'Each evening lists the collections due next day, including payday attempts and retries, and each Hyper '
                       'day&rsquo;s payer assignment'],
         ['Instruction builder', 'Computes each instalment and its three parts, applies points and fee waivers, and gives each '
                                 'attempt its idempotency key'],
         ['Partner adapter', 'Holds the connection to the partner: access tokens, mandate calls, debit requests, rate limits and '
                             'retries on technical faults'],
         ['Webhook receiver', 'Accepts the partner&rsquo;s signed messages, verifies the signature and time stamp, and passes each '
                              'outcome to the ledger'],
         ['Ledger', 'Writes a double entry for each part of each settled payment, in the same database transaction that marks the '
                    'instalment paid'],
         ['Arrears engine', 'Records each missed instalment against the round, the late member and the member left short, and '
                            'settles it on the late member&rsquo;s collection day'],
         ['Reconciliation job', 'Matches the partner&rsquo;s daily settlement report to the ledger and holds a circle on any break'],
         ['Notice service', 'Sends the evening notice, reminders, receipts and failure reasons by application message and WhatsApp'],
         ]))
    h.append('<h3><b>Records</b></h3>' + table(
        ['Record', 'Main fields'],
        [['Mandate', 'Member, circle, partner mandate reference, status, amount limit, schedule, permitted payees, terms version and '
                     'fingerprint, consent time and device'],
         ['Attempt', 'Circle, round, member, attempt number, idempotency key, amount and parts, time sent, partner transaction '
                     'identifier, outcome, return code'],
         ['Ledger entry', 'Payment, part, debit account, credit account, amount, time, partner transaction identifier'],
         ['Arrears', 'Round, late member, member left short, amount, date missed, penalty step, date cleared and how'],
         ['Reconciliation break', 'Date, partner line, ledger line, difference, circle held, resolution'],
         ]))
    h.append('<h3><b>Order of Operations</b></h3><ol>'
             '<li>The scheduler creates the day&rsquo;s attempts. Each is unique by its idempotency key, so running the scheduler '
             'twice cannot create a second debit.</li>'
             '<li>The instruction builder sets the amount and parts. The partner adapter sends each request within the partner&rsquo;s '
             'rate limit and records the acknowledgement.</li>'
             '<li>The webhook receiver records each outcome. A settled outcome is written to the ledger and the instalment is marked '
             'paid; a failed outcome is passed to the retry policy.</li>'
             '<li>After the final failure the arrears engine records the arrears and the notice service tells the member and the host.</li>'
             '<li>Next morning the reconciliation job matches the settlement report. A break holds the circle&rsquo;s next collection '
             'until it is resolved.</li></ol>')
    return ''.join(h)
