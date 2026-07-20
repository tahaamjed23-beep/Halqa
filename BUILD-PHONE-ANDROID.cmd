@echo off
title Build Halqa Android App

set "ROOT=D:\HALQA SIGMA APP"
set "NODE=%ROOT%\.tools\node-v22.22.0-win-x64"
set "JAVA_HOME=%ROOT%\.tools\jdk-17"
set "ANDROID_HOME=%ROOT%\.tools\android-sdk"
set "ANDROID_SDK_ROOT=%ANDROID_HOME%"
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\cmdline-tools\latest\bin;%NODE%;%PATH%"

echo.
echo ================================
echo      HALQA ANDROID BUILDER
echo ================================
echo.

cd /d "%ROOT%\halqa-web"

if not exist "%JAVA_HOME%\bin\java.exe" (
  echo ERROR: Portable JDK 17 is missing:
  echo %JAVA_HOME%
  pause
  exit /b 1
)

if not exist "%ANDROID_HOME%\cmdline-tools\latest\bin\sdkmanager.bat" (
  echo ERROR: Android SDK is not installed yet.
  echo.
  echo Install Android Studio, or install Android command-line tools to:
  echo %ANDROID_HOME%
  echo.
  echo After that, run this file again.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo Installing web dependencies...
  call npm install
)

if not exist "android" (
  echo Creating Android project...
  call npm run mobile:android:add
)

echo Syncing latest Halqa web app into Android...
call npm run mobile:sync

echo.
echo Opening Android Studio...
echo From Android Studio: build APK for testing, or signed AAB for Google Play.
call npx cap open android

pause
