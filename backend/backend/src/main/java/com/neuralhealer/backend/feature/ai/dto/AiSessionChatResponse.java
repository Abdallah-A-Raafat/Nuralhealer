package com.neuralhealer.backend.feature.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.UUID;

public record AiSessionChatResponse(
        UUID sessionId,
        String answer,
        @JsonProperty("audio_base64") String audioBase64,
        @JsonProperty("user_text") String userText,
        String intent,
        double confidence) {
}