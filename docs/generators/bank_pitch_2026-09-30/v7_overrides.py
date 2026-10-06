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
