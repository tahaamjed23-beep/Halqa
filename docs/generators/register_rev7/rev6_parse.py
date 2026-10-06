# -*- coding: utf-8 -*-
"""Read the 28 September 2026 register (revision 6, 1,039 items) from its markdown and return it as structured data:
sections, subsections, preambles and items with their text, location and status, keyed by their old number."""
import io, os, re

SRC = (r'C:\Users\admin\AppData\Local\Temp\claude\D--HALQA-SIGMA-APP-HANDOVER\d2da94bb-8cec-46ca-82d6-3e3b1556f8c9'
       r'\scratchpad\out\WORK-REGISTER-rev6.md')
LOCAL = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'WORK-REGISTER-rev6.md')


def load():
    path = LOCAL if os.path.exists(LOCAL) else SRC
    lines = io.open(path, encoding='utf-8').read().splitlines()
    sections = []
    cur_sec = cur_sub = None
    pending_para = []
    for ln in lines:
        if ln.startswith('## Status by Section'):
            break
        m = re.match(r'^## ([A-Z])\. (.+)$', ln)
        if m:
            cur_sec = dict(code=m.group(1), title=m.group(2), preamble='', subs=[])
            sections.append(cur_sec)
            cur_sub = dict(code='', title='', preamble='', items=[])
            cur_sec['subs'].append(cur_sub)
            continue
        m = re.match(r'^### ([A-Z]\d+)\. (.+)$', ln)
        if m and cur_sec:
            cur_sub = dict(code=m.group(1), title=m.group(2), preamble='', items=[])
            cur_sec['subs'].append(cur_sub)
            continue
        m = re.match(r'^\| (\d+) \| (.*) \| (.*) \| (Done|Partly done|Open) \|$', ln)
        if m and cur_sub is not None:
            cur_sub['items'].append(dict(old=int(m.group(1)), text=m.group(2).strip(), where=m.group(3).strip(),
                                         status=m.group(4)))
            continue
        if cur_sec and ln.strip() and not ln.startswith('|') and not ln.startswith('#'):
            if not cur_sub['items'] and cur_sub['code'] == '' and not cur_sec['preamble']:
                cur_sec['preamble'] = ln.strip()
            elif not cur_sub['items'] and cur_sub['code']:
                cur_sub['preamble'] = ln.strip()
    for s in sections:
        s['subs'] = [u for u in s['subs'] if u['items'] or u['code']]
    return sections


if __name__ == '__main__':
    secs = load()
    n = sum(len(u['items']) for s in secs for u in s['subs'])
    print('sections', len(secs), 'items', n)
    for s in secs:
        print(s['code'], s['title'], sum(len(u['items']) for u in s['subs']), [u['code'] for u in s['subs'] if u['code']])
