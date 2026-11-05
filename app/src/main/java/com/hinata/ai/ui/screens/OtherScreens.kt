package com.hinata.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.hinata.ai.ui.theme.*

@Composable
fun ChatScreen(onBack: () -> Unit) {
    var inputText by remember { mutableStateOf("") }
    val messages = remember {
        mutableStateListOf(
            "Hinata" to "Hello! I'm Hinata. What would you like to explore or automate today?"
        )
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PureBlack)
            .padding(16.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PureWhite)
            }
            Text("HINATA AI CHAT", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(messages.size) { idx ->
                val (sender, text) = messages[idx]
                val isMe = sender == "You"
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = if (isMe) Arrangement.End else Arrangement.Start
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(16.dp))
                            .background(if (isMe) NeonPurple else DarkCard)
                            .border(1.dp, if (isMe) NeonPurple else NeonPurple.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
                            .padding(12.dp)
                    ) {
                        Text(text, color = PureWhite, fontSize = 13.sp)
                    }
                }
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            OutlinedTextField(
                value = inputText,
                onValueChange = { inputText = it },
                placeholder = { Text("Ask Hinata anything...", color = TextMuted) },
                modifier = Modifier.weight(1f),
                singleLine = true
            )
            Spacer(modifier = Modifier.width(8.dp))
            IconButton(
                onClick = {
                    if (inputText.isNotBlank()) {
                        messages.add("You" to inputText)
                        val query = inputText
                        inputText = ""
                        messages.add("Hinata" to "Executing directive for '$query'...")
                    }
                }
            ) {
                Icon(Icons.Default.Send, contentDescription = "Send", tint = VioletAccent)
            }
        }
    }
}

@Composable
fun AutomationCenterScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PureBlack)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PureWhite)
            }
            Text("AUTOMATION CENTER", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Multi-Step Android Routines", color = VioletAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)

        Spacer(modifier = Modifier.height(12.dp))
        AutomationCard("Night Mode Routine", "Dim brightness to 15%, enable DND, set 6:30 AM alarm")
        Spacer(modifier = Modifier.height(8.dp))
        AutomationCard("Commute Setup", "Launch Maps, open Spotify playlist, set volume to 80%")
        Spacer(modifier = Modifier.height(8.dp))
        AutomationCard("Emergency SOS", "Turn on flashlight, dispatch SOS SMS, prepare call")
    }
}

@Composable
fun DeviceControlScreen(onBack: () -> Unit) {
    var torchOn by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PureBlack)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PureWhite)
            }
            Text("DEVICE HARDWARE CONTROLS", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(DarkCard)
                .border(1.dp, NeonPurple.copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                .clickable { torchOn = !torchOn }
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.FlashlightOn,
                        contentDescription = "Torch",
                        tint = if (torchOn) AmberCrown else TextMuted
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text("LED Flashlight", color = PureWhite, fontWeight = FontWeight.Bold)
                }
                Switch(checked = torchOn, onCheckedChange = { torchOn = it })
            }
        }
    }
}

@Composable
fun TaskHistoryScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PureBlack)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PureWhite)
            }
            Text("TASK EXECUTION HISTORY", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))
        HistoryItem("Calibrate hardware and bind accessibility", "COMPLETED", "12 min ago")
        Spacer(modifier = Modifier.height(8.dp))
        HistoryItem("Query Camera2 characteristics for LED", "COMPLETED", "25 min ago")
    }
}

@Composable
fun MemoryScreen(onBack: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PureBlack)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PureWhite)
            }
            Text("PERSONAL AI MEMORY VAULT", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))
        Text("Approved Personal Memories (Cloud Firestore Isolated)", color = TextMuted, fontSize = 12.sp)

        Spacer(modifier = Modifier.height(12.dp))
        MemoryCard("Preferred Language", "English & Bengali", "Preference")
        Spacer(modifier = Modifier.height(8.dp))
        MemoryCard("Voice Persona", "Hinata Sweet (Anime inflections)", "Voice")
    }
}

@Composable
fun SettingsScreen(
    onBack: () -> Unit,
    onOpenAccessibility: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PureBlack)
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = PureWhite)
            }
            Text("SETTINGS & PERMISSIONS", color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(16.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(DarkCard)
                .clickable { onOpenAccessibility() }
                .padding(16.dp)
        ) {
            Text("Configure Android Accessibility Service", color = VioletAccent, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // About HINATA AI - Creator Identity Section
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(DarkCard)
                .border(1.dp, NeonPurple.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                .padding(20.dp)
        ) {
            Column {
                Text("About HINATA AI", color = VioletAccent, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(6.dp))
                Text("HINATA AI", color = PureWhite, fontSize = 18.sp, fontWeight = FontWeight.ExtraBold)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Created & Developed by Surajit Naskar", color = VioletAccent, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Spacer(modifier = Modifier.height(4.dp))
                Text("Tagline: \"Your Intelligent World.\"", color = TextMuted, fontSize = 11.sp)
            }
        }
    }
}

@Composable
private fun AutomationCard(title: String, desc: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(DarkCard)
            .border(1.dp, NeonPurple.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column {
            Text(title, color = PureWhite, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(desc, color = TextMuted, fontSize = 12.sp)
        }
    }
}

@Composable
private fun HistoryItem(title: String, status: String, time: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(DarkCard)
            .border(1.dp, NeonPurple.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(title, color = PureWhite, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                Text(time, color = TextMuted, fontSize = 11.sp)
            }
            Text(status, color = Color(0xFF34D399), fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun MemoryCard(label: String, value: String, category: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(DarkCard)
            .border(1.dp, NeonPurple.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column {
            Text(category.uppercase(), color = VioletAccent, fontSize = 10.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(2.dp))
            Text(label, color = PureWhite, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Text(value, color = TextMuted, fontSize = 12.sp)
        }
    }
}
