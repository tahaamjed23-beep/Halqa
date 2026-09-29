"""Appendix: reference pages for questions after the presentation."""
from charts import table
from diagrams import linemap
from theme import (CW, GREY, INK, L300, L500, L700, LINE, ML, RED, SERIF, T50,
                   content_slide, hair, line, num, rect, txt)


def divider(d, b):
    s = content_slide(d, "Appendix", "Reference pages for questions.",
                      b["notes"]["appendix"])
    y = 2.1
    for i, name in enumerate(b["appendix_list"]):
        hair(s, ML, y, 6.5)
        txt(s, ML, y + 0.12, 0.6, 0.4, f"A{i + 1}", size=15, color=L700, font=SERIF)
        txt(s, ML + 0.7, y + 0.13, 5.8, 0.4, name, size=15)
        y += 0.58
    hair(s, ML, y, 6.5)


def risks(d, b):
    s = content_slide(d, "Risks and Controls", f"Each risk {b['short']} would carry "
                      "has a stated control.", b["notes"]["risks"])
    table(s, ML, 1.95, [2.6, CW - 2.6], b["risk_rows"], row_h=0.66, size=13)


def integration(d, b):
    s = content_slide(d, "Integration", f"Halqa sends instructions. {b['short']} moves "
                      "the money and confirms every step.", b["notes"]["integration"],
                      src="Interfaces proposed, not agreed. Governed by the State "
                          "Bank's outsourcing framework.")
    xs = [ML + 0.9, ML + 3.75, ML + 6.6]
    heads = [("Member", INK), ("Halqa platform", L700),
             (f"{b['short']} systems", b["colour"])]
    for x, (head, colour) in zip(xs, heads):
        rect(s, x - 0.9, 1.95, 1.8, 0.45, T50 if colour == L700 else None, colour, 1.25)
        txt(s, x - 0.9, 1.95, 1.8, 0.45, head, size=12, bold=True, color=colour,
            align="c", anchor="m")
        line(s, x, 2.4, x, 6.45, LINE, 1.0, dash=True)
    msgs = [(0, 2, "opens an account in the application"),
            (2, 1, "account and mandate references"),
            (1, 2, "collection file on the due date"),
            (2, 1, "signed confirmation of each debit"),
            (1, 0, "receipt; ledger and schedule updated"),
            (1, 2, "payout instruction: the pot, less arrears"),
            (2, 1, "statement each morning to reconcile")]
    for i, (a, c, label) in enumerate(msgs):
        y = 2.95 + i * 0.5
        line(s, xs[a], y, xs[c], y, INK, 1.0, arrow=True)
        lx = min(xs[a], xs[c])
        txt(s, lx + 0.08, y - 0.27, abs(xs[c] - xs[a]) - 0.16, 0.25,
            f"{i + 1}  {label}", size=10.5, align="c")
    x, w = 8.5, 4.2
    y = 1.98
    for head, body in b["security_rows"]:
        hair(s, x, y, w)
        txt(s, x, y + 0.08, w, 0.75, f"**{head}.** {body}", size=12, spacing=1.05)
        y += 0.76
    hair(s, x, y, w)


def points(d, b):
    s = content_slide(d, b["points_heading"], b["points_statement"],
                      b["notes"]["points"], src=b["points_source"])
    txt(s, ML, 1.95, 5.2, 0.3, "Points", size=15, bold=True, color=L700)
    table(s, ML, 2.35, [3.0, 2.3], b["points_rows"], row_h=0.44, size=12)
    txt(s, ML, 5.55, 5.4, 1.0, b["points_rules"], size=11.5, spacing=1.05)
    x = 6.75
    txt(s, x, 1.95, 5.9, 0.3, b["turn_heading"], size=15, bold=True, color=L700)
    linemap(s, x + 0.45, 2.78, 5.0, b["turn_steps"], L700, head_size=12, sub_size=10,
            col_w=1.05)
    y = 4.3
    for head, body in b["turn_rules"]:
        hair(s, x, y, 5.95)
        txt(s, x, y + 0.08, 5.95, 0.6, f"**{head}.** {body}", size=11.5, spacing=1.05)
        y += 0.56
    hair(s, x, y, 5.95)


def hyper(d, b):
    s = content_slide(d, "Hyper: Daily Circles", "For members with daily income. "
                      "Labelled experimental, with a hard stop on losses.",
                      b["notes"]["hyper"],
                      src="Two options fixed on 23 September 2026. Pot = daily "
                          "contribution x days; roster = collectors a day x days.")
    header = ["", "Option 1", "Option 2"]
    rows = [["Members", "400", "390"],
            ["Days", "50", "26, Sundays off"],
            ["Members collecting each day", "8", "15"],
            ["Paid each day", "Rs 450", "Rs 500"],
            ["  to the pot", "Rs 300", "Rs 333.33"],
            [f"  to {b['cover_word']}", "Rs 75", "Rs 83.33"],
            ["  fee", "Rs 75", "Rs 83.33"],
            ["Pot, collected once", "Rs 15,000", "Rs 8,666.67"],
            ["Paid over the cycle", "Rs 22,500", "Rs 13,000"]]
    table(s, ML, 1.95, [3.2, 1.9, 1.9], rows, header=header, row_h=0.43, size=13,
          head_size=13)
    x, w = 8.2, 4.5
    y = 1.98
    for head, body in b["hyper_rows"]:
        hair(s, x, y, w)
        txt(s, x, y + 0.1, w, 0.9, f"**{head}.** {body}", size=12.5, spacing=1.05)
        y += 0.9
    hair(s, x, y, w)


def leaving(d, b):
    s = content_slide(d, "Leaving a Circle", "There is no cancel button. A member who "
                      "has not collected leaves by one of five set routes.",
                      b["notes"]["leaving"])
    steps = [("Window", "inside the 24 hours before the start: free, no record"),
             ("Substitute", "a replacement takes the turn and repays the leaver"),
             ("Group vote", "72 hour vote; fine of one instalment; money back at "
              "the close"),
             ("Hardship", "recorded statement; fine waived; recorded as hardship"),
             ("Abandon", "not an exit: the recovery steps apply")]
    linemap(s, ML + 1.0, 2.35, 10.1, steps, L700, head_size=14, sub_size=11,
            col_w=2.1)
    hair(s, ML, 4.05, CW)
    txt(s, ML, 4.2, 5.0, 0.3, "Worked example", size=14, bold=True, color=L700)
    txt(s, ML, 4.6, 6.0, 1.9,
        ["Twelve members at Rs 10,000. One leaves after round 4, having paid "
         "Rs 40,000.",
         "The circle continues with eleven, so each later pot is Rs 10,000 smaller.",
         "The four members who already collected full pots each return Rs 10,000 "
         "at the close."], size=13, after=6)
    x = 7.3
    num(s, x, 4.2, 5.3, "Rs 40,000", "returned to the leaver at the end of the circle, "
        "less any fine, with no profit. The wait is the deterrent.", size=28,
        cap_h=0.9)
    txt(s, x, 5.85, 5.3, 0.6, b["leaving_fine"], size=12, color=GREY)


def unit_costs(d, b):
    s = content_slide(d, "Unit Costs", "The costs Halqa carries, and what the bank "
                      "route changes.", b["notes"]["unit_costs"],
                      src="Business Model and Unit Costs, 25 September 2026, before "
                          "the bank's terms. Planning figures are marked.")
    txt(s, ML, 1.95, 4.8, 0.3, "Prices used", size=15, bold=True, color=L700)
    table(s, ML, 2.35, [2.9, 1.9], [
        ["WhatsApp message", "Rs 4.35"],
        ["Identity check, NADRA", "Rs 50, planning"],
        ["Credit report", "Rs 200, planning"],
        ["Support agent a month", "Rs 60,000"],
        ["Cloud, a member a month", "Rs 2"],
        ["Acquiring a member", "Rs 250, planning"]], row_h=0.46, size=12.5)
    x = 6.0
    txt(s, x, 1.95, 6.6, 0.3, "What the bank route changes", size=15, bold=True,
        color=L700)
    table(s, x, 2.35, [1.75, 2.35, 2.6], b["route_rows"],
          header=["", "Before", f"With {b['short']}"], row_h=0.6, size=11.5,
          head_size=12)
