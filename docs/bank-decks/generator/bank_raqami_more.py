"""Raqami deck: committee types, appendix rows and speaker notes."""
from bank_mashreq_more import F, T, ctype

TYPES = [
    ctype("Known", "family, colleagues, neighbours", "6 to 12", "Rs 2,000 to 10,000",
          "monthly or weekly", F, F, F, F, "pilot"),
    ctype("Strangers", "matched by Halqa", "12", "Rs 10,000", "monthly", T, T, T, T,
          "after the pilot"),
    ctype("Large, strangers", "traders and larger savers", "20", "Rs 25,000",
          "monthly", T, T, T, T, "after the pilot"),
    ctype("Asset", "buying a motorcycle or machine", "12", "Rs 10,000", "monthly",
          T, T, T, T, "after the pilot"),
    ctype("Hyper", "daily earners: drivers, riders, traders", "390 to 400",
          "Rs 450 to 500 a day", "daily", T, T, T, T, "experimental"),
]
for t in TYPES:
    t["Takaful"] = t.pop("Cover")

MORE = {
    "types": TYPES,
    "type_rows": ["Who", "Members", "Instalment", "Frequency", "Income checked",
                  "Automatic debit", "Takaful", "Credit report read", "Stage"],
    "risk_rows": [
        ["Credit", "Turn bands on every turn; affordability limits; arrears set off "
         "from the late member's own pot; takaful for circles of strangers; no daily "
         "circle opens once losses would exceed cover."],
        ["Fraud and money laundering", "Raqami's due diligence at account opening; "
         "payouts only to accounts in the member's own name; fixed amounts on a fixed "
         "schedule; review of turn swaps."],
        ["Technology and outsourcing", "An agreement under the State Bank's outsourcing "
         "framework; security testing; audit logs on both sides; inspection rights for "
         "Raqami and the State Bank."],
        ["Conduct", "Instalments within a third of income; the full cost shown before "
         "joining; 24 hours to withdraw; recovery by stated steps, never by "
         "harassment."],
        ["Shariah", "Every part ruled on by the Shariah Board before launch; penalties "
         "to charity; turns swapped, never sold; points never bought with money."],
        ["Reputation", "New members start in the last turns; published rules for every "
         "circle; Hyper labelled experimental; no public list of defaulters."]],
    "security_rows": [
        ("Messages", "Signed and encrypted, with audit logs on both sides."),
        ("Credentials", "Halqa stores no card number, password, banking credential or "
         "face image."),
        ("Access", "Least privilege for staff and systems; penetration tests every "
         "year."),
        ("Data", "Hosted where Raqami and the State Bank require; the database moves "
         "to Pakistan if asked."),
        ("Agreement", "Service levels, audit and inspection rights, complaints, "
         "continuity and exit."),
        ("Back up", "Card, wallet or Raast through Safepay, a licensed payment "
         "service provider, for money coming from other banks.")],
    "points_heading": "Points and Turn Swaps",
    "points_statement": "Points are earned, never bought. Turns may be swapped, never "
                        "sold.",
    "points_rows": [["Paid on time", "60 points"], ["Five on time in a row", "100 more"],
                    ["Hosting a clean circle", "2,500"],
                    ["Referral who completes a circle", "1,000"],
                    ["Share of profit on balances", "1 point a rupee"],
                    ["Spent on", "goods and fees"]],
    "points_rules": "Never cashed out and never sold. The rupee value of earned points "
                    "is set before launch, subject to the Shariah Board.",
    "turn_heading": "Turn swaps",
    "turn_steps": [("Ask", "a member asks to swap"), ("Match", "a willing member"),
                   ("Check", "both bands allow it"), ("Approve", "the host agrees"),
                   ("Swap", "turns change; no money")],
    "turn_rules": [
        ("Where", "Monthly circles only; never on Hyper or asset circles."),
        ("Price", "None. A turn is never sold for money or points."),
        ("Checks", "Both members re-checked for their new turns before the swap."),
        ("Record", "Every swap is recorded on the circle's ledger.")],
    "points_source": "Seat exchange and points design, 25 September 2026, restricted "
                     "here to what an Islamic bank can offer.",
    "hyper_rows": [
        ("Who", "Drivers, riders and traders paid daily, often through employers and "
         "associations as hosts."),
        ("Cash", "Members paid in cash deposit it free at over 700 Askari Bank "
         "branches."),
        ("Entry", "Rs 1,000 or more received on five days a week for eight weeks; two "
         "clean circles; one Hyper circle at a time."),
        ("Always", "Automatic debit and takaful for every member; one flat fee, never "
         "graded by the day of collection."),
        ("Hard stop", "No new day opens once unrecovered losses would exceed the "
         "takaful cover. Penalties go to charity.")],
    "route_rows": [
        ["Member fee", "Rs 100 to 500, to Halqa", "Collected by Raqami as ujrah"],
        ["Halqa income", "Fees and takaful commission", "An agreed share of Raqami's "
         "income"],
        ["Collection", "1%, capped at Rs 10 a debit, through Safepay", "A transfer "
         "inside one bank, near nil"],
        ["Cover", "Takaful, Halqa as agent", "Takaful arranged through Raqami"],
        ["Credit reports", "Rs 200 a report", "Reported through Raqami, or by Halqa"]],
}

NOTES = {
    "title": "Halqa runs committees, the rotating savings groups most Pakistani "
             "families already use. A committee carries no interest by design. This "
             "proposal asks Raqami to hold and move every rupee, while Halqa runs the "
             "committee itself.",
    "summary": "Five points carry the proposal. The habit exists, carries no interest "
               "and moves in cash. Every member banks with Raqami and Raqami moves all "
               "the money; Halqa provides the rules and the technology. Raqami gains "
               "accounts, deposits and a financing record; members gain safety and a "
               "credit history. The request is seven decisions, including a Shariah "
               "Board ruling, and a one month pilot.",
    "committee": "Twelve members each pay Rs 10,000 a month. Each month one of them "
                 "takes the pot of Rs 120,000. Every member pays in exactly what they "
                 "take out, so each instalment is an interest free loan between "
                 "members, repaid by the instalments that follow.",
    "market": "Participation estimates range from 34 per cent (Karandaaz) to 41 per "
              "cent (Oraan) of Pakistanis, with about Rs 4 trillion estimated to rotate "
              "each year. Among savers, 63 per cent keep cash at home, 33 per cent use "
              "a committee and only 4 per cent use a bank. Women take part at twice the "
              "rate of men.",
    "problem": "In the informal committee one person holds everyone's money and the "
               "record is a notebook. Twelve per cent of committee users report losing "
               "money to fraud; in 2022 one organiser took about Rs 420 million from 117 "
               "committees. Years of paying on time build no credit record.",
    "proposal": "The money never leaves Raqami. Each instalment is debited from the "
                "member's own Raqami account into the circle's account, and the pot "
                "goes to the collector's account the same day. Halqa sends the "
                "instructions and keeps the records; Raqami executes and confirms each "
                "step.",
    "product": "One application for the member: join a circle and pick a turn the "
               "member qualifies for, authorise the debit once, receive the pot in the "
               "member's own account, and build a credit record. Under the "
               "partnership, Raqami's account opening runs inside the application. The "
               "screens are the current preview with sample data.",
    "month": "Salary arrives, the instalment is placed in Raqami's 7 day term deposit "
             "and earns a share of profit, and Raqami debits it on the due date and "
             "pays the pot the same day. Members paid in cash can deposit it free at "
             "Askari Bank branches. When the circle ends, profit returns to members as "
             "points, and Saving Pots can hold what comes next. Automatic debit is "
             "the one new product Raqami would add.",
    "benefit": "On stated assumptions, 100,000 members bring about Rs 2.5 billion of "
               "deposits, more than the Rs 1.58 billion Raqami held at 30 June 2026, "
               "and nearly double its 114,452 accounts. Each circle opens 6 to 20 "
               "accounts at once. The assumption of Rs 25,000 average balance should be "
               "replaced by Raqami's own figures.",
    "checks": "Raqami opens the account with its own checks: CNIC and mobile number, "
              "NADRA biometric and due diligence. Halqa then checks identity, income "
              "and affordability and computes a credit score from 300 to 850. The "
              "member sees only the circles and turns open to them. Halqa stores "
              "results only.",
    "types": "Known circles are family, colleagues or neighbours; checks are light and "
             "there is no takaful. Circles of strangers, large circles and asset "
             "circles carry full checks, automatic debit and takaful. Hyper is a daily "
             "circle for daily earners, labelled experimental. Raqami serves residents "
             "only, so circles with members abroad are left out. The pilot uses known "
             "circles only.",
    "risk": "The only real risk in a committee is a member who collects early and then "
            "stops paying. The member at turn 1 of 12 still owes Rs 110,000; the member "
            "at turn 12 owes nothing. Early turns are reserved for credit scores of 650 "
            "and above, and every new member starts in the last three turns.",
    "recovery": "Any missed payment gets a reminder, up to five retries, then "
                "penalties of 2, 5 and 10 per cent, all paid to charity, with falls in "
                "the credit score. A member who has not collected cannot cause a loss. "
                "For a member who collected and then stopped: contact and a hardship "
                "plan, restriction, takaful pays the others, then the guarantee and a "
                "civil suit.",
    "cover": "If the member at turn 1 stops paying, each later pot would be Rs 10,000 "
             "short. Takaful pays that shortfall, so every other member still receives "
             "Rs 120,000. The contribution is about 5.5 per cent of the instalment on "
             "circles between strangers, set on a stress case. Raqami already works "
             "with EFU for takaful on its cards.",
    "shariah": "Each part of the committee has one contract. Instalments are qard, an "
               "interest free loan between members. The fee is ujrah, a flat charge "
               "for the service, the same for every turn. Money waiting for the due "
               "date sits in a mudarabah term deposit. Cover is takaful. Penalties go "
               "to charity. Turns may be swapped but never sold, and points are never "
               "bought. Raqami's Shariah Board rules on every part.",
    "fees": "On a circle between strangers the member pays Rs 11,047 an instalment: "
            "Rs 10,000 to the collector, Rs 547 of takaful contribution and a fee of up "
            "to Rs 500. The fee is the same for every turn, so it is a charge for the "
            "service and never a price for early money. Raqami collects it and shares "
            "income with Halqa.",
    "competition": "JazzCash launched a committee feature in August 2026, but the pot "
                   "sits in the organiser's wallet. Oraan charges the first turn up to "
                   "21 per cent of the instalment a month, a price for early money. "
                   "Halqa with Raqami is the only option where an Islamic bank holds "
                   "the money, every turn pays one flat fee and every payment builds a "
                   "credit record.",
    "evidence": "Hakbah in Saudi Arabia launched after approval from the Saudi "
                "central bank and raised a Series A in 2023. Money Fellows in Egypt "
                "started inside the central bank's sandbox and became profitable in "
                "2025. Among 25 earlier attempts, every failure held money without a "
                "licence or guaranteed payouts it could not carry.",
    "why_now": "Digital payments rose from 78 to 92 per cent of retail payments in "
               "three years, and savings have not followed. JazzCash's committee launch "
               "shows the category is moving now. The Constitution sets 1 January 2028 "
               "to end riba, and a committee is an interest free product by design.",
    "readiness": "The application and its decision engines have run live since 20 July "
                 "2026, closed to the public, with payments in a test environment. "
                 "Halqa becomes Raqami's service provider under the State Bank's "
                 "outsourcing framework, and connects through Raqami's open platform. "
                 "Still to do: incorporation, the agreement and the connection.",
    "pilot": "About eight weeks for the agreement, the Shariah Board ruling, approvals "
             "and connection, then one live month with up to 100 known circles and "
             "about 1,000 members, then a review and a decision to scale.",
    "requests": "The first three decisions are approvals: the partnership, the Shariah "
                "Board ruling and the State Bank route. The next two are products: "
                "accounts and automatic debits inside the application, and the term "
                "deposit for waiting instalments. The last two are commercial: takaful "
                "and credit reporting, and the income share with a one month pilot.",
    "close": "Halqa is the system; the bank is the machine. Committees run by Halqa, "
             "on Raqami accounts, under Raqami's licence and its Shariah Board.",
    "appendix": "Reference pages for questions on risk, integration, points and turn "
                "swaps, Hyper, leaving a circle and unit costs.",
    "risks": "Each risk Raqami would carry, with the control that answers it.",
    "integration": "Seven messages connect Halqa and Raqami. Halqa sends instructions; "
                   "Raqami executes and confirms; Halqa reconciles its ledger against "
                   "Raqami's statement every morning. No money passes through Halqa.",
    "points": "For an Islamic bank the points and turn features are restricted: points "
              "are earned and never bought, and turns may be swapped but never sold. "
              "Both stay subject to the Shariah Board.",
    "hyper": "Hyper is a daily circle for people paid daily. Option 1: 400 members "
             "over 50 days, eight collecting each day, Rs 450 a day. Option 2: 390 "
             "members over 26 days, fifteen collecting each day, Rs 500 a day. Members "
             "paid in cash can deposit at Askari Bank branches. It is labelled "
             "experimental.",
    "leaving": "There is no cancel button. Inside the 24 hour window a member leaves "
               "freely. After that the preferred route is a substitute who takes the "
               "turn. A group vote allows exit with a fine of one instalment, paid to "
               "charity; hardship waives the fine. Money comes back at the end of the "
               "circle, without profit.",
    "unit_costs": "Prices used in the 25 September model, and how each line changes "
                  "when Raqami collects the fee and holds the money.",
}

MORE["notes"] = NOTES
