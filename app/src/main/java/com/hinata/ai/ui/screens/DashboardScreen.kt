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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hinata.ai.ui.components.HinataOrbView
import com.hinata.ai.ui.components.OrbState
import com.hinata.ai.ui.theme.*

@Composable
fun DashboardScreen(
    onNavigate: (String) -> Unit
) {
    var orbState by remember { mutableStateOf(OrbState.IDLE) }
    var statusText by remember { mutableStateOf("Tap to speak") }
    var audioLevel by remember { mutableStateOf(0f) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(PureBlack)
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // 1. TOP HEADER (Reference Image)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 8.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = { onNavigate("settings") }) {
                Icon(
                    imageVector = Icons.Default.Menu,
                    contentDescription = "Menu",
                    tint = PureWhite,
                    modifier = Modifier.size(28.dp)
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "HINATA",
                    color = PureWhite,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 2.sp
                )
                Text(
                    text = "AI Assistant",
                    color = TextMuted,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Box(
                modifier = Modifier
                    .clip(CircleShape)
                    .background(Color(0xFF261042))
                    .border(1.dp, NeonPurple.copy(alpha = 0.5f), CircleShape)
                    .clickable { /* Premium dialog */ }
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Star,
                        contentDescription = "Premium",
                        tint = AmberCrown,
                        modifier = Modifier.size(14.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "Premium",
                        color = VioletAccent,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // 2. WELCOME SECTION (Reference Image)
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(top = 4.dp)
        ) {
            Text(
                text = "Hello, Surajit!",
                color = PureWhite,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "How can I help you today?",
                color = TextMuted,
                fontSize = 14.sp
            )
        }

        // 3. MAIN ANIMATED PURPLE HOLOGRAPHIC ORB
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                HinataOrbView(
                    state = orbState,
                    sizeDp = 250,
                    audioIntensity = audioLevel,
                    onClick = {
                        if (orbState == OrbState.IDLE) {
                            orbState = OrbState.LISTENING
                            statusText = "Listening..."
                            audioLevel = 0.7f
                        } else {
                            orbState = OrbState.IDLE
                            statusText = "Tap to speak"
                            audioLevel = 0f
                        }
                    }
                )

                Spacer(modifier = Modifier.height(16.dp))

                // 4. VOICE STATUS PILL (Reference Image)
                Box(
                    modifier = Modifier
                        .clip(CircleShape)
                        .background(Color(0xFF200B3B))
                        .border(1.dp, NeonPurple.copy(alpha = 0.6f), CircleShape)
                        .clickable { onNavigate("voice") }
                        .padding(horizontal = 20.dp, vertical = 10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.GraphicEq,
                            contentDescription = "Waveform",
                            tint = VioletAccent,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = statusText,
                            color = PureWhite,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }

        // 5. 4 CIRCULAR QUICK ACTIONS (Reference Image)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            QuickActionButton(icon = Icons.Default.Call, label = "Call") { onNavigate("devices") }
            QuickActionButton(icon = Icons.Default.ChatBubble, label = "Message") { onNavigate("chat") }
            QuickActionButton(icon = Icons.Default.Apps, label = "Open App") { onNavigate("automation") }
            QuickActionButton(icon = Icons.Default.Settings, label = "Settings") { onNavigate("settings") }
        }

        // 6. UPGRADE TO PREMIUM CARD (Reference Image)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(
                    Brush.horizontalGradient(
                        listOf(Color(0xFF2B0A4E), Color(0xFF130424))
                    )
                )
                .border(1.dp, NeonPurple.copy(alpha = 0.4f), RoundedCornerShape(24.dp))
                .clickable { /* Open Premium */ }
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF4C1D95)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Bolt,
                            contentDescription = "Upgrade",
                            tint = FuchsiaGlow,
                            modifier = Modifier.size(24.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column {
                        Text(
                            text = "Upgrade to Premium",
                            color = PureWhite,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Unlock more amazing features!",
                            color = VioletAccent.copy(alpha = 0.8f),
                            fontSize = 11.sp
                        )
                    }
                }
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = "Go",
                    tint = VioletAccent
                )
            }
        }

        // 7. BOTTOM NAVIGATION BAR (Reference Image)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp, bottom = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            BottomNavItem(icon = Icons.Default.Home, label = "Home", isSelected = true) { }
            DividerLine()
            BottomNavItem(icon = Icons.Default.History, label = "History", isSelected = false) { onNavigate("history") }
            DividerLine()
            BottomNavItem(icon = Icons.Default.GridView, label = "Tools", isSelected = false) { onNavigate("devices") }
            DividerLine()
            BottomNavItem(icon = Icons.Default.Person, label = "Profile", isSelected = false) { onNavigate("settings") }
        }
    }
}

@Composable
fun QuickActionButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    onClick: () -> Unit
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .background(Color(0xFF1B0A33))
                .border(1.dp, NeonPurple.copy(alpha = 0.4f), CircleShape)
                .clickable { onClick() },
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = icon,
                contentDescription = label,
                tint = VioletAccent,
                modifier = Modifier.size(22.dp)
            )
        }
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = label,
            color = PureWhite,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun BottomNavItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier
            .clickable { onClick() }
            .padding(horizontal = 12.dp)
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            tint = if (isSelected) VioletAccent else TextMuted,
            modifier = Modifier.size(22.dp)
        )
        Text(
            text = label,
            color = if (isSelected) VioletAccent else TextMuted,
            fontSize = 10.sp,
            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
        )
    }
}

@Composable
fun DividerLine() {
    Box(
        modifier = Modifier
            .height(20.dp)
            .width(1.dp)
            .background(Color(0xFF2D184E))
    )
}
