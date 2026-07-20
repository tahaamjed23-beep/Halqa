# Halqa Phone Versions

## What was added

- Capacitor mobile wrapper for the existing React web app.
- Android app project generation path.
- iOS app project generation path.
- One-click Android builder script for this Windows PC.

## Android

Run:

```bat
D:\HALQA SIGMA APP\BUILD-PHONE-ANDROID.cmd
```

This creates/syncs the Android project and opens Android Studio.

For Google Play, build a signed `.aab` from Android Studio.

## Apple / iPhone

iOS final builds require:

- Mac
- Xcode
- Apple Developer account
- App Store Connect access

Instructions are in:

```txt
D:\HALQA SIGMA APP\BUILD-PHONE-APPLE-IOS.txt
```

## Current limitation

The mobile app currently points to the same Halqa frontend/backend architecture. Before public release, the API must be deployed to a real HTTPS backend instead of local `localhost`.

