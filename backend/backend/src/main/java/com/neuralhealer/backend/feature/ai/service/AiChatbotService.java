package com.neuralhealer.backend.feature.ai.service;

import com.neuralhealer.backend.feature.ai.dto.AiChatResponse;
import com.neuralhealer.backend.feature.ai.dto.AiHealthResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;

/**
 * Service for communicating with external AI Chatbot API.
 * Handles health checks, question/answer flow, and error handling.
 */
@Service
@Slf4j
public class AiChatbotService {

    private final RestTemplate aiRestTemplate;
    private final String baseUrl;
    private final String healthEndpoint;
    private final String askEndpoint;
    private final String apiKey;
    private final String ngrokSkipHeader;

    private LocalDateTime lastHealthCheck;
    private boolean lastHealthStatus = false;

    public AiChatbotService(
            RestTemplate aiRestTemplate,
            @Value("${ai.chatbot.base-url}") String baseUrl,
            @Value("${ai.chatbot.health-endpoint:/health}") String healthEndpoint,
            @Value("${ai.chatbot.ask-endpoint:/chat}") String askEndpoint,
            @Value("${ai.chatbot.api-key:}") String apiKey,
            @Value("${ai.chatbot.ngrok-skip-browser-warning:false}") String ngrokSkipHeader) {
        this.aiRestTemplate = aiRestTemplate;
        this.baseUrl = baseUrl;
        this.healthEndpoint = healthEndpoint;
        this.askEndpoint = askEndpoint;
        this.apiKey = apiKey;
        this.ngrokSkipHeader = ngrokSkipHeader;
    }

    /**
     * Check AI API health status.
     * Result is cached for 1 minute to avoid hammering the AI service.
     */
    @Cacheable(value = "aiHealthCache", unless = "#result == null")
    public AiHealthResponse checkHealth() {
        try {
            String url = baseUrl + healthEndpoint;
            log.debug("Checking AI health at: {}", url);

            ResponseEntity<String> response = aiRestTemplate.getForEntity(url, String.class);

            boolean isHealthy = response.getStatusCode().is2xxSuccessful();
            lastHealthStatus = isHealthy;
            lastHealthCheck = LocalDateTime.now();

            String message = isHealthy ? "AI connected" : "AI connection issue";
            log.debug("AI health check: {}", message);

            return new AiHealthResponse(isHealthy, message, lastHealthCheck);

        } catch (RestClientException e) {
            log.error("AI health check failed: {}", e.getMessage());
            lastHealthStatus = false;
            lastHealthCheck = LocalDateTime.now();
            return new AiHealthResponse(false, "AI not connected: " + e.getMessage(), lastHealthCheck);
        }
    }

    /**
     * Quick check if AI is available based on cached health status.
     */
public boolean isAiAvailable() {
    // Re-check if last check was more than 2 minutes ago or never checked
    if (lastHealthCheck == null || 
        lastHealthCheck.isBefore(LocalDateTime.now().minusMinutes(2))) {
        checkHealth();
    }
    return lastHealthStatus;
}
    /**
     * Send a question to AI and get response.
     * Handles Arabic text with proper UTF-8 encoding.
     *
     * @param question The question to ask (supports Arabic)
     * @return AI response with answer and sources
     * @throws RestClientException if AI is unavailable or request fails
     */
    public AiChatResponse askQuestion(String question, java.util.List<java.util.List<String>> conversationHistory) {
        try {
            String url = baseUrl + askEndpoint;
            log.debug("Sending question to AI: {} (length: {} chars)",
                    question.substring(0, Math.min(50, question.length())), question.length());

            // Create request with proper headers for Arabic text and API Key
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept-Charset", "UTF-8");
            if (apiKey != null && !apiKey.isEmpty()) {
                headers.set("x-api-key", apiKey);
            }
            if ("true".equalsIgnoreCase(ngrokSkipHeader)) {
                headers.set("ngrok-skip-browser-warning", "true");
            }

            com.neuralhealer.backend.feature.ai.dto.AiChatEngineRequest requestBody = 
                new com.neuralhealer.backend.feature.ai.dto.AiChatEngineRequest(question, conversationHistory);
            HttpEntity<com.neuralhealer.backend.feature.ai.dto.AiChatEngineRequest> entity = new HttpEntity<>(requestBody, headers);

            // Send POST request
            ResponseEntity<AiChatResponse> response = aiRestTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    AiChatResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                AiChatResponse aiResponse = response.getBody();
                log.debug("AI response received: answer length={}",
                        aiResponse.answer() != null ? aiResponse.answer().length() : 0);
                return aiResponse;
            } else {
                throw new RestClientException("AI returned non-successful status: " + response.getStatusCode());
            }

        } catch (RestClientException e) {
            log.error("Error calling AI API: {}", e.getMessage(), e);
            throw new RestClientException("AI request failed: " + e.getMessage(), e);
        }
    }

    public AiChatResponse askVoice(org.springframework.web.multipart.MultipartFile file, 
                                 java.util.List<java.util.List<String>> conversationHistory) {
    try {
        String url = baseUrl + "/voice";
        log.info("🎤 Sending voice to AI at URL: {}", url);
        log.info("🎤 File name: {}, size: {} bytes, content type: {}", 
            file.getOriginalFilename(), file.getSize(), file.getContentType());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        if (apiKey != null && !apiKey.isEmpty()) {
            headers.set("x-api-key", apiKey);
        }
        if ("true".equalsIgnoreCase(ngrokSkipHeader)) {
            headers.set("ngrok-skip-browser-warning", "true");
        }

        org.springframework.util.LinkedMultiValueMap<String, Object> body = 
            new org.springframework.util.LinkedMultiValueMap<>();
        
        // ✅ Fix: wrap file properly with filename so Python accepts it
        org.springframework.core.io.ByteArrayResource fileResource = 
            new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename() != null ? 
                        file.getOriginalFilename() : "voice.wav";
                }
            };
        
        body.add("file", fileResource);
        
        try {
            String historyJson = new com.fasterxml.jackson.databind.ObjectMapper()
                .writeValueAsString(conversationHistory);
            body.add("conversation_history", historyJson);
            log.info("🎤 History JSON: {}", historyJson);
        } catch (com.fasterxml.jackson.core.JsonProcessingException e) {
            log.error("Failed to serialize history", e);
        }

        HttpEntity<org.springframework.util.LinkedMultiValueMap<String, Object>> entity = 
            new HttpEntity<>(body, headers);

        log.info("🎤 Sending multipart request to Python...");
        
        ResponseEntity<AiChatResponse> response = aiRestTemplate.exchange(
            url, HttpMethod.POST, entity, AiChatResponse.class);

        log.info("🎤 Voice response status: {}", response.getStatusCode());
        log.info("🎤 audio_base64 is null: {}", 
            response.getBody() == null || response.getBody().audioBase64() == null);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody();
        } else {
            throw new RestClientException("AI returned non-successful status: " + 
                response.getStatusCode());
        }

    } catch (RestClientException e) {
        log.error("❌ Error calling AI voice API: {}", e.getMessage(), e);
        throw new RestClientException("AI request failed: " + e.getMessage(), e);
    } catch (java.io.IOException e) {
        log.error("❌ Failed to read uploaded file bytes: {}", e.getMessage(), e);
        throw new RestClientException("Failed to read voice file: " + e.getMessage());
    }
}

    /**
     * Get the last health check time.
     */
    public LocalDateTime getLastHealthCheck() {
        return lastHealthCheck;
    }
}
