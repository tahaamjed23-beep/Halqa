# -*- coding: utf-8 -*-
"""Work register, revision 5 (24 September 2026, evening).

Runs the revision 4 changes, then aligns the register with the documents issued this
evening and with a check against the code, and renders it in the company format."""
import io, os, sys, re, html as H
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
exec(io.open('reg_rev5_base.py', encoding='utf-8').read())
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath('reg_rev5.py')), '..', 'pack'))
sys.path.insert(0, r'C:\Users\admin\AppData\Local\Temp\claude\D--HALQA-SIGMA-APP-HANDOVER\d2da94bb-8cec-46ca-82d6-3e3b1556f8c9\scratchpad\pack')
import docgen as DG


def retext(prefix, old, new):
    sec, i = find(prefix)
    it = sec[3][i]
    if it[0].count(old) != 1:
        raise SystemExit('retext %r: %r not found once' % (prefix, old))
    sec[3][i] = (it[0].replace(old, new),) + tuple(it[1:])


def relocate(prefix, loc):
    sec, i = find(prefix)
    it = sec[3][i]
    sec[3][i] = (it[0], loc) + tuple(it[2:])


# ------------------------------------------------------ evening of 24 September ----
rewrite('Seat graded fee payable to Halqa',
        'Flat fee payable to Halqa, the same for every seat, implementing the grid by instalment size and roster size')
rewrite('Seat price display that states a fee', 'Fee display that states the flat fee in rupees and never a rate')
relocate('Implement tier one: payment initiation', 'lib/payment-provider.ts')
rewrite('Implement tier two: collection against a token mandate',
        'Implement tier two, the auto debit: collection against a mandate held by the partner, mandatory on unknown '
        'committees and Hyper, taken from the member\'s wallet at the payment partner, with an optional backup card '
        'charged once when the wallet fails for lack of funds (HQ-CP-02)', 'lib/auto-debit.ts')
insert_after('Implement tier two, the auto debit', [
    ('Wallet linking through the partner: a linking session, authentication on the partner\'s own screen, and the wallet '
     'title returned and matched to the CNIC (HQ-CP-02)', 'new lib/partner-link.ts'),
    ('Mandate created with the roster as its permitted payees, an amount cap of one instalment and the schedule; only the '
     'mandate reference is stored (HQ-CP-02)', 'lib/auto-debit.ts'),
    ('Webhook receiver: signature and time stamp verified, messages older than five minutes or already received rejected, '
     'outcome written to the ledger in one transaction', 'new routes/partner-webhook.ts'),
    ('Wallet limit check at seat allocation: a pot that would take the collecting member\'s wallet past its monthly limit is '
     'paid to their bank account instead (EMI Regulations 2023, para 14.II(a))', 'lib/payout.ts'),
    ('Standing instruction guidance for members whose income arrives at another bank, with the date set before the due date', 'new page'),
    ('Income account verification: title inquiry, statement integrity checks, the salary pattern score, and the Hyper '
     'daily income floor of Rs 1,000 on at least five days of every week for eight weeks (HQ-MF-03)', 'lib/salary-pattern.ts'),
])
rewrite('Corporate insurance agent registration with the Commission',
        'Written agency agreement with a general takaful operator, Pak-Qatar General Takaful or Salaam Takaful, as section '
        '96(2) of the Insurance Ordinance 2000 requires, with Halqa entered in the operator\'s register of agents under '
        'section 98', 'commercial')
rewrite('Distribution agreement with a licensed takaful operator',
        'Agency agreement checked against regulation 4 of the Corporate Insurance Agents Regulations 2020, and staff who '
        'sell cover certified under regulation 22', 'legal')
insert_after('Agency agreement checked against regulation 4', [
    ('Class 6 credit takaful for unknown committees and Hyper, with the monthly product priced on the stress case at '
     'launch (HQ-MF-05)', 'commercial'),
])
rewrite('Cover offered at creation and at join on other cadences',
        'Cover mandatory on every unknown committee and on Hyper, priced per member and shown before commitment; '
        'optional on known committees', 'new page')
rewrite('SECP mutual fund distributor registration',
        'Membership of the Mutual Funds Association of Pakistan, mandatory for distributors since April 2026', 'registration')
retext('Vault route remounted only once', 'the registration is in hand', 'MUFAP membership and the distribution agreement are in hand')
retext('The vault is still reachable by link', 'until the distributor registration exists',
       'until MUFAP membership and the distribution agreement exist')
retext('Unmount the vault route', 'until the distributor registration exists', 'until MUFAP membership and the distribution agreement exist')
retext('Gate the float sweep and the mudarib fee', 'behind the distributor registration', 'behind MUFAP membership and the distribution agreement')
retext('Correct the discount constants', 'a mandatory salary account', 'a mandatory income account on unknown committees and Hyper')
retext('Discount eligibility: cheque, income, salary account', 'salary account', 'income account')
rewrite('Consent wording drafted to constitute Halqa',
        'Bureau consent step agreed with TASDEEQ, so the instruction reaches the bureau from the member. No electronic '
        'power of attorney is relied on, since the Electronic Transactions Ordinance 2002 excludes it at section 31(1)(b)', 'legal')
relocate('Score bands documented and applied only', 'lib/score-bands.ts')
rewrite('Affordability gate held at one third of declared income',
        'Affordability gate rebuilt to the five tests of the Affordability Model (HQ-MF-02), on unknown committees and '
        'Hyper only: a third of verified income, 40 per cent with TASDEEQ reported loans, and weighted load and forward '
        'liability from the fourth committee', 'lib/affordability.ts')
insert_after('Affordability gate rebuilt to the five tests', [
    ('Identity confidence score combining the name, face, address, account, phone and job checks, setting levels 1 to 3 '
     '(HQ-MF-04)', 'new lib/identity-score.ts'),
])
relocate('Exposure summed across every circle held', 'lib/exposure-score.ts')
relocate('New member confinement to the final seats', 'lib/score-bands.ts')
rewrite('SECP incorporation as a private limited company',
        'SECP incorporation as a private limited company through eZfile, with the registered office in Islamabad')
rewrite('Provincial sales tax registration',
        'Sales tax registration in the Islamabad Capital Territory; IT enabled services at 15 per cent, the classification '
        'confirmed by a tax adviser')
rewrite('Record only clause stating expressly', 'No custody clause stating expressly that Halqa holds no member money')
rewrite('Board and shareholding structure settled',
        'Board and shareholding settled before the first external agreement: the chairman\'s father as director and first '
        'chief executive, with a second adult director or as a single member company, and Taha Amjed\'s shares held as '
        'counsel advises until he is 18 (Companies Act 2017, sections 153, 154 and 186)', 'corporate')
rewrite('Write and apply the additive SQL for the two user columns',
        'Apply to production the additive SQL for the two user columns that exist in code and not in production. The SQL '
        'is written, at prisma/additive-2026-07-23-locality-jobtitle.sql', 'prisma', 'Partly done')
rewrite('Bound every unbounded query',
        'Bound every unbounded query: 50 of the 62 findMany calls in the API fetch without a limit, 21 of them in '
        'routes/committees.ts', 'halqa-api/src')
rewrite('Add a test suite for the API',
        'Extend the API test suite to the routes; the 18 test files in the service cover the engines only', 'halqa-api/tests', 'Partly done')
insert_after('Retain the swap itself as a zero premium exchange', [
    ('Seat exchange with points: fee waivers and points from Halqa to the member moving later on the published schedule, a '
     'flat Rs 500 exchange fee from the member moving earlier, and the cap of 10 per cent of a circle\'s fees (HQ-CP-04), '
     'after the opinion of counsel', 'lib/turn-swap.ts'),
    ('Points ledger: append only entries for earning, availability, reservation, redemption and expiry; redemption against '
     'fees at debit time; vouchers bought by Halqa; expiry after 24 months (HQ-CP-04)', 'new lib/points-ledger.ts'),
    ('Asset committees through a modaraba under ijarah in two configurations: catalogue, application and decision interface, '
     'handover record and monthly statement to the modaraba (HQ-CP-01), after the opinion of counsel on arranging credit',
     'lib/asset-committee.ts'),
])
rewrite('Member undertaking reviewed by counsel and framed as a liquidated demand',
        'Member undertaking reviewed by counsel: the sum owed stated after each round, enforceable by civil suit; the '
        'summary procedure of Order XXXVII applies only to a guarantee cheque', 'legal')
for k, sec in enumerate(SECTIONS):
    if sec[0] == 'C' and 'the Statutory Position of 23 September' in str(sec):
        pass
for k, sec in enumerate(SECTIONS):
    if sec[0] == 'E':
        assert 'merchant services agreement' in sec[2]
        SECTIONS[k] = (sec[0], sec[1], sec[2].replace('the merchant services agreement', 'the services agreement with the payment partner'), sec[3])


TITLES = {
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


# --------------------------------------------------------------- render ----
def items_of(sec):
    return [x for x in sec[3] if x[0] != S]


def status_of(letter, pos, item):
    if len(item) > 2:
        return item[2]
    return STATUS_BY_SECTION.get(letter, {}).get(pos, 'Open')


counts = {}
for sec in SECTIONS:
    c = {'Done': 0, 'Partly done': 0, 'Open': 0}
    for pos, it in enumerate(items_of(sec), 1):
        c[status_of(sec[0], pos, it)] += 1
    counts[sec[0]] = c
total = sum(len(items_of(s)) for s in SECTIONS)
done = sum(c['Done'] for c in counts.values())
part = sum(c['Partly done'] for c in counts.values())
openn = total - done - part
ui = sum(len(items_of(s)) for s in SECTIONS[:4])

SCOPE = [
    '%d items: %d done, %d partly done, %d open. Every status was confirmed by opening the screen or reading the code, '
    'not taken from memory.' % (total, done, part, openn),
    'The items follow the corporate documents of 25 September 2026, including Auto Debit (HQ-CP-02), Asset Committees '
    '(HQ-CP-01) and Seat Exchange and Points (HQ-CP-04). File locations were checked against the code: 50 of the 62 '
    'database list queries have no limit, the 18 test files cover the engines only, and the additive SQL for two user '
    'columns is written but not applied.',
    'Order of work: C3 is finished except the fee, pay and positions screens; C2 and C1 come next, then the rest of C. '
    'Sections A to D concern the interface, %d items; sections E to R concern everything else.' % ui,
]

md = ['# Work Register to Operational at 100,000 Users', '', '25 September 2026.', '', '## Scope', '']
body = ['<h2>Scope</h2>'] + ['<p>%s</p>' % H.escape(p) for p in SCOPE]
for p in SCOPE:
    md += [p, '']
n = 0
W = ['6%', '64%', '18%', '12%']


def open_table():
    return ('<table class="t"><colgroup>' + ''.join('<col style="width:%s">' % w for w in W) + '</colgroup>'
            '<thead><tr><th>#</th><th>Item</th><th>Location</th><th>Status</th></tr></thead><tbody>')


for letter, title, preamble, items in SECTIONS:
    md += ['## %s. %s' % (letter, title), '']
    body.append('<h2>%s. %s</h2>' % (letter, H.escape(title)))
    if preamble:
        md += [preamble, '']
        body.append('<p>%s</p>' % H.escape(preamble))
    table_open = False
    pos = 0
    for it in items:
        if it[0] == S:
            if table_open:
                md.append(''); body.append('</tbody></table>'); table_open = False
            md += ['### ' + it[1], '']
            body.append('<h3>%s</h3>' % H.escape(it[1]))
            if it[2]:
                md += [it[2], '']
                body.append('<p>%s</p>' % H.escape(it[2]))
            continue
        if not table_open:
            md += ['| # | Item | Location | Status |', '| :-: | :-- | :-- | :-: |']
            body.append(open_table())
            table_open = True
        n += 1; pos += 1
        st = status_of(letter, pos, it)
        it = (re.sub(r'\bHYPER\b', 'Hyper', it[0].replace(' — ', ': ')),) + tuple(it[1:])
        md.append('| %d | %s | %s | %s |' % (n, it[0], it[1], st))
        body.append('<tr><td>%d</td><td>%s</td><td>%s</td><td>%s</td></tr>' % (n, H.escape(it[0]), H.escape(it[1]), st))
    if table_open:
        body.append('</tbody></table>')
    md.append('')

rows = [['Section', 'Items', 'Done', 'Partly done', 'Open']]
for sec in SECTIONS:
    c = counts[sec[0]]
    rows.append([sec[0] + '. ' + H.escape(sec[1]), str(len(items_of(sec))), str(c['Done']), str(c['Partly done']), str(c['Open'])])
rows.append(['<b>Total</b>', '<b>%d</b>' % total, '<b>%d</b>' % done, '<b>%d</b>' % part, '<b>%d</b>' % openn])
body.append('<h2>Status by Section</h2>' + DG.table(rows, numeric=(1, 2, 3, 4), widths=['56%', '11%', '11%', '11%', '11%']))
body.append(DG.summary('This is the full list of work between the application today and a service that can carry 100,000 '
                       'members. %d of %d items are done or partly done. The interface comes first, then collection '
                       'through the payment partner, then the legal and platform work that has to be finished before '
                       'real money moves.' % (done + part, total)))
md += ['## Status by Section', '']
for r in rows:
    md.append('| ' + ' | '.join(re.sub('<[^>]+>', '', x) for x in r) + ' |')
text = '\n'.join(md)
for bad in ('\u2014', '\u2013', 'agent registration', 'distributor registration', 'Pak-Qatar Family', 'Provincial sales', 'Record only'):
    assert bad not in text, bad
io.open('WORK-REGISTER-rev5.md', 'w', encoding='utf-8').write(text)
outdir = os.path.join(r'C:\Users\admin\AppData\Local\Temp\claude\D--HALQA-SIGMA-APP-HANDOVER\d2da94bb-8cec-46ca-82d6-3e3b1556f8c9\scratchpad\pack\out', 'internal')
os.makedirs(outdir, exist_ok=True)
pdf = os.path.join(outdir, 'Work Register.pdf')
DG.render(pdf, 'Work Register to Operational at 100,000 Users',
          'Every item of work between the application today and a service that can carry 100,000 members, with its status.',
          'HQ-IN-02', 'Taha Amjed, Chairman', ''.join(body), classification='Internal', version='5.0',
          running='Work Register', compact=True)
print('items %d  done %d  partly %d  open %d  pages %d' % (total, done, part, openn, DG.pdf_pages(pdf)))
