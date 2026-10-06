# -*- coding: utf-8 -*-
"""Legal Position: the design as it stands, provision by provision, with the text of every law relied on
and where it is found. Every quotation is verified against its source by lawcite before rendering."""
import os, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import docgen as D
import lawcite as L

OUT = os.path.join(D.HERE, 'out', 'legal')
os.makedirs(OUT, exist_ok=True)


def Q(key, text, prov):
    return L.cite(D, key, text, prov)


def P(*paras):
    return ''.join(D.para(p) for p in paras)


b = []
b.append(P(
    'Halqa is a technology company that organises rotating savings committees, known in Pakistan as committees or kameti, '
    'on a mobile application. This document sets out the legal position of Halqa&rsquo;s design as it stands: what each '
    'relevant law controls, the text of the provision, where the text is found, and why the design falls outside it or '
    'complies with it. Each quotation has been checked word for word against the source named beneath it, and the page '
    'given is the page of that source on which the quotation begins.',
    'This is a statement of position for counsel to confirm. It is not legal advice.'))

b.append('<h2>1. The position in brief</h2>' + D.bullets([
    'Halqa does not accept deposits, lend, arrange loans between members, issue electronic money, operate or provide a '
    'payment system, write insurance or operate a credit bureau. Each of those activities needs a licence, and each '
    'licensing provision is written against conduct that Halqa does not carry out.',
    'A member&rsquo;s contribution moves from the member&rsquo;s own account to the collecting member&rsquo;s account through '
    'a licensed electronic money institution. The only money Halqa receives is its own service fee and, later, commissions.',
    'Cover against default is written by a licensed general takaful operator. Halqa acts as that operator&rsquo;s agent '
    'under a written agency agreement.',
    'Credit reports are released by TASDEEQ on the member&rsquo;s own instruction.',
    'Halqa needs a company, a National Tax Number, sales tax registration in Islamabad and commercial agreements with '
    'licensed parties. It needs no financial licence, no regulatory approval and no place in the regulatory sandbox.',
]))

b.append('<h2>2. How a payment moves</h2>' + P(
    'Every payment a member makes is divided at the moment it is taken into up to three parts, each sent directly to its '
    'owner. No part passes through an account of Halqa&rsquo;s, except Halqa&rsquo;s own fee.') + D.table([
        ['Part', 'From', 'To', 'Whose money', 'Law that governs it'],
        ['Contribution', 'The paying member&rsquo;s bank or wallet account', 'The collecting member&rsquo;s account', 'The collecting member',
         'Moved by the licensed electronic money institution under its licence (section 7)'],
        ['Takaful contribution, where cover applies', 'The paying member&rsquo;s account', 'The participants&rsquo; risk fund at the takaful operator',
         'The participants', 'Insurance Ordinance 2000 and Corporate Insurance Agents Regulations 2020 (sections 10 and 11)'],
        ['Service fee', 'The paying member&rsquo;s account', 'Halqa&rsquo;s company account', 'Halqa',
         'An advance for services, outside the meaning of a deposit (section 3)'],
    ], widths=['17%', '20%', '21%', '15%', '27%']))

# ---------------------------------------------------------------- 3 deposits
b.append('<h2>3. Deposits</h2>' + P(
    'The Companies Act 2017 prohibits every company other than a bank, or a company the Commission exempts, from taking '
    'deposits from the public. The prohibition carries a penalty on the company of at least the amount taken, and personal '
    'liability, including imprisonment, for every officer in default. It is the most serious risk in any committee platform, '
    'because a platform that collects members&rsquo; contributions into its own account and pays them out later is holding '
    'deposits.')
    + Q('CA', '(1) On and after the commencement of this Act, no company shall invite, accept or renew deposits from the public: '
              'Provided that nothing in this sub-section shall apply to a banking company and such other company or class of '
              'companies or such deposits as the Commission may, notify in this behalf.', 'section 84(1), Prohibition on acceptance of deposits from public')
    + Q('CA', 'Explanation. For the purposes of this section, "deposit" means any deposit of money with, and includes any amount '
              'borrowed by, a company, but shall not include a loan raised by issue of debentures or a loan obtained from a '
              'banking company or financial institution or an advance against sale of goods or provision of services in the '
              'ordinary course of business.', 'section 84, Explanation')
    + Q('CA', '(3) In addition to the fine on the company under sub-section (2), every officer of the company which is in default '
              'shall be punishable with imprisonment for a term which may extend to two years and shall also be liable to fine '
              'which may extend to five million rupees.', 'section 84(3)')
    + P('Halqa stays outside section 84 in three ways.')
    + D.bullets([
        'Contributions never reach Halqa. They are debited from the paying member and credited to the collecting member by '
        'the licensed partner in one movement, so no deposit is ever made with Halqa.',
        'Halqa&rsquo;s fee is charged for the committee service. The last words of the Explanation, &ldquo;an advance against '
        'sale of goods or provision of services in the ordinary course of business&rdquo;, exclude such a payment from the '
        'meaning of a deposit.',
        'Halqa keeps no balance for any member, positive or negative. A missed payment is recorded as owed by the late member '
        'to the member left short, not to Halqa, so no claim on Halqa and no sum held by Halqa ever arises.',
    ])
    + P('The design would fall inside section 84 if Halqa held any contribution, even for a day; kept a wallet balance for '
        'members; pooled the day&rsquo;s Hyper payments before paying them out; or collected contributions by a Raast Request '
        'to Pay, which settles into the requesting merchant&rsquo;s own account (section 9 below).'))

# ---------------------------------------------------------------- 4 associations
b.append('<h2>4. Associations of more than twenty persons</h2>' + P(
    'A group of more than twenty persons carrying on business for gain must register as a company. A large committee '
    'could be read as such a group.')
    + Q('CA', 'No association, partnership or entity consisting of more than twenty persons shall be formed for the purpose of '
              'carrying on any business that has for its object the acquisition of gain by the association, partnership or '
              'entity, or by the individual members thereof, unless it is registered as a company under this Act',
        'section 9(1), Obligation to register certain associations, partnerships as companies')
    + P('A committee has no object of gain. Each member receives exactly the total of the contributions each member pays, and '
        'no member receives anything from another member beyond that. Rewards to members in later seats are paid by Halqa from '
        'its own revenue, not by other members, so no member gains at another&rsquo;s expense. The only business carried on for '
        'gain is Halqa&rsquo;s, and Halqa is itself a registered company.'))

# ---------------------------------------------------------------- 5 lending
b.append('<h2>5. Lending and peer to peer lending</h2>' + P(
    'Lending as a business requires a non-banking finance company licence under Part VIIIA of the Companies Ordinance 1984, '
    'which the Companies Act 2017 keeps in force. A platform that lets one person lend to another requires, in addition, the '
    'Commission&rsquo;s permission as a peer to peer service provider.')
    + Q('CA', 'The Companies Ordinance, 1984 (XLVII of 1984), hereinafter called as repealed Ordinance, shall stand repealed, except '
              'Part VIIIA consisting of sections 282A to 282N', 'section 509(1), Repeal and savings')
    + Q('P2P', '"Peer to Peer Lending" or "P2P Lending" shall mean the extension of loans by the lender to the borrower through the P2P '
               'Lending Platform whereas the Platform would be an intermediary providing P2P services through online medium or '
               'otherwise to the participants who have entered into an arrangement with that platform to lend or to borrow money.',
        'definition of Peer to Peer Lending')
    + Q('P2P', 'The aggregate loans taken by a borrower at any point of time, across all P2P Lending Platforms, shall be subject to a '
               'cap of Rs1,000,000 whereas the exposure of a single lender to the same borrower, across all P2P Lending Platforms, '
               'shall not exceed Rs500,000.', 'limits on borrowers and lenders')
    + P('The definition needs a lender, a borrower and a loan. In a committee a member who collects early does receive money '
        'before paying it all in, but no member lends to another in return for anything more. Four features of the design keep '
        'it that way:')
    + D.bullets([
        'No member pays another member for a seat or for time. The sale of turns between members is not offered.',
        'Halqa&rsquo;s fee is the same for every seat, so it cannot be read as a price for collecting early.',
        'No annual rate or interest is computed anywhere in the product.',
        'Where a member wants money before their seat, the only route is a seat exchange, in which nothing passes between the '
        'two members (Seat Exchange and Points, HQ-CP-04); and on asset committees the modaraba, not Halqa, buys and leases the asset.',
    ])
    + P('The regulation text above is taken from a press report of the notification, because the Commission&rsquo;s own '
        'consolidated text could not be retrieved; counsel should confirm it against the notified text.'))

# ---------------------------------------------------------------- 6 electronic money
b.append('<h2>6. Electronic money</h2>' + P(
    'Issuing electronic money requires a licence from the State Bank, which carries initial capital of Rs 200 million. The '
    'test is whether a person holds value for others as a claim on itself.')
    + Q('PSEFT', '"Electronic Fund or Electronic Money" means money transferred through an Electronic Terminal, ATM, telephone '
                 'instrument, computer, magnetic medium or any other electronic device so as to order, instruct or authorize a '
                 'banking company, a Financial Institution or any other company or person to debit or credit an account and '
                 'includes monetary value as represented by a claim on the issuer which is stored in an electronic device or '
                 'Payment Instrument, issued on receipt of funds of an amount not less in value than the monetary value issued, '
                 'accepted as means of payment by undertakings other than the issuer ...', 'section 2(s)')
    + Q('PSEFT', '(1) An applicant that wants to become an Electronic Money Institution shall submit an application to the State Bank '
                 'for issue of a license to perform Electronic Money activity. (2) An Electronic Money Institution may perform only '
                 'such activities as are specified in its license.', 'section 24, Electronic Money Institution')
    + Q('EMI', 'An entity desirous of becoming an EMI is required to fulfill initial/startup capital requirement of PKR 200 million',
        'paragraph 11.I, Capital requirements')
    + P('Halqa issues no claim on itself and receives no funds against one. A member sees what they owe and what they will '
        'receive in each circle, but never a balance held by Halqa, so the definition is not met and no licence is needed.')
    + P('The points Halqa gives as rewards are not electronic money either. The State Bank&rsquo;s own definition requires value '
        'issued on receipt of funds and accepted by undertakings other than the issuer. Points are issued as rewards, never against '
        'money, and are redeemed only with Halqa, which buys any voucher itself.')
    + Q('EMI', 'Electronic Money or E-money: means the monetary value as represented by a claim on the issuer which is stored in an '
               'electronic including magnetic device or Payment Instrument, issued on receipt of funds of an amount not less in value '
               'than the monetary value issued, accepted as means of payment by undertakings other than the issuer',
        'paragraph 2, Definitions'))

# ---------------------------------------------------------------- 7 payment services and the partner
b.append('<h2>7. Payment services and the payment partner</h2>' + P(
    'Routing and processing payments for others requires authorisation from the State Bank as a payment system operator or '
    'payment service provider, with capital of Rs 200 million. Halqa does neither: it instructs a licensed institution, which '
    'moves the money. The choice of that institution is itself a legal point, because a payment service provider may not hold '
    'customer money, while an electronic money institution may offer payment initiation to other firms through its interface.')
    + Q('PSO', 'Payment System Operator and Payment Service Provider (PSO and PSP) means such Authorized Party that is a company '
               'registered under Companies Ordinance 1984 and is engaged in operating and/or providing Payment Systems related '
               'services like electronic payment gateway, payment scheme, clearing house, ATM Switch, POS Gateway, E-Commerce '
               'Gateway etc. acting as an intermediary for multilateral routing, switching and processing of payment transactions.',
        'rule 2(p)')
    + Q('PSO', 'PSOs and PSPs will not act as custodian of consumer\'s money or perform any banking function(s) as defined in BCO, 1962.',
        'rule 6(5)')
    + Q('EMI', '(f) Services relating to payment aggregation, bill/invoice aggregation, payment initiation, as well as account '
               'information etc. ... (g) Offer escrow services for facilitating domestic e-commerce transactions. However, EMIs shall '
               'obtain separate approval from SBP. (h) Offer services via secured Application Programming Interfaces (APIs) and '
               'other secure methods to other Financial Institutions, Third Party Service Providers (TPSPs) and other Fintech. In '
               'this regard, the EMIs have to intimate SBP 30 days prior to offering these services.', 'paragraph 7.I(f), (g) and (h)')
    + Q('PSEFT', '"Authorized Party" means a bank, a Financial Institution, a Clearing House, a Service Provider or any person '
                 'authorized by the State Bank to transact business under this Act in Pakistan', 'section 2(f)')
    + D.bullets([
        'The partner is therefore an electronic money institution, NayaPay or SadaPay, not a payment service provider.',
        'The partner initiates each payment under paragraph 7.I(f) and serves Halqa through its interface under paragraph '
        '7.I(h). Halqa is the third party service provider that paragraph names.',
        'The partner, not Halqa, notifies the State Bank 30 days before it begins, so the State Bank is informed of the '
        'arrangement without Halqa applying for anything.',
        'Escrow under paragraph 7.I(g) is not needed. On Hyper each day&rsquo;s payers pay that day&rsquo;s collectors '
        'directly, so no pool of money exists at any point.',
        'Halqa is not an Authorized Party under section 2(f): it is not a bank, a clearing house or a service provider, and '
        'it is not authorised by the State Bank.',
    ]))

# ---------------------------------------------------------------- 8 auto pull
b.append('<h2>8. Automatic collection</h2>' + P(
    'Halqa&rsquo;s auto debit, described in full in Auto Debit (HQ-CP-02), is a preauthorised '
    'electronic fund transfer. The Act allows a consumer to authorise one in any accepted form, which includes consent '
    'inside an application, and gives the consumer the right to stop it.')
    + Q('PSEFT', '(1) A preauthorized Electronic Fund Transfer from a Consumer\'s Account may be authorized by the Consumer either in '
                 'writing, or in any other accepted form. (2) A consumer may stop payment of a Preauthorized Electronic Fund '
                 'Transfer by notifying the Financial Institution.', 'section 35, Preauthorized Transfers')
    + P('The duties that come with electronic fund transfers are placed on the member&rsquo;s bank and on the Authorized '
        'Party, which here is the partner. Halqa supports each of them by design and by contract.')
    + Q('PSEFT', '(1) The terms and conditions of Electronic Fund Transfers involving a Consumer\'s Account shall be disclosed by a '
                 'Financial Institution, operator or other Authorized Party in English and in a manner clearly understood by the '
                 'consumer, at the time the Consumer contracts for an Electronic Fund Transfer service, in accordance with the '
                 'instructions of the State Bank.', 'section 30(1), Terms and Conditions of Transfers')
    + Q('PSEFT', '(1) A Financial Institution or any other Authorized party, shall notify a Consumer in writing or such other means '
                 'as may be prescribed by the State Bank from time to time, at least twenty-one days prior to the effective date '
                 'of any material change in any term or condition of the Consumer\'s Account', 'section 31(1), Notification of Changes')
    + Q('PSEFT', '(2) When an error has occurred, the Financial Institution or the Authorized Party shall investigate the alleged '
                 'error to determine whether an error has occurred, and report in writing the result of such investigation to '
                 'the consumer within ten Business Days.', 'section 36(2), Notification of error')
    + Q('PSEFT', 'The State Bank shall determine, which provisions of this Act, subject to any modifications, adjustments or exceptions '
                 'as provided for in section 26, shall apply to a person other than a Financial Institution, holding a Consumer\'s '
                 'Account.', 'section 28, Service Providers Other Than Financial Institutions')
    + D.table([
        ['Duty', 'Owed by', 'How Halqa supports it'],
        ['Disclose the terms of the mandate, section 30(1)', 'The member&rsquo;s bank and the partner', 'A terms screen in English and Urdu before consent, stored with its version'],
        ['Honour a stop, section 35(2)', 'The member&rsquo;s bank', 'Cancellation also offered in the application, passed to the partner at once'],
        ['21 days&rsquo; notice of a material change, section 31(1)', 'The member&rsquo;s bank and the partner', 'Any change is held until the notice period has run'],
        ['Investigate an error within ten business days, section 36(2)', 'The member&rsquo;s bank and the partner', 'A dispute record with a ten day clock, passed to the partner'],
    ], widths=['36%', '26%', '38%'])
    + P('Section 28 matters because it shows what would change Halqa&rsquo;s position: a person that holds a consumer&rsquo;s '
        'account can be brought under the Act by the State Bank. Halqa holds no account for any member.'))

# ---------------------------------------------------------------- 9 raast
b.append('<h2>9. Raast</h2>' + P(
    'Raast is the State Bank&rsquo;s instant payment system. It matters in two ways: a member can always send a contribution '
    'to the collecting member directly over Raast at no charge, and Halqa must never use Raast&rsquo;s Request to Pay for a '
    'contribution, because the money would settle into Halqa&rsquo;s own account.')
    + Q('RAAST', 'No charges on Raast related services.', 'features of Raast Person to Person')
    + Q('RAAST', 'Specify beneficiary\'s IBAN or Raast ID (mobile number) on Raast-enabled banks.', 'how to send a payment, step 2')
    + Q('ALFALAH', 'Upon Payment Acceptance from the Customer, the Merchant will receive Instant Settlement.', 'answer 6, Raast Request to Pay')
    + Q('ALFALAH', 'Currently, the MDR is 0% on the Raast scheme; merchants will not be charged any fees if they accept payments through Raast QR.',
        'answer 9, merchant discount rate')
    + P('A Request to Pay is therefore used only for Halqa&rsquo;s own fee, of which Halqa is the rightful payee, and at '
        'present it costs nothing to receive.')
    + P('Raast carries only payments that the payer pushes or approves; it offers no way for a payee to pull money from an '
        'account at another institution. The auto debit therefore runs on the member&rsquo;s wallet at the payment partner, '
        'which the partner debits under the mandate without using Raast to take the money.')
    + Q('RAASTP2M', 'Raast uses more secure payment types, ensures that each transaction is authorized by the payer', 'features of Raast'))

# ---------------------------------------------------------------- 10 insurance
b.append('<h2>10. Insurance and takaful</h2>' + P(
    'A promise to pay a member who suffers loss when another member defaults is insurance, whatever it is called. Only a '
    'public company registered with the Commission may write insurance, so Halqa, a private company, cannot, and it does '
    'not. Cover is written by a licensed takaful operator, and Halqa acts as its agent.')
    + Q('INS', '"insurance" means the business of entering into and carrying out policies or contracts, by whatever name called, '
               'whereby, in consideration of a premium received, a person promises to make payment to another person contingent '
               'upon the happening of an event, specified in the contract, on the happening of which the second-named person '
               'suffers loss, and includes reinsurance and retrocession', 'section 2(xxvii)')
    + Q('INS', '(1) After the commencement date no person other than: (a) a public company; or (b) a body corporate incorporated '
               'under the laws of Pakistan (not being a private company or the subsidiary of a private company); shall start any '
               'insurance business in Pakistan.', 'section 5(1), Persons eligible to transact insurance business')
    + P('Cover against a member&rsquo;s failure to pay is credit business, Class 6, which is non-life business. It is written '
        'by a general takaful operator. The candidates are Pak-Qatar General Takaful Limited and Salaam Takaful Limited; '
        'neither is contracted.')
    + Q('INS', 'Class 6 being credit and suretyship business', 'section 4(3)(a)(vi)')
    + Q('INS', '"credit and suretyship business" means effecting and carrying out: (i) contracts of insurance against loss to the '
               'policy holder arising from failure, whether through insolvency or otherwise, of debtors to pay debts when they '
               'fall due', 'section 4(4)(f)')
    + P('The Ordinance licenses insurance brokers, but it does not register agents with the Commission. An agent acts under a '
        'contract in writing with the insurer, which keeps the register of its agents. A company may not act as an agent if '
        'any of its directors, or any officer engaged in the agency, is a minor.')
    + Q('INS', '(1) It shall be unlawful for any person to act as an agent in respect of an insurer if that person, or, in the case '
               'of a body corporate, any director of the body corporate, or officer of the body corporate engaging in the business '
               'of insurance agency: (a) is a minor; ... (2) It shall be unlawful for any person to act as an agent in respect of an '
               'insurer except under a contract in writing.', 'section 96, Persons acting as agents')
    + Q('INS', 'An insurer shall maintain a register of all agents employed by the insurer, containing such particulars as may be prescribed',
        'section 98(1)')
    + Q('INS', 'It shall be unlawful for any person to act as or describe himself or hold himself out or permit himself to be '
               'described or held out as an insurance broker in respect of direct insurance business unless he holds a current '
               'insurance broker\'s licence issued by the Commission.', 'section 102(1)')
    + D.bullets([
        'Halqa signs a written agency agreement with the operator and is entered in the operator&rsquo;s register of agents.',
        'Halqa never describes itself as a broker and never places cover with more than the operator it represents.',
        'Every director of Halqa is an adult, which is one reason the chairman, who is 17, is not a director (section 17).',
        'The contribution sits in the participants&rsquo; risk fund, which belongs to the participants. A surplus goes back to '
        'them, and a deficit is met by an interest free loan from the operator. Halqa promises nothing and carries no risk.',
    ]))

# ---------------------------------------------------------------- 11 selling cover
b.append('<h2>11. How cover is sold</h2>' + P(
    'The Corporate Insurance Agents Regulations 2020 set out how an agent may sell cover, including through an application. '
    'They apply to takaful operators and to technology channels.')
    + Q('CIA', '(3) These Regulations are applicable to all corporate insurance agents of life and non-life insurers including the '
               'family and general takaful operators. The relevant provisions of these Regulations are also applicable to the '
               'distribution of insurance through technology based distribution channels.', 'regulation 1(3)')
    + Q('CIA', 'in the case of technology based channel consent obtained through acceptance of the policyholder on a secure web-based '
               '"I agree" or "I accept" button or any similar mechanism', 'regulation 3(1), proviso')
    + Q('CIA', 'The corporate insurance agent shall always pay the gross premium to the insurer and shall not retain any part of the '
               'insurance premium received from the policyholders for payment to the insurer.', 'regulation 5(4)')
    + Q('CIA', 'The insurer shall make the claim settlement directly in the name of the policyholder, life assured, his nominee or '
               'guardian, as the case may be.', 'regulation 7(4)')
    + Q('CIA', '(2) Any commission to be paid by the insurer to the corporate insurance agent must be computed on premiums received by '
               'the insurer and under no circumstances the commission on premiums to be received in future, be paid. (3) The '
               'corporate insurance agent shall not charge, to the policyholder, any service fee, processing fee, administration '
               'charge or any other charge unless such a charge has been included by the insurer in the premium and communicated to '
               'the policyholder in advance.', 'regulation 8(2) and (3)')
    + Q('CIA', '(c) ensure that no prospect is coerced by the bank insurance executive or the corporate insurance executive or '
               'specified Person to buy an insurance product.', 'regulation 10(c)')
    + Q('CIA', '(d) for an insurance product which is bundled with any other product offered by the Corporate insurance agent, mention '
               'the cost of the insurance product and the other product separately;', 'regulation 11(1)(d)')
    + D.table([
        ['Regulation', 'What it requires', 'How Halqa complies'],
        ['3(1)', 'Consent to cover by an &ldquo;I agree&rdquo; button or similar', 'Consent on its own screen, confirmed with the PIN and stored'],
        ['4(1)', 'An agency agreement with set contents', 'The agreement with the operator is drafted to regulation 4'],
        ['5(4)', 'The whole contribution passed to the operator', 'The takaful part of each payment goes straight to the operator&rsquo;s fund'],
        ['7(4)', 'Claims paid in the policyholder&rsquo;s own name', 'The operator pays the member left short directly'],
        ['8(2)', 'Commission only on contributions received', 'Commission is recorded only when the operator has been paid'],
        ['8(3)', 'No charge for cover beyond what the operator includes', 'The service fee is for the committee service only'],
        ['10(c)', 'No coercion to buy cover', 'Cover is mandatory on unknown committees and Hyper; counsel&rsquo;s written view is required'],
        ['11(1)(d)', 'The cost of a bundled product shown separately', 'Every payment shows the contribution, the takaful part and the fee apart'],
        ['22(1)', 'At least 18 hours of training for staff who sell cover', 'Staff selling cover are trained and certified by the operator'],
    ], widths=['12%', '40%', '48%'])
    + P('The one open point is regulation 10(c). Cover is a condition of joining an unknown committee or Hyper, which could be '
        'read as coercion. The argument against that reading is that the member chooses the product, sees the cost of cover '
        'before joining, and may join a known committee without cover. Counsel&rsquo;s written opinion is required before '
        'cover is sold.'))

# ---------------------------------------------------------------- 12 bureau
b.append('<h2>12. Credit reports and the bureau</h2>' + P(
    'Only a licensed credit bureau may collect and sell credit information. Halqa does not. It reads a member&rsquo;s '
    'TASDEEQ report in the one way the Act allows to a firm that is not a bank or finance company: on the member&rsquo;s '
    'own instruction to the bureau.')
    + Q('CBA', '(v) "user" means any person or body which obtains a credit information report from a credit bureau under this Act.', 'section 2(v)')
    + Q('CBA', '(1) A credit bureau may furnish credit information collected, processed, collated, stored and maintained, in accordance '
               'with the provisions of this Act and rules made thereunder in the form of a credit information report, under the '
               'following circumstances, namely: (a) on written or electronically received request of a credit institution; (b) on '
               'written or electronic request or instructions of the debtor, to whom it relates, received from such debtor or through '
               'a duly constituted attorney thereof;', 'section 19(1), Permissible purposes and uses of credit information reports')
    + D.bullets([
        'Halqa is not a credit institution under section 2(l), which lists banks, microfinance banks, finance companies and '
        'similar lenders, so clause (a) is closed to it.',
        'Clause (b) is used: the member instructs TASDEEQ, and TASDEEQ receives the instruction from the member through its own '
        'consent step.',
        'Halqa does not act as the member&rsquo;s attorney, because an attorney cannot be appointed inside an application: the '
        'Electronic Transactions Ordinance does not apply to a power of attorney (section 13 below).',
    ])
    + P('When a report leads Halqa to refuse or restrict a seat, the Act requires Halqa, as a user, to tell the member why and '
        'how to challenge it.')
    + Q('CBA', 'In the event that any user takes an adverse action with respect to a debtor that is based in whole or in part on any '
               'information contained in a credit information report relating to such debtor, such user shall provide to such debtor '
               'a copy of the credit information report relied upon, the name, address and telephone number of the credit bureau, '
               'which issued the credit information report in question, a copy of the summary of rights set out in the Schedule and a '
               'statement that the credit bureau did not make the decision to take the adverse action.', 'section 31, Requirements on users')
    + Q('CBA', 'No one shall obtain access to, or distribute or disclose, credit information in the possession or control of a credit '
               'bureau or a credit information furnisher or a user unless such access or distribution or disclosure is authorized by '
               'this Act or any other law for the time being in force.', 'section 26(1)')
    + P('A breach by a user falls under the general penalty, since the specific penalty in section 26(2) is addressed to bureaus.')
    + Q('CBA', 'be punishable with fine which may extend to five million rupees and where a contravention, default or obstruction is a '
               'continuing one, with a further fine which may extend to fifty thousand rupees for every day during which the '
               'contravention or default or obstruction continues.', 'section 34, Penalties')
    + P('Halqa can report committee payment history to a bureau only after the Federal Government notifies which firms other '
        'than credit institutions may become members. Until then it builds and holds the record.')
    + Q('CBA', 'The membership of other credit information furnisher, other than credit institution, to become a member of credit '
               'bureaus shall be notified by the Federal Government accordingly.', 'section 11(1)'))

# ---------------------------------------------------------------- 13 electronic records
b.append('<h2>13. Electronic contracts and signatures</h2>' + P(
    'The member&rsquo;s undertaking, the mutual guarantee between members and the auto debit mandate are all signed inside '
    'the application. The Electronic Transactions Ordinance gives them the same effect as paper.')
    + Q('ETO', 'No document, record, information, communication or transaction shall be denied legal recognition, admissibility, '
               'effect, validity, proof or enforceability on the ground that it is in electronic form and has not been attested by '
               'any witness.', 'section 3, Legal recognition of electronic forms')
    + Q('ETO', 'The requirement under any law for affixation of signatures shall be deemed satisfied where electronic signatures or '
               'advanced electronic signature are applied.', 'section 7, Legal recognition of electronic signatures')
    + P('Five kinds of instrument are excluded, and three of them shape the design.')
    + Q('ETO', '(1) Subject to sub-section (2), nothing in this Ordinance shall apply to: (a) a negotiable instrument as defined in '
               'section 13 of the Negotiable Instruments Act, 1881 (XXVI of 1881); (b) a power-of-attorney under the Powers of '
               'Attorney Act, 1881 (VII of 1882); (c) a trust defined to the Trust Act 1882 (II of 1882), but excluding '
               'constructive, implied and resulting trusts;', 'section 31(1), Application to certain laws barred')
    + D.bullets([
        'Clause (a): the guarantee cheque is a negotiable instrument, so it is a paper cheque, held physically.',
        'Clause (b): no power of attorney is taken electronically, which is why credit reports are released on the '
        'member&rsquo;s own instruction (section 12).',
        'Clause (c): no circle is set up as a trust, and the savings fund&rsquo;s trust is made by a paper deed between the fund '
        'manager and the trustee (section 19).',
    ]))

# ---------------------------------------------------------------- 14 recovery
b.append('<h2>14. Recovering money from a member who stops paying</h2>' + P(
    'Most arrears are recovered without any legal step, because a member who falls behind before collecting has the amount '
    'taken from their own pot on their day. A loss arises only when a member collects and then stops paying. The law '
    'relied on for that case is as follows.')
    + Q('CONTRACT', 'Every person is competent to contract who is of the age of majority according to the law to which he is subject, and '
                    'who is of sound mind, and is not disqualified from contracting by any law to which he is subject.', 'section 11')
    + Q('CONTRACT', 'A contract of guarantee is a contract to perform the promise, or discharge the liability of a third person in case '
                    'of his default.', 'section 126')
    + Q('CONTRACT', 'The liability of the surety is coextensive with that of the principal debtor, unless it is otherwise provided by the '
                    'contract.', 'section 128')
    + Q('CONTRACT', 'reasonable compensation not exceeding the amount so named or, as the case may be, the penalty stipulated for',
        'section 74, from the rule on penalties')
    + Q('PPC489', 'Whoever dishonestly issues a cheque towards repayment of a loan or fulfilment of an obligation which is dishonoured on '
                  'presentation, shall be punished with imprisonment which may extend to three years or with fine, or with both',
        'section 489-F, Dishonestly issuing a cheque')
    + Q('CPC', 'All suits upon bills of exchange, hundies or promissory notes', 'Order XXXVII, rule 2(1)')
    + D.bullets([
        'Members must be adults, since a minor cannot contract (section 11); a member&rsquo;s age is checked against the CNIC.',
        'The mutual guarantee makes each member a surety for the others (sections 126 and 128), so the members left short can '
        'recover from the defaulter under the guarantee.',
        'Late penalties are recoverable only as reasonable compensation up to the stated amount (section 74). On Shariah '
        'labelled circles they are given to charity at the end of the circle.',
        'The undertaking is enforced by an ordinary civil suit for the sum owed. The faster summary procedure of Order XXXVII '
        'applies only to suits on bills of exchange, hundis and promissory notes, so it is available on a guarantee cheque, '
        'which is a bill of exchange, but not on the undertaking itself.',
        'Whether section 489-F reaches a cheque given as security, before the obligation has fallen due, has been decided '
        'differently by the courts; counsel should advise on the wording of the cheque arrangement.',
        'No collection calls are made and no contact lists are read. Recovery follows the published arithmetic, then the '
        'guarantee and the takaful claim, and a suit only as the last step.',
    ]))

# ---------------------------------------------------------------- 15 AML
b.append('<h2>15. Money laundering law</h2>' + P(
    'A financial institution under the Anti-Money Laundering Act 2010 is a reporting entity with duties to identify customers '
    'and report suspicious transactions. The definition lists activities.')
    + Q('AML', '"financial institution" includes any person carrying on any one or more of the following activities, namely: (a) '
               'acceptance of deposits and other repayable funds from the public; (b) lending in whatsoever form; ... (d) money or '
               'value transfer; (e) issuing and managing means of payments ... (xii) carrying out business as intermediary;',
        'section 2(xiv)')
    + Q('AML', '"reporting entity" means financial institutions and DNFBPs and any other person notified by the Federal Government '
               'in the official Gazette;', 'section 2(xxxiv)')
    + P('Halqa does not take deposits, lend, transfer money or issue means of payment; the transfer between members is made '
        'by the licensed partner. The open question is item (xii), &ldquo;carrying out business as intermediary&rdquo;, which '
        'appears in the list of trading activities and is not defined. Counsel&rsquo;s written view is required. In the '
        'meantime Halqa applies the controls of a reporting entity: identity checked with NADRA, screening against the United '
        'Nations list and the Fourth Schedule, and records kept.'))

# ---------------------------------------------------------------- 16 lottery
b.append('<h2>16. Lotteries</h2>' + Q('PPC294',
    'Whoever keeps any office or place for the purpose of drawing any lottery not being a State lottery or a lottery authorized by '
    'the Provincial Government shall be punished with imprisonment of either description for a term which may extend to six months, '
    'or with fine, or with both. And whoever publishes any proposal to pay any sum, or to deliver any goods, or to do or forbear '
    'doing anything for the benefit of any person, on any event or contingency relative or applicable to the drawing of any '
    'ticket, lot, number or figure in any such lottery shall be punished with fine', 'section 294-A, Keeping lottery office')
    + P('The second paragraph punishes publishing a proposal, not only running a lottery. No part of Halqa pays any sum decided '
        'by a draw, and no seat order is sold. Where seats are allocated, they are chosen by members within their score band '
        'or set by the host, never drawn for a prize.'))

# ---------------------------------------------------------------- 17 company
b.append('<h2>17. The company and its directors</h2>' + P(
    'Halqa will be a private limited company with its registered office in Islamabad. The chairman, Taha Amjed, is 17. A '
    'minor may not be a director, and every director needs a tax number and, with stated exceptions, must be a member.')
    + Q('CA', 'A person shall not be eligible for appointment as a director of a company, if he ... (a) is a minor; ... (h) does not hold '
              'National Tax Number as per the provisions of Income Tax Ordinance, 2001 (XLIX of 2001): Provided that the Commission '
              'may grant exemption from the requirement of this clause as may be notified. (i) is not a member: Provided that clause '
              '(i) shall not apply in the case of ... (iii) a chief executive', 'section 153, Ineligibility of certain persons to become director')
    + Q('CA', '(a) a single member company shall have at least one director; (b) every other private company shall have not less than '
              'two directors;', 'section 154(1), Minimum number of directors')
    + Q('CA', '(2) The name of first chief executive shall be determined by the subscribers of the memorandum and his particulars '
              'specified under section 197 shall be submitted along with the documents for the incorporation of the company.',
        'section 186(2), Appointment of first chief executive')
    + D.bullets([
        'The chairman&rsquo;s father is a director and the first chief executive, named by the subscribers at incorporation.',
        'A private company with two members needs a second adult director who holds shares; alternatively the company is a '
        'single member company with the father as its member and director.',
        'A minor cannot sign the memorandum, because a minor cannot contract. How shares are held for the chairman until he '
        'turns 18, under the Majority Act 1875, and passed to him then, is for counsel to set out.',
        'Until he is 18 the chairman is described as founder, not as a director.',
    ]))

# ---------------------------------------------------------------- 18 tax
b.append('<h2>18. Sales tax on the fee</h2>' + Q('ICT', 'IT services and IT-enabled services ... Fifteen percent',
                                                 'Schedule, Table-1, entry 11')
    + P('Halqa&rsquo;s fee is most likely an IT enabled service, taxed at 15 per cent in the Islamabad Capital Territory. '
        'Halqa registers with the Federal Board of Revenue before the first fee is charged and adds the tax to the fee: a Rs 100 '
        'fee costs the member Rs 115. A tax adviser should confirm the classification.'))

# ---------------------------------------------------------------- 19 savings
b.append('<h2>19. Savings, when offered</h2>' + Q('MUFAP',
    'The Securities and Exchange Commission of Pakistan (SECP) has made it mandatory for all investment advisors and distributors of '
    'mutual and pension funds to obtain membership of the Mutual Funds Association of Pakistan (MUFAP).', 'Islamabad, 1 April 2026')
    + P('Savings are a later stage. A licensed asset management company, Mahaana Wealth as the candidate, runs the fund; the '
        'Central Depository Company of Pakistan is its trustee under a paper trust deed; members buy units in their own names, '
        'paying the trustee directly. Halqa distributes the fund as a member of the Mutual Funds Association of Pakistan under '
        'a distribution agreement, recommends nothing, and takes no share of the fund&rsquo;s profit.'))

# ---------------------------------------------------------------- 20 affordability benchmark
b.append('<h2>20. The affordability limit</h2>' + Q('BPRD',
    'The total monthly amortization payments of consumer financing facilities, as prescribed in paragraph 1 of the regulation, '
    'should not exceed 40% of the net disposal income of the prospective borrower.', 'Regulation R-3 of the Prudential Regulations for Consumer Financing, as amended')
    + P('This rule binds banks, not Halqa. Halqa adopts it anyway for unknown committees and Hyper: a member&rsquo;s committees '
        'and other loan repayments together may not exceed 40 per cent of verified income, and committees alone may not exceed a '
        'third. The test is set out in the Affordability Model.'))

# ---------------------------------------------------------------- 21 sandbox
b.append('<h2>21. The regulatory sandbox</h2>'
    + Q('SANDBOX', 'A Regulatory Sandbox enables a live testing environment for innovative products, services or business models, '
                   'pursuant to a specific testing plan, which usually includes some degree of regulatory lenience', 'section 1, Introduction')
    + Q('SANDBOX', 'No Objection Letter (NOL) by SBP to operate until an enabling framework is developed', 'exit options after a test')
    + P('The sandbox is a route to operate where an activity needs regulatory permission and no framework yet exists. '
        'Halqa&rsquo;s design needs no permission, and the framework it relies on already exists: paragraph 7.I(h) of the '
        'electronic money regulations, under which the licensed partner serves Halqa after notifying the State Bank. Halqa '
        'therefore does not apply. The sandbox remains open if the State Bank takes a different view.'))

# ---------------------------------------------------------------- 22 licences not needed
b.append('<h2>22. Licences that do not apply</h2>' + D.table([
    ['Activity', 'Law', 'What it would need', 'Why Halqa does not need it'],
    ['Taking deposits', 'Companies Act 2017, s.84', 'Exemption by the Commission', 'No contribution reaches Halqa; its fee is an advance for services'],
    ['Lending', 'Companies Ordinance 1984, Part VIIIA', 'Non-banking finance company licence', 'Halqa lends nothing and computes no rate'],
    ['Peer to peer lending', 'NBFC Regulations 2008, S.R.O. 436(I)/2022', 'P2P permission, Rs 20 million more equity', 'No member lends to another or pays for a seat'],
    ['Issuing electronic money', 'PS&amp;EFT Act 2007, s.24', 'EMI licence, Rs 200 million capital', 'No balance or claim on Halqa'],
    ['Payment services', 'PSO/PSP Rules 2014', 'Authorisation, Rs 200 million capital', 'Halqa routes and processes nothing'],
    ['Writing insurance', 'Insurance Ordinance 2000, ss.5 and 6', 'Registration as an insurer', 'The operator writes cover; Halqa is its agent'],
    ['Broking insurance', 'Insurance Ordinance 2000, s.102', 'Broker&rsquo;s licence', 'Halqa acts only for the one operator it represents'],
    ['Running a credit bureau', 'Credit Bureaus Act 2015', 'Licence from the State Bank', 'Halqa is a user, reading on the member&rsquo;s instruction'],
    ['Testing under permission', 'SBP Regulatory Sandbox', 'A place in a cohort', 'No permission is needed for the design'],
], widths=['18%', '24%', '24%', '34%']))

# ---------------------------------------------------------------- 23 what is needed
b.append('<h2>23. What Halqa does need</h2>' + D.table([
    ['Registration or agreement', 'With', 'Law or basis', 'When'],
    ['Incorporation, private limited company', 'SECP, through eZfile', 'Companies Act 2017', 'First'],
    ['National Tax Number', 'Federal Board of Revenue', 'Income Tax Ordinance 2001', 'On incorporation'],
    ['Sales tax registration', 'Federal Board of Revenue, Islamabad', 'ICT (Tax on Services) Ordinance 2001', 'Before the first fee'],
    ['Services agreement', 'NayaPay or SadaPay', 'EMI Regulations 2023, para 7.I(f) and (h)', 'Before live money'],
    ['Identity verification agreement', 'NADRA', 'Commercial contract', 'Before unknown committees'],
    ['Bureau subscriber agreement', 'TASDEEQ', 'Credit Bureaus Act 2015, s.19(1)(b)', 'Before seat rules use reports'],
    ['Written agency agreement', 'Pak-Qatar General Takaful or Salaam Takaful', 'Insurance Ordinance 2000, s.96(2)', 'Before cover'],
    ['MUFAP membership and distribution agreement', 'MUFAP; Mahaana Wealth', 'SECP direction, April 2026', 'Before savings'],
    ['Modaraba agreement', 'Orix, First Habib, Allied Rental or First Punjab Modaraba', 'Commercial contract', 'Before asset committees'],
    ['Trademark', 'IPO-Pakistan', 'Trade Marks Ordinance 2001', 'Early'],
], widths=['28%', '26%', '28%', '18%']) + P('The order, timings and documents are in Registrations and Licences Required (HQ-LD-01).'))

# ---------------------------------------------------------------- 24 process
b.append('<h2>24. Process and Legal Requirements</h2>' + P(
    'Each step a member goes through, the law that governs it, and the party on whom the duty falls. The technical steps are '
    'set out in Auto Debit (HQ-CP-02), Default Prevention (HQ-CP-05) and the Collection and Auto Debit Specification (HQ-CP-09).')
    + D.table([
        ['Step', 'What happens', 'Law and provision', 'Duty falls on'],
        ['Company', 'Private company; adult directors who hold a tax number and shares', 'Companies Act 2017, ss.153, 154 and 186(2)', 'Halqa'],
        ['Tax', 'National Tax Number; Islamabad sales tax of 15 per cent on the fee', 'ICT (Tax on Services) Ordinance 2001, Table-1, entry 11', 'Halqa'],
        ['Sign up', 'Adult member; CNIC checked with NADRA; screening applied', 'Contract Act 1872, s.11; Anti-Money Laundering Act 2010, s.2', 'Halqa'],
        ['Credit report', 'Released by TASDEEQ on the member&rsquo;s instruction; notice if a seat is refused', 'Credit Bureaus Act 2015, ss.19(1)(b), 26(1) and 31', 'Halqa as a user'],
        ['Signing', 'Undertaking, guarantee and consents signed with the PIN and kept unaltered', 'Electronic Transactions Ordinance 2002, ss.3 to 7; Contract Act 1872, ss.126 and 128', 'The member; Halqa keeps the record'],
        ['Wallet and mandate', 'Terms disclosed; authority given in advance; one wallet per CNIC; monthly limits', 'PS&amp;EFT Act 2007, ss.30(1) and 35; EMI Regulations 2023, paras 7.I(f) and (h), 12.II and 14.II(a)', 'The partner and the member'],
        ['Each payment', 'Contribution straight to the collecting member; fee to Halqa; takaful part to the fund', 'Companies Act 2017, s.84(1); PSO/PSP Rules 2014, r.6(5)', 'The partner; Halqa by design'],
        ['Cover', 'Consent by button; whole contribution to the operator; claims in the member&rsquo;s name', 'Insurance Ordinance 2000, ss.5(1), 96(2) and 98(1); CIA Regulations 2020, regs 3(1), 5(4), 7(4), 8 and 11(1)(d)', 'The operator; Halqa as agent'],
        ['Errors and changes', 'Investigation in ten business days; 21 days&rsquo; notice of a change', 'PS&amp;EFT Act 2007, ss.31(1), 36(2) and 41', 'The partner'],
        ['Late payment and default', 'Penalty within reasonable compensation; guarantee; ordinary suit; summary suit only on a cheque', 'Contract Act 1872, ss.74, 126 and 128; CPC Order XXXVII, r.2(1); Penal Code, s.489-F', 'The members, advised by counsel'],
        ['Seat exchange and points', 'Nothing passes between members; points not issued against money or accepted by others', 'NBFC Regulations 2008, P2P definition; EMI Regulations 2023, para 2', 'Halqa'],
        ['Asset committees', 'The modaraba buys, leases and recovers the asset in its own name', 'Modaraba Ordinance 1980, ss.4, 10 and 12(1)', 'The modaraba'],
        ['Savings', 'Distribution as a MUFAP member; trust deed on paper', 'SECP direction of April 2026; Electronic Transactions Ordinance 2002, s.31(1)(c)', 'Halqa, the fund manager and the trustee'],
        ['Records', 'Kept complete and unaltered, with origin, destination and time', 'Electronic Transactions Ordinance 2002, ss.5 and 6', 'Halqa'],
    ], widths=['14%', '34%', '34%', '18%']))

# ---------------------------------------------------------------- 25 counsel
b.append('<h2>25. Questions for counsel</h2>' + D.bullets([
    'Whether compulsory cover on unknown committees and Hyper is consistent with regulation 10(c) of the Corporate Insurance '
    'Agents Regulations 2020.',
    'Whether item (xii), &ldquo;carrying out business as intermediary&rdquo;, in section 2(xiv) of the Anti-Money Laundering Act '
    '2010 reaches Halqa.',
    'The notified text of the peer to peer chapter of the NBFC Regulations 2008, against the press report quoted in section 5.',
    'Whether a seat exchange, with fee waivers and points given by Halqa and a flat exchange fee paid to Halqa, stays outside '
    'that chapter (Seat Exchange and Points, HQ-CP-04).',
    'Whether introducing members to a modaraba for a referral fee is arranging credit that needs any permission (Asset '
    'Committees, HQ-CP-01).',
    'That no separate registration of Halqa as an agent is required under the Insurance Rules 2017.',
    'The wording of the guarantee cheque arrangement for section 489-F of the Penal Code and Order XXXVII of the Code of '
    'Civil Procedure.',
    'The classification of the fee for Islamabad sales tax.',
    'How shares are held for the chairman until he is 18.',
]))

# ---------------------------------------------------------------- 26 sources
b.append('<h2>26. Sources</h2>' + D.table([
    ['Instrument', 'Text used'],
    ['Companies Act 2017', 'Gazette of Pakistan, Extraordinary, Part I, 31 May 2017, read in full'],
    ['Payment Systems and Electronic Fund Transfers Act 2007', 'Pakistan Code text, 25 pages, read in full'],
    ['Rules for PSOs and PSPs 2014', 'State Bank of Pakistan, PSD Circular No. 3 of 2014, 24 pages, read in full'],
    ['Regulations for Electronic Money Institutions 2023', 'State Bank of Pakistan, PSP&amp;OD Circular No. 3 of 2023, 52 pages, read in full'],
    ['Insurance Ordinance 2000', 'Consolidated text, 105 pages, Parts I, II and XIII read in full'],
    ['Corporate Insurance Agents Regulations 2020', 'S.R.O. 1304(I)/2020, Gazette of Pakistan, 5 December 2020, 43 pages, read in full'],
    ['Credit Bureaus Act 2015', 'Pakistan Code text, updated to 3 August 2022, read in full'],
    ['Electronic Transactions Ordinance 2002', 'Pakistan Code text, 20 pages, read in full'],
    ['Anti-Money Laundering Act 2010', 'Financial Monitoring Unit consolidated text'],
    ['ICT (Tax on Services) Ordinance 2001', 'Federal Board of Revenue text, updated to 30 June 2025'],
    ['NBFC Regulations 2008, peer to peer chapter', 'Business Recorder report of S.R.O. 436(I)/2022, 29 March 2022; notified text to be confirmed'],
    ['Pakistan Penal Code 1860, ss.294-A and 489-F', 'Text compiled at pakarbiter.com, read 25 September 2026'],
    ['Contract Act 1872, ss.11, 74, 126, 128', 'Text at nasirlawsite.com, read 25 September 2026'],
    ['Code of Civil Procedure 1908, Order XXXVII', 'Sindh Judicial Academy, Working Paper on Suits under Summary Procedure'],
    ['Raast', 'State Bank of Pakistan, Raast, Raast person to person and Raast person to merchant pages; Bank Alfalah, Raast P2M questions and answers'],
    ['Modaraba Ordinance 1980, ss.4, 10 and 12', 'Text at nasirlawsite.com, read 25 September 2026'],
    ['Prudential Regulations for Consumer Financing', 'State Bank of Pakistan, BPRD Circular Letter No. 29 of 2021'],
    ['Regulatory sandbox', 'State Bank of Pakistan, Guidelines for Regulatory Sandbox'],
    ['MUFAP membership', 'Associated Press of Pakistan, 1 April 2026'],
], widths=['36%', '64%']) + P('Copies of the primary texts are kept with this document in the folder Primary texts.'))

b.append(D.summary(
    'Halqa is a company that runs committees on an app, and the law allows that without any financial licence, as long as '
    'Halqa never holds members&rsquo; money. It never does: each payment goes straight from one member to another through '
    'a licensed e-money company, and Halqa receives only its own fee. Insurance against members who stop paying is written '
    'by a licensed takaful company, with Halqa as its agent under a written contract. Credit reports are read only when the '
    'member tells the bureau to release them. What Halqa needs is a company, tax registrations and contracts with licensed '
    'partners, plus a few written opinions from a lawyer on the points listed in section 25.'))

body = ''.join(b)
txt = D.text_of(body)
for bad in ('—', '–'):
    assert bad not in txt, (bad, txt[txt.find(bad) - 60: txt.find(bad) + 30])
for rx in (r'\byou\b', r'\byour\b', r'registered agent', r'Pak-Qatar Family', r'agent registration'):
    m = re.search(rx, txt, flags=re.I)
    assert not m, (rx, txt[max(0, m.start() - 80): m.end() + 40])
path = os.path.join(OUT, 'Legal Position.pdf')
D.render(path, 'Legal Position', 'Why Halqa needs no financial licence, what it does need, and the text of every law relied on, with where it is found.',
         'HQ-LG-01', 'Mr Akif Saeed and counsel', body, running='Legal Position')
print('Legal Position', D.pdf_pages(path))
