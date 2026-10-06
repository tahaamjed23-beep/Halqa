# -*- coding: utf-8 -*-
"""Maths 04: identity verification (KYC), formal and informal."""
import math, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import os
import docgen as D
from mcommon import rs, num, pct, ABOUT, formal, informal, glossary


def lev(a, b):
    prev = list(range(len(b) + 1))
    for i, ca in enumerate(a, 1):
        cur = [i]
        for j, cb in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (ca != cb)))
        prev = cur
    return prev[-1]


STD = {'M.': 'MUHAMMAD', 'MOHD': 'MUHAMMAD', 'MUHAMMED': 'MUHAMMAD', 'MOHAMMAD': 'MUHAMMAD', 'MOHAMMED': 'MUHAMMAD'}
HONORIFIC = {'MR', 'MRS', 'MS', 'DR', 'SYED', 'HAJI', 'MIAN', 'CH', 'CHAUDHRY', 'RANA', 'MALIK', 'SHEIKH'}


def norm(name):
    toks = [STD.get(t, t) for t in re.split(r'\s+', name.upper().strip())]
    toks = [t.replace('.', '') for t in toks]
    toks = [t for t in toks if t and t not in HONORIFIC]
    return ' '.join(toks)


def sim(a, b):
    a, b = norm(a), norm(b)
    return 1 - lev(a, b) / max(len(a), len(b))


def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dphi, dl = p2 - p1, math.radians(lon2 - lon1)
    h = math.sin(dphi / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dl / 2) ** 2
    return 2 * R * math.asin(math.sqrt(h))


NAMES = [('Muhammad Ali Khan', 'M. Ali Khan'), ('Ayesha Siddiqui', 'Ayesha Siddiqi'), ('Bilal Ahmed', 'Bilal Mahmood')]
NAME_ROWS = [(a, b, sim(a, b)) for a, b in NAMES]
# Islamabad G-9/2 pin against a geocoded G-9 address, and against a Rawalpindi address
PIN = (33.6938, 73.0322)
GEO_SAME = (33.6887, 73.0290)
GEO_FAR = (33.6007, 73.0679)
D_SAME = haversine(*PIN, *GEO_SAME)
D_FAR = haversine(*PIN, *GEO_FAR)
KW = dict(name=0.25, face=0.25, address=0.15, account=0.15, phone=0.10, job=0.10)
EX = dict(name=1.0, face=0.96, address=0.9, account=1.0, phone=1.0, job=0.8)
K_EX = sum(KW[k] * EX[k] for k in KW)
assert NAME_ROWS[0][2] == 1.0 and 0.9 < NAME_ROWS[1][2] < 0.95 and NAME_ROWS[2][2] < 0.8
assert D_SAME < 1.0 and D_FAR > 5.0


def band(s):
    return 'Match' if s >= 0.90 else ('Review' if s >= 0.80 else 'No match')


# ------------------------------------------------------------------ formal
f = []
f.append('<h2>1. Halqa, and the levels of verification</h2>' + ABOUT + D.para(
    'Verification scales with the risk of the product. A known committee relies on the host who knows every member; an '
    'unknown committee and Hyper rely on Halqa knowing exactly who each member is, where they live and how they earn.')
    + D.table([
        ['Level', 'Required for', 'Checks'],
        ['1', 'Known committees', 'Phone with one time passcode, application PIN, CNIC captured by camera, NADRA Verisys match, face capture with liveness'],
        ['2', 'Unknown committees', 'Level 1, plus home address, income account title match, employer or business, and a TASDEEQ report on the member&rsquo;s instruction'],
        ['3', 'Hyper, and hosts of unknown committees', 'Level 2, plus daily income for Hyper, face match at exit and other high value actions, and a field check where any flag is raised'],
    ], widths=['8%', '26%', '66%']))
f.append('<h2>2. Identity and personal details</h2>' + D.bullets([
    'The CNIC is captured by the device camera and read; the number and name are checked with NADRA through Verisys, '
    'with the citizen&rsquo;s consent. The date of birth must show the member is 18 or over and the card must be unexpired.',
    'A live face capture is matched against the photograph on the CNIC, with a liveness check so a photograph of a photograph fails.',
    'The name on the CNIC, the name on the income account and the name the member typed must all agree under the rule below.',
])
    + D.formula('sim(a, b) = 1 &minus; Lev(a, b) / max(|a|, |b|)', 'Name similarity, after upper case, standard spellings of Muhammad and removal of honorifics; Lev is the number of single letter edits between two names')
    + D.table([['Name on CNIC', 'Name compared', 'Similarity', 'Decision']]
              + [[a, b, num(s, 3), band(s)] for a, b, s in NAME_ROWS], numeric=(2,), widths=['30%', '30%', '18%', '22%'])
    + D.para('At 0.90 or more the names match; between 0.80 and 0.90 a person reviews them; below 0.80 they do not match.'))
f.append('<h2>3. Home</h2>' + D.bullets([
    'The address the member declares is compared with the addresses recorded against the CNIC, word by word, and the city must be the same.',
    'A single precise location pin, taken once at signup with permission, is compared with the declared address located on the map.',
    'Where either check is weak, the member uploads a recent electricity or gas bill, for example from IESCO, LESCO, '
    'K-Electric, SNGPL or SSGC, in their own or a family member&rsquo;s name at that address, and its reference number is '
    'checked on the utility&rsquo;s online bill service.',
])
    + D.formula('d = 2R &times; arcsin( &radic;( sin&sup2;(&Delta;&phi;/2) + cos &phi;<sub>1</sub> cos &phi;<sub>2</sub> sin&sup2;(&Delta;&lambda;/2) ) ), &nbsp; R = 6,371 km',
                'Distance between the pin and the declared address (haversine formula; &phi; is latitude, &lambda; longitude)')
    + D.table([['Distance', 'Decision'], ['1 km or less', 'Consistent'], ['1 to 5 km', 'Review'], ['More than 5 km', 'Not consistent unless explained, for example a rented home']],
              widths=['30%', '70%'])
    + D.para('Example: a pin in G-9/2, Islamabad against a declared G-9 address is %s km apart and consistent; the same pin '
             'against an address in Rawalpindi Saddar is %s km apart and fails.' % (num(D_SAME, 2), num(D_FAR, 1))))
f.append('<h2>4. Job and income</h2>' + D.table([
    ['Member', 'Evidence'],
    ['Salaried', 'The salary remitter matches the declared employer with a similarity of 0.85 or more; a payslip&rsquo;s net pay is within 5 per cent of the salary credit; optionally, confirmation from the employer&rsquo;s own email domain'],
    ['Self employed or shopkeeper', 'Daily receipts in the income account; a photograph of the business with its location; the FBR Active Taxpayers List where an NTN is declared'],
    ['Platform worker', 'Payouts from Careem, inDrive, Bykea or foodpanda arriving in the income account'],
], widths=['26%', '74%']) + D.para('The income tests themselves are set out in the Income Account Verification model, HQ-MF-03.'))
f.append('<h2>5. Screening and duplicates</h2>' + D.bullets([
    'Names are screened against the United Nations Security Council consolidated sanctions list and the list of persons '
    'proscribed in Pakistan under the Fourth Schedule of the Anti-Terrorism Act 1997, at onboarding and periodically after.',
    'One account per CNIC, per phone number and per device. Accounts that share a device, an address or a payment account '
    'are shown to the host before admission.',
]))
f.append('<h2>6. The identity confidence score</h2>'
         + D.formula('K = 0.25 s<sub>name</sub> + 0.25 s<sub>face</sub> + 0.15 s<sub>address</sub> + 0.15 s<sub>account</sub> + 0.10 s<sub>phone</sub> + 0.10 s<sub>job</sub>',
                     'Each s is the check&rsquo;s score between 0 and 1')
         + D.bullets([
             'Level 2 requires K of 0.85 or more and Level 3 requires 0.92 or more, with no hard failure.',
             'Hard failures refuse the member whatever K is: a CNIC NADRA does not verify, an age under 18, a sanctions match, or a CNIC already on another account.',
             'Example: name 1.00, face 0.96, address 0.90, account title 1.00, phone 1.00, job 0.80 gives K = %s, enough for Level 2 and for Level 3.' % num(K_EX, 3),
         ]))
f.append('<h2>7. Handling the data</h2>' + D.bullets([
    'CNIC images and face captures are encrypted at rest and every access is logged.',
    'Every consent is stored with the text version, its hash, the originating address and the time.',
    'Nothing is read from the phone beyond what each check needs: no contacts, gallery, messages or call log.',
]))
f.append('<h2>8. Technical Process</h2>' + D.steps([
    'CNIC. The number and details are sent to NADRA Verisys under the corporate agreement and the response is compared with '
    'what the member entered. A failure is a hard stop.',
    'Face. A liveness session runs on the phone camera; the captured image is compared with the CNIC photograph, and the '
    'similarity becomes the face score.',
    'Names. The names on the CNIC, the wallet title and the application are normalised, removing honorifics and standardising '
    'spellings, and compared by edit distance.',
    'Address. The typed address is placed on the map and compared with the one time location pin by great circle distance, '
    'and with the address on a utility bill.',
    'Account, phone and job. The wallet title is matched; the phone number is confirmed by passcode and may hold only one '
    'account; the job is confirmed from the income evidence.',
    'Score. K is computed, the level is set, and the name is screened against the sanctions lists. Duplicates by CNIC, phone '
    'or device are refused or shown to the host.',
    'Records. Images are encrypted at rest and every access is logged. The decision is stored with each score and the version '
    'of the rules.',
]))
f.append('<h2>9. Model Surface</h2>' + D.para(
    'K combines six scores. The figure shows the three that vary most, name, face and address, with the account, phone and job '
    'scores held at 1.00, 1.00 and 0.80 as in the example, and colours each combination by the level it reaches.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'identity.png'), 'Identity confidence by name, face and address scores. Green: K of 0.92 or more, level 3, Hyper. Amber: '
               '0.85 to 0.92, level 2, unknown committees. Red: below 0.85, not enough for an unknown committee.', '92%'))
f.append(D.summary(
    'Halqa checks that each member is who they say they are with NADRA and a live face capture, that their home is where '
    'they say it is by comparing addresses, a location pin and a utility bill, and that their job is real by matching '
    'their salary or business income to what they declared. Each check gives a score, the scores add up to one number, and '
    'the member reaches the level their committee needs only when that number is high enough and nothing has failed outright.'))
formal('04 Identity Verification Model.pdf', 'Identity Verification (KYC): Model',
       'How Halqa confirms a member&rsquo;s identity, home, job and personal details before they join an unknown committee or Hyper.',
       'HQ-MF-04', 'The payment partner, NADRA and Mr Akif Saeed', ''.join(f), running='Identity Verification Model')

# ------------------------------------------------------------------ informal
i = []
i.append(D.para('This explains how Halqa checks who a member is, where they live and what they do.'))
i.append('<h2>1. The words used</h2>' + glossary([
    ['KYC', 'Know your customer: checking that a customer is who they say they are'],
    ['NADRA Verisys', 'NADRA&rsquo;s service that confirms a CNIC&rsquo;s details, with the person&rsquo;s consent'],
    ['Liveness', 'A check that the face is a real person in front of the camera, not a photo'],
    ['Similarity', 'A score from 0 to 1 for how alike two names are. 1 means identical'],
    ['Geocoding', 'Turning an address into a point on the map'],
    ['Sanctions list', 'Names governments ban from financial services'],
]))
i.append('<h2>2. How much checking</h2>' + D.bullets([
    'Known committees: phone code, PIN, CNIC photo checked with NADRA, and a live face capture.',
    'Unknown committees: all of that, plus home, job and income account checks.',
    'Hyper: all of that, plus daily income, and face checks at important moments.',
]))
i.append('<h2>3. Names</h2>' + D.bullets([
    'Names are cleaned first: capital letters, the same spelling of Muhammad, and titles like Syed or Haji removed.',
    'Then Halqa counts how many letters must change to turn one name into the other. &ldquo;Ayesha Siddiqui&rdquo; and '
    '&ldquo;Ayesha Siddiqi&rdquo; differ by one letter, a score of %s, so they match. &ldquo;Bilal Ahmed&rdquo; and '
    '&ldquo;Bilal Mahmood&rdquo; score %s and do not.' % (num(NAME_ROWS[1][2], 2), num(NAME_ROWS[2][2], 2)),
]))
i.append('<h2>4. Home</h2>' + D.bullets([
    'The address the member types is compared with the address NADRA holds for their CNIC.',
    'A one time location pin is compared with the address on the map. Within 1 km is fine; more than 5 km fails unless explained.',
    'If in doubt, a recent electricity or gas bill for that address settles it.',
]))
i.append('<h2>5. Job</h2>' + D.bullets([
    'Salaried: the salary must come from the employer the member named.',
    'Shopkeepers and drivers: their daily takings or platform payouts must show in their account.',
]))
i.append('<h2>6. One final number</h2>' + D.para(
    'Each check gives a score from 0 to 1. Name and face count most. The weighted total must reach 0.85 for unknown '
    'committees and 0.92 for Hyper. Some things fail at once whatever the total: a CNIC NADRA cannot confirm, being under '
    '18, a sanctions match, or a CNIC already used on another account.'))
i.append('<h2>7. Model Surface</h2>' + D.para(
    'Each dot is one combination of how well the name, the face and the address matched. Green combinations are good enough for '
    'Hyper, amber for unknown committees, and red for neither.')
    + D.figure(os.path.join(D.HERE, 'out', 'figs', 'identity.png'), 'Name, face and address matches. Green: Hyper. Amber: unknown committees. Red: neither.', '92%'))
i.append('<h2>8. Process</h2>' + D.steps([
    'The CNIC is checked with NADRA.',
    'The member takes a live selfie, which is checked for liveness and matched to the CNIC photograph.',
    'The names on the CNIC, the wallet and the form are compared.',
    'The address is compared with a location pin and a utility bill.',
    'The scores are combined into one number, which sets the member&rsquo;s level.',
]))
i.append(D.summary(
    'Halqa checks the CNIC with NADRA, matches a live face to it, confirms the home with the address, a location pin and a '
    'bill, and confirms the job from where the money comes from. All of it becomes one score, and a member can only join '
    'the riskier committees when the score is high enough.'))
informal('04 Identity Verification Explained.pdf', 'Identity Verification, Explained',
         'How Halqa checks who a member is, where they live and what they do.', 'HQ-MI-04', ''.join(i),
         running='Identity Verification Explained')
print([(a, b, round(s, 3)) for a, b, s in NAME_ROWS], round(D_SAME, 3), round(D_FAR, 2), round(K_EX, 3))
