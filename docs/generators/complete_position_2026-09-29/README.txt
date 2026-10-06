Halqa: Complete Position, 29 September 2026 (82 slides)
Build: python deck/d2_build.py out.pptx   (parts d2_p1 to d2_p7 run in one namespace with d2_lib)
Render: powershell deck/render.ps1 -In out.pptx -Out out.pdf ; python deck/pages.py out.pdf prefix
Icons: drawn from halqa-web/node_modules/lucide-react (path in d2_lib.py, ICON_SRC), cached in ../icons
App screens: node shots2/shoot.mjs <outdir> name=url ... against the web app in preview mode (?preview=1)
Mashreq logo: white logo from mashreq.com, coloured from the logo on Mashreq's half year report cover
