# -*- coding: utf-8 -*-
# ============================================================================================ VERSION 6 (30 Sep)
# The chairman's edits to version 5 (his Mashreq copy, "Halqa Presentation for Mashreq final") applied to both banks,
# with his design notes: logos in place of party names; no text inside boxes (every party or step is a logo or an
# icon tile, with its words beside or below it); the person icon for members; icons for products and steps; every
# grey text black; charts drawn as shapes, so that Google Slides keeps them exactly as drawn.

UMC = os.path.join(ME, 'user_media', 'clean')


def UA(n):
    return os.path.join(UMC, n)


PERSON = UA('person.png')
HALQA_MARK = os.path.join(os.path.dirname(LIB), 'mark-160.png')
TASDEEQ_WORD = UA('tasdeeq_word.png')
TASDEEQ_WIDE = UA('tasdeeq_wide.png')
BANK_LOGO = UA('mashreq_logo.png' if MQ_ else 'raqami_logo.png')
BANK_TILE = UA('mashreq_tile.png' if MQ_ else 'raqami_tile.png')
ACCOUNT_TILE = UA('neo_tile.png' if MQ_ else 'raqami_tile.png')
DUO = UA('duo_mashreq.png' if MQ_ else 'duo_raqami.png')
AXIS, GRID, SOFT = C('9CA3AF'), C('E5E7EB'), C('EDEFF2')
LOCK_R = 158 / 520.0

_V5 = dict(committee=s_committee, market=s_market, problems=s_problems, structure=s_structure, cycle=s_cycle,
           growth=s_growth, credit=s_credit, products=s_products, onboarding=s_onboarding, types=s_types,
           prevention=s_prevention, revenue=s_revenue, comparison=s_comparison, evidence=s_evidence, timing=s_timing,
           status=s_status, summary=s_summary, collection=s_collection, psp=s_psp, recovery=s_recovery,
           points=s_points, regulation=s_regulation)


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


# ------------------------------------------------------------------------------------------ drawing kit
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


TK = {'bank': (TH, WHITE), 'halqa': (LIME, WHITE), 'lime_dk': (LIME_DK, WHITE), 'pay': (BLUE, WHITE),
      'ins': (TEAL, WHITE), 'amber': (AMBER, INK), 'red': (RED, WHITE), 'slate': (C('4B5563'), WHITE),
      'ink': (INK, WHITE), 'member': (SOFT, INK)}


def tile(sl, x, y, s, kind='bank', ic=None, img=None, circle=False, fill_=None, glyph=None, gs=None):
    """App-icon tile: a rounded square (or a circle) in the kind's colour with a white glyph, or with a picture."""
    fc, gc = TK.get(kind, (None, WHITE))
    if fill_ is not None:
        fc = fill_
    if glyph is not None:
        gc = glyph
    shp = shape(sl, SH.OVAL if circle else SH.ROUNDED_RECTANGLE, x, y, s, s, fc)
    if not circle:
        shp.adjustments[0] = 0.24
    g = s * (gs or (0.64 if img is not None else 0.56))
    if img is not None:
        fit_pic(sl, img, x + (s - g) / 2, y + (s - g) / 2, g, g)
    elif ic:
        icon(sl, ic, x + (s - g) / 2, y + (s - g) / 2, g, gc)
    return shp


def ptile(sl, x, y, s):
    """A member: the chairman's person icon on a soft tile."""
    return tile(sl, x, y, s, 'member', img=PERSON)


def logo_tile(sl, p, x, y, s):
    return fit_pic(sl, p, x, y, s, s)


def words(sl, x, y, w, h, title=None, sub=None, tsize=12, bsize=10.5, align=L, anchor=TOP, tcolor=None):
    """A bold line and a plain line, set free on the page, never inside a box."""
    paras = []
    if title:
        paras.append((title, dict(size=tsize, bold=True, color=tcolor or INK, align=align)))
    if sub:
        paras.append((sub, dict(size=bsize, color=INK, align=align, before=1 if title else 0)))
    return tb(sl, x, y, w, h, paras, anchor=anchor, spacing=1.02)


def accent(sl, x, y, h, color, w=0.075):
    s = shape(sl, SH.ROUNDED_RECTANGLE, x, y, w, h, color)
    s.adjustments[0] = 0.5
    return s


def swatch(sl, x, y, kind, label, size=10):
    tile(sl, x, y + 0.04, 0.19, kind)
    tb(sl, x + 0.27, y, len(label) * size * 0.0072 + 0.2, 0.26, label, size=size, color=INK)
    return x + 0.27 + len(label) * size * 0.0072 + 0.45


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
        tb(sl, bx0 + bl + 0.07, yy, 0.6, slot, fmt(v), size=size, bold=True, color=INK, anchor=MIDDLE)
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


# ======================================================================= COMMITTEE (chart as shapes)
def s_committee():
    _V5['committee']()
    sl = prs.slides[len(prs.slides) - 1]
    drop_charts(sl)
    cx0 = 5.55
    t1 = [120 - 10 * m for m in range(1, 13)]
    t12 = [-10 * m for m in range(1, 12)] + [0]
    line_chart(sl, cx0, 1.97, RX - cx0, 3.13, [str(m) for m in range(1, 13)],
               [('Turn 1', t1, TH), ('Turn 12', t12, BLUE)], -120, 120, 60)


# ======================================================================= MARKET
def s_market():
    notes = notes_v5('market')
    sl = new_slide('Market', 'Committee use in Pakistan, from published estimates')
    xtitle(sl, PM, 1.62, 4.2, 'Pakistanis who save in committees', 'per 100 people')
    waffle(sl, PM, 2.05, [(34, TH), (7, TH_MID)], pitch=0.355, cell=0.3)
    ly = 2.05 + 10 * 0.355 + 0.08
    sq(sl, PM, ly + 0.04, 0.17, TH)
    tb(sl, PM + 0.26, ly, 3.4, 0.26, '34 in 100, Karandaaz estimate [1]', size=10.5, color=INK)
    sq(sl, PM, ly + 0.34, 0.17, TH_MID)
    tb(sl, PM + 0.26, ly + 0.3, 3.6, 0.26, '41 in 100 including these, Oraan estimate [1]', size=10.5, color=INK)
    gx0 = 4.95
    top = [('users', 'About 100 million', 'people use committees, on the higher estimate [2]'),
           ('banknote', 'Rs 4 trillion', 'a year passes through committees, estimated [1]')]
    low = [('calendar-days', '91%', 'of committees collect monthly [4]'),
           ('map-pin', '56%', 'of adults have a committee within 1 km of home [5]'),
           ('wallet', 'Rs 5000', 'average monthly contribution, [4]')]
    cw = (RX - gx0) / 2.0
    for i, (ic, n_, t) in enumerate(top):
        x = gx0 + i * cw
        tile(sl, x, 1.8, 0.52, 'bank', ic)
        stat(sl, x, 2.46, cw - 0.4, n_, t, nsize=30, tsize=12.5, lh=0.75)
    rule(sl, gx0, 3.98, RX - gx0, LINE_, 0.75)
    cw3 = (RX - gx0) / 3.0
    for i, (ic, n_, t) in enumerate(low):
        x = gx0 + i * cw3
        tile(sl, x, 4.26, 0.46, 'bank', ic)
        stat(sl, x, 4.86, cw3 - 0.3, n_, t, nsize=24, tsize=12, lh=0.75)
    sources(sl, ['Karandaaz and Oraan estimates, Dawn, 12 Dec 2022', 'PICG case study on Oraan, 2024',
                 'Financial Inclusion Insights (FII) data in Mehmood et al. 2018', 'FII Pakistan, 2013',
                 'FII wave 5, 2017'])
    say(sl, notes)


# ======================================================================= PROBLEMS
def s_problems():
    notes = notes_v5('problems')
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
        tb(sl, x, 4.45, pw4 - 0.1, 0.7, lbl, size=11.5, color=INK, spacing=1.04)
    yb = 5.38
    accent(sl, PM, yb + 0.02, 1.3, RED)
    tile(sl, PM + 0.3, yb + 0.02, 0.42, 'red', 'newspaper')
    tb(sl, PM + 0.86, yb + 0.02, 4.9, 0.42, 'Case, 2022', size=12.5, bold=True, color=INK, anchor=MIDDLE)
    tb(sl, PM + 0.3, yb + 0.56, 5.3, 0.8, 'One organiser ran more than 100 committees through Facebook and '
                                          'defaulted on about Rs 420 million. No written records were kept. [2]',
       size=11.5, color=INK, spacing=1.06)
    fx0 = PM + 6.15
    tb(sl, fx0, yb + 0.02, RX - fx0, 0.3, 'How informal committees fail', size=12.5, bold=True, color=INK)
    fails = ['The organiser leaves with the pot', 'A member stops paying after collecting',
             'Disputes over the order of turns', 'No record of who paid what']
    fw = (RX - fx0) / 2.0
    for i, t in enumerate(fails):
        x = fx0 + (i % 2) * fw
        y = yb + 0.47 + (i // 2) * 0.5
        icon(sl, 'circle-x', x, y + 0.02, 0.24, RED)
        tb(sl, x + 0.34, y, fw - 0.4, 0.44, t, size=11.5, color=INK)
    sources(sl, ['Financial Inclusion Insights survey data, in Mehmood et al. 2018', 'Dawn, 5 and 12 Dec 2022; '
                 'Arab News, 10 Dec 2022'])
    say(sl, notes)


# ======================================================================= STRUCTURE
def s_structure():
    notes = notes_v5('structure')
    sl = new_slide('Proposed Structure', 'Halqa runs the committee system; %s holds and moves the money under '
                                         'State Bank regulation' % BN)
    CX = 4.5
    lw_h = 1.4
    lh_h = lw_h * LOCK_R
    hx0, hy0 = CX - lw_h / 2, 1.7
    pic(sl, LOGO, hx0, hy0, w=lw_h, h=lh_h)
    hmid = hy0 + lh_h / 2
    words(sl, CX - 1.95, hy0 + lh_h + 0.03, 3.9, 0.3, None, 'committee system: rules, turns, checks, records',
          align=CEN)
    bx, by, bw_, bh_ = fit_pic(sl, BANK_LOGO, CX - 1.0, 3.1, 2.0, 0.84)
    words(sl, CX - 1.6, by + bh_ + 0.05, 3.2, 0.3, None, 'accounts, collection, payouts, profit', align=CEN)
    ts, ty = 0.72, 3.2
    MX, PX = 1.4, 7.3
    ptile(sl, MX - ts / 2, ty, ts)
    words(sl, MX - 0.85, ty + ts + 0.06, 1.7, 0.62, 'Members', 'each with a %s account' % BN, align=CEN)
    tile(sl, PX - ts / 2, ty, ts, 'pay', 'credit-card')
    words(sl, PX + ts / 2 + 0.14, ty - 0.02, 1.7, ts + 0.04, 'Licensed PSP', 'wallet and card payments',
          anchor=MIDDLE)
    iy = 5.05
    tile(sl, PX - ts / 2, iy, ts, 'ins', 'umbrella')
    words(sl, PX + ts / 2 + 0.14, iy - 0.1, 1.7, ts + 0.2, '%s operator' % INS_C, 'pays claims', tsize=11.5,
          anchor=MIDDLE)
    tx_, ty_, tw_, th_ = fit_pic(sl, TASDEEQ_WIDE, CX - 0.65, 5.05, 1.3, 0.37)
    words(sl, CX - 1.2, ty_ + th_ + 0.03, 2.4, 0.28, None, 'licensed credit bureau', align=CEN)
    # money
    mr = MX + ts / 2 + 0.07
    bl_, br_ = bx - 0.07, bx + bw_ + 0.07
    arrow(sl, mr, 3.45, bl_, 3.45, 'money')
    lab(sl, mr, 3.16, bl_ - mr, 'instalments', size=10)
    arrow(sl, bl_, 3.82, mr, 3.82, 'money')
    lab(sl, mr, 3.86, bl_ - mr, 'pots', size=10)
    pl = PX - ts / 2 - 0.07
    arrow(sl, pl, 3.45, br_, 3.45, 'money')
    lab(sl, br_, 3.16, pl - br_, 'payments', size=10)
    vx = 6.5
    arrow_path(sl, [(br_, 3.82), (vx, 3.82), (vx, iy + ts / 2), (pl, iy + ts / 2)], 'money')
    lab(sl, vx + 0.08, 4.42, 1.3, 'contributions', size=10, align=L)
    cy_ = 6.3
    arrow_path(sl, [(PX, iy + ts + 0.06), (PX, cy_), (MX, cy_), (MX, 4.7)], 'money')
    tb(sl, MX + 0.12, cy_ - 0.3, 2.9, 0.26, 'claims paid to members left short', size=10, color=INK)
    # instructions and records
    arrow_path(sl, [(hx0 + lw_h + 0.07, hmid), (PX, hmid), (PX, ty - 0.07)], 'instr')
    lab(sl, hx0 + lw_h + 0.15, hmid - 0.3, 1.8, 'payment requests', size=10, align=L)
    arrow_path(sl, [(MX, ty - 0.07), (MX, hmid), (hx0 - 0.07, hmid)], 'instr')
    lab(sl, MX + 0.1, hmid - 0.3, hx0 - MX - 0.3, 'join, consent, pay in the app', size=10, align=L)
    ya, yb2 = hy0 + lh_h + 0.36, by - 0.07
    arrow(sl, CX - 0.22, ya, CX - 0.22, yb2, 'instr')
    lab(sl, CX - 2.0, (ya + yb2) / 2 - 0.13, 1.7, 'instructions', size=10, align=R)
    arrow(sl, CX + 0.22, yb2, CX + 0.22, ya, 'data')
    lab(sl, CX + 0.3, (ya + yb2) / 2 - 0.13, 1.7, 'confirmations', size=10, align=L)
    arrow(sl, CX, by + bh_ + 0.36, CX, ty_ - 0.07, 'data')
    lab(sl, CX + 0.08, 4.52, 1.6, 'payment records', size=10, align=L)
    legend(sl, PM, 6.62, [('money', 'money'), ('instr', 'instruction'), ('data', 'confirmation or record')])
    # roles, headed by the logos
    rx0 = 9.65
    rw = RX - rx0
    pic(sl, LOGO, rx0, 1.72, w=1.1, h=1.1 * LOCK_R)
    blist(sl, rx0 + 0.02, 2.16, rw, 1.45, ['Circle rules and turn order', 'Member checks and credit score',
                                           'Reminders, records and receipts', 'Late charges and exits',
                                           'Data for credit reporting'], size=11, bcolor=LIME, gap=1.5, spacing=1.0)
    fit_pic(sl, BANK_LOGO, rx0, 3.66, 1.7, 0.66, ha='l')
    blist(sl, rx0 + 0.02, 4.44, rw, 1.45, ['Customer due diligence and accounts', '%s and collection'
                                           % B['mandate_c'], 'Holding balances, paying profit',
                                           'Payouts to collectors', 'Collecting the fee'], size=11, bcolor=TH,
          gap=1.5, spacing=1.0)
    say(sl, notes)


# ======================================================================= MONTHLY CYCLE
def s_cycle():
    notes = notes_v5('cycle')
    sl = new_slide('Monthly Cycle', 'One month of a circle of 12 members at Rs 10,000, step by step')
    xs = {'m': 1.45, 'h': 3.65, 'b': 5.9, 't': 8.05}
    s0 = 0.5
    ptile(sl, xs['m'] - s0 / 2, 1.6, s0)
    words(sl, xs['m'] - 0.9, 2.14, 1.8, 0.45, 'Member', 'own %s account' % BN, tsize=11, bsize=9.5, align=CEN)
    pic(sl, LOGO, xs['h'] - 0.6, 1.68, w=1.2, h=1.2 * LOCK_R)
    words(sl, xs['h'] - 0.9, 2.14, 1.8, 0.3, None, 'application, records', bsize=9.5, align=CEN)
    if MQ_:
        logo_tile(sl, BANK_TILE, xs['b'] - s0 / 2, 1.6, s0)
    else:
        fit_pic(sl, BANK_LOGO, xs['b'] - 0.75, 1.6, 1.5, 0.5)
    words(sl, xs['b'] - 0.9, 2.14, 1.8, 0.3, None, 'accounts, payments', bsize=9.5, align=CEN)
    fit_pic(sl, TASDEEQ_WORD, xs['t'] - 0.62, 1.64, 1.24, 0.42)
    words(sl, xs['t'] - 0.9, 2.14, 1.8, 0.3, None, 'credit bureau', bsize=9.5, align=CEN)
    for k in xs:
        line(sl, xs[k], 2.62, xs[k], 6.4, LINE_, 1.0, dash=True)
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
    y0, pit = 2.98, 0.4
    for i, (a, b_, kind, text) in enumerate(steps):
        y = y0 + i * pit
        tb(sl, PM, y - 0.2, 0.3, 0.3, str(i + 1), size=11.5, bold=True, color=TH_DK)
        x1, x2 = xs[a], xs[b_]
        arrow(sl, x1, y, x2, y, kind)
        lo, hi = min(x1, x2), max(x1, x2)
        if hi - lo > 3.0:
            # a label that sits on another party's line: a white ground keeps the dashed line out of the words
            wl = len(text) * 0.074 + 0.16
            t_ = lab(sl, (lo + hi) / 2 - wl / 2, y - 0.28, wl, text, size=10, color=INK)
            t_.fill.solid()
            t_.fill.fore_color.rgb = WHITE
        else:
            lab(sl, lo + 0.06, y - 0.28, hi - lo - 0.12, text, size=10, color=INK)
    yr = y0 + 4 * pit
    tile(sl, 6.08, yr - 0.36, 0.3, 'amber', 'rotate-cw', circle=True)
    tb(sl, 6.46, yr - 0.44, 1.52, 0.5, 'if a debit fails: a retry each morning, five at most', size=8.5, color=INK,
       spacing=1.0, anchor=MIDDLE)
    legend(sl, PM, 6.58, [('money', 'money'), ('instr', 'instruction'), ('data', 'confirmation or record')])
    rx0 = 9.2
    rw = RX - rx0
    ph_h = 3.0
    phone_at(sl, 'm_mandate', rx0 + (rw - ph_h * PH_RATIO) / 2, 1.62, ph_h)
    tb(sl, rx0, 4.8, rw, 0.3, 'Ways to pay', size=11.5, bold=True, color=INK)
    ways = [('zap', 'Automatic debit: ', '%s %s (new), Recurring wallet merchant' % (BN, B['mandate']), 0.42),
            ('smartphone', 'One-tap approval: ', 'card, wallet or Raast RTP', 0.3),
            ('hand-coins', 'Manual: ', 'from any account or wallet', 0.3),
            ('wallet', 'Wallets and cards: ', 'through a licensed PSP', 0.3)]
    yy = 5.14
    for ic, hd, bd, hh in ways:
        tile(sl, rx0, yy + 0.01, 0.24, 'bank', ic, circle=True)
        tb(sl, rx0 + 0.34, yy, rw - 0.34, hh, [[(hd, dict(size=10, bold=True)), (bd, dict(size=10))]], spacing=1.0)
        yy += hh
    tb(sl, rx0, 6.46, rw, 0.25, 'Detail: Appendix A2 and A3', size=9, color=INK)
    say(sl, notes)


# ======================================================================= GROWTH
def s_growth():
    notes = notes_v5('growth')
    sl = new_slide('Customer Growth and Deposits', 'Accounts arrive by the circle; deposits at %s’s own average '
                                                  'balance' % BN)
    xtitle(sl, PM, 1.62, 5.8, 'How circles bring accounts')
    cx, cy, Rr, ts = 3.62, 3.3, 0.98, 0.56

    def P(a):
        return cx + Rr * math.cos(math.radians(a)), cy - Rr * math.sin(math.radians(a))

    for a0, a1 in [(135, 45), (45, -45), (-45, -135), (-135, -225)]:
        angs = [a0 - 27 - 3 * k for k in range(int((a0 - a1 - 54) / 3) + 1)]
        path(sl, [P(a) for a in angs], SLATE, 1.75, arrow=True)
    ring = [(135, 'person', 'A host starts a circle', 'invites people they know', 'L'),
            (45, 'bank', '6 to 20 accounts', 'every member opens a %s account' % BN, 'R'),
            (-45, 'done', 'The circle completes', 'every member collects once', 'R'),
            (-135, 'person', 'Members host circles', 'the cycle repeats', 'L')]
    for a, vis, t, d, side_ in ring:
        px, py = P(a)
        if vis == 'person':
            ptile(sl, px - ts / 2, py - ts / 2, ts)
        elif vis == 'bank':
            logo_tile(sl, BANK_TILE, px - ts / 2, py - ts / 2, ts)
        else:
            tile(sl, px - ts / 2, py - ts / 2, ts, 'halqa', 'circle-check')
        if side_ == 'L':
            words(sl, PM, py - 0.38, px - ts / 2 - 0.12 - PM, 0.76, t, d, tsize=11, bsize=10, align=R, anchor=MIDDLE)
        else:
            x_ = px + ts / 2 + 0.12
            words(sl, x_, py - 0.38, 6.5 - x_, 0.76, t, d, tsize=11, bsize=10, anchor=MIDDLE)
    chans = [('person', 'Hosts', 'points for circles that complete cleanly, never for recruiting'),
             (('pay', 'building-2'), 'Employers', 'circles offered to staff'),
             (('ins', 'plane'), 'Families abroad', 'relatives in the UAE through the Mashreq Pakistan Account')
             if MQ_ else (('amber', 'calendar-days'), 'Seasons', 'Ramadan, Qurbani, weddings and school fees'),
             ('bank', '%s' % BN, 'circles offered inside %s’s banking services' % BN)]
    xtitle(sl, PM, 4.8, 5.8, 'Channels')
    for i, (vis, t, d) in enumerate(chans):
        y = 5.13 + i * 0.4
        s_ = 0.3
        if vis == 'person':
            ptile(sl, PM, y + 0.03, s_)
        elif vis == 'bank':
            logo_tile(sl, BANK_TILE, PM, y + 0.03, s_)
        else:
            tile(sl, PM, y + 0.03, s_, vis[0], vis[1])
        tb(sl, PM + 0.42, y, 1.4, 0.36, t, size=11, bold=True, color=INK, anchor=MIDDLE)
        tb(sl, PM + 1.85, y, 4.4, 0.36, d, size=11, color=INK, anchor=MIDDLE)
    x0 = 6.85
    xtitle(sl, x0, 1.62, RX - x0, 'Deposits', 'Rs billion')
    hbar_chart(sl, x0, 1.98, RX - x0, 2.3, ['%s, 30 June 2026' % BN, 'Added by 100,000 members',
                                            'Added by 1,000,000 members'],
               [B['today'], B['add100'], B['add1m']], [TH, LIME, LIME], lambda v: '%.1f' % v, B['add1m'])
    tb(sl, x0, 4.45, RX - x0, 0.5, B['avg_line'], size=10, color=INK, spacing=1.04)
    fw = (RX - x0) / 2.0
    stat(sl, x0, 5.1, fw - 0.2, B['grow'][0], B['grow'][1], nsize=24, tsize=11)
    stat(sl, x0 + fw, 5.1, fw - 0.2, '5-7 days', 'each instalment is held at %s between payday and the 8th' % BN,
         nsize=24, tsize=11)
    srcs = ['%s, half year report to 30 June 2026' % BFULL]
    if not MQ_:
        srcs.append('Bloomberg, 22 January 2026')
    sources(sl, srcs)
    say(sl, notes)


# ======================================================================= CREDIT
def s_credit():
    notes = notes_v5('credit')
    sl = new_slide('Credit Reporting and %s' % B['lend_c'], 'Every instalment becomes a repayment record from the '
                                                            'first day')
    y0 = 1.72
    ym = 2.3
    tb(sl, PM, y0, 3.35, 0.3, 'Twelve instalments paid', size=12, bold=True, color=INK)
    d, g = 0.24, 0.035
    for k in range(12):
        xx = PM + k * (d + g)
        oval(sl, xx, ym - d / 2, d, LIME)
        icon(sl, 'check', xx + 0.045, ym - d / 2 + 0.045, d - 0.09, 'FFFFFF', 3.0)
    tb(sl, PM, ym + 0.2, 3.35, 0.26, 'one member, one circle', size=9.5, color=INK)
    nodes = [('tasdeeq', 'Credit record', 'reported to TASDEEQ'),
             ('halqa', 'Credit score', 'Halqa score, 300 to 850, updated with every payment or Linkage with Tasdeeq '
                                       'directly'),
             ('bank', '%s offer' % B['lend_c'], 'after a circle completes')]
    cxs = [5.85, 8.6, 11.35]
    vs = 0.6
    prev_r = PM + 12 * (d + g)
    for i, (kind, t, sub) in enumerate(nodes):
        c = cxs[i]
        if kind == 'tasdeeq':
            vx, vy, vw, vh = fit_pic(sl, TASDEEQ_WIDE, c - 0.75, ym - 0.3, 1.5, 0.6)
        elif kind == 'halqa':
            vx, vy, vw, vh = fit_pic(sl, HALQA_MARK, c - vs / 2, ym - vs / 2, vs, vs)
        else:
            vx, vy, vw, vh = fit_pic(sl, BANK_TILE, c - vs / 2, ym - vs / 2, vs, vs)
        arrow(sl, prev_r + 0.08, ym, vx - 0.1, ym, 'flow')
        prev_r = vx + vw
        words(sl, c - 1.3, ym + 0.42, 2.6, 1.0, t, sub, tsize=12.5, bsize=10.5, align=CEN)
    cy = 3.78
    cw2 = (PW - 0.6) / 2.0
    cols = [('file-text', 'What each record holds', ['Amount and due date', 'Date paid, on time or late',
                                                      'Circle type and turn', 'Whether the circle completed']),
            ('send', 'Reporting route', ['Through %s’s TASDEEQ membership' % BN, 'Or Halqa as a data provider',
                                         '%s decides the route' % BN, 'From the first payment'])]
    for i, (ic, t, items) in enumerate(cols):
        x = PM + i * (cw2 + 0.6)
        tile(sl, x, cy, 0.36, 'bank', ic, circle=True)
        tb(sl, x + 0.48, cy, cw2 - 0.48, 0.36, t, size=12.5, bold=True, color=INK, anchor=MIDDLE)
        blist(sl, x, cy + 0.48, cw2, 1.3, items, size=11.5, gap=2.5)
    yb = 5.55
    accent(sl, PM, yb, 1.2, TH)
    if MQ_:
        stat(sl, PM + 0.3, yb - 0.02, 3.4, 'No advances', 'on Mashreq’s balance sheet at 30 June 2026 [2]',
             nsize=24, tsize=11, lh=0.5)
        tb(sl, PM + 4.0, yb + 0.05, PW - 4.1, 1.1, 'Committee members arrive with twelve months of repayment '
                                                   'history. That history is the data Mashreq needs to start '
                                                   'lending safely, beginning with asset financing for motorcycles '
                                                   'and machines bought through asset circles.', size=12.5,
           color=INK, spacing=1.08)
    else:
        stat(sl, PM + 0.3, yb - 0.02, 3.4, 'Rs 27.6 million', 'of Islamic financing at 30 June 2026 [2]', nsize=24,
             tsize=11, lh=0.5)
        tb(sl, PM + 4.0, yb + 0.05, PW - 4.1, 1.1, 'Raqami plans auto, fleet and supply chain financing. Committee '
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
        steps = [('Open', None, 'NEO account and debit card', 'in about five minutes'),
                 ('Salary in', 'banknote', 'Islamic Current Profit Account', 'profit on the daily balance, up to 2%'),
                 ('Held until the 8th', 'piggy-bank', 'Islamic Savings Account',
                  'the committee balance; 10% below Rs 1.5 million'),
                 ('Payout', 'send', 'Free instant transfer', 'the pot, the same day'),
                 ('Abroad', 'plane', 'Mashreq Pakistan Account', 'families in the UAE')]
        new = [(1, 'repeat', 'Direct debit mandate', 'collects each instalment on payday'),
               (2, 'umbrella', 'Takaful or insurance', 'circles between strangers; Mashreq chooses the operator'),
               (3, 'bike', 'Asset financing', 'ijarah for motorcycles and machines')]
        src = ['Mashreq NEO Pakistan product pages, rate sheets and schedule of charges (July to December 2026), read '
               '30 September 2026; rates are up to or indicative figures']
    else:
        steps = [('Open', None, 'Asaan Digital Account', 'CNIC and mobile number'),
                 ('Salary in', 'banknote', 'Mudarabah Savings Account', '10.5% in August 2026'),
                 ('Held until the 8th', 'calendar-clock', '7 day Mudarabah Certificate', '10% in August 2026'),
                 ('Payout', 'send', 'Free Raqami transfer', 'the pot, the same day'),
                 ('Cash in', 'landmark', 'Askari Bank branches', 'free cash deposits at 700+')]
        new = [(1, 'repeat', 'Standing instruction', 'debit on payday, on Raqami’s planned open APIs'),
               (2, 'umbrella', 'Committee takaful', 'with EFU window takaful, Raqami’s partner'),
               (3, 'bike', 'Asset financing', 'ijarah for motorcycles and machines')]
        src = ['Raqami products page, FAQ, home page and Historical Profit Rates (August 2026), read 30 September 2026']
    n = len(steps)
    cw = PW / float(n)
    yl = 2.36
    ts = 0.62
    line(sl, PM + cw / 2, yl, RX - cw / 2, yl, TH, 4.0)
    xs = []
    for i, (st_, ic, prod, det) in enumerate(steps):
        xc = PM + cw * (i + 0.5)
        xs.append(xc)
        tb(sl, xc - cw / 2, 1.68, cw, 0.35, st_, size=13, bold=True, color=INK, align=CEN)
        oval(sl, xc - 0.13, yl - 0.13, 0.26, WHITE, line=TH, lw=2.5)
        line(sl, xc, yl + 0.14, xc, 2.66, TH_MID, 1.5)
        if ic is None:
            logo_tile(sl, ACCOUNT_TILE, xc - ts / 2, 2.7, ts)
        else:
            tile(sl, xc - ts / 2, 2.7, ts, 'bank', ic)
        words(sl, xc - cw / 2 + 0.1, 3.4, cw - 0.2, 1.0, prod, det, tsize=11.5, bsize=10.5, align=CEN)
    yb = 4.72
    tb(sl, PM, yb - 0.17, 1.5, 0.34, 'New lines', size=13, bold=True, color=INK)
    path(sl, [(PM + 1.55, yb), (RX - 0.1, yb)], TEAL, 2.5, dash=True)
    for idx, ic, t, d in new:
        xc = xs[idx]
        oval(sl, xc - 0.11, yb - 0.11, 0.22, WHITE, line=TEAL, lw=2.0)
        line(sl, xc, yb + 0.12, xc, yb + 0.27, TEAL, 1.5)
        tile(sl, xc - 0.29, yb + 0.3, 0.58, 'ins', ic)
        words(sl, xc - cw / 2 + 0.1, yb + 0.96, cw - 0.2, 0.9, t, d, tsize=11.5, bsize=10.5, align=CEN)
    x_ = swatch(sl, PM, 6.5, 'bank', 'existing %s product' % BN)
    swatch(sl, x_, 6.5, 'ins', 'new line')
    tb(sl, 5.6, 6.48, RX - 5.6, 0.3, 'Profit on the committee balance returns to members as points (Appendix A5).',
       size=10, color=INK, align=R)
    sources(sl, src)
    say(sl, notes)


# ======================================================================= ONBOARDING
def s_onboarding():
    notes = notes_v5('onboarding')
    sl = new_slide('Onboarding and Verification', '%s opens the account; Halqa’s checks decide which circles and '
                                                   'turns each member may join' % BN)
    lanes = [('Member', 'person', 1.68, 2.55), (BN, 'bank', 2.55, 3.45), ('Halqa checks', 'halqa', 3.45, 4.45)]
    for name, kind, ya, yb_ in lanes:
        s_ = 0.42
        yc = (ya + yb_) / 2
        if kind == 'person':
            ptile(sl, PM, yc - s_ / 2, s_)
        elif kind == 'bank':
            logo_tile(sl, BANK_TILE, PM, yc - s_ / 2, s_)
        else:
            logo_tile(sl, HALQA_MARK, PM, yc - s_ / 2, s_)
        tb(sl, PM + 0.54, ya, 1.4, yb_ - ya, name, size=12.5, bold=True, color=INK, anchor=MIDDLE)
        rule(sl, PM, ya, PW, LINE_, 0.75)
    rule(sl, PM, 4.45, PW, LINE_, 0.75)
    d = 0.44
    # member lane: sign up
    sx, sy = 2.45, 2.115 - d / 2
    tile(sl, sx, sy, d, 'slate', 'smartphone', circle=True)
    words(sl, sx + d + 0.12, sy - 0.06, 1.5, d + 0.12, 'Sign up', 'phone and PIN', tsize=12, bsize=9.5,
          anchor=MIDDLE)
    # bank lane: account
    ax, ay = 4.1, 3.0 - d / 2
    tile(sl, ax, ay, d, 'bank', 'landmark', circle=True)
    tb(sl, ax + d + 0.12, ay, 1.0, d, 'Account', size=12, bold=True, color=INK, anchor=MIDDLE)
    acct = 'CNIC, NADRA biometric check, due diligence' if MQ_ else 'CNIC and registered mobile number'
    tb(sl, 5.72, ay, 3.2, d, acct, size=10, color=INK, anchor=MIDDLE)
    # Halqa lane: four checks
    hc = [(6.3, 'Identity', 'scan-face'), (8.0, 'Income', 'banknote'), (9.7, 'Affordability', 'scale'),
          (11.4, 'Score', 'gauge')]
    hy = 3.55
    for i, (cxh, t, ic) in enumerate(hc):
        tile(sl, cxh - d / 2, hy, d, 'lime_dk', ic, circle=True)
        tb(sl, cxh - 0.85, hy + d + 0.03, 1.7, 0.28, t, size=11.5, bold=True, color=INK, align=CEN)
        if i < 3:
            arrow(sl, cxh + d / 2 + 0.06, hy + d / 2, hc[i + 1][0] - d / 2 - 0.06, hy + d / 2, 'flow')
    # member lane: what the member sees
    ex = 11.4 - d / 2
    tile(sl, ex, sy, d, 'slate', 'eye', circle=True)
    words(sl, 6.6, sy - 0.08, ex - 0.12 - 6.6, d + 0.16, 'Sees only the circles and turns open to them', None,
          tsize=11.5, align=R, anchor=MIDDLE)
    arrow_path(sl, [(sx + d / 2, sy + d + 0.06), (sx + d / 2, ay + d / 2), (ax - 0.06, ay + d / 2)], 'flow')
    arrow_path(sl, [(ax + d / 2, ay + d + 0.06), (ax + d / 2, hy + d / 2), (hc[0][0] - d / 2 - 0.06, hy + d / 2)],
               'flow')
    arrow(sl, 11.4, hy - 0.06, 11.4, sy + d + 0.06, 'flow')
    cy = 4.68
    cw4 = (PW - 3 * 0.3) / 4.0
    rules = [('Identity', 'scan-face', ['Names on CNIC, account and app match:', 'Identity Engine:',
                                        '0.90 or more passes; 0.80 to 0.90 goes to a person', 'Live face match',
                                        'Home and job checked']),
             ('Income', 'banknote', ['Salary from one employer on about the same day each month',
                                     'Daily circles: Rs 1,000 or more on 5 days a week for 8 weeks',
                                     'Own transfers and loans excluded', 'Verified using income verification engine']),
             ('Affordability', 'scale', ['All instalments within a third of verified income',
                                         'Within 40% including other loans, the State Bank limit']),
             ('Score', 'gauge', ['From 300 to 850', 'Decides which turns open',
                                 'New members start in the last three turns'])]
    for i, (t, ic, items) in enumerate(rules):
        x = PM + i * (cw4 + 0.3)
        tile(sl, x, cy, 0.32, 'lime_dk', ic, circle=True)
        tb(sl, x + 0.42, cy, cw4 - 0.42, 0.32, t, size=12.5, bold=True, color=LIME_DK, anchor=MIDDLE)
        blist(sl, x, cy + 0.42, cw4, 1.9, items, size=10.5, bcolor=LIME_DK, gap=2.5)
    say(sl, notes)


# ======================================================================= TYPES
def s_types():
    notes = notes_v5('types')
    six = MQ_
    sl = new_slide('Committee Types', '%s types; the less the members know each other, the more checks apply'
                   % ('Six' if six else 'Five'))
    types = [('Known', 0, 'handshake'), ('Unknown', 1, 'users'), ('Large unknown', 1, 'users-round'),
             ('Asset', 1, 'bike')]
    if six:
        types.append(('UAE family', 0, 'plane'))
    types.append(('Hyper', 2, 'zap'))
    rows = [('Members', ['6 to 12', '12', '20', '12'] + (['6 to 12'] if six else []) + ['390 to 400']),
            ('Instalment', ['Rs 2,000 to 10,000', 'Rs 2000 to 10,000', 'Rs 10,000 to 25,000', 'Rs 10,000']
             + (['any amount'] if six else []) + ['Rs 450 to 500 a day']),
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
    dd = 0.48
    for j, (t, lvl, ic) in enumerate(types):
        x = PM + lw_ + j * cwt
        tile(sl, x + cwt / 2 - dd / 2, y0, dd, None, ic, circle=True, fill_=LV[lvl],
             glyph=(INK if lvl == 0 else WHITE))
        tb(sl, x, y0 + 0.52, cwt, 0.26, t, size=12, bold=True, color=INK, align=CEN)
        tb(sl, x, y0 + 0.77, cwt, 0.22, 'check level %d%s' % (lvl + 1, ', experimental' if t == 'Hyper' else ''),
           size=9, color=INK, align=CEN)
    xh = PM + lw_ + (n - 1) * cwt
    rect(sl, xh + 0.03, 1.36, cwt - 0.06, 0.26, AMBER, paras=[('Experimental', dict(size=10.5, bold=True,
                                                                                  color=INK, align=CEN))],
         pad=0.02, anchor=MIDDLE)
    ry = y0 + 1.04
    rule(sl, PM, ry, PW, INK, 0.75)
    for i, (lb, vals) in enumerate(rows):
        rh = 0.6 if lb == 'Typical members' else 0.41
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
    ly = ry + 0.1
    harvey(sl, PM + 0.1, ly + 0.13, 0.17, 2)
    tb(sl, PM + 0.27, ly, 1.1, 0.26, 'required', size=10, color=INK)
    harvey(sl, PM + 1.3, ly + 0.13, 0.17, 0)
    tb(sl, PM + 1.47, ly, 1.3, 0.26, 'not required', size=10, color=INK)
    lx = PM + 2.9
    for k in range(3):
        oval(sl, lx, ly + 0.04, 0.18, LV[k])
        tb(sl, lx + 0.25, ly, 1.3, 0.26, 'check level %d' % (k + 1), size=10, color=INK)
        lx += 1.45
    tb(sl, lx + 0.1, ly, RX - lx - 0.1, 0.26, 'In every type, early turns must be earned.', size=10, color=INK)
    say(sl, notes)


# ======================================================================= DEFAULT PREVENTION
def s_prevention():
    notes = notes_v5('prevention')
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
    plot_x0, plot_w = PM + 0.08, 6.45
    col_chart(sl, plot_x0, 4.8, plot_w, 1.02, [str(k) for k in range(1, 13)], vals, pc, lambda v: '%d' % v, 110,
              gap=0.3, lsize=9, csize=9.5)
    colw = plot_w / 12.0
    for a_, b_, lb in [(1, 6, 'Turns 1 to 6: score 650 or more'), (7, 9, '7 to 9: 550 or more'),
                       (10, 12, '10 to 12: any score')]:
        xa = plot_x0 + (a_ - 1) * colw + 0.04
        xb_ = plot_x0 + b_ * colw - 0.04
        yb_ = 6.2
        line(sl, xa, yb_, xb_, yb_, INK, 0.75)
        line(sl, xa, yb_ - 0.07, xa, yb_, INK, 0.75)
        line(sl, xb_, yb_ - 0.07, xb_, yb_, INK, 0.75)
        tb(sl, xa, yb_ + 0.03, xb_ - xa, 0.3, lb, size=9.5, color=INK, align=CEN, spacing=1.0)
    tb(sl, PM, 6.52, 6.7, 0.26, 'New members start in the last three turns until two circles complete cleanly.',
       size=10, color=INK)
    rx0 = 7.75
    rw = RX - rx0
    tb(sl, rx0, 4.18, rw, 0.3, 'If a member stops after collecting', size=12, bold=True, color=INK)
    rec = [('1', 'Contact and a hardship plan', AMBER), ('2', 'Account restricted; score down 200', AMBER),
           ('3', '%s pays the members left short' % INS_C, TEAL), ('4', 'Mutual guarantee: the balance falls due',
                                                                   RED),
           ('5', 'Civil suit on the undertaking', RED), ('6', 'Summary suit, only on a guarantee cheque', RED)]
    for i, (n_, t, col) in enumerate(rec):
        y = 4.55 + i * 0.33
        oval(sl, rx0, y + 0.04, 0.24, col, paras=[(n_, dict(size=9, bold=True, color=text_on(col), align=CEN))],
             pad=0, anchor=MIDDLE)
        tb(sl, rx0 + 0.34, y, rw - 0.37, 0.32, t, size=10.5, color=INK, anchor=MIDDLE)
    tb(sl, rx0, 6.52, rw, 0.26, 'Recovery detail: Appendix A4', size=10, color=INK)
    sources(sl, ['Default Prevention (HQ-CP-05); seat bands confirmed mandatory 28 September 2026; State Bank 40 per '
                 'cent limit, BPRD Circular Letter 29 of 2021'])
    say(sl, notes)


# ======================================================================= REVENUE
def s_revenue():
    notes = notes_v5('revenue')
    sl = new_slide('Revenue and Business Model', 'How one instalment is split, where Halqa’s income comes from and '
                                                 'its technical running cost')
    xtitle(sl, PM, 1.62, 8.0, 'One instalment on a circle between strangers', 'Rs')
    tb(sl, PM, 1.92, 8.0, 0.26, 'The member pays Rs 11,047', size=10.5, color=INK)
    y1, h1 = 2.38, 0.74
    k1 = PW / 11047.0
    wb, wt, wf = 10000 * k1, 547 * k1, 500 * k1
    rect(sl, PM, y1, wb - 0.02, h1, BLUE)
    rect(sl, PM + wb, y1, wt - 0.02, h1, TEAL)
    rect(sl, PM + wb + wt, y1, wf, h1, TH)
    tb(sl, PM + 0.22, y1, 8.5, h1, [[('Rs 10,000', dict(size=18, bold=True, color=WHITE)),
                                     ('    to the member collecting', dict(size=12.5, color=WHITE))]],
       anchor=MIDDLE)
    y2, h2 = 3.72, 0.74
    poly(sl, [(PM + wb, y1 + h1), (RX, y1 + h1), (RX, y2), (PM, y2)], SOFT)
    line(sl, PM + wb, y1 + h1, PM, y2, AXIS, 0.75, dash=True)
    kz = PW / 1047.0
    rect(sl, PM, y2, 547 * kz - 0.02, h2, TEAL)
    rect(sl, PM + 547 * kz, y2, 500 * kz, h2, TH)
    tb(sl, PM + 0.22, y2, 547 * kz - 0.3, h2, [[('Rs 547', dict(size=15, bold=True, color=WHITE)),
                                                ('    %s' % INS, dict(size=12, color=WHITE))]], anchor=MIDDLE)
    tb(sl, PM + 547 * kz + 0.22, y2, 500 * kz - 0.3, h2, [[('up to Rs 500', dict(size=15, bold=True, color=WHITE)),
                                                           ('    fee to %s, shared with Halqa' % BN,
                                                            dict(size=12, color=WHITE))]], anchor=MIDDLE)
    by = 4.98
    cw2 = (PW - 0.6) / 2.0
    tile(sl, PM, by, 0.4, 'halqa', 'coins')
    tb(sl, PM + 0.52, by, cw2 - 0.52, 0.4, 'Income lines', size=12.5, bold=True, color=INK, anchor=MIDDLE)
    tb(sl, PM, by + 0.56, cw2, 1.3, [[('Now:  ', dict(size=11.5, bold=True, color=INK)),
                                      ('a share of the fee %s collects; a share of %s’s income on committee balances'
                                       % (BN, BN), dict(size=11.5, color=INK))],
                                     ([('Later:  ', dict(size=11.5, bold=True, color=INK)),
                                       ('asset financing referrals (2 to 4% from the financier, 1 to 3% from the '
                                        'dealer); marketplace commission on points; employer programmes',
                                        dict(size=11.5, color=INK))], dict(before=5))], spacing=1.05)
    ux = PM + cw2 + 0.6
    tile(sl, ux, by, 0.4, 'slate', 'receipt')
    tb(sl, ux + 0.52, by, cw2 - 0.52, 0.4, 'Unit costs', size=12.5, bold=True, color=INK, anchor=MIDDLE)
    ue = [('Rs 13 to 35', 'to run one payment'), ('Rs %s' % format(int(round(TECH_FIXED, -3)), ','),
                                                  'fixed technical cost a month'),
          ('About Rs %d' % int(round(CONTRIB, -1)), 'contribution a member a month')]
    uw = cw2 / 3.0
    for i, (n_, t) in enumerate(ue):
        stat(sl, ux + i * uw, by + 0.56, uw - 0.15, n_, t, nsize=19, tsize=10.5, lh=0.55)
    sources(sl, ['Technical prices read 30 September 2026: Vercel, Supabase, Sentry, Google Workspace, Apple; US$1 = '
                 'Rs 290 on a card (interbank Rs 277.3 on 29 September)', 'Business Model and Unit Costs (HQ-CP-03), '
                 'updated for the Rs 15 Hyper fee; before the bank’s terms'])
    say(sl, notes)


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
    y0 = 1.62
    hh = 0.66
    rh = 0.52 if MQ_ else 0.49
    tot_h = hh + len(crit) * rh
    x1 = PM + lw14
    rect(sl, x1, y0, cwc, tot_h, TH_XLT)
    fit_pic(sl, DUO, x1 + 0.12, y0 + 0.08, cwc - 0.24, hh - 0.16)
    fit_pic(sl, UA('oraan.png'), x1 + cwc + 0.15, y0 + 0.12, 1.6, hh - 0.24, ha='l')
    jx = x1 + 2 * cwc + 0.15
    ix, iy_, iw, ih = fit_pic(sl, UA('jc_icon.png'), jx, y0 + 0.12, 0.52, hh - 0.24, ha='l')
    fit_pic(sl, UA('jc_committee.png'), ix + iw + 0.06, y0 + 0.17, cwc - 0.3 - iw - 0.06, hh - 0.34, ha='l')
    tb(sl, x1 + 3 * cwc + 0.15, y0, cwc - 0.2, hh, 'Informal committee', size=12, bold=True, color=INK,
       anchor=MIDDLE)
    rule(sl, PM, y0 + hh, PW, INK, 0.75)
    for i, (lb, cells) in enumerate(crit):
        y = y0 + hh + i * rh
        tb(sl, PM, y, lw14 - 0.1, rh, lb, size=11.5, bold=True, color=INK, anchor=MIDDLE, spacing=1.0)
        for j, (lv, note) in enumerate(cells):
            xc = x1 + j * cwc + 0.15
            if lv is not None:
                harvey(sl, xc + 0.11, y + rh / 2, 0.21, lv)
            tb(sl, xc + 0.32, y, cwc - 0.45, rh, note, size=10.5, color=INK, italic=lv is None, anchor=MIDDLE,
               spacing=1.0)
        rule(sl, PM, y + rh, PW, LINE_, 0.5)
    yl = y0 + tot_h + 0.12
    for k, (lv, t) in enumerate([(2, 'yes'), (1, 'partly'), (0, 'no')]):
        harvey(sl, PM + 0.1 + k * 1.1, yl + 0.13, 0.17, lv)
        tb(sl, PM + 0.27 + k * 1.1, yl, 0.8, 0.26, t, size=10, color=INK)
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
        tb(sl, xy(yr) - 0.3, 1.66, 0.6, 0.26, str(yr), size=10, color=INK, align=CEN)
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
        tb(sl, PM, y + 0.08, 2.45, 0.28, ctry, size=10.5, color=INK)
        line(sl, xy(start), y, xy(2026), y, col, 3.5)
        oval(sl, xy(start) - 0.09, y - 0.09, 0.18, col)
        for yr, lb in ms:
            oval(sl, xy(yr) - 0.1, y - 0.1, 0.2, WHITE, line=col, lw=2.0)
            if yr >= 2024:
                tb(sl, xy(yr) - 2.2, y + 0.12, 2.3, 0.28, lb, size=10, color=INK, align=R)
            else:
                tb(sl, xy(yr) - 0.1, y + 0.12, 3.6, 0.28, lb, size=10, color=INK)
        tb(sl, 8.7, y - 0.3, RX - 8.7, 0.3, now, size=12.5, bold=True, color=INK)
        tb(sl, 8.7, y + 0.03, RX - 8.7, 0.5, how, size=10.5, color=INK, spacing=1.02)
    yb = 5.55
    accent(sl, PM, yb, 1.05, TH)
    tile(sl, PM + 0.3, yb, 0.42, 'bank', 'globe')
    tb(sl, PM + 0.86, yb, PW - 1.0, 0.42, 'Common pattern', size=12.5, bold=True, color=INK, anchor=MIDDLE)
    tb(sl, PM + 0.3, yb + 0.52, PW - 0.45, 0.6, 'Each grew inside the formal system: a central bank sandbox or permit, '
                                                'a partner bank, or reporting to the credit bureaus. The same sequence '
                                                'is proposed with %s.' % BN, size=11.5, color=INK, spacing=1.05)
    sources(sl, ['Daily News Egypt, 20 Oct 2025', 'MENAbytes, 3 Sep 2020; Semafor, 3 Feb 2026', 'CNBC, 11 Dec 2025'])
    say(sl, notes)


# ======================================================================= MARKET TIMING (chart as shapes)
def s_timing():
    _V5['timing']()
    sl = prs.slides[len(prs.slides) - 1]
    drop_charts(sl)
    col_chart(sl, PM + 0.15, 2.35, 5.9, 3.35, ['FY2023', 'FY2024', 'FY2025', 'Jan to Mar 2026'], [78, 85, 88, 92],
              [TH] * 4, lambda v: '%d%%' % v, 100, gap=0.45, lsize=11, csize=11)


# ======================================================================= CURRENT STATUS
def s_status():
    notes = notes_v5('status')
    sl = new_slide('Current Status')
    cols = [('Built', 'lime_dk', 'hammer', LIME_DK, ['Member application in preview: sign up, circles, automatic '
                                                    'payment settings, activity, credit report, Hyper (experimental)',
                                                    'Checks: identity, income, affordability and score',
                                                    'Payday collection with retries',
                                                    'Records, receipts and statements']),
            ('Written', 'pay', 'file-text', BLUE, ['Legal position checked against twelve laws and regulations',
                                                   'Six risk and pricing models',
                                                   'Default prevention and recovery design',
                                                   'Business model and unit costs']),
            ('To do', 'bank', 'list-todo', TH, ['Incorporation: private limited company, registered office in '
                                                'Islamabad', 'Agreement with %s' % BN,
                                                'Product approval through %s' % BN,
                                                'Connection to %s’s account, %s and payment interfaces, and the PSP'
                                                % (BN, B['mandate']),
                                                '%s operator and TASDEEQ reporting route' % INS_C])]
    cw = (PW - 2 * 0.45) / 3.0
    y0 = 1.55
    for i, (t, kind, ic, bc, items) in enumerate(cols):
        x = PM + i * (cw + 0.45)
        tile(sl, x, y0, 0.58, kind, ic)
        tb(sl, x + 0.74, y0, cw - 0.74, 0.58, t, size=18, bold=True, color=INK, anchor=MIDDLE)
        line(sl, x, y0 + 0.78, x + cw, y0 + 0.78, bc, 3.0)
        blist(sl, x + 0.05, y0 + 1.02, cw - 0.1, 4.2, items, size=13, bcolor=bc, gap=11, spacing=1.06)
    say(sl, notes)


# ======================================================================= SUMMARY
def s_summary():
    notes = notes_v5('summary')
    sl = new_slide('Summary', 'The proposal, the roles of each party and the benefits to each')
    rows = [('history', 'Background', 'About 4 in 10 Pakistanis save in committees. Almost all of it is cash, held by '
                                      'one organiser, outside any bank, with no record of who paid.'),
            ('handshake', 'Proposal', 'Halqa runs committees in its application. Every member holds a %s account; %s '
                                      'collects each instalment and pays each pot. Wallets and cards connect through '
                                      'a licensed PSP.' % (BN, BN)),
            ('users', 'Roles', 'Halqa: rules, turn order, member checks, reminders and records. %s: accounts, '
                               'collection, payouts and profit. A licensed %s operator protects members.' % (BN, INS)),
            ('landmark', 'Regulation', 'Through %s’s licence, with Halqa acting as its service provider under the '
                                       'State Bank’s outsourcing framework.' % BN),
            ('circle-check', 'Status', 'The application is built and runs in preview. No member money has moved.')]
    x0, lw_, w_ = PM, 1.95, 7.25
    y0, rh = 1.7, 1.0
    for i, (ic, lb, txt) in enumerate(rows):
        yy = y0 + i * rh
        tile(sl, x0, yy + 0.08, 0.32, 'bank', ic, circle=True)
        tb(sl, x0 + 0.44, yy + 0.08, lw_ - 0.44, 0.4, lb, size=13, bold=True, color=TH_DK)
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
    vrule(sl, rx0 - 0.4, 1.72, 4.95, LINE_, 0.75)
    for k, (title, items, y, h) in enumerate([('For members', mem, 1.7, 2.62), ('For %s' % BN, bank, 4.47, 2.3)]):
        if k == 0:
            ptile(sl, rx0, y, 0.46)
        else:
            logo_tile(sl, BANK_TILE, rx0, y, 0.46)
        tb(sl, rx0 + 0.6, y, rw - 0.6, 0.46, title, size=13.5, bold=True, color=INK, anchor=MIDDLE)
        blist(sl, rx0 + 0.02, y + 0.58, rw - 0.05, h - 0.62, items, size=11.5, bcolor=LIME_DK if k == 0 else TH,
              gap=3.5)
    sources(sl, ['Karandaaz and Oraan estimates, Dawn, 12 December 2022', '%s half year report to 30 June 2026, '
                 'at the bank’s own average deposit' % BFULL])
    say(sl, notes)


# ======================================================================= APPENDIX A2: COLLECTION
def s_collection():
    notes = notes_v5('collection')
    sl = new_slide('Payment Collection', appx('A2', 'three collection methods; the automatic method is a new %s '
                                                    'from %s' % (B['mandate'], BN)))
    mw = (PW - 2 * 0.5) / 3.0
    meth = [('Method 1', 'One-tap approval', ('pay', 'smartphone'),
             'The member approves a payment request by card, mobile wallet or Raast.',
             'Known circles, and when an automatic debit fails'),
            ('Method 2', 'Automatic debit', ('bank', 'repeat'),
             'A %s on the member’s %s account, a new line for %s; or a saved card or wallet charged through the '
             'PSP.' % (B['mandate'], BN, BN),
             'Required on circles between strangers, asset%s and Hyper circles' % (', UAE family' if MQ_ else '')),
            ('Method 3', 'Manual payment', ('slate', 'hand-coins'),
             'The member sends the instalment from any bank account or wallet.',
             'Always available')]
    y0 = 1.7
    for i, (tag, name, (kind, ic), desc, use) in enumerate(meth):
        x = PM + i * (mw + 0.5)
        tile(sl, x, y0, 0.62, kind, ic, circle=True)
        tb(sl, x + 0.78, y0 - 0.02, mw - 0.78, 0.66, [(tag, dict(size=10, color=INK)),
                                                     (name, dict(size=15, bold=True, color=INK))], anchor=MIDDLE,
           spacing=1.0)
        tb(sl, x, y0 + 0.82, mw, 0.85, desc, size=11.5, color=INK, spacing=1.05)
        tb(sl, x, y0 + 1.72, mw, 0.6, [[('Used for: ', dict(size=10.5, bold=True, color=INK)),
                                        (use, dict(size=10.5, color=INK))]], spacing=1.03)
        if i < 2:
            vrule(sl, x + mw + 0.25, y0, 2.4, LINE_, 0.75)
    xtitle(sl, PM, 4.3, 7.8, 'One instalment, day by day', 'days of the month')
    dw = 7.8 / 12.0
    cy = 4.68
    dd = 0.5
    line(sl, PM + dw / 2, cy + dd / 2, PM + 11.5 * dw, cy + dd / 2, LINE_, 2.0)
    fills = {1: TH, 2: TH_MID, 3: TH_MID, 4: TH_MID, 5: TH_MID, 8: INK, 9: AMBER, 10: AMBER, 11: AMBER, 12: AMBER}
    for dday in range(1, 13):
        x = PM + (dday - 1) * dw + (dw - dd) / 2
        col = fills.get(dday, GRID)
        oval(sl, x, cy, dd, col, paras=[(str(dday), dict(size=12, bold=True, color=text_on(col), align=CEN))],
             pad=0, anchor=MIDDLE)
    for dday, span, t in [(1, 1, 'payday: first debit'), (2, 4, 'a retry each morning, 5 attempts at most'),
                          (8, 1, 'due date'), (9, 4, 'late charges: 2%, then 5%, then 10%')]:
        x = PM + (dday - 1) * dw
        tb(sl, x + 0.03, cy + 0.6, dw * span - 0.06, 0.5, t, size=10, color=INK, spacing=1.0)
    tb(sl, PM, 5.95, 7.8, 0.6, 'The evening before payday the member gets a reminder on WhatsApp. The payday is '
                               'learned from the account the salary arrives in.', size=10.5, color=INK,
       spacing=1.04)
    rx0 = 8.85
    rw = RX - rx0
    tb(sl, rx0, 4.3, rw, 0.3, 'Rules on every automatic debit', size=12, bold=True, color=INK)
    rules = [('At most one instalment each time', 0.3), ('Only on the circle’s schedule', 0.3),
             ('Cancelling moves the member to method 1 or 3; the commitment to the circle stays', 0.52),
             ('A missed amount is held against the member’s own pot, never owed to Halqa', 0.52)]
    yy = 4.72
    for t, hh in rules:
        icon(sl, 'shield-check', rx0, yy + 0.01, 0.24, TH_DK)
        tb(sl, rx0 + 0.34, yy, rw - 0.34, hh, t, size=10.5, color=INK, spacing=1.02)
        yy += hh
    say(sl, notes)


# ======================================================================= APPENDIX A3: WALLETS AND PSP
def s_psp():
    notes = notes_v5('psp')
    sl = new_slide('Wallets and PSP Integration', appx('A3', 'how money in a wallet, a card or another bank '
                                                             'reaches the committee account at %s' % BN))
    cA, cB, cD = PM, 3.75, 9.0
    for x, w_, t in [(cA, 2.6, 'Where the money is'), (cB, 2.6, 'Route'), (6.75, 2.0, 'At %s' % BN),
                     (cD, RX - cD, 'Payout')]:
        tb(sl, x, 1.62, w_, 0.28, t, size=10.5, bold=True, color=INK)
    hy = 1.98
    logo_tile(sl, HALQA_MARK, cB, hy, 0.44)
    words(sl, cB + 0.56, hy - 0.05, 3.9, 0.54, 'Halqa platform', 'sends requests by API; receives confirmations',
          tsize=11.5, bsize=10, anchor=MIDDLE)
    ts = 0.46
    ry = [2.95, 3.72, 4.49, 5.26]
    mid = [r + ts / 2 for r in ry]
    src = [('banktile', '%s account' % BN, None), (('slate', 'landmark'), 'Another bank account', None),
           (('pay', 'wallet'), 'Mobile wallet', 'JazzCash, Easypaisa and others'),
           (('pay', 'credit-card'), 'Debit card', None)]
    for i, (vis, t, sub) in enumerate(src):
        if vis == 'banktile':
            logo_tile(sl, BANK_TILE, cA, ry[i], ts)
        else:
            tile(sl, cA, ry[i], ts, vis[0], vis[1])
        words(sl, cA + ts + 0.12, ry[i] - 0.08, 1.98, ts + 0.16, t, sub, tsize=11, bsize=9, anchor=MIDDLE)
    bw_t = 1.8
    tile(sl, cB, ry[0], ts, 'bank', 'repeat')
    words(sl, cB + ts + 0.12, ry[0] - 0.06, bw_t, ts + 0.12, B['mandate_c'], None, tsize=11, anchor=MIDDLE)
    tile(sl, cB, ry[1], ts, 'pay', 'zap')
    words(sl, cB + ts + 0.12, ry[1] - 0.06, bw_t, ts + 0.12, 'Raast transfer', None, tsize=11, anchor=MIDDLE)
    yP = (ry[2] + ry[3]) / 2
    yPm = yP + ts / 2
    tile(sl, cB, yP, ts, 'pay', 'shield-check')
    words(sl, cB + ts + 0.12, yP - 0.2, bw_t, ts + 0.4, 'Licensed PSP', 'tokenised wallet and card payments',
          tsize=11.5, bsize=9.5, anchor=MIDDLE)
    ax0 = cA + ts + 0.12 + 1.98 + 0.05
    for i in range(2):
        arrow(sl, ax0, mid[i], cB - 0.06, mid[i], 'money')
    arrow(sl, ax0, mid[2], cB - 0.06, yPm - 0.08, 'money')
    arrow(sl, ax0, mid[3], cB - 0.06, yPm + 0.08, 'money')
    # the three routes merge into one line into the committee account
    hs = 0.86
    hx, hyy = 7.1, 4.33 - 0.43
    bus0, bus = cB + ts + 0.12 + bw_t + 0.05, 6.42
    col_m, lw_m, _ = AR['money']
    path(sl, [(bus0, mid[0]), (bus, mid[0]), (bus, yPm), (bus0, yPm)], col_m, lw_m)
    line(sl, bus0, mid[1], bus, mid[1], col_m, lw_m)
    arrow(sl, bus, hyy + hs / 2, hx - 0.07, hyy + hs / 2, 'money')
    tile(sl, hx, hyy, hs, 'bank', 'vault')
    words(sl, hx + hs / 2 - 0.88, hyy + hs + 0.06, 1.76, 0.7, 'Committee account',
          'held about 7 days; profit on the balance', tsize=12, bsize=10, align=CEN)
    arrow_path(sl, [(hx + hs + 0.07, hyy + 0.2), (8.55, hyy + 0.2), (8.55, mid[0]), (cD - 0.07, mid[0])], 'money')
    ptile(sl, cD, ry[0], ts)
    words(sl, cD + ts + 0.12, ry[0] - 0.06, RX - cD - ts - 0.12, ts + 0.12, 'Collector’s %s account' % BN,
          'the pot on the 8th', tsize=11, bsize=9.5, anchor=MIDDLE)
    arrow(sl, cB + ts / 2, hy + 0.44 + 0.06, cB + ts / 2, ry[0] - 0.07, 'instr')
    arrow(sl, hx + 0.3, 2.42, hx + 0.3, hyy - 0.07, 'instr')
    arrow(sl, hx + 0.62, hyy - 0.07, hx + 0.62, 2.42, 'data')
    ph_h = 3.05
    pw_ = ph_h * PH_RATIO
    phone_at(sl, 'm_methods', cD, 3.62, ph_h)
    tx = cD + pw_ + 0.2
    stp = [('Link', 'wallet or card linked once; the PSP keeps the token'),
           ('Collect', 'on payday, under the member’s consent'),
           ('Settle', 'into the committee account at %s' % BN),
           ('Confirm', 'Halqa records and reconciles daily')]
    yy = 3.66
    for i, (t, dsc) in enumerate(stp):
        tb(sl, tx, yy, RX - tx, 0.72, [[('%d  %s  ' % (i + 1, t), dict(size=10, bold=True, color=TH_DK)),
                                        (dsc, dict(size=10, color=INK))]], spacing=1.02)
        yy += 0.74
    legend(sl, PM, 6.12, [('money', 'money'), ('instr', 'request'), ('data', 'confirmation')])
    x_ = swatch(sl, PM, 6.44, 'bank', BN)
    x_ = swatch(sl, x_, 6.44, 'pay', 'wallets, cards and payment networks')
    swatch(sl, x_, 6.44, 'halqa', 'Halqa')
    say(sl, notes)


# ======================================================================= APPENDIX A4: RECOVERY
def s_recovery():
    notes = notes_v5('recovery')
    sl = new_slide('Recovery', appx('A4', 'steps after a member stops paying having already collected the pot'))
    steps = [('Contact', 'a hardship plan and a new date', AMBER),
             ('Restrict', 'account restricted; score down 200', AMBER),
             ('Claim', 'the %s operator pays the members left short' % INS, TEAL),
             ('Guarantee', 'the mutual guarantee: the balance falls due', RED),
             ('Civil suit', 'on the signed undertaking', RED),
             ('Cheque', 'a summary suit, only where a guarantee cheque is held', RED)]
    sw, gap = 1.9, 0.146
    base = 5.05
    xs_ = [PM + i * (sw + gap) for i in range(6)]
    tops = [base - (0.95 + i * 0.36) for i in range(6)]
    ends = [xs_[i] + sw + gap for i in range(5)] + [RX]
    pts = [(PM, base)]
    for i in range(6):
        pts += [(xs_[i], tops[i]), (ends[i], tops[i])]
    pts += [(RX, base)]
    poly(sl, pts, C('F3F4F6'))
    for i, (t, dsc, col) in enumerate(steps):
        seg = [(xs_[i], tops[i]), (ends[i], tops[i])]
        if i < 5:
            seg.append((ends[i], tops[i + 1]))
        path(sl, seg, col, 3.5)
        oval(sl, xs_[i] + 0.1, tops[i] + 0.13, 0.34, col, paras=[(str(i + 1), dict(size=12, bold=True,
                                                                                    color=text_on(col),
                                                                                    align=CEN))], pad=0,
             anchor=MIDDLE)
        tb(sl, xs_[i] + 0.52, tops[i] + 0.12, sw - 0.58, 0.36, t, size=12.5, bold=True, color=INK, anchor=MIDDLE)
        tb(sl, xs_[i] + 0.12, tops[i] + 0.55, sw - 0.22, base - tops[i] - 0.58, dsc, size=10.5, color=INK,
           spacing=1.03)
    line(sl, PM, base, RX, base, INK, 0.75)
    tb(sl, PM, base + 0.06, 6.5, 0.28, 'Each step is used only if the one before it fails.', size=10.5, color=INK)
    cxs = xs_[2] + sw / 2
    tile(sl, 6.95, 1.68, 0.5, 'ins', 'umbrella')
    words(sl, 7.57, 1.62, 3.1, 0.62, 'Members left short are paid in full', 'by the %s operator, in their own names'
          % INS, tsize=11.5, bsize=10, anchor=MIDDLE)
    arrow_path(sl, [(6.95 - 0.07, 1.93), (cxs, 1.93), (cxs, tops[2] - 0.08)], 'money')
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
    say(sl, notes)


# ======================================================================= APPENDIX A5: POINTS
def s_points():
    notes = notes_v5('points')
    sl = new_slide('Points and Rewards', appx('A5', 'profit on committee balances and on-time payments, returned '
                                                    'to members as points'))
    earn = [(('halqa', 'piggy-bank'), 'Profit on committee balances', 'paid at the end of each circle'),
            (('halqa', 'circle-check'), 'On-time payments', 'at most half of Halqa’s fee on that instalment'),
            (('halqa', 'crown'), 'Hosting', 'circles that complete cleanly')]
    if MQ_:
        earn.append((('bank', 'banknote'), 'Bought with money', 'as a Mashreq product, under its licence'))
    spend = [(('pay', 'shopping-bag'), 'Halqa marketplace', 'goods from partner sellers'),
             (('pay', 'store'), 'E-commerce partners', 'online purchases'),
             ('banktile', '%s rewards' % BN, 'with the bank’s own rewards')]
    ts = 0.46
    tb(sl, PM, 1.62, 3.3, 0.28, 'Earn', size=11, bold=True, color=INK)
    pitch = 0.6 if len(earn) > 3 else 0.68
    e_mid = []
    for i, (vis, t, dsc) in enumerate(earn):
        y = 2.0 + i * pitch
        tile(sl, PM, y, ts, vis[0], vis[1])
        words(sl, PM + ts + 0.14, y - 0.08, 2.75, ts + 0.16, t, dsc, tsize=11.5, bsize=10, anchor=MIDDLE)
        e_mid.append(y + ts / 2)
    hcx, hcy, hd = 6.35, 2.9, 1.0
    tile(sl, hcx - hd / 2, hcy - hd / 2, hd, 'bank', 'coins', circle=True)
    tb(sl, hcx - 1.5, hcy + hd / 2 + 0.05, 3.0, 0.85, [('Points', dict(size=18, bold=True, color=INK, align=CEN)),
                                                       ('1 point = Rs 1', dict(size=13, color=TH_DK, align=CEN)),
                                                       ('held in the member’s account', dict(size=10, color=INK,
                                                                                            align=CEN))],
       spacing=1.0)
    for ym in e_mid:
        arrow(sl, 3.95, ym, hcx - hd / 2 - 0.08, hcy + (ym - hcy) * 0.35, 'flow')
    sx0 = 8.95
    tb(sl, sx0, 1.62, RX - sx0, 0.28, 'Spend', size=11, bold=True, color=INK)
    for i, (vis, t, dsc) in enumerate(spend):
        ym = hcy + (i - 1) * 0.62
        y = ym - ts / 2
        if vis == 'banktile':
            logo_tile(sl, BANK_TILE, sx0, y, ts)
        else:
            tile(sl, sx0, y, ts, vis[0], vis[1])
        words(sl, sx0 + ts + 0.14, y - 0.08, RX - sx0 - ts - 0.14, ts + 0.16, t, dsc, tsize=11.5, bsize=10,
              anchor=MIDDLE)
        arrow(sl, hcx + hd / 2 + 0.08, hcy + (ym - hcy) * 0.35, sx0 - 0.08, ym, 'flow')
    by = 4.62
    xtitle(sl, PM, by, PW, 'Worked example: profit on one circle of 12 at Rs 10,000', 'per month and per circle')
    items = [('Rs 120,000', 'held each month', 0), ('7 of 365 days', 'payday to the 8th', 0),
             ('10% a year', 'Islamic Savings Account' if MQ_ else '7 day Mudarabah Certificate', 0),
             ('Rs 230', 'profit a month', 0), ('Rs 2,760', 'over 12 months', 0), ('230 points', 'to each member', 1)]
    ops = [u'×', u'×', '=', '>', '>']
    opw = 0.42
    n_c = len(items)
    bwc = (PW - (n_c - 1) * opw) / n_c
    cy = 5.02
    for i, (num, lb, hi) in enumerate(items):
        x = PM + i * (bwc + opw)
        tb(sl, x, cy, bwc, 0.4, num, size=17, bold=True, color=TH_DK if hi else INK, align=CEN)
        line(sl, x + 0.3, cy + 0.47, x + bwc - 0.3, cy + 0.47, TH if hi else LINE_, 2.5 if hi else 1.25)
        tb(sl, x, cy + 0.52, bwc, 0.3, lb, size=10, color=INK, align=CEN)
        if i < n_c - 1:
            if ops[i] == '>':
                arrow(sl, x + bwc + 0.07, cy + 0.22, x + bwc + opw - 0.07, cy + 0.22, 'flow')
            else:
                tb(sl, x + bwc, cy - 0.02, opw, 0.44, ops[i], size=18, bold=True, color=INK, align=CEN,
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
    ny = 6.08
    accent(sl, PM, ny, 0.62, TH)
    tb(sl, PM + 0.3, ny, PW - 0.35, 0.62, [note], anchor=MIDDLE, spacing=1.04)
    sources(sl, ['%s product rates%s; bank decisions of 28 September 2026 (D4, D9)'
                 % (BN, ' (Islamic Savings Account, 10% indicative below Rs 1.5 million)' if MQ_ else
                    ' (Historical Profit Rates, August 2026)')])
    say(sl, notes)


# ======================================================================= APPENDIX A6: REGULATION
def s_regulation():
    notes = notes_v5('regulation')
    sl = new_slide('Regulation and Compliance', appx('A6', 'regulation through %s’s licence, with Halqa as its '
                                                           'service provider' % BN))
    ts = 0.5
    con = AXIS
    tile(sl, PM, 1.74, ts, 'slate', 'landmark')
    words(sl, PM + ts + 0.14, 1.66, 3.5, 0.66, 'State Bank of Pakistan', 'regulates %s, payments and the PSP' % BN,
          tsize=12.5, bsize=10, anchor=MIDDLE)
    x1 = PM + 0.55
    line(sl, PM + ts / 2, 1.74 + ts + 0.04, PM + ts / 2, 3.08, con, 1.25)
    line(sl, PM + ts / 2, 3.08, x1 - 0.06, 3.08, con, 1.25)
    lx, ly, lw_, lh_ = fit_pic(sl, BANK_LOGO, x1, 2.78, 1.6 if not MQ_ else 0.9, 0.6, ha='l')
    tb(sl, lx + lw_ + 0.14, 2.78, 2.6, 0.6, 'licence, accounts, payments', size=10.5, color=INK, anchor=MIDDLE)
    x2 = x1 + 0.55
    tr = x1 + 0.28
    line(sl, tr, 3.46, tr, 5.02, con, 1.25)
    sb = 'Raqami’s Shariah Board' if not MQ_ else 'Mashreq’s Shariah Board'
    line(sl, tr, 3.98, x2 - 0.06, 3.98, con, 1.25)
    tile(sl, x2, 3.98 - ts / 2, ts, 'bank', 'book-open-check')
    words(sl, x2 + ts + 0.14, 3.98 - 0.33, 2.55, 0.66, sb, 'certifies each Islamic product', tsize=11.5, bsize=10,
          anchor=MIDDLE)
    line(sl, tr, 5.02, x2 - 0.06, 5.02, con, 1.25)
    logo_tile(sl, HALQA_MARK, x2, 4.77, ts)
    tb(sl, x2 + ts + 0.14, 4.7, 2.55, 1.95, [('Halqa: service provider', dict(size=11.5, bold=True, color=INK)),
                                             ('Rules, checks, application and records. Holds no member money. Works '
                                              'under the outsourcing framework, with audit rights for %s and the '
                                              'State Bank.' % BN, dict(size=10.5, color=INK, before=2))],
       spacing=1.05)
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
