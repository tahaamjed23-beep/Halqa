# -*- coding: utf-8 -*-
"""Deck of 25 September, late: auto pull from the wallet at the partner, seat exchange with points, asset committees in
two configurations, document references by code rather than revision."""
import io, os, shutil, sys
sys.stdout.reconfigure(encoding='utf-8')
P = r'D:\HALQA SIGMA APP\docs\build-master-deck-0925.py'
BAK = r'D:\HALQA SIGMA APP\docs\archive\build-master-deck-0925.before-late.py'
if not os.path.exists(BAK):
    shutil.copy(P, BAK)
s = io.open(BAK, encoding='utf-8').read()


def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        raise SystemExit('%d matches (want %d): %s' % (n, count, a[:110]))
    s = s.replace(a, b)


rep("Builds HALQA-MASTER-DECK-2026-09-24.pptx, the complete position deck.",
    "Builds HALQA-MASTER-DECK-2026-09-25.pptx, the complete position deck.")
rep("(HQ-CP-08) and Collection and Auto Debit Specification (HQ-CP-09). Research figures carried from the",
    "(HQ-CP-08), Collection and Auto Debit Specification (HQ-CP-09), Auto Debit\n(HQ-CP-02), Asset Committees (HQ-CP-01) and Seat Exchange and Points\n(HQ-CP-04). Research figures carried from the")
# auto pull slide
rep("""           'The partner takes each instalment from the member’s income account and sends it straight to the collecting '
           'member. Halqa instructs; it holds neither the money nor the payment token.')""",
    """           'The partner takes each instalment from the member’s wallet at the partner, into which the income is paid, and '
           'sends each part straight to its owner. Halqa instructs; it holds neither the money nor any payment credential.')""")
rep("""       ['Due date', 'The main attempt; if the income account is short, the second account is tried once'],""",
    """       ['Due date', 'The main attempt; if the wallet is short, a backup card is charged once where one is held'],""")
rep("""      'Mandatory on unknown committees and Hyper, from the income account, with an optional second account.\\n'""",
    """      'Mandatory on unknown committees and Hyper, from the member’s wallet at the payment partner, NayaPay or SadaPay, '
      'with an optional backup card. Raast lets no payee pull money from another institution, so the wallet is the source.\\n'""")
rep("""      'One instalment per collection, one mandate per circle, named accounts only, ending with the circle.\\n'""",
    """      'One instalment per collection, one mandate per circle, the roster as the only payees, ending with the circle.\\n'""")
rep("tag(sl, M, Inches(6.62), 'Partner  ·  source: Collection and Auto Debit Specification, revision 4, section 3')",
    "tag(sl, M, Inches(6.62), 'Partner  ·  source: Auto Debit (HQ-CP-02); Collection and Auto Debit Specification (HQ-CP-09), section 3')")
# references by code
rep("'Source: Business Model and Unit Costs, section 1; Collection and Auto Debit Specification, revision 4, section 1.')",
    "'Source: Business Model and Unit Costs (HQ-CP-03), section 1; Collection and Auto Debit Specification (HQ-CP-09), section 1.')")
s = s.replace('Complete Feature and Process List, revision 4,', 'Complete Feature and Process List (HQ-CP-07),')
s = s.replace('Feature List, revision 4,', 'Feature List (HQ-CP-07),')
# points
rep("""      'service fee and booked as a liability when issued. Redeemed against later fees, or against goods with a '
      'commerce partner: Daraz, foodpanda or Careem, none contracted.', size=9.8)""",
    """      'service fee and booked as a liability when issued. One point is one rupee off a later fee, or goes towards a '
      'voucher Halqa buys from Daraz, foodpanda or Careem, none contracted (HQ-CP-04).', size=9.8)""")
rep("""       ['Points redemption', 'Daraz, foodpanda or Careem', 'Points and waivers'],""",
    """       ['Voucher retailers', 'Daraz, foodpanda or Careem, none contracted', 'Points'],""")
rep("""    'Turn swap||Two members exchange positions at no price, with host approval, and both bands must permit the new positions.'],""",
    """    'Seat exchange||Nothing passes between the two members. The member moving later gets fee waivers and points from Halqa; the member moving earlier pays Halqa a flat Rs 500 (HQ-CP-04).'],""")
# asset committees
rep("""           'A committee that buys each member a motorcycle, rickshaw or machine. The modaraba owns and leases the asset; '
           'Halqa arranges the circle and holds nothing.')""",
    """           'A committee through which members obtain a motorcycle, rickshaw or machine. The modaraba owns and leases the '
           'asset; Halqa arranges the circle and holds nothing. Two configurations: every seat an asset seat, or asset seats '
           'first with the other members taking cash.')""")
rep("tag(sl, M, Inches(6.62), 'Later  ·  source: Asset Committee Structure (HQ-CP-01)')",
    "tag(sl, M, Inches(6.62), 'Later  ·  source: Asset Committees (HQ-CP-01)')")
for bad in ('revision 4', 'second account', 'Asset Committee Structure', 'Turn swap', 'commerce partner'):
    if bad in s:
        raise SystemExit('still present: ' + bad)
io.open(P, 'w', encoding='utf-8').write(s)
print('deck script patched')
