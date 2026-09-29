"""Mashreq Bank Pakistan: every bank specific line of the deck, and speaker notes."""
from charts import table
from theme import INK, L500, L700, num, txt

C = "E0602A"


def cover_panel(s, x):
    table(s, x, 1.95, [1.55, 1.15, 1.1, 1.05], [
        ["Carries the loss", "Mashreq", "the insurer", "the takaful fund"],
        ["Paid through", "the fee", "a premium", "a contribution"],
        ["Islamic window", "Shariah board to rule", "no", "yes"]],
        header=["", "Guarantee", "Insurance", "Takaful"], row_h=0.62, size=12)
    num(s, x, 4.6, 4.85, "About 5.5%", "of each instalment on circles of strangers, "
        "priced for a stress case.", size=28, cap_h=0.6)
    txt(s, x, 5.75, 4.85, 0.5, "Known circles carry no cover.", size=12,
        color="5B6456")


def dot(level, text):
    return ("dot", level, text)


P = {
    "name": "Mashreq Bank Pakistan", "short": "Mashreq", "colour": C,
    "logo": "mashreq_logo.png",
    "title": "Committee savings, held and moved by a bank",
    "subtitle": "A partnership proposal for Mashreq Bank Pakistan",
    "date": "October 2026",
    "summary_statement": "Halqa proposes to run Pakistan's committees on Mashreq "
                         "accounts.",
    "summary_rows": [('The habit',
                      'More than a third of Pakistanis save in committees, in '
                      'cash, outside any bank.'),
                     ('The proposal',
                      'Every member banks with Mashreq. Mashreq holds and moves '
                      'every rupee; Halqa runs the committee.'),
                     ('For Mashreq',
                      'Accounts opened 6 to 20 at a time, deposits, an Islamic '
                      'product and a repayment record to lend against.'),
                     ('For members',
                      'No organiser holding cash, automatic payment, cover against '
                      'default and a credit record.'),
                     ('The request',
                      'Seven decisions, then one live month with about 1,000 '
                      'members.')],
    "committee_end": ('In total, every member pays in Rs 120,000 and takes out Rs '
                      '120,000. No interest.'),
    "proposal_statement": "Halqa is the system. Mashreq is the machine. Every rupee "
                          "stays inside Mashreq.",
    "proposal_note": 'Halqa never holds member money and never lends.',
    "bank_runs": ["Accounts and customer checks", "Direct debits and payouts",
                  "Savings and profit on balances", "Cover and credit reporting"],
    "product_statement": "Members do everything in the Halqa application. Under the "
                         "partnership, the Mashreq account opens inside it.",
    "product_pay": 'Debited by Mashreq on the due date',
    "month_heading": "A Month Inside Mashreq",
    "month_statement": "Each step runs on a Mashreq product. The debit mandate is the "
                       "one new piece.",
    "month_events": [(1,
                      'Payday',
                      "Salary arrives in the member's Mashreq account.",
                      'NEO current account'),
                     (4,
                      'Waiting',
                      'The instalment earns profit for about seven days.',
                      'Islamic Current Profit Account, up to 5%'),
                     (8,
                      'Due date',
                      'Every member is debited; the pot is paid the same day.',
                      'Debit mandate, new; free instant transfer'),
                     (11,
                      'Missed debit',
                      'One retry each morning, five at most.',
                      ''),
                     (30,
                      'Circle ends',
                      'Profit returns to members as points.',
                      'Islamic Savings Account, up to 11.5%')],
    "month_note": ('**Also used.** The Mashreq Pakistan Account, for families in '
                   'the UAE.   **New lines.** Cover for defaults; financing for '
                   'asset circles.'),
    "month_source": "Mashreq NEO product pages and rate sheets, read 29 September 2026; "
                    "rates are up to figures. The due date of the 8th is proposed.",
    "benefit_statement": "100,000 members would add about Rs 2.5 billion of deposits "
                         "and 100,000 accounts.",
    "benefit_bars": [("Mashreq\n30 June 2026", 8.5, C), ("10,000\nmembers", 0.25, L500),
                     ("100,000\nmembers", 2.5, L500),
                     ("1,000,000\nmembers", 25, L700)],
    "benefit_vmax": 25,
    "benefit_assumption": ("Assumes Rs 25,000 average balance a member. Mashreq's "
                           'own figures replace this.'),
    "benefit_source": "Sources   Mashreq Bank Pakistan, half year accounts to 30 June "
                      "2026: deposits Rs 8,515 million, no advances; Mashreq press "
                      "release, 24 November 2025",
    "fit_rows": [['10 million customers in five years',
                  'Accounts opened 6 to 20 at a time'],
                 ['Salaried people and women',
                  'Women join at twice the rate of men'],
                 ['Islamic first banking', 'No interest; one flat fee; takaful'],
                 ['A lending book; no advances yet',
                  'A repayment record for every member'],
                 ['Overseas Pakistanis', 'UAE families in the same circle']],
    "checks_statement": "Mashreq checks the customer. Halqa checks whether the member "
                        "can carry the committee.",
    "checks_account": "CNIC, NADRA biometric check, due diligence, debit mandate",
    "risk_controls": [('Turn bands',
                       'The credit score decides which turns a member may claim.'),
                      ('New members',
                       'The last three turns only, until two clean circles.'),
                      ('Affordability',
                       'All instalments within a third of verified income; 40% '
                       'with other loans.'),
                      ('Commitments',
                       'A signed undertaking and mutual guarantee; 24 hours to '
                       'withdraw.')],
    "late_steps": [('Reminder', 'the evening before'),
                   ('Retries', 'five mornings at most'),
                   ('2% late fee', 'score falls 10'),
                   ('5% late fee', 'score falls 20'),
                   ('10% late fee', 'score falls 40'),
                   ('Set off', "from the member's own pot")],
    "recovery_steps": [("Contact", "hardship plan and a new date"),
                       ("Restrict", "account restricted; score falls 200"),
                       ("Cover pays", "members left short are paid in full"),
                       ("Guarantee", "the whole balance falls due"),
                       ("Civil suit", "on the signed undertaking")],
    "charity_line": 'receives late fees on the Islamic window',
    "cover_heading": "Cover for Defaults",
    "cover_statement": "If an early collector stops paying, cover pays the other "
                       "members in full. Mashreq chooses the form.",
    "cover_word": "cover",
    "cover_source": "Cover pricing model, September 2026: average still owed Rs 55,000; "
                    "stress case of one circle in five losing a fifth of its members "
                    "from the earliest turns.",
    "cover_panel": cover_panel,
    "fees_statement": "One flat fee per instalment, the same for every turn. Mashreq "
                      "collects it and shares its income with Halqa.",
    "earn_rows": [['Members', 'Profit on balances, as points'],
                  ['Mashreq', 'The fee, margin on balances, cover, financing'],
                  ['Halqa', "An agreed share of Mashreq's income"]],
    "fees_model_note": "Halqa's 25 September model, before Mashreq's terms.",
    "fees_source": "Business Model and Unit Costs, 25 September 2026; cover pricing "
                   "model, September 2026. The fee rises with the instalment and the "
                   "number of members.",
    "comp_statement": "Only Halqa with Mashreq has a bank holding the money, one price "
                      "for every turn and a credit record.",
    "comp_rows": [
        ["Who holds the money", dot("full", "Mashreq, a licensed bank"),
         dot("half", "the organiser's wallet"), dot("none", "Oraan's own accounts"),
         dot("none", "the organiser")],
        ["Price of an early turn", dot("full", "one flat fee"),
         dot(None, "not published"), dot("none", "up to 21% of the instalment a "
                                         "month [1]"), dot("full", "usually none")],
        ["Payout", dot("full", "automatic, the same day"),
         dot("none", "by hand, by the organiser [2]"), dot("half", "11th to 18th"),
         dot("none", "by hand")],
        ["Members checked", dot("full", "identity, income, score"),
         dot("none", "phone contacts"), dot("half", "device data, bureau"),
         dot("half", "people known")],
        ["Defaults covered", dot("full", "cover chosen by the bank"),
         dot(None, "not stated"), dot("half", "Oraan's balance sheet"),
         dot("none", "organiser's pocket")],
        ["Credit record", dot("full", "every payment"), dot("none", "none"),
         dot("half", "defaulters only"), dot("none", "none")],
        ["A way out", dot("full", "five set routes"), dot("none", "none until the end"),
         dot("half", "before payout"), dot("half", "organiser's discretion")]],
    "evidence_statement": "Digital committees have scaled abroad. Each worked with a "
                          "regulator or a bank first.",
    "evidence_rows": [
        ("Money Fellows", "Egypt", 2016, [(2025, "profitable", False)],
         "8.5 million users"),
        ("Hakbah", "Saudi Arabia", 2018, [(2020, "central bank approval", False),
                                          (2023, "Series A", False)], "500,000+ users"),
        ("Esusu", "United States", 2018, [(2022, "US$1 billion value", False)],
         "US$1.2 billion value"),
        ("The Money Club", "India", 2016, [], "about 200,000 users")],
    "why_rows": [("69 million", "mobile wallet users at the end of 2024 [1]"),
                 ("Aug 2026", "JazzCash launched a committee feature; the pot sits in "
                  "the organiser's wallet [2]"),
                 ("75% by 2028", "national target for adults with a financial "
                  "account, up from 64% in 2023 [3]")],
    "why_source": "Sources   1  State Bank of Pakistan payment systems reviews, FY2025 "
                  "and Q3 FY2026   2  JazzCash release notes, August 2026   "
                  "3  National Financial Inclusion Strategy 2024 to 2028",
    "ready_statement": "The application is built. State Bank regulation comes through "
                       "Mashreq's licence.",
    "ready_rows": [('Built',
                    'Application and decision engines, live since 20 July 2026, '
                    'closed to the public; payments in test mode.'),
                   ('Connection',
                    'Seven messages with Mashreq, from account opening to the '
                    'daily statement.'),
                   ('Security',
                    'No card numbers, passwords or banking credentials stored by '
                    'Halqa.'),
                   ('To do',
                    'Incorporation, the agreement and the Mashreq connection.')],
    "pilot_cols": [('Scope',
                    'Up to 100 known circles, about 1,000 members, all with '
                    'Mashreq accounts, on the Islamic window.'),
                   ('Measured',
                    'Accounts, balances, on time debits, same day payouts, circles '
                    'per host, complaints, cost per member.'),
                   ('Then',
                    'Circles of strangers, asset circles, UAE families, then '
                    'Hyper.')],
    "requests_statement": "Seven decisions to start.",
    "requests": ['Approve the partnership, with Halqa as service provider under '
                 'the outsourcing framework.',
                 'Take the product to the State Bank for approval or notice.',
                 'Approve it for the Islamic window through the Shariah board.',
                 'Open accounts and debit mandates inside the Halqa application.',
                 'Hold instalments in the Islamic Current Profit Account; return '
                 'profit as points.',
                 'Choose the cover and the credit reporting route.',
                 'Agree the income share and a one month pilot.'],
    "close_line": "Committees run by Halqa, on Mashreq accounts.",
    "appendix_list": ["Risks and controls", "Integration", "Points and the turn market",
                      "Hyper: daily circles", "Leaving a circle", "Unit costs"],
}

from bank_mashreq_more import MORE  # noqa: E402

P.update(MORE)
