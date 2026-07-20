# Ghost 04 — Production-grade security & infrastructure shell
*Unlock needed: investor budget. Code activation: ~1–2 days for the code items; infra is provisioning, not invention.*

## Already banked (the prototype ships with these — do not rebuild)
Bcrypt(12) · JWT with strong distinct secrets + boot-time validation · refresh rotation with family reuse-detection · per-account lockout + timing defense · password policy · append-only SecurityEvent audit trail · strict CSP/HSTS headers · CORS allowlist · layered rate limits · integer-paisa double-entry with idempotency keys · zod validation everywhere · secrets out of code. The `SECURITY_RELAXED` demo flag is deleted entirely at activation (not just off — removed).

## 1. 2FA / step-up authentication (the code centerpiece)
- **TOTP** (authenticator apps) primary + **SMS OTP** fallback (this market lives on feature phones; SMS via the MFB's SMS gateway or Twilio-class provider).
- Enforcement policy: mandatory for hosts and admins · step-up challenge (fresh OTP) on: payout release, vault sweep > Rs 25k, password/2FA change, new-device login, linked-account change. Members below thresholds: optional but nudged.
```prisma
model TwoFactor { userId String @id; totpSecretEncrypted String?; smsEnabled Boolean @default(false); backupCodesHash String[]; enrolledAt DateTime?; lastUsedAt DateTime? }
model TrustedDevice { id String @id @default(cuid()); userId String; fingerprintHash String; label String?; lastSeenAt DateTime; @@unique([userId, fingerprintHash]) }
```
Routes (flagged): `/api/2fa/enroll` (QR provisioning) · `/verify` · `/challenge` on step-up actions · backup codes (10, single-use, hashed). Recovery: SMS to registered number + 24h cooling delay on payout-affecting actions after a 2FA reset (the account-takeover chokepoint).

## 2. Secrets & keys
HashiCorp Vault or cloud KMS (AWS Secrets Manager class): JWT secrets, DB creds, provider HMACs, the AES key for LinkedAccount encryption. Rotation runbook quarterly; `.env` files cease to exist in production; app receives secrets at boot via injected env from the orchestrator.

## 3. Network & perimeter
Cloudflare (or equal) in front of everything: WAF managed rules, DDoS absorption, bot management, TLS 1.3 only, origin locked to Cloudflare IPs. API served from a private subnet; DB reachable only from app subnet; SSH by short-lived certificates, no standing keys.

## 4. Monitoring, alerting, SOC-lite
- Structured logs (already JSON) → centralized store (Grafana Loki/CloudWatch) with 13-month retention (eCIB audit horizon).
- Alerts: failed-login spikes, TOKEN_REUSE_REVOKED events, settlement failures, recon mismatches, 5xx rate, p95 latency, DB connections. Pager → founder + on-call engineer.
- Monthly review of SecurityEvent anomalies (the table exists; this is a calendar invite, not code).

## 5. Backups & disaster recovery
Postgres: WAL archiving + nightly full snapshot, cross-region copy, **RPO ≤ 5 min / RTO ≤ 4 h**, quarterly restore drill (a backup never restored is a rumour). Ledger export: weekly immutable (S3 object-lock) CSV of all ledger entries — the "even if everything burns" copy.

## 6. External validation (budget items)
Penetration test by a named firm before first real rupee (~$8–15k) · fix-and-retest cycle · annual repeat · a responsible-disclosure page. SOC 2-style controls documentation deferred to scale, but the audit-trail architecture already matches it.

## Activation checklist
- [ ] Delete SECURITY_RELAXED code path · enable 2FA enforcement policies · deploy TrustedDevice checks
- [ ] Vault/KMS provisioned, secrets migrated, old secrets rotated dead
- [ ] Cloudflare live, origin locked · staging + production environments split · CI deploy gates on the 283-check suite
- [ ] Log pipeline + alert rules + pager rota · backup jobs verified by an actual restore
- [ ] Pen test scheduled pre-launch; findings triaged to zero criticals
