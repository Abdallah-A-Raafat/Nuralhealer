// Package blacklist implements in-memory IP banning.
//
// Rules:
//   - 3 rate-limit strikes within 10 minutes  →  24-hour ban.
//   - Bans auto-expire; no manual intervention needed for shared NAT IPs.
//   - IsBanned is checked before any other middleware — banned IPs are
//     silently dropped without reading the body or touching Spring Boot.
package blacklist

import (
	"log/slog"
	"sync"
	"time"
)

const (
	strikeWindow = 10 * time.Minute
	strikeLimit  = 3
	banDuration  = 24 * time.Hour
	sweepEvery   = 1 * time.Hour
)

type strikeEntry struct {
	mu          sync.Mutex
	count       int
	windowStart time.Time
}

type banEntry struct {
	expiresAt time.Time
}

// Blacklist tracks per-IP strikes and bans.
// Zero value is not usable; use New().
type Blacklist struct {
	strikes sync.Map // IP → *strikeEntry
	bans    sync.Map // IP → banEntry
}

// New creates a Blacklist and starts the background sweep goroutine.
func New() *Blacklist {
	b := &Blacklist{}
	go b.sweepLoop()
	return b
}

// IsBanned reports whether ip is currently banned.
// Expired bans are lazily removed on access.
func (b *Blacklist) IsBanned(ip string) bool {
	v, ok := b.bans.Load(ip)
	if !ok {
		return false
	}
	e := v.(banEntry)
	if time.Now().After(e.expiresAt) {
		b.bans.Delete(ip)
		return false
	}
	return true
}

// Strike records one violation for ip.
// Strikes are counted inside a rolling 10-minute window.
// On reaching strikeLimit the IP is banned for banDuration.
func (b *Blacklist) Strike(ip string) {
	now := time.Now()

	raw, _ := b.strikes.LoadOrStore(ip, &strikeEntry{windowStart: now})
	e := raw.(*strikeEntry)

	e.mu.Lock()
	defer e.mu.Unlock()

	// Reset window if it has expired.
	if now.Sub(e.windowStart) > strikeWindow {
		e.count = 1
		e.windowStart = now
		return
	}

	e.count++
	if e.count >= strikeLimit {
		b.bans.Store(ip, banEntry{expiresAt: now.Add(banDuration)})
		b.strikes.Delete(ip)
		slog.Warn("IP banned", "ip", ip, "duration", banDuration)
	}
}

// sweepLoop cleans expired bans and stale strike windows every hour.
// Runs as a goroutine for the lifetime of the process.
func (b *Blacklist) sweepLoop() {
	ticker := time.NewTicker(sweepEvery)
	defer ticker.Stop()
	for range ticker.C {
		now := time.Now()

		b.bans.Range(func(k, v any) bool {
			if now.After(v.(banEntry).expiresAt) {
				b.bans.Delete(k)
			}
			return true
		})

		b.strikes.Range(func(k, v any) bool {
			e := v.(*strikeEntry)
			e.mu.Lock()
			expired := now.Sub(e.windowStart) > strikeWindow
			e.mu.Unlock()
			if expired {
				b.strikes.Delete(k)
			}
			return true
		})
	}
}

