# -*- coding: utf-8 -*-
# Part 2: the bank partnership

divider('2', 'The bank partnership', 'Why a bank holds the money, who does what, Mashreq Bank Pakistan and its fit, '
        'accounts, the money route, collection and its cost, fees, savings, cover, credit reporting, financing, '
        'integration and what is asked of Mashreq.')

# ---- why a bank
sl = slide('Why a Bank',
           'A company that holds money taken from the public is taking deposits, which only a bank may do, and a system that '
           'moves members\u2019 money needs State Bank regulation. So Halqa works through a Pakistani partner bank.',
           src='Companies Act 2017, s.84(1) and (3). Oraan: Oraan Research (HQ-RS-01).')
tb(sl, M, Y0 - 0.05, CW, 0.75, [
    ([('\u201cno company shall invite, accept or renew deposits from the public: Provided that nothing in this '
       'sub-section shall apply to a banking company\u201d', dict(size=12.5, font=DISPLAY, italic=True)),
      ('   Companies Act 2017, s.84(1). Officers in default face up to two years and Rs 5 million, s.84(3).',
       dict(size=9, color=GREY))], dict(spacing=1.08))])


def money_panel(x, w, title, tcol, nodes, holder_col, notes_, logo=None):
    tb(sl, x, Y0 + 0.85, w, 0.35, title, size=14, color=tcol, font=DISPLAY)
    rule(sl, x, Y0 + 1.25, w, tcol, 1.0)
    nw = (w - 2 * 0.45) / 3
    for k, (ic, t, d) in enumerate(nodes):
        xx = x + k * (nw + 0.45)
        box(sl, xx, Y0 + 1.45, nw, 1.35, [], color=WHITE, line=holder_col if k == 1 else RULE, lw=1.25 if k == 1 else 0.75)
        icon(sl, ic, xx + nw / 2 - 0.2, Y0 + 1.57, 0.4, holder_col if k == 1 else L700)
        tb(sl, xx + 0.06, Y0 + 2.02, nw - 0.12, 0.75, [(t, dict(size=10.5, bold=True, align=CEN, gap=1)),
                                                     (d, dict(size=9, color=GREY, align=CEN))], spacing=1.02)
        if k < 2:
            line(sl, xx + nw + 0.04, Y0 + 2.12, xx + nw + 0.41, Y0 + 2.12, L700, 1.4, arrow=True)
    if logo:
        pic(sl, logo, x + w / 2 - 0.5, Y0 + 3.02, h=0.3)
        line(sl, x + w / 2, Y0 + 3.0, x + w / 2, Y0 + 2.84, L700, 1.0, dash=True, arrow=True)
        tb(sl, x + w / 2 + 0.55, Y0 + 3.02, w / 2 - 0.55, 0.3, 'sends instructions only', size=9, color=GREY)
    icon_rows(sl, x, Y0 + 3.42, w, notes_, rh=0.34, size=10, isz=0.22, rules=False)


money_panel(M, 5.95, 'A company holds the money: Oraan today', RED,
            [('users', 'Members', 'pay by bill number or transfer'),
             ('building', 'Company account', 'held as \u201cAmanat\u201d, no financial licence'),
             ('user', 'Collector', 'paid net, 11th to 18th')], RED,
            [('circle-x', 'Return on balances', 'kept by the company'),
             ('circle-x', 'Defaults', 'carried on the company\u2019s own balance sheet'),
             ('circle-x', 'Supervision', 'none over the money')])
money_panel(M + 6.3, 5.95, 'A bank holds the money: Halqa with Mashreq', L700,
            [('users', 'Members', 'pay from their own Mashreq accounts'),
             ('landmark', 'Circle account', 'at Mashreq, under its licence'),
             ('user', 'Collector', 'paid into own account the same day')], MQ,
            [('circle-check', 'Return on balances', 'paid to members as points'),
             ('circle-check', 'Defaults', 'met by the cover Mashreq chooses'),
             ('circle-check', 'Supervision', 'the State Bank, through the bank')], logo=LOGO)
rule(sl, M, Y0 + 4.52, CW, L700, 1.0)
brings = [('piggy-bank', 'Deposits', 'held in members’ own accounts'), ('repeat', 'Payments', 'mandates and '
                                                                                                  'payouts'),
          ('shield-check', 'Supervision', 'by the State Bank'), ('scan-face', 'Customer checks', 'NADRA and money '
                                                                                                  'laundering'),
          ('chart-line', 'Credit', 'TASDEEQ reporting and lending'), ('umbrella', 'Cover', 'guarantee, insurance or '
                                                                                         'takaful')]
bw6 = CW / 6
for k, (ic, t, d) in enumerate(brings):
    x = M + k * bw6
    icon(sl, ic, x, Y0 + 4.68, 0.3)
    tb(sl, x + 0.4, Y0 + 4.62, bw6 - 0.45, 0.5, [(t, dict(size=10, bold=True, gap=0)), (d, dict(size=9, color=GREY))],
       spacing=1.02)

# ---- roles
sl = slide('Roles', 'Halqa is the system. The bank is the machine. Halqa decides who pays what and when; Mashreq moves '
                    'the money and confirms every step.', partner=True,
           src='Decisions D10 and D15, 28 September 2026. No agreement is signed with Mashreq, Safepay, TASDEEQ or a '
               'takaful operator.')
lw_ = 4.7
rx = W - M - lw_
box(sl, M, Y0, lw_, 0.8, [], color=LIME_XLT, line=L700)
pic(sl, LOGO, M + 0.2, Y0 + 0.22, h=0.36)
tb(sl, M + 1.75, Y0 + 0.18, lw_ - 1.9, 0.5, 'The system', size=16, color=L700, font=DISPLAY, anchor=MIDDLE)
box(sl, rx, Y0, lw_, 0.8, [], color=WHITE, line=MQ)
pic(sl, MQ_LOGO, rx + 0.2, Y0 + 0.06, h=0.68)
tb(sl, rx + 1.2, Y0 + 0.18, lw_ - 1.35, 0.5, 'The machine', size=16, color=MQ, font=DISPLAY, anchor=MIDDLE)
def role_rows(x, items, col):
    for k, (ic, t) in enumerate(items):
        y = Y0 + 0.98 + k * 0.36
        icon(sl, ic, x + 0.05, y + 0.05, 0.24, col)
        tb(sl, x + 0.42, y, lw_ - 0.45, 0.34, t, size=10.5, anchor=MIDDLE)


role_rows(M, [('users', 'Circles, rules and the order of collection'), ('award', 'Credit bands and seat bands on every seat'),
              ('scan-face', 'Verification, income and affordability models'),
              ('smartphone', 'The application, messages and reminders'),
              ('file-text', 'The ledger, receipts and statements'), ('route', 'Late ladder, exit ladder and recovery'),
              ('gift', 'Points, marketplace and turn market'),
              ('chart-line', 'Payment records prepared for credit reporting')], L700)
role_rows(rx, [('landmark', 'Accounts, account opening and customer checks'), ('repeat', 'Direct debit mandates and '
                                                                                          'collection'),
               ('banknote', 'Payouts to collecting members'), ('piggy-bank', 'Short term savings and profit on balances'),
               ('shield-check', 'Cover in the form it chooses'), ('chart-column', 'Reporting to TASDEEQ as a member'),
               ('bike', 'Asset financing; accounts for overseas Pakistanis'),
               ('scale', 'Money laundering monitoring; Shariah approval')], MQ)
ax1, ax2 = M + lw_ + 0.25, rx - 0.25
msgs = [('Account opening request', True), ('Collection list on the due date', True), ('Payout instruction', True),
        ('Account and mandate references', False), ('Confirmation of each payment', False),
        ('Daily statement for reconciliation', False)]
for i, (t, right) in enumerate(msgs):
    y = Y0 + 1.0 + i * 0.47
    tb(sl, ax1, y - 0.02, ax2 - ax1, 0.25, t, size=9.5, color=GREY, align=CEN)
    if right:
        line(sl, ax1, y + 0.26, ax2, y + 0.26, L700, 1.25, arrow=True)
    else:
        line(sl, ax2, y + 0.26, ax1, y + 0.26, MQ, 1.25, arrow=True)
heading(sl, M, Y0 + 3.95, CW, 'Other parties', size=12)
ledger(sl, M, Y0 + 4.35, CW / 2 - 0.2, [
    ('TASDEEQ', 'Credit bureau; reads on the member’s instruction, receives payment records'),
    ('Safepay', 'Licensed payment service provider; card, wallet and Raast as back up routes'),
], [1.1, 4.8], size=9.5, rh=0.36)
ledger(sl, M + CW / 2 + 0.2, Y0 + 4.35, CW / 2 - 0.2, [
    ('NADRA', 'Identity and face verification, through the bank’s onboarding and Halqa’s checks'),
    ('Takaful operator', 'Cover, if Mashreq chooses takaful for the Islamic window'),
], [1.4, 4.5], size=9.5, rh=0.36)

# ---- mashreq profile
sl = slide('Mashreq Bank Pakistan',
           'A fully digital retail bank, a wholly owned subsidiary of Mashreq Bank P.S.C. of the United Arab Emirates. '
           'Deposits rose from Rs 1.3 billion to Rs 8.5 billion in the first half of 2026. It has not yet started lending.',
           partner=True,
           src='Mashreq Bank Pakistan Limited, condensed interim financial statements and Directors’ Review, half '
               'year ended 30 June 2026; Mashreq press releases of January, February and November 2025; Business '
               'Recorder, 16 September 2025; tasdeeq.com/members, read 28 September 2026.')
events = [('19 Dec 2024', 'Restricted licence'), ('31 Jan 2025', 'Pilot operations'),
          ('29 Aug 2025', 'Islamic window approved'), ('15 Sep 2025', 'Digital retail bank licence'),
          ('16 Sep 2025', 'Commercial operations'), ('Nov 2025', 'Mashreq NEO launched')]
ty = Y0 + 0.45
caption(sl, M, Y0, 6, 'From licence to launch')
rule(sl, M, ty + 0.35, CW, L700, 1.25)
seg = CW / len(events)
for i, (d, t) in enumerate(events):
    x = M + seg * i
    rect(sl, x, ty + 0.27, 0.16, 0.16, LIME, line=L700)
    tb(sl, x, ty, seg - 0.1, 0.25, d, size=10, color=L700, bold=True)
    tb(sl, x, ty + 0.5, seg - 0.15, 0.3, t, size=10)
caption(sl, M, Y0 + 1.45, 4.6, 'Customer deposits, Rs million')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, M - 0.05, Y0 + 1.75, 4.5, 3.15, ['31 Dec 2025', '30 Jun 2026'],
      [('Current deposits', [205, 1089]), ('Savings deposits', [1114, 7426])], colors=[L700, LIME], fmt='#,##0',
      gap=70, overlap=-10, legend=True, size=10, label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=8500)
x0 = 5.35
ledger(sl, x0, Y0 + 1.5, 3.7, [
    ('Deposits', 'Rs 8,515 million'), ('Customers', 'over 350,000'), ('Advances', 'none'),
    ('Net mark-up income', 'Rs 596 million, half year'), ('Loss', 'Rs 4.7 billion, half year'),
    ('Accumulated losses', 'Rs 16.2 billion'), ('Accounts for overseas Pakistanis', 'over 9,000; over Rs 265 million'),
], [1.9, 1.8], size=9.5, rh=0.46, head=('At 30 June 2026', ''))
x1 = 9.4
notes(sl, x1, Y0 + 1.5, W - M - x1, 3.6, [
    ('Products.', 'Mashreq NEO for individuals: current accounts, high yield savings and accounts for non resident '
                  'Pakistanis opened from the UAE application. NEOBIZ for small businesses, in pilot.'),
    ('Aim.', 'Serve 10 million Pakistanis in five years: salaried people, freelancers, women entrepreneurs and '
             'overseas Pakistanis.'),
    ('Bureau.', 'A member of TASDEEQ.'),
    ('Growth route.', 'NEOBIZ customers were acquired primarily through strategic partnerships.'),
], size=9.5, gap=5)

# ---- fit
sl = slide('Fit with Mashreq', 'Each of Mashreq’s published aims and needs has a direct answer in what committee '
                               'members bring.', partner=True,
           src='Mashreq press release, 24 November 2025; Directors’ Review, half year ended 30 June 2026.')
fit = [('users', '10 million Pakistanis in five years', 'Customers come as groups: every member of a circle opens an '
         'account, 6 to 20 at a time, and the host brings the next circle'),
       ('piggy-bank', 'Deposits and low cost balances', 'Instalments and salaries sit in members’ accounts; the '
        'circle’s money passes through Mashreq every month'),
       ('briefcase', 'Salaried people and freelancers', 'The same people already save through office and market '
        'committees'),
       ('heart-handshake', 'Women', 'Women take part in committees at twice the rate of men; the gender gap is a '
        'national target'),
       ('moon', 'Islamic first banking', 'A committee has no interest: one flat fee, profit shared on balances, a '
        'takaful option'),
       ('plane', 'Overseas Pakistanis in the UAE', 'Circles that join families in the UAE and Pakistan'),
       ('chart-line', 'No lending book yet', 'Repayment records of every member, starting with asset financing'),
       ('handshake', 'Growth through partnerships', 'Retail customers brought the way NEOBIZ brought businesses'),
       ('gift', 'Rewards and engagement', 'Points on balances and on time payments, linked to Mashreq’s cashback')]
tb(sl, M + 0.62, Y0 - 0.05, 4.2, 0.3, 'Mashreq’s aim or need', size=9.5, bold=True, color=GREY)
tb(sl, M + 5.55, Y0 - 0.05, 6.0, 0.3, 'What committee members bring', size=9.5, bold=True, color=GREY)
rule(sl, M, Y0 + 0.27, CW, L700, 1.0)
for i, (ic, aim, ans) in enumerate(fit):
    y = Y0 + 0.32 + i * 0.53
    icon_disc(sl, ic, M, y + 0.06, d=0.41, fill_=C('FDEDE4'), color=MQ)
    tb(sl, M + 0.62, y, 4.2, 0.53, aim, size=11, bold=True, color=INK, anchor=MIDDLE)
    line(sl, M + 4.8, y + 0.265, M + 5.35, y + 0.265, L700, 1.25, arrow=True)
    tb(sl, M + 5.55, y, CW - 5.55, 0.53, ans, size=10.5, anchor=MIDDLE, spacing=1.04)
    rule(sl, M + 0.62, y + 0.53, CW - 0.62)

# ---- accounts and onboarding
sl = slide('Accounts and Onboarding',
           'Every member banks with Mashreq from the start. The account is opened inside the Halqa application through '
           'Mashreq’s own onboarding, and Halqa’s checks run on top of the bank’s.', partner=True,
           src='Decisions D2, D10, D12 and D14, 28 September 2026. Account names are descriptive; product names and '
               'structures are Mashreq’s to set.')
caption(sl, M, Y0, 7.2, 'Accounts for one member in one circle')
rect(sl, M, Y0 + 0.35, 7.3, 4.3, None, line=MQ, lw=1.0)
tb(sl, M + 0.15, Y0 + 0.42, 4, 0.25, 'At Mashreq Bank Pakistan', size=9, bold=True, color=MQ)
bx = [('Member’s current account', 'Salary arrives; the mandate debits it'),
      ('Short term savings', 'The instalment waits from payday to the 8th and earns profit'),
      ('Circle account', 'Contributions gather on the 8th; the pot leaves the same day'),
      ('Collecting member’s account', 'Receives the pot, less any arrears owed')]
bw4, g4 = 1.6, 0.2
for i, (t, d) in enumerate(bx):
    x = M + 0.2 + i * (bw4 + g4)
    box(sl, x, Y0 + 0.8, bw4, 1.55, [(t, dict(size=10.5, bold=True, color=INK, gap=3)),
                                     (d, dict(size=9.5, color=GREY))], pad=0.1, color=LIME_XLT if i == 2 else WHITE,
        line=L700 if i == 2 else RULE)
    if i < 3:
        line(sl, x + bw4 + 0.01, Y0 + 1.57, x + bw4 + g4 - 0.01, Y0 + 1.57, L700, 1.25, arrow=True)
for i, t in enumerate(('payday', 'the 8th', 'the 8th')):
    tb(sl, M + 0.2 + i * (bw4 + g4) + bw4 - 0.3, Y0 + 2.4, 0.8, 0.22, t, size=8, color=GREY, align=CEN)
box(sl, M + 0.2, Y0 + 2.85, 6.9, 0.62, [('Member in the UAE: an account for non resident Pakistanis opened from '
                                         'Mashreq’s UAE application, paying into the same circle account',
                                         dict(size=10, color=INK))], color=WHITE, line=RULE, anchor=MIDDLE)
box(sl, M + 0.2, Y0 + 3.6, 6.9, 0.85, [('Halqa’s own account at Mashreq receives only Halqa’s agreed share '
                                        'of income. No member money passes through it, and the circle account is '
                                        'operated by Mashreq on Halqa’s instructions.', dict(size=10,
                                                                                                    color=INK))],
    color=WHITE, line=RULE, anchor=MIDDLE)
x0 = 8.25
heading(sl, x0, Y0, W - M - x0, 'Onboarding, in order')
icon_rows(sl, x0, Y0 + 0.42, W - M - x0, [
    ('smartphone', 'Halqa.', 'Phone number, one time passcode and an app PIN'),
    ('landmark', 'Mashreq.', 'Account opened inside the application: CNIC, NADRA biometric check, customer due '
                             'diligence'),
    ('repeat', 'Mashreq.', 'Direct debit mandate authorised once'),
    ('wallet', 'Halqa.', 'Income account read from the Mashreq statement with consent, or another bank’s'),
    ('file-text', 'TASDEEQ.', 'Credit report on the member’s own instruction'),
    ('scan-face', 'Halqa.', 'Identity, address and job scored into one verification level'),
    ('users', 'Halqa.', 'Seat offered within the band; 24 hour confirming window'),
], rh=0.66, size=10.5, isz=0.3, disc=True)

# ---- money route
sl = slide('Money Route',
           'One month of a monthly circle, due on the 8th. Every rupee moves between accounts at Mashreq; Halqa sends '
           'the instructions and checks the result against Mashreq’s statement each morning.', partner=True,
           src='Decisions D3, D4 and D12, 28 September 2026. The due date of the 8th is proposed and awaits a decision.')
caption(sl, M, Y0, 8, 'Days of the month')
ty = Y0 + 1.05
x_day = lambda d: M + 0.2 + (d - 1) * (CW - 0.4) / 29.0
rect(sl, x_day(1), ty - 0.62, x_day(8) - x_day(1), 0.3, LIME_LT)
tb(sl, x_day(1) + 0.05, ty - 0.61, x_day(8) - x_day(1), 0.28, 'Instalment in short term savings', size=9,
   color=INK, anchor=MIDDLE)
rect(sl, x_day(9), ty - 0.62, x_day(13) - x_day(9), 0.3, C('F6E7B4'))
tb(sl, x_day(9) + 0.05, ty - 0.61, x_day(13) - x_day(9), 0.28, 'Retries if unpaid', size=9, color=INK,
   anchor=MIDDLE)
rule(sl, M + 0.2, ty, CW - 0.4, L700, 1.5)
for d in (1, 5, 8, 10, 13, 15, 20, 25, 30):
    line(sl, x_day(d), ty - 0.06, x_day(d), ty + 0.06, L700, 1.0)
    tb(sl, x_day(d) - 0.3, ty + 0.1, 0.6, 0.22, str(d), size=8.5, color=GREY, align=CEN)
evs = [(1, 'Payday', 'Salary reaches the member’s Mashreq account, or is moved in from another bank.'),
       (8, 'Debit and payout', 'Mashreq debits each instalment under the mandate. Contributions gather in the circle '
                               'account and the pot goes to the collecting member the same day.'),
       (13, 'Late ladder', 'After five days of retries the member enters the late ladder; arrears are recorded against '
                           'the round.')]
for i, (d, t, desc) in enumerate(evs):
    marker(sl, x_day(d) - 0.13, ty + 0.36, 'ABC'[i], d=0.26, color=L700, size=8.5)
yb = Y0 + 1.85
for i, (d, t, desc) in enumerate(evs):
    x = M + i * (CW / 3)
    tb(sl, x, yb, CW / 3 - 0.35, 1.3, [([('%s  ' % 'ABC'[i], dict(size=11, bold=True, color=L700)),
                                         (t, dict(size=11, bold=True))], dict(gap=3)),
                                       (desc, dict(size=10.5, spacing=1.07))])
heading(sl, M, Y0 + 3.15, CW, 'Each instalment, split inside Mashreq')
flow(sl, M, Y0 + 3.6, CW, 1.0, [
    ('Contribution', 'To the circle account, then to the collecting member'),
    ('Cover', 'To the guarantee, insurer or takaful fund Mashreq chooses'),
    ('Fee', 'To Mashreq as its income; a share to Halqa monthly'),
    ('Balance profit', 'Credited at the end of the circle as points, one point a rupee')], gap=0.3, size=10,
    head_size=11)
tb(sl, M, Y0 + 4.72, CW, 0.3, 'Halqa never holds member money at any step.', size=10.5, color=L700, bold=True)

# ---- collection
sl = slide('Collection',
           'Mashreq’s direct debit mandate becomes the first route. The three payment routes already designed stay '
           'behind it, through Safepay, so a member who banks elsewhere for a time can still pay.', partner=True,
           src='Decision D3, 28 September 2026; Auto Debit (HQ-CP-02); Collection and Auto Debit Specification (HQ-CP-09). '
               'Payment Systems and Electronic Fund Transfers Act 2007, s.35(1).')
routes = [('landmark', 'Mashreq direct debit mandate', 'Authorised once in the application; Mashreq debits the '
           'member’s account on the due date. Default for every member.', True),
          ('smartphone', 'One approval payment', 'Card, wallet or Raast Request to Pay through Safepay, approved in one '
           'step.', False),
          ('credit-card', 'Saved card auto debit', 'A charge on a card saved with Safepay. The token stays with Safepay; '
           'Halqa keeps an opaque reference.', False),
          ('arrow-left-right', 'Manual payment', 'Raast or bank transfer into the member’s Mashreq account from any '
           'bank or wallet. Always available.', False)]
for i, (ic, t, d, first) in enumerate(routes):
    y = Y0 + i * 0.86
    box(sl, M, y, 7.3, 0.76, [], color=LIME_XLT if first else WHITE, line=L700 if first else RULE)
    icon_disc(sl, ic, M + 0.15, y + 0.13, d=0.5, fill_=WHITE if first else LIME_XLT, color=MQ if first else L700)
    tb(sl, M + 0.8, y + 0.06, 6.3, 0.66, [([('%d  ' % (i + 1), dict(size=11, bold=True, color=L700)),
                                            (t, dict(size=11, bold=True))], dict(gap=2)),
                                          (d, dict(size=9.5, color=INK2))], anchor=MIDDLE, spacing=1.04)
heading(sl, M, Y0 + 3.55, 7.3, 'Payday window')
for k in range(6):
    x = M + k * 1.2
    rect(sl, x, Y0 + 4.0, 1.05, 0.42, L700 if k == 0 else (LIME if k < 5 else PAPER), line=None,
         paras=[('Due date' if k == 0 else ('Day +%d' % k if k < 5 else 'Stop'), dict(size=9.5, bold=True,
                                                                                         color=WHITE if k == 0 else INK,
                                                                                         align=CEN))],
         pad=0.02, anchor=MIDDLE)
tb(sl, M, Y0 + 4.55, 7.3, 0.6, 'First attempt on the learned payday, then one attempt each morning, five at most, '
   'stopping at the first success. A salary paid up to four days late is collected without the member acting.',
   size=10, color=GREY, spacing=1.06)
x0 = 8.25
heading(sl, x0, Y0, W - M - x0, 'Rules')
notes(sl, x0, Y0 + 0.45, W - M - x0, 4.7, [
    ('Amount.', 'No debit exceeds one instalment; the mandate follows the circle’s cadence.'),
    ('Cancelling.', 'Cancelling a mandate returns the member to manual payment. The commitment to the circle stays. '
                    'Separate screens, separate wording.'),
    ('No negative balance.', 'A missed instalment is an arrears record against the round, set off from the member’s '
                             'own pot. A balance owed to Halqa is never created.'),
    ('Re-presentment.', 'No repeated retries beyond the window: aggressive re-presentment is the loan app pattern.'),
    ('Law.', 'A preauthorised transfer may be authorised “in writing, or in any other accepted form” '
             '(PS&EFT Act s.35(1)). The duties to disclose, investigate errors and prove authorisation fall on the bank.'),
], size=10.5, gap=7)

# ---- collection cost
sl = slide('Collection Cost',
           'A percentage charge on each debit grows with the instalment while the fee does not. Moving collection '
           'inside Mashreq removes most of this cost.',
           src='Safepay published prices, read 25 September 2026: cards 2.9% + Rs 30, wallets and Raast 1.5%. Bank Alfalah '
               'Raast FAQ: merchant discount rate 0% on Raast. Fee levels from the fee schedule of 25 September 2026.')
caption(sl, M, Y0, 6.6, 'Share of the member fee taken by a 1.5 per cent charge on the debit')
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, M - 0.05, Y0 + 0.3, 6.7, 2.45,
      ['Hyper, Rs 450 a day, fee Rs 75', 'Rs 2,500 a month, fee Rs 100', 'Rs 5,000 a month, fee Rs 150',
       'Rs 20,000 a month, fee Rs 500'],
      [('Share', [9, 38, 50, 60])], point_colors=[LIME, AMBER, AMBER, RED], fmt='0"%"', gap=45, size=10,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=75)
ledger(sl, M, Y0 + 2.95, 6.6, [
    ('Debit inside Mashreq', 'A transfer between accounts at the same bank', 'Near nil'),
    ('Raast', 'Instant payment scheme of the State Bank', '0% merchant rate'),
    ('Safepay wallet or Raast', 'Published price', '1.5%'),
    ('Safepay card', 'Published price', '2.9% + Rs 30'),
    ('Target with Safepay', 'Custom pricing asked for', '1%, capped at Rs 10'),
], [2.2, 2.9, 1.5], size=10, rh=0.34, head=('Route', 'Basis', 'Charge'))
x0 = 7.65
heading(sl, x0, Y0, W - M - x0, 'Why it matters')
notes(sl, x0, Y0 + 0.45, W - M - x0, 4.7, [
    ('Flat fee, percentage rail.', 'At 1.5 per cent a Rs 20,000 instalment costs Rs 300 to collect, 60 per cent of a '
                                   'Rs 500 fee. A card at the published price would take 64 per cent of Hyper’s fee '
                                   'revenue.'),
    ('The bank route.', 'When every member banks with Mashreq, the debit is a book transfer inside one bank, so the '
                        'largest variable cost almost disappears.'),
    ('The back up routes.', 'Safepay stays for members who pay from elsewhere; the target price is 1 per cent capped '
                            'at Rs 10 a debit, and a charge per transaction rather than a percentage.'),
    ('Never for instalments.', 'Cards at the published price are not used for routine instalments.'),
], size=10.5, gap=8)

# ---- fees and income
sl = slide('Fees and Income',
           'Mashreq collects one flat fee with each instalment as its income and shares its income from committee '
           'accounts with Halqa. The more that share earns, the lower the member fee can go.', partner=True,
           src='Decision D5, 28 September 2026. Fee schedule: Business Model and Unit Costs (HQ-CP-03). Oraan: website fee '
               'calculator, read 28 September 2026; annual rate is Halqa’s calculation.')
fl = [(M, 'Member', LIME), (M + 2.55, 'Mashreq', WHITE), (M + 5.1, 'Halqa', LIME)]
for x, t, col in fl:
    box(sl, x, Y0 + 0.05, 1.7, 0.62, [(t, dict(size=13, bold=True, color=INK if col == LIME else MQ,
                                              align=CEN))], color=col, line=L700 if col == LIME else MQ,
        anchor=MIDDLE, pad=0.04)
line(sl, M + 1.72, Y0 + 0.36, M + 2.53, Y0 + 0.36, L700, 1.4, arrow=True)
line(sl, M + 4.27, Y0 + 0.36, M + 5.08, Y0 + 0.36, L700, 1.4, arrow=True)
tb(sl, M + 1.72, Y0 + 0.72, 0.85, 0.4, 'fee with each instalment', size=8, color=GREY, align=CEN)
tb(sl, M + 4.27, Y0 + 0.72, 0.85, 0.4, 'agreed share, monthly', size=8, color=GREY, align=CEN)
caption(sl, M, Y0 + 1.25, 6.8, 'Fee schedule of 25 September, the ceiling before Mashreq’s share is agreed')
table(sl, M, Y0 + 1.58, 6.8, [
    ['Instalment', '2 to 6 members', '7 to 10 members', '11 or more'],
    ['Up to Rs 2,500', 'Rs 100', 'Rs 100', 'Rs 150'],
    ['Up to Rs 5,000', 'Rs 100', 'Rs 150', 'Rs 200'],
    ['Up to Rs 10,000', 'Rs 150', 'Rs 300', 'Rs 500'],
    ['Above Rs 10,000', 'Rs 200', 'Rs 400', 'Rs 500'],
], [1.6, 1.7, 1.7, 1.8], size=10, rh=0.34, aligns=[L, R, R, R])
tb(sl, M, Y0 + 3.55, 6.8, 1.5, [
    'Hyper: Rs 75 a day on Option 1 and Rs 83.33 a day on Option 2, flat, never graded by day.',
    'The same fee for every seat of a circle, never priced by the month of payout.',
    'The fee is a service charge, and the cost of cover is shown as its own line.',
    'Each 10 per cent share of Mashreq’s net margin on committee balances is worth about Rs 8 a member a month '
    'on the assumptions of the Mashreq Gains page.'], size=10, bullet=True, gap=4, spacing=1.05)
x0 = 7.75
caption(sl, x0, Y0, W - M - x0, 'Oraan: fee each month, per cent of the instalment, 10 month committee')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, x0 - 0.05, Y0 + 0.3, W - M - x0 + 0.1, 2.9,
      [str(k) for k in range(1, 11)], [('Fee', [21, 19, 16.5, 13.5, 10, 6, 2, 0, 0, 0])],
      point_colors=[RED] + [GREY_LT] * 9, fmt='General"%";;"0"', gap=40, size=9.5,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=25)
tb(sl, x0, Y0 + 3.25, W - M - x0, 0.25, 'Month of payout', size=8.5, color=GREY, align=CEN)
notes(sl, x0, Y0 + 3.65, W - M - x0, 1.4, [
    ('Against Oraan.', 'The first seat of a ten month Oraan committee pays 21 per cent of the instalment each month, '
                       'about 54 per cent a year on Halqa’s calculation. Halqa charges every seat the same.')],
      size=10)

# ---- savings and profit
sl = slide('Short Term Savings and Balance Profit',
           'The instalment waits about seven days between payday and the 8th. In a Mashreq savings product it earns '
           'profit, which comes back to members at the end of the circle as points, one point for each rupee.',
           partner=True,
           src='Decisions D4 and D12, 28 September 2026. Mashreq NEO advertised profit of up to 10 per cent on savings '
               '(November 2025). Worked example only; the rate and profit sharing are Mashreq’s to set.')
caption(sl, M, Y0, 6.4, 'Profit on one member’s instalment of Rs 10,000, seven days a month')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, M - 0.05, Y0 + 0.3, 6.5, 3.3, ['A month', 'A 12 month circle'],
      [('At 5% a year', [9.6, 115]), ('At 10% a year', [19.2, 230])], colors=[LIME_MID, L700],
      fmt='"Rs "General', gap=90, overlap=-15, legend=True, size=10, label_pos=XL_LABEL_POSITION.OUTSIDE_END,
      vmax=270)
tb(sl, M, Y0 + 3.75, 6.4, 1.3, [
    'Rs 10,000 × 10% × 7 / 365 = Rs 19.18 a month; twelve months = Rs 230, credited as 230 points.',
    'The reward is nominal by design: it rewards paying on time and finishing the circle, not saving for a return.'], size=10.5, bullet=True, gap=5, spacing=1.06)
x0 = 7.3
heading(sl, x0, Y0, W - M - x0, 'How it works')
notes(sl, x0, Y0 + 0.45, W - M - x0, 4.7, [
    ('Savings product.', 'A very short term savings product at Mashreq, from payday to the due date. The bank sets '
                         'the rate and pays the profit.'),
    ('Islamic window.', 'On the Islamic window the return is profit on a sharing basis, not interest.'),
    ('Reward at the end.', 'Profit on the circle’s balances is paid when the circle completes, as points at one '
                           'point to the rupee, redeemable in the Halqa marketplace for goods.'),
    ('Why at the end.', 'A reward paid only on completion adds a reason to finish the circle.'),
    ('What it replaces.', 'The savings vault and the float of the earlier design are retired. No money is invited into '
                          'any fund and no return is kept by Halqa.'),
], size=10.5, gap=7)

# ---- cover
sl = slide('Cover',
           'Three ways to protect the other members when someone collects early and then stops paying. Mashreq chooses '
           'one. In each, a member who misses before collecting is met from that member’s own pot, not from cover.',
           partner=True,
           src='Decision D7, 28 September 2026. Takaful Cover Pricing Model (HQ-MF-05): base 5 defaults in 100 members; '
               'stress one circle in five losing a fifth of its members from the earliest seats; 20% loading, 25% '
               'wakalah fee, both illustrative. Insurance Ordinance 2000, s.4(4)(f), Class 6.')
opts = [('Bank guarantee', 'Mashreq guarantees each pot from its balance sheet and prices the risk into its fee.',
         'Mashreq', 'The fee', 'Subject to the Shariah board'),
        ('Insurance', 'A credit policy on each circle through the bank’s insurance arrangements; a premium in each '
                      'instalment.', 'The insurer', 'A premium line', 'Conventional window only'),
        ('Takaful', 'Class 6 cover from a general takaful operator, such as Pak-Qatar General Takaful or Salaam '
                    'Takaful; a contribution in each instalment.', 'The takaful fund', 'A contribution line',
         'Islamic window')]
cw_ = 3.0
for i, (t, d, who, paid, isl) in enumerate(opts):
    x = M + i * (cw_ + 0.2)
    icon(sl, ['landmark', 'shield-check', 'heart-handshake'][i], x, Y0 + 0.01, 0.32)
    tb(sl, x + 0.42, Y0, cw_ - 0.42, 0.35, t, size=14, color=L700, font=DISPLAY)
    rule(sl, x, Y0 + 0.4, cw_, L700, 1.0)
    tb(sl, x, Y0 + 0.5, cw_, 1.0, d, size=10, spacing=1.06)
    ledger(sl, x, Y0 + 1.55, cw_, [('Carries loss', who), ('Paid through', paid), ('Suits', isl)], [1.05, 1.95],
           size=9.5, rh=0.36, top_rule=False, first_color=GREY)
x0 = 10.25
caption(sl, x0, Y0, W - M - x0, 'Cost of cover, per cent of instalment')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, x0 - 0.05, Y0 + 0.3, W - M - x0 + 0.1, 2.55, ['Base', 'Stress'],
      [('Contribution', [3.67, 5.47])], point_colors=[LIME, L700], fmt='0.00"%"', gap=60, size=9.5,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=7)
heading(sl, M, Y0 + 3.0, CW, 'Pricing, for a monthly unknown circle of 12 at Rs 10,000', size=12)
ledger(sl, M, Y0 + 3.4, CW, [
    ('Base case', '12 members × 5% × average still owed Rs 55,000 = Rs 33,000 a circle; Rs 229 an instalment; '
                  'gross Rs 367 (3.67%)'),
    ('Stress case', 'One circle in five loses 2.4 members from seats 1 to 3: Rs 246,000, or Rs 49,200 a circle on '
                    'average; gross Rs 547 an instalment (5.47%)'),
    ('Hyper', 'Cover of Rs 75 a day on Option 1 builds Rs 1.5 million a circle, against a stress loss of Rs 1.07 million'),
    ('Rule of thumb', 'Premium rate r ≈ 1.5 q, where q is the default rate after collecting, at a threefold '
                      'loading, whatever the circle size'),
], [1.5, 10.7], size=10, rh=0.4, top_rule=True)

# ---- credit reporting
sl = slide('Credit Reporting',
           'Every payment, good and bad, is reported from the first day. Mashreq is already a member of TASDEEQ, which '
           'gives the most direct route. The choice of route is Mashreq’s.', partner=True,
           src='Decision D11, 28 September 2026 (non-negotiable). Credit Bureaus Act 2015, ss.11(1), 19(1)(b), 31, 32 and '
               '34. Credit Scoring Model (HQ-MF-06). Mission Asset Fund and Esusu: published results.')
caption(sl, M, Y0, 7.5, 'Two routes for committee records')
box(sl, M, Y0 + 0.45, 1.75, 0.9, [('Member pays', dict(size=11, bold=True, align=CEN)),
                                   ('on time or late', dict(size=9.5, color=GREY, align=CEN))], anchor=MIDDLE)
box(sl, M + 2.3, Y0 + 0.45, 1.9, 0.9, [('Halqa ledger', dict(size=11, bold=True, align=CEN)),
                                        ('each payment, each circle', dict(size=9.5, color=GREY, align=CEN))],
    anchor=MIDDLE)
box(sl, M + 5.0, Y0 + 0.05, 2.5, 0.75, [('Route A: Mashreq', dict(size=11, bold=True, color=MQ)),
                                         ('reports as a TASDEEQ member', dict(size=9.5, color=GREY))], line=MQ)
box(sl, M + 5.0, Y0 + 1.05, 2.5, 0.75, [('Route B: Halqa', dict(size=11, bold=True, color=L700)),
                                         ('direct, after a notification under s.11(1)', dict(size=9.5, color=GREY))])
box(sl, M + 5.0, Y0 + 2.2, 2.5, 0.75, [('TASDEEQ record', dict(size=11, bold=True, align=CEN)),
                                        ('readable by any lender', dict(size=9.5, color=GREY, align=CEN))],
    color=LIME_XLT, line=L700, anchor=MIDDLE)
line(sl, M + 1.77, Y0 + 0.9, M + 2.28, Y0 + 0.9, L700, 1.25, arrow=True)
elbow(sl, [(M + 4.22, Y0 + 0.9), (M + 4.6, Y0 + 0.9), (M + 4.6, Y0 + 0.42), (M + 4.98, Y0 + 0.42)])
elbow(sl, [(M + 4.6, Y0 + 0.9), (M + 4.6, Y0 + 1.42), (M + 4.98, Y0 + 1.42)])
line(sl, M + 6.25, Y0 + 1.82, M + 6.25, Y0 + 2.18, L700, 1.25, arrow=True)
ledger(sl, M, Y0 + 3.2, 7.5, [
    ('Reading', 'On the member’s own electronic instruction to the bureau, on a separate screen (s.19(1)(b), '
                's.32). A checkbox in the terms is not enough.'),
    ('Refusal', 'If a report leads to a refusal, the member receives the report, the bureau’s details and a '
                'summary of rights (s.31).'),
    ('Penalty', 'A user in breach faces a fine up to Rs 5 million and Rs 50,000 a day (s.34).'),
], [1.1, 6.4], size=9.5, rh=0.5)
x0 = 8.45
heading(sl, x0, Y0, 2.5, 'Scores and evidence')
notes(sl, x0, Y0 + 0.45, 2.45, 4.7, [
    ('TASDEEQ scale.', '200, very poor, to 600, excellent. Halqa’s scale is 300 to 850; for display, TASDEEQ '
                       'equivalent = 200 + (Halqa − 300) × 400 / 550.'),
    ('To TASDEEQ.', 'Raw payment records scored in its own model, not Halqa’s score.'),
    ('Mission Asset Fund.', 'Lending circles reported to US bureaus raised scores by 168 points on average.'),
    ('Esusu.', 'Rent reporting in the United States; valued at US$1 billion in 2022.'),
], size=9.5, gap=6)
ph = phone(sl, 'credit', W - M - 1.72, Y0 - 0.05, h=3.6)
tb(sl, W - M - 1.72, Y0 + 3.58, 1.72, 0.3, 'Credit report screen', size=9, color=GREY, align=CEN)

# ---- asset financing and overseas
sl = slide('Asset Financing and Overseas Members',
           'Two decisions of 28 September bring business to the bank: Mashreq finances assets bought through asset '
           'circles, and members in the UAE join circles through Mashreq’s accounts for non resident Pakistanis.',
           partner=True,
           src='Decisions D13 and D14, 28 September 2026. Asset Committees (HQ-CP-01): 12 members, Rs 10,000 a month, '
               'asset of Rs 120,000, resale value 70 per cent. Mashreq Directors’ Review, half year 2026.')
caption(sl, M, Y0, 6.2, 'Asset circle: still owed after collecting against resale value, Rs')
seats_ = [1, 2, 3, 4, 5, 6]
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, M - 0.05, Y0 + 0.3, 6.3, 2.7, ['Seat %d' % s for s in seats_],
      [('Still owed', [10000 * (12 - s) for s in seats_]), ('Resale of the asset', [84000] * 6)],
      colors=[L700, LIME_MID], fmt='#,##0', gap=60, overlap=-10, legend=True, size=9.5,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=135000)
notes(sl, M, Y0 + 3.2, 6.2, 1.9, [
    ('How it runs.', 'Mashreq buys the asset, a motorcycle, rickshaw, loader or machine, and finances the member; the '
                     'circle runs as usual. From seat 4 the resale value covers everything still owed.'),
    ('Alternative.', 'The August design: an SECP registered modaraba owns and leases the asset under ijarah ending in '
                     'ownership, and pays the member’s contributions into the circle.'),
    ('Income.', 'A referral fee of 2 to 4 per cent from the financier and 1 to 3 per cent from the dealer.'),
], size=10, gap=5)
x0 = 7.05
heading(sl, x0, Y0, W - M - x0, 'Members in the UAE')
wx = W - M - x0
box(sl, x0, Y0 + 0.45, 2.3, 1.45, [], line=MQ)
icon(sl, 'smartphone', x0 + 0.95, Y0 + 0.55, 0.4, MQ)
tb(sl, x0 + 0.08, Y0 + 1.0, 2.14, 0.85, [('United Arab Emirates', dict(size=10.5, bold=True, align=CEN, gap=1)),
                                         ('Account opened in Mashreq’s UAE application', dict(size=9, color=GREY,
                                                                                                  align=CEN))])
box(sl, x0 + wx - 2.3, Y0 + 0.45, 2.3, 1.45, [], line=L700)
icon(sl, 'users', x0 + wx - 1.35, Y0 + 0.55, 0.4)
tb(sl, x0 + wx - 2.22, Y0 + 1.0, 2.14, 0.85, [('Pakistan', dict(size=10.5, bold=True, align=CEN, gap=1)),
                                              ('Circle account; family collects here', dict(size=9, color=GREY,
                                                                                            align=CEN))])
line(sl, x0 + 2.35, Y0 + 1.17, x0 + wx - 2.35, Y0 + 1.17, L700, 1.5, arrow=True)
icon(sl, 'plane', x0 + wx / 2 - 0.2, Y0 + 0.7, 0.36)
tb(sl, x0 + 2.35, Y0 + 1.25, wx - 4.7, 0.5, 'instalments', size=9, color=GREY, align=CEN)
stat_rows(sl, x0, Y0 + 2.15, wx, [
    ('user-check', '9,000+', 'accounts for non resident Pakistanis at Mashreq'),
    ('banknote', 'Rs 265m', 'deposits in those accounts, 30 June 2026'),
    ('award', '2026', 'Open Banking Initiative of the Year, UAE, Asian Banking and Finance awards'),
], rh=0.5, num_w=1.15, isz=0.28, size=9.5, nsize=14)
tb(sl, x0, Y0 + 3.8, wx, 1.1, 'Halqa never holds or converts foreign currency; the remittance rail and its licence stay '
   'with the bank. Remittance circles suit weddings, construction and Hajj, where the saving has a date.', size=9.5,
   color=GREY, spacing=1.07)

# ---- what mashreq gains
sl = slide('What Mashreq Gains',
           'On stated assumptions, 100,000 members would add about Rs 2.5 billion of deposits and 100,000 accounts, '
           'against Rs 8.5 billion held at 30 June 2026.', partner=True,
           src='Assumptions, to be replaced by Mashreq’s own: average instalment Rs 8,000 a month; average balance Rs '
               '25,000 a member once salaries move to Mashreq; net margin to the bank of 4 per cent a year after profit '
               'credited to members.')
caption(sl, M, Y0, 6.2, 'Deposits, Rs billion')
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, M - 0.05, Y0 + 0.3, 6.3, 3.0,
      ['Mashreq, 30 June 2026', '10,000 members', '100,000 members', '1,000,000 members'],
      [('Deposits', [8.5, 0.25, 2.5, 25])], point_colors=[MQ, LIME, LIME, L700], fmt='General', gap=45, size=10,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=29)
ledger(sl, M, Y0 + 3.5, 6.2, [
    ('10,000', 'Rs 80 million', 'Rs 250 million', 'Rs 10 million'),
    ('100,000', 'Rs 800 million', 'Rs 2.5 billion', 'Rs 100 million'),
    ('1,000,000', 'Rs 8 billion', 'Rs 25 billion', 'Rs 1 billion'),
], [1.1, 1.6, 1.7, 1.8], size=10, rh=0.34,
       head=('Members', 'Instalments a month', 'Average balances', 'Net margin a year'))
x0 = 7.2
heading(sl, x0, Y0, W - M - x0, 'Beyond deposits')
icon_rows(sl, x0, Y0 + 0.45, W - M - x0, [
    ('users', 'Customers in groups.', 'A host brings 6 to 20 people who open accounts together; a completed circle is '
                                      'followed by the next.'),
    ('briefcase', 'Salary accounts.', 'Members are asked to receive income in the account the mandate debits.'),
    ('heart-handshake', 'Women savers.', 'The group the national strategy most wants to reach.'),
    ('moon', 'An Islamic product.', 'No interest; the flat fee and shared profit fit the Islamic window.'),
    ('plane', 'Overseas Pakistanis.', 'Circles that link families in the UAE and Pakistan.'),
    ('chart-line', 'A lending book.', 'Repayment records and asset financing after a clean circle.'),
    ('coins', 'Fee income.', 'The member fee, cover and financing.'),
], rh=0.66, size=10.5, isz=0.28, disc=True)

# ---- integration
sl = slide('Integration and Outsourcing',
           'Halqa becomes a service provider to Mashreq. The State Bank’s outsourcing framework governs the '
           'arrangement, so the agreement, the security and the data follow its terms.', partner=True,
           src='SBP Framework for Risk Management in Outsourcing Arrangements by Financial Institutions (BPRD Circular 06 '
               'of 2017, revised 2019). Interface list proposed, not agreed.')
lanes = [('Member', M), ('Halqa platform', M + CW / 3), ('Mashreq systems', M + 2 * CW / 3)]
lw3 = CW / 3
for t, x in lanes:
    box(sl, x + 0.05, Y0, lw3 - 0.1, 0.45, [(t, dict(size=11.5, bold=True, align=CEN,
                                                   color=MQ if 'Mashreq' in t else (L700 if 'Halqa' in t else INK)))],
        color=LIME_XLT if 'Halqa' in t else WHITE, line=MQ if 'Mashreq' in t else RULE, anchor=MIDDLE, pad=0.04)
    line(sl, x + lw3 / 2, Y0 + 0.5, x + lw3 / 2, Y0 + 3.75, RULE, 0.75, dash=True)
msgs = [(0, 2, 'Opens a Mashreq account in the application'), (2, 1, 'Account and mandate references'),
        (1, 2, 'Collection file on the due date'), (2, 1, 'Signed confirmation of each debit'),
        (1, 0, 'Receipt, ledger and schedule updated'), (1, 2, 'Payout instruction: pot less arrears'),
        (2, 1, 'Statement each morning for reconciliation')]
for i, (a_, b_, t) in enumerate(msgs):
    y = Y0 + 0.62 + i * 0.44
    xa_ = M + a_ * lw3 + lw3 / 2
    xb_ = M + b_ * lw3 + lw3 / 2
    line(sl, xa_, y + 0.27, xb_, y + 0.27, MQ if a_ == 2 else L700, 1.25, arrow=True)
    tb(sl, min(xa_, xb_) + 0.1, y, abs(xb_ - xa_) - 0.2, 0.25, '%d  %s' % (i + 1, t), size=9.5, align=CEN)
ledger(sl, M, Y0 + 3.95, CW, [
    ('Agreement', 'Services, service levels, audit and inspection rights for Mashreq and the State Bank, '
                  'confidentiality of customer data, complaints, business continuity and exit.'),
    ('Security', 'Signed and encrypted messages, least privilege, audit logs on both sides, annual penetration tests. '
                 'No card number, password or banking credential is stored by Halqa.'),
    ('Data', 'Customer data hosted as the framework requires; Halqa’s database now runs in Singapore and moves if '
             'Mashreq or the rules require data in Pakistan.'),
], [1.2, 11.0], size=9.5, rh=0.38)

# ---- the ask
sl = slide('What Halqa Asks of Mashreq',
           'Twelve decisions for Mashreq, in the order they are needed. Each carries the Halqa decision it rests on.', partner=True,
           src='Bank Partnership Revisions (HQ-BK-01) and Halqa\u2019s decisions D1 to D16 of 28 September 2026.')
asks = [('1', 'Approve the partnership as an outsourcing arrangement, with Halqa assessed as a service provider',
         'D15'),
        ('2', 'Approve the product for the Islamic window through the Shariah board, with the cover options', 'D7'),
        ('3', 'Open accounts inside the Halqa application through Mashreq’s onboarding', 'D2, D10'),
        ('4', 'Offer a direct debit mandate for instalments', 'D3'),
        ('5', 'Provide a short term savings product for the days between payday and the due date', 'D12'),
        ('6', 'Choose the cover: its own guarantee, insurance or takaful', 'D7'),
        ('7', 'Report payment records to TASDEEQ, or support Halqa’s direct reporting', 'D11'),
        ('8', 'Issue points bought with money as its own stored value product', 'D9'),
        ('9', 'Link points with Mashreq’s rewards and cashback', 'D9'),
        ('10', 'Finance assets bought through asset circles', 'D13'),
        ('11', 'Open circles to members in the UAE through accounts for non resident Pakistanis', 'D14'),
        ('12', 'Agree the income share, and pilot limits of about 1,000 members over one cycle', 'D5')]
half = 6
for k, (n, t, d) in enumerate(asks):
    col_, row_ = divmod(k, half)
    x = M + col_ * (CW / 2 + 0.15)
    y = Y0 + row_ * 0.82
    marker(sl, x, y + 0.19, n, d=0.34, color=LIME, tc=INK, size=10)
    tb(sl, x + 0.5, y, CW / 2 - 1.35, 0.72, t, size=11, anchor=MIDDLE, spacing=1.06)
    tb(sl, x + CW / 2 - 0.85, y, 0.7, 0.72, d, size=9.5, color=GREY, align=R, anchor=MIDDLE)
    rule(sl, x + 0.5, y + 0.76, CW / 2 - 0.65)
