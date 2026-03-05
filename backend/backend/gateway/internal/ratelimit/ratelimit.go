// Package ratelimit implements per-IP token-bucket rate limiting
// with route-aware tiers.
//
// Tiers (requests/sec, burst):
//   - auth    /api/auth/login, /api/auth/register  →  10 r/s, burst 20
//   - ai      /api/ai/**                           →   5 r/s, burst  5
//   - default everything else                      →  50 r/s, burst 100
//
// On limit exceeded: HTTP 429 is returned and a strike is recorded
// against the IP in the Blacklist.
// Idle limiters are evicted every 5 minutes to keep memory flat.
package ratelimit

import (
	"net/http"
	"sync"
	"time"

	"github.com/neuralhealer/gateway/internal/blacklist"
	"github.com/neuralhealer/gateway/pkg/iputil"
	"golang.org/x/time/rate"
)

const (
	idleEvictAfter = 5 * time.Minute
	cleanupEvery   = 5 * time.Minute
)

type limiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

// RateLimiter holds per-"IP|tier" token buckets.
type RateLimiter struct {
	mu        sync.Mutex
	limiters  map[string]*limiterEntry
	blacklist *blacklist.Blacklist
}

// New creates a RateLimiter and starts the background eviction goroutine.
func New(bl *blacklist.Blacklist) *RateLimiter {
	rl := &RateLimiter{
		limiters:  make(map[string]*limiterEntry),
		blacklist: bl,
	}
	go rl.cleanupLoop()
	return rl
}

// tier classifies a path into one of three named buckets.
type tier struct {
	name  string
	limit rate.Limit
	burst int
}

// tierFor returns the rate-limit parameters for a given path.
func tierFor(path string) tier {
	switch {
	case path == "/api/auth/login" || path == "/api/auth/register":
		return tier{"auth", 10, 20}
	case len(path) >= 8 && path[:8] == "/api/ai/":
		return tier{"ai", 5, 5}
	default:
		return tier{"default", 50, 100}
	}
}

// getLimiter returns (creating if needed) the limiter for ip+path.
func (rl *RateLimiter) getLimiter(ip, path string) *rate.Limiter {
	t := tierFor(path)
	key := ip + "|" + t.name

	rl.mu.Lock()
	defer rl.mu.Unlock()

	e, ok := rl.limiters[key]
	if !ok {
		e = &limiterEntry{limiter: rate.NewLimiter(t.limit, t.burst)}
		rl.limiters[key] = e
	}
	e.lastSeen = time.Now()
	return e.limiter
}

// Middleware checks the per-IP rate limit before passing to next.
// Excess requests receive 429 and trigger a blacklist strike.
func (rl *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ip := iputil.ClientIP(r)
		if !rl.getLimiter(ip, r.URL.Path).Allow() {
			rl.blacklist.Strike(ip)
			w.Header().Set("Retry-After", "1")
			http.Error(w, "Too Many Requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

// cleanupLoop evicts limiters that have been idle for idleEvictAfter.
func (rl *RateLimiter) cleanupLoop() {
	ticker := time.NewTicker(cleanupEvery)
	defer ticker.Stop()
	for range ticker.C {
		cutoff := time.Now().Add(-idleEvictAfter)
		rl.mu.Lock()
		for k, e := range rl.limiters {
			if e.lastSeen.Before(cutoff) {
				delete(rl.limiters, k)
			}
		}
		rl.mu.Unlock()
	}
}

