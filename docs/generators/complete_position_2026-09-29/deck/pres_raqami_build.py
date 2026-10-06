# -*- coding: utf-8 -*-
"""
Halqa: presentation for Raqami Islamic Digital Bank (29 September 2026).

Same style and skeleton as the Mashreq presentation, version 3 (pres3_build.py), adapted to Raqami: a fully Islamic
digital retail bank, its own products (Asaan and Full digital accounts, Mudarabah Savings, 7 day Mudarabah
Certificates, Saving Pots, free Raqami and Raast transfers, cash deposits at Askari Bank branches), its takaful
partner, its resident-only onboarding and its half year accounts to 30 June 2026. Every exhibit carries real
structure or data; no icons, badges or rings. Raqami purple marks only what belongs to the bank.
Usage: python pres_raqami_build.py [out.pptx]
"""
import os, sys, math

HERE = os.path.dirname(os.path.abspath(__file__))
G = {'__file__': os.path.join(HERE, 'd2_lib.py'), '__name__': 'presrq'}
exec(compile(open(os.path.join(HERE, 'd2_lib.py'), encoding='utf-8').read(), 'd2_lib.py', 'exec'), G)
globals().update({k: v for k, v in G.items() if not k.startswith('__')})

OUTP = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'Halqa-Presentation-Raqami.pptx')
RQ_LOGO = os.path.join(HERE, '..', 'logos', 'raqami-logo-colour.png')
RQ = C('573F99')          # Raqami purple (from its logo)
RQ_LT = C('E9E4F4')
PM = 0.7
PW = W - 2 * PM
RX = W - PM
NUM = [0]
TINT = C('F7FAF3')
EMPTY = C('E4EAE0')


def say(sl, text):
    sl.notes_slide.notes_text_frame.text = text


def pslide(title, statement=None, bg=None, logo=True, stmt_size=22):
    sl = prs.slides.add_slide(BLANK)
    NUM[0] += 1
    if bg is not None:
        rect(sl, 0, 0, W, H, bg)
    tb(sl, PM, 0.48, 9.6, 0.6, title, size=28, color=INK if bg == LIME else L700, font=DISPLAY)
    if statement:
        tb(sl, PM, 1.12, 11.2, 0.9, statement, size=stmt_size, color=INK, spacing=1.06)
    if logo:
        lg = pic(sl, LOGO, 0, 0.54, h=0.34)
        lg.left = E(RX) - lg.width
    tb(sl, RX - 0.6, 7.02, 0.6, 0.3, str(NUM[0]), size=11, color=INK if bg == LIME else GREY, align=R)
    return sl


def sources(sl, items, y=6.74, dark=False):
    txt = '   '.join('%d  %s' % (i + 1, s) for i, s in enumerate(items))
    rule(sl, PM, y - 0.06, PW - 0.9, INK2 if dark else RULE, 0.75)
    tb(sl, PM, y, PW - 0.9, 0.36, [[('Sources   ', dict(size=10, bold=True, color=INK if dark else L700)),
                                   (txt, dict(size=10, color=INK2 if dark else GREY))]], spacing=1.03)


# ---------------------------------------------------------------- drawing ---
def poly(sl, pts, color, line_=None, lw=0.75):
    fb = sl.shapes.build_freeform(E(pts[0][0]), E(pts[0][1]), scale=1.0)
    fb.add_line_segments([(E(x), E(y)) for x, y in pts[1:]], close=True)
    s = fb.convert_to_shape()
    _nostyle(s)
    if color is None:
        s.fill.background()
    else:
        s.fill.solid()
        s.fill.fore_color.rgb = color
    if line_ is None:
        s.line.fill.background()
    else:
        s.line.color.rgb = line_
        s.line.width = Pt(lw)
    return s


def path(sl, pts, color=L700, lw=1.5, arrow=False, dash=False):
    fb = sl.shapes.build_freeform(E(pts[0][0]), E(pts[0][1]), scale=1.0)
    fb.add_line_segments([(E(x), E(y)) for x, y in pts[1:]], close=False)
    s = fb.convert_to_shape()
    _nostyle(s)
    s.fill.background()
    s.line.color.rgb = color
    s.line.width = Pt(lw)
    ln = s.line._get_or_add_ln()
    if dash:
        etree.SubElement(ln, qn('a:prstDash')).set('val', 'dash')
    if arrow:
        te = etree.SubElement(ln, qn('a:tailEnd'))
        te.set('type', 'triangle'); te.set('w', 'med'); te.set('len', 'med')
    return s


def arc(sl, cx, cy, r, a0, a1, color=L700, lw=2.0, arrow=True, n=36):
    pts = [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * k / n)),
            cy + r * math.sin(math.radians(a0 + (a1 - a0) * k / n))) for k in range(n + 1)]
    return path(sl, pts, color, lw, arrow)


def sq(sl, x, y, s, color):
    return rect(sl, x, y, s, s, color)


def waffle(sl, x, y, n_fill, colors, pitch=0.2, cell=0.155, cols=10, rows=10, total=None):
    total = total or cols * rows
    k = 0
    bounds = []
    acc = 0
    for cnt, col in colors:
        acc += cnt
        bounds.append((acc, col))
    for c in range(cols):
        for r in range(rows):
            if k >= total:
                return
            col = EMPTY
            for b, cc in bounds:
                if k < b:
                    col = cc
                    break
            sq(sl, x + c * pitch, y + (rows - 1 - r) * pitch, cell, col)
            k += 1


def harvey(sl, cx, cy, d, level, color=L700):
    r = d / 2.0
    if level == 2:
        oval(sl, cx - r, cy - r, d, color, line=color, lw=1.25)
        return
    oval(sl, cx - r, cy - r, d, WHITE, line=color, lw=1.25)
    if level == 1:
        pts = [(cx + r * math.cos(math.radians(a)), cy + r * math.sin(math.radians(a))) for a in range(-90, 91, 6)]
        poly(sl, pts, color)


def band(sl, x0, a0, b0, x1, a1, b1, color, n=30):
    top, bot = [], []
    for k in range(n + 1):
        t = k / float(n)
        s = t * t * (3 - 2 * t)
        x = x0 + (x1 - x0) * t
        top.append((x, a0 + (a1 - a0) * s))
        bot.append((x, b0 + (b1 - b0) * s))
    return poly(sl, top + bot[::-1], color)


def fig(sl, x, y, w, n_, label, nsize=30, lsize=13.5, color=L700, lcolor=INK, gap=0.1):
    tb(sl, x, y, w, nsize / 72.0 + 0.1, n_, size=nsize, color=color, font=DISPLAY)
    tb(sl, x, y + nsize / 72.0 + gap, w, 0.7, label, size=lsize, color=lcolor, spacing=1.04)


# ================================================================ 1 COVER ===
sl = prs.slides.add_slide(BLANK)
NUM[0] += 1
rect(sl, 8.6, 0, W - 8.6, H, LIME)
ph = phone(sl, 'home', 0, 0.55, h=6.4)
ph.left = E(8.6 + (W - 8.6) / 2) - ph.width // 2
lg = pic(sl, LOGO, PM, 0.86, h=0.6)
lgw = lg.width / 914400.0
vrule(sl, PM + lgw + 0.35, 0.68, 0.98, GREY_LT, 1.0)
pic(sl, RQ_LOGO, PM + lgw + 0.7, 0.66, h=1.02)
tb(sl, PM, 2.45, 7.6, 1.7, 'Committee savings, held and moved by an Islamic bank', size=40, color=INK, font=DISPLAY,
   spacing=0.98)
tb(sl, PM, 4.35, 7.4, 0.5, 'A proposal for Raqami Islamic Digital Bank', size=20, color=L700)
tb(sl, PM, 6.0, 6, 0.35, 'Taha Amjed, Chairman, Halqa', size=14, bold=True)
tb(sl, PM, 6.38, 6, 0.3, DATE, size=12, color=GREY)
say(sl, 'Opening, 30 seconds. Halqa takes the committee, the savings habit most Pakistani families already use, and runs '
        'it inside Raqami. A committee is interest free by nature: every member pays in exactly what they take out, so it '
        'belongs naturally in an Islamic bank. Raqami holds and moves every rupee; Halqa runs the circle. We will cover the '
        'market, the problem, the proposal, what each side gains, how it works, how defaults are prevented and recovered, '
        'the money, the competition, the evidence, why now, growth, readiness, a one month pilot and six requests.')

# ================================================================ 2 HOW A COMMITTEE WORKS: payment matrix ===
sl = pslide('How a Committee Works', 'Everyone pays in every month. One member takes the pot. No interest.')
mx0, my0, pit, cel = 1.6, 2.6, 0.325, 0.27
tb(sl, mx0, 2.0, 12 * pit, 0.3, 'Month', size=11, bold=True, color=GREY, align=CEN)
for j in range(12):
    tb(sl, mx0 + j * pit - 0.05, 2.28, cel + 0.1, 0.28, str(j + 1), size=10.5, color=GREY, align=CEN)
for i in range(12):
    tb(sl, mx0 - 0.45, my0 + i * pit - 0.01, 0.35, cel, str(i + 1), size=10.5, color=GREY, align=R, anchor=MIDDLE)
    for j in range(12):
        sq(sl, mx0 + j * pit, my0 + i * pit, cel, L700 if i == j else LIME_LT)
mlab = tb(sl, 0, 0, 2.0, 0.3, 'Member', size=11, bold=True, color=GREY, align=CEN)
mlab.rotation = 270.0
mlab.left, mlab.top = E(0.86 - 1.0), E(my0 + 6 * pit - 0.15)
mright = mx0 + 12 * pit
yr1 = my0 + cel / 2
yr12 = my0 + 11 * pit + cel / 2
line(sl, mright + 0.08, yr1, 6.25, yr1, GREY_LT, 0.75)
line(sl, mright + 0.08, yr12, 6.25, yr12, GREY_LT, 0.75)
tb(sl, 6.4, yr1 - 0.2, RX - 6.4, 0.4, [[('First turn   ', dict(size=15, bold=True, color=L700)),
                                       ('an interest free advance, repaid over the year', dict(size=15))]],
   anchor=MIDDLE)
tb(sl, 6.4, yr12 - 0.2, RX - 6.4, 0.4, [[('Last turn   ', dict(size=15, bold=True, color=L700)),
                                        ('saving, with a deadline the group enforces', dict(size=15))]],
   anchor=MIDDLE)
fig(sl, 6.4, 3.35, 5.8, 'Rs 10,000', 'paid in by every member, every month', nsize=32, lsize=15)
fig(sl, 6.4, 4.65, 5.8, 'Rs 120,000', 'taken by one member each month, in a fixed order', nsize=32, lsize=15)
ly = my0 + 12 * pit + 0.1
sq(sl, mx0, ly + 0.04, 0.15, L700)
tb(sl, mx0 + 0.22, ly, 1.6, 0.25, 'collects the pot', size=11, color=GREY)
sq(sl, mx0 + 1.9, ly + 0.04, 0.15, LIME_LT)
tb(sl, mx0 + 2.12, ly, 1.8, 0.25, 'pays Rs 10,000', size=11, color=GREY)
say(sl, 'For anyone who has not been in one: a committee, also called a kameti or BC. The grid shows a circle of twelve at '
        'Rs 10,000. Every row is a member, every column a month. Every member pays in every month; the dark square is '
        'the month that member takes the whole Rs 120,000.\n\n'
        'By the end everyone has paid and received exactly the same, with no interest. The member who collects first '
        'has in effect received an interest free advance, a qard, and repays it over the year; the member who collects '
        'last has saved under a deadline the group enforces. It works because people know each other.')

# ================================================================ 3 THE MARKET: waffle ===
sl = pslide('The Market', 'About four in ten Pakistanis save in committees.')
waffle(sl, PM, 2.3, 41, [(34, L700), (7, LIME_MID)], pitch=0.32, cell=0.26)
sq(sl, PM, 5.66, 0.15, L700)
tb(sl, PM + 0.22, 5.61, 3.2, 0.26, '34%, Karandaaz [1]', size=12, color=INK2)
sq(sl, PM, 5.96, 0.15, LIME_MID)
tb(sl, PM + 0.22, 5.91, 3.2, 0.26, '41%, Oraan [1]', size=12, color=INK2)
fig(sl, 4.45, 2.2, 3.8, '34% to 41%', 'of Pakistanis save in committees [1]', nsize=34, lsize=14)
fig(sl, 4.45, 3.6, 3.8, 'About 100 million', 'people, on the higher estimate [2]', nsize=30, lsize=14)
fig(sl, 4.45, 4.95, 3.8, 'Rs 4 trillion', 'a year, estimated [1]', nsize=30, lsize=14)
rx0 = 8.35
tb(sl, rx0, 2.2, RX - rx0, 0.4, 'A typical committee', size=17, color=INK, font=DISPLAY)
rule(sl, rx0, 2.66, RX - rx0, L700, 1.25)
typ = [('3 to 12', 'members in digital versions [3]'), ('91%', 'run monthly [4]'),
       ('US$18', 'average instalment a cycle, 2013 [4]'), ('Women', 'take part at twice the rate of men [5]'),
       ('56%', 'of adults have one within 1 km [6]')]
for i, (n_, t) in enumerate(typ):
    y = 2.74 + i * 0.64
    tb(sl, rx0, y, 1.3, 0.58, n_, size=19, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, rx0 + 1.32, y, RX - rx0 - 1.32, 0.58, t, size=12.5, anchor=MIDDLE, spacing=1.03)
    rule(sl, rx0, y + 0.61, RX - rx0)
sources(sl, ['Karandaaz and Oraan (Dawn, 12 Dec 2022)', 'Oraan case study, PICG, 2024', 'Oraan and JazzCash products',
             'FII tracker, 2013', 'FII', 'FII wave 5, 2017'])
say(sl, 'The size of the habit. The waffle is one hundred Pakistanis: Karandaaz puts committee use at 34 per cent, the dark '
        'squares; Oraan\'s research at 41 per cent, the light ones. Oraan equates that to about 100 million people, and '
        'estimates about Rs 4 trillion a year flows through committees. These are estimates; there is no official count, '
        'which is itself part of the problem.\n\n'
        'A typical committee is small and monthly: digital versions run 3 to 12 members, nine in ten are monthly, and in '
        'the 2013 national survey the average instalment was about US$18 a cycle, from under US$1 to US$470. Women take '
        'part at twice the rate of men, and 56 per cent of adults have a committee within a kilometre of home. These are '
        'exactly the students, women, part time workers and small traders Raqami was set up to serve.')

# ================================================================ 4 THE PROBLEM: small multiples ===
sl = pslide('The Problem', 'Committees run on trust and cash, outside any bank.')
pw4 = (PW - 3 * 0.45) / 4
panels = [(12, RED, None, '12%', 'of committee users have lost money to fraud [1]'),
          (117, RED, 12, '117', 'committees emptied by one Facebook organiser in 2022, about Rs 420 million [2]'),
          (63, GREY, None, '63%', 'of savers keep their savings as cash at home [1]'),
          (4, L700, None, '4%', 'of savers use a bank or other formal institution [1]')]
for i, (n_fill, col, cols, big_, lab) in enumerate(panels):
    x = PM + i * (pw4 + 0.45)
    if cols:
        waffle(sl, x, 2.25, n_fill, [(n_fill, col)], cols=cols, total=n_fill)
    else:
        waffle(sl, x, 2.25, n_fill, [(n_fill, col)])
    tb(sl, x, 4.42, pw4, 0.7, big_, size=40, color=col if col != GREY else INK2, font=DISPLAY)
    tb(sl, x, 5.2, pw4 - 0.05, 0.8, lab, size=13.5, spacing=1.05)
tb(sl, PM, 6.12, PW, 0.4, 'None of it builds a credit record.', size=17, bold=True, color=INK)
sources(sl, ['Financial Inclusion Insights surveys of Pakistan', 'Dawn, 12 December 2022'])
say(sl, 'What goes wrong, as four small charts of one hundred people each, except the second, which is the 117 committees '
        'one organiser emptied. One person holds the cash: 12 per cent of committee users say they have lost money to an '
        'organiser or a member, and in 2022 one Facebook organiser took about Rs 420 million across 117 committees. The '
        'money stays outside banks: 63 per cent of savers keep cash at home, and only 4 per cent use a formal '
        'institution. And nothing is recorded, so ten years of paying on time builds no credit record.')

# ================================================================ 5 THE PROPOSAL: sequence diagram ===
sl = pslide('The Proposal', 'Halqa is the system. Raqami is the machine.')
tb(sl, PM, 1.62, 11.4, 0.35, 'Every rupee stays inside Raqami, under the State Bank’s regulation and Raqami’s Shariah '
   'Board.', size=15, color=GREY)
xm, xh, xb = 2.05, 6.67, 11.28
hy = 2.2
for x, name, sub, col, lw_, fillc in [(xm, 'Member', 'in their own Raqami account', INK2, 1.0, WHITE),
                                      (xh, 'Halqa', 'rules, turns, checks, records', L700, 1.5, LIME_XLT),
                                      (xb, 'Raqami', 'accounts, debit, payout', RQ, 1.5, WHITE)]:
    rect(sl, x - 1.2, hy, 2.4, 0.5, fillc, line=col, lw=lw_,
         paras=[(name, dict(size=15, bold=True, color=INK if col == INK2 else col, align=CEN))], pad=0.02,
         anchor=MIDDLE)
    tb(sl, x - 1.7, hy + 0.54, 3.4, 0.3, sub, size=11.5, color=GREY, align=CEN)
    line(sl, x, hy + 0.9, x, 6.45, GREY_LT, 1.0, dash=True)
msgs = [(3.45, xm, xh, 'joins a circle; gives a standing instruction', 'i'),
        (4.0, xh, xb, 'collect on the due date', 'i'),
        (4.62, xm, xb, 'Rs 10,000 from each member’s account', 'm'),
        (5.22, xh, xb, 'pay this month’s collector', 'i'),
        (5.84, xb, xm, 'Rs 120,000 to the collector, free, the same day', 'm'),
        (6.36, xb, xh, 'confirmation; the record updates', 'r')]
for y, a, b, lab, kind in msgs:
    if kind == 'm':
        line(sl, a, y, b, y, L700, 4.5, arrow=True)
        tb(sl, min(a, b) + 0.12, y - 0.36, xh - min(a, b) - 0.3, 0.3, lab, size=12.5, bold=True, color=L700)
        tb(sl, xh + 0.1, y - 0.33, 2.2, 0.28, 'not through Halqa', size=11, color=GREY, italic=True)
    else:
        line(sl, a, y, b, y, INK2 if kind == 'i' else GREY, 1.25, arrow=True, dash=(kind == 'r'))
        tb(sl, min(a, b) + 0.12, y - 0.33, abs(b - a) - 0.24, 0.28, lab, size=12, color=INK2, align=CEN)
line(sl, PM, 6.86, PM + 0.45, 6.86, L700, 4.5)
tb(sl, PM + 0.55, 6.74, 1.2, 0.25, 'money', size=11, color=GREY)
line(sl, PM + 1.6, 6.86, PM + 2.05, 6.86, INK2, 1.25)
tb(sl, PM + 2.15, 6.74, 3.0, 0.25, 'instructions and records', size=11, color=GREY)
say(sl, 'The proposal is a division of work, drawn as the order of events in one month. The member joins a circle in the '
        'Halqa application and gives Raqami a standing instruction. Halqa tells Raqami to collect on the due date; '
        'Raqami debits Rs 10,000 from each member\'s own account. Halqa tells Raqami who collects this month; Raqami pays '
        'the Rs 120,000 by a free Raqami transfer the same day and confirms, and the record updates.\n\n'
        'The thick lines are money: they run only between members and Raqami, never through Halqa. A company holding '
        'public money would be taking deposits, which only a bank may do, and a system like this needs State Bank '
        'regulation. Working inside Raqami\'s licence answers both: Halqa operates as Raqami\'s service provider under '
        'the State Bank\'s outsourcing framework, and every structure goes to Raqami\'s Shariah Board before launch. '
        'Raqami describes itself as an open API, banking as a service platform, which is exactly how Halqa connects.')

# ================================================================ 6 MUTUAL BENEFIT ===
sl = pslide('Mutual Benefit', 'Members get a safe committee. Raqami gets deposits and a financing book.')
tb(sl, PM, 2.2, 6.2, 0.35, 'Deposits, Rs billion', size=13, bold=True, color=INK)
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, PM - 0.05, 2.55, 6.3, 2.45,
      ['Raqami, 30 June 2026', 'Added by 100,000 members', 'Added by 1,000,000 members'],
      [('Rs bn', [1.58, 2.5, 25])], point_colors=[RQ, LIME, L700], fmt='General', gap=45, size=13,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=29)
tb(sl, PM, 5.05, 6.2, 0.5, 'Assumes Rs 25,000 average balance a member; Raqami’s own data replaces it [1]', size=11,
   color=GREY, spacing=1.04)
tb(sl, PM, 5.55, 6.3, 0.9, [[('114,452', dict(size=20, color=RQ, font=DISPLAY)),
                             ('  accounts at 30 June 2026 [1]', dict(size=13))],
                            [('1,000,000', dict(size=20, color=RQ, font=DISPLAY)),
                             ('  customers targeted within three years [2]', dict(size=13))]], spacing=1.1)
x0 = 7.2
cw2 = (RX - x0 - 0.3) / 2
tb(sl, x0, 2.2, cw2, 0.35, 'For Raqami', size=15, bold=True, color=RQ)
tb(sl, x0 + cw2 + 0.3, 2.2, cw2, 0.35, 'For members', size=15, bold=True, color=L700)
rule(sl, x0, 2.62, cw2, RQ, 1.25)
rule(sl, x0 + cw2 + 0.3, 2.62, cw2, L700, 1.25)
mb = [('Low cost deposits', 'No organiser holding cash'), ('Groups of 6 to 20 customers', 'Automatic payment on payday'),
      ('Women, freelancers, traders', 'Profit returned as points'), ('Payment records to finance on',
                                                                     'A credit record'),
      ('Takaful and financing income', 'Financing after a clean circle')]
for i, (a_, b_) in enumerate(mb):
    y = 2.7 + i * 0.62
    tb(sl, x0, y, cw2, 0.56, a_, size=13.5, anchor=MIDDLE, spacing=1.03)
    tb(sl, x0 + cw2 + 0.3, y, cw2, 0.56, b_, size=13.5, anchor=MIDDLE, spacing=1.03)
    rule(sl, x0, y + 0.59, cw2)
    rule(sl, x0 + cw2 + 0.3, y + 0.59, cw2)
sources(sl, ['Raqami half year report to 30 June 2026: deposits Rs 1,581 million; 114,452 accounts; Islamic financing '
             'Rs 27.6 million', 'Bloomberg, 22 January 2026'])
say(sl, 'Both sides gain. Raqami\'s own plan is a million customers within three years, and its rating agency notes that '
        'long term success depends on mobilising low cost deposits. Committees answer both: customers arrive as a group '
        'of six to twenty, each opening a Raqami account; salaries and instalments sit in Raqami accounts; the members are '
        'mostly women, and many are freelancers and small traders, the segments Raqami names in its mission.\n\n'
        'At 30 June 2026 Raqami had 114,452 accounts, Rs 1.58 billion of deposits and Rs 27.6 million of Islamic '
        'financing. On our assumption of Rs 25,000 average balance, 100,000 members would add about Rs 2.5 billion of '
        'deposits, more than Raqami held at 30 June, and a million members about Rs 25 billion. Raqami\'s own data should '
        'replace the assumption. Every committee payment is a repayment record Raqami can finance against, which suits '
        'its planned auto and supply chain financing; takaful and asset financing are income lines.\n\n'
        'For members: no organiser holding cash, automatic payment on payday, mudarabah profit on balances returned as '
        'points at the member\'s election, a credit record, and a route to financing.')

# ================================================================ 7 RAQAMI PRODUCTS: line map ===
sl = pslide('Raqami Products in Use', 'Existing Raqami products at every step. Three new lines.')
yl = 3.3
cw6 = PW / 6
line(sl, PM, yl, RX, yl, L700, 5.0)
steps7 = [('Open', 'Asaan Digital Account', 'CNIC and mobile; opens at once'),
          ('Salary in', 'Mudarabah Savings Account', 'profit shared from actual performance'),
          ('Held', '7 day Mudarabah Certificate', 'from payday to the due date'),
          ('Payout', 'Free Raqami transfer', 'the pot, the same day'),
          ('Save on', 'Saving Pots', 'goal based; eligible pots earn profit'),
          ('Cash in', 'Askari Bank branches', 'free cash deposits at 750+')]
xs7 = []
for i, (st_, prod, det) in enumerate(steps7):
    xc = PM + i * cw6 + 0.16
    xs7.append(xc)
    oval(sl, xc - 0.15, yl - 0.15, 0.3, WHITE, line=L700, lw=3.0)
    tb(sl, xc - 0.16, yl - 0.67, cw6 - 0.1, 0.4, st_, size=16, bold=True, color=INK)
    tb(sl, xc + 0.24, yl + 0.27, cw6 - 0.36, 0.6, prod, size=13, bold=True, color=L700, spacing=1.02)
    tb(sl, xc + 0.24, yl + 0.87, cw6 - 0.36, 0.6, det, size=11.5, color=GREY, spacing=1.03)
yb = 5.35
path(sl, [(xs7[2], yl + 0.16), (xs7[2], yb), (RX - 0.3, yb)], RQ, 3.0, arrow=False, dash=True)
tb(sl, xs7[2] - 2.2, yb - 0.5, 2.05, 0.35, 'New lines', size=14, bold=True, color=RQ, align=R)
for xc, t, d in [(5.75, 'Standing instruction', 'automatic debit on the due date, by open API'),
                 (8.1, 'Committee takaful', 'with EFU window takaful, Raqami’s existing partner'),
                 (10.45, 'Asset financing', 'ijarah for motorcycles and machines')]:
    oval(sl, xc - 0.14, yb - 0.14, 0.28, WHITE, line=RQ, lw=2.5)
    tb(sl, xc - 0.16, yb + 0.25, 2.2, 0.35, t, size=14, bold=True, color=RQ)
    tb(sl, xc - 0.16, yb + 0.6, 2.15, 0.6, d, size=12, color=GREY, spacing=1.03)
sources(sl, ['Raqami products, FAQ and schedule of charges (July to December 2026), read 29 September 2026; news of '
             '21 April 2026 and 25 November 2025'])
say(sl, 'This slide matters to the product team: almost everything uses products Raqami already has, drawn as one line '
        'through the life of a committee.\n\n'
        'The Asaan Digital Account opens inside our application on a CNIC and a mobile number, at once; the Full account '
        'follows for larger circles. Salary lands in the Mudarabah Savings Account. For the week between payday and the '
        'due date the instalment can sit in a 7 day Mudarabah Certificate, so even that week earns a share of real '
        'profit; that profit comes back to members as points at the end of the circle, at the member\'s election. The '
        'payout is a free Raqami transfer the same day. After the circle, savings stay in Saving Pots, which already '
        'support goal based saving. Members who earn in cash, such as market traders, deposit it free at more than 750 '
        'Askari Bank branches.\n\n'
        'The dashed branch is new: a standing instruction for automatic debit on the due date, built on Raqami\'s open '
        'API; committee takaful for defaults, with EFU window takaful, which already covers Raqami\'s cards; and ijarah '
        'financing for motorcycles and machines bought through asset circles, which fits Raqami\'s planned auto '
        'financing.')

# ================================================================ 8 HOW IT WORKS ===
sl = pslide('How It Works', 'Four steps, all inside the Halqa application.', bg=TINT)
steps = [('circles', 'Join a circle'), ('autopay', 'Pay automatically'), ('activity', 'Collect the pot'),
         ('credit', 'Build a credit record')]
pw_, ph_h = 2.05, 4.3
gap_ = (PW - 4 * pw_) / 3
for i, (nm, t) in enumerate(steps):
    x = PM + i * (pw_ + gap_)
    ph = phone(sl, nm, x, 2.05, h=ph_h)
    ph.left = E(x + (pw_ - ph.width / 914400.0) / 2)
    tb(sl, x - 0.05, 6.48, 0.45, 0.5, str(i + 1), size=24, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x + 0.4, 6.48, pw_ + 0.2, 0.5, t, size=15, bold=True, anchor=MIDDLE)
say(sl, 'The application as it runs today, in preview. One, join a circle and pick a turn from those open to you. Two, '
        'the instalment is debited automatically on the due date; if salary is late, the debit is retried each morning '
        'for up to five days. Three, on your turn the whole pot arrives the same day. Four, every payment is reported, '
        'so committee payments finally count towards a credit record. Messages come on WhatsApp in Roman Urdu first.')

# ================================================================ 9 ONBOARDING: swimlane ===
sl = pslide('Onboarding and Verification', 'Raqami checks the customer. Halqa’s engines check the member.')
lanes = [('Member', INK, 2.15, 3.3), ('Raqami', RQ, 3.3, 4.45), ('Halqa engines', L700, 4.45, 6.3)]
for name, col, ya, yb_ in lanes:
    tb(sl, PM, ya, 1.6, yb_ - ya, name, size=14, bold=True, color=col, anchor=MIDDLE)
    rule(sl, PM, ya, PW, RULE, 0.75)
rule(sl, PM, 6.3, PW, RULE, 0.75)
vrule(sl, PM + 1.65, 2.15, 4.15, RULE, 0.75)
bw9, bh9 = 1.45, 0.5
bx9 = [2.55, 4.25, 5.95, 7.65, 9.35, 11.05]
by9 = [2.4, 3.48, 4.68, 4.68, 4.68, 4.68]
bl9 = ['Signup', 'Account', 'Identity', 'Income', 'Affordability', 'Score']
bc9 = [INK2, RQ, L700, L700, L700, L700]
bd9 = ['phone, passcode, PIN', 'CNIC and mobile; Asaan account at once',
       'names match 0.90 or more; live face; home; job', 'salary on a regular day; daily income for Hyper',
       'all instalments within a third of income', '300 to 850; opens the turns']
for i in range(6):
    rect(sl, bx9[i], by9[i], bw9, bh9, WHITE, line=bc9[i], lw=1.25,
         paras=[(bl9[i], dict(size=13, bold=True, color=INK if i == 0 else bc9[i], align=CEN))], pad=0.02,
         anchor=MIDDLE)
    tb(sl, bx9[i] - 0.12, by9[i] + bh9 + 0.05, bw9 + 0.24, 0.62, bd9[i], size=11, color=GREY, align=CEN,
       spacing=1.03)
path(sl, [(bx9[0] + bw9, by9[0] + bh9 / 2), (bx9[1] + bw9 / 2, by9[0] + bh9 / 2), (bx9[1] + bw9 / 2, by9[1])],
     INK2, 1.25, arrow=True)
path(sl, [(bx9[1] + bw9, by9[1] + bh9 / 2), (bx9[2] + bw9 / 2, by9[1] + bh9 / 2), (bx9[2] + bw9 / 2, by9[2])],
     INK2, 1.25, arrow=True)
for i in (2, 3, 4):
    line(sl, bx9[i] + bw9 + 0.02, by9[i] + bh9 / 2, bx9[i + 1] - 0.02, by9[i] + bh9 / 2, INK2, 1.25, arrow=True)
line(sl, bx9[5] + bw9 / 2, by9[5], bx9[5] + bw9 / 2, 3.02, L700, 1.5, arrow=True)
tb(sl, bx9[5] - 1.45, 2.4, bw9 + 1.55, 0.6, 'offered only the circles and turns open to this member', size=12,
   bold=True, color=L700, align=R, spacing=1.03)
tb(sl, PM, 6.38, PW, 0.3, 'Levels: known circles 1, circles between strangers 2, Hyper 3.   Residents aged 18 and over. '
   '  Stored: results only, never face images, card numbers or bank passwords.', size=11.5, color=GREY)
say(sl, 'How a member gets in, lane by lane: who does each check. After signup, Raqami opens the account with its own '
        'checks: a valid CNIC and the registered mobile number, with the Asaan Digital Account opening on successful '
        'verification and the Full Digital Account after document review. Raqami currently onboards residents aged 18 '
        'and over, which matches Halqa, since only adults can contract. Then three Halqa engines run.\n\n'
        'The identity engine compares the names on the CNIC, the bank account and the application, 0.90 or more passes '
        'and 0.80 to 0.90 goes to a person; it adds a live face match, checks home against the declared address and the '
        'declared job against the income seen.\n\n'
        'The income engine reads the account the income arrives in: salary from one employer on about the same day each '
        'month; for daily circles, Rs 1,000 or more on five days a week for eight weeks. Transfers from the member\'s own '
        'accounts and financing do not count. It learns the payday, so the debit lands when the money is there.\n\n'
        'The affordability engine keeps all instalments within a third of verified income, 40 per cent with other '
        'financing, the limit the State Bank uses for consumer finance, and from the fourth circle total still owed '
        'within a year of income. The score, 300 to 850, then decides which turns are open. Known circles need level 1, '
        'circles between strangers level 2, Hyper level 3.')

# ================================================================ 10 COMMITTEE TYPES ===
sl = pslide('Committee Types', 'The less members know each other, the more the checks.')
types = ['Known', 'Unknown', 'Large unknown', 'Asset', 'Hyper']
rows10 = [('Members', ['6 to 12', '12', '20', '12', '390 to 400']),
          ('Instalment', ['Rs 2,000 to 10,000', 'Rs 10,000', 'Rs 25,000', 'Rs 10,000', 'Rs 450 to 500']),
          ('Cadence', ['Monthly or weekly', 'Monthly', 'Monthly', 'Monthly', 'Daily']),
          ('Checks level', ['1', '2', '2', '2', '3']),
          ('Income checked', [0, 1, 1, 1, 1]),
          ('Automatic debit', [0, 1, 1, 1, 1]),
          ('Takaful cover', [0, 1, 1, 1, 1]),
          ('Credit report read', [0, 1, 1, 1, 1]),
          ('Early turns earned', [1, 1, 1, 1, 1])]
lw10 = 2.55
cwt = (PW - lw10) / len(types)
y0 = 2.1
for j, t in enumerate(types):
    paras = [(t, dict(size=14, bold=True, color=AMBER if t == 'Hyper' else L700, align=CEN))]
    if t == 'Hyper':
        paras.append(('experimental', dict(size=10, color=GREY, align=CEN)))
    tb(sl, PM + lw10 + j * cwt, y0 - 0.2, cwt - 0.05, 0.65, paras, anchor=BOTTOM, spacing=1.0)
rule(sl, PM, y0 + 0.5, PW, L700, 1.25)
for i, (lab, vals) in enumerate(rows10):
    y = y0 + 0.56 + i * 0.42
    tb(sl, PM, y, lw10 - 0.1, 0.4, lab, size=13.5, anchor=MIDDLE)
    for j, v in enumerate(vals):
        xc = PM + lw10 + j * cwt
        if isinstance(v, int):
            harvey(sl, xc + cwt / 2, y + 0.2, 0.2, 2 if v else 0)
        else:
            tb(sl, xc, y, cwt - 0.05, 0.4, v, size=12.5, align=CEN, anchor=MIDDLE)
    rule(sl, PM, y + 0.41, PW)
yl10 = y0 + 0.56 + 9 * 0.42 + 0.12
harvey(sl, PM + 0.1, yl10 + 0.13, 0.18, 2)
tb(sl, PM + 0.28, yl10, 1.4, 0.26, 'required', size=11.5, color=GREY)
harvey(sl, PM + 1.45, yl10 + 0.13, 0.18, 0)
tb(sl, PM + 1.63, yl10, 1.6, 0.26, 'not required', size=11.5, color=GREY)
tb(sl, PM + 3.2, yl10, PW - 3.2, 0.26, 'Known: family, colleagues or neighbours. Every structure goes to Raqami’s Shariah '
   'Board first.', size=11.5, color=GREY)
say(sl, 'Five kinds of circle, and what each asks of its members. Known circles, between family, colleagues or neighbours, '
        'including the weekly bazaar committee, need only identity checks, because the group itself knows its members. '
        'Circles between strangers need the income account, automatic debit, takaful cover and a credit report; the '
        'large ones are the committees in lakhs. Asset circles buy a motorcycle or machine with Raqami\'s ijarah '
        'financing. Hyper, the daily circle, asks the most and is labelled experimental.\n\n'
        'In every type the early turns must be earned: a new member starts at the back.\n\n'
        'Two notes for an Islamic bank. Every structure, the flat service fee, the takaful cover, the charity '
        'destination of late charges and the points, goes to Raqami\'s Shariah Board before launch, and anything the '
        'Board cannot approve is not offered through Raqami. Circles for families overseas follow when Raqami opens '
        'accounts to non residents; today it onboards residents only.')

# ================================================================ 11 DEFAULT PREVENTION: exposure by turn ===
sl = pslide('Default Prevention', 'Early turns carry the risk. Only strong scores may take them.')
tb(sl, PM, 2.12, 6.8, 0.3, 'Still owed after collecting, by turn, Rs thousand', size=12.5, bold=True, color=INK)
base, top_ = 5.25, 2.78
pitch11, bw11 = 0.535, 0.38
cx0 = PM + 0.1
for k in range(1, 13):
    v = 10 * (12 - k)
    col = L700 if k <= 6 else (LIME if k <= 9 else LIME_MID)
    x = cx0 + (k - 1) * pitch11 + (pitch11 - bw11) / 2
    hgt = (base - top_) * v / 110.0
    if v:
        rect(sl, x, base - hgt, bw11, hgt, col)
    tb(sl, x - 0.1, base - hgt - 0.27, bw11 + 0.2, 0.25, str(v), size=11, color=INK2, align=CEN)
    tb(sl, x - 0.1, base + 0.05, bw11 + 0.2, 0.25, str(k), size=11, color=GREY, align=CEN)
line(sl, cx0, base, cx0 + 12 * pitch11, base, GREY, 0.75)
for a_, b_, lab in [(1, 6, 'score 650 and above'), (7, 9, '550 and above'), (10, 12, 'any score; every new member')]:
    xa = cx0 + (a_ - 1) * pitch11 + 0.05
    xb_ = cx0 + b_ * pitch11 - 0.05
    line(sl, xa, 5.68, xb_, 5.68, INK2, 0.75)
    line(sl, xa, 5.6, xa, 5.68, INK2, 0.75)
    line(sl, xb_, 5.6, xb_, 5.68, INK2, 0.75)
    tb(sl, xa, 5.74, xb_ - xa, 0.5, lab, size=12, color=INK, align=CEN, spacing=1.02)
vx = 8.15
line(sl, vx, 2.3, vx, 5.62, L700, 1.5)
ctrl = [('Before joining', 'three engines; the host admits each member'),
        ('At joining', 'full cost shown; 24 hours to withdraw; signed undertaking and guarantee'),
        ('Each instalment', 'reminder the evening before; debit on payday; up to five retries'),
        ('A missed payment', 'taken from the member’s own pot; late charges of 2%, 5% and 10% go to charity')]
for i, (t, d) in enumerate(ctrl):
    y = 2.18 + i * 0.95
    oval(sl, vx - 0.09, y + 0.1, 0.18, L700)
    tb(sl, vx + 0.3, y, RX - vx - 0.3, 0.35, t, size=14.5, bold=True, color=INK)
    tb(sl, vx + 0.3, y + 0.33, RX - vx - 0.3, 0.55, d, size=12.5, color=INK2, spacing=1.03)
sources(sl, ['Default Prevention (HQ-CP-05); State Bank 40 per cent limit, BPRD Circular Letter 29 of 2021',
             'Contract Act 1872, s.74'])
say(sl, 'This is the question every banker asks first, so it gets two slides.\n\n'
        'The chart is the whole risk in one picture. On a circle of twelve at Rs 10,000, the member who collects in turn '
        'one still owes Rs 110,000; the member in turn twelve owes nothing. So the early turns are closed to weak scores: '
        'turns one to six need 650 or more on our 300 to 850 scale, turns seven to nine need 550, and the last three are '
        'open to anyone. Every new member starts in the last three until two circles are completed cleanly. At most six '
        'circles at once and one daily circle.\n\n'
        'The four controls on the right run in time. Before joining: the three engines, and the host admits each member. '
        'At joining: every rupee owed shown before signing, 24 hours to withdraw, a ten clause undertaking and a mutual '
        'guarantee, the standing instruction, and takaful cover on circles between strangers. Each instalment: a reminder '
        'the evening before, the debit on the learned payday, and retries each morning, five at most; the host sees who '
        'is late. A missed payment: before collecting, arrears are simply taken from that member\'s own pot, so the others '
        'lose nothing; late charges of 2, 5 and 10 per cent of the instalment, with score falls of 10, 20 and 40, go to '
        'charity and never become income, as Islamic finance requires. A daily circle stops opening days once losses '
        'would exceed its cover.')

# ================================================================ 12 RECOVERY: two lane escalation ===
sl = pslide('Recovery', 'Only a member who has collected can leave others short. Takaful pays them first.')
tb(sl, PM, 2.5, 1.9, 0.6, 'Members left short', size=13, bold=True, color=INK2, anchor=MIDDLE, spacing=1.03)
tb(sl, PM, 3.55, 1.9, 0.7, 'Member who collected, then stopped paying', size=13, bold=True, color=INK2,
   anchor=MIDDLE, spacing=1.03)
yl12 = 4.02
cxs = [3.1 + i * 1.74 for i in range(6)]
st12 = [('Contact', 'hardship plan and a new date'), ('Restrict', 'account restricted; score down 200'),
        ('Takaful', 'pays the members left short'), ('Guarantee', 'the whole balance falls due'),
        ('Civil suit', 'on the signed undertaking'), ('Cheque', 'summary suit, only if a cheque is held')]
for i in range(5):
    line(sl, cxs[i], yl12, cxs[i + 1], yl12, L700, 1.5 + i * 0.9)
for i, (t, d) in enumerate(st12):
    oval(sl, cxs[i] - 0.12, yl12 - 0.12, 0.24, WHITE, line=L700, lw=2.0)
    tb(sl, cxs[i] - 0.8, yl12 + 0.24, 1.6, 0.32, '%d  %s' % (i + 1, t), size=14, bold=True, color=INK, align=CEN)
    tb(sl, cxs[i] - 0.8, yl12 + 0.58, 1.6, 0.55, d, size=11.5, color=GREY, align=CEN, spacing=1.03)
tb(sl, cxs[0] - 0.12, yl12 - 0.45, 4.0, 0.28, 'each step only if the one before fails', size=11, color=GREY,
   italic=True)
line(sl, cxs[2], yl12 - 0.14, cxs[2], 2.92, L700, 1.5, arrow=True)
line(sl, cxs[0], 2.85, cxs[2] - 0.05, 2.85, GREY_LT, 1.0, dash=True)
rect(sl, cxs[2], 2.79, RX - cxs[2], 0.12, L700)
tb(sl, cxs[2] + 0.1, 2.38, RX - cxs[2] - 0.1, 0.35, 'paid in full by takaful, in their own names', size=13.5,
   bold=True, color=L700)
facts = [('Rs 110,000', 'the most one member can owe after collecting: turn 1 of 12 at Rs 10,000', L700),
         ('About 5.5%', 'of the instalment prices the takaful cover for the stress case [1]', L700),
         ('Never', 'calls to relatives, contact lists or public lists of names', RED)]
fw = (PW - 2 * 0.4) / 3
for i, (n_, t, col) in enumerate(facts):
    x = PM + i * (fw + 0.4)
    if i:
        vrule(sl, x - 0.2, 5.45, 0.95, RULE, 0.75)
    tb(sl, x, 5.38, fw, 0.5, n_, size=26, color=col, font=DISPLAY)
    tb(sl, x, 5.9, fw, 0.6, t, size=12.5, spacing=1.04)
sources(sl, ['Takaful Cover Pricing Model (HQ-MF-05): one circle in five losing a fifth of its members from the earliest '
             'turns'])
say(sl, 'Recovery. A member who misses before collecting costs the others nothing, because arrears come from their own '
        'pot. So recovery only matters for someone who has already collected and stops paying. The worst case is turn '
        'one on a circle of twelve at Rs 10,000: Rs 110,000 still owed.\n\n'
        'The bottom lane is that member; the line thickens as the steps escalate, and each step is used only if the one '
        'before fails. One, contact: most cases end with a hardship statement, a waived charge and a new date. Two, the '
        'account is restricted and the score drops by 200. Three, the takaful fund pays the members left short, in their '
        'own names, which is the top lane: they are made whole while recovery continues. Four, the mutual guarantee and '
        'the whole balance falls due. Five, an ordinary civil suit on the signed undertaking. Six, only where a '
        'guarantee cheque is held, a summary suit on it; we never claim more than that.\n\n'
        'Cover is priced for a stress case of one circle in five losing a fifth of its members from the earliest turns: '
        'about 5.5 per cent of the instalment on a circle between strangers, written by a takaful operator such as EFU '
        'window takaful, Raqami\'s partner. What we never do: call relatives, read contact lists or publish names.')

# ================================================================ 13 REVENUE AND BUSINESS MODEL: flow of one instalment ===
sl = pslide('Revenue and Business Model', 'Halqa earns a share of what Raqami earns. It never holds money.')
tb(sl, PM, 2.05, 6.3, 0.3, 'One instalment on a circle between strangers', size=12.5, bold=True, color=INK)
tb(sl, PM, 2.34, 6.3, 0.28, 'the member pays Rs 11,047', size=11.5, color=GREY)
sx, sw, sy0, sh = PM + 0.05, 0.16, 2.72, 3.25
k_ = sh / 11047.0
parts = [(10000, L700, LIME_LT, 2.58), (547, GREY, EMPTY, 5.8), (500, RQ, RQ_LT, 6.1)]
tx = 3.35
ya = sy0
rect(sl, sx, sy0, sw, sh, INK2)
for v, ncol, bcol, ty_ in parts:
    hh = v * k_
    band(sl, sx + sw, ya, ya + hh, tx, ty_, ty_ + hh, bcol)
    rect(sl, tx, ty_, sw, hh, ncol)
    ya += hh
cy_c = 2.58 + 10000 * k_ / 2
tb(sl, tx + 0.3, cy_c - 0.5, 3.4, 0.5, 'Rs 10,000', size=24, color=L700, font=DISPLAY)
tb(sl, tx + 0.3, cy_c + 0.02, 3.4, 0.3, 'to the member collecting', size=13)
tb(sl, tx + 0.3, 5.73, 3.6, 0.3, [[('Rs 547  ', dict(size=12.5, bold=True)), ('takaful contribution',
                                                                            dict(size=12.5))]])
tb(sl, tx + 0.3, 6.03, 3.7, 0.55, [[('up to Rs 500  ', dict(size=12.5, bold=True, color=RQ)),
                                    ('service fee (ujrah): Raqami collects it; Halqa gets an agreed share',
                                     dict(size=12.5))]], spacing=1.03)
x0 = 7.55
tb(sl, x0, 2.05, RX - x0, 0.3, 'Revenue lines', size=12.5, bold=True, color=INK)
phx = [x0, x0 + 1.75, x0 + 3.5]
line(sl, x0, 2.78, RX, 2.78, GREY_LT, 1.0)
for i, (ph_, items) in enumerate([('Now', 'fee share\nbalance share'), ('After the pilot', 'financing referrals\n'
                                                                                         'marketplace'),
                                  ('Later', 'employers')]):
    tb(sl, phx[i], 2.38, 1.75, 0.3, ph_, size=12.5, bold=True, color=L700 if i == 0 else INK2)
    oval(sl, phx[i], 2.71, 0.14, L700 if i == 0 else WHITE, line=L700, lw=1.25)
    tb(sl, phx[i], 2.92, 1.7, 0.6, items, size=12.5, spacing=1.05)
tb(sl, x0, 3.82, RX - x0, 0.3, 'Unit costs, 25 September model', size=12.5, bold=True, color=INK)
rule(sl, x0, 4.16, RX - x0, L700, 1.0)
ue = [('Rs 13 to 35', 'to run one payment'), ('Rs 1.32 m', 'fixed cost a month'),
      ('About 2,600', 'members to break even'), ('About Rs 8', 'a member a month per 10% share of balance margin')]
for i, (n_, t) in enumerate(ue):
    xx = x0 + (i % 2) * 2.6
    yy = 4.3 + (i // 2) * 1.08
    tb(sl, xx, yy, 2.5, 0.45, n_, size=23, color=L700, font=DISPLAY)
    tb(sl, xx, yy + 0.45, 2.45, 0.55, t, size=12, spacing=1.03)
sources(sl, ['Business Model and Unit Costs (HQ-CP-03), 25 September 2026, before Raqami’s terms',
             'Takaful Cover Pricing Model (HQ-MF-05)'])
say(sl, 'How Halqa earns. The flow is one instalment on a circle between strangers, drawn to scale: the member pays Rs '
        '11,047, of which Rs 10,000 goes to whoever is collecting, Rs 547 is the takaful contribution and up to Rs 500 is '
        'a flat service fee, an ujrah for running the committee. Raqami collects the fee as its income and Halqa receives '
        'an agreed share; Halqa\'s revenue is a share of what Raqami earns, never money held. The fee is the same for '
        'every turn, because a charge that grows with how early a member collects would be priced on the advance.\n\n'
        'Two main lines now: the fee share, and an agreed share of Raqami\'s income as mudarib on committee balances; on '
        'our assumptions each 10 per cent of that margin is about Rs 8 a member a month. After the pilot: referral fees '
        'on asset financing, 2 to 4 per cent from the financier and 1 to 3 from the dealer, and a merchant commission '
        'when members spend points. Later, employer programmes.\n\n'
        'Costs from our 25 September model: Rs 13 to 35 to run one payment, Rs 1.32 million a month of fixed cost at '
        'launch, covered at about 2,600 active members. These numbers will be re-cut once Raqami\'s terms are known.')

# ================================================================ 14 COMPARISON: Harvey balls ===
sl = pslide('Comparison', 'Only one uses an Islamic bank, one fair price and a credit record.')
cols_c = ['Halqa with Raqami', 'Oraan', 'JazzCash Committee', 'Informal']
crit = [('Money held by a licensed bank', [(2, 'Raqami'), (0, 'Oraan’s own accounts'), (1, 'organiser’s wallet'),
                                           (0, 'the organiser')]),
        ('Shariah oversight', [(2, 'Raqami’s Shariah Board'), (1, 'private adviser'), (None, 'not stated'),
                               (0, 'none')]),
        ('Same fee for every turn', [(2, 'one flat fee'), (0, 'up to 21% a month'), (None, 'not published'),
                                     (2, 'usually none')]),
        ('Paid out automatically', [(2, 'the same day'), (1, '11th to 18th'), (0, 'by hand'), (0, 'by hand')]),
        ('Members checked', [(2, 'identity, income, score'), (1, 'device, bureau'), (0, 'phone contacts'),
                             (1, 'people known')]),
        ('Defaults covered', [(2, 'takaful'), (1, 'Oraan’s balance sheet'), (None, 'not stated'),
                              (0, 'organiser’s pocket')]),
        ('Credit record', [(2, 'every payment'), (1, 'defaulters only'), (0, 'none'), (0, 'none')]),
        ('A way out', [(2, 'five set ways'), (1, 'before payout'), (0, 'none'), (1, 'discretion')])]
lw14 = 2.9
cwc = (PW - lw14) / 4
y0 = 2.1
rh14 = 0.47
rect(sl, PM + lw14, y0, cwc, 0.5 + len(crit) * rh14, LIME_XLT)
for j, t in enumerate(cols_c):
    tb(sl, PM + lw14 + j * cwc + 0.15, y0, cwc - 0.2, 0.46, t, size=13.5, bold=True, color=L700 if j == 0 else INK,
       anchor=MIDDLE)
rule(sl, PM, y0 + 0.5, PW, L700, 1.25)
for i, (lab, cells) in enumerate(crit):
    y = y0 + 0.5 + i * rh14
    tb(sl, PM, y, lw14 - 0.1, rh14, lab, size=13.5, anchor=MIDDLE)
    for j, (lv, note) in enumerate(cells):
        xc = PM + lw14 + j * cwc + 0.15
        if lv is not None:
            harvey(sl, xc + 0.11, y + rh14 / 2, 0.22, lv)
        tb(sl, xc + 0.33, y, cwc - 0.5, rh14, note, size=11.5, color=GREY if lv is None else INK2,
           italic=lv is None, anchor=MIDDLE, spacing=1.0)
    rule(sl, PM, y + rh14, PW)
yl14 = y0 + 0.5 + len(crit) * rh14 + 0.08
for k, (lv, t) in enumerate([(2, 'yes'), (1, 'partly'), (0, 'no')]):
    harvey(sl, PM + 0.1 + k * 1.2, yl14 + 0.13, 0.18, lv)
    tb(sl, PM + 0.28 + k * 1.2, yl14, 0.9, 0.26, t, size=11.5, color=GREY)
sources(sl, ['Oraan terms, fee calculator and Shariah page, read 28 Sep 2026; Oraan Research (HQ-RS-01)',
             'JazzCash 5.6.7 release note, 23 Aug 2026'])
say(sl, 'Side by side, scored full, half or empty. Oraan, the closest competitor, markets its committees as Shariah '
        'compliant on the certificate of a private advisory firm, but holds members\' money in its own company accounts '
        'without a financial licence, keeps the return earned on it, charges the first turn up to 21 per cent of the '
        'instalment every month, pays out net between the 11th and 18th, carries defaults on its own balance sheet and '
        'reports only defaulters.\n\n'
        'JazzCash launched a committee feature in August 2026. It rotates, but the pot collects in the organiser\'s '
        'wallet and the organiser pays out by hand; members are chosen from phone contacts, there is no exit before the '
        'end and no credit record; fees and default handling are not published. Its advantage is reach.\n\n'
        'The informal committee usually has no fee, but everything rests on the organiser. Halqa with Raqami is the only '
        'version where an Islamic bank holds the money under its own Shariah Board, every turn pays the same fee, and '
        'every payment builds a credit record.')

# ================================================================ 15 EVIDENCE ===
sl = pslide('Evidence', 'Digital committees scaled abroad within a few years of starting.')
tx0, tx1 = PM + 2.6, RX - 2.35
xy = lambda yr: tx0 + (yr - 2016) * (tx1 - tx0) / 10.0
for yr in range(2016, 2027):
    tb(sl, xy(yr) - 0.3, 2.2, 0.6, 0.3, str(yr), size=11, color=GREY, align=CEN)
    vrule(sl, xy(yr), 2.52, 3.6, C('EEF2EA'), 0.75)
comp = [('Hakbah', 'Saudi Arabia', 2018, [(2020, 'central bank approval'), (2023, 'Series A')], '500,000+ users'),
        ('Money Fellows', 'Egypt', 2016, [(2025, 'profitable')], '8.5 million users'),
        ('Esusu', 'United States', 2018, [(2022, 'US$1 billion')], 'US$1.2 billion value'),
        ('The Money Club', 'India', 2016, [], 'about 200,000 users')]
for i, (name, ctry, start, ms, now) in enumerate(comp):
    y = 2.85 + i * 0.86
    tb(sl, PM, y - 0.22, 2.5, 0.35, name, size=15, bold=True, color=L700)
    tb(sl, PM, y + 0.12, 2.5, 0.3, ctry, size=11, color=GREY)
    line(sl, xy(start), y, xy(2026), y, L700, 3.0)
    oval(sl, xy(start) - 0.08, y - 0.08, 0.16, L700)
    for yr, lab in ms:
        oval(sl, xy(yr) - 0.09, y - 0.09, 0.18, WHITE, line=L700, lw=2.0)
        if yr >= 2024:
            tb(sl, xy(yr) - 1.9, y + 0.1, 2.0, 0.3, lab, size=10.5, color=INK2, align=R)
        else:
            tb(sl, xy(yr) - 0.1, y + 0.1, 2.2, 0.3, lab, size=10.5, color=INK2)
    tb(sl, tx1 + 0.2, y - 0.2, RX - tx1 - 0.2, 0.4, now, size=13.5, color=INK, anchor=MIDDLE)
tb(sl, PM, 6.2, PW, 0.4, 'Each worked with a regulator or a bank first.', size=16, bold=True)
sources(sl, ['The National, Dec 2023', 'Launch Base Africa, Oct 2025', 'CNBC, Dec 2025', 'CB Insights'])
say(sl, 'Four examples; each line starts in the year the company started. Hakbah in Saudi Arabia, an Islamic market like '
        'ours, was founded in 2018 and launched in 2020 only after approval from the Saudi central bank; over 500,000 '
        'users, 70 per cent aged 21 to 35. Money Fellows in Egypt launched in 2016 and was profitable in 2025, with about '
        '8.5 million users and US$1.5 billion processed; it works with Banque Misr and went through the central bank '
        'sandbox. Esusu in the United States, founded 2018, reports payments to credit bureaus and was valued at US$1 '
        'billion in 2022 and US$1.2 billion in December 2025. The Money Club in India, founded 2016, about 200,000 '
        'users.\n\n'
        'The thread: the regulator or a bank came first, then growth. That is exactly the sequence we propose with '
        'Raqami.')

# ================================================================ 16 WHY NOW ===
sl = pslide('Why Now', 'Payments went digital. Savings did not.', bg=LIME, logo=False, stmt_size=26)
tb(sl, PM, 2.25, 6.2, 0.35, 'Share of retail payments made digitally', size=13, bold=True, color=INK)
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, PM - 0.05, 2.6, 6.2, 3.55, ['FY2023', 'FY2024', 'FY2025',
                                                                      'Jan to Mar 2026'],
      [('Digital', [78, 85, 88, 92])], colors=[INK], fmt='0"%"', gap=55, size=13,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=105)
x0 = 7.3
for i, (n_, t) in enumerate([('69 million', 'mobile wallet users'), ('2.9 billion', 'app payments in three months'),
                             ('26%', 'of adults financially literate'), ('Aug 2026', 'JazzCash launched committees'),
                             ('1 Jan 2028', 'riba to end in banking, by law')]):
    y = 2.25 + i * 0.8
    tb(sl, x0, y, 2.7, 0.7, n_, size=24, color=INK, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x0 + 2.75, y, RX - x0 - 2.75, 0.7, t, size=14, color=INK, anchor=MIDDLE, spacing=1.03)
    if i < 4:
        rule(sl, x0, y + 0.75, RX - x0, INK2, 0.5)
sources(sl, ['State Bank of Pakistan: payment systems reviews FY25, Q2 FY25, Q3 FY26', 'S&P Global FinLit Survey',
             'JazzCash release notes; 26th Constitutional Amendment, 2024'], dark=True)
say(sl, 'Why now. Pakistan has moved to digital payments fast: 78 per cent of retail payments were digital in FY2023, 92 '
        'per cent by January to March 2026. At the end of 2024 about 69 million people used mobile wallets, 64.3 '
        'million on branchless banking and 4.7 million on e-money wallets, besides 21 million mobile banking users. In '
        'January to March 2026 apps handled 2.9 billion transactions and Raast 742 million payments.\n\n'
        'Yet only about a quarter of adults are financially literate. That is why committees survive: people understand '
        'them without understanding finance. Halqa puts the habit people already understand onto the rails they already '
        'use.\n\n'
        'Two clocks are running. JazzCash launched a committee feature in August, so the first bank to offer a committee '
        'held safely, with a credit record, sets the standard. And the 26th Constitutional Amendment sets 1 January 2028 '
        'for riba to end in Pakistan\'s banking system: savers who have always chosen the committee because it carries no '
        'interest are the natural customers of an Islamic digital bank. The State Bank\'s 2028 target of 75 per cent of '
        'adults with an account points the same way.')

# ================================================================ 17 GROWTH: flywheel ===
sl = pslide('Growth', 'Each circle recruits its own members, and starts new ones.')
fcx, fcy, fr = 3.75, 4.35, 1.3
for k in range(4):
    arc(sl, fcx, fcy, fr, -90 + k * 90 + 14, -90 + (k + 1) * 90 - 14, L700, 5.0, arrow=True)
tb(sl, fcx - 1.9, fcy - fr - 0.62, 3.8, 0.4, 'A host starts a circle', size=14.5, bold=True, align=CEN)
tb(sl, fcx + fr + 0.3, fcy - 0.36, 2.35, 0.72, 'Members open Raqami accounts', size=14.5, bold=True,
   anchor=MIDDLE, spacing=1.03)
tb(sl, fcx - 1.9, fcy + fr + 0.2, 3.8, 0.4, 'The circle completes cleanly', size=14.5, bold=True, align=CEN)
tb(sl, PM, fcy - 0.36, fcx - fr - 0.3 - PM, 0.72, 'Members host their own', size=14.5, bold=True, align=R,
   anchor=MIDDLE, spacing=1.03)
tb(sl, fcx - 0.95, fcy - 0.46, 1.9, 0.5, '6 to 20', size=28, color=L700, font=DISPLAY, align=CEN)
tb(sl, fcx - 0.95, fcy + 0.08, 1.9, 0.5, 'accounts from each circle', size=11.5, color=GREY, align=CEN,
   spacing=1.02)
x0 = 7.9
chan = [('Hosts', 'points for each clean circle, never for recruiting'),
        ('Employers', 'circles for staff of Raqami’s payroll clients [1]'),
        ('Raqami', 'inside the Raqami app and its partner platforms'),
        ('Seasons', 'Ramadan, Qurbani, Hajj, weddings, school fees'), ('Paid media', 'only after the pilot')]
rule(sl, x0, 2.25, RX - x0, L700, 1.25)
for i, (t, d) in enumerate(chan):
    y = 2.33 + i * 0.78
    tb(sl, x0, y, 1.55, 0.7, t, size=14.5, bold=True, color=L700, anchor=MIDDLE)
    tb(sl, x0 + 1.6, y, RX - x0 - 1.6, 0.7, d, size=12.5, anchor=MIDDLE, spacing=1.03)
    rule(sl, x0, y + 0.74, RX - x0)
sources(sl, ['VIS rating report on Raqami, 12 November 2025: early focus on corporate collections, payroll management '
             'and supply chain financing'])
say(sl, 'Growth. Committees spread through the person who organises them. One host brings six to twenty people; they all '
        'open Raqami accounts at once; when the circle completes, satisfied members start their own. So acquisition cost '
        'is shared across a group, and the loop turns on its own.\n\n'
        'Channels: hosts are rewarded with points for clean circles, never for recruiting, which would be a pyramid. '
        'Employers: Raqami\'s own strategy starts with corporate collections and payroll management, so its payroll '
        'clients can offer circles to staff with income verified at source, as Money Fellows does with 328 companies in '
        'Egypt. Raqami itself, inside its app and its partner platforms. Seasonal circles for Ramadan, Qurbani, Hajj, '
        'weddings and school fees. Paid media only after the pilot shows completion rates.')

# ================================================================ 18 READINESS AND REGULATION: nested scope ===
sl = pslide('Readiness and Regulation', 'Built. It needs State Bank regulation, which comes through Raqami.')
rect(sl, PM, 2.2, 6.2, 4.1, None, line=GREY, lw=1.0)
tb(sl, PM + 0.18, 2.3, 5.8, 0.35, 'State Bank of Pakistan', size=14, bold=True, color=INK)
rect(sl, PM + 0.4, 2.85, 5.4, 3.05, None, line=RQ, lw=1.5)
tb(sl, PM + 0.58, 2.95, 5.0, 0.35, 'Raqami: licence, accounts, payments, Shariah Board', size=13.5, bold=True,
   color=RQ)
rect(sl, PM + 0.8, 3.5, 4.6, 1.95, LIME_XLT, line=L700, lw=1.5)
tb(sl, PM + 0.98, 3.64, 4.3, 0.35, 'Halqa: service provider', size=13.5, bold=True, color=L700)
tb(sl, PM + 0.98, 4.04, 4.3, 0.35, 'rules, engines, application, records', size=13, color=INK2)
tb(sl, PM + 0.98, 4.5, 4.3, 0.7, 'under the outsourcing framework, with audit rights for Raqami and the State Bank',
   size=11.5, color=GREY, spacing=1.04)
x0 = PM + 6.8
for i, (t, d, col) in enumerate([('Built', 'the application and its engines, in preview', L700),
                                 ('Written', 'legal position; risk and pricing models', L700),
                                 ('Regulation', 'approval or notice through Raqami; Shariah Board approval', RQ),
                                 ('To do', 'incorporation, agreement, connection', AMBER)]):
    y = 2.25 + i * 1.02
    rule(sl, x0, y, RX - x0, col, 1.5)
    tb(sl, x0, y + 0.1, 1.75, 0.45, t, size=16, bold=True, color=col)
    tb(sl, x0 + 1.8, y + 0.1, RX - x0 - 1.8, 0.8, d, size=14, spacing=1.04)
say(sl, 'Where we stand. The application is built and running in preview, with sample data; no real money has moved. The '
        'legal and risk work is written down: a legal position checked against twelve laws and regulations, six risk and '
        'pricing models, and the default prevention design.\n\n'
        'On regulation, plainly: a system that makes and manages committees with members\' money needs State Bank '
        'regulation. The nesting shows how it is met: Raqami\'s licence covers the accounts and the payments; Halqa is '
        'assessed as Raqami\'s service provider under the State Bank\'s outsourcing framework, with audit rights for '
        'Raqami and the State Bank; the product goes to the State Bank through Raqami for approval or notice as the '
        'State Bank requires; and Raqami\'s Shariah Board approves every structure before launch.\n\n'
        'Still to do: incorporation, the agreement, and the technical connection through Raqami\'s open API.')

# ================================================================ 19 PILOT ===
sl = pslide('Pilot', 'One live month, about 1,000 members.')
gx, gl, mw = PM, 3.2, 0.64
for m in range(14):
    tb(sl, gx + gl + m * mw, 2.2, mw, 0.3, str(m + 1), size=11, color=GREY, bold=True, align=CEN)
tb(sl, gx, 2.2, gl - 0.15, 0.3, 'Week', size=11, color=GREY, bold=True, align=R)
rows_ = [('Agreement', 1, 4, L700), ('Approvals', 1, 8, L700), ('Connection and tests', 4, 8, LIME),
         ('Live month', 9, 12, LIME), ('Review', 13, 13, AMBER), ('Scale decision', 14, 14, L700)]
for m in range(15):
    vrule(sl, gx + gl + m * mw, 2.55, 3.15, C('EEF2EA'), 0.75)
for i, (lab, a_, b_, col) in enumerate(rows_):
    y = 2.62 + i * 0.52
    tb(sl, gx, y, gl - 0.15, 0.44, lab, size=14, align=R, anchor=MIDDLE)
    rect(sl, gx + gl + (a_ - 1) * mw + 0.03, y + 0.07, (b_ - a_ + 1) * mw - 0.06, 0.32, col)
tb(sl, PM, 6.0, PW, 0.45, [[('Measured   ', dict(size=14, bold=True, color=L700)),
                            ('accounts, standing instructions, on time debits, same day payouts, complaints, cost',
                             dict(size=14))]])
say(sl, 'The pilot is one month live. Before it, about eight weeks: the agreement and incorporation, the State Bank and '
        'Shariah Board approvals through Raqami, and the connection to Raqami\'s open API with testing.\n\n'
        'Then one month live with about 1,000 members in circles between people who know each other, up to 100 circles. '
        'In that month every circle makes its first collection and its first payout, which tests the whole machine: '
        'account opening, standing instructions, the debit on payday, the payout, messages and complaints. A review, then '
        'the decision to scale. The circles themselves continue their full cycle under close watch.')

# ================================================================ 20 REQUESTS ===
sl = pslide('Requests', 'Six decisions to start.')
asks = ['Approve the partnership', 'Take the product to the State Bank',
        'Shariah Board approval; takaful through EFU', 'Accounts and standing instructions inside the Halqa app',
        'Hold instalments in 7 day Mudarabah Certificates', 'Agree the income share and a one month pilot']
for i, t in enumerate(asks):
    col_, row_ = divmod(i, 3)
    x = PM + col_ * (PW / 2 + 0.2)
    y = 2.3 + row_ * 1.35
    tb(sl, x, y, 0.8, 0.9, str(i + 1), size=44, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x + 0.9, y, PW / 2 - 1.2, 0.9, t, size=19, anchor=MIDDLE, spacing=1.04)
    rule(sl, x, y + 1.1, PW / 2 - 0.3)
say(sl, 'Six decisions start it. The partnership itself, with Halqa assessed as Raqami\'s service provider. Taking the '
        'product to the State Bank for approval or notice. The Shariah Board\'s approval of the committee structure, the '
        'flat service fee, the charity destination of late charges and the points, with takaful cover through EFU window '
        'takaful or another operator Raqami chooses. Account opening and standing instructions inside our application, '
        'through Raqami\'s open API. Instalments held in 7 day Mudarabah Certificates between payday and the due date, '
        'with the profit returned as points at the member\'s election. And the income share with a one month pilot.\n\n'
        'Credit reporting through Raqami\'s TASDEEQ membership, asset financing and circles for families overseas follow '
        'the pilot.')

# ================================================================ 21 CLOSE ===
sl = prs.slides.add_slide(BLANK)
NUM[0] += 1
rect(sl, 0, 0, W, H, LIME)
rect(sl, PM - 0.15, 0.6, 2.05, 0.72, WHITE)
pic(sl, LOGO, PM, 0.7, h=0.5)
tb(sl, PM, 2.5, PW, 1.2, 'Halqa is the system. The bank is the machine.', size=42, color=INK, font=DISPLAY)
tb(sl, PM, 5.55, 8, 0.35, 'Taha Amjed, Chairman, Halqa', size=15, bold=True, color=INK)
tb(sl, PM, 5.95, 10, 0.35, 'Detailed reference: 81 pages on the law, the product, the economics and the evidence.',
   size=13, color=INK2)
tb(sl, RX - 0.6, 7.0, 0.6, 0.3, str(NUM[0]), size=11, color=INK, align=R)
say(sl, 'To close: committees are the savings habit Pakistan already has, and they carry no interest. Halqa runs them; '
        'Raqami holds and moves the money under the State Bank\'s regulation and its own Shariah Board. Members get '
        'safety, one fair fee and a credit record; Raqami gets low cost deposits, customers in groups and a financing '
        'book. We have a detailed reference for any area the risk, compliance, Shariah or technology teams want to '
        'examine.')

# ==================================================================== save ===
cp = prs.core_properties
cp.title = 'Halqa: presentation for Raqami Islamic Digital Bank'
cp.author = 'Halqa'
prs.save(OUTP)
bad = []
words = []
for n, s in enumerate(prs.slides, 1):
    wn = 0
    for shp in s.shapes:
        if shp.has_text_frame:
            t = shp.text_frame.text
            wn += len(t.split())
            for pat in (r'\byou\b', r'\byour\b', r'\bwe\b', r'\bour\b', u'[‒–—―]', r' - ',
                        r'(?i)\bjourney\b|\bunlock|\bseamless|\bempower|\bleverag|\brevolution|Akif|Saeed|Kazi|'
                        r'father|Sidra|Mashreq|Umair|Mutairi|Usmani|\binterest\b(?! free)'):
                if re.search(pat, t):
                    bad.append((n, pat[:30], t[:80]))
    words.append(wn)
print('slides', len(prs.slides), 'bytes', os.path.getsize(OUTP), 'words on slides', sum(words))
print('words per slide', words)
for b in bad:
    print('CHECK', b)
