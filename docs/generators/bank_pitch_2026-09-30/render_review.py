# -*- coding: utf-8 -*-
"""Render a deck to PDF through PowerPoint, rasterise every page and build contact sheets for review.
Usage: python render_review.py out/mashreq.pptx m   (prefix for the page images)"""
import os, sys, subprocess
import pymupdf
from PIL import Image

ME = os.path.dirname(os.path.abspath(__file__))
RENDER = os.path.abspath(os.path.join(ME, '..', 'complete_position_2026-09-29', 'deck', 'render.ps1'))
src = os.path.abspath(sys.argv[1])
pre = sys.argv[2] if len(sys.argv) > 2 else 'p'
pdf = os.path.splitext(src)[0] + '.pdf'
if '--no-render' not in sys.argv:
    subprocess.run(['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', RENDER, '-In', src, '-Out', pdf],
                   check=True)
out = os.path.dirname(src)
doc = pymupdf.open(pdf)
pages = []
for i, pg in enumerate(doc, 1):
    pix = pg.get_pixmap(dpi=110)
    fn = os.path.join(out, '%s_%02d.png' % (pre, i))
    pix.save(fn)
    pages.append(fn)
per, cols = 4, 2
for k in range(0, len(pages), per):
    ims = [Image.open(f) for f in pages[k:k + per]]
    w, h = ims[0].size
    sheet = Image.new('RGB', (cols * w + (cols + 1) * 12, 2 * h + 3 * 12), (120, 120, 120))
    for j, im in enumerate(ims):
        sheet.paste(im, (12 + (j % cols) * (w + 12), 12 + (j // cols) * (h + 12)))
    sheet.save(os.path.join(out, '%ssheet_%d.png' % (pre, k // per + 1)))
print('pages', len(pages), 'pdf', pdf)
