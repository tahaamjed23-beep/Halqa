import mapkit as k

W, H = 2560, 2160
COLS = [40, 670, 1300, 1930]
CW, CX = 550, [x + 275 for x in COLS]

C = {
    'kyc': '#3B4C8C', 'aml': '#4A5A66', 'elig': '#1F6F6B', 'credit': '#6B3FA0',
    'feat': '#2E3A44', 'trade': '#8A3B5E', 'prev': '#B5651D', 'rec': '#9E3524',
    'rail': '#1B6FA8', 'fee': '#9A7616', 'amc': '#1E6B48', 'tak': '#16667A',
    'part': '#7A5C10',
}
FAMS = [(C['kyc'], 'Identity'), (C['aml'], 'Money-laundering controls'),
        (C['elig'], 'Eligibility and algorithms'), (C['credit'], 'Credit'),
        (C['feat'], 'Committee features'), (C['trade'], 'Positions'),
        (C['prev'], 'Default prevention'), (C['rec'], 'Recovery'),
        (C['rail'], 'Payments'), (C['fee'], 'Halqa money'),
        (C['amc'], 'Trustee and asset manager'), (C['tak'], 'Takaful'),
        (C['part'], 'Counterparties')]

ROW_A = [
    ('kyc', 'Identity', 'established before a seat is held', [
        'Phone number and a one-time passcode',
        'Application PIN, required on every open',
        'CNIC captured by camera, manual entry as fallback',
        'NADRA Verisys check against the national register',
        'Face match at exit and at high value actions',
        'Address, city and occupation captured at signup',
        'Registered account title matched to the CNIC name',
        'Payment accounts added and removed by the member',
        'Session bound to a device, revocable by the member',
        'Verification level widens the seats available',
        'Signup velocity limits and bot protection',
        'Every consent stored with hash, address and time',
    ]),
    ('aml', 'Money-laundering controls', 'held whether or not the act applies', [
        'Customer identification and verification at onboarding',
        'Beneficial owner identified on non personal accounts',
        'Screening against sanctions and exposed person lists',
        'Ongoing monitoring of behaviour against the profile',
        'Velocity limits on circle creation and joining',
        'Fraud rules on account linking and repeat submissions',
        'Append only audit log of every privileged action',
        'Record retention for the statutory period',
        'Capability to file a suspicious transaction report',
        'Position: no value is transferred and no funds are held',
        'Counsel question: the intermediary limb of the definition',
    ]),
    ('elig', 'Eligibility and algorithms', 'decides which seats are available', [
        'Internal credit score built from payment behaviour',
        'Four score bands, each opening a set of seats',
        'Affordability gate at one third of declared income',
        'Verified income reduces the assessed burden',
        'Exposure summed across every circle held',
        'Forward liability measured at the point of selection',
        'Seat bands cap that liability and gate early seats',
        'Members without history confined to the final seats',
        'Two clean circles release the confinement',
        'Pay day inferred from days collection succeeds',
        'Circle risk engine scores the roster and configuration',
        'Points to later seats: 20 per cent of fees in the last third, 10 in the middle',
        'Rewards engine issues points',
        'Discounts engine applies waivers',
        'Exit ladder engine computes the cost of leaving',
        'Reputation shown inside the circle',
        'Related accounts surfaced to the host',
    ]),
    ('credit', 'Credit', 'read on instruction, written later', [
        'Member instruction to the bureau on a dedicated screen',
        'Instruction stored with hash, address and time',
        'Report retrieved and used only to set the seat band',
        'Restriction triggers a statutory disclosure pack',
        'Bureau scores not disclosed to other members',
        'Clean completion raises standing, default lowers it',
        'Repayment history written back once permitted',
        'Dispute referred to the bureau correction process',
        'The State Bank register is closed to non banks',
    ]),
]

ROW_B = [
    ('feat', 'Committee features', 'the working surface of a circle', [
        'Guided creation wizard',
        'Join by code, by invitation or from public discovery',
        'Join sheet stating total commitment before signature',
        'Seat selected at the point of joining',
        'Collection order set by rule or by the host',
        'Minimum roster before collection begins',
        'Confirming window before the circle starts',
        'Schedule of every due date and the turn date',
        'Payment recording with a receipt naming the rail',
        'Statement covering the full position',
        'Automatic collection mandate per member and rail',
        'Reminders ahead of the due date',
        'Circle chat and notices',
        'Activity feed across every circle held',
        'Search across people and circles',
        'Published fee schedule',
        'Referral',
        'Mutual guarantee signed member to member',
        'Exit sheet showing the arithmetic before confirmation',
        'In application assistant',
        'English and Urdu interface',
    ]),
    ('trade', 'Positions', 'positions move, money does not', [
        'Seat exchange: nothing passes between members; Rs 500 fee to Halqa',
        'Seat transfer on exit at no price',
        'Listings carry a position and never an amount',
        'Host approval required on any exchange',
        'No member may pay another member for a position',
        'Asset circles held pending a leasing structure',
        'Gold circles held pending same day settlement',
    ]),
    ('prev', 'Default prevention', 'most members never reach recovery', [
        'Affordability gate before a seat is granted',
        'Forward liability gate on the earliest seats',
        'Seat band confinement by standing',
        'Host vetting of every member admitted',
        'Mutual guarantee across the roster',
        'Undertaking of ten clauses, signed and hashed',
        'Related accounts shown to the host',
        'Collection aligned to the inferred pay day',
        'Host sets the expected early payment window',
        'Escalating reminders before the due date',
        'New circles locked while a default is open',
        'Exposure ceiling across circles',
    ]),
    ('rec', 'Recovery', 'contact is the cheaper path', [
        'Scheduled delinquency sweep',
        'Grace window before anything is recorded',
        'Late ladder in three steps',
        'Penalties on Shariah circles given to charity at the close',
        'Standing damaged in proportion to the step',
        'Recovery case opened and tracked',
        'Contact leads to a recorded hardship statement',
        'Fine waived and a revised date set',
        'Cure restores standing in part',
        'Silence routes to restitution',
        'Restitution arithmetic published in advance',
        'Mutual guarantee is the instrument relied on',
        'Acceleration of the remaining balance',
        'Civil suit on the undertaking; summary suit only on a cheque',
        'No collections calls and no contact lists',
    ]),
]

ROW_C = [
    ('rail', 'Payments', 'initiation is the licensed partner’s service', [
        'Service agreement with an electronic money institution',
        'Raast as the preferred rail, which carries no charge',
        'Wallet rails charged by the wallet to the member',
        'Bank transfer and cash recorded against a reference',
        'Instruction issued, then settled on confirmation',
        'Signed callback verified before it is acted on',
        'Idempotency key on every settlement',
        'Reconciliation against the settlement report',
        'Partial payment, overpayment, refund and reversal',
        'Set off where a member collects and owes together',
        'Title inquiry before an account anchors collection',
        'No rail connected and no money moved to date',
    ]),
    ('fee', 'Halqa money', 'the only money held is the company’s own', [
        'Service fee per instalment, Rs 100 to Rs 500, flat per roster',
        'Charged in advance for a service rather than held',
        'Points issued to the later seats',
        'Fee waivers issued to the later seats',
        'Points and waivers redeemed against later fees',
        'Points for vouchers Halqa buys: Daraz, foodpanda, Careem, none contracted',
        'Referral and host rewards paid in points',
        'Distribution commission once savings are offered',
        'Agency commission where cover is taken, at 15 per cent',
        'On hyper the daily payment splits 3 ways at source',
        'Contribution to the pot, takaful contribution, fee to Halqa',
        'No share of any member to member amount',
        'No share of fund profit',
    ]),
    ('amc', 'Trustee and asset manager', 'stage two, and none of it held here', [
        'Licensed asset manager operates the fund',
        'Central Depository Company acts as trustee',
        'Trust constituted by deed on paper before any member',
        'Subscription paid to the trustee collection account',
        'Units issued in the member’s own name',
        'Halqa a distributor and MUFAP member, nothing more',
        'Execution only, with nothing recommended',
        'Income limited to distribution commission',
        'Returns disclosed as indicative and never guaranteed',
    ]),
    ('tak', 'Takaful', 'written by the operator, never here', [
        'Licensed takaful operator writes and prices the cover',
        'Contributions sit in the participants risk fund',
        'Halqa an agent under a written agency agreement',
        'Income limited to agency commission',
        'Cover mandatory on unknown committees and Hyper',
        'Claim made to the operator against the payment record',
        'Settlement paid by the operator under its own terms',
        'Underwriter, exclusions and commission all disclosed',
        'The Ordinance admits only a public company as insurer',
    ]),
]

ROW_D = [
    ('part', 'Counterparties', 'none contracted at this date', [
        'Identity: NADRA, through a corporate Verisys agreement',
        'Credit bureau: TASDEEQ, with DataCheck as the alternate',
        'Instant rail: Raast, operated by the State Bank',
        'Wallet rails: JazzCash and Easypaisa',
        'Interbank switch: 1LINK',
        'Electronic money institution: NayaPay or SadaPay',
        'Payment aggregator, for the fee only: PayFast or Safepay',
        'Trustee: Central Depository Company of Pakistan',
        'Asset manager candidate: Mahaana Wealth',
        'Takaful candidates: Pak-Qatar General Takaful, Salaam Takaful',
        'Messaging: WhatsApp Business Platform',
        'Points redemption candidates: Daraz, foodpanda, Careem',
        'Infrastructure: Vercel, Supabase, Cloudflare',
    ]),
    ('feat', 'Records', 'what the system can produce on demand', [
        'Statement of a member position, exportable',
        'Receipt for every settled payment and every payout',
        'Schedule of due dates and turn dates',
        'Payment history with rail and reference',
        'Standing history with the reason for each movement',
        'Archive of every document signed, with version and hash',
        'Append only audit log',
        'Double entry ledger with debits equal to credits',
        'Reconciliation report against the partner',
        'Full data export for the member',
    ]),
    ('feat', 'Host tools', 'the host carries the roster', [
        'Admits or declines each applicant',
        'Sees applicant standing before admission',
        'Assigns the collection order where policy allows',
        'Confirms cash and bank payments against a reference',
        'Sends a reminder to a named member',
        'Sees who is late and at which ladder step',
        'Removes a member against a published test',
        'Sets the expected payment window',
        'Sees the circle risk band and standing spread',
        'Every admission and removal recorded against the host',
    ]),
    ('rec', 'Exit', 'no single action ends a commitment', [
        'Five level exit ladder rather than a cancel button',
        'Exit sheet showing the arithmetic first',
        'Twenty four hour window before confirmation',
        'PIN and face match required to confirm',
        'Restitution settled by the leaving member',
        'Seat passes to a replacement at no price',
        'Host removal test, and a member vote where required',
        'Guarantee released only on completed restitution',
        'Exit recorded with its reason',
        'Dissolution arithmetic where a circle cannot continue',
    ]),
]

SPINE = [
    ('Prospect', ['referral, invitation or discovery']),
    ('Verified member', ['identity established and recorded']),
    ('Eligible member', ['a band of seats, not a rate']),
    ('Member in a circle', ['the arrangement is recorded', 'no member money is held']),
    ('Turn collected', ['settled member to member', 'across the licensed rail']),
    ('Circle complete', ['standing raised, record written']),
]

o = []
o.append(k.head('Halqa system map', 'Every process family, and the point on the member path at which it attaches.',
                W, FAMS, rev='Rev 4', date='25 September 2026'))

KF = [('0', 'rupees of member money held', 'at any point, in any product'),
      ('3', 'registrations needed to operate', 'none of them a financial licence'),
      ('13', 'process families', 'each attaching at a named point'),
      ('3', 'destinations a payment reaches', 'member, risk fund, Halqa'),
      ('Rs 100', 'break even fee per instalment', 'every band above that carries margin')]
KW = (W - 80 - 4 * 18) // 5
for i, (fig, cap, note) in enumerate(KF):
    o.append(k.keyfigure(40 + i * (KW + 18), 146, KW, 100, C['fee'] if i < 2 else C['elig'], fig, cap, note))

ROW_A_Y, BR_A, SP_Y, BR_B, ROW_B_Y = 272, 794, 830, 940, 980
SP_H, BOX_W = 86, 356
SP_X = [40, 460, 880, 1300, 1720, 2140]

ha = []
for i, (fam, t, s, items) in enumerate(ROW_A):
    body, h = k.cluster(COLS[i], ROW_A_Y, CW, C[fam], t, s, items)
    o.append(body); ha.append(h)

hb = []
for i, (fam, t, s, items) in enumerate(ROW_B):
    body, h = k.cluster(COLS[i], ROW_B_Y, CW, C[fam], t, s, items)
    o.append(body); hb.append(h)

ROW_C_Y = ROW_B_Y + max(hb) + 74
hc = []
for i, (fam, t, s, items) in enumerate(ROW_C):
    body, h = k.cluster(COLS[i], ROW_C_Y, CW, C[fam], t, s, items)
    o.append(body); hc.append(h)

ROW_D_Y = ROW_C_Y + max(hc) + 74
hd = []
for i, (fam, t, s, items) in enumerate(ROW_D):
    body, h = k.cluster(COLS[i], ROW_D_Y, CW, C[fam], t, s, items)
    o.append(body); hd.append(h)

for i, (name, lines) in enumerate(SPINE):
    strong = (i == 3)
    o.append(k.box(SP_X[i], SP_Y, BOX_W, SP_H, name, lines,
                   col=k.GOLD if strong else k.INK, strong=strong))
    if i < 5:
        o.append(k.arrow('M%d %d H %d' % (SP_X[i] + BOX_W, SP_Y + SP_H // 2, SP_X[i + 1] - 6), width=1.8))

o.append(k.line('M%d %d H %d' % (CX[0], BR_A, CX[3])))
for i, h in enumerate(ha):
    o.append(k.line('M%d %d V %d' % (CX[i], ROW_A_Y + h, BR_A)))
o.append(k.arrow('M%d %d V %d' % (SP_X[2] + BOX_W // 2, BR_A, SP_Y - 6), col=k.INK2, width=1.8, marker='m2'))
o.append(k.label(CX[0] + 20, BR_A - 12, 'Before a seat is held', 11, k.INK3, mono=True))

o.append(k.line('M%d %d H %d' % (CX[0], BR_B, CX[3])))
for i in range(4):
    o.append(k.line('M%d %d V %d' % (CX[i], BR_B, ROW_B_Y)))
o.append(k.arrow('M%d %d V %d' % (SP_X[3] + BOX_W // 2, BR_B, SP_Y + SP_H + 6), col=k.INK2, width=1.8, marker='m2'))
o.append(k.label(CX[0] + 20, BR_B + 24, 'While the circle runs', 11, k.INK3, mono=True))

BR_C = ROW_C_Y - 38
o.append(k.line('M%d %d H %d' % (CX[0], BR_C, 2520), col=k.GOLD, width=1.4))
for i in range(4):
    o.append(k.line('M%d %d V %d' % (CX[i], BR_C, ROW_C_Y), col=k.GOLD))
o.append(k.arrow('M2520 %d V %d H %d' % (BR_C, SP_Y + 44, SP_X[5] + BOX_W + 6),
                 col=k.GOLD, width=1.8, marker='mg'))
o.append(k.label(CX[0] + 20, BR_C - 12, 'Where the money sits, none of it with Halqa', 11, k.GOLD, mono=True))

BR_D = ROW_D_Y - 38
o.append(k.line('M%d %d H %d' % (CX[0], BR_D, CX[3])))
for i in range(4):
    o.append(k.line('M%d %d V %d' % (CX[i], BR_D, ROW_D_Y)))
o.append(k.label(CX[0] + 20, BR_D - 12, 'Counterparties, records and the paths out', 11, k.INK3, mono=True))

H = ROW_D_Y + max(hd) + 60
k.build('halqa-map-system', W, H, '\n'.join(o), png_name='HALQA-MAP-SYSTEM',
        aria='Halqa system map. A member path runs from prospect to a completed circle. Colour coded groups '
             'cover identity, money laundering controls, eligibility, credit, committee features, positions, '
             'default prevention, recovery, payments, Halqa money, the trustee and asset manager structure, '
             'takaful cover, counterparties, records, host tools and exit.')
