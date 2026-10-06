# -*- coding: utf-8 -*-
"""Pass 9: what a bank's security and accessibility review asks for. The 24 controls of the OWASP Mobile Application
Security Verification Standard (MASVS v2.1), the 93 controls of ISO/IEC 27001:2022 Annex A as a statement of
applicability, card data scope, and the 50 success criteria of WCAG 2.2 at levels A and AA."""
from common import I, sub, section

MASVS = [
    ('MASVS-STORAGE-1', 'the application stores sensitive data securely: tokens, PIN material and CNIC images only in '
                        'the platform\'s secure storage, never in plain local storage'),
    ('MASVS-STORAGE-2', 'the application prevents leakage of sensitive data: no personal data in logs, screenshots of '
                        'the task switcher, backups or the clipboard'),
    ('MASVS-CRYPTO-1', 'current strong cryptography used as intended: no home made schemes, no weak hashes for PINs'),
    ('MASVS-CRYPTO-2', 'keys managed to best practice: generated in the platform key store, never in the code'),
    ('MASVS-AUTH-1', 'secure authentication and authorisation with the interface service: short lived tokens, '
                     'rotation, server side revocation'),
    ('MASVS-AUTH-2', 'local authentication done securely: biometric unlock bound to a key in the secure enclave'),
    ('MASVS-AUTH-3', 'sensitive operations secured with additional authentication: the transaction PIN'),
    ('MASVS-NETWORK-1', 'all network traffic secured to current practice: TLS 1.2 or later only'),
    ('MASVS-NETWORK-2', 'identity pinning for Halqa\'s own endpoints'),
    ('MASVS-PLATFORM-1', 'inter process communication used securely: deep links validated before acting'),
    ('MASVS-PLATFORM-2', 'web views used securely: no file access, no script bridges to untrusted content'),
    ('MASVS-PLATFORM-3', 'the user interface used securely: sensitive fields masked, overlays detected on payment '
                         'screens'),
    ('MASVS-CODE-1', 'an up to date platform version required'),
    ('MASVS-CODE-2', 'a mechanism to enforce updates for a critical fix'),
    ('MASVS-CODE-3', 'only components without known vulnerabilities'),
    ('MASVS-CODE-4', 'all untrusted input validated and sanitised, including deep link parameters and QR contents'),
    ('MASVS-RESILIENCE-1', 'the integrity of the platform validated: rooted and jailbroken devices detected'),
    ('MASVS-RESILIENCE-2', 'anti tampering: the application\'s own integrity checked'),
    ('MASVS-RESILIENCE-3', 'anti static analysis: code obfuscated in release builds'),
    ('MASVS-RESILIENCE-4', 'anti dynamic analysis: debuggers and hooking frameworks detected before financial actions'),
    ('MASVS-PRIVACY-1', 'access to sensitive data and resources minimised: camera only for capture, no contacts or '
                        'photos'),
    ('MASVS-PRIVACY-2', 'the member is not identified across services: no advertising identifiers'),
    ('MASVS-PRIVACY-3', 'transparency about data collection and use, in the application and the store listings'),
    ('MASVS-PRIVACY-4', 'the member controls their data: export, correction, consent withdrawal and deletion'),
]

ISO = {
    'Organisational': [
        '5.1 Policies for information security', '5.2 Information security roles and responsibilities',
        '5.3 Segregation of duties', '5.4 Management responsibilities', '5.5 Contact with authorities',
        '5.6 Contact with special interest groups', '5.7 Threat intelligence',
        '5.8 Information security in project management', '5.9 Inventory of information and other associated assets',
        '5.10 Acceptable use of information and other associated assets', '5.11 Return of assets',
        '5.12 Classification of information', '5.13 Labelling of information', '5.14 Information transfer',
        '5.15 Access control', '5.16 Identity management', '5.17 Authentication information', '5.18 Access rights',
        '5.19 Information security in supplier relationships',
        '5.20 Addressing information security within supplier agreements',
        '5.21 Managing information security in the ICT supply chain',
        '5.22 Monitoring, review and change management of supplier services',
        '5.23 Information security for use of cloud services',
        '5.24 Information security incident management planning and preparation',
        '5.25 Assessment and decision on information security events', '5.26 Response to information security incidents',
        '5.27 Learning from information security incidents', '5.28 Collection of evidence',
        '5.29 Information security during disruption', '5.30 ICT readiness for business continuity',
        '5.31 Legal, statutory, regulatory and contractual requirements', '5.32 Intellectual property rights',
        '5.33 Protection of records', '5.34 Privacy and protection of personal information',
        '5.35 Independent review of information security',
        '5.36 Compliance with policies, rules and standards for information security',
        '5.37 Documented operating procedures'],
    'People': [
        '6.1 Screening', '6.2 Terms and conditions of employment',
        '6.3 Information security awareness, education and training', '6.4 Disciplinary process',
        '6.5 Responsibilities after termination or change of employment', '6.6 Confidentiality or non disclosure '
                                                                            'agreements',
        '6.7 Remote working', '6.8 Information security event reporting'],
    'Physical': [
        '7.1 Physical security perimeters', '7.2 Physical entry', '7.3 Securing offices, rooms and facilities',
        '7.4 Physical security monitoring', '7.5 Protecting against physical and environmental threats',
        '7.6 Working in secure areas', '7.7 Clear desk and clear screen', '7.8 Equipment siting and protection',
        '7.9 Security of assets off premises', '7.10 Storage media', '7.11 Supporting utilities', '7.12 Cabling security',
        '7.13 Equipment maintenance', '7.14 Secure disposal or re use of equipment'],
    'Technological': [
        '8.1 User endpoint devices', '8.2 Privileged access rights', '8.3 Information access restriction',
        '8.4 Access to source code', '8.5 Secure authentication', '8.6 Capacity management',
        '8.7 Protection against malware', '8.8 Management of technical vulnerabilities', '8.9 Configuration management',
        '8.10 Information deletion', '8.11 Data masking', '8.12 Data leakage prevention', '8.13 Information backup',
        '8.14 Redundancy of information processing facilities', '8.15 Logging', '8.16 Monitoring activities',
        '8.17 Clock synchronisation', '8.18 Use of privileged utility programs',
        '8.19 Installation of software on operational systems', '8.20 Networks security', '8.21 Security of network '
                                                                                            'services',
        '8.22 Segregation of networks', '8.23 Web filtering', '8.24 Use of cryptography', '8.25 Secure development life '
                                                                                          'cycle',
        '8.26 Application security requirements', '8.27 Secure system architecture and engineering principles',
        '8.28 Secure coding', '8.29 Security testing in development and acceptance', '8.30 Outsourced development',
        '8.31 Separation of development, test and production environments', '8.32 Change management',
        '8.33 Test information', '8.34 Protection of information systems during audit testing'],
}

WCAG = [
    ('1.1.1 Non text Content', 'every icon, image and chart has a text alternative or is marked decorative'),
    ('1.2.1 Audio only and Video only (Prerecorded)', 'any explainer video carries a transcript'),
    ('1.2.2 Captions (Prerecorded)', 'videos captioned in English and Urdu'),
    ('1.2.3 Audio Description or Media Alternative', 'videos described in text'),
    ('1.2.4 Captions (Live)', 'not used: no live media; recorded as not applicable'),
    ('1.2.5 Audio Description (Prerecorded)', 'videos carry audio description where they show what is not said'),
    ('1.3.1 Info and Relationships', 'headings, lists and tables marked up as such'),
    ('1.3.2 Meaningful Sequence', 'reading order follows the visual order in both languages'),
    ('1.3.3 Sensory Characteristics', 'no instruction relies on shape, colour or position alone'),
    ('1.3.4 Orientation', 'every screen works in portrait and landscape'),
    ('1.3.5 Identify Input Purpose', 'personal fields carry autocomplete purposes'),
    ('1.4.1 Use of Color', 'paid, late and failed shown by a word and an icon as well as colour'),
    ('1.4.2 Audio Control', 'no sound plays on its own'),
    ('1.4.3 Contrast (Minimum)', 'text contrast at least 4.5 to 1, large text 3 to 1'),
    ('1.4.4 Resize Text', 'text enlarges to 200 per cent without loss'),
    ('1.4.5 Images of Text', 'no text set as an image, except logos'),
    ('1.4.10 Reflow', 'no sideways scrolling at 320 pixels wide'),
    ('1.4.11 Non text Contrast', 'controls, focus rings and chart marks at 3 to 1'),
    ('1.4.12 Text Spacing', 'layouts hold when spacing is increased'),
    ('1.4.13 Content on Hover or Focus', 'tooltips can be dismissed and stay while pointed at'),
    ('2.1.1 Keyboard', 'every function works from a keyboard on the web'),
    ('2.1.2 No Keyboard Trap', 'focus never trapped, sheets and dialogs included'),
    ('2.1.4 Character Key Shortcuts', 'no single key shortcuts, or they can be switched off'),
    ('2.2.1 Timing Adjustable', 'time limits such as the code and the session can be extended, security limits apart'),
    ('2.2.2 Pause, Stop, Hide', 'moving content such as carousels can be paused'),
    ('2.3.1 Three Flashes or Below Threshold', 'nothing flashes'),
    ('2.4.1 Bypass Blocks', 'a skip link on the web'),
    ('2.4.2 Page Titled', 'every screen has a title that says where the member is'),
    ('2.4.3 Focus Order', 'focus moves in a meaningful order'),
    ('2.4.4 Link Purpose (In Context)', 'every link says where it goes'),
    ('2.4.5 Multiple Ways', 'screens reachable by navigation and by search'),
    ('2.4.6 Headings and Labels', 'headings and labels describe their content'),
    ('2.4.7 Focus Visible', 'a visible focus state on every control'),
    ('2.4.11 Focus Not Obscured (Minimum)', 'the focused control never hidden by the tab bar or a sheet'),
    ('2.5.1 Pointer Gestures', 'no gesture needs more than one finger or a path'),
    ('2.5.2 Pointer Cancellation', 'actions fire on release and can be abandoned'),
    ('2.5.3 Label in Name', 'the spoken name contains the visible label'),
    ('2.5.4 Motion Actuation', 'nothing triggered by shaking or tilting'),
    ('2.5.7 Dragging Movements', 'ordering turns by dragging also possible by buttons'),
    ('2.5.8 Target Size (Minimum)', 'targets at least 24 by 24 pixels, 44 where possible'),
    ('3.1.1 Language of Page', 'the language of each screen declared'),
    ('3.1.2 Language of Parts', 'Urdu passages inside English screens declared as Urdu'),
    ('3.2.1 On Focus', 'focus never changes the screen on its own'),
    ('3.2.2 On Input', 'choosing an option never submits by surprise'),
    ('3.2.3 Consistent Navigation', 'navigation the same on every screen'),
    ('3.2.4 Consistent Identification', 'the same control looks and is named the same everywhere'),
    ('3.2.6 Consistent Help', 'help in the same place on every screen'),
    ('3.3.1 Error Identification', 'errors named in text beside the field'),
    ('3.3.2 Labels or Instructions', 'every field labelled'),
    ('3.3.3 Error Suggestion', 'each error says how to fix it'),
    ('3.3.4 Error Prevention (Legal, Financial, Data)', 'every payment, signature and closure reviewable and '
                                                        'confirmable'),
    ('3.3.7 Redundant Entry', 'nothing asked twice in one journey'),
    ('3.3.8 Accessible Authentication (Minimum)', 'sign in without a memory test beyond the PIN, with biometric and '
                                                  'paste of codes allowed'),
    ('4.1.2 Name, Role, Value', 'custom controls expose their name, role and state'),
    ('4.1.3 Status Messages', 'payment results and errors announced to screen readers'),
]


def build():
    m = [I('Meet %s: %s' % (c, t), 'native and web', 'Claude', 'P1') for c, t in MASVS]
    m += [I('MASVS %s group verified by the independent tester' % g, 'external', 'Tester', 'P1')
          for g in ('STORAGE', 'CRYPTO', 'AUTH', 'NETWORK', 'PLATFORM', 'CODE', 'RESILIENCE', 'PRIVACY')]
    isms = [
        I('Information security management system scoped: the application, the interface service, the data and the '
          'people', 'governance', 'Claude', 'P1', 2),
        I('Information security risk assessment method and register', 'governance', 'Claude', 'P1', 2),
        I('Statement of applicability published, built from the controls below', 'governance', 'Claude', 'P1', 2),
        I('Information security objectives with measures', 'governance', 'Claude', 'P2'),
        I('Internal audit of the management system each year', 'governance', 'Auditor', 'P2'),
        I('Management review each year, minuted', 'governance', 'Chairman', 'P2'),
        I('Corrective action log', 'governance', 'Claude', 'P2'),
        I('Decision on certification to ISO/IEC 27001 and its timing, if the bank asks', 'decision', 'Chairman', 'P3'),
    ]
    soa = []
    for theme, ctrls in ISO.items():
        for c in ctrls:
            owner = 'Chairman' if theme in ('Physical', 'People') else 'Claude'
            pri = 'P3' if theme == 'Physical' else 'P2'
            soa.append(I('ISO/IEC 27001:2022 control %s: applicability decided, how it is met described, evidence kept'
                         % c, 'governance', owner, pri))
    card = [
        I('Eligibility for the simplest card industry self assessment confirmed with the PSP', 'security', 'Claude', 'P1'),
        I('The PSP\'s attestation of compliance collected each year', 'governance', 'Claude', 'P1'),
        I('No card number, expiry or security code in logs, errors or support tickets, checked by automated scans',
          'security', 'Claude', 'P0'),
        I('Card industry self assessment questionnaire completed and signed each year', 'governance', 'Chairman', 'P2'),
    ]
    keys = [
        I('Secrets inventory: every key and credential, its owner, its store and its rotation date', 'security', 'Claude',
          'P0'),
        I('Signing secret for tokens rotated, with old tokens retired', 'security', 'Claude', 'P1'),
        I('Passport signing secret separated from the token secret, or retired with the passport', 'lib/passport.ts',
          'Claude', 'P1'),
        I('PIN hashing moved from SHA-256 with a shared secret to a slow, salted password hash', 'routes/auth.ts:16',
          'Claude', 'P0', 2),
        I('Development fallbacks for secrets removed so production cannot start without them', 'lib/auth.ts', 'Claude',
          'P0'),
        I('Webhook secrets per partner, rotated on a schedule', 'security', 'Claude', 'P1'),
        I('Break glass access procedure for production, logged and reviewed', 'security', 'Claude', 'P2'),
    ]
    ops = [
        I('Alerts for repeated failed sign ins, new administrators, mass exports and webhook failures', 'security',
          'Claude', 'P1'),
        I('Incident response drill twice a year', 'operations', 'Claude', 'P2'),
        I('Domain and email protected: DMARC, SPF and DKIM for Halqa\'s domain', 'infrastructure', 'Claude', 'P1'),
        I('Lookalike domain watch for phishing against members', 'security', 'Claude', 'P3'),
    ]
    sec = section('AJ', 'Security Review', [
        sub('AJ1', 'Mobile Application Security', m, 'OWASP MASVS v2.1: 24 controls in eight groups. Controls already '
                                                  'held by an item elsewhere are met through it: identity images at '
                                                  'rest (549), forced updates (644), pinning, rooted devices and device '
                                                  'binding (812), and the transaction PIN (section AB).'),
        sub('AJ2', 'Information Security Management', isms),
        sub('AJ3', 'Statement of Applicability', soa, 'ISO/IEC 27001:2022 Annex A, 93 controls in four themes. Physical '
                                                     'controls are recorded as not applicable, with the reason, until '
                                                     'Halqa has premises.'),
        sub('AJ4', 'Card Data', card),
        sub('AJ5', 'Secrets and Keys', keys),
        sub('AJ6', 'Security Operations', ops),
    ], 'What a bank\'s security review asks a service provider to show.', loop=9)
    w = [I('Meet WCAG 2.2 %s: %s' % (c, t), 'components', 'Claude', 'P2') for c, t in WCAG]
    extra = [
        I('Screen reader test in Urdu with TalkBack on Android', 'testing', 'Tester', 'P2'),
        I('Screen reader test with VoiceOver on iOS', 'testing', 'Tester', 'P2'),
        I('Colour vision check of every status colour', 'testing', 'Claude', 'P2'),
        I('Words beside every icon for members who read little', 'components', 'Claude', 'P1'),
        I('Numbers always in Western digits in both languages, as banks print them', 'content', 'Claude', 'P1'),
        I('Accessibility statement published with a contact for problems', 'content', 'Claude', 'P2'),
        I('Accessibility test by members with disabilities before launch', 'testing', 'Chairman', 'P3'),
    ]
    acc = section('AK', 'Accessibility', [
        sub('AK1', 'WCAG 2.2 Success Criteria', w, 'Every success criterion at levels A and AA, as it applies to Halqa; '
                                                   'items 607 to 614 broken down by criterion.'),
        sub('AK2', 'Beyond the Criteria', extra, 'Item 613 by platform, and checks the criteria do not name.'),
    ], 'Accessibility as a bank\'s review and the stores expect it.', loop=9)
    return [sec, acc]
