# -*- coding: utf-8 -*-
"""Halqa document template: plain, formal, black and white, printed to PDF by Chrome.

The logo sits at the top right of every page. Below the title is one line giving the reference and
the date. Headings are numbered nouns, tables are ruled in black, and the footer carries the title and
the page count. Figures, where a document has them, are numbered and are the only use of colour.
"""
import html as H
import io
import os
import re
import subprocess
import sys

import headings

HERE = os.path.dirname(os.path.abspath(__file__))
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
LOGO = 'file:///' + os.path.join(HERE, 'logo-lockup.png').replace('\\', '/')
DATE = '25 September 2026'
UNMAPPED = []

CSS = r"""
@page{size:A4;margin:14mm 19mm 18mm 19mm;
  @bottom-left{content:"%(foot)s";font:8pt Calibri,Arial,sans-serif;color:#000;vertical-align:top;padding-top:4mm}
  @bottom-right{content:"Page " counter(page) " of " counter(pages);font:8pt Calibri,Arial,sans-serif;color:#000;vertical-align:top;padding-top:4mm}}
html{-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font:10.5pt/1.45 Calibri,Arial,sans-serif;color:#000;margin:0}
table.frame{width:100%%;border-collapse:collapse;margin:0}table.frame>thead>tr>td,table.frame>tbody>tr>td{padding:0;border:0}
.run{height:9mm;text-align:right;margin-bottom:4mm}
.run img{height:8mm}
h1{font-size:17pt;line-height:1.2;font-weight:700;margin:0 0 1.2mm}
.sub{font-size:10.5pt;margin:0 0 1.2mm}
.meta{font-size:9pt;margin:0 0 3mm}
hr.rule{border:0;border-top:0.6pt solid #000;margin:0 0 5mm}
h2{font-size:12pt;font-weight:700;margin:6mm 0 2mm;break-after:avoid;page-break-after:avoid}
h3{font-size:10.5pt;font-weight:700;margin:4mm 0 1.4mm;break-after:avoid;page-break-after:avoid}
p{margin:0 0 2.4mm}
ul,ol{margin:0 0 3mm;padding-left:6mm}
li{margin:0 0 1.2mm}
table.t{border-collapse:collapse;width:100%%;margin:1.5mm 0 4mm;break-inside:auto}
table.t tr{break-inside:avoid;page-break-inside:avoid}
table.t th{font-weight:700;font-size:9pt;text-align:left;padding:1.3mm 1.8mm;border:0.5pt solid #000;background:#fff}
table.t td{font-size:9pt;padding:1.3mm 1.8mm;border:0.5pt solid #000;vertical-align:top}
table.t td.n,table.t th.n{text-align:right;white-space:nowrap}
.quote{margin:1.5mm 0 3mm 6mm;padding:0 0 0 3mm;border-left:0.75pt solid #000;font-size:9.5pt;break-inside:avoid}
.quote .src{display:block;margin-top:1mm;font-size:8pt}
.quote p{margin:0 0 1.2mm}
.formula{font-family:"Cambria Math",Cambria,"Times New Roman",serif;font-size:11pt;margin:1.5mm 0 3mm 6mm;break-inside:avoid}
.formula .lab{font-family:Calibri,Arial,sans-serif;font-size:8.5pt;display:block;margin-bottom:.6mm}
.note{font-size:8.5pt}
.summary{margin-top:6mm;break-inside:avoid;page-break-inside:avoid}
.summary h2{margin:0 0 2mm}
.term{font-weight:700}
.kv{display:grid;grid-template-columns:repeat(4,1fr);gap:2.4mm;margin:1mm 0 4mm}
.kv div{border:0.5pt solid #000;padding:2mm 2.4mm}
.kv b{display:block;font-size:12pt}
.kv span{font-size:8.5pt}
figure{margin:2mm 0 4mm;break-inside:avoid;page-break-inside:avoid;text-align:center}
figure img{max-width:100%%}
figcaption{font-size:8.5pt;text-align:left;margin-top:1mm}
.pb{break-before:page;page-break-before:always}
.ref{white-space:nowrap}
"""

COMPACT = """
@page{margin:10mm 16mm 15mm 16mm}
body{font-size:9.5pt;line-height:1.36}
h1{font-size:15pt;margin:0 0 1mm}
.sub{font-size:9.5pt;margin:0 0 1mm}
.meta{margin:0 0 2mm}
hr.rule{margin:0 0 3mm}
h2{font-size:11pt;margin:3.5mm 0 1.4mm}
p{margin:0 0 1.6mm}
ul{margin:0 0 1.8mm}
li{margin:0 0 .8mm}
table.t{margin:1mm 0 2.4mm}
table.t th{font-size:8.5pt;padding:1mm 1.6mm}
table.t td{font-size:8.5pt;padding:1mm 1.6mm}
.quote{margin:.6mm 0 2mm 5mm;font-size:8.8pt}
.summary{margin-top:3mm}
.run{margin-bottom:2mm}
"""


def esc(s):
    return H.escape(s, quote=False)


def para(t):
    return '<p>%s</p>' % t


def bullets(items):
    return '<ul>' + ''.join('<li>%s</li>' % i for i in items) + '</ul>'


def steps(items):
    return '<ol>' + ''.join('<li>%s</li>' % i for i in items) + '</ol>'


def table(rows, numeric=(), head=True, widths=None):
    out = ['<table class="t">']
    if widths:
        out.append('<colgroup>' + ''.join('<col style="width:%s">' % w for w in widths) + '</colgroup>')
    for i, r in enumerate(rows):
        tag = 'th' if (head and i == 0) else 'td'
        cells = []
        for j, c in enumerate(r):
            cls = ' class="n"' if j in numeric else ''
            cells.append('<%s%s>%s</%s>' % (tag, cls, c, tag))
        row = '<tr>' + ''.join(cells) + '</tr>'
        if head and i == 0:
            row = '<thead>' + row + '</thead><tbody>'
        out.append(row)
    if head and rows:
        out.append('</tbody>')
    out.append('</table>')
    return ''.join(out)


def quote(text, source):
    return '<div class="quote">&ldquo;%s&rdquo;<span class="src">%s</span></div>' % (text, source)


def formula(expr, label=''):
    lab = '<span class="lab">%s</span>' % label if label else ''
    return '<div class="formula">%s%s</div>' % (lab, expr)


def keyfigs(pairs):
    return '<div class="kv">' + ''.join('<div><b>%s</b><span>%s</span></div>' % p for p in pairs) + '</div>'


def figure(png_path, caption, width='100%'):
    src = 'file:///' + os.path.abspath(png_path).replace('\\', '/')
    return ('<figure><img src="%s" style="width:%s" alt=""><figcaption>Figure @@FIG@@. %s</figcaption></figure>'
            % (src, width, caption))


def summary(text, title='Summary'):
    return '<div class="summary"><h2>%s</h2><p>%s</p></div>' % (title, text)


def _number_figures(body):
    n = [0]

    def nxt(_):
        n[0] += 1
        return str(n[0])
    return re.sub(r'@@FIG@@', nxt, body)


def render(path_pdf, title, subtitle, ref, audience=None, body='', classification=None,
           version=None, date=DATE, prepared=None, running=None, compact=False):
    css = CSS % {'foot': ('Halqa, ' + H.unescape(re.sub(r'<[^>]+>', '', title))).replace('"', "'")} + (COMPACT if compact else '')
    meta = 'Reference %s. %s.' % (ref, date)
    found = []
    body = headings.apply(title, body, found)
    for t, h in found:
        UNMAPPED.append((t, h))
        sys.stderr.write('HEADING NOT MAPPED [%s]: %s' % (t, h) + chr(10))
    body = _number_figures(body)
    body = re.sub(r'(?<![\w-])(HQ-[A-Z]{2}-\d{2})(?![\w-])', r'<span class="ref">\1</span>', body)
    page = ('<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>%s</title><style>%s</style></head><body>'
            '<table class="frame"><thead><tr><td><div class="run"><img src="%s" alt="Halqa"></div></td></tr></thead>'
            '<tbody><tr><td><h1>%s</h1><p class="sub">%s</p><p class="meta">%s</p><hr class="rule">%s</td></tr></tbody></table>'
            '</body></html>' % (esc(H.unescape(re.sub(r'<[^>]+>', '', title))), css, LOGO, title, subtitle, meta, body))
    html_path = path_pdf[:-4] + '.html'
    io.open(html_path, 'w', encoding='utf-8').write(page)
    if os.path.exists(path_pdf):
        os.remove(path_pdf)
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--allow-file-access-from-files',
                    '--virtual-time-budget=8000', '--print-to-pdf=' + path_pdf,
                    'file:///' + html_path.replace('\\', '/')], capture_output=True, timeout=240)
    return page


def pdf_pages(path_pdf):
    import pymupdf
    with pymupdf.open(path_pdf) as d:
        return d.page_count


def text_of(page_html):
    t = re.sub(r'<style.*?</style>|<title.*?</title>', ' ', page_html, flags=re.S)
    return re.sub(r'\s+', ' ', H.unescape(re.sub(r'<[^>]+>', ' ', t))).strip()
