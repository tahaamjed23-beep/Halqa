# -*- coding: utf-8 -*-
"""Maths 05: takaful cover pricing for unknown committees, formal and informal."""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import os
import docgen as D
from mcommon import rs, num, pct, ABOUT, formal, informal, glossary

P_BASE = 0.05          # post-collection default rate, the planning figure of the Hyper document
STRESS_SHARE = 0.20    # chairman's stress: 20 per cent of members in the stressed circle
STRESS_EVERY = 5       # one stressed circle in every five
W_ILL, L_ILL = 0.25, 0.20   # illustrative wakalah fee and safety loading, set by the operator in practice


def earliest_seat_loss(c, n, m_members, per_day=1):
    """Loss when the defaulters hold the earliest collection slots and pay nothing after collecting.
    per_day members collect in each round; fractional members are taken pro rata."""
    left, loss, t = m_members, 0.0, 1
    while left > 1e-9:
        take = min(per_day, left)
        loss += take * c * (n - t)
        left -= take
        t += 1
    return loss


# ---- monthly unknown circle: 12 members, Rs 10,000 a month, 12 rounds
M = dict(n=12, c=10000.0, rounds=12)
M['P'] = M['n'] * M['c']
M['inst'] = M['n'] * M['rounds']                       # member-instalments per circle
M['sev'] = M['c'] * (M['rounds'] - 1) / 2              # average forward liability, seats uniform
M['base_loss'] = M['n'] * P_BASE * M['sev']
M['stress_members'] = STRESS_SHARE * M['n']
M['stress_loss_circle'] = earliest_seat_loss(M['c'], M['rounds'], M['stress_members'])
M['stress_loss'] = M['stress_loss_circle'] / STRESS_EVERY
M['pi_base'] = M['base_loss'] / M['inst']
M['pi_stress'] = M['stress_loss'] / M['inst']
assert round(M['base_loss']) == 33000 and round(M['stress_loss_circle']) == 246000

# ---- Hyper, per circle
H1 = dict(name='Hyper Option 1', n=400, N=50, m=8, c=300.0, takaful=75.0)
H2 = dict(name='Hyper Option 2', n=390, N=26, m=15, c=8666.6666667 / 26, takaful=8666.6666667 / 26 / 4)
for h in (H1, H2):
    h['inst'] = h['n'] * h['N']
    h['sev'] = h['c'] * (h['N'] - 1) / 2
    h['base_loss'] = h['n'] * P_BASE * h['sev']
    h['stress_loss_circle'] = earliest_seat_loss(h['c'], h['N'], STRESS_SHARE * h['n'], per_day=h['m'])
    h['stress_loss'] = h['stress_loss_circle'] / STRESS_EVERY
    h['fund'] = h['takaful'] * h['inst']
assert round(H1['stress_loss_circle']) == 1068000 and round(H2['stress_loss_circle']) == 595000


def gross(pi):
    return pi * (1 + L_ILL) / (1 - W_ILL)


def tabarru(pi):
    return pi * (1 + L_ILL)


# pool test on the monthly product: five circles, one stressed
pool_base = 5 * tabarru(M['pi_base']) * M['inst']
pool_stress = 5 * tabarru(M['pi_stress']) * M['inst']
new_member_cap = M['c'] * 2      # a new member is confined to the final three seats: L at most 2c

REPORTED = [
    ['Microfinance arrears beyond 30 days, Pakistan', '3.9% at the end of January 2026, after peaking at 6.01%',
     'VIS Credit Rating Company, Microfinance Sector update, 2026'],
    ['Committee participants who have lost money to fraud', '12%', 'Financial Inclusion Insights, survey of Pakistan'],
]

# ------------------------------------------------------------------ formal
f = []
f.append('<h2>1. Halqa, and the risk to be covered</h2>' + ABOUT + D.para(
    'In an unknown committee the members do not know one another, so the social pressure that keeps an ordinary committee '
    'paying is weaker. Halqa therefore makes takaful cover mandatory on every unknown committee and on Hyper, and on no '
    'other circle. The risk is a member who collects the pot and then stops paying the instalments still owed. Arrears '
    'before collection are recovered from the late member&rsquo;s own pot on their collection day and are not insured.'))
f.append(D.quote('credit and suretyship business&rdquo; means effecting and carrying out: (i) contracts of insurance against '
                 'loss to the policy holder arising from failure, whether through insolvency or otherwise, of debtors to pay '
                 'debts when they fall due', 'Insurance Ordinance 2000, section 4(4)(f). The cover is Class 6 non-life business')
         + D.para('Because the cover is Class 6 non-life business, the candidate operators are general takaful operators: '
                  'Pak-Qatar General Takaful Limited and Salaam Takaful Limited. Neither is contracted.'))
f.append('<h2>2. Exposure</h2>' + D.para(
    'A member who collects in round k of an n round circle still owes one contribution for every later round. That is the '
    'forward liability and it is the most the circle can lose on that member.')
    + D.formula('L(k) = c &times; (n &minus; k) &nbsp;&nbsp;&nbsp;&nbsp; average over seats = c &times; (n &minus; 1) / 2')
    + D.bullets([
        'Monthly unknown committee used throughout: 12 members, %s a month, 12 rounds, pot %s. Worst seat %s; average %s.'
        % (rs(M['c']), rs(M['P']), rs(M['c'] * 11), rs(M['sev'])),
        'Hyper Option 1: 400 members, 50 days, %s a day into the pot. Worst %s; average %s.'
        % (rs(H1['c']), rs(H1['c'] * 49), rs(H1['sev'])),
        'Seat rules cap the exposure on new members: a member with no history may take only the final three seats, so '
        'their forward liability is at most two contributions, %s on the monthly example.' % rs(new_member_cap),
    ]))
f.append('<h2>3. Frequency: two cases</h2>' + D.table([
    ['Case', 'Assumption', 'Why'],
    ['Base', '5 per cent of members default after collecting, spread evenly across seats',
     'The planning figure of the Hyper Committee document. It is above reported microfinance arrears, so it is conservative'],
    ['Stress', 'In one of every five unknown committees, 20 per cent of members take the pot and pay nothing after, holding '
               'the earliest seats', 'Set by Halqa&rsquo;s chairman as the event the fund must survive'],
], widths=['12%', '48%', '40%'])
    + D.table([['Reported figure', 'Value', 'Source']] + REPORTED, widths=['36%', '28%', '36%']))
f.append('<h2>4. Expected loss and the pure premium</h2>'
         + D.formula('Pure premium per member instalment = expected loss per circle / (members &times; instalments)')
         + D.table([
             ['Product', 'Case', 'Loss per circle', 'Pure premium per instalment', 'Share of contribution'],
             ['Monthly, 12 &times; Rs 10,000', 'Base', rs(M['base_loss']), rs(M['pi_base'], 2), pct(M['pi_base'] / M['c'], 2)],
             ['Monthly, 12 &times; Rs 10,000', 'Stress', rs(M['stress_loss']) + ' (' + rs(M['stress_loss_circle']) + ' in the stressed circle)',
              rs(M['pi_stress'], 2), pct(M['pi_stress'] / M['c'], 2)],
             ['Hyper Option 1', 'Base', rs(H1['base_loss']), rs(H1['base_loss'] / H1['inst'], 2), pct(H1['base_loss'] / H1['inst'] / H1['c'], 2)],
             ['Hyper Option 1', 'Stress', rs(H1['stress_loss']) + ' (' + rs(H1['stress_loss_circle']) + ')', rs(H1['stress_loss'] / H1['inst'], 2),
              pct(H1['stress_loss'] / H1['inst'] / H1['c'], 2)],
             ['Hyper Option 2', 'Base', rs(H2['base_loss']), rs(H2['base_loss'] / H2['inst'], 2), pct(H2['base_loss'] / H2['inst'] / H2['c'], 2)],
             ['Hyper Option 2', 'Stress', rs(H2['stress_loss']) + ' (' + rs(H2['stress_loss_circle']) + ')', rs(H2['stress_loss'] / H2['inst'], 2),
              pct(H2['stress_loss'] / H2['inst'] / H2['c'], 2)],
         ], numeric=(2, 3, 4), widths=['22%', '10%', '30%', '20%', '18%'])
         + D.para('In the stressed monthly circle, 2.4 of 12 members default from seats 1, 2 and part of 3: %s &times; (11 + 10 + 0.4 &times; 9) = %s. '
                  'On Hyper Option 1 the 80 defaulters are the 8 collectors on each of days 1 to 10: 8 &times; %s &times; (49 + 48 + ... + 40) = %s.'
                  % (rs(M['c']), rs(M['stress_loss_circle']), rs(H1['c']), rs(H1['stress_loss_circle']))))
f.append('<h2>5. From pure premium to contribution</h2>' + D.para(
    'The participant&rsquo;s contribution carries the tabarru, which goes to the participants&rsquo; risk fund, and the '
    'operator&rsquo;s wakalah fee. The operator sets both the fee and the safety loading; the figures below use an '
    'illustrative wakalah fee of 25 per cent and loading of 20 per cent.')
    + D.formula('Tabarru = pure premium &times; (1 + loading) &nbsp;&nbsp;&nbsp;&nbsp; Contribution = tabarru / (1 &minus; wakalah fee)')
    + D.table([
        ['Monthly product, per Rs 10,000 instalment', 'Base', 'Stress'],
        ['Pure premium', rs(M['pi_base'], 2), rs(M['pi_stress'], 2)],
        ['Tabarru, with 20% loading', rs(tabarru(M['pi_base']), 2), rs(tabarru(M['pi_stress']), 2)],
        ['Contribution, with 25% wakalah fee', rs(gross(M['pi_base']), 2), rs(gross(M['pi_stress']), 2)],
        ['As a share of the instalment', pct(gross(M['pi_base']) / M['c'], 2), pct(gross(M['pi_stress']) / M['c'], 2)],
    ], numeric=(1, 2), widths=['50%', '25%', '25%']))
f.append('<h2>6. Whether the fund survives the stress case</h2>'
         + D.table([
             ['Test, five monthly circles, one stressed', 'Tabarru collected', 'Loss', 'Result'],
             ['Priced on the base case', rs(pool_base), rs(M['stress_loss_circle']),
              'Short by %s, met by the operator&rsquo;s interest free loan and recovered from later surplus' % rs(M['stress_loss_circle'] - pool_base)],
             ['Priced on the stress case', rs(pool_stress), rs(M['stress_loss_circle']), 'Survives, with %s left over' % rs(pool_stress - M['stress_loss_circle'])],
         ], numeric=(1, 2), widths=['30%', '18%', '14%', '38%'])
         + D.table([
             ['Hyper, one circle', 'Fund built', 'Base loss', 'Loss ratio', 'Stressed circle loss', 'Loss ratio'],
             ['Option 1', rs(H1['fund']), rs(H1['base_loss']), pct(H1['base_loss'] / H1['fund'], 1), rs(H1['stress_loss_circle']), pct(H1['stress_loss_circle'] / H1['fund'], 1)],
             ['Option 2', rs(H2['fund']), rs(H2['base_loss']), pct(H2['base_loss'] / H2['fund'], 1), rs(H2['stress_loss_circle']), pct(H2['stress_loss_circle'] / H2['fund'], 1)],
         ], numeric=(1, 2, 3, 4, 5))
         + D.bullets([
             'Monthly unknown committees should be priced on the stress case at launch, so the pool survives the '
             'chairman&rsquo;s event without drawing on the operator; surplus returns to participants when experience is better.',
             'Hyper&rsquo;s fixed takaful contribution, Rs 75 a day on Option 1, is sized for a 50 per cent default rate. Even '
             'the stressed circle alone uses about 71 per cent of its own fund.',
         ]))
f.append('<h2>7. Claims, recoveries and the agent&rsquo;s obligations</h2>' + D.bullets([
    'Trigger: a member who has collected misses three consecutive instalments after the grace period. Halqa supplies the '
    'payment record, the mandate history and the undertaking as the evidence pack.',
    'Payment: the operator pays each member left short directly, in that member&rsquo;s own name. Nothing is paid to a '
    'circle or to Halqa.',
    'Recoveries: amounts later recovered from the defaulter under the undertaking and the mutual guarantee are returned to the fund.',
    'Reporting: a monthly file of members covered, contributions, defaults, claims and recoveries.',
])
    + D.quote('The insurer shall make the claim settlement directly in the name of the policyholder, life assured, his nominee or '
              'guardian, as the case may be.', 'Corporate Insurance Agents Regulations 2020, regulation 7(4)')
    + D.quote('The corporate insurance agent shall always pay the gross premium to the insurer and shall not retain any part of '
              'the insurance premium received from the policyholders for payment to the insurer.', 'Regulation 5(4)')
    + D.quote('The corporate insurance agent shall not charge, to the policyholder, any service fee, processing fee, administration '
              'charge or any other charge unless such a charge has been included by the insurer in the premium and communicated to '
              'the policyholder in advance.', 'Regulation 8(3). Halqa&rsquo;s service fee is for the committee service only'))
f.append('<h2>8. What Halqa asks of the operator</h2>' + D.bullets([
    'A Class 6 credit takaful product for members of Halqa&rsquo;s unknown committees and Hyper, priced per member.',
    'Agreement on the claim trigger, the evidence pack and payment direct to the member left short.',
    'A written corporate insurance agency agreement, as section 96(2) of the Insurance Ordinance 2000 requires, with Halqa '
    'entered in the operator&rsquo;s register of agents under section 98 and commission computed on contributions received, '
    'as regulation 8(2) requires.',
    'A written view on regulation 10(c), since cover on Hyper is a fixed part of every payment.',
]))
f.append('<h2>9. Technical Process</h2>' + D.steps([
    'Enrolment. When a circle starts, a file goes to the operator listing each covered member, the circle, the seat, the '
    'instalment, the cover and the contribution.',
    'Contributions. The takaful part of every debit is paid by the payment partner straight into the participants&rsquo; risk '
    'fund account, and a daily file of contributions paid goes to the operator.',
    'Claims. The arrears engine detects the trigger, three consecutive misses after grace by a member who has collected, and '
    'assembles the evidence pack: the payment record, the mandate history and the undertaking. The operator pays each member '
    'left short in that member&rsquo;s own name.',
    'Recoveries. Amounts later recovered from the defaulter are paid to the fund and recorded against the claim.',
    'Reporting. A monthly file of members covered, contributions, defaults, claims and recoveries; commission is computed only '
    'on contributions the operator has received.',
]))
f.append('<h2>10. Model Surface</h2>' + D.para(
    'The contribution depends on the default rate and on the operator&rsquo;s wakalah fee, with the safety loading at 20 per '
    'cent. The figure shows the contribution per Rs 10,000 instalment of a 12 member monthly circle on the base case formula, '
    'coloured by its share of the instalment.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'takaful.png'), 'Contribution per Rs 10,000 instalment by default rate after collection and wakalah fee. Green: under 3 per '
               'cent of the instalment. Amber: 3 to 6 per cent. Red: over 6 per cent.', '92%'))
f.append(D.summary(
    'The insurer covers one thing: a member of an unknown committee who takes the pot and then stops paying. In a normal '
    'year about 5 in 100 members might do that; in the bad case set by the chairman, one committee in five loses a fifth '
    'of its members from the earliest seats. Priced for the bad case, the cover costs about 5.5 per cent of each monthly '
    'instalment and still leaves money over. Hyper&rsquo;s cover is already large enough for half its members to default.'))

formal('05 Takaful Cover Pricing Model.pdf', 'Takaful Cover for Unknown Committees: Pricing Model',
       'The loss a takaful operator would carry on Halqa&rsquo;s unknown committees and Hyper, and the contribution that covers it.',
       'HQ-MF-05', 'Pak-Qatar General Takaful Limited and Salaam Takaful Limited', ''.join(f), running='Takaful Cover Pricing Model')

# ------------------------------------------------------------------ informal
i = []
i.append(D.para('This explains the insurance maths, with the numbers the operators will see. The cover is '
                'takaful, which is Islamic insurance: members put money into a shared fund, and the fund pays anyone who '
                'suffers the loss it covers.'))
i.append('<h2>1. The words used</h2>' + glossary([
    ['Takaful operator', 'The company that runs the fund, for example Pak-Qatar General Takaful or Salaam Takaful'],
    ['Participants&rsquo; fund', 'The shared pot of takaful money. It belongs to the members, not to the operator'],
    ['Tabarru', 'The part of each takaful payment that goes into the shared fund'],
    ['Wakalah fee', 'The operator&rsquo;s fee for running the fund, a percentage of each payment'],
    ['Pure premium', 'The cost of the expected losses alone, before any fee or safety margin'],
    ['Loading', 'An extra safety margin on top of the pure premium'],
    ['Loss ratio', 'Claims paid divided by money collected. Low means the fund is comfortable'],
    ['Severity', 'How big one loss is. Frequency is how often losses happen'],
    ['Class 6', 'The legal class for credit cover. Only a general (non-life) operator can write it, which is why the '
                'candidate is Pak-Qatar General Takaful'],
]))
i.append('<h2>2. What is being insured</h2>' + D.bullets([
    'Only unknown committees and Hyper carry cover, and it is mandatory there.',
    'The loss is a member who takes the pot and then stops paying. Missed payments before a turn are not insured, because '
    'they come out of that member&rsquo;s own pot.',
    'The most one member can cost is what they still owe after collecting. In a 12 member, Rs 10,000 committee, seat 1 '
    'still owes Rs 110,000 and seat 12 owes nothing. The average is Rs 55,000.',
    'New members can only take the last three seats, so they can never cost more than Rs 20,000.',
]))
i.append('<h2>3. The two cases</h2>' + D.bullets([
    'Base case: 5 out of every 100 members take the pot and stop, at any seat. Per committee that costs Rs 33,000, which '
    'is Rs 229 on every Rs 10,000 instalment.',
    'Stress case, set by the chairman: in 1 committee out of 5, a fifth of the members take the pot and stop, and they are '
    'the ones who collected first. That committee loses Rs 246,000. Shared over 5 committees it is Rs 49,200 each, or '
    'Rs 342 per instalment.',
    'The stress case costs more only because the defaulters are assumed to sit in the earliest seats, where the loss is biggest.',
]))
i.append('<h2>4. What a member would pay</h2>' + D.para(
    'The operator adds its fee and a safety margin. With a 25 per cent fee and a 20 per cent margin, which the operator '
    'would set itself:') + D.table([
        ['Per Rs 10,000 instalment', 'Base', 'Stress'],
        ['Cost of losses', rs(M['pi_base']), rs(M['pi_stress'])],
        ['Member pays for cover', rs(gross(M['pi_base'])), rs(gross(M['pi_stress']))],
        ['Share of the instalment', pct(gross(M['pi_base']) / M['c'], 1), pct(gross(M['pi_stress']) / M['c'], 1)],
    ], numeric=(1, 2)))
i.append('<h2>5. Whether the fund survives the chairman&rsquo;s case</h2>' + D.bullets([
    'Priced on the base case, five committees put %s into the fund, but the bad committee loses %s. The fund is short by '
    '%s, and the operator lends that amount interest free, recovered from later years.' % (rs(pool_base), rs(M['stress_loss_circle']), rs(M['stress_loss_circle'] - pool_base)),
    'Priced on the stress case, the five committees put in %s. The loss is covered with %s left over, and leftovers go '
    'back to the members.' % (rs(pool_stress), rs(pool_stress - M['stress_loss_circle'])),
    'Hyper is safer still. Option 1 builds %s per circle. A normal year costs %s and even the bad circle costs %s, about '
    '71 per cent of its own fund.' % (rs(H1['fund']), rs(H1['base_loss']), rs(H1['stress_loss_circle'])),
]))
i.append('<h2>6. Rules the law sets</h2>' + D.bullets([
    'Claims are paid straight to the member left short, in their own name, never to the committee or to Halqa.',
    'Halqa passes every rupee of the takaful payment to the operator and keeps none of it.',
    'Halqa cannot charge a fee for selling the cover. Its service fee is for running the committee only.',
]))
i.append('<h2>7. Model Surface</h2>' + D.para(
    'The picture shows what the cover costs on each Rs 10,000 instalment, for every default rate and every fee the operator '
    'might charge. More defaults, or a higher fee, raise the cost. Green is cheap, amber is moderate, red is expensive.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'takaful.png'), 'Cost of cover per Rs 10,000 instalment. Green: under 3 per cent. Amber: 3 to 6 per cent. Red: over 6 per cent.', '92%'))
i.append('<h2>8. Process</h2>' + D.steps([
    'When a circle starts, the operator is told who is covered.',
    'Every payment sends the takaful part straight to the fund.',
    'If a member takes the pot and misses three payments in a row, the system sends the operator the evidence.',
    'The operator pays each member left short directly.',
    'Anything later recovered from the defaulter goes back to the fund.',
]))
i.append(D.summary(
    'Only unknown committees and Hyper need cover. Cover pays members who are left short when someone takes the pot and '
    'stops paying. In a normal year it costs about Rs 367 per Rs 10,000 instalment; priced for the chairman&rsquo;s bad '
    'case it costs about Rs 547 and the fund survives with money left over. Hyper&rsquo;s cover is already big enough for '
    'half its members to default.'))
informal('05 Takaful Cover Pricing Explained.pdf', 'Takaful Cover Pricing, Explained',
         'What the insurance covers, what it costs, and whether the fund survives the chairman&rsquo;s bad case.',
         'HQ-MI-05', ''.join(i), running='Takaful Cover Pricing Explained')
print('monthly base pi', round(M['pi_base'], 2), 'stress pi', round(M['pi_stress'], 2), 'gross', round(gross(M['pi_base']), 2), round(gross(M['pi_stress']), 2))
print('pool base', round(pool_base), 'pool stress', round(pool_stress))
for h in (H1, H2):
    print(h['name'], 'fund', round(h['fund']), 'base', round(h['base_loss']), 'stress circle', round(h['stress_loss_circle']), 'ratio', round(h['stress_loss_circle'] / h['fund'], 3))
