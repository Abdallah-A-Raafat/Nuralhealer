# 🚀 خطة تطوير الـ Backend - مشروع NeuralHealer

**تاريخ البدء**: 23 ديسمبر 2025  
**المشروع**: منصة علاج نفسي بالذكاء الاصطناعي  
**Frontend**: جاهز ومستني الـ Backend

---

## 📱 نبذة عن المشروع

**NeuralHealer** هو تطبيق ويب للصحة النفسية فيه:

- 💬 **شات مع AI** - جلسات علاج نفسي بالذكاء الاصطناعي (نص وصوت)
- 👨‍⚕️ **حجز مواعيد** - المرضى يقدروا يحجزوا مع دكاترة نفسيين
- 🏥 **لوحة تحكم للدكاترة** - الدكتور يشوف مرضاه ومواعيده
- 📊 **تتبع الحالة** - تاريخ الجلسات والتطور
- 🌍 **متعدد اللغات** - إنجليزي وعربي

---

## 🎯 المطلوب منك كـ Backend Developer

### **1️⃣ الأساسيات (الأسبوع الأول)**

#### **A. إعداد المشروع**

```bash
# اختار Framework مناسب
- Node.js + Express.js (الأسهل والأسرع)
- Python + FastAPI (كويس للـ AI Integration)
- Python + Django REST Framework (Framework متكامل)
```

#### **B. قاعدة البيانات**

```
- PostgreSQL (للبيانات المنظمة: Users, Doctors, Appointments)
- MongoDB (اختياري للـ Chat Messages)
- Redis (للـ Sessions & Caching)
```

#### **C. البنية الأساسية**

```
backend/
├── src/
│   ├── routes/          # API Endpoints
│   ├── controllers/     # Business Logic
│   ├── models/          # Database Models
│   ├── middleware/      # Auth, Validation, Error Handling
│   ├── services/        # External Services (AI, Email)
│   ├── config/          # Configuration
│   └── utils/           # Helper Functions
├── tests/               # Unit & Integration Tests
├── .env.example         # Environment Variables Template
├── package.json         # Dependencies
└── README.md            # Setup Instructions
```

---

## 🔐 الأولوية الأولى: نظام المصادقة (Authentication)

### **المطلوب:**

#### **1. POST /api/auth/register**

**الوظيفة**: تسجيل مستخدم جديد (مريض أو دكتور)

**البيانات المُرسلة:**

```json
{
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed@example.com",
  "password": "Password123",
  "accountType": "patient", // أو "doctor"

  // للدكاترة فقط:
  "specialization": "علم نفس إكلينيكي",
  "licenseNumber": "12345",
  "phone": "+201234567890"
}
```

**الـ Response المطلوب:**

```json
{
  "user": {
    "id": "uuid",
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "ahmed@example.com",
    "accountType": "patient",
    "profileImage": null,
    "isVerified": false
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "accountType": "patient"
}
```

**متطلبات:**

- ✅ Hash الـ Password (bcrypt أو argon2)
- ✅ Validation (email صحيح، password قوي)
- ✅ منع التسجيل بـ email موجود
- ✅ إنشاء JWT Token (صلاحية 15 دقيقة)
- ✅ إنشاء Refresh Token (صلاحية 7 أيام)
- ⚠️ للدكاترة: حالة "pending verification" لحد ما الـ Admin يوافق

---

#### **2. POST /api/auth/login**

**الوظيفة**: تسجيل الدخول

**البيانات المُرسلة:**

```json
{
  "email": "ahmed@example.com",
  "password": "Password123"
}
```

**الـ Response المطلوب:**

```json
{
  "user": {
    "id": "uuid",
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "ahmed@example.com",
    "accountType": "patient",
    "profileImage": "url"
  },
  "token": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "accountType": "patient"
}
```

**متطلبات:**

- ✅ مقارنة الـ Password المُشفر
- ✅ Error واضح لو credentials غلط
- ✅ تسجيل Last Login
- ✅ Rate Limiting (10 محاولات كل 15 دقيقة)

---

#### **3. GET /api/auth/me**

**الوظيفة**: جلب بيانات المستخدم الحالي

**الـ Headers:**

```
Authorization: Bearer <token>
```

**الـ Response:**

```json
{
  "id": "uuid",
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed@example.com",
  "accountType": "patient",
  "profileImage": "url",
  "phone": "+201234567890",
  "createdAt": "2025-12-23T10:00:00Z"
}
```

---

#### **4. POST /api/auth/refresh**

**الوظيفة**: تجديد الـ Access Token

**البيانات المُرسلة:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

**الـ Response:**

```json
{
  "token": "new_access_token"
}
```

---

#### **5. POST /api/auth/logout**

**الوظيفة**: تسجيل الخروج (إضافة Token للـ Blacklist)

**الـ Headers:**

```
Authorization: Bearer <token>
```

**الـ Response:**

```json
{
  "message": "تم تسجيل الخروج بنجاح"
}
```

---

## 🏥 المرحلة الثانية: قائمة الدكاترة (Doctors Module)

### **المطلوب:**

#### **1. GET /api/doctors**

**الوظيفة**: عرض قائمة كل الدكاترة المُتاحين

**Query Parameters:**

```
?page=1
&limit=10
&specialization=علم نفس إكلينيكي
&sortBy=rating
```

**الـ Response:**

```json
{
  "doctors": [
    {
      "id": "uuid",
      "firstName": "سارة",
      "lastName": "أحمد",
      "specialization": "علم نفس إكلينيكي",
      "experience": "12 سنة",
      "rating": 4.9,
      "reviewCount": 248,
      "bio": "متخصصة في علاج القلق والاكتئاب",
      "profileImage": "url",
      "languages": ["العربية", "الإنجليزية"],
      "price": 500,
      "availability": "الأحد-الخميس، 9ص-6م",
      "nextAvailable": "2025-12-27T10:00:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "total": 25
  }
}
```

**متطلبات:**

- ✅ Pagination
- ✅ Filtering (التخصص، السعر، التقييم)
- ✅ Sorting (حسب التقييم، الخبرة، السعر)
- ✅ فقط الدكاترة الـ Verified

---

#### **2. GET /api/doctors/:doctorId**

**الوظيفة**: بيانات دكتور معين بالتفصيل

**الـ Response:**

```json
{
  "id": "uuid",
  "firstName": "سارة",
  "lastName": "أحمد",
  "specialization": "علم نفس إكلينيكي",
  "qualification": "دكتوراه في علم النفس الإكلينيكي",
  "experience": "12 سنة",
  "bio": "متخصصة في علاج القلق...",
  "profileImage": "url",
  "rating": 4.9,
  "reviewCount": 248,
  "languages": ["العربية", "الإنجليزية"],
  "price": 500,
  "availability": "الأحد-الخميس، 9ص-6م",
  "reviews": [
    {
      "patientName": "مجهول",
      "rating": 5,
      "comment": "دكتورة ممتازة وساعدتني كتير",
      "date": "2025-12-20"
    }
  ]
}
```

---

#### **3. GET /api/doctors/:doctorId/slots**

**الوظيفة**: المواعيد المُتاحة لدكتور معين

**Query Parameters:**

```
?date=2025-12-27
```

**الـ Response:**

```json
{
  "date": "2025-12-27",
  "availableSlots": [
    {
      "time": "10:00",
      "available": true
    },
    {
      "time": "11:00",
      "available": false
    },
    {
      "time": "14:00",
      "available": true
    }
  ]
}
```

---

## 💬 المرحلة الثالثة: نظام الشات مع الـ AI

### **المطلوب:**

#### **1. POST /api/chat/start**

**الوظيفة**: بدء جلسة علاج جديدة

**الـ Headers:**

```
Authorization: Bearer <token>
```

**الـ Response:**

```json
{
  "sessionId": "uuid",
  "startTime": "2025-12-23T20:30:00Z",
  "message": "أهلاً! أنا المعالج النفسي الافتراضي. إزاي تحس النهاردة؟"
}
```

**متطلبات:**

- ✅ إنشاء Session جديدة في Database
- ✅ ربطها بالـ User
- ✅ رسالة ترحيب من الـ AI

---

#### **2. POST /api/chat/message**

**الوظيفة**: إرسال رسالة في الجلسة

**البيانات المُرسلة:**

```json
{
  "sessionId": "uuid",
  "message": "أنا حاسس بقلق كتير الفترة دي",
  "messageType": "text",
  "timestamp": "2025-12-23T20:31:00Z"
}
```

**الـ Response:**

```json
{
  "message": "فاهم إحساسك، القلق حاجة طبيعية بتحصل لينا كلنا. ممكن تحكيلي أكتر؟",
  "emotion": "anxious",
  "sentiment": "negative",
  "suggestions": [
    "جرب تمارين التنفس العميق",
    "اكتب أفكارك في يومية",
    "احجز مع دكتور نفسي"
  ],
  "timestamp": "2025-12-23T20:31:05Z"
}
```

**متطلبات الـ AI Integration:**

##### **Option 1: OpenAI GPT-4 (موصى به)**

```javascript
// Node.js Example
const openai = require('openai')

const response = await openai.chat.completions.create({
  model: 'gpt-4',
  messages: [
    {
      role: 'system',
      content: 'أنت معالج نفسي محترف. تكلم بطريقة تعاطفية ومحترمة.',
    },
    {
      role: 'user',
      content: userMessage,
    },
  ],
  temperature: 0.7,
})
```

##### **Option 2: Google Gemini**

```python
# Python Example
import google.generativeai as genai

model = genai.GenerativeModel('gemini-pro')
response = model.generate_content(user_message)
```

##### **متطلبات إضافية:**

- ✅ **Sentiment Analysis** - تحليل الحالة النفسية
- ✅ **Emotion Detection** - كشف المشاعر (قلق، حزن، سعادة)
- ✅ **Context Awareness** - حفظ سياق المحادثة
- ⚠️ **Crisis Detection** - لو حد ذكر انتحار، تحذير فوري
- ✅ **Session History** - حفظ كل الرسائل

---

#### **3. POST /api/chat/end/:sessionId**

**الوظيفة**: إنهاء الجلسة

**الـ Response:**

```json
{
  "message": "تم إنهاء الجلسة بنجاح",
  "sessionId": "uuid",
  "duration": "45 دقيقة",
  "totalMessages": 24,
  "emotionSummary": {
    "dominant_emotion": "calm",
    "improvement": "positive"
  },
  "summary": "الجلسة ركزت على التعامل مع القلق..."
}
```

---

#### **4. GET /api/chat/sessions**

**الوظيفة**: تاريخ جلسات المستخدم

**Query Parameters:**

```
?page=1&limit=10
```

**الـ Response:**

```json
{
  "sessions": [
    {
      "id": "uuid",
      "date": "2025-12-23",
      "time": "20:30",
      "duration": "45 دقيقة",
      "type": "text",
      "emotionSummary": "calm",
      "messageCount": 24,
      "notes": "جلسة عن التعامل مع ضغط الشغل"
    }
  ],
  "pagination": {...}
}
```

---

## 📅 المرحلة الرابعة: نظام الحجز (Booking)

### **المطلوب:**

#### **1. POST /api/booking/create**

**الوظيفة**: حجز موعد مع دكتور

**البيانات المُرسلة:**

```json
{
  "doctorId": "uuid",
  "date": "2025-12-27",
  "time": "10:00",
  "type": "online",
  "reason": "جلسة استشارية",
  "notes": "أول زيارة"
}
```

**الـ Response:**

```json
{
  "bookingId": "uuid",
  "message": "تم حجز الموعد بنجاح",
  "booking": {
    "id": "uuid",
    "doctorName": "د. سارة أحمد",
    "date": "2025-12-27",
    "time": "10:00",
    "type": "online",
    "status": "confirmed",
    "meetingLink": "https://meet.neuralhealer.com/xyz",
    "price": 500
  }
}
```

**متطلبات:**

- ✅ التأكد إن الـ Slot متاح
- ✅ منع Double Booking
- ✅ إنشاء Meeting Link (لو Online)
- ✅ إرسال Email للدكتور والمريض
- ✅ إضافة Reminder قبل الموعد بـ 24 ساعة

---

#### **2. GET /api/booking/user**

**الوظيفة**: مواعيد المريض (Patient)

**Query Parameters:**

```
?status=upcoming  // أو past أو cancelled
```

**الـ Response:**

```json
{
  "bookings": [
    {
      "id": "uuid",
      "doctorName": "د. سارة أحمد",
      "doctorImage": "url",
      "date": "2025-12-27",
      "time": "10:00",
      "duration": "ساعة",
      "type": "online",
      "status": "confirmed",
      "meetingLink": "https://meet.neuralhealer.com/xyz",
      "price": 500
    }
  ]
}
```

---

#### **3. GET /api/booking/doctor** (للدكاترة فقط)

**الوظيفة**: مواعيد الدكتور

**Query Parameters:**

```
?date=2025-12-27&status=confirmed
```

**الـ Response:**

```json
{
  "appointments": [
    {
      "id": "uuid",
      "patientName": "أحمد محمد",
      "patientImage": "url",
      "date": "2025-12-27",
      "time": "10:00",
      "duration": "ساعة",
      "type": "online",
      "status": "confirmed",
      "reason": "جلسة استشارية",
      "notes": "أول زيارة"
    }
  ]
}
```

---

#### **4. DELETE /api/booking/:bookingId**

**الوظيفة**: إلغاء الموعد

**الـ Response:**

```json
{
  "message": "تم إلغاء الموعد بنجاح"
}
```

**متطلبات:**

- ✅ إلغاء لحد 24 ساعة قبل الموعد
- ✅ إشعار الدكتور والمريض
- ✅ إرجاع الـ Slot للمتاح

---

## 👨‍⚕️ المرحلة الخامسة: لوحة تحكم الدكتور

### **المطلوب:**

#### **1. GET /api/doctor/stats** (للدكاترة فقط)

**الوظيفة**: إحصائيات الدكتور

**الـ Response:**

```json
{
  "totalPatients": 24,
  "appointmentsThisWeek": 8,
  "sessionsCompleted": 156,
  "upcomingAppointments": 5,
  "rating": 4.9,
  "revenue": {
    "thisMonth": 25000,
    "lastMonth": 22000
  }
}
```

---

#### **2. GET /api/doctor/patients** (للدكاترة فقط)

**الوظيفة**: قائمة مرضى الدكتور

**الـ Response:**

```json
{
  "patients": [
    {
      "id": "uuid",
      "firstName": "أحمد",
      "lastName": "محمد",
      "email": "ahmed@example.com",
      "phone": "+201234567890",
      "lastVisit": "2025-12-20",
      "totalSessions": 5,
      "status": "active"
    }
  ]
}
```

---

#### **3. GET /api/doctor/patients/:patientId** (للدكاترة فقط)

**الوظيفة**: تفاصيل مريض معين

**الـ Response:**

```json
{
  "id": "uuid",
  "firstName": "أحمد",
  "lastName": "محمد",
  "email": "ahmed@example.com",
  "phone": "+201234567890",
  "dateOfBirth": "1990-05-15",
  "appointments": [...],
  "sessionHistory": [...],
  "notes": "ملاحظات الدكتور عن المريض"
}
```

---

## ⚙️ متطلبات تقنية عامة

### **1. Security (الأمان)**

```
✅ Password Hashing (bcrypt, rounds >= 12)
✅ JWT Authentication
✅ HTTPS Only في Production
✅ Rate Limiting
✅ Input Validation & Sanitization
✅ SQL Injection Prevention
✅ XSS Protection
✅ CORS Configuration
✅ Helmet.js (Node) أو Security Middleware
```

### **2. Error Handling (معالجة الأخطاء)**

**كل الـ Errors تتبع الصيغة دي:**

```json
{
  "error": {
    "message": "رسالة واضحة بالعربي",
    "code": "ERROR_CODE",
    "field": "email (لو validation error)"
  }
}
```

**Status Codes:**

- `200` - نجح
- `201` - تم الإنشاء
- `400` - بيانات غلط
- `401` - مش مسموح (token غلط)
- `403` - ممنوع (مش عندك صلاحية)
- `404` - مش موجود
- `409` - Conflict (email موجود مثلاً)
- `422` - بيانات غير صالحة
- `429` - Too Many Requests
- `500` - خطأ في السيرفر

### **3. CORS Configuration**

**لازم تسمح للـ Frontend:**

```javascript
// Development
origin: 'http://localhost:5173'

// Production
origin: 'https://neuralhealer.com'

// Headers
Access-Control-Allow-Headers: Content-Type, Authorization, Accept-Language
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### **4. Environment Variables**

**ملف `.env.example`:**

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/neuralhealer
MONGODB_URI=mongodb://localhost:27017/neuralhealer
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# AI Integration
OPENAI_API_KEY=sk-xxx
# أو
GOOGLE_AI_KEY=xxx

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@neuralhealer.com
SMTP_PASS=password

# Other
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

---

## 📧 Email Templates المطلوبة

### **1. Welcome Email**

- عند التسجيل
- رابط تأكيد الإيميل

### **2. Appointment Confirmation**

- للدكتور والمريض
- تفاصيل الموعد
- رابط الاجتماع (لو online)

### **3. Appointment Reminder**

- قبل الموعد بـ 24 ساعة

### **4. Session Summary**

- بعد انتهاء جلسة الشات
- ملخص الجلسة والاقتراحات

---

## 🧪 Testing Requirements

### **Unit Tests**

```
✅ Authentication Functions
✅ Database Models
✅ Utility Functions
✅ AI Integration Logic
```

### **Integration Tests**

```
✅ Auth Flow (Register → Login → Get User)
✅ Booking Flow (List Doctors → Book → Confirm)
✅ Chat Flow (Start → Message → End)
```

### **API Documentation**

```
✅ Swagger UI
✅ أو Postman Collection
✅ Examples لكل Endpoint
```

---

## 📅 Timeline المقترح

### **الأسبوع الأول:**

- ✅ Setup Project Structure
- ✅ Database Schema
- ✅ Authentication Module (كله)
- ✅ Middleware (Auth, Validation, Error)
- 📤 **Deliverable**: Auth endpoints جاهزة

### **الأسبوع الثاني:**

- ✅ Doctors Module
- ✅ Reviews System
- ✅ Availability Management
- 📤 **Deliverable**: Doctors endpoints جاهزة

### **الأسبوع الثالث:**

- ✅ AI Integration Setup
- ✅ Chat Module
- ✅ Emotion Detection
- ✅ Session Management
- 📤 **Deliverable**: Chat endpoints جاهزة

### **الأسبوع الرابع:**

- ✅ Booking Module
- ✅ Email Notifications
- ✅ Meeting Link Generation
- 📤 **Deliverable**: Booking endpoints جاهزة

### **الأسبوع الخامس:**

- ✅ Doctor Dashboard
- ✅ Patient Management
- ✅ Statistics & Analytics
- 📤 **Deliverable**: Dashboard endpoints جاهزة

### **الأسبوع السادس:**

- ✅ Testing
- ✅ Bug Fixes
- ✅ Performance Optimization
- ✅ Documentation
- 📤 **Deliverable**: Backend كامل جاهز

---

## 📞 التواصل والتنسيق

### **Daily Standup (يومياً)**

- إيه اللي اتعمل إمبارح؟
- إيه اللي هيتعمل النهاردة؟
- في مشاكل أو blockers؟

### **Weekly Review (أسبوعياً)**

- مراجعة الـ Progress
- Testing الـ Endpoints الجديدة
- تحديث الـ Timeline

### **Communication Channels**

- WhatsApp/Telegram للتواصل السريع
- GitHub Issues للـ Bugs
- Google Docs للتوثيق المشترك

---

## 🎯 Success Criteria

### **الـ Backend يبقى جاهز لما:**

- ✅ كل الـ Endpoints شغالة 100%
- ✅ Response Time < 2 ثانية
- ✅ Error Handling صحيح
- ✅ Documentation كاملة
- ✅ Tests Coverage > 70%
- ✅ Security Best Practices متطبقة
- ✅ Frontend بيشتغل معاه بدون مشاكل

---

## 📚 Resources مفيدة

### **Node.js + Express**

- https://expressjs.com/
- https://www.passportjs.org/ (Authentication)
- https://sequelize.org/ (ORM)

### **Python + FastAPI**

- https://fastapi.tiangolo.com/
- https://www.sqlalchemy.org/ (ORM)

### **AI Integration**

- OpenAI: https://platform.openai.com/docs
- Google AI: https://ai.google.dev/

### **Database**

- PostgreSQL: https://www.postgresql.org/docs/
- MongoDB: https://www.mongodb.com/docs/

### **Security**

- OWASP Top 10: https://owasp.org/www-project-top-ten/

---

## 🆘 أول ما تبدأ

### **خطوة 1: شوف الملفات دي:**

1. `API_CONTRACT.md` - مهم جداً! ⭐
2. `BACKEND_INTEGRATION_CHECKLIST.md` - الخطوات بالتفصيل

### **خطوة 2: اختار Technology Stack**

```
✅ Framework: Express/FastAPI/Django
✅ Database: PostgreSQL + (MongoDB optional)
✅ AI Service: OpenAI/Google Gemini
✅ Email: SendGrid/Nodemailer
✅ Hosting: AWS/Heroku/DigitalOcean
```

### **خطوة 3: Setup المشروع**

```bash
# إنشاء Backend folder
mkdir backend
cd backend

# Initialize project
npm init -y  # لو Node.js
# أو
pip install fastapi uvicorn  # لو Python

# Install Dependencies
# شوف الـ Dependencies المطلوبة تحت
```

### **خطوة 4: اتواصل معايا**

- شاركني الـ GitHub Repo
- اتفقنا على الـ Timeline
- ابدأ بـ Authentication Module الأول

---

## 📦 Dependencies المقترحة

### **Node.js + Express:**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "pg": "^8.11.0",
    "pg-hstore": "^2.3.4",
    "sequelize": "^6.35.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.5",
    "nodemailer": "^6.9.7",
    "openai": "^4.20.1",
    "redis": "^4.6.11",
    "socket.io": "^4.6.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

### **Python + FastAPI:**

```txt
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
openai==1.3.7
redis==5.0.1
python-dotenv==1.0.0
```

---

## ✅ Checklist لأول يوم

- [ ] قريت الـ API_CONTRACT.md كله
- [ ] فهمت الـ Project Requirements
- [ ] اخترت الـ Technology Stack
- [ ] عملت الـ GitHub Repo Structure
- [ ] Setup الـ Development Environment
- [ ] عملت Database Schema Design
- [ ] بديت في Authentication Module
- [ ] اتفقنا على الـ Daily Communication

---

**🎯 الهدف:** Backend كامل جاهز في 6 أسابيع!

**📞 للتواصل:** اتصل بيا أول ما تبدأ نتفق على التفاصيل

**🚀 يلا نبدأ!**

---

**آخر تحديث**: 23 ديسمبر 2025
