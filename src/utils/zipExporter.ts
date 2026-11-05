import JSZip from 'jszip';
import { ANDROID_PROJECT_FILES } from '../android_code/projectFiles';
import { GRADLE_WRAPPER_JAR_BASE64 } from '../android_code/gradleWrapperJarBase64';

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

  // Add official Gradle 8.9 Wrapper Jar (binary)
  root.file('gradle/wrapper/gradle-wrapper.jar', GRADLE_WRAPPER_JAR_BASE64, { base64: true });

  root.file(
    'local.properties.example',
    `# Location of the Android SDK. This is only used by Gradle.
sdk.dir=/Users/username/Library/Android/sdk
GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
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
