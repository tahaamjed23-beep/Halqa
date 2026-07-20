@echo off
set "ROOT=D:\HALQA SIGMA APP"
set "PGBIN=%ROOT%\.tools\postgresql-17.10\pgsql\bin"
"%PGBIN%\pg_ctl.exe" -D "%ROOT%\.data\postgres" stop
echo Database stopped. Close the two Halqa command windows to stop API and Web.
pause
