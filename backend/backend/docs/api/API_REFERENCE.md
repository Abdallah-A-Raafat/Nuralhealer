# API Reference - NeuralHealer

---
**Last Updated:** 2026-05-06
**Version:** 0.6.0
**Changes:** 
- AI Endpoints: Added `/voice/{sessionId}` for voice input support
- Response Format: All AI responses now include intent, confidence, and updated history
- Configuration: AI service URL and settings moved to `.env` environment variables
- Conversation History: Passed to AI service for context-aware responses
- Persistence: Full message persistence with async fire-and-forget saving
- Notifications: Added REST, SSE, and raw WebSocket notification paths
- Live Sessions: Added `/live-sessions` CRUD endpoints
- Doctors: Added doctor profile and lobby endpoints
---

Base URL: `http://localhost:8080/api`

---

## 🔑 1. Authentication

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Register new User | No |
| `POST` | `/auth/login` | Login & Get JWT Cookie | No |
| `POST` | `/auth/logout` | Revoke Session | Yes |
| `GET` | `/users/me` | Current Profile | Yes |

---

## 🤝 2. Engagements (Lifecycle)

| Method | Endpoint | Description | Auth | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/engagements/initiate` | Start Engagement Request | Yes | Verification Token |
| `POST` | `/engagements/verify-start` | Activate Engagement | Yes | Engagement Object |
| `GET` | `/engagements/my-engagements` | List My Engagements | Yes | Array of Engagements |
| `POST` | `/engagements/{id}/refresh-token` | Regenerate START Token | Initiator | New Token Object |
| `GET` | `/engagements/{id}/token` | Get Current Valid Token | Initiator | Token Object |
| `DELETE` | `/engagements/{id}` | Cancel/Hard Delete (cleanup) | Participant| Success Message |
| `POST` | `/engagements/{id}/cancel` | Soft Cancel with Reason | Participant| Success Message |
| `POST` | `/engagements/{id}/end-request` | Request Mutual Termination | Yes | Termination Token |
| `POST` | `/engagements/{id}/verify-end` | Conclude Engagement | Yes | Status Object |

> [!TIP]
> **Detailed Documentation**: See [ENGAGEMENT_LOGIC.md](api/ENGAGEMENT_LOGIC.md) for full JSON request/response examples for each transition.

---

## 💬 3. Messaging (REST Fallback)

| Method | Endpoint | Description | Auth | Response |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/engagements/{id}/messages` | Send Message (REST) | Yes | Message Object |
| `GET` | `/engagements/{id}/messages` | Get History | Yes | Array of Messages |

---

## 🔌 4. WebSockets

NeuralHealer supports two WebSocket protocols for different real-time Paradigms.

### A. Managed Broker (STOMP)
**Endpoint**: `ws://localhost:8080/ws`  
**Purpose**: High-reliability, bi-directional communication for engagement chat and AI.

#### Topics (Subscribe)
- `/topic/engagement/{id}`: Live chat and status updates.
- `/user/queue/ai`: AI-specific events.

#### Destinations (Send)
- `/app/engagement/{id}/message`: Send chat message.
- `/app/engagement/{id}/typing`: Send typing status.
- `/app/ai/ask`: Ask AI a question.

> [!TIP]
> **AI Documentation**: See [ai-chatbot.md](ai-chatbot.md) and [all AI.md](all%20AI.md) for detailed JSON payloads for questions, typing, and answers.

---

### B. Notifications (REST + SSE)
**REST Base**: `/notifications`  
**SSE Stream**: `GET /notifications/stream`  
**Purpose**: Notification inbox, unread counts, mark-as-read actions, and real-time server push.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/notifications` | List notifications for the current user |
| `GET` | `/notifications/unread-count` | Get unread notification count |
| `PUT` | `/notifications/{id}/read` | Mark one notification as read |
| `POST` | `/notifications/mark-all-read` | Mark all notifications as read |
| `GET` | `/notifications/stats` | Get notification statistics |
| `DELETE` | `/notifications/{id}` | Delete one notification |

### C. Raw WebSocket Paths
**Endpoint**: `ws://localhost:8080/notifications`  
**Purpose**: Low-level authenticated notification stream for server-to-client broadcasts.

**Endpoint**: `ws://localhost:8080/ws/webrtc`  
**Purpose**: WebRTC signaling for live sessions.

---

## 🧠 5. Personality Quizzes (IPIP)

NeuralHealer provides personality assessments based on IPIP standards.

| Type | Base Endpoint | Questions | Session Support |
| :--- | :--- | :--- | :--- |
| **IPIP-120** | `/quizzes/ipip120` | 120 | 2 Hours |
| **IPIP-50** | `/quizzes/ipip50` | 50 | 1 Hour |
| **PHQ-9** | `/quizzes/phq9` | 9 | 1 Hour |

> [!TIP]
> **Quiz Documentation**: See [quizzes.md](quizzes.md) for full endpoint lists and models, and [assessments.md](assessments.md) for architectural plans.

---

## 🤖 6. AI Chatbot

AI integration supports both STOMP (real-time) and REST (fallback) protocols.

### STOMP (Real-Time)
- **Connection**: `ws://localhost:8080/ws`
- **Destination**: `/app/ai/ask`
- **Queue**: `/user/queue/ai`

### REST API
| Method | Endpoint | Description | Auth | Response |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/ai/health` | Check AI service health | No | Health status |
| `POST` | `/ai/ask` | Ask AI (new session) | Yes | Session + Answer |
| `POST` | `/ai/ask/{sessionId}` | Ask AI (existing session) | Yes | Session + Answer |
| `POST` | `/ai/voice/{sessionId}` | Voice input (MP3) | Yes | Transcription + Answer |

**Response Format:**
```json
{
  "sessionId": "uuid",
  "answer": "AI response text",
  "updatedHistory": [["user", "..."], ["assistant", "..."]],
  "intent": "medical_advice",
  "confidence": 0.95,
  "userText": "transcribed voice text (voice only)",
  "audioBase64": "optional synthesized audio"
}
```

> [!TIP]
> **Detailed AI Documentation**: See [ai-chatbot.md](ai-chatbot.md) and [all AI.md](all%20AI.md) for full payload examples and subscription details.

---

## 🕒 7. AI Chat History
Endpoints for accessing and managing past AI conversations.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/chats` | Get all chat sessions for the current user | Yes |
| `GET` | `/chats/{sessionId}/messages` | Get message history for a session | Yes |
| `PUT` | `/chats/{sessionId}/title` | Rename a session | Yes |
| `GET` | `/chats/with-doctors` | Get sessions with authorized doctors embedded | Yes |

> [!TIP]
> **Detailed Chat History Documentation**: See [AI Chat History.md](AI%20Chat%20History.md) and [all AI.md](all%20AI.md).

---

## 📹 8. Live Sessions
Endpoints for creating and joining live communication sessions.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/live-sessions` | Create a new live session | Yes |
| `GET` | `/live-sessions/{sessionId}` | Get a live session | Yes |
| `POST` | `/live-sessions/{sessionId}/join` | Join a live session | Yes |
| `DELETE` | `/live-sessions/{sessionId}` | End a live session | Yes |

> [!TIP]
> **Detailed Live Sessions Documentation**: See [live-sessions.md](live-sessions.md).

---

## 👩‍⚕️ 9. Doctor Profile & Lobby
Endpoints for doctor discovery and profile management.

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `GET` | `/doctors/lobby` | Browse doctors with filters and pagination | No |
| `GET` | `/doctors/search?q={query}` | Search doctors by name, title, bio, or specialization | No |
| `GET` | `/doctors/nearby?lat={lat}&lng={lng}&radius={radius}` | Find nearby doctors | No |
| `GET` | `/doctors/{doctorId}/profile` | View a doctor's public profile | No |
| `GET` | `/doctors/me/profile` | View the authenticated doctor's profile | Yes |
| `PUT` | `/doctors/me/profile` | Update the authenticated doctor's profile | Yes |
| `POST` | `/doctors/me/profile-picture` | Upload a profile picture | Yes |
| `DELETE` | `/doctors/me/profile-picture` | Delete the profile picture | Yes |
| `PATCH` | `/doctors/me/availability` | Update availability status | Yes |
| `PUT` | `/doctors/me/social-media` | Update social media links | Yes |

> [!TIP]
> **Doctor Documentation**: See [doctor-profile.md](doctor-profile.md) for request/response details.

---

## 📚 Project Documentation Index

Explore more details about NeuralHealer:

- **Live Sessions**: [live-sessions.md](live-sessions.md)
- **Notifications & SSE**: [notification.md](notification.md)
- **Doctor Profiles & Lobby**: [doctor-profile.md](doctor-profile.md)
- **Email System**: [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)
- **Architecture**: [ARCHITECTURE.md](../design/ARCHITECTURE.md)
- **Roadmap**: [MICROSERVICES_ROADMAP.md](../design/MICROSERVICES_ROADMAP.md)
- **Security**: [SECURITY.md](../security/SECURITY.md)
- **Deployment**: [DEPLOYMENT.md](../dev/DEPLOYMENT.md)
- **Contributing**: [CONTRIBUTING.md](../dev/CONTRIBUTING.md)
