# Ghost 02 — KYC, account linkage & credit-bureau integration
*Unlock needed: SECP licence (KYC obligations attach to custody). Code activation: ~1 day.*

## KYC ladder (upgrades the existing kycLevel gates — no new gating logic needed)
| Level | Today (prototype) | Production meaning | Verification |
|---|---|---|---|
| 0 | registered | registered | phone OTP at signup |
| 1 | — | identity verified | **CNIC + NADRA verification** (biometric via partner MFB branch, or NADRA e-Sahulat/API), liveness selfie match |
| 2 | bank KYC (sandbox) | full financial KYC | Level 1 + linked bank account/wallet verified by Rs 1 penny-drop |

Feature gates (already enforced in code, thresholds become policy): join any circle = L0 · join > Rs 10k/installment or receive payouts to bank = L1 · host, vault > Rs 100k, or any custody-mode circle = L2.

## Schema (migration G2)
```prisma
model KycRecord { id String @id @default(cuid()); userId String @unique; cnicHash String @unique; cnicLast4 String; nadraRef String?; verifiedAt DateTime?; method String; livenessScore Float?; expiresAt DateTime? }
model LinkedAccount {
  id String @id @default(cuid()); userId String; kind LinkKind; institution String
  accountRefEncrypted String  // AES-256-GCM, key in the secrets vault — never plaintext, never logged
  titleFetched String?; pennyDropStatus String @default("PENDING"); isDefaultPayout Boolean @default(false)
  createdAt DateTime @default(now()); @@index([userId]) }
enum LinkKind { BANK_ACCOUNT WALLET }
```
CNIC stored as salted hash + last-4 only (dedupe + display without holding the identity number in queryable form).

## API surface (flagged)
- `POST /api/kyc/start` → returns NADRA/e-Sahulat session; `POST /api/kyc/webhook` → verified callback sets Level 1.
- `POST /api/accounts/link` (IBAN/wallet) → triggers penny-drop via MFB rail; `POST /api/accounts/confirm` (member confirms the Rs 1 narration code) → verified, payout-eligible.
- Payout route change: when STAGE=CUSTODY, `recipient.defaultPayoutAccount` is required before release.

## eCIB / credit-bureau reporting (the Passport's formal twin)
- **Phase 1 (shadow, 30 days):** generate the eCIB submission file monthly from ledger history; validate format; submit nothing.
- **Phase 2:** with SBP-registered status via the MFB partnership, report committee repayment performance monthly. Consent collected at L1 KYC ("my committee payment history may be reported to credit bureaus"). Positive-only reporting first (build files, not blacklists), delinquency reporting after legal review.
- The Credit Passport remains the member-owned, instantly-verifiable layer; eCIB is the institutional layer. Same ledger, two doors.

## Activation checklist
- [ ] NADRA verification agreement (direct or via MFB sponsorship) · e-Sahulat fallback for non-smartphone members
- [ ] Penny-drop capability confirmed on MFB rail; narration format agreed
- [ ] Migration G2; encryption key provisioned in vault (04); log-scrubber verified (no CNIC/IBAN in logs — test exists)
- [ ] Consent copy (Urdu + English) reviewed by counsel; eCIB shadow file validates against spec
- [ ] Existing L2 sandbox users migrated: flagged "re-verify by [date]" — nobody grandfathered into real custody
