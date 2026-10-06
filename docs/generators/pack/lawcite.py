# -*- coding: utf-8 -*-
"""Citation helper: every quotation is matched against its source text before it is printed,
and the page on which it appears is looked up. A quotation that is not found stops the build."""
import html as H
import io
import os
import re

import pymupdf

SP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SOURCES = {
    'CA': dict(title='Companies Act 2017', where='Gazette of Pakistan, Extraordinary, Part I, 31 May 2017', file='ca2017.pdf', label='gazette'),
    'PSEFT': dict(title='Payment Systems and Electronic Fund Transfers Act 2007', where='Pakistan Code text', file='law/psEFT-2007.pdf', label='pageof'),
    'PSO': dict(title='Rules for Payment System Operators and Payment Service Providers 2014', where='State Bank of Pakistan, PSD Circular No. 3 of 2014', file='law/psop-2014.pdf', label='index'),
    'EMI': dict(title='Regulations for Electronic Money Institutions 2023', where='State Bank of Pakistan, PSP&amp;OD Circular No. 3 of 2023', file='law/emi-2023.pdf', label='pageof'),
    'INS': dict(title='Insurance Ordinance 2000', where='consolidated text', file='ins2000b.pdf', label='topnum'),
    'CIA': dict(title='Corporate Insurance Agents Regulations 2020', where='S.R.O. 1304(I)/2020, Gazette of Pakistan, Extraordinary, Part II, 5 December 2020', file='law/cia-2020.pdf', label='gazette'),
    'CBA': dict(title='Credit Bureaus Act 2015', where='Pakistan Code text, updated to 3 August 2022', file='cba2015.pdf', label='pageof'),
    'ETO': dict(title='Electronic Transactions Ordinance 2002', where='Pakistan Code text', file='law/eto-2002-pakistancode.pdf', label='pageof'),
    'ICT': dict(title='Islamabad Capital Territory (Tax on Services) Ordinance 2001', where='Federal Board of Revenue text, updated to 30 June 2025', file='research/ict-2025.pdf', label='index'),
    'AML': dict(title='Anti-Money Laundering Act 2010', where='Financial Monitoring Unit consolidated text', file='aml2010.txt', label=None),
    'SANDBOX': dict(title='Guidelines for Regulatory Sandbox', where='State Bank of Pakistan, Digital Financial Services Group', file='sbp_rsb.txt', label=None),
    'PPC294': dict(title='Pakistan Penal Code 1860', where='text compiled at pakarbiter.com, section 294-A', file='research/ppc-294a-2026-09-25.txt', label=None,
                   url='pakarbiter.com/laws-in-pakistan/pakistan-penal-code-1860/ppc-section-294-a/keeping-lottery-office'),
    'PPC489': dict(title='Pakistan Penal Code 1860', where='text compiled at pakarbiter.com, section 489-F', file='research/ppc-489f-2026-09-25.txt', label=None,
                   url='pakarbiter.com/laws-in-pakistan/pakistan-penal-code-1860/ppc-section-489-f/dishonestly-issuing-a-cheque'),
    'CPC': dict(title='Code of Civil Procedure 1908, Order XXXVII', where='as reproduced by the Sindh Judicial Academy, Working Paper on Suits under Summary Procedure', file='research/sja-summary-procedure.pdf', label='index'),
    'CONTRACT': dict(title='Contract Act 1872', where='text at nasirlawsite.com/laws/contract.htm', file='research/contract-act-2026-09-25.txt', label=None),
    'P2P': dict(title='NBFC and Notified Entities Regulations 2008, peer to peer chapter, S.R.O. 436(I)/2022', where='as reported by Business Recorder, 29 March 2022, brecorder.com/news/40163648', file='research/p2p-definition-brecorder-2022.txt', label=None),
    'RAAST': dict(title='State Bank of Pakistan, Raast Person to Person', where='sbp.org.pk/our-subsidiaries/raast/raast-person-to-person, read 25 September 2026', file='research/sbp-raast-p2p-2026-09-25.txt', label=None),
    'ALFALAH': dict(title='Bank Alfalah, Raast P2M QR and Request to Pay, questions and answers', where='bankalfalah.com, read 24 September 2026', file='law/alfalah-rtp.html', label=None),
    'BPRD': dict(title='State Bank of Pakistan, BPRD Circular Letter No. 29 of 23 September 2021', where='sbp.org.pk/bprd/2021/CL29.htm', file='research/sbp-bprd-cl29-2021.txt', label=None),
    'RAASTP2M': dict(title='State Bank of Pakistan, Raast', where='sbp.org.pk/raast and sbp.org.pk/our-subsidiaries/raast/raast-person-to-merchant, read 25 September 2026', file='research/sbp-raast-p2m-2026-09-25.txt', label=None),
    'MODARABA': dict(title='Modaraba Companies and Modaraba (Floatation and Control) Ordinance 1980', where='text at nasirlawsite.com/laws/modaraba.htm, read 25 September 2026', file='research/modaraba-ordinance-1980.txt', label=None),
    'ICTVEH': dict(title='Islamabad Capital Territory Administration, Vehicle Transfer', where='ictadministration.gov.pk/vehicle-transfer, read 25 September 2026', file='research/ict-vehicle-transfer-2026-09-25.txt', label=None),
    'SECPMOD': dict(title='Securities and Exchange Commission of Pakistan, Licensing, Modarabas', where='secp.gov.pk/licensing/nbfcs/modarabas, read 25 September 2026', file='research/secp-modaraba-licensing-2026-09-25.txt', label=None),
    'IBFT': dict(title='State Bank of Pakistan, PSD Circular No. 02 of 2021, Pricing of Interbank Fund Transfer (IBFT) Services', where='sbp.org.pk/circulars/psd-circular-no-02-of-2021, read 25 September 2026', file='research/sbp-psd-c2-2021-ibft.txt', label=None),
    'MUFAP': dict(title='Associated Press of Pakistan, report of the SECP release of 1 April 2026', where='app.com.pk', file='research/app-mufap.html', label=None),
}

_GAZ = re.compile(r'\d{0,5}(?:\d)?thegazetteofpakistanextra(?:ordinary)?(?:january|february|march|april|may|june|july|august|'
                  r'september|october|november|december)\d{1,2}\d{4}parti{1,3}\d{0,5}')


def squash(s):
    s = H.unescape(s)
    s = s.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"').replace('‐', '-')
    s = re.sub(r'[^a-z0-9]', '', s.lower())
    s = re.sub(r'page\d+of\d+', '', s)
    s = _GAZ.sub('', s)
    s = re.sub(r'(?<=[a-z])\d{1,3}(?=[a-z])', '', s)
    return s


_cache = {}


def _pages(key):
    if key in _cache:
        return _cache[key]
    path = os.path.join(SP, SOURCES[key]['file'])
    if path.endswith('.pdf'):
        with pymupdf.open(path) as d:
            raw = [p.get_text() for p in d]
    else:
        t = io.open(path, encoding='utf-8', errors='replace').read()
        if path.endswith('.html'):
            t = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', t, flags=re.S)
            t = H.unescape(re.sub(r'<[^>]+>', ' ', t))
        raw = [t]
    normed = [re.sub(r'^\d{1,4}|\d{1,4}$', '', squash(p)) for p in raw]
    offsets, total = [], 0
    for n in normed:
        offsets.append(total)
        total += len(n)
    _cache[key] = (raw, ''.join(normed), offsets)
    return _cache[key]


def _label(key, i, raw):
    kind = SOURCES[key]['label']
    text = raw[i]
    if kind == 'pageof':
        m = re.search(r'Page\s+(\d+)\s+of\s+(\d+)', text)
        if m:
            return 'page %s of %s' % (m.group(1), m.group(2))
    if kind == 'topnum':
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        if lines and re.fullmatch(r'\d{1,3}', lines[0]):
            return 'page %s of %d' % (lines[0], len(raw))
    if kind == 'gazette':
        lines = [l.strip() for l in text.splitlines() if l.strip()]
        for l in lines[:4] + lines[-4:]:
            m = re.match(r'(\d{2,4}(?:\(\d+\))?)(?:\s|$)', l)
            if m and (re.fullmatch(r'\d{2,4}(?:\(\d+\))?', l) or 'GAZETTE' in l.upper()):
                return 'Gazette page %s' % m.group(1)
        edge = text[:300] + ' ' + text[-300:]
        m = re.search(r'(?<![\d(])(\d{3,4}\(\d{1,3}\))', edge)
        if m:
            return 'Gazette page %s' % m.group(1)
    if kind:
        return 'page %d of %d' % (i + 1, len(raw))
    return ''


def locate(key, quote):
    raw, full, offsets = _pages(key)
    frags = [f for f in re.split(r'\.\.\.|…', quote) if len(squash(f)) >= 12]
    first = None
    for f in frags:
        pos = full.find(re.sub(r'^\d+|\d+$', '', squash(f)))
        if pos < 0:
            raise SystemExit('QUOTE NOT FOUND in %s: %s' % (key, f.strip()[:160]))
        if first is None:
            first = pos
    page = max(i for i, o in enumerate(offsets) if o <= first)
    return _label(key, page, raw)


def cite(D, key, quote, provision):
    lab = locate(key, quote)
    src = SOURCES[key]
    where = src['where'] + (', ' + lab if lab else '')
    return D.quote(quote, '%s, %s. %s' % (src['title'], provision, where))


def check(key, text):
    """Verify a phrase quoted inline in prose."""
    locate(key, text)
    return '&ldquo;%s&rdquo;' % text
