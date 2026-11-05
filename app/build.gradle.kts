import java.io.FileInputStream
import java.util.Properties

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
    id("com.google.devtools.ksp")
    // Google services Gradle plugin (activated when google-services.json is present)
    id("com.google.gms.google-services") apply false
}

// Conditionally apply google-services plugin if configuration file exists
if (file("google-services.json").exists()) {
    apply(plugin = "com.google.gms.google-services")
}

// Read version information from gradle.properties
val hinataVersionCode: Int = (project.findProperty("hinata.versionCode") as? String)?.toIntOrNull() ?: 1
val hinataVersionName: String = (project.findProperty("hinata.versionName") as? String) ?: "1.0.0"

// Resolve Gemini API key from local.properties or environment variable
val localProperties = Properties()
val localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    localProperties.load(FileInputStream(localPropertiesFile))
}
val resolvedGeminiApiKey: String = System.getenv("GEMINI_API_KEY")
    ?: localProperties.getProperty("GEMINI_API_KEY")
    ?: ""

android {
    namespace = "com.hinata.ai"
    compileSdk = 35
    buildToolsVersion = "35.0.0"

    defaultConfig {
        applicationId = "com.hinata.ai"
        minSdk = 26
        targetSdk = 35
        versionCode = hinataVersionCode
        versionName = hinataVersionName

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }

        buildConfigField("String", "GEMINI_API_KEY", "\"$resolvedGeminiApiKey\"")
        buildConfigField("String", "APP_VERSION_NAME", "\"$hinataVersionName\"")
        buildConfigField("int", "APP_VERSION_CODE", "$hinataVersionCode")
    }

    signingConfigs {
        create("release") {
            val keystorePath = System.getenv("KEYSTORE_FILE") ?: (project.findProperty("KEYSTORE_FILE") as? String)
            val storePass = System.getenv("KEYSTORE_PASSWORD") ?: (project.findProperty("KEYSTORE_PASSWORD") as? String)
            val keyAl = System.getenv("KEY_ALIAS") ?: (project.findProperty("KEY_ALIAS") as? String)
            val keyPass = System.getenv("KEY_PASSWORD") ?: (project.findProperty("KEY_PASSWORD") as? String)

            if (!keystorePath.isNullOrEmpty() && file(keystorePath).exists()) {
                storeFile = file(keystorePath)
                storePassword = storePass
                keyAlias = keyAl
                keyPassword = keyPass
            } else {
                // Graceful fallback for local development or unsigned CI runs
                storeFile = signingConfigs.getByName("debug").storeFile
                storePassword = signingConfigs.getByName("debug").storePassword
                keyAlias = signingConfigs.getByName("debug").keyAlias
                keyPassword = signingConfigs.getByName("debug").keyPassword
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
        debug {
            applicationIdSuffix = ".debug"
            isDebuggable = true
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }

    lint {
        abortOnError = true
        checkReleaseBuilds = false
        disable += setOf("MissingTranslation", "TypographyFractions", "TypographyQuotes")
    }
}

dependencies {
    // AndroidX & Core KTX
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")

    // Jetpack Compose & Material 3 (BOM)
    implementation(platform("androidx.compose:compose-bom:2024.11.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.navigation:navigation-compose:2.8.4")

    // Google Gemini Generative AI SDK
    implementation("com.google.ai.client.generativeai:generativeai:0.9.0")

    // Firebase (BOM)
    implementation(platform("com.google.firebase:firebase-bom:33.6.0"))
    implementation("com.google.firebase:firebase-auth-ktx")
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("com.google.firebase:firebase-analytics-ktx")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.9.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.2.1")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.6.1")
}
