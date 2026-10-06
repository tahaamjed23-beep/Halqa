# -*- coding: utf-8 -*-
"""Fourth set: points worked example as a calculation chain; Raqami collection subheading."""
import io
p = 'bank_deck_build.py'
s = io.open(p, encoding='utf-8').read()
R = []
R.append(("""    y0 = 1.72
    ew, eh = 3.3, 0.72
    tb(sl, PM, y0 - 0.05, ew, 0.28, 'Earn', size=11, bold=True, color=MUTED)
    for i, (t, d) in enumerate(earn):
        ebox(sl, PM, y0 + 0.28 + i * (eh + 0.18), ew, eh, t, d, 'halqa' if i != 3 else 'bank', tsize=11.5, bsize=10,
             align=L, pad=0.14)
    n_e = len(earn)
    e_bot = y0 + 0.28 + n_e * (eh + 0.18) - 0.18""", """    y0 = 1.72
    ew, eh, eg = 3.3, 0.62, 0.14
    tb(sl, PM, y0 - 0.05, ew, 0.28, 'Earn', size=11, bold=True, color=MUTED)
    for i, (t, d) in enumerate(earn):
        ebox(sl, PM, y0 + 0.28 + i * (eh + eg), ew, eh, t, d, 'halqa' if i != 3 else 'bank', tsize=11.5, bsize=10,
             align=L, pad=0.14)
    n_e = len(earn)
    e_bot = y0 + 0.28 + n_e * (eh + eg) - eg"""))
R.append(("""    for i in range(n_e):
        yy = y0 + 0.28 + i * (eh + 0.18) + eh / 2
        arrow(sl, PM + ew + 0.05, yy, cx0 - 0.05, yy, 'flow')""", """    for i in range(n_e):
        yy = y0 + 0.28 + i * (eh + eg) + eh / 2
        arrow(sl, PM + ew + 0.05, yy, cx0 - 0.05, yy, 'flow')"""))
R.append(("""    for i, (t, d) in enumerate(spend):
        yy = y0 + 0.28 + i * (eh + 0.18)""", """    for i, (t, d) in enumerate(spend):
        yy = y0 + 0.28 + i * (eh + eg)"""))
R.append(("""    by = max(e_bot, y0 + 0.28 + 3 * (eh + 0.18)) + 0.25
    bw2 = (PW - 0.45) / 2.0 if MQ_ else PW
    panel(sl, PM, by, bw2, 6.75 - by, FAINT)
    rate = 'up to 5% a year' if MQ_ else 'an illustrative 5% a year'
    tb(sl, PM + 0.2, by + 0.12, bw2 - 0.4, 0.3, 'Worked example', size=12, bold=True, color=INK)
    tb(sl, PM + 0.2, by + 0.45, bw2 - 0.4, 6.75 - by - 0.5,
       'A circle of 12 at Rs 10,000 holds Rs 120,000 for about 7 days each month. At %s that earns about Rs 115 a '
       'month, about Rs 1,380 over the circle: about 115 points for each member at the end.' % rate, size=11,
       color=INK, spacing=1.05)
    if MQ_:
        tx = PM + bw2 + 0.45
        panel(sl, tx, by, bw2, 6.75 - by, TH_XLT)
        tb(sl, tx + 0.2, by + 0.12, bw2 - 0.4, 0.3, 'Turn exchange between members', size=12, bold=True, color=INK)
        tb(sl, tx + 0.2, by + 0.45, bw2 - 0.4, 6.75 - by - 0.5, 'Members may exchange turns: the price is capped at '
                                                                'the value of the pot, the buyer’s score must qualify '
                                                                'for the earlier turn, and the host approves. A fee '
                                                                'is charged on each exchange.', size=11, color=INK,
           spacing=1.05)""", """    rate = 'up to 5% a year' if MQ_ else 'an illustrative 5% a year'
    by = max(e_bot, y0 + 0.28 + 3 * (eh + eg) - eg) + 0.3
    xtitle(sl, PM, by, PW, 'Worked example: profit on one circle of 12 at Rs 10,000', 'per month and per circle')
    items = [('Rs 120,000', 'held each month', 0), ('7 of 365 days', 'payday to the 8th', 0),
             ('5% a year', 'the account’s top rate' if MQ_ else 'illustrative rate', 0),
             ('Rs 115', 'profit a month', 0), ('Rs 1,380', 'over 12 months', 0), ('115 points', 'to each member', 1)]
    ops = [u'×', u'×', '=', '>', '>']
    opw = 0.42
    n_c = len(items)
    bwc = (PW - (n_c - 1) * opw) / n_c
    cy = by + 0.36
    for i, (num, lb, hi) in enumerate(items):
        x = PM + i * (bwc + opw)
        rect(sl, x, cy, bwc, 0.74, TH_XLT if hi else FAINT, line=TH if hi else LINE_, lw=1.0,
             paras=[(num, dict(size=14.5, bold=True, color=INK, align=CEN)),
                    (lb, dict(size=10, color=SLATE, align=CEN, before=2))], pad=0.05, anchor=MIDDLE, spacing=1.0)
        if i < n_c - 1:
            if ops[i] == '>':
                arrow(sl, x + bwc + 0.07, cy + 0.37, x + bwc + opw - 0.07, cy + 0.37, 'flow')
            else:
                tb(sl, x + bwc, cy + 0.15, opw, 0.44, ops[i], size=18, bold=True, color=SLATE, align=CEN,
                   anchor=MIDDLE)
    ny = cy + 0.95
    if MQ_:
        note = [('Turn exchange:  ', dict(size=11, bold=True, color=INK)),
                ('members may exchange turns; the price is capped at the value of the pot, the buyer’s score must '
                 'qualify for the earlier turn, the host approves, and a fee is charged on each exchange.',
                 dict(size=11, color=INK))]
    else:
        note = [('Profit rates:  ', dict(size=11, bold=True, color=INK)),
                ('Raqami does not publish its profit rates, so the rate above is illustrative; members receive '
                 'the profit actually earned.', dict(size=11, color=INK))]
    rect(sl, PM, ny, PW, 6.75 - ny, FAINT, paras=[note], pad=0.18, anchor=MIDDLE, spacing=1.04)"""))
R.append(("""    sl = new_slide('Payment Collection', 'Three collection methods, with %s’s %s as the automatic method'
                   % (BN, B['mandate']))""", """    sl = new_slide('Payment Collection', 'Three collection methods, with Mashreq’s direct debit mandate as the '
                                         'automatic method' if MQ_ else 'Three collection methods; the automatic '
                                                                        'method is a new standing instruction on '
                                                                        'Raqami’s open API')"""))
for a, b in R:
    n = s.count(a)
    assert n == 1, (n, a[:80])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched', len(R))
