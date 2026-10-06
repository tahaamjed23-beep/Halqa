# Work Register to Operational at 100,000 Users

28 September 2026.

## Scope

1039 items: 45 done, 26 partly done, 968 open. Every status was confirmed by opening the screen or reading the code, not taken from memory.

The items follow the chairman's decisions of 28 September 2026 on the partner bank (Bank Partnership Revisions, HQ-BK-01, D1 to D16). Items overturned by those decisions were rewritten in place; sections S to Z are new.

Order of work: the bank meeting (section Z1) first, then the partnership and integration (S and T), then the product changes. Sections A to D concern the interface, 341 items.

## A. Visual System

The application already carries a bright green ramp in its stylesheet. It is not applied consistently, five competing accent themes sit beside it, and the supporting material was drawn in a different palette entirely. This section makes one palette govern everything.

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 1 | Adopt the bright green ramp as the only brand palette, across the application, the maps, the deck and every document | index.css | Done |
| 2 | Retire the pine, sand, clay, indigo and plum accent themes, which dilute the brand and triple the visual QA surface | index.css:569 | Done |
| 3 | Remove the accent picker from the appearance screen and reduce it to light and dark | AppearancePage.tsx | Open |
| 4 | Publish the token set as the single source of truth: ramp, neutrals, status, radii, elevation, spacing | new tokens.css | Done |
| 5 | Replace every hard coded colour literal in components with a token reference | 40 components | Open |
| 6 | Define three named elevations and delete every one off shadow value | six stylesheets | Partly done |
| 7 | Define one spacing scale and remove every off scale margin and padding | six stylesheets | Partly done |
| 8 | Define a type scale with named roles and remove every one off font size | six stylesheets | Partly done |
| 9 | Select and self host one display typeface rather than relying on the system stack, which renders differently on every handset | index.css:47 | Done |
| 10 | Select and self host an Urdu typeface that sets Nastaliq correctly | index.css | Done |
| 11 | Subset and preload both typefaces so the first paint does not shift | index.html | Partly done |
| 12 | Normalise every icon to one family, one stroke weight and one grid size | components | Open |
| 13 | Replace the mascot with a flat brand device, or remove it; in its present form it overlaps content on the home, committees, credit and account screens | RafaBot.tsx | Done |
| 14 | Give the assistant a fixed entry point in the header rather than a floating character | RafaBot.tsx | Partly done |
| 15 | Redraw the green header as a defined surface with a controlled edge rather than a slab carrying a stray lighter circle | index.css:53 | Done |
| 16 | Make the header treatment identical on every screen that uses one | HomePage, CreditPage, ProfilePage | Partly done |
| 17 | Replace the blue credit score ring, which clashes with the brand, with the brand ramp | CreditPage.tsx, ProfilePage.tsx | Done |
| 18 | Stop the score ring being clipped by the header edge on the account screen | ProfilePage.tsx | Done |
| 19 | Replace the red outgoing arrows in the activity list, which read as errors, with a neutral treatment | HomePage.tsx | Done |
| 20 | Establish a status colour convention and document it: success, warning, failure, information | tokens | Done |
| 21 | Define one card component with a fixed radius, padding, border and elevation, and route every surface through it | ui.tsx | Partly done |
| 22 | Stop nesting grey tiles inside white cards, which produces a muddy surface | CreditPage.tsx | Open |
| 23 | Define one list row component with a title, an optional subtitle, an optional leading icon and an optional trailing control | ui.tsx | Partly done |
| 24 | Make every list row either carry a subtitle or not, rather than mixing the two in one list | ProfilePage.tsx | Open |
| 25 | Define one button component with primary, secondary, tertiary and destructive variants and three sizes | ui.tsx | Partly done |
| 26 | Define one form field component with label, hint, error and disabled states | ui.tsx | Partly done |
| 27 | Define one badge component and stop badges overlapping the tile above them | HomePage.tsx | Partly done |
| 28 | Define a skeleton for every card, list and chart; the application presently carries five in total | ui.tsx | Partly done |
| 29 | Define an empty state component with an illustration slot, a sentence and an action | ui.tsx | Partly done |
| 30 | Define an error state component with a reason and a retry | ui.tsx | Partly done |
| 31 | Add a dark theme and honour the system preference | tokens | Partly done |
| 32 | Add a reduced motion preference and honour it in every transition | tokens | Done |
| 33 | Produce a one page visual specification for anyone building a new screen | documentation | Open |
| 34 | Fold the five stylesheets that accumulated outside the system into the token set and delete them | styles-*.css | Open |

## B. Navigation

Three different navigation patterns are presently in use and the floating controls collide with content and with one another.

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 35 | Settle one navigation pattern: a large left aligned page title, a back affordance where one applies, and at most two trailing actions | all pages | Partly done |
| 36 | Remove the centred bare title bar used on the committees screen | CirclesPage.tsx | Done |
| 37 | Remove the grey circle back button used on the credit screen and adopt the standard affordance | CreditPage.tsx | Done |
| 38 | Stop the join button overlapping the start a committee button on the committees screen | CirclesPage.tsx | Done |
| 39 | Stop the join button label being cut off at the bottom of the viewport | Shell.tsx | Done |
| 40 | Decide whether joining is a tab, a floating button or a grid action; at present it is all three | Shell.tsx, HomePage.tsx | Done |
| 41 | Remove the vault tab while the surface is withdrawn | Shell.tsx | Done |
| 42 | Reduce the tab bar to four destinations and give each a filled and an outline state | Shell.tsx | Done |
| 43 | Add a search entry point to the home header, which both reference applications carry | HomePage.tsx | Done |
| 44 | Add a notifications entry point with an unread count that clears on read | HomePage.tsx | Partly done |
| 45 | Respect the safe area inset at the bottom on handsets with a gesture bar | index.css | Done |
| 46 | Respect the safe area inset at the top on handsets with a notch | index.css | Done |
| 47 | Give every screen a working hardware back behaviour | App.tsx | Partly done |
| 48 | Preserve scroll position when returning to a list | App.tsx | Open |
| 49 | Add a page transition that communicates depth rather than a hard swap | App.tsx | Done |
| 50 | Add a loading indicator for navigation between lazy boundaries | App.tsx | Done |
| 51 | Give every one of the twenty eight screens a deep link that restores its full state | App.tsx | Done |
| 52 | Fix the committee deep link, which presently shows an unending loading indicator | App.tsx, CommitteePage.tsx | Done |
| 53 | Add a context line inside a committee so the member knows which circle they are in | CommitteePage.tsx | Open |
| 54 | Add a bottom sheet component and use it for secondary actions rather than navigating away | ui.tsx | Partly done |
| 55 | Add a modal component with focus trapping and an escape route | ui.tsx | Partly done |
| 56 | Add a confirmation pattern for destructive actions, with the consequence stated | ui.tsx | Partly done |

## C. Screens

Every screen except Home is rebuilt to the standard of the JazzCash, Easypaisa and SadaPay applications, studied from their own store screenshots on 23 September 2026. The audit behind this section was made on 24 September 2026 by opening every screen of the running application at phone width: 28 screens, the five committee tabs, the sign-in and sign-up screens, and the 25 components that render inside them. Home is the one screen kept as it stands. Sign up and sign in are redesigned from nothing. Part C1 applies to every screen and is checked on each one as it is rebuilt; parts C3 and C4 are done first, because C3 is a legal exposure and C4 is a screen that does not open.

### C1. Common Rules

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 57 | No bezels: no bordered or framed container around a section, and never a card inside a card. Surfaces are separated by fill and space | all screens | Open |
| 58 | No rounded pill or badge shapes, under the standing design rule. Buttons, chips, filters and status labels use square or lightly rounded corners; status is an icon, a colour and a word. The component set built on 23 September uses pill buttons and pill badges and is corrected first | system.css, all screens | Done |
| 59 | No emojis in any screen, share text or notification. The country flag in the number field is the one the app shows today; the API's document verification page carries two symbols | PhoneInput.tsx:13, halqa-api/src/app.ts:106 | Open |
| 60 | No playful or self-referential copy: the assistant's greeting lines, exclamation marks, the tab title "Committee savings, made rewarding", the sign-in slogan, and the error screen's "not a ledger one" | RafaBot.tsx, rafa-knowledge.ts, index.html, AuthPage.tsx, ErrorBoundary.tsx | Open |
| 61 | No over-explaining: at most one line of supporting text under a title. Every explanatory paragraph is cut, or moved behind a single How it works link | all screens | Open |
| 62 | No list-of-rows navigation. A screen whose job is to send the member somewhere becomes an icon grid and cards, in the manner of the JazzCash and Easypaisa inner pages. Rows stay only where the content is itself a ledger: payments, members, turns | ProfilePage, SettingsPage, VerifyPage, ReferPage, FeesPage, AutoPayPage | Open |
| 63 | No eyebrow labels above titles and no capitalised section labels; nine files carry them | AgreementGate, Appearance, CnicCapture, CollectionOrder, ExitSheet, JoinSheet, AuthPage, CommitteePage, CreateCirclePage | Open |
| 64 | No stack of equal-weight panels. A screen opens with its one answer, then the evidence, then the actions. The committee's first tab stacks six panels | CommitteePage.tsx:79 | Open |
| 65 | No decorative circles on any header, hero or band | AuthPage, RewardsPage, VaultPage, HyperPage, CommitteePage | Open |
| 66 | No off-brand colour on a surface: the orange streak card, the blue status chip, the blue information rule | RewardsPage, CommitteePage, MarketplacePage | Open |
| 67 | No raw undefined, NaN or null on screen. Seen on Rewards (Points NaN, Longest run undefined, NaN to go) and on the committee Safety tab (score undefined against every member). Every number and name passes through a guard | format.ts, RewardsPage, ProtectionCenter | Open |
| 68 | No segmented control that wraps to two lines; the committee tabs do | CommitteePage | Open |
| 69 | Row actions (Remove, Make default, Remind) open in a sheet from the row, instead of sitting as buttons under every row | CardsPage, ProtectionCenter | Open |
| 70 | No truncated title in a header; the committee name is cut to "Gulshan ..." | CommitteePage | Open |
| 71 | Every screen checked in dark mode as it is rebuilt, since the older stylesheets hard code white | all screens | Open |

### C2. Sign Up and Sign In

The individual onboarding and identity screens are listed in section D. This part sets the flow and the standard they are built to.

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 72 | Remove the demo credentials printed on the sign-in screen. The line has no environment guard, so "+92 300 1234567 · halqa123" is on the live page for anyone | AuthPage.tsx:538 | Open |
| 73 | Welcome screen: the mark, one line, and two actions, Create account and Sign in. No slogan, no capitalised strapline, no paragraph | AuthPage | Open |
| 74 | Remove the green marketing banner that fills 40 per cent of every sign-in and sign-up screen | AuthPage | Open |
| 75 | Sign in with phone number and PIN, as the wallets do. No password | AuthPage | Open |
| 76 | Cut sign-up from ten steps to five: phone, code, name, CNIC, PIN. Address, work, bank account and review move to verification after the account exists, where they open seats rather than block entry | AuthPage.tsx:48 | Open |
| 77 | Drop the password step. The PIN is the credential on the device and a phone code recovers it | AuthPage | Open |
| 78 | The question is the heading of each step, not "Step 1 of 10"; progress is a thin bar only | AuthPage.tsx:542 | Open |
| 79 | Phone entry: +92 fixed, numeric keypad, digits grouped as they are typed, no flag | PhoneInput.tsx | Open |
| 80 | Code entry: six boxes, automatic advance, paste from the SMS, resend with a visible countdown, and a change number link | AuthPage, otp step | Open |
| 81 | PIN set and confirm on a full screen numeric keypad of its own, matching the unlock screen | AuthPage, PinLock | Open |
| 82 | CNIC step opens the camera capture first and typing second | AuthPage, CnicCapture | Open |
| 83 | Remove the card-within-a-card frame around every step | AuthPage | Open |
| 84 | Remove the nine-link website footer (Cookie Policy, Ad Choices, Advertising and the rest) from sign in; its links also run together with no spaces. Terms and privacy become one line under the final button | LegalFooter.tsx | Open |
| 85 | One specific error per field, shown under that field, and a retry on network failure | AuthPage | Open |
| 86 | Forgotten PIN: phone code, then a new PIN | AuthPage | Open |
| 87 | Sign-up tested end to end against a staging API, since it cannot be tested on production without creating a real account | testing | Open |

### C3. Retired Terms

These screens tell a member things the Legal Position says Halqa does not do. They are fixed before anything else in section C.

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 88 | Hyper shows "30 days · 7 collect a day · 210 members" and "Rs 500 a day for 30 days". Replace with the two fixed configurations and the three way split | HyperPage.tsx | Done |
| 89 | Hyper entry checks ask for "Daily earnings, or a vault balance" with a "Vault minimum Rs 15,000". Remove the vault | HyperPage.tsx | Done |
| 90 | Fees lists an early-turn fee that "goes to the other members" and turn selling at "whatever the buyer bids". Remove both | FeesPage.tsx | Open |
| 91 | Fees does not list the service fee at all. Add the flat fee per instalment by instalment size and roster size, and the hyper split | FeesPage.tsx | Open |
| 92 | Pay says "No charge to contribute. Raast is instant and free." State the fee on every payment | PayPage.tsx | Open |
| 93 | The committee screen carries a chip reading "Turn pricing · 1% early fee → late bonus". Remove it from every circle | ui.tsx TurnPricingChip, CommitteePage | Open |
| 94 | The committee Safety tab shows "Payout holdback 15%: On", "Deposit held" and "Payout held back". Remove them | ProtectionCenter.tsx | Open |
| 95 | The committee Safety tab shows "Credit-weighted turns: On". That ordering was replaced by score bands; remove it | ProtectionCenter.tsx | Open |
| 96 | The turn marketplace says Buy a turn, for sale, bid, and List one of my turns. Recast as a zero-price swap throughout, and rename the Home tile to Swap a turn | MarketplacePage.tsx, HomePage.tsx | Open |
| 97 | The vault is still reachable by link, showing a "Recorded balance" earning "11.19% a year" and "Cover a missed instalment, settled from this balance". Make it unreachable; savings move to the bank savings screen (D12) | VaultPage.tsx, App.tsx | Open |
| 98 | Save for something promises the member will "own it outright" at Halqa's "Rs 50 a month". Hold it until the leasing structure exists | AssetPage.tsx | Open |
| 99 | About states "What a member pays Halqa: Rs 0" and calls Halqa "a record that cannot be argued with" | AboutPage.tsx | Open |
| 100 | Remove every remaining use of record, recorded or recording to describe what Halqa is | all screens | Open |

### C4. Screen Failures

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 101 | Support crashes on open with "Something broke on this screen": it reads tickets.length from an unchecked response | SupportPage.tsx:62 | Done |
| 102 | Statement crashes on open: it reads totals.paidInPaisa from an unchecked response | StatementPage.tsx:68 | Done |
| 103 | Limits crashes on open | LimitsPage.tsx:36 | Done |
| 104 | Devices crashes on open | DevicesPage.tsx:31 | Done |
| 105 | Preview mode has no data for these four endpoints, which is what exposes the missing guards. Add it, since preview is the mode used for demonstrations | preview.ts | Done |
| 106 | Every bottom sheet closed the instant it opened: the back-button handler re-armed on each render and fired its own history entry. Rewritten so a sheet closes only on a real back gesture | lib/back.ts | Done |
| 107 | The tab bar stood seven pixels clear of the bottom edge because two stylesheets set different heights. One height token now governs both | tokens.css, index.css | Done |
| 108 | Rupee amounts broke across lines and read as "Rs215,000" where a narrow space was dropped. A normal non-breaking space is used | lib/format.ts | Done |

### C5. Individual Screens

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 109 | Home: fix the truncated due in figure, which reads 2 days, 23 and stops | HomePage.tsx | Open |
| 110 | Home: replace total recorded with a phrase that names the figure | HomePage.tsx | Done |
| 111 | Home: state what the member owes next, and when, as the first thing on the screen | HomePage.tsx | Open |
| 112 | Home: search field in the header, as both reference applications carry | HomePage.tsx | Done |
| 113 | Home: customisable action grid with an edit control, as JazzCash does | HomePage.tsx | Open |
| 114 | Home: reduce the grid to actions used weekly and move the rest behind a More tile | HomePage.tsx | Open |
| 115 | Home: every grid tile the same icon size, label length and tap target | HomePage.tsx | Open |
| 116 | Home: New and Popular badges inside the tile bounds, and then replaced, since badges fall under the standing rule | HomePage.tsx | Partly done |
| 117 | Home: activity grouped by date | HomePage.tsx | Open |
| 118 | Home: each activity row opens its receipt | HomePage.tsx | Open |
| 119 | Home: circles held as a horizontal card carousel rather than stacked cards | HomePage.tsx | Open |
| 120 | Home: pull to refresh | HomePage.tsx | Open |
| 121 | Home: a skeleton for every block rather than a full screen spinner | HomePage.tsx | Open |
| 122 | Committees: design the single item case, which leaves half the screen empty | CirclesPage.tsx | Open |
| 123 | Committees: committee cards at full contrast; they read as disabled | CirclesPage.tsx | Done |
| 124 | Committees: search across the circles held | CirclesPage.tsx | Open |
| 125 | Committees: filters for status, cadence and role | CirclesPage.tsx | Open |
| 126 | Committees: sort by next due date, amount and name | CirclesPage.tsx | Open |
| 127 | Committees: design the Discover tab, an unstyled list today | CirclesPage.tsx | Open |
| 128 | Committees: design the zero circles empty state | CirclesPage.tsx | Open |
| 129 | Committee: header uses a grey circle back button, cuts the name to "Gulshan ..." and carries a Member view pill. Rebuild on the standard page header | CommitteePage.tsx | Open |
| 130 | Committee: in preview the hero says "Your turn is 1 of 12" while the order below shows the member at turn 3, and reads "Turn 4 of 2". Confirm against production data and correct the formula | CommitteePage.tsx | Open |
| 131 | Committee: the Running status sits in a blue pill | CommitteePage.tsx | Open |
| 132 | Committee: the loading state that never resolved when a circle is opened by link | CommitteePage.tsx | Done |
| 133 | Committee: replace the six second polling loop with a subscription, or lengthen it with backoff | CommitteePage.tsx:261 | Open |
| 134 | Committee: a clear payment state per member, with a filter for unpaid | CommitteePage.tsx | Open |
| 135 | Committee: the member's own position and next due date above everything else | CommitteePage.tsx | Open |
| 136 | Committee: chat in its own tab rather than a section in a long scroll | CommitteePage.tsx | Open |
| 137 | Committee: an unread marker on the chat tab | CommitteePage.tsx | Open |
| 138 | Committee: a members tab with standing, seat and payment history | CommitteePage.tsx | Open |
| 139 | Committee: a rules tab restating the configuration the member agreed to | CommitteePage.tsx | Open |
| 140 | Committee, turns tab: six stacked panels become one hero, the turn strip, and the members grid | CommitteePage.tsx:79 | Open |
| 141 | Committee, safety tab: a list of fourteen switches becomes three cards: what protects this circle, what happens when someone is late, and the member's own standing | ProtectionCenter.tsx | Open |
| 142 | Committee, payments tab: rebuilt to the rules | CommitteePage.tsx | Open |
| 143 | Committee, messages tab: a chat layout in the manner of the wallets | CommitteePage.tsx | Open |
| 144 | Credit report: remove the assistant bubble that covered the affordability section | CreditPage.tsx | Done |
| 145 | Credit report: last three instalments labelled with dates and amounts | CreditPage.tsx | Open |
| 146 | Credit report: score chart with an axis, dates and a readable scale | CreditPage.tsx | Open |
| 147 | Credit report: each score factor explained with the member's own figures | CreditPage.tsx | Open |
| 148 | Credit report: internal score and any bureau figure separated and labelled | CreditPage.tsx | Open |
| 149 | Credit report: the stat strip of three grey tiles inside a white card | CreditPage.tsx | Open |
| 150 | Account: rebuilt as a grid of tiles under three headings, in place of the long list | ProfilePage.tsx | Open |
| 151 | Account: the credit report control in the header as a real button | ProfilePage.tsx | Open |
| 152 | Account: a sign out control, absent today | ProfilePage.tsx | Open |
| 153 | Create a circle: uses its own header (a Back text link, an eyebrow, a small title) instead of the standard one | CreateCirclePage.tsx | Open |
| 154 | Create a circle: the step chips are pills and the third is cut off | CreateCirclePage.tsx | Open |
| 155 | Create a circle: "Give the circle a name first" shows before the member has typed anything | CreateCirclePage.tsx | Open |
| 156 | Create a circle: full cost of the configuration, every fee included, before commitment | CreateCirclePage.tsx | Open |
| 157 | Create a circle: validate each step before the next opens | CreateCirclePage.tsx | Open |
| 158 | Create a circle: live preview of the schedule as the configuration changes | CreateCirclePage.tsx | Open |
| 159 | Pay: the amount reads "Rs 10000", unformatted, with Rs sitting below the figure | PayPage.tsx | Open |
| 160 | Pay: half the screen is empty; the rail choice or a keypad belongs there | PayPage.tsx | Open |
| 161 | Pay: the three parts of the payment shown before the member confirms | PayPage.tsx | Open |
| 162 | Pay: any rail charge shown before the rail is chosen | PayPage.tsx | Open |
| 163 | Pay: pending, settled and failed states, with a reason on failure | PayPage.tsx | Open |
| 164 | Schedule: in preview shows Nothing due while Home shows an instalment due in two days. Confirm against production data | SchedulePage.tsx | Open |
| 165 | Schedule: a calendar as well as a list | SchedulePage.tsx | Open |
| 166 | Statement: exportable as a file | StatementPage.tsx | Open |
| 167 | Rewards: the orange streak card, the grey tiles inside a white card, and reward titles cut mid-word. Rebuild as a progress hero and a grid of reward tiles | RewardsPage.tsx | Open |
| 168 | Hyper: rebuild as the two configuration cards side by side, with the entry checks as one compact progress figure | HyperPage.tsx | Partly done |
| 169 | Activity: keep it as a ledger, and group each day's rows in one card instead of one card per row | ActivityPage.tsx | Open |
| 170 | Payment methods: Remove and Make default buttons under every account move into a sheet; the buttons are pills | CardsPage.tsx | Open |
| 171 | Verification: a progress figure and a grid of checks in place of two lists; remove the capitalised VERIFIED label | VerifyPage.tsx | Open |
| 172 | Settings: a grid in place of the list; the footer links run together with no spaces | SettingsPage.tsx, LegalFooter.tsx | Open |
| 173 | Appearance: remove the accent colour picker, a dead control since the themes were retired | Appearance.tsx | Open |
| 174 | Appearance: the photo control renders as a letter and a broken icon | Appearance.tsx | Open |
| 175 | Appearance: two titles on one screen (Look and feel, then Appearance and personalisation); theme and language chosen from pills | Appearance.tsx | Open |
| 176 | Notifications: Mark everything read has its tick on a line of its own; groups are ordered oldest first | NoticesPage.tsx | Open |
| 177 | Invite: the capitalised YOUR CODE label; the bottom button sits behind the tab bar | ReferPage.tsx | Open |
| 178 | Auto-pay: the capitalised COLLECTED AUTOMATICALLY label | AutoPayPage.tsx | Open |
| 179 | Turn marketplace: grey tiles inside a white card, and a blue information rule | MarketplacePage.tsx | Open |
| 180 | Vault: no header and no back control | VaultPage.tsx | Open |
| 181 | About: essay paragraphs become three short facts and one link | AboutPage.tsx | Open |
| 182 | Error screen: one line and a retry, in place of "Something broke on this screen, your data is safe, this is a display error, not a ledger one" | ErrorBoundary.tsx | Open |
| 183 | Search: kept; checked against C1 | SearchPage.tsx | Open |

### C6. Components

Each is rebuilt to the rules in C1.

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 184 | Turns you can take: layout rewritten on 23 September; its style is not yet applied and its copy still over-explains | SeatEligibility.tsx | Partly done |
| 185 | Circle eligibility | GroupCredit | Open |
| 186 | What you would still owe | ForwardLiability.tsx | Open |
| 187 | Exit votes | ExitVotes.tsx | Open |
| 188 | Collection order | CollectionOrder.tsx | Open |
| 189 | Confirming window | ConfirmingWindow.tsx | Open |
| 190 | Affordability | Affordability.tsx | Open |
| 191 | Score simulator | ScoreSimulator.tsx | Open |
| 192 | Fee schedule | FeeSchedule.tsx | Open |
| 193 | Collection calendar | CollectionCalendar.tsx | Open |
| 194 | Join by code | JoinByCode.tsx | Open |
| 195 | Join sheet | JoinSheet.tsx | Open |
| 196 | Exit sheet | ExitSheet.tsx | Open |
| 197 | Agreements list | MyAgreements.tsx | Open |
| 198 | Weekly undertaking overlay | AgreementGate.tsx | Open |
| 199 | Protection centre | ProtectionCenter.tsx | Open |
| 200 | Risk console | RiskConsole.tsx | Open |
| 201 | Invite share | InviteShare.tsx | Open |
| 202 | Host card | HostCard.tsx | Open |
| 203 | Linked accounts and their manager | LinkedAccounts.tsx, LinkedAccountsManager.tsx | Open |
| 204 | Add a payment source | AddSource.tsx | Open |
| 205 | CNIC capture | CnicCapture.tsx | Open |
| 206 | PIN lock | PinLock.tsx | Open |
| 207 | Receipt | Receipt.tsx | Open |
| 208 | Growth and projection charts | PersonalGrowthChart.tsx, ProjectionChart.tsx | Open |
| 209 | Member status | MemberStatus.tsx | Open |
| 210 | Committee photo prompt | CommitteePage.tsx | Open |
| 211 | The assistant panel | RafaBot.tsx | Open |

## D. Missing Screens

The application presently carries twenty eight screens. Every item below is a screen a member, a host or an administrator needs and cannot reach, because it was never built or because it exists only as a section inside another screen.

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 212 | Welcome and what the product is, shown before the number is asked for | Onboarding | Open |
| 213 | Phone number entry, with the reason for the request stated | Onboarding | Open |
| 214 | Passcode entry, with resend, a timer and a change number route | Onboarding | Open |
| 215 | Set the application PIN | Onboarding | Open |
| 216 | Confirm the application PIN | Onboarding | Open |
| 217 | Forgotten PIN recovery | Onboarding | Open |
| 218 | Biometric enrolment offer | Onboarding | Open |
| 219 | Name and date of birth capture | Onboarding | Open |
| 220 | Address and city capture | Onboarding | Open |
| 221 | Occupation and employer capture | Onboarding | Open |
| 222 | Income declaration, with the reason it is asked | Onboarding | Open |
| 223 | Income verification upload | Onboarding | Open |
| 224 | Income verification status and outcome | Onboarding | Open |
| 225 | CNIC front capture with an alignment guide | Identity | Open |
| 226 | CNIC back capture with an alignment guide | Identity | Open |
| 227 | CNIC manual entry fallback | Identity | Open |
| 228 | CNIC review and confirm before submission | Identity | Open |
| 229 | Identity check in progress | Identity | Open |
| 230 | Identity check failed, with the reason and the next step | Identity | Open |
| 231 | Liveness capture instructions | Identity | Open |
| 232 | Liveness capture | Identity | Open |
| 233 | Verification levels: what each one opens | Identity | Open |
| 234 | Bureau instruction, on a screen of its own | Identity | Open |
| 235 | Bureau instruction confirmation and record | Identity | Open |
| 236 | Adverse action disclosure pack | Identity | Open |
| 237 | Linked accounts list | Accounts and rails | Open |
| 238 | Add a bank account | Accounts and rails | Open |
| 239 | Add a wallet account | Accounts and rails | Open |
| 240 | Account title verification in progress | Accounts and rails | Open |
| 241 | Account title mismatch, with the route to correct it | Accounts and rails | Open |
| 242 | Set the default collection account | Accounts and rails | Open |
| 243 | Remove a linked account, with the consequences stated | Accounts and rails | Open |
| 244 | Collection mandate explainer | Accounts and rails | Open |
| 245 | Authorise a collection mandate | Accounts and rails | Open |
| 246 | Mandate authorised confirmation | Accounts and rails | Open |
| 247 | Mandate list, one row per circle | Accounts and rails | Open |
| 248 | Vary a mandate ceiling | Accounts and rails | Open |
| 249 | Cancel a mandate, with the consequences stated | Accounts and rails | Open |
| 250 | Mandate cancelled confirmation | Accounts and rails | Open |
| 251 | Mandate collection failed, with the reason and the manual route | Accounts and rails | Open |
| 252 | Advance notice of a differing amount | Accounts and rails | Open |
| 253 | Circle templates, for a member who does not know what to configure | Circles | Open |
| 254 | Cadence chooser, with a plain explanation of each | Circles | Open |
| 255 | Roster size chooser, with the pot shown live | Circles | Open |
| 256 | Seat chooser, with each unavailable seat carrying its reason | Circles | Open |
| 257 | Join sheet as a screen of its own | Circles | Open |
| 258 | Split disclosure: what each part of the payment is for | Circles | Open |
| 259 | Mutual guarantee signing | Circles | Open |
| 260 | Undertaking signing | Circles | Open |
| 261 | Signature capture | Circles | Open |
| 262 | Agreement archive | Circles | Open |
| 263 | Confirming window countdown | Circles | Open |
| 264 | Withdraw before start | Circles | Open |
| 265 | Waiting list position | Circles | Open |
| 266 | Host admission queue | Host | Open |
| 267 | Applicant detail, with standing and related accounts | Host | Open |
| 268 | Admission decision record | Host | Open |
| 269 | Roster fill request to Halqa | Host | Open |
| 270 | Collection order assignment | Host | Open |
| 271 | Circle policy settings | Host | Open |
| 272 | Circle risk band explainer | Host | Open |
| 273 | Mandate coverage across the roster | Host | Open |
| 274 | Reminder composer | Host | Open |
| 275 | Removal against the published test | Host | Open |
| 276 | Member vote on a removal | Host | Open |
| 277 | Host accountability record | Host | Open |
| 278 | Circle dissolution | Host | Open |
| 279 | Payment method chooser | Money | Open |
| 280 | Payment confirmation with the full split | Money | Open |
| 281 | Payment pending | Money | Open |
| 282 | Payment failed, with the reason | Money | Open |
| 283 | Receipt detail | Money | Open |
| 284 | Receipt share | Money | Open |
| 285 | Dispute a payment | Money | Open |
| 286 | Dispute status | Money | Open |
| 287 | Payout destination confirmation | Money | Open |
| 288 | Payout released | Money | Open |
| 289 | Payout receipt | Money | Open |
| 290 | Shortfall explanation on a payout | Money | Open |
| 291 | Set off explanation where a member collects and owes in the same round | Money | Open |
| 292 | Partial payment record | Money | Open |
| 293 | Arrears position, stated as owed to the round | Money | Open |
| 294 | Fee schedule, the whole grid | Money | Open |
| 295 | The fee applied to this circle | Money | Open |
| 296 | Discount eligibility: cheque, income, income account | Money | Open |
| 297 | Guarantee cheque registration | Money | Open |
| 298 | Late notice, step one | Recovery | Open |
| 299 | Late notice, step two | Recovery | Open |
| 300 | Late notice, step three | Recovery | Open |
| 301 | Hardship declaration | Recovery | Open |
| 302 | Revised date agreement | Recovery | Open |
| 303 | Cure confirmation | Recovery | Open |
| 304 | Restitution arithmetic | Recovery | Open |
| 305 | Recovery case status | Recovery | Open |
| 306 | Write off record | Recovery | Open |
| 307 | Exit ladder chooser | Exit | Open |
| 308 | Exit sheet with the arithmetic | Exit | Open |
| 309 | Exit cooling window | Exit | Open |
| 310 | Exit confirmation with PIN and face | Exit | Open |
| 311 | Seat transfer to a replacement | Exit | Open |
| 312 | Guarantee release | Exit | Open |
| 313 | Points ledger, with the reason for each entry | Rewards | Open |
| 314 | Waiver ledger | Rewards | Open |
| 315 | Redemption against a future fee | Rewards | Open |
| 316 | Points redeemed in the Halqa marketplace for goods from partner merchants and exchanged with the bank's rewards; no cash out (D4, D9) | Rewards | Open |
| 317 | Referral invitation and status | Rewards | Open |
| 318 | Cover explainer, naming the operator | Takaful | Open |
| 319 | Cover purchase | Takaful | Open |
| 320 | Cover certificate | Takaful | Open |
| 321 | Claim submission | Takaful | Open |
| 322 | Claim status | Takaful | Open |
| 323 | Savings explainer for the bank's short term savings product, named as the bank's (D12) | Savings | Open |
| 324 | Savings subscription | Savings | Open |
| 325 | Savings holding | Savings | Open |
| 326 | Savings redemption | Savings | Open |
| 327 | Help centre index | Support | Open |
| 328 | Help article | Support | Open |
| 329 | Contact support | Support | Open |
| 330 | Complaint record | Support | Open |
| 331 | Service status | Support | Open |
| 332 | Devices and sessions | Settings | Open |
| 333 | Notification preferences | Settings | Open |
| 334 | Language chooser | Settings | Open |
| 335 | Data export request | Settings | Open |
| 336 | Account closure | Settings | Open |
| 337 | Administrative console: circles at risk | Administration | Open |
| 338 | Administrative console: reconciliation exceptions | Administration | Open |
| 339 | Administrative console: identity queue | Administration | Open |
| 340 | Administrative console: dispute queue | Administration | Open |
| 341 | Administrative console: mandate failures | Administration | Open |

## E. Removals

Each construct below implements the previous design and must be gone before the services agreement with the payment partner is executed.

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 342 | Set SIMPLE_MODE to true to withdraw the vault and the earning engines; the turn market returns in its new form under section W (D9) | halqa-web/src/config.ts:21 | Open |
| 343 | Replace the turn premium ledger entry from buyer to seller with a points transfer through the points ledger (D9) | routes/exchange.ts:156 | Open |
| 344 | Replace the ten per cent marketplace fee on the premium with the exchange fee in the fee schedule (D5, D9) | routes/exchange.ts:157 | Open |
| 345 | Re-express premiumPaisa as an asking price in points (D9) | routes/exchange.ts:69 | Open |
| 346 | Restore competitive offers on listings, priced in points, the seller choosing (D9) | routes/exchange.ts:95 | Open |
| 347 | Keep a ceiling on the price of a turn as a share of the pot, as protection for buyers (D9) | routes/exchange.ts:84 | Open |
| 348 | Keep the swap at no price as an option on every tier, beside priced turns (D9) | routes/exchange.ts | Open |
| 349 | Turn market between members: a turn listed with an asking price in points, offers, the price agreed by the two members, the buyer's credit band checked, host approval and the exchange fee (D7, D9), labelled not Shariah compliant unless the bank's Shariah board approves it | lib/turn-swap.ts | Open |
| 350 | Points ledger for the bank's stored value: append only entries for issue, purchase with money, transfer between members, redemption in the marketplace and lapse; no cash out (D4, D9) | new lib/points-ledger.ts | Open |
| 351 | Asset committees financed by the partner bank first, with the modaraba lease kept as the alternative (D13) | lib/asset-committee.ts | Open |
| 352 | Remove earlyFeeBps from the create schema and every dependent branch, fourteen occurrences | routes/committees.ts | Open |
| 353 | Remove the engine copy describing an early fee paid to other members | routes/committees.ts:326 | Open |
| 354 | Remove dividendPooled and the patience weighted split between members | routes/committees.ts, schema.prisma | Open |
| 355 | Remove prizeDrawEnabled from the schema, the create route and round processing | schema.prisma:357, routes/committees.ts:203 | Open |
| 356 | Remove RANDOM_BALLOT and CREDIT_WEIGHTED from the circle creation route, whose default is still credit weighted ordering; the order is set by selection or by the host | routes/committees.ts:197 | Open |
| 357 | Repurpose the time value engine to size the points and waivers owed to later seats. It still computes an early fee charged to early seats and credited to later ones | lib/time-value.ts | Open |
| 358 | Delete bidAprBps | lib/hyper.ts:109 | Open |
| 359 | Delete MAX_APR_BPS | lib/hyper.ts:59 | Open |
| 360 | Delete MAX_DAY_ONE_PAISA | lib/hyper.ts:61 | Open |
| 361 | Rewrite the hyper header comment, which presently describes a priced advance and an annualised ceiling | lib/hyper.ts:1 | Open |
| 362 | Re express the hyper seat price as a flat fee payable to Halqa rather than a bid between members | lib/hyper.ts | Open |
| 363 | Unmount the vault route; savings move to the partner bank's short term savings account (D12) | app.ts:139 | Open |
| 364 | Stop populating accruedYieldPaisa on security deposits | schema.prisma:504, routes/protection.ts | Open |
| 365 | Stop creating payout holdbacks | schema.prisma:521 | Open |
| 366 | Delete the float sweep and the mudarib fee; any return on balances is the bank's, shared with Halqa and paid to members as an end of circle reward (D4, D5) | lib/sukoon.ts:23 | Open |
| 367 | Remove the vault auto cover path from the delinquency pass | services/delinquency.ts | Open |
| 368 | Remove rate and cover copy from six front end files | rafa-knowledge.ts, format.ts, HyperPage.tsx, ProfilePage.tsx, VaultPage.tsx, preview.ts | Open |
| 369 | Remove the Halqa cover facility from the fee book | lib/fee-book.ts | Open |
| 370 | Confine asset committee code behind a flag until the bank's financing product is agreed (D13) | lib/asset-committee.ts, AssetPage.tsx | Open |

## F. Additions

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 371 | Flat member fee, the same for every seat, charged by the partner bank and cut to the lowest level the bank's profit share allows (D5) | lib/fee-book.ts | Open |
| 372 | Correct the per instalment fee constant, which presently stands at Rs 50 against a directed grid of Rs 100 to Rs 500 | lib/fee-book.ts | Open |
| 373 | Flat fee rule on the daily cadence, asserted in code so a graded fee cannot be configured there | lib/hyper.ts | Open |
| 374 | Three way split engine: contribution, takaful contribution and service fee, each to its own ledger account | new lib/split.ts | Open |
| 375 | Assert identity one at creation: pot equals contribution multiplied by the number of rounds | routes/committees.ts | Open |
| 376 | Assert identity two at creation: roster equals members collecting each period multiplied by the number of periods | routes/committees.ts | Open |
| 377 | Points ledger, issued by Halqa, as compensation to later seats | new model | Open |
| 378 | Fee waiver credit, issued by Halqa, as compensation to later seats | new model | Open |
| 379 | Redemption path for points against fees and in the Halqa marketplace (D4) | routes/rewards.ts | Open |
| 380 | Host required on every circle, including daily cadence circles | routes/committees.ts | Open |
| 381 | Host accountability record: who admitted each member to the roster | new model | Open |
| 382 | Fee display that states the flat fee in rupees and never a rate | components | Open |
| 383 | Bureau consent capture as a separate screen naming the bureau and the request | new page | Open |
| 384 | Bureau consent record hashed and timestamped on the pattern of the undertaking | routes/agreements.ts | Open |
| 385 | Adverse action pack: the report relied on, the bureau name, address and telephone number, the statutory summary of rights and a statement that the bureau did not decide | new page | Open |
| 386 | Review and gate member visible credit scores inside a circle | CommitteePage.tsx | Open |
| 387 | Fee schedule surface stating every charge before a member commits | FeesPage.tsx | Open |
| 388 | Correct the discount constants to eighty per cent for a cheque, fifty per cent for verified income, and a mandatory income account on unknown committees and Hyper | lib/discounts.ts | Open |

## G. Collection

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 389 | Implement tier one: payment by card, wallet or Raast Request to Pay through Safepay, one approval each time, with each part settled to its owner (HQ-CP-09) | lib/payment-provider.ts | Open |
| 390 | Implement tier two, the auto debit: a saved debit card charged by Safepay as a merchant initiated payment, mandatory on unknown committees and Hyper, with a second saved card tried once when the first is declined for lack of funds (HQ-CP-02) | lib/auto-debit.ts | Open |
| 391 | Card saving through Safepay: Safepay's own card page in the application, the card bank's 3-D Secure check, and only the customer and token references stored (HQ-CP-02) | new lib/safepay-cards.ts | Open |
| 392 | Charges scheduled as merchant initiated payments on the saved card, never above one instalment, each settled into the collecting member's account at the partner bank with the cover part and the fee posted separately (D3) | lib/auto-debit.ts | Open |
| 393 | Webhook receiver: signature and time stamp verified, messages older than five minutes or already received rejected, outcome written to the ledger in one transaction | new routes/partner-webhook.ts | Open |
| 394 | Wallet limit check at seat allocation: a pot that would take the collecting member's wallet past its monthly limit is paid to their bank account instead (EMI Regulations 2023, para 14.II(a)) | lib/payout.ts | Open |
| 395 | Card disputes: an evidence pack for each dispute, and a dispute after collection treated as a default after collection (HQ-CP-02) | new lib/disputes.ts | Open |
| 396 | Income account verification: title inquiry, statement integrity checks, the salary pattern score, and the Hyper daily income floor of Rs 1,000 on at least five days of every week for eight weeks (HQ-MF-03) | lib/salary-pattern.ts | Open |
| 397 | Implement tier three: the member sends over Raast to the collecting member's Raast ID shown in the application, matched by its reference. Cash and bank transfers stay recorded against a reference and confirmed by the host | new send screen, routes/payments.ts | Open |
| 398 | Member fee charged by the partner bank with each instalment, and Halqa paid its share under the partnership (D5) | lib/fee-collection.ts | Open |
| 399 | Assign each day's Hyper payers to that day's collectors, so every payer pays one collector directly and no pool exists | new lib/hyper-assign.ts | Open |
| 400 | Select the tier automatically by cadence, instalment size and the member own history | new lib/collection-policy.ts | Open |
| 401 | Mandate register: account, ceiling, cadence, the text authorised, the time and the address | new model | Open |
| 402 | Mandate authorisation flow, with the terms stated on their own screen | new page | Open |
| 403 | Mandate cancellation inside the application, effective without a call or a form | new page | Open |
| 404 | Advance notice where an amount will differ from the amount stated at authorisation | new job | Open |
| 405 | Confirmation to the member of every collection taken under a mandate | new job | Open |
| 406 | Daily mandate run, sharded, idempotent and resumable | new job | Open |
| 407 | Retry policy for a failed mandate collection, with a stated schedule and a ceiling on attempts | new job | Open |
| 408 | Reason codes for every failure, mapped to a sentence the member understands | new lib | Open |
| 409 | Arrears recorded against the round, never as a negative balance held by Halqa | routes/payments.ts | Open |
| 410 | Assertion in code that no member balance can be created | routes/payments.ts | Open |
| 411 | Reconciliation against the partner's settlement report, on a schedule | new job | Open |
| 412 | Exception queue for reconciliation breaks | new admin page | Open |
| 413 | Refund and reversal path through the same rail, with the ledger entry reversed with it | routes/payments.ts | Open |
| 414 | Dispute suspends the mandate while it is open | routes/payments.ts | Open |
| 415 | Idempotency key on every settlement, enforced at the database level | schema.prisma | Open |
| 416 | Signed callback verification on every provider confirmation | routes/payments.ts | Open |
| 417 | Circuit breaker on persistent provider failure, directing members to another rail | lib/payment-provider.ts | Open |
| 418 | Title inquiry before an account anchors collection | lib/payment-provider.ts | Open |
| 419 | Rail cost display before a charged rail is chosen | PayPage.tsx | Open |
| 420 | Rail selection policy documented against instalment size, since a percentage rail consumes a rising share of a flat fee | documentation | Open |
| 421 | Consolidated daily notice on the daily cadence, one message rather than one per member per day | new job | Open |
| 422 | Merchant agreement with Safepay kept for tier one card and wallet payments and the card auto debit, settling each contribution into the collecting member's account at the partner bank (D3) | commercial | Open |
| 423 | Fallback: contributions moved between members' accounts at the partner bank, with Safepay limited to card and wallet payments (D2, D3) | commercial | Open |
| 424 | Mandate facility added to that agreement as a commercial term | commercial | Open |
| 425 | Sandbox integration completed and signed off | integration | Open |
| 426 | Production credentials held in the managed secret store | infrastructure | Open |
| 427 | Live rail enabled behind a flag, with a staged rollout | lib/payment-provider.ts | Open |
| 428 | Settlement account opened in the company name for fee revenue only | commercial | Open |
| 429 | Daily settlement report ingested automatically rather than by hand | new job | Open |
| 430 | Payment operations runbook written and rehearsed | documentation | Open |
| 431 | Remove the live branch that throws not implemented once the rail is connected | lib/payment-provider.ts | Open |

## H. Takaful

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 432 | If the bank chooses takaful as the cover (D7): written agency agreement with a general takaful operator, Pak-Qatar General Takaful or Salaam Takaful, under section 96(2) of the Insurance Ordinance 2000, with Halqa in the operator's register of agents under section 98 | commercial | Open |
| 433 | Agency agreement checked against regulation 4 of the Corporate Insurance Agents Regulations 2020, and staff who sell cover certified under regulation 22 | legal | Open |
| 434 | Class 6 credit takaful for unknown committees and Hyper, with the monthly product priced on the stress case at launch (HQ-MF-05) | commercial | Open |
| 435 | Product terms agreed: what is covered, what is excluded, and how it is priced | commercial | Open |
| 436 | Takaful contribution taken as a fixed part of every daily payment | lib/split.ts | Open |
| 437 | Contribution remitted to the participants risk fund and never held by Halqa | lib/split.ts | Open |
| 438 | Separate ledger account for the risk fund, reconciled separately | ledger | Open |
| 439 | Cover mandatory on every unknown committee and on Hyper, priced per member and shown before commitment; optional on known committees | new page | Open |
| 440 | Cover certificate issued to the member | new page | Open |
| 441 | Claim submission with the payment record attached as evidence | new page | Open |
| 442 | Claim status visible to the member and to the host | new page | Open |
| 443 | Commission from the operator recorded as Halqa revenue and disclosed to the member | ledger | Open |
| 444 | Surplus and deficit treatment documented for the member: surplus belongs to participants, deficit is met by an operator advance | content | Open |
| 445 | Assertion in code that Halqa never promises to pay on another member loss | review | Open |
| 446 | Counsel review of the agency arrangement before cover is offered | legal | Open |

## I. Savings

The savings product built on a trustee and an asset manager is retired. Savings now sit in the partner bank's own short term product (D12).

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 447 | Savings through the partner bank's short term savings account for the gap of about seven days between salary and the due date on the 8th (D12) | bank | Open |
| 448 | Bank savings product agreed: profit calculated on the daily balance for money held a few days | commercial | Open |
| 449 | Salary credited to the member's account at the partner bank moves to the short term savings product until the due date | integration | Open |
| 450 | Automatic transfer from savings to the committee debit on the due date | integration | Open |
| 451 | Profit on the savings product credited by the bank to the member's account | bank | Open |
| 452 | Savings screen showing the bank's product, its rate and its terms, stated as the bank's product | new page | Open |
| 453 | No return earned by Halqa on any member's money; all balances held and remunerated by the bank | legal | Open |
| 454 | Halqa's share of bank income recorded as revenue under the partnership agreement (D5) | ledger | Open |
| 455 | Retire the trustee and fund distribution structure from every document and screen | documents | Open |
| 456 | Rates stated as the bank's published rates, never promised by Halqa | content | Open |
| 457 | Electronic Transactions Ordinance section 31(1)(c) checked: no circle constituted as an express trust on an electronic signature | legal | Open |
| 458 | Vault route replaced by the bank savings screen | app.ts | Open |

## J. Credit Data

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 459 | Subscriber agreement with TASDEEQ, with DataCheck as the alternate | commercial | Open |
| 460 | Bureau consent step agreed with TASDEEQ, so the instruction reaches the bureau from the member. No electronic power of attorney is relied on, since the Electronic Transactions Ordinance 2002 excludes it at section 31(1)(b) | legal | Open |
| 461 | Bureau request made only on a member instruction, enforced in code | new lib | Open |
| 462 | Instruction record hashed, timestamped and addressed | routes/agreements.ts | Open |
| 463 | Bureau report stored separately from the internal score and on its own scale | schema.prisma | Open |
| 464 | Adverse action obligation implemented before any score based restriction operates | new page | Open |
| 465 | Disclosure limits reviewed: bureau derived information not shown to other members | CommitteePage.tsx | Open |
| 466 | Dispute route to the bureau correction process, with the entry marked while open | new page | Open |
| 467 | Internal score explained to the member in terms of their own record | CreditPage.tsx | Open |
| 468 | Score bands documented and applied only to which seats may be claimed | lib/score-bands.ts | Open |
| 469 | Credit reporting from launch day one: committee payment records reported through TASDEEQ or directly by the partner bank, the bank deciding (D11) | section X | Open |
| 470 | Reporting to the State Bank's credit information bureau by the partner bank, if it reports directly (D11) | bank | Open |
| 471 | Affordability gate rebuilt to the five tests of the Affordability Model (HQ-MF-02), on unknown committees and Hyper only: a third of verified income, 40 per cent with TASDEEQ reported loans, and weighted load and forward liability from the fourth committee | lib/affordability.ts | Open |
| 472 | Identity confidence score combining the name, face, address, account, phone and job checks, setting levels 1 to 3 (HQ-MF-04) | new lib/identity-score.ts | Open |
| 473 | Exposure summed across every circle held | lib/exposure-score.ts | Open |
| 474 | Forward liability measured at the point of seat selection | lib/forward-liability.ts | Open |
| 475 | New member confinement to the final seats until two clean circles are completed | lib/score-bands.ts | Open |

## K. Registrations and Governance

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 476 | SECP incorporation as a private limited company through eZfile, with the registered office in Islamabad | registration | Open |
| 477 | Memorandum object clause drafted to the restructured model | legal | Open |
| 478 | National Tax Number from the Federal Board of Revenue | registration | Open |
| 479 | Sales tax registration in the Islamabad Capital Territory; IT enabled services at 15 per cent, the classification confirmed by a tax adviser | registration | Open |
| 480 | Company account at the partner bank for Halqa's own revenue | commercial | Open |
| 481 | Trademark filing with the Intellectual Property Organisation | registration | Open |
| 482 | NADRA checks: the bank's own at account opening; Halqa's Verisys agreement only for checks the bank does not share (D10) | commercial | Open |
| 483 | Member undertaking reviewed by counsel: the sum owed stated after each round, enforceable by civil suit; the summary procedure of Order XXXVII applies only to a guarantee cheque | legal | Open |
| 484 | Mutual guarantee reviewed by counsel as a separate member to member instrument | legal | Open |
| 485 | Collection mandate text reviewed by counsel, stating amount, cadence, ceiling and cancellation | legal | Open |
| 486 | Arbitration clause naming the dispute route before a dispute arises | legal | Open |
| 487 | No custody clause stating that Halqa holds no member money: all balances sit with the partner bank | legal | Open |
| 488 | Member agreement, privacy, cookies, advertising, community and fees, versioned together | legal | Open |
| 489 | Written opinion of counsel on limb twelve of the financial institution definition | legal | Open |
| 490 | Confirmation that no product surface proposes a payment determined by the drawing of a lot | review | Open |
| 491 | Data protection position documented, including where records sit | documentation | Open |
| 492 | Record retention schedule for identity and transaction records | documentation | Open |
| 493 | Complaints procedure published | documentation | Open |
| 494 | Terms acceptance recorded with the version, the hash, the address and the time | routes/agreements.ts | Open |
| 495 | Board and shareholding settled before the first external agreement: the chairman's father as director and first chief executive, with a second adult director or as a single member company, and Taha Amjed's shares held as counsel advises until he is 18 (Companies Act 2017, sections 153, 154 and 186) | corporate | Open |
| 496 | Insurance for the company itself, separate from member cover | commercial | Open |
| 497 | Regulatory position under the partner bank: product approvals obtained by the bank and Halqa assessed under the bank's outsourcing framework (D15) | documentation | Open |

## L. Platform and Scale

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 498 | Create the migration history; the project presently has no migrations directory at all | prisma/migrations | Open |
| 499 | Apply to production the additive SQL for the two user columns that exist in code and not in production. The SQL is written, at prisma/additive-2026-07-23-locality-jobtitle.sql | prisma | Partly done |
| 500 | Adopt a migrate deploy step in the release pipeline rather than pushing the schema | pipeline | Open |
| 501 | Bound every unbounded query: 50 of the 62 findMany calls in the API fetch without a limit, 21 of them in routes/committees.ts | halqa-api/src | Open |
| 502 | Add cursor pagination to every list endpoint | halqa-api/src/routes | Open |
| 503 | Add an index for every list query and every foreign key that drives one | prisma/schema.prisma | Open |
| 504 | Review every N plus one query introduced by nested includes | halqa-api/src | Open |
| 505 | Add a connection pool sized for the serverless execution model | prisma | Open |
| 506 | Move the delinquency sweep to a sharded job rather than one pass | services/delinquency.ts | Open |
| 507 | Move payouts to a queue with retry and a dead letter path | new queue | Open |
| 508 | Move notifications to a queue with rate limiting per member | new queue | Open |
| 509 | Add idempotency to every job so a retry cannot double process | jobs | Open |
| 510 | Add a scheduled job monitor that alerts when a run is missed | monitoring | Open |
| 511 | Add caching for reference data rather than fetching it per request | halqa-api/src | Open |
| 512 | Add a read path that does not touch the primary for heavy list views | infrastructure | Open |
| 513 | Load test the collection path at one hundred thousand members and a daily cadence | testing | Open |
| 514 | Load test the round close and payout path at the same scale | testing | Open |
| 515 | Measure and record the cost per member per month at that scale | documentation | Open |
| 516 | Confirm the serverless execution ceiling is not reached by any job | infrastructure | Open |
| 517 | Add point in time recovery and an independent nightly copy | infrastructure | Open |
| 518 | Rehearse a restore and record how long it takes | operations | Open |
| 519 | Add structured logging with a request identifier carried end to end | halqa-api/src | Open |
| 520 | Add error monitoring with alerting to a named person; there is presently none | infrastructure | Open |
| 521 | Add performance monitoring on the payment and payout paths | infrastructure | Open |
| 522 | Add uptime monitoring on the application, the API and the rails | infrastructure | Open |
| 523 | Add a public status page | infrastructure | Open |
| 524 | Add a staging environment with its own database | infrastructure | Open |
| 525 | Add a documented rollback procedure | operations | Open |
| 526 | Add a feature flag service so a surface can be withdrawn without a deploy | infrastructure | Open |
| 527 | Review the region placement of the database against the users it serves | infrastructure | Open |
| 528 | Add a data export job that produces a member record in full | new job | Open |
| 529 | Add a data deletion job that honours a closure request | new job | Open |
| 530 | Add an append only audit log, retained separately from the application database | infrastructure | Open |
| 531 | Add a double entry assertion that debits equal credits, run on a schedule | new job | Open |
| 532 | Add a ledger integrity check against the settlement report | new job | Open |
| 533 | Add a bundle size budget and enforce it in the build | pipeline | Open |
| 534 | Measure and improve first contentful paint on a low end handset | halqa-web | Open |
| 535 | Add an offline path for reading a schedule and a receipt | halqa-web | Open |
| 536 | Add a service worker with a considered cache policy | halqa-web | Open |
| 537 | Confirm the application works on a two gigabyte handset over a third generation connection | testing | Open |

## M. Security

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 538 | Correct the permissions policy header, which sets camera and geolocation to none and so breaks CNIC capture and the home location pin in production (confirmed against the live headers on 24 September) | halqa-web/vercel.json:11 | Open |
| 539 | Review the content security policy and remove any unsafe directive | halqa-web/vercel.json | Open |
| 540 | Confirm strict transport security across the domain | halqa-web/vercel.json | Open |
| 541 | Confirm the cross origin policy admits only the application origins | halqa-api/src/app.ts | Open |
| 542 | Rate limit every route, per member and per address, tighter on authentication | halqa-api/src | Open |
| 543 | Add a bot challenge before an account is created | routes/auth.ts | Open |
| 544 | Add signup velocity limits per device and per address | routes/auth.ts | Open |
| 545 | Confirm every route checks membership, hosting or ownership before acting | halqa-api/src/routes | Open |
| 546 | Confirm every request is validated against a schema before reaching business logic | halqa-api/src/routes | Open |
| 547 | Confirm internal fields never reach the client | halqa-api/src | Open |
| 548 | Move every credential into a managed store and rotate on a schedule | infrastructure | Open |
| 549 | Encrypt identity images at rest and log every access | infrastructure | Open |
| 550 | Confirm rail tokens are held by the partner and never stored by Halqa | lib/payment-provider.ts | Open |
| 551 | Add server side session revocation and a device list the member controls | routes/auth.ts | Open |
| 552 | Add step up authentication before a payout destination is changed | routes/account.ts | Open |
| 553 | Add step up authentication before a mandate is authorised | new route | Open |
| 554 | Add anomaly detection on collection destination changes | new job | Open |
| 555 | Separate administrative access from application access, in named accounts | infrastructure | Open |
| 556 | Require two factor authentication on hosting, database and domain accounts | infrastructure | Open |
| 557 | Add dependency scanning to the build and fail on high severity | pipeline | Open |
| 558 | Add secret scanning across the repository and its history | pipeline | Open |
| 559 | Add static analysis for injection and authorisation defects | pipeline | Open |
| 560 | Commission a penetration test before real money moves | external | Open |
| 561 | Write an incident response plan with a named owner | documentation | Open |
| 562 | Write a breach notification procedure | documentation | Open |
| 563 | Add a vulnerability disclosure route | documentation | Open |
| 564 | Add sanctions and politically exposed person screening at onboarding | new lib | Open |
| 565 | Add ongoing monitoring of patterns against the declared profile | new job | Open |
| 566 | Add fraud rules for repeated identity submissions and unusual account linking | new lib | Open |
| 567 | Add the capability to produce a suspicious transaction report if the obligation is ever held | new job | Open |

## N. Testing and Release

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 568 | Extend the API test suite to the routes; the 18 test files in the service cover the engines only | halqa-api/tests | Partly done |
| 569 | Unit test the split engine against both hyper configurations | testing | Open |
| 570 | Unit test the two identities and confirm a breaking configuration is refused | testing | Open |
| 571 | Unit test the fee grid at every band | testing | Open |
| 572 | Unit test the discount grid, including that discounts do not stack | testing | Open |
| 573 | Unit test the threshold engine at green, amber and red | testing | Open |
| 574 | Unit test the exit ladder arithmetic | testing | Open |
| 575 | Unit test the delinquency ladder at each step | testing | Open |
| 576 | Unit test set off where a member collects and owes in the same round | testing | Open |
| 577 | Unit test idempotency on settlement | testing | Open |
| 578 | Integration test the whole collection path against the partner's sandbox | testing | Open |
| 579 | Integration test the payout path | testing | Open |
| 580 | Integration test mandate authorisation, variation and cancellation | testing | Open |
| 581 | End to end test the twenty most common member journeys | testing | Open |
| 582 | End to end test the host journeys | testing | Open |
| 583 | Visual regression test every screen at three widths | testing | Open |
| 584 | Accessibility test every screen against the published criteria | testing | Open |
| 585 | Add type checking, linting and tests as required checks on every change | pipeline | Open |
| 586 | Add a preview deployment for every change | pipeline | Open |
| 587 | Add a release checklist and require sign off | process | Open |
| 588 | Add a staged rollout mechanism | pipeline | Open |
| 589 | Add a kill switch for the collection job | operations | Open |
| 590 | Record a manual test script for the journeys automation does not cover | documentation | Open |
| 591 | Run the full suite against production data shapes before the first live collection | testing | Open |

## O. Content and Accessibility

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 592 | Write every screen in plain language for a member with no financial background | content | Open |
| 593 | Remove every term that implies Halqa holds money | content | Open |
| 594 | Remove every term that implies a rate, a return or an advance | content | Open |
| 595 | Write the Urdu translation of every string, by a translator rather than by machine | content | Open |
| 596 | Add a language chooser and remember the choice | SettingsPage.tsx | Open |
| 597 | Confirm the layout holds when a string is twice as long | testing | Open |
| 598 | Write the error message for every failure reason, in both languages | content | Open |
| 599 | Write the empty state for every list, in both languages | content | Open |
| 600 | Write the help article for every feature | content | Open |
| 601 | Write the onboarding explanation of what a committee is | content | Open |
| 602 | Write the explanation of the three way split | content | Open |
| 603 | Write the explanation of the mandate and how to cancel it | content | Open |
| 604 | Write the explanation of the fee and why it is flat | content | Open |
| 605 | Write the explanation of cover and who writes it | content | Open |
| 606 | Write the explanation of the credit score and what moves it | content | Open |
| 607 | Give every interactive element an accessible name | components | Open |
| 608 | Give every image and icon alternative text or an explicit hidden marking | components | Open |
| 609 | Confirm every tap target meets the minimum size | components | Open |
| 610 | Confirm colour is never the only carrier of meaning | components | Open |
| 611 | Confirm contrast on every text and control against the background | components | Open |
| 612 | Add a visible focus state to every interactive element | components | Open |
| 613 | Confirm the application is usable with a screen reader end to end | testing | Open |
| 614 | Confirm the application is usable at the largest system text size | testing | Open |
| 615 | Add a text size preference inside the application | SettingsPage.tsx | Open |

## P. Measurement

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 616 | Add product analytics with a defined event taxonomy | infrastructure | Open |
| 617 | Instrument the signup funnel end to end | analytics | Open |
| 618 | Instrument the identity verification funnel | analytics | Open |
| 619 | Instrument circle creation and join | analytics | Open |
| 620 | Instrument mandate authorisation | analytics | Open |
| 621 | Instrument collection success by rail and by tier | analytics | Open |
| 622 | Instrument first payment failure and recovery | analytics | Open |
| 623 | Instrument default by circle, by cadence and by seat | analytics | Open |
| 624 | Instrument the threshold bands across live circles | analytics | Open |
| 625 | Build the operating dashboard: signups, active circles, collection rate, mandate coverage, default rate | admin | Open |
| 626 | Build the risk dashboard: expected loss against accumulated cover, per circle | admin | Open |
| 627 | Build the finance dashboard: fee revenue, rail cost, commission, net | admin | Open |
| 628 | Define the weekly review and who attends it | process | Open |
| 629 | Confirm no analytics event carries personal data into a third party | review | Open |

## Q. Distribution

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 630 | Decide between a wrapped web application and a native build, and record the reason | decision | Open |
| 631 | Register an Apple developer account in the company name | registration | Open |
| 632 | Register a Google Play developer account in the company name | registration | Open |
| 633 | Complete Apple financial services declarations | compliance | Open |
| 634 | Complete Google Play financial services declarations, which are strict for Pakistani lending adjacent applications | compliance | Open |
| 635 | Prepare the data safety declaration honestly against what is actually collected | compliance | Open |
| 636 | Prepare the privacy policy at a public address | content | Open |
| 637 | Prepare the account deletion route required by both stores | compliance | Open |
| 638 | Produce the application icon at every required size | design | Open |
| 639 | Produce store screenshots at every required size, in both languages | design | Open |
| 640 | Write the store listing in both languages | content | Open |
| 641 | Produce a preview video | design | Open |
| 642 | Set up staged rollout and a rollback path on both stores | operations | Open |
| 643 | Set up crash reporting on the released build | infrastructure | Open |
| 644 | Set up a forced update mechanism for a critical fix | infrastructure | Open |
| 645 | Confirm the build runs on the oldest supported operating system version | testing | Open |
| 646 | Confirm deep links open the application rather than the browser | testing | Open |
| 647 | Confirm push notification permission is requested at a sensible moment | testing | Open |
| 648 | Prepare the review response process for store reviews | process | Open |
| 649 | Prepare for the first store rejection, which is likely on a financial application | process | Open |

## R. Operations

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 650 | Staff a support channel with a stated response time | operations | Open |
| 651 | Write the runbook for a failed collection run | documentation | Open |
| 652 | Write the runbook for a failed payout | documentation | Open |
| 653 | Write the runbook for a partner outage | documentation | Open |
| 654 | Write the runbook for a reconciliation break | documentation | Open |
| 655 | Write the runbook for a disputed collection | documentation | Open |
| 656 | Write the runbook for a circle that crosses the threshold | documentation | Open |
| 657 | Write the escalation path and who is on it | documentation | Open |
| 658 | Define the hardship path and who may grant it | process | Open |
| 659 | Define the write off authority and its ceiling | process | Open |
| 660 | Define the removal review, so a host decision can be appealed | process | Open |
| 661 | Train whoever answers support on what Halqa may and may not say about money | process | Open |
| 662 | Confirm no process permits a collections telephone call | review | Open |
| 663 | Confirm no process permits contacting a third party about a member debt | review | Open |
| 664 | Record every complaint with its outcome | operations | Open |
| 665 | Review the register itself monthly against what has shipped | process | Open |

## S. Partner Bank

The commercial, legal and governance work of the partnership with the bank (D1, D15).

### S1. Agreement

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 666 | Heads of terms with Mashreq Bank Pakistan: roles, exclusivity, pilot, member fee, profit share, data and branding | commercial | Open |
| 667 | Services agreement stating Halqa as the system and the bank as the licensed holder and mover of money (D15) | legal | Open |
| 668 | Schedule of functions: each function assigned to Halqa or to the bank, with the owner of every record | legal | Open |
| 669 | Service levels: availability of the bank's interfaces, response times, incident notice periods | legal | Open |
| 670 | Member fee charged by the bank, with the share of income paid to Halqa and the formula for it (D5) | commercial | Open |
| 671 | Profit share on committee balances paid to Halqa monthly, with the bank's calculation shown line by line | commercial | Open |
| 672 | Minimum monthly amount to Halqa during the pilot, covering its operating cost | commercial | Open |
| 673 | Exclusivity for committee accounts for an agreed period, tied to pilot and launch dates | commercial | Open |
| 674 | Branding: Halqa is the brand the member uses; the bank is named as the holder of money on payment screens and receipts | commercial | Open |
| 675 | Data clause: purposes, member consent, retention, deletion, and use limited to the partnership | legal | Open |
| 676 | Intellectual property: Halqa owns the committee engine, the models and the interface; the bank owns account data | legal | Open |
| 677 | Liability: the bank for account and payment errors; Halqa for committee rules and calculations | legal | Open |
| 678 | Exit: migration of accounts and committee records if the partnership ends, with no member losing money or history | legal | Open |
| 679 | Business continuity duties of both parties | legal | Open |
| 680 | Audit rights of the bank and of the State Bank over Halqa's systems and records | legal | Open |
| 681 | Complaints routed between the bank's complaint unit and Halqa's support, with stated timelines | legal | Open |
| 682 | Confidentiality agreement signed before the first technical session | legal | Open |
| 683 | Governing law and dispute resolution | legal | Open |
| 684 | Change control: product rules changed only with both parties' approval | legal | Open |
| 685 | Annual pricing review | commercial | Open |

### S2. Regulatory

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 686 | The bank's board approval of the arrangement under the State Bank's framework for outsourcing | bank | Open |
| 687 | Halqa's pack for the bank's outsourcing assessment: company, ownership, finances, security and continuity | documents | Open |
| 688 | Whether committee accounts need State Bank approval or notice as a new product | bank | Open |
| 689 | Limits that apply to a digital retail bank during the pilot and the transition phase | bank | Open |
| 690 | Shariah board approval of the committee product for the Islamic window | bank | Open |
| 691 | Shariah board ruling on the end of circle reward paid in points (D4) | bank | Open |
| 692 | Shariah board ruling on the turn market, and its labelling if not approved (D9) | bank | Open |
| 693 | Opinion of counsel on Halqa as the bank's service provider, and on section 84 of the Companies Act now resolved | legal | Open |
| 694 | Opinion of counsel on points bought with money and redeemed with merchants as the bank's stored value (D4, D9) | legal | Open |
| 695 | Opinion of counsel on the turn market under the SECP rules for peer to peer lending (D9) | legal | Open |
| 696 | Opinion of counsel on credit reporting from day one, through TASDEEQ or the bank (D11) | legal | Open |
| 697 | Virtual Assets Act 2026 position restated: points as the bank's rupee denominated stored value | legal | Open |
| 698 | Money laundering: the bank's programme applied to committee flows, with Halqa's data feed for monitoring | compliance | Open |
| 699 | Consumer protection: the bank's fair treatment rules applied to committee products; disclosures agreed | compliance | Open |
| 700 | Data protection: which party controls each record and where it is kept | compliance | Open |
| 701 | Record retention aligned with the bank: ten years for identity and transaction records | compliance | Open |

### S3. Due Diligence

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 702 | Company incorporated before any agreement, with the registered office in Islamabad | corporate | Open |
| 703 | Management accounts, shareholding and funding plan for the bank's review | finance | Open |
| 704 | Information security questionnaire answered | security | Open |
| 705 | Independent penetration test, with every finding fixed | security | Open |
| 706 | Business continuity and disaster recovery plan, tested | security | Open |
| 707 | Vetting policy for staff and contractors, including the software house | governance | Open |
| 708 | Policies: information security, data protection, acceptable use, incident response, vendor management | governance | Open |
| 709 | The document set and its verification method offered as evidence of Halqa's models | documents | Open |
| 710 | Demonstration environment with test data only, for the bank | technology | Open |
| 711 | Fallback banks prepared with contacts: Meezan Bank, BankIslami, JS Bank, Bank Alfalah (D1) | commercial | Open |
| 712 | Pitch pack adaptable to each fallback bank | documents | Open |

### S4. Governance

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 713 | Partnership steering committee with members from both sides, meeting monthly | governance | Open |
| 714 | Joint risk review of arrears, complaints and fraud each month | governance | Open |
| 715 | Joint product committee for every rule change | governance | Open |
| 716 | Monthly report to the bank: members, balances, collections, arrears, complaints | reporting | Open |
| 717 | Pilot measures agreed in advance, with the decision rule for scaling | reporting | Open |
| 718 | Named contacts on both sides for operations, technology, compliance and escalation | governance | Open |

### S5. Member Terms

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 719 | Member agreement rewritten for three parties: the member, Halqa and the bank | legal | Open |
| 720 | Privacy policy rewritten: which records Halqa holds and which the bank holds | legal | Open |
| 721 | Direct debit mandate terms in the bank's form, shown inside Halqa | legal | Open |
| 722 | Points terms: issue, purchase, transfer as the price of a turn, redemption, expiry and no cash out | legal | Open |
| 723 | Marketplace terms: the merchant as seller, delivery, returns and refunds in points | legal | Open |
| 724 | Turn market terms: listing, offers, price ceiling, host approval, cooling off and cancellation | legal | Open |
| 725 | Cover terms for the option the bank chooses: guarantee, insurance or takaful | legal | Open |
| 726 | Credit reporting consent, naming the reporting route the bank chooses | legal | Open |
| 727 | Savings product terms in the bank's form | legal | Open |
| 728 | Terms for members abroad using accounts for non resident Pakistanis | legal | Open |
| 729 | Experimental terms for Hyper | legal | Open |
| 730 | Complaints procedure covering both Halqa and the bank | legal | Open |
| 731 | Every member document translated into Urdu and checked by a translator | content | Open |
| 732 | Versioning of every member document, with acceptance recorded | routes/agreements.ts | Open |
| 733 | Summary of key terms on one screen before each commitment | new page | Open |

### S6. Finance

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 734 | Halqa's share of bank income recognised as revenue each month, with the bank's statement as support | finance | Open |
| 735 | Invoices to the bank for Halqa's share and service fees | finance | Open |
| 736 | Sales tax on services to the bank checked with a tax adviser | tax | Open |
| 737 | Withholding tax on payments from the bank recorded | tax | Open |
| 738 | Bookkeeping system set up for the company | finance | Open |
| 739 | Monthly management accounts | finance | Open |
| 740 | Budget and runway to the end of the pilot | finance | Open |
| 741 | Funding plan: investors approached with the bank partnership in place | finance | Open |
| 742 | Shareholding record kept current | corporate | Open |
| 743 | Annual audit arranged | finance | Open |

## T. Bank Integration

The technical connection between Halqa and the bank (D2, D3, D4, D14).

### T1. Accounts

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 744 | Account opening inside the Halqa application through the bank's own screens or kit, returning an account reference (D2) | new lib/bank-accounts.ts | Open |
| 745 | Account status kept in step: pending, active, restricted, closed | lib/bank-accounts.ts | Open |
| 746 | Linking an existing account at the partner bank | lib/bank-accounts.ts | Open |
| 747 | Return link from the bank's screens to Halqa after account opening | app | Open |
| 748 | Rejected account openings: the reason shown and tier one payment methods offered | new page | Open |
| 749 | Age of 18 or over checked by both parties | lib/bank-accounts.ts | Open |
| 750 | Accounts for non resident Pakistanis opened from the bank's UAE application (D14) | integration | Open |
| 751 | One designated committee account for a member with several accounts | lib/bank-accounts.ts | Open |
| 752 | Account title inquiry before any payout | lib/payout.ts | Open |
| 753 | Balance of the committee account shown in Halqa | new page | Open |
| 754 | Account closure blocked while the member owes a circle | lib/bank-accounts.ts | Open |
| 755 | Dormant account handling agreed with the bank | bank | Open |

### T2. Payments

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 756 | Internal transfer from payer to collector inside the bank | new lib/bank-payments.ts | Open |
| 757 | Each part posted in one transaction: contribution, cover part and fee | lib/split.ts | Open |
| 758 | Raast Request to Pay issued by the bank for members paying from other banks | lib/bank-payments.ts | Open |
| 759 | 1LINK 1BILL bill numbers issued through the bank as a tier one option | lib/bank-payments.ts | Open |
| 760 | Payout credited to the collector's account on the payout date | lib/payout.ts | Open |
| 761 | Interbank payout where a member's payout account is at another bank | lib/payout.ts | Open |
| 762 | Arrears taken from the late member's pot and paid by the bank to members left short | lib/arrears.ts | Open |
| 763 | Refund and reversal through the bank, with the ledger reversed | routes/payments.ts | Open |
| 764 | Idempotency key on every instruction to the bank | lib/bank-payments.ts | Open |
| 765 | Cut off times, value dates, weekends and holidays agreed | bank | Open |
| 766 | Transfer limits per member and per day agreed with the bank | bank | Open |
| 767 | Hyper daily batch: up to 400 debits and 8 or 15 credits a day, within the bank's rate limits | lib/hyper.ts | Open |

### T3. Direct Debit Mandate

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 768 | Direct debit mandate on the member's account at the bank, authorised in Halqa with the bank's own check (D3) | new lib/bank-mandate.ts | Open |
| 769 | Mandate reference, amount ceiling of one instalment and cadence stored | schema.prisma | Open |
| 770 | Debit on salary credit where the bank supports it, within the payday window | lib/bank-mandate.ts | Open |
| 771 | Mandate cancellation reflected both ways at once | lib/bank-mandate.ts | Open |
| 772 | Mandate status events from the bank | routes/bank-webhook.ts | Open |
| 773 | Mandate terms screen in English and Urdu | new page | Open |
| 774 | Mandate for Hyper: one debit a day at the fixed time | lib/bank-mandate.ts | Open |
| 775 | Mandate records kept as evidence under the Payment Systems and Electronic Fund Transfers Act 2007 | ledger | Open |

### T4. Messages and Security

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 776 | Signed webhooks from the bank for every event, verified before any write | new routes/bank-webhook.ts | Open |
| 777 | Mutual TLS between Halqa and the bank | infrastructure | Open |
| 778 | Key storage in a managed vault, with rotation | infrastructure | Open |
| 779 | Allow lists for the bank's addresses | infrastructure | Open |
| 780 | Rate limits and retries with backoff | lib/bank-client.ts | Open |
| 781 | Versioned message schemas | lib/bank-client.ts | Open |
| 782 | Replay protection by time stamp and message identifier | routes/bank-webhook.ts | Open |
| 783 | Logs of every request and response, with personal data masked | infrastructure | Open |
| 784 | Timeouts and a fallback screen when the bank does not answer | app | Open |
| 785 | Circuit breaker that pauses instructions during a bank outage | lib/bank-client.ts | Open |

### T5. Reconciliation and Reporting

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 786 | Daily statement from the bank ingested automatically | new job | Open |
| 787 | Matching engine: every ledger entry to a bank entry | new lib/reconcile.ts | Open |
| 788 | Breaks held and investigated; payouts on an affected circle paused | new admin page | Open |
| 789 | Monthly statement of the bank's income on committee balances and Halqa's share (D5) | bank | Open |
| 790 | Reward calculation: profit on each member's committee balance over the circle (D4) | new lib/rewards.ts | Open |
| 791 | Reward credited as points at 1 point per rupee at the end of the circle (D4) | lib/rewards.ts | Open |
| 792 | Fee statement for members, showing the bank's fee and cover part | new page | Open |
| 793 | Monthly report pack generated for the bank | new job | Open |

### T6. Environments

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 794 | Access to the bank's test environment | bank | Open |
| 795 | Test data set covering every circle type and failure case | tests | Open |
| 796 | Acceptance testing signed off by both parties | integration | Open |
| 797 | Production cut over plan with a rollback | integration | Open |
| 798 | Monitoring dashboards for the bank connection | infrastructure | Open |
| 799 | Alerts on failed instructions, webhook gaps and reconciliation breaks | infrastructure | Open |
| 800 | Run book for bank outages and delayed statements | documentation | Open |
| 801 | Contract tests that fail the build if the bank's message format changes | tests | Open |

### T7. Security for the Bank

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 802 | Encryption of data in transit and at rest, with keys in a managed vault | infrastructure | Open |
| 803 | Region for hosting and data chosen to meet the bank's rules on data kept in Pakistan | infrastructure | Open |
| 804 | Assessment of each supplier: Vercel, Supabase, Amazon Web Services, Meta, Safepay | governance | Open |
| 805 | Data processing agreements with each supplier | legal | Open |
| 806 | Card data kept outside Halqa's systems, so card industry rules apply only to Safepay | security | Open |
| 807 | Privileged access with two factor sign in and an audit trail | security | Open |
| 808 | Access reviews every quarter | security | Open |
| 809 | Central security logs kept and watched | security | Open |
| 810 | Monthly vulnerability scans with fixes on a stated timetable | security | Open |
| 811 | Code review, dependency scanning and secret scanning on every change | pipeline | Open |
| 812 | Mobile application hardening: certificate pinning, rooted device checks, device binding | app | Open |
| 813 | Session limits and sign out on a new device | app | Open |
| 814 | Backups encrypted, with a restore tested each quarter | infrastructure | Open |
| 815 | Recovery targets agreed with the bank for time and data loss | infrastructure | Open |
| 816 | Incident response plan with notice to the bank within agreed hours | security | Open |
| 817 | Breach notice to members and regulators as the law requires | security | Open |
| 818 | Protection against denial of service and a web application firewall | infrastructure | Open |
| 819 | Security training for everyone with access | governance | Open |
| 820 | Route for outside researchers to report weaknesses | security | Open |
| 821 | Security readiness report for the bank before the pilot | documents | Open |

### T8. Data

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 822 | Data store for reporting, separate from the live database | infrastructure | Open |
| 823 | Measures for the bank: accounts opened, balances, collections, arrears, complaints | reporting | Open |
| 824 | Cohort reports by circle type and month of joining | reporting | Open |
| 825 | Default analysis after collection, by band and by circle type | reporting | Open |
| 826 | Credit score calibrated against actual outcomes each quarter | lib/score-bands.ts | Open |
| 827 | Reports shared with the bank without names where names are not needed | reporting | Open |
| 828 | Deletion of data when retention periods end | infrastructure | Open |

## U. Collection with the Bank

The three collection tiers and the payment companies stay; the bank's direct debit mandate is added (D3).

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 829 | Keep tier one unchanged: card, wallet or Raast approval through Safepay (D3) | lib/payment-provider.ts | Open |
| 830 | Keep tier two unchanged: the card auto debit through Safepay, now beside the bank mandate (D3) | lib/auto-debit.ts | Open |
| 831 | Keep tier three unchanged: manual Raast to the collector, matched by reference (D3) | routes/payments.ts | Open |
| 832 | Add the bank's direct debit mandate as the first automatic method for partner bank accounts (D3) | lib/collection-policy.ts | Open |
| 833 | Tier selection order: bank mandate, then saved card, then approval, then manual | lib/collection-policy.ts | Open |
| 834 | Payday window run on the bank mandate: first attempt on the payday, then each morning, five at most | lib/bank-mandate.ts | Open |
| 835 | Retry schedule on the bank mandate, with the reason given at each decline | lib/bank-mandate.ts | Open |
| 836 | Decline reasons from the bank mapped to sentences a member understands | lib/reason-codes.ts | Open |
| 837 | Second method tried once on the last attempt where the member has one | lib/collection-policy.ts | Open |
| 838 | Role of each operator documented: the bank, 1LINK, Raast, Safepay | documentation | Open |
| 839 | Cost of each method to the member and to Halqa compared and shown | documentation | Open |
| 840 | Settlement of card and wallet payments into partner bank accounts through Safepay | integration | Open |
| 841 | Card disputes still handled through Safepay's dispute process | lib/disputes.ts | Open |
| 842 | Salary account moved to the partner bank offered with a lower fee | new page | Open |
| 843 | Members without a partner bank account kept on tier one to three | lib/collection-policy.ts | Open |
| 844 | Hyper collection only by bank mandate or saved card | lib/hyper.ts | Open |
| 845 | Evening notice before each attempt removed where the member chose fewer messages | lib/notices.ts | Open |
| 846 | Push notices inside the application used before WhatsApp to cut message cost | lib/notices.ts | Open |
| 847 | WhatsApp message count per member per month monitored against the Business Model | reporting | Open |
| 848 | Mandate and card both cancelled when a member leaves after their final instalment | lib/collection-policy.ts | Open |
| 849 | Collection calendar screen showing every attempt planned | new page | Open |
| 850 | Reconciliation of Safepay settlements against partner bank credits | lib/reconcile.ts | Open |
| 851 | Fees for card payments shown before the member chooses a card | PayPage.tsx | Open |
| 852 | Instalment advance payment accepted into the member's committee account | routes/payments.ts | Open |
| 853 | Partial payment of an instalment recorded, the balance still due | routes/payments.ts | Open |
| 854 | Payment by a verified family member into the member's committee account, recorded as such | routes/payments.ts | Open |
| 855 | Tests for each method, each failure and each retry | tests | Open |
| 856 | Collection design document rewritten around the bank (HQ-CP-09) | documents | Open |
| 857 | Auto Debit document rewritten with the bank mandate first (HQ-CP-02) | documents | Open |
| 858 | Safepay email redrafted: cards and wallets only, settlement to partner bank accounts | drafts | Open |

## V. Points and Marketplace

Points as the bank's stored value, the end of circle reward and the marketplace (D4, D9).

### V1. Points

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 859 | Points issued as the partner bank's rupee denominated stored value, under its licence (D4, D9) | bank | Open |
| 860 | Reconcile the two point values before launch: earned points at ten to the rupee of fee, reward points at one to the rupee; decision for the chairman | decision | Open |
| 861 | End of circle reward: the profit on the member's committee balance, credited as points at 1 point per rupee (D4) | lib/rewards.ts | Open |
| 862 | Reward shown during the circle as an estimate and confirmed at the end | new page | Open |
| 863 | Points bought with money from the member's account at the bank (D9) | new lib/points-purchase.ts | Open |
| 864 | Purchase limits per day and per month agreed with the bank | bank | Open |
| 865 | Points balance and history screen | new page | Open |
| 866 | Points earned for paying on time kept: 60 an instalment and 100 more for five in a row | lib/rewards.ts | Open |
| 867 | Host and referral points kept | lib/rewards.ts | Open |
| 868 | Transfer of points between members only as the price of a turn | lib/points-ledger.ts | Open |
| 869 | No cash out of points to any account | lib/points-ledger.ts | Open |
| 870 | Expiry rule for unused points stated before purchase | content | Open |
| 871 | Points frozen while a member is in default | lib/points-ledger.ts | Open |
| 872 | Points liability reported to the bank monthly | reporting | Open |
| 873 | Fraud controls: purchase velocity, device checks, unusual transfers | new lib/points-risk.ts | Open |
| 874 | Points terms and conditions drafted with the bank | legal | Open |

### V2. Marketplace

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 875 | Halqa marketplace inside the application: catalogue, cart, order and tracking (D4) | new pages | Open |
| 876 | Merchant onboarding: agreement, catalogue feed, prices, delivery and returns | commercial | Open |
| 877 | E-commerce partners approached: Daraz and other Pakistani marketplaces | commercial | Open |
| 878 | Gold coins from a certified refiner as a catalogue line | commercial | Open |
| 879 | Bank rewards joined: points exchanged with the partner bank's own rewards and card discounts | bank | Open |
| 880 | Merchant settlement in rupees by the bank for points redeemed | bank | Open |
| 881 | Commission from merchants recorded as Halqa revenue | ledger | Open |
| 882 | Returns and refunds credited back as points | lib/points-ledger.ts | Open |
| 883 | Delivery status from merchants shown in the application | integration | Open |
| 884 | Sales tax and withholding on marketplace sales handled by merchants and confirmed by a tax adviser | tax | Open |
| 885 | Consumer protection disclosures for marketplace orders | content | Open |
| 886 | Catalogue rules: no loans, no lottery, no prohibited goods | content | Open |
| 887 | Search and categories in the marketplace | new page | Open |
| 888 | Order support routed to the merchant with Halqa as first contact | operations | Open |
| 889 | Marketplace reporting: orders, redemptions, returns, merchant payments | reporting | Open |
| 890 | Rewarded advertisements considered only as fees only points, since Google requires rewards that cannot be transferred | decision | Open |

## W. Turn Market

Buying and selling turns between members (D9).

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 891 | Turn listed for sale with an asking price in points (D9) | lib/turn-swap.ts | Open |
| 892 | Offers and counter offers; competing offers allowed; the seller chooses | lib/turn-swap.ts | Open |
| 893 | Ceiling on the price of a turn as a share of the pot; level set by the chairman | decision | Open |
| 894 | Buyer's credit band must allow the earlier turn (D7) | lib/score-bands.ts | Open |
| 895 | Forward liability check on the buyer before acceptance | lib/forward-liability.ts | Open |
| 896 | Affordability recheck on the buyer | lib/affordability.ts | Open |
| 897 | Host approval of each trade | new page | Open |
| 898 | Trade settled in one transaction: turns swapped, points moved, fee charged | lib/turn-swap.ts | Open |
| 899 | Points bought with money at the moment of purchase if the buyer is short | lib/points-purchase.ts | Open |
| 900 | Exchange fee in the fee schedule (D5) | lib/fee-book.ts | Open |
| 901 | Cost of an earlier turn shown to the buyer in rupees and as a share of the pot | new page | Open |
| 902 | Label: not Shariah compliant unless approved by the bank's Shariah board | content | Open |
| 903 | Turn market kept out of Hyper and asset committees | lib/turn-swap.ts | Open |
| 904 | Price history for each circle shown to members | new page | Open |
| 905 | Controls against collusion and trades between linked accounts | new lib/turn-risk.ts | Open |
| 906 | Cooling off period on a trade before it settles | lib/turn-swap.ts | Open |
| 907 | Dispute route for a failed trade | new page | Open |
| 908 | Trade cancelled if either member defaults before settlement | lib/turn-swap.ts | Open |
| 909 | Seller's later turn and new obligations shown before listing | new page | Open |
| 910 | Maximum number of trades per member per circle | lib/turn-swap.ts | Open |
| 911 | Notifications to both members and the host at each step | lib/notices.ts | Open |
| 912 | Reporting of trades to the bank | reporting | Open |
| 913 | Tests for every trade path and failure | tests | Open |
| 914 | Seat Exchange and Points document rewritten for the new turn market (HQ-CP-04) | documents | Open |
| 915 | Opinion of counsel on the turn market before launch | legal | Open |

## X. Credit and Cover

Mandatory credit bands, the cover options for the bank and credit reporting from day one (D7, D11).

### X1. Credit Bands

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 916 | Credit bands mandatory on every circle, with no exception (D7) | lib/score-bands.ts | Open |
| 917 | Early seat bands mandatory: a band that does not allow an early seat cannot take one | lib/score-bands.ts | Open |
| 918 | Bands enforced at joining, at every turn trade and at every host change | lib/score-bands.ts | Open |
| 919 | Host override removed | lib/score-bands.ts | Open |
| 920 | New members confined to the final seats until two clean circles are complete | lib/score-bands.ts | Open |
| 921 | Band rules published to members | content | Open |
| 922 | Band changes recalculated after each circle | new job | Open |

### X2. Cover Options for the Bank

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 923 | Option one for the bank: guarantee of committees from its balance sheet, priced by the bank (D7) | presentation | Open |
| 924 | Option two: insurance through the bank's own insurer or insurance partner (D7) | presentation | Open |
| 925 | Option three: takaful through an operator, with Halqa or the bank as agent (D7) | presentation | Open |
| 926 | Pricing model for each option from the Takaful Cover Pricing Model (HQ-MF-05) | documents | Open |
| 927 | Claims process for each option | documents | Open |
| 928 | Data feed of defaults after collection for the chosen option | integration | Open |
| 929 | Cover part shown to the member before joining | new page | Open |
| 930 | Cover certificate or bank confirmation issued to the member | new page | Open |
| 931 | Claim status visible to the member and the host | new page | Open |

### X3. Credit Reporting from Day One

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 932 | Reporting from launch day one, non negotiable (D11) | decision | Open |
| 933 | Option one: reporting through TASDEEQ as a furnisher of data | commercial | Open |
| 934 | Option two: the partner bank reports directly to the bureaus | bank | Open |
| 935 | The bank decides between the two options | presentation | Open |
| 936 | Data set: obligation, instalment, due dates, payments, arrears and closure | new lib/bureau-report.ts | Open |
| 937 | Member consent to reporting at joining | new page | Open |
| 938 | Monthly submission with checks before sending | new job | Open |
| 939 | Corrections and disputes handled within stated times | new page | Open |
| 940 | Notice to a member before a first adverse report | lib/notices.ts | Open |
| 941 | Reports kept for audit | ledger | Open |
| 942 | Credit history screen for the member, showing what was reported | CreditPage.tsx | Open |
| 943 | Credit Bureaus Act 2015 requirements checked for the chosen route | legal | Open |
| 944 | TASDEEQ report on joining kept for admission, on the member's instruction | lib/bureau.ts | Open |

## Y. Product Changes

Fees, Hyper, savings, assets, members abroad, the computational methods and the application build (D5, D8, D10, D12 to D14, D16).

### Y1. Fees

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 945 | Member fee cut to the lowest level the bank's profit share allows, with the cover part added (D5) | lib/fee-book.ts | Open |
| 946 | New fee grid modelled in the Business Model and Unit Costs | documents | Open |
| 947 | Total cost per instalment shown: fee, cover part and any card charge | new page | Open |
| 948 | Discounts for a guarantee cheque and a verified payslip kept | lib/discounts.ts | Open |
| 949 | Lower fee for members whose salary is paid into the partner bank | lib/discounts.ts | Open |

### Y2. Hyper

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 950 | Hyper kept as designed and labelled Experimental on every screen and document (D8) | HyperPage.tsx | Open |
| 951 | Experimental terms: limits, disclosures and the right to stop a circle | legal | Open |
| 952 | Hyper only on partner bank accounts or saved cards | lib/hyper.ts | Open |
| 953 | Decision on the Hyper fee: Rs 15 as requested on 26 September, or Rs 75 and Rs 83.33 as now | decision | Open |
| 954 | Stress index and hard stop kept | lib/hyper.ts | Open |
| 955 | Hyper report to the bank daily | reporting | Open |

### Y3. Savings, Assets and Members Abroad

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 956 | Due date for salary circles set on the 8th of the month, confirmed with the chairman | decision | Open |
| 957 | Short term savings between salary and the 8th, through the bank (D12) | section I | Open |
| 958 | Asset financing by the bank: catalogue, application, the bank's credit decision and repayment by mandate (D13) | lib/asset-committee.ts | Open |
| 959 | Dealer network for motorcycles and appliances agreed with the bank | commercial | Open |
| 960 | Members in the UAE joining through the bank's accounts for non resident Pakistanis (D14) | integration | Open |
| 961 | Committees across the UAE and Pakistan: contributions in rupees from the member's account | lib/committees.ts | Open |

### Y4. Computational Methods

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 962 | Income account model run on the partner bank's statement data with the member's consent (D10) | lib/salary-pattern.ts | Open |
| 963 | Affordability model kept | lib/affordability.ts | Open |
| 964 | Identity confidence score using the bank's verification plus Halqa's checks | lib/identity-score.ts | Open |
| 965 | Exposure across all circles and forward liability kept | lib/exposure-score.ts | Open |
| 966 | Credit score and bands kept | lib/score-bands.ts | Open |
| 967 | Takaful and cover pricing model kept | lib/cover-pricing.ts | Open |
| 968 | Hyper default threshold model kept | lib/hyper.ts | Open |
| 969 | Each model's inputs listed for the bank | documents | Open |

### Y5. Application Build

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 970 | Build the application with every new and updated feature (D16) | app | Open |
| 971 | Account opening journey at the bank | new pages | Open |
| 972 | Mandate journey | new pages | Open |
| 973 | Rewards and points screens | new pages | Open |
| 974 | Marketplace screens | new pages | Open |
| 975 | Turn market screens | new pages | Open |
| 976 | Savings screen | new page | Open |
| 977 | Asset financing screens | new pages | Open |
| 978 | Members abroad journey | new pages | Open |
| 979 | Credit history and reporting screens | new pages | Open |
| 980 | Experimental label on Hyper | HyperPage.tsx | Open |
| 981 | Every payment screen and receipt naming the bank as holder of money | components | Open |
| 982 | Features that conflict with the plan removed before any bank sees the application | app | Open |
| 983 | Demonstration accounts removed from the production database | database | Open |
| 984 | Database password changed | infrastructure | Open |
| 985 | Urdu for every new screen | content | Open |

### Y6. Operations

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 986 | Support model with the bank: who answers which question, and how a question moves between them | operations | Open |
| 987 | Support scripts for account opening, mandates, rewards, marketplace and turn trades | operations | Open |
| 988 | Answers in the application guide updated for the bank model | rafa-knowledge.ts | Open |
| 989 | Collections work queue for arrears, with steps and times | new admin page | Open |
| 990 | Fraud review queue for points purchases and turn trades | new admin page | Open |
| 991 | Host guide for the bank model | content | Open |
| 992 | Training for hosts on the new rules | operations | Open |
| 993 | Daily operations check: collections, payouts, reconciliation, alerts | operations | Open |
| 994 | Weekly review of complaints with the bank | operations | Open |
| 995 | Service measures published to members | content | Open |

### Y7. Launch and Growth

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 996 | Joint launch announcement with the bank | marketing | Open |
| 997 | Joining offer: lower fee for members who open an account at the bank | marketing | Open |
| 998 | Host programme to bring existing committees onto Halqa | marketing | Open |
| 999 | Referral points kept for the launch | marketing | Open |
| 1000 | Campaign for women savers in Urdu and English | marketing | Open |
| 1001 | Campaign for Pakistanis in the UAE with the bank's UAE team | marketing | Open |
| 1002 | Application store listing updated to name the bank and the Islamic window | distribution | Open |
| 1003 | Google Play financial features declaration stating that Halqa offers no loans | distribution | Open |
| 1004 | Launch measures dashboard for the chairman and the bank | reporting | Open |
| 1005 | Press material approved by the bank before release | marketing | Open |

## Z. Bank Meeting and Documents

The presentation, the documents and the work paused on 28 September.

### Z1. Bank Meeting

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 1006 | Presentation for the bank in Google Slides | presentation | Open |
| 1007 | Cover options slide: bank guarantee, insurance or takaful (D7) | presentation | Open |
| 1008 | Credit reporting slide: TASDEEQ or the bank, the bank deciding (D11) | presentation | Open |
| 1009 | Economics slide for the bank with stated assumptions | presentation | Open |
| 1010 | Pilot slide with scope and measures | presentation | Open |
| 1011 | Rehearsal of the presentation with timing | meeting | Open |
| 1012 | Questions the bank may ask, with answers prepared | meeting | Open |
| 1013 | Printed copies and a copy on a phone | meeting | Open |
| 1014 | Note of thanks to Mr Akif Saeed after the introduction | drafts | Open |
| 1015 | Follow up email to the bank within a day of the meeting | drafts | Open |
| 1016 | Data room with the document set for the bank | documents | Open |

### Z2. Documents

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 1017 | Oraan (HQ-RS-01) | Google Docs | Done |
| 1018 | Bank Partnership Revisions (HQ-BK-01) | Google Docs | Done |
| 1019 | Partner Bank Proposition (HQ-BK-02) | Google Docs | Done |
| 1020 | Revisions and Proposition updated to record the chairman's decisions of 28 September | Google Docs | Open |
| 1021 | Legal Position rewritten for the bank (HQ-LG-01) | documents | Open |
| 1022 | Business Model and Unit Costs rebuilt: bank fee, profit share, cut member fee (HQ-CP-03) | documents | Open |
| 1023 | Default Prevention updated: bank mandate and cover options (HQ-CP-05) | documents | Open |
| 1024 | Hyper Committee labelled Experimental, bank accounts added, stale references removed (HQ-CP-08) | documents | Open |
| 1025 | Asset Committees: bank financing first (HQ-CP-01) | documents | Open |
| 1026 | Complete Feature and Process List updated for D1 to D16 (HQ-CP-07) | documents | Open |
| 1027 | Registrations and Licences Required updated for the bank (HQ-LD-01) | documents | Open |
| 1028 | Income account model updated for partner bank statements (HQ-MF-03, HQ-MI-03) | documents | Open |
| 1029 | Maps rebuilt with the bank at the centre of every money route | maps | Open |
| 1030 | Transaction routes map drawn as routes that connect, not lists | maps | Open |
| 1031 | Master deck rebuilt for the bank model | deck | Open |
| 1032 | Every document rebuilt and verified, then synced to HALQA CORPORATE | documents | Open |

### Z3. Work Paused on 28 September

| # | Item | Location | Status |
| :-: | :-- | :-- | :-: |
| 1033 | Business Model: every cost explained, including cloud per member and the statement check | documents | Open |
| 1034 | Business Model: figures in brackets explained | documents | Open |
| 1035 | Business Model: no staff except counsel; a software house for one to two weeks | documents | Open |
| 1036 | Business Model: software cost table each month, with a table by number of members | documents | Open |
| 1037 | Business Model: three week Google Ads campaign priced | documents | Open |
| 1038 | Payday window written into the documents and built | documents | Open |
| 1039 | Payment by a family member for another member, designed without lending | documents | Open |

## Status by Section

| Section | Items | Done | Partly done | Open |
| A. Visual System | 34 | 12 | 15 | 7 |
| B. Navigation | 22 | 14 | 6 | 2 |
| C. Screens | 155 | 16 | 3 | 136 |
| D. Missing Screens | 130 | 0 | 0 | 130 |
| E. Removals | 29 | 0 | 0 | 29 |
| F. Additions | 18 | 0 | 0 | 18 |
| G. Collection | 43 | 0 | 0 | 43 |
| H. Takaful | 15 | 0 | 0 | 15 |
| I. Savings | 12 | 0 | 0 | 12 |
| J. Credit Data | 17 | 0 | 0 | 17 |
| K. Registrations and Governance | 22 | 0 | 0 | 22 |
| L. Platform and Scale | 40 | 0 | 1 | 39 |
| M. Security | 30 | 0 | 0 | 30 |
| N. Testing and Release | 24 | 0 | 1 | 23 |
| O. Content and Accessibility | 24 | 0 | 0 | 24 |
| P. Measurement | 14 | 0 | 0 | 14 |
| Q. Distribution | 20 | 0 | 0 | 20 |
| R. Operations | 16 | 0 | 0 | 16 |
| S. Partner Bank | 78 | 0 | 0 | 78 |
| T. Bank Integration | 85 | 0 | 0 | 85 |
| U. Collection with the Bank | 30 | 0 | 0 | 30 |
| V. Points and Marketplace | 32 | 0 | 0 | 32 |
| W. Turn Market | 25 | 0 | 0 | 25 |
| X. Credit and Cover | 29 | 0 | 0 | 29 |
| Y. Product Changes | 61 | 0 | 0 | 61 |
| Z. Bank Meeting and Documents | 34 | 3 | 0 | 31 |
| Total | 1039 | 45 | 26 | 968 |