# -*- coding: utf-8 -*-
"""
Builds the partnership presentation for Mashreq Bank Pakistan (HQ-BK-03), 28 September 2026.

Built small on purpose: the file is uploaded to Google Drive inside a single call and converted to
Google Slides there. Shapes only, two 3 KB logos, one slide layout, no thumbnail, no charts.

Rules: third person only (no you, your, we, our); no dashes; noun headings; lime logo top right;
counterparties named as not contracted; no rounded shapes.
"""
import io, math, os, re, sys, zipfile
from lxml import etree
from pptx import Presentation
from pptx.util import Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.oxml.ns import qn

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, 'logo-dark-s.png')
LOGO_LIGHT = os.path.join(HERE, 'logo-light-s.png')
OUT = os.path.join(HERE, 'Halqa-Mashreq-Proposal.pptx')


def C(h):
    return RGBColor.from_string(h)


DEEP, PINE, MID = C('0C1408'), C('41801A'), C('41801A')   # lime ramp: l700 for text, l500 fills
LIME, LIME_BR, LIME_LT = C('6DC72A'), C('8ADC42'), C('E3F8CA')
IVORY, INK, GREY, GREY_LT = C('F3FCE7'), C('0C1408'), C('5F6B58'), C('A9B4A3')
WHITE, TINT, PALE, RULE = C('FFFFFF'), C('F5F7F2'), C('D2E2C6'), C('C9D6BF')
DISPLAY, BODY = 'Georgia', 'Arial'
L, R, CEN = PP_ALIGN.LEFT, PP_ALIGN.RIGHT, PP_ALIGN.CENTER
TOP, MIDDLE = MSO_ANCHOR.TOP, MSO_ANCHOR.MIDDLE

W, H, M = 13.333, 7.5, 0.62
CW = W - 2 * M
FOOT = 'Halqa   Proposal to Mashreq Bank Pakistan Limited'


def E(v):
    return int(round(v * 914400))


prs = Presentation()
prs.slide_width, prs.slide_height = E(W), E(H)
BLANK = [lay for lay in prs.slide_layouts if lay.name == 'Blank'][0]
for lay in list(prs.slide_layouts):
    if lay.name != 'Blank':
        prs.slide_layouts.remove(lay)
PAGE = [0]


# ------------------------------------------------------------------ text ---
def _runs(p, text, st):
    """text is a string ('**' toggles bold) or a list of (text, style) runs."""
    segs = []
    if isinstance(text, list):
        for t, s2 in text:
            segs.append((t, dict(st, **s2)))
    else:
        for k, seg in enumerate(text.split('**')):
            if seg:
                segs.append((seg, dict(st, bold=st.get('bold') or k % 2 == 1)))
    for seg, s in segs:
        r = p.add_run()
        r.text = seg.upper() if s.get('caps') else seg
        f = r.font
        f.size = Pt(s.get('size', 12))
        f.name = s.get('font', BODY)
        f.color.rgb = s.get('color', INK)
        if s.get('bold'):
            f.bold = True
        if s.get('track'):
            r.font._rPr.set('spc', str(int(s['track'] * 100)))


def fill(tf, paras, **st):
    """paras: list of str, (text, style) or (runs, style). Style keys: size color font bold align
    spacing gap caps track bullet num."""
    tf.word_wrap = True
    if isinstance(paras, str):
        paras = [paras]
    for i, item in enumerate(paras):
        text, own = (item if isinstance(item, tuple) else (item, {}))
        s = dict(st, **own)
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        if s.get('align', L) != L:
            p.alignment = s['align']
        elif p._p.pPr is not None and p._p.pPr.get('algn') is not None:
            del p._p.pPr.attrib['algn']   # autoshapes start with a centred first paragraph
        if s.get('spacing'):
            p.line_spacing = s['spacing']
        if s.get('gap'):
            p.space_after = Pt(s['gap'])
        if s.get('bullet') or s.get('num'):
            pPr = p._p.get_or_add_pPr()
            ind = E(s.get('ind', 0.24))
            pPr.set('marL', str(ind))
            pPr.set('indent', str(-ind))
            if s.get('bullet'):
                bc = etree.SubElement(pPr, qn('a:buClr'))
                etree.SubElement(bc, qn('a:srgbClr')).set('val', str(s.get('bcolor', LIME)))
                etree.SubElement(pPr, qn('a:buSzPct')).set('val', '75000')
                etree.SubElement(pPr, qn('a:buFont')).set('typeface', 'Arial')
                etree.SubElement(pPr, qn('a:buChar')).set('char', u'■')
            else:
                bc = etree.SubElement(pPr, qn('a:buClr'))
                etree.SubElement(bc, qn('a:srgbClr')).set('val', str(s.get('bcolor', MID)))
                etree.SubElement(pPr, qn('a:buFont')).set('typeface', 'Arial')
                etree.SubElement(pPr, qn('a:buAutoNum')).set('type', 'arabicPeriod')
        _runs(p, text, s)


def _frame(tf, pad, anchor, force=False):
    if isinstance(pad, (int, float)):
        pad = (pad, pad * 0.75, pad, pad * 0.75)
    tf.margin_left, tf.margin_top, tf.margin_right, tf.margin_bottom = [E(v) for v in pad]
    if anchor != TOP or force:   # autoshapes default to a centred anchor; text boxes to the top
        tf.vertical_anchor = anchor


def tb(sl, x, y, w, h, paras, pad=0, anchor=TOP, **st):
    box = sl.shapes.add_textbox(E(x), E(y), E(w), E(h))
    _frame(box.text_frame, pad, anchor)
    fill(box.text_frame, paras, **st)
    return box


# ---------------------------------------------------------------- shapes ---
def _nostyle(shape):
    st = shape._element.find(qn('p:style'))
    if st is not None:
        shape._element.remove(st)


def rect(sl, x, y, w, h, color=None, line=None, lw=0.75, rot=0, paras=None, pad=0.18, anchor=TOP, **st):
    s = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, E(x), E(y), E(w), E(h))
    _nostyle(s)
    if color is not None:
        s.fill.solid()
        s.fill.fore_color.rgb = color
    else:
        s.fill.background()
    if line is not None:
        s.line.color.rgb = line
        s.line.width = Pt(lw)
    else:
        s.line.fill.background()
    if rot:
        s.rotation = rot
    if paras is not None:
        _frame(s.text_frame, pad, anchor, force=True)
        fill(s.text_frame, paras, **st)
    return s


def line(sl, x1, y1, x2, y2, color=PINE, lw=1.0, arrow=False):
    c = sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, E(x1), E(y1), E(x2), E(y2))
    _nostyle(c)
    c.line.color.rgb = color
    c.line.width = Pt(lw)
    if arrow:
        te = etree.SubElement(c.line._get_or_add_ln(), qn('a:tailEnd'))
        te.set('type', 'triangle')
        te.set('w', 'med')
        te.set('len', 'med')
    return c


def table(sl, x, y, w, rows, widths, size=11.5, hsize=11, rh=0.4, first_bold=True, shade=None,
          aligns=None, valign=MIDDLE):
    nr, nc = len(rows), len(rows[0])
    g = sl.shapes.add_table(nr, nc, E(x), E(y), E(w), E(rh * nr))
    t = g.table
    t.first_row = False
    t.horz_banding = False
    sid = t._tbl.tblPr.find(qn('a:tableStyleId'))
    if sid is None:
        sid = etree.SubElement(t._tbl.tblPr, qn('a:tableStyleId'))
    sid.text = '{2D5ABB26-0587-4C30-8999-92F81FD0307C}'   # No Style, No Grid
    tot = float(sum(widths))
    for j, cw in enumerate(widths):
        t.columns[j].width = E(w * cw / tot)
    for i in range(nr):
        t.rows[i].height = E(rh)
        for j in range(nc):
            c = t.cell(i, j)
            c.vertical_anchor = valign
            head = i == 0
            tcPr = c._tc.get_or_add_tcPr()
            lnB = etree.SubElement(tcPr, qn('a:lnB'))
            lnB.set('w', str(int((1.25 if head else 0.75) * 12700)))
            sf = etree.SubElement(lnB, qn('a:solidFill'))
            etree.SubElement(sf, qn('a:srgbClr')).set('val', str(PINE if head else RULE))
            if shade and i in shade:
                c.fill.solid()
                c.fill.fore_color.rgb = shade[i]
            bold = head or (first_bold and j == 0)
            fill(c.text_frame, [rows[i][j]], size=hsize if head else size, bold=bold,
                 color=PINE if head else INK, align=(aligns[j] if aligns else L))
    return g


# ----------------------------------------------------------------- chrome ---
def slide(label, title, sub=None):
    sl = prs.slides.add_slide(BLANK)
    PAGE[0] += 1
    tb(sl, M, 0.40, 8.5, 0.25, label, size=9, color=MID, bold=True, caps=True, track=1.5)
    tb(sl, M, 0.64, 10.6, 0.6, title, size=30, color=PINE, font=DISPLAY)
    if sub:
        tb(sl, M, 1.33, 11.3, 0.55, sub, size=14, color=GREY, spacing=1.05)
    pic = sl.shapes.add_picture(LOGO, 0, E(0.42), height=E(0.36))
    pic.left = E(W - M) - pic.width
    tb(sl, M, 7.08, 8, 0.22, FOOT, size=8, color=GREY)
    tb(sl, W - M - 1.0, 7.08, 1.0, 0.22, str(PAGE[0]), size=8, color=GREY, align=R)
    return sl


def source(sl, text, y=6.62):
    tb(sl, M, y, CW, 0.36, text, size=9, color=GREY, spacing=1.05)


def ring(sl, cx, cy, r, bw, bh, lit=9, on=None, off=None):
    """Twelve seats in a circle, drawn as spokes: the Halqa mark. Seat `lit` collects."""
    for k in range(12):
        a = math.radians(k * 30)
        px, py = cx + r * math.sin(a), cy - r * math.cos(a)
        rect(sl, px - bw / 2, py - bh / 2, bw, bh, color=(on or INK) if k == lit else (off or WHITE), rot=k * 30)


def steps(sl, y, h, items, pad=0.16, gap=0.34, body_size=11.5):
    n = len(items)
    bw = (CW - (n - 1) * gap) / n
    for i, (ttl, when, body) in enumerate(items):
        x = M + i * (bw + gap)
        paras = [(str(i + 1), dict(size=22, font=DISPLAY, color=MID, gap=2)),
                 (ttl, dict(size=15, font=DISPLAY, color=PINE, gap=2))]
        if when:
            paras.append((when, dict(size=9.5, bold=True, color=MID, caps=True, track=0.5, gap=6)))
        paras.append((body, dict(size=body_size, spacing=1.1)))
        rect(sl, x, y, bw, h, color=TINT, paras=paras, pad=pad)
        if i < n - 1:
            line(sl, x + bw + 0.05, y + 0.42, x + bw + gap - 0.05, y + 0.42, color=PINE, lw=1.5, arrow=True)


# ================================================================ 1 COVER ===
sl = prs.slides.add_slide(BLANK)
PAGE[0] += 1
rect(sl, 8.3, 0, W - 8.3, H, color=LIME)
ring(sl, 8.3 + (W - 8.3) / 2, 3.6, 1.45, 0.2, 0.6)
sl.shapes.add_picture(LOGO, E(0.9), E(0.8), height=E(0.55))
tb(sl, 0.9, 2.3, 7, 0.3, 'Partnership proposal', size=11, color=PINE, bold=True, caps=True, track=2)
tb(sl, 0.9, 2.7, 7.2, 1.5, ['Halqa and', 'Mashreq Bank Pakistan'], size=40, color=INK, font=DISPLAY,
   spacing=0.95)
tb(sl, 0.9, 4.3, 6.8, 1.0, 'Committee savings held and moved by the bank under its licence, with the '
   'committees run by Halqa.', size=16, color=GREY, spacing=1.12)
tb(sl, 0.9, 6.0, 6, 0.3, 'Taha Amjed, Chairman, Halqa', size=12, color=INK, bold=True)
tb(sl, 0.9, 6.34, 6, 0.3, 'October 2026   Reference HQ-BK-03', size=10, color=GREY)
tb(sl, 8.3, 5.6, W - 8.3, 0.3, 'Twelve members: one collects each month', size=10.5, color=INK, align=CEN)

# ============================================================= 2 PROPOSAL ===
sl = slide('The partnership', 'Proposal',
           'Mashreq holds and moves all committee money under its licence. Halqa runs the committees.')
cards = [('Money', 'Every member opens a Mashreq account. Instalments, pots, savings and profit stay inside '
                   'Mashreq, under its licence. Halqa holds no member money.'),
         ('System', 'Halqa runs the circles: rules, order of collection, credit and seat bands, verification '
                    'models, reminders, recovery, points, the turn market and the application.'),
         ('Gains', 'Low cost deposits, customers who arrive in groups, women savers, an Islamic product, '
                   'overseas Pakistanis and a lending book built on real payment records.'),
         ('Choices', 'Mashreq chooses the cover for defaults (guarantee, insurance or takaful), the credit '
                     'reporting route (TASDEEQ or Mashreq), the fee share and the pilot limits.')]
cw = (CW - 3 * 0.3) / 4
for i, (hd, body) in enumerate(cards):
    rect(sl, M + i * (cw + 0.3), 2.05, cw, 3.2, color=TINT, pad=0.22, paras=[
        ('0%d' % (i + 1), dict(size=26, font=DISPLAY, color=MID, gap=4)),
        (hd, dict(size=18, font=DISPLAY, color=PINE, gap=8)),
        (body, dict(size=13.5, spacing=1.12))])
rect(sl, M, 5.6, CW, 0.78, color=LIME, pad=0.3, anchor=MIDDLE,
     paras=[('Halqa is the system. The bank is the machine.', dict(size=20, font=DISPLAY, color=INK))])

# =============================================================== 3 MARKET ===
sl = slide('The case for Mashreq', 'Market',
           'Committees are a savings habit that already exists outside the banks.')
NFIS = 'National Financial Inclusion Strategy 2024 to 2028, reported by Profit, 13 January 2025'
HY = 'Mashreq Bank Pakistan, Directors’ Review, half year to 30 June 2026'
stats = [('41%', 'of the population uses committees', 'Oraan’s figures, reported by Dawn, 27 September 2021'),
         ('US$5bn', 'rotates through committees in a year, at most', 'The same'),
         ('64%', 'of adults held a financial account in 2023; the target is 75 per cent by 2028', NFIS),
         ('34%', 'gender gap in financial inclusion in 2023; the target is 25 per cent by 2028', 'The same'),
         ('36%', 'of adults had no bank account in 2023', 'Arab News, 25 November 2025'),
         ('137 million', 'mobile banking application users, nearly', HY),
         ('12 billion', 'retail digital transactions in a year, nearly, up from about 6.9 billion', HY),
         ('11.5%', 'policy rate, kept unchanged in September 2026', 'The Nation, 15 September 2026')]
cw = (CW - 3 * 0.3) / 4
for i, (num, lab, src) in enumerate(stats):
    r_, c_ = divmod(i, 4)
    x, y = M + c_ * (cw + 0.3), 2.02 + r_ * 2.12
    rect(sl, x, y, 0.14, 0.14, color=LIME)
    tb(sl, x, y + 0.2, cw, 0.6, num, size=32, color=PINE, font=DISPLAY)
    tb(sl, x, y + 0.86, cw - 0.1, 1.2, [(lab, dict(size=12, spacing=1.08, gap=5)),
                                        (src, dict(size=9, color=GREY, spacing=1.05))])
tb(sl, M, 6.3, CW, 0.4, 'Money that moves today in cash and personal transfers can move through a bank.',
   size=16, color=PINE, font=DISPLAY)

# ================================================================ 4 ROLES ===
sl = slide('The partnership', 'Roles', 'Halqa is the system. The bank is the machine.')
colw = 5.25
lx, rx = M, W - M - colw
rect(sl, lx, 2.0, colw, 0.62, color=LIME, pad=0.25, anchor=MIDDLE,
     paras=[('Halqa: the system', dict(size=19, font=DISPLAY, color=INK))])
rect(sl, rx, 2.0, colw, 0.62, color=LIME_LT, pad=0.25, anchor=MIDDLE,
     paras=[('Mashreq: the machine', dict(size=19, font=DISPLAY, color=PINE))])
bl = dict(size=14, bullet=True, gap=11, ind=0.3)
tb(sl, lx + 0.05, 2.9, colw - 0.1, 2.6, [
    'Circles, rules and the order of collection',
    'Credit bands and seat bands on every seat',
    'Verification and affordability models',
    'The application, reminders and recovery',
    'Points, marketplace and turn market',
    'Payment records for credit reporting'], **bl)
tb(sl, rx + 0.05, 2.9, colw - 0.1, 2.6, [
    'Accounts, account opening and customer checks',
    'Direct debit mandates, collection and payouts',
    'Short term savings and profit on balances',
    'Cover for defaults, in the form it chooses',
    'Credit reporting, if chosen, and asset financing',
    'Money laundering monitoring and Shariah approval'], **bl)
ax1, ax2 = lx + colw + 0.18, rx - 0.18
tb(sl, ax1, 3.18, ax2 - ax1, 0.3, 'Instructions', size=10, color=GREY, align=CEN)
line(sl, ax1, 3.52, ax2, 3.52, color=PINE, lw=1.5, arrow=True)
tb(sl, ax1, 4.18, ax2 - ax1, 0.3, 'Confirmations', size=10, color=GREY, align=CEN)
line(sl, ax2, 4.52, ax1, 4.52, color=PINE, lw=1.5, arrow=True)
rect(sl, M, 5.8, CW, 0.7, color=TINT, pad=0.25, anchor=MIDDLE, paras=[
    ('Halqa never holds member money. Every instruction Halqa sends is executed, recorded and confirmed by '
     'Mashreq.', dict(size=13))])

# ========================================================== 5 MONEY ROUTE ===
sl = slide('The partnership', 'Money Route',
           'One month of a monthly circle. Every rupee stays inside Mashreq.')
steps(sl, 2.05, 2.8, [
    ('Salary', 'Payday', 'Salary arrives in the member’s Mashreq account, or the member moves money in '
                         'from any bank.'),
    ('Savings', 'To the 8th', 'The instalment waits in a short term savings product for about seven days '
                              'and earns profit.'),
    ('Debit', 'The 8th', 'Mashreq debits the instalment under the member’s mandate: contribution, cover '
                         'and fee.'),
    ('Pot', 'The 8th', 'Contributions gather in the circle’s account at Mashreq.'),
    ('Payout', 'Payout day', 'Mashreq pays the pot to the collecting member’s account, less any '
                             'arrears.'),
    ('Reward', 'End of circle', 'Profit on the circle’s balances is credited as points, one point for '
                                'each rupee.')])
rect(sl, M, 5.2, CW, 0.95, color=LIME_LT, pad=0.25, anchor=MIDDLE, paras=[
    ('**Halqa’s part.** Halqa sends every instruction and keeps the circle’s ledger. Each morning it '
     'matches the ledger with Mashreq’s statement. Halqa never holds member money.',
     dict(size=13, spacing=1.1))])

# =========================================================== 6 COLLECTION ===
sl = slide('The partnership', 'Collection',
           'A direct debit mandate at Mashreq comes first. The three existing routes stay behind it.')
ladder = [('Mashreq direct debit mandate', 'The member authorises Mashreq once, inside the Halqa application. '
           'Mashreq debits the member’s account on the due date.', 'New. Default for every member'),
          ('One approval payment', 'Card, wallet or Raast Request to Pay through Safepay, approved by the '
           'member in one step.', 'Tier 1'),
          ('Saved card auto debit', 'A merchant initiated charge on a card saved with Safepay. Halqa stores '
           'no card data.', 'Tier 2'),
          ('Manual payment', 'Raast or bank transfer into the member’s Mashreq account from any bank or '
           'wallet.', 'Tier 3. Always available')]
lw_ = 7.75
for i, (ttl, body, tag) in enumerate(ladder):
    y = 2.02 + i * 1.1
    rect(sl, M, y, lw_, 0.98, color=LIME_LT if i == 0 else TINT, pad=(0.85, 0.1, 2.0, 0.08), paras=[
        (ttl, dict(size=15, font=DISPLAY, color=PINE, gap=3)), (body, dict(size=11.5, spacing=1.08))])
    rect(sl, M, y, 0.62, 0.98, color=LIME, pad=0, anchor=MIDDLE,
         paras=[(str(i + 1), dict(size=20, font=DISPLAY, color=INK, align=CEN))])
    tb(sl, M + lw_ - 1.95, y + 0.12, 1.8, 0.5, tag, size=9.5, color=MID, bold=True, caps=True, track=0.5,
       align=R, spacing=1.05)
rect(sl, M + lw_ + 0.35, 2.02, CW - lw_ - 0.35, 4.28, color=LIME_LT, pad=0.26, paras=[
    ('Rules', dict(size=18, font=DISPLAY, color=PINE, gap=8)),
    ('Attempts on the due date, then once a day for up to five days; collection stops at the first '
     'success.', dict(size=13, color=INK, bullet=True, bcolor=PINE, gap=8, spacing=1.08)),
    ('No debit exceeds one instalment.', dict(size=13, color=INK, bullet=True, bcolor=PINE, gap=8)),
    ('Cancelling a mandate returns the member to manual payment. It does not end the member’s '
     'commitment to the circle.', dict(size=13, color=INK, bullet=True, bcolor=PINE, gap=8,
                                       spacing=1.08)),
    ('Every route settles into the circle’s account at Mashreq.',
     dict(size=13, color=INK, bullet=True, bcolor=PINE, spacing=1.08))])
source(sl, 'Safepay holds a payment service provider licence from the State Bank of Pakistan, granted in April '
           '2025. No agreement is signed with Safepay or with Mashreq.')

# ========================================================== 7 ECONOMICS ===
sl = slide('The case for Mashreq', 'Illustrative Economics',
           'On stated assumptions, 100,000 members add about Rs 2.5 billion of deposits and 100,000 accounts.')
tb(sl, M, 2.0, 5.9, 0.35, 'Customer deposits, Rs billion', size=15, color=PINE, font=DISPLAY)
bars = [('Mashreq, 30 June 2026', 8.5, 'over 8.5', PINE), ('10,000 members', 0.25, '0.25', LIME),
        ('100,000 members', 2.5, '2.5', LIME), ('1,000,000 members', 25, '25', LIME)]
lab_w, plot_w = 1.95, 3.1
px0 = M + lab_w
for i, (lab, v, disp, col) in enumerate(bars):
    y = 2.6 + i * 0.7
    tb(sl, M, y + 0.08, lab_w - 0.12, 0.3, lab, size=11, align=R)
    bw = max(0.03, plot_w * v / 25.0)
    rect(sl, px0, y, bw, 0.42, color=col)
    tb(sl, px0 + bw + 0.08, y + 0.08, 0.95, 0.3, disp, size=11, color=PINE, bold=True)
line(sl, px0, 2.5, px0, 5.2, color=PINE, lw=0.75)
tb(sl, M, 5.4, 5.9, 0.7, 'Mashreq reported customer deposits of over Rs 8.5 billion and more than 350,000 '
   'customers at 30 June 2026. Member bars show balances added on the assumptions below.',
   size=11, color=GREY, spacing=1.08)
table(sl, 6.92, 2.0, W - M - 6.92, [
    ['Active members', '10,000', '100,000', '1,000,000'],
    ['Committee money a month', 'Rs 80m', 'Rs 800m', 'Rs 8bn'],
    ['Average balances', 'Rs 250m', 'Rs 2.5bn', 'Rs 25bn'],
    ['Net margin to the bank a year', 'Rs 10m', 'Rs 100m', 'Rs 1bn'],
    ['New accounts', '10,000', '100,000', '1,000,000']],
      [0.4, 0.2, 0.2, 0.2], size=12, hsize=12, rh=0.46, aligns=[L, R, R, R])
rect(sl, 6.92, 4.6, W - M - 6.92, 1.72, color=TINT, pad=0.22, paras=[
    ('Other gains', dict(size=15, font=DISPLAY, color=PINE, gap=5)),
    ('Women savers: 84 per cent of Oraan’s savers in 2021', dict(size=11.5, bullet=True, gap=3)),
    ('Customers who arrive in groups of 6 to 20', dict(size=11.5, bullet=True, gap=3)),
    ('An Islamic product and a route to overseas Pakistanis', dict(size=11.5, bullet=True, gap=3)),
    ('Fee income from cover and from financing', dict(size=11.5, bullet=True))])
source(sl, 'Assumptions, to be replaced by Mashreq’s own figures: an average instalment of Rs 8,000 a month; an '
           'average balance of Rs 25,000 a member once salaries move to Mashreq; a net margin to the bank of 4 per '
           'cent a year after the profit credited to members. ' + HY + '. Dawn, 27 September 2021.', y=6.5)

# ======================================================= 8 FIT WITH MASHREQ ===
sl = slide('The case for Mashreq', 'Fit with Mashreq',
           'Mashreq’s published aims match what committees bring.')
table(sl, M, 2.0, CW, [
    ['Mashreq’s published aim or position', 'What Halqa adds'],
    ['To serve 10 million Pakistanis in five years', 'Accounts opened in groups, one circle at a time'],
    ['A partner for salaried professionals, freelancers, women entrepreneurs and overseas Pakistanis',
     'The same people, who already save through committees'],
    ['Islamic first digital banking', 'An interest free product with one flat fee and a takaful option'],
    ['Accounts for non resident Pakistanis from the UAE: 9,000+ accounts and over Rs 265 million of deposits',
     'Committees that join family members in the UAE and in Pakistan'],
    ['No advances at 30 June 2026', 'A lending pipeline built on payment records, starting with assets'],
    ['Business customers acquired “primarily through strategic partnerships”',
     'A partnership that brings retail customers the same way']],
      [0.52, 0.48], size=13, hsize=12, rh=0.56, first_bold=False)
source(sl, 'Mashreq, press release, 24 November 2025. Mashreq Bank Pakistan Limited, Directors’ Review and '
           'condensed interim financial statements, half year ended 30 June 2026.')

# ========================================================= 9 BANDS ===
sl = slide('Risk and credit', 'Bands and Models',
           'Credit bands and seat bands apply to every seat, with no exception. Halqa advances no money and takes '
           'no seat.')
sq, sg = 0.6, 0.07
for k in range(12):
    col = PINE if k < 6 else (LIME if k < 9 else LIME_LT)
    rect(sl, M + k * (sq + sg), 2.05, sq, sq, color=col, pad=0, anchor=MIDDLE,
         paras=[(str(k + 1), dict(size=13, bold=True, color=INK if k >= 6 else WHITE, align=CEN))])
groups = [(0, 6, 'Seats 1 to 6: Good and Excellent'), (6, 3, 'Seats 7 to 9: Fair and above'),
          (9, 3, 'Seats 10 to 12: every band and new members')]
for k0, n, txt in groups:
    tb(sl, M + k0 * (sq + sg), 2.74, n * (sq + sg) - sg, 0.45, txt, size=10, color=GREY, spacing=1.0)
tb(sl, 8.95, 2.02, W - M - 8.95, 1.1, 'A twelve member circle. The member who collects first still owes eleven '
   'instalments, so the first seats carry the most risk.', size=11.5, color=GREY, spacing=1.1)
table(sl, M, 3.45, 7.1, [
    ['Band', 'Score', 'Seats open', 'Turn market'],
    ['Excellent', '750 and above', 'Any seat', 'Buy and sell'],
    ['Good', '650 to 749', 'Any seat', 'Buy and sell'],
    ['Fair', '550 to 649', 'Second half', 'Buy and sell'],
    ['Rebuilding', 'Below 550', 'Last three', 'May not buy'],
    ['New member', 'Any score', 'Last three, until two clean circles and a verification call', 'By band']],
      [0.2, 0.19, 0.39, 0.22], size=11.5, hsize=11, rh=0.4)
tb(sl, M, 6.28, 7.1, 0.3, 'Halqa scale 300 to 850. A TASDEEQ score of 200 to 600 maps onto it in a straight line.',
   size=10, color=GREY)
rect(sl, 8.1, 3.45, W - M - 8.1, 3.1, color=TINT, pad=0.22, paras=[
    ('Halqa’s models', dict(size=16, font=DISPLAY, color=PINE, gap=6)),
    ('Mashreq’s customer checks at account opening come first', dict(size=11.5, bullet=True, gap=5)),
    ('Income account check; instalments limited to a third of verified income',
     dict(size=11.5, bullet=True, gap=5)),
    ('Exposure score for every circle, with a hard stop when unrecovered exposure exceeds cover',
     dict(size=11.5, bullet=True, gap=5)),
    ('Forward liability check on every seat change and turn trade', dict(size=11.5, bullet=True, gap=5)),
    ('Late ladder with stated steps; arrears taken from the late member’s own pot',
     dict(size=11.5, bullet=True))])

# ========================================================= 10 COVER ===
sl = slide('Risk and credit', 'Cover',
           'Three ways to protect members when an early collector stops paying. Mashreq chooses one.')
opts = [('A', 'Bank guarantee', 'Mashreq guarantees each pot from its balance sheet and prices the risk into '
                                'the fee. Simplest for members; uses the bank’s capital.'),
        ('B', 'Insurance', 'A policy on each circle through the bank’s own insurance arrangements. The '
                           'insurer carries the loss; a premium is part of each instalment.'),
        ('C', 'Takaful', 'Cover from a general takaful operator for the Islamic window. A takaful fund '
                         'carries the loss; a contribution is part of each instalment.')]
cw = (CW - 2 * 0.3) / 3
for i, (lt, hd, body) in enumerate(opts):
    rect(sl, M + i * (cw + 0.3), 2.05, cw, 2.2, color=TINT, pad=0.22, paras=[
        ([(lt + '   ', dict(size=24, font=DISPLAY, color=MID)), (hd, dict(size=18, font=DISPLAY, color=PINE))],
         dict(gap=6)),
        (body, dict(size=12, spacing=1.1))])
table(sl, M, 4.5, CW, [
    ['', 'Guarantee', 'Insurance', 'Takaful'],
    ['Carries the loss', 'Mashreq', 'The insurer', 'The takaful fund'],
    ['Paid through', 'The member fee', 'A premium in each instalment', 'A contribution in each instalment'],
    ['Islamic window', 'Subject to the Shariah board', 'Conventional only', 'Yes']],
      [0.25, 0.25, 0.25, 0.25], size=12, hsize=12, rh=0.38)
tb(sl, M, 6.2, CW, 0.5, 'In every option: mandatory bands, arrears taken from the late member’s own pot, the '
   'late ladder, and a hard stop on any circle whose unrecovered exposure exceeds its cover.', size=12,
   color=PINE, spacing=1.08)

# ================================================= 11 CREDIT REPORTING ===
sl = slide('Risk and credit', 'Credit Reporting',
           'Every payment is reported from the first day of launch. Mashreq chooses the route.')
for i, (lt, hd, body) in enumerate([
        ('A', 'TASDEEQ', 'Payment records reported to TASDEEQ, a credit bureau licensed by the State Bank of '
                         'Pakistan. Members build a record that any lender can read.'),
        ('B', 'Mashreq reports', 'Mashreq reports members’ payment records directly, under its own credit '
                                 'reporting arrangements.')]):
    rect(sl, M, 2.05 + i * 1.72, 6.0, 1.52, color=TINT, pad=0.22, paras=[
        ([(lt + '   ', dict(size=22, font=DISPLAY, color=MID)), (hd, dict(size=17, font=DISPLAY, color=PINE))],
         dict(gap=5)),
        (body, dict(size=12, spacing=1.1))])
tb(sl, M, 5.62, 6.0, 0.6, 'Each member consents at joining, and the consent names the chosen route.',
   size=12, color=GREY)
fx, fw = 7.2, W - M - 7.2
tb(sl, fx, 2.0, fw, 0.4, 'Financing', size=18, color=PINE, font=DISPLAY)
flow = ['Circle completed on time', 'Payment record reported from day one',
        'Mashreq offers financing for motorcycles and appliances', 'Asset circles financed by Mashreq']
for i, t in enumerate(flow):
    y = 2.55 + i * 0.86
    rect(sl, fx, y, fw, 0.62, color=LIME_LT if i == 3 else TINT, pad=0.2, anchor=MIDDLE,
         paras=[(t, dict(size=12.5, color=INK))])
    if i < 3:
        line(sl, fx + 0.4, y + 0.64, fx + 0.4, y + 0.84, color=PINE, lw=1.4, arrow=True)
tb(sl, fx, 6.0, fw, 0.6, 'Mashreq reported no advances at 30 June 2026. Committee records give it a lending '
   'pipeline built on actual payment behaviour.', size=11, color=GREY, spacing=1.08)

# ================================================ 12 POINTS AND MARKETPLACE ===
sl = slide('Product', 'Points and Marketplace',
           'Profit on committee balances returns to members at the end of each circle as points, one point for '
           'each rupee.')
cols = [('Earn', ['Profit on the circle’s balances, at the end of each circle', 'On time payments and '
                  'completed circles', 'Referrals', 'Points bought with money']),
        ('Hold', ['A points balance issued under Mashreq’s licence as the bank’s stored value',
                  'One point equals one rupee', 'No cash withdrawal']),
        ('Spend', ['Goods in the Halqa marketplace from partner online shops', 'Halqa fees',
                   'Turns in the turn market', 'Exchange with the bank’s own rewards'])]
gap = 0.5
cw = (CW - 2 * gap) / 3
for i, (hd, items) in enumerate(cols):
    x = M + i * (cw + gap)
    paras = [(hd, dict(size=18, font=DISPLAY, color=PINE, gap=6))]
    paras += [(t, dict(size=12, bullet=True, gap=5, spacing=1.05)) for t in items]
    rect(sl, x, 2.05, cw, 2.45, color=TINT, pad=0.22, paras=paras)
    if i < 2:
        line(sl, x + cw + 0.07, 3.27, x + cw + gap - 0.07, 3.27, color=PINE, lw=1.6, arrow=True)
cw2 = (CW - 0.3) / 2
rect(sl, M, 4.75, cw2, 1.35, color=LIME_LT, pad=0.22, paras=[
    ('Online marketplaces', dict(size=15, font=DISPLAY, color=PINE, gap=4)),
    ('Points redeemed at checkout or for vouchers with online marketplaces in Pakistan, such as Daraz. None '
     'contracted.', dict(size=12, spacing=1.08))])
rect(sl, M + cw2 + 0.3, 4.75, cw2, 1.35, color=LIME_LT, pad=0.22, paras=[
    ('Bank rewards', dict(size=15, font=DISPLAY, color=PINE, gap=4)),
    ('Points exchanged with Mashreq’s own rewards programme, where one runs, at an agreed rate.',
     dict(size=12, spacing=1.08))])
source(sl, 'Points that can be bought, transferred and redeemed outside Halqa are stored value. They run as '
           'Mashreq’s product, under its licence and its approval.', y=6.35)

# ========================================================= 13 TURN MARKET ===
sl = slide('Product', 'Turn Market', 'Members buy and sell turns with each other, inside the bands.')
steps(sl, 2.05, 2.35, [
    ('List', None, 'The seller lists a turn with an asking price in points or rupees.'),
    ('Offer', None, 'Buyers make offers. The buyer’s band must permit the seat.'),
    ('Accept', None, 'The seller accepts one offer with a PIN.'),
    ('Approve', None, 'The host approves the exchange.'),
    ('Settle', None, 'One transaction swaps the seats and moves the price between accounts at Mashreq.'),
    ('Record', None, 'The price is recorded on the circle’s ledger.')])
rect(sl, M, 4.7, 5.75, 1.9, color=LIME_LT, pad=0.22, paras=[
    ('Example', dict(size=15, font=DISPLAY, color=PINE, gap=5)),
    ('Seat 3 of 12 is listed at 50,000 points. Offers arrive at 35,000 and the two members agree at 40,000. '
     'The buyer, in the Good band, takes seat 3; the seller moves to the buyer’s seat 11.',
     dict(size=12, spacing=1.1))])
rect(sl, M + 6.05, 4.7, CW - 6.05, 1.9, color=TINT, pad=0.22, paras=[
    ('Conditions', dict(size=15, font=DISPLAY, color=PINE, gap=5)),
    ('Not on Hyper or asset circles; a price ceiling for each seat; an exchange fee paid by the buyer',
     dict(size=11.5, bullet=True, gap=4, spacing=1.05)),
    ('Needs Mashreq’s product approval and a Shariah board ruling. Counsel to confirm whether a turn sold '
     'for money is lending between members. Circles that allow turn trades are not labelled Shariah compliant.',
     dict(size=11.5, bullet=True, spacing=1.05))])

# ================================================================ 14 FEES ===
sl = slide('Product', 'Fees',
           'Mashreq collects one flat fee and shares its income from committee accounts with Halqa, so the member '
           'fee can fall.')
bw_, by = 2.0, 2.3
xs = [M, (W - bw_) / 2, W - M - bw_]
for x, t, col, tc in [(xs[0], 'Member', LIME, INK), (xs[1], 'Mashreq', LIME_LT, PINE), (xs[2], 'Halqa', LIME, INK)]:
    rect(sl, x, by, bw_, 0.9, color=col, pad=0.1, anchor=MIDDLE,
         paras=[(t, dict(size=18, font=DISPLAY, color=tc, align=CEN))])
for a, b, t in [(xs[0] + bw_, xs[1], 'Instalment: contribution, cover, fee'),
                (xs[1] + bw_, xs[2], 'Agreed share of income, each month')]:
    tb(sl, a + 0.1, by + 0.08, b - a - 0.2, 0.3, t, size=10.5, color=GREY, align=CEN)
    line(sl, a + 0.12, by + 0.45, b - 0.12, by + 0.45, color=PINE, lw=1.6, arrow=True)
tb(sl, M, 3.65, 6.55, 2.8, [
    'One flat fee per instalment, the same for every seat, never priced by the payout month',
    'Mashreq collects the fee with each instalment as its own income',
    'Halqa receives an agreed share of Mashreq’s income from committee accounts, paid monthly',
    'As Halqa’s share rises, the member fee falls. The cost of cover appears as its own line'],
   size=13, bullet=True, gap=10, spacing=1.08, ind=0.3)
rx_ = M + 6.95
rect(sl, rx_, 3.65, W - M - rx_, 1.3, color=LIME_LT, pad=0.22, paras=[
    ('Illustration', dict(size=15, font=DISPLAY, color=PINE, gap=4)),
    ('Each 10 per cent share of the bank’s net margin is worth about Rs 8 a member a month on the stated '
     'assumptions: Rs 10 million a year at 100,000 members.', dict(size=11.5, spacing=1.08))])
rect(sl, rx_, 5.15, W - M - rx_, 1.3, color=TINT, pad=0.22, paras=[
    ('Comparison', dict(size=15, font=DISPLAY, color=PINE, gap=4)),
    ('Oraan prices by payout month: up to 21 per cent of the pot for the first seat of a ten month committee, '
     'about 54 per cent a year on Halqa’s calculation.', dict(size=11.5, spacing=1.08))])
source(sl, 'Oraan’s published fee table; Halqa, Oraan (HQ-RS-01), 28 September 2026. Assumptions as on the '
           'economics page.')

# ============================================================ 15 PRODUCTS ===
sl = slide('Product', 'Products', 'Monthly circles first. Each later product enters after the pilot, with '
           'Mashreq’s approval.')
table(sl, M, 2.0, CW, [
    ['Product', 'Description', 'Stage'],
    ['Monthly circles', 'Members who know each other, 6 to 20 in a circle, one instalment a month', 'Pilot'],
    ['Short term savings', 'The instalment earns profit between payday and the due date, about seven days',
     'Pilot'],
    ['Open circles', 'Members who do not know each other, matched by band, with cover', 'After the pilot'],
    ['Asset circles', 'Saving towards a motorcycle or an appliance, financed by Mashreq', 'After the pilot'],
    ['Circles across borders', 'Members in the UAE pay from Mashreq accounts for non resident Pakistanis',
     'After the pilot'],
    ['Hyper', 'Daily circles in two options, set out below', 'Experimental']],
      [0.2, 0.62, 0.18], size=12, hsize=11.5, rh=0.4)
table(sl, M, 5.1, CW, [
    ['Hyper, experimental', 'Members', 'Days', 'Payment a day', 'Pot', 'Collecting each day'],
    ['Option 1', '400', '50', 'Rs 450', 'Rs 15,000', '8'],
    ['Option 2', '390', '26, Sundays off', 'Rs 500', 'Rs 8,666.67', '15']],
      [0.22, 0.13, 0.17, 0.16, 0.16, 0.16], size=12, hsize=11.5, rh=0.4)

# ====================================================== 16 MARKET POSITION ===
sl = slide('Position and controls', 'Market Position',
           'A bank that partners now becomes the regulated home for committee money before a competitor does.')
table(sl, M, 2.0, CW, [
    ['Provider', 'Holds the money', 'Pricing', 'Protection'],
    ['Informal committee', 'The organiser, in cash or a personal account', 'Usually none', 'None'],
    ['Oraan', 'Oraan, in its own bank accounts; any return kept by Oraan', 'By payout month, up to 21 per cent '
     'of the pot', 'Oraan guarantees payouts'],
    ['JazzCash Committee', 'The organiser’s wallet; the organiser pays out', 'Not published', 'None stated'],
    ['Halqa with Mashreq', 'Mashreq, under its banking licence', 'One flat fee for every seat',
     'Guarantee, insurance or takaful, as Mashreq chooses']],
      [0.18, 0.32, 0.25, 0.25], size=12.5, hsize=12, rh=0.62, shade={4: LIME_LT})
tb(sl, M, 5.45, CW, 0.7, 'Oraan Financial Services holds an investment finance licence from the SECP (June 2024), '
   'and Oraan has signed an agreement to license its platform to a bank in another market.', size=12.5,
   color=INK, spacing=1.08)
source(sl, 'Halqa, Oraan (HQ-RS-01), 28 September 2026, from Oraan’s own pages, the SECP register and the '
           'press; ProPakistani, 27 July 2026; JazzCash Committee, released August 2026.')

# ===================================================== 17 RISKS AND CONTROLS ===
sl = slide('Position and controls', 'Risks and Controls', 'Each risk Mashreq carries has a stated control.')
table(sl, M, 2.0, CW, [
    ['Risk', 'Control'],
    ['Credit', 'Bands on every seat; the cover Mashreq chooses; arrears taken from the late member’s own pot; a '
               'hard stop on any circle whose unrecovered exposure exceeds its cover'],
    ['Reputation', 'New members in the last seats; published rules for every circle; Hyper labelled Experimental'],
    ['Money laundering and fraud', 'Mashreq’s due diligence at account opening; payouts only to accounts in '
     'the member’s name; fixed amounts on a fixed schedule; review of points purchases and turn trades'],
    ['Outsourcing and technology', 'An agreement under the State Bank’s outsourcing framework; security '
     'testing; audit logs; inspection rights for Mashreq and the regulator; data kept where Mashreq requires'],
    ['Shariah', 'Flat fee; a takaful option; late penalties to charity; approval by Mashreq’s Shariah board; '
                'features outside it labelled'],
    ['Conduct', 'Instalments limited to a third of verified income; full disclosure before joining; a cooling '
                'off period; recovery by stated steps, never by harassment']],
      [0.22, 0.78], size=12, hsize=12, rh=0.58)

# ===================================================== 18 TECHNICAL PROCESS ===
sl = slide('Delivery', 'Technical Process',
           'How the Halqa application, Halqa’s platform and Mashreq’s systems connect.')
table(sl, M, 2.0, CW, [
    ['Step', 'Halqa', 'Mashreq'],
    ['Onboarding', 'Shows Mashreq’s account opening screens inside the application; stores the account '
     'reference, never a credential', 'Opens the account after its customer checks; returns the account '
     'reference'],
    ['Mandate', 'Presents the mandate terms; the member confirms with the Halqa PIN', 'Registers the direct debit '
     'mandate with its own check; returns the mandate reference'],
    ['Collection', 'Sends the collection list on the due date through Mashreq’s interface', 'Debits each '
     'account; posts contribution, cover and fee separately'],
    ['Confirmation', 'Updates the circle’s ledger; sends receipts', 'Returns a signed confirmation for '
     'each payment'],
    ['Payout', 'Instructs the payout: the pot, less arrears owed to members left short', 'Pays the collecting '
     'member’s account'],
    ['Reconciliation', 'Matches the ledger to Mashreq’s statement each morning; holds and investigates any '
     'break', 'Provides the daily statement'],
    ['Reporting', 'Supplies circle data and payment records', 'Receives data for monitoring and credit '
     'reporting; reports Halqa’s share']],
      [0.16, 0.44, 0.40], size=11.5, hsize=12, rh=0.5)
source(sl, 'Halqa stores no card data, password or banking credential. Each party keeps an audit log of every '
           'instruction.')

# ====================================================== 19 APPROVALS AND PILOT ===
sl = slide('Delivery', 'Approvals and Pilot',
           'Five steps to approval, then one six month cycle with about 1,000 members.')
tb(sl, M, 2.05, 5.7, 4.4, [
    'Mashreq’s board approves the partnership as an outsourcing arrangement under the State Bank’s '
    'framework, with Halqa assessed as a service provider.',
    'Mashreq’s Shariah board approves the committee product for the Islamic window.',
    'Mashreq confirms whether the product needs approval of, or notice to, the State Bank, and any limits for '
    'a digital retail bank.',
    'The partners sign a services agreement: data, security, service levels, audit rights, complaints and '
    'exit.',
    'A pilot runs within agreed limits before any public launch.'],
   size=12.5, num=True, gap=10, spacing=1.08, ind=0.32)
gx = 6.72
gl, mw = 1.95, 0.4
tb(sl, gx, 2.02, gl - 0.12, 0.25, 'Month', size=9, color=GREY, bold=True, align=R)
for m in range(10):
    tb(sl, gx + gl + m * mw, 2.02, mw, 0.25, str(m + 1), size=9, color=GREY, bold=True, align=CEN)
rows = [('Agreement and approvals', 1, 2, PINE), ('Integration and testing', 2, 3, LIME_LT),
        ('Pilot cycle', 4, 9, LIME), ('Review', 6, 6, MID), ('Scale decision', 10, 10, PINE)]
for i, (lab, a, b, col) in enumerate(rows):
    y = 2.36 + i * 0.4
    tb(sl, gx, y, gl - 0.12, 0.3, lab, size=10.5, align=R)
    rect(sl, gx + gl + (a - 1) * mw + 0.03, y + 0.03, (b - a + 1) * mw - 0.06, 0.24, color=col)
line(sl, gx + gl - 0.04, 2.3, gx + gl - 0.04, 4.36, color=RULE, lw=0.75)
tb(sl, gx, 4.55, W - M - gx, 2.0, [
    'Scope: up to 100 monthly circles, about 1,000 members, on the Islamic window',
    'Every member opens a Mashreq account',
    'Measures: accounts opened, balances, on time payments, arrears recovered, complaints, and cost of '
    'acquisition against Mashreq’s other channels',
    'After success: open circles with cover, asset financing, circles across borders, then Hyper'],
   size=11.5, bullet=True, gap=5, spacing=1.05)

# ========================================================== 20 DECISIONS ===
sl = slide('Delivery', 'Decisions for Mashreq', 'Six choices shape the product. Four steps start the work.')
dec = [('Cover', 'Guarantee from the balance sheet, insurance, or takaful'),
       ('Credit reporting', 'TASDEEQ, or Mashreq reporting directly'),
       ('Fee and income share', 'The member fee and Halqa’s share of income'),
       ('Points', 'Issued as Mashreq’s stored value, with marketplace and rewards links'),
       ('Turn market', 'Product approval and a Shariah board ruling'),
       ('Pilot', 'Limits, dates and exclusivity')]
cw = (CW - 2 * 0.3) / 3
for i, (hd, body) in enumerate(dec):
    r_, c_ = divmod(i, 3)
    rect(sl, M + c_ * (cw + 0.3), 2.05 + r_ * 1.55, cw, 1.35, color=TINT, pad=0.22, paras=[
        ([('%d   ' % (i + 1), dict(size=20, font=DISPLAY, color=MID)), (hd, dict(size=16, font=DISPLAY,
                                                                              color=PINE))], dict(gap=4)),
        (body, dict(size=12, spacing=1.08))])
tb(sl, M, 5.3, 5, 0.35, 'Next steps', size=16, color=PINE, font=DISPLAY)
nx = ['Non disclosure agreement', 'Joint working group', 'Integration specification', 'Pilot agreement']
g4 = 0.45
bw4 = (CW - 3 * g4) / 4
for i, t in enumerate(nx):
    x = M + i * (bw4 + g4)
    rect(sl, x, 5.78, bw4, 0.72, color=LIME if i == 0 else LIME_LT, pad=0.15, anchor=MIDDLE,
         paras=[(t, dict(size=13, color=INK, align=CEN, bold=True))])
    if i < 3:
        line(sl, x + bw4 + 0.07, 6.14, x + bw4 + g4 - 0.07, 6.14, color=PINE, lw=1.5, arrow=True)

# =========================================================== 21 SUMMARY ===
sl = prs.slides.add_slide(BLANK)
PAGE[0] += 1
rect(sl, 9.3, 0, W - 9.3, H, color=LIME)
sl.shapes.add_picture(LOGO, E(M), E(0.42), height=E(0.36))
tb(sl, M, 0.9, 8, 0.7, 'Summary', size=34, color=INK, font=DISPLAY)
tb(sl, M, 1.85, 8.3, 3.6, 'Committees are the savings habit that already exists outside Pakistan’s banks: paid '
   'monthly, on time, within trusted groups, mostly by women. Halqa proposes that Mashreq hold and move all '
   'committee money under its licence, with every member banking at Mashreq, while Halqa runs the committees. '
   'Mashreq gains deposits, customers in groups, an Islamic product, overseas Pakistanis and a lending book built '
   'on payment records, and chooses the cover and the credit reporting route. On stated assumptions, 100,000 '
   'members bring about Rs 2.5 billion of deposits and 100,000 accounts. The next step is a pilot of about 1,000 '
   'members in 100 circles over one six month cycle.', size=15, color=INK, spacing=1.2)
tb(sl, M, 5.55, 8.3, 0.5, 'Halqa is the system. The bank is the machine.', size=22, color=PINE, font=DISPLAY)
tb(sl, M, 6.35, 8, 0.3, 'Taha Amjed, Chairman, Halqa', size=12, color=INK, bold=True)
ring(sl, 9.3 + (W - 9.3) / 2, 3.75, 1.2, 0.17, 0.5)

# ================================================================ save ===
cp = prs.core_properties
cp.title = 'Halqa and Mashreq Bank Pakistan'
cp.subject = 'Partnership proposal'
cp.author = 'Halqa'
cp.last_modified_by = 'Halqa'
cp.revision = 1
pkg = prs.part.package
for rId, rel in list(pkg._rels.items()):
    if rel.reltype.endswith('/thumbnail'):
        pkg._rels.pop(rId)

THEME = (
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
    '<a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Halqa"><a:themeElements>'
    '<a:clrScheme name="Halqa"><a:dk1><a:srgbClr val="0C1408"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1>'
    '<a:dk2><a:srgbClr val="22450C"/></a:dk2><a:lt2><a:srgbClr val="F5F7F2"/></a:lt2>'
    '<a:accent1><a:srgbClr val="6DC72A"/></a:accent1><a:accent2><a:srgbClr val="356914"/></a:accent2>'
    '<a:accent3><a:srgbClr val="22450C"/></a:accent3><a:accent4><a:srgbClr val="8ADC42"/></a:accent4>'
    '<a:accent5><a:srgbClr val="5F6B58"/></a:accent5><a:accent6><a:srgbClr val="11240C"/></a:accent6>'
    '<a:hlink><a:srgbClr val="356914"/></a:hlink><a:folHlink><a:srgbClr val="5F6B58"/></a:folHlink></a:clrScheme>'
    '<a:fontScheme name="Halqa"><a:majorFont><a:latin typeface="Georgia"/><a:ea typeface=""/><a:cs typeface=""/>'
    '</a:majorFont><a:minorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont>'
    '</a:fontScheme><a:fmtScheme name="Halqa"><a:fillStyleLst>' + '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>' * 3 +
    '</a:fillStyleLst><a:lnStyleLst>' + ''.join('<a:ln w="%d"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:ln>' % w
                                               for w in (9525, 12700, 19050)) +
    '</a:lnStyleLst><a:effectStyleLst>' + '<a:effectStyle><a:effectLst/></a:effectStyle>' * 3 +
    '</a:effectStyleLst><a:bgFillStyleLst>' + '<a:solidFill><a:schemeClr val="phClr"/></a:solidFill>' * 3 +
    '</a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>')
DROP_RE = r'(docProps/app\.xml|docProps/core\.xml|viewProps\.xml|printerSettings[^"]*|thumbnail[^"]*)'


def slim(data):
    """Drop optional parts, use the theme for Arial and ink, and strip names the deck does not need."""
    zin = zipfile.ZipFile(io.BytesIO(data))
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for n in zin.namelist():
            if re.search(DROP_RE, n):
                continue
            b = zin.read(n)
            if n.endswith('.xml') or n.endswith('.rels'):
                t = b.decode('utf-8')
                if n == '[Content_Types].xml':
                    t = re.sub(r'<Override PartName="/[^"]*' + DROP_RE + r'"[^>]*/>', '', t)
                    t = re.sub(r'<Default Extension="(bin|jpeg)"[^>]*/>', '', t)
                elif n.endswith('.rels'):
                    t = re.sub(r'<Relationship [^>]*Target="[^"]*' + DROP_RE + r'"[^>]*/>', '', t)
                elif n == 'ppt/theme/theme1.xml':
                    t = THEME
                elif n.startswith('ppt/slides/slide'):
                    t = re.sub(r'(<p:cNvPr id="\d+") name="[^"]*"', r'\1 name=""', t)
                    t = re.sub(r' descr="[^"]*"', ' descr="Halqa"', t)
                    t = t.replace('<a:spAutoFit/>', '').replace('<a:latin typeface="Arial"/>', '')
                    t = re.sub(r'(<a:rPr[^>]*>)<a:solidFill><a:srgbClr val="0C1408"/></a:solidFill>', r'\1', t)
                    t = re.sub(r'<a:rPr([^>]*)></a:rPr>', r'<a:rPr\1/>', t)
                b = t.encode('utf-8')
            z.writestr(n, b)
    return out.getvalue()


buf = io.BytesIO()
prs.save(buf)
open(OUT, 'wb').write(slim(buf.getvalue()))
src = zipfile.ZipFile(OUT)

# --------------------------------------------------------------- checks ---
bad = []
for n, s in enumerate(prs.slides, 1):
    for shp in s.shapes:
        texts = []
        if shp.has_text_frame:
            texts.append(shp.text_frame.text)
        if shp.has_table:
            texts += [c.text_frame.text for r_ in shp.table.rows for c in r_.cells]
        for t in texts:
            for pat in (r'\byou\b', r'\byour\b', r'\bwe\b', r'\bour\b', u'[‒–—―]', r'\w-\w',
                        r' - '):
                if re.search(pat, t, re.I):
                    bad.append((n, pat, t[:80]))
print('slides', len(prs.slides), 'bytes', os.path.getsize(OUT))
for b in bad:
    print('CHECK', b)
print('\n'.join(sorted(src.namelist())))
