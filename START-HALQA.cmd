@echo off
title Halqa Launcher
set "ROOT=D:\HALQA SIGMA APP"
set "NODE=%ROOT%\.tools\node-v22.22.0-win-x64"
set "PGBIN=%ROOT%\.tools\postgresql-17.10\pgsql\bin"
set "PGDATA=%ROOT%\.data\postgres"
set "PATH=%NODE%;%PGBIN%;%PATH%"

echo Starting Halqa PostgreSQL...
"%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -l "%ROOT%\.data\postgres.log" start >nul 2>&1

echo Starting Halqa API on http://localhost:4101...
start "Halqa API" cmd /k "cd /d ""%ROOT%\halqa-api"" && set ""PATH=%NODE%;%%PATH%%"" && npm run dev"

echo Starting Halqa Web on http://localhost:4100...
start "Halqa Web" cmd /k "cd /d ""%ROOT%\halqa-web"" && set ""PATH=%NODE%;%%PATH%%"" && npm run dev"

echo Opening Halqa...
timeout /t 5 /nobreak >nul
start "" "http://localhost:4100"
echo Halqa launched. Keep the API and Web command windows open.
pause
