# -*- coding: utf-8 -*-
# Part 1: cover, contents, summary, section 1 (the committee)

# =================================================================== COVER ===
sl = prs.slides.add_slide(BLANK)
PAGE[0] += 1
rect(sl, 9.05, 0, W - 9.05, H, LIME)
ph = phone(sl, 'home', 0, 0.62, h=6.25)
ph.left = E(9.05 + (W - 9.05) / 2) - ph.width // 2
tb(sl, 9.05, 6.95, W - 9.05, 0.3, 'The Halqa application, Home screen', size=9, color=INK, align=CEN)
lg = pic(sl, LOGO, 0.8, 0.78, h=0.52)
vrule(sl, 0.8 + lg.width / 914400.0 + 0.32, 0.62, 0.86, GREY_LT, 1.0)
pic(sl, MQ_LOGO, 0.8 + lg.width / 914400.0 + 0.62, 0.5, h=1.08)
tb(sl, 0.8, 2.35, 7.9, 0.9, 'The Complete Position', size=42, color=INK, font=DISPLAY)
tb(sl, 0.8, 3.3, 7.6, 0.9, 'Committee savings run by Halqa, with Mashreq Bank Pakistan holding and moving the money',
   size=17, color=L700, font=DISPLAY, spacing=1.1)
tb(sl, 0.8, 4.35, 7.5, 1.0, 'The committee, the bank partnership, the product, the economics, the evidence, the law, the '
   'platform and the plan, in one deck.', size=12.5, color=GREY, spacing=1.15)
tb(sl, 0.8, 6.02, 6, 0.3, 'Taha Amjed, Chairman, Halqa', size=12, color=INK, bold=True)
tb(sl, 0.8, 6.34, 6, 0.3, DATE, size=11, color=GREY)

# ================================================================ CONTENTS ===
SECTION[0] = ''
CONTENTS = slide('Contents')

# ================================================================= SUMMARY ===
sl = slide('Summary')
summ = [
    ('The committee.', 'Members pay the same instalment each round and one member collects the whole pot. About a '
     'third of Pakistani savers use committees, against 4 per cent who save with a formal institution, and 12 per cent '
     'of committee users have lost money to fraud.'),
    ('Why a bank.', 'A company that holds members’ money is taking deposits, which the Companies Act 2017 (s.84) '
     'reserves to banks, and a system that moves members\u2019 money needs State Bank regulation. So Halqa works through '
     'a Pakistani partner bank: Mashreq Bank Pakistan holds and moves every rupee; Halqa holds none.'),
    ('Roles.', 'Halqa is the system: circles, rules, bands, verification models, the application, the ledger and '
     'points. Mashreq is the machine: accounts, customer checks, mandates, collection, payouts, savings, cover, credit '
     'reporting and financing.'),
    ('The product.', 'Monthly circles first. Every seat inside a credit band, instalments within a third of verified '
     'income, a 24 hour confirming window, direct debit on the 8th, arrears taken from the late member’s own pot, '
     'cover chosen by Mashreq, every payment reported from day one, balance profit returned as points, a turn market, '
     'and Hyper labelled experimental.'),
    ('For Mashreq.', 'Accounts opened a whole circle at a time, salary and savings balances, women and overseas '
     'Pakistanis, an Islamic product, and repayment records that can start a lending book. On stated assumptions '
     '100,000 members bring about Rs 2.5 billion of deposits.'),
    ('Economics.', 'Running cost is Rs 13 to 35 a payment. On the 25 September model about 2,600 active members cover '
     'launch fixed costs. Under the bank route Mashreq collects the fee and shares income with Halqa, so the model is '
     're-cut once Mashreq’s terms are known.'),
    ('The law.', 'The bank route answers the deposit question and brings State Bank supervision through Mashreq’s '
     'licence. Open points for counsel: points bought with money, the turn market, and cover wording.'),
    ('Status.', 'Application live since 20 July 2026, not public, payments in a sandbox. Company to be incorporated in '
     'Islamabad. Meeting with Mashreq expected near 10 October 2026, then '
     'approvals and a six month pilot with about 1,000 members.'),
]
colw_ = (CW - 0.5) / 2
for i, (hd, bd) in enumerate(summ):
    col_, row_ = divmod(i, 4)
    x = M + col_ * (colw_ + 0.5)
    y = 1.12 + row_ * 1.38
    icon_disc(sl, ['users', 'landmark', 'network', 'smartphone', 'building-2', 'chart-column', 'scale', 'flag'][i],
              x, y - 0.02, d=0.42)
    tb(sl, x + 0.5, y, colw_ - 0.5, 1.3, [[(hd + ' ', dict(size=11.5, bold=True, color=L700)),
                                           (bd, dict(size=11))]], spacing=1.1)
    if row_ < 3:
        rule(sl, x + 0.5, y + 1.3, colw_ - 0.5)

# ============================================================ 1 COMMITTEE ===
divider('1', 'The committee', 'What a committee is, where its risk sits, who uses it, what goes wrong in the '
        'informal version, and how the order of collection is set.')

# ---- how it works
sl = slide('How a Committee Works',
           'Twelve members each pay Rs 10,000 a month for twelve months. Each month one member collects the whole pot of '
           'Rs 120,000. By the end every member has paid in exactly what that member took out.',
           src='Worked example. Rs 10,000 instalment, twelve members, monthly. Net position = amount received less amount '
               'paid, at the end of each month.')
caption(sl, M, Y0, 4.2, 'Who pays and who collects')
gx, gy, cs, cg = M + 0.62, Y0 + 0.78, 0.23, 0.045
for j in range(12):
    tb(sl, gx + j * (cs + cg) - 0.05, gy - 0.26, cs + 0.1, 0.22, str(j + 1), size=7.5, color=GREY, align=CEN)
tb(sl, gx, gy - 0.5, 12 * (cs + cg), 0.22, 'Month', size=8, color=GREY, bold=True, align=CEN)
for i in range(12):
    tb(sl, M, gy + i * (cs + cg) + 0.01, 0.58, cs, 'Seat %d' % (i + 1), size=7.5, color=GREY, align=R,
       anchor=MIDDLE)
    for j in range(12):
        rect(sl, gx + j * (cs + cg), gy + i * (cs + cg), cs, cs, LIME if i == j else C('E3E8DE'))
ly = gy + 12 * (cs + cg) + 0.14
rect(sl, gx, ly + 0.03, 0.16, 0.16, C('E3E8DE'))
tb(sl, gx + 0.22, ly, 1.6, 0.22, 'Instalment paid, Rs 10,000', size=8, color=GREY)
rect(sl, gx + 1.9, ly + 0.03, 0.16, 0.16, LIME)
tb(sl, gx + 2.12, ly, 1.6, 0.22, 'Pot collected, Rs 120,000', size=8, color=GREY)

caption(sl, 4.95, Y0, 4.3, 'Net position after each month, Rs thousand')
chart(sl, XL_CHART_TYPE.LINE, 4.85, Y0 + 0.3, 4.45, 4.35, [str(m) for m in range(1, 13)],
      [('Seat 1', [120 - 10 * m for m in range(1, 13)]),
       ('Seat 6', [(120 if m >= 6 else 0) - 10 * m for m in range(1, 13)]),
       ('Seat 12', [(120 if m >= 12 else 0) - 10 * m for m in range(1, 13)])],
      colors=[L700, LIME, GREY_LT], labels=False, legend=True, val_axis=True, grid=True, size=9, val_fmt='#,##0')
tb(sl, 4.95, Y0 + 4.68, 4.3, 0.4, 'Above zero: the member has received more than paid in. Below zero: the member has '
   'saved ahead of collecting.', size=8.5, color=GREY, spacing=1.03)

notes(sl, 9.6, Y0, W - M - 9.6, 5.0, [
    ('Instalment.', 'The fixed sum each member pays each round: here Rs 10,000.'),
    ('Pot.', 'Every instalment of one round, 12 × Rs 10,000 = Rs 120,000, paid to one member.'),
    ('Seat.', 'The round in which a member collects. Seat 1 collects first.'),
    ('Early seats.', 'Receive money before paying it in: an advance without interest, repaid by the instalments that '
                     'follow.'),
    ('Late seats.', 'Pay in before collecting: saving under a commitment the group enforces.'),
    ('At the end.', 'Every member has paid Rs 120,000 and received Rs 120,000. No member earns a return from another.'),
], size=10.5, gap=7)

# ---- risk
sl = slide('Where the Risk Sits',
           'A member who collects early still owes the remaining instalments. That sum is Rs 110,000 at seat 1 and nil at '
           'seat 12, so the seat is the collateral: late seats have paid in before they collect.',
           src='Still owed after collecting at seat k = c × (T − k), with c the instalment and T the number of '
               'rounds. Bands: score-bands.ts and the Credit Scoring Model (HQ-MF-06).')
caption(sl, M, Y0, 6.4, 'Still owed after collecting, twelve members at Rs 10,000 a month')
vals = [10000 * (12 - s) for s in range(1, 13)]
pc = [L700] * 6 + [LIME] * 3 + [LIME_MID] * 3
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, M - 0.05, Y0 + 0.3, 6.5, 4.55, ['Seat %d' % s for s in range(1, 13)],
      [('Owed', vals)], point_colors=pc, fmt='"Rs "#,##0;;"nil"', gap=35, size=9.5,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=135000)
lx = M + 0.2
for col, t in ((L700, 'Seats 1 to 6: Good or Excellent band'), (LIME, 'Seats 7 to 9: Fair band and above'),
               (LIME_MID, 'Seats 10 to 12: every band')):
    rect(sl, lx, Y0 + 4.95, 0.16, 0.16, col)
    tb(sl, lx + 0.22, Y0 + 4.9, 2.2, 0.25, t, size=8, color=GREY)
    lx += 2.15
x0 = 7.45
heading(sl, x0, Y0, W - M - x0, 'Controls on an early seat')
icon_rows(sl, x0, Y0 + 0.45, W - M - x0, [
    ('award', 'Band.', 'The member’s score decides which free seats may be claimed. It never reorders a circle '
                       'that has started.'),
    ('user-plus', 'New member.', 'The last three seats only, whatever the score, until two circles are completed '
                                 'cleanly and verification is complete.'),
    ('lock', 'Liability gate.', 'An early seat is withheld where the sum still owed after collecting would be too large '
                                'for verified income.'),
    ('wallet', 'Affordability.', 'All instalments within a third of verified income; 40 per cent with other loan '
                                 'repayments.'),
    ('repeat', 'Arrears.', 'A member who misses before collecting costs the others nothing: the missed instalments come '
                           'out of that member’s own pot.'),
    ('shield-check', 'Cover.', 'A default after collecting is met by the cover Mashreq chooses: its guarantee, '
                               'insurance or takaful.'),
], rh=0.76, size=10.5, disc=True, isz=0.34)

# ---- who uses
sl = slide('Who Uses Committees',
           'Committees are how Pakistanis without bank savings already save. Groups select on how regular a member’s '
           'income is, not on how high it is.',
           src='Financial Inclusion Insights (FII) surveys; Global Findex as cited in Kamran (2017); National Financial '
               'Inclusion Strategy 2024 to 2028 (Profit, 13 January 2025); Khan (2013); Kamran (2017); Mehmood et al. '
               '(2018).')
caption(sl, M, Y0, 5.2, 'How Pakistani savers keep their savings, per cent of savers')
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, M - 0.05, Y0 + 0.3, 5.3, 1.95, ['Cash kept at home', 'A committee',
                                                                      'A formal institution'],
      [('Share', [63, 33, 4])], point_colors=[GREY_LT, LIME, L700], fmt='0"%"', gap=45, size=10,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=75)
stat_rows(sl, M, Y0 + 2.4, 5.2, [
    ('piggy-bank', '36%', 'of Pakistanis save at all'),
    ('triangle-alert', '12%', 'of committee users have lost money to organiser or member fraud'),
    ('shopping-bag', '19%', 'use the pot for one large purchase'),
    ('message-circle', '31%', 'can send or receive a text message; just over half own a phone'),
    ('users', '2×', 'women take part at twice the rate of men'),
    ('credit-card', '64%', 'of adults held a financial account in 2023, mostly mobile wallets; target 75% by 2028'),
], rh=0.44, num_w=0.75, isz=0.28, size=9.5, nsize=14)
x0 = 6.3
heading(sl, x0, Y0, W - M - x0, 'What the research found')
notes(sl, x0, Y0 + 0.45, W - M - x0, 4.6, [
    ('Khan, 2013.', 'Fieldwork in Dera Ghazi Khan. Regular income is a condition of membership; the poorest are left '
                    'out as risky, so committees cannot replace microfinance.'),
    ('Kamran, 2017.', 'Thirty unbanked informants in Pakistan. None had seen a member default. A housemaid on Rs 15,000 '
                      'a month ranked the instalment above rent and bills.'),
    ('The resolution.', 'Committees screen on regularity of income, not its level. A tailor on Rs 17,000 or a driver on '
                        'Rs 22,000 is served well; an irregular earner is refused at any level.'),
    ('Mehmood et al., 2018.', 'ITU Lahore and the University of Washington, funded by the Gates Foundation and '
                              'Karandaaz, set out four models for a committee application. A record-keeping '
                              'application alone cannot create a credit history, because payments are asserted, '
                              'not settled. Halqa with a bank settles every payment.'),
    ('What Halqa claims.', 'A route into formal finance for regular earners without bank savings. Halqa does not '
                           'claim to serve the poorest or to replace formal finance.'),
], size=10.5, gap=8)

# ---- what goes wrong
sl = slide('What Members Value, and What Goes Wrong',
           'The informal committee works because the group enforces it. It fails where one person holds the money, where '
           'nothing is written down, and where years of paying on time count for nothing outside the group.',
           src='Kamran (2017) interviews; FII; press reports of a 2022 committee fraud run through Facebook. Answers describe the design '
               'under the bank route.')
x1, w1 = M, 3.9
heading(sl, x1, Y0, w1, 'What members value')
icon_rows(sl, x1, Y0 + 0.42, w1, [
    ('lock', 'Protection from relatives.', 'Money committed to the circle cannot be asked for by family.'),
    ('house', 'First call on income.', 'The instalment is paid before rent and bills.'),
    ('percent', 'No interest.', 'An early pot costs nothing extra.'),
    ('gift', 'A lump sum.', 'A wedding, a motorcycle, school fees or stock for a shop.'),
    ('map-pin', 'Local trust.', 'A known house and a known shop.'),
    ('arrow-left-right', 'Give and take.', 'Seats swapped in an emergency.'),
], rh=0.74, size=10.5, isz=0.3)
x2 = M + 4.3
heading(sl, x2, Y0, W - M - x2, 'What goes wrong, and the answer under the bank route')
probs = [('user-x', 'The organiser disappears with the pot', '12% of users have lost money to fraud; one Facebook '
          'organiser took about Rs 420 million across 117 committees', 'Money stays in members’ own Mashreq '
          'accounts and the circle account; no person holds a pot'),
         ('trending-down', 'An early collector stops paying', 'The main risk in any committee',
          'Bands, affordability, arrears netting and cover'),
         ('scale', 'Disputes over order and amounts', 'A notebook and verbal promises', 'Order fixed at joining; every '
          'payment in a ledger valid under the ETO 2002, s.3'),
         ('banknote', 'Cash carried home', 'Theft, and neighbours asking for loans', 'Payout straight into the '
          'member’s account'),
         ('file-text', 'Paying for years builds no credit record', 'Committee payments are invisible to lenders',
          'Every payment reported through TASDEEQ from day one'),
         ('door-open', 'No way out mid-cycle', 'Only the organiser’s discretion', 'A five-rung exit ladder with '
          'money returned at the close')]
wp = W - M - x2
for i, (ic, pr, ev, ans) in enumerate(probs):
    y = Y0 + 0.45 + i * 0.74
    icon_disc(sl, ic, x2, y + 0.12, d=0.46, fill_=C('FBE9E6'), color=RED)
    tb(sl, x2 + 0.6, y + 0.02, 3.4, 0.7, [(pr, dict(size=10.5, bold=True, gap=1)), (ev, dict(size=9, color=GREY))],
       anchor=MIDDLE, spacing=1.03)
    line(sl, x2 + 4.05, y + 0.35, x2 + 4.45, y + 0.35, L700, 1.25, arrow=True)
    icon(sl, 'circle-check', x2 + 4.55, y + 0.22, 0.26)
    tb(sl, x2 + 4.9, y + 0.02, wp - 4.9, 0.7, ans, size=10, anchor=MIDDLE, spacing=1.04)
    if i < len(probs) - 1:
        rule(sl, x2 + 0.6, y + 0.72, wp - 0.6)

# ---- market size
sl = slide('Size of the Market',
           'Committees move an estimated Rs 4 trillion a year. The national inclusion targets point the same way: more '
           'accounts, and a smaller gap between women and men.',
           src='Committee flow and participation are estimates; published figures on participation range from 34 to 41 '
               'per cent of adults. NFIS 2024 to 2028 as reported by Profit, 13 January 2025. World Bank for the 100 '
               'million.')
caption(sl, M, Y0, 5.8, 'National Financial Inclusion Strategy, per cent of adults')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, M - 0.05, Y0 + 0.3, 5.9, 3.7, ['Adults with a financial account',
                                                                        'Gender gap in inclusion'],
      [('2023', [64, 34]), ('2028 target', [75, 25])], colors=[GREY_LT, LIME], fmt='0"%"', gap=80, overlap=-10,
      legend=True, size=10, label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=90)
x0 = 6.85
heading(sl, x0, Y0, W - M - x0, 'Market facts')
stat_rows(sl, x0, Y0 + 0.45, W - M - x0, [
    ('coins', 'Rs 4 trillion', 'estimated to rotate through committees each year'),
    ('users', '34% to 41%', 'of adults reported to take part; about 52 million at the upper estimate'),
    ('circle-alert', '100 million', 'people without formal financial services (World Bank)'),
    ('heart-handshake', '2 to 1', 'women to men, the rate of participation'),
    ('house', 'First', 'the instalment ranks above rent in households that use one'),
    ('landmark', '4%', 'of savers use a formal institution, the gap a bank partner closes'),
], rh=0.56, num_w=1.55, isz=0.32, size=10, nsize=15)
tb(sl, x0, Y0 + 4.0, W - M - x0, 0.9, 'Every committee member brought into a bank account moves both national targets, '
   'and most committee members are women.', size=10.5, color=GREY, spacing=1.08)

# ---- types
sl = slide('Committee Types',
           'Seven types are costed, from a family circle of six to Hyper with four hundred. Known circles are formed by '
           'people who know each other; unknown circles are matched by Halqa.',
           src='Business Model and Unit Costs (HQ-CP-03), 25 September 2026. Hyper figures are the contribution only; the '
               'daily payment also carries cover and the fee.')
caption(sl, M, Y0, 5.0, 'Pot collected once by each member, Rs')
types_ = [('Family', 30000), ('Office', 120000), ('Market', 20000), ('Unknown', 120000), ('Large unknown', 500000),
          ('Hyper, Option 1', 15000), ('Hyper, Option 2', 8667)]
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, M - 0.05, Y0 + 0.3, 5.0, 4.45, [t for t, _ in types_],
      [('Pot', [v for _, v in types_])], point_colors=[LIME, LIME, LIME, L700, L700, AMBER, AMBER],
      fmt='#,##0', gap=40, size=10, label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=640000)
x0 = 5.85
rows_t = [('house', 'Family', '6', 'Rs 5,000', 'Monthly', 'Known', 'Level 1'),
          ('briefcase', 'Office', '12', 'Rs 10,000', 'Monthly', 'Known', 'Level 1'),
          ('store', 'Market', '10', 'Rs 2,000', 'Weekly', 'Known', 'Level 1'),
          ('users', 'Unknown', '12', 'Rs 10,000', 'Monthly', 'Matched', 'Level 2, cover'),
          ('building-2', 'Large unknown', '20', 'Rs 25,000', 'Monthly', 'Matched', 'Level 2, cover'),
          ('zap', 'Hyper, Option 1', '400', 'Rs 300', 'Daily, 50 days', 'Matched', 'Level 3, cover'),
          ('zap', 'Hyper, Option 2', '390', 'Rs 333.33', 'Daily, 26 days', 'Matched', 'Level 3, cover')]
rh_t = 0.56
ledger(sl, x0 + 0.45, Y0, W - M - x0 - 0.45, [r[1:] for r in rows_t], [1.45, 0.6, 0.95, 1.2, 0.85, 1.35],
       size=9.5, rh=rh_t, head=('Type', 'Size', 'Instalment', 'Cadence', 'Formed', 'Entry'))
for i, r in enumerate(rows_t):
    icon(sl, r[0], x0, Y0 + 0.32 + i * rh_t + (rh_t - 0.28) / 2, 0.28, AMBER if r[0] == 'zap' else L700)
tb(sl, x0, Y0 + 4.4, W - M - x0, 0.6, 'The large circles in lakhs are the bazaar committees traders run. They carry the '
   'highest stakes per seat, so they sit in the unknown tier with the strictest checks.', size=9.5, color=GREY,
   spacing=1.06)

# ---- order
sl = slide('Setting the Order',
           'The order of collection is fixed before the circle starts, either chosen by each member within the band or '
           'set by the host. Methods that change what the arrangement is in law are refused.',
           src='Penal Code s.294-A (lottery); Chit Funds Act 1982 (India); Committee Dossier, 6 August 2026; '
               'score-bands.ts. Turn trades after the start are covered on the Turn Market page.')
caption(sl, M, Y0, 8, 'The seats a member may pick, twelve member circle')
bands_ = [('Good or Excellent', 1), ('Fair', 7), ('Rebuilding or new member', 10)]
sw_ = 0.62
for r_, (lab, first) in enumerate(bands_):
    y = Y0 + 0.38 + r_ * 0.5
    tb(sl, M, y, 2.3, 0.42, lab, size=10.5, bold=True, color=L700, anchor=MIDDLE)
    for k in range(12):
        x = M + 2.4 + k * (sw_ + 0.08)
        ok = k + 1 >= first
        rect(sl, x, y, sw_, 0.42, LIME_LT if ok else PAPER, line=L700 if ok else None, lw=0.75,
             paras=[(str(k + 1) if ok else '', dict(size=10, bold=True, align=CEN))], pad=0, anchor=MIDDLE)
        if not ok:
            icon(sl, 'lock', x + sw_ / 2 - 0.1, y + 0.11, 0.2, GREY_LT)
tb(sl, M + 2.4 + 12 * (sw_ + 0.08) + 0.1, Y0 + 0.38, W - M - (M + 2.4 + 12 * (sw_ + 0.08) + 0.1), 1.5,
   'Locked seats are never shown as available. A claimed seat is fixed when the circle starts.', size=9.5,
   color=GREY, spacing=1.06)
cols3 = [('Offered', L700, 'circle-check', [('Choice at joining.', 'A free seat from those the band allows.'),
                                            ('Set by the host.', 'Fixed at creation, where the circle allows it.'),
                                            ('Draw for the order.', 'A parchi draw run as a verifiable commit and '
                                                                    'reveal. Specified, not built.')]),
         ('Refused', RED, 'circle-x', [('Auction.', 'The discount is a price for early money, about 45 to 55 per cent '
                                                    'a year in a worked example; India caps it at 30 per cent.'),
                                       ('Prize draw.', 'Once payments stop matching payouts it is a lottery, Penal '
                                                       'Code s.294-A.'),
                                       ('Instalment holiday.', 'Forgiven months dissolve the commitment.')]),
         ('Retired', GREY, 'archive', [('Ordering by score.', 'Removed on 22 July 2026 as confusing and unfair; the '
                                                              'score now only limits seats.'),
                                       ('Seat fee to Halqa.', 'Retired under the bank route: Halqa takes no part in '
                                                              'early seats (D6).')])]
cw3 = (CW - 2 * 0.4) / 3
for i, (hd, col, ic, items) in enumerate(cols3):
    x = M + i * (cw3 + 0.4)
    y0_ = Y0 + 2.05
    tb(sl, x, y0_, cw3, 0.35, hd, size=14, color=col, font=DISPLAY)
    rule(sl, x, y0_ + 0.42, cw3, col, 1.0)
    for k, (t, d) in enumerate(items):
        y = y0_ + 0.55 + k * 0.85
        icon(sl, ic, x, y + 0.05, 0.26, col)
        tb(sl, x + 0.38, y, cw3 - 0.38, 0.8, [[(t + ' ', dict(size=10.5, bold=True)), (d, dict(size=10))]],
           spacing=1.05)

