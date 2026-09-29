"""Build the Mashreq and Raqami decks, then render PDFs with LibreOffice.

Usage: python3 build.py [mashreq|raqami ...]
"""
import os
import subprocess
import sys

import slides_appendix as A
import slides_close as C
import slides_risk as R
import slides_story as S
from theme import Deck

OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

MAIN = [S.title_slide, S.summary, S.committee, S.market, S.problem, S.proposal,
        S.product, S.bank_month, S.benefit, R.checks, R.types, R.risk, R.recovery,
        R.cover, "shariah", C.fees, C.competition, C.evidence, C.why_now,
        C.readiness, C.pilot, C.requests, C.close]
APPENDIX = [A.divider, A.risks, A.integration, A.points, A.hyper, A.leaving,
            A.unit_costs]


def build(profile, filename, extra=None):
    deck = Deck(profile["name"])
    for step in MAIN + APPENDIX:
        if step == "shariah":
            if extra:
                extra(deck, profile)
            continue
        step(deck, profile)
    path = os.path.join(OUT, filename + ".pptx")
    deck.save(path)
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", OUT,
                    path], check=True, capture_output=True)
    print(f"{filename}: {deck.count} slides")
    return path


def main(which):
    if "mashreq" in which:
        from bank_mashreq import P
        build(P, "Halqa Presentation for Mashreq 29 September 2026")
    if "raqami" in which:
        from bank_raqami import P, shariah
        build(P, "Halqa Presentation for Raqami 29 September 2026", shariah)


if __name__ == "__main__":
    main(sys.argv[1:] or ["mashreq", "raqami"])
