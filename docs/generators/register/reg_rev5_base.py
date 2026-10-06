# -*- coding: utf-8 -*-
"""Work register, revision 5 (24 September 2026, evening), built on the revision 4 changes.

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

