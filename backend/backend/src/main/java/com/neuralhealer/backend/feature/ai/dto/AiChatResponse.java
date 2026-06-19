package com.neuralhealer.backend.feature.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Response DTO from external AI chatbot API.
 * Matches the expected format from the AI engine:
 * {
 *   "response": "...",
 *   "intent": "emotional_support",
 *   "confidence": 0.94,
 *   "emotion": "sad",
 *   "emotion_confidence": 87.3,
 *   "updated_history": [["human","..."],["ai","..."]],
 *   "user_text": "...",
 *   "audio_base64": "..."
 * }
 */
public record AiChatResponse(
        @JsonProperty("response") String answer,
        @JsonProperty("updated_history") List<List<String>> updatedHistory,
        @JsonProperty("intent") String intent,
        @JsonProperty("confidence") double confidence,
        @JsonProperty("emotion") String emotion,
        @JsonProperty("emotion_confidence") Double emotionConfidence,
        @JsonProperty("user_text") String userText,
        @JsonProperty("audio_base64") String audioBase64) {

    /**
     * Returns true if this response includes an emotion classification.
     */
    public boolean hasEmotion() {
        return emotion != null && !emotion.isBlank();
    }

    /**
     * Returns the emotion confidence as a percentage string (e.g., "87.3%").
     */
    public String emotionConfidencePercent() {
        if (emotionConfidence == null) return null;
        return String.format("%.1f%%", emotionConfidence);
    }
}
