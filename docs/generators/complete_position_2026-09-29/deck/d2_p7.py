# -*- coding: utf-8 -*-
# Part 7: platform, risk and plan; appendix

divider('7', 'Platform, risk and plan', 'How the platform is built and secured, where the build stands, the risks '
        'and their controls, the pre-mortem, the approvals and pilot, the measures, the decisions pending, the work '
        'paused, and the next steps.')

# ---- architecture
sl = slide('Platform Architecture',
           'A web application and an API on managed cloud services, with the decision engines inside the API. Under the '
           'bank route, Mashreq’s systems become the only place money moves.', partner=True,
           src='Halqa live deployment, 20 July 2026; algorithm engines, 13 August 2026; Integration and Outsourcing page. '
               'Mashreq interfaces are proposed, not built.')
caption(sl, M, Y0, 12, 'Components and connections')
bx = [(M, Y0 + 0.45, 'smartphone', 'Member’s phone', 'Web application, React and Vite, installable; PIN on every '
                                                          'open'),
      (M + 3.2, Y0 + 0.45, 'cloud', 'Web host', 'Vercel; halqa-seven.vercel.app; not open to the public'),
      (M + 6.4, Y0 + 0.45, 'server', 'API', 'Node and Express on serverless functions in Singapore; daily jobs at '
                                            '02:00 UTC'),
      (M + 9.6, Y0 + 0.45, 'database', 'Database', 'PostgreSQL on Supabase, pooled connections, 39 models')]
for x, y, ic, t, d in bx:
    box(sl, x, y, 2.95, 1.25, [], line=RULE)
    icon(sl, ic, x + 0.15, y + 0.15, 0.36)
    tb(sl, x + 0.62, y + 0.12, 2.25, 1.1, [(t, dict(size=11, bold=True, gap=2)), (d, dict(size=9, color=GREY))],
       spacing=1.04)
for k in range(3):
    line(sl, M + 2.97 + k * 3.2, Y0 + 1.07, M + 3.18 + k * 3.2, Y0 + 1.07, L700, 1.25, arrow=True)
heading(sl, M + 3.2, Y0 + 1.95, 6.2, 'Engines inside the API', size=12)
eng = [('gauge', 'Exposure score', 'Hyper stress, bands 0.80 to 1.60'), ('clock', 'Time value', 'neutral seat 6.4 of '
                                                                                                 '12'),
       ('gift', 'Rewards', 'streaks at 3 to 36 rounds'), ('door-open', 'Exit ladder', 'restitution identity'),
       ('lock', 'Liability gate', 'seat ceiling by income'), ('wallet', 'Salary pattern', 'payday learned from '
                                                                                           'debits')]
for k, (ic, t, d) in enumerate(eng):
    col_, row_ = divmod(k, 3)
    x = M + 3.2 + col_ * 3.15
    y = Y0 + 2.35 + row_ * 0.5
    icon(sl, ic, x, y + 0.08, 0.26)
    tb(sl, x + 0.36, y, 2.75, 0.48, [[(t + '  ', dict(size=10, bold=True)), (d, dict(size=9, color=GREY))]],
       anchor=MIDDLE)
line(sl, M + 7.9, Y0 + 1.72, M + 7.9, Y0 + 2.3, L700, 1.0, dash=True)
heading(sl, M, Y0 + 3.5, CW, 'Outside services', size=12)
ext = [('landmark', 'Mashreq', 'accounts, mandates, payouts, statements', MQ),
       ('credit-card', 'Safepay', 'back up payments', L700), ('chart-line', 'TASDEEQ', 'reports and records', L700),
       ('scan-face', 'NADRA', 'identity and face', L700), ('message-circle', 'WhatsApp', 'notices and passcodes', L700)]
cw5 = CW / 5
for k, (ic, t, d, col) in enumerate(ext):
    x = M + k * cw5
    icon(sl, ic, x, Y0 + 3.95, 0.34, col)
    tb(sl, x + 0.45, Y0 + 3.9, cw5 - 0.5, 0.6, [(t, dict(size=10.5, bold=True, color=col if col == MQ else INK,
                                                        gap=0)), (d, dict(size=9, color=GREY))], spacing=1.03)

# ---- security and data
sl = slide('Security and Data',
           'The security built in, and what must be fixed before real members. The rule underneath: Halqa keeps no card '
           'number, password, banking credential or raw biometric.',
           src='Halqa live deployment and dev runbook; operational scans of 22 and 24 September 2026.')
heading(sl, M, Y0, 5.9, 'In place')
icon_rows(sl, M, Y0 + 0.42, 5.9, [
    ('lock', 'Accounts.', 'Lockout after five failures for 15 minutes; refresh tokens rotated, with reuse detection.'),
    ('key-round', 'PIN.', 'Stored as a salted hash; asked on every open.'),
    ('credit-card', 'Cards.', 'Only brand, last four digits and expiry; the token stays with the payment provider.'),
    ('eye-off', 'Biometrics.', 'Only the result and NADRA’s reference.'),
    ('file-text', 'Consent.', 'Every signature and consent stored with time, network address and a hash.'),
    ('shield-check', 'Server.', 'Security event log, secrets checked at start, content security and transport '
                                'headers.'),
], rh=0.7, size=10, isz=0.26, disc=True)
x0 = 6.85
heading(sl, x0, Y0, W - M - x0, 'Before real members')
icon_rows(sl, x0, Y0 + 0.42, W - M - x0, [
    (('triangle-alert'), 'Demo login.', 'Printed on the live sign-in page; the demo data must be wiped.'),
    ('key-round', 'Secrets.', 'Rotate the database password and signing keys.'),
    ('database', 'Schema.', 'Two production columns missing; additive SQL files to apply before the next deploy; no '
                            'migration history.'),
    ('activity', 'Monitoring.', 'No error monitoring in the web or the API.'),
    ('scan-face', 'Camera.', 'Blocked by the site permission policy, so CNIC capture fails.'),
    ('map', 'Data location.', 'Database in Singapore; moves if Mashreq or the rules require Pakistan.'),
], rh=0.7, size=10, isz=0.26, disc=True)

# ---- build status
sl = slide('Build Status',
           'The application runs and is tested, but it is not ready for the public. The work register lists every item '
           'still to do; the order of 28 September is to take it past 1,000 items for the bank route.',
           src='Work Register (HQ-IN-02), revision 3 of 24 September 2026 (646 items with status); operational scans of '
               '22 and 24 September 2026; test counts as last recorded.')
caption(sl, M, Y0, 6.2, 'Code scan, 24 September 2026')
scan = [('Unbounded database reads', 58), ('Pages without loading states', 28), ('Files without accessibility labels',
                                                                                   48),
        ('Inline style objects', 117), ('Screens that do not exist yet', 130)]
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, M - 0.05, Y0 + 0.3, 6.3, 2.7, [a for a, _ in scan], [('Count', [v for _, v in scan])],
      point_colors=[AMBER, AMBER, AMBER, GREY_LT, RED], fmt='#,##0', gap=40, size=9.5,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=150)
stat_rows(sl, M, Y0 + 3.2, 6.2, [
    ('list-checks', '646', 'items in the work register, each marked done, partly done or open'),
    ('test-tube', '352', 'integration checks and 60 unit tests passing, 31 July 2026'),
    ('target', '100,000', 'users by 6 October 2026: the target set on 22 September'),
], rh=0.55, num_w=1.1, isz=0.26, size=9.5, nsize=14)
x0 = 7.2
heading(sl, x0, Y0, W - M - x0, 'Order of work under the bank route')
tb(sl, x0, Y0 + 0.45, W - M - x0, 4.6, [
    'Wipe demo data, rotate secrets, apply the missing schema changes',
    'Remove or relabel features of the August design that the bank route retires',
    'Rebuild sign up and sign in; fix the four crashing screens',
    'Build the Mashreq interfaces: account opening, mandate, collection file, payout, statement',
    'Error monitoring, versioned migrations, push messages in place of polling',
    'Load and security tests; a pilot build for about 1,000 members'],
   size=10.5, num=True, gap=7, spacing=1.06, ind=0.28, bcolor=L700)

# ---- risks
sl = slide('Risks and Controls',
           'Each risk placed by likelihood and damage, with the control that answers it. The placing is Halqa’s own '
           'assessment.',
           src='Pre-mortem, handover of 9 August 2026, revised for the bank route. Mashreq figures from its half year '
               'accounts to 30 June 2026.')
gx, gy, gs = M + 0.55, Y0 + 0.1, 1.42
for r_ in range(3):
    for c_ in range(3):
        sev = r_ + c_
        col = LIME_LT if sev <= 1 else (C('F6E7B4') if sev == 2 else C('F4C7C0'))
        rect(sl, gx + c_ * gs, gy + (2 - r_) * gs, gs - 0.05, gs - 0.05, col)
tb(sl, gx, gy + 3 * gs + 0.02, 3 * gs, 0.25, 'Likelihood', size=9.5, color=GREY, align=CEN)
tb(sl, M - 0.2, gy + 1.2 * gs, 0.7, 0.3, 'Impact', size=9.5, color=GREY)
risks = [('1', 2, 2), ('2', 1, 2), ('3', 1, 1), ('4', 0, 2), ('5', 1, 0), ('6', 2, 1), ('7', 1, 2), ('8', 2, 1)]
offs = {}
for n_, lk, im in risks:
    k = offs.get((lk, im), 0)
    offs[(lk, im)] = k + 1
    marker(sl, gx + lk * gs + 0.2 + k * 0.5, gy + (2 - im) * gs + 0.5, n_, d=0.4, color=L700, size=11)
x0 = M + 5.0
riskt = [('1', 'The wallets take the category', 'JazzCash reaches users first. Control: the bank partnership, one flat '
                                                'fee and a credit record a wallet does not give.'),
         ('2', 'Defaults beyond the model', 'Control: bands, affordability, cover chosen by Mashreq, the Hyper hard stop.'),
         ('3', 'Fraud or money laundering', 'Control: Mashreq’s checks; payouts only to the member’s own account.'),
         ('4', 'Rules change after a scandal', 'Control: operate inside a bank’s licence with published rules.'),
         ('5', 'Technology failure', 'Control: outsourcing agreement, security tests, audit logs, daily reconciliation.'),
         ('6', 'The partnership stalls', 'Control: fixed pilot dates; Safepay routes keep collection alive.'),
         ('7', 'A host runs a fraud on Halqa’s credibility', 'Control: host limits, growth flags, credit record '
                                                                  'scoped to activity on Halqa.'),
         ('8', 'Partner strength', 'Mashreq has accumulated losses of Rs 16.2 billion, backed by its parent; the '
                                   'partnership should not depend on one bank alone.')]
for i, (n_, t, d) in enumerate(riskt):
    y = Y0 + i * 0.63
    marker(sl, x0, y + 0.1, n_, d=0.32, color=L700, size=10)
    tb(sl, x0 + 0.45, y, W - M - x0 - 0.45, 0.62, [(t, dict(size=10.5, bold=True, color=INK, gap=1)),
                                                   (d, dict(size=9.5, color=INK2))], spacing=1.03)

# ---- pre-mortem
sl = slide('Pre-Mortem',
           'Suppose it is 2029 and Halqa has failed. These are the likely causes, each with the early signal to watch.',
           src='Handover, 10 Current State and Next Actions, section 8, revised for the bank route.')
pm = [('repeat', 'Collection never became real', 'Members drift back to cash and the ledger records promises.',
       'Share of instalments collected through Mashreq'),
      ('user-x', 'An organiser runs a fraud on Halqa’s credibility', 'A clean record shown as proof for a large '
                                                                          'scheme run outside the platform.',
       'Hosts with many circles at once; sudden growth'),
      ('smartphone', 'The wallets shipped it', 'Distribution beats product.', 'Committee features in wallet release '
                                                                              'notes: this has happened'),
      ('gavel', 'Rules written after someone else’s scandal', 'Rules aimed at custody operators catch Halqa too.',
       'Consultation papers; the partner bank’s view'),
      ('trending-down', 'Scale before the loss model was measured', 'Real losses land outside the modelled band.',
       'Measured default in the first 100 completed circles'),
      ('user', 'The founder runs out of time', 'Product, regulation, partners and research all run through one person.',
       'Decisions waiting; work paused')]
cw3 = (CW - 2 * 0.35) / 3
for i, (ic, t, mech, sig) in enumerate(pm):
    col_, row_ = i % 3, i // 3
    x = M + col_ * (cw3 + 0.35)
    y = Y0 + row_ * 2.5
    icon_disc(sl, ic, x, y, d=0.62, fill_=C('FBE9E6'), color=RED)
    tb(sl, x + 0.78, y, cw3 - 0.78, 0.7, t, size=12, bold=True, anchor=MIDDLE, spacing=1.03)
    tb(sl, x, y + 0.8, cw3, 0.8, mech, size=10, spacing=1.05)
    icon(sl, 'radar', x, y + 1.62, 0.24, AMBER)
    tb(sl, x + 0.34, y + 1.58, cw3 - 0.34, 0.7, [[('Watch  ', dict(size=9.5, bold=True, color=AMBER)),
                                                  (sig, dict(size=9.5))]], spacing=1.04)

# ---- approvals and pilot
sl = slide('Approvals and Pilot',
           'Five approvals, then one six month cycle with about 1,000 members on the Islamic window.', partner=True,
           src='Proposed plan. Months are counted from the meeting with Mashreq expected near 10 October 2026.')
icon_rows(sl, M, Y0, 5.6, [
    ('landmark', 'Mashreq’s board.', 'Approves the partnership as an outsourcing arrangement.'),
    ('moon', 'Shariah board.', 'Approves the product for the Islamic window.'),
    ('scale', 'State Bank.', 'Mashreq confirms whether approval or notice is needed, and any digital bank limits.'),
    ('handshake', 'Agreement.', 'Data, security, service levels, audit rights, complaints and exit.'),
    ('flag', 'Pilot limits.', 'Up to 100 monthly circles and about 1,000 members before any public launch.'),
], rh=0.72, size=10.5, isz=0.26, disc=True)
tb(sl, M, Y0 + 3.75, 5.6, 1.2, 'Measured in the pilot: accounts opened, balances, on time payments, arrears recovered, '
   'complaints and the cost of each member acquired.', size=10, color=GREY, spacing=1.06)
gx = 6.6
gl, mw = 2.0, 0.4
caption(sl, gx, Y0, W - M - gx, 'Timeline, months from the bank meeting')
for m in range(10):
    tb(sl, gx + gl + m * mw, Y0 + 0.35, mw, 0.22, str(m + 1), size=8.5, color=GREY, bold=True, align=CEN)
rows_ = [('Incorporation', 1, 1, L700), ('Agreement and approvals', 1, 2, L700), ('Integration and testing', 2, 3, LIME),
         ('Pilot cycle', 4, 9, LIME), ('Mid pilot review', 6, 6, AMBER), ('Decision to scale', 10, 10, L700),
         ('Unknown circles, asset circles', 10, 10, LIME_MID), ('Hyper, experimental', 10, 10, AMBER)]
for i, (lab, a_, b_, col) in enumerate(rows_):
    y = Y0 + 0.65 + i * 0.5
    tb(sl, gx, y, gl - 0.1, 0.4, lab, size=9.5, align=R, anchor=MIDDLE)
    rect(sl, gx + gl + (a_ - 1) * mw + 0.03, y + 0.07, (b_ - a_ + 1) * mw - 0.06, 0.26, col)
    if a_ == 10:
        line(sl, gx + gl + 9 * mw + 0.4, y + 0.2, gx + gl + 9 * mw + 0.75, y + 0.2, col, 1.25, arrow=True)
vrule(sl, gx + gl - 0.03, Y0 + 0.6, 4.1)

# ---- measures
sl = slide('Measures',
           'Five numbers show whether this is working. A committee arrives as a formed group of six to twenty people '
           'with a leader, so the measures follow the group.',
           src='Proposed measures for the pilot and the first year.')
nums = [('repeat', 'Share of instalments collected through Mashreq', 'the health of collection'),
        ('badge-check', 'Circles completed clean', 'a circle that never finishes proves nothing'),
        ('users', 'Circles per host', 'a host’s second circle brings the whole group back'),
        ('shield-alert', 'Default after collecting, first 100 circles', 'when the modelled loss becomes a measured one'),
        ('user-plus', 'Members who become hosts', 'the growth loop inside the product')]
for i, (ic, t, d) in enumerate(nums):
    y = Y0 + i * 0.98
    icon_disc(sl, ic, M, y + 0.1, d=0.66)
    tb(sl, M + 0.95, y, 6.8, 0.86, t, size=15, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, M + 7.9, y, W - M - 7.9 - M + 0.55, 0.86, d, size=11, anchor=MIDDLE, color=INK2)
    if i < 4:
        rule(sl, M + 0.95, y + 0.9, CW - 0.95)

# ---- decisions pending
sl = slide('Decisions Pending',
           'What is still to be decided, and who decides it.', partner=True,
           src='Bank Partnership Revisions (HQ-BK-01); Halqa\u2019s decisions of 28 September 2026; paused work list of '
               '28 September 2026.')
groups = [('Mashreq', MQ, 'landmark', ['Which cover: guarantee, insurance or takaful', 'Reporting through its TASDEEQ '
                                                                                      'membership or TASDEEQ direct',
                                         'Points as its stored value product', 'The income share and pilot limits']),
          ('Halqa', L700, 'user', ['Point value: 10 to a rupee of fee, or 1 to a rupee of reward',
                                          'Hyper fee: Rs 15 on both options, with a larger cover part',
                                          'Due date: the 8th for every circle, or set by payday',
                                          'A price ceiling on turn sales']),
          ('Counsel and Shariah board', AMBER, 'scale', ['Turn market and the P2P definition', 'Compulsory cover wording',
                                                         'Undertaking and guarantee wording', 'Shariah labels by '
                                                                                              'product']),
          ('State Bank, through Mashreq', GREY, 'building-2', ['Approval or notice for the product',
                                                                'Limits for a digital bank', 'Data location for a '
                                                                                             'service provider'])]
cw4 = (CW - 3 * 0.25) / 4
for i, (who, col, ic, items) in enumerate(groups):
    x = M + i * (cw4 + 0.25)
    icon_disc(sl, ic, x, Y0, d=0.55, fill_=WHITE, color=col, line_=col)
    tb(sl, x + 0.68, Y0, cw4 - 0.68, 0.55, who, size=12, bold=True, color=col if col != GREY else INK, anchor=MIDDLE)
    rule(sl, x, Y0 + 0.7, cw4, col, 1.0)
    bullets(sl, x, Y0 + 0.85, cw4, 3.9, items, size=10.5, gap=8, bcolor=col)

# ---- paused work
sl = slide('Paused Work',
           'Work stopped on 28 September when Halqa moved to the bank partnership. Each item is re-planned '
           'around Mashreq’s accounts before it restarts.',
           src='Paused work list, 28 September 2026. Price research of 28 September is saved with the generators.')
pw = [('chart-column', 'Business model rebuild', 'Explain every cost; counsel as the only fixed person; a software house '
                                                 'for one to two weeks; a monthly software cost table with a scale table'),
      ('megaphone', 'Marketing', 'Rewarded ads that earn points (non transferable, a fees-only balance); a three week '
                                 'Google Ads campaign; Pakistan is not on Google’s financial services verification '
                                 'list'),
      ('zap', 'Hyper fee', 'Rs 15 on both options with the cover part increased'),
      ('hand-coins', 'Pay on behalf', 'One member pays another’s instalment and is repaid next month; no points'),
      ('map', 'Route maps', 'All maps redrawn as connected routes, with a transaction route map in metro style'),
      ('calendar-clock', 'Payday window', 'Half-built changes to the collection and default documents, not synced')]
cw2 = (CW - 0.5) / 2
for i, (ic, t, d) in enumerate(pw):
    col_, row_ = divmod(i, 3)
    x = M + col_ * (cw2 + 0.5)
    y = Y0 + row_ * 1.55
    icon_disc(sl, ic, x, y + 0.05, d=0.62, fill_=PAPER, color=GREY)
    tb(sl, x + 0.8, y, cw2 - 0.8, 1.45, [(t, dict(size=12, bold=True, gap=3)), (d, dict(size=10, color=INK2))],
       spacing=1.06)

# ---- next steps
sl = slide('Next Steps', 'In order, from 28 September 2026.', partner=True,
           src='Current plan, 29 September 2026.')
ns = [('Now', 'presentation', 'This deck, filed in 01 Presentation; then into Google Slides by drag and drop into Drive'),
      ('Next', 'list-checks', 'The work register taken past 1,000 items for the bank route'),
      ('Near 10 Oct', 'handshake', 'Meeting with Mashreq'),
      ('After', 'building', 'Incorporation; counsel opinion'),
      ('Then', 'flag', 'Approvals, integration and the pilot of about 1,000 members')]
ty = Y0 + 1.1
rule(sl, M + 0.3, ty, CW - 0.6, L700, 1.5)
cw5 = (CW - 0.6) / 5
for i, (when, ic, what) in enumerate(ns):
    x = M + 0.3 + i * cw5
    icon_disc(sl, ic if ic != 'presentation' else 'file-text', x + cw5 / 2 - 0.38, ty - 0.38, d=0.76,
              fill_=LIME if i == 0 else LIME_LT)
    tb(sl, x, ty - 1.05, cw5, 0.3, when, size=12, bold=True, color=L700, align=CEN)
    tb(sl, x + 0.1, ty + 0.55, cw5 - 0.2, 1.6, what, size=10.5, align=CEN, spacing=1.08)
tb(sl, M, Y0 + 3.3, CW, 1.2, 'Halqa is the system. The bank is the machine.', size=26, color=L700, font=DISPLAY,
   align=CEN)
tb(sl, M, Y0 + 4.2, CW, 0.4, 'Taha Amjed, Chairman, Halqa   ' + DATE, size=11, color=GREY, align=CEN)

# =============================================================== APPENDIX ===
divider('A', 'Appendix', 'How the design reached the bank route, the features of the August design and what became '
        'of each, a glossary, the document set and the sources.')

# ---- design history
sl = slide('Design History',
           'The rulings that shaped the design, from a record-keeping application to a bank partnership.',
           src='Memory of decisions, July to September 2026. Superseded rulings are kept for the record.')
hist = [('Jul', 'A committee record, no licence', 'Record only; Halqa never holds money; the committee is the '
                                                  'collateral'),
        ('23 Jul', 'Cover and a vault', 'Cover defaults and insure them; savings through a fund held by CDC'),
        ('28 Jul', 'No bank partner', 'Second stage through CDC and a digital fund manager'),
        ('2 Aug', 'Growth and data', 'TASDEEQ two way, organiser rewards, no screen reading'),
        ('9 Aug', 'Discipline layer', 'No cancel button; 24 hour window; affordability; known circle tier'),
        ('23 Sep', 'Two Hyper options', 'Contribution and a flat fee in each payment'),
        ('25 Sep', 'Safepay and points', 'Split settlement; seats traded for points'),
        ('28 Sep', 'Bank partnership', 'Mashreq holds and moves the money; decisions D1 to D16')]
ty = Y0 + 2.3
rule(sl, M, ty, CW, L700, 1.5)
cw8 = CW / 8
for i, (d, t, desc) in enumerate(hist):
    x = M + i * cw8
    oval(sl, x + 0.02, ty - 0.1, 0.2, LIME if i == 7 else WHITE, line=L700)
    up = i % 2 == 0
    tb(sl, x, (ty - 1.95) if up else (ty + 0.3), cw8 - 0.1, 1.6,
       [(d + ' 2026', dict(size=10, bold=True, color=L700, gap=1)), (t, dict(size=10.5, bold=True, gap=2)),
        (desc, dict(size=9, color=INK2))], spacing=1.04, anchor=BOTTOM if up else TOP)
    line(sl, x + 0.12, ty - 0.1 if up else ty + 0.1, x + 0.12, (ty - 0.3) if up else (ty + 0.28), GREY_LT, 0.75)

# ---- august features
sl = slide('Features of the August Design',
           'Features built in August and what the bank route does with each. None is deleted for being non Shariah; '
           'each is retired, replaced or relabelled, and the code stays behind a switch until removed.',
           src='Licensing clause verification, 22 September 2026; decisions D1 to D16, 28 September 2026.')
feats = [('piggy-bank', 'Savings vault', 'Retired', 'Mashreq short term savings'),
         ('coins', 'Float on instalments', 'Replaced', 'Balance profit from Mashreq as points'),
         ('lock', 'Held security deposits', 'Retired', 'Bands and cover'),
         ('percent', 'Early fee paid to other members', 'Retired', 'Flat fee; no Halqa part in early seats (D6)'),
         ('arrow-left-right', 'Turn market with premium', 'Replaced', 'Member to member turn market (D9)'),
         ('gavel', 'Hyper bidding for days', 'Retired', 'Flat daily fee; days chosen, not bid'),
         ('award', 'Ordering by credit score', 'Retired', 'Bands limit seats only'),
         ('shield', 'Halqa cover facility', 'Replaced', 'Cover chosen by Mashreq'),
         ('bike', 'Asset trustee at CDC', 'Replaced', 'Mashreq financing; modaraba as the alternative'),
         ('gem', 'Crypto vault tier', 'Retired', 'Never inside committees')]
cw2 = (CW - 0.5) / 2
for i, (ic, t, status, now) in enumerate(feats):
    col_, row_ = divmod(i, 5)
    x = M + col_ * (cw2 + 0.5)
    y = Y0 + row_ * 0.98
    icon(sl, ic, x, y + 0.2, 0.34, GREY)
    tb(sl, x + 0.5, y, 2.5, 0.8, t, size=11, bold=True, anchor=MIDDLE)
    tb(sl, x + 3.0, y, 0.9, 0.8, status, size=9.5, bold=True, color=RED if status == 'Retired' else AMBER,
       anchor=MIDDLE)
    icon(sl, 'arrow-right', x + 3.9, y + 0.27, 0.22)
    tb(sl, x + 4.2, y, cw2 - 4.2, 0.8, now, size=10, color=L700, anchor=MIDDLE, spacing=1.04)
    if row_ < 4:
        rule(sl, x + 0.5, y + 0.9, cw2 - 0.5)

# ---- glossary
sl = slide('Glossary', 'Terms used in this deck.')
gl_ = [('Committee', 'A rotating savings group: equal instalments, one member collects the pot each round.'),
       ('Pot', 'All instalments of one round, paid to one member.'),
       ('Seat', 'The round in which a member collects.'),
       ('Band', 'The seats a member may claim, set by the score.'),
       ('Host', 'The member who forms and leads a circle.'),
       ('Hyper', 'A daily circle for members with daily income; experimental.'),
       ('Direct debit mandate', 'A member’s standing authority for the bank to debit each instalment.'),
       ('Digital retail bank', 'A bank licensed by the State Bank to serve customers only through digital channels.'),
       ('EMI', 'Electronic money institution: a licensed issuer of stored value.'),
       ('PSP', 'Payment service provider, such as Safepay; may not hold customers’ money.'),
       ('Raast', 'The State Bank’s instant payment system.'),
       ('1LINK', 'The interbank switch; carries 1BILL bill payments.'),
       ('TASDEEQ', 'A private credit bureau licensed under the Credit Bureaus Act 2015.'),
       ('Takaful', 'Islamic insurance: members contribute to a fund that pays claims.'),
       ('Modaraba', 'An SECP registered Islamic financing company.'),
       ('Ijarah', 'An Islamic lease; here, a lease ending in ownership.'),
       ('Non resident Pakistani account', 'A Pakistani bank account for a Pakistani living abroad.'),
       ('Outsourcing framework', 'State Bank rules for services a bank buys from third parties.')]
half = 9
cw2 = (CW - 0.5) / 2
for i, (t, d) in enumerate(gl_):
    col_, row_ = divmod(i, half)
    x = M + col_ * (cw2 + 0.5)
    y = Y0 - 0.3 + row_ * 0.55
    tb(sl, x, y, 2.2, 0.52, t, size=10.5, bold=True, color=L700, anchor=MIDDLE)
    tb(sl, x + 2.3, y, cw2 - 2.3, 0.52, d, size=10, anchor=MIDDLE, spacing=1.03)
    rule(sl, x, y + 0.53, cw2)

# ---- documents
sl = slide('Document Set', 'Where every current document lives: Desktop, ALL HALQA, HALQA CORPORATE.',
           src='Document set of 25 September 2026, with the bank partnership folder added on 28 September 2026.')
docs = [('01', 'Presentation', 'This deck; the 43 slide edition of 28 September kept alongside'),
        ('02', 'Company partnership documents', 'Asset Committees HQ-CP-01; Auto Debit HQ-CP-02; Business Model HQ-CP-03; '
                                                'Seat Exchange and Points HQ-CP-04; Default Prevention HQ-CP-05; Feature '
                                                'List HQ-CP-07; Hyper HQ-CP-08; Collection Specification HQ-CP-09'),
        ('03', 'Legal', 'Legal Position HQ-LG-01; Web Sources Read HQ-LG-02; primary texts'),
        ('04', 'Licence documents', 'Registrations and Licences Required HQ-LD-01; Incorporation Checklist HQ-LD-02'),
        ('05', 'Maths', 'Formal HQ-MF-01 to 06 and informal HQ-MI-01 to 06: Hyper threshold, affordability, income '
                        'account, identity, takaful pricing, credit scoring'),
        ('06', 'Maps', 'System to Technical, eight maps; to be redrawn (paused)'),
        ('07', 'Internal', 'Work Register HQ-IN-02; drafts not sent'),
        ('08', 'Bank partnership', 'Oraan Research HQ-RS-01; Bank Partnership Revisions HQ-BK-01; Partner Bank '
                                   'Proposition HQ-BK-02; Halqa and Mashreq Bank Pakistan deck; sources')]
for i, (n_, t, d) in enumerate(docs):
    y = Y0 + i * 0.6
    icon(sl, 'folder', M, y + 0.14, 0.3)
    tb(sl, M + 0.45, y, 0.5, 0.58, n_, size=12, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, M + 1.0, y, 3.0, 0.58, t, size=11, bold=True, anchor=MIDDLE)
    tb(sl, M + 4.0, y, CW - 4.0, 0.58, d, size=9.5, anchor=MIDDLE, spacing=1.03)
    rule(sl, M + 0.45, y + 0.59, CW - 0.45)

# ---- sources
sl = slide('Sources', 'The principal sources behind the figures in this deck.')
srcs = [('Mashreq', 'Mashreq Bank Pakistan Limited, condensed interim financial statements and Directors’ Review, half '
                    'year ended 30 June 2026; Mashreq press releases of January, February and 24 November 2025; Business '
                    'Recorder, 16 September 2025.'),
        ('Law', 'Companies Act 2017; Payment Systems and Electronic Fund Transfers Act 2007; PSO/PSP Rules 2014; EMI '
                'Regulations 2023; Credit Bureaus Act 2015; Electronic Transactions Ordinance 2002; Contract Act 1872; '
                'Insurance Ordinance 2000; Corporate Insurance Agents Regulations 2020; Virtual Assets Act 2026; SECP '
                'P2P definition (S.R.O. 436(I)/2022); State Bank outsourcing framework; BPRD Circular Letter 29 of 2021.'),
        ('Market', 'Financial Inclusion Insights surveys; Global Findex via Kamran (2017); National Financial Inclusion '
                   'Strategy 2024 to 2028 (Profit, 13 January 2025); World Bank.'),
        ('Research', 'Khan (2013); Kamran (2017, 2018); Mehmood et al. (2018), Save My Money; Committee Dossier, 6 August '
                     '2026.'),
        ('Competitors', 'Oraan’s terms and fee calculator; SECP and Singapore registers; tasdeeq.com/members, 28 '
                        'September 2026; ImpactAlpha, 1 October 2021; JazzCash release notes, 23 August 2026.'),
        ('Prices', 'Safepay published prices, 25 September 2026; TechX Pakistan on WhatsApp prices, 16 September 2026; '
                   'Bank Alfalah Raast FAQ; VIS Credit Rating Company, microfinance update, 2026.'),
        ('Halqa', 'Business Model HQ-CP-03; maths models HQ-MF-01 to 06; Hyper HQ-CP-08; Default Prevention HQ-CP-05; '
                  'decisions D1 to D16 of 28 September 2026; the application in preview mode, 29 September 2026.')]
for i, (t, d) in enumerate(srcs):
    y = Y0 - 0.2 + i * 0.72
    tb(sl, M, y, 1.5, 0.7, t, size=11, bold=True, color=L700)
    tb(sl, M + 1.6, y, CW - 1.6, 0.7, d, size=9.5, spacing=1.06)
    rule(sl, M + 1.6, y + 0.68, CW - 1.6)
