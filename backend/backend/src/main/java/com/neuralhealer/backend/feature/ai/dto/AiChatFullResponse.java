package com.neuralhealer.backend.feature.ai.dto;

import java.util.List;
import java.util.UUID;

/**
 * Full AI chat response returned to the frontend.
 * Includes all fields from the external AI API plus the session ID.
 * <p>
 * Example:
 * <pre>
 * {
 *   "sessionId": "a1b2c3d4...",
 *   "answer": "أفهم إنك بتمر بوقت صعب...",
 *   "intent": "emotional_support",
 *   "confidence": 0.94,
 *   "emotion": "sad",
 *   "emotionConfidence": 87.3,
 *   "userText": "عندي قلق ومش عارف انام",
 *   "audioBase64": "base64...",
 *   "updatedHistory": [["human","..."],["ai","..."]]
 * }
 * </pre>
 */
public record AiChatFullResponse(
        UUID sessionId,
        String answer,
        String intent,
        double confidence,
        String emotion,
        Double emotionConfidence,
        String userText,
        String audioBase64,
        List<List<String>> updatedHistory) {

    /**
     * Build a full response from the AI service response + session ID.
     */
    public static AiChatFullResponse from(UUID sessionId, AiChatResponse aiResponse) {
        if (aiResponse == null) {
            return null;
        }
        return new AiChatFullResponse(
                sessionId,
                aiResponse.answer(),
                aiResponse.intent(),
                aiResponse.confidence(),
                aiResponse.emotion(),
                aiResponse.emotionConfidence(),
                aiResponse.userText(),
                aiResponse.audioBase64(),
                aiResponse.updatedHistory()
        );
    }

    /**
     * Build a simple text-only response (for backward compatibility / error cases).
     */
    public static AiChatFullResponse simple(UUID sessionId, String answer) {
        return new AiChatFullResponse(
                sessionId,
                answer,
                null,
                0.0,
                null,
                null,
                null,
                null,
                null
        );
    }

    public boolean hasEmotion() {
        return emotion != null && !emotion.isBlank();
    }

    public boolean hasAudio() {
        return audioBase64 != null && !audioBase64.isBlank();
    }
}
