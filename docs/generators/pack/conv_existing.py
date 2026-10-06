# -*- coding: utf-8 -*-
"""Re-issue the verified documents in the company format, with the corrections found on
24 September 2026. Every replacement must match exactly once, or the build stops."""
import io, os, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import docgen as D
import lawcite as L

SRC = os.path.join(os.path.dirname(D.HERE), 'out', 'docs')
OUT = os.path.join(D.HERE, 'out', 'partnership')


def edit(t, pairs, name):
    for a, b in pairs:
        n = t.count(a)
        if n != 1:
            raise SystemExit('%s: expected once, found %d: %s' % (name, n, a[:120]))
        t = t.replace(a, b)
    return t


def row(*cells):
    return '<tr>' + ''.join('<td>%s</td>' % c for c in cells) + '</tr>'


def rrow(old, new, pairs):
    """Replace one table row, given as tuples of cell texts."""
    pairs.append((row(*old), row(*new)))


def after_row(anchor, *new_rows):
    return (row(*anchor), row(*anchor) + ''.join(row(*r) for r in new_rows))


def drop_lead(html):
    return re.sub(r'<p class="lead">.*?</p>', '', html, count=1, flags=re.S)


def tables(b):
    def tab(mt):
        rows = re.findall(r'<tr>.*?</tr>', mt.group(1), flags=re.S)
        if rows and '<th' in rows[0]:
            rows = ['<thead>' + rows[0] + '</thead><tbody>'] + rows[1:] + ['</tbody>']
        return '<table class="t">' + ''.join(rows) + '</table>'
    return re.sub(r'<table>(.*?)</table>', tab, b, flags=re.S)


def generic_body(html):
    b = html[html.find('<body>') + 6: html.rfind('</body>')]
    b = re.sub(r'<p class="logo">.*?</p>', '', b, flags=re.S)
    b = re.sub(r'<h1>.*?</h1>', '', b, count=1, flags=re.S)
    b = tables(b)
    b = re.sub(r'<h([23])><b>(.*?)</b></h\1>', r'<h\1>\2</h\1>', b)
    b = re.sub(r'<ol>(.*?)</ol>', r'<ul>\1</ul>', b, flags=re.S)
    return b


def hyper_case(b):
    return re.sub(r'\bHYPER\b', 'Hyper', b)


def history(rows):
    return D.table([['Revision', 'Date', 'Change']] + rows, widths=['11%', '19%', '70%'])


def check_clean(name, body):
    txt = D.text_of(body)
    for bad in ('—', '–'):
        if bad in txt:
            i = txt.find(bad)
            raise SystemExit('%s: dash remains: %s' % (name, txt[max(0, i - 80): i + 40]))
    for rx in (r'you', r'your', r'registered (corporate insurance )?agent', r'Pak-Qatar Family', r'Rs 12\.60',
               r'agent registration', r'distributor registration', r'acting as the member.s duly constituted attorney',
               r'only (Halqa )?document (that sets out|carrying) calculations', r'HYPER', r'provincial sales tax'):
        m = re.search(rx, txt, flags=re.I if rx != r'HYPER' else 0)
        if m:
            raise SystemExit('%s: forbidden wording %r: %s' % (name, rx, txt[max(0, m.start() - 80): m.end() + 40]))


def publish(dst, title, subtitle, ref, audience, body, version, name):
    check_clean(name, body)
    path = os.path.join(OUT, dst)
    D.render(path, title, subtitle, ref, audience, body, version=version, running=title)
    return dst, D.pdf_pages(path)


def read(src):
    return io.open(os.path.join(SRC, src), encoding='utf-8').read()


# =====================================================================================
# Complete Feature and Process List, revision 4
# =====================================================================================
fl = drop_lead(read('feature-list-rev3.final.html'))
FL = []
rrow(('Face match', 'A live capture is compared to the stored identity at exit and at other high value actions.'),
     ('Face match', 'A live capture with a liveness check is matched to the CNIC photograph at onboarding, and again at exit and at other high value actions.'), FL)
rrow(('Verification levels', 'Each completed check raises the account level, and each level opens a wider set of seats and circles.'),
     ('Verification levels', 'Level 1 for known committees, level 2 for unknown committees, and level 3 for Hyper and for hosts of unknown committees, each reached only above an identity confidence score (Identity Verification Model, HQ-MF-04).'), FL)
rrow(('Affordability gate', 'Total committed instalments are held to one third of declared income, against a regulatory norm of two fifths.'),
     ('Affordability gate', "On unknown committees and Hyper, all committees held stay within a third of verified income, and within 40 per cent with other loan repayments, the State Bank's limit for consumer finance, with stricter tests from the fourth committee (Affordability Model, HQ-MF-02). Known committees rely on the host and the mutual guarantee."), FL)
rrow(('Income verification', 'A verified income figure reduces the assessed burden, which widens the seats available.'),
     ('Income account', "Unknown committees and Hyper require an account in the member's name that receives their income. Its statement is checked for integrity and scored for a salary pattern, and for Hyper it must show Rs 1,000 or more on at least five days of every week for eight weeks (Income Account Verification Model, HQ-MF-03)."), FL)
rrow(('Salary pattern', 'The days on which collection succeeds are used to infer a pay day, without reading any bank screen.'),
     ('Salary pattern', 'A recurring salary credit is scored on recurrence, amount, day, narration and employer, and the days on which collection succeeds confirm the pay day. No bank screen is read.'), FL)
rrow(('Collection mandate', 'Where automatic collection is chosen, the mandate is authorised on its own screen and its terms are stated there.'),
     ('Collection mandate', 'Required on unknown committees and Hyper, optional on known committees. The mandate is authorised on its own screen, confirmed with the PIN, and its terms are stated there.'), FL)
rrow(('Tier two, mandate', 'A token held by the partner authorises collection on the due date without a prompt, used where the daily cadence makes a prompt impractical.'),
     ('Tier two, auto debit', 'A mandate held by the partner authorises collection without a prompt, on the pay day and on the due date, from the member&rsquo;s wallet at the partner, into which the income is paid or moved by standing instruction. Mandatory on unknown committees and Hyper, with an optional backup card (Auto Debit, HQ-CP-02).'), FL)
rrow(('Failed collection', 'A failed attempt is recorded, the member is told the reason, and no further attempt runs without a stated schedule.'),
     ('Failed collection', 'A failed attempt is recorded and the member is told the reason. At most three attempts are made, at the due time, after 24 hours and after 48 hours, and a backup card is charged once where one is held.'), FL)
rrow(('Affordability gate', 'Blocks a commitment beyond one third of income before the seat is granted.'),
     ('Affordability gate', 'Blocks a commitment on an unknown committee or Hyper beyond a third of verified income, or 40 per cent with other loans.'), FL)
rrow(('Salary account linkage', 'Required on any roster of members who are strangers to one another.'),
     ('Income account', 'Required on unknown committees and Hyper and verified under HQ-MF-03. It is either the wallet the auto debit is taken from, or the account that funds that wallet by standing instruction.'), FL)
FL.append(after_row(('Stress bands', 'The threshold resolves to green, amber or red, so intervention is graded rather than a single stop.'),
                    ('Daily income floor', 'Hyper requires Rs 1,000 or more on at least five days of every week for eight weeks.'),
                    ('Takaful cover', 'Mandatory on unknown committees and Hyper, so a default after collection is met by the operator rather than by the other members.')))
rrow(('Turn swap', 'Two members exchange positions at no price, with both consenting.'),
     ('Turn swap', 'Two members exchange seats with both consenting and nothing passing between them. Halqa rewards the member moving later with fee waivers and points on a published schedule, and the member moving earlier pays Halqa a flat exchange fee of Rs 500 (Seat Exchange and Points, HQ-CP-04). Subject to the opinion of counsel.'), FL)
rrow(('Asset circles', 'Held until a leasing structure exists under which a licensed partner owns the item until the circle finishes paying.'),
     ('Asset circles', 'A licensed modaraba buys the asset, leases it to the member under ijarah and carries the credit risk, in two configurations, and ownership passes when the circle ends (Asset Committees, HQ-CP-01). Later, subject to the opinion of counsel.'), FL)
rrow(('Purchase on a standard circle', 'Offered at circle creation and at join, priced per member and shown before commitment.'),
     ('Cover on unknown committees', 'Mandatory on every unknown committee and on Hyper, optional on known committees, priced per member and shown before commitment. Priced on the stress case at launch (Takaful Cover Pricing Model, HQ-MF-05).'), FL)
rrow(('Role of Halqa', 'Registered distributor and nothing more.'),
     ('Role of Halqa', 'Distributor appointed by the asset manager and a member of the Mutual Funds Association of Pakistan, and nothing more.'), FL)
rrow(('Status', 'Held until the distributor registration is in hand.'),
     ('Status', 'Held until MUFAP membership and the distribution agreement are in hand.'), FL)
rrow(('Hyper circle', 'A daily cadence circle offered in two fixed configurations, each with its own roster, cycle length and pot. Every daily payment splits three ways at source, the fee is flat across the roster, and there is no bidding and no rate. The figures for both are set out in the Hyper Committee document, which is the only document carrying calculations.'),
     ('Hyper circle', 'A daily cadence circle offered in two fixed configurations, each with its own roster, cycle length and pot. Every daily payment splits three ways at source, the fee is flat across the roster, and there is no bidding and no rate. The figures are set out in the Hyper Committee document and the Hyper Default Threshold Model (HQ-MF-01).'), FL)
rrow(('Asset circle', 'Held, pending the leasing structure.'), ('Asset circle', 'Later, through a modaraba under ijarah, in two configurations (Asset Committees, HQ-CP-01).'), FL)
rrow(('Affordability engine', 'Applies the income ratio and the verification discount.'),
     ('Affordability engine', 'Applies the five tests of the Affordability Model to unknown committees and Hyper, and returns a verdict with its reasons and the headroom left.'), FL)
rrow(('Salary pattern engine', 'Infers a pay day from successful collection days.'),
     ('Income account engine', 'Scores an income account statement for a salary pattern and for the Hyper daily income floor, and infers the pay day from successful collection days.'), FL)
FL.append(after_row(('Income account engine', 'Scores an income account statement for a salary pattern and for the Hyper daily income floor, and infers the pay day from successful collection days.'),
                    ('Identity confidence engine', 'Combines the name, face, address, account, phone and job checks into one score that sets the verification level (HQ-MF-04).')))
rrow(('Incorporation', 'A private limited company registered with the Commission, with an object clause matching the model.'),
     ('Incorporation', 'A private limited company registered with the Commission, with its registered office in Islamabad and an object clause matching the model.'), FL)
rrow(('Tax registration', 'A National Tax Number, then provincial sales tax registration.'),
     ('Tax registration', 'A National Tax Number, then sales tax registration in the Islamabad Capital Territory, where the fee is likely taxed at 15 per cent as an IT enabled service.'), FL)
FL += [
    (row('Undertaking', 'Ten clauses signed at join, framed to support a summary suit.'),
     row('Undertaking', 'Ten clauses signed at join, stating the sum owed so that it can be recovered by suit.')),
    (row('Guarantee cheque', 'A cheque held on file takes 80 per cent off the fee and opens a route under section 489-F of the Penal Code.'),
     row('Guarantee cheque', 'A paper cheque held on file takes 80 per cent off the fee. If dishonoured it can be sued on summarily under Order XXXVII of the Code of Civil Procedure, and a complaint made under section 489-F of the Penal Code on counsel&rsquo;s advice.')),
    (row('Summary suit', 'The undertaking is framed as a liquidated demand, so a summary procedure is available as a last step.'),
     row('Suit', 'The undertaking is enforced by an ordinary civil suit for the sum owed. The summary procedure of Order XXXVII applies only to a guarantee cheque.')),
    (row('Liquidated demand', 'The undertaking states the sum as a liquidated demand, which makes a summary procedure available.'),
     row('Sum owed', 'The undertaking states the sum owed after each round, so the amount in any claim is not in dispute.')),
    ('A licensed takaful operator writes and prices the cover. Candidates are Pak-Qatar Family Takaful and Salaam Takaful.',
     'A licensed general takaful operator writes and prices the cover, since default cover is Class 6 non-life business. Candidates are Pak-Qatar General Takaful and Salaam Takaful.'),
    (row('Role of Halqa', 'Registered corporate insurance agent, distributing the operator product.'),
     row('Role of Halqa', 'Corporate insurance agent under a written agency agreement, distributing the operator product.')),
    (row('Registration', 'Corporate insurance agent registration with the Commission, carrying no capital requirement.'),
     row('Agency', 'A written agency agreement with the operator, as section 96(2) of the Insurance Ordinance 2000 requires; the operator enters Halqa in its register of agents under section 98. No capital requirement.')),
    (row('Status', 'Held until the agent registration and an operator agreement are in hand.'), row('Status', 'Held until the agency agreement is in hand.')),
    (row('Corporate insurance agent registration', 'Required before cover is offered; carries no capital requirement.'),
     row('Takaful agency', 'A written agency agreement with a general takaful operator, required before cover is offered; no capital requirement.')),
    (row('Takaful operator agreement', 'A distribution agreement with the licensed operator.'),
     row('Agent eligibility', 'No director, and no officer engaged in the agency, may be a minor (Insurance Ordinance 2000, section 96(1)(a)).')),
    (row('Distributor registration', 'Required before savings are offered; permits distribution of funds.'),
     row('Distributor membership', 'Membership of the Mutual Funds Association of Pakistan, mandatory for distributors since April 2026, and a distribution agreement, before savings are offered.')
     + row('Modaraba agreement', 'For asset committees, with Orix Modaraba, First Habib Modaraba, Allied Rental Modaraba or First Punjab Modaraba.')),
    (row('Takaful operator', 'Pak-Qatar Family Takaful or Salaam Takaful'),
     row('Takaful operator', 'Pak-Qatar General Takaful or Salaam Takaful')
     + row('Modaraba, asset committees', 'Orix Modaraba, First Habib Modaraba, Allied Rental Modaraba or First Punjab Modaraba')
     + row('Microfinance lender, later', 'Mobilink Microfinance Bank, FINCA Microfinance Bank or U Microfinance Bank')),
]
FL += [
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
FL.append((row('Policy summary', 'The finished configuration is restated in plain words for confirmation.'),
           row('Policy summary', 'The finished configuration is restated in full for the host to confirm.')))
fl = edit(fl, FL, 'FL')
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
fl_b = ('<p>Every feature and process in Halqa, with one line on how each works. Each payment splits at source into a '
        "contribution, a takaful contribution where cover is attached, and Halqa's service fee. Collection runs through a licensed "
        'electronic money institution on a three tier ladder, and the service fee is the only money Halqa receives. '
        'Counterparties are named in section 28; none is contracted at this date.</p>'
        + hyper_case(generic_body(fl)) + ARCH
        + D.summary('This is the full list of what Halqa does. Members&rsquo; money moves directly between members through a licensed '
                    'partner, and Halqa earns only a flat fee and disclosed commissions. Committees of strangers need a verified '
                    'income account, auto debit and takaful cover, and nothing that works like lending, or like selling a turn '
                    'for money, is allowed.'))
print(publish('Complete Feature and Process List.pdf', 'Complete Feature and Process List',
              'Every feature and process in Halqa, with one line on how each works.', 'HQ-CP-07',
              'Mr Akif Saeed and prospective partners', fl_b, '4.0', 'FL'))

# =====================================================================================
# Hyper Committee, revision 6
# =====================================================================================
import json
BM = json.load(open(os.path.join(D.HERE, 'bm_figures.json')))
inc1, inc2 = 13500 / 0.33, 13000 / 0.33

hy = drop_lead(read('hyper-rev5.final.html'))
HY = [
    (row('Salary account linked', 'Mandatory', 'Required on any roster of members who are strangers. Not a discount'),
     row('Income account linked', 'Mandatory', 'Required on unknown committees and Hyper. Not a discount')),
    ('<tr><td>Who writes it</td><td>A licensed takaful operator. Candidates are Pak-Qatar Family Takaful and Salaam Takaful</td></tr>',
     '<tr><td>Who writes it</td><td>A licensed general takaful operator, since default cover is Class 6 non-life business. Candidates are Pak-Qatar General Takaful and Salaam Takaful</td></tr>'),
    ("<tr><td>Halqa's role</td><td>Registered corporate insurance agent, distributing the operator's product</td></tr>",
     "<tr><td>Halqa's role</td><td>Corporate insurance agent under a written agency agreement, distributing the operator's product</td></tr>"),
    ('<tr><td>Registration required</td><td>Corporate insurance agent registration with the Commission. No capital requirement attaches</td></tr>',
     '<tr><td>What is required</td><td>A written agency agreement with the operator (Insurance Ordinance 2000, section 96(2)), which enters Halqa in its register of agents (section 98). No capital requirement attaches</td></tr>'),
    (row('Average across a uniform spread of days', 'Rs 7,500', 'Rs 4,333.33', '50%'),
     row('Average across a uniform spread of days', 'Rs 7,350', 'Rs 4,166.67', '49% and 48%')),
    ('Half a pot is the correct planning figure for each default after collection.',
     'Half a pot, Rs 7,500 on Option 1 and Rs 4,333.33 on Option 2, is used as the planning figure for each default after collection. It is slightly above the exact average, so it is conservative.'),
    (row('Salary account linked', 'Mandatory on a stranger roster. Collection has to attach to a verifiable income stream'),
     row('Income account linked', "An account in the member's name that receives their income, verified under the Income Account Verification Model (HQ-MF-03). The auto debit is taken from the member's wallet at the partner, which is either that account or funded from it")),
    (row('Evidence of daily or near-daily income', 'A monthly salary does not support a daily instalment'),
     row('Daily income', 'Rs 1,000 or more received on at least 5 days of every week for the last 8 weeks (HQ-MF-03). A monthly salary does not support a daily instalment')),
    (row('Affordability assessed on the monthly figure', 'Rs 13,500 on Option 1, Rs 13,000 on Option 2'),
     row('Affordability', 'Rs 13,500 a month on Option 1 and Rs 13,000 on Option 2, within a third of verified income, so verified income of at least Rs %s and Rs %s a month (Affordability Model, HQ-MF-02)' % ('{:,.0f}'.format(inc1), '{:,.0f}'.format(inc2)))),
    ('Halqa is a registered agent and never an insurer', 'Halqa is an agent under a written contract and never an insurer'),
    ('after the agent registration is in hand', 'after the agency agreement is in hand'),
    ('Silence routes to restitution and then, as a last step, to a summary suit on the undertaking.',
     'Silence routes to restitution and then, as a last step, to a civil suit on the undertaking, or to a summary suit where a guarantee cheque is held.'),
    ('The selected configuration prices for 50 per cent, which is roughly four times worse than any rate on record.',
     'The selected configuration prices for 50 per cent, more than eight times the highest arrears rate reported for Pakistani microfinance, 6.01 per cent (VIS Credit Rating Company, 2026).'),
]
hy = edit(hy, HY, 'HY')


def money(x):
    return '(Rs {:,.0f})'.format(-x) if x < 0 else 'Rs {:,.0f}'.format(x)


h1, h2 = BM['rows']['hyper1'], BM['rows']['hyper2']
rew1, rew2 = 0.10 * 1500000, 0.10 * 845000
run1, run2 = h1['running'] - rew1, h2['running'] - rew2
new1, new2 = h1['later'] - h1['first'], h2['later'] - h2['first']
sec12 = ('<h2><b>12. Revenue and cost on one cycle</b></h2><table>'
         + '<tr><th>Line</th><th>Option 1</th><th>Option 2</th></tr>'
         + row('Fee per member per day', 'Rs 75', 'Rs 83.33')
         + row('Fee revenue per cycle', money(1500000), money(845000))
         + row("Operator's commission at 15%", money(225000), money(126750))
         + row('Gross revenue per cycle', money(1725000), money(971750))
         + row('Payment events in the cycle', '20,000', '10,140')
         + row('Running cost of payments, Rs %.2f and Rs %.2f each, including the partner&rsquo;s charge' % (h1['per_payment'], h2['per_payment']), money(-run1), money(-run2))
         + row('Points and fee waivers to later seats, 10% of fees', money(-rew1), money(-rew2))
         + row('Net per cycle, returning members', money(h1['later']), money(h2['later']))
         + row('Onboarding and acquisition when every member is new', money(-new1), money(-new2))
         + row('Net per cycle, all members new', money(h1['first']), money(h2['first']))
         + row('Expected default loss at 5%, borne by the takaful fund', money(150000), money(84500))
         + '</table><p>The running cost per payment is taken from the Business Model and Unit Costs (HQ-CP-03): one consolidated '
           'WhatsApp message a day at Rs %.2f, support, cloud, and the partner&rsquo;s charge at 1 per cent of the debit, Rs 4.50 '
           'and Rs 5.00. If the partner charged 1.5 per cent instead, the net per cycle would fall by Rs 45,000 and Rs 25,350. The '
           'default loss uses the planning figure of half a pot; the exact seat average gives Rs 147,000 and Rs 81,250 (Takaful '
           'Cover Pricing Model, HQ-MF-05). It falls on the takaful fund, not on Halqa.</p>' % BM['wa_rs'])
hy, k = re.subn(r'<h2><b>12\. Revenue and cost on one cycle</b></h2>.*?(?=<h2>)', sec12, hy, count=1, flags=re.S)
assert k == 1
assert abs(h1['later'] - (1725000 - run1 - rew1)) < 1 and abs(h2['later'] - (971750 - run2 - rew2)) < 1
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
def hyper_body_with_figure(t):
    anchor = '<h2>10. Entry gates</h2>'
    assert t.count(anchor) == 1, 'Hyper figure anchor'
    return t.replace(anchor, HY_FIG + anchor, 1)


hy_b = ("<p>Hyper is Halqa's daily committee, offered in two fixed configurations. Each daily payment splits three ways at source "
        "and the parts are never commingled. Each day's payers pay that day's collectors directly, so no party holds a pool. The "
        'models behind its thresholds are set out in full in the Hyper Default Threshold Model (HQ-MF-01), the Affordability '
        'Model (HQ-MF-02), the Income Account Verification Model (HQ-MF-03) and the Takaful Cover Pricing Model (HQ-MF-05).</p>'
        + hyper_body_with_figure(hyper_case(generic_body(hy))) + HY_TECH
        + D.summary('Hyper is a daily committee. On Option 1, 400 members pay Rs 450 a day for 50 days and 8 of them collect '
                    'Rs 15,000 each day; on Option 2, 390 members pay Rs 500 a day for 26 days and 15 collect Rs 8,666.67 each '
                    'day. Part of every payment goes to takaful cover, which pays the members left short if someone takes the pot '
                    'and stops paying, and part is Halqa&rsquo;s flat fee. The circle stops itself before it can promise money '
                    'that does not exist, and only members with steady daily income, verified from their own account, can join.'))
print(publish('Hyper Committee.pdf', 'Hyper Committee', 'The daily committee in two configurations, with every calculation behind it.',
              'HQ-CP-08', 'Mr Akif Saeed, takaful operators and the payment partner', hy_b, '6.0', 'HY'))

# =====================================================================================
# Collection and Auto Debit Specification, revision 4
# =====================================================================================
co = drop_lead(read('collection-rev3.final.html'))
co = re.sub(r'<p>Revision 2 follows the legal verification.*?</p>', '', co, count=1, flags=re.S)
CO = [
    (row('1', 'Payment initiation by the electronic money institution partner, over Raast where available', 'One approval inside the Halqa application. The partner debits the member and credits the collecting member', "The partner's rate, to be agreed. Raast itself carries no charge", 'Default on monthly circles'),
     row('1', 'Payment initiation by the payment partner, from the member&rsquo;s wallet at the partner', 'One approval inside the Halqa application, confirmed with the partner. The partner debits the wallet and pays each part to its owner', "The partner's rate, to be agreed. Raast itself carries no charge", 'Default on known monthly circles for members with a wallet at the partner')),
    (row('2', 'Token mandate held by the partner', 'None after the first authorisation', 'About 1.5 per cent, to be confirmed with the partner', 'HYPER, where an approval each day is impractical'),
     row('2', 'Token mandate held by the partner, the auto debit', 'None after the first authorisation', 'About 1.5 per cent, to be confirmed with the partner; a charge per transaction is sought', 'Mandatory on unknown committees and Hyper, from the member&rsquo;s wallet at the partner; optional on known circles')),
    ('and on monthly circles it should be priced per transaction rather than as a percentage.</p>',
     'and on monthly circles it should be priced per transaction rather than as a percentage. This matters most on unknown monthly committees, where the auto debit is mandatory.</p>'),
    (row('Offer', 'Mandate offered at join and from the circle screen. Never pre-selected', 'Nothing'),
     row('Offer', 'Required to join an unknown committee or Hyper, and offered on known committees at join and from the circle screen. The consent box is never pre-selected', 'Nothing')),
    ('Those are separate actions on separate screens with separate wording.</p>',
     'Those are separate actions on separate screens with separate wording. A member of an unknown committee or Hyper who cancels cannot join another such circle without an active mandate.</p>'),
    (row('From where', 'The named account, with the registered title shown'),
     row('From where', 'The member&rsquo;s wallet at the partner, and any backup card, with the registered title shown')),
    after_row(('Spacing', 'Due time, then 24 hours, then 48 hours', 'Gives the member time to fund the account'),
              ('Backup card', 'Charged once at the due time when the wallet fails for lack of funds, where one is held', 'A member is not marked late while another source they named can pay')),
    (row('Scope', 'One mandate per member per circle. A mandate cannot be used for another circle'),
     row('Scope', 'One mandate per member per circle, covering the wallet and any backup card. A mandate cannot be used for another circle')),
    (row('Will you provide payment initiation and aggregation to Halqa under para 7.I(f), through your interface under para 7.I(h)?', 'This is the basis on which Halqa arranges collection without a licence of its own'),
     row("Will the partner provide payment initiation and aggregation to Halqa under para 7.I(f), through the partner's interface under para 7.I(h)?", 'This is the basis on which Halqa arranges collection without a licence of its own')),
    (row("Can a payment initiated through you debit one member and credit another member's account directly?", 'If not, tier 1 and tier 2 cannot run on your service'),
     row("Can a payment initiated through the partner debit one member and credit another member's account directly?", "If not, tier 1 and tier 2 cannot run on the partner's service")),
    (row('Is the token held by you, with only a reference returned?', 'Halqa must never hold a payment credential'),
     row('Is the token held by the partner, with only a reference returned to Halqa?', 'Halqa must never hold a payment credential')
     + row('Can a backup card be held as a token and charged once when the wallet fails for lack of funds, without a one time password?', 'Decides whether a backup source can be offered')),
    (row('What is your charge per initiated payment and per mandate collection, and can it be fixed per transaction rather than a percentage?', 'Decides the economics of monthly circles'),
     row("What is the partner's charge per initiated payment and per mandate collection, and can it be fixed per transaction rather than a percentage?", 'Decides the economics of monthly circles')),
    (row('When would you make the 30 day notice to the State Bank under para 7.I(h)?', 'Sets the launch date'),
     row('When would the partner give the 30 day notice to the State Bank under para 7.I(h)?', 'Sets the launch date')),
    after_row(('HYPER payer-to-collector assignment', 'To build'), ('Backup card attempt', 'To build'),
              ('Income account verification, HQ-MF-03', 'To build')),
]
co = edit(co, CO, 'CO')
import autopull


def _renum(m):
    n = int(m.group(1))
    return '<h2><b>%d. ' % (n + 1 if n >= 3 else n)


co = re.sub(r'<h2><b>(\d+)\. ', _renum, co)
anchor = '<h2><b>4. Why the rail cost decides the tier</b></h2>'
assert co.count(anchor) == 1
co = co.replace(anchor, autopull.section(3) + anchor)
RAIL_FIG = D.figure(os.path.join(D.HERE, 'out', 'figs', 'rail-share.png'), 'The partner&rsquo;s charge as a share of Halqa&rsquo;s fee, by '
                    'instalment and by a percentage charge on the debit, with the fee grid for 11 or more members. Green: up to 10 per '
                    'cent of the fee. Amber: 10 to 30 per cent. Red: above 30 per cent, where a charge per transaction is needed.', '92%')
anchor5 = '<h2><b>5. HYPER daily settlement without a pool</b></h2>'
assert co.count(anchor5) == 1
co = co.replace(anchor5, RAIL_FIG + anchor5)


def _renum14(m):
    k = int(m.group(1))
    return '<h2><b>%d. ' % (k + 1 if k >= 14 else k)


co = re.sub(r'<h2><b>(\d+)\. ', _renum14, co)
anchor15 = '<h2><b>15. Questions for the partner</b></h2>'
assert co.count(anchor15) == 1
co = co.replace(anchor15, autopull.technical(14) + anchor15)
co_b = ('<p>How money is collected from a member, the tiers of collection, the daily settlement of Hyper without a pool, the '
        'mandate lifecycle, the statutory position of each party, and the arrears model that replaces a member balance. The '
        'full technical process of the auto debit, with every credential and message, is in Auto Debit (HQ-CP-02).</p>'
        + hyper_case(generic_body(co))
        + D.summary('Each instalment goes straight from the member&rsquo;s wallet to the member collecting, through the payment '
                    'partner, NayaPay or SadaPay, and never through Halqa. On unknown committees and Hyper, collection is '
                    'automatic from the member&rsquo;s wallet at the partner, into which their income is paid; on known '
                    'committees the member may instead approve each payment or send it over Raast. A missed payment is owed '
                    'to the member left short, and it is taken from the late member&rsquo;s own pot on their turn.'))
print(publish('Collection and Auto Debit Specification.pdf', 'Collection and Auto Debit Specification',
              'How money is collected from a member, the mandate, the statutory position of each party, and the arrears model.',
              'HQ-CP-09', 'The payment partner, NayaPay or SadaPay', co_b, '4.0', 'CO'))
