Generators for the Halqa document set, copied from the working scratchpad on 25 September 2026.
pack/      document builders (docgen.py template, lawcite.py quote checker, build_*.py, m*_*.py, conv_existing.py, autopull.py)
maps/      map scripts (mapkit.py, map_*.py), the deck builder generator make_deck_0925.py, and patches
register/  work register generators (reg_a, reg_b, reg_c, reg_rev4 base, reg_rev5)
sources/   primary texts and web extracts used for every quotation
The builders expect the original scratchpad layout (pack/ beside out/, law/ and research/); adjust the paths in lawcite.py SP and docgen.py HERE before rerunning from here.
Output goes to Desktop\ALL HALQA\HALQA CORPORATE via pack/sync_corporate.py.

Late on 25 September 2026: build_all.py rebuilds every document in order; scan_all.py checks the wording of the documents, the deck and the maps; verify_quotes.py checks every quotation against the saved sources. New builders: build_autodebit.py (Auto Debit), build_asset.py (Asset Committees), build_points.py (Seat Exchange and Points). headings.py maps every heading to its formal form; charts3d.py draws the coloured three dimensional figures.
