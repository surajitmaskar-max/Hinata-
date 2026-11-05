package com.hinata.ai

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log

/**
 * HINATA AI Application Entry Point.
 * Initializes persistent notification channels for Always-On wake-word service
 * and configures application-wide telemetry & diagnostics.
 */
class HinataApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this
        createNotificationChannels()
        Log.i(TAG, "HINATA AI initialized successfully - Version: ${BuildConfig.APP_VERSION_NAME}")
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // 1. Foreground microphone wake-word channel
            val voiceChannel = NotificationChannel(
                CHANNEL_VOICE_SERVICE_ID,
                getString(R.string.channel_voice_service),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.channel_voice_description)
                setShowBadge(false)
            }
            notificationManager.createNotificationChannel(voiceChannel)

            // 2. High priority assistant alerts channel
            val assistantChannel = NotificationChannel(
                CHANNEL_ASSISTANT_ALERTS_ID,
                "HINATA Assistant Alerts",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Task execution confirmations and urgent security alerts"
                enableVibration(true)
            }
            notificationManager.createNotificationChannel(assistantChannel)
        }
    }

    companion object {
        const val TAG = "HinataAI"
        const val CHANNEL_VOICE_SERVICE_ID = "hinata_voice_service"
        const val CHANNEL_ASSISTANT_ALERTS_ID = "hinata_assistant_alerts"

        lateinit var instance: HinataApplication
            private set
    }
}
