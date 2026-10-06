# -*- coding: utf-8 -*-
# Part 4: economics

divider('4', 'Economics', 'What each payment costs to run, what each committee type earns, fixed costs and break '
        'even on the 25 September model, and what the bank route changes before the model is re-cut on '
        'Mashreq’s terms.')

TYPES7 = ['Family', 'Office', 'Market', 'Unknown', 'Large unknown', 'Hyper 1', 'Hyper 2']

# ---- cost per payment
sl = slide('Cost per Payment',
           'On the 25 September model, running a payment costs Rs 13 to 35, depending on the circle. Unknown circles cost '
           'most, because of statement checks every 90 days and a larger charge on each debit.',
           src='Business Model and Unit Costs (HQ-CP-03), 25 September 2026: points and rewards excluded from the per '
               'payment cost. Collection charge at the Safepay target of 1 per cent capped at Rs 10; 1.5 per cent on '
               'Hyper debits under the cap.')
caption(sl, M, Y0, 7.6, 'Running cost per payment, Rs, by component')
chart(sl, XL_CHART_TYPE.BAR_STACKED, M - 0.05, Y0 + 0.3, 7.7, 4.4, TYPES7,
      [('Collection charge', [6.00, 6.00, 6.00, 10.00, 10.00, 4.50, 5.00]),
       ('WhatsApp messages', [6.50, 5.77, 5.92, 6.12, 5.83, 4.96, 5.12]),
       ('Support', [4.17, 4.17, 3.48, 6.95, 6.95, 2.61, 2.61]),
       ('Statement checks', [0, 0, 0, 9.58, 9.58, 0.57, 1.10]),
       ('Cloud', [2.00, 2.00, 0.46, 2.00, 2.00, 0.07, 0.08])],
      colors=[L700, LIME, LIME_MID, AMBER, GREY_LT], fmt='[<1]"";0.0', gap=45, overlap=100, legend=True, size=9.5,
      label_pos=XL_LABEL_POSITION.CENTER, vmax=38)
x0 = 8.6
heading(sl, x0, Y0, W - M - x0, 'Prices used')
stat_rows(sl, x0, Y0 + 0.42, W - M - x0, [
    ('message-circle', 'Rs 4.35', 'a WhatsApp utility message from 1 October 2026 (US$0.015)'),
    ('scan-face', 'Rs 50', 'a NADRA check, planning figure; liveness US$0.016'),
    ('file-text', 'Rs 200', 'a TASDEEQ report, planning figure'),
    ('headphones', 'Rs 60,000', 'a support agent a month, 40 contacts a day'),
    ('cloud', 'Rs 2', 'cloud cost per active member a month'),
    ('megaphone', 'Rs 250', 'acquisition per new member, planning figure'),
    ('gift', 'Rs 8', 'points for each on time instalment'),
], rh=0.62, num_w=1.1, isz=0.26, size=9.5, nsize=13)

# ---- results by type
sl = slide('Results by Committee Type',
           'Each type pays for itself after its first circle. The first circle carries onboarding and acquisition; later '
           'circles with the same members do not. The family circle is the only one that loses money the first time.',
           src='Business Model and Unit Costs (HQ-CP-03), 25 September 2026, before Mashreq’s terms. Contribution = '
               'fees and agency commission less running costs, points and rewards.')
caption(sl, M, Y0, 6.2, 'Net contribution per circle, monthly types, Rs')
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, M - 0.05, Y0 + 0.3, 6.3, 4.3, TYPES7[:5],
      [('First circle', [-427, 55946, 2295, 62559, 232199]), ('Later circles', [2053, 60906, 6429, 70355, 245192])],
      colors=[LIME_MID, L700], fmt='#,##0;(#,##0)', gap=60, overlap=-10, legend=True, size=9.5,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=280000, cat_low=True)
x0 = 7.05
caption(sl, x0, Y0, W - M - x0, 'Contribution per member a month, later circles, Rs')
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, x0 - 0.05, Y0 + 0.3, W - M - x0 + 0.1, 2.9, TYPES7,
      [('Per member', [34.1, 411.5, 218.9, 470.5, 602.2, 1613.4, 1482.6])],
      point_colors=[LIME, LIME, LIME, L700, L700, AMBER, AMBER], fmt='#,##0', gap=35, size=9.5,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=1950)
ledger(sl, x0, Y0 + 3.35, W - M - x0, [
    ('Hyper, Option 1', 'Rs 888,998', 'Rs 1,168,855'), ('Hyper, Option 2', 'Rs 396,293', 'Rs 669,154'),
], [2.1, 1.6, 1.7], size=10, rh=0.36, head=('Per cycle', 'First', 'Later'))
tb(sl, x0, Y0 + 4.5, W - M - x0, 0.6, 'Hyper earns most per circle because hundreds of members pay every day; the '
   'family circle earns least because the fee is Rs 100 and the circle is small.', size=9.5, color=GREY, spacing=1.06)

# ---- fixed costs and break even
sl = slide('Fixed Costs and Break Even',
           'Launch fixed costs are about Rs 1.32 million a month. At a blended contribution of Rs 512 a member a month, '
           'about 2,600 active members cover them; 100,000 members leave about Rs 45.6 million a month before tax.',
           src='Business Model and Unit Costs (HQ-CP-03), 25 September 2026. Mix assumed: family 20%, office 30%, market '
               '10%, unknown 20%, large 5%, Hyper 1 10%, Hyper 2 5%. The rebuild of this model is paused (see Paused '
               'Work).')
caption(sl, M, Y0, 5.9, 'Monthly fixed costs at launch, Rs thousand')
fx = [('Two software engineers', 500), ('Operations and compliance lead', 200), ('Counsel on retainer', 150),
      ('Office, six desks, Islamabad', 150), ('Software subscriptions', 101.5), ('Accountant and tax adviser', 60),
      ('Statutory audit', 25), ('Secretarial and filings', 10), ('Contingency, 10%', 119.65)]
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, M - 0.05, Y0 + 0.3, 6.0, 4.1, [a for a, _ in fx], [('Rs k', [v for _, v in fx])],
      point_colors=[L700] + [LIME] * 7 + [GREY_LT], fmt='#,##0', gap=35, size=9.5,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=600)
tb(sl, M, Y0 + 4.45, 5.9, 0.5, 'Total Rs 1,316,150 a month. At 100,000 members the fixed base is about Rs 5.61 million '
   'a month.', size=9.5, color=GREY)
x0 = 6.95
caption(sl, x0, Y0, W - M - x0, 'Break even: contribution against fixed cost, Rs million a month')
mem = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000]
chart(sl, XL_CHART_TYPE.LINE, x0 - 0.05, Y0 + 0.3, W - M - x0 + 0.1, 3.5, ['{:,}'.format(m) for m in mem],
      [('Contribution', [round(m * 511.82 / 1e6, 3) for m in mem]), ('Fixed cost', [1.316] * len(mem))],
      colors=[L700, AMBER], labels=False, legend=True, val_axis=True, grid=True, size=9, val_fmt='0.0')
tb(sl, x0, Y0 + 3.85, W - M - x0, 0.3, 'Active members', size=8.5, color=GREY, align=CEN)
stat_rows(sl, x0, Y0 + 4.2, W - M - x0, [
    ('target', '2,572', 'active members to break even at launch, shown as about 2,600'),
    ('trending-up', 'Rs 45.6m', 'a month before tax at 100,000 members'),
], rh=0.42, num_w=1.1, isz=0.24, size=9.5, nsize=13)

# ---- bank route changes
sl = slide('What the Bank Route Changes',
           'The 25 September model assumed Halqa collected its own fee through Safepay. Under the bank route Mashreq '
           'collects the fee and shares income with Halqa, so each line moves. The model is re-cut once Mashreq’s '
           'terms are known.', partner=True,
           src='Decisions D3, D4, D5, D7 and D12, 28 September 2026. Directions only; no figures are claimed until '
               'Mashreq states its terms.')
heading(sl, M, Y0, 3.6, 'Line')
heading(sl, M + 3.6, Y0, 3.8, '25 September model')
heading(sl, M + 7.75, Y0, 4.5, 'Bank route')
rule(sl, M, Y0 + 0.4, CW, L700, 1.0)
chg = [('coins', 'Member fee', 'Rs 100 to 500 an instalment, to Halqa', 'To Mashreq as its income; lowered as far as '
        'the income share allows', 'trending-down'),
       ('handshake', 'Halqa income', 'Fees plus agency commission on takaful', 'An agreed share of Mashreq’s income '
        'from committee accounts', 'arrow-left-right'),
       ('credit-card', 'Collection cost', '1 per cent capped at Rs 10 a debit, through Safepay', 'A book transfer inside '
        'Mashreq; Safepay only as back up', 'trending-down'),
       ('shield-check', 'Cover', 'Takaful through Halqa as corporate agent', 'Mashreq’s choice: guarantee, '
        'insurance or takaful', 'arrow-left-right'),
       ('gift', 'Points', 'Paid from Halqa’s fee revenue', 'Balance profit from Mashreq, one point a rupee; points '
        'as Mashreq’s product', 'trending-up'),
       ('users', 'Acquisition', 'Rs 250 a member, Halqa’s spend', 'Shared: accounts are Mashreq’s customers',
        'trending-down'),
       ('chart-line', 'Credit reporting', 'Rs 200 a report and a notification route', 'Through Mashreq’s TASDEEQ '
        'membership', 'trending-down')]
for i, (ic, t, before, after, dirn) in enumerate(chg):
    y = Y0 + 0.5 + i * 0.66
    icon(sl, ic, M, y + 0.15, 0.3)
    tb(sl, M + 0.45, y, 3.1, 0.6, t, size=11, bold=True, color=INK, anchor=MIDDLE)
    tb(sl, M + 3.6, y, 3.8, 0.6, before, size=10, color=GREY, anchor=MIDDLE, spacing=1.04)
    icon(sl, dirn, M + 7.3, y + 0.17, 0.26, L700 if dirn != 'trending-down' else AMBER)
    tb(sl, M + 7.75, y, CW - 7.75, 0.6, after, size=10, anchor=MIDDLE, spacing=1.04)
    rule(sl, M + 0.45, y + 0.63, CW - 0.45)
