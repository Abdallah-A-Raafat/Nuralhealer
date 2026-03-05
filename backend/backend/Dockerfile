# ── Stage 1: build ───────────────────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Cache dependency layer — only re-runs when pom.xml changes.
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build the fat JAR, skipping tests (run them in CI).
COPY src ./src
RUN mvn package -DskipTests -q

# ── Stage 2: runtime ─────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

# wget is used by the HEALTHCHECK probe.
RUN apk add --no-cache wget

# Non-root user for container security.
# Create user/group, storage dir, and set ownership — all as root before USER switch.
RUN addgroup -S neuralhealer \
 && adduser -S -G neuralhealer neuralhealer \
 && mkdir -p /app/storage/doctors/profiles \
 && chown -R neuralhealer:neuralhealer /app

USER neuralhealer
WORKDIR /app

COPY --from=builder /build/target/*.jar app.jar

EXPOSE 8080

# Spring Boot actuator health probe — container is healthy once Spring is up.
HEALTHCHECK --interval=15s --timeout=5s --start-period=60s --retries=8 \
  CMD wget -qO- http://localhost:8080/api/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
