// Package middleware — сквозные HTTP-слои: логирование, recoverer, request id,
// rate limiting.
package middleware

import (
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"
)

// RateLimiter — простой in-memory лимитер запросов (fixed window) по ключу
// клиента. Закрывает базовые сценарии: brute-force логина, шторм LLM-запросов
// (финансовый ущерб на API-ключе), спам комнатами лайвкодинга. Не является
// защитой от распределённого DDoS — для этого нужен периметр (LB/WAF).
type RateLimiter struct {
	limit   int
	window  time.Duration
	trusted []*net.IPNet

	mu      sync.Mutex
	hits    map[string]windowHits
	sweptAt time.Time
}

type windowHits struct {
	count   int
	resetAt time.Time
}

func NewRateLimiter(limit int, window time.Duration, trustedProxies []*net.IPNet) *RateLimiter {
	return &RateLimiter{
		limit:   limit,
		window:  window,
		trusted: trustedProxies,
		hits:    map[string]windowHits{},
	}
}

// Middleware отклоняет запрос сверх лимита ответом 429.
func (l *RateLimiter) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !l.allow(l.clientIP(r)) {
			w.Header().Set("Content-Type", "application/json; charset=utf-8")
			w.Header().Set("Retry-After", "60")
			w.WriteHeader(http.StatusTooManyRequests)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"error": "Слишком много запросов — попробуйте через минуту",
			})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (l *RateLimiter) allow(key string) bool {
	now := time.Now()
	l.mu.Lock()
	defer l.mu.Unlock()

	h, ok := l.hits[key]
	if !ok || now.After(h.resetAt) {
		l.sweepLocked(now)
		l.hits[key] = windowHits{count: 1, resetAt: now.Add(l.window)}
		return true
	}
	h.count++
	l.hits[key] = h
	return h.count <= l.limit
}

// sweepLocked удаляет устаревшие ключи, чтобы карта не росла бесконечно.
func (l *RateLimiter) sweepLocked(now time.Time) {
	if now.Sub(l.sweptAt) < l.window {
		return
	}
	l.sweptAt = now
	for k, h := range l.hits {
		if now.After(h.resetAt) {
			delete(l.hits, k)
		}
	}
}

// clientIP возвращает IP клиента: RemoteAddr, либо X-Real-IP, если запрос
// пришёл от доверенного прокси (иначе заголовок подделывается извне).
// Для корректной работы за nginx задайте TRUSTED_PROXIES.
func (l *RateLimiter) clientIP(r *http.Request) string {
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		host = r.RemoteAddr
	}
	ip := net.ParseIP(host)
	if ip == nil {
		return host
	}
	for _, n := range l.trusted {
		if n.Contains(ip) {
			if real := strings.TrimSpace(r.Header.Get("X-Real-IP")); real != "" {
				if net.ParseIP(real) != nil {
					return real
				}
			}
			break
		}
	}
	return host
}

// ParseCIDRs парсит список IP/CIDR через запятую (TRUSTED_PROXIES).
// Одиночный IP без маски дополняется /32 (IPv4) или /128 (IPv6).
func ParseCIDRs(s string) ([]*net.IPNet, error) {
	var nets []*net.IPNet
	for _, part := range strings.Split(s, ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			continue
		}
		if !strings.Contains(part, "/") {
			if strings.Contains(part, ":") {
				part += "/128"
			} else {
				part += "/32"
			}
		}
		_, n, err := net.ParseCIDR(part)
		if err != nil {
			return nil, fmt.Errorf("парсинг TRUSTED_PROXIES %q: %w", part, err)
		}
		nets = append(nets, n)
	}
	return nets, nil
}
