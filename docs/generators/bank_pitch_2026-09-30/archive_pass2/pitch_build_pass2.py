# -*- coding: utf-8 -*-
"""
Halqa: partnership presentation for a partner bank (Mashreq version 4, Raqami version 2), 29 September 2026.

Built on the pitch research of 29 September 2026:
  answer first, then the reasons (Minto, pyramid principle);
  one full sentence headline per slide that states the claim, and read in sequence the headlines tell the whole story
  (assertion evidence: Garner and Alley 2013, 110 students, about 21 words a slide against 41, better comprehension,
  fewer misconceptions, better recall a week later);
  visual evidence under each headline, the detail spoken and kept in the speaker notes (Mayer: coherence, redundancy);
  every slide passes a three second glance (Duarte); legible, simple, obvious (YC);
  the bank is the subject: what it gains, and an answer for each of its teams (Challenger: tailor to each stakeholder);
  a small first step with pass marks agreed in advance, and a specific request.
Every figure was checked on 29 September 2026 against its source (fact register in HALQA CORPORATE\\07 Internal).

Usage: python pitch_build.py mashreq|raqami out.pptx
"""
import os, sys, math, re, datetime

ME = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.abspath(os.path.join(ME, '..', 'complete_position_2026-09-29', 'deck', 'd2_lib.py'))
G = {'__file__': LIB, '__name__': 'pitch'}
exec(compile(open(LIB, encoding='utf-8').read(), 'd2_lib.py', 'exec'), G)
G['SHOTS'] = os.path.join(ME, 'shots')
globals().update({k: v for k, v in G.items() if not k.startswith('__')})

BANK = sys.argv[1] if len(sys.argv) > 1 else 'mashreq'
OUTP = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ME, 'out', BANK + '.pptx')
PKT = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=5)
DATE_STR = '%d %s %d' % (PKT.day, PKT.strftime('%B'), PKT.year)
LOGOS = os.path.abspath(os.path.join(ME, '..', 'complete_position_2026-09-29', 'logos'))

PM = 0.7
PW = W - 2 * PM
RX = W - PM
NUM = [0]
TINT = C('F7FAF3')
EMPTY = C('E4EAE0')
FAINT = C('EEF2EA')
MQ_ = BANK == 'mashreq'

P = {
    'mashreq': dict(
        short='Mashreq', full='Mashreq Bank Pakistan', col=C('D8602A'), lt=C('F7D9C9'),
        logo=os.path.join(LOGOS, 'mashreq-logo-colour.png'), logo_h=1.15, logo_y=0.5,
        today=8.5, add100=2.4, add1m=24.3, vmax=27.0, dep100='2.4',
        avg_line='Rs 8,515 m of deposits ÷ 350,000 customers = about Rs 24,000 each, 30 June 2026 [1]',
        grow=('+29%', 'more customers from 100,000 members, on 350,000 today'),
        grow2=('7 days', 'each instalment waits in a Mashreq account, payday to the 8th'),
        mandate='signs the debit mandate', mandate_n='debit mandate', payout='Rs 120,000 to the collector, same day',
        quote=('Customer acquisition during the period was primarily driven through strategic partnerships.',
               'Mashreq Bank Pakistan, half year report, 2026'),
        lend_fig=('A first loan book', 'Mashreq reported no advances at 30 June 2026 [2]'),
        lend='lend', fee_word='fee', cover_word='cover',
    ),
    'raqami': dict(
        short='Raqami', full='Raqami Islamic Digital Bank', col=C('573F99'), lt=C('E4DEF3'),
        logo=os.path.join(LOGOS, 'raqami-logo-colour.png'), logo_h=1.02, logo_y=0.66,
        today=1.58, add100=1.38, add1m=13.8, vmax=15.5, dep100='1.4',
        avg_line='Rs 1,581 m of deposits ÷ 114,452 accounts = about Rs 13,800 each, 30 June 2026 [1]',
        grow=('+87%', 'more accounts from 100,000 members, on 114,452 today'),
        grow2=('1 million', 'customers: Raqami’s own target for its first three years [2]'),
        mandate='gives a standing instruction', mandate_n='standing instruction',
        payout='Rs 120,000 to the collector, same day, free',
        quote=('The Bank is establishing strategic partnerships with key digital platforms to broaden customer '
               'outreach.', 'Raqami Islamic Digital Bank, half year report, 2026'),
        lend_fig=('Rs 27.6 m', 'of Islamic financing at 30 June 2026; auto, fleet and supply chain next [2]'),
        lend='finance', fee_word='service fee', cover_word='takaful',
    ),
}
B = P[BANK]
BC, BLT, BN = B['col'], B['lt'], B['short']


# ---------------------------------------------------------------- chrome ---
def say(sl, text):
    sl.notes_slide.notes_text_frame.text = text


def hslide(head, bg=None, logo=True, hsize=25):
    sl = prs.slides.add_slide(BLANK)
    NUM[0] += 1
    if bg is not None:
        rect(sl, 0, 0, W, H, bg)
    tb(sl, PM, 0.42, 10.45, 1.1, head, size=hsize, color=INK if bg == LIME else L700, font=DISPLAY, spacing=1.0)
    if logo:
        lg = pic(sl, LOGO, 0, 0.5, h=0.3)
        lg.left = E(RX) - lg.width
    tb(sl, RX - 0.6, 7.06, 0.6, 0.28, str(NUM[0]), size=10, color=INK if bg == LIME else GREY, align=R)
    return sl


def sources(sl, items, y=6.86, dark=False):
    head = 'Sources   ' if len(items) > 1 else 'Source   '
    txt = '   '.join(('%d  %s' % (i + 1, s)) if len(items) > 1 else s for i, s in enumerate(items))
    tb(sl, PM, y, PW - 0.8, 0.3, [[(head, dict(size=9, bold=True, color=INK if dark else L700)),
                                   (txt, dict(size=9, color=INK2 if dark else GREY))]], spacing=1.0)


# --------------------------------------------------------------- drawing ---
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


def sq(sl, x, y, s, color):
    return rect(sl, x, y, s, s, color)


def waffle(sl, x, y, colors, pitch=0.2, cell=0.155, cols=10, rows=10, total=None):
    """Unit chart filled column by column from the bottom left. colors: [(count, colour), ...]."""
    total = total or cols * rows
    bounds, acc = [], 0
    for cnt, col in colors:
        acc += cnt
        bounds.append((acc, col))
    k = 0
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


def fig(sl, x, y, w, n_, label, nsize=30, lsize=14, color=L700, lcolor=INK, gap=0.08, lh=0.75):
    tb(sl, x, y, w, nsize / 72.0 + 0.1, n_, size=nsize, color=color, font=DISPLAY)
    tb(sl, x, y + nsize / 72.0 + gap, w, lh, label, size=lsize, color=lcolor, spacing=1.04)


# ===================================================================== 1 COVER
def s_cover():
    sl = prs.slides.add_slide(BLANK)
    NUM[0] += 1
    rect(sl, 8.6, 0, W - 8.6, H, LIME)
    ph = phone(sl, 'home', 0, 0.55, h=6.4)
    ph.left = E(8.6 + (W - 8.6) / 2) - ph.width // 2
    lg = pic(sl, LOGO, PM, 0.8, h=0.6)
    lgw = lg.width / 914400.0
    vrule(sl, PM + lgw + 0.35, 0.62, 0.95, GREY_LT, 1.0)
    pic(sl, B['logo'], PM + lgw + 0.7, B['logo_y'], h=B['logo_h'])
    tb(sl, PM, 2.4, 7.6, 1.8, 'Pakistan’s committees, held and moved by %s' % BN, size=40, color=INK,
       font=DISPLAY, spacing=0.98)
    tb(sl, PM, 4.35, 7.4, 0.5, 'A partnership proposal from Halqa', size=20, color=L700)
    tb(sl, PM, 6.0, 6, 0.35, 'Taha Kayani, Chairman, Halqa', size=14, bold=True)
    tb(sl, PM, 6.38, 6, 0.3, DATE_STR, size=12, color=GREY)
    say(sl, 'Opening, thirty seconds. A committee, also called a kameti or BC, is how most Pakistani families save: a '
            'group pays in every month and one member takes the whole pot each month. Halqa runs committees in an '
            'application; %s holds and moves every rupee. In the next minutes: the proposal on one page, what a '
            'committee is, what %s gains, how it works, how the risk is controlled, the money, the competition, the '
            'evidence, the regulation, and a one month pilot with six decisions to start it.' % (BN, BN))


# =================================================================== 2 SUMMARY
def s_summary():
    sl = hslide('Halqa runs Pakistan’s committees; %s holds every rupee and gains the customers.' % BN)
    rows = [('The habit', [('4 in 10 Pakistanis save in committees, in cash.', {})]),
            ('The proposal', [('Halqa runs each circle; members pay and collect through %s accounts.' % BN, {})]),
            ('For %s' % BN, [('6 to 20 accounts', dict(bold=True)), (' a circle;  ', {}),
                             ('Rs %s billion' % B['dep100'], dict(bold=True)),
                             (' of deposits per 100,000 members;  a ', {}),
                             ('repayment record', dict(bold=True)), (' on each member.', {})]),
            ('To start', [('A one month pilot with about 1,000 members.', {})])]
    y, rh = 1.95, 1.08
    rule(sl, PM, y, PW, L700, 1.25)
    for i, (lab, runs) in enumerate(rows):
        yy = y + i * rh
        tb(sl, PM, yy, 2.6, rh, lab, size=17, bold=True, color=BC if lab.startswith('For') else L700,
           anchor=MIDDLE)
        tb(sl, PM + 2.75, yy, PW - 2.75, rh, [[(t, dict(size=20, **st)) for t, st in runs]], anchor=MIDDLE,
           spacing=1.06)
        rule(sl, PM, yy + rh, PW, RULE, 0.75)
    sources(sl, ['Karandaaz and Oraan estimates, Dawn, 12 December 2022', '%s half year report to 30 June 2026, at '
                 'the bank’s own average deposit' % B['full']])
    say(sl, 'The whole proposal on one page, so that everything after it is detail.\n\n'
            'The habit: about four in ten Pakistanis save in committees, and almost all of it is cash, held by one '
            'organiser, outside any bank.\n\n'
            'The proposal: Halqa runs the circle in its application: the rules, the order of turns, the checks and '
            'the records. Every member has a %s account; the instalment is collected from it and the pot is paid into '
            'it. Halqa never holds the money.\n\n'
            'For %s: every circle brings six to twenty accounts at once; at %s’s own average deposit, 100,000 '
            'members mean about Rs %s billion of deposits; and every instalment is a repayment record the bank can %s '
            'against.\n\n'
            'To start: a one month live pilot with about 1,000 members, after eight weeks of agreement, approvals and '
            'connection.' % (BN, BN, BN, B['dep100'], B['lend']))


# ================================================================= 3 COMMITTEE
def s_committee():
    sl = hslide('A committee is a savings circle: all pay in monthly, and one member takes the pot.')
    mx0, my0, pit, cel = 1.6, 2.2, 0.322, 0.268
    tb(sl, mx0, 1.72, 12 * pit, 0.28, 'Month', size=11, bold=True, color=GREY, align=CEN)
    for j in range(12):
        tb(sl, mx0 + j * pit - 0.05, 1.93, cel + 0.1, 0.26, str(j + 1), size=10.5, color=GREY, align=CEN)
    for i in range(12):
        tb(sl, mx0 - 0.45, my0 + i * pit - 0.01, 0.35, cel, str(i + 1), size=10.5, color=GREY, align=R,
           anchor=MIDDLE)
        for j in range(12):
            sq(sl, mx0 + j * pit, my0 + i * pit, cel, L700 if i == j else LIME_LT)
    mlab = tb(sl, 0, 0, 2.0, 0.3, 'Member', size=11, bold=True, color=GREY, align=CEN)
    mlab.rotation = 270.0
    mlab.left, mlab.top = E(0.84 - 1.0), E(my0 + 6 * pit - 0.15)
    mright = mx0 + 12 * pit
    yr1 = my0 + cel / 2
    yr12 = my0 + 11 * pit + cel / 2
    line(sl, mright + 0.08, yr1, 6.2, yr1, GREY_LT, 0.75)
    line(sl, mright + 0.08, yr12, 6.2, yr12, GREY_LT, 0.75)
    tb(sl, 6.35, yr1 - 0.3, RX - 6.35, 0.6, [[('First turn   ', dict(size=16, bold=True, color=L700)),
                                             ('gets Rs 120,000 now; repays it over the year, interest free',
                                              dict(size=16))]], anchor=MIDDLE, spacing=1.04)
    tb(sl, 6.35, yr12 - 0.3, RX - 6.35, 0.6, [[('Last turn   ', dict(size=16, bold=True, color=L700)),
                                              ('saves every month, to a deadline the group enforces',
                                               dict(size=16))]], anchor=MIDDLE, spacing=1.04)
    fig(sl, 6.35, 3.55, 5.8, '12 × Rs 10,000', 'paid in each month, and taken by one member', nsize=34, lsize=16)
    ly = my0 + 12 * pit + 0.12
    sq(sl, mx0, ly + 0.05, 0.15, L700)
    tb(sl, mx0 + 0.22, ly, 1.6, 0.25, 'collects the pot', size=11, color=GREY)
    sq(sl, mx0 + 1.9, ly + 0.05, 0.15, LIME_LT)
    tb(sl, mx0 + 2.12, ly, 1.8, 0.25, 'pays Rs 10,000', size=11, color=GREY)
    say(sl, 'For anyone who has never been in one. The grid is a circle of twelve people at Rs 10,000 a month. Every row '
            'is a member, every column a month. Everyone pays in every month; the dark square is the month that member '
            'takes the whole Rs 120,000.\n\n'
            'By the end, everyone has paid in Rs 120,000 and received Rs 120,000, with no interest. The member who '
            'collects first has in effect been given an interest free advance and pays it back over the year; the '
            'member who collects last has saved under a deadline the group enforces. The order is fixed at the '
            'start. Committees are also called kameti, BC or bisi. They work because the members know each other and '
            'the organiser, the host, admits each one.')


# ====================================================================== 4 SIZE
def s_size():
    sl = hslide('About four in ten Pakistanis save this way: an estimated Rs 4 trillion a year.')
    waffle(sl, PM, 2.0, [(34, L700), (7, LIME_MID)], pitch=0.36, cell=0.3)
    sq(sl, PM, 5.75, 0.16, L700)
    tb(sl, PM + 0.24, 5.69, 3.4, 0.28, '34%, Karandaaz [1]', size=12, color=INK2)
    sq(sl, PM, 6.07, 0.16, LIME_MID)
    tb(sl, PM + 0.24, 6.01, 3.4, 0.28, '41%, Oraan [1]', size=12, color=INK2)
    x0 = 5.15
    items = [('About 100 million', 'people, on the higher estimate [2]'),
             ('Rs 4 trillion', 'a year through committees, estimated [1]'),
             ('Twice', 'as many women as men take part [3]')]
    for i, (n_, t) in enumerate(items):
        y = 2.0 + i * 1.3
        tb(sl, x0, y, RX - x0, 0.62, n_, size=32, color=L700, font=DISPLAY)
        tb(sl, x0, y + 0.62, RX - x0, 0.45, t, size=16, color=INK, spacing=1.03)
        if i < 2:
            rule(sl, x0, y + 1.17, RX - x0)
    sources(sl, ['Karandaaz and Oraan estimates, Dawn, 12 Dec 2022', 'PICG case study on Oraan, 2024',
                 'Financial Inclusion Insights survey data, in Mehmood et al. 2018'])
    say(sl, 'The size of the habit. The grid is one hundred Pakistanis. Karandaaz, a financial inclusion body, puts '
            'committee use at 34 per cent, the dark squares; Oraan’s research puts it at 41 per cent, adding the light '
            'squares. On the higher estimate that is close to 100 million people, and Oraan estimates about Rs 4 '
            'trillion a year passes through committees. These are estimates; there is no official count, which is '
            'itself part of the problem.\n\n'
            'A typical committee is small and monthly: digital versions run 3 to 12 members, and nine in ten are '
            'monthly. Women take part at about twice the rate of men, which matters for any bank with a target for '
            'women’s accounts.')


# =================================================================== 5 PROBLEM
def s_problem():
    sl = hslide('Committees run on cash and trust, so savers lose money and build no record.')
    pw4 = (PW - 3 * 0.5) / 4
    panels = [((12, RED), '12%', RED, 'of users have lost money to fraud [1]'),
              ((100, RED), '100+', RED, 'committees lost about Rs 420 million with one organiser, 2022 [2]'),
              ((63, GREY), '63%', INK2, 'of savers keep cash at home [1]'),
              ((4, L700), '4%', L700, 'of savers use a bank [1]')]
    for i, (cc, big_, col, lab) in enumerate(panels):
        x = PM + i * (pw4 + 0.5)
        waffle(sl, x, 1.95, [cc], pitch=0.24, cell=0.19)
        tb(sl, x, 4.5, pw4, 0.7, big_, size=36, color=col, font=DISPLAY)
        tb(sl, x, 5.2, pw4 - 0.05, 0.9, lab, size=15, spacing=1.05)
    tb(sl, PM, 6.2, PW, 0.4, 'No on-time payment reaches a credit bureau.', size=17, bold=True, color=INK)
    sources(sl, ['Financial Inclusion Insights survey data, in Mehmood et al. 2018', 'Dawn, 5 and 12 Dec 2022; '
                 'Arab News, 10 Dec 2022'])
    say(sl, 'What goes wrong, as four small charts. The first, third and fourth are one hundred people each; the '
            'second is the committees in a single fraud.\n\n'
            'One person holds the cash: 12 per cent of committee users say they have lost money to an organiser or a '
            'member. In 2022 one organiser who ran committees through Facebook, more than 100 of them, defaulted on '
            'about Rs 420 million and kept no written records.\n\n'
            'The money stays outside banks: 63 per cent of savers keep their savings as cash at home and only 4 per '
            'cent use a formal institution. And nothing is recorded, so years of paying on time build no credit '
            'record at all.')


# ================================================================== 6 PROPOSAL
def s_proposal():
    sl = hslide('Halqa is the system; %s is the machine that holds and moves every rupee.' % BN)
    xm, xh, xb = 2.05, 6.67, 11.28
    hy = 1.85
    for x, name, sub, col, lw_, fillc in [(xm, 'Member', 'own %s account' % BN, INK2, 1.0, WHITE),
                                          (xh, 'Halqa', 'rules, turns, checks, records', L700, 1.5, LIME_XLT),
                                          (xb, B['full'] if MQ_ else 'Raqami', 'accounts, debit, payout', BC, 1.5,
                                           WHITE)]:
        rect(sl, x - 1.3, hy, 2.6, 0.5, fillc, line=col, lw=lw_,
             paras=[(name, dict(size=15, bold=True, color=INK if col == INK2 else col, align=CEN))], pad=0.02,
             anchor=MIDDLE)
        tb(sl, x - 1.7, hy + 0.54, 3.4, 0.3, sub, size=12, color=GREY, align=CEN)
        line(sl, x, hy + 0.9, x, 6.3, GREY_LT, 1.0, dash=True)
    msgs = [(3.2, xm, xh, 'joins; %s' % B['mandate'], 'i'),
            (3.75, xh, xb, 'collect on the 8th', 'i'),
            (4.4, xm, xb, 'Rs 10,000 from each member', 'm'),
            (5.02, xh, xb, 'pay this month’s collector', 'i'),
            (5.67, xb, xm, B['payout'], 'm'),
            (6.2, xb, xh, 'confirmed; record updates', 'r')]
    for y, a, b, lab, kind in msgs:
        if kind == 'm':
            line(sl, a, y, b, y, L700, 4.5, arrow=True)
            tb(sl, min(a, b) + 0.12, y - 0.36, xh - min(a, b) - 0.25, 0.3, lab, size=13.5, bold=True, color=L700)
            tb(sl, xh + 0.12, y - 0.34, 2.4, 0.28, 'not through Halqa', size=12, color=GREY, italic=True)
        else:
            line(sl, a, y, b, y, INK2 if kind == 'i' else GREY, 1.25, arrow=True, dash=(kind == 'r'))
            tb(sl, min(a, b) + 0.12, y - 0.33, abs(b - a) - 0.24, 0.28, lab, size=13, color=INK2, align=CEN)
    line(sl, PM, 6.82, PM + 0.45, 6.82, L700, 4.5)
    tb(sl, PM + 0.55, 6.7, 1.2, 0.25, 'money', size=11, color=GREY)
    line(sl, PM + 1.6, 6.82, PM + 2.05, 6.82, INK2, 1.25)
    tb(sl, PM + 2.15, 6.7, 3.0, 0.25, 'instructions and records', size=11, color=GREY)
    say(sl, 'The proposal is a division of work, drawn as the order of events in one month. Read it top to bottom.\n\n'
            'The member joins a circle in the Halqa application and %s. Halqa tells %s to collect on the due date, '
            'the 8th; %s takes Rs 10,000 from each member’s own account. Halqa tells %s who collects this month; %s '
            'pays the Rs 120,000 the same day and confirms, and the record updates.\n\n'
            'The thick lines are money. They run only between members and %s, never through Halqa. That matters '
            'twice: a company that holds public money is taking deposits, which only a bank may do, and a system like '
            'this needs State Bank regulation. Working inside %s’s licence answers both. Halqa is the system: the '
            'rules, the order, the checks and the records. %s is the machine: the accounts and the money. Every rupee '
            'stays inside %s, under State Bank regulation, and Halqa works as its service provider under the State '
            'Bank’s outsourcing framework.' % (B['mandate'], BN, BN, BN, BN, BN, BN, BN, BN))


# ================================================================== 7 ACCOUNTS
def s_accounts():
    sl = hslide('Each circle opens 6 to 20 %s accounts at once, through a host its members trust.' % BN)
    hx, hy = PM, 3.35
    rect(sl, hx, hy, 1.6, 0.74, LIME_XLT, line=L700, lw=1.5,
         paras=[('Host', dict(size=16, bold=True, color=L700, align=CEN)),
                ('the organiser', dict(size=11, color=GREY, align=CEN))], pad=0.02, anchor=MIDDLE)
    gx0, gy0, gp, gs = 3.3, 2.2, 0.56, 0.42
    cells = [(gx0 + c * gp, gy0 + r * gp) for r in range(3) for c in range(4)]
    for (cx, cy) in cells:
        path(sl, [(hx + 1.6, hy + 0.37), (cx - 0.02, cy + gs / 2)], GREY_LT, 0.75)
    for (cx, cy) in cells:
        sq(sl, cx, cy, gs, BC)
    tb(sl, gx0 - 0.2, gy0 + 3 * gp + 0.05, 4 * gp + 0.4, 0.55, '12 new %s accounts' % BN, size=14, bold=True,
       color=INK, align=CEN, spacing=1.03)
    ax = gx0 + 4 * gp + 0.2
    line(sl, ax, gy0 + 1.4 * gp, ax + 0.5, gy0 + 1.4 * gp, L700, 1.5, arrow=True)
    g2x = ax + 0.7
    for k in range(2):
        for c in range(4):
            for r in range(3):
                sq(sl, g2x + k * 1.15 + c * 0.25, gy0 + 0.05 + r * 0.25, 0.18, BLT)
    tb(sl, g2x - 0.05, gy0 + 0.88, 2.4, 0.9, 'if two members then host: 24 more', size=12.5, color=GREY,
       spacing=1.03)
    qx = 9.05
    vrule(sl, qx - 0.25, 2.2, 3.1, RULE, 0.75)
    tb(sl, qx, 2.2, RX - qx, 0.35, 'In %s’s own words' % BN, size=12.5, bold=True, color=BC)
    tb(sl, qx, 2.62, RX - qx, 2.0, '“%s”' % B['quote'][0], size=18, color=INK, font=DISPLAY, spacing=1.08)
    tb(sl, qx, 4.7, RX - qx, 0.5, B['quote'][1] + ' [1]', size=11, color=GREY, spacing=1.03)
    sources(sl, ['%s, condensed interim financial statements, half year to 30 June 2026' % B['full']])
    chans = ('employers offering circles to staff, and families in the UAE through Mashreq’s non resident accounts'
             if MQ_ else 'employers on Raqami’s payroll and collections platform offering circles to staff')
    say(sl, 'What %s gains, first: customers, in groups. A committee is joined through its host, the organiser, who '
            'invites people who already trust them. So one invitation brings a whole circle of six to twenty people, '
            'and each opens a %s account to take part. Acquisition cost is shared across the group.\n\n'
            'Then the loop: when a circle completes cleanly, some members host circles of their own. The small squares '
            'are an illustration only: if two of the twelve go on to host, that is twenty four more accounts without '
            'any marketing spend.\n\n'
            'This fits how %s already grows. In its own words, in its half year report: "%s"\n\n'
            'Hosts are rewarded with points for circles that complete cleanly, never for recruiting, which would be a '
            'pyramid. Other channels: %s; seasonal circles for Ramadan, Qurbani, weddings and school fees; paid media '
            'only after the pilot shows completion rates.' % (BN, BN, BN, B['quote'][0], chans))


# ================================================================== 8 DEPOSITS
def s_deposits():
    head = ('At Mashreq’s own average deposit, 100,000 members add about Rs 2.4 billion.' if MQ_ else
            'At Raqami’s own average deposit, 100,000 members would nearly double its deposits.')
    sl = hslide(head)
    tb(sl, PM, 1.75, 7.5, 0.3, 'Deposits, Rs billion', size=13, bold=True, color=INK)
    rows = [('%s today' % BN, B['today'], BC), ('added by 100,000 members', B['add100'], LIME),
            ('added by 1,000,000 members', B['add1m'], L700)]
    lx, bx0, bxw = PM, PM + 2.9, 4.5
    for i, (lab, v, col) in enumerate(rows):
        y = 2.2 + i * 0.95
        tb(sl, lx, y, 2.8, 0.62, lab, size=14, color=INK, align=R, anchor=MIDDLE, spacing=1.02)
        wv = bxw * v / B['vmax']
        rect(sl, bx0, y + 0.06, max(wv, 0.04), 0.5, col)
        vs = ('%.2f' % v).rstrip('0').rstrip('.') if v < 2 else ('%.1f' % v)
        tb(sl, bx0 + wv + 0.12, y, 1.4, 0.62, vs, size=17, bold=True, color=INK, anchor=MIDDLE)
    vrule(sl, bx0, 2.1, 2.95, GREY, 0.75)
    tb(sl, PM, 5.25, 7.7, 0.6, B['avg_line'], size=12.5, color=GREY, spacing=1.04)
    x0 = 8.75
    for i, (n_, t) in enumerate([B['grow'], B['grow2']]):
        y = 1.95 + i * 1.95
        tb(sl, x0, y, RX - x0, 0.65, n_, size=34, color=L700, font=DISPLAY)
        tb(sl, x0, y + 0.72, RX - x0, 1.0, t, size=15, spacing=1.04)
        if i == 0:
            rule(sl, x0, y + 1.75, RX - x0)
    srcs = ['%s, half year report to 30 June 2026' % B['full']]
    if not MQ_:
        srcs.append('Bloomberg, 22 January 2026')
    sources(sl, srcs)
    extra = ('Two things make this conservative. The average is Mashreq’s own, across all its customers; committee '
             'members bring a monthly instalment on top of whatever they already keep. And the money moves inside '
             'Mashreq: each instalment sits in the member’s account from payday until the 8th, about a week, and the '
             'pot is paid into the collector’s Mashreq account.' if MQ_ else
             'Raqami held Rs 1.58 billion of deposits at 30 June 2026, so 100,000 members at its own average of about '
             'Rs 13,800 would add about Rs 1.4 billion, close to doubling the book, and would nearly double its '
             '114,452 accounts. Raqami’s stated aim is a million customers within three years; committees bring them '
             'in groups.')
    say(sl, 'What %s gains, second: deposits. The calculation uses %s’s own average rather than an assumption of '
            'ours: %s\n\n%s\n\nOn this basis 100,000 members add about Rs %s billion and a million members about Rs '
            '%s billion. %s’s own data on committee members replaces the average once the pilot runs.'
        % (BN, BN, B['avg_line'][:-4] + '.', extra, B['add100'], B['add1m'], BN))


# =================================================================== 9 LENDING
def s_lending():
    sl = hslide('Every instalment becomes a repayment record %s can %s against.' % (BN, B['lend']))
    x0, y0, cw_ = PM, 2.25, 0.44
    tb(sl, x0, 1.95, 5.4, 0.28, 'One member, one circle, twelve instalments', size=12.5, bold=True, color=INK)
    for k in range(12):
        xx = x0 + k * cw_
        rect(sl, xx, y0 + 0.1, cw_ - 0.06, 0.5, LIME_XLT, line=L700, lw=1.0)
        tick(sl, xx + 0.1, y0 + 0.22, 0.22, L700, 1.8)
        tb(sl, xx - 0.05, y0 + 0.64, cw_ + 0.04, 0.25, str(k + 1), size=10, color=GREY, align=CEN)
    ax = x0 + 12 * cw_ + 0.1
    line(sl, ax, y0 + 0.35, ax + 0.45, y0 + 0.35, L700, 1.5, arrow=True)
    b1x = ax + 0.6
    rect(sl, b1x, y0 + 0.02, 2.55, 0.66, WHITE, line=INK2, lw=1.25,
         paras=[('Credit record', dict(size=14.5, bold=True, color=INK, align=CEN)),
                ('reported to TASDEEQ', dict(size=11.5, color=GREY, align=CEN))], pad=0.02, anchor=MIDDLE)
    line(sl, b1x + 2.6, y0 + 0.35, b1x + 3.05, y0 + 0.35, L700, 1.5, arrow=True)
    b2x = b1x + 3.2
    rect(sl, b2x, y0 + 0.02, RX - b2x, 0.66, BLT, line=BC, lw=1.25,
         paras=[('%s offer' % ('Lending' if MQ_ else 'Financing'), dict(size=14.5, bold=True, color=BC, align=CEN)),
                ('after a clean circle', dict(size=11.5, color=INK2, align=CEN))], pad=0.02, anchor=MIDDLE)
    fx = [PM, PM + PW / 2 + 0.25]
    rule(sl, PM, 3.6, PW, RULE, 0.75)
    fig(sl, fx[0], 4.0, PW / 2 - 0.4, '+168 points', 'average credit score gain in US lending circles reported to the '
                                                     'bureaus [1]', nsize=36, lsize=15, lh=1.0)
    vrule(sl, fx[1] - 0.25, 4.0, 2.2, RULE, 0.75)
    fig(sl, fx[1], 4.0, PW / 2 - 0.3, B['lend_fig'][0], B['lend_fig'][1], nsize=36, lsize=15, color=BC, lh=1.0)
    sources(sl, ['Mission Asset Fund lending circles, evaluation by San Francisco State University, 600+ participants',
                 '%s, half year report to 30 June 2026' % B['full']])
    own = ('Mashreq reported no advances at 30 June 2026: its money is invested, not lent. Committee members come with '
           'twelve months of repayment behaviour, which is exactly the data needed to start lending safely, beginning '
           'with financing for motorcycles and machines bought through asset circles.' if MQ_ else
           'Raqami’s Islamic financing stood at Rs 27.6 million at 30 June 2026, and its own outlook names supply '
           'chain, auto and fleet financing next. Committee members come with twelve months of repayment behaviour, '
           'the data needed to finance them safely, beginning with ijarah for motorcycles and machines bought '
           'through asset circles.')
    say(sl, 'What %s gains, third: lending data. Every instalment, paid on time or late, becomes a record. From launch '
            'day it is reported to TASDEEQ, the licensed credit bureau, either through %s’s own membership or by '
            'Halqa as a data provider; %s decides which.\n\n'
            'The evidence that this matters comes from the United States: Mission Asset Fund runs rotating lending '
            'circles and reports every payment to the credit bureaus. An independent evaluation by San Francisco '
            'State University, of more than 600 participants over two years, found credit scores rose by 168 points '
            'on average.\n\n%s' % (BN, BN, BN, own))


# ======================================================================= 10 APP
def s_app():
    sl = hslide('Members join, pay automatically, collect and build a record in one app.', bg=TINT)
    steps = [('circles', 'Join a circle'), ('autopay', 'Pay automatically'), ('activity', 'Collect the pot'),
             ('credit', 'Build a credit record')]
    pw_, ph_h = 2.05, 4.45
    gap_ = (PW - 4 * pw_) / 3
    for i, (nm, t) in enumerate(steps):
        x = PM + i * (pw_ + gap_)
        ph = phone(sl, nm, x, 1.82, h=ph_h)
        ph.left = E(x + (pw_ - ph.width / 914400.0) / 2)
        tb(sl, x - 0.05, 6.4, 0.45, 0.5, str(i + 1), size=24, color=L700, font=DISPLAY, anchor=MIDDLE)
        tb(sl, x + 0.4, 6.4, pw_ + 0.3, 0.5, t, size=15, bold=True, anchor=MIDDLE)
    say(sl, 'The application as it runs today, in preview with sample data. One: a member joins a circle through an '
            'invitation and picks a turn from those open to them. Two: the instalment is collected automatically; the '
            'first attempt is on the member’s payday and, if salary is late, it is retried each morning, five times at '
            'most, before the 8th. Three: on their turn the whole pot arrives the same day. Four: every payment is '
            'recorded and reported, so committee payments finally count towards a credit record. Messages come on '
            'WhatsApp, in Roman Urdu first.')


# ================================================================== 11 PRODUCTS
def s_products():
    sl = hslide('It runs on %s products that already exist, plus %s new lines.' % (BN, 'two' if MQ_ else 'three'))
    yl = 3.0
    if MQ_:
        steps = [('Open', 'NEO account and card', 'in about five minutes'),
                 ('Salary in', 'Islamic Current Profit Account', 'profit on the daily balance'),
                 ('Due the 8th', 'Direct debit mandate', 'collects the instalment'),
                 ('Payout', 'Free instant transfer', 'the pot, same day'),
                 ('Save on', 'Islamic Savings Account', 'up to 11.5%'),
                 ('Abroad', 'Mashreq Pakistan Account', 'families in the UAE')]
        new = [(3, 0.4, 'Cover', 'guarantee, insurance or takaful'),
               (4, 0.9, 'Asset financing', 'motorcycles and machines')]
        branch_from = 2
        src = ['Mashreq NEO Pakistan product pages and rate sheets, read 29 September 2026']
    else:
        steps = [('Open', 'Asaan Digital Account', 'CNIC and mobile, at once'),
                 ('Salary in', 'Mudarabah Savings Account', 'profit from actual returns'),
                 ('Held', '7 day Mudarabah Certificate', 'payday to the 8th'),
                 ('Payout', 'Free Raqami transfer', 'the pot, same day'),
                 ('Save on', 'Saving Pots', 'goal based saving'),
                 ('Cash in', 'Askari Bank branches', 'free deposits at 700+')]
        new = [(1, 0.6, 'Standing instruction', 'debit on the 8th, by API'),
               (3, 0.1, 'Committee takaful', 'with EFU, Raqami’s partner'),
               (4, 0.75, 'Asset financing', 'ijarah: motorcycles, machines')]
        branch_from = 1
        src = ['Raqami products page, FAQ and home page, read 29 September 2026']
    cw6 = PW / 6
    line(sl, PM, yl, RX, yl, L700, 5.0)
    xs = []
    for i, (st_, prod, det) in enumerate(steps):
        xc = PM + i * cw6 + 0.16
        xs.append(xc)
        oval(sl, xc - 0.15, yl - 0.15, 0.3, WHITE, line=L700, lw=3.0)
        tb(sl, xc - 0.16, yl - 0.67, cw6 - 0.1, 0.4, st_, size=16, bold=True, color=INK)
        tb(sl, xc + 0.24, yl + 0.27, cw6 - 0.36, 0.6, prod, size=14, bold=True, color=L700, spacing=1.02)
        tb(sl, xc + 0.24, yl + 0.9, cw6 - 0.36, 0.7, det, size=12.5, color=GREY, spacing=1.03)
    yb = 5.05
    path(sl, [(xs[branch_from], yl + 0.16), (xs[branch_from], yb), (RX - 0.3, yb)], BC, 3.0, arrow=False, dash=True)
    tb(sl, xs[branch_from] - 2.25, yb - 0.5, 2.1, 0.35, 'New lines', size=14.5, bold=True, color=BC, align=R)
    for idx, off, t, d in new:
        xc = xs[idx] + off
        oval(sl, xc - 0.14, yb - 0.14, 0.28, WHITE, line=BC, lw=2.5)
        tb(sl, xc - 0.16, yb + 0.25, 2.4, 0.35, t, size=14.5, bold=True, color=BC)
        tb(sl, xc - 0.16, yb + 0.6, 2.3, 0.6, d, size=12.5, color=GREY, spacing=1.03)
    sources(sl, src)
    if MQ_:
        say(sl, 'This slide is for the product team: almost every step uses a product Mashreq already has, drawn as '
                'one line through the life of a committee.\n\n'
                'The account opens inside the Halqa application through Mashreq’s own onboarding, with a PayPak or '
                'Mastercard debit card, in about five minutes. From payday to the due date, about a week, the '
                'instalment sits in the Islamic Current Profit Account, a mudaraba account paying profit on the daily '
                'closing balance, monthly, up to 5 per cent; that profit comes back to members at the end of the '
                'circle as points, one point for each rupee. The direct debit collects on the 8th and the payout is a '
                'free instant transfer. After the circle, savings can stay in the Islamic Savings Account, up to 11.5 '
                'per cent. Families in the UAE join through the Mashreq Pakistan Account, opened from the UAE '
                'application.\n\n'
                'The dashed branch is new: cover for defaults, from Mashreq’s own guarantee, its insurance partner '
                'or takaful, whichever Mashreq chooses; and ijarah financing for motorcycles and machines bought '
                'through asset circles, the first step to a lending book.')
    else:
        say(sl, 'This slide is for the product team: almost every step uses a product Raqami already has, drawn as '
                'one line through the life of a committee.\n\n'
                'The Asaan Digital Account opens inside the Halqa application on a CNIC and a registered mobile '
                'number, at once; the Full account follows for larger circles. Salary lands in the Mudarabah Savings '
                'Account. For the week between payday and the due date the instalment can sit in a 7 day Mudarabah '
                'Certificate, so even that week earns a share of real profit, returned to members at the end of the '
                'circle as points, one point for each rupee. The payout is a free Raqami transfer the same day. After '
                'the circle, savings can stay in Saving Pots. Members who earn in cash, such as market traders, '
                'deposit it free at more than 700 Askari Bank branches.\n\n'
                'The dashed branch is new: a standing instruction for automatic debit on the 8th, built on Raqami’s '
                'open API, since the public product pages list no recurring debit today; committee takaful with EFU, '
                'which already covers Raqami’s cards; and ijarah financing for motorcycles and machines, which fits '
                'Raqami’s planned auto financing.')


# ================================================================ 12 ONBOARDING
def s_onboarding():
    sl = hslide('%s verifies each customer; Halqa’s checks decide which turns each member may take.' % BN)
    lanes = [('Member', INK, 1.95, 3.05), (BN, BC, 3.05, 4.2), ('Halqa checks', L700, 4.2, 6.1)]
    for name, col, ya, yb_ in lanes:
        tb(sl, PM, ya, 1.6, yb_ - ya, name, size=15, bold=True, color=col, anchor=MIDDLE)
        rule(sl, PM, ya, PW, RULE, 0.75)
    rule(sl, PM, 6.1, PW, RULE, 0.75)
    vrule(sl, PM + 1.65, 1.95, 4.15, RULE, 0.75)
    bw9, bh9 = 1.5, 0.52
    bx9 = [2.5, 4.2, 5.95, 7.7, 9.45, 11.12]
    by9 = [2.2, 3.3, 4.45, 4.45, 4.45, 4.45]
    bl9 = ['Signup', 'Account', 'Identity', 'Income', 'Affordability', 'Score']
    bc9 = [INK2, BC, L700, L700, L700, L700]
    acct = 'CNIC, NADRA biometric, due diligence' if MQ_ else 'CNIC and mobile, at once'
    bd9 = ['phone and PIN', acct, 'names, live face, home, job', 'a regular salary day',
           'instalments within a third of income', '300 to 850']
    for i in range(6):
        rect(sl, bx9[i], by9[i], bw9, bh9, WHITE, line=bc9[i], lw=1.25,
             paras=[(bl9[i], dict(size=14, bold=True, color=INK if i == 0 else bc9[i], align=CEN))], pad=0.02,
             anchor=MIDDLE)
        tb(sl, bx9[i] - 0.14, by9[i] + bh9 + 0.05, bw9 + 0.28, 0.62, bd9[i], size=12, color=GREY, align=CEN,
           spacing=1.03)
    path(sl, [(bx9[0] + bw9, by9[0] + bh9 / 2), (bx9[1] + bw9 / 2, by9[0] + bh9 / 2), (bx9[1] + bw9 / 2, by9[1])],
         INK2, 1.25, arrow=True)
    path(sl, [(bx9[1] + bw9, by9[1] + bh9 / 2), (bx9[2] + bw9 / 2, by9[1] + bh9 / 2), (bx9[2] + bw9 / 2, by9[2])],
         INK2, 1.25, arrow=True)
    for i in (2, 3, 4):
        line(sl, bx9[i] + bw9 + 0.02, by9[i] + bh9 / 2, bx9[i + 1] - 0.02, by9[i] + bh9 / 2, INK2, 1.25, arrow=True)
    line(sl, bx9[5] + bw9 / 2, by9[5], bx9[5] + bw9 / 2, 2.82, L700, 1.5, arrow=True)
    tb(sl, bx9[5] - 1.55, 2.18, bw9 + 1.6, 0.62, 'shown only the circles and turns open to them', size=13,
       bold=True, color=L700, align=R, spacing=1.03)
    foot = 'Stored: results only, never images or passwords.'
    if not MQ_:
        foot = 'Residents aged 18 and over.   ' + foot
    tb(sl, PM, 6.2, PW, 0.3, foot, size=12, color=GREY)
    acct_n = ('checks: CNIC, NADRA biometric verification and customer due diligence' if MQ_ else
              'checks: a valid CNIC and the registered mobile number; the Asaan Digital Account opens on successful '
              'verification and the Full account after document review. Raqami onboards residents aged 18 and over, '
              'which matches Halqa, since only adults can contract')
    say(sl, 'How a member gets in, lane by lane, and who does each check. After signup, %s opens the account with its '
            'own %s. Then four Halqa checks run on top.\n\n'
            'Identity: the names on the CNIC, the bank account and the application must match, 0.90 or more passes '
            'and 0.80 to 0.90 goes to a person; a live face match; home against the declared address; the declared '
            'job against the income seen.\n\n'
            'Income: the account the income arrives in; salary from one employer on about the same day each month, '
            'or for daily circles Rs 1,000 or more on five days a week for eight weeks. Transfers from the member’s '
            'own accounts and loans do not count. It learns the payday, so the debit lands when the money is there.'
            '\n\nAffordability: all instalments within a third of verified income, and within 40 per cent with other '
            'loans, the limit the State Bank uses for consumer finance.\n\n'
            'Score: Halqa’s credit score, 300 to 850, which decides which turns a member may take. The member only '
            'ever sees the circles and turns open to them. Halqa stores results, never face images, card numbers or '
            'passwords.' % (BN, acct_n))


# =================================================================== 13 TYPES
def s_types():
    sl = hslide('The less members know each other, the stricter the checks.')
    if MQ_:
        types = ['Known', 'Unknown', 'Large unknown', 'Asset', 'UAE family', 'Hyper']
        rows = [('Members', ['6 to 12', '12', '20', '12', '6 to 12', '390 to 400']),
                ('Instalment', ['Rs 2,000 to 10,000', 'Rs 10,000', 'Rs 25,000', 'Rs 10,000', 'Any',
                                'Rs 450 to 500']),
                ('How often', ['Monthly or weekly', 'Monthly', 'Monthly', 'Monthly', 'Monthly', 'Daily']),
                ('Income checked', [0, 1, 1, 1, 0, 1]), ('Automatic debit', [0, 1, 1, 1, 1, 1]),
                ('Cover', [0, 1, 1, 1, 0, 1]), ('Credit report read', [0, 1, 1, 1, 0, 1])]
    else:
        types = ['Known', 'Unknown', 'Large unknown', 'Asset', 'Hyper']
        rows = [('Members', ['6 to 12', '12', '20', '12', '390 to 400']),
                ('Instalment', ['Rs 2,000 to 10,000', 'Rs 10,000', 'Rs 25,000', 'Rs 10,000', 'Rs 450 to 500']),
                ('How often', ['Monthly or weekly', 'Monthly', 'Monthly', 'Monthly', 'Daily']),
                ('Income checked', [0, 1, 1, 1, 1]), ('Automatic debit', [0, 1, 1, 1, 1]),
                ('Takaful cover', [0, 1, 1, 1, 1]), ('Credit report read', [0, 1, 1, 1, 1])]
    lw10 = 2.55
    cwt = (PW - lw10) / len(types)
    y0 = 1.9
    for j, t in enumerate(types):
        paras = [(t, dict(size=15, bold=True, color=AMBER if t == 'Hyper' else L700, align=CEN))]
        if t == 'Hyper':
            paras.append(('experimental', dict(size=10.5, color=GREY, align=CEN)))
        tb(sl, PM + lw10 + j * cwt, y0 - 0.2, cwt - 0.05, 0.65, paras, anchor=BOTTOM, spacing=1.0)
    rule(sl, PM, y0 + 0.5, PW, L700, 1.25)
    for i, (lab, vals) in enumerate(rows):
        y = y0 + 0.56 + i * 0.5
        tb(sl, PM, y, lw10 - 0.1, 0.48, lab, size=14.5, anchor=MIDDLE)
        for j, v in enumerate(vals):
            xc = PM + lw10 + j * cwt
            if isinstance(v, int):
                harvey(sl, xc + cwt / 2, y + 0.24, 0.22, 2 if v else 0)
            else:
                tb(sl, xc, y, cwt - 0.05, 0.48, v, size=13.5, align=CEN, anchor=MIDDLE)
        rule(sl, PM, y + 0.49, PW)
    yl10 = y0 + 0.56 + len(rows) * 0.5 + 0.14
    harvey(sl, PM + 0.1, yl10 + 0.13, 0.18, 2)
    tb(sl, PM + 0.28, yl10, 1.4, 0.26, 'required', size=12, color=GREY)
    harvey(sl, PM + 1.45, yl10 + 0.13, 0.18, 0)
    tb(sl, PM + 1.63, yl10, 1.6, 0.26, 'not required', size=12, color=GREY)
    tb(sl, PM + 3.1, yl10, PW - 3.1, 0.26, 'Known: family, colleagues or neighbours.', size=12, color=GREY)
    uae = (' UAE family circles join relatives across two countries through Mashreq’s non resident accounts.'
           if MQ_ else ' Circles for families overseas follow once Raqami opens accounts to non residents; today it '
                       'onboards residents only.')
    say(sl, '%s kinds of circle and what each asks of its members. Known circles, between family, colleagues or '
            'neighbours, including the weekly bazaar committee, need only identity checks, because the group itself '
            'knows its members. Circles between strangers need the income check, automatic debit, %s and a credit '
            'report; the large ones are the committees in lakhs. Asset circles buy a motorcycle or machine with %s '
            'financing.%s\n\n'
            'Hyper is a daily circle of 390 to 400 members, run as an experiment. A member pays Rs 450 a day: Rs 300 '
            'goes into the pot, Rs 135 to cover and Rs 15 is the fee; the second design is Rs 500 a day with Rs '
            '333.33 to the pot, Rs 151.67 to cover and a Rs 15 fee. Pots are Rs 15,000 and Rs 8,666.67.\n\n'
            'In every kind the early turns must be earned: a new member starts in the last turns until two circles '
            'have completed cleanly.'
        % ('Six' if MQ_ else 'Five', 'cover' if MQ_ else 'takaful cover', BN, uae))


# ==================================================================== 14 RISK
def s_risk():
    sl = hslide('All the risk sits in the early turns, so only proven members may take them.')
    tb(sl, PM, 1.75, 8, 0.3, 'Still owed after collecting, Rs thousand: circle of 12 at Rs 10,000', size=12.5,
       bold=True, color=INK)
    base, top_ = 5.35, 2.55
    pitch, bw = 0.62, 0.44
    cx0 = PM + 0.1
    for k in range(1, 13):
        v = 10 * (12 - k)
        col = L700 if k <= 6 else (LIME if k <= 9 else LIME_MID)
        x = cx0 + (k - 1) * pitch + (pitch - bw) / 2
        hgt = (base - top_) * v / 110.0
        if v:
            rect(sl, x, base - hgt, bw, hgt, col)
        tb(sl, x - 0.12, base - hgt - 0.29, bw + 0.24, 0.26, str(v), size=12, color=INK2, align=CEN)
        tb(sl, x - 0.12, base + 0.06, bw + 0.24, 0.26, str(k), size=12, color=GREY, align=CEN)
    line(sl, cx0, base, cx0 + 12 * pitch, base, GREY, 0.75)
    for a_, b_, lab in [(1, 6, 'turns 1 to 6: score 650+'), (7, 9, 'score 550+'), (10, 12, 'any score; new members')]:
        xa = cx0 + (a_ - 1) * pitch + 0.05
        xb_ = cx0 + b_ * pitch - 0.05
        yb_ = 5.85
        line(sl, xa, yb_, xb_, yb_, INK2, 0.75)
        line(sl, xa, yb_ - 0.08, xa, yb_, INK2, 0.75)
        line(sl, xb_, yb_ - 0.08, xb_, yb_, INK2, 0.75)
        tb(sl, xa, yb_ + 0.05, xb_ - xa, 0.5, lab, size=13, color=INK, align=CEN, spacing=1.02)
    x0 = 8.75
    fig(sl, x0, 2.0, RX - x0, 'Rs 110,000', 'the most anyone can owe: turn 1 of 12', nsize=34, lsize=15)
    rule(sl, x0, 3.45, RX - x0)
    fig(sl, x0, 3.7, RX - x0, 'Last 3 turns', 'where every new member starts', nsize=30, lsize=15)
    say(sl, 'This is the question every banker asks first, so risk gets three slides.\n\n'
            'The chart is the whole risk in one picture. On a circle of twelve at Rs 10,000, the member who collects '
            'in turn one still owes Rs 110,000; the member in turn twelve owes nothing, because they have already '
            'paid everything in. Risk exists only where someone collects before they have paid.\n\n'
            'So the early turns are closed to weak scores. Turns one to six need 650 or more on Halqa’s 300 to 850 '
            'scale, turns seven to nine need 550, and the last three are open to anyone. Every new member starts in '
            'the last three turns until two circles have completed cleanly, so a stranger can never take the first '
            'pot. A member may hold at most six circles at once and one daily circle. These bands are mandatory, with '
            'no exceptions.')


# ============================================================== 15 PREVENTION
def s_prevention():
    sl = hslide('Four checkpoints stop most missed payments before they happen.')
    stages = [('Before joining', 'four checks; the host admits each member'),
              ('At joining', 'full cost shown; 24 hours to withdraw; signed guarantee'),
              ('Each instalment', 'debit on payday; retries each morning'),
              ('A missed payment', 'arrears taken from the member’s own pot')]
    ty = 1.95
    xs = [PM + i * PW / 4 for i in range(4)]
    line(sl, PM, ty + 0.12, RX - 0.2, ty + 0.12, L700, 3.0)
    for i, (t, d) in enumerate(stages):
        oval(sl, xs[i], ty, 0.24, WHITE, line=L700, lw=2.5)
        tb(sl, xs[i], ty + 0.36, PW / 4 - 0.3, 0.35, t, size=16, bold=True, color=INK)
        tb(sl, xs[i], ty + 0.76, PW / 4 - 0.35, 0.9, d, size=14, color=INK2, spacing=1.04)
    cy = 4.2
    tb(sl, PM, cy - 0.42, 8, 0.3, 'One instalment, day by day', size=12.5, bold=True, color=INK)
    dw = PW / 12
    fills = {1: LIME, 2: LIME_MID, 3: LIME_MID, 4: LIME_MID, 5: LIME_MID, 8: BC, 9: RED, 10: RED, 11: RED, 12: RED}
    for d in range(1, 13):
        x = PM + (d - 1) * dw
        col = fills.get(d, EMPTY)
        rect(sl, x + 0.03, cy, dw - 0.06, 0.62, col)
        tb(sl, x, cy + 0.14, dw, 0.35, str(d), size=14, bold=True, color=WHITE if col in (BC, RED, LIME) else INK2,
           align=CEN)
    for d, span, t in [(1, 1, 'payday: first debit'), (2, 4, 'a retry each morning, five attempts at most'),
                       (8, 1, 'due date'), (9, 4, 'late charges: 2%, then 5%, then 10%')]:
        x = PM + (d - 1) * dw
        tb(sl, x + 0.04, cy + 0.7, dw * span - 0.08, 0.5, t, size=12, color=INK2, spacing=1.0)
    tb(sl, PM, 5.7, PW, 0.5, [[('Each late step also lowers the score: ', dict(size=14, color=INK2)),
                               ('10, 20, then 40 points.', dict(size=14, bold=True, color=INK))]])
    sources(sl, ['Default Prevention (HQ-CP-05); State Bank 40 per cent consumer finance limit, BPRD Circular Letter 29 '
                 'of 2021'])
    say(sl, 'Four checkpoints run in time, top row.\n\n'
            'Before joining: the identity, income and affordability checks and the score, and the host admits each '
            'member.\n\n'
            'At joining: every rupee the member will owe is shown before they sign; there are 24 hours to withdraw at '
            'no cost; the member signs a ten clause undertaking and a mutual guarantee with the other members, and '
            'the %s.\n\n'
            'Each instalment, bottom row: a reminder the evening before, then the first debit on the member’s payday, '
            'which Halqa learns from the account; if the salary is late, one retry each morning, five attempts at '
            'most. The due date is the 8th. Only after that do late charges start: 2, 5 and 10 per cent of the '
            'instalment as the delay grows, with score falls of 10, 20 and 40, within what the Contract Act allows%s.'
            '\n\nA missed payment before collecting costs the other members nothing: the arrears are taken out of '
            'that member’s own pot on their turn. A daily circle stops opening new days once losses would exceed its '
            'cover.' % (B['mandate_n'], '; on the Islamic window late fees go to charity' if MQ_ else
                        '; every late charge goes to charity and never becomes income, as Islamic finance requires'))


# ================================================================ 16 RECOVERY
def s_recovery():
    sl = hslide('If a member stops after collecting, %s pays the others first; recovery follows.'
                % B['cover_word'])
    tb(sl, PM, 2.3, 1.95, 0.6, 'Members left short', size=14, bold=True, color=INK2, anchor=MIDDLE, spacing=1.03)
    tb(sl, PM, 3.4, 1.95, 0.75, 'The member who stopped', size=14, bold=True, color=INK2, anchor=MIDDLE,
       spacing=1.03)
    yl = 3.8
    cxs = [3.15 + i * 1.74 for i in range(6)]
    st = [('Contact', 'hardship plan'), ('Restrict', 'score down 200'), (B['cover_word'].capitalize(), 'pays those '
                                                                                                     'left short'),
          ('Guarantee', 'balance falls due'), ('Civil suit', 'on the undertaking'), ('Cheque', 'only if one is held')]
    for i in range(5):
        line(sl, cxs[i], yl, cxs[i + 1], yl, L700, 1.5 + i * 0.9)
    for i, (t, d) in enumerate(st):
        oval(sl, cxs[i] - 0.12, yl - 0.12, 0.24, WHITE, line=L700, lw=2.0)
        tb(sl, cxs[i] - 0.84, yl + 0.24, 1.68, 0.32, '%d  %s' % (i + 1, t), size=14.5, bold=True, color=INK,
           align=CEN)
        tb(sl, cxs[i] - 0.84, yl + 0.6, 1.68, 0.5, d, size=12.5, color=GREY, align=CEN, spacing=1.03)
    tb(sl, cxs[0] - 0.12, yl - 0.47, 4.2, 0.28, 'each step only if the one before fails', size=12, color=GREY)
    line(sl, cxs[2], yl - 0.14, cxs[2], 2.73, L700, 1.5, arrow=True)
    line(sl, cxs[0], 2.66, cxs[2] - 0.05, 2.66, GREY_LT, 1.0, dash=True)
    rect(sl, cxs[2], 2.6, RX - cxs[2], 0.12, L700)
    tb(sl, cxs[2] + 0.1, 2.18, RX - cxs[2] - 0.1, 0.35, 'paid in full, in their own names', size=14.5, bold=True,
       color=L700)
    facts = [('About 5.5%', 'of the instalment prices the %s [1]' % B['cover_word'], L700),
             ('%s chooses' % BN, 'guarantee, insurance or takaful' if MQ_ else 'the takaful operator', BC),
             ('Never', 'relatives, contact lists or public names', RED)]
    fw = (PW - 2 * 0.4) / 3
    for i, (n_, t, col) in enumerate(facts):
        x = PM + i * (fw + 0.4)
        if i:
            vrule(sl, x - 0.2, 5.35, 1.0, RULE, 0.75)
        tb(sl, x, 5.28, fw, 0.5, n_, size=28, color=col, font=DISPLAY)
        tb(sl, x, 5.85, fw, 0.62, t, size=14, spacing=1.04)
    sources(sl, ['Takaful Cover Pricing Model (HQ-MF-05): one circle in five losing a fifth of its members from the '
                 'earliest turns'])
    say(sl, 'Recovery. A member who misses before collecting costs the others nothing, because the arrears come out '
            'of their own pot. So recovery only matters for someone who has already collected and then stops paying; '
            'the worst case is turn one on a circle of twelve at Rs 10,000, with Rs 110,000 still owed.\n\n'
            'The bottom lane is that member; the line thickens as the steps escalate, and each step is used only if '
            'the one before fails. One, contact: most cases end with a hardship statement, a waived charge and a new '
            'date. Two, the account is restricted and the score falls by 200. Three, the %s pays the members left '
            'short, in their own names: that is the top lane, and they are made whole while recovery continues. '
            'Four, the mutual guarantee: the whole balance falls due. Five, an ordinary civil suit on the signed '
            'undertaking. Six, only where a guarantee cheque is held, a summary suit on it; nothing more is ever '
            'claimed.\n\n'
            'The %s is priced for a severe stress case, one circle in five losing a fifth of its members from the '
            'earliest turns: about 5.5 per cent of the instalment on a circle between strangers. %s. What Halqa never '
            'does: call relatives, read contact lists or publish names. That is how the banned loan applications '
            'worked.'
        % (B['cover_word'], B['cover_word'], 'Mashreq chooses between its own guarantee, an insurance partner and '
                                             'takaful' if MQ_ else 'Raqami chooses the takaful operator, EFU window '
                                                                   'takaful being its existing partner'))


# =================================================================== 17 MONEY
def s_money():
    sl = hslide('Each instalment splits three ways, and %s shares its fee with Halqa.' % BN)
    tb(sl, PM, 1.75, 6.3, 0.3, 'One instalment, circle between strangers', size=12.5, bold=True, color=INK)
    tb(sl, PM, 2.03, 6.3, 0.28, 'the member pays Rs 11,047', size=12.5, color=GREY)
    sx, sw, sy0, sh = PM + 0.05, 0.16, 2.45, 3.4
    k_ = sh / 11047.0
    parts = [(10000, L700, LIME_LT, 2.3), (547, INK2, EMPTY, 5.62), (500, BC, BLT, 5.98)]
    tx = 3.2
    ya = sy0
    rect(sl, sx, sy0, sw, sh, INK2)
    for v, ncol, bcol, ty_ in parts:
        hh = v * k_
        band(sl, sx + sw, ya, ya + hh, tx, ty_, ty_ + hh, bcol)
        rect(sl, tx, ty_, sw, hh, ncol)
        ya += hh
    cy_c = 2.3 + 10000 * k_ / 2
    tb(sl, tx + 0.3, cy_c - 0.5, 3.4, 0.5, 'Rs 10,000', size=28, color=L700, font=DISPLAY)
    tb(sl, tx + 0.3, cy_c + 0.08, 3.4, 0.3, 'to the member collecting', size=15)
    tb(sl, tx + 0.3, 5.5, 3.9, 0.3, [[('Rs 547  ', dict(size=14, bold=True)), (B['cover_word'], dict(size=14))]])
    tb(sl, tx + 0.3, 5.86, 3.95, 0.6, [[('up to Rs 500  ', dict(size=14, bold=True, color=BC)),
                                        ('%s to %s; share to Halqa' % (B['fee_word'], BN), dict(size=14))]],
       spacing=1.03)
    x0, y0 = 8.0, 1.75
    tb(sl, x0, y0, RX - x0, 0.3, 'Halqa covers its own costs at 2,572 members', size=12.5, bold=True, color=INK)
    ax0, ay0, aw, ah = x0 + 0.15, y0 + 0.6, RX - x0 - 0.35, 3.1
    line(sl, ax0, ay0 + ah, ax0 + aw, ay0 + ah, GREY, 0.75)
    line(sl, ax0, ay0, ax0, ay0 + ah, GREY, 0.75)
    mmax, rmax = 6000.0, 3.2
    X = lambda m: ax0 + aw * m / mmax
    Y = lambda r: ay0 + ah - ah * r / rmax
    line(sl, X(0), Y(1.32), X(6000), Y(1.32), INK2, 2.0)
    line(sl, X(0), Y(0), X(6000), Y(0.000513 * 6000), L700, 3.0)
    be = 1.32 / 0.000513
    oval(sl, X(be) - 0.08, Y(1.32) - 0.08, 0.16, WHITE, line=L700, lw=2.0)
    tb(sl, X(be) - 1.55, Y(1.32) - 0.45, 1.45, 0.3, 'break even', size=12.5, bold=True, color=L700, align=R)
    tb(sl, X(3300), Y(1.32) + 0.06, 2.2, 0.28, 'fixed cost, Rs 1.32 m a month', size=11.5, color=INK2)
    tb(sl, X(250), Y(3.05), 2.5, 0.5, 'about Rs 510 a member a month', size=11.5, color=L700, spacing=1.0)
    for m in (0, 2000, 4000, 6000):
        tb(sl, X(m) - 0.4, ay0 + ah + 0.04, 0.8, 0.25, '{:,}'.format(m), size=10.5, color=GREY, align=CEN)
    tb(sl, ax0, ay0 + ah + 0.3, aw, 0.25, 'members', size=11, color=GREY, align=CEN)
    sources(sl, ['Business Model and Unit Costs (HQ-CP-03), 25 September 2026, before the bank’s terms',
                 'Takaful Cover Pricing Model (HQ-MF-05)'])
    extra = ('\n\nAfter the pilot, members may also exchange turns between themselves, with the price capped at the '
             'value of the pot, the buyer’s score checked against the earlier turn and the host approving; a fee is '
             'charged on each exchange.' if MQ_ else '')
    say(sl, 'How the money moves and how Halqa earns. Left: one instalment on a circle between strangers, drawn to '
            'scale. The member pays Rs 11,047: Rs 10,000 goes to whoever is collecting, Rs 547 is the %s, and up to '
            'Rs 500 is the %s. %s collects the %s as its own income and pays Halqa an agreed share, and the income on '
            'both sides is used to keep the member’s cost as low as possible. Halqa’s revenue is a share of what %s '
            'earns, never money held.\n\n'
            'Right: Halqa’s own economics from its 25 September model, before %s’s terms. Fixed costs are about Rs '
            '1.32 million a month; each active member contributes about Rs 510 a month after running costs; so Halqa '
            'covers its costs at about 2,600 members, 2,572 in the model. Running one payment costs Rs 13 to 35, '
            'mostly messages and checks. Revenue lines now: the fee share and an agreed share of %s’s income on '
            'committee balances. After the pilot: referral fees on asset financing, 2 to 4 per cent from the '
            'financier and 1 to 3 from the dealer, and a merchant commission when members spend points, one point per '
            'rupee. Points for paying on time never exceed half of Halqa’s own fee. Later, employer programmes.%s'
        % (B['cover_word'], B['fee_word'], BN, B['fee_word'], BN, BN, BN, extra))


# =================================================================== 18 TEAMS
def s_teams():
    sl = hslide('Every team at %s gets a direct answer.' % BN)
    rows = [('Business', '6 to 20 accounts a circle; Rs %s billion per 100,000 members' % B['dep100'], '7, 8'),
            ('Risk', 'early turns only for proven members; %s pays first' % B['cover_word'], '14 to 16'),
            ('Compliance', '%s holds all money; Halqa is its service provider' % BN, '6, 22'),
            ('Technology', 'account, %s and payment interfaces; daily reconciliation' % B['mandate_n'], '11, 24'),
            ('Finance', '%s keeps the fee and shares it; profit on balances' % BN, '17'),
            ('Shariah', 'no interest; flat fee; late charges to charity; takaful', '15, 16')]
    y = 1.85
    tb(sl, PM + 0.04, y, 2.0, 0.3, 'Team', size=11.5, bold=True, color=GREY)
    tb(sl, PM + 2.44, y, 7.0, 0.3, 'The answer', size=11.5, bold=True, color=GREY)
    tb(sl, RX - 1.3, y, 1.26, 0.3, 'Slides', size=11.5, bold=True, color=GREY, align=R)
    y += 0.34
    rule(sl, PM, y, PW, L700, 1.25)
    rh = 0.7
    for i, (t, a, s) in enumerate(rows):
        yy = y + i * rh
        tb(sl, PM + 0.04, yy, 2.3, rh, t, size=16, bold=True, color=BC if t in ('Business', 'Finance') else L700,
           anchor=MIDDLE)
        tb(sl, PM + 2.44, yy, PW - 2.44 - 1.4, rh, a, size=16, color=INK, anchor=MIDDLE, spacing=1.03)
        tb(sl, RX - 1.3, yy, 1.26, rh, s, size=13, color=GREY, align=R, anchor=MIDDLE)
        rule(sl, PM, yy + rh, PW)
    say(sl, 'A bank decides through its teams: business, risk, compliance, technology, finance and, for an Islamic '
            'product, Shariah. This slide gives each of them the one answer they will look for, and the slides where '
            'the detail is.\n\n'
            'Business wants customers and deposits: circles of six to twenty accounts at once, about Rs %s billion '
            'per 100,000 members at %s’s own average. Risk wants to know what happens when members stop: early turns '
            'only for proven members, arrears taken from the member’s own pot, and %s paying the others first. '
            'Compliance wants to know who holds money and who is regulated: %s holds every rupee, and Halqa is '
            'assessed as its service provider under the State Bank’s outsourcing framework, with audit rights for '
            'the bank and the State Bank. Technology wants the scope: account opening, the %s, payments and a daily '
            'reconciliation of every entry. Finance wants the economics: the bank keeps the fee and shares it, earns '
            'on balances and gains a financing book. And the Shariah side wants the structure: no interest, a flat '
            'fee, late charges to charity and takaful as cover.'
        % (B['dep100'], BN, B['cover_word'], BN, B['mandate_n']))


# ============================================================= 19 COMPARISON
def s_comparison():
    sl = hslide('Only this model keeps money in a bank, charges one fee and builds a credit record.')
    cols_c = ['Halqa with %s' % BN, 'Oraan', 'JazzCash Committee', 'Informal']
    crit = [('Money held by a licensed bank', [(2, BN), (0, 'own company accounts'), (1, 'organiser’s wallet'),
                                               (0, 'the organiser')])]
    if not MQ_:
        crit.append(('Shariah board oversight', [(2, 'Raqami’s Shariah Board'), (1, 'private adviser'),
                                                 (None, 'not stated'), (0, 'none')]))
    crit += [('Same fee for every turn', [(2, 'one flat fee'), (0, 'up to 21% a month'), (None, 'not published'),
                                          (2, 'usually none')]),
             ('Paid out automatically', [(2, 'same day'), (1, '11th to 18th'), (0, 'by hand'), (0, 'by hand')]),
             ('Defaults covered', [(2, B['cover_word']), (1, 'own balance sheet'), (None, 'not stated'),
                                   (0, 'organiser’s pocket')]),
             ('Credit record', [(2, 'every payment'), (1, 'defaulters only'), (0, 'none'), (0, 'none')]),
             ('Reach today', [(0, 'new'), (1, '600,000+ sign ups'), (2, '60 million registered'),
                              (2, '4 in 10 Pakistanis')])]
    lw14 = 2.95
    cwc = (PW - lw14) / 4
    y0 = 1.85
    rh = 0.56 if MQ_ else 0.52
    rect(sl, PM + lw14, y0, cwc, 0.5 + len(crit) * rh, LIME_XLT)
    for j, t in enumerate(cols_c):
        tb(sl, PM + lw14 + j * cwc + 0.15, y0, cwc - 0.2, 0.46, t, size=14.5, bold=True,
           color=L700 if j == 0 else INK, anchor=MIDDLE)
    rule(sl, PM, y0 + 0.5, PW, L700, 1.25)
    for i, (lab, cells) in enumerate(crit):
        y = y0 + 0.5 + i * rh
        tb(sl, PM, y, lw14 - 0.1, rh, lab, size=14.5, anchor=MIDDLE, spacing=1.0)
        for j, (lv, note) in enumerate(cells):
            xc = PM + lw14 + j * cwc + 0.15
            if lv is not None:
                harvey(sl, xc + 0.11, y + rh / 2, 0.22, lv)
            tb(sl, xc + 0.33, y, cwc - 0.5, rh, note, size=12.5, color=GREY if lv is None else INK2,
               italic=lv is None, anchor=MIDDLE, spacing=1.0)
        rule(sl, PM, y + rh, PW)
    yl = y0 + 0.5 + len(crit) * rh + 0.1
    for k, (lv, t) in enumerate([(2, 'yes'), (1, 'partly'), (0, 'no')]):
        harvey(sl, PM + 0.1 + k * 1.2, yl + 0.13, 0.18, lv)
        tb(sl, PM + 0.28 + k * 1.2, yl, 0.9, 0.26, t, size=12, color=GREY)
    sources(sl, ['Oraan terms, fee calculator and website, 28 Sep 2026', 'JazzCash app release note, Aug 2026, and '
                 'results to 31 March 2026'])
    say(sl, 'Side by side, scored full, half or empty. The last row is honest about reach: that is where %s and the '
            'hosts come in.\n\n'
            'Oraan, the closest competitor, holds members’ money in its own company accounts, keeps the return earned '
            'on it, charges the first turn up to 21 per cent of the instalment every month, about 54 per cent a year, '
            'pays out net between the 11th and the 18th, carries defaults on its own balance sheet and reports only '
            'defaulters to the bureau.%s\n\n'
            'JazzCash launched a committee feature in August 2026. It rotates, but the pot collects in the '
            'organiser’s wallet and the organiser pays out by hand; members are chosen from phone contacts, there is '
            'no way out before the end and no credit record; fees and default handling are not published. Its '
            'advantage is reach: 60 million registered customers, 29 million active in a quarter.\n\n'
            'The informal committee usually has no fee, but everything rests on the organiser. Halqa with %s is the '
            'only version where a bank holds the money, every turn pays the same fee and every payment builds a '
            'credit record.' % (BN, ' It markets its committees as Shariah compliant on the certificate of a private '
                                     'advisory firm.' if not MQ_ else '', BN))


# =============================================================== 20 EVIDENCE
def s_evidence():
    sl = hslide('Abroad, committee apps reached millions by working inside the formal system.')
    tx0, tx1 = PM + 2.7, RX - 3.1
    xy = lambda yr: tx0 + (yr - 2016) * (tx1 - tx0) / 10.0
    for yr in range(2016, 2027):
        tb(sl, xy(yr) - 0.3, 1.8, 0.6, 0.3, str(yr), size=11.5, color=GREY, align=CEN)
        vrule(sl, xy(yr), 2.12, 3.3, FAINT, 0.75)
    comp = [('Money Fellows', 'Egypt', 2016, [(2025, 'profitable')], '8 million+ users', 'central bank sandbox; '
                                                                                        'Banque Misr card'),
            ('Hakbah', 'Saudi Arabia', 2018, [(2020, 'launched under a central bank permit')],
             '2 million registered users', 'central bank sandbox'),
            ('Esusu', 'United States', 2018, [(2022, 'US$1 billion')], 'US$1.2 billion value', 'reports payments to '
                                                                                               'credit bureaus')]
    if not MQ_:
        comp = [comp[1], comp[0], comp[2]]
    for i, (name, ctry, start, ms, now, how) in enumerate(comp):
        y = 2.55 + i * 1.08
        tb(sl, PM, y - 0.25, 2.6, 0.36, name, size=16.5, bold=True, color=L700)
        tb(sl, PM, y + 0.12, 2.6, 0.3, ctry, size=12.5, color=GREY)
        line(sl, xy(start), y, xy(2026), y, L700, 3.5)
        oval(sl, xy(start) - 0.09, y - 0.09, 0.18, L700)
        for yr, lab in ms:
            oval(sl, xy(yr) - 0.1, y - 0.1, 0.2, WHITE, line=L700, lw=2.0)
            if yr >= 2024:
                tb(sl, xy(yr) - 2.0, y + 0.12, 2.1, 0.3, lab, size=12, color=INK2, align=R)
            else:
                tb(sl, xy(yr) - 0.1, y + 0.12, 3.3, 0.3, lab, size=12, color=INK2)
        tb(sl, tx1 + 0.25, y - 0.32, RX - tx1 - 0.25, 0.36, now, size=15, bold=True, color=INK, anchor=MIDDLE)
        tb(sl, tx1 + 0.25, y + 0.05, RX - tx1 - 0.25, 0.5, how, size=12.5, color=GREY, spacing=1.02)
    tb(sl, PM, 5.95, PW, 0.4, 'Each grew with a regulator, a bank or the credit bureaus behind it.', size=17,
       bold=True)
    sources(sl, ['Daily News Egypt, 20 Oct 2025', 'MENAbytes, 3 Sep 2020; Semafor, 3 Feb 2026', 'CNBC, 11 Dec 2025'])
    say(sl, 'Three examples from abroad; each line starts in the year the company started.\n\n'
            'Money Fellows in Egypt, founded 2016: more than 8 million users, US$1.5 billion of payments, more than 2 '
            'million completed circles, and profitable. It entered the Central Bank of Egypt’s sandbox and runs a '
            'prepaid card with Banque Misr.\n\n'
            'Hakbah in Saudi Arabia, founded 2018, launched in 2020 only after a permit under the Saudi central '
            'bank’s sandbox; more than 2 million registered users by February 2026, as the kingdom prepares a '
            'national savings strategy.\n\n'
            'Esusu in the United States, founded 2018, took the same idea into rent: it reports on-time payments to '
            'the credit bureaus, and was valued at US$1.2 billion in December 2025, covering 12 million people.\n\n'
            'The thread: each grew by working inside the formal system, a regulator, a bank or the bureaus. That is '
            'the sequence proposed with %s.' % BN)


# ================================================================ 21 WHY NOW
def s_whynow():
    sl = hslide('Payments went digital, committee savings did not, and a wallet has already moved.', bg=LIME,
                logo=False)
    tb(sl, PM, 1.75, 6.2, 0.35, 'Share of retail payments made digitally', size=13, bold=True, color=INK)
    chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, PM - 0.05, 2.15, 6.3, 3.9, ['FY2023', 'FY2024', 'FY2025',
                                                                          'Jan to Mar 2026'],
          [('Digital', [78, 85, 88, 92])], colors=[INK], fmt='0"%"', gap=55, size=13,
          label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=105)
    x0 = 7.45
    facts = [('Aug 2026', 'JazzCash launched a committee feature, 60 million customers behind it')]
    if MQ_:
        facts.append(('26%', 'of adults are financially literate; a committee needs none'))
    else:
        facts.append(('1 Jan 2028', 'the Constitution’s deadline to end riba'))
    facts.append(('75% by 2028', 'the State Bank’s target for adults with an account, from 64%'))
    for i, (n_, t) in enumerate(facts):
        y = 1.8 + i * 1.45
        tb(sl, x0, y, RX - x0, 0.6, n_, size=28, color=INK, font=DISPLAY)
        tb(sl, x0, y + 0.6, RX - x0, 0.75, t, size=15, color=INK, spacing=1.04)
        if i < len(facts) - 1:
            rule(sl, x0, y + 1.33, RX - x0, INK2, 0.5)
    srcs = ['SBP payment systems reviews, FY25 and Q3 FY26', 'JazzCash release notes and results',
            'SBP National Financial Inclusion Strategy 2024 to 2028']
    srcs.append('S&P Global FinLit Survey' if MQ_ else 'Constitution, Article 38(f), 26th Amendment')
    sources(sl, srcs, dark=True)
    extra = ('Only about a quarter of adults are financially literate. That is why committees survive: people '
             'understand them without understanding finance.' if MQ_ else
             'The Constitution now requires riba to be eliminated before 1 January 2028. People who have always '
             'chosen the committee because it carries no interest are the natural customers of an Islamic digital '
             'bank.')
    say(sl, 'Why now. Pakistan moved to digital payments fast: 78 per cent of retail payments were digital in FY2023, '
            '92 per cent by January to March 2026, when banking apps handled about 2.9 billion payments and Raast '
            '742 million. Savings did not follow: the committee is still cash.\n\n'
            'And the market is moving. JazzCash, with 60 million registered customers, launched a committee feature '
            'in August 2026. The first bank to offer a committee held safely, with a credit record, sets the '
            'standard.\n\n%s The State Bank’s strategy targets 75 per cent of adults with an account by 2028, from 64 '
            'per cent in 2023, and a smaller gender gap; committee members, more of them women than men, are exactly '
            'that group.' % extra)


# ============================================================== 22 REGULATION
def s_regulation():
    sl = hslide('Regulation comes through %s, with Halqa as its service provider.' % BN)
    bx, by, bw = PM, 1.95, 6.4
    bh = 3.85 if MQ_ else 4.5
    rect(sl, bx, by, bw, bh, None, line=GREY, lw=1.0)
    tb(sl, bx + 0.18, by + 0.1, bw - 0.4, 0.35, 'State Bank of Pakistan', size=15, bold=True, color=INK)
    rect(sl, bx + 0.35, by + 0.62, bw - 0.7, bh - 0.85, None, line=BC, lw=1.5)
    tb(sl, bx + 0.53, by + 0.72, bw - 1.0, 0.35, '%s: licence, accounts, payments' % BN, size=14.5, bold=True,
       color=BC)
    inner_y = by + 1.25
    if not MQ_:
        rect(sl, bx + 0.6, by + 1.2, bw - 1.2, 0.5, BLT, line=BC, lw=1.0,
             paras=[('Shariah Board: approves each structure', dict(size=13, bold=True, color=BC))], pad=0.12,
             anchor=MIDDLE)
        inner_y = by + 1.85
    rect(sl, bx + 0.6, inner_y, bw - 1.2, 2.0, LIME_XLT, line=L700, lw=1.5)
    tb(sl, bx + 0.78, inner_y + 0.14, bw - 1.5, 0.35, 'Halqa: service provider', size=14.5, bold=True, color=L700)
    tb(sl, bx + 0.78, inner_y + 0.55, bw - 1.5, 0.35, 'rules, checks, application, records', size=14, color=INK2)
    tb(sl, bx + 0.78, inner_y + 1.0, bw - 1.5, 0.9, 'outsourcing framework: audit rights for %s and the State Bank'
       % BN, size=12.5, color=GREY, spacing=1.04)
    x0 = 7.65
    tb(sl, x0, 1.95, RX - x0, 1.6, '“... digital financial services especially to unserved and underserved segments '
                                   'of the society”', size=18, color=INK, font=DISPLAY, spacing=1.08)
    tb(sl, x0, 3.6, RX - x0, 0.5, 'State Bank, aims of the digital bank framework, 2022 [1]', size=11.5, color=GREY,
       spacing=1.03)
    rule(sl, x0, 4.3, RX - x0)
    tb(sl, x0, 4.45, RX - x0, 1.2, 'The product goes to the State Bank through %s.' % BN, size=16, spacing=1.04)
    sources(sl, ['SBP BPRD Circular No. 01 of 2022', 'SBP Framework for Risk Management in Outsourcing Arrangements, '
                 '2017, revised 2019'])
    sh = (' Every structure also goes to Raqami’s Shariah Board before launch, and anything the Board cannot approve '
          'is not offered through Raqami.' if not MQ_ else ' The Islamic window product goes to Mashreq’s Shariah '
                                                             'board.')
    say(sl, 'Regulation, plainly: a system that runs committees with members’ money needs State Bank regulation. The '
            'nesting shows how it is met. %s’s licence covers the accounts and the payments. Halqa is assessed as '
            '%s’s service provider under the State Bank’s framework for outsourcing, with audit rights for %s and '
            'the State Bank. The product itself goes to the State Bank through %s, for approval or notice as the '
            'State Bank requires.%s\n\n'
            'The quotation on the right is from the State Bank’s own statement of what digital banks were licensed '
            'for: affordable, cost effective digital financial services, especially to the unserved and '
            'underserved. Committee members, more of them women than men and many without a bank account, are that '
            'group.' % (BN, BN, BN, BN, sh))


# =============================================================== 23 READINESS
def s_readiness():
    sl = hslide('The product is built; the company, the agreement and the connection come next.')
    cols = [('Built', L700, ['The app, in preview', 'Identity, income and score checks', 'Payday collection']),
            ('Written', L600, ['Legal position: twelve laws', 'Six risk and pricing models',
                               'Prevention and recovery design']),
            ('Next', BC, ['Incorporation', 'Agreement and State Bank path', 'Connection, then the pilot'])]
    cw_ = (PW - 2 * 0.35) / 3
    for i, (t, col, items) in enumerate(cols):
        x = PM + i * (cw_ + 0.35)
        rect(sl, x, 1.95, cw_, 0.14, col)
        tb(sl, x, 2.2, cw_, 0.5, t, size=24, color=col, font=DISPLAY)
        for k, it in enumerate(items):
            yy = 2.95 + k * 0.9
            tb(sl, x, yy, cw_ - 0.1, 0.8, it, size=17, color=INK, spacing=1.05, anchor=MIDDLE)
            rule(sl, x, yy + 0.82, cw_)
    tb(sl, PM, 6.0, PW, 0.4, 'No member money has moved: every payment today is a test record.', size=15,
       color=INK2)
    say(sl, 'Where things stand, honestly. Built: the application, running in preview with sample data, with its '
            'checks for identity, income, affordability and score, and payday collection with retries. Written: a '
            'legal position checked against twelve laws and regulations, six risk and pricing models, and the '
            'default prevention and recovery design.\n\n'
            'Next: the company is incorporated before any agreement, with its registered office in Islamabad; the '
            'agreement with %s and the path to the State Bank through %s; then the connection to %s’s interfaces for '
            'accounts, %s and payments, and testing. No member money has moved: every payment in the application '
            'today is a test record.' % (BN, BN, BN, 'mandates' if MQ_ else 'standing instructions'))


# =================================================================== 24 PILOT
def s_pilot():
    sl = hslide('A 14 week plan ends in one live month with about 1,000 members.')
    gx, gl, mw = PM, 3.1, 0.63
    for m in range(14):
        tb(sl, gx + gl + m * mw, 1.8, mw, 0.3, str(m + 1), size=11.5, color=GREY, bold=True, align=CEN)
    tb(sl, gx, 1.8, gl - 0.15, 0.3, 'Week', size=11.5, color=GREY, bold=True, align=R)
    rows_ = [('Agreement', 1, 4, L700), ('Approvals', 1, 8, L700), ('Connection and tests', 4, 8, LIME),
             ('Live month', 9, 12, LIME), ('Review', 13, 13, AMBER), ('Scale decision', 14, 14, BC)]
    for m in range(15):
        vrule(sl, gx + gl + m * mw, 2.15, 3.1, FAINT, 0.75)
    for i, (lab, a_, b_, col) in enumerate(rows_):
        y = 2.2 + i * 0.5
        tb(sl, gx, y, gl - 0.15, 0.44, lab, size=14.5, align=R, anchor=MIDDLE)
        rect(sl, gx + gl + (a_ - 1) * mw + 0.03, y + 0.07, (b_ - a_ + 1) * mw - 0.06, 0.32, col)
    y0 = 5.45
    tb(sl, PM, y0, 3.0, 0.3, 'Proposed pass marks', size=13.5, bold=True, color=L700)
    marks = [('95%', 'instalments collected on time'), ('100%', 'pots paid out the same day'),
             ('Under 1%', 'members with a complaint open a week')]
    mw3 = (PW - 3.1) / 3
    for i, (n_, t) in enumerate(marks):
        x = PM + 3.1 + i * mw3
        tb(sl, x, y0 - 0.12, mw3 - 0.2, 0.5, n_, size=26, color=INK, font=DISPLAY)
        tb(sl, x, y0 + 0.45, mw3 - 0.2, 0.6, t, size=13.5, color=INK2, spacing=1.03)
    say(sl, 'The pilot. About eight weeks before it goes live: the agreement and incorporation, the State Bank and '
            'Shariah approvals through %s, and the technical connection with testing.\n\n'
            'Then one month live with about 1,000 members in circles between people who know each other, up to 100 '
            'circles. In that month every circle makes its first collection and its first payout, which tests the '
            'whole machine: account opening, %s, the debit on payday, the payout, the messages and the complaints '
            'handling.\n\n'
            'Pass marks are proposed now so that the decision to scale is not a matter of opinion: 95 per cent of '
            'instalments collected on time, every pot paid out the same day, and fewer than one member in a hundred '
            'with a complaint still open after a week. The numbers are for %s to confirm. The circles themselves '
            'continue their full cycle under close watch.' % (BN, 'mandates' if MQ_ else 'standing instructions', BN))


# ================================================================= 25 REQUESTS
def s_requests():
    sl = hslide('Six decisions start the pilot.')
    if MQ_:
        asks = ['Approve the partnership', 'Take the product to the State Bank',
                'Approve it for the Islamic window; choose the cover', 'Accounts and mandates inside the Halqa app',
                'Instalments held in the Islamic Current Profit Account', 'Agree the income share and the pilot']
    else:
        asks = ['Approve the partnership', 'Take the product to the State Bank',
                'Shariah Board approval; takaful through EFU', 'Accounts and standing instructions inside the Halqa '
                                                                'app',
                'Instalments held in 7 day Mudarabah Certificates', 'Agree the income share and the pilot']
    for i, t in enumerate(asks):
        col_, row_ = divmod(i, 3)
        x = PM + col_ * (PW / 2 + 0.2)
        y = 2.15 + row_ * 1.5
        tb(sl, x, y, 0.8, 0.95, str(i + 1), size=44, color=L700, font=DISPLAY, anchor=MIDDLE)
        tb(sl, x + 0.9, y, PW / 2 - 1.2, 0.95, t, size=20, anchor=MIDDLE, spacing=1.04)
        rule(sl, x, y + 1.15, PW / 2 - 0.3)
    after = ('Credit reporting through Mashreq’s TASDEEQ membership, asset financing and UAE family circles follow the '
             'pilot.' if MQ_ else 'Credit reporting through Raqami’s TASDEEQ membership, asset financing and circles '
                                  'for families overseas follow the pilot.')
    say(sl, 'Six decisions start it. One: the partnership itself, with Halqa assessed as %s’s service provider. Two: '
            'taking the product to the State Bank for approval or notice. Three: %s. Four: account opening and %s '
            'inside the Halqa application. Five: %s between payday and the 8th, with the profit returned to members '
            'as points at the end of the circle. Six: the income share and the one month pilot.\n\n%s'
        % (BN, 'the Islamic window product through the Shariah board, and Mashreq’s choice of cover' if MQ_ else
           'the Shariah Board’s approval of the committee structure, the flat service fee, the charity destination of '
           'late charges and the points, with takaful through EFU window takaful or another operator Raqami chooses',
           'mandates' if MQ_ else 'standing instructions',
           'the Islamic Current Profit Account to hold instalments' if MQ_ else
           '7 day Mudarabah Certificates to hold instalments', after))


# =================================================================== 26 CLOSE
def s_close():
    sl = prs.slides.add_slide(BLANK)
    NUM[0] += 1
    rect(sl, 0, 0, W, H, LIME)
    rect(sl, PM - 0.15, 0.6, 2.05, 0.72, WHITE)
    pic(sl, LOGO, PM, 0.7, h=0.5)
    tb(sl, PM, 2.45, PW, 1.3, 'Halqa is the system. %s is the machine.' % BN, size=44, color=INK, font=DISPLAY)
    tb(sl, PM, 5.55, 8, 0.35, 'Taha Kayani, Chairman, Halqa', size=15, bold=True, color=INK)
    tb(sl, PM, 5.95, 11, 0.35, 'A detailed reference covers the law, the product, the economics and the evidence.',
       size=13, color=INK2)
    tb(sl, RX - 0.6, 7.06, 0.6, 0.28, str(NUM[0]), size=10, color=INK, align=R)
    say(sl, 'To close. Committees are the savings habit Pakistan already has. Halqa runs them; %s holds and moves the '
            'money under the State Bank’s regulation. Members get safety, one fair fee and a credit record; %s gets '
            'customers in groups, deposits and a %s book. A detailed reference covers the law, the product, the '
            'economics and the evidence for any team that wants to examine them.'
        % (BN, BN, 'lending' if MQ_ else 'financing'))


# ===================================================================== build
for f in (s_cover, s_summary, s_committee, s_size, s_problem, s_proposal, s_accounts, s_deposits, s_lending, s_app,
          s_products, s_onboarding, s_types, s_risk, s_prevention, s_recovery, s_money, s_teams, s_comparison,
          s_evidence, s_whynow, s_regulation, s_readiness, s_pilot, s_requests, s_close):
    f()

cp = prs.core_properties
cp.title = 'Halqa: partnership proposal for %s' % B['full']
cp.author = 'Halqa'
cp.last_modified_by = 'Halqa'
os.makedirs(os.path.dirname(os.path.abspath(OUTP)), exist_ok=True)
prs.save(OUTP)

bad, words = [], []
PAT = (r'\byou\b', r'\byour\b', r'\bwe\b', r'\bour\b', u'[‒–—―]', r' - ',
       r'(?i)\bjourney\b|\bunlock|\bseamless|\bempower|\bleverag|\brevolution|\btruly\b|\bSakh\b|\brecorder\b|Akif|'
       r'Saeed|Kazi|father|Sidra|Amjed|Hamayun|Aijaz|game.?changer')
for n, s in enumerate(prs.slides, 1):
    wn = 0
    for shp in s.shapes:
        if shp.has_text_frame:
            t = shp.text_frame.text
            if not t.startswith(('Source', 'Sources')) and not re.fullmatch(r'\d+', t.strip()):
                wn += len([w for w in t.split() if re.search('[A-Za-z]', w)])
            for pat in PAT:
                if re.search(pat, t):
                    bad.append((n, pat[:20], t[:70]))
    nt = s.notes_slide.notes_text_frame.text if s.has_notes_slide else ''
    for pat in PAT[4:]:
        if re.search(pat, nt):
            bad.append((n, 'NOTES ' + pat[:20], nt[:60]))
    words.append(wn)
print(BANK, 'slides', len(prs.slides), 'bytes', os.path.getsize(OUTP), 'words on slides', sum(words),
      'mean', round(sum(words) / float(len(words)), 1))
print('words per slide', words)
for b in bad:
    print('CHECK', b)
