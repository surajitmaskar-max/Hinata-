package com.hinata.ai.automation

import android.content.Context
import android.content.Intent
import android.hardware.camera2.CameraManager
import android.media.AudioManager
import android.net.Uri
import android.provider.Settings
import android.util.Log

/**
 * Executes discrete verified system actions on Android.
 * Dispatches telephony intents, controls Camera2 flashlight, volume, and launches apps.
 */
class DeviceActionExecutor(private val context: Context) {

    private val cameraManager = context.getSystemService(Context.CAMERA_SERVICE) as? CameraManager
    private val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager

    fun toggleTorch(state: String? = null): Boolean {
        return try {
            val cameraId = cameraManager?.cameraIdList?.firstOrNull() ?: return false
            val turnOn = state?.lowercase() == "on" || state?.lowercase() == "true"
            cameraManager.setTorchMode(cameraId, turnOn)
            true
        } catch (e: Exception) {
            Log.e("DeviceActionExecutor", "Error controlling flashlight", e)
            false
        }
    }

    fun setVolume(percent: Int) {
        audioManager?.let { am ->
            val max = am.getStreamMaxVolume(AudioManager.STREAM_MUSIC)
            val target = ((percent / 100f) * max).toInt()
            am.setStreamVolume(AudioManager.STREAM_MUSIC, target, AudioManager.FLAG_SHOW_UI)
        }
    }

    fun dispatchCall(contactOrNumber: String) {
        val intent = Intent(Intent.ACTION_CALL).apply {
            data = Uri.parse("tel:${Uri.encode(contactOrNumber)}")
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    fun dispatchSms(recipient: String, message: String) {
        val intent = Intent(Intent.ACTION_SENDTO).apply {
            data = Uri.parse("smsto:${Uri.encode(recipient)}")
            putExtra("sms_body", message)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    fun launchPackage(packageName: String): Boolean {
        val launchIntent = context.packageManager.getLaunchIntentForPackage(packageName)
        return if (launchIntent != null) {
            launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(launchIntent)
            true
        } else {
            false
        }
    }
}
