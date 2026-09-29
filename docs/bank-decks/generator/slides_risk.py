"""Checks and risk: onboarding, committee types, where the risk sits, missed
payments and recovery, and cover."""
from charts import bracket, harvey, table, vbars
from diagrams import box, cover_pots, linemap
from theme import (CW, GREY, INK, L300, L500, L700, LINE, ML, RED, T50, WHITE,
                   content_slide, hair, line, num, rect, txt)


def checks(d, b):
    s = content_slide(d, "Onboarding and Checks", b["checks_statement"],
                      b["notes"]["checks"])
    lanes = [("Member", INK), (b["short"], b["colour"]), ("Halqa", L700)]
    lx, lw, top, lh = ML, 1.25, 1.92, 1.28
    for i, (name, colour) in enumerate(lanes):
        y = top + i * lh
        rect(s, lx, y, CW, lh, T50 if i == 2 else None, None)
        hair(s, lx, y, CW, LINE)
        txt(s, lx + 0.05, y, lw, lh, name, size=15, bold=True, color=colour,
            anchor="m")
    hair(s, lx, top + 3 * lh, CW, LINE)
    bw, bh, gap = 1.62, 1.12, 0.2
    x0 = lx + lw + 0.15
    cols = [x0 + k * (bw + gap) for k in range(6)]
    ys = [top + (lh - bh) / 2 + k * lh for k in range(3)]
    specs = [(0, 0, "Sign up", "phone number, one time code, PIN", INK),
             (1, 1, "Account", b["checks_account"], b["colour"]),
             (2, 2, "Identity", "CNIC and account names match; live face check", L700),
             (3, 2, "Income", "salary or daily income arrives regularly", L700),
             (4, 2, "Affordability", "all instalments within a third of income",
              L700),
             (5, 2, "Credit score", "300 to 850; decides which turns open", L700)]
    for col, lane, head, sub, colour in specs:
        box(s, cols[col], ys[lane], bw, bh, head, sub, outline=colour,
            head_color=colour, size=13, sub_size=10.5)
    line(s, cols[0] + bw / 2, ys[0] + bh, cols[0] + bw / 2, ys[1] + bh / 2, INK, 1.0)
    line(s, cols[0] + bw / 2, ys[1] + bh / 2, cols[1], ys[1] + bh / 2, INK, 1.0,
         arrow=True)
    line(s, cols[1] + bw / 2, ys[1] + bh, cols[1] + bw / 2, ys[2] + bh / 2, INK, 1.0)
    line(s, cols[1] + bw / 2, ys[2] + bh / 2, cols[2], ys[2] + bh / 2, INK, 1.0,
         arrow=True)
    for k in range(2, 5):
        line(s, cols[k] + bw, ys[2] + bh / 2, cols[k + 1], ys[2] + bh / 2, INK, 1.0,
             arrow=True)
    line(s, cols[5] + bw / 2, ys[2], cols[5] + bw / 2, ys[0] + bh, L700, 1.5,
         arrow=True)
    txt(s, cols[2], ys[0] + 0.12, cols[5] - cols[2] + bw / 2 - 0.2, 0.7,
        "**Sees only the circles and turns open to this member**", size=13,
        color=L700, align="r")
    txt(s, ML, 5.86, CW, 0.9,
        ["**Checks rise with risk.** Known circles: identity only. Strangers: income, "
         "affordability and a credit report as well. Hyper: proof of daily income too.",
         "**Stored.** Results only; never face images, card numbers or passwords."],
        size=12, after=4)


TYPE_ROWS = ["Who", "Members", "Instalment", "Frequency", "Income checked",
             "Automatic debit", "Cover", "Credit report read", "Stage"]


def types(d, b):
    s = content_slide(d, "Committee Types",
                      "The less members know each other, the more checks apply.",
                      b["notes"]["types"],
                      src="Turn bands apply in every type. Cover and financing "
                          "follow the bank's choice of product.")
    cols = b["types"]
    n = len(cols)
    first = 1.95
    cw = (CW - first) / n
    header = [""] + [c["name"] for c in cols]
    rows = []
    for key in b.get("type_rows", TYPE_ROWS):
        row = [key]
        for c in cols:
            v = c[key]
            row.append(("dot", "full" if v else "none", "") if isinstance(v, bool)
                       else v)
        rows.append(row)
    h1 = table(s, ML, 1.85, [first] + [cw] * n, rows[:1], header=header,
               row_h=0.6, size=11.5, head_size=13, rule_first=True)
    table(s, ML, 1.85 + h1 + 0.02, [first] + [cw] * n, rows[1:], row_h=0.4,
          size=12, rule_first=True)
    harvey(s, ML + 0.1, 6.5, "full", 0.18)
    txt(s, ML + 0.28, 6.38, 1.4, 0.25, "required", size=11)
    harvey(s, ML + 1.45, 6.5, "none", 0.18)
    txt(s, ML + 1.63, 6.38, 1.6, 0.25, "not required", size=11)


def risk(d, b):
    s = content_slide(
        d, "Where the Risk Sits",
        "Only an early collector can leave others short. Early turns need strong "
        "credit scores.", b["notes"]["risk"],
        src="State Bank of Pakistan, Prudential Regulations for Consumer Financing, R-3, "
            "as amended by BPRD Circular Letter 29 of 2021: the 40% limit on loan "
            "repayments.")
    txt(s, ML, 1.95, 6.8, 0.3, "Still owed after collecting, by turn, Rs thousand: "
        "twelve members at Rs 10,000", size=13, bold=True)
    colours = [L700] * 6 + [L500] * 3 + [L300] * 3
    rows = [(str(k + 1), 110 - 10 * k, colours[k]) for k in range(12)]
    vbars(s, ML, 2.65, 6.6, 2.55, rows, 110, bar_w=0.36, size=11,
          fmt=lambda v: str(v), value_size=11, label_h=0.25)
    step = 6.6 / 12
    by = 5.62
    bracket(s, ML + 0.08, ML + 6 * step - 0.08, by, "credit score 650 and above")
    bracket(s, ML + 6 * step + 0.08, ML + 9 * step - 0.08, by, "550 and above")
    bracket(s, ML + 9 * step + 0.08, ML + 12 * step - 0.08, by,
            "any score; every new member")
    x, w = 7.85, 4.85
    y = 1.98
    for head, body in b["risk_controls"]:
        hair(s, x, y, w)
        txt(s, x, y + 0.14, w, 0.9, f"**{head}.** {body}", size=14, spacing=1.05)
        y += 1.08
    hair(s, x, y, w)


def recovery(d, b):
    s = content_slide(d, "Missed Payments and Recovery",
                      "Every missed payment has a set response, written into the "
                      "member's signed undertaking.", b["notes"]["recovery"],
                      src="Contract Act 1872, s.74: a penalty may not exceed reasonable "
                          "compensation. Code of Civil Procedure, Order XXXVII: summary "
                          "suits only on cheques and similar instruments.")
    txt(s, ML, 1.95, 3.5, 0.3, "Any missed payment", size=14, bold=True, color=L700)
    linemap(s, ML + 0.9, 2.62, 10.4, b["late_steps"], L700, head_size=13,
            sub_size=11, fills=[5])
    txt(s, ML, 3.95, 5.0, 0.3, "A member who collected, then stopped paying", size=14,
        bold=True, color=RED)
    linemap(s, ML + 0.9, 4.62, 10.4, b["recovery_steps"], RED, head_size=13,
            sub_size=11, fills=[2], fill_colour=L700)
    hair(s, ML, 5.78, CW)
    cols = [(ML, "Rs 110,000", "the most one member can owe after collecting"),
            (ML + 4.1, "Never", "calls to relatives, contact lists or public names"),
            (ML + 8.2, "Charity", b["charity_line"])]
    for x, big, cap in cols:
        txt(s, x, 5.88, 1.6, 0.4, big, size=18, color=L700, font="Georgia")
        txt(s, x + 1.65, 5.9, 2.25, 0.8, cap, size=11, spacing=1.0)


def cover(d, b):
    s = content_slide(d, b["cover_heading"], b["cover_statement"],
                      b["notes"]["cover"], src=b["cover_source"])
    txt(s, ML, 1.95, 6.8, 0.3, "Each pot stays Rs 120,000 when the member at turn 1 "
        "stops paying", size=13, bold=True)
    cover_pots(s, ML, 2.7, 6.6, 2.55, b["colour"])
    y = 5.92
    rect(s, ML, y + 0.04, 0.16, 0.16, L500)
    txt(s, ML + 0.24, y, 3.0, 0.25, "paid by the other members, Rs 110,000", size=11)
    rect(s, ML + 3.2, y + 0.04, 0.16, 0.16, b["colour"])
    txt(s, ML + 3.44, y, 3.2, 0.25, f"paid by {b['cover_word']}, Rs 10,000", size=11)
    rect(s, ML, y + 0.38, 0.16, 0.16, None, RED, 1.25)
    txt(s, ML + 0.24, y + 0.34, 6.0, 0.25, "turn 1: collected, then stopped paying",
        size=11)
    x = 7.85
    b["cover_panel"](s, x)
