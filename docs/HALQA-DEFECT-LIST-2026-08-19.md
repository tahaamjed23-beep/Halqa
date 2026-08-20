# HALQA · DEFECT LIST

Every item below is evidenced: from your screenshots, the page text you pasted,
or the source. Nothing here is speculative. Nothing is fixed until you approve.

Tags: `BUG` broken · `COPY` wording · `UI` design · `MISS` absent ·
`DATA` server/schema · `Q` needs your decision

---

## A · PAYMENT METHODS AND THE CARD (from your screenshot)

1. `BUG` Auto-debit card shows no number. `pcard-no` renders `primary.masked`; the field does not exist on the object.
2. `BUG` Card shows the label "Rail" with no value under it, because `primary.kind` does not exist either.
3. `BUG` So the card renders as an empty green rectangle with only a name on it.
4. `BUG` Linked-account row shows an empty grey square where the wallet logo belongs.
5. `BUG` Easypaisa row does not use the new rail mark; the logo swap never reached `CardsPage`.
6. `UI` Card has no wallet branding at all, so it reads as a placeholder.
7. `UI` Card chip is a plain yellow rectangle, not a chip.
8. `UI` Card gradient is flat green with a stray pale circle bottom-right.
9. `COPY` "· pending verification" leads with a stray middle dot.
10. `MISS` No card-network mark (Visa / Mastercard / PayPak) anywhere on a linked card.
11. `MISS` No bank logo for a linked bank account.
12. `MISS` Adding a method does not show which wallets are supported before you pick.
13. `UI` "Add a method" is a dashed box, inconsistent with every other button.
14. `UI` "1 of 5" counter is unexplained.
15. `BUG` Delete (bin) icon has no confirmation.

## B · AUTO DEBIT

16. `COPY` "Auto-collection is standard on every circle, always on, never removable (it's how Halqa keeps circles safe)." Three claims in one sentence, parenthetical, defensive.
17. `COPY` "Halqa schedules it, never holds it." Reads as legal cover, not information.
18. `UI` Ten committees each render "🔒 Auto-collect ON · RAAST" as an identical row. Pure noise.
19. `UI` Emoji padlock used as an icon.
20. `UI` Rail shown as the raw enum "RAAST" instead of the Raast mark.
21. `COPY` "Never miss a round" headline above a list you cannot act on.
22. `COPY` "Collect on my payday / Runs on the morning you... nds, before the due date" — text is truncated mid-word in the live UI.
23. `MISS` No way to see when the next collection will actually run.
24. `MISS` No way to change the collection account per committee.
25. `Q` Should auto-collect be per-committee toggleable at all, or stay universal?

## C · THE VAULT (you said: untouched, redesign it)

26. `UI` Vault is unchanged; only its copy was trimmed. It needs the full rebuild.
27. `COPY` "Vault · halal savings pocket" eyebrow plus "Savings pocket" heading says the same thing twice.
28. `COPY` "Committee payouts can park here, and you can top up any amount yourself, everything accrues on Gold-Linked Allocation (15.0% indicative, Mudarabah) until you sweep it out. Principal is yours at any time." One sentence, four clauses, two jargon terms.
29. `COPY` "sweep it out" is not a phrase a member uses.
30. `COPY` "Accrued profit (indicative)" — parenthetical hedge in a value label.
31. `COPY` "Parking / On, new payouts park here" — "parking" is internal language.
32. `MISS` Remove the Crypto sleeve entirely.
33. `MISS` Remove the Gold-linked sleeve entirely.
34. `BUG` Blended yield reads "15.00% / yr" from a sleeve you are removing.
35. `UI` Sleeve rows are four near-identical boxes with a badge and a fragment.
36. `COPY` "Money-market · lowest volatility" — investor language.
37. `COPY` "Islamic income fund · higher yield" — same.
38. `COPY` "Auto-cover missed installments (safety net)" — parenthetical again.
39. `COPY` "If an installment slips past its deadline and your vault holds enough, it's paid from your vault automatically, the small late adjustment still applies, but it never escalates toward default." 39 words, one sentence.
40. `COPY` "the small late adjustment" is a euphemism for a penalty.
41. `COPY` "From Rs 100. Recorded to your vault and accruing from today."
42. `UI` "Record top-up" / "Turn parking off" / "Sweep vault to my account" — three competing buttons, none primary.
43. `UI` Balance of Rs 0 shown with no way to understand what would fill it.
44. `MISS` No vault transaction history.
45. `MISS` No explanation of where the money actually is, in one line.
46. `UI` Five tab sections (Overview, Portion sizing, Projected growth, Risk model, Money map) for an empty vault.

## D · ACCOUNT / PROFILE PAGE

47. `COPY` "Member profile" eyebrow above your own name is redundant.
48. `UI` Account menu rows are all one weight, so nothing is findable.
49. `COPY` "Credit report / Your score and payment record" — subtitle restates the title.
50. `COPY` "Activity / Every payment and receipt" — same.
51. `COPY` "Turn marketplace / Buy or sell a turn" — same.
52. `COPY` "Rewards / Points and streaks" — same.
53. `COPY` "Scheme terminal / Where idle funds sit" — "scheme terminal" means nothing to a member.
54. `COPY` "About Halqa / How it works, who we are" — same restatement.
55. `UI` No icons differentiating destructive vs ordinary rows.
56. `MISS` No profile picture upload visible on the account page.
57. `BUG` Profile picture does not show anywhere (your report).

## E · YOUR STANDING / VERIFICATION

58. `COPY` "⚠ Be honest, every claim here is checked against your documents when we review your account. Misrepresenting your income, employer or cheque will get you removed and blacklisted." Threatening, emoji warning, second person accusatory.
59. `COPY` "New member, last turns only." Reads as a punishment, not a rule.
60. `COPY` "Service-charge discount / Verify below to earn a discount / 0% off" — three fragments.
61. `COPY` "Employed? Your employer + pay slip. Housewife/student? Your husband's or guardian's employer + their pay slip → 80% off charges" — question marks, plus signs, an arrow.
62. `COPY` "Guarantee cheque / A cheque on file → 95% off (our lowest-risk members)"
63. `COPY` "A guarantee cheque is collected in person by an agent (it's what makes a bounced-cheque case possible)." States a legal threat as a feature.
64. `Q` Cheques were dropped from the model per the register. Should this whole block go?
65. `COPY` "Turn access & rewards / Earn cheaper fees and earlier turns by proving you're reliable."
66. `UI` Progress "0/2 clean circles" is text, not a progress indicator.

## F · HOST RECORD / COMMITTEE PAGE

67. `COPY` "Verified from recorded payment and completion events. Never self-reported." Still present.
68. `COPY` "New account with no verified history yet. First-time hosts are normal, but start with people you know."
69. `BUG` No phone numbers under member names in the live app (API change not deployed).
70. `BUG` Committee picture does not appear (API change not deployed).
71. `MISS` No messages/chat visible in a committee.
72. `BUG` Committee chat shows a permanent "unreachable" banner on serverless.
73. `UI` Member rows show a score with no explanation of what it gates.
74. `MISS` Cannot tap a member to see their profile.
75. `MISS` No way to call or WhatsApp a member from the roster.

## G · CREATING A COMMITTEE

76. `BUG` Creating a committee still fails end to end (your report), asset or normal.
77. `BUG` No invite code shown after creation.
78. `BUG` No invite prompt after creation.
79. `MISS` No confirmation screen after creating.
80. `COPY` "Host studio · locks at start" — "host studio" is internal language.
81. `COPY` "Set the basics and choose how it earns. Investing a slice of the pool, risk and advanced safeguards are all optional, tucked away below."
82. `UI` Create flow is a long scroll, not the wallet-style step flow.
83. `MISS` Cannot set a committee picture during creation.
84. `MISS` Cannot invite anyone during creation.
85. `Q` Should creation require a minimum score of 700? It currently blocks below that.

## H · ASSET COMMITTEES

86. `BUG` Asset committees are not reachable from the create flow.
87. `MISS` Creating an asset committee has no server mode; the page is a calculator only.
88. `MISS` No supplier, no delivery, no title flow.
89. `UI` Asset page is not in the JazzCash layout language.

## I · HYPER

90. `Q` **Pot and roster contradict.** You said 30 days / Rs 500 / Rs 15,000 / 7 a day = 210 members. Then "60 days on hyper", which makes the pot Rs 30,000 and 420 members. Rs 500 x 60 days cannot produce a Rs 15,000 pot. Which holds: 60 days at Rs 250, or 30 days at Rs 500?
91. `BUG` Shows Rs 30,000 pot, which you say is wrong.
92. `BUG` Shows 420 members, which you say is wrong.
93. `UI` Gate list is five red boxes stacked, which reads as rejection.
94. `COPY` "You cannot join a HYPER committee yet." Blunt, no path forward.
95. `COPY` "Read this first / In an ordinary committee you know the others..." — a paragraph before any content.
96. `UI` Day list scrolls 60 rows with no grouping.
97. `MISS` No indication of which days are actually popular.

## J · BUY TURNS / MARKETPLACE

98. `UI` Not compact. Each listing needs its own scroll; you asked for 3-4 visible at once.
99. `MISS` No filters, no sort.
100. `MISS` No empty state.
101. `COPY` Marketplace rules block still explains mechanics at length.
102. `MISS` Circle rating computed server-side but not shown on listings.

## K · SETTINGS SUB-PAGES

103. `COPY` Every section subtitle restates its title.
104. `COPY` "Sign in & security / Password, sessions, account protection"
105. `COPY` "Data privacy / What Halqa shares, your controls, your data"
106. `COPY` "Advertising data / Goal-intent sharing and ad choices" — "goal-intent" is internal.
107. `UI` Sections expand inline into long walls of text.
108. `UI` No JazzCash-style row list with chevrons and grouped cards.
109. `MISS` No search in settings.

## L · SIGNUP / ACCOUNT CREATION

110. `BUG` Signup does not match the current agreement set or the confirmation window.
111. `MISS` No PIN step visible during signup (you reported "no pin").
112. `MISS` No profile picture step.
113. `COPY` Signup copy predates the current model.
114. `MISS` No income question, so affordability cannot run for a new member.
115. `MISS` No salary-day question, so payday collection cannot be set up.
116. `UI` Signup is not in the wallet layout language.
117. `MISS` No progress indicator across steps.

## M · FORMATTING AND CONSISTENCY

118. `UI` Only the home screen uses the tile language you like; nothing else does.
119. `UI` Receipts still not in the wallet slip style anywhere they are actually shown.
120. `UI` Inline `style={{...}}` still used across CardsPage, CreateCirclePage, CommitteePage.
121. `UI` Mixed corner radii (10 / 12 / 14 / 15 / 17) across cards.
122. `UI` Section headings vary between pages.
123. `UI` Buttons vary in height and weight between pages.
124. `UI` Emoji still used as UI (🔒 💼 ⚠).
125. `UI` Raw enums shown to members (RAAST, PAID, FORMING).
126. `UI` Tables used on mobile for ledger history.
127. `BUG` Rafa bot appears in the wrong place on some screens.
128. `UI` Rafa overlaps the bottom nav and content.

## N · SECURITY (agreed after the above)

129. `DATA` CNIC, phone, email, home GPS and payslips stored unencrypted.
130. `DATA` `SECURITY_RELAXED` can disable lockout and replay checks; must be impossible in production.
131. `MISS` No NADRA face match.
132. `MISS` No WebAuthn/biometric despite being claimed.
133. `MISS` No account-title check.
134. `MISS` No device binding on sessions.
135. `MISS` No secrets rotation or documented restore.

---

## Two blockers outside my control

136. Production database is missing `CONFIRMING`, `WITHDRAWN` and `Committee.avatarUrl`. Until the two additive SQL files are applied, the API cannot deploy, which is why committee pictures and member phone numbers do not appear even though the UI is live.
137. I cannot log in to your app myself, so every visual claim I make is inferred from code and your screenshots rather than seen.
