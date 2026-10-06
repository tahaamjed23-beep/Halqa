# -*- coding: utf-8 -*-
"""Pass 4: what every field needs. For each field a member or host fills in: its rule and message, its Urdu text, its
input set up and its tests."""
from common import I, sub, section

F = {
    'Sign up and sign in': [
        ('Phone number entry', 'mobile number', 'ten digits after a fixed +92, starting with 3', 'Enter a mobile number '
         'like 300 1234567', 'numeric keypad, telephone autofill, grouped as typed', 'P0'),
        ('Passcode entry', 'code', 'six digits, valid for five minutes, five attempts before a new code is needed',
         'That code is not right. Check the message or send a new one', 'one time code autofill, numeric keypad, paste '
         'accepted', 'P0'),
        ('Set the application PIN', 'PIN', 'six digits (the code accepts four to six today), refusing repeated and '
         'sequential digits such as 111111 and 123456', 'Choose six digits that are not in a row or repeated',
         'full screen numeric keypad, digits hidden', 'P0'),
        ('Confirm the application PIN', 'PIN again', 'the same six digits as before', 'The two PINs do not match. Try '
         'again', 'full screen numeric keypad, digits hidden', 'P0'),
        ('Forgotten PIN recovery', 'new PIN', 'six digits, after a fresh code to the registered number', 'Choose six '
         'digits that are not in a row or repeated', 'full screen numeric keypad', 'P0'),
        ('Sign in', 'mobile number', 'a registered number', 'No account uses this number. Create an account instead',
         'numeric keypad, telephone autofill', 'P0'),
        ('Sign in', 'PIN', 'six digits, five attempts, then a wait of fifteen minutes and a code to unlock',
         'Wrong PIN. Attempts left: the number', 'full screen numeric keypad', 'P0'),
        ('Name and date of birth', 'full name', 'as on the CNIC: letters, spaces and full stops, 3 to 60 characters',
         'Enter your name as it appears on your CNIC', 'name autofill, words capitalised', 'P0'),
        ('Name and date of birth', 'date of birth', 'aged 18 or over today', 'Halqa is for members aged 18 and over',
         'date picker with typed entry', 'P0'),
        ('Address and city', 'address', '5 to 120 characters', 'Enter your home address', 'street address autofill', 'P1'),
        ('Address and city', 'city', 'chosen from the list of cities', 'Choose your city', 'searchable list', 'P1'),
        ('Address and city', 'province', 'chosen from the list, set from the city where possible', 'Choose your province',
         'list', 'P1'),
        ('Occupation and employer', 'occupation', 'chosen from the list, with Other and a short description',
         'Choose your occupation', 'searchable list', 'P1'),
        ('Occupation and employer', 'employer', '2 to 80 characters, optional for the self employed', 'Enter your '
         'employer\'s name', 'organisation autofill', 'P1'),
        ('Income declaration', 'monthly income', 'whole rupees from Rs 1,000 to Rs 10,000,000', 'Enter your monthly income '
         'in rupees', 'numeric keypad, grouped as typed', 'P1'),
        ('Income declaration', 'income source', 'salary, business, daily wages, remittance, pension or other',
         'Choose where your income comes from', 'single choice list', 'P1'),
        ('Income verification upload', 'statement file', 'PDF, JPG or PNG, at most 5 MB, covering the last three months',
         'Upload a statement for the last three months', 'file picker and camera', 'P1'),
        ('Bank account opening consent', 'consent to share data with the bank', 'ticked before the bank\'s screens open',
         'Allow Halqa to share your details with the bank to open your account', 'check box with the text beside it',
         'P0'),
    ],
    'Identity': [
        ('CNIC manual entry', 'CNIC number', 'thirteen digits in the form 00000-0000000-0', 'Enter the 13 digits on your '
         'CNIC', 'numeric keypad, grouped as typed', 'P0'),
        ('CNIC manual entry', 'issue date', 'before today', 'Enter the date your CNIC was issued', 'date picker', 'P0'),
        ('CNIC manual entry', 'expiry date', 'after today, or Lifetime', 'Your CNIC has expired. Renew it before '
         'joining', 'date picker with a Lifetime option', 'P0'),
        ('CNIC review before submission', 'confirmation', 'each read value confirmed or corrected', 'Check each detail '
         'before you continue', 'editable fields beside the captured image', 'P0'),
        ('Bureau instruction', 'instruction to the bureau', 'ticked, naming the bureau and the purpose', 'Allow Halqa to '
         'request your report from the bureau named', 'check box with the full text', 'P1'),
    ],
    'Accounts and payment routes': [
        ('Add a bank account', 'bank', 'chosen from the list of banks', 'Choose your bank', 'searchable list', 'P1'),
        ('Add a bank account', 'IBAN', 'PK, two check digits, four letters for the bank and sixteen digits, 24 '
         'characters, passing the IBAN check', 'Enter the 24 character IBAN, for example PK36SCBL0000001123456702',
         'upper case, grouped in fours, paste accepted', 'P1'),
        ('Add a wallet account', 'wallet provider', 'chosen from the list of wallets', 'Choose your wallet', 'list', 'P1'),
        ('Add a wallet account', 'wallet number', 'a mobile number registered with that wallet', 'Enter the mobile number '
         'of your wallet', 'numeric keypad', 'P1'),
        ('Set the default collection account', 'default account', 'one of the verified linked accounts', 'Choose one '
         'account for collections', 'single choice list', 'P1'),
        ('Authorise a mandate', 'account', 'a verified account at the partner bank', 'Choose the account the instalment '
         'comes from', 'single choice list', 'P0'),
        ('Authorise a mandate', 'ceiling', 'at most one instalment', 'The ceiling cannot be more than one instalment',
         'read only, shown in rupees', 'P0'),
        ('Authorise a mandate', 'consent', 'ticked against the mandate terms', 'Read and accept the mandate terms to '
         'continue', 'check box with a link to the terms', 'P0'),
        ('Change a mandate ceiling', 'new ceiling', 'at least the instalment and at most one instalment of a larger '
         'circle the member holds', 'The ceiling must cover one instalment and no more', 'numeric keypad', 'P1'),
        ('Cancel a mandate', 'confirmation', 'the consequence read and confirmed', 'Confirm that you will pay each '
         'instalment yourself', 'confirmation with the consequence stated', 'P0'),
    ],
    'Circles': [
        ('Create a circle', 'circle name', '3 to 40 characters, not used by the host\'s other active circles',
         'Give the circle a name of 3 to 40 characters', 'text, words capitalised', 'P1'),
        ('Create a circle', 'circle type', 'Known, Unknown, Large unknown, Asset, UAE family on Mashreq, or Hyper',
         'Choose the kind of circle', 'cards to choose from', 'P1'),
        ('Create a circle', 'instalment', 'within the type\'s range: Rs 2,000 to 10,000 for Known and Unknown, Rs 10,000 '
         'to 25,000 for Large unknown, in steps of Rs 500', 'Choose an instalment within the range for this kind of '
         'circle', 'numeric keypad with the range shown', 'P1'),
        ('Create a circle', 'members', 'within the type\'s range: 6 to 12 for Known, 12 for Unknown, 20 for Large unknown',
         'Choose the number of members for this kind of circle', 'stepper', 'P1'),
        ('Create a circle', 'cadence', 'monthly, or weekly for Known circles', 'Choose how often members pay',
         'single choice', 'P1'),
        ('Create a circle', 'start month', 'the next month or later', 'Choose a start month from next month on',
         'month picker', 'P1'),
        ('Create a circle', 'due day', 'the 8th of the month for salary circles', 'Salary circles fall due on the 8th',
         'read only', 'P1'),
        ('Create a circle', 'order of turns', 'fixed by the host or by ballot, always inside the score bands', 'Choose how '
         'the order of turns is set', 'single choice', 'P1'),
        ('Create a circle', 'joining rule', 'by invitation, with the host admitting each member', 'Choose who may join',
         'single choice', 'P1'),
        ('Join a circle', 'invitation code', 'HLQ and eight letters or digits', 'Enter the code the host sent you',
         'upper case, paste accepted, QR scan', 'P0'),
        ('Seat chooser', 'seat', 'only seats open to the member\'s score band; new members the last three', 'This seat '
         'needs a higher score; choose from the seats shown', 'grid of seats with the reason on each closed one', 'P0'),
        ('Join a circle', 'undertaking acceptance', 'ticked after the undertaking is shown in full', 'Read and accept the '
         'undertaking to join', 'check box', 'P0'),
        ('Join a circle', 'mutual guarantee acceptance', 'ticked after the guarantee is shown in full', 'Read and accept '
         'the guarantee to join', 'check box', 'P0'),
        ('Join a circle', 'key fact statement acceptance', 'ticked after the key fact statement is shown', 'Read and accept '
         'the key facts to join', 'check box', 'P0'),
        ('Signature capture', 'signature', 'drawn, not empty, with a minimum length of stroke', 'Sign in the box',
         'drawing pad with clear and done', 'P0'),
        ('Withdraw before the start', 'confirmation', 'within 24 hours of joining and before the first round',
         'You can withdraw at no cost until the first round', 'confirmation', 'P0'),
    ],
    'Host': [
        ('Applicant detail', 'admission decision', 'admit or decline; a reason is required to decline', 'Give a reason '
         'for declining', 'two buttons and a reason list', 'P1'),
        ('Removal against the published test', 'reason', 'one of the published removal grounds', 'Choose the ground for '
         'removal', 'list', 'P1'),
        ('Member vote on a removal', 'vote', 'for or against, once per member', 'Choose for or against', 'two buttons',
         'P1'),
        ('Reminder composer', 'message', 'at most 300 characters and no other member\'s details', 'Keep the reminder short '
         'and about the circle', 'text area with a counter', 'P2'),
        ('Order of turns assignment, fixed or by ballot', 'order', 'every seat filled once, inside the score bands',
         'Each seat needs one member allowed to take it', 'drag to order, or run the ballot', 'P1'),
        ('Circle dissolution', 'confirmation', 'only before the first payout, with every member told', 'A circle can be '
         'closed only before the first payout', 'confirmation with PIN', 'P2'),
    ],
    'Money': [
        ('Payment method chooser', 'method', 'the bank\'s direct debit, a wallet or card through the PSP, Raast, or by '
         'hand', 'Choose how to pay', 'list with the charge beside each', 'P0'),
        ('Pay', 'amount', 'the instalment, or a part of it of at least Rs 500 where partial payment is allowed', 'Pay at '
         'least Rs 500, or the whole instalment', 'numeric keypad with the instalment prefilled', 'P0'),
        ('Dispute a payment', 'reason', 'chosen from the list', 'Choose what went wrong', 'list', 'P0'),
        ('Dispute a payment', 'details', '10 to 1,000 characters', 'Describe what happened in a few words', 'text area',
         'P0'),
        ('Dispute a payment', 'attachment', 'PDF, JPG or PNG, at most 5 MB', 'Attach a file of 5 MB or less',
         'file picker and camera', 'P1'),
        ('Payout destination confirmation', 'account', 'a verified account whose title matches the member', 'Choose a '
         'verified account in your name', 'single choice list', 'P0'),
        ('Guarantee cheque registration', 'cheque number', 'the digits on the cheque', 'Enter the cheque number', 'numeric '
         'keypad', 'P2'),
        ('Guarantee cheque registration', 'cheque amount', 'equal to the amount stated in the undertaking', 'The cheque '
         'must be for the amount stated', 'read only', 'P2'),
    ],
    'Recovery and leaving': [
        ('Hardship declaration', 'reason', 'chosen from the list, with Other', 'Choose the reason', 'list', 'P1'),
        ('Hardship declaration', 'proposed date', 'within 30 days', 'Choose a date within 30 days', 'date picker', 'P1'),
        ('Revised date agreement', 'date', 'one of the dates the plan allows', 'Choose one of the dates offered',
         'single choice', 'P1'),
        ('Exit ladder chooser', 'rung', 'one of the rungs open to this member at this point in the circle', 'Choose how '
         'you would like to leave', 'cards with the arithmetic on each', 'P1'),
        ('Exit ladder chooser', 'reason', 'chosen from the list', 'Choose a reason', 'list', 'P2'),
        ('Seat transfer to a replacement', 'replacement\'s number', 'a registered member allowed to take the seat',
         'This member cannot take the seat; the reason is shown', 'numeric keypad and contacts not used', 'P1'),
    ],
    'Rewards and marketplace': [
        ('Redeem points against a fee', 'points', 'at most the balance and at most the fee due', 'You can use up to the '
         'number of points shown', 'numeric keypad', 'P2'),
        ('Buy points (Mashreq)', 'amount', 'within the daily and monthly limits agreed with the bank', 'The most you can '
         'buy today is shown', 'numeric keypad', 'P2'),
        ('Cart', 'quantity', 'one to the stock available', 'Only the number shown is in stock', 'stepper', 'P2'),
        ('Checkout with points', 'delivery address', '5 to 120 characters, with city', 'Enter the delivery address',
         'address autofill', 'P2'),
        ('Checkout with points', 'contact number', 'a Pakistani mobile number', 'Enter a mobile number for delivery',
         'numeric keypad', 'P2'),
        ('Return request', 'reason', 'chosen from the merchant\'s list', 'Choose the reason for the return', 'list', 'P2'),
        ('Create a turn listing', 'asking price in points', 'at most 100 per cent of the pot', 'The price cannot be more '
         'than the pot', 'numeric keypad with the pot shown', 'P2'),
        ('Make an offer', 'offer in points', 'at most 100 per cent of the pot and at most the buyer\'s balance after any '
         'purchase', 'Offer no more than the pot', 'numeric keypad', 'P2'),
    ],
    'Support and settings': [
        ('Contact support', 'category', 'chosen from the list', 'Choose a topic', 'list', 'P1'),
        ('Contact support', 'subject', '5 to 80 characters', 'Add a short subject', 'text', 'P1'),
        ('Contact support', 'description', '10 to 2,000 characters', 'Describe the problem in a few words', 'text area',
         'P1'),
        ('Contact support', 'attachments', 'at most three files of 5 MB each', 'Attach up to three files of 5 MB or less',
         'file picker and camera', 'P2'),
        ('Complaint form', 'category', 'the categories agreed with the bank', 'Choose what the complaint is about',
         'list', 'P1'),
        ('Complaint form', 'description', '10 to 2,000 characters', 'Describe the complaint', 'text area', 'P1'),
        ('Dispute a reported record', 'record', 'one of the member\'s reported records', 'Choose the record', 'list',
         'P1'),
        ('Dispute a reported record', 'reason', 'chosen from the list, with details', 'Say what is wrong with the record',
         'list and text area', 'P1'),
        ('Notification preferences', 'each switch', 'financial alerts locked on; marketing off by default', 'Payment '
         'alerts stay on for your safety', 'switches', 'P1'),
        ('Language', 'language', 'English or Urdu', 'Choose a language', 'single choice', 'P1'),
        ('Appearance', 'theme', 'system, light or dark', 'Choose a theme', 'single choice', 'P2'),
        ('Appearance', 'text size', 'four sizes', 'Choose a text size', 'slider with a preview', 'P2'),
        ('Appearance', 'photo', 'JPG or PNG, at most 5 MB, cropped to a square', 'Choose a photo of 5 MB or less',
         'camera or gallery with a crop step', 'P3'),
        ('Data export request', 'format', 'PDF or a spreadsheet', 'Choose a format', 'single choice', 'P1'),
        ('Account closure', 'confirmation', 'allowed only with no circle owed; PIN required', 'Close every circle '
         'before closing the account', 'confirmation with PIN', 'P1'),
        ('Search', 'query', 'at least two characters', 'Type at least two letters', 'search keyboard', 'P2'),
        ('Statement', 'date range', 'start before end, at most twelve months', 'Choose dates within twelve months',
         'date range picker', 'P1'),
        ('Transaction PIN set up', 'transaction PIN', 'six digits, different from the application PIN',
         'Choose six digits different from your application PIN', 'full screen numeric keypad', 'P0'),
        ('Transaction PIN entry', 'transaction PIN', 'five attempts, then financial actions locked for fifteen minutes',
         'Wrong PIN. Attempts left: the number', 'full screen numeric keypad', 'P0'),
        ('Hyper design chooser', 'design', 'Design 1 or Design 2, with the daily amount shown', 'Choose a design',
         'two cards', 'P2'),
        ('Hyper design chooser', 'collection day', 'one of the open days', 'Choose a day that is still open', 'calendar',
         'P2'),
    ],
}


# The keypad for setting and confirming the application PIN is item 81.
COVERED_INPUT = {('Set the application PIN', 'PIN'), ('Confirm the application PIN', 'PIN again')}


def build():
    subs = []
    k = 1
    for group, rows in F.items():
        items = []
        for screen, field, rule, msg, inp, pri in rows:
            n = '%s, %s' % (screen, field)
            items.append(I('%s: rule: %s; message: "%s"' % (n, rule, msg), 'field', 'Claude', pri))
            items.append(I('%s: Urdu label, hint and message, by a translator' % n, 'field', 'Translator', pri))
            if (screen, field) not in COVERED_INPUT:
                items.append(I('%s: input set up: %s' % (n, inp), 'field', 'Claude', pri))
            items.append(I('%s: tests for a valid value, an invalid value and each boundary' % n, 'tests', 'Claude', pri))
        subs.append(sub('AD%d' % k, group, items))
        k += 1
    extra = [
        I('Create a circle: replace the creation schema\'s memberCap of 3 to 150, cadence presets, reinvestRatio, '
          'riskTolerance and depositCoverageBps with the six types and their limits', 'routes/committees.ts:185', 'Claude',
          'P0', 2),
        I('Create a circle: remove the prototype limit of Rs 100,000,000 on a contribution and apply the type ranges',
          'routes/committees.ts:187', 'Claude', 'P0'),
        I('Sign up: the PIN rule tightened from any four to six digits to exactly six, with repeated and sequential '
          'digits refused', 'routes/auth.ts:75', 'Claude', 'P1'),
        I('One validation library shared by the application and the interface service, so a rule is written once',
          'lib/validate.ts', 'Claude', 'P1', 2),
    ]
    subs.append(sub('AD%d' % k, 'Rules in Code', extra))
    return section('AD', 'Fields', subs, 'Each field a member or host fills in, with its rule and message, its Urdu text, '
                                         'its input set up and its tests.', loop=4)
