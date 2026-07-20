# Demo population — accounts & circles (dev only)
*Seeded 2026-07-14 via `node tests/seed-demo.mjs` (idempotent — safe to re-run). Passwords are for the local demo database only.*

## Accounts (12)
| Username | Password | Name | Profile | Score | Vault |
|---|---|---|---|---|---|
| rukhsana.bibi | rukhsana1234 | Rukhsana Bibi | stitching business — host | 780 | Rs 45,000 |
| farzana.bibi | farzana1234 | Farzana Bibi | home food business — host | 745 | Rs 30,000 |
| shabana.teacher | shabana1234 | Shabana Parveen | school teacher — host | 730 | Rs 22,000 |
| yusuf.karyana | yusuf1234 | Yusuf Rehman | karyana shopkeeper — host | 720 | Rs 18,000 |
| nadia.parlor | nadia1234 | Nadia Aslam | beautician | 705 | Rs 12,000 |
| imran.tailor | imran1234 | Imran Qureshi | tailor | 690 | Rs 8,000 |
| bushra.stitch | bushra1234 | Bushra Malik | garments worker | 685 | Rs 6,000 |
| tahira.maid | tahira1234 | Tahira Khatoon | domestic worker | 670 | Rs 2,500 |
| danish.gig | danish1234 | Danish Ali | delivery rider | 660 | Rs 4,000 |
| akram.mechanic | akram1234 | Akram Shah | motorcycle mechanic | 655 | Rs 5,000 |
| javed.driver | javed1234 | Javed Iqbal | school-van driver | 640 | Rs 3,000 |
| saleem.rickshaw | saleem1234 | Saleem Ahmed | rickshaw driver | 615 | Rs 1,500 |

(Original demo users still work: taha / ahmed / sana / ayesha / bilal — password `halqa123`.)

## Wave 2 — upper-middle-class professionals (10)
| Username | Password | Name | Profile | Score | Vault |
|---|---|---|---|---|---|
| asim.banker | asim1234 | Asim Raza | bank operations manager — host | 760 | Rs 150,000 |
| hina.doctor | hina1234 | Dr Hina Siddiqui | general physician | 750 | Rs 120,000 |
| faisal.itexport | faisal1234 | Faisal Mirza | IT services exporter | 745 | Rs 130,000 |
| kamran.engineer | kamran1234 | Kamran Butt | site engineer | 740 | Rs 90,000 |
| sadia.lecturer | sadia1234 | Sadia Khan | college lecturer | 735 | Rs 70,000 |
| zoya.dentist | zoya1234 | Zoya Hassan | dentist | 730 | Rs 95,000 |
| omar.importer | omar1234 | Omar Farooqi | electronics importer — host | 725 | Rs 200,000 |
| rabia.boutique | rabia1234 | Rabia Ahmed | boutique owner | 720 | Rs 80,000 |
| mahnoor.pharma | mahnoor1234 | Mahnoor Javed | pharmaceutical rep | 715 | Rs 60,000 |
| bilal.estate | bilalE1234 | Bilal Chaudhry | property dealer | 705 | Rs 110,000 |

## Wave 2 — circles
| Circle | Host | Tier | Terms | Pot | State |
|---|---|---|---|---|---|
| Clifton Professionals Circle | asim.banker | Sigma 🟠 (10% pooled) | 20 × Rs 25,000 / 30d | **Rs 500,000** | ACTIVE — round 1, 8/20 paid |
| Gulberg Khandan Bazaar | omar.importer | Bazaar 🟢 | 10 × Rs 20,000 / 30d | Rs 200,000 | ACTIVE — round 1, 4/10 paid |
| Shaadi Bachat Circle 🎯 | rukhsana.bibi | Sukoon 🟢 · wedding goal | 20 × Rs 2,500 / 30d × 20 rounds (~20 months) | Rs 50,000 | ACTIVE — round 1, 9/20 paid |

Design note: contributions cap at Rs 25,000 so the first-circle newcomer rule (≤ Rs 25k/installment until one completed cycle) holds even in the Rs 500k flagship — big pots come from *more members*, not bigger installments. The Shaadi circle shows the other axis: small installments × many members × 20 months = how lower-income families actually build a wedding fund.

## Circles (4)
| Circle | Host | Tier | Terms | State |
|---|---|---|---|---|
| Gulshan Sisters Circle | rukhsana.bibi | Bazaar 🟢 | 8 × Rs 5,000 / 30d | ACTIVE — round 1, 5/8 paid |
| Liaquatabad Ustaad Kameti | farzana.bibi | Classic | 6 × Rs 3,000 / 30d | ACTIVE — round 1 fully paid (payout ready) |
| Korangi Traders Sigma | yusuf.karyana | Sigma 🟠 (10% fee, pooled) | 6 × Rs 8,000 / 30d | ACTIVE — round 1, 3/6 paid |
| Eid Bachat Circle | shabana.teacher | Sukoon 🟢 | Rs 2,000 / 30d, cap 10 | FORMING — 4 of 10 joined |

## Demo walk suggestions
- **Host view:** rukhsana.bibi — dashboard with a live circle, Protection tab coverage, Bank pack button.
- **Struggling member:** saleem.rickshaw (score 615, Rs 1,500 vault) — the lower-income lens.
- **Payout-ready moment:** farzana.bibi's Kameti — round fully recorded, release button live.
- **Conventional tier:** Korangi Traders Sigma — fee disclosure banner + not-Shariah-reviewed labels.
- **Join flow:** log in as danish.gig and join Eid Bachat with its invite code (visible to shabana.teacher).

## Security note
`SECURITY_RELAXED=true` is currently set in halqa-api/.env — lockout, password policy and replay-burning are OFF for demos (never possible in production; NODE_ENV guard). To re-arm: set it to `false` and restart the API.
