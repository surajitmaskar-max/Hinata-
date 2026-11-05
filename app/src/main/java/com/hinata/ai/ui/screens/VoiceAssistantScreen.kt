package com.hinata.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hinata.ai.ui.components.HinataOrbView
import com.hinata.ai.ui.components.OrbState
import com.hinata.ai.ui.theme.*

@Composable
fun VoiceAssistantScreen(
    onBack: () -> Unit,
    onNavigateToHistory: () -> Unit
) {
    var isListening by remember { mutableStateOf(false) }
    var selectedLanguage by remember { mutableStateOf("en") }
    var transcript by remember { mutableStateOf("") }
    var lastReply by remember { mutableStateOf("Hello! I'm Hinata. I'm ready to help you!") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PureBlack)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PureWhite)
            }
            Text("HINATA VOICE ENGINE", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Row(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color(0xFF1E0A38))
                    .padding(4.dp)
            ) {
                listOf("en", "bn", "hi").forEach { lang ->
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .background(if (selectedLanguage == lang) NeonPurple else Color.Transparent)
                            .clickable {
                                selectedLanguage = lang
                                lastReply = when (lang) {
                                    "bn" -> "হাই! আমি হিনাটা। বলো, আজ তোমার জন্য কী করতে পারি?"
                                    "hi" -> "हाय! मैं हिनाटा हूँ। बताओ, आज मैं तुम्हारी क्या मदद करूँ?"
                                    else -> "Hello! I'm Hinata. I'm ready to help you!"
                                }
                            }
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = if (lang == "en") "EN" else if (lang == "bn") "বাং" else "हिं",
                            color = PureWhite,
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }

        // Central Orb
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentAlignment = Alignment.Center
        ) {
            HinataOrbView(
                state = if (isListening) OrbState.LISTENING else OrbState.IDLE,
                sizeDp = 280,
                audioIntensity = if (isListening) 0.8f else 0f,
                onClick = { isListening = !isListening }
            )
        }

        // Live Dialogue Card
        Column(modifier = Modifier.fillMaxWidth()) {
            if (transcript.isNotEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF1E1338))
                        .padding(12.dp)
                ) {
                    Text("\"$transcript\"", color = VioletAccent, fontSize = 12.sp)
                }
                Spacer(modifier = Modifier.height(8.dp))
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(DarkCard)
                    .border(1.dp, NeonPurple.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column {
                    Text("HINATA", color = VioletAccent, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(lastReply, color = PureWhite, fontSize = 14.sp)
                }
            }
        }

        // Mic Button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 16.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(CircleShape)
                    .background(if (isListening) Color(0xFFEF4444) else NeonPurple)
                    .clickable { isListening = !isListening },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isListening) Icons.Default.MicOff else Icons.Default.Mic,
                    contentDescription = "Mic",
                    tint = PureWhite,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
    }
}
