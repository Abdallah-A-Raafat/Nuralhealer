package com.neuralhealer.backend.feature.ai.service;

import com.neuralhealer.backend.feature.ai.entity.AiChatMessage;
import com.neuralhealer.backend.feature.ai.entity.AiChatSession;
import com.neuralhealer.backend.feature.engagement.entity.Engagement;
import com.neuralhealer.backend.feature.engagement.enums.EngagementStatus;
import com.neuralhealer.backend.feature.ai.repository.AiChatMessageRepository;
import com.neuralhealer.backend.feature.ai.repository.AiChatSessionRepository;
import com.neuralhealer.backend.feature.engagement.repository.EngagementRepository;
import com.neuralhealer.backend.feature.doctor.repository.DoctorProfileRepository;
import com.neuralhealer.backend.feature.doctor.dto.AuthorizedDoctorResponse;
import com.neuralhealer.backend.feature.patient.dto.SessionWithDoctorsResponse;
import com.neuralhealer.backend.feature.ai.util.ConversationHistoryNormalizer;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Service for storing and retrieving AI chat sessions and messages.
 * <p>
 * Handles the stateless conversation history pattern:
 * <ol>
 *   <li>Store {@code updated_history} from AI response after each turn</li>
 *   <li>Send it back in the next request</li>
 *   <li>Fall back to building from DB messages if cache is empty/corrupted</li>
 * </ol>
 * <p>
 * Internal → API role mapping: {@code patient} → {@code human}, {@code ai} → {@code ai}
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatStorageService {

    private final AiChatSessionRepository sessionRepository;
    private final AiChatMessageRepository messageRepository;
    private final EngagementRepository engagementRepository;
    private final DoctorProfileRepository doctorProfileRepository;

    @Transactional
    public UUID getOrCreateSession(UUID patientId) {
        List<AiChatSession> activeSessions =
                sessionRepository.findByPatientIdAndIsActiveTrueOrderByStartedAtDesc(patientId);

        if (!activeSessions.isEmpty()) {
            // Deactivate all except the most recent
            if (activeSessions.size() > 1) {
                activeSessions.stream()
                        .skip(1)
                        .forEach(session -> {
                            session.setIsActive(false);
                            sessionRepository.save(session);
                        });
            }
            return activeSessions.get(0).getId();
        }
        return createNewSession(patientId);
    }

    /**
     * Force create a new active session for a patient.
     */
    @Transactional
    public UUID createNewSession(UUID patientId) {
        AiChatSession newSession = AiChatSession.builder()
                .patientId(patientId)
                .isActive(true)
                .startedAt(LocalDateTime.now())
                .messageCount(0)
                .sessionType("general")
                .sessionTitle("New AI Chat")
                .build();
        return sessionRepository.save(newSession).getId();
    }

    /**
     * Force create a new voice session for a patient.
     */
    @Transactional
    public UUID createVoiceSession(UUID patientId) {
        AiChatSession newSession = AiChatSession.builder()
                .patientId(patientId)
                .isActive(true)
                .startedAt(LocalDateTime.now())
                .messageCount(0)
                .sessionType("voice")
                .sessionTitle("Voice Session")
                .build();
        return sessionRepository.save(newSession).getId();
    }

    /**
     * Get stored conversation history for a session in API format.
     * <p>
     * First tries the cached {@code conversation_history_json} from the AI response.
     * If that's empty or invalid, falls back to building from the individual
     * {@code ai_chat_messages} records (DB messages → API format: patient → human).
     *
     * @param sessionId the session UUID
     * @return normalized history in API format: [["human","msg"],["ai","msg"],...]
     */
    public List<List<String>> getSessionHistory(UUID sessionId) {
        return sessionRepository.findById(sessionId).map(session -> {
            // 1. Try cached conversation_history_json from AI response
            if (session.getConversationHistoryJson() != null && !session.getConversationHistoryJson().isBlank()) {
                try {
                    List<List<String>> parsed = ConversationHistoryNormalizer.fromJson(
                            session.getConversationHistoryJson());
                    if (!parsed.isEmpty()) {
                        log.debug("Loaded history from cache for session {} ({} turns)", sessionId, parsed.size());
                        return parsed;
                    }
                } catch (Exception e) {
                    log.warn("Failed to parse cached history for session {}, falling back to DB messages", sessionId, e);
                }
            }

            // 2. Fallback: build from DB messages (patient → human, ai → ai)
            List<AiChatMessage> messages = messageRepository.findBySessionIdOrderBySentAt(sessionId);
            List<List<String>> built = ConversationHistoryNormalizer.fromDbMessages(messages);
            log.debug("Built history from DB messages for session {} ({} turns)", sessionId, built.size());
            return built;

        }).orElse(new java.util.ArrayList<>());
    }

    /**
     * Build API-format history directly from DB messages for a session.
     * Useful when the cached {@code conversation_history_json} is empty or corrupted.
     *
     * @param sessionId the session UUID
     * @return normalized history in API format
     */
    public List<List<String>> buildHistoryFromMessages(UUID sessionId) {
        List<AiChatMessage> messages = messageRepository.findBySessionIdOrderBySentAt(sessionId);
        return ConversationHistoryNormalizer.fromDbMessages(messages);
    }

    /**
     * Store conversation history from AI response.
     * Call this after each AI response to save updatedHistory.
     * Normalizes the history before saving to ensure clean data.
     */
    @Transactional
    public void updateSessionHistory(UUID sessionId, List<List<String>> history) {
        if (history == null) return;

        // Normalize before storing to ensure clean API-format data
        List<List<String>> normalized = ConversationHistoryNormalizer.normalizeHistory(history);

        sessionRepository.findById(sessionId).ifPresent(session -> {
            try {
                String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(normalized);
                session.setConversationHistoryJson(json);
                sessionRepository.save(session);
                log.debug("Updated session {} history with {} turns", sessionId, normalized.size());
            } catch (Exception e) {
                log.error("Failed to update history for session {}", sessionId, e);
            }
        });
    }

    @Transactional
    public void saveMessage(UUID sessionId, String sender, String content) {
        long start = System.currentTimeMillis();
        try {
            if (sender == null) throw new IllegalArgumentException("sender is null");
            String senderLower = sender.toLowerCase();
            // Validate sender is a known type (patient or ai)
            if (!senderLower.equals("patient") && !senderLower.equals("ai")) {
                throw new IllegalArgumentException("Invalid sender type: " + sender);
            }

            AiChatMessage message = AiChatMessage.builder()
                    .sessionId(sessionId)
                    .senderType(senderLower)  // String field, not enum
                    .content(content)
                    .sentAt(LocalDateTime.now())
                    .build();

            AiChatMessage saved = messageRepository.save(message);
            log.debug("Saved chat message {} for session {}", saved.getId(), sessionId);

            // Update session: increment count and set title from first patient message
            sessionRepository.findById(sessionId).ifPresent(session -> {
                session.setMessageCount((session.getMessageCount() == null ? 0 : session.getMessageCount()) + 1);

                // Auto-generate title from first patient message
                if ("patient".equals(senderLower) && session.getMessageCount() == 1) {
                    String autoTitle = generateSessionTitle(content);
                    session.setSessionTitle(autoTitle);
                }

                sessionRepository.save(session);
            });

            long duration = System.currentTimeMillis() - start;
            if (duration > 500) {
                log.warn("Slow chat message save: {}ms for session {}", duration, sessionId);
            }

        } catch (IllegalArgumentException e) {
            log.error("Invalid sender type '{}' for session {}", sender, sessionId, e);
        } catch (Exception e) {
            log.error("Failed to save chat message for session {}", sessionId, e);
        }
    }

    @Transactional
    public void deleteSession(UUID sessionId) {
        messageRepository.deleteBySessionId(sessionId);
        sessionRepository.deleteById(sessionId);
        log.info("Deleted session {} and all its messages", sessionId);
    }

    public List<AiChatSession> getUserSessions(UUID patientId) {
        return sessionRepository.findByPatientIdOrderByStartedAtDesc(patientId);
    }

    public boolean sessionBelongsToPatient(UUID sessionId, UUID patientId) {
        return sessionRepository.existsByIdAndPatientId(sessionId, patientId);
    }

    public List<AiChatSession> searchSessions(UUID patientId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getUserSessions(patientId);
        }
        return sessionRepository.searchSessions(patientId, query.trim());
    }

    public List<AiChatMessage> getSessionMessages(UUID sessionId) {
        return messageRepository.findBySessionIdOrderBySentAt(sessionId);
    }

    /**
     * Get session messages with patient ID verification for security.
     * Throws SecurityException if session doesn't belong to patient.
     */
    public List<AiChatMessage> getSessionMessages(UUID sessionId, UUID patientId) {
        AiChatSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        if (!session.getPatientId().equals(patientId)) {
            throw new SecurityException("Session does not belong to this patient");
        }

        return messageRepository.findBySessionIdOrderBySentAt(sessionId);
    }

    @Transactional
    public void updateSessionTitle(UUID sessionId, String title) {
        sessionRepository.updateTitle(sessionId, title);
    }

    public List<AuthorizedDoctorResponse> getAuthorizedDoctors(UUID patientUserId) {
        // Get all engagements for this patient
        List<Engagement> engagements = engagementRepository.findByPatientUserId(patientUserId);

        return engagements.stream()
                .filter(engagement -> {
                    // Only include engagements with active or ended status that allow chat viewing
                    if (engagement.getStatus() == EngagementStatus.active) {
                        return true; // Active engagements always have access
                    }

                    // For ended engagements, check if access rules permit history viewing
                    if (engagement.getStatus() == EngagementStatus.ended) {
                        var rule = engagement.getAccessRule();
                        return rule != null && Boolean.TRUE.equals(rule.getRetainsHistoryAccess());
                    }

                    return false;
                })
                .map(engagement -> {
                    var doctor = engagement.getDoctor();
                    var user = doctor.getUser();
                    var rule = engagement.getAccessRule();

                    String accessLevel = engagement.getStatus() == EngagementStatus.active
                            ? "Full Access"
                            : (rule != null && rule.getRuleName() != null ? rule.getRuleName() : "Historical Access");

                    return new AuthorizedDoctorResponse(
                            doctor.getId(),
                            user.getFullName(),
                            doctor.getTitle(),
                            doctor.getSpecialities(),
                            accessLevel,
                            engagement.getStatus() == EngagementStatus.active);
                })
                .toList();
    }

    /**
     * Get all sessions with authorized doctors for a patient in a single response.
     * Optimized to avoid N+1 queries by fetching engagements once.
     */
    public List<SessionWithDoctorsResponse> getSessionsWithAuthorizedDoctors(UUID patientUserId) {
        // Fetch all sessions and engagements in parallel to avoid N+1
        List<AiChatSession> sessions = sessionRepository.findByPatientIdOrderByStartedAtDesc(patientUserId);
        List<Engagement> engagements = engagementRepository.findByPatientUserId(patientUserId);

        // Filter engagements to only those that grant access
        List<Engagement> authorizedEngagements = engagements.stream()
                .filter(engagement -> {
                    if (engagement.getStatus() == EngagementStatus.active) {
                        return true;
                    }
                    if (engagement.getStatus() == EngagementStatus.ended) {
                        var rule = engagement.getAccessRule();
                        return rule != null && Boolean.TRUE.equals(rule.getRetainsHistoryAccess());
                    }
                    return false;
                })
                .toList();

        // Map each session to enriched response with doctors
        return sessions.stream()
                .map(session -> {
                    List<SessionWithDoctorsResponse.DoctorBasicInfo> doctors = authorizedEngagements.stream()
                            .map(engagement -> {
                                var doctor = engagement.getDoctor();
                                var user = doctor.getUser();
                                var rule = engagement.getAccessRule();

                                String accessLevel = engagement.getStatus() == EngagementStatus.active
                                        ? "Full Access"
                                        : (rule != null && rule.getRuleName() != null ? rule.getRuleName()
                                                : "Historical Access");

                                return new SessionWithDoctorsResponse.DoctorBasicInfo(
                                        doctor.getId(),
                                        user.getFullName(),
                                        doctor.getTitle(),
                                        doctor.getSpecialities(),
                                        accessLevel,
                                        engagement.getStatus() == EngagementStatus.active);
                            })
                            .toList();

                    return new SessionWithDoctorsResponse(
                            session.getId(),
                            session.getSessionTitle(),
                            session.getSessionType(),
                            session.getStartedAt(),
                            session.getEndedAt(),
                            session.getIsActive(),
                            session.getMessageCount(),
                            doctors);
                })
                .toList();
    }

    /**
     * Generate a meaningful session title from the first user message.
     * Extracts the first sentence or phrase, limited to 50 characters.
     */
    private String generateSessionTitle(String firstMessage) {
        if (firstMessage == null || firstMessage.isBlank()) {
            return "New AI Chat";
        }

        // Clean and trim the message
        String cleaned = firstMessage.trim();

        // Extract first sentence (stop at . ! ? or newline)
        int endIndex = Math.min(cleaned.length(), 50);
        for (int i = 0; i < Math.min(cleaned.length(), 50); i++) {
            char c = cleaned.charAt(i);
            if (c == '.' || c == '!' || c == '?' || c == '\n') {
                endIndex = i;
                break;
            }
        }

        String title = cleaned.substring(0, endIndex).trim();

        // If title is too short or empty, use first 50 chars
        if (title.length() < 5) {
            title = cleaned.substring(0, Math.min(cleaned.length(), 50)).trim();
        }

        // Add ellipsis if truncated
        if (title.length() < cleaned.length() && !title.endsWith(".") && !title.endsWith("!") && !title.endsWith("?")) {
            title += "...";
        }

        return title.isEmpty() ? "New AI Chat" : title;
    }
}
