package com.neuralhealer.backend.feature.ai.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.neuralhealer.backend.feature.ai.entity.AiChatMessage;
import com.neuralhealer.backend.feature.ai.enums.ChatSenderType;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Set;

/**
 * Utility for normalizing conversation history between internal DB format and external AI API format.
 * <p>
 * <b>API Format</b> (what the external AI expects):
 * <pre>
 * [["human", "message text"], ["ai", "response text"]]
 * </pre>
 * <p>
 * <b>Internal DB Format</b> (what we store in ai_chat_messages):
 * <pre>
 * sender_type: "patient" | "ai"
 * content: "message text"
 * </pre>
 * <p>
 * Rules:
 * <ul>
 *   <li>Role values are strictly "human" and "ai" for the API</li>
 *   <li>Auto-fixes common mistakes (intent labels as roles, "user" → "human", etc.)</li>
 *   <li>Filters out null/empty entries</li>
 *   <li>Limits history to a reasonable length (default 50 turns = 100 entries)</li>
 * </ul>
 */
@Slf4j
public final class ConversationHistoryNormalizer {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final int MAX_HISTORY_TURNS = 50; // 50 turns = 100 entries (human + ai)

    // Intent labels that might accidentally be sent as roles — auto-correct to "ai"
    private static final Set<String> INTENT_LABELS = Set.of(
            "emotional_support", "cbt_guidance", "meditation", "crisis",
            "general_chat", "greeting", "breathing", "progressive_muscle_relaxation",
            "grounding", "sleep_hygiene", "mindfulness", "cognitive_reframing",
            "behavioral_activation", "problem_solving", "information", "resources",
            "assessment", "follow_up", "closing", "journaling_prompt", "gratitude",
            "self_compassion", "distress_tolerance", "interpersonal_skills",
            "emergency", "unknown"
    );

    // Aliases that map to "human"
    private static final Set<String> HUMAN_ALIASES = Set.of(
            "human", "user", "patient", "sender", "client", "customer",
            "h", "u", "p"
    );

    // Aliases that map to "ai"
    private static final Set<String> AI_ALIASES = Set.of(
            "ai", "bot", "assistant", "model", "system", "responder",
            "a", "b", "asst"
    );

    private ConversationHistoryNormalizer() {
        // utility class
    }

    /**
     * Normalize an API-format history array.
     * Ensures all roles are strictly "human" or "ai", fixes common mistakes,
     * and truncates to max length.
     *
     * @param history The raw history from any source (API response, client, etc.)
     * @return Cleaned history in strict API format
     */
    public static List<List<String>> normalizeHistory(List<List<String>> history) {
        if (history == null || history.isEmpty()) {
            return new ArrayList<>();
        }

        List<List<String>> normalized = new ArrayList<>();
        for (List<String> entry : history) {
            if (entry == null || entry.size() < 2) {
                continue; // Skip malformed entries
            }

            String role = entry.get(0);
            String message = entry.get(1);

            if (role == null || message == null) {
                continue;
            }

            String normalizedRole = normalizeRole(role.trim().toLowerCase());
            if (normalizedRole == null) {
                log.warn("Could not normalize role '{}', skipping entry", role);
                continue;
            }

            normalized.add(Arrays.asList(normalizedRole, message.trim()));
        }

        // Truncate if too long (keep most recent)
        if (normalized.size() > MAX_HISTORY_TURNS) {
            log.warn("History too long ({} turns), truncating to last {}",
                    normalized.size(), MAX_HISTORY_TURNS);
            normalized = normalized.subList(normalized.size() - MAX_HISTORY_TURNS, normalized.size());
        }

        return normalized;
    }

    /**
     * Convert a JSON string to normalized history.
     *
     * @param jsonHistory JSON string like '[["human","hi"],["ai","hello"]]'
     * @return Normalized history, or empty list if parsing fails
     */
    public static List<List<String>> fromJson(String jsonHistory) {
        if (jsonHistory == null || jsonHistory.isBlank()) {
            return new ArrayList<>();
        }
        try {
            List<List<String>> parsed = OBJECT_MAPPER.readValue(jsonHistory,
                    new TypeReference<List<List<String>>>() {});
            return normalizeHistory(parsed);
        } catch (JsonProcessingException e) {
            log.error("Failed to parse history JSON: {}", jsonHistory.substring(0, Math.min(100, jsonHistory.length())), e);
            return new ArrayList<>();
        }
    }

    /**
     * Serialize history to a JSON string for multipart/form-data voice requests.
     *
     * @param history The history to serialize
     * @return JSON string, or "[]" if empty
     */
    public static String toJson(List<List<String>> history) {
        List<List<String>> normalized = normalizeHistory(history);
        try {
            return OBJECT_MAPPER.writeValueAsString(normalized);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize history to JSON", e);
            return "[]";
        }
    }

    /**
     * Build API-format history from a list of AiChatMessage database records.
     * Maps internal DB roles to API roles:
     * <ul>
     *   <li>patient → human</li>
     *   <li>ai → ai</li>
     * </ul>
     *
     * @param messages List of DB message entities, ordered by time
     * @return Normalized history in API format
     */
    public static List<List<String>> fromDbMessages(List<AiChatMessage> messages) {
        if (messages == null || messages.isEmpty()) {
            return new ArrayList<>();
        }

        List<List<String>> history = new ArrayList<>();
        for (AiChatMessage msg : messages) {
            if (msg == null || msg.getContent() == null || msg.getSenderType() == null) {
                continue;
            }
            String apiRole = dbRoleToApiRole(msg.getSenderType());
            if (apiRole != null) {
                history.add(Arrays.asList(apiRole, msg.getContent().trim()));
            }
        }
        return normalizeHistory(history);
    }

    /**
     * Convert a single DB role to API role.
     *
     * @param dbRole ChatSenderType from the database
     * @return "human" or "ai", or null if unknown
     */
    public static String dbRoleToApiRole(ChatSenderType dbRole) {
        if (dbRole == null) return null;
        return switch (dbRole) {
            case patient -> "human";
            case ai -> "ai";
        };
    }

    /**
     * Convert API role to DB role.
     *
     * @param apiRole "human" or "ai"
     * @return ChatSenderType, or null if unknown
     */
    public static ChatSenderType apiRoleToDbRole(String apiRole) {
        if (apiRole == null) return null;
        return switch (normalizeRole(apiRole)) {
            case "human" -> ChatSenderType.patient;
            case "ai" -> ChatSenderType.ai;
            default -> null;
        };
    }

    // --- Internal helpers ---

    /**
     * Normalize a raw role string to strict "human" or "ai".
     * Auto-corrects intent labels and common aliases.
     *
     * @param rawRole Raw role string (e.g., "user", "patient", "emotional_support")
     * @return "human", "ai", or null if unrecognizable
     */
    private static String normalizeRole(String rawRole) {
        if (rawRole == null || rawRole.isBlank()) {
            return null;
        }
        String lower = rawRole.toLowerCase().trim();

        // Direct match
        if (lower.equals("human") || lower.equals("ai")) {
            return lower;
        }

        // Human aliases
        if (HUMAN_ALIASES.contains(lower)) {
            return "human";
        }

        // AI aliases
        if (AI_ALIASES.contains(lower)) {
            return "ai";
        }

        // Intent labels that were accidentally sent as roles → map to "ai"
        if (INTENT_LABELS.contains(lower)) {
            log.warn("Intent label '{}' was sent as a role. Auto-correcting to 'ai'.", rawRole);
            return "ai";
        }

        // Partial matches (e.g., "human_1", "ai_v2")
        if (lower.startsWith("human") || lower.contains("user") || lower.contains("patient")) {
            return "human";
        }
        if (lower.startsWith("ai") || lower.contains("bot") || lower.contains("assistant") || lower.contains("model")) {
            return "ai";
        }

        log.warn("Unknown role '{}', cannot normalize. Skipping entry.", rawRole);
        return null;
    }
}
