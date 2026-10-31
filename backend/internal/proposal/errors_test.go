package proposal

import (
	"errors"
	"fmt"
	"net"
	"strings"
	"testing"
)

func TestClassifyLLMError(t *testing.T) {
	tests := []struct {
		name    string
		err     error
		wantMsg string
		wantCde string
	}{
		{
			name:    "tls handshake timeout из реального лога",
			err:     fmt.Errorf(`llm: llm call failed after retries: llm request: Post "https://api.tokenrouter.com/v1/chat/completions": net/http: TLS handshake timeout`),
			wantMsg: "Не удалось связаться с ИИ",
			wantCde: CodeNetwork,
		},
		{
			name:    "connection refused",
			err:     fmt.Errorf(`llm request: dial tcp 10.0.0.1:443: connect: connection refused`),
			wantMsg: "Не удалось связаться с ИИ",
			wantCde: CodeNetwork,
		},
		{
			name:    "net.Error (no such host)",
			err:     fmt.Errorf("llm request: %w", &net.DNSError{Err: "no such host"}),
			wantMsg: "Не удалось связаться с ИИ",
			wantCde: CodeNetwork,
		},
		{
			name:    "нет ключа",
			err:     errors.New("LLM API key не задан (LLM_API_KEY)"),
			wantMsg: "ИИ не настроен",
			wantCde: CodeNotConfigured,
		},
		{
			name:    "401",
			err:     errors.New("llm api error: 401 Unauthorized: invalid api key"),
			wantMsg: "неверный ключ доступа",
			wantCde: CodeAuth,
		},
		{
			name:    "402",
			err:     errors.New("llm api error: 402 Payment Required"),
			wantMsg: "квота",
			wantCde: CodeQuota,
		},
		{
			name:    "404",
			err:     errors.New("llm api error: 404 Not Found"),
			wantMsg: "Модель ИИ не найдена",
			wantCde: CodeModelNotFound,
		},
		{
			name:    "429",
			err:     errors.New("llm api error: 429 Too Many Requests"),
			wantMsg: "перегружен",
			wantCde: CodeRateLimited,
		},
		{
			name:    "502",
			err:     errors.New("llm api error: 502 Bad Gateway"),
			wantMsg: "временно недоступен",
			wantCde: CodeUnavailable,
		},
		{
			name:    "client timeout",
			err:     errors.New("llm request: context deadline exceeded (Client.Timeout exceeded)"),
			wantMsg: "не успел ответить",
			wantCde: CodeTimeout,
		},
		{
			name:    "невалидный JSON",
			err:     errors.New("llm вернул невалидный JSON"),
			wantMsg: "неожиданный формат ответа",
			wantCde: CodeBadResponse,
		},
		{
			name:    "прочее",
			err:     errors.New("что-то совсем другое"),
			wantMsg: "Не удалось получить ответ от ИИ",
			wantCde: CodeUnknown,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			e := ClassifyLLMError(tt.err)
			if e == nil {
				t.Fatal("nil error")
			}
			if !strings.Contains(e.Message, tt.wantMsg) {
				t.Errorf("message = %q, want substring %q", e.Message, tt.wantMsg)
			}
			if e.Code != tt.wantCde {
				t.Errorf("code = %q, want %q", e.Code, tt.wantCde)
			}
			if e.Error() != e.Message {
				t.Errorf("Error() = %q, want %q", e.Error(), e.Message)
			}
			if e.ErrorCode() != e.Code {
				t.Errorf("ErrorCode() = %q, want %q", e.ErrorCode(), e.Code)
			}
		})
	}
}

func TestClassifyLLMErrorNil(t *testing.T) {
	if e := ClassifyLLMError(nil); e != nil {
		t.Errorf("ClassifyLLMError(nil) = %v, want nil", e)
	}
	if got := FriendlyLLMError(nil); got != "" {
		t.Errorf("FriendlyLLMError(nil) = %q, want empty", got)
	}
}

func TestLLMErrorAsCodedError(t *testing.T) {
	// jobs.Service извлекает код через интерфейс — проверяем контракт.
	var err error = &LLMError{Code: CodeNetwork, Message: "сеть"}
	var coder interface{ ErrorCode() string }
	if !errors.As(err, &coder) {
		t.Fatal("LLMError не реализует interface{ ErrorCode() string }")
	}
	if coder.ErrorCode() != CodeNetwork {
		t.Errorf("ErrorCode() = %q, want %q", coder.ErrorCode(), CodeNetwork)
	}
}
