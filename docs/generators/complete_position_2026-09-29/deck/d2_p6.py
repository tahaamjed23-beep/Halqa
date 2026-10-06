# -*- coding: utf-8 -*-
# Part 6: law and company

divider('6', 'Law and company', 'The legal map under the bank route, the provisions quoted, the points still open '
        'for counsel, and the company Halqa must form.')

# ---- legal map
sl = slide('Legal Map',
           'Each activity, the law that governs it, and who carries the duty under the bank route. Halqa carries only '
           'the duties of a service provider and of its own company.', partner=True,
           src='Legal Position (HQ-LG-01); Bank Partnership Revisions (HQ-BK-01). Counsel to confirm each line in '
               'writing. The State Bank sandbox is not needed on the bank route; completing it is not an approval '
               '(SBP, 16 September 2026).')
rows_ = [('landmark', 'Holding and moving money', 'Banking Companies Ordinance; State Bank rules', 'Mashreq', MQ),
         ('repeat', 'Direct debit mandates', 'Payment Systems and Electronic Fund Transfers Act 2007', 'Mashreq', MQ),
         ('credit-card', 'Card, wallet and Raast payments', 'PSO/PSP Rules 2014', 'Safepay', MQ),
         ('building', 'Deposits taken by a company', 'Companies Act 2017, s.84', 'Avoided: Halqa holds nothing', L700),
         ('server', 'Halqa as a service provider', 'State Bank outsourcing framework', 'Mashreq’s board; Halqa '
                                                                                        'assessed', MQ),
         ('chart-line', 'Credit reporting', 'Credit Bureaus Act 2015', 'Mashreq or TASDEEQ, with consent', MQ),
         ('shield-check', 'Cover', 'Insurance Ordinance 2000; takaful rules', 'Mashreq, the insurer or operator', MQ),
         ('gift', 'Points bought with money', 'Electronic money rules', 'Mashreq’s product and licence', MQ),
         ('arrow-left-right', 'Turn market', 'P2P definition; Shariah', 'Counsel’s opinion before launch', AMBER),
         ('file-text', 'Undertaking and guarantee', 'Contract Act 1872; ETO 2002', 'Members to each other', L700),
         ('scale', 'Hyper fee', 'Flat service fee, never graded by day', 'Collected by Mashreq; income shared', MQ)]
for i, (ic, act, law, who, col) in enumerate(rows_):
    y = Y0 + i * 0.43
    icon(sl, ic, M, y + 0.08, 0.26)
    tb(sl, M + 0.4, y, 3.6, 0.4, act, size=10.5, bold=True, anchor=MIDDLE)
    tb(sl, M + 4.05, y, 4.3, 0.4, law, size=10, color=GREY, anchor=MIDDLE)
    line(sl, M + 8.35, y + 0.2, M + 8.75, y + 0.2, col, 1.25, arrow=True)
    tb(sl, M + 8.85, y, CW - 8.85, 0.4, who, size=10, bold=True, color=col if col != L700 else L700, anchor=MIDDLE)
    rule(sl, M + 0.4, y + 0.42, CW - 0.4)

# ---- provisions quoted
sl = slide('Provisions Quoted',
           'The provisions the design rests on, quoted from the primary texts kept in the Legal folder.',
           src='Primary texts in HALQA CORPORATE\\03 Legal\\Primary texts; each quotation checked against its source by '
               'verify_quotes.py.')
quotes = [('Companies Act 2017, s.84 Explanation', 'shall not include ... an advance against sale of goods or '
                                                   'provision of services in the ordinary course of business'),
          ('PS&EFT Act 2007, s.35(1)', 'may be authorized by the Consumer either in writing, or in any other accepted '
                                       'form'),
          ('Credit Bureaus Act 2015, s.19(1)(b)', 'on written or electronic request or instructions of the debtor, to '
                                                  'whom it relates, received from such debtor'),
          ('Electronic Transactions Ordinance 2002, s.3', 'No document, record, information, communication or '
                                                          'transaction shall be denied legal recognition ... on the '
                                                          'ground that it is in electronic form'),
          ('Contract Act 1872, s.126', 'A contract of guarantee is a contract to perform the promise, or discharge the '
                                       'liability of a third person in case of his default.'),
          ('Contract Act 1872, s.74', 'reasonable compensation not exceeding the amount so named or, as the case may '
                                      'be, the penalty stipulated for'),
          ('SECP, P2P lending definition', 'the extension of loans by the lender to the borrower through the P2P '
                                           'Lending Platform'),
          ('Code of Civil Procedure, Order XXXVII, r.2(1)', 'All suits upon bills of exchange, hundies or promissory '
                                                            'notes')]
cw2 = (CW - 0.5) / 2
for i, (src_, q) in enumerate(quotes):
    col_, row_ = divmod(i, 4)
    x = M + col_ * (cw2 + 0.5)
    y = Y0 + row_ * 1.25
    icon(sl, 'scroll-text', x, y + 0.04, 0.3)
    tb(sl, x + 0.45, y, cw2 - 0.45, 1.15, [('“' + q + '”', dict(size=11, font=DISPLAY, italic=True, gap=3,
                                                                          spacing=1.08)),
                                           (src_, dict(size=9, color=L700, bold=True))])
    if row_ < 3:
        rule(sl, x + 0.45, y + 1.17, cw2 - 0.45)

# ---- open legal points
sl = slide('Open Points for Counsel',
           'What the bank route does not settle by itself. Each is carried as a label on the product until counsel or '
           'the Shariah board rules; nothing is hidden and no feature is dropped for being non Shariah.',
           src='Bank Partnership Revisions (HQ-BK-01), legal flags; Keep every feature, label honestly (14 July 2026); '
               'Corporate Insurance Agents Regulations 2020; SBP fair treatment framework (October 2025).')
pts = [('arrow-left-right', 'Turn market', 'Whether a turn sold for money or points is a loan between members under the '
                                           'P2P definition; its Shariah standing.'),
       ('gift', 'Points bought with money', 'Confirmed as Mashreq’s stored value product, not Halqa’s.'),
       ('shield-check', 'Compulsory cover', 'Whether cover required on unknown circles and Hyper meets the rule that no '
                                            'buyer is coerced (CIA Regs 2020, reg 10(c)).'),
       ('scale', 'Hyper fee', 'That a flat service fee of this size is not consideration for money; wording never '
                              'mentions agency.'),
       ('file-text', 'Undertaking and guarantee', 'Wording of the ten clauses and the mutual guarantee; not yet reviewed '
                                                  'by counsel.'),
       ('users', 'Consumer protection', 'Fair treatment of customers: disclosures, complaints, termination.'),
       ('moon', 'Shariah labels', 'Circles with turn sales or penalties kept as income are labelled not Shariah '
                                  'reviewed.'),
       ('shield-alert', 'Money laundering', 'Whether Halqa itself becomes a reporting entity; Mashreq monitors '
                                            'transactions.')]
for i, (ic, t, d) in enumerate(pts):
    col_, row_ = divmod(i, 4)
    x = M + col_ * (cw2 + 0.5)
    y = Y0 + row_ * 1.2
    icon_disc(sl, ic, x, y + 0.05, d=0.6, fill_=C('FDF3DC'), color=AMBER)
    tb(sl, x + 0.8, y, cw2 - 0.8, 1.1, [(t, dict(size=11.5, bold=True, gap=2)), (d, dict(size=10, color=INK2))],
       spacing=1.05)

# ---- company and registrations
sl = slide('Company and Registrations',
           'Halqa is not yet incorporated. A private company needs two directors, none of them a minor, each holding '
           'shares; the registered office will be in Islamabad.',
           src='Companies Act 2017, ss.153 and 154; Islamabad Capital Territory sales tax on services, Schedule, Table-1, '
               'entry 11; Registrations and Licences Required (HQ-LD-01); Incorporation Checklist (HQ-LD-02).')
steps6 = [('building', 'Name and incorporation', 'SECP eServices: name about Rs 1,000; incorporation about Rs 1,800 to '
                                                 '2,500; 2 to 5 days'),
          ('users', 'Directors', 'Two directors (s.154); no minor (s.153(a)); directors hold shares (s.153(i))'),
          ('map-pin', 'Registered office', 'Islamabad: sales tax on IT services with the FBR for the capital, 15 per '
                                           'cent'),
          ('file-text', 'Tax number', 'NTN through IRIS, free'),
          ('landmark', 'Bank account', 'The company’s own account, for Halqa’s income only'),
          ('scale', 'Counsel opinion', 'Written opinion on the bank route, about Rs 50,000 to 100,000'),
          ('scan-face', 'NADRA', 'Verification agreement through the Nishan Pakistan portal'),
          ('message-circle', 'WhatsApp Business', 'Business verification for message templates'),
          ('smartphone', 'Google Play', 'Developer account and financial features declaration; Pakistan is not on the '
                                        'financial services verification list'),
          ('handshake', 'Mashreq', 'Services agreement and outsourcing assessment')]
for i, (ic, t, d) in enumerate(steps6):
    col_, row_ = divmod(i, 5)
    x = M + col_ * (cw2 + 0.5)
    y = Y0 + row_ * 0.98
    marker(sl, x, y + 0.14, i + 1, d=0.36, color=LIME, tc=INK, size=10)
    icon(sl, ic, x + 0.5, y + 0.16, 0.3)
    tb(sl, x + 0.95, y, cw2 - 0.95, 0.92, [(t, dict(size=11, bold=True, gap=1)), (d, dict(size=9.5, color=INK2))],
       spacing=1.04)
    if row_ < 4:
        rule(sl, x + 0.95, y + 0.94, cw2 - 0.95)
