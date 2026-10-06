# -*- coding: utf-8 -*-
"""Formal headings. Every h2 and h3 is mapped to a short, general noun heading at render time.
Numbering ("3." or "5.1") is kept; only the words change. Unmapped headings are reported."""
import html as H
import re

GLOBAL = {
    'Summary in plain words': 'Summary',
    'Summary': 'Summary',
    'The words used': 'Terms',
    'Worked examples': 'Illustrations',
    'Worked example': 'Illustration',
    'A worked example': 'Illustration',
    'Examples': 'Illustrations',
    'After joining': 'Ongoing Monitoring',
    'Tax': 'Taxation',
    'Trademark': 'Trademark',
    'Notation': 'Notation',
    'Evidence': 'Evidence',
    'Inputs': 'Inputs',
    'Exposure': 'Exposure',
    'Deposits': 'Deposits',
    'Electronic money': 'Electronic Money',
    'Raast': 'Raast',
    'Lotteries': 'Lotteries',
    'Sources': 'Sources',
    'Configuration': 'Configuration',
    'Collection': 'Collection',
    'Payout': 'Payout',
    'Products': 'Products',
    'Security': 'Security',
    'Counterparties': 'Counterparties',
    'Home': 'Address',
    'Names': 'Names',
    'Job': 'Occupation',
}

BY_DOC = {
    'Legal Position': {
        'The position in brief': 'Overview', 'How a payment moves': 'Flow of Funds',
        'Associations of more than twenty persons': 'Associations', 'Lending and peer to peer lending': 'Lending',
        'Payment services and the payment partner': 'Payment Services', 'Automatic collection': 'Automatic Collection',
        'Insurance and takaful': 'Insurance', 'How cover is sold': 'Distribution of Cover',
        'Credit reports and the bureau': 'Credit Information', 'Electronic contracts and signatures': 'Electronic Records',
        'Recovering money from a member who stops paying': 'Recovery', 'Money laundering law': 'Money Laundering',
        'The company and its directors': 'Corporate Structure', 'Sales tax on the fee': 'Taxation',
        'Savings, when offered': 'Savings', 'The affordability limit': 'Affordability',
        'The regulatory sandbox': 'Regulatory Sandbox', 'Licences that do not apply': 'Licences Not Required',
        'What Halqa does need': 'Requirements', 'Questions for counsel': 'Matters for Counsel',
        'Process and legal requirements': 'Process and Legal Requirements',
    },
    'Incorporation Checklist': {
        'Before filing': 'Preparation', 'The filing': 'Filing', 'The first two weeks after incorporation': 'Post Incorporation',
    },
    'Registrations and Licences Required': {
        'The position': 'Overview', 'Everything required, in order': 'Requirements',
        'Directors and shareholding': 'Directors and Shareholding', 'Takaful agency, correctly stated': 'Takaful Agency',
        'Savings, later': 'Savings', 'Not required': 'Licences Not Required',
    },
    'Hyper Committee: Default Threshold Model': {
        'Halqa and the Hyper committee': 'Background', 'The two identities': 'Identities', 'Forward liability': 'Forward Liability',
        'Five results': 'Results', 'Arrears before collection recover themselves': 'Arrears Before Collection',
        'The only loss is default after collection': 'Default After Collection',
        'Expected loss, and the cover it requires': 'Expected Loss and Cover', 'The hard stop': 'Hard Stop',
        'Daily shortfall': 'Daily Shortfall', 'The stress index': 'Stress Index',
        'Worked path of an Option 1 circle under stress': 'Illustration', 'Implementation': 'Implementation',
        'Model surface': 'Model Surface',
    },
    'Affordability for Unknown Committees: Model': {
        'Halqa, and where this test applies': 'Background', 'The income figure used': 'Income Measure',
        'The five tests': 'Tests', 'Keeping the figures honest': 'Controls', 'Implementation': 'Implementation',
        'Model surface': 'Model Surface',
    },
    'Income Account Verification: Model': {
        'Halqa, and what this model decides': 'Background', 'Integrity checks on a statement': 'Statement Integrity',
        'Which credits count as income': 'Eligible Credits', 'The salary pattern test': 'Salary Test',
        'The daily income test for Hyper': 'Daily Income Test', 'Implementation': 'Implementation', 'Model surface': 'Model Surface',
    },
    'Identity Verification: Model': {
        'Halqa, and the levels of verification': 'Background', 'Identity and personal details': 'Identity',
        'Job and income': 'Occupation', 'Screening and duplicates': 'Screening',
        'The identity confidence score': 'Confidence Score', 'Handling the data': 'Data Handling',
        'Implementation': 'Implementation', 'Model surface': 'Model Surface',
    },
    'Takaful Cover for Unknown Committees: Pricing Model': {
        'Halqa, and the risk to be covered': 'Background', 'Frequency: two cases': 'Frequency',
        'Expected loss and the pure premium': 'Pure Premium', 'From pure premium to contribution': 'Contribution',
        'Whether the fund survives the stress case': 'Stress Test',
        'Claims, recoveries and the agent’s obligations': 'Claims and Recoveries',
        'What Halqa asks of the operator': 'Requirements', 'Implementation': 'Implementation', 'Model surface': 'Model Surface',
    },
    'Credit Scoring and the TASDEEQ Link': {
        'Halqa and the purpose of this document': 'Background', 'What TASDEEQ publishes': 'Bureau Methodology',
        'The legal route': 'Legal Basis', 'How Halqa’s records map onto TASDEEQ’s data points': 'Data Mapping',
        'The record Halqa proposes to furnish': 'Reporting Format', 'Halqa’s internal score today': 'Current Score',
        'The next version: a scorecard fitted to observed defaults': 'Statistical Scorecard',
        'Relating Halqa’s scale to TASDEEQ’s': 'Scale Conversion', 'What Halqa asks of TASDEEQ': 'Requirements',
        'Implementation': 'Implementation', 'Model surface': 'Model Surface',
    },
    'Hyper Default Threshold, Explained': {
        'Two rules that keep it balanced': 'Balance Rules', 'What a member still owes after collecting': 'Amount Owed After Collection',
        'Missing payments before a turn is not a loss': 'Arrears Before Collection', 'How much cover is needed': 'Cover Required',
        'When the circle must stop': 'Stopping Rule', 'The stress index': 'Stress Index', 'The model in three dimensions': 'Model Surface',
    },
    'Affordability, Explained': {
        'The income Halqa believes': 'Income Measure', 'The rules': 'Rules', 'Why Hyper needs more than Rs 1,000 a day': 'Hyper Income Requirement',
        'The model in three dimensions': 'Model Surface',
    },
    'Income Account Verification, Explained': {
        'Checking for a salary': 'Salary Check', 'Checking for daily income, Hyper': 'Daily Income Check',
        'The model in three dimensions': 'Model Surface',
    },
    'Identity Verification, Explained': {
        'How much checking': 'Levels', 'One final number': 'Confidence Score', 'The model in three dimensions': 'Model Surface',
    },
    'Takaful Cover Pricing, Explained': {
        'What is being insured': 'Insured Risk', 'The two cases': 'Cases', 'What a member would pay': 'Member Cost',
        'Whether the fund survives the chairman’s case': 'Stress Test', 'Rules the law sets': 'Legal Requirements',
        'The model in three dimensions': 'Model Surface',
    },
    'Credit Scoring and TASDEEQ, Explained': {
        'How TASDEEQ scores': 'Bureau Scoring', 'How Halqa scores today': 'Current Score', 'The better version, later': 'Future Scorecard',
        'Converting between the two scales': 'Scale Conversion', 'What the law allows': 'Legal Basis',
        'The model in three dimensions': 'Model Surface',
    },
    'Business Model and Unit Costs': {
        'How Halqa earns': 'Revenue', 'The fee, stated plainly': 'Fee',
        'What one member pays in each committee type': 'Member Cost by Committee Type',
        'Prices used, and where each comes from': 'Cost Inputs', 'Cost of onboarding one member': 'Onboarding Cost',
        'Running cost of one payment': 'Transaction Cost', 'Seven committee types, from a family circle to Hyper': 'Committee Economics',
        'What moves the result': 'Sensitivity', 'Fixed costs and break even': 'Fixed Costs and Break Even',
        'Points to confirm before launch': 'Open Items',
    },
    'Collection and Auto Debit Specification': {
        'The rule every tier obeys': 'Principle', 'The collection tiers': 'Collection Tiers', 'Auto pull, step by step': 'Auto Pull',
        'Setting it up': 'Setup', 'Each monthly collection': 'Monthly Collection', 'Each Hyper day': 'Daily Collection',
        'Limits built into every mandate': 'Mandate Limits', 'Stopping it': 'Revocation', 'What Halqa never does': 'Exclusions',
        'Why the rail cost decides the tier': 'Rail Cost', 'Hyper daily settlement without a pool': 'Hyper Settlement',
        'Mandate lifecycle': 'Mandate Lifecycle', 'Statutory position of each party': 'Statutory Duties', 'The terms screen': 'Disclosure',
        'The arrears model': 'Arrears', 'Retry policy': 'Retry Policy', 'Return codes and handling': 'Return Codes',
        'Security of the mandate': 'Mandate Security', 'Settlement and reconciliation': 'Settlement and Reconciliation',
        'Questions for the partner': 'Partner Requirements', 'Build status': 'Build Status',
        'Technical process': 'Technical Process', 'System architecture': 'System Architecture', 'Interfaces': 'Interfaces',
        'Message sequence': 'Message Sequence',
    },
    'Complete Feature and Process List': {
        'Account and identity': 'Accounts and Identity', 'Eligibility and standing': 'Eligibility', 'Credit bureau': 'Credit Bureau',
        'Creating a circle': 'Circle Creation', 'Joining a circle': 'Membership', 'Seats and collection order': 'Seat Allocation',
        'Payment rails': 'Payment Rails', 'Fees, points and waivers': 'Fees and Rewards', 'Default prevention': 'Default Prevention',
        'Delinquency and recovery': 'Delinquency and Recovery', 'Exit and transfer': 'Exit', 'Positions': 'Seat Exchange',
        'Host tools': 'Host Functions', 'Messaging and notices': 'Messaging', 'Records and statements': 'Records',
        'Legal instruments': 'Legal Instruments', 'Money-laundering controls': 'Money Laundering Controls', 'Takaful cover': 'Takaful',
        'Savings: trustee and asset manager': 'Savings', 'Algorithms and engines': 'Engines', 'Data and platform': 'Platform',
        'Registrations and contracts': 'Registrations and Contracts', 'Support and operations': 'Operations',
        'Technical architecture': 'Technical Architecture',
    },
    'Default Prevention': {
        'Where the risk is': 'Risk', 'Before a member joins': 'Admission Controls', 'When a member joins': 'Contractual Controls',
        'While the circle runs': 'Collection Controls', 'When a member stops paying': 'Recovery',
        'What each layer does to the loss': 'Effect on Loss', 'Laws relied on': 'Legal Basis',
        'Technical process': 'Technical Process',
    },
    'Hyper Committee': {
        'The two governing identities': 'Identities', 'The three way split': 'Payment Split',
        'Daily settlement without a pool': 'Settlement', 'The fee': 'Fee', 'Fee discounts': 'Discounts', 'Takaful cover': 'Takaful',
        'What a seat is worth on the day it collects': 'Forward Liability', 'The collapse threshold': 'Threshold',
        'Result 1. Arrears before collection recover themselves': 'Result 1. Arrears Before Collection',
        'Result 2. The only true loss is default after collection': 'Result 2. Default After Collection',
        'Result 3. Expected loss, and the cover it requires': 'Result 3. Expected Loss and Cover',
        'Result 4. The hard stop': 'Result 4. Hard Stop', 'Result 5. Daily shortfall': 'Result 5. Daily Shortfall',
        'The stress index': 'Stress Index', 'Worked path of an Option 1 circle under stress': 'Illustration',
        'Entry gates': 'Eligibility', 'Daily operation and default controls': 'Daily Operation',
        'Revenue and cost on one cycle': 'Economics', 'Relation to the rest of the product': 'Regulatory Position',
        'Technical process': 'Technical Process',
    },
}

_NUM = re.compile(r'^((?:\d+\.)*\d+\.?\s+)?(.*)$', re.S)


def apply(title, body, report=None):
    title_txt = H.unescape(re.sub(r'<[^>]+>', '', title)).strip()
    table = dict(GLOBAL)
    key = 'Identity Verification: Model' if title_txt == 'Identity Verification (KYC): Model' else title_txt
    table.update(BY_DOC.get(key, {}))
    values = set(table.values())

    def sub(m):
        tag, inner = m.group(1), m.group(2)
        txt = H.unescape(re.sub(r'<[^>]+>', '', inner)).strip()
        if txt in table:
            return '<%s>%s</%s>' % (tag, H.escape(table[txt], quote=False), tag)
        num, rest = _NUM.match(txt).groups()
        if rest in table:
            return '<%s>%s%s</%s>' % (tag, num or '', H.escape(table[rest], quote=False), tag)
        small = {'and', 'of', 'the', 'to', 'for', 'in', 'on', 'by', 'a', 'an', 'or', 'with', 'per', 'at', 'from'}
        titled = all(w[:1].isupper() or w[:1].isdigit() or w in small for w in rest.replace(',', ' ').split())
        if report is not None and rest not in values and not titled:
            report.append((title_txt, txt))
        return m.group(0)
    return re.sub(r'<(h[23])>(.*?)</\1>', sub, body, flags=re.S)
