import mapkit as k

W = 2560
C = {'rail': '#1B6FA8', 'trust': '#1E6B48', 'amc': '#1F6F6B', 'unit': '#6B3FA0',
     'cover': '#16667A', 'fee': '#9A7616', 'ctrl': '#2E3A44', 'risk': '#9E3524'}
FAMS = [(C['rail'], 'Rails and settlement'), (C['trust'], 'Trustee'), (C['amc'], 'Asset manager'),
        (C['unit'], 'Units and redemption'), (C['cover'], 'Takaful fund'),
        (C['fee'], 'Halqa revenue'), (C['ctrl'], 'Controls'), (C['risk'], 'What is never done')]

o = [k.head('Halqa savings, trustee and money transfer',
            'Every route money can take through the system, who owns it at each point, and the registration '
            'that permits each leg.', W, FAMS, rev='Rev 3', date='25 September 2026')]

# ---- key figures ----------------------------------------------------------
KF = [('0', 'rupees of member money held by Halqa', 'at any point, in any product'),
      ('3', 'destinations a payment can reach', 'member, risk fund, Halqa'),
      ('2', 'registrations by stage', 'distributor for savings, agent for cover'),
      ('Rs 1,000', 'minimum subscription in market', 'the structure already operates at this level')]
KW = (W - 80 - 3 * 18) // 4
for i, (fig, cap, note) in enumerate(KF):
    o.append(k.keyfigure(40 + i * (KW + 18), 150, KW, 104, C['trust'] if i < 2 else C['amc'], fig, cap, note))

# ---- the settlement path --------------------------------------------------
PY, PH = 282, 250
o.append('<rect x="40" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.4"/>'
         % (PY, W - 80, PH, k.PANEL, C['rail']))
o.append(k.label(58, PY + 28, 'Where money goes, and who owns it there', 15, C['rail'], weight=600))
o.append(k.label(58, PY + 44, 'HALQA APPEARS ON NONE OF THESE LINES AS AN OWNER', 10, k.INK3, mono=True))
o.append(k.box(58, PY + 92, 330, 110, 'Member pays', ['one debit from one account', 'split at the point of payment'], col=k.INK))
ROUTES = [
    ('Collecting member', 'the pot, settling member to member over Raast or a wallet',
     'Owner: the collecting member. Halqa records the movement only', C['rail'], 'm'),
    ('Participants risk fund', 'the takaful contribution, held by the licensed operator',
     'Owner: the participants collectively. Surplus returns to them', C['cover'], 'mp'),
    ('Trustee collection account', 'the savings subscription, paid direct to the Central Depository Company',
     'Owner: the member, through units issued in the member name', C['trust'], 'mp'),
    ('Halqa revenue account', 'the service fee, and commission earned as agent and distributor',
     'Owner: Halqa. Company revenue, not a deposit under s.84', C['fee'], 'mg'),
]
for i, (t2, l1, l2, col, mk) in enumerate(ROUTES):
    by = PY + 58 + i * 50
    o.append('<rect x="620" y="%d" width="%d" height="42" fill="%s" stroke="%s" stroke-width="1.3"/>'
             % (by, W - 700, k.PANEL, col))
    o.append(k.label(640, by + 18, t2, 13.5, col, weight=600))
    o.append(k.label(940, by + 17, l1, 12, k.INK))
    o.append(k.label(940, by + 33, l2, 11, k.INK2))
    o.append(k.arrow('M388 %d H 500 V %d H 614' % (PY + 147, by + 21), col=col, width=1.5, marker=mk))

COLS = [40, 550, 1060, 1570, 2080]
CW, CX = 470, [x + 235 for x in COLS]
R1 = 590

ROW1 = [
    ('rail', 'Rails and settlement', 'the licensed partner holds the authorisation', [
        'Service agreement with an electronic money institution',
        'Candidates: NayaPay or SadaPay',
        'Fee only, by Request to Pay: PayFast or Safepay',
        'Raast, operated by the State Bank, carries no charge',
        'Wallet rails: JazzCash and Easypaisa',
        'Interbank switch: 1LINK',
        'Bank transfer and cash recorded against a reference',
        'Instruction issued, then settled on a signed callback',
        'Signature verified before any settlement is written',
        'Idempotency key on every settlement',
        'Reconciliation against the partner’s settlement report',
        'Refund and reversal through the same rail',
        'Title inquiry before an account anchors collection',
    ]),
    ('trust', 'Trustee', 'holds the assets, never Halqa', [
        'Central Depository Company of Pakistan acts as trustee',
        'Trust constituted by deed on paper before any member joins',
        'The deed is executed between the asset manager and the trustee',
        'An express trust cannot be created electronically',
        'That is why the deed is paper and the member only subscribes',
        'Subscription paid to the trustee collection account, direct',
        'Assets held in the name of the trust for the unit holders',
        'Trustee is approved by the Commission for this role',
        'Halqa has no signing authority over the account',
    ]),
    ('amc', 'Asset manager', 'operates the fund under its own licence', [
        'Licensed asset management company manages the fund',
        'Candidate: Mahaana Wealth, a digital first manager',
        'The manager sets the investment policy, not Halqa',
        'Management fee is charged by the manager to the fund',
        'Halqa takes no share of fund profit and no management fee',
        'Halqa is a distributor, a MUFAP member, and nothing further',
        'Distribution is execution only, with nothing recommended',
        'Recommending would require an investment adviser licence',
        'Returns disclosed as indicative and never guaranteed',
    ]),
    ('unit', 'Units and redemption', 'the member owns the units', [
        'Units issued in the member own name, in the member own account',
        'Issued at the applicable net asset value on the dealing day',
        'Statement of holdings available to the member at any time',
        'Redemption requested by the member, settled by the trustee',
        'Proceeds return to the member own account, direct',
        'Halqa neither holds nor routes the redemption proceeds',
        'Minimum subscription in market is around Rs 1,000',
        'A pot may be directed into units at the member choice',
        'That choice is made at payout and is never a default',
    ]),
    ('cover', 'Takaful fund', 'a fund, not a balance sheet item', [
        'Contributions sit in the participants risk fund',
        'The fund belongs to the participants, not to the operator',
        'Operator manages it for a stated fee and never owns it',
        'Claims are paid from the fund on a member default',
        'Surplus at period end is distributable to participants',
        'A deficit is met by an interest free advance from the operator',
        'That advance is recovered from later surpluses',
        'Halqa acts as agent under a written agency agreement',
        'Candidates: Pak-Qatar General Takaful, Salaam Takaful',
    ]),
]
hs = []
for i, (fam, t, s, items) in enumerate(ROW1):
    body, h = k.cluster(COLS[i], R1, CW, C[fam], t, s, items)
    o.append(body); hs.append(h)

R2 = R1 + max(hs) + 64
ROW2 = [
    ('rail', 'Collection ladder', 'three tiers, chosen by cost', [
        'Tier 1: initiation by the partner, one approval in the application',
        'Default on known monthly circles, over Raast where available',
        'Tier 2: auto debit from the member’s wallet at the partner',
        'Mandatory on unknown committees and on Hyper',
        'Tier 3: the member sends over Raast, always available',
        'Request to Pay collects Halqa’s own fee, never a contribution',
        'A percentage rail against a flat fee worsens as the instalment grows',
        'Rs 2,500 instalment at 1.5 per cent is 38 per cent of a Rs 100 fee',
        'Rs 20,000 instalment at 1.5 per cent is 60 per cent of a Rs 500 fee',
        'Rs 450 Hyper instalment at 1.5 per cent is 9 per cent of the fee',
        'Whether the charge can be passed to the payer is for the partner',
    ]),
    ('fee', 'Halqa revenue', 'the only money Halqa owns', [
        'Service fee on every instalment collected',
        'Flat across the roster, never graded by collection day',
        'Charged in advance for a service, which is not a deposit',
        'Agency commission from the takaful operator',
        'Distribution commission from the asset manager',
        'Fill uplift where Halqa rather than the host completes a roster',
        'Rehabilitation fee where a defaulted position is restored',
        'No share of any member to member amount',
        'No share of fund profit and no management fee',
        'All of it lands in the company account, never a member account',
    ]),
    ('ctrl', 'Controls on the money', 'what keeps the legs separate', [
        'Three destinations resolved at the point of payment',
        'Separate ledger accounts, reconciled independently',
        'Double entry with debits equal to credits, asserted in test',
        'Idempotency key on every settlement',
        'Append only audit log on every privileged action',
        'Daily reconciliation against the partner’s report',
        'Monthly reconciliation against the trustee statement',
        'Monthly reconciliation against the operator statement',
        'No account in the system can hold a member balance',
        'A configuration that would create one is refused at creation',
    ]),
    ('ctrl', 'Registrations for each leg', 'and what each one permits', [
        'Partner service agreement: permits initiation through its interface',
        'Written agency agreement: permits distributing cover',
        'The operator keeps Halqa on its register of agents',
        'MUFAP membership: required to distribute funds',
        'Distribution agreement with the asset manager',
        'The agency carries no capital requirement',
        'Not required: electronic money institution licence',
        'Not required: non banking finance company licence',
        'Not required: insurer registration',
        'Not required: payment system designation',
    ]),
    ('risk', 'What is never done', 'the lines that are not crossed', [
        'No member money is held, at any point, in any product',
        'No balance is issued and no stored value is created',
        'No pooled account sits under Halqa control',
        'No payout is routed through a Halqa account',
        'No float is earned on money in transit',
        'No security deposit is held and no payout is withheld',
        'No yield is accrued on anything Halqa holds',
        'No foreign exchange is held on a remittance circle',
        'No fund profit is shared and no management fee is charged',
        'No investment advice is given at any point',
    ]),
    ('risk', 'Failure handling', 'what happens when a leg breaks', [
        'Partner outage: initiation suspended, members directed to tier 3',
        'Failed callback: retried on a schedule, then surfaced in the app',
        'Duplicate settlement: blocked by the idempotency key',
        'Payment taken in error: reversed on the same rail, ledger reversed',
        'Trustee dealing delay: the member is told, nothing is advanced',
        'Operator claim dispute: escalated by the member, Halqa supplies records',
        'Reconciliation break: payouts held on that circle until cleared',
        'Rail cost change: republished before the next cycle opens',
        'No shortfall is ever covered from Halqa working capital',
    ]),
]

_all = ROW1 + ROW2
ROW1, ROW2 = _all[:5], _all[5:10]
ROW3 = _all[10:]
hs2 = []
for i, (fam, t, s, items) in enumerate(ROW2):
    body, h = k.cluster(COLS[i], R2, CW, C[fam], t, s, items)
    o.append(body); hs2.append(h)

if ROW3:
    R3 = R2 + max(hs2) + 64
    hs3 = []
    for i, (fam, t, s, items) in enumerate(ROW3):
        body, h = k.cluster(COLS[i], R3, CW, C[fam], t, s, items)
        o.append(body); hs3.append(h)
    BR3 = R3 - 34
    o.append(k.line('M%d %d H %d' % (CX[0], BR3, CX[min(len(ROW3) - 1, 4)])))
    for i in range(len(ROW3)):
        o.append(k.line('M%d %d V %d' % (CX[i], BR3, R3)))
    _tail = R3 + max(hs3)
else:
    _tail = R2 + max(hs2)

BR = R1 - 34
o.append(k.line('M%d %d H %d' % (CX[0], BR, CX[4])))
for i in range(5):
    o.append(k.line('M%d %d V %d' % (CX[i], BR, R1)))
o.append(k.label(CX[0] + 18, BR - 12, 'Who holds what, and under whose licence', 11, k.INK3, mono=True))

BR2 = R2 - 34
o.append(k.line('M%d %d H %d' % (CX[0], BR2, CX[4])))
for i in range(5):
    o.append(k.line('M%d %d V %d' % (CX[i], BR2, R2)))
o.append(k.label(CX[0] + 18, BR2 - 12, 'What Halqa earns, what keeps it separate, and what never happens',
                 11, k.INK3, mono=True))

H = _tail + 60
k.build('halqa-map-money', W, H, '\n'.join(o), png_name='HALQA-MAP-SAVINGS-AND-MONEY',
        aria='Halqa savings, trustee and money transfer map. A settlement path showing four destinations a payment '
             'can reach and who owns the money at each, then groups covering rails and settlement, the trustee, the '
             'asset manager, units and redemption, the takaful fund, Halqa revenue, controls, registrations, what is '
             'never done, and failure handling.')
