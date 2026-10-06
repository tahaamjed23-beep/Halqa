# -*- coding: utf-8 -*-
"""Generate the data dictionary from the schema itself.

Work register: "Data dictionary published for the bank: every field, its meaning, its owner and its retention", and,
for each model, "each field documented in the data dictionary".

Read from prisma/schema.prisma, never written by hand, so the dictionary cannot drift from the database. A field whose
meaning is not obvious from its name carries the comment written above it in the schema; a field that holds personal
data is marked, because that is the column the bank's reviewer and the data protection work both start from.
"""
import io, os, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

SCHEMA = r'D:\HALQA SIGMA APP\halqa-api\prisma\schema.prisma'
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')

# What counts as personal data, by the name of the column. The classification is
# deliberately wide: a reviewer should see more marked than fewer.
PERSONAL = re.compile(r'(?i)name|phone|email|cnic|address|dob|birth|photo|avatar|ip\b|device|location|lat|lng|'
                      r'account|iban|salary|income|employer|occupation|city|province|guarantor|payslip|statement')
# Only the three that are credentials. A textHash is the fingerprint of a
# document the member signed, which is evidence rather than a secret, and
# marking it SECRET would hide the one thing a dispute needs.
SECRET = re.compile(r'(?i)^(passwordHash|pinHash|tokenHash|otpHash|secret\w*|\w*Secret)$')

# Retention, by the kind of record. Ten years for anything the bank must keep
# under its own retention rules; shorter where the record is operational only.
RETENTION = [
    (re.compile(r'(?i)^(user|kycrecord|agreementsignature|undertaking)'), 'Ten years after the account closes, with the bank'),
    (re.compile(r'(?i)^(payment|ledgerentry|round|committee|committeemember|payout|recoverycase|restitutiondebt)'),
     'Ten years after the circle closes, with the bank'),
    (re.compile(r'(?i)^(securityevent|auditlog|notification|paymentattempt|salarysignal)'), 'Two years'),
    (re.compile(r'(?i)^(refreshtoken|session)'), 'Until it expires, then thirty days'),
]


def retention_for(model):
    for rx, text in RETENTION:
        if rx.match(model):
            return text
    return 'To be set with the bank'


def parse(path):
    text = io.open(path, encoding='utf-8').read()
    models = []
    for m in re.finditer(r'^model (\w+) \{\n(.*?)^\}', text, re.S | re.M):
        name, body = m.group(1), m.group(2)
        fields, comment = [], []
        for line in body.split('\n'):
            s = line.strip()
            if not s:
                continue
            if s.startswith('//'):
                comment.append(s.lstrip('/ ').strip())
                continue
            if s.startswith('@@'):
                continue
            fm = re.match(r'(\w+)\s+(\S+)(.*)$', s)
            if not fm:
                comment = []
                continue
            fname, ftype, rest = fm.group(1), fm.group(2), fm.group(3)
            fields.append(dict(name=fname, type=ftype, attrs=rest.strip(), note=' '.join(comment)))
            comment = []
        models.append(dict(name=name, fields=fields))
    return models


def main():
    models = parse(SCHEMA)
    os.makedirs(OUT, exist_ok=True)
    md = ['# Halqa Data Dictionary', '',
          'Reference HQ-IN-04. Generated from `prisma/schema.prisma`; not written by hand, so it cannot drift from '
          'the database.', '',
          'Every field in every record, with its type, what it means where the name does not say, whether it holds '
          'personal data, and how long it is kept. Personal data is marked wide rather than narrow: a reviewer should '
          'see more marked than fewer. A field marked SECRET never leaves the service in any response.', '',
          '%d records, %d fields.' % (len(models), sum(len(m['fields']) for m in models)), '']
    personal_total = secret_total = 0
    for m in sorted(models, key=lambda x: x['name']):
        md += ['## %s' % m['name'], '', 'Retention: %s.' % retention_for(m['name']), '',
               '| Field | Type | Holds | Meaning |', '| :-- | :-- | :-- | :-- |']
        for f in m['fields']:
            holds = []
            if SECRET.search(f['name']):
                holds.append('SECRET')
                secret_total += 1
            elif PERSONAL.search(f['name']):
                holds.append('personal')
                personal_total += 1
            if '@unique' in f['attrs']:
                holds.append('unique')
            if '@id' in f['attrs']:
                holds.append('key')
            md.append('| %s | %s | %s | %s |' % (f['name'], f['type'], ', '.join(holds) or '', f['note']))
        md.append('')
    md.insert(5, '%d fields hold personal data and %d hold a secret that never leaves the service.'
              % (personal_total, secret_total))
    md.insert(6, '')
    io.open(os.path.join(OUT, 'DATA-DICTIONARY.md'), 'w', encoding='utf-8').write('\n'.join(md))
    print('records %d, fields %d, personal %d, secret %d'
          % (len(models), sum(len(m['fields']) for m in models), personal_total, secret_total))
    return [m['name'] for m in models]


if __name__ == '__main__':
    main()
