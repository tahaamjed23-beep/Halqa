import mapkit as k

W = 2560
C = {'struct': '#1E4E8C', 'split': '#9A7616', 'cover': '#16667A', 'gate': '#1F6F6B',
     'ops': '#2E3A44', 'risk': '#9E3524', 'econ': '#6B3FA0'}
FAMS = [(C['struct'], 'Structure'), (C['split'], 'The three way split'), (C['cover'], 'Takaful cover'),
        (C['gate'], 'Entry gates'), (C['ops'], 'Daily operation'),
        (C['risk'], 'Collapse threshold'), (C['econ'], 'Arithmetic')]

o = [k.head('Hyper committee',
            'Two configurations. Each daily payment splits three ways and the parts never mix: '
            'contribution to the pot, contribution to a takaful risk fund, fee to Halqa.',
            W, FAMS, rev='Rev 5', date='25 September 2026')]

# ---- the two options ------------------------------------------------------
OY, OH = 150, 232
OW = (W - 80 - 24) // 2
OPTS = [
    (C['struct'], 'Option 1', '50 DAY CYCLE', [
        ('Roster', '400 members'), ('Cycle', '50 days'), ('Collecting each day', '8'),
        ('Paid each day', 'Rs 450'), ('Pot collected once', 'Rs 15,000'),
        ('Paid in over the cycle', 'Rs 22,500'), ('Cycle value', 'Rs 6,000,000'),
    ], [('Contribution', 'Rs 300'), ('Takaful', 'Rs 75'), ('Fee to Halqa', 'Rs 75')]),
    (C['struct'], 'Option 2', '26 ACTIVE DAYS, SUNDAYS OFF', [
        ('Roster', '390 members'), ('Cycle', '26 active days'), ('Collecting each day', '15'),
        ('Paid each day', 'Rs 500'), ('Pot collected once', 'Rs 8,666.67'),
        ('Paid in over the cycle', 'Rs 13,000'), ('Cycle value', 'Rs 3,380,000'),
    ], [('Contribution', 'Rs 333.33'), ('Takaful', 'Rs 83.33'), ('Fee to Halqa', 'Rs 83.33')]),
]
for i, (col, title, sub, rows, split) in enumerate(OPTS):
    x = 40 + i * (OW + 24)
    o.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.6"/>'
             % (x, OY, OW, OH, k.PANEL, col))
    o.append('<rect x="%d" y="%d" width="%d" height="4" fill="%s"/>' % (x, OY, OW, col))
    o.append(k.label(x + 18, OY + 30, title, 17, col, weight=600))
    o.append(k.label(x + 18, OY + 46, sub, 10, k.INK3, mono=True))
    for r, (a, b) in enumerate(rows):
        yy = OY + 70 + r * 22
        o.append(k.label(x + 18, yy, a, 12, k.INK2))
        o.append(k.label(x + 460, yy, b, 13, k.INK, weight=600))
    sx = x + 560
    o.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1"/>'
             % (sx - 24, OY + 58, sx - 24, OY + OH - 18, k.RULE))
    o.append(k.label(sx, OY + 76, 'EACH DAILY PAYMENT SPLITS', 10, k.INK3, mono=True))
    for r, (a, b) in enumerate(split):
        yy = OY + 106 + r * 34
        cc = [C['struct'], C['cover'], C['split']][r]
        o.append('<rect x="%d" y="%d" width="6" height="22" fill="%s"/>' % (sx, yy - 16, cc))
        o.append(k.label(sx + 16, yy, b, 17, cc, weight=600))
        o.append(k.label(sx + 130, yy, a, 12, k.INK2))

# ---- the money path -------------------------------------------------------
MY, MH = 408, 258
o.append('<rect x="40" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.4"/>'
         % (MY, W - 80, MH, k.PANEL, C['split']))
o.append(k.label(58, MY + 28, 'Where each part of the daily payment goes', 15, C['split'], weight=600))
o.append(k.label(58, MY + 44, 'ONE PAYMENT, THREE DESTINATIONS, NEVER COMMINGLED', 10, k.INK3, mono=True))
o.append(k.box(58, MY + 96, 330, 110, 'Member pays', ['Rs 450 a day on Option 1', 'Rs 500 a day on Option 2'], col=k.INK))
DEST = [('Collecting member', 'Rs 300, or Rs 333.33 on Option 2, settled by the licensed partner',
         'Halqa never touches it. pot = contribution x days', C['struct'], 'm'),
        ('Participants risk fund', 'Rs 75, or Rs 83.33 on Option 2, held by the licensed takaful operator',
         'Owned by the participants. Surplus returns to them at cycle end', C['cover'], 'mp'),
        ('Halqa', 'Rs 75, or Rs 83.33 on Option 2, into the company revenue account',
         'A fee for services, which s.84 excludes from the meaning of a deposit', C['split'], 'mg')]
for i, (t2, l1, l2, col, mk) in enumerate(DEST):
    by = MY + 62 + i * 64
    o.append('<rect x="620" y="%d" width="%d" height="56" fill="%s" stroke="%s" stroke-width="1.4"/>'
             % (by, W - 700, k.PANEL, col))
    o.append(k.label(640, by + 24, t2, 14, col, weight=600))
    o.append(k.label(880, by + 22, l1, 12, k.INK))
    o.append(k.label(880, by + 40, l2, 11, k.INK2))
    o.append(k.arrow('M388 %d H 500 V %d H 614' % (MY + 151, by + 28), col=col, width=1.6, marker=mk))

COLS = [40, 550, 1060, 1570, 2080]
CW, CX = 470, [x + 235 for x in COLS]
ROW1_Y = 708

ROW1 = [
    ('struct', 'Structure', 'fixed at creation, asserted in code', [
        'Identity 1: pot = contribution x days',
        'Identity 2: roster = collecting each day x days',
        'Option 1: 300 x 50 = 15,000. 8 x 50 = 400',
        'Option 2: 333.33 x 26 = 8,666.67. 15 x 26 = 390',
        'Paid in equals collected, for every member',
        'A configuration breaking either identity is refused',
        '1 hyper committee at a time per member',
        'Hosted, as every circle is',
        'Roster drawn from members who are strangers',
    ]),
    ('split', 'The fee', 'flat, never graded by day', [
        'Option 1: Rs 75 a day, Rs 3,750 over the cycle',
        'Option 2: Rs 83.33 a day, Rs 2,166.67 over the cycle',
        'Identical for every seat on the roster',
        'A fee graded by collection day is priced on the advance',
        'and would read as interest, so grading is not used',
        'Later seats are compensated by points and fee waivers',
        'Points and waivers are issued by Halqa from its own revenue',
        'Points redeemable against fees or for vouchers Halqa buys',
        'Fee revenue: Rs 1,500,000 and Rs 845,000 per cycle',
        'Partner charge at 1 per cent: Rs 90,000 and Rs 50,700 per cycle',
        'Net per cycle, returning members: Rs 1,320,855 and Rs 746,218',
    ]),
    ('cover', 'Takaful cover', 'written by the operator, never by Halqa', [
        'Contribution sits in the participants risk fund',
        'The fund belongs to the 400 participants, not to the operator',
        'Claims paid from the fund when a member defaults after collecting',
        'Surplus at cycle end is distributable to participants',
        'A deficit is met by the operator from its shareholder fund',
        'Halqa acts only as agent, under a written agency agreement',
        'Agency commission at 15 per cent: Rs 225,000 and Rs 126,750',
        'Candidates: Pak-Qatar General Takaful, Salaam Takaful',
        'Underwriter, exclusions, commission and surplus rule disclosed',
    ]),
    ('gate', 'Entry gates', 'who may take a hyper seat', [
        'Income account linked and verified: mandatory',
        'Guarantee cheque on file: 80 per cent off the fee',
        'Income slip and employer verified: 50 per cent off the fee',
        'Minimum standing before entry is considered',
        '2 completed circles with a clean record',
        'Identity verified to the highest level',
        'Rs 1,000 or more on 5 days of every week for 8 weeks',
        'Verified income of Rs 40,909 a month for Option 1',
        '1 open default blocks entry outright',
    ]),
    ('ops', 'Daily operation', 'every 24 hours', [
        'Option 1: 392 members owe, 8 collect',
        'Option 2: 375 members owe, 15 collect',
        'Grace period: 12 hours after the due time',
        'Reminders issued before the due time',
        'Pot netting: pot less Rs 300 for each day missed',
        'Set off where a member collects and owes together',
        'Payouts released once the day closes',
        'Daily statement to every member',
        'Stress index recomputed at the close of each day',
        'Auto debit from the member’s wallet at the partner, one a day',
        'Mandate consent valid under PS&EFT s.35(1), cancellable under s.35(2)',
    ]),
]
hs = []
for i, (fam, t, s, items) in enumerate(ROW1):
    body, h = k.cluster(COLS[i], ROW1_Y, CW, C[fam], t, s, items)
    o.append(body); hs.append(h)

# ---- threshold ------------------------------------------------------------
TY = ROW1_Y + max(hs) + 74
o.append(k.label(40, TY - 16, 'THE COLLAPSE THRESHOLD', 11, C['risk'], mono=True))
o.append(k.label(310, TY - 16, 'The point at which a circle would pay out more than it takes in, '
                               'and the graded bands before it', 11.5, k.INK2))
TH = [
    ('risk', 'Result 1', 'arrears before collection recover themselves', [
        'A member who misses payments before collecting has those',
        'arrears cut from the pot on the day they collect',
        'Option 1: 15,000 less 300 for each day missed',
        'All 50 missed means nothing is received',
        'Arrears before collection are a timing gap, not a loss',
        'The circle recovers them in full on the collection day',
    ]),
    ('risk', 'Result 2', 'the only true loss is default after collection', [
        'A member who collects on day t and stops owes 300 × (50 − t)',
        'There is no pot left from which to net it',
        'Worst case day 1: Rs 14,700, which is 98 per cent of a pot',
        'Midpoint day 25: Rs 7,500',
        'Final day 50: nil',
        'Average across a uniform spread: Rs 7,500, half a pot',
    ]),
    ('econ', 'Result 3', 'expected loss, and the cover it buys', [
        'Expected loss = roster x default rate x half a pot',
        'As a share of cycle value that is half the default rate',
        'Cover needed per day = Rs 150 x the default rate',
        'At 30 per cent: Rs 45 a day, fund Rs 900,000',
        'At 50 per cent: Rs 75 a day, fund Rs 1,500,000',
        'At 100 per cent: Rs 150 a day, the whole margin',
    ]),
    ('cover', 'Result 4', 'the hard stop', [
        'E is the sum of forward liability for every member who',
        'collected and then stopped paying, less anything recovered',
        'C is the cover limit written by the operator',
        'The circle cannot complete once E exceeds C',
        'At that point pots owed exceed contributions still due',
        'No payout is released until E is brought back below C',
    ]),
    ('risk', 'Stress index', 'five axes, weighted, recomputed daily', [
        'Severity: E against cover plus one pot. 45 per cent',
        'Breadth: defaults against cover measured in pots. 20 per cent',
        'Behaviour: share of roster with a prior late payment. 15 per cent',
        'Persistence: arrears age in 12 hour periods, capped at 6. 10 per cent',
        'Timing: day reached out of the cycle. 10 per cent',
        'Green 0 to 33, Amber 34 to 66, Red 67 to 100',
    ]),
]
th = []
for i, (fam, t, s, items) in enumerate(TH):
    body, h = k.cluster(COLS[i], TY, CW, C[fam], t, s, items)
    o.append(body); th.append(h)

# ---- worked table ---------------------------------------------------------
WY = TY + max(th) + 56
rows = [('Day', 'Defaults after collection', 'Unrecovered exposure', 'Index', 'Band', 'Action'),
        ('5', '0', 'Rs 0', '1.2', 'Green', 'Normal operation, reminders only'),
        ('12', '1', 'Rs 14,100', '11.8', 'Green', 'Normal operation, case tracked'),
        ('20', '3', 'Rs 37,800', '28.6', 'Green', 'Host notified, operator put on notice'),
        ('30', '6', 'Rs 64,800', '49.5', 'Amber', 'New joins blocked, next pots pre netted'),
        ('38', '9', 'Rs 81,000', '64.0', 'Amber', 'Claim prepared, roster informed'),
        ('45', '13', 'Rs 93,600', '72.1', 'Red', 'Payouts held, restitution arithmetic published')]
RH = 34
o.append('<rect x="40" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.4"/>'
         % (WY, W - 80, 54 + RH * len(rows), k.PANEL, C['risk']))
o.append(k.label(58, WY + 28, 'Worked path of an Option 1 circle under stress', 15, C['risk'], weight=600))
o.append(k.label(58, WY + 44, 'COVER SET AT 8 POTS, Rs 120,000, WHICH IS ONE DAY OF OUTFLOW', 10, k.INK3, mono=True))
colx = [58, 200, 560, 900, 1010, 1160]
for r, row in enumerate(rows):
    yy = WY + 54 + RH * r + 22
    if r == 0:
        o.append('<line x1="58" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="1"/>'
                 % (yy + 9, W - 58, yy + 9, k.RULE))
    bc = {'Green': '#1E6B48', 'Amber': '#B5651D', 'Red': '#9E3524'}.get(row[4], k.INK)
    for ci, cell in enumerate(row):
        col = k.INK3 if r == 0 else (bc if ci == 4 else k.INK)
        o.append(k.label(colx[ci], yy, cell, 11 if r == 0 else 13, col, mono=(r == 0),
                         weight=600 if (r > 0 and ci == 4) else None))

BR1 = ROW1_Y - 34
o.append(k.line('M%d %d H %d' % (CX[0], BR1, CX[4])))
for i in range(5):
    o.append(k.line('M%d %d V %d' % (CX[i], BR1, ROW1_Y)))

H = WY + 54 + RH * len(rows) + 60
k.build('halqa-map-hyper', W, H, '\n'.join(o), png_name='HALQA-MAP-HYPER',
        aria='Hyper committee map. Two configurations side by side, the three way split of each daily payment, '
             'the money path to three destinations, groups covering structure, fee, takaful cover, entry gates '
             'and daily operation, then the collapse threshold in four results, a five axis stress index, and a '
             'worked table of a circle moving from green through amber to red.')
