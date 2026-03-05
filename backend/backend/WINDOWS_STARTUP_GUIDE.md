# NeuralHealer Backend — Windows PowerShell Startup Guide

## Prerequisites Check

Run these commands to verify everything is installed:

```powershell
# Check Java
java -version
# Should show: Java 21+

# Check Maven
mvn -version
# Should show: Maven 3.9+

# Check Go
go version
# Should show: Go 1.22+ (already have go1.25.0 ✅)

# Check Docker
docker version
# Should show: Docker Desktop version
# If this fails → Docker Desktop is NOT running
```

---

## Step 0: Start Docker Desktop (Required)

Docker is not running on your system. You need to start it:

**On Windows:**
1. Click **Start** (Windows key)
2. Type **Docker Desktop**
3. Click **Docker Desktop** to launch it
4. Wait 30-60 seconds for it to fully start
5. You'll see the Docker icon in the system tray (bottom right)

**Verify Docker is running:**
```powershell
docker ps
# If it works, you'll see: CONTAINER ID  IMAGE  COMMAND ...
# If it fails, Docker Desktop is still starting
```

---

## Option 1: Local Development (No Docker Containers)

Run Spring Boot and Gateway directly on your machine (what you were doing).

### Step 1: Start PostgreSQL (in Docker)

```powershell
docker run --name neuralhealer-db `
  -e POSTGRES_PASSWORD=aaa `
  -e POSTGRES_USER=postgres `
  -p 5432:5432 `
  -d postgres:15-alpine
```

**Verify Postgres is running:**
```powershell
docker ps | Select-String neuralhealer-db
# Should show the postgres container
```

### Step 2: Start Spring Boot

**Terminal 2 (from project root):**

```powershell
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend
.\mvnw -Dspring-boot.run.profiles=dev spring-boot:run
```

Wait for the log message:
```
o.s.b.a.e.web.EndpointLinksResolver : Mapped "{GET /api/actuator/health...
```

**Spring Boot is now running on:** `http://localhost:8080/api`

### Step 3: (Optional) Start the Go Gateway

**Terminal 3 (from project root):**

```powershell
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend
.\gateway\run-dev.ps1
```

**Gateway is now running on:** `http://localhost:8443/api`

### Step 4: Test Your API

**Via Spring Boot directly (8080):**
```powershell
curl http://localhost:8080/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"pass"}'
```

**Via Gateway (8443, optional):**
```powershell
curl http://localhost:8443/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"pass"}'
```

---

## Option 2: Full Docker Stack (Production-Like)

Run everything in Docker containers.

### Step 1: Generate Gateway Secret (One-Time)

```powershell
$bytes = New-Object Byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = -join ($bytes | ForEach-Object { $_.ToString('x2') })
Write-Host "Generated secret: $secret"

# Add to .env file
Add-Content .env "GATEWAY_SECRET=$secret"
Write-Host "✅ Added GATEWAY_SECRET to .env"
```

**Verify .env has both secrets:**
```powershell
Select-String "JWT_SECRET|GATEWAY_SECRET" .env
```

### Step 2: Start the Full Stack

```powershell
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend

# Start all services (Postgres + Spring Boot + Gateway)
docker-compose up --build -d

# Watch logs
docker-compose logs -f
```

**Wait for these messages in the logs:**
```
neuralhealer-db is healthy
neuralhealer-app is healthy
neuralhealer-gateway is healthy
```

### Step 3: Test Your API

```powershell
# Via the public gateway (port 8443)
curl http://localhost:8443/api/auth/login -Method POST -ContentType "application/json" -Body '{"email":"test@test.com","password":"pass"}'
```

### Step 4: Stop Everything

```powershell
docker-compose down
```

---

## Troubleshooting

### Problem: `docker: error during connect`

**Cause:** Docker Desktop is not running.

**Fix:**
```powershell
# Option 1: Start Docker Desktop manually (GUI)
# Click Start → Docker Desktop

# Option 2: Start Docker from PowerShell (if you have it installed)
& "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# Wait 30-60 seconds for it to start, then try again
docker ps
```

### Problem: `mvnw: The term 'mvnw' is not recognized`

**Cause:** You're not in the right directory.

**Fix:**
```powershell
# Make sure you're in the backend folder
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend

# Then run
.\mvnw spring-boot:run
```

### Problem: Spring Boot won't start / connection timeout

**Cause:** Postgres isn't running.

**Fix:**
```powershell
# Check if postgres container is running
docker ps | Select-String postgres

# If not, start it
docker run --name neuralhealer-db `
  -e POSTGRES_PASSWORD=aaa `
  -e POSTGRES_USER=postgres `
  -p 5432:5432 `
  -d postgres:15-alpine

# Wait 10 seconds, then start Spring Boot again
```

### Problem: Gateway 502 Bad Gateway

**Cause:** Spring Boot on :8080 is not responding.

**Fix:**
```powershell
# Make sure Spring Boot is running
curl http://localhost:8080/api/actuator/health

# If it fails, restart Spring Boot (Terminal 2)
```

---

## Quick Reference: Common Commands

**Check what's running:**
```powershell
docker ps
```

**View logs:**
```powershell
# Docker stack
docker-compose logs -f

# Specific service
docker-compose logs -f neuralhealer-app
docker-compose logs -f gateway
docker-compose logs -f postgres
```

**Stop everything:**
```powershell
# Kill all containers
docker-compose down

# Remove all data too (fresh start)
docker-compose down -v
```

**Clean up:**
```powershell
# Remove old gateway binary
Remove-Item .\gateway\gateway.exe -Force -ErrorAction SilentlyContinue

# Remove Maven build cache
Remove-Item .\target -Recurse -Force -ErrorAction SilentlyContinue
```

---

## Your Recommended Workflow

**For development (what you were doing):**

```powershell
# Terminal 1: Start Postgres
docker run --name neuralhealer-db -p 5432:5432 -e POSTGRES_PASSWORD=aaa -d postgres:15-alpine

# Terminal 2: Start Spring Boot
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend
.\mvnw -Dspring-boot.run.profiles=dev spring-boot:run

# Terminal 3: (Optional) Start Gateway to test full flow
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend
.\gateway\run-dev.ps1

# Terminal 4: Test your API
curl http://localhost:8080/api/...  # Via Spring Boot
curl http://localhost:8443/api/...  # Via Gateway (if running)
```

**For full Docker testing:**

```powershell
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend

# One-time setup
$bytes = New-Object Byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = -join ($bytes | ForEach-Object { $_.ToString('x2') })
Add-Content .env "GATEWAY_SECRET=$secret"

# Every time you want to run
docker-compose up --build -d
docker-compose logs -f

# When done
docker-compose down
```

---

## What's Running Where?

| Service | Port | How to Access | Notes |
|---|---|---|---|
| **Postgres** | 5432 | Internal docker bridge | Persists data in `postgres_data` volume |
| **Spring Boot** | 8080 | http://localhost:8080/api | `application-dev.yml` disables gateway check |
| **Go Gateway** | 8443 | http://localhost:8443/api | Proxies to Spring Boot, validates requests |

---

## Next Steps

1. **Start Docker Desktop** (if not already running)
2. **Choose Option 1 or 2 above** and follow the steps
3. **Test your API** using the curl examples
4. **Read `microservices.md`** in the project root for detailed architecture info

