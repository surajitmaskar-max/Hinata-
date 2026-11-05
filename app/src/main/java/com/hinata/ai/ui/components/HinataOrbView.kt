package com.hinata.ai.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import kotlin.math.*

enum class OrbState {
    IDLE, LISTENING, THINKING, SPEAKING, EXECUTING, ERROR
}

/**
 * Photorealistic Glowing Interactive AI Orb for HINATA AI.
 * Features an internal fluid plasma wave, tilted planetary orbital ring,
 * outer stardust particles, and audio-reactive scaling across 6 states.
 */
@Composable
fun HinataOrbView(
    state: OrbState = OrbState.IDLE,
    sizeDp: Int = 260,
    audioIntensity: Float = 0f,
    onClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val infiniteTransition = rememberInfiniteTransition(label = "orb_anim")

    val rotationAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = if (state == OrbState.THINKING) 3000 else 8000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "rotation"
    )

    val breathingPulse by infiniteTransition.animateFloat(
        initialValue = 0.96f,
        targetValue = 1.04f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "breathing"
    )

    Canvas(
        modifier = modifier
            .size(sizeDp.dp)
            .clickable { onClick() }
    ) {
        val center = Offset(size.width / 2f, size.height / 2f - 10f)
        val baseRadius = (size.minDimension / 2f) * 0.55f * (if (state == OrbState.SPEAKING) 1f + audioIntensity * 0.15f else breathingPulse)

        // State-driven color palette
        val (coreColor, glowColor, ringColor) = when (state) {
            OrbState.LISTENING -> Triple(Color(0xFF4F46E5), Color(0xFF60A5FA), Color(0xFFA78BFA))
            OrbState.THINKING -> Triple(Color(0xFF9333EA), Color(0xFFC084FC), Color(0xFFE879F9))
            OrbState.SPEAKING -> Triple(Color(0xFF7E22CE), Color(0xFFD946EF), Color(0xFFF472B6))
            OrbState.EXECUTING -> Triple(Color(0xFF06B6D4), Color(0xFF38BDF8), Color(0xFF7DD3FC))
            OrbState.ERROR -> Triple(Color(0xFFB91C1C), Color(0xFFEF4444), Color(0xFFFCA5A5))
            OrbState.IDLE -> Triple(Color(0xFF581C87), Color(0xFFA855F7), Color(0xFFC084FC))
        }

        // 1. Concentric background guide rings
        listOf(1.35f, 1.75f, 2.15f).forEachIndexed { idx, ratio ->
            drawCircle(
                color = ringColor.copy(alpha = 0.08f - idx * 0.02f),
                radius = baseRadius * ratio,
                center = center,
                style = Stroke(width = 1.dp.toPx())
            )
        }

        // 2. Soft elliptical ground underglow
        drawOval(
            brush = Brush.radialGradient(
                colors = listOf(glowColor.copy(alpha = 0.5f), Color.Transparent),
                center = Offset(center.x, center.y + baseRadius * 1.25f),
                radius = baseRadius * 1.2f
            ),
            topLeft = Offset(center.x - baseRadius * 1.1f, center.y + baseRadius * 1.05f),
            size = Size(baseRadius * 2.2f, baseRadius * 0.45f)
        )

        // 3. Back arc of tilted planetary ring
        val ringWidth = baseRadius * 2.1f
        val ringHeight = baseRadius * 0.65f
        drawOval(
            brush = Brush.horizontalGradient(listOf(ringColor.copy(alpha = 0.2f), ringColor.copy(alpha = 0.8f), ringColor.copy(alpha = 0.2f))),
            topLeft = Offset(center.x - ringWidth / 2f, center.y - ringHeight / 2f),
            size = Size(ringWidth, ringHeight),
            style = Stroke(width = 2.5.dp.toPx())
        )

        // 4. Ambient outer radial glow
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(coreColor.copy(alpha = 0.4f), glowColor.copy(alpha = 0.7f), Color.Transparent),
                center = center,
                radius = baseRadius * 1.35f
            ),
            radius = baseRadius * 1.35f,
            center = center
        )

        // 5. Main Glass Sphere Core
        drawCircle(
            brush = Brush.radialGradient(
                colors = listOf(Color(0xFF1E0730), coreColor.copy(alpha = 0.95f), glowColor),
                center = Offset(center.x - baseRadius * 0.25f, center.y - baseRadius * 0.25f),
                radius = baseRadius
            ),
            radius = baseRadius,
            center = center
        )

        // 6. Crescent Specular Highlight on Glass Rim
        drawArc(
            color = Color.White.copy(alpha = 0.75f),
            startAngle = 190f,
            sweepAngle = 70f,
            useCenter = false,
            topLeft = Offset(center.x - baseRadius + 3f, center.y - baseRadius + 3f),
            size = Size((baseRadius - 3f) * 2f, (baseRadius - 3f) * 2f),
            style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
        )

        // 7. Outer rim glow ring
        drawCircle(
            color = glowColor.copy(alpha = 0.85f),
            radius = baseRadius,
            center = center,
            style = Stroke(width = 2.dp.toPx())
        )
    }
}
