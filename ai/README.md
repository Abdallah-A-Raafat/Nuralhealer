# 🤖 AI/ML Service

Python-based AI microservice for emotion detection, sentiment analysis, and therapy response generation.

---

## 🚀 Quick Start

### Installation

```bash
# Create virtual environment
python -m venv venv

# Activate
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### Environment Setup

```bash
cp .env.example .env
```

Configure your `.env`:
```env
# AI Service
PORT=8000
ENVIRONMENT=development

# OpenAI (if using)
OPENAI_API_KEY=sk-your-key-here

# Google AI (alternative)
GOOGLE_AI_KEY=your-key-here

# Model paths
EMOTION_MODEL_PATH=./models/emotion_model.pkl
SENTIMENT_MODEL_PATH=./models/sentiment_model.h5
```

### Run AI Service

```bash
# Development
python api/app.py

# Or with uvicorn
uvicorn api.app:app --reload --port 8000
```

AI service runs on: http://localhost:8000

---

## 📁 Project Structure

```
ai/
├── models/                     # Trained models
│   ├── emotion_model.pkl
│   ├── sentiment_model.h5
│   └── therapy_model/
├── notebooks/                  # Jupyter notebooks
│   ├── emotion_training.ipynb
│   ├── sentiment_analysis.ipynb
│   └── data_exploration.ipynb
├── src/                        # Source code
│   ├── emotion_detection/
│   │   ├── train.py
│   │   ├── predict.py
│   │   └── model.py
│   ├── sentiment_analysis/
│   ├── text_generation/
│   └── voice_processing/
├── api/                        # FastAPI microservice
│   ├── app.py                  # Main app
│   ├── routes/
│   │   ├── emotion.py
│   │   ├── sentiment.py
│   │   └── therapy.py
│   └── utils/
├── data/                       # Training data
│   ├── raw/
│   ├── processed/
│   └── README.md
├── tests/                      # Unit tests
└── requirements.txt
```

---

## 🔧 Tech Stack

- **Python** 3.10+
- **FastAPI** - Web framework
- **TensorFlow** / **PyTorch** - Deep learning
- **Scikit-learn** - ML algorithms
- **Transformers** - NLP models
- **OpenAI API** - GPT integration
- **Pandas** / **NumPy** - Data processing

---

## 📡 API Endpoints

### Emotion Detection
```http
POST /ai/analyze-emotion
Content-Type: application/json

{
  "text": "أنا حاسس بقلق كتير",
  "language": "ar"
}

Response:
{
  "emotion": "anxious",
  "confidence": 0.87,
  "all_emotions": {
    "anxious": 0.87,
    "sad": 0.08,
    "neutral": 0.05
  }
}
```

### Sentiment Analysis
```http
POST /ai/analyze-sentiment
Content-Type: application/json

{
  "text": "الجلسة كانت مفيدة جداً"
}

Response:
{
  "sentiment": "positive",
  "score": 0.92,
  "confidence": 0.95
}
```

### Therapy Response Generation
```http
POST /ai/generate-response
Content-Type: application/json

{
  "message": "أنا حاسس بقلق",
  "context": [...],
  "emotion": "anxious",
  "language": "ar"
}

Response:
{
  "response": "فاهم إحساسك، القلق حاجة طبيعية...",
  "suggestions": [
    "جرب تمارين التنفس",
    "اكتب أفكارك"
  ],
  "confidence": 0.89
}
```

### Voice Processing
```http
POST /ai/voice-to-text
Content-Type: multipart/form-data

audio: [audio file]
language: ar

Response:
{
  "text": "أنا محتاج مساعدة",
  "confidence": 0.94
}
```

---

## 🧠 Models

### Emotion Detection Model
- **Architecture**: BERT-based
- **Languages**: Arabic, English
- **Emotions**: anxious, sad, happy, angry, neutral, calm
- **Accuracy**: ~85%

### Sentiment Analysis
- **Architecture**: LSTM
- **Output**: positive, negative, neutral
- **Accuracy**: ~90%

### Therapy Response Generation
- **Based on**: GPT-4 / Custom fine-tuned model
- **Context-aware**: Uses conversation history
- **Safety**: Content filtering enabled

---

## 🧪 Testing

```bash
# Unit tests
pytest

# With coverage
pytest --cov=src tests/

# Specific test
pytest tests/test_emotion.py
```

---

## 📊 Training Models

### Train Emotion Detection

```bash
python src/emotion_detection/train.py \
  --data data/processed/emotion_data.csv \
  --epochs 50 \
  --batch-size 32
```

### Train Sentiment Model

```bash
python src/sentiment_analysis/train.py \
  --data data/processed/sentiment_data.csv
```

---

## 📈 Monitoring

```bash
# Check model performance
python src/evaluate.py --model emotion

# View logs
tail -f logs/ai_service.log
```

---

## 🚀 Deployment

### Docker

```bash
docker build -t neuralhealer-ai .
docker run -p 8000:8000 neuralhealer-ai
```

### AWS EC2 (GPU)

```bash
# Recommended instance: p3.2xlarge (GPU)
# See deployment guide for full setup
```

---

## 📝 Scripts

- `python api/app.py` - Start AI service
- `python src/train.py` - Train models
- `pytest` - Run tests
- `jupyter notebook` - Open notebooks

---

## 🔗 Related

- [API Documentation](../docs/api/AI_API.md)
- [Setup Guide](../docs/setup/AI_SETUP.md)
- [Backend Integration](../backend/README.md)

---

## 📞 Support

For AI-related questions, contact the AI team or open an issue on GitHub.
