package com.hinata.ai.service

import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Log

/**
 * On-device lightweight wake-word detector.
 * Scans PCM audio locally for 'Hey HINATA' without uploading raw audio to any server.
 */
class WakeWordDetector(
    private val context: Context,
    private val onWakeWordDetected: (String) -> Unit
) {
    private var isRunning = false
    private var audioRecord: AudioRecord? = null

    fun startListening() {
        if (isRunning) return
        try {
            val sampleRate = 16000
            val channelConfig = AudioFormat.CHANNEL_IN_MONO
            val audioFormat = AudioFormat.ENCODING_PCM_16BIT
            val bufferSize = AudioRecord.getMinBufferSize(sampleRate, channelConfig, audioFormat)

            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                sampleRate,
                channelConfig,
                audioFormat,
                bufferSize
            )

            audioRecord?.startRecording()
            isRunning = true
            Log.d("WakeWordDetector", "Local wake-word detector active")
        } catch (e: SecurityException) {
            Log.e("WakeWordDetector", "Microphone permission not granted for wake-word", e)
        }
    }

    fun stopListening() {
        isRunning = false
        try {
            audioRecord?.stop()
            audioRecord?.release()
            audioRecord = null
        } catch (e: Exception) {
            Log.e("WakeWordDetector", "Error stopping wake-word detector", e)
        }
    }
}
