# -*- coding: utf-8 -*-
"""Loop 2: wording and format scan across every corporate document, the deck and the maps."""
import glob, html, io, os, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import pymupdf

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
MAPS = os.path.join(os.path.dirname(HERE), 'out')
DECK = r'D:\HALQA SIGMA APP\docs\HALQA-MASTER-DECK-2026-09-25.pdf'

RULES = [
    ('em or en dash', r'[\u2013\u2014]', 0),
    ('spaced hyphen used as a dash', r'\s-\s', 0),
    ('second person', r'\b(you|your|yours)\b', re.I),
    ('first person plural', r'\b(we|our|us)\b', 0),
    ('plain words', r'in plain words', re.I),
    ('prepared for bar', r'Prepared (for|by)', 0),
    ('classification', r'\bClassification\b|\bConfidential\b', 0),
    ('version or revision', r'\b(Version|Revision|revision \d)\b', 0),
    ('route letters', r'\broute [ABC]\b|\bRoute [ABC]\b|three lawful routes', re.I),
    ('old document names', r'Turn Exchange|Asset Committee Structure|Lawful Options', 0),
    ('old account wording', r'second account|secondary account|taken from the income account|from the member.s own income account', re.I),
    ('cringe wording', r'\b(genuinely|truly|unlock\w*|seamless\w*|game.?changer|revolution\w*|empower\w*|journey|exciting|cutting.edge|robust|leverage)\b', re.I),
    ('upper case product', r'\bHYPER\b', 0),
    ('superseded law wording', r'summary suit on the undertaking|liquidated demand|Pak-Qatar Family|registered (corporate insurance )?agent|agent registration|distributor registration|provincial sales tax', re.I),
    ('superseded figures', r'Rs 12\.60|Rs 1,815\b|Rs 1,338,000|Rs 1,346,000', 0),
]
ALLOW = {
    # quotations from primary texts may carry words the rules forbid in Halqa's own prose
    'robust': 'robust scenarios',
}


def texts():
    for f in sorted(glob.glob(os.path.join(OUT, '**', '*.html'), recursive=True)):
        if os.path.basename(f).startswith(('test', 'Legal Verification')):
            continue
        t = io.open(f, encoding='utf-8').read()
        t = re.sub(r'<style.*?</style>|<title.*?</title>', ' ', t, flags=re.S)
        yield os.path.relpath(f, OUT), html.unescape(re.sub(r'<[^>]+>', ' ', t))
    with pymupdf.open(DECK) as d:
        yield 'DECK', ' '.join(p.get_text() for p in d)
    for f in sorted(glob.glob(os.path.join(MAPS, 'halqa-map-*.render.html'))):
        t = io.open(f, encoding='utf-8').read()
        t = re.sub(r'<style.*?</style>', ' ', t, flags=re.S)
        yield 'MAP ' + os.path.basename(f), html.unescape(re.sub(r'<[^>]+>', ' ', t))


hits = 0
for name, t in texts():
    t = re.sub(r'\s+', ' ', t)
    for label, rx, fl in RULES:
        for m in re.finditer(rx, t, fl):
            ctx = t[max(0, m.start() - 70): m.end() + 50]
            if label == 'cringe wording' and any(a in ctx for a in ALLOW.values()):
                continue
            if label == 'first person plural' and name.startswith(('MAP', 'DECK')) is False and '\u201c' in t[max(0, m.start() - 400): m.start()] and '\u201d' in t[m.end(): m.end() + 400]:
                continue
            hits += 1
            print('%-60s %-28s ...%s...' % (name[:60], label, ctx))
print('hits', hits)
