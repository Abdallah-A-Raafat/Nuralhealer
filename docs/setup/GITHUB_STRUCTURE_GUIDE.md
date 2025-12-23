# 🗂️ دليل تنظيم الـ GitHub Repository

## 📁 الهيكل المقترح (Monorepo)

```
NuralHealer/                           # الـ Repo الرئيسي
│
├── README.md                          # نبذة عن المشروع (عربي وإنجليزي)
├── .gitignore                         # ملفات لا تُرفع على Git
├── LICENSE                            # الترخيص
│
├── frontend/                          # شغل الـ Frontend (شغلك الحالي)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.development
│   ├── .env.production
│   └── README.md                      # تعليمات setup الـ Frontend
│
├── backend/                           # شغل الـ Backend Developer
│   ├── src/
│   │   ├── routes/                    # API Endpoints
│   │   ├── controllers/               # Business Logic
│   │   ├── models/                    # Database Models
│   │   ├── middleware/                # Auth, Validation, etc.
│   │   ├── services/                  # External Services (AI, Email)
│   │   ├── config/                    # Configuration
│   │   └── utils/                     # Helper Functions
│   ├── tests/                         # Unit & Integration Tests
│   ├── .env.example                   # Environment Variables Template
│   ├── package.json                   # أو requirements.txt للـ Python
│   └── README.md                      # تعليمات setup الـ Backend
│
├── docs/                              # الدوكيومنتيشن المشتركة
│   ├── API_CONTRACT.md                # ⭐ مهم جداً
│   ├── BACKEND_PLAN_ARABIC.md         # الخطة للـ Backend
│   ├── BACKEND_INTEGRATION_CHECKLIST.md
│   ├── DATABASE_SCHEMA.md             # تصميم قاعدة البيانات
│   ├── DEPLOYMENT_GUIDE.md            # دليل النشر
│   └── CONTRIBUTING.md                # قواعد المساهمة
│
├── .github/                           # GitHub Workflows
│   ├── workflows/
│   │   ├── frontend-ci.yml            # CI/CD للـ Frontend
│   │   └── backend-ci.yml             # CI/CD للـ Backend
│   └── ISSUE_TEMPLATE/                # Templates للـ Issues
│
└── assets/                            # صور ومرفقات للتوثيق
    ├── screenshots/
    ├── diagrams/
    └── logo/
```

---

## 🚀 خطوات إعداد الـ Repository

### **الخطوة 1: إنشاء الـ Repo الرئيسي**

```bash
# روح على المكان اللي عايز تعمل فيه الـ Repo
cd ~/study/graduation\ project/NuralHealer

# إنشاء فولدر جديد
mkdir NuralHealer-Repo
cd NuralHealer-Repo

# Initialize Git
git init

# إنشاء الهيكل الأساسي
mkdir -p frontend backend docs .github/workflows assets
```

---

### **الخطوة 2: نقل شغل الـ Frontend**

```bash
# انسخ كل ملفات الـ Frontend الحالية
cp -r ../Nural-Healer-intial-/* frontend/

# لكن استبعد الملفات اللي مش محتاجينها
cd frontend
rm -rf node_modules .git

# إنشاء .gitignore للـ Frontend
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Misc
*.log
.cache
EOF

cd ..
```

---

### **الخطوة 3: إعداد مجلد الـ Backend**

```bash
cd backend

# إنشاء README للـ Backend
cat > README.md << 'EOF'
# NeuralHealer Backend

## 📋 المتطلبات

- Node.js >= 18 (لو Node.js) أو Python >= 3.10 (لو Python)
- PostgreSQL >= 14
- Redis (اختياري للـ Caching)

## 🚀 التثبيت والتشغيل

### 1. Install Dependencies

\`\`\`bash
# Node.js
npm install

# Python
pip install -r requirements.txt
\`\`\`

### 2. Environment Setup

\`\`\`bash
cp .env.example .env
# عدّل الـ .env بالبيانات الصحيحة
\`\`\`

### 3. Database Setup

\`\`\`bash
# إنشاء Database
createdb neuralhealer

# Run Migrations
npm run migrate  # أو python manage.py migrate
\`\`\`

### 4. Start Server

\`\`\`bash
# Development
npm run dev

# Production
npm start
\`\`\`

Server يشتغل على: http://localhost:5000

## 📚 API Documentation

Swagger UI: http://localhost:5000/api-docs

## 🧪 Testing

\`\`\`bash
npm test
\`\`\`

## 📁 Project Structure

\`\`\`
src/
├── routes/          # API Endpoints
├── controllers/     # Business Logic
├── models/          # Database Models
├── middleware/      # Auth, Validation
├── services/        # External Services
├── config/          # Configuration
└── utils/           # Helpers
\`\`\`

## 📞 التواصل

للأسئلة والدعم، تواصل مع فريق الـ Frontend
EOF

# إنشاء .env.example
cat > .env.example << 'EOF'
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/neuralhealer

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# AI Integration
OPENAI_API_KEY=sk-xxx

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@neuralhealer.com
SMTP_PASS=your-password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
EOF

# إنشاء .gitignore للـ Backend
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
venv/
__pycache__/
*.pyc

# Environment
.env
.env.local

# Logs
*.log
logs/

# Database
*.db
*.sqlite

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Testing
coverage/
.pytest_cache/
EOF

cd ..
```

---

### **الخطوة 4: نقل الدوكيومنتيشن**

```bash
# انقل الملفات المهمة للـ docs folder
mv frontend/API_CONTRACT.md docs/
mv frontend/BACKEND_PLAN_ARABIC.md docs/
mv frontend/BACKEND_INTEGRATION_CHECKLIST.md docs/
mv frontend/INTEGRATION_QUICK_START.md docs/
mv frontend/SETUP_COMPLETE.md docs/
```

---

### **الخطوة 5: إنشاء README رئيسي**

```bash
cat > README.md << 'EOF'
# 🧠 NeuralHealer - منصة العلاج النفسي بالذكاء الاصطناعي

<div dir="rtl">

## 📱 نبذة عن المشروع

**NeuralHealer** هو تطبيق ويب متكامل للصحة النفسية، يوفر:

- 💬 **جلسات علاج نفسي مع AI** - محادثات ذكية بالنص والصوت
- 👨‍⚕️ **حجز مواعيد مع دكاترة** - نظام حجز كامل
- 📊 **تتبع التطور** - تاريخ الجلسات والإحصائيات
- 🌍 **دعم متعدد اللغات** - عربي وإنجليزي
- 🏥 **لوحة تحكم للدكاترة** - إدارة المرضى والمواعيد

---

## 🏗️ البنية التقنية

### Frontend
- ⚛️ React 19
- 🎨 Tailwind CSS
- 🔄 React Router
- 📝 React Hook Form
- 🗄️ Zustand (State Management)

### Backend
- 🟢 Node.js + Express / 🐍 Python + FastAPI
- 🗄️ PostgreSQL + MongoDB
- 🤖 OpenAI GPT-4 / Google Gemini
- 🔐 JWT Authentication
- 📧 Email Service

---

## 📁 هيكل المشروع

\`\`\`
NuralHealer/
├── frontend/          # React Application
├── backend/           # API Server
├── docs/              # Documentation
└── .github/           # CI/CD Workflows
\`\`\`

---

## 🚀 التثبيت والتشغيل

### 1️⃣ Frontend Setup

\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

Frontend يشتغل على: http://localhost:5173

### 2️⃣ Backend Setup

\`\`\`bash
cd backend
npm install  # أو pip install -r requirements.txt
cp .env.example .env
# عدّل .env بالبيانات الصحيحة
npm run dev
\`\`\`

Backend يشتغل على: http://localhost:5000

**للتفاصيل الكاملة:** شوف `frontend/README.md` و `backend/README.md`

---

## 📚 الدوكيومنتيشن

| الملف | الوصف |
|------|-------|
| [API_CONTRACT.md](docs/API_CONTRACT.md) | مواصفات الـ API بالتفصيل |
| [BACKEND_PLAN_ARABIC.md](docs/BACKEND_PLAN_ARABIC.md) | خطة تطوير الـ Backend بالعربي |
| [BACKEND_INTEGRATION_CHECKLIST.md](docs/BACKEND_INTEGRATION_CHECKLIST.md) | خطوات الربط بين Frontend و Backend |
| [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) | دليل النشر على Production |

---

## 👥 الفريق

- **Frontend Developer**: [اسمك]
- **Backend Developer**: [اسم الـ Backend Dev]
- **AI Integration**: [...]

---

## 🧪 Testing

### Frontend
\`\`\`bash
cd frontend
npm test
\`\`\`

### Backend
\`\`\`bash
cd backend
npm test
\`\`\`

---

## 🤝 المساهمة

1. Fork الـ Repository
2. إنشاء Branch جديد (\`git checkout -b feature/amazing-feature\`)
3. Commit التغييرات (\`git commit -m 'Add amazing feature'\`)
4. Push للـ Branch (\`git push origin feature/amazing-feature\`)
5. فتح Pull Request

**للتفاصيل:** شوف [CONTRIBUTING.md](docs/CONTRIBUTING.md)

---

## 📝 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

---

## 📞 التواصل

- **Email**: contact@neuralhealer.com
- **GitHub**: [github.com/your-username/neuralhealer](https://github.com)

---

## ⭐ إذا أعجبك المشروع

اضغط على ⭐ Star لدعم المشروع!

</div>

---

## 🌟 Features

- 🤖 AI-Powered Therapy Sessions
- 👨‍⚕️ Doctor Appointment Booking
- 📊 Session History & Analytics
- 🌍 Multi-language Support (Arabic & English)
- 🔐 Secure Authentication
- 💬 Real-time Chat
- 📧 Email Notifications
- 📱 Responsive Design

---

## 🚀 Quick Start

\`\`\`bash
# Clone the repository
git clone https://github.com/your-username/neuralhealer.git

# Install Frontend
cd neuralhealer/frontend
npm install
npm run dev

# Install Backend (in new terminal)
cd ../backend
npm install
cp .env.example .env
npm run dev
\`\`\`

---

**Made with ❤️ by NeuralHealer Team**
EOF
```

---

### **الخطوة 6: إنشاء .gitignore رئيسي**

```bash
cat > .gitignore << 'EOF'
# OS
.DS_Store
Thumbs.db
*~

# IDE
.vscode/
.idea/
*.swp
*.swo

# Logs
*.log

# Environment
.env
.env.local
.env.*.local

# Misc
.cache/
EOF
```

---

### **الخطوة 7: Initialize Git & First Commit**

```bash
# Add all files
git add .

# First commit
git commit -m "🎉 Initial commit: Project structure setup

- Frontend: React app with all components
- Backend: Folder structure prepared
- Docs: API contract and integration guides
- Setup: README and configuration files"

# إنشاء Repo على GitHub
# روح على github.com وإنشاء Repo جديد اسمه "NeuralHealer"

# ربط الـ Local بـ GitHub
git remote add origin https://github.com/your-username/NeuralHealer.git
git branch -M main
git push -u origin main
```

---

## 📋 التعليمات للـ Backend Developer

بعد ما تخلص Setup الـ Repo، ابعت للـ Backend Developer:

### **رسالة للـ Backend Dev:**

```
السلام عليكم! 👋

تم إعداد الـ GitHub Repository للمشروع:
🔗 https://github.com/your-username/NeuralHealer

📁 البنية:
- frontend/ → شغل الـ Frontend (جاهز)
- backend/ → شغلك (فاضي ومستني شغلك)
- docs/ → الدوكيومنتيشن

📚 الملفات المهمة ليك:
1. docs/API_CONTRACT.md ⭐ (الأهم!)
2. docs/BACKEND_PLAN_ARABIC.md (الخطة الكاملة)
3. backend/README.md (تعليمات البداية)
4. backend/.env.example (Environment Variables)

🚀 الخطوات:
1. Clone الـ Repo
2. cd backend
3. اقرا الملفات في docs/
4. ابدأ بـ Authentication Module
5. Push كل ما تخلص جزء

📞 للتواصل:
واتساب/تليجرام: [رقمك]
GitHub: افتح Issues لأي استفسار

يلا نبدأ! 💪
```

---

## ✅ Checklist للـ Repository Setup

- [ ] إنشاء المجلدات الأساسية (frontend, backend, docs)
- [ ] نقل ملفات الـ Frontend
- [ ] إعداد README.md الرئيسي
- [ ] إعداد .gitignore
- [ ] نقل الدوكيومنتيشن لـ docs/
- [ ] إنشاء backend/README.md
- [ ] إنشاء backend/.env.example
- [ ] Git init + first commit
- [ ] إنشاء Repo على GitHub
- [ ] Push للـ Repository
- [ ] إضافة الـ Backend Developer كـ Collaborator
- [ ] إرسال التعليمات للـ Backend Dev

---

## 🎯 مميزات الهيكل ده

### ✅ **Monorepo Benefits:**

1. **كل حاجة في مكان واحد** - سهولة الإدارة
2. **Documentation مشتركة** - docs/ واحدة للكل
3. **Version Control موحد** - تتبع التغييرات سهل
4. **CI/CD مركزي** - Workflows مشتركة
5. **سهولة الـ Collaboration** - الفريق كله يشتغل في نفس الـ Repo

### ✅ **واضح ومنظم:**

- Frontend واضح ومفصول
- Backend له مكانه الخاص
- Docs مشتركة وسهلة الوصول

### ✅ **Professional:**

- README شامل ومفصل
- .gitignore صحيح
- Environment examples موجودة

---

## 🆘 إذا واجهت مشكلة

### **المشكلة: الـ Repository كبير جداً**

**الحل:**

```bash
# تأكد إن node_modules مش مرفوعة
git rm -r --cached frontend/node_modules
git rm -r --cached backend/node_modules
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "Fix: Remove node_modules from tracking"
```

### **المشكلة: ملفات .env اترفعت بالغلط**

**الحل:**

```bash
git rm --cached frontend/.env
git rm --cached backend/.env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Security: Remove .env files"
git push --force
# غيّر كل الـ Secrets بعدها!
```

---

## 📞 الخلاصة

### **استخدم Monorepo Structure:**

```
✅ NeuralHealer/
   ├── frontend/
   ├── backend/
   └── docs/
```

### **مش:**

```
❌ NeuralHealer-Frontend/  (repo منفصل)
❌ NeuralHealer-Backend/   (repo منفصل)
```

**ليه؟**

- أسهل في الإدارة
- Documentation مشتركة
- Version control أفضل
- Deployment أسهل

---

**آخر تحديث:** 23 ديسمبر 2025
