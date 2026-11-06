package com.hinata.ai

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.hinata.ai.ui.screens.*
import com.hinata.ai.ui.theme.HinataAITheme

class MainActivity : ComponentActivity() {

    private val requiredPermissions = arrayOf(
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.CALL_PHONE,
        Manifest.permission.SEND_SMS,
        Manifest.permission.READ_CONTACTS
    )

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        // Handle runtime permission grants
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestRequiredPermissions()

        setContent {
            HinataAITheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()

                    NavHost(navController = navController, startDestination = "dashboard") {
                        composable("dashboard") {
                            DashboardScreen(
                                onNavigate = { route -> navController.navigate(route) }
                            )
                        }
                        composable("voice") {
                            VoiceAssistantScreen(
                                onBack = { navController.popBackStack() },
                                onNavigateToHistory = { navController.navigate("history") }
                            )
                        }
                        composable("auth") {
                            AuthScreen(
                                onBack = { navController.popBackStack() },
                                onAuthSuccess = { navController.navigate("dashboard") { popUpTo("auth") { inclusive = true } } }
                            )
                        }
                        composable("chat") {
                            ChatScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("automation") {
                            AutomationCenterScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("devices") {
                            DeviceControlScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("history") {
                            TaskHistoryScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("memory") {
                            MemoryScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("admin") {
                            AdminPanelScreen(
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("settings") {
                            SettingsScreen(
                                onBack = { navController.popBackStack() },
                                onOpenAccessibility = { openAccessibilitySettings() }
                            )
                        }
                    }
                }
            }
        }
    }

    private fun requestRequiredPermissions() {
        val permissionsToRequest = requiredPermissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }.toTypedArray()

        if (permissionsToRequest.isNotEmpty()) {
            permissionLauncher.launch(permissionsToRequest)
        }
    }

    private fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
        startActivity(intent)
    }
}
