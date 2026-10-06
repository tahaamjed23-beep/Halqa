# -*- coding: utf-8 -*-
"""One-off patch of conv_existing.py: technical design (wallet at the partner, backup card), renamed documents,
route wording removed, technical sections and 3D figures added. Every replacement must match exactly once."""
import io, re

P = 'conv_existing.py'
s = io.open(P, encoding='utf-8').read()


def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        raise SystemExit('expected %d, found %d: %s' % (count, n, a[:140]))
    s = s.replace(a, b)


def rep_line_starting(prefix, new_line):
    """Replace the whole line that starts with prefix (after indentation)."""
    global s
    lines = s.split('\n')
    hits = [i for i, l in enumerate(lines) if l.lstrip().startswith(prefix)]
    if len(hits) != 1:
        raise SystemExit('line prefix hits %d: %s' % (len(hits), prefix))
    i = hits[0]
    indent = lines[i][:len(lines[i]) - len(lines[i].lstrip())]
    lines[i] = indent + new_line
    s = '\n'.join(lines)


# ---------------------------------------------------------------- Feature List
rep_line_starting("('Tier two, auto debit',",
                  "('Tier two, auto debit', 'A mandate held by the partner authorises collection without a prompt, on the pay day and on "
                  "the due date, from the member&rsquo;s wallet at the partner, into which the income is paid or moved by standing "
                  "instruction. Mandatory on unknown committees and Hyper, with an optional backup card (Auto Debit, HQ-CP-02).'), FL)")
rep_line_starting("('Failed collection', 'A failed attempt is recorded and the member is told the reason.",
                  "('Failed collection', 'A failed attempt is recorded and the member is told the reason. At most three attempts are "
                  "made, at the due time, after 24 hours and after 48 hours, and a backup card is charged once where one is held.'), FL)")
rep_line_starting("('Income account', 'Required on unknown committees and Hyper, verified under HQ-MF-03, and the account the auto debit is taken from.'), FL)",
                  "('Income account', 'Required on unknown committees and Hyper and verified under HQ-MF-03. It is either the wallet the "
                  "auto debit is taken from, or the account that funds that wallet by standing instruction.'), FL)")
rep_line_starting("('Turn swap', 'Two members exchange positions with both consenting and nothing passing between them.",
                  "('Turn swap', 'Two members exchange seats with both consenting and nothing passing between them. Halqa rewards the "
                  "member moving later with fee waivers and points on a published schedule, and the member moving earlier pays Halqa a "
                  "flat exchange fee of Rs 500 (Seat Exchange and Points, HQ-CP-04). Subject to the opinion of counsel.'), FL)")
rep_line_starting("('Asset circles', 'A licensed modaraba buys the asset,",
                  "('Asset circles', 'A licensed modaraba buys the asset, leases it to the member under ijarah and carries the credit "
                  "risk, in two configurations, and ownership passes when the circle ends (Asset Committees, HQ-CP-01). Later, subject "
                  "to the opinion of counsel.'), FL)")
# remove the early money row, which belonged to a route not chosen
m = re.search(r"FL\.append\(after_row\(\('Gold circles'.*?\)\)\)\n", s, flags=re.S)
if not m:
    raise SystemExit('early money block not found')
s = s[:m.start()] + s[m.end():]
rep("('Asset circle', 'Later, through a modaraba under ijarah (HQ-CP-01).')",
    "('Asset circle', 'Later, through a modaraba under ijarah, in two configurations (Asset Committees, HQ-CP-01).')")

extra_fl = '''FL += [
    (row('Token mandate', 'The partner holds a token against the member account or card and collects against it on the due date.'),
     row('Token mandate', 'The partner holds the mandate against the member&rsquo;s wallet, and a card token where a backup card is added, and collects on the due date.')),
    (row('Mandate pricing', 'Charged by the partner, indicatively one and one half per cent of the amount collected, to be confirmed.'),
     row('Mandate pricing', 'Charged by the partner per debit; planned at 1 per cent capped at Rs 10 and tested at 1.5 per cent uncapped, to be agreed.')),
    (row('Points', 'Issued by Halqa to the later seats as compensation for waiting.'),
     row('Points', 'Issued by Halqa to members in the later seats and to the member who moves later in a seat exchange, on the published schedule in Seat Exchange and Points (HQ-CP-04). One point is worth one rupee off a Halqa fee.')),
    (row('Redemption with a commerce partner', 'Points are redeemable against goods with a commerce partner, which turns an internal credit into value the member can use.'),
     row('Redemption for vouchers', 'Points can be exchanged for a retail voucher that Halqa buys with its own money. The retailer never accepts a point, which keeps points outside the definition of electronic money.')),
    (row('Commerce partner candidates', 'Daraz, foodpanda and Careem.'), row('Voucher retailers', 'Daraz, foodpanda and Careem, none contracted.')),
]
fl = edit(fl, FL, 'FL')'''
rep("fl = edit(fl, FL, 'FL')", extra_fl)

arch = '''
ARCH = ('<h2><b>29. Technical Architecture</b></h2>'
        + '<p>How the parts of the system fit together, and every outside system Halqa connects to.</p>'
        + '<table><tr><th><b>Layer</b></th><th><b>Component</b></th><th><b>Detail</b></th></tr>'
        + row('Client', 'Web application, installable on the handset', 'PIN on every open; session token in secure storage; no payment credential on the device')
        + row('Server', 'Stateless application service', 'Every request validated against a schema and checked for membership, hosting or ownership')
        + row('Data', 'Relational database', 'Circles, members, obligations, mandates, attempts, ledger, points ledger and arrears; schema changes versioned')
        + row('Jobs', 'Scheduler and job queue', 'Evening scheduling, the Hyper daily batch, retries, reconciliation, notices and points expiry')
        + row('Records', 'Append only logs', 'Every change of state, consent and payment event, with the actor and the time')
        + '</table>'
        + '<table><tr><th><b>Outside system</b></th><th><b>Purpose</b></th><th><b>Connection</b></th><th><b>Credential Halqa holds</b></th></tr>'
        + row('Payment partner, NayaPay or SadaPay', 'Wallet linking, mandates, debits, settlement report', 'Interface over mutual TLS; signed webhooks', 'Client certificate, access tokens, webhook secret')
        + row('Payment aggregator, PayFast or Safepay', 'Halqa&rsquo;s own fee when paid by hand', 'Merchant interface', 'Merchant keys')
        + row('NADRA', 'CNIC verification', 'Verisys under a corporate agreement', 'Agreement credentials')
        + row('AWS Rekognition', 'Face liveness and match', 'Cloud interface', 'Cloud keys')
        + row('TASDEEQ', 'Credit report on the member&rsquo;s instruction', 'Subscriber interface', 'Subscriber credentials')
        + row('Takaful operator', 'Enrolment, contributions and claims', 'Daily file or interface', 'Agreed credentials')
        + row('WhatsApp Business Platform', 'Notices, passcodes and receipts', 'Cloud interface', 'Access token')
        + row('Modaraba, later', 'Asset committee applications, decisions and statements', 'Secure interface', 'Agreed credentials')
        + '</table>'
        + '<p>A payment moves through the system in this order: the scheduler creates the attempt; the instruction builder sets the '
          'amount and its parts; the partner adapter sends the debit; the partner&rsquo;s signed webhook reports the outcome; the '
          'ledger records it and the receipts are sent; and next morning the reconciliation job matches the partner&rsquo;s report. '
          'The full process is in Auto Debit (HQ-CP-02).</p>')
fl_b = ('''
rep("\nfl_b = ('", arch + "'")
rep("        + hyper_case(generic_body(fl))\n        + D.summary('This is the full list",
    "        + hyper_case(generic_body(fl)) + ARCH\n        + D.summary('This is the full list")

# ---------------------------------------------------------------- Hyper
rep_line_starting("row('Income account linked', \"An account in the member's name that receives their income, verified under the Income Account Verification Model (HQ-MF-03). The auto debit is taken from it\")),",
                  "row('Income account linked', \"An account in the member's name that receives their income, verified under the Income "
                  "Account Verification Model (HQ-MF-03). The auto debit is taken from the member's wallet at the partner, which is either "
                  "that account or funded from it\")),")

hyper_tech = '''
HY_FIG = D.figure(os.path.join(D.HERE, 'out', 'figs', 'hyper-stress.png'), 'Stress index of an Option 1 circle by the day reached and '
                  'the number of members who collected and then stopped paying. Green: normal operation. Amber: new joins blocked. '
                  'Red: the next day is not opened.', '92%')
HY_TECH = ('<h2><b>14. Technical Process</b></h2>'
           + '<h3><b>Formation</b></h3><ol>'
           + '<li>The roster fills to 400 on Option 1 or 390 on Option 2. Each applicant passes identity at level 3, the daily income '
             'test on the income account and the affordability test.</li>'
           + '<li>Each member links their wallet at the partner and signs the mandate for the daily debit; the takaful operator receives '
             'the enrolment file; seats are allocated by standing, new members to the last days.</li>'
           + '<li>The two identities are checked in code, and the circle is created only if both hold.</li></ol>'
           + '<h3><b>Daily Run</b></h3><table><tr><th><b>Step</b></th><th><b>What the system does</b></th></tr>'
           + row('Opening', 'Checks the hard stop. If exposure exceeds the cover limit the day is not opened')
           + row('Assignment', 'Assigns the paying members to the day&rsquo;s collectors: 49 to each of 8 on Option 1, 25 to each of 15 on Option 2')
           + row('Notice', 'Sends each member one message with the day&rsquo;s debit and position')
           + row('Collection', 'Sends one debit per paying member at the circle&rsquo;s fixed time, split into the contribution to the '
                               'assigned collector, the takaful contribution and the fee, each with its idempotency key')
           + row('Settlement', 'Records each signed webhook in the ledger; a collector&rsquo;s pot is complete when all assigned '
                               'contributions have settled, with the collector&rsquo;s own contribution set off')
           + row('Grace', 'Retries a failed debit once within 12 hours; after that records the arrears against the payer and the collector')
           + row('Close', 'Computes the stress index, updates the host&rsquo;s view, and notifies the operator of any default after collection')
           + row('Next morning', 'Reconciles the partner&rsquo;s settlement report with the ledger')
           + '</table>'
           + '<h3><b>Interfaces</b></h3><ul>'
           + '<li>Payment partner: batch debits within its rate limit, signed webhooks and the daily settlement report (Auto Debit, HQ-CP-02).</li>'
           + '<li>Takaful operator: the enrolment file at formation, the daily file of contributions paid, and claims with the arrears record.</li>'
           + '<li>WhatsApp Business Platform: one message a day for each member.</li></ul>')
hy_b = ("'''
rep('\nhy_b = ("', hyper_tech)
rep("        + hyper_case(generic_body(hy))\n", "        + hyper_case(generic_body(hy)).replace('<h2><b>10. Entry gates</b></h2>', HY_FIG + '<h2><b>10. Entry gates</b></h2>', 1) + HY_TECH\n")

# ---------------------------------------------------------------- Collection
rep_line_starting("row('1', 'Payment initiation by the electronic money institution partner, over Raast where available', 'One approval inside the Halqa application. The partner debits the member and credits the collecting member', \"The partner's rate, to be agreed. Raast itself carries no charge\", 'Default on known monthly circles')),",
                  "row('1', 'Payment initiation by the payment partner, from the member&rsquo;s wallet at the partner', 'One approval inside "
                  "the Halqa application, confirmed with the partner. The partner debits the wallet and pays each part to its owner', "
                  "\"The partner's rate, to be agreed. Raast itself carries no charge\", 'Default on known monthly circles for members with a "
                  "wallet at the partner')),")
rep("'Mandatory on unknown committees and Hyper, from the income account; optional on known circles'",
    "'Mandatory on unknown committees and Hyper, from the member&rsquo;s wallet at the partner; optional on known circles'")
rep("row('From where', 'The named primary account, which is the income account, and any secondary account, with the registered titles shown')",
    "row('From where', 'The member&rsquo;s wallet at the partner, and any backup card, with the registered title shown')")
rep("('Secondary account', 'Tried once at the due time when the primary account fails for lack of funds', 'A member is not marked late while money sits in their other named account')",
    "('Backup card', 'Charged once at the due time when the wallet fails for lack of funds, where one is held', 'A member is not marked late while another source they named can pay')")
rep("covering the primary account and any secondary account. A mandate cannot be used for another circle",
    "covering the wallet and any backup card. A mandate cannot be used for another circle")
rep("row('Can one mandate name a primary and a secondary account, the secondary tried once when the primary fails for lack of funds?', 'Decides whether the backup account needs a second mandate')",
    "row('Can a backup card be held as a token and charged once when the wallet fails for lack of funds, without a one time password?', 'Decides whether a backup source can be offered')")
rep("('Secondary account attempt', 'To build')", "('Backup card attempt', 'To build')")

co_tech = '''co = co.replace(anchor, autopull.section(3) + anchor)
RAIL_FIG = D.figure(os.path.join(D.HERE, 'out', 'figs', 'rail-share.png'), 'The partner&rsquo;s charge as a share of Halqa&rsquo;s fee, by '
                    'instalment and by a percentage charge on the debit, with the fee grid for 11 or more members. Green: up to 10 per '
                    'cent of the fee. Amber: 10 to 30 per cent. Red: above 30 per cent, where a charge per transaction is needed.', '92%')
anchor5 = '<h2><b>5. HYPER daily settlement without a pool</b></h2>'
assert co.count(anchor5) == 1
co = co.replace(anchor5, RAIL_FIG + anchor5)


def _renum14(m):
    k = int(m.group(1))
    return '<h2><b>%d. ' % (k + 1 if k >= 14 else k)


co = re.sub(r'<h2><b>(\\d+)\\. ', _renum14, co)
anchor15 = '<h2><b>15. Questions for the partner</b></h2>'
assert co.count(anchor15) == 1
co = co.replace(anchor15, autopull.technical(14) + anchor15)'''
rep("co = co.replace(anchor, autopull.section(3) + anchor)", co_tech)

old_sum = s[s.index("        + D.summary('Each instalment goes straight"): s.index("'own pot on their turn.'))") + len("'own pot on their turn.'))")]
NL = chr(10)
s = s.replace(old_sum, "        + D.summary('Each instalment goes straight from the member&rsquo;s wallet to the member collecting, through the payment '" + NL
              + "                    'partner, NayaPay or SadaPay, and never through Halqa. On unknown committees and Hyper, collection is '" + NL
              + "                    'automatic from the member&rsquo;s wallet at the partner, into which their income is paid; on known '" + NL
              + "                    'committees the member may instead approve each payment or send it over Raast. A missed payment is owed '" + NL
              + "                    'to the member left short, and it is taken from the late member&rsquo;s own pot on their turn.'))")
rep("'page summary is in Auto Debit (HQ-CP-02).</p>'", "'full technical process of the auto debit, with every credential and message, is in Auto Debit (HQ-CP-02).</p>'")
rep("'mandate lifecycle, the statutory position of each party, and the arrears model that replaces a member balance. A one '",
    "'mandate lifecycle, the statutory position of each party, and the arrears model that replaces a member balance. The '")
io.open(P, 'w', encoding='utf-8').write(s)
print('patched')
