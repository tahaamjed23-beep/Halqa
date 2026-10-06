# -*- coding: utf-8 -*-
"""App-icon tiles for version 6: the Mashreq PK icon and the NEO icon from the chairman's edited deck, given rounded
corners with transparent outsides so they sit on the page like the Halqa mark and the Raqami app icon."""
import os
from PIL import Image, ImageDraw

ME = os.path.dirname(os.path.abspath(__file__))
UM = os.path.join(ME, 'user_media')
OUT = os.path.join(UM, 'clean')


def rounded(src, dst, inset=0.0, radius=0.23, size=400):
    im = Image.open(os.path.join(UM, src)).convert('RGBA')
    W, H = im.size
    k = int(min(W, H) * inset)
    im = im.crop((k, k, W - k, H - k)).resize((size, size), Image.LANCZOS)
    mask = Image.new('L', (size * 4, size * 4), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, size * 4 - 1, size * 4 - 1), radius=int(size * 4 * radius), fill=255)
    mask = mask.resize((size, size), Image.LANCZOS)
    im.putalpha(mask)
    im.save(os.path.join(OUT, dst))


rounded('49960482d1.png', 'mashreq_tile.png', inset=0.0)
rounded('fd5c0b4dea.png', 'neo_tile.png', inset=0.035, radius=0.21)

# Raqami: its emblem in white on a Raqami purple tile, so it reads at small sizes like the other app icons
size = 400
emb = Image.open(os.path.join(OUT, 'raqami_icon.png')).convert('RGBA')
white = Image.new('RGBA', emb.size, (255, 255, 255, 0))
white.putalpha(emb.getchannel('A'))
white.thumbnail((250, 250), Image.LANCZOS)
big = Image.new('RGBA', (size * 4, size * 4), (0, 0, 0, 0))
ImageDraw.Draw(big).rounded_rectangle((0, 0, size * 4 - 1, size * 4 - 1), radius=int(size * 4 * 0.23),
                                      fill=(0x57, 0x3F, 0x99, 255))
t = big.resize((size, size), Image.LANCZOS)
t.alpha_composite(white, ((size - white.width) // 2, (size - white.height) // 2))
t.save(os.path.join(OUT, 'raqami_tile.png'))
print('tiles written')
