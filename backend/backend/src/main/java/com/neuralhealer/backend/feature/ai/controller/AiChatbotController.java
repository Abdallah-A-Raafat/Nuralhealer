package com.neuralhealer.backend.feature.ai.controller;

import com.neuralhealer.backend.feature.ai.dto.*;
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

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * REST Controller for AI Chatbot.
 * Provides health check and direct question endpoints.
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
                    "خطأ في فحص حالة الذكاء الاصطناعي", // "Error checking AI status" in Arabic
                    LocalDateTime.now()));
        }
    }

    /**
     * Ask AI a question (REST endpoint).
     * Always starts a new session for higher isolation/testing and returns session
     * ID.
     * POST /api/ai/ask
     */
    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal User user) {
        try {
            log.debug("REST AI request received - creating new session");

            // 1. Resolve Patient Profile (PatientId)
            UUID patientId = user.getPatientProfile() != null ? user.getPatientProfile().getId() : null;
            if (patientId == null) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("بروفايل المريض غير موجود لهذا الحساب"));
            }

            // 2. Force a new session
            UUID sessionId = chatStorageService.createNewSession(patientId);

            java.util.List<java.util.List<String>> history = new java.util.ArrayList<>();

            // 3. Save User message
            chatStorageService.saveMessage(sessionId, "PATIENT", request.question());

            // 4. Get AI Response
            AiChatResponse aiResponse = aiChatbotService.askQuestion(request.question(), history);

            // 5. Save AI Response (Async)
            chatStorageService.saveMessage(sessionId, "AI", aiResponse.answer());

            // 6. Wrap in session-aware response
            AiSessionChatResponse response = new AiSessionChatResponse(
                    sessionId,
                    aiResponse.answer());

            return ResponseEntity.ok(response);
        } catch (RestClientException e) {
            log.error("AI request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse("الذكاء الاصطناعي غير متاح حالياً"));
        } catch (Exception e) {
            log.error("Unexpected error in AI request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("حدث خطأ أثناء معالجة السؤال"));
        }
    }

    /**
     * Ask AI a question within an existing session.
     * POST /api/ai/ask/{sessionId}
     */
    @PostMapping("/ask/{sessionId}")
    public ResponseEntity<?> askQuestionInSession(
            @PathVariable UUID sessionId,
            @Valid @RequestBody AiChatRequest request,
            @AuthenticationPrincipal User user) {
        try {
            log.debug("REST AI request received for session: {}", sessionId);

            // 1. Get History BEFORE saving current message
            java.util.List<java.util.List<String>> history = new java.util.ArrayList<>();
            java.util.List<com.neuralhealer.backend.feature.ai.entity.AiChatMessage> previousMessages = chatStorageService.getSessionMessages(sessionId);
            if (previousMessages != null) {
                for (com.neuralhealer.backend.feature.ai.entity.AiChatMessage msg : previousMessages) {
                    java.util.List<String> turn = new java.util.ArrayList<>();
                    turn.add("patient".equalsIgnoreCase(msg.getSenderType().name()) ? "user" : "assistant");
                    turn.add(msg.getContent());
                    history.add(turn);
                }
            }

            // 2. Save User message
            chatStorageService.saveMessage(sessionId, "PATIENT", request.question());

            // 3. Get AI Response
            AiChatResponse aiResponse = aiChatbotService.askQuestion(request.question(), history);

            // 3. Save AI Response (Async)
            chatStorageService.saveMessage(sessionId, "AI", aiResponse.answer());

            // 4. Wrap in session-aware response
            AiSessionChatResponse response = new AiSessionChatResponse(
                    sessionId,
                    aiResponse.answer());

            return ResponseEntity.ok(response);
        } catch (RestClientException e) {
            log.error("AI request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse("الذكاء الاصطناعي غير متاح حالياً"));
        } catch (Exception e) {
            log.error("Unexpected error in AI request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("حدث خطأ أثناء معالجة السؤال"));
        }
    }

    /**
     * Ask AI via Voice.
     * POST /api/ai/voice/{sessionId}
     */
    @PostMapping(value = "/voice/{sessionId}", consumes = "multipart/form-data")
    public ResponseEntity<?> askVoiceInSession(
            @PathVariable UUID sessionId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file,
            @AuthenticationPrincipal User user) {
        try {
            log.debug("REST AI Voice request received for session: {}", sessionId);

            // 1. Get History BEFORE saving current message (since we don't have text yet for user, history ends at last msg)
            java.util.List<java.util.List<String>> history = new java.util.ArrayList<>();
            java.util.List<com.neuralhealer.backend.feature.ai.entity.AiChatMessage> previousMessages = chatStorageService.getSessionMessages(sessionId);
            if (previousMessages != null) {
                for (com.neuralhealer.backend.feature.ai.entity.AiChatMessage msg : previousMessages) {
                    java.util.List<String> turn = new java.util.ArrayList<>();
                    turn.add("patient".equalsIgnoreCase(msg.getSenderType().name()) ? "user" : "assistant");
                    turn.add(msg.getContent());
                    history.add(turn);
                }
            }

            // 2. Get AI Response via Voice
            AiChatResponse aiResponse = aiChatbotService.askVoice(file, history);

            if (aiResponse.userText() != null && !aiResponse.userText().isBlank()) {
                chatStorageService.saveMessage(sessionId, "PATIENT", aiResponse.userText());
            }

            // 3. Save AI Response
            chatStorageService.saveMessage(sessionId, "AI", aiResponse.answer());

            AiSessionChatResponse response = new AiSessionChatResponse(
                    sessionId,
                    aiResponse.answer());

            return ResponseEntity.ok(response);
        } catch (RestClientException e) {
            log.error("AI Voice request failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new ErrorResponse("AI Service unavailable"));
        } catch (Exception e) {
            log.error("Unexpected error in AI Voice request: {}", e.getMessage(), e);
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

