# ⚙️ Backend API Server

Node.js/Express backend for NeuralHealer platform.

---

## 🚀 Quick Start

### Installation

```bash
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Configure your `.env`:
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/neuralhealer

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# AI Service
AI_SERVICE_URL=http://localhost:8000

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@neuralhealer.com
SMTP_PASS=your-password

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Database Setup

```bash
# Create database
createdb neuralhealer

# Run migrations
npm run migrate

# Seed data (optional)
npm run seed
```

### Development

```bash
npm run dev
```

API runs on: http://localhost:5000

---

## 📁 Project Structure

```
src/
├── routes/              # API routes
│   ├── auth.routes.js
│   ├── chat.routes.js
│   ├── doctor.routes.js
│   └── booking.routes.js
├── controllers/         # Business logic
│   ├── auth.controller.js
│   ├── chat.controller.js
│   └── ...
├── models/              # Database models
│   ├── User.js
│   ├── Doctor.js
│   ├── Appointment.js
│   └── ChatSession.js
├── middleware/          # Middleware
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   └── error.middleware.js
├── services/            # External services
│   ├── ai.service.js       # Call AI microservice
│   ├── email.service.js
│   └── storage.service.js
├── config/              # Configuration
│   ├── database.js
│   └── jwt.js
└── utils/               # Utilities
    ├── logger.js
    └── validator.js
```

---

## 🔧 Tech Stack

- **Node.js** 18+
- **Express.js** - Web framework
- **PostgreSQL** - Primary database
- **Sequelize** - ORM
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Nodemailer** - Email service
- **Redis** - Caching (optional)

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout

### Chat/Therapy
- `POST /api/chat/start` - Start session
- `POST /api/chat/message` - Send message
- `POST /api/chat/end/:id` - End session
- `GET /api/chat/sessions` - Get sessions

### Doctors
- `GET /api/doctors` - List doctors
- `GET /api/doctors/:id` - Get doctor details
- `GET /api/doctors/:id/slots` - Get available slots

### Booking
- `POST /api/booking/create` - Create appointment
- `GET /api/booking/user` - Get user appointments
- `DELETE /api/booking/:id` - Cancel appointment

**See**: [Full API Documentation](../docs/api/API_CONTRACT.md)

---

## 🧪 Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage
npm run test:coverage
```

---

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t neuralhealer-backend .
docker run -p 5000:5000 neuralhealer-backend
```

### Deployment Platforms

- **Heroku**: `git push heroku main`
- **AWS EC2**: See [deployment guide](../docs/deployment/DEPLOYMENT_GUIDE.md)
- **Railway**: Connect GitHub repo

---

## 🤖 AI Integration

Backend communicates with AI microservice:

```javascript
// Example: Get AI response
const response = await aiService.generateResponse({
  message: userMessage,
  context: previousMessages,
  emotion: detectedEmotion
});
```

AI service runs on: `http://localhost:8000`

---

## 📝 Scripts

- `npm run dev` - Development server
- `npm start` - Production server
- `npm test` - Run tests
- `npm run migrate` - Run migrations
- `npm run seed` - Seed database
- `npm run lint` - Run linter

---

## 🔗 Related

- [API Contract](../docs/api/API_CONTRACT.md)
- [Setup Guide (Arabic)](../docs/setup/BACKEND_PLAN_ARABIC.md)
- [AI Service](../ai/README.md)
- [Database Schema](../docs/architecture/DATABASE_SCHEMA.md)

---

## 📞 Support

For backend issues, contact the backend team or open an issue on GitHub.
