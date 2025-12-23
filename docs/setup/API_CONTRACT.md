# API Contract - Frontend Expectations

**Project**: NeuralHealer  
**Frontend Framework**: React + Vite  
**Date**: December 23, 2025

---

## 🔗 Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.neuralhealer.com/api`

---

## 🔐 Authentication

### Login/Register Response Format

```json
{
  "user": {
    "id": "string (UUID)",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "accountType": "patient" | "doctor",
    "profileImage": "string (optional)"
  },
  "token": "string (JWT access token)",
  "refreshToken": "string (JWT refresh token)",
  "accountType": "patient" | "doctor"
}
```

### Token Format

- **Authorization Header**: `Bearer <token>`
- **Access Token Expiry**: 15 minutes (recommended)
- **Refresh Token Expiry**: 7 days (recommended)

---

## ❌ Error Response Format

**All errors must follow this structure:**

```json
{
  "error": {
    "message": "Human-readable error message for display",
    "code": "ERROR_CODE_IN_CAPS",
    "field": "fieldName (optional, for validation errors)",
    "details": {} (optional, additional error context)
  }
}
```

### Standard HTTP Status Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate email, etc.)
- `422` - Unprocessable Entity (semantic errors)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Example Error Responses

**Validation Error:**

```json
{
  "error": {
    "message": "Email is already registered",
    "code": "EMAIL_EXISTS",
    "field": "email"
  }
}
```

**Authentication Error:**

```json
{
  "error": {
    "message": "Invalid credentials",
    "code": "INVALID_CREDENTIALS"
  }
}
```

---

## 📅 Date/Time Format

**Use ISO 8601 format for all dates:**

- Full timestamp: `2025-12-23T10:30:00Z`
- Date only: `2025-12-23`
- Time only: `10:30` (24-hour format)

**Examples:**

```json
{
  "createdAt": "2025-12-23T10:30:00Z",
  "appointmentDate": "2025-12-27",
  "appointmentTime": "14:00"
}
```

---

## 📄 Pagination Format

**Query Parameters:**

```
?page=1&limit=10
```

**Response Format:**

```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 42,
    "itemsPerPage": 10
  }
}
```

---

## 🌍 Internationalization

**Language Header:**

```
Accept-Language: en
Accept-Language: ar
```

Frontend will send this header with every request. Backend should:

1. Return error messages in the requested language
2. Return localized content where applicable

---

## 🔄 Chat Message Format

### Send Message Request

```json
{
  "sessionId": "uuid",
  "message": "string",
  "messageType": "text" | "voice",
  "audioFile": "base64 string (if voice)",
  "timestamp": "2025-12-23T10:30:00Z"
}
```

### AI Response Format

```json
{
  "message": "AI response text",
  "audioResponse": "base64 or URL (optional, for voice)",
  "emotion": "calm" | "anxious" | "happy" | "sad" | "neutral",
  "sentiment": "positive" | "negative" | "neutral",
  "suggestions": ["suggestion 1", "suggestion 2"],
  "timestamp": "2025-12-23T10:30:00Z"
}
```

---

## 👨‍⚕️ Doctor List Response Format

```json
{
  "doctors": [
    {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "specialization": "Clinical Psychology",
      "experience": "12 years",
      "rating": 4.9,
      "reviewCount": 248,
      "bio": "string",
      "profileImage": "url",
      "languages": ["English", "Arabic"],
      "price": 80,
      "availability": "Mon-Fri, 9am-6pm",
      "nextAvailable": "2025-12-27T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

---

## 📅 Booking Response Format

```json
{
  "bookingId": "uuid",
  "message": "Appointment booked successfully",
  "booking": {
    "id": "uuid",
    "doctorId": "uuid",
    "doctorName": "Dr. Sarah Mitchell",
    "doctorImage": "url",
    "patientId": "uuid",
    "date": "2025-12-27",
    "time": "10:00",
    "duration": "60 minutes",
    "type": "online" | "in-person",
    "status": "confirmed" | "pending" | "cancelled",
    "meetingLink": "https://meet.example.com/xyz (if online)",
    "price": 80,
    "createdAt": "2025-12-23T10:30:00Z"
  }
}
```

---

## 🔒 CORS Configuration

**Backend must allow these origins:**

**Development:**

- `http://localhost:5173`
- `http://localhost:5174`
- `http://127.0.0.1:5173`

**Production:**

- `https://neuralhealer.com`
- `https://www.neuralhealer.com`

**Required Headers:**

```
Access-Control-Allow-Origin: <origin>
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Accept-Language
Access-Control-Allow-Credentials: true
```

---

## 📤 File Upload Format

**Profile Images:**

- Accept: `multipart/form-data` OR `base64` in JSON
- Max size: 5MB
- Formats: JPG, PNG, WebP
- Return: URL to uploaded image

**Voice Recordings:**

- Accept: `base64` string in JSON
- Max size: 10MB
- Format: WebM, MP3, WAV
- Return: Transcribed text + URL (optional)

---

## ⚡ Rate Limiting

**Expected limits:**

- Auth endpoints: 10 requests/minute
- Chat endpoints: 60 requests/minute
- General endpoints: 100 requests/minute

**When rate limited (429 status):**

```json
{
  "error": {
    "message": "Too many requests. Please try again in 30 seconds.",
    "code": "RATE_LIMIT_EXCEEDED",
    "retryAfter": 30
  }
}
```

Frontend will display user-friendly message and retry after specified time.

---

## 🔔 WebSocket/Real-Time (Optional)

**If implementing real-time chat:**

**Connection:**

```javascript
const socket = io('ws://localhost:5000', {
  auth: { token: 'jwt-token' },
})
```

**Events:**

- `chat:message` - New message from AI
- `chat:typing` - AI is typing indicator
- `notification:new` - New notification

---

## 📝 Notes for Backend Developer

1. **Test Credentials**: Please provide test accounts for development:

   - Patient: `patient@test.com` / `Patient123`
   - Doctor: `doctor@test.com` / `Doctor123`

2. **API Documentation**: Please provide Swagger UI or Postman collection

3. **Environment**: Let us know when dev/staging/production environments are ready

4. **Breaking Changes**: Please notify before making breaking changes to any endpoint

5. **Response Time**: Try to keep response times under 2 seconds for good UX

---

## 📞 Contact

**Frontend Developer**: [Abdallah Ahmed]  
**Questions**: Reach out if any format doesn't work for backend implementation

---

**Last Updated**: December 23, 2025
