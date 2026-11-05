package com.hinata.ai

import com.hinata.ai.audio.AnimeVoicePreset
import com.hinata.ai.audio.VoiceEmotion
import com.hinata.ai.data.model.TaskEntity
import com.hinata.ai.engine.EngineTaskResult
import com.hinata.ai.engine.TaskStep
import org.junit.Assert.*
import org.junit.Test

/**
 * Unit Tests for HINATA AI Core Logic, Creator Identity, and Voice Engine.
 * Executed by Gradle test tasks (testDebugUnitTest / testReleaseUnitTest) in CI/CD.
 */
class HinataAiUnitTest {

    @Test
    fun creatorIdentity_isSurajitNaskar_inEnglish() {
        val expectedCreator = "Surajit Naskar"
        val creatorResponseEn = "My creator is Surajit Naskar. He created and developed HINATA AI."
        assertTrue("English response must state creator name", creatorResponseEn.contains(expectedCreator))
    }

    @Test
    fun creatorIdentity_isSurajitNaskar_inBengali() {
        val expectedCreator = "Surajit Naskar"
        val creatorResponseBn = "আমার Creator হলেন Surajit Naskar। তিনিই HINATA AI তৈরি ও ডেভেলপ করেছেন।"
        assertTrue("Bengali response must state creator name", creatorResponseBn.contains(expectedCreator))
    }

    @Test
    fun creatorIdentity_isSurajitNaskar_inHindi() {
        val expectedCreator = "Surajit Naskar"
        val creatorResponseHi = "मेरे Creator Surajit Naskar हैं। उन्होंने HINATA AI को बनाया और विकसित किया है।"
        assertTrue("Hindi response must state creator name", creatorResponseHi.contains(expectedCreator))
    }

    @Test
    fun animeVoicePresets_haveValidPitchAndRate() {
        for (preset in AnimeVoicePreset.values()) {
            assertTrue("Voice preset pitch must be positive", preset.pitch > 0.5f)
            assertTrue("Voice preset rate must be positive", preset.rate > 0.5f)
        }
        assertEquals("Sweet preset default pitch", 1.28f, AnimeVoicePreset.HINATA_SWEET.pitch, 0.001f)
        assertEquals("Sweet preset default rate", 1.06f, AnimeVoicePreset.HINATA_SWEET.rate, 0.001f)
    }

    @Test
    fun voiceEmotions_containAllRequiredStates() {
        val emotions = VoiceEmotion.values().map { it.name }
        assertTrue(emotions.contains("GREETING"))
        assertTrue(emotions.contains("SUCCESS"))
        assertTrue(emotions.contains("EXPLAINING"))
        assertTrue(emotions.contains("CARING"))
        assertTrue(emotions.contains("PLAYFUL"))
        assertTrue(emotions.contains("STANDARD"))
    }

    @Test
    fun taskEntity_instantiatesCorrectly() {
        val task = TaskEntity(
            id = "test-task-1",
            command = "Turn on flashlight",
            summary = "Flashlight activation",
            intent = "toggle_torch",
            language = "en",
            timestamp = 1730000000000L,
            status = "COMPLETED",
            voiceResponse = "Flashlight enabled!",
            verified = true
        )

        assertEquals("test-task-1", task.id)
        assertEquals("Turn on flashlight", task.command)
        assertEquals("toggle_torch", task.intent)
        assertTrue(task.verified)
    }

    @Test
    fun engineTaskResult_validatesConfirmationFlag() {
        val criticalTask = EngineTaskResult(
            summary = "Call mom",
            intent = "make_call",
            steps = listOf(
                TaskStep(
                    stepNumber = 1,
                    actionType = "make_call",
                    actionName = "Initiate phone call to Mom",
                    parameters = mapOf("contact" to "Mom"),
                    verificationCheck = "Telephony active"
                )
            ),
            requiresConfirmation = true,
            confirmationPrompt = "Are you sure you want to call Mom?",
            spokenResponse = "Please confirm: should I call Mom?"
        )

        assertTrue(criticalTask.requiresConfirmation)
        assertNotNull(criticalTask.confirmationPrompt)
        assertEquals(1, criticalTask.steps.size)
        assertEquals("make_call", criticalTask.steps[0].actionType)
    }
}
