# -*- coding: utf-8 -*-
"""Shared pieces for the maths documents: folders, number formatting, the
one-paragraph description of Halqa that every formal document opens with."""
import os
import docgen as D

OUT_F = os.path.join(D.HERE, 'out', 'maths', 'Formal')
OUT_I = os.path.join(D.HERE, 'out', 'maths', 'Informal')
for d in (OUT_F, OUT_I):
    os.makedirs(d, exist_ok=True)

CHAIR = 'Taha Amjed, Chairman'


def rs(x, dp=0):
    """Rupees with thousands separators; dp decimals when asked."""
    if dp:
        return 'Rs {:,.{}f}'.format(x, dp)
    return 'Rs {:,.0f}'.format(round(x))


def num(x, dp=0):
    return '{:,.{}f}'.format(x, dp)


def pct(x, dp=1):
    return '{:.{}f}%'.format(x * 100, dp)


ABOUT = D.para(
    'Halqa runs rotating savings committees, known in Pakistan as committees or kameti and elsewhere as ROSCAs, '
    'on a mobile application. Each member pays a fixed contribution every period and one member collects the whole pot '
    'each period, until every member has collected once. Contributions move from the paying member&rsquo;s account to '
    'the collecting member&rsquo;s account through a licensed electronic money institution; Halqa never holds member '
    'money. Halqa earns a flat service fee per instalment. Circles are either known, where members know one another, or '
    'unknown, where they do not. Hyper is Halqa&rsquo;s daily product for members with daily income.')


def formal(fname, title, subtitle, ref, audience, body, running=None):
    path = os.path.join(OUT_F, fname)
    D.render(path, title, subtitle, ref, audience, body, running=running or title)
    return path


def informal(fname, title, subtitle, ref, body, running=None):
    path = os.path.join(OUT_I, fname)
    D.render(path, title, subtitle, ref, CHAIR, body, classification='Internal', running=running or title)
    return path


def glossary(rows):
    return D.table([['Term', 'Meaning']] + rows, widths=['24%', '76%'])
