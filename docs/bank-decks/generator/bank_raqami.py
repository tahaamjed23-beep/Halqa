"""Raqami Islamic Digital Bank: bank specific lines, the Shariah structure slide.

Raqami's logo is not used: its download has not been approved. Its name is set in
type and its elements are drawn in ink."""
from charts import table
from theme import CW, L500, L700, ML, content_slide, hair, txt

from bank_mashreq import P as M, dot

C = "3B4148"


def cover_panel(s, x):
    rows = [("How it works", "Each instalment carries a small takaful contribution. "
             "The fund pays members left short, in their own names."),
            ("Operator", "Raqami's takaful partner EFU, or another operator. None "
             "contracted for committees."),
            ("Price", "About 5.5% of the instalment on circles of strangers, priced "
             "for a stress case."),
            ("Known circles", "No takaful needed.")]
    y = 1.98
    for head, body in rows:
        hair(s, x, y, 4.85)
        txt(s, x, y + 0.1, 4.85, 1.0, f"**{head}.** {body}", size=13, spacing=1.05)
        y += 1.0
    hair(s, x, y, 4.85)


def shariah(d, b):
    s = content_slide(d, "Shariah Structure", "Each part of the committee rests on one "
                      "contract. None of them carries interest.", b["notes"]["shariah"],
                      src="Structure proposed by Halqa for review. No Shariah board has "
                          "ruled on it yet.")
    rows = [
        ["Instalments", "Qard", "Each member lends to the member collecting, without "
         "interest, and is repaid by the later instalments. Every member takes out "
         "exactly what they paid in."],
        ["Service fee", "Ujrah", "A flat fee for running the committee, the same for "
         "every turn, never linked to how early the pot is taken."],
        ["Waiting balance", "Mudarabah", "The instalment sits in a term deposit until "
         "the due date. Profit is shared; the members' share returns as points."],
        ["Cover", "Takaful", "Members contribute to a takaful fund that pays any member "
         "left short."],
        ["Late payment", "Charity", "Penalties are paid to charity. Neither Raqami nor "
         "Halqa keeps them."],
        ["Changing turns", "Swap only", "Members may swap turns. A turn is never sold "
         "for money or points."],
        ["Points", "Reward", "Earned for paying on time and finishing a circle. Never "
         "bought with money."]]
    table(s, ML, 1.9, [2.2, 1.7, CW - 3.9], rows,
          header=["Part of the committee", "Contract", "How it works"], row_h=0.56,
          size=13, head_size=13)
    txt(s, ML, 6.42, CW, 0.3, "Every part is subject to the ruling of Raqami's Shariah "
        "Board.", size=14, bold=True, color=L700)


P = dict(M)
P.update({
    "name": "Raqami Islamic Digital Bank", "short": "Raqami", "colour": C,
    "logo": None, "title_size": 36,
    "title": "Committee savings, held and moved by an Islamic bank",
    "subtitle": "A partnership proposal for Raqami Islamic Digital Bank",
    "summary_statement": "Halqa proposes to run Pakistan's committees on Raqami "
                         "accounts.",
    "summary_rows": [('The habit',
                      'More than a third of Pakistanis save in committees: no '
                      'interest, all cash, outside any bank.'),
                     ('The proposal',
                      'Every member banks with Raqami. Raqami holds and moves '
                      'every rupee; Halqa runs the committee.'),
                     ('For Raqami',
                      'Accounts opened 6 to 20 at a time, deposits, a product '
                      'without interest and a repayment record to finance '
                      'against.'),
                     ('For members',
                      'No organiser holding cash, automatic payment, takaful '
                      'against default and a credit record.'),
                     ('The request',
                      'Seven decisions, including a Shariah Board ruling, then one '
                      'live month with about 1,000 members.')],
    "committee_end": ('In total, every member pays in Rs 120,000 and takes out Rs '
                      '120,000: an interest free loan between members.'),
    "proposal_statement": "Halqa is the system. Raqami is the machine. Every rupee "
                          "stays inside Raqami.",
    "bank_runs": ["Accounts and customer checks", "Debits and payouts",
                  "Term deposits and profit sharing", "Takaful cover and credit "
                  "reporting"],
    "product_statement": "Members do everything in the Halqa application. Under the "
                         "partnership, the Raqami account opens inside it.",
    "product_pay": 'Debited by Raqami on the due date',
    "month_heading": "A Month Inside Raqami",
    "month_statement": "Each step runs on a Raqami product. Automatic debit is the one "
                       "new piece.",
    "month_events": [(1,
                      'Payday',
                      "Salary arrives in the member's Raqami account.",
                      'Raqami current account'),
                     (4,
                      'Waiting',
                      'The instalment earns a share of profit for seven days.',
                      '7 day term deposit, on mudarabah'),
                     (8,
                      'Due date',
                      'Every member is debited; the pot is paid the same day.',
                      'Automatic debit, new; free Raqami transfers'),
                     (11,
                      'Missed debit',
                      'One retry each morning, five at most. Penalties go to '
                      'charity.',
                      ''),
                     (30,
                      'Circle ends',
                      "Members' profit returns as points.",
                      'Saving Pots')],
    "month_note": ('**Cash earners.** Free cash deposits at over 700 Askari Bank '
                   'branches.   **New lines.** Takaful for committees; Islamic '
                   'financing for asset circles.'),
    "month_source": "Raqami product pages and FAQ, read 29 September 2026. The due date "
                    "of the 8th is proposed; the 7 day term fits where payday is at "
                    "least seven days before it.",
    "benefit_statement": "100,000 members would add about Rs 2.5 billion of deposits, "
                         "more than Raqami held at 30 June 2026.",
    "benefit_bars": [("Raqami\n30 June 2026", 1.58, C), ("10,000\nmembers", 0.25, L500),
                     ("100,000\nmembers", 2.5, L700)],
    "benefit_vmax": 2.5,
    "benefit_assumption": ('Assumes Rs 25,000 average balance a member; 1,000,000 '
                           'members would hold about Rs 25 billion.'),
    "benefit_source": "Sources   Raqami Islamic Digital Bank, half year report to 30 "
                      "June 2026: deposits Rs 1,581 million, 114,452 accounts, Islamic "
                      "financing Rs 27.6 million; press reports of Raqami's plans, 2026",
    "fit_rows": [['1 million customers in three years',
                  'Accounts opened 6 to 20 at a time'],
                 ['Women, students, farmers, freelancers',
                  'The people who already save this way'],
                 ['Only Shariah compliant products', 'No interest by design'],
                 ['Financing of Rs 27.6 million so far',
                  'A repayment record for every member'],
                 ['Free cash deposits at Askari Bank', 'Cash earners pay in cash']],
    "checks_statement": "Raqami checks the customer. Halqa checks whether the member "
                        "can carry the committee.",
    "checks_account": "CNIC, NADRA biometric check, due diligence",
    "late_steps": [('Reminder', 'the evening before'),
                   ('Retries', 'five mornings at most'),
                   ('2% penalty', 'score falls 10'),
                   ('5% penalty', 'score falls 20'),
                   ('10% penalty', 'score falls 40'),
                   ('Set off', "from the member's own pot")],
    "recovery_steps": [("Contact", "hardship plan and a new date"),
                       ("Restrict", "account restricted; score falls 200"),
                       ("Takaful pays", "members left short are paid in full"),
                       ("Guarantee", "the whole balance falls due"),
                       ("Civil suit", "on the signed undertaking")],
    "charity_line": 'receives every late penalty',
    "cover_heading": "Takaful for Defaults",
    "cover_statement": "If an early collector stops paying, takaful pays the other "
                       "members in full.",
    "cover_word": "takaful",
    "cover_source": "Takaful pricing model, September 2026: stress case of one circle "
                    "in five losing a fifth of its members from the earliest turns. EFU "
                    "and Raqami partnership, November 2025.",
    "cover_panel": cover_panel,
    "fees_statement": "One flat service fee (ujrah), the same for every turn. Raqami "
                      "collects it and shares its income with Halqa.",
    "earn_rows": [['Members', 'Their share of profit, as points'],
                  ['Raqami', 'The fee, its share of profit, takaful, financing'],
                  ['Halqa', "An agreed share of Raqami's income"]],
    "fees_source": "Business Model and Unit Costs, 25 September 2026; takaful pricing model, September 2026. The fee rises with the instalment and the number of members.",
    "fees_model_note": "Halqa's 25 September model, before Raqami's terms.",
    "comp_statement": "Only Halqa with Raqami has an Islamic bank holding the money, "
                      "one fee for every turn and a credit record.",
    "evidence_statement": "Digital committees scaled first in Saudi Arabia and Egypt, "
                          "each with a regulator or a bank.",
    "evidence_rows": [M["evidence_rows"][1], M["evidence_rows"][0],
                      M["evidence_rows"][2], M["evidence_rows"][3]],
    "why_rows": M["why_rows"] + [("1 Jan 2028", "the constitutional deadline to end "
                                  "riba in Pakistan [4]")],
    "why_source": M["why_source"] + "   4  Constitution of Pakistan, Article 38(f), "
                                    "26th Amendment",
    "ready_statement": "The application is built. State Bank regulation comes through "
                       "Raqami's licence.",
    "ready_rows": [('Built',
                    'Application and decision engines live since 20 July 2026; '
                    'closed to the public; payments in a test environment.'),
                   ('Connection',
                    "Seven messages through Raqami's open platform, from account "
                    'opening to the daily statement.'),
                   ('Shariah',
                    "Each part set out for Raqami's Shariah Board before launch."),
                   ('To do',
                    'Incorporation, the agreement and the Raqami connection.')],
    "pilot_cols": [('Scope',
                    'Up to 100 known circles, about 1,000 members, all with Raqami '
                    'accounts.'),
                   ('Measured',
                    'Accounts, balances, on time debits, same day payouts, circles '
                    'per host, complaints, cost per member.'),
                   ('Then', 'Circles of strangers, asset circles, then Hyper.')],
    "requests": ['Approve the partnership, with Halqa as service provider under '
                 'the outsourcing framework.',
                 'Take the committee structure to the Shariah Board for a ruling.',
                 'Take the product to the State Bank for approval or notice.',
                 'Open accounts and automatic debits inside the Halqa application.',
                 'Place instalments in the 7 day term deposit; return profit as '
                 'points.',
                 'Arrange takaful cover and the credit reporting route.',
                 'Agree the income share and a one month pilot.'],
    "close_line": "Committees run by Halqa, on Raqami accounts.",
    "appendix_list": ["Risks and controls", "Integration", "Points and turn swaps",
                      "Hyper: daily circles", "Leaving a circle", "Unit costs"],
    "leaving_fine": "Fines go to charity; neither Raqami nor Halqa keeps them.",
})
P["comp_rows"] = [list(r) for r in M["comp_rows"]]
P["comp_rows"][0][1] = dot("full", "Raqami, an Islamic bank")
P["comp_rows"][4][1] = dot("full", "takaful through the bank")

from bank_raqami_more import MORE  # noqa: E402

P.update(MORE)
