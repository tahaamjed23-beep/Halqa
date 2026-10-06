# -*- coding: utf-8 -*-
"""Work register, revision 4 (24 September 2026, afternoon).

Applies status changes and corrections to the revision 3 sources in place, adds
the items found on 24 September, then writes WORK-REGISTER-rev4.md and a clean
HTML file for upload. Every change must match exactly one item.
"""
import io, sys, html as H
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import reg_a, reg_b, reg_c
sys.path.insert(0, 'docs')
import gclean, finalize as F

S = reg_c.S
SECTIONS = [reg_a.A, reg_a.B, reg_c.C, reg_a.D] + reg_b.SECTIONS_2
STATUS_BY_SECTION = {'A': reg_c.STATUS_A, 'B': reg_c.STATUS_B}


def find(prefix):
    hits = []
    for sec in SECTIONS:
        for i, it in enumerate(sec[3]):
            if it[0] != S and it[0].startswith(prefix):
                hits.append((sec, i))
    if len(hits) != 1:
        raise SystemExit('expected one item for %r, found %d' % (prefix, len(hits)))
    return hits[0]


def set_status(prefix, status):
    sec, i = find(prefix)
    it = sec[3][i]
    sec[3][i] = (it[0], it[1], status)


def rewrite(prefix, text, loc=None, status=None):
    sec, i = find(prefix)
    it = sec[3][i]
    new = [text, loc if loc is not None else it[1]]
    if status or len(it) > 2:
        new.append(status or it[2])
    sec[3][i] = tuple(new)


def insert_after(prefix, items):
    sec, i = find(prefix)
    for k, it in enumerate(items):
        sec[3].insert(i + 1 + k, it)


# ---------------------------------------------------------------- statuses --
set_status('No rounded pill or badge shapes', 'Done')
set_status('HYPER shows "30 days', 'Done')
set_status('HYPER entry checks ask for', 'Done')
set_status('HYPER: rebuild as the two configuration cards', 'Partly done')
for p in ('Support crashes on open', 'Statement crashes on open', 'Limits crashes on open',
          'Devices crashes on open', 'Preview mode has no data for these four endpoints'):
    set_status(p, 'Done')

# --------------------------------------------------------- new done items --
insert_after('Preview mode has no data for these four endpoints', [
    ('Every bottom sheet closed the instant it opened: the back-button handler re-armed on each render and '
     'fired its own history entry. Rewritten so a sheet closes only on a real back gesture', 'lib/back.ts', 'Done'),
    ('The tab bar stood seven pixels clear of the bottom edge because two stylesheets set different heights. '
     'One height token now governs both', 'tokens.css, index.css', 'Done'),
    ('Rupee amounts broke across lines and read as "Rs215,000" where a narrow space was dropped. A normal '
     'non-breaking space is used', 'lib/format.ts', 'Done'),
])

# ----------------------------------------------------- rail corrections ----
rewrite('Implement tier one: a Raast request to pay',
        'Implement tier one: payment initiation through the electronic money institution partner\'s interface, on '
        'one approval by the member, debiting the member and crediting the collecting member directly')
rewrite('Implement tier two: collection against a token mandate held by the aggregator',
        'Implement tier two: collection against a token mandate held by the partner, used on Hyper')
rewrite('Implement tier three: manual recording against a reference',
        'Implement tier three: the member sends over Raast to the collecting member\'s Raast ID shown in the '
        'application, matched by its reference. Cash and bank transfers stay recorded against a reference and '
        'confirmed by the host', 'new send screen, routes/payments.ts')
insert_after('Implement tier three', [
    ('Collect Halqa\'s own fee separately, by Raast Request to Pay through a payment aggregator, and never a '
     'contribution, since a Request to Pay settles to the merchant that sends it', 'new lib/fee-collection.ts'),
    ('Assign each day\'s Hyper payers to that day\'s collectors, so every payer pays one collector directly and '
     'no pool exists', 'new lib/hyper-assign.ts'),
])
rewrite('Reconciliation against the aggregator settlement report',
        'Reconciliation against the partner\'s settlement report, on a schedule')
rewrite('Merchant services agreement executed with a licensed aggregator',
        'Services agreement executed with a licensed electronic money institution, NayaPay or SadaPay, after '
        'its 30 day notice to the State Bank under para 7.I(h)')
insert_after('Services agreement executed with a licensed electronic money institution', [
    ('Merchant agreement with a payment aggregator, PayFast or Safepay, for Halqa\'s own fee only', 'commercial'),
])
rewrite('Confirm rail tokens are held by the aggregator',
        'Confirm rail tokens are held by the partner and never stored by Halqa')
rewrite('Integration test the whole collection path against the aggregator sandbox',
        'Integration test the whole collection path against the partner\'s sandbox')
rewrite('Write the runbook for an aggregator outage', 'Write the runbook for a partner outage')

# ------------------------------------------------ findings of 24 September --
rewrite('Correct the permissions policy header',
        'Correct the permissions policy header, which sets camera and geolocation to none and so breaks CNIC '
        'capture and the home location pin in production (confirmed against the live headers on 24 September)')
insert_after('Remove prizeDrawEnabled from the schema', [
    ('Remove RANDOM_BALLOT and CREDIT_WEIGHTED from the circle creation route, whose default is still credit '
     'weighted ordering; the order is set by selection or by the host', 'routes/committees.ts:197'),
    ('Repurpose the time value engine to size the points and waivers owed to later seats. It still computes an '
     'early fee charged to early seats and credited to later ones', 'lib/time-value.ts'),
])

# --------------------------------------------------------------- render ----
def items_of(sec):
    return [x for x in sec[3] if x[0] != S]


def status_of(letter, pos, item):
    if len(item) > 2:
        return item[2]
    return STATUS_BY_SECTION.get(letter, {}).get(pos, 'Open')


# Status of A and B is held by position; the insertions above are all in C and later,
# so positions in A and B are unchanged.
counts = {}
for sec in SECTIONS:
    c = {'Done': 0, 'Partly done': 0, 'Open': 0}
    for pos, it in enumerate(items_of(sec), 1):
        c[status_of(sec[0], pos, it)] += 1
    counts[sec[0]] = c
total = sum(len(items_of(s)) for s in SECTIONS)
done = sum(c['Done'] for c in counts.values())
part = sum(c['Partly done'] for c in counts.values())
openn = total - done - part
ui = sum(len(items_of(s)) for s in SECTIONS[:4])

LEAD = ('24 September 2026, revision 4. %d items: %d done, %d partly done, %d open. Revision 4 records the work '
        'finished on 24 September, corrects the collection items to the electronic money institution partner '
        'set out in the Statutory Position of the same date, and adds the items found that day.'
        % (total, done, part, openn))
SCOPE = [
    'Revision 3 rewrote section C after an audit of every screen in the running application on 24 September '
    '2026. That audit found four screens that crashed on open, nine screens that showed product terms the '
    'Statutory Position says Halqa no longer offers, a sign-in page that printed a demonstration password, and a '
    'sign-up of ten steps.',
    'Revision 4 marks as done the removal of pill shapes from every screen, the two Hyper configurations with '
    'the three way split, the four crashing screens and their preview data, and three defects found while '
    'rebuilding: bottom sheets that closed on opening, a gap under the tab bar, and rupee amounts breaking '
    'across lines. It rewrites the collection items so that contributions move through an electronic money '
    'institution and Halqa\'s own fee alone is collected by Request to Pay. It adds three items found in the '
    'code and the live headers: the permission policy also blocks geolocation, the circle creation route still '
    'accepts ballot and credit weighted ordering, and the time value engine still prices an early fee.',
    'Order of work: C3 is finished except the fee, pay and positions screens; C2 and C1 come next, then the '
    'rest of C. Every status was confirmed by opening the screen or reading the code, not taken from memory.',
    'Sections A to D concern the interface, %d items. Sections E to R concern everything else.' % ui,
]

md = ['# Halqa — Work Register to Operational at 100,000 Users', '', LEAD, '', '## Scope note', '']
for p in SCOPE:
    md += [p, '']
hb = ['<h1><b>Halqa — Work Register to Operational at 100,000 Users</b></h1>',
      '<p class="lead">%s</p>' % H.escape(LEAD), '<h2><b>Scope note</b></h2>']
hb += ['<p>%s</p>' % H.escape(p) for p in SCOPE]

n = 0
for letter, title, preamble, items in SECTIONS:
    md += ['## %s. %s' % (letter, title), '']
    hb.append('<h2><b>%s. %s</b></h2>' % (letter, H.escape(title)))
    if preamble:
        md += [preamble, '']
        hb.append('<p>%s</p>' % H.escape(preamble))
    table_open = False
    pos = 0
    for it in items:
        if it[0] == S:
            if table_open:
                md.append(''); hb.append('</table>'); table_open = False
            md += ['### ' + it[1], '']
            hb.append('<h3><b>%s</b></h3>' % H.escape(it[1]))
            if it[2]:
                md += [it[2], '']
                hb.append('<p>%s</p>' % H.escape(it[2]))
            continue
        if not table_open:
            md += ['| # | Item | Location | Status |', '| :-: | :-- | :-- | :-: |']
            hb.append('<table>')
            hb.append('<tr><th><b>#</b></th><th><b>Item</b></th><th><b>Location</b></th><th><b>Status</b></th></tr>')
            table_open = True
        n += 1; pos += 1
        st = status_of(letter, pos, it)
        md.append('| %d | %s | %s | %s |' % (n, it[0], it[1], st))
        hb.append('<tr><td>%d</td><td>%s</td><td>%s</td><td>%s</td></tr>'
                  % (n, H.escape(it[0]), H.escape(it[1]), st))
    if table_open:
        hb.append('</table>')
    md.append('')

md += ['## Summary', '', '| Section | Items | Done | Partly done | Open |', '| :-- | :-: | :-: | :-: | :-: |']
hb += ['<h2><b>Summary</b></h2>', '<table>',
       '<tr><th><b>Section</b></th><th><b>Items</b></th><th><b>Done</b></th><th><b>Partly done</b></th><th><b>Open</b></th></tr>']
for sec in SECTIONS:
    c = counts[sec[0]]
    row = (sec[0] + '. ' + sec[1], len(items_of(sec)), c['Done'], c['Partly done'], c['Open'])
    md.append('| %s | %d | %d | %d | %d |' % row)
    hb.append('<tr><td>%s</td><td>%d</td><td>%d</td><td>%d</td><td>%d</td></tr>' % ((H.escape(row[0]),) + row[1:]))
md.append('| Total | %d | %d | %d | %d |' % (total, done, part, openn))
hb.append('<tr><td><b>Total</b></td><td><b>%d</b></td><td><b>%d</b></td><td><b>%d</b></td><td><b>%d</b></td></tr>'
          % (total, done, part, openn))
hb.append('</table>')

io.open('WORK-REGISTER-rev4.md', 'w', encoding='utf-8').write('\n'.join(md))
page = ('<!DOCTYPE html>\n<html><head><meta charset="utf-8"><title>Halqa - Work Register to 100,000 Users</title>'
        '<style>\n%s\n</style></head>\n<body>\n%s\n</body></html>\n' % (gclean.HOUSE_CSS, '\n'.join(hb)))
page = F.with_logo(page)
io.open('docs/work-register-rev4.final.html', 'w', encoding='utf-8').write(page)
print('items %d  done %d  partly %d  open %d   html %d chars' % (total, done, part, openn, len(page)))
for sec in SECTIONS:
    c = counts[sec[0]]
    print('  %s  %-50s %3d  done %2d  part %2d  open %3d' % (sec[0], sec[1][:50], len(items_of(sec)), c['Done'], c['Partly done'], c['Open']))
