// NeuralHealer API Gateway
//
// Entry point.  Reads configuration from environment variables,
// wires the middleware chain, and starts the HTTP server.
//
// Middleware chain (outer → inner, each layer only runs if the previous passes):
//
//	Blacklist → RateLimit → Validation → ReverseProxy
//
// Environment variables:
//
//	BACKEND_URL     URL of the Spring Boot service  (required)
//	JWT_SECRET      Base64-encoded HS256 secret     (required, must match Spring)
//	GATEWAY_SECRET  Shared secret header value      (required)
//	PORT            Listen port                     (default: 8443)
package main

import (
	"context"
	"encoding/base64"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/neuralhealer/gateway/internal/blacklist"
	"github.com/neuralhealer/gateway/internal/middleware"
	"github.com/neuralhealer/gateway/internal/proxy"
	"github.com/neuralhealer/gateway/internal/ratelimit"
)

func main() {
	backendURL    := mustEnv("BACKEND_URL")
	jwtSecretB64  := mustEnv("JWT_SECRET")
	gatewaySecret := mustEnv("GATEWAY_SECRET")
	port          := envOr("PORT", "8443")

	// Decode the JWT secret from Base64 — same encoding Spring Boot uses
	// via the jwt.secret property in application.yml.
	jwtSecret := decodeBase64Secret(jwtSecretB64)

	bl := blacklist.New()
	rl := ratelimit.New(bl)
	p  := proxy.New(backendURL, gatewaySecret)

	// Build chain from innermost → outermost.
	// proxy ←wrapped by→ validation ←wrapped by→ rateLimit ←wrapped by→ blacklist
	chain := middleware.Blacklist(
		bl.IsBanned,
		rl.Middleware(
			middleware.Validation(jwtSecret, p),
		),
	)

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      chain,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 60 * time.Second, // generous for AI streaming responses
		IdleTimeout:  120 * time.Second,
	}

	// Start server in background goroutine so we can block on OS signals.
	go func() {
		slog.Info("gateway starting", "port", port, "backend", backendURL)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			slog.Error("server stopped unexpectedly", "err", err)
			os.Exit(1)
		}
	}()

	// Block until SIGINT or SIGTERM is received (Docker stop sends SIGTERM).
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	slog.Info("gateway shutting down…")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		slog.Error("graceful shutdown failed", "err", err)
	}
	slog.Info("gateway stopped")
}

// mustEnv reads key from the environment and exits immediately if it is absent.
func mustEnv(key string) string {
	v := os.Getenv(key)
	if v == "" {
		slog.Error("missing required environment variable", "key", key)
		os.Exit(1)
	}
	return v
}

// envOr returns the value of key, or fallback when key is unset or empty.
func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// decodeBase64Secret decodes the standard Base64 JWT secret that
// Spring Boot stores in jwt.secret (application.yml).
// Falls back to raw bytes for plain-text secrets used in local dev.
func decodeBase64Secret(raw string) []byte {
	if b, err := base64.StdEncoding.DecodeString(raw); err == nil {
		return b
	}
	if b, err := base64.URLEncoding.DecodeString(raw); err == nil {
		return b
	}
	// Plain-text fallback — acceptable for local development only.
	return []byte(raw)
}


