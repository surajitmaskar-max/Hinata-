package com.hinata.ai.engine

import android.content.Context
import android.util.Log
import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.hinata.ai.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

data class TaskStep(
    val stepNumber: Int,
    val actionType: String,
    val actionName: String,
    val parameters: Map<String, String> = emptyMap(),
    val verificationCheck: String
)

data class EngineTaskResult(
    val summary: String,
    val intent: String,
    val steps: List<TaskStep>,
    val requiresConfirmation: Boolean,
    val confirmationPrompt: String?,
    val spokenResponse: String
)

/**
 * Gemini Task Engine for HINATA AI.
 * Uses gemini-1.5-flash / gemini-2.0-flash to interpret user voice requests into
 * discrete Android intents, hardware operations, and system automation directives.
 */
class GeminiTaskEngine(private val context: Context) {

    private val model: GenerativeModel by lazy {
        GenerativeModel(
            modelName = "gemini-1.5-flash",
            apiKey = BuildConfig.GEMINI_API_KEY
        )
    }

    suspend fun parseAndPlan(command: String, language: String): EngineTaskResult = withContext(Dispatchers.IO) {
        val systemInstruction = """
            You are HINATA AI, a high-performance Android personal assistant.
            Decompose the following user request into JSON steps executable on Android:
            Action types supported:
            - toggle_torch (parameters: {"state": "on"|"off"|"toggle"})
            - adjust_setting (parameters: {"setting": "volume"|"brightness", "value": "0-100"})
            - make_call (parameters: {"contactOrNumber": string}) -> ALWAYS requiresConfirmation: true
            - send_sms (parameters: {"recipient": string, "message": string}) -> ALWAYS requiresConfirmation: true
            - launch_app (parameters: {"appName": string, "packageName": string})
            - open_maps (parameters: {"destination": string})
            - general_answer

            PERMANENT CREATOR IDENTITY:
            Creator / Developer: Surajit Naskar.
            If asked "Who created you?", "Who is your creator?", "Who developed you?", "Who made HINATA AI?", "Who is behind HINATA AI?", "Who is your owner?", "Who built you?", or "Who is Surajit Naskar?":
            - In English: "My creator is Surajit Naskar. He created and developed HINATA AI."
            - In Bengali (বাংলা): "আমার Creator হলেন Surajit Naskar। তিনিই HINATA AI তৈরি ও ডেভেলপ করেছেন।"
            - In Hindi (हिन्दी): "मेरे Creator Surajit Naskar हैं। उन्होंने HINATA AI को बनाया और विकसित किया है।"

            Respond ONLY with a valid JSON object matching this schema:
            {
              "summary": "Short summary",
              "intent": "Intent category",
              "requiresConfirmation": boolean,
              "confirmationPrompt": "Prompt if confirmation needed or null",
              "spokenResponse": "Sweet, expressive anime voice reply in ${language}",
              "steps": [
                {
                  "stepNumber": 1,
                  "actionType": "action_type",
                  "actionName": "Description of step",
                  "parameters": {},
                  "verificationCheck": "Validation criteria"
                }
              ]
            }
        """.trimIndent()

        try {
            if (BuildConfig.GEMINI_API_KEY.isBlank() || BuildConfig.GEMINI_API_KEY.startsWith("PLACEHOLDER")) {
                return@withContext fallbackLocalPlan(command, language)
            }

            val response = model.generateContent(
                content {
                    text("$systemInstruction\n\nUser command: $command")
                }
            )

            val rawText = response.text ?: ""
            val jsonStart = rawText.indexOf('{')
            val jsonEnd = rawText.lastIndexOf('}')

            if (jsonStart != -1 && jsonEnd != -1) {
                val cleanJson = rawText.substring(jsonStart, jsonEnd + 1)
                parseJsonResponse(JSONObject(cleanJson))
            } else {
                fallbackLocalPlan(command, language)
            }
        } catch (e: Exception) {
            Log.e("GeminiTaskEngine", "Gemini parsing error", e)
            fallbackLocalPlan(command, language)
        }
    }

    private fun parseJsonResponse(json: JSONObject): EngineTaskResult {
        val stepsList = mutableListOf<TaskStep>()
        val stepsArray = json.optJSONArray("steps") ?: JSONArray()
        for (i in 0 until stepsArray.length()) {
            val sObj = stepsArray.getJSONObject(i)
            val paramsObj = sObj.optJSONObject("parameters")
            val paramsMap = mutableMapOf<String, String>()
            paramsObj?.keys()?.forEach { k ->
                paramsMap[k] = paramsObj.getString(k)
            }

            stepsList.add(
                TaskStep(
                    stepNumber = sObj.optInt("stepNumber", i + 1),
                    actionType = sObj.optString("actionType", "generic"),
                    actionName = sObj.optString("actionName", "Execute task"),
                    parameters = paramsMap,
                    verificationCheck = sObj.optString("verificationCheck", "Step complete")
                )
            )
        }

        return EngineTaskResult(
            summary = json.optString("summary", "Command processed"),
            intent = json.optString("intent", "task"),
            steps = stepsList,
            requiresConfirmation = json.optBoolean("requiresConfirmation", false),
            confirmationPrompt = if (json.has("confirmationPrompt") && !json.isNull("confirmationPrompt")) json.getString("confirmationPrompt") else null,
            spokenResponse = json.optString("spokenResponse", "Task complete, sir!")
        )
    }

    private fun fallbackLocalPlan(command: String, language: String): EngineTaskResult {
        val lower = command.lowercase()
        return when {
            lower.contains("torch") || lower.contains("flashlight") || lower.contains("টর্চ") || lower.contains("टॉर्च") -> {
                EngineTaskResult(
                    summary = "Toggle Camera LED Flashlight",
                    intent = "device_control",
                    steps = listOf(
                        TaskStep(1, "toggle_torch", "Toggle Device Flashlight", mapOf("state" to "toggle"), "CameraCharacteristics FLASH_INFO verified")
                    ),
                    requiresConfirmation = false,
                    confirmationPrompt = null,
                    spokenResponse = if (language == "bn") "টর্চলাইট চালু করা হয়েছে।" else if (language == "hi") "टॉर्च चालू कर दी गई है।" else "Flashlight turned on!"
                )
            }
            lower.contains("call") || lower.contains("ফোন") || lower.contains("कॉल") -> {
                EngineTaskResult(
                    summary = "Initiate Phone Call Intent",
                    intent = "phone_call",
                    steps = listOf(
                        TaskStep(1, "make_call", "Place outgoing phone call", mapOf("contactOrNumber" to command), "ACTION_CALL intent prepared")
                    ),
                    requiresConfirmation = true,
                    confirmationPrompt = "Confirm placing phone call?",
                    spokenResponse = if (language == "bn") "কাকে কল করতে চান?" else if (language == "hi") "किसे कॉल करना चाहते हैं?" else "Who would you like me to call?"
                )
            }
            lower.contains("creator") || lower.contains("created you") || lower.contains("developed you") ||
            lower.contains("made hinata") || lower.contains("who built you") || lower.contains("surajit") ||
            lower.contains("কে বানিয়েছে") || lower.contains("কে তৈরি করেছে") || lower.contains("তোমার নির্মাতা") ||
            lower.contains("किसने बनाया") || lower.contains("किसने विकसित") || lower.contains("तुम्हारा निर्माता") -> {
                EngineTaskResult(
                    summary = "Identify Creator & Developer: Surajit Naskar",
                    intent = "creator_identity",
                    steps = listOf(
                        TaskStep(1, "synthesize_speech", "Acknowledge Creator Surajit Naskar", emptyMap(), "Creator recognized")
                    ),
                    requiresConfirmation = false,
                    confirmationPrompt = null,
                    spokenResponse = if (language == "bn")
                        "আমার Creator হলেন Surajit Naskar। তিনিই HINATA AI তৈরি ও ডেভেলপ করেছেন।"
                    else if (language == "hi")
                        "मेरे Creator Surajit Naskar हैं। उन्होंने HINATA AI को बनाया और विकसित किया है।"
                    else
                        "My creator is Surajit Naskar. He created and developed HINATA AI."
                )
            }
            else -> {
                EngineTaskResult(
                    summary = "Processed Directive: $command",
                    intent = "general_command",
                    steps = listOf(
                        TaskStep(1, "general_answer", "Respond to user inquiry", emptyMap(), "Response synthesized")
                    ),
                    requiresConfirmation = false,
                    confirmationPrompt = null,
                    spokenResponse = if (language == "bn") "আমি বুঝতে পেরেছি! আপনার কাজটি করছি।" else if (language == "hi") "मैंने समझ लिया! मैं आपका काम कर रही हूँ।" else "Understood! I'm on it."
                )
            }
        }
    }
}
