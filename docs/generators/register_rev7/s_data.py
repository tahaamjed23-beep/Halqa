# -*- coding: utf-8 -*-
"""Pass 5b: what every record in the database needs: migration, indexes, keys, constraints, personal data, encryption,
retention, audit and test data. Models read from prisma/schema.prisma on 5 October 2026."""
import io, json, os
from common import I, sub, section

HERE = os.path.dirname(os.path.abspath(__file__))

RETIRE = {
    'Investment': 'Halqa invests no member money',
    'Scheme': 'the catalogue of investment products goes',
    'SecurityDeposit': 'no deposits are held from members',
    'PayoutHoldback': 'no payout is held back',
    'RiskConsent': 'consent to investment risk is no longer asked',
}
REVIEW = {
    'ProtectionCommitment': 'review against the bank route: keep only the commitment record, never money held',
    'PartnerBank': 'replace the sandbox entry (Soneri, custody enabled) with Mashreq and Raqami, custody off',
    'RiskAssessment': 'keep the circle risk band; remove investment fields',
}
PII = {
    'User': 'name, phone, CNIC, date of birth, address, city, occupation, employer, income, photo',
    'KycRecord': 'CNIC data, verification results',
    'PayslipUpload': 'payslip images and amounts',
    'SalarySignal': 'salary credits and dates',
    'AgreementSignature': 'signature, address and device',
    'ChatMessage': 'message text',
    'SupportTicket': 'description',
    'SupportMessage': 'message text',
    'PaymentAttempt': 'account references',
    'StatementLine': 'narration and account references',
    'RefreshToken': 'device and address',
    'SecurityEvent': 'device and address',
    'ExitRequest': 'reasons',
    'RecoveryCase': 'hardship reasons',
}
ENCRYPT = {
    'User': 'CNIC number, phone, address, date of birth and income',
    'KycRecord': 'CNIC number and the verification payload',
    'PayslipUpload': 'the stored file and the amounts read from it',
    'StatementLine': 'account numbers',
}
AUDITED = {'User', 'Committee', 'CommitteeMember', 'Round', 'Payment', 'LedgerEntry', 'RecoveryCase', 'ExitRequest',
           'AgreementSignature', 'KycRecord', 'PartnerBank', 'RestitutionDebt', 'ExchangeListing', 'ExchangeBid'}

NEW = [
    ('BankAccount', 'the member\'s account at the partner bank: reference, status, title, default flag'),
    ('BankOnboarding', 'each account opening attempt: start, steps, outcome, reason'),
    ('Mandate', 'mandate reference, account, ceiling, cadence, text authorised, time and address'),
    ('MandateEvent', 'every status event from the bank for a mandate'),
    ('BankInstruction', 'every instruction to the bank: debit, credit, payout, with its key and result'),
    ('BankWebhookEvent', 'every signed event received from the bank, raw and verified'),
    ('ReconciliationBreak', 'each unmatched entry, its investigation and resolution'),
    ('FeeSchedule', 'the versioned fee rules: Rs 85, the PSP service fee rule, Hyper Rs 15'),
    ('FeeCharge', 'each fee charged with the schedule version applied'),
    ('PspCharge', 'each PSP charge, refund and dispute with the PSP reference'),
    ('PointsEntry', 'the append only points ledger: issue, purchase, transfer, redemption, lapse'),
    ('PointsPurchase', 'each purchase of points with money and its bank reference'),
    ('Merchant', 'marketplace merchants and their agreements'),
    ('Product', 'catalogue products with prices in points'),
    ('Order', 'marketplace orders and their delivery status'),
    ('ReturnRequest', 'returns and refunds in points'),
    ('TurnTrade', 'each trade of a turn: listing, offers, approval, settlement'),
    ('TakafulEnrolment', 'the operator\'s reference for each member covered, with no amount promised by Halqa'),
    ('Claim', 'the operator\'s claim reference and status'),
    ('BureauConsent', 'consent to reporting with the route named'),
    ('BureauSubmission', 'each monthly submission and its checks'),
    ('BureauDispute', 'disputes of reported records'),
    ('Complaint', 'complaints with category, timeline and outcome'),
    ('Consent', 'each consent by purpose, version and time'),
    ('DeviceBinding', 'the bound device, binding time and cooling off end'),
    ('TransactionPin', 'the transaction PIN hash and attempts'),
    ('NotificationLog', 'every alert sent, by channel, with delivery status'),
    ('KeyFactAcceptance', 'each key fact statement accepted, with its version'),
    ('DataRequest', 'export and deletion requests and their completion'),
    ('FraudSignal', 'signals sent to the bank\'s fraud unit'),
    ('FeatureSwitch', 'switches that withdraw a surface without a release'),
    ('AdminRole', 'named administrators and what each may do'),
    ('JobRun', 'every scheduled job run, its result and duration'),
]


def build():
    inv = json.loads(io.open(os.path.join(HERE, 'inventory.json'), encoding='utf-8').read())
    models = inv['models']
    retire, review, kept = [], [], []
    for name, fields in models.items():
        w = 'schema.prisma: %s' % name
        if name in RETIRE:
            retire.append(I('%s: remove the model and its relations; %s' % (name, RETIRE[name]), w, 'Claude', 'P0', 2))
            retire.append(I('%s: migration that drops it after its data is archived' % name, w, 'Claude', 'P0'))
            continue
        if name in REVIEW:
            review.append(I('%s: %s' % (name, REVIEW[name]), w, 'Claude', 'P0', 2))
        a = lambda t, pri='P1', eff=1: kept.append(I('%s: %s' % (name, t), w, 'Claude', pri, eff))
        a('included in the baseline migration and reviewed field by field (%d fields)' % len(fields), 'P0')
        a('index for every list query that filters or sorts on it')
        a('foreign keys with the delete rule stated for each')
        a('constraints: amounts not negative, values only from their lists, required fields required')
        if name in PII:
            a('personal data classified: %s' % PII[name], 'P0')
            a('retention period set and applied by the deletion job', 'P1')
        else:
            a('retention period set, with the reason')
        if name in ENCRYPT:
            a('field level encryption for %s' % ENCRYPT[name], 'P0', 2)
        if name in AUDITED:
            a('every change recorded in the audit log with the actor', 'P0')
        a('test fixtures for every state it can be in')
        a('each field documented in the data dictionary', 'P2')
    new = []
    for name, purpose in NEW:
        w = 'new model %s' % name
        b = lambda t, pri='P1', eff=1: new.append(I('%s: %s' % (name, t), w, 'Claude', pri, eff))
        b('model created: %s' % purpose, 'P1', 2)
        b('migration written and applied to staging first')
        b('indexes for its queries')
        b('keys and constraints')
        b('personal data classified and retention set')
        b('changes recorded in the audit log')
        b('test fixtures')
        b('documented in the data dictionary', 'P2')
    shared = [
        I('Enums reviewed: remove CustodyMode and the investment values; keep only states the product uses', 'schema.prisma',
          'Claude', 'P0', 2),
        I('Money stored as whole paisa in big integers everywhere, with no floating point', 'schema.prisma', 'Claude', 'P0'),
        I('User model of 99 fields split: identity, contact, preferences and underwriting held apart', 'schema.prisma',
          'Claude', 'P2', 4),
        I('Committee model of 79 fields reviewed: remove float, reinvestment and deposit coverage fields', 'schema.prisma',
          'Claude', 'P0', 2),
        I('Data dictionary published for the bank: every field, its meaning, its owner and its retention', 'docs',
          'Claude', 'P1', 2),
        I('Personal data map: which tables hold which personal data and where each is stored', 'docs', 'Claude', 'P0', 2),
        I('Field level encryption key held in a managed vault and rotated', 'infrastructure', 'Claude', 'P0', 2),
        I('Anonymised copy of production for testing, with no real personal data', 'infrastructure', 'Claude', 'P2', 2),
        I('Database roles: the application cannot drop tables; migrations run with a separate role', 'infrastructure',
          'Claude', 'P1'),
        I('Slow query log reviewed each week', 'operations', 'Claude', 'P2'),
    ]
    return section('AF', 'Database Records', [
        sub('AF1', 'Models to Remove', retire),
        sub('AF2', 'Models to Review', review),
        sub('AF3', 'Models Kept', kept, 'Each of the %d models kept, with every check it needs: items 498 and 503 '
                                       'broken down by model.' %
            (len(models) - len(RETIRE))),
        sub('AF4', 'New Models for the Bank Route', new),
        sub('AF5', 'Shared', shared),
    ], 'The 39 models in the schema and the new records the partnership needs.', loop=5)
