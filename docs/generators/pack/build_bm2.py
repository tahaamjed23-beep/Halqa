# -*- coding: utf-8 -*-
"""Business Model and Unit Costs, rebuilt from researched prices (25 September 2026).

Every price used is stated with its source in section 3. Every figure in the tables is
computed here; the key results are asserted and written to bm_figures.json for the
Hyper document, the maps and the deck."""
import json, os, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import docgen as D
from mcommon import rs, num, pct

OUT = os.path.join(D.HERE, 'out', 'partnership')

# ------------------------------------------------------------------ prices and their basis
FX = 290.0                      # Rs per US$ for dollar billed services: interbank Rs 277.60 on 25 Sep 2026, plus card spread and bank charges
WA_USD = 0.015                  # Meta, Pakistan, utility, authentication and service messages from 1 October 2026 (reported)
WA = WA_USD * FX                # Rs 4.35 per message
LIVENESS_USD = 0.015 + 0.001    # AWS Rekognition Face Liveness per check plus CompareFaces per image
NADRA = 50.0                    # planning figure per CNIC verification; NADRA does not publish institutional prices
TASDEEQ = 200.0                 # planning figure per report; consumer app charges Rs 199 for a score certificate
ANALYST_PER_MIN = 80000.0 / (22 * 8 * 60)   # Rs 80,000 a month analyst, per working minute
AGENT_MONTH = 60000.0           # support agent, fully loaded
CONTACTS_PER_AGENT = 40 * 22    # contacts handled a month
CONTACT = AGENT_MONTH / CONTACTS_PER_AGENT + 6 * WA + 10.0   # agent time, six WhatsApp service replies, tools
COMPUTE_MEMBER_MONTH = 2.0      # cloud usage per active member per month
PARTNER_RATE, PARTNER_CAP = 0.01, 10.0   # target terms: 1 per cent of the debit, capped at Rs 10
WORST_RATE = 0.015              # card style mandate, uncapped
TAKAFUL_RATE = 546.67 / 10000   # stress priced contribution, Takaful Cover Pricing Model (HQ-MF-05)
COMMISSION = 0.15
SALES_TAX = 0.15
LATER_SEAT_REWARDS = 0.10     # points and fee waivers to later seats, as a share of fee revenue (planning cap)
REFERRAL = 100.0              # points per new member to the member who referred them (planning)
HOST_REWARD = 250.0           # points to the host of a circle that completes cleanly (planning)
ACQUISITION = 250.0           # marketing spend per new member (planning)


def money(x):
    return '(%s)' % rs(-x) if x < 0 else rs(x)


def change(x):
    return '(%s)' % pct(-x, 0) if x < 0 else pct(x, 0)


def partner(debit, rate=PARTNER_RATE, cap=PARTNER_CAP):
    return min(debit * rate, cap) if cap else debit * rate


ONBOARD = {
    1: NADRA + LIVENESS_USD * FX + 2 * WA,                                            # known committees
}
STATEMENT_REVIEW = 6.0 + 0.30 * 10 * ANALYST_PER_MIN                                   # parse, plus manual review of 30 per cent
ADDRESS_CHECK = 0.20 * 5 * ANALYST_PER_MIN
ONBOARD[2] = ONBOARD[1] + TASDEEQ + STATEMENT_REVIEW + ADDRESS_CHECK                  # unknown committees
ONBOARD[3] = ONBOARD[2] + 0.05 * 1000.0                                                # Hyper: field check on 5 per cent

GRID = [(2500, (100, 100, 150)), (5000, (100, 150, 200)), (10000, (150, 300, 500)), (10 ** 9, (200, 400, 500))]


def grid_fee(instalment, members):
    col = 0 if members <= 6 else (1 if members <= 10 else 2)
    for top, fees in GRID:
        if instalment <= top:
            return fees[col]


# ------------------------------------------------------------------ the seven committee types
S = [
    dict(key='family', name='Family circle', kind='Known, monthly', n=6, c=5000.0, rounds=6, months_per_round=1.0, level=1,
         takaful=0.0, partner_share=0.6, p_fail=0.08, contact=1 / 25),
    dict(key='office', name='Office circle', kind='Known, monthly', n=12, c=10000.0, rounds=12, months_per_round=1.0, level=1,
         takaful=0.0, partner_share=0.6, p_fail=0.08, contact=1 / 25),
    dict(key='market', name='Market circle', kind='Known, weekly', n=10, c=2000.0, rounds=10, months_per_round=12 / 52, level=1,
         takaful=0.0, partner_share=0.6, p_fail=0.08, contact=1 / 30),
    dict(key='unknown', name='Unknown circle', kind='Unknown, monthly', n=12, c=10000.0, rounds=12, months_per_round=1.0, level=2,
         takaful=10000.0 * TAKAFUL_RATE, partner_share=1.0, p_fail=0.12, contact=1 / 15),
    dict(key='large', name='Large unknown circle', kind='Unknown, monthly', n=20, c=25000.0, rounds=20, months_per_round=1.0, level=2,
         takaful=25000.0 * TAKAFUL_RATE, partner_share=1.0, p_fail=0.12, contact=1 / 15),
    dict(key='hyper1', name='Hyper, Option 1', kind='Unknown, daily', n=400, c=300.0, rounds=50, months_per_round=1 / 30, level=3,
         takaful=75.0, fee=75.0, partner_share=1.0, p_fail=0.05, contact=1 / 40, collectors=8),
    dict(key='hyper2', name='Hyper, Option 2', kind='Unknown, daily', n=390, c=1000.0 / 3, rounds=26, months_per_round=30 / 26 / 30, level=3,
         takaful=250.0 / 3, fee=250.0 / 3, partner_share=1.0, p_fail=0.05, contact=1 / 40, collectors=15),
]


def run(s, partner_fn=partner, wa=WA):
    daily = s['key'].startswith('hyper')
    s = dict(s)
    s['fee'] = s.get('fee') or grid_fee(s['c'], s['n'])
    s['payments'] = s['n'] * s['rounds']
    s['debit'] = s['c'] + s['takaful'] + s['fee']
    s['fee_rev'] = s['payments'] * s['fee']
    s['tak_total'] = s['payments'] * s['takaful']
    s['commission'] = s['tak_total'] * COMMISSION
    if daily:
        msgs = 1 + s['p_fail'] * 2 + 2 * s['collectors'] / s['n']
    else:
        msgs = 1 + s['p_fail'] * 2 + 2 / s['n']
    s['msgs'] = msgs
    s['cost_msg'] = s['payments'] * msgs * wa
    s['cost_support'] = s['payments'] * s['contact'] * (CONTACT - 6 * WA + 6 * wa)
    s['cost_compute'] = s['payments'] * COMPUTE_MEMBER_MONTH * s['months_per_round']
    s['cost_rail'] = s['payments'] * s['partner_share'] * partner_fn(s['debit'])
    months = s['rounds'] * s['months_per_round']
    s['months'] = months
    s['cost_reverify'] = (s['n'] * STATEMENT_REVIEW * max(1.0, months / 3)) if s['level'] >= 2 else 0.0
    s['cost_onboard'] = s['n'] * ONBOARD[s['level']]
    s['cost_rewards'] = s['fee_rev'] * LATER_SEAT_REWARDS + (0.0 if daily else HOST_REWARD)
    s['cost_new'] = s['n'] * (REFERRAL + ACQUISITION)
    s['running'] = s['cost_msg'] + s['cost_support'] + s['cost_compute'] + s['cost_rail'] + s['cost_reverify'] + s['cost_rewards']
    s['revenue'] = s['fee_rev'] + s['commission']
    s['first'] = s['revenue'] - s['running'] - s['cost_onboard'] - s['cost_new']
    s['later'] = s['revenue'] - s['running']
    s['per_payment'] = (s['running'] - s['cost_rewards']) / s['payments']
    s['member_fees'] = s['rounds'] * s['fee']
    s['member_paid_in'] = s['rounds'] * s['c']
    s['member_takaful'] = s['rounds'] * s['takaful']
    s['per_member_month'] = (s['later'] - (s['cost_onboard'] + s['cost_new']) / 3) / (s['n'] * months)
    return s


R = [run(s) for s in S]
W = [run(s, partner_fn=lambda d: d * WORST_RATE) for s in S]
X = [run(s, wa=WA * 1.5) for s in S]
by = {r['key']: r for r in R}

# ------------------------------------------------------------------ assertions on the key results
assert abs(WA - 4.35) < 1e-9
assert grid_fee(10000, 12) == 500 and grid_fee(5000, 6) == 100 and grid_fee(2000, 10) == 100 and grid_fee(25000, 20) == 500
assert by['hyper1']['payments'] == 20000 and by['hyper2']['payments'] == 10140
assert round(by['hyper1']['fee_rev']) == 1500000 and round(by['hyper2']['fee_rev']) == 845000
assert round(by['hyper1']['commission']) == 225000 and round(by['hyper2']['commission']) == 126750
for r in R:
    assert r['running'] > 0 and r['per_payment'] > 0

# ------------------------------------------------------------------ fixed costs
FIXED = [
    ('Two software engineers, mid level', 2 * 250000.0, 'Rs 150,000 to 250,000 a month mid level (Glassdoor and salary surveys, 2026); upper end used'),
    ('Operations and compliance lead', 200000.0, 'Planning figure'),
    ('Counsel on retainer', 150000.0, 'Planning figure; counsel is needed for the opinions listed in the Legal Position'),
    ('Accountant and tax adviser', 60000.0, 'Planning figure; sales tax returns are monthly'),
    ('Statutory audit, Rs 300,000 a year', 25000.0, 'Planning figure'),
    ('Office, six desks in Islamabad', 6 * 25000.0, 'Coworking desks Rs 15,000 to 56,900 a month (Regus and local providers)'),
    ('Software subscriptions at launch', 350 * FX, 'Vercel Pro, Supabase Pro with compute and backup, Cloudflare, Sentry, Google Workspace, GitHub: about US$350'),
    ('Company secretarial and filings', 10000.0, 'Planning figure'),
]
fixed_sub = sum(v for _, v, _ in FIXED)
FIXED.append(('Contingency, 10 per cent', fixed_sub * 0.10, ''))
FIXED_TOTAL = fixed_sub * 1.10

FIXED_100K = [
    ('Eight software engineers', 8 * 250000.0), ('Compliance and risk, three people', 3 * 200000.0),
    ('Operations, four people', 4 * 150000.0), ('Counsel on retainer', 300000.0), ('Accounts and tax', 150000.0),
    ('Statutory audit, Rs 1.2 million a year', 100000.0), ('Office, thirty desks', 30 * 25000.0),
    ('Software subscriptions, about US$2,000', 2000 * FX), ('Filings and company costs', 20000.0)]
FIXED_100K_TOTAL = sum(v for _, v in FIXED_100K) * 1.10
MIX = [('family', 0.20), ('office', 0.30), ('market', 0.10), ('unknown', 0.20), ('large', 0.05), ('hyper1', 0.10), ('hyper2', 0.05)]
assert abs(sum(w for _, w in MIX) - 1) < 1e-9
blend = sum(by[k]['per_member_month'] * w for k, w in MIX)
BREAK_EVEN = FIXED_TOTAL / blend
SCALE = 100000
scale_contrib = SCALE * blend
scale_result = scale_contrib - FIXED_100K_TOTAL

json.dump({
    'wa_rs': WA, 'fx': FX, 'hyper1_per_payment': by['hyper1']['per_payment'], 'hyper2_per_payment': by['hyper2']['per_payment'],
    'hyper1_later': by['hyper1']['later'], 'hyper2_later': by['hyper2']['later'], 'hyper1_rail': by['hyper1']['cost_rail'],
    'hyper2_rail': by['hyper2']['cost_rail'], 'office_per_payment': by['office']['per_payment'], 'break_even': BREAK_EVEN,
    'fixed_total': FIXED_TOTAL, 'fixed_100k': FIXED_100K_TOTAL, 'blend': blend, 'scale_result': scale_result,
    'rows': {r['key']: {k: r[k] for k in ('fee', 'payments', 'revenue', 'running', 'first', 'later', 'per_payment', 'cost_rail', 'cost_msg')} for r in R},
}, open(os.path.join(D.HERE, 'bm_figures.json'), 'w'), indent=1)

# ------------------------------------------------------------------ figure: first circle result per payment, known monthly circles
import numpy as np
import charts3d
_office = [s for s in S if s['key'] == 'office'][0]
_ns = np.arange(4, 25, 1)
_cs = np.array([1000, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000, 12000, 15000, 20000, 25000, 30000], dtype=float)
_X, _Y = np.meshgrid(_ns, _cs)
_Z = np.zeros_like(_X, dtype=float)
for i in range(_X.shape[0]):
    for j in range(_X.shape[1]):
        _s = dict(_office)
        _s['n'] = int(_X[i, j]); _s['rounds'] = int(_X[i, j]); _s['c'] = float(_Y[i, j]); _s.pop('fee', None)
        _r = run(_s)
        _Z[i, j] = _r['first'] / _r['payments']
BM_FIG = charts3d.bm_first_circle(_X.astype(float), _Y, _Z)
assert _Z.min() < 0 < _Z.max()

# ------------------------------------------------------------------ document
def first_circle_line():
    losers = [r for r in R if r['first'] < 0]
    if not losers:
        return 'Every type pays for itself in its first circle, including onboarding and acquiring every member from nothing.'
    names = ', '.join('the %s, which loses %s' % (r['name'].lower(), rs(-r['first'])) for r in losers)
    return ('Every type except %s pays for itself in its first circle, including onboarding and acquiring every member from '
            'nothing. The exception recovers that cost in its second circle, when its members are no longer new.' % names)


b = []
b.append('<h2>1. How Halqa earns</h2>' + D.bullets([
    'A flat service fee on every instalment, paid by each member to Halqa. This is the main income.',
    'A commission of about 15 per cent from the takaful operator on the cover sold with unknown committees and Hyper.',
    'Later: a referral fee from the modaraba on asset committees, a dealer commission, and a distribution commission from '
    'the fund manager once savings open.',
    'Nothing else. Halqa holds no member money, so it earns no interest and no float, and it takes no share of any pot.',
]) + D.table([
    ['Source', 'Rate', 'Paid by', 'From'],
    ['Service fee', 'Rs 100 to Rs 500 per instalment; Rs 75 or Rs 83.33 a day on Hyper', 'The member', 'Launch'],
    ['Agency commission', 'About 15% of takaful contributions', 'Pak-Qatar General Takaful or Salaam Takaful', 'Agency agreement'],
    ['Asset committee referral', '2 to 4% of the asset price', 'Orix, First Habib, Allied Rental or First Punjab Modaraba', 'Asset committees'],
    ['Dealer commission', '1 to 3% of the asset price', 'The dealer', 'Asset committees'],
    ['Distribution commission', 'As agreed with the fund manager', 'Mahaana Wealth', 'Savings stage'],
], widths=['22%', '36%', '26%', '16%']))

grid_rows = [['Instalment', '2 to 6 members', '7 to 10 members', '11 or more']]
labels = ['Up to Rs 2,500', 'Rs 2,501 to 5,000', 'Rs 5,001 to 10,000', 'Above Rs 10,000']
for lab, (top, fees) in zip(labels, GRID):
    grid_rows.append([lab] + ['Rs %d' % f for f in fees])
b.append('<h2>2. The fee, stated plainly</h2>' + D.bullets([
    'Every member pays the fee on every instalment, including the instalment in the round in which they collect.',
    'The fee is the same for every seat. It does not change with how early or late a member collects, so it can never be '
    'read as a price for time.',
    'It is taken in the same payment as the instalment and split at source: the contribution goes to the collecting member, '
    'any takaful contribution to the operator, and the fee to Halqa.',
    'Sales tax on services in Islamabad, 15 per cent, is added on top. A Rs 500 fee costs the member Rs 575.',
    'On monthly and weekly circles the fee is set by the size of the instalment and the number of members:',
]) + D.table(grid_rows, numeric=(1, 2, 3)) + D.bullets([
    'Discounts: a guarantee cheque on file takes 80 per cent off the fee; a verified payslip and employer take 50 per cent '
    'off. Only the larger applies. An income account is compulsory on unknown committees and is not a discount.',
    'On Hyper the fee is part of the fixed daily payment: Rs 75 of the Rs 450 on Option 1 and Rs 83.33 of the Rs 500 on Option 2.',
    'The fee weighs most on small instalments: Rs 100 on a Rs 2,500 instalment is 4 per cent of it; Rs 500 on Rs 10,000 is 5 per '
    'cent; Rs 500 on Rs 25,000 is 2 per cent.',
]))

member_rows = [['Committee', 'Members and instalment', 'Paid in', 'Pot', 'Fees', 'Takaful', 'Fee share']]
for r in R:
    member_rows.append([r['name'], '%d at %s, %s' % (r['n'], rs(r['c'], 2) if r['c'] % 1 else rs(r['c']), r['kind'].split(', ')[1]),
                        rs(r['member_paid_in']), rs(r['member_paid_in']), rs(r['member_fees']),
                        rs(r['member_takaful']) if r['member_takaful'] else 'None', pct(r['member_fees'] / r['member_paid_in'], 1)])
b.append('<h3>What one member pays in each committee type</h3>' + D.table(member_rows, numeric=(2, 3, 4, 5, 6),
                                                                             widths=['17%', '25%', '13%', '13%', '11%', '11%', '10%'])
         + D.para('Fees are before sales tax, and the fee share is the fees as a share of the contributions paid in. A member always receives exactly what they pay in as contributions. The fee and the takaful contribution '
                  'are paid on top. On Hyper Option 1 a member pays Rs 22,500 over the cycle and receives Rs 15,000: Rs 3,750 '
                  'is takaful cover and Rs 3,750 is Halqa&rsquo;s fee.'))

b.append('<h2>3. Prices used, and where each comes from</h2>' + D.table([
    ['Item', 'Price used', 'Basis'],
    ['WhatsApp utility, authentication and service message', '%s (US$0.015)' % rs(WA, 2),
     'Rate for Pakistan from 1 October 2026, reported by TechX Pakistan on 16 September 2026; about 11 times the Indian rate. '
     'Marketing messages cost about Rs 13.20 (WeTarseel, February 2026). Meta&rsquo;s own rate card could not be opened from Pakistan on 25 September'],
    ['Reseller fee on WhatsApp', 'Rs 0', 'Halqa connects to Meta&rsquo;s Cloud API directly. A reseller would add Rs 1.00 to Rs 1.50 a message (SendPK price list)'],
    ['SMS, as an alternative', 'Not used', 'Rs 3.80 to Rs 4.80 an SMS (SendPK): no cheaper than WhatsApp. In app notifications cost nothing and carry receipts'],
    ['Exchange rate for dollar billed services', 'Rs 290 per US$', 'Interbank Rs 277.60 on 25 September 2026, plus card spread and bank charges'],
    ['Identity check with NADRA', 'Rs 50', 'NADRA does not publish institutional prices; Easypaisa charges users Rs 99 for a failed biometric check (Biometric Update, 19 September 2024). Planning figure'],
    ['Face liveness and match', '%s' % rs(LIVENESS_USD * FX, 2), 'AWS Rekognition: US$0.015 per liveness check and US$0.001 per face comparison'],
    ['TASDEEQ report', 'Rs 200', 'Not published; the TASDEEQ app charges consumers Rs 199 for a score certificate (user review, 8 July 2025). Planning figure until TASDEEQ quotes'],
    ['Payment partner charge', '1% of the debit, capped at Rs 10', 'Target terms. SadaPay lists all consumer bank transfers as free for July to December 2026; Raast merchant payments carry a 0% discount rate (Bank Alfalah). The partner&rsquo;s charge to Halqa is unpublished; section 7 tests 1.5% uncapped'],
    ['Support contact', rs(CONTACT, 2), 'An agent at Rs 60,000 a month fully loaded (Pakistan average Rs 44,559, Indeed; banking support about Rs 79,000, Karachi) handling 880 contacts a month, six WhatsApp replies per contact, and tools'],
    ['Cloud usage', 'Rs 2 per active member a month', 'Vercel Pro US$20 a seat with 1 TB transfer; Supabase Pro US$25 with compute from US$10 to US$110 and backup US$100; Cloudflare; Sentry'],
    ['Points and fee waivers to later seats', '10% of fee revenue', 'Planning cap on the reward schedule set by the time value engine; paid from Halqa&rsquo;s own revenue'],
    ['Host and referral rewards', 'Rs 250 a clean circle; Rs 100 a new member', 'Planning figures, paid in points'],
    ['Acquisition', 'Rs 250 a new member', 'Planning figure for marketing; to be replaced by measured cost once campaigns run'],
    ['Takaful contribution, unknown monthly', '5.47% of the instalment', 'Stress priced in the Takaful Cover Pricing Model (HQ-MF-05); passed to the operator in full'],
], widths=['24%', '17%', '59%']))

b.append('<h2>4. Cost of onboarding one member</h2>' + D.table([
    ['Item', 'Known committee', 'Unknown committee', 'Hyper'],
    ['NADRA check', rs(NADRA), rs(NADRA), rs(NADRA)],
    ['Face liveness and match', rs(LIVENESS_USD * FX, 2), rs(LIVENESS_USD * FX, 2), rs(LIVENESS_USD * FX, 2)],
    ['Two one time passcodes on WhatsApp', rs(2 * WA, 2), rs(2 * WA, 2), rs(2 * WA, 2)],
    ['TASDEEQ report', 'None', rs(TASDEEQ), rs(TASDEEQ)],
    ['Income account statement check', 'None', rs(STATEMENT_REVIEW, 2), rs(STATEMENT_REVIEW, 2)],
    ['Address check against a utility bill', 'None', rs(ADDRESS_CHECK, 2), rs(ADDRESS_CHECK, 2)],
    ['Field visit where a check fails', 'None', 'None', rs(50)],
    ['Total per new member', rs(ONBOARD[1], 2), rs(ONBOARD[2], 2), rs(ONBOARD[3], 2)],
], numeric=(1, 2, 3), widths=['40%', '20%', '20%', '20%']) + D.para(
    'The income account is checked again every 90 days on unknown committees and Hyper, at %s a check.' % rs(STATEMENT_REVIEW, 2)))

unit_rows = [['Cost per payment', 'Family', 'Office', 'Market', 'Unknown', 'Large unknown', 'Hyper 1', 'Hyper 2']]
for lab, key in [('WhatsApp messages', 'cost_msg'), ('Support', 'cost_support'), ('Cloud', 'cost_compute'), ('Payment partner', 'cost_rail'), ('Income recheck', 'cost_reverify')]:
    unit_rows.append([lab] + [rs(r[key] / r['payments'], 2) for r in R])
unit_rows.append(['Total running cost per payment'] + [rs(r['per_payment'], 2) for r in R])
unit_rows.append(['Messages per payment'] + [num(r['msgs'], 2) for r in R])
b.append('<h2>5. Running cost of one payment</h2>' + D.bullets([
    'One WhatsApp reminder before each due date; receipts and statements go inside the application, which costs nothing.',
    'Further messages only when a payment fails, and one each to the collecting member before and after their turn.',
    'On Hyper one message a day carries the whole position, so a daily payment costs little more than a monthly one to run.',
]) + D.table(unit_rows, numeric=(1, 2, 3, 4, 5, 6, 7), widths=['24%'] + ['10.8%'] * 7))

circ_rows = [['Per circle', 'Family', 'Office', 'Market', 'Unknown', 'Large unknown', 'Hyper 1', 'Hyper 2'],
             ['Members, instalment', '6, Rs 5,000', '12, Rs 10,000', '10, Rs 2,000', '12, Rs 10,000', '20, Rs 25,000', '400, Rs 300', '390, Rs 333.33'],
             ['Cadence and rounds', 'Monthly, 6', 'Monthly, 12', 'Weekly, 10', 'Monthly, 12', 'Monthly, 20', 'Daily, 50', 'Daily, 26'],
             ['Fee per instalment'] + [rs(r['fee'], 2) if r['fee'] % 1 else rs(r['fee']) for r in R],
             ['Payments'] + [num(r['payments']) for r in R],
             ['Fee revenue'] + [rs(r['fee_rev']) for r in R],
             ['Agency commission'] + [rs(r['commission']) if r['commission'] else 'None' for r in R],
             ['Running costs of payments'] + ['(%s)' % rs(r['running'] - r['cost_rewards']) for r in R],
             ['Points and waivers to later seats and host'] + ['(%s)' % rs(r['cost_rewards']) for r in R],
             ['Onboarding, all members new'] + ['(%s)' % rs(r['cost_onboard']) for r in R],
             ['Acquisition and referral, all members new'] + ['(%s)' % rs(r['cost_new']) for r in R],
             ['Contribution, first circle'] + [money(r['first']) for r in R],
             ['Contribution, later circles'] + [rs(r['later']) for r in R],
             ['Later contribution per member a month'] + [rs(r['later'] / (r['n'] * r['months']), 2) for r in R]]
b.append('<h2>6. Seven committee types, from a family circle to Hyper</h2>' + D.table(
    circ_rows, numeric=(1, 2, 3, 4, 5, 6, 7), widths=['24%'] + ['10.8%'] * 7) + D.bullets([
        first_circle_line(),
        'The family and market circles earn least, because the fee is Rs 100 and a small circle has few payments.',
        'Unknown circles cost more to run, mainly the TASDEEQ report and the auto debit on every payment, but the takaful '
        'commission more than pays for that.',
        'Hyper earns most per circle because it has hundreds of members paying every day.',
    ]))

sens_rows = [['Contribution, later circles', 'Family', 'Office', 'Market', 'Unknown', 'Large unknown', 'Hyper 1', 'Hyper 2'],
             ['At the prices in section 3'] + [rs(r['later']) for r in R],
             ['Partner charges 1.5% uncapped'] + [rs(w['later']) for w in W],
             ['Change'] + [change((w['later'] - r['later']) / r['later']) for r, w in zip(R, W)],
             ['WhatsApp 50% dearer'] + [rs(x['later']) for x in X],
             ['Change'] + [change((x['later'] - r['later']) / r['later']) for r, x in zip(R, X)]]
b.append('<h2>7. What moves the result</h2>' + D.table(sens_rows, numeric=(1, 2, 3, 4, 5, 6, 7), widths=['24%'] + ['10.8%'] * 7)
         + D.bullets([
             'The payment partner&rsquo;s charge matters most. A percentage charge grows with the instalment while the fee does '
             'not, so on unknown circles of Rs 10,000 and more it would take a large share of the fee. The partner must be '
             'asked for a charge per transaction.',
             'A 50 per cent rise in the WhatsApp price changes the result by only a few per cent, because receipts and statements '
             'stay inside the application.',
             'If sales tax is absorbed rather than added, Halqa keeps Rs 86.96 of every Rs 100 of fee.',
         ]))

fx_rows = [['Monthly fixed cost at launch', 'Amount', 'Basis']] + [[a, rs(v), c] for a, v, c in FIXED] + [['Total', rs(FIXED_TOTAL), '']]
b.append('<h2>8. Fixed costs and break even</h2>' + D.table(fx_rows, numeric=(1,), widths=['34%', '16%', '50%'])
         + D.para('Assume active members are spread across the seven types as follows: %s. Each active member then '
                  'contributes %s a month after running costs, rewards, and onboarding and acquisition spread over three '
                  'circles. The launch fixed costs are covered at about %s active members. The mix is an assumption, to be '
                  'replaced by the real mix once circles run.'
                  % ('; '.join('%s %s' % (by[k]['name'].lower(), pct(w, 0)) for k, w in MIX), rs(blend, 2), num(round(BREAK_EVEN, -2))))
         + D.table([['Monthly fixed cost at 100,000 active members', 'Amount']] + [[a, rs(v)] for a, v in FIXED_100K]
                   + [['Contingency, 10 per cent', rs(FIXED_100K_TOTAL / 1.1 * 0.1)], ['Total', rs(FIXED_100K_TOTAL)]],
                   numeric=(1,), widths=['70%', '30%'])
         + D.table([['At 100,000 active members, a month', 'Amount'],
                    ['Contribution after running costs, rewards, onboarding and acquisition', rs(scale_contrib)],
                    ['Fixed costs at that size', '(%s)' % rs(FIXED_100K_TOTAL)],
                    ['Operating result before income tax', rs(scale_result)]], numeric=(1,), widths=['70%', '30%'])
         + D.para('Income tax on company profit is 29 per cent. The support team is not in the fixed costs because every '
                  'support contact is already costed in the running cost of a payment.'))

b.append('<h2>9. Technical Process</h2>' + D.para(
    'Every running cost in this document arises from a specific action of the system. The table maps each action to the service '
    'it calls and the price used, so that each cost can be measured once the system runs.') + D.table([
    ['Event', 'System action', 'Service called', 'Cost used'],
    ['Account opened', 'CNIC checked; live face captured and matched; two one time passcodes sent', 'NADRA; AWS Rekognition; WhatsApp',
     rs(NADRA + LIVENESS_USD * FX + 2 * WA, 2)],
    ['Admission to an unknown committee', 'Credit report on the member&rsquo;s instruction; income statement read and scored; address checked',
     'TASDEEQ; statement parser with review by hand for 30 per cent', rs(ONBOARD[2] - ONBOARD[1], 2)],
    ['Each instalment due', 'Evening notice; debit instruction; outcome recorded; receipt in the application', 'WhatsApp; payment partner; cloud',
     'Rs 4.35 a message; partner charge; Rs 2 a member a month'],
    ['Each failed attempt', 'Reason sent; retry scheduled', 'WhatsApp; payment partner', 'Rs 4.35 a message and a further partner charge'],
    ['Each support contact', 'Ticket opened and answered', 'Support agent; WhatsApp service replies', rs(CONTACT, 2)],
    ['Every 90 days on unknown committees and Hyper', 'Income statement read again', 'Statement parser', rs(STATEMENT_REVIEW, 2)],
    ['Circle completes', 'Host and seat points issued; referral points made available', 'Points ledger', 'As section 3'],
], widths=['20%', '34%', '26%', '20%']) + D.para(
    'The figure shows the result of the first circle per payment on known monthly circles, where every member is new and '
    'onboarding and acquisition fall on that circle.') + D.figure(BM_FIG, 'First circle result per payment on a known monthly '
    'circle, by the number of members and the instalment, after running costs, rewards, onboarding and acquisition. Green: above '
    'Rs 50 a payment. Amber: Rs 0 to 50. Red: a loss in the first circle, recovered in the second.', '92%'))

b.append('<h2>10. Points to confirm before launch</h2>' + D.bullets([
    'The payment partner&rsquo;s charge per debit, and whether one debit can be split three ways at source.',
    'NADRA&rsquo;s price through the Nishan Pakistan onboarding portal, and TASDEEQ&rsquo;s price per report to a subscriber.',
    'The WhatsApp rate on Meta&rsquo;s own rate card for Pakistan from 1 October 2026.',
    'The takaful operator&rsquo;s contribution rate and commission, which replace the planning figures in section 3.',
    'Whether the fee is IT enabled services for Islamabad sales tax, confirmed by a tax adviser.',
]))
b.append(D.summary(
    'Halqa earns a fixed fee on every instalment, from Rs 100 to Rs 500 on monthly and weekly committees and Rs 75 a day on '
    'Hyper, plus a commission from the takaful company. Each payment costs about Rs %s to Rs %s to run, mostly one WhatsApp '
    'message, support and the payment partner&rsquo;s charge. Every committee type makes money over its life, and all but the '
    'smallest make money from their first circle. With '
    'about Rs %s million a month of fixed costs, Halqa covers its costs at about %s active members. The one number that could '
    'change this is the payment partner&rsquo;s charge, so it must be a small fixed amount per payment, not a percentage.'
    % (num(min(r['per_payment'] for r in R), 0), num(max(r['per_payment'] for r in R), 0), num(FIXED_TOTAL / 1e6, 2),
       num(round(BREAK_EVEN, -2)))))

D.render(os.path.join(OUT, 'Business Model and Unit Costs.pdf'), 'Business Model and Unit Costs',
         'How Halqa earns, what each payment costs to run, and the result for seven committee types, from a family circle to Hyper.',
         'HQ-CP-03', 'Mr Akif Saeed and prospective partners', ''.join(b), version='2.0', running='Business Model and Unit Costs')
print('pages', D.pdf_pages(os.path.join(OUT, 'Business Model and Unit Costs.pdf')))
print('WA', WA, 'contact', round(CONTACT, 2), 'onboard', {k: round(v, 2) for k, v in ONBOARD.items()})
for r, w, x in zip(R, W, X):
    print('%-22s fee %7.2f pay %6d rev %11.0f run %10.0f onb %9.0f first %11.0f later %11.0f perpay %6.2f msgs %.2f | worst %11.0f wa+50 %11.0f pmm %.2f'
          % (r['name'], r['fee'], r['payments'], r['revenue'], r['running'], r['cost_onboard'], r['first'], r['later'], r['per_payment'], r['msgs'], w['later'], x['later'], r['per_member_month']))
print('fixed', round(FIXED_TOTAL), 'blend', round(blend, 2), 'break even', round(BREAK_EVEN), 'scale result', round(scale_result))
