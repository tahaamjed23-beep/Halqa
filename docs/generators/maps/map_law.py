import mapkit as k

W = 2600
C = {'permit': '#1E6B48', 'trigger': '#9E3524', 'duty': '#9A7616',
     'reg': '#1E4E8C', 'evidence': '#6B3FA0', 'intl': '#4A5A66'}
FAMS = [(C['permit'], 'Clauses that permit operation'), (C['trigger'], 'Clauses that trigger a licence'),
        (C['duty'], 'Duties that arise without a licence'), (C['reg'], 'Registrations'),
        (C['evidence'], 'Evidence and enforcement'), (C['intl'], 'Comparable jurisdictions')]

o = [k.head('Halqa law map',
            'Every clause verified against the primary text. Each clause that would trigger a licence carries the '
            'three reasons it does not reach Halqa.',
            W, FAMS, rev='Rev 4', date='25 September 2026')]


def quote(x, y, w, col, act, cite, text, note):
    lines, cur = [], ''
    limit = int((w - 52) / 6.35)
    for word in text.split():
        if len(cur) + len(word) + 1 > limit:
            lines.append(cur); cur = word
        else:
            cur = (cur + ' ' + word).strip()
    lines.append(cur)
    nlines, ncur = [], ''
    nlimit = int((w - 44) / 6.0)
    for word in note.split():
        if len(ncur) + len(word) + 1 > nlimit:
            nlines.append(ncur); ncur = word
        else:
            ncur = (ncur + ' ' + word).strip()
    nlines.append(ncur)
    h = 66 + len(lines) * 19 + 12 + len(nlines) * 18 + 14
    b = ['<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.2"/>'
         % (x, y, w, h, k.PANEL, col),
         '<rect x="%d" y="%d" width="%d" height="4" fill="%s"/>' % (x, y, w, col),
         k.label(x + 16, y + 28, act, 14, col, weight=600),
         k.label(x + 16, y + 46, cite.upper(), 10, k.INK3, mono=True)]
    b.append('<line x1="%d" y1="%d" x2="%d" y2="%d" stroke="%s" stroke-width="2"/>'
             % (x + 18, y + 58, x + 18, y + 58 + len(lines) * 19, col))
    for i, ln in enumerate(lines):
        b.append(k.label(x + 30, y + 72 + i * 19, ln, 12.5, k.INK2))
    ny = y + 72 + len(lines) * 19 + 8
    for i, ln in enumerate(nlines):
        b.append(k.label(x + 16, ny + i * 18, ln, 12, k.INK))
    return '\n'.join(b), h


COLS = [40, 920, 1800]
QW = 760
Y0 = 168

col_content = [
    [
        ('permit', 'Electronic Transactions Ordinance 2002', 'section 3',
         'No document, record, information, communication or transaction shall be denied legal recognition, admissibility, effect, validity, proof or enforceability on the ground that it is in electronic form and has not been attested by any witness.',
         'Every undertaking, schedule, payment record and default record is enforceable in the form the system holds it.'),
        ('permit', 'Credit Bureaus Act 2015', 'section 19(1)(b)',
         'on written or electronic request or instructions of the debtor, to whom it relates, received from such debtor or through a duly constituted attorney thereof',
         'The only route by which Halqa may obtain a report, since section 19(1)(a) is confined to a credit institution.'),
        ('permit', 'Companies Act 2017', 'section 84, Explanation',
         'deposit means any deposit of money with, and includes any amount borrowed by, a company, but shall not include a loan raised by issue of debentures or a loan obtained from a banking company or financial institution or an advance against sale of goods or provision of services in the ordinary course of business.',
         'The final words are the authority for charging the service fee in advance. Such a sum is revenue and is expressly not a deposit.'),
        ('evidence', 'Electronic Transactions Ordinance 2002', 'sections 7 and 9',
         'The requirement under any law for affixation of signatures shall be deemed satisfied where electronic signatures or advanced electronic signature are applied.',
         'Section 9 adds a presumption of authenticity and attribution for an advanced electronic signature.'),
        ('evidence', 'Credit Bureaus Act 2015', 'section 32',
         'Any document, record, information, communication, transaction, publication or notice, made under or for the purposes of this Act, whether required or otherwise, shall be deemed valid if made in electronic form.',
         'This is what validates a member instruction to a bureau captured in the application.'),
        ('evidence', 'Electronic Transactions Ordinance 2002', 'section 31(1)',
         'nothing in this Ordinance shall apply to: (a) a negotiable instrument ... (b) a power-of-attorney under the Powers of Attorney Act, 1881 ... (c) a trust defined to the Trust Act 1882 ... (d) a will ... (e) a contract for sale or conveyance of immovable property',
         'An electronic power of attorney is not validated, so the attorney route to a bureau report is not used. An express trust cannot be created electronically, which is why the fund trust is executed on paper.'),
    ],
    [
        ('trigger', 'Companies Act 2017', 'section 84(1) and 84(3)',
         'On and after the commencement of this Act, no company shall invite, accept or renew deposits from the public.',
         '1. Contributions settle from payer to collecting member through the electronic money institution partner, so no member money ever reaches a Halqa account. '
         '2. The fee is charged in advance for a service, which the Explanation to the same section expressly excludes from the meaning of a deposit. '
         '3. No account in the system can hold a member balance, and a configuration that would create one is refused at creation.'),
        ('trigger', 'Payment Systems and Electronic Fund Transfers Act 2007', 'section 2(s) with section 24(1)',
         'monetary value as represented by a claim on the issuer which is stored in an electronic device or Payment Instrument, issued on receipt of funds of an amount not less in value than the monetary value issued',
         '1. Halqa issues no claim on itself and receives no funds, so the two limbs of the definition are both unmet. '
         '2. Stored value would require a balance the member could spend, and no such balance exists anywhere in the data model. '
         '3. Payment initiation is a service of the licensed electronic money institution under para 7.I(f) of the 2023 regulations, offered through its interface under para 7.I(h). Halqa uses the service and does not provide it.'),
        ('trigger', 'Non-Banking Finance Companies and Notified Entities Regulations 2008', 'peer to peer chapter, S.R.O. 436(I)/2022',
         'Peer to Peer Lending shall mean the extension of loans by the lender to the borrower through the P2P Lending Platform whereas the Platform would be an intermediary providing P2P services through online medium or otherwise to the participants who have entered into an arrangement with that platform to lend or to borrow money.',
         '1. No member pays another member anything for a position, on any tier, under any setting. '
         '2. The seat fee is flat across the roster and is paid to Halqa, so it is not priced on the advance and does not read as interest. '
         '3. Members holding later seats are compensated by Halqa in points and fee waivers issued from its own revenue.'),
        ('trigger', 'Insurance Ordinance 2000', 'section 2(xxvii) with sections 5(1) and 6(1)',
         'insurance means the business of entering into and carrying out policies or contracts, by whatever name called, whereby, in consideration of a premium received, a person promises to make payment to another person contingent upon the happening of an event, specified in the contract, on the happening of which the second-named person suffers loss',
         '1. Halqa gives no promise to pay on another person loss, so the definition is not met in the first place. '
         '2. Cover is written and priced by a licensed takaful operator, and the contribution sits in the participants risk fund which the operator does not own. '
         '3. Halqa acts as agent under a contract in writing, as section 96(2) requires, and earns commission; no capital and no Commission registration of agents.'),
        ('trigger', 'Payment Systems and Electronic Fund Transfers Act 2007', 'section 4(1) and section 14(1)',
         'The State Bank may, if it finds it to be necessary in the public interest, by a written order designate a Payment System a Designated Payment System.',
         '1. Halqa operates no payment system: payments are initiated by the licensed electronic money institution, over Raast where available. '
         '2. Designation is a discretion of the State Bank rather than something an operator applies for, so there is no licence being avoided. '
         '3. Section 14(1) supervision subsists over any person in the chain, which is a supervisory relationship rather than an exemption.'),
        ('trigger', 'Companies Act 2017', 'section 9(1)',
         'No association, partnership or entity consisting of more than twenty persons shall be formed for the purpose of carrying on any business that has for its object the acquisition of gain by the association, partnership or entity, or by the individual members thereof, unless it is registered as a company under this Act.',
         '1. Each member pays in exactly what they collect, so the arrangement itself has no object of gain. '
         '2. No individual member acquires a gain from another member, which is the second limb the section requires. '
         '3. Halqa earns a fee under a contract with each member rather than as a participant in the association.'),
    ],
    [
        ('trigger', 'Companies Ordinance 1984', 'Part VIIIA, preserved by Companies Act 2017 section 509(1)',
         'sections 282A to 282N shall be applicable mutatis mutandis to Non-banking Finance Companies in a manner as if the repealed Ordinance has not been repealed',
         '1. Halqa advances nothing: the pot is other members money moving across the rail on the day it is collected. '
         '2. No rate of any kind is computed or displayed anywhere in the product, and the rate arithmetic has been removed from the code. '
         '3. The fee is consideration for a service rather than for the use of money, which is the distinction the Part turns on.'),
        ('trigger', 'Credit Bureaus Act 2015', 'section 4',
         'no person shall commence or carry on business of or function as a credit bureau without obtaining a licence from the State Bank of Pakistan',
         '1. Halqa collects, processes and stores nothing on behalf of third parties, so it does not function as a bureau. '
         '2. It is a user under section 2(v), obtaining a report on the member own instruction under section 19(1)(b). '
         '3. It may become a furnisher under section 2(j), which requires membership of a licensed bureau rather than a licence of its own.'),
        ('trigger', 'Pakistan Penal Code 1860', 'section 294-A',
         'Whoever keeps any office or place for the purpose of drawing any lottery not being a State lottery or a lottery authorized by the Provincial Government ... And whoever publishes any proposal to pay any sum ... relative or applicable to the drawing of any ticket, lot, number or figure in any such lottery',
         '1. No sum in the product is determined by the drawing of a ticket, lot, number or figure. '
         '2. Collection order is set by rule or by the host, and the random ballot option has been withdrawn. '
         '3. The prize draw surface is removed from the schema and the create route, so nothing of the kind can be published.'),
        ('duty', 'Credit Bureaus Act 2015', 'section 31',
         'such user shall provide to such debtor a copy of the credit information report relied upon, the name, address and telephone number of the credit bureau, ... a copy of the summary of rights set out in the Schedule and a statement that the credit bureau did not make the decision to take the adverse action',
         'This duty attaches whenever a report restricts a seat. It requires a screen in the application and is not yet built.'),
        ('duty', 'Credit Bureaus Act 2015', 'sections 10, 11(1) and 26',
         'The membership of other credit information furnisher, other than credit institution, to become a member of credit bureaus shall be notified by the Federal Government accordingly.',
         'Writing repayment history back is therefore conditional. Section 26 makes unauthorised access or disclosure an offence carrying a fine up to five million rupees or imprisonment up to three months.'),
        ('duty', 'Payment Systems and Electronic Fund Transfers Act 2007', 'section 35, with sections 30, 31 and 36',
         'A preauthorized Electronic Fund Transfer from a Consumer\u2019s Account may be authorized by the Consumer either in writing, or in any other accepted form ... A consumer may stop payment of a Preauthorized Electronic Fund Transfer by notifying the Financial Institution.',
         '1. Section 35(1) is the authority for taking an automatic collection mandate inside the application rather than on paper. '
         '2. The duties in sections 30, 31(1), 35(2) and 36 fall on the member’s financial institution and on the Authorized Party, the licensed partner, and not on Halqa. '
         '3. Halqa supports each by design and by contract: disclosure at the time of contracting, 21 days notice of a material change, a working stop separate from the commitment to the circle, and an alleged error reported in writing within 10 business days.'),
        ('duty', 'Anti-Money Laundering Act 2010', 'section 2(xiv) with section 2(xxxiv)',
         'financial institution includes any person carrying on any one or more of the following activities ... (d) money or value transfer ... (xii) carrying out business as intermediary',
         'Eleven limbs are plainly not met. The intermediary limb is the open question and is to be put to counsel in writing.'),
    ],
]

heights = [Y0, Y0, Y0]
for ci, items in enumerate(col_content):
    y = Y0
    for fam, act, cite, text, note in items:
        body, h = quote(COLS[ci], y, QW, C[fam], act, cite, text, note)
        o.append(body)
        y += h + 18
    heights[ci] = y

BASE = max(heights) + 16

REG = [
    ('reg', 'Registrations required', 'none of them a financial licence', [
        'Private limited company, registered with the Commission',
        'National Tax Number, then Islamabad sales tax on services',
        'Company bank account for its own revenue',
        'Service agreement with an electronic money institution',
        'Merchant agreement with a payment aggregator, for the fee only',
        'Corporate agreement for national identity verification',
        'Subscriber agreement with a licensed credit bureau',
        'Trademark filing',
    ]),
    ('reg', 'Registrations conditional on a stage', 'required only when that stage opens', [
        'Written takaful agency agreement, before cover is offered',
        'Halqa entered in the operator register of agents, section 98',
        'MUFAP membership and a distribution agreement, before savings',
        'Bureau membership as a furnisher, subject to notification',
    ]),
    ('reg', 'Not required', 'on the restructured design', [
        'Electronic money institution licence',
        'Non-banking finance company licence',
        'Peer to peer service provider permission',
        'Insurer registration',
        'Payment system designation',
        'Credit bureau licence',
        'No regulatory approval is sought and no sandbox is pursued',
    ]),
]
RW = 820
for i, (fam, t, s, items) in enumerate(REG):
    body, h = k.cluster(40 + i * 860, BASE, RW, C[fam], t, s, items)
    o.append(body)
    if i == 0:
        reg_h = h
    reg_h = max(reg_h, h)

INTL_Y = BASE + reg_h + 50
INTL = [
    ('intl', 'Comparable jurisdictions', 'how the same activity is treated elsewhere', [
        'South Africa: stokvels operate under a Reserve Bank exemption from the Banks Act',
        'South Africa: the exemption is administered with a self regulatory association',
        'India: chit funds register with state Registrars under the Chit Funds Act 1982',
        'India: the activity sits outside both the central bank and the securities regulator',
        'India: foreman commission capped at five per cent',
        'Egypt: the largest digital committee entered the central bank programme before scaling',
        'Saudi Arabia: the equivalent product tested under the monetary authority',
        'United Kingdom: the equivalent operates as an appointed representative of an authorised principal',
    ]),
    ('intl', 'Source and standing of this map', 'what was read and what was not', [
        'Companies Act 2017, gazette text, read in full',
        'Payment Systems and Electronic Fund Transfers Act 2007, read in full',
        'Credit Bureaus Act 2015, updated to August 2022, read in full',
        'Insurance Ordinance 2000, consolidated text, read in full',
        'Anti-Money Laundering Act 2010, read in full',
        'Electronic Transactions Ordinance 2002, read in full',
        'Pakistan Penal Code 1860, section 294-A, indexed text',
        'Regulations for Electronic Money Institutions 2023, read in full',
        'Corporate Insurance Agents Regulations 2020, read in full',
        'The peer to peer chapter is the one secondary source',
        'This map states a statutory position and is not legal advice',
    ]),
]
ih = 0
for i, (fam, t, s, items) in enumerate(INTL):
    body, h = k.cluster(40 + i * 1300, INTL_Y, 1220, C[fam], t, s, items)
    o.append(body); ih = max(ih, h)

H = INTL_Y + ih + 60
k.build('halqa-map-law', W, H, '\n'.join(o), png_name='HALQA-MAP-LAW',
        aria='Halqa law map. Verbatim clauses grouped into those that permit operation, those that would trigger '
             'a licence, duties that arise without one, registrations required and not required, evidence '
             'provisions, and comparable jurisdictions.')
