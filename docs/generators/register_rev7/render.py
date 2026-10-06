# -*- coding: utf-8 -*-
"""Render the work register: Markdown for the next revision to read, and HTML printed to PDF by Chrome in the house
style (black and white, logo top right, one reference line, ruled tables, footer with the title and page count)."""
import html as H
import os
import subprocess
from collections import Counter

import phases as PH

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
LOGO = 'file:///' + os.path.join(HERE, 'logo-lockup.png').replace('\\', '/')
DATE = '5 October 2026'
REF = 'HQ-IN-02'
TITLE = 'Work Register to Operational at 100,000 Users'
SUBTITLE = ('Every item of work between the application today and a service run with a partner bank that can carry '
            '100,000 members, with its owner, priority, phase and status.')

CSS = r"""
@page{size:A4 landscape;margin:10mm 13mm 13mm 13mm;
  @bottom-left{content:"Halqa, Work Register";font:7.5pt Calibri,Arial,sans-serif;color:#000;vertical-align:top;padding-top:3mm}
  @bottom-right{content:"Page " counter(page) " of " counter(pages);font:7.5pt Calibri,Arial,sans-serif;color:#000;vertical-align:top;padding-top:3mm}}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font:9pt/1.35 Calibri,Arial,sans-serif;color:#000;margin:0;background:#fff}
table.frame{width:100%;border-collapse:collapse;margin:0}
table.frame>thead>tr>td,table.frame>tbody>tr>td{padding:0;border:0}
.run{height:8mm;text-align:right;margin-bottom:2mm}
.run img{height:7mm}
h1{font-size:15pt;line-height:1.2;font-weight:700;margin:0 0 1mm}
.sub{font-size:9.5pt;margin:0 0 1mm}
.meta{font-size:8.5pt;margin:0 0 2mm}
hr.rule{border:0;border-top:0.6pt solid #000;margin:0 0 3mm}
h2{font-size:11pt;font-weight:700;margin:4.5mm 0 1.5mm;break-after:avoid;page-break-after:avoid}
h3{font-size:9.5pt;font-weight:700;margin:3mm 0 1mm;break-after:avoid;page-break-after:avoid}
p{margin:0 0 1.6mm}
table.t{border-collapse:collapse;width:100%;margin:1mm 0 2.6mm;table-layout:fixed}
table.t tr{break-inside:avoid;page-break-inside:avoid}
table.t th{font-weight:700;font-size:8pt;text-align:left;padding:0.7mm 1.3mm;border:0.5pt solid #000;background:#fff}
table.t td{font-size:8pt;padding:0.7mm 1.3mm;border:0.5pt solid #000;vertical-align:top;overflow-wrap:anywhere}
table.t td.n,table.t th.n{text-align:right;white-space:nowrap}
.pb{break-before:page;page-break-before:always}
.summary{margin-top:4mm;break-inside:avoid;page-break-inside:avoid}
.keep{break-inside:avoid;page-break-inside:avoid}
p.pre{break-after:avoid;page-break-after:avoid}
"""

OWNER_ORDER = ('Claude', 'Chairman', 'Bank', 'Counsel', 'Partner', 'Translator', 'Tester', 'Auditor', 'Tax adviser')

PASSES = [
    (1, 'What has changed since 28 September?', 'The chairman\'s decisions of 29 September to 5 October, the master '
                                                'context, the code as read on 5 October', 'Rewrites in place, AA'),
    (2, 'What does the State Bank require of a bank\'s service provider and of a bank\'s digital channels?',
     'State Bank circulars on outsourcing, cloud, technology governance, onboarding, digital channels, fraud, '
     'complaints, conduct, key facts, payments and cyber security', 'AB'),
    (3, 'What does every screen need in each of its states?', 'The 30 pages of the web application, the screens '
                                                              'still missing, Easypaisa, JazzCash, SadaPay, NayaPay, '
                                                              'Raqami, Mashreq NEO, Money Fellows and Hakbah', 'AC'),
    (4, 'What rule, message and language does every field need?', 'The forms of the web application and the '
                                                                  'onboarding framework', 'AD'),
    (5, 'What does every endpoint and every record need?', 'The 123 endpoints in seventeen route files and the 39 '
                                                           'database models, read on 5 October', 'AE, AF'),
    (6, 'What does every connection to a partner need?', 'The operations of the bank, the PSP, NADRA through the '
                                                         'bank, TASDEEQ and the message providers', 'AG'),
    (7, 'What must every member be told, and when?', 'The alert rules for digital channels, the complaint rules and '
                                                     'WhatsApp pricing', 'AH'),
    (8, 'What proves each rule?', 'The engines of the interface service and the journeys a member takes', 'AI'),
    (9, 'What will a bank\'s security review and the application stores ask to see?',
     'OWASP MASVS 2.1, ISO/IEC 27001:2022 Annex A, the card industry rules and WCAG 2.2', 'AJ, AK'),
    (10, 'What does a regulated company run on, and what do other finance applications do?',
     'Bank practice in governance, risk and continuity; service levels and runbooks as large technology companies '
     'keep them; the two banks; features of eleven applications', 'AL to AP'),
]

SOURCES = [
    ('State Bank of Pakistan, Framework for Risk Management in Outsourcing Arrangements by Financial Institutions, '
     'BPRD Circular No. 06 of 2017, revised by BPRD Circular No. 06 of 2019', 'AB1',
     'https://www.sbp.org.pk/bprd/2017/C6.htm, https://www.sbp.org.pk/bprd/2019/C6.htm'),
    ('State Bank of Pakistan, Framework on Outsourcing to Cloud Service Providers, BPRD Circular No. 01 of 2023',
     'AB2 and the hosting question in AA2', 'https://www.sbp.org.pk/bprd/2023/C1-Annix-A.pdf'),
    ('State Bank of Pakistan, Enterprise Technology Governance and Risk Management Framework, BPRD Circular No. 05 of '
     '2017', 'AB3', 'https://www.sbp.org.pk/bprd/2017/C5.htm'),
    ('State Bank of Pakistan, Consolidated Customer Onboarding Framework, BPRD Circular No. 01 of 2025', 'AB4',
     'https://www.sbp.org.pk/bprd/2025/C1-Consolidated-Customer-Onboarding-Framework.pdf'),
    ('State Bank of Pakistan, PSP&OD Circular No. 01 of 2024 on the security of digital channels', 'AB5, AH2',
     'https://www.sbp.org.pk/psd/2024/C1.htm'),
    ('State Bank of Pakistan, BPRD Circular No. 04 of 2023 on digital fraud', 'AB6',
     'https://www.sbp.org.pk/bprd/2023/C4.htm'),
    ('State Bank of Pakistan, BC&CPD Circular Letter No. 02 of 2021 on complaint handling', 'AB7, AH9',
     'https://www.sbp.org.pk/cpd/2021/CL2.htm'),
    ('State Bank of Pakistan, BC&CPD Circular No. 02 of 2016 and Circular No. 02 of 2020 on key fact statements',
     'AB9', 'https://www.sbp.org.pk/cpd/2016/C2.htm, https://www.sbp.org.pk/cpd/2020/C2.htm'),
    ('State Bank of Pakistan, Licensing and Regulatory Framework for Digital Banks, BPRD Circular No. 01 of 2022',
     'AO2', 'https://www.sbp.org.pk/bprd/2022/C1.htm'),
    ('State Bank of Pakistan, PSP&OD Circular No. 04 of 2023 and the Raast person to merchant service', 'AB11',
     'https://www.sbp.org.pk/psd/2023/C4.htm'),
    ('State Bank of Pakistan, BSD-1 Circular No. 01 of 2024 and CRMD Circular Letter No. 01 of 2026', 'AB13',
     'https://www.sbp.org.pk/bsd-1/2024/C1.htm, https://www.sbp.org.pk/CRMD/2026/CL01.htm'),
    ('State Bank of Pakistan, AML, CFT and CPF Regulations under section 6A(2) of the Anti Money Laundering Act 2010',
     'AB10', ''),
    ('OWASP Mobile Application Security Verification Standard, version 2.1', 'AJ1', 'https://mas.owasp.org/MASVS/'),
    ('ISO/IEC 27001:2022, Annex A', 'AJ3', ''),
    ('W3C, Web Content Accessibility Guidelines 2.2', 'AK1', 'https://www.w3.org/TR/WCAG22/'),
    ('Google Play policy on personal loan applications in Pakistan, reported July 2023', 'AB16',
     'https://propakistani.pk/2023/07/18/google-introduces-strict-policy-against-loans-apps-in-pakistan/amp/'),
    ('Meta, WhatsApp Business Platform pricing', 'AA2, item 847',
     'https://developers.facebook.com/documentation/business-messaging/whatsapp/pricing'),
    ('Raqami Islamic Digital Bank: products, questions and profit rates', 'AO2',
     'https://raqamidigital.com/products/, https://raqamidigital.com/faqs/, https://raqamidigital.com/profit-rates/'),
    ('Mashreq Bank Pakistan: NEO, its schedule of charges and the account for non resident Pakistanis', 'AO1',
     'https://www.mashreq.com/en/pk/neo/, https://www.mashreq.com/en/uae/neo/accounts/non-resident-pakistan-account'),
    ('Money Fellows', 'AP1', 'https://moneyfellows.com/en-us/how-it-works/'),
    ('Hakbah', 'AP1', 'https://hakbah.sa/faq/?lang=en'),
    ('Esusu', 'AP1', 'https://www.esusurent.com/about'),
    ('JazzCash schedule of charges', 'AP1', 'https://www.jazzcash.com.pk/schedule-of-charges-soc/'),
    ('NayaPay schedule of charges', 'AP1', 'https://www.nayapay.com/soc'),
    ('SadaPay, as described by Profit', 'AP1', 'https://profit.pakistantoday.com.pk/2023/07/02/fast-dependable-and-'
                                               'easy-to-use-can-sadapay-revolutionize-the-fintech-landscape-in-'
                                               'pakistan/'),
    ('Easypaisa, store listing', 'AP1', 'https://apps.apple.com/pk/app/easypaisa-a-digital-bank/id1227725092'),
    ('Halqa code as read on 5 October 2026: route files, schema and screens of halqa-api and halqa-web', 'AC, AE, AF',
     ''),
]


def esc(s):
    return H.escape(str(s), quote=False)


def table(rows, widths, numeric=()):
    out = ['<table class="t"><colgroup>', ''.join('<col style="width:%s">' % w for w in widths), '</colgroup>']
    for i, r in enumerate(rows):
        tag = 'th' if i == 0 else 'td'
        cells = ''.join('<%s%s>%s</%s>' % (tag, ' class="n"' if j in numeric else '', c, tag) for j, c in enumerate(r))
        if i == 0:
            out.append('<thead><tr>%s</tr></thead><tbody>' % cells)
        else:
            out.append('<tr>%s</tr>' % cells)
    out.append('</tbody></table>')
    return ''.join(out)


def fmt(n):
    return '{:,}'.format(n)


def stats(items):
    st = Counter(it['status'] for it in items)
    return st['Done'], st['Partly done'], st['Open']


def front(secs, items, ph, ms):
    total = len(items)
    done, part, opn = stats(items)
    claude_open = [it for it in items if it['owner'] == 'Claude' and it['status'] != 'Done']
    others_open = [it for it in items if it['owner'] != 'Claude' and it['status'] != 'Done']
    rewritten = sum(1 for it in items if it['rewritten'])
    out = ['<h2>Scope</h2>']
    out.append('<p>%s items: %s done, %s partly done and %s open. The 1,039 items of 28 September keep their numbers; '
               '%d of them were rewritten in place where a decision of 29 September to 5 October overturned or closed '
               'them. Sections AA to AP, items 1,040 to %s, come from ten passes over the plan, set out under Method.</p>'
               % (fmt(total), fmt(done), fmt(part), fmt(opn), rewritten, fmt(total)))
    out.append('<p>Statuses were read from the code as it stood on 5 October 2026: 123 endpoints in seventeen route '
               'files, of which 116 require sign in, 67 check their input against a schema, 56 write the audit log, 29 '
               'use a database transaction and 12 accept an idempotency key, with 19 lists still unbounded; 39 database '
               'models; and the 30 pages of the web application. A status of Done means the code already does it.</p>')
    out.append('<p>Each item has one owner. Claude holds the work in code, content and documents that can be done in a '
               'session. The chairman holds decisions and commercial steps. The bank, counsel, the partners, the '
               'translator, the tester, the auditor and the tax adviser hold their own items. Priority P0 is legal '
               'exposure or a blocker of the meeting with the bank, P1 is needed for the first members, P2 for public '
               'launch and P3 for scale.</p>')
    out.append('<p>Claude\'s %s open items fall into %d phases. A phase holds at most 100 items and at most 100 effort '
               'points, a small item counting 1, a medium item 3 and a large item 8, so that one phase fits one Claude '
               'Pro usage window. The Phase column gives the phase of each of Claude\'s items and the milestone, H1 to '
               'H6, of everyone else\'s; %s items are held by people other than Claude.</p>'
               % (fmt(len(claude_open)), len(ph), fmt(len(others_open))))
    by_owner = Counter(it['owner'] for it in items)
    open_owner = Counter(it['owner'] for it in items if it['status'] != 'Done')
    rows = [['Owner', 'Items', 'Not done']] + [[o, fmt(by_owner[o]), fmt(open_owner[o])] for o in OWNER_ORDER]
    out.append(table(rows, ['40%', '30%', '30%'], numeric=(1, 2)))

    out.append('<h2>Decisions</h2>')
    out.append('<p>The decisions taken since 28 September, as recorded in section AA.</p>')
    aa = [it for it in items if it['sub'] == 'AA1']
    rows = [['#', 'Decision', 'Status']] + [[str(it['n']), esc(it['text']), it['status']] for it in aa]
    out.append(table(rows, ['6%', '80%', '14%'], numeric=(0,)))

    out.append('<h2>Method</h2>')
    out.append('<p>The register was built in ten passes. Each pass asked one question of the whole plan, read the '
               'sources named below, and added the items the answer required. Items already present were not added '
               'again; where a new section breaks an older item into parts, its preamble names the older item.</p>')
    loop_items = Counter()
    for s in secs:
        n = sum(len(u['items']) for u in s['subs'])
        if s.get('loop'):
            loop_items[s['loop']] += n
    rows = [['Pass', 'Question', 'Sources', 'Sections', 'Items']]
    for k, q, src, sec in PASSES:
        cnt = loop_items[k] + (rewritten if k == 1 else 0)
        rows.append([str(k), esc(q), esc(src), esc(sec), fmt(cnt)])
    out.append(table(rows, ['5%', '33%', '42%', '10%', '10%'], numeric=(0, 4)))

    out.append('<h2 class="pb">Phases</h2>')
    out.append('<p>Phases run in order. A phase with a gate starts only when that milestone is reached: H2 when the '
               'bank opens its interface documents and test environment, H3 when the PSP, TASDEEQ and the message '
               'providers do. Until then the next phase without a gate is taken. Phase 1 starts with the corrections '
               'and the application. Checks name how the end of a phase is shown: %s. Every phase also ends with the '
               'statuses in this register, the master context and the memory brought up to date.</p>'
               % '; '.join('%s, %s' % (k, v) for k, v in PH.CHECKS.items()))
    rows = [['Phase', 'Title', 'Gate', 'Items', 'Points', 'P0', 'P1', 'P2', 'P3', 'Sub-sections', 'Checks']]
    last_block = None
    for p in ph:
        title = esc(p['title'])
        if p['block'] != last_block:
            rows.append(['', esc(p['block']), '', '', '', '', '', '', '', '', ''])
            last_block = p['block']
        rows.append([str(p['n']), title, p['gate'] or '', str(len(p['items'])), str(p['points']),
                     str(p['pris']['P0'] or ''), str(p['pris']['P1'] or ''), str(p['pris']['P2'] or ''),
                     str(p['pris']['P3'] or ''), esc(p['scope']), ', '.join(p['checks'])])
    out.append(table(rows, ['4.5%', '24%', '4%', '4.5%', '4.5%', '3.5%', '3.5%', '3.5%', '3.5%', '30%', '14.5%'],
                     numeric=(0, 3, 4, 5, 6, 7, 8)))

    out.append('<div class="keep"><h2>Milestones</h2>')
    out.append('<p>Items held by people other than Claude, by the milestone they belong to. The P0 column lists the '
               'item numbers that are legal exposure or block the meeting with the bank.</p>')
    rows = [['Milestone', 'Scope', 'Items', 'Not done', 'Owners', 'P0 not done']]
    for m, (name, scope) in PH.MILESTONES.items():
        its = ms[m]
        nd = [it for it in its if it['status'] != 'Done']
        owners = Counter(it['owner'] for it in nd)
        p0 = [str(it['n']) for it in nd if it['pri'] == 'P0']
        rows.append(['%s, %s' % (m, esc(name)), esc(scope), fmt(len(its)), fmt(len(nd)),
                     ', '.join('%s %d' % (o, owners[o]) for o in OWNER_ORDER if owners[o]),
                     ', '.join(p0) if p0 else ''])
    out.append(table(rows, ['13%', '33%', '6%', '6%', '20%', '22%'], numeric=(2, 3)) + '</div>')

    out.append('<div class="keep"><h2>Sources</h2>')
    rows = [['Source', 'Used in', 'Link']] + [[esc(a), esc(b), esc(c)] for a, b, c in SOURCES]
    out.append(table(rows, ['46%', '12%', '42%']) + '</div>')

    out.append('<h2>Status by Section</h2>')
    rows = [['Section', 'Items', 'Done', 'Partly done', 'Open', 'Claude', 'Others']]
    for s in secs:
        its = [it for u in s['subs'] for it in u['items']]
        d, p, o = stats(its)
        c = sum(1 for it in its if it['owner'] == 'Claude')
        rows.append(['%s. %s' % (s['code'], esc(s['title'])), fmt(len(its)), fmt(d), fmt(p), fmt(o), fmt(c),
                     fmt(len(its) - c)])
    rows.append(['Total', fmt(total), fmt(done), fmt(part), fmt(opn),
                 fmt(sum(1 for it in items if it['owner'] == 'Claude')),
                 fmt(sum(1 for it in items if it['owner'] != 'Claude'))])
    out.append(table(rows, ['46%', '9%', '9%', '9%', '9%', '9%', '9%'], numeric=(1, 2, 3, 4, 5, 6)))
    return ''.join(out)


COLS = ['4.5%', '51%', '16.5%', '8.5%', '4%', '5.5%', '10%']


def item_table(items):
    out = ['<table class="t"><colgroup>', ''.join('<col style="width:%s">' % w for w in COLS), '</colgroup>',
           '<thead><tr><th class="n">#</th><th>Item</th><th>Where</th><th>Owner</th><th>Pri</th><th>Phase</th>'
           '<th>Status</th></tr></thead><tbody>']
    for it in items:
        out.append('<tr><td class="n">%d</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>'
                   % (it['n'], esc(it['text']), esc(it['where']), it['owner'], it['pri'], it['phase'], it['status']))
    out.append('</tbody></table>')
    return ''.join(out)


def body(secs):
    out = []
    first = True
    for s in secs:
        out.append('<h2%s>%s. %s</h2>' % (' class="pb"' if first else '', s['code'], esc(s['title'])))
        first = False
        if s['preamble']:
            out.append('<p class="pre">%s</p>' % esc(s['preamble']))
        for u in s['subs']:
            if u['code']:
                out.append('<h3>%s. %s</h3>' % (u['code'], esc(u['title'])))
                if u['preamble']:
                    out.append('<p class="pre">%s</p>' % esc(u['preamble']))
            out.append(item_table(u['items']))
    return ''.join(out)


def summary(items, ph, ms):
    total = len(items)
    done, part, opn = stats(items)
    claude_open = sum(1 for it in items if it['owner'] == 'Claude' and it['status'] != 'Done')
    p0_open = sum(1 for it in items if it['pri'] == 'P0' and it['status'] != 'Done')
    gated = sum(1 for p in ph if p['gate'])
    return ('<div class="summary"><h2>Summary</h2><p>This register holds %s items of work between the application '
            'today and a service run with a partner bank for 100,000 members: %s done, %s partly done and %s open, of '
            'which %s are P0. Claude holds %s open items in %d phases of at most 100 items each, %d of them gated on '
            'the bank or the partners; phase 1 starts with the corrections and the application. The rest is held by '
            'the chairman, the bank, counsel, the partners, the translator, the tester, the auditor and the tax '
            'adviser across six milestones, beginning with the company and counsel (H1) and the agreement with the '
            'bank (H2). The meeting with Mashreq Bank Pakistan has no date yet; Raqami Islamic Digital Bank is '
            'pursued in parallel.</p></div>'
            % (fmt(total), fmt(done), fmt(part), fmt(opn), fmt(p0_open), fmt(claude_open), len(ph), gated))


def html(secs, items, ph, ms):
    content = ('<h1>%s</h1><p class="sub">%s</p><p class="meta">Reference %s. %s.</p><hr class="rule">'
               % (esc(TITLE), esc(SUBTITLE), REF, DATE)) + front(secs, items, ph, ms) + body(secs) + \
        summary(items, ph, ms)
    return ('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>%s</title><style>%s</style></head><body>'
            '<table class="frame"><thead><tr><td><div class="run"><img src="%s" alt="Halqa"></div></td></tr></thead>'
            '<tbody><tr><td>%s</td></tr></tbody></table></body></html>' % (esc(TITLE), CSS, LOGO, content))


def markdown(secs, items, ph, ms):
    total = len(items)
    done, part, opn = stats(items)
    md = ['# %s' % TITLE, '', 'Reference %s. %s.' % (REF, DATE), '',
          '%s items: %s done, %s partly done, %s open. %d phases.' % (fmt(total), fmt(done), fmt(part), fmt(opn),
                                                                      len(ph)), '']
    md += ['## Phases', '', '| Phase | Title | Gate | Items | Points | Sub-sections | Checks |',
           '| --: | :-- | :-- | --: | --: | :-- | :-- |']
    for p in ph:
        md.append('| %d | %s | %s | %d | %d | %s | %s |' % (p['n'], p['title'], p['gate'] or '', len(p['items']),
                                                           p['points'], p['scope'], ', '.join(p['checks'])))
    md.append('')
    for s in secs:
        md += ['## %s. %s' % (s['code'], s['title']), '']
        if s['preamble']:
            md += [s['preamble'], '']
        for u in s['subs']:
            if u['code']:
                md += ['### %s. %s' % (u['code'], u['title']), '']
                if u['preamble']:
                    md += [u['preamble'], '']
            md += ['| # | Item | Where | Owner | Pri | Phase | Status |', '| --: | :-- | :-- | :-- | :-- | :-- | :-- |']
            for it in u['items']:
                md.append('| %d | %s | %s | %s | %s | %s | %s |' % (it['n'], it['text'].replace('|', '/'),
                                                                     it['where'].replace('|', '/'), it['owner'],
                                                                     it['pri'], it['phase'], it['status']))
            md.append('')
    return '\n'.join(md)


def pdf(html_path, pdf_path):
    if os.path.exists(pdf_path):
        os.remove(pdf_path)
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--disable-pdf-tagging',
                    '--allow-file-access-from-files', '--virtual-time-budget=30000', '--print-to-pdf=' + pdf_path,
                    'file:///' + html_path.replace('\\', '/')], capture_output=True, timeout=1800)
