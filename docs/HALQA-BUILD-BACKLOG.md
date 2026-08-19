# HALQA · THE COMPLETE BUILD BACKLOG

Every change needed to finish the app. Grounded in `HANDOVER/12-BUILD-PLAN`,
`HANDOVER/03-FEATURE-REGISTER` section C, the live-app reachability audit, and
the chairman's rejection of 2026-08-18.

Legend: `NAV` reachability · `UI` interface · `API` server · `DB` schema ·
`ALGO` engine · `COPY` wording · `BUG` defect · `LEGAL` agreements

---

## 1 · REACHABILITY — BUILT BUT INVISIBLE

The audit found whole pages that render but nothing navigates to. From a
member's seat these features do not exist.

1. `NAV` Marketplace page has no entry point anywhere in the app. Add one.
2. `NAV` Terminal page has no entry point anywhere. Add or retire it.
3. `NAV` About page has no entry point. Wire to the logo tap as documented.
4. `NAV` Settings page has no entry point. Wire from Account.
5. `NAV` Add a back route out of Settings so members are not stranded.
6. `NAV` Add a back route out of Marketplace.
7. `NAV` Add a back route out of Terminal.
8. `NAV` Bottom nav shows 4 tabs but the app has 15 pages. Redesign the map.
9. `NAV` Account page has no menu; it is a wall of panels. Add a row list.
10. `NAV` No global search. Add one for circles, members, receipts.
11. `NAV` No breadcrumb or title bar on inner pages.
12. `NAV` Browser back button does not work; page state is not in the URL.
13. `NAV` Deep links (`?screen=`) exist but are undocumented and untested.
14. `NAV` No route for a single receipt; receipts are only reachable mid-flow.
15. `NAV` No route to a single member's public profile.
16. `NAV` No route to a single round.
17. `NAV` Exit ladder is only reachable from inside a committee tab.
18. `NAV` Credit Passport share view has no entry point.
19. `NAV` No "all notifications" page despite a Notification table.
20. `NAV` Activity page exists but is not linked from the header bell.
21. `NAV` No help or FAQ route, though Rafa has a knowledge base.
22. `NAV` No route to the fee schedule, though the policy text exists.
23. `NAV` Legal documents open only in a modal from the footer.
24. `NAV` Audit every remaining component for the same orphan pattern.

---

## 2 · JOINING — INVITE CODE, WHATSAPP, LINKS

25. `UI` No dedicated join screen. Joining is buried in Circles.
26. `UI` Invite code entry has no validation feedback before submit.
27. `UI` Invite code is case-sensitive; normalise it.
28. `UI` No paste-from-clipboard on the code field.
29. `UI` No scan-a-QR option for a circle invite.
30. `API` Generate a QR image per circle invite code.
31. `UI` No deep link that opens the app directly onto a circle.
32. `API` Build `/join/:code` universal link handling.
33. `UI` WhatsApp share exists only inside the Turns tab of a running circle.
34. `UI` Add WhatsApp share at circle creation, the moment it is needed.
35. `UI` Add WhatsApp share to the circle card in the list.
36. `COPY` The WhatsApp message is English-first; lead in Roman Urdu.
37. `UI` No SMS fallback share for members without WhatsApp.
38. `UI` No "copy invite link" button, only the raw code.
39. `UI` No share sheet using the native Web Share API.
40. `API` No invite expiry. Codes live forever.
41. `API` No per-invite tracking, so a host cannot see who they invited.
42. `DB` No `Invite` table recording issue, open and accept events.
43. `UI` Host cannot revoke an outstanding invite.
44. `UI` Host cannot see pending joiners awaiting approval.
45. `API` No host approval step; anyone with a code joins instantly.
46. `UI` No preview of the circle before committing to join.
47. `UI` Slot picker does not show what each seat costs or is worth.
48. `UI` No confirmation of forward liability in rupees before joining.
49. `API` Waitlist exists in the schema but has no UI at all.
50. `UI` "Join next cycle" was deferred and is still missing.
51. `UI` Discover has no filters for amount, size, cadence or start date.
52. `UI` Discover has no sort.
53. `UI` Discover does not show why a circle is ineligible for you.
54. `UI` No empty state when Discover returns nothing.
55. `ALGO` Discover ranking is arbitrary; rank by fit and start date.

---

## 3 · COPY — CRINGE, OVER-DESCRIPTION, LENGTH

Standing complaint: the app talks too much and sounds like marketing.

56. `COPY` Cut every panel description to one line maximum.
57. `COPY` Remove "Save together. Grow with clarity." from auth.
58. `COPY` Remove "PAKISTAN'S TRANSPARENT SAVINGS NETWORK" eyebrow.
59. `COPY` Remove "the committee you trust, finally written down."
60. `COPY` Rewrite the Vault blurb; it is a five-line paragraph.
61. `COPY` "Let money keep earning" reads as a pitch. State the function.
62. `COPY` Remove "Committee infrastructure" as a tagline.
63. `COPY` Cut the Safety Fund paragraph from four sentences to one.
64. `COPY` Cut the tier explainer paragraphs on the committee screen.
65. `COPY` Cut the Early Access explainer to one line plus a link.
66. `COPY` Cut the Maximum tier explainer, currently the longest string.
67. `COPY` Remove "What you'll get, month by month" chart preamble.
68. `COPY` Remove "Your own money's journey" phrasing entirely.
69. `COPY` Remove "Inspect the risk, range and every deployment."
70. `COPY` Shorten the group-credit explainer; drop "that's the accountability."
71. `COPY` Shorten the exit-bar line "Five ways out, each priced before you choose."
72. `COPY` Remove "No cancel button." from member-facing copy.
73. `COPY` Rewrite Halqa-fill tooltip; it is currently a paragraph in a title tag.
74. `COPY` Replace em-dash-heavy sentences throughout with short clauses.
75. `COPY` Remove all exclamation marks from system messages.
76. `COPY` Standardise on "committee", never "circle", in member-facing text.
77. `COPY` Audit for the mixed use of "Sakh", "score", "reliability", "credit".
78. `COPY` Pick one name for the score and use it everywhere.
79. `COPY` Roman Urdu is missing from every screen except the auth hero.
80. `COPY` Add Roman Urdu to the join flow, the pay flow, the receipt.
81. `COPY` Urdu translation coverage is partial; audit `lib/i18n.ts` for gaps.
82. `COPY` Error messages are developer-facing; rewrite for members.
83. `COPY` Empty states are missing on most lists.
84. `COPY` Loading states say nothing.
85. `COPY` Success states over-celebrate; make them factual.
86. `COPY` Rafa's greeting rotation is cute but unhelpful; make it useful.
87. `COPY` Rafa answers are too long for a chat bubble.
88. `COPY` Notification copy has no consistent voice.
89. `COPY` WhatsApp receipt text is unformatted.
90. `COPY` Legal documents are unreviewed templates and read like it.
91. `COPY` Fee explanations differ between the create flow and the policy.
92. `COPY` The word "simulated" appears inconsistently on projections.
93. `COPY` Remove marketing adjectives: seamless, effortless, powerful, smart.
94. `COPY` No microcopy on any input field explaining the format.
95. `COPY` Date formats are inconsistent (`8/27/2026` vs `27 Aug`).
96. `COPY` Currency formatting is inconsistent across pages.
97. `COPY` Number formatting does not use Pakistani lakh/crore anywhere.
98. `COPY` Time-until formats ("159d 21h") are unreadable; humanise them.
99. `COPY` Status words (RUNNING, FORMING) are shouted in caps everywhere.

---

## 4 · CUSTOMISABILITY

100. `UI` Member cannot rename a circle after creation.
101. `UI` Member cannot set a circle photo or colour.
102. `UI` No circle avatar; all circles look identical in the list.
103. `UI` Host cannot edit the contribution amount before start.
104. `UI` Host cannot edit the period before start.
105. `UI` Host cannot edit the member cap before start.
106. `UI` Host cannot edit the start date.
107. `UI` Host cannot reorder seats before locking, only members can pick.
108. `UI` Host cannot write a description or rules note on the circle.
109. `UI` No custom reminder schedule per circle.
110. `UI` No per-circle notification mute.
111. `UI` No quiet hours for notifications.
112. `UI` Appearance panel exists but is not reachable (Settings is orphaned).
113. `UI` Accent colour choice does not persist across devices.
114. `UI` Theme choice does not follow the system on first load reliably.
115. `UI` Text scale control exists but no preview.
116. `UI` High contrast mode is untested against the new stylesheets.
117. `UI` Language toggle is buried and unreachable.
118. `UI` No per-member display name; only the legal name shows.
119. `UI` Avatar upload exists in schema but has no UI.
120. `UI` No profile photo crop or resize.
121. `UI` Member cannot hide their score from other members.
122. `UI` Member cannot choose what the Credit Passport reveals.
123. `UI` No control over which rail is tried first for auto-collection.
124. `UI` Collection order component exists but is unreachable.
125. `UI` No control over reminder channel (WhatsApp vs push vs SMS).
126. `UI` No home screen customisation; the tile order is fixed.
127. `UI` No way to pin or favourite a circle.
128. `UI` No archive for completed circles; they clutter the list.
129. `UI` No sort or filter on the member's own circle list.
130. `UI` Goal circles cannot set a custom goal image.
131. `UI` Gold-goal circles cannot choose grams versus tolas.
132. `UI` No currency display preference.
133. `UI` No date-format preference.
134. `UI` No export of a member's own data.
135. `UI` No account deletion path.
136. `UI` No way to change phone number.
137. `UI` No way to change username.

---

## 5 · USER AGREEMENTS

138. `LEGAL` Undertaking and PG texts are lawyer-unreviewed templates.
139. `UI` Member cannot view the undertaking they signed after signing.
140. `UI` No list of every agreement a member has signed.
141. `UI` No download of a signed agreement as PDF.
142. `API` No PDF rendering of agreements at all.
143. `UI` The weekly undertaking re-signature has no reminder before expiry.
144. `UI` No warning that actions will be blocked when it lapses.
145. `UI` HTTP 428 gate surfaces as a generic error, not a clear prompt.
146. `UI` Drawn-signature capture has no undo or clear.
147. `UI` No signature preview before submitting.
148. `API` Signature PNG size cap (80 KB) fails silently when exceeded.
149. `UI` Mutual PG is signed inside the join transaction with no explicit screen.
150. `UI` PG text is only viewable while the circle is FORMING.
151. `UI` No plain-language summary above the legal text.
152. `COPY` Agreements have no Roman Urdu version.
153. `COPY` Agreements have no Urdu version.
154. `LEGAL` No version history shown when terms change.
155. `API` No re-consent flow when the agreement version changes.
156. `UI` Terms acceptance at signup is a single unexplained checkbox.
157. `UI` Privacy policy is not summarised anywhere.
158. `UI` No consent receipt after accepting anything.
159. `DB` No record of which agreement version gated which action.
160. `API` Bureau-furnishing consent is bundled, not separately revocable.
161. `UI` Member cannot revoke bureau consent.
162. `UI` Member cannot see what data was furnished and when.
163. `LEGAL` No data-retention statement.
164. `LEGAL` No complaints or dispute process documented in-app.
165. `LEGAL` No arbitration clause explanation in plain language.
166. `UI` Host declaration per member (circle authenticity) does not exist.
167. `UI` Member counter-declaration about the host does not exist.
168. `DB` No table for the paired relationship declarations.
169. `LEGAL` Sponsor / pay-on-behalf has no agreement at all.
170. `LEGAL` Substitution has no transfer deed between leaver and replacement.
171. `LEGAL` No next-of-kin nomination, so death handling has no legal basis.
## 6 · EXIT AND CANCELLATION — SUBSYSTEM 1

Spec: build plan §1. Status: exit ladder UI partially shipped, engine absent.

172. `DB` No `CONFIRMING` state between FORMING and ACTIVE.
173. `API` Host Start must move the circle to CONFIRMING, not straight to ACTIVE.
174. `API` Roster must lock to new joiners the moment CONFIRMING begins.
175. `API` 24-hour countdown, from Start, shared by every member.
176. `UI` Countdown screen showing the final roster and seat order.
177. `UI` Show each member their own total forward obligation in rupees.
178. `API` Free withdrawal during the window: no fine, no score, no record.
179. `API` Sub-minimum withdrawal drops the circle back to FORMING.
180. `UI` Notify every member when someone withdraws in the window.
181. `API` Auto-promote to ACTIVE when the window expires.
182. `API` Agreements must be signed inside the window, not at join.
183. `UI` Level 2 substitution flow: find a replacement.
184. `API` Substitution: replacement pays the leaver their contributions to date.
185. `API` Substitution is member-to-member; Halqa never holds the transfer.
186. `UI` Push substitution hard as the default exit; target 90% of exits.
187. `API` Paid months transfer to the seat, not the person.
188. `API` Replacement signs the full agreement set before the seat moves.
189. `DB` Both substitution events written as permanent ledger entries.
190. `API` Unfilled exit falls back to the marketplace, then to Halqa-fill.
191. `UI` Level 3 group-approved exit: reason form.
192. `UI` Optional voice note on the exit reason (31% literacy constraint).
193. `API` Post the exit request to circle chat automatically.
194. `API` Notify all members in-app and by WhatsApp.
195. `API` 72-hour voting window.
196. `ALGO` Simple majority of votes cast, excluding the requester.
197. `ALGO` 50% participation quorum.
198. `API` Quorum failure escalates to Halqa review, never auto-denies.
199. `ALGO` Host votes as one member and breaks ties. No veto.
200. `DB` Every vote, abstention and comment is a permanent ledger entry.
201. `UI` Live vote tally visible to all members.
202. `API` Fine of one installment on group-approved exit.
203. `ALGO` Fine splits 70% to remaining members, 30% platform.
204. `UI` Level 4 hardship exit: recorded statement to the helpline.
205. `API` Evidence upload and review queue for hardship.
206. `API` Hardship fine waived.
207. `DB` Hardship annotated distinctly from default.
208. `API` Hardship annotation must survive into the Credit Passport.
209. `UI` Hardship outcome ladder: bring the turn forward first.
210. `API` Deferral with group consent and a real repayment date.
211. `API` Structured settlement where a payout was already taken.
212. `API` Level 5 abandonment: full late-fee ladder, feature lock, recovery case.
213. `API` Restitution withheld and set off against what is owed on abandonment.
214. `ALGO` Restitution engine: leaver paid *p* installments, circle contracts.
215. `ALGO` Each member who collected in rounds 1..*p* owes the leaver exactly *c*.
216. `ALGO` Total owed = *p* × *c*, nominal, no time value.
217. `API` Obligations created as scheduled settlements at the final round.
218. `API` Collected through the ordinary mandate machinery.
219. `ALGO` Recursive handling for multiple exits in one cycle.
220. `TEST` Ledger invariant at close: every continuing member nets to zero.
221. `TEST` Every exited member returned to zero.
222. `UI` Warn remaining members that each pot shrinks by one contribution.
223. `UI` Show the new pot figure before the vote, not after.
224. `API` Insured-circle variant: pot not affected by the leaver.
225. `API` Cover facility draws to keep the pot whole.
226. `ALGO` Cover premium pricing r ≈ 1.5q.
227. `UI` Sponsor / pay-on-behalf: one member pays another's installment.
228. `DB` Sponsor obligation recorded as a debt between the two members.
229. `UI` Sponsor repayment terms shown before confirming.
230. `API` Sponsor cannot be coerced; require explicit consent from both.
231. `ALGO` Payout deduction order, exact and disclosed.
232. `UI` Show the deduction waterfall on the payout screen.
233. `API` Boundary rule: everything above governs pre-collection members only.
234. `API` Post-payout default is the −200 event, not an exit.

---

## 7 · COLLECTION — SUBSYSTEM 2

Spec: build plan §2. Status: cron and auto-debit exist, calendar and rails do not.

235. `UI` No collection calendar anywhere in the app.
236. `UI` Member cannot see when the next pull will be attempted.
237. `UI` Member cannot see the retry ladder for a failed pull.
238. `API` Payday-morning pull is specified but not visibly wired to the calendar.
239. `UI` Evening-before balance-check notice has no UI trace.
240. `UI` No screen showing salary-verification status and which layer proved it.
241. `UI` Payslip upload has no progress or result feedback.
242. `UI` Credit-alert listener opt-in has no consent screen.
243. `API` Credit-alert aggregation (day, band, source class) is unbuilt.
244. `UI` Member cannot correct a wrongly declared payday.
245. `UI` The −15 misdeclaration event is not explained where it appears.
246. `UI` Salary anchor is replace-only but the UI does not say why.
247. `COPY` Float is small; say so plainly rather than implying yield.
248. `UI` Rail cost is invisible to the member and to the host.
249. `API` Rail abstraction exists but only Raast and sandbox are real.
250. `API` JazzCash rail is a branded card with no integration behind it.
251. `API` Easypaisa rail is a branded card with no integration.
252. `API` Bank transfer rail has no reconciliation.
253. `API` Cash rail has no host confirmation step.
254. `API` No webhook receiver for live rail settlement.
255. `API` No idempotent replay handling for duplicate webhooks.
256. `API` No reconciliation job comparing rail statements to the ledger.
257. `UI` No reconciliation view for the host.
258. `API` Raast RTP one-tap push is not implemented.
259. `API` Raast merchant credentials are not provisioned.
260. `API` No same-day auto-cover backstop for a missed tap.
261. `API` Circle creation does not gate on a verified Raast credential.
262. `UI` Chat exists but phone numbers are not masked in it.
263. `API` No phone-number redaction in chat messages.
264. `UI` Chat has no report or block.
265. `UI` Chat shows a down banner permanently on serverless.
266. `API` Chat history is not persisted reliably without sockets.
267. `API` Replace socket chat with a polling or SSE fallback.
268. `ALGO` Streaks exist but are not surfaced in the collection flow.
269. `UI` Points balance is not explained anywhere.
270. `UI` No rewards catalogue; points buy nothing.
271. `API` Reward redemption endpoint does not exist.
272. `ALGO` Early-bird 1.25x bonus is not shown to the member who earned it.
273. `API` Net-off settlement ("hissa kat lo") is entirely unbuilt.
274. `UI` Host toggle for net-off at creation, default off.
275. `UI` Net-off shown to every joiner before committing.
276. `API` Ledger writes both legs even when cash nets.
277. `DB` Settlement method `NET_OFF` with its own receipt and idempotency key.
278. `ALGO` Net-off counts as on-time at full weight, annotated auto-settled.
279. `API` No net-off if already paid before payout day.
280. `API` Net-off stacks correctly with the forward-liability holdback.
281. `API` Marketplace-bought seat nets off for the buyer.
282. `UI` Late-fee ladder is invisible until it fires.
283. `UI` Show the ladder and the exact dates before the due date.
284. `API` Grace window is internal; keep it hidden but make the effect explainable.
285. `UI` Explain that score damage accrues from the first late day regardless.
286. `API` No dunning sequence beyond the cron.
287. `API` No escalation to a human at any point.
288. `UI` No payment-plan option for a struggling member.
289. `API` Partial payment is not supported at all.
290. `UI` No receipt archive; receipts vanish after the flow.
291. `API` Receipt reference format exists but is not searchable.
292. `UI` WhatsApp receipt is queued but the member cannot re-send it.
293. `API` WhatsApp gateway is partner-stage; no fallback in the meantime.
294. `UI` No SMS fallback for receipts.
295. `API` Reminder levels 1 and 2 exist; no level 3.
296. `UI` Reminders are not visible as a history.
297. `TEST` No test for the full retry ladder across a month boundary.
298. `TEST` No test for daily-cadence collection.
299. `API` Delinquency cron is hourly locally and daily in production; unify.
300. `API` Cron has no alerting when it fails.
301. `API` No dead-letter queue for failed collections.
302. `UI` Auto-collection consent is recorded but never shown back to the member.
303. `UI` Member cannot see or change the instrument used for auto-collection.
304. `UI` Member cannot test a mandate before relying on it.
305. `API` Mandate OTP flow has no resend.
306. `API` Account-title check is specified but not wired to a live aggregator.

---

## 8 · MECHANISM — SUBSYSTEM 3

Spec: build plan §3.

307. `API` PIN is required at app open but not at join-commit.
308. `API` PIN is not required at exit request.
309. `API` PIN is not required at payout release.
310. `UI` Biometric unlock exists but has no settings entry (Settings orphaned).
311. `API` NADRA face match is entirely unbuilt.
312. `API` Nishan Pakistan portal integration not started.
313. `API` Face check triggers: new device, large contribution, first-half seat.
314. `API` Face check on any exit or hardship request.
315. `API` Face check after 90-day dormancy.
316. `API` Never store raw templates; store result and NADRA reference only.
317. `ALGO` Cost discipline: do not face-check trivial actions.
318. `API` 24-hour window is listed here too; see item 172.
319. `ALGO` Time value of money is optional everywhere but has no toggle.
320. `UI` No explanation of time value where it applies.
321. `ALGO` The invisible filter (income regularity, not level) is unimplemented.
322. `ALGO` Filter must key on regularity signals, not declared income.
323. `UI` Order setting: three modes, only one is built.
324. `UI` Mode 1 pick-your-slot exists.
325. `UI` Mode 2 verifiable parchi draw does not exist.
326. `API` Commit-reveal: server commits to a hashed seed before the ceremony.
327. `UI` Each member's tap adds entropy.
328. `ALGO` Ordering derives from the combined value.
329. `API` Seed revealed after so anyone can recompute the result.
330. `UI` Ceremony screen that preserves the theatre of the draw.
331. `UI` Public verification page for a completed draw.
332. `UI` Mode 3 host-assigned order does not exist.
333. `API` Refusal on record: never publish a defaulter's home address.
334. `API` Default flag stays internal, gating hosting and marketplace only.
335. `UI` Ensure no screen leaks the flag outside the member's own circles.
336. `ALGO` Affordability engine is entirely unbuilt.
337. `ALGO` Cash-flow cap: sum of contributions ≤ 33% of net monthly income.
338. `ALGO` Contributions plus known debt service ≤ 40%.
339. `API` Pull known debt service from TASDEEQ where available.
340. `ALGO` Forward exposure cap: sum of L(k) ≤ 4× net monthly income.
341. `ALGO` Worst case assumes every circle pays out early.
342. `ALGO` Concurrency: 1 circle unverified, up to 4 verified.
343. `ALGO` Host concurrency: 2 unproven, 5 with clean history, then manual review.
344. `UI` Always show headroom in plain language, never a bare rejection.
345. `ALGO` Good history unlocks seats and friction, never the money cap.
346. `ALGO` Only new income evidence raises the cap.
347. `UI` Verification tier display: declared-only versus proven.
348. `API` Analyst uplift filed against a named reviewer with an expiry.
349. `DB` No table for affordability assessments or their inputs.
350. `TEST` No tests for any affordability rule.
351. `ALGO` Circle authenticity: paired declaration is unbuilt.
352. `UI` Host answers how and how long they know each member.
353. `UI` Member answers the same two questions, without seeing the host's answer.
354. `ALGO` Answers must agree; mismatch flags that member.
355. `ALGO` Corroboration 1: consistency with the two home pins.
356. `ALGO` "Neighbour" in another city is a contradiction; flag it.
357. `ALGO` Corroboration 2: invitation trail; forwarded links are not known people.
358. `ALGO` Corroboration 3: answer independence by timing and network.
359. `API` On-device hashed contact matching, address book never uploaded.
360. `ALGO` The half that matters: each member has the host saved.
361. `API` Host signs a per-member declaration.
362. `ALGO` Host's own score takes the hit if a vouched member defaults.
363. `ALGO` Host hosting limits tighten after a vouched default.
364. `API` Clustered fraud signals block a start; single mismatches do not.
365. `API` Nothing is relaxed for known circles; this only ever tightens.
## 9 · BUYING TURNS — SUBSYSTEM 4

Spec: build plan §4. Status: list/bid/accept shipped, page unreachable.

366. `NAV` Marketplace is unreachable; see item 1.
367. `UI` No explanation of what buying a turn means before the first visit.
368. `API` Swap validity rule is asymmetric; must check both parties, both seats.
369. `ALGO` Validate that neither side breaches their affordability cap post-swap.
370. `ALGO` Validate that neither side breaches band eligibility post-swap.
371. `ALGO` Validate forward liability for both seats after the swap.
372. `API` Block a swap that would move a new member out of the last-3 quarantine.
373. `UI` Show both sides what changes before either confirms.
374. `API` Two-sided confirmation; currently one side accepts.
375. `UI` No countdown or expiry on a listing.
376. `API` Listings never expire.
377. `UI` No cancel-listing action.
378. `UI` No bid withdrawal.
379. `UI` No bid history on a listing.
380. `UI` Premium cap (50% of payout) is enforced but not explained.
381. `UI` Halqa's 10% cut of the premium is not disclosed at bid time.
382. `UI` Shariah tiers permit zero-premium swaps only; not signposted.
383. `UI` Rebuilding band is barred but the reason is not shown.
384. `ALGO` Circle credit rating is specified and unbuilt.
385. `ALGO` Rating must combine member scores, history and concentration.
386. `UI` Show the circle rating on every listing.
387. `UI` Show the circle rating on the Discover card.
388. `UI` Explain what the rating means in one line.
389. `API` Rating recompute job on member and payment change.
390. `DB` No column for a computed circle rating.
391. `UI` No notification when someone bids on your listing.
392. `UI` No notification when your bid is accepted or beaten.
393. `API` No escrow of the premium; it is a bare promise.
394. `API` Premium settlement is not tied to the seat transfer atomically.
395. `TEST` No test that a swap preserves the ledger invariant.
396. `UI` Marketplace has no empty state.
397. `UI` Marketplace has no filters.
398. `UI` Own listings are styled but not separated.
399. `UI` No "why can't I list?" explanation for blocked members.

---

## 10 · OPEN VERSUS KNOWN CIRCLES — SUBSYSTEM 5

Spec: build plan §5.

400. `DB` No circle-type field distinguishing open from known.
401. `UI` Creation flow does not ask which type is being made.
402. `API` Full parameter table (§5.1) is not encoded anywhere.
403. `ALGO` Fee numbers per type (§5.2) are not implemented.
404. `ALGO` Cover premium r ≈ 1.5q by circle type.
405. `ALGO` q ≈ 2% for an anonymous circle; lower for known.
406. `UI` Show the member which parameter set applies to their circle.
407. `ALGO` Unlock ladder is specified and unbuilt.
408. `ALGO` L(k) ≤ 7c seat-band rule, reproducing "position 5 of 12".
409. `UI` Show the member exactly which seats they may claim and why.
410. `UI` Show what they must do to unlock earlier seats.
411. `ALGO` Tenure quarantine: last-3 seats only for new members.
412. `ALGO` Unlock after 2 clean completed circles plus manual verification.
413. `UI` Progress indicator toward that unlock.
414. `API` Manual verification queue for the "calling around" step.
415. `ALGO` Open circles: stricter seat gates and lower ceilings.
416. `ALGO` Open circles: full verification required.
417. `API` Authenticity checks apply to known circles only; see items 351-365.
418. `UI` Explain to open-circle members why they face more checks.
419. `ALGO` Score bands gate slot eligibility; verify against `score-bands.ts`.
420. `UI` Band cutoffs are not shown to the member.
421. `UI` No "how do I improve my band" guidance.
422. `API` Discover must only show circles with an eligible free slot.
423. `TEST` No test that Discover never surfaces an ineligible seat.
424. `ALGO` Compaction by band, chosen seat, then join time on under-cap start.
425. `TEST` No test for compaction preserving the eligibility guarantee.
426. `UI` Mega circles up to 150 members have no list virtualisation.
427. `UI` Daily circles under 7 days must force plain rotations; not enforced in UI.
428. `API` Period ≤ 30 days when more than 30 members; not enforced.
429. `UI` Goal circles have no goal progress display.
430. `UI` Goal circles cannot show the goal item or price.
431. `ALGO` Progressive contribution caps for new members are unbuilt.
432. `ALGO` Amounts, not only seats, must scale with history.
433. `UI` Ramzan schedule exception is unbuilt.
434. `UI` Host cannot pause for Eid month or double the month before.
435. `UI` Schedule exceptions must be visible at creation.

---

## 11 · HYPER COMMITTEES — SUBSYSTEM 6

Spec: build plan §6. Chairman: "HYPER committee wrong." The shipped page does
not match the specification on almost any axis.

436. `API` HYPER cadence must be daily; verify the shipped implementation.
437. `API` Cycle length must be 48 to 60 days. 60 recommended and maximum.
438. `API` 15 and 30-day cycles only for Safety-Vault-pledged members (Stage 2).
439. `API` Roster size equals cycle length in days (48 to 60).
440. `API` Ticket tiers exactly Rs 100 / 500 / 1,000 / 2,000 per day.
441. `API` Pot range Rs 6,000 to Rs 120,000 must follow from the tier and length.
442. `API` Seat assignment by verifiable commit-reveal ballot only.
443. `API` No seat picking in HYPER.
444. `API` No auction in HYPER.
445. `API` No marketplace in HYPER.
446. `API` No bidding in HYPER.
447. `UI` Identity must be pseudonymous: "Member #7".
448. `UI` No names visible in a HYPER circle.
449. `UI` No photos visible.
450. `UI` No phone numbers visible.
451. `UI` No chat in HYPER at all.
452. `API` Halqa is the host; there is no human organizer.
453. `API` Raast mandatory; no wallet fallback.
454. `API` Creation gate: every member must have a verified Raast credential.
455. `API` Auto-debit mandatory and daily.
456. `ALGO` One HYPER circle per member at a time.
457. `ALGO` Entry gate: Sakh ≥ 650.
458. `ALGO` Entry gate: 2 completed circles, clean.
459. `ALGO` Entry gate: verified income (payslip or proven salary pattern).
460. `ALGO` Stage 2 entry gate: pledged Safety Vault covering L(k) at the seat.
461. `UI` Seat access Stage 1: last-3 seats only below Excellent.
462. `API` Undertaking acknowledged at the start of every cycle.
463. `API` Mutual PG required.
464. `API` NADRA face at join.
465. `API` NADRA face before every payout.
466. `API` Manual check on 100% of first-time HYPER members.
467. `ALGO` Grace is 12 hours; the standing formula returns zero on daily cadence.
468. `ALGO` Late ladder 5% / 10% / 15% at T+12h / T+36h / T+60h, then default.
469. `ALGO` Sakh damage −20 / −40 / −60.
470. `ALGO` Post-payout default −200.
471. `API` Exit: 24h window before start.
472. `API` After start, substitution only, always available from the standing queue.
473. `ALGO` APR-equivalent ceiling: 48% at the earliest seat, all-in.
474. `ALGO` Formula: APR = 2 × 365 × F / ((n−1)² × c).
475. `API` Every member-borne cost counts toward the ceiling.
476. `API` Cover premium counts toward it.
477. `API` Access fee counts toward it.
478. `API` Any time-value premium paid to other members counts toward it.
479. `UI` Display the APR-equivalent to the member before they join.
480. `TEST` Test that no fee configuration can exceed 48% APR-equivalent.
481. `ALGO` Cycle floor of 48 days derives from the premium; enforce it.
482. `ALGO` HYPER fee schedule (§6.5) is not implemented.
483. `ALGO` Queue mechanics (§6.8) are entirely unbuilt.
484. `API` Matching engine to fill a standing queue with no roster.
485. `API` Queue must produce a circle when enough eligible members are waiting.
486. `UI` Show queue position and expected start.
487. `ALGO` Default handling on a daily clock (§6.9).
488. `ALGO` Distribution answer (§6.10) is unaddressed.
489. `UI` Honest risk statement must appear before entry, not buried.
490. `COPY` State plainly that anonymity removes the strongest enforcement.
491. `UI` HYPER must be presented as the most gated product, not the most open.

---

## 12 · THE VAULT — SUBSYSTEM 7

Spec: build plan §7. Live in production with `SIMPLE_MODE = false`.

492. `BUG` Crypto tier text is clipped; badge wraps and pushes the blurb out.
493. `UI` Vault tier blurbs are too long for the row.
494. `UI` No confirmation step when switching tier.
495. `API` `acknowledgeExtremeRisk` 428 gate for CRYPTO is not surfaced in UI.
496. `COPY` "High risk, NOT government-backed" must be unmissable, not clipped.
497. `UI` Vault balance shows Rs 0 with no explanation of how to fund it.
498. `UI` No deposit flow into the vault.
499. `UI` No withdrawal flow out of the vault.
500. `UI` No transaction history for the vault.
501. `ALGO` Accrued profit shows Rs 0 with no accrual schedule shown.
502. `UI` Indicative rate (10.8%) has no dated source shown.
503. `COPY` "Indicative" and "simulated" are used inconsistently.
504. `API` Three products (§7.2) are not distinctly implemented.
505. `ALGO` Liquidity requirement and its invariant (§7.3) unimplemented.
506. `ALGO` Safety Vault lien mechanics (§7.4) unimplemented.
507. `API` Pledge a vault holding against L(k) at a seat.
508. `API` Release the lien as positions clear.
509. `UI` Show the member what is pledged and what is free.
510. `API` Parking toggle exists but has no effect anywhere.
511. `UI` Explain what parking does before the toggle.
512. `ALGO` Float sweep is dormant.
513. `ALGO` Deposit mudarabah is dormant.
514. `ALGO` Patience tilt is dormant.
515. `ALGO` Prize hiba is dormant.
516. `API` Group staking streak (+5% per clean round, cap +50%) not wired.
517. `API` Deposit coverage 30-90% host control has no UI.
518. `UI` Host-configurable float window slider is not reachable.
519. `ALGO` floatFactor = (lead + 7) / (period + 7) not applied to displays.
520. `UI` Projections do not state that they are not guaranteed, consistently.
521. `LEGAL` Priority and Sigma use a conventional fee, not Shariah-reviewed.
522. `UI` That disclosure must appear at the point of choice.
523. `API` Sigma fee cap of 10% is not enforced in the UI.
524. `UI` Tier rename (Basic/Earn/Earn & Share/Early Access/Maximum) is display-only.
525. `UI` Verify every surface uses the display name, not the enum.
526. `API` Escrow treasury and guarantee pool need custody; keep gated.
527. `API` Security deposits and payout holdbacks need custody; keep gated.
528. `UI` Where these are gated, say so rather than showing an empty panel.
529. `TEST` No test that a dormant engine cannot move money.
530. `TEST` No test that CRYPTO cannot be selected without the acknowledgement.
531. `UI` Stage-2 revenue (§7.5) is not modelled anywhere in-app.
## 13 · ASSET AND INSTALLMENT COMMITTEES — SUBSYSTEM 8

Spec: build plan §8. Chairman: "no asset committee." Nothing exists.

532. `DB` No committee mode for an asset or installment circle.
533. `API` The mechanism (§8.2) is unimplemented in full.
534. `UI` Creation flow cannot select an asset target.
535. `UI` No asset catalogue (phone, appliance, solar, bike).
536. `DB` No `Asset` table with make, model, price and supplier.
537. `API` No supplier or vendor integration.
538. `ALGO` Price the circle from the asset price, not a free-text amount.
539. `API` Security trustee structure (§8.3) does not exist.
540. `LEGAL` No trustee agreement.
541. `LEGAL` Ijarah variant (§8.3b) for the Shariah label is unwritten.
542. `UI` Member must be told which variant their circle uses.
543. `API` Money and title flow (§8.4) is unimplemented, step by step.
544. `API` Funds route to the supplier, never to Halqa.
545. `API` Title is issued to the trustee, then released.
546. `ALGO` Everyone receives ownership on the same day (§8.5).
547. `API` Mechanism to hold title until the final round settles.
548. `UI` Show each member their ownership date, identical for all.
549. `API` Default handling on an asset circle (§8.5b).
550. `API` Repossession or set-off path where title is held.
551. `LEGAL` Repossession must be lawful and disclosed at join.
552. `API` Device-level controls: chips and phone blocks preinstalled.
553. `API` Remote disable on default for financed handsets.
554. `LEGAL` Disclose remote disable prominently before joining.
555. `UI` Explain exactly what can be disabled and when.
556. `ALGO` Where this works and where it does not (§8.6) must gate the catalogue.
557. `API` Do not offer asset circles for goods that cannot be secured.
558. `API` Early buyout path (§8.7).
559. `UI` Show the early buyout figure at any time.
560. `API` Member's own options at buyout must be presented neutrally.
561. `LEGAL` Halqa's position for the regulator (§8.8) must be documented in-app.
562. `ALGO` Revenue and member cost model (§8.9).
563. `UI` Total cost of ownership shown before joining.
564. `UI` Compare against buying outright and against a bank instalment plan.
565. `API` Counterparties (§8.10) need onboarding and contracts.
566. `DB` No supplier table, no purchase order, no delivery record.
567. `UI` No delivery tracking for the member.
568. `UI` No warranty or service record.
569. `API` No returns or cancellation handling on a delivered asset.
570. `TEST` No tests for any of the above.
571. `UI` Gold-goal committee: spot-settled variant is specified, not built.
572. `UI` Host sets the goal in grams or tolas.
573. `API` Live PKR per gram rate feed.
574. `ALGO` Size contributions to the gram target.
575. `UI` Show gram and PKR side by side in the ledger.
576. `UI` One-tap assisted purchase on payout day.
577. `API` Auto-convert the pot at that day's spot price, optional.
578. `COPY` Only the spot-settled variant may be labelled Shariah-compliant.
579. `LEGAL` Exact contract wording is mufti-to-confirm; leave unlabelled until then.
580. `API` Never hold the metal; assisted purchase only until a vault partner exists.

---

## 14 · BUSINESS MODEL AND FEES — SUBSYSTEM 9

Spec: build plan §9.

581. `API` The complete fee book (§9.1) is not encoded in one place.
582. `ALGO` Fees are scattered across create, committee and payout code.
583. `UI` No single fee schedule screen for the member.
584. `UI` Fees are not shown as a rupee figure before any commitment.
585. `ALGO` Rs 50 per installment flat fee is not implemented.
586. `API` Fee must be integer paisa, basis points, no floating point.
587. `ALGO` Break-even arithmetic per circle is not computed.
588. `UI` Host cannot see what the circle costs its members in total.
589. `ALGO` Cover facility (§9.3) is unimplemented.
590. `ALGO` Set-off against secondary products (§9.4) unimplemented.
591. `API` Late fees are platform revenue except on Shariah circles.
592. `API` On Shariah circles they must route to the circle's own pool.
593. `TEST` No test that Shariah-circle penalties never reach platform revenue.
594. `ALGO` Salary-linked discount ×0.8 applies but is not shown as a saving.
595. `UI` Show the member the discount they earned and why.
596. `ALGO` Income and employer verification give up to 80% off Halqa charges.
597. `UI` Present it as a discount, never as a gate.
598. `API` Referral Rs 250 on first completion is not surfaced anywhere.
599. `UI` No referral screen, no code, no tracking.
600. `API` Organizer incentives are unbuilt.
601. `ALGO` Completion bounty per clean-finished circle.
602. `ALGO` Single-level revenue share on their circles' fee revenue.
603. `UI` Verified Organizer status tiers.
604. `API` Free Halqa-fill and fee waivers for verified organizers.
605. `ALGO` Accelerated Sakh for organizers.
606. `API` Never multi-level; enforce structurally, not by policy.
607. `API` Halqa-fill higher management fee is disclosed only in a title tag.
608. `UI` Surface the Halqa-fill fee properly at the decision point.
609. `LEGAL` Fees & Payments Policy must match the code exactly; audit both.
610. `API` No invoicing or statement for fees paid.
611. `UI` No annual summary of what a member paid Halqa.
612. `ALGO` Formal-finance on-ramp: N clean circles to a pre-approved product.
613. `API` Institution pays origination, never the member.
614. `API` TASDEEQ two-way membership is unbuilt.
615. `API` Furnish consented repayment data as an alternative-data contributor.
616. `API` Reciprocity: score reads back from the bureau.
617. `UI` Show the member their bureau status and what was shared.
618. `API` Bureau-impact audit queue exists but has no export.
619. `API` No TASDEEQ export format implemented.
620. `LEGAL` Direct subscriber agreement with TASDEEQ not in place.

---

## 15 · CONSUMERS AND SAVERS SPLIT — SUBSYSTEM 10

Spec: build plan §10, requested by Akif.

621. `DB` No member intent field distinguishing consumer from saver.
622. `UI` Onboarding never asks what the member is here for.
623. `ALGO` Product surfacing should differ by intent.
624. `UI` Consumers should see asset and early-turn products first.
625. `UI` Savers should see late-turn rewards and the vault first.
626. `ALGO` Fee curve should be presented differently to each.
627. `ALGO` Risk gates differ; consumers borrow, savers lend.
628. `UI` Home page is identical for everyone today.
629. `ALGO` Seat recommendation should follow intent.
630. `UI` No explanation that an early seat is a loan and a late seat is savings.
631. `COPY` This is the clearest idea in the model and it appears nowhere.
632. `ALGO` Match consumers and savers within a circle deliberately.
633. `API` Circle composition should target a healthy mix.
634. `UI` Show the host the mix in their circle.
635. `ALGO` Price the early fee against the late bonus transparently.
636. `UI` Make the fee curve the public headline, as specified.
637. `UI` Show a member both sides of the curve before they pick a seat.
638. `ALGO` Earned early-slot progression is unbuilt.
639. `UI` Show progress toward an earned early slot.
640. `ALGO` Market the mutual guarantee as hard as Money Fellows markets its own.
641. `UI` The mutual guarantee is invisible outside the join transaction.
642. `UI` No screen explaining what the guarantee means in practice.

---

## 16 · ALGORITHMS AND ENGINES

Chairman: "no algorithms." Several engines exist in `lib/` but are not wired
to any surface, so they do not exist to a member.

643. `UI` Exposure score engine has no member-facing surface.
644. `UI` Time-value engine has no surface.
645. `UI` Rewards engine has no surface beyond a points number.
646. `UI` Exit-ladder engine has UI but no restitution behind it.
647. `ALGO` Risk engine output is not shown to the host in plain language.
648. `ALGO` Distribution engine is not explained anywhere.
649. `ALGO` Reputation engine feeds the score with no visible breakdown.
650. `UI` Score factors panel shows three counters, not the real model.
651. `ALGO` No score simulator: "what happens if I miss one?"
652. `UI` No projection of the score over the circle's life.
653. `ALGO` Forward liability L(k) is computed but never displayed.
654. `UI` Show L(k) in rupees at seat choice; this is the core number.
655. `ALGO` Family-linkage graph blocks joins but never explains why.
656. `UI` A blocked member sees a bare 403.
657. `ALGO` Gap fund logic is opaque to the host.
658. `ALGO` Discounts engine result is not itemised on any receipt.
659. `ALGO` Settlement engine has no member-visible trace.
660. `ALGO` Salary-pattern engine result is not shown to the member.
661. `ALGO` Profit engine and sukoon are dormant and unlabelled as such.
662. `ALGO` Scheme catalogue syncs at boot with no admin view.
663. `ALGO` Partner catalogue syncs at boot with no admin view.
664. `API` No admin surface at all for any engine.
665. `API` No feature-flag admin; flags are compile-time constants.
666. `ALGO` No A/B or staged rollout capability.
667. `ALGO` No monitoring of engine outputs for drift.
668. `TEST` Unit tests cover math but not the wiring to any screen.

---

## 17 · ERRORS, BUGS AND QUALITY

669. `BUG` 356 CSS classes had no rules; fixed, but needs visual verification.
670. `BUG` Structural CSS was keyed on class names, not the real DOM; corrected.
671. `BUG` Rows are `<article>`; several selectors still assume `<div>`.
672. `BUG` Status modifiers are `status-open`, not `OPEN`; audit all of them.
673. `BUG` Crypto vault row clips its own text.
674. `BUG` `.avatar` is styled for a green header and is invisible on white panels.
675. `BUG` `.market-rules` has an icon child with no flex layout.
676. `BUG` `.invite-code` renders label and code as one run-on string.
677. `BUG` Chat uses `<header>`/`<footer>`/`<article>` with no matching rules.
678. `BUG` `.detail-grid` is used both for tiles and for full panels.
679. `BUG` `.mini` is double-styled by two rules that fight.
680. `BUG` Browser back does nothing.
681. `BUG` Refresh loses page state.
682. `BUG` Socket chat shows a permanent down banner in production.
683. `BUG` API root returned 500; fixed, needs a regression test.
684. `BUG` No error boundary copy that tells a member what to do.
685. `BUG` Failed network calls show raw messages.
686. `BUG` No offline handling of any kind.
687. `BUG` No retry on a failed read.
688. `BUG` Long member names overflow several rows.
689. `BUG` Long circle names overflow the header.
690. `BUG` Tables scroll horizontally on mobile with no affordance.
691. `BUG` Charts have no accessible description.
692. `BUG` No focus states on custom buttons.
693. `BUG` Tap targets below 44px in several rows.
694. `BUG` Colour contrast unverified against WCAG on the lime palette.
695. `BUG` No `prefers-reduced-motion` handling for the new animations.
696. `TEST` No visual regression tests.
697. `TEST` No end-to-end test of join to payout.
698. `TEST` Integration suite needs a running DB and is not in CI.
699. `TEST` Known flakes are documented but not fixed.
700. `API` Production schema drift: additive SQL written but not confirmed applied.
701. `API` No migration runner in the deploy pipeline.
702. `API` No health check beyond a single endpoint.
703. `API` No structured logging.
704. `API` No error reporting service.
705. `API` No rate limiting on read endpoints.
706. `API` Cron failures are silent.
707. `DOC` `DEPLOY.md` does not describe the additive-SQL step.
708. `DOC` No runbook for a failed deploy.

---

## 18 · FORMATTING CONTINUITY — ONE CASH-APP LANGUAGE

The app must read like JazzCash, Easypaisa or SadaPay: the same row, the same
money, the same header, the same button, on every screen. Today each page
invents its own. Continuity is the feature.

709. `FMT` One money formatter for the whole app; no page formats its own.
710. `FMT` Money always `Rs 10,000`, thin space, never `10000` or `PKR`.
711. `FMT` Money always tabular numerals so columns align.
712. `FMT` Large amounts use lakh/crore where a Pakistani reader expects it.
713. `FMT` Paisa never shown unless non-zero.
714. `FMT` Negative money shown as `− Rs 500`, never parentheses.
715. `FMT` One date formatter; `27 Aug 2026`, never `8/27/2026`.
716. `FMT` Relative dates for anything inside 7 days: "in 3 days", "yesterday".
717. `FMT` One duration formatter; "5 months 9 days", never "159d 21h".
718. `FMT` One percentage formatter, one decimal maximum.
719. `FMT` One phone formatter, `0300 1234567`.
720. `FMT` One CNIC formatter, `12345-1234567-1`.
721. `FMT` One account-number mask, last 4 only.
722. `UI` One page header component; every page uses it.
723. `UI` Every inner page has a back affordance in the same place.
724. `UI` One row component: icon, title, subtitle, value, chevron.
725. `UI` Label left, value right, on every single row in the app.
726. `UI` One card component; no page hand-rolls a panel.
727. `UI` One section-heading style across every page.
728. `UI` One primary button; full width, fixed to the bottom on action screens.
729. `UI` One secondary button; never two primaries on a screen.
730. `UI` One destructive style, used only for destructive actions.
731. `UI` One status chip component with a fixed colour map.
732. `UI` Status colours mean the same thing on every screen.
733. `UI` One empty state component: icon, one line, one action.
734. `UI` One loading skeleton; no spinners on list screens.
735. `UI` One error state with a retry.
736. `UI` One bottom sheet; same corner radius, same handle, same animation.
737. `UI` One modal; same backdrop opacity and blur everywhere.
738. `UI` One toast for confirmations; no inline success banners.
739. `UI` One avatar component with one fallback rule.
740. `UI` One amount-entry keypad for every money input.
741. `UI` One confirmation screen pattern before any money moves.
742. `UI` One receipt layout for every kind of receipt.
743. `UI` One icon set at one stroke width; no mixed weights.
744. `UI` One spacing scale; remove every inline pixel value.
745. `UI` Remove all inline `style={{...}}` in favour of classes.
746. `UI` One elevation scale; three shadows maximum.
747. `UI` One corner-radius scale; stop mixing 10, 12, 14, 15, 17.
748. `UI` Bottom nav visible on every top-level page, hidden on flows.
749. `UI` Safe-area padding on every screen for notched devices.
750. `UI` One transition between pages; no page animates differently.
751. `UI` Tap targets never below 44px anywhere.
752. `UI` One focus ring, visible on every interactive element.
753. `DOC` Write the pattern library down so it stops drifting.
