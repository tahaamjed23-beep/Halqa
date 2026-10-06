# -*- coding: utf-8 -*-
"""Loop 1: every quotation in the generated documents is searched for, word for word, in the primary
texts held locally. Punctuation and spacing are ignored; wording is not. Fragments either side of an
ellipsis are checked separately."""
import glob, html, io, os, re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
import pymupdf

SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS = r'D:\HALQA SIGMA APP\docs'
SOURCES = {
    'Companies Act 2017': [os.path.join(SP, 'ca2017.txt')],
    'Credit Bureaus Act 2015': [os.path.join(SP, 'cba2015.txt')],
    'Insurance Ordinance 2000': [os.path.join(SP, 'ins2000.txt')],
    'Electronic Transactions Ordinance 2002': [os.path.join(SP, 'eto2002.txt')],
    'PS&EFT Act 2007': [os.path.join(SP, 'pseft2007.txt'), os.path.join(DOCS, 'psEFT-2007.pdf')],
    'AML Act 2010': [os.path.join(SP, 'aml2010.txt')],
    'SBP sandbox': [os.path.join(SP, 'sbp_rsb.txt')],
    'EMI Regulations 2023': [os.path.join(DOCS, 'emi-2023.pdf')],
    'CIA Regulations 2020': [os.path.join(DOCS, 'cia-2020.pdf')],
    'NBFC Regulations 2008': [os.path.join(SP, 'nbfc2008.pdf')],
    'EMI Regulations 2019': [os.path.join(SP, 'emi2019.pdf')],
    'Unknown pdf': [os.path.join(SP, 'mystery.pdf')],
    'ICT Tax on Services': [os.path.join(SP, 'research', 'ict-2025.txt')],
    'TASDEEQ pages': glob.glob(os.path.join(SP, 'research', 'tasdeeq-*.txt')),
    'VIS microfinance': [os.path.join(SP, 'research', 'vis-mf-2026.txt')],
    'IPO FAQ': [os.path.join(SP, 'research', 'ipo-faq.html')],
    'MUFAP report': [os.path.join(SP, 'research', 'app-mufap.html'), os.path.join(SP, 'research', 'secp-mfd.html')],
    'PSO/PSP Rules 2014': [os.path.join(SP, 'law', 'psop-2014.txt'), os.path.join(SP, 'law', 'psop-rules-2014.pdf'), os.path.join(SP, 'law', 'psop-2014.pdf')],
    'ETO 2002, Pakistan Code': [os.path.join(SP, 'law', 'eto-2002.txt'), os.path.join(SP, 'law', 'eto-2002-pakistancode.pdf')],
    'PS&EFT Act 2007, second copy': [os.path.join(SP, 'law', 'psEFT-2007.txt')],
    'Raast pages': [os.path.join(SP, 'law', 'raast-page.html'), os.path.join(SP, 'law', 'raast-faq.html')],
    'Bank Alfalah Raast RTP': [os.path.join(SP, 'law', 'alfalah-rtp.html')],
    'BPRD CL 29 of 2021': [os.path.join(SP, 'research', 'sbp-bprd-cl29-2021.txt')],
    'P2P report': [os.path.join(SP, 'research', 'p2p-definition-brecorder-2022.txt')],
    'Raast P2P page': [os.path.join(SP, 'research', 'sbp-raast-p2p-2026-09-25.txt')],
    'Contract Act': [os.path.join(SP, 'research', 'contract-act-2026-09-25.txt')],
    'Penal Code': [os.path.join(SP, 'research', 'ppc-294a-2026-09-25.txt'), os.path.join(SP, 'research', 'ppc-489f-2026-09-25.txt')],
    'CPC Order XXXVII': [os.path.join(SP, 'research', 'sja-summary-procedure.pdf')],
    'Insurance Ordinance, 105 page copy': [os.path.join(SP, 'ins2000b.pdf')],
    'Raast and Raast P2M pages': [os.path.join(SP, 'research', 'sbp-raast-p2m-2026-09-25.txt')],
    'PSD Circular 02 of 2021': [os.path.join(SP, 'research', 'sbp-psd-c2-2021-ibft.txt')],
    'Modaraba Ordinance 1980': [os.path.join(SP, 'research', 'modaraba-ordinance-1980.txt')],
    'SECP modaraba licensing page': [os.path.join(SP, 'research', 'secp-modaraba-licensing-2026-09-25.txt')],
    'ICT vehicle transfer page': [os.path.join(SP, 'research', 'ict-vehicle-transfer-2026-09-25.txt')],
}


def squash(s):
    s = html.unescape(s)
    s = s.replace('\u2019', "'").replace('\u2018', "'").replace('\u201c', '"').replace('\u201d', '"')
    return re.sub(r'[^a-z0-9]', '', s.lower())


def read(path):
    if not os.path.exists(path):
        return ''
    if path.endswith('.pdf'):
        with pymupdf.open(path) as d:
            return ' '.join(p.get_text() for p in d)
    t = io.open(path, encoding='utf-8', errors='replace').read()
    if path.endswith('.html'):
        t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S)
        t = re.sub(r'<[^>]+>', ' ', t)
    return t


CORPUS = {}
for name, paths in SOURCES.items():
    txt = ' '.join(read(p) for p in paths)
    # drop running page numbers and hyphenation breaks before squashing
    txt = re.sub(r'-\s*\n\s*', '', txt)
    CORPUS[name] = re.sub(r'page\d+of\d+', '', squash(txt))
print('corpus:', ', '.join('%s %dk' % (k, len(v) // 1000) for k, v in CORPUS.items()))


def quotes_in(page):
    out = []
    for m in re.finditer(r'<div class="quote">(.*?)<span class="src">(.*?)</span></div>', page, flags=re.S):
        src = re.sub(r'<[^>]+>', '', m.group(2))
        paras = re.findall(r'<p>(.*?)</p>', m.group(1), flags=re.S) or [m.group(1)]
        for para in paras:
            out.append((re.sub(r'<[^>]+>', ' ', para), src))
    body = re.sub(r'<div class="quote">.*?</div>', ' ', page, flags=re.S)
    body = re.sub(r'<style.*?</style>|<title.*?</title>', ' ', body, flags=re.S)
    for el in re.findall(r'<(?:p|li|td)[^>]*>(.*?)</(?:p|li|td)>', body, flags=re.S):
        text = html.unescape(re.sub(r'<[^>]+>', ' ', el))
        for m in re.finditer(r'“([^”]{25,400}?)”', text):
            out.append((m.group(1), 'inline'))
        for m in re.finditer(r'"([^"]{25,400}?)"', text):
            out.append((m.group(1), 'inline'))
    return out


def fragments(q):
    q = html.unescape(q)
    q = re.sub(r'^\s*\d+(-[A-Z])?\.\s*', '', q)
    pieces = []
    for part in re.split(r'\.\.\.|…', q):
        for clause in re.split(r'\s\((?:[a-z]{1,4}|[ivx]{1,6}|\d{1,2})\)\s', ' ' + part + ' '):
            clause = clause.strip(' ,;:"“”')
            if len(squash(clause)) >= 22:
                pieces.append(clause)
    return pieces


def locate(frag):
    s = squash(frag)
    return [k for k, v in CORPUS.items() if s in v]


files = sorted(f for f in glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out', '**', '*.html'), recursive=True)
               if not os.path.basename(f).startswith(('Legal Verification', 'Work Register')))
total = found = 0
misses = []
for f in files:
    page = io.open(f, encoding='utf-8').read()
    for q, src in quotes_in(page):
        for fr in fragments(q):
            total += 1
            hit = locate(fr)
            if hit:
                found += 1
            else:
                misses.append((os.path.basename(f), src, fr))
print('fragments checked %d, found word for word %d, not found %d' % (total, found, len(misses)))
seen = set()
for f, src, fr in misses:
    key = squash(fr)[:80]
    if key in seen:
        continue
    seen.add(key)
    print('--', f, '|', src[:70], '|', fr[:220])
