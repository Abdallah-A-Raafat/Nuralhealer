package iputil

import (
	"net/http"
	"strings"
)

// ClientIP extracts the real client IP address from a request.
// Priority: X-Forwarded-For → X-Real-Ip → RemoteAddr.
// Only the first (leftmost) value of X-Forwarded-For is used —
// that is the client IP added by the outermost trusted proxy.
func ClientIP(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		// Take only the leftmost address; strip any port or whitespace.
		ip := strings.SplitN(xff, ",", 2)[0]
		return strings.TrimSpace(ip)
	}
	if xri := r.Header.Get("X-Real-Ip"); xri != "" {
		return strings.TrimSpace(xri)
	}
	return stripPort(r.RemoteAddr)
}

// stripPort removes the port suffix from an addr string (host:port).
func stripPort(addr string) string {
	if i := strings.LastIndex(addr, ":"); i != -1 {
		return addr[:i]
	}
	return addr
}

