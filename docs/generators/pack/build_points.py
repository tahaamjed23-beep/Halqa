# -*- coding: utf-8 -*-
"""Seat Exchange and Points (HQ-CP-04): how a member moves to an earlier seat without any member paying another,
and the digital points system that rewards the member who moves later. Figures computed and asserted here."""
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


T = D.table

BANDS = [(2, 250), (4, 500), (6, 1000), (8, 1500), (99, 2000)]
SWAP_FEE = 500.0
TAX = 0.15
CAP = 0.10


def points_for(s):
    for top, p in BANDS:
        if s <= top:
            return p


# example: 12 members, Rs 10,000, fee Rs 500; agreed after round 1; seat 2 and seat 10 exchange
n, c, fee = 12, 10000.0, 500.0
frm, to = 2, 10
moved = to - frm
waiver = moved * fee
pts = points_for(moved)
cost = waiver + pts - SWAP_FEE
circle_fees = n * n * fee
cap = CAP * circle_fees
assert moved == 8 and pts == 1500 and waiver == 4000 and cost == 5000 and circle_fees == 72000 and cap == 7200

b = []
b.append(P(
    'A member who needs the pot sooner may move to an earlier seat by exchanging seats with a member who agrees to move later. '
    'No money passes between the two members. Halqa rewards the member who moves later with fee waivers and points, from its '
    'own revenue and on a published schedule, and the member who moves earlier pays Halqa a flat exchange fee. This document '
    'sets out the rule that makes this necessary, the points system, the exchange, the ledger that records it, the controls, '
    'and the legal position.'))

b.append('<h2>1. Constraint</h2>' + P(
    'A member who pays another member to collect earlier is paying for the use of money over time. That makes one member a '
    'lender and the other a borrower, which is the activity the peer to peer rules govern, and a price that rises with the '
    'months gained reads as interest. Seats are therefore never sold, and no member ever pays another member, in money or in '
    'anything that can be turned into money, for a seat.')
    + Q('P2P', '&lsquo;Peer to Peer Lending&rsquo; or &lsquo;P2P Lending&rsquo; shall mean the extension of loans by the lender to the borrower '
               'through the P2P Lending Platform whereas the Platform would be an intermediary providing P2P services through online '
               'medium or otherwise to the participants who have entered into an arrangement with that platform to lend or to borrow money',
        'definition of Peer to Peer Lending')
    + D.bullets([
        'The member who moves earlier pays Halqa the same flat fee for any exchange, whatever the number of seats or months gained, '
        'so the fee is not a price for time.',
        'The member who moves later is rewarded by Halqa, not by the other member. The reward is Halqa&rsquo;s own promotional cost, '
        'published in advance, the same for every member, and not linked to anything the other member pays.',
        'Points can never be paid to another member, transferred, sold or cashed.',
    ]))

b.append('<h2>2. Points</h2>' + T([
    ['Feature', 'Rule'],
    ['What a point is', 'An entry in Halqa&rsquo;s points ledger recording a discount Halqa has promised the member. It is not money '
                        'and is not a claim to money'],
    ['Value', 'One point reduces a Halqa fee by one rupee when redeemed'],
    ['How points are obtained', 'Only by the earning rules in section 3. Points are never sold and never issued against a payment'],
    ['Where points can be used', 'Only with Halqa: against Halqa&rsquo;s own fees, including the exchange fee, or for a voucher that '
                                 'Halqa buys with its own money and gives to the member'],
    ['What points cannot do', 'Be withdrawn as cash, be transferred to another member, or pay a contribution or a takaful contribution'],
    ['Pending and available', 'Points are pending when earned and become available when the condition in section 3 is met'],
    ['Expiry', 'Available points expire 24 months after they become available, oldest first, with notice 30 days before'],
    ['Default', 'Pending points of a member who defaults are cancelled; available points are frozen until the default is cleared'],
], widths=['24%', '76%']))

b.append('<h2>3. Earning Rules</h2>' + T([
    ['Event', 'Points', 'Available when'],
    ['Seat in the last third of a circle', 'Equal to 20 per cent of the fees the member pays in that circle', 'The circle completes and the member has paid every instalment'],
    ['Seat in the middle third', 'Equal to 10 per cent of the fees paid', 'The same'],
    ['Seat in the first third', 'None', ''],
    ['Hosting a circle that completes with no default', '250', 'The circle completes'],
    ['Referring a new member', '100', 'The new member completes their first circle'],
    ['Moving later in a seat exchange', 'By seats moved: 1 or 2 seats, 250; 3 or 4, 500; 5 or 6, 1,000; 7 or 8, 1,500; 9 or more, 2,000',
     'The member has paid every instalment up to and including the round of their new seat'],
], widths=['30%', '40%', '30%'])
    + P('Across a circle with equal thirds, the seat points come to 10 per cent of the fees, the planning figure used in the '
        'Business Model and Unit Costs (HQ-CP-03). The seat points reward waiting in every circle, whether or not an exchange '
        'takes place. The exchange points are paid in addition, because moving later is a choice made to help another member.'))

b.append('<h2>4. Redemption</h2>' + T([
    ['Use', 'Rate', 'How it works'],
    ['Halqa&rsquo;s fee on any future instalment', '1 point = Rs 1', 'Applied when the debit instruction is prepared, so the fee part of '
                                                                    'the debit is reduced. Up to the whole fee'],
    ['The exchange fee', '1 point = Rs 1', 'The member moving earlier may pay the Rs 500 fee in points'],
    ['A retail voucher', 'At the published points price of each voucher', 'Halqa buys the voucher from the retailer with its own money '
                                                                           'and gives the code to the member. Retailers under consideration: '
                                                                           'Daraz, foodpanda and Careem. None is contracted'],
    ['Cash, transfer, contributions', 'Not permitted', ''],
], widths=['28%', '22%', '50%']))

b.append('<h2>5. Seat Exchange</h2>'
         + '<h3>5.1 Rules</h3>' + D.bullets([
             'Both members consent, each confirming with the PIN, and the host approves.',
             'Each member&rsquo;s standing must permit the new seat under the seat rules. A member moving into the first half needs '
             'the Good or Excellent band.',
             'An exchange may be agreed until the round before the earlier of the two seats collects, and never after either member '
             'has collected.',
             'One exchange per member per circle, and never an exchange back.',
             'Halqa&rsquo;s net cost of all exchanges in a circle is capped at 10 per cent of that circle&rsquo;s fees. Once the cap is '
             'reached, no further exchange is offered in that circle.',
             'Not offered on Hyper or on asset seats.',
         ])
         + '<h3>5.2 Reward and Fee</h3>' + T([
             ['Party', 'Receives', 'Pays'],
             ['Member moving later', 'A waiver of Halqa&rsquo;s fee on as many of their next instalments as the seats moved, and '
                                     'exchange points by seats moved', 'Nothing'],
             ['Member moving earlier', 'The earlier seat', 'Rs 500 to Halqa, plus sales tax, in money or in points'],
             ['Each other', 'Nothing', 'Nothing'],
         ], widths=['24%', '52%', '24%'])
         + D.formula('Net cost to Halqa = s &times; f + points(s) &minus; 500', 'For s seats moved and a fee of f per instalment')
         + D.figure(os.path.join(FIG, 'swap-cost.png'), 'Net cost to Halqa of one exchange by seats moved and fee per instalment. '
                    'Green: within half the cap of a 12 member circle, offered freely. Amber: within the cap, offered once in that '
                    'circle. Red: above the cap of a 12 member circle, not offered there.', '92%'))

b.append('<h2>6. Illustration</h2>' + P(
    'A circle of 12 members at Rs 10,000 a month, with Halqa&rsquo;s fee at Rs 500 an instalment. After round 1, Omar, in seat 10, '
    'needs the pot sooner. Sana, in seat 2, agrees to move to seat 10. Omar is in the Good band, which permits seat 2.')
    + T([
        ['Item', 'Amount'],
        ['Seats moved', str(moved)],
        ['Sana: fee waived on her next %d instalments, rounds 2 to 9' % moved, rs(waiver)],
        ['Sana: sales tax not charged on the waived fees', rs(waiver * TAX)],
        ['Sana: exchange points, available once she has paid round 10', num(pts) + ' points'],
        ['Omar: exchange fee to Halqa, plus sales tax of Rs 75', rs(SWAP_FEE)],
        ['Paid by Omar to Sana, or by Sana to Omar', rs(0)],
        ['Net cost to Halqa', rs(cost)],
        ['Cap for this circle, 10 per cent of fees of %s' % rs(circle_fees), rs(cap)],
    ], numeric=(1,), widths=['74%', '26%'])
    + P('Sana later uses her 1,500 points against three fees of Rs 500 in her next circle. Omar collects Rs 120,000 in round 2 and '
        'owes Rs 100,000 over the remaining rounds, which is why only a member in the Good or Excellent band may move to that seat.'))

b.append('<h2>7. Technical Process</h2>'
         + '<h3>7.1 Points Ledger</h3>' + D.bullets([
             'Every change in points is an entry in an append only ledger: entry number, member, type (earned, made available, '
             'redeemed, reserved, released, expired, cancelled), points, the circle, round or exchange it relates to, and the time.',
             'A member&rsquo;s balance is the sum of their entries. There is no balance field that can be edited.',
             'Each entry has a matching entry in Halqa&rsquo;s accounts: points earned increase a points liability, and points '
             'redeemed or expired reduce it.',
         ])
         + '<h3>7.2 Exchange Transaction</h3>' + D.steps([
             'A member asks to move earlier. Halqa lists the members of the circle who have said they are open to moving later, with '
             'the published reward for each possible move. No price is proposed by any member.',
             'The member moving later accepts with the PIN; the member moving earlier confirms with the PIN; the host approves.',
             'Halqa checks both standings against the new seats, the timing rule, the one exchange rule and the circle cap.',
             'In one database transaction Halqa swaps the two seats in the collection order, writes the exchange record, marks the '
             'fee waivers against the later member&rsquo;s next instalments, writes the pending points and charges the exchange fee.',
             'Both members, and the host, receive a notice of the new order. The auto debit mandates need no change, because every '
             'member of the roster is already a permitted payee.',
         ])
         + '<h3>7.3 Redemption at Collection</h3>' + D.steps([
             'When the debit for an instalment is prepared, the member&rsquo;s chosen points are reserved and the fee part of the debit '
             'is reduced by the same number of rupees.',
             'When the partner confirms the debit, the reservation becomes a redemption. If the debit fails, the reservation is released.',
             'The receipt shows the fee, the points used and the amount taken.',
         ])
         + '<h3>7.4 Vouchers and Expiry</h3>' + D.steps([
             'A voucher request reserves the points, obtains a code from Halqa&rsquo;s purchased stock or the retailer&rsquo;s '
             'interface, and then confirms the redemption and shows the code.',
             'A monthly job expires points 24 months after they became available, after a notice 30 days before.',
         ])
         + '<h3>7.5 Controls</h3>' + T([
             ['Risk', 'Control'],
             ['One person with two accounts exchanging to collect points', 'One account per CNIC; exchanges blocked between accounts '
                                                                          'sharing a device, a payment account or a network pattern'],
             ['Points collected and then a default', 'Exchange points stay pending until the new seat&rsquo;s round is paid; pending '
                                                     'points are cancelled on default'],
             ['Pressure on a member to move later', 'Only the member moving later can start the acceptance; the host cannot accept for a member'],
             ['Cost running away', 'The cap per circle, and a monthly budget reported to the board'],
             ['Points treated as money', 'No transfer, no cash, no use for contributions; enforced in the ledger, not only in the screen'],
         ], widths=['36%', '64%']))

b.append('<h2>8. Legal Position</h2>' + P(
    'Points are not electronic money, because they are not issued against any payment and cannot be spent with anyone but Halqa. '
    'Electronic money is defined by what it is issued for and where it is accepted.')
    + Q('EMI', 'Electronic Money or E-money: means the monetary value as represented by a claim on the issuer which is stored in an '
               'electronic including magnetic device or Payment Instrument, issued on receipt of funds of an amount not less in value '
               'than the monetary value issued, accepted as means of payment by undertakings other than the issuer',
        'paragraph 2, Definitions')
    + D.bullets([
        'Issued on receipt of funds: points are issued as a reward, never against money received.',
        'Accepted by undertakings other than the issuer: points are redeemed only with Halqa. For a voucher, Halqa itself buys the '
        'voucher from the retailer; the retailer never accepts a point.',
        'No deposit arises, because no money is received from the member for points.',
        'No member lends to another, because nothing passes between the two members of an exchange.',
        'Points are earned by published rules, never by a draw or by chance, so no lottery is involved.',
    ])
    + Q('PPC294', 'Whoever keeps any office or place for the purpose of drawing any lottery not being a State lottery or a lottery '
                  'authorized by the Provincial Government shall be punished', 'section 294-A, Keeping lottery office'))

b.append('<h2>9. Open Items</h2>' + D.bullets([
    'Counsel&rsquo;s written view that a flat exchange fee and Halqa&rsquo;s published reward are not a price for time.',
    'The tax adviser&rsquo;s view on sales tax where a fee is reduced by points, and on the accounting of the points liability.',
    'Voucher agreements with retailers, and the points price of each voucher.',
]))

b.append(D.summary(
    'Members never pay each other for a seat. A member who needs the pot sooner exchanges seats with a member who agrees to wait, '
    'and pays Halqa a flat Rs 500. The member who waits gets Halqa&rsquo;s fee waived for as many instalments as the seats moved, '
    'and points from Halqa. A point is worth one rupee off a Halqa fee or towards a voucher Halqa buys, and can never be cashed or '
    'given to another member. Members in later seats earn points in every circle as well.'))

body = ''.join(b)
cleanrules.check('Seat Exchange and Points', body)
path = os.path.join(OUT, 'Seat Exchange and Points.pdf')
D.render(path, 'Seat Exchange and Points', 'How a member moves to an earlier seat without any member paying another, and the '
         'digital points system that rewards the member who moves later.', 'HQ-CP-04', body=body)
print('Seat Exchange and Points', D.pdf_pages(path), 'pages')
