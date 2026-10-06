# Halqa Data Dictionary

Reference HQ-IN-04. Generated from `prisma/schema.prisma`; not written by hand, so it cannot drift from the database.

Every field in every record, with its type, what it means where the name does not say, whether it holds personal data, and how long it is kept. Personal data is marked wide rather than narrow: a reviewer should see more marked than fewer. A field marked SECRET never leaves the service in any response.
53 fields hold personal data and 3 hold a secret that never leaves the service.


39 records, 600 fields.

## AgreementSignature

Retention: Ten years after the account closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String |  |  |
| user | User |  |  |
| committeeId | String? |  |  |
| committee | Committee? |  |  |
| docType | String |  |  |
| version | Int |  |  |
| textHash | String |  |  |
| signedName | String? | personal | Adopted digital signature: the member types their full legal name (must match the account name) and may also draw a signature; the drawing is stored as a small PNG data-URL. Together with textHash + ip + timestamp this is the evidence pack for the e-signature under ETO 2002. |
| signatureData | String? |  |  |
| signedAt | DateTime |  |  |
| expiresAt | DateTime? |  |  |
| ip | String? | personal |  |

## AuditLog

Retention: Two years.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| actorId | String? |  |  |
| action | String |  |  |
| entityType | String |  |  |
| entityId | String |  |  |
| payloadJson | Json |  |  |
| at | DateTime |  |  |

## ChatMessage

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| senderId | String |  |  |
| sender | User |  |  |
| body | String |  |  |
| pinned | Boolean |  |  |
| sentAt | DateTime |  |  |

## ChatRead

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String |  |  |
| user | User |  |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| lastReadAt | DateTime |  |  |

## Committee

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| name | String | personal |  |
| hostId | String |  |  |
| host | User |  |  |
| status | CommitteeStatus |  |  |
| mode | CommitteeMode |  |  |
| memberCap | Int |  |  |
| contributionPaisa | BigInt |  |  |
| cadencePreset | CadencePreset |  |  |
| periodDays | Int |  |  |
| reinvestRatio | Float |  |  |
| schemeId | String? |  |  |
| scheme | Scheme? |  |  |
| distributionMode | DistributionMode |  |  |
| allowTurnCashout | Boolean |  |  |
| allowTurnSale | Boolean |  |  |
| allowHalqaFill | Boolean |  | Host opted in at creation to let Halqa fill empty seats so the circle can start even if not full. Halqa's seats take the FIRST turns (host's choice, to minimise Halqa's own capital exposure) and carry a higher management fee, both disclosed before the host confirms. |
| listedPublicly | Boolean |  | Host-controlled discoverability: when true and the circle is FORMING with open seats, it appears in the public "Discover circles" list. The host can flip this on/off any time. |
| orderMode | OrderMode |  |  |
| joinPolicy | JoinPolicy |  |  |
| joinDeadline | DateTime? |  |  |
| minMembersToStart | Int |  |  |
| confirmingSince | DateTime? |  | Set when the host presses Start. The window closes 24 hours later and the circle activates. Null at every other point in the lifecycle. |
| avatarUrl | String? | personal | Group picture, the way a WhatsApp group has one. A data URI or a hosted URL; the same 300KB ceiling the member avatar uses. |
| autoStart | Boolean |  |  |
| currentRound | Int |  |  |
| cycleNumber | Int |  |  |
| scheduleLockedAt | DateTime? |  |  |
| inviteCode | String | unique |  |
| createdAt | DateTime |  |  |
| riskBand | RiskBand |  |  |
| riskScore | Int |  |  |
| riskTolerance | Int |  |  |
| riskPolicyJson | Json? |  |  |
| memberConsentRequired | Boolean |  |  |
| liquidityReserveBps | Int |  |  |
| payoutBufferBps | Int |  |  |
| insuranceReserveBps | Int |  |  |
| latePenaltyBps | Int | personal |  |
| depositCoverageBps | Int |  |  |
| expectedPaymentLeadDays | Int |  |  |
| custodyMode | CustodyMode |  |  |
| partnerId | String? |  |  |
| partner | PartnerBank? |  |  |
| payoutGuaranteed | Boolean |  |  |
| slotFeeBps | Int |  |  |
| tier | CommitteeTier |  |  |
| prizeDrawEnabled | Boolean |  |  |
| earlyFeeBps | Int |  |  |
| dividendPooled | Boolean |  |  |
| goalType | String? |  |  |
| goalName | String? | personal |  |
| goalTargetPaisa | BigInt? |  |  |
| cleanStreak | Int |  |  |
| floatSchemeId | String? |  |  |
| floatScheme | Scheme? |  |  |
| depositSchemeId | String? |  |  |
| depositScheme | Scheme? |  |  |
| statementBatches | StatementBatch[] | personal |  |
| members | CommitteeMember[] |  |  |
| rounds | Round[] |  |  |
| ledgerEntries | LedgerEntry[] |  |  |
| investments | Investment[] |  |  |
| exchangeListings | ExchangeListing[] |  |  |
| chatMessages | ChatMessage[] |  |  |
| chatReads | ChatRead[] |  |  |
| creditEvents | CreditEvent[] |  |  |
| scheduleRequests | ScheduleChangeRequest[] |  |  |
| riskAssessments | RiskAssessment[] |  |  |
| riskConsents | RiskConsent[] |  |  |
| payoutHoldbacks | PayoutHoldback[] |  |  |
| recoveryCases | RecoveryCase[] |  |  |
| waitlist | CommitteeWaitlist[] |  |  |
| agreementSignatures | AgreementSignature[] |  |  |
| exitRequests | ExitRequest[] |  |  |
| goldGoalGrams | Float? |  | Gold-goal circles: the host sets the target in grams rather than rupees. Contributions are still rupees; the app sizes them to the gram target at the live price and settles at SPOT on payout day. Nothing is deferred, so it stays clear of the bay al-sarf problem that a price lock creates. |
| exposureScore | Float |  | Latest computed exposure score (lib/exposure-score.ts), cached for display and for the automatic band actions. Recomputed on every settlement. |
| exposureBand | String |  |  |
| exposureAt | DateTime? |  |  |

## CommitteeMember

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| userId | String |  |  |
| user | User |  |  |
| turnPosition | Int |  |  |
| hasReceived | Boolean |  |  |
| status | MemberStatus |  |  |
| paidPrincipalPaisa | BigInt |  |  |
| joinedAt | DateTime |  |  |
| exitedAt | DateTime? |  |  |
| autoDebitEnabled | Boolean |  | Standing auto-debit mandate (auto-collect). The member's own consent to have each due installment collected automatically on the deadline. The mandate lives in the app (software consent); execution routes through the provider layer — sandbox settles instantly, a live rail pulls via the aggregator. Halqa never holds the money; it only schedules the pull. |
| autoDebitRail | String? |  |  |
| autoDebitMandateAt | DateTime? |  |  |
| securityDeposits | SecurityDeposit[] |  |  |
| protectionCommitment | ProtectionCommitment? |  |  |
| payoutHoldbacks | PayoutHoldback[] |  |  |

## CommitteeWaitlist

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| userId | String |  |  |
| user | User |  |  |
| preferredPosition | Int? |  |  |
| status | String |  |  |
| createdAt | DateTime |  |  |

## CreditEvent

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String |  |  |
| user | User |  |  |
| committeeId | String? |  |  |
| committee | Committee? |  |  |
| roundId | String? |  |  |
| round | Round? |  |  |
| checkpoint | String |  |  |
| delta | Int |  |  |
| reason | String |  |  |
| scoredAt | DateTime |  |  |

## ExchangeBid

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| listingId | String |  |  |
| listing | ExchangeListing |  |  |
| bidderId | String |  |  |
| bidder | User |  |  |
| premiumPaisa | BigInt |  |  |
| status | ListingStatus |  |  |
| createdAt | DateTime |  |  |

## ExchangeListing

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| sellerId | String |  |  |
| seller | User |  |  |
| position | Int |  |  |
| payoutPaisa | BigInt |  |  |
| premiumPaisa | BigInt |  |  |
| buyerId | String? |  |  |
| buyer | User? |  |  |
| status | ListingStatus |  |  |
| listedAt | DateTime |  |  |
| acceptedAt | DateTime? |  |  |
| bids | ExchangeBid[] |  |  |

## ExitRequest

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| memberId | String |  |  |
| userId | String |  |  |
| user | User |  |  |
| rung | ExitRung |  |  |
| status | ExitStatus |  |  |
| reason | String? |  |  |
| voiceNoteUrl | String? |  | Voice note option: only about a third of this population reads a text message, so a recorded reason must be as valid as a typed one. |
| installmentsPaid | Int |  |  |
| restitutionDuePaisa | BigInt |  | Restitution computed at approval and settled at cycle close. Held here so the figure a member was promised is the figure they are paid. |
| finePaisa | BigInt |  |  |
| fineToMembersPaisa | BigInt |  |  |
| fineToPlatformPaisa | BigInt | personal |  |
| substituteUserId | String? |  |  |
| votesFor | Int |  |  |
| votesAgainst | Int |  |  |
| quorumMet | Boolean |  |  |
| closesAt | DateTime? |  |  |
| decidedAt | DateTime? |  |  |
| settledAt | DateTime? |  |  |
| createdAt | DateTime |  |  |
| votes | ExitVote[] |  |  |
| debts | RestitutionDebt[] |  |  |

## ExitVote

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| requestId | String |  |  |
| request | ExitRequest |  |  |
| userId | String |  |  |
| user | User |  |  |
| approve | Boolean |  |  |
| createdAt | DateTime |  |  |

## Investment

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| roundId | String? |  |  |
| round | Round? |  |  |
| schemeId | String |  |  |
| scheme | Scheme |  |  |
| principalPaisa | BigInt |  |  |
| ratePctAtDeploy | Float |  |  |
| status | InvestmentStatus |  |  |
| deployedAt | DateTime |  |  |
| liquidatedAt | DateTime? |  |  |
| realizedProfitPaisa | BigInt? |  |  |

## KycRecord

Retention: Ten years after the account closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String | unique |  |
| user | User |  |  |
| cnicNumber | String | personal |  |
| cnicFrontUrl | String | personal |  |
| cnicBackUrl | String | personal |  |
| selfieUrl | String |  |  |
| faceMatchScore | Float? |  |  |
| ocrName | String? | personal |  |
| status | KycStatus |  |  |
| verifiedAt | DateTime? |  |  |

## LedgerEntry

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String? |  |  |
| committee | Committee? |  |  |
| actorId | String? |  |  |
| actor | User? |  |  |
| debit | String |  |  |
| credit | String |  |  |
| amountPaisa | BigInt |  |  |
| reason | String |  |  |
| refType | String |  |  |
| refId | String |  |  |
| idempotencyKey | String | unique |  |
| createdAt | DateTime |  |  |

## Notification

Retention: Two years.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String |  |  |
| user | User |  |  |
| type | String |  |  |
| message | String |  |  |
| isRead | Boolean |  |  |
| createdAt | DateTime |  |  |

## PartnerBank

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| name | String | personal |  |
| shortCode | String | unique |  |
| custodyEnabled | Boolean |  |  |
| kycEnabled | Boolean |  |  |
| raastEnabled | Boolean |  |  |
| sandbox | Boolean |  |  |
| isActive | Boolean |  |  |
| createdAt | DateTime |  |  |
| committees | Committee[] |  |  |
| statementBatches | StatementBatch[] | personal |  |

## Payment

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| roundId | String |  |  |
| round | Round |  |  |
| payerId | String |  |  |
| payer | User |  |  |
| amountPaisa | BigInt |  |  |
| dueDate | DateTime |  |  |
| status | PaymentStatus |  |  |
| paidVia | String? |  |  |
| txnRef | String? |  |  |
| paidAt | DateTime? |  |  |
| createdAt | DateTime |  |  |
| penaltyPaisa | BigInt |  |  |
| reminderLevel | Int |  |  |
| recoveryCase | RecoveryCase? |  |  |

## PaymentAttempt

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String |  |  |
| user | User |  |  |
| paymentId | String? |  |  |
| rail | String |  |  |
| calendarDay | Int |  |  |
| outcome | String |  |  |
| source | String |  |  |
| amountPaisa | BigInt |  |  |
| attemptedAt | DateTime |  |  |

## PayoutHoldback

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| membershipId | String |  |  |
| membership | CommitteeMember | personal |  |
| roundId | String | unique |  |
| round | Round |  |  |
| amountPaisa | BigInt |  |  |
| requiredCleanPayments | Int |  |  |
| cleanPayments | Int |  |  |
| status | HoldbackStatus |  |  |
| createdAt | DateTime |  |  |
| releasedAt | DateTime? |  |  |

## PayslipUpload

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String |  |  |
| user | User |  |  |
| image | Bytes |  |  |
| mime | String |  |  |
| sha256 | String |  |  |
| sizeBytes | Int |  |  |
| status | String |  |  |
| uploadedAt | DateTime |  |  |
| reviewedAt | DateTime? |  |  |

## ProtectionCommitment

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| membershipId | String | unique |  |
| membership | CommitteeMember | personal |  |
| guarantorUserId | String? | personal |  |
| guarantor | User? | personal |  |
| promissoryRef | String? |  |  |
| autoDebitRef | String? |  |  |
| acceptedTermsAt | DateTime? |  |  |
| verifiedByHostAt | DateTime? |  |  |
| createdAt | DateTime |  |  |
| updatedAt | DateTime |  |  |

## RecoveryCase

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String |  |  |
| user | User |  |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| roundId | String |  |  |
| round | Round |  |  |
| paymentId | String | unique |  |
| payment | Payment |  |  |
| outstandingPaisa | BigInt |  |  |
| penaltyPaisa | BigInt |  |  |
| status | RecoveryStatus |  |  |
| openedAt | DateTime |  |  |
| resolvedAt | DateTime? |  |  |

## RefreshToken

Retention: Until it expires, then thirty days.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| tokenHash | String | SECRET, unique |  |
| userId | String |  |  |
| user | User |  |  |
| familyId | String |  |  |
| revokedAt | DateTime? |  |  |
| expiresAt | DateTime |  |  |
| createdAt | DateTime |  |  |

## RestitutionDebt

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| requestId | String |  |  |
| request | ExitRequest |  |  |
| debtorUserId | String |  |  |
| roundNumber | Int |  |  |
| amountPaisa | BigInt |  |  |
| settledAt | DateTime? |  |  |
| createdAt | DateTime |  |  |

## RewardEvent

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String |  |  |
| user | User |  |  |
| committeeId | String? |  |  |
| roundId | String? |  |  |
| kind | RewardKind |  |  |
| points | Int |  |  |
| scoreDelta | Int |  |  |
| streakAfter | Int |  |  |
| multiplier | Float |  |  |
| reason | String |  |  |
| createdAt | DateTime |  |  |

## RiskAssessment

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| modelVersion | String |  |  |
| score | Int |  |  |
| band | RiskBand |  |  |
| investmentRisk | Int |  |  |
| defaultRisk | Int |  |  |
| liquidityRisk | Int |  |  |
| concentrationRisk | Int |  |  |
| controlStrength | Int |  |  |
| expectedLossBps | Int |  |  |
| coverageRatioBps | Int |  |  |
| factorsJson | Json |  |  |
| recommendationsJson | Json |  |  |
| assessedAt | DateTime |  |  |

## RiskConsent

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| userId | String |  |  |
| user | User |  |  |
| modelVersion | String |  |  |
| riskScore | Int |  |  |
| policyHash | String |  |  |
| status | RiskConsentStatus |  |  |
| acceptedAt | DateTime? |  |  |
| createdAt | DateTime |  |  |

## Round

Retention: Ten years after the circle closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| roundNumber | Int |  |  |
| recipientId | String |  |  |
| recipient | User |  |  |
| status | RoundStatus |  |  |
| dueDate | DateTime |  |  |
| payoutDate | DateTime |  |  |
| graceDays | Int |  |  |
| grossPoolPaisa | BigInt |  |  |
| reinvestPaisa | BigInt |  |  |
| payoutPaisa | BigInt |  |  |
| payments | Payment[] |  |  |
| investments | Investment[] |  |  |
| creditEvents | CreditEvent[] |  |  |
| payoutHoldback | PayoutHoldback? |  |  |
| recoveryCases | RecoveryCase[] |  |  |

## SalarySignal

Retention: Two years.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| userId | String |  |  |
| user | User |  |  |
| dayOfMonth | Int |  |  |
| amountBand | String |  |  |
| sourceClass | String |  |  |
| observedMonth | String |  |  |
| createdAt | DateTime |  |  |

## ScheduleChangeRequest

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| requestedById | String |  |  |
| requestedBy | User |  |  |
| payloadJson | Json |  |  |
| status | ChangeStatus |  |  |
| reviewedById | String? |  |  |
| reviewedBy | User? |  |  |
| reviewedAt | DateTime? |  |  |

## Scheme

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| name | String | personal |  |
| slug | String | unique |  |
| category | String |  |  |
| riskLevel | String |  |  |
| issuer | String |  |  |
| tenorDays | Int |  |  |
| indicativeRatePct | Float |  |  |
| minAmountPaisa | BigInt |  |  |
| shariahCompliant | Boolean |  |  |
| isActive | Boolean |  |  |
| rateAsOf | DateTime |  |  |
| sourceUrl | String |  |  |
| riskScore | Int |  |  |
| liquidityDays | Int |  |  |
| volatilityBps | Int | personal |  |
| creditRiskBps | Int |  |  |
| regulatoryStatus | String | personal |  |
| eligibilityNotes | String? |  |  |
| committees | Committee[] |  |  |
| floatCommittees | Committee[] |  |  |
| depositCommittees | Committee[] |  |  |
| investments | Investment[] |  |  |

## SecurityDeposit

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| membershipId | String |  |  |
| membership | CommitteeMember | personal |  |
| amountPaisa | BigInt |  |  |
| status | DepositStatus |  |  |
| txnRef | String? |  |  |
| confirmedAt | DateTime? |  |  |
| createdAt | DateTime |  |  |
| releasedAt | DateTime? |  |  |
| accruedYieldPaisa | BigInt |  |  |

## SecurityEvent

Retention: Two years.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| type | String |  |  |
| userId | String? |  |  |
| identity | String? |  |  |
| ip | String? | personal |  |
| userAgent | String? |  |  |
| detail | String? |  |  |
| createdAt | DateTime |  |  |

## StatementBatch

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| partnerId | String |  |  |
| partner | PartnerBank |  |  |
| committeeId | String |  |  |
| committee | Committee |  |  |
| importedById | String |  |  |
| totalLines | Int |  |  |
| matchedLines | Int |  |  |
| createdAt | DateTime |  |  |
| lines | StatementLine[] |  |  |

## StatementLine

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| batchId | String |  |  |
| batch | StatementBatch |  |  |
| lineRef | String |  |  |
| amountPaisa | BigInt |  |  |
| narration | String |  |  |
| postedAt | DateTime |  |  |
| matchedPaymentId | String? | unique |  |
| status | StatementLineStatus |  |  |

## SupportMessage

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| ticketId | String |  |  |
| ticket | SupportTicket |  |  |
| author | String |  | MEMBER or HALQA |
| body | String |  |  |
| createdAt | DateTime |  |  |

## SupportTicket

Retention: To be set with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| reference | String | unique |  |
| userId | String |  |  |
| user | User |  |  |
| category | String |  | QUESTION, PAYMENT, PAYOUT, ACCOUNT, CIRCLE, OTHER |
| subject | String |  |  |
| body | String |  |  |
| status | String |  | OPEN, ANSWERED, RESOLVED, CLOSED |
| paymentId | String? |  | Set when the ticket disputes one recorded payment. |
| committeeId | String? |  |  |
| messages | SupportMessage[] |  |  |
| createdAt | DateTime |  |  |
| updatedAt | DateTime |  |  |

## User

Retention: Ten years after the account closes, with the bank.

| Field | Type | Holds | Meaning |
| :-- | :-- | :-- | :-- |
| id | String | key |  |
| fullName | String | personal |  |
| username | String | personal, unique |  |
| phone | String | personal, unique |  |
| email | String | personal, unique |  |
| cnic | String? | personal, unique |  |
| passwordHash | String | SECRET |  |
| dataConsent | Boolean |  |  |
| paymentMethodsJson | Json? |  | Linked payment methods (wallet / Raast / bank), stored as a small JSON array [{id,rail,accountNo,label,preferred}]. These are the member's OWN account identifiers for receiving and auto-debit — Halqa stores pointers, never balances, and never card numbers (cards only ever enter a licensed aggregator's hosted page, per the no-custody rule). |
| failedLogins | Int |  |  |
| lockUntil | DateTime? |  |  |
| creditScore | Int |  |  |
| role | Role |  |  |
| kycLevel | Int |  |  |
| kycStatus | KycStatus |  |  |
| isBanned | Boolean |  |  |
| banReason | String? |  |  |
| defaultFlag | Boolean |  |  |
| cooldownUntil | DateTime? |  |  |
| deviceId | String? | personal |  |
| bankVerifiedAt | DateTime? |  |  |
| bankVerifyRef | String? |  |  |
| salaryAccountLinked | Boolean | personal | Salary-linked account: the member marks one linked method as the account their salary lands in. Auto-collection from a salary account is the most certain collection there is (Money Fellows model), so it earns a disclosed 20% reduction on early/slot fees at payout. |
| salaryAccountRef | String? | personal |  |
| salaryDay | Int? | personal | Salary-day verification (2026-07-31). salaryDay = the payday the member declares; salaryDayLearned = the day our own collection outcomes prove (lib/salary-pattern.ts). Verification is earned, never self-asserted: PAYSLIP (document), PATTERN (>=2 months of first-success-of-month within tolerance), or ALERTS (on-device credit-alert summaries, aggregates only). A declared day the pattern contradicts mid-cycle clears the verification, costs the salary fee discount and a recorded score event. |
| salaryDayLearned | Int? | personal |  |
| salaryVerifiedAt | DateTime? | personal |  |
| salaryVerifyMethod | String? | personal |  |
| paymentAttempts | PaymentAttempt[] |  |  |
| salarySignals | SalarySignal[] | personal |  |
| payslipUploads | PayslipUpload[] | personal |  |
| pinHash | String? | SECRET | App-open PIN (4-6 digits): set at signup, asked on every open even inside a valid session. Hashed (sha256+salt via lib/pin), never stored in the clear. |
| phoneVerified | Boolean | personal | Phone ownership: a 6-digit OTP confirms the number at signup (WhatsApp rail in sandbox). Real once the messaging provider connects. |
| addressLine | String? | personal | KYC / underwriting profile captured at signup — address, city, and what the member does for a living (drives future risk models + partner KYC handoff). |
| city | String? | personal |  |
| locality | String? |  | Broad area within the city (sector/colony, e.g. "G-13", "DHA Phase 2") — shown to other members after the city as a light trust signal (never the house number). jobTitle = the member's profession shown publicly (NOT the employer); for a housewife it holds the husband's job. |
| occupationType | String? | personal |  |
| employerName | String? | personal |  |
| jobTitle | String? |  |  |
| homeLat | Float? | personal | Live home location captured at signup (device GPS). Stored as coordinates — the member must set their real home; we reverse-geocode it to the address. |
| homeLng | Float? | personal |  |
| homeLocationAt | DateTime? | personal |  |
| committeesCompletedClean | Int |  | Tenure quarantine: new members may only take the LAST turns of any circle, regardless of score, until they complete `committeesCompletedClean` >= 2 circles cleanly AND are manually verified (earlyTurnVerifiedAt set). Then early turns unlock. Turn position is the collateral in the no-deposit model. |
| earlyTurnVerifiedAt | DateTime? |  |  |
| incomeVerifiedAt | DateTime? | personal | Verification discounts on Halqa's service charges (take the largest that applies): income slip + employer confirmed = 80%; a physical guarantee cheque collected (enables the 489-F criminal route) = 95%. Salary link = 20%. |
| chequeSecuredAt | DateTime? |  |  |
| declaredIncomePaisa | BigInt? | personal | What the member says they earn each month, in paisa, taken at signup. Affordability cannot size a committee without it: with nothing on file the engine has to assume zero and refuse everybody, which is what it was doing. Declared, not proved — incomeVerifiedAt above is what proves it. |
| declaredIncomeAt | DateTime? | personal |  |
| biometricCredId | String? |  | Optional biometric unlock (WebAuthn platform authenticator) alongside the app PIN. Stores the credential id only; the private key never leaves the device. CNIC photo captured at signup (camera scan) — flag only for now. |
| cnicCaptured | Boolean | personal |  |
| vaultParkingEnabled | Boolean |  |  |
| vaultTier | String |  |  |
| vaultAutoCover | Boolean |  |  |
| vaultAllocation | String | personal |  |
| vaultGoalPaisa | BigInt? |  | What the member is saving towards. A vault with no purpose is a number on a screen; a vault with a target is a plan, and the progress bar is the whole reason somebody opens the screen twice. |
| vaultGoalName | String? | personal |  |
| supportTickets | SupportTicket[] |  |  |
| referredById | String? |  |  |
| referredBy | User? |  |  |
| referrals | User[] |  |  |
| paymentStreak | Int |  |  |
| longestStreak | Int |  | Longest clean run ever achieved. paymentStreak resets on a miss; this does not, so the ladder can still show what a member has already proved. |
| rewardPoints | Int |  | Loyalty points. Strictly separate from creditScore: points buy partner discounts, score gates positions. Points never buy score and score is never sold (lib/rewards.ts). Never redeemable for cash — a cash-redeemable balance is a stored-value instrument and therefore regulated activity. |
| scoreGainedThisCycle | Int |  | Score gained from on-time payments in the current cycle, against the per-cycle cap that stops the score being farmed with tiny circles. |
| avatarUrl | String? | personal | --- Personalisation. A committee is a personal arrangement between people who mostly know each other; an app that looks like a bank statement gets opened once. None of this touches verification: displayName is what other members see, fullName stays the legal name matched against the CNIC. |
| displayName | String? | personal |  |
| accentColor | String |  |  |
| themePref | String |  |  |
| langPref | String |  |  |
| textScale | Int |  |  |
| highContrast | Boolean |  |  |
| notifyPrefsJson | Json? |  | Per-channel notification preferences {push,whatsapp,email,quietFrom,quietTo}. A reminder that arrives at two in the morning is not a reminder, it is a reason to turn notifications off entirely. |
| rewardEvents | RewardEvent[] |  |  |
| exitRequests | ExitRequest[] |  |  |
| exitVotes | ExitVote[] |  |  |
| averageRating | Float |  |  |
| ratingCount | Int |  |  |
| createdAt | DateTime |  |  |
| hostedCommittees | Committee[] |  |  |
| memberships | CommitteeMember[] |  |  |
| receivedRounds | Round[] |  |  |
| payments | Payment[] |  |  |
| creditEvents | CreditEvent[] |  |  |
| notifications | Notification[] |  |  |
| chatMessages | ChatMessage[] |  |  |
| chatReads | ChatRead[] |  |  |
| sellListings | ExchangeListing[] |  |  |
| buyListings | ExchangeListing[] |  |  |
| ledgerEntries | LedgerEntry[] |  |  |
| kyc | KycRecord? |  |  |
| refreshTokens | RefreshToken[] |  |  |
| scheduleRequests | ScheduleChangeRequest[] |  |  |
| reviewedScheduleRequests | ScheduleChangeRequest[] |  |  |
| riskConsents | RiskConsent[] |  |  |
| bids | ExchangeBid[] |  |  |
| guaranteesGiven | ProtectionCommitment[] |  |  |
| recoveryCases | RecoveryCase[] |  |  |
| committeeWaitlists | CommitteeWaitlist[] |  |  |
| agreementSignatures | AgreementSignature[] |  |  |
