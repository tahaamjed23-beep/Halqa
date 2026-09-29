"""Business and close: fees, competition, evidence, why now, readiness, the pilot,
the requests and the closing slide."""
from charts import gantt, lifelines, stacked, table, vbars
from diagrams import nested
from theme import (CW, GREY, H, INK, L300, L500, L700, ML, SERIF, W, content_slide,
                   hair, line, num, picture, rect, txt)
from slides_story import bank_mark


def fees(d, b):
    s = content_slide(d, "Fees and Revenue", b["fees_statement"], b["notes"]["fees"],
                      src=b["fees_source"])
    txt(s, ML, 1.95, 7.0, 0.3, "One instalment on a circle between strangers, Rs",
        size=13, bold=True)
    edges = stacked(s, ML, 2.95, 6.9, 0.62,
                    [(10000, L500), (547, L300), (500, b["colour"])])
    txt(s, ML, 3.65, 3.6, 0.6, "**Rs 10,000** to the member collecting", size=13)
    ex = edges[1][0] + (edges[1][1] - edges[1][0]) / 2
    fx = edges[2][0] + (edges[2][1] - edges[2][0]) / 2
    line(s, ex, 2.95, ex, 2.55, GREY, 0.75)
    txt(s, ex - 3.3, 2.38, 3.2, 0.3, f"**Rs 547** {b['cover_word']}", size=12,
        align="r")
    line(s, fx, 3.57, fx, 3.95, GREY, 0.75)
    txt(s, fx - 3.2, 3.95, 3.3, 0.6, f"**up to Rs 500** fee, collected by "
        f"{b['short']}", size=12, align="r")
    txt(s, ML + 6.95, 2.98, 1.0, 0.55, "Rs 11,047", size=13, bold=True, anchor="m")
    table(s, ML, 4.72, [1.5, 5.6], b["earn_rows"], row_h=0.5, size=12)
    x = 8.95
    line(s, x - 0.35, 2.0, x - 0.35, 6.5, "D5DCD1", 0.75)
    num(s, x, 2.0, 3.7, "Rs 13 to 35", "running cost of one payment", size=26)
    num(s, x, 3.2, 3.7, "Rs 1.32 million", "fixed cost a month at launch", size=26)
    num(s, x, 4.4, 3.7, "About 2,600", "active members to cover fixed costs", size=26)
    txt(s, x, 5.65, 3.75, 0.8, b["fees_model_note"], size=11, color=GREY, spacing=1.0)


def competition(d, b):
    s = content_slide(d, "Competition", b["comp_statement"], b["notes"]["competition"],
                      src="Sources   1  Oraan terms and fee calculator, read 28 September "
                          "2026   2  JazzCash application 5.6.7 release note, 23 August "
                          "2026   3  Financial Inclusion Insights")
    header = ["", f"Halqa with {b['short']}", "JazzCash Committee", "Oraan",
              "Informal committee"]
    table(s, ML, 1.9, [2.25, 2.55, 2.45, 2.45, 2.39], b["comp_rows"], header=header,
          row_h=0.52, size=12, head_size=13, highlight_col=1)
    y = 6.35
    for i, (lvl, lab) in enumerate((("full", "yes"), ("half", "partly"),
                                    ("none", "no"))):
        from charts import harvey
        harvey(s, ML + 0.1 + i * 1.2, y + 0.12, lvl, 0.18)
        txt(s, ML + 0.28 + i * 1.2, y, 0.9, 0.25, lab, size=11)


def evidence(d, b):
    s = content_slide(d, "Evidence from Other Markets", b["evidence_statement"],
                      b["notes"]["evidence"],
                      src="Sources   Launch Base Africa, October 2025; The National, "
                          "December 2023; CNBC, 11 December 2025; CB Insights; Halqa "
                          "review of 25 earlier attempts, August 2026")
    lifelines(s, ML, 1.95, 2.3, 7.4, 2016, 2026, b["evidence_rows"], row_h=0.9)
    hair(s, ML, 5.85, CW)
    txt(s, ML, 5.95, CW, 0.7,
        ["**The failures** held members' money without a licence, or guaranteed "
         "payouts they could not carry."], size=13)


def why_now(d, b):
    s = content_slide(d, "Why Now", "Payments in Pakistan went digital. Committee "
                      "savings did not.", b["notes"]["why_now"], src=b["why_source"])
    txt(s, ML, 1.95, 5.6, 0.3, "Share of retail payments made digitally, %", size=13,
        bold=True)
    vbars(s, ML, 2.6, 5.4, 3.0, [("FY2023", 78, L300), ("FY2024", 85, L500),
                                 ("FY2025", 88, L500), ("Jan to Mar\n2026", 92, L700)],
          100, bar_w=0.8, size=12, value_size=18, fmt=lambda v: f"{v}%")
    x, w = 6.95, 5.75
    y = 1.98
    for big, cap in b["why_rows"]:
        hair(s, x, y, w)
        txt(s, x, y + 0.12, 2.35, 0.5, big, size=22, font=SERIF, color=L700)
        txt(s, x + 2.45, y + 0.14, w - 2.45, 0.75, cap, size=13, spacing=1.05)
        y += 0.98 if len(b["why_rows"]) < 5 else 0.86
    hair(s, x, y, w)


def readiness(d, b):
    s = content_slide(d, "Regulation and Readiness", b["ready_statement"],
                      b["notes"]["readiness"],
                      src="State Bank of Pakistan, Framework for Risk Management in "
                          "Outsourcing Arrangements by Financial Institutions, 2017, "
                          "revised 2019.")
    nested(s, ML, 1.95, 5.9, 3.55, [
        ("State Bank of Pakistan", "", INK),
        (b["name"], "", b["colour"]),
        ("Halqa, the bank's service provider",
         "Rules, checks, application and records, under the State Bank's "
         "outsourcing framework.",
         L700)])
    txt(s, ML, 5.72, 5.9, 0.8, "Halqa takes no licence of its own and never holds "
        "member money.", size=14, bold=True, color=L700)
    x, w = 7.0, 5.7
    y = 1.98
    for head, body in b["ready_rows"]:
        hair(s, x, y, w)
        txt(s, x, y + 0.1, 1.35, 0.4, head, size=14, bold=True, color=L700)
        txt(s, x + 1.4, y + 0.12, w - 1.4, 1.0, body, size=12.5, spacing=1.05)
        y += 1.08
    hair(s, x, y, w)


def pilot(d, b):
    s = content_slide(d, "Pilot", "One live month with about 1,000 members, after eight "
                      "weeks of agreement, approvals and connection.",
                      b["notes"]["pilot"])
    gantt(s, ML, 1.95, 2.3, 9.7, 14,
          [("Agreement", 1, 4, L700), ("Approvals", 1, 8, L700),
           ("Connection and tests", 5, 8, L500), ("Live month", 9, 12, L500),
           ("Review", 13, 13, L300), ("Scale decision", 14, 14, L700)], row_h=0.46)
    y = 5.2
    hair(s, ML, y, CW)
    cw = CW / 3
    for i, (head, body) in enumerate(b["pilot_cols"]):
        txt(s, ML + i * cw, y + 0.12, cw - 0.3, 0.3, head, size=14, bold=True,
            color=L700)
        txt(s, ML + i * cw, y + 0.45, cw - 0.3, 1.1, body, size=12, spacing=1.05)


def requests(d, b):
    s = content_slide(d, "Requests", b["requests_statement"], b["notes"]["requests"])
    items = b["requests"]
    half = (len(items) + 1) // 2
    cw = CW / 2
    for i, text in enumerate(items):
        col, row = (0, i) if i < half else (1, i - half)
        x = ML + col * (cw + 0.1)
        y = 2.0 + row * 1.08
        hair(s, x, y, cw - 0.3)
        txt(s, x, y + 0.14, 0.55, 0.6, str(i + 1), size=28, font=SERIF, color=L700)
        txt(s, x + 0.65, y + 0.18, cw - 1.05, 0.85, text, size=15, spacing=1.05)
    last = 2.0 + half * 1.08
    hair(s, ML, last, cw - 0.3)
    if len(items) - half:
        hair(s, ML + cw + 0.1, 2.0 + (len(items) - half) * 1.08, cw - 0.3)


def close(d, b):
    s = d.new(b["notes"]["close"])
    picture(s, "halqa_logo.png", ML, 0.72, h=0.5)
    line(s, ML + 1.95, 0.6, ML + 1.95, 1.45, "C9D1C4", 1.0)
    bank_mark(s, b, ML + 2.25, 0.6)
    txt(s, ML, 2.35, 7.0, 1.6, ["Halqa is the system.", "The bank is the machine."],
        size=40, font=SERIF, color=INK, spacing=1.0)
    txt(s, ML, 4.15, 6.9, 0.8, b["close_line"], size=16, color=L700)
    txt(s, ML, 5.55, 6.0, 0.3, "Taha Amjed, Chairman, Halqa", size=14, bold=True)
    txt(s, ML, 5.88, 6.8, 0.3, "A detailed reference on the law, the product, the "
        "economics and the evidence is available.", size=12, color=GREY)
    rect(s, 8.05, 0, W - 8.05, H, L500)
    picture(s, "screen_activity.png", 8.05 + (W - 8.05 - 2.86) / 2, 0.78, h=6.0)
