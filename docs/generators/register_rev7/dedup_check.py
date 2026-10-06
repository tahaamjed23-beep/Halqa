# -*- coding: utf-8 -*-
"""Report pairs of items in different sub-sections whose wording overlaps closely, so that duplicates can be removed
by hand. Exact duplicates anywhere are reported as well."""
import re, sys
from collections import defaultdict, Counter
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import make_register

STOP = set('the a an and or of to in on for by with as at is be from it its this that each every any all are not no '
           'into than then when where which who whom whose their there these those over under before after about '
           'only also both either own one two three halqa member members s'.split())


def toks(t):
    return frozenset(w for w in re.findall(r'[a-z0-9]+', t.lower()) if w not in STOP and len(w) > 2)


def main(threshold=0.72):
    secs, items, ph, ms = make_register.build_all()
    exact = defaultdict(list)
    for it in items:
        exact[re.sub(r'\W+', ' ', it['text'].lower()).strip()].append(it['n'])
    dup = {k: v for k, v in exact.items() if len(v) > 1}
    print('exact duplicates:', len(dup))
    for k, v in list(dup.items())[:60]:
        print('  ', v, k[:110])
    T = {it['n']: toks(it['text']) for it in items}
    idx = defaultdict(list)
    df = Counter()
    for n, ts in T.items():
        for w in ts:
            df[w] += 1
    for n, ts in T.items():
        for w in ts:
            if df[w] <= 60:
                idx[w].append(n)
    by_n = {it['n']: it for it in items}
    seen = set()
    pairs = []
    for n, ts in T.items():
        cand = Counter()
        for w in ts:
            if df[w] <= 60:
                for m in idx[w]:
                    if m > n:
                        cand[m] += 1
        for m, c in cand.items():
            if c < 2:
                continue
            a, b = by_n[n], by_n[m]
            if (a['sub'] or a['sec']) == (b['sub'] or b['sec']):
                continue
            if a['n'] > 1039 and b['n'] > 1039 and a['sec'] == b['sec']:
                continue
            j = len(ts & T[m]) / float(len(ts | T[m]) or 1)
            if j >= threshold:
                pairs.append((j, n, m))
    pairs.sort(reverse=True)
    print('close pairs:', len(pairs))
    for j, n, m in pairs[:400]:
        a, b = by_n[n], by_n[m]
        print('%.2f  %d [%s] %s\n      %d [%s] %s' % (j, n, a['sub'] or a['sec'], a['text'][:120], m,
                                                    b['sub'] or b['sec'], b['text'][:120]))


if __name__ == '__main__':
    main(float(sys.argv[1]) if len(sys.argv) > 1 else 0.72)
