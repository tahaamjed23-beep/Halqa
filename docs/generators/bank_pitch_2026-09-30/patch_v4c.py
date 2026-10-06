# -*- coding: utf-8 -*-
"""Third set of fixes: prevention text fit, Hyper legend width, Halqa box text on regulation."""
import io
p = 'bank_deck_build.py'
s = io.open(p, encoding='utf-8').read()
R = []
R.append(("""        blist(sl, bx, y0 + 0.85, cw - ov - 0.3, 3.3, items, size=12.5, bcolor=col, gap=8, spacing=1.05)""",
          """        blist(sl, bx, y0 + 0.85, cw - ov - 0.3, 3.3, items, size=12, bcolor=col, gap=6, spacing=1.04)"""))
R.append(("""        tb(sl, bx, 5.32, cw - ov - 0.3, 0.6, [[('Who acts:  ', dict(size=10.5, bold=True, color=SLATE)),""",
          """        tb(sl, bx, 5.42, cw - ov - 0.3, 0.6, [[('Who acts:  ', dict(size=10.5, bold=True, color=SLATE)),"""))
R.append(("""    rule(sl, PM, 5.2, PW, LINE_, 0.75)""", """    rule(sl, PM, 5.32, PW, LINE_, 0.75)"""))
R.append(("""    legend(sl, bx0, 3.62, [(BLUE, 'contribution, to the pot'), (TEAL, INS), (TH, 'fee, Rs 15 a day')])""",
          """    legend(sl, PM, 3.62, [(BLUE, 'contribution, to the pot'), (TEAL, INS), (TH, 'fee, Rs 15 a day')])"""))
R.append(("""    tb(sl, bx + 0.75, iy + 1.34, bw - 1.5, 1.35, 'rules, checks, application and records, under the outsourcing '
                                                 'framework, with audit rights for %s and the State Bank' % BN,
       size=10, color=SLATE, spacing=1.04)""",
          """    tb(sl, bx + 0.75, iy + 1.34, bw - 1.5, 1.4, 'Rules, checks, application and records. Holds no member '
                                                'money. Works under the outsourcing framework, with audit rights for '
                                                '%s and the State Bank.' % BN, size=10.5, color=SLATE, spacing=1.05)"""))
for a, b in R:
    n = s.count(a)
    assert n == 1, (n, a[:80])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched', len(R))
