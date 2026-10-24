# AI Palmistry — Android Packaging & Build Guide

This directory contains the production-ready Android Studio project for **AI Palmistry** (`com.aipalmistry.app`), configured for **Trusted Web Activity (TWA)** and includes a **Native Android WebView fallback wrapper**.

---

## 1. Project Specifications

| Property | Value |
|---|---|
| **Application Name** | `AI Palmistry` |
| **Package Name** | `com.aipalmistry.app` |
| **Production Target URL** | `https://ai-palmistry.ai.studio` |
| **Theme / Design** | Premium Black & Gold (`#0B0B0E`, `#D4AF37`, `#14141E`) |
| **Minimum Android SDK** | API 21 (Android 5.0 Lollipop) |
| **Target Android SDK** | API 34 (Android 14) |
| **Compile Android SDK** | API 34 |
| **TWA Library** | `com.google.androidbrowserhelper:androidbrowserhelper:2.5.0` |
| **UPI Payment Support** | Android intent filter queries for `upi://` schemes (Google Pay, PhonePe, Paytm, BHIM) |
| **Camera Support** | Automated camera permission handling & FileProvider photo capture for live palm scans |

---

## 2. Architecture: TWA vs. Native WebView

This project supports **both** architectures out of the box:

### Architecture A: Google Trusted Web Activity (TWA) [Default]
- **How it works**: Uses AndroidX Browser Helper to run the published website (`https://ai-palmistry.ai.studio`) inside Chrome/Chromium Custom Tabs without the browser URL address bar.
- **Benefits**:
  - Automatically receives all web app updates and AI model improvements instantly without needing to republish APKs on Google Play.
  - Highest performance web engine maintained by Google Chrome.
  - Uses the website's service worker, cache, and biometric camera access.
- **Requirement**: Requires **Digital Asset Links** domain verification (`/.well-known/assetlinks.json`) containing your release keystore SHA-256 fingerprint.

### Architecture B: Native Android WebView Fallback
- **How it works**: Runs the web app directly inside an accelerated Android `WebView` (`WebViewActivity.kt`).
- **Benefits**:
  - Guarantees **100% full-screen** experience without an address bar even if domain verification or DNS takes time to propagate.
  - Native pull-to-refresh (`SwipeRefreshLayout`).
  - Native file chooser and direct camera photo capture (`WebChromeClient`).
  - Explicit interceptor for UPI payment links (`upi://pay?pa=supercha@ptaxis...`), seamlessly opening Google Pay, PhonePe, Paytm, or BHIM.
  - Custom dark & gold offline screen with a retry button.
- **How to switch**: In `android/app/src/main/java/com/aipalmistry/app/AppConfig.kt`, set `PREFER_TWA = false`.

---

## 3. Digital Asset Links Configuration (For TWA)

To run a Trusted Web Activity without the browser address bar, Android requires Google Digital Asset Links verification between `com.aipalmistry.app` and `https://ai-palmistry.ai.studio`.

### Step 3.1: Generate Your Keystore & Get SHA-256
Run the following command on your local machine to generate a production keystore (or use Android Studio):

```bash
keytool -genkeypair -v -keystore release.keystore -alias aipalmistry -keyalg RSA -keysize 2048 -validity 10000
```

Extract the SHA-256 certificate fingerprint:
```bash
keytool -list -v -keystore release.keystore -alias aipalmistry
```
Look for the line:
```
Certificate fingerprints:
     SHA256: 12:34:56:78:90:AB:CD:EF:...
```

### Step 3.2: Update `assetlinks.json`
Open `public/.well-known/assetlinks.json` in this repository and replace the SHA-256 fingerprint with your exact value:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.aipalmistry.app",
      "sha256_cert_fingerprints": [
        "12:34:56:78:90:AB:CD:EF:..."
      ]
    }
  }
]
```

Also update `assetStatements` in `android/app/build.gradle`.

### Step 3.3: Verify Domain Link
Once deployed to `https://ai-palmistry.ai.studio`, you can verify using Google's Digital Asset Links API:
```bash
curl "https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://ai-palmistry.ai.studio&relation=delegate_permission/common.handle_all_urls"
```

---

## 4. Step-by-Step Build Instructions

> **Note**: An actual binary `.apk` or `.aab` file cannot be built inside the web sandbox without Android SDK build tools. You will compile the signed binary using Android Studio or the Gradle CLI on your computer.

### Method 1: Using Android Studio (Recommended)
1. **Download/Clone the project** to your local machine.
2. Open **Android Studio** (Giraffe 2022.3+, Hedgehog, Iguana, or newer).
3. Select **File > Open** and choose the `android` folder.
4. Allow Gradle to sync dependencies (`com.google.androidbrowserhelper:androidbrowserhelper:2.5.0`, `androidx.webkit:webkit:1.10.0`).
5. **Build APK for testing**:
   - Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
   - Android Studio will output: `app/build/outputs/apk/debug/app-debug.apk`.
   - Install it directly to your connected Android phone using `adb install app-debug.apk` or transfer via USB.
6. **Build Signed Release APK / AAB for Google Play**:
   - Go to **Build > Generate Signed Bundle / APK**.
   - Choose **Android App Bundle (.aab)** for Google Play Store upload, or **APK** for direct distribution.
   - Select your `release.keystore`, enter your password, and click **Finish**.
   - The signed `.aab` or `.apk` will be in `app/release/`.

### Method 2: Using the Command Line (CLI)
From inside the `android` directory on your machine:

```bash
# Clean previous builds
./gradlew clean

# Build Debug APK
./gradlew assembleDebug

# Build Release APK
./gradlew assembleRelease

# Build Google Play Production App Bundle (.aab)
./gradlew bundleRelease
```

---

## 5. Security & Payment Safeguards

1. **API Keys & Secrets**:
   - The Gemini API Key (`GEMINI_API_KEY`) and server-side payment verification secrets remain securely on the server.
   - The Android client makes network requests only to `https://ai-palmistry.ai.studio`.
2. **UPI Payment Integrity**:
   - The app uses the verified merchant UPI ID: `supercha@ptaxis`.
   - When the user taps a payment plan (₹199 Monthly or ₹999 Lifetime), the Android app dispatches a secure `upi://pay` intent to installed UPI apps (GPay, PhonePe, Paytm).
   - The payment status remains `PAYMENT_PENDING` until validated server-side. No local client-side VIP overrides are permitted.

---

## 6. Outside Google AI Studio Checklist

The following tasks must be completed on your computer and developer accounts:

1. **Android Studio & Java**:
   - Install Android Studio and JDK 17+.
2. **Google Play Console Developer Account**:
   - Register at [play.google.com/console](https://play.google.com/console) (one-time $25 Google registration fee).
3. **App Signing by Google Play**:
   - When uploading the `.aab`, Google Play App Signing will sign the final APK delivered to users.
   - If Google Play App Signing is enabled, copy the **App Signing SHA-256** from the Google Play Console under **Setup > App Integrity** into `public/.well-known/assetlinks.json`.
4. **Physical Device Testing**:
   - Test camera permissions for palm image capture.
   - Test UPI app deep-linking on a real device with Google Pay, PhonePe, or Paytm installed.
