# -*- coding: utf-8 -*-
"""
Halqa: the presentation for Mashreq Bank Pakistan, second version (29 September 2026).

21 slides for speaking: varied layouts, formal line diagrams instead of boxes and emoji-like icons, sources shown on
each slide, talking points in the speaker notes. Usage: python pres2_build.py [out.pptx]
"""
import os, sys, math

HERE = os.path.dirname(os.path.abspath(__file__))
G = {'__file__': os.path.join(HERE, 'd2_lib.py'), '__name__': 'pres2'}
exec(compile(open(os.path.join(HERE, 'd2_lib.py'), encoding='utf-8').read(), 'd2_lib.py', 'exec'), G)
globals().update({k: v for k, v in G.items() if not k.startswith('__')})

OUTP = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, 'Halqa-Presentation-2.pptx')
PM = 0.7
PW = W - 2 * PM
NUM = [0]
TINT = C('F7FAF3')


def say(sl, text):
    sl.notes_slide.notes_text_frame.text = text


def pslide(title, statement=None, bg=None, logo=True, stmt_size=22, stmt_w=11.0, title_color=None):
    sl = prs.slides.add_slide(BLANK)
    NUM[0] += 1
    if bg is not None:
        rect(sl, 0, 0, W, H, bg)
    tb(sl, PM, 0.48, 9.6, 0.6, title, size=28, color=title_color or (INK if bg == LIME else L700), font=DISPLAY)
    if statement:
        tb(sl, PM, 1.12, stmt_w, 1.0, statement, size=stmt_size, color=INK, spacing=1.08)
    if logo:
        lg = pic(sl, LOGO, 0, 0.54, h=0.34)
        lg.left = E(W - PM) - lg.width
    tb(sl, W - PM - 0.6, 7.02, 0.6, 0.3, str(NUM[0]), size=11, color=INK if bg == LIME else GREY, align=R)
    return sl


def sources(sl, items, y=6.62, dark=False):
    """Numbered sources, readable: 10.5 pt."""
    txt = '   '.join('%d  %s' % (i + 1, s) for i, s in enumerate(items))
    rule(sl, PM, y - 0.06, PW - 0.9, INK2 if dark else RULE, 0.75)
    tb(sl, PM, y, PW - 0.9, 0.42, [[('Sources   ', dict(size=10, bold=True, color=INK if dark else L700)),
                                   (txt, dict(size=10, color=INK2 if dark else GREY))]], spacing=1.04)


def dot(sl, x, y, d=0.16, filled=True, color=L700):
    return oval(sl, x, y, d, color if filled else WHITE, line=color, lw=1.25)


def ref(n):
    return ' [%s]' % n


# ================================================================ 1 COVER ===
sl = prs.slides.add_slide(BLANK)
NUM[0] += 1
rect(sl, 8.6, 0, W - 8.6, H, LIME)
ph = phone(sl, 'home', 0, 0.55, h=6.4)
ph.left = E(8.6 + (W - 8.6) / 2) - ph.width // 2
lg = pic(sl, LOGO, PM, 0.8, h=0.6)
vrule(sl, PM + lg.width / 914400.0 + 0.35, 0.62, 0.95, GREY_LT, 1.0)
pic(sl, MQ_LOGO, PM + lg.width / 914400.0 + 0.7, 0.5, h=1.15)
tb(sl, PM, 2.45, 7.6, 1.7, 'Committee savings, held and moved by a bank', size=40, color=INK, font=DISPLAY,
   spacing=0.98)
tb(sl, PM, 4.35, 7.4, 0.5, 'A proposal for Mashreq Bank Pakistan', size=20, color=L700)
tb(sl, PM, 6.0, 6, 0.35, 'Taha Amjed, Chairman, Halqa', size=14, bold=True)
tb(sl, PM, 6.38, 6, 0.3, DATE, size=12, color=GREY)
say(sl, 'Opening, 30 seconds. Halqa takes the committee, the savings habit most Pakistani families already use, and runs '
        'it inside a bank. Mashreq holds and moves every rupee; Halqa runs the circle. We will cover the market, the '
        'problem, the proposal, what each side gains, how it works, how defaults are prevented and recovered, the money, '
        'the competition, the evidence, why now, growth, readiness, a one month pilot and six requests.')

# ================================================================ 2 HOW A COMMITTEE WORKS ===
sl = pslide('How a Committee Works', 'Everyone pays the same amount each month; each month one member takes the whole '
                                     'pot.')
cx, cy, rr = 3.55, 4.35, 1.75
for k in range(12):
    a = math.radians(k * 30 - 90)
    px, py = cx + rr * math.cos(a), cy + rr * math.sin(a)
    on = k == 0
    oval(sl, px - 0.27, py - 0.27, 0.54, LIME if on else WHITE, line=L700 if on else GREY_LT, lw=1.25)
    tb(sl, px - 0.27, py - 0.27, 0.54, 0.54, str(k + 1), size=13, bold=on, color=INK if on else GREY, align=CEN,
       anchor=MIDDLE)
oval(sl, cx - 1.05, cy - 1.05, 2.1, None, line=RULE, lw=0.75)
tb(sl, cx - 1.1, cy - 0.5, 2.2, 0.4, 'the pot', size=13, color=GREY, align=CEN)
tb(sl, cx - 1.3, cy - 0.15, 2.6, 0.6, 'Rs 120,000', size=27, color=L700, font=DISPLAY, align=CEN)
tb(sl, cx - 2.2, cy + rr + 0.42, 4.4, 0.35, 'Month 1: member 1 collects. Month 12: member 12.', size=12, color=GREY,
   align=CEN)
x0 = 7.1
steps_ = [('Each month', 'all 12 members pay Rs 10,000'), ('One member', 'collects Rs 120,000, in a fixed order'),
          ('After 12 months', 'everyone has paid Rs 120,000 and received Rs 120,000'),
          ('Early turns', 'work like an advance with no interest'), ('Late turns', 'work like saving with a deadline')]
for i, (t, d) in enumerate(steps_):
    y = 2.45 + i * 0.82
    tb(sl, x0, y, 2.4, 0.7, t, size=18, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x0 + 2.45, y, W - PM - x0 - 2.45, 0.7, d, size=16, anchor=MIDDLE, spacing=1.05)
    if i < 4:
        rule(sl, x0, y + 0.76, W - PM - x0)
say(sl, 'For anyone who has not been in one: a committee, also called a kameti or BC. Twelve people each pay Rs 10,000 '
        'a month; each month one of them takes the whole Rs 120,000. By the end everyone has paid and received exactly '
        'the same. The member who collects early has effectively been advanced money without interest; the member who '
        'collects late has saved under a deadline the group enforces. It works because people know each other.')

# ================================================================ 3 THE MARKET ===
sl = pslide('The Market', 'Committees are one of the largest savings systems in Pakistan, almost entirely outside the '
                          'banks.')
big = [('34% to 41%', 'of Pakistanis save through committees' + ref('1, 2')),
       ('About 100 million', 'people, on the higher estimate' + ref(2)),
       ('Rs 4 trillion', 'estimated to flow through committees each year' + ref(1))]
for i, (n_, t) in enumerate(big):
    y = 2.3 + i * 1.3
    tb(sl, PM, y, 5.4, 0.75, n_, size=40, color=L700, font=DISPLAY)
    tb(sl, PM, y + 0.72, 5.4, 0.45, t, size=15, color=INK)
x0 = 6.6
tb(sl, x0, 2.3, W - PM - x0, 0.4, 'A typical committee', size=18, color=INK, font=DISPLAY)
rule(sl, x0, 2.78, W - PM - x0, L700, 1.25)
typ = [('Members', 'usually family, neighbours or colleagues; digital versions run 3 to 12' + ref(3)),
       ('Cycle', 'monthly in 91 per cent of cases' + ref(4)),
       ('Instalment', 'about US$18 a cycle on average in the 2013 national survey, from under US$1 to US$470' + ref(4)),
       ('Who', 'women take part at twice the rate of men' + ref(5)),
       ('Where', '56 per cent of adults have a committee within one kilometre of home' + ref(6))]
for i, (t, d) in enumerate(typ):
    y = 2.9 + i * 0.66
    tb(sl, x0, y, 1.55, 0.6, t, size=14, bold=True, color=L700, anchor=MIDDLE)
    tb(sl, x0 + 1.6, y, W - PM - x0 - 1.6, 0.6, d, size=14, anchor=MIDDLE, spacing=1.04)
    rule(sl, x0, y + 0.63, W - PM - x0)
sources(sl, ['Karandaaz and Oraan, as reported by Dawn, 12 December 2022',
             'Oraan case study, Pakistan Institute of Corporate Governance, 2024',
             'Oraan committees run 5 or 10 months; JazzCash allows 3 to 12 members',
             'Financial Inclusion Insights Pakistan tracker, sample of 6,000',
             'Financial Inclusion Insights', 'Financial Inclusion Insights, wave 5, 2017'])
say(sl, 'The size of the habit. Karandaaz puts committee use at 34 per cent of Pakistanis; Oraan\'s research puts it at '
        '41 per cent, which Oraan equates to about 100 million people. Oraan estimates about Rs 4 trillion a year flows '
        'through committees. These are estimates; there is no official count, which is itself part of the problem.\n\n'
        'A typical committee has 5 to 12 people, nine in ten are monthly, and in the national survey the average '
        'instalment was about US$18 a cycle, with a very wide range. Women take part at twice the rate of men, and more '
        'than half of adults have a committee within a kilometre of home.')

# ================================================================ 4 THE PROBLEM ===
sl = pslide('The Problem', 'Committees run on trust and cash, outside any bank.')
cols = [('12%', 'of committee users have lost money to an organiser or member fraud' + ref(1)),
        ('None', 'of years of on time payments count towards a credit record'),
        ('4%', 'of savers keep savings in a bank or other formal institution' + ref(1)),
        ('63%', 'of savers keep cash at home' + ref(1))]
cw4 = (PW - 3 * 0.45) / 4
for i, (n_, t) in enumerate(cols):
    x = PM + i * (cw4 + 0.45)
    rule(sl, x, 2.55, cw4, RED if i < 2 else GREY, 2.0)
    tb(sl, x, 2.75, cw4, 1.0, n_, size=48, color=INK, font=DISPLAY)
    tb(sl, x, 3.85, cw4 - 0.1, 1.4, t, size=16, spacing=1.08)
tb(sl, PM, 5.5, PW, 0.6, 'In 2022 one organiser on Facebook collected about Rs 420 million across 117 committees and '
   'disappeared' + ref(2) + '.', size=15, color=INK2)
sources(sl, ['Financial Inclusion Insights surveys of Pakistan', 'Dawn, 12 December 2022'])
say(sl, 'What goes wrong. One person holds the cash, and 12 per cent of users say they have lost money to an organiser or '
        'a member; in 2022 one Facebook organiser took about Rs 420 million across 117 committees. Nothing is recorded, '
        'so paying on time for ten years builds no credit record. And the money stays outside banks: only 4 per cent of '
        'savers use a formal institution while 63 per cent keep cash at home.')

# ================================================================ 5 PROPOSAL ===
sl = pslide('The Proposal', 'Halqa runs the committee. Mashreq holds and moves every rupee, under the State Bank’s '
                            'regulation.')
# three nodes on a line, drawn as a formal schematic
ny = 3.9
nodes = [(PM + 1.2, 'Members', 'pay from their own Mashreq accounts'),
         (PM + 5.9, 'Halqa', 'rules, order of turns, checks, reminders, records'),
         (PM + 10.6, 'Mashreq Bank Pakistan', 'accounts, direct debit, payouts, savings, cover, credit reporting')]
for i, (x, t, d) in enumerate(nodes):
    oval(sl, x - 0.55, ny - 0.55, 1.1, LIME_XLT if i == 1 else WHITE, line=MQ if i == 2 else L700, lw=1.5)
    if i == 0:
        icon(sl, 'users', x - 0.28, ny - 0.28, 0.56, L700, 1.75)
    elif i == 1:
        pic(sl, MARK, x - 0.3, ny - 0.3, h=0.6)
    else:
        pic(sl, MQ_LOGO, x - 0.34, ny - 0.4, h=0.78)
    tb(sl, x - 1.9, ny + 0.7, 3.8, 0.4, t, size=17, bold=True, align=CEN)
    tb(sl, x - 1.9, ny + 1.1, 3.8, 0.8, d, size=13, color=GREY, align=CEN, spacing=1.04)
line(sl, PM + 1.8, ny - 0.1, PM + 5.3, ny - 0.1, L700, 1.25, dash=True)
tb(sl, PM + 2.2, ny - 0.5, 2.7, 0.35, 'the application', size=12, color=GREY, align=CEN)
line(sl, PM + 6.5, ny - 0.1, PM + 10.0, ny - 0.1, L700, 1.25, dash=True, arrow=True)
tb(sl, PM + 6.9, ny - 0.5, 2.7, 0.35, 'instructions only', size=12, color=GREY, align=CEN)
# money arc below: straight line from members to mashreq under everything
line(sl, PM + 1.2, ny + 1.95, PM + 1.2, ny + 2.2, L700, 2.5)
line(sl, PM + 1.2, ny + 2.2, PM + 10.6, ny + 2.2, L700, 2.5)
line(sl, PM + 10.6, ny + 2.2, PM + 10.6, ny + 1.95, L700, 2.5, arrow=True)
tb(sl, PM + 3.4, ny + 2.25, 5.0, 0.4, 'the money: member to Mashreq to member; never through Halqa', size=13, bold=True,
   color=L700, align=CEN)
tb(sl, PM, 2.25, PW, 0.5, 'Halqa is the system. The bank is the machine.', size=20, color=L700, font=DISPLAY)
say(sl, 'The proposal is a division of work. Halqa is the system: who may join, the order of turns, the checks, '
        'reminders, the records, late payment and exits. Mashreq is the machine: accounts, the direct debit, payouts, '
        'savings, cover and credit reporting.\n\n'
        'The money line at the bottom is the point: it goes from the member to Mashreq and back to a member, never '
        'through Halqa. A company that holds public money is taking deposits, which only a bank may do; and a system '
        'like this needs State Bank regulation. Working inside Mashreq\'s licence answers both. Halqa would operate as '
        'Mashreq\'s service provider under the State Bank\'s outsourcing framework.')

# ================================================================ 6 MUTUAL BENEFIT ===
sl = pslide('Mutual Benefit', 'Members get a safe committee and a credit record. Mashreq gets deposits, customers in '
                              'groups and a lending book.')
caption(sl, PM, 2.3, 6.2, 'Deposits, Rs billion')
chart(sl, XL_CHART_TYPE.BAR_CLUSTERED, PM - 0.05, 2.6, 6.3, 2.6,
      ['Mashreq, 30 June 2026', 'Added by 100,000 members', 'Added by 1,000,000 members'],
      [('Rs bn', [8.5, 2.5, 25])], point_colors=[MQ, LIME, L700], fmt='General', gap=45, size=13,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=29)
tb(sl, PM, 5.25, 6.2, 0.6, 'Assumes an average balance of Rs 25,000 a member once salaries move to Mashreq; Mashreq’s '
   'own figures replace it.', size=11, color=GREY, spacing=1.04)
x0 = 7.3
tb(sl, x0, 2.3, 2.5, 0.4, 'For Mashreq', size=16, bold=True, color=MQ)
tb(sl, x0 + 2.75, 2.3, 2.5, 0.4, 'For members', size=16, bold=True, color=L700)
rule(sl, x0, 2.75, W - PM - x0, INK2, 1.0)
mb = [('Customers arrive in groups of 6 to 20', 'A safe committee, no organiser holding cash'),
      ('Salary and savings balances', 'Automatic payment on payday'),
      ('Women and overseas Pakistanis' + ref(2), 'Profit on balances returned as points'),
      ('A lending book: repayment records for every member', 'A credit record from the first payment'),
      ('Takaful and financing income', 'Financing for a motorcycle or machine after a clean circle')]
for i, (a_, b_) in enumerate(mb):
    y = 2.85 + i * 0.72
    tb(sl, x0, y, 2.6, 0.66, a_, size=13, anchor=MIDDLE, spacing=1.04)
    tb(sl, x0 + 2.75, y, W - PM - x0 - 2.75, 0.66, b_, size=13, anchor=MIDDLE, spacing=1.04)
    rule(sl, x0, y + 0.69, W - PM - x0)
sources(sl, ['Mashreq Bank Pakistan, half year accounts to 30 June 2026: deposits Rs 8,515 million; over 350,000 customers; '
             'no advances', 'Financial Inclusion Insights; Mashreq: over 9,000 accounts for non resident Pakistanis'])
say(sl, 'Both sides gain. For Mashreq: customers arrive as a group of six to twenty, each opening an account; salaries and '
        'instalments sit in Mashreq accounts; the members are mostly women, and families in the UAE can join through '
        'Mashreq\'s non resident accounts. Mashreq reported no advances at 30 June 2026; every committee payment is a '
        'repayment record it can lend against.\n\n'
        'On our assumption of Rs 25,000 average balance, 100,000 members would add about Rs 2.5 billion of deposits, '
        'against Rs 8.5 billion at 30 June. Mashreq\'s own data should replace our assumption.\n\n'
        'For members: no organiser holding cash, automatic payment on payday, profit returned as points, a credit '
        'record, and a route to financing.')

# ================================================================ 7 MASHREQ PRODUCTS ===
sl = pslide('Mashreq Products in Use', 'Each step of a committee uses a Mashreq product that already exists, plus two '
                                       'new lines.')
life = [('Open', 'Account opened in the Halqa application in about 5 minutes', 'Mashreq NEO current account; PayPak or '
                                                                             'Mastercard debit card'),
        ('Salary in', 'Salary arrives; the instalment waits for the due date',
         'NEO Islamic Current Profit Account: mudaraba, profit on the daily closing balance, paid monthly, up to 5%'),
        ('Due date', 'Mashreq debits the instalment', 'Direct debit mandate'),
        ('Payout', 'The pot is paid the same day', 'Free instant transfer to the member’s account'),
        ('Save on', 'After the circle, savings stay with Mashreq', 'NEO Islamic Savings Account, up to 11.5%; NEO '
                                                                    'Savings Account, up to 10%'),
        ('Abroad', 'Family members in the UAE join', 'Mashreq Pakistan Account for non residents, opened from the UAE '
                                                     'application')]
ty = 2.55
rule(sl, PM, ty, PW, L700, 2.0)
cw6 = PW / 6
for i, (t, d, prod) in enumerate(life):
    x = PM + i * cw6
    oval(sl, x, ty - 0.11, 0.22, LIME, line=L700)
    tb(sl, x, ty + 0.25, cw6 - 0.2, 0.4, t, size=16, bold=True, color=L700)
    tb(sl, x, ty + 0.68, cw6 - 0.2, 0.9, d, size=12, color=GREY, spacing=1.04)
    tb(sl, x, ty + 1.6, cw6 - 0.2, 1.35, prod, size=12, color=INK, spacing=1.04)
rule(sl, PM, 5.62, PW, RULE, 0.75)
tb(sl, PM, 5.72, 2.2, 0.4, 'New lines', size=16, bold=True, color=MQ)
tb(sl, PM + 2.2, 5.72, 4.8, 0.8, [[('Cover.  ', dict(size=13, bold=True)),
                                   ('Takaful through a partner operator, or a guarantee or insurance, as Mashreq '
                                    'chooses.', dict(size=13))]], spacing=1.05)
tb(sl, PM + 7.2, 5.72, PW - 7.2, 0.8, [[('Asset financing.  ', dict(size=13, bold=True)),
                                        ('Ijarah for motorcycles and machines bought through asset circles; a modaraba '
                                         'if Mashreq prefers.', dict(size=13))]], spacing=1.05)
sources(sl, ['Mashreq NEO Pakistan product pages and rate sheets, read 29 September 2026',
             'Rates are up to figures published by Mashreq'])
say(sl, 'This slide matters to the product team: almost everything uses products Mashreq already has.\n\n'
        'The account opens inside our application through Mashreq\'s own onboarding, with a debit card. Between payday and '
        'the due date the instalment sits in the Islamic Current Profit Account, which works on a mudaraba basis and pays '
        'profit on the daily closing balance, so even a week earns something; that profit comes back to members as '
        'points at the end of the circle. The direct debit collects on the due date and the payout is a free instant '
        'transfer. After the circle, savings can stay in the Islamic Savings Account. Family members in the UAE join '
        'through the Mashreq Pakistan Account opened from the UAE application.\n\n'
        'Two new lines: cover for defaults, through a takaful partner or Mashreq\'s own guarantee or insurance; and asset '
        'financing on an ijarah basis for motorcycles and machines, the first step to a lending book.')

# ================================================================ 8 HOW IT WORKS ===
sl = pslide('How It Works', 'Four steps for a member, all inside the Halqa application.', bg=TINT)
steps = [('circles', '1', 'Join a circle of friends, family or colleagues'), ('autopay', '2', 'Pay automatically on '
                                                                                             'the due date'),
         ('activity', '3', 'Collect the whole pot when the turn comes'), ('credit', '4', 'Build a credit record with '
                                                                                         'every payment')]
pw_, ph_h = 2.05, 4.3
gap_ = (PW - 4 * pw_) / 3
for i, (nm, n_, t) in enumerate(steps):
    x = PM + i * (pw_ + gap_)
    ph = phone(sl, nm, x, 2.1, h=ph_h)
    ph.left = E(x + (pw_ - ph.width / 914400.0) / 2)
    tb(sl, x - 0.05, 6.5, 0.45, 0.5, n_, size=24, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x + 0.4, 6.5, pw_ + 0.15, 0.55, t, size=13, bold=True, anchor=MIDDLE, spacing=1.03)
say(sl, 'The application as it runs today, in preview. One, join a circle and pick a turn from those open to you. Two, '
        'the instalment is debited automatically on the due date; if salary is late, the debit is retried each morning '
        'for up to five days. Three, on your turn the whole pot arrives the same day. Four, every payment is reported, '
        'so committee payments finally count towards a credit record. Messages come on WhatsApp in Roman Urdu first.')

# ================================================================ 9 ONBOARDING AND ENGINES ===
sl = pslide('Onboarding and Verification', 'Mashreq checks who the customer is. Halqa’s engines then check the '
                                           'person, the income and what the member can afford.')
stages = [('1', 'Signup', 'Phone number and one time passcode; an app PIN on every open'),
          ('2', 'Bank account', 'Mashreq onboarding: CNIC, NADRA biometric check, customer due diligence'),
          ('3', 'Identity engine', 'Names matched across CNIC, account and application (0.90 or more passes; 0.80 to '
                                   '0.90 reviewed); live face match; home pin against address; job against income'),
          ('4', 'Income engine', 'Reads the account income arrives in: salary from one employer on about the same day '
                                 'each month; for Hyper, Rs 1,000 or more on five days a week for eight weeks; own '
                                 'transfers and loans excluded; learns the payday'),
          ('5', 'Affordability engine', 'All instalments within a third of verified income, 40 per cent with other '
                                        'loans; from the fourth circle, total still owed at most a year of income'),
          ('6', 'Score and seat', 'Score 300 to 850 decides which turns are open; a new member starts in the last '
                                  'three')]
ty = 2.9
rule(sl, PM, ty, PW, L700, 2.0)
cw_ = PW / 6
for i, (n_, t, d) in enumerate(stages):
    x = PM + i * cw_
    oval(sl, x, ty - 0.2, 0.4, L700 if i >= 2 else WHITE, line=L700, lw=1.5)
    tb(sl, x, ty - 0.2, 0.4, 0.4, n_, size=13, bold=True, color=WHITE if i >= 2 else L700, align=CEN, anchor=MIDDLE)
    tb(sl, x, ty + 0.35, cw_ - 0.15, 0.45, t, size=15, bold=True, color=L700 if i >= 2 else INK)
    tb(sl, x, ty + 0.85, cw_ - 0.2, 2.8, d, size=12, spacing=1.06)
tb(sl, PM + 2 * cw_, ty - 0.72, 4 * cw_, 0.35, 'Halqa’s engines', size=12, bold=True, color=L700)
line(sl, PM + 2 * cw_, ty - 0.35, PM + 6 * cw_ - 0.2, ty - 0.35, L700, 1.0)
tb(sl, PM, 6.3, PW, 0.6, 'Only results are stored: never raw biometric images, card numbers or bank passwords. Levels: '
   'family and office circles need level 1, unknown circles level 2, Hyper level 3.', size=13, color=INK2,
   spacing=1.05)
say(sl, 'How a member gets in. After signup, Mashreq opens the account with its own checks: CNIC, NADRA biometric '
        'verification and due diligence. Then three Halqa engines run.\n\n'
        'The identity engine compares the names on the CNIC, the bank account and the application, adds a live face '
        'match, checks the home location against the declared address, and the declared job against the income seen.\n\n'
        'The income engine reads the account the income arrives in. A salary shows as payments from the same employer on '
        'about the same day each month. For daily circles we need Rs 1,000 or more on five days a week for eight weeks. '
        'Transfers from the member\'s own accounts and loans do not count. It also learns the payday, so the debit '
        'lands when the money is there.\n\n'
        'The affordability engine keeps all instalments within a third of verified income, and within 40 per cent with '
        'other loans, the limit the State Bank uses for consumer finance. The score then decides which turns are open.')

# ================================================================ 10 TYPES ===
sl = pslide('Committee Types', 'Each type asks more of its members as the risk rises.')
types = ['Family', 'Office', 'Market', 'Unknown', 'Large unknown', 'Asset', 'UAE family', 'Hyper']
rows = [('Members', ['6', '12', '10', '12', '20', '12', '6 to 12', '390 to 400']),
        ('Instalment', ['Rs 5,000', 'Rs 10,000', 'Rs 2,000', 'Rs 10,000', 'Rs 25,000', 'Rs 10,000', 'Any', 'Rs 450 to '
                                                                                                        '500']),
        ('Cadence', ['Monthly', 'Monthly', 'Weekly', 'Monthly', 'Monthly', 'Monthly', 'Monthly', 'Daily']),
        ('Verification level', ['1', '1', '1', '2', '2', '2', '1', '3']),
        ('Income account checked', [0, 0, 0, 1, 1, 1, 0, 1]),
        ('Automatic debit required', [0, 0, 0, 1, 1, 1, 1, 1]),
        ('Cover required', [0, 0, 0, 1, 1, 1, 0, 1]),
        ('Credit report read', [0, 0, 0, 1, 1, 1, 0, 1]),
        ('Earned turns only', [1, 1, 1, 1, 1, 1, 1, 1])]
lw_ = 2.9
cwt = (PW - lw_) / len(types)
y0 = 2.05
for j, t in enumerate(types):
    tb(sl, PM + lw_ + j * cwt, y0, cwt - 0.05, 0.5, t, size=12.5, bold=True, color=AMBER if t == 'Hyper' else L700,
       align=CEN, anchor=BOTTOM, spacing=1.0)
rule(sl, PM, y0 + 0.55, PW, L700, 1.25)
for i, (lab, vals) in enumerate(rows):
    y = y0 + 0.62 + i * 0.4
    tb(sl, PM, y, lw_ - 0.1, 0.38, lab, size=13, anchor=MIDDLE)
    for j, v in enumerate(vals):
        xc = PM + lw_ + j * cwt
        if isinstance(v, int):
            dot(sl, xc + cwt / 2 - 0.09, y + 0.1, 0.18, filled=bool(v))
        else:
            tb(sl, xc, y, cwt - 0.05, 0.38, v, size=12, align=CEN, anchor=MIDDLE)
    rule(sl, PM, y + 0.39, PW)
tb(sl, PM, 6.45, PW, 0.35, [[('●', dict(size=12, color=L700)), ('  required     ', dict(size=12, color=GREY)),
                             ('○', dict(size=12, color=L700)), ('  not required. Known circles are formed by people '
                                                                     'who know each other; unknown circles are matched '
                                                                     'by Halqa.', dict(size=12, color=GREY))]])
say(sl, 'Eight kinds of circle, and what each asks of its members. Circles between people who know each other, family, '
        'office and market, need only identity checks, because the group itself knows its members. Circles between '
        'strangers need the income account, automatic debit, cover and a credit report. Asset circles buy a motorcycle '
        'or machine with Mashreq financing. UAE family circles join relatives across two countries. Hyper, the daily '
        'circle, asks the most and is labelled experimental.\n\n'
        'In every type the early turns must be earned: a new member starts at the back.')

# ================================================================ 11 DEFAULT PREVENTION ===
sl = pslide('Default Prevention', 'Four layers, each in force before any money is at risk.', stmt_size=22)
layers = [('Before joining', ['Identity, income and affordability engines', 'Early turns only for a good score; '
                                                                             'band lines at 550, 650 and 750',
                              'New members in the last three turns until two clean circles',
                              'At most six circles; one daily circle at a time', 'The host admits each member']),
          ('At joining', ['Every rupee owed shown before signing', '24 hours to withdraw after the circle is '
                                                                   'confirmed',
                          'A ten clause undertaking, signed in the application', 'A mutual guarantee between all '
                                                                                 'members',
                          'Direct debit mandate; cover on circles between strangers']),
          ('Every instalment', ['Reminder the evening before', 'Debit on the learned payday', 'Retries each morning, '
                                                                                               'five at most',
                                'The host sees who is late', 'Daily circles scored 0 to 100 every day']),
          ('A missed payment', ['Arrears taken from the member’s own pot on the collection day',
                                'Late ladder: 2%, 5% and 10% of the instalment; score down 10, 20, 40',
                                'Daily circles: 5%, 10%, 15% at 12, 36 and 60 hours',
                                'A daily circle stops opening days once cover would be exceeded'])]
cw4 = (PW - 3 * 0.35) / 4
for i, (t, items) in enumerate(layers):
    x = PM + i * (cw4 + 0.35)
    tb(sl, x, 2.2, 0.5, 0.5, str(i + 1), size=30, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x + 0.5, 2.2, cw4 - 0.5, 0.5, t, size=17, bold=True, anchor=MIDDLE)
    rule(sl, x, 2.78, cw4, L700, 1.5)
    for k, it in enumerate(items):
        y = 2.9 + k * 0.74
        tb(sl, x, y, cw4, 0.7, it, size=12.5, spacing=1.05)
        if k < len(items) - 1:
            rule(sl, x, y + 0.7, cw4)
    if i < 3:
        line(sl, x + cw4 + 0.05, 2.45, x + cw4 + 0.3, 2.45, L700, 1.25, arrow=True)
sources(sl, ['Default Prevention (HQ-CP-05); affordability as the State Bank’s 40 per cent limit for consumer '
             'finance, BPRD Circular Letter 29 of 2021', 'Contract Act 1872, s.74 limits penalties to reasonable '
                                                         'compensation'])
say(sl, 'This is the question every banker asks first, so it gets two slides.\n\n'
        'Layer one, before joining: the three engines, then the rule that early turns go only to members with a good '
        'score; the band lines are 550, 650 and 750 on our 300 to 850 scale. A new member starts in the last three turns '
        'until two circles are completed cleanly. At most six circles at once and one daily circle.\n\n'
        'Layer two, at joining: the member sees every rupee owed before signing, gets 24 hours to withdraw, signs a ten '
        'clause undertaking and a mutual guarantee with the other members, and gives the direct debit mandate.\n\n'
        'Layer three, every instalment: a reminder the evening before, the debit on the payday the system has learned, '
        'and retries each morning, five at most.\n\n'
        'Layer four, a missed payment: before collecting, arrears are simply taken from that member\'s own pot, so the '
        'others lose nothing. The late ladder applies stated penalties within what the Contract Act allows; on the '
        'Islamic window penalties go to charity. A daily circle stops opening new days if its losses approach the '
        'cover.')

# ================================================================ 12 RECOVERY ===
sl = pslide('Recovery', 'Only a member who has already collected can leave others short. The steps are fixed in advance, '
                        'and the others are paid by cover first.')
steps_r = [('Contact', 'A hardship path: a recorded statement, a waived fine, a new date'),
           ('Standing', 'Default after collecting costs 200 points and restricts the account'),
           ('Cover pays', 'The members left short are paid by the cover, in their own names'),
           ('Guarantee', 'The mutual guarantee between members; the whole balance falls due'),
           ('Civil suit', 'An ordinary suit on the signed undertaking'),
           ('Cheque', 'Only where a guarantee cheque is held: a summary suit on it')]
bx0, by0 = PM, 6.05
sw_, sh_ = 1.28, 0.55
for i, (t, d) in enumerate(steps_r):
    x = bx0 + i * sw_
    y = by0 - (i + 1) * sh_
    line(sl, x, y + sh_, x, y, L700, 1.5)
    line(sl, x, y, x + sw_, y, L700, 1.5)
    tb(sl, x + 0.05, y - 0.42, sw_ + 1.4, 0.4, '%d  %s' % (i + 1, t), size=14, bold=True, color=L700)
tb(sl, PM, 6.1, 7.7, 0.4, 'Each step is used only if the one before it fails.', size=12, color=GREY)
x0 = 8.75
for i, (t, d) in enumerate(steps_r):
    y = 2.3 + i * 0.66
    tb(sl, x0, y, W - PM - x0, 0.62, [[('%d  ' % (i + 1), dict(size=12, bold=True, color=L700)),
                                       (d, dict(size=12))]], anchor=MIDDLE, spacing=1.04)
    rule(sl, x0, y + 0.63, W - PM - x0)
tb(sl, x0, 6.3, W - PM - x0, 0.45, 'Never: calls to relatives, contact lists, public lists of defaulters.', size=12,
   bold=True, color=RED)
say(sl, 'Recovery. A member who misses before collecting costs the others nothing, so recovery only matters for someone '
        'who has already collected and stops paying. The worst case is the member in turn one, who still owes Rs 110,000 '
        'on a twelve member Rs 10,000 circle.\n\n'
        'Step one is contact: most cases end with a hardship statement and a new date. Step two, the account is '
        'restricted and the score drops by 200. Step three, the members left short are paid by the cover Mashreq '
        'chooses, in their own names, so they are not waiting for the court. Then the mutual guarantee and acceleration, '
        'then an ordinary civil suit on the signed undertaking. A summary suit is possible only on a cheque, so we never '
        'claim more.\n\n'
        'Cover is priced for a stress case of one circle in five losing a fifth of its members from the earliest turns; '
        'that costs about 5.5 per cent of the instalment on a circle between strangers.\n\n'
        'What we never do: call relatives, read contact lists, or publish names. That is how the banned loan apps '
        'worked, and it is the opposite of this design.')

# ================================================================ 13 BUSINESS MODEL ===
sl = pslide('Revenue and Business Model', 'Revenue comes from a share of what Mashreq earns on committees, never from '
                                          'holding money.')
# instalment split drawn as a proportional bar
tb(sl, PM, 2.25, 6.3, 0.4, 'One instalment of Rs 10,000 on a circle between strangers', size=14, bold=True)
bx, bwid, by = PM, 6.3, 2.75
parts = [('Contribution Rs 10,000', 10000, L700), ('Cover Rs 547', 547, LIME_MID), ('Fee', 500, MQ)]
tot = float(sum(v for _, v, _ in parts))
xx = bx
for t, v, col in parts:
    ww = bwid * v / tot
    rect(sl, xx, by, ww, 0.5, col)
    xx += ww
tb(sl, bx, by + 0.58, 4.0, 0.35, 'to the member collecting', size=11, color=GREY)
tb(sl, bx + bwid - 2.6, by + 0.58, 2.6, 0.35, 'cover and fee', size=11, color=GREY, align=R)
rev = [('Fee share', 'A flat fee on every instalment, collected by Mashreq as its income; an agreed share to Halqa',
        'Main line'),
       ('Balance share', 'An agreed share of Mashreq’s income on committee balances', 'Main line'),
       ('Financing referrals', '2 to 4 per cent from the financier and 1 to 3 per cent from the dealer on asset circles',
        'After pilot'),
       ('Marketplace', 'A commission from merchants when members spend points', 'After pilot'),
       ('Employers', 'Circles offered to staff through their employers', 'Later')]
for i, (t, d, st) in enumerate(rev):
    y = 3.75 + i * 0.52
    tb(sl, PM, y, 1.9, 0.48, t, size=13, bold=True, color=L700, anchor=MIDDLE)
    tb(sl, PM + 1.95, y, 3.5, 0.48, d, size=11, anchor=MIDDLE, spacing=1.02)
    tb(sl, PM + 5.5, y, 0.8, 0.48, st, size=10.5, color=GREY, anchor=MIDDLE, align=R)
    rule(sl, PM, y + 0.5, 6.3)
x0 = 7.45
tb(sl, x0, 2.25, W - PM - x0, 0.4, 'Unit economics, 25 September model', size=14, bold=True)
ue = [('Rs 13 to 35', 'running cost of one payment: messages, collection, support, checks'),
      ('Rs 100 to 500', 'fee per instalment in the current schedule, the ceiling before Mashreq’s share'),
      ('Rs 1.32 million', 'fixed cost a month at launch'), ('About 2,600', 'active members to cover it'),
      ('About Rs 8', 'a member a month for each 10 per cent share of Mashreq’s margin on balances')]
for i, (n_, t) in enumerate(ue):
    y = 2.75 + i * 0.72
    tb(sl, x0, y, 2.4, 0.66, n_, size=21, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x0 + 2.45, y, W - PM - x0 - 2.45, 0.66, t, size=12.5, anchor=MIDDLE, spacing=1.04)
    rule(sl, x0, y + 0.69, W - PM - x0)
sources(sl, ['Business Model and Unit Costs (HQ-CP-03), 25 September 2026, before Mashreq’s terms; the split of fee and '
             'balance income is to be agreed', 'Takaful Cover Pricing Model (HQ-MF-05): stress priced cover 5.47%'])
say(sl, 'How Halqa earns. Look at one instalment: almost all of it, Rs 10,000, is the contribution that goes to whoever '
        'is collecting. A small part is cover and a small part is the fee. Halqa\'s revenue is a share of what Mashreq '
        'earns, never money held.\n\n'
        'Two main lines: an agreed share of the flat fee Mashreq collects, and an agreed share of Mashreq\'s income on '
        'committee balances; on our assumptions each 10 per cent of Mashreq\'s margin is about Rs 8 a member a month. '
        'After the pilot: referral fees on asset financing, and a merchant commission when members spend points. Later, '
        'employer programmes.\n\n'
        'Costs from our 25 September model: Rs 13 to 35 to run one payment, Rs 1.32 million a month of fixed cost at '
        'launch, covered at about 2,600 active members. These numbers will be re-cut once Mashreq\'s terms are known.')

# ================================================================ 14 COMPARISON ===
sl = pslide('Comparison', 'Three ways a committee can be digital today, and the informal one they replace.')
cols_c = ['Halqa with Mashreq', 'Oraan', 'JazzCash Committee', 'Informal committee']
rows_c = [('Who holds the money', ['Mashreq, a licensed bank', 'Oraan’s own company accounts, no financial licence',
                                   'The organiser’s JazzCash wallet', 'The organiser, in cash']),
          ('Price of an early turn', ['One flat fee for every turn', 'Up to 21% of the instalment a month for turn 1',
                                      'Not published', 'Usually none']),
          ('Payout', ['Automatic, the same day', 'Net, between the 11th and 18th', 'The organiser pays by hand',
                      'Cash, by hand']),
          ('Checks on members', ['Identity, income, affordability, score', 'Device score and credit bureau',
                                 'Chosen from phone contacts', 'Personal knowledge']),
          ('If a member defaults', ['Cover chosen by Mashreq, then recovery', 'Oraan’s own balance sheet',
                                    'Not stated', 'The organiser’s own pocket']),
          ('Credit record', ['Every payment, from day one', 'Defaulters only', 'None', 'None']),
          ('Leaving early', ['Five set ways to leave', 'Turn moved or dropped before payout', 'No exit until the end',
                             'At the organiser’s discretion'])]
lw_ = 2.45
cwc = (PW - lw_) / 4
y0 = 2.12
rect(sl, PM + lw_, y0 - 0.05, cwc, 0.5 + len(rows_c) * 0.53 + 0.1, LIME_XLT)
for j, t in enumerate(cols_c):
    tb(sl, PM + lw_ + j * cwc + 0.1, y0, cwc - 0.2, 0.45, t, size=13.5, bold=True,
       color=L700 if j == 0 else (AMBER if j == 2 else INK), anchor=MIDDLE)
rule(sl, PM, y0 + 0.47, PW, L700, 1.25)
for i, (lab, vals) in enumerate(rows_c):
    y = y0 + 0.52 + i * 0.53
    tb(sl, PM, y, lw_ - 0.1, 0.5, lab, size=12.5, bold=True, anchor=MIDDLE)
    for j, v in enumerate(vals):
        tb(sl, PM + lw_ + j * cwc + 0.1, y, cwc - 0.2, 0.5, v, size=11.5, anchor=MIDDLE, spacing=1.02,
           bold=(j == 0))
    rule(sl, PM, y + 0.51, PW)
sources(sl, ['Oraan’s terms and website fee calculator, read 28 September 2026; Oraan Research (HQ-RS-01)',
             'JazzCash application 5.6.7 release note, 23 August 2026, and the feature as observed'])
say(sl, 'Side by side. Oraan, the closest competitor, holds members\' money in its own company accounts without a '
        'financial licence, charges the first turn up to 21 per cent of the instalment every month, about 54 per cent a '
        'year, carries defaults on its own balance sheet and reports only defaulters.\n\n'
        'JazzCash launched a committee feature in August 2026. It rotates, but the pot collects in the organiser\'s '
        'wallet and the organiser pays out by hand; there is no exit before the end and no credit record. Its advantage '
        'is reach.\n\n'
        'Halqa with Mashreq is the only version where a bank holds the money, every turn pays the same fee, and every '
        'payment builds a credit record.')

# ================================================================ 15 EVIDENCE ===
sl = pslide('Evidence', 'Digital committees have scaled elsewhere, each within a few years of founding.')
yrs = list(range(2016, 2027))
tx0, tx1 = PM + 2.6, W - PM - 2.5
xy = lambda yr: tx0 + (yr - 2016) * (tx1 - tx0) / 10.0
for yr in yrs:
    tb(sl, xy(yr) - 0.3, 2.3, 0.6, 0.3, str(yr), size=11, color=GREY, align=CEN)
    vrule(sl, xy(yr), 2.62, 3.55, C('EEF2EA'), 0.75)
comp = [('Money Fellows', 'Egypt', 2016, [(2016, 'launched'), (2025, 'profitable')],
         '8.5 million users; US$1.5 billion processed; works with Banque Misr'),
        ('Hakbah', 'Saudi Arabia', 2018, [(2018, 'founded'), (2020, 'launched after central bank approval'),
                                           (2023, 'Series A')], '500,000+ users; 70% aged 21 to 35; Visa cards'),
        ('Esusu', 'United States', 2018, [(2018, 'founded'), (2022, 'valued at US$1 billion'),
                                          (2025, 'US$1.2 billion')], 'Payments reported to credit bureaus; 12 million '
                                                                     'people'),
        ('The Money Club', 'India', 2016, [(2016, 'founded')], 'About 200,000 users and 17,000 clubs')]
for i, (name, ctry, start, ms, now) in enumerate(comp):
    y = 2.85 + i * 0.85
    tb(sl, PM, y - 0.18, 2.5, 0.35, name, size=15, bold=True, color=L700)
    tb(sl, PM, y + 0.15, 2.5, 0.3, ctry, size=11, color=GREY)
    line(sl, xy(start), y, xy(2026), y, L700, 3.0)
    for yr, lab in ms:
        oval(sl, xy(yr) - 0.09, y - 0.09, 0.18, WHITE, line=L700, lw=2.0)
        if yr >= 2024:
            tb(sl, xy(yr) - 1.9, y + 0.1, 2.0, 0.3, lab, size=10, color=INK2, align=R)
        else:
            tb(sl, xy(yr) - 0.1, y + 0.1, 2.0, 0.3, lab, size=10, color=INK2)
    tb(sl, tx1 + 0.15, y - 0.25, W - PM - tx1 - 0.15, 0.65, now, size=11, spacing=1.03, anchor=MIDDLE)
tb(sl, PM, 6.2, PW, 0.4, 'The common thread: a regulator or a bank came first, and growth followed.', size=14, bold=True)
sources(sl, ['Launch Base Africa, 21 October 2025; TechCrunch, 4 May 2025', 'The National, 21 December 2023; MENAbytes',
             'CNBC, 11 December 2025', 'CB Insights; Committee Dossier, 6 August 2026'])
say(sl, 'Four examples, with the year each started. Money Fellows in Egypt launched in 2016 and was profitable in 2025, '
        'with about 8.5 million users and US$1.5 billion processed; it works with Banque Misr and went through the '
        'central bank sandbox. Hakbah in Saudi Arabia was founded in 2018 and launched in 2020 after central bank '
        'approval; over 500,000 users, mostly young. Esusu in the United States, founded 2018, built its value on '
        'reporting payments to credit bureaus and was valued at US$1.2 billion in December 2025. The Money Club in India, '
        'founded 2016, reached about 200,000 users.\n\n'
        'The thread: the regulator or a bank came first. That is exactly the sequence we propose with Mashreq.')

# ================================================================ 16 WHY NOW ===
sl = pslide('Why Now', 'Pakistanis now pay digitally. They still save in committees because committees are what they '
                       'understand.', bg=LIME, logo=False, stmt_size=22)
caption_y = 2.3
tb(sl, PM, caption_y, 6.2, 0.35, 'Share of retail payments made digitally', size=14, bold=True, color=INK)
chart(sl, XL_CHART_TYPE.COLUMN_CLUSTERED, PM - 0.05, caption_y + 0.35, 6.2, 3.2, ['FY2023', 'FY2024', 'FY2025',
                                                                               'Jan to Mar 2026'],
      [('Digital', [78, 85, 88, 92])], colors=[INK], fmt='0"%"', gap=55, size=13,
      label_pos=XL_LABEL_POSITION.OUTSIDE_END, vmax=105)
x0 = 7.3
nw = [('69 million', 'mobile wallet users at the end of 2024: 64.3 million branchless banking, 4.7 million e-money'),
      ('2.9 billion', 'app transactions in January to March 2026, with 742 million Raast payments'),
      ('26%', 'of adults are financially literate; a committee needs no financial knowledge'),
      ('August 2026', 'JazzCash launched a committee feature: the wallets have started'),
      ('2028', 'national targets: 75% of adults with an account; the gender gap down to 25%')]
for i, (n_, t) in enumerate(nw):
    y = 2.3 + i * 0.8
    tb(sl, x0, y, 2.3, 0.72, n_, size=20, color=INK, font=DISPLAY, anchor=MIDDLE)
    tb(sl, x0 + 2.35, y, W - PM - x0 - 2.35, 0.72, t, size=12.5, color=INK, anchor=MIDDLE, spacing=1.04)
    rule(sl, x0, y + 0.76, W - PM - x0, INK2, 0.5)
sources(sl, ['State Bank of Pakistan: Annual Payment Systems Review FY25; quarterly reviews Q2 FY25 and Q3 FY26',
             'S&P Global FinLit Survey', 'JazzCash release notes; National Financial Inclusion Strategy 2024 to 2028'],
        dark=True)
say(sl, 'Why now. Pakistan has moved to digital payments fast: 78 per cent of retail payments were digital in FY2023, 92 '
        'per cent by the first quarter of 2026. At the end of 2024 about 69 million people used mobile wallets, 64.3 '
        'million on branchless banking and 4.7 million on e-money wallets, besides 21 million mobile banking users. '
        'In January to March 2026 apps handled 2.9 billion transactions and Raast 742 million payments.\n\n'
        'Yet only about a quarter of adults are financially literate. That is why committees survive: people understand '
        'them without understanding finance. Halqa puts the habit people already understand onto the rails they already '
        'use.\n\n'
        'And the market is moving: JazzCash launched a committee feature in August. The first bank to offer a committee '
        'held safely, with a credit record, sets the standard. The State Bank\'s 2028 targets are exactly what committee '
        'members bring.')

# ================================================================ 17 GROWTH ===
sl = pslide('Growth', 'Every circle recruits its own members, and every completed circle can start new ones.')
lcx, lcy, lr = 3.6, 4.45, 1.5
loop = ['A host starts a circle', 'Invites 6 to 20 people on WhatsApp', 'Each opens a Mashreq account',
        'The circle completes cleanly', 'Members start circles of their own']
oval(sl, lcx - lr, lcy - lr, 2 * lr, None, line=L700, lw=1.75)
for k, t in enumerate(loop):
    a = math.radians(k * 72 - 90)
    px, py = lcx + lr * math.cos(a), lcy + lr * math.sin(a)
    oval(sl, px - 0.2, py - 0.2, 0.4, LIME if k == 0 else WHITE, line=L700, lw=1.5)
    tb(sl, px - 0.2, py - 0.2, 0.4, 0.4, str(k + 1), size=12, bold=True, align=CEN, anchor=MIDDLE)
    if px > lcx + 0.3:
        tb(sl, px + 0.3, py - 0.35, 1.8, 0.7, t, size=12.5, anchor=MIDDLE, spacing=1.03)
    elif px < lcx - 0.3:
        tb(sl, px - 2.1, py - 0.35, 1.8, 0.7, t, size=12.5, anchor=MIDDLE, align=R, spacing=1.03)
    else:
        tb(sl, px - 1.4, py - 0.75, 2.8, 0.4, t, size=12.5, align=CEN)
tb(sl, lcx - 1.0, lcy - 0.3, 2.0, 0.6, 'the host loop', size=13, color=GREY, align=CEN, anchor=MIDDLE)
x0 = 7.35
chan = [('Hosts', 'Points for every circle completed cleanly; never paid for recruiting, which would be a pyramid'),
        ('Employers', 'Circles offered to staff, as Money Fellows does with 328 companies; income verified at source'),
        ('Mashreq', 'Inside the NEO application and the UAE application, for families across both countries'),
        ('Seasons', 'Circles timed for Ramadan, Qurbani, weddings and school fees'),
        ('Paid media', 'A short Google and social campaign only after the pilot proves completion rates')]
for i, (t, d) in enumerate(chan):
    y = 2.3 + i * 0.83
    tb(sl, x0, y, W - PM - x0, 0.8, [(t, dict(size=15, bold=True, color=L700, gap=1)), (d, dict(size=12.5))],
       spacing=1.04)
sources(sl, ['Money Fellows: 328 business partnerships, Entrepreneur Middle East, 2023; referral and organiser led '
             'growth: Mapan and Money Fellows'])
say(sl, 'Growth. Committees spread through the person who organises them. One host brings six to twenty people; they all '
        'open Mashreq accounts; when the circle completes, satisfied members start their own. So acquisition cost is '
        'shared across a group.\n\n'
        'Channels: hosts are rewarded with points for clean circles, never for recruiting, which would be a pyramid. '
        'Employers: Money Fellows reached 328 companies that offer circles to staff. Mashreq itself, inside NEO and the '
        'UAE application. Seasonal circles for Ramadan, Qurbani, weddings and school fees. Paid media only after the '
        'pilot shows completion rates.')

# ================================================================ 18 READINESS AND REGULATION ===
sl = pslide('Readiness and Regulation', 'The product is built. It needs State Bank regulation, which comes through '
                                        'Mashreq’s licence.')
ph = phone(sl, 'home', PM, 2.15, h=4.5)
x0 = PM + 2.85
ready = [('Built', 'The application in preview: signup, circles, automatic payment, payouts, credit record, points, late '
                   'and exit ladders; decision engines with automated tests', L700),
         ('Written', 'A legal position checked against twelve laws and regulations; six risk and pricing models; the '
                     'default prevention design', L700),
         ('Regulation', 'The model needs State Bank regulation. Mashreq’s licence covers accounts and payments; '
                        'Halqa works as Mashreq’s service provider under the State Bank’s outsourcing '
                        'framework; the product goes to the State Bank through Mashreq for approval or notice', MQ),
         ('Still to do', 'Incorporation; the agreement; the connection to Mashreq; public launch', AMBER)]
for i, (t, d, col) in enumerate(ready):
    y = 2.2 + i * 1.12
    rule(sl, x0, y, W - PM - x0, col, 1.5)
    tb(sl, x0, y + 0.08, 2.0, 0.4, t, size=16, bold=True, color=col)
    tb(sl, x0 + 2.05, y + 0.08, W - PM - x0 - 2.05, 1.0, d, size=13, spacing=1.05)
say(sl, 'Where we stand. The application is built and running in preview, with sample data; no real money has moved. The '
        'legal and risk work is written down.\n\n'
        'On regulation, plainly: a system that makes and manages committees with members\' money needs State Bank '
        'regulation. That is why it runs inside Mashreq: Mashreq\'s licence covers the accounts and the payments, Halqa '
        'would be assessed as Mashreq\'s service provider under the State Bank\'s outsourcing framework, with audit '
        'rights for Mashreq and the State Bank, and the product would go to the State Bank through Mashreq for approval '
        'or notice as the State Bank requires.\n\n'
        'Still to do: incorporation, the agreement, and the technical connection.')

# ================================================================ 19 PILOT ===
sl = pslide('Pilot', 'One month live with about 1,000 members, after approvals and testing.')
gx, gl, mw = PM, 3.4, 0.62
wk = 14
for m in range(wk):
    tb(sl, gx + gl + m * mw, 2.3, mw, 0.3, str(m + 1), size=11, color=GREY, bold=True, align=CEN)
tb(sl, gx, 2.3, gl - 0.15, 0.3, 'Week', size=11, color=GREY, bold=True, align=R)
rows_ = [('Agreement and incorporation', 1, 4, L700), ('State Bank and Shariah approvals', 1, 8, L700),
         ('Connection and testing', 4, 8, LIME), ('Pilot month: 1,000 members', 9, 12, LIME),
         ('Review', 13, 13, AMBER), ('Decision to scale', 14, 14, L700)]
for i, (lab, a_, b_, col) in enumerate(rows_):
    y = 2.72 + i * 0.5
    tb(sl, gx, y, gl - 0.15, 0.42, lab, size=13, align=R, anchor=MIDDLE)
    rect(sl, gx + gl + (a_ - 1) * mw + 0.03, y + 0.07, (b_ - a_ + 1) * mw - 0.06, 0.3, col)
vrule(sl, gx + gl - 0.05, 2.68, 3.05)
tb(sl, PM, 5.95, 2.3, 0.4, 'Measured', size=14, bold=True, color=L700)
tb(sl, PM + 2.3, 5.95, PW - 2.3, 0.7, 'accounts opened, mandates set, first instalments collected on time, payouts made '
   'the same day, complaints, time to onboard, cost of each member', size=13, spacing=1.05)
say(sl, 'The pilot is one month live. Before it: the agreement and incorporation, the State Bank and Shariah approvals '
        'through Mashreq, and the technical connection with testing, about eight weeks together.\n\n'
        'Then one month live with about 1,000 members in circles between people who know each other, up to 100 circles. '
        'In that month every circle makes its first collection and its first payout, which tests the whole machine: '
        'account opening, mandates, the debit on payday, the payout, messages and complaints. A two week review, then a '
        'decision to scale. The circles themselves continue to run their full cycle under close watch.')

# ================================================================ 20 REQUESTS ===
sl = pslide('Requests', 'Six decisions to start.')
asks = ['Approve the partnership, with Halqa as a service provider to Mashreq',
        'Take the product to the State Bank for approval or notice',
        'Approve the product for the Islamic window, and choose the cover',
        'Open accounts and direct debit mandates inside the Halqa application',
        'Use the Islamic Current Profit Account for instalments, with the profit returned as points',
        'Agree the income share and a one month pilot']
for i, t in enumerate(asks):
    y = 2.2 + i * 0.72
    tb(sl, PM, y, 0.8, 0.62, str(i + 1), size=30, color=L700, font=DISPLAY, anchor=MIDDLE)
    tb(sl, PM + 0.9, y, PW - 0.9, 0.62, t, size=19, anchor=MIDDLE)
    if i < 5:
        rule(sl, PM + 0.9, y + 0.67, PW - 0.9)
say(sl, 'Six decisions start it. The partnership itself, with Halqa assessed as Mashreq\'s service provider. Taking the '
        'product to the State Bank. The Islamic window product through the Shariah board, and Mashreq\'s choice of '
        'cover. Account opening and mandates inside our application. The Islamic Current Profit Account to hold '
        'instalments between payday and the due date, with its profit returned as points. And the income share with a '
        'one month pilot.\n\n'
        'Credit reporting through Mashreq\'s TASDEEQ membership, asset financing and UAE family circles follow the pilot.')

# ================================================================ 21 CLOSE ===
sl = prs.slides.add_slide(BLANK)
NUM[0] += 1
rect(sl, 0, 0, W, H, LIME)
rect(sl, PM - 0.15, 0.6, 2.05, 0.72, WHITE)
pic(sl, LOGO, PM, 0.7, h=0.5)
tb(sl, PM, 2.3, PW, 1.2, 'Halqa is the system. The bank is the machine.', size=40, color=INK, font=DISPLAY)
tb(sl, PM, 3.7, 10, 0.9, 'Committee savings for the families who already use them, inside Mashreq Bank Pakistan.',
   size=20, color=INK, spacing=1.08)
tb(sl, PM, 5.55, 8, 0.35, 'Taha Amjed, Chairman, Halqa', size=15, bold=True, color=INK)
tb(sl, PM, 5.95, 10, 0.35, 'A detailed reference of 81 pages covers the law, the product, the economics and the '
   'evidence.', size=13, color=INK2)
tb(sl, W - PM - 0.6, 7.0, 0.6, 0.3, str(NUM[0]), size=11, color=INK, align=R)
say(sl, 'To close: committees are the savings habit Pakistan already has. Halqa runs them; Mashreq holds and moves the '
        'money under the State Bank\'s regulation. Members get safety, one fair fee and a credit record; Mashreq gets '
        'deposits, customers in groups and a lending book. We have an 81 page reference for any area the risk, '
        'compliance or technology teams want to examine.')

# ==================================================================== save ===
cp = prs.core_properties
cp.title = 'Halqa: presentation for Mashreq Bank Pakistan'
cp.author = 'Halqa'
prs.save(OUTP)
bad = []
for n, s in enumerate(prs.slides, 1):
    for shp in s.shapes:
        if shp.has_text_frame:
            t = shp.text_frame.text
            for pat in (r'\byou\b', r'\byour\b', r'\bwe\b', r'\bour\b', u'[‒–—―]', r' - ',
                        r'(?i)\bjourney\b|\bunlock|\bseamless|\bempower|\bleverag|\brevolution|Akif|Saeed|Kazi|'
                        r'father|Sidra'):
                if re.search(pat, t):
                    bad.append((n, pat, t[:70]))
print('slides', len(prs.slides), 'bytes', os.path.getsize(OUTP))
for b in bad:
    print('CHECK', b)
