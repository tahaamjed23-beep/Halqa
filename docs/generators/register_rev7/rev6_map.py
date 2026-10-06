# -*- coding: utf-8 -*-
"""Owner, priority and effort for the 1,039 items of revision 6, which carried text, location and status only.

The owner follows the location: legal items are counsel's, commercial and decision items the chairman's, bank items the
bank's, tax items the tax adviser's, and everything in code, content or documents is work Claude can do. Exceptions are
listed by item number. Priority follows the section, with the items that expose Halqa legally raised to P0. Effort is 1
unless the item builds or rewrites something whole."""

OWNER_BY_WHERE = {
    'legal': 'Counsel', 'commercial': 'Chairman', 'bank': 'Bank', 'decision': 'Chairman', 'registration': 'Chairman',
    'corporate': 'Chairman', 'tax': 'Tax adviser', 'finance': 'Chairman', 'meeting': 'Chairman', 'external': 'Chairman',
    'marketing': 'Chairman', 'governance': 'Chairman',
}
OWNER_BY_ITEM = {
    495: 'Counsel', 560: 'Chairman', 705: 'Tester', 537: 'Tester', 645: 'Tester', 613: 'Tester', 614: 'Tester',
    628: 'Chairman', 650: 'Chairman', 658: 'Chairman', 659: 'Chairman', 661: 'Chairman', 698: 'Bank', 699: 'Bank',
    700: 'Counsel', 703: 'Claude', 707: 'Claude', 708: 'Claude', 734: 'Claude', 735: 'Claude', 739: 'Claude',
    740: 'Claude', 804: 'Claude', 986: 'Chairman', 993: 'Chairman', 994: 'Chairman', 999: 'Claude', 1012: 'Claude',
    819: 'Chairman', 808: 'Chairman', 497: 'Bank', 595: 'Translator', 717: 'Chairman', 731: 'Translator', 796: 'Bank',
    815: 'Bank', 935: 'Bank', 985: 'Translator',
}

SECTION_PRI = {'A': 'P2', 'B': 'P2', 'C': 'P1', 'D': 'P1', 'E': 'P0', 'F': 'P1', 'G': 'P1', 'H': 'P1', 'I': 'P2',
               'J': 'P1', 'K': 'P0', 'L': 'P1', 'M': 'P1', 'N': 'P1', 'O': 'P2', 'P': 'P2', 'Q': 'P2', 'R': 'P1',
               'S': 'P1', 'T': 'P1', 'U': 'P1', 'V': 'P2', 'W': 'P2', 'X': 'P1', 'Y': 'P1', 'Z': 'P1'}
SUB_PRI = {'C3': 'P0', 'C6': 'P2', 'S1': 'P0', 'S2': 'P0', 'S4': 'P2', 'S6': 'P2', 'Y1': 'P0', 'Y2': 'P2', 'Y3': 'P2',
           'Y4': 'P2', 'Y7': 'P2', 'Z1': 'P0', 'Z3': 'P2'}
# Items that expose Halqa legally or block the meeting with the bank, raised to P0; and items held to later stages.
P0_ITEMS = {156, 161, 162, 371, 372, 374, 382, 419, 420, 498, 499, 538, 545, 546, 547, 548, 556, 702, 982, 983, 984}
P3_ITEMS = {113, 119, 165, 535, 536, 641, 878, 890, 958, 959, 960, 961, 977, 978, 1001}

BIG_START = ('Build ', 'Rebuild ', 'Rewrite ', 'Redraw ', 'Design ', 'Integration test', 'End to end test',
             'Load test', 'Visual regression', 'Accessibility test', 'Move ', 'Add cursor pagination',
             'Bound every unbounded', 'Create the migration')
UMBRELLA = {970, 1032}


def owner_of(item):
    if item['old'] in OWNER_BY_ITEM:
        return OWNER_BY_ITEM[item['old']]
    first = item['where'].split(',')[0].split(':')[0].strip()
    return OWNER_BY_WHERE.get(first, 'Claude')


def pri_of(sec_code, sub_code, item):
    n = item['old']
    if n in P0_ITEMS:
        return 'P0'
    if n in P3_ITEMS:
        return 'P3'
    return SUB_PRI.get(sub_code) or SECTION_PRI[sec_code]


def eff_of(item):
    if item['old'] in UMBRELLA:
        return 4
    t = item['text']
    if t.startswith(BIG_START) or item['where'].startswith('new page') or item['where'].startswith('new lib'):
        return 2
    return 1
