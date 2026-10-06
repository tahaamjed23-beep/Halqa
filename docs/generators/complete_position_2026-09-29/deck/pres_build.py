# -*- coding: utf-8 -*-
"""
Halqa: the presentation for Mashreq Bank Pakistan (29 September 2026).

Built for speaking, not reading: 15 slides, one idea each, large type, real product screens, the talking points in the
speaker notes. The 81 slide Complete Position stays as the reference for questions.
Usage: python pres_build.py [out.pptx]
"""
import os, sys, math

HERE = os.path.dirname(os.path.abspath(__file__))
G = {'__file__': os.path.join(HERE, 'd2_lib.py'), '__name__': 'pres'}
exec(compile(open(os.path.join(HERE, 'd2_lib.py'), encoding='utf-8').read(), 'd2_lib.py', 'exec'), G)
globals().update({k: v for k, v in G.items() if not k.startswith('__')})

OUTP = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'Halqa-Presentation.pptx')
PM = 0.7            # page margin for this deck
PW = W - 2 * PM
NUM = [0]


def say(sl, text):
    sl.notes_slide.notes_text_frame.text = text


def pslide(title, statement=None, lime=False, logo=True, stmt_size=24, stmt_w=None):
    sl = prs.slides.add_slide(BLANK)
    NUM[0] += 1
    if lime:
        rect(sl, 0, 0, W, H, LIME)
    tb(sl, PM, 0.5, 9.5, 0.6, title, size=30, color=INK if lime else L700, font=DISPLAY)
    if statement:
        tb(sl, PM, 1.2, stmt_w or 11.2, 1.1, statement, size=stmt_size, color=INK, spacing=1.08)
    if logo:
        lg = pic(sl, LOGO, 0, 0.55, h=0.36)
        lg.left = E(W - PM) - lg.width
    tb(sl, W - PM - 0.6, 7.0, 0.6, 0.3, str(NUM[0]), size=11, color=INK if lime else GREY, align=R)
    return sl


def src_line(sl, text, lime=False):
    tb(sl, PM, 6.98, PW - 1.0, 0.3, 'Source: ' + text, size=9.5, color=INK2 if lime else GREY)


# ================================================================ 1 COVER ===
sl = prs.slides.add_slide(BLANK)
NUM[0] += 1
rect(sl, 8.6, 0, W - 8.6, H, LIME)
ph = phone(sl, 'home', 0, 0.55, h=6.4)
ph.left = E(8.6 + (W - 8.6) / 2) - ph.width // 2
lg = pic(sl, LOGO, PM, 0.8, h=0.6)
vrule(sl, PM + lg.width / 914400.0 + 0.35, 0.62, 0.95, GREY_LT, 1.0)
pic(sl, MQ_LOGO, PM + lg.width / 914400.0 + 0.7, 0.5, h=1.15)
tb(sl, PM, 2.45, 7.6, 1.7, 'Committee savings, held and moved by a bank', size=40, color=INK, font=DISPLAY,
   spacing=0.98)
tb(sl, PM, 4.35, 7.4, 0.5, 'A proposal for Mashreq Bank Pakistan', size=20, color=L700)
tb(sl, PM, 6.0, 6, 0.35, 'Taha Amjed, Chairman, Halqa', size=14, bold=True)
tb(sl, PM, 6.38, 6, 0.3, DATE, size=12, color=GREY)
say(sl, 'Opening, about 30 seconds.\n\n'
        'Halqa takes the committee, the savings habit most Pakistani families already use, and runs it inside a bank. '
        'Mashreq holds and moves every rupee; Halqa runs the circle: who pays, when, in what order, and what happens '
        'if someone is late.\n\n'
        'Over the next twenty minutes: what a committee is, what goes wrong with it today, what we propose, what '
        'Mashreq gains, how a member uses it, how defaults are controlled, the money, the evidence from other '
        'countries, how it grows, and a six month pilot. We finish with five requests.\n\n'
        'The screen on the right is the Halqa application as it runs today.')

# ================================================================ 2 COMMITTEES ===
sl = pslide('Committees', 'About one in three Pakistani savers already saves in a committee.')
cx, cy, rr = 3.6, 4.55, 1.72
for k in range(12):
    a = math.radians(k * 30 - 90)
    px, py = cx + rr * math.cos(a), cy + rr * math.sin(a)
    on = k == 0
    oval(sl, px - 0.3, py - 0.3, 0.6, LIME if on else LIME_XLT, line=L700 if on else RULE)
    icon(sl, 'user-round', px - 0.17, py - 0.17, 0.34, INK if on else L700)
tb(sl, cx - 1.1, cy - 0.5, 2.2, 0.4, 'The pot', size=14, color=GREY, align=CEN)
tb(sl, cx - 1.3, cy - 0.15, 2.6, 0.6, 'Rs 120,000', size=28, color=L700, font=DISPLAY, align=CEN)
tb(sl, cx - 2.0, cy + rr + 0.45, 4.0, 0.35, 'This month the highlighted member collects', size=12, color=GREY,
   align=CEN)
x0 = 7.2
rows = [('12', 'members, usually people who know each other'), ('Rs 10,000', 'paid by each member every month'),
        ('Rs 120,000', 'collected by one member each month, in turn'),
        ('12 months', 'until every member has collected once')]
for i, (n_, t) in enumerate(rows):
    y = 2.75 + i * 0.95
    tb(sl, x0, y, 2.5, 0.7, n_, size=28, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x0 + 2.55, y, W - PM - x0 - 2.55, 0.7, t, size=17, anchor=MIDDLE, spacing=1.05)
tb(sl, x0, 6.5, W - PM - x0, 0.4, 'Every member pays in exactly what they take out. No interest.', size=15,
   bold=True, color=INK)
src_line(sl, 'Financial Inclusion Insights survey of Pakistan: 33 per cent of savers use committees.')
say(sl, 'A committee, called a kameti or BC, is a rotating savings group. Twelve people each pay Rs 10,000 a month. '
        'Each month one of them takes the whole Rs 120,000. After twelve months everyone has paid Rs 120,000 and '
        'received Rs 120,000.\n\n'
        'For the member who collects early it works like an advance without interest; for the member who collects '
        'late it is saving under a commitment the group enforces.\n\n'
        'About a third of Pakistani savers use committees, far more than use a bank. Women take part at twice the '
        'rate of men. Research in Pakistan found households rank the committee instalment above rent.\n\n'
        'If asked: participation estimates range from 34 to 41 per cent of adults across sources.')

# ================================================================ 3 PROBLEM ===
sl = pslide('The Problem', 'Committees run on trust and cash, outside any bank.')
cols = [('user-x', '12%', 'of committee users have lost money to an organiser or member fraud'),
        ('file-x', 'None', 'of the years of on time payments count towards a credit record'),
        ('landmark', '4%', 'of Pakistani savers keep their savings in a bank or other formal institution')]
cw3 = (PW - 2 * 0.6) / 3
for i, (ic, n_, t) in enumerate(cols):
    x = PM + i * (cw3 + 0.6)
    icon(sl, ic, x, 2.75, 0.85, RED if i < 2 else GREY)
    tb(sl, x, 3.8, cw3, 1.0, n_, size=54, color=INK, font=DISPLAY)
    tb(sl, x, 4.95, cw3 - 0.2, 1.3, t, size=18, spacing=1.08)
src_line(sl, 'Financial Inclusion Insights surveys of Pakistan.')
say(sl, 'Three things go wrong.\n\n'
        'First, one person holds the cash. Twelve per cent of committee users say they have lost money to an '
        'organiser or a member. In 2022 one organiser on Facebook collected about Rs 420 million across 117 '
        'committees and disappeared.\n\n'
        'Second, nothing is recorded. A woman can pay on time for ten years and a bank will still see no credit '
        'history.\n\n'
        'Third, the money never enters a bank. Only four per cent of savers use a formal institution. Committee money '
        'moves as cash or between personal accounts, invisible to banks.\n\n'
        'These are the gaps a bank and a platform together can close.')

# ================================================================ 4 PROPOSAL ===
sl = pslide('The Proposal', 'Halqa runs the committee. Mashreq holds and moves every rupee.')
# members
box(sl, PM, 3.05, 2.6, 2.1, [], line=RULE)
icon(sl, 'users', PM + 0.95, 3.25, 0.7)
tb(sl, PM, 4.05, 2.6, 1.0, [('Members', dict(size=18, bold=True, align=CEN, gap=2)),
                            ('pay from their own Mashreq accounts', dict(size=13, color=GREY, align=CEN))],
   spacing=1.04)
# halqa
hx = PM + 4.25
box(sl, hx, 2.55, 3.4, 1.55, [], color=LIME_XLT, line=L700, lw=1.25)
pic(sl, LOGO, hx + 0.9, 2.72, h=0.45)
tb(sl, hx + 0.1, 3.3, 3.2, 0.75, 'rules, order of turns, checks, reminders, records', size=13, color=INK, align=CEN,
   spacing=1.04)
# mashreq
mx = PM + 8.9
box(sl, mx, 3.05, 3.3, 2.1, [], line=MQ, lw=1.25)
pic(sl, MQ_LOGO, mx + 1.2, 3.15, h=0.85)
tb(sl, mx + 0.1, 4.05, 3.1, 1.0, 'accounts, direct debit, payouts, savings, cover, credit reporting', size=13,
   color=INK, align=CEN, spacing=1.04)
# money line: members to mashreq, below halqa
line(sl, PM + 2.62, 4.75, mx - 0.02, 4.75, L700, 3.0, arrow=True)
tb(sl, PM + 3.2, 4.85, 5.6, 0.4, 'money: every rupee stays at Mashreq', size=14, bold=True, color=L700, align=CEN)
# instructions: halqa to mashreq
line(sl, hx + 3.42, 3.35, mx - 0.02, 3.6, L700, 1.5, arrow=True, dash=True)
tb(sl, hx + 3.35, 2.9, 1.6, 0.4, 'instructions', size=12, color=GREY, align=CEN)
line(sl, PM + 2.62, 3.6, hx - 0.02, 3.35, L700, 1.5, dash=True)
tb(sl, PM + 2.7, 2.9, 1.5, 0.4, 'the app', size=12, color=GREY, align=CEN)
tb(sl, PM, 5.75, PW, 0.6, 'Halqa is the system. The bank is the machine.', size=24, color=L700, font=DISPLAY,
   align=CEN)
say(sl, 'Our proposal is a division of work.\n\n'
        'Halqa is the system: it decides who may join, who collects in which month, it reminds, records every payment '
        'and handles late payment and exits.\n\n'
        'Mashreq is the machine: every member opens a Mashreq account, instalments are debited by Mashreq on the due '
        'date, the pot is paid into the collecting member\'s Mashreq account, and Mashreq provides savings, cover and '
        'credit reporting.\n\n'
        'The important line is the thick one at the bottom: money goes from the member to Mashreq and back to a member. '
        'It never passes through Halqa. A company that holds public money is taking deposits, which the Companies Act '
        'reserves to banks, so this is the design that keeps it inside the law.\n\n'
        'Halqa is paid a share of the income, not by holding money.')

# ================================================================ 5 GAINS ===
sl = pslide('What Mashreq Gains', 'Deposits, customers who arrive in groups, and the repayment records to start lending.')
caption(sl, PM, 2.45, 6.3, 'Deposits, Rs billion')
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, PM - 0.05, 2.75, 6.4, 3.1,
      ['Mashreq, 30 June 2026', 'With 100,000 members', 'With 1,000,000 members'],
      [('Rs bn', [8.5, 2.5, 25])], point_colors=[MQ, LIME, L700], fmt='General', gap=45, size=14,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=29)
tb(sl, PM, 5.95, 6.4, 0.6, 'At an average balance of Rs 25,000 a member once salaries move to Mashreq. Mashreq’s '
   'own figures replace this assumption.', size=11, color=GREY, spacing=1.05)
x0 = 7.6
gains = [('6 to 20', 'new accounts with every circle, opened together'),
         ('2×', 'women take part in committees at twice the rate of men'),
         ('9,000+', 'Mashreq accounts for overseas Pakistanis: a ready channel for family circles'),
         ('Every member', 'builds a repayment record Mashreq can lend against')]
for i, (n_, t) in enumerate(gains):
    y = 2.5 + i * 1.02
    tb(sl, x0, y, 2.3, 0.8, n_, size=26, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x0 + 2.35, y, W - PM - x0 - 2.35, 0.8, t, size=15, anchor=MIDDLE, spacing=1.05)
src_line(sl, 'Mashreq Bank Pakistan, half year accounts to 30 June 2026; Financial Inclusion Insights.')
say(sl, 'What Mashreq gets.\n\n'
        'Deposits: every member holds a Mashreq account and the instalments pass through Mashreq. With 100,000 '
        'members and an average balance of about Rs 25,000, that is about Rs 2.5 billion, against the Rs 8.5 billion '
        'Mashreq held at 30 June 2026. These are our assumptions; Mashreq\'s own figures would replace them.\n\n'
        'Customers arrive in groups: one host brings six to twenty people who open accounts together, and a completed '
        'circle is followed by the next.\n\n'
        'Women savers, which the national inclusion strategy most wants to reach. Overseas Pakistanis: Mashreq '
        'already opens Pakistani accounts from its UAE application, over 9,000 so far.\n\n'
        'And a lending book: Mashreq reported no advances at 30 June. Every committee payment is a repayment record, '
        'starting with financing for motorcycles and machines bought through asset circles.')

# ================================================================ 6 HOW IT WORKS ===
sl = pslide('How It Works', 'Four steps for a member, all inside the Halqa application.')
steps = [('circles', '1', 'Join a circle of friends, family or colleagues'), ('autopay', '2', 'Pay automatically on the due date'),
         ('activity', '3', 'Collect the whole pot when the turn comes'), ('credit', '4', 'Build a credit record with every '
                                                                               'payment')]
pw_, ph_h = 2.05, 4.3
gap_ = (PW - 4 * pw_) / 3
for i, (nm, n_, t) in enumerate(steps):
    x = PM + i * (pw_ + gap_)
    ph = phone(sl, nm, x, 2.15, h=ph_h)
    ph.left = E(x + (pw_ - ph.width / 914400.0) / 2)
    marker(sl, x - 0.05, 6.55, n_, d=0.42, color=LIME, tc=INK, size=14)
    tb(sl, x + 0.45, 6.5, pw_ + 0.15, 0.55, t, size=13, bold=True, anchor=MIDDLE, spacing=1.03)
say(sl, 'This is the application as it runs today, in preview.\n\n'
        'One: a member joins a circle, usually one a friend or colleague has started, and picks a turn from those '
        'open to them.\n\n'
        'Two: the instalment is debited automatically on the due date from the member\'s Mashreq account. If a salary '
        'is late, the debit is retried each morning for up to five days.\n\n'
        'Three: on their turn the member receives the whole pot in their own account, the same day.\n\n'
        'Four: every payment is reported to the credit bureau, so years of committee payments finally count.\n\n'
        'Messages come on WhatsApp, in Roman Urdu first, because many members read little English.')

# ================================================================ 7 SAFETY ===
sl = pslide('Safety', 'The risk sits with members who collect early, so early turns are earned and every default is '
                      'covered.')
caption(sl, PM, 2.45, 6.0, 'Still owed after collecting, twelve members at Rs 10,000, Rs thousand')
vals = [110, 100, 90, 80, 70, 60, 50, 40, 30, 20, 10, 0]
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, PM - 0.05, 2.75, 6.1, 3.5, [str(s) for s in range(1, 13)],
      [('Owed', vals)], point_colors=[L700] * 6 + [LIME] * 3 + [LIME_MID] * 3, fmt='General;;"0"', gap=35,
      size=12, label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=128)
tb(sl, PM, 6.3, 6.0, 0.4, 'Turn number: dark green turns need a good record', size=12, color=GREY)
x0 = 7.35
ctl = [('award', 'Early turns only for members with a good record; new members start at the back'),
       ('wallet', 'All instalments together kept within a third of verified income'),
       ('repeat', 'A missed payment before collecting comes out of that member’s own pot'),
       ('shield-check', 'A default after collecting is covered: a bank guarantee, insurance or takaful, as Mashreq '
                        'chooses')]
for i, (ic, t) in enumerate(ctl):
    y = 2.5 + i * 1.05
    icon(sl, ic, x0, y + 0.12, 0.5)
    tb(sl, x0 + 0.75, y, W - PM - x0 - 0.75, 0.85, t, size=16, anchor=MIDDLE, spacing=1.06)
say(sl, 'The question every banker asks: what if someone collects early and stops paying?\n\n'
        'The chart shows the answer. The member in turn 1 still owes Rs 110,000 after collecting; the member in turn 12 '
        'owes nothing. So the risk is concentrated in the early turns, and that is where the controls sit.\n\n'
        'Early turns are open only to members with a good record; a new member starts in the last three turns until '
        'two circles are completed cleanly. All committee instalments together must stay within a third of verified '
        'income, and within 40 per cent with other loans, the same limit the State Bank sets for consumer finance.\n\n'
        'A member who misses before collecting costs the others nothing, because the missed payments come out of their '
        'own pot. A default after collecting is covered by the option Mashreq chooses. In the stressed case, one circle '
        'in five losing a fifth of its members, takaful cover costs about 5.5 per cent of the instalment.\n\n'
        'No harassment, no contact lists, no public lists of defaulters: recovery is by contract and the courts.')

# ================================================================ 8 MONEY AND FEES ===
sl = pslide('Money and Fees', 'One flat fee for every member, collected by Mashreq, with a share of the income to '
                              'Halqa.')
fx0 = PM
box(sl, fx0, 2.6, 2.1, 1.1, [('Instalment', dict(size=16, bold=True, align=CEN)),
                             ('from the member’s Mashreq account', dict(size=11, color=GREY, align=CEN))],
    anchor=MIDDLE, line=L700)
parts = [('Contribution', 'to the member collecting this month', L700),
         ('Cover', 'to the guarantee, insurer or takaful fund', LIME_MID),
         ('Fee', 'to Mashreq; an agreed share to Halqa', MQ)]
for i, (t, d, col) in enumerate(parts):
    y = 2.35 + i * 1.05
    line(sl, fx0 + 2.12, 3.15, fx0 + 2.75, y + 0.42, col, 1.75, arrow=True)
    box(sl, fx0 + 2.8, y, 3.3, 0.85, [(t, dict(size=15, bold=True, color=col if col != LIME_MID else L700, gap=1)),
                                      (d, dict(size=11, color=GREY))], line=col, pad=0.12)
tb(sl, fx0, 5.7, 6.2, 0.9, 'Profit on balances is returned to members at the end of each circle as reward points, '
   'one point for each rupee.', size=14, spacing=1.06)
x0 = 7.4
caption(sl, x0, 2.45, W - PM - x0, 'Monthly fee by turn, per cent of the instalment, ten month committee')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, x0 - 0.05, 2.75, W - PM - x0 + 0.1, 3.2, [str(k) for k in range(1, 11)],
      [('Oraan', [21, 19, 16.5, 13.5, 10, 6, 2, 0, 0, 0]), ('Halqa', [1.5] * 10)], colors=[GREY_LT, L700],
      fmt='General', labels=False, gap=40, overlap=-5, legend=True, size=12, val_axis=True, vmax=25, vmin=0,
      val_fmt='0"%"', grid=True).value_axis.major_unit = 5
tb(sl, x0, 6.0, W - PM - x0, 0.7, 'Oraan charges the first turn up to 21 per cent of the instalment every month. '
   'Halqa charges every turn the same.', size=12, color=GREY, spacing=1.05)
src_line(sl, 'Oraan website fee calculator, read 28 September 2026. Halqa bar illustrative: a flat Rs 150 on a Rs 10,000 '
             'instalment.')
say(sl, 'How the money moves. Each instalment is split inside Mashreq: the contribution goes to whoever is collecting, '
        'the cover part goes to the cover provider, and the fee is Mashreq\'s income. Mashreq shares an agreed part of '
        'that income with Halqa. The more that share earns, the lower the member fee can go.\n\n'
        'The fee is flat and the same for every turn. That matters for two reasons. It is fair: our closest competitor, '
        'Oraan, charges the first turn up to 21 per cent of the instalment every month, about 54 per cent a year. And '
        'it keeps the product clean in law and in Shariah: a fee that grows the earlier you collect is a price for '
        'money, which reads as interest.\n\n'
        'The profit Mashreq earns on balances is returned to members at the end of each circle as points they can '
        'spend, which rewards finishing the circle.\n\n'
        'If asked: our running cost is about Rs 13 to 35 a payment; fee levels are set once Mashreq\'s share is '
        'agreed.')

# ================================================================ 9 EVIDENCE ===
sl = pslide('Evidence', 'Digital committees have already scaled with banks and regulators in Egypt and Saudi Arabia.')
cards = [('Egypt', 'Money Fellows', [('8.5 million', 'users'), ('US$1.5 billion', 'processed'),
                                     ('Profitable', 'in 2025'), ('328', 'companies offering it to staff')],
          'Works with Banque Misr, Egypt’s state bank, and entered the central bank’s sandbox.'),
         ('Saudi Arabia', 'Hakbah', [('500,000+', 'users'), ('70%', 'aged 21 to 35'),
                                     ('Approved', 'by the central bank'), ('Visa', 'prepaid cards; airline partner')],
          'Launched after regulatory approval; partners with Visa and an open banking platform.')]
cw2 = (PW - 0.6) / 2
for i, (ctry, name, facts, note) in enumerate(cards):
    x = PM + i * (cw2 + 0.6)
    tb(sl, x, 2.45, cw2, 0.35, ctry, size=14, color=GREY, bold=True)
    tb(sl, x, 2.8, cw2, 0.6, name, size=28, color=L700, font=DISPLAY)
    rule(sl, x, 3.5, cw2, L700, 1.25)
    for k, (n_, t) in enumerate(facts):
        col_, row_ = k % 2, k // 2
        xx = x + col_ * (cw2 / 2)
        yy = 3.7 + row_ * 1.0
        tb(sl, xx, yy, cw2 / 2 - 0.1, 0.55, n_, size=24, font=DISPLAY, color=INK)
        tb(sl, xx, yy + 0.52, cw2 / 2 - 0.1, 0.4, t, size=13, color=GREY)
    tb(sl, x, 5.85, cw2, 0.8, note, size=13, spacing=1.06)
src_line(sl, 'Launch Base Africa, 21 October 2025; Entrepreneur Middle East; The National, June and December 2023; '
             'MENAbytes.')
say(sl, 'This is not a new idea. It has worked, with banks, in two countries with the same savings habit.\n\n'
        'Money Fellows in Egypt: about 8.5 million users, US$1.5 billion processed, profitable in 2025. It works with '
        'Banque Misr, entered the central bank\'s sandbox, and 328 companies offer it to their staff.\n\n'
        'Hakbah in Saudi Arabia: over 500,000 users, most of them young, launched after approval from the central '
        'bank, with Visa prepaid cards.\n\n'
        'The lesson from both: the regulator and a bank came first, and growth followed.\n\n'
        'In Pakistan the market is still open. Oraan holds members\' money in its own company accounts; JazzCash\'s new '
        'committee feature keeps the pot in the organiser\'s wallet. Nobody offers a committee held by a bank.')

# ================================================================ 10 WHY NOW ===
sl = pslide('Why Now', 'The wallets have started. A committee held by a bank does not exist yet.', lime=True,
            stmt_size=26, logo=False)
tl = [('August 2026', 'JazzCash launched a committee feature. The pot sits in the organiser’s wallet.'),
      ('September 2025', 'Mashreq Bank Pakistan became a fully licensed digital retail bank, with accounts for '
                         'overseas Pakistanis opened from the UAE.'),
      ('2028', 'National targets: 75 per cent of adults with an account, and the gap between women and men down to '
               '25 per cent.')]
ty = 3.6
rule(sl, PM, ty, PW, INK, 1.5)
cw3 = PW / 3
for i, (d, t) in enumerate(tl):
    x = PM + i * cw3
    oval(sl, x, ty - 0.13, 0.26, WHITE, line=INK, lw=1.5)
    tb(sl, x, ty + 0.35, cw3 - 0.4, 0.5, d, size=22, font=DISPLAY, color=INK)
    tb(sl, x, ty + 1.0, cw3 - 0.45, 1.8, t, size=16, color=INK, spacing=1.08)
src_line(sl, 'JazzCash release notes, 23 August 2026; Mashreq; National Financial Inclusion Strategy 2024 to 2028.',
         lime=True)
say(sl, 'Why now.\n\n'
        'In August 2026 JazzCash, with about 50 million registered users, launched a committee feature. It proves '
        'demand, but it keeps the pot in the organiser\'s wallet and the organiser pays out by hand. The wallets have '
        'started; the bank-held version with a credit record does not exist yet. The first bank to offer it sets the '
        'standard.\n\n'
        'Mashreq has the pieces: a fully digital bank since September 2025, NEO for individuals, and Pakistani accounts '
        'opened from the UAE application.\n\n'
        'And the State Bank\'s targets for 2028, 75 per cent of adults with an account and a smaller gender gap, are '
        'exactly what committee members bring: mostly women, mostly outside banks today.')

# ================================================================ 11 GROWTH ===
sl = pslide('Growth', 'Every circle recruits its own members, and every completed circle starts new ones.')
loop = [('user-plus', 'A host starts a circle'), ('message-circle', 'Invites 6 to 20 people on WhatsApp'),
        ('landmark', 'Each opens a Mashreq account'), ('badge-check', 'The circle completes cleanly'),
        ('users', 'Members start circles of their own')]
lcx, lcy, lr = 4.0, 4.6, 1.35
pts_ = []
for k in range(5):
    a = math.radians(k * 72 - 90)
    pts_.append((lcx + lr * math.cos(a), lcy + lr * math.sin(a)))
for k in range(5):
    (x1_, y1_), (x2_, y2_) = pts_[k], pts_[(k + 1) % 5]
    dx, dy = x2_ - x1_, y2_ - y1_
    ln_ = math.hypot(dx, dy)
    ux, uy = dx / ln_, dy / ln_
    line(sl, x1_ + ux * 0.42, y1_ + uy * 0.42, x2_ - ux * 0.42, y2_ - uy * 0.42, L700, 1.75, arrow=True)
for k, ((ic, t), (px, py)) in enumerate(zip(loop, pts_)):
    icon_disc(sl, ic, px - 0.36, py - 0.36, d=0.72, fill_=LIME if k == 0 else LIME_XLT)
    if px > lcx + 0.3:
        tb(sl, px + 0.45, py - 0.35, 1.75, 0.7, t, size=12, anchor=MIDDLE, spacing=1.03)
    elif px < lcx - 0.3:
        tb(sl, px - 2.2, py - 0.35, 1.75, 0.7, t, size=12, anchor=MIDDLE, align=R, spacing=1.03)
    else:
        tb(sl, px - 1.3, py - 0.85, 2.6, 0.4, t, size=12, align=CEN)
x0 = 7.6
chan = [('Hosts', 'Points for each circle completed cleanly; never paid for recruiting'),
        ('Employers', 'Circles at work, as Money Fellows runs with 328 companies'),
        ('Mashreq', 'Inside NEO and the UAE application, for families across both countries'),
        ('Seasons', 'Circles timed for Ramadan, Qurbani, weddings and school fees')]
for i, (t, d) in enumerate(chan):
    y = 2.5 + i * 1.02
    tb(sl, x0, y, W - PM - x0, 0.9, [(t, dict(size=17, bold=True, color=L700, gap=2)), (d, dict(size=14))],
       spacing=1.05)
say(sl, 'How it grows.\n\n'
        'Committees grow through the person who organises them. One host brings six to twenty people, all of whom '
        'open Mashreq accounts together. When the circle completes, members who liked it start their own. That loop '
        'is why acquisition cost is shared across a whole group instead of paid per customer.\n\n'
        'Four channels feed it. Hosts earn points for every clean circle, never for recruiting, which would be a '
        'pyramid. Employers: Money Fellows reached 328 companies that offer circles to their staff, with income '
        'verified at source. Mashreq itself, inside NEO and the UAE application, for families saving across both '
        'countries. And seasons: Ramadan, Qurbani, weddings and school fees, where the saving has a date.\n\n'
        'Paid marketing comes last: a short Google and social campaign once the pilot proves completion rates.')

# ================================================================ 12 READINESS ===
sl = pslide('Readiness', 'The product is built and running in preview. The legal and risk work is written down.')
ph = phone(sl, 'home', PM, 2.2, h=4.6)
x0 = PM + 2.9
ready = [('Built', 'The application: signup, circles, automatic payment, payouts, credit record, points, the late '
                   'and exit ladders; decision engines with automated tests'),
         ('Written', 'Legal position against twelve laws and regulations; six risk and pricing models; a default '
                     'prevention design; a work register for launch'),
         ('Compliance', 'Halqa never holds money. Mashreq’s licence covers accounts and payments; Halqa works as '
                        'Mashreq’s service provider under the State Bank’s outsourcing rules'),
         ('Still to do', 'Incorporation, the agreement with Mashreq, the Mashreq connection, and public launch')]
for i, (t, d) in enumerate(ready):
    y = 2.3 + i * 1.12
    icon(sl, 'circle-check' if i < 3 else 'clock', x0, y + 0.08, 0.42, L700 if i < 3 else AMBER)
    tb(sl, x0 + 0.6, y, W - PM - x0 - 0.6, 1.05, [(t, dict(size=17, bold=True, gap=2)), (d, dict(size=13.5))],
       spacing=1.05)
say(sl, 'Where we are.\n\n'
        'The application is built and running in preview mode with sample data. It is not yet open to the public and '
        'no real money has moved: payments run in a sandbox until the bank connection exists.\n\n'
        'The thinking is written down. A legal position checked against the primary texts of twelve laws and '
        'regulations; six models for default risk, affordability, income checks, identity, cover pricing and credit '
        'scoring; and a design for preventing and recovering defaults.\n\n'
        'For Mashreq\'s risk, compliance and technology teams: Halqa never holds member money; Mashreq\'s licence '
        'covers accounts and payments; and Halqa would work as Mashreq\'s service provider under the State Bank\'s '
        'outsourcing framework, with audit rights for Mashreq and the State Bank.\n\n'
        'Still to do: incorporation, the agreement, and the technical connection to Mashreq. A detailed reference of '
        '81 pages is available for any of these.')

# ================================================================ 13 PILOT ===
sl = pslide('Pilot', 'Six months, about 1,000 members, inside limits Mashreq sets.')
gx, gl, mw = PM, 3.4, 0.82
for m in range(10):
    tb(sl, gx + gl + m * mw, 2.45, mw, 0.3, str(m + 1), size=12, color=GREY, bold=True, align=CEN)
tb(sl, gx, 2.45, gl - 0.15, 0.3, 'Month', size=12, color=GREY, bold=True, align=R)
rows_ = [('Incorporation and agreement', 1, 2, L700), ('Approvals and Shariah review', 1, 3, L700),
         ('Connection and testing', 2, 3, LIME), ('Pilot: 100 circles, 1,000 members', 4, 9, LIME),
         ('Review', 6, 6, AMBER), ('Decision to scale', 10, 10, L700)]
for i, (lab, a_, b_, col) in enumerate(rows_):
    y = 2.9 + i * 0.55
    tb(sl, gx, y, gl - 0.15, 0.45, lab, size=14, align=R, anchor=MIDDLE)
    rect(sl, gx + gl + (a_ - 1) * mw + 0.04, y + 0.07, (b_ - a_ + 1) * mw - 0.08, 0.34, col)
vrule(sl, gx + gl - 0.05, 2.85, 3.4)
tb(sl, PM, 6.35, PW, 0.5, 'Measured: accounts opened, balances, instalments collected, circles completed, defaults '
   'after collecting, complaints, cost of each member.', size=14, color=INK2)
say(sl, 'We propose a pilot before anything public.\n\n'
        'Months one to three: incorporation, the partnership agreement, Mashreq\'s approvals including the Shariah '
        'board for the Islamic window, and the technical connection with testing.\n\n'
        'Months four to nine: one full cycle of up to 100 monthly circles and about 1,000 members, all between people '
        'who know each other, inside limits Mashreq sets.\n\n'
        'A review at month six, and a decision to scale at month ten. The measures are the ones on the slide; the most '
        'important is default after collecting in the first 100 circles, because that is when a modelled loss becomes '
        'a measured one.\n\n'
        'Daily Hyper circles and circles between strangers come only after the pilot, and only with Mashreq\'s '
        'approval.')

# ================================================================ 14 REQUESTS ===
sl = pslide('Requests', 'Five decisions to start the pilot.')
asks = ['Approve the partnership, with Halqa as a service provider to Mashreq',
        'Approve the committee product for the Islamic window, and choose the cover',
        'Open accounts and direct debit mandates inside the Halqa application',
        'Provide a short term savings product, with its profit returned as points',
        'Agree the income share and the limits of a six month pilot']
for i, t in enumerate(asks):
    y = 2.45 + i * 0.86
    tb(sl, PM, y, 0.8, 0.7, str(i + 1), size=34, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, PM + 0.9, y, PW - 0.9, 0.7, t, size=20, anchor=MIDDLE)
    if i < 4:
        rule(sl, PM + 0.9, y + 0.78, PW - 0.9)
say(sl, 'Five decisions start the pilot.\n\n'
        'One, the partnership, with Halqa assessed as a service provider to Mashreq under the outsourcing framework.\n\n'
        'Two, the product for the Islamic window through Mashreq\'s Shariah board, and Mashreq\'s choice of cover: its '
        'own guarantee, insurance or takaful.\n\n'
        'Three, account opening and direct debit mandates inside the Halqa application, using Mashreq\'s own '
        'onboarding and checks.\n\n'
        'Four, a short term savings product for the days between payday and the due date, with its profit returned to '
        'members as points.\n\n'
        'Five, the income share and the pilot limits.\n\n'
        'Further requests, such as credit reporting through Mashreq\'s TASDEEQ membership, asset financing and '
        'circles for overseas Pakistanis, follow the pilot.')

# ================================================================ 15 CLOSE ===
sl = prs.slides.add_slide(BLANK)
NUM[0] += 1
rect(sl, 0, 0, W, H, LIME)
rect(sl, PM - 0.15, 0.6, 2.05, 0.72, WHITE)
lgc = pic(sl, LOGO, PM, 0.7, h=0.5)
tb(sl, PM, 2.3, PW, 1.2, 'Halqa is the system. The bank is the machine.', size=40, color=INK, font=DISPLAY)
tb(sl, PM, 3.7, 10, 0.9, 'Committee savings for the families who already use them, inside Mashreq Bank Pakistan.',
   size=20, color=INK, spacing=1.08)
tb(sl, PM, 5.55, 8, 0.35, 'Taha Amjed, Chairman, Halqa', size=15, bold=True, color=INK)
tb(sl, PM, 5.95, 10, 0.35, 'A detailed reference of 81 pages covers the law, the product, the economics and the '
   'evidence.', size=13, color=INK2)
tb(sl, W - PM - 0.6, 7.0, 0.6, 0.3, str(NUM[0]), size=11, color=INK, align=R)
say(sl, 'To close: committees are the savings habit Pakistan already has. Halqa runs them; Mashreq holds and moves '
        'the money. Members get safety, a fair flat fee and a credit record; Mashreq gets deposits, customers in '
        'groups and a lending book.\n\n'
        'We would welcome Mashreq\'s questions, and we have a detailed reference of 81 pages for any area the risk, '
        'compliance or technology teams want to examine.')

# ==================================================================== save ===
cp = prs.core_properties
cp.title = 'Halqa: presentation for Mashreq Bank Pakistan'
cp.author = 'Halqa'
prs.save(OUTP)
bad = []
for n, s in enumerate(prs.slides, 1):
    for shp in s.shapes:
        if shp.has_text_frame:
            t = shp.text_frame.text
            for pat in (r'\byou\b', r'\byour\b', r'\bwe\b', r'\bour\b', u'[‒–—―]', r' - ',
                        r'(?i)\bjourney\b|\bunlock|\bseamless|\bempower|\bleverag|\brevolution|Akif|Saeed|Kazi|'
                        r'father|Sidra'):
                if re.search(pat, t):
                    bad.append((n, pat, t[:70]))
print('slides', len(prs.slides), 'bytes', os.path.getsize(OUTP))
for b in bad:
    print('CHECK', b)
