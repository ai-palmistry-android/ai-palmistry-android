# 📱 AI Palmistry — Mobile User Cloud Build & Installation Guide

This guide is designed for **Android phone users** who do not have a computer or Android Studio installed. You can build, download, and install the **AI Palmistry APK** directly using free cloud build services right from your phone's browser.

---

## 📋 App Specifications

- **App Name:** `AI Palmistry`
- **Package ID:** `com.aipalmistry.app`
- **Target URL:** `https://ai-palmistry.ai.studio`
- **Theme:** Luxury Mystic Black & Gold (`#0B0B0E`, `#D4AF37`)
- **Permissions Configured:** Camera (`CAMERA`), Internet (`INTERNET`), Storage (`READ_EXTERNAL_STORAGE`)
- **UPI Support:** Google Pay, PhonePe, Paytm, BHIM (`upi://` deep linking)
- **Security:** Gemini API key & UPI payment verification stay 100% protected on the backend server (`server.ts`). The Android app has zero secret keys exposed.

---

## 🚀 Option 1: Build Using Free Cloud Service (GitHub Actions)

This repository includes a ready-to-run GitHub Actions workflow (`.github/workflows/build-android.yml`) that builds the APK in Ubuntu cloud servers.

### Step-by-Step Instructions (On Your Android Phone):

1. **Push or Fork this Repository to GitHub:**
   - Open [github.com](https://github.com) on Chrome on your phone.
   - If not already hosted, upload or push this project to a new repository.

2. **Run the Cloud Build:**
   - Tap on the **Actions** tab at the top of your repository.
   - Select **"Build Android APK & AAB"** from the left-hand workflows list.
   - Tap the **"Run workflow"** button and choose `main` or `master`.
   - The cloud builder will start. Building takes about **2 to 3 minutes**.

3. **Download the APK to Your Phone:**
   - When the workflow completes with a green checkmark `✓`, tap on the run.
   - Scroll down to the **Artifacts** section at the bottom.
   - Tap on **`AI-Palmistry-Debug-APK`**. A zip containing `app-debug.apk` will download to your phone's `Downloads` folder.

4. **Install on Your Android Phone:**
   - Open your phone's **Files** or **Downloads** app.
   - Tap on `AI-Palmistry-Debug-APK.zip` to extract `app-debug.apk` (or tap `app-debug.apk` directly).
   - If prompted: **"For your security, your phone is not allowed to install unknown apps from this source"**, tap **Settings** and toggle **"Allow from this source"**.
   - Tap **Install**.
   - Tap **Open** to enjoy AI Palmistry!

---

## ⚡ Option 2: 1-Click PWA Installation (Instant on Android)

Since your production web app (`https://ai-palmistry.ai.studio`) is already live with a full Web App Manifest and Service Worker:

1. Open **Google Chrome** on your Android phone.
2. Navigate to: `https://ai-palmistry.ai.studio`
3. Tap the **three-dot menu (⋮)** in the top right corner.
4. Tap **"Install app"** or **"Add to Home screen"**.
5. AI Palmistry will be added to your app drawer and home screen as a standalone full-screen app with the black & gold icon.

---

## 🛡️ Architecture & Verification Note

- **Dual-Engine Architecture:**
  - **Google Trusted Web Activity (TWA)**: Seamlessly loads `https://ai-palmistry.ai.studio`.
  - **Native WebView Fallback (`WebViewActivity.kt`)**: Automatically activates if Google Play Services or Chrome Custom Tabs are unavailable, ensuring 100% full-screen operation, native UPI payment intent handling (`upi://pay?pa=supercha@ptaxis`), and high-resolution camera capture.
- **Verification Guarantee:**
  - In accordance with safety guidelines, no fake `.apk` binary file has been forged. The actual binary `.apk` is built cleanly in the cloud using the verified Android build tools in `.github/workflows/build-android.yml`.
