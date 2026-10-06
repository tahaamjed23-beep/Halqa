import mapkit as k

W = 2560
C = {'earn': '#1E6B48', 'issue': '#9A7616', 'spend': '#8A3B5E', 'partner': '#7A5C10',
     'cost': '#6B3FA0', 'score': '#1E4E8C', 'rule': '#2E3A44', 'risk': '#9E3524'}
FAMS = [(C['earn'], 'How points are earned'), (C['issue'], 'Issue and accounting'),
        (C['spend'], 'How points are spent'), (C['partner'], 'Voucher retailers'),
        (C['cost'], 'What it costs Halqa'), (C['score'], 'Credit standing'),
        (C['rule'], 'Rules'), (C['risk'], 'What points are not')]

o = [k.head('Halqa credit and rewards',
            'Standing is the record a member builds. Points are what Halqa pays for behaviour that reduces risk. '
            'Neither is ever funded by another member.', W, FAMS, rev='Rev 2', date='25 September 2026')]

# ---- the two currencies ---------------------------------------------------
TY, TH = 150, 196
TW = (W - 80 - 24) // 2
PANELS = [
    (C['score'], 'Credit standing', 'A RECORD, NOT A CURRENCY', [
        ('Built from', 'payment behaviour, tenure, completion'),
        ('Held', 'inside Halqa, on its own scale'),
        ('Bureau figure', 'held separately, never merged'),
        ('Decides', 'which seats a member may claim'),
        ('Never decides', 'the order, the fee, or any rate'),
        ('Cannot be', 'bought, sold, transferred or gifted'),
    ]),
    (C['issue'], 'Points and waivers', 'A LIABILITY HALQA ISSUES', [
        ('Issued by', 'Halqa, from its own fee revenue'),
        ('Never funded by', 'another member, in any circle'),
        ('Earned for', 'waiting, paying on time, referring, hosting'),
        ('Spent on', 'fees, and vouchers Halqa buys'),
        ('Recorded as', 'a liability on the Halqa balance sheet'),
        ('Expire', '24 months after becoming available'),
    ]),
]
for i, (col, title, sub, rows) in enumerate(PANELS):
    x = 40 + i * (TW + 24)
    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.6"/>'
             % (x, TY, TW, TH, k.PANEL, col))
    o.append('<rect x="%d" y="%d" width="%d" height="4" fill="%s"/>' % (x, TY, TW, col))
    o.append(k.label(x + 18, TY + 30, title, 17, col, weight=600))
    o.append(k.label(x + 18, TY + 46, sub, 10, k.INK3, mono=True))
    for r, (a, b) in enumerate(rows):
        yy = TY + 72 + r * 21
        o.append(k.label(x + 18, yy, a, 12, k.INK2))
        o.append(k.label(x + 280, yy, b, 12.5, k.INK))

# ---- the loop -------------------------------------------------------------
LY, LH = 372, 148
o.append('<rect x="40" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.4"/>'
         % (LY, W - 80, LH, k.PANEL, C['earn']))
o.append(k.label(58, LY + 28, 'The loop', 15, C['earn'], weight=600))
o.append(k.label(58, LY + 44, 'BEHAVIOUR RAISES STANDING AND EARNS POINTS. POINTS ARE SPENT. STANDING IS NOT.',
                 10, k.INK3, mono=True))
STEPS = [('Behaviour', ['pays on time, completes', 'waits for a later seat']),
         ('Standing rises', ['earlier seats open', 'larger circles open']),
         ('Points issued', ['by Halqa, from fee revenue', 'never from another member']),
         ('Points spent', ['against fees, or for', 'vouchers Halqa buys']),
         ('Cost booked', ['a liability when issued', 'settled when redeemed'])]
SW = (W - 160 - 4 * 40) // 5
for i, (t, lines) in enumerate(STEPS):
    x = 58 + i * (SW + 40)
    o.append(k.box(x, LY + 62, SW, 72, t, lines, col=C['earn'] if i < 3 else C['cost'], title_size=14))
    if i < 4:
        o.append(k.arrow('M%d %d H %d' % (x + SW, LY + 98, x + SW + 34), col=k.INK2, width=1.5, marker='m2'))

COLS = [40, 550, 1060, 1570, 2080]
CW, CX = 470, [x + 235 for x in COLS]
R1 = 584

ROW1 = [
    ('earn', 'How points are earned', 'every route, and the amount', [
        'Last third of seats: 20 per cent of the fees paid',
        'Middle third of seats: 10 per cent of the fees paid',
        'First third of seats: none',
        'Hosting a circle that completes with no default: 250',
        'Referring a member who completes a first circle: 100',
        'Moving later in a seat exchange: 250 to 2,000 by seats moved',
        'With a fee waiver on as many instalments as seats moved',
        'Pending when earned, available once the condition is met',
        'Rewarded on value carried, never on recruitment depth',
    ]),
    ('issue', 'Issue and accounting', 'how a point becomes a number', [
        'Issued by Halqa against its own fee revenue',
        'Booked as a liability at the moment of issue',
        'Carried at the cost Halqa expects to settle it for',
        'Settled when redeemed against a fee or for a voucher',
        'Balance and full earning history visible to the member',
        'Every issue carries the reason it was earned',
        'Expiry 24 months after availability, with 30 days notice',
        'Expired points released from the liability',
        'Reconciled monthly against voucher purchases',
        'Never issued from a member payment, in any circle',
    ]),
    ('spend', 'How points are spent', 'two routes, both disclosed', [
        'Against the Halqa fee on a future instalment',
        'Applied automatically at the next charge',
        'The reduction is shown on the receipt',
        'For a retail voucher that Halqa buys with its own money',
        'The retailer never accepts a point',
        'One point is one rupee off a Halqa fee',
        'Partial redemption permitted against any fee',
        'No cash redemption, at any point',
        'No transfer between members, at any point',
        'Never used to pay a contribution or a takaful part',
    ]),
    ('partner', 'Voucher retailers', 'candidates, none contracted', [
        'Daraz, for general goods',
        'foodpanda, for everyday spend',
        'Careem, for transport',
        'Halqa buys vouchers from the retailer at a negotiated discount',
        'The discount is the margin on the reward programme',
        'Cost per point is therefore known before it is issued',
        'Partner settlement is monthly against a statement',
        'No member data passes to the partner beyond a redemption code',
        'Partner branding does not appear inside the circle',
    ]),
    ('cost', 'What it costs Halqa', 'the reward programme as a line item', [
        'Every point is a cost, booked when issued',
        'Funded entirely from the service fee',
        'Seat exchange: waivers and points less the Rs 500 exchange fee',
        'Exchange cost capped at 10 per cent of a circle’s fees',
        'The reward costs Halqa and earns member retention',
        'Programme is capped as a percentage of fee revenue',
        'The cap is set before a cycle opens and is not exceeded',
        'Breakage from expiry reduces the net cost',
        'Reviewed each cycle against redemption behaviour',
    ]),
]
hs = []
for i, (fam, t, s, items) in enumerate(ROW1):
    body, h = k.cluster(COLS[i], R1, CW, C[fam], t, s, items)
    o.append(body); hs.append(h)

R2 = R1 + max(hs) + 64
ROW2 = [
    ('score', 'How standing is built', 'the inputs, in full', [
        'Every instalment paid, and the day it was paid',
        'Every instalment missed, and for how long',
        'Circles completed without incident',
        'Circles exited, and the reason recorded',
        'Position held in each circle',
        'Tenure on the platform',
        'Identity verification level reached',
        'Income declared, and whether it was verified',
        'Exposure held across all circles at once',
        'Bureau report, where the member has instructed one',
        'Nothing read from a device beyond the application',
    ]),
    ('score', 'What standing decides', 'and what it is forbidden to decide', [
        'Four bands, from lowest to highest',
        'Lowest band: the final seats only, and no position listing',
        'Middle band: the second half of the order',
        'Upper bands: any seat the forward liability gate permits',
        'Highest bands: eligibility for the hyper product',
        'Eligibility to host a circle',
        'It does not set the order once a circle has begun',
        'It does not price the fee, which is flat by design',
        'It does not produce a rate of any kind',
        'It is not merged with the bureau figure into one number',
    ]),
    ('rule', 'Damage and repair', 'what a default costs, and how it is undone', [
        'Late payment reduces standing by 20, then 40, then 60',
        'Default after collecting the pot reduces it by 200',
        'Nothing is recorded during the grace window',
        'An open default locks creation and joining',
        'Pending points are cancelled on default',
        'Available points are frozen until the default is cleared',
        'Contact leads to a hardship statement and a waived fine',
        'Meeting the revised date restores part of the reduction',
        'Clean circles after a default rebuild standing over time',
        'Written off amounts remain on the record permanently',
    ]),
    ('rule', 'Statutory duties', 'owed by any user of a bureau report', [
        'Where a report restricts a seat, the member receives the report',
        'The bureau name, address and telephone number are supplied',
        'A copy of the statutory summary of rights is supplied',
        'A statement that the bureau did not decide is supplied',
        'Disclosure of report content to others is limited by statute',
        'Member visible scores are reviewed against that limit',
        'Disputes referred to the bureau correction process',
        'A disputed entry is marked while the dispute is open',
        'The duty attaches on the first score based restriction',
        'Reading runs on member instruction, writing awaits notification',
    ]),
    ('risk', 'What points are not', 'the lines that are not crossed', [
        'Not money, and not redeemable for cash',
        'Not transferable between members',
        'Not a security, and not tradeable',
        'Not a return on a payment, and not a yield',
        'Not funded by another member, in any circle or tier',
        'Not a substitute for cover against default',
        'Not issued for recruiting, only for value carried',
        'Not used to price a seat or to order a roster',
        'Not held as a balance the member can withdraw',
        'Not a deposit, because nothing is repayable in money',
    ]),
]
hs2 = []
for i, (fam, t, s, items) in enumerate(ROW2):
    body, h = k.cluster(COLS[i], R2, CW, C[fam], t, s, items)
    o.append(body); hs2.append(h)

BR = R1 - 34
o.append(k.line('M%d %d H %d' % (CX[0], BR, CX[4])))
for i in range(5):
    o.append(k.line('M%d %d V %d' % (CX[i], BR, R1)))
o.append(k.label(CX[0] + 18, BR - 12, 'The reward programme', 11, k.INK3, mono=True))

BR2 = R2 - 34
o.append(k.line('M%d %d H %d' % (CX[0], BR2, CX[4])))
for i in range(5):
    o.append(k.line('M%d %d V %d' % (CX[i], BR2, R2)))
o.append(k.label(CX[0] + 18, BR2 - 12, 'Credit standing, its limits, and what points are not', 11, k.INK3, mono=True))

H = R2 + max(hs2) + 60
k.build('halqa-map-rewards', W, H, '\n'.join(o), png_name='HALQA-MAP-CREDIT-AND-REWARDS',
        aria='Halqa credit and rewards map. Two panels contrast credit standing as a record with points as a '
             'liability Halqa issues, a five step loop from behaviour to cost, then groups covering how points are '
             'earned, issued and accounted, how they are spent, the voucher retailers, what the programme costs, '
             'how standing is built, what it decides, damage and repair, statutory duties, and what points are not.')
