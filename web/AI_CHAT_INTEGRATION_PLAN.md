# 🤖 AI Chat Integration Plan

## 📋 Overview

Based on the backend updates (2 commits), we now have a working **Raw WebSocket** AI chatbot with:

- ✅ WebSocket connection at `ws://localhost:8080/api/ai-ws`
- ✅ AI typing indicator support
- ✅ RAG-based responses with source citations
- ✅ Error handling for AI service unavailability
- ✅ Health check endpoint at `/api/ai/health`

---

## 🔍 Backend Analysis

### Endpoints Available:

1. **Raw WebSocket (Primary)**

   - **URL**: `ws://localhost:8080/api/ai-ws`
   - **Auth**: Public/Anonymous (no authentication required)
   - **Protocol**: Standard WebSocket (not STOMP)
   - **Format**: JSON messages

2. **REST Endpoints**
   - `GET /api/ai/health` - Check AI service status
   - `POST /api/ai/ask` - Send question via REST (alternative to WebSocket)

### Message Flow:

```
CLIENT → SERVER: { "question": "What are symptoms of anxiety?" }

SERVER → CLIENT: {
  "type": "AI_TYPING_START",
  "senderName": "AI Assistant",
  "content": "AI is typing...",
  "timestamp": "2026-01-08T05:30:00"
}

SERVER → CLIENT: {
  "type": "AI_RESPONSE",
  "senderName": "AI Assistant",
  "content": "Anxiety symptoms include...",
  "sources": ["path/to/source1.md", "path/to/source2.md"]
}
```

### Configuration:

- **AI Backend URL**: `https://unenticed-huong-creedless.ngrok-free.dev` (ngrok tunnel to AI service)
- **Timeout**: 90 seconds
- **Health Check Cache**: 1 minute

---

## 📂 Current Frontend State

### Existing Files:

- **`/web/src/pages/patient/Chat.jsx`** - Chat page with mock data (needs integration)
- **`/web/src/hooks/useVoiceChat.js`** - Voice chat hook (already exists but needs WebSocket)

### Current Implementation:

- ✅ UI components ready (TextSession, SoundSession)
- ✅ Message display working
- ❌ Using mock data (setTimeout simulations)
- ❌ No real WebSocket connection
- ❌ No AI integration

---

## 🎯 Integration Tasks

### **Phase 1: WebSocket Service Setup** ⚡ (Priority)

#### 1.1 Create AI WebSocket Service

**File**: `/web/src/services/aiChatService.js`

```javascript
class AiChatService {
  constructor() {
    this.ws = null
    this.listeners = new Map()
  }

  connect() {
    // Connect to ws://localhost:8080/api/ai-ws
    // Handle onopen, onmessage, onerror, onclose
  }

  sendQuestion(question) {
    // Send: { question: "..." }
  }

  onMessage(callback) {
    // Listen for AI_TYPING_START, AI_RESPONSE, AI_ERROR
  }

  disconnect() {
    // Clean disconnect
  }
}
```

**Tasks**:

- [ ] Create WebSocket connection manager
- [ ] Handle automatic reconnection
- [ ] Parse incoming messages by type
- [ ] Implement message queue for offline scenarios
- [ ] Add connection status tracking

#### 1.2 Create AI Health Check Hook

**File**: `/web/src/hooks/useAiHealth.js`

```javascript
export const useAiHealth = () => {
  const [isAiAvailable, setIsAiAvailable] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Poll GET /api/ai/health every 60 seconds
  }, [])

  return { isAiAvailable, isChecking }
}
```

**Tasks**:

- [ ] Implement health check polling
- [ ] Show status in UI
- [ ] Disable chat if AI unavailable

---

### **Phase 2: Text Chat Integration** 📝

#### 2.1 Update TextSession Component

**File**: `/web/src/pages/patient/Chat.jsx`

**Changes Needed**:

1. Replace `setTimeout` mock with real WebSocket calls
2. Add typing indicator state
3. Handle AI_TYPING_START, AI_RESPONSE, AI_ERROR events
4. Display source citations
5. Add connection status indicator
6. Handle reconnection logic

**Tasks**:

- [ ] Import `aiChatService`
- [ ] Connect WebSocket on component mount
- [ ] Remove mock data and timeouts
- [ ] Implement real message sending
- [ ] Add typing indicator animation
- [ ] Display sources/citations from AI response
- [ ] Add error handling UI (e.g., "AI service unavailable")
- [ ] Add retry logic for failed messages

#### 2.2 Message Format Updates

**Current**: Simple messages with `{ id, type, content, timestamp }`  
**New**: Add support for:

- `sources` array (list of RAG document sources)
- `metadata` object (additional AI response data)
- Message status: 'sending', 'sent', 'failed', 'delivered'

---

### **Phase 3: Voice Chat Integration** 🎤

#### 3.1 Update useVoiceChat Hook

**File**: `/web/src/hooks/useVoiceChat.js`

**Current Features**:

- Basic Web Speech API setup (probably)
- Recording state management

**Enhancements Needed**:

- [ ] Integrate with `aiChatService` WebSocket
- [ ] Convert speech to text using Web Speech API
- [ ] Send transcribed text via WebSocket
- [ ] Handle AI response
- [ ] Optional: Text-to-Speech for AI responses

#### 3.2 Update SoundSession Component

**File**: `/web/src/pages/patient/Chat.jsx`

**Tasks**:

- [ ] Integrate real voice recording
- [ ] Send transcripts via WebSocket
- [ ] Display AI responses in real-time
- [ ] Add audio visualizer during recording
- [ ] Handle browser permissions for microphone

---

### **Phase 4: Session Management** 💾

#### 4.1 Session Storage

**Backend Status**: ❓ Check if backend saves sessions to `ai_chat_sessions` table

**Frontend Tasks**:

- [ ] Create session on chat start
- [ ] Save messages to session
- [ ] Load previous sessions in Profile page
- [ ] Display session history
- [ ] Allow continuing previous sessions

#### 4.2 Session History API

**Needed Endpoints**:

- `GET /api/ai-chat/sessions` - Get user's session history
- `GET /api/ai-chat/sessions/:id` - Get specific session messages
- `POST /api/ai-chat/sessions` - Create new session
- `DELETE /api/ai-chat/sessions/:id` - Delete session

**Frontend Tasks**:

- [ ] Create `sessionService.js`
- [ ] Update Profile.jsx to load real sessions
- [ ] Add "Continue Session" button
- [ ] Implement session deletion

---

### **Phase 5: UI/UX Enhancements** 🎨

#### 5.1 Connection Status Indicator

```jsx
<div className="status-bar">
  {wsConnected ? (
    <span className="text-green-600">● Connected</span>
  ) : (
    <span className="text-red-600">● Reconnecting...</span>
  )}
</div>
```

#### 5.2 Typing Indicator Animation

```jsx
{
  isAiTyping && (
    <div className="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  )
}
```

#### 5.3 Source Citations Display

```jsx
{
  message.sources && message.sources.length > 0 && (
    <div className="sources">
      <p>Sources:</p>
      <ul>
        {message.sources.map((source) => (
          <li key={source}>{source}</li>
        ))}
      </ul>
    </div>
  )
}
```

#### 5.4 Error States

- AI service unavailable
- Connection lost
- Message send failed
- Session creation failed

---

## 🚀 Implementation Order

### Week 1: Core Integration (MVP)

1. ✅ **Day 1-2**: Create `aiChatService.js` with WebSocket connection
2. ✅ **Day 2-3**: Create `useAiHealth.js` hook
3. ✅ **Day 3-4**: Integrate WebSocket into TextSession
4. ✅ **Day 4-5**: Add typing indicator and error handling
5. ✅ **Day 5**: Test end-to-end text chat

### Week 2: Voice & Polish

6. **Day 6-7**: Integrate voice recording in SoundSession
7. **Day 8**: Add session management APIs (coordinate with backend)
8. **Day 9**: Update Profile page with real sessions
9. **Day 10**: UI polish and error handling

### Week 3: Testing & Deployment

10. **Day 11-12**: End-to-end testing
11. **Day 13**: Bug fixes
12. **Day 14**: Documentation and deployment

---

## 📝 File Structure

```
web/src/
├── services/
│   ├── aiChatService.js          ← NEW (WebSocket manager)
│   ├── sessionService.js         ← NEW (Session CRUD)
│   └── userService.js            ← EXISTS (already created)
├── hooks/
│   ├── useAiHealth.js            ← NEW (Health check)
│   ├── useAiChat.js              ← NEW (Chat logic)
│   └── useVoiceChat.js           ← EXISTS (needs update)
├── pages/patient/
│   ├── Chat.jsx                  ← EXISTS (needs integration)
│   └── Profile.jsx               ← EXISTS (needs session history)
└── components/
    └── chat/
        ├── TypingIndicator.jsx   ← NEW
        ├── MessageBubble.jsx     ← NEW
        └── SourceCitation.jsx    ← NEW
```

---

## 🔧 Environment Configuration

### `.env.development`

```bash
VITE_API_BASE_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080/api/ai-ws
VITE_AI_HEALTH_POLL_INTERVAL=60000
```

### `.env.production`

```bash
VITE_API_BASE_URL=https://api.neuralhealer.com/api
VITE_WS_URL=wss://api.neuralhealer.com/api/ai-ws
VITE_AI_HEALTH_POLL_INTERVAL=60000
```

---

## ⚠️ Important Notes

1. **Authentication**: Backend WebSocket is currently **PUBLIC** (no auth required)

   - ⚠️ Security concern for production
   - Should add JWT token authentication later
   - Current: Anyone can connect to `ws://localhost:8080/api/ai-ws`

2. **AI Service**: Uses **ngrok tunnel** for development

   - May disconnect/change URL
   - Production needs stable AI backend deployment

3. **Browser Support**: WebSocket and Web Speech API

   - Check browser compatibility
   - Add fallback for unsupported browsers

4. **Session Persistence**:
   - Need to confirm if backend saves to `ai_chat_sessions` table
   - May need to implement session saving endpoints

---

## 📚 Reference Files

- ✅ `/backend/backend/docs/AI_WEBSOCKET_API.md` - API documentation
- ✅ `/backend/backend/stomp-test.html` - Working example
- ✅ `/backend/backend/src/main/java/com/neuralhealer/backend/handler/AiSimpleWebSocketHandler.java` - Backend WebSocket handler
- ✅ `/backend/backend/src/main/java/com/neuralhealer/backend/service/AiChatbotService.java` - AI service logic

---

## ✅ Success Criteria

- [ ] User can send text message and get AI response
- [ ] Typing indicator shows while AI is processing
- [ ] Sources/citations display below AI responses
- [ ] Connection status visible to user
- [ ] Errors handled gracefully with user feedback
- [ ] Voice recording works and transcribes to text
- [ ] Sessions saved and retrievable in Profile page
- [ ] No mock data remaining in production code

---

## 🤝 Next Steps

1. **Review this plan together**
2. **Prioritize features** (MVP vs Nice-to-have)
3. **Start with Phase 1** - WebSocket service setup
4. **Test incrementally** - Don't wait until everything is done
5. **Backend coordination** - Confirm session storage endpoints

Ready to start? Let's begin with creating the `aiChatService.js`! 🚀
