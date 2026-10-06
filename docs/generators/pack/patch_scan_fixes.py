# -*- coding: utf-8 -*-
"""Fixes from the wording scan of 25 September, late."""
import io, os, shutil

SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def patch(path, pairs):
    s = io.open(path, encoding='utf-8').read()
    for a, b in pairs:
        n = s.count(a)
        if n != 1:
            if s.count(b) >= 1:
                continue
            raise SystemExit('%s: %d matches for %r' % (path, n, a[:100]))
        s = s.replace(a, b)
    io.open(path, 'w', encoding='utf-8').write(s)
    print('patched', os.path.basename(path))


patch(os.path.join(SP, 'pack', 'm5_takaful.py'), [
    ("'This explains the insurance maths in plain words, with the numbers the operators will see. The cover is '",
     "'This explains the insurance maths, with the numbers the operators will see. The cover is '"),
    ("'candidate is Pak-Qatar General Takaful and not Pak-Qatar Family Takaful'],", "'candidate is Pak-Qatar General Takaful'],"),
])
patch(os.path.join(SP, 'pack', 'conv_existing.py'), [
    ("fl = edit(fl, FL, 'FL')",
     "FL.append((row('Policy summary', 'The finished configuration is restated in plain words for confirmation.'),\n"
     "           row('Policy summary', 'The finished configuration is restated in full for the host to confirm.')))\n"
     "fl = edit(fl, FL, 'FL')"),
])
patch(os.path.join(SP, 'out', 'reg_rev5.py'), [
    ("        it = (it[0].replace(' — ', ': '),) + tuple(it[1:])",
     "        it = (re.sub(r'\\bHYPER\\b', 'Hyper', it[0].replace(' — ', ': ')),) + tuple(it[1:])"),
])
patch(os.path.join(SP, 'out', 'map_hyper.py'), [
    ("        'A member who collects on day t and stops owes 300 x (50 - t)',",
     "        'A member who collects on day t and stops owes 300 \u00d7 (50 \u2212 t)',"),
])
deck = r'D:\HALQA SIGMA APP\docs\build-master-deck-0925.py'
s = io.open(deck, encoding='utf-8').read()
a = "   DATE + '   \u00b7   Prepared for the chairman   \u00b7   Internal and counterparty use',"
assert s.count(a) == 1, 'deck cover line'
s = s.replace(a, "   DATE,")
s = s.replace('Hyper Committee, revision 6,', 'Hyper Committee (HQ-CP-08),')
assert 'revision 6' not in s and 'Prepared for' not in s
io.open(deck, 'w', encoding='utf-8').write(s)
print('patched deck')

# superseded outputs leave the build folder for the archive
arch = os.path.join(SP, 'out', 'bak0924', 'superseded-0925')
os.makedirs(arch, exist_ok=True)
for base in ('Asset Committee Structure', 'Turn Exchange Lawful Options'):
    for f in os.listdir(os.path.join(SP, 'pack', 'out', 'partnership')):
        if f.startswith(base):
            shutil.move(os.path.join(SP, 'pack', 'out', 'partnership', f), os.path.join(arch, f))
            print('archived', f)
