# -*- coding: utf-8 -*-
"""
Builds HALQA-MASTER-DECK-2026-09-24.pptx, the complete position deck.

Rebuilt on the evening of 24 September 2026 from the verified documents:
Statutory Position (rev 4, HQ-CP-06), Complete Feature and Process List
(rev 4, HQ-CP-07), Hyper Committee (rev 6, HQ-CP-08), Collection and Auto
Debit Specification (rev 4, HQ-CP-09) and Legal Verification (rev 3). Research figures carried from the
August deck keep their provenance mark.

Presentation rules enforced here:
  third person only, never "you", "your", "we" or "our"
  no formulas or calculations outside section 04 (Hyper)
  no em dashes
  lime logo top right of every content slide
  counterparties named and marked as not contracted
  no rounded shapes, no pills
"""

import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.oxml.ns import qn, nsdecls
from pptx.oxml import parse_xml

HERE = os.path.dirname(os.path.abspath(__file__))
LOGO = os.path.join(HERE, 'logo-lockup.png')
LOGO_LIGHT = os.path.join(HERE, 'logo-lockup-light.png')
MARK = os.path.join(HERE, 'logo-mark.png')
DATE = '24 September 2026'
OUT = os.path.join(HERE, 'HALQA-MASTER-DECK-2026-09-24.pptx')

# ----------------------------------------------------------------- palette ---
DEEP = RGBColor(0x11, 0x24, 0x0C)
PINE = RGBColor(0x22, 0x45, 0x0C)
MID = RGBColor(0x35, 0x69, 0x14)
LIME = RGBColor(0x6D, 0xC7, 0x2A)
LIME_BR = RGBColor(0x8A, 0xDC, 0x42)
LIME_LT = RGBColor(0xE3, 0xF8, 0xCA)
IVORY = RGBColor(0xF3, 0xFC, 0xE7)
INK = RGBColor(0x0C, 0x14, 0x08)
GREY = RGBColor(0x6F, 0x7B, 0x68)
GREY_LT = RGBColor(0xA9, 0xB4, 0xA3)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
TINT = RGBColor(0xF5, 0xF7, 0xF2)
RED = RGBColor(0xB0, 0x3A, 0x2E)
AMBER = RGBColor(0xB7, 0x7A, 0x12)

DISPLAY = 'Georgia'
BODY = 'Arial'

W = Inches(13.333)
H = Inches(7.5)
M = Inches(0.62)
CW = W - 2 * M

prs = Presentation()
prs.slide_width = W
prs.slide_height = H
BLANK = prs.slide_layouts[6]
_page = {'n': 0}


# ------------------------------------------------------------- primitives ---
def rect(sl, x, y, w, h, fill=None, line=None, lw=0.75):
    s = sl.shapes.add_shape(MSO_SHAPE.RECTANGLE, int(x), int(y), int(w), int(h))
    s.shadow.inherit = False
    if fill is not None:
        s.fill.solid()
        s.fill.fore_color.rgb = fill
    else:
        s.fill.background()
    if line is not None:
        s.line.color.rgb = line
        s.line.width = Pt(lw)
    else:
        s.line.fill.background()
    return s


def line(sl, x1, y1, x2, y2, color=PINE, lw=0.75):
    c = sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, int(x1), int(y1), int(x2), int(y2))
    c.line.color.rgb = color
    c.line.width = Pt(lw)
    return c


def arrow(sl, x1, y1, x2, y2, color=PINE, lw=1.4):
    c = line(sl, x1, y1, x2, y2, color, lw)
    ln = c.line._get_or_add_ln()
    ln.append(parse_xml('<a:tailEnd %s type="triangle" w="med" len="med"/>' % nsdecls('a')))
    return c


def tb(sl, x, y, w, h, text, size=11, color=INK, bold=False, font=BODY,
       align=PP_ALIGN.LEFT, italic=False, gap=4, spacing=1.0, anchor=MSO_ANCHOR.TOP,
       caps=False, tracking=0):
    box = sl.shapes.add_textbox(int(x), int(y), int(w), int(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    for i, ln in enumerate(text.split('\n')):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.alignment = align
        p.space_after = Pt(gap)
        p.line_spacing = spacing
        r = p.add_run()
        r.text = ln.upper() if caps else ln
        f = r.font
        f.name = font
        f.size = Pt(size)
        f.bold = bold
        f.italic = italic
        f.color.rgb = color
        if tracking:
            r.font._rPr.set('spc', str(int(tracking * 100)))
    return box


def bullets(sl, x, y, w, items, size=10.6, color=INK, gap=6, tick=LIME, spacing=1.05, h=None):
    """A lime rule before each line. 'Lead||rest' sets the lead in bold pine."""
    box = sl.shapes.add_textbox(int(x), int(y), int(w), int(h or Inches(0.4)))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(gap)
        p.line_spacing = spacing
        lead, _, rest = it.partition('||')
        if not rest:
            lead, rest = None, lead
        r0 = p.add_run()
        r0.text = '|  '
        r0.font.name = DISPLAY; r0.font.size = Pt(size); r0.font.bold = True
        r0.font.color.rgb = tick
        if lead:
            r1 = p.add_run()
            r1.text = lead + '.  '
            r1.font.name = BODY; r1.font.size = Pt(size); r1.font.bold = True
            r1.font.color.rgb = PINE
        r2 = p.add_run()
        r2.text = rest
        r2.font.name = BODY; r2.font.size = Pt(size); r2.font.color.rgb = color
    return box


def heading(sl, x, y, w, text, size=12.4, color=PINE):
    return tb(sl, x, y, w, Inches(0.3), text, size=size, color=color, font=DISPLAY)


def exhibit(sl, x, y, w, n, caption):
    tb(sl, x, y, w, Inches(0.2), 'EXHIBIT %d   %s' % (n, caption), size=8.4, color=GREY,
       italic=True, tracking=0.3)


def note(sl, x, y, w, text, h=Inches(0.3), size=8.6):
    tb(sl, x, y, w, h, text, size=size, color=GREY, italic=True, spacing=1.1)


def tag(sl, x, y, text):
    """Stage tag: a lime rule and small capitals. Never a pill."""
    line(sl, x, y, x, y + Inches(0.17), color=LIME, lw=2.2)
    tb(sl, x + Inches(0.08), y, Inches(8), Inches(0.2), text, size=8.2, color=PINE,
       bold=True, caps=True, tracking=0.8)


def panel(sl, x, y, w, h, title, body, size=10.0, fill=TINT):
    rect(sl, x, y, w, h, fill=fill)
    rect(sl, x, y, Inches(0.05), h, fill=LIME)
    tb(sl, x + Inches(0.18), y + Inches(0.12), w - Inches(0.3), Inches(0.28), title,
       size=11.2, color=PINE, font=DISPLAY)
    tb(sl, x + Inches(0.18), y + Inches(0.44), w - Inches(0.3), h - Inches(0.5), body,
       size=size, color=INK, spacing=1.12, gap=5)


def _cell_border(cell, color='C9D6BF', wpt=0.75):
    tcPr = cell._tc.get_or_add_tcPr()
    for tg in ('lnL', 'lnR', 'lnT', 'lnB'):
        for e in tcPr.findall(qn('a:' + tg)):
            tcPr.remove(e)
    for tg in ('lnL', 'lnR', 'lnT', 'lnB'):
        tcPr.append(parse_xml(
            '<a:%s %s w="%d" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:srgbClr val="%s"/>'
            '</a:solidFill><a:prstDash val="solid"/></a:%s>'
            % (tg, nsdecls('a'), int(wpt * 12700), color, tg)))


def table(sl, x, y, w, data, widths, fs=9.4, hfs=9.0, rh=Inches(0.28), header=True,
          aligns=None, bolds=None, first_bold=False):
    rows, cols = len(data), len(data[0])
    g = sl.shapes.add_table(rows, cols, int(x), int(y), int(w), int(rh * rows))
    t = g.table
    t.first_row = False
    t.horz_banding = False
    tot = float(sum(widths))
    for j, cw in enumerate(widths):
        t.columns[j].width = int(w * cw / tot)
    for i in range(rows):
        t.rows[i].height = int(rh)
        for j in range(cols):
            c = t.cell(i, j)
            c.margin_left = Inches(0.07); c.margin_right = Inches(0.05)
            c.margin_top = Inches(0.03); c.margin_bottom = Inches(0.03)
            c.vertical_anchor = MSO_ANCHOR.MIDDLE
            head = header and i == 0
            c.fill.solid()
            c.fill.fore_color.rgb = PINE if head else WHITE
            _cell_border(c)
            p = c.text_frame.paragraphs[0]
            c.text_frame.word_wrap = True
            p.alignment = aligns[j] if aligns else PP_ALIGN.LEFT
            r = p.add_run()
            r.text = str(data[i][j])
            r.font.name = BODY
            r.font.size = Pt(hfs if head else fs)
            r.font.bold = bool(head or (bolds and i in bolds) or (first_bold and j == 0))
            r.font.color.rgb = IVORY if head else (PINE if (first_bold and j == 0) else INK)
    return g


def statstrip(sl, x, y, w, stats, h=Inches(0.92), num_size=22, lab_size=8.2):
    line(sl, x, y, x + w, y, color=PINE, lw=1.1)
    line(sl, x, y + h, x + w, y + h, color=PINE, lw=1.1)
    n = len(stats)
    cw = w / n
    for i, (num, lab) in enumerate(stats):
        cx = x + i * cw
        if i:
            line(sl, cx, y + h * 0.18, cx, y + h * 0.82, color=LIME, lw=1.0)
        tb(sl, cx + Inches(0.12), y + h * 0.12, cw - Inches(0.24), h * 0.5, num,
           size=num_size, color=PINE, font=DISPLAY)
        tb(sl, cx + Inches(0.12), y + h * 0.64, cw - Inches(0.24), h * 0.34, lab,
           size=lab_size, color=GREY, caps=True, tracking=0.5)


def hbars(sl, x, y, w, items, bar_h=Inches(0.2), gap=Inches(0.36), label_w=Inches(1.6),
          val_w=Inches(1.3), maxv=None):
    maxv = maxv or max(i[1] for i in items) or 1
    plot_x = x + label_w
    plot_w = w - label_w - val_w
    for i, (lab, val, disp, col) in enumerate(items):
        cy = y + i * gap
        tb(sl, x, cy + Inches(0.01), label_w - Inches(0.12), bar_h, lab, size=9.6,
           color=INK, align=PP_ALIGN.RIGHT)
        bw = max(Inches(0.03), int(plot_w * (float(val) / maxv)))
        rect(sl, plot_x, cy, bw, bar_h, fill=col)
        tb(sl, plot_x + bw + Inches(0.08), cy + Inches(0.01), val_w, bar_h, disp,
           size=9.6, color=PINE, bold=True)
    line(sl, plot_x, y - Inches(0.05), plot_x, y + gap * (len(items) - 1) + bar_h + Inches(0.05),
         color=PINE, lw=0.75)


# ------------------------------------------------------------------ chrome ---
def logo(sl, dark=False):
    h = Inches(0.36)
    pic = sl.shapes.add_picture(LOGO_LIGHT if dark else LOGO, 0, int(Inches(0.34)), height=int(h))
    pic.left = int(W - M - pic.width)
    return pic


def slide(section, title, sub=None):
    sl = prs.slides.add_slide(BLANK)
    rect(sl, 0, 0, W, H, fill=WHITE)
    _page['n'] += 1
    tb(sl, M, Inches(0.40), Inches(9), Inches(0.2), section, size=8.4, color=GREY, caps=True,
       tracking=1.3, bold=True)
    tb(sl, M, Inches(0.64), CW - Inches(2.0), Inches(0.5), title, size=23, color=PINE, font=DISPLAY)
    if sub:
        tb(sl, M, Inches(1.16), CW - Inches(1.2), Inches(0.34), sub, size=11.0, color=GREY, spacing=1.08)
    logo(sl)
    yb = H - Inches(0.34)
    line(sl, M, yb, W - M, yb, color=PINE, lw=0.75)
    tb(sl, M, yb + Inches(0.06), Inches(6), Inches(0.2),
       'HALQA   ·   COMPLETE POSITION   ·   ' + DATE.upper(), size=7.4, color=GREY, tracking=0.8)
    tb(sl, W - M - Inches(1.0), yb + Inches(0.06), Inches(1.0), Inches(0.2), str(_page['n']),
       size=7.4, color=GREY, align=PP_ALIGN.RIGHT)
    return sl


def divider(number, title, lines):
    sl = prs.slides.add_slide(BLANK)
    _page['n'] += 1
    rect(sl, 0, 0, W, H, fill=PINE)
    rect(sl, 0, 0, Inches(0.14), H, fill=LIME)
    tb(sl, Inches(1.4), Inches(2.4), Inches(2), Inches(0.9), number, size=60, color=LIME, font=DISPLAY)
    tb(sl, Inches(2.8), Inches(2.58), Inches(8.2), Inches(0.8), title, size=31, color=IVORY, font=DISPLAY)
    line(sl, Inches(2.85), Inches(3.42), Inches(6.6), Inches(3.42), color=LIME_BR, lw=1.4)
    tb(sl, Inches(2.85), Inches(3.62), Inches(7.6), Inches(1.6), '\n'.join(lines), size=12.2,
       color=RGBColor(0xD2, 0xE2, 0xC6), gap=7, spacing=1.1)
    sl.shapes.add_picture(MARK, int(W - Inches(3.1)), int(H / 2 - Inches(1.05)), height=int(Inches(2.1)))
    return sl


# =============================================================== 1 COVER ===
sl = prs.slides.add_slide(BLANK)
_page['n'] += 1
rect(sl, 0, 0, W, H, fill=DEEP)
rect(sl, 0, 0, W, Inches(0.14), fill=LIME)
sl.shapes.add_picture(LOGO_LIGHT, int(Inches(1.0)), int(Inches(1.55)), height=int(Inches(0.95)))
tb(sl, Inches(1.05), Inches(3.0), Inches(10), Inches(0.7), 'The complete position', size=34,
   color=IVORY, font=DISPLAY)
line(sl, Inches(1.08), Inches(3.86), Inches(3.4), Inches(3.86), color=LIME, lw=2.4)
tb(sl, Inches(1.05), Inches(4.08), Inches(9.8), Inches(1.0),
   'A committee service that collects through a licensed electronic money institution, charges a '
   'stated fee for the service, and holds no member money at any point.',
   size=13.2, color=RGBColor(0xD2, 0xE2, 0xC6), spacing=1.18)
line(sl, Inches(1.05), Inches(5.3), Inches(12.2), Inches(5.3), color=MID, lw=0.75)
tb(sl, Inches(1.05), Inches(5.46), Inches(11), Inches(0.3),
   DATE + '   ·   Prepared for the chairman   ·   Internal and counterparty use',
   size=10.4, color=GREY_LT)
tb(sl, Inches(1.05), H - Inches(0.7), Inches(11), Inches(0.3),
   'Every statement carries a provenance mark or a stage tag. The next page sets out both.',
   size=9.4, color=GREY_LT)

# =========================================================== 2 READING ===
sl = slide('Reading this deck', 'Provenance and stage tags',
           'Each statement shows how strongly it is known and what it depends on.')
exhibit(sl, M, Inches(1.7), Inches(6.2), 1, 'The two kinds of mark used throughout')
table(sl, M, Inches(1.98), Inches(6.2),
      [['Provenance', 'Meaning'],
       ['verified', 'Checked against its source: the application code, a test, or a primary legal text read in full'],
       ['modelled', 'Arithmetic or simulation, not yet measured in operation'],
       ['reported', 'Stated by a third party: a company, a regulator, the press or a published study']],
      [0.22, 0.78], fs=9.4, rh=Inches(0.36), first_bold=True)
table(sl, M, Inches(3.62), Inches(6.2),
      [['Stage tag', 'What it depends on'],
       ['BUILT', 'Present in the application today'],
       ['TO BUILD', 'Specified, with no external dependency'],
       ['PARTNER', 'The services agreement with a licensed electronic money institution'],
       ['AGENT', 'A written agency agreement with a general takaful operator'],
       ['STAGE 2', 'MUFAP membership, a trustee and an asset manager']],
      [0.22, 0.78], fs=9.4, rh=Inches(0.34), first_bold=True)
panel(sl, M + Inches(6.65), Inches(1.98), Inches(5.43), Inches(4.6), 'The position in one paragraph',
      'Halqa never takes possession of member money. A contribution moves from the paying member’s '
      'account to the collecting member’s account through a licensed electronic money institution. '
      'Halqa’s service fee is collected separately and is the only money Halqa receives from members. '
      'Where cover is taken, the takaful contribution passes to a risk fund held by a licensed operator.\n'
      'Halqa requires no financial licence, seeks no regulatory approval and does not pursue a sandbox. '
      'It operates under the general law and reaches the payment system through its partner’s licence.\n'
      'Source: Statutory Position, revision 4, section 1.', size=10.6)

# ========================================================== 3 CONTENTS ===
sl = slide('Contents', 'What is in this deck')
rows = [('01', 'The instrument and the market', 'What a committee is, where its risk sits, and who uses one'),
        ('02', 'The legal position', 'Where the money goes, the licences that do not attach, and whose duty each duty is'),
        ('03', 'The economics', 'The fee grid, the cost of carrying a committee, the rail constraint and the launch timeline'),
        ('04', 'Hyper', 'The daily product in two configurations. The only section that sets out calculations'),
        ('05', 'The product', 'The member journey, standing, default prevention, exit, the bureau link and the later stages'),
        ('06', 'The evidence', 'Twenty-five attempts in nine markets, and the competitive position'),
        ('07', 'State and plan', 'Where the company stands on ' + DATE + ', the order of what follows, and what is open')]
y = Inches(1.5)
for n, t, d in rows:
    tb(sl, M, y, Inches(0.8), Inches(0.5), n, size=24, color=LIME, font=DISPLAY)
    tb(sl, M + Inches(1.0), y + Inches(0.02), Inches(4.2), Inches(0.4), t, size=15, color=PINE, font=DISPLAY)
    tb(sl, M + Inches(5.3), y + Inches(0.08), Inches(6.7), Inches(0.4), d, size=10.8, color=GREY)
    line(sl, M, y + Inches(0.66), W - M, y + Inches(0.66), color=LIME_LT, lw=0.75)
    y += Inches(0.74)

# ======================================================= SECTION 01 ========
divider('01', 'The instrument and the market',
        ['A committee combines an advance and a savings plan in one schedule.',
         'Its risk sits in the early seats, not across the roster.',
         'About Rs 4 trillion rotates through committees in Pakistan every year.'])

# ---- the instrument
sl = slide('01 · The instrument', 'A committee is two financial products in one schedule',
           'Each member pays the same contribution every period, and each period one member collects the '
           'whole pot. At the end every member has paid in exactly what that member collected.')
exhibit(sl, M, Inches(1.72), Inches(7.2), 2, 'Three rounds of a twelve member circle. The lime cell collects.')
gx, gy = M + Inches(0.9), Inches(2.02)
cwid, chgt = Inches(0.52), Inches(0.36)
for r in range(3):
    tb(sl, M, gy + r * (chgt + Inches(0.08)) + Inches(0.08), Inches(0.85), chgt, 'Round %d' % (r + 1),
       size=9.4, color=PINE, bold=True)
    for s in range(12):
        col = LIME if s == r else TINT
        rect(sl, gx + s * cwid, gy + r * (chgt + Inches(0.08)), cwid - Inches(0.05), chgt, fill=col)
        tb(sl, gx + s * cwid, gy + r * (chgt + Inches(0.08)) + Inches(0.1), cwid - Inches(0.05), chgt,
           'collects' if s == r else 'pays', size=7.2, color=INK if s == r else GREY, align=PP_ALIGN.CENTER)
for s in range(12):
    tb(sl, gx + s * cwid, gy + 3 * (chgt + Inches(0.08)), cwid - Inches(0.05), Inches(0.2),
       'seat %d' % (s + 1), size=7.2, color=GREY, align=PP_ALIGN.CENTER)
table(sl, M, Inches(4.02), Inches(7.2),
      [['Worked in rupees', 'Amount'],
       ['Twelve members, Rs 10,000 each a month', 'Pot of Rs 120,000'],
       ['Seat 1 collects', 'Rs 120,000, having paid Rs 10,000'],
       ['Seat 12 collects', 'Rs 120,000, having paid Rs 120,000'],
       ['Every member, at the end of the cycle', 'Paid Rs 120,000 and received Rs 120,000']],
      [0.55, 0.45], fs=9.6, rh=Inches(0.32))
heading(sl, M + Inches(7.7), Inches(1.72), Inches(4.4), 'The two halves')
bullets(sl, M + Inches(7.7), Inches(2.1), Inches(4.4), [
    'Collecting early||A member receives a lump sum before paying for it: an advance without interest, repaid in instalments.',
    'Collecting late||A member pays before receiving: saving under a commitment the group enforces.',
    'Paid in equals paid out||The committee holds nothing at rest and earns nothing for itself.',
    'The organiser||In the offline committee the organiser holds the pot. Halqa removes that custody, which is the precondition of every large committee fraud on record.'],
    size=10.4, gap=9)

# ---- risk in the early seats
sl = slide('01 · The instrument', 'The risk sits in the early seats',
           'When a member collects, the contributions still owed to the group are that member’s forward '
           'liability. It is largest at the first seat and nil at the last.')
exhibit(sl, M, Inches(1.72), Inches(6.6), 3, 'Forward liability by seat, twelve members at Rs 10,000')
items = []
for s in range(1, 13):
    v = 10000 * (12 - s)
    items.append(('Seat %d' % s, v, 'Rs {:,}'.format(v) if v else 'nil', LIME if s >= 10 else MID))
hbars(sl, M, Inches(2.05), Inches(6.6), items, bar_h=Inches(0.2), gap=Inches(0.345), label_w=Inches(0.9),
      val_w=Inches(1.1), maxv=110000)
note(sl, M, Inches(6.28), Inches(6.6),
     'Lime marks the only seats open to a new member, or to a member in the Rebuilding band, on a twelve '
     'member circle. verified against score-bands.ts')
heading(sl, M + Inches(7.1), Inches(1.72), Inches(5.0), 'Who may sit early, and what stands behind them')
bullets(sl, M + Inches(7.1), Inches(2.12), Inches(5.0), [
    'Score bands||Four bands decide which seats a member may claim at join.',
    'New member rule||With no history, only the final seats, until two clean circles and verification.',
    'Forward liability gate||An early seat is withheld where the obligation left after collecting would be too large.',
    'Affordability gate||Committed instalments are held to one third of income.',
    'Mutual guarantee and undertaking||Signed at join, member to member, and framed for a summary suit.',
    'Cover||Where attached, a licensed takaful operator covers default after collection.'],
    size=10.4, gap=8)
panel(sl, M + Inches(7.1), Inches(5.35), Inches(5.0), Inches(1.2), 'What no control uses',
      'A pool of money, a security deposit or a payout held back. Each would place member money with '
      'Halqa, which the design does not permit.', size=10.0)

# ---- how the order is set
sl = slide('01 · The instrument', 'How the collection order is set',
           'Two methods are offered. Two are refused, each because it would change what the arrangement is in law.')
exhibit(sl, M, Inches(1.72), CW, 4, 'Methods of setting the order, and the position on each')
table(sl, M, Inches(2.0), CW,
      [['Method', 'How it works', 'Position'],
       ['Selection at join', 'The member chooses a free seat from those the band allows', 'Offered. The standard method'],
       ['Host assignment', 'The host sets the order at creation', 'Offered where the circle policy allows'],
       ['Auction', 'The member accepting the largest discount on the pot collects first',
        'Refused. A price discovered between members creates a lender and a borrower'],
       ['Prize or lucky draw', 'A drawn winner collects the pot and stops paying',
        'Refused. A sum determined by a draw is a lottery under section 294-A of the Penal Code'],
       ['Ballot by lot', 'Names are drawn to fix the order', 'Not offered. The order is set by rule or by the host']],
      [0.18, 0.42, 0.40], fs=9.8, rh=Inches(0.4), first_bold=True)
panel(sl, M, Inches(4.72), Inches(5.9), Inches(1.75), 'Why the auction is refused',
      'The early collector accepts less than the pot and repays it in full. The discount is a price for '
      'money over time, which is interest in substance whatever it is called. India regulates this family '
      'separately, under the Chit Funds Act 1982.', size=10.2)
panel(sl, M + Inches(6.2), Inches(4.72), Inches(5.9), Inches(1.75), 'Why the prize committee is refused',
      'Once the winner stops paying, contributions no longer equal payouts, and most participants pay more '
      'than they can receive. The arrangement becomes a lottery funded by the members who do not win.', size=10.2)
note(sl, M, Inches(6.6), CW, 'verified against the Complete Feature and Process List, revision 4, sections 4 and 6, '
     'and the Pakistan Penal Code 1860, section 294-A')

# ---- the market
sl = slide('01 · The market', 'The third largest savings channel in the country',
           'The figures used in every Halqa document, with the source for each.')
statstrip(sl, M, Inches(1.72), CW, [('Rs 4 trillion', 'Rotates each year'),
                                     ('52 million', 'Adults participating'),
                                     ('37%', 'Of adults have used one'),
                                     ('12%', 'Have lost money to fraud'),
                                     ('31%', 'Can send or receive a text message')])
exhibit(sl, M, Inches(2.9), Inches(5.6), 5, 'Where a Pakistani saver keeps money')
hbars(sl, M, Inches(3.22), Inches(5.6), [('Cash at home', 63, '63%', MID), ('A committee', 33, '33%', LIME),
                                        ('A bank account', 13, '13%', GREY_LT)],
      bar_h=Inches(0.3), gap=Inches(0.5), label_w=Inches(1.5), val_w=Inches(0.8), maxv=70)
tb(sl, M, Inches(4.85), Inches(5.6), Inches(0.6),
   'The committee competes with cash held at home, not with the bank account.', size=12, color=PINE,
   font=DISPLAY, spacing=1.1)
table(sl, M + Inches(6.1), Inches(2.9), Inches(5.99),
      [['Further figure', 'Source'],
       ['36% of Pakistanis save; 4% of savers use a formal institution', 'Financial Inclusion Insights'],
       ['19% use the pot for a one-time durable purchase', 'Financial Inclusion Insights'],
       ['Just over half own a phone', 'Financial Inclusion Insights'],
       ['Women participate at twice the rate of men', 'Financial Inclusion Insights'],
       ['About 100 million lack formal financial services', 'World Bank'],
       ['About 41% have participated; about $5 billion rotating', 'Oraan research']],
      [0.68, 0.32], fs=9.2, rh=Inches(0.36))
note(sl, M, Inches(6.55), CW, 'reported. Participation estimates range from 34 to 41 per cent across sources.')

# ---- who it serves
sl = slide('01 · The market', 'Who the product serves',
           'The research narrows the market in a way that strengthens the case with a regulator.')
exhibit(sl, M, Inches(1.72), CW, 6, 'Two studies that appear to conflict, and the reading that reconciles them')
panel(sl, M, Inches(2.0), Inches(5.9), Inches(1.45), 'Khan (2013), fieldwork in Dera Ghazi Khan',
      'Regular income is a precondition of membership. The poorest are excluded by the groups themselves '
      'as bad risks, so committees cannot substitute for microfinance.', size=10.0)
panel(sl, M + Inches(6.2), Inches(2.0), Inches(5.9), Inches(1.45), 'Kamran (2017), thirty unbanked informants',
      'Committees give real control over money. None of the thirty informants had experienced a member '
      'default.', size=10.0)
tb(sl, M, Inches(3.62), CW, Inches(0.4),
   'Committees filter on the regularity of income, not its level. Both studies hold at once.',
   size=13, color=PINE, font=DISPLAY)
table(sl, M, Inches(4.12), CW,
      [['Segment', 'Outcome', 'Consequence for Halqa'],
       ['Irregular or insufficient income', 'Excluded by the groups themselves', 'Outside the market, and not claimed'],
       ['Regular earners without a bank account, such as a tailor on Rs 17,000 or a driver on Rs 22,000 a month',
        'Served well, with near-zero observed default', 'The market: tens of millions of people']],
      [0.42, 0.28, 0.30], fs=9.6, rh=Inches(0.42), first_bold=True)
tb(sl, M, Inches(5.62), CW, Inches(0.8),
   'Two claims are withdrawn and appear in no Halqa material: that Halqa serves the poorest, and that '
   'committees substitute for formal finance. The claim that holds is that Halqa is an on-ramp to formal '
   'finance, through the credit score it builds from committee payments.', size=10.4, color=INK, spacing=1.12)
note(sl, M, Inches(6.62), CW, 'reported, from the two studies named')

# ======================================================= SECTION 02 ========
divider('02', 'The legal position',
        ['No contribution passes through an account of Halqa’s at any point.',
         'Each licence that could attach is drafted against conduct that does not occur.',
         'No approval is sought and no sandbox is pursued. Halqa operates under the general law.'])

# ---- the money path
sl = slide('02 · The money path', 'Every payment splits three ways at the moment it is taken',
           'The three parts are ledgered separately, reconciled separately and never mixed.')
exhibit(sl, M, Inches(1.72), CW, 7, 'The path of one payment. Halqa instructs the partner and keeps the ledger; the money does not pass through Halqa.')
bx_y = Inches(2.05)
rect(sl, M, bx_y + Inches(0.55), Inches(2.3), Inches(0.9), fill=TINT, line=PINE, lw=1.0)
tb(sl, M, bx_y + Inches(0.72), Inches(2.3), Inches(0.3), 'Paying member', size=11.4, color=PINE, bold=True,
   align=PP_ALIGN.CENTER)
tb(sl, M, bx_y + Inches(1.02), Inches(2.3), Inches(0.3), 'approves in the application', size=8.8, color=GREY,
   align=PP_ALIGN.CENTER)
rect(sl, M + Inches(3.0), bx_y + Inches(0.55), Inches(2.9), Inches(0.9), fill=WHITE, line=PINE, lw=1.0)
tb(sl, M + Inches(3.0), bx_y + Inches(0.68), Inches(2.9), Inches(0.3), 'Electronic money institution',
   size=11.0, color=PINE, bold=True, align=PP_ALIGN.CENTER)
tb(sl, M + Inches(3.0), bx_y + Inches(0.98), Inches(2.9), Inches(0.4), 'licensed partner; initiates the payment\nNayaPay or SadaPay, not contracted',
   size=8.6, color=GREY, align=PP_ALIGN.CENTER, gap=1)
arrow(sl, M + Inches(2.3), bx_y + Inches(1.0), M + Inches(3.0), bx_y + Inches(1.0), color=PINE)
dests = [('Collecting member', 'the contribution, which alone forms the pot'),
         ('Participants risk fund', 'the takaful contribution, where cover is attached'),
         ('Halqa revenue account', 'the service fee, collected separately')]
for i, (t, d) in enumerate(dests):
    yy = bx_y + Inches(0.02) + i * Inches(0.66)
    rect(sl, M + Inches(6.8), yy, Inches(5.29), Inches(0.56), fill=WHITE if i < 2 else LIME_LT, line=PINE, lw=1.0)
    tb(sl, M + Inches(6.95), yy + Inches(0.08), Inches(2.3), Inches(0.3), t, size=10.6, color=PINE, bold=True)
    tb(sl, M + Inches(9.1), yy + Inches(0.1), Inches(2.95), Inches(0.4), d, size=9.0, color=GREY)
    arrow(sl, M + Inches(5.9), bx_y + Inches(1.0), M + Inches(6.8), yy + Inches(0.28), color=LIME if i < 2 else PINE)
table(sl, M, Inches(4.2), CW,
      [['Part', 'Destination', 'Owner of that money', 'Basis'],
       ['Contribution', 'The collecting member, through the electronic money institution partner', 'The collecting member',
        'The pot. The pot equals the contribution for each period, taken over every period'],
       ['Takaful contribution', 'Participants risk fund at a licensed operator', 'The participants, collectively',
        'Cover against default after collection'],
       ['Service fee', 'Halqa’s own revenue account', 'Halqa',
        'An advance for services, which section 84 of the Companies Act excludes from the meaning of a deposit']],
      [0.15, 0.32, 0.2, 0.33], fs=9.2, rh=Inches(0.4), first_bold=True)
note(sl, M, Inches(6.3), CW, 'No part of a contribution passes through an account of Halqa’s, however briefly. '
     'Source: Business Model and Unit Costs, section 1; Collection and Auto Debit Specification, revision 4, section 1.')
tag(sl, M, Inches(6.72), 'Partner  ·  no rail is connected and no money has moved at this date')

# ---- licences that do not attach
sl = slide('02 · Licensing', 'The licences that do not attach, and why',
           'Each prohibition is drafted against conduct. Where the conduct does not occur, the provision does not engage.')
exhibit(sl, M, Inches(1.66), Inches(8.3), 8, 'Nine provisions, the conduct each governs, and why it does not reach Halqa')
table(sl, M, Inches(1.92), Inches(8.3),
      [['Provision', 'Conduct governed', 'Why it does not reach Halqa'],
       ['Companies Act 2017, s.84', 'Accepting deposits', 'Contributions settle member to member; the fee is an advance for services'],
       ['PS&EFT Act 2007; EMI Regulations 2023', 'Issuing electronic money', 'No balance is issued and no funds are received'],
       ['PSO/PSP Rules 2014', 'Providing a payment system', 'Initiation is the partner’s service under para 7.I(f) and (h)'],
       ['Companies Ordinance 1984, Part VIIIA', 'Lending as a finance company', 'Halqa advances nothing and computes no rate'],
       ['NBFC Regulations 2008, peer to peer chapter', 'Loans between persons on a platform', 'No member pays another for a position'],
       ['Insurance Ordinance 2000, ss.2(xxvii), 5(1)', 'Promising payment on another’s loss', 'A licensed operator writes the cover; Halqa is an agent'],
       ['Credit Bureaus Act 2015, s.4', 'Functioning as a bureau', 'Reports only on the member’s instruction, s.19(1)(b)'],
       ['Companies Act 2017, s.9', 'Association of more than 20 for gain', 'Each member receives exactly what each pays'],
       ['Penal Code 1860, s.294-A', 'Keeping a lottery', 'No sum is determined by a draw']],
      [0.33, 0.27, 0.40], fs=8.8, hfs=8.8, rh=Inches(0.43))
panel(sl, M + Inches(8.6), Inches(1.92), Inches(3.49), Inches(2.2), 'Required to operate',
      'Incorporation as a private limited company.\nA National Tax Number and Islamabad sales tax registration.\nA services '
      'agreement with a licensed electronic money institution.', size=9.8)
panel(sl, M + Inches(8.6), Inches(4.3), Inches(3.49), Inches(2.0), 'Required when a stage opens',
      'A written agency agreement with a general takaful operator, before cover.\nMUFAP membership and a distribution '
      'agreement, before savings.\nNeither carries a capital requirement of the kind a financial licence carries.', size=9.8)
note(sl, M, Inches(6.5), CW, 'verified. Each clause read in the primary text; see the Statutory Position, revision 4, '
     'sections 1 to 3, and the Legal Verification of 24 September 2026.')

# ---- collection
sl = slide('02 · Collection', 'Collection runs through a licensed electronic money institution',
           'The partner initiates each payment and holds any mandate. Halqa uses the service as a third party '
           'service provider and does not provide it.')
exhibit(sl, M, Inches(1.72), Inches(7.3), 9, 'The collection tiers')
table(sl, M, Inches(2.0), Inches(7.3),
      [['Tier', 'Mechanism', 'Member action', 'Cost', 'Used on'],
       ['1', 'Payment initiation by the partner, over Raast where available', 'One approval in the application',
        'The partner’s rate, to be agreed', 'Every monthly circle'],
       ['2', 'Token mandate held by the partner', 'None after the first authorisation', 'About 1.5%, to be confirmed',
        'Hyper, where a daily prompt is impractical'],
       ['3', 'The member sends over Raast to the collector’s Raast ID', 'The member initiates', 'Nil',
        'Always available'],
       ['Fee', 'Raast Request to Pay sent by Halqa, the payee of its own fee', 'One approval', 'Nil at present',
        'Halqa’s fee only']],
      [0.07, 0.35, 0.2, 0.18, 0.2], fs=8.9, hfs=8.8, rh=Inches(0.5), first_bold=True)
tb(sl, M, Inches(4.72), Inches(7.3), Inches(1.2),
   'A Raast Request to Pay settles to the merchant that sends it, under the Raast person to merchant terms '
   'published by Bank Alfalah. A contribution collected that way would land in Halqa’s account, which is '
   'the acceptance of a deposit under section 84(1) of the Companies Act 2017. Halqa therefore sends a '
   'Request to Pay only for its own fee.', size=10.0, spacing=1.14)
panel(sl, M + Inches(7.65), Inches(2.0), Inches(4.44), Inches(2.25), 'Why the partner is an electronic money institution',
      'The 2023 Regulations allow an electronic money institution to provide payment initiation and aggregation '
      '(para 7.I(f)) and to serve a fintech through its interface (para 7.I(h)), after 30 days’ notice to '
      'the State Bank. A payment service provider “will not act as custodian of consumer’s money” '
      '(PSO/PSP Rules 2014, rule 6.5).', size=9.6)
panel(sl, M + Inches(7.65), Inches(4.4), Inches(4.44), Inches(1.95), 'Why a mandate is lawful',
      'A preauthorised transfer “may be authorized by the Consumer either in writing, or in any other '
      'accepted form” (PS&EFT Act 2007, s.35(1)). The member may stop it by notifying the financial '
      'institution (s.35(2)), and cancelling the mandate does not end the commitment to the circle.', size=9.6)
tag(sl, M, Inches(6.62), 'Partner  ·  verified against the primary texts on 24 September 2026')

# ---- duties
sl = slide('02 · Duties', 'Whose duty each duty is',
           'Duties under the payment statute bind the member’s bank and the licensed partner. Halqa supports '
           'each by design and by contract, and carries the bureau and agency duties itself.')
exhibit(sl, M, Inches(1.72), CW, 10, 'Eleven duties, the party each binds, and how Halqa meets or supports it')
table(sl, M, Inches(1.98), CW,
      [['Duty', 'Instrument', 'Owed by', 'How Halqa meets or supports it', 'Stage'],
       ['Disclose the terms at contracting', 'PS&EFT s.30(1)', 'Financial institution or Authorized Party', 'Terms screen before any mandate', 'To build'],
       ['21 days’ notice of a material change', 'PS&EFT s.31(1)', 'Financial institution or Authorized Party', 'Notice job on the mandate record', 'To build'],
       ['Honour a stop instruction', 'PS&EFT s.35(2)', 'Financial institution', 'Cancellation in the application, effective at once', 'To build'],
       ['Investigate an alleged error in 10 Business Days', 'PS&EFT s.36(2)', 'Financial institution or Authorized Party', 'Dispute ticket with a ten day clock', 'To build'],
       ['Adverse action pack where a report restricts a seat', 'CBA 2015 s.31', 'Halqa, as user', 'Report, bureau details, summary of rights, statement that the bureau did not decide', 'To build'],
       ['Disclose credit information only as authorised', 'CBA 2015 s.26', 'Halqa', 'Bureau data never shown to other members', 'To build'],
       ['Pay the gross premium to the insurer', 'CIA Regulations 2020, reg 5(4)', 'Halqa, as agent', 'Takaful contribution passes to the operator in full', 'Agent'],
       ['Claims paid in the member’s own name', 'reg 7(4)', 'The operator', 'Halqa supplies the payment record; never paid to a circle', 'Agent'],
       ['No fee for distributing cover', 'reg 8(3)', 'Halqa, as agent', 'The service fee covers the committee service only', 'Agent'],
       ['Show a bundled product’s cost separately', 'reg 11(1)(d)', 'Halqa, as agent', 'Cover stated apart on the join sheet', 'Agent'],
       ['Coerce no prospect to buy cover', 'reg 10(c)', 'Halqa, as agent', 'Counsel’s written opinion on compulsory cover before Hyper opens', 'Open']],
      [0.25, 0.15, 0.17, 0.35, 0.08], fs=8.4, hfs=8.4, rh=Inches(0.37))
note(sl, M, Inches(6.62), CW, 'verified. Presenting the payment statute’s duties as Halqa’s own would '
     'characterise Halqa as an Authorized Party, which is the reading the design avoids (Legal Verification, section 3).')

# ---- implementation
sl = slide('02 · Implementation', 'What changes in the code before the partner agreement',
           'The application still carries constructs of the August design. Each is removed before the partner '
           'agreement is executed, and the listed components are built before the first live collection.')
panel(sl, M, Inches(1.8), Inches(5.9), Inches(4.7), 'To be removed',
      'The turn premium recorded from buyer to seller, and the ten per cent marketplace fee taken on it.\n'
      'The early fee distributed to members.\n'
      'Member-held balances accruing an indicative rate.\n'
      'Security deposits held with accrued yield, and payout holdbacks.\n'
      'Every annualised rate computation and every rate ceiling, including the bid arithmetic of the earlier daily design.\n'
      'The prize draw surface.\n'
      'Any seat price that varies with the collection day, on any cadence.\n'
      'Ballot by lot and credit weighted ordering, which the circle creation route still accepts.', size=10.0)
panel(sl, M + Inches(6.2), Inches(1.8), Inches(5.9), Inches(4.7), 'To be built',
      'The three way split, with each part written to its own ledger account.\n'
      'The two identity assertions at circle creation.\n'
      'The mandate register, the authorisation screen, the confirmation, the cancellation and the advance notice.\n'
      'The arrears record, expressed as owed to the member left short and never as a balance.\n'
      'The bureau instruction screen and the adverse action pack.\n'
      'The fee schedule stating every charge before commitment.\n'
      'Payment initiation and the mandate through the partner’s interface, with Halqa’s fee collected separately.',
      size=10.0, fill=LIME_LT)
note(sl, M, Inches(6.6), CW, 'verified. Source: Statutory Position, revision 4, section 7. The final line of the left '
     'column is verified against the circle creation route in the application code on ' + DATE + '.')

# ======================================================= SECTION 03 ========
divider('03', 'The economics',
        ['One flat fee per instalment, set by instalment size and roster size.',
         'Rs 100 an instalment covers the cost of an open circle; every band above carries margin.',
         'A percentage rail against a flat fee is the binding constraint.'])

# ---- the fee
sl = slide('03 · The fee', 'A flat fee per instalment, stated before any commitment',
           'The fee is set by instalment size and roster size, and is the same for every seat on the roster.')
exhibit(sl, M, Inches(1.72), Inches(6.6), 11, 'Fee per instalment on monthly circles, in rupees, paid to Halqa')
table(sl, M, Inches(2.0), Inches(6.6),
      [['Instalment', '2 to 6 members', '7 to 10 members', '11 or more'],
       ['Up to Rs 2,500', '100', '100', '150'],
       ['Rs 2,501 to 5,000', '100', '150', '200'],
       ['Rs 5,001 to 10,000', '150', '300', '500'],
       ['Above Rs 10,000', '200', '400', '500']],
      [0.34, 0.22, 0.22, 0.22], fs=10.4, rh=Inches(0.38), first_bold=True,
      aligns=[PP_ALIGN.LEFT, PP_ALIGN.CENTER, PP_ALIGN.CENTER, PP_ALIGN.CENTER])
note(sl, M, Inches(3.98), Inches(6.6), 'The national average instalment of Rs 6,400 falls in the third band.')
exhibit(sl, M, Inches(4.36), Inches(6.6), 12, 'Fee discounts. The largest applicable discount is taken; they do not stack.')
table(sl, M, Inches(4.62), Inches(6.6),
      [['Condition', 'Effect', 'Basis'],
       ['Guarantee cheque held on file', '80% off', 'Opens a route under section 489-F of the Penal Code'],
       ['Income slip and employer verified', '50% off', 'Certain and traceable income'],
       ['Income account linked', 'Mandatory', 'Required on unknown committees and Hyper. Not a discount']],
      [0.36, 0.16, 0.48], fs=9.4, rh=Inches(0.36), first_bold=True)
panel(sl, M + Inches(7.0), Inches(2.0), Inches(5.09), Inches(2.1), 'Why the fee is flat',
      'A fee graded by collection day is priced on the advance and reads as interest. Members in later seats '
      'are compensated by Halqa in points and fee waivers issued from its own revenue, never by another member.',
      size=10.0)
panel(sl, M + Inches(7.0), Inches(4.3), Inches(5.09), Inches(1.95), 'Why the fee is lawful',
      'The Explanation to section 84 of the Companies Act 2017 excludes “an advance against sale of goods '
      'or provision of services in the ordinary course of business” from the meaning of a deposit. A fee '
      'charged in advance for a service is revenue.', size=10.0)
tag(sl, M, Inches(6.62), 'To build  ·  the published fee schedule is listed in section 02')

# ---- cost of one committee
sl = slide('03 · Cost', 'What it costs to carry one committee for a year',
           'Reference case: twelve members, Rs 2,500 each, collected monthly, for one year.')
exhibit(sl, M, Inches(1.72), Inches(6.9), 13, 'The reference case')
table(sl, M, Inches(2.0), Inches(6.9),
      [['Line', 'Basis', 'Amount'],
       ['Instalments collected', '12 members over 12 rounds', '144'],
       ['Messaging', '2.3 sends per payment', 'in the per payment figure'],
       ['Identity', 'Rs 200 per member, amortised', 'in the per payment figure'],
       ['Support', '1 contact per 20 payments at Rs 150', 'in the per payment figure'],
       ['Compute and storage', 'Rs 25 per member per year', 'in the per payment figure'],
       ['Cost per payment', 'All in, excluding the rail', 'Rs 12.60'],
       ['Operating cost for the year', '', 'Rs 1,815'],
       ['Fee revenue for the year', 'At the Rs 100 band', 'Rs 14,400'],
       ['Contribution before the rail', '', 'Rs 12,585']],
      [0.36, 0.40, 0.24], fs=9.4, rh=Inches(0.34), bolds=[6, 7, 8, 9])
tb(sl, M, Inches(5.55), Inches(6.9), Inches(0.7),
   'Rs 100 an instalment is the point at which an open circle covers its own operating cost. Every band '
   'above it carries margin.', size=10.6, color=PINE, font=DISPLAY, spacing=1.12)
exhibit(sl, M + Inches(7.3), Inches(1.72), Inches(4.79), 14, 'Monthly cost at four sizes')
table(sl, M + Inches(7.3), Inches(2.0), Inches(4.79),
      [['Stage', 'Monthly cost', 'Per member'],
       ['Bare platform, before launch', 'Rs 14,000', 'n/a'],
       ['With recovery, monitoring and support tooling', 'Rs 58,000', 'n/a'],
       ['100,000 members', 'Rs 1,304,000', 'Rs 13'],
       ['10,000,000 members', 'Rs 110,000,000', 'Rs 11']],
      [0.5, 0.28, 0.22], fs=9.2, rh=Inches(0.42))
tb(sl, M + Inches(7.3), Inches(4.35), Inches(4.79), Inches(1.4),
   'At 100,000 members, Rs 614,000 a month is platform and usage and Rs 690,000 is people. People are the '
   'larger half and do not fall with volume, so support contacts per payment is the figure to watch.',
   size=10.0, spacing=1.14)
note(sl, M, Inches(6.62), CW, 'modelled. Assumptions: Rs 280 to the dollar; 2.3 messages per payment; one support '
     'contact per 20 payments at Rs 150. Source: Business Model, revision 3, sections 4 and 7.')

# ---- the rail
sl = slide('03 · The rail', 'A percentage rail against a flat fee is the binding constraint',
           'The rail takes a rising share of the fee as the instalment grows, so the collection tier is chosen by cost.')
exhibit(sl, M, Inches(1.72), Inches(6.9), 15, 'A rail at 1.5 per cent against the fee, by product')
table(sl, M, Inches(2.0), Inches(6.9),
      [['Product', 'Instalment', 'Rail at 1.5%', 'Fee', 'Share of the fee'],
       ['Hyper, Option 1', 'Rs 450', 'Rs 6.75', 'Rs 75', '9%'],
       ['Hyper, Option 2', 'Rs 500', 'Rs 7.50', 'Rs 83.33', '9%'],
       ['Monthly circle', 'Rs 2,500', 'Rs 37.50', 'Rs 100', '38%'],
       ['Monthly circle', 'Rs 5,000', 'Rs 75', 'Rs 150', '50%'],
       ['Monthly circle', 'Rs 20,000', 'Rs 300', 'Rs 500', '60%']],
      [0.28, 0.18, 0.18, 0.16, 0.2], fs=9.8, rh=Inches(0.38), first_bold=True)
tb(sl, M, Inches(4.45), Inches(6.9), Inches(0.9),
   'Card collection at 3.3 per cent plus Rs 33 would take 64 per cent of Hyper fee revenue and is never '
   'offered on instalments.', size=10.2, spacing=1.12)
panel(sl, M + Inches(7.3), Inches(2.0), Inches(4.79), Inches(2.25), 'Two responses, not exclusive',
      'Agree a price per transaction for the partner’s initiation on monthly circles, rather than a '
      'percentage.\nEstablish with the partner whether its charge can be passed to the payer.', size=10.0)
panel(sl, M + Inches(7.3), Inches(4.45), Inches(4.79), Inches(1.75), 'Where the mandate is used',
      'Only on Hyper, where the instalment is small and a daily approval is impractical. At Rs 450 the rail '
      'takes 9 per cent of the fee.', size=10.0)
note(sl, M, Inches(6.62), CW, 'modelled. The 1.5 per cent rate is indicative and is to be confirmed with the partner. '
     'Source: Business Model, revision 3, section 5.')

# ---- revenue
sl = slide('03 · Revenue', 'Where the revenue comes from',
           'Every source is a charge for a service or a commission from a licensed counterparty. None is a share '
           'of money passing between members.')
exhibit(sl, M, Inches(1.72), Inches(7.3), 16, 'Revenue sources and the stage at which each opens')
table(sl, M, Inches(2.0), Inches(7.3),
      [['Source', 'Basis', 'Stage'],
       ['Service fee', 'Flat per instalment, by instalment size and roster size', 'Partner'],
       ['Fill uplift', 'Where Halqa rather than the host completes a roster', 'Partner'],
       ['Rehabilitation fee', 'Where a defaulted position is restored at the member’s request', 'Partner'],
       ['Agency commission', 'From the takaful operator, about 15 per cent of contributions', 'Agent'],
       ['Distribution commission', 'From the asset manager on savings subscriptions', 'Stage 2'],
       ['Leasing origination', 'On asset circles, once a leasing structure exists', 'Later'],
       ['Aggregate insight', 'Sold without identifying any member', 'Later'],
       ['White label', 'The service licensed to a licensed institution', 'Later']],
      [0.25, 0.57, 0.18], fs=9.4, rh=Inches(0.36), first_bold=True)
panel(sl, M + Inches(7.65), Inches(2.0), Inches(4.44), Inches(1.9), 'Deliberately absent',
      'No share of any amount between members, no interest, no rate, no discount on a payout, no share of '
      'fund profit, and no float income, because nothing is held.', size=9.8)
panel(sl, M + Inches(7.65), Inches(4.05), Inches(4.44), Inches(2.25), 'Points and waivers',
      'Issued by Halqa to members in later seats, in place of any payment from other members. Funded from the '
      'service fee and booked as a liability when issued. Redeemed against later fees, or against goods with a '
      'commerce partner: Daraz, foodpanda or Careem, none contracted.', size=9.8)
note(sl, M, Inches(6.62), CW, 'Source: Business Model, revision 3, sections 2 and 8.')

# ---- timeline
sl = slide('03 · Timeline', 'From a standing start to live money',
           'Engineering is not the constraint. The registration path is.')
exhibit(sl, M, Inches(1.72), Inches(8.2), 17, 'Launch timeline, in days')
table(sl, M, Inches(2.0), Inches(8.2),
      [['Step', 'Days', 'Notes'],
       ['SECP incorporation', '2 to 5', 'Start immediately'],
       ['National Tax Number', '1 to 2', 'Automatic after incorporation'],
       ['Islamabad sales tax on services', '3 to 5', 'In parallel'],
       ['Company bank account', '7 to 14', 'The longest step in registration'],
       ['Partner application', '1', 'Requires the certificate, the tax number and the bank account'],
       ['Partner approval', '14 to 21', 'The largest unknown. The enquiry goes before incorporation'],
       ['Partner’s notice to the State Bank', '0 to 30', 'Para 7.I(h): 30 days before its interface services begin, unless already given'],
       ['Integration and live credentials', '5 to 10', 'Overlaps approval'],
       ['Standard circles live', '30 to 45, up to 75', '75 if the partner’s notice starts only when Halqa signs'],
       ['Takaful agency agreement', '28 to 56', 'Cannot start before the company exists'],
       ['Hyper live, once cover is in place', '75 to 90', 'Without cover, default risk would sit on Halqa’s balance sheet']],
      [0.34, 0.16, 0.50], fs=9.0, hfs=8.8, rh=Inches(0.36), first_bold=True)
panel(sl, M + Inches(8.5), Inches(2.0), Inches(3.59), Inches(3.0), 'The engineering',
      'The code changes set out in section 02, the partner adapter, the mandate lifecycle, reconciliation and '
      'the blocking platform gaps together run about three weeks, inside the registration path.', size=10.0)
note(sl, M, Inches(6.62), CW, 'Source: Business Model, revision 3, section 9.')

# ======================================================= SECTION 04 ========
divider('04', 'Hyper',
        ['A daily product in two fixed configurations, for members with daily income.',
         'Each day’s payers pay that day’s collectors directly, so no party holds a pool.',
         'The only section of this deck that sets out calculations.'])

# ---- configurations
sl = slide('04 · Hyper', 'Two configurations, each balanced at source',
           'Two identities govern every rotating committee. A configuration that breaks either is refused at creation.')
tb(sl, M, Inches(1.7), CW, Inches(0.4),
   'pot = contribution × days          roster = members collecting each day × days',
   size=15, color=PINE, font=DISPLAY)
exhibit(sl, M, Inches(2.2), Inches(7.6), 18, 'The two configurations')
table(sl, M, Inches(2.46), Inches(7.6),
      [['Parameter', 'Option 1', 'Option 2'],
       ['Cycle', '50 days', '26 active days, Sundays excluded'],
       ['Roster', '400 members', '390 members'],
       ['Collecting each day', '8', '15'],
       ['Paid each day', 'Rs 450', 'Rs 500'],
       ['Contribution, takaful, fee', 'Rs 300 / 75 / 75', 'Rs 333.33 / 83.33 / 83.33'],
       ['Pot, collected once', 'Rs 15,000', 'Rs 8,666.67'],
       ['Identity 1', '300 × 50 = 15,000', '333.33 × 26 = 8,666.67'],
       ['Identity 2', '8 × 50 = 400', '15 × 26 = 390'],
       ['Paid in over the cycle', 'Rs 22,500', 'Rs 13,000'],
       ['Cycle value', 'Rs 6,000,000', 'Rs 3,380,000'],
       ['Monthly commitment', 'Rs 13,500', 'Rs 13,000']],
      [0.36, 0.3, 0.34], fs=9.4, rh=Inches(0.315), first_bold=True)
panel(sl, M + Inches(7.95), Inches(2.46), Inches(4.14), Inches(1.9), 'Why 390 on Option 2',
      '400 does not divide into 26 days. At 390 the roster gives exactly 15 collecting each day and reproduces '
      'the Rs 8,666.67 pot precisely.', size=9.8)
panel(sl, M + Inches(7.95), Inches(4.5), Inches(4.14), Inches(1.75), 'What sits outside the pot',
      'The takaful contribution and the service fee never enter the pot. Identity 1 holds on the contribution alone.',
      size=9.8)
tag(sl, M, Inches(6.62), 'To build  ·  Agent  ·  source: Hyper Committee, revision 5, sections 1 and 3')

# ---- settlement and fee
sl = slide('04 · Hyper', 'Daily settlement without a pool',
           'Each day the members who are not collecting are divided among that day’s collectors, and each pays '
           'one collector directly.')
exhibit(sl, M, Inches(1.72), Inches(6.4), 19, 'One day of settlement')
table(sl, M, Inches(2.0), Inches(6.4),
      [['Quantity', 'Option 1', 'Option 2'],
       ['Paying each day', '392', '375'],
       ['Collectors each day', '8', '15'],
       ['Payers assigned to each collector', '392 ÷ 8 = 49', '375 ÷ 15 = 25'],
       ['Received from assigned payers', '49 × Rs 300 = Rs 14,700', '25 × Rs 333.33 = Rs 8,333.33'],
       ['Collector’s own contribution, set off', 'Rs 300', 'Rs 333.33'],
       ['Pot', 'Rs 15,000', 'Rs 8,666.67']],
      [0.4, 0.3, 0.3], fs=9.4, rh=Inches(0.38), first_bold=True)
tb(sl, M, Inches(4.85), Inches(6.4), Inches(1.4),
   'Both configurations divide exactly. Every collector receives the full pot from named members, and no '
   'day’s money is held by Halqa, by the partner or by anyone else. A payment company “will not act as '
   'custodian of consumer’s money” (PSO/PSP Rules 2014, rule 6.5); this design never asks one to.',
   size=9.8, spacing=1.14)
heading(sl, M + Inches(6.8), Inches(1.72), Inches(5.3), 'The fee on Hyper')
bullets(sl, M + Inches(6.8), Inches(2.1), Inches(5.3), [
    'Paid to Halqa and to no member||Company revenue for the committee service.',
    'Never for distributing cover||An agent “shall not charge, to the policyholder, any service fee” unless the insurer includes it in the premium (reg 8(3)).',
    'Flat across the roster||A fee graded by collection day would read as interest.',
    'Later seats compensated by Halqa||Points and fee waivers from Halqa’s own revenue.',
    'No auction, no bidding, no rate||A price discovered between members creates a lender and a borrower.',
    'Discounts||Guarantee cheque 80 per cent off; verified income 50 per cent off; the largest applies.'],
    size=9.8, gap=7)
note(sl, M, Inches(6.62), CW, 'Source: Hyper Committee, revision 5, sections 4 and 5. Grace after the daily due time is 12 hours.')

# ---- cover
sl = slide('04 · Hyper', 'Cover is written by a licensed takaful operator',
           'Section 5(1) of the Insurance Ordinance 2000 admits only a public company as insurer, so the cover is '
           'bought from an operator and never written by Halqa.')
exhibit(sl, M, Inches(1.72), Inches(6.0), 20, 'The risk fund over one cycle')
table(sl, M, Inches(2.0), Inches(6.0),
      [['Fund figure', 'Option 1', 'Option 2'],
       ['Contribution per member per day', 'Rs 75', 'Rs 83.33'],
       ['Contribution per member per cycle', 'Rs 3,750', 'Rs 2,166.67'],
       ['Fund built over the cycle', 'Rs 1,500,000', 'Rs 845,000'],
       ['Default rate the fund covers', '50%', '50%'],
       ['Operator’s commission to Halqa at 15%', 'Rs 225,000', 'Rs 126,750']],
      [0.46, 0.27, 0.27], fs=9.4, rh=Inches(0.36), first_bold=True)
exhibit(sl, M, Inches(4.35), Inches(6.0), 21, 'Expected loss and the cover it requires')
table(sl, M, Inches(4.6), Inches(6.0),
      [['Default rate p', 'Option 1 loss', 'Cover a day', 'Option 2 loss', 'Cover a day'],
       ['10%', 'Rs 300,000', 'Rs 15.00', 'Rs 169,000', 'Rs 16.67'],
       ['30%', 'Rs 900,000', 'Rs 45.00', 'Rs 507,000', 'Rs 50.00'],
       ['50%', 'Rs 1,500,000', 'Rs 75.00', 'Rs 845,000', 'Rs 83.33'],
       ['100%', 'Rs 3,000,000', 'Rs 150.00', 'Rs 1,690,000', 'Rs 166.67']],
      [0.2, 0.22, 0.18, 0.22, 0.18], fs=9.0, rh=Inches(0.3))
heading(sl, M + Inches(6.4), Inches(1.72), Inches(5.7), 'The agent’s obligations')
bullets(sl, M + Inches(6.4), Inches(2.1), Inches(5.7), [
    'Gross premium||Passed to the operator in full; the agent “shall not retain any part of the insurance premium” (reg 5(4)).',
    'Commission||Computed on premiums the insurer has received (reg 8(2)).',
    'Claims||Paid by the operator to the member left short, in that member’s own name (reg 7(4)).',
    'Bundle||The cost of cover is shown apart from the committee (reg 11(1)(d)).',
    'Coercion||Whether compulsory cover sits within reg 10(c) is for counsel’s written opinion before Hyper opens.',
    'Deficit and surplus||A deficit is met by an interest-free advance from the operator’s shareholder fund; a surplus is distributable to participants.'],
    size=9.6, gap=7)
note(sl, M, Inches(6.62), CW, 'Expected loss on a cycle = roster × default rate × half a pot. At a 100 per cent '
     'default rate the cover required equals the whole daily margin. Candidates: Pak-Qatar General Takaful, Salaam Takaful; none contracted.')

# ---- threshold
sl = slide('04 · Hyper', 'The collapse threshold, and the bands before it',
           'The point at which a circle would owe more than it can collect, derived and then instrumented so the host sees it coming.')
exhibit(sl, M, Inches(1.72), Inches(5.6), 22, 'Five results')
bullets(sl, M, Inches(2.02), Inches(5.6), [
    'Arrears before collection recover themselves||A member who missed j contributions receives the pot less j contributions, paid on that day to the members left short.',
    'The only true loss is default after collection||A member collecting on day t and stopping owes one contribution for each remaining day. Day 1: Rs 14,700; day 25: Rs 7,500; day 50: nil.',
    'Expected loss||Roster × default rate × half a pot; half the default rate as a share of cycle value.',
    'The hard stop||Once unrecovered exposure E exceeds the cover limit C, no further day opens until E is below C.',
    'Daily shortfall||On Option 1, 50 missed payments on one day equal exactly one pot.'],
    size=9.4, gap=7)
exhibit(sl, M + Inches(6.0), Inches(1.72), Inches(6.09), 23, 'The stress index, 0 to 100, recomputed each day')
table(sl, M + Inches(6.0), Inches(2.0), Inches(6.09),
      [['Axis', 'Measure', 'Weight'],
       ['Severity', 'Unrecovered exposure against cover plus one pot', '45%'],
       ['Breadth', 'Defaults after collection against pots covered', '20%'],
       ['Behaviour', 'Share of roster with a prior late payment', '15%'],
       ['Persistence', 'Age of arrears in 12 hour periods, capped at 6', '10%'],
       ['Timing', 'Day reached out of the cycle', '10%']],
      [0.2, 0.64, 0.16], fs=8.8, rh=Inches(0.3), first_bold=True)
exhibit(sl, M + Inches(6.0), Inches(4.0), Inches(6.09), 24, 'An Option 1 circle under stress, cover at 8 pots')
table(sl, M + Inches(6.0), Inches(4.26), Inches(6.09),
      [['Day', 'Defaults', 'Exposure', 'Index', 'Band', 'Action'],
       ['5', '0', 'Rs 0', '1.2', 'Green', 'Reminders only'],
       ['12', '1', 'Rs 14,100', '11.8', 'Green', 'Case tracked'],
       ['20', '3', 'Rs 37,800', '28.6', 'Green', 'Host told, operator on notice'],
       ['30', '6', 'Rs 64,800', '49.5', 'Amber', 'New joins blocked'],
       ['38', '9', 'Rs 81,000', '64.0', 'Amber', 'Claim prepared'],
       ['45', '13', 'Rs 93,600', '72.1', 'Red', 'Next day not opened']],
      [0.08, 0.12, 0.17, 0.1, 0.12, 0.41], fs=8.6, hfs=8.4, rh=Inches(0.28))
note(sl, M, Inches(6.62), CW, 'modelled. Bands: green 0 to 33, amber 34 to 66, red 67 to 100. The hard stop applies '
     'whatever the index. Source: Hyper Committee, revision 5, sections 8 and 9.')

# ---- economics and gates
sl = slide('04 · Hyper', 'Revenue on one cycle, and who may take a seat',
           'The default loss falls on the risk fund, not on Halqa, which is the purpose of the split.')
exhibit(sl, M, Inches(1.72), Inches(6.4), 25, 'Revenue and cost on one cycle')
table(sl, M, Inches(2.0), Inches(6.4),
      [['Line', 'Option 1', 'Option 2'],
       ['Fee revenue', 'Rs 1,500,000', 'Rs 845,000'],
       ['Operator’s commission at 15%', 'Rs 225,000', 'Rs 126,750'],
       ['Gross revenue', 'Rs 1,725,000', 'Rs 971,750'],
       ['Payment events', '20,000', '10,140'],
       ['Rail at 1.5% on the mandate', '(Rs 135,000)', '(Rs 76,050)'],
       ['Payment cost at Rs 12.20', '(Rs 244,000)', '(Rs 123,708)'],
       ['Net per cycle', 'Rs 1,346,000', 'Rs 771,992'],
       ['Expected default loss at 5%, borne by the fund', 'Rs 150,000', 'Rs 84,500']],
      [0.5, 0.25, 0.25], fs=9.4, rh=Inches(0.34), bolds=[7], first_bold=True)
note(sl, M, Inches(5.2), Inches(6.4), 'The rail line assumes Halqa bears the partner’s charge; it falls away if the '
     'charge is passed to the payer.', h=Inches(0.4))
exhibit(sl, M + Inches(6.8), Inches(1.72), Inches(5.29), 26, 'Entry gates')
table(sl, M + Inches(6.8), Inches(2.0), Inches(5.29),
      [['Gate', 'Reason'],
       ['Income account linked', 'Verified under HQ-MF-03'],
       ['Minimum standing', 'A daily obligation leaves little room to recover'],
       ['2 clean circles', 'Monthly behaviour is the only reliable predictor'],
       ['Highest identity level', 'The roster is drawn from strangers'],
       ['Daily income', 'Rs 1,000 or more on 5 days of every week for 8 weeks'],
       ['Affordability', 'Verified income of Rs 40,909 a month on Option 1'],
       ['No open default', 'Closed to any member in difficulty']],
      [0.42, 0.58], fs=8.8, rh=Inches(0.32), first_bold=True)
exhibit(sl, M + Inches(6.8), Inches(4.72), Inches(5.29), 27, 'Late ladder after the daily due time')
table(sl, M + Inches(6.8), Inches(4.98), Inches(5.29),
      [['Step', 'Elapsed', 'Penalty', 'Standing'],
       ['Grace', '0 to 12 hours', 'None', 'No change'],
       ['First', '12 hours', '5%', 'Less 20'],
       ['Second', '36 hours', '10%', 'Less 40'],
       ['Third', '60 hours', '15%', 'Less 60'],
       ['Default after collecting', 'Any', 'As above', 'Less 200']],
      [0.34, 0.24, 0.18, 0.24], fs=8.6, rh=Inches(0.26))
note(sl, M, Inches(6.62), CW, 'modelled. Penalties on Shariah labelled circles are given to charity at the end of the '
     'circle. Source: Hyper Committee, revision 5, sections 10 to 12.')

# ======================================================= SECTION 05 ========
divider('05', 'The product',
        ['The member journey from signup to a completed circle, with the control at each step.',
         'Standing decides which seats a member may claim, never the order once a circle starts.',
         'There is no cancel button. Exit is a ladder with published arithmetic.'])

# ---- the journey
sl = slide('05 · The journey', 'From signup to a completed circle',
           'Each step carries the control that applies to it.')
steps = [('Sign up', ['Phone number and one-time passcode', 'Application PIN on every open',
                      'Name, address, city and occupation before joining']),
         ('Verify', ['CNIC scanned with the camera', 'NADRA Verisys check', 'Face match at exit and high value actions',
                     'Account title matched to the CNIC name']),
         ('Join', ['Join sheet states every amount before signature', 'Seat chosen from those the band allows',
                   'Affordability gate', 'Undertaking and mutual guarantee signed']),
         ('Pay', ['Approval in the application, tier 1', 'Mandate on Hyper, tier 2', 'Send over Raast, tier 3',
                  'Receipt naming the rail and each part']),
         ('Collect', ['Payout to the verified account when the round closes', 'Paid once and only once',
                      'Remaining instalments restated']),
         ('Complete', ['Every record written', 'Clean completion raises standing', 'Host points on clean circles'])]
bw = (CW - Inches(0.25) * 5) / 6
for i, (t, lines) in enumerate(steps):
    x = M + i * (bw + Inches(0.25))
    rect(sl, x, Inches(1.8), bw, Inches(0.5), fill=PINE if i in (0, 5) else LIME_LT, line=PINE, lw=0.75)
    tb(sl, x, Inches(1.92), bw, Inches(0.3), t, size=12, color=IVORY if i in (0, 5) else PINE, bold=True,
       align=PP_ALIGN.CENTER)
    if i < 5:
        arrow(sl, x + bw, Inches(2.05), x + bw + Inches(0.25), Inches(2.05), color=LIME, lw=1.6)
    bullets(sl, x, Inches(2.5), bw, lines, size=9.2, gap=6)
panel(sl, M, Inches(4.75), Inches(5.9), Inches(1.6), 'Messaging and records',
      'Notices over the WhatsApp Business Platform on approved templates, one consolidated daily notice on Hyper, '
      'and statements, receipts, the schedule and a full data export for every member.', size=9.8)
panel(sl, M + Inches(6.2), Inches(4.75), Inches(5.9), Inches(1.6), 'Status',
      'The status of each feature is tracked item by item in the Work Register. Identity capture and the home '
      'location pin are blocked in production by the permission policy, and NADRA Verisys awaits the corporate '
      'agreement.', size=9.8)
note(sl, M, Inches(6.62), CW, 'Source: Complete Feature and Process List, revision 4, sections 1, 5, 7, 9, 16 and 17.')

# ---- standing
sl = slide('05 · Standing', 'Standing decides which seats a member may claim',
           'The score never reorders a circle once it starts. It limits which free seats are offered at join.')
exhibit(sl, M, Inches(1.72), Inches(7.2), 28, 'The internal score, 300 to 850, in four bands')
bands = [('Rebuilding', 'below 550', RED), ('Fair', '550 to 649', AMBER), ('Good', '650 to 749', LIME),
         ('Excellent', '750 and above', MID)]
bw = Inches(7.2) / 4
for i, (n, r, c) in enumerate(bands):
    x = M + i * bw
    rect(sl, x, Inches(2.0), bw - Inches(0.05), Inches(0.14), fill=c)
    tb(sl, x, Inches(2.2), bw, Inches(0.3), n, size=11.4, color=PINE, bold=True)
    tb(sl, x, Inches(2.46), bw, Inches(0.3), r, size=9.4, color=GREY)
table(sl, M, Inches(2.95), Inches(7.2),
      [['Band', 'Seats a member may claim at join'],
       ['Rebuilding', 'The last three seats, never earlier than the second half of the order'],
       ['Fair', 'Any free seat in the second half of the order'],
       ['Good', 'Any free seat'],
       ['Excellent', 'Any free seat']],
      [0.25, 0.75], fs=9.6, rh=Inches(0.34), first_bold=True)
bullets(sl, M, Inches(4.85), Inches(7.2), [
    'New accounts||Open at 700, in the Good band.',
    'New member rule||Whatever the score, a member with no history takes only the final seats until two clean circles are complete and verification is done.',
    'Turn swap||Two members exchange positions at no price, with host approval, and both bands must permit the new positions.'],
    size=9.8, gap=6)
heading(sl, M + Inches(7.6), Inches(1.72), Inches(4.5), 'Why the signal is strong')
tb(sl, M + Inches(7.6), Inches(2.12), Inches(4.5), Inches(2.2),
   'Households rank the committee instalment above rent and utility bills. An informant in Kamran (2017), a '
   'housemaid earning Rs 15,000 a month, described the instalment as the one payment that is not missed.\n'
   'A score built from committee payments therefore carries the strongest repayment signal the household has.',
   size=10.0, spacing=1.14, gap=8)
panel(sl, M + Inches(7.6), Inches(4.5), Inches(4.49), Inches(1.8), 'Affordability and exposure',
      'On unknown committees, instalments are held to one third of verified income, and 40 per cent with other loans. '
      'Obligations across every circle held are summed before a seat is granted.', size=9.8)
note(sl, M, Inches(6.62), CW, 'verified against score-bands.ts; Complete Feature and Process List, revision 4, sections 2 and 14.')

# ---- default, recovery, exit
sl = slide('05 · Default and exit', 'Prevention, recovery and exit',
           'Most members never reach recovery. Exit runs on a ladder, and nothing is held by Halqa at any step.')
panel(sl, M, Inches(1.75), Inches(3.9), Inches(4.75), 'Prevention',
      'Affordability gate at one third of verified income.\nForward liability gate on early seats.\nBand confinement and the '
      'new member rule.\nHost vetting of every member.\nMutual guarantee and a ten clause undertaking.\nGuarantee '
      'cheque, 80 per cent off the fee.\nIncome account on unknown committees.\nCollection aligned to the inferred pay day.\n'
      'Reminders that escalate before the due date.\nFeature lock while a default is open.', size=9.4)
panel(sl, M + Inches(4.1), Inches(1.75), Inches(3.9), Inches(4.75), 'Recovery',
      'Grace window, then a late ladder of three steps, each with a stated penalty.\nOn Shariah labelled circles the '
      'penalty is given to charity at the end of the circle.\nA recovery case at the third step.\nContact routes to a '
      'hardship statement, a waived fine and a revised date.\nSilence routes to restitution, then the guarantee and '
      'any takaful claim.\nA summary suit on the undertaking is the last step.\nNo collection calls and no contact lists, '
      'at any stage.', size=9.4)
panel(sl, M + Inches(8.2), Inches(1.75), Inches(3.89), Inches(4.75), 'Exit ladder',
      '1. Window withdrawal: inside the 24 hour confirming window, free and unrecorded.\n2. Substitution: a replacement '
      'takes the seat at no premium.\n3. Group approved exit: a 72 hour vote, majority of votes cast, 50 per cent quorum.\n'
      '4. Hardship exit: a recorded statement, the fine waived, annotated as hardship and not default.\n5. Abandonment: not '
      'an exit; the recovery path applies.\nWhere no replacement is found, each member who has already collected owes '
      'the leaver one contribution, settled at completion.', size=9.2)
note(sl, M, Inches(6.62), CW, 'verified against exit-ladder.ts. Defaulting on a signed guarantee is a civil matter: '
     'recovery is by summary suit under Order XXXVII of the Code of Civil Procedure and needs a decree first.')

# ---- bureau
sl = slide('05 · Credit', 'The bureau link',
           'Committee repayment history exists in no bureau today. Halqa can supply it through a private bureau without a financial licence.')
bullets(sl, M, Inches(1.8), Inches(7.0), [
    'Route to a report||On the member’s written or electronic instruction under section 19(1)(b) of the Credit Bureaus Act 2015. Section 19(1)(a) is confined to credit institutions.',
    'Bureau||A subscriber agreement with TASDEEQ, with DataCheck as the alternate. Neither is contracted.',
    'State register||The State Bank’s eCIB is closed to non-banks and is not a source.',
    'Writing back||Repayment history is furnished once the Federal Government notifies furnishers that are not credit institutions, under section 11(1).',
    'Adverse action||Where a report restricts a seat, the member receives the pack that section 31 requires.',
    'Scale||Reports arrive on the TASDEEQ scale of 200 to 600 and are held apart from the internal score of 300 to 850.'],
    size=10.0, gap=8)
panel(sl, M + Inches(7.4), Inches(1.8), Inches(4.69), Inches(2.6), 'Measured elsewhere',
      'Mission Asset Fund, a San Francisco non-profit, runs lending circles on the Mexican tanda and reports each '
      'payment to the three US bureaus. It reports an average score increase of 168 points for participants.',
      size=9.8)
panel(sl, M + Inches(7.4), Inches(4.55), Inches(4.69), Inches(1.75), 'Precedent at home',
      'Karandaaz, a non-bank, has signed a data agreement with TASDEEQ.', size=9.8)
note(sl, M, Inches(6.5), CW, 'verified for the statute; reported for Mission Asset Fund and Karandaaz.')
tag(sl, M, Inches(6.8), 'To build  ·  bureau subscriber agreement')

# ---- later stages
sl = slide('05 · Later stages', 'Cover and savings sit with licensed institutions',
           'Each opens only when its registration is in hand, and neither places member money with Halqa.')
panel(sl, M, Inches(1.75), Inches(5.9), Inches(4.6), 'Cover',
      'Written and priced by a licensed general takaful operator: Pak-Qatar General Takaful or Salaam Takaful, none contracted.\n'
      'Contributions sit in the participants risk fund, which the participants own and the operator manages.\n'
      'Mandatory on unknown committees and a fixed part of every payment on Hyper; optional on known committees.\n'
      'Claims paid by the operator to the member left short, in that member’s own name.\n'
      'Halqa acts as agent under a written agency agreement and earns a disclosed commission.', size=9.8)
panel(sl, M + Inches(6.2), Inches(1.75), Inches(5.9), Inches(4.6), 'Savings',
      'A fund managed by a licensed asset manager, Mahaana Wealth as candidate, with the Central Depository Company '
      'of Pakistan as trustee. None contracted.\nThe trust deed is executed on paper, because the Electronic '
      'Transactions Ordinance does not reach a trust (section 31(1)(c)).\nMoney passes from the member to the trustee '
      'collection account directly, and units are issued in the member’s own name.\nHalqa is an execution-only '
      'distributor: nothing is recommended, and it takes no share of fund profit.', size=9.8, fill=LIME_LT)
tag(sl, M, Inches(6.62), 'Agent for cover  ·  Stage 2 for savings  ·  source: Feature List, revision 4, sections 20 and 21')

# ======================================================= SECTION 06 ========
divider('06', 'The evidence',
        ['Twenty-five attempts across nine markets, reduced to the same questions.',
         'Every failure held member money, guaranteed it, or removed the rotation.',
         'A national wallet launched a committee product in August 2026.'])

# ---- the finding
sl = slide('06 · The archive', 'The finding, before the evidence')
tb(sl, M, Inches(1.35), CW, Inches(1.0),
   'Of twenty-five attempts, every failure held member money, guaranteed member money, or removed the rotation '
   'that makes a committee a committee. Every durable success kept the money outside itself, or paid the full '
   'regulatory cost of holding it.', size=13.4, color=PINE, font=DISPLAY, spacing=1.14)
exhibit(sl, M, Inches(2.55), CW, 29, 'The eight causes of failure')
table(sl, M, Inches(2.82), CW,
      [['#', 'Cause', 'Cases'],
       ['1', 'Custody: holding the pool', 'Punjab cooperatives, TAG, Sidra Humaid, Saradha, and the ceiling Oraan met'],
       ['2', 'Guarantee burden: the platform as payer of last resort', 'eMoneyPool'],
       ['3', 'Stranger pooling: trust without a social graph', 'Yahoo Tanda, Puddle, Oraan’s first model'],
       ['4', 'Removing the credit half: no early pot', 'UBL Kommittee'],
       ['5', 'Adding interest to an instrument defined against it', 'UBL Kommittee, and every auction model in Pakistan'],
       ['6', 'A ledger without settlement', 'Udhaar Book, DigiKhata'],
       ['7', 'Charging the member for access', 'Oraan’s first model, subscription committee applications'],
       ['8', 'Rules written after a scandal, around another firm’s model', 'India after Saradha; Pakistan after nano-lending']],
      [0.05, 0.43, 0.52], fs=9.4, rh=Inches(0.36))
note(sl, M, Inches(6.55), CW, 'reported, from company disclosures, regulator actions and the press across nine markets.')

# ---- models that work
sl = slide('06 · The archive', 'The four models that work, and what each shows',
           'None competes for Halqa’s position. Each confirms one part of it.')
table(sl, M, Inches(1.72), CW,
      [['Case', 'Reported scale', 'Mechanism', 'What it shows'],
       ['Money Fellows, Egypt', '8 million downloads; about $1.5 billion processed across 2 million circles; profitable in 2025',
        'Custody under a licence. The seat is priced, and the platform covers defaults from its own capital',
        'Digital committees reach millions and profit. A priced seat and a platform guarantee need a licence; Halqa carries neither'],
       ['Hakbah, Saudi Arabia', '1.3 million registered users; a SAMA sandbox permit',
        'Treated the jam’iyya as an institution to respect, with the central bank as first partner',
        'Central banks regulate the activity in comparable markets'],
       ['Mapan, Indonesia', 'Acquired by GO-JEK in 2017', 'Village organisers form and run circles; the pot is often delivered as goods',
        'The unit of growth is the organiser, paid for organising'],
       ['The Money Club, India', 'About 200,000 users and 17,000 clubs', 'Members start small; clean history unlocks larger clubs',
        'Seats, and in time amounts, should scale with demonstrated history']],
      [0.17, 0.25, 0.3, 0.28], fs=9.0, rh=Inches(0.9), first_bold=True)
note(sl, M, Inches(6.55), CW, 'reported, from company disclosures and the press.')

# ---- the credit history thesis
sl = slide('06 · The archive', 'The value is in the credit history, not in holding money',
           'The cases that created the most value converted an obligation people already honour into a formal credit history.')
panel(sl, M, Inches(1.75), Inches(5.9), Inches(2.4), 'Esusu, United States',
      'Began as a communal savings application, then turned to reporting on-time rent to Equifax, Experian and '
      'TransUnion. In January 2022 it raised a $130 million Series B led by SoftBank Vision Fund 2 at a $1 billion '
      'valuation.', size=9.8)
panel(sl, M + Inches(6.2), Inches(1.75), Inches(5.9), Inches(2.4), 'eMoneyPool and Chamasoft',
      'eMoneyPool reported members’ payment histories for nine years and failed carrying the guarantee on its own '
      'balance sheet. Chamasoft in Kenya shows that where an excellent payment rail exists, the platform layer that '
      'survives is the data.', size=9.8)
tb(sl, M, Inches(4.45), CW, Inches(1.4),
   'In the United States the obligation households already honour is rent. In Pakistan it is the committee '
   'instalment, which households rank above rent. Halqa applies the same approach to it: the credit score built '
   'from committee payments is the asset that compounds, while the fee pays for the service.',
   size=12.2, color=PINE, font=DISPLAY, spacing=1.16)
note(sl, M, Inches(6.55), CW, 'reported, from company disclosures and the press.')

# ---- competitive position
sl = slide('06 · Competition', 'The competitive position',
           'The category is proven and contested at the same time.')
table(sl, M, Inches(1.72), CW,
      [['Player', 'What it offers', 'Threat', 'The difference'],
       ['JazzCash Committee', 'Launched 13 August 2026. Rotates among contacts; the pot is collected into an administrator’s wallet; the administrator sets the order; no exit before the cycle ends; fees not published',
        'High', 'Halqa holds no pot, sets the order by rule and publishes an exit path'],
       ['Oraan', 'Custody, a licence, member fees and pooling of strangers', 'Low', 'Each structural choice is the opposite of Halqa’s'],
       ['Money Fellows', 'Custody under an Egyptian licence', 'Low in the near term', 'Entry would need a Pakistani licensing programme'],
       ['Ledger applications', 'Udhaar Book and DigiKhata record debts but produce no credit history', 'Low on substance',
        'DigiKhata completed the State Bank sandbox’s first cohort, on open banking'],
       ['UBL Kommittee', 'A deposit product under the committee name, with no rotation', 'Low', 'It removes the credit half']],
      [0.16, 0.44, 0.12, 0.28], fs=9.0, rh=Inches(0.62), first_bold=True)
panel(sl, M, Inches(5.35), CW, Inches(1.0), 'The defence',
      'Become the layer a wallet would rather integrate than rebuild: the committee service offered by interface to '
      'licensed institutions, which the Business Model lists as later revenue.', size=9.8)
note(sl, M, Inches(6.55), CW, 'reported. JazzCash Committee observed in the JazzCash application release of August 2026 '
     'and summarised in the Business Model, revision 3, section 10.')

# ---- UBL
sl = slide('06 · The archive', 'What a balance sheet removes from a committee',
           'UBL Kommittee Account: a deposit product from one of Pakistan’s largest banks, sold under the committee name.')
table(sl, M, Inches(1.72), Inches(7.0),
      [['What was removed', 'Consequence'],
       ['The rotation', 'No member receives a pot early. The credit half disappears, and with it the reason early members join'],
       ['The peers', 'No group and no social enforcement, hence an instalment holiday no real committee could offer'],
       ['The structure without interest', 'A fixed return on deposits came in: interest, in the form committee culture defines itself against']],
      [0.3, 0.7], fs=9.6, rh=Inches(0.62), first_bold=True)
tb(sl, M, Inches(4.35), Inches(7.0), Inches(1.2),
   'A 24 month plan at Rs 100,000 a month pays Rs 2,500,000 for Rs 2,400,000 paid in: less than an ordinary '
   'savings account paid over the same period.', size=10.4, spacing=1.14)
panel(sl, M + Inches(7.4), Inches(1.72), Inches(4.69), Inches(4.6), 'The lesson',
      'A balance-sheet institution cannot run the committee, because its value lies in what a balance sheet must '
      'remove: credit between peers without interest, enforcement without collateral, and money that never becomes '
      'the institution’s liability.\nBanks can hold group savings. They cannot rotate group credit.\nFNB’s stokvel '
      'accounts in South Africa work because most stokvels accumulate rather than rotate, so a bank account serves '
      'that instrument.', size=9.8)
note(sl, M, Inches(6.55), CW, 'reported, from the published product terms.')

# ---- nano-lending
sl = slide('06 · The precedent', 'Any credit-adjacent product is judged against the loan apps',
           'Four hundred predatory loan applications were blocked in 2023 and 2024. Every permission Halqa requests is read against them.')
panel(sl, M, Inches(1.75), Inches(5.9), Inches(2.2), 'How they worked',
      'Loans of Rs 1,000 to 25,000 over 7 to 90 days, priced for mass default and recovered through social coercion: '
      'contact harvesting, calls to relatives, altered photographs and rollover debt. A case in Rawalpindi ended in '
      'a suicide, an FIA crackdown and more than twenty arrests.', size=9.6)
panel(sl, M, Inches(4.1), Inches(5.9), Inches(2.25), 'What was banned, most of it even with consent',
      'SECP Circulars 3, 10, 14 and 15 of 2023 and 8 of 2024: no contact list or gallery access; contact only a '
      'separately consented guarantor; an exposure cap of Rs 25,000 per application; a Key Fact Statement; borrower '
      'data kept in Pakistan. Google Play, 31 May 2023: personal loan applications may not read contacts, photos, '
      'precise location or storage.', size=9.6)
heading(sl, M + Inches(6.2), Inches(1.75), Inches(5.9), 'What Halqa refuses, on the record')
bullets(sl, M + Inches(6.2), Inches(2.15), Inches(5.9), [
    'Contact lists||Only on-device hashed matching is acceptable.',
    'Gallery, text messages, call log and the list of installed applications||Never requested.',
    'Background location||A single home pin at signup only.',
    'Screen reading of bank applications||Declined, because it is the loan-app signature and reads the whole screen.',
    'A public default list||The flag stays internal.'],
    size=9.8, gap=8)
tb(sl, M + Inches(6.2), Inches(4.95), Inches(5.9), Inches(1.2),
   'The loan apps coerced because they lent to strangers without collateral. In a committee the seat is the '
   'collateral, an unproven member is confined to the final seats, and the circle already exists.',
   size=10.4, color=PINE, font=DISPLAY, spacing=1.14)
note(sl, M, Inches(6.55), CW, 'reported, from SECP circulars, the Google Play policy and the press.')

# ======================================================= SECTION 07 ========
divider('07', 'State and plan',
        ['Where the company stands on ' + DATE + '.',
         'What must happen, in order, before live money.',
         'What remains open.'])

# ---- current state
sl = slide('07 · State', 'Where the company stands', 'As of ' + DATE + '.')
table(sl, M, Inches(1.66), Inches(7.6),
      [['Dimension', 'State'],
       ['Company', 'Not yet incorporated. Incorporation is the first step of the launch timeline'],
       ['Product', 'Web application live since 20 July 2026 and not opened to the public. The interface is being rebuilt to the standard of the national wallets'],
       ['Money', 'No rail is connected and no real money has moved. Payments settle in a sandbox'],
       ['Code', 'Constructs of the August design remain and are to be removed before the partner agreement'],
       ['Partner', 'None contracted. The enquiry to NayaPay and SadaPay is drafted and not sent'],
       ['Regulator', 'Mentored informally by the Chairman of the Commission. No formal engagement'],
       ['Documents', 'Six documents re-issued on 24 September 2026, each quotation checked against the primary text']],
      [0.2, 0.8], fs=9.4, rh=Inches(0.52), first_bold=True)
panel(sl, M + Inches(8.0), Inches(1.66), Inches(4.09), Inches(4.7), 'Blocking in production',
      'Identity capture and the home location pin are blocked by the permission policy, which sets camera and '
      'geolocation to none.\nDemonstration data is to be wiped before the first real member.\nNo error monitoring '
      'and no versioned migrations.\nChat polls every six seconds.', size=9.6)
note(sl, M, Inches(6.55), CW, 'verified against the repository and the production configuration on ' + DATE + '.')

# ---- counterparties
sl = slide('07 · Counterparties', 'Named counterparties, none contracted',
           'Each is the intended or candidate counterparty for its function.')
table(sl, M, Inches(1.72), CW,
      [['Function', 'Counterparty', 'Needed for'],
       ['Electronic money institution', 'NayaPay or SadaPay, to be confirmed against the State Bank register', 'Collection, tiers 1 and 2'],
       ['Payment aggregator', 'PayFast or Safepay', 'Halqa’s own fee only'],
       ['Instant payment rail', 'Raast, operated by the State Bank of Pakistan', 'Tier 3 and the fee'],
       ['Wallet rails', 'JazzCash and Easypaisa', 'Members paying from a wallet'],
       ['Interbank switch', '1LINK', 'Interbank transfers'],
       ['Identity verification', 'NADRA, through a corporate Verisys agreement', 'Verification'],
       ['Credit bureau', 'TASDEEQ, with DataCheck as the alternate', 'Reports on instruction'],
       ['Takaful operator', 'Pak-Qatar General Takaful or Salaam Takaful', 'Cover'],
       ['Trustee', 'Central Depository Company of Pakistan', 'Savings, stage 2'],
       ['Asset manager', 'Mahaana Wealth', 'Savings, stage 2'],
       ['Messaging', 'WhatsApp Business Platform', 'Notices and passcodes'],
       ['Points redemption', 'Daraz, foodpanda or Careem', 'Points and waivers'],
       ['Infrastructure', 'Vercel, Supabase, Cloudflare', 'Hosting, database, edge']],
      [0.24, 0.5, 0.26], fs=9.2, rh=Inches(0.33), first_bold=True)
note(sl, M, Inches(6.55), CW, 'Source: Business Model, revision 3, section 11.')

# ---- next steps
sl = slide('07 · Plan', 'What happens next, in order',
           'The first three steps run together. Nothing after them can be reached until they are done.')
steps = [('Now', 'Send the partner enquiry', 'To NayaPay and SadaPay first, before incorporating, since partner approval is the largest unknown.'),
         ('Days 1 to 14', 'Make Halqa a company', 'SECP incorporation with the chairman’s father as director, the tax number, Islamabad sales tax and a bank account.'),
         ('In parallel', 'Change the code', 'Remove the constructs of the August design and build the components listed in section 02, about three weeks.'),
         ('Days 14 to 45', 'Partner approval and integration', 'Approval, the partner’s notice under para 7.I(h), and live credentials. Standard circles live at 30 to 45 days, up to 75.'),
         ('Days 28 to 90', 'Cover, then Hyper', 'A written agency agreement with a general takaful operator, and counsel’s opinion on compulsory cover. Hyper live at 75 to 90 days.'),
         ('Then', 'Bureau and savings', 'The TASDEEQ subscriber agreement, and MUFAP membership with a trustee and an asset manager.')]
y = Inches(1.75)
for i, (when, t, d) in enumerate(steps):
    rect(sl, M, y, Inches(1.7), Inches(0.66), fill=PINE if i < 3 else LIME_LT)
    tb(sl, M, y + Inches(0.2), Inches(1.7), Inches(0.3), when, size=10.4, color=IVORY if i < 3 else PINE, bold=True,
       align=PP_ALIGN.CENTER)
    tb(sl, M + Inches(1.95), y + Inches(0.06), Inches(3.4), Inches(0.3), t, size=12, color=PINE, font=DISPLAY)
    tb(sl, M + Inches(5.4), y + Inches(0.08), Inches(6.7), Inches(0.6), d, size=9.8, color=INK, spacing=1.1)
    line(sl, M + Inches(1.95), y + Inches(0.74), W - M, y + Inches(0.74), color=LIME_LT, lw=0.75)
    y += Inches(0.8)
note(sl, M, Inches(6.62), CW, 'Source: Registrations and Licences Required; Statutory Position, revision 4, section 7.')

# ---- pre-mortem
sl = slide('07 · Risk', 'The pre-mortem: it is 2029 and Halqa has failed',
           'Each row names the mechanism and the signal that would show it starting.')
table(sl, M, Inches(1.72), CW,
      [['Cause', 'Mechanism', 'Early signal'],
       ['Collection never became real', 'The partner declined direct settlement or priced initiation above the fee; members returned to cash',
        'Share of instalments settled through the partner'],
       ['An organiser used Halqa’s standing for an offline scheme', 'A clean record on Halqa shown as proof for a large scheme elsewhere',
        'Organisers running many circles at once, member concentration, implausible growth'],
       ['The wallets took the category', 'JazzCash Committee reached its users first; distribution beat design',
        'JazzCash Committee changes and any Easypaisa release'],
       ['Regulatory reclassification', 'A committee fraud elsewhere produced rules shaped around custody, with no carve-out',
        'Consultation papers from the State Bank or the Commission'],
       ['Losses beyond the model', 'The default band stayed modelled and real losses landed outside it',
        'Measured default after collection in the first hundred completed circles'],
       ['The founder ran out of time', 'Product, regulation, partners and research all ran through one person',
        'Time between shipped milestones']],
      [0.25, 0.42, 0.33], fs=9.2, rh=Inches(0.58), first_bold=True)
note(sl, M, Inches(6.55), CW, 'The organiser risk is addressed before public launch: a cap on concurrent circles per '
     'organiser, a flag on implausible growth, and a credit passport confined to on-platform history.')

# ---- five numbers
sl = slide('07 · Measures', 'The five numbers that show whether this is working',
           'A committee arrives as a formed network of ten to fifteen people with a leader. The measures follow from that.')
nums = [('1', 'Share of instalments settled through the partner', 'The health of collection, and the most important number in the company.'),
        ('2', 'Circles completed clean', 'The unit of value. A circle that never finishes proves nothing about its members.'),
        ('3', 'Circles per organiser', 'Whether growth compounds. A host’s second circle brings the whole group back.'),
        ('4', 'Measured default after collection in the first 100 circles', 'The point at which the modelled band becomes a fact.'),
        ('5', 'Members who become organisers', 'The growth loop inside the product.')]
y = Inches(1.8)
for n, t, d in nums:
    tb(sl, M, y, Inches(0.6), Inches(0.5), n, size=24, color=LIME, font=DISPLAY)
    tb(sl, M + Inches(0.8), y + Inches(0.04), Inches(5.6), Inches(0.4), t, size=12.4, color=PINE, font=DISPLAY)
    tb(sl, M + Inches(6.6), y + Inches(0.08), Inches(5.5), Inches(0.5), d, size=10.0, color=INK, spacing=1.1)
    line(sl, M, y + Inches(0.72), W - M, y + Inches(0.72), color=LIME_LT, lw=0.75)
    y += Inches(0.84)
note(sl, M, Inches(6.3), CW, 'Cost per organiser replaces cost per user: one organiser brings ten to fifteen members who '
     'already trust one another.')

# ---- open questions
sl = slide('07 · Open', 'What is unresolved', 'Each item has an owner and a route to an answer.')
table(sl, M, Inches(1.72), CW,
      [['#', 'Question', 'Route to an answer'],
       ['1', 'Whether compulsory cover on Hyper sits within regulation 10(c) of the Corporate Insurance Agents Regulations 2020',
        'Counsel’s written opinion before Hyper opens'],
       ['2', 'Whether the intermediary limb of the Anti-Money Laundering Act definition reaches Halqa', 'Counsel, in writing'],
       ['3', 'Whether the partner can debit one member and credit another directly, split one debit three ways, and at what price',
        'The partner enquiry'],
       ['4', 'Whether any category of furnisher that is not a credit institution has been notified under section 11(1) of the Credit Bureaus Act',
        'The bureau and the State Bank'],
       ['5', 'Whether to reproduce the offline organiser’s habit of covering a defaulter, or rely on seat rules, the guarantee and cover',
        'A ruling by the chairman'],
       ['6', 'The regulatory route. Halqa’s reading is that no approval is needed; an informal view on 22 September pointed to the State Bank’s sandbox',
        'The reading is put back for comment before any filing']],
      [0.05, 0.63, 0.32], fs=9.2, rh=Inches(0.58))

# ---- closing
sl = prs.slides.add_slide(BLANK)
_page['n'] += 1
rect(sl, 0, 0, W, H, fill=DEEP)
rect(sl, 0, 0, Inches(0.14), H, fill=LIME)
sl.shapes.add_picture(LOGO_LIGHT, int(Inches(1.4)), int(Inches(1.3)), height=int(Inches(0.6)))
tb(sl, Inches(1.4), Inches(2.5), Inches(10.4), Inches(2.6),
   'Every serious competitor in this market earns by holding money.\n'
   'Halqa earns a stated fee for a service, and holds none.\n'
   'That is a different business, with a different regulator, a different cost structure and a different '
   'failure mode.', size=21, color=IVORY, font=DISPLAY, gap=14, spacing=1.15)
tb(sl, Inches(1.4), H - Inches(0.8), Inches(10), Inches(0.3), 'Halqa   ·   ' + DATE, size=10, color=GREY_LT)

prs.save(OUT)
print('saved', OUT, len(prs.slides), 'slides')
