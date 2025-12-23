# 🧠 NeuralHealer - AI-Powered Mental Health Platform
# منصة العلاج النفسي بالذكاء الاصطناعي

<div align="center">

![NeuralHealer Logo](./assets/logo.png)

**A comprehensive mental health platform powered by AI**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Web](https://img.shields.io/badge/Web-React-61DAFB?logo=react)](./web)
[![Mobile](https://img.shields.io/badge/Mobile-React%20Native-61DAFB?logo=react)](./mobile)
[![Backend](https://img.shields.io/badge/Backend-Node.js-339933?logo=node.js)](./backend)
[![AI](https://img.shields.io/badge/AI-Python-3776AB?logo=python)](./ai)

</div>

---

## 📱 نبذة عن المشروع | About

<div dir="rtl">

**NeuralHealer** هو تطبيق متكامل للصحة النفسية يجمع بين:
- 💬 جلسات علاج نفسي مع AI ذكي (نص وصوت)
- 👨‍⚕️ حجز مواعيد مع دكاترة نفسيين
- 📊 تتبع التطور النفسي
- 🌍 دعم متعدد اللغات (عربي وإنجليزي)
- 📱 تطبيق ويب وموبايل

</div>

**NeuralHealer** is a comprehensive mental health platform featuring:
- 💬 AI-powered therapy sessions (text & voice)
- 👨‍⚕️ Doctor appointment booking system
- 📊 Progress tracking and analytics
- 🌍 Multi-language support (Arabic & English)
- 📱 Web and Mobile applications

---

## 🏗️ Project Structure | الهيكل

```
NeuralHealer/
├── 🎨 web/              # Frontend Web Application (React)
├── 📱 mobile/           # Mobile Application (React Native)
├── ⚙️ backend/          # Backend API Server (Node.js/Express)
├── 🤖 ai/               # AI/ML Models & Microservice (Python)
├── 📚 docs/             # Documentation
├── 🔄 shared/           # Shared Code & Types
├── 🛠️ scripts/         # Automation Scripts
└── ☁️ infra/           # Infrastructure & DevOps
```

---

## ✨ Features | المميزات

### For Patients | للمرضى
- ✅ AI therapy chatbot with emotion detection
- ✅ Voice therapy sessions
- ✅ Book appointments with certified therapists
- ✅ Track therapy progress
- ✅ Session history and insights
- ✅ Multi-language support

### For Doctors | للدكاترة
- ✅ Patient management dashboard
- ✅ Appointment scheduling
- ✅ View patient history
- ✅ Session notes and records
- ✅ Performance analytics

---

## 🚀 Quick Start | البدء السريع

### Prerequisites | المتطلبات

```bash
# Install Node.js (v18+)
# Install Python (v3.10+)
# Install PostgreSQL (v14+)
# Install Redis (optional)
```

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/NeuralHealer.git
cd NeuralHealer
```

### 2️⃣ Setup Web Application

```bash
cd web
npm install
cp .env.example .env
npm run dev
```

🌐 Open: http://localhost:5173

### 3️⃣ Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure database in .env
npm run dev
```

🔧 API runs on: http://localhost:5000

### 4️⃣ Setup AI Service

```bash
cd ai
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python api/app.py
```

🤖 AI service runs on: http://localhost:8000

### 5️⃣ Setup Mobile App

```bash
cd mobile
npm install
npx react-native run-android  # Android
# or
npx react-native run-ios       # iOS
```

---

## 🏗️ Architecture | المعمارية

```
┌─────────────┐         ┌─────────────┐
│   Web App   │         │  Mobile App │
│   (React)   │         │(React Native)│
└──────┬──────┘         └──────┬──────┘
       │                       │
       └───────────┬───────────┘
                   │
                   ▼
            ┌─────────────┐
            │   Backend   │◄──────┐
            │     API     │       │
            └──────┬──────┘       │
                   │              │
                   ▼              ▼
            ┌─────────────┐  ┌─────────┐
            │  Database   │  │AI Service│
            │ (PostgreSQL)│  │ (FastAPI)│
            └─────────────┘  └─────────┘
```

---

## 📚 Documentation | التوثيق

### General | عام
- [📖 Full Documentation](./docs/README.md)
- [🏗️ Architecture Overview](./docs/architecture/SYSTEM_DESIGN.md)
- [🗄️ Database Schema](./docs/architecture/DATABASE_SCHEMA.md)

### API Documentation
- [📋 API Contract](./docs/api/API_CONTRACT.md)
- [🔐 Authentication](./docs/api/AUTHENTICATION.md)
- [🤖 AI Endpoints](./docs/api/AI_API.md)

### Setup Guides | أدلة الإعداد
- [⚙️ Backend Setup (Arabic)](./docs/setup/BACKEND_PLAN_ARABIC.md)
- [🤖 AI Team Guide](./docs/setup/AI_SETUP.md)
- [📱 Mobile Setup](./docs/setup/MOBILE_SETUP.md)

### Integration | التكامل
- [🔗 Integration Guide](./docs/integration/INTEGRATION_GUIDE.md)
- [🧪 Testing Guide](./docs/integration/TESTING_GUIDE.md)

---

## 🛠️ Tech Stack | التقنيات

### Frontend Web
- **Framework**: React 19
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Routing**: React Router
- **Forms**: React Hook Form + Yup
- **HTTP Client**: Axios

### Mobile
- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: Zustand
- **UI Library**: React Native Paper

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT
- **Email**: Nodemailer

### AI/ML
- **Language**: Python
- **Framework**: FastAPI
- **ML Libraries**: TensorFlow, PyTorch, Scikit-learn
- **NLP**: Transformers, OpenAI API
- **Emotion Detection**: Custom models

---

## 📦 Modules | الوحدات

### 🔐 Authentication
- User registration (Patient/Doctor)
- Login with JWT
- Password reset
- Email verification

### 💬 AI Therapy
- Text-based chat sessions
- Voice therapy sessions
- Emotion detection
- Sentiment analysis
- Context-aware responses

### 👨‍⚕️ Doctor Management
- Doctor profiles
- Availability management
- Reviews and ratings

### 📅 Appointment Booking
- Book appointments
- View appointments
- Reschedule/Cancel
- Online meeting links
- Email notifications

### 📊 Dashboard
- Patient statistics
- Doctor analytics
- Session insights
- Progress tracking

---

## 🧪 Testing | الاختبار

```bash
# Test Web
cd web && npm test

# Test Backend
cd backend && npm test

# Test AI Service
cd ai && pytest

# Test Mobile
cd mobile && npm test
```

---

## 🚀 Deployment | النشر

### Web Application
- **Recommended**: Vercel / Netlify
- **Alternative**: AWS S3 + CloudFront

### Backend
- **Recommended**: AWS EC2 / Heroku
- **Alternative**: DigitalOcean / Railway

### AI Service
- **Recommended**: AWS EC2 with GPU
- **Alternative**: Google Cloud Run

### Mobile Apps
- **Android**: Google Play Store
- **iOS**: Apple App Store

**See**: [Deployment Guide](./docs/deployment/DEPLOYMENT_GUIDE.md)

---

## 🤝 Contributing | المساهمة

<div dir="rtl">

نرحب بالمساهمات! يرجى:
1. Fork المشروع
2. إنشاء Branch جديد (`git checkout -b feature/amazing-feature`)
3. Commit التغييرات (`git commit -m 'Add amazing feature'`)
4. Push للـ Branch (`git push origin feature/amazing-feature`)
5. فتح Pull Request

</div>

We welcome contributions! Please:
1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

## 👥 Team | الفريق

- **Frontend Web Developer**: [Your Name]
- **Mobile Developer**: [Your Name]
- **Backend Developer**: [Name]
- **AI/ML Engineer**: [Name]
- **UI/UX Designer**: [Name]

---

## 📄 License | الترخيص

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 Contact | التواصل

- **Email**: contact@neuralhealer.com
- **Website**: https://neuralhealer.com
- **GitHub**: https://github.com/your-username/NeuralHealer

---

## 🙏 Acknowledgments | شكر وتقدير

<div dir="rtl">

- شكراً لكل من ساهم في هذا المشروع
- شكراً لمستخدمي التطبيق
- شكراً للمجتمع المفتوح المصدر

</div>

---

<div align="center">

**Made with ❤️ by NeuralHealer Team**

**صُنع بـ ❤️ من فريق NeuralHealer**

⭐ إذا أعجبك المشروع، اضغط على Star!

</div>
