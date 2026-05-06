package com.neuralhealer.backend.feature.ai.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Request DTO for external AI chatbot engine.
 */
public record AiChatEngineRequest(
        @JsonProperty("user_input") String userInput,
        @JsonProperty("conversation_history") List<List<String>> conversationHistory) {
}
