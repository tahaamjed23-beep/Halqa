// ============================================================================
// HELP ARTICLES
//
// Forty articles, one per topic in section AM3 of the work register, written
// against the decisions actually in force on 6 October 2026.
//
// This file exists because the assistant's knowledge base had drifted badly
// from the product. It still told members that Halqa never holds their money
// (the bank route of 28 September settled that the bank holds it), that Halqa
// takes a five per cent share of profit (the fee is Rs 85 a payment), that a
// score of 550 is needed to join (the seat matrix of 5 October decides which
// SEATS are open, not whether you may join at all), and it carried Shariah
// labels on the engines, which the chairman withdrew on 29 September. An
// assistant that answers confidently and wrongly is worse than one that says
// it does not know.
//
// So the articles are the single source and the assistant is built from them.
// One topic, one answer, in one place. Urdu is a translator's work and is not
// attempted here; the register tracks it separately.
// ============================================================================

export type Article = {
  /** Stable id, used by the assistant and by deep links. */
  id: string;
  /** The topic as the work register names it. */
  topic: string;
  /** What a member would actually type or tap. */
  title: string;
  /** The answer. Plain sentences, no hedging, no jargon left unexplained. */
  body: string;
  /** Where in the application this is settled, when there is somewhere. */
  go?: string;
  /** What a member might search for. */
  keywords: string[];
};

export const ARTICLES: Article[] = [
  {
    id: 'what-a-committee-is',
    topic: 'what a committee is',
    title: 'What is a committee?',
    body: 'A committee is a group of people who save together. Everybody puts in the same amount on the same '
      + 'day each month, and each month one member takes the whole pot. When everybody has had a turn, the '
      + 'circle finishes and can start again. You may know it as a committee, a kameti or a BC. Nothing about '
      + 'that changes on Halqa: the same people, the same amounts, the same turns. What changes is that the '
      + 'money moves through a bank rather than through somebody’s hands, and every rupee is recorded.',
    keywords: ['what is a committee', 'kameti', 'bc', 'committee meaning', 'rosca', 'what is a circle'],
  },
  {
    id: 'how-halqa-works-with-the-bank',
    topic: 'how Halqa works with the bank',
    title: 'How does Halqa work with the bank?',
    body: 'The bank holds the money and Halqa runs the circle. Your account is at the bank, in your name. '
      + 'Contributions are collected into it and the pot is paid out of it, under the bank’s own licence '
      + 'and the bank’s own rules. Halqa decides nothing about your money: it decides whose turn it is, '
      + 'what is owed, what has been paid and what is late, and it tells the bank. That split is deliberate. '
      + 'Holding other people’s money is something only a licensed bank may do in Pakistan, and Halqa is '
      + 'not a bank and does not pretend to be one.',
    keywords: ['bank', 'who holds the money', 'partner bank', 'where is my money', 'licence', 'regulated'],
  },
  {
    id: 'opening-the-bank-account',
    topic: 'opening the bank account',
    title: 'How long does opening an account take?',
    body: 'Under ten minutes, from the first screen to an account you can join a circle with. You give your '
      + 'name, your mobile number and your CNIC number, photograph your CNIC, look at the camera once so the '
      + 'photograph can be matched to the one on your CNIC, and choose a PIN. The bank checks your CNIC '
      + 'against NADRA while you wait. If NADRA is slow or your details do not match, you are told what to '
      + 'fix rather than left waiting.',
    go: 'home',
    keywords: ['open an account', 'sign up', 'how long', 'registration', 'account opening', 'kyc'],
  },
  {
    id: 'why-the-bank-checks-fingerprints',
    topic: 'why the bank checks fingerprints',
    title: 'Why does the bank check my fingerprints?',
    body: 'Because the law requires the bank to know who you are before it opens an account for you, and a '
      + 'fingerprint checked against NADRA is the proof the State Bank accepts. It protects you as much as the '
      + 'bank: it is what stops somebody else opening an account in your name with a copy of your CNIC. '
      + 'Halqa never sees your fingerprint. It goes from the device to NADRA through the bank, and the bank '
      + 'tells Halqa only whether the check passed.',
    keywords: ['fingerprint', 'biometric', 'nadra', 'why verify', 'identity check'],
  },
  {
    id: 'the-rs-85-fee',
    topic: 'the Rs 85 fee',
    title: 'What is the Rs 85 fee?',
    body: 'Rs 85 on every monthly payment, whatever the amount and whichever turn you hold. It is the same for '
      + 'a Rs 2,000 instalment and a Rs 25,000 one, and the same for the first seat and the last. Of it, at '
      + 'most Rs 35 is what the payment itself costs to move, and the rest is Halqa’s. It is charged by '
      + 'the bank with your payment, so you see one amount leave your account and the receipt shows the parts.',
    go: 'fees',
    keywords: ['fee', '85', 'cost', 'charges', 'how much does halqa cost', 'what do you charge'],
  },
  {
    id: 'the-psp-service-fee',
    topic: 'the PSP service fee on wallets and cards',
    title: 'Why is there an extra fee on my wallet or card?',
    body: 'Because a wallet or a card payment goes through a payment company, and that company charges 1.5 per '
      + 'cent to move it. The fee is shown before you confirm, in rupees as well as a percentage, and it is '
      + 'theirs rather than Halqa’s. A direct debit at the bank does not go through them, so it carries '
      + 'no such fee. If you want to avoid it, pay by the bank mandate.',
    go: 'fees',
    keywords: ['service fee', 'wallet fee', 'card fee', '1.5', 'extra charge', 'why more expensive'],
  },
  {
    id: 'the-takaful-or-insurance-fee',
    topic: 'the takaful or insurance fee',
    title: 'What is the takaful or insurance fee?',
    body: 'It is the premium for the cover that pays the circle if a member defaults. It is set and priced by a '
      + 'licensed operator the bank chooses, not by Halqa, and it goes to that operator in full. Halqa holds '
      + 'none of it and keeps none of it. On a circle between strangers and on Hyper it is part of every '
      + 'payment, because those are the circles where you do not know who is sitting beside you. On a circle '
      + 'of people you know it is optional.',
    go: 'fees',
    keywords: ['takaful', 'insurance', 'cover', 'protection fee', 'premium', 'what if someone defaults'],
  },
  {
    id: 'how-the-order-of-turns-is-set',
    topic: 'how the order of turns is set',
    title: 'How is the order of turns decided?',
    body: 'You choose your seat when you join, from the seats open to you. Which seats are open depends on '
      + 'whether the pot could be recovered from you if you took it and stopped paying, which is what the '
      + 'credit record and the security route are for. Where the host has chosen a ballot, the order is drawn '
      + 'in front of everybody: the draw is sealed before anybody taps, every member’s tap goes into it, '
      + 'and the sealed number is published afterwards so anybody can recompute the result and check it.',
    keywords: ['turn order', 'who goes first', 'my position', 'ballot', 'parchi', 'when is my turn'],
  },
  {
    id: 'seat-eligibility',
    topic: 'score bands',
    title: 'Which turns can I take?',
    body: 'It depends on what is known about you, because an early turn means collecting the pot while you '
      + 'still owe most of your instalments. A real credit record with a good score opens every seat. A middle '
      + 'score opens the later half of the circle. A low score on a real record means the last seats until the '
      + 'score improves, which paying on time does. A record too short to judge opens the later half. No '
      + 'record at all means the last seats. In the last two cases, one committee completed cleanly opens every '
      + 'seat. So does pledging security that covers the pot.',
    go: 'credit',
    keywords: ['which turns', 'seat', 'early turn', 'score band', 'position', 'first turn', 'eligibility'],
  },
  {
    id: 'security-instead-of-a-credit-check',
    topic: 'why new members start last',
    title: 'Can I take an early turn without a credit record?',
    body: 'Yes, by pledging security that covers the pot. Your own savings at the bank, frozen for the length '
      + 'of the circle, count; so do points you hold and an asset committee you are enrolled in, and they can '
      + 'be added together. The money stays yours, in your own account, and it earns the bank’s profit '
      + 'for you the whole time it is frozen. It needs to cover the pot less ten per cent, not the whole pot. '
      + 'You sign a clause saying you will not withdraw it before the circle finishes. With that in place no '
      + 'credit check is needed, unless your score is low on a real record, which is the one thing security '
      + 'cannot buy past.',
    go: 'credit',
    keywords: ['security', 'no credit history', 'frozen savings', 'deposit', 'first time', 'new member'],
  },
  {
    id: 'joining-with-a-code',
    topic: 'joining with a code',
    title: 'How do I join with a code?',
    body: 'Ask the host for the circle’s code and enter it in Circles. You will see the circle before you '
      + 'join: how many people, how much each turn, how often, who hosts it and what their record looks like. '
      + 'You will also see the agreement every member signs, before you sign it rather than after. Nothing is '
      + 'owed until you choose your seat.',
    go: 'circles',
    keywords: ['invite code', 'join with code', 'where is the code', 'how to join'],
  },
  {
    id: 'hosting-a-circle',
    topic: 'hosting a circle',
    title: 'How do I host a circle?',
    body: 'You need one of three things: a good credit score with real proof behind it, two committees you have '
      + 'completed cleanly, or the same security a member pledges for an early seat. Then you set the amount, '
      + 'the number of people, how often it collects and what it is for, and you share the code. Hosting is '
      + 'work, so it is paid: at the end of each circle the host receives a tenth of the profit that circle '
      + 'made for Halqa, as points or as money, whichever the host prefers. A tenth of the profit, not of the '
      + 'pot and not of what the members paid in.',
    go: 'create',
    keywords: ['host', 'create a circle', 'start a committee', 'host commission', 'who can host'],
  },
  {
    id: 'admitting-members',
    topic: 'admitting members',
    title: 'Who decides who joins?',
    body: 'On a circle you invite, you do. You share the code with the people you want and nobody else can get '
      + 'in. On a circle listed publicly, anybody may join whose seat eligibility allows the seat they want, '
      + 'and the host cannot widen that: on a circle of strangers the host is a stranger too, so letting the '
      + 'host hand out early seats would make the rule advisory. On a circle of people you know, your '
      + 'invitation stands in its place, because you are vouching for them.',
    keywords: ['who can join', 'approve members', 'admit', 'invite only', 'public circle'],
  },
  {
    id: 'reminders',
    topic: 'reminders',
    title: 'What reminders will I get?',
    body: 'One three days before your payment is collected, one the day before, and one when it has gone '
      + 'through. If a collection fails you are told the same day, with what to do. Nothing arrives between '
      + 'ten at night and eight in the morning except a message about money leaving your account today. You '
      + 'can turn off everything except the ones about money you owe, which stay on because not knowing about '
      + 'those costs you.',
    go: 'settings',
    keywords: ['reminders', 'notifications', 'alerts', 'messages', 'turn off notifications'],
  },
  {
    id: 'paying-by-mandate',
    topic: 'paying by mandate',
    title: 'What is the bank mandate?',
    body: 'A standing permission you give the bank to collect your instalment from your account on the day it '
      + 'is due. You give it once, at the bank, and you can withdraw it at the bank. It is the cheapest way to '
      + 'pay, because it carries no payment company fee, and the most reliable, because nothing depends on you '
      + 'remembering. You are told before each collection and after it. If the money is not there the '
      + 'collection fails and is tried again the next morning.',
    go: 'pay',
    keywords: ['mandate', 'direct debit', 'auto debit', 'automatic payment', 'standing instruction'],
  },
  {
    id: 'paying-by-wallet-or-card',
    topic: 'paying by wallet or card',
    title: 'Can I pay from my wallet or card?',
    body: 'Yes. A wallet or a card payment reaches the circle the same day, and carries the payment '
      + 'company’s fee of 1.5 per cent, which you see in rupees before you confirm. You can save a card '
      + 'so later instalments are collected from it without you doing anything, in which case the saved card '
      + 'works like the mandate but still carries the fee.',
    go: 'pay',
    keywords: ['wallet', 'card', 'jazzcash', 'easypaisa', 'pay by card', 'payment methods'],
  },
  {
    id: 'paying-by-raast',
    topic: 'paying by Raast',
    title: 'Can I pay by Raast?',
    body: 'Yes, and it is free: Raast is the State Bank’s own transfer system and it does not charge you. '
      + 'A Raast payment arrives in seconds. You push it yourself, so it is the right choice if you would '
      + 'rather decide each month than give a standing permission. The Rs 85 fee still applies, because that '
      + 'is Halqa’s charge for running the circle rather than a charge for moving the money.',
    go: 'pay',
    keywords: ['raast', 'free transfer', 'instant', 'bank transfer', 'cheapest way to pay'],
  },
  {
    id: 'when-a-payment-fails',
    topic: 'when a payment fails',
    title: 'What happens if a payment fails?',
    body: 'You are told the same day and it is tried again the next morning, up to five times, all before the '
      + '8th. If you have a second method on file, the last attempt uses it. Nothing is charged for a failed '
      + 'attempt and no late charge applies before the 8th. What a failure usually means is that the money was '
      + 'not in the account that morning, so moving your payment day to just after you are paid fixes it for '
      + 'good.',
    go: 'pay',
    keywords: ['payment failed', 'bounced', 'insufficient funds', 'declined', 'retry'],
  },
  {
    id: 'late-charges',
    topic: 'late charges',
    title: 'What happens if I pay late?',
    body: 'Nothing before the 8th. After the 8th a charge applies and it grows the longer it runs: two per '
      + 'cent, then five, then ten. On a daily circle the same thing happens faster, at twelve, thirty six and '
      + 'sixty hours. A late payment is also recorded against you, which matters more than the charge, because '
      + 'it is what decides which seats are open to you in the next circle. If you know you will be late, say '
      + 'so before the 8th: a hardship plan costs less than a late charge and does less damage.',
    keywords: ['late', 'penalty', 'late fee', 'missed payment', 'charges for late'],
  },
  {
    id: 'why-the-8th',
    topic: 'why the 8th',
    title: 'Why is everything due on the 8th?',
    body: 'Because most people in Pakistan are paid at the start of the month, and a date a week after that is '
      + 'a date most people can actually meet. One date for everybody also means the pot is complete on one '
      + 'day, so whoever’s turn it is knows exactly when they will be paid. Your own collection is '
      + 'attempted on your payday rather than on the 8th, so the money is taken when it is there; the 8th is '
      + 'the day by which it must have arrived.',
    keywords: ['8th', 'due date', 'why that date', 'payday', 'when is payment due'],
  },
  {
    id: 'receiving-the-pot',
    topic: 'receiving the pot',
    title: 'When do I get the pot?',
    body: 'On your turn, once the round’s money is in. It is paid into your own account at the bank, and '
      + 'you are told when it leaves and when it lands. If somebody in the circle has not paid, their share is '
      + 'claimed from the cover rather than taken off what you receive. If you owe anything yourself, it is '
      + 'taken out of your pot before you are paid, which is fairer than chasing you for it afterwards.',
    keywords: ['payout', 'when do i get paid', 'receive the pot', 'my turn', 'collect'],
  },
  {
    id: 'arrears-and-set-off',
    topic: 'arrears and set off',
    title: 'What if I owe money when my turn comes?',
    body: 'What you owe is taken out of your pot and the rest is paid to you. You are shown the arithmetic '
      + 'before the payout, not after. Halqa never puts your balance below zero and never lends you anything '
      + 'to cover a shortfall: if you owe more than the pot, what remains is a debt recorded against you and '
      + 'settled on a plan.',
    keywords: ['arrears', 'owe', 'set off', 'deducted', 'what if i owe'],
  },
  {
    id: 'hardship-plans',
    topic: 'hardship plans',
    title: 'What if I cannot pay this month?',
    body: 'Tell us before the 8th. A hardship plan spreads what you owe over the rounds that remain, and while '
      + 'it is running no late charge applies and nothing is reported against you. It is not a favour and you '
      + 'do not have to explain yourself at length: people have months like this, and a circle that cannot '
      + 'survive one of them is badly built. What it is not is a way out of paying — the money is still '
      + 'owed, and the other members are still owed it.',
    go: 'support',
    keywords: ['cannot pay', 'hardship', 'help paying', 'extension', 'struggling', 'plan'],
  },
  {
    id: 'leaving-a-circle',
    topic: 'leaving a circle',
    title: 'Can I leave a circle?',
    body: 'Within twenty four hours of joining, yes, at no cost and with no mark against you. After that it '
      + 'depends on where the circle is. Before it starts, you can leave and your seat is offered to somebody '
      + 'else. After it starts there are four ways out: the window, if you are early enough; substitution, if '
      + 'you find somebody to take your seat; a vote of the circle; and hardship. What there is not is a '
      + 'cancel button, because the people left behind would be the ones paying for it.',
    keywords: ['leave', 'quit', 'exit', 'cancel', 'get out', 'withdraw from circle'],
  },
  {
    id: 'disputes',
    topic: 'disputes',
    title: 'What if I disagree about a payment?',
    body: 'Open a case and quote what you are disputing. Every payment has a reference, a time and a record of '
      + 'which rail it came on, so a dispute about whether something was paid is usually settled in minutes by '
      + 'looking. A dispute about whether something is owed goes to the circle’s own agreement, which you '
      + 'and every other member signed and can read at any time. Nothing is taken from you while a case is '
      + 'open.',
    go: 'support',
    keywords: ['dispute', 'disagree', 'wrong amount', 'i did pay', 'argument'],
  },
  {
    id: 'complaints',
    topic: 'complaints',
    title: 'How do I complain?',
    body: 'Open a case and say it is a complaint. You get a reference the same day and an answer within the '
      + 'time the bank’s own rules allow, which is told to you when you open it. If the answer does not '
      + 'satisfy you, the complaint goes to the bank, and after the bank to the Banking Mohtasib, who is '
      + 'independent of both the bank and Halqa. That route is yours by right and nothing you sign with Halqa '
      + 'takes it away.',
    go: 'support',
    keywords: ['complaint', 'complain', 'escalate', 'ombudsman', 'mohtasib', 'unhappy'],
  },
  {
    id: 'points-and-rewards',
    topic: 'points and rewards',
    title: 'What are points for?',
    body: 'One point is one rupee and they come off what you pay. You earn them for paying on time, and for '
      + 'paying before you are asked. The points earned on one instalment never come to more than half that '
      + 'instalment’s fee, so they reduce the fee rather than paying you to borrow. Points also count '
      + 'towards the security that opens an early seat, which is the quiet reason to keep them rather than '
      + 'spend them.',
    go: 'rewards',
    keywords: ['points', 'rewards', 'discount', 'loyalty', 'what are points worth'],
  },
  {
    id: 'the-marketplace',
    topic: 'the marketplace',
    title: 'What is the marketplace?',
    body: 'A place to spend points on things worth having rather than on nothing in particular. What is in it '
      + 'depends on what partners are offering. You never have to use it: points come off your fee whether or '
      + 'not you ever open it.',
    go: 'marketplace',
    keywords: ['marketplace', 'spend points', 'shop', 'offers', 'redeem'],
  },
  {
    id: 'the-turn-market',
    topic: 'the turn market',
    title: 'Can I swap or sell my turn?',
    body: 'You can offer your turn to another member of the same circle, and they can offer you points for it. '
      + 'Both of you have to agree and the host has to approve. The seat rules still apply to whoever ends up '
      + 'holding the seat, from both ends: you cannot buy your way into a seat you could not have claimed when '
      + 'you joined, and you cannot sell yourself into one either. Whether this is offered through an Islamic '
      + 'window is the bank’s Shariah board’s decision, not Halqa’s.',
    go: 'marketplace',
    keywords: ['sell my turn', 'swap turn', 'exchange', 'turn market', 'trade position'],
  },
  {
    id: 'hyper',
    topic: 'Hyper, an experiment',
    title: 'What is Hyper?',
    body: 'A much larger, much faster circle, and an experiment rather than the main product. Hundreds of '
      + 'members, a payment every day, and a turn that comes round in weeks instead of years. The fee is Rs 15 '
      + 'a day, flat, whichever day your turn falls on. It is labelled an experiment because it is one: it '
      + 'depends on a great many people paying a small amount reliably, and that is exactly the thing that has '
      + 'to be proven rather than assumed.',
    go: 'hyper',
    keywords: ['hyper', 'daily circle', 'fast committee', 'big circle', 'what is hyper'],
  },
  {
    id: 'the-credit-record-and-tasdeeq',
    topic: 'the credit record and TASDEEQ',
    title: 'What is TASDEEQ and why does it matter?',
    body: 'TASDEEQ is a licensed credit bureau in Pakistan. With your instruction, the bank asks it what your '
      + 'credit record says, and that answer is part of deciding which seats are open to you. With your '
      + 'consent, how you pay on Halqa is reported back to it, which is the part that is worth having: paying '
      + 'a committee on time has never counted for anything anywhere, and this is how it starts to. Neither '
      + 'happens without you saying so, and you can withdraw either.',
    go: 'credit',
    keywords: ['tasdeeq', 'credit bureau', 'credit report', 'ecib', 'credit history', 'reported'],
  },
  {
    id: 'the-credit-score',
    topic: 'the credit score',
    title: 'What is my score and how do I raise it?',
    body: 'A number that says how reliably you have paid, and the thing that decides which seats are open to '
      + 'you. Paying on time raises it. Paying early raises it a little more. Paying late lowers it, and '
      + 'missing a payment lowers it a lot. Completing a committee cleanly is worth more than any single '
      + 'payment, because it is the whole thing done. Nothing you cannot control affects it, and you can see '
      + 'every event that moved it.',
    go: 'credit',
    keywords: ['score', 'credit score', 'reliability', 'raise my score', 'improve score', 'why did my score drop'],
  },
  {
    id: 'keeping-a-pin-safe',
    topic: 'keeping a PIN safe',
    title: 'How do I keep my PIN safe?',
    body: 'Do not use your birth year, your CNIC digits or four of the same number. Do not tell anybody it, '
      + 'including anybody who says they are from Halqa or from the bank: nobody from either will ever ask. '
      + 'The PIN is asked for every time the app opens, so somebody holding your unlocked phone still cannot '
      + 'get in. After five wrong attempts the account locks for fifteen minutes, which is deliberate and is '
      + 'not something to work around.',
    go: 'settings',
    keywords: ['pin', 'password', 'safe pin', 'forgot pin', 'change pin', 'security'],
  },
  {
    id: 'changing-phone-or-device',
    topic: 'changing phone or device',
    title: 'What if I change my phone?',
    body: 'Sign in on the new one with your number and your PIN. You will see every device signed in to your '
      + 'account, and you can sign the others out in one action, which is the first thing to do with an old '
      + 'phone you have sold or lost. Signing out elsewhere never signs out the device you are holding.',
    go: 'devices',
    keywords: ['new phone', 'change device', 'lost phone', 'sign out other devices', 'stolen phone'],
  },
  {
    id: 'changing-a-phone-number',
    topic: 'changing a phone number',
    title: 'How do I change my number?',
    body: 'From your account, with a code sent to the new number and your PIN. Both are needed: a code alone '
      + 'would let somebody who has taken over your old SIM move your account, which is a real way accounts '
      + 'are stolen in Pakistan. Your circles, your record and your points are unaffected.',
    go: 'settings',
    keywords: ['change number', 'new sim', 'update mobile', 'phone number changed'],
  },
  {
    id: 'data-and-privacy',
    topic: 'data and privacy',
    title: 'What do you do with my data?',
    body: 'We hold what running a committee needs: who you are, what you have paid, what you owe, and the '
      + 'bank’s verification of your identity. Members of your circle see your name, your turn and '
      + 'whether you have paid, because a committee has always worked that way and a circle where nobody knows '
      + 'who has paid does not work at all. Nobody outside your circle sees any of it. Your credit record is '
      + 'requested only on your instruction and reported only with your consent, and either can be withdrawn. '
      + 'We do not sell anything about you.',
    go: 'settings',
    keywords: ['privacy', 'my data', 'who can see', 'data protection', 'personal information'],
  },
  {
    id: 'closing-the-account',
    topic: 'closing the account',
    title: 'How do I close my account?',
    body: 'When you are in no circle and owe nothing, from your account settings. If you are in a running '
      + 'circle you cannot close while the other members are relying on you; leave the circle first. Closing '
      + 'ends the account but not the record: what the bank must keep, it keeps, for as long as its own rules '
      + 'say. What is kept and for how long is written down and you can ask for it.',
    go: 'settings',
    keywords: ['close account', 'delete account', 'leave halqa', 'remove my data'],
  },
  {
    id: 'members-abroad',
    topic: 'members abroad',
    title: 'Can I join from outside Pakistan?',
    body: 'If you have a Pakistani CNIC and a Pakistani bank account, yes, and plenty of committees run exactly '
      + 'this way: somebody abroad paying in, family at home taking the turns. What you cannot do is join with '
      + 'a foreign account, because the bank’s rules for an account held abroad are not the same and '
      + 'Halqa is not licensed to work around them.',
    keywords: ['abroad', 'overseas', 'outside pakistan', 'expat', 'remittance', 'foreign'],
  },
  {
    id: 'islamic-accounts',
    topic: 'Islamic accounts',
    title: 'Is there an Islamic option?',
    body: 'That is the bank’s to answer, not Halqa’s. Where the partner bank runs an Islamic window, '
      + 'its own Shariah board decides what may be offered through it and on what terms, and that ruling is '
      + 'the one that counts. Halqa does not put a Shariah label on its own features, because a label like '
      + 'that is not ours to give.',
    keywords: ['islamic', 'halal', 'shariah', 'riba', 'interest free', 'is it halal'],
  },
  {
    id: 'contact-and-hours',
    topic: 'contact and hours',
    title: 'How do I reach a person?',
    body: 'Open a case from Help and you will get a reference straight away. Cases are answered between nine in '
      + 'the morning and six in the evening, Monday to Saturday. Anything about money leaving your account is '
      + 'looked at the same day whenever it arrives. Nobody from Halqa will ever telephone you to ask for your '
      + 'PIN, a code, or a payment to a personal account, and anybody who does is not from Halqa.',
    go: 'support',
    keywords: ['contact', 'phone number', 'hours', 'talk to someone', 'customer service', 'help'],
  },
];

/** Every article by its id, for deep links and for the assistant. */
export const ARTICLE_BY_ID: Record<string, Article> =
  Object.fromEntries(ARTICLES.map(a => [a.id, a]));

/** The topic names, exactly as the work register lists them. */
export const TOPICS: string[] = ARTICLES.map(a => a.topic);

/**
 * Finds the article that best answers a typed question.
 *
 * Scored rather than first-match: a question that mentions both a wallet and a
 * fee should reach the wallet fee article rather than whichever of the two was
 * written first.
 */
export function findArticle(query: string): Article | null {
  const q = query.toLowerCase().replace(/[^a-z0-9؀-ۿ ]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!q) return null;
  let best: Article | null = null;
  let bestScore = 0;
  for (const a of ARTICLES) {
    let score = 0;
    for (const k of a.keywords) if (q.includes(k)) score += k.split(' ').length * 2;
    for (const word of a.title.toLowerCase().split(/\W+/)) {
      if (word.length > 3 && q.includes(word)) score += 1;
    }
    if (score > bestScore) { bestScore = score; best = a; }
  }
  return bestScore >= 2 ? best : null;
}
