package proposal

import (
	"errors"
	"net"
	"strings"
)

// FriendlyLLMError переводит ошибки LLM-стека в сообщения для пользователя:
// без URL, сетевых деталей и внутреннего текста Go.
// Оригинал ошибки должен попадать в логи, а эта функция — в ответ API.
func FriendlyLLMError(err error) string {
	if err == nil {
		return ""
	}
	msg := err.Error()

	switch {
	case strings.Contains(msg, "LLM API key не задан"):
		return "ИИ не настроен: попросите администратора задать LLM_API_KEY на сервере"
	case strings.Contains(msg, "llm api error: 401"),
		strings.Contains(msg, "llm api error: 403"):
		return "ИИ отклонил запрос: неверный ключ доступа (LLM_API_KEY)"
	case strings.Contains(msg, "llm api error: 402"):
		return "У ключа ИИ закончилась квота — пополните баланс провайдера"
	case strings.Contains(msg, "llm api error: 404"):
		return "Модель ИИ не найдена: проверьте LLM_MODEL и LLM_BASE_URL"
	case strings.Contains(msg, "llm api error: 429"):
		return "ИИ перегружен запросами — подождите минуту и попробуйте снова"
	case strings.Contains(msg, "llm api error: 5"):
		return "Сервис ИИ временно недоступен — попробуйте позже"
	case isNetworkError(err, msg):
		return "Не удалось связаться с ИИ: сервис недоступен (проблема сети или адреса LLM_BASE_URL). Попробуйте позже"
	case strings.Contains(msg, "context deadline exceeded"),
		strings.Contains(msg, "context canceled"),
		strings.Contains(msg, "Client.Timeout"):
		return "ИИ не успел ответить за отведённое время — попробуйте ещё раз"
	case strings.Contains(msg, "невалидный JSON"),
		strings.Contains(msg, "пустой контент"),
		strings.Contains(msg, "пустой ответ"):
		return "ИИ вернул неожиданный формат ответа — попробуйте переформулировать запрос"
	}
	return "Не удалось получить ответ от ИИ. Попробуйте позже."
}

func isNetworkError(err error, msg string) bool {
	var netErr net.Error
	if errors.As(err, &netErr) {
		return true
	}
	for _, pattern := range []string{
		"dial tcp",
		"no such host",
		"connection refused",
		"connection reset",
		"connection closed",
		"TLS handshake",
		"i/o timeout",
		"proxy error",
		"network is unreachable",
	} {
		if strings.Contains(msg, pattern) {
			return true
		}
	}
	return false
}
