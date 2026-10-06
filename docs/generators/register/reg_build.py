# -*- coding: utf-8 -*-
"""Render the work register to markdown: one number sequence, a status column,
and optional sub-parts inside a section (a ('§', heading, preamble) tuple)."""
import io, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import reg_a, reg_b, reg_c

NL = chr(10)
SECTIONS = [reg_a.A, reg_a.B, reg_c.C, reg_a.D] + reg_b.SECTIONS_2
STATUS_BY_SECTION = {'A': reg_c.STATUS_A, 'B': reg_c.STATUS_B}


def items_of(sec):
    return [x for x in sec[3] if x[0] != reg_c.S]


def status_of(letter, pos, item):
    if len(item) > 2:
        return item[2]
    return STATUS_BY_SECTION.get(letter, {}).get(pos, 'Open')


counts = {}
for sec in SECTIONS:
    c = {'Done': 0, 'Partly done': 0, 'Open': 0}
    for pos, it in enumerate(items_of(sec), 1):
        c[status_of(sec[0], pos, it)] += 1
    counts[sec[0]] = c

total = sum(len(items_of(s)) for s in SECTIONS)
done = sum(c['Done'] for c in counts.values())
part = sum(c['Partly done'] for c in counts.values())
ui = sum(len(items_of(s)) for s in SECTIONS[:3])

out = []
w = out.append
w("# Halqa " + chr(8212) + " Work Register to Operational at 100,000 Users")
w("")
w("24 September 2026, revision 3. %d items: %d done, %d partly done, %d open." % (total, done, part, total - done - part))
w("")
w("## Scope note")
w("")
w("Revision 3 rewrites section C after an audit of every screen in the running application on "
  "24 September 2026. The audit found that the look of the application is the smaller problem. Four "
  "screens crash on open, nine screens show product terms the Statutory Position of 23 September "
  "says Halqa no longer offers, the live sign-in page at halqa-seven.vercel.app prints a demo account's password, and sign-up "
  "takes ten steps. Section C now covers every screen, sign up and sign in redesigned from nothing, "
  "and the rules that apply to all of them.")
w("")
w("Order of work: A and B are nearly finished; C3 and C4 come next, then C1 and C2, then the rest "
  "of C. Every status below was confirmed by opening the screen, not taken from the code.")
w("")
w("Sections A to D concern the interface, %d items. Sections E to R concern everything else." % (
  ui + len(items_of(reg_a.D))))
w("")

n = 0
for letter, title, preamble, items in SECTIONS:
    w("## " + letter + ". " + title)
    w("")
    if preamble:
        w(preamble); w("")
    table_open = False
    pos = 0
    for it in items:
        if it[0] == reg_c.S:
            if table_open:
                w(""); table_open = False
            w("### " + it[1]); w("")
            if it[2]:
                w(it[2]); w("")
            continue
        if not table_open:
            w("|  |  |  |  |")
            w("| :-: | :-: | :-: | :-: |")
            w("| # | Item | Location | Status |")
            table_open = True
        n += 1; pos += 1
        w("| %d | %s | %s | %s |" % (n, it[0], it[1], status_of(letter, pos, it)))
    w("")

w("## Summary")
w("")
w("|  |  |  |  |  |")
w("| :-: | :-: | :-: | :-: | :-: |")
w("| Section | Items | Done | Partly done | Open |")
for sec in SECTIONS:
    c = counts[sec[0]]
    w("| %s. %s | %d | %d | %d | %d |" % (sec[0], sec[1], len(items_of(sec)), c['Done'], c['Partly done'], c['Open']))
w("| Total | %d | %d | %d | %d |" % (total, done, part, total - done - part))

md = NL.join(out)
io.open('WORK-REGISTER.md', 'w', encoding='utf-8').write(md)
print('items %d  done %d  partly %d  open %d  chars %d' % (total, done, part, total - done - part, len(md)))
for sec in SECTIONS:
    c = counts[sec[0]]
    print('  %s  %-52s %3d   done %2d  part %2d  open %3d' % (sec[0], sec[1][:52], len(items_of(sec)), c['Done'], c['Partly done'], c['Open']))
