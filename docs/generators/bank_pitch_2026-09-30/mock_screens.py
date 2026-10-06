# -*- coding: utf-8 -*-
"""
Screens that the Halqa application does not have yet, written in the application's own wallet kit (the same class
names as components/wallet.tsx, styled by the live stylesheet) and captured through the preview server with
shoot_mock.mjs. The application code is not changed: each screen is injected into a running preview page.

Usage: python mock_screens.py mashreq|raqami   -> writes mocks_<bank>.json
"""
import json, os, re, sys

ME = os.path.dirname(os.path.abspath(__file__))
ICON_SRC = r'D:/HALQA SIGMA APP/halqa-web/node_modules/lucide-react/dist/esm/icons'
BANK = sys.argv[1] if len(sys.argv) > 1 else 'mashreq'
MQ = BANK == 'mashreq'
BN = 'Mashreq' if MQ else 'Raqami'


def ic(name):
    s = open(os.path.join(ICON_SRC, name + '.mjs'), encoding='utf-8').read()
    js = re.search(r'const __iconNode = (\[.*?\]);\n', s, re.S).group(1)
    js = re.sub(r'(\{|,)\s*([A-Za-z_][\w-]*)\s*:', r'\1 "\2":', js)
    parts = ['<%s %s/>' % (tag, ' '.join('%s="%s"' % (k, v) for k, v in attrs.items() if k != 'key'))
             for tag, attrs in json.loads(js)]
    return ('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" '
            'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">%s</svg>'
            % ''.join(parts))


def head(title, extra=''):
    return ('<header class="w-head"><div class="w-head-bar"><button class="w-head-btn back" aria-label="Back">%s'
            '</button></div><div class="w-head-text"><h1>%s%s</h1></div></header>' % (ic('chevron-left'), title, extra))


def steps(n, on):
    return '<div class="w-steps">%s</div>' % ''.join('<i class="%s"></i>' % ('on' if i < on else '') for i in range(n))


def hero(label, big, small):
    return '<div class="w-hero"><span>%s</span><strong>%s</strong><small>%s</small></div>' % (label, big, small)


def title(h, p):
    return '<div class="w-title"><h2>%s</h2><p>%s</p></div>' % (h, p)


def row(icon, b, small, val=None, tone='', chevron=False, tag='div'):
    v = '<span class="w-row-val %s"><b>%s</b></span>' % (tone, val) if val else ''
    return ('<%s class="w-row"><span class="w-row-icon %s">%s</span><span class="w-row-text"><b>%s</b><small>%s</small>'
            '</span>%s%s</%s>' % (tag, tone, ic(icon), b, small, v, ic('chevron-right') if chevron else '', tag))


def group(h, rows):
    return '<section class="w-rowgroup"><h4>%s</h4><div class="w-rowgroup-body">%s</div></section>' % (h, ''.join(rows))


def card(h, facts, cols=2, notice=None, tone='info'):
    f = ''.join('<div><span>%s</span><b>%s</b></div>' % (a, b) for a, b in facts)
    n = ('<div class="w-notice %s"><span>%s</span><p>%s</p></div>' % (tone, ic('info'), notice)) if notice else ''
    return ('<section class="w-card"><div class="w-card-head"><h3>%s</h3></div><div class="w-facts c%d">%s</div>%s'
            '</section>' % (h, cols, f, n))


def notice(text, tone='info', icon='info'):
    return '<div class="w-inset"><div class="w-notice %s"><span>%s</span><p>%s</p></div></div>' % (tone, ic(icon), text)


def bottom(label, icon=None):
    return '<div class="w-bottom"><button class="primary full">%s%s</button></div>' % (ic(icon) + ' ' if icon else '',
                                                                                        label)


def screen(*parts, body_from=1):
    head_part = ''.join(parts[:body_from])
    rest = list(parts[body_from:])
    btm = ''
    if rest and rest[-1].startswith('<div class="w-bottom">'):
        btm = rest.pop()
    return '<div class="w-screen">%s<div class="w-screen-body">%s</div>%s</div>' % (head_part, ''.join(rest), btm)


def chip(text, tone='warn'):
    return ' <span class="chip %s" style="vertical-align:middle;margin-left:6px;font-size:12px">%s</span>' % (tone, text)


M = {}

# 1 open the bank account inside Halqa
if MQ:
    M['m_open'] = screen(
        head('Open your Mashreq account'), steps(3, 3),
        hero('Account ready', '•••• 4567', 'Islamic Current Profit Account · up to 2% a year'),
        group('What Mashreq checked, in about five minutes', [
            row('id-card', 'CNIC', 'Front and back scanned', 'Done', 'ok'),
            row('fingerprint-pattern', 'NADRA biometric', 'Verified against your CNIC', 'Done', 'ok'),
            row('scan-face', 'Live face', 'Matched to your CNIC photo', 'Done', 'ok'),
            row('briefcase', 'Customer due diligence', 'Occupation and source of income', 'Done', 'ok')]),
        notice('Halqa never holds your money. Instalments and pots move inside your Mashreq account.'),
        bottom('Continue to the circle'))
else:
    M['m_open'] = screen(
        head('Open your Raqami account'), steps(3, 3),
        hero('Account ready', '•••• 4567', 'Asaan Digital Account · Mudarabah savings'),
        group('What Raqami checked', [
            row('id-card', 'CNIC', 'Valid and in your name', 'Done', 'ok'),
            row('smartphone', 'Mobile number', 'Registered to your CNIC', 'Done', 'ok'),
            row('scan-face', 'Live face', 'Matched to your CNIC photo', 'Done', 'ok'),
            row('user-check', 'Resident, 18 or over', 'Required for a Raqami account', 'Done', 'ok')]),
        notice('Halqa never holds your money. Instalments and pots move inside your Raqami account.'),
        bottom('Continue to the circle'))

# 2 automatic payment consent
mand = 'Direct debit mandate' if MQ else 'Standing instruction'
M['m_mandate'] = screen(
    head('Automatic payment'),
    hero(mand, 'Rs&nbsp;10,000', 'Clifton Savers · every month'),
    group('What you allow', [
        row('landmark', 'From your %s account' % BN, '•••• 4567', 'Default', 'ok'),
        row('shield-check', 'Most each time', 'One instalment, never more', 'Rs&nbsp;10,000'),
        row('calendar-clock', 'When', 'On your payday, the 1st', '1st'),
        row('repeat', 'If your salary is late', 'A retry each morning, five at most', 'Until the 8th')]),
    group('Other ways to pay', [
        row('zap', 'One-tap approval', 'A card, wallet or Raast request you approve', None, '', True, 'button'),
        row('hand-coins', 'Pay it yourself', 'From any bank account or wallet', None, '', True, 'button')]),
    notice('Cancel the %s at any time. Your place in the circle stays and you pay by one-tap approval instead.'
           % ('mandate' if MQ else 'instruction')),
    bottom('Give consent', 'check'))

# 3 payment methods: wallets and cards through a licensed PSP
M['m_methods'] = screen(
    head('Payment methods'),
    '<div class="paycard rail-RAAST"><div class="paycard-top"><span class="paycard-mark"><span class="rail-mark-plain">'
    '%s</span></span><span class="paycard-rail">%s account</span></div><div class="paycard-no">•••• 4567</div>'
    '<div class="paycard-bot"><div><span>Account holder</span><b>Taha Kayani</b></div><div class="right">'
    '<span>Used for</span><b>Automatic debit</b></div></div></div>' % (ic('landmark'), BN),
    group('Linked', [
        row('landmark', '%s account' % BN, '•••• 4567 · automatic debit and payouts', 'Default', 'ok'),
        row('smartphone', 'JazzCash wallet', 'Linked through a licensed PSP', 'Linked', 'ok'),
        row('smartphone', 'Easypaisa wallet', 'Linked through a licensed PSP', 'Linked', 'ok'),
        row('credit-card', 'Debit card', '•••• 4419 · saved with the PSP', 'Linked', 'ok')]),
    group('How it works', [
        row('key-round', 'The PSP keeps the token', 'Halqa keeps only a reference, never a card number'),
        row('arrow-down-to-line', 'Money settles at %s' % BN, 'Into the committee account, never to Halqa')]),
    bottom('Add a wallet or card', 'plus'))

# 4 committee types
types = [('users', 'Known', 'Family, colleagues, neighbours · 6 to 12', 'Level 1', ''),
         ('user-plus', 'Unknown', 'People who do not know each other · 12', 'Level 2', ''),
         ('users-round', 'Large unknown', 'Larger amounts · 20 members', 'Level 2', ''),
         ('bike', 'Asset', 'Buy a motorcycle or machine', 'Level 2', '')]
if MQ:
    types.append(('plane', 'UAE family', 'Relatives in Pakistan and the UAE', 'Level 1', ''))
types.append(('flask-conical', 'Hyper' + chip('Experimental'), 'Daily circle for daily earners', 'Level 3', 'warn'))
M['m_types'] = screen(
    head('Start a committee'), steps(3, 1),
    title('What kind of circle?', 'The less the members know each other, the more checks apply.'),
    group('Committee types', [row(i, b, s, v, t, True, 'button') for i, b, s, v, t in types]),
    bottom('Continue'))

# 5 Hyper, experimental
ins = 'Takaful or insurance' if MQ else 'Takaful'
M['m_hyper'] = screen(
    head('Hyper', chip('Experimental')),
    hero('You collect once', 'Rs&nbsp;15,000', 'Paid on your day · 8 members collect each day'),
    notice('Hyper is experimental. Limits are agreed with %s before it opens.' % BN, 'warn', 'flask-conical'),
    card('Your daily payment · Rs 450', [('To the pot', 'Rs&nbsp;300'), (ins, 'Rs&nbsp;135'), ('Fee', 'Rs&nbsp;15')], 3),
    group('This circle', [
        row('users', 'Members', '400 people, one daily circle each', '400'),
        row('calendar-days', 'Days', 'Every day, one turn each', '50'),
        row('clock', 'Late charges', '5%%, 10%%, 15%% at 12, 36 and 60 hours%s' % ('' if MQ else ', to charity'), None),
        row('badge-check', 'Checks', 'Daily income over 8 weeks, all checks', 'Level 3', 'ok')]),
    bottom('Choose your day'))

# 6 before you join: the full cost and the protections
M['m_join'] = screen(
    head('Join Clifton Savers'), steps(3, 2),
    title('What you will pay', 'Shown in full before you sign.'),
    card('Each month', [('Instalment', 'Rs&nbsp;10,000'), ('Fee', 'Rs&nbsp;85'), ('PSP service fee, 1.5%', 'Rs&nbsp;150'),
                        ('%s fee' % ins, 'Set by the operator')], 2),
    group('Your turn', [row('calendar-check', 'Turn 11 of 12', 'New members start in the last three turns',
                            'Rs&nbsp;120,000', 'ok')]),
    group('Protections', [
        row('undo-2', '24 hours to withdraw', 'No cost if you change your mind'),
        row('umbrella', ins, 'Pays you if a member stops after collecting'),
        row('signature', 'Undertaking and mutual guarantee', 'Signed by every member')]),
    bottom('Sign and join'))

# 7 points
rw = [('coins', 'Profit on committee balances', 'Clifton Savers, paid when the circle ends', '+230',
       'ok'),
      ('circle-check', 'On-time payments', '12 in a row', '+240', 'ok'),
      ('crown', 'Hosting', 'Site Engineers Circle completed cleanly', '+250', 'ok')]
M['m_points'] = screen(
    head('Rewards'),
    hero('Your points', '1,240', '1 point = Rs&nbsp;1'),
    group('Earned', [row(*r) for r in rw]),
    group('Spend them', [
        row('shopping-bag', 'Halqa marketplace', 'Phones, appliances and groceries', None, '', True, 'button'),
        row('store', 'E-commerce partners', 'At online checkout', None, '', True, 'button'),
        row('gift', '%s rewards' % BN, 'With the bank’s own programme', None, '', True, 'button')]),
    bottom('Use points'))

json.dump(M, open(os.path.join(ME, 'mocks_%s.json' % BANK), 'w', encoding='utf-8'), ensure_ascii=False)
print('screens', len(M), list(M))
