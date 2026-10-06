# -*- coding: utf-8 -*-
"""Pass 2: what Pakistani regulation requires of a committee product run through a bank, with Halqa as the bank's
service provider. Sources are listed in the register's Research Basis section."""
from common import I, sub, section


def C(t, w='documentation', pri='P1', eff=1, st='Open'):
    return I(t, w, 'Claude', pri, eff, st)


def B(t, w='bank', pri='P1'):
    return I(t, w, 'Bank', pri, 1)


def L(t, w='legal', pri='P1'):
    return I(t, w, 'Counsel', pri, 1)


def H(t, w='chairman', pri='P1'):
    return I(t, w, 'Chairman', pri, 1)


def build():
    outsourcing = [
        B('The bank\'s materiality assessment of the Halqa arrangement under its outsourcing framework (BPRD Circular 06 '
          'of 2017, revised by Circular 06 of 2019)', pri='P0'),
        C('List of Halqa\'s own suppliers with what each processes: Vercel, Supabase, Amazon Web Services, Meta, Safepay, '
          'Google, Sentry, Resend, the domain registrar'),
        L('No further subcontracting of a material function without the bank\'s written consent'),
        C('Exit plan behind the clause of item 678: return of every record, transfer to another provider or to the bank, '
          'within a stated period', eff=2),
        C('Concentration statement: Halqa depends on one bank and the bank on one committee provider, with mitigations'),
        C('Root cause report to the bank within the agreed days after each incident notice of item 816'),
        B('Annual review of the arrangement by the bank', 'bank', 'P2'),
        B('Halqa entered in the bank\'s register of outsourcing arrangements', 'bank', 'P2'),
        L('Confirmation that no function reserved to the bank is outsourced to Halqa, including the account opening and '
          'due diligence decision'),
        C('Quarterly report to the bank\'s outsourcing unit: service measures, incidents, security measures, changes, suppliers', 'reporting',
          'P2'),
        B('Sign off of the arrangement\'s risk assessment by the bank\'s risk function'),
    ]
    cloud = [
        C('Workload inventory: every Halqa system, what it does and what data it holds', 'infrastructure', 'P0'),
        B('Each workload classified with the bank as material or non material under the State Bank\'s cloud criteria '
          '(January 2023)', pri='P0'),
        C('Onshore hosting options compared: providers in Pakistan, cost, effort and the services each lacks',
          'infrastructure', 'P1', 2),
        C('Migration plan if onshore hosting is required: database, interface service, files, backups, monitoring',
          'infrastructure', 'P1', 2),
        C('No lock in: data export format documented and an export to another provider rehearsed', 'infrastructure', 'P2',
          2),
        L('Audit rights over the cloud providers for the bank and the State Bank, through Halqa\'s contracts'),
        C('Provider assurance reports collected and kept: SOC 2 and ISO 27001 for each provider', 'governance'),
        C('Logging of cloud console activity retained and reviewed', 'security'),
        C('Shared responsibility matrix for each provider', 'governance'),
        C('Region pinned for every service, including error monitoring, email and analytics', 'infrastructure'),
        C('Annual review of the cloud arrangements against the criteria', 'governance', 'P2'),
        C('Provider status pages monitored with alerts', 'infrastructure', 'P2'),
    ]
    etg = [
        C('Technology governance roles written down: owner of systems, owner of data, owner of security, under the '
          'bank\'s Enterprise Technology Governance and Risk Management Framework (BPRD Circular 05 of 2017)', 'governance'),
        C('Technology strategy for the partnership: architecture, suppliers, growth to 100,000 members', 'documentation',
          'P2', 2),
        C('Technology risk assessment, refreshed each quarter for the bank\'s board reporting', 'governance'),
        C('Change management procedure: request, review, approval, test, release, record', 'process'),
        C('Project management record for every integration with the bank', 'process', 'P2'),
        C('Secure development life cycle documented: design review, code review, tests, scans, release approval', 'process'),
        C('System acquisition checklist for any new supplier or library', 'process', 'P2'),
        C('Information technology operations manual: jobs, schedules, monitoring, backups, restores', 'documentation',
          'P2', 2),
        C('Capacity plan for 100,000 members: database, jobs, messages, bank calls', 'infrastructure', 'P2'),
        C('Patch management: dependencies updated on a schedule, urgent fixes within stated days', 'process'),
        C('Configuration management: every environment\'s settings recorded and reviewed', 'infrastructure'),
        C('Asset inventory: domains, accounts, keys, devices, licences, with owners', 'governance'),
        C('Logging and monitoring standard: what is logged, where, for how long, who reviews', 'security'),
        I('Independent technology audit of Halqa before the pilot, if the bank requires it', 'external', 'Auditor', 'P2', 1),
    ]
    onboarding = [
        B('Biometric verification by the bank as the primary method under the Consolidated Customer Onboarding Framework '
          '(BPRD Circular 01 of 2025)', pri='P0'),
        B('Fallback order agreed: Verisys with the CNIC and mobile number pairing and a code, then Verisys with a debit '
          'block, then a branch'),
        C('Each fallback step shown in Halqa\'s journey in plain words, with what the member must do next', 'app'),
        B('Route for members abroad holding a NICOP or POC, for Mashreq\'s accounts for non resident Pakistanis', pri='P2'),
        B('Route for senior citizens and for members with disabilities, where the framework allows Verisys instead', pri='P2'),
        C('Evidence pack for the bank\'s annual audit of digital onboarding: journey, logs, error rates', 'reporting', 'P2'),
        C('No biometric template stored by Halqa', 'security', 'P0'),
        C('Halqa\'s own liveness check used only where the bank does not share its result', 'lib/identity-score.ts'),
        C('Joining a circle blocked until the bank confirms the account is verified and active', 'lib/bank-accounts.ts',
          'P0'),
        C('CNIC expiry tracked: renewal requested before expiry, joining paused after it', 'lib/identity-score.ts'),
        B('Change of mobile number: re-pairing with the CNIC at the bank before Halqa updates its record'),
        C('Onboarding funnel report for the bank: started, verified, failed, abandoned, by step', 'reporting', 'P2'),
        C('Name match between the CNIC, the bank account title and the Halqa profile, with the 0.90 and 0.80 thresholds',
          'lib/identity-score.ts'),
    ]
    channel = [
        C('Transaction PIN, separate from the unlock PIN, for every financial action in Halqa: authorising a mandate, '
          'buying points, changing the payout account, accepting a turn trade (PSP&OD Circular 01 of 2024)',
          'routes/auth.ts', 'P0', 2),
        C('Alerts for financial events by push and in the application that the member cannot switch off',
          'lib/notices.ts', 'P0'),
        C('Complete log of every alert sent, kept for disputes and claims', 'schema.prisma', 'P0'),
        C('Device binding: one bound device per member, bound at first sign in', 'routes/auth.ts', 'P0', 2),
        C('Two hour cooling off after a device change: no mandate authorisation, payout change or points purchase',
          'lib/security.ts', 'P0'),
        C('No SMS code used to authorise a financial action where the bank uses a transaction PIN', 'routes/auth.ts'),
        C('Screen capture blocked on the PIN, CNIC, account and receipt screens in the native build', 'native'),
        C('Emulator detection before financial actions in the native build', 'native', 'P2'),
        C('Fraud reports routed to the bank the same day, so the bank\'s liability framework (BPRD Circular 04 of 2023) '
          'is not triggered by Halqa\'s delay', 'operations', 'P0'),
        B('The bank\'s mobile application security baseline obtained, so Halqa\'s application meets it', pri='P0'),
    ]
    fraud = [
        C('Security advice to members inside the application: Halqa never asks for a PIN or a code', 'content', 'P0'),
        C('Fraud signals sent to the bank\'s fraud unit: device changes, many accounts on one device, rapid joins, payout '
          'account changes', 'new lib/fraud-signals.ts', 'P1', 2),
        C('Block request from the member passed to the bank immediately, with a reference returned', 'new route', 'P0'),
        C('Dispute raised in the application reaches the bank the same day', 'routes/disputes.ts', 'P0'),
        C('Warning before a payout account change: who may be asking and why', 'content'),
        C('Monthly fraud report to the bank: cases, losses, time to block', 'reporting', 'P2'),
        C('Payouts to accounts opened in the last few days held for review', 'lib/payout.ts'),
        C('Limit on circles joined per member per day', 'lib/score-bands.ts'),
    ]
    complaints = [
        C('Complaint intake inside the application with categories agreed with the bank', 'new page', 'P1'),
        C('Turnaround to the bank\'s rules: 3 working days for simple matters, 7 for others, all within 15 days, and fraud '
          'within 30 days (BC&CPD Circular Letter 02 of 2021)', 'process'),
        C('Account and payment complaints handed to the bank\'s complaint unit, with the member told', 'operations'),
        C('Root cause review for any complaint category that repeats', 'process', 'P2'),
        C('Complaints between hosts and members handled under the host rules, apart from service complaints', 'process'),
        C('Complaint turnaround dashboard', 'new admin page', 'P2'),
    ]
    conduct = [
        C('Product approval paper for the committee product with its conduct risks, for the bank\'s committee',
          'documentation', 'P1', 2),
        C('Evidence of fair pricing: one flat fee for every seat, no rate, no charge for an early turn', 'documentation'),
        C('Members needing more help: first time users, older members, Urdu readers; a support route for each', 'process'),
        C('Rewards for hosting tied to circles completed cleanly, never to the number recruited', 'lib/rewards.ts'),
        C('24 hours to withdraw at no cost after joining', 'lib/agreements.ts'),
        C('Input to the bank\'s annual conduct self assessment under its Conduct Assessment Framework', 'reporting', 'P2'),
        B('Marketing material approved by the bank before use', pri='P2'),
        C('Plain statement of what happens when someone stops paying, shown before joining', 'content'),
        C('Host code of conduct: admission, reminders, removal, no pressure and no public shaming', 'content'),
    ]
    kfs = [
        C('Key fact statement for the committee product in the bank\'s format (BC&CPD Circulars 2 of 2016 and 02 of 2020)',
          'content', 'P0', 2),
        C('Key fact statement contents: instalment, members, order of turns, the Rs 85 fee, the PSP service fee on wallet '
          'and card, the takaful or insurance fee by name, late charges, points, leaving, complaints', 'content', 'P0'),
        C('Key fact statement shown before commitment and accepted in the application', 'new page', 'P0'),
        C('Accepted key fact statement kept with the member\'s agreement and a copy given to the member', 'routes/agreements.ts'),
        C('Key fact statement available on the website and in the application at all times', 'content'),
        I('Key fact statement in Urdu', 'content', 'Translator', 'P0'),
        C('Key fact statement versioned, with notice to members of any change', 'routes/agreements.ts'),
        C('Key fact statement for Hyper, marked experimental', 'content'),
        C('Key fact statement for buying points with money (Mashreq)', 'content', 'P2'),
        B('Key fact statement of the bank\'s savings product used between payday and the 8th'),
    ]
    aml = [
        B('Customer due diligence by the bank on every member before any circle', pri='P0'),
        C('Committee typologies agreed with the bank: circular payments, many circles for one person, payouts to third '
          'parties, structuring into small instalments', 'documentation'),
        C('A member the bank flags is blocked from joining, paying out and trading turns at once', 'lib/bank-accounts.ts',
          'P0'),
        C('No message that could tip off a member under review', 'content'),
        B('Hosts screened like members'),
        B('Politically exposed persons handled under the bank\'s enhanced due diligence'),
        B('Source of funds questions agreed for the large circles at Rs 25,000 an instalment', pri='P2'),
        B('Annual money laundering risk assessment of the committee product', pri='P2'),
    ]
    payments = [
        C('Check that no automatic debit runs without a recorded mandate; item 775 keeps the records under the Payment '
          'Systems and Electronic Fund Transfers Act 2007', 'lib/bank-mandate.ts', 'P0'),
        C('Raast request to pay costs the payer nothing, as the State Bank requires for P2M payments', 'lib/bank-payments.ts'),
        C('Raast request to pay supported for paying now and for paying later', 'lib/bank-payments.ts'),
        C('Raast QR for paying a collector directly', 'new component', 'P2'),
        C('Wallet limits respected for payouts to wallets, under the EMI regulations of 2023', 'lib/payout.ts'),
        C('Payments initiated only through licensed entities: the bank and the PSP', 'lib/payment-provider.ts', 'P0'),
        H('The PSP\'s licence and its scope recorded and checked each year', 'commercial'),
        H('Halqa\'s merchant category agreed with the PSP', 'commercial', 'P2'),
    ]
    shariah = [
        C('Late charges on Raqami circles paid to charity, recorded and reported', 'ledger'),
        B('Takaful only for Raqami, no conventional insurance'),
        B('Annual Shariah audit of the product by the bank', pri='P2'),
        C('No Shariah label in Halqa\'s own materials; the bank\'s own approval statement only where the bank requires it',
          'content'),
        B('Fee documented as ujrah for service on Raqami circles'),
    ]
    cyber = [
        C('Halqa\'s security programme mapped to the bank\'s cyber resilience requirements under the State Bank\'s Cyber '
          'Shield strategy (CRMD Circular Letter 01 of 2026)', 'security', 'P1', 2),
        C('Threat intelligence sources followed and logged', 'security', 'P2'),
        C('Security event logging to the bank\'s standard', 'security'),
        I('Penetration test repeated each year after the first (item 705), with every finding fixed', 'external', 'Tester', 'P2'),
        B('Red team exercise if the bank requires one', pri='P3'),
        H('Phishing exercise for everyone with access', 'governance', 'P3'),
        C('Secure configuration baselines for every service', 'security'),
    ]
    data = [
        C('Consent record for each purpose, with the time, the version and the address', 'schema.prisma', 'P0'),
        C('Transfer of data to Singapore disclosed and consented, and accepted by the bank', 'content', 'P0'),
        C('Requests from members to see, correct or delete their data, with stated times', 'new page'),
        C('Review of every field collected against the purpose it serves', 'review'),
        C('Personal Data Protection Bill watched, since Pakistan has no data protection law in force; readiness noted',
          'documentation', 'P3'),
        C('Prevention of Electronic Crimes Act 2016 considered in the security controls', 'documentation', 'P2'),
        C('No data collected from anyone under 18', 'routes/auth.ts'),
        C('Location as a one time pin only, never tracked', 'app'),
        C('No access to contacts, photos or call logs', 'app', 'P0'),
    ]
    bureau = [
    ]
    corporate = [
        H('Statutory registers kept: members, directors, charges, beneficial owners', 'corporate'),
        H('Board meetings held and minuted, with resolutions filed where required', 'corporate'),
        H('Annual return filed with the SECP each year', 'corporate', 'P2'),
        H('Financial statements prepared, audited and filed each year', 'finance', 'P2'),
        I('Income tax return filed each year', 'tax', 'Tax adviser', 'P2'),
        I('Withholding tax deducted and statements filed', 'tax', 'Tax adviser', 'P2'),
        I('Sales tax returns on services filed each month in the Islamabad Capital Territory', 'tax', 'Tax adviser', 'P2'),
        H('Beneficial ownership declaration filed', 'corporate'),
        H('Registered office notice kept current', 'corporate', 'P3'),
        H('Compliance calendar with every filing date and owner', 'corporate'),
        L('Directors\' duties briefing for the board', 'P2'),
    ]
    stores = [
        C('Target platform version kept current for Google Play', 'native', 'P2'),
        C('Permission declarations for the camera, used for CNIC capture only', 'compliance'),
        C('Apple privacy labels answered from the data inventory', 'compliance'),
        C('No tracking across other companies\' applications, so no tracking prompt is needed', 'review'),
        C('Review notes for both stores explaining the partner bank and test accounts', 'distribution'),
        C('Store screenshots free of real member data', 'design'),
        H('Store contact details and support address in the company\'s name', 'distribution'),
    ]
    S = lambda c, t, items, p='': sub(c, t, items, p)
    return section('AB', 'Regulatory Compliance through the Partner Bank', [
        S('AB1', 'Outsourcing', outsourcing, 'Halqa is assessed as the bank\'s service provider (BPRD Circular 06 of 2017, '
                                             'revised 2019).'),
        S('AB2', 'Cloud', cloud, 'State Bank criteria for cloud outsourcing (January 2023): for banks, material workloads '
                                 'on an offshore provider need approval; Halqa is hosted in Singapore today.'),
        S('AB3', 'Technology Governance', etg, 'Enterprise Technology Governance and Risk Management Framework (BPRD '
                                               'Circular 05 of 2017), applied through the bank.'),
        S('AB4', 'Customer Onboarding', onboarding, 'Consolidated Customer Onboarding Framework (BPRD Circular 01 of 2025).'),
        S('AB5', 'Digital Channel Security', channel, 'PSP&OD Circular 01 of 2024, in force from 1 January 2025.'),
        S('AB6', 'Digital Fraud', fraud, 'BPRD Circular 04 of 2023 on digital fraud.'),
        S('AB7', 'Complaints', complaints, 'BC&CPD Circular Letter 02 of 2021 on the consumer grievance mechanism.'),
        S('AB8', 'Conduct', conduct, 'Conduct Assessment Framework and fair treatment of customers.'),
        S('AB9', 'Key Fact Statement', kfs),
        S('AB10', 'Money Laundering and Sanctions', aml, 'The bank\'s AML, CFT and CPF regulations under section 6A(2) of '
                                                        'the Anti Money Laundering Act 2010.'),
        S('AB11', 'Payments', payments),
        S('AB12', 'Shariah Governance', shariah, 'For the Islamic window at Mashreq and for Raqami.'),
        S('AB13', 'Cyber Security', cyber),
        S('AB14', 'Data Protection', data),
        S('AB15', 'Company Filings', corporate),
        S('AB16', 'Application Stores', stores),
    ], 'Each item maps a requirement that applies to the bank, or to Halqa as its service provider, to the work that '
       'meets it. The bank\'s compliance function confirms the final list.', loop=2)
