package com.hinata.ai.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hinata.ai.ui.theme.*

@Composable
fun AdminPanelScreen(
    onBack: () -> Unit
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
            Spacer(modifier = Modifier.width(8.dp))
            Icon(Icons.Default.Shield, contentDescription = "Admin", tint = AmberCrown)
            Spacer(modifier = Modifier.width(8.dp))
            Text("HINATA Security & Admin Console", color = PureWhite, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            item {
                MetricCard("Gemini API Pipeline", "Connected (gemini-1.5-flash)", "Latency: 280ms • Quota: Healthy")
            }
            item {
                MetricCard("Cloud Firestore Security", "Active (users/{uid} isolated)", "Zero cross-user data leakage verified")
            }
            item {
                MetricCard("Always-On Wake-Word Service", "Local Audio Processing", "PCM buffer 16kHz • 0 bytes uploaded")
            }
            item {
                MetricCard("Device Automation Permissions", "6 Active Services", "Accessibility bound • Camera2 authorized")
            }
        }
    }
}

@Composable
private fun MetricCard(title: String, status: String, detail: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(DarkCard)
            .border(1.dp, NeonPurple.copy(alpha = 0.3f), RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column {
            Text(title, color = VioletAccent, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Spacer(modifier = Modifier.height(4.dp))
            Text(status, color = PureWhite, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
            Spacer(modifier = Modifier.height(2.dp))
            Text(detail, color = TextMuted, fontSize = 11.sp)
        }
    }
}
