package com.hinata.ai.audio

import android.content.Context
import android.os.Bundle
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import android.util.Log
import java.util.*

enum class VoiceEmotion {
    GREETING, SUCCESS, EXPLAINING, CARING, PLAYFUL, STANDARD
}

enum class AnimeVoicePreset(val pitch: Float, val rate: Float) {
    HINATA_SWEET(1.28f, 1.06f),
    HINATA_IDOL(1.36f, 1.14f),
    HINATA_GENTLE(1.18f, 0.98f),
    HINATA_KUUDERE(1.12f, 1.04f)
}

/**
 * HINATA AI Anime Voice Personality Engine for Android.
 * Calibrates sweet, expressive female anime vocal delivery with pitch/rate inflection
 * across Bengali (বাংলা), Hindi (हिन्दी), and English.
 */
class HinataAnimeTtsEngine(
    private val context: Context,
    private val onInitComplete: (Boolean) -> Unit
) : TextToSpeech.OnInitListener {

    private var tts: TextToSpeech? = TextToSpeech(context, this)
    var currentPreset: AnimeVoicePreset = AnimeVoicePreset.HINATA_SWEET
    var onLipSyncFrame: ((Float) -> Unit)? = null

    val canonicalGreetings = mapOf(
        "bn" to "হাই! আমি হিনাটা। বলো, আজ তোমার জন্য কী করতে পারি?",
        "en" to "Hello! I'm Hinata. I'm ready to help you!",
        "hi" to "हाय! मैं हिनाटा हूँ। बताओ, आज मैं तुम्हारी क्या मदद करूँ?"
    )

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            setupVoicePreferences()
            onInitComplete(true)
        } else {
            Log.e("HinataTTS", "Failed to initialize Android TextToSpeech")
            onInitComplete(false)
        }
    }

    private fun setupVoicePreferences() {
        tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
            override fun onStart(utteranceId: String?) {
                onLipSyncFrame?.invoke(0.85f)
            }

            override fun onDone(utteranceId: String?) {
                onLipSyncFrame?.invoke(0.0f)
            }

            override fun onError(utteranceId: String?) {
                onLipSyncFrame?.invoke(0.0f)
            }

            override fun onRangeStart(utteranceId: String?, start: Int, end: Int, frame: Int) {
                onLipSyncFrame?.invoke(1.0f)
            }
        })
    }

    fun speak(
        text: String,
        language: String = "en",
        emotion: VoiceEmotion = VoiceEmotion.STANDARD,
        onDone: (() -> Unit)? = null
    ) {
        val locale = when (language.lowercase()) {
            "bn" -> Locale("bn", "IN")
            "hi" -> Locale("hi", "IN")
            else -> Locale.US
        }
        tts?.language = locale

        var pitch = currentPreset.pitch
        var rate = currentPreset.rate

        when (emotion) {
            VoiceEmotion.GREETING -> { pitch *= 1.04f; rate *= 1.03f }
            VoiceEmotion.SUCCESS -> { pitch *= 1.08f; rate *= 1.06f }
            VoiceEmotion.EXPLAINING -> { pitch *= 0.95f; rate *= 0.98f }
            VoiceEmotion.CARING -> { pitch *= 0.98f; rate *= 0.93f }
            VoiceEmotion.PLAYFUL -> { pitch *= 1.05f; rate *= 1.04f }
            else -> {}
        }

        tts?.setPitch(pitch)
        tts?.setSpeechRate(rate)

        val params = Bundle().apply {
            putString(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "hinata_${System.currentTimeMillis()}")
        }

        tts?.speak(text, TextToSpeech.QUEUE_FLUSH, params, "hinata_speech")
    }

    fun shutdown() {
        tts?.stop()
        tts?.shutdown()
        tts = null
    }
}
