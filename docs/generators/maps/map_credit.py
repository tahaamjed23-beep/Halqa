import mapkit as k

W = 2400
C = {'inputs': '#1E4E8C', 'score': '#6B3FA0', 'bands': '#1F6F6B',
     'bureau': '#7A5C10', 'duty': '#9A7616', 'out': '#1E6B48', 'harm': '#9E3524'}
FAMS = [(C['inputs'], 'Inputs'), (C['score'], 'Score'), (C['bands'], 'Bands and seats'),
        (C['bureau'], 'Bureau'), (C['duty'], 'Statutory duties'),
        (C['out'], 'Outcomes'), (C['harm'], 'Damage and repair')]

o = [k.head('Halqa credit map',
            'How standing is built, what it is allowed to decide, and what the bureau relationship permits in each direction.',
            W, FAMS)]

# --- flow -----------------------------------------------------------------
FY, FH, FW = 174, 96, 400
FX = [40, 500, 960, 1420, 1880]
FLOW = [
    ('Behaviour', ['payments, completions', 'and defaults']),
    ('Internal score', ['built inside Halqa', 'from the member record']),
    ('Band', ['one of four', 'nothing else is derived']),
    ('Seats offered', ['which positions may', 'be claimed at join']),
    ('Record written', ['standing updated', 'on completion or default']),
]
for i, (t, lines) in enumerate(FLOW):
    o.append(k.box(FX[i], FY, FW, FH, t, lines, col=C['score'] if i in (1, 2) else k.INK,
                   strong=(i == 2)))
    if i < 4:
        o.append(k.arrow('M%d %d H %d' % (FX[i] + FW, FY + FH // 2, FX[i + 1] - 6), width=1.8))
        o.append(k.numbered(FX[i] + FW + 30, FY + FH // 2 - 34, i + 1))

# bureau feed into the band
BUY, BUH = 330, 92
o.append(k.box(560, BUY, 760, BUH, 'Licensed credit bureau',
               ['TASDEEQ, with DataCheck as the alternate', 'report released only on the member instruction'],
               col=C['bureau']))
o.append(k.arrow('M940 %d V %d' % (BUY, FY + FH + 6), col=C['bureau'], width=1.7, marker='mg'))
o.append(k.label(560, BUY - 16, 'The report contributes to the band and to nothing else', 12, C['bureau']))
o.append(k.arrow('M1260 %d V %d' % (FY + FH + 6, BUY - 6), col=C['bureau'], width=1.3, dashed=True, marker='mg'))
o.append(k.label(1340, BUY + 40, 'Repayment history returns to the bureau', 12, k.INK2))
o.append(k.label(1340, BUY + 58, 'once the Federal Government notifies non institution furnishers', 12, k.INK2))

COLS = [40, 620, 1200, 1780]
CW, CX = 540, [x + 270 for x in COLS]
ROW1_Y = 500

ROW1 = [
    ('inputs', 'Inputs', 'what the score is built from', [
        'Every instalment paid, and the day it was paid',
        'Every instalment missed, and for how long',
        'Circles completed without incident',
        'Circles exited, and the reason recorded',
        'Position held in each circle',
        'Tenure on the platform',
        'Identity verification level reached',
        'Income declared, and whether it was verified',
        'Exposure held across all circles at once',
        'Bureau report where the member has instructed one',
        'Nothing is read from a device beyond the application',
    ]),
    ('score', 'Score', 'how the figure is produced and shown', [
        'Built inside Halqa from the member record',
        'Expressed as a single figure with a plain explanation',
        'Movement is shown with the reason for each change',
        'History is visible to the member in full',
        'A simulator shows the effect of a future action',
        'Bureau scores arrive on a narrower external scale',
        'The two are held separately and not merged into one figure',
        'No score is shared with another member without authority',
    ]),
    ('bands', 'Bands and seats', 'the only decision the score makes', [
        'Four bands, from lowest to highest standing',
        'Lowest band: the final seats only, and no position listing',
        'Middle band: the second half of the order',
        'Upper bands: any seat the liability gate permits',
        'The band gates which seats appear, never the order chosen',
        'Members without history are treated as the lowest band',
        'Two clean circles and verification raise the band',
        'The forward liability gate is applied after the band',
        'Reasons are shown for every seat that is unavailable',
    ]),
    ('bureau', 'Bureau', 'what each direction requires', [
        'Reading requires an instruction from the member to the bureau',
        'The instruction is taken on a screen of its own',
        'It is stored with hash, address and time',
        'A subscriber agreement carries the commercial terms',
        'Halqa is a user of the report and not a credit institution',
        'The State Bank register is closed to non banks',
        'Writing requires membership as a furnisher',
        'Membership for a non institution awaits a government notification',
        'Two way reporting is the intended position, not the present one',
    ]),
]
hs = []
for i, (fam, t, s, items) in enumerate(ROW1):
    body, h = k.cluster(COLS[i], ROW1_Y, CW, C[fam], t, s, items)
    o.append(body); hs.append(h)

ROW2_Y = ROW1_Y + max(hs) + 60
ROW2 = [
    ('duty', 'Statutory duties', 'owed by any user of a bureau report', [
        'Where a report restricts a seat, the member receives the report',
        'The bureau name, address and telephone number are supplied',
        'A copy of the statutory summary of rights is supplied',
        'A statement that the bureau did not make the decision is supplied',
        'Disclosure of report content to others is limited by statute',
        'Member visible scores inside a circle are reviewed against that limit',
        'Disputes are referred to the bureau correction process',
        'A disputed entry is marked while the dispute is open',
        'The duty attaches on the first score based restriction',
    ]),
    ('out', 'Outcomes', 'what standing is worth to the member', [
        'Access to earlier seats in future circles',
        'Access to larger circles and larger instalments',
        'Lower assessed burden where income has been verified',
        'Eligibility for the hyper product at the highest bands',
        'Eligibility to host a circle',
        'Points and fee waivers earned on clean completion',
        'A record that can be presented outside Halqa once writing begins',
        'Credit standing built by a member who has no borrowing history',
    ]),
    ('harm', 'Damage and repair', 'what a default costs, and how it is undone', [
        'Late payment reduces standing by step: twenty, forty, sixty',
        'Default after collecting the pot reduces it by two hundred',
        'An open default locks creation and joining',
        'A recorded default follows the member across circles',
        'Contact leads to a hardship statement and a waived fine',
        'Meeting the revised date restores part of the reduction',
        'Clean circles after a default rebuild standing over time',
        'Written off amounts remain on the record',
        'Nothing is recorded during the grace window',
    ]),
    ('inputs', 'What the score never does', 'the limits placed on it by design', [
        'It does not set the collection order once a circle has begun',
        'It does not price the seat fee',
        'It does not produce a rate of any kind',
        'It does not authorise contacting anyone other than the member',
        'It does not draw on device contacts, messages or screens',
        'It does not use location beyond a single declared address',
        'It is not sold, and no member level data is sold',
        'It is not merged with the bureau figure into one number',
    ]),
]
hs2 = []
for i, (fam, t, s, items) in enumerate(ROW2):
    body, h = k.cluster(COLS[i], ROW2_Y, CW, C[fam], t, s, items)
    o.append(body); hs2.append(h)

BR1 = ROW1_Y - 34
o.append(k.line('M%d %d H %d' % (CX[0], BR1, CX[3])))
for i in range(4):
    o.append(k.line('M%d %d V %d' % (CX[i], BR1, ROW1_Y)))
o.append(k.label(CX[0] + 18, BR1 - 12, 'How standing is built', 11, k.INK3, mono=True))

BR2 = ROW2_Y - 34
o.append(k.line('M%d %d H %d' % (CX[0], BR2, CX[3])))
for i in range(4):
    o.append(k.line('M%d %d V %d' % (CX[i], BR2, ROW2_Y)))
o.append(k.label(CX[0] + 18, BR2 - 12, 'What it is worth, what it costs, and what it may not do', 11, k.INK3, mono=True))

H = ROW2_Y + max(hs2) + 60
k.build('halqa-map-credit', W, H, '\n'.join(o), png_name='HALQA-MAP-CREDIT-BUREAU',
        aria='Halqa credit map. A path from behaviour to an internal score, to a band, to the seats offered and '
             'the record written, with the bureau feeding the band on the member instruction, and groups covering '
             'inputs, score, bands, bureau, statutory duties, outcomes, damage and repair, and the limits on the score.')
