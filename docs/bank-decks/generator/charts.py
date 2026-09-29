"""Charts and tables drawn with shapes, so they look the same in PowerPoint,
Google Slides and LibreOffice. Every chart carries direct labels, not legends."""
from theme import (GREY, GREY2, INK, L300, L500, L700, LINE, SANS, SERIF, T50,
                   WHITE, hair, line, oval, pie, rect, txt)


def hbars(s, x, y, label_w, bar_w, rows, vmax, bar_h=0.42, gap=0.28, size=14,
          fmt=lambda v: f"{v}%", value_size=16):
    """rows: (label, value, colour). Labels left, value at the bar end."""
    for i, (label, v, colour) in enumerate(rows):
        yy = y + i * (bar_h + gap)
        txt(s, x, yy, label_w - 0.15, bar_h, label, size=size, anchor="m")
        bw = max(bar_w * v / vmax, 0.04)
        rect(s, x + label_w, yy, bw, bar_h, colour)
        txt(s, x + label_w + bw + 0.1, yy, 1.4, bar_h, fmt(v), size=value_size,
            font=SERIF, color=INK, anchor="m")


def vbars(s, x, y, w, h, rows, vmax, bar_w=0.62, size=12, fmt=str, value_size=14,
          label_h=0.5, baseline=True):
    """rows: (label, value, colour). Values above bars, labels below the axis."""
    n = len(rows)
    step = w / n
    base = y + h
    for i, (label, v, colour) in enumerate(rows):
        cx = x + step * i + step / 2
        bh = max(h * v / vmax, 0.02)
        rect(s, cx - bar_w / 2, base - bh, bar_w, bh, colour)
        txt(s, cx - step / 2, base - bh - 0.32, step, 0.3, fmt(v), size=value_size,
            font=SERIF, align="c", anchor="b")
        txt(s, cx - step / 2, base + 0.08, step, label_h, label, size=size,
            align="c", color=INK)
    if baseline:
        line(s, x, base, x + w, base, INK, 0.75)


def bracket(s, x1, x2, y, label, size=12, color=INK, tick=0.08):
    """A bracket under a range of bars, with its label beneath."""
    line(s, x1, y, x2, y, GREY, 0.75)
    line(s, x1, y - tick, x1, y, GREY, 0.75)
    line(s, x2, y - tick, x2, y, GREY, 0.75)
    txt(s, x1 - 0.2, y + 0.06, x2 - x1 + 0.4, 0.5, label, size=size, color=color,
        align="c")


def gantt(s, x, y, label_w, w, units, rows, row_h=0.42, bar_h=0.26, size=13,
          unit_label="Week"):
    """rows: (label, start, end, colour); start and end are 1-based units, inclusive."""
    uw = w / units
    txt(s, x, y, label_w - 0.2, 0.3, unit_label, size=11, color=GREY, align="r")
    for u in range(units):
        txt(s, x + label_w + u * uw, y, uw, 0.3, str(u + 1), size=11, color=GREY,
            align="c")
        line(s, x + label_w + u * uw, y + 0.34, x + label_w + u * uw,
             y + 0.4 + len(rows) * row_h, LINE, 0.5)
    line(s, x + label_w + w, y + 0.34, x + label_w + w, y + 0.4 + len(rows) * row_h,
         LINE, 0.5)
    for i, (label, a, b, colour) in enumerate(rows):
        yy = y + 0.42 + i * row_h
        txt(s, x, yy, label_w - 0.2, row_h, label, size=size, align="r", anchor="m")
        rect(s, x + label_w + (a - 1) * uw + 0.03, yy + (row_h - bar_h) / 2,
             (b - a + 1) * uw - 0.06, bar_h, colour)


def harvey(s, cx, cy, level, d=0.2, colour=L700):
    """level: 'full', 'half' or 'none'."""
    oval(s, cx, cy, d, WHITE, colour, 1.25)
    if level == "full":
        oval(s, cx, cy, d, colour, colour, 1.25)
    elif level == "half":
        pie(s, cx, cy, d, 270, 90, colour)


def table(s, x, y, cols, rows, header=None, row_h=0.4, size=12, head_size=12,
          head_color=L700, first_bold=True, rule_first=True, highlight_col=None,
          highlight_fill=T50, dot_colour=L700, pad=0.08, anchor="m"):
    """cols: widths in inches. A cell is text, or ('dot', level, text) for a Harvey
    ball with a short label. Hairlines separate rows."""
    total_w = sum(cols)
    top = y
    n_rows = len(rows) + (1 if header else 0)
    if highlight_col is not None:
        hx = x + sum(cols[:highlight_col])
        rect(s, hx, y - 0.04, cols[highlight_col], n_rows * row_h + 0.08, highlight_fill)
    if header:
        cx = x
        for j, (hcell, cw) in enumerate(zip(header, cols)):
            txt(s, cx + (pad if j else 0), y, cw - pad, row_h, hcell, size=head_size,
                bold=True, color=head_color if j else INK, anchor="b")
            cx += cw
        y += row_h
        line(s, x, y + 0.04, x + total_w, y + 0.04, INK, 1.0)
    for i, row in enumerate(rows):
        cx = x
        for j, (cell, cw) in enumerate(zip(row, cols)):
            px = cx + (pad if j else 0)
            if isinstance(cell, tuple) and cell and cell[0] == "dot":
                _, level, label = cell
                if level is None:
                    txt(s, px + 0.28, y + 0.02, cw - 0.36, row_h, label,
                        size=size - 1, color=GREY, anchor=anchor)
                    cx += cw
                    continue
                harvey(s, px + 0.1, y + row_h / 2 + 0.02, level, 0.19, dot_colour)
                if label:
                    txt(s, px + 0.28, y + 0.02, cw - 0.36, row_h, label, size=size - 1,
                        anchor=anchor)
            elif cell:
                txt(s, px, y + 0.02, cw - pad - 0.04, row_h, cell, size=size,
                    bold=(first_bold and j == 0), anchor=anchor)
            cx += cw
        y += row_h
        if i < len(rows) - 1 or rule_first:
            hair(s, x, y + 0.02, total_w)
    return y - top


def stacked(s, x, y, w, h, parts):
    """parts: (value, colour). One horizontal bar split to scale; returns x edges."""
    total = sum(v for v, _ in parts)
    edges = []
    cx = x
    for v, colour in parts:
        pw = w * v / total
        rect(s, cx, y, pw, h, colour)
        edges.append((cx, cx + pw))
        cx += pw
    return edges


def lifelines(s, x, y, label_w, w, start, end, rows, row_h=0.72, size=13,
              colour=L700):
    """rows: (name, country, first_year, [(year, text, filled)], end_text).
    A horizontal line per company on a real year axis, with dated events."""
    years = end - start
    uw = w / years
    for k in range(years + 1):
        xx = x + label_w + k * uw
        txt(s, xx - 0.3, y, 0.6, 0.25, str(start + k), size=10, color=GREY, align="c")
        line(s, xx, y + 0.3, xx, y + 0.35 + len(rows) * row_h, LINE, 0.5)
    for i, (name, country, first, events, end_text) in enumerate(rows):
        yy = y + 0.4 + i * row_h
        cy = yy + 0.2
        txt(s, x, yy, label_w - 0.1, 0.3, name, size=size + 1, bold=True, color=colour)
        txt(s, x, yy + 0.28, label_w - 0.1, 0.25, country, size=11, color=GREY)
        x0 = x + label_w + (first - start) * uw
        x1 = x + label_w + years * uw
        line(s, x0, cy, x1, cy, colour, 2.25)
        oval(s, x0, cy, 0.14, colour, colour)
        for (yr, label, filled) in events:
            ex = x + label_w + (yr - start) * uw
            oval(s, ex, cy, 0.17, colour if filled else WHITE, colour, 1.5)
            txt(s, ex - 0.9, cy + 0.11, 1.8, 0.25, label, size=10, color=INK, align="c")
        txt(s, x1 + 0.12, yy + 0.05, 2.0, 0.3, end_text, size=13, color=INK)


def dotrow(s, x, y, n, filled, d=0.16, gap=0.06, on=L500, off="E4E9E1"):
    """n small squares in a row; the first 'filled' are coloured."""
    for i in range(n):
        rect(s, x + i * (d + gap), y, d, d, on if i < filled else off)


def legend_item(s, x, y, colour, label, size=11, box=0.16):
    rect(s, x, y + 0.03, box, box, colour)
    txt(s, x + box + 0.08, y, 2.5, 0.25, label, size=size, color=INK)
