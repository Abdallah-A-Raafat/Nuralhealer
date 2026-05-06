# AI Chatbot Testing Quick Reference

**For Frontend Team** - Use this guide to test all AI endpoints

---

## 1. Health Check Endpoint

**Purpose:** Verify AI service is accessible and healthy

```bash
curl -X GET http://localhost:8080/api/ai/health
```

**Expected Response (200 OK):**
```json
{
  "status": "ok",
  "message": "AI service is healthy",
  "timestamp": "2025-02-16T10:30:00Z"
}
```

---

## 2. New Chat Session (No History)

**Purpose:** Start a fresh AI conversation

```bash
curl -X POST http://localhost:8080/api/ai/ask \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"What is anxiety?"}'
```

**Expected Response (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "Anxiety is a normal emotion characterized by feelings of worry...",
  "intent": "symptom_definition",
  "confidence": 0.94,
  "user_text": "What is anxiety?",
  "updated_history": [
    ["user", "What is anxiety?"],
    ["assistant", "Anxiety is a normal emotion..."]
  ],
  "audio_base64": null
}
```

**⚠️ Important:** Save the `id` field from response for next request

---

## 3. Continue Existing Session (With Context)

**Purpose:** Ask follow-up question with conversation history

```bash
SESSION_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:8080/api/ai/ask/$SESSION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"question":"How can I manage it?"}'
```

**Expected Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "Here are some evidence-based strategies...",
  "intent": "symptom_management",
  "confidence": 0.92,
  "user_text": "How can I manage it?",
  "updated_history": [
    ["user", "What is anxiety?"],
    ["assistant", "Anxiety is a normal emotion..."],
    ["user", "How can I manage it?"],
    ["assistant", "Here are some evidence-based strategies..."]
  ],
  "audio_base64": null
}
```

**Note:** `updated_history` grows with each message - history is NOT sent in request

---

## 4. Voice Input Endpoint (NEW)

**Purpose:** Send audio file and get transcription + response

```bash
SESSION_ID="550e8400-e29b-41d4-a716-446655440000"

curl -X POST http://localhost:8080/api/ai/voice/$SESSION_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/audio.mp3"
```

**Expected Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "Based on your question about stress management...",
  "intent": "symptom_management",
  "confidence": 0.91,
  "user_text": "Can you help with stress management techniques?",
  "updated_history": [
    ["user", "What is anxiety?"],
    ["assistant", "Anxiety is a normal emotion..."],
    ["user", "How can I manage it?"],
    ["assistant", "Here are some evidence-based strategies..."],
    ["user", "Can you help with stress management techniques?"],
    ["assistant", "Based on your question about stress management..."]
  ],
  "audio_base64": "SUQzBAAAAAAAI1NTVUUAAAAOAAADTGF2ZjU4LjI..."
}
```

**Notes:**
- Audio file should be MP3 format
- `userText` field contains the transcribed audio text
- `audioBase64` may be null if TTS not enabled

---

## 5. Postman Collection Import

**Steps:**
1. Open Postman
2. Click "Import" button
3. Select `docs/api/testing/Postman.json` file
4. Choose workspace to import to
5. Set `base_url` variable to `http://localhost:8080/api`
6. Set `session_id` variable if testing continuation

**Available Requests:**
- Health Check
- Ask AI (New Session)
- Ask AI (Existing Session)
- Ask AI (Voice Input)
- Get Sessions
- Search Sessions
- And more...

---

## 6. Response Fields Explained

| Field | Type | Required | Example |
|-------|------|----------|---------|
| `id` | UUID | Yes | `550e8400-...` |
| `response` | String | Yes | `"Anxiety is..."` |
| `intent` | String | Yes | `"symptom_definition"` |
| `confidence` | Float | Yes | `0.94` |
| `user_text` | String | Yes | `"What is anxiety?"` |
| `updated_history` | Array | Yes | `[["user","q"],["assistant","a"]]` |
| `audio_base64` | String | No | `"SUQzBAA..."` or `null` |

---

## 7. Common Intent Values

The AI service detects these intents:

- `symptom_definition` - User asking what a condition is
- `symptom_management` - User asking how to manage symptoms
- `coping_strategies` - User asking for coping techniques
- `professional_advice` - User asking for professional guidance
- `general_wellness` - General health and wellness questions
- `personal_experience` - Sharing personal experiences
- `medication_inquiry` - Questions about medications
- `resource_request` - Asking for resources or help

---

## 8. Testing Checklist

**Basic Functionality:**
- [ ] Health endpoint returns 200 status
- [ ] New session creates UUID
- [ ] Response has all 6 fields
- [ ] Intent is non-empty string
- [ ] Confidence is between 0 and 1

**Session Continuation:**
- [ ] Can use returned ID in next request
- [ ] History grows with each message
- [ ] Session ID stays the same across requests
- [ ] AI responds in context of conversation

**Voice Testing:**
- [ ] MP3 file accepted as file field
- [ ] Transcription appears in userText
- [ ] Transcription is accurate
- [ ] Audio response (if enabled) in audioBase64

**Error Cases:**
- [ ] Invalid JWT returns 401
- [ ] Invalid session ID returns 404
- [ ] Missing question field returns 400
- [ ] Timeout after 90 seconds

---

## 9. Error Response Examples

**Missing Authentication (401):**
```json
{
  "timestamp": "2025-02-16T10:30:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "JWT token is missing or invalid"
}
```

**Session Not Found (404):**
```json
{
  "timestamp": "2025-02-16T10:30:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Session with ID XXX not found"
}
```

**Invalid Request (400):**
```json
{
  "timestamp": "2025-02-16T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Field 'question' is required"
}
```

---

## 10. Testing the PowerShell Script

**Run the full integration test:**
```powershell
.\test-ai-integration.ps1
```

**Expected Output:**
```
=== AI Chatbot Integration Test ===

1. Testing AI Health Endpoint...
✓ Health Check Response:
  Status: ok
  ...

2. Logging in to get JWT token...
✓ Login successful, token obtained

3. Testing REST AI Ask Endpoint (New Session)...
✓ AI Response received (New Session):
  Session ID: 550e8400-...
  Answer (first 150 chars): ...
  ...

4. Testing REST AI Ask Endpoint (Existing Session)...
✓ Follow-up Response received:
  Answer (first 150 chars): ...
  ...
```

---

## Quick Debugging Tips

**Issue:** Getting 401 Unauthorized
- **Solution:** Ensure JWT token is valid and hasn't expired. Get new token from login endpoint.

**Issue:** Getting 404 for session ID
- **Solution:** Copy session ID exactly from previous response. IDs are case-sensitive UUIDs.

**Issue:** Empty or no response
- **Solution:** Check AI_SERVICE_URL in .env file. Ensure ngrok tunnel is active if using external AI service.

**Issue:** Timeout (no response after 90 seconds)
- **Solution:** Check if AI service is running. Increase AI_SERVICE_TIMEOUT_SECONDS in .env if needed.

**Issue:** Voice endpoint says file is missing
- **Solution:** Ensure you're using `multipart/form-data` content type and file field name is exactly `file`.

---

## Environment Setup

**Ensure these are set in `.env` file:**
```env
AI_SERVICE_URL=https://nonevaporating-lora-nonranging.ngrok-free.dev
AI_API_KEY=<will be provided by DevOps>
NGROK_SKIP_BROWSER_WARNING=true
AI_SERVICE_TIMEOUT_SECONDS=90
```

**Backend must be running:**
```bash
./mvnw spring-boot:run
```

---

Last Updated: 2025-02-16
