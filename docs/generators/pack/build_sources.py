# -*- coding: utf-8 -*-
"""Web sources used in the Legal Position and Default Prevention, as read, with where each was found."""
import os, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import docgen as D
import lawcite as L

OUT = os.path.join(D.HERE, 'out', 'legal')
os.makedirs(OUT, exist_ok=True)
E = [
    ('Pakistan Penal Code 1860, section 294-A', 'pakarbiter.com/laws-in-pakistan/pakistan-penal-code-1860/ppc-section-294-a/keeping-lottery-office, read 25 September 2026', 'PPC294',
     'Whoever keeps any office or place for the purpose of drawing any lottery not being a State lottery or a lottery authorized by the Provincial Government shall be punished with imprisonment of either description for a term which may extend to six months, or with fine, or with both. And whoever publishes any proposal to pay any sum, or to deliver any goods, or to do or forbear doing anything for the benefit of any person, on any event or contingency relative or applicable to the drawing of any ticket, lot, number or figure in any such lottery shall be punished with fine which may extend to [three thousand rupees]'),
    ('Pakistan Penal Code 1860, section 489-F', 'pakarbiter.com/laws-in-pakistan/pakistan-penal-code-1860/ppc-section-489-f/dishonestly-issuing-a-cheque, read 25 September 2026', 'PPC489',
     'Whoever dishonestly issues a cheque towards repayment of a loan or fulfilment of an obligation which is dishonoured on presentation, shall be punished with imprisonment which may extend to three years or with fine, or with both, unless he can establish, for which the burden of proof shall rest on him, that he had made arrangements with his bank to ensure that the cheque would be honoured and that the bank was at fault in not honouring the cheque.'),
    ('Contract Act 1872, section 11', 'nasirlawsite.com/laws/contract.htm, read 25 September 2026', 'CONTRACT',
     'Every person is competent to contract who is of the age of majority according to the law to which he is subject, and who is of sound mind, and is not disqualified from contracting by any law to which he is subject.'),
    ('Contract Act 1872, sections 126 and 128', 'nasirlawsite.com/laws/contract.htm, read 25 September 2026', 'CONTRACT',
     'A contract of guarantee is a contract to perform the promise, or discharge the liability of a third person in case of his default. ... The liability of the surety is coextensive with that of the principal debtor, unless it is otherwise provided by the contract.'),
    ('NBFC and Notified Entities Regulations 2008, peer to peer chapter, S.R.O. 436(I)/2022', 'Business Recorder, 29 March 2022, brecorder.com/news/40163648, read 25 September 2026', 'P2P',
     '"Peer to Peer Lending" or "P2P Lending" shall mean the extension of loans by the lender to the borrower through the P2P Lending Platform whereas the Platform would be an intermediary providing P2P services through online medium or otherwise to the participants who have entered into an arrangement with that platform to lend or to borrow money.'),
    ('State Bank of Pakistan, Raast Person to Person', 'sbp.org.pk/our-subsidiaries/raast/raast-person-to-person, read 25 September 2026', 'RAAST',
     'No charges on Raast related services. ... Specify beneficiary\'s IBAN or Raast ID (mobile number) on Raast-enabled banks.'),
    ('Bank Alfalah, Raast P2M questions and answers', 'bankalfalah.com, read 24 September 2026', 'ALFALAH',
     'Upon Payment Acceptance from the Customer, the Merchant will receive Instant Settlement. ... Currently, the MDR is 0% on the Raast scheme; merchants will not be charged any fees if they accept payments through Raast QR.'),
    ('State Bank of Pakistan, BPRD Circular Letter No. 29 of 23 September 2021', 'sbp.org.pk/bprd/2021/CL29.htm, read 25 September 2026', 'BPRD',
     'The total monthly amortization payments of consumer financing facilities, as prescribed in paragraph 1 of the regulation, should not exceed 40% of the net disposal income of the prospective borrower.'),
    ('Associated Press of Pakistan, SECP release of 1 April 2026', 'app.com.pk/business/secp-mandates-mufap-membership-to-strengthen-investor-rotection', 'MUFAP',
     'The Securities and Exchange Commission of Pakistan (SECP) has made it mandatory for all investment advisors and distributors of mutual and pension funds to obtain membership of the Mutual Funds Association of Pakistan (MUFAP).'),
    ('State Bank of Pakistan, Raast and Raast Person to Merchant', 'sbp.org.pk/raast and sbp.org.pk/our-subsidiaries/raast/raast-person-to-merchant, read 25 September 2026', 'RAASTP2M',
     'Raast uses more secure payment types, ensures that each transaction is authorized by the payer, and offers enhanced data protection and fraud detection services. ... Request to Pay (RTP) Now A request initiated by the receiver of payment to the sender of payment with a shorter expiry period. Request to Pay (RTP) Later A Request initiated by the receiver of payment to the sender of payment with a longer expiry period.'),
    ('State Bank of Pakistan, PSD Circular No. 02 of 2021', 'sbp.org.pk/circulars/psd-circular-no-02-of-2021, read 25 September 2026', 'IBFT',
     'After the monthly limit of Rs.25,000 is exhausted, Banks/MFBs/EMIs may charge their individual customers, a transaction fee of 0.1% of the transaction amount or Rs.200, whichever is lower.'),
    ('Modaraba Companies and Modaraba (Floatation and Control) Ordinance 1980, sections 4, 10 and 12', 'nasirlawsite.com/laws/modaraba.htm, read 25 September 2026', 'MODARABA',
     'No modaraba company shall operate without registration with the Registrar. ... No modaraba shall be a business which is opposed to the injunctions of Islam and the Registrar shall not permit the floatation of a modaraba unless the Religious Board has certified in writing that the modaraba is not a business opposed to the injunctions of Islam. ... A modaraba shall sue and be sued in its own name through the modaraba company.'),
    ('Securities and Exchange Commission of Pakistan, Licensing, Modarabas', 'secp.gov.pk/licensing/nbfcs/modarabas, read 25 September 2026', 'SECPMOD',
     'Model financing agreements for modarabas'),
    ('Islamabad Capital Territory Administration, Vehicle Transfer', 'ictadministration.gov.pk/vehicle-transfer, read 25 September 2026', 'ICTVEH',
     'In case of a vehicle leased from a bank or a leasing company, NOC / Transfer Letter is required from relevant bank or leasing company'),
]
b = [D.para('These are the texts taken from web pages rather than from an official printed copy. Each extract below is '
            'reproduced as read on the date shown, and each was checked word for word against the saved page. The official '
            'printed texts used are in this folder as separate files.')]
b.append('<h2>1. Verification Method</h2>' + D.steps([
    'Each page was read in a browser or fetched as text on the date shown, and saved unchanged beside the build.',
    'Each quotation in the documents is compared with the saved text by a program before any document is produced. Both texts '
    'are reduced to lower case letters and digits, so line breaks, page headers and typographic quotation marks cannot hide a '
    'difference, and the quotation must then appear in the source word for word.',
    'Where a quotation is shortened, each part between the omission marks is checked separately.',
    'The page on which the quotation begins is looked up and printed under it. A quotation that is not found stops the build, '
    'so no document can be issued with a misquotation.',
]) + '<h2>2. Extracts</h2>')
for title, where, key, text in E:
    L.locate(key, text)
    b.append('<h3>%s</h3>' % title + D.quote(text, where))
path = os.path.join(OUT, 'Web Sources Read.pdf')
D.render(path, 'Web Sources Read', 'Extracts of the laws and pages read on the web for the corporate documents, with where each was found and how each quotation was checked.',
         'HQ-LG-02', 'Counsel', ''.join(b), running='Web Sources Read')
print('Web Sources Read', D.pdf_pages(path))
