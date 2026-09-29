"""Opening slides: title, summary, the committee, the market, the problem, the
proposal, the product, a month inside the bank and the mutual benefit."""
from charts import hbars, table, vbars
from diagrams import matrix, month, phones, route_bank, route_informal
from theme import (CW, GREY, H, INK, L300, L500, L700, ML, SANS, SERIF, T100, W,
                   content_slide, hair, line, num, picture, rect, source, txt)


def bank_mark(s, b, x, y):
    """The bank's approved logo, or its name set in type when no logo is approved."""
    if b.get("logo"):
        picture(s, b["logo"], x, y - 0.14, h=0.86)
    else:
        txt(s, x, y + 0.02, 3.2, 0.6, b["name"], size=15, bold=True, color=INK,
            spacing=1.0)


def title_slide(d, b):
    s = d.new(b["notes"]["title"])
    picture(s, "halqa_logo.png", ML, 0.72, h=0.5)
    line(s, ML + 1.95, 0.6, ML + 1.95, 1.45, "C9D1C4", 1.0)
    bank_mark(s, b, ML + 2.25, 0.6)
    txt(s, ML, 2.25, 7.2, 1.6, b["title"], size=b.get("title_size", 40), font=SERIF,
        color=INK, spacing=1.0)
    txt(s, ML, 3.95, 6.9, 0.4, b["subtitle"], size=20, color=L700)
    txt(s, ML, 5.55, 6.0, 0.3, "Taha Amjed, Chairman, Halqa", size=14, bold=True)
    txt(s, ML, 5.88, 6.0, 0.3, b["date"], size=12, color=GREY)
    rect(s, 8.05, 0, W - 8.05, H, L500)
    picture(s, "screen_home.png", 8.05 + (W - 8.05 - 2.86) / 2, 0.78, h=6.0)


def summary(d, b):
    s = content_slide(d, "Summary", b["summary_statement"], b["notes"]["summary"])
    y = 2.0
    for label, text in b["summary_rows"]:
        hair(s, ML, y, CW)
        txt(s, ML, y + 0.2, 2.3, 0.6, label, size=17, bold=True, color=L700)
        txt(s, ML + 2.5, y + 0.2, CW - 2.5, 0.7, text, size=17, spacing=1.05)
        y += 0.88
    hair(s, ML, y, CW)


def committee(d, b):
    s = content_slide(
        d, "How a Committee Works",
        "Everyone pays the same amount each month. Each month, one member takes the "
        "whole pot.", b["notes"]["committee"])
    mx, my = matrix(s, ML + 0.35, 1.95, cell=0.27, gap=0.055)
    rect(s, ML + 0.85, my + 0.18, 0.18, 0.18, L700)
    txt(s, ML + 1.1, my + 0.15, 2.0, 0.25, "collects the pot", size=11)
    rect(s, ML + 2.75, my + 0.18, 0.18, 0.18, "E3EFD9")
    txt(s, ML + 3.0, my + 0.15, 2.0, 0.25, "pays Rs 10,000", size=11)
    x = 6.55
    num(s, x, 2.0, 5.8, "Rs 10,000", "paid in by every member, every month", size=32)
    num(s, x, 3.15, 5.8, "Rs 120,000", "the pot, taken by one member each month",
        size=32)
    hair(s, x, 4.45, 6.1)
    txt(s, x, 4.6, 6.1, 1.2,
        ["**First turn.** An advance without interest, repaid by the instalments "
         "that follow.",
         "**Last turn.** Saving, with a deadline the group enforces."],
        size=14, after=6)
    txt(s, x, 5.65, 6.1, 0.8, b["committee_end"], size=14, color=INK)
    source(s, "Also called a kameti or BC; worldwide, a rotating savings and credit "
           "association. Example: twelve members at Rs 10,000 a month.")


def market(d, b):
    s = content_slide(
        d, "The Market",
        "More than a third of Pakistanis save in committees. Almost none of that money "
        "reaches a bank.", b["notes"]["market"],
        src="Sources   1  Karandaaz and Oraan, reported by Dawn, 12 December 2022   "
            "2  Financial Inclusion Insights surveys of Pakistan")
    txt(s, ML, 2.1, 6.9, 0.3, "Where Pakistani savers keep their savings, per cent of "
        "savers [2]", size=13, bold=True)
    hbars(s, ML, 2.7, 2.35, 3.9,
          [("Cash kept at home", 63, "B9C2B4"), ("A committee", 33, L500),
           ("A bank or other formal institution", 4, L700)], 63, bar_h=0.62, gap=0.42)
    x = 8.35
    num(s, x, 2.05, 4.3, "34% to 41%", "of Pakistanis take part in committees [1]")
    num(s, x, 3.45, 4.3, "Rs 4 trillion", "estimated to pass through committees each "
        "year [1]")
    num(s, x, 4.85, 4.3, "Twice", "the rate of participation for women as for men [2]")


def problem(d, b):
    s = content_slide(
        d, "The Problem",
        "Committees run on trust and cash. When the trust fails, members lose their "
        "money.", b["notes"]["problem"],
        src="Sources   1  Financial Inclusion Insights surveys of Pakistan   "
            "2  Dawn, 12 December 2022")
    route_informal(s, ML, 2.45)
    x = 9.2
    line(s, x - 0.35, 2.05, x - 0.35, 6.5, "D5DCD1", 0.75)
    num(s, x, 2.05, 3.5, "12%", "of committee users lost money to fraud [1]",
        color="B3261E")
    num(s, x, 3.5, 3.5, "Rs 420 million", "taken from 117 committees by one organiser, "
        "2022 [2]", color="B3261E")
    num(s, x, 4.95, 3.5, "63%", "of savers keep savings as cash at home [1]",
        color="B3261E")


def proposal(d, b):
    s = content_slide(d, "The Proposal", b["proposal_statement"],
                      b["notes"]["proposal"])
    route_bank(s, ML, 1.95, b["name"], b["colour"])
    txt(s, ML, 6.45, 7.4, 0.3, b["proposal_note"], size=12, color=L700, bold=True)
    x = 8.75
    txt(s, x, 2.0, 3.9, 0.3, "Halqa runs", size=15, bold=True, color=L700)
    hair(s, x, 2.38, 3.95, L700)
    txt(s, x, 2.5, 3.95, 1.7,
        ["Hosts, members, circles and the order of turns",
         "Checks on identity, income and affordability",
         "Reminders, late payments and recovery",
         "The ledger, receipts and records"], size=13, after=5)
    txt(s, x, 4.25, 3.9, 0.3, f"{b['short']} runs", size=15, bold=True,
        color=b["colour"])
    hair(s, x, 4.63, 3.95, b["colour"])
    txt(s, x, 4.75, 3.95, 1.7, b["bank_runs"], size=13, after=5)


def product(d, b):
    s = content_slide(d, "The Product", b["product_statement"], b["notes"]["product"],
                      src="Screens from the Halqa application in preview, with sample "
                          "data.")
    items = [("screen_committees.png", "Join a circle",
              "Only circles and turns the member qualifies for"),
             ("screen_autopay.png", "Pay automatically", b["product_pay"]),
             ("screen_activity.png", "Collect the pot",
              "Paid into the member's own account"),
             ("screen_credit.png", "Build a credit record",
              "Every payment scored and reported")]
    phones(s, 1.2, 1.9, 3.75, items, gap=1.3, cap_w=2.85)


def bank_month(d, b):
    s = content_slide(d, b["month_heading"], b["month_statement"],
                      b["notes"]["month"], src=b["month_source"])
    month(s, ML + 0.1, 2.35, 11.6, b["colour"], b["month_events"],
          [(1, 8, L300, "instalment waiting and earning profit"),
           (9, 13, "DDE3D9", "retries")])
    hair(s, ML, 6.12, CW)
    txt(s, ML, 6.2, CW, 0.5, b["month_note"], size=12, color=INK)


def benefit(d, b):
    s = content_slide(d, "Mutual Benefit", b["benefit_statement"],
                      b["notes"]["benefit"], src=b["benefit_source"])
    txt(s, ML, 2.0, 5.6, 0.3, "Customer deposits, Rs billion", size=13, bold=True)
    vbars(s, ML, 2.7, 5.5, 2.75, b["benefit_bars"], b["benefit_vmax"], bar_w=0.75, size=11,
          fmt=lambda v: f"{v:g}", value_size=15, label_h=0.55)
    txt(s, ML, 6.1, 5.6, 0.6, b["benefit_assumption"], size=11, color=GREY,
        spacing=1.0)
    table(s, 6.75, 1.95, [2.5, 3.45], b["fit_rows"],
          header=[f"{b['short']}'s aim or need", "What committee members bring"],
          row_h=0.72, size=13, anchor="m")
