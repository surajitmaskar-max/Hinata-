import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../android_code/projectFiles';

/**
 * Bundles the entire production-ready Android Studio project into a downloadable ZIP archive.
 * Includes GitHub Actions workflows, build.gradle.kts, AndroidManifest.xml, Jetpack Compose screens,
 * Accessibility Service, Notification Listener, Room Database, and Voice Engine.
 */
export async function downloadAndroidProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('HINATA-AI') || zip;

  // Add all Android Studio project files
  for (const file of ANDROID_PROJECT_FILES) {
    root.file(file.path, file.content);
  }

  // Add standard Gradle Wrapper configuration files
  root.file(
    'gradle/wrapper/gradle-wrapper.properties',
    `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
`
  );

  root.file(
    'gradle.properties',
    `# Project-wide Gradle settings.
org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.enableJetifier=false
kotlin.code.style=official

# Semantic Version Management for HINATA AI
hinata.versionCode=1
hinata.versionName=1.0.0
`
  );

  root.file(
    'gradlew',
    `#!/bin/sh
exec gradle "$@"
`
  );

  root.file(
    'gradlew.bat',
    `@rem Gradle startup script for Windows
gradle %*
`
  );

  root.file(
    'local.properties.example',
    `# Location of the Android SDK. This is only used by Gradle.
sdk.dir=/Users/username/Library/Android/sdk
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
`
  );

  root.file(
    '.gitignore',
    `# Built outputs
*.apk
*.aab
build/
app/build/
.gradle/
.idea/
local.properties
*.jks
*.keystore
google-services.json
`
  );

  // GitHub Actions CI/CD workflows
  root.file(
    '.github/workflows/build-apk.yml',
    `name: Build & Verify Android APK

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    name: Assemble Android APK
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'
      - uses: android-actions/setup-android@v3
      - run: chmod +x gradlew
      - name: Build Release APK
        run: ./gradlew assembleRelease --stacktrace
      - uses: actions/upload-artifact@v4
        with:
          name: HINATA-AI-release-apk
          path: app/build/outputs/apk/release/*.apk
`
  );

  root.file(
    '.github/workflows/release.yml',
    `name: Publish Release APK

on:
  push:
    tags:
      - 'v*'

permissions:
  contents: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'gradle'
      - uses: android-actions/setup-android@v3
      - run: chmod +x gradlew
      - run: ./gradlew assembleRelease --stacktrace
      - uses: softprops/action-gh-release@v2
        with:
          name: HINATA AI \${{ github.ref_name }}
          files: app/build/outputs/apk/release/*.apk
        env:
          GITHUB_TOKEN: \${{ secrets.GITHUB_TOKEN }}
`
  );

  const blob = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'HINATA-AI-AndroidStudio-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
