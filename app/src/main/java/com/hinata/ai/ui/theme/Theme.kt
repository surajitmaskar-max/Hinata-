package com.hinata.ai.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable

private val DarkColorScheme = darkColorScheme(
    primary = NeonPurple,
    secondary = VioletAccent,
    tertiary = FuchsiaGlow,
    background = PureBlack,
    surface = DarkSurface,
    onPrimary = PureWhite,
    onSecondary = PureWhite,
    onBackground = PureWhite,
    onSurface = PureWhite,
    surfaceVariant = DarkCard
)

@Composable
fun HinataAITheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = DarkColorScheme,
        content = content
    )
}
