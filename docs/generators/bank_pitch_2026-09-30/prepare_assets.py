# -*- coding: utf-8 -*-
"""Clean logo and icon files for version 6, taken from the chairman's edited Mashreq deck (user_media, with the
crops he applied in Google Slides), his person icon, and the Raqami equivalents built from Raqami's own logo."""
import os
from PIL import Image, ImageDraw

ME = os.path.dirname(os.path.abspath(__file__))
UM = os.path.join(ME, 'user_media')
OUT = os.path.join(UM, 'clean')
os.makedirs(OUT, exist_ok=True)
LOGOS = os.path.abspath(os.path.join(ME, '..', 'complete_position_2026-09-29', 'logos'))
DECK = os.path.abspath(os.path.join(ME, '..', 'complete_position_2026-09-29', 'deck'))
PERSON_SRC = (r'C:\Users\admin\AppData\Local\Temp\claude\D--HALQA-SIGMA-APP-HANDOVER'
              r'\8c8e8bbf-742a-40ec-a3e8-d899275ccafd\images\1.png')


def crop(src, dst, l=0, t=0, r=0, b=0, trim=True):
    im = Image.open(os.path.join(UM, src)).convert('RGBA')
    W, H = im.size
    im = im.crop((int(W * l / 100000.0), int(H * t / 100000.0), W - int(W * r / 100000.0), H - int(H * b / 100000.0)))
    if trim:
        im = trim_white(im)
    im.save(os.path.join(OUT, dst))
    return im


def trim_white(im, tol=245):
    px = im.load()
    W, H = im.size
    xs, ys = [], []
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]
            if a > 20 and not (r > tol and g > tol and b > tol):
                xs.append(x)
                ys.append(y)
    if not xs:
        return im
    return im.crop((max(0, min(xs) - 2), max(0, min(ys) - 2), min(W, max(xs) + 3), min(H, max(ys) + 3)))


def white_to_alpha(im, tol=235):
    im = im.convert('RGBA')
    px = im.load()
    for y in range(im.size[1]):
        for x in range(im.size[0]):
            r, g, b, a = px[x, y]
            if r > tol and g > tol and b > tol:
                px[x, y] = (255, 255, 255, 0)
    return im


# Mashreq and shared logos, with the chairman's crops (srcRect values in 1/1000 per cent)
crop('3c95d75248.png', 'halqa_lockup.png', trim=False)
crop('0639da7ff2.png', 'mashreq_logo.png')
crop('49960482d1.png', 'mashreq_icon.png', 13394, 22831, 9807, 22127, trim=False)
crop('fd5c0b4dea.png', 'neo_icon.png', trim=False)
crop('c409420951.png', 'tasdeeq_wide.png')
crop('cddebb5fa0.png', 'tasdeeq_word.png', 15421, 38546, 15144, 41570)
crop('039fa116ab.png', 'oraan.png', 0, 0, 0, 25273)
crop('0b3a19cdb9.png', 'jc_committee.png', 22356, 17457, 21204, 72579, trim=False)
crop('6ce4c664bc.png', 'jc_icon.png', 19545, 26002, 15044, 22161)
crop('d6e59413c6.png', 'moneyfellows.png')
crop('f39501055f.png', 'hakbah.png', 0, 17420, 0, 29227)
crop('eb08237ace.png', 'esusu.png', trim=False)
crop('c25abeb0db.png', 'duo_mashreq.png')

# person icon from the chairman's image: white made transparent, trimmed
p = trim_white(white_to_alpha(Image.open(PERSON_SRC)))
p.save(os.path.join(OUT, 'person.png'))

# Raqami: the emblem (left square of the logo) as the app icon, and a Halqa plus Raqami lockup
rq = Image.open(os.path.join(LOGOS, 'raqami-logo-colour.png')).convert('RGBA')
W, H = rq.size
emb = trim_white(rq.crop((0, 0, int(H * 1.02), H)))
emb.save(os.path.join(OUT, 'raqami_icon.png'))
tile = Image.new('RGBA', (400, 400), (255, 255, 255, 0))
d = ImageDraw.Draw(tile)
d.rounded_rectangle((0, 0, 399, 399), radius=84, fill=(244, 241, 251, 255))
e2 = emb.copy()
e2.thumbnail((290, 290), Image.LANCZOS)
tile.paste(e2, ((400 - e2.width) // 2, (400 - e2.height) // 2), e2)
tile.save(os.path.join(OUT, 'raqami_app_icon.png'))
trim_white(rq).save(os.path.join(OUT, 'raqami_logo.png'))
hq = Image.open(os.path.join(DECK, 'lockup-520.png')).convert('RGBA')
Hh = 300
hq2 = hq.resize((int(hq.width * 120.0 / hq.height), 120), Image.LANCZOS)
rq2 = trim_white(rq)
rq2 = rq2.resize((int(rq2.width * 230.0 / rq2.height), 230), Image.LANCZOS)
gap = 60
duo = Image.new('RGBA', (hq2.width + gap * 2 + 4 + rq2.width, Hh), (255, 255, 255, 0))
duo.paste(hq2, (0, (Hh - hq2.height) // 2), hq2)
ImageDraw.Draw(duo).rectangle((hq2.width + gap, 40, hq2.width + gap + 3, Hh - 40), fill=(209, 213, 219, 255))
duo.paste(rq2, (hq2.width + gap * 2 + 4, (Hh - rq2.height) // 2), rq2)
duo.save(os.path.join(OUT, 'duo_raqami.png'))

# contact sheet for a visual check
names = sorted(f for f in os.listdir(OUT) if f.endswith('.png') and not f.startswith('_'))
tiles = []
for n in names:
    im = Image.open(os.path.join(OUT, n)).convert('RGBA')
    im.thumbnail((260, 150))
    bg = Image.new('RGB', (280, 190), (238, 238, 238))
    bg.paste(im, ((280 - im.width) // 2, (170 - im.height) // 2), im)
    ImageDraw.Draw(bg).text((6, 174), n, fill=(0, 0, 0))
    tiles.append(bg)
cols = 6
sheet = Image.new('RGB', (cols * 290, ((len(tiles) + cols - 1) // cols) * 200), (255, 255, 255))
for i, t in enumerate(tiles):
    sheet.paste(t, (5 + (i % cols) * 290, 5 + (i // cols) * 200))
sheet.save(os.path.join(OUT, '_sheet.png'))
print('assets', len(names))
