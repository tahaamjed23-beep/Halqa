# -*- coding: utf-8 -*-
"""Work register of 5 October 2026: build, check and write.

Loads the register of 28 September (1,039 items), applies the rewrites forced by the chairman's decisions since then,
gives every item an owner, a priority and an effort, appends sections AA to AP from the ten passes, numbers the items
(the old items keep their numbers 1 to 1,039), plans the phases and milestones, and writes JSON, Markdown, HTML and PDF."""
import io, json, os, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import rev6_parse, rev6_map, corrections, phases
import s_regulatory, s_screens, s_fields, s_api, s_data, s_integrations, s_notifications, s_tests, s_security
import s_corporate, s_eligibility

OUT = os.path.join(HERE, 'out')
BANNED = ('—', '–', '‒', '―', 'Amjed', 'Akif', 'Kazi', 'Shahid', 'Pak-Qatar', 'Salaam Takaful',
          'not Shariah compliant', 'Mr ')


def build_all():
    secs = rev6_parse.load()
    seen_old = set()
    for s in secs:
        s['loop'] = 0
        if s['code'] in corrections.SECTION_TITLES:
            s['title'] = corrections.SECTION_TITLES[s['code']]
        if s['code'] in corrections.PREAMBLES:
            s['preamble'] = corrections.PREAMBLES[s['code']]
        for u in s['subs']:
            if u['code'] in corrections.SUB_TITLES:
                u['title'] = corrections.SUB_TITLES[u['code']]
            new_items = []
            for it in u['items']:
                n = it['old']
                seen_old.add(n)
                text, where, status = it['text'], it['where'], it['status']
                rewritten = n in corrections.REWRITE
                if rewritten:
                    t2, w2, s2 = corrections.REWRITE[n]
                    text = t2
                    where = w2 if w2 is not None else where
                    status = s2 if s2 is not None else status
                text = re.sub(r'\bHYPER\b', 'Hyper', text)
                new_items.append(dict(n=n, text=text, where=where, status=status, rewritten=rewritten,
                                      owner=rev6_map.owner_of(it), pri=rev6_map.pri_of(s['code'], u['code'], it),
                                      eff=rev6_map.eff_of(it)))
            u['items'] = new_items
    assert seen_old == set(range(1, 1040)), 'old numbering broken'
    missing = set(corrections.REWRITE) - seen_old
    assert not missing, missing
    new = [corrections.decisions_section(), s_regulatory.build(), s_screens.build(), s_fields.build(), s_api.build(),
           s_data.build(), s_integrations.build(), s_notifications.build(), s_tests.build()]
    new += s_security.build() + s_corporate.build() + [s_eligibility.build()]
    n = 1039
    for s in new:
        for u in s['subs']:
            for it in u['items']:
                n += 1
                it['n'] = n
                it['rewritten'] = False
    secs += new
    items = []
    for s in secs:
        for u in s['subs']:
            for it in u['items']:
                it['sec'] = s['code']
                it['sub'] = u['code']
                it['subtitle'] = u['title']
                items.append(it)
    items.sort(key=lambda it: it['n'])
    assert [it['n'] for it in items] == list(range(1, len(items) + 1))
    for it in items:
        for b in BANNED:
            assert b not in it['text'], (b, it['n'], it['text'])
        assert ' - ' not in it['text'], (it['n'], it['text'])
    # Statuses changed after 5 October are kept in status_updates.json as {"item text": "Done"}, keyed by the text so
    # that renumbering never moves a status to the wrong item.
    upd_path = os.path.join(HERE, 'status_updates.json')
    if os.path.exists(upd_path):
        upd = json.loads(io.open(upd_path, encoding='utf-8').read())
        by_text = {}
        for it in items:
            by_text.setdefault(it['text'], []).append(it)
        for text, status in upd.items():
            assert status in ('Done', 'Partly done', 'Open'), status
            assert text in by_text, 'status update matches no item: ' + text[:80]
            for it in by_text[text]:
                it['status'] = status
    ph, ms = phases.plan(items)
    return secs, items, ph, ms


def main():
    secs, items, ph, ms = build_all()
    os.makedirs(OUT, exist_ok=True)
    import render
    data = dict(sections=[dict(code=s['code'], title=s['title'], preamble=s['preamble'], loop=s.get('loop', 0),
                               subs=[dict(code=u['code'], title=u['title'], preamble=u['preamble'],
                                          items=[{k: it[k] for k in ('n', 'text', 'where', 'owner', 'pri', 'eff',
                                                                     'phase', 'gate', 'status')}
                                                 for it in u['items']]) for u in s['subs']]) for s in secs],
                phases=[dict(n=p['n'], title=p['title'], block=p['block'], gate=p['gate'], points=p['points'],
                             items=[it['n'] for it in p['items']], scope=p['scope'], checks=p['checks'])
                        for p in ph],
                milestones={m: [it['n'] for it in v] for m, v in ms.items()})
    io.open(os.path.join(OUT, 'work_register.json'), 'w', encoding='utf-8').write(json.dumps(data, ensure_ascii=False,
                                                                                             indent=1))
    md = render.markdown(secs, items, ph, ms)
    io.open(os.path.join(OUT, 'WORK-REGISTER.md'), 'w', encoding='utf-8').write(md)
    page = render.html(secs, items, ph, ms)
    html_path = os.path.join(OUT, 'Work Register.html')
    io.open(html_path, 'w', encoding='utf-8').write(page)
    pdf = os.path.join(OUT, 'Work Register.pdf')
    if '--no-pdf' not in sys.argv:
        render.pdf(html_path, pdf)
    total = len(items)
    st = {k: sum(1 for it in items if it['status'] == k) for k in ('Done', 'Partly done', 'Open')}
    claude_open = sum(1 for it in items if it['owner'] == 'Claude' and it['status'] != 'Done')
    print('items %d  done %d  partly %d  open %d  claude open %d  phases %d' % (total, st['Done'], st['Partly done'],
                                                                              st['Open'], claude_open, len(ph)))
    if os.path.exists(pdf) and '--no-pdf' not in sys.argv:
        import pymupdf
        with pymupdf.open(pdf) as d:
            print('pages', d.page_count)


if __name__ == '__main__':
    main()
