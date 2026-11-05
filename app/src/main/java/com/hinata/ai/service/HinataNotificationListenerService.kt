package com.hinata.ai.service

import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log

/**
 * Reads incoming user notifications for hands-free message alerts.
 */
class HinataNotificationListenerService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification?) {
        val packageName = sbn?.packageName ?: return
        val extras = sbn.notification.extras
        val title = extras.getString("android.title") ?: ""
        val text = extras.getCharSequence("android.text")?.toString() ?: ""

        if (title.isNotEmpty() && text.isNotEmpty()) {
            Log.d("HinataNotification", "Notification from $packageName: $title - $text")
        }
    }
}
