# Halqa Interface Specification

Reference HQ-IN-03. Generated from the route files of the interface service; not written by hand.

Every endpoint below states what it requires to be called, what it accepts, what it answers and how it fails. Failures carry a shared code and a sentence in English and Urdu (lib/errors.ts); the codes are listed with each endpoint. Rate limits are per route and are counted per member where the request is signed in, and per address otherwise (lib/rate-limits.ts).

99 endpoints in 15 route files.

## account

Rate limit: write (120).

### GET /api/account/statement

- Sign in: required
- Request query: `from: z.string().datetime().optional(), to: z.string().datetime().optional(),`
- Responses:
    - 200: `{ member: user, from: start.toISOString(), to: end.toISOString(), totals: { paidInPaisa: paidIn.toString(), collectedPaisa: collected.toString(), penaltiesPaisa ...`

### GET /api/account/limits

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ level: user.kycLevel, levelName: user.kycLevel >= 2 ? 'Bank verified' : user.kycLevel >= 1 ? 'Identity on file' : 'Basic', limits: [ { key: 'committees', labe ...`

### GET /api/account/devices

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ sessions: tokens.map((t, i) => { const e = nearest(t.createdAt); return { id: t.familyId, signedInAt: t.createdAt.toISOString(), device: describe(e?.userAgent ...`

### POST /api/account/devices/sign-out-others

- Sign in: required
- Request body: none
- Responses:
    - 200: `{ signedOut: count }`

## agreements

Rate limit: write (120).

### GET /api/agreements/status

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ undertaking: undertaking ? { signedAt: undertaking.signedAt, expiresAt: undertaking.expiresAt, fresh: Boolean(undertaking.expiresAt && undertaking.expiresAt > ...`

### GET /api/agreements/text

- Sign in: required
- Request query: none
- Responses:
    - 400: `{ error: 'committeeId is required for the mutual guarantee text' }`
    - 404: `{ error: 'Committee not found' }`
    - 200: `{ doc, version: MUTUAL_PG_VERSION, text, textHash: hashText(text) }`
    - 200: `{ doc, version: PLATFORM_UNDERTAKING_VERSION, text, textHash: hashText(text), renewalDays: UNDERTAKING_VALID_DAYS }`
- Errors: 400 VALIDATION_FAILED, 404 NOT_FOUND

### POST /api/agreements/sign

- Sign in: required
- Request body: `doc: z.enum(['PLATFORM_UNDERTAKING', 'MUTUAL_PG']), committeeId: z.string().optional(), accept: z.literal(true), // Adopted digital signature: the member types their full legal name // (verified against the account) and may add a drawn signature (small // PNG data-URL). Required for the undertaking — a checkbox is not a sign. signedName: z.string().trim().min(3).max(120).optional(), signatureData: ...`
- Responses:
    - 400: `{ error: 'Type your full legal name as your signature' }`
    - 400: `{ error: `The signature must match the account name exactly: ${user.fullName}` }`
    - 400: `{ error: 'committeeId is required for the mutual guarantee' }`
    - 201: `{ signedAt: row.signedAt, version: row.version, textHash: row.textHash }`
    - 201: `{ signedAt: row.signedAt, expiresAt, version: row.version, textHash: row.textHash }`
- Errors: 400 VALIDATION_FAILED

## auth

Rate limit: signIn (20 per 15 min).

### POST /api/auth/register

- Sign in: not required, open by design
- Request body: `fullName: z.string().trim().min(2).max(80), username: z.string().trim().min(3).max(30), phone: z.string().trim().min(11).max(15), email: z.string().trim().email(), password: z.string().trim().min(8).max(128), referredBy: z.string().trim().min(3).max(30).optional(), // KYC-grade identity at signup (payment-app standard). CNIC optional at // the API so older clients keep working; the web form requir ...`
- Responses:
    - 400: `{ error: 'Password must contain both letters and numbers' }`
    - 409: `{ error: 'Username, email, phone, or CNIC already exists' }`
    - 201: `{ user: withHasPin(user), accessToken: signAccess(payload), refreshToken }`
- Errors: 400 VALIDATION_FAILED, 409 CONFLICT

### POST /api/auth/phone-otp

- Sign in: not required, open by design
- Request body: `phone: z.string().trim().min(11).max(15)`
- Responses:
    - 201: `{ otpSent: true, ...((process.env.NODE_ENV !== 'production' || demoMode()) ? { devCode: code } : {}) }`

### POST /api/auth/phone-otp/verify

- Sign in: not required, open by design
- Request body: `phone: z.string().trim().min(11).max(15), code: z.string().trim().regex(/^\d{6}$/)`
- Responses:
    - 200: `{ verified: true, demo: true }`
    - 404: `{ error: 'Request a code first' }`
    - 410: `{ error: 'The code expired — request a new one' }`
    - 400: `{ error: attempts >= OTP_MAX_ATTEMPTS ? 'Too many wrong attempts — request a new code' : 'Incorrect code' }`
    - 200: `{ verified: true }`
- Errors: 400 VALIDATION_FAILED, 404 NOT_FOUND, 410 SERVICE_ERROR

### POST /api/auth/set-pin

- Sign in: required
- Request body: `pin: z.string().trim().regex(/^\d{4,6}$/, 'PIN must be 4 to 6 digits'), currentPin: z.string().trim().optional()`
- Responses:
    - 403: `{ error: 'Current PIN is incorrect' }`
    - 200: `{ hasPin: true }`
- Errors: 403 NOT_ALLOWED

### POST /api/auth/verify-pin

- Sign in: required
- Request body: `pin: z.string().trim().regex(/^\d{4,6}$/)`
- Responses:
    - 200: `{ verified: true, hasPin: false }`
    - 401: `{ error: 'Incorrect PIN' }`
    - 200: `{ verified: true, hasPin: true }`
- Errors: 401 SIGN_IN_REQUIRED

### POST /api/auth/set-biometric

- Sign in: required
- Request body: `credentialId: z.string().trim().min(1).max(512).nullable()`
- Responses:
    - 200: `{ hasBiometric: !!credentialId }`

### POST /api/auth/login

- Sign in: not required, open by design
- Request body: `identity: z.string().trim().min(1), password: z.string().min(8).max(128)`
- Responses:
    - 423: `{ error: 'Too many failed sign-ins. This account is temporarily locked — try again in a few minutes.' }`
    - 401: `{ error: 'Invalid username or password' }`
    - 200: `{ user: withHasPin(safe), accessToken: signAccess(payload), refreshToken }`
- Errors: 401 SIGN_IN_REQUIRED, 423 PIN_LOCKED

### POST /api/auth/refresh

- Sign in: not required, open by design
- Request body: `refreshToken: z.string()`
- Responses:
    - 401: `{ error: 'Refresh token expired' }`
    - 401: `{ error: 'Refresh token invalid' }`
    - 401: `{ error: 'Session security alert: this session was revoked. Please sign in again.' }`
    - 403: `{ error: 'Account unavailable' }`
    - 200: `{ accessToken: signAccess(nextPayload), refreshToken: nextRefresh }`
- Errors: 401 SIGN_IN_REQUIRED, 403 NOT_ALLOWED

### POST /api/auth/logout

- Sign in: required
- Request body: `refreshToken:z.string().optional()`
- Responses:
    - 204: `no content`

### GET /api/auth/me

- Sign in: required
- Request query: none
- Responses:
    - 200: `user ? withHasPin(user) : user`

## chat

Rate limit: write (120).

### GET /api/chat/:committeeId

- Sign in: required
- Path parameters: committeeId
- Request query: none
- Responses:
    - 403: `{ error: 'Only members of this committee can read its messages' }`
    - 200: `{ messages: since ? messages : messages.reverse() }`
- Errors: 403 NOT_ALLOWED

### POST /api/chat/:committeeId

- Sign in: required
- Path parameters: committeeId
- Request body: `body: z.string().min(1).max(2000)`
- Responses:
    - 403: `{ error: 'Only members of this committee can post here' }`
    - 400: `{ error: 'That message is empty' }`
    - 429: `{ error: 'Slow down a moment' }`
    - 201: `message`
- Errors: 400 VALIDATION_FAILED, 403 NOT_ALLOWED, 429 TOO_MANY_REQUESTS

## committees

Rate limit: write (120).

### GET /api/committees

- Sign in: required
- Request query: none
- Responses:
    - 200: `rows`

### GET /api/committees/discover

- Sign in: required
- Request query: none
- Responses:
    - 200: `mapped.filter(c => c.availability !== 'OPEN' || c.eligiblePositions.length > 0)`

### GET /api/committees/preview/:inviteCode

- Sign in: required
- Path parameters: inviteCode
- Request query: none
- Responses:
    - 404: `{ error: 'Invite code not found' }`
    - 200: `{ id: committee.id, name: committee.name, mode: committee.mode, status: committee.status, memberCount: committee.members.length, memberCap: committee.memberCap, ...`
- Errors: 404 NOT_FOUND

### GET /api/committees/:id

- Sign in: required
- Path parameters: id
- Request query: none
- Responses:
    - 404: `{ error: 'Committee not found' }`
    - 200: `{ ...committee, guaranteeFundPaisa }`
- Errors: 404 NOT_FOUND

### POST /api/committees

- Sign in: required
- Request body: `name: z.string().trim().min(3).max(80), memberCap: z.number().int().min(3).max(150), mode: z.enum(['ROTATING','HYBRID','INVESTMENT']).default('ROTATING'), contributionPaisa: paisaInput.refine(value => value <= 10_000_000_000n, 'Contribution exceeds the prototype safety limit'), cadencePreset: z.enum(['VERY_SHORT','SHORT','MID','LONG']), periodDays: z.number().int().min(1).max(365), minMembersToSta ...`
- Responses:
    - 428: `UNDERTAKING_428`
    - 400: `{ error: 'Minimum members cannot exceed member capacity' }`
    - 400: `{ error: `${input.mode} committees allow a maximum ${allocationCap * 100}% investment allocation` }`
    - 400: `{ error: 'Investment circles require at least 50% allocation' }`
    - 400: `{ error: 'Contribution must be at least Rs 100' }`
    - 403: `{ error: 'Restricted accounts cannot host committees' }`
- Errors: 400 VALIDATION_FAILED, 403 NOT_ALLOWED, 409 CONFLICT, 428 SERVICE_ERROR

### POST /api/committees/join

- Sign in: required
- Request body: `inviteCode: z.string().trim().min(3)`
- Responses:
    - 404: `{ error: 'Invite code not found' }`
- Errors: 404 NOT_FOUND

### POST /api/committees/:id/join-public

- Sign in: required
- Path parameters: id
- Request body: none
- Responses:
    - 403: `{ error: 'This circle is invite-only' }`
- Errors: 403 NOT_ALLOWED

### POST /api/committees/:id/waitlist

- Sign in: required
- Path parameters: id
- Request body: `preferredPosition: z.number().int().min(1).max(150).nullable().optional()`
- Responses:
    - 428: `UNDERTAKING_428`
    - 404: `{ error: 'Discoverable circle not found' }`
    - 409: `{ error: 'You are already in this circle' }`
    - 400: `{ error: 'Preferred turn exceeds this circle capacity' }`
    - 201: `row`
- Errors: 400 VALIDATION_FAILED, 404 NOT_FOUND, 409 CONFLICT, 428 SERVICE_ERROR

### POST /api/committees/:id/join

- Sign in: required
- Path parameters: id
- Request body: `position: z.number().int().min(1).max(150).optional()`
- Responses:
    - 428: `UNDERTAKING_428`
    - 403: `{error:'Restricted accounts cannot join committees'}`
    - 403: `{error:`Rehabilitation cooldown applies until ${joiningUser.cooldownUntil.toISOString()}`}`
    - 403: `{error:`Joining is paused under the linked-account policy: an account linked to yours (${linkedDefault.fullName}) has an unresolved default. It clears when thei ...`
    - 404: `{ error: 'Committee not found' }`
    - 409: `{ error: 'Committee has already started' }`
- Errors: 403 NOT_ALLOWED, 404 NOT_FOUND, 409 CONFLICT, 428 SERVICE_ERROR

### POST /api/committees/:id/start

- Sign in: required
- Path parameters: id
- Request body: `fundGap: z.boolean().optional()`
- Responses:
    - 409: `{ error: 'Only forming committees can start' }`
    - 409: `{ error: `At least ${committee.minMembersToStart} members are required` }`
    - 409: `{ error: `${members.length - accepted} member risk acknowledgement(s) are still required` }`
    - 409: `{ error: `${unsigned.length} member(s) have not signed the mutual member-to-member guarantee for this circle` }`
    - 409: `{ error: `${missing.length} member protection commitment(s) are incomplete` }`
    - 200: `{ status: 'CONFIRMING', closesAt: new Date(openedAt.getTime() + CONFIRMATION_WINDOW_HOURS * 3_600_000), message: 'Confirmation window open', }`
- Errors: 409 CONFLICT

### GET /api/committees/:id/payment-matrix

- Sign in: required
- Path parameters: id
- Request query: none
- Responses:
    - 200: `rounds`

### POST /api/committees/:id/nudge/:userId

- Sign in: required
- Path parameters: id, userId
- Request body: none
- Responses:
    - 201: `notice`

### POST /api/committees/:id/payout

- Sign in: required
- Path parameters: id
- Request body: `idempotencyKey: z.string().min(8)`
- Responses:
    - 409: `{ error: 'No active round' }`
    - 409: `{ error: 'Liquidate the active investment before payout' }`
    - 409: `{ error: `Payout is locked until ${round.payoutDate.toISOString()}` }`
    - 409: `{ error: `${blocking} current contribution(s) are not paid` }`
    - 409: `{ error: `The guarantee pool holds ${fundBalance.toString()} paisa and cannot cover ${coverable.length} missed installment(s) totalling ${guaranteeShortfallPais ...`
    - 409: `{ error: 'Recipient did not clear the current installment by the locked seven-day eligibility deadline' }`
- Errors: 409 CONFLICT

### GET /api/committees/:id/receivables-pack

- Sign in: required
- Path parameters: id
- Request query: none
- Responses:
    - 200: `{ generatedAt: new Date().toISOString(), disclaimer: 'Stage-1 record-only data: transfers are member-to-member and recorded, not custodied. Figures are ledger-d ...`

### POST /api/committees/:id/leave

- Sign in: required
- Path parameters: id
- Request body: none
- Responses:
    - 409: `{ error: 'The host cannot leave their own committee' }`
    - 409: `{ error: 'You can only leave before starting or after a full cycle completes.' }`
    - 409: `{ error: 'Clear all outstanding contributions before leaving.' }`
    - 200: `{ message: 'You have exited the committee' }`
- Errors: 409 CONFLICT

### POST /api/committees/:id/listing

- Sign in: required
- Path parameters: id
- Request body: `listed: z.boolean()`
- Responses:
    - 409: `{ error: 'Cancelled circles cannot be listed' }`
    - 200: `{ listedPublicly: listed }`
- Errors: 409 CONFLICT

### POST /api/committees/:id/autopay

- Sign in: required
- Path parameters: id
- Request body: `enabled: z.boolean(), rail: z.enum(['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CASH']).optional()`
- Responses:
    - 200: `{ autoDebitEnabled: updated.autoDebitEnabled, autoDebitRail: updated.autoDebitRail, autoDebitMandateAt: updated.autoDebitMandateAt }`

### POST /api/committees/:id/withdraw

- Sign in: required
- Path parameters: id
- Request body: none
- Responses:
    - 409: `{ error: 'Free withdrawal is only open during the confirmation window' }`
    - 409: `{ error: 'The confirmation window has closed' }`
    - 404: `{ error: 'You are not in this committee' }`
    - 409: `{ error: 'The host cannot withdraw. Cancel the committee instead.' }`
    - 200: `{ message: 'You have left this committee. Nothing is owed.', ...result }`
- Errors: 404 NOT_FOUND, 409 CONFLICT

### PATCH /api/committees/:id/avatar

- Sign in: required
- Path parameters: id
- Request body: `avatarUrl: z.string().max(300_000).nullable(),`
- Responses:
    - 200: `updated`

## exchange

Rate limit: financial (30).

### GET /api/exchange

- Sign in: required
- Request query: none
- Responses:
    - 200: `listings.map(listing => { const targetRound = listing.committee.rounds.find(round => round.roundNumber === listing.position); const remainingRounds = Math.max(0 ...`

### POST /api/exchange

- Sign in: required
- Request body: `committeeId: z.string(), premiumPaisa: paisaInput`
- Responses:
    - 403: `{ error: 'Marketplace access is locked during default recovery or cooldown' }`
    - 409: `{ error: 'Turn sales are not enabled for this committee' }`
    - 400: `{ error: 'Sukoon and Bazaar circles allow free turn swaps only — list at a zero premium, or use a Classic, Priority or Sigma circle for premium sales' }`
    - 409: `{ error: 'Only a future, unreceived turn can be listed' }`
    - 409: `{ error: 'Record the current installment before listing your turn' }`
    - 400: `{ error: 'Premium must be between zero and 50% of the payout' }`
- Errors: 400 VALIDATION_FAILED, 403 NOT_ALLOWED, 409 CONFLICT

### POST /api/exchange/:id/bid

- Sign in: required
- Path parameters: id
- Request body: `premiumPaisa: paisaInput`
- Responses:
    - 404: `{ error: 'Open listing not found' }`
    - 409: `{ error: 'Cannot bid on your own listing' }`
    - 403: `{ error: 'Turn buying is not available at your reliability band — build your score to unlock the marketplace' }`
    - 403: `{error:'Turn auctions are currently restricted to active members of the same committee'}`
    - 409: `{error:'Only members with a future unreceived turn can bid'}`
    - 409: `{error:'That turn is earlier than your reliability band allows you to hold'}`
- Errors: 400 VALIDATION_FAILED, 403 NOT_ALLOWED, 404 NOT_FOUND, 409 CONFLICT

### POST /api/exchange/:id/bids/:bidId/accept

- Sign in: required
- Path parameters: id, bidId
- Request body: `idempotencyKey: z.string().min(8)`
- Responses:
    - 404: `{ error: 'Open listing not found' }`
    - 403: `{ error: 'Only the seller can accept a bid' }`
    - 404: `{ error: 'Valid bid not found' }`
    - 409: `{ error: 'The buyer no longer has an eligible future turn' }`
    - 200: `{ message: 'Turn positions exchanged', buyerType: 'INSIDE', feePaisa: fee, sellerNetPaisa: sellerNet }`
- Errors: 403 NOT_ALLOWED, 404 NOT_FOUND, 409 CONFLICT

## exits

Rate limit: financial (30).

### GET /api/exits/committee/:id/options

- Sign in: required
- Path parameters: id
- Request query: `rung: z.enum(['WINDOW', 'SUBSTITUTION', 'GROUP_VOTE', 'HARDSHIP']), reason: z.string().max(2_000).optional(), voiceNoteUrl: z.string().url().optional(), substituteUserId: z.string().optional(),`
- Responses:
    - 403: `{ error: 'Not an active member of this circle' }`
    - 200: `{ hasCollected: me.hasReceived, inConfirmationWindow: inWindow(committee), installmentsPaid: paidCount, available: rungs, quotes, vote: VOTE, // A member who al ...`
- Errors: 403 NOT_ALLOWED

### POST /api/exits/committee/:id

- Sign in: required
- Path parameters: id
- Request body: `approve: z.boolean()`
- Responses:
    - 403: `{ error: 'Not an active member of this circle' }`
    - 409: `{ error: 'You have already collected. Leaving now is a default, not an exit.' }`
    - 409: `{ error: 'You already have an open exit request on this circle' }`
    - 409: `{ error: `${RUNG_LABEL[input.rung]} is not available on this circle right now` }`
    - 201: `{ request, restitution: { ...restitution, totalDuePaisa: restitution.totalDuePaisa.toString(), debts: restitution.debts.map(d => ({ ...d, amountPaisa: d.amountP ...`
- Errors: 403 NOT_ALLOWED, 409 CONFLICT

### POST /api/exits/:requestId/vote

- Sign in: required
- Path parameters: requestId
- Request body: `approve: z.boolean()`
- Responses:
    - 409: `{ error: 'This request is already decided' }`
    - 403: `{ error: 'You cannot vote on your own exit' }`
    - 200: `{ request: updated, outcome }`
- Errors: 403 NOT_ALLOWED, 409 CONFLICT

### POST /api/exits/:requestId/settle

- Sign in: required
- Path parameters: requestId
- Request body: none
- Responses:
    - 403: `{ error: 'Only the host settles restitution at cycle close' }`
    - 409: `{ error: 'Only an approved exit can be settled' }`
    - 200: `{ ok: true, settled: request.debts.length }`
- Errors: 403 NOT_ALLOWED, 409 CONFLICT

### GET /api/exits/committee/:id

- Sign in: required
- Path parameters: id
- Request query: none
- Responses:
    - 200: `requests.map(r => ({ ...r, restitutionDuePaisa: r.restitutionDuePaisa.toString(), finePaisa: r.finePaisa.toString(), fineToMembersPaisa: r.fineToMembersPaisa.to ...`

## notifications

Rate limit: read (600).

### GET /api/notifications

- Sign in: required
- Request query: none
- Responses:
    - 200: `await prisma.notification.findMany({ where: { userId: req.auth!.userId }, orderBy: { createdAt: 'desc' }, take: 50 })`

### PATCH /api/notifications/:id/read

- Sign in: required
- Path parameters: id
- Request body: none
- Responses:
    - 200: `{ updated: result.count }`

### PATCH /api/notifications/read-all

- Sign in: required
- Request body: none
- Responses:
    - 200: `{ updated: result.count }`

## partner

Rate limit: read (600).

### GET /api/partner

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ partner: partner ? { name: partner.name, shortCode: partner.shortCode, sandbox: partner.sandbox, custodyEnabled: partner.custodyEnabled, kycEnabled: partner.k ...`

### POST /api/partner/kyc

- Sign in: required
- Request body: `cnic: z.string().trim().regex(/^\d{13}$/, 'CNIC must be exactly 13 digits without dashes'), iban: z.string().trim().min(24).max(34),`
- Responses:
    - 409: `{ error: 'No active identity-verification partner' }`
    - 400: `{ error: 'IBAN failed the PK format or checksum test' }`
    - 403: `{ error: 'Restricted accounts cannot upgrade verification' }`
    - 200: `{ kycLevel: user.kycLevel, kycStatus: user.kycStatus, bankVerifiedAt: user.bankVerifiedAt, bankVerifyRef: user.bankVerifyRef, partner: partner.name }`
    - 409: `{ error: 'This CNIC is already verified on another account' }`
    - 201: `{ kycLevel: updated.kycLevel, kycStatus: updated.kycStatus, bankVerifiedAt: updated.bankVerifiedAt, bankVerifyRef, partner: partner.name, sandbox: partner.sandb ...`
- Errors: 400 VALIDATION_FAILED, 403 NOT_ALLOWED, 409 CONFLICT

### POST /api/partner/committees/:id/statements

- Sign in: required
- Path parameters: id
- Request body: `lines: z.array(z.object({ lineRef: z.string().trim().min(4).max(60), amountPaisa: paisaInput, narration: z.string().trim().min(3).max(200), postedAt: z.coerce.date(), })).min(1).max(200),`
- Responses:
    - 409: `{ error: 'Statement import is only available for bank-custody circles' }`
    - 409: `{ error: 'No active custody partner' }`
    - 409: `{ error: 'No collecting round to settle against' }`
    - 201: `{ batchId: batch.id, totalLines: input.lines.length, matchedLines: matched, results }`
- Errors: 409 CONFLICT

## payments

Rate limit: financial (30).

### POST /api/payments/initiate

- Sign in: required
- Request body: `roundId: z.string(), rail: z.enum(['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CASH']), idempotencyKey: z.string().min(8),`
- Responses:
    - 404: `{ error: 'Round not found' }`
    - 409: `{ error: 'Round is not collecting payments' }`
    - 404: `{ error: 'Payment obligation not found' }`
    - 200: `{ settled: true, payment }`
    - 200: `{ settled: false, instruction }`
    - 201: `{ settled: true, payment: settled, instruction }`
- Errors: 404 NOT_FOUND, 409 CONFLICT

### GET /api/payments/mine

- Sign in: required
- Request query: none
- Responses:
    - 200: `await prisma.payment.findMany({ where: { payerId: req.auth!.userId }, include: { round: { include: { committee: { select: { id: true, name: true } } } } }, orde ...`

### POST /api/payments

- Sign in: required
- Request body: `roundId: z.string(), paidVia: z.enum(['RAAST','JAZZCASH','EASYPAISA','BANK_TRANSFER','CASH']), txnRef: z.string().trim().min(4).max(100), idempotencyKey: z.string().min(8),`
- Responses:
    - 404: `{ error: 'Round not found' }`
    - 409: `{ error: 'Round is not collecting payments' }`
    - 404: `{ error: 'Payment obligation not found' }`
    - 200: `payment`
    - 201: `updated`
- Errors: 404 NOT_FOUND, 409 CONFLICT

## profile

Rate limit: write (120).

### POST /api/profile/verify-income

- Sign in: required
- Request body: `employerName: z.string().trim().min(2).max(80)`
- Responses:
    - 200: `{ incomeVerified: true, feeDiscountBps: INCOME_DISCOUNT_BPS }`

### POST /api/profile/secure-cheque

- Sign in: required
- Request body: none
- Responses:
    - 200: `{ chequeSecured: true, feeDiscountBps: CHEQUE_DISCOUNT_BPS }`

### POST /api/profile/clear-verification

- Sign in: required
- Request body: `kind: z.enum(['income', 'cheque'])`
- Responses:
    - 200: `{ cleared: kind }`

### GET /api/profile/credit

- Sign in: required
- Request query: none
- Responses:
    - 200: `await prisma.creditEvent.findMany({ where: { userId: req.auth!.userId }, orderBy: { scoredAt: 'desc' }, take: 50 })`

### GET /api/profile/reputation/:userId

- Sign in: required
- Path parameters: userId
- Request query: none
- Responses:
    - 404: `{ error: 'User not found' }`
    - 200: `reputation`
- Errors: 404 NOT_FOUND

### POST /api/profile/passport

- Sign in: required
- Request body: none
- Responses:
    - 404: `{ error: 'User not found' }`
    - 201: `issued`
- Errors: 404 NOT_FOUND

### GET /api/profile/summary

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ balancePaisa: totalRecordedPaisa + totalInvestmentProfitPaisa, totalRecordedPaisa, totalInvestmentProfitPaisa, activeCommittees: memberships, hostedCommittees ...`

### GET /api/profile/consent

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ dataConsent: u.dataConsent }`

### PATCH /api/profile/consent

- Sign in: required
- Request body: `enabled: z.boolean()`
- Responses:
    - 200: `{ dataConsent: u.dataConsent }`

### GET /api/profile/payment-methods

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ methods: methodsOf(u.paymentMethodsJson).map(publicMethod) }`

### POST /api/profile/payment-methods

- Sign in: required
- Request body: `rail: z.enum(['RAAST', 'JAZZCASH', 'EASYPAISA', 'BANK_TRANSFER', 'CARD']), accountNo: z.string().trim().max(34).optional(), accountTitle: z.string().trim().min(3, 'Enter the account holder name').max(60).optional(), bankName: z.string().trim().max(40).optional(), label: z.string().trim().max(40).optional(), preferred: z.boolean().optional(), // Card-only. The full PAN and CVC are accepted transien ...`
- Responses:
    - 409: `{ error: 'A maximum of five linked methods is allowed' }`
    - 400: `{ error: 'Card number, expiry and cardholder name are required' }`
    - 400: `{ error: 'Enter the full account / wallet number' }`
    - 400: `{ error: 'This account is not registered in your name. Auto-collection can only anchor to your own account.' }`
    - 201: `{ method: publicMethod(method), otpSent: true, ...(process.env.NODE_ENV !== 'production' ? { devCode: otp } : {}) }`
- Errors: 400 VALIDATION_FAILED, 409 CONFLICT

### POST /api/profile/payment-methods/:id/verify

- Sign in: required
- Path parameters: id
- Request body: `code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code')`
- Responses:
    - 404: `{ error: 'No pending code for this method — re-link it to get a fresh one' }`
    - 410: `{ error: 'The code expired — re-link the method to get a fresh one' }`
    - 400: `{ error: 'Incorrect code' }`
    - 200: `{ methods: updated.map(publicMethod) }`
- Errors: 400 VALIDATION_FAILED, 404 NOT_FOUND, 410 SERVICE_ERROR

### POST /api/profile/payment-methods/:id/preferred

- Sign in: required
- Path parameters: id
- Request body: none
- Responses:
    - 404: `{ error: 'Linked method not found' }`
    - 200: `{ methods: updated.map(publicMethod) }`
- Errors: 404 NOT_FOUND

### POST /api/profile/payment-methods/:id/salary

- Sign in: required
- Path parameters: id
- Request body: `enabled: z.boolean().default(true)`
- Responses:
    - 404: `{ error: 'Linked method not found' }`
    - 200: `updated`
- Errors: 404 NOT_FOUND

### DELETE /api/profile/payment-methods/:id

- Sign in: required
- Path parameters: id
- Request body: none
- Responses:
    - 404: `{ error: 'Linked method not found' }`
    - 409: `{ error: 'This is your salary account — collections anchor to it. Mark another account as your salary account first, then remove this one.' }`
    - 200: `{ methods: remaining.map(publicMethod) }`
- Errors: 404 NOT_FOUND, 409 CONFLICT

### POST /api/profile/salary-day

- Sign in: required
- Request body: `day: z.number().int().min(1).max(31).nullable()`
- Responses:
    - 200: `{ salaryDay: day, evaluation }`

### GET /api/profile/salary-status

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ ...u, payslip }`

### POST /api/profile/payslip

- Sign in: required
- Request body: `imageBase64: z.string().min(64).max(1_400_000)`
- Responses:
    - 400: `{ error: 'Send the payslip as a single photo (JPEG or PNG)' }`
    - 413: `{ error: 'Photo too large — retake it or use the in-app camera' }`
    - 201: `{ status: upload.status, uploadedAt: upload.uploadedAt }`
- Errors: 400 VALIDATION_FAILED, 413 SERVICE_ERROR

### POST /api/profile/salary-signals

- Sign in: required
- Request body: `events: z.array(z.object({ dayOfMonth: z.number().int().min(1).max(31), amountBand: z.string().trim().min(2).max(20), sourceClass: z.enum(['BANK', 'WALLET']), observedMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/), })).min(1).max(6)`
- Responses:
    - 201: `{ recorded: events.length, evaluation }`

### GET /api/profile/leads/summary

- Sign in: required
- Request query: `displayName: z.string().trim().min(2).max(40).nullable().optional(), avatarUrl: z.string().max(300_000).nullable().optional(), // data URI or hosted URL accentColor: z.enum(ACCENTS).optional(), themePref: z.enum(['system', 'light', 'dark']).optional(), langPref: z.enum(['en', 'ur']).optional(), textScale: z.number().int().min(90).max(140).optional(), highContrast: z.boolean().optional(), notifyPre ...`
- Responses:
    - 200: `{ goals: consentedByGoal }`

### GET /api/profile/appearance

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ ...user, accents: ACCENTS }`

### PATCH /api/profile/appearance

- Sign in: required
- Request body: `order: z.array(z.string()).min(1), // method ids, most-preferred first salaryMethodId: z.string().nullable().optional(),`
- Responses:
    - 200: `user`

### PATCH /api/profile/payment-methods/order

- Sign in: required
- Request body: `order: z.array(z.string()).min(1), // method ids, most-preferred first salaryMethodId: z.string().nullable().optional(),`
- Responses:
    - 200: `{ methods: next, salaryMethodId: salaryMethod?.id ?? null }`

## protection

Rate limit: write (120).

### POST /api/protection/delinquency/run

- Sign in: required
- Request body: none
- Responses:
    - 403: `{ error: 'The delinquency pass is scheduler-only in production' }`
    - 200: `await evaluateDelinquencies()`
- Errors: 403 NOT_ALLOWED

### GET /api/protection/committee/:id

- Sign in: required
- Path parameters: id
- Request query: none
- Responses:
    - 200: `{ committeeId: committee.id, policy: policyOf(committee.riskPolicyJson), payoutBufferBps: committee.payoutBufferBps, forwardLiabilityGateEnabled: securityPolicy ...`

### PUT /api/protection/committee/:id/commitment

- Sign in: required
- Path parameters: id
- Request body: `guarantorUsername: z.string().trim().min(2).max(40).optional(), promissoryRef: z.string().trim().min(4).max(120).optional(), autoDebitRef: z.string().trim().min(4).max(120).optional(), acceptedTerms: z.literal(true),`
- Responses:
    - 400: `{ error: 'Guarantor must be another unrestricted Halqa user with score 700+' }`
    - 200: `row`
- Errors: 400 VALIDATION_FAILED

### POST /api/protection/committee/:id/commitment/:membershipId/verify

- Sign in: required
- Path parameters: id, membershipId
- Request body: none
- Responses:
    - 404: `{ error: 'Protection commitment not found' }`
    - 200: `row`
- Errors: 404 NOT_FOUND

### POST /api/protection/committee/:id/peer-nudge/:userId

- Sign in: required
- Path parameters: id, userId
- Request body: none
- Responses:
    - 400: `{ error: 'You cannot nudge yourself' }`
    - 429: `{ error: 'Peer nudge limit reached for today' }`
    - 201: `{ message: 'Private reminder sent' }`
- Errors: 400 VALIDATION_FAILED, 429 TOO_MANY_REQUESTS

### GET /api/protection/recovery/mine

- Sign in: required
- Request query: none
- Responses:
    - 200: `await prisma.recoveryCase.findMany({ where: { userId: req.auth!.userId }, include: { committee: { select: { id: true, name: true } }, round: { select: { roundNu ...`

### POST /api/protection/recovery/:id/resolve

- Sign in: required
- Path parameters: id
- Request body: `txnRef: z.string().trim().min(4).max(120), idempotencyKey: z.string().min(8)`
- Responses:
    - 404: `{ error: 'Open recovery case not found' }`
    - 200: `{ message: 'Recovery payment recorded. A six-month low-risk cooldown applies after all cases are cleared.' }`
- Errors: 404 NOT_FOUND

## rewards

Rate limit: write (120).

### GET /api/rewards

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ ...summarise(user.rewardPoints, user.paymentStreak, user.longestStreak), scoreGainedThisCycle: user.scoreGainedThisCycle, completionRewardCapPaisa: COMPLETION ...`

### GET /api/rewards/ladder

- Sign in: required
- Request query: `kind: z.enum(['PAID_ON_TIME', 'PAID_EARLY', 'CIRCLE_COMPLETED_CLEAN', 'PAID_FOR_ANOTHER', 'MISSED']), committeeId: z.string().optional(), roundId: z.string().optional(), settled: z.boolean().default(true),`
- Responses:
    - 200: `{ tiers: LADDER.map(t => ({ ...t, rewardCapPaisa: t.rewardCapPaisa.toString() })), completionRewardCapPaisa: COMPLETION_REWARD_CAP_PAISA.toString(), }`

### POST /api/rewards/record

- Sign in: required
- Request body: `kind: z.enum(['PAID_ON_TIME', 'PAID_EARLY', 'CIRCLE_COMPLETED_CLEAN', 'PAID_FOR_ANOTHER', 'MISSED']), committeeId: z.string().optional(), roundId: z.string().optional(), settled: z.boolean().default(true),`
- Responses:
    - 403: `{ error: 'Reward events are emitted by settlement, not by clients' }`
    - 200: `result`
- Errors: 403 NOT_ALLOWED

## risk

Rate limit: read (600).

### GET /api/risk/committee/:id

- Sign in: required
- Path parameters: id
- Request query: none
- Responses:
    - 200: `{ ...result, consent, policy: committee.riskPolicyJson, memberConsentRequired: committee.memberConsentRequired, committeeStatus: committee.status, riskTolerance ...`

### POST /api/risk/committee/:id/refresh

- Sign in: required
- Path parameters: id
- Request body: none
- Responses:
    - 200: `{ ...result, assessmentId: assessment.id }`

### GET /api/risk/committee/:id/projection

- Sign in: required
- Path parameters: id
- Request query: `days: z.coerce.number().int().min(1).max(3650).optional()`
- Responses:
    - 200: `{ ...stressProjection(principal, committee.scheme?.indicativeRatePct ?? 0, days, result.score), riskScore: result.score, band: result.band, modelVersion: result ...`

### PATCH /api/risk/committee/:id/policy

- Sign in: required
- Path parameters: id
- Request body: `payoutBufferBps: z.number().int().min(0).max(3000).default(1500), targetRiskScore: z.number().int().min(1).max(8).default(3), liquidityReserveBps: z.number().int().min(500).max(4000).default(1000), latePenaltyBps: z.number().int().min(0).max(1000).default(200), guarantorRequired: z.boolean().default(false), dynamicDeposit: z.boolean().default(true), profitCollateral: z.boolean().default(true), cap ...`
- Responses:
    - 409: `{ error: 'Risk policy locks when the committee starts' }`
    - 400: `{ error: `${committee.mode} committees permit a maximum risk mandate of ${modeRiskCap}/10` }`
    - 200: `updated`
- Errors: 400 VALIDATION_FAILED, 409 CONFLICT

### POST /api/risk/committee/:id/consent

- Sign in: required
- Path parameters: id
- Request body: `accepted: z.literal(true)`
- Responses:
    - 201: `row`

## support

Rate limit: write (120).

### GET /api/support/tickets

- Sign in: required
- Request query: none
- Responses:
    - 200: `{ tickets, open: tickets.filter(t => t.status === 'OPEN').length }`

### GET /api/support/tickets/:id

- Sign in: required
- Path parameters: id
- Request query: none
- Responses:
    - 404: `{ error: 'No such ticket' }`
    - 200: `ticket`
- Errors: 404 NOT_FOUND

### POST /api/support/tickets

- Sign in: required
- Request body: `category: z.enum(CATEGORIES).default('QUESTION'), subject: z.string().trim().min(3).max(120), body: z.string().trim().min(5).max(4000), paymentId: z.string().trim().optional(), committeeId: z.string().trim().optional(),`
- Responses:
    - 404: `{ error: 'That payment is not one of yours' }`
    - 409: `{ error: `You already have an open case on that payment, ${already.reference}` }`
    - 429: `{ error: 'You have ten cases open already. Let those be answered first.' }`
    - 201: `ticket`
- Errors: 404 NOT_FOUND, 409 CONFLICT, 429 TOO_MANY_REQUESTS

### POST /api/support/tickets/:id/reply

- Sign in: required
- Path parameters: id
- Request body: `body: z.string().trim().min(2).max(4000)`
- Responses:
    - 404: `{ error: 'No such ticket' }`
    - 409: `{ error: 'That case is closed. Open a new one and quote the old reference.' }`
    - 200: `updated`
- Errors: 404 NOT_FOUND, 409 CONFLICT

### POST /api/support/tickets/:id/close

- Sign in: required
- Path parameters: id
- Request body: none
- Responses:
    - 404: `{ error: 'No such ticket' }`
    - 200: `updated`
- Errors: 404 NOT_FOUND
