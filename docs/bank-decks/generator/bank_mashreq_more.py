"""Mashreq deck: committee types, appendix rows and speaker notes."""

T, F = True, False


def ctype(name, who, members, inst, freq, income, auto, cover, credit, stage):
    return {"name": name, "Who": who, "Members": members, "Instalment": inst,
            "Frequency": freq, "Income checked": income, "Automatic debit": auto,
            "Cover": cover, "Credit report read": credit, "Stage": stage}


TYPES = [
    ctype("Known", "family, colleagues, neighbours", "6 to 12", "Rs 2,000 to 10,000",
          "monthly or weekly", F, F, F, F, "pilot"),
    ctype("Strangers", "matched by Halqa", "12", "Rs 10,000", "monthly", T, T, T, T,
          "after the pilot"),
    ctype("Large, strangers", "traders and larger savers", "20", "Rs 25,000",
          "monthly", T, T, T, T, "after the pilot"),
    ctype("Asset", "buying a motorcycle or machine", "12", "Rs 10,000", "monthly",
          T, T, T, T, "after the pilot"),
    ctype("UAE family", "families in the UAE and Pakistan", "6 to 12", "any amount",
          "monthly", F, T, F, F, "after the pilot"),
    ctype("Hyper", "daily earners: drivers, riders, traders", "390 to 400",
          "Rs 450 to 500 a day", "daily", T, T, T, T, "experimental"),
]

MORE = {
    "types": TYPES,
    "leaving_fine": "Fines go 70% to the remaining members and 30% to "
                    "administration; to charity on the Islamic window.",
    "risk_rows": [
        ["Credit", "Turn bands on every turn; affordability limits; arrears set off "
         "from the late member's own pot; cover chosen by Mashreq; no daily circle "
         "opens once losses would exceed cover."],
        ["Fraud and money laundering", "Mashreq's due diligence at account opening; "
         "payouts only to accounts in the member's own name; fixed amounts on a fixed "
         "schedule; review of turn trades."],
        ["Technology and outsourcing", "An agreement under the State Bank's outsourcing "
         "framework; security testing; audit logs on both sides; inspection rights for "
         "Mashreq and the State Bank."],
        ["Conduct", "Instalments within a third of income; the full cost shown before "
         "joining; 24 hours to withdraw; recovery by stated steps, never by "
         "harassment."],
        ["Shariah", "One flat fee; a takaful option; late fees to charity on the "
         "Islamic window; features outside the Shariah board's approval are labelled."],
        ["Reputation", "New members start in the last turns; published rules for every "
         "circle; Hyper labelled experimental; no public list of defaulters."]],
    "security_rows": [
        ("Messages", "Signed and encrypted, with audit logs on both sides."),
        ("Credentials", "Halqa stores no card number, password, banking credential or "
         "face image."),
        ("Access", "Least privilege for staff and systems; penetration tests every "
         "year."),
        ("Data", "Hosted where Mashreq and the State Bank require; the database moves "
         "to Pakistan if asked."),
        ("Agreement", "Service levels, audit and inspection rights, complaints, "
         "continuity and exit."),
        ("Back up", "Card, wallet or Raast through Safepay, a licensed payment "
         "service provider, for money coming from other banks.")],
    "points_heading": "Points and the Turn Market",
    "points_statement": "Two features that need Mashreq's product approval and a legal "
                        "view before launch.",
    "points_rows": [["Paid on time", "60 points"], ["Five on time in a row", "100 more"],
                    ["Hosting a clean circle", "2,500"],
                    ["Referral who completes a circle", "1,000"],
                    ["Profit on balances", "1 point a rupee"],
                    ["Spent on", "goods, fees and turns"]],
    "points_rules": "Never cashed out. Points bought with money run only as Mashreq's "
                    "own stored value product, under its licence. The rupee value of "
                    "earned points is set before launch.",
    "turn_heading": "Turn market",
    "turn_steps": [("List", "seller sets a price"), ("Offer", "buyer's band allows it"),
                   ("Accept", "seller confirms"), ("Approve", "the host agrees"),
                   ("Settle", "turns swap at Mashreq")],
    "turn_rules": [
        ("Where", "Monthly circles only; never on Hyper or asset circles."),
        ("Checks", "Both members re-checked for their new turns before the trade "
         "settles."),
        ("Limits", "A price ceiling on each turn; an exchange fee paid by the buyer."),
        ("Open points", "Counsel to confirm whether a sold turn is lending between "
         "members. Circles with turn sales are not labelled Shariah compliant.")],
    "points_source": "Decisions of 28 September 2026; seat exchange and points design, "
                     "25 September 2026.",
    "hyper_rows": [
        ("Who", "Drivers, riders and traders paid daily, often through employers and "
         "associations as hosts."),
        ("Entry", "Rs 1,000 or more received on five days a week for eight weeks; two "
         "clean circles; one Hyper circle at a time."),
        ("Always", "Automatic debit and cover for every member; one flat fee, never "
         "graded by the day of collection."),
        ("Hard stop", "No new day opens once unrecovered losses would exceed the "
         "cover."),
        ("Late fees", "5%, 10% and 15% at 12, 36 and 60 hours.")],
    "route_rows": [
        ["Member fee", "Rs 100 to 500, to Halqa", "Collected by Mashreq as its income"],
        ["Halqa income", "Fees and takaful commission", "An agreed share of Mashreq's "
         "income"],
        ["Collection", "1%, capped at Rs 10 a debit, through Safepay", "A transfer "
         "inside one bank, near nil"],
        ["Cover", "Takaful, Halqa as agent", "Mashreq's choice of form"],
        ["Credit reports", "Rs 200 a report", "Through Mashreq's TASDEEQ membership"]],
}

NOTES = {
    "title": "Halqa runs committees, the rotating savings groups most Pakistani "
             "families already use. This proposal asks Mashreq to hold and move every "
             "rupee, while Halqa runs the committee itself.",
    "summary": "Five points carry the proposal. The habit exists and moves in cash. "
               "Every member banks with Mashreq and Mashreq moves all the money; Halqa "
               "provides the rules and the technology. Mashreq gains accounts, deposits "
               "and a lending record; members gain safety and a credit history. The "
               "request is seven decisions and a one month pilot of about 1,000 "
               "members.",
    "committee": "Twelve members each pay Rs 10,000 a month. Each month one of them "
                 "takes the pot of Rs 120,000. The first member receives an advance "
                 "without interest; the last member saves with discipline. Over twelve "
                 "months everyone pays in exactly what they take out, which is why a "
                 "committee carries no interest.",
    "market": "Participation estimates range from 34 per cent (Karandaaz) to 41 per "
              "cent (Oraan) of Pakistanis, with about Rs 4 trillion estimated to rotate "
              "each year. Among savers, 63 per cent keep cash at home, 33 per cent use "
              "a committee and only 4 per cent use a bank or other formal institution. "
              "Women take part at twice the rate of men.",
    "problem": "In the informal committee one person holds everyone's money and the "
               "record is a notebook. Twelve per cent of committee users report losing "
               "money to fraud; in 2022 one organiser took about Rs 420 million from 117 "
               "committees. The member who collects early may stop paying, and years of "
               "paying on time build no credit record.",
    "proposal": "The money never leaves Mashreq. Each instalment is debited from the "
                "member's own Mashreq account into the circle's account, and the pot "
                "goes to the collector's Mashreq account the same day. Halqa sends the "
                "instructions and keeps the records; Mashreq executes and confirms each "
                "step. Halqa's own account receives only its agreed share of income.",
    "product": "One application for the member: join a circle and pick a turn the "
               "member qualifies for, authorise the debit once, receive the pot in the "
               "member's own account, and build a credit record from every payment. "
               "Under the partnership, Mashreq's account opening screens run inside "
               "the application. The screens shown are the current preview with sample "
               "data.",
    "month": "Salary arrives, the instalment waits about seven days in the Islamic "
             "Current Profit Account and earns profit, and Mashreq debits it on the due "
             "date and pays the pot the same day. A failed debit is retried each "
             "morning for up to five days before late fees apply. When the circle ends, "
             "the profit returns to members as points. The debit mandate is the one "
             "new product Mashreq would add. The due date of the 8th is proposed.",
    "benefit": "On stated assumptions, 100,000 members bring about Rs 2.5 billion of "
               "deposits, against Rs 8.5 billion Mashreq held at 30 June 2026. The "
               "assumption is an average balance of Rs 25,000 a member once salaries "
               "move to Mashreq; Mashreq's own data should replace it. Each circle "
               "opens 6 to 20 accounts at once, and the repayment records give Mashreq "
               "a base to start lending.",
    "checks": "Mashreq opens the account with its own checks: CNIC, NADRA biometric "
              "and due diligence, and the member authorises the debit mandate. Halqa "
              "then checks identity, income and affordability and computes a credit "
              "score from 300 to 850. The member sees only the circles and turns open "
              "to them. Halqa stores results only.",
    "types": "Known circles are family, colleagues or neighbours; the group knows its "
             "members, so checks are light and there is no cover. Circles of strangers, "
             "large circles and asset circles carry full checks, automatic debit and "
             "cover. UAE family circles join relatives abroad through Mashreq's non "
             "resident accounts. Hyper is a daily circle for daily earners, labelled "
             "experimental. The pilot uses known circles only.",
    "risk": "The only real risk in a committee is a member who collects early and then "
            "stops paying. The member at turn 1 of 12 still owes Rs 110,000; the member "
            "at turn 12 owes nothing. So early turns are reserved for credit scores of "
            "650 and above, and every new member starts in the last three turns. "
            "Instalments are capped at a third of verified income, stricter than the "
            "State Bank's 40 per cent limit for consumer loans.",
    "recovery": "Any missed payment gets a reminder, up to five retries, then late fees "
                "of 2, 5 and 10 per cent with falls in the credit score. A member who "
                "has not collected cannot cause a loss: arrears come out of that "
                "member's own pot. For a member who collected and then stopped: contact "
                "and a hardship plan, restriction, cover pays the other members, then "
                "the guarantee and a civil suit. Nobody's relatives are contacted and "
                "no names are published.",
    "cover": "If the member at turn 1 stops paying, each later pot would be Rs 10,000 "
             "short. Cover pays that shortfall, so every other member still receives "
             "Rs 120,000. Mashreq chooses the form: its own guarantee, an insurance "
             "policy, or takaful for the Islamic window. The price is about 5.5 per "
             "cent of the instalment on circles between strangers, set on a stress "
             "case.",
    "fees": "On a circle between strangers the member pays Rs 11,047 an instalment: "
            "Rs 10,000 to the collector, Rs 547 for cover and a fee of up to Rs 500. "
            "The fee is the same for every turn. Mashreq collects it as income and "
            "shares income with Halqa; the more that share earns, the lower the fee "
            "can go. The unit costs come from Halqa's 25 September model.",
    "competition": "JazzCash launched a committee feature in August 2026, but the pot "
                   "sits in the organiser's wallet and payouts are by hand. Oraan holds "
                   "money in its own accounts and charges the first turn up to 21 per "
                   "cent of the instalment a month. Halqa with Mashreq is the only "
                   "option where a bank holds the money, every turn pays one flat fee "
                   "and every payment builds a credit record.",
    "evidence": "Money Fellows in Egypt started inside the central bank's sandbox and "
                "with Banque Misr, and became profitable in 2025. Hakbah in Saudi "
                "Arabia launched after central bank approval. Esusu in the United "
                "States reached a US$1.2 billion valuation. Among 25 earlier attempts, "
                "every failure held money without a licence or guaranteed payouts it "
                "could not carry.",
    "why_now": "Digital payments rose from 78 to 92 per cent of retail payments in "
               "three years, and 69 million Pakistanis use mobile wallets. Savings have "
               "not followed. JazzCash's committee launch shows the category is moving "
               "now. The national strategy targets 75 per cent of adults with an "
               "account by 2028.",
    "readiness": "The application and its decision engines have run live since 20 "
                 "July 2026, closed to the public, with payments in a test environment. "
                 "Halqa becomes Mashreq's service provider under the State Bank's "
                 "outsourcing framework, so regulation arrives through Mashreq's "
                 "licence. Still to do: incorporation, the agreement and the connection "
                 "to Mashreq's systems.",
    "pilot": "About eight weeks for the agreement, approvals and connection, then one "
             "live month with up to 100 circles of people who know each other and "
             "about 1,000 members, then a review and a decision to scale. Circles of "
             "strangers, asset circles, UAE families and Hyper follow only after the "
             "pilot.",
    "requests": "The first three decisions are approvals: the partnership, the State "
                "Bank route and the Islamic window. The next two are products: accounts "
                "and mandates inside the application, and the account that holds "
                "instalments. The last two are commercial: cover and credit reporting, "
                "and the income share with a one month pilot.",
    "close": "Halqa is the system; the bank is the machine. Committees run by Halqa, "
             "on Mashreq accounts, under Mashreq's licence.",
    "appendix": "Reference pages for questions on risk, integration, points and the "
                "turn market, Hyper, leaving a circle and unit costs.",
    "risks": "Each risk Mashreq would carry, with the control that answers it.",
    "integration": "Seven messages connect Halqa and Mashreq. Halqa sends instructions; "
                   "Mashreq executes and confirms; Halqa reconciles its ledger against "
                   "Mashreq's statement every morning. No money passes through Halqa.",
    "points": "Points reward paying on time and carry the profit on balances at the "
              "end of each circle. Points bought with money would be stored value, so "
              "they run only as Mashreq's product. The turn market lets members trade "
              "turns inside their credit bands; counsel confirms its status before "
              "launch.",
    "hyper": "Hyper is a daily circle for people paid daily. Option 1: 400 members "
             "over 50 days, eight collecting each day, Rs 450 a day. Option 2: 390 "
             "members over 26 days, fifteen collecting each day, Rs 500 a day. It is "
             "labelled experimental and stops opening new days if losses would exceed "
             "cover.",
    "leaving": "There is no cancel button. Inside the 24 hour window a member leaves "
               "freely. After that the preferred route is a substitute who takes the "
               "turn. A group vote allows exit with a fine of one instalment; hardship "
               "waives the fine. Money comes back at the end of the circle, without "
               "profit.",
    "unit_costs": "Prices used in the 25 September model, and how each line changes "
                  "when Mashreq collects the fee and holds the money.",
}

MORE["notes"] = NOTES
