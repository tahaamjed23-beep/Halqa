# -*- coding: utf-8 -*-
"""Layout and wording fixes after the first render (29 Sep 2026)."""
import io, sys
p = 'pitch_build.py'
s = io.open(p, encoding='utf-8').read()
R = []

# 5 problem: fraud panel reads as a count of committees; softer grey for cash at home
R.append(("""              ([(100, RED)], None, 'Rs 420 m', RED, 'lost in one 2022 fraud run through Facebook, over 100 committees '
                                                   '[2]'),
              ([(63, INK2)], None, '63%', INK2, 'of savers keep their savings as cash at home [1]'),""",
          """              ([(100, RED)], None, '100+', RED, 'committees run by one organiser who defaulted on about Rs 420 '
                                                'million in 2022 [2]'),
              ([(63, GREY)], None, '63%', INK2, 'of savers keep their savings as cash at home [1]'),"""))

# 7 accounts: quote block tightened, labelled as the bank's own words
R.append(("""    qx = 9.0
    vrule(sl, qx - 0.25, 2.2, 3.7, RULE, 0.75)
    tb(sl, qx, 2.15, RX - qx, 2.5, '“%s”' % B['quote'][0], size=17, color=INK, font=DISPLAY, spacing=1.08)
    tb(sl, qx, 4.75, RX - qx, 0.6, B['quote'][1], size=11, color=GREY, spacing=1.03)""",
          """    qx = 9.0
    vrule(sl, qx - 0.25, 2.25, 3.2, RULE, 0.75)
    tb(sl, qx, 2.3, RX - qx, 0.35, 'In %s’s own words' % BN, size=12, bold=True, color=BC)
    tb(sl, qx, 2.7, RX - qx, 1.9, '“%s”' % B['quote'][0], size=17, color=INK, font=DISPLAY, spacing=1.08)
    tb(sl, qx, 4.62, RX - qx, 0.6, B['quote'][1], size=11, color=GREY, spacing=1.03)"""))

# 9 lending: no bare "Nil"
R.append(("""        lend_fig=('Nil', 'advances on Mashreq’s balance sheet at 30 June 2026: the lending book is still to be built'),""",
          """        lend_fig=('A first loan book', 'Mashreq reported no advances at 30 June 2026; committee histories are '
                                       'the data to start lending safely'),"""))
R.append(("""        lend_fig=('Rs 27.6 m', 'Islamic financing at 30 June 2026, with supply chain, auto and fleet financing '
                               'planned'),""",
          """        lend_fig=('Rs 27.6 m', 'of Islamic financing at 30 June 2026; supply chain, auto and fleet financing '
                               'come next'),"""))
R.append(("""    fx = [PM, PM + PW / 2 + 0.25]
    rule(sl, PM, 3.35, PW, RULE, 0.75)
    fig(sl, fx[0], 3.6, PW / 2 - 0.4, '+168 points',""",
          """    fx = [PM, PM + PW / 2 + 0.25]
    rule(sl, PM, 3.55, PW, RULE, 0.75)
    fig(sl, fx[0], 3.95, PW / 2 - 0.4, '+168 points',"""))
R.append(("""    vrule(sl, fx[1] - 0.25, 3.6, 2.5, RULE, 0.75)
    fig(sl, fx[1], 3.6, PW / 2 - 0.3, B['lend_fig'][0], B['lend_fig'][1] + ' [2]', nsize=34, lsize=14, color=BC,
        lh=1.2)""",
          """    vrule(sl, fx[1] - 0.25, 3.95, 2.3, RULE, 0.75)
    fig(sl, fx[1], 3.95, PW / 2 - 0.3, B['lend_fig'][0], B['lend_fig'][1] + ' [2]', nsize=34, lsize=14, color=BC,
        lh=1.2)"""))
R.append(("""    x0, y0, cw_ = PM, 2.0, 0.44
    tb(sl, x0, 1.72, 5.4, 0.28, 'One member, one circle: twelve instalments', size=12.5, bold=True, color=INK)""",
          """    x0, y0, cw_ = PM, 2.25, 0.44
    tb(sl, x0, 1.95, 5.4, 0.28, 'One member, one circle: twelve instalments', size=12.5, bold=True, color=INK)"""))

# 12 onboarding: signup caption wider
R.append(("""    bd9 = ['phone, passcode and PIN', acct,""", """    bd9 = ['phone and PIN', acct,"""))

# 14 risk: drop the stray axis word
R.append(("""    tb(sl, cx0, base + 0.3, 12 * pitch, 0.25, 'turn', size=10.5, color=GREY, align=CEN)
""", ""))

# 15 prevention: shorter stage text; one label per run of days
R.append(("""    stages = [('Before joining', 'identity, income and affordability checks; the host admits each member'),
              ('At joining', 'full cost shown; 24 hours to withdraw; signed undertaking and mutual guarantee'),
              ('Each instalment', 'reminder the evening before; debit on payday; retries each morning'),
              ('A missed payment', 'arrears come out of the member’s own pot before they collect')]""",
          """    stages = [('Before joining', 'four checks; the host admits each member'),
              ('At joining', 'full cost shown; 24 hours to withdraw; signed guarantee'),
              ('Each instalment', 'debit on payday; retries each morning'),
              ('A missed payment', 'arrears taken from the member’s own pot')]"""))
R.append(("""    labs = {1: ('payday: first debit', LIME), 2: ('retry', LIME_MID), 3: ('retry', LIME_MID), 4: ('retry', LIME_MID),
            5: ('retry', LIME_MID), 8: ('due date', BC), 9: ('late fee 2%', RED), 11: ('5%, then 10%', RED)}""",
          """    labs = {1: ('payday: first debit', LIME), 2: ('retries each morning, five attempts at most', LIME_MID),
            3: (None, LIME_MID), 4: (None, LIME_MID), 5: (None, LIME_MID), 8: ('due date', BC),
            9: ('late charges rise: 2%, then 5%, then 10%', RED)}"""))
R.append(("""    for d, (t, col) in labs.items():
        x = PM + (d - 1) * dw
        tb(sl, x, cy + 0.7, dw * (2.2 if d in (1, 11) else 1.1), 0.5, t, size=11.5, color=INK2, spacing=1.0)""",
          """    spans = {1: 1, 2: 4, 8: 1, 9: 4}
    for d, (t, col) in labs.items():
        if not t:
            continue
        x = PM + (d - 1) * dw
        tb(sl, x + 0.04, cy + 0.7, dw * spans[d] - 0.08, 0.5, t, size=11.5, color=INK2, spacing=1.0)"""))
R.append(("""    tb(sl, PM, 5.55, PW, 0.7, [[('Late ', dict(size=13.5, bold=True, color=RED)),
                                ('%s of the instalment, with score falls of 10, 20 and 40 points. '
                                 'Five debit attempts at most, never more.' % B['penalty'].replace('late fees of ', '')
                                 .replace('late charges of ', ''), dict(size=13.5))]], spacing=1.04)""",
          """    tb(sl, PM, 5.65, PW, 0.7, [[('Late charges ', dict(size=13.5, bold=True, color=RED)),
                                ('%s of the instalment, with score falls of 10, 20 and 40 points.'
                                 % B['penalty'].replace('late fees of ', '').replace('late charges of ', ''),
                                 dict(size=13.5))]], spacing=1.04)"""))

# 17 money: chart labels clear of the lines; paragraph moved to the notes
R.append(("""    tb(sl, X(be) - 1.35, Y(1.32) - 0.62, 1.3, 0.5, '2,572 members', size=12, bold=True, color=L700, align=R,
       anchor=BOTTOM)
    tb(sl, X(3500), Y(1.32) + 0.05, 2.0, 0.28, 'fixed cost Rs 1.32 m a month', size=11, color=INK2)
    tb(sl, X(3700), Y(2.3) - 0.35, 1.9, 0.5, 'contribution, Rs 513 a member a month', size=11, color=L700,
       spacing=1.0)""",
          """    tb(sl, X(be) - 1.5, Y(1.32) - 0.42, 1.4, 0.3, '2,572 members', size=12.5, bold=True, color=L700, align=R)
    tb(sl, X(3300), Y(1.32) + 0.06, 2.2, 0.28, 'fixed cost, Rs 1.32 m a month', size=11, color=INK2)
    tb(sl, X(300), Y(2.9) - 0.05, 2.6, 0.5, 'Rs 513 a member a month, after running costs', size=11, color=L700,
       spacing=1.0)"""))
R.append(("""    tb(sl, x0, 5.6, RX - x0, 0.9, 'Running one payment costs Rs 13 to 35. Revenue lines: the fee share and a share '
                                  'of balance income now; financing referrals and a marketplace after the pilot.',
       size=12.5, spacing=1.04)
""", ""))

# 18 teams: drop the question column; the team name carries it
R.append(("""    widths = [1.9, 3.5, 5.6, 0.95]""", """    widths = [2.1, 0.0001, 8.6, 0.95]"""))
R.append(("""    for j, h_ in enumerate(['Team', 'Their question', 'The answer', 'Slide']):""",
          """    for j, h_ in enumerate(['Team', '', 'The answer', 'Slide']):"""))
R.append(("""        tb(sl, xs[1] + 0.04, yy, ws[1] - 0.12, rh, q, size=13, color=INK2, anchor=MIDDLE, spacing=1.03)
""", ""))
R.append(("""        tb(sl, xs[2] + 0.04, yy, ws[2] - 0.12, rh, a, size=13.5, color=INK, anchor=MIDDLE, spacing=1.03)""",
          """        tb(sl, xs[2] + 0.04, yy, ws[2] - 0.12, rh, a, size=15, color=INK, anchor=MIDDLE, spacing=1.03)"""))

# 19 comparison: source for Oraan's sign ups
R.append(("""    sources(sl, ['Oraan terms and fee calculator, 28 Sep 2026', 'JazzCash app 5.6.7 release note, Aug 2026; JazzCash '
                 'results to 31 March 2026: 60 million registered customers'])""",
          """    sources(sl, ['Oraan terms, fee calculator and website, 28 Sep 2026', 'JazzCash app 5.6.7 release note, Aug '
                 '2026; JazzCash results to 31 March 2026: 60 million registered customers'])"""))

# 21 why now: one line of sources
R.append(("""    srcs = ['State Bank of Pakistan payment systems reviews, FY25 and Q3 FY26', 'JazzCash release notes and results',
            'National Financial Inclusion Strategy 2024 to 2028']""",
          """    srcs = ['SBP payment systems reviews, FY25 and Q3 FY26', 'JazzCash release notes and results',
            'SBP National Financial Inclusion Strategy 2024 to 2028']"""))

# 22 regulation: boxes sized to their content
R.append(("""    bx, by, bw, bh = PM, 1.9, 6.4, 4.45""", """    bx, by, bw, bh = PM, 1.95, 6.4, 3.75 if BANK == 'mashreq' else 4.4"""))
R.append(("""    tb(sl, x0, 4.2, RX - x0, 0.6, 'State Bank of Pakistan, aims of the Licensing and Regulatory Framework for '
                                  'Digital Banks, 2022', size=11, color=GREY, spacing=1.03)
    rule(sl, x0, 5.0, RX - x0)
    tb(sl, x0, 5.12, RX - x0, 1.2,""",
          """    tb(sl, x0, 3.55, RX - x0, 0.6, 'State Bank of Pakistan, aims of the Licensing and Regulatory Framework for '
                                   'Digital Banks, 2022', size=11, color=GREY, spacing=1.03)
    rule(sl, x0, 4.35, RX - x0)
    tb(sl, x0, 4.5, RX - x0, 1.2,"""))

# 25 requests: use the height
R.append(("""        y = 2.0 + row_ * 1.4""", """        y = 2.15 + row_ * 1.5"""))

# notes: women share stated precisely
R.append(("""committee members, most of them women, are exactly that '
            'group.'""", """committee members, more of them women than men, are exactly that '
            'group.'"""))
R.append(("""Committee members, most of them '
            'women and many unbanked, are that group.'""", """Committee members, more of them '
            'women than men and many without a bank account, are that group.'"""))

bad = 0
for a, b in R:
    c = s.count(a)
    if c != 1:
        print('MISS', c, repr(a[:90]))
        bad += 1
        continue
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8').write(s)
print('applied', len(R) - bad, 'of', len(R))
