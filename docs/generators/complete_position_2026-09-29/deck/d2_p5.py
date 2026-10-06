# -*- coding: utf-8 -*-
# Part 5: evidence and competition

divider('5', 'Evidence and competition', 'Twenty five attempts to digitise the committee, why most failed, the four '
        'models that worked, how other countries regulate committees, the competition in Pakistan, Oraan in detail, '
        'and the loan app precedent that shapes every permission Halqa asks for.')

# ---- timeline of attempts
sl = slide('Twenty Five Attempts',
           'Every failure held member money without the right licence, guaranteed payouts it could not carry, or '
           'removed the rotation. Every lasting success kept the money with a regulated party or paid the full cost of '
           'holding it.',
           src='Committee Dossier, 6 August 2026 (21 attempts and 4 models that work); JazzCash release notes, 23 August '
               '2026; Oraan Research (HQ-RS-01). Figures are as reported.')
caption(sl, M, Y0, 10, 'Attempts and events, 1991 to 2026, in order')
ev = [('1991', 'Punjab cooperatives collapse', 'Rs 10 to 23bn lost; up to 2.6m accounts', RED),
      ('2013', 'Saradha, India', '₹2,500 crore; 1.7m depositors; new law in 2019', RED),
      ('2010 to 2019', 'eMoneyPool', 'reported to credit bureaus; closed on guarantee costs', RED),
      ('2017', 'Mapan bought by GO-JEK', 'village organisers paid a commission', L700),
      ('2018', 'Yahoo Tanda', 'about 37,000 installs; closed in five months', RED),
      ('2022', 'Esusu valued at US$1bn', 'after moving from circles to rent reporting', L700),
      ('2022', 'Facebook organiser; TAG', 'Rs 420m in 117 committees; approvals revoked', RED),
      ('2019 to 2023', 'Braid', 'frozen by its sponsor bank', RED),
      ('2024', 'SadaPay sold', 'reported below US$50m, against US$120m before', GREY),
      ('2025', 'Money Fellows profitable', 'US$1.5bn processed; 2m+ circles', L700),
      ('2026', 'JazzCash Committee', 'launched 13 August 2026', AMBER)]
ty = Y0 + 2.35
rule(sl, M, ty, CW, INK, 1.25)
n_ev = len(ev)
slot = CW / n_ev
for k, (yr, t, d, col) in enumerate(ev):
    xc = M + slot * (k + 0.5)
    oval(sl, xc - 0.09, ty - 0.09, 0.18, col)
    up = k % 2 == 0
    lw_ = 2.05
    y_txt = ty - 1.75 if up else ty + 0.55
    line(sl, xc, ty - 0.09 if up else ty + 0.09, xc, (y_txt + 1.2) if up else y_txt, GREY_LT, 0.75)
    tb(sl, xc - lw_ / 2, y_txt, lw_, 1.2, [(yr, dict(size=9, bold=True, color=GREY, align=CEN, gap=1)),
                                          (t, dict(size=10, bold=True, color=col if col != GREY else INK, align=CEN,
                                                   gap=1)),
                                          (d, dict(size=8.5, color=INK2, align=CEN))], spacing=1.02,
       anchor=BOTTOM if up else TOP)
tb(sl, M, Y0 + 4.75, CW, 0.3, 'Red: failed or frozen. Green: scaled. Amber: the wallet threat. Also reviewed: '
   'UBL Kommittee, Puddle, StokFella, Kenya’s chamas, khata applications, MyPaisaa, Hakbah, The Money Club, '
   'Oraan.', size=9, color=GREY)

# ---- eight causes
sl = slide('Eight Causes of Failure',
           'Each failed product removed something the committee needs or added something it rejects. The bank route '
           'answers each cause with a structural choice rather than a promise.',
           src='Committee Dossier, 6 August 2026. Answers describe the design under decisions D1 to D16.')
causes = [('building', 'Holding the pool', 'Punjab cooperatives, TAG, a 2022 Facebook organiser, Saradha',
           'Mashreq holds the money under its licence'),
          ('shield-x', 'Guaranteeing payouts', 'eMoneyPool', 'Priced cover chosen by Mashreq; hard stop on Hyper'),
          ('users', 'Pooling strangers', 'Yahoo Tanda, Puddle', 'Known circles first; bands and income checks on '
                                                                 'unknown circles'),
          ('circle-x', 'Removing the early pot', 'UBL Kommittee', 'The rotation is kept'),
          ('percent', 'Adding interest', 'UBL Kommittee, auction models', 'One flat fee; no auction; profit returned '
                                                                          'as points'),
          ('file-x', 'Records without payments', 'Udhaar, DigiKhata committee registers', 'Every payment settled by '
                                                                                          'the bank'),
          ('coins', 'Charging the member heavily', 'Razq, a Pakistani attempt that failed on fees', 'Fee lowered by the bank’s income '
                                                                            'share'),
          ('gavel', 'Rules written after a scandal', 'India after Saradha; loan apps in 2023', 'Inside a bank’s '
                                                                                               'licence from day one')]
cw2 = (CW - 0.5) / 2
for i, (ic, t, cases, ans) in enumerate(causes):
    col_, row_ = divmod(i, 4)
    x = M + col_ * (cw2 + 0.5)
    y = Y0 + row_ * 1.22
    icon_disc(sl, ic, x, y + 0.08, d=0.62, fill_=C('FBE9E6'), color=RED)
    tb(sl, x + 0.8, y, cw2 - 0.8, 1.15, [([('%d  ' % (i + 1), dict(size=11, bold=True, color=RED)),
                                            (t, dict(size=11.5, bold=True))], dict(gap=1)),
                                          (cases, dict(size=9, color=GREY, gap=3)),
                                          ([('Answer  ', dict(size=9.5, bold=True, color=L700)),
                                            (ans, dict(size=10))], {})], spacing=1.04)
    if row_ < 3:
        rule(sl, x + 0.8, y + 1.15, cw2 - 0.8)

# ---- ubl kommittee
sl = slide('UBL Kommittee',
           'A bank has already sold a product under the committee name. It removed the rotation, the peers and the '
           'early pot and added a small fixed bonus. It shows what a committee becomes when a balance sheet designs '
           'it, and why the bank route keeps the rotation.',
           src='UBL product terms as reviewed in the Committee Dossier, 6 August 2026. The annual rate is Halqa’s '
               'calculation on an average balance of about Rs 1.25 million.')
caption(sl, M, Y0, 6.3, '24 months at Rs 100,000 a month, Rs thousand')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, M - 0.05, Y0 + 0.3, 6.4, 3.4, ['Paid in', 'Received'],
      [('Rs k', [2400, 2500])], point_colors=[GREY_LT, L700], fmt='#,##0', gap=110, size=10,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=2900)
stat_rows(sl, M, Y0 + 3.85, 6.3, [
    ('percent', 'About 2%', 'a year: a Rs 100,000 bonus on an average balance of about Rs 1.25 million'),
    ('calendar-days', '12, 18, 24', 'months, with a bonus of a quarter, a half or one instalment'),
], rh=0.5, num_w=1.3, isz=0.26, size=9.5, nsize=13)
x0 = 7.25
heading(sl, x0, Y0, W - M - x0, 'What it removed, and the bank route')
icon_rows(sl, x0, Y0 + 0.45, W - M - x0, [
    ('repeat', 'No rotation.', 'Nobody collects early, so the credit half of the committee is gone. The bank route keeps '
                               'the rotation.'),
    ('users', 'No peers.', 'No group, so an “instalment holiday” is possible. A committee could never offer one '
                           'and stay a committee.'),
    ('percent', 'Interest.', 'A fixed return on deposits, the form committee culture defines itself against. The bank '
                             'route has a flat fee and profit returned as points.'),
    ('circle-alert', 'The lesson for Mashreq.', 'Keep the circle intact and let the bank hold the money; do not turn the '
                                                'committee into a deposit product.'),
], rh=1.02, size=10, isz=0.28, disc=True)

# ---- models that work
sl = slide('The Models That Work',
           'Four markets where digital committees reached scale. Each shows one thing Halqa copies, and one it does '
           'not.',
           src='Company disclosures and the press, as reported in the Committee Dossier, 6 August 2026. US dollar '
               'figures are the companies’ own.')
cases = [('Egypt', 'Money Fellows', ['8 million downloads, about 350,000 active a month', 'US$1.5 billion processed; '
                                     'profitable in 2025', 'Under 8% of slots need its own capital'],
          'Prices the seat and started in the central bank’s sandbox, then Banque Misr', 'It is the counterparty to '
                                                                                             'every circle'),
         ('Saudi Arabia', 'Hakbah', ['1.3 million users', 'Central bank sandbox permit since 2020'],
          'Made the regulator its first partner', 'It waits on dedicated savings rules'),
         ('Indonesia', 'Mapan', ['Bought by GO-JEK in 2017', 'Village leaders as agents on 10% and 5% commission'],
          'Grew through organisers; goods pots cut default', 'Commission tied to recruitment'),
         ('India', 'The Money Club', ['About 200,000 users and 17,000 clubs', 'Graduated exposure'],
          'Small clubs first; a clean history opens bigger ones', 'Auction discounts, which Halqa refuses')]
cw4 = (CW - 3 * 0.25) / 4
for i, (ctry, name, facts, copy_, not_) in enumerate(cases):
    x = M + i * (cw4 + 0.25)
    icon(sl, 'globe', x, Y0 + 0.02, 0.3)
    tb(sl, x + 0.4, Y0, cw4 - 0.4, 0.34, ctry, size=10.5, bold=True, color=GREY)
    tb(sl, x, Y0 + 0.4, cw4, 0.45, name, size=17, color=L700, font=DISPLAY)
    rule(sl, x, Y0 + 0.9, cw4, L700, 1.0)
    bullets(sl, x, Y0 + 1.02, cw4, 1.4, facts, size=10, gap=3)
    icon(sl, 'circle-check', x, Y0 + 2.55, 0.24)
    tb(sl, x + 0.34, Y0 + 2.5, cw4 - 0.34, 0.9, [('Copy', dict(size=9, bold=True, color=L700, gap=1)),
                                                 (copy_, dict(size=10))], spacing=1.04)
    icon(sl, 'circle-x', x, Y0 + 3.5, 0.24, RED)
    tb(sl, x + 0.34, Y0 + 3.45, cw4 - 0.34, 0.8, [('Do not copy', dict(size=9, bold=True, color=RED, gap=1)),
                                                  (not_, dict(size=10))], spacing=1.04)
tb(sl, M, Y0 + 4.5, CW, 0.5, [[('Five laws  ', dict(size=10.5, bold=True, color=L700)),
                              ('keep the instrument intact; price the position, not the membership; grow through the '
                               'organiser; underwrite with history, not documents; make the regulator a partner before '
                               'scale.', dict(size=10.5))]], spacing=1.05)

# ---- regulation abroad
sl = slide('How Other Countries Regulate Committees',
           'Where a platform touches the money, the central bank regulates it. Where a dedicated law exists, a registrar '
           'does. Nowhere is it the securities regulator.',
           src='Note on international jurisdictions, 22 September 2026; Committee Dossier, 6 August 2026 (India).')
jur = [('Egypt', 'Central Bank of Egypt', 'Money Fellows in the central bank sandbox; the financial regulator’s '
                                          'separate sandbox does not cover committees', L700),
       ('Saudi Arabia', 'Saudi Central Bank', 'Hakbah under a sandbox permit since 2020, awaiting dedicated savings '
                                             'rules', L700),
       ('South Africa', 'Reserve Bank exemption', 'Stokvels exempt from the Banks Act, conditional on NASASA '
                                                  'self-regulation', LIME),
       ('India', 'State Registrars of Chits', 'Chit Funds Act 1982; outside the central bank and the securities '
                                              'regulator', AMBER),
       ('United Kingdom', 'Financial Conduct Authority', 'StepLadder as an appointed representative of an authorised '
                                                         'firm', LIME)]
cw5 = (CW - 4 * 0.2) / 5
for i, (ctry, reg, d, col) in enumerate(jur):
    x = M + i * (cw5 + 0.2)
    rect(sl, x, Y0, cw5, 0.08, col)
    icon(sl, 'landmark', x, Y0 + 0.22, 0.34, col if col != LIME else L700)
    tb(sl, x, Y0 + 0.65, cw5, 0.35, ctry, size=13, color=INK, font=DISPLAY)
    tb(sl, x, Y0 + 1.02, cw5, 0.5, reg, size=10, bold=True, color=L700)
    tb(sl, x, Y0 + 1.5, cw5, 1.1, d, size=9.5, color=INK2, spacing=1.05)
heading(sl, M, Y0 + 2.75, CW, 'India, the controlled experiment')
stat_rows(sl, M, Y0 + 3.15, CW / 2 - 0.2, [
    ('shield', '100%', 'security deposit by the organiser for each scheme'),
    ('percent', '5% to 7%', 'cap on the organiser’s commission, raised in 2019'),
    ('gavel', '30%', 'cap on the auction discount'),
], rh=0.5, num_w=1.1, isz=0.26, size=9.5, nsize=13)
stat_rows(sl, M + CW / 2 + 0.2, Y0 + 3.15, CW / 2 - 0.2, [
    ('triangle-alert', '₹2,500 cr', 'lost in Saradha, 2013, by about 1.7 million depositors'),
    ('ban', '2019', 'Banning of Unregulated Deposit Schemes Act'),
    ('trending-down', '< US$1m', 'raised by MyPaisaa, the first fully digital registered operator'),
], rh=0.5, num_w=1.2, isz=0.26, size=9.5, nsize=13)

# ---- competition map
sl = slide('Competition',
           'Who holds the money and how the price is set separate every provider. Halqa with Mashreq is the only one '
           'with a bank holding the money and one flat fee for every seat.', partner=True,
           src='Positions as reviewed on 28 September 2026: JazzCash release notes and SPIN IDG; Oraan’s terms and fee '
               'calculator; UBL product terms; Money Fellows disclosures.')
gx, gy, gw_, gh_ = M + 1.0, Y0 + 0.05, 7.2, 4.5
rect(sl, gx, gy, gw_, gh_ / 2, LIME_XLT)
rect(sl, gx, gy + gh_ / 2, gw_, gh_ / 2, PAPER)
line(sl, gx, gy + gh_, gx + gw_ + 0.15, gy + gh_, INK, 1.0, arrow=True)
line(sl, gx, gy + gh_, gx, gy - 0.12, INK, 1.0, arrow=True)
for k, t in enumerate(('An organiser', 'A platform company', 'A bank')):
    tb(sl, gx + k * gw_ / 3, gy + gh_ + 0.06, gw_ / 3, 0.25, t, size=9.5, color=GREY, align=CEN)
    if k:
        line(sl, gx + k * gw_ / 3, gy, gx + k * gw_ / 3, gy + gh_, RULE, 0.75, dash=True)
tb(sl, gx, gy + gh_ + 0.3, gw_, 0.25, 'Who holds the money', size=9.5, bold=True, align=CEN)
tb(sl, M - 0.2, gy + 0.3, 1.15, 0.6, 'Flat fee or none', size=9, color=GREY, align=R)
tb(sl, M - 0.2, gy + gh_ - 0.9, 1.15, 0.8, 'Priced by payout month, or interest', size=9, color=GREY, align=R)
dots = [('Informal committee', 0.45, 0.18, GREY), ('JazzCash Committee', 0.55, 0.42, AMBER),
        ('Oraan', 1.45, 0.83, RED), ('Money Fellows', 1.65, 0.66, GREY), ('UBL Kommittee', 2.3, 0.85, GREY),
        ('Halqa with Mashreq', 2.45, 0.14, L700)]
for n_, xf, yf, col in dots:
    px, py = gx + xf * gw_ / 3, gy + yf * gh_
    oval(sl, px - 0.13, py - 0.13, 0.26, LIME if 'Halqa' in n_ else col)
    if xf > 2.0:
        tb(sl, px - 2.45, py - 0.16, 2.25, 0.32, n_, size=10.5, bold='Halqa' in n_, align=R,
           color=L700 if 'Halqa' in n_ else INK)
    else:
        tb(sl, px + 0.2, py - 0.16, 2.3, 0.32, n_, size=10.5, color=INK)
x0 = M + 8.75
icon_rows(sl, x0, Y0, W - M - x0, [
    ('smartphone', 'JazzCash Committee.', 'The pot collects in the organiser’s wallet and the organiser pays out. '
                                          'Fees not published. The largest reach.'),
    ('building', 'Oraan.', 'Its own accounts, no financial licence; early seats up to 21 per cent of the instalment a '
                           'month.'),
    ('landmark', 'UBL Kommittee.', 'A bank deposit under the committee name; no rotation.'),
    ('globe', 'Money Fellows.', 'Licensed, the counterparty to every circle, seats priced.'),
    ('users', 'Informal.', 'The organiser holds cash; 12 per cent of users have lost money.'),
], rh=0.92, size=9.5, isz=0.24, rules=True)

# ---- jazzcash
sl = slide('JazzCash Committee',
           'The largest wallet in Pakistan shipped a committee feature in August 2026. It rotates, but the pot sits in '
           'the organiser’s wallet and the organiser pays out by hand. The threat is reach, not design.',
           src='JazzCash application version 5.6.7 release note, 23 August 2026 (App Store); SPIN IDG on the 13 August '
               'launch; JazzCash reach as publicly stated. Features as observed; fees were not published.')
feat = [('Rotating turns', True, True), ('Money held by', 'Organiser’s wallet', 'Mashreq accounts'),
        ('Payout', 'Organiser, by hand', 'Automatic, same day'), ('Order', 'Set by the organiser', 'Chosen within bands'),
        ('Exit before the end', False, True), ('Credit record from payments', False, True),
        ('Income and affordability checks', False, True), ('Cover for a default', False, True),
        ('Members from', 'Phone contacts, 3 to 12', 'Known or matched circles, 6 to 400'),
        ('Fees', 'Not published', 'One flat fee, published')]
tb(sl, M + 3.4, Y0, 2.6, 0.3, 'JazzCash Committee', size=11, bold=True, color=AMBER)
tb(sl, M + 6.25, Y0, 2.6, 0.3, 'Halqa with Mashreq', size=11, bold=True, color=L700)
rule(sl, M, Y0 + 0.35, 8.9, L700, 1.0)
for i, (t, a, b) in enumerate(feat):
    y = Y0 + 0.4 + i * 0.44
    tb(sl, M, y, 3.3, 0.42, t, size=10.5, bold=True, anchor=MIDDLE)
    for x, v in ((M + 3.4, a), (M + 6.25, b)):
        if v is True:
            tick(sl, x, y + 0.1, 0.22, L700, 2.0)
        elif v is False:
            cross(sl, x + 0.02, y + 0.12, 0.18, RED, 1.8)
        else:
            tb(sl, x, y, 2.75, 0.42, v, size=10, anchor=MIDDLE)
    rule(sl, M, y + 0.44, 8.9)
x0 = M + 9.3
heading(sl, x0, Y0, W - M - x0, 'Reach')
stat_rows(sl, x0, Y0 + 0.42, W - M - x0, [
    ('users', '~50m', 'registered users'), ('store', '1m', 'merchants'), ('calendar-days', '13 Aug', '2026 launch'),
], rh=0.55, num_w=0.95, isz=0.26, size=9.5, nsize=14)
tb(sl, x0, Y0 + 2.3, W - M - x0, 2.6, 'An electronic money institution holds balances by licence, so it cannot offer a '
   'circle whose money never sits in one person’s wallet. A bank partner and a credit record are what a wallet '
   'feature does not give.', size=10, color=INK2, spacing=1.08)

# ---- oraan
sl = slide('Oraan in Detail',
           'The closest competitor. Its committee company holds members’ money in its own bank accounts without a '
           'financial licence, keeps the return, and carries defaults on its own balance sheet.',
           src='Oraan Research (HQ-RS-01), 28 September 2026: Oraan’s terms, the SECP and Singapore registers, '
               'tasdeeq.com/members, the Karandaaz case study, ImpactAlpha (1 October 2021) and the press.')
caption(sl, M, Y0, 6.4, 'Structure and money route')
box(sl, M + 1.6, Y0 + 0.35, 3.2, 0.72, [('ORAAN PTE. LTD., Singapore', dict(size=10.5, bold=True, align=CEN)),
                                         ('UEN 201813537G, 20 April 2018; publishes the apps', dict(size=8.5, color=GREY,
                                                                                                   align=CEN))],
    anchor=MIDDLE)
box(sl, M, Y0 + 1.45, 3.05, 0.95, [('Oraan Tech (Pvt) Ltd', dict(size=10.5, bold=True, gap=1)),
                                   ('Runs the committees and holds the money. No financial licence', dict(size=9,
                                                                                                         color=GREY))],
    line=RED)
box(sl, M + 3.35, Y0 + 1.45, 3.05, 0.95, [('Oraan Financial Services', dict(size=10.5, bold=True, gap=1)),
                                          ('SECP lending licence from 3 June 2024; the TASDEEQ member',
                                           dict(size=9, color=GREY))])
line(sl, M + 3.2, Y0 + 1.08, M + 1.52, Y0 + 1.43, L700, 1.0, arrow=True)
line(sl, M + 3.2, Y0 + 1.08, M + 4.87, Y0 + 1.43, L700, 1.0, arrow=True)
flow(sl, M, Y0 + 2.75, 6.4, 1.0, [('Member', '1BILL invoice or transfer'), ('1LINK', 'the switch; holds nothing'),
                                  ('Oraan Tech account', 'at its bank; “Amanat”'),
                                  ('Payout', 'net, 11th to 18th')], gap=0.22, size=8.5, head_size=10,
     lines=[RULE, RULE, RED, RULE])
tb(sl, M, Y0 + 3.85, 6.4, 1.1, 'Dubai Islamic Bank is named once, in 2021, as the partner bank for payouts: Oraan’s '
   'banker, not a guarantor, owner, lender or supervisor. In 2026 the platform was licensed to an unnamed bank '
   'abroad.', size=9.5, color=GREY, spacing=1.06)
x0 = 7.3
icon_rows(sl, x0, Y0, W - M - x0, [
    ('percent', 'Fees.', 'By month of payout: 21, 19, 16.5, 13.5, 10, 6 and 2 per cent of the instalment a month on a '
                         'ten month committee; about 54 per cent a year for the first seat.'),
    ('coins', 'Return.', '“Any return earned by Oraan during the period will be solely the right of Oraan.”'),
    ('shield-x', 'Default.', '30 days after payout: the whole balance recalled with legal costs, 30 days’ notice, a '
                             'suit, a bureau report, family payouts held back.'),
    ('chart-line', 'Scoring.', 'A device score reading installed apps, web history and bookmarks; TASDEEQ reports on '
                               'defaulters only.'),
    ('users', 'Members.', 'The only paying count ever published is 10,000 (2021); 600,000 counts accounts.'),
    ('handshake', 'Funding.', 'US$3m seed in 2021; a Karandaaz grant funded by the Gates Foundation; no Series A '
                              'published.'),
], rh=0.8, size=9.5, isz=0.24, disc=True)

# ---- loan apps
sl = slide('The Loan App Precedent',
           'About 400 predatory loan apps were blocked in 2023 and 2024. Every permission Halqa asks for, and every '
           'feature that could look extractive, is read against them.',
           src='SECP circulars 3, 10, 14 and 15 of 2023 and 8 of 2024; Google Play policy of 31 May 2023; press reports '
               'of the Rawalpindi case. Nano-lending review, 2 August 2026.')
heading(sl, M, Y0, 5.9, 'How they worked')
flow(sl, M, Y0 + 0.42, 5.9, 1.2, [('Lend', 'Rs 1,000 to 25,000 for 7 to 90 days'),
                                  ('Harvest', 'contacts, photos, messages'),
                                  ('Shame', 'calls to relatives, altered photos'),
                                  ('Roll over', 'app to app debt')], gap=0.2, size=9, head_size=10.5,
     lines=[RULE, RED, RED, RED])
tb(sl, M, Y0 + 1.72, 5.9, 0.6, 'A Rawalpindi case, Rs 13,000 borrowed and Rs 100,000 demanded, ended in a suicide and '
   'more than twenty arrests.', size=9.5, color=GREY, spacing=1.05)
heading(sl, M, Y0 + 2.35, 5.9, 'What was banned, mostly even with consent', size=12)
bullets(sl, M, Y0 + 2.75, 5.9, 2.2, [
    'SECP: no contacts or gallery; contact only a consented guarantor; Rs 25,000 cap an app; key fact statement; data '
    'kept in Pakistan', 'Google Play: no contacts, photos, precise location or storage for personal loan apps',
    'A published whitelist of permitted lenders'], size=10, gap=4)
x0 = 6.85
heading(sl, x0, Y0, W - M - x0, 'Features that could read the same way, and the answer')
icon_rows(sl, x0, Y0 + 0.42, W - M - x0, [
    ('shopping-bag', 'Selling savers’ goals as leads.', 'Refused; a merchant pays a commission for a better price '
                                                             'on a goal instead.'),
    ('users', 'A public list of defaulters.', 'Refused; the flag stays inside the member’s own circles.'),
    ('repeat', 'A debit that cannot be stopped.', 'The mandate can be cancelled, with a reason; the circle commitment '
                                                  'stays.'),
    ('coins', 'Late fees as profit.', 'Stated in advance; to charity on the Islamic window.'),
    ('clock', 'A hidden grace period.', 'Shown as forgiveness of honest slips, not a trap.'),
    ('map-pin', 'Precise location.', 'One pin given by the member, never tracked.'),
], rh=0.76, size=10, isz=0.26, disc=True)

# ---- data use
sl = slide('Data Halqa Uses and Refuses',
           'Every datum is given by the member for a stated purpose. Techniques banned for lending apps are refused '
           'even where consent could be asked for.',
           src='Device data and collection signals, 2 August 2026; Google Play and SECP rules as above. Telemetry is used '
               'for fraud and security, never sold or shown.')
cols = [('Used', L700, 'circle-check', [
    ('map-pin', 'One location pin', 'given by the member at signup; city from the network address as a cross check'),
    ('landmark', 'Bank statement', 'read with consent to prove income; inside Mashreq for its customers'),
    ('repeat', 'Debit outcomes', 'the success or failure of each debit is the balance signal'),
    ('bell', 'Credit alerts', 'an opt-in listener that reads notifications on the phone and sends totals only'),
    ('image', 'Photo picker', 'the member chooses one document; no gallery access'),
    ('contact', 'Contact picker', 'the member chooses one invitee; no contact list'),
    ('activity', 'App telemetry', 'device model, sessions, typing rhythm, for fraud and security only')]),
        ('Refused', RED, 'circle-x', [
    ('users', 'Contact lists', 'the harassment tool of the loan apps'),
    ('image', 'Photo gallery', 'banned even with consent'),
    ('message-circle', 'Text messages and call log', 'default handler only under Play rules'),
    ('layout-grid', 'Installed apps', 'the device score other lenders use'),
    ('map', 'Background location', 'a declaration a committee app cannot clear'),
    ('eye', 'Reading bank app screens', 'the accessibility service: the fastest route to delisting'),
    ('shopping-bag', 'Selling profiles', 'only anonymous totals, if ever')])]
cw2 = (CW - 0.5) / 2
for i, (hd, col, mark, rows_) in enumerate(cols):
    x = M + i * (cw2 + 0.5)
    icon(sl, mark, x, Y0 + 0.02, 0.3, col)
    tb(sl, x + 0.42, Y0, cw2 - 0.42, 0.35, hd, size=14, color=col, font=DISPLAY)
    rule(sl, x, Y0 + 0.42, cw2, col, 1.0)
    for k, (ic, t, d) in enumerate(rows_):
        y = Y0 + 0.52 + k * 0.62
        icon(sl, ic, x + 0.02, y + 0.14, 0.28, col)
        tb(sl, x + 0.45, y, cw2 - 0.45, 0.6, [[(t + '  ', dict(size=10.5, bold=True)), (d, dict(size=9.5,
                                                                                                color=INK2))]],
           anchor=MIDDLE, spacing=1.04)
