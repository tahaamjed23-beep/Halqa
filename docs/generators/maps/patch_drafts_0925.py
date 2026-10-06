# -*- coding: utf-8 -*-
"""Bring the two drafts up to 25 September: date, the cover comparison, the documents offered, plainer wording."""
import io, os, sys
sys.stdout.reconfigure(encoding='utf-8')
D = r'C:\Users\admin\Desktop\ALL HALQA\HALQA CORPORATE\07 Internal\Drafts'
A_OLD, A_NEW = os.path.join(D, 'Message to Akif Saeed - 24 September 2026.txt'), os.path.join(D, 'Message to Akif Saeed - 25 September 2026.txt')
E_OLD, E_NEW = os.path.join(D, 'Email to payment partner - 24 September 2026.txt'), os.path.join(D, 'Email to payment partner - 25 September 2026.txt')

a = io.open(A_OLD if os.path.exists(A_OLD) else A_NEW, encoding='utf-8').read()
PA = [
    ('24 September 2026. Draft, not sent', '25 September 2026. Draft, not sent'),
    ('Following your guidance on jurisdiction, I have taken the model apart and rebuilt\nthe parts that were creating the exposure. I wanted to put the findings in front\nof you before I go further.',
     'Following your guidance on jurisdiction, I have revised the parts of the model\nthat created regulatory exposure. I wanted to put the findings in front of you\nbefore I go further.'),
    ('That is a lender and a borrower in substance, and\nit walks straight into the peer to peer definition in the NBFC Regulations,',
     'That is a lender and a borrower in substance, and\nit falls within the peer to peer definition in the NBFC Regulations,'),
    ('The cover is sized at a fifty per cent post collection default rate. Recorded\ncommittee fraud runs at about twelve per cent, so the margin is roughly four\ntimes the worst rate on record.',
     'The cover is sized at a fifty per cent post collection default rate, more than\neight times the highest arrears rate reported for Pakistani microfinance, which\npeaked at 6.01 per cent.'),
    ('I would value your view on whether that reading is right, because it is the\nsingle judgement the whole plan rests on.',
     'I would value your view on whether that reading is right, because the plan\ndepends on it.'),
    ('I have the clause by clause analysis and the threshold model written up and can\nsend either.',
     'The Legal Position, which quotes every provision with the page on which it is\nfound, and the models behind each threshold are written up, and I can send any\nof them.'),
]
for x, y in PA:
    if a.count(x) == 1:
        a = a.replace(x, y)
    else:
        assert a.count(y) == 1, x[:60]
io.open(A_NEW, 'w', encoding='utf-8').write(a)
if os.path.exists(A_OLD) and A_OLD != A_NEW:
    os.remove(A_OLD)

e = io.open(E_OLD if os.path.exists(E_OLD) else E_NEW, encoding='utf-8').read()
x, y = '24 September 2026. Draft, not sent', '25 September 2026. Draft, not sent'
if x in e:
    e = e.replace(x, y)
io.open(E_NEW, 'w', encoding='utf-8').write(e)
if os.path.exists(E_OLD) and E_OLD != E_NEW:
    os.remove(E_OLD)
print(sorted(os.listdir(D)))
