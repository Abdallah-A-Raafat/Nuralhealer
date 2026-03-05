// Package middleware assembles the validation layer that sits between
// the rate limiter and the reverse proxy.
//
// Checks performed (in order, cheapest first):
//
//  1. WebSocket / SSE passthrough  — no body or JWT checks.
//  2. Body size  > 10 MB           → 413.
//  3. Missing Content-Type on POST/PUT/PATCH → 400.
//  4. Empty body  on POST/PUT/PATCH          → 400.
//  5. JWT signature + expiry on protected routes → 401.
//
// Public routes (no JWT check):
//
//	/api/auth/**   /api/quizzes/**   /api/docs/**
//	/api/swagger** /api/v3/api-docs  /api/actuator/health
//	/api/doctors/verification/questions
//	/api/test/**   /api/diagnostic/** /api/live-sessions/**
//	/api/error
package middleware

import (
	"log/slog"
	"net/http"
	"strings"

	"github.com/neuralhealer/gateway/pkg/iputil"
	"github.com/neuralhealer/gateway/pkg/jwtcheck"
)

const maxBodyBytes = 10 << 20 // 10 MB

// isPassthrough returns true for requests that must skip all body
// and JWT checks and be forwarded as-is.
//
//   - WebSocket upgrade (STOMP /ws, raw /notifications, /ai-ws)
//   - SSE stream (/api/notifications/stream) — long-lived, no body
func isPassthrough(r *http.Request) bool {
	// Any WebSocket upgrade request.
	if strings.EqualFold(r.Header.Get("Upgrade"), "websocket") {
		return true
	}
	p := r.URL.Path
	// Known WebSocket endpoint prefixes.
	if strings.HasPrefix(p, "/api/ws") ||
		strings.HasPrefix(p, "/api/ai-ws") ||
		strings.HasPrefix(p, "/api/notifications/stream") {
		return true
	}
	return false
}

// isPublic returns true if the path does not require a JWT.
// List mirrors SecurityConfig.java's .permitAll() matchers exactly.
func isPublic(path string) bool {
	publicPrefixes := []string{
		"/api/auth/",
		"/api/quizzes/",
		"/api/docs/",
		"/api/swagger",
		"/api/v3/api-docs",
		"/api/test/",
		"/api/diagnostic/",
		"/api/live-sessions/",
		"/api/error",
	}
	for _, prefix := range publicPrefixes {
		if strings.HasPrefix(path, prefix) {
			return true
		}
	}
	// Exact public paths.
	switch path {
	case "/api/actuator/health",
		"/api/doctors/verification/questions":
		return true
	}
	return false
}

// Validation returns an http.Handler that runs the four pre-checks
// and then delegates to next.
func Validation(jwtSecret []byte, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// WebSocket upgrades and SSE streams bypass all checks.
		if isPassthrough(r) {
			next.ServeHTTP(w, r)
			return
		}

		// 1. Body size guard — checked before reading body.
		if r.ContentLength > maxBodyBytes {
			http.Error(w, "Payload Too Large", http.StatusRequestEntityTooLarge)
			return
		}

		// 2 & 3. Content-Type and empty body on mutating methods.
		if isMutating(r.Method) {
			if r.Header.Get("Content-Type") == "" {
				http.Error(w, "Missing Content-Type", http.StatusBadRequest)
				return
			}
			if r.ContentLength == 0 {
				http.Error(w, "Empty Body", http.StatusBadRequest)
				return
			}
		}

		// 4. JWT pre-check on protected routes (signature + expiry only).
		//    Spring Boot still owns full auth/role enforcement.
		if !isPublic(r.URL.Path) {
			if err := jwtcheck.Check(r, jwtSecret); err != nil {
				slog.Debug("JWT pre-check failed",
					"ip", iputil.ClientIP(r),
					"path", r.URL.Path,
					"err", err,
				)
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}
		}

		next.ServeHTTP(w, r)
	})
}

// Blacklist returns an http.Handler that drops requests from banned IPs
// before anything else runs — no body read, no logging noise.
// The checker func is provided by the blacklist package.
func Blacklist(isBanned func(ip string) bool, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if isBanned(iputil.ClientIP(r)) {
			// Silent drop — do not reveal the ban to the attacker.
			return
		}
		next.ServeHTTP(w, r)
	})
}

func isMutating(method string) bool {
	return method == http.MethodPost ||
		method == http.MethodPut ||
		method == http.MethodPatch
}

