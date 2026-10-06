# -*- coding: utf-8 -*-
"""Patch build_legal.py: renamed documents, points and e-money, Raast constraint, process and legal requirements."""
import io

p = 'build_legal.py'
s = io.open(p, encoding='utf-8').read()


def rep(a, b):
    global s
    n = s.count(a)
    if n != 1:
        raise SystemExit('found %d: %s' % (n, a[:110]))
    s = s.replace(a, b)


rep("""        'Where a member wants money before their seat, the only route is a licensed lender, which lends under its own licence; '
        'and on asset committees the modaraba, not Halqa, buys and leases the asset.',""",
    """        'Where a member wants money before their seat, the only route is a seat exchange, in which nothing passes between the '
        'two members (Seat Exchange and Points, HQ-CP-04); and on asset committees the modaraba, not Halqa, buys and leases the asset.',""")
rep("""    + P('Halqa issues no claim on itself and receives no funds against one. A member sees what they owe and what they will '
        'receive in each circle, but never a balance held by Halqa, so the definition is not met and no licence is needed.'))""",
    """    + P('Halqa issues no claim on itself and receives no funds against one. A member sees what they owe and what they will '
        'receive in each circle, but never a balance held by Halqa, so the definition is not met and no licence is needed.')
    + P('The points Halqa gives as rewards are not electronic money either. The State Bank&rsquo;s own definition requires value '
        'issued on receipt of funds and accepted by undertakings other than the issuer. Points are issued as rewards, never against '
        'money, and are redeemed only with Halqa, which buys any voucher itself.')
    + Q('EMI', 'Electronic Money or E-money: means the monetary value as represented by a claim on the issuer which is stored in an '
               'electronic including magnetic device or Payment Instrument, issued on receipt of funds of an amount not less in value '
               'than the monetary value issued, accepted as means of payment by undertakings other than the issuer',
        'paragraph 2, Definitions'))""")
rep("""    'Halqa&rsquo;s auto debit, described in full in the Collection and Auto Debit Specification, is a preauthorised '""",
    """    'Halqa&rsquo;s auto debit, described in full in Auto Debit (HQ-CP-02), is a preauthorised '""")
rep("""    + P('A Request to Pay is therefore used only for Halqa&rsquo;s own fee, of which Halqa is the rightful payee, and at '
        'present it costs nothing to receive.'))""",
    """    + P('A Request to Pay is therefore used only for Halqa&rsquo;s own fee, of which Halqa is the rightful payee, and at '
        'present it costs nothing to receive.')
    + P('Raast carries only payments that the payer pushes or approves; it offers no way for a payee to pull money from an '
        'account at another institution. The auto debit therefore runs on the member&rsquo;s wallet at the payment partner, '
        'which the partner debits under the mandate without using Raast to take the money.')
    + Q('RAASTP2M', 'Raast uses more secure payment types, ensures that each transaction is authorized by the payer', 'features of Raast'))""")

proc = """# ---------------------------------------------------------------- 24 process
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
b.append('<h2>25. Questions for counsel</h2>'"""
rep("""# ---------------------------------------------------------------- 24 counsel
b.append('<h2>24. Questions for counsel</h2>'""", proc)
rep("""    'Whether a swap of seats with a reward paid by Halqa and a flat swap fee paid to Halqa stays outside that chapter.',
    'Whether introducing members to a modaraba or a licensed lender is arranging credit that needs any permission.',""",
    """    'Whether a seat exchange, with fee waivers and points given by Halqa and a flat exchange fee paid to Halqa, stays outside '
    'that chapter (Seat Exchange and Points, HQ-CP-04).',
    'Whether introducing members to a modaraba for a referral fee is arranging credit that needs any permission (Asset '
    'Committees, HQ-CP-01).',""")
rep("""# ---------------------------------------------------------------- 25 sources
b.append('<h2>25. Sources</h2>'""", """# ---------------------------------------------------------------- 26 sources
b.append('<h2>26. Sources</h2>'""")
rep("""    ['Raast', 'State Bank of Pakistan, Raast person to person page; Bank Alfalah, Raast P2M questions and answers'],""",
    """    ['Raast', 'State Bank of Pakistan, Raast, Raast person to person and Raast person to merchant pages; Bank Alfalah, Raast P2M questions and answers'],
    ['Modaraba Ordinance 1980, ss.4, 10 and 12', 'Text at nasirlawsite.com, read 25 September 2026'],""")
rep("partners, plus a few written opinions from a lawyer on the points listed in section 24.'))",
    "partners, plus a few written opinions from a lawyer on the points listed in section 25.'))")
io.open(p, 'w', encoding='utf-8').write(s)
print('patched')
