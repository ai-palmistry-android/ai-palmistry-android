# AI Palmistry — Flutter starter project

A dark black-and-gold Hindi/English Android app starter with camera/gallery palm-photo selection and a demo reading screen.

## Important status
This is a starter project, **not a finished production APK**. The AI service currently returns a demo response. Firebase, secure AI inference, reading-history persistence, authentication UI, and verified Play Billing entitlements require project-specific setup and testing.

## Build requirements
- Flutter SDK (stable)
- Android Studio / Android SDK
- A Firebase project
- A vision AI provider account (optional until enabling real AI readings)
- Google Play Console setup for subscription products if publishing paid features

## Run locally
1. Install Flutter and Android Studio.
2. In this folder run `flutter create .` if platform folders are missing.
3. Run `flutter pub get`.
4. Create/configure Firebase: install FlutterFire CLI and run `flutterfire configure`.
5. In `lib/main.dart`, uncomment Firebase initialization and import the generated `firebase_options.dart` only after configuration.
6. Implement the secure backend described in `functions/README.md`; update `lib/services/palm_ai_service.dart` to call it.
7. Run `flutter run` to test.
8. Build a debug APK with `flutter build apk --debug`, or a release APK after configuring signing with `flutter build apk --release`.

## Security and privacy checklist before release
- Keep AI secrets on a backend; never in app source.
- Add Firebase Security Rules and App Check.
- Request camera/photo permissions only when needed.
- Explain image upload and retention; obtain consent and provide deletion controls.
- Do not use palm photos for identity verification or biometric identification.
- Verify subscriptions server-side and follow Google Play Billing policies.
- Clearly state that palmistry readings are for entertainment and not scientific predictions or medical/financial advice.
