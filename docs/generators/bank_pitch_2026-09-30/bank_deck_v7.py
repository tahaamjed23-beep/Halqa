# -*- coding: utf-8 -*-
"""
Halqa: partnership presentation for a partner bank. Mashreq version 7 and Raqami version 5, 30 September 2026.

Rebuilt after the chairman's review of 29 September (night):
  Arial only; plain noun headings with a plain subheading; a wider palette themed on each bank; proper diagrams;
  own slides for committee types, payment collection (the three methods and the bank's mandate), wallets and PSP
  integration, and default prevention; no pilot, no timeline, no requests slide; takaful or insurance only (no cover
  by Halqa, no bank guarantee); the PSP is not named.

Palette (checked with the dataviz validator, light surface): bank colour, lime #6DC72A, blue #2A78D6 and teal #0E9384
pass all pairs; the three step check-level ramp of each bank passes the ordinal checks.

Diagram notation, the same on every slide:
  boxes   bank = bank tint with bank outline; Halqa = lime tint with lime outline; members = grey; PSP, wallets,
          Raast and other banks = blue; takaful or insurance operator = teal; bureau and regulator = white, ink outline
  arrows  money = blue, 3 pt; instruction = lime 700, 1.5 pt; confirmation or record = slate, dashed;
          sequence of steps = slate, 1.5 pt
  status  amber = late (warning); red = loss or default (critical)

Usage: python bank_deck_build.py mashreq|raqami out.pptx
"""
import os, sys, math, re, datetime

ME = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.abspath(os.path.join(ME, '..', 'complete_position_2026-09-29', 'deck', 'd2_lib.py'))
G = {'__file__': LIB, '__name__': 'deck'}
exec(compile(open(LIB, encoding='utf-8').read(), 'd2_lib.py', 'exec'), G)
G['SHOTS'] = os.path.join(ME, 'shots')
G['DISPLAY'] = 'Arial'
globals().update({k: v for k, v in G.items() if not k.startswith('__')})
from pptx.enum.shapes import MSO_SHAPE as SH

BANK = sys.argv[1] if len(sys.argv) > 1 else 'mashreq'
OUTP = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ME, 'out', BANK + '.pptx')
PKT = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=5)
DATE_STR = '%d %s %d' % (PKT.day, PKT.strftime('%B'), PKT.year)
LOGOS = os.path.abspath(os.path.join(ME, '..', 'complete_position_2026-09-29', 'logos'))
MQ_ = BANK == 'mashreq'

# ------------------------------------------------------------------ palette ---
INK, SLATE, MUTED, LINE_, FAINT, WHITE = C('0C1408'), C('4B5563'), C('6B7280'), C('D1D5DB'), C('F3F4F6'), C('FFFFFF')
LIME, LIME_DK, LIME_LT, LIME_XLT = C('6DC72A'), C('41801A'), C('E3F8CA'), C('F3FCE7')
BLUE, BLUE_DK, BLUE_LT, BLUE_XLT = C('2A78D6'), C('1C5CAB'), C('D6E6FA'), C('EEF4FD')
TEAL, TEAL_DK, TEAL_LT, TEAL_XLT = C('0E9384'), C('0B6F64'), C('CFEFEA'), C('EBF8F6')
AMBER, AMBER_DK, AMBER_LT = C('EDA100'), C('8F6100'), C('FCEBC2')
RED, RED_DK, RED_LT = C('D64545'), C('A12F2F'), C('F8DADA')

P = {
    'mashreq': dict(
        short='Mashreq', full='Mashreq Bank Pakistan', th='D8602A', th_dk='9E3F17', th_mid='EFA27A', th_lt='F9DCCB',
        th_xlt='FDF1EA', lv=('EFA27A', 'D8602A', '9E3F17'), lv_txt=(INK, WHITE, WHITE),
        logo=os.path.join(LOGOS, 'mashreq-logo-colour.png'), logo_h=1.15, logo_y=0.5,
        today=8.5, add100=2.4, add1m=24.3, dep100='2.4',
        avg_line='Basis: Rs 8,515 million of deposits ÷ 350,000 customers = about Rs 24,000 a customer, '
                 '30 June 2026 [1]',
        grow=('+29%', 'more customers from 100,000 members, on 350,000 today'),
        mandate='direct debit mandate', mandate_c='Direct debit mandate',
        hold='Islamic Current Profit Account', hold_short='the Islamic Current Profit Account',
        ins='takaful or insurance', ins_c='Takaful or insurance',
        ins_choice='%s chooses the operator: its insurance partner or a takaful operator',
        lend='lending', lend_c='Lending',
        quote=('Customer acquisition during the period was primarily driven through strategic partnerships.',
               'Mashreq Bank Pakistan, half year report, 2026'),
    ),
    'raqami': dict(
        short='Raqami', full='Raqami Islamic Digital Bank', th='573F99', th_dk='3E2B73', th_mid='7E67C7',
        th_lt='E4DEF3', th_xlt='F4F1FB', lv=('B9ABE3', '7E67C7', '48348A'), lv_txt=(INK, WHITE, WHITE),
        logo=os.path.join(LOGOS, 'raqami-logo-colour.png'), logo_h=1.02, logo_y=0.66,
        today=1.58, add100=1.38, add1m=13.8, dep100='1.4',
        avg_line='Basis: Rs 1,581 million of deposits ÷ 114,452 accounts = about Rs 13,800 an account, '
                 '30 June 2026 [1]',
        grow=('+87%', 'more accounts from 100,000 members, on 114,452 today'),
        mandate='standing instruction', mandate_c='Standing instruction',
        hold='7 day Mudarabah Certificate', hold_short='7 day Mudarabah Certificates',
        ins='takaful', ins_c='Takaful',
        ins_choice='%s chooses the takaful operator; EFU window takaful is already its partner',
        lend='financing', lend_c='Financing',
        quote=('The Bank is establishing strategic partnerships with key digital platforms to broaden customer '
               'outreach.', 'Raqami Islamic Digital Bank, half year report, 2026'),
    ),
}
B = P[BANK]
BN, BFULL = B['short'], B['full']
TH, TH_DK, TH_MID, TH_LT, TH_XLT = [C(B[k]) for k in ('th', 'th_dk', 'th_mid', 'th_lt', 'th_xlt')]
LV = [C(h) for h in B['lv']]
INS, INS_C = B['ins'], B['ins_c']

PM = 0.6
RX = W - PM
PW = RX - PM
NUM = [0]


# -------------------------------------------------------------------- chrome ---
def say(sl, text):
    sl.notes_slide.notes_text_frame.text = text


def new_slide(head, sub=None, logo=True):
    sl = prs.slides.add_slide(BLANK)
    NUM[0] += 1
    tb(sl, PM, 0.36, 10.7, 0.6, head, size=28, bold=True, color=INK, spacing=1.0)
    if sub:
        tb(sl, PM, 0.97, 10.9, 0.4, sub, size=14.5, color=SLATE, spacing=1.0)
    if logo:
        lg = pic(sl, LOGO, 0, 0.47, h=0.3)
        lg.left = E(RX) - lg.width
    tb(sl, RX - 0.6, 7.04, 0.6, 0.26, str(NUM[0]), size=9.5, color=MUTED, align=R)
    return sl


def sources(sl, items, y=6.99):
    head = 'Sources   ' if len(items) > 1 else 'Source   '
    txt = '    '.join(('%d  %s' % (i + 1, s)) if len(items) > 1 else s for i, s in enumerate(items))
    tb(sl, PM, y, PW - 0.9, 0.3, [[(head, dict(size=8.5, bold=True, color=SLATE)),
                                   (txt, dict(size=8.5, color=MUTED))]], spacing=1.0)


# ------------------------------------------------------------------- drawing ---
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


def path(sl, pts, color, lw=1.5, arrow=False, dash=False):
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


def waffle(sl, x, y, parts, pitch=0.2, cell=0.16, cols=10, rows=10, empty=None):
    """Unit chart of cols x rows squares, filled column by column from the bottom left. parts: [(count, colour)]."""
    empty = empty or C('E5E7EB')
    bounds, acc = [], 0
    for cnt, col in parts:
        acc += cnt
        bounds.append((acc, col))
    k = 0
    for c_ in range(cols):
        for r_ in range(rows):
            col = empty
            for b_, cc in bounds:
                if k < b_:
                    col = cc
                    break
            sq(sl, x + c_ * pitch, y + (rows - 1 - r_) * pitch, cell, col)
            k += 1


def harvey(sl, cx, cy, d, level, color=None):
    color = color or TH
    r_ = d / 2.0
    if level == 2:
        oval(sl, cx - r_, cy - r_, d, color, line=color, lw=1.25)
        return
    oval(sl, cx - r_, cy - r_, d, WHITE, line=color, lw=1.25)
    if level == 1:
        pts = [(cx + r_ * math.cos(math.radians(a)), cy + r_ * math.sin(math.radians(a))) for a in range(-90, 91, 6)]
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


KIND = {'bank': (TH_XLT, TH), 'halqa': (LIME_XLT, LIME), 'member': (FAINT, SLATE), 'pay': (BLUE_XLT, BLUE),
        'ins': (TEAL_XLT, TEAL), 'inst': (WHITE, INK), 'amber': (AMBER_LT, AMBER), 'red': (RED_LT, RED)}


def ebox(sl, x, y, w, h, title, body=None, kind='bank', tsize=12.5, bsize=10.5, align=CEN, anchor=MIDDLE,
         lw=1.25, pad=0.08):
    """Labelled diagram box in the notation of its kind."""
    fillc, linec = KIND[kind]
    paras = [(title, dict(size=tsize, bold=True, color=INK, align=align))]
    if body:
        paras.append((body, dict(size=bsize, color=SLATE, align=align, before=2)))
    return rect(sl, x, y, w, h, fillc, line=linec, lw=lw, paras=paras, pad=pad, anchor=anchor, spacing=1.02)


AR = {'money': (BLUE, 3.0, False), 'instr': (LIME_DK, 1.5, False), 'data': (SLATE, 1.25, True),
      'flow': (SLATE, 1.5, False)}


def arrow(sl, x1, y1, x2, y2, kind='instr', both=False):
    col, lw, dash = AR[kind]
    return line(sl, x1, y1, x2, y2, col, lw, arrow=True, dash=dash, head=both)


def arrow_path(sl, pts, kind='instr'):
    col, lw, dash = AR[kind]
    return path(sl, pts, col, lw, arrow=True, dash=dash)


def lab(sl, x, y, w, text, size=10.5, color=None, align=CEN, bold=False, h=0.27, italic=False):
    return tb(sl, x, y, w, h, text, size=size, color=color or INK, align=align, bold=bold, italic=italic,
              spacing=1.0)


def legend(sl, x, y, items, gap=0.32, size=10):
    """items: ('money'|'instr'|'data'|'flow', label) for line samples, or (colour, label) for a swatch."""
    cx = x
    for kind, label in items:
        if isinstance(kind, str):
            col, lw, dash = AR[kind]
            line(sl, cx, y + 0.13, cx + 0.42, y + 0.13, col, lw, arrow=True, dash=dash)
            cx += 0.5
        elif isinstance(kind, tuple) and len(kind) == 2:
            rect(sl, cx, y + 0.03, 0.22, 0.19, kind[0], line=kind[1], lw=1.0)
            cx += 0.3
        else:
            rect(sl, cx, y + 0.04, 0.17, 0.17, kind)
            cx += 0.25
        w_ = len(label) * size * 0.0072 + 0.12
        tb(sl, cx, y, w_, 0.26, label, size=size, color=SLATE)
        cx += w_ + gap
    return cx


def xtitle(sl, x, y, w, text, unit=None, size=12):
    runs = [(text, dict(size=size, bold=True, color=INK))]
    if unit:
        runs.append(('   ' + unit, dict(size=size - 1, color=MUTED)))
    return tb(sl, x, y, w, 0.3, [runs], spacing=1.0)


def blist(sl, x, y, w, h, items, size=11.5, color=None, bcolor=None, gap=5, spacing=1.04):
    paras = []
    for it in items:
        paras.append((it, dict(bullet=True, bcolor=bcolor or TH, gap=gap, ind=0.19)))
    return tb(sl, x, y, w, h, paras, size=size, color=color or INK, spacing=spacing)


def stat(sl, x, y, w, num, text, nsize=24, tsize=11.5, ncolor=None, lh=0.7):
    tb(sl, x, y, w, nsize / 72.0 + 0.12, num, size=nsize, bold=True, color=ncolor or TH_DK, spacing=1.0)
    tb(sl, x, y + nsize / 72.0 + 0.1, w, lh, text, size=tsize, color=SLATE, spacing=1.04)


def panel(sl, x, y, w, h, color):
    return rect(sl, x, y, w, h, color)


def text_on(fillc):
    """Ink or white text by the fill's luminance."""
    r_, g_, b_ = [int(str(fillc)[i:i + 2], 16) / 255.0 for i in (0, 2, 4)]
    lum = 0.2126 * r_ + 0.7152 * g_ + 0.0722 * b_
    return INK if lum > 0.55 else WHITE


# ========================================================================= 1 COVER
def s_cover():
    sl = prs.slides.add_slide(BLANK)
    NUM[0] += 1
    px = 7.75
    rect(sl, px, 0, W - px, H, TH)
    ph = phone(sl, 'home', 0, 0.6, h=6.3)
    ph.left = E(px + (W - px) / 2) - ph.width // 2
    lg = pic(sl, LOGO, PM, 0.82, h=0.55)
    lgw = lg.width / 914400.0
    vrule(sl, PM + lgw + 0.35, 0.66, 0.88, LINE_, 1.0)
    pic(sl, B['logo'], PM + lgw + 0.7, B['logo_y'], h=B['logo_h'])
    tb(sl, PM, 2.5, 6.9, 1.35, 'Committee Savings Partnership', size=38, bold=True, color=INK, spacing=0.98)
    tb(sl, PM, 3.98, 6.9, 0.8, 'Proposal to %s' % BFULL, size=20, color=SLATE)
    tb(sl, PM, 5.95, 6.5, 0.35, 'Taha Kayani, Founder, Halqa', size=14, bold=True, color=INK)
    tb(sl, PM, 6.34, 6.5, 0.3, DATE_STR, size=12.5, color=MUTED)
    say(sl, 'Halqa runs committee savings, the kameti or BC, in a mobile application. The proposal is that every '
            'member banks with %s, and that %s holds and moves every rupee of every committee while Halqa runs the '
            'committee system. Slides 1 to 20 are the main story; the appendix, A1 to A6, holds the detail. The main '
            'story covers: what a committee is and how many people use one; the problems with '
            'informal committees; the proposed structure and the monthly cycle; what %s gains; the products used; '
            'the application; onboarding; the committee types; payment collection, wallets and the PSP; default '
            'prevention, turn eligibility and recovery; points; the business model; the comparison with other '
            'options; evidence from abroad; timing; regulation; and the current status.' % (BN, BN, BN))


# ========================================================================= 2 SUMMARY
def s_summary():
    sl = new_slide('Summary', 'The proposal, the roles of each party and the benefits to each')
    rows = [('Background', 'About 4 in 10 Pakistanis save in committees. Almost all of it is cash, held by one '
                           'organiser, outside any bank, with no record of who paid.'),
            ('Proposal', 'Halqa runs committees in its application. Every member holds a %s account; %s collects '
                         'each instalment and pays each pot. Wallets and cards connect through a licensed PSP.'
             % (BN, BN)),
            ('Roles', 'Halqa: rules, turn order, member checks, reminders and records. %s: accounts, collection, '
                      'payouts and profit. A licensed %s operator protects members.' % (BN, INS)),
            ('Regulation', 'Through %s’s licence, with Halqa acting as its service provider under the State '
                           'Bank’s outsourcing framework.' % BN),
            ('Status', 'The application is built and runs in preview. No member money has moved.')]
    x0, lw_, w_ = PM, 1.7, 7.25
    y0, rh = 1.7, 1.0
    for i, (lb, txt) in enumerate(rows):
        yy = y0 + i * rh
        tb(sl, x0, yy + 0.08, lw_, 0.4, lb, size=13, bold=True, color=TH_DK)
        tb(sl, x0 + lw_, yy + 0.08, w_ - lw_, rh - 0.12, txt, size=13, color=INK, spacing=1.08)
        if i < len(rows) - 1:
            rule(sl, x0, yy + rh - 0.02, w_, LINE_, 0.75)
    rx0 = 8.35
    rw = RX - rx0
    mem = ['Money held by a bank, not by an organiser', 'One flat fee for every turn', 'Automatic payment on payday',
           'The pot paid the same day', '%s if a member defaults' % INS_C, 'A credit record from every payment',
           'Profit on balances returned as points']
    bank = ['6 to 20 new accounts from each circle', 'About Rs %s billion of deposits per 100,000 members'
            % B['dep100'], 'Instalments held about 7 days before payout', 'A repayment record on every member',
            'Fee income, shared with Halqa', 'Asset %s after clean circles' % ('financing')]
    for k, (title, fc, items, y, h) in enumerate([('For members', LIME_XLT, mem, 1.7, 2.62),
                                                   ('For %s' % BN, TH_XLT, bank, 4.47, 2.3)]):
        panel(sl, rx0, y, rw, h, fc)
        tb(sl, rx0 + 0.22, y + 0.14, rw - 0.4, 0.32, title, size=13.5, bold=True, color=INK)
        blist(sl, rx0 + 0.22, y + 0.52, rw - 0.4, h - 0.6, items, size=11.5, bcolor=LIME_DK if k == 0 else TH,
              gap=3.5)
    sources(sl, ['Karandaaz and Oraan estimates, Dawn, 12 December 2022', '%s half year report to 30 June 2026, '
                 'at the bank’s own average deposit' % BFULL])
    say(sl, 'Meeting plan: about twenty minutes for slides 1 to 20, then questions; the appendix, A1 to A6, holds '
            'the detail on Hyper, payment collection, wallets and the PSP, recovery, points and regulation.\n\nThe '
            'whole proposal on one page.\n\nBackground: about four in ten Pakistanis save in committees. Almost all '
            'of it is cash held by one organiser, outside any bank, and nothing is recorded.\n\nProposal: Halqa runs '
            'the committee in its application. Every member opens a %s account; %s collects the instalment from it '
            'and pays the pot into it. Halqa never holds the money.\n\nRoles: Halqa is the system: the rules, the '
            'order of turns, the checks on each member, reminders and records. %s is the machine: accounts, '
            'collection, payouts and profit on balances. A licensed %s operator pays the other members if someone '
            'stops paying after collecting.\n\nRegulation comes through %s’s licence, with Halqa as its service '
            'provider under the State Bank’s outsourcing framework.\n\nFor %s: each circle brings six to twenty '
            'accounts at once; at %s’s own average deposit, 100,000 members mean about Rs %s billion of deposits; '
            'and every instalment is a repayment record.' % (BN, BN, BN, INS, BN, BN, BN, B['dep100']))


# ======================================================================= 3 COMMITTEE
def s_committee():
    sl = new_slide('How a Committee Works', 'Also called kameti, BC or bisi. Example: 12 members each pay '
                                            'Rs 10,000 a month for 12 months')
    xtitle(sl, PM, 1.62, 5.0, 'Who pays and who collects', 'by month')
    mx0, my0, pit, cel = 1.2, 2.3, 0.3, 0.25
    tb(sl, mx0, 1.95, 12 * pit, 0.24, 'Month', size=10, bold=True, color=SLATE, align=CEN)
    for j in range(12):
        tb(sl, mx0 + j * pit - 0.06, 2.1, cel + 0.12, 0.2, str(j + 1), size=9, color=MUTED, align=CEN)
    for i in range(12):
        tb(sl, mx0 - 0.4, my0 + i * pit, 0.32, cel, str(i + 1), size=9, color=MUTED, align=R, anchor=MIDDLE)
        for j in range(12):
            sq(sl, mx0 + j * pit, my0 + i * pit, cel, TH if i == j else TH_LT)
    ml = tb(sl, 0, 0, 1.8, 0.26, 'Member', size=10, bold=True, color=SLATE, align=CEN)
    ml.rotation = 270.0
    ml.left, ml.top = E(0.62 - 0.9 + 0.13), E(my0 + 6 * pit - 0.13)
    ly = my0 + 12 * pit + 0.12
    sq(sl, mx0, ly + 0.04, 0.16, TH)
    tb(sl, mx0 + 0.24, ly, 2.0, 0.24, 'collects Rs 120,000', size=10, color=SLATE)
    sq(sl, mx0 + 2.05, ly + 0.04, 0.16, TH_LT)
    tb(sl, mx0 + 2.29, ly, 1.6, 0.24, 'pays Rs 10,000', size=10, color=SLATE)
    cx0 = 5.55
    xtitle(sl, cx0, 1.62, RX - cx0, 'Net position of two members after each month', 'Rs thousand')
    t1 = [120 - 10 * m for m in range(1, 13)]
    t12 = [-10 * m for m in range(1, 12)] + [0]
    ch = chart(sl, XL_CHART_TYPE.LINE_MARKERS, cx0 - 0.1, 1.95, RX - cx0 + 0.15, 3.2,
               [str(m) for m in range(1, 13)], [('Turn 1', t1), ('Turn 12', t12)], colors=[TH, BLUE],
               labels=False, legend=True, size=10.5, val_axis=True, grid=True, vmin=-120, vmax=120,
               val_fmt='#,##0', line_w=2.25)
    ch.value_axis.major_unit = 60
    for s_, col in zip(ch.plots[0].series, [TH, BLUE]):
        s_.marker.style = 8
        s_.marker.size = 6
        s_.marker.format.fill.solid()
        s_.marker.format.fill.fore_color.rgb = col
        s_.marker.format.line.color.rgb = WHITE
    tb(sl, cx0, 5.16, RX - cx0, 0.5, 'Turn 1 takes Rs 120,000 at once and repays it over the year. Turn 12 saves '
                                       'every month and takes the pot last. Both end the year at zero.', size=10.5,
       color=SLATE, spacing=1.03)
    fw = (RX - cx0) / 3.0
    facts = [('Rs 120,000', 'the pot, paid to one member each month'),
             ('No interest', 'each member pays in Rs 120,000 and receives Rs 120,000'),
             ('Fixed order/Ballot', 'the host sets the order of turns at the start')]
    for i, (n_, t) in enumerate(facts):
        stat(sl, cx0 + i * fw, 5.78, fw - 0.2, n_, t, nsize=18, tsize=10.5)
    say(sl, 'For anyone who has never been in one. The grid is a circle of twelve people at Rs 10,000 a month: every '
            'row is a member, every column a month, and the dark square is the month that member takes the whole '
            'Rs 120,000.\n\nThe chart shows what that means for two members. The member in turn one receives Rs '
            '120,000 at once and repays it over the year, in effect an interest free advance; the member in turn '
            'twelve saves Rs 10,000 every month to a deadline the group enforces, and receives the pot last. Both end '
            'the year at zero: no interest is paid or earned. The order is fixed at the start by the host, the '
            'organiser, who admits each member.')


# ========================================================================== 4 MARKET
def s_market():
    sl = new_slide('Market', 'Committee use in Pakistan, from published estimates')
    xtitle(sl, PM, 1.62, 4.2, 'Pakistanis who save in committees', 'per 100 people')
    waffle(sl, PM, 2.05, [(34, TH), (7, TH_MID)], pitch=0.355, cell=0.3)
    ly = 2.05 + 10 * 0.355 + 0.08
    sq(sl, PM, ly + 0.04, 0.17, TH)
    tb(sl, PM + 0.26, ly, 3.4, 0.26, '34 in 100, Karandaaz estimate [1]', size=10.5, color=SLATE)
    sq(sl, PM, ly + 0.34, 0.17, TH_MID)
    tb(sl, PM + 0.26, ly + 0.3, 3.6, 0.26, '41 in 100 including these, Oraan estimate [1]', size=10.5, color=SLATE)
    gx0 = 4.95
    cw = (RX - gx0) / 2.0
    figs = [('About 100 million', 'people use committees, on the higher estimate [2]'),
            ('Rs 4 trillion', 'a year passes through committees, estimated [1]'),
            ('91%', 'of committees collect monthly [4]'),
            ('56%', 'of adults have a committee within 1 km of home [5]'),
            ('Rs 5000', 'average monthly contribution, [4]')]
    for i, (n_, t) in enumerate(figs):
        col_, row_ = i % 2, i // 2
        x = gx0 + col_ * cw
        y = 1.72 + row_ * 1.62
        stat(sl, x + 0.1, y, cw - 0.3, n_, t, nsize=26, tsize=12)
        if row_ < 2:
            rule(sl, x + 0.1, y + 1.45, cw - 0.3, LINE_, 0.75)
    sources(sl, ['Karandaaz and Oraan estimates, Dawn, 12 Dec 2022', 'PICG case study on Oraan, 2024',
                 'Financial Inclusion Insights (FII) data in Mehmood et al. 2018', 'FII Pakistan, 2013',
                 'FII wave 5, 2017'])
    say(sl, 'The size of the habit. The grid is one hundred Pakistanis. Karandaaz, a financial inclusion body, puts '
            'committee use at 34 per cent, the dark squares; Oraan’s research puts it at 41 per cent, adding the light '
            'squares. On the higher estimate that is about 100 million people, and Oraan estimates about Rs 4 '
            'trillion a year passes through committees. These are estimates; there is no official count, which is '
            'itself part of the problem.\n\nThe survey data say more about who uses them: women take part at about '
            'twice the rate of men; nine in ten committees collect monthly; more than half of adults have a committee '
            'within a kilometre of home; and the average monthly contribution in 2013 was about US$18, from a few '
            'cents to US$470.')


# ======================================================================== 5 PROBLEMS
def s_problems():
    sl = new_slide('Problems with Informal Committees', 'Losses to fraud, cash kept outside banks and no credit '
                                                        'record')
    pw4 = (PW - 3 * 0.45) / 4
    panels = [([(12, RED)], '12%', 'of committee users have lost money to fraud [1]'),
              ([(63, SLATE)], '63%', 'of savers keep their savings as cash at home [1]'),
              ([(4, BLUE)], '4%', 'of savers use a formal financial institution [1]'),
              ([], '0', 'on-time committee payments reach a credit bureau')]
    for i, (parts, big_, lbl) in enumerate(panels):
        x = PM + i * (pw4 + 0.45)
        waffle(sl, x, 1.72, parts, pitch=0.215, cell=0.172)
        tb(sl, x, 3.95, pw4, 0.5, big_, size=26, bold=True, color=INK)
        tb(sl, x, 4.45, pw4 - 0.1, 0.7, lbl, size=11.5, color=SLATE, spacing=1.04)
    yb = 5.35
    panel(sl, PM, yb, 5.75, 1.42, FAINT)
    tb(sl, PM + 0.22, yb + 0.14, 5.3, 0.3, 'Case, 2022', size=12.5, bold=True, color=INK)
    tb(sl, PM + 0.22, yb + 0.47, 5.35, 0.9, 'One organiser ran more than 100 committees through Facebook and '
                                            'defaulted on about Rs 420 million. No written records were kept. [2]',
       size=11.5, color=INK, spacing=1.06)
    fx0 = PM + 6.15
    tb(sl, fx0, yb + 0.02, RX - fx0, 0.3, 'How informal committees fail', size=12.5, bold=True, color=INK)
    fails = ['The organiser leaves with the pot', 'A member stops paying after collecting',
             'Disputes over the order of turns', 'No record of who paid what']
    fw = (RX - fx0) / 2.0
    for i, t in enumerate(fails):
        x = fx0 + (i % 2) * fw
        y = yb + 0.45 + (i // 2) * 0.48
        sq(sl, x, y + 0.08, 0.13, RED)
        tb(sl, x + 0.24, y, fw - 0.3, 0.42, t, size=11.5, color=INK)
    sources(sl, ['Financial Inclusion Insights survey data, in Mehmood et al. 2018', 'Dawn, 5 and 12 Dec 2022; '
                 'Arab News, 10 Dec 2022'])
    say(sl, 'What goes wrong. Each grid is one hundred people. Twelve per cent of committee users say they have lost '
            'money to an organiser or a member. Sixty three per cent of savers keep their savings as cash at home, '
            'and only four per cent use a formal financial institution. And no on-time committee payment reaches a '
            'credit bureau, so years of paying on time build no record.\n\nThe 2022 case: one organiser ran more '
            'than 100 committees through Facebook and defaulted on about Rs 420 million, with no written records.\n\n'
            'The four ways informal committees fail are the four things the proposed structure removes: an organiser '
            'holding the pot, a member stopping after collecting, disputes over order, and the absence of any record.')


# ======================================================================= 6 STRUCTURE
def s_structure():
    sl = new_slide('Proposed Structure', 'Halqa runs the committee system; %s holds and moves the money under '
                                         'State Bank regulation' % BN)
    hx, bx, bw = 3.2, 3.2, 2.75
    ebox(sl, hx, 1.75, bw, 0.85, 'Halqa', 'committee system: rules, turns, checks, records', 'halqa')
    ebox(sl, bx, 3.6, bw, 0.95, BFULL, 'accounts, collection, payouts, profit', 'bank')
    ebox(sl, PM, 3.6, 1.75, 0.95, 'Members', 'each with a %s account' % BN, 'member')
    ebox(sl, 6.7, 3.6, 1.75, 0.95, 'Licensed PSP', 'wallet and card payments', 'pay')
    ebox(sl, 6.7, 5.05, 1.75, 0.95, '%s operator' % INS_C, 'pays claims', 'ins', tsize=11.5)
    ebox(sl, bx, 5.5, bw, 0.7, 'TASDEEQ', 'licensed credit bureau', 'inst')
    # money
    arrow(sl, 2.35, 3.83, bx, 3.83, 'money')
    lab(sl, 2.35, 3.53, 0.85, 'instalments', size=9.5, color=SLATE)
    arrow(sl, bx, 4.3, 2.35, 4.3, 'money')
    lab(sl, 2.35, 4.34, 0.85, 'pots', size=9.5, color=SLATE)
    arrow(sl, 6.7, 4.07, bx + bw, 4.07, 'money')
    lab(sl, 5.95, 3.76, 0.8, 'payments', size=9.5, color=SLATE)
    arrow_path(sl, [(bx + bw, 4.4), (6.35, 4.4), (6.35, 5.52), (6.7, 5.52)], 'money')
    lab(sl, 5.3, 4.62, 1.0, 'contributions', size=9.5, color=SLATE, align=R)
    arrow_path(sl, [(7.57, 6.0), (7.57, 6.4), (1.475, 6.4), (1.475, 4.55)], 'money')
    tb(sl, 1.6, 5.82, 1.5, 0.5, 'claims paid to members left short', size=9.5, color=SLATE, spacing=1.0)
    # instructions and records
    arrow(sl, 4.25, 2.6, 4.25, 3.6, 'instr')
    lab(sl, 2.4, 2.92, 1.8, 'instructions', size=9.5, color=SLATE, align=R)
    arrow(sl, 4.95, 3.6, 4.95, 2.6, 'data')
    lab(sl, 5.02, 2.92, 1.5, 'confirmations', size=9.5, color=SLATE, align=L)
    arrow_path(sl, [(hx + bw, 2.17), (7.57, 2.17), (7.57, 3.6)], 'instr')
    lab(sl, 6.05, 1.88, 1.55, 'payment requests', size=9.5, color=SLATE, align=L)
    arrow_path(sl, [(1.475, 3.6), (1.475, 2.17), (hx, 2.17)], 'instr')
    lab(sl, 0.6, 1.86, 2.55, 'join, consent, pay in the app', size=9.5, color=SLATE, align=R)
    arrow(sl, 4.57, 4.55, 4.57, 5.5, 'data')
    lab(sl, 4.64, 4.85, 1.6, 'payment records', size=9.5, color=SLATE, align=L)
    # roles
    rx0 = 9.0
    rw = RX - rx0
    blocks = [('Halqa', LIME, ['Circle rules and turn order', 'Member checks and credit score',
                               'Reminders, records and receipts', 'Late charges and exits',
                               'Data for credit reporting']),
              (BN, TH, ['Customer due diligence and accounts', '%s and collection' % B['mandate_c'],
                        'Holding balances, paying profit', 'Payouts to collectors', 'Collecting the fee']),
              ('Halqa never', RED, ['Holds or receives member money', 'Lends money', 'Insures members'])]
    y = 1.72
    for t, col, items in blocks:
        sq(sl, rx0, y + 0.07, 0.17, col)
        tb(sl, rx0 + 0.27, y, rw - 0.3, 0.3, t, size=12.5, bold=True, color=INK)
        n = len(items)
        blist(sl, rx0 + 0.02, y + 0.34, rw, n * 0.25 + 0.1, items, size=11, bcolor=col, gap=1.5, spacing=1.0)
        y += 0.42 + n * 0.255 + 0.18
    legend(sl, PM, 6.6, [('money', 'money'), ('instr', 'instruction'), ('data', 'confirmation or record')])
    say(sl, 'Who does what. The blue lines are money, and they touch only members, %s, the PSP and the %s operator; '
            'no money line touches Halqa. Members pay instalments into %s and receive pots from it. Payments from '
            'wallets and cards arrive through a licensed payment service provider and settle at %s. %s pays the %s '
            'contribution to the operator, and the operator pays claims directly to members left short.\n\nThe '
            'green lines are instructions. Members join and consent in the Halqa application; Halqa instructs %s '
            'and the PSP to collect and to pay; the dashed lines are confirmations and records back to Halqa, and '
            'payment records to TASDEEQ, the licensed credit bureau.\n\nThis matters twice: a company that holds '
            'public money is taking deposits, which only a bank may do, and a system like this needs State Bank '
            'regulation. Working inside %s’s licence answers both. Halqa never holds or receives member money, never '
            'lends and never insures.' % (BN, INS, BN, BN, BN, INS, BN, BN))


# ======================================================================= 7 MONTHLY CYCLE
def s_cycle():
    sl = new_slide('Monthly Cycle', 'One month of a circle of 12 members at Rs 10,000, step by step')
    xs = {'m': 2.05, 'h': 5.05, 'b': 8.2, 't': 11.35}
    heads = [('m', 'Member', 'own %s account' % BN, 'member'), ('h', 'Halqa', 'application and records', 'halqa'),
             ('b', BN, 'accounts and payments', 'bank'), ('t', 'TASDEEQ', 'credit bureau', 'inst')]
    for k, t, sub, kind in heads:
        ebox(sl, xs[k] - 1.1, 1.66, 2.2, 0.62, t, sub, kind, tsize=12, bsize=9.5)
        line(sl, xs[k], 2.28, xs[k], 6.42, LINE_, 1.0, dash=True)
    steps = [('m', 'h', 'instr', 'joins; consents to the %s' % ('mandate' if MQ_ else 'instruction')),
             ('h', 'b', 'instr', 'registers the %s' % ('mandate' if MQ_ else 'instruction')),
             ('h', 'm', 'instr', 'reminder, the evening before payday'),
             ('h', 'b', 'instr', 'payday: collect the instalments'),
             ('m', 'b', 'money', 'Rs 10,000 into the committee account'),
             ('h', 'b', 'instr', 'the 8th: pay this month’s collector'),
             ('b', 'm', 'money', 'Rs 120,000 to the collector, the same day'),
             ('b', 'h', 'data', 'confirmation; the record updates'),
             ('b', 't', 'data', 'payment records reported')]
    y0, pit = 2.72, 0.43
    for i, (a, b_, kind, text) in enumerate(steps):
        y = y0 + i * pit
        tb(sl, PM, y - 0.2, 0.4, 0.3, str(i + 1), size=12, bold=True, color=TH_DK)
        x1, x2 = xs[a], xs[b_]
        arrow(sl, x1, y, x2, y, kind)
        lo, hi = min(x1, x2), max(x1, x2)
        lab(sl, lo + 0.1, y - 0.29, hi - lo - 0.2, text, size=10, color=INK)
    yr = y0 + 4 * pit
    rect(sl, 8.4, yr - 0.34, 2.55, 0.5, AMBER_LT, paras=[('if a debit fails: a retry each morning, 5 attempts at '
                                                          'most', dict(size=9, color=INK, align=CEN))], pad=0.05,
         anchor=MIDDLE)
    legend(sl, PM, 6.55, [('money', 'money'), ('instr', 'instruction'), ('data', 'confirmation or record')])
    say(sl, 'One month, read top to bottom; each vertical line is one party.\n\nOne, the member joins in the Halqa '
            'application and consents to the %s. Two, Halqa registers it with %s. Three, the evening before payday, '
            'a reminder on WhatsApp, in Roman Urdu first. Four, on the member’s payday, which Halqa learns from the '
            'account, Halqa asks %s to collect. Five, %s moves Rs 10,000 from each member’s account into the '
            'committee account at %s; if the salary is late, the debit is retried each morning, five attempts at '
            'most. Six, on the 8th, the due date, Halqa tells %s who collects this month. Seven, %s pays Rs 120,000 '
            'into the collector’s account the same day. Eight, %s confirms and the record updates. Nine, payment '
            'records go to TASDEEQ, reported by %s as a member of the bureau or by Halqa as a data provider, as %s '
            'decides.\n\nThe money lines run only between members and %s. Between payday and the 8th, about a week, '
            'the instalments sit in %s at %s and earn profit, which returns to members as points at the end of the '
            'circle.' % (B['mandate'], BN, BN, BN, BN, BN, BN, BN, BN, BN, BN, B['hold_short'], BN))


# ================================================================= 8 GROWTH AND DEPOSITS
def s_growth():
    sl = new_slide('Customer Growth and Deposits', 'Accounts arrive by the circle; deposits at %s’s own average '
                                                  'balance' % BN)
    xtitle(sl, PM, 1.62, 5.8, 'How circles bring accounts')
    bw, bh = 2.45, 0.8
    A = (PM, 2.05)
    Bp = (PM + 3.35, 2.05)
    Cp = (PM + 3.35, 3.72)
    D = (PM, 3.72)
    ebox(sl, A[0], A[1], bw, bh, 'A host starts a circle', 'invites people they know', 'member', tsize=11.5,
         bsize=10)
    ebox(sl, Bp[0], Bp[1], bw, bh, '6 to 20 accounts', 'every member opens a %s account' % BN, 'bank', tsize=11.5,
         bsize=10)
    ebox(sl, Cp[0], Cp[1], bw, bh, 'The circle completes', 'every member collects once', 'halqa', tsize=11.5,
         bsize=10)
    ebox(sl, D[0], D[1], bw, bh, 'Members host circles', 'the cycle repeats', 'member', tsize=11.5, bsize=10)
    arrow(sl, A[0] + bw, A[1] + bh / 2, Bp[0], Bp[1] + bh / 2, 'flow')
    arrow(sl, Bp[0] + bw / 2, Bp[1] + bh, Cp[0] + bw / 2, Cp[1], 'flow')
    arrow(sl, Cp[0], Cp[1] + bh / 2, D[0] + bw, D[1] + bh / 2, 'flow')
    arrow(sl, D[0] + bw / 2, D[1], A[0] + bw / 2, A[1] + bh, 'flow')
    chans = [('Hosts', 'points for circles that complete cleanly, never for recruiting'),
             ('Employers', 'circles offered to staff'),
             ('Families abroad', 'relatives in the UAE through the Mashreq Pakistan Account') if MQ_ else
             ('Seasons', 'Ramadan, Qurbani, weddings and school fees'),
             ('%s' % BN, 'circles offered inside %s’s banking services' % BN)]
    xtitle(sl, PM, 4.8, 5.8, 'Channels')
    for i, (t, d) in enumerate(chans):
        y = 5.13 + i * 0.4
        tb(sl, PM, y, 1.55, 0.38, t, size=11, bold=True, color=INK)
        tb(sl, PM + 1.6, y, 4.3, 0.38, d, size=11, color=SLATE)
    x0 = 6.85
    xtitle(sl, x0, 1.62, RX - x0, 'Deposits', 'Rs billion')
    chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, x0 - 0.05, 1.92, RX - x0 + 0.05, 2.5,
          ['%s, 30 June 2026' % BN, 'Added by 100,000 members', 'Added by 1,000,000 members'],
          [('Rs bn', [B['today'], B['add100'], B['add1m']])], point_colors=[TH, LIME, LIME], fmt='0.0', gap=60,
          size=10.5, label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=B['add1m'] * 1.18)
    tb(sl, x0, 4.45, RX - x0, 0.5, B['avg_line'], size=10, color=MUTED, spacing=1.04)
    fw = (RX - x0) / 2.0
    stat(sl, x0, 5.1, fw - 0.2, B['grow'][0], B['grow'][1], nsize=24, tsize=11)
    stat(sl, x0 + fw, 5.1, fw - 0.2, '5-7 days', 'each instalment is held at %s between payday and the 8th' % BN,
         nsize=24, tsize=11)
    srcs = ['%s, half year report to 30 June 2026' % BFULL]
    if not MQ_:
        srcs.append('Bloomberg, 22 January 2026')
    sources(sl, srcs)
    extra = ('Families in the UAE can join through the Mashreq Pakistan Account, opened from Mashreq’s UAE '
             'application.' if MQ_ else 'Raqami’s own target is one million customers in its first three years; '
                                        'committees bring them in groups.')
    say(sl, 'Growth and deposits. Committees spread through the person who organises them. One host invites six to '
            'twenty people they know; every member opens a %s account to take part; when the circle completes, '
            'satisfied members start their own. Acquisition cost is shared across the group and the cycle repeats. '
            'Hosts are rewarded with points for circles that complete cleanly, never for recruiting, which would be '
            'a pyramid. %s\n\nDeposits use %s’s own average rather than an assumption: %s. On that basis 100,000 '
            'members add about Rs %s billion and a million members about Rs %s billion. Committee members also bring '
            'the monthly instalment, which sits at %s for about a week between payday and the 8th. %s’s own data on '
            'committee members should replace the average once members are live.'
        % (BN, extra, BN, B['avg_line'].replace('Basis: ', '').replace(' [1]', ''), B['add100'], B['add1m'], BN,
           BN))


# ============================================================= 9 CREDIT AND LENDING
def s_credit():
    sl = new_slide('Credit Reporting and %s' % B['lend_c'], 'Every instalment becomes a repayment record from the '
                                                            'first day')
    y0, bh = 1.72, 1.2
    b1w = 3.25
    rect(sl, PM, y0, b1w, bh, FAINT, line=SLATE, lw=1.0)
    tb(sl, PM + 0.15, y0 + 0.1, b1w - 0.3, 0.3, 'Twelve instalments paid', size=12, bold=True, color=INK,
       align=CEN)
    cw_ = (b1w - 0.4) / 12.0
    for k in range(12):
        xx = PM + 0.2 + k * cw_
        rect(sl, xx, y0 + 0.5, cw_ - 0.04, 0.36, LIME_XLT, line=LIME_DK, lw=0.75)
        tick(sl, xx + (cw_ - 0.04) / 2 - 0.08, y0 + 0.58, 0.16, LIME_DK, 1.4)
    tb(sl, PM + 0.15, y0 + 0.9, b1w - 0.3, 0.26, 'one member, one circle', size=9.5, color=MUTED, align=CEN)
    boxes = [('Credit record', 'reported to TASDEEQ from day one', 'inst'),
             ('Credit score', 'Halqa score, 300 to 850, updated with every payment', 'halqa'),
             ('%s offer' % B['lend_c'], 'after a circle completes cleanly', 'bank')]
    bx = PM + b1w + 0.5
    bw = (RX - bx - 2 * 0.5) / 3.0
    arrow(sl, PM + b1w + 0.05, y0 + bh / 2, bx - 0.05, y0 + bh / 2, 'flow')
    for i, (t, d, kind) in enumerate(boxes):
        x = bx + i * (bw + 0.5)
        ebox(sl, x, y0, bw, bh, t, d, kind, tsize=12.5, bsize=10.5)
        if i < 2:
            arrow(sl, x + bw + 0.05, y0 + bh / 2, x + bw + 0.45, y0 + bh / 2, 'flow')
    cy = 3.3
    cw3 = (PW - 2 * 0.45) / 3.0
    cols = [('What each record holds', ['Amount and due date', 'Date paid, on time or late', 'Circle type and '
                                                                                             'turn',
                                        'Whether the circle completed']),
            ('Reporting route', ['Through %s’s TASDEEQ membership' % BN, 'Or Halqa as a data provider',
                                 '%s decides the route' % BN, 'From the first payment'])]
    for i, (t, items) in enumerate(cols):
        x = PM + i * (cw3 + 0.45)
        tb(sl, x, cy, cw3, 0.3, t, size=12.5, bold=True, color=INK)
        blist(sl, x, cy + 0.36, cw3, 1.4, items, size=11.5, gap=2.5)
    x3 = PM + 2 * (cw3 + 0.45)
    tb(sl, x3, cy, cw3, 0.3, 'Evidence from lending circles', size=12.5, bold=True, color=INK)
    stat(sl, x3, cy + 0.38, cw3, '+168 points', 'average credit score gain when lending circle payments were '
                                                'reported to US credit bureaus [1]', nsize=24, tsize=11, lh=0.9)
    yb = 5.3
    panel(sl, PM, yb, PW, 1.45, TH_XLT)
    if MQ_:
        stat(sl, PM + 0.25, yb + 0.15, 3.3, 'No advances', 'on Mashreq’s balance sheet at 30 June 2026 [2]',
             nsize=24, tsize=11, lh=0.5)
        tb(sl, PM + 4.0, yb + 0.2, PW - 4.3, 1.1, 'Committee members arrive with twelve months of repayment '
                                                  'history. That history is the data Mashreq needs to start '
                                                  'lending safely, beginning with asset financing for motorcycles '
                                                  'and machines bought through asset circles.', size=12.5,
           color=INK, spacing=1.08)
    else:
        stat(sl, PM + 0.25, yb + 0.15, 3.3, 'Rs 27.6 million', 'of Islamic financing at 30 June 2026 [2]', nsize=24,
             tsize=11, lh=0.5)
        tb(sl, PM + 4.0, yb + 0.2, PW - 4.3, 1.1, 'Raqami plans auto, fleet and supply chain financing. Committee '
                                                  'members arrive with twelve months of repayment history, the data '
                                                  'needed to finance them safely, beginning with ijarah for '
                                                  'motorcycles and machines bought through asset circles.',
           size=12.5, color=INK, spacing=1.08)
    sources(sl, ['Mission Asset Fund lending circles, evaluation by San Francisco State University, 600+ '
                 'participants', '%s, half year report to 30 June 2026' % BFULL])
    say(sl, 'What %s gains for its %s book. Every instalment, on time or late, becomes a record: amount, due date, date '
            'paid, circle type and turn, and whether the circle completed. From launch day it is reported to '
            'TASDEEQ, the licensed credit bureau, through %s’s own membership or by Halqa as a data provider; %s '
            'decides which. Halqa’s own score, 300 to 850, updates with every payment and decides which turns a member '
            'may take.\n\nThe evidence that reporting matters comes from the United States: Mission Asset Fund runs '
            'lending circles and reports every payment to the credit bureaus; an independent evaluation by San '
            'Francisco State University of more than 600 participants found scores rose by 168 points on average.\n\n'
            '%s' % (BN, B['lend'], BN, BN,
                    'Mashreq reported no advances at 30 June 2026. Committee members bring twelve months of repayment '
                    'behaviour, which is exactly the data needed to start lending, beginning with financing for '
                    'motorcycles and machines bought through asset circles.' if MQ_ else
                    'Raqami’s Islamic financing stood at Rs 27.6 million at 30 June 2026, with auto, fleet and supply '
                    'chain financing planned. Committee members bring twelve months of repayment behaviour, beginning '
                    'with ijarah for motorcycles and machines.'))


# ======================================================================= 10 PRODUCTS
def s_products():
    sl = new_slide('%s Products Used' % BN, 'Existing products at each step of a committee, and %s new lines'
                   % ('two' if MQ_ else 'three'))
    if MQ_:
        steps = [('Open', 'NEO account and debit card', 'opened in about five minutes'),
                 ('Salary in', 'Islamic Current Profit Account', 'profit on the daily balance, up to 5%'),
                 ('Due the 8th', 'Direct debit mandate', 'collects the instalment'),
                 ('Payout', 'Free instant transfer', 'the pot, the same day'),
                 ('Save on', 'Islamic Savings Account', 'up to 11.5% after the circle'),
                 ('Abroad', 'Mashreq Pakistan Account', 'families in the UAE')]
        new = [(3, 'Takaful or insurance', 'circles between strangers; Mashreq chooses the operator'),
               (4, 'Asset financing', 'ijarah for motorcycles and machines')]
        branch = 2
        src = ['Mashreq NEO Pakistan product pages and rate sheets, read 29 September 2026; rates are up to figures']
    else:
        steps = [('Open', 'Asaan Digital Account', 'CNIC and mobile number'),
                 ('Salary in', 'Mudarabah Savings Account', 'profit from actual returns'),
                 ('Held', '7 day Mudarabah Certificate', 'from payday to the 8th'),
                 ('Payout', 'Free Raqami transfer', 'the pot, the same day'),
                 ('Save on', 'Saving Pots', 'goal based saving'),
                 ('Cash in', 'Askari Bank branches', 'free cash deposits at 700+')]
        new = [(2, 'Standing instruction', 'debit on the due date through Raqami’s open API'),
               (3, 'Committee takaful', 'with EFU window takaful, Raqami’s partner'),
               (4, 'Asset financing', 'ijarah for motorcycles and machines')]
        branch = 1
        src = ['Raqami products page, FAQ and home page, read 29 September 2026']
    cw6 = PW / 6.0
    yl = 2.62
    line(sl, PM + cw6 / 2, yl, RX - cw6 / 2, yl, TH, 4.0)
    xs = []
    for i, (st_, prod, det) in enumerate(steps):
        xc = PM + cw6 * (i + 0.5)
        xs.append(xc)
        tb(sl, xc - cw6 / 2, 1.78, cw6, 0.35, st_, size=13, bold=True, color=INK, align=CEN)
        oval(sl, xc - 0.13, yl - 0.13, 0.26, WHITE, line=TH, lw=2.5)
        ebox(sl, xc - 0.92, 2.95, 1.84, 0.82, prod, None, 'bank', tsize=11.5)
        tb(sl, xc - cw6 / 2 + 0.05, 3.85, cw6 - 0.1, 0.55, det, size=10.5, color=SLATE, align=CEN, spacing=1.03)
    yb = 4.72
    tb(sl, PM, yb - 0.17, 1.5, 0.34, 'New lines', size=13, bold=True, color=INK)
    path(sl, [(PM + 1.55, yb), (RX - 0.1, yb)], TEAL, 2.5, dash=True)
    for idx, t, d in new:
        xc = xs[idx]
        oval(sl, xc - 0.11, yb - 0.11, 0.22, WHITE, line=TEAL, lw=2.0)
        ebox(sl, xc - 0.95, yb + 0.3, 1.9, 1.35, t, d, 'ins', tsize=11.5, bsize=10)
    legend(sl, PM, 6.5, [((TH_XLT, TH), 'existing %s product' % BN), ((TEAL_XLT, TEAL), 'new line')])
    sources(sl, src)
    if MQ_:
        say(sl, 'For the product team: almost every step of a committee uses a product Mashreq already has, drawn as '
                'one line through the life of a committee.\n\nThe account opens inside the Halqa application through '
                'Mashreq’s own onboarding, with a PayPak or Mastercard debit card, in about five minutes. Between '
                'payday and the due date, about a week, the instalments sit in the Islamic Current Profit Account, a '
                'mudaraba account paying profit on the daily closing balance, monthly, up to 5 per cent; that profit '
                'returns to members at the end of the circle as points, one point for each rupee. The direct debit '
                'mandate collects on the 8th and the payout is a free instant transfer. After the circle, savings can '
                'stay in the Islamic Savings Account, up to 11.5 per cent. Families in the UAE join through the '
                'Mashreq Pakistan Account, opened from the UAE application.\n\nThe dashed branch is new: takaful or '
                'insurance for circles between strangers, through an operator Mashreq chooses; and ijarah financing '
                'for motorcycles and machines bought through asset circles, the first step to a lending book.')
    else:
        say(sl, 'For the product team: almost every step uses a product Raqami already has.\n\nThe Asaan Digital '
                'Account opens inside the Halqa application on a CNIC and a registered mobile number; the Full '
                'account follows for larger circles. Salary lands in the Mudarabah Savings Account. For the week '
                'between payday and the due date the instalments sit in a 7 day Mudarabah Certificate, so even that '
                'week earns a share of real profit, returned to members at the end of the circle as points. The '
                'payout is a free Raqami transfer the same day. After the circle, savings can stay in Saving Pots. '
                'Members who earn in cash deposit it free at more than 700 Askari Bank branches.\n\nThe dashed branch '
                'is new: a standing instruction for automatic debit on the due date, built on Raqami’s open API, '
                'since the public product pages list no recurring debit today; committee takaful with EFU window '
                'takaful, Raqami’s existing partner; and ijarah financing for motorcycles and machines.')


# ======================================================================= 11 APPLICATION
def s_app():
    sl = new_slide('Member Application', 'Screens from the working preview, with sample data')
    steps = [('circles', 'Join a circle', 'By invitation code, QR or link. Only the turns open to the member’s '
                                          'score are shown.'),
             ('autopay', 'Automatic payment', 'The member consents once. Collection on payday; every debit is '
                                              'shown.'),
             ('activity', 'Activity and payout', 'Every payment and payout with a receipt. The pot arrives the '
                                                 'same day.'),
             ('credit', 'Credit report', 'Score from 300 to 850, on-time history and the turns open to the member.')]
    cw = PW / 4.0
    for i, (nm, t, d) in enumerate(steps):
        x = PM + i * cw
        ph = phone(sl, nm, x, 1.6, h=3.95)
        pw_ = ph.width / 914400.0
        ph.left = E(x + (cw - pw_) / 2)
        tx = x + (cw - pw_) / 2 - 0.05
        tb(sl, tx, 5.7, cw - 0.25, 0.32, [[('%d   ' % (i + 1), dict(size=13, bold=True, color=TH_DK)),
                                           (t, dict(size=13, bold=True, color=INK))]])
        tb(sl, tx, 6.05, 2.55, 0.8, d, size=10.5, color=SLATE, spacing=1.04)
    say(sl, 'The application as it runs today, in preview with sample data. One: a member joins through an invitation '
            'code, QR or link, and sees only the turns open to their score. Two: the member consents once to '
            'automatic payment; the instalment is collected on payday and retried each morning if the salary is late, '
            'five attempts at most, before the 8th. Three: every payment and payout has a receipt, and on their turn '
            'the whole pot arrives the same day. Four: the credit report shows the score from 300 to 850, the on-time '
            'history and the turns it opens. Messages come on WhatsApp, in Roman Urdu first; the application opens '
            'with a PIN.')


# ======================================================================= 12 ONBOARDING
def s_onboarding():
    sl = new_slide('Onboarding and Verification', '%s opens the account; Halqa’s checks decide which circles and '
                                                   'turns each member may join' % BN)
    lanes = [('Member', FAINT, 1.68, 2.55), (BN, TH_XLT, 2.55, 3.45), ('Halqa checks', LIME_XLT, 3.45, 4.45)]
    for name, fc, ya, yb_ in lanes:
        rect(sl, PM, ya, 1.55, yb_ - ya, fc)
        tb(sl, PM + 0.12, ya, 1.35, yb_ - ya, name, size=12.5, bold=True, color=INK, anchor=MIDDLE)
        rule(sl, PM, ya, PW, LINE_, 0.75)
    rule(sl, PM, 4.45, PW, LINE_, 0.75)
    bw9, bh9 = 1.5, 0.55
    bx9 = [2.45, 4.1, 5.9, 7.55, 9.2, 10.85]
    by9 = [1.84, 2.72, 3.67, 3.67, 3.67, 3.67]
    bl9 = ['Sign up', 'Account', 'Identity', 'Income', 'Affordability', 'Score']
    kd9 = ['member', 'bank', 'halqa', 'halqa', 'halqa', 'halqa']
    bd9 = ['phone and PIN', None, None, None, None, None]
    for i in range(6):
        ebox(sl, bx9[i], by9[i], bw9, bh9, bl9[i], bd9[i], kd9[i], tsize=12, bsize=9.5, pad=0.04)
    arrow_path(sl, [(bx9[0] + bw9, by9[0] + bh9 / 2), (bx9[1] + bw9 / 2, by9[0] + bh9 / 2),
                    (bx9[1] + bw9 / 2, by9[1])], 'flow')
    arrow_path(sl, [(bx9[1] + bw9, by9[1] + bh9 / 2), (bx9[2] + bw9 / 2, by9[1] + bh9 / 2),
                    (bx9[2] + bw9 / 2, by9[2])], 'flow')
    for i in (2, 3, 4):
        arrow(sl, bx9[i] + bw9 + 0.02, by9[i] + bh9 / 2, bx9[i + 1] - 0.02, by9[i] + bh9 / 2, 'flow')
    ebox(sl, 8.95, 1.8, 3.78, 0.62, 'Sees only the circles and turns open to them', None, 'member', tsize=11)
    arrow(sl, bx9[5] + bw9 / 2 + 0.3, by9[5], bx9[5] + bw9 / 2 + 0.3, 2.42, 'flow')
    acct = 'CNIC, NADRA biometric check, due diligence' if MQ_ else 'CNIC and registered mobile number'
    tb(sl, 5.72, 2.78, 3.1, 0.45, acct, size=10, color=SLATE, spacing=1.0)
    cy = 4.68
    cw4 = (PW - 3 * 0.3) / 4.0
    rules = [('Identity', ['Names on CNIC, account and app match: 0.90 or more passes; 0.80 to 0.90 goes to a '
                           'person', 'Live face match', 'Home and job checked']),
             ('Income', ['Salary from one employer on about the same day each month',
                         'Daily circles: Rs 1,000 or more on 5 days a week for 8 weeks',
                         'Own transfers and loans excluded']),
             ('Affordability', ['All instalments within a third of verified income',
                                'Within 40% including other loans, the State Bank limit']),
             ('Score', ['From 300 to 850', 'Decides which turns open',
                        'New members start in the last three turns'])]
    for i, (t, items) in enumerate(rules):
        x = PM + i * (cw4 + 0.3)
        tb(sl, x, cy, cw4, 0.3, t, size=12.5, bold=True, color=LIME_DK)
        blist(sl, x, cy + 0.34, cw4, 1.7, items, size=10.5, bcolor=LIME_DK, gap=2.5)
    tb(sl, PM, 6.62, PW, 0.28, 'Halqa stores results only: never face images, card numbers or passwords.%s'
       % ('' if MQ_ else ' Raqami onboards residents aged 18 and over.'), size=10.5, color=SLATE)
    say(sl, 'How a member gets in, lane by lane. After signing up with a phone number and PIN, %s opens the account '
            'with its own checks: %s. Then Halqa’s four checks run.\n\nIdentity: the names on the CNIC, the bank '
            'account and the application must match; 0.90 or more passes and 0.80 to 0.90 goes to a person; a live '
            'face match; home against the declared address; the declared job against the income seen. Income: the '
            'account the income arrives in; salary from one employer on about the same day each month, or for daily '
            'circles Rs 1,000 or more on five days a week for eight weeks; transfers from the member’s own accounts '
            'and loans do not count. It learns the payday, so the debit lands when the money is there. '
            'Affordability: all instalments within a third of verified income, and within 40 per cent with other '
            'loans, the limit the State Bank uses for consumer finance. Score: 300 to 850, which decides which turns '
            'a member may take; new members start in the last three turns.\n\nThe member only ever sees the circles '
            'and turns open to them. Halqa stores results, never face images, card numbers or passwords.'
        % (BN, 'CNIC, NADRA biometric verification and customer due diligence' if MQ_ else
           'a valid CNIC and the registered mobile number, the Asaan Digital Account opening on verification'))


# ======================================================================= 13 TYPES
def s_types():
    six = MQ_
    sl = new_slide('Committee Types', '%s types; the less the members know each other, the more checks apply'
                   % ('Six' if six else 'Five'))
    types = [('Known', 0), ('Unknown', 1), ('Large unknown', 1), ('Asset', 1)]
    if six:
        types.append(('UAE family', 0))
    types.append(('Hyper', 2))
    rows = [('Members', ['6 to 12', '12', '20', '12'] + (['6 to 12'] if six else []) + ['390 to 400']),
            ('Instalment', ['Rs 2,000 to 10,000', 'Rs 2000 to 10,000', 'Rs 10,000 to 25,000', 'Rs 10,000'] + (['any amount'] if six
                                                                                            else [])
             + ['Rs 450 to 500 a day']),
            ('Frequency', ['monthly or weekly', 'monthly', 'monthly', 'monthly'] + (['monthly'] if six else [])
             + ['daily']),
            ('Income checked', [0, 1, 1, 1] + ([0] if six else []) + [1]),
            ('Automatic debit', [0, 1, 1, 1] + ([1] if six else []) + [1]),
            ('%s' % INS_C, [0, 1, 1, 1] + ([0] if six else []) + [1]),
            ('Credit report read', [0, 1, 1, 1] + ([0] if six else []) + [1]),
            ('Typical members', ['family, colleagues, neighbours, bazaar traders', 'people who do not know each other',
                                 'larger amounts', 'buying a motorcycle or machine']
             + (['relatives in Pakistan and the UAE'] if six else []) + ['daily earners'])]
    lw_ = 2.25
    n = len(types)
    cwt = (PW - lw_) / n
    y0 = 1.68
    hh = 0.66
    for j, (t, lvl) in enumerate(types):
        x = PM + lw_ + j * cwt
        fc = LV[lvl]
        tc = text_on(fc)
        paras = [(t, dict(size=12, bold=True, color=tc, align=CEN))]
        paras.append(('check level %d%s' % (lvl + 1, ', experimental' if t == 'Hyper' else ''),
                      dict(size=9, color=tc, align=CEN)))
        rect(sl, x + 0.03, y0, cwt - 0.06, hh, fc, paras=paras, pad=0.04, anchor=MIDDLE, spacing=1.0)
    ry = y0 + hh + 0.05
    for i, (lb, vals) in enumerate(rows):
        rh = 0.62 if lb == 'Typical members' else 0.42
        tb(sl, PM, ry, lw_ - 0.1, rh, lb, size=11.5, bold=True, color=INK, anchor=MIDDLE)
        for j, v in enumerate(vals):
            x = PM + lw_ + j * cwt
            if isinstance(v, int):
                harvey(sl, x + cwt / 2, ry + rh / 2, 0.21, 2 if v else 0)
            else:
                tb(sl, x + 0.05, ry, cwt - 0.1, rh, v, size=10.5 if lb != 'Typical members' else 10, color=INK,
                   align=CEN, anchor=MIDDLE, spacing=1.0)
        ry += rh
        rule(sl, PM, ry, PW, LINE_, 0.75)
    ly = ry + 0.12
    harvey(sl, PM + 0.1, ly + 0.13, 0.17, 2)
    tb(sl, PM + 0.27, ly, 1.1, 0.26, 'required', size=10, color=SLATE)
    harvey(sl, PM + 1.3, ly + 0.13, 0.17, 0)
    tb(sl, PM + 1.47, ly, 1.3, 0.26, 'not required', size=10, color=SLATE)
    lx = PM + 2.9
    for k in range(3):
        rect(sl, lx, ly + 0.04, 0.17, 0.17, LV[k])
        tb(sl, lx + 0.24, ly, 1.3, 0.26, 'check level %d' % (k + 1), size=10, color=SLATE)
        lx += 1.45
    tb(sl, lx + 0.1, ly, RX - lx - 0.1, 0.26, 'In every type, early turns must be earned.', size=10, color=SLATE)
    uae = (' UAE family circles join relatives across two countries through Mashreq’s non resident accounts.'
           if six else ' Circles for families overseas can follow once Raqami opens accounts to non residents; today '
                       'it onboards residents only.')
    say(sl, '%s kinds of circle and what each requires. Known circles, between family, colleagues or neighbours, '
            'including the weekly bazaar committee, need only check level one, because the group itself knows its '
            'members. Circles between strangers need the income check, automatic debit, %s and a credit report '
            'read; the large ones are the committees in lakhs. Asset circles buy a motorcycle or machine with %s '
            'financing.%s Hyper is a daily circle of 390 to 400 members, run as an experiment, with the strictest '
            'checks; it has its own slide.\n\nIn every type the early turns must be earned: a new member starts in '
            'the last three turns until two circles have completed cleanly.'
        % ('Six' if six else 'Five', INS, BN, uae))


# ======================================================================= 14 HYPER
def s_hyper():
    sl = new_slide('Hyper Daily Committee (Experimental)', appx('A1', 'a daily circle for daily earners, in two '
                                                                     'designs'))
    xtitle(sl, PM, 1.62, 7.2, 'Daily payment by design', 'Rs a day')
    k_ = 4.3 / 500.0
    bx0 = PM + 1.2
    designs = [('Design 1', [(300, BLUE, 'Rs 300 contribution'), (135, TEAL, 'Rs 135'), (15, TH, None)], 'Rs 450'),
               ('Design 2', [(333.33, BLUE, 'Rs 333.33 contribution'), (151.67, TEAL, 'Rs 151.67'), (15, TH, None)],
                'Rs 500')]
    for i, (nm, segs, tot) in enumerate(designs):
        y = 2.05 + i * 0.78
        tb(sl, PM, y, 1.1, 0.5, nm, size=12, bold=True, color=INK, anchor=MIDDLE)
        x = bx0
        for v, col, lb in segs:
            wv = v * k_
            rect(sl, x, y, wv - 0.03, 0.5, col)
            if lb:
                tb(sl, x + 0.08, y, wv - 0.16, 0.5, lb, size=10.5, bold=True, color=WHITE, anchor=MIDDLE)
            x += wv
        tb(sl, x + 0.1, y, 1.3, 0.5, tot + ' a day', size=11.5, bold=True, color=INK, anchor=MIDDLE)
    legend(sl, PM, 3.62, [(BLUE, 'contribution, to the pot'), (TEAL, INS), (TH, 'fee, Rs 15 a day')])
    ty = 4.15
    cols = [2.9, 1.65, 1.65]
    hdr = ['', 'Design 1', 'Design 2']
    rows = [('Members', '400', '390'), ('Collecting days', '50', '26, Sundays off'), ('Collecting each day', '8', '15'),
            ('Pot', 'Rs 15,000', 'Rs 8,666.67'), ('Fee a member, whole circle', 'Rs 750', 'Rs 390'),
            ('Fee, whole circle', 'Rs 300,000', 'Rs 152,100'),
            ('%s a member' % INS_C, 'Rs 6,750', 'Rs 3,943.33')]
    x = PM
    for c_, (wc, h_) in enumerate(zip(cols, hdr)):
        tb(sl, x, ty, wc, 0.3, h_, size=11, bold=True, color=INK, align=L if c_ == 0 else R)
        x += wc
    rule(sl, PM, ty + 0.32, sum(cols), INK, 0.75)
    for r_, row in enumerate(rows):
        yy = ty + 0.36 + r_ * 0.31
        x = PM
        for c_, (wc, v) in enumerate(zip(cols, row)):
            tb(sl, x, yy, wc, 0.3, v, size=11, color=INK, align=L if c_ == 0 else R)
            x += wc
        rule(sl, PM, yy + 0.3, sum(cols), LINE_, 0.5)
    rx0 = 7.35
    panel(sl, rx0, 1.68, RX - rx0, 5.05, FAINT)
    tb(sl, rx0 + 0.25, 1.82, RX - rx0 - 0.5, 0.3, 'Controls', size=13, bold=True, color=INK)
    ctl = ['Income: Rs 1,000 or more credited on 5 days a week for 8 weeks', 'Check level 3: every check applies',
           'Automatic debit required', 'One daily circle per member',
           'Late charges 5%%, 10%% and 15%% at 12, 36 and 60 hours%s' % (', paid to charity' if not MQ_ else ''),
           'New days stop opening when losses would exceed the %s limit' % INS,
           'Every payment reported to the credit record',
           'Run as an experiment, with its own limits agreed with %s' % BN]
    blist(sl, rx0 + 0.25, 2.25, RX - rx0 - 0.5, 4.3, ctl, size=11.5, bcolor=AMBER, gap=5)
    sources(sl, ['Hyper design of 23 September 2026 with the fee set on 29 September 2026; Hyper Default Threshold '
                 'Model (HQ-MF-01)'])
    say(sl, 'Hyper is a daily committee for people paid daily, such as shopkeepers and drivers, run as an experiment '
            'inside the partnership.\n\nEach daily payment splits three ways. Design one: 400 members pay Rs 450 a '
            'day for 50 days; Rs 300 goes to the pot, Rs 135 to %s and Rs 15 is the fee; eight members collect Rs '
            '15,000 each day. Design two: 390 members pay Rs 500 a day for 26 days, Sundays off; Rs 333.33 to the pot, '
            'Rs 151.67 to %s and Rs 15 fee; fifteen members collect Rs 8,666.67 each day. The fee is the same flat Rs '
            '15 on every day and every turn, never graded by turn.\n\nThe controls are the strictest in the product: '
            'daily income verified over eight weeks, all checks, automatic debit, one daily circle per member, late '
            'charges of 5, 10 and 15 per cent at 12, 36 and 60 hours, and the circle stops opening new days if losses '
            'would exceed the %s limit.' % (INS, INS, INS))


# ======================================================================= 15 COLLECTION
def s_collection():
    sl = new_slide('Payment Collection', appx('A2', 'three collection methods; the automatic method is a new %s '
                                                    'from %s' % (B['mandate'], BN)))
    mw = (PW - 2 * 0.3) / 3.0
    meth = [('Method 1', 'One-tap approval', BLUE_LT,
             'The member approves a payment request by card, mobile wallet or Raast.',
             'Known circles, and when an automatic debit fails'),
            ('Method 2', 'Automatic debit', TH_LT,
             'A %s on the member’s %s account, a new line for %s; or a saved card or wallet charged through the '
             'PSP.' % (B['mandate'], BN, BN),
             'Required on circles between strangers, asset%s and Hyper circles' % (', UAE family' if MQ_ else '')),
            ('Method 3', 'Manual payment', FAINT,
             'The member sends the instalment from any bank account or wallet.',
             'Always available')]
    y0 = 1.7
    for i, (tag, name, fc, desc, use) in enumerate(meth):
        x = PM + i * (mw + 0.3)
        rect(sl, x, y0, mw, 0.62, fc, paras=[(tag, dict(size=9.5, color=SLATE)),
                                             (name, dict(size=14, bold=True, color=INK))], pad=0.14, anchor=MIDDLE,
             spacing=1.0)
        rect(sl, x, y0 + 0.62, mw, 1.72, None, line=LINE_, lw=0.75)
        tb(sl, x + 0.16, y0 + 0.74, mw - 0.3, 0.85, desc, size=11.5, color=INK, spacing=1.05)
        tb(sl, x + 0.16, y0 + 1.62, mw - 0.3, 0.65, [[('Used for: ', dict(size=10.5, bold=True, color=SLATE)),
                                                      (use, dict(size=10.5, color=SLATE))]], spacing=1.03)
    xtitle(sl, PM, 4.3, 7.8, 'One instalment, day by day', 'days of the month')
    dw = 7.8 / 12.0
    cy = 4.66
    fills = {1: TH, 2: TH_MID, 3: TH_MID, 4: TH_MID, 5: TH_MID, 8: INK, 9: AMBER, 10: AMBER, 11: AMBER, 12: AMBER}
    for d in range(1, 13):
        x = PM + (d - 1) * dw
        col = fills.get(d, C('E5E7EB'))
        rect(sl, x + 0.02, cy, dw - 0.04, 0.55, col)
        tb(sl, x, cy + 0.12, dw, 0.32, str(d), size=12.5, bold=True, color=text_on(col), align=CEN)
    for d, span, t in [(1, 1, 'payday: first debit'), (2, 4, 'a retry each morning, 5 attempts at most'),
                       (8, 1, 'due date'), (9, 4, 'late charges: 2%, then 5%, then 10%')]:
        x = PM + (d - 1) * dw
        tb(sl, x + 0.03, cy + 0.62, dw * span - 0.06, 0.5, t, size=10, color=SLATE, spacing=1.0)
    tb(sl, PM, 5.95, 7.8, 0.6, 'The evening before payday the member gets a reminder on WhatsApp. The payday is '
                               'learned from the account the salary arrives in.', size=10.5, color=SLATE,
       spacing=1.04)
    rx0 = 8.85
    panel(sl, rx0, 4.3, RX - rx0, 2.45, FAINT)
    tb(sl, rx0 + 0.2, 4.4, RX - rx0 - 0.4, 0.3, 'Rules on every automatic debit', size=12, bold=True, color=INK)
    blist(sl, rx0 + 0.2, 4.76, RX - rx0 - 0.35, 1.95,
          ['At most one instalment each time', 'Only on the circle’s schedule',
           'Cancelling moves the member to method 1 or 3; the commitment to the circle stays',
           'A missed amount is held against the member’s own pot, never owed to Halqa'], size=10.5, gap=3)
    say(sl, 'How the money is collected: the three methods, in the order of the collection design.\n\nMethod one, '
            'one-tap approval: a payment request the member approves by card, mobile wallet or Raast. It is the '
            'method for known circles and the fallback when an automatic debit fails.\n\nMethod two, automatic '
            'debit: %s’s %s on the member’s own %s account is the main automatic method; a saved card or wallet '
            'charged through a licensed PSP covers members whose money sits elsewhere. Automatic debit is required '
            'on every circle between strangers and on Hyper.\n\nMethod three, manual payment: always available.\n\n'
            'The day strip is one instalment. The first debit runs on the member’s payday, learned from the account '
            'the salary arrives in; if the salary is late, one retry each morning, five attempts at most. The due '
            'date is the 8th. Only after that do late charges start: 2, 5 and 10 per cent of the instalment%s. Each '
            'debit is capped at one instalment and runs only on the circle’s schedule; cancelling the mandate moves '
            'the member to method one or three without cancelling the commitment; and a missed amount is recorded '
            'against the member’s own pot, never as a balance owed to Halqa.'
        % (BN, B['mandate'], BN, ', paid to charity' if not MQ_ else ''))


# ================================================================ 16 WALLETS AND PSP
def s_psp():
    sl = new_slide('Wallets and PSP Integration', appx('A3', 'how money in a wallet, a card or another bank '
                                                             'reaches the committee account at %s' % BN))
    cA, cB, cC, cD = PM, 3.35, 6.1, 9.0
    wA, wB, wC, wD = 2.25, 2.25, 2.3, RX - 9.0
    for x, w_, t in [(cA, wA, 'Where the money is'), (cB, wB, 'Route'), (cC, wC, 'At %s' % BN),
                     (cD, wD, 'Payout')]:
        tb(sl, x, 1.62, w_, 0.28, t, size=10.5, bold=True, color=MUTED)
    ebox(sl, cB, 1.95, cC + wC - cB, 0.5, 'Halqa platform', 'sends requests by API; receives confirmations', 'halqa',
         tsize=11.5, bsize=10)
    ry = [2.85, 3.65, 4.45, 5.25]
    rh = 0.62
    ebox(sl, cA, ry[0], wA, rh, '%s account' % BN, None, 'bank', tsize=11)
    ebox(sl, cA, ry[1], wA, rh, 'Another bank account', None, 'member', tsize=11)
    ebox(sl, cA, ry[2], wA, rh, 'Mobile wallet', 'JazzCash, Easypaisa and others', 'pay', tsize=11, bsize=9)
    ebox(sl, cA, ry[3], wA, rh, 'Debit card', None, 'pay', tsize=11)
    ebox(sl, cB, ry[0], wB, rh, B['mandate_c'], None, 'bank', tsize=11)
    ebox(sl, cB, ry[1], wB, rh, 'Raast transfer', None, 'pay', tsize=11)
    ebox(sl, cB, ry[2], wB, ry[3] + rh - ry[2], 'Licensed PSP', 'tokenised wallet and card payments', 'pay', tsize=11.5,
         bsize=10)
    ebox(sl, cC, ry[0], wC, ry[3] + rh - ry[0], 'Committee account', 'held about 7 days; profit on the balance',
         'bank', tsize=12, bsize=10)
    ebox(sl, cD, ry[0], wD, rh, 'Collector’s %s account' % BN, 'the pot on the 8th', 'bank', tsize=11, bsize=9.5)
    for i in range(2):
        arrow(sl, cA + wA, ry[i] + rh / 2, cB, ry[i] + rh / 2, 'money')
        arrow(sl, cB + wB, ry[i] + rh / 2, cC, ry[i] + rh / 2, 'money')
    arrow(sl, cA + wA, ry[2] + rh / 2, cB, ry[2] + rh / 2, 'money')
    arrow(sl, cA + wA, ry[3] + rh / 2, cB, ry[3] + rh / 2, 'money')
    ymid = (ry[2] + ry[3] + rh) / 2
    arrow(sl, cB + wB, ymid, cC, ymid, 'money')
    arrow(sl, cC + wC, ry[0] + rh / 2, cD, ry[0] + rh / 2, 'money')
    arrow(sl, cB + 0.5, 2.45, cB + 0.5, ry[0], 'instr')
    arrow(sl, cC + wC / 2, 2.45, cC + wC / 2, ry[0], 'instr')
    arrow(sl, cC + wC - 0.35, ry[0], cC + wC - 0.35, 2.45, 'data')
    sy = 3.72
    tb(sl, cD, sy, wD, 0.3, 'The process', size=12, bold=True, color=INK)
    stp = [('Link', 'The member links a wallet or card once in the app. The PSP keeps the token; Halqa keeps only a '
                    'reference.'),
           ('Collect', 'On payday Halqa asks %s or the PSP to collect, under the member’s consent.' % BN),
           ('Settle', 'The PSP settles into the committee account at %s, never to Halqa.' % BN),
           ('Confirm', 'Each payment is confirmed; Halqa updates the record and reconciles every entry daily.')]
    yy = sy + 0.36
    for i, (t, d) in enumerate(stp):
        tb(sl, cD, yy, wD, 0.7, [[('%d  %s   ' % (i + 1, t), dict(size=10.5, bold=True, color=TH_DK)),
                                  (d, dict(size=10.5, color=INK))]], spacing=1.03)
        yy += 0.7
    legend(sl, PM, 6.1, [('money', 'money'), ('instr', 'request'), ('data', 'confirmation')])
    legend(sl, PM, 6.42, [((TH_XLT, TH), BN), ((BLUE_XLT, BLUE), 'wallets, cards and payment networks'),
                          ((LIME_XLT, LIME), 'Halqa')])
    say(sl, 'How money reaches the committee when it is not already in the member’s %s account. The blue lines are '
            'money and all of them end at %s; none touches Halqa.\n\nIf the money is in the member’s %s account, the '
            '%s collects it directly. If it is in another bank or a wallet, the member can move it by Raast, or link '
            'the wallet or a debit card once in the Halqa application: a licensed payment service provider keeps the '
            'card or wallet token, and Halqa keeps only a reference to it, never the card number. On payday Halqa '
            'sends the collection request by API to %s or to the PSP; the PSP settles the payment into the committee '
            'account at %s, never to Halqa. Every payment is confirmed back to Halqa, which updates the record and '
            'reconciles every entry against %s’s statement daily. On the 8th the pot goes from the committee account '
            'to the collector’s %s account.\n\nMost Pakistanis who pay digitally use a mobile wallet; about 69 '
            'million people held one at the end of 2024. This route lets them join without changing how they are '
            'paid.' % (BN, BN, BN, B['mandate'], BN, BN, BN, BN))


# ================================================================ 17 DEFAULT PREVENTION
def s_prevention():
    sl = new_slide('Default Prevention', 'Controls before joining, at joining, at each instalment and after a missed '
                                         'payment')
    stages = [('Before joining', BLUE, ['Identity, income and affordability checks',
                                        'The credit score decides which turns open',
                                        'The host admits each member',
                                        'At most 6 circles and 1 daily circle per member']),
              ('At joining', TEAL, ['Every rupee owed shown before signing', '24 hours to withdraw at no cost',
                                    'Ten clause undertaking and a mutual guarantee between members',
                                    '%s consent' % B['mandate_c'],
                                    '%s on circles between strangers' % INS_C]),
              ('Each instalment', TH, ['Reminder the evening before payday', 'Debit on the member’s payday',
                                       'A retry each morning, 5 attempts at most', 'Due on the 8th']),
              ('After a missed payment', AMBER, ['Arrears taken from the member’s own pot before they collect',
                                                 'Late charges of 2%%, 5%% and 10%%%s' % (' paid to charity' if not MQ_
                                                                                       else ''),
                                                 'Credit score down 10, 20 and 40 points',
                                                 'Daily circles: 5%, 10% and 15% at 12, 36 and 60 hours',
                                                 'Recovery steps if the member has already collected'])]
    n = 4
    ov = 0.18
    cw = (PW + (n - 1) * ov) / n
    y0 = 1.72
    for i, (t, col, items) in enumerate(stages):
        x = PM + i * (cw - ov)
        shp = SH.PENTAGON if i == 0 else SH.CHEVRON
        s = shape(sl, shp, x, y0, cw, 0.62, col, paras=[(t, dict(size=12.5, bold=True, color=text_on(col),
                                                                 align=CEN))], pad=0.05, anchor=MIDDLE)
        if i > 0:
            s.adjustments[0] = 0.28
        else:
            s.adjustments[0] = 0.28
        bx = PM + i * (cw - ov) + (0.25 if i > 0 else 0.05)
        blist(sl, bx, y0 + 0.85, cw - ov - 0.3, 3.3, items, size=12, bcolor=col, gap=6, spacing=1.04)
        who = ['Halqa’s checks and the host', 'the member signs; %s registers the %s' % (BN, B['mandate']),
               'Halqa reminds; %s collects' % BN, 'Halqa records; arrears settled from the member’s pot'][i]
        tb(sl, bx, 5.42, cw - ov - 0.3, 0.6, [[('Who acts:  ', dict(size=10.5, bold=True, color=SLATE)),
                                               (who, dict(size=10.5, color=SLATE))]], spacing=1.03)
    rule(sl, PM, 5.32, PW, LINE_, 0.75)
    rect(sl, PM, 6.05, PW, 0.66, FAINT, paras=[[('Where the risk sits:  ', dict(size=11.5, bold=True, color=INK)),
                                              ('a member who has not yet collected cannot leave the others short. '
                                               'Only early collectors can, so early turns are restricted by score '
                                               '(next page).', dict(size=11.5, color=INK))]], pad=0.18, anchor=MIDDLE)
    sources(sl, ['Default Prevention (HQ-CP-05); State Bank 40 per cent consumer finance limit, BPRD Circular Letter '
                 '29 of 2021'])
    say(sl, 'The controls, in the order a member meets them.\n\nBefore joining: the identity, income and '
            'affordability checks; the credit score decides which turns open; the host admits each member; and no '
            'member may hold more than six circles and one daily circle at once.\n\nAt joining: every rupee the member '
            'will owe is shown before signing; there are 24 hours to withdraw at no cost; the member signs a ten '
            'clause undertaking and a mutual guarantee with the other members, and consents to the %s; %s applies on '
            'circles between strangers.\n\nEach instalment: a reminder the evening before payday, the debit on the '
            'member’s payday, one retry each morning, five attempts at most, and the due date on the 8th.\n\nAfter a '
            'missed payment: a member who has not yet collected leaves no one short, because the arrears are taken out '
            'of their own pot on their turn. Late charges are 2, 5 and 10 per cent of the instalment as the delay '
            'grows%s, with score falls of 10, 20 and 40; daily circles charge 5, 10 and 15 per cent at 12, 36 and 60 '
            'hours. Only a member who has already collected can leave others short, and for that member the recovery '
            'steps apply.' % (B['mandate'], INS, ', always paid to charity' if not MQ_ else ''))


# ================================================================ 18 TURN ELIGIBILITY
def s_turns():
    sl = new_slide('Turn Eligibility', 'Amount still owed after collecting, and the credit score needed for each '
                                       'turn')
    xtitle(sl, PM, 1.62, 7.6, 'Still owed after collecting: circle of 12 at Rs 10,000', 'Rs thousand, by turn')
    vals = [10 * (12 - k) for k in range(1, 13)]
    pc = [LV[2]] * 6 + [LV[1]] * 3 + [LV[0]] * 3
    chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, PM - 0.1, 1.95, 7.9, 3.5, [str(k) for k in range(1, 13)],
          [('Rs thousand', vals)], point_colors=pc, fmt='0', gap=45, size=10.5,
          label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=125)
    plot_x0, plot_w = PM + 0.12, 7.5
    colw = plot_w / 12.0
    for a_, b_, lb in [(1, 6, 'Turns 1 to 6: score 650 or more'), (7, 9, 'Turns 7 to 9: 550 or more'),
                       (10, 12, 'Turns 10 to 12: any score')]:
        xa = plot_x0 + (a_ - 1) * colw + 0.05
        xb_ = plot_x0 + b_ * colw - 0.05
        yb_ = 5.62
        line(sl, xa, yb_, xb_, yb_, SLATE, 0.75)
        line(sl, xa, yb_ - 0.08, xa, yb_, SLATE, 0.75)
        line(sl, xb_, yb_ - 0.08, xb_, yb_, SLATE, 0.75)
        tb(sl, xa, yb_ + 0.05, xb_ - xa, 0.5, lb, size=10.5, color=INK, align=CEN, spacing=1.0)
    rx0 = 8.75
    rw = RX - rx0
    stat(sl, rx0, 1.72, rw, 'Rs 110,000', 'the most anyone can owe: turn 1 of 12', nsize=26, tsize=11.5, lh=0.45)
    rule(sl, rx0, 2.95, rw, LINE_, 0.75)
    tb(sl, rx0, 3.08, rw, 0.3, 'Rules', size=12.5, bold=True, color=INK)
    blist(sl, rx0, 3.44, rw, 3.2, ['Bands are mandatory, with no exceptions',
                                   'Every new member starts in the last three turns',
                                   'Earlier turns open after two circles complete cleanly',
                                   'The score is checked again before each circle'], size=11.5, gap=6)
    panel(sl, rx0, 5.25, rw, 1.45, FAINT)
    tb(sl, rx0 + 0.2, 5.35, rw - 0.4, 0.3, 'Example', size=12, bold=True, color=INK)
    tb(sl, rx0 + 0.2, 5.67, rw - 0.4, 1.0, 'A new member joining a circle of 12 may choose turn 10, 11 or 12. After '
                                           'two clean circles and a score of 650 or more, any turn is open.', size=11,
       color=INK, spacing=1.05)
    sources(sl, ['Seat bands of the build plan (11 August 2026), confirmed as mandatory on 28 September 2026'])
    say(sl, 'This is the question every banker asks first. The chart is the whole default risk in one picture: on a '
            'circle of twelve at Rs 10,000, the member who collects in turn one still owes Rs 110,000; the member in '
            'turn twelve owes nothing, because they have already paid everything in. Risk exists only where someone '
            'collects before they have paid.\n\nSo the early turns are closed to weak scores. Turns one to six need '
            '650 or more on Halqa’s 300 to 850 scale; turns seven to nine need 550; the last three are open to anyone. '
            'Every new member starts in the last three turns until two circles have completed cleanly, so a stranger '
            'can never take the first pot. The bands are mandatory, with no exceptions.')


# ======================================================================= 19 RECOVERY
def s_recovery():
    sl = new_slide('Recovery', appx('A4', 'steps after a member stops paying having already collected the pot'))
    steps = [('Contact', 'a hardship plan and a new date', AMBER_LT),
             ('Restrict', 'account restricted; score down 200', AMBER_LT),
             ('Claim', 'the %s operator pays the members left short' % INS, TEAL_LT),
             ('Guarantee', 'the mutual guarantee: the balance falls due', RED_LT),
             ('Civil suit', 'on the signed undertaking', RED_LT),
             ('Cheque', 'a summary suit, only where a guarantee cheque is held', RED_LT)]
    sw, gap = 1.9, 0.146
    base = 5.05
    for i, (t, d, fc) in enumerate(steps):
        x = PM + i * (sw + gap)
        hgt = 0.95 + i * 0.36
        rect(sl, x, base - hgt, sw, hgt, fc)
        tb(sl, x + 0.12, base - hgt + 0.1, sw - 0.2, 0.3, [[('%d  ' % (i + 1), dict(size=12.5, bold=True,
                                                                                    color=INK)),
                                                          (t, dict(size=12.5, bold=True, color=INK))]])
        tb(sl, x + 0.12, base - hgt + 0.42, sw - 0.22, hgt - 0.45, d, size=10.5, color=INK, spacing=1.03)
    line(sl, PM, base, RX, base, SLATE, 0.75)
    tb(sl, PM, base + 0.06, 6.5, 0.28, 'Each step is used only if the one before it fails.', size=10.5,
       color=SLATE)
    cx = PM + 2 * (sw + gap)
    ebox(sl, cx + sw + 0.35, 1.72, 3.9, 0.62, 'Members left short are paid in full', 'by the %s operator, in their '
                                                                                     'own names' % INS, 'ins',
         tsize=11.5, bsize=10)
    arrow_path(sl, [(cx + sw + 0.35, 2.03), (cx + sw / 2, 2.03), (cx + sw / 2, base - (0.95 + 2 * 0.36) - 0.02)],
               'money')
    fw = (PW - 2 * 0.45) / 3.0
    facts = [('About 5.5%', 'of the instalment: the %s price for the stress case [1]' % INS, TEAL_DK),
             ('%s chooses' % BN, (B['ins_choice'] % BN).split(': ', 1)[-1] if MQ_ else
              'the takaful operator; EFU window takaful is already its partner', TH_DK),
             ('Never', 'calls to relatives, contact lists or published names', RED_DK)]
    for i, (n_, t, col) in enumerate(facts):
        x = PM + i * (fw + 0.45)
        stat(sl, x, 5.55, fw, n_, t, nsize=22, tsize=11, ncolor=col, lh=0.6)
    sources(sl, ['Takaful pricing model (HQ-MF-05): one circle in five losing a fifth of its members from the '
                 'earliest turns'])
    say(sl, 'Recovery applies only to a member who has already collected and then stops paying; a member who misses '
            'before collecting costs the others nothing, because the arrears come out of their own pot. The worst '
            'case is turn one on a circle of twelve at Rs 10,000, with Rs 110,000 still owed.\n\nThe steps rise in '
            'severity and each is used only if the one before fails. One, contact: most cases end with a hardship '
            'plan and a new date. Two, the account is restricted and the score falls by 200. Three, the %s operator '
            'pays the members left short in full, in their own names, so they are made whole while recovery '
            'continues. Four, the mutual guarantee: the whole balance falls due. Five, an ordinary civil suit on the '
            'signed undertaking. Six, only where a guarantee cheque is held, a summary suit on it.\n\nThe %s is priced '
            'for a severe stress case, one circle in five losing a fifth of its members from the earliest turns: '
            'about 5.5 per cent of the instalment on a circle between strangers. %s. Halqa itself insures no one.'
            ' What Halqa never does: call relatives, read contact lists or publish names; that is how the banned '
            'loan applications worked.' % (INS, INS, B['ins_choice'] % BN))


# ======================================================================= 20 POINTS
def s_points():
    sl = new_slide('Points and Rewards', appx('A5', 'profit on committee balances and on-time payments, returned '
                                                    'to members as points'))
    earn = [('Profit on committee balances', 'paid at the end of each circle'),
            ('On-time payments', 'at most half of Halqa’s fee on that instalment'),
            ('Hosting', 'circles that complete cleanly')]
    if MQ_:
        earn.append(('Bought with money', 'as a Mashreq product, under its licence'))
    spend = [('Halqa marketplace', 'goods from partner sellers'), ('E-commerce partners', 'online purchases'),
             ('%s rewards' % BN, 'with the bank’s own rewards')]
    y0 = 1.72
    ew = 3.3
    eh, eg = (0.56, 0.1) if len(earn) > 3 else (0.62, 0.14)
    tb(sl, PM, y0 - 0.05, ew, 0.28, 'Earn', size=11, bold=True, color=MUTED)
    for i, (t, d) in enumerate(earn):
        ebox(sl, PM, y0 + 0.28 + i * (eh + eg), ew, eh, t, d, 'halqa' if i != 3 else 'bank', tsize=11.5,
             bsize=9.5 if len(earn) > 3 else 10, align=L, pad=0.12)
    n_e = len(earn)
    e_bot = y0 + 0.28 + n_e * (eh + eg) - eg
    cx0, cw = 4.85, 2.9
    cy0 = y0 + 0.28
    ch_ = e_bot - cy0
    rect(sl, cx0, cy0, cw, ch_, TH_XLT, line=TH, lw=1.5,
         paras=[('Points', dict(size=20, bold=True, color=INK, align=CEN)),
                ('1 point = Rs 1', dict(size=14, color=TH_DK, align=CEN, before=4)),
                ('held in the member’s account', dict(size=10.5, color=SLATE, align=CEN, before=4))], pad=0.1,
         anchor=MIDDLE)
    for i in range(n_e):
        yy = y0 + 0.28 + i * (eh + eg) + eh / 2
        arrow(sl, PM + ew + 0.05, yy, cx0 - 0.05, yy, 'flow')
    sx0 = 8.95
    sw_ = RX - sx0
    tb(sl, sx0, y0 - 0.05, sw_, 0.28, 'Spend', size=11, bold=True, color=MUTED)
    for i, (t, d) in enumerate(spend):
        yy = y0 + 0.28 + i * (eh + eg)
        ebox(sl, sx0, yy, sw_, eh, t, d, 'pay' if i < 2 else 'bank', tsize=11.5, bsize=10, align=L, pad=0.14)
        arrow(sl, cx0 + cw + 0.05, yy + eh / 2, sx0 - 0.05, yy + eh / 2, 'flow')
    rate = '10% a year'
    ny = 6.75 - 0.62
    cy = ny - 0.2 - 0.72
    by = cy - 0.36
    xtitle(sl, PM, by, PW, 'Worked example: profit on one circle of 12 at Rs 10,000', 'per month and per circle')
    items = [('Rs 120,000', 'held each month', 0), ('7 of 365 days', 'payday to the 8th', 0),
             ('10% a year', 'Islamic Savings Account' if MQ_ else '7 day Mudarabah Certificate', 0),
             ('Rs 230', 'profit a month', 0), ('Rs 2,760', 'over 12 months', 0), ('230 points', 'to each member', 1)]
    ops = [u'×', u'×', '=', '>', '>']
    opw = 0.42
    n_c = len(items)
    bwc = (PW - (n_c - 1) * opw) / n_c
    for i, (num, lb, hi) in enumerate(items):
        x = PM + i * (bwc + opw)
        rect(sl, x, cy, bwc, 0.72, TH_XLT if hi else FAINT, line=TH if hi else LINE_, lw=1.0,
             paras=[(num, dict(size=14.5, bold=True, color=INK, align=CEN)),
                    (lb, dict(size=10, color=SLATE, align=CEN, before=2))], pad=0.05, anchor=MIDDLE, spacing=1.0)
        if i < n_c - 1:
            if ops[i] == '>':
                arrow(sl, x + bwc + 0.07, cy + 0.37, x + bwc + opw - 0.07, cy + 0.37, 'flow')
            else:
                tb(sl, x + bwc, cy + 0.15, opw, 0.44, ops[i], size=18, bold=True, color=SLATE, align=CEN,
                   anchor=MIDDLE)
    if MQ_:
        note = [('Turn exchange:  ', dict(size=11, bold=True, color=INK)),
                ('members may exchange turns; the price is capped at the value of the pot, the buyer’s score must '
                 'qualify for the earlier turn, the host approves, and a fee is charged on each exchange.',
                 dict(size=11, color=INK))]
    else:
        note = [('Profit rates:  ', dict(size=11, bold=True, color=INK)),
                ('Raqami published 10% for its 7 day Mudarabah Certificate in August 2026; members receive the '
                 'profit actually earned.', dict(size=11, color=INK))]
    rect(sl, PM, ny, PW, 6.75 - ny, FAINT, paras=[note], pad=0.18, anchor=MIDDLE, spacing=1.04)
    sources(sl, ['%s product rates%s; bank decisions of 28 September 2026 (D4, D9)'
                 % (BN, ' (Islamic Savings Account, 10% indicative below Rs 1.5 million)' if MQ_ else
                    ' (Historical Profit Rates, August 2026)')])
    say(sl, 'Points return value to members without Halqa holding money. The main source is the profit on committee '
            'balances: instalments sit at %s for about a week each month, and the profit on that balance is paid to '
            'members at the end of the circle as points, one point for each rupee. Members also earn points for '
            'paying on time, never more than half of Halqa’s own fee on that instalment, and hosts earn points for '
            'circles that complete cleanly.%s Points are spent in Halqa’s marketplace, with e-commerce partners and '
            'with %s’s own rewards.\n\nThe worked example keeps it honest: a circle of 12 at Rs 10,000 holds Rs '
            '120,000 for about seven days a month; at %s that earns about Rs 230 a month, about Rs 2,760 over the '
            'circle, or about 230 points per member. It is a reward, not a return.%s'
        % (BN, ' Points can also be bought, as a Mashreq product under its licence.' if MQ_ else '', BN, rate,
           '\n\nTurn exchange: members may exchange turns with each other, with the price capped at the value of the '
           'pot, the buyer’s score checked against the earlier turn and the host approving; a fee is charged on each '
           'exchange.' if MQ_ else ''))


# ======================================================================= 21 REVENUE
def s_revenue():
    sl = new_slide('Revenue and Business Model', 'How one instalment is split, where Halqa’s income comes from and '
                                                 'when it breaks even')
    xtitle(sl, PM, 1.62, 5.6, 'One instalment on a circle between strangers', 'Rs')
    tb(sl, PM, 1.92, 5.6, 0.26, 'The member pays Rs 11,047', size=10.5, color=SLATE)
    sx, sw, sy0, sh = PM + 0.02, 0.16, 2.3, 2.4
    k_ = sh / 11047.0
    parts = [(10000, BLUE, BLUE_LT, 2.2), (547, TEAL, TEAL_LT, 4.62), (500, TH, TH_LT, 4.92)]
    tx = 2.75
    ya = sy0
    rect(sl, sx, sy0, sw, sh, INK)
    for v, ncol, bcol, ty_ in parts:
        hh = v * k_
        band(sl, sx + sw, ya, ya + hh, tx, ty_, ty_ + hh, bcol)
        rect(sl, tx, ty_, sw, hh, ncol)
        ya += hh
    cyc = 2.2 + 10000 * k_ / 2
    tb(sl, tx + 0.3, cyc - 0.42, 3.3, 0.4, 'Rs 10,000', size=18, bold=True, color=INK)
    tb(sl, tx + 0.3, cyc, 3.2, 0.3, 'to the member collecting', size=11, color=SLATE)
    tb(sl, tx + 0.3, 4.53, 3.5, 0.3, [[('Rs 547  ', dict(size=11, bold=True, color=INK)),
                                       ('%s' % INS, dict(size=11, color=SLATE))]])
    tb(sl, tx + 0.3, 4.83, 3.6, 0.5, [[('up to Rs 500  ', dict(size=11, bold=True, color=INK)),
                                      ('fee to %s, shared with Halqa' % BN, dict(size=11, color=SLATE))]],
       spacing=1.02)
    x0 = 6.85
    xtitle(sl, x0, 1.62, RX - x0, 'Halqa’s costs and contribution by members', 'Rs million a month')
    cats = ['{:,}'.format(m) for m in range(0, 6001, 500)]
    contrib = [round(0.000513 * m, 3) for m in range(0, 6001, 500)]
    fixed = [1.32] * len(cats)
    ch = chart(sl, XL_CHART_TYPE.LINE, x0 - 0.1, 1.92, RX - x0 + 0.15, 3.0, cats,
               [('Contribution after running costs', contrib), ('Fixed cost', fixed)], colors=[LIME_DK, SLATE],
               labels=False, legend=True, size=10, val_axis=True, grid=True, vmin=0, vmax=3.5, val_fmt='0.0',
               line_w=2.25)
    ch.category_axis.tick_labels.font.size = Pt(9)
    tb(sl, 7.1, 3.3, 2.2, 0.28, 'Break-even: 2,572 members', size=10.5, bold=True, color=INK, align=R)
    oval(sl, 9.45 - 0.07, 3.75 - 0.07, 0.14, WHITE, line=LIME_DK, lw=1.75)
    tb(sl, x0, 4.95, RX - x0, 0.28, 'Members', size=9.5, color=MUTED, align=CEN)
    by = 5.45
    cw2 = (PW - 0.45) / 2.0
    tb(sl, PM, by, cw2, 0.3, 'Income lines', size=12, bold=True, color=INK)
    tb(sl, PM, by + 0.34, cw2, 1.1, [[('Now:  ', dict(size=11, bold=True, color=INK)),
                                      ('a share of the fee %s collects; a share of %s’s income on committee balances'
                                       % (BN, BN), dict(size=11, color=INK))],
                                     ([('Later:  ', dict(size=11, bold=True, color=INK)),
                                       ('asset financing referrals (2 to 4% from the financier, 1 to 3% from the '
                                        'dealer); marketplace commission; employer programmes',
                                        dict(size=11, color=INK))], dict(before=4))], spacing=1.04)
    ux = PM + cw2 + 0.45
    tb(sl, ux, by, cw2, 0.3, 'Unit costs, 25 September model', size=12, bold=True, color=INK)
    ue = [('Rs 13 to 35', 'to run one payment'), ('Rs 1.32 million', 'fixed cost a month'),
          ('About Rs 510', 'contribution a member a month')]
    uw = cw2 / 3.0
    for i, (n_, t) in enumerate(ue):
        stat(sl, ux + i * uw, by + 0.34, uw - 0.15, n_, t, nsize=15, tsize=10, lh=0.5)
    sources(sl, ['Business Model and Unit Costs (HQ-CP-03), 25 September 2026, before the bank’s terms',
                 'Takaful pricing model (HQ-MF-05)'])
    say(sl, 'How the money moves and how Halqa earns. Left, drawn to scale: one instalment on a circle between '
            'strangers. The member pays Rs 11,047: Rs 10,000 goes to whoever is collecting, Rs 547 is the %s '
            'contribution, and up to Rs 500 is the fee. %s collects the fee as its own income and pays Halqa an '
            'agreed share, and the income on both sides is used to keep the member’s cost as low as possible. Halqa’s '
            'revenue is a share of what %s earns, never money held.\n\nRight: Halqa’s own economics from its 25 '
            'September model, before %s’s terms. Fixed costs are about Rs 1.32 million a month; each active member '
            'contributes about Rs 510 a month after running costs; so Halqa covers its costs at 2,572 members, about '
            '2,600. Running one payment costs Rs 13 to 35, mostly messages and checks.\n\nIncome lines now: the fee '
            'share and a share of %s’s income on committee balances. Later: referral fees on asset financing, 2 to 4 '
            'per cent from the financier and 1 to 3 from the dealer; a merchant commission when members spend points; '
            'employer programmes.' % (INS, BN, BN, BN, BN))


# ======================================================================= 22 COMPARISON
def s_comparison():
    sl = new_slide('Comparison', 'Halqa with %s against Oraan, JazzCash Committee and informal committees' % BN)
    cols_c = ['Halqa with %s' % BN, 'Oraan', 'JazzCash Committee', 'Informal committee']
    crit = [('Money held by a licensed bank', [(2, BN), (0, 'own company accounts'), (1, 'organiser’s wallet'),
                                               (0, 'the organiser')])]
    if not MQ_:
        crit.append(('Shariah board oversight', [(2, 'Raqami’s Shariah Board'), (1, 'private adviser'),
                                                 (None, 'not stated'), (0, 'none')]))
    crit += [('Same fee for every turn', [(2, 'one flat fee'), (0, 'up to 21% a month'), (None, 'not published'),
                                          (2, 'usually none')]),
             ('Paid out automatically', [(2, 'the same day'), (1, '11th to 18th'), (0, 'by hand'), (0, 'by hand')]),
             ('Members checked', [(2, 'identity, income, score'), (1, 'device, bureau'), (0, 'phone contacts'),
                                  (1, 'people known')]),
             ('Defaults protected', [(2, INS), (1, 'own balance sheet'), (None, 'not stated'),
                                     (0, 'organiser’s pocket')]),
             ('Credit record', [(2, 'every payment'), (1, 'defaulters only'), (0, 'none'), (0, 'none')]),
             ('Reach today', [(0, 'new'), (1, '600,000+ sign ups'), (2, '60 million registered'),
                              (2, '4 in 10 Pakistanis')])]
    lw14 = 2.75
    cwc = (PW - lw14) / 4.0
    y0 = 1.68
    rh = 0.52 if MQ_ else 0.49
    tot_h = 0.55 + len(crit) * rh
    rect(sl, PM + lw14, y0, cwc, tot_h, TH_XLT)
    for j, t in enumerate(cols_c):
        tb(sl, PM + lw14 + j * cwc + 0.15, y0, cwc - 0.2, 0.52, t, size=12, bold=True, color=INK, anchor=MIDDLE)
    rule(sl, PM, y0 + 0.55, PW, INK, 0.75)
    for i, (lb, cells) in enumerate(crit):
        y = y0 + 0.55 + i * rh
        tb(sl, PM, y, lw14 - 0.1, rh, lb, size=11.5, bold=True, color=INK, anchor=MIDDLE, spacing=1.0)
        for j, (lv, note) in enumerate(cells):
            xc = PM + lw14 + j * cwc + 0.15
            if lv is not None:
                harvey(sl, xc + 0.11, y + rh / 2, 0.21, lv)
            tb(sl, xc + 0.32, y, cwc - 0.45, rh, note, size=10.5, color=MUTED if lv is None else INK,
               italic=lv is None, anchor=MIDDLE, spacing=1.0)
        rule(sl, PM, y + rh, PW, LINE_, 0.5)
    yl = y0 + tot_h + 0.12
    for k, (lv, t) in enumerate([(2, 'yes'), (1, 'partly'), (0, 'no')]):
        harvey(sl, PM + 0.1 + k * 1.1, yl + 0.13, 0.17, lv)
        tb(sl, PM + 0.27 + k * 1.1, yl, 0.8, 0.26, t, size=10, color=SLATE)
    sources(sl, ['Oraan terms, fee calculator and website, 28 Sep 2026', 'JazzCash release note, Aug 2026, and results '
                 'to 31 March 2026'])
    say(sl, 'Side by side, scored full, half or empty. The last row is honest about reach: that is where %s and the '
            'hosts come in.\n\nOraan, the closest competitor, holds members’ money in its own company accounts, keeps '
            'the return on it, charges the first turn up to 21 per cent of the instalment every month, about 54 per '
            'cent a year, pays out net between the 11th and the 18th, carries defaults on its own balance sheet and '
            'reports only defaulters to the bureau.%s\n\nJazzCash launched a committee feature in August 2026. It '
            'rotates, but the pot collects in the organiser’s wallet and the organiser pays out by hand; members are '
            'chosen from phone contacts, there is no way out before the end and no credit record; fees and default '
            'handling are not published. Its advantage is reach: 60 million registered customers.\n\nThe informal '
            'committee usually has no fee, but everything rests on the organiser.'
        % (BN, ' It markets its committees as Shariah compliant on the certificate of a private advisory firm.'
           if not MQ_ else ''))


# ======================================================================= 23 EVIDENCE
def s_evidence():
    sl = new_slide('International Evidence', 'Committee platforms abroad and the institutions behind them')
    tx0, tx1 = PM + 2.55, 8.35
    xy = lambda yr: tx0 + (yr - 2016) * (tx1 - tx0) / 10.0
    for yr in range(2016, 2027):
        tb(sl, xy(yr) - 0.3, 1.66, 0.6, 0.26, str(yr), size=10, color=MUTED, align=CEN)
        vrule(sl, xy(yr), 1.95, 3.45, C('EEF0F2'), 0.75)
    comp = [('Money Fellows', 'Egypt', 2016, [(2025, 'profitable')], '8 million+ users',
             'central bank sandbox; prepaid card with Banque Misr', BLUE),
            ('Hakbah', 'Saudi Arabia', 2018, [(2020, 'launched under a central bank permit')],
             '2 million registered users', 'Saudi central bank sandbox', TEAL),
            ('Esusu', 'United States', 2018, [(2022, 'valued US$1 billion')], 'US$1.2 billion valuation',
             'reports payments to the credit bureaus', TH)]
    if not MQ_:
        comp = [comp[1], comp[0], comp[2]]
    for i, (name, ctry, start, ms, now, how, col) in enumerate(comp):
        y = 2.45 + i * 1.12
        tb(sl, PM, y - 0.26, 2.45, 0.32, name, size=13.5, bold=True, color=INK)
        tb(sl, PM, y + 0.08, 2.45, 0.28, ctry, size=10.5, color=SLATE)
        line(sl, xy(start), y, xy(2026), y, col, 3.5)
        oval(sl, xy(start) - 0.09, y - 0.09, 0.18, col)
        for yr, lb in ms:
            oval(sl, xy(yr) - 0.1, y - 0.1, 0.2, WHITE, line=col, lw=2.0)
            if yr >= 2024:
                tb(sl, xy(yr) - 2.2, y + 0.12, 2.3, 0.28, lb, size=10, color=SLATE, align=R)
            else:
                tb(sl, xy(yr) - 0.1, y + 0.12, 3.6, 0.28, lb, size=10, color=SLATE)
        tb(sl, 8.7, y - 0.3, RX - 8.7, 0.3, now, size=12.5, bold=True, color=INK)
        tb(sl, 8.7, y + 0.03, RX - 8.7, 0.5, how, size=10.5, color=SLATE, spacing=1.02)
    panel(sl, PM, 5.5, PW, 1.2, FAINT)
    tb(sl, PM + 0.22, 5.62, PW - 0.4, 0.3, 'Common pattern', size=12, bold=True, color=INK)
    tb(sl, PM + 0.22, 5.95, PW - 0.4, 0.7, 'Each grew inside the formal system: a central bank sandbox or permit, a '
                                          'partner bank, or reporting to the credit bureaus. The same sequence is '
                                          'proposed with %s.' % BN, size=11.5, color=INK, spacing=1.05)
    sources(sl, ['Daily News Egypt, 20 Oct 2025', 'MENAbytes, 3 Sep 2020; Semafor, 3 Feb 2026', 'CNBC, 11 Dec 2025'])
    say(sl, 'Three companies abroad; each line starts in the year the company started.\n\nMoney Fellows in Egypt, '
            'founded 2016: more than 8 million users, US$1.5 billion of payments and profitable; it entered the '
            'Central Bank of Egypt’s sandbox and runs a prepaid card with Banque Misr.\n\nHakbah in Saudi Arabia, '
            'founded 2018, launched in 2020 only after a permit under the Saudi central bank’s sandbox; more than 2 '
            'million registered users by February 2026.\n\nEsusu in the United States, founded 2018, reports on-time '
            'payments to the credit bureaus; valued at US$1 billion in 2022 and US$1.2 billion in December 2025.\n\n'
            'Each grew by working inside the formal system: a regulator, a bank or the bureaus. That is the sequence '
            'proposed with %s.' % BN)


# ======================================================================= 24 TIMING
def s_timing():
    sl = new_slide('Market Timing', 'Payments in Pakistan have moved to digital channels; committee savings have '
                                    'not')
    xtitle(sl, PM, 1.62, 6.0, 'Share of retail payments made digitally', 'per cent')
    chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, PM - 0.1, 1.95, 6.3, 4.1, ['FY2023', 'FY2024', 'FY2025',
                                                                         'Jan to Mar 2026'],
          [('Digital', [78, 85, 88, 92])], colors=[TH], fmt='0"%"', gap=70, size=11,
          label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=105)
    x0 = 7.1
    cw = (RX - x0) / 2.0
    facts = [('69 million', 'mobile wallet users at the end of 2024 [1]'),
             ('21 million', 'mobile banking app users [1]'),
             ('Aug 2026', 'JazzCash launched a committee feature [2]'),
             ('75% by 2028', 'State Bank target for adults with an account, from 64% [3]')]
    if MQ_:
        facts.append(('26%', 'of adults are financially literate; a committee needs no financial knowledge [4]'))
    else:
        facts.append(('1 Jan 2028', 'the Constitution’s deadline to end riba [4]'))
    facts.append(('2.9 billion', 'banking app payments in January to March 2026 [1]'))
    for i, (n_, t) in enumerate(facts):
        col_, row_ = i % 2, i // 2
        x = x0 + col_ * cw
        y = 1.72 + row_ * 1.6
        stat(sl, x, y, cw - 0.25, n_, t, nsize=22, tsize=11, lh=0.8)
    srcs = ['SBP payment systems reviews, Q2 FY25, FY25 and Q3 FY26', 'JazzCash release notes',
            'SBP National Financial Inclusion Strategy 2024 to 2028']
    srcs.append('S&P Global FinLit Survey' if MQ_ else 'Constitution, Article 38(f), 26th Amendment')
    sources(sl, srcs)
    extra = ('Only about a quarter of adults are financially literate, which is why committees survive: people '
             'understand them without understanding finance.' if MQ_ else
             'The Constitution now requires riba to be eliminated before 1 January 2028. People who have always '
             'chosen the committee because it carries no interest are the natural customers of an Islamic digital '
             'bank.')
    say(sl, 'Why the timing matters. Pakistan moved to digital payments fast: 78 per cent of retail payments were '
            'digital in FY2023 and 92 per cent by January to March 2026, when banking applications handled about 2.9 '
            'billion payments. About 69 million people held a mobile wallet at the end of 2024 and 21 million used '
            'mobile banking. Savings did not follow: the committee is still cash.\n\nThe market is moving. JazzCash '
            'launched a committee feature in August 2026. The first bank to offer a committee held safely, with a '
            'credit record, sets the standard.\n\n%s The State Bank’s strategy targets 75 per cent of adults with an '
            'account by 2028, from 64 per cent, and a smaller gender gap; committee members, more of them women than '
            'men, are that group.' % extra)


# ======================================================================= 25 REGULATION
def s_regulation():
    sl = new_slide('Regulation and Compliance', appx('A6', 'regulation through %s’s licence, with Halqa as its '
                                                           'service provider' % BN))
    bx, by, bw, bh = PM, 1.72, 4.25, 4.95
    rect(sl, bx, by, bw, bh, None, line=INK, lw=1.0)
    tb(sl, bx + 0.18, by + 0.1, bw - 0.3, 0.3, 'State Bank of Pakistan', size=12.5, bold=True, color=INK)
    tb(sl, bx + 0.18, by + 0.4, bw - 0.3, 0.3, 'regulates %s, payments and the PSP' % BN, size=10, color=SLATE)
    rect(sl, bx + 0.3, by + 0.85, bw - 0.6, bh - 1.05, TH_XLT, line=TH, lw=1.25)
    tb(sl, bx + 0.48, by + 0.95, bw - 0.9, 0.3, BFULL, size=12, bold=True, color=INK)
    tb(sl, bx + 0.48, by + 1.25, bw - 0.9, 0.3, 'licence, accounts, payments', size=10, color=SLATE)
    iy = by + 1.72
    sb = 'Raqami’s Shariah Board' if not MQ_ else 'Mashreq’s Shariah Board'
    rect(sl, bx + 0.6, iy, bw - 1.2, 0.72, WHITE, line=TH, lw=1.0,
         paras=[(sb, dict(size=11, bold=True, color=INK)), ('certifies each Islamic product', dict(size=9.5,
                                                                                                   color=SLATE))],
         pad=0.12, anchor=MIDDLE)
    rect(sl, bx + 0.6, iy + 0.92, bw - 1.2, 1.85, LIME_XLT, line=LIME, lw=1.25)
    tb(sl, bx + 0.75, iy + 1.02, bw - 1.5, 0.3, 'Halqa: service provider', size=11.5, bold=True, color=INK)
    tb(sl, bx + 0.75, iy + 1.34, bw - 1.5, 1.4, 'Rules, checks, application and records. Holds no member '
                                                'money. Works under the outsourcing framework, with audit rights for '
                                                '%s and the State Bank.' % BN, size=10.5, color=SLATE, spacing=1.05)
    x0 = 5.2
    cws = [1.7, 2.45, RX - x0 - 1.7 - 2.45]
    hdr = ['Area', 'Rule', 'How it is met']
    rows = [('Member money', 'Only a bank may take deposits (Companies Act 2017, s.84)',
             'Held only by %s; Halqa never receives it' % BN),
            ('Service provider', 'SBP outsourcing framework, 2017, revised 2019',
             'Audit rights, data security and continuity for %s and the State Bank' % BN),
            ('Automatic debit', 'Payment Systems and Electronic Fund Transfers Act 2007, s.35',
             'Member consent in the app; the %s is %s’s' % (B['mandate'], BN)),
            ('Credit reporting', 'Credit Bureaus Act 2015', 'Through %s’s TASDEEQ membership or Halqa as a data '
                                                            'provider' % BN),
            (INS_C, 'Insurance Ordinance 2000: only a licensed operator may insure',
             'Written by an operator %s chooses' % BN),
            ('Product approval', 'State Bank approval or notice', 'Taken to the State Bank by %s' % BN),
            ('Data', 'Customer data protection; outsourcing data controls', 'Results only; hosted in Singapore today, '
                                                                         'moved where %s and the State Bank require'
             % BN),
            ('AML and KYC', 'Anti-Money Laundering Act 2010; State Bank AML regulations',
             'Customer due diligence and screening by %s when the account opens' % BN),
            ('Consumer protection', 'State Bank fair treatment of consumers rules',
             'Full cost shown before signing; 24 hours to withdraw; complaints in the app'),
            ('Continuity', 'Outsourcing framework: contingency and exit plans', 'Money stays at %s; daily backups; '
                                                                               'records exportable to %s' % (BN, BN))]
    x = x0
    for w_, h_ in zip(cws, hdr):
        tb(sl, x, 1.7, w_ - 0.1, 0.3, h_, size=11, bold=True, color=INK)
        x += w_
    rule(sl, x0, 2.02, RX - x0, INK, 0.75)
    rh = 0.465
    for i, row in enumerate(rows):
        y = 2.06 + i * rh
        x = x0
        for c_, (w_, v) in enumerate(zip(cws, row)):
            tb(sl, x, y, w_ - 0.12, rh, v, size=10 if c_ else 10.5, bold=(c_ == 0), color=INK, anchor=MIDDLE,
               spacing=1.0)
            x += w_
        rule(sl, x0, y + rh, RX - x0, LINE_, 0.5)
    tb(sl, PM, 6.72, PW, 0.25, '', size=1)
    sources(sl, ['SBP BPRD Circular No. 06 of 2017 (outsourcing), revised 2019; Companies Act 2017; PS&EFT Act 2007; '
                 'Credit Bureaus Act 2015; Insurance Ordinance 2000'])
    say(sl, 'Regulation, plainly: a system that runs committees with members’ money needs State Bank regulation, and '
            'only a bank may take deposits. The nesting shows how both are met. The State Bank regulates %s, '
            'payments and the payment service provider. %s’s licence covers the accounts and the payments. %s. Halqa '
            'is assessed as %s’s service provider under the State Bank’s outsourcing framework, with audit rights for '
            '%s and the State Bank.\n\nThe table maps each rule to how it is met: member money only at %s; the '
            'outsourcing framework for Halqa’s role; the Payment Systems and Electronic Fund Transfers Act for '
            'automatic debits, where the mandate and its duties are %s’s; the Credit Bureaus Act for reporting; the '
            'Insurance Ordinance for %s, written only by a licensed operator; the product itself taken to the State '
            'Bank through %s for approval or notice; and data kept to results only.'
        % (BN, BN, 'The Islamic structure goes to Raqami’s Shariah Board before launch' if not MQ_ else
           'The Islamic window product goes to its Shariah board', BN, BN, BN, BN, INS, BN))


# ======================================================================= 26 STATUS
def s_status():
    sl = new_slide('Current Status', 'What is built, what is written and what remains before launch')
    cols = [('Built', LIME_XLT, LIME_DK, ['Member application in preview: sign up, circles, automatic payment '
                                         'settings, activity, credit report, Hyper (experimental)',
                                         'Checks: identity, income, affordability and score',
                                         'Payday collection with retries', 'Records, receipts and statements']),
            ('Written', BLUE_XLT, BLUE, ['Legal position checked against twelve laws and regulations',
                                         'Six risk and pricing models', 'Default prevention and recovery design',
                                         'Business model and unit costs']),
            ('To do', TH_XLT, TH, ['Incorporation: private limited company, registered office in Islamabad',
                                   'Agreement with %s' % BN, 'Product approval through %s' % BN,
                                   'Connection to %s’s account, %s and payment interfaces, and the PSP'
                                   % (BN, B['mandate']),
                                   '%s operator and TASDEEQ reporting route' % INS_C])]
    cw = (PW - 2 * 0.35) / 3.0
    for i, (t, fc, bc, items) in enumerate(cols):
        x = PM + i * (cw + 0.35)
        rect(sl, x, 1.72, cw, 0.6, fc, paras=[(t, dict(size=15, bold=True, color=INK))], pad=0.2, anchor=MIDDLE)
        blist(sl, x + 0.05, 2.55, cw - 0.1, 3.5, items, size=13, bcolor=bc, gap=11, spacing=1.06)
    rect(sl, PM, 6.1, PW, 0.62, FAINT, paras=[[('No member money has moved:  ', dict(size=12, bold=True, color=INK)),
                                              ('every payment in the application today is a test record.',
                                               dict(size=12, color=INK))]], pad=0.2, anchor=MIDDLE)
    say(sl, 'Where things stand. Built: the member application, running in preview with sample data: sign up, '
            'circles, automatic payment settings, activity, the credit report and Hyper; the identity, income, '
            'affordability and score checks; payday collection with retries; records, receipts and statements. '
            'Written: a legal position checked against twelve laws and regulations, six risk and pricing models, the '
            'default prevention and recovery design, and the business model.\n\nTo do: incorporate the company, a '
            'private limited company with its registered office in Islamabad; the agreement with %s; product approval '
            'through %s; the connection to %s’s account, %s and payment interfaces and to the PSP; and the %s '
            'operator and the TASDEEQ reporting route. No member money has moved: every payment in the application '
            'today is a test record.' % (BN, BN, BN, B['mandate'], INS))


# -*- coding: utf-8 -*-
# ============================================================================================ VERSION 5 (30 Sep)
# Main story plus appendix; larger app screens (real ones from the preview and generated ones in the app's own kit);
# Hyper labelled Experimental; turn eligibility and recovery folded into Default Prevention; technical-only fixed
# costs (prices checked 30 Sep 2026); Mashreq's direct debit mandate shown as a new line (not public today);
# Mashreq Islamic Current Profit Account up to 2%, instalments held in the Islamic Savings Account (10%);
# Raqami 7 day Mudarabah Certificate 10% (published, August 2026).

SHOTS5 = os.path.join(ME, 'shots_v5')
PH_RATIO = (1170 + 68) / float(2532 + 68)
TECH_FIXED = 60992          # Rs a month at launch: US$208.25 at Rs 290, plus domains (tech_costs.py)
CONTRIB = 352               # Rs a member a month, 25 Sep model with the Rs 15 Hyper fee
BREAK_EVEN = int(round(TECH_FIXED / float(CONTRIB), -1))   # about 170


def framed(png):
    out = png[:-4] + '-framed.png'
    if not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(png):
        from PIL import Image, ImageDraw
        im = Image.open(png).convert('RGB')
        pad, r_out = 34, 150
        W_, H_ = im.width + 2 * pad, im.height + 2 * pad
        fr = Image.new('RGBA', (W_, H_), (0, 0, 0, 0))
        ImageDraw.Draw(fr).rounded_rectangle((0, 0, W_ - 1, H_ - 1), radius=r_out, fill=(27, 31, 24, 255))
        mask = Image.new('L', im.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.width - 1, im.height - 1), radius=r_out - pad, fill=255)
        fr.paste(im, (pad, pad), mask)
        fr = fr.resize((fr.width * 7 // 12, fr.height * 7 // 12), Image.LANCZOS)
        fr.save(out, optimize=True)
    return out


def shot(name):
    p = os.path.join(SHOTS5, BANK, name + '.png')
    return p if os.path.exists(p) else os.path.join(SHOTS5, name + '.png')


def phone_at(sl, name, x, y, h):
    return pic(sl, framed(shot(name)), x, y, h=h)


def appx(code, text):
    return 'Appendix %s · %s' % (code, text)


# ------------------------------------------------------------------------------------------ MONTHLY CYCLE
def s_cycle():
    sl = new_slide('Monthly Cycle', 'One month of a circle of 12 members at Rs 10,000, step by step')
    xs = {'m': 1.45, 'h': 3.65, 'b': 5.9, 't': 8.05}
    heads = [('m', 'Member', 'own %s account' % BN, 'member'), ('h', 'Halqa', 'application, records', 'halqa'),
             ('b', BN, 'accounts, payments', 'bank'), ('t', 'TASDEEQ', 'credit bureau', 'inst')]
    for k, t, sub, kind in heads:
        ebox(sl, xs[k] - 0.86, 1.66, 1.72, 0.6, t, sub, kind, tsize=11.5, bsize=9)
        line(sl, xs[k], 2.26, xs[k], 6.4, LINE_, 1.0, dash=True)
    word = 'mandate' if MQ_ else 'instruction'
    steps = [('m', 'h', 'instr', 'joins and consents'),
             ('h', 'b', 'instr', 'registers the %s' % word),
             ('h', 'm', 'instr', 'reminder before payday'),
             ('h', 'b', 'instr', 'payday: collect instalments'),
             ('m', 'b', 'money', 'Rs 10,000 into the committee account'),
             ('h', 'b', 'instr', 'the 8th: pay the collector'),
             ('b', 'm', 'money', 'Rs 120,000 to the collector, same day'),
             ('b', 'h', 'data', 'confirmed; record updates'),
             ('b', 't', 'data', 'payment records')]
    y0, pit = 2.7, 0.43
    for i, (a, b_, kind, text) in enumerate(steps):
        y = y0 + i * pit
        tb(sl, PM, y - 0.2, 0.3, 0.3, str(i + 1), size=11.5, bold=True, color=TH_DK)
        x1, x2 = xs[a], xs[b_]
        arrow(sl, x1, y, x2, y, kind)
        lo, hi = min(x1, x2), max(x1, x2)
        lab(sl, lo + 0.06, y - 0.28, hi - lo - 0.12, text, size=10, color=INK)
    yr = y0 + 4 * pit
    rect(sl, 6.08, yr - 0.36, 1.8, 0.5, AMBER_LT, paras=[('if a debit fails: a retry each morning, five at most',
                                                           dict(size=8.5, color=INK, align=CEN))], pad=0.04,
         anchor=MIDDLE)
    legend(sl, PM, 6.58, [('money', 'money'), ('instr', 'instruction'), ('data', 'confirmation or record')])
    rx0 = 9.2
    rw = RX - rx0
    ph_h = 3.0
    phone_at(sl, 'm_mandate', rx0 + (rw - ph_h * PH_RATIO) / 2, 1.62, ph_h)
    panel(sl, rx0, 4.78, rw, 1.97, FAINT)
    tb(sl, rx0 + 0.18, 4.86, rw - 0.3, 0.3, 'Ways to pay', size=11.5, bold=True, color=INK)
    blist(sl, rx0 + 0.18, 5.18, rw - 0.3, 1.3,
          [[('Automatic debit: ', dict(bold=True)), ('%s %s (new)' % (BN, B['mandate']), {})],
           [('One-tap approval: ', dict(bold=True)), ('card, wallet or Raast', {})],
           [('Manual: ', dict(bold=True)), ('from any account or wallet', {})],
           [('Wallets and cards: ', dict(bold=True)), ('through a licensed PSP', {})]], size=10, gap=2,
          spacing=1.0)
    tb(sl, rx0 + 0.18, 6.46, rw - 0.3, 0.25, 'Detail: Appendix A2 and A3', size=9, color=MUTED)
    say(sl, 'One month, read top to bottom; each vertical line is one party.\n\nOne, the member joins in the Halqa '
            'application and consents to automatic payment, the screen on the right. Two, Halqa registers the %s '
            'with %s. Three, a reminder the evening before payday, on WhatsApp in Roman Urdu first. Four, on the '
            'member’s payday, learned from the account, Halqa asks %s to collect. Five, %s moves Rs 10,000 from '
            'each member’s account into the committee account; if the salary is late, the debit is retried each '
            'morning, five attempts at most. Six, on the 8th, the due date, Halqa tells %s who collects. Seven, %s '
            'pays Rs 120,000 into the collector’s account the same day. Eight, %s confirms and the record updates. '
            'Nine, payment records go to TASDEEQ, reported by %s or by Halqa as a data provider, as %s decides.\n\n'
            'Ways to pay: the automatic debit is the default on circles between strangers; members can also approve '
            'a card, wallet or Raast request in one tap, or pay by hand. Money in a JazzCash or Easypaisa wallet or '
            'on a card comes in through a licensed payment service provider and settles at %s, never at Halqa. '
            'Appendix A2 and A3 have the detail. %s'
        % (B['mandate'], BN, BN, BN, BN, BN, BN, BN, BN, BN,
           'Mashreq does not publish a direct debit service today, so the mandate is one of the new lines we ask '
           'Mashreq to add.' if MQ_ else 'Raqami does not publish a standing instruction service today, so it is one '
                                         'of the new lines we ask Raqami to add, on its planned open APIs.'))


# ------------------------------------------------------------------------------------ MEMBER APPLICATION
def _app_slide(head, sub, items, notes):
    sl = new_slide(head, sub)
    cw = PW / 4.0
    ph_h = 4.3
    for i, (nm, t, d) in enumerate(items):
        x = PM + i * cw
        pw_ = ph_h * PH_RATIO
        px = x + (cw - pw_) / 2
        phone_at(sl, nm, px, 1.55, ph_h)
        tb(sl, px - 0.05, 5.95, cw - 0.2, 0.32, [[('%d   ' % (i + 1), dict(size=13, bold=True, color=TH_DK)),
                                                  (t, dict(size=13, bold=True, color=INK))]])
        tb(sl, px - 0.05, 6.3, max(pw_ + 0.45, 2.4), 0.62, d, size=10.5, color=SLATE, spacing=1.03)
    say(sl, notes)
    return sl


def s_app_join():
    n_types = 'six types' if MQ_ else 'five types'
    _app_slide('Member Application: Joining',
               'Choosing a circle, seeing the full cost, opening the %s account and consenting to payment' % BN,
               [('m_types', 'Choose a circle', 'The %s; Hyper is experimental.' % n_types),
                ('m_join', 'See the full cost', 'Shown before signing; 24 hours to withdraw.'),
                ('m_open', 'Open the %s account' % BN, '%s’s own checks, inside Halqa.' % BN),
                ('m_mandate', 'Consent to payment', 'One instalment at most, on payday.')],
               'How a member joins, in four screens. One, choose the kind of circle: %s, from known circles to '
               'circles between strangers, with Hyper marked experimental. Two, the full cost is shown before '
               'signing: the instalment, the %s and the fee, with 24 hours to withdraw at no cost. Three, the %s '
               'account opens inside Halqa through %s’s own checks. Four, the member consents to automatic payment: '
               'one instalment at most each time, on payday, with retries until the 8th.' % (n_types, INS, BN, BN))


def s_app_use():
    _app_slide('Member Application: Paying and Collecting',
               'The circle, every payment and payout, the credit record and the points',
               [('committee', 'Follow the circle', 'Turn order, who has paid, when the pot comes.'),
                ('activity', 'Payments and payouts', 'A receipt for each; the pot arrives the same day.'),
                ('credit', 'Credit record', 'Score from 300 to 850 and on-time history.'),
                ('m_points', 'Points', 'Profit on balances and on-time payments.')],
               'After joining. One, the circle screen shows the turn order, who has paid and when the pot comes. '
               'Two, every instalment and payout has a receipt, and the pot arrives the same day. Three, the credit '
               'report shows the score from 300 to 850 and the on-time history that is reported to TASDEEQ. Four, '
               'points: the profit on the committee balance and on-time payments, one point for each rupee. The first '
               'three screens are from the working preview; account opening, consent, types, full cost, Hyper and '
               'points are designs for the partnership.')


# ------------------------------------------------------------------------------------------ PRODUCTS
def s_products():
    sl = new_slide('%s Products Used' % BN, 'Existing products at each step of a committee, and three new lines')
    if MQ_:
        steps = [('Open', 'NEO account and debit card', 'in about five minutes'),
                 ('Salary in', 'Islamic Current Profit Account', 'profit on the daily balance, up to 2%'),
                 ('Held until the 8th', 'Islamic Savings Account', 'the committee balance; 10% below Rs 1.5 million'),
                 ('Payout', 'Free instant transfer', 'the pot, the same day'),
                 ('Abroad', 'Mashreq Pakistan Account', 'families in the UAE')]
        new = [(1, 'Direct debit mandate', 'collects each instalment on payday'),
               (2, 'Takaful or insurance', 'circles between strangers; Mashreq chooses the operator'),
               (3, 'Asset financing', 'ijarah for motorcycles and machines')]
        src = ['Mashreq NEO Pakistan product pages, rate sheets and schedule of charges (July to December 2026), read '
               '30 September 2026; rates are up to or indicative figures']
    else:
        steps = [('Open', 'Asaan Digital Account', 'CNIC and mobile number'),
                 ('Salary in', 'Mudarabah Savings Account', '10.5% in August 2026'),
                 ('Held until the 8th', '7 day Mudarabah Certificate', '10% in August 2026'),
                 ('Payout', 'Free Raqami transfer', 'the pot, the same day'),
                 ('Cash in', 'Askari Bank branches', 'free cash deposits at 700+')]
        new = [(1, 'Standing instruction', 'debit on payday, on Raqami’s planned open APIs'),
               (2, 'Committee takaful', 'with EFU window takaful, Raqami’s partner'),
               (3, 'Asset financing', 'ijarah for motorcycles and machines')]
        src = ['Raqami products page, FAQ, home page and Historical Profit Rates (August 2026), read 30 September 2026']
    n = len(steps)
    cw = PW / float(n)
    yl = 2.62
    line(sl, PM + cw / 2, yl, RX - cw / 2, yl, TH, 4.0)
    xs = []
    for i, (st_, prod, det) in enumerate(steps):
        xc = PM + cw * (i + 0.5)
        xs.append(xc)
        tb(sl, xc - cw / 2, 1.78, cw, 0.35, st_, size=13, bold=True, color=INK, align=CEN)
        oval(sl, xc - 0.13, yl - 0.13, 0.26, WHITE, line=TH, lw=2.5)
        ebox(sl, xc - 1.05, 2.95, 2.1, 0.78, prod, None, 'bank', tsize=11.5)
        tb(sl, xc - cw / 2 + 0.1, 3.82, cw - 0.2, 0.55, det, size=10.5, color=SLATE, align=CEN, spacing=1.03)
    yb = 4.72
    tb(sl, PM, yb - 0.17, 1.5, 0.34, 'New lines', size=13, bold=True, color=INK)
    path(sl, [(PM + 1.55, yb), (RX - 0.1, yb)], TEAL, 2.5, dash=True)
    for idx, t, d in new:
        xc = xs[idx]
        oval(sl, xc - 0.11, yb - 0.11, 0.22, WHITE, line=TEAL, lw=2.0)
        ebox(sl, xc - 1.05, yb + 0.3, 2.1, 1.2, t, d, 'ins', tsize=11.5, bsize=10)
    legend(sl, PM, 6.5, [((TH_XLT, TH), 'existing %s product' % BN), ((TEAL_XLT, TEAL), 'new line')])
    tb(sl, 5.6, 6.48, RX - 5.6, 0.3, 'Profit on the committee balance returns to members as points (Appendix A5).',
       size=10, color=SLATE, align=R)
    sources(sl, src)
    if MQ_:
        say(sl, 'For the product team: most steps use a product Mashreq already has.\n\nThe account opens inside the '
                'Halqa application through Mashreq’s own onboarding, with a PayPak or Mastercard debit card, in about '
                'five minutes. Salary lands in the member’s own account; the Islamic Current Profit Account pays '
                'profit on the daily closing balance, up to 2 per cent today. Between payday and the 8th, about a '
                'week, the instalments are held as the committee balance in an Islamic Savings Account, 10 per cent '
                'indicative on balances below Rs 1.5 million, and that profit returns to members as points at the end '
                'of the circle. The payout is a free instant transfer. Families in the UAE join through the Mashreq '
                'Pakistan Account.\n\nThree new lines: a direct debit mandate, which Mashreq does not publish today '
                'for Pakistan; takaful or insurance for circles between strangers, with an operator Mashreq chooses; '
                'and ijarah financing for motorcycles and machines bought through asset circles.')
    else:
        say(sl, 'For the product team: most steps use a product Raqami already has.\n\nThe Asaan Digital Account '
                'opens inside the Halqa application on a CNIC and a registered mobile number. Salary lands in the '
                'Mudarabah Savings Account, 10.5 per cent in August 2026 on the digital tiers up to Rs 1 million. For '
                'the week between payday and the 8th the instalments sit in a 7 day Mudarabah Certificate, the '
                'Flexi-Week, 10 per cent in August 2026, and that profit returns to members as points. The payout is a '
                'free Raqami transfer. Members who earn in cash deposit it free at more than 700 Askari Bank '
                'branches.\n\nThree new lines: a standing instruction for automatic debit, on the open APIs Raqami '
                'plans, since its public pages list no recurring debit today; committee takaful with EFU window '
                'takaful; and ijarah financing for motorcycles and machines.')


# ------------------------------------------------------------------------------------------- TYPES
_s_types_base = s_types


def s_types():
    _s_types_base()
    sl = prs.slides[len(prs.slides) - 1]
    n = 6 if MQ_ else 5
    cwt = (PW - 2.25) / n
    x = PM + 2.25 + (n - 1) * cwt
    rect(sl, x + 0.03, 1.36, cwt - 0.06, 0.28, AMBER, paras=[('Experimental', dict(size=10.5, bold=True,
                                                                                    color=INK, align=CEN))],
         pad=0.02, anchor=MIDDLE)


# ----------------------------------------------------------------------------- DEFAULT PREVENTION (merged)
def s_prevention():
    sl = new_slide('Default Prevention', 'Controls at every stage, and early turns only for proven members')
    stages = [('Before joining', BLUE, ['Identity, income and affordability checks', 'The score decides which turns '
                                                                                     'open',
                                        'The host admits each member']),
              ('At joining', TEAL, ['Full cost shown; 24 hours to withdraw', 'Undertaking and mutual guarantee',
                                    '%s and autopay; %s on circles between strangers' % (B['mandate_c'], INS)]),
              ('Each instalment', TH, ['Reminder the evening before payday', 'Debit on payday; five retries at most',
                                       'Due on the 8th']),
              ('After a missed payment', AMBER, ['Arrears taken from the member’s own pot',
                                                 'Late charges 2%, 5%, 10%; score down 10, 20, 40',
                                                 'Daily circles: 5%, 10%, 15% at 12, 36, 60 hours'])]
    ov = 0.18
    cw = (PW + 3 * ov) / 4
    y0 = 1.68
    for i, (t, col, items) in enumerate(stages):
        x = PM + i * (cw - ov)
        s = shape(sl, SH.PENTAGON if i == 0 else SH.CHEVRON, x, y0, cw, 0.52, col,
                  paras=[(t, dict(size=12, bold=True, color=text_on(col), align=CEN))], pad=0.05, anchor=MIDDLE)
        s.adjustments[0] = 0.28
        bx = PM + i * (cw - ov) + (0.25 if i > 0 else 0.05)
        blist(sl, bx, y0 + 0.66, cw - ov - 0.3, 1.9, items, size=11, bcolor=col, gap=4, spacing=1.03)
    rule(sl, PM, 4.08, PW, LINE_, 0.75)
    xtitle(sl, PM, 4.18, 6.6, 'Still owed after collecting', 'Rs thousand, by turn, circle of 12 at Rs 10,000')
    vals = [10 * (12 - k) for k in range(1, 13)]
    pc = [LV[2]] * 6 + [LV[1]] * 3 + [LV[0]] * 3
    chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, PM - 0.1, 4.42, 6.75, 1.72, [str(k) for k in range(1, 13)],
          [('Rs thousand', vals)], point_colors=pc, fmt='0', gap=40, size=9.5,
          label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=130)
    plot_x0, plot_w = PM + 0.08, 6.45
    colw = plot_w / 12.0
    for a_, b_, lb in [(1, 6, 'Turns 1 to 6: score 650 or more'), (7, 9, '7 to 9: 550 or more'),
                       (10, 12, '10 to 12: any score')]:
        xa = plot_x0 + (a_ - 1) * colw + 0.04
        xb_ = plot_x0 + b_ * colw - 0.04
        yb_ = 6.2
        line(sl, xa, yb_, xb_, yb_, SLATE, 0.75)
        line(sl, xa, yb_ - 0.07, xa, yb_, SLATE, 0.75)
        line(sl, xb_, yb_ - 0.07, xb_, yb_, SLATE, 0.75)
        tb(sl, xa, yb_ + 0.03, xb_ - xa, 0.3, lb, size=9.5, color=INK, align=CEN, spacing=1.0)
    tb(sl, PM, 6.52, 6.7, 0.26, 'New members start in the last three turns until two circles complete cleanly.',
       size=10, color=SLATE)
    rx0 = 7.75
    rw = RX - rx0
    tb(sl, rx0, 4.18, rw, 0.3, 'If a member stops after collecting', size=12, bold=True, color=INK)
    rec = [('1', 'Contact and a hardship plan', AMBER), ('2', 'Account restricted; score down 200', AMBER),
           ('3', '%s pays the members left short' % INS_C, TEAL), ('4', 'Mutual guarantee: the balance falls due',
                                                                   RED),
           ('5', 'Civil suit on the undertaking', RED), ('6', 'Summary suit, only on a guarantee cheque', RED)]
    for i, (n_, t, col) in enumerate(rec):
        y = 4.55 + i * 0.33
        rect(sl, rx0, y + 0.05, 0.22, 0.22, col, paras=[(n_, dict(size=9, bold=True, color=text_on(col),
                                                                  align=CEN))], pad=0, anchor=MIDDLE)
        tb(sl, rx0 + 0.32, y, rw - 0.35, 0.32, t, size=10.5, color=INK, anchor=MIDDLE)
    tb(sl, rx0, 6.52, rw, 0.26, 'Recovery detail: Appendix A4', size=10, color=MUTED)
    sources(sl, ['Default Prevention (HQ-CP-05); seat bands confirmed mandatory 28 September 2026; State Bank 40 per '
                 'cent limit, BPRD Circular Letter 29 of 2021'])
    say(sl, 'Default prevention, in the order a member meets it, and the one rule that carries most of the risk.\n\n'
            'Before joining: identity, income and affordability checks, the score decides which turns open, and the '
            'host admits each member; no member holds more than six circles and one daily circle. At joining: every '
            'rupee owed is shown before signing, with 24 hours to withdraw; the member signs a ten clause undertaking '
            'and a mutual guarantee and consents to the %s; %s applies on circles between strangers. Each '
            'instalment: a reminder the evening before payday, the debit on payday with a retry each morning, five '
            'at most, and the due date on the 8th. After a missed payment: arrears come out of the member’s own pot '
            'on their turn; late charges of 2, 5 and 10 per cent%s with score falls of 10, 20 and 40; daily circles '
            '5, 10 and 15 per cent at 12, 36 and 60 hours.\n\nThe chart is the whole default risk: the member who '
            'collects in turn one of twelve still owes Rs 110,000; the member in turn twelve owes nothing. So turns '
            'one to six need a score of 650 or more, seven to nine need 550, and the last three are open to anyone; '
            'every new member starts in the last three until two circles complete cleanly. The bands are mandatory.'
            '\n\nIf a member stops after collecting: contact first, then restriction; the %s operator pays the '
            'members left short in full while recovery continues through the mutual guarantee, a civil suit, and a '
            'summary suit only where a guarantee cheque is held. Never relatives, contact lists or published names.'
        % (B['mandate'], INS, ', paid to charity' if not MQ_ else '', INS))


# ------------------------------------------------------------------------------------------- REVENUE
def s_revenue():
    sl = new_slide('Revenue and Business Model', 'How one instalment is split, where Halqa’s income comes from and '
                                                 'its technical running cost')
    xtitle(sl, PM, 1.62, 5.6, 'One instalment on a circle between strangers', 'Rs')
    tb(sl, PM, 1.92, 5.6, 0.26, 'The member pays Rs 11,047', size=10.5, color=SLATE)
    sx, sw, sy0, sh = PM + 0.02, 0.16, 2.3, 2.4
    k_ = sh / 11047.0
    parts = [(10000, BLUE, BLUE_LT, 2.2), (547, TEAL, TEAL_LT, 4.62), (500, TH, TH_LT, 4.92)]
    tx = 2.75
    ya = sy0
    rect(sl, sx, sy0, sw, sh, INK)
    for v, ncol, bcol, ty_ in parts:
        hh = v * k_
        band(sl, sx + sw, ya, ya + hh, tx, ty_, ty_ + hh, bcol)
        rect(sl, tx, ty_, sw, hh, ncol)
        ya += hh
    cyc = 2.2 + 10000 * k_ / 2
    tb(sl, tx + 0.3, cyc - 0.42, 3.3, 0.4, 'Rs 10,000', size=18, bold=True, color=INK)
    tb(sl, tx + 0.3, cyc, 3.2, 0.3, 'to the member collecting', size=11, color=SLATE)
    tb(sl, tx + 0.3, 4.53, 3.5, 0.3, [[('Rs 547  ', dict(size=11, bold=True, color=INK)),
                                       ('%s' % INS, dict(size=11, color=SLATE))]])
    tb(sl, tx + 0.3, 4.83, 3.6, 0.5, [[('up to Rs 500  ', dict(size=11, bold=True, color=INK)),
                                      ('fee to %s, shared with Halqa' % BN, dict(size=11, color=SLATE))]],
       spacing=1.02)
    x0 = 6.85
    xtitle(sl, x0, 1.62, RX - x0, 'Technical cost and contribution by members', 'Rs thousand a month')
    ms = list(range(0, 601, 50))
    cats = ['{:,}'.format(m) for m in ms]
    ch = chart(sl, XL_CHART_TYPE.LINE, x0 - 0.1, 1.92, RX - x0 + 0.15, 3.0, cats,
               [('Contribution after running costs', [round(CONTRIB * m / 1000.0, 1) for m in ms]),
                ('Fixed technical cost', [round(TECH_FIXED / 1000.0, 1)] * len(ms))], colors=[LIME_DK, SLATE],
               labels=False, legend=True, size=10, val_axis=True, grid=True, vmin=0, vmax=225, val_fmt='0',
               line_w=2.25)
    ch.value_axis.major_unit = 50
    ch.category_axis.tick_labels.font.size = Pt(9)
    tb(sl, x0 + 0.55, 2.62, 2.8, 0.3, 'Break-even: about %d members' % BREAK_EVEN, size=10.5, bold=True,
       color=INK)
    tb(sl, x0, 4.95, RX - x0, 0.28, 'Active members', size=9.5, color=MUTED, align=CEN)
    by = 5.45
    cw2 = (PW - 0.45) / 2.0
    tb(sl, PM, by, cw2, 0.3, 'Income lines', size=12, bold=True, color=INK)
    tb(sl, PM, by + 0.34, cw2, 1.1, [[('Now:  ', dict(size=11, bold=True, color=INK)),
                                      ('a share of the fee %s collects; a share of %s’s income on committee balances'
                                       % (BN, BN), dict(size=11, color=INK))],
                                     ([('Later:  ', dict(size=11, bold=True, color=INK)),
                                       ('asset financing referrals (2 to 4% from the financier, 1 to 3% from the '
                                        'dealer); marketplace commission on points; employer programmes',
                                        dict(size=11, color=INK))], dict(before=4))], spacing=1.04)
    ux = PM + cw2 + 0.45
    tb(sl, ux, by, cw2, 0.3, 'Unit costs', size=12, bold=True, color=INK)
    ue = [('Rs 13 to 35', 'to run one payment'), ('Rs %s' % format(int(round(TECH_FIXED, -3)), ','),
                                                  'fixed technical cost a month'),
          ('About Rs %d' % int(round(CONTRIB, -1)), 'contribution a member a month')]
    uw = cw2 / 3.0
    for i, (n_, t) in enumerate(ue):
        stat(sl, ux + i * uw, by + 0.34, uw - 0.15, n_, t, nsize=15, tsize=10, lh=0.5)
    sources(sl, ['Technical prices read 30 September 2026: Vercel, Supabase, Sentry, Google Workspace, Apple; US$1 = '
                 'Rs 290 on a card (interbank Rs 277.3 on 29 September)', 'Business Model and Unit Costs (HQ-CP-03), '
                 'updated for the Rs 15 Hyper fee; before the bank’s terms'])
    say(sl, 'How the money moves and how Halqa earns. Left, drawn to scale: the member pays Rs 11,047 on a circle '
            'between strangers: Rs 10,000 to whoever is collecting, Rs 547 of %s, and up to Rs 500 of fee. %s '
            'collects the fee as its own income and pays Halqa an agreed share. Halqa’s revenue is a share of what '
            '%s earns, never money held.\n\nRight: the fixed cost is technical only, as decided: hosting on Vercel, '
            'the Supabase database with point in time recovery and a staging copy, Sentry error monitoring, Google '
            'Workspace mail and the Apple developer account, about US$208 or Rs 61,000 a month at launch. Salaries, '
            'counsel and an office are excluded; the earlier Rs 1.32 million included two engineers, an operations '
            'lead, counsel, an accountant, an audit and six office desks. Each active member contributes about Rs '
            '350 a month after running costs in the 25 September model updated for the Rs 15 Hyper fee, so the '
            'technical cost is covered at about %d active members. Running one payment costs Rs 13 to 35, mostly '
            'WhatsApp messages and checks.' % (INS, BN, BN, BREAK_EVEN))


# ------------------------------------------------------------------------------------ APPENDIX: HYPER
_s_hyper_base = s_hyper


def s_hyper():
    _s_hyper_base()
    sl = prs.slides[len(prs.slides) - 1]
    # the base slide's controls panel sits at x 7.35; the phone replaces its right part
    for shp in list(sl.shapes):
        if shp.left >= E(7.3) and shp.top >= E(1.6) and shp.top < E(6.9):
            shp._element.getparent().remove(shp._element)
    ph_h = 4.55
    pw_ = ph_h * PH_RATIO
    phone_at(sl, 'm_hyper', RX - pw_, 1.62, ph_h)
    cx0, cw_ = 7.3, RX - pw_ - 7.3 - 0.25
    tb(sl, cx0, 1.66, cw_, 0.3, 'Controls', size=12.5, bold=True, color=INK)
    ctl = ['Label: experimental', 'Income: Rs 1,000 or more on 5 days a week for 8 weeks', 'Check level 3',
           'Automatic debit required', 'One daily circle per member',
           'Late: 5%%, 10%%, 15%% at 12, 36, 60 hours%s' % (', to charity' if not MQ_ else ''),
           'New days stop when losses would exceed the %s limit' % INS, 'Limits agreed with %s' % BN]
    blist(sl, cx0, 2.02, cw_, 4.6, ctl, size=10.5, bcolor=AMBER, gap=4)


# ------------------------------------------------------------------------------------ APPENDIX: WALLETS AND PSP
_s_psp_base = s_psp


def s_psp():
    _s_psp_base()
    sl = prs.slides[len(prs.slides) - 1]
    # remove the base slide's process text column (x >= 9.0, below the payout box) and put the phone there
    for shp in list(sl.shapes):
        if shp.left >= E(8.95) and shp.top >= E(3.6) and shp.top < E(6.9):
            shp._element.getparent().remove(shp._element)
    ph_h = 3.05
    pw_ = ph_h * PH_RATIO
    phone_at(sl, 'm_methods', 9.0, 3.62, ph_h)
    tx = 9.0 + pw_ + 0.2
    stp = [('Link', 'wallet or card linked once; the PSP keeps the token'),
           ('Collect', 'on payday, under the member’s consent'),
           ('Settle', 'into the committee account at %s' % BN),
           ('Confirm', 'Halqa records and reconciles daily')]
    yy = 3.66
    for i, (t, d) in enumerate(stp):
        tb(sl, tx, yy, RX - tx, 0.72, [[('%d  %s  ' % (i + 1, t), dict(size=10, bold=True, color=TH_DK)),
                                        (d, dict(size=10, color=INK))]], spacing=1.02)
        yy += 0.74


# -*- coding: utf-8 -*-
# ============================================================================================ VERSION 7 (30 Sep)
# The chairman found version 6 (icon tiles) too informal. Back to the version 5 boxes and wording, with his own edits
# of 30 September applied to both banks and the logos in place of party names; kept from version 6: all text black,
# charts drawn as shapes and the redrawn instalment split. Fee now Rs 85 a monthly instalment (running cost of one
# payment, at most Rs 35, plus Rs 50); PSP service fee 1.5 per cent of the instalment; the takaful or insurance fee
# is named without an amount and is not part of the fee.

UMC = os.path.join(ME, 'user_media', 'clean')


def UA(n):
    return os.path.join(UMC, n)


TASDEEQ_WORD = UA('tasdeeq_word.png')
TASDEEQ_WIDE = UA('tasdeeq_wide.png')
BANK_LOGO = UA('mashreq_logo.png' if MQ_ else 'raqami_logo.png')
BANK_HEAD = UA('mashreq_icon.png' if MQ_ else 'raqami_logo.png')
ACCOUNT_TILE = UA('neo_tile.png' if MQ_ else 'raqami_tile.png')
DUO = UA('duo_mashreq.png' if MQ_ else 'duo_raqami.png')
AXIS, GRID, SOFT = C('9CA3AF'), C('E5E7EB'), C('EDEFF2')
FEE, OP_MAX, PSP_RATE = 85, 35, 0.015
MARGIN = FEE - OP_MAX                                        # Rs 50 a monthly instalment
BREAK_EVEN7 = int(round(TECH_FIXED / float(MARGIN), -1))     # about 1,220

_V5 = dict(committee=s_committee, structure=s_structure, cycle=s_cycle, growth=s_growth, credit=s_credit,
           products=s_products, onboarding=s_onboarding, prevention=s_prevention, revenue=s_revenue,
           comparison=s_comparison, evidence=s_evidence, timing=s_timing, status=s_status, regulation=s_regulation)


def notes_v5(key):
    """Speaker notes of the version 5 slide, unchanged: the slide is built, its notes read, and the slide removed."""
    num0 = NUM[0]
    _V5[key]()
    lst = prs.slides._sldIdLst
    sid = lst[-1]
    txt = prs.slides[len(prs.slides) - 1].notes_slide.notes_text_frame.text
    rid = sid.rId
    lst.remove(sid)
    prs.part.drop_rel(rid)
    NUM[0] = num0
    return txt


_ISZ = {}


def isize(p):
    if p not in _ISZ:
        from PIL import Image
        _ISZ[p] = Image.open(p).size
    return _ISZ[p]


def fit_pic(sl, p, x, y, w, h, ha='c', va='m'):
    """A picture fitted inside the box x, y, w, h, keeping its proportions. Returns its bounds."""
    iw, ih = isize(p)
    s = min(w / float(iw), h / float(ih))
    pw_, ph_ = iw * s, ih * s
    px = x + (w - pw_) / 2 if ha == 'c' else (x if ha == 'l' else x + w - pw_)
    py = y + (h - ph_) / 2 if va == 'm' else (y if va == 't' else y + h - ph_)
    pic(sl, p, px, py, h=ph_, w=pw_)
    return px, py, pw_, ph_


def ebox_logo(sl, x, y, w, h, logo, body=None, kind='bank', logo_h=0.3, bsize=10.5, lw=1.25):
    """A diagram box of its kind with the party's logo in place of its name, the description below it."""
    fillc, linec = KIND[kind]
    rect(sl, x, y, w, h, fillc, line=linec, lw=lw)
    lines = 0
    if body:
        lines = max(1, int(math.ceil(len(body) * bsize * 0.0063 / (w - 0.2))))
    body_h = lines * bsize * 1.22 / 72.0
    top = y + (h - (logo_h + (0.03 + body_h if body else 0))) / 2
    px, py, pw_, ph_ = fit_pic(sl, logo, x + 0.1, top, w - 0.2, logo_h)
    if body:
        tb(sl, x + 0.08, top + logo_h + 0.03, w - 0.16, body_h + 0.05, body, size=bsize, color=INK, align=CEN,
           spacing=1.02)


# ------------------------------------------------------------------------------ charts drawn as shapes
def col_chart(sl, x, y, w, h, cats, vals, colors, fmt, vmax, gap=0.42, lsize=10, csize=10):
    """Columns from a baseline, value above each column, category below: no chart object."""
    n = len(vals)
    slot = w / float(n)
    bw = slot * (1 - gap)
    for i, v in enumerate(vals):
        bh = h * v / float(vmax)
        bx = x + i * slot + (slot - bw) / 2
        if bh > 0.005:
            rect(sl, bx, y + h - bh, bw, bh, colors[i])
        tb(sl, bx - 0.25, y + h - bh - 0.27, bw + 0.5, 0.25, fmt(v), size=lsize, color=INK, align=CEN)
        tb(sl, x + i * slot - 0.1, y + h + 0.06, slot + 0.2, 0.26, cats[i], size=csize, color=INK, align=CEN)
    line(sl, x, y + h, x + w, y + h, AXIS, 1.0)


def hbar_chart(sl, x, y, w, h, cats, vals, colors, fmt, vmax, lab_w=2.3, size=10.5, thick=0.6):
    n = len(vals)
    slot = h / float(n)
    bx0 = x + lab_w + 0.08
    span = w - lab_w - 0.08 - 0.6
    for i, v in enumerate(vals):
        yy = y + i * slot
        bh = slot * thick
        tb(sl, x, yy, lab_w - 0.06, slot, cats[i], size=size, color=INK, align=R, anchor=MIDDLE, spacing=1.0)
        bl = span * v / float(vmax)
        rect(sl, bx0, yy + (slot - bh) / 2, bl, bh, colors[i])
        tb(sl, bx0 + bl + 0.07, yy, 0.6, slot, fmt(v), size=size, color=INK, anchor=MIDDLE)
    line(sl, bx0, y, bx0, y + h, AXIS, 1.0)


def line_chart(sl, x, y, w, h, cats, series, vmin, vmax, step, lab_w=0.5, size=9.5, lw=2.25):
    """series: [(name, values, colour)]; legend on top, gridlines, values left, categories below."""
    lx = x + lab_w
    for name, vals, col in series:
        line(sl, lx, y + 0.13, lx + 0.36, y + 0.13, col, lw)
        oval(sl, lx + 0.125, y + 0.075, 0.11, col, line=WHITE, lw=0.75)
        tb(sl, lx + 0.44, y, 1.0, 0.26, name, size=size + 0.5, color=INK)
        lx += 0.44 + len(name) * 0.085 + 0.35
    px0, px1 = x + lab_w, x + w
    py0, py1 = y + 0.45, y + h - 0.3

    def Y(v):
        return py0 + (vmax - v) * (py1 - py0) / float(vmax - vmin)

    v = vmin
    while v <= vmax:
        line(sl, px0, Y(v), px1, Y(v), AXIS if v == 0 else GRID, 1.0 if v == 0 else 0.75)
        tb(sl, x, Y(v) - 0.12, lab_w - 0.1, 0.24, '{:,}'.format(v), size=size, color=INK, align=R)
        v += step
    n = len(cats)
    xs = [px0 + (i + 0.5) * (px1 - px0) / n for i in range(n)]
    for i, c_ in enumerate(cats):
        tb(sl, xs[i] - 0.25, py1 + 0.06, 0.5, 0.24, c_, size=size, color=INK, align=CEN)
    for name, vals, col in series:
        path(sl, [(xs[i], Y(v_)) for i, v_ in enumerate(vals)], col, lw)
        for i, v_ in enumerate(vals):
            oval(sl, xs[i] - 0.055, Y(v_) - 0.055, 0.11, col, line=WHITE, lw=0.75)


def drop_charts(sl):
    for shp in list(sl.shapes):
        if getattr(shp, 'has_chart', False) and shp.has_chart:
            shp._element.getparent().remove(shp._element)


def last_slide():
    return prs.slides[len(prs.slides) - 1]


# ======================================================================= COMMITTEE, GROWTH, TIMING, PREVENTION
def s_committee():
    _V5['committee']()
    sl = last_slide()
    drop_charts(sl)
    cx0 = 5.55
    t1 = [120 - 10 * m for m in range(1, 13)]
    t12 = [-10 * m for m in range(1, 12)] + [0]
    line_chart(sl, cx0, 1.97, RX - cx0, 3.13, [str(m) for m in range(1, 13)],
               [('Turn 1', t1, TH), ('Turn 12', t12, BLUE)], -120, 120, 60)


def s_growth():
    _V5['growth']()
    sl = last_slide()
    drop_charts(sl)
    x0 = 6.85
    hbar_chart(sl, x0, 1.98, RX - x0, 2.3, ['%s, 30 June 2026' % BN, 'Added by 100,000 members',
                                            'Added by 1,000,000 members'],
               [B['today'], B['add100'], B['add1m']], [TH, LIME, LIME], lambda v: '%.1f' % v, B['add1m'])


def s_timing():
    _V5['timing']()
    sl = last_slide()
    drop_charts(sl)
    col_chart(sl, PM + 0.15, 2.35, 5.9, 3.35, ['FY2023', 'FY2024', 'FY2025', 'Jan to Mar 2026'], [78, 85, 88, 92],
              [TH] * 4, lambda v: '%d%%' % v, 100, gap=0.45, lsize=11, csize=11)


def s_prevention():
    _V5['prevention']()
    sl = last_slide()
    drop_charts(sl)
    vals = [10 * (12 - k) for k in range(1, 13)]
    pc = [LV[2]] * 6 + [LV[1]] * 3 + [LV[0]] * 3
    col_chart(sl, PM + 0.08, 4.8, 6.45, 1.02, [str(k) for k in range(1, 13)], vals, pc, lambda v: '%d' % v, 110,
              gap=0.3, lsize=9, csize=9.5)


# ======================================================================= STRUCTURE
def s_structure():
    notes = notes_v5('structure')
    sl = new_slide('Proposed Structure', 'Halqa runs the committee system; %s holds and moves the money under '
                                         'State Bank regulation' % BN)
    hx, bx, bw = 3.2, 3.2, 2.75
    ebox_logo(sl, hx, 1.75, bw, 0.85, LOGO, 'committee system: rules, turns, checks, records', 'halqa', logo_h=0.3)
    ebox_logo(sl, bx, 3.6, bw, 0.95, BANK_LOGO, 'accounts, collection, payouts, profit', 'bank',
              logo_h=0.5 if MQ_ else 0.42)
    ebox(sl, PM, 3.6, 1.75, 0.95, 'Members', 'each with a %s account' % BN, 'member')
    ebox(sl, 6.7, 3.6, 1.75, 0.95, 'Licensed PSP', 'wallet and card payments', 'pay')
    ebox(sl, 6.7, 5.05, 1.75, 0.95, '%s operator' % INS_C, 'pays claims', 'ins', tsize=11.5)
    ebox_logo(sl, bx, 5.5, bw, 0.7, TASDEEQ_WIDE, 'licensed credit bureau', 'inst', logo_h=0.26)
    # money
    arrow(sl, 2.35, 3.83, bx, 3.83, 'money')
    lab(sl, 2.35, 3.53, 0.85, 'instalments', size=9.5, color=SLATE)
    arrow(sl, bx, 4.3, 2.35, 4.3, 'money')
    lab(sl, 2.35, 4.34, 0.85, 'pots', size=9.5, color=SLATE)
    arrow(sl, 6.7, 4.07, bx + bw, 4.07, 'money')
    lab(sl, 5.95, 3.76, 0.8, 'payments', size=9.5, color=SLATE)
    arrow_path(sl, [(bx + bw, 4.4), (6.35, 4.4), (6.35, 5.52), (6.7, 5.52)], 'money')
    lab(sl, 5.3, 4.62, 1.0, 'contributions', size=9.5, color=SLATE, align=R)
    arrow_path(sl, [(7.57, 6.0), (7.57, 6.4), (1.475, 6.4), (1.475, 4.55)], 'money')
    tb(sl, 1.6, 5.82, 1.5, 0.5, 'claims paid to members left short', size=9.5, color=SLATE, spacing=1.0)
    # instructions and records
    arrow(sl, 4.25, 2.6, 4.25, 3.6, 'instr')
    lab(sl, 2.4, 2.92, 1.8, 'instructions', size=9.5, color=SLATE, align=R)
    arrow(sl, 4.95, 3.6, 4.95, 2.6, 'data')
    lab(sl, 5.02, 2.92, 1.5, 'confirmations', size=9.5, color=SLATE, align=L)
    arrow_path(sl, [(hx + bw, 2.17), (7.57, 2.17), (7.57, 3.6)], 'instr')
    lab(sl, 6.05, 1.88, 1.55, 'payment requests', size=9.5, color=SLATE, align=L)
    arrow_path(sl, [(1.475, 3.6), (1.475, 2.17), (hx, 2.17)], 'instr')
    lab(sl, 0.6, 1.86, 2.55, 'join, consent, pay in the app', size=9.5, color=SLATE, align=R)
    arrow(sl, 4.57, 4.55, 4.57, 5.5, 'data')
    lab(sl, 4.64, 4.85, 1.6, 'payment records', size=9.5, color=SLATE, align=L)
    # roles, headed by the logos
    rx0 = 9.0
    rw = RX - rx0
    blocks = [(LOGO, 0.3, LIME, ['Circle rules and turn order', 'Member checks and credit score',
                                 'Reminders, records and receipts', 'Late charges and exits',
                                 'Data for credit reporting']),
              (BANK_LOGO, 0.6 if MQ_ else 0.46, TH, ['Customer due diligence and accounts',
                                                     '%s and collection' % B['mandate_c'],
                                                     'Holding balances, paying profit', 'Payouts to collectors',
                                                     'Collecting the fee'])]
    y = 1.72
    for lg, lh, col, items in blocks:
        fit_pic(sl, lg, rx0, y, 2.5, lh, ha='l', va='t')
        yl = y + lh + 0.06
        n = len(items)
        blist(sl, rx0 + 0.02, yl, rw, n * 0.25 + 0.1, items, size=11, bcolor=col, gap=1.5, spacing=1.0)
        y = yl + n * 0.255 + 0.3
    legend(sl, PM, 6.6, [('money', 'money'), ('instr', 'instruction'), ('data', 'confirmation or record')])
    say(sl, notes)


# ======================================================================= MONTHLY CYCLE
def s_cycle():
    notes = notes_v5('cycle')
    sl = new_slide('Monthly Cycle', 'One month of a circle of 12 members at Rs 10,000, step by step')
    xs = {'m': 1.45, 'h': 3.65, 'b': 5.9, 't': 8.05}
    heads = [('m', None, 'Member', 'own %s account' % BN, 'member'), ('h', LOGO, None, 'application, records', 'halqa'),
             ('b', BANK_HEAD, None, 'accounts, payments', 'bank'), ('t', TASDEEQ_WORD, None, 'credit bureau', 'inst')]
    for k, lg, t, sub, kind in heads:
        if lg is None:
            ebox(sl, xs[k] - 0.86, 1.66, 1.72, 0.6, t, sub, kind, tsize=11.5, bsize=9)
        else:
            ebox_logo(sl, xs[k] - 0.86, 1.66, 1.72, 0.6, lg, sub, kind, logo_h=0.27, bsize=9)
        line(sl, xs[k], 2.26, xs[k], 6.4, LINE_, 1.0, dash=True)
    word = 'mandate' if MQ_ else 'instruction'
    steps = [('m', 'h', 'instr', 'joins and consents'),
             ('h', 'b', 'instr', 'registers the %s' % word),
             ('h', 'm', 'instr', 'reminder before payday'),
             ('h', 'b', 'instr', 'payday: collect instalments'),
             ('m', 'b', 'money', 'Rs 10,000 into the committee account'),
             ('h', 'b', 'instr', 'the 8th: pay the collector'),
             ('b', 'm', 'money', 'Rs 120,000 to the collector, same day'),
             ('b', 'h', 'data', 'confirmed; record updates'),
             ('b', 't', 'data', 'payment records')]
    y0, pit = 2.7, 0.43
    for i, (a, b_, kind, text) in enumerate(steps):
        y = y0 + i * pit
        tb(sl, PM, y - 0.2, 0.3, 0.3, str(i + 1), size=11.5, bold=True, color=TH_DK)
        x1, x2 = xs[a], xs[b_]
        arrow(sl, x1, y, x2, y, kind)
        lo, hi = min(x1, x2), max(x1, x2)
        lab(sl, lo + 0.06, y - 0.28, hi - lo - 0.12, text, size=10, color=INK)
    yr = y0 + 4 * pit
    rect(sl, 6.08, yr - 0.36, 1.8, 0.5, AMBER_LT, paras=[('if a debit fails: a retry each morning, five at most',
                                                           dict(size=8.5, color=INK, align=CEN))], pad=0.04,
         anchor=MIDDLE)
    legend(sl, PM, 6.58, [('money', 'money'), ('instr', 'instruction'), ('data', 'confirmation or record')])
    rx0 = 9.2
    rw = RX - rx0
    ph_h = 3.0
    phone_at(sl, 'm_mandate', rx0 + (rw - ph_h * PH_RATIO) / 2, 1.62, ph_h)
    panel(sl, rx0, 4.78, rw, 1.97, FAINT)
    tb(sl, rx0 + 0.18, 4.86, rw - 0.3, 0.3, 'Ways to pay', size=11.5, bold=True, color=INK)
    blist(sl, rx0 + 0.18, 5.18, rw - 0.3, 1.3,
          [[('Automatic debit: ', dict(bold=True)), ('%s %s (new), Recurring wallet merchant' % (BN, B['mandate']),
                                                      {})],
           [('One-tap approval: ', dict(bold=True)), ('card, wallet or Raast RTP', {})],
           [('Manual: ', dict(bold=True)), ('from any account or wallet', {})],
           [('Wallets and cards: ', dict(bold=True)), ('through a licensed PSP', {})]], size=10, gap=2,
          spacing=1.0)
    tb(sl, rx0 + 0.18, 6.46, rw - 0.3, 0.25, 'Detail: Appendix A2 and A3', size=9, color=MUTED)
    say(sl, notes)


# ======================================================================= CREDIT
def s_credit():
    notes = notes_v5('credit')
    sl = new_slide('Credit Reporting and %s' % B['lend_c'], 'Every instalment becomes a repayment record from the '
                                                            'first day')
    y0, bh = 1.72, 1.2
    b1w = 3.25
    rect(sl, PM, y0, b1w, bh, FAINT, line=SLATE, lw=1.0)
    tb(sl, PM + 0.15, y0 + 0.1, b1w - 0.3, 0.3, 'Twelve instalments paid', size=12, bold=True, color=INK,
       align=CEN)
    cw_ = (b1w - 0.4) / 12.0
    for k in range(12):
        xx = PM + 0.2 + k * cw_
        rect(sl, xx, y0 + 0.5, cw_ - 0.04, 0.36, LIME_XLT, line=LIME_DK, lw=0.75)
        tick(sl, xx + (cw_ - 0.04) / 2 - 0.08, y0 + 0.58, 0.16, LIME_DK, 1.4)
    tb(sl, PM + 0.15, y0 + 0.9, b1w - 0.3, 0.26, 'one member, one circle', size=9.5, color=MUTED, align=CEN)
    boxes = [('Credit record', 'reported to TASDEEQ', 'inst'),
             ('Credit score', 'Halqa score, 300 to 850, updated with every payment or Linkage with Tasdeeq directly',
              'halqa'),
             ('%s offer' % B['lend_c'], 'after a circle completes', 'bank')]
    bx = PM + b1w + 0.5
    bw = (RX - bx - 2 * 0.5) / 3.0
    arrow(sl, PM + b1w + 0.05, y0 + bh / 2, bx - 0.05, y0 + bh / 2, 'flow')
    for i, (t, d, kind) in enumerate(boxes):
        x = bx + i * (bw + 0.5)
        ebox(sl, x, y0, bw, bh, t, d, kind, tsize=12.5, bsize=10.5)
        if i < 2:
            arrow(sl, x + bw + 0.05, y0 + bh / 2, x + bw + 0.45, y0 + bh / 2, 'flow')
    cy = 3.3
    cw2 = (PW - 0.45) / 2.0
    cols = [('What each record holds', ['Amount and due date', 'Date paid, on time or late', 'Circle type and turn',
                                        'Whether the circle completed']),
            ('Reporting route', ['Through %s’s TASDEEQ membership' % BN, 'Or Halqa as a data provider',
                                 '%s decides the route' % BN, 'From the first payment'])]
    for i, (t, items) in enumerate(cols):
        x = PM + i * (cw2 + 0.45)
        tb(sl, x, cy, cw2, 0.3, t, size=12.5, bold=True, color=INK)
        blist(sl, x, cy + 0.36, cw2, 1.4, items, size=11.5, gap=2.5)
    yb = 5.3
    panel(sl, PM, yb, PW, 1.45, TH_XLT)
    if MQ_:
        stat(sl, PM + 0.25, yb + 0.15, 3.3, 'No advances', 'on Mashreq’s balance sheet at 30 June 2026 [2]',
             nsize=24, tsize=11, lh=0.5)
        tb(sl, PM + 4.0, yb + 0.2, PW - 4.3, 1.1, 'Committee members arrive with twelve months of repayment '
                                                  'history. That history is the data Mashreq needs to start '
                                                  'lending safely, beginning with asset financing for motorcycles '
                                                  'and machines bought through asset circles.', size=12.5,
           color=INK, spacing=1.08)
    else:
        stat(sl, PM + 0.25, yb + 0.15, 3.3, 'Rs 27.6 million', 'of Islamic financing at 30 June 2026 [2]', nsize=24,
             tsize=11, lh=0.5)
        tb(sl, PM + 4.0, yb + 0.2, PW - 4.3, 1.1, 'Raqami plans auto, fleet and supply chain financing. Committee '
                                                  'members arrive with twelve months of repayment history, the data '
                                                  'needed to finance them safely, beginning with ijarah for '
                                                  'motorcycles and machines bought through asset circles.',
           size=12.5, color=INK, spacing=1.08)
    sources(sl, ['Mission Asset Fund lending circles, evaluation by San Francisco State University, 600+ '
                 'participants', '%s, half year report to 30 June 2026' % BFULL])
    say(sl, notes)


# ======================================================================= PRODUCTS
def s_products():
    notes = notes_v5('products')
    sl = new_slide('%s Products Used' % BN, 'Existing products at each step of a committee, and three new lines')
    if MQ_:
        steps = [('Open', 'NEO account and debit card', 'in about five minutes'),
                 ('Salary in', 'Islamic Current Profit Account', 'profit on the daily balance, up to 2%'),
                 ('Held until the 8th', 'Islamic Savings Account', 'the committee balance; 10% below Rs 1.5 million'),
                 ('Payout', 'Free instant transfer', 'the pot, the same day'),
                 ('Abroad', 'Mashreq Pakistan Account', 'families in the UAE')]
        new = [(1, 'Direct debit mandate', 'collects each instalment on payday'),
               (2, 'Takaful or insurance', 'circles between strangers; Mashreq chooses the operator'),
               (3, 'Asset financing', 'ijarah for motorcycles and machines')]
        src = ['Mashreq NEO Pakistan product pages, rate sheets and schedule of charges (July to December 2026), read '
               '30 September 2026; rates are up to or indicative figures']
    else:
        steps = [('Open', 'Asaan Digital Account', 'CNIC and mobile number'),
                 ('Salary in', 'Mudarabah Savings Account', '10.5% in August 2026'),
                 ('Held until the 8th', '7 day Mudarabah Certificate', '10% in August 2026'),
                 ('Payout', 'Free Raqami transfer', 'the pot, the same day'),
                 ('Cash in', 'Askari Bank branches', 'free cash deposits at 700+')]
        new = [(1, 'Standing instruction', 'debit on payday, on Raqami’s planned open APIs'),
               (2, 'Committee takaful', 'with EFU window takaful, Raqami’s partner'),
               (3, 'Asset financing', 'ijarah for motorcycles and machines')]
        src = ['Raqami products page, FAQ, home page and Historical Profit Rates (August 2026), read 30 September 2026']
    n = len(steps)
    cw = PW / float(n)
    yl = 2.62
    line(sl, PM + cw / 2, yl, RX - cw / 2, yl, TH, 4.0)
    xs = []
    for i, (st_, prod, det) in enumerate(steps):
        xc = PM + cw * (i + 0.5)
        xs.append(xc)
        tb(sl, xc - cw / 2, 1.78, cw, 0.35, st_, size=13, bold=True, color=INK, align=CEN)
        oval(sl, xc - 0.13, yl - 0.13, 0.26, WHITE, line=TH, lw=2.5)
        if i == 0:
            # the account's own app icon inside its box, as on the chairman's copy
            x_b, y_b, w_b, h_b = xc - 1.05, 2.95, 2.1, 0.78
            rect(sl, x_b, y_b, w_b, h_b, TH_XLT, line=TH, lw=1.25)
            fit_pic(sl, ACCOUNT_TILE, x_b + 0.08, y_b + (h_b - 0.56) / 2, 0.56, 0.56)
            tb(sl, x_b + 0.7, y_b, w_b - 0.76, h_b, prod, size=11.5, bold=True, color=INK, align=CEN, anchor=MIDDLE,
               spacing=1.02)
        else:
            ebox(sl, xc - 1.05, 2.95, 2.1, 0.78, prod, None, 'bank', tsize=11.5)
        tb(sl, xc - cw / 2 + 0.1, 3.82, cw - 0.2, 0.55, det, size=10.5, color=SLATE, align=CEN, spacing=1.03)
    yb = 4.72
    tb(sl, PM, yb - 0.17, 1.5, 0.34, 'New lines', size=13, bold=True, color=INK)
    path(sl, [(PM + 1.55, yb), (RX - 0.1, yb)], TEAL, 2.5, dash=True)
    for idx, t, d in new:
        xc = xs[idx]
        oval(sl, xc - 0.11, yb - 0.11, 0.22, WHITE, line=TEAL, lw=2.0)
        ebox(sl, xc - 1.05, yb + 0.3, 2.1, 1.2, t, d, 'ins', tsize=11.5, bsize=10)
    legend(sl, PM, 6.5, [((TH_XLT, TH), 'existing %s product' % BN), ((TEAL_XLT, TEAL), 'new line')])
    tb(sl, 5.6, 6.48, RX - 5.6, 0.3, 'Profit on the committee balance returns to members as points (Appendix A5).',
       size=10, color=SLATE, align=R)
    sources(sl, src)
    say(sl, notes)


# ======================================================================= ONBOARDING
def s_onboarding():
    notes = notes_v5('onboarding')
    sl = new_slide('Onboarding and Verification', '%s opens the account; Halqa’s checks decide which circles and '
                                                   'turns each member may join' % BN)
    lanes = [('Member', FAINT, 1.68, 2.55), (BN, TH_XLT, 2.55, 3.45), ('Halqa checks', LIME_XLT, 3.45, 4.45)]
    for name, fc, ya, yb_ in lanes:
        rect(sl, PM, ya, 1.55, yb_ - ya, fc)
        if name == BN:
            fit_pic(sl, BANK_LOGO, PM + 0.12, ya + 0.1, 1.3, yb_ - ya - 0.2, ha='l')
        else:
            tb(sl, PM + 0.12, ya, 1.35, yb_ - ya, name, size=12.5, bold=True, color=INK, anchor=MIDDLE)
        rule(sl, PM, ya, PW, LINE_, 0.75)
    rule(sl, PM, 4.45, PW, LINE_, 0.75)
    bw9, bh9 = 1.5, 0.55
    bx9 = [2.45, 4.1, 5.9, 7.55, 9.2, 10.85]
    by9 = [1.84, 2.72, 3.67, 3.67, 3.67, 3.67]
    bl9 = ['Sign up', 'Account', 'Identity', 'Income', 'Affordability', 'Score']
    kd9 = ['member', 'bank', 'halqa', 'halqa', 'halqa', 'halqa']
    bd9 = ['phone and PIN', None, None, None, None, None]
    for i in range(6):
        ebox(sl, bx9[i], by9[i], bw9, bh9, bl9[i], bd9[i], kd9[i], tsize=12, bsize=9.5, pad=0.04)
    arrow_path(sl, [(bx9[0] + bw9, by9[0] + bh9 / 2), (bx9[1] + bw9 / 2, by9[0] + bh9 / 2),
                    (bx9[1] + bw9 / 2, by9[1])], 'flow')
    arrow_path(sl, [(bx9[1] + bw9, by9[1] + bh9 / 2), (bx9[2] + bw9 / 2, by9[1] + bh9 / 2),
                    (bx9[2] + bw9 / 2, by9[2])], 'flow')
    for i in (2, 3, 4):
        arrow(sl, bx9[i] + bw9 + 0.02, by9[i] + bh9 / 2, bx9[i + 1] - 0.02, by9[i] + bh9 / 2, 'flow')
    ebox(sl, 8.95, 1.8, 3.78, 0.62, 'Sees only the circles and turns open to them', None, 'member', tsize=11)
    arrow(sl, bx9[5] + bw9 / 2 + 0.3, by9[5], bx9[5] + bw9 / 2 + 0.3, 2.42, 'flow')
    acct = 'CNIC, NADRA biometric check, due diligence' if MQ_ else 'CNIC and registered mobile number'
    tb(sl, 5.72, 2.78, 3.1, 0.45, acct, size=10, color=SLATE, spacing=1.0)
    cy = 4.68
    cw4 = (PW - 3 * 0.3) / 4.0
    rules = [('Identity', ['Names on CNIC, account and app match:', 'Identity Engine:',
                           '0.90 or more passes; 0.80 to 0.90 goes to a person', 'Live face match',
                           'Home and job checked']),
             ('Income', ['Salary from one employer on about the same day each month',
                         'Daily circles: Rs 1,000 or more on 5 days a week for 8 weeks',
                         'Own transfers and loans excluded', 'Verified using income verification engine']),
             ('Affordability', ['All instalments within a third of verified income',
                                'Within 40% including other loans, the State Bank limit']),
             ('Score', ['From 300 to 850', 'Decides which turns open',
                        'New members start in the last three turns'])]
    for i, (t, items) in enumerate(rules):
        x = PM + i * (cw4 + 0.3)
        tb(sl, x, cy, cw4, 0.3, t, size=12.5, bold=True, color=LIME_DK)
        blist(sl, x, cy + 0.34, cw4, 1.95, items, size=10.5, bcolor=LIME_DK, gap=2.5)
    say(sl, notes)


# ======================================================================= REVENUE
def s_revenue():
    sl = new_slide('Revenue and Business Model', 'How one instalment is split, where Halqa’s income comes from and '
                                                 'its technical running cost')
    psp = int(round(10000 * PSP_RATE))
    total = 10000 + psp + FEE
    xtitle(sl, PM, 1.62, 8.0, 'One instalment on a circle between strangers', 'Rs')
    tb(sl, PM, 1.92, 9.0, 0.26, 'The member pays Rs %s plus the %s fee' % (format(total, ','), INS), size=10.5,
       color=INK)
    # the payment drawn to scale; the takaful or insurance fee is named only, so it sits apart, not to scale
    y1, h1 = 2.38, 0.72
    iw_, gap_ = 2.2, 0.15
    ws = PW - iw_ - gap_
    k1 = ws / float(total)
    wb, wp, wf = 10000 * k1, psp * k1, FEE * k1
    rect(sl, PM, y1, wb - 0.02, h1, BLUE)
    rect(sl, PM + wb, y1, wp - 0.015, h1, BLUE_DK)
    rect(sl, PM + wb + wp, y1, wf, h1, TH)
    tb(sl, PM + 0.22, y1, 8.5, h1, [[('Rs 10,000', dict(size=18, bold=True, color=WHITE)),
                                     ('    to the member collecting', dict(size=12.5, color=WHITE))]],
       anchor=MIDDLE)
    ib = rect(sl, PM + ws + gap_, y1, iw_, h1, WHITE, line=TEAL, lw=1.5,
              paras=[('%s fee' % INS_C, dict(size=12, bold=True, color=INK, align=CEN))], pad=0.06, anchor=MIDDLE)
    etree.SubElement(ib.line._get_or_add_ln(), qn('a:prstDash')).set('val', 'dash')
    # the two small parts, enlarged
    y2, h2 = 3.72, 0.72
    poly(sl, [(PM + wb, y1 + h1), (PM + wb + wp + wf, y1 + h1), (RX, y2), (PM, y2)], SOFT)
    line(sl, PM + wb, y1 + h1, PM, y2, AXIS, 0.75, dash=True)
    line(sl, PM + wb + wp + wf, y1 + h1, RX, y2, AXIS, 0.75, dash=True)
    kz = PW / float(psp + FEE)
    rect(sl, PM, y2, psp * kz - 0.02, h2, BLUE_DK)
    rect(sl, PM + psp * kz, y2, FEE * kz, h2, TH)
    tb(sl, PM + 0.22, y2, psp * kz - 0.3, h2, [[('Rs %d' % psp, dict(size=15, bold=True, color=WHITE)),
                                               ('    PSP service fee, 1.5% of the instalment',
                                                dict(size=12, color=WHITE))]], anchor=MIDDLE)
    tb(sl, PM + psp * kz + 0.22, y2, FEE * kz - 0.3, h2, [[('Rs %d' % FEE, dict(size=15, bold=True, color=WHITE)),
                                                          ('    fee to %s, shared with Halqa' % BN,
                                                           dict(size=12, color=WHITE))]], anchor=MIDDLE)
    by = 4.98
    cw2 = (PW - 0.45) / 2.0
    tb(sl, PM, by, cw2, 0.3, 'Income lines', size=12, bold=True, color=INK)
    tb(sl, PM, by + 0.34, cw2, 1.1, [[('Now:  ', dict(size=11, bold=True, color=INK)),
                                      ('a share of the fee %s collects; a share of %s’s income on committee balances'
                                       % (BN, BN), dict(size=11, color=INK))],
                                     ([('Later:  ', dict(size=11, bold=True, color=INK)),
                                       ('asset financing referrals (2 to 4% from the financier, 1 to 3% from the '
                                        'dealer); marketplace commission on points; employer programmes',
                                        dict(size=11, color=INK))], dict(before=4))], spacing=1.04)
    ux = PM + cw2 + 0.45
    tb(sl, ux, by, cw2, 0.3, 'Unit costs', size=12, bold=True, color=INK)
    ue = [('Rs 13 to %d' % OP_MAX, 'to run one payment'), ('Rs %s' % format(int(round(TECH_FIXED, -3)), ','),
                                                           'fixed technical cost a month'),
          ('About Rs %d' % MARGIN, 'contribution a member a month')]
    uw = cw2 / 3.0
    for i, (n_, t) in enumerate(ue):
        stat(sl, ux + i * uw, by + 0.34, uw - 0.15, n_, t, nsize=15, tsize=10, lh=0.5)
    sources(sl, ['Technical prices read 30 September 2026: Vercel, Supabase, Sentry, Google Workspace, Apple; US$1 = '
                 'Rs 290 on a card (interbank Rs 277.3 on 29 September)', 'Business Model and Unit Costs (HQ-CP-03); '
                 'fee set at the running cost of one payment plus Rs %d, 30 September 2026; before the bank’s terms'
                 % MARGIN])
    say(sl, 'How the money moves and how Halqa earns. Top, drawn to scale: on a circle between strangers the member '
            'pays the Rs 10,000 instalment, which goes to whoever is collecting; a fee of Rs %d; and a PSP service '
            'fee of 1.5 per cent of the instalment, Rs %d. On top of that comes the %s fee, set by the operator %s '
            'chooses; it is not part of the fee. The strip below enlarges the two small parts. %s collects the fee '
            'as its own income and pays Halqa an agreed share; Halqa’s revenue is a share of what %s earns, never '
            'money held.\n\nThe fee is the running cost of one payment, at most Rs %d, plus Rs %d. The fixed cost is '
            'technical only: hosting on Vercel, the Supabase database with point in time recovery and a staging '
            'copy, Sentry error monitoring, Google Workspace mail and the Apple developer account, about US$208 or '
            'Rs 61,000 a month at launch; salaries, counsel and an office are excluded. Each active member in a '
            'monthly circle contributes about Rs %d a month, so the technical cost is covered at about %s active '
            'members. Running one payment costs Rs 13 to %d, mostly WhatsApp messages and checks.'
        % (FEE, psp, INS, BN, BN, BN, OP_MAX, MARGIN, MARGIN, format(BREAK_EVEN7, ','), OP_MAX))


# ======================================================================= COMPETITION
def s_comparison():
    notes = notes_v5('comparison')
    sl = new_slide('Competition')
    crit = [('Money held by a licensed bank', [(2, BN), (0, 'own company accounts'), (1, 'organiser’s wallet'),
                                               (0, 'the organiser')])]
    if not MQ_:
        crit.append(('Shariah board oversight', [(2, 'Raqami’s Shariah Board'), (1, 'private adviser'),
                                                 (None, 'not stated'), (0, 'none')]))
    crit += [('Same fee for every turn', [(2, 'one flat fee'), (0, 'up to 21% a month'), (None, 'not published'),
                                          (2, 'usually limited')]),
             ('Paid out automatically', [(2, 'the same day'), (1, '11th to 18th'), (0, 'by hand'), (0, 'by hand')]),
             ('Members checked', [(2, 'identity, income, score'), (1, 'device, bureau'), (0, 'phone contacts'),
                                  (1, 'people known')]),
             ('Defaults protected', [(2, INS), (1, 'own balance sheet'), (0, 'none'), (0, 'organiser’s pocket')]),
             ('Credit record', [(2, 'every payment'), (1, 'defaulters only'), (0, 'none'), (0, 'none')]),
             ('Reach today', [(0, 'new'), (1, '600,000+ sign ups'), (2, '60 million registered accesible'),
                              (2, '4 in 10 Pakistanis')])]
    lw14 = 2.75
    cwc = (PW - lw14) / 4.0
    y0 = 1.68
    rh = 0.52 if MQ_ else 0.49
    tot_h = 0.55 + len(crit) * rh
    x1 = PM + lw14
    rect(sl, x1, y0, cwc, tot_h, TH_XLT)
    fit_pic(sl, DUO, x1 + 0.12, y0 + 0.05, cwc - 0.24, 0.45)
    fit_pic(sl, UA('oraan.png'), x1 + cwc + 0.15, y0 + 0.08, 1.6, 0.4, ha='l')
    ix, iy_, iw, ih = fit_pic(sl, UA('jc_icon.png'), x1 + 2 * cwc + 0.15, y0 + 0.08, 0.48, 0.4, ha='l')
    fit_pic(sl, UA('jc_committee.png'), ix + iw + 0.06, y0 + 0.12, cwc - 0.3 - iw - 0.06, 0.32, ha='l')
    tb(sl, x1 + 3 * cwc + 0.15, y0, cwc - 0.2, 0.52, 'Informal committee', size=12, bold=True, color=INK,
       anchor=MIDDLE)
    rule(sl, PM, y0 + 0.55, PW, INK, 0.75)
    for i, (lb, cells) in enumerate(crit):
        y = y0 + 0.55 + i * rh
        tb(sl, PM, y, lw14 - 0.1, rh, lb, size=11.5, bold=True, color=INK, anchor=MIDDLE, spacing=1.0)
        for j, (lv, note) in enumerate(cells):
            xc = x1 + j * cwc + 0.15
            if lv is not None:
                harvey(sl, xc + 0.11, y + rh / 2, 0.21, lv)
            tb(sl, xc + 0.32, y, cwc - 0.45, rh, note, size=10.5, color=MUTED if lv is None else INK,
               italic=lv is None, anchor=MIDDLE, spacing=1.0)
        rule(sl, PM, y + rh, PW, LINE_, 0.5)
    yl = y0 + tot_h + 0.12
    for k, (lv, t) in enumerate([(2, 'yes'), (1, 'partly'), (0, 'no')]):
        harvey(sl, PM + 0.1 + k * 1.1, yl + 0.13, 0.17, lv)
        tb(sl, PM + 0.27 + k * 1.1, yl, 0.8, 0.26, t, size=10, color=SLATE)
    sources(sl, ['Oraan terms, fee calculator and website, 28 Sep 2026', 'JazzCash release note, Aug 2026, and results '
                 'to 31 March 2026'])
    say(sl, notes)


# ======================================================================= INTERNATIONAL SUCCESS
def s_evidence():
    notes = notes_v5('evidence')
    sl = new_slide('International Success', 'Committee platforms abroad and the institutions behind them')
    tx0, tx1 = PM + 2.55, 8.35
    xy = lambda yr: tx0 + (yr - 2016) * (tx1 - tx0) / 10.0
    for yr in range(2016, 2027):
        tb(sl, xy(yr) - 0.3, 1.66, 0.6, 0.26, str(yr), size=10, color=MUTED, align=CEN)
        vrule(sl, xy(yr), 1.95, 3.45, C('EEF0F2'), 0.75)
    comp = [('Money Fellows', 'Egypt', 2016, [(2025, 'profitable')], '8 million+ users',
             'central bank sandbox; prepaid card with Banque Misr', BLUE),
            ('Hakbah', 'Saudi Arabia', 2018, [(2020, 'launched under a central bank permit')],
             '2 million registered users', 'Saudi central bank sandbox', TEAL),
            ('Esusu', 'United States', 2018, [(2022, 'valued US$1 billion')], 'US$1.2 billion valuation',
             'reports payments to the credit bureaus', TH)]
    if not MQ_:
        comp = [comp[1], comp[0], comp[2]]
    LG = {'Money Fellows': ('moneyfellows.png', 2.1, 0.42), 'Hakbah': ('hakbah.png', 1.25, 0.6),
          'Esusu': ('esusu.png', 1.35, 0.49)}
    for i, (name, ctry, start, ms, now, how, col) in enumerate(comp):
        y = 2.45 + i * 1.12
        fn, lw_, lh_ = LG[name]
        fit_pic(sl, UA(fn), PM, y - 0.02 - lh_, lw_, lh_, ha='l', va='b')
        tb(sl, PM, y + 0.08, 2.45, 0.28, ctry, size=10.5, color=SLATE)
        line(sl, xy(start), y, xy(2026), y, col, 3.5)
        oval(sl, xy(start) - 0.09, y - 0.09, 0.18, col)
        for yr, lb in ms:
            oval(sl, xy(yr) - 0.1, y - 0.1, 0.2, WHITE, line=col, lw=2.0)
            if yr >= 2024:
                tb(sl, xy(yr) - 2.2, y + 0.12, 2.3, 0.28, lb, size=10, color=SLATE, align=R)
            else:
                tb(sl, xy(yr) - 0.1, y + 0.12, 3.6, 0.28, lb, size=10, color=SLATE)
        tb(sl, 8.7, y - 0.3, RX - 8.7, 0.3, now, size=12.5, bold=True, color=INK)
        tb(sl, 8.7, y + 0.03, RX - 8.7, 0.5, how, size=10.5, color=SLATE, spacing=1.02)
    panel(sl, PM, 5.5, PW, 1.2, FAINT)
    tb(sl, PM + 0.22, 5.62, PW - 0.4, 0.3, 'Common pattern', size=12, bold=True, color=INK)
    tb(sl, PM + 0.22, 5.95, PW - 0.4, 0.7, 'Each grew inside the formal system: a central bank sandbox or permit, a '
                                          'partner bank, or reporting to the credit bureaus. The same sequence is '
                                          'proposed with %s.' % BN, size=11.5, color=INK, spacing=1.05)
    sources(sl, ['Daily News Egypt, 20 Oct 2025', 'MENAbytes, 3 Sep 2020; Semafor, 3 Feb 2026', 'CNBC, 11 Dec 2025'])
    say(sl, notes)


# ======================================================================= CURRENT STATUS
def s_status():
    notes = notes_v5('status')
    sl = new_slide('Current Status')
    cols = [('Built', LIME_XLT, LIME_DK, ['Member application in preview: sign up, circles, automatic payment '
                                         'settings, activity, credit report, Hyper (experimental)',
                                         'Checks: identity, income, affordability and score',
                                         'Payday collection with retries', 'Records, receipts and statements']),
            ('Written', BLUE_XLT, BLUE, ['Legal position checked against twelve laws and regulations',
                                         'Six risk and pricing models', 'Default prevention and recovery design',
                                         'Business model and unit costs']),
            ('To do', TH_XLT, TH, ['Incorporation: private limited company, registered office in Islamabad',
                                   'Agreement with %s' % BN, 'Product approval through %s' % BN,
                                   'Connection to %s’s account, %s and payment interfaces, and the PSP'
                                   % (BN, B['mandate']),
                                   '%s operator and TASDEEQ reporting route' % INS_C])]
    cw = (PW - 2 * 0.35) / 3.0
    for i, (t, fc, bc, items) in enumerate(cols):
        x = PM + i * (cw + 0.35)
        rect(sl, x, 1.72, cw, 0.6, fc, paras=[(t, dict(size=15, bold=True, color=INK))], pad=0.2, anchor=MIDDLE)
        blist(sl, x + 0.05, 2.55, cw - 0.1, 3.9, items, size=13, bcolor=bc, gap=11, spacing=1.06)
    say(sl, notes)


# ======================================================================= APPENDIX A6: REGULATION
def s_regulation():
    notes = notes_v5('regulation')
    sl = new_slide('Regulation and Compliance', appx('A6', 'regulation through %s’s licence, with Halqa as its '
                                                           'service provider' % BN))
    bx, by, bw, bh = PM, 1.72, 4.25, 4.95
    rect(sl, bx, by, bw, bh, None, line=INK, lw=1.0)
    tb(sl, bx + 0.18, by + 0.1, bw - 0.3, 0.3, 'State Bank of Pakistan', size=12.5, bold=True, color=INK)
    tb(sl, bx + 0.18, by + 0.4, bw - 0.3, 0.3, 'regulates %s, payments and the PSP' % BN, size=10, color=SLATE)
    rect(sl, bx + 0.3, by + 0.85, bw - 0.6, bh - 1.05, TH_XLT, line=TH, lw=1.25)
    fit_pic(sl, BANK_LOGO, bx + 0.48, by + 0.95, 2.2, 0.5, ha='l')
    tb(sl, bx + 0.48, by + 1.5, bw - 0.9, 0.3, 'licence, accounts, payments', size=10, color=SLATE)
    iy = by + 1.92
    sb = 'Raqami’s Shariah Board' if not MQ_ else 'Mashreq’s Shariah Board'
    rect(sl, bx + 0.6, iy, bw - 1.2, 0.72, WHITE, line=TH, lw=1.0,
         paras=[(sb, dict(size=11, bold=True, color=INK)), ('certifies each Islamic product', dict(size=9.5,
                                                                                                   color=SLATE))],
         pad=0.12, anchor=MIDDLE)
    rect(sl, bx + 0.6, iy + 0.9, bw - 1.2, 1.78, LIME_XLT, line=LIME, lw=1.25)
    tb(sl, bx + 0.75, iy + 1.0, bw - 1.5, 0.3, 'Halqa: service provider', size=11.5, bold=True, color=INK)
    tb(sl, bx + 0.75, iy + 1.32, bw - 1.5, 1.35, 'Rules, checks, application and records. Holds no member '
                                                'money. Works under the outsourcing framework, with audit rights for '
                                                '%s and the State Bank.' % BN, size=10.5, color=SLATE, spacing=1.05)
    x0 = 5.2
    cws = [1.7, 2.45, RX - x0 - 1.7 - 2.45]
    hdr = ['Area', 'Rule', 'How it is met']
    rows = [('Member money', 'Only a bank may take deposits (Companies Act 2017, s.84)',
             'Held only by %s; Halqa never receives it' % BN),
            ('Service provider', 'SBP outsourcing framework, 2017, revised 2019',
             'Audit rights, data security and continuity for %s and the State Bank' % BN),
            ('Automatic debit', 'Payment Systems and Electronic Fund Transfers Act 2007, s.35',
             'Member consent in the app; the %s is %s’s' % (B['mandate'], BN)),
            ('Credit reporting', 'Credit Bureaus Act 2015', 'Through %s’s TASDEEQ membership or Halqa as a data '
                                                            'provider' % BN),
            (INS_C, 'Insurance Ordinance 2000: only a licensed operator may insure',
             'Written by an operator %s chooses' % BN),
            ('Product approval', 'State Bank approval or notice', 'Taken to the State Bank by %s' % BN),
            ('Data', 'Customer data protection; outsourcing data controls', 'Results only; hosted in Singapore today, '
                                                                         'moved where %s and the State Bank require'
             % BN),
            ('AML and KYC', 'Anti-Money Laundering Act 2010; State Bank AML regulations',
             'Customer due diligence and screening by %s when the account opens' % BN),
            ('Consumer protection', 'State Bank fair treatment of consumers rules',
             'Full cost shown before signing; 24 hours to withdraw; complaints in the app'),
            ('Continuity', 'Outsourcing framework: contingency and exit plans', 'Money stays at %s; daily backups; '
                                                                               'records exportable to %s' % (BN, BN))]
    x = x0
    for w_, h_ in zip(cws, hdr):
        tb(sl, x, 1.7, w_ - 0.1, 0.3, h_, size=11, bold=True, color=INK)
        x += w_
    rule(sl, x0, 2.02, RX - x0, INK, 0.75)
    rh = 0.465
    for i, row in enumerate(rows):
        y = 2.06 + i * rh
        x = x0
        for c_, (w_, v) in enumerate(zip(cws, row)):
            tb(sl, x, y, w_ - 0.12, rh, v, size=10 if c_ else 10.5, bold=(c_ == 0), color=INK, anchor=MIDDLE,
               spacing=1.0)
            x += w_
        rule(sl, x0, y + rh, RX - x0, LINE_, 0.5)
    sources(sl, ['SBP BPRD Circular No. 06 of 2017 (outsourcing), revised 2019; Companies Act 2017; PS&EFT Act 2007; '
                 'Credit Bureaus Act 2015; Insurance Ordinance 2000'])
    say(sl, notes)


# ------------------------------------------------------------------------------------ black text pass
GREY_HEX = {'4B5563', '6B7280', '5F6B58', 'A9B4A3', '9CA3AF', '26301F'}
TEXT_TAGS = {qn('a:rPr'), qn('a:defRPr'), qn('a:endParaRPr')}


def blacken():
    """Every grey text run made black (ink); coloured text stays coloured."""
    n = 0
    for s in prs.slides:
        for el in s._element.iter(qn('a:srgbClr')):
            fp = el.getparent()
            if fp is None or fp.tag != qn('a:solidFill'):
                continue
            owner = fp.getparent()
            if owner is not None and owner.tag in TEXT_TAGS and el.get('val', '').upper() in GREY_HEX:
                el.set('val', '0C1408')
                n += 1
    return n


# ===================================================================== build
for f in (s_cover, s_committee, s_market, s_problems, s_structure, s_cycle, s_app_join, s_app_use, s_growth,
          s_credit, s_products, s_onboarding, s_types, s_prevention, s_revenue, s_comparison, s_evidence, s_timing,
          s_status, s_summary, s_hyper, s_collection, s_psp, s_recovery, s_points, s_regulation):
    f()
print('grey text runs made black:', blacken())

cp = prs.core_properties
cp.title = 'Halqa: committee savings partnership with %s' % BFULL
cp.author = 'Halqa'
cp.last_modified_by = 'Halqa'
os.makedirs(os.path.dirname(os.path.abspath(OUTP)), exist_ok=True)
prs.save(OUTP)

bad, words = [], []
SLIDE_PAT = (r'\byou\b', r'\byour\b', r'\bwe\b', r'\bour\b')
ALL_PAT = (u'[‒–—―]', r' - ', r'(?i)\bcover\b', r'(?i)\bpilot\b', r'(?i)safepay|payfast|guarantee from',
           r'(?i)\bjourney\b|\bunlock|\bseamless|\bempower|\bleverag|\brevolution|\btruly\b|\bSakh\b|\brecorder\b|'
           r'Akif|Saeed|Kazi|father|Sidra|Amjed|Hamayun|Aijaz|game.?changer')
for n, s in enumerate(prs.slides, 1):
    wn = 0
    for shp in s.shapes:
        if shp.has_text_frame:
            t = shp.text_frame.text
            if not t.startswith(('Source', 'Sources')) and not re.fullmatch(r'\d+', t.strip()):
                wn += len([w for w in t.split() if re.search('[A-Za-z]', w)])
            for pat in SLIDE_PAT + ALL_PAT:
                if re.search(pat, t):
                    bad.append((n, pat[:24], t[:70]))
    nt = s.notes_slide.notes_text_frame.text if s.has_notes_slide else ''
    for pat in ALL_PAT:
        if re.search(pat, nt):
            bad.append((n, 'NOTES ' + pat[:24], re.search(pat, nt).group(0)))
    words.append(wn)
print(BANK, 'slides', len(prs.slides), 'bytes', os.path.getsize(OUTP), 'words on slides', sum(words))
print('words per slide', words)
for b in bad:
    print('CHECK', b)
