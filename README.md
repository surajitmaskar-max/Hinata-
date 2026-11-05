# 🔮 HINATA AI – Your Intelligent World

[![Build & Verify Android APK](https://github.com/OWNER/HINATA-AI/actions/workflows/build-apk.yml/badge.svg)](https://github.com/OWNER/HINATA-AI/actions/workflows/build-apk.yml)
[![Publish Release APK](https://github.com/OWNER/HINATA-AI/actions/workflows/release.yml/badge.svg)](https://github.com/OWNER/HINATA-AI/actions/workflows/release.yml)
[![Android SDK](https://img.shields.io/badge/Android%20SDK-35%20(Android%2015)-3DDC84.svg?logo=android)](https://developer.android.com)
[![Kotlin](https://img.shields.io/badge/Kotlin-2.0.21-7F52FF.svg?logo=kotlin)](https://kotlinlang.org)
[![Jetpack Compose](https://img.shields.io/badge/Jetpack%20Compose-2024.11.00-4285F4.svg?logo=jetpackcompose)](https://developer.android.com/jetpack/compose)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

> **HINATA AI** is an advanced, ultra-premium personal AI assistant for Android combining a photorealistic glowing purple holographic orb, expressive anime voice personality with trilingual mastery (**Bengali**, **Hindi**, and **English**), multimodal Google Gemini intelligence, Firebase multi-user data isolation, and deep hardware automation.

---

## ✨ Features

- **🔮 Holographic Purple Orb UI**: Real-time canvas-rendered translucent sphere with inner fluid plasma energy, tilted Saturn-like orbital rings with true depth occlusion, stardust particles, and 6 dynamic states (`IDLE`, `LISTENING`, `THINKING`, `SPEAKING`, `EXECUTING`, `ERROR`).
- **🎙️ Trilingual Anime Voice Engine**: Sweet, expressive female anime vocal inflections in **English**, **Bengali (বাংলা)**, and **Hindi (हिन्दी)** with real-time lip-synchronization and live audio waveform bars.
- **🧠 Gemini AI Multimodal Brain**: Direct client orchestration using Google Generative AI (`gemini-1.5-flash` / `gemini-2.0-flash`) decomposing natural directives into verifiable system steps.
- **🔒 Firebase Authentication & Isolation**: User isolation on Cloud Firestore (`users/{uid}/...`) with zero cross-user leakage, guest demo mode, and verified security rules.
- **⚡ Android Phone Automation**: Native control of device hardware — Camera2 LED flashlight, stream volume, screen brightness, app launching, and assisted UI navigation via Android `AccessibilityService`.
- **🛡️ Security Guardrails & Explicit Confirmation**: Outgoing phone calls and SMS messaging intents are always guarded by mandatory user confirmation prompts before execution.
- **🧠 Personal AI Memory Vault**: Explicitly approved personal preferences and facts stored securely in the user's private Firestore subcollection, editable and revocable at any time.
- **📶 Always-On Background Assistant**: Foreground microphone service (`android:foregroundServiceType="microphone"`) with persistent notification and efficient local wake-word ("Hey HINATA") processing.
- **👑 Premium Feature Suite**: Pro tier with unlimited AI quota, extended voice presets, custom automation routines, and admin telemetry console.

---

## 🛠️ System Requirements

| Component | Minimum Requirement | Recommended |
|---|---|---|
| **Android OS** | Android 8.0 (API level 26) | Android 15 (API level 35) |
| **Android Studio** | Ladybug (2024.2.1) or newer | Latest Stable Release |
| **Java Development Kit (JDK)** | JDK 17 | Eclipse Temurin 17 |
| **Gradle** | Gradle 8.9 | Wrapper included (`./gradlew`) |
| **Google Gemini API** | Gemini API Key | Free tier or Paid Plan |
| **Firebase Project** | Firestore & Authentication | Free Spark or Blaze Plan |

---

## 🚀 Step-by-Step Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/HINATA-AI.git
cd HINATA-AI
```

### 2. Open in Android Studio
1. Launch **Android Studio**.
2. Select **File > Open...** and navigate to the cloned `HINATA-AI` directory.
3. Allow Android Studio to automatically import the Gradle project.

### 3. Configure API Credentials
Create a file named `local.properties` in the project root directory (this file is excluded from Git by `.gitignore`):

```properties
sdk.dir=/Users/YOUR_USER/Library/Android/sdk
GEMINI_API_KEY=AIzaSyYourActualGeminiApiKeyHere
```

> **Security Note:** Never commit your `GEMINI_API_KEY` to GitHub. The project reads this key via Gradle `BuildConfig` during compilation.

### 4. Configure Firebase
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create or select your Firebase project.
3. Enable **Authentication** (Email/Password and Anonymous/Google) and **Cloud Firestore**.
4. Register an Android App with package name: `com.hinata.ai`.
5. Download the `google-services.json` file.
6. Place `google-services.json` inside the `app/` directory:
   ```bash
   cp ~/Downloads/google-services.json app/google-services.json
   ```
*(A template is provided at `app/google-services.json.example` for reference).*

### 5. Sync Gradle
In Android Studio, click **File > Sync Project with Gradle Files** or click the **Sync** icon in the toolbar. Verify that all dependencies download successfully.

### 6. Run on an Android Device
1. Enable **Developer Options** and **USB Debugging** on your Android phone.
2. Connect your device via USB or Wi-Fi pairing.
3. Select your device in Android Studio's device dropdown and click **Run (Shift + F10)**.

---

## 📦 Building the APK

### Building Debug APK
```bash
./gradlew assembleDebug
```
The output file will be generated at:
```
app/build/outputs/apk/debug/app-debug.apk
```

### Building Release APK
```bash
./gradlew assembleRelease
```
The optimized and minified release APK will be generated at:
```
app/build/outputs/apk/release/app-release.apk
```

---

## 🔑 Release Signing Configuration

To produce a signed release APK ready for distribution:

### 1. Generate a Release Keystore
```bash
keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias hinata -storepass YourKeystorePassword -keypass YourKeyPassword
```

### 2. Configure Local Environment Variables
Before running `./gradlew assembleRelease`, export your signing details:
```bash
export KEYSTORE_FILE="/absolute/path/to/release.jks"
export KEYSTORE_PASSWORD="YourKeystorePassword"
export KEY_ALIAS="hinata"
export KEY_PASSWORD="YourKeyPassword"
```

*(If these variables are omitted, Gradle automatically falls back to standard debug signing so local builds and testing succeed without failing).*

---

## 🤖 GitHub Actions CI/CD & Automated Releases

This repository includes two GitHub Actions workflows configured in `.github/workflows/`:

### 1. Pull Request & Push Workflow (`build-apk.yml`)
- Triggers automatically on pushes to `main`/`master` and pull requests.
- Sets up JDK 17 and Android SDK.
- Restores credentials from GitHub Secrets.
- Runs unit tests and builds the release APK.
- Uploads the resulting APK as a GitHub Actions workflow artifact (`HINATA-AI-release-apk`).

### 2. Automatic Tagged Release Workflow (`release.yml`)
When you tag a version and push it to GitHub:
```bash
# Update version in gradle.properties if needed:
# hinata.versionCode=1
# hinata.versionName=1.0.0

git tag -a v1.0.0 -m "HINATA AI Release v1.0.0"
git push origin v1.0.0
```

The `release.yml` workflow automatically:
1. Compiles and signs the release APK.
2. Renames the artifact to `HINATA-AI-v1.0.0-release.apk`.
3. Creates a new **GitHub Release** titled `HINATA AI v1.0.0`.
4. Attaches the signed APK directly to the release page.
5. Formats and publishes release notes.

---

## 🔐 Required GitHub Secrets

To enable signed APK building and automated GitHub Releases, add these secrets under **Settings > Secrets and variables > Actions**:

| Secret Name | Description |
|---|---|
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `GOOGLE_SERVICES_JSON_BASE64` | Base64-encoded `google-services.json` (`base64 -w 0 google-services.json`) |
| `RELEASE_KEYSTORE_BASE64` | Base64-encoded `release.jks` (`base64 -w 0 release.jks`) |
| `RELEASE_KEYSTORE_PASSWORD` | Password for the release keystore |
| `RELEASE_KEY_ALIAS` | Key alias (e.g., `hinata`) |
| `RELEASE_KEY_PASSWORD` | Password for the key alias |

---

## 🏷️ Version Management

Version codes are centrally managed in `gradle.properties`:
```properties
hinata.versionCode=1
hinata.versionName=1.0.0
```

Before tagging a new release:
1. Increment `hinata.versionCode` by 1.
2. Update `hinata.versionName` according to [Semantic Versioning](https://semver.org) (e.g., `1.1.0`).
3. Commit and push the changes.

---

## 📄 License

```
Copyright 2026 HINATA AI Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0
```
