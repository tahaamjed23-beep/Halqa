# -*- coding: utf-8 -*-
"""Wording rules every corporate document must pass before it is rendered."""
import re
import docgen as D

BANNED = [r'\byou\b', r'\byour\b', r'in plain words', r'\bgenuinely\b', r'\btruly\b', r'\bunlock', r'\bseamless',
          r'\bgame.changer', r'\brevolution', r'\bempower', r'\bjourney\b', r'\bexciting\b', r'\bcutting.edge\b',
          r'summary suit on the undertaking', r'liquidated demand', r'Pak-Qatar Family', r'registered (corporate insurance )?agent',
          r'\bHYPER\b', r'three lawful routes', r'\broute (a|b|c)\b(?!\))']


def check(name, body, allow=()):
    txt = D.text_of(body)
    for bad in ('—', '–', ' - '):
        if bad in txt:
            i = txt.find(bad)
            raise SystemExit('%s: dash: ...%s...' % (name, txt[max(0, i - 80): i + 40]))
    for rx in BANNED:
        if rx in allow:
            continue
        flags = 0 if rx == r'\bHYPER\b' else re.I
        m = re.search(rx, txt, flags=flags)
        if m:
            raise SystemExit('%s: banned wording %r: ...%s...' % (name, rx, txt[max(0, m.start() - 80): m.end() + 40]))
    return True
