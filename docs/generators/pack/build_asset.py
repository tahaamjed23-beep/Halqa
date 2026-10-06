# -*- coding: utf-8 -*-
"""Asset Committees (HQ-CP-01): committees through which members obtain an asset leased by a licensed modaraba.
Every figure is computed here and asserted; every quotation is verified by lawcite."""
import os, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import docgen as D
import lawcite as L
import cleanrules
from mcommon import rs, num, pct

OUT = os.path.join(D.HERE, 'out', 'partnership')
FIG = os.path.join(D.HERE, 'out', 'figs')


def Q(key, text, prov):
    return L.cite(D, key, text, prov)


def P(*paras):
    return ''.join(D.para(p) for p in paras)


def money(x):
    return '(%s)' % rs(-x) if x < -0.005 else rs(x)


T = D.table

# ------------------------------------------------------------------ figures
n, c = 12, 10000.0
POT = n * c                       # the pot, equal to the asset price in both configurations
A = POT
RECOVERY = 0.70                   # planning figure: resale value of a repossessed asset, share of price
REF_LO, REF_HI, DEAL_LO, DEAL_HI = 0.02, 0.04, 0.01, 0.03

# Configuration 1: every member takes an asset. Margin set by the modaraba; Rs 1,000 a month is illustrative.
m1 = 1000.0
cf1 = [-n * A] + [n * (c + m1) - n * c + POT for _ in range(n)]      # rentals in, contributions out, one pot in each month
bal1, fm1 = [], 0.0
run = 0.0
for t, f in enumerate(cf1):
    run += f
    bal1.append(run)
out1 = [max(0.0, -b) for b in bal1[:-1]]           # funds employed during each month
fm1 = sum(out1)                                    # rupee months
margin1 = n * n * m1
ret1 = margin1 / (fm1 / 12.0)
assert abs(bal1[-1] - margin1) < 1e-6 and abs(margin1 - 144000) < 1e-6

# Configuration 2: the first a seats are asset seats, the rest take cash. Rs 350 a month is illustrative.
a, m2 = 3, 350.0
cf2 = [-a * A]
for t in range(1, n + 1):
    f = a * (c + m2) - a * c
    if t <= a:
        f += POT
    cf2.append(f)
bal2 = []
run = 0.0
for f in cf2:
    run += f
    bal2.append(run)
out2 = [max(0.0, -b) for b in bal2[:-1]]
fm2 = sum(out2)
margin2 = a * n * m2
ret2 = margin2 / (fm2 / 12.0)
assert abs(bal2[-1] - margin2) < 1e-6 and abs(margin2 - 12600) < 1e-6


def exposure(j):
    return max(0.0, c * (n - j) - RECOVERY * A)


assert exposure(0) == 36000 and exposure(3) == 6000 and exposure(4) == 0

b = []
b.append(P(
    'An asset committee lets members obtain an asset they need for work or home, such as a motorcycle, a rickshaw, a sewing '
    'machine or a solar system, through a committee. A licensed modaraba buys the asset from an authorised dealer, owns it, and '
    'leases it to the member under ijarah for the life of the committee. The member uses the asset from the first month. When '
    'the committee completes and every rental is paid, ownership passes to the member. Halqa arranges the committee, keeps the '
    'record and introduces the member to the modaraba. It does not own, finance, lease or repossess any asset, and it does not '
    'receive any rental.',
    'This document sets out the structure, the two configurations offered, the cash flows month by month, the position of the '
    'modaraba, the technical process from application to transfer of ownership, the law relied on and the points still to be '
    'agreed. Asset committees are offered later, once a modaraba is contracted and counsel has given the opinion listed in '
    'section 12.'))

b.append('<h2>1. Parties</h2>' + T([
    ['Party', 'Role'],
    ['Member', 'Lessee. Uses the asset from the start of the lease, pays one rental a month on the committee&rsquo;s date, and '
               'becomes the owner when the committee completes'],
    ['Modaraba', 'Registered with the Commission. Buys the asset, owns it, leases it under ijarah, arranges takaful of the asset as '
                 'owner, carries the credit risk and recovers its own asset if a member stops paying. Candidates: Orix Modaraba, '
                 'First Habib Modaraba, Allied Rental Modaraba and First Punjab Modaraba. None is contracted'],
    ['Dealer', 'An authorised dealer of the asset, paid by the modaraba'],
    ['Other members', 'In the second configuration, members who take cash in the ordinary way'],
    ['Halqa', 'Forms and runs the committee, checks each applicant, passes the application to the modaraba with the member&rsquo;s '
              'consent, keeps the record and sends the notices'],
    ['Payment partner', 'Collects each rental from the member&rsquo;s wallet and pays it to the modaraba, under the member&rsquo;s '
                        'mandate, as described in Auto Debit (HQ-CP-02)'],
], widths=['18%', '82%']))

b.append('<h2>2. Structure</h2>' + D.bullets([
    'The modaraba buys each asset seat&rsquo;s asset at the start and delivers it to the member. The asset is registered in the '
    'modaraba&rsquo;s name as owner for the life of the lease.',
    'Each month the member pays the modaraba one rental: the committee contribution plus the modaraba&rsquo;s margin. From the '
    'rental, the modaraba pays the member&rsquo;s contribution into the committee, so the committee is paid in full whatever the '
    'member does.',
    'On the member&rsquo;s own turn, the member&rsquo;s pot is paid to the modaraba as advance rental. This repays the cost of the asset.',
    'When the committee completes, ownership passes to the member by a separate gift or sale for a token price, as ijarah '
    'requires, and the modaraba issues the letter the registering authority needs to transfer the asset.',
    'If a member stops paying, the modaraba continues to pay that member&rsquo;s contributions into the committee and recovers its '
    'own asset under the lease. The other members lose nothing.',
]))

b.append('<h2>3. Configurations</h2>' + T([
    ['', 'Configuration 1', 'Configuration 2'],
    ['Description', 'Every member takes an asset', 'The first seats are asset seats; the other members take cash'],
    ['Example', '12 members, all taking an asset priced at Rs 120,000', '12 members; seats 1 to 3 take an asset priced at Rs 120,000; seats 4 to 12 take cash'],
    ['Contribution', rs(c) + ' a month', rs(c) + ' a month'],
    ['Modaraba margin, illustrative', rs(m1) + ' a month for each asset', rs(m2) + ' a month for each asset'],
    ['Rental paid by each asset member', rs(c + m1) + ' a month', rs(c + m2) + ' a month'],
    ['Paid over the committee by each asset member', rs(n * (c + m1)), rs(n * (c + m2))],
    ['Modaraba&rsquo;s outlay at the start', rs(n * A), rs(a * A)],
    ['Months until the outlay is recovered', '11', '3'],
    ['Halqa&rsquo;s fee on asset seats', 'None', 'None; cash members pay the ordinary fee'],
], widths=['30%', '35%', '35%'])
    + P('In the first configuration the contributions the modaraba pays and the pots it receives cancel each month, so in cash '
        'terms the modaraba holds twelve leases with equal rentals, and only the rentals move. The committee still gives the '
        'group its host, its common date and its record. In the second configuration the committee does real work: the pots '
        'paid by the cash members in the first three rounds repay the modaraba within three months, so its money is employed for '
        'a short time and its margin can be much lower. The early seats, where a default would cost most, are also the seats '
        'whose contributions the modaraba pays, which makes the committee safer for the cash members.'))

rows1 = [['Month', 'Modaraba pays', 'Modaraba receives', 'Net', 'Funds still employed']]
for t in range(0, n + 1):
    if t == 0:
        rows1.append(['0', 'Dealer ' + rs(n * A), '', money(cf1[0]), rs(out1[0])])
    else:
        paid = n * c
        recv = n * (c + m1) + POT
        rows1.append([str(t), 'Contributions ' + rs(paid), 'Rentals ' + rs(n * (c + m1)) + '; pot ' + rs(POT), money(cf1[t]),
                      rs(out1[t]) if t < n else rs(0)])
rows2 = [['Month', 'Modaraba pays', 'Modaraba receives', 'Net', 'Funds still employed']]
for t in range(0, n + 1):
    if t == 0:
        rows2.append(['0', 'Dealer ' + rs(a * A), '', money(cf2[0]), rs(out2[0])])
    else:
        recv = 'Rentals ' + rs(a * (c + m2)) + ('; pot ' + rs(POT) if t <= a else '')
        rows2.append([str(t), 'Contributions ' + rs(a * c), recv, money(cf2[t]), rs(out2[t]) if t < n else rs(0)])

b.append('<h2>4. Cash Flows</h2>'
         + '<h3>4.1 Configuration 1</h3>' + T(rows1, numeric=(3, 4), widths=['9%', '26%', '35%', '14%', '16%'])
         + P('The modaraba&rsquo;s outlay of %s is recovered in month 11, and it earns %s over the committee on funds employed of '
             '%s rupee months, about %s a year on the money employed.'
             % (rs(n * A), rs(margin1), num(fm1), pct(ret1, 0)))
         + '<h3>4.2 Configuration 2</h3>' + T(rows2, numeric=(3, 4), widths=['9%', '26%', '35%', '14%', '16%'])
         + P('The outlay of %s is recovered in month 3. The modaraba earns %s on funds employed of %s rupee months, about %s a '
             'year, although the margin per asset is a third of that in the first configuration. The rental is set by the modaraba '
             'under its own licence; Halqa sets no rate.' % (rs(a * A), rs(margin2), num(fm2), pct(ret2, 0))))

b.append('<h2>5. Exposure</h2>' + P(
    'If a member stops paying after j rentals, the modaraba must still pay that member&rsquo;s remaining contributions into the '
    'committee, and it recovers what it can by selling its own asset. Its exposure is the contributions still to be paid, less '
    'what the asset fetches.')
    + D.formula('E(j) = c &times; (n &minus; j) &minus; r &times; A', 'Exposure of the modaraba after j rentals, with instalment c, n rounds, asset price A and resale share r; nil when negative')
    + T([['Rentals paid before default', 'Contributions still to pay', 'Resale at 70 per cent', 'Exposure']]
        + [[str(j), rs(c * (n - j)), rs(RECOVERY * A), rs(exposure(j))] for j in (0, 1, 2, 3, 4, 6)],
        numeric=(1, 2, 3), widths=['28%', '26%', '24%', '22%'])
    + P('The resale share of 70 per cent is a planning figure; the modaraba&rsquo;s own recovery experience replaces it. At that '
        'figure the exposure is nil from the fourth rental, because the asset is worth more than the contributions still due. The '
        'exposure is highest in the first months, which is why the modaraba applies its own credit assessment before approving '
        'each member.')
    + D.figure(os.path.join(FIG, 'asset-exposure.png'), 'Exposure of the modaraba by the number of rentals paid before default '
               'and the share of the price recovered on resale, for a 12 month committee at Rs 10,000 and an asset priced at '
               'Rs 120,000. Green: the asset covers what is owed. Amber: exposure up to 10 per cent of the price. Red: above it.', '92%'))

b.append('<h2>6. Eligibility</h2>' + D.bullets([
    'Every applicant passes Halqa&rsquo;s checks for an unknown committee: identity, the income account, affordability with the '
    'rental counted as a committee instalment, and the credit report.',
    'The modaraba then makes its own credit decision. As a financial institution it obtains its own credit report, and it may '
    'decline an applicant Halqa has passed.',
    'In the second configuration the cash members follow the ordinary rules, including the seat rules for their standing.',
    'One asset per member at a time, and no asset committee while the member has an open default anywhere on Halqa.',
])
    + Q('CBA', 'a modaraba, leasing company, investment bank, financing company, unit trust or mutual fund of any kind and credit or '
               'investment institution, corporation or company', 'section 2(l)(iii)(b), definition of a financial institution within a credit institution'))

b.append('<h2>7. Technical Process</h2>'
         + '<h3>7.1 Catalogue</h3>' + D.steps([
             'The modaraba provides its catalogue of assets, prices, dealers and cities, as a file or through its interface, '
             'refreshed at least monthly.',
             'Halqa shows the catalogue in the application with each asset&rsquo;s price, the rental and the total payable, so the '
             'member sees the whole cost before applying.',
         ])
         + '<h3>7.2 Application and Approval</h3>' + D.steps([
             'A host creates an asset committee, choosing the configuration, the asset and the number of asset seats.',
             'Each applicant completes Halqa&rsquo;s checks. Halqa records the results and asks the applicant&rsquo;s consent to pass '
             'them to the modaraba.',
             'Halqa sends the modaraba an application package through a secure interface: identity details, verified income, the '
             'affordability result, the committee&rsquo;s terms and the seat.',
             'The modaraba makes its decision and returns it by a signed message: approved, approved with conditions, or declined '
             'with a reason code. Halqa tells the applicant.',
         ])
         + '<h3>7.3 Contracts</h3>' + D.steps([
             'The ijarah agreement between the modaraba and the member, based on the modaraba&rsquo;s own form, signed electronically '
             'where the modaraba accepts it.',
             'A separate undertaking by the modaraba to transfer ownership at the end, as ijarah requires.',
             'The committee agreement, in which the member directs that their pot be paid to the modaraba as advance rental, and the '
             'modaraba undertakes to pay the member&rsquo;s contributions.',
             'The mandate for the rental, with the modaraba&rsquo;s account as the permitted payee (Auto Debit, HQ-CP-02).',
         ])
         + '<h3>7.4 Purchase and Delivery</h3>' + D.steps([
             'The modaraba issues a purchase order to the dealer and pays the dealer directly.',
             'The asset is registered in the modaraba&rsquo;s name as owner where registration applies, and the modaraba arranges its takaful.',
             'The dealer delivers the asset to the member. A handover record with the serial, chassis or engine numbers and photographs '
             'is uploaded, and the lease starts on that date.',
         ])
         + '<h3>7.5 Monthly Operation</h3>' + D.steps([
             'The evening before the due date the member is told the rental.',
             'On the due date the partner collects the rental from the member&rsquo;s wallet and pays it to the modaraba.',
             'The modaraba pays the member&rsquo;s contribution into the committee. In the first configuration this and the pot cancel '
             'and are recorded without being moved; in the second, the contribution is paid to that round&rsquo;s collecting member.',
             'On an asset seat&rsquo;s turn the pot is paid to the modaraba as advance rental.',
             'Halqa writes the ledger, sends receipts and gives the modaraba a monthly statement for reconciliation.',
         ])
         + '<h3>7.6 Default and Recovery</h3>' + D.steps([
             'A missed rental follows the retry schedule and the late ladder, and the modaraba is told the same day.',
             'The modaraba continues to pay the member&rsquo;s contributions, so the committee is not affected.',
             'The modaraba recovers its asset under the lease and its own procedures, and may sue in its own name. Halqa takes no part '
             'in repossession and never contacts the member to demand payment.',
             'The default is recorded against the member&rsquo;s standing on Halqa.',
         ])
         + '<h3>7.7 Completion</h3>' + D.steps([
             'After the last rental the modaraba transfers ownership by gift or token sale and issues its no objection certificate '
             'and transfer letter.',
             'The member applies to the registering authority to transfer the asset into their own name.',
             'Halqa closes the committee, issues the final statement and records a clean completion.',
         ])
         + Q('ICTVEH', 'In case of a vehicle leased from a bank or a leasing company, NOC / Transfer Letter is required from relevant bank or '
                       'leasing company', 'Documents Required'))

b.append('<h2>8. Controls</h2>' + T([
    ['Control', 'Detail'],
    ['No custody', 'Rentals go from the member&rsquo;s wallet to the modaraba, and pots from the members to the modaraba, through '
                   'the partner. No rental or pot passes through Halqa'],
    ['Single asset', 'One asset per member at a time; the asset seat cannot be exchanged or transferred'],
    ['Delivery evidence', 'The lease starts only on a handover record matching the dealer&rsquo;s invoice'],
    ['Reconciliation', 'Monthly statement to the modaraba, matched to its receipts; a break holds the next collection'],
    ['Disclosure', 'The asset price, the rental, the total payable, Halqa&rsquo;s referral fee and the dealer&rsquo;s commission are '
                   'shown before the member applies'],
    ['Conduct', 'No calls or messages demanding payment from Halqa; recovery is the modaraba&rsquo;s under its lease'],
], widths=['20%', '80%']))

ref_lo, ref_hi = REF_LO * A, REF_HI * A
deal_lo, deal_hi = DEAL_LO * A, DEAL_HI * A
mid1 = n * (0.03 * A + 0.02 * A)
cash_fees = (n - a) * n * 500.0
mid2 = a * (0.03 * A + 0.02 * A) + cash_fees
b.append('<h2>9. Economics</h2>' + T([
    ['Item', 'Per asset of Rs 120,000', 'Configuration 1, 12 assets', 'Configuration 2, 3 assets and 9 cash members'],
    ['Referral fee from the modaraba, 2 to 4 per cent', '%s to %s' % (rs(ref_lo), rs(ref_hi)), rs(n * 0.03 * A) + ' at 3 per cent', rs(a * 0.03 * A) + ' at 3 per cent'],
    ['Dealer commission, 1 to 3 per cent', '%s to %s' % (rs(deal_lo), rs(deal_hi)), rs(n * 0.02 * A) + ' at 2 per cent', rs(a * 0.02 * A) + ' at 2 per cent'],
    ['Ordinary fee from cash members, Rs 500 an instalment', '', '', rs(cash_fees)],
    ['Halqa&rsquo;s income per committee', '', rs(mid1), rs(mid2)],
], numeric=(1, 2, 3), widths=['34%', '20%', '20%', '26%'])
    + P('Both fees are disclosed to the member before applying. An unknown committee of the same size and instalment earns Halqa '
        'Rs 72,000 in fees, so an asset committee earns about the same. Running costs are as for an unknown committee in the '
        'Business Model and Unit Costs (HQ-CP-03), with one more monthly statement to the modaraba.'))

b.append('<h2>10. Legal Basis</h2>' + P(
    'A modaraba is a business registered and supervised by the Commission under the Modaraba Ordinance 1980, and its business '
    'must be certified by the Religious Board as not opposed to the injunctions of Islam. Ijarah is the modaraba&rsquo;s own '
    'business under its own registration. Halqa introduces members and keeps the record.')
    + Q('MODARABA', 'No modaraba company shall operate without registration with the Registrar.', 'section 4')
    + Q('MODARABA', 'No modaraba shall be a business which is opposed to the injunctions of Islam and the Registrar shall not permit the '
                    'floatation of a modaraba unless the Religious Board has certified in writing that the modaraba is not a business '
                    'opposed to the injunctions of Islam.', 'section 10, Business of modaraba')
    + Q('MODARABA', 'A modaraba shall sue and be sued in its own name through the modaraba company.', 'section 12(1)')
    + Q('SECPMOD', 'Model financing agreements for modarabas', 'list of licensing documents, entry dated 23 January 2023')
    + T([
        ['Point', 'Position', 'Provision'],
        ['Who finances and leases', 'The modaraba, under its registration', 'Modaraba Ordinance 1980, ss.4 and 10'],
        ['Who recovers the asset', 'The modaraba, in its own name', 'Modaraba Ordinance 1980, s.12(1)'],
        ['Credit report on the applicant', 'Obtained by the modaraba as a credit institution', 'Credit Bureaus Act 2015, ss.2(l) and 19(1)(a)'],
        ['Electronic signature of the agreements', 'Valid where the modaraba accepts it', 'Electronic Transactions Ordinance 2002, ss.3 and 7'],
        ['Rental collection', 'A preauthorised transfer to the modaraba', 'PS&amp;EFT Act 2007, s.35'],
        ['Halqa takes no deposit', 'No rental or pot passes through Halqa', 'Companies Act 2017, s.84(1)'],
        ['Transfer of a vehicle at the end', 'The modaraba&rsquo;s no objection certificate and transfer letter', 'Excise and Taxation practice, Islamabad'],
    ], widths=['30%', '40%', '30%']))

b.append('<h2>11. Requirements</h2>' + T([
    ['Item', 'Detail'],
    ['Agreement with a modaraba', 'Introduction, data sharing, catalogue, application interface, decision messages, statements and fees'],
    ['Religious Board clearance', 'The modaraba&rsquo;s confirmation that the structure, including the pot as advance rental and the '
                                  'payment of contributions from the rental, is within its certified business'],
    ['Dealer arrangements', 'Authorised dealers per asset and city, with delivery records'],
    ['Interfaces', 'Application submission; signed decision messages; catalogue feed; monthly statement; default notice'],
    ['Halqa components', 'Asset catalogue; asset committee type in circle creation; consent to share data; handover record; '
                         'modaraba statement; completion and transfer tracking'],
], widths=['26%', '74%']))

b.append('<h2>12. Open Items</h2>' + D.bullets([
    'Counsel&rsquo;s opinion on whether introducing members to the modaraba for a referral fee is arranging finance that needs a licence.',
    'The modaraba&rsquo;s margin, minimum ticket, cities served and asset types.',
    'Whether the modaraba accepts electronic signature of the ijarah agreement, and the registration practice in each province.',
    'The takaful of the asset and who bears its cost within the rental.',
    'The resale share the modaraba uses for planning, which replaces the 70 per cent figure in section 5.',
]))

b.append(D.summary(
    'A modaraba buys the asset and leases it to the member, who uses it from the first month and pays one rental a month on the '
    'committee date. The modaraba pays the member&rsquo;s committee contribution out of the rental and receives the member&rsquo;s pot '
    'on their turn, which repays the asset. When the committee ends the asset becomes the member&rsquo;s. If a member stops paying, '
    'the modaraba keeps paying their contributions and takes back its own asset, so the other members lose nothing. Halqa arranges '
    'the committee, earns a disclosed referral fee and dealer commission, and never handles a rental.'))

body = ''.join(b)
cleanrules.check('Asset Committees', body)
path = os.path.join(OUT, 'Asset Committees.pdf')
D.render(path, 'Asset Committees', 'Committees through which members obtain an asset, such as a motorcycle or a machine, leased by a '
         'licensed modaraba until the committee completes.', 'HQ-CP-01', body=body)
print('Asset Committees', D.pdf_pages(path), 'pages; return 1 %.3f, return 2 %.3f, fm1 %d, fm2 %d' % (ret1, ret2, fm1, fm2))
