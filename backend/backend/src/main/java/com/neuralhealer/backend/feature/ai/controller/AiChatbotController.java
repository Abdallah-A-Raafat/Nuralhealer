package com.neuralhealer.backend.feature.ai.controller;

import com.neuralhealer.backend.feature.ai.dto.AiChatFullResponse;
import com.neuralhealer.backend.feature.ai.dto.AiChatRequest;
import com.neuralhealer.backend.feature.ai.dto.AiChatResponse;
import com.neuralhealer.backend.feature.ai.dto.AiHealthResponse;
import com.neuralhealer.backend.shared.entity.User;
import com.neuralhealer.backend.feature.ai.service.AiChatbotService;
import com.neuralhealer.backend.feature.ai.service.ChatStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * REST Controller for AI Chatbot.
 * Provides health check, text chat, and voice chat endpoints.
 * <p>
 * All chat endpoints return {@link AiChatFullResponse} which includes:
 * sessionId, answer, intent, confidence, emotion, emotionConfidence, userText, audioBase64, updatedHistory.
 */
@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Slf4j
public class AiChatbotController {

    private final AiChatbotService aiChatbotService;
    private final ChatStorageService chatStorageService;

    /**
     * Check AI health status.
     * GET /api/ai/health
     */
    @GetMapping("/health")
    public ResponseEntity<AiHealthResponse> checkHealth() {
        try {
            AiHealthResponse health = aiChatbotService.checkHealth();
            return ResponseEntity.ok(health);
        } catch (Exception e) {
            log.error("Health check endpoint error: {}", e.getMessage());
            return ResponseEntity.ok(new AiHealthResponse(
                    false,
                    "خطأ في فحص حالة الذكاء الاصطناعي",
                    LocalDateTime.now()));
        }
    }

    /**
     * Ask AI a question — starts a NEW session.
     * <p>
     * POST /api/ai/ask
     * <p>
     * Request body:
     * <pre>{"question": "عندي قلق ومش عارف انام", "country": "EG"}</pre>
     * <p>
     * Response — {@link AiChatFullResponse}:
     * <pre>
     * {
     *   "sessionId": "a1b2c3d4...",
     *   "answer": "أفهم إنك بتمر بوقت صعب...",
     *   "intent": "emotional_support",
     *   "confidence": 0.94,
     *   "emotion": null,
     *   "emotionConfidence": null,
     *   "userText": null,
     *   "audioBase64": null,
     *   "updatedHistory": [["human","عندي قلق..."],["ai","أفهم إنك..."]]
     * }
     * </pre>
     */
    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal User user) {
        try {
            log.debug("REST AI /ask request received — creating new session");

            // 1. Resolve Patient Profile
            UUID patientId = user.getPatientProfile() != null ? user.getPatientProfile().getId() : null;
            if (patientId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("بروفايل المريض غير موجود لهذا الحساب"));
            }

            // 2. Force a new session
            UUID sessionId = chatStorageService.createNewSession(patientId);
            List<List<String>> history = new ArrayList<>();

            // 3. Save User message
            chatStorageService.saveMessage(sessionId, "PATIENT", request.question());

            // 4. Get AI Response (history is normalized inside askQuestion)
            AiChatResponse aiResponse = aiChatbotService.askQuestion(request.question(), history);

            // 5. Store updated_history from AI response for the next turn
            chatStorageService.updateSessionHistory(sessionId, aiResponse.updatedHistory());

            // 6. Save AI Response
            chatStorageService.saveMessage(sessionId, "AI", aiResponse.answer());

            // 7. Return full response with all AI fields
            return ResponseEntity.ok(AiChatFullResponse.from(sessionId, aiResponse));

        } catch (RestClientException e) {
            log.error("AI /ask request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse("الذكاء الاصطناعي غير متاح حالياً"));
        } catch (Exception e) {
            log.error("Unexpected error in AI /ask request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("حدث خطأ أثناء معالجة السؤال"));
        }
    }

    /**
     * Ask AI a question — continues an EXISTING session.
     * <p>
     * POST /api/ai/ask/{sessionId}
     * <p>
     * Sends the stored conversation history (normalized, with DB fallback) to the AI,
     * saves the new message, stores the returned {@code updated_history}, and returns
     * the full AI response.
     */
    @PostMapping("/ask/{sessionId}")
    public ResponseEntity<?> askQuestionInSession(
            @PathVariable UUID sessionId,
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal User user) {
        try {
            log.debug("REST AI /ask request received for session: {}", sessionId);

            // 1. Get stored conversation history (normalized + fallback to DB messages)
            List<List<String>> history = chatStorageService.getSessionHistory(sessionId);

            // 2. Save User message
            chatStorageService.saveMessage(sessionId, "PATIENT", request.question());

            // 3. Get AI Response (history is normalized inside askQuestion)
            AiChatResponse aiResponse = aiChatbotService.askQuestion(request.question(), history);

            // 4. Store updated_history from response for the next turn
            chatStorageService.updateSessionHistory(sessionId, aiResponse.updatedHistory());

            // 5. Save AI Response
            chatStorageService.saveMessage(sessionId, "AI", aiResponse.answer());

            // 6. Return full response with all AI fields
            return ResponseEntity.ok(AiChatFullResponse.from(sessionId, aiResponse));

        } catch (RestClientException e) {
            log.error("AI /ask request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse("الذكاء الاصطناعي غير متاح حالياً"));
        } catch (Exception e) {
            log.error("Unexpected error in AI /ask request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("حدث خطأ أثناء معالجة السؤال"));
        }
    }

    /**
     * Ask AI via Voice — starts a NEW session.
     * <p>
     * POST /api/ai/voice
     * <p>
     * Content-Type: multipart/form-data
     * <p>
     * Form fields:
     * <ul>
     *   <li><b>file</b> — binary audio (.mp3, .wav, .m4a, .ogg, .webm)</li>
     * </ul>
     * <p>
     * The conversation history is empty for a new session.
     * For continuing a voice conversation, use {@code /voice/{sessionId}}.
     */
    @PostMapping(value = "/voice", consumes = "multipart/form-data")
    public ResponseEntity<?> askVoice(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        try {
            log.debug("REST AI /voice request received — creating new session");

            // 1. Resolve Patient Profile
            UUID patientId = user.getPatientProfile() != null ? user.getPatientProfile().getId() : null;
            if (patientId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("بروفايل المريض غير موجود لهذا الحساب"));
            }

            // 2. Force a new voice session
            UUID sessionId = chatStorageService.createVoiceSession(patientId);
            List<List<String>> history = new ArrayList<>();

            // 3. Get AI Response via Voice (history is normalized + stringified inside askVoice)
            AiChatResponse aiResponse = aiChatbotService.askVoice(file, history);

            // 4. Store updated_history from response
            chatStorageService.updateSessionHistory(sessionId, aiResponse.updatedHistory());

            // 5. Save transcribed user message if present
            if (aiResponse.userText() != null && !aiResponse.userText().isBlank()) {
                chatStorageService.saveMessage(sessionId, "PATIENT", aiResponse.userText());
            }

            // 6. Save AI Response
            chatStorageService.saveMessage(sessionId, "AI", aiResponse.answer());

            // 7. Return full response with all AI fields (including audioBase64, userText)
            return ResponseEntity.ok(AiChatFullResponse.from(sessionId, aiResponse));

        } catch (RestClientException e) {
            log.error("AI /voice request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse("AI Service unavailable"));
        } catch (Exception e) {
            log.error("Unexpected error in AI /voice request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error processing voice prompt"));
        }
    }

    /**
     * Ask AI via Voice — continues an EXISTING session.
     * <p>
     * POST /api/ai/voice/{sessionId}
     * <p>
     * Content-Type: multipart/form-data
     * <p>
     * Form fields:
     * <ul>
     *   <li><b>file</b> — binary audio (.mp3, .wav, .m4a, .ogg, .webm)</li>
     * </ul>
     * <p>
     * The stored conversation history is retrieved, normalized, and sent as a
     * stringified JSON array in the multipart form data, exactly as the AI voice
     * endpoint expects.
     */
    @PostMapping(value = "/voice/{sessionId}", consumes = "multipart/form-data")
    public ResponseEntity<?> askVoiceInSession(
            @PathVariable UUID sessionId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal User user) {
        try {
            log.debug("REST AI /voice request received for session: {}", sessionId);

            // 1. Get stored conversation history (normalized + fallback to DB messages)
            List<List<String>> history = chatStorageService.getSessionHistory(sessionId);

            // 2. Get AI Response via Voice (history is normalized + stringified inside askVoice)
            AiChatResponse aiResponse = aiChatbotService.askVoice(file, history);

            // 3. Store updated_history from response for the next turn
            chatStorageService.updateSessionHistory(sessionId, aiResponse.updatedHistory());

            // 4. Save transcribed user message if present
            if (aiResponse.userText() != null && !aiResponse.userText().isBlank()) {
                chatStorageService.saveMessage(sessionId, "PATIENT", aiResponse.userText());
            }

            // 5. Save AI Response
            chatStorageService.saveMessage(sessionId, "AI", aiResponse.answer());

            // 6. Return full response with all AI fields (including audioBase64, userText)
            return ResponseEntity.ok(AiChatFullResponse.from(sessionId, aiResponse));

        } catch (RestClientException e) {
            log.error("AI /voice request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse("AI Service unavailable"));
        } catch (Exception e) {
            log.error("Unexpected error in AI /voice request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error processing voice prompt"));
        }
    }

    /**
     * Simple error response record.
     */
    private record ErrorResponse(String error) {
    }
}
