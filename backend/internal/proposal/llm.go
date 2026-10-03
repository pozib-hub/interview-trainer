package proposal

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
)

// llmMessage — сообщение чата в OpenAI-совместимом формате.
type llmMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// LLMClient — минимальный OpenAI-совместимый клиент (DeepSeek, OpenAI, OpenRouter и др.).
type LLMClient struct {
	BaseURL    string
	Model      string
	APIKey     string
	HTTPClient *http.Client
	MaxRetries int
}

func NewLLMClient(baseURL, model, apiKey string, timeout time.Duration) *LLMClient {
	if baseURL == "" {
		baseURL = "https://api.deepseek.com/v1"
	}
	if model == "" {
		model = "deepseek-chat"
	}
	return &LLMClient{
		BaseURL:    strings.TrimRight(baseURL, "/"),
		Model:      model,
		APIKey:     apiKey,
		HTTPClient: &http.Client{Timeout: timeout},
		MaxRetries: 2,
	}
}

// Chat вызывает /chat/completions и возвращает распарсенный JSON-ответ.
func (c *LLMClient) Chat(ctx context.Context, messages []llmMessage) (string, error) {
	if c.APIKey == "" {
		return "", fmt.Errorf("LLM API key не задан (LLM_API_KEY)")
	}

	body := map[string]any{
		"model":           c.Model,
		"messages":        messages,
		"temperature":     0.2,
		"response_format": map[string]string{"type": "json_object"},
	}
	payload, err := json.Marshal(body)
	if err != nil {
		return "", fmt.Errorf("marshal request: %w", err)
	}

	url := c.BaseURL + "/chat/completions"
	var lastErr error
	for attempt := 0; attempt <= c.MaxRetries; attempt++ {
		if attempt > 0 {
			select {
			case <-time.After(time.Duration(1500*(attempt)) * time.Millisecond):
			case <-ctx.Done():
				return "", ctx.Err()
			}
		}

		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
		if err != nil {
			return "", fmt.Errorf("build request: %w", err)
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+c.APIKey)

		res, err := c.HTTPClient.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("llm request: %w", err)
			continue
		}
		raw, _ := io.ReadAll(io.LimitReader(res.Body, 8<<20))
		res.Body.Close()

		if res.StatusCode == http.StatusTooManyRequests || res.StatusCode >= 500 {
			lastErr = fmt.Errorf("llm transient error: %d %s", res.StatusCode, res.Status)
			continue
		}
		if res.StatusCode != http.StatusOK {
			return "", fmt.Errorf("llm api error: %d %s: %s", res.StatusCode, res.Status, truncate(string(raw), 1000))
		}

		var data struct {
			Choices []struct {
				Message struct {
					Content string `json:"content"`
				} `json:"message"`
			} `json:"choices"`
		}
		if err := json.Unmarshal(raw, &data); err != nil {
			return "", fmt.Errorf("decode llm response: %w", err)
		}
		if len(data.Choices) == 0 || data.Choices[0].Message.Content == "" {
			return "", fmt.Errorf("llm вернул пустой контент: %s", truncate(string(raw), 500))
		}
		return data.Choices[0].Message.Content, nil
	}
	return "", fmt.Errorf("llm call failed after retries: %w", lastErr)
}

// ChatRaw отправляет пару system+user сообщений и возвращает сырой ответ.
// Удобен для разовых запросов (например, ИИ-ревью задач в CI).
func (c *LLMClient) ChatRaw(ctx context.Context, system, user string) (string, error) {
	return c.Chat(ctx, []llmMessage{
		{Role: "system", Content: system},
		{Role: "user", Content: user},
	})
}

var fenceRe = regexp.MustCompile("(?s)```(?:json)?\\s*(.*?)```")

// ParseJSONContent парсит ответ модели в JSON, толерантен к fenced code blocks и прозе.
func ParseJSONContent(content string) ([]byte, error) {
	txt := strings.TrimSpace(content)
	if m := fenceRe.FindStringSubmatch(txt); m != nil {
		txt = strings.TrimSpace(m[1])
	}
	if !strings.HasPrefix(txt, "{") {
		start := strings.Index(txt, "{")
		end := strings.LastIndex(txt, "}")
		if start != -1 && end > start {
			txt = txt[start : end+1]
		}
	}
	var check json.RawMessage
	if err := json.Unmarshal([]byte(txt), &check); err != nil {
		return nil, fmt.Errorf("llm вернул невалидный JSON: %w; фрагмент: %s", err, truncate(txt, 400))
	}
	return []byte(txt), nil
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}
