# -*- coding: utf-8 -*-
"""Licence documents: registrations and licences required, and the incorporation checklist."""
import os, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import docgen as D

OUT = os.path.join(D.HERE, 'out', 'licence')
os.makedirs(OUT, exist_ok=True)
CHAIR = 'Taha Amjed, Chairman, and Mr Akif Saeed'

REG = [
    ['1', 'Incorporation as a private limited company', 'SECP, through eZfile', 'Companies Act 2017; Companies Regulations 2024', 'First', '2 to 5 days'],
    ['2', 'National Tax Number', 'FBR, through IRIS', 'Income Tax Ordinance 2001', 'On incorporation', '1 to 2 days'],
    ['3', 'Sales tax on services', 'FBR, for the Islamabad Capital Territory', 'Islamabad Capital Territory (Tax on Services) Ordinance 2001', 'Before the first fee is charged', '3 to 5 days'],
    ['4', 'Company bank account', 'A scheduled bank of the company&rsquo;s choice', 'Bank&rsquo;s own account opening rules', 'After the NTN', '7 to 14 days'],
    ['5', 'Payment partner services agreement', 'NayaPay or SadaPay, electronic money institutions', 'Regulations for Electronic Money Institutions 2023, para 7.I(f) and (h)', 'Before live money', '14 to 21 days, plus the partner&rsquo;s 30 day notice'],
    ['6', 'Merchant agreement for Halqa&rsquo;s own fee', 'PayFast or Safepay', 'Commercial contract', 'Before live money', 'With item 5'],
    ['7', 'Identity verification agreement', 'NADRA, Verisys', 'Commercial contract', 'Before unknown committees', 'In parallel'],
    ['8', 'Bureau subscriber agreement', 'TASDEEQ', 'Credit Bureaus Act 2015, section 19(1)(b)', 'Before seat rules use bureau data', 'In parallel'],
    ['9', 'Takaful agency agreement', 'Pak-Qatar General Takaful or Salaam Takaful', 'Insurance Ordinance 2000, sections 96 and 98; Corporate Insurance Agents Regulations 2020', 'Before cover is offered', '28 to 56 days'],
    ['10', 'MUFAP membership and distribution agreement', 'Mutual Funds Association of Pakistan; Mahaana Wealth', 'SECP direction of April 2026', 'Before savings are offered', 'Stage 2'],
    ['11', 'Modaraba agreement for asset committees', 'Orix, First Habib, Allied Rental or First Punjab Modaraba', 'Commercial contract, with counsel&rsquo;s opinion', 'Before asset committees', 'Later'],
    ['12', 'Trademark', 'IPO-Pakistan', 'Trade Marks Ordinance 2001', 'Early, to protect the name', 'Examination about 3 months'],
]

req = []
req.append('<h2>1. The position</h2>' + D.para(
    'Halqa requires no financial licence. It does not accept deposits, lend, issue electronic money, operate a payment '
    'system, write insurance or run a credit bureau, and it seeks no regulatory approval and no sandbox. What it needs is a '
    'company, tax registrations, a bank account for its own revenue, and commercial agreements with licensed parties who '
    'carry their own licences. The registered office will be in Islamabad.'))
req.append('<h2>2. Everything required, in order</h2>' + D.table(
    [['#', 'Registration or agreement', 'With', 'Law or basis', 'When', 'Time']] + REG,
    widths=['4%', '22%', '20%', '26%', '14%', '14%']))
req.append('<h2>3. Directors and shareholding</h2>'
           + D.quote('A person shall not be eligible for appointment as a director of a company, if he ... (a) is a minor; ... (h) does not hold National Tax Number as per the provisions of Income Tax Ordinance, 2001',
                     'Companies Act 2017, section 153. A person domiciled in Pakistan attains majority on completing eighteen years (Majority Act 1875, section 3)')
           + D.quote('(a) a single member company shall have at least one director; (b) every other private company shall have not less than two directors',
                     'Companies Act 2017, section 154(1)')
           + D.bullets([
               'Taha Amjed is 17, so he cannot be appointed a director. His father will be a director and the first chief '
               'executive, whom the subscribers name at incorporation (section 186(2)).',
               'A private company with two members needs two directors, so a second adult is required as the other '
               'subscriber and director. Alternatively the company is formed as a single member company with the father as '
               'its member and director.',
               'A minor cannot sign the memorandum as a subscriber, because a minor cannot contract. How shares are held for '
               'Taha until his eighteenth birthday, and transferred to him then, is for counsel to set out.',
               'Every director needs a personal NTN before appointment (section 153(h)).',
               'Every director must also be a member, holding shares, unless the director is the chief executive, a '
               'full time director employed by the company, or represents a member that is not a natural person (section 153(i) and its proviso). '
               'The father, as chief executive, falls within the proviso; the second director should be a subscriber.',
               'Until he is 18, Taha is described in filings as founder, not as a director or chairman of the board.',
             ]))
req.append('<h2>4. Tax</h2>'
           + D.quote('IT services and IT-enabled services ... Fifteen percent', 'Islamabad Capital Territory (Tax on Services) Ordinance 2001, Schedule, Table-1, entry 11, as updated to 30 June 2025')
           + D.bullets([
               'Halqa&rsquo;s service fee is most likely taxable in Islamabad as an IT enabled service at 15 per cent. A tax '
               'adviser should confirm the classification before registration.',
               'Registration follows the Sales Tax Act 1990 procedure, which the Ordinance applies to &ldquo;registration and de-registration&rdquo;.',
               'The fee grid is stated before this tax. Either the member pays the tax on top, or Halqa&rsquo;s net fee falls '
               'to Rs 86.96 in every Rs 100.',
             ]))
req.append('<h2>5. Takaful agency, correctly stated</h2>'
           + D.para('The Insurance Ordinance 2000 licenses insurance brokers (section 102) but does not register insurance '
                    'agents with the Commission. An agent acts under a written contract with the insurer, and the insurer keeps '
                    'the register of its agents.')
           + D.quote('It shall be unlawful for any person to act as an agent in respect of an insurer except under a contract in writing.',
                     'Insurance Ordinance 2000, section 96(2)')
           + D.quote('An insurer shall maintain a register of all agents employed by the insurer', 'Section 98(1)')
           + D.bullets([
               'The agency agreement must contain what regulation 4 of the Corporate Insurance Agents Regulations 2020 requires, '
               'and staff who sell cover must be certified under regulation 22.',
               'A body corporate may not act as an agent if any director, or officer engaged in the agency, is a minor '
               '(section 96(1)(a)). The father as director satisfies this.',
               'Default cover is Class 6, credit and suretyship, which only a general takaful operator writes: Pak-Qatar '
               'General Takaful Limited or Salaam Takaful Limited.',
               'Counsel should confirm that no separate Commission registration applies under the Insurance Rules 2017.',
             ]))
req.append('<h2>6. Savings, later</h2>'
           + D.quote('The Securities and Exchange Commission of Pakistan (SECP) has made it mandatory for all investment advisors '
                     'and distributors of mutual and pension funds to obtain membership of the Mutual Funds Association of Pakistan (MUFAP).',
                     'Associated Press of Pakistan, report of the SECP release, 1 April 2026')
           + D.para('Before offering savings, Halqa joins MUFAP and signs a distribution agreement with Mahaana Wealth, with the '
                    'Central Depository Company of Pakistan as trustee of the fund.'))
req.append('<h2>7. Trademark</h2>'
           + D.quote('Pay Order / Bank Draft of prescribed fee for TM-1/TM-2 i.e. Rs. 3,000 in the name of Director General, IPO-Pakistan',
                     'IPO-Pakistan, trademark frequently asked questions')
           + D.bullets(['A search of one mark in one class costs Rs 1,000; an application costs Rs 3,000 per class.',
                        'IPO-Pakistan acknowledges an application within 10 to 15 days and examines it after about 3 months. '
                        'A registration lasts 10 years.',
                        'Classes to file: software and financial technology services. Counsel or an agent confirms the classes.']))
req.append('<h2>8. Process</h2>' + D.para(
    'Each registration produces a document the next one needs. The partners who move money and write cover also connect to '
    'Halqa&rsquo;s systems, and each connection has its own steps before live use.')
    + D.table([
        ['Step', 'Input', 'Output', 'Used for'],
        ['Incorporation on eZfile', 'Subscriber and director accounts, the name, the memorandum and articles, the fee', 'Certificate of incorporation', 'Every later step'],
        ['National Tax Number on IRIS', 'Certificate of incorporation; directors&rsquo; CNICs', 'Company NTN', 'Sales tax, the bank account, every agreement'],
        ['Sales tax registration', 'NTN; the Islamabad office documents', 'Sales tax registration', 'Charging the fee with tax'],
        ['Company bank account', 'Certificate, memorandum and articles, board resolution, NTN, directors&rsquo; CNICs', 'Account and IBAN', 'Receiving the fee'],
        ['Payment partner', 'The company documents above; the bank account for the fee; a description of the service', 'Services agreement; test credentials; the partner&rsquo;s 30 day notice to the State Bank', 'Wallet linking, mandates and debits'],
        ['Payment aggregator', 'The company documents; the bank account', 'Merchant account and keys', 'The fee when paid by hand'],
        ['NADRA', 'The company documents; the purpose of each check', 'Verisys agreement and credentials', 'Identity checks'],
        ['TASDEEQ', 'The company documents; the consent flow for members', 'Subscriber agreement and credentials', 'Reports on the member&rsquo;s instruction'],
        ['Takaful operator', 'The company documents; staff for certification', 'Written agency agreement; product terms; enrolment and claims files', 'Cover on unknown committees and Hyper'],
    ], widths=['18%', '32%', '28%', '22%'])
    + D.steps([
        'Each technical connection starts in the partner&rsquo;s test environment with test credentials, where every message in '
        'Auto Debit (HQ-CP-02) is exercised, including failures, retries and webhooks.',
        'Halqa&rsquo;s security review, and a penetration test before real money moves, are completed before production '
        'credentials are issued.',
        'Production credentials are stored in Halqa&rsquo;s secrets vault, never in code, and the first live payments are made '
        'by staff before members are admitted.',
    ]))
req.append('<h2>9. Not required</h2>' + D.bullets([
    'An electronic money institution licence, a payment service provider authorisation, a finance company licence, peer to '
    'peer permission, insurer registration, payment system designation or a credit bureau licence.',
    'Any regulatory approval or sandbox participation. The reasoning, provision by provision, is in the Legal Position (HQ-LG-01).',
]))
req.append(D.summary(
    'Halqa needs a company, a tax number, sales tax registration in Islamabad, a bank account and contracts with licensed '
    'partners. It needs no financial licence. Because Taha is 17, his father becomes the director and chief executive, with a '
    'second adult director, until Taha turns 18. Takaful needs a written agency contract with a general takaful company, not '
    'a registration with SECP.'))
D.render(os.path.join(OUT, 'Registrations and Licences Required.pdf'), 'Registrations and Licences Required',
         'Every registration and agreement Halqa needs, the law behind each, and the order in which they come.',
         'HQ-LD-01', CHAIR, ''.join(req), running='Registrations and Licences Required')

# ------------------------------------------------------------------ checklist
chk = []
chk.append('<h2>1. Before filing</h2>' + D.bullets([
    'Each subscriber registers on eZfile with their CNIC, mobile number and email.',
    'Three proposed names, for example Halqa Technologies (Private) Limited, checked on the SECP name search.',
    'Personal NTNs for the directors, since a director must hold one.',
    'A registered office in Islamabad, with a rent agreement or ownership document and a recent utility bill.',
]))
chk.append('<h2>2. The filing</h2>' + D.table([
    ['Document', 'Content'],
    ['Application for name reservation and incorporation', 'Filed together through eZfile under the Companies Regulations 2024'],
    ['Memorandum of association', 'SECP model, with an object clause describing a technology service for organising rotating '
                                  'savings committees, and stating that the company does not accept deposits or lend'],
    ['Articles of association', 'SECP model for a private company limited by shares'],
    ['Subscribers', 'The father and a second adult, or the father alone for a single member company, with CNIC copies and shares taken'],
    ['Directors and chief executive', 'Consents, particulars and NTNs; the father named as first chief executive'],
    ['Declaration of compliance', 'Signed as the Regulations require'],
    ['Fee', 'Paid online, as shown by the SECP fee calculator at filing; filing online costs less than filing on paper'],
], widths=['30%', '70%']))
chk.append('<h2>3. The first two weeks after incorporation</h2>' + D.bullets([
    'Company NTN from the FBR, then sales tax registration for the Islamabad Capital Territory.',
    'Company bank account, with the certificate of incorporation, the memorandum and articles, a board resolution, the '
    'directors&rsquo; CNICs and the NTN.',
    'Enquiry sent to NayaPay and SadaPay before incorporation completes, since partner approval is the longest step.',
]))
chk.append('<h2>4. Filing Sequence</h2>' + D.steps([
    'Every subscriber and director opens an eZfile account with their CNIC, mobile number and email, and verifies it.',
    'The name is searched, and the name and the incorporation are applied for together in one application.',
    'The memorandum, the articles, the particulars of directors and the chief executive, and the declaration are uploaded '
    'and signed by each subscriber from their own account.',
    'The fee is paid online and the application is submitted. Any query from the registrar is answered in the same account.',
    'The certificate of incorporation is issued electronically and downloaded, with the certified memorandum and articles.',
    'The company NTN is then applied for on IRIS, followed by sales tax registration and the bank account.',
]))
chk.append(D.summary('File on eZfile with the father and one other adult as subscribers and directors, the father as chief '
                     'executive, an Islamabad office and an object clause that rules out deposits and lending. Then take the '
                     'tax number, sales tax registration and bank account in the first two weeks.'))
D.render(os.path.join(OUT, 'Incorporation Checklist.pdf'), 'Incorporation Checklist',
         'What to prepare and file to incorporate Halqa in Islamabad, with the father as director.',
         'HQ-LD-02', 'Taha Amjed, Chairman', ''.join(chk), classification='Internal', running='Incorporation Checklist', compact=True)
for f in ('Registrations and Licences Required.pdf', 'Incorporation Checklist.pdf'):
    print(f, D.pdf_pages(os.path.join(OUT, f)))
