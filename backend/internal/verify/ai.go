package verify

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
)

// LLMChat — минимальный интерфейс LLM для ИИ-ревью (реализация *proposal.LLMClient).
type LLMChat interface {
	ChatRaw(ctx context.Context, system, user string) (string, error)
}

// AIProblem — одна проблема, найденная ИИ-ревьюером.
type AIProblem struct {
	Severity string `json:"severity"` // "error" | "warning"
	Area     string `json:"area"`     // condition | tests | solution | hints | meta | other
	Message  string `json:"message"`
}

// AIReview — вердикт ИИ-ревью задачи.
type AIReview struct {
	OK       bool        `json:"ok"`
	Summary  string      `json:"summary"`
	Problems []AIProblem `json:"problems"`
}

// HasErrors — есть ли проблемы уровня error (валят проверку).
func (r *AIReview) HasErrors() bool {
	if r == nil {
		return false
	}
	for _, p := range r.Problems {
		if p.Severity == "error" {
			return true
		}
	}
	return false
}

const aiReviewSystemPrompt = `Ты — строгий ревьюер задач для тренажёра подготовки к JS/TS-собеседованиям.

Тебе дают файлы задачи (условие, шаблон, эталонное решение, тесты, подсказки, метаданные)
и результаты автоматических прогонов (vitest). Проверь, что задача создана ПРАВИЛЬНО:

1. **Условие ↔ тесты**: тесты проверяют именно то, что описано в условии —
   те же входы/выходы, те же крайние случаи. Нет тестов, проверяющих лишнее
   или противоречащее условию.
2. **Условие ↔ решение**: решение реализует то, что требует условие
   (а не какую-то другую задачу).
3. **Условие ↔ примеры**: примеры в условии согласованы с решением и тестами.
4. **Сложность**: difficulty (easy/medium/hard) адекватна содержанию.
5. **Подсказки**: полезные, по возрастанию раскрывающие, но НЕ выдают решение целиком.
6. **Стиль**: условие на русском, код на TypeScript, без console.log,
   тесты через test (не describe), импорт из "../solution".
7. **Осмысленность**: задача валидна как упражнение для собеседования,
   нет двусмысленностей, делающих её нерешаемой.

Формат ответа — строго JSON, без текста вне JSON:
{
  "ok": true,
  "summary": "краткое заключение на русском (1-2 предложения)",
  "problems": [
    { "severity": "error", "area": "condition", "message": "что не так и как исправить" }
  ]
}

Правила для problems:
- severity "error" — задача принимать нельзя (противоречия, нерешаемость, тесты не тому учат).
- severity "warning" — можно принять, но лучше поправить (стиль, формулировки, сложность).
- area — одно из: condition, tests, solution, hints, meta, other.
- Если всё хорошо: ok=true, problems=[].
- Не выдумывай проблемы: если сомневаешься — это warning или отсутствие проблемы.`

// RunAIReview отправляет задачу на семантическую проверку в LLM.
func RunAIReview(ctx context.Context, llm LLMChat, task domain.TaskFull, solutionText, templateText string) (*AIReview, error) {
	user := buildAIReviewUserPrompt(task, solutionText, templateText)
	raw, err := llm.ChatRaw(ctx, aiReviewSystemPrompt, user)
	if err != nil {
		return nil, fmt.Errorf("llm: %w", err)
	}
	data, err := proposal.ParseJSONContent(raw)
	if err != nil {
		return nil, fmt.Errorf("парсинг ответа ИИ: %w", err)
	}
	review := &AIReview{}
	if err := json.Unmarshal(data, review); err != nil {
		return nil, fmt.Errorf("невалидный JSON от ИИ: %w", err)
	}
	return review, nil
}

func buildAIReviewUserPrompt(task domain.TaskFull, solutionText, templateText string) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "# Задача `%s`\n\n", task.ID)
	fmt.Fprintf(&sb, "## meta.json\n```json\n%s\n```\n\n", metaSnippet(task))
	fmt.Fprintf(&sb, "## condition.md\n```markdown\n%s\n```\n\n", task.Condition)
	fmt.Fprintf(&sb, "## template.ts\n```ts\n%s\n```\n\n", task.Template)
	fmt.Fprintf(&sb, "## solution.ts (эталон)\n```ts\n%s\n```\n\n", task.Solution)
	fmt.Fprintf(&sb, "## tests/test.ts\n```ts\n%s\n```\n\n", task.TestFile)
	fmt.Fprintf(&sb, "## hints.md\n```markdown\n%s\n```\n\n", strings.Join(task.Hints, "\n\n"))
	fmt.Fprintf(&sb, "# Результаты автоматических прогонов\n")
	fmt.Fprintf(&sb, "- эталонное решение: %s\n", solutionText)
	fmt.Fprintf(&sb, "- шаблон: %s\n\n", templateText)
	fmt.Fprintf(&sb, "Проверь задачу по правилам и верни JSON.")
	return sb.String()
}

func metaSnippet(task domain.TaskFull) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, `{"title": %q, "difficulty": %q, "tags": [`, task.Title, string(task.Difficulty))
	for i, t := range task.Tags {
		if i > 0 {
			sb.WriteString(", ")
		}
		fmt.Fprintf(&sb, "%q", t)
	}
	fmt.Fprintf(&sb, `], "language": %q}`, string(task.Language))
	return sb.String()
}
