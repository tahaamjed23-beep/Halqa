@echo off
setlocal
set "CONFIG=D:\HALQA SIGMA APP\halqa-web\src\config.ts"
powershell -NoProfile -ExecutionPolicy Bypass -Command "$p=$env:CONFIG; $s=[IO.File]::ReadAllText($p); if($s -match 'SHOW_INVESTOR_BRIEFING_FEATURES = true'){ $s=$s -replace 'SHOW_INVESTOR_BRIEFING_FEATURES = true','SHOW_INVESTOR_BRIEFING_FEATURES = false'; $state='OFF' } else { $s=$s -replace 'SHOW_INVESTOR_BRIEFING_FEATURES = false','SHOW_INVESTOR_BRIEFING_FEATURES = true'; $state='ON' }; [IO.File]::WriteAllText($p,$s,[Text.UTF8Encoding]::new($false)); Write-Host ('Investor briefing features: '+$state)"
echo Vite will hot-reload the change if Halqa is running.
pause
