package proposal

import (
	"errors"
	"fmt"
	"net"
	"strings"
	"testing"
)

func TestFriendlyLLMError(t *testing.T) {
	tests := []struct {
		name string
		err  error
		want string
	}{
		{
			name: "tls handshake timeout из реального лога",
			err:  fmt.Errorf(`llm: llm call failed after retries: llm request: Post "https://api.tokenrouter.com/v1/chat/completions": net/http: TLS handshake timeout`),
			want: "Не удалось связаться с ИИ",
		},
		{
			name: "connection refused",
			err:  fmt.Errorf(`llm request: dial tcp 10.0.0.1:443: connect: connection refused`),
			want: "Не удалось связаться с ИИ",
		},
		{
			name: "net.Error (no such host)",
			err:  fmt.Errorf("llm request: %w", &net.DNSError{Err: "no such host"}),
			want: "Не удалось связаться с ИИ",
		},
		{
			name: "нет ключа",
			err:  errors.New("LLM API key не задан (LLM_API_KEY)"),
			want: "ИИ не настроен",
		},
		{
			name: "401",
			err:  errors.New("llm api error: 401 Unauthorized: invalid api key"),
			want: "неверный ключ доступа",
		},
		{
			name: "429",
			err:  errors.New("llm api error: 429 Too Many Requests"),
			want: "перегружен",
		},
		{
			name: "502",
			err:  errors.New("llm api error: 502 Bad Gateway"),
			want: "временно недоступен",
		},
		{
			name: "client timeout",
			err:  errors.New("llm request: context deadline exceeded (Client.Timeout exceeded)"),
			want: "не успел ответить",
		},
		{
			name: "невалидный JSON",
			err:  errors.New("llm вернул невалидный JSON"),
			want: "неожиданный формат ответа",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := FriendlyLLMError(tt.err)
			if got == "" {
				t.Fatal("empty message")
			}
			if !strings.Contains(got, tt.want) {
				t.Errorf("FriendlyLLMError = %q, want substring %q", got, tt.want)
			}
		})
	}
}
