# NeuralHealer Backend — Quick Start (Windows)

## Status Check ✅

- **Go:** Installed (go1.25.0) ✅
- **Java:** Should be installed (Java 21+) ✓
- **Maven:** Should be installed (mvnw is available) ✓
- **Docker:** NOT running (need to start Docker Desktop) ❌
- **Go code:** Compiles cleanly ✅

---

## The Simplest Way to Start (Copy-Paste Commands)

### **Important: Start Docker Desktop First**

1. Click **Windows Start** button
2. Type **Docker Desktop** and click it
3. Wait **60 seconds** for it to fully start
4. You'll see Docker icon in system tray (bottom right)

**Verify Docker started:**
```powershell
docker ps
```

---

## Scenario A: Test on Port 8080 (What You Were Doing)

This is the **fastest way** to test your API locally without Docker containers.

**Terminal 1: Start Postgres in Docker**
```powershell
docker run --name neuralhealer-db -e POSTGRES_PASSWORD=aaa -e POSTGRES_USER=postgres -p 5432:5432 -d postgres:15-alpine
```

**Terminal 2: Start Spring Boot**
```powershell
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend
.\mvnw -Dspring-boot.run.profiles=dev spring-boot:run
```

Wait for the message:
```
Started NeuralHealerApplication in X seconds
```

**Terminal 3: Test Your API**
```powershell
curl http://localhost:8080/api/actuator/health
# Should respond with: {"status":"UP"}
```

---

## Scenario B: Test Via Gateway (Port 8443)

You have Spring Boot running from Scenario A. Now also test the gateway.

**Terminal 3: Start the Go Gateway**
```powershell
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend
.\gateway\run-dev.ps1
```

**Terminal 4: Test Via Gateway**
```powershell
curl http://localhost:8443/api/actuator/health
# Should respond with: {"status":"UP"}
```

---

## Scenario C: Full Docker Stack

Run **everything in Docker containers** (Postgres + Spring Boot + Gateway).

**One-time setup (first time only):**
```powershell
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend

# Generate the gateway secret
$bytes = New-Object Byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$secret = -join ($bytes | ForEach-Object { $_.ToString('x2') })

# Add to .env
Add-Content .env "GATEWAY_SECRET=$secret"

Write-Host "✅ GATEWAY_SECRET=$secret added to .env"
```

**Every time you want to run (after first setup):**
```powershell
cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend

# Start all three services
docker-compose up --build -d

# Watch logs
docker-compose logs -f
```

**Test the API:**
```powershell
curl http://localhost:8443/api/actuator/health
# Should respond with: {"status":"UP"}
```

**Stop everything:**
```powershell
docker-compose down
```

---

## Which One Should You Use?

```
Do you want the fastest local testing experience?
  → Use Scenario A (Spring Boot on :8080)

Do you want to test the gateway too (the full flow)?
  → Use Scenario A + B (Spring Boot on :8080, Gateway on :8443)

Do you want production-like Docker testing?
  → Use Scenario C (Everything in Docker)
```

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `docker: error during connect` | Start Docker Desktop (Windows Start → Docker Desktop) |
| Spring Boot won't connect to Postgres | Wait 10 seconds after starting Postgres, then start Spring Boot |
| Gateway 502 Bad Gateway | Make sure Spring Boot is running on :8080 (`curl http://localhost:8080/api/actuator/health`) |
| `mvnw: command not found` | Make sure you're in the `backend` folder: `cd F:\documents\Nuralhealer-main\Nuralhealer\backend\backend` |
| Port 8080/8443 already in use | Kill the process using that port or use a different port |

---

## Check Everything is Running

```powershell
# Check Docker
docker ps

# You should see something like:
# CONTAINER ID   IMAGE                 STATUS
# abc123...      postgres:15-alpine    Up 2 minutes
# def456...      neuralhealer-app      Up 1 minute
# ghi789...      gateway:latest        Up 30 seconds
```

---

## File Locations Reference

| What | Location |
|---|---|
| Spring Boot app | `F:\documents\Nuralhealer-main\Nuralhealer\backend\backend\src\main\java\...` |
| Go gateway | `F:\documents\Nuralhealer-main\Nuralhealer\backend\backend\gateway\cmd\gateway\main.go` |
| Docker config | `F:\documents\Nuralhealer-main\Nuralhealer\backend\backend\docker-compose.yml` |
| Environment vars | `F:\documents\Nuralhealer-main\Nuralhealer\backend\backend\.env` |
| Full architecture guide | `F:\documents\Nuralhealer-main\Nuralhealer\backend\backend\microservices.md` |
| This file | `F:\documents\Nuralhealer-main\Nuralhealer\backend\backend\QUICK_START.md` |

---

## That's It!

Pick one scenario above, copy the commands, paste them into PowerShell, and press Enter.

Your API will be running in 30-60 seconds.

**Questions?** Read `microservices.md` or `WINDOWS_STARTUP_GUIDE.md` in the project root.

