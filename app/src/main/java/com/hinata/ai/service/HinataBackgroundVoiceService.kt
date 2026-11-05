package com.hinata.ai.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.hinata.ai.HinataApplication
import com.hinata.ai.MainActivity
import com.hinata.ai.R

/**
 * Foreground Service for Always-On Voice Assistant functionality.
 * Runs with foregroundServiceType="microphone" complying with Android 14+ background execution policies.
 */
class HinataBackgroundVoiceService : Service() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createServiceNotification()
        startForeground(NOTIFICATION_ID, notification)
        return START_STICKY
    }

    private fun createServiceNotification(): Notification {
        val openIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            openIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, HinataApplication.CHANNEL_VOICE_SERVICE_ID)
            .setContentTitle("HINATA AI Active")
            .setContentText("Listening locally for 'Hey HINATA' - Privacy Protected")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        const val NOTIFICATION_ID = 1001
    }
}
