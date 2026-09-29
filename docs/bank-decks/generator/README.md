# Bank deck generator

Builds the Mashreq and Raqami presentations from code, so wording and layout stay
consistent between the two banks.

```
pip install python-pptx pymupdf pillow
python3 build.py            # both decks
python3 build.py raqami     # one deck
```

Output goes to `docs/bank-decks/` as .pptx and, when LibreOffice with Impress is
installed, .pdf.

| File | Holds |
|---|---|
| theme.py | Colours, fonts, grid, text and shape helpers; the build stops on dashes and banned words |
| charts.py | Bars, Gantt, lifelines, Harvey balls, tables |
| diagrams.py | Payment matrix, money routes, line maps, month timeline, cover exhibit |
| slides_story.py, slides_risk.py, slides_close.py, slides_appendix.py | Slides shared by both banks |
| bank_mashreq*.py, bank_raqami*.py | Every bank specific line and the speaker notes |
| assets/ | Halqa logo, approved Mashreq logo, app screens from the v3 deck |

To change wording for one bank, edit its bank_*.py file. To change a layout for both,
edit the slides_*.py file.
