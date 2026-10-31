// Package review — ИИ-ревью кода пользователя после решения задачи,
// как разбирали бы на реальном собеседовании: корректность, асимптотика,
// читаемость, сравнение с эталоном и вердикт.
package review

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/hint"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
)

// LLMChat — минимальный интерфейс LLM (реализация *proposal.LLMClient).
type LLMChat interface {
	ChatRaw(ctx context.Context, system, user string) (string, error)
}

// TaskSource — источник задач (реализация *scanner.Scanner).
type TaskSource interface {
	GetTask(id string) (domain.TaskFull, bool)
}

// TaskRunner — витес-раннер (реализация *runner.VitestRunner).
type TaskRunner interface {
	Run(ctx context.Context, task domain.TaskFull, userCode string) domain.RunResult
}

// Service выполняет ревью.
type Service struct {
	LLM   LLMChat
	Tasks TaskSource
	Run   TaskRunner
	Mock  bool
}

// Request — запрос ревью из UI.
type Request struct {
	TaskID string `json:"taskId"`
	Code   string `json:"code"`
}

// Response — разбор для UI.
type Response struct {
	Verdict      string   `json:"verdict"`
	Summary      string   `json:"summary"`
	Strengths    []string `json:"strengths"`
	Improvements []string `json:"improvements"`
	Questions    []string `json:"questions"`
	Complexity   string   `json:"complexity"`
	Comparison   string   `json:"comparison"`
}

var verdicts = map[string]string{
	"strong-hire": "сильный кандидат",
	"hire":        "наём",
	"lean-hire":   "наём с оговорками",
	"no-hire":     "не наём",
}

const systemPrompt = `Ты — опытный технический интервьюер на JS/TS-собеседовании (senior-уровень). Кандидат работал над задачей тренажёра и просит разобрать его код — как это было бы на реальном собеседовании.

Правила разбора:
1. Оцени код как на реальном собесе: корректность, асимптотика (время и память в О-нотации), читаемость, идиоматичность TypeScript, обработка краевых случаев.
2. Будь честным, но конструктивным: сначала сильные стороны, потом что улучшить — конкретно, с указанием на места в коде.
3. Сравни подход кандидата с эталонным решением: тот же путь? есть ли проще/быстрее? (эталон ниже — открыто сравнивай, кандидат уже видел решение на вкладке).
4. Если тесты не пройдены — вердикт no-hire и главное внимание тому, что именно не работает.
5. questions — 2–3 follow-up вопроса, которые ты задал бы кандидату на реальном собесе ПОСЛЕ этого решения.
6. Пиши на русском, кратко и по делу. answers не выдумывай — только то, что видно из кода.

Формат ответа — строго JSON, без текста вне JSON:
{
  "verdict": "strong-hire | hire | lean-hire | no-hire",
  "summary": "общее впечатление, 2–3 предложения",
  "strengths": ["что сделано хорошо"],
  "improvements": ["что улучшить — конкретно"],
  "questions": ["follow-up вопросы собеседующего"],
  "complexity": "оценка асимптотики решения кандидата, например: O(n) время, O(1) память",
  "comparison": "сравнение с эталонным решением"
}`

// Ask возвращает ИИ-ревью кода пользователя по задаче.
func (s *Service) Ask(ctx context.Context, req Request) (*Response, error) {
	task, ok := s.Tasks.GetTask(req.TaskID)
	if !ok {
		return nil, fmt.Errorf("задача не найдена")
	}

	// Прогоняем код: ревью знает, пройдены тесты или нет.
	run := s.Run.Run(ctx, task, req.Code)

	if s.Mock {
		return mockReview(run), nil
	}

	user := buildUserPrompt(task, req.Code, run)
	raw, err := s.LLM.ChatRaw(ctx, systemPrompt, user)
	if err != nil {
		return nil, fmt.Errorf("%s", proposal.FriendlyLLMError(err))
	}
	data, err := proposal.ParseJSONContent(raw)
	if err != nil {
		return nil, fmt.Errorf("парсинг ответа ИИ: %w", err)
	}
	res := &Response{}
	if err := json.Unmarshal(data, res); err != nil {
		return nil, fmt.Errorf("невалидный JSON от ИИ: %w", err)
	}
	if _, ok := verdicts[res.Verdict]; !ok {
		res.Verdict = "hire"
	}
	if res.Summary == "" {
		return nil, fmt.Errorf("ИИ вернул пустое ревью")
	}
	return res, nil
}

func buildUserPrompt(task domain.TaskFull, code string, run domain.RunResult) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "# Задача: %s\n\n%s\n\n", task.Title, task.Condition)
	// 4 обратных апострофа: код пользователя может содержать ``` и «закрыть»
	// обычный фенс — это открыло бы prompt injection в системный промпт.
	fmt.Fprintf(&sb, "# Код кандидата\n````ts\n%s\n````\n\n", code)
	fmt.Fprintf(&sb, "# Результат запуска тестов\n%s\n\n", hint.RunSummary(run))
	fmt.Fprintf(&sb, "# Эталонное решение\n```ts\n%s\n```\n\n", task.Solution)
	sb.WriteString("Разбери код кандидата и верни JSON по схеме.")
	return sb.String()
}

// VerdictLabel — человекочитаемый ярлык вердикта.
func VerdictLabel(v string) string {
	if label, ok := verdicts[v]; ok {
		return label
	}
	return v
}

func mockReview(run domain.RunResult) *Response {
	if run.Failed > 0 || run.Total == 0 {
		return &Response{
			Verdict:      "no-hire",
			Summary:      "[мок-ревью] Решение не проходит тесты — на собеседовании это прежде всего повод разобраться, где ломается логика.",
			Strengths:    []string{"код в целом читаемый"},
			Improvements: []string{"проверь проваливающиеся тесты", "обработай краевые случаи"},
			Questions:    []string{"как ты сам проверял решение перед запуском тестов?"},
			Complexity:   "O(?)",
			Comparison:   "пока не сравнить — решение некорректно",
		}
	}
	return &Response{
		Verdict:      "hire",
		Summary:      "[мок-ревью] Решение корректно проходит все тесты и выглядит рабочим — на собеседовании за это бы зачли, но обсудили бы детали.",
		Strengths:    []string{"все тесты пройдены", "понятная структура кода"},
		Improvements: []string{"можно упростить читаемость", "подумать об асимптотике"},
		Questions:    []string{"какова сложность твоего решения?", "как поведёт себя код на больших входах?"},
		Complexity:   "O(n) время, O(1) память (мок-оценка)",
		Comparison:   "подход похож на эталонный; различия обсудил бы интервьюер",
	}
}
