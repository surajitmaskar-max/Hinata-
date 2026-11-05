package com.hinata.ai.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tasks")
data class TaskEntity(
    @PrimaryKey
    val id: String,
    val command: String,
    val summary: String,
    val intent: String,
    val language: String,
    val timestamp: Long,
    val status: String,
    val voiceResponse: String?,
    val verified: Boolean
)
