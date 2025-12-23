#!/bin/bash

# ========================================
# NeuralHealer - Complete Setup Script
# ========================================

set -e  # Exit on error

echo "🚀 NeuralHealer Setup Started..."
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# ========================================
# Check Prerequisites
# ========================================
print_info "Checking prerequisites..."

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node -v)
    print_success "Node.js $NODE_VERSION found"
else
    print_error "Node.js not found. Please install Node.js 20+"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm -v)
    print_success "npm $NPM_VERSION found"
else
    print_error "npm not found"
    exit 1
fi

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    print_success "$PYTHON_VERSION found"
else
    print_warning "Python3 not found. AI service setup will be skipped."
fi

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version)
    print_success "$DOCKER_VERSION found"
else
    print_warning "Docker not found. Docker setup will be skipped."
fi

echo ""

# ========================================
# Setup Web (Frontend)
# ========================================
print_info "Setting up Web (Frontend)..."
cd web

if [ ! -d "node_modules" ]; then
    print_info "Installing web dependencies..."
    npm install
    print_success "Web dependencies installed"
else
    print_success "Web dependencies already installed"
fi

# Create .env if not exists
if [ ! -f ".env" ]; then
    print_info "Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "VITE_API_URL=http://localhost:5000/api" > .env
    print_success ".env file created"
fi

cd ..
echo ""

# ========================================
# Setup Backend
# ========================================
print_info "Setting up Backend..."
cd backend

if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        print_info "Installing backend dependencies..."
        npm install
        print_success "Backend dependencies installed"
    else
        print_success "Backend dependencies already installed"
    fi

    # Create .env if not exists
    if [ ! -f ".env" ]; then
        print_info "Creating backend .env file..."
        cat > .env << EOF
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/neuralhealer
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
AI_SERVICE_URL=http://localhost:8000
EOF
        print_success "Backend .env file created"
    fi
else
    print_warning "Backend package.json not found. Skipping backend setup."
fi

cd ..
echo ""

# ========================================
# Setup AI Service
# ========================================
if command_exists python3; then
    print_info "Setting up AI Service..."
    cd ai

    if [ -f "requirements.txt" ]; then
        # Create virtual environment
        if [ ! -d "venv" ]; then
            print_info "Creating Python virtual environment..."
            python3 -m venv venv
            print_success "Virtual environment created"
        fi

        # Activate virtual environment
        source venv/bin/activate

        print_info "Installing AI dependencies..."
        pip install -r requirements.txt
        print_success "AI dependencies installed"

        # Create .env if not exists
        if [ ! -f ".env" ]; then
            print_info "Creating AI .env file..."
            cat > .env << EOF
OPENAI_API_KEY=your-openai-api-key-here
MODEL_PATH=./models
PYTHONUNBUFFERED=1
EOF
            print_success "AI .env file created"
        fi

        deactivate
    else
        print_warning "AI requirements.txt not found. Skipping AI setup."
    fi

    cd ..
    echo ""
fi

# ========================================
# Setup Mobile (React Native)
# ========================================
print_info "Setting up Mobile (React Native)..."
cd mobile

if [ -f "package.json" ]; then
    if [ ! -d "node_modules" ]; then
        print_info "Installing mobile dependencies..."
        npm install
        print_success "Mobile dependencies installed"
    else
        print_success "Mobile dependencies already installed"
    fi

    # Create .env if not exists
    if [ ! -f ".env" ]; then
        print_info "Creating mobile .env file..."
        echo "API_URL=http://localhost:5000/api" > .env
        print_success "Mobile .env file created"
    fi

    # iOS pods (if on macOS)
    if [[ "$OSTYPE" == "darwin"* ]] && [ -d "ios" ]; then
        if command_exists pod; then
            print_info "Installing iOS pods..."
            cd ios
            pod install
            cd ..
            print_success "iOS pods installed"
        else
            print_warning "CocoaPods not found. iOS pods not installed."
        fi
    fi
else
    print_warning "Mobile package.json not found. Skipping mobile setup."
fi

cd ..
echo ""

# ========================================
# Docker Setup
# ========================================
if command_exists docker; then
    print_info "Setting up Docker environment..."
    
    # Create network
    docker network create neuralhealer-network 2>/dev/null || print_info "Network already exists"
    
    print_success "Docker environment ready"
    print_info "Run 'docker-compose up -d' to start all services"
fi

echo ""

# ========================================
# Summary
# ========================================
echo "=================================="
print_success "Setup Complete! 🎉"
echo "=================================="
echo ""
echo "Next steps:"
echo ""
echo "1️⃣  Start development servers:"
echo "   Web:     cd web && npm run dev"
echo "   Backend: cd backend && npm run dev"
echo "   AI:      cd ai && source venv/bin/activate && uvicorn src.main:app --reload"
echo "   Mobile:  cd mobile && npm start"
echo ""
echo "2️⃣  Or use Docker:"
echo "   docker-compose up"
echo ""
echo "3️⃣  Access the application:"
echo "   Web:     http://localhost:5173"
echo "   Backend: http://localhost:5000"
echo "   AI:      http://localhost:8000"
echo ""
print_warning "Remember to update .env files with actual credentials!"
echo ""
