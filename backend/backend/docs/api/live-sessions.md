# Live Sessions API Reference

Endpoints for creating and joining live communication sessions.

**Base URL**: `/api/live-sessions`

| Method | Endpoint | Description | Auth |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Create a new live session. | Yes |
| `GET` | `/{sessionId}` | Get details of a specific live session. | Yes |
| `POST` | `/{sessionId}/join` | Join an existing live session. | Yes |
| `DELETE` | `/{sessionId}` | End a live session. | Yes |

## API Details

### Create Session
- **POST** `/api/live-sessions`
- **Body**: `CreateSessionRequest`
  - `participantName` (String): The name of the user creating the session.
  - `provider` (String): The provider to use for the session (e.g. "agora", "daily").
- **Response**: `LiveSessionResponse`

### Get Session
- **GET** `/api/live-sessions/{sessionId}`
- **Response**: `LiveSessionResponse`

### Join Session
- **POST** `/api/live-sessions/{sessionId}/join`
- **Body**: `JoinSessionRequest`
  - `participantName` (String): The name of the user joining the session.
  - `provider` (String): The provider to use for the session.
- **Response**: `LiveSessionResponse`

### End Session
- **DELETE** `/api/live-sessions/{sessionId}`
- **Response**: 
```json
{
  "message": "Session ended"
}
```
