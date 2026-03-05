// Package jwtcheck provides a stateless JWT verification helper.
// It only checks signature and expiry — no database involved.
// Reusable by any future service in this repository.
package jwtcheck

import (
	"errors"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// cookieName is the HTTPOnly cookie set by Spring Boot's AuthService.
const cookieName = "neuralhealer_token"

// Check extracts a JWT from the request (cookie first, then
// Authorization: Bearer header) and verifies its signature and
// expiry against secret.  Returns nil on success.
func Check(r *http.Request, secret []byte) error {
	raw, err := extract(r)
	if err != nil {
		return err
	}

	_, parseErr := jwt.Parse(raw, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return secret, nil
	}, jwt.WithExpirationRequired())

	return parseErr
}

// extract pulls the raw token string from the request.
// Cookie has priority — it is the primary auth mechanism in NeuralHealer.
func extract(r *http.Request) (string, error) {
	// 1. HTTPOnly cookie (set by Spring Boot on /auth/login).
	if c, err := r.Cookie(cookieName); err == nil && c.Value != "" {
		return c.Value, nil
	}

	// 2. Authorization: Bearer <token> fallback (mobile / Postman / Swagger).
	if h := r.Header.Get("Authorization"); strings.HasPrefix(h, "Bearer ") {
		tok := strings.TrimPrefix(h, "Bearer ")
		if tok != "" {
			return tok, nil
		}
	}

	return "", errors.New("no token found")
}

