# Halqa Sigma Prototype

Local Stage 1 record-only prototype for a Pakistani ROSCA/committee platform.

## Start

Double-click `START-HALQA.cmd`. It starts the private PostgreSQL instance, API, web app, and opens `http://localhost:4100`.

The API health endpoint is `http://localhost:4101/api/health`. Port 4101 is not the customer application.

## Demo accounts

Every seeded account uses password `halqa123`:

| Username | Name | Role / purpose | Score |
|---|---|---|---:|
| `taha` | Taha Kayani | Admin and eligible host | 780 |
| `ahmed` | Ahmed Khan | Active committee host | 735 |
| `sana` | Sana Butt | Member demo | 720 |
| `ayesha` | Ayesha Noor | Member demo | 748 |
| `bilal` | Bilal Raza | Member below host threshold | 688 |

Usernames and passwords are trimmed at login, so ` taha ` behaves as `taha` and ` halqa123 ` behaves as `halqa123`.

## Implemented prototype slice

- JWT authentication, rotating hashed refresh tokens, and bcrypt passwords.
- Administrator-approved hosting with score and capacity gates.
- Independent, manually configurable member count from 3 to 30.
- Circle creation, invite joining, schedule locking, installments, turns, and notifications.
- Stage 1 external-payment records with append-only ledger entries.
- Payment-, date-, and investment-gated payout advancement.
- Configurable risk mandates, scheme catalog, stress projections, and portfolio optimization.
- Host-controlled simulated investment; read-only member visibility.
- Persistent authenticated Socket.io circle chat.
- Same-circle future-turn marketplace.
- Responsive gold-and-ivory web interface.

## Stage 1 boundary

Halqa does not custody money, confirm external payments, execute investments, or claim legal NADRA verification. Those operations are records or simulations. Real custody, provider webhooks, production KYC, compliance approval, and app-store deployment require external providers and credentials.

## Project structure

- `halqa-api/` - Express, Prisma, PostgreSQL, and Socket.io
- `halqa-web/` - React, Vite, Tailwind, and Recharts
- `.data/postgres/` - isolated local PostgreSQL data
- `.tools/` - isolated Node.js and PostgreSQL binaries
- `docs/` - architecture and verification reports

See `docs/HALQA_ENGINEERING_REPORT_2026-07-06.md` for engineering status, verification evidence, and production blockers.
