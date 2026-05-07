package com.neuralhealer.backend.feature.ai.dto;

// Removed unused import
import java.util.UUID;

/**
 * Enhanced response for AI chat that includes the session ID.
 */
public record AiSessionChatResponse(
                UUID sessionId,
                String answer,
                String userText,
                String audioBase64,
                String intent,
                Double confidence) {
}
