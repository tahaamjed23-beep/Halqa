# -*- coding: utf-8 -*-
"""Layout fixes from the first review of the rebuilt decks (30 September 2026)."""
import io
p = 'bank_deck_build.py'
s = io.open(p, encoding='utf-8').read()
R = []
# legend: outlined swatches
R.append(("""        else:
            rect(sl, cx, y + 0.04, 0.17, 0.17, kind)
            cx += 0.25""", """        elif isinstance(kind, tuple) and len(kind) == 2:
            rect(sl, cx, y + 0.03, 0.22, 0.19, kind[0], line=kind[1], lw=1.0)
            cx += 0.3
        else:
            rect(sl, cx, y + 0.04, 0.17, 0.17, kind)
            cx += 0.25"""))
# S3 chart and labels
R.append(("""    ch = chart(sl, XL_CHART_TYPE.LINE_MARKERS, cx0 - 0.1, 1.95, RX - cx0 + 0.15, 3.35,""",
          """    ch = chart(sl, XL_CHART_TYPE.LINE_MARKERS, cx0 - 0.1, 1.95, RX - cx0 + 0.15, 3.2,"""))
R.append(("""               val_fmt='#,##0', line_w=2.25)
    for s_, col in zip(ch.plots[0].series, [TH, BLUE]):""", """               val_fmt='#,##0', line_w=2.25)
    ch.value_axis.major_unit = 60
    for s_, col in zip(ch.plots[0].series, [TH, BLUE]):"""))
R.append(("""    lab(sl, cx0 + 0.75, 2.52, 3.2, 'Turn 1: takes the pot first, repays over the year', size=10, color=SLATE,
        align=L)
    lab(sl, cx0 + 2.4, 4.52, 3.4, 'Turn 12: saves every month, takes the pot last', size=10, color=SLATE,
        align=L)""", """    tb(sl, cx0, 5.16, RX - cx0, 0.5, 'Turn 1 takes Rs 120,000 at once and repays it over the year. Turn 12 saves '
                                       'every month and takes the pot last. Both end the year at zero.', size=10.5,
       color=SLATE, spacing=1.03)"""))
R.append(("""        stat(sl, cx0 + i * fw, 5.55, fw - 0.2, n_, t, nsize=19, tsize=11)""",
          """        stat(sl, cx0 + i * fw, 5.78, fw - 0.2, n_, t, nsize=18, tsize=10.5)"""))
# S4 sources
R.append(("""    sources(sl, ['Karandaaz and Oraan estimates, Dawn, 12 Dec 2022', 'PICG case study on Oraan, 2024',
                 'Financial Inclusion Insights data, in Mehmood et al. 2018', 'Financial Inclusion Insights, '
                 'Pakistan, 2013', 'Financial Inclusion Insights, wave 5, 2017'])""",
          """    sources(sl, ['Karandaaz and Oraan estimates, Dawn, 12 Dec 2022', 'PICG case study on Oraan, 2024',
                 'Financial Inclusion Insights (FII) data in Mehmood et al. 2018', 'FII Pakistan, 2013',
                 'FII wave 5, 2017'])"""))
# S6 structure
R.append(("""    ebox(sl, PM, 3.6, 1.9, 0.95, 'Members', 'each with a %s account' % BN, 'member')""",
          """    ebox(sl, PM, 3.6, 1.75, 0.95, 'Members', 'each with a %s account' % BN, 'member')"""))
R.append(("""    arrow(sl, 2.5, 3.83, bx, 3.83, 'money')
    lab(sl, 2.3, 3.53, 1.0, 'instalments', size=9.5, color=SLATE)
    arrow(sl, bx, 4.3, 2.5, 4.3, 'money')
    lab(sl, 2.3, 4.34, 1.0, 'pots', size=9.5, color=SLATE)""", """    arrow(sl, 2.35, 3.83, bx, 3.83, 'money')
    lab(sl, 2.35, 3.53, 0.85, 'instalments', size=9.5, color=SLATE)
    arrow(sl, bx, 4.3, 2.35, 4.3, 'money')
    lab(sl, 2.35, 4.34, 0.85, 'pots', size=9.5, color=SLATE)"""))
R.append(("""    arrow_path(sl, [(7.57, 6.0), (7.57, 6.45), (1.55, 6.45), (1.55, 4.55)], 'money')
    lab(sl, 1.7, 6.47, 4.2, 'claims paid to the members left short', size=9.5, color=SLATE, align=L)""",
          """    arrow_path(sl, [(7.57, 6.0), (7.57, 6.4), (1.475, 6.4), (1.475, 4.55)], 'money')
    tb(sl, 1.6, 5.82, 1.5, 0.5, 'claims paid to members left short', size=9.5, color=SLATE, spacing=1.0)"""))
R.append(("""    arrow_path(sl, [(1.55, 3.6), (1.55, 2.17), (hx, 2.17)], 'instr')""",
          """    arrow_path(sl, [(1.475, 3.6), (1.475, 2.17), (hx, 2.17)], 'instr')"""))
R.append(("""    legend(sl, rx0, 6.18, [('money', 'money')], size=10)
    legend(sl, rx0 + 1.45, 6.18, [('instr', 'instruction')], size=10)
    legend(sl, rx0, 6.47, [('data', 'confirmation or record')], size=10)""",
          """    legend(sl, PM, 6.6, [('money', 'money'), ('instr', 'instruction'), ('data', 'confirmation or record')])"""))
# S7 labels
R.append(("""    steps = [('m', 'h', 'instr', 'joins the circle; consents to the %s' % B['mandate']),
             ('h', 'b', 'instr', 'registers the %s' % B['mandate']),
             ('h', 'm', 'instr', 'reminder on WhatsApp, the evening before payday'),
             ('h', 'b', 'instr', 'payday: collect Rs 10,000 from each member'),""",
          """    steps = [('m', 'h', 'instr', 'joins; consents to the %s' % ('mandate' if MQ_ else 'instruction')),
             ('h', 'b', 'instr', 'registers the %s' % ('mandate' if MQ_ else 'instruction')),
             ('h', 'm', 'instr', 'reminder, the evening before payday'),
             ('h', 'b', 'instr', 'payday: collect the instalments'),"""))
# S9 box text
R.append(("""    boxes = [('Credit record', 'reported to TASDEEQ from launch day', 'inst'),""",
          """    boxes = [('Credit record', 'reported to TASDEEQ from day one', 'inst'),"""))
# S10 products: separate new-lines track and outlined legend
R.append(("""    yb = 4.72
    path(sl, [(xs[branch], yl + 0.13), (xs[branch], 2.95)], TEAL, 2.5, dash=True)
    path(sl, [(xs[branch], 3.77), (xs[branch], yb), (RX - 0.1, yb)], TEAL, 2.5, dash=True)
    tb(sl, PM, yb - 0.4, max(xs[branch] - PM - 0.15, 1.4), 0.32, 'New lines', size=12.5, bold=True, color=TEAL_DK,
       align=R if xs[branch] - PM > 1.6 else L)""", """    yb = 4.72
    tb(sl, PM, yb - 0.17, 1.5, 0.34, 'New lines', size=13, bold=True, color=INK)
    path(sl, [(PM + 1.55, yb), (RX - 0.1, yb)], TEAL, 2.5, dash=True)"""))
R.append(("""    legend(sl, PM, 6.5, [(TH_XLT, 'existing %s product' % BN), (TEAL_XLT, 'new line')])""",
          """    legend(sl, PM, 6.5, [((TH_XLT, TH), 'existing %s product' % BN), ((TEAL_XLT, TEAL), 'new line')])"""))
# S12 onboarding: sign up body inside the box
R.append(("""    for i in range(6):
        ebox(sl, bx9[i], by9[i], bw9, bh9, bl9[i], None, kd9[i], tsize=12)""",
          """    bd9 = ['phone and PIN', None, None, None, None, None]
    for i in range(6):
        ebox(sl, bx9[i], by9[i], bw9, bh9, bl9[i], bd9[i], kd9[i], tsize=12, bsize=9.5, pad=0.04)"""))
R.append(("""    tb(sl, 2.45, 2.02 - 0.03, 1.5, 0.3, '', size=1)
""", ""))
R.append(("""    tb(sl, 2.47, 2.43, 1.6, 0.25, 'phone and PIN', size=9.5, color=MUTED)
""", ""))
# S14 hyper bars
R.append(("""    k_ = 5.0 / 500.0""", """    k_ = 4.3 / 500.0"""))
R.append(("""        tb(sl, x + 0.1, y, 1.9, 0.5, [[(tot + '   ', dict(size=12, bold=True, color=INK)),
                                       ('fee Rs 15', dict(size=10.5, color=SLATE))]], anchor=MIDDLE)""",
          """        tb(sl, x + 0.1, y, 1.3, 0.5, tot + ' a day', size=11.5, bold=True, color=INK, anchor=MIDDLE)"""))
R.append(("""    legend(sl, bx0, 3.62, [(BLUE, 'contribution, to the pot'), (TEAL, INS), (TH, 'fee')])""",
          """    legend(sl, bx0, 3.62, [(BLUE, 'contribution, to the pot'), (TEAL, INS), (TH, 'fee, Rs 15 a day')])"""))
# S16 legend
R.append(("""    legend(sl, PM, 6.42, [(TH_XLT, BN), (BLUE_XLT, 'wallets, cards and payment networks'), (LIME_XLT, 'Halqa')])""",
          """    legend(sl, PM, 6.42, [((TH_XLT, TH), BN), ((BLUE_XLT, BLUE), 'wallets, cards and payment networks'),
                          ((LIME_XLT, LIME), 'Halqa')])"""))
# S19 recovery step 3
R.append(("""             (INS_C, 'the operator pays the members left short', TEAL_LT),""",
          """             ('Claim', 'the %s operator pays the members left short' % INS, TEAL_LT),"""))
# S21 revenue sankey and annotation
R.append(("""    sx, sw, sy0, sh = PM + 0.02, 0.16, 2.3, 2.75
    k_ = sh / 11047.0
    parts = [(10000, BLUE, BLUE_LT, 2.2), (547, TEAL, TEAL_LT, 5.08), (500, TH, TH_LT, 5.38)]""",
          """    sx, sw, sy0, sh = PM + 0.02, 0.16, 2.3, 2.4
    k_ = sh / 11047.0
    parts = [(10000, BLUE, BLUE_LT, 2.2), (547, TEAL, TEAL_LT, 4.62), (500, TH, TH_LT, 4.92)]"""))
R.append(("""    tb(sl, tx + 0.3, 4.98, 3.4, 0.3, [[('Rs 547  ', dict(size=11, bold=True, color=INK)),
                                       ('%s' % INS, dict(size=11, color=SLATE))]])
    tb(sl, tx + 0.3, 5.3, 3.4, 0.5, [[('up to Rs 500  ', dict(size=11, bold=True, color=INK)),
                                      ('fee: %s collects it; share to Halqa' % BN, dict(size=11, color=SLATE))]],
       spacing=1.02)""", """    tb(sl, tx + 0.3, 4.53, 3.5, 0.3, [[('Rs 547  ', dict(size=11, bold=True, color=INK)),
                                       ('%s' % INS, dict(size=11, color=SLATE))]])
    tb(sl, tx + 0.3, 4.83, 3.6, 0.5, [[('up to Rs 500  ', dict(size=11, bold=True, color=INK)),
                                      ('fee to %s, shared with Halqa' % BN, dict(size=11, color=SLATE))]],
       spacing=1.02)"""))
R.append(("""    tb(sl, x0 + 1.7, 3.43, 2.4, 0.28, 'Break-even: 2,572 members', size=10.5, bold=True, color=INK)""",
          """    tb(sl, 7.1, 3.3, 2.2, 0.28, 'Break-even: 2,572 members', size=10.5, bold=True, color=INK, align=R)
    oval(sl, 9.45 - 0.07, 3.75 - 0.07, 0.14, WHITE, line=LIME_DK, lw=1.75)"""))
# S26 status font
R.append(("""        blist(sl, x + 0.05, 2.5, cw - 0.1, 3.6, items, size=12, bcolor=bc, gap=8, spacing=1.06)""",
          """        blist(sl, x + 0.05, 2.55, cw - 0.1, 3.5, items, size=13, bcolor=bc, gap=11, spacing=1.06)"""))
for a, b in R:
    n = s.count(a)
    assert n == 1, (n, a[:80])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched', len(R))
