"""Diagrams: the payment matrix, money routes, swimlane, line maps, nested scopes,
phone screens, the month of a member and the cover exhibit."""
from pptx.enum.dml import MSO_LINE

from theme import (GREY, INK, L500, L700, RED, T50, WHITE, line, oval, picture, rect,
                   txt)


def matrix(s, x, y, n=12, cell=0.3, gap=0.055, on=L700, off="E3EFD9"):
    """Rows are members, columns are months; the diagonal collects the pot."""
    step = cell + gap
    txt(s, x + 0.5, y - 0.02, n * step, 0.25, "Month", size=11, color=GREY, align="c")
    for j in range(n):
        txt(s, x + 0.5 + j * step, y + 0.24, cell, 0.22, str(j + 1), size=10,
            color=GREY, align="c")
    lab = txt(s, x - 0.62, y + 0.5 + n * step / 2 - 0.12, 1.0, 0.25, "Member", size=11,
              color=GREY, align="c")
    lab.rotation = 270
    for i in range(n):
        txt(s, x + 0.12, y + 0.52 + i * step, 0.3, cell, str(i + 1), size=10,
            color=GREY, align="r", anchor="m")
        for j in range(n):
            rect(s, x + 0.5 + j * step, y + 0.52 + i * step, cell, cell,
                 on if i == j else off)
    return x + 0.5 + n * step, y + 0.52 + n * step


def box(s, x, y, w, h, head, sub=None, outline=INK, fill=WHITE, head_color=INK,
        size=14, sub_size=11, lw=1.0, dash=False):
    r = rect(s, x, y, w, h, fill, outline, lw)
    if dash:
        r.line.dash_style = MSO_LINE.DASH
    txt(s, x + 0.1, y + 0.08, w - 0.2, 0.3, head, size=size, bold=True,
        color=head_color, align="c")
    if sub:
        txt(s, x + 0.1, y + 0.4, w - 0.2, h - 0.45, sub, size=sub_size, color=GREY,
            align="c", spacing=1.0)
    return r


def flag(s, x, y, w, text, color=RED, size=12):
    """A red marker with a short failure label."""
    rect(s, x, y + 0.05, 0.1, 0.1, color)
    txt(s, x + 0.17, y, w - 0.17, 0.45, text, size=size, color=color, spacing=1.0)


def route_informal(s, x, y):
    """The committee today: cash through one person, a notebook for records."""
    bw, bh = 2.05, 1.05
    xs = [x, x + 2.75, x + 5.5]
    yy = y + 1.1
    box(s, xs[0], yy, bw, bh, "Members", "each pays Rs 10,000 in cash or by transfer")
    box(s, xs[1], yy, bw, bh, "Organiser", "holds everyone's money", outline=RED)
    box(s, xs[2], yy, bw, bh, "Collector", "this month's turn")
    for a, b in ((0, 1), (1, 2)):
        line(s, xs[a] + bw, yy + bh / 2, xs[b], yy + bh / 2, GREY, 3.0, arrow=True)
    txt(s, xs[0] + bw, yy + bh / 2 - 0.34, 0.7, 0.3, "cash", size=11, color=GREY,
        align="c")
    txt(s, xs[1] + bw, yy + bh / 2 - 0.34, 0.7, 0.3, "cash", size=11, color=GREY,
        align="c")
    box(s, xs[1], yy + 1.75, bw, 0.8, "A notebook", "the only record", outline=GREY,
        dash=True)
    line(s, xs[1] + bw / 2, yy + bh, xs[1] + bw / 2, yy + 1.75, GREY, 0.75, dash=True)
    flag(s, xs[1], y + 0.2, 2.4, "Can disappear with the pot")
    flag(s, xs[2], y + 0.2, 2.2, "May stop paying after collecting")
    flag(s, xs[1], yy + 2.7, 2.6, "No record a lender can read")
    flag(s, xs[0], yy + 1.35, 2.1, "Savings otherwise kept as cash at home")


def route_bank(s, x, y, bank, bank_colour, halqa_sub="rules, turns, checks, records"):
    """The proposal: money moves only between accounts inside the bank; Halqa sends
    instructions and receives confirmations."""
    w = 7.3
    hx, hw = x + 2.3, 2.7
    box(s, hx, y, hw, 0.95, "Halqa", halqa_sub, outline=L700, fill=T50,
        head_color=L700)
    top = y + 1.9
    rect(s, x, top, w, 2.35, None, bank_colour, 1.5)
    txt(s, x + 0.15, top + 0.1, w - 0.3, 0.3, f"Inside {bank}", size=13, bold=True,
        color=bank_colour)
    bw, bh = 1.95, 1.0
    bx = [x + 0.25, x + 2.67, x + 5.1]
    by = top + 0.72
    labels = [("Members' accounts", "Rs 10,000 debited from each"),
              ("Circle account", "the pot gathers on the due date"),
              ("Collector's account", "Rs 120,000, the same day")]
    for (head, sub), bx_ in zip(labels, bx):
        box(s, bx_, by, bw, bh, head, sub, outline=INK, size=13)
    for a in range(2):
        line(s, bx[a] + bw, by + bh / 2, bx[a + 1], by + bh / 2, L500, 4.0, arrow=True)
    line(s, hx + 0.8, y + 0.95, hx + 0.8, top, INK, 1.0, arrow=True)
    line(s, hx + hw - 0.8, top, hx + hw - 0.8, y + 0.95, INK, 1.0, arrow=True)
    txt(s, x, y + 1.2, hx + 0.7 - x, 0.5, "instructions", size=11,
        color=GREY, align="r")
    txt(s, hx + hw - 0.65, y + 1.2, 2.4, 0.5, "confirmations",
        size=11, color=GREY)
    line(s, x, y + 0.12, x + 0.5, y + 0.12, L500, 4.0)
    txt(s, x + 0.6, y, 1.2, 0.25, "money", size=11, color=GREY)
    line(s, x, y + 0.47, x + 0.5, y + 0.47, INK, 1.0)
    txt(s, x + 0.6, y + 0.35, 1.6, 0.25, "instructions", size=11, color=GREY)


def linemap(s, x, y, w, steps, colour=L700, head_size=13, sub_size=11, d=0.2,
            fills=None, col_w=None, fill_colour=None):
    """Stations on a line: (heading, description). fills: indexes drawn solid."""
    n = len(steps)
    gap = w / (n - 1) if n > 1 else 0
    line(s, x, y, x + w, y, colour, 2.25)
    cw = col_w or min(gap * 0.95, 2.1)
    for i, (head, sub) in enumerate(steps):
        cx = x + i * gap
        solid = fills and i in fills
        fc = fill_colour or colour
        oval(s, cx, y, d, fc if solid else WHITE, fc if solid else colour, 1.75)
        txt(s, cx - cw / 2, y + 0.2, cw, 0.3, head, size=head_size, bold=True,
            align="c")
        if sub:
            txt(s, cx - cw / 2, y + 0.5, cw, 0.9, sub, size=sub_size, color=GREY,
                align="c", spacing=1.0)


def nested(s, x, y, w, h, layers):
    """layers: (heading, text, colour) from outside in."""
    inset = 0.3
    for i, (head, body, colour) in enumerate(layers):
        xx, yy = x + i * inset, y + i * (inset + 0.28)
        ww, hh = w - 2 * i * inset, h - i * (2 * inset + 0.4)
        rect(s, xx, yy, ww, hh, T50 if i == len(layers) - 1 else None, colour, 1.25)
        txt(s, xx + 0.15, yy + 0.1, ww - 0.3, 0.3, head, size=13, bold=True,
            color=colour)
        if body:
            txt(s, xx + 0.15, yy + 0.42, ww - 0.3, hh - 0.5, body, size=12, color=INK)


def phones(s, x, y, h, items, gap=0.55, cap_w=None):
    """items: (asset name, heading, description). Returns the right edge."""
    pw = h * 409 / 859
    cx = x
    for i, (name, head, sub) in enumerate(items):
        picture(s, name, cx, y, h=h)
        w = cap_w or pw + 0.3
        txt(s, cx, y + h + 0.15, w, 0.3, f"{i + 1}   {head}", size=14, bold=True,
            color=L700)
        txt(s, cx, y + h + 0.47, w, 0.6, sub, size=11, color=INK, spacing=1.0)
        cx += pw + gap
    return cx


def month(s, x, y, w, bank_colour, events, bands, due=8, days=30):
    """A month on a day axis. bands: (start, end, colour, label).
    events: (day, heading, text, product) described in columns below."""
    uw = w / days
    ay = y + 0.95
    for a, b, colour, label in bands:
        rect(s, x + (a - 1) * uw, ay - 0.42, (b - a + 1) * uw, 0.36, colour)
        txt(s, x + (a - 1) * uw, ay - 0.75, (b - a + 1) * uw + 1.5, 0.3, label,
            size=11, color=INK)
    line(s, x, ay, x + w, ay, INK, 0.75)
    for d in (1, 5, 8, 10, 15, 20, 25, 30):
        xx = x + (d - 0.5) * uw
        line(s, xx, ay, xx, ay + 0.06, INK, 0.75)
        txt(s, xx - 0.25, ay + 0.08, 0.5, 0.25, str(d), size=10, color=GREY,
            align="c")
    txt(s, x + w + 0.08, ay - 0.1, 0.6, 0.25, "day", size=10, color=GREY)
    dx = x + (due - 0.5) * uw
    line(s, dx, y - 0.1, dx, ay + 0.35, L700, 2.5)
    txt(s, dx + 0.08, y - 0.18, 2.2, 0.3, f"Due date, the {due}th", size=11,
        bold=True, color=L700)
    col_w = w / len(events)
    for i, (day, head, body, product) in enumerate(events):
        cx = x + i * col_w
        txt(s, cx, ay + 0.5, col_w - 0.25, 0.3, head, size=14, bold=True, color=INK)
        txt(s, cx, ay + 0.82, col_w - 0.25, 0.9, body, size=12, color=INK,
            spacing=1.05)
        if product:
            txt(s, cx, ay + 1.72, col_w - 0.25, 0.6, product, size=12, bold=True,
                color=bank_colour, spacing=1.0)


def cover_pots(s, x, y, w, h, bank_colour, cover_label="cover"):
    """Turn 1 collects then stops paying; every later pot is still paid in full."""
    n = 12
    step = w / n
    bw = step * 0.62
    base = y + h
    for k in range(n):
        cx = x + k * step + step / 2
        if k == 0:
            rect(s, cx - bw / 2, base - h, bw, h, None, RED, 1.25)
            pass
        else:
            member_h = h * 110 / 120
            rect(s, cx - bw / 2, base - member_h, bw, member_h, L500)
            rect(s, cx - bw / 2, base - h, bw, h - member_h, bank_colour)
        txt(s, cx - step / 2, base + 0.08, step, 0.25, str(k + 1), size=11,
            color=GREY, align="c")
    line(s, x, base, x + w, base, INK, 0.75)
    txt(s, x, base + 0.34, w, 0.25, "Turn", size=11, color=GREY, align="c")
    return step, bw
