# -*- coding: utf-8 -*-
"""Fifth set: anchor the points worked example to the bottom of the slide so the note always fits."""
import io
p = 'bank_deck_build.py'
s = io.open(p, encoding='utf-8').read()
R = []
R.append(("""    ew, eh, eg = 3.3, 0.62, 0.14""", """    ew = 3.3
    eh, eg = (0.56, 0.1) if len(earn) > 3 else (0.62, 0.14)"""))
R.append(("""    by = max(e_bot, y0 + 0.28 + 3 * (eh + eg) - eg) + 0.3
    xtitle(sl, PM, by, PW, 'Worked example: profit on one circle of 12 at Rs 10,000', 'per month and per circle')""",
          """    ny = 6.75 - 0.62
    cy = ny - 0.2 - 0.72
    by = cy - 0.36
    xtitle(sl, PM, by, PW, 'Worked example: profit on one circle of 12 at Rs 10,000', 'per month and per circle')"""))
R.append(("""    cy = by + 0.36
    for i, (num, lb, hi) in enumerate(items):""", """    for i, (num, lb, hi) in enumerate(items):"""))
R.append(("""        rect(sl, x, cy, bwc, 0.74, TH_XLT if hi else FAINT, line=TH if hi else LINE_, lw=1.0,""",
          """        rect(sl, x, cy, bwc, 0.72, TH_XLT if hi else FAINT, line=TH if hi else LINE_, lw=1.0,"""))
R.append(("""    ny = cy + 0.95
    if MQ_:""", """    if MQ_:"""))
for a, b in R:
    n = s.count(a)
    assert n == 1, (n, a[:80])
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('patched', len(R))
