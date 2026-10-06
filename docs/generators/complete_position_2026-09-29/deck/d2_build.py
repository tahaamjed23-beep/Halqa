# -*- coding: utf-8 -*-
"""Build the second edition of Halqa: Complete Position. Usage: python d2_build.py [out.pptx] [parts...]"""
import os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
G = {'__file__': os.path.join(HERE, 'd2_lib.py'), '__name__': 'd2'}
exec(compile(open(os.path.join(HERE, 'd2_lib.py'), encoding='utf-8').read(), 'd2_lib.py', 'exec'), G)

parts = sys.argv[2:] or ['d2_p1.py', 'd2_p2.py', 'd2_p3.py', 'd2_p4.py', 'd2_p5.py', 'd2_p6.py', 'd2_p7.py']
for p in parts:
    path = os.path.join(HERE, p)
    if os.path.exists(path):
        exec(compile(open(path, encoding='utf-8').read(), p, 'exec'), G)


def finish_contents():
    import math as _m
    sl = G['CONTENTS']
    tb, rule, INK, L700, GREY, M, W = (G[k] for k in ('tb', 'rule', 'INK', 'L700', 'GREY', 'M', 'W'))
    secs = [(t, pg) for _, t, pg in G['DIVIDERS']]
    toc = G['TOC']
    colw = (W - 2 * M - 0.6) / 2
    half = (len(secs) + 1) // 2
    ys = [G['Y0'] - 0.55, G['Y0'] - 0.55]
    for idx, (t, pg) in enumerate(secs):
        col = 0 if idx < half else 1
        x = M + col * (colw + 0.6)
        items = [tt for p, tt, s in toc if s == t]
        last = max([p for p, tt, s in toc if s == t] or [pg])
        text = ', '.join(items)
        nlines = max(1, _m.ceil(len(text) / 100.0))
        y = ys[col]
        rule(sl, x, y, colw, G['L700'], 1.0)
        num = str(idx + 1) if t != 'Appendix' else 'A'
        tb(sl, x, y + 0.08, 0.5, 0.35, num, size=15, color=L700, font='Georgia')
        tb(sl, x + 0.5, y + 0.08, colw - 1.6, 0.35, t, size=15, color=L700, font='Georgia')
        tb(sl, x + colw - 1.1, y + 0.12, 1.1, 0.3, 'pages %d to %d' % (pg, last), size=9.5, color=GREY, align=G['R'])
        tb(sl, x + 0.5, y + 0.48, colw - 0.5, 0.2 * nlines + 0.1, text, size=9.5, color=GREY, spacing=1.08)
        ys[col] = y + 0.62 + 0.2 * nlines + 0.12


if 'CONTENTS' in G:
    finish_contents()
G['finish_dividers']()
out = sys.argv[1] if len(sys.argv) > 1 else G['OUT']
G['check_and_save'](out)
