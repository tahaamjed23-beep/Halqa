# -*- coding: utf-8 -*-
"""Writes build-master-deck-0925.py from the 24 September builder: current references, the new business
model figures, the summary suit correction, three new slides and a plain closing slide."""
import io, json, os, sys
sys.stdout.reconfigure(encoding='utf-8')
SRC = r'D:\HALQA SIGMA APP\docs\build-master-deck-0924.py'
DST = r'D:\HALQA SIGMA APP\docs\build-master-deck-0925.py'
BM = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'pack', 'bm_figures.json')))
R = BM['rows']
s = io.open(SRC, encoding='utf-8').read()


def rs(x):
    return ('(Rs {:,.0f})'.format(-x)) if x < 0 else 'Rs {:,.0f}'.format(x)


def rep(a, b, count=1):
    global s
    n = s.count(a)
    if n != count:
        raise SystemExit('%d matches (want %d): %s' % (n, count, a[:110]))
    s = s.replace(a, b)


def block(start, end, new):
    """Replace the source from the line starting with start up to (not including) the line starting with end."""
    global s
    i = s.index(start)
    j = s.index(end, i)
    s = s[:i] + new + s[j:]


def insert_before(anchor, new):
    global s
    assert s.count(anchor) == 1, anchor
    s = s.replace(anchor, new + anchor)


# ---------------------------------------------------------------- header
rep("Rebuilt on the evening of 24 September 2026 from the verified documents:\nStatutory Position (rev 4, HQ-CP-06), Complete Feature and Process List\n(rev 4, HQ-CP-07), Hyper Committee (rev 6, HQ-CP-08), Collection and Auto\nDebit Specification (rev 4, HQ-CP-09) and Legal Verification (rev 3).",
    "Rebuilt on 25 September 2026 from the current documents: Legal Position\n(HQ-LG-01), Business Model and Unit Costs (HQ-CP-03), Default Prevention\n(HQ-CP-05), Complete Feature and Process List (HQ-CP-07), Hyper Committee\n(HQ-CP-08) and Collection and Auto Debit Specification (HQ-CP-09).")
rep("DATE = '24 September 2026'", "DATE = '25 September 2026'")
rep("OUT = os.path.join(HERE, 'HALQA-MASTER-DECK-2026-09-24.pptx')", "OUT = os.path.join(HERE, 'HALQA-MASTER-DECK-2026-09-25.pptx')")

# ---------------------------------------------------------------- contents
rep("('03', 'The economics', 'The fee grid, the cost of carrying a committee, the rail constraint and the launch timeline'),",
    "('03', 'The economics', 'The fee, seven committee types, the payment partner charge and the launch timeline'),")
rep("('04', 'Hyper', 'The daily product in two configurations. The only section that sets out calculations'),",
    "('04', 'Hyper', 'The daily product in two configurations, with its arithmetic'),")
rep("('05', 'The product', 'The member journey, standing, default prevention, exit, the bureau link and the later stages'),",
    "('05', 'The product', 'Signup to completion, entry checks, standing, default prevention, the bureau and later stages'),")
rep("('06', 'The evidence', 'Twenty-five attempts in nine markets, and the competitive position'),",
    "('06', 'The evidence', '25 attempts in nine markets, and the competitive position'),")
rep("['Twenty-five attempts across nine markets, reduced to the same questions.',", "['25 attempts across nine markets, reduced to the same questions.',")

# ---------------------------------------------------------------- section 02 references and collection
rep("'Source: Statutory Position, revision 4, section 1.'", "'Source: Legal Position, section 1.'")
rep("'verified. Each clause read in the primary text; see the Statutory Position, revision 4, '\n     'sections 1 to 3, and the Legal Verification of 24 September 2026.')",
    "'verified. Each provision read in the primary text and quoted, with its page, in the Legal Position, '\n     'sections 3 to 12 and 22.')")
rep("(Legal Verification, section 3).')", "(Legal Position, sections 7 and 8).')")
rep("'verified. Source: Statutory Position, revision 4, section 7. The final line of the left '",
    "'verified. Source: Work Register, sections E and F. The final line of the left '")
rep("'The partner’s rate, to be agreed', 'Every monthly circle'],", "'The partner’s rate, to be agreed', 'Known monthly circles'],")
rep("['2', 'Token mandate held by the partner', 'None after the first authorisation', 'About 1.5%, to be confirmed',\n        'Hyper, where a daily prompt is impractical'],",
    "['2', 'Auto pull: a mandate held by the partner', 'None after the first authorisation', 'Target 1%, capped at Rs 10',\n        'Unknown committees and Hyper, mandatory'],")

AUTO = '''# ---- auto pull
sl = slide('02 · Auto pull', 'Auto pull: one authorisation, then collection on payday',
           'The partner takes each instalment from the member’s income account and sends it straight to the collecting '
           'member. Halqa instructs; it holds neither the money nor the payment token.')
exhibit(sl, M, Inches(1.72), Inches(7.1), 11, 'Each monthly instalment')
table(sl, M, Inches(2.0), Inches(7.1),
      [['When', 'What happens'],
       ['Evening before', 'The member is told the amount, its three parts and the date'],
       ['Payday', 'One attempt on the member’s payday, learned from past collections, before the due date'],
       ['Due date', 'The main attempt; if the income account is short, the second account is tried once'],
       ['24 hours after', 'Second attempt, after a reminder'],
       ['48 hours after', 'Final attempt; no further automatic attempt for that instalment'],
       ['After a final failure', 'Recorded as owed to the member left short; the late ladder starts']],
      [0.26, 0.74], fs=9.6, rh=Inches(0.4), first_bold=True)
note(sl, M, Inches(5.0), Inches(7.1), 'On Hyper: one debit a day at a fixed time, one retry within the 12 hour grace, one '
     'message a day.', h=Inches(0.4))
panel(sl, M + Inches(7.45), Inches(1.72), Inches(4.64), Inches(2.1), 'Where it applies',
      'Mandatory on unknown committees and Hyper, from the income account, with an optional second account.\\n'
      'Optional on known committees, where the member may approve each payment or send over Raast.', size=9.8)
panel(sl, M + Inches(7.45), Inches(4.0), Inches(4.64), Inches(2.35), 'Limits and rights',
      'One instalment per collection, one mandate per circle, named accounts only, ending with the circle.\\n'
      'Authorised in the application under s.35(1) of the PS&EFT Act 2007; the member may stop it at any time under '
      's.35(2), and still owes the instalment.', size=9.8)
tag(sl, M, Inches(6.62), 'Partner  ·  source: Collection and Auto Debit Specification, revision 4, section 3')

'''
insert_before('# ---- duties\n', AUTO)

# ---------------------------------------------------------------- section 03
rep("         'Rs 100 an instalment covers the cost of an open circle; every band above carries margin.',\n         'A percentage rail against a flat fee is the binding constraint.'])",
    "         'Every committee type covers its running costs from its first circle.',\n         'The payment partner’s charge must be a small amount per payment, not a percentage.'])")
rep("['Guarantee cheque held on file', '80% off', 'Opens a route under section 489-F of the Penal Code'],",
    "['Guarantee cheque held on file', '80% off', 'If dishonoured: a summary suit, and s.489-F of the Penal Code'],")
rep("'The national average instalment of Rs 6,400 falls in the third band.')",
    "'The national average instalment of Rs 6,400 falls in the third band. Sales tax of 15 per cent is added on top.')")

names = [('family', 'Family circle', '6, Rs 5,000 monthly'), ('office', 'Office circle', '12, Rs 10,000 monthly'),
         ('market', 'Market circle', '10, Rs 2,000 weekly'), ('unknown', 'Unknown circle', '12, Rs 10,000 monthly'),
         ('large', 'Large unknown circle', '20, Rs 25,000 monthly'), ('hyper1', 'Hyper, Option 1', '400, Rs 450 daily'),
         ('hyper2', 'Hyper, Option 2', '390, Rs 500 daily')]
rows = ["      [['Committee', 'Members, payment', 'Fee', 'Cost per payment', 'First circle', 'Later circles'],"]
for k, n, m in names:
    r = R[k]
    fee = 'Rs {:,.2f}'.format(r['fee']) if r['fee'] % 1 else 'Rs {:,.0f}'.format(r['fee'])
    rows.append("       [%r, %r, %r, %r, %r, %r]," % (n, m, fee, 'Rs {:,.2f}'.format(r['per_payment']), rs(r['first']), rs(r['later'])))
rows[-1] = rows[-1][:-1] + '],'
COST = '''# ---- cost of seven committee types
sl = slide('03 · Cost', 'What each committee type costs to run and earns',
           'Seven types from a six member family circle to Hyper. Contribution is fee and commission less running costs, '
           'rewards to later seats, and, in a first circle, onboarding and acquisition.')
exhibit(sl, M, Inches(1.72), CW, 13, 'Contribution per circle, in rupees')
table(sl, M, Inches(2.0), CW,
%s
      [0.2, 0.2, 0.1, 0.14, 0.18, 0.18], fs=9.6, rh=Inches(0.36), first_bold=True)
panel(sl, M, Inches(5.05), Inches(5.9), Inches(1.35), 'Fixed costs and break even',
      'About Rs %s million a month at launch: two engineers, operations, counsel, accounts, audit, office and software. '
      'With the assumed mix of types, costs are covered at about %s active members.', size=9.6)
panel(sl, M + Inches(6.2), Inches(5.05), Inches(5.89), Inches(1.35), 'Prices behind it',
      'WhatsApp at US$0.015 a message from 1 October 2026, NADRA and TASDEEQ at planning figures, support at Rs 60,000 '
      'an agent a month, and the partner at 1 per cent capped at Rs 10.', size=9.6)
note(sl, M, Inches(6.62), CW, 'modelled. Every price and its source: Business Model and Unit Costs, sections 3 to 8.')

''' % ('\n'.join(rows), '{:,.2f}'.format(BM['fixed_total'] / 1e6), '{:,.0f}'.format(round(BM['break_even'], -2)))
block('# ---- cost of one committee', '# ---- the rail', COST)


def cap(d):
    return min(0.01 * d, 10.0)


rail_rows = [("Hyper, Option 1", 450.0, 75.0, 450.0), ("Hyper, Option 2", 500.0, 250 / 3, 500.0),
             ("Known, Rs 2,500", 2500.0, 100.0, 2600.0), ("Unknown, Rs 10,000", 10000.0, 500.0, 11046.67),
             ("Unknown, Rs 25,000", 25000.0, 500.0, 26866.75)]
rt = ["      [['Committee', 'Debit', 'Fee', '1%, capped at Rs 10', '1.5%, uncapped', 'Share of fee at 1.5%'],"]
for n, c, f, d in rail_rows:
    rt.append("       [%r, %r, %r, %r, %r, %r]," % (n, 'Rs {:,.0f}'.format(d), ('Rs {:,.2f}'.format(f) if f % 1 else 'Rs {:,.0f}'.format(f)),
                                                    'Rs {:,.2f}'.format(cap(d)), 'Rs {:,.2f}'.format(0.015 * d), '{:.0f}%'.format(100 * 0.015 * d / f)))
rt[-1] = rt[-1][:-1] + '],'
RAIL = '''# ---- the partner charge
sl = slide('03 · The partner’s charge', 'The partner’s charge must be per payment, not a percentage',
           'The fee is flat. A percentage charge grows with the payment, so on large instalments it would take most of the fee.')
exhibit(sl, M, Inches(1.72), Inches(7.3), 15, 'The partner’s charge on one payment, two ways')
table(sl, M, Inches(2.0), Inches(7.3),
%s
      [0.26, 0.14, 0.12, 0.17, 0.15, 0.16], fs=9.4, rh=Inches(0.4), first_bold=True)
tb(sl, M, Inches(4.6), Inches(7.3), Inches(1.2),
   'The debit includes the contribution, any takaful contribution and the fee. Partner prices to third party service '
   'providers are not published; SadaPay lists its consumer bank transfers as free for July to December 2026, and Raast '
   'merchant payments carry no discount rate at present.', size=9.8, spacing=1.14)
panel(sl, M + Inches(7.65), Inches(2.0), Inches(4.44), Inches(2.1), 'Target terms',
      'A charge per debit of 1 per cent capped at Rs 10, or a flat amount.\\nWhether the charge can be passed to the payer.', size=10.0)
panel(sl, M + Inches(7.65), Inches(4.25), Inches(4.44), Inches(2.05), 'What is at stake',
      'At 1.5 per cent uncapped, a large unknown circle would earn 63 per cent less and an unknown circle 31 per cent less. '
      'Hyper would lose about 3 per cent.', size=10.0)
note(sl, M, Inches(6.62), CW, 'modelled. Source: Business Model and Unit Costs, section 7.')

''' % '\n'.join(rt)
block('# ---- the rail', '# ---- revenue', RAIL)
rep("['Leasing origination', 'On asset circles, once a leasing structure exists', 'Later'],",
    "['Asset committee referral', '2 to 4% of the asset price, from the modaraba', 'Later'],")
rep("note(sl, M, Inches(6.62), CW, 'Source: Business Model, revision 3, sections 2 and 8.')",
    "note(sl, M, Inches(6.62), CW, 'Source: Business Model and Unit Costs, section 1.')")
rep("note(sl, M, Inches(6.62), CW, 'Source: Business Model, revision 3, section 9.')",
    "note(sl, M, Inches(6.62), CW, 'Source: Registrations and Licences Required (HQ-LD-01).')")

# ---------------------------------------------------------------- section 04
rep("         'The only section of this deck that sets out calculations.'])",
    "         'The arithmetic is set out in full in the maths documents HQ-MF-01 and HQ-MF-05.'])")
rep("Hyper Committee, revision 5", "Hyper Committee, revision 6", count=4)
h1, h2 = R['hyper1'], R['hyper2']
rew1, rew2 = 150000.0, 84500.0
HYT = '''      [['Line', 'Option 1', 'Option 2'],
       ['Fee revenue', 'Rs 1,500,000', 'Rs 845,000'],
       ['Operator’s commission at 15%%', 'Rs 225,000', 'Rs 126,750'],
       ['Gross revenue', 'Rs 1,725,000', 'Rs 971,750'],
       ['Running cost of payments', %r, %r],
       ['Points and waivers to later seats', %r, %r],
       ['Net per cycle, returning members', %r, %r],
       ['Net per cycle, all members new', %r, %r],
       ['Expected default loss at 5%%, borne by the fund', 'Rs 150,000', 'Rs 84,500']],
      [0.5, 0.25, 0.25], fs=9.4, rh=Inches(0.34), bolds=[6], first_bold=True)''' % (
    rs(-(h1['running'] - rew1)), rs(-(h2['running'] - rew2)), rs(-rew1), rs(-rew2), rs(h1['later']), rs(h2['later']),
    rs(h1['first']), rs(h2['first']))
i = s.index("      [['Line', 'Option 1', 'Option 2'],\n       ['Fee revenue', 'Rs 1,500,000', 'Rs 845,000'],")
j = s.index("first_bold=True)", i) + len("first_bold=True)")
s = s[:i] + HYT + s[j:]
rep("note(sl, M, Inches(5.2), Inches(6.4), 'The rail line assumes Halqa bears the partner’s charge; it falls away if the '\n     'charge is passed to the payer.', h=Inches(0.4))",
    "note(sl, M, Inches(5.2), Inches(6.4), 'Running cost includes the partner’s charge at 1 per cent; at 1.5 per cent the net '\n     'falls by Rs 45,000 and Rs 25,350.', h=Inches(0.4))")

# ---------------------------------------------------------------- section 05
rep("        ['The member journey from signup to a completed circle, with the control at each step.',",
    "        ['From signup to a completed circle, with the control at each step.',")
rep('# ---- the journey', '# ---- signup to completion')
rep("sl = slide('05 · The journey', 'From signup to a completed circle',", "sl = slide('05 · Signup to completion', 'From signup to a completed circle',")
rep("'Phone number and one-time passcode'", "'Phone number and one time passcode'")
rep("'Mandate on Hyper, tier 2'", "'Auto pull on unknown committees and Hyper, tier 2'")
ENTRY = '''# ---- entry checks
sl = slide('05 · Entry checks', 'Who may join an unknown committee or Hyper',
           'Members of an unknown committee do not know one another, so the checks a host would make informally are made '
           'by Halqa on evidence.')
exhibit(sl, M, Inches(1.72), Inches(7.6), 28, 'The checks, and the model behind each')
table(sl, M, Inches(2.0), Inches(7.6),
      [['Check', 'Standard', 'Model'],
       ['Identity', 'NADRA check, live face match, names agree; confidence score 0.85, or 0.92 for Hyper', 'HQ-MF-04'],
       ['Income account', 'In the member’s name; a salary pattern score of 0.75, or daily income for Hyper', 'HQ-MF-03'],
       ['Daily income, Hyper', 'Rs 1,000 or more on at least 5 days of every week for 8 weeks', 'HQ-MF-03'],
       ['Affordability', 'Committees within a third of verified income; 40 per cent with other loans', 'HQ-MF-02'],
       ['Credit report', 'TASDEEQ report on the member’s own instruction', 'HQ-MF-06'],
       ['Seats', 'A new member takes only the last three seats', 'HQ-MF-01']],
      [0.2, 0.66, 0.14], fs=9.4, rh=Inches(0.44), first_bold=True)
panel(sl, M + Inches(7.95), Inches(2.0), Inches(4.14), Inches(2.1), 'Cover',
      'Takaful cover is mandatory on these circles, priced so the fund survives one circle in five losing a fifth of '
      'its members from the earliest seats (HQ-MF-05).', size=9.8)
panel(sl, M + Inches(7.95), Inches(4.25), Inches(4.14), Inches(2.1), 'Hyper in numbers',
      'Option 1 needs verified income of about Rs 40,909 a month. The Rs 1,000 daily floor proves daily income exists; '
      'affordability is tested separately.', size=9.8)
tag(sl, M, Inches(6.62), 'To build  ·  source: the maths documents HQ-MF-01 to HQ-MF-06')

'''
insert_before('# ---- standing\n', ENTRY)
rep("'any takaful claim.\\nA summary suit on the undertaking is the last step.\\nNo collection calls and no contact lists, '",
    "'any takaful claim.\\nA civil suit on the undertaking is the last step; a summary suit lies only on a guarantee cheque.\\n'\n      'No collection calls and no contact lists, '")
rep("'verified against exit-ladder.ts. Defaulting on a signed guarantee is a civil matter: '\n     'recovery is by summary suit under Order XXXVII of the Code of Civil Procedure and needs a decree first.')",
    "'verified against exit-ladder.ts. Defaulting on a signed guarantee is a civil matter and recovery needs a decree. '\n     'The summary procedure of Order XXXVII applies only to bills of exchange, hundis and promissory notes, such as a guarantee cheque.')")
rep("Halqa is an execution-only '", "Halqa is an execution only '")
ASSET = '''# ---- asset committees
sl = slide('05 · Asset committees', 'Asset committees through a licensed modaraba',
           'A committee that buys each member a motorcycle, rickshaw or machine. The modaraba owns and leases the asset; '
           'Halqa arranges the circle and holds nothing.')
panel(sl, M, Inches(1.75), Inches(5.9), Inches(2.3), 'How it works',
      'The modaraba buys each member’s asset and leases it to the member under ijarah for the length of the circle.\\n'
      'The member pays one monthly rental on the circle’s date; from it the modaraba pays the contribution.\\n'
      'At the member’s turn the pot goes to the modaraba as advance rental. Ownership passes when the circle ends.', size=9.8)
panel(sl, M, Inches(4.2), Inches(5.9), Inches(2.15), 'Who carries the risk',
      'The modaraba owns the asset and recovers it if a member stops paying. The circle is paid in full whatever the '
      'member does, so the other members lose nothing.', size=9.8, fill=LIME_LT)
panel(sl, M + Inches(6.2), Inches(1.75), Inches(5.89), Inches(2.3), 'Halqa’s role and income',
      'Arranges the circle and keeps the record. It does not own, finance, lease or repossess the asset.\\n'
      'A referral fee of 2 to 4 per cent from the modaraba and a dealer commission of 1 to 3 per cent, both disclosed.', size=9.8)
panel(sl, M + Inches(6.2), Inches(4.2), Inches(5.89), Inches(2.15), 'Candidates and open points',
      'Orix Modaraba, First Habib Modaraba, Allied Rental Modaraba, First Punjab Modaraba. None contracted.\\n'
      'Counsel’s opinion on arranging credit; the modaraba’s minimum ticket; rental dates aligned to circle dates.', size=9.8)
tag(sl, M, Inches(6.62), 'Later  ·  source: Asset Committee Structure (HQ-CP-01)')

'''
insert_before('# ======================================================= SECTION 06 ========\n', ASSET)

# ---------------------------------------------------------------- section 06 and 07
rep("'Members start small; clean history unlocks larger clubs'", "'Members start small; clean history opens larger clubs'")
rep("     'and summarised in the Business Model, revision 3, section 10.')", "     'and in the market research of August 2026.')")
rep("['Documents', 'Six documents re-issued on 24 September 2026, each quotation checked against the primary text']],",
    "['Documents', 'The document set issued on 25 September 2026, each quotation checked against the primary text']],")
rep("note(sl, M, Inches(6.55), CW, 'Source: Business Model, revision 3, section 11.')",
    "note(sl, M, Inches(6.55), CW, 'Source: Complete Feature and Process List, revision 4, section 28.')")
rep("'Source: Registrations and Licences Required; Statutory Position, revision 4, section 7.'",
    "'Source: Registrations and Licences Required (HQ-LD-01) and the Work Register.'")
rep("   'Every serious competitor in this market earns by holding money.\\n'\n   'Halqa earns a stated fee for a service, and holds none.\\n'\n   'That is a different business, with a different regulator, a different cost structure and a different '\n   'failure mode.', size=21,",
    "   'Halqa never holds members’ money.\\n'\n   'It earns a stated fee for organising committees. A licensed partner moves the money and a licensed takaful '\n   'operator writes the cover.\\n'\n   'What it needs is a company, tax registrations and contracts with licensed partners.', size=21,")

import re as _re
_n = {'k': 0}


def _renum(m):
    _n['k'] += 1
    return 'exhibit(sl, %s, %s, %s, %d, ' % (m.group(1), m.group(2), m.group(3), _n['k'])


s = _re.sub(r"exhibit\(sl, ([^,]+), ([^,]+), ([^,]+), (\d+), ", _renum, s)
print('exhibits', _n['k'])
for bad in ('Statutory Position', 'Legal Verification', 'Business Model, revision 3', 'revision 5', 'summary suit on the undertaking',
            'unlocks', 'Every serious', 'execution-only', 'journey'):
    if bad in s:
        raise SystemExit('still present: ' + bad)
io.open(DST, 'w', encoding='utf-8').write(s)
print('written', DST, len(s))
