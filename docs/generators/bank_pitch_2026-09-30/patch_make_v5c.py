# -*- coding: utf-8 -*-
"""Third pass: regulation table fits (narrower nested boxes, wider answer column, shorter answers)."""
import io
p = 'make_v5.py'
s = io.open(p, encoding='utf-8').read()
R = [
    ("""'Results only, no images, card numbers '
                                                                         'or passwords; hosted in Singapore today, '
                                                                         'moved where %s and the State Bank require'
             % BN),""",
     """'Results only; hosted in Singapore today, '
                                                                         'moved where %s and the State Bank require'
             % BN),"""),
    ("""             'Full cost shown before signing; 24 hours to withdraw; complaints answered in the app'),""",
     """             'Full cost shown before signing; 24 hours to withdraw; complaints in the app'),"""),
    ("""'All money stays at %s; daily backups '
                                                                               'with point in time recovery; records '
                                                                               'exportable to %s' % (BN, BN))]""",
     """'Money stays at %s; daily backups; '
                                                                               'records exportable to %s' % (BN, BN))]"""),
]
for a, b in R:
    assert s.count(a) == 1, a[:60]
    s = s.replace(a, b)
# geometry of the regulation slide, applied as extra replacements inside make_v5's list
extra = """    (\"\"\"    bx, by, bw, bh = PM, 1.72, 4.7, 4.95\"\"\", \"\"\"    bx, by, bw, bh = PM, 1.72, 4.25, 4.95\"\"\"),
    (\"\"\"    x0 = 5.75
    cws = [1.75, 2.55, RX - x0 - 1.75 - 2.55]\"\"\", \"\"\"    x0 = 5.2
    cws = [1.7, 2.45, RX - x0 - 1.7 - 2.45]\"\"\"),
"""
anchor = """    # status: Hyper labelled experimental"""
assert s.count(anchor) == 1
s = s.replace(anchor, extra + anchor)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
