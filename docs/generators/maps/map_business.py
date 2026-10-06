import mapkit as k

W = 2560
C = {'rev': '#9A7616', 'cost': '#9E3524', 'unit': '#1E4E8C', 'scale': '#1F6F6B',
     'part': '#7A5C10', 'mkt': '#8A3B5E', 'later': '#1E6B48'}
FAMS = [(C['rev'], 'Revenue'), (C['cost'], 'Cost'), (C['unit'], 'Unit economics'),
        (C['scale'], 'Scale'), (C['mkt'], 'Market'), (C['later'], 'Later revenue'),
        (C['part'], 'Counterparties')]

o = [k.head('Halqa business model',
            'Where the revenue comes from, what each payment costs to run, and the result for seven committee types.',
            W, FAMS, rev='Rev 4', date='25 September 2026')]

KF = [('Rs 13 to 35', 'running cost per payment', 'Hyper to unknown committees'),
      ('Rs 4.35', 'per WhatsApp message', 'US$0.015 from 1 October 2026'),
      ('Rs 1.32 m', 'fixed costs a month at launch', 'team, counsel, office, software'),
      ('2,400', 'active members to break even', 'at the assumed mix of types'),
      ('Rs 6,400', 'national average instalment', 'falls in the third fee band')]
KW = (W - 80 - 4 * 18) // 5
for i, (fig, cap, note) in enumerate(KF):
    o.append(k.keyfigure(40 + i * (KW + 18), 150, KW, 100, C['unit'] if i < 3 else C['scale'], fig, cap, note))

# fee grid -----------------------------------------------------------------
GX, GY, GW = 40, 276, 1200
rows = [('Instalment', 'Two to six', 'Seven to ten', 'Eleven or more'),
        ('Up to Rs 2,500', '100', '100', '150'),
        ('Rs 2,501 to 5,000', '100', '150', '200'),
        ('Rs 5,001 to 10,000', '150', '300', '500'),
        ('Above Rs 10,000', '200', '400', '500')]
GH = 52 + 34 * len(rows)
o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.4"/>'
         % (GX, GY, GW, GH, k.PANEL, C['rev']))
o.append(k.label(GX + 18, GY + 28, 'Fee per instalment, in rupees', 15, C['rev'], weight=600))
o.append(k.label(GX + 18, GY + 44, 'GRADED BY INSTALMENT SIZE AND ROSTER SIZE, PAID TO HALQA', 10, k.INK3, mono=True))
colx = [GX + 18, GX + 520, GX + 760, GX + 1000]
for r, row in enumerate(rows):
    yy = GY + 52 + 34 * r + 22
    if r == 0:
        o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1"/>'
                 % (GX + 18, yy + 10, GX + GW - 18, yy + 10, k.RULE))
    for c, cell in enumerate(row):
        size = 11 if r == 0 else 13
        col = k.INK3 if r == 0 else k.INK
        o.append(k.label(colx[c], yy, cell, size, col, mono=(r == 0)))

# seven committee types ------------------------------------------------------
TX, TW = 1280, 1200
lines = [('Committee type', 'contribution per circle, first and later'),
         ('Family circle, 6 at Rs 5,000', '(Rs 162) first, Rs 2,318 later'),
         ('Office circle, 12 at Rs 10,000', 'Rs 57,006 first, Rs 61,966 later'),
         ('Market circle, 10 at Rs 2,000 weekly', 'Rs 3,031 first, Rs 7,165 later'),
         ('Unknown circle, 12 at Rs 10,000', 'Rs 63,573 first, Rs 71,369 later'),
         ('Large unknown, 20 at Rs 25,000', 'Rs 235,015 first, Rs 248,008 later'),
         ('Hyper Option 1, 400 at Rs 450 daily', 'Rs 1,040,998 first, Rs 1,320,855 later'),
         ('Hyper Option 2, 390 at Rs 500 daily', 'Rs 473,357 first, Rs 746,218 later'),
         ('Running cost per payment', 'Rs 13 to Rs 35'),
         ('Break even at launch', 'about 2,400 active members')]
TH = 52 + 30 * len(lines) + 12
o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.4"/>'
         % (TX, GY, TW, TH, k.PANEL, C['cost']))
o.append(k.label(TX + 18, GY + 28, 'Seven committee types', 15, C['cost'], weight=600))
o.append(k.label(TX + 18, GY + 44, 'FEE AND COMMISSION LESS RUNNING COSTS AND REWARDS', 10, k.INK3, mono=True))
for i, (a, b) in enumerate(lines):
    yy = GY + 52 + 30 * i + 20
    strong = i == 0 or a.startswith('Break')
    o.append(k.label(TX + 18, yy, a, 12.5, k.INK, weight=600 if strong else None))
    o.append(k.label(TX + TW - 18, yy, b, 12.5, k.INK if strong else k.INK2, anchor='end',
                     weight=600 if strong else None))

COLS = [40, 550, 1060, 1570, 2080]
CW, CX = 470, [x + 235 for x in COLS]
ROW1_Y = GY + max(GH, TH) + 70

ROW1 = [
    ('rev', 'Revenue', 'every source, at stage 1', [
        'Service fee on every instalment collected',
        'Charged in advance for a service rather than held',
        'Flat across the roster, never graded by collection day',
        'Uplift where Halqa rather than the host fills a roster',
        'Rehabilitation fee where a defaulted position is restored',
        'Agency commission from the takaful operator, about 15 per cent',
        'Distribution commission from the asset manager, at stage 2',
        'No share of any amount passing between members',
        'No interest, no rate and no discount on a payout',
        'No custody, so no float income at any stage',
    ]),
    ('cost', 'Cost', 'what consumes the fee', [
        'WhatsApp: Rs 4.35 a message, about one per payment',
        'Identity: Rs 63 known, Rs 300 unknown, Rs 350 Hyper, once',
        'Support: Rs 104 a contact, one per 15 to 40 payments',
        'Cloud: about Rs 2 per active member a month',
        'Payment partner: target 1 per cent, capped at Rs 10',
        'Points and waivers to later seats: 10 per cent of fees',
        'Acquisition Rs 250 and referral Rs 100 per new member',
        'Default loss falls on the takaful fund, not on Halqa',
    ]),
    ('unit', 'Unit economics', 'the numbers that decide the model', [
        'Cost per payment, known monthly: about Rs 16 to Rs 19',
        'Cost per payment, unknown monthly: about Rs 35',
        'Cost per payment, Hyper: about Rs 13 to Rs 14',
        'Each active member: about Rs 553 a month after costs',
        'Every type covers its running costs from its first circle',
        'Dollar billed services at Rs 290 to the dollar',
        'Sales tax of 15 per cent added to the fee in Islamabad',
    ]),
    ('scale', 'Scale', 'fixed costs and break even', [
        'Fixed costs at launch: Rs 1,316,150 a month',
        'Break even: about 2,400 active members',
        'Fixed costs at 100,000 members: Rs 5,610,000 a month',
        'Contribution at 100,000 members: Rs 55,313,088 a month',
        'Operating result before tax: Rs 49,703,088 a month',
        'Assumes the mix of types in the Business Model',
    ]),
    ('rev', 'Fee discounts', 'risk reduction lowers the fee', [
        'Guarantee cheque on file: 80 per cent off',
        'Income slip and employer verified: 50 per cent off',
        'Income account: mandatory on unknown committees, not a discount',
        'The largest applicable discount is taken, they do not stack',
        'A flat fee is legible where a rate is not',
        'A fee charged for a service is not a deposit',
        'A fee paid to Halqa creates no lender and no borrower',
        'Later seats compensated by Halqa in points and waivers',
        'The whole grid is published before any commitment',
    ]),
]
hs = []
for i, (fam, t, s, items) in enumerate(ROW1):
    body, h = k.cluster(COLS[i], ROW1_Y, CW, C[fam], t, s, items)
    o.append(body); hs.append(h)

ROW2_Y = ROW1_Y + max(hs) + 60
ROW2 = [
    ('later', 'Hyper', 'per cycle, cover sized for 50 per cent', [
        'Option 1: 400 members, 50 days, Rs 450 a day',
        'Contribution Rs 300, takaful Rs 75, fee Rs 75',
        'Fee revenue Rs 1,500,000, commission Rs 225,000',
        'Running costs Rs 254,145, later seat rewards Rs 150,000',
        'Net Rs 1,320,855 a cycle, returning members',
        'Option 2: 390 members, 26 active days, Rs 500 a day',
        'Contribution Rs 333.33, takaful Rs 83.33, fee Rs 83.33',
        'Fee revenue Rs 845,000, commission Rs 126,750',
        'Running costs Rs 141,032, later seat rewards Rs 84,500',
        'Net Rs 746,218 a cycle, returning members',
    ]),
    ('later', 'Later revenue', 'each one needs a registration first', [
        'Distribution commission from the asset manager',
        'Agency commission from the takaful operator',
        'Asset committee referral from the modaraba, 2 to 4 per cent',
        'Employer payroll committees',
        'Remittance committees over a licensed rail',
        'Aggregate insight sold without identifying any member',
        'White label of the ledger to a licensed institution',
    ]),
    ('mkt', 'Market', 'what the model is competing with', [
        'Committees are already universal and run on paper',
        'The filter is regularity of income, not level of income',
        '25 attempts studied across nine markets; four models work',
        'A wallet has launched a committee product at scale',
        'That product holds the pot in an administrator wallet',
        'It sets the order by administrator choice',
        'It offers no exit before the cycle ends',
        'Halqa holds nothing, orders by rule and permits exit',
    ]),
    ('scale', 'The partner’s charge', 'per payment, not a percentage', [
        'Target: 1 per cent of the debit, capped at Rs 10',
        'Hyper Option 1: Rs 4.50 at target, Rs 6.75 at 1.5 per cent',
        'Unknown, Rs 10,000: Rs 10 at target, Rs 165.70 at 1.5 per cent',
        'Unknown, Rs 25,000: Rs 10 at target, Rs 403 at 1.5 per cent',
        'At 1.5 per cent a large unknown circle earns 63 per cent less',
        'The fee is flat, so a percentage takes a rising share of it',
        'Also ask whether the charge can pass to the payer',
    ]),
    ('part', 'Launch timeline', 'days from a standing start', [
        'SECP incorporation: 2 to 5 days',
        'National Tax Number: 1 to 2 days, automatic after incorporation',
        'Islamabad sales tax on services: 3 to 5 days',
        'Company bank account: 7 to 14 days',
        'Partner approval: 14 to 21 days, the largest unknown',
        'Partner’s notice to the State Bank: 0 to 30 days, para 7.I(h)',
        'Integration and live credentials: 5 to 10 days',
        'Standard circles live: 30 days best case, 45 realistic, 75 at worst',
        'Takaful agency agreement: 4 to 8 weeks',
        'Hyper live once cover is in place: 75 to 90 days',
    ]),
    ('part', 'Counterparties', 'none contracted at this date', [
        'Electronic money institution: NayaPay or SadaPay',
        'Payment aggregator, for the fee only: PayFast or Safepay',
        'Identity: NADRA',
        'Credit bureau: TASDEEQ, alternate DataCheck',
        'Trustee: Central Depository Company of Pakistan',
        'Asset manager candidate: Mahaana Wealth',
        'Takaful candidates: Pak-Qatar General Takaful, Salaam Takaful',
        'Modaraba candidates: Orix, First Habib, Allied Rental, First Punjab',
        'Voucher retailers under consideration: Daraz, foodpanda, Careem',
        'Messaging: WhatsApp Business Platform',
    ]),
]

_all = ROW1 + ROW2
ROW1, ROW2 = _all[:5], _all[5:10]
ROW3 = _all[10:]
hs2 = []
for i, (fam, t, s, items) in enumerate(ROW2):
    body, h = k.cluster(COLS[i], ROW2_Y, CW, C[fam], t, s, items)
    o.append(body); hs2.append(h)

if ROW3:
    R3 = ROW2_Y + max(hs2) + 64
    hs3 = []
    for i, (fam, t, s, items) in enumerate(ROW3):
        body, h = k.cluster(COLS[i], R3, CW, C[fam], t, s, items)
        o.append(body); hs3.append(h)
    BR3 = R3 - 34
    o.append(k.line('M%d %d H %d' % (CX[0], BR3, CX[min(len(ROW3) - 1, 4)])))
    for i in range(len(ROW3)):
        o.append(k.line('M%d %d V %d' % (CX[i], BR3, R3)))
    _tail = R3 + max(hs3)
else:
    _tail = ROW2_Y + max(hs2)

H = _tail + 60
k.build('halqa-map-business', W, H, '\n'.join(o), png_name='HALQA-MAP-BUSINESS-MODEL',
        aria='Halqa business model map. A fee grid, the result for seven committee types, and groups '
             'covering revenue, cost, unit economics, scale, later revenue, market position, pricing and counterparties.')
