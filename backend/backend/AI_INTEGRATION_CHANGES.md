# AI Integration Changes - May 6, 2026

---
**Version:** 0.6.0  
**Date:** 2026-05-06  
**Scope:** Backend API contract update to match FastAPI AI service  
**Status:** Ready for Frontend Testing

---

## 📋 Summary of Changes

This document lists all changes made to the NeuralHealer backend AI integration to align with the new FastAPI service contract.

---

## 1. Endpoint Updates

### Chat Endpoint
- **Old**: `/query` (in some configs)
- **New**: `/chat`
- **Location**: External FastAPI service
- **Backend Config**: `ai.chatbot.ask-endpoint: /chat` (in `application.yml`)

### New Voice Endpoint
- **Endpoint**: `POST /api/ai/voice/{sessionId}`
- **Type**: REST (multipart/form-data)
- **Input**: MP3 audio file
- **Output**: Transcription + AI response
- **Persistence**: Voice transcription saved as "PATIENT" message in DB

### Health Endpoint
- **Endpoint**: `GET /api/ai/health`
- **Status**: No changes (already correct)
- **Response**: Health status + last check timestamp

---

## 2. Request/Response Contract

### Chat Request Format
**Sent by Backend to FastAPI**
```json
{
  "user_input": "What is anxiety?",
  "conversation_history": [
    ["user", "previous question"],
    ["assistant", "previous answer"]
  ]
}
```

### Response Format (Expanded)
**Received from FastAPI**
```json
{
  "response": "The AI answer",
  "updated_history": [["user", "..."], ["assistant", "..."]],
  "intent": "medical_advice",
  "confidence": 0.95,
  "user_text": "transcribed text (voice only)",
  "audio_base64": "optional synthesized audio"
}
```

### Java DTO (`AiChatResponse`)
```java
public record AiChatResponse(
    @JsonProperty("response") String answer,
    @JsonProperty("updated_history") List<List<String>> updatedHistory,
    @JsonProperty("intent") String intent,
    @JsonProperty("confidence") double confidence,
    @JsonProperty("user_text") String userText,
    @JsonProperty("audio_base64") String audioBase64
) {}
```

---

## 3. Conversation History Implementation

### History Building (Backend)
1. **Before sending to AI**: Fetch previous session messages from DB
2. **Transform messages**: Convert DB format to AI format
   - `PATIENT` messages → `["user", "message text"]`
   - `AI` messages → `["assistant", "message text"]`
3. **Include in request**: Pass as `conversation_history` array
4. **Save after**: Save current user message + AI response to DB

### Example Flow
```
Session created
↓
User: "I have anxiety" → Save to DB
↓
AI calls with history: [] (empty for first message)
↓
AI returns: "Anxiety is..." + updated_history: [["user", "..."], ["assistant", "..."]]
↓
User: "How do I manage it?" → Save to DB
↓
AI calls with history: [["user", "I have anxiety"], ["assistant", "Anxiety is..."]]
↓
AI returns: "Try these techniques..." + updated_history: [...]
```

---

## 4. Configuration Changes

### From YAML to .env
Settings are now loaded from `.env` file instead of hardcoded in YAML.

**File: `.env`**
```bash
# External AI Service
AI_SERVICE_URL=https://nonevaporating-lora-nonranging.ngrok-free.dev
AI_API_KEY=                    # Optional, set by DevOps
NGROK_SKIP_BROWSER_WARNING=true
AI_SERVICE_TIMEOUT_SECONDS=90
```

**File: `application.yml`**
```yaml
ai:
  chatbot:
    base-url: ${AI_SERVICE_URL:http://localhost:5000}
    api-key: ${AI_API_KEY:}
    ngrok-skip-browser-warning: ${NGROK_SKIP_BROWSER_WARNING:false}
    health-endpoint: /health
    ask-endpoint: /chat
    timeout-seconds: ${AI_SERVICE_TIMEOUT_SECONDS:90}
```

---

## 5. Database Persistence

### Message Storage
All messages now persist to the database with sender type mapping:

| DB Field Value | Meaning | Source |
|---|---|---|
| `PATIENT` | User message or voice transcription | User input or `userText` from voice response |
| `AI` | AI response text | `response` field from AI service |

### Session Auto-Titling
- **Source**: First user message in session
- **Format**: First sentence/phrase, up to 50 characters
- **Example**: "I have anxiety" → Title: "I have anxiety"
- **Custom**: Can be renamed later via `/api/chats/{sessionId}/title`

---

## 6. API Endpoints Reference

### Create New Chat
```
POST /api/ai/ask
Content-Type: application/json

{
  "question": "What is anxiety?"
}

Response:
{
  "sessionId": "uuid-here",
  "answer": "Anxiety is your body's response to stress..."
}
```

### Continue Existing Chat
```
POST /api/ai/ask/{sessionId}
Content-Type: application/json

{
  "question": "How do I manage it?"
}

Response:
{
  "sessionId": "uuid-here",
  "answer": "Here are practical techniques..."
}
```

### Voice Input
```
POST /api/ai/voice/{sessionId}
Content-Type: multipart/form-data

file: <MP3 audio file>

Response:
{
  "sessionId": "uuid-here",
  "answer": "Based on your speech: ..."
}
```

### Health Check
```
GET /api/ai/health

Response:
{
  "isHealthy": true,
  "message": "AI connected",
  "lastCheck": "2026-05-06T10:00:00"
}
```

---

## 7. Java Code Changes

### Files Modified
1. **AiChatResponse.java**
   - Added 5 new fields to capture all AI response data
   
2. **AiChatbotService.java**
   - Changed default ask endpoint from `/ask` to `/chat`
   - Added `askVoice()` method for voice input handling
   - Conversation history now passed to AI service

3. **AiChatbotController.java**
   - Added `askVoiceInSession()` endpoint
   - Voice transcription (`userText`) saved to DB when present

4. **AiStompController.java**
   - Normalized message sender values to uppercase (`PATIENT`, `AI`)
   - History passed to AI service on each request

5. **ChatStorageService.java**
   - No changes to enum case logic (lowercase enum values are correct)

6. **application-dev.yml**
   - Removed hardcoded AI config (now in .env)

7. **application.yml**
   - Changed `ask-endpoint` default from `/query` to `/chat`

8. **`.env`**
   - Added AI service configuration variables

---

## 8. Frontend Integration Checklist

- [ ] Update API endpoint URLs to new REST endpoints
- [ ] Handle new response fields: `intent`, `confidence`, `updatedHistory`
- [ ] Implement voice file upload for `/api/ai/voice/{sessionId}`
- [ ] Display conversation history in chat UI
- [ ] Persist session IDs for continuing conversations
- [ ] Show intent and confidence scores (optional UI enhancement)
- [ ] Handle audio playback if `audioBase64` is provided (optional)
- [ ] Test with the ngrok URL: `https://nonevaporating-lora-nonranging.ngrok-free.dev`

---

## 9. Testing Endpoints

### Quick Health Check
```bash
curl https://nonevaporating-lora-nonranging.ngrok-free.dev/health
```

### Test Chat via Backend
```bash
curl -X POST http://localhost:8080/api/ai/ask \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{"question":"What is anxiety?"}'
```

### Test Voice via Backend
```bash
curl -X POST http://localhost:8080/api/ai/voice/<SESSION_ID> \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -F "file=@audio.mp3"
```

---

## 10. Documentation Updated

The following documentation files have been updated:

1. **docs/api/ai-chatbot.md**
   - Updated version to 0.6.0
   - Added voice endpoint details
   - Updated REST API section

2. **docs/api/all AI.md**
   - Added voice input section
   - Updated response format examples
   - Added new fields to data models

3. **docs/api/API_REFERENCE.md**
   - Updated version to 0.6.0
   - Added REST endpoint table with voice support
   - Updated AI response format

4. **docs/implementation/ai-chatbot.md**
   - Updated version to v2.0
   - Changed from "stateless" to "stateful" architecture
   - Added conversation history details
   - Updated configuration section

---

## 11. Known Limitations & Future Work

- [ ] Audio synthesis (`audioBase64`) currently optional; frontend can ignore if not needed
- [ ] Intent and confidence scores are available but may not be critical for MVP
- [ ] Voice endpoint returns raw MP3 bytes; ensure frontend can decode if needed
- [ ] No retry logic for failed AI requests (handled by FastAPI service)

---

## 12. Rollback Plan

If issues arise, revert these changes:
1. Restore `ask-endpoint: /query` in `application.yml`
2. Comment out `.env` configuration changes
3. Redeploy backend JAR

---

**Questions?** Contact the backend team or review the detailed documentation files.
