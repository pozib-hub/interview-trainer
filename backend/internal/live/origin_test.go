package live

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCheckOrigin(t *testing.T) {
	tests := []struct {
		name   string
		origin string
		host   string
		want   bool
	}{
		{"нет Origin (curl/node)", "", "any:8080", true},
		{"same-origin", "http://localhost:3000", "localhost:3000", true},
		{"чужой домен", "http://evil.example", "localhost:3000", false},
		{"другой порт", "http://localhost:5173", "localhost:3000", false},
		{"битый URL", "http://[::1", "localhost:3000", false},
	}
	for _, tc := range tests {
		req := httptest.NewRequest(http.MethodGet, "/ws/live/abcd", nil)
		req.Host = tc.host
		req.RemoteAddr = "192.0.2.1:1234"
		if tc.origin != "" {
			req.Header.Set("Origin", tc.origin)
		}
		if got := checkOrigin(req); got != tc.want {
			t.Errorf("%s: checkOrigin() = %v, ожидалось %v", tc.name, got, tc.want)
		}
	}
}
