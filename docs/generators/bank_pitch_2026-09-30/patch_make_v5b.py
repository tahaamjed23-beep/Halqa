# -*- coding: utf-8 -*-
"""Second improvement pass, applied to the assembler so the generator stays reproducible:
regulation appendix covers AML and KYC, consumer protection and continuity; points text fits; cover notes outline."""
import io
p = 'make_v5.py'
s = io.open(p, encoding='utf-8').read()
old = """            ('Data location', 'Outsourcing framework: data and cloud controls', 'Hosted in Singapore today (Vercel; '
                                                                             'Supabase on AWS); moved where %s and '
                                                                             'the State Bank require' % BN)]\"\"\"),"""
new = """            ('AML and KYC', 'Anti-Money Laundering Act 2010; State Bank AML regulations',
             'Customer due diligence and screening by %s when the account opens' % BN),
            ('Consumer protection', 'State Bank fair treatment of consumers rules',
             'Full cost shown before signing; 24 hours to withdraw; complaints answered in the app'),
            ('Continuity', 'Outsourcing framework: contingency and exit plans', 'All money stays at %s; daily backups '
                                                                               'with point in time recovery; records '
                                                                               'exportable to %s' % (BN, BN))]\"\"\"),"""
assert s.count(old) == 1
s = s.replace(old, new)
old2 = """    (\"\"\"            ('Data', 'Customer data protection', 'Results only; no face images, card numbers or passwords')]\"\"\",
     \"\"\"            ('Data', 'Customer data protection', 'Results only; no face images, card numbers or passwords'),"""
new2 = """    (\"\"\"            ('Data', 'Customer data protection', 'Results only; no face images, card numbers or passwords')]\"\"\",
     \"\"\"            ('Data', 'Customer data protection; outsourcing data controls', 'Results only, no images, card numbers '
                                                                         'or passwords; hosted in Singapore today, '
                                                                         'moved where %s and the State Bank require'
             % BN),"""
assert s.count(old2) == 1
s = s.replace(old2, new2)
old3 = """    (\"\"\"    rh = 0.66
    for i, row in enumerate(rows):\"\"\", \"\"\"    rh = 0.58
    for i, row in enumerate(rows):\"\"\"),"""
new3 = """    (\"\"\"    rh = 0.66
    for i, row in enumerate(rows):\"\"\", \"\"\"    rh = 0.465
    for i, row in enumerate(rows):\"\"\"),
    (\"\"\"            ('On-time payments', 'never more than half of Halqa’s own fee on that instalment'),\"\"\",
     \"\"\"            ('On-time payments', 'at most half of Halqa’s fee on that instalment'),\"\"\"),
    (\"\"\"'committee system. The deck covers: what a committee is and how many people use one; the problems with '\"\"\",
     \"\"\"'committee system. Slides 1 to 20 are the main story; the appendix, A1 to A6, holds the detail. The main '
            'story covers: what a committee is and how many people use one; the problems with '\"\"\"),"""
assert s.count(old3) == 1
s = s.replace(old3, new3)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
