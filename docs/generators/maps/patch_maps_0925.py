# -*- coding: utf-8 -*-
"""25 September: business map rebuilt from the new Business Model; Hyper and system maps corrected."""
import io, json, os, shutil, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))
BM = json.load(open(os.path.join(HERE, '..', 'pack', 'bm_figures.json')))
R = BM['rows']


def rs(x):
    return 'Rs {:,.0f}'.format(x)


def m(x):
    return ('(Rs {:,.0f})'.format(-x)) if x < 0 else 'Rs {:,.0f}'.format(x)


lo = '{:,.0f}'.format(min(r['per_payment'] for r in R.values()))
hi = '{:,.0f}'.format(max(r['per_payment'] for r in R.values()))
be = '{:,.0f}'.format(round(BM['break_even'], -2))

p = os.path.join(HERE, 'map_business.py')
bak = os.path.join(HERE, 'bak0924', 'map_business.before-bm2.py')
if not os.path.exists(bak):
    shutil.copy(p, bak)
s = io.open(bak, encoding='utf-8').read()


def rep(a, b):
    global s
    assert s.count(a) == 1, a[:80]
    s = s.replace(a, b)


rep("W, FAMS, rev='Rev 3', date='24 September 2026')]", "W, FAMS, rev='Rev 4', date='25 September 2026')]")
rep("'Where the revenue comes from, what it costs to carry a committee, and how both behave at scale.',",
    "'Where the revenue comes from, what each payment costs to run, and the result for seven committee types.',")
i, j = s.index('KF = ['), s.index('KW = (W - 80 - 4 * 18) // 5')
s = s[:i] + ("KF = [('Rs %s to %s', 'running cost per payment', 'Hyper to unknown committees'),\n"
             "      ('Rs 4.35', 'per WhatsApp message', 'US$0.015 from 1 October 2026'),\n"
             "      ('Rs %s m', 'fixed costs a month at launch', 'team, counsel, office, software'),\n"
             "      ('%s', 'active members to break even', 'at the assumed mix of types'),\n"
             "      ('Rs 6,400', 'national average instalment', 'falls in the third fee band')]\n"
             % (lo, hi, '{:,.2f}'.format(BM['fixed_total'] / 1e6), be)) + s[j:]
names = [('family', 'Family circle, 6 at Rs 5,000'), ('office', 'Office circle, 12 at Rs 10,000'),
         ('market', 'Market circle, 10 at Rs 2,000 weekly'), ('unknown', 'Unknown circle, 12 at Rs 10,000'),
         ('large', 'Large unknown, 20 at Rs 25,000'), ('hyper1', 'Hyper Option 1, 400 at Rs 450 daily'),
         ('hyper2', 'Hyper Option 2, 390 at Rs 500 daily')]
lines = '\n'.join("         ('%s', '%s first, %s later')," % (n, m(R[k]['first']), m(R[k]['later'])) for k, n in names)
i, j = s.index('# cost of one committee ----'), s.index('COLS = [40, 550, 1060, 1570, 2080]')
s = s[:i] + '''# seven committee types ------------------------------------------------------
TX, TW = 1280, 1200
lines = [('Committee type', 'contribution per circle, first and later'),
%s
         ('Running cost per payment', 'Rs %s to Rs %s'),
         ('Break even at launch', 'about %s active members')]
TH = 52 + 30 * len(lines) + 12
o.append('<rect x="%%d" y="%%d" width="%%d" height="%%d" fill="%%s" stroke="%%s" stroke-width="1.4"/>'
         %% (TX, GY, TW, TH, k.PANEL, C['cost']))
o.append(k.label(TX + 18, GY + 28, 'Seven committee types', 15, C['cost'], weight=600))
o.append(k.label(TX + 18, GY + 44, 'FEE AND COMMISSION LESS RUNNING COSTS AND REWARDS', 10, k.INK3, mono=True))
for i, (a, b) in enumerate(lines):
    yy = GY + 52 + 30 * i + 20
    strong = i == 0 or a.startswith('Break')
    o.append(k.label(TX + 18, yy, a, 12.5, k.INK, weight=600 if strong else None))
    o.append(k.label(TX + TW - 18, yy, b, 12.5, k.INK if strong else k.INK2, anchor='end',
                     weight=600 if strong else None))

''' % (lines, lo, hi, be) + s[j:]
rep("        'Agency commission from the takaful operator, at 15 per cent',\n", "        'Agency commission from the takaful operator, about 15 per cent',\n")
rep("""        'Messaging on the business platform, per send',
        'Identity verification, per member, one time',
        'Support, priced per contact rather than per member',
        'Compute, storage and bandwidth, per member per year',
        'Bureau enquiry, per member per circle',
        'Default loss, where recovery fails',
        'Payment rail: the partner’s charge, borne by Halqa unless passed on',
        'Fixed platform cost, independent of volume',""",
    """        'WhatsApp: Rs 4.35 a message, about one per payment',
        'Identity: Rs 63 known, Rs 300 unknown, Rs 350 Hyper, once',
        'Support: Rs 104 a contact, one per 15 to 40 payments',
        'Cloud: about Rs 2 per active member a month',
        'Payment partner: target 1 per cent, capped at Rs 10',
        'Points and waivers to later seats: 10 per cent of fees',
        'Acquisition Rs 250 and referral Rs 100 per new member',
        'Default loss falls on the takaful fund, not on Halqa',""")
rep("""        'Cost per payment: Rs 12.60',
        'Break even fee: Rs 100 per instalment',
        'National average instalment: Rs 6,400',
        'That average falls in the third fee band',
        'Twelve member committee, one year: Rs 1,815 to carry',
        'Contribution margin rises with instalment size',
        'Larger rosters cost more to service and are priced higher',
        'Currency assumption: Rs 280 to the dollar',""",
    """        'Cost per payment, known monthly: about Rs 16 to Rs 19',
        'Cost per payment, unknown monthly: about Rs 35',
        'Cost per payment, Hyper: about Rs 13 to Rs 14',
        'Each active member: about Rs %s a month after costs',
        'Every type covers its running costs from its first circle',
        'Dollar billed services at Rs 290 to the dollar',
        'Sales tax of 15 per cent added to the fee in Islamabad',""" % '{:,.0f}'.format(BM['blend']))
rep("""        'Bare platform, pre launch: Rs 14,000 per month',
        'Proper platform with recovery and monitoring: Rs 58,000',
        '100,000 members: Rs 1,304,000 per month',
        'Of which platform and usage: Rs 614,000',
        'Of which people: Rs 690,000',
        'Cost per member at that size: Rs 13',
        '10,000,000 members: Rs 110,000,000 per month',
        'Cost per member at that size: Rs 11',""",
    """        'Fixed costs at launch: Rs %s a month',
        'Break even: about %s active members',
        'Fixed costs at 100,000 members: Rs %s a month',
        'Contribution at 100,000 members: Rs %s a month',
        'Operating result before tax: Rs %s a month',
        'Assumes the mix of types in the Business Model',""" % ('{:,.0f}'.format(BM['fixed_total']), be, '{:,.0f}'.format(BM['fixed_100k']),
                                                            '{:,.0f}'.format(BM['blend'] * 100000), '{:,.0f}'.format(BM['scale_result'])))
rep("    ('scale', 'Scale', 'monthly cost at 3 sizes', [", "    ('scale', 'Scale', 'fixed costs and break even', [")
rep("        'Salary account linked: mandatory on a stranger roster',\n", "        'Income account: mandatory on unknown committees, not a discount',\n")
rep("""        'Rail Rs 135,000, payment cost Rs 252,000',
        'Net Rs 1,338,000 per cycle',""", """        'Running costs %s, later seat rewards Rs 150,000',
        'Net %s a cycle, returning members',""" % (rs(R['hyper1']['running'] - 150000), rs(R['hyper1']['later'])))
rep("""        'Rail Rs 76,050, payment cost Rs 127,764',
        'Net Rs 767,936 per cycle',""", """        'Running costs %s, later seat rewards Rs 84,500',
        'Net %s a cycle, returning members',""" % (rs(R['hyper2']['running'] - 84500), rs(R['hyper2']['later'])))
rep("    ('later', 'Hyper on route C', 'per cycle, at 50 per cent cover', [", "    ('later', 'Hyper', 'per cycle, cover sized for 50 per cent', [")
rep("        'Leasing origination on asset committees',\n", "        'Asset committee referral from the modaraba, 2 to 4 per cent',\n")
rep("        'Twenty one digitisation attempts studied, four work',\n", "        '25 attempts studied across nine markets; four models work',\n")
i, j = s.index("    ('scale', 'Rail cost at 1.5 per cent',"), s.index("    ('part', 'Launch timeline',")
s = s[:i] + """    ('scale', 'The partner’s charge', 'per payment, not a percentage', [
        'Target: 1 per cent of the debit, capped at Rs 10',
        'Hyper Option 1: Rs 4.50 at target, Rs 6.75 at 1.5 per cent',
        'Unknown, Rs 10,000: Rs 10 at target, Rs 165.70 at 1.5 per cent',
        'Unknown, Rs 25,000: Rs 10 at target, Rs 403 at 1.5 per cent',
        'At 1.5 per cent a large unknown circle earns 63 per cent less',
        'The fee is flat, so a percentage takes a rising share of it',
        'Also ask whether the charge can pass to the payer',
    ]),
""" + s[j:]
rep("        'Provincial sales tax: 3 to 5 days',\n", "        'Islamabad sales tax on services: 3 to 5 days',\n")
rep("        'Corporate insurance agent registration: 4 to 8 weeks',\n", "        'Takaful agency agreement: 4 to 8 weeks',\n")
rep("        'Takaful candidates: Pak-Qatar Family Takaful, Salaam Takaful',\n",
    "        'Takaful candidates: Pak-Qatar General Takaful, Salaam Takaful',\n        'Modaraba candidates: Orix, First Habib, Allied Rental, First Punjab',\n")
rep("        aria='Halqa business model map. A fee grid, the cost of running one committee for a year, and groups '",
    "        aria='Halqa business model map. A fee grid, the result for seven committee types, and groups '")
io.open(p, 'w', encoding='utf-8').write(s)

for f, pairs in {'map_system.py': [("'Summary suit on a liquidated demand as a last step'", "'Civil suit on the undertaking; summary suit only on a cheque'")],
                 'map_hyper.py': [("'Net with commission, after rail and cost: Rs 1,346,000 and Rs 771,992'", "'Net per cycle, returning members: Rs 1,320,855 and Rs 746,218'"),
                                  ("'Rail at 1.5 per cent: Rs 135,000 and Rs 76,050 per cycle'", "'Partner charge at 1 per cent: Rs 90,000 and Rs 50,700 per cycle'")]}.items():
    q = os.path.join(HERE, f)
    t = io.open(q, encoding='utf-8').read()
    for a, b in pairs:
        if t.count(a) == 1:
            t = t.replace(a, b)
        else:
            assert t.count(b) == 1, (f, a)
    io.open(q, 'w', encoding='utf-8').write(t)
print('ok')
