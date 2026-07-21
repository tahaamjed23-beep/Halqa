// Halqa legal corpus. Shown from the signup screen (acceptance recorded
// server-side as TOS_ACCEPTED with TERMS_VERSION) and from Settings → Legal.
// Drafted in the structure large platforms use (LinkedIn/PayPal-style numbered
// agreements). NOTE FOR THE RECORD: engineering drafts — route through
// Pakistani counsel before any paid marketing push.

export const TERMS_VERSION = '1.0-2026-07-20';

export type DocId = 'agreement' | 'privacy' | 'cookies' | 'ads' | 'community' | 'fees';

export interface LegalDoc { title: string; updated: string; intro: string; sections: { h: string; p: string[] }[] }

export const LEGAL_DOCS: Record<DocId, LegalDoc> = {
  agreement: {
    title: 'Halqa User Agreement',
    updated: 'Effective 20 July 2026 · Version 1.0',
    intro: 'This User Agreement ("Agreement") is a binding contract between you and Halqa ("Halqa", "we", "us", "our") governing your use of the Halqa applications, websites, and services (together, the "Services"). By creating an account, ticking the acceptance box, or using the Services, you accept this Agreement, the Privacy Policy, the Cookie Policy, the Community Policies, and the Fees & Payments Policy, each incorporated by reference. If you do not agree, do not use the Services.',
    sections: [
      { h: '1. The Services; what Halqa is and is not', p: [
        '1.1. Halqa provides digital record-keeping, scheduling, communication, and reputation tools for rotating savings groups known as committees, kametis, or ROSCAs ("Circles").',
        '1.2. Halqa is not a bank, deposit-taking institution, electronic money institution, investment adviser, or lender, and does not hold, pool, custody, or control member funds. Contributions and payouts move directly between members over payment channels of their choosing; Halqa records those movements as entries in a ledger.',
        '1.3. A Circle is a private arrangement between its members. Halqa is not a party to any Circle, does not guarantee any payment, payout, or performance by any member, and owes you no fiduciary duty. The decision to join a Circle with any particular person is yours alone.',
        '1.4. Any figures described as indicative, estimated, or projected anywhere in the Services are illustrations, not promises, offers, or guarantees of any return.' ] },
      { h: '2. Eligibility and your account', p: [
        '2.1. You must be at least 18 years of age, resident in Pakistan or otherwise legally able to contract, and capable of forming a binding agreement.',
        '2.2. You must register with true, current, and complete information — including your legal name, an active Pakistani mobile number, an email address, and, where requested, your CNIC number — and keep it updated. Impersonation, fictitious identities, and accounts opened on behalf of undisclosed third parties are prohibited.',
        '2.3. You are responsible for safeguarding your credentials and for all activity under your account. Notify us immediately of any suspected unauthorised use. We may suspend an account to protect you, other members, or the Services.',
        '2.4. One natural person, one account. We may refuse, suspend, or terminate duplicate or fraudulent accounts.' ] },
      { h: '3. Your obligations in a Circle', p: [
        '3.1. When you join a Circle you commit to its disclosed schedule: paying each contribution in full, on or before its due date, for every round, including all rounds after you have collected your own payout.',
        '3.2. The schedule, contribution amount, turn order, fees, and policies of a Circle are disclosed before you confirm joining. Confirming constitutes your electronic agreement to those terms under the Electronic Transactions Ordinance, 2002.',
        '3.3. Missing a contribution is a breach of your commitment to the other members. You acknowledge that Halqa records such breaches, applies the disclosed late adjustments, adjusts your reliability score, may restrict features, and may make the record available as evidence to affected members pursuing lawful recovery.',
        '3.4. Hosting a Circle is a position of trust. Hosts must disclose settings honestly, must not manipulate turn order outside the disclosed mechanism, and must not collect any undisclosed consideration from members.' ] },
      { h: '4. Records as evidence', p: [
        '4.1. You agree that the ledger entries, timestamps, acceptance logs, and communications recorded by the Services are business records generated in the ordinary course, and you consent to their use as evidence in any dispute, recovery action, or legal proceeding arising from a Circle, to the extent permitted by the Qanun-e-Shahadat Order, 1984 and the Electronic Transactions Ordinance, 2002.' ] },
      { h: '5. Fees', p: [
        '5.1. Core membership is currently free. Fees Halqa does charge — including late adjustments and management fees on Halqa-supported slots — are set out in the Fees & Payments Policy and disclosed in-product before you incur them.',
        '5.2. We may introduce or change fees prospectively with notice; continued use after the effective date constitutes acceptance.' ] },
      { h: '6. Prohibited conduct', p: [
        '6.1. You must not use the Services to launder money, finance terrorism, evade tax, or violate any law, including the Anti-Money Laundering Act, 2010.',
        '6.2. You must not defraud, harass, or threaten members; scrape or reverse-engineer the Services; interfere with their operation; submit false payment references; trade, sell, or rent your account; or use another member\'s identity documents.',
        '6.3. We may investigate suspected violations and may suspend, limit, or terminate access, withhold reputation artifacts, and report to authorities where required by law.' ] },
      { h: '7. Intellectual property', p: [
        '7.1. The Services, including software, design, text, marks, and the name "Halqa", are our property or licensed to us. We grant you a limited, revocable, non-exclusive, non-transferable licence to use the applications for personal, non-commercial participation in Circles.',
        '7.2. You retain rights to content you submit but grant us a worldwide, royalty-free licence to host, store, reproduce, and display it as needed to operate the Services.' ] },
      { h: '8. Disclaimers', p: [
        '8.1. THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
        '8.2. WITHOUT LIMITING SECTION 1, HALQA DOES NOT WARRANT THAT ANY MEMBER WILL PAY, THAT ANY CIRCLE WILL COMPLETE, THAT SCORES PREDICT BEHAVIOUR, OR THAT THE SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE.',
        '8.3. Nothing in the Services constitutes financial, investment, legal, tax, or Shariah advice. Statements that a feature has or has not been Shariah-reviewed are descriptions of our process, not religious rulings.' ] },
      { h: '9. Limitation of liability', p: [
        '9.1. TO THE MAXIMUM EXTENT PERMITTED BY LAW, HALQA AND ITS OFFICERS, EMPLOYEES, AND AGENTS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF FUNDS ARISING FROM THE ACT OR OMISSION OF ANY MEMBER OF A CIRCLE, INCLUDING NON-PAYMENT OR DEFAULT.',
        '9.2. OUR AGGREGATE LIABILITY FOR ALL CLAIMS IN ANY TWELVE-MONTH PERIOD SHALL NOT EXCEED THE GREATER OF (A) THE FEES YOU PAID HALQA IN THAT PERIOD, OR (B) TEN THOUSAND PAKISTANI RUPEES (PKR 10,000).',
        '9.3. Some jurisdictions do not allow certain exclusions; where prohibited, the exclusion applies to the fullest extent permitted.' ] },
      { h: '10. Indemnity', p: [
        '10.1. You will indemnify and hold Halqa harmless from claims, damages, and expenses (including reasonable legal fees) arising out of your breach of this Agreement, your Circles, your content, or your violation of law or third-party rights.' ] },
      { h: '11. Suspension and termination', p: [
        '11.1. You may close your account at any time from Settings, subject to first settling your obligations in active Circles.',
        '11.2. We may suspend or terminate your access for breach, legal risk, or extended inactivity. Sections 4, 8, 9, 10, 12, and 13 survive termination. Ledger records are retained as described in the Privacy Policy.' ] },
      { h: '12. Governing law and dispute resolution', p: [
        '12.1. This Agreement is governed by the laws of the Islamic Republic of Pakistan.',
        '12.2. Any dispute arising out of or relating to this Agreement or the Services shall first be raised with our support channel and, failing amicable resolution within 30 days, referred to binding arbitration in Islamabad under the Arbitration Act, 1940, by a sole arbitrator appointed by mutual consent. Courts in Islamabad shall have exclusive supervisory jurisdiction.',
        '12.3. You agree to bring claims only in your individual capacity, not as a claimant or class member in any purported class or representative proceeding, to the extent permitted by law.' ] },
      { h: '13. Amendments to this Agreement', p: [
        '13.1. We may amend this Agreement by posting a revised version with a new effective date; material changes will be notified in-product no fewer than seven (7) days before they take effect, except where a change is required by law or is necessary to address an urgent security matter, in which case it may take effect immediately.',
        '13.2. Continued use of the Services after the effective date of a revised Agreement constitutes acceptance of the revision. If you do not agree to a revision, your sole remedy is to stop using the Services and close your account in accordance with Section 11.',
        '13.3. No oral statement, marketing material, or customer-support communication modifies this Agreement. Only a written revision posted under this Section, or a written instrument signed by an authorised officer of Halqa, can amend it.' ] },
      { h: '14. Severability and waiver', p: [
        '14.1. If any provision of this Agreement is held by a court or arbitral tribunal of competent jurisdiction to be invalid, illegal, or unenforceable, that provision shall be enforced to the maximum extent permissible, and the validity, legality, and enforceability of the remaining provisions shall not in any way be affected or impaired.',
        '14.2. The parties shall replace any severed provision with a valid provision that most closely approximates the economic and practical intent of the severed provision.',
        '14.3. No failure or delay by Halqa in exercising any right, power, or remedy under this Agreement shall operate as a waiver of that right, power, or remedy, nor shall any single or partial exercise preclude any further exercise. A waiver is effective only if given in writing.' ] },
      { h: '15. Assignment', p: [
        '15.1. You may not assign, delegate, or transfer this Agreement, or any of your rights or obligations under it, in whole or in part, without our prior written consent; any attempted assignment in violation of this Section is void.',
        '15.2. Halqa may assign this Agreement, in whole or in part, without your consent to any affiliate, or in connection with any merger, acquisition, corporate reorganisation, or sale of all or substantially all of its assets, provided the assignee assumes Halqa’s obligations under this Agreement.' ] },
      { h: '16. Force majeure', p: [
        '16.1. Halqa shall not be liable for any failure or delay in performance to the extent caused by events beyond its reasonable control, including acts of God, flood, earthquake, epidemic, war, terrorism, civil unrest, labour disputes, governmental action, power or telecommunication failures, failures of payment schemes or banking infrastructure, or failures of third-party hosting providers.',
        '16.2. During a force majeure event, Halqa’s obligations are suspended to the extent affected; Halqa will use commercially reasonable efforts to resume performance and to preserve the integrity of the ledger and your records.' ] },
      { h: '17. Notices and communications', p: [
        '17.1. You consent to receive notices, disclosures, and communications from Halqa electronically — in-product, by push notification, by SMS or messaging service to your registered mobile number, or by email to your registered address — and agree that electronic delivery satisfies any legal requirement of written notice.',
        '17.2. Notices to Halqa must be sent through the in-product support channel or to the contact address published in the Help section, and are deemed received on the next business day.',
        '17.3. It is your responsibility to keep your contact details current; a notice delivered to the details on file is effective even if no longer monitored by you.' ] },
      { h: '18. Survival', p: [
        '18.1. Sections concerning records as evidence, fees accrued, intellectual property, disclaimers, limitation of liability, indemnity, governing law and dispute resolution, and this Section survive any suspension, termination, or closure of your account, together with any provision that by its nature should survive.',
        '18.2. Ledger entries, audit records, and acceptance records may be retained after account closure as described in the Privacy Policy, including where retention is required for legal, regulatory, or dispute-resolution purposes.' ] },
      { h: '19. Interpretation', p: [
        '19.1. Headings are for convenience only and do not affect interpretation. The words "including", "for example", and similar expressions are illustrative and do not limit the preceding words.',
        '19.2. This Agreement is drafted and executed in English; any translation is provided for convenience only and the English text prevails in the event of conflict.',
        '19.3. Nothing in this Agreement creates any partnership, joint venture, agency, employment, or franchise relationship between you and Halqa, or between Halqa and any Circle.' ] },
      { h: '20. Entire agreement', p: [
        '20.1. This Agreement, together with the Privacy Policy, Cookie Policy, Community Policies, Advertising & Ad Choices Policy, and Fees & Payments Policy, each as amended from time to time, constitutes the entire agreement between you and Halqa with respect to the Services and supersedes all prior or contemporaneous understandings, agreements, representations, and warranties, whether written or oral, with respect to the Services.' ] },
    ],
  },
  privacy: {
    title: 'Halqa Privacy Policy',
    updated: 'Effective 20 July 2026 · Version 1.0',
    intro: 'This Privacy Policy explains what data Halqa collects, why, who it is shared with, and the controls you have. It applies to all Services and is part of the User Agreement. We design for the Personal Data Protection framework of Pakistan and, where relevant, comparable international standards.',
    sections: [
      { h: '1. Data we collect', p: [
        '1.1. Identity data you provide: legal name, username, mobile number, email address, CNIC number, and, where you complete verification, identity-document details.',
        '1.2. Circle data generated by use: circles joined or hosted, turn positions, contribution schedules, payment records and references, late events, reliability score history, holdbacks, recovery cases, and messages sent in circle chat.',
        '1.3. Goal data you choose to give: the purpose you attach to a circle (for example Hajj, education fees, wedding, home).',
        '1.4. Technical data: device type, app version, IP address, timestamps, and security logs (sign-ins, failures, lockouts, acceptance events).',
        '1.5. We do not collect card numbers or wallet PINs; payments execute on the rails of licensed third-party providers.' ] },
      { h: '2. Why we process it (legal bases)', p: [
        '2.1. To perform our contract with you: operating circles, schedules, ledgers, scores, and support.',
        '2.2. Legitimate interests: securing the Services, preventing fraud and multi-accounting, enforcing the User Agreement, and producing records usable in dispute resolution.',
        '2.3. Consent: goal-intent sharing with commercial partners (Section 4) and marketing communications — each only with your separate, revocable opt-in.',
        '2.4. Legal obligations: responses to lawful orders of courts, regulators, and law-enforcement agencies of Pakistan.' ] },
      { h: '3. What other members see', p: [
        '3.1. Members of your circle see your name, username, reliability indicators, payment status within that circle, and messages you post there. Hosts see what they need to run the circle. Your CNIC number is never shown to other members; verification status (verified / not verified) is.' ] },
      { h: '4. Goal-intent sharing with partners — strictly opt-in', p: [
        '4.1. If, and only if, you switch on "Share my goal interest" in Settings → Data privacy, Halqa may inform relevant service providers (for example, licensed Hajj/Umrah tour operators, educational institutions, or retailers) that a consenting member is saving toward such a goal, together with your name, contact number, city, and goal category.',
        '4.2. We never share your CNIC, your ledger history, your score, your circle membership details, or your messages with commercial partners.',
        '4.3. You can withdraw this consent at any time in Settings; withdrawal stops future sharing immediately.',
        '4.4. Halqa may receive fees from partners for such introductions. This is disclosed here plainly: it is part of how a free app pays for itself.' ] },
      { h: '5. Sharing that is not marketing', p: [
        '5.1. Processors: hosting, database, and communications vendors bound by contract to process only on our instructions (currently including cloud infrastructure located in Singapore and the United States).',
        '5.2. Members in dispute: where a member defaults, affected members of that circle may receive the records of that circle needed to pursue lawful recovery.',
        '5.3. Authorities: where required by applicable law or valid legal process.',
        '5.4. Corporate events: a merger, acquisition, or asset sale, with notice to you.' ] },
      { h: '6. Security', p: [
        '6.1. Transport encryption (TLS) everywhere; encryption at rest on our databases; passwords stored only as salted adaptive hashes; role-limited access; append-only security and audit logs; rate-limited authentication with lockout.',
        '6.2. No system is perfectly secure. If a breach materially affecting you occurs, we will notify you and the relevant authority as the law requires.' ] },
      { h: '7. Retention', p: [
        '7.1. Account data: for the life of the account and 90 days after closure.',
        '7.2. Ledger, default, and recovery records: up to 10 years, because they are financial business records and evidence of obligations between members.',
        '7.3. Security logs: at least 12 months. Chat messages: while the circle record is retained.' ] },
      { h: '8. Your rights', p: [
        '8.1. Access and portability: request a copy of your data from Settings or support.',
        '8.2. Correction: fix inaccurate identity data in Settings.',
        '8.3. Deletion: request account deletion; we honour it except for records we must retain under Section 7 (which are then access-restricted).',
        '8.4. Consent withdrawal: every optional consent has an off switch in Settings that works.',
        '8.5. Complaint: contact support first; you may also approach the relevant data-protection authority.' ] },
      { h: '9. Children', p: [ '9.1. The Services are not directed to persons under 18 and we do not knowingly collect their data; such accounts are closed on discovery.' ] },
      { h: '10. Changes and contact', p: [
        '10.1. We will post changes here with a new effective date and notify you of material changes in-product.',
        '10.2. Contact: privacy@halqa.pk (or the in-app Help section).' ] },
    ],
  },
  cookies: {
    title: 'Halqa Cookie & Local Storage Policy',
    updated: 'Effective 20 July 2026 · Version 1.0',
    intro: 'This policy explains the small pieces of data Halqa stores on your device and why.',
    sections: [
      { h: '1. What we store', p: [
        '1.1. Strictly necessary storage: authentication tokens that keep you signed in, and security state that protects your account. The Services cannot work without these.',
        '1.2. Preference storage: your language (English/اردو), notification choices, and preferred payment rail — stored locally on your device.',
        '1.3. We do not run third-party advertising cookies or cross-site trackers in the applications.' ] },
      { h: '2. Your choices', p: [
        '2.1. Clearing your browser or app storage signs you out and resets preferences. Blocking strictly necessary storage prevents sign-in.',
        '2.2. If we ever introduce analytics or advertising storage, this policy will be updated first and consent requested where required.' ] },
    ],
  },
  ads: {
    title: 'Halqa Advertising & Ad Choices',
    updated: 'Effective 20 July 2026 · Version 1.0',
    intro: 'How commercial content works on Halqa, and the controls you hold.',
    sections: [
      { h: '1. Our model', p: [
        '1.1. Halqa membership is free. Instead of charging members, Halqa may earn from commercial partners who want to serve members that have opted in to goal-intent sharing (see Privacy Policy, Section 4), and from disclosed fees listed in the Fees & Payments Policy.',
        '1.2. We do not sell your ledger, your score, your CNIC, or your circle history to anyone. What a partner can receive is limited to: your name, contact number, city, and stated goal category — and only with your active consent.' ] },
      { h: '2. Ad choices', p: [
        '2.1. Settings → Advertising data lets you switch goal-intent sharing on or off at any time. Off means no partner receives anything about you, ever.',
        '2.2. Sponsored placements inside the app, if introduced, will be labelled "Sponsored".',
        '2.3. Marketing messages from Halqa itself require your separate opt-in and carry an unsubscribe path.' ] },
      { h: '3. Complaints', p: [ '3.1. If a partner contacts you improperly or after you opted out, report it in Help — we investigate every report and terminate partners who breach our data terms.' ] },
    ],
  },
  community: {
    title: 'Halqa Community Policies',
    updated: 'Effective 20 July 2026 · Version 1.0',
    intro: 'Circles run on trust. These rules keep the platform worthy of it.',
    sections: [
      { h: '1. Be who you say you are', p: [ '1.1. Real names, real numbers, one account. Verified identity ranks ahead of unverified in turn ordering — that is deliberate.' ] },
      { h: '2. Pay what you committed', p: [ '2.1. A committee is a promise to every other member. Pay on time, every round, including after your own payout. Late adjustments, score changes, and feature locks follow the disclosed schedule automatically.' ] },
      { h: '3. Host honestly', p: [ '3.1. Hosts disclose all settings before members join, run the order by the book, and never take undisclosed money. Host reputation is public and permanent.' ] },
      { h: '4. Respect the chat', p: [ '4.1. No harassment, hate, threats, spam, or scams. No sharing another member\'s personal data. Circle chat is recorded with the circle.' ] },
      { h: '5. No unlawful use', p: [ '5.1. No money laundering, tax evasion, gambling rings, or any unlawful scheme dressed as a committee. We cooperate with lawful authorities.' ] },
      { h: '6. Enforcement', p: [ '6.1. Depending on severity: warnings, feature locks, score penalties, listing restrictions, account suspension, or termination and referral to authorities. Appeals go through Help.' ] },
    ],
  },
  fees: {
    title: 'Halqa Fees & Payments Policy',
    updated: 'Effective 20 July 2026 · Version 1.0',
    intro: 'Every fee Halqa charges, in one place. If it is not listed here, we do not charge it.',
    sections: [
      { h: '1. Free', p: [ '1.1. Creating an account, creating a circle, joining a circle, paying, collecting, chat, reputation, and the Credit Passport are free.' ] },
      { h: '2. Late adjustments', p: [ '2.1. A contribution paid after its disclosed due window incurs a graduated late adjustment (currently 2%, 5%, or 10% of the installment by lateness tier), disclosed in the circle before you join. These adjustments are platform revenue and also deter the behaviour that breaks circles.' ] },
      { h: '3. Halqa-supported slots (management fee)', p: [ '3.1. Where a host chooses "Start full — Halqa fills the empty slots", Halqa supports the unfilled positions so the circle can begin on time. Circles using this support carry a higher management fee, disclosed on the start screen before the host confirms. Halqa-supported slots always take the last turn positions — member money is never exposed to them.' ] },
      { h: '4. Turn marketplace', p: [ '4.1. Selling a turn position is free to list. A disclosed service margin may be applied to completed premium trades; the current margin is shown on the listing screen before you confirm.' ] },
      { h: '5. Payment execution', p: [ '5.1. Payments run on third-party rails (Raast, bank transfer, licensed wallets). Those providers may charge their own fees under their own terms; Halqa does not control or receive them. In the current release, digital confirmations run in sandbox mode and are marked as such.' ] },
      { h: '6. Changes', p: [ '6.1. Fee changes apply prospectively with in-product notice and never retroactively to a circle already running.' ] },
    ],
  },
};
