.PHONY: help run test build clean docker-up docker-down \
        gateway-build gateway-run gateway-run-dev \
        stack-up stack-down stack-logs secret-gen

help:
	@echo "──────────────────────────────────────────────────────"
	@echo " NeuralHealer — available make targets"
	@echo "──────────────────────────────────────────────────────"
	@echo "  make run              Run Spring Boot (local, no gateway)"
	@echo "  make test             Run Spring Boot tests"
	@echo "  make build            Build fat JAR"
	@echo "  make clean            Clean build artifacts"
	@echo ""
	@echo "  make gateway-build    Compile the Go gateway binary"
	@echo "  make gateway-run-dev  Run gateway locally (reads .env)"
	@echo ""
	@echo "  make stack-up         docker-compose up --build -d  (full stack)"
	@echo "  make stack-down       docker-compose down"
	@echo "  make stack-logs       Follow logs for all services"
	@echo ""
	@echo "  make secret-gen       Generate GATEWAY_SECRET and append to .env"
	@echo "──────────────────────────────────────────────────────"

# ── Spring Boot ───────────────────────────────────────────────────────────────
run:
	./mvnw spring-boot:run

test:
	./mvnw test

build:
	./mvnw clean package -DskipTests

clean:
	./mvnw clean

# ── Go Gateway ────────────────────────────────────────────────────────────────

# Compile the gateway binary into gateway/bin/gateway
gateway-build:
	cd gateway && go build -o bin/gateway ./cmd/gateway

# Run the gateway locally, loading env vars from the root .env file.
# Spring Boot must already be running on localhost:8080.
# Usage:  make gateway-run-dev
gateway-run-dev:
	cd gateway && \
	  export $$(grep -v '^#' ../.env | xargs) && \
	  BACKEND_URL=http://localhost:8080 \
	  PORT=8443 \
	  go run ./cmd/gateway

# ── Full stack (Docker) ───────────────────────────────────────────────────────
stack-up:
	docker-compose up --build -d

stack-down:
	docker-compose down

stack-logs:
	docker-compose logs -f

# ── One-time setup ────────────────────────────────────────────────────────────
# Appends a freshly generated GATEWAY_SECRET to .env.
# Run this once before the first `make stack-up`.
secret-gen:
	@echo "GATEWAY_SECRET=$$(openssl rand -hex 32)" >> .env
	@echo "✅  GATEWAY_SECRET written to .env"

# legacy targets kept for backwards compat
docker-up:
	docker-compose up -d postgres

docker-down:
	docker-compose down

