package com.neuralhealer.backend.feature.ai.service;

import com.neuralhealer.backend.feature.ai.dto.AiChatResponse;
import com.neuralhealer.backend.feature.ai.dto.AiHealthResponse;
import com.neuralhealer.backend.feature.ai.util.ConversationHistoryNormalizer;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service for communicating with external AI Chatbot API.
 * Handles health checks, question/answer flow, and error handling.
 * <p>
 * All outgoing requests to the AI engine are normalized to ensure
 * conversation_history uses strict "human" / "ai" roles in the format:
 * <pre>[["human", "msg"], ["ai", "msg"]]</pre>
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
        if (lastHealthCheck == null) {
            checkHealth();
        }
        return lastHealthStatus;
    }

    /**
     * Send a question to the AI /chat endpoint.
     * <p>
     * The conversation history is normalized before sending to ensure
     * all roles are strictly "human" or "ai" in API format:
     * <pre>[["human", "message"], ["ai", "response"]]</pre>
     *
     * @param question The current user message (supports Arabic)
     * @param conversationHistory Raw history from any source — will be normalized
     * @return AI response with answer, intent, confidence, emotion, updated_history, etc.
     * @throws RestClientException if AI is unavailable or request fails
     */
    public AiChatResponse askQuestion(String question, List<List<String>> conversationHistory) {
        try {
            String url = baseUrl + askEndpoint;
            log.debug("Sending question to AI /chat: {} (length: {} chars)",
                    question.substring(0, Math.min(50, question.length())), question.length());

            // Normalize history before sending to API (ensures clean human/ai roles)
            List<List<String>> normalizedHistory = ConversationHistoryNormalizer.normalizeHistory(conversationHistory);
            log.debug("History normalized to {} turns for AI /chat request", normalizedHistory.size());

            // Build request body: {"user_input": "...", "conversation_history": [[...]]}
            com.neuralhealer.backend.feature.ai.dto.AiChatEngineRequest requestBody =
                new com.neuralhealer.backend.feature.ai.dto.AiChatEngineRequest(question, normalizedHistory);

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

            HttpEntity<com.neuralhealer.backend.feature.ai.dto.AiChatEngineRequest> entity =
                    new HttpEntity<>(requestBody, headers);

            // Send POST request to /chat
            ResponseEntity<AiChatResponse> response = aiRestTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    AiChatResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                AiChatResponse aiResponse = response.getBody();
                log.debug("AI /chat response received: answer length={}, intent={}, hasEmotion={}",
                        aiResponse.answer() != null ? aiResponse.answer().length() : 0,
                        aiResponse.intent(),
                        aiResponse.hasEmotion());
                return aiResponse;
            } else {
                throw new RestClientException("AI returned non-successful status: " + response.getStatusCode());
            }

        } catch (RestClientException e) {
            log.error("Error calling AI /chat API: {}", e.getMessage(), e);
            throw new RestClientException("AI /chat request failed: " + e.getMessage(), e);
        }
    }

    /**
     * Send a voice file to the AI /voice endpoint.
     * <p>
     * The conversation_history is sent as a <b>stringified JSON</b> in the form-data,
     * exactly as the AI voice endpoint expects:
     * <pre>
     * data = {"conversation_history": '[["human","hi"],["ai","hello"]]'}
     * </pre>
     * NOT a raw JSON array. The history is normalized before stringification.
     *
     * @param file The audio file (mp3, wav, m4a, ogg, webm)
     * @param conversationHistory Raw history — will be normalized and stringified
     * @return AI response with transcribed user_text, answer, emotion, audio_base64, etc.
     * @throws RestClientException if AI is unavailable or request fails
     */
    public AiChatResponse askVoice(MultipartFile file, List<List<String>> conversationHistory) {
        try {
            String url = baseUrl + "/voice";
            log.debug("Sending voice to AI /voice: file size={} bytes, contentType={}",
                    file.getSize(), file.getContentType());

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

            // Wrap file with proper filename so Python accepts it
            org.springframework.core.io.ByteArrayResource fileResource =
                    new org.springframework.core.io.ByteArrayResource(file.getBytes()) {
                        @Override
                        public String getFilename() {
                            return file.getOriginalFilename() != null
                                    ? file.getOriginalFilename()
                                    : "voice.wav";
                        }
                    };
            body.add("file", fileResource);

            // Normalize and stringify history for multipart/form-data
            // CRITICAL: conversation_history must be a JSON STRING, not a raw array
            String historyJson = ConversationHistoryNormalizer.toJson(conversationHistory);
            body.add("conversation_history", historyJson);
            log.debug("Voice request history JSON: {} chars", historyJson.length());

            HttpEntity<org.springframework.util.LinkedMultiValueMap<String, Object>> entity =
                    new HttpEntity<>(body, headers);

            ResponseEntity<AiChatResponse> response = aiRestTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    AiChatResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                AiChatResponse aiResponse = response.getBody();
                log.debug("AI /voice response received: userText={}, answer length={}, hasEmotion={}",
                        aiResponse.userText(),
                        aiResponse.answer() != null ? aiResponse.answer().length() : 0,
                        aiResponse.hasEmotion());
                return aiResponse;
            } else {
                throw new RestClientException("AI returned non-successful status: " + response.getStatusCode());
            }

        } catch (RestClientException e) {
            log.error("Error calling AI /voice API: {}", e.getMessage(), e);
            throw new RestClientException("AI /voice request failed: " + e.getMessage(), e);
        } catch (java.io.IOException e) {
            log.error("Failed to read uploaded voice file: {}", e.getMessage(), e);
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
