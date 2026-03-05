# ── Stage 1: build ──────────────────────────────────────────────────────────
FROM golang:1.22-alpine AS builder

WORKDIR /src

# Cache dependencies before copying source.
COPY go.mod go.sum ./
RUN go mod download

# Copy source and build a statically linked binary.
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /gateway ./cmd/gateway

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM alpine:3.19

# wget is used by the HEALTHCHECK and docker-compose healthcheck.
RUN apk add --no-cache wget

# Non-root user for container security.
RUN adduser -D -u 1001 gateway
USER gateway

COPY --from=builder /gateway /gateway

EXPOSE 8443

# Probe the actuator health endpoint that the gateway forwards to Spring Boot.
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8443/api/actuator/health || exit 1

ENTRYPOINT ["/gateway"]

