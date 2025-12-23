# AI Service API Documentation

## Overview
The AI service provides emotion detection, sentiment analysis, and therapeutic response generation capabilities.

## Base URL
- Development: `http://localhost:8000`
- Production: `https://api.neuralhealer.com/ai`

## Authentication
All endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Analyze Emotion

Analyzes text or audio input to detect emotions.

**Endpoint:** `POST /ai/analyze-emotion`

**Request Body:**
```json
{
  "type": "text" | "audio",
  "content": "string (for text) or base64 (for audio)",
  "language": "en" | "ar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "emotions": [
      {
        "emotion": "happy",
        "confidence": 0.85
      },
      {
        "emotion": "neutral",
        "confidence": 0.12
      }
    ],
    "primaryEmotion": "happy",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

**Supported Emotions:**
- happy
- sad
- angry
- anxious
- fearful
- neutral
- surprised

---

### 2. Analyze Sentiment

Performs sentiment analysis on text or conversation.

**Endpoint:** `POST /ai/analyze-sentiment`

**Request Body:**
```json
{
  "text": "string",
  "language": "en" | "ar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sentiment": "positive" | "negative" | "neutral",
    "score": 0.78,
    "aspects": {
      "positivity": 0.8,
      "negativity": 0.1,
      "neutrality": 0.1
    }
  }
}
```

---

### 3. Generate Response

Generates therapeutic AI response based on user input and detected emotions.

**Endpoint:** `POST /ai/generate-response`

**Request Body:**
```json
{
  "userMessage": "string",
  "emotion": "happy" | "sad" | "angry" | "anxious" | "fearful",
  "conversationHistory": [
    {
      "role": "user" | "assistant",
      "content": "string"
    }
  ],
  "language": "en" | "ar",
  "therapyType": "cbt" | "supportive" | "mindfulness"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "string",
    "suggestions": ["string"],
    "resources": ["string"],
    "nextSteps": ["string"]
  }
}
```

---

### 4. Voice to Text

Converts audio to text using speech recognition.

**Endpoint:** `POST /ai/voice-to-text`

**Request Body:**
```json
{
  "audio": "base64_encoded_audio",
  "language": "en" | "ar",
  "format": "wav" | "mp3" | "webm"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "text": "string",
    "confidence": 0.95,
    "language": "en"
  }
}
```

---

### 5. Text to Voice

Converts text to speech audio.

**Endpoint:** `POST /ai/text-to-voice`

**Request Body:**
```json
{
  "text": "string",
  "language": "en" | "ar",
  "voice": "male" | "female",
  "speed": 1.0
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "audio": "base64_encoded_audio",
    "format": "mp3",
    "duration": 5.2
  }
}
```

---

### 6. Analyze Conversation

Analyzes entire conversation for patterns and insights.

**Endpoint:** `POST /ai/analyze-conversation`

**Request Body:**
```json
{
  "sessionId": "string",
  "messages": [
    {
      "role": "user" | "assistant",
      "content": "string",
      "timestamp": "ISO 8601"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "insights": {
      "dominantEmotions": ["anxious", "sad"],
      "conversationTone": "supportive",
      "topicsDiscussed": ["work stress", "relationships"],
      "progressIndicators": {
        "positiveShift": 0.3,
        "engagementLevel": 0.8
      }
    },
    "recommendations": [
      "Consider scheduling follow-up session",
      "Recommend mindfulness exercises"
    ]
  }
}
```

---

### 7. Get Crisis Detection

Detects if user is in crisis and needs immediate help.

**Endpoint:** `POST /ai/crisis-detection`

**Request Body:**
```json
{
  "text": "string",
  "emotion": "string",
  "sentiment": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCrisis": true,
    "severity": "high" | "medium" | "low",
    "indicators": [
      "suicide ideation detected",
      "self-harm language"
    ],
    "recommendedAction": "immediate_intervention",
    "emergencyContacts": [
      {
        "name": "Crisis Hotline",
        "phone": "988",
        "available": "24/7"
      }
    ]
  }
}
```

---

### 8. Health Check

Check if AI service is running.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "models": {
    "emotion": "loaded",
    "sentiment": "loaded",
    "nlp": "loaded"
  }
}
```

---

## Error Responses

All endpoints may return these error responses:

**400 Bad Request:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_INPUT",
    "message": "Invalid input format"
  }
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or missing authentication token"
  }
}
```

**429 Too Many Requests:**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 60
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal error occurred"
  }
}
```

---

## Rate Limits

- Emotion Analysis: 100 requests/minute
- Response Generation: 50 requests/minute
- Voice Processing: 20 requests/minute
- Crisis Detection: 200 requests/minute

---

## Model Information

### Emotion Detection Model
- **Architecture:** BERT-based fine-tuned on emotion datasets
- **Languages:** English, Arabic
- **Accuracy:** 87% on validation set
- **Input:** Text (max 512 tokens) or Audio (max 60 seconds)

### Sentiment Analysis Model
- **Architecture:** LSTM with attention mechanism
- **Languages:** English, Arabic
- **Accuracy:** 92% on validation set
- **Input:** Text (max 1000 tokens)

### Response Generation
- **Model:** GPT-4 with custom therapeutic prompts
- **Fallback:** Fine-tuned GPT-3.5 for faster responses
- **Context:** Up to 10 previous messages
- **Safety:** Content filtering and crisis detection

---

## Usage Examples

### JavaScript (Axios)
```javascript
import axios from 'axios';

const analyzeEmotion = async (text) => {
  try {
    const response = await axios.post(
      'http://localhost:8000/ai/analyze-emotion',
      {
        type: 'text',
        content: text,
        language: 'en'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response.data);
  }
};
```

### Python
```python
import requests

def analyze_emotion(text, token):
    url = 'http://localhost:8000/ai/analyze-emotion'
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    data = {
        'type': 'text',
        'content': text,
        'language': 'en'
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()
```

---

## WebSocket Support (Future)

Real-time emotion analysis during voice calls:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/realtime-analysis');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'authenticate',
    token: 'your-jwt-token'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time emotion:', data.emotion);
};

// Send audio chunks
ws.send(audioChunk);
```
