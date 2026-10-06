# -*- coding: utf-8 -*-
"""Fit the account-opening and Hyper screens above the fold."""
import io
p = 'mock_screens.py'
s = io.open(p, encoding='utf-8').read()
R = [
    ("""        head('Open your Mashreq account'), steps(3, 3),
        title('Your committee account', 'Opened by Mashreq Bank Pakistan inside Halqa, in about five minutes.'),
        group('What Mashreq checks', [""",
     """        head('Open your Mashreq account'), steps(3, 3),
        hero('Account ready', '•••• 4567', 'Islamic Current Profit Account · up to 5% a year'),
        group('What Mashreq checked, in about five minutes', ["""),
    ("""        card('Account ready', [('Account', 'Islamic Current Profit Account'), ('Profit', 'Up to 5% a year'),
                               ('Debit card', 'PayPak'), ('Number', '•••• 4567')], 2,
             'Halqa never holds your money. Instalments and pots move inside your Mashreq account.'),
        bottom('Continue to the circle'))""",
     """        notice('Halqa never holds your money. Instalments and pots move inside your Mashreq account.'),
        bottom('Continue to the circle'))"""),
    ("""        head('Open your Raqami account'), steps(3, 3),
        title('Your committee account', 'Opened by Raqami Islamic Digital Bank inside Halqa, on your CNIC and mobile '
                                        'number.'),
        group('What Raqami checks', [""",
     """        head('Open your Raqami account'), steps(3, 3),
        hero('Account ready', '•••• 4567', 'Asaan Digital Account · Mudarabah savings'),
        group('What Raqami checked', ["""),
    ("""        card('Account ready', [('Account', 'Asaan Digital Account'), ('Savings', 'Mudarabah, profit monthly'),
                               ('Debit card', 'PayPak'), ('Number', '•••• 4567')], 2,
             'Halqa never holds your money. Instalments and pots move inside your Raqami account.'),
        bottom('Continue to the circle'))""",
     """        notice('Halqa never holds your money. Instalments and pots move inside your Raqami account.'),
        bottom('Continue to the circle'))"""),
    ("""    hero('You collect once', 'Rs&nbsp;15,000', 'Paid on your day · 8 members collect each day'),
    card('Your daily payment · Rs 450',""",
     """    hero('You collect once', 'Rs&nbsp;15,000', 'Paid on your day · 8 members collect each day'),
    notice('Hyper is experimental. Limits are agreed with %s before it opens.' % BN, 'warn', 'flask-conical'),
    card('Your daily payment · Rs 450',"""),
    ("""        row('badge-check', 'Checks', 'Daily income over 8 weeks, all checks', 'Level 3', 'ok')]),
    notice('Hyper is experimental. Limits are agreed with %s before it opens.' % BN, 'warn', 'flask-conical'),
    bottom('Choose your day'))""",
     """        row('badge-check', 'Checks', 'Daily income over 8 weeks, all checks', 'Level 3', 'ok')]),
    bottom('Choose your day'))"""),
]
for a, b in R:
    assert s.count(a) == 1, a[:70]
    s = s.replace(a, b)
io.open(p, 'w', encoding='utf-8', newline='\n').write(s)
print('ok')
