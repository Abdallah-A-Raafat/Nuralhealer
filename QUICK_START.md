# 🚀 Quick Start Guide

Get NeuralHealer up and running in minutes!

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Python** 3.10+ ([Download](https://www.python.org/)) - for AI service
- **Git** ([Download](https://git-scm.com/))
- **Docker** (optional) ([Download](https://www.docker.com/))

## Option 1: Automated Setup (Recommended)

Run our setup script to install everything automatically:

```bash
# Clone the repository
git clone https://github.com/yourusername/NeuralHealer-Full.git
cd NeuralHealer-Full

# Run setup script
./scripts/setup.sh
```

The script will:
✅ Install all dependencies (web, backend, ai, mobile)
✅ Create necessary .env files
✅ Set up Python virtual environment
✅ Configure Docker (if available)

## Option 2: Manual Setup

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/NeuralHealer-Full.git
cd NeuralHealer-Full
```

### 2. Setup Web (Frontend)

```bash
cd web
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Start dev server
npm run dev
```

Access at: http://localhost:5173

### 3. Setup Backend (API Server)

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neuralhealer
JWT_SECRET=your-secret-key
AI_SERVICE_URL=http://localhost:8000
EOF

# Start dev server
npm run dev
```

Access at: http://localhost:5000

### 4. Setup AI Service

```bash
cd ai

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "OPENAI_API_KEY=your-openai-key" > .env

# Start server
uvicorn src.main:app --reload
```

Access at: http://localhost:8000

### 5. Setup Mobile (React Native)

```bash
cd mobile
npm install

# iOS (macOS only)
cd ios && pod install && cd ..

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Option 3: Docker Setup

The easiest way to run all services together:

```bash
# Start all services
docker-compose up

# Or run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Services will be available at:
- Web: http://localhost:5173
- Backend: http://localhost:5000
- AI: http://localhost:8000
- Database: localhost:5432
- Redis: localhost:6379

## Verify Installation

### Check Web

Open http://localhost:5173 in your browser. You should see the NeuralHealer homepage.

### Check Backend

```bash
curl http://localhost:5000/health
# Should return: {"status":"healthy"}
```

### Check AI Service

```bash
curl http://localhost:8000/health
# Should return: {"status":"healthy","models":{"emotion":"loaded"}}
```

## Test the Application

### 1. Create Test Account

```bash
# Register a patient account
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@neuralhealer.com",
    "password": "Test123456",
    "name": "Test User",
    "role": "patient"
  }'
```

### 2. Login

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@neuralhealer.com",
    "password": "Test123456"
  }'
```

### 3. Test AI Chat

Open the web app, login, and click "Start Chat" to test the AI chatbot.

## Default Mock Credentials

If backend is not ready, the frontend uses mock data. Default credentials:

**Patient:**
- Email: `patient@neuralhealer.com`
- Password: `password123`

**Doctor:**
- Email: `doctor@neuralhealer.com`
- Password: `password123`

## Common Issues & Solutions

### Port Already in Use

```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

### Node Modules Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Python Virtual Environment Issues

```bash
# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Docker Permission Issues (Linux)

```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

## Environment Variables

### Web (.env)

```bash
VITE_API_URL=http://localhost:5000/api
VITE_AI_API_URL=http://localhost:8000
VITE_ENABLE_MOCK_DATA=false
```

### Backend (.env)

```bash
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neuralhealer
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
AI_SERVICE_URL=http://localhost:8000
```

### AI (.env)

```bash
OPENAI_API_KEY=sk-...
MODEL_PATH=./models
PYTHONUNBUFFERED=1
```

### Mobile (.env)

```bash
API_URL=http://localhost:5000/api
AI_API_URL=http://localhost:8000
```

## Next Steps

1. **Read Documentation:**
   - [Web Documentation](web/README.md)
   - [Backend Documentation](backend/README.md)
   - [AI Documentation](ai/README.md)
   - [Mobile Documentation](mobile/README.md)

2. **Explore Features:**
   - AI Chat with emotion detection
   - Book appointments with doctors
   - Voice chat capabilities
   - Profile management

3. **Start Development:**
   - [API Contract](docs/api/API_CONTRACT.md)
   - [Integration Guide](docs/integration/INTEGRATION_GUIDE.md)
   - [Backend Plan (Arabic)](docs/setup/BACKEND_PLAN_ARABIC.md)

4. **Join Development:**
   - Check [Contributing Guide](CONTRIBUTING.md)
   - Review [Code Style Guide](CODE_STYLE.md)
   - See [Development Roadmap](ROADMAP.md)

## Need Help?

- 📧 Email: support@neuralhealer.com
- 💬 Discord: [Join our server](https://discord.gg/neuralhealer)
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/NeuralHealer-Full/issues)
- 📚 Docs: [Full Documentation](docs/)

## Development Commands

### Web
```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run linter
npm run test         # Run tests
```

### Backend
```bash
npm run dev          # Start dev server with hot reload
npm start            # Start production server
npm run test         # Run tests
npm run migrate      # Run database migrations
npm run seed         # Seed database
```

### AI
```bash
uvicorn src.main:app --reload    # Start dev server
python -m pytest                  # Run tests
python scripts/train_model.py    # Train models
```

### Mobile
```bash
npm start            # Start Metro bundler
npm run ios          # Run on iOS simulator
npm run android      # Run on Android emulator
npm run test         # Run tests
npm run build:ios    # Build iOS app
npm run build:android # Build Android app
```

## Production Deployment

See [Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md) for detailed production deployment instructions.

---

**Ready to build something amazing? Let's go! 🚀**
