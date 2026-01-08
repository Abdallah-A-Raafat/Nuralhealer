# 🚀 AI Chat Setup Guide (Google Colab + Backend)

## ✅ What You Have Now:

- **Frontend**: WebSocket integration ready ✓
- **Backend**: Spring Boot proxy server ready ✓
- **AI Service**: Running on Google Colab (needs setup)

---

## 📋 Setup Steps:

### **Step 1: Start Google Colab AI Service**

1. Open your AI model notebook in Google Colab
2. Make sure it has these endpoints:

   - `GET /health` - Returns 200 OK when AI is ready
   - `POST /ask` - Accepts `{"question": "..."}` and returns answer

3. Install ngrok in Colab:

```python
!pip install pyngrok
from pyngrok import ngrok

# Start ngrok tunnel
public_url = ngrok.connect(5000)  # or whatever port your Flask/FastAPI runs on
print("Public URL:", public_url)
```

4. **Copy the ngrok URL** (e.g., `https://abc123.ngrok-free.app`)

---

### **Step 2: Update Backend Configuration**

Edit `backend/backend/src/main/resources/application.yml`:

```yaml
ai:
  chatbot:
    base-url: https://YOUR-NGROK-URL-HERE # ← Paste your ngrok URL here
    health-endpoint: /health
    ask-endpoint: /ask
    timeout-seconds: 90
```

**Important**: Update this URL **every time** you restart Google Colab (ngrok URL changes each time)

---

### **Step 3: Start Backend Server**

```bash
cd backend/backend
./mvnw spring-boot:run
```

Wait for: `✅ Started NeuralhealerBackendApplication`

---

### **Step 4: Start Frontend**

```bash
cd web
npm run dev
```

Frontend will connect to: `ws://localhost:8080/api/ai-ws`

---

### **Step 5: Test the Integration**

1. Open browser: `http://localhost:5173`
2. Login as a patient
3. Go to "Chat" page
4. Click "Start Text Session"
5. Look for connection status:

   - 🟢 **Connected** = Ready to chat!
   - 🟡 **Connecting...** = Wait a moment
   - 🔴 **Disconnected** = Check backend/Colab

6. Send a message and wait for AI response!

---

## 🔍 Troubleshooting:

### Problem: "Disconnected" status

**Check**:

1. Is backend running? `curl http://localhost:8080/api/actuator/health`
2. Is Google Colab running? Open the Colab notebook
3. Is ngrok tunnel active? Check Colab output

**Fix**: Restart the failing component

---

### Problem: AI not responding

**Check backend logs** for:

```
AI health check failed: Connection refused
```

**Fix**:

1. Check ngrok URL in `application.yml`
2. Test AI directly: `curl https://your-ngrok-url.ngrok-free.app/health`
3. Restart Google Colab and update ngrok URL

---

### Problem: Backend can't start

**Check**:

- Port 8080 in use? Kill it: `lsof -ti:8080 | xargs kill -9`
- PostgreSQL running? `sudo systemctl status postgresql`

---

## 📝 Google Colab AI Service Example:

If you need a basic AI service structure:

```python
from flask import Flask, request, jsonify
from pyngrok import ngrok
import os

app = Flask(__name__)

# Your AI model initialization here
# model = load_your_model()

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    question = data.get('question', '')

    # Call your AI model here
    # answer = model.generate(question)
    answer = f"Mock answer for: {question}"

    return jsonify({
        "answer": answer,
        "sources": ["source1.md", "source2.md"]
    }), 200

if __name__ == '__main__':
    # Start ngrok tunnel
    public_url = ngrok.connect(5000)
    print(f"🌐 Public URL: {public_url}")
    print(f"📋 Update backend config with: {public_url}")

    # Run Flask
    app.run(port=5000)
```

---

## 🎯 What Happens When You Send a Message:

```
User types: "I feel anxious"
    ↓
Frontend sends via WebSocket to localhost:8080
    ↓
Backend receives and forwards to Google Colab via HTTP
    ↓
Google Colab AI processes question using RAG
    ↓
Backend receives answer and sends via WebSocket
    ↓
Frontend displays: "Here are some ways to manage anxiety..."
```

---

## 🔄 Daily Workflow:

1. **Morning**: Start Google Colab → Copy ngrok URL → Update `application.yml`
2. **Start Backend**: `./mvnw spring-boot:run`
3. **Start Frontend**: `npm run dev`
4. **Develop**: Make changes, test, repeat
5. **Evening**: Colab can sleep, just restart tomorrow

---

## 🚀 Production Deployment (Later):

Instead of Google Colab + ngrok, you'll need:

- AI service on cloud (AWS, GCP, Azure)
- Permanent URL (no ngrok)
- Proper authentication
- Load balancing

But for now, **Colab + ngrok works perfectly for development!** 🎉

---

## 📞 Need Help?

Check these in order:

1. Frontend console (F12) - See WebSocket messages
2. Backend logs - See AI communication
3. Colab output - See if AI is running
4. Test each component individually

Your setup is ready to go! Just start Colab and update the ngrok URL! 🚀
