# -*- coding: utf-8 -*-
"""Second set of fixes: who acts at each prevention stage; worked example on turn eligibility."""
import io
p = 'bank_deck_build.py'
s = io.open(p, encoding='utf-8').read()
R = []
R.append(("""        bx = PM + i * (cw - ov) + (0.25 if i > 0 else 0.05)
        blist(sl, bx, y0 + 0.85, cw - ov - 0.3, 4.1, items, size=11.5, bcolor=col, gap=7, spacing=1.05)""",
          """        bx = PM + i * (cw - ov) + (0.25 if i > 0 else 0.05)
        blist(sl, bx, y0 + 0.85, cw - ov - 0.3, 3.3, items, size=12.5, bcolor=col, gap=8, spacing=1.05)
        who = ['Halqa’s checks and the host', 'the member signs; %s registers the %s' % (BN, B['mandate']),
               'Halqa reminds; %s collects' % BN, 'Halqa records; arrears settled from the member’s pot'][i]
        tb(sl, bx, 5.32, cw - ov - 0.3, 0.6, [[('Who acts:  ', dict(size=10.5, bold=True, color=SLATE)),
                                               (who, dict(size=10.5, color=SLATE))]], spacing=1.03)
    rule(sl, PM, 5.2, PW, LINE_, 0.75)"""))
R.append(("""                                   'The score is checked again before each circle'], size=11.5, gap=6)""",
          """                                   'The score is checked again before each circle'], size=11.5, gap=6)
    panel(sl, rx0, 5.25, rw, 1.45, FAINT)
    tb(sl, rx0 + 0.2, 5.35, rw - 0.4, 0.3, 'Example', size=12, bold=True, color=INK)
    tb(sl, rx0 + 0.2, 5.67, rw - 0.4, 1.0, 'A new member joining a circle of 12 may choose turn 10, 11 or 12. After '
                                           'two clean circles and a score of 650 or more, any turn is open.', size=11,
       color=INK, spacing=1.05)"""))
for a, b in R:
    n = s.count(a)
    assert n == 1, (n, a[:80])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched', len(R))
