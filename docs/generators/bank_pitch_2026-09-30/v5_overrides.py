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
                                    '%s; %s on circles between strangers' % (B['mandate_c'], INS)]),
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
