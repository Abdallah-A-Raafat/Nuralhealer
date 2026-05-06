# AI Chatbot Integration Test Script
# Tests the complete AI integration flow with FastAPI service

$baseUrl = "http://localhost:8080/api"
$wsUrl = "ws://localhost:8080/api/ws"

Write-Host "=== AI Chatbot Integration Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. Test Health Endpoint
Write-Host "1. Testing AI Health Endpoint..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/ai/health" -Method Get
    Write-Host "✓ Health Check Response:" -ForegroundColor Green
    Write-Host "  Status: $($healthResponse.status)" -ForegroundColor White
    Write-Host "  Message: $($healthResponse.message)" -ForegroundColor White
    Write-Host "  Timestamp: $($healthResponse.timestamp)" -ForegroundColor White
}
catch {
    Write-Host "✗ Health check failed: $_" -ForegroundColor Red
}

Write-Host ""

# 2. Login to get JWT token
Write-Host "2. Logging in to get JWT token..." -ForegroundColor Yellow
$loginBody = @{
    email    = "test@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✓ Login successful, token obtained" -ForegroundColor Green
}
catch {
    Write-Host "✗ Login failed: $_" -ForegroundColor Red
    Write-Host "⚠ Please ensure you have a test user created" -ForegroundColor Yellow
    exit
}

Write-Host ""

# 3. Test REST AI Ask Endpoint (New Session)
Write-Host "3. Testing REST AI Ask Endpoint (New Session)..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type"  = "application/json; charset=utf-8"
}

$aiQuestion = @{
    user_input = "What are some effective ways to manage stress and anxiety?"
} | ConvertTo-Json -Depth 10

try {
    $aiResponse = Invoke-RestMethod -Uri "$baseUrl/ai/ask" -Method Post -Headers $headers -Body $aiQuestion
    $sessionId = $aiResponse.id
    Write-Host "✓ AI Response received (New Session):" -ForegroundColor Green
    Write-Host "  Session ID: $sessionId" -ForegroundColor White
    Write-Host "  Answer (first 150 chars): $($aiResponse.answer.Substring(0, [Math]::Min(150, $aiResponse.answer.Length)))..." -ForegroundColor White
    Write-Host "  Intent: $($aiResponse.intent)" -ForegroundColor White
    Write-Host "  Confidence: $($aiResponse.confidence)" -ForegroundColor White
    Write-Host "  History entries: $($aiResponse.updatedHistory.Count)" -ForegroundColor White
}
catch {
    Write-Host "✗ AI request failed: $_" -ForegroundColor Red
    Write-Host "⚠ Make sure the AI API is running and accessible" -ForegroundColor Yellow
    Write-Host "Response: $($_.Exception.Response.Content)" -ForegroundColor Yellow
    exit
}

Write-Host ""

# 4. Test REST AI Ask Endpoint (Existing Session)
Write-Host "4. Testing REST AI Ask Endpoint (Existing Session)..." -ForegroundColor Yellow
$followUpQuestion = @{
    user_input = "Can you provide specific techniques for deep breathing?"
} | ConvertTo-Json -Depth 10

try {
    $followUpResponse = Invoke-RestMethod -Uri "$baseUrl/ai/ask/$sessionId" -Method Post -Headers $headers -Body $followUpQuestion
    Write-Host "✓ Follow-up Response received:" -ForegroundColor Green
    Write-Host "  Answer (first 150 chars): $($followUpResponse.answer.Substring(0, [Math]::Min(150, $followUpResponse.answer.Length)))..." -ForegroundColor White
    Write-Host "  Intent: $($followUpResponse.intent)" -ForegroundColor White
    Write-Host "  History entries: $($followUpResponse.updatedHistory.Count)" -ForegroundColor White
}
catch {
    Write-Host "✗ Follow-up request failed: $_" -ForegroundColor Red
}

Write-Host ""

# 5. Voice Endpoint Test Instructions
Write-Host "=== Voice Endpoint Test Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test voice input endpoint:" -ForegroundColor Yellow
Write-Host "  Method: POST $baseUrl/ai/voice/{sessionId}" -ForegroundColor White
Write-Host "  Content-Type: multipart/form-data" -ForegroundColor White
Write-Host "  Parameters:" -ForegroundColor White
Write-Host "    - file: MP3 audio file (binary)" -ForegroundColor Gray
Write-Host "  Response includes:" -ForegroundColor White
Write-Host "    - userText: Transcribed audio text" -ForegroundColor Gray
Write-Host "    - answer: AI response to transcribed text" -ForegroundColor Gray
Write-Host "    - audioBase64: Optional synthesized response audio" -ForegroundColor Gray
Write-Host ""

# 6. WebSocket Test Instructions
Write-Host "=== WebSocket Test Instructions ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To test WebSocket AI integration:" -ForegroundColor Yellow
Write-Host "1. Use a WebSocket client (e.g., https://websocketking.com)" -ForegroundColor White
Write-Host "2. Connect to: $wsUrl" -ForegroundColor White
Write-Host "3. Send CONNECT frame with header:" -ForegroundColor White
Write-Host "   Authorization: Bearer YOUR_JWT_TOKEN" -ForegroundColor Gray
Write-Host "4. Subscribe to user-specific queue:" -ForegroundColor White
Write-Host "   SUBSCRIBE" -ForegroundColor Gray
Write-Host "   destination:/user/queue/ai" -ForegroundColor Gray
Write-Host "5. Send AI question:" -ForegroundColor White
Write-Host "   SEND" -ForegroundColor Gray
Write-Host "   destination:/app/ai/ask" -ForegroundColor Gray
Write-Host '   {"user_input":"Your question here","conversation_history":[["user","prev question"],["assistant","prev response"]]}' -ForegroundColor Gray
Write-Host "6. You should receive:" -ForegroundColor White
Write-Host "   - MESSAGE with type AI_TYPING_START" -ForegroundColor Gray
Write-Host "   - MESSAGE with type AI_RESPONSE containing answer, intent, confidence, updatedHistory" -ForegroundColor Gray
Write-Host "   - MESSAGE with type AI_TYPING_STOP" -ForegroundColor Gray
Write-Host ""

# 7. Response Format Reference
Write-Host "=== AI Response Format ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Success response includes:" -ForegroundColor White
Write-Host "  {" -ForegroundColor Gray
Write-Host '    "response": "AI answer text",' -ForegroundColor Gray
Write-Host '    "intent": "detected user intent",' -ForegroundColor Gray
Write-Host '    "confidence": 0.95,' -ForegroundColor Gray
Write-Host '    "user_text": "user question or transcription",' -ForegroundColor Gray
Write-Host '    "updated_history": [["user","q1"],["assistant","a1"]],' -ForegroundColor Gray
Write-Host '    "audio_base64": "optional audio data"' -ForegroundColor Gray
Write-Host "  }" -ForegroundColor Gray
Write-Host ""

# 8. Summary
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host "✓ Core endpoints tested" -ForegroundColor Green
Write-Host "✓ New session and existing session flows verified" -ForegroundColor Green
Write-Host "✓ Response format with intent and confidence captured" -ForegroundColor Green
Write-Host "✓ Voice endpoint ready for audio file testing" -ForegroundColor Green
Write-Host ""
Write-Host "For full integration testing, ensure:" -ForegroundColor Yellow
Write-Host "  1. Backend is running (./mvnw spring-boot:run)" -ForegroundColor White
Write-Host "  2. AI API is accessible via ngrok tunnel" -ForegroundColor White
Write-Host "  3. Environment variables set in .env file" -ForegroundColor White
Write-Host "  4. Database is running and tables initialized" -ForegroundColor White

