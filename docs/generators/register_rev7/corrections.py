# -*- coding: utf-8 -*-
"""Pass 1: what changed since 28 September 2026. Rewrites of revision 6 items overturned or closed by the chairman's
decisions of 29 September to 5 October, the renamed sections, and section AA recording the decisions and the work done."""
from common import I, sub, section

FEE = 'the Rs 85 fee'
REWRITE = {
    91: ('Fees does not list the service fee at all. Add the flat fee of Rs 85 on every monthly instalment, the 1.5 per '
         'cent PSP service fee on wallet and card payments, the takaful or insurance fee by name, and the Hyper split of '
         'Rs 15 a day', None, None),
    92: ('Pay says "No charge to contribute. Raast is instant and free." State the Rs 85 fee on every payment, and the '
         '1.5 per cent PSP service fee when a wallet or card is used', None, None),
    161: ('Pay: the parts of the payment shown before the member confirms: the instalment, the Rs 85 fee, the PSP service '
          'fee where a wallet or card is used, and the takaful or insurance fee by name', None, None),
    318: ('Takaful or insurance explainer, naming the operator the bank chose; never called Halqa cover', None, None),
    319: ('Takaful or insurance fee shown and accepted at joining as the operator\'s product', None, None),
    320: ('Takaful or insurance certificate issued by the operator', None, None),
    321: ('Claim lodged with the operator, with the payment record attached as evidence', None, None),
    322: ('Claim status from the operator, visible to the member', None, None),
    349: ('Turn market between members: a turn listed with an asking price in points, offers, the price agreed by the two '
          'members, the buyer\'s credit band checked, host approval and the exchange fee (D7, D9). No Shariah or non '
          'Shariah label; the bank\'s Shariah board decides whether it is offered through an Islamic window', None, None),
    371: ('Flat member fee of Rs 85 on every monthly instalment, the same for every seat: the running cost of one payment, '
          'at most Rs 35, plus Rs 50; charged by the partner bank, with Halqa paid its share (D5, 30 September)', None, None),
    372: ('Correct the per instalment fee constant, which presently stands at Rs 50, to Rs 85; the grid of Rs 100 to Rs '
          '500 is withdrawn (30 September)', None, None),
    374: ('Split engine: contribution, takaful or insurance fee, the Rs 85 fee and the PSP service fee where it applies, '
          'each to its own ledger account', None, None),
    382: ('Fee display that states the flat fee in rupees and never a rate; the PSP service fee of 1.5 per cent is the '
          'one rate shown, always with its rupee amount', None, None),
    388: ('Correct the discount constants to eighty per cent for a cheque and fifty per cent for verified income, checked '
          'against the Rs 85 fee, and a mandatory income account on unknown committees and Hyper', None, None),
    392: ('Charges scheduled as merchant initiated payments on the saved card, never above one instalment, each settled into '
          'the collecting member\'s account at the partner bank with the takaful or insurance fee and the Rs 85 fee posted '
          'separately (D3)', None, None),
    419: ('Rail cost display before a charged rail is chosen: the 1.5 per cent PSP service fee on wallet and card, with '
          'its rupee amount', None, None),
    420: ('Rail selection policy documented against instalment size: the PSP service fee of 1.5 per cent is paid by the '
          'member on wallet and card payments only, and none on the bank\'s direct debit (5 October)', None, None),
    432: ('Only if the bank asks Halqa to act as agent: written agency agreement with the operator the bank chooses, under '
          'section 96(2) of the Insurance Ordinance 2000, with Halqa in the operator\'s register of agents under section '
          '98; otherwise no agency is held', None, None),
    434: ('Takaful or insurance product for circles between strangers and Hyper, chosen and priced by the bank with its '
          'operator; the stress case pricing of HQ-MF-05 offered as evidence', None, None),
    436: ('Takaful or insurance fee taken as a fixed part of every payment on the circles that carry it', None, None),
    437: ('Takaful or insurance fee remitted to the operator, or for takaful to the participants risk fund, and never held '
          'by Halqa', None, None),
    439: ('Takaful or insurance mandatory on every circle between strangers and on Hyper, its fee named before commitment; '
          'optional on known circles', None, None),
    440: ('Takaful or insurance certificate issued to the member by the operator', None, None),
    443: ('Any commission from the operator, if the bank shares it, recorded as revenue and disclosed to the member; not '
          'counted in Halqa\'s income in the business model (30 September)', None, None),
    495: ('Board and shareholding settled before the first external agreement: the chairman\'s father as director and first '
          'chief executive, with a second adult director or as a single member company, and Taha Kayani\'s shares held as '
          'counsel advises until Taha Kayani is 18 (Companies Act 2017, sections 153, 154 and 186)', None, None),
    605: ('Write the explanation of the takaful or insurance and who provides it; never called Halqa cover', None, None),
    626: ('Build the risk dashboard: expected loss against the takaful or insurance limit, per circle', None, None),
    666: ('Heads of terms with the partner bank, Mashreq Bank Pakistan first and Raqami Islamic Digital Bank in parallel: '
          'roles, exclusivity, member fee, profit share, data and branding', None, None),
    692: ('Shariah board ruling on the turn market; Halqa\'s own materials carry no Shariah or non Shariah label (29 '
          'September)', None, None),
    711: ('Fallback banks prepared with contacts: Meezan Bank, BankIslami, JS Bank, Bank Alfalah (D1); Raqami is pursued in '
          'parallel since 29 September', None, None),
    725: ('Takaful or insurance terms in the operator\'s form, as the only protection against default (29 September)',
          None, None),
    750: ('Accounts for non resident Pakistanis opened from the bank\'s UAE application (D14); Mashreq only, since Raqami '
          'onboards residents only', None, None),
    757: ('Each part posted in one transaction: contribution, takaful or insurance fee, the Rs 85 fee and any PSP service '
          'fee', None, None),
    792: ('Fee statement for members, showing the Rs 85 fee, the PSP service fee where paid and the takaful or insurance '
          'fee', None, None),
    860: ('Point value decided: 1 point = Rs 1 everywhere (29 September)', 'decision', 'Done'),
    863: ('Points bought with money from the member\'s account at the bank (D9); Mashreq only, not offered through Raqami',
          None, None),
    866: ('Points for paying on time capped at half of Halqa\'s fee on that instalment, at most Rs 42.50 with the Rs 85 '
          'fee (29 and 30 September)', None, None),
    893: ('Ceiling on the price of a turn decided: 100 per cent of the pot (29 September)', 'decision', 'Done'),
    902: ('No Shariah or non Shariah label on the turn market (29 September); the bank\'s Shariah board decides whether it '
          'is offered through the Islamic window', None, None),
    923: ('Bank guarantee option withdrawn: default protection is only takaful or insurance from a licensed operator (29 '
          'September)', 'decision', 'Done'),
    924: ('Insurance through the bank\'s own insurer or insurance partner, the bank choosing', None, None),
    925: ('Takaful through an operator the bank chooses, with Halqa as agent only if the bank asks', None, None),
    926: ('Pricing evidence from the Takaful Pricing Model (HQ-MF-05) for the operator the bank chooses', None, None),
    929: ('Takaful or insurance fee named to the member before joining, with no promise of payment by Halqa', None, None),
    930: ('Operator\'s certificate issued to the member', None, None),
    931: ('Claim status from the operator visible to the member and the host', None, None),
    945: ('Member fee set at Rs 85 a monthly instalment, the running cost plus Rs 50; the takaful or insurance fee separate '
          '(30 September)', 'decision', 'Done'),
    946: ('Business Model and Unit Costs rebuilt on the Rs 85 fee: contribution about Rs 50 a member a month, technical '
          'cost about Rs 61,000 a month, break even about 1,220 members (30 September)', None, None),
    947: ('Total cost per instalment shown: the Rs 85 fee, the takaful or insurance fee and, on wallet or card, the 1.5 per '
          'cent PSP service fee', None, None),
    953: ('Hyper fee decided: Rs 15 a day on both designs (29 September); the takaful or insurance part is set by the '
          'operator and named without an amount (30 September)', 'decision', 'Done'),
    956: ('Due date for salary circles decided: the 8th of the month (29 September)', 'decision', 'Done'),
    960: ('Members in the UAE joining through the bank\'s accounts for non resident Pakistanis (D14); Mashreq only', None,
          None),
    967: ('Takaful or insurance pricing model kept', None, None),
    1001: ('Campaign for Pakistanis in the UAE with the bank\'s UAE team; Mashreq only', None, None),
    1006: ('Presentation for the bank: Mashreq version 7 and Raqami version 5 built and filed (30 September); import into '
           'Google Slides and check every slide there', None, 'Partly done'),
    1007: ('Takaful or insurance shown as the only default protection, chosen by the bank (built in the decks, 30 '
           'September)', None, 'Done'),
    1008: ('Credit reporting slide: TASDEEQ or the bank, the bank deciding (D11), built in the decks', None, 'Done'),
    1009: ('Economics slide for the bank with stated assumptions: the Revenue and Business Model slide, built', None, 'Done'),
    1010: ('No pilot, timeline or requests slide (removed 29 September); the pilot is discussed in the meeting', None,
           'Done'),
    1014: ('Note of thanks to the mentor after the introduction', None, None),
    98: ('Save for something promises the member will "own it outright" at Halqa\'s "Rs 50 a month". Hold it behind its '
         'flag until the bank\'s financing product is agreed (D13)', None, None),
    356: ('Remove CREDIT_WEIGHTED from the circle creation route, whose default is still credit weighted ordering. Keep '
          'the ballot (RANDOM_BALLOT) beside the host\'s fixed order and selection, drawn only among the seats each '
          'member\'s score band allows (presentation edit, 30 September)', None, None),
    433: ('Only if an agency is held (item 432): the agreement checked against regulation 4 of the Corporate Insurance '
          'Agents Regulations 2020, and staff who sell takaful or insurance certified under regulation 22', None, None),
    446: ('Counsel review of any agency arrangement before takaful or insurance is offered through Halqa', None, None),
    490: ('Confirmation that no product surface proposes a payment determined by the drawing of a lot; the ballot sets '
          'only the order of turns, and every member receives the same pot', None, None),
    496: ('Insurance for the company itself: directors and officers, professional liability and cyber, at the level the '
          'bank requires, separate from the members\' takaful or insurance', None, None),
    396: ('Income account verification: title inquiry, statement integrity checks and the salary pattern score, with '
          'documentary proof verifying on the same day and observation kept only as the fallback (5 October); the Hyper '
          'daily income floor of Rs 1,000 on at least five days of every week for eight weeks stands (HQ-MF-03)', None,
          None),
    471: ('Affordability gate rebuilt to the five tests of the Affordability Model (HQ-MF-02), on unknown committees and '
          'Hyper only: a third of verified income, 40 per cent with TASDEEQ reported loans, and weighted load and '
          'forward liability from the fourth committee. Affordability is unchanged by the ruling of 5 October: security '
          'opens a seat, it never excuses a member who cannot afford the instalment', None, None),
    475: ('New member seat rights set by the matrix of section AQ2: real bureau history and a good score open any seat, '
          'a thin record opens the middle seats, no record opens the last seats, and one clean circle opens the rest '
          '(5 October); the blanket confinement to the final seats until two clean circles is withdrawn', None, None),
    916: ('Credit bands mandatory on every circle, with no exception (D7), except where security under section AQ3 makes '
          'the pot recoverable and the member\'s score is not low on substantial credit factors (5 October)', None, None),
    917: ('Early seat bands mandatory: a band that does not allow an early seat cannot take one, unless security under '
          'section AQ3 covers the pot (5 October)', None, None),
    920: ('New members placed by the matrix of section AQ2 rather than confined to the final seats; one clean circle, '
          'known or unknown, opens the first positions (5 October)', None, None),
    962: ('Income account model run on the partner bank\'s statement data with the member\'s consent (D10), which '
          'verifies on the same day for a member whose salary already reaches that bank (5 October)', None, None),
    946: ('Business Model and Unit Costs rebuilt on the Rs 85 fee: contribution about Rs 50 a member a month before the '
          'host\'s commission of 10 per cent of circle profit (5 October), technical cost about Rs 61,000 a month, break '
          'even about 1,220 members (30 September)', None, None),
    564: ('Sanctions and politically exposed person screening done by the bank at onboarding and continuously; Halqa acts '
          'on the bank\'s result at once', None, None),
    565: ('Ongoing monitoring of patterns against the declared profile done by the bank on Halqa\'s data feed (item 698)',
          None, None),
    567: ('Suspicious activity escalated to the bank\'s compliance officer; the suspicious transaction report is the '
          'bank\'s to make', None, None),
    90: ('Fees lists an early turn fee that "goes to the other members" and turn selling at "whatever the buyer bids". '
         'Remove the early turn fee; restate turn selling as the turn market of section W, priced in points and capped '
         'at 100 per cent of the pot (D9, 29 September)', None, None),
    96: ('The turn marketplace says Buy a turn, for sale, bid, and List one of my turns. Restate it for the turn market '
         'of section W: an asking price in points, offers, the seller choosing, host approval, and the price capped at '
         '100 per cent of the pot (D9, 29 September)', None, None),
    99: ('About states "What a member pays Halqa: Rs 0" and calls Halqa "a record that cannot be argued with". State the '
         'Rs 85 fee and remove the record framing', None, None),
    162: ('Pay: the 1.5 per cent PSP service fee shown with its rupee amount before a wallet or card is chosen, and no '
          'charge shown on the bank\'s direct debit (5 October)', None, None),
    362: ('Re-express the Hyper seat price as the flat fee of Rs 15 a day payable to Halqa, with the takaful or insurance '
          'part set by the operator, rather than a bid between members (29 and 30 September)', None, None),
    1022: ('Business Model and Unit Costs rebuilt: the Rs 85 fee, the PSP service fee, technical only fixed cost and the '
           'profit share (HQ-CP-03)', None, None),
    1023: ('Default Prevention updated: bank mandate first and takaful or insurance only (HQ-CP-05)', None, None),
    1036: ('Business Model: software cost table each month, with a table by number of members; the technical cost '
           'model of 30 September is the starting point', None, 'Partly done'),
}

SECTION_TITLES = {'H': 'Takaful or Insurance', 'X': 'Credit and Takaful or Insurance'}
SUB_TITLES = {'X2': 'Takaful or Insurance through the Bank'}
PREAMBLES = {
    'X': 'Mandatory credit bands, takaful or insurance chosen by the bank, and credit reporting from day one (D7, D11). '
         'There is no Halqa cover and no bank guarantee (29 September).',
    'H': 'Takaful or insurance from a licensed operator chosen by the bank is the only protection against default. '
         'Halqa holds no cover of its own and promises no payment (29 September).',
}


def decisions_section():
    D = lambda t, w='decision': I(t, w, 'Chairman', 'P0', 1, 'Done')
    record = [
        D('Bank route kept with Mashreq Bank Pakistan first; Raqami Islamic Digital Bank pursued in parallel, with no '
          'exclusivity preference (29 September)'),
        D('Presenter and signatory: Taha Kayani, Founder, Halqa; the chairman is 17 (29 and 30 September)'),
        D('Due date for salary circles: the 8th of the month (29 September); closes item 956'),
        D('Points: 1 point = Rs 1; points for paying on time never more than half of Halqa\'s fee on that instalment (29 '
          'September); closes item 860'),
        D('Price of a turn capped at 100 per cent of the pot (29 September); closes item 893'),
        D('Hyper fee Rs 15 a day on both designs (29 September); the takaful or insurance part, Rs 135 or Rs 151.67 a '
          'day in the design of 29 September, is set by the operator and named without an amount (30 September); closes item 953'),
        D('No Shariah or non Shariah labels in decks or documents (29 September)'),
        D('No Halqa cover and no bank guarantee: only takaful or insurance from a licensed operator chosen by the bank (29 '
          'September); closes item 923'),
        D('Fixed cost counted as technical only: about Rs 61,000 a month for hosting, database, monitoring, mail and the '
          'developer account (30 September)'),
        D('Fee of Rs 85 on every monthly instalment: the running cost of one payment, at most Rs 35, plus Rs 50 (30 '
          'September); closes item 945'),
        D('PSP service fee of 1.5 per cent on wallet and card payments only; none on the bank\'s direct debit (5 October)'),
        D('Takaful or insurance fee named without an amount and kept outside the fee and Halqa\'s income (30 September)'),
        D('Partner decks: the version 5 boxes and wording, logos in place of names, all text black, charts drawn as '
          'shapes; icon tiles rejected as informal (30 September)'),
        D('Work register: phases of about 100 items, one Claude Pro usage window each, with items at the finest level '
          '(5 October)', 'register'),
        I('Company not incorporated and TASDEEQ not contacted, as confirmed on 29 September; both remain open, as items 476 and 459',
          'status', 'Chairman', 'P0', 1, 'Open'),
        I('Mashreq meeting date not fixed (5 October); phase 1 starts the corrections and the application', 'status',
          'Chairman', 'P1', 1, 'Open'),
    ]
    follow = [
        I('Replace the old surname with Kayani in every document, deck, script and preview data set, including the two '
          'screenshot scripts that rename the preview user', 'documents, shoot scripts', 'Claude', 'P0', 1),
        I('Remove the word cover where it describes protection by Halqa from every screen, notice, help answer and '
          'preview string: ProtectionCenter, FeesPage, HyperPage, rafa-knowledge.ts, preview.ts', 'halqa-web', 'Claude',
          'P0', 2),
        I('Show the PSP service fee only when the member chooses a wallet or a card, and never on the bank\'s direct debit',
          'PayPage.tsx, lib/fee-book.ts', 'Claude', 'P1', 1),
        I('Send Hyper\'s daily reminders by free push notification rather than WhatsApp, since at Rs 15 a day a WhatsApp '
          'message on every daily payment makes Hyper lose money (30 September)', 'lib/notices.ts', 'Claude', 'P1', 1),
        I('Raqami: no points bought with money and no turn market priced in money; anything its Shariah board cannot '
          'approve is not offered through Raqami', 'product', 'Chairman', 'P1', 1),
        I('Confirm with the bank whether hosting in Singapore (Vercel sin1, Supabase on AWS ap-southeast-1) is acceptable '
          'under the State Bank\'s cloud framework, which requires State Bank approval for a bank\'s material workloads '
          'on an offshore cloud, or whether an onshore provider is required', 'bank', 'Bank', 'P0', 1),
        I('Update the master context and memory after every change to this register', 'HANDOVER', 'Claude', 'P1', 1),
        I('Wire the ballot to an endpoint: lib/parchi.ts holds the whole commit and reveal ceremony, the seat '
          'constrained draw and the public verification, and no route calls any of it, so no circle has ever drawn '
          'its seats. Needs the sealed seed stored against the circle, a tap endpoint, a draw endpoint that refuses '
          'an unseatable circle, and the proof published to every member', 'routes/committees.ts, lib/parchi.ts',
          'Claude', 'P1', 4),
        I('Carry the security route into the database: creditStanding and the pledged security amount are read by '
          'lib/score-bands.ts through standingOf and exist on no table, so every member is read as having a record '
          'too thin to score. Needs the additive columns and the bank\'s hold on the member\'s own savings',
          'prisma/schema.prisma', 'Claude', 'P0', 2),
        I('Confirm the interim reading of the seat matrix while no bureau is connected: with TASDEEQ not contacted '
          'nobody has a bureau record, so read strictly every member sits in the last seats and no circle can fill '
          'its early ones. The code treats a member Halqa holds a score for as having a record too thin to score, '
          'which opens the middle seats, and one clean committee opens the rest (BUREAU_CONNECTED in '
          'lib/score-bands.ts)', 'product', 'Chairman', 'P0', 1),
        I('Production migration for the schema work of 6 October: 42 indexes, 34 delete rules and three status '
          'columns moved from free text to an enum. The indexes and the delete rules are additive and safe; the '
          'three enum columns are not, because an enum column is dropped and recreated, so they need their own '
          'additive SQL written and applied before any deploy. Nothing is deployed until this exists',
          'prisma/schema.prisma, additive SQL', 'Claude', 'P0', 2),
        I('Remove the spawn score of 700 given to every new account: it is Halqa\'s own number, not a bureau\'s, and '
          'while it stands a member with no history reads as creditworthy', 'routes/auth.ts, prisma/schema.prisma',
          'Claude', 'P0', 1),
    ]
    work = [
        I('Oraan research document built on the chairman\'s own edited version (28 September)', 'Google Docs', 'Claude',
          'P1', 2, 'Done'),
        I('Complete position deck of 81 slides filed separately (29 September)', '01 Presentation', 'Claude', 'P2', 4,
          'Done'),
        I('Master context created as the cold start brief, version controlled (29 September)', 'HANDOVER', 'Claude', 'P1',
          2, 'Done'),
        I('Mashreq presentation rebuilt through versions 2 to 7, the chairman\'s own edits applied (29 and 30 September)',
          '01 Presentation', 'Claude', 'P1', 4, 'Done'),
        I('Raqami presentation built and rebuilt through versions 1 to 5 in Raqami\'s colours (29 and 30 September)',
          '01 Presentation', 'Claude', 'P1', 4, 'Done'),
        I('Technical only cost model with verified prices (30 September)', 'scratchpad tech_costs.py', 'Claude', 'P1', 2,
          'Done'),
        I('Generated application screens in the application\'s own kit for screens not yet built: account opening, '
          'consent, types, full cost, Hyper, payment methods, points (30 September)', 'shots_v5', 'Claude', 'P2', 2,
          'Done'),
        I('Full cost screen regenerated with the Rs 85 fee, the PSP service fee and the takaful or insurance fee by name '
          '(30 September)', 'shots_v5', 'Claude', 'P2', 1, 'Done'),
        I('Work register of 5 October: verified against the code and the decisions, extended in ten passes, and divided '
          'into phases', '07 Internal', 'Claude', 'P1', 4, 'Done'),
    ]
    return section('AA', 'Decisions and Work since 28 September', [
        sub('AA1', 'Decisions', record, 'Each decision is the chairman\'s, with its date. Items of revision 6 that they '
                                        'overturned are rewritten in place below and keep their sections.'),
        sub('AA2', 'Follow Up', follow),
        sub('AA3', 'Work Done', work),
    ], loop=1)
