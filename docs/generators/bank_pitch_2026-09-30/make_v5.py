# -*- coding: utf-8 -*-
"""Assemble bank_deck_v5.py from the version 4 generator: text changes, the version 5 overrides, the new order."""
import io, re
base = io.open('bank_deck_build.py', encoding='utf-8').read()
over = io.open('v5_overrides.py', encoding='utf-8').read()
R = [
    # appendix headings
    ("""    sl = new_slide('Hyper Daily Committee', 'Experimental: a daily circle for daily earners, in two designs')""",
     """    sl = new_slide('Hyper Daily Committee (Experimental)', appx('A1', 'a daily circle for daily earners, in two '
                                                                     'designs'))"""),
    ("""    sl = new_slide('Payment Collection', 'Three collection methods, with Mashreq’s direct debit mandate as the '
                                         'automatic method' if MQ_ else 'Three collection methods; the automatic '
                                                                        'method is a new standing instruction on '
                                                                        'Raqami’s open API')""",
     """    sl = new_slide('Payment Collection', appx('A2', 'three collection methods; the automatic method is a new %s '
                                                    'from %s' % (B['mandate'], BN)))"""),
    ("""             '%s’s %s on the member’s %s account%s; or a saved card or wallet charged through the PSP.'
             % (BN, B['mandate'], BN, '' if MQ_ else ', built on its open API'),""",
     """             'A %s on the member’s %s account, a new line for %s; or a saved card or wallet charged through the '
             'PSP.' % (B['mandate'], BN, BN),"""),
    ("""    sl = new_slide('Wallets and PSP Integration', 'How money in a wallet, a card or another bank reaches the '
                                                  'committee account at %s' % BN)""",
     """    sl = new_slide('Wallets and PSP Integration', appx('A3', 'how money in a wallet, a card or another bank '
                                                             'reaches the committee account at %s' % BN))"""),
    ("""    sl = new_slide('Recovery', 'Steps after a member stops paying having already collected the pot')""",
     """    sl = new_slide('Recovery', appx('A4', 'steps after a member stops paying having already collected the pot'))"""),
    ("""    sl = new_slide('Points and Rewards', 'Profit on committee balances and on-time payments, returned to members as '
                                         'points')""",
     """    sl = new_slide('Points and Rewards', appx('A5', 'profit on committee balances and on-time payments, returned '
                                                    'to members as points'))"""),
    ("""    sl = new_slide('Regulation and Compliance', 'Regulation through %s’s licence, with Halqa as its service '
                                                'provider' % BN)""",
     """    sl = new_slide('Regulation and Compliance', appx('A6', 'regulation through %s’s licence, with Halqa as its '
                                                           'service provider' % BN))"""),
    # points: published or indicative 10 per cent
    ("""    rate = 'up to 5% a year' if MQ_ else 'an illustrative 5% a year'""", """    rate = '10% a year'"""),
    ("""             ('5% a year', 'the account’s top rate' if MQ_ else 'illustrative rate', 0),
             ('Rs 115', 'profit a month', 0), ('Rs 1,380', 'over 12 months', 0), ('115 points', 'to each member', 1)]""",
     """             ('10% a year', 'Islamic Savings Account' if MQ_ else '7 day Mudarabah Certificate', 0),
             ('Rs 230', 'profit a month', 0), ('Rs 2,760', 'over 12 months', 0), ('230 points', 'to each member', 1)]"""),
    ("""                ('Raqami does not publish its profit rates, so the rate above is illustrative; members receive '
                 'the profit actually earned.', dict(size=11, color=INK))]""",
     """                ('Raqami published 10% for its 7 day Mudarabah Certificate in August 2026; members receive the '
                 'profit actually earned.', dict(size=11, color=INK))]"""),
    ("""                 % (BN, ' (Islamic Current Profit Account, up to 5%)' if MQ_ else ' not published; rate illustrative')])""",
     """                 % (BN, ' (Islamic Savings Account, 10% indicative below Rs 1.5 million)' if MQ_ else
                    ' (Historical Profit Rates, August 2026)')])"""),
    ("""120,000 for about seven days a month; at %s that earns about Rs 115 a month, about Rs 1,380 over the '
            'circle, or about 115 points per member. It is a reward, not a return.%s'""",
     """120,000 for about seven days a month; at %s that earns about Rs 230 a month, about Rs 2,760 over the '
            'circle, or about 230 points per member. It is a reward, not a return.%s'"""),
    # regulation: Shariah Board and data location
    ("""    sb = 'Shariah Board' if not MQ_ else 'Shariah board of the Islamic window'""",
     """    sb = 'Raqami’s Shariah Board' if not MQ_ else 'Mashreq’s Shariah Board'"""),
    ("""('approves the Islamic structure', dict(size=9.5,""", """('certifies each Islamic product', dict(size=9.5,"""),
    ("""            ('Data', 'Customer data protection', 'Results only; no face images, card numbers or passwords')]""",
     """            ('Data', 'Customer data protection; outsourcing data controls', 'Results only; hosted in Singapore today, '
                                                                         'moved where %s and the State Bank require'
             % BN),
            ('AML and KYC', 'Anti-Money Laundering Act 2010; State Bank AML regulations',
             'Customer due diligence and screening by %s when the account opens' % BN),
            ('Consumer protection', 'State Bank fair treatment of consumers rules',
             'Full cost shown before signing; 24 hours to withdraw; complaints in the app'),
            ('Continuity', 'Outsourcing framework: contingency and exit plans', 'Money stays at %s; daily backups; '
                                                                               'records exportable to %s' % (BN, BN))]"""),
    ("""    rh = 0.66
    for i, row in enumerate(rows):""", """    rh = 0.465
    for i, row in enumerate(rows):"""),
    ("""            ('On-time payments', 'never more than half of Halqa’s own fee on that instalment'),""",
     """            ('On-time payments', 'at most half of Halqa’s fee on that instalment'),"""),
    ("""'committee system. The deck covers: what a committee is and how many people use one; the problems with '""",
     """'committee system. Slides 1 to 20 are the main story; the appendix, A1 to A6, holds the detail. The main '
            'story covers: what a committee is and how many people use one; the problems with '"""),
    ("""    bx, by, bw, bh = PM, 1.72, 4.7, 4.95""", """    bx, by, bw, bh = PM, 1.72, 4.25, 4.95"""),
    ("""    x0 = 5.75
    cws = [1.75, 2.55, RX - x0 - 1.75 - 2.55]""", """    x0 = 5.2
    cws = [1.7, 2.45, RX - x0 - 1.7 - 2.45]"""),
    # status: Hyper labelled experimental
    ("""'settings, activity, credit report, Hyper',""", """'settings, activity, credit report, Hyper (experimental)',"""),
    # structure subheading
    ("""    sl = new_slide('Proposed Structure', 'Halqa runs the committee system; %s holds and moves the money' % BN)""",
     """    sl = new_slide('Proposed Structure', 'Halqa runs the committee system; %s holds and moves the money under '
                                         'State Bank regulation' % BN)"""),
    # summary: wallets and PSP; meeting plan in the notes
    ("""            ('Proposal', 'Halqa runs committees in its application. Every member holds a %s account; %s collects '
                         'each instalment and pays each pot.' % (BN, BN)),""",
     """            ('Proposal', 'Halqa runs committees in its application. Every member holds a %s account; %s collects '
                         'each instalment and pays each pot. Wallets and cards connect through a licensed PSP.'
             % (BN, BN)),"""),
    ("""    say(sl, 'The whole proposal on one page.\\n\\nBackground:""",
     """    say(sl, 'Meeting plan: about twenty minutes for slides 1 to 20, then questions; the appendix, A1 to A6, holds '
            'the detail on Hyper, payment collection, wallets and the PSP, recovery, points and regulation.\\n\\nThe '
            'whole proposal on one page.\\n\\nBackground:"""),
]
for a, b in R:
    n = base.count(a)
    assert n == 1, (n, a[:90])
    base = base.replace(a, b)
marker = '# ===================================================================== build\n'
assert base.count(marker) == 1
head, tail = base.split(marker)
tail = re.sub(r"for f in \(s_cover,.*?\):\n    f\(\)", """for f in (s_cover, s_summary, s_committee, s_market, s_problems, s_structure, s_cycle, s_app_join, s_app_use,
          s_growth, s_credit, s_products, s_onboarding, s_types, s_prevention, s_revenue, s_comparison, s_evidence,
          s_timing, s_status, s_hyper, s_collection, s_psp, s_recovery, s_points, s_regulation):
    f()""", tail, flags=re.S)
assert 's_app_join' in tail
out = head + over + '\n\n' + marker + tail
out = out.replace('Mashreq version 4 and Raqami version 2, 30 September 2026.',
                  'Mashreq version 5 and Raqami version 3, 30 September 2026.', 1)
io.open('bank_deck_v5.py', 'w', encoding='utf-8', newline='\n').write(out)
print('written bank_deck_v5.py', out.count('\n'), 'lines')
