@echo off
title Halqa Demo Launcher
color 0A

set "HALQA_ROOT=D:\HALQA SIGMA APP"
set "NODE=%HALQA_ROOT%\.tools\node-v22.22.0-win-x64"
set "PGBIN=%HALQA_ROOT%\.tools\postgresql-17.10\pgsql\bin"
set "PGDATA=%HALQA_ROOT%\.data\postgres"

echo.
echo ================================
echo        HALQA DEMO LAUNCHER
echo ================================
echo.

if not exist "%HALQA_ROOT%" (
  echo ERROR: Halqa folder was not found:
  echo %HALQA_ROOT%
  echo.
  echo This demo launcher is made for Taha's current PC.
  pause
  exit /b 1
)

if not exist "%NODE%\node.exe" (
  echo ERROR: Local Node runtime is missing:
  echo %NODE%\node.exe
  pause
  exit /b 1
)

if not exist "%PGBIN%\pg_ctl.exe" (
  echo ERROR: Local PostgreSQL runtime is missing:
  echo %PGBIN%\pg_ctl.exe
  pause
  exit /b 1
)

if not exist "%HALQA_ROOT%\halqa-api\package.json" (
  echo ERROR: API software folder is missing.
  pause
  exit /b 1
)

if not exist "%HALQA_ROOT%\halqa-web\package.json" (
  echo ERROR: Web software folder is missing.
  pause
  exit /b 1
)

set "PATH=%NODE%;%PGBIN%;%PATH%"

echo Starting database...
"%PGBIN%\pg_ctl.exe" -D "%PGDATA%" -l "%HALQA_ROOT%\.data\postgres.log" start >nul 2>&1

echo Starting backend API...
start "Halqa API - keep open" cmd /k "cd /d ""%HALQA_ROOT%\halqa-api"" && set ""PATH=%NODE%;%%PATH%%"" && npm run dev"

echo Starting web app...
start "Halqa Web - keep open" cmd /k "cd /d ""%HALQA_ROOT%\halqa-web"" && set ""PATH=%NODE%;%%PATH%%"" && npm run dev"

echo.
echo Waiting for Halqa to wake up...
timeout /t 8 /nobreak >nul

echo Opening browser...
start "" "http://localhost:4100"

echo.
echo If the app is not loaded yet, wait 10 more seconds and refresh.
echo Keep the two black command windows open.
echo.
pause

