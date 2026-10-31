package proposal

import (
	"errors"
	"net"
	"strings"
)

// Машинные коды причин сбоя LLM-операций — поле errorCode задачи
// (GET /api/jobs/{id}). Фронт и дебаг ветвятся по коду, а не по тексту.
const (
	CodeNotConfigured  = "llm_not_configured"  // LLM_API_KEY не задан
	CodeAuth           = "llm_auth"            // 401/403 — неверный ключ
	CodeQuota          = "llm_quota"           // 402 — закончилась квота
	CodeModelNotFound  = "llm_model_not_found" // 404 — модель не найдена
	CodeRateLimited    = "llm_rate_limited"    // 429 — перегруз провайдера
	CodeUnavailable    = "llm_unavailable"     // 5xx — сбой провайдера
	CodeNetwork        = "network_error"       // сеть/BASE_URL недоступны
	CodeTimeout        = "timeout"             // не успел ответить
	CodeBadResponse    = "bad_response"        // сломанный формат ответа
	CodeValidation     = "validation_failed"   // результат не прошёл валидацию
	CodeInvalidRequest = "invalid_request"     // некорректный запрос (мало данных и т.п.)
	CodeUnknown        = "unknown"             // прочее
)

// LLMError — ошибка LLM-операции: машинный код + сообщение для пользователя
// (без URL, сетевых деталей и внутреннего текста Go). Оригинал ошибки
// должен попадать в логи, этот тип — в ответ API.
type LLMError struct {
	Code    string
	Message string
}

func (e *LLMError) Error() string     { return e.Message }
func (e *LLMError) ErrorCode() string { return e.Code }

// ClassifyLLMError переводит ошибку LLM-стека в LLMError: классифицирует
// причину и подбирает сообщение для пользователя.
func ClassifyLLMError(err error) *LLMError {
	if err == nil {
		return nil
	}
	msg := err.Error()

	switch {
	case strings.Contains(msg, "LLM API key не задан"):
		return &LLMError{CodeNotConfigured, "ИИ не настроен: попросите администратора задать LLM_API_KEY на сервере"}
	case strings.Contains(msg, "llm api error: 401"),
		strings.Contains(msg, "llm api error: 403"):
		return &LLMError{CodeAuth, "ИИ отклонил запрос: неверный ключ доступа (LLM_API_KEY)"}
	case strings.Contains(msg, "llm api error: 402"):
		return &LLMError{CodeQuota, "У ключа ИИ закончилась квота — пополните баланс провайдера"}
	case strings.Contains(msg, "llm api error: 404"):
		return &LLMError{CodeModelNotFound, "Модель ИИ не найдена: проверьте LLM_MODEL и LLM_BASE_URL"}
	case strings.Contains(msg, "llm api error: 429"):
		return &LLMError{CodeRateLimited, "ИИ перегружен запросами — подождите минуту и попробуйте снова"}
	case strings.Contains(msg, "llm api error: 5"):
		return &LLMError{CodeUnavailable, "Сервис ИИ временно недоступен — попробуйте позже"}
	case isNetworkError(err, msg):
		return &LLMError{CodeNetwork, "Не удалось связаться с ИИ: сервис недоступен (проблема сети или адреса LLM_BASE_URL). Попробуйте позже"}
	case strings.Contains(msg, "context deadline exceeded"),
		strings.Contains(msg, "context canceled"),
		strings.Contains(msg, "Client.Timeout"):
		return &LLMError{CodeTimeout, "ИИ не успел ответить за отведённое время — попробуйте ещё раз"}
	case strings.Contains(msg, "невалидный JSON"),
		strings.Contains(msg, "пустой контент"),
		strings.Contains(msg, "пустой ответ"):
		return &LLMError{CodeBadResponse, "ИИ вернул неожиданный формат ответа — попробуйте переформулировать запрос"}
	}
	return &LLMError{CodeUnknown, "Не удалось получить ответ от ИИ. Попробуйте позже."}
}

// FriendlyLLMError возвращает только человекочитаемое сообщение
// (код причины — в ClassifyLLMError).
func FriendlyLLMError(err error) string {
	if e := ClassifyLLMError(err); e != nil {
		return e.Message
	}
	return ""
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
