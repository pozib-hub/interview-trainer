package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestRateLimiterAllowsWithinLimit(t *testing.T) {
	rl := NewRateLimiter(3, time.Minute, nil)
	handler := rl.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	for i := 0; i < 3; i++ {
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))
		if rec.Code != http.StatusOK {
			t.Fatalf("запрос %d: ожидался 200, получен %d", i+1, rec.Code)
		}
	}
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))
	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("4-й запрос: ожидался 429, получен %d", rec.Code)
	}
}

func TestRateLimiterSeparatesClients(t *testing.T) {
	rl := NewRateLimiter(1, time.Minute, nil)
	handler := rl.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req1 := httptest.NewRequest(http.MethodGet, "/", nil)
	req1.RemoteAddr = "10.0.0.1:1234"
	req2 := httptest.NewRequest(http.MethodGet, "/", nil)
	req2.RemoteAddr = "10.0.0.2:1234"

	rec1, rec2 := httptest.NewRecorder(), httptest.NewRecorder()
	handler.ServeHTTP(rec1, req1)
	handler.ServeHTTP(rec2, req2)
	if rec1.Code != http.StatusOK || rec2.Code != http.StatusOK {
		t.Fatalf("разные IP не должны делить лимит: %d и %d", rec1.Code, rec2.Code)
	}

	rec3 := httptest.NewRecorder()
	handler.ServeHTTP(rec3, req1)
	if rec3.Code != http.StatusTooManyRequests {
		t.Fatalf("повторный запрос того же IP: ожидался 429, получен %d", rec3.Code)
	}
}

func TestRateLimiterWindowReset(t *testing.T) {
	rl := NewRateLimiter(1, 10*time.Millisecond, nil)
	handler := rl.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("первый запрос: %d", rec.Code)
	}
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))
	if rec.Code != http.StatusTooManyRequests {
		t.Fatalf("до истечения окна: %d", rec.Code)
	}
	time.Sleep(15 * time.Millisecond)
	rec = httptest.NewRecorder()
	handler.ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))
	if rec.Code != http.StatusOK {
		t.Fatalf("после истечения окна: %d", rec.Code)
	}
}

func TestRateLimiterTrustsXRealIPFromTrustedProxyOnly(t *testing.T) {
	trusted, err := ParseCIDRs("172.16.0.0/12")
	if err != nil {
		t.Fatalf("ParseCIDRs: %v", err)
	}
	rl := NewRateLimiter(1, time.Minute, trusted)
	var got string
	handler := rl.Middleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		got = r.Header.Get("X-Test-Key")
		w.WriteHeader(http.StatusOK)
	}))

	do := func(remoteAddr, xRealIP string) int {
		req := httptest.NewRequest(http.MethodGet, "/", nil)
		req.RemoteAddr = remoteAddr
		if xRealIP != "" {
			req.Header.Set("X-Real-IP", xRealIP)
		}
		req.Header.Set("X-Test-Key", remoteAddr+"|"+xRealIP)
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)
		return rec.Code
	}

	// Доверенный прокси: два разных X-Real-IP не делят лимит.
	if c := do("172.17.0.5:1", "203.0.113.10"); c != http.StatusOK {
		t.Fatalf("через доверенный прокси (клиент 1): %d", c)
	}
	if c := do("172.17.0.5:1", "203.0.113.11"); c != http.StatusOK {
		t.Fatalf("через доверенный прокси (клиент 2): %d", c)
	}
	// Один и тот же клиент дважды — лимит исчерпан.
	if c := do("172.17.0.5:1", "203.0.113.10"); c != http.StatusTooManyRequests {
		t.Fatalf("повтор того же клиента: %d", c)
	}
	// Недоверенный источник: X-Real-IP игнорируется, ключ — сам RemoteAddr.
	if c := do("192.0.2.7:1", "203.0.113.99"); c != http.StatusOK {
		t.Fatalf("прямой запрос: %d", c)
	}
	// Другой IP — свой лимит, несмотря на подделанный X-Real-IP.
	if c := do("192.0.2.8:1", "203.0.113.98"); c != http.StatusOK {
		t.Fatalf("другой IP без доверия: %d", c)
	}
	_ = got
}

func TestParseCIDRs(t *testing.T) {
	tests := []struct {
		in   string
		want int
	}{
		{"", 0},
		{"  ", 0},
		{"127.0.0.1", 1},
		{"127.0.0.1,::1", 2},
		{"172.16.0.0/12, 10.0.0.0/8", 2},
	}
	for _, tc := range tests {
		nets, err := ParseCIDRs(tc.in)
		if err != nil {
			t.Fatalf("ParseCIDRs(%q): %v", tc.in, err)
		}
		if len(nets) != tc.want {
			t.Fatalf("ParseCIDRs(%q): получено %d сетей, ожидалось %d", tc.in, len(nets), tc.want)
		}
	}
	if _, err := ParseCIDRs("не-ip"); err == nil {
		t.Fatal("ожидалась ошибка для некорректного значения")
	}
}
