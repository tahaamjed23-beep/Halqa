# -*- coding: utf-8 -*-
"""Patch build_sources.py: new web sources and a Verification Method section."""
import io

p = 'build_sources.py'
s = io.open(p, encoding='utf-8').read()


def rep(a, b):
    global s
    n = s.count(a)
    if n != 1:
        raise SystemExit('found %d: %s' % (n, a[:110]))
    s = s.replace(a, b)


rep("""]
b = [D.para(""", """    ('State Bank of Pakistan, Raast and Raast Person to Merchant', 'sbp.org.pk/raast and sbp.org.pk/our-subsidiaries/raast/raast-person-to-merchant, read 25 September 2026', 'RAASTP2M',
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
b = [D.para(""")
rep("""for title, where, key, text in E:
    L.locate(key, text)
    b.append('<h3>%s</h3>' % title + D.quote(text, where))""",
    """b.append('<h2>1. Verification Method</h2>' + D.steps([
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
    b.append('<h3>%s</h3>' % title + D.quote(text, where))""")
rep("'Extracts of the laws and pages read on the web for the Legal Position, with where each was found.'",
    "'Extracts of the laws and pages read on the web for the corporate documents, with where each was found and how each quotation was checked.'")
io.open(p, 'w', encoding='utf-8').write(s)
print('patched')
