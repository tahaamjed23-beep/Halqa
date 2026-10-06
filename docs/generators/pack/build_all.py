# -*- coding: utf-8 -*-
"""Rebuilds every corporate document in order and reports failures and headings not in the formal form."""
import os, subprocess, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
HERE = os.path.dirname(os.path.abspath(__file__))
OUTDIR = os.path.join(os.path.dirname(HERE), 'out')
STEPS = [
    (HERE, 'charts3d.py'), (HERE, 'build_bm2.py'), (HERE, 'build_autodebit.py'), (HERE, 'build_asset.py'),
    (HERE, 'build_points.py'), (HERE, 'build_default.py'), (HERE, 'build_legal.py'), (HERE, 'build_sources.py'),
    (HERE, 'build_licence.py'), (HERE, 'conv_existing.py'), (HERE, 'm1_hyper.py'), (HERE, 'm2_afford.py'),
    (HERE, 'm3_income.py'), (HERE, 'm4_kyc.py'), (HERE, 'm5_takaful.py'), (HERE, 'm6_credit.py'), (OUTDIR, 'reg_rev5.py'),
]
env = dict(os.environ, PYTHONIOENCODING='utf-8')
bad = 0
for cwd, script in STEPS:
    r = subprocess.run([sys.executable, script], cwd=cwd, capture_output=True, text=True, encoding='utf-8', errors='replace', env=env)
    heads = [l for l in r.stderr.splitlines() if l.startswith('HEADING NOT MAPPED')]
    other = [l for l in r.stderr.splitlines() if l.strip() and not l.startswith('HEADING NOT MAPPED')]
    last = [l for l in r.stdout.splitlines() if l.strip()][-1:] if r.stdout.strip() else []
    status = 'ok' if r.returncode == 0 else 'FAILED %d' % r.returncode
    print('%-22s %-10s %s' % (script, status, last[0][:90] if last else ''))
    for h in heads:
        print('    ' + h)
    if r.returncode != 0:
        bad += 1
        print('\n'.join('    ' + l for l in other[-12:]))
print('failures', bad)
