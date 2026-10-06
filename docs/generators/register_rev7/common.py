# -*- coding: utf-8 -*-
"""Shared helpers for the work register, revision 7.

An item is a dict: text, where, owner, pri, eff, status. Owners: Claude (work Claude can do in a session), Chairman,
Bank, Counsel, Partner, Translator, Tester, Auditor, Tax adviser. Priority: P0 legal exposure or a blocker of the pilot,
P1 needed for the pilot, P2 needed for public launch, P3 needed for scale or later. Effort in session units: 1 small,
2 medium, 4 large. Status: Done, Partly done, Open."""

OWNERS = ('Claude', 'Chairman', 'Bank', 'Counsel', 'Partner', 'Translator', 'Tester', 'Auditor', 'Tax adviser')


def I(text, where='', owner='Claude', pri='P1', eff=1, status='Open'):
    assert owner in OWNERS, owner
    assert pri in ('P0', 'P1', 'P2', 'P3'), pri
    assert status in ('Done', 'Partly done', 'Open'), status
    for bad in ('—', '–', ' - ', '‒', '―'):
        assert bad not in text, (bad, text)
    return dict(text=text, where=where, owner=owner, pri=pri, eff=eff, status=status)


def sub(code, title, items, preamble=''):
    return dict(code=code, title=title, preamble=preamble, items=items)


def section(code, title, subs, preamble='', loop=0):
    return dict(code=code, title=title, preamble=preamble, subs=subs, loop=loop)


def cap(s):
    return s[:1].upper() + s[1:]
