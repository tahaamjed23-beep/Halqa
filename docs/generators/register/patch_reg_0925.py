# -*- coding: utf-8 -*-
"""Patch reg_rev5.py: formal section headings, no revision history, new technical items, renamed documents."""
import io

p = 'reg_rev5.py'
s = io.open(p, encoding='utf-8').read()


def rep(a, b):
    global s
    n = s.count(a)
    if n != 1:
        raise SystemExit('found %d: %s' % (n, a[:110]))
    s = s.replace(a, b)


rep("""        'Implement tier two, the auto debit: collection against a token mandate held by the partner, mandatory on '
        'unknown committees and Hyper, taken from the income account, with an optional secondary account tried once '
        'when the primary fails for lack of funds (HQ-CP-02)', 'lib/auto-debit.ts')""",
    """        'Implement tier two, the auto debit: collection against a mandate held by the partner, mandatory on unknown '
        'committees and Hyper, taken from the member\\'s wallet at the payment partner, with an optional backup card '
        'charged once when the wallet fails for lack of funds (HQ-CP-02)', 'lib/auto-debit.ts')""")
rep("""insert_after('Implement tier two, the auto debit', [""",
    """insert_after('Implement tier two, the auto debit', [
    ('Wallet linking through the partner: a linking session, authentication on the partner\\'s own screen, and the wallet '
     'title returned and matched to the CNIC (HQ-CP-02)', 'new lib/partner-link.ts'),
    ('Mandate created with the roster as its permitted payees, an amount cap of one instalment and the schedule; only the '
     'mandate reference is stored (HQ-CP-02)', 'lib/auto-debit.ts'),
    ('Webhook receiver: signature and time stamp verified, messages older than five minutes or already received rejected, '
     'outcome written to the ledger in one transaction', 'new routes/partner-webhook.ts'),
    ('Wallet limit check at seat allocation: a pot that would take the collecting member\\'s wallet past its monthly limit is '
     'paid to their bank account instead (EMI Regulations 2023, para 14.II(a))', 'lib/payout.ts'),
    ('Standing instruction guidance for members whose income arrives at another bank, with the date set before the due date', 'new page'),""")
rep("""    ('Swap reward schedule from Halqa to the member moving later, by seats moved and circle size, and a flat swap fee from '
     'the member moving earlier (HQ-CP-04, route A), after the opinion of counsel', 'lib/turn-swap.ts'),
    ('Asset circles through a modaraba under ijarah: catalogue, the modaraba\\'s approval of each member, rental dates '
     'aligned to circle dates (HQ-CP-01), after the opinion of counsel on arranging credit', 'lib/asset-committee.ts'),""",
    """    ('Seat exchange with points: fee waivers and points from Halqa to the member moving later on the published schedule, a '
     'flat Rs 500 exchange fee from the member moving earlier, and the cap of 10 per cent of a circle\\'s fees (HQ-CP-04), '
     'after the opinion of counsel', 'lib/turn-swap.ts'),
    ('Points ledger: append only entries for earning, availability, reservation, redemption and expiry; redemption against '
     'fees at debit time; vouchers bought by Halqa; expiry after 24 months (HQ-CP-04)', 'new lib/points-ledger.ts'),
    ('Asset committees through a modaraba under ijarah in two configurations: catalogue, application and decision interface, '
     'handover record and monthly statement to the modaraba (HQ-CP-01), after the opinion of counsel on arranging credit',
     'lib/asset-committee.ts'),""")

rep("""# --------------------------------------------------------------- render ----""",
    """TITLES = {
    'Brand, theme and the visual system': 'Visual System', 'Navigation and application chrome': 'Navigation',
    'Every screen rebuilt to the wallet standard': 'Screens', 'Screens that do not exist and are required': 'Missing Screens',
    'Structural removals arising from the design changes': 'Removals', 'Structural additions arising from the same changes': 'Additions',
    'Collection, mandates and rails': 'Collection', 'Takaful cover': 'Takaful', 'Savings, trustee and asset manager': 'Savings',
    'Credit data': 'Credit Data', 'Registrations, legal instruments and governance': 'Registrations and Governance',
    'Data, platform and the path to one hundred thousand members': 'Platform and Scale', 'Security': 'Security',
    'Testing and release': 'Testing and Release', 'Content, language and accessibility': 'Content and Accessibility',
    'Measurement': 'Measurement', 'Application store and distribution': 'Distribution', 'Support and operations': 'Operations',
}
SUBTITLES = {
    'C1. Rules that apply to every screen': 'C1. Common Rules', 'C2. Sign up and sign in, redesigned from nothing': 'C2. Sign Up and Sign In',
    'C3. Retired terms still shown on screen': 'C3. Retired Terms', 'C4. Screens that crash': 'C4. Screen Failures',
    'C5. Screen by screen': 'C5. Individual Screens', 'C6. Components': 'C6. Components',
}
for k, sec in enumerate(SECTIONS):
    items = [(S, SUBTITLES[it[1]]) + tuple(it[2:]) if it[0] == S else it for it in sec[3]]
    SECTIONS[k] = (sec[0], TITLES[sec[1]], sec[2], items)


# --------------------------------------------------------------- render ----""")

rep("""    'Revision 5 aligns the register with the documents issued on the evening of 24 September 2026: takaful agency by '
    'written agreement with a general takaful operator, MUFAP membership for savings, sales tax registration in '
    'Islamabad, the income account, affordability, identity and takaful models, the auto debit on unknown committees as '
    'well as Hyper, and the turn exchange and asset committee routes. A check against the code corrected three file '
    'names, the count of unbounded queries (50 of 62), the test position (18 engine test files, no route tests) and the '
    'status of the additive SQL, which is written but not applied.',
    'Revision 4 marked as done the removal of pill shapes, the two Hyper configurations with the three way split, the four '
    'crashing screens and their preview data, and three defects found while rebuilding. It moved the collection items to '
    'the electronic money institution partner and added three findings from the code and the live headers.',
    'Revision 3 rewrote section C after an audit of every screen in the running application, which found four screens '
    'that crashed on open, nine that showed retired product terms, a sign-in page that printed a demonstration password, '
    'and a sign-up of ten steps.',""",
    """    'The items follow the corporate documents of 25 September 2026, including Auto Debit (HQ-CP-02), Asset Committees '
    '(HQ-CP-01) and Seat Exchange and Points (HQ-CP-04). File locations were checked against the code: 50 of the 62 '
    'database list queries have no limit, the 18 test files cover the engines only, and the additive SQL for two user '
    'columns is written but not applied.',""")
rep("""md = ['# Work Register to Operational at 100,000 Users', '', '24 September 2026, revision 5.', '', '## Scope note', '']
body = ['<h2>Scope note</h2>']""", """md = ['# Work Register to Operational at 100,000 Users', '', '25 September 2026.', '', '## Scope', '']
body = ['<h2>Scope</h2>']""")
rep("""body.append('<h2>Summary</h2>' + DG.table(rows""", """body.append('<h2>Status by Section</h2>' + DG.table(rows""")
rep("""md += ['## Summary', '']""", """md += ['## Status by Section', '']""")
io.open(p, 'w', encoding='utf-8').write(s)
print('patched')
