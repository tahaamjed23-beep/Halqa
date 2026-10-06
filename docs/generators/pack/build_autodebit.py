# -*- coding: utf-8 -*-
"""Auto Debit (HQ-CP-02): the full technical and legal process by which an instalment is taken automatically.
Every quotation is verified against its source by lawcite before the document is rendered."""
import os, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import docgen as D
import lawcite as L
import cleanrules

OUT = os.path.join(D.HERE, 'out', 'partnership')
os.makedirs(OUT, exist_ok=True)


def Q(key, text, prov):
    return L.cite(D, key, text, prov)


def P(*paras):
    return ''.join(D.para(p) for p in paras)


T = D.table
b = []

b.append(P(
    'Auto debit is the method by which an instalment is taken from a member&rsquo;s account on the due date without the '
    'member acting each time. The member gives one standing authority, the mandate, to a licensed payment partner. On each '
    'due date Halqa&rsquo;s servers instruct the partner, the partner takes the instalment from the member&rsquo;s wallet, '
    'divides it into its parts and pays each part to its owner, and the partner reports the result back to Halqa. Halqa '
    'never holds the money and never holds a payment credential.',
    'This document sets out the whole process: the parties, the accounts, what payment methods exist in Pakistan and which of '
    'them can run automatically, the mandate, the credentials and tokens that are used, every message that passes between the '
    'systems, the controls, and the provision of law that governs each step.'))

b.append('<h2>1. Scope</h2>' + D.bullets([
    'Mandatory on unknown committees and on Hyper, as a condition of joining.',
    'Optional on known committees, where the member may instead approve each instalment or send it over Raast.',
    'The payment partner is a licensed electronic money institution. The candidates are NayaPay and SadaPay; neither is contracted.',
    'Halqa&rsquo;s own fee, when a member pays by hand rather than by auto debit, is received through a payment aggregator. '
    'The candidates are PayFast and Safepay; neither is contracted. PayFast is listed by the State Bank among the institutions '
    'offering Raast person to merchant payments.',
]))

b.append('<h2>2. Terms</h2>' + T([
    ['Term', 'Meaning'],
    ['Auto debit', 'A payment taken from a member&rsquo;s account by the institution that holds the account, under the member&rsquo;s '
                   'standing authority, without the member acting each time. In law it is a preauthorised electronic fund transfer.'],
    ['Mandate', 'The member&rsquo;s standing authority. It names the account to be debited, the payees, the amount, the schedule, the '
                'limits and the end date. It is held and enforced by the payment partner.'],
    ['Payment partner', 'The electronic money institution that holds the member&rsquo;s wallet, executes each debit, pays each part '
                        'to its payee and reports the result to Halqa.'],
    ['Electronic money institution (EMI)', 'A company licensed by the State Bank to issue electronic money wallets and to provide '
                                           'payment initiation, aggregation and interface services to other firms.'],
    ['Payment aggregator', 'A licensed provider through which a business accepts payments by many methods over one connection, and '
                           'which settles the proceeds to that business. Used by Halqa only for its own fee.'],
    ['Payment initiation', 'A service in which a third party sends an instruction, through the account provider&rsquo;s interface, '
                           'to make a payment from a customer&rsquo;s account with the customer&rsquo;s authority.'],
    ['Third party service provider (TPSP)', 'A firm that uses an electronic money institution&rsquo;s interfaces to serve that '
                                            'institution&rsquo;s customers. Halqa is a TPSP to the payment partner.'],
    ['Application programming interface (API)', 'The secured web addresses through which Halqa&rsquo;s servers send instructions to '
                                                 'the partner&rsquo;s systems and receive results, in a structured text format (JSON), '
                                                 'over encrypted connections.'],
    ['Access token', 'A credential valid for minutes, issued by the partner to Halqa&rsquo;s server after the server proves its '
                     'identity. It must accompany every instruction. It identifies Halqa, not a member, and cannot move money by itself.'],
    ['Mandate reference', 'The identifier the partner returns when a mandate is created. Halqa quotes it in each debit request. It is '
                          'not a payment credential: it works only inside an authenticated request from Halqa and only within the '
                          'mandate&rsquo;s limits.'],
    ['Card token', 'A substitute for a debit card number, issued by the card scheme or the partner, so that the card number itself '
                   'is never stored by anyone else. Used only where a member adds a debit card as a backup source.'],
    ['Webhook', 'A message the partner&rsquo;s system sends to Halqa&rsquo;s server when an event occurs, such as a debit settling or '
                'failing, carrying a signature that proves it came from the partner.'],
    ['Idempotency key', 'A unique value attached to each debit request so that, if the request is repeated after a network fault, '
                        'the partner executes it only once.'],
    ['Split settlement', 'One debit divided by the partner into parts, each credited to a different payee: the contribution to the '
                         'collecting member, the takaful contribution to the operator and the fee to Halqa.'],
    ['Return code', 'The partner&rsquo;s coded reason for a debit that failed, such as insufficient funds or a revoked mandate.'],
    ['Reconciliation', 'The daily comparison, line by line, of Halqa&rsquo;s ledger with the partner&rsquo;s settlement report.'],
    ['Raast', 'The State Bank&rsquo;s instant payment system, operated by Raast Payments Pakistan (Private) Limited. It carries '
              'payments between accounts at different institutions.'],
    ['Request to Pay (RTP)', 'A Raast request from a payee to a payer, which the payer must approve before money moves. Offered as '
                             'RTP Now, with a short expiry, and RTP Later, with a longer expiry.'],
    ['Standing instruction', 'An instruction a customer gives their own bank to transfer a fixed amount on a fixed schedule.'],
    ['Title inquiry', 'A lookup that returns the registered name on an account, used to confirm that the account belongs to the member.'],
], widths=['27%', '73%']))

b.append('<h2>3. Parties</h2>' + T([
    ['Party', 'Role in auto debit', 'What it holds'],
    ['Member', 'Authorises the mandate, keeps the wallet funded, may stop the mandate at any time', 'Their own wallet and accounts'],
    ['Collecting member', 'Receives the contribution for the round', 'Their payout account, a wallet or a bank account in their own name'],
    ['Payment partner', 'Holds the member&rsquo;s wallet; authenticates the member for the mandate; stores the mandate and any card '
                        'token; checks every debit against the mandate; debits, splits and pays; sends webhooks and the daily '
                        'settlement report; investigates errors', 'Members&rsquo; electronic money, backed by funds in its trust '
                                                                  'account at a licensed bank'],
    ['Takaful operator', 'Receives the takaful contribution into the participants&rsquo; risk fund', 'The fund'],
    ['Payment aggregator', 'Receives Halqa&rsquo;s fee when a member pays by hand, by Raast Request to Pay', 'Settles to Halqa&rsquo;s bank account'],
    ['Halqa', 'Decides who pays whom, how much and when; sends the instructions; keeps the ledger; notifies members; never receives '
              'a contribution', 'Its own fee in its own bank account; mandate references; no card number, PIN or password'],
    ['Raast', 'Carries each part whose payee holds an account at another institution', 'Nothing beyond settlement between institutions'],
], widths=['18%', '52%', '30%']))

# ---------------------------------------------------------------- accounts
b.append('<h2>4. Accounts</h2>' + T([
    ['Account', 'What it is', 'Rule'],
    ['Collection wallet', 'A wallet in the member&rsquo;s own name at the payment partner. Each wallet carries an IBAN, under the '
                          'State Bank&rsquo;s IBAN Implementation Guidelines for EMIs (PSD Circular Letter No. 03 of 2021), so income '
                          'can be paid straight into it', 'The only account the auto debit is taken from'],
    ['Income account', 'The account into which the member&rsquo;s income arrives, verified under the Income Account Verification '
                       'Model (HQ-MF-03)', 'Either the collection wallet itself, or an account that funds the wallet by a standing '
                                          'instruction before each due date'],
    ['Backup card', 'Optional. A debit card in the member&rsquo;s own name, held by the partner as a card token', 'Charged once, only '
                    'when the wallet has too little money, and only where the issuing bank allows a charge without a one time password'],
    ['Payout account', 'Where a collecting member receives the contribution: their wallet, or a bank account in their own name', 'Must be '
                       'able to receive the whole pot within its monthly limit'],
], widths=['18%', '52%', '30%'])
    + P('Two rules in the State Bank&rsquo;s regulations shape these accounts. A person may hold only one wallet with any one '
        'electronic money institution, so the backup source cannot be a second wallet at the partner. And every wallet has a '
        'monthly limit, counted separately for money in and money out, which depends on how the holder was verified.')
    + Q('EMI', 'EMIs shall ensure that a CNIC holder can obtain/open only one e-money payment instrument with an EMI.', 'paragraph 12.II')
    + Q('EMI', 'a) The aggregate monthly load limit of an e-money payment instrument shall be PKR 50,000 on CNIC verification (NADRA '
               'VeriSys) and PKR 400,000 on biometric verification from NADRA. The transaction limits shall be treated separately for '
               'both payments and receipts on EMI instruments only.', 'paragraph 14.II(a), limits during commercial operations')
    + D.bullets([
        'A member whose salary is paid into the collection wallet will usually need biometric verification with the partner, since '
        'a salary above Rs 50,000 a month would exceed the lower limit.',
        'A collecting member whose pot would take their wallet past its limit for the month is paid into their bank account '
        'instead. Halqa checks this when seats are allocated, not on the day, so no pot is ever refused.',
        'The regulations also allow enhanced wallets of up to Rs 1,000,000 a month with proof of income, at the partner&rsquo;s discretion.',
    ]))

# ---------------------------------------------------------------- methods
b.append('<h2>5. Payment Methods</h2>' + P(
    'Not every way of moving money in Pakistan can run without the payer acting. Raast, the national system that connects '
    'banks and wallets, carries payments that the payer pushes or approves; it does not let a payee pull money from an account '
    'at another institution. No interbank direct debit service for retail accounts appears among the Raast services the State '
    'Bank publishes.')
    + Q('RAASTP2M', 'Raast uses more secure payment types, ensures that each transaction is authorized by the payer, and offers enhanced '
                    'data protection and fraud detection services.', 'features of Raast')
    + Q('RAASTP2M', 'Request to Pay (RTP) Now A request initiated by the receiver of payment to the sender of payment with a shorter expiry '
                    'period. Request to Pay (RTP) Later A Request initiated by the receiver of payment to the sender of payment with a '
                    'longer expiry period.', 'Raast Person to Merchant, payment acceptance modes')
    + T([
        ['Method', 'How it works', 'Runs without the payer acting', 'Use at Halqa'],
        ['Debit of a wallet held at the partner', 'The partner debits its own customer&rsquo;s wallet under the mandate. No interbank '
                                                  'system is involved in taking the money', 'Yes', 'The auto debit'],
        ['Debit card held as a token', 'The partner charges the member&rsquo;s card through the card scheme, using the token', 'Only '
                                       'where the issuing bank allows a charge without a one time password', 'Backup source only, '
                                                                                                             'where confirmed'],
        ['Standing instruction at the member&rsquo;s bank', 'The member&rsquo;s own bank sends a fixed amount to the collection wallet '
                                                             'on a fixed day', 'Yes, once the member sets it up with their bank, '
                                                                               'where the bank offers it', 'Funding the wallet from an '
                                                                                                           'income account elsewhere'],
        ['Raast Request to Pay', 'The payee requests; the payer approves in their banking application', 'No, one approval each time',
         'Halqa&rsquo;s own fee when a member pays by hand'],
        ['Raast push payment', 'The payer sends from their own bank or wallet to an IBAN or Raast ID', 'No', 'Paying by hand, and '
                                                                                                         'the partner&rsquo;s payment of '
                                                                                                         'each part to payees elsewhere'],
    ], widths=['20%', '34%', '22%', '24%'])
    + P('The auto debit therefore runs on the member&rsquo;s wallet at the partner. A member whose income arrives in that wallet '
        'needs nothing more. A member whose income arrives at another bank keeps the wallet funded by a standing instruction, '
        'where their bank offers one, set for a day before the due date. Money sent between banks and wallets is free to the '
        'sender up to Rs 25,000 a month, and after that costs at most 0.1 per cent or Rs 200, whichever is lower.')
    + Q('IBFT', 'After the monthly limit of Rs.25,000 is exhausted, Banks/MFBs/EMIs may charge their individual customers, a transaction '
                'fee of 0.1% of the transaction amount or Rs.200, whichever is lower.', 'paragraph 3'))

# ---------------------------------------------------------------- mandate
b.append('<h2>6. Mandate</h2>' + P(
    'The mandate is created by the partner, stored by the partner and enforced by the partner. Halqa proposes its terms and '
    'keeps a copy of them; the partner refuses any debit that falls outside them, whatever Halqa sends.')
    + T([
        ['Field', 'Content', 'Example'],
        ['Mandate reference', 'The partner&rsquo;s identifier', 'MDT 2026 0412 07'],
        ['Payer', 'The member and their collection wallet, shown masked', 'Ayesha, wallet ending 4471'],
        ['Circle', 'The circle and its roster, fixed when the circle starts', 'Circle 0412, 12 members'],
        ['Permitted payees', 'The payout account of every member of the roster, the operator&rsquo;s fund account and Halqa&rsquo;s fee '
                             'account. Any other payee is refused', '14 accounts'],
        ['Amount', 'The instalment and its parts', 'Rs 11,121.67: Rs 10,000.00, Rs 546.67 and Rs 575.00'],
        ['Maximum per debit', 'Equal to one instalment', 'Rs 11,121.67'],
        ['Schedule', 'The due date and the attempts allowed', 'The 5th of each month; one payday attempt; two retries'],
        ['Period', 'First and last collection', 'July 2026 to June 2027'],
        ['Backup source', 'The card token reference, if any', 'None'],
        ['Consent', 'Partner authentication and Halqa PIN confirmation, with time and device', '28 June 2026, 21:04'],
        ['Terms', 'The version of the terms shown and a fingerprint (hash) of the text', 'Version 3, hash recorded'],
        ['Status', 'Active, suspended, revoked or completed', 'Active'],
    ], widths=['20%', '50%', '30%'])
    + P('Two features make a mandate safe even if Halqa&rsquo;s systems were misused. The permitted payees are fixed to the roster '
        'at the start, so money can reach only a member of the circle, the operator or Halqa&rsquo;s fee account. And the amount and '
        'schedule are fixed, so no debit can exceed one instalment or fall outside the stated dates.'))

# ---------------------------------------------------------------- credentials
b.append('<h2>7. Credentials and Tokens</h2>' + T([
    ['Credential', 'Issued by', 'Held by', 'Life', 'Purpose', 'Limits'],
    ['Client identity and certificate', 'The partner, at onboarding', 'Halqa&rsquo;s secrets vault', 'Renewed at least yearly',
     'Proves Halqa&rsquo;s server to the partner', 'Accepted only over mutual TLS from Halqa&rsquo;s registered addresses'],
    ['Access token', 'The partner&rsquo;s authorisation server, under the OAuth 2.0 client credentials grant', 'Server memory only',
     'Minutes, as the partner sets', 'Accompanies every request', 'Carries no member authority; expires quickly'],
    ['Mandate reference', 'The partner, when the mandate is created', 'Halqa&rsquo;s database', 'Until the mandate ends',
     'Names the mandate in a debit request', 'Useless outside an authenticated request; bounded by the mandate'],
    ['Wallet PIN and one time passwords', 'The partner', 'The member only', 'As the partner sets', 'The member authenticates to the partner',
     'Never seen, entered or stored by Halqa'],
    ['Card number and card token', 'The card scheme or the partner', 'The partner&rsquo;s card vault', 'Until the card expires',
     'Charging the backup card', 'Halqa never sees the card number'],
    ['Webhook signing secret', 'Agreed at onboarding', 'Both parties&rsquo; vaults', 'Rotated yearly', 'Proves a webhook came from the partner', 'Never sent with a message'],
    ['Member session token', 'Halqa', 'The member&rsquo;s phone, in secure storage', 'Short, renewed on use', 'Authorises the member&rsquo;s '
     'requests to Halqa', 'Cannot reach the partner'],
], widths=['15%', '17%', '14%', '12%', '20%', '22%'])
    + P('The distinction that matters is between a credential that can move money and one that cannot. Only the partner holds '
        'anything that can move money, and only within a mandate the member authenticated with the partner directly. Halqa holds '
        'an identity for its own server and references to mandates, neither of which can move money on its own.'))

# ---------------------------------------------------------------- process
b.append('<h2>8. Technical Process</h2>'
         + '<h3>8.1 Wallet Linking</h3>' + D.steps([
             'The member opens a wallet with the partner, or uses one already held. The partner carries out its own customer due '
             'diligence, including NADRA verification, before the wallet can be used.',
             'In Halqa&rsquo;s application the member chooses to link the wallet. Halqa&rsquo;s server asks the partner to open a '
             'linking session and receives a session identifier.',
             'The member is taken to the partner&rsquo;s own screen and authenticates there with the wallet PIN and a one time password '
             'sent to the mobile number registered with the partner. Halqa sees neither.',
             'The partner returns a link identifier, the masked IBAN and the registered title of the wallet.',
             'Halqa compares the title with the name on the member&rsquo;s CNIC. A mismatch stops the process and is reviewed by hand.',
         ])
         + '<h3>8.2 Mandate Creation</h3>' + D.steps([
             'When the member joins a circle, Halqa computes the instalment and its parts and shows the terms screen, in English and '
             'Urdu, before any consent is asked for.',
             'The member confirms with the Halqa PIN. Halqa records the time, the device and the fingerprint of the terms shown.',
             'Halqa&rsquo;s server sends the partner a mandate request with the fields in section 6. The partner shows the member a '
             'summary on its own screen and asks for its own confirmation.',
             'The partner creates the mandate, stores it, and returns the mandate reference and its status. Halqa stores the reference '
             'and nothing else about the payment method.',
             'The partner and Halqa each send the member a confirmation of what was authorised.',
         ])
         + '<h3>8.3 Debit Execution</h3>' + D.steps([
             'Scheduling. At the close of each day Halqa&rsquo;s scheduler lists the debits due the next day, including payday '
             'attempts, and gives each a unique idempotency key made from the circle, the round, the member and the attempt number.',
             'Notice. The evening before, each member is told the amount, its parts, the date and the wallet.',
             'Instruction. At the scheduled time Halqa&rsquo;s server obtains an access token and sends one debit request per member, '
             'with the fields in section 9.',
             'Checks by the partner. The mandate is active; the amount is within its limit; the attempt is within the schedule; each '
             'payee is permitted; the wallet has enough money; the wallet limits allow it.',
             'Acknowledgement. The partner replies at once with a transaction identifier and the status accepted, or with a return '
             'code if a check failed.',
             'Execution. The partner debits the wallet and pays each part. A payee whose account is at the partner is credited at '
             'once; a payee elsewhere is paid over Raast.',
             'Confirmation. The partner sends a signed webhook stating the outcome of each part. Halqa verifies the signature and the '
             'time stamp, finds the request by its idempotency key, and replies that it has received the message.',
             'Recording. In one database transaction Halqa writes a double entry for each part, marks the member&rsquo;s instalment '
             'for that round as paid, and closes the attempt.',
             'Receipts. The payer and the collecting member each receive a receipt naming the amount, the parts, the date and the '
             'transaction identifier. The partner sends its own transaction alert, as its regulations require.',
         ])
         + Q('EMI', 'EMI shall send transaction alerts in real time to their customers for all transactions.', 'paragraph 12.VIII')
         + '<h3>8.4 Failure Handling</h3>' + D.steps([
             'A failed debit arrives as a webhook with a return code, or as a refusal in the acknowledgement.',
             'Insufficient funds: the backup card is tried once where one is held, and the next attempt is scheduled. Attempts are '
             'made on the payday, at the due time, 24 hours after it and 48 hours after it, and never more.',
             'Mandate revoked, wallet closed or payee refused: no retry. The member is moved to paying by hand and told why.',
             'Technical fault at the partner: the same request is resent with the same idempotency key, which cannot cause a second '
             'debit, and the attempt is not counted against the member.',
             'After the final failure the missed instalment is recorded as arrears owed to the member left short, the late ladder '
             'begins, and the member and the host are told.',
         ])
         + '<h3>8.5 Reconciliation</h3>' + D.steps([
             'Each morning the partner provides a settlement report for the previous day, listing every debit and every part paid, '
             'with transaction identifiers and idempotency keys.',
             'Halqa matches the report to its ledger line by line. Every debit must match in amount, parts, payees and date.',
             'A difference is a break. A break holds the next collection of the circle concerned until it is resolved with the partner.',
             'Monthly, the takaful operator&rsquo;s statement is matched to the takaful parts paid, and Halqa&rsquo;s bank statement to '
             'the fee parts.',
         ])
         + '<h3>8.6 Revocation</h3>' + D.steps([
             'In the application: Halqa asks the partner to revoke the mandate and waits for the partner&rsquo;s confirmation webhook.',
             'With the partner directly: the partner revokes it and sends Halqa a webhook.',
             'Either way the stop takes effect at once. Halqa marks the mandate closed, moves the member to paying by hand, tells the '
             'host, and prevents the member from joining another unknown committee or Hyper without a new mandate.',
             'Stopping the mandate does not end the member&rsquo;s obligation to the circle, which is stated on the stop screen.',
         ])
         + '<h3>8.7 Disputes</h3>' + D.steps([
             'A member who believes a debit is wrong reports it in the application. Halqa opens a dispute record, attaches the '
             'consent, the mandate reference and the attempt log, and passes it to the partner the same day.',
             'The partner investigates and reports in writing within ten business days, and corrects any error within one business '
             'day of finding it, as the Act requires.',
         ]))

# ---------------------------------------------------------------- messages
b.append('<h2>9. Messages</h2>' + P('The content of a debit request, with the values for the example in section 13.') + T([
    ['Field', 'Example', 'Purpose'],
    ['Mandate reference', 'MDT 2026 0412 07', 'Identifies the authority relied on'],
    ['Idempotency key', 'C0412 R03 M07 A1', 'Circle 0412, round 3, member 7, attempt 1; prevents a double debit'],
    ['Amount', 'Rs 11,121.67', 'Must not exceed the mandate&rsquo;s limit'],
    ['Part 1', 'Rs 10,000.00 to the IBAN of the collecting member', 'The contribution'],
    ['Part 2', 'Rs 546.67 to the operator&rsquo;s participants&rsquo; risk fund account', 'The takaful contribution'],
    ['Part 3', 'Rs 575.00 to Halqa&rsquo;s fee account', 'The fee, Rs 500, with sales tax at 15 per cent'],
    ['Narrative', 'Halqa circle 0412 round 3', 'Shown on each party&rsquo;s statement'],
    ['Requested date', '1 September 2026', 'The payday attempt'],
], widths=['22%', '40%', '38%'])
    + P('The sequence for one debit, from instruction to reconciliation.')
    + T([
        ['Step', 'From', 'To', 'Message'],
        ['1', 'Halqa server', 'Partner', 'Token request, over mutual TLS with the client certificate'],
        ['2', 'Partner', 'Halqa server', 'Access token'],
        ['3', 'Halqa server', 'Partner', 'Debit request with the fields above'],
        ['4', 'Partner', 'Halqa server', 'Acknowledgement: accepted, with a transaction identifier'],
        ['5', 'Partner', 'Raast', 'Credit to each payee at another institution'],
        ['6', 'Partner', 'Halqa server', 'Webhook: outcome of each part, signed'],
        ['7', 'Halqa server', 'Partner', 'Receipt of the webhook'],
        ['8', 'Halqa server', 'Members', 'Receipts to the payer and the collecting member'],
        ['9', 'Partner', 'Halqa server', 'Next morning: settlement report, reconciled by Halqa'],
    ], widths=['8%', '18%', '18%', '56%'])
    + T([
        ['Outcome reported', 'Halqa&rsquo;s response'],
        ['Settled', 'Ledger written, instalment marked paid, receipts sent'],
        ['Pending', 'Nothing written. Settlement is recorded only on the signed webhook'],
        ['Insufficient funds', 'Backup card once where held; next attempt scheduled; member told'],
        ['Wallet limit reached', 'No retry that day; member told how to raise the limit or pay by hand'],
        ['Mandate revoked', 'Mandate closed; member moved to paying by hand; no retry'],
        ['Wallet closed or invalid', 'Mandate closed; member asked to link another wallet; no retry'],
        ['Payee not permitted', 'No retry; incident opened, since it can only arise from an error in the instruction'],
        ['Technical fault', 'Resent with the same idempotency key; not counted against the member'],
        ['Duplicate', 'The original result is returned; nothing further is debited'],
    ], widths=['28%', '72%']))

# ---------------------------------------------------------------- hyper
b.append('<h2>10. Daily Collection</h2>' + P(
    'Hyper collects every day, so the same process runs as a daily batch.') + D.steps([
    'At the start of each day the payer assignment is computed. On Option 1, the 392 members not collecting are divided among the '
    '8 collectors, 49 to each; on Option 2, the 375 members not collecting among 15 collectors, 25 to each.',
    'At the fixed collection time stated in the circle&rsquo;s terms, one debit is sent for each paying member: Rs 450 on Option 1 '
    'or Rs 500 on Option 2, split into the contribution to that member&rsquo;s assigned collector, the takaful contribution and the fee.',
    'Requests are sent in batches within the partner&rsquo;s rate limit, each with its own idempotency key.',
    'A failed debit is tried once more within the 12 hour grace period. After that the day is recorded as arrears owed to the '
    'assigned collector.',
    'At the close of the day the stress index is computed and the hard stop is checked before the next day is opened (Hyper '
    'Default Threshold Model, HQ-MF-01).',
    'One message a day tells each member what was taken and what is due next.',
]))

# ---------------------------------------------------------------- controls
b.append('<h2>11. Controls</h2>' + T([
    ['Control', 'Detail'],
    ['Transport', 'All traffic encrypted with TLS 1.2 or higher. Mutual TLS between Halqa and the partner, each presenting a certificate'],
    ['Network', 'The partner accepts requests only from Halqa&rsquo;s registered server addresses; Halqa accepts webhooks only from the partner&rsquo;s'],
    ['Authentication', 'OAuth 2.0 client credentials; access tokens valid for minutes; secrets kept in a managed vault and rotated'],
    ['Message integrity', 'Every webhook carries an HMAC signature and a time stamp. Messages older than five minutes, or already '
                          'received, are rejected'],
    ['Idempotency', 'One key per attempt, enforced by a unique constraint in Halqa&rsquo;s database and by the partner'],
    ['Limits', 'Amount, schedule and permitted payees enforced by the partner and checked again by Halqa before sending'],
    ['Separation', 'Separate credentials for testing and for live money. No person can send a debit outside the schedule without a '
                   'second person&rsquo;s approval'],
    ['Data', 'No card number, PIN or password is stored. Account numbers are masked. Stored data is encrypted'],
    ['Monitoring', 'Alerts on failure rates, reconciliation breaks and unusual volumes. A single switch suspends every debit at once'],
    ['Audit', 'Every mandate and debit event is written to an append only log and kept for the retention period'],
], widths=['20%', '80%']))

# ---------------------------------------------------------------- law
b.append('<h2>12. Legal Requirements</h2>' + P(
    'The law of auto debit is the Payment Systems and Electronic Fund Transfers Act 2007, read with the State Bank&rsquo;s '
    'Regulations for Electronic Money Institutions 2023. The Act calls an auto debit a preauthorised electronic fund transfer.')
    + Q('PSEFT', '"Preauthorized Electronic Fund Transfer" means an Electronic Fund Transfer Authorized in advance', 'section 2(zf)')
    + Q('PSEFT', '(1) A preauthorized Electronic Fund Transfer from a Consumer\'s Account may be authorized by the Consumer either in '
                 'writing, or in any other accepted form. (2) A consumer may stop payment of a Preauthorized Electronic Fund '
                 'Transfer by notifying the Financial Institution.', 'section 35, Preauthorized Transfers')
    + Q('PSEFT', 'the burden of proof shall be upon the Financial Institution or the Authorized Party to show that the Electronic Fund '
                 'Transfer was authorized', 'section 41, Burden of Proof')
    + P('Section 41 is the reason the partner, and not only Halqa, authenticates the member when the mandate is created: the '
        'partner must be able to prove the authority itself.')
    + Q('EMI', '(f) Services relating to payment aggregation, bill/invoice aggregation, payment initiation, as well as account '
               'information etc. ... (h) Offer services via secured Application Programming Interfaces (APIs) and other secure '
               'methods to other Financial Institutions, Third Party Service Providers (TPSPs) and other Fintech. In this regard, '
               'the EMIs have to intimate SBP 30 days prior to offering these services.', 'paragraph 7.I(f) and (h)')
    + Q('PSO', 'PSOs and PSPs will not act as custodian of consumer\'s money or perform any banking function(s) as defined in BCO, 1962.',
        'rule 6(5)')
    + Q('CA', 'no company shall invite, accept or renew deposits from the public', 'section 84(1)')
    + Q('ETO', 'The requirement under any law for affixation of signatures shall be deemed satisfied where electronic signatures or '
               'advanced electronic signature are applied.', 'section 7')
    + T([
        ['Step', 'Requirement', 'Provision', 'Duty falls on'],
        ['Partner arrangement', 'The partner may serve Halqa through its interface after notifying the State Bank 30 days ahead',
         'EMI Regulations 2023, para 7.I(f) and (h)', 'The partner'],
        ['Custody', 'The partner, not a payment service provider, holds the money; Halqa takes no deposit',
         'PSO/PSP Rules 2014, r.6(5); Companies Act 2017, s.84(1)', 'The partner; Halqa by design'],
        ['Wallet', 'One wallet per CNIC per institution; limits by level of verification', 'EMI Regulations 2023, paras 12.II and 14.II(a)', 'The partner'],
        ['Terms', 'Terms disclosed in English and understood by the member before the service begins', 'PS&amp;EFT Act 2007, s.30(1)', 'The partner; Halqa presents them'],
        ['Consent', 'Authority given in advance, in writing or another accepted form', 'PS&amp;EFT Act 2007, s.35(1); ETO 2002, ss.3, 4 and 7', 'The member'],
        ['Proof', 'The partner must be able to prove the debit was authorised', 'PS&amp;EFT Act 2007, s.41', 'The partner'],
        ['Records', 'Consent and terms kept complete and unaltered, with origin, destination and time', 'ETO 2002, ss.5 and 6', 'Halqa and the partner'],
        ['Alerts', 'Real time alert to the member for every transaction', 'EMI Regulations 2023, para 12.VIII', 'The partner'],
        ['Changes', '21 days&rsquo; notice of a material change', 'PS&amp;EFT Act 2007, s.31(1)', 'The partner'],
        ['Stopping', 'The member may stop the mandate at any time', 'PS&amp;EFT Act 2007, s.35(2)', 'The partner'],
        ['Errors', 'Investigation within ten business days; correction within one business day of finding an error', 'PS&amp;EFT Act 2007, ss.36(2) and 37', 'The partner'],
    ], widths=['14%', '42%', '26%', '18%']))

# ---------------------------------------------------------------- example
b.append('<h2>13. Illustration</h2>' + P(
    'Ayesha belongs to an unknown committee of 12 members at Rs 10,000 a month, due on the 5th. Her employer pays her salary into '
    'her collection wallet on the 1st, and she completed biometric verification with the partner so the wallet can receive it. '
    'In September the collecting member is Bilal, who chose to be paid into his bank account at another bank.')
    + T([
        ['Time', 'Event'],
        ['31 August, 20:00', 'Ayesha is told that Rs 11,121.67 will be taken on 1 September: Rs 10,000 for Bilal, Rs 546.67 for takaful '
                             'cover and Rs 575 for Halqa&rsquo;s fee with sales tax'],
        ['1 September, 09:00', 'Her salary arrives in the wallet'],
        ['1 September, 10:00', 'Halqa sends the debit request with key C0412 R03 M07 A1. The partner accepts it'],
        ['1 September, 10:00', 'The partner debits the wallet. Rs 10,000 goes to Bilal&rsquo;s bank over Raast; Rs 546.67 to the operator&rsquo;s '
                               'fund; Rs 575 to Halqa&rsquo;s fee account'],
        ['1 September, 10:01', 'The signed webhook reports all three parts paid. Halqa writes the ledger and sends receipts to Ayesha and Bilal'],
        ['2 September, 07:00', 'The partner&rsquo;s settlement report matches Halqa&rsquo;s ledger'],
    ], widths=['24%', '76%'])
    + P('Had the salary been late, the partner would have refused the payday attempt for insufficient funds, and Halqa would have '
        'tried again at 10:00 on the 5th, then on the 6th and the 7th, telling Ayesha each time. The partner&rsquo;s charge for the '
        'debit, planned at 1 per cent capped at Rs 10, is billed to Halqa and never taken from Ayesha&rsquo;s instalment.'))

# ---------------------------------------------------------------- requirements
b.append('<h2>14. Requirements</h2>' + T([
    ['Item', 'Detail', 'Status'],
    ['Services agreement with the partner', 'Payment initiation and interface services to Halqa as a TPSP, with the controls in section 11', 'To agree'],
    ['State Bank notice', 'Given by the partner 30 days before the service begins', 'With the agreement'],
    ['Merchant agreement with the aggregator', 'For Halqa&rsquo;s own fee when paid by hand', 'To agree'],
    ['Fund account details', 'The takaful operator&rsquo;s participants&rsquo; risk fund account', 'With the agency agreement'],
    ['Interfaces from the partner', 'Access token; wallet linking; title inquiry; mandate creation, change, status and revocation; debit with '
                                    'split and idempotency; webhooks for debits and mandates; settlement report; error and refund handling', 'To confirm'],
    ['Halqa components', 'Scheduler; terms screen and consent record; mandate store; webhook receiver with signature check; ledger; '
                         'reconciliation job; notice service; dispute record; monitoring and suspension switch', 'Partly built; see the '
                                                                                                                  'Collection and Auto Debit Specification (HQ-CP-09)'],
], widths=['26%', '56%', '18%']))

b.append('<h2>15. Open Items</h2>' + D.bullets([
    'Whether one mandate can carry a fixed list of permitted payees, with the payee chosen in each request.',
    'Whether one debit can be split into three payees, and which payees at other institutions are paid over Raast.',
    'Whether a backup card can be held as a token and charged without a one time password, and for which issuing banks.',
    'The partner&rsquo;s charge per debit, sought as a fixed amount per transaction rather than a percentage.',
    'The return codes, the webhook events and the format of the daily settlement report.',
    'The rate limit on debit requests, which sets how long a Hyper daily batch takes.',
    'The date on which the partner would give the State Bank its 30 day notice.',
]))

b.append(D.summary(
    'The member signs one mandate with the payment partner, NayaPay or SadaPay, confirming it on the partner&rsquo;s own screen. '
    'On each due date Halqa&rsquo;s server tells the partner to take the instalment, quoting the mandate. The partner checks the '
    'mandate, takes the money from the member&rsquo;s wallet, and pays the contribution to the member collecting, the takaful part '
    'to the operator and the fee to Halqa, then reports back. Halqa never holds the money or the member&rsquo;s payment details, '
    'and the member can stop the mandate at any time.'))

body = ''.join(b)
cleanrules.check('Auto Debit', body)
path = os.path.join(OUT, 'Auto Debit.pdf')
D.render(path, 'Auto Debit', 'How an instalment is taken automatically: the parties, the accounts, the mandate, the credentials, the '
         'messages between systems, the controls and the law that governs each step.', 'HQ-CP-02', body=body)
print('Auto Debit', D.pdf_pages(path), 'pages')
