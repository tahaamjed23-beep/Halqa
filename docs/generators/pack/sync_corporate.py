# -*- coding: utf-8 -*-
"""Copies the current document set into Desktop\\ALL HALQA\\HALQA CORPORATE.
Each target folder is emptied of PDFs and images first, so nothing stale survives a re-run."""
import glob, os, shutil, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'out')
MAPS = os.path.join(os.path.dirname(HERE), 'out')
ROOT = r'C:\Users\admin\Desktop\ALL HALQA'
CORP = os.path.join(ROOT, 'HALQA CORPORATE')
DRAFTS_SRC = r'C:\Users\admin\Desktop\halqa business\documents'
DECK_SRC = r'D:\HALQA SIGMA APP\docs'

F = {
    '01 Presentation': [],
    '02 Company Partnership Documents': [
        'partnership/Asset Committees.pdf', 'partnership/Auto Debit.pdf',
        'partnership/Business Model and Unit Costs.pdf', 'partnership/Seat Exchange and Points.pdf',
        'partnership/Default Prevention.pdf', 'partnership/Complete Feature and Process List.pdf',
        'partnership/Hyper Committee.pdf', 'partnership/Collection and Auto Debit Specification.pdf'],
    '03 Legal': ['legal/Legal Position.pdf'],
    '04 Licence Documents': ['licence/Registrations and Licences Required.pdf', 'licence/Incorporation Checklist.pdf'],
    r'05 Maths\Formal': sorted(os.path.relpath(p, OUT) for p in glob.glob(os.path.join(OUT, 'maths', 'Formal', '*.pdf'))),
    r'05 Maths\Informal': sorted(os.path.relpath(p, OUT) for p in glob.glob(os.path.join(OUT, 'maths', 'Informal', '*.pdf'))),
    '06 Maps': [],
    r'07 Internal': ['internal/Work Register.pdf'],
}
MAP_FILES = ['HALQA-MAP-SYSTEM.png', 'HALQA-MAP-LAW.png', 'HALQA-MAP-SAVINGS-AND-MONEY.png', 'HALQA-MAP-HYPER.png',
             'HALQA-MAP-CREDIT-BUREAU.png', 'HALQA-MAP-CREDIT-AND-REWARDS.png', 'HALQA-MAP-BUSINESS-MODEL.png',
             'HALQA-MAP-TECHNICAL.png']
MAP_NAMES = {'HALQA-MAP-SYSTEM.png': '1 System.png', 'HALQA-MAP-LAW.png': '2 Law.png',
             'HALQA-MAP-SAVINGS-AND-MONEY.png': '3 Savings and Money.png', 'HALQA-MAP-HYPER.png': '4 Hyper.png',
             'HALQA-MAP-CREDIT-BUREAU.png': '5 Credit Bureau.png', 'HALQA-MAP-CREDIT-AND-REWARDS.png': '6 Credit and Rewards.png',
             'HALQA-MAP-BUSINESS-MODEL.png': '7 Business Model.png', 'HALQA-MAP-TECHNICAL.png': '8 Technical.png'}
SKIP_MAPS = set(a for a in sys.argv[1:] if a.startswith('HALQA-MAP-'))
SKIP_FILES = set(a[5:] for a in sys.argv[1:] if a.startswith('SKIP:'))
DECK = [a for a in sys.argv[1:] if a.lower().endswith(('.pptx', '.pdf')) and not a.startswith('SKIP:')]

os.makedirs(CORP, exist_ok=True)
copied, missing = [], []
for sub, files in F.items():
    d = os.path.join(CORP, sub)
    os.makedirs(d, exist_ok=True)
    for old in glob.glob(os.path.join(d, '*')):
        if os.path.isfile(old) and old.lower().endswith(('.pdf', '.png', '.pptx', '.txt')):
            os.remove(old)
    for rel in files:
        if rel in SKIP_FILES:
            missing.append(rel + ' (held back until rebuilt)')
            continue
        src = os.path.join(OUT, rel)
        if os.path.exists(src):
            shutil.copy2(src, os.path.join(d, os.path.basename(src)))
            copied.append(os.path.join(sub, os.path.basename(src)))
        else:
            missing.append(rel)
for m in MAP_FILES:
    if m in SKIP_MAPS:
        missing.append(m + ' (held back until rebuilt)')
        continue
    shutil.copy2(os.path.join(MAPS, m), os.path.join(CORP, '06 Maps', MAP_NAMES[m]))
    copied.append(os.path.join('06 Maps', MAP_NAMES[m]))
os.makedirs(os.path.join(CORP, r'07 Internal\Drafts'), exist_ok=True)
for name in DECK:
    shutil.copy2(os.path.join(DECK_SRC, name), os.path.join(CORP, '01 Presentation', name))
    copied.append(os.path.join('01 Presentation', name))
PRIMARY = {
    'ca2017.pdf': 'Companies Act 2017.pdf',
    'law/psEFT-2007.pdf': 'Payment Systems and Electronic Fund Transfers Act 2007.pdf',
    'law/psop-2014.pdf': 'SBP Rules for Payment System Operators and Payment Service Providers 2014.pdf',
    'law/emi-2023.pdf': 'SBP Regulations for Electronic Money Institutions 2023.pdf',
    'ins2000b.pdf': 'Insurance Ordinance 2000.pdf',
    'law/cia-2020.pdf': 'Corporate Insurance Agents Regulations 2020.pdf',
    'cba2015.pdf': 'Credit Bureaus Act 2015.pdf',
    'law/eto-2002-pakistancode.pdf': 'Electronic Transactions Ordinance 2002.pdf',
    'research/ict-2025.pdf': 'Islamabad Capital Territory Tax on Services Ordinance 2001.pdf',
    'research/sja-summary-procedure.pdf': 'Summary Procedure, Order XXXVII, Sindh Judicial Academy.pdf',
}
PT = os.path.join(CORP, '03 Legal', 'Primary texts')
os.makedirs(PT, exist_ok=True)
for old in glob.glob(os.path.join(PT, '*.pdf')):
    os.remove(old)
SPD = os.path.dirname(HERE)
for src, name in PRIMARY.items():
    shutil.copy2(os.path.join(SPD, src), os.path.join(PT, name))
    copied.append(os.path.join('03 Legal', 'Primary texts', name))
ws = os.path.join(OUT, 'legal', 'Web Sources Read.pdf')
shutil.copy2(ws, os.path.join(PT, 'Web Sources Read.pdf'))
copied.append(os.path.join('03 Legal', 'Primary texts', 'Web Sources Read.pdf'))
print('copied %d files' % len(copied))
for c in copied:
    print('  ', c)
if missing:
    print('not yet present:')
    for m in missing:
        print('  ', m)
