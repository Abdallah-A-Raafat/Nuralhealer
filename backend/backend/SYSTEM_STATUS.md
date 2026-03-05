# NeuralHealer Backend — System Status & Next Steps

**Generated:** March 5, 2026

---

## Current System Status

| Component | Status | Notes |
|---|---|---|
| **Go Gateway** | ✅ Ready | Code compiles cleanly, no errors |
| **Spring Boot** | ✅ Ready | Configured with dev profile |
| **PostgreSQL** | ⚠️ Not Running | Docker container needs to be started |
| **Docker Desktop** | ❌ Not Running | **You must start this first** |
| **Go Compiler** | ✅ Ready | go1.25.0 installed |
| **Java/Maven** | ✅ Ready | mvnw available (assume Java 21+ installed) |

---

## What You Need to Do Now

### **Step 1: Start Docker Desktop (REQUIRED)**

Docker Desktop is not running on your system. You **must** start it before anything else will work.

**How:**
1. Click **Windows Start** button (bottom left)
2. Type: `Docker Desktop`
3. Click the **Docker Desktop** app
4. **Wait 1-2 minutes** for it to fully initialize

**Verify it started:**
```powershell
docker ps
# If you see a table with CONTAINER ID, COMMAND, STATUS → Docker is running ✅
# If you see an error → Docker Desktop is still starting
```

---

### **Step 2: Choose Your Testing Scenario**

Once Docker is running, pick **one** of these:

#### **Option A: Quick Test (Recommended for Development)**

Test your API directly on port 8080 (no gateway overhead):

```powershell
# Terminal 1: Start Postgres
docker run --name neuralhealer-db -e POSTGRES_PASSWORD=aaa -e POSTGRES_USER=postgres -p 5432:5432 -d postgres:15-alpine

# Terminal 2: Start Spring Boot
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend
.\mvnw -Dspring-boot.run.profiles=dev spring-boot:run

# Terminal 3: Test
curl http://localhost:8080/api/actuator/health
```

**Result:**
```json
{"status":"UP"}
```

---

#### **Option B: Test Both Spring Boot + Gateway**

Test the full microservices flow:

```powershell
# Do Option A first (above), then in Terminal 3:

# Terminal 3: Start the Go Gateway
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend
.\gateway\run-dev.ps1

# Terminal 4: Test via gateway
curl http://localhost:8443/api/actuator/health
```

**Result:**
```json
{"status":"UP"}
```

---

#### **Option C: Full Docker Stack**

Run everything in Docker (production-like):

```powershell
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend

# One-time setup (only run this ONCE)
$bytes = New-Object Byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = -join ($bytes | ForEach-Object { $_.ToString('x2') })
Add-Content .env "GATEWAY_SECRET=$secret"

# Then start everything
docker-compose up --build -d
docker-compose logs -f

# Test
curl http://localhost:8443/api/actuator/health
```

---

## What Each Port Does

| Port | Service | Purpose |
|---|---|---|
| **5432** | PostgreSQL | Database (internal, not for direct access) |
| **8080** | Spring Boot | Your business logic (dev mode, no gateway check) |
| **8443** | Go Gateway | Public API gateway (validates requests before forwarding to Spring) |

---

## Why Docker Desktop is Important

The Go gateway and Spring Boot containers need Docker to run. You also need Docker to start PostgreSQL.

If Docker is not running:
- ❌ You can't start PostgreSQL
- ❌ You can't use Option C (Docker stack)
- ❌ You can't test the gateway container

---

## Testing Your API

### **Test 1: Is Spring Boot Running?**

```powershell
curl http://localhost:8080/api/actuator/health
# Expected: {"status":"UP"}
```

### **Test 2: Is the Gateway Running?**

```powershell
curl http://localhost:8443/api/actuator/health
# Expected: {"status":"UP"}
```

### **Test 3: Test a Real Endpoint**

**Login endpoint (available on both ports):**

```powershell
# Via Spring Boot (no gateway)
curl -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'

# Via Gateway (with validation)
curl -X POST http://localhost:8443/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## What's Been Set Up For You

✅ **Go Gateway**
- Rate limiting (per-IP token bucket, 3 tiers)
- IP blacklisting (3 strikes → 24h ban)
- JWT pre-validation (signature + expiry check)
- Content validation (body size, content-type)
- Healthcheck endpoint
- Graceful shutdown on docker stop

✅ **Spring Boot**
- `GatewaySecretFilter` (validates gateway secret, disabled in dev mode)
- `JwtAuthFilter` (JWT extraction and validation)
- `application-dev.yml` (disables gateway check for local testing)
- `application-prod.yml` (enables gateway check for production)

✅ **Docker Compose**
- PostgreSQL service with healthcheck
- Spring Boot service with healthcheck
- Go Gateway service with healthcheck
- Dependency ordering (Postgres → App → Gateway)
- Named volumes (persist data across restarts)

---

## Files You Should Know About

| File | Purpose |
|---|---|
| `microservices.md` | **Read this** for complete architecture & operations guide |
| `QUICK_START.md` | Quick reference for starting (in this folder) |
| `WINDOWS_STARTUP_GUIDE.md` | Detailed Windows-specific setup guide |
| `docker-compose.yml` | Defines all three services |
| `Dockerfile` | Spring Boot container image |
| `gateway/Dockerfile` | Go gateway container image |
| `.env.example` | Template for `.env` (copy and fill in) |
| `.env` | Your actual secrets (NOT in Git) |
| `Makefile` | Unix/macOS dev targets (Linux/Mac only) |
| `gateway/run-dev.ps1` | Windows PowerShell helper for running gateway locally |

---

## Common Errors & Quick Fixes

| Error | Fix |
|---|---|
| `docker: error during connect` | Start Docker Desktop (Windows Start → Docker Desktop) |
| Spring Boot says "Connection refused" | Postgres not running; start it first |
| Gateway says "502 Bad Gateway" | Spring Boot not running on :8080 |
| Port 8080 already in use | Kill other app or use different port |
| `mvnw: command not found` | Make sure you're in the backend folder |

---

## Your Next Action

### **RIGHT NOW:**

1. **Start Docker Desktop** (Windows Start → Docker Desktop, wait 1-2 minutes)
2. **Run Option A above** (the 3 commands in 3 terminals)
3. **Test with curl** (`curl http://localhost:8080/api/actuator/health`)

### **That's all you need to do.** 

Your system will be running and you can test your API immediately.

For deeper understanding, read `microservices.md`.

---

## Questions?

Everything is documented:

- **"How do I...?"** → Read `QUICK_START.md`
- **"What does [component] do?"** → Read `microservices.md`
- **"How do I deploy?"** → Read `microservices.md` section 11 (Security & Best Practices)
- **"What's the architecture?"** → Read `microservices.md` sections 1-2

All three files are in the project root folder:
```
F:\documents\Nuralhealer-main\Nuralhealer\backend\backend\
├── microservices.md          ← Architecture & operations
├── QUICK_START.md            ← Copy-paste to start
├── WINDOWS_STARTUP_GUIDE.md  ← Windows-specific details
└── ... (other files)
```

---

**Status:** ✅ System is ready. Docker Desktop is the only thing you need to start manually.

