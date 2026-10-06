# -*- coding: utf-8 -*-
"""Pass 10: what a regulated company runs on, and what the leading finance applications do. Governance, policies, risk,
models, continuity, finance, people and suppliers in the manner of a bank; service levels, runbooks, support and data in
the manner of a large technology company; growth; the two banks; and features measured against other applications."""
from common import I, sub, section

POLICIES = [
    ('Information security', 0), ('Acceptable use', 0), ('Access control', 0), ('Cryptography', 0),
    ('Secure development', 0), ('Change management', 0), ('Incident response', 0),
    ('Business continuity and disaster recovery', 0), ('Backup and restore', 0), ('Supplier and third party risk', 0),
    ('Data protection and privacy', 1), ('Data retention', 1), ('Data classification', 0),
    ('Anti money laundering, Halqa\'s part', 1), ('Fraud prevention', 0), ('Complaints handling', 1),
    ('Fair treatment of members', 1), ('Conflicts of interest', 1), ('Code of conduct', 0), ('Whistleblowing', 1),
    ('Gifts and hospitality', 0), ('Social media', 0), ('Remote working', 0), ('Model risk', 0),
    ('Records management', 0), ('Physical security', 0),
]

RISKS = [
    'default by a member after collecting', 'fraud by a member at joining', 'collusion inside a circle',
    'misconduct by a host', 'identity fraud and stolen CNICs', 'mule accounts receiving payouts',
    'failure of the bank connection', 'failure of the PSP', 'data breach', 'cyber attack on the service',
    'dependence on the founder, who is 17', 'shortage of funds before revenue', 'dependence on one bank',
    'change in State Bank rules on service providers', 'a Shariah ruling against a feature on Raqami',
    'mis-selling or unclear disclosure', 'complaints outrunning the support team', 'damage to reputation on social media',
    'error in a model such as the score or affordability', 'failure of one of Halqa\'s own suppliers',
    'data hosted outside Pakistan', 'message costs above the business model', 'removal from an application store',
    'undertakings or guarantees not enforceable in court', 'tax treatment of the fee or the points',
    'growth of the points liability', 'failure of a marketplace merchant', 'misuse of the turn market',
    'losses in Hyper', 'an operational error in a payout run', 'reconciliation breaks left open',
    'error by a contractor', 'misuse by someone with inside access', 'wrong data reported to the bureau',
]

KRIS = [
    'collection success on the first attempt', 'collection success by the 8th', 'arrears after the 8th',
    'default after collection', 'claims paid by the operator', 'complaints per 1,000 members',
    'complaints past their turnaround time', 'fraud cases per 1,000 members', 'time from fraud report to block',
    'reconciliation breaks open for more than a day', 'payouts later than the 8th', 'service availability',
    'incidents by severity', 'message cost per member per month', 'drop off at each onboarding step',
    'identity check failures', 'attempted band overrides', 'points liability',
]

MODELS = ['Affordability', 'Identity confidence', 'Salary pattern', 'Credit score and bands', 'Exposure',
          'Forward liability', 'Takaful or insurance pricing', 'Hyper default threshold', 'Fraud signals']

SCENARIOS = [
    'the bank\'s interfaces unavailable on a payday', 'the PSP unavailable', 'the hosting region unavailable',
    'database corruption', 'WhatsApp unavailable or the account suspended', 'SMS codes delayed',
    'the founder unavailable for a month', 'a cyber incident', 'a payout run failing on the 8th',
    'a sudden wave of complaints', 'removal from an application store', 'loss of the domain name',
]

VENDORS = ['Vercel', 'Supabase', 'Amazon Web Services', 'Meta for WhatsApp', 'the SMS provider', 'Safepay',
           'Google Workspace', 'Google Play and Firebase', 'Apple', 'Sentry', 'Resend', 'the domain registrar',
           'Cloudflare', 'GitHub', 'the translator', 'the penetration tester', 'the auditor', 'the tax adviser', 'counsel',
           'TASDEEQ', 'the takaful or insurance operator, through the bank', 'marketplace merchants', 'the software house']

DATAROOM = ['certificate of incorporation', 'memorandum and articles', 'shareholding record', 'financial model',
            'business model and unit costs', 'presentations for both banks', 'product demonstration', 'opinions of '
                                                                                                       'counsel',
            'agreement with the bank', 'policy set', 'security pack', 'risk register', 'key measures',
            'founder and board profiles', 'references']

SLOS = ['sign in', 'paying an instalment', 'payout on the 8th', 'the collection run', 'alerts reaching members',
        'the application loading', 'the interface service answering']

RUNBOOKS = ['a WhatsApp template rejected', 'a database restore', 'a leaked secret',
            'an application store rejection', 'a mass sign up attack', 'a suspected fraud ring', 'a request to see or '
                                                                                                 'delete data',
            'a complaint escalated to the bank', 'a spike in points purchases',
            'a merchant failing to deliver', 'a disputed turn trade',
            'a member reporting a stolen phone', 'an alert storm']

TOPICS = [
    'what a committee is', 'how Halqa works with the bank', 'opening the bank account', 'why the bank checks '
                                                                                         'fingerprints',
    'the Rs 85 fee', 'the PSP service fee on wallets and cards', 'the takaful or insurance fee', 'how the order of turns '
                                                                                                 'is set',
    'score bands', 'why new members start last', 'joining with a code', 'hosting a circle', 'admitting members',
    'reminders', 'paying by mandate', 'paying by wallet or card', 'paying by Raast', 'when a payment fails',
    'late charges', 'why the 8th', 'receiving the pot', 'arrears and set off', 'hardship plans', 'leaving a circle',
    'disputes', 'complaints', 'points and rewards', 'the marketplace', 'the turn market', 'Hyper, an experiment',
    'the credit record and TASDEEQ', 'the credit score', 'keeping a PIN safe', 'changing phone or device',
    'changing a phone number', 'data and privacy', 'closing the account', 'members abroad', 'Islamic accounts',
    'contact and hours',
]

EVENTS = ['app opened', 'sign up started', 'phone submitted', 'code verified', 'PIN set', 'profile completed',
          'CNIC captured', 'liveness passed', 'bank onboarding started', 'bank account opened', 'bank account refused',
          'circle viewed', 'circle created', 'invitation shared', 'joining requested', 'admitted',
          'key facts accepted', 'undertaking signed', 'mandate started', 'mandate authorised', 'mandate cancelled',
          'payment method added', 'payment started', 'payment succeeded', 'payment failed', 'payout received',
          'late notice opened', 'hardship requested', 'exit requested', 'dispute opened', 'complaint opened',
          'points credited', 'points redeemed', 'order placed', 'turn listed', 'offer made', 'trade settled',
          'Hyper joined', 'help article read', 'support contacted', 'language changed', 'notification opened',
          'device bound', 'cooling off reached', 'account closed']

METRICS = ['active members', 'active circles', 'circles started each week', 'time for a circle to fill',
           'collection success on the first attempt', 'collection success by the 8th', 'arrears after the 8th',
           'default after collection', 'recovery rate', 'payouts on time', 'mandate coverage',
           'onboarding conversion by step', 'bank account opening success', 'time to first circle',
           'complaints rate', 'member satisfaction', 'message cost per member', 'contribution per member',
           'fee revenue', 'points liability']

BANK_REPORTS = ['members and accounts opened', 'balances held', 'collections and their success', 'arrears and defaults',
                'claims to the operator', 'complaints and turnaround', 'incidents', 'service levels',
                'points liability', 'marketplace orders', 'Hyper each day']

PAGES = ['home', 'how it works', 'fees', 'security', 'for hosts', 'Islamic accounts', 'help', 'privacy', 'terms',
         'complaints', 'contact', 'status']

QUESTIONS = [
    'who holds the money at each moment', 'what happens if a member stops paying after collecting',
    'who pays the members left short', 'what the takaful or insurance costs and who chooses the operator',
    'how members are verified', 'whether Halqa stores fingerprints or faces', 'how the payday is known',
    'what happens when a salary is late', 'why the 8th', 'what the fee is and who earns it', 'what share the bank '
                                                                                               'keeps',
    'what deposits the bank gains', 'how many accounts each circle brings', 'how credit is reported and by whom',
    'Halqa\'s legal position and why it needs no licence of its own', 'how Halqa meets the outsourcing framework',
    'where the data is hosted', 'what security testing has been done', 'the continuity plan',
    'who the founder and directors are', 'how Halqa is funded and for how long', 'what happens if Halqa fails',
    'how complaints are handled', 'how a committee is structured for an Islamic window, the bank\'s Shariah board '
                                  'deciding', 'whether the turn market can be offered through an Islamic window, the '
                                              'bank\'s Shariah board deciding',
    'whether points are electronic money', 'whether points can be cashed out', 'who carries the risk of a merchant',
    'why Hyper is experimental and what limits it', 'default rates in informal committees', 'evidence from abroad',
    'how Halqa compares with Oraan and JazzCash', 'why the bank should not build this itself',
    'what integration is needed and how long it takes', 'what Halqa needs from the bank', 'the size of a first stage',
    'who pays for marketing', 'whose brand the member sees', 'exclusivity', 'who owns the data',
    'which State Bank approvals are needed', 'how fraud and disputes are handled', 'which measures both sides watch',
    'how the price is reviewed', 'how the partnership ends',
]

# Features seen in other finance applications. Those already planned elsewhere are named in the preamble of AP with
# the item that holds the work; statuses there were checked in halqa-web on 5 October 2026 (the invitation QR code is
# drawn in InviteShare.tsx, biometric unlock runs through webauthn.ts in PinLock.tsx, and the limits, notifications and
# referral pages exist). The lists below hold only what is new.
ADOPT = [
    ('Application locked when it goes to the background, as banking applications do', 'P1'),
    ('A person behind the assistant in support chat, as the wallets offer', 'P2'),
    ('Circles between strangers released on a weekly schedule, as Hakbah releases its circles each Monday', 'P2'),
    ('Low data mode for slow connections', 'P3'),
    ('Home screen widget with the next due date, in the native build', 'P3'),
    ('Link to the member\'s Raast ID at the bank, as Easypaisa and SadaPay show it', 'P3'),
    ('Links to the bank\'s saving pots after a circle ends, as Raqami offers them', 'P3'),
    ('Links to the bank\'s card controls: virtual card and card freeze', 'P3'),
    ('Cash deposit points shown for members paid in cash: Askari Bank branches for Raqami, the bank\'s branches for '
     'Mashreq', 'P3'),
]
DECIDE = [
    ('Request money from a member by request to pay: for the chairman\'s decision; useful to hosts, but a source of '
     'pressure on members', 'P2'),
    ('Rent payments reported to bureaus, as Esusu does: recommended for exclusion, since it lies outside the committee '
     'product; for the chairman\'s decision', 'P3'),
    ('Spending insights, as Revolut and Monzo show: recommended for exclusion, since the bank holds the account; for the '
     'chairman\'s decision', 'P3'),
    ('Round ups into savings: recommended for exclusion as the bank\'s product; for the chairman\'s decision', 'P3'),
    ('Mini applications inside the wallet, as Easypaisa and JazzCash run: recommended for exclusion, since they lie '
     'outside the committee product; for the chairman\'s decision', 'P3'),
    ('Banking over WhatsApp: recommended for exclusion, since Halqa sends notices on WhatsApp and takes no instructions '
     'there; for the chairman\'s decision', 'P3'),
]
EXCLUDED = [
    'Price by slot, with fees on early slots and discounts on late ones, as Money Fellows charges: excluded, since the '
    'fee is the same for every seat (30 September) and the turn market serves members who want an earlier turn',
    'Prepaid card for payouts, as Money Fellows issues: excluded, since payouts go to the member\'s bank account (D2)',
    'Small loans offered inside wallets: excluded, since Halqa offers no loans',
    'Buy now pay later: excluded, since Halqa offers no loans',
]
COVERED = ('Features of Easypaisa, JazzCash, SadaPay, NayaPay, Raqami, Mashreq NEO, Money Fellows, Hakbah, Esusu, '
           'Revolut and Monzo already planned elsewhere: the help centre (item 327), the service status page (523), '
           'device management (551), the statement as a file (166), receipts shared as a file (284), Urdu throughout '
           '(595), limits set by the score (916), cashback as the end of circle reward (861), host tools (266 to 278), '
           'payment by any debit card or wallet (389), scheduled payments by mandate and saved card (390, 832), '
           'fingerprint verification in the bank\'s onboarding (744), savings between payday and the 8th (447), the '
           'transaction PIN, device cooling off, security advice and the Raast QR code (section AB), dark mode and '
           'search on every list (section AC), and reminders before the 8th (section AH). The invitation QR code, '
           'biometric unlock, the limits page, the notification centre and referral codes are built. The items below '
           'hold only what is new.')
# First drafts and briefs that Claude prepares for counsel: (subject, item of revision 6, priority, effort).
COUNSEL = [
    ('memorandum object clause for the restructured model', 477, 'P0', 1),
    ('member undertaking stating the sum owed after each round', 483, 'P0', 2),
    ('mutual guarantee as a separate instrument between members', 484, 'P1', 1),
    ('collection mandate text stating amount, cadence, ceiling and cancellation', 485, 'P0', 1),
    ('arbitration clause naming the dispute route', 486, 'P1', 1),
    ('no custody clause: every balance sits with the partner bank', 487, 'P0', 1),
    ('member agreement, privacy, cookies, advertising, community and fees, versioned together', 488, 'P0', 4),
    ('brief on limb twelve of the definition of a financial institution', 489, 'P0', 1),
    ('services agreement: Halqa as the system, the bank as the licensed holder and mover of money', 667, 'P0', 4),
    ('schedule of functions, with the owner of every record and the functions Halqa never performs: custody, '
     'lending, the account opening decision and insurance', 668, 'P0', 2),
    ('service levels schedule', 669, 'P1', 1),
    ('data clause', 675, 'P1', 1),
    ('intellectual property clause', 676, 'P1', 1),
    ('liability clause', 677, 'P1', 1),
    ('exit and migration clause', 678, 'P1', 1),
    ('business continuity duties of both parties', 679, 'P1', 1),
    ('audit rights of the bank and the State Bank', 680, 'P1', 1),
    ('complaints routing between the bank and Halqa', 681, 'P1', 1),
    ('governing law and dispute resolution clause', 683, 'P2', 1),
    ('change control clause', 684, 'P1', 1),
    ('brief on Halqa as the bank\'s service provider and on section 84 of the Companies Act', 693, 'P0', 2),
    ('brief on points bought with money and redeemed with merchants', 694, 'P1', 1),
    ('brief on the turn market under the SECP rules for peer to peer lending', 695, 'P1', 1),
    ('brief on credit reporting from day one', 696, 'P1', 1),
    ('note on points under the Virtual Assets Act 2026', 697, 'P2', 1),
    ('member agreement for three parties: the member, Halqa and the bank', 719, 'P0', 4),
    ('privacy policy stating which records Halqa holds and which the bank holds', 720, 'P0', 2),
    ('mandate terms in the bank\'s form, as shown inside Halqa', 721, 'P1', 1),
    ('points terms', 722, 'P2', 2),
    ('marketplace terms', 723, 'P2', 1),
    ('turn market terms', 724, 'P2', 1),
    ('takaful or insurance terms in the operator\'s form', 725, 'P1', 1),
    ('credit reporting consent naming the route the bank chooses', 726, 'P1', 1),
    ('savings product terms in the bank\'s form', 727, 'P2', 1),
    ('terms for members abroad', 728, 'P3', 1),
    ('experimental terms for Hyper', 729, 'P2', 1),
    ('complaints procedure covering Halqa and the bank', 730, 'P1', 1),
    ('consent step for the bureau, agreed with TASDEEQ', 460, 'P1', 1),
    ('brief on the Credit Bureaus Act 2015 for the chosen reporting route', 943, 'P1', 1),
    ('note confirming that Halqa earns no return on any member\'s money', 453, 'P2', 1),
    ('note on section 31(1)(c) of the Electronic Transactions Ordinance', 457, 'P2', 1),
    ('data processing agreement for suppliers', 805, 'P2', 1),
    ('agency checklist under regulations 4 and 22 of the Corporate Insurance Agents Regulations 2020, used only if an '
     'agency is held', 433, 'P3', 1),
]


def build():
    pol = []
    for name, legal in POLICIES:
        pri = 'P3' if name == 'Physical security' else ('P1' if legal or name in ('Information security',
                                                                                  'Incident response') else 'P2')
        pol.append(I('%s policy drafted' % name, 'documentation', 'Claude', pri))
        if legal:
            pol.append(I('%s policy reviewed by counsel' % name, 'legal', 'Counsel', pri))
        pol.append(I('%s policy approved by the board' % name, 'governance', 'Chairman', pri))
        pol.append(I('%s policy published to everyone with access' % name, 'documentation', 'Claude', pri))
        pol.append(I('%s policy: training given and recorded' % name, 'governance', 'Chairman', pri))
        pol.append(I('%s policy reviewed each year' % name, 'governance', 'Claude', 'P3'))
    risk = [
        I('Risk appetite statement approved by the board', 'governance', 'Chairman', 'P1'),
        I('Three lines of defence written for a small company: who does, who checks, who audits', 'governance', 'Claude',
          'P2'),
        I('Risk and control self assessment each quarter', 'governance', 'Claude', 'P2'),
        I('Issue log: every control gap with an owner and a date', 'governance', 'Claude', 'P2'),
        I('Control testing schedule', 'governance', 'Claude', 'P2'),
        I('Regulatory change log: State Bank and SECP circulars read and acted on each month', 'governance', 'Claude',
          'P2'),
        I('Compliance monitoring plan for the first year', 'governance', 'Claude', 'P2'),
    ]
    risk += [I('Risk: %s: owner, controls and the indicator that warns of it' % r, 'risk register', 'Claude', 'P2')
             for r in RISKS]
    risk += [I('Key risk indicator: %s, with its threshold and its owner' % k, 'risk register', 'Claude', 'P2')
             for k in KRIS]
    models = []
    for mname in MODELS:
        models.append(I('Model, %s: documentation of purpose, inputs, method and limits' % mname.lower(), 'documents',
                        'Claude', 'P2'))
        models.append(I('Model, %s: independent validation before use on live members' % mname.lower(), 'external',
                        'Auditor', 'P2'))
        models.append(I('Model, %s: monitoring thresholds and alerts' % mname.lower(), 'reporting', 'Claude', 'P2'))
        models.append(I('Model, %s: recalibration schedule against outcomes' % mname.lower(), 'process', 'Claude', 'P3'))
        models.append(I('Model, %s: changes approved and recorded before release' % mname.lower(), 'process', 'Claude',
                        'P2'))
    bcp = []
    for s in SCENARIOS:
        bcp.append(I('Continuity plan for %s' % s, 'documentation', 'Claude', 'P1'))
        bcp.append(I('Continuity plan tested: %s' % s, 'operations', 'Claude', 'P2'))
    bcp += [I('Recovery time and recovery point set for %s' % sv, 'infrastructure', 'Claude', 'P1') for sv in
            ('the interface service', 'the database', 'the collection run', 'the payout run', 'notifications',
             'the administrative console')]
    fin = [
        I('Chart of accounts for the company', 'finance', 'Chairman', 'P1'),
        I('Monthly close checklist', 'finance', 'Claude', 'P2'),
        I('Monthly reconciliation of the bank\'s income statement against Halqa\'s records', 'finance', 'Claude', 'P2'),
        I('Runway updated each month against the budget of item 740', 'finance', 'Claude', 'P1'),
        I('Cash flow forecast by month', 'finance', 'Claude', 'P2'),
        I('Investor update each quarter', 'finance', 'Chairman', 'P3'),
        I('Expense approval rule', 'finance', 'Chairman', 'P2'),
        I('Audit readiness: records, approvals and reconciliations kept as an auditor expects', 'finance', 'Claude', 'P2'),
    ]
    fin += [I('Data room for the bank and investors: %s' % d, 'documents', 'Claude', 'P2') for d in DATAROOM]
    people = [
        I('Roles and responsibilities written for product, engineering, operations, support, compliance and finance',
          'governance', 'Claude', 'P1'),
        I('Agreement with the software house, with confidentiality, intellectual property and security terms', 'legal',
          'Counsel', 'P1'),
        I('Agreement with the translator', 'commercial', 'Chairman', 'P1'),
        I('Confidentiality agreements signed by everyone with access, in the bank\'s form where it has one', 'legal',
          'Chairman', 'P0'),
        I('Background checks before access is granted', 'governance', 'Chairman', 'P1'),
        I('Access granted and removed by checklist on joining and leaving', 'security', 'Claude', 'P1'),
        I('Training plan: security, money laundering, conduct and complaints', 'governance', 'Claude', 'P2'),
        I('Hiring decisions for launch: support, compliance and operations', 'decision', 'Chairman', 'P2'),
        I('The founder\'s role and authority recorded while the founder is under 18, with the director\'s authority',
          'corporate',
          'Counsel', 'P0'),
    ]
    vend = []
    for v in VENDORS:
        vend.append(I('Supplier, %s: due diligence recorded' % v, 'governance', 'Claude', 'P2'))
        vend.append(I('Supplier, %s: contract and data processing terms in place' % v, 'legal', 'Chairman', 'P2'))
        vend.append(I('Supplier, %s: exit plan' % v, 'governance', 'Claude', 'P3'))
        vend.append(I('Supplier, %s: reviewed each year' % v, 'governance', 'Claude', 'P3'))
    drafts = [I('Draft for counsel: %s (item %s)' % (t, n), 'drafts for counsel', 'Claude', p, e) for t, n, p, e in COUNSEL]
    gov = section('AL', 'Governance, Risk and the Company', [
        sub('AL1', 'Policies', pol, 'Item 708 by policy: each policy drafted, reviewed by counsel where it is legal in '
                                    'nature, approved, published, trained and reviewed each year.'),
        sub('AL2', 'Risk Management', risk, 'A bank\'s approach scaled to Halqa: appetite, three lines of defence, a '
                                            'risk register and indicators.'),
        sub('AL3', 'Model Risk', models, 'Each model Halqa relies on, documented, validated, monitored and changed under '
                                         'control.'),
        sub('AL4', 'Continuity', bcp, 'Item 706 by scenario and by service.'),
        sub('AL5', 'Finance', fin),
        sub('AL6', 'People', people),
        sub('AL7', 'Suppliers', vend, 'Items 804 and 805 by supplier.'),
        sub('AL8', 'Drafts Prepared for Counsel', drafts, 'The legal items of sections K, S and W remain counsel\'s. Claude '
                                                          'prepares each first draft or brief, so that counsel\'s time '
                                                          'goes on review rather than on drafting.'),
    ], loop=10)
    ops1 = [I('Service level objective for %s, with its measure and its error budget' % s, 'operations', 'Claude', 'P1')
            for s in SLOS]
    ops1 += [
        I('Severity levels for incidents, with response times', 'operations', 'Claude', 'P1'),
        I('On call rota with a backup, and the escalation path', 'operations', 'Chairman', 'P1'),
        I('Post incident review, blameless, written within five working days, with actions tracked', 'operations',
          'Claude', 'P1'),
        I('Production readiness review before any launch: monitoring, runbooks, rollback, load', 'process', 'Claude',
          'P1'),
        I('No releases from two days before the 8th to the day after, so payout day is never at risk', 'process',
          'Claude', 'P0'),
        I('Release calendar shared with the bank', 'process', 'Claude', 'P2'),
        I('Capacity review each month against growth', 'process', 'Claude', 'P3'),
    ]
    rb = [I('Runbook: %s' % r, 'documentation', 'Claude', 'P2') for r in RUNBOOKS]
    sup = []
    for t in TOPICS:
        sup.append(I('Help article in English: %s' % t, 'content', 'Claude', 'P1'))
        sup.append(I('Help article in Urdu: %s' % t, 'content', 'Translator', 'P1'))
        sup.append(I('Assistant answer updated for: %s' % t, 'rafa-knowledge.ts', 'Claude', 'P2'))
    sup += [
        I('Support replies saved for the twenty five most common questions', 'operations', 'Claude', 'P2'),
        I('Support hours and response times published', 'content', 'Chairman', 'P1'),
        I('Quality check of a sample of support replies each week', 'process', 'Chairman', 'P3'),
        I('Satisfaction question after each resolved request', 'new page', 'Claude', 'P3'),
        I('Help centre search across every article in both languages', 'new page', 'Claude', 'P2'),
    ]
    data = [I('Event defined, named and documented: %s' % e, 'analytics', 'Claude', 'P2') for e in EVENTS]
    data += [I('Measure defined and charted: %s' % m, 'admin', 'Claude', 'P2') for m in METRICS]
    data += [I('Monthly report to the bank: %s' % r, 'reporting', 'Claude', 'P2') for r in BANK_REPORTS]
    data += [
        I('Data quality checks on the ledger, the bureau data and the reports each night', 'new job', 'Claude', 'P2'),
        I('One definition of each measure shared by the dashboards and the bank reports', 'documentation', 'Claude',
          'P2'),
        I('Analytics provider chosen that keeps data in an acceptable region and needs no tracking consent prompt',
          'decision', 'Claude', 'P2'),
    ]
    ops = section('AM', 'Operations', [
        sub('AM1', 'Service Levels and Incidents', ops1, 'In the manner of a large technology company: objectives, '
                                                         'error budgets, on call and reviews.'),
        sub('AM2', 'More Runbooks', rb, 'Runbooks beyond those in section R.'),
        sub('AM3', 'Help and Support', sup),
        sub('AM4', 'Data, Measures and Reports', data, 'Items 617 to 624, 716 and 823 in detail: each event, each '
                                                       'measure and each report to the bank.'),
    ], loop=10)
    web = []
    for p in PAGES:
        web.append(I('Website page, %s: English copy' % p, 'website', 'Claude', 'P2'))
        web.append(I('Website page, %s: Urdu copy, by a translator' % p, 'website', 'Translator', 'P2'))
        web.append(I('Website page, %s: built and checked on a handset' % p, 'website', 'Claude', 'P2'))
    launch = [
        I('Brand guidelines: logo, lime palette, type, tone of voice, Urdu usage', 'design', 'Claude', 'P2'),
        I('Founder profile written with care for the founder\'s age and the director\'s role', 'content', 'Claude', 'P2'),
        I('Plan for the first 100 circles: hosts, circle types, cities', 'marketing', 'Chairman', 'P2'),
        I('Waiting list on the website before launch', 'website', 'Claude', 'P2'),
        I('Referral rules: points only when the referred member completes a circle cleanly', 'content', 'Claude', 'P2'),
        I('Social accounts registered: Facebook, Instagram, TikTok, YouTube, LinkedIn', 'marketing', 'Chairman', 'P3'),
        I('Content calendar for the first three months in English and Urdu', 'marketing', 'Claude', 'P3'),
        I('Rules for any creator or influencer: no promise of returns, the bank\'s approval first', 'marketing', 'Claude',
          'P3'),
        I('Employer programme pitch for payroll circles', 'marketing', 'Claude', 'P3'),
        I('Launch day runbook: staffing, monitoring, messages, rollback', 'operations', 'Claude', 'P2'),
    ]
    hosts = [
        I('Host onboarding journey and checklist', 'new page', 'Claude', 'P2'),
        I('Host support line or channel', 'operations', 'Chairman', 'P3'),
        I('Host levels by circles completed, with what each level opens', 'decision', 'Chairman', 'P3'),
        I('Host community for sharing practice, moderated', 'operations', 'Chairman', 'P3'),
        I('Host removal of rights after misconduct, with an appeal', 'process', 'Claude', 'P2'),
    ]
    partners = [
        I('Employers approached for payroll circles, with the bank\'s corporate team', 'commercial', 'Chairman', 'P3'),
        I('Raqami\'s payroll clients approached with Raqami', 'commercial', 'Chairman', 'P3'),
        I('Marketplace merchants approached: electronics and appliances', 'commercial', 'Chairman', 'P3'),
        I('Marketplace merchants approached: groceries', 'commercial', 'Chairman', 'P3'),
        I('Marketplace merchants approached: school fees and books', 'commercial', 'Chairman', 'P3'),
    ]
    grow = section('AN', 'Growth and Brand', [
        sub('AN1', 'Website', web), sub('AN2', 'Launch', launch), sub('AN3', 'Hosts', hosts),
        sub('AN4', 'Partners', partners),
    ], loop=10)
    mq = [
        I('Mashreq: meeting date fixed and the attendees on both sides known', 'meeting', 'Chairman', 'P0'),
        I('Mashreq: agenda sent ahead of the meeting', 'meeting', 'Claude', 'P1'),
        I('Mashreq: first stage proposal written as a separate document, not in the deck', 'documents', 'Claude', 'P1',
          2),
        I('Mashreq: integration discovery session with the bank\'s technology team', 'bank', 'Bank', 'P1'),
        I('Mashreq: the NEO product team named as the product owner', 'bank', 'Bank', 'P1'),
        I('Mashreq: the account that holds committee balances agreed: Islamic Current Profit Account or Islamic '
          'Savings Account', 'bank', 'Bank', 'P1'),
        I('Mashreq: the direct debit mandate requested as a new line, since it is not published today', 'bank', 'Bank',
          'P0'),
        I('Mashreq: the Mashreq Pakistan Account route for UAE families confirmed', 'bank', 'Bank', 'P3'),
        I('Mashreq: its insurance partner or a takaful operator chosen for circles between strangers', 'bank', 'Bank',
          'P1'),
        I('Mashreq: its TASDEEQ membership confirmed as the reporting route, or Halqa as data provider', 'bank', 'Bank',
          'P1'),
        I('Mashreq: Shariah board submission for the Islamic window', 'bank', 'Bank', 'P1'),
        I('Mashreq: its outsourcing questionnaire obtained and answered', 'documents', 'Claude', 'P1', 2),
        I('Mashreq: co-marketing plan and who pays', 'commercial', 'Chairman', 'P3'),
    ]
    rq = [
        I('Raqami: who introduces Halqa to Raqami, and the meeting date', 'meeting', 'Chairman', 'P1'),
        I('Raqami: access to its open interfaces, built for banking as a service', 'bank', 'Bank', 'P1'),
        I('Raqami: standing instruction on its planned open interfaces agreed as the automatic method', 'bank', 'Bank',
          'P1'),
        I('Raqami: 7 day Mudarabah Certificate agreed for balances between payday and the 8th', 'bank', 'Bank', 'P1'),
        I('Raqami: Asaan Digital Account limit confirmed, since its product page and FAQ differ', 'bank', 'Bank', 'P2'),
        I('Raqami: residents only, so no UAE family circles until it opens accounts to non residents', 'product',
          'Claude', 'P2'),
        I('Raqami: EFU window takaful agreed as the operator, or another the bank chooses', 'bank', 'Bank', 'P1'),
        I('Raqami: its core platform and local cloud understood, and whether Halqa must host in Pakistan to match',
          'bank', 'Bank', 'P1'),
        I('Raqami: Shariah board submission of the committee product, with contributions as interest free loans '
          'between members', 'bank', 'Bank', 'P0'),
        I('Raqami: follow up email within a day of the meeting', 'drafts', 'Claude', 'P2'),
    ]
    qa = [I('Answer prepared for the bank: %s' % q, 'meeting', 'Claude', 'P1') for q in QUESTIONS]
    banks = section('AO', 'The Two Banks', [
        sub('AO1', 'Mashreq Bank Pakistan', mq), sub('AO2', 'Raqami Islamic Digital Bank', rq),
        sub('AO3', 'Questions a Bank Will Ask', qa, 'Item 1012 by question: each likely question with an answer '
                                                    'written and rehearsed.'),
    ], loop=10)
    adopt = [I(t, 'Halqa application', 'Claude', p) for t, p in ADOPT]
    decide = [I(t, 'decision', 'Chairman', p) for t, p in DECIDE]
    excluded = [I(t, 'decision', 'Chairman', 'P2', 1, 'Done') for t in EXCLUDED]
    bm = section('AP', 'Features Measured against Other Finance Applications', [
        sub('AP1', 'Adopted', adopt), sub('AP2', 'For Decision', decide), sub('AP3', 'Excluded', excluded),
    ], COVERED, loop=10)
    return [gov, ops, grow, banks, bm]
