# -*- coding: utf-8 -*-
"""25 September, late: maps aligned with Auto Debit, Asset Committees and Seat Exchange and Points."""
import io, os, shutil, sys
sys.stdout.reconfigure(encoding='utf-8')
HERE = os.path.dirname(os.path.abspath(__file__))

EDITS = {
    'map_rewards.py': [
        ("        ('Spent on', 'fees, and goods with a commerce partner'),", "        ('Spent on', 'fees, and vouchers Halqa buys'),"),
        ("        ('Expire', 'at a stated period, disclosed on issue'),", "        ('Expire', '24 months after becoming available'),"),
        ("         ('Points spent', ['against fees, or with', 'a commerce partner']),", "         ('Points spent', ['against fees, or for', 'vouchers Halqa buys']),"),
        ("""        'Waiting: issued to every seat in the later half of a circle',
        'Graded by how late the seat is, largest on the final seat',
        'Paying on time: issued at the close of each clean round',
        'Completing a circle without incident',
        'Completing a circle as host, where it completes cleanly',
        'Referring a member who completes a circle',
        'Rewarded on value carried, never on recruitment depth',
        'Verifying income, once, at the point of verification',
        'Verifying an income account, once',
        'Restoring standing after a cured default',""",
         """        'Last third of seats: 20 per cent of the fees paid',
        'Middle third of seats: 10 per cent of the fees paid',
        'First third of seats: none',
        'Hosting a circle that completes with no default: 250',
        'Referring a member who completes a first circle: 100',
        'Moving later in a seat exchange: 250 to 2,000 by seats moved',
        'With a fee waiver on as many instalments as seats moved',
        'Pending when earned, available once the condition is met',
        'Rewarded on value carried, never on recruitment depth',"""),
        ("        'Settled when redeemed against a fee or with a partner',", "        'Settled when redeemed against a fee or for a voucher',"),
        ("        'Expiry period stated at issue and shown on the balance',", "        'Expiry 24 months after availability, with 30 days notice',"),
        ("        'Reconciled monthly against the partner statement',", "        'Reconciled monthly against voucher purchases',"),
        ("""        'Against goods with a commerce partner',
        'Redeemed as a voucher or a direct order discount',
        'Rate of exchange published before redemption',""",
         """        'For a retail voucher that Halqa buys with its own money',
        'The retailer never accepts a point',
        'One point is one rupee off a Halqa fee',"""),
        ("        'Unused points on exit are settled against what is owed',", "        'Never used to pay a contribution or a takaful part',"),
        ("    ('partner', 'Commerce partners', 'candidates, none contracted', [", "    ('partner', 'Voucher retailers', 'candidates, none contracted', ["),
        ("        'Halqa buys value from the partner at a negotiated discount',", "        'Halqa buys vouchers from the retailer at a negotiated discount',"),
        ("""        'Replaces the early fee that members once paid each other',
        'The old early fee cost members and earned Halqa nothing',
        'The reward costs Halqa and earns member retention',""",
         """        'Seat exchange: waivers and points less the Rs 500 exchange fee',
        'Exchange cost capped at 10 per cent of a circle\\u2019s fees',
        'The reward costs Halqa and earns member retention',"""),
        ("        'Points already earned are not clawed back',\n        'Points stop accruing while a default is open',",
         "        'Pending points are cancelled on default',\n        'Available points are frozen until the default is cleared',"),
        ("FAMS = [(C['earn'], 'How points are earned'), (C['issue'], 'Issue and accounting'),\n        (C['spend'], 'How points are spent'), (C['partner'], 'Commerce partners'),",
         "FAMS = [(C['earn'], 'How points are earned'), (C['issue'], 'Issue and accounting'),\n        (C['spend'], 'How points are spent'), (C['partner'], 'Voucher retailers'),"),
        ("             'earned, issued and accounted, how they are spent, the commerce partners, what the programme costs, '",
         "             'earned, issued and accounted, how they are spent, the voucher retailers, what the programme costs, '"),
    ],
    'map_system.py': [
        ("        'Time value engine sizes the points owed to later seats',", "        'Points to later seats: 20 per cent of fees in the last third, 10 in the middle',"),
        ("        'Turn swap between two members at no price',", "        'Seat exchange: nothing passes between members; Rs 500 fee to Halqa',"),
        ("        'Host approval required on any swap',", "        'Host approval required on any exchange',"),
        ("        'Points redeemable with a commerce partner: Daraz, foodpanda, Careem',", "        'Points for vouchers Halqa buys: Daraz, foodpanda, Careem, none contracted',"),
    ],
    'map_hyper.py': [
        ("        'Points redeemable with a commerce partner',", "        'Points redeemable against fees or for vouchers Halqa buys',"),
        ("        'Collection by token mandate, since a daily prompt is impractical',", "        'Auto debit from the member\\u2019s wallet at the partner, one a day',"),
    ],
    'map_business.py': [
        ("        'Points redemption candidates: Daraz, foodpanda, Careem',", "        'Voucher retailers under consideration: Daraz, foodpanda, Careem',"),
    ],
    'map_tech.py': [
        ("        'Tier 2: token mandate held by the partner, about 1.5 per cent',", "        'Tier 2: auto debit from the member\\u2019s wallet at the partner',"),
        ("        'Token held by the partner, Halqa stores an opaque reference only',", "        'Mandate held by the partner, Halqa stores its reference only',"),
        ("        'Per mandate amount cap and frequency cap set at creation',", "        'Amount cap, schedule and permitted payees set at creation',"),
    ],
    'map_money.py': [
        ("        'Tier 2: token mandate held by the partner, about 1.5 per cent',", "        'Tier 2: auto debit from the member\\u2019s wallet at the partner',"),
    ],
}

bakdir = os.path.join(HERE, 'bak0924')
for f, pairs in EDITS.items():
    p = os.path.join(HERE, f)
    b = os.path.join(bakdir, f.replace('.py', '.before-0925b.py'))
    if not os.path.exists(b):
        shutil.copy(p, b)
    t = io.open(p, encoding='utf-8').read()
    for a, n in pairs:
        a = a.encode().decode('unicode_escape').encode('latin-1').decode('utf-8') if '\\u' in a else a
        n = n.replace('\\u2019', '’')
        if t.count(a) != 1:
            if t.count(n) == 1:
                continue
            raise SystemExit('%s: %d matches for %r' % (f, t.count(a), a[:90]))
        t = t.replace(a, n)
    io.open(p, 'w', encoding='utf-8').write(t)
    print('patched', f)
