Here is the exact specification:

---

## Architecture Specification: Stateless AI Layer

### 1. Principle
The Colab notebook (AI Layer) must become a pure stateless function. It stores zero conversation history. Memory lives exclusively in the Java backend and travels through Flask as input/output.

### 2. Interface Contract

**Input from Java → Flask → Colab:**
```json
{
  "user_input": "string",
  "conversation_history": [
    ["user", "previous message"],
    ["ai", "previous response"]
  ]
}
```

**Output from Colab → Flask → Java:**
```json
{
  "response": "string",
  "updated_history": [
    ["user", "previous message"],
    ["ai", "previous response"],
    ["user", "current input"],
    ["ai", "current response"]
  ],
  "intent": "string",
  "confidence": 0.95
}
```

### 3. What the Colab Must Do
- Accept `conversation_history` as a parameter (replace the global `chat_conversation = []`)
- Use the provided history directly in `build_template()` — no global state, no session cache, no file storage
- Append the new user message and AI response to the history
- Return the updated history to the caller
- Keep all existing logic (intent classification, RAG, prompt selection, LLM generation) unchanged

### 4. What the Colab Must NOT Do
- No global `chat_conversation` variable
- No session management, no session IDs, no in-memory dicts
- No truncation/slicing logic (e.g., no `[-7:]`). The backend sends exactly what the AI should see
- No database calls, no file-based persistence of chat history

### 5. What the Java Backend Owns
- Storing the full conversation history per user/channel
- Truncating history to the last N messages before sending (context window management)
- Saving the `updated_history` returned by the AI layer
- Managing user identity, channels, and sessions

### 6. Flask Bridge (Future)
- Single endpoint: `POST /chat`
- Receives JSON from Java, forwards to Colab runtime, returns JSON response
- No business logic, no memory storage — pure HTTP pipe

### 7. Voice (Out of Scope for Now)
- Whisper and ElevenLabs stay in Colab
- Decision deferred until backend integration is solid

---

This is the complete picture. The only work needed right now in the Colab is: **remove the global `chat_conversation`, make history an input parameter, return it as output.** Everything else stays exactly as it is.