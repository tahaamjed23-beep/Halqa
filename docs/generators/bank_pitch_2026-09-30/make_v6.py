# -*- coding: utf-8 -*-
"""Assemble bank_deck_v6.py from the version 5 generator: the chairman's text edits of 30 September (his Mashreq copy,
applied to both banks), the version 6 overrides (logos and icon tiles in place of text boxes, black text, charts as
shapes) and his slide order (Summary after Current Status)."""
import io, re
base = io.open('bank_deck_v5.py', encoding='utf-8').read()
over = io.open('v6_overrides.py', encoding='utf-8').read()
R = [
    ('Mashreq version 5 and Raqami version 3, 30 September 2026.',
     'Mashreq version 6 and Raqami version 4, 30 September 2026.'),
    ("""    tb(sl, PM, 5.95, 6.5, 0.35, 'Taha Kayani, Chairman, Halqa', size=14, bold=True, color=INK)""",
     """    tb(sl, PM, 5.95, 6.5, 0.35, 'Taha Kayani, Founder, Halqa', size=14, bold=True, color=INK)"""),
    ("""             ('Fixed order', 'the host sets the order of turns at the start')]""",
     """             ('Fixed order/Ballot', 'the host sets the order of turns at the start')]"""),
]
for a, b in R:
    n = base.count(a)
    assert n == 1, (n, a[:90])
    base = base.replace(a, b)
marker = '# ===================================================================== build\n'
assert base.count(marker) == 1
head, tail = base.split(marker)
new_loop = """for f in (s_cover, s_committee, s_market, s_problems, s_structure, s_cycle, s_app_join, s_app_use, s_growth,
          s_credit, s_products, s_onboarding, s_types, s_prevention, s_revenue, s_comparison, s_evidence, s_timing,
          s_status, s_summary, s_hyper, s_collection, s_psp, s_recovery, s_points, s_regulation):
    f()
print('grey text runs made black:', blacken())"""
tail, k = re.subn(r"for f in \(s_cover,.*?\):\n    f\(\)", new_loop, tail, flags=re.S)
assert k == 1
out = head + over + '\n\n' + marker + tail
io.open('bank_deck_v6.py', 'w', encoding='utf-8', newline='\n').write(out)
print('written bank_deck_v6.py', out.count('\n'), 'lines')
