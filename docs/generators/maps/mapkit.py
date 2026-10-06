"""Shared drawing kit for the Halqa map set."""
import io, os, re, subprocess, sys

INK, INK2, INK3 = '#0C1408', '#3A4633', '#6F7B68'
RULE, PANEL, GROUND = '#E3E9DC', '#FFFFFF', '#F5F7F2'
GOLD, PINE = '#6DC72A', '#3F7D18'   # accent lime, deep lime
NL = chr(10)

CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
HERE = os.path.dirname(os.path.abspath(__file__))


def esc(s):
    s = (s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
          .replace('\u2019', '&#8217;').replace('\u2018', '&#8216;')
          .replace('\u2014', '&#8212;').replace('\u2013', '&#8211;')
          .replace('\u2264', '&#8804;').replace('\u00d7', '&#215;')
          .replace('\u2248', '&#8776;').replace('\u2192', '&#8594;'))
    return s


def logo(x, y, scale=1.0):
    """The register mark and wordmark, drawn to sit on the page ground."""
    s = scale
    out = ['<g transform="translate(%.1f,%.1f) scale(%.3f)">' % (x, y, s)]
    spokes = [(50, 16, 50, 30), (68.6, 20.1, 61.5, 32.4), (82.2, 34, 69.9, 41.1),
              (86.5, 52, 72.5, 52), (82.2, 70, 69.9, 62.9), (68.6, 83.9, 61.5, 71.6),
              (50, 88, 50, 74), (31.4, 83.9, 38.5, 71.6), (17.8, 70, 30.1, 62.9)]
    out.append('<g transform="translate(-2,-2) scale(0.56)" stroke="%s" stroke-width="7" '
               'stroke-linecap="round">' % PINE)
    for a, b, c, d in spokes:
        out.append('<line x1="%s" y1="%s" x2="%s" y2="%s"/>' % (a, b, c, d))
    out.append('</g>')
    out.append('<line transform="translate(-2,-2) scale(0.56)" x1="14" y1="52" x2="34" y2="52" '
               'stroke="%s" stroke-width="9" stroke-linecap="round"/>' % GOLD)
    out.append('<text x="62" y="38" font-size="23" font-weight="600" letter-spacing="2.5" '
               'fill="%s">HALQA</text>' % PINE)
    out.append('</g>')
    return NL.join(out)


def keyfigure(x, y, w, h, col, figure, caption, note=''):
    """A large figure panel, for the facts that should read from across a room."""
    o = ['<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.4"/>'
         % (x, y, w, h, PANEL, col),
         '<rect x="%d" y="%d" width="4" height="%d" fill="%s"/>' % (x, y, h, col)]
    o.append('<text x="%d" y="%d" font-size="34" font-weight="600" fill="%s">%s</text>'
             % (x + 20, y + 46, col, esc(figure)))
    o.append('<text x="%d" y="%d" font-size="12.5" fill="%s">%s</text>'
             % (x + 20, y + 68, INK, esc(caption)))
    if note:
        o.append('<text x="%d" y="%d" font-size="11" fill="%s">%s</text>'
                 % (x + 20, y + 86, INK2, esc(note)))
    return NL.join(o)


def head(title, sub, w, families=None, rev='Rev 1', date='25 September 2026'):
    """Title block on the left, logo on the right, legend beneath."""
    o = ['<text x="40" y="44" font-size="26" font-weight="600" fill="%s">%s</text>' % (INK, esc(title))]
    o.append('<text x="40" y="70" font-size="13" fill="%s">%s</text>' % (INK2, esc(sub)))
    o.append('<text x="40" y="92" font-size="10" font-family="IBM Plex Mono, monospace" '
             'letter-spacing="1.1" fill="%s">%s</text>' % (INK3, esc((rev + '  ' + date).upper())))
    o.append(logo(w - 236, 24, 1.2))
    if families:
        lx = 40
        for col, label in families:
            o.append('<rect x="%d" y="112" width="9" height="9" fill="%s"/>' % (lx, col))
            o.append('<text x="%d" y="121" font-size="11.5" fill="%s">%s</text>' % (lx + 15, INK2, esc(label)))
            lx += 24 + int(len(label) * 6.5)
    return '\n'.join(o)


def cluster(x, y, w, col, title, sub, items, item_size=12, lh=25):
    h = 46 + len(items) * lh + 14
    o = ['<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="1.2"/>'
         % (x, y, w, h, PANEL, col),
         '<rect x="%d" y="%d" width="%d" height="4" fill="%s"/>' % (x, y, w, col),
         '<text x="%d" y="%d" font-size="15" font-weight="600" fill="%s">%s</text>' % (x + 16, y + 28, col, esc(title)),
         '<text x="%d" y="%d" font-size="10" font-family="IBM Plex Mono, monospace" '
         'letter-spacing="0.6" fill="%s">%s</text>' % (x + 16, y + 44, INK3, esc(sub.upper()))]
    for i, it in enumerate(items):
        yy = y + 46 + lh * i + 16
        o.append('<rect x="%d" y="%d" width="5" height="5" fill="%s"/>' % (x + 16, yy - 5, col))
        o.append('<text x="%d" y="%d" font-size="%s" fill="%s">%s</text>' % (x + 30, yy, item_size, INK, esc(it)))
    return '\n'.join(o), h


def box(x, y, w, h, title, lines, col=None, strong=False, title_size=16):
    col = col or INK
    o = ['<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="%s"/>'
         % (x, y, w, h, PANEL, col, '2.4' if strong else '1.5')]
    o.append('<text x="%d" y="%d" text-anchor="middle" font-size="%s" font-weight="600" fill="%s">%s</text>'
             % (x + w // 2, y + 28, title_size, col, esc(title)))
    for i, ln in enumerate(lines):
        o.append('<text x="%d" y="%d" text-anchor="middle" font-size="11.5" fill="%s">%s</text>'
                 % (x + w // 2, y + 48 + i * 17, INK2, esc(ln)))
    return '\n'.join(o)


def arrow(d, col=None, width=1.6, dashed=False, marker='m'):
    col = col or INK
    dash = ' stroke-dasharray="6 4"' if dashed else ''
    return ('<path d="%s" fill="none" stroke="%s" stroke-width="%s"%s marker-end="url(#%s)"/>'
            % (d, col, width, dash, marker))


def line(d, col=None, width=1.2, dashed=False):
    col = col or INK2
    dash = ' stroke-dasharray="6 4"' if dashed else ''
    return '<path d="%s" fill="none" stroke="%s" stroke-width="%s"%s/>' % (d, col, width, dash)


def label(x, y, text, size=11.5, col=None, anchor='start', mono=False, weight=None):
    col = col or INK
    f = ' font-family="IBM Plex Mono, monospace" letter-spacing="0.5"' if mono else ''
    wt = ' font-weight="%s"' % weight if weight else ''
    return ('<text x="%s" y="%s" text-anchor="%s" font-size="%s" fill="%s"%s%s>%s</text>'
            % (x, y, anchor, size, col, f, wt, esc(text)))


def numbered(cx, cy, n):
    return ('<circle cx="%s" cy="%s" r="11" fill="%s" stroke="%s" stroke-width="1.3"/>'
            '<text x="%s" y="%s" text-anchor="middle" font-size="12" font-weight="600" fill="%s">%s</text>'
            % (cx, cy, PANEL, INK, cx, cy + 4, INK, n))


MARKERS = ''.join(
    '<marker id="%s" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" '
    'orient="auto-start-reverse"><polygon points="0,1 9,5 0,9" fill="%s"/></marker>' % (i, c)
    for i, c in [('m', INK), ('mg', GOLD), ('mp', PINE), ('m2', INK2)])


def build(name, w, h, body, png_name=None, aria='Halqa diagram'):
    svg = ('<svg viewBox="0 0 %d %d" role="img" aria-label="%s">\n<defs>%s</defs>\n%s\n</svg>'
           % (w, h, esc(aria), MARKERS, body))
    page = ("""<!DOCTYPE html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>html,body{margin:0;padding:0;background:%s;width:%dpx}
svg{display:block;width:%dpx;height:%dpx}
text{font-family:'IBM Plex Sans',system-ui,sans-serif}</style></head><body>%s</body></html>"""
            % (GROUND, w, w, h, svg))
    src = os.path.join(HERE, name + '.render.html')
    io.open(src, 'w', encoding='utf-8').write(page)
    out = os.path.join(HERE, (png_name or name) + '.png')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                    '--force-device-scale-factor=2', '--window-size=%d,%d' % (w, h),
                    '--virtual-time-budget=9000', '--screenshot=' + out,
                    'file:///' + src.replace('\\', '/')],
                   capture_output=True, timeout=240)
    print('%-34s %s  %d x %d' % (name, 'ok' if os.path.exists(out) else 'FAILED', w, h))
    return svg
