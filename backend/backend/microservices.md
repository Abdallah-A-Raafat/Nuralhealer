# NeuralHealer — Microservices architecture and run guide

This file documents the full architecture, runtime initialization, and operational logic for the NeuralHealer backend stack (Go gateway, Spring Boot app, PostgreSQL), plus useful developer run instructions and troubleshooting notes.

---

## 1. High-level architecture

Client
  │
  ▼
Go Gateway (public) :8443
  │  ← blacklisted? drop silently
  │  ← rate limit exceeded? 429 + strike
  │  ← payload/content-type/jwt pre-checks
  ▼
Spring Boot (internal, 127.0.0.1:8080) — only reachable from gateway or host loopback
  ▼
PostgreSQL (named volume)

Notes:
- Spring Boot is intentionally bound to `127.0.0.1:8080` in `docker-compose` so it is not publicly reachable; the Go gateway is the only public entrypoint (port 8443).
- The gateway performs cheap, early rejections (blacklist, rate-limit, payload checks, JWT signature+expiry) to minimize load on Spring.

---

## 2. Component responsibilities

- Go Gateway
  - Single public entrypoint (HTTP reverse proxy).
  - Early filters: blacklist (sync.Map), rate-limiter (token bucket, per-IP × route-tier), validation (content-type, body size, JWT signature + expiry), websocket passthrough.
  - Injects `X-Gateway-Secret` header when proxying to Spring Boot.
  - Healthcheck endpoint proxied to Spring `actuator/health`.

- Spring Boot
  - Real business logic, DB access, full authentication/authorization, role checks.
  - `GatewaySecretFilter` verifies `X-Gateway-Secret` header to ensure requests reached via gateway.
  - JWT auth filter (`JwtAuthFilter`) handles populating SecurityContext.

- PostgreSQL
  - Persistent storage. Declared as a service in `docker-compose` with a named volume.

### Gateway early filters — detailed mechanics

#### Rate Limiter (token bucket per IP × tier)

Per-IP request buckets. Tiers based on endpoint type:

| Tier | Endpoints | Requests/sec | Burst | Strike on exceed |
|---|---|---|---|---|
| **auth** | `/api/auth/login`, `/api/auth/register` | 10 | 20 | Yes (→ blacklist) |
| **ai** | `/api/ai/*` | 5 | 5 | Yes (→ blacklist) |
| **default** | all others | 50 | 100 | Yes (→ blacklist) |

When limit exceeded: response is 429 with `Retry-After: 1` header. Also records a strike against the IP in the blacklist.

#### Blacklist (IP ban on repeated abuse)

Strike tracking per IP:
- **Strike window:** 10 minutes
- **Strike limit:** 3 strikes within window → auto-ban
- **Ban duration:** 24 hours
- **Cleanup:** hourly sweep removes expired bans and stale strike windows
- **Storage:** `sync.Map` in-memory (single-node only; scale to Redis if needed)

When blacklisted: connection is silently dropped before body is read — no response sent.

#### Validation checks (run in order, cheapest first)

Gateway pre-validates before forwarding to Spring Boot:

1. **Blacklist check** — IP banned? Drop silently.
2. **Rate limit check** — exceeds token bucket? Return 429 + strike.
3. **Passthrough check** — WebSocket or SSE? Skip all checks, proxy directly.
4. **Body size check** — `Content-Length > 10 MB`? Return 413.
5. **Content-Type check** — POST/PUT/PATCH without `Content-Type`? Return 400.
6. **Empty body check** — POST/PUT/PATCH with `Content-Length == 0`? Return 400.
7. **JWT signature + expiry** — on protected routes, verify signature and expiry (no DB). Spring owns full auth/role checks.

Public routes (skip JWT check):
- `/api/auth/**`
- `/api/quizzes/**`
- `/api/docs/**`, `/api/swagger**`, `/api/v3/api-docs`
- `/api/test/**`, `/api/diagnostic/**`, `/api/live-sessions/**`
- `/api/actuator/health`
- `/api/doctors/verification/questions`
- `/api/error`

---

## 3. File layout (important files)

- `gateway/` — Go gateway source and Dockerfile
  - `cmd/gateway/main.go` — server bootstrap
  - `internal/ratelimit`, `internal/blacklist`, `internal/proxy`, `internal/middleware`
  - `pkg/jwtcheck`, `pkg/iputil`
  - `run-dev.ps1` — convenience for local dev (Windows PowerShell)

- `src/` — Spring Boot app (Java source)
  - `.../security/GatewaySecretFilter.java`
  - `.../config/SecurityConfig.java`

- `docker-compose.yml` — start DB, app, gateway together (healthchecks & ordering)
- `Dockerfile` (root) — Spring Boot image build
- `.env.example` — environment variables template

### Docker network & port isolation

**Why Spring Boot is on `127.0.0.1:8080`:**

Docker compose defines:
```yaml
neuralhealer-app:
  ports:
    - "127.0.0.1:8080:8080"
```

This binding means:
- ✅ Spring Boot is accessible from the **host machine loopback** (`localhost:8080`).
- ✅ Spring Boot is accessible from **other containers on the docker bridge** (as `neuralhealer-app:8080`).
- ❌ Spring Boot is **NOT** accessible from outside the host (not bound to `0.0.0.0`).

This is intentional: only the gateway (on `:8443`) is public. Direct Spring callers are blocked at the network layer, and `GatewaySecretFilter` provides a second layer of protection if someone somehow reaches `:8080`.

**Multi-stage container builds:**

Both `Dockerfile` (Spring Boot) and `gateway/Dockerfile` use multi-stage builds:
1. **Builder stage:** Compiles the app (Maven for Java, Go for gateway) — produces fat JAR or statically linked binary.
2. **Runtime stage:** Only copies the built artifact into a minimal image (JRE or Alpine) — no build tools in production image.

This reduces image size and attack surface.

**Volume management:**

- `postgres_data` — named volume storing PostgreSQL data files.
- `storage_data` — named volume storing user uploads (doctor profile pictures, etc.).

Both persist across container restarts. To wipe state, run `docker-compose down -v` (removes volumes).

---

## 4. Important configuration and env variables

Keep secrets out of Git. Use `.env` locally (do NOT commit). Required variables (examples):

- `JWT_SECRET` — Base64 string used by Spring Boot and gateway for token signature verification. Must be identical on both sides (read by gateway, used by Spring for signing).
- `GATEWAY_SECRET` — random 32-byte hex value shared between gateway and backend; must match both. If empty in Spring Boot, `GatewaySecretFilter` disables itself (for local dev).
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` — Postgres connection (compose sets these for container network).
- `SPRING_PROFILES_ACTIVE` — set to `dev` locally (enables dev-only overrides), `prod` in Docker/production.
- `FRONTEND_URL`, `AI_SERVICE_URL`, etc. — optional service URLs.

**Profile-specific configuration:**

- `application.yml` — common defaults
- `application-dev.yml` — dev overrides: `gateway.secret: ""` (disables filter), `ddl-auto: update` (auto schema), `show-sql: true`
- `application-prod.yml` — prod overrides: stricter validation, connection pooling tuning

Spring Boot activates the right profile based on `SPRING_PROFILES_ACTIVE`:
```bash
# Local dev (no gateway required)
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run

# Docker/production (gateway required)
SPRING_PROFILES_ACTIVE=prod java -jar app.jar
```

---

## 5. Spring Boot Security Filter Chain (Execution Order)

The `SecurityConfig` defines which filters run and in what order. This is critical because filter order determines request processing:

```
1. GatewaySecretFilter  ← added first, runs first
   └─ Verify X-Gateway-Secret header
   └─ If missing or invalid: return 403 Forbidden
   └─ Drop direct callers before they reach JWT layer

2. JwtAuthFilter        ← added second, runs second
   └─ Extract JWT from cookie or Authorization header
   └─ Validate token with Spring's UserDetailsService
   └─ Populate SecurityContext with user roles/authorities
   └─ If invalid: log and continue without auth (public routes handled by .permitAll())

3. Spring's built-in filters (CorsFilter, AuthorizationFilter, etc.)
   └─ CORS headers set/checked
   └─ Role-based access control enforced
   └─ Public vs authenticated routes handled
```

**Critical: Filter registration anchor**

Both filters must anchor to a **built-in Spring Security filter** with a registered order:

```java
.addFilterBefore(gatewaySecretFilter, UsernamePasswordAuthenticationFilter.class)
.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
```

NOT to each other (which would cause: "The Filter class X does not have a registered order").

**Filter responsibilities:**

- **GatewaySecretFilter:** Check `X-Gateway-Secret` header. If empty header expected (dev mode), skip check. Reject direct access in production.
- **JwtAuthFilter:** Extract JWT from request, verify signature+expiry, load user from DB, set SecurityContext.
- **Spring's AuthorizationFilter:** Enforce endpoint permissions (@PreAuthorize, role matchers, etc.).

---

## 6. Docker initialization & run logic (recommended order)

This is the canonical startup sequence. `docker-compose` automates most of this, but the order is described for clarity.

### 5.1 Startup sequence (docker-compose)

1. Ensure `.env` contains `JWT_SECRET` and `GATEWAY_SECRET` (and DB creds if desired).
2. Build images and start the stack with `docker-compose`.

PowerShell (from repo root):

```powershell
# Build & start full stack (Postgres, app, gateway)
docker-compose up --build -d

# Follow logs (optional)
docker-compose logs -f
```

What `docker-compose` does (in order):
1. **Postgres starts first** with a healthcheck (`pg_isready`). No dependent services start yet.
2. **Spring Boot builds** (from `Dockerfile`) and starts. It waits for Postgres to be healthy before continuing initialization.
3. **Gateway builds** (from `gateway/Dockerfile`) and starts. It waits for Spring Boot to be healthy before starting.

This dependency ordering (`depends_on: condition: service_healthy`) ensures the stack initializes safely — no hanging connections or "service unavailable" errors during startup.

Healthchecks
- Postgres: `pg_isready -U postgres` — runs every 10s, must pass 5 times before healthy.
- Spring Boot: `GET http://localhost:8080/api/actuator/health` — runs every 15s (start after 60s), must pass 8 times before healthy.
- Gateway: `GET http://localhost:8443/api/actuator/health` — runs every 10s (start after 5s), must pass 3 times before healthy.

Stopping

```powershell
docker-compose down
```

### 5.2 Gateway runtime details

**Graceful shutdown:**
- The gateway listens for OS signals (`SIGTERM`, `SIGINT`).
- When Docker stops the container, it sends `SIGTERM`.
- Gateway blocks on `<-quit`, logs "gateway shutting down…", calls `srv.Shutdown(ctx)` with 10-second timeout.
- Existing connections finish gracefully; new requests are rejected immediately.

**HTTP timeouts:**
- Read: 15 seconds (time to read full request)
- Write: 60 seconds (generous for AI streaming responses)
- Idle: 120 seconds (long-lived WebSocket connections)

**Environment variable injection:**
All three services receive secrets from `.env` (on local) or from the container orchestrator (in Kubernetes/production):

```yaml
environment:
  JWT_SECRET: ${JWT_SECRET}
  GATEWAY_SECRET: ${GATEWAY_SECRET}
  BACKEND_URL: http://neuralhealer-app:8080  # service name on docker bridge
  DB_URL: jdbc:postgresql://postgres:5432/neuralhealer
```

The `${VARIABLE}` syntax is interpolated by `docker-compose` from the `.env` file at runtime.

---

## 7. Gateway Request Processing Flow (Complete Request Lifecycle)

Every request follows this pipeline through the Go gateway (before reaching Spring Boot):

```
HTTP Request arrives at :8443
  │
  ├─ 1. Extract client IP (X-Forwarded-For → X-Real-Ip → RemoteAddr)
  │
  ├─ 2. Blacklist check
  │     if IP banned { drop silently; return }
  │
  ├─ 3. Rate limit check
  │     limiter := getLimiter(IP, route_tier)
  │     if !limiter.Allow() {
  │       strike IP
  │       return 429 with Retry-After: 1
  │     }
  │
  ├─ 4. Passthrough check
  │     if WebSocket upgrade header OR /api/ws* OR /api/ai-ws* OR /api/notifications/stream {
  │       skip all validation
  │       → Go to 7 (proxy)
  │     }
  │
  ├─ 5. Content validation
  │     if Content-Length > 10MB { return 413 }
  │     if POST/PUT/PATCH && no Content-Type { return 400 }
  │     if POST/PUT/PATCH && Content-Length == 0 { return 400 }
  │
  ├─ 6. JWT pre-check (signature + expiry only)
  │     if route in publicRoutes { skip JWT check; → 7 }
  │     token := extract from cookie OR Authorization header
  │     if !verify(token, secret) { return 401 }
  │
  └─ 7. Proxy to Spring Boot
      inject X-Gateway-Secret header
      inject X-Forwarded-Host header
      set request Host to backend host
      forward to http://neuralhealer-app:8080
      respond with backend response
```

**WebSocket & SSE Passthrough:**

WebSocket and Server-Sent Events are long-lived connections. The gateway detects them and skips expensive validation:

```go
if strings.EqualFold(r.Header.Get("Upgrade"), "websocket") ||
   strings.HasPrefix(path, "/api/ws") ||
   strings.HasPrefix(path, "/api/ai-ws") ||
   strings.HasPrefix(path, "/api/notifications/stream") {
  // Proxy directly; skip body size, content-type, JWT checks
  proxy.ServeHTTP(w, r)
  return
}
```

This allows Spring Boot's WebSocket handlers to perform their own auth and message validation.

---

## 8. Makefile targets (development convenience)

The root `Makefile` defines targets for common operations:

```makefile
make help              # Show all available targets
make run               # Run Spring Boot locally (dev profile)
make test              # Run Spring Boot unit tests
make build             # Build fat JAR (target/app.jar)
make clean             # Delete build artifacts

make gateway-build     # Compile Go gateway binary (gateway/cmd/gateway → binary)
make gateway-run-dev   # Run gateway locally (reads .env, points to localhost:8080)

make stack-up          # docker-compose up --build -d (full stack)
make stack-down        # docker-compose down
make stack-logs        # Follow logs from all services

make secret-gen        # Generate GATEWAY_SECRET and append to .env (one-time setup)
```

Example workflow:

```powershell
# First time: generate secrets
make secret-gen

# Start the full stack
make stack-up

# Watch logs in a separate terminal
make stack-logs

# When done
make stack-down
```

Local dev workflow (no Docker):

```powershell
# Terminal 1: start Postgres in Docker
docker run --name neuralhealer-db -p 5432:5432 -e POSTGRES_PASSWORD=aaa -d postgres:15-alpine

# Terminal 2: start Spring Boot
make run

# Terminal 3: start gateway (reads .env, uses localhost:8080)
make gateway-run-dev
```

---

## 9. Running locally for development (no Docker) — quick steps

Prereqs: Java 21 + Maven, Go 1.22 (optional: Docker if you want containers)

1. Start Postgres (local or docker):

```powershell
# lightweight Postgres with docker for local dev
docker run --name neuralhealer-db -e POSTGRES_PASSWORD=aaa -e POSTGRES_USER=postgres -p 5432:5432 -d postgres:15-alpine
```

2. Populate `.env` (or export env vars).
3. Start Spring Boot in dev profile (application-dev.yml disables gateway secret):

```powershell
# from project root
./mvnw -Dspring-boot.run.profiles=dev spring-boot:run
```

4. Start the Go gateway (PowerShell helper included):

```powershell
# from repo root
.\gateway\run-dev.ps1
# or from gateway folder
.\run-dev.ps1
```

Notes
- If `GATEWAY_SECRET` is empty in `.env`, Spring Boot's `GatewaySecretFilter` is disabled for local dev.
- The gateway expects backend at `http://localhost:8080` when running locally (see `run-dev.ps1`).

---

## 10. Health, Monitoring & Observability

- Logs:
  - Gateway uses Go `slog` — container logs available via `docker-compose logs gateway`.
  - Spring Boot logs via standard logging; actuator `metrics` and `health` useful for probes.
- Healthchecks are built into Dockerfiles and `docker-compose.yml`.
- For production monitoring, add Prometheus metrics endpoints (Spring Micrometer, Go Prometheus client) and a centralized log aggregator.

---

## 11. Security & Best Practices

- Secrets: Do not commit `.env`. Use an environment secret manager (Vault, Docker secrets, Kubernetes secrets) in prod.
- Gateway secret: rotate periodically. To rotate smoothly, deploy new gateway and backend with a brief overlap window (or accept short downtime), or implement a secret versioning check in `GatewaySecretFilter`.
- Rate limiting & blacklist: In-memory implementations are simple and performant but single-node only. If you later scale the gateway horizontally, move strike/limits to a shared store (Redis) or use sticky IP routing.
- TLS: Gateway currently listens on `8443` in the compose file — configure TLS termination in front (load balancer) or add TLS certs to the gateway container for production.

---

## 12. Troubleshooting

- Spring fails early with filter/order error:
  - Ensure `SecurityConfig` registers filters relative to a Spring filter with a registered order (example uses `UsernamePasswordAuthenticationFilter`).

- Gateway replies with 403 when calling backend directly:
  - Verify `GATEWAY_SECRET` in `.env` matches the backend `gateway.secret` property. If backend `gateway.secret` is empty (dev), it will accept direct requests.

- Gateway build issues:
  - Ensure `go` toolchain is installed. On Windows, use `run-dev.ps1` which sets env vars and runs `go run`.

- Database connection errors:
  - Check `DB_URL` and credentials and that Postgres is reachable from the app container or host.

---

## 13. Future extension & scaling notes

- Horizontal scaling: when you add more gateway replicas, replace in-memory maps with a shared store (Redis) for strikes and rate-limits or use a consistent hashing strategy.
- gRPC: design the proxy abstraction so `proxy.New(...)` can support HTTP and gRPC in the future.
- Observability: add tracing (W3C TraceContext) and propagate trace headers from gateway to backend.
- Service discovery: start with static config; when microservice count grows, adopt a lightweight service registry (Consul) or container orchestrator DNS (Kubernetes).

---

## 14. Quick reference commands (copyable)

PowerShell — generate gateway secret & add to .env (one-liner):

```powershell
$bytes = New-Object Byte[] 32; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); $secret = -join ($bytes | ForEach-Object { $_.ToString('x2') }); Add-Content .env "GATEWAY_SECRET=$secret"; Write-Host "Wrote GATEWAY_SECRET to .env"
```

Start full stack (Docker):

```powershell
docker-compose up --build -d
docker-compose logs -f
```

Run locally (dev Spring + gateway):

```powershell
# Run Spring Boot in dev profile
./mvnw -Dspring-boot.run.profiles=dev spring-boot:run
# In a second shell, run the gateway
.\gateway\run-dev.ps1
```

Stop stack:

```powershell
docker-compose down
```

---

## 15. Runtime Issues & Fixes (Critical for Operations)

### Issue 1 — Spring Boot crash: filter registration order

**Root cause:**
Spring Security's `.addFilterBefore(filter, relativeToClass)` requires the anchor class to be a built-in filter with a registered order. Using a custom filter (like `JwtAuthFilter`) as the anchor causes a crash:

```
The Filter class com.neuralhealer.backend.shared.security.JwtAuthFilter does not have a registered order
```

**Fix in `SecurityConfig.java`:**

```java
// BEFORE (crashes)
.addFilterBefore(gatewaySecretFilter, JwtAuthFilter.class)
.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)

// AFTER (correct)
.addFilterBefore(gatewaySecretFilter, UsernamePasswordAuthenticationFilter.class)
.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
```

Both filters now anchor to the built-in `UsernamePasswordAuthenticationFilter`. Spring inserts them in the order they're added, so `GatewaySecretFilter` still runs first.

---

### Issue 2 — Running the Go gateway (dev & prod)

**Option A — Docker (production, recommended):**

```powershell
# 1. One-time: generate GATEWAY_SECRET (add to .env manually on Windows)
$secret = -join ((1..32) | ForEach-Object { "{0:x2}" -f (Get-Random -Max 256) })
# Paste into .env:  GATEWAY_SECRET=<secret>

# 2. Start everything
docker-compose up --build -d

# 3. Watch logs
docker-compose logs -f
```

**Option B — Gateway locally (dev, Spring Boot already running):**

```powershell
# From project root — reads .env automatically
.\gateway\run-dev.ps1
```

- The `run-dev.ps1` script (in `gateway/`) reads `JWT_SECRET` and `GATEWAY_SECRET` from `.env`, points `BACKEND_URL` at `localhost:8080`, and starts the gateway on `:8443`.
- **Note for local dev:** `GATEWAY_SECRET` can be empty in `.env` — `GatewaySecretFilter` detects the empty value and disables itself, so Spring Boot stays directly reachable on `:8080` without the gateway header.

---

If you want, I can also:
- Add a short `README.gateway.md` inside `gateway/` with quick run steps.
- Create a cleanup script to archive `target/`, `gateway/gateway.exe` and other generated files.
- Produce a minimal runbook for rotating `GATEWAY_SECRET` with zero-downtime steps.

Which of those would you like next?






