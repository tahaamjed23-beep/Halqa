# -*- coding: utf-8 -*-
"""Patch build_licence.py: a Process section in each licence document."""
import io

p = 'build_licence.py'
s = io.open(p, encoding='utf-8').read()


def rep(a, b):
    global s
    n = s.count(a)
    if n != 1:
        raise SystemExit('found %d: %s' % (n, a[:110]))
    s = s.replace(a, b)


proc = """req.append('<h2>8. Process</h2>' + D.para(
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
req.append('<h2>9. Not required</h2>'"""
rep("req.append('<h2>8. Not required</h2>'", proc)

chk = """chk.append('<h2>4. Filing Sequence</h2>' + D.steps([
    'Every subscriber and director opens an eZfile account with their CNIC, mobile number and email, and verifies it.',
    'The name is searched, and the name and the incorporation are applied for together in one application.',
    'The memorandum, the articles, the particulars of directors and the chief executive, and the declaration are uploaded '
    'and signed by each subscriber from their own account.',
    'The fee is paid online and the application is submitted. Any query from the registrar is answered in the same account.',
    'The certificate of incorporation is issued electronically and downloaded, with the certified memorandum and articles.',
    'The company NTN is then applied for on IRIS, followed by sales tax registration and the bank account.',
]))
chk.append(D.summary("""
rep("chk.append(D.summary(", chk)
io.open(p, 'w', encoding='utf-8').write(s)
print('patched')
