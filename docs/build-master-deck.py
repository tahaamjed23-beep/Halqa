# -*- coding: utf-8 -*-
"""
Builds HALQA-MASTER-DECK-2026-09-23.pptx  --  the complete position deck.

Google Slides import: drive.google.com > New > File upload > right-click the file
> Open with > Google Slides. Everything below is native shapes, tables and text,
so it lands editable.

House rules enforced here (HANDOVER/09):
  no rounded shapes anywhere      no accent rules under headings
  no italic kicker lines          italics only for Exhibit captions and sources
  every slide carries a visual    figures labelled EXHIBIT n
  all money in PKR                claims tagged FUNCTIONAL / BUILD / GATE-2 / STAGE-2
  provenance marked               verified / modelled / reported
"""

import math
from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE, MSO_CONNECTOR
from pptx.oxml.ns import qn, nsdecls
from pptx.oxml import parse_xml

# ----------------------------------------------------------------- palette ---
PINE_DEEP = RGBColor(0x11, 0x24, 0x06)
PINE      = RGBColor(0x22, 0x45, 0x0C)
PINE_MID  = RGBColor(0x35, 0x69, 0x14)
GOLD      = RGBColor(0x6D, 0xC7, 0x2A)
GOLD_BR   = RGBColor(0x8A, 0xDC, 0x42)
IVORY     = RGBColor(0xF3, 0xFC, 0xE7)
INK       = RGBColor(0x0C, 0x14, 0x08)
GREY      = RGBColor(0x6F, 0x7B, 0x68)
GREY_LT   = RGBColor(0x9A, 0xA6, 0x94)
WHITE     = RGBColor(0xFF, 0xFF, 0xFF)
TINT      = RGBColor(0xF5, 0xF7, 0xF2)
RED       = RGBColor(0xC0, 0x3A, 0x2E)

DISPLAY = 'Georgia'
BODY    = 'Arial'

W = Inches(13.333)
H = Inches(7.5)
M = Inches(0.62)
CW = W - 2 * M                      # content width

prs = Presentation()
prs.slide_width  = W
prs.slide_height = H
BLANK = prs.slide_layouts[6]

_page = {'n': 0}


# ------------------------------------------------------------- primitives ---
def rect(sl, x, y, w, h, fill=None, line=None, lw=0.75, dash=None):
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
        if dash:
            s.line.dash_style = dash
    else:
        s.line.fill.background()
    s.text_frame.word_wrap = True
    return s


def line(sl, x1, y1, x2, y2, color=PINE, lw=0.75):
    c = sl.shapes.add_connector(MSO_CONNECTOR.STRAIGHT, int(x1), int(y1), int(x2), int(y2))
    c.line.color.rgb = color
    c.line.width = Pt(lw)
    c.shadow.inherit = False
    return c


def tri(sl, x, y, w, h, fill=GOLD, rot=0):
    s = sl.shapes.add_shape(MSO_SHAPE.ISOSCELES_TRIANGLE, int(x), int(y), int(w), int(h))
    s.shadow.inherit = False
    s.fill.solid()
    s.fill.fore_color.rgb = fill
    s.line.fill.background()
    s.rotation = rot
    return s


def tb(sl, x, y, w, h, text, size=11, color=INK, bold=False, font=BODY,
       align=PP_ALIGN.LEFT, italic=False, gap=4, spacing=1.0,
       anchor=MSO_ANCHOR.TOP, caps=False, tracking=0):
    box = sl.shapes.add_textbox(int(x), int(y), int(w), int(h))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    tf.vertical_anchor = anchor
    lines = text.split('\n')
    for i, ln in enumerate(lines):
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


def bullets(sl, x, y, w, items, size=11.5, color=INK, gap=7, tick=GOLD, spacing=1.06):
    """Ledger bullets: a gold tally tick, then the line. No dots, no pills."""
    box = sl.shapes.add_textbox(int(x), int(y), int(w), Inches(0.4))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
    for i, it in enumerate(items):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.space_after = Pt(gap)
        p.line_spacing = spacing
        head, _, tail = it.partition('||')
        if tail:
            lead, body_txt = head, tail
        else:
            lead, body_txt = None, head
        r0 = p.add_run(); r0.text = '|  '
        r0.font.name = DISPLAY; r0.font.size = Pt(size); r0.font.bold = True
        r0.font.color.rgb = tick
        if lead:
            r1 = p.add_run(); r1.text = lead + '  '
            r1.font.name = BODY; r1.font.size = Pt(size); r1.font.bold = True
            r1.font.color.rgb = PINE
        r2 = p.add_run(); r2.text = body_txt
        r2.font.name = BODY; r2.font.size = Pt(size)
        r2.font.color.rgb = color
    return box


def tally_rule(sl, x, y, w, ticks=9, gold_at=None, color=PINE, h=Inches(0.09)):
    """The register device: a hairline with tally strokes. Replaces accent bars."""
    line(sl, x, y, x + w, y, color=color, lw=0.75)
    if ticks:
        step = w / float(ticks + 1)
        for i in range(1, ticks + 1):
            c = GOLD if (gold_at is not None and i == gold_at) else color
            lw = 1.6 if c is GOLD else 0.75
            line(sl, x + i * step, y - h, x + i * step, y, color=c, lw=lw)


def register_mark(sl, cx, cy, size, ring=IVORY, mark=GOLD, lw=None):
    """The Register: ten tally strokes bent into a ring, the tenth reaching inward."""
    R = size / 2.0
    lw = lw or max(1.0, size / Emu(1) * 0.0)  # placeholder, set below
    stroke = max(1.2, (size / 914400.0) * 7.0)      # 7/100 of the mark's width
    gstroke = max(1.6, (size / 914400.0) * 9.0)
    angles = [90, 60, 30, 0, -30, -60, -90, -120, -150]
    for a in angles:
        rad = math.radians(a)
        x1 = cx + 0.82 * R * math.cos(rad); y1 = cy - 0.82 * R * math.sin(rad)
        x2 = cx + 0.50 * R * math.cos(rad); y2 = cy - 0.50 * R * math.sin(rad)
        line(sl, x1, y1, x2, y2, color=ring, lw=stroke)
    rad = math.radians(180)
    line(sl, cx + 0.82 * R * math.cos(rad), cy, cx + 0.38 * R * math.cos(rad), cy,
         color=mark, lw=gstroke)


def exhibit(sl, x, y, w, n, caption):
    tb(sl, x, y, w, Inches(0.2), 'EXHIBIT %d   %s' % (n, caption),
       size=8.6, color=GREY, italic=True, font=BODY, tracking=0.4)


def flag(sl, x, y, w, text):
    tb(sl, x, y, w, Inches(0.3), text, size=8.8, color=GREY, italic=True)


def stage(sl, x, y, text, color=PINE):
    """Stage tag. A left gold rule and small caps. Never a pill."""
    line(sl, x, y, x, y + Inches(0.17), color=GOLD, lw=2.2)
    tb(sl, x + Inches(0.07), y - Inches(0.005), Inches(2.4), Inches(0.2), text,
       size=8.4, color=color, bold=True, caps=True, tracking=0.8)


# ------------------------------------------------------------ table maker ---
def _cell_border(cell, color='123D30', wpt=0.75):
    tcPr = cell._tc.get_or_add_tcPr()
    for tag in ('lnL', 'lnR', 'lnT', 'lnB'):
        for e in tcPr.findall(qn('a:' + tag)):
            tcPr.remove(e)
    for tag in ('lnL', 'lnR', 'lnT', 'lnB'):
        tcPr.append(parse_xml(
            '<a:%s %s w="%d" cap="flat" cmpd="sng" algn="ctr">'
            '<a:solidFill><a:srgbClr val="%s"/></a:solidFill>'
            '<a:prstDash val="solid"/></a:%s>' % (tag, nsdecls('a'), int(wpt * 12700), color, tag)))


def table(sl, x, y, w, data, widths, fs=10.0, hfs=9.6, rh=Inches(0.30),
          hfill=PINE, header=True, aligns=None, bolds=None):
    rows, cols = len(data), len(data[0])
    g = sl.shapes.add_table(rows, cols, int(x), int(y), int(w), int(rh * rows))
    t = g.table
    t.first_row = False
    t.horz_banding = False
    tot = float(sum(widths))
    for j, cw in enumerate(widths):
        t.columns[j].width = int(w * cw / tot)
    for i in range(rows):
        t.rows[i].height = int(rh if (i or not header) else rh * 1.02)
        for j in range(cols):
            c = t.cell(i, j)
            c.margin_left = Inches(0.07); c.margin_right = Inches(0.05)
            c.margin_top = Inches(0.03); c.margin_bottom = Inches(0.03)
            c.vertical_anchor = MSO_ANCHOR.MIDDLE
            head = header and i == 0
            c.fill.solid()
            c.fill.fore_color.rgb = hfill if head else WHITE
            _cell_border(c)
            tf = c.text_frame
            tf.word_wrap = True
            p = tf.paragraphs[0]
            p.alignment = (aligns[j] if aligns else PP_ALIGN.LEFT)
            r = p.add_run()
            r.text = str(data[i][j])
            r.font.name = BODY
            r.font.size = Pt(hfs if head else fs)
            r.font.bold = bool(head or (bolds and i in bolds))
            r.font.color.rgb = IVORY if head else INK
    return g


# ------------------------------------------------------------------ chart ---
def hbars(sl, x, y, w, h, items, maxv=None, fmt='%s', bar_h=None, gap=None,
          label_w=Inches(2.6), val_w=Inches(1.5)):
    """items: (label, value, display, colour)."""
    maxv = maxv or max(i[1] for i in items)
    n = len(items)
    bar_h = bar_h or (h / n) * 0.52
    gap = gap or (h / n)
    plot_x = x + label_w
    plot_w = w - label_w - val_w
    for i, (lab, val, disp, col) in enumerate(items):
        cy = y + i * gap
        tb(sl, x, cy + bar_h * 0.08, label_w - Inches(0.12), bar_h, lab,
           size=10.2, color=INK, align=PP_ALIGN.RIGHT)
        bw = max(Inches(0.02), plot_w * (float(val) / maxv))
        rect(sl, plot_x, cy, bw, bar_h, fill=col)
        tb(sl, plot_x + bw + Inches(0.09), cy + bar_h * 0.08, val_w, bar_h, disp,
           size=10.2, color=PINE, bold=True, font=DISPLAY)
    line(sl, plot_x, y - Inches(0.05), plot_x, y + gap * (n - 1) + bar_h + Inches(0.05),
         color=PINE, lw=0.75)


def statstrip(sl, x, y, w, stats, h=Inches(0.95), num_size=23, lab_size=8.6):
    """Big pine numbers over small grey labels, ruled top and bottom, gold dividers."""
    line(sl, x, y, x + w, y, color=PINE, lw=1.1)
    line(sl, x, y + h, x + w, y + h, color=PINE, lw=1.1)
    n = len(stats)
    cw = w / n
    for i, (num, lab) in enumerate(stats):
        cx = x + i * cw
        if i:
            line(sl, cx, y + h * 0.18, cx, y + h * 0.82, color=GOLD, lw=1.0)
        tb(sl, cx + Inches(0.12), y + h * 0.14, cw - Inches(0.24), h * 0.5, num,
           size=num_size, color=PINE, bold=False, font=DISPLAY)
        tb(sl, cx + Inches(0.12), y + h * 0.66, cw - Inches(0.24), h * 0.3, lab,
           size=lab_size, color=GREY, caps=True, tracking=0.6)


# ------------------------------------------------------------------ chrome ---
def slide(section=None, title=None, sub=None, dark=False, chrome=True):
    sl = prs.slides.add_slide(BLANK)
    rect(sl, 0, 0, W, H, fill=PINE_DEEP if dark else WHITE)
    _page['n'] += 1
    if section:
        tb(sl, M, Inches(0.40), CW, Inches(0.2), section,
           size=8.6, color=GOLD if dark else GREY, caps=True, tracking=1.4, bold=True)
    if title:
        tb(sl, M, Inches(0.66), CW, Inches(0.55), title,
           size=25, color=IVORY if dark else PINE, font=DISPLAY)
    if sub:
        tb(sl, M, Inches(1.20), CW - Inches(0.4), Inches(0.34), sub,
           size=11.6, color=GREY_LT if dark else GREY)
    if chrome:
        yb = H - Inches(0.34)
        line(sl, M, yb, W - M, yb, color=GOLD if dark else PINE, lw=0.75)
        for i in range(1, 10):
            xt = M + (CW / 10.0) * i
            c = GOLD if i == 10 else (GOLD if dark else PINE)
            line(sl, xt, yb - Inches(0.07), xt, yb, color=c, lw=0.75)
        tb(sl, M, yb + Inches(0.05), Inches(4), Inches(0.2),
           'HALQA   ·   COMPLETE POSITION   ·   23 SEPTEMBER 2026',
           size=7.6, color=GOLD if dark else GREY, tracking=0.8)
        tb(sl, W - M - Inches(1.0), yb + Inches(0.05), Inches(1.0), Inches(0.2),
           str(_page['n']), size=7.6, color=GOLD if dark else GREY, align=PP_ALIGN.RIGHT)
    return sl


def divider(number, title, lines):
    sl = prs.slides.add_slide(BLANK)
    _page['n'] += 1
    rect(sl, 0, 0, W, H, fill=PINE)
    rect(sl, 0, 0, Inches(0.14), H, fill=GOLD)
    tb(sl, Inches(1.5), Inches(2.45), Inches(2), Inches(0.9), number,
       size=64, color=GOLD, font=DISPLAY)
    tb(sl, Inches(2.9), Inches(2.62), Inches(8.6), Inches(0.8), title,
       size=32, color=IVORY, font=DISPLAY)
    tb(sl, Inches(2.95), Inches(3.62), Inches(8.2), Inches(1.2),
       '\n'.join(lines), size=12.4, color=RGBColor(0xC8, 0xD4, 0xCC), gap=6)
    tally_rule(sl, Inches(2.95), Inches(3.42), Inches(4.2), ticks=9, gold_at=9, color=GOLD_BR)
    register_mark(sl, W - Inches(2.0), H / 2, Inches(2.2), ring=PINE_MID, mark=GOLD)
    return sl


# =============================================================== 1 · COVER ===
sl = prs.slides.add_slide(BLANK)
_page['n'] += 1
rect(sl, 0, 0, W, H, fill=PINE_DEEP)
rect(sl, 0, 0, W, Inches(0.16), fill=GOLD)
register_mark(sl, Inches(2.35), Inches(3.4), Inches(2.5), ring=IVORY, mark=GOLD)
tb(sl, Inches(4.35), Inches(2.28), Inches(8), Inches(0.9), 'HALQA',
   size=54, color=IVORY, font=DISPLAY, tracking=8)
line(sl, Inches(4.4), Inches(3.22), Inches(6.4), Inches(3.22), color=GOLD, lw=2.4)
tb(sl, Inches(4.4), Inches(3.45), Inches(8.2), Inches(0.6),
   'The complete position', size=23, color=IVORY, font=DISPLAY)
tb(sl, Inches(4.4), Inches(4.05), Inches(8.0), Inches(1.4),
   'A rotating committee, run on a published record, over a licensed payment rail.',
   size=12.6, color=RGBColor(0xC8, 0xD4, 0xCC), gap=5, spacing=1.15)
line(sl, Inches(4.4), Inches(5.02), Inches(12.0), Inches(5.02), color=PINE_MID, lw=0.75)
tb(sl, Inches(4.4), Inches(5.18), Inches(8), Inches(0.6),
   '23 September 2026   ·   Prepared for the chairman   ·   Internal and counterparty use',
   size=10.4, color=GREY_LT)
tb(sl, M, H - Inches(0.62), Inches(9), Inches(0.3),
   'Every claim in this deck carries a provenance mark and a stage tag. The next page explains both.',
   size=9.6, color=GREY_LT)

# =========================================================== 2 · HOW TO READ ===
sl = slide('Reading this deck', 'Provenance and stage tags',
           'Nothing here is stated without saying how strongly it is known and what it depends on.')
exhibit(sl, M, Inches(1.72), CW, 1, 'The two marks used throughout')
table(sl, M, Inches(1.95), Inches(6.0),
      [['Provenance', 'Meaning'],
       ['verified', 'We ran it. A test, a query, a document read in full.'],
       ['modelled', 'Simulation or arithmetic. Not measured in the world.'],
       ['reported', 'A third party said it. Press, company claim, or paper.']],
      [0.26, 0.74], fs=10.2, rh=Inches(0.42))
table(sl, M + Inches(6.4), Inches(1.95), Inches(5.65),
      [['Stage tag', 'What it needs'],
       ['FUNCTIONAL', 'Works today. Record-only. No licence.'],
       ['BUILD', 'Specified. Buildable now with no external gate.'],
       ['GATE-2', 'Needs the payment merchant agreement.'],
       ['STAGE-2', 'Needs the CDC trustee and AMC structure.']],
      [0.30, 0.70], fs=10.2, rh=Inches(0.34))
tally_rule(sl, M, Inches(4.35), CW, ticks=11, gold_at=11)
tb(sl, M, Inches(4.60), Inches(11.6), Inches(1.2),
   'The single fact this deck is built on', size=15.5, color=PINE, font=DISPLAY)
rect(sl, M, Inches(5.02), Inches(0.05), Inches(1.30), fill=GOLD)
tb(sl, M + Inches(0.25), Inches(5.05), Inches(11.4), Inches(1.3),
   'Halqa never takes possession of member money. Contributions settle payer to recipient over '
   'Pakistan\u2019s own rails. Halqa observes the settlement and writes it to a double-entry ledger. '
   'That is the whole relationship between this company and the money \u2014 at every planned stage, '
   'including the second, where savings sit with a licensed trustee in the member\u2019s own name.',
   size=12.6, color=INK, spacing=1.25)

# ============================================================ 3 · CONTENTS ===
sl = slide('Contents', 'What is in this deck')
rows = [
    ('01', 'The instrument and the market', 'What a committee is, who runs one, and the arithmetic that governs the risk'),
    ('02', 'The architecture', 'No custody, and why that is a legal position rather than a slogan'),
    ('03', 'The economics', 'One payment split three ways, and where the revenue actually comes from'),
    ('04', 'The product as built', 'Everything shipped and running in production today'),
    ('05', 'What is specified next', 'The discipline layer, and the features awaiting a ruling'),
    ('06', 'The evidence', 'Twenty-five attempts in nine markets, reduced to six questions'),
    ('07', 'The regulatory position', 'Three red lines, two gates, and the first-clean-actor move'),
    ('08', 'State and plan', 'Where this honestly is, what happens next, in order'),
]
y = Inches(1.62)
for num, t, d in rows:
    line(sl, M, y, W - M, y, color=RGBColor(0xD8, 0xDF, 0xDA), lw=0.75)
    tb(sl, M, y + Inches(0.13), Inches(0.7), Inches(0.3), num, size=15, color=GOLD, font=DISPLAY)
    tb(sl, M + Inches(0.75), y + Inches(0.15), Inches(4.3), Inches(0.3), t,
       size=13, color=PINE, font=DISPLAY)
    tb(sl, M + Inches(5.2), y + Inches(0.19), Inches(6.9), Inches(0.3), d, size=10.6, color=GREY)
    y += Inches(0.64)
line(sl, M, y, W - M, y, color=PINE, lw=1.1)

# ============================================================== SECTION 01 ===
divider('01', 'The instrument and the market',
        ['A committee is a precise financial machine, not a folk custom.',
         'Its risk is not spread evenly \u2014 it is concentrated entirely in the early seats.',
         'Roughly Rs 4 trillion rotates through it every year in Pakistan.'])

# ------------------------------------------------- what a committee is -------
sl = slide('01 · The instrument', 'A committee is two financial products fused into one schedule',
           'n members \u00b7 each pays c every period \u00b7 each period one member collects the whole pot n \u00d7 c '
           '\u00b7 after n periods everyone has paid the same and collected exactly once.')
exhibit(sl, M, Inches(1.90), CW, 2, 'Three rounds of a 12-member circle. The gold cell collects.')
gx, gy, cell = M, Inches(2.14), Inches(0.86)
for r in range(3):
    tb(sl, gx - Inches(0.02), gy + r * Inches(0.52) + Inches(0.12), Inches(0.9), Inches(0.3),
       'Round %d' % (r + 1), size=9.4, color=GREY)
    for c in range(12):
        x = gx + Inches(0.95) + c * cell
        gold = (c == r)
        rect(sl, x, gy + r * Inches(0.52), cell - Inches(0.04), Inches(0.44),
             fill=GOLD if gold else WHITE, line=PINE, lw=0.75)
        tb(sl, x, gy + r * Inches(0.52) + Inches(0.11), cell - Inches(0.04), Inches(0.3),
           'collects' if gold else 'pays c', size=8.2,
           color=PINE_DEEP if gold else GREY, align=PP_ALIGN.CENTER,
           bold=gold)
for c in range(12):
    tb(sl, gx + Inches(0.95) + c * cell, gy + Inches(1.60), cell - Inches(0.04), Inches(0.24),
       'seat %d' % (c + 1), size=7.8, color=GREY, align=PP_ALIGN.CENTER)
tally_rule(sl, M, Inches(4.20), CW, ticks=11, gold_at=1)
tb(sl, M, Inches(4.45), Inches(5.9), Inches(0.4), 'The credit half and the savings half',
   size=14, color=PINE, font=DISPLAY)
bullets(sl, M, Inches(4.92), Inches(5.9), [
    'Collect early||you receive a lump sum before you have paid for it. That is an interest-free loan repaid in installments.',
    'Collect late||you pay installments before you receive. That is forced saving under a commitment device.',
    'Total in equals total out||the machine holds nothing at rest and earns nothing for itself.',
], size=11.4)
tb(sl, M + Inches(6.4), Inches(4.45), Inches(5.6), Inches(0.4), 'Worked in rupees',
   size=14, color=PINE, font=DISPLAY)
table(sl, M + Inches(6.4), Inches(4.90), Inches(5.65),
      [['12 members, Rs 10,000 each', 'Pot Rs 120,000'],
       ['Seat 1 collects', 'Rs 120,000 having paid Rs 10,000'],
       ['Seat 12 collects', 'Rs 120,000 having paid Rs 120,000'],
       ['Every member, end of cycle', 'paid Rs 120,000, received Rs 120,000']],
      [0.48, 0.52], fs=10.0, rh=Inches(0.33))

# ------------------------------------------------- forward liability ---------
sl = slide('01 · The instrument', 'Risk is concentrated entirely in the early seats',
           'At the moment member k collects, what they still owe the group is the forward liability. '
           'Every control Halqa has, and every failure in the competitor archive, is about who bears it.')
rect(sl, M, Inches(1.80), Inches(5.4), Inches(0.62), fill=TINT, line=PINE, lw=0.75)
tb(sl, M + Inches(0.2), Inches(1.94), Inches(5.0), Inches(0.4),
   'L(k)  =  c \u00d7 (n \u2212 k)', size=17, color=PINE, font='Consolas')
bullets(sl, M, Inches(2.62), Inches(5.5), [
    'Largest at seat 1||c \u00d7 (n\u22121). On the worked circle, Rs 110,000.',
    'Falls by exactly one contribution per seat||the decline is linear, which is why seat position can be priced.',
    'Zero at seat n||the last member owes nothing the moment they collect.',
], size=11.4)
tb(sl, M, Inches(4.42), Inches(5.5), Inches(1.6),
   'This is why the whole product reduces to one question: who is allowed to sit early, and what '
   'stands behind them when they do. Halqa answers it with position, price, property and paper \u2014 '
   'never with a pool of money.', size=11.6, color=INK, spacing=1.22)
exhibit(sl, M + Inches(6.1), Inches(1.80), Inches(6.0), 3,
        'Forward liability by seat \u2014 12 \u00d7 Rs 10,000 circle')
bars = []
for k in range(1, 13):
    v = 10000 * (12 - k)
    bars.append(('Seat %d' % k, max(v, 1), ('Rs %s' % format(v, ',')) if v else 'Rs 0',
                 GOLD if k <= 3 else PINE))
hbars(sl, M + Inches(6.1), Inches(2.10), Inches(6.0), Inches(4.05), bars, maxv=110000,
      label_w=Inches(0.95), val_w=Inches(1.25))
flag(sl, M + Inches(6.1), Inches(6.22), Inches(6.0),
     'Gold marks the seats a new or low-band member may not claim. verified against src/lib/score-bands.ts')

# ------------------------------------------------- four families ------------
sl = slide('01 · The instrument', 'Four structural families. Two supported, two refused.',
           'The refusals are structural, not squeamish \u2014 each one would break either the riba-free '
           'positioning or the definition of a committee.')
exhibit(sl, M, Inches(1.78), CW, 4, 'The four ways a committee sets its order')
table(sl, M, Inches(2.02), CW,
      [['Family', 'How the order is set', 'Halqa\u2019s position'],
       ['Ballot (random) \u2014 Pakistan\u2019s default', 'Names drawn by lot, the parchi',
        'Supported, plus a verifiable commit-reveal draw'],
       ['Fixed order (negotiated)', 'Seats agreed at formation by need or seniority',
        'Core. This is pick-your-seat with band gates.'],
       ['Auction \u2014 the Indian chit fund', 'Highest discount accepted takes the pot',
        'Refused. The discovered price is interest in substance.'],
       ['Prize or \u201clucky\u201d committee', 'The draw winner takes the pot and stops paying',
        'Refused. A lottery wearing a committee\u2019s clothes.']],
      [0.28, 0.36, 0.36], fs=10.2, rh=Inches(0.46))
rect(sl, M, Inches(4.42), Inches(0.05), Inches(1.55), fill=GOLD)
tb(sl, M + Inches(0.25), Inches(4.44), Inches(5.6), Inches(1.6),
   'Why the auction is fatal\n\n'
   'Working the discount through as an annualised rate gives roughly 45\u201355% implied APR. '
   'A member who takes an early pot at a 30% discount has borrowed at a price, and that price is '
   'interest however it is described. India regulates precisely this family under the Chit Funds '
   'Act 1982.', size=11.4, color=INK, spacing=1.22, gap=2)
rect(sl, M + Inches(6.4), Inches(4.42), Inches(0.05), Inches(1.55), fill=GOLD)
tb(sl, M + Inches(6.65), Inches(4.44), Inches(5.4), Inches(1.6),
   'Why the prize committee is fatal\n\n'
   'If the winner stops paying, the arithmetic stops closing. Most participants pay more than they '
   'can ever receive, which makes it a lottery funded by the losers. Reputationally it is the exact '
   'thing a trust product cannot be caught doing.', size=11.4, color=INK, spacing=1.22, gap=2)

# ------------------------------------------------- market scale -------------
sl = slide('01 · The market', 'The third-largest savings channel in the country',
           'These are the figures used in every Halqa document. Sources are named because a regulator can check them.')
statstrip(sl, M, Inches(1.78), CW,
          [('Rs 4 trillion', 'rotates annually'), ('\u224852 million', 'adults participating'),
           ('37%', 'of adults have used one'), ('12%', 'have lost money to fraud'),
           ('31%', 'can send or receive an SMS')])
exhibit(sl, M, Inches(3.10), Inches(6.0), 5, 'Where a Pakistani saver actually puts money')
hbars(sl, M, Inches(3.36), Inches(6.0), Inches(1.9), [
    ('Cash hidden at home', 63, '63%', PINE),
    ('A committee', 33, '33%', GOLD),
    ('Holds a bank account', 13, '13%', PINE_MID),
], maxv=70, label_w=Inches(2.25), val_w=Inches(0.9))
rect(sl, M, Inches(5.42), Inches(0.05), Inches(1.05), fill=GOLD)
tb(sl, M + Inches(0.25), Inches(5.44), Inches(5.7), Inches(1.1),
   'The committee is not competing with banks. It is competing with a cupboard.',
   size=14, color=PINE, font=DISPLAY, spacing=1.2)
tb(sl, M + Inches(6.4), Inches(3.10), Inches(5.6), Inches(0.3), 'The rest of the picture',
   size=13, color=PINE, font=DISPLAY)
table(sl, M + Inches(6.4), Inches(3.46), Inches(5.65),
      [['Figure', 'Source'],
       ['36% of Pakistanis save; 4% of savers use a formal institution', 'FII'],
       ['19% use the pot for a one-time durable purchase', 'FII'],
       ['Just over half own a phone', 'FII'],
       ['Women participate at twice the rate of men', 'FII'],
       ['~100 million lack formal financial services', 'World Bank'],
       ['~41% have participated; ~$5bn rotating', 'Oraan research']],
      [0.72, 0.28], fs=9.6, rh=Inches(0.31))
flag(sl, M + Inches(6.4), Inches(5.86), Inches(5.65),
     'reported. FII = Financial Inclusion Insights. Participation range across sources is 34\u201341%.')

# ------------------------------------------------- who we serve -------------
sl = slide('01 · The market', 'Who this actually serves, stated precisely',
           'The academic literature forces a narrowing that competitors do not make. Making it costs '
           'nothing and buys credibility with a regulator who can check.')
exhibit(sl, M, Inches(1.80), Inches(11.6), 6, 'The contradiction in the literature, and its resolution')
rect(sl, M, Inches(2.05), Inches(5.55), Inches(1.30), fill=WHITE, line=PINE, lw=0.75)
tb(sl, M + Inches(0.2), Inches(2.20), Inches(5.15), Inches(1.1),
   'Khan (2013), Dera Ghazi Khan fieldwork\n'
   'Regular income is a precondition. The genuinely poor are excluded by the groups themselves as '
   'bad risks. Committees cannot substitute for microfinance.', size=11.0, color=INK, gap=3, spacing=1.18)
rect(sl, M + Inches(6.05), Inches(2.05), Inches(5.55), Inches(1.30), fill=WHITE, line=PINE, lw=0.75)
tb(sl, M + Inches(6.25), Inches(2.20), Inches(5.15), Inches(1.1),
   'Kamran (2017), 30 unbanked informants\n'
   'Committees give real control over money, and not one of his thirty informants had ever '
   'experienced a member default.', size=11.0, color=INK, gap=3, spacing=1.18)
tri(sl, Inches(6.35), Inches(3.46), Inches(0.5), Inches(0.34), fill=GOLD, rot=180)
rect(sl, M, Inches(3.92), CW, Inches(0.62), fill=PINE)
tb(sl, M + Inches(0.25), Inches(4.06), CW - Inches(0.5), Inches(0.4),
   'The committee filters on income REGULARITY, not income LEVEL. Both papers are then true at once.',
   size=13.6, color=IVORY, font=DISPLAY)
table(sl, M, Inches(4.78), CW,
      [['Segment', 'Outcome', 'Consequence for Halqa'],
       ['The destitute \u2014 irregular or insufficient income', 'Excluded by the groups themselves',
        'Not our member. Do not claim otherwise.'],
       ['The regularly-earning unbanked \u2014 a tailor on Rs 17,000, a driver on Rs 22,000',
        'Served well, near-zero observed default', 'The whole market. Tens of millions of people.']],
      [0.38, 0.30, 0.32], fs=10.2, rh=Inches(0.48))
rect(sl, M, Inches(6.20), Inches(0.05), Inches(0.62), fill=RED)
tb(sl, M + Inches(0.25), Inches(6.22), Inches(11.4), Inches(0.7),
   'Two claims are formally retired and must not reappear: that Halqa serves \u201cthe poorest\u201d, and '
   'that committees substitute for formal finance. Both are disprovable in ten minutes. The defensible '
   'claim is that Halqa is the on-ramp to formal finance \u2014 which is exactly what the Sakh delivers.',
   size=11.0, color=INK, spacing=1.2)

# ============================================================== SECTION 02 ===
divider('02', 'The architecture',
        ['One decision defines the company: Halqa never holds member money.',
         'It is simultaneously the fraud control, the legal strategy and the moat.',
         'It was designed in from the first line of code, not bolted on.'])

# ------------------------------------------------- money flow ---------------
sl = slide('02 · The architecture', 'Where the money goes, and where Halqa is',
           'When a member pays, funds travel directly from their account to the recipient\u2019s over '
           'Pakistan\u2019s own rails. Halqa observes the settlement and writes it down.')
exhibit(sl, M, Inches(1.82), CW, 7, 'The settlement path. Halqa is not in it.')
by = Inches(2.30)
rect(sl, M + Inches(0.30), by, Inches(3.0), Inches(1.05), fill=WHITE, line=PINE, lw=1.1)
tb(sl, M + Inches(0.45), by + Inches(0.22), Inches(2.7), Inches(0.7),
   'The member paying\nthis round\u2019s contribution', size=11.6, color=INK, align=PP_ALIGN.CENTER, gap=2)
rect(sl, M + Inches(4.55), by + Inches(0.18), Inches(2.6), Inches(0.68), fill=TINT, line=PINE, lw=0.75)
tb(sl, M + Inches(4.65), by + Inches(0.30), Inches(2.4), Inches(0.5),
   'Raast  ·  JazzCash  ·  Easypaisa\nbank transfer  ·  cash record', size=9.8, color=PINE,
   align=PP_ALIGN.CENTER, gap=1)
rect(sl, M + Inches(8.35), by, Inches(3.0), Inches(1.05), fill=WHITE, line=PINE, lw=1.1)
tb(sl, M + Inches(8.5), by + Inches(0.22), Inches(2.7), Inches(0.7),
   'The member whose\nturn it is this round', size=11.6, color=INK, align=PP_ALIGN.CENTER, gap=2)
line(sl, M + Inches(3.30), by + Inches(0.52), M + Inches(4.55), by + Inches(0.52), color=GOLD, lw=3.0)
line(sl, M + Inches(7.15), by + Inches(0.52), M + Inches(8.35), by + Inches(0.52), color=GOLD, lw=3.0)
tri(sl, M + Inches(8.10), by + Inches(0.36), Inches(0.30), Inches(0.32), fill=GOLD, rot=90)
rect(sl, M + Inches(3.55), Inches(4.30), Inches(4.5), Inches(0.98), fill=PINE)
tb(sl, M + Inches(3.75), Inches(4.48), Inches(4.1), Inches(0.7),
   'HALQA\nthe double-entry ledger', size=12.6, color=IVORY, align=PP_ALIGN.CENTER, font=DISPLAY, gap=2)
line(sl, M + Inches(5.80), by + Inches(1.05), M + Inches(5.80), Inches(4.30), color=GREY, lw=1.0)
tb(sl, M + Inches(6.0), Inches(3.70), Inches(4.0), Inches(0.3),
   'observes the settlement and records it', size=10.2, color=GREY)
bullets(sl, M, Inches(5.62), Inches(5.7), [
    'No pooled account exists||there is no balance to misappropriate, delay, or lend out.',
    'This cannot weaken under commercial pressure||there is nothing to weaken.',
], size=11.4)
bullets(sl, M + Inches(6.3), Inches(5.62), Inches(5.7), [
    'Even at stage two||savings sit with a licensed trustee, in units registered in the member\u2019s own name.',
    'Receipts are admissible||under the Electronic Transactions Ordinance 2002.',
], size=11.4)

# ------------------------------------------------- licences ------------------
sl = slide('02 · The architecture', 'Why this is a legal position and not a slogan',
           'Pakistan\u2019s heavy financial licences each attach to a specific activity. The regulated '
           'activities do not occur anywhere in the architecture, so the licences governing them cannot apply.')
exhibit(sl, M, Inches(1.86), CW, 8, 'The three licences, and why each does not attach')
table(sl, M, Inches(2.10), CW,
      [['Licence', 'Regulator', 'Triggered by', 'Halqa'],
       ['EMI \u2014 Electronic Money Institution, Rs 200M capital', 'SBP',
        'Issuing or holding electronic money', 'Issues no balances, holds none'],
       ['NBFC \u2014 Investment Finance Services', 'SECP',
        'Lending, or pooling and deploying funds',
        'Members fund each other. Stage-2 funds are deployed only by a licensed AMC under its own licence.'],
       ['PSO / PSP \u2014 payment system operator', 'SBP',
        'Operating a payment system',
        'Operates none. Initiates over a licensed aggregator\u2019s.']],
      [0.26, 0.10, 0.28, 0.36], fs=10.0, rh=Inches(0.56))
rect(sl, M, Inches(4.42), Inches(0.05), Inches(0.86), fill=GOLD)
tb(sl, M + Inches(0.25), Inches(4.44), Inches(11.4), Inches(0.9),
   'This is not a workaround. It was designed in from the first line of code and survives scrutiny '
   'because it is architectural rather than contractual \u2014 there is no clause to be read against us, '
   'because there is no activity to construe.', size=12.2, color=INK, spacing=1.22)
tally_rule(sl, M, Inches(5.52), CW, ticks=11, gold_at=11)
tb(sl, M, Inches(5.76), Inches(11.6), Inches(0.3), 'Independent validation, eight years early',
   size=13.4, color=PINE, font=DISPLAY)
tb(sl, M + Inches(0.0), Inches(6.14), Inches(11.6), Inches(0.7),
   '\u201cHolding money deposits is not allowed without a license, and therefore the money flowing in and '
   'out of the ROSCA app could be directed to an individual\u2019s mobile wallet with the ROSCA app '
   'serving as a conduit.\u201d', size=11.6, color=INK, spacing=1.2)
flag(sl, M, Inches(6.92), Inches(11.6),
     'Mehmood, Razaq, Webster, Batool, Mustafa, Raza and Anderson (2018) \u2014 Information Technology '
     'University Lahore and University of Washington, funded by the Gates Foundation and Karandaaz Pakistan. reported')

# ------------------------------------------------- fraud control ------------
sl = slide('02 · The architecture', 'The same decision is the primary fraud control',
           'Every major committee fraud in Pakistan required one precondition: a central pool under '
           'one person\u2019s control.')
exhibit(sl, M, Inches(1.82), Inches(7.4), 9, 'What custody has cost Pakistani savers')
table(sl, M, Inches(2.06), Inches(7.4),
      [['Case', 'Scale', 'Precondition'],
       ['Sidra Humaid, Karachi, December 2022',
        '\u2248Rs 420 million across 117 committees, \u2248200 contributors',
        'Total concentrated custody, strangers from Facebook, no written records'],
       ['Punjab cooperative societies, 1991\u201392',
        'Rs 10\u201323 billion across as many as 2.6 million accounts',
        'Institutional custody of community savings'],
       ['TAG', 'SBP revoked approvals 2022, ordered to refund wallet balances',
        'Held customer balances under an EMI approval'],
       ['SadaPay', 'Sold 2024 at a reported sub-$50M, below its last valuation',
        'EMI economics never closed']],
      [0.30, 0.35, 0.35], fs=9.8, rh=Inches(0.52))
rect(sl, M + Inches(7.8), Inches(2.06), Inches(4.25), Inches(2.60), fill=PINE)
tb(sl, M + Inches(8.05), Inches(2.30), Inches(3.75), Inches(2.2),
   'The cooperatives were the last formal attempt to institutionalise community savings in Pakistan. '
   'Their collapse taught two generations that handing the pool to an institution is how you lose it.\n\n'
   '\u201cYour money never touches us\u201d is not a compliance line in this market. It is the most '
   'persuasive sentence a Pakistani savings product can say \u2014 and only a no-custody operator can '
   'say it truthfully.', size=11.2, color=IVORY, spacing=1.24, gap=4)
tally_rule(sl, M, Inches(5.05), CW, ticks=11, gold_at=4)
tb(sl, M, Inches(5.30), Inches(11.6), Inches(0.3), 'The three roles Halqa plays',
   size=13.4, color=PINE, font=DISPLAY)
roles = [('The Ledger', 'Records every settlement with receipts, timestamps and CNIC linkage. '
                        'Admissible under the Electronic Transactions Ordinance 2002.'),
         ('The Treasury', 'Schedules, prices, collects and settles \u2014 without ever holding.'),
         ('The Credit Bureau', 'Converts payment history into the Sakh, a portable proof of reliability, '
                               'and is built to furnish it to TASDEEQ.')]
for i, (t, d) in enumerate(roles):
    x = M + i * Inches(4.0)
    rect(sl, x, Inches(5.68), Inches(0.05), Inches(1.05), fill=GOLD)
    tb(sl, x + Inches(0.22), Inches(5.68), Inches(3.5), Inches(0.3), t, size=12.4, color=PINE, font=DISPLAY)
    tb(sl, x + Inches(0.22), Inches(6.00), Inches(3.5), Inches(0.8), d, size=10.4, color=INK, spacing=1.18)

# ============================================================== SECTION 03 ===
divider('03', 'The economics',
        ['Every payment splits three ways at the moment it is taken: contribution, cover and fee.',
         'The contribution reaches the pot whole, the cover sits in a licensed risk fund, and the fee is flat.',
         'Rail cost is the binding constraint: a percentage rail against a flat fee breaks as the instalment grows.'])

# ------------------------------------------------- revenue ------------------
sl = slide('03 \u00b7 The economics', 'One payment, three destinations, none of them a deposit',
           'Every rupee a member pays resolves into three amounts at the moment it is taken. '
           'They are separately ledgered, separately reconciled and never commingled.')
exhibit(sl, M, Inches(1.94), CW, 10, 'The split, on the daily product')
table(sl, M, Inches(2.18), CW,
      [['Part', 'Where it goes', 'Who owns it there', 'Option 1', 'Option 2'],
       ['Contribution', 'The collecting member, over the licensed rail',
        'The collecting member', 'Rs 300', 'Rs 333.33'],
       ['Takaful contribution', 'Participants risk fund at a licensed operator',
        'The participants, collectively', 'Rs 75', 'Rs 83.33'],
       ['Service fee', 'Halqa\u2019s own revenue account',
        'Halqa', 'Rs 75', 'Rs 83.33'],
       ['Daily total', 'One debit, resolved at source', '', 'Rs 450', 'Rs 500']],
      [0.18, 0.34, 0.24, 0.12, 0.12], fs=10.2, rh=Inches(0.38))
rect(sl, M, Inches(4.20), Inches(0.05), Inches(1.0), fill=GOLD)
tb(sl, M + Inches(0.25), Inches(4.22), Inches(5.6), Inches(1.2),
   'Why the fee is lawful\n\nThe Explanation to section 84 of the Companies Act excludes '
   '\u201can advance against sale of goods or provision of services in the ordinary course of '
   'business\u201d from the meaning of a deposit. A fee charged in advance for a service is revenue.',
   size=10.8, color=INK, spacing=1.2, gap=2)
tb(sl, M + Inches(6.4), Inches(4.20), Inches(5.6), Inches(0.3), 'Why the fee is flat',
   size=13, color=PINE, font=DISPLAY)
tb(sl, M + Inches(6.4), Inches(4.56), Inches(5.65), Inches(1.2),
   'A fee graded by collection day is priced on the advance and reads as interest. '
   'It is therefore identical for every seat on the roster. Members holding later seats are '
   'compensated by Halqa in points and fee waivers, never by another member.',
   size=10.8, color=INK, spacing=1.2)
statstrip(sl, M, Inches(5.72), CW, [
    ('Rs 1,500,000', 'fee revenue, one cycle'),
    ('Rs 225,000', 'agency commission'),
    ('Rs 135,000', 'rail at 1.5 per cent'),
    ('Rs 252,000', 'operating cost'),
    ('Rs 1,338,000', 'net per cycle'),
])
flag(sl, M, Inches(6.80), CW,
     'Option 1. No member is compensated by another member, so no lender and no borrower exists, '
     'and the peer to peer chapter has nothing to attach to.')

# ------------------------------------------------- takaful ------------------
sl = slide('03 \u00b7 The economics', 'Cover is written by a licensed operator, never by Halqa',
           'Section 5(1) of the Insurance Ordinance admits only a public company, so a private '
           'limited company cannot be registered as an insurer at all. The cover is therefore bought, '
           'not built.')
exhibit(sl, M, Inches(1.94), Inches(6.9), 11, 'How the risk fund behaves across one cycle')
table(sl, M, Inches(2.18), Inches(6.9),
      [['Scenario', 'Defaults after collecting', 'Claims paid', 'Back to each member'],
       ['Normal, 5 per cent', '20 of 400', 'Rs 150,000', 'Rs 2,437'],
       ['Severe, 30 per cent', '120 of 400', 'Rs 900,000', 'Rs 562'],
       ['Catastrophic, 50 per cent', '200 of 400', 'Rs 1,500,000', 'nil, operator covers the deficit']],
      [0.30, 0.24, 0.20, 0.26], fs=10.0, rh=Inches(0.38))
rect(sl, M, Inches(3.96), Inches(6.9), Inches(1.10), fill=TINT, line=PINE, lw=0.75)
tb(sl, M + Inches(0.18), Inches(4.12), Inches(6.55), Inches(0.9),
   'The fund built over one cycle is Rs 1,500,000, from Rs 75 a day across 400 members. '
   'A deficit is met by an interest free advance from the operator\u2019s own shareholder fund, '
   'recovered from later surpluses. Members are paid even in the catastrophic case, and not out of '
   'Halqa\u2019s pocket.', size=11.2, color=INK, spacing=1.2)
rect(sl, M + Inches(7.3), Inches(2.18), Inches(4.75), Inches(1.46), fill=PINE)
tb(sl, M + Inches(7.55), Inches(2.40), Inches(4.25), Inches(1.1),
   'Halqa\u2019s role\n\nRegistered corporate insurance agent. It distributes, it earns commission, '
   'and it never underwrites, never holds the fund and never decides a claim.',
   size=11.4, color=IVORY, spacing=1.22, gap=3)
tb(sl, M + Inches(7.3), Inches(3.88), Inches(4.75), Inches(0.3), 'What this requires',
   size=13, color=PINE, font=DISPLAY)
bullets(sl, M + Inches(7.3), Inches(4.24), Inches(4.75), [
    'Corporate insurance agent registration with the Commission',
    'A distribution agreement with the operator',
    'No capital requirement attaches to either',
    'Candidates: Pak-Qatar Family Takaful, Salaam Takaful',
], size=10.8)
flag(sl, M, Inches(5.24), CW,
     'cover is sized at a 50 per cent post collection default rate. Recorded committee fraud runs at '
     'about 12 per cent, so the fund is built for an event roughly four times worse than any on record.')

# ------------------------------------------------- hyper --------------------
sl = slide('03 \u00b7 The daily product', 'Hyper \u2014 two configurations, both balanced at source',
           'A daily cadence product for members with daily income. Every figure below is forced by two '
           'identities that are asserted in code and cannot be overridden at creation.')
rect(sl, M, Inches(1.94), CW, Inches(0.62), fill=TINT, line=PINE, lw=0.75)
tb(sl, M + Inches(0.20), Inches(2.06), CW - Inches(0.4), Inches(0.42),
   'pot = contribution \u00d7 days        roster = members collecting each day \u00d7 days',
   size=12.6, color=PINE, font='Consolas', spacing=1.1)
exhibit(sl, M, Inches(2.74), CW, 12, 'The two configurations')
table(sl, M, Inches(2.98), CW,
      [['', 'Roster', 'Cycle', 'Collecting daily', 'Paid daily', 'Pot', 'Paid in', 'Cycle value'],
       ['Option 1', '400', '50 days', '8', 'Rs 450', 'Rs 15,000', 'Rs 22,500', 'Rs 6,000,000'],
       ['Option 2', '390', '26 active days', '15', 'Rs 500', 'Rs 8,666.67', 'Rs 13,000', 'Rs 3,380,000']],
      [0.11, 0.10, 0.15, 0.14, 0.11, 0.13, 0.12, 0.14], fs=10.0, rh=Inches(0.36))
tb(sl, M, Inches(4.28), Inches(6.6), Inches(0.3), 'What a seat is worth on the day it collects',
   size=13, color=PINE, font=DISPLAY)
hbars(sl, M, Inches(4.62), Inches(6.6), Inches(1.60), [
    ('Day 1', 14700, 'Rs 14,700', PINE),
    ('Day 25', 7500, 'Rs 7,500', PINE_MID),
    ('Day 50', 0, 'nil', GOLD),
], maxv=16000, label_w=Inches(1.5), val_w=Inches(1.4))
tb(sl, M + Inches(7.1), Inches(4.28), Inches(4.95), Inches(0.3), 'Why this shape matters',
   size=13, color=PINE, font=DISPLAY)
bullets(sl, M + Inches(7.1), Inches(4.62), Inches(4.95), [
    'Forward liability falls in a straight line to nil',
    'It averages half a pot across a uniform spread of days',
    'Half a pot is the planning figure for every default after collection',
    'The seat fee does not follow this curve, because grading would read as interest',
], size=10.8)
flag(sl, M, Inches(6.40), CW,
     'Option 2 uses 390 rather than 400 because 400 does not divide into 26 days. At 390 the roster '
     'gives exactly 15 collecting each day and reproduces the pot to the paisa.')

# ------------------------------------------------- threshold ----------------
sl = slide('03 \u00b7 The daily product', 'The collapse threshold, and the bands before it',
           'The point at which a circle would pay out more than it takes in, derived rather than '
           'asserted, and instrumented so a host sees it coming.')
exhibit(sl, M, Inches(1.94), Inches(6.9), 13, 'Four results')
bullets(sl, M, Inches(2.22), Inches(6.9), [
    'Arrears before collection recover themselves. They net from the member\u2019s own pot on their day, so they are a timing gap and not a loss.',
    'The only true loss is default after collection. There is no pot left to net against.',
    'Expected loss on a cycle is the roster \u00d7 the default rate \u00d7 half a pot. As a share of cycle value that is half the default rate.',
    'The circle cannot complete once unrecovered exposure exceeds the cover limit.',
], size=11.2, gap=9)
tb(sl, M + Inches(7.3), Inches(1.94), Inches(4.75), Inches(0.3), 'The stress index',
   size=13, color=PINE, font=DISPLAY)
table(sl, M + Inches(7.3), Inches(2.28), Inches(4.75),
      [['Axis', 'Weight'],
       ['Exposure against cover plus one pot', '45%'],
       ['Defaults against cover, in pots', '20%'],
       ['Share of roster previously late', '15%'],
       ['Age of arrears, in grace periods', '10%'],
       ['Day reached out of the cycle', '10%']],
      [0.72, 0.28], fs=10.0, rh=Inches(0.31))
exhibit(sl, M, Inches(4.28), CW, 14, 'Worked path of a circle under stress, cover at 8 pots')
table(sl, M, Inches(4.52), CW,
      [['Day', 'Defaults after collecting', 'Unrecovered exposure', 'Index', 'Band', 'Action'],
       ['12', '1', 'Rs 14,100', '11.8', 'Green', 'Normal operation, case tracked'],
       ['20', '3', 'Rs 37,800', '28.6', 'Green', 'Host notified, operator put on notice'],
       ['30', '6', 'Rs 64,800', '49.5', 'Amber', 'New joins blocked, next pots pre netted'],
       ['38', '9', 'Rs 81,000', '64.0', 'Amber', 'Claim prepared, roster informed'],
       ['45', '13', 'Rs 93,600', '72.1', 'Red', 'Payouts held, restitution arithmetic published']],
      [0.07, 0.20, 0.20, 0.09, 0.10, 0.34], fs=9.8, rh=Inches(0.32))
flag(sl, M, Inches(6.62), CW,
     'the whole daily margin is exactly the cover required for a 100 per cent default rate. '
     'That is not a coincidence; it falls out of the structure, and it is the ceiling on the charge.')

# ------------------------------------------------- rails -------------------
sl = slide('03 \u00b7 The economics', 'The collection ladder, and why the rail decides the tier',
           'Three tiers, chosen by cost rather than preference. A percentage rail against a flat fee '
           'is the binding constraint on the whole model.')
exhibit(sl, M, Inches(1.90), Inches(6.9), 15, 'The ladder')
table(sl, M, Inches(2.16), Inches(6.9),
      [['Tier', 'Mechanism', 'Member action', 'Cost', 'Used on'],
       ['1', 'Raast Request to Pay', 'One tap to approve', '\u2248 nil', 'Every monthly circle'],
       ['2', 'Aggregator token mandate', 'None, silent debit', '1.5%', 'Hyper only'],
       ['3', 'Manual initiation', 'Member initiates', '\u2248 nil', 'Fallback']],
      [0.08, 0.30, 0.22, 0.12, 0.28], fs=10.0, rh=Inches(0.34))
rect(sl, M, Inches(3.72), Inches(6.9), Inches(1.06), fill=TINT, line=PINE, lw=0.75)
tb(sl, M + Inches(0.18), Inches(3.88), Inches(6.55), Inches(0.86),
   'Raast Request to Pay is not auto-pull. It sends a request the member approves in their own '
   'banking application. It removes the remembering problem without the cost, which is why it is the '
   'default rather than the exception.', size=11.2, color=INK, spacing=1.2)
tb(sl, M + Inches(7.3), Inches(1.90), Inches(4.75), Inches(0.3),
   'Rail at 1.5 per cent, against a flat fee', size=13, color=PINE, font=DISPLAY)
table(sl, M + Inches(7.3), Inches(2.24), Inches(4.75),
      [['Instalment', 'Rail', 'Fee', 'Share'],
       ['Rs 450, hyper', 'Rs 6.75', 'Rs 75', '9%'],
       ['Rs 2,500', 'Rs 37.50', 'Rs 100', '38%'],
       ['Rs 5,000', 'Rs 75', 'Rs 150', '50%'],
       ['Rs 20,000', 'Rs 300', 'Rs 500', '60%']],
      [0.34, 0.22, 0.20, 0.24], fs=10.0, rh=Inches(0.31))
tb(sl, M + Inches(7.3), Inches(4.06), Inches(4.75), Inches(0.72),
   'The ratio worsens as the instalment grows, because the fee is flat and the rail is a percentage. '
   'Card at 3.3 per cent plus Rs 33 would take 64 per cent of hyper fee revenue and is never offered.',
   size=10.8, color=INK, spacing=1.2)
tb(sl, M, Inches(5.00), CW, Inches(0.3), 'The mandate is lawful, and it carries duties',
   size=13, color=PINE, font=DISPLAY)
table(sl, M, Inches(5.34), CW,
      [['Clause', 'Requirement'],
       ['PS&EFT s.35(1)', 'A preauthorised transfer may be authorised \u201cin writing, or in any other accepted form\u201d, so an in-application mandate is valid'],
       ['PS&EFT s.35(2)', 'A working stop must exist. Cancelling the mandate returns the member to manual and does not end the commitment to the circle'],
       ['PS&EFT s.30, s.31(1)', 'Disclosures at contracting, and 21 days notice before any material change'],
       ['PS&EFT s.36(2), s.41', 'An alleged error investigated and reported in writing within 10 business days, with the burden of proving authorisation on us']],
      [0.20, 0.80], fs=9.8, rh=Inches(0.34))

# ============================================================== SECTION 04 ===
divider('04', 'The product as built',
        ['Live in production since 20 July 2026, deliberately not opened to the public.',
         'Both packages type-clean. 60 unit and 352 integration checks passing.',
         'No real money has ever moved. Every payment path is sandbox-settled.'])

# ------------------------------------------------- what is live -------------
sl = slide('04 · Shipped', 'What is running in production today',
           'Every item below is shipped, tested and deployed. The stage tag says what it can and cannot do without an external gate.')
cols = [
    ('Onboarding and identity', [
        'Seven-step signup wizard with phone OTP',
        'App PIN on every open, optional biometric unlock',
        'CNIC captured by device camera, uniqueness enforced',
        'One-time precise GPS home pin, reverse-geocoded',
        'Occupation, employer, locality and public job title',
    ]),
    ('Circle lifecycle', [
        'FORMING \u2192 ACTIVE \u2192 COMPLETED, cancel only from FORMING',
        'Start is one atomic transaction \u2014 order frozen, all rounds created',
        'Pick-your-seat at join, band-gated, permanent',
        'Daily circles, mega circles to 150 members, goal circles',
        'Per-circle group chat, waitlist, host visibility toggle',
    ]),
    ('Payments and collection', [
        'Gateway-style checkout with branded rail cards and a failure path',
        'Saved instruments, masked at rest, mandate OTP over WhatsApp',
        'Card linking stores brand, last four, expiry only \u2014 never PAN or CVC',
        'Auto-collection on by default at join, with recorded consent',
        'The daily delinquency cron is the real collector, 02:00 UTC',
    ]),
]
for i, (t, items) in enumerate(cols):
    x = M + i * Inches(4.0)
    tb(sl, x, Inches(1.80), Inches(3.7), Inches(0.3), t, size=12.6, color=PINE, font=DISPLAY)
    line(sl, x, Inches(2.12), x + Inches(3.7), Inches(2.12), color=GOLD, lw=1.2)
    bullets(sl, x, Inches(2.28), Inches(3.7), items, size=10.2, gap=6)
cols2 = [
    ('Legal rails', [
        'Weekly e-signed undertaking, 7-day expiry, 10 clauses',
        'Typed legal name must match the account, optional drawn signature',
        'Stored with SHA-256 hash, IP and timestamp',
        'Mutual member-to-member guarantee, auto-signed at join \u2014 never to Halqa',
    ]),
    ('Credit and marketplace', [
        'Sakh 300\u2013850, opening 700, four bands, cutoffs in one file',
        'Credit Passport, signed and verifiable without a Halqa account',
        'Turn marketplace: list, bid, accept, premium capped at 50% of payout',
        'Bureau-impact audit queue feeding a future TASDEEQ export',
    ]),
    ('Engineering invariants', [
        'All money is integer paisa in BigInt \u2014 no floating point anywhere',
        'Every movement is a double-entry pair, so the ledger self-checks',
        'Every write carries an idempotency key',
        'Production migrations are additive-only hand-written SQL',
    ]),
]
for i, (t, items) in enumerate(cols2):
    x = M + i * Inches(4.0)
    tb(sl, x, Inches(4.42), Inches(3.7), Inches(0.3), t, size=12.6, color=PINE, font=DISPLAY)
    line(sl, x, Inches(4.74), x + Inches(3.7), Inches(4.74), color=GOLD, lw=1.2)
    bullets(sl, x, Inches(4.90), Inches(3.7), items, size=10.2, gap=6)
flag(sl, M, Inches(6.62), Inches(11.6),
     'verified 31 July 2026: both packages type-clean, 60 of 60 unit tests and 352 of 352 integration '
     'checks passing, web dependencies reporting zero known vulnerabilities, security posture assessed B+.')

# ------------------------------------------------- payday --------------------
sl = slide('04 · The flagship', 'Payday collection \u2014 the most consequential decision in the product',
           'It came from a chacha saying \u201cI pay as soon as my pay arrives.\u201d The due date stops '
           'being the collection event. Payday becomes the collection event, and the due date becomes '
           'the deadline for failures.')
exhibit(sl, M, Inches(2.06), CW, 12, 'The collection sequence')
ty = Inches(2.60)
line(sl, M + Inches(0.4), ty + Inches(0.42), M + Inches(11.4), ty + Inches(0.42), color=PINE, lw=1.0)
steps = [
    ('Evening before', 'Balance-check notice goes out', PINE_MID),
    ('Payday morning', 'The mandate executes while the balance is at its monthly maximum, before the installment is even due', GOLD),
    ('If the charge fails', 'A retry ladder runs to the due date, alongside a Raast one-tap request and a WhatsApp nudge', PINE_MID),
    ('Only if all fail', 'The member meets the late-fee ladder \u2014 2%, 5%, 10% by tier', PINE),
]
sw = Inches(2.72)
for i, (t, d, col) in enumerate(steps):
    x = M + Inches(0.4) + i * sw
    rect(sl, x - Inches(0.045), ty + Inches(0.33), Inches(0.09), Inches(0.18), fill=col)
    tb(sl, x + Inches(0.10), ty + Inches(0.02), sw - Inches(0.25), Inches(0.28), t,
       size=11.0, color=PINE, bold=True)
    tb(sl, x + Inches(0.10), ty + Inches(0.60), sw - Inches(0.25), Inches(0.9), d,
       size=10.0, color=INK, spacing=1.16)
tally_rule(sl, M, Inches(4.42), CW, ticks=11, gold_at=2)
tb(sl, M, Inches(4.66), Inches(5.7), Inches(0.3),
   'The payday proves itself \u2014 four verification layers', size=13.2, color=PINE, font=DISPLAY)
table(sl, M, Inches(5.02), Inches(5.7),
      [['Signal', 'How it works'],
       ['Account title', 'The aggregator returns the registered holder name at linking; it must match the CNIC name.'],
       ['Our own collection pattern', 'The strongest signal, and it costs nothing. If a member declares the wrong day, the retry ladder finds the true one.'],
       ['Credit alerts', 'Opt-in, parsed on device. Only a day, a coarse amount band and a source class leave the phone.'],
       ['Payslip', 'One photo, downscaled on the device. Documentary verification on day one.']],
      [0.27, 0.73], fs=9.6, rh=Inches(0.44))
rect(sl, M + Inches(6.2), Inches(4.66), Inches(0.05), Inches(0.8), fill=GOLD)
tb(sl, M + Inches(6.45), Inches(4.68), Inches(5.6), Inches(0.9),
   'Honest limits\n\nThree escapes always survive: keep the account empty, reroute the salary, revoke '
   'the mandate at the bank.', size=11.2, color=INK, spacing=1.2, gap=2)
tb(sl, M + Inches(6.45), Inches(5.56), Inches(5.6), Inches(1.1),
   'Each is a deliberate act, timestamped against a signed consent, which converts \u201cI forgot\u201d into '
   'documented bad faith. Passive default \u2014 money arrived, then got spent before the due date \u2014 is '
   'deleted entirely. Active evasion becomes rare, visible and evidenced.',
   size=11.2, color=INK, spacing=1.2)
stage(sl, M + Inches(6.45), Inches(6.72), 'FUNCTIONAL as a pattern engine  \u00b7  GATE-2 to execute against a live instrument')

# ------------------------------------------------- sakh ---------------------
sl = slide('04 · The record', 'The Sakh \u2014 credibility, made portable',
           'Named for the Urdu word for economic credibility. It needs no tooltip for a Pakistani user '
           'and cannot be borrowed by a foreign competitor.')
exhibit(sl, M, Inches(1.86), Inches(11.6), 13, 'Bands, and what each one may claim')
bx, bw2 = M, Inches(11.6)
segs = [('Rebuilding', 'below 550', 0.28, PINE_DEEP), ('Fair', '550\u2013649', 0.20, PINE),
        ('Good', '650\u2013749', 0.22, PINE_MID), ('Excellent', '750+', 0.30, GOLD)]
xx = bx
for name, rng, frac, col in segs:
    w2 = bw2 * frac
    rect(sl, xx, Inches(2.12), w2, Inches(0.52), fill=col)
    tb(sl, xx + Inches(0.12), Inches(2.22), w2 - Inches(0.2), Inches(0.3), '%s   %s' % (name, rng),
       size=11.0, color=PINE_DEEP if col is GOLD else IVORY, bold=True)
    xx += w2
for lab, frac in [('300', 0.0), ('550', 0.28), ('650', 0.48), ('750', 0.70), ('850', 1.0)]:
    x = bx + bw2 * frac
    line(sl, x, Inches(2.64), x, Inches(2.78), color=PINE, lw=0.75)
    tb(sl, x - Inches(0.3), Inches(2.80), Inches(0.6), Inches(0.2), lab, size=9.0, color=GREY,
       align=PP_ALIGN.CENTER)
table(sl, M, Inches(3.16), Inches(7.4),
      [['Band', 'Seats claimable', 'Marketplace'],
       ['Rebuilding, below 550', 'Last three seats, never earlier than halfway', 'May not buy'],
       ['Fair, 550\u2013649', 'Second half of the order', 'May buy'],
       ['Good, 650\u2013749', 'Any free seat', 'May buy'],
       ['Excellent, 750+', 'Any free seat', 'May buy']],
      [0.32, 0.46, 0.22], fs=10.0, rh=Inches(0.34))
bullets(sl, M, Inches(4.98), Inches(7.4), [
    'Opening score is 700||hosting requires 700, marketplace requires any non-Rebuilding band.',
    'Tenure quarantine overrides the band||every new member, whatever their score, may take only one of the last three turns of any circle, of any size. It unlocks after two clean completed circles and manual verification.',
    'Worst-case exposure to an unproven member is two contributions||Rs 20,000 on a Rs 120,000 pot.',
    'Score never moves anyone||credit-weighted reordering was removed on 22 July. A claimed seat is permanent.',
], size=10.8, gap=6)
rect(sl, M + Inches(7.9), Inches(3.16), Inches(4.15), Inches(3.35), fill=PINE)
tb(sl, M + Inches(8.15), Inches(3.38), Inches(3.65), Inches(2.9),
   'Why this signal is unusually strong\n\n'
   '\u201cI know that I have to pay the Committee instalment; it is necessary. We can compromise on rent '
   'or [utility] bills, but Committee [instalments] should not be missed.\u201d\n\n'
   'Bano, 36, housemaid, Rs 15,000 a month \u2014 Kamran (2017)\n\n'
   'Committee obligation ranks above rent and utilities in the household payment hierarchy. The Credit '
   'Passport is not exporting a soft signal. It is exporting the hardest one the household has.',
   size=10.6, color=IVORY, spacing=1.22, gap=4)

# ------------------------------------------------- bureau -------------------
sl = slide('04 · The record', 'The bureau link \u2014 where the company actually is',
           'Informal committee repayment history exists in no written form anywhere on earth. At scale '
           'Halqa becomes the monopoly supplier of a data class the national credit system lacks.')
exhibit(sl, M, Inches(1.94), Inches(7.2), 14, 'Score mapping, Halqa to TASDEEQ')
sx, sw2 = M + Inches(0.3), Inches(6.5)
tb(sl, M, Inches(2.32), Inches(0.3), Inches(0.3), '', size=9)
rect(sl, sx, Inches(2.30), sw2, Inches(0.30), fill=PINE)
tb(sl, sx, Inches(2.62), Inches(1.6), Inches(0.2), 'Halqa  300\u2013850', size=9.2, color=GREY)
rect(sl, sx, Inches(3.32), sw2, Inches(0.30), fill=PINE_MID)
tb(sl, sx, Inches(3.64), Inches(1.6), Inches(0.2), 'TASDEEQ  200\u2013600', size=9.2, color=GREY)
for frac, a, b in [(0.4545, '550', '382'), (0.6363, '650', '455'), (0.8181, '750', '527')]:
    x = sx + sw2 * frac
    line(sl, x, Inches(2.30), x, Inches(3.62), color=GOLD, lw=1.4)
    tb(sl, x - Inches(0.35), Inches(2.02), Inches(0.7), Inches(0.2), a, size=9.6, color=PINE,
       align=PP_ALIGN.CENTER, bold=True)
    tb(sl, x - Inches(0.35), Inches(3.86), Inches(0.7), Inches(0.2), b, size=9.6, color=PINE,
       align=PP_ALIGN.CENTER, bold=True)
flag(sl, M, Inches(4.18), Inches(7.2),
     'A linear invertible mapping is implemented. TASDEEQ intermediate cutoffs are not public.')
bullets(sl, M, Inches(4.62), Inches(7.2), [
    'eCIB is closed||membership of SBP\u2019s own bureau is restricted to regulated financial institutions. Full stop, without becoming the NBFC we deliberately avoid.',
    'TASDEEQ is open||its own site states it ingests data from non-financial non-conventional sources: utilities, telecommunications, insurance. Halqa can join in that category.',
    'No FI licence and no bank partner is needed for the private bureau||and bureaus run on reciprocity, so furnishing typically earns read access back.',
    'Precedent exists||Karandaaz, a non-bank, signed a TASDEEQ data agreement.',
], size=10.8, gap=6)
rect(sl, M + Inches(7.6), Inches(1.94), Inches(4.45), Inches(2.55), fill=PINE)
tb(sl, M + Inches(7.85), Inches(2.16), Inches(3.95), Inches(2.1),
   'The measurement that already exists\n\n'
   'Mission Asset Fund, a San Francisco non-profit, runs lending circles on the Mexican tanda and '
   'reports every monthly payment to all three US bureaus.\n\n'
   'Reported average credit score increase for participants: +168 points.\n\n'
   'This is the entire Sakh thesis, already measured, by an organisation with no incentive to '
   'overstate it.', size=10.6, color=IVORY, spacing=1.22, gap=4)
tb(sl, M + Inches(7.6), Inches(4.68), Inches(4.45), Inches(0.3), 'To confirm with counsel',
   size=12.2, color=PINE, font=DISPLAY)
bullets(sl, M + Inches(7.6), Inches(5.02), Inches(4.45), [
    'Whether committee data qualifies under contributor terms',
    'The exact consent wording the Credit Bureaus Act 2015 mandates',
    'Whether furnishing default data changes the requirement',
], size=10.2, gap=5)

# ------------------------------------------------- seven layers -------------
sl = slide('04 · Anti-default', 'Seven layers stand between a member and a default',
           'Each is a mechanism with a number attached, not a policy. Together they take the modelled '
           'default rate from 2.48% to 0.99%.')
exhibit(sl, M, Inches(1.90), CW, 15, 'The seven layers, in the order they act')
layers = [
    ('1', 'Identity', 'CNIC photographed at signup, GPS home pinned, uniqueness enforced on CNIC, phone and email. Every obligation binds to a government identity.'),
    ('2', 'Position', 'Band and tenure define claimable seats. New members take only the last three seats. Worst-case exposure to an unproven member is two contributions.'),
    ('3', 'Schedule', 'Fixed dates, escalating reminders, day-before balance check, and an internal grace window never shown in the interface.'),
    ('4', 'Price', '2% / 5% / 10% by lateness tier, with matched score damage of \u221210, \u221220 and \u221240. Post-payout default reaches \u2212200.'),
    ('5', 'Payout controls', 'A round\u2019s payout cannot release while any contribution in it is unpaid, including the recipient\u2019s own; a linked-account default withholds it; a forward-liability shortfall is withheld from the pot, capped at 60%, released in steps as clean payments land.'),
    ('6', 'Consequence', 'Platform-wide feature lock, internal flag, recovery case for outstanding plus penalties plus a 10% rehabilitation fee. All CNIC-linked and timestamped.'),
    ('7', 'Contract', 'Weekly e-signed undertaking and an auto-executed mutual member-to-member guarantee \u2014 never to Halqa \u2014 required from every member before a circle can start.'),
]
y = Inches(2.16)
for num, t, d in layers:
    rect(sl, M, y, Inches(0.34), Inches(0.56), fill=GOLD if num in ('2', '5') else PINE)
    tb(sl, M, y + Inches(0.14), Inches(0.34), Inches(0.3), num, size=12,
       color=PINE_DEEP if num in ('2', '5') else IVORY, align=PP_ALIGN.CENTER, font=DISPLAY)
    tb(sl, M + Inches(0.48), y + Inches(0.03), Inches(1.7), Inches(0.3), t, size=11.4,
       color=PINE, bold=True)
    tb(sl, M + Inches(2.30), y + Inches(0.03), Inches(9.8), Inches(0.52), d, size=10.2,
       color=INK, spacing=1.14)
    line(sl, M, y + Inches(0.62), W - M, y + Inches(0.62), color=RGBColor(0xDD, 0xE3, 0xDF), lw=0.75)
    y += Inches(0.68)
rect(sl, M, Inches(6.92), Inches(0.05), Inches(0.36), fill=RED)
tb(sl, M + Inches(0.25), Inches(6.90), Inches(11.4), Inches(0.4),
   'Legal reality check, verified: signing a personal guarantee and then defaulting is civil, not '
   'criminal. There is no jail. Recovery is an Order XXXVII CPC summary suit and needs a court decree '
   'first. Never claim Halqa can jail defaulters.', size=10.4, color=INK, spacing=1.16)

# ------------------------------------------------- stage two ----------------
sl = slide('04 · Built, not switched on', 'The second stage, and why it is switched off',
           'These are complete and tested, hidden behind one flag. They are not unfinished \u2014 switched '
           'on today, several would constitute pooling or deploying member funds, the exact activity the '
           'NBFC regime regulates.')
exhibit(sl, M, Inches(2.06), Inches(7.3), 16, 'The stage-two money path. No bank is involved at any point.')
fy = Inches(2.34)
boxes = [('The member', ''), ('CDC collection account', 'the trustee holds the assets'),
         ('Fund units', 'registered in the member\u2019s own name')]
for i, (t, d) in enumerate(boxes):
    x = M + i * Inches(2.55)
    rect(sl, x, fy, Inches(2.25), Inches(0.86), fill=WHITE if i else TINT, line=PINE, lw=1.0)
    tb(sl, x + Inches(0.12), fy + Inches(0.16), Inches(2.0), Inches(0.3), t, size=11.0,
       color=PINE, bold=True, align=PP_ALIGN.CENTER)
    if d:
        tb(sl, x + Inches(0.12), fy + Inches(0.46), Inches(2.0), Inches(0.3), d, size=8.8,
           color=GREY, align=PP_ALIGN.CENTER)
    if i < 2:
        line(sl, x + Inches(2.25), fy + Inches(0.43), x + Inches(2.55), fy + Inches(0.43),
             color=GOLD, lw=2.4)
tb(sl, M, Inches(3.36), Inches(7.3), Inches(0.4),
   'Halqa never sits in that path. The licence required is an SECP mutual-fund distributor '
   'registration \u2014 not EMI, because it holds no balances; not NBFC, because it deploys no funds.',
   size=11.0, color=INK, spacing=1.2)
table(sl, M, Inches(4.02), Inches(7.3),
      [['Product', 'Mechanism'],
       ['Growth Vault', 'Idle savings \u2014 typically a late-seat member waiting their turn \u2014 routed into an Islamic money-market or income fund at roughly 10\u201311%, against inflation of 11\u201312%. Committee money today earns zero while it waits.'],
       ['Safety Vault', 'The same holding, pledged, with a lien in favour of the circle. A missed installment settles from the member\u2019s own units. A member with a pledged buffer cannot default up to the size of that buffer.'],
       ['The Float', 'Contributions buy units in the payer\u2019s own name on pay-in and redeem on payout day. One month of float is roughly Rs 1,000 on a Rs 120,000 pot, accruing to savers rather than to nobody.']],
      [0.18, 0.82], fs=9.6, rh=Inches(0.62))
tb(sl, M + Inches(7.75), Inches(2.06), Inches(4.3), Inches(0.3), 'Also built, also switched off',
   size=12.4, color=PINE, font=DISPLAY)
bullets(sl, M + Inches(7.75), Inches(2.42), Inches(4.3), [
    'Vault sleeves \u2014 Standard, Income, Gold, Crypto, with allocation sliders and auto-cover',
    'Earning engines \u2014 float sweep, deposit mudarabah, patience tilt, prize hiba',
    'Scheme terminal and the scheme catalogue',
    'Escrow treasury and guarantee pool \u2014 needs custody',
    'Security deposits and payout holdbacks',
    'Committee tiers, renamed at the display layer only: Basic, Earn, Earn & Share, Early Access, Maximum',
    'Host-configurable float window, deposit coverage 30\u201390%, group staking streak',
], size=10.0, gap=5)
rect(sl, M + Inches(7.75), Inches(5.62), Inches(0.05), Inches(1.05), fill=GOLD)
tb(sl, M + Inches(8.0), Inches(5.64), Inches(4.05), Inches(1.1),
   'Standing rule: never delete these for being non-Shariah or dormant. Halqa keeps every feature '
   'working and simply refrains from labelling it Shariah where that does not apply.',
   size=10.6, color=INK, spacing=1.2)
stage(sl, M, Inches(6.90), 'STAGE-2  \u00b7  requires the CDC trustee and AMC structure, and an SECP distributor registration')

# ============================================================== SECTION 05 ===
divider('05', 'What is specified next',
        ['The discipline layer: consent, exit, affordability, authenticity.',
         'The restitution arithmetic solves refunds without ever holding a pool.',
         'Four numbers and one design are still awaiting the chairman\u2019s ruling.'])

# ------------------------------------------------- discipline order ---------
sl = slide('05 · The discipline layer', 'Six builds, and the order cannot be changed',
           'Each was specified as product design but reads as a compliance posture \u2014 and that is the point.')
exhibit(sl, M, Inches(1.82), Inches(7.5), 17, 'Build order')
order = [
    ('1', 'CONFIRMING state and the 24-hour window', 'The smallest change and the largest legal return'),
    ('2', 'Affordability engine and headroom display', 'Stricter than the regulator\u2019s own ratio'),
    ('3', 'Exit ladder, restitution engine, group vote', 'The heaviest engineering in the set'),
    ('4', 'Hardship path and helpline', 'Turns a collections call into a recorded statement'),
    ('5', 'NADRA face match', 'Start the Nishan portal paperwork in parallel \u2014 it is the long pole'),
    ('6', 'Circle authenticity', 'Last, because it depends on everything above it'),
]
y = Inches(2.08)
for n, t, d in order:
    rect(sl, M, y, Inches(0.32), Inches(0.5), fill=PINE)
    tb(sl, M, y + Inches(0.11), Inches(0.32), Inches(0.3), n, size=11.6, color=IVORY,
       align=PP_ALIGN.CENTER, font=DISPLAY)
    tb(sl, M + Inches(0.46), y + Inches(0.02), Inches(4.1), Inches(0.3), t, size=11.2,
       color=PINE, bold=True)
    tb(sl, M + Inches(4.66), y + Inches(0.04), Inches(2.9), Inches(0.42), d, size=9.8, color=GREY,
       spacing=1.12)
    line(sl, M, y + Inches(0.56), M + Inches(7.5), y + Inches(0.56),
         color=RGBColor(0xDD, 0xE3, 0xDF), lw=0.75)
    y += Inches(0.62)
rect(sl, M + Inches(7.9), Inches(2.08), Inches(4.15), Inches(3.75), fill=PINE)
tb(sl, M + Inches(8.15), Inches(2.30), Inches(3.65), Inches(3.3),
   'What this buys with the regulator\n\n'
   'Set against SBP\u2019s Business Conduct and Fair Treatment of Consumers framework of October 2025, '
   'which governs disclosure, delivery, complaints and termination, Halqa can show:\n\n'
   'informed consent captured after a mandatory cooling window;\n\n'
   'a documented, member-initiated termination path with restitution arithmetic that is published '
   'rather than discretionary;\n\n'
   'an affordability gate stricter than the regulator\u2019s own debt-burden ratio, 33% against 40%;\n\n'
   'a hardship route ending in a waived fine rather than a collections call.',
   size=10.4, color=IVORY, spacing=1.2, gap=3)
tb(sl, M, Inches(6.10), Inches(7.5), Inches(0.8),
   'Read that list against the accusations that removed 400 lending apps \u2014 lending beyond capacity, '
   'collecting by pressure, hoarding personal data \u2014 and it inverts every one. That is the substance '
   'behind the first-clean-actor approach: not a claim of good intentions, but four mechanisms, each '
   'with a number attached.', size=11.4, color=INK, spacing=1.22)

# ------------------------------------------------- exit ladder --------------
sl = slide('05 · The discipline layer', 'There is no cancel button',
           'A committee where leaving is free has stopped being a commitment device. So exit is a '
           'ladder, and the platform pushes hard toward the rung that harms nobody.')
exhibit(sl, M, Inches(1.86), CW, 18, 'The five levels of exit')
table(sl, M, Inches(2.10), CW,
      [['#', 'Level', 'Mechanism', 'Fine', 'Destination'],
       ['1', 'Window withdrawal', 'During the 24-hour CONFIRMING window. Free, silent, unrecorded.', 'None', '\u2014'],
       ['2', 'Substitution', 'A replacement takes the seat and pays the leaver their contributions to date, member to member. Target: about 90% of exits.', 'None', '\u2014 group unharmed'],
       ['3', 'Group-approved exit', 'No replacement. The member states a reason; a majority must approve. Contributions restored at the end of the cycle.', 'One installment', '70% to remaining members, 30% platform'],
       ['4', 'Hardship exit', 'Recorded statement to the helpline, evidence reviewed. Annotated hardship, not default \u2014 and that distinction survives into the Passport.', 'Waived', '\u2014'],
       ['5', 'Abandonment', 'Not an exit. Full late-fee ladder, feature lock, recovery case. Restitution withheld and set off against what is owed.', 'Ladder + 10% rehabilitation', 'Platform, or circle pool on Shariah circles']],
      [0.04, 0.16, 0.46, 0.15, 0.19], fs=9.4, rh=Inches(0.62))
rect(sl, M, Inches(6.02), Inches(0.05), Inches(0.95), fill=GOLD)
tb(sl, M + Inches(0.25), Inches(6.04), Inches(5.6), Inches(1.0),
   'The 24-hour window\n\nA new state, CONFIRMING, between FORMING and ACTIVE. The roster locks, '
   'agreements are signed, and any member may withdraw with no fine, no score effect and no record. '
   'It runs from Start, not from each member\u2019s join, so everyone reconsiders together.',
   size=10.6, color=INK, spacing=1.2, gap=2)
rect(sl, M + Inches(6.3), Inches(6.02), Inches(0.05), Inches(0.95), fill=GOLD)
tb(sl, M + Inches(6.55), Inches(6.04), Inches(5.5), Inches(1.0),
   'The boundary\n\nAll of this governs members who have not yet collected. A member who takes the pot '
   'and stops paying is post-payout default \u2014 the \u2212200 event and a recovery case. Precedent for '
   'the window: SBP already mandates a two-hour cooling period on branchless-banking cash-outs.',
   size=10.6, color=INK, spacing=1.2, gap=2)

# ------------------------------------------------- restitution --------------
sl = slide('05 · The discipline layer', 'The restitution arithmetic \u2014 the key engineering result',
           'The chairman\u2019s rule is that a leaver\u2019s money returns at the end of the cycle. Halqa '
           'holds no pool, so there is nothing to refund from. The resolution is that the members who '
           'already collected are precisely who owes it.')
exhibit(sl, M, Inches(2.10), Inches(6.9), 19,
        'Twelve members, Rs 10,000 each. Seat 9 leaves after round 4 having paid Rs 40,000, collected nothing, no replacement found.')
rect(sl, M, Inches(2.48), Inches(6.9), Inches(2.20), fill=TINT, line=PINE, lw=0.75)
tb(sl, M + Inches(0.22), Inches(2.66), Inches(6.5), Inches(2.0),
   'Circle contracts to 11 payers  \u2192  remaining pots = 11 \u00d7 10,000 = Rs 110,000\n\n'
   'Seat 11, never collected:   pays 110,000, receives 110,000   \u2192  square\n'
   'Seat 3, collected 120,000:  pays 110,000                     \u2192  ahead by 10,000\n\n'
   'Seats 1, 2, 3, 4 each ahead by 10,000  =  Rs 40,000\n'
   '                                       =  exactly what the leaver is owed',
   size=10.4, color=INK, font='Consolas', spacing=1.24, gap=2)
rect(sl, M, Inches(4.90), Inches(6.9), Inches(0.72), fill=PINE)
tb(sl, M + Inches(0.22), Inches(5.02), Inches(6.5), Inches(0.5),
   'Where a member exits before collecting having paid p installments, each member who collected in '
   'rounds 1 to p owes the leaver exactly c, settled at completion.',
   size=11.2, color=IVORY, spacing=1.18)
bullets(sl, M, Inches(5.82), Inches(6.9), [
    'Total is p \u00d7 c, nominal, with no time value||and the absence of time value is the deterrent.',
    'Ledger invariant at close||every continuing member ends at received minus paid equal to zero, and every exited member is returned to zero. Recursive for multiple exits.',
], size=10.6, gap=5)
rect(sl, M + Inches(7.3), Inches(2.48), Inches(4.75), Inches(1.85), fill=WHITE, line=RED, lw=1.1)
tb(sl, M + Inches(7.52), Inches(2.66), Inches(4.3), Inches(1.6),
   'The harm that is real, and why the fine exists\n\n'
   'A mid-cycle exit shrinks every remaining pot by one contribution. A member expecting Rs 120,000 '
   'for a wedding now receives Rs 110,000. That is why exits need group consent and why level 3 '
   'carries a fine.', size=10.8, color=INK, spacing=1.2, gap=3)
tb(sl, M + Inches(7.3), Inches(4.55), Inches(4.75), Inches(0.3), 'The group vote', size=12.4,
   color=PINE, font=DISPLAY)
bullets(sl, M + Inches(7.3), Inches(4.90), Inches(4.75), [
    'Written reason plus an optional voice note \u2014 only 31% can send or receive a text message',
    '72-hour window, simple majority of votes cast, excluding the requester, 50% quorum',
    'If quorum fails it escalates to Halqa review rather than failing \u2014 a member must not be trapped because peers did not open the app',
    'The host votes as one member and breaks ties. No veto, no unilateral approval.',
], size=10.0, gap=5)

# ------------------------------------------------- affordability ------------
sl = slide('05 · The discipline layer', 'The affordability engine is stricter than the regulator',
           'SBP caps consumer-financing debt burden at 40% of disposable income. Halqa goes below that, '
           'for three reasons that are specific to this instrument.')
exhibit(sl, M, Inches(1.94), Inches(7.4), 20, 'The three caps')
table(sl, M, Inches(2.18), Inches(7.4),
      [['Cap', 'Rule'],
       ['Cash-flow', 'Sum of contributions \u2264 33% of net monthly income, and contributions plus known debt service \u2264 40%'],
       ['Forward exposure', 'Sum of L(k) \u2264 4 \u00d7 net monthly income \u2014 the worst case where every circle pays out early'],
       ['Concurrency', 'Members: 1 unverified, up to 4 verified. Hosts: 2 unproven, 5 with clean history, then manual review \u2014 which is also the anti-Ponzi control.']],
      [0.22, 0.78], fs=10.0, rh=Inches(0.56))
bullets(sl, M, Inches(4.14), Inches(7.4), [
    'Committee obligations outrank rent||so they crowd out everything else in the household.',
    'Members hold offline committees no bureau sees||the declared picture is always incomplete.',
    'The loss lands on eleven neighbours||not on a balance sheet that priced for it.',
], size=11.0, gap=6)
rect(sl, M + Inches(7.8), Inches(2.18), Inches(4.25), Inches(2.35), fill=PINE)
tb(sl, M + Inches(8.05), Inches(2.40), Inches(3.75), Inches(1.95),
   'The discipline taken from the progressive-lending literature\n\n'
   'Escalating limits cause liquidity defaults when the limit outruns real capacity, particularly once '
   'borrowers treat the limit itself as evidence of what they can afford.\n\n'
   'So good history unlocks seats, circles and lower friction. It never raises the money cap. Only new '
   'income evidence does.', size=10.4, color=IVORY, spacing=1.2, gap=3)
tb(sl, M + Inches(7.8), Inches(4.72), Inches(4.25), Inches(0.3), 'Verification tiers', size=12.2,
   color=PINE, font=DISPLAY)
bullets(sl, M + Inches(7.8), Inches(5.06), Inches(4.25), [
    'Declared only \u2192 one small circle',
    'Payslip, or the salary pattern proven from our own collection outcomes \u2014 free, no document \u2192 full caps',
    'Additional income \u2192 the member contacts Halqa with proof; an analyst uplift is filed against a named reviewer, with an expiry',
], size=10.0, gap=5)
rect(sl, M, Inches(5.62), Inches(0.05), Inches(0.62), fill=GOLD)
tb(sl, M + Inches(0.25), Inches(5.64), Inches(7.2), Inches(0.7),
   'Always show headroom in plain language \u2014 \u201cyou can take one more circle up to Rs 9,800 a '
   'month\u201d \u2014 never a bare rejection. Filtering over enforcement, which is the direction the SECP '
   'Chairman gave on 23 July.', size=10.8, color=INK, spacing=1.2)
stage(sl, M, Inches(6.52), 'BUILD  \u00b7  no external gate  \u00b7  the 33% cap and the exit fine are proposals awaiting sign-off')

# ------------------------------------------------- authenticity -------------
sl = slide('05 · Awaiting a ruling', 'Circle authenticity \u2014 the paired declaration',
           'Nothing is relaxed for anyone. Auto-debit, takaful, identity, affordability caps, the exit '
           'ladder and the 24-hour window apply to every circle. This mechanism only ever tightens.')
exhibit(sl, M, Inches(2.02), Inches(7.3), 21, 'The test, run from both ends')
rect(sl, M, Inches(2.26), Inches(3.5), Inches(1.30), fill=WHITE, line=PINE, lw=1.0)
tb(sl, M + Inches(0.18), Inches(2.42), Inches(3.15), Inches(1.1),
   'The host answers, per member\n\nHow do you know them?  relative / neighbour / colleague / customer '
   'or supplier / friend-of-a-friend\n\nHow long?  under a year / 1\u20133 / 3+',
   size=10.2, color=INK, spacing=1.16, gap=2)
rect(sl, M + Inches(3.80), Inches(2.26), Inches(3.5), Inches(1.30), fill=WHITE, line=PINE, lw=1.0)
tb(sl, M + Inches(3.98), Inches(2.42), Inches(3.15), Inches(1.1),
   'The member answers, about the host\n\nThe same two questions, separately, without seeing the '
   'host\u2019s answer.\n\nThe answers must agree.', size=10.2, color=INK, spacing=1.16, gap=2)
line(sl, M + Inches(3.50), Inches(2.91), M + Inches(3.80), Inches(2.91), color=GOLD, lw=2.4)
rect(sl, M, Inches(3.72), Inches(7.3), Inches(0.62), fill=PINE)
tb(sl, M + Inches(0.20), Inches(3.86), Inches(6.9), Inches(0.4),
   'A fraudster controls only one side of every answer. To pass eleven spokes he needs eleven real '
   'people to independently produce matching categories.', size=11.0, color=IVORY, spacing=1.16)
tb(sl, M, Inches(4.58), Inches(7.3), Inches(0.3), 'Three corroborations that cost nothing',
   size=12.4, color=PINE, font=DISPLAY)
bullets(sl, M, Inches(4.94), Inches(7.3), [
    'Consistency with what we already know||both home pins exist from signup. A relative in another city is normal; a neighbour in another city is a contradiction. We are testing whether the stated relationship survives contact with everything else we can see.',
    'Invitation trail||in a closed circle the host should have invited each member directly. A member arriving via a twice-forwarded link is not someone the host knows.',
    'Answer independence||eleven declarations completing within seconds of each other from one network means one person is filling in the forms.',
], size=10.4, gap=6)
rect(sl, M + Inches(7.6), Inches(2.26), Inches(4.45), Inches(2.05), fill=WHITE, line=RED, lw=1.1)
tb(sl, M + Inches(7.82), Inches(2.44), Inches(4.0), Inches(1.8),
   'This design was rewritten twice\n\n'
   'v1, a leniency tier for circles where everyone knows each other, was killed: there will still be '
   'auto-debit and insurance.\n\n'
   'v2, a mesh test with the host removed from the graph, was corrected: the host knows everyone, and '
   'this is only for closed circles.\n\n'
   'v3 is the design above. It awaits approval.', size=10.2, color=INK, spacing=1.18, gap=3)
tb(sl, M + Inches(7.6), Inches(4.50), Inches(4.45), Inches(0.9),
   'The literature agrees with the correction. Kamran\u2019s informant: \u201cIt is his job to decide '
   'whether to accept someone into the Committee.\u201d The organizer is the hub by design. The star '
   'topology is the real structure, not a fraud signal.', size=10.6, color=INK, spacing=1.2)
tb(sl, M + Inches(7.6), Inches(5.62), Inches(4.45), Inches(1.0),
   'The contact check fits here, sharpened. The host having members saved proves little. The half that '
   'matters is each member having the host saved \u2014 the direction a fraudster cannot manufacture. '
   'Done on device with hashed matching, so no address book ever reaches us.',
   size=10.6, color=INK, spacing=1.2)

# ------------------------------------------------- field mechanics ----------
sl = slide('05 · From the field', 'Mechanics the real committee already has, and we did not',
           'Catalogued from field research and the committee dossier. Each is a real convention that a '
           'digital product either reproduces or quietly breaks.')
exhibit(sl, M, Inches(1.90), CW, 22, 'The catalogue')
table(sl, M, Inches(2.14), CW,
      [['Mechanic', 'What it is', 'How Halqa implements it'],
       ['Net-off settlement, \u201chissa kat lo\u201d',
        'When a member\u2019s turn arrives, their own installment for that round is deducted from the pot instead of paid in cash.',
        'Host toggle at creation, default off, shown to every joiner. The ledger still writes both legs \u2014 only the cash nets, never the record. Counts as on-time at full weight.'],
       ['Declared organizer compensation',
        'The host may claim seat 1 as organizer\u2019s privilege, plus an optional recorded member-to-member tip at payout.',
        'Shown on the circle card before anyone joins. Seat 1 is also maximum liability, so the host takes the largest forward obligation \u2014 the skin in the game the literature asks for.'],
       ['Half-shares, \u201caadhi kameti\u201d',
        'Two people share one seat at half the contribution each, splitting the pot. Or one member holds two seats.',
        'First-class sub-membership, joint and several liability stated at join, payout splits by recorded ratio. The interface hides all of it behind one question: full seat or half seat?'],
       ['The verifiable parchi draw',
        'The ballot ceremony is the institution. A server-side random() replaces theatre with a black box, and black boxes get accused.',
        'Commit-reveal: the server commits to a hashed seed, each member\u2019s tap adds entropy, the seed is revealed after so anyone can recompute the result. No competitor in the archive has this.'],
       ['Death and incapacity',
        'A deceased member who had collected is not pursued if the family cannot pay; one who had not collected is paid out early.',
        'Recorded as the default convention in the mutual guarantee now; priced properly by circle-level takaful at stage two. Kerala\u2019s state chit operator waives up to \u20b910 lakh formally.']],
      [0.18, 0.38, 0.44], fs=9.2, rh=Inches(0.78))
flag(sl, M, Inches(6.58), Inches(11.6),
     'Also catalogued: daily and weekly circles for bazaar traders, Ramzan schedule exceptions, the '
     'replacement protocol where paid months transfer to the seat rather than the person, and '
     'progressive contribution caps for new members.')

# ------------------------------------------------- gold + growth ------------
sl = slide('05 · Directions', 'The X-factor, and the growth directions already approved',
           'The gold-goal committee is the single strongest near-term differentiator and is shippable now, cash-only.')
tb(sl, M, Inches(1.86), Inches(7.3), Inches(0.3), 'The gold-goal committee', size=13.4, color=PINE, font=DISPLAY)
line(sl, M, Inches(2.18), M + Inches(7.3), Inches(2.18), color=GOLD, lw=1.2)
bullets(sl, M, Inches(2.34), Inches(7.3), [
    'What it is||a normal PKR rotating committee where the host sets the goal in grams or tolas of gold, not rupees. The app shows the live rate, sizes contributions to the gram target, and on payout day gives cash plus a one-tap assisted purchase at that day\u2019s spot price.',
    'Why it beats Oraan on Shariah||Oraan Gold locks today\u2019s price for delivery six to ten months later. Deferred gold-for-currency is riba under the majority Bay\u2019 al-Sarf view, which requires spot settlement \u2014 yet it is marketed as Shariah-compliant. A spot-settled gold-goal committee is genuinely cleaner, and only that variant should carry the label.',
    'Hard dependency||physical allocated delivery needs a refiner or vault partner. Until then ship only the cash-payout plus assisted-purchase variant \u2014 no custody, no licence. Exact contract wording is mufti-to-confirm.',
], size=10.6, gap=7)
stage(sl, M, Inches(4.52), 'FUNCTIONAL now in the cash-only variant  \u00b7  never hold the metal')
tb(sl, M, Inches(4.92), Inches(7.3), Inches(0.3), 'Other verified differentiators, all functional today',
   size=12.4, color=PINE, font=DISPLAY)
bullets(sl, M, Inches(5.28), Inches(7.3), [
    'Make the turn-pricing fee curve the public headline \u2014 Oraan and Money Fellows both price slots this way, which validates it',
    'Market the mutual member-to-member guarantee as hard as Money Fellows markets its company guarantee',
    'Add earned early-slot progression, and show a gram-and-rupee side-by-side ledger',
], size=10.4, gap=5)
tb(sl, M + Inches(7.75), Inches(1.86), Inches(4.3), Inches(0.3), 'Approved growth directions',
   size=13.4, color=PINE, font=DISPLAY)
line(sl, M + Inches(7.75), Inches(2.18), W - M, Inches(2.18), color=GOLD, lw=1.2)
bullets(sl, M + Inches(7.75), Inches(2.34), Inches(4.3), [
    'TASDEEQ two-way membership, the flagship||join as an alternative-data contributor. The member builds formal credit; Halqa becomes the only source of informal-committee data.',
    'Organizer incentives on value, never depth||completion bounty, single-level revenue share, Verified Organizer status, free Halqa-fill, accelerated Sakh. Multi-level is an illegal pyramid.',
    'Formal-finance on-ramp||N clean circles unlock a pre-approved product by referral. The institution pays origination, never the member.',
    'Remittance committees||ride a licensed remittance rail. Halqa never holds or moves FX.',
    'Employer-endorsed committees||the employer endorses, does not run and does not see. Chairman: for later.',
], size=10.0, gap=6)
flag(sl, M + Inches(7.75), Inches(6.30), Inches(4.3),
     'Liked but not prioritised: gold committees, credit-builder circles, seasonal Islamic committees, '
     'merchant-sponsored circles, white-label to licensed FIs, aggregate insights, a BISP channel.')

# ============================================================== SECTION 06 ===
divider('06', 'The evidence',
        ['Twenty-five attempts across nine markets, reduced to the same six questions.',
         'Every failure held member money, guaranteed it, or removed the rotation.',
         'The differences between these companies are architectural, not executional.'])

# ------------------------------------------------- killers ------------------
sl = slide('06 · The archive', 'The finding, before the evidence')
rect(sl, M, Inches(1.50), CW, Inches(1.22), fill=PINE)
tb(sl, M + Inches(0.3), Inches(1.66), CW - Inches(0.6), Inches(1.0),
   'Of twenty-five attempts, every single failure held member money, guaranteed member money, or '
   'removed the rotation that makes a committee a committee. Every durable success either kept the '
   'money outside itself, or paid a full regulatory toll to hold it legitimately.\n'
   'There is no case of a well-executed no-custody committee product failing, and no case of an '
   'unlicensed custody product surviving.', size=13.0, color=IVORY, spacing=1.24, gap=4)
exhibit(sl, M, Inches(2.92), CW, 23, 'The eight killers')
table(sl, M, Inches(3.16), CW,
      [['#', 'Killer', 'Cases'],
       ['1', 'Custody \u2014 holding the pool', 'Punjab cooperatives, TAG, SadaPay, Oraan\u2019s ceiling, Braid by proxy, Sidra Humaid, Saradha'],
       ['2', 'Guarantee burden \u2014 the platform as payer of last resort', 'eMoneyPool'],
       ['3', 'Stranger pooling \u2014 trust without a graph', 'Yahoo Tanda, Puddle, Oraan v1'],
       ['4', 'Amputating the credit half \u2014 no early pot', 'UBL Kommittee'],
       ['5', 'Adding interest to a riba-defined culture', 'UBL Kommittee, every auction model in Pakistan'],
       ['6', 'Record without settlement', 'Udhaar Book, DigiKhata'],
       ['7', 'Monetising the member', 'Oraan v1, every subscription ROSCA app'],
       ['8', 'Regulatory ambush \u2014 rules written after a scandal, around someone else\u2019s model',
        'India after Saradha, Pakistan after nano-lending, the coming committee rules']],
      [0.04, 0.42, 0.54], fs=9.8, rh=Inches(0.38))
flag(sl, M, Inches(6.72), Inches(11.6),
     'Halqa has an architectural answer to each. reported, from company disclosures, regulator actions '
     'and press across nine markets.')

# ------------------------------------------------- the living ---------------
sl = slide('06 · The archive', 'The four models that work, and what each one proves',
           'None of them is a competitor for Halqa\u2019s position. Each validates one component of it.')
exhibit(sl, M, Inches(1.82), CW, 24, 'The living')
table(sl, M, Inches(2.06), CW,
      [['Case', 'Reported scale', 'The mechanism', 'What it proves for us'],
       ['Money Fellows, Egypt', '8M downloads, 1M+ served, ~350k monthly actives, $1.5bn processed across 2M+ circles, profitable 2025, ~$60M raised',
        'Custody done properly. Slot position is priced \u2014 the fee is the price of liquidity. The platform fills unsold slots and covers defaults from its own capital, on under 8% of active slots.',
        'Digitised committees scale to millions and to profit. Pricing the seat works. A sandbox is the door out of the grey market. What it carries \u2014 being the circle\u2019s counterparty \u2014 took years of licence and capital to make safe.'],
       ['Hakbah, Saudi Arabia', '1.3M+ registered users, ~70% young savers, ~$9M raised, SAMA sandbox permit',
        'Treated the jam\u2019iyya as a cultural institution to respect rather than a market to disrupt, and made the central bank its first partner.',
        'The closest existing analogue to the posture Halqa intends with SECP.'],
       ['Mapan, Indonesia', 'Acquired by GO-JEK 2017, later past a million users on a $15M round',
        'Village leader-agents, largely women, form and run circles. The pot is frequently delivered as goods. Revenue is margin on the goods, shared with agents.',
        'The unit of growth is the organizer, compensated for organising. And a goods pot suppresses default \u2014 a delivered good cannot be re-lent, re-hidden, or claimed by relatives.'],
       ['The Money Club, India', '200,000+ users, ~17,000 clubs, ~Rs 40 crore pooled, $1.7M pre-Series A',
        'Graduated exposure. Members start in tiny clubs with small amounts; only sustained clean behaviour unlocks larger clubs and larger sums.',
        'Underwriting by demonstrated history rather than documents \u2014 and their refinement, which we adopt: the permitted amounts, not only the seats, should scale with history.']],
      [0.13, 0.22, 0.31, 0.34], fs=8.8, rh=Inches(1.02))

# ------------------------------------------------- esusu --------------------
sl = slide('06 · The archive', 'The single most important case in the archive',
           'Esusu launched as a communal savings app named for the West African rotating savings '
           'practice, found the US market too thin, and pivoted.')
rect(sl, M, Inches(1.86), Inches(7.3), Inches(2.25), fill=PINE)
tb(sl, M + Inches(0.28), Inches(2.06), Inches(6.75), Inches(2.0),
   'Esusu abandoned moving the money and kept only the recording of it \u2014 and that is where all the '
   'value turned out to be. They did not build a savings product. They built a machine that converts '
   'an obligation people already honour into a formal credit record, and that machine was worth a '
   'billion dollars.\n\n'
   'In America the obligation people already honour is rent.\n'
   'In Pakistan it is the committee \u2014 which Kamran\u2019s informants rank above rent.',
   size=12.6, color=IVORY, spacing=1.26, gap=5)
flag(sl, M, Inches(4.20), Inches(7.3),
     'Esusu integrated with property-management software and reported on-time rent payments to Equifax, '
     'Experian and TransUnion. January 2022: $130M Series B led by SoftBank Vision Fund 2 at a $1 billion '
     'valuation. reported')
tb(sl, M, Inches(4.86), Inches(7.3), Inches(0.4),
   'Halqa is the Esusu thesis applied to the largest un-recorded obligation stream in Pakistan. '
   'The instruction that follows: the committee is the funnel; the credit record is the company.',
   size=13.0, color=PINE, font=DISPLAY, spacing=1.22)
tb(sl, M, Inches(5.72), Inches(7.3), Inches(0.3), 'Three cases that say the same thing',
   size=12.4, color=PINE, font=DISPLAY)
bullets(sl, M, Inches(6.06), Inches(7.3), [
    'eMoneyPool||nine years, reported members\u2019 payment histories to credit bureaus, and died carrying the guarantee on its own balance sheet. Right about the destination, wrong about the vehicle.',
    'Chamasoft, Kenya||where an excellent payment rail already exists, the platform layer that survives is the record. A preview of Pakistan after Raast matures.',
], size=10.2, gap=5)
rect(sl, M + Inches(7.75), Inches(1.86), Inches(4.3), Inches(4.65), fill=WHITE, line=PINE, lw=1.1)
tb(sl, M + Inches(7.98), Inches(2.06), Inches(3.85), Inches(4.3),
   'Mission Asset Fund, San Francisco\n\n'
   'A non-profit running lending circles based on the Mexican tanda. Groups of six to twelve. '
   'Contributions of $50 to $200 a month. Each month one member receives the pot as a zero-interest '
   'loan of $300 to $2,400. MAF formalises it as a loan, services it, and reports every monthly '
   'payment to all three major bureaus.\n\n'
   'Reported average credit score increase for participants:',
   size=10.8, color=INK, spacing=1.22, gap=4)
tb(sl, M + Inches(7.98), Inches(5.06), Inches(3.85), Inches(0.7), '+168 points',
   size=32, color=GOLD, font=DISPLAY)
tb(sl, M + Inches(7.98), Inches(5.72), Inches(3.85), Inches(0.7),
   'Its one limitation is the one Halqa is built to solve: MAF depends on philanthropy because it '
   'serves small numbers at high touch.', size=10.4, color=GREY, spacing=1.2)

# ------------------------------------------------- where halqa sits ---------
sl = slide('06 · The archive', 'Where Halqa sits, and who the real threat is')
exhibit(sl, M, Inches(1.50), Inches(6.4), 25, 'Six elements, each independently validated by a success in the archive')
table(sl, M, Inches(1.74), Inches(6.4),
      [['Element', 'Validated by'],
       ['An intact rotating instrument', 'Money Fellows'],
       ['Inherited social circles, never strangers', 'Mission Asset Fund'],
       ['Zero custody, settlement on an existing rail', 'Chamasoft'],
       ['Agent-led distribution', 'Mapan and Shriram'],
       ['The record as the product', 'Esusu'],
       ['The regulator engaged early', 'Hakbah']],
      [0.58, 0.42], fs=10.0, rh=Inches(0.33))
rect(sl, M, Inches(4.00), Inches(6.4), Inches(0.66), fill=PINE)
tb(sl, M + Inches(0.22), Inches(4.14), Inches(6.0), Inches(0.4),
   'No company in the archive holds all six at once.', size=13.2, color=IVORY, font=DISPLAY)
tb(sl, M, Inches(4.92), Inches(6.4), Inches(0.9),
   'Three conclusions carry across every market. Custody is the variable, and it is binary in effect. '
   'The trust graph is inherited, never manufactured. Distribution is agents, not advertising \u2014 not '
   'one case in twenty-five grew by acquiring individual users through marketing.',
   size=11.4, color=INK, spacing=1.22)
tb(sl, M, Inches(5.94), Inches(6.4), Inches(0.9),
   'Regulation arrives after the scandal and shapes itself around whoever is visible. India after '
   'Saradha. SECP after the nano-lending deaths. Pakistan will regulate digital committees after its '
   'first large platform fraud.', size=11.4, color=INK, spacing=1.22)
exhibit(sl, M + Inches(6.85), Inches(1.50), Inches(5.2), 26, 'The competitive map, corrected')
table(sl, M + Inches(6.85), Inches(1.74), Inches(5.2),
      [['Player', 'Threat', 'Why'],
       ['Oraan', 'Low', 'Custody, licence, member fees, stranger pooling \u2014 every structural choice is one we deliberately inverted. Proof of category, not a competitor for our position.'],
       ['Money Fellows', 'Low near-term', 'Would enter with a custody model needing a Pakistani licensing programme. Slow, capital-heavy, and stranger pooling does not fit a market organised around pre-existing circles.'],
       ['Notebook apps', 'Low on substance', 'Cannot produce a credit history. But free, already installed, and they shape what users expect a committee app to be.'],
       ['JazzCash / Easypaisa', 'HIGH', 'Tens of millions of users, the wallet the money already sits in, a payments licence, agent networks, brand trust. This is the real one.']],
      [0.20, 0.16, 0.64], fs=8.8, rh=Inches(0.76))
tb(sl, M + Inches(6.85), Inches(5.26), Inches(5.2), Inches(1.5),
   'Why the wallets probably will not, and the defence\n\n'
   'Their licence is the obstacle. As EMIs, holding balances is the business. A no-custody committee '
   'contradicts the model; a custody one imports the deposit-taking scrutiny that makes committee '
   'products legally fraught for a licensed institution. UBL is the live proof. Their users are '
   'individuals, not circles.\n\n'
   'The defensive move: become the layer they would rather integrate than rebuild. Ship the '
   'committee-as-a-service API earlier than instinct suggests.',
   size=10.0, color=INK, spacing=1.18, gap=3)

# ------------------------------------------------- UBL exhibit --------------
sl = slide('06 · The archive', 'The most useful exhibit we have',
           'UBL Kommittee Account \u2014 a deposit product from one of Pakistan\u2019s largest banks, '
           'marketed under the committee name.')
exhibit(sl, M, Inches(1.94), Inches(7.2), 27, 'Three amputations happened in translation')
table(sl, M, Inches(2.18), Inches(7.2),
      [['What was removed', 'Consequence'],
       ['The rotation', 'Nobody receives a pot early. This deletes the credit half and the reason the early half of every real committee joins.'],
       ['The peers', 'No group, no social spine \u2014 hence an \u201cinstallment holiday\u201d feature no genuine committee could offer and remain itself.'],
       ['Riba-free structure', 'A fixed return on deposits came in \u2014 interest, in exactly the form committee culture defines itself against.']],
      [0.26, 0.74], fs=10.0, rh=Inches(0.56))
rect(sl, M, Inches(4.14), Inches(7.2), Inches(1.10), fill=TINT, line=PINE, lw=0.75)
tb(sl, M + Inches(0.22), Inches(4.30), Inches(6.8), Inches(0.9),
   '24-month plan at Rs 100,000 a month  \u2192  pay in Rs 2,400,000, receive Rs 2,500,000\n'
   'Rs 100,000 bonus on an average balance of about Rs 1,250,000 over two years  \u2248  2% a year',
   size=10.6, color=INK, font='Consolas', spacing=1.3, gap=2)
flag(sl, M, Inches(5.34), Inches(7.2),
     'modelled from the published product terms. The saver surrenders everything a committee provides '
     'in exchange for materially less than an ordinary savings account was paying.')
rect(sl, M + Inches(7.7), Inches(2.18), Inches(4.35), Inches(2.55), fill=PINE)
tb(sl, M + Inches(7.95), Inches(2.40), Inches(3.85), Inches(2.2),
   'The lesson, and it is the strongest single argument in the pitch\n\n'
   'A balance-sheet institution cannot digitise the committee, because its value lives in exactly the '
   'things a balance sheet must remove \u2014 peer credit without interest, social enforcement without '
   'collateral, and money that never becomes the institution\u2019s liability.\n\n'
   'The same fact closes the category to JazzCash and Easypaisa.',
   size=10.6, color=IVORY, spacing=1.22, gap=4)
tb(sl, M + Inches(7.7), Inches(4.92), Inches(4.35), Inches(1.2),
   'Set FNB beside UBL and the pattern completes. FNB\u2019s stokvel accounts succeed because South '
   'African stokvels frequently accumulate \u2014 everyone saves, everyone is paid at year end \u2014 so a '
   'bank account genuinely serves the instrument.', size=10.6, color=INK, spacing=1.2)
rect(sl, M, Inches(5.86), Inches(7.2), Inches(0.80), fill=PINE)
tb(sl, M + Inches(0.22), Inches(6.02), Inches(6.8), Inches(0.6),
   'Banks can hold group savings. Banks cannot rotate group credit.\n'
   'Halqa\u2019s entire opportunity lives in that second sentence.',
   size=12.6, color=IVORY, font=DISPLAY, spacing=1.2, gap=2)

# ============================================================== SECTION 07 ===
divider('07', 'The regulatory position',
        ['Three red lines, each avoided by architecture rather than by contract.',
         'Two gates, neither of which is an engineering problem.',
         'One move: be the first clean actor, before the rules are written.'])

# ------------------------------------------------- gates --------------------
sl = slide('07 · The path', 'Two gates. Nothing on the critical path is engineering work.',
           'The binding sequence is incorporation, then the tax number, then the merchant agreement \u2014 '
           'because the aggregator contracts with a registered company holding an NTN.')
exhibit(sl, M, Inches(1.98), Inches(7.4), 28, 'Gate 1 \u2014 become a company. About Rs 20\u201330k, two weeks.')
table(sl, M, Inches(2.22), Inches(7.4),
      [['Step', 'Detail'],
       ['SECP private limited incorporation', 'Via eservices.secp.gov.pk. Name Rs 1,000, incorporation Rs 1,800\u20132,500. Two to five working days.'],
       ['FBR National Tax Number', 'Free, one to two days, auto-integrated via IRIS'],
       ['Provincial sales-tax registration', '\u2014'],
       ['Corporate operating account', 'Halqa\u2019s own account for its own revenue. Not a partnership, and not customer money.'],
       ['Trademark filing', 'IPO-Pakistan']],
      [0.34, 0.66], fs=9.8, rh=Inches(0.38))
exhibit(sl, M, Inches(4.44), Inches(7.4), 29, 'Gate 2 \u2014 turn on real money. Rs 80,000\u2013180,000, four to eight weeks.')
table(sl, M, Inches(4.68), Inches(7.4),
      [['Step', 'Detail'],
       ['Payment aggregation', 'A Merchant Services Agreement with PayFast or Safepay. A commercial contract, not a licence \u2014 which is why the hardest-sounding step is a negotiation of weeks rather than an approval of months.'],
       ['Second factor', 'WhatsApp Business Cloud API, free tier'],
       ['Legal', 'Counsel opinion on non-licensable activity, plus review of the undertaking and guarantee texts. Rs 50\u2013100k.'],
       ['Identity', 'NADRA Verisys corporate agreement. Deferrable past launch, since CNIC is already collected.']],
      [0.24, 0.76], fs=9.8, rh=Inches(0.50))
rect(sl, M + Inches(7.9), Inches(2.22), Inches(4.15), Inches(1.65), fill=PINE)
tb(sl, M + Inches(8.15), Inches(2.42), Inches(3.65), Inches(1.4),
   'Halqa currently has neither the company nor the tax number.\n\n'
   'This is the first blocking step for everything else in the business.',
   size=11.4, color=IVORY, spacing=1.24, gap=4)
tb(sl, M + Inches(7.9), Inches(4.10), Inches(4.15), Inches(0.3), 'Gate 3 \u2014 scale via partner',
   size=12.4, color=PINE, font=DISPLAY)
tb(sl, M + Inches(7.9), Inches(4.46), Inches(4.15), Inches(0.8),
   'Never buy an EMI or NBFC licence. Reach anything requiring one through a party who already holds '
   'it, and who carries the regulatory burden with it.', size=10.6, color=INK, spacing=1.2)
rect(sl, M + Inches(7.9), Inches(5.40), Inches(0.05), Inches(1.30), fill=GOLD)
tb(sl, M + Inches(8.15), Inches(5.42), Inches(3.9), Inches(1.35),
   'Gate 2 is the single most important milestone in the company. Until it lands, the ledger records '
   'assertions rather than settlements, and the entire credit-data thesis is unproven.',
   size=11.0, color=INK, spacing=1.22)

# ------------------------------------------------- nano-lending -------------
sl = slide('07 · The precedent', 'Any credit-adjacent product in Pakistan is now judged against this',
           'Four hundred predatory loan apps were blocked across 2023 and 2024. What they did is now a '
           'named criminal pattern, and every permission Halqa requests is read against it.')
exhibit(sl, M, Inches(2.02), Inches(6.7), 30, 'How the predatory apps worked, and what it cost')
bullets(sl, M, Inches(2.28), Inches(6.7), [
    'The product||loans of Rs 1,000\u201325,000 over 7 to 90 days at up to roughly 220% APR. The ticket was too small to underwrite, so the model was: do not screen, price for mass default, make recovery cheap through social coercion.',
    'The recovery ladder||harvest contacts, gallery and SMS at install \u2192 reminders \u2192 agent calls \u2192 call the borrower\u2019s contacts to shame them \u2192 morph gallery photos into obscene images sent to family \u2192 app-to-app rollover debt spiral.',
    'The case that ended it||Rawalpindi: Rs 13,000 borrowed, Rs 100,000 owed, a suicide, an FIA crackdown and more than twenty arrests.',
], size=10.6, gap=7)
tb(sl, M, Inches(4.40), Inches(6.7), Inches(0.3), 'What was banned \u2014 most of it even with consent',
   size=12.4, color=PINE, font=DISPLAY)
bullets(sl, M, Inches(4.76), Inches(6.7), [
    'SECP Circulars 3, 10, 14 and 15 of 2023 and 8 of 2024||no contact-list or gallery access even with consent; contact only a separately-consented guarantor; exposure cap Rs 25,000 per app; APR capped at ten times the policy rate; mandatory Key Fact Statement; borrower data must stay in Pakistan.',
    'Google Play, 31 May 2023||personal-loan apps and facilitators may not access contacts, photos, precise location, phone numbers or external storage. Pakistan was named.',
], size=10.4, gap=6)
rect(sl, M + Inches(7.15), Inches(2.28), Inches(4.9), Inches(2.15), fill=PINE)
tb(sl, M + Inches(7.4), Inches(2.48), Inches(4.4), Inches(1.85),
   'The best single line for any room\n\n'
   '\u201cThey had to manufacture leverage over people they knew nothing about. We don\u2019t \u2014 the '
   'committee brings its own.\u201d\n\n'
   'Those apps had to coerce because they lent to strangers with no collateral. The seat is collateral, '
   'exposure is capped at about two installments, the circle is pre-existing, and the record is '
   'admissible.', size=10.6, color=IVORY, spacing=1.22, gap=4)
tb(sl, M + Inches(7.15), Inches(4.62), Inches(4.9), Inches(0.3), 'What Halqa refuses, on the record',
   size=12.4, color=PINE, font=DISPLAY)
bullets(sl, M + Inches(7.15), Inches(4.98), Inches(4.9), [
    'Contact-list harvesting \u2014 only on-device hashed matching is acceptable',
    'Gallery and photo access, READ_SMS, call log, QUERY_ALL_PACKAGES',
    'Background or continuous location',
    'Android Accessibility Service to read bank-app balances \u2014 declined with reasons on record: it is the predatory-app signature, it reads the entire screen rather than one number, and a screenshot of that permission ends our whole sentence',
    'A public default flag or wall of shame \u2014 the flag stays internal',
], size=9.8, gap=5)

# ------------------------------------------------- first clean actor --------
sl = slide('07 · The move', 'Be the first clean actor, before the rules are written',
           'Money Fellows entered the Central Bank of Egypt sandbox before scale. Hakbah entered SAMA\u2019s. '
           'Both bought legitimacy cheaply by arriving early. That door is currently open in Pakistan '
           'and will not stay open.')
exhibit(sl, M, Inches(2.06), Inches(7.4), 31, 'The three red lines to put on the table')
table(sl, M, Inches(2.30), Inches(7.4),
      [['#', 'Red line', 'Licence it would trigger'],
       ['1', 'Holding the pot', 'SBP EMI \u2014 Rs 200M capital'],
       ['2', 'Lending or pooling at scale', 'SECP NBFC \u2014 Investment Finance Services'],
       ['3', 'Formal credit-bureau writing', 'Bureau membership rules']],
      [0.05, 0.50, 0.45], fs=10.0, rh=Inches(0.34))
tb(sl, M, Inches(3.90), Inches(7.4), Inches(0.3), 'And the model clause a future framework needs',
   size=12.6, color=PINE, font=DISPLAY)
rect(sl, M, Inches(4.26), Inches(7.4), Inches(1.05), fill=PINE)
tb(sl, M + Inches(0.25), Inches(4.42), Inches(6.9), Inches(0.85),
   'A facilitator that never holds, guarantees, or auctions member funds, and provides records '
   'admissible under the Electronic Transactions Ordinance 2002, is a registrar of private '
   'arrangements, not a deposit-taker.', size=11.8, color=IVORY, spacing=1.24)
tb(sl, M, Inches(5.50), Inches(7.4), Inches(0.85),
   'Whoever gets that sentence into the first consultation paper owns the category\u2019s legal ground. '
   'And note: it cannot be written about a custodian \u2014 every competitor who might lobby against it '
   'is one.', size=11.6, color=INK, spacing=1.22)
rect(sl, M + Inches(7.85), Inches(2.30), Inches(4.2), Inches(2.0), fill=WHITE, line=PINE, lw=1.1)
tb(sl, M + Inches(8.08), Inches(2.48), Inches(3.75), Inches(1.7),
   'The SECP Regulatory Sandbox\n\n'
   'Real, with cohorts running since 2020, and its rules allow unregistered startups intending to '
   'register to apply. It is the single best door available, and the mentor is currently the sitting '
   'Chairman of the Commission.', size=10.8, color=INK, spacing=1.22, gap=3)
tb(sl, M + Inches(7.85), Inches(4.50), Inches(4.2), Inches(0.3), 'What India\u2019s statute teaches about scope',
   size=12.0, color=PINE, font=DISPLAY)
tb(sl, M + Inches(7.85), Inches(4.86), Inches(4.2), Inches(1.5),
   'The Chit Funds Act 1982 regulates the foreman \u2014 the person conducting the chit. In a Pakistani '
   'analogue, Halqa\u2019s hosts would be the regulated persons, not the platform. And the auction family '
   'the Act really polices is one Halqa already refuses. A record-only facilitator of non-auction, '
   'member-settled committees sits outside every operative clause.', size=10.4, color=INK, spacing=1.2)

# ============================================================== SECTION 08 ===
divider('08', 'State and plan',
        ['The engineering is far ahead of the business.',
         'Nothing on the critical path to real money is a coding problem.',
         'This section states that plainly, including what is unresolved.'])

# ------------------------------------------------- state --------------------
sl = slide('08 · Where this honestly is', 'The state of the company, without dressing',
           'As of 23 September 2026.')
exhibit(sl, M, Inches(1.70), Inches(7.4), 32, 'Current state')
table(sl, M, Inches(1.94), Inches(7.4),
      [['Dimension', 'State'],
       ['Product', 'Live in production since 20 July 2026, deliberately not opened to the public. One real member.'],
       ['Code', 'Both packages type-clean. 60 of 60 unit tests and 352 of 352 integration checks passing, verified 31 July.'],
       ['Money', 'No real money has ever moved. Every payment path is sandbox-settled. Blocked on a merchant agreement.'],
       ['Company', 'Does not exist. No SECP registration, no FBR tax number. This blocks everything downstream.'],
       ['Brand', 'Pine and gold implemented in the app, uncommitted. Auth screen visually verified; the logged-in interior is not.'],
       ['Regulator', 'Mentored by the sitting SECP Chairman. No formal engagement yet.']],
      [0.16, 0.84], fs=9.8, rh=Inches(0.44))
rect(sl, M, Inches(4.72), Inches(7.4), Inches(0.62), fill=PINE)
tb(sl, M + Inches(0.22), Inches(4.86), Inches(7.0), Inches(0.4),
   'The engineering is far ahead of the business.', size=13.4, color=IVORY, font=DISPLAY)
tb(sl, M, Inches(5.58), Inches(7.4), Inches(0.3), 'Blocking, before any push or deploy',
   size=12.4, color=PINE, font=DISPLAY)
bullets(sl, M, Inches(5.94), Inches(7.4), [
    'Apply both pending production migrations||commit 13d5687 added two User columns with no migration. Production does not have them. On deploy, the host trust card, member profiles, the Credit Passport and signup all break. Production is safe only because the commit was never shipped.',
    'Then push the four unpushed commits||migrations first, then push, plus the uncommitted brand work and the August documents.',
], size=10.2, gap=5)
tb(sl, M + Inches(7.9), Inches(1.94), Inches(4.15), Inches(0.3), 'Open operational items',
   size=12.4, color=PINE, font=DISPLAY)
table(sl, M + Inches(7.9), Inches(2.30), Inches(4.15),
      [['Priority', 'Item'],
       ['HIGH', 'Wipe demo seed data from production before real users'],
       ['HIGH', 'Database password exposed in chat and not rotated \u2014 on record, flagged, not acted on'],
       ['HIGH', 'Abuse detection for credibility-by-proxy'],
       ['MEDIUM', 'Move the application off the master database role'],
       ['MEDIUM', 'Add a second factor for admin access'],
       ['MEDIUM', 'Alerting on error rates and failed-login bursts'],
       ['MEDIUM', 'Retain counsel \u2014 the undertaking and guarantee are unreviewed drafts'],
       ['LOW', 'External penetration test when a counterparty requires one']],
      [0.22, 0.78], fs=9.0, rh=Inches(0.35))
flag(sl, M + Inches(7.9), Inches(5.50), Inches(4.15),
     'Security posture assessed B+. No critical or high-severity code vulnerability found; the open '
     'items are operational.')

# ------------------------------------------------- ladder -------------------
sl = slide('08 · The plan', 'The ladder \u2014 why the order cannot be changed',
           'Each rung is only reachable because the one below it exists. Attempting them out of order '
           'is the most common way companies in this category waste a year.')
rungs = [
    ('5', 'The savings layer', 'Vault and Float via CDC trusteeship \u2014 yield, plus a pledged buffer that self-cures default.', 'SECP distributor registration'),
    ('4', 'Commerce and the on-ramp', 'Merchants and institutions pay for access to outcomes. This is where the revenue actually is.', 'Referral and merchant partnerships'),
    ('3', 'The bureau link', 'The record becomes a formal credit signal. The member gains real benefit; we gain monopoly-supplier status.', 'TASDEEQ contributor agreement'),
    ('2', 'The record', 'Verified repayment at volume \u2014 the raw material for everything above it.', 'Circles completed, not signups'),
    ('1', 'Collection', 'Settlement, not assertion. Without it there is no credible record, therefore no data asset, no bureau link, and no business.', 'Gate-2 merchant agreement'),
]
y = Inches(1.86)
for i, (n, t, d, gate) in enumerate(rungs):
    indent = Inches(0.42) * (4 - i)
    x = M + indent
    w2 = CW - indent
    rect(sl, x, y, w2, Inches(0.86), fill=PINE if n == '1' else WHITE,
         line=PINE, lw=1.0 if n != '1' else 0.0)
    rect(sl, x, y, Inches(0.42), Inches(0.86), fill=GOLD if n == '1' else PINE)
    tb(sl, x, y + Inches(0.26), Inches(0.42), Inches(0.35), n, size=15,
       color=PINE_DEEP if n == '1' else IVORY, align=PP_ALIGN.CENTER, font=DISPLAY)
    tb(sl, x + Inches(0.60), y + Inches(0.12), Inches(2.6), Inches(0.3), t, size=12.0,
       color=IVORY if n == '1' else PINE, bold=True)
    tb(sl, x + Inches(0.60), y + Inches(0.44), w2 - Inches(3.6), Inches(0.36), d, size=10.0,
       color=IVORY if n == '1' else INK, spacing=1.14)
    tb(sl, x + w2 - Inches(2.85), y + Inches(0.12), Inches(2.7), Inches(0.6),
       'GATE\n' + gate, size=9.2, color=GOLD if n == '1' else GREY, align=PP_ALIGN.RIGHT, gap=1)
    y += Inches(0.94)
rect(sl, M, Inches(6.68), Inches(0.05), Inches(0.5), fill=GOLD)
tb(sl, M + Inches(0.25), Inches(6.66), Inches(11.4), Inches(0.5),
   'Rung one is the whole game. A ledger of assertions is worth nothing \u2014 which is why the merchant '
   'agreement, a commercial negotiation, is the most important thing in the company right now.',
   size=11.6, color=INK, spacing=1.2)

# ------------------------------------------------- pre-mortem ---------------
sl = slide('08 · The plan', 'The pre-mortem \u2014 it is 2029 and Halqa failed. What happened?',
           'Each row names the mechanism and the signal that would show it starting. This is the section '
           'that makes the rest of the deck credible.')
exhibit(sl, M, Inches(1.98), CW, 33, 'Six ways this ends badly, and what to watch')
table(sl, M, Inches(2.22), CW,
      [['Cause', 'Mechanism', 'The early-warning signal'],
       ['Collection never became real', 'Raast pull-payments slipped, card-on-file was too narrow for a cash-native base, wallet cost failed the Rs 300 ceiling. Members went back to cash and the ledger recorded assertions.', 'Share of installments settled digitally'],
       ['An organizer ran a Ponzi using our credibility', 'Built a clean record on Halqa, showed the app as proof, ran a large offline scheme. Currently unmanaged.', 'Organizers running many simultaneous circles, unusual member concentration, implausible growth'],
       ['The wallets shipped it', 'Distribution beat product.', 'Any committee feature in a JazzCash or Easypaisa release note'],
       ['Regulatory reclassification', 'A high-profile committee fraud, not ours, triggered rules written for custody operators with no carve-out for record-only facilitators.', 'Consultation papers'],
       ['We scaled before the loss model was real', 'The 0.3\u20131.4% band stayed modelled, never measured; real losses landed outside it.', 'Measured default in the first hundred completed circles'],
       ['The founder ran out of runway doing everything', 'The most common cause. Product, regulation, partnerships, research and brand all run through one person\u2019s attention.', 'Elapsed time between shipped milestones']],
      [0.24, 0.48, 0.28], fs=9.2, rh=Inches(0.62))
rect(sl, M, Inches(6.32), Inches(0.05), Inches(0.72), fill=RED)
tb(sl, M + Inches(0.25), Inches(6.32), Inches(11.4), Inches(0.75),
   'The second row is the one to act on now. Halqa\u2019s core product is manufactured, verifiable '
   'credibility \u2014 which is exactly what a fraudster needs most, and we hand it over free. Cap '
   'concurrent circles per organizer, flag implausible growth, watch member concentration, and scope '
   'the Credit Passport explicitly to on-platform history, endorsing no outside arrangement.',
   size=10.8, color=INK, spacing=1.2)

# ------------------------------------------------- five numbers -------------
sl = slide('08 · The plan', 'The five numbers that say whether this is working',
           'Most of the industry\u2019s conventional metrics are wrong for this business. A committee is a '
           'pre-formed atomic network \u2014 ten to fifteen people who already trust each other, already do '
           'this monthly, and already have a leader. We are not assembling a network; we are digitising '
           'one that arrived complete.')
nums = [
    ('1', 'Share of installments digitally settled',
     'The health of the collection rung, and the single most important number in the company. A ledger of assertions is worth nothing.'),
    ('2', 'Circles completed clean',
     'The atomic unit of value. Signups are vanity \u2014 a circle that never finishes proved nothing about anyone in it.'),
    ('3', 'Circles per organizer',
     'Whether the growth loop compounds or leaks. A host\u2019s second circle re-acquires the whole group for free.'),
    ('4', 'Measured post-payout default in the first 100 completed circles',
     'The moment 0.3\u20131.4% stops being a model and becomes a fact.'),
    ('5', 'Member-to-organizer conversion',
     'The only endogenous growth loop in the product.'),
]
y = Inches(2.40)
for n, t, d in nums:
    line(sl, M, y, W - M, y, color=RGBColor(0xDD, 0xE3, 0xDF), lw=0.75)
    tb(sl, M, y + Inches(0.16), Inches(0.6), Inches(0.4), n, size=22, color=GOLD, font=DISPLAY)
    tb(sl, M + Inches(0.75), y + Inches(0.20), Inches(4.6), Inches(0.4), t, size=12.6,
       color=PINE, font=DISPLAY)
    tb(sl, M + Inches(5.6), y + Inches(0.24), Inches(6.5), Inches(0.5), d, size=10.6,
       color=INK, spacing=1.16)
    y += Inches(0.80)
line(sl, M, y, W - M, y, color=PINE, lw=1.1)
flag(sl, M, y + Inches(0.14), Inches(11.6),
     'Cost per organizer replaces cost per user: one organizer delivers ten to fifteen pre-trusting '
     'members. Measure circles completed, not monthly actives.')

# ------------------------------------------------- next actions -------------
sl = slide('08 · The plan', 'What happens next, in order',
           'The first two are blocking. Nothing above them can be reached until they are done.')
acts = [
    ('Now', 'Apply the two migrations, then push', 'Everything is blocked behind a working production. The chairman applies these himself.', RED),
    ('Weeks 1\u20132', 'Gate 1 \u2014 make Halqa a company', 'SECP private limited, FBR tax number, provincial sales tax, corporate operating account, trademark filing. About Rs 20\u201330k.', PINE),
    ('Weeks 2\u20138', 'Gate 2 \u2014 turn on real money', 'Merchant Services Agreement with PayFast or Safepay, WhatsApp Business API, counsel opinion. Rs 80\u2013180k.', PINE),
    ('In parallel', 'Build the discipline layer, in the specified order', 'CONFIRMING window, affordability engine, exit ladder and restitution, hardship path, NADRA face, authenticity last.', PINE),
    ('Before public launch', 'Build the abuse-detection layer', 'Cap concurrent circles per organizer, flag implausible growth, watch member concentration, scope the Passport to on-platform history.', PINE),
    ('While the door is open', 'Approach SECP as the first clean actor', 'Seek the sandbox. Get the model clause into the first consultation paper.', PINE),
    ('Ongoing', 'Field sales to existing offline organizers', 'The highest-return growth motion available, and the one competitors will not run. Every case in the archive that scaled did it through agents.', PINE),
]
y = Inches(1.78)
for when, t, d, col in acts:
    rect(sl, M, y, Inches(0.05), Inches(0.62), fill=GOLD if col is PINE else RED)
    tb(sl, M + Inches(0.22), y + Inches(0.02), Inches(1.9), Inches(0.3), when, size=9.6,
       color=GREY, caps=True, tracking=0.7)
    tb(sl, M + Inches(2.20), y - Inches(0.01), Inches(4.0), Inches(0.3), t, size=12.0,
       color=PINE, bold=True)
    tb(sl, M + Inches(6.40), y + Inches(0.02), Inches(5.7), Inches(0.55), d, size=10.2,
       color=INK, spacing=1.14)
    y += Inches(0.72)
tally_rule(sl, M, Inches(6.90), CW, ticks=11, gold_at=11)

# ------------------------------------------------- open questions -----------
sl = slide('08 · Honest limits', 'What is unresolved, and needs a ruling',
           'These are genuine gaps. Silence on them is not a defensible position for any of them.')
exhibit(sl, M, Inches(1.86), CW, 34, 'Open questions')
table(sl, M, Inches(2.10), CW,
      [['#', 'Question', 'The two defensible answers'],
       ['1', 'The balance-sheet default-cover tension',
        'The SECP Chairman said cover defaults from Halqa\u2019s own balance sheet and insure the exposure with takaful. The competitor archive says a platform guarantee is precisely what killed eMoneyPool, and that Money Fellows only carries it because it is licensed. The documents currently take the archive\u2019s side. This has never been put back for a final ruling.'],
       ['2', 'The organizer guarantee',
        'In the traditional system the host covers a defaulter from his own pocket, and field informants cite that guarantee as their main reason for feeling safe. Removing custody \u2014 correctly \u2014 also removed it. Either reproduce it, or state plainly that seat arithmetic replaces it.'],
       ['3', 'Circle authenticity v3',
        'The paired-declaration design, presented 9 August, is not yet approved.'],
       ['4', 'Four numbers awaiting sign-off',
        'The exit fine at one installment with a 70/30 split; the 33% affordability cap; and the tier-one ceilings of Rs 25,000 a month and a Rs 300,000 pot.']],
      [0.04, 0.24, 0.72], fs=9.6, rh=Inches(0.86))
rect(sl, M, Inches(6.22), Inches(0.05), Inches(0.72), fill=GOLD)
tb(sl, M + Inches(0.25), Inches(6.22), Inches(11.4), Inches(0.8),
   'Every strong document in this project contains a passage like this one, and they consistently '
   'strengthen the case rather than weaken it. A regulator, a counterparty and an investor all read '
   'the absence of one as the tell.', size=11.4, color=INK, spacing=1.22)

# ------------------------------------------------- close --------------------
sl = prs.slides.add_slide(BLANK)
_page['n'] += 1
rect(sl, 0, 0, W, H, fill=PINE_DEEP)
rect(sl, 0, 0, W, Inches(0.16), fill=GOLD)
register_mark(sl, Inches(11.05), Inches(3.55), Inches(2.1), ring=PINE_MID, mark=GOLD)
tb(sl, M + Inches(0.4), Inches(2.05), Inches(9.2), Inches(2.4),
   'Every serious competitor in this market makes money by holding money.\n\n'
   'Halqa makes money by charging a stated fee for a service.\n\n'
   'That is not a feature difference \u2014 it is a different business, with a different regulator, a '
   'different cost structure, and a different failure mode.',
   size=21, color=IVORY, font=DISPLAY, spacing=1.28, gap=6)
line(sl, M + Inches(0.4), Inches(4.85), Inches(7.2), Inches(4.85), color=GOLD, lw=2.4)
tb(sl, M + Inches(0.4), Inches(5.52), Inches(9.0), Inches(0.9),
   'Halqa \u00b7 23 September 2026 \u00b7 Live in production since 20 July 2026 \u00b7 No real money has moved yet',
   size=10.6, color=GREY_LT)

out = r'D:\HALQA SIGMA APP\docs\HALQA-MASTER-DECK-2026-09-23.pptx'
prs.save(out)
print('slides:', len(prs.slides.__iter__.__self__._sldIdLst))
print('saved:', out)
