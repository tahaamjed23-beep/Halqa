# -*- coding: utf-8 -*-
"""Render PDF pages to PNG for visual checking. Usage: pages.py file.pdf outprefix [zoom] [pages]"""
import sys
import fitz

pdf, prefix = sys.argv[1], sys.argv[2]
zoom = float(sys.argv[3]) if len(sys.argv) > 3 else 1.0
want = None
if len(sys.argv) > 4:
    want = set(int(p) for p in sys.argv[4].split(','))
doc = fitz.open(pdf)
print('pages', doc.page_count)
for i, page in enumerate(doc, 1):
    if want and i not in want:
        continue
    pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
    pix.save('%s-%02d.png' % (prefix, i))
