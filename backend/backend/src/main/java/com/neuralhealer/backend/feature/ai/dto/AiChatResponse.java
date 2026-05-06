package com.neuralhealer.backend.feature.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Response DTO from external AI chatbot API.
 */
public record AiChatResponse(
        @JsonProperty("response") String answer,
        @JsonProperty("updated_history") List<List<String>> updatedHistory,
        @JsonProperty("intent") String intent,
        @JsonProperty("confidence") double confidence,
        @JsonProperty("user_text") String userText,
        @JsonProperty("audio_base64") String audioBase64) {
}
