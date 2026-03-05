// Package proxy builds the reverse proxy that forwards validated
// requests to Spring Boot and injects the X-Gateway-Secret header.
package proxy

import (
	"log/slog"
	"net/http"
	"net/http/httputil"
	"net/url"
)

// New returns an http.Handler that:
//  1. Preserves the original path and query.
//  2. Injects X-Gateway-Secret so Spring Boot can verify the request
//     came through the gateway and not directly to :8080.
//  3. Sets r.Host to the backend host (required for correct routing).
//  4. Handles backend errors gracefully — returns 502 instead of panicking.
//
// NOTE: Go's httputil.ReverseProxy forwards all request headers by default,
// including X-Quiz-Session and X-Quiz-Session-120 used by the quiz endpoints,
// as well as all cookie headers needed by Spring Boot's auth layer.
// Do NOT add a ModifyResponse that strips headers.
func New(backendURL, gatewaySecret string) http.Handler {
	target, err := url.Parse(backendURL)
	if err != nil {
		// Startup-time misconfiguration — fail fast.
		panic("gateway/proxy: invalid BACKEND_URL: " + err.Error())
	}

	rp := httputil.NewSingleHostReverseProxy(target)

	// Wrap the default director to inject our headers after it runs.
	originalDirector := rp.Director
	rp.Director = func(r *http.Request) {
		originalDirector(r)

		// Tell Spring Boot this request was verified by the gateway.
		r.Header.Set("X-Gateway-Secret", gatewaySecret)

		// Preserve the original Host header so Spring Boot routing works.
		r.Header.Set("X-Forwarded-Host", r.Host)

		// Set Host to the backend target (required for httputil.ReverseProxy).
		r.Host = target.Host
	}

	// Custom error handler: log the failure and return 502.
	// Default behaviour panics on a closed backend connection.
	rp.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		slog.Error("backend unreachable",
			"method", r.Method,
			"path", r.URL.Path,
			"err", err,
		)
		http.Error(w, "Bad Gateway", http.StatusBadGateway)
	}

	return rp
}

