# -*- coding: utf-8 -*-
# Part 3: the product

divider('3', 'The product', 'Signup to completion, identity and income checks, affordability, the score and its bands, '
        'joining, hosts, late payment and recovery, exit, points, the turn market, Hyper, products in stages and the '
        'application.')

# ---- journey
sl = slide('From Signup to Completion', 'Six stages from signup to a completed circle. Each stage carries the control that '
                             'applies to it, and the party that performs it.',
           src='Default Prevention (HQ-CP-05); Identity Verification Model (HQ-MF-04); decisions D2, D3, D10 and D11.')
steps = [('Sign up', ['Phone number and one time passcode', 'App PIN, asked on every open',
                      'Name, address, city, occupation and employer', 'Terms accepted and recorded']),
         ('Verify', ['Mashreq account opened in the application', 'CNIC with NADRA; live face match',
                     'Income account read and scored', 'Credit report on the member’s instruction']),
         ('Join', ['Seat chosen within the band', 'Affordability checked live', 'Every rupee owed shown before signing',
                   'Undertaking and mutual guarantee signed', '24 hour confirming window']),
         ('Pay', ['Direct debit on the due date', 'Retries on payday, five at most', 'Safepay, Raast or transfer as back up',
                  'Receipt showing each part']),
         ('Collect', ['Pot paid into the member’s own account', 'Arrears set off first',
                      'Paid once and only once', 'Remaining instalments restated']),
         ('Complete', ['Every payment reported to the bureau', 'Band rises after a clean circle',
                       'Balance profit credited as points', 'Host offered the next circle'])]
bw = (CW - 5 * 0.18) / 6
for i, (t, pts) in enumerate(steps):
    x = M + i * (bw + 0.18)
    icon_disc(sl, ['smartphone', 'scan-face', 'users', 'repeat', 'hand-coins', 'badge-check'][i], x + bw / 2 - 0.3,
              Y0 - 0.05, d=0.6, fill_=LIME_XLT)
    rect(sl, x, Y0 + 0.65, bw, 0.46, LIME if i in (0, 5) else LIME_LT, paras=[(t, dict(size=12, bold=True, color=INK,
                                                                                         align=CEN))], pad=0.04,
         anchor=MIDDLE)
    if i < 5:
        line(sl, x + bw + 0.01, Y0 + 0.88, x + bw + 0.17, Y0 + 0.88, L700, 1.25, arrow=True)
    tb(sl, x + 0.02, Y0 + 1.25, bw - 0.04, 2.5, pts, size=10, bullet=True, gap=4, spacing=1.03)
ledger(sl, M, Y0 + 3.85, CW, [
    ('Messages', 'WhatsApp Business Platform for notices: the evening before a debit, after a decline, on payout; one '
                 'daily notice on Hyper. Roman Urdu first, English beneath, and voice notes, since 31 per cent of '
                 'committee users can read a text message.'),
    ('Records', 'Statement, receipts, the schedule of every circle, the signed documents and a full data export for '
                'every member, at any time.'),
], [1.2, 11.0], size=10, rh=0.58)

# ---- identity
sl = slide('Identity and Verification',
           'Mashreq’s account opening establishes who the customer is. Halqa’s identity model then scores the '
           'person, the home and the job into one level, and each circle type needs a level.',
           src='Identity Verification Model (HQ-MF-04); Exit, consent and trust rules, 9 August 2026. NADRA verification is '
               'procured through the Nishan Pakistan portal. Costs are reported figures.')
caption(sl, M, Y0, 6.4, 'Verification levels')
lv = [('Level 1', 'Known circles: family, office, market', 'CNIC with NADRA, live face match, phone and PIN'),
      ('Level 2', 'Unknown circles', 'Level 1, plus the income account, a credit report and an address check'),
      ('Level 3', 'Hyper', 'Level 2, plus daily income proof, two clean circles and a field check on 5 per cent')]
for i, (t, who, what) in enumerate(lv):
    y = Y0 + 0.4 + i * 1.02
    x = M + i * 0.45
    rect(sl, x, y, 6.4 - i * 0.45, 0.9, [LIME_XLT, LIME_LT, LIME][i], line=None,
         paras=[([(t + '   ', dict(size=12, bold=True, color=L700 if i < 2 else INK)),
                  (who, dict(size=11, bold=True))], dict(gap=2)), (what, dict(size=10))], pad=0.14)
heading(sl, M, Y0 + 3.6, 6.4, 'Scores inside the model', size=12)
ledger(sl, M, Y0 + 3.95, 6.4, [
    ('Name', 'Match of CNIC, account and application names: 0.90 or more matches; 0.80 to 0.90 goes to a person; '
             'below 0.80 fails'),
    ('Home', 'Declared address against a one time location pin and a utility bill'),
    ('Job', 'Declared occupation against salary or business income seen in the account'),
], [0.9, 5.5], size=9.5, rh=0.38)
x0 = 7.35
heading(sl, x0, Y0, W - M - x0, 'Rules')
icon_rows(sl, x0, Y0 + 0.45, W - M - x0, [
    ('id-card', 'Adults only.', 'The CNIC must show 18 or over: only adults can contract (Contract Act s.11; Majority Act '
                                's.3).'),
    ('scan-face', 'Face again when it matters.', 'A new device, a large instalment, a first-half seat, any exit or '
                                                 'hardship request, 90 days without use.'),
    ('coins', 'Cost discipline.', 'A NADRA facial check is reported at about Rs 20; one wallet charges Rs 99 for a '
                                  'failed check. Trivial actions are never face checked.'),
    ('eye-off', 'No raw biometrics.', 'Only the result and NADRA’s reference are kept; no face images or '
                                      'templates.'),
    ('lock', 'PIN.', 'Asked on every open, with device biometrics as an option.'),
    ('triangle-alert', 'To fix.', 'The CNIC camera is blocked in production by the site’s permission policy.'),
], rh=0.78, size=10.5, isz=0.28, disc=True)

# ---- income and affordability
sl = slide('Income and Affordability',
           'A member names the account income arrives in. Halqa reads it and caps all committee instalments at a third '
           'of verified income, and at 40 per cent together with other loan repayments. The tighter cap applies.',
           src='Income Account Verification Model (HQ-MF-03); Affordability Model (HQ-MF-02); State Bank, Prudential '
               'Regulations for Consumer Financing, R-3, as amended by BPRD Circular Letter 29 of 2021.')
caption(sl, M, Y0, 6.2, 'Worked example: income Rs 60,000 a month, Rs 5,000 of other loan repayments')
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, M - 0.05, Y0 + 0.3, 6.3, 2.35,
      ['Verified income', 'Cap A: a third of income', 'Cap B: 40% less other loans', 'Allowed for committees'],
      [('Rs', [60000, 20000, 19000, 19000])], point_colors=[GREY_LT, LIME, LIME, L700], fmt='"Rs "#,##0', gap=40,
      size=10, label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=72000)
tb(sl, M, Y0 + 2.75, 6.2, 0.9, [
    ('“The total monthly amortization payments of consumer financing facilities ... should not exceed 40% of the '
     'net disposal income of the prospective borrower.”', dict(size=10.5, font=DISPLAY, italic=True, gap=2,
                                                                     spacing=1.06)),
    ('State Bank limit for banks, R-3; adopted by Halqa voluntarily and made stricter', dict(size=8.5, color=GREY))])
ledger(sl, M, Y0 + 3.8, 6.2, [
    ('From the 4th circle', 'Stricter caps; total still owed across all circles at most a year of verified income'),
    ('Circle limits', 'At most six circles; one Hyper at a time; a new host runs two circles until proven'),
    ('Hyper', 'Carrying Option 1 needs verified income of about Rs 41,000 a month'),
], [1.5, 4.7], size=9.5, rh=0.4)
x0 = 7.2
heading(sl, x0, Y0, W - M - x0, 'The income account')
notes(sl, x0, Y0 + 0.45, W - M - x0, 4.7, [
    ('Definition.', 'Any account in the member’s own name that the member designates as the one income arrives in. '
                    'Compulsory on unknown circles and Hyper.'),
    ('Salary test.', 'Credits from the same employer on about the same day each month prove a salary account.'),
    ('Daily income test.', 'Rs 1,000 or more received on at least five days of every week for the last eight weeks, '
                           'for Hyper.'),
    ('Excluded.', 'Money moved in from the member’s own accounts, loans and round trips.'),
    ('Under the bank route.', 'When salary lands at Mashreq, the statement is read with the member’s consent '
                              'inside the bank; other banks by statement upload.'),
    ('Discipline.', 'A clean history opens earlier seats, never a larger money cap. Only new income evidence raises '
                    'the cap, and headroom is always shown in rupees, never a bare refusal.'),
], size=10.5, gap=6)

# ---- score and bands
sl = slide('Score and Bands',
           'Halqa’s internal score runs from 300 to 850 and moves on recorded events. It decides only which seats '
           'a member may claim; it never reorders a circle.',
           src='Credit Scoring Model (HQ-MF-06); score-bands.ts, as implemented on 24 September 2026. Scorecard constants '
               'are illustrative until about 1,000 memberships have completed.')
caption(sl, M, Y0, 6.0, 'Score points by event')
ev = [('Circle completed clean', 25), ('Paid 3 or more days early', 6), ('Paid on time', 4),
      ('Paid 1 to 3 days late', -10), ('Declared payday contradicted', -15), ('Paid 4 or more days late', -20),
      ('Guaranteed member defaults', -25), ('Missed beyond grace', -40), ('Default after collecting', -200)]
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, M - 0.05, Y0 + 0.3, 6.1, 4.2, [e for e, _ in ev], [('Points', [v for _, v in ev])],
      point_colors=[L700 if v > 0 else (RED if v <= -40 else AMBER) for _, v in ev], fmt='+#,##0;−#,##0',
      gap=35, size=9.5, label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmin=-240, vmax=60, cat_low=True)
tb(sl, M, Y0 + 4.6, 6.0, 0.4, 'Every new account starts at 700.', size=9.5, color=GREY)
x0 = 6.95
heading(sl, x0, Y0, W - M - x0, 'Bands and seats')
bands = [('Excellent', '750 and above', 'Any free seat', L700, WHITE),
         ('Good', '650 to 749', 'Any free seat', L600, WHITE),
         ('Fair', '550 to 649', 'Any free seat in the second half', LIME, INK),
         ('Rebuilding', 'below 550', 'The last three seats; may not buy turns', LIME_LT, INK),
         ('New member', 'any score', 'The last three seats until two clean circles and full verification', PAPER, INK)]
for i, (n_, sc, st_, col, tc) in enumerate(bands):
    y = Y0 + 0.45 + i * 0.52
    rect(sl, x0, y, 1.35, 0.44, col, paras=[(n_, dict(size=10.5, bold=True, color=tc, align=CEN))], pad=0.02,
         anchor=MIDDLE)
    tb(sl, x0 + 1.45, y, 1.2, 0.44, sc, size=9.5, color=GREY, anchor=MIDDLE)
    tb(sl, x0 + 2.65, y, W - M - x0 - 2.65, 0.44, st_, size=10, anchor=MIDDLE, spacing=1.03)
notes(sl, x0, Y0 + 3.2, W - M - x0, 2.0, [
    ('TASDEEQ equivalent.', '200 + (Halqa score − 300) × 400 / 550: band lines 550, 650 and 750 read as '
                            '382, 455 and 527 on TASDEEQ’s 200 to 600 scale. For display only.'),
    ('Next version.', 'A logistic scorecard fitted to observed defaults after about 1,000 completed memberships: score = '
                      'offset + factor × ln(odds), 40 points to double the odds, 700 at 30 to 1.'),
], size=10, gap=6)

# ---- joining
sl = slide('Joining a Circle',
           'Joining binds the member by contract before any money moves. Nobody is locked in by surprise: the whole '
           'obligation is shown in rupees, and there are 24 hours to withdraw before the circle starts.',
           src='Default Prevention (HQ-CP-05), section 3; Electronic Transactions Ordinance 2002, ss.3 and 7; Contract Act '
               '1872, ss.126 and 128. SBP requires a two hour cooling period on branchless banking cash outs (April 2023).')
caption(sl, M, Y0, 8, 'Circle states')
states = [('Forming', 'Host sets the rules; members apply; the host admits each after seeing their standing'),
          ('Confirming', '24 hours from the host’s start: roster locked, agreements signed, any member may withdraw '
                         'free and unrecorded'),
          ('Active', 'Debits and payouts run each round; the late ladder applies'),
          ('Completed', 'Every member paid and collected; records reported; profit credited as points')]
flow(sl, M, Y0 + 0.35, CW, 1.25, states, gap=0.35, size=10, head_size=12,
     fills=[WHITE, LIME_LT, WHITE, LIME_XLT], lines=[RULE, L700, RULE, RULE])
tb(sl, M + CW / 4, Y0 + 1.65, CW / 4 + 0.3, 0.4, 'Too few remain after withdrawals: back to forming', size=9,
   color=GREY, align=CEN)
heading(sl, M, Y0 + 2.2, CW, 'What the member signs and agrees')
ledger(sl, M, Y0 + 2.6, CW, [
    ('Undertaking', 'Ten clauses signed in the application: pay every instalment, the late ladder, the arrears rule, '
                    'acceleration on default, consent to credit reporting, and dispute resolution', 'ETO 2002, ss.3 and 7'),
    ('Mutual guarantee', 'Every member guarantees the others, member to member, never to Halqa; the circle cannot start '
                         'until all have signed', 'Contract Act, ss.126 and 128'),
    ('Mandate', 'Direct debit at Mashreq; auto debit compulsory on unknown circles and Hyper', 'PS&EFT Act, s.35(1)'),
    ('Cover', 'Compulsory on unknown circles and Hyper; the form is Mashreq’s choice', 'Decision D7'),
    ('Guarantee cheque', 'Optional paper cheque held on file; any fee discount for it is Mashreq\u2019s to set', 'Penal Code s.489-F; '
                                                                                                'CPC Order XXXVII'),
    ('Open default lock', 'A member, or a linked account, with an open default cannot join or create anything',
     'Product rule'),
], [1.6, 8.0, 2.6], size=9.5, rh=0.37, icons=['file-text', 'handshake', 'repeat', 'shield-check', 'banknote',
                                              ('ban', RED)])

# ---- hosts and known circles
sl = slide('Hosts and Known Circles',
           'The host is how committees grow: every circle arrives as a formed group with a leader. Known circles earn '
           'lighter checks only when the group accepts the risk itself and the group is shown to be real.',
           src='Exit, consent and trust rules, 9 August 2026 (Apna Halqa tier); Growth strategy, 2 August 2026; Ghatak, '
               'peer selection under joint liability. Hosting rewards are paid in points.')
caption(sl, M, Y0, 5.8, 'The host removal test: take the host out, and the attestation graph must stay connected')


def graph(x, y, w, h, edges, n, host=0, title='', ok=True):
    pts = []
    for k in range(n):
        a = math.radians(k * 360.0 / n - 90)
        pts.append((x + w / 2 + (w / 2 - 0.2) * math.cos(a), y + h / 2 + (h / 2 - 0.2) * math.sin(a)))
    cxh, cyh = x + w / 2, y + h / 2
    for a_, b_ in edges:
        pa = (cxh, cyh) if a_ == 'h' else pts[a_]
        pb = (cxh, cyh) if b_ == 'h' else pts[b_]
        line(sl, pa[0], pa[1], pb[0], pb[1], GREY_LT if 'h' in (a_, b_) else L700, 1.0, dash='h' in (a_, b_))
    oval(sl, cxh - 0.14, cyh - 0.14, 0.28, AMBER)
    for px, py in pts:
        oval(sl, px - 0.11, py - 0.11, 0.22, LIME if ok else GREY_LT)
    tb(sl, x, y + h + 0.05, w, 0.5, title, size=10, bold=True, color=L700 if ok else RED, align=CEN)


n8 = 8
real = [('h', k) for k in range(n8)] + [(k, (k + 1) % n8) for k in range(n8)] + [(0, 4), (2, 6), (1, 5)]
fake = [('h', k) for k in range(n8)]
graph(M + 0.1, Y0 + 0.4, 2.6, 2.6, real, n8, title='A real circle: still connected', ok=True)
graph(M + 3.1, Y0 + 0.4, 2.6, 2.6, fake, n8, title='A fabricated star: falls apart', ok=False)
tb(sl, M, Y0 + 3.6, 5.8, 1.5, 'Members attest privately whom they know. Amber is the host; dashed lines are ties to the '
   'host, which the test ignores. Every member needs at least two ties and the average at least three. A single hub '
   'with 117 spokes and no ties between them, the shape of the largest Pakistani committee fraud of 2022, fails at once.',
   size=9.5, color=GREY, spacing=1.07)
x0 = 6.75
heading(sl, x0, Y0, W - M - x0, 'Known circles, lighter checks')
bullets(sl, x0, Y0 + 0.42, W - M - x0, 1.9, [
    'Pass the host removal test',
    'At least three members, or 30 per cent, fully verified and not clustered with the host by device, network or address',
    'Stakes at most Rs 25,000 a month and a pot of Rs 300,000',
    'An enhanced mutual guarantee, joint and several: attestors first, then the circle'], size=10, gap=3)
tb(sl, x0, Y0 + 2.3, W - M - x0, 0.7, 'Never relaxed: identity, the ledger, the 24 hour window, the affordability caps, '
   'host limits and the exit rules. A clean circle keeps the tier when 70 per cent of the roster returns.', size=10,
   color=INK, spacing=1.06)
heading(sl, x0, Y0 + 3.15, W - M - x0, 'Host rewards')
icon_rows(sl, x0, Y0 + 3.55, W - M - x0, [
    ('gift', 'Points.', '2,500 when a hosted circle completes cleanly; 1,000 for a referral who completes a first circle'),
    ('ban', 'No pyramids.', 'Rewarded on value, never on recruitment depth'),
    ('badge-check', 'Status.', 'A verified host badge and first access to new products'),
], rh=0.5, size=10, isz=0.24, rules=False)

# ---- late payment and recovery
sl = slide('Late Payment and Recovery',
           'Most members never reach recovery. When one does, each step is stated in the undertaking before joining, '
           'penalties stay within the limit the Contract Act allows, and no step uses pressure outside the law.',
           src='Default Prevention (HQ-CP-05), sections 4 and 5; Contract Act 1872, s.74; Code of Civil Procedure, Order '
               'XXXVII, r.2(1); Corporate Insurance Agents Regulations 2020, reg 7(4). Monthly penalties as implemented.')
caption(sl, M, Y0, 8, 'Late ladder')
lad = [('Grace', 'Retries and reminders on payday and the days after; no penalty'),
       ('Step 1', 'Monthly: 2% of the instalment, score −10. Hyper: 12 hours, 5%'),
       ('Step 2', 'Monthly: 5%, score −20. Hyper: 36 hours, 10%'),
       ('Step 3', 'Monthly: 10%, score −40. Hyper: 60 hours, 15%')]
flow(sl, M, Y0 + 0.35, 7.6, 1.1, lad, gap=0.25, size=9.5, head_size=11,
     fills=[WHITE, C('FBF3DC'), C('F6E7B4'), C('F4D6CF')])
tb(sl, M, Y0 + 1.55, 7.6, 0.6, 'Penalties are “reasonable compensation not exceeding the amount so named” '
   '(Contract Act s.74). On the Islamic window and Shariah labelled circles they go to charity at the end of the '
   'circle.', size=9.5, color=GREY, spacing=1.06)
heading(sl, M, Y0 + 2.2, 7.6, 'After collecting: recovery, in order')
ledger(sl, M, Y0 + 2.6, 7.6, [
    ('Hardship path', 'A member who makes contact gets a recorded statement, a waived fine and a new date'),
    ('Pot set off', 'Arrears before collecting come out of the member’s own pot'),
    ('Standing', 'Default after collecting costs 200 points and restricts the account'),
    ('Cover claim', 'Paid to each member left short, in that member’s own name'),
    ('Guarantee and suit', 'The mutual guarantee, acceleration, then an ordinary civil suit on the undertaking'),
    ('Cheque', 'Only where one is held: a summary suit on it; a criminal complaint only on counsel’s advice'),
], [1.55, 6.05], size=9.5, rh=0.38)
x0 = 8.55
heading(sl, x0, Y0, W - M - x0, 'Never done')
for i, t in enumerate(['No calls to relatives or contacts, at any stage', 'No reading of contact lists or messages',
                       'No public list of defaulters; the flag stays inside the member’s own circles',
                       'No calls by Halqa or a host demanding payment', 'No summary suit on the undertaking itself',
                       'No claim that a defaulter can be jailed']):
    y = Y0 + 0.5 + i * 0.6
    cross(sl, x0, y + 0.1, 0.18, RED, 1.8)
    tb(sl, x0 + 0.35, y, W - M - x0 - 0.35, 0.55, t, size=10.5, anchor=MIDDLE, spacing=1.05)
tb(sl, x0, Y0 + 4.2, W - M - x0, 0.9, 'The summary procedure covers only bills of exchange, hundis and promissory notes, '
   'so the undertaking is enforced by an ordinary suit.', size=9.5, color=GREY, spacing=1.06)

# ---- exit
sl = slide('Exit',
           'There is no cancel button. A member who has not yet collected leaves by one of five rungs, and money comes '
           'back at the end of the circle without anyone holding a pool.',
           src='Exit, consent and trust rules, 9 August 2026; exit-ladder.ts. The identity holds for any number of exits, '
               'applied in turn.')
rungs = [('1  Window', 'Inside the 24 hour confirming window: free and unrecorded'),
         ('2  Substitution', 'A replacement takes the seat and pays the leaver what the leaver has paid; the aim for '
                             'most exits'),
         ('3  Group approved', 'A 72 hour vote; a fine of one instalment; money back at the close'),
         ('4  Hardship', 'A recorded statement through the helpline; fine waived; recorded as hardship, not default'),
         ('5  Abandonment', 'Not an exit: recovery applies and restitution is withheld and set off')]
for i, (t, d) in enumerate(rungs):
    y = Y0 + i * 0.62
    rect(sl, M + i * 0.3, y, 6.3 - i * 0.3, 0.54, [LIME_XLT, LIME_XLT, LIME_LT, LIME_LT, C('F4D6CF')][i],
         paras=[([(t + '   ', dict(size=10.5, bold=True, color=L700 if i < 4 else RED)), (d, dict(size=9.5))], {})],
         pad=0.12, anchor=MIDDLE)
ledger(sl, M, Y0 + 3.3, 6.3, [
    ('Vote', 'Majority of votes cast, not counting the member leaving; 50 per cent quorum; no quorum goes to Halqa '
             'review and never traps the member'),
    ('Host', 'Votes as one member and breaks ties; no veto'),
    ('Fine', '70 per cent to the remaining members, whose pots shrank; 30 per cent administration'),
], [0.8, 5.5], size=9.5, rh=0.52)
x0 = 7.25
caption(sl, x0, Y0, W - M - x0, 'Restitution: twelve members at Rs 10,000; one leaves after round 4')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, x0 - 0.05, Y0 + 0.3, W - M - x0 + 0.1, 2.5,
      ['Seat 1', 'Seat 2', 'Seat 3', 'Seat 4', 'The leaver'],
      [('Owed at the close', [-10000, -10000, -10000, -10000, 40000])],
      point_colors=[AMBER, AMBER, AMBER, AMBER, L700], fmt='"Rs "#,##0;"−Rs "#,##0', gap=50, size=9.5,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmin=-20000, vmax=52000, cat_low=True)
notes(sl, x0, Y0 + 3.0, W - M - x0, 2.2, [
    ('Why.', 'The circle contracts to eleven, so each later pot is Rs 10,000 smaller. The four members who collected '
             'before the exit took full pots, so each ends Rs 10,000 ahead.'),
    ('Settlement.', 'Each of them returns Rs 10,000 at the close; the leaver is made whole at Rs 40,000, with no time '
                    'value, which is the deterrent. Every continuing member ends at received less paid equal to zero.'),
], size=10, gap=6)

# ---- points
sl = slide('Points',
           'Points reward on time payment, completed circles and referrals, and carry the balance profit Mashreq pays at '
           'the end of each circle. Under the bank route they become Mashreq’s product.', partner=True,
           src='Seat Exchange and Points (HQ-CP-04), 25 September 2026; decisions D4 and D9, 28 September 2026. Virtual '
               'Assets Act 2026, s.2(2)(a); EMI Regulations 2023, para 2. The point value is open.')
caption(sl, M, Y0, 6.6, 'The points cycle')
cx0, cy0, R0 = M + 3.3, Y0 + 2.15, 1.45
nodes = [('Earn', 'coins', -90, ['On time: 60', 'Five in a row: 100 more', 'Host of a clean circle: 2,500',
                                  'Referral: 1,000', 'Balance profit: 1 a rupee']),
         ('Hold', 'wallet', 30, ['A balance under Mashreq’s licence', 'Bought with money (D9)', 'Never cashed out']),
         ('Spend', 'shopping-bag', 150, ['Halqa marketplace goods', 'Halqa fees', 'Turns in the turn market',
                                          'Mashreq rewards and cashback'])]
pts_xy = [(cx0 + R0 * math.cos(math.radians(a)), cy0 + R0 * math.sin(math.radians(a))) for _, _, a, _ in nodes]
for k in range(3):
    (x1_, y1_), (x2_, y2_) = pts_xy[k], pts_xy[(k + 1) % 3]
    dx, dy = x2_ - x1_, y2_ - y1_
    ln_ = math.hypot(dx, dy)
    ux, uy = dx / ln_, dy / ln_
    line(sl, x1_ + ux * 0.6, y1_ + uy * 0.6, x2_ - ux * 0.6, y2_ - uy * 0.6, L700, 1.75, arrow=True)
for (t, ic, ang, items), (px, py) in zip(nodes, pts_xy):
    icon_disc(sl, ic, px - 0.48, py - 0.48, d=0.96, fill_=LIME if t == 'Hold' else LIME_LT)
    paras = [(t, dict(size=13, bold=True, color=L700, gap=2))] + [(it, dict(size=9.5, gap=1)) for it in items]
    if t == 'Earn':
        tb(sl, px + 0.62, py - 0.55, 2.6, 1.5, paras, spacing=1.03)
    else:
        tb(sl, px - 1.3, py + 0.55, 2.6, 1.4, [(p_, dict(o, align=CEN)) for p_, o in paras], spacing=1.03)
tb(sl, cx0 - 1.0, cy0 - 0.12, 2.0, 0.3, 'one point = Rs 1 of reward', size=9, color=GREY, align=CEN)
x0 = 7.45
heading(sl, x0, Y0, W - M - x0, 'Rules and the law')
icon_rows(sl, x0, Y0 + 0.42, W - M - x0, [
    ('scale', 'The open decision.', 'Earning was set at ten points to a rupee of fee, about Rs 8 an on time instalment; '
                                    'the balance reward is one point to a rupee. One value is chosen before launch.'),
    ('landmark', 'Stored value.', 'Points bought with money and spent outside Halqa are electronic money in substance, '
                                  'so they are issued as Mashreq’s product under its licence.'),
    ('lock', 'Closed loop no longer.', 'The Virtual Assets Act exclusion needs all seven of its conditions; these points '
                                       'rest on the bank’s licence instead.'),
    ('message-circle', 'Wording.', 'Never called money, a currency or an investment in published material.'),
    ('eye', 'Ads.', 'Points for rewarded ads must be non transferable under the ad network’s rules: a separate '
                    'fees-only balance.'),
], rh=0.93, size=10, isz=0.26, disc=True)

# ---- turn market
sl = slide('Turn Market',
           'Members may buy and sell turns with each other, as decided on 28 September. Each trade stays inside the '
           'bands, needs the host, and is settled by Mashreq.',
           src='Decision D9, 28 September 2026; Seat Exchange and Points (HQ-CP-04). Legal points to be confirmed by '
               'counsel and the Shariah board before launch.')
seats = 12
sw_ = (CW - 11 * 0.08) / seats
for k in range(seats):
    x = M + k * (sw_ + 0.08)
    col = LIME if k in (2, 10) else WHITE
    rect(sl, x, Y0 + 0.45, sw_, 0.5, col, line=L700 if k in (2, 10) else RULE,
         paras=[('%d' % (k + 1), dict(size=12, bold=k in (2, 10), align=CEN))], pad=0, anchor=MIDDLE)
xa = M + 2 * (sw_ + 0.08) + sw_ / 2
xb = M + 10 * (sw_ + 0.08) + sw_ / 2
elbow(sl, [(xa, Y0 + 1.0), (xa, Y0 + 1.3), (xb, Y0 + 1.3), (xb, Y0 + 1.0)], L700, 1.25)
elbow(sl, [(xb, Y0 + 0.4), (xb, Y0 + 0.2), (xa, Y0 + 0.2), (xa, Y0 + 0.4)], L700, 1.25)
tb(sl, (xa + xb) / 2 - 3.5, Y0 + 1.35, 7.0, 0.3, 'Worked example: the buyer moves from seat 11 to seat 3. Asking '
   'price 50,000 points; offer 35,000; agreed at 40,000.', size=10, color=L700, align=CEN, bold=True)
flow(sl, M, Y0 + 1.85, CW, 1.1, [('List', 'The seller sets an asking price'),
                                 ('Offer', 'The buyer’s band must permit the seat'),
                                 ('Accept', 'The seller accepts with a PIN; points reserved'),
                                 ('Approve', 'The host approves'),
                                 ('Check', 'Both members must be eligible for their new seats'),
                                 ('Settle', 'One transaction swaps seats and moves the price; recorded')],
     gap=0.22, size=9.5, head_size=11)
ledger(sl, M, Y0 + 3.2, 6.0, [
    ('Where', 'Monthly circles only; never on Hyper or asset circles'),
    ('Fee', 'Rs 500 plus sales tax, paid by the buyer, or 5,000 points'),
    ('Ceiling', 'A price ceiling on each seat, to be set'),
], [1.0, 5.0], size=10, rh=0.42)
x0 = M + 6.4
heading(sl, x0, Y0 + 3.2, W - M - x0, 'Flags, labelled not hidden', size=12)
notes(sl, x0, Y0 + 3.6, W - M - x0, 1.6, [
    ('Lending.', 'Counsel must confirm whether a turn bought for money or points is a loan between members under the '
                 'P2P definition.'),
    ('Shariah.', 'Circles that allow turn sales are not labelled Shariah compliant.'),
], size=10, gap=5)

# ---- hyper
sl = slide('Hyper',
           'Daily circles for members with daily income, kept exactly as designed and labelled experimental. Two '
           'options, both fixed on 23 September 2026.',
           src='Hyper Committee (HQ-CP-08); decision D8, 28 September 2026. The Rs 15 fee asked for on 26 September is '
               'an open decision.')
rect(sl, M + 1.45, 0.47, 1.2, 0.3, AMBER, paras=[('Experimental', dict(size=9.5, bold=True, color=INK, align=CEN))],
     pad=0.02, anchor=MIDDLE)
caption(sl, M, Y0, 5.2, 'What a member pays each day, Rs')
chart(sl, XL_CHART_TYPE.COLUMN_STACKED, M - 0.05, Y0 + 0.3, 3.6, 4.2, ['Option 1', 'Option 2'],
      [('Contribution to the pot', [300, 333.33]), ('Cover', [75, 83.33]), ('Fee', [75, 83.33])],
      colors=[L700, LIME_MID, AMBER], fmt='General', gap=55, overlap=100, legend=True, size=9.5,
      label_pos=XL_LABEL_POSITION.CENTER, vmax=560)
tb(sl, M + 0.1, Y0 + 4.55, 3.4, 0.4, 'Totals: Rs 450 and Rs 500 a day', size=9.5, color=GREY, align=CEN)
x1 = M + 3.75
for k, (t, vals) in enumerate((('Option 1', [('users', '400', 'members'), ('calendar-days', '50', 'days'),
                                             ('hand-coins', '8', 'collect each day'),
                                             ('banknote', 'Rs 15,000', 'pot, collected once'),
                                             ('receipt', 'Rs 22,500', 'paid over the cycle')]),
                               ('Option 2', [('users', '390', 'members'), ('calendar-days', '26', 'days, Sundays off'),
                                             ('hand-coins', '15', 'collect each day'),
                                             ('banknote', 'Rs 8,666.67', 'pot, collected once'),
                                             ('receipt', 'Rs 13,000', 'paid over the cycle')]))):
    xx = x1 + k * 2.2
    tb(sl, xx, Y0, 2.0, 0.3, t, size=12.5, color=L700, font=DISPLAY)
    rule(sl, xx, Y0 + 0.36, 2.0, L700, 1.0)
    for j, (ic, n_, lab) in enumerate(vals):
        y = Y0 + 0.5 + j * 0.8
        icon(sl, ic, xx, y + 0.08, 0.28)
        tb(sl, xx + 0.4, y, 1.6, 0.4, n_, size=14, color=INK, font=DISPLAY)
        tb(sl, xx + 0.4, y + 0.36, 1.6, 0.35, lab, size=9, color=GREY)
x0 = 8.45
heading(sl, x0, Y0, W - M - x0, 'Rules')
icon_rows(sl, x0, Y0 + 0.42, W - M - x0, [
    ('scale', 'Flat fee.', 'The same every day, collected by Mashreq (D5); a fee graded by how early a member '
                           'collects reads as interest.'),
    ('calculator', 'Identities.', 'pot = contribution \u00d7 days; roster = collectors a day \u00d7 days.'),
    ('badge-check', 'Entry.', 'Level 3, two clean circles, Rs 1,000 on five days a week for eight weeks, income of '
                              'about Rs 41,000 a month.'),
    ('shield-check', 'Always.', 'Auto debit and cover compulsory; one Hyper at a time.'),
    ('bike', 'Who.', 'Drivers, riders and traders paid daily, through employers and associations as hosts.'),
], rh=0.92, size=10, isz=0.26, disc=True)

# ---- hyper risk
sl = slide('Hyper: Risk and Stress',
           'Hyper loses money only when a member collects and then stops paying. On average such a default costs about '
           'half a pot. A daily stress index warns early, and a hard stop prevents any day opening without cover.',
           src='Hyper Default Threshold Model (HQ-MF-01); Takaful Cover Pricing Model (HQ-MF-05); Business Model and '
               'Unit Costs (HQ-CP-03), 25 September 2026, before Mashreq’s terms.')
caption(sl, M, Y0, 4.0, 'One day on Option 1')
for k in range(8):
    x = M + 0.05 + k * 0.49
    rect(sl, x, Y0 + 0.4, 0.4, 0.36, LIME, paras=[('C%d' % (k + 1), dict(size=8.5, bold=True, align=CEN))], pad=0,
         anchor=MIDDLE)
    for j in range(7):
        rect(sl, x + (j % 4) * 0.1, Y0 + 0.92 + (j // 4) * 0.12, 0.075, 0.075, L700)
tb(sl, M, Y0 + 1.25, 4.0, 1.2, '392 members pay and 8 collect. Each collector is paid by 49 named members: 49 × '
   'Rs 300 = Rs 14,700, plus the collector’s own Rs 300 set off, makes Rs 15,000.', size=9.5, spacing=1.06)
caption(sl, M, Y0 + 2.4, 4.0, 'Cover fund against stress loss, Rs million')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, M - 0.05, Y0 + 2.7, 4.1, 2.4, ['Option 1', 'Option 2'],
      [('Cover fund', [1.5, 0.845]), ('Stress loss', [1.068, 0.595])], colors=[L700, AMBER], fmt='General',
      gap=70, overlap=-10, legend=True, size=9.5, label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=1.8)
x1 = 4.95
caption(sl, x1, Y0, 3.9, 'Stress index, 0 to 100, each day')
for col, lab, a_, b_ in ((LIME, 'Green', 0, 0.33), (AMBER, 'Amber', 0.33, 0.66), (RED, 'Red', 0.66, 1.0)):
    rect(sl, x1 + 3.9 * a_, Y0 + 0.4, 3.9 * (b_ - a_), 0.36, col,
         paras=[(lab, dict(size=9.5, bold=True, color=INK if col != RED else WHITE, align=CEN))], pad=0,
         anchor=MIDDLE)
ledger(sl, x1, Y0 + 0.95, 3.9, [
    ('Day 5', '1.2', 'Reminders only'), ('Day 20', '28.6', 'Host told; cover on notice'),
    ('Day 30', '49.5', 'Amber: new joins blocked'), ('Day 45', '72.1', 'Red: next day not opened'),
], [0.8, 0.6, 2.5], size=9.5, rh=0.36)
tb(sl, x1, Y0 + 2.55, 3.9, 1.3, 'Weights: severity 45, breadth 20, behaviour 15, persistence 10, timing 10. Hard stop: '
   'no day opens once unrecovered exposure exceeds the cover limit, whatever the index says.', size=9.5,
   color=GREY, spacing=1.06)
x2 = 9.2
caption(sl, x2, Y0, W - M - x2, 'Net to Halqa per cycle, 25 September model')
ledger(sl, x2, Y0 + 0.4, W - M - x2, [
    ('Option 1, first', 'Rs 888,998'), ('Option 1, later', 'Rs 1,168,855'), ('Option 2, first', 'Rs 396,293'),
    ('Option 2, later', 'Rs 669,154'), ('At card prices', 'Rs 397,855 and Rs 268,624'),
], [1.7, 1.9], size=9.5, rh=0.36)
notes(sl, x2, Y0 + 2.45, W - M - x2, 2.6, [
    ('Loss arithmetic.', 'Missing before collecting is not a loss: it comes out of the member’s own pot.'),
    ('Benchmark.', 'Hyper cover is sized for a 50 per cent default rate; microfinance arrears peaked at 6.01 per cent '
                   '(VIS, 2026).'),
    ('Messages.', 'About Rs 2,000 a day of WhatsApp notices on either option.'),
], size=9.5, gap=5)

# ---- products and stages
sl = slide('Products and Stages',
           'Monthly circles between people who know each other come first. Each later product opens after the pilot '
           'and with Mashreq’s approval.', partner=True,
           src='Decisions D8, D13 and D14, 28 September 2026; Growth strategy, 2 August 2026; Gold goal research, 22 July '
               '2026. Later products are approved in principle, not built.')
stages = [('Pilot', LIME, INK, [('users', 'Known monthly circles', 'Family, office and market circles of 6 to 20'),
                                ('piggy-bank', 'Short term savings', 'Payday to the due date, reward in points'),
                                ('chart-line', 'Credit reporting', 'Every payment, from day one')]),
          ('After the pilot', LIME_LT, INK, [('user-check', 'Unknown circles', 'Matched by band, with compulsory cover'),
                                             ('bike', 'Asset circles', 'Motorcycles, rickshaws and machines financed '
                                                                       'by Mashreq'),
                                             ('plane', 'Across borders', 'Members in the UAE on Mashreq accounts'),
                                             ('arrow-left-right', 'Turn market', 'Member to member, inside the bands')]),
          ('Experimental', C('F6E7B4'), INK, [('zap', 'Hyper', 'Daily circles in two options, labelled '
                                                               'experimental')]),
          ('Later', PAPER, INK, [('gem', 'Gold goal circles', 'Target in grams, paid out at the day’s spot price'),
                                 ('award', 'Credit builder circles', 'Joined to build a TASDEEQ record'),
                                 ('moon', 'Seasonal circles', 'Qurbani, Ramadan and Hajj'),
                                 ('briefcase', 'Employer circles', 'Endorsed by an employer; income verified at '
                                                                   'source')])]
cw4 = (CW - 3 * 0.25) / 4
for i, (t, col, tc, prods) in enumerate(stages):
    x = M + i * (cw4 + 0.25)
    rect(sl, x, Y0, cw4, 0.5, col, paras=[(t, dict(size=12.5, bold=True, color=tc))], pad=0.14, anchor=MIDDLE)
    if i < 3:
        line(sl, x + cw4 + 0.02, Y0 + 0.25, x + cw4 + 0.23, Y0 + 0.25, L700, 1.25, arrow=True)
    for k, (ic, pn, pd) in enumerate(prods):
        y = Y0 + 0.7 + k * 1.02
        icon(sl, ic, x + 0.02, y + 0.04, 0.34, AMBER if ic == 'zap' else L700)
        tb(sl, x + 0.5, y, cw4 - 0.5, 0.95, [(pn, dict(size=11, bold=True, gap=2)), (pd, dict(size=9.5,
                                                                                            color=INK2))],
           spacing=1.04)
        rule(sl, x, y + 0.95, cw4)
tb(sl, M, Y0 + 4.9, CW, 0.3, 'Every product keeps the same rules: one flat fee, bands on every seat, cover chosen by '
   'Mashreq, and every payment reported.', size=10, color=GREY)

# ---- application
sl = slide('The Application',
           'The Halqa application as it runs today in preview. Home is the finished reference screen; the rest is being '
           'rebuilt in the manner of the two wallets Pakistanis already use.',
           src='Screens captured from the application in preview mode, 29 September 2026, sample data. Work Register '
               '(HQ-IN-02), revision 3; UI reference study of JazzCash and Easypaisa, 23 September 2026.')
shots = [('home', 'Home'), ('circles', 'Committees'), ('committee', 'A circle'), ('activity', 'Activity')]
ph_h = 3.95
for k, (nm, lab) in enumerate(shots):
    ph = phone(sl, nm, M + k * 1.98, Y0 - 0.05, h=ph_h)
    tb(sl, M + k * 1.98, Y0 + ph_h, ph.width / 914400.0, 0.3, lab, size=9.5, color=GREY, align=CEN)
x0 = M + 8.05
heading(sl, x0, Y0, W - M - x0, 'Design direction')
icon_rows(sl, x0, Y0 + 0.42, W - M - x0, [
    ('search', 'Search', 'in the header, joined with the assistant'),
    ('layout-grid', 'Action grid', 'on Home, customisable'),
    ('gallery-horizontal', 'Card carousel', 'instead of stacked panels'),
    ('calendar-days', 'Activity', 'grouped by date'),
    ('smartphone', 'One navigation', 'and a four tab bar'),
    ('languages', 'Roman Urdu first', 'English beneath; voice notes'),
], rh=0.42, size=10, isz=0.22, rules=False)
heading(sl, x0, Y0 + 3.05, W - M - x0, 'Still to fix', size=12)
bullets(sl, x0, Y0 + 3.42, W - M - x0, 1.7, [
    'Loading states on 3 of 31 pages; four screens crash', 'Retired terms on nine screens',
    'Demo login printed on the live sign-in page', 'Rewards screen shows missing values'], size=9.5, gap=3)

