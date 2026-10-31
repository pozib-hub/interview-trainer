package verify

import (
	"context"
	"strings"
	"testing"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type fakeLLM struct {
	response string
	err      error
}

func (f *fakeLLM) ChatRaw(ctx context.Context, system, user string) (string, error) {
	if f.err != nil {
		return "", f.err
	}
	return f.response, nil
}

var sampleTask = domain.TaskFull{
	TaskSummary: domain.TaskSummary{
		ID:         "algorithms/020-two-sum",
		Topic:      "algorithms",
		Slug:       "two-sum",
		Title:      "Двухсумма",
		Difficulty: "easy",
		Tags:       []string{"algorithms", "hash-map"},
		Language:   "typescript",
	},
	Condition: "Дан массив и target, вернуть индексы.",
	Template:  "export function twoSum() {}",
	Solution:  "export function twoSum() { return [0, 1]; }",
	Hints:     []string{"Используйте хеш-таблицу"},
	TestFile:  "import { test } from 'vitest';",
}

func TestRunAIReview_OK(t *testing.T) {
	llm := &fakeLLM{response: `{"ok": true, "summary": "Всё согласовано", "problems": []}`}
	review, err := RunAIReview(context.Background(), llm, sampleTask, "4/4 пройдено", "0/4 пройдено")
	if err != nil {
		t.Fatal(err)
	}
	if !review.OK || review.Summary != "Всё согласовано" {
		t.Errorf("неожиданный результат: %+v", review)
	}
	if review.HasErrors() {
		t.Error("ok-ревью не должно содержать ошибок")
	}
}

func TestRunAIReview_FencedJSON(t *testing.T) {
	llm := &fakeLLM{response: "Вот ответ:\n```json\n{\"ok\": false, \"summary\": \"Несоответствие\", \"problems\": [{\"severity\": \"error\", \"area\": \"condition\", \"message\": \"Тесты проверяют другое\"}]}\n```\nСпасибо"}
	review, err := RunAIReview(context.Background(), llm, sampleTask, "0/4", "0/4")
	if err != nil {
		t.Fatal(err)
	}
	if review.OK {
		t.Error("ревью должно быть не ok")
	}
	if !review.HasErrors() {
		t.Error("error-severity должен считаться ошибкой")
	}
}

func TestRunAIReview_WarningsOnly(t *testing.T) {
	llm := &fakeLLM{response: `{"ok": false, "summary": "Мелкие замечания", "problems": [{"severity": "warning", "area": "hints", "message": "Подсказка 1 выдаёт решение"}]}`}
	review, err := RunAIReview(context.Background(), llm, sampleTask, "4/4", "0/4")
	if err != nil {
		t.Fatal(err)
	}
	if review.HasErrors() {
		t.Error("warning не должен валить проверку")
	}
}

func TestRunAIReview_InvalidJSON(t *testing.T) {
	llm := &fakeLLM{response: "не json"}
	if _, err := RunAIReview(context.Background(), llm, sampleTask, "", ""); err == nil {
		t.Error("битый JSON должен давать ошибку")
	}
}

func TestAIReviewUserPrompt_ContainsAllFiles(t *testing.T) {
	prompt := buildAIReviewUserPrompt(sampleTask, "4/4 пройдено", "0/4 пройдено")
	for _, want := range []string{"meta.json", "condition.md", "template.ts", "solution.ts", "tests/test.ts", "hints.md", "4/4 пройдено", "two-sum", "hash-map"} {
		if !strings.Contains(prompt, want) {
			t.Errorf("промпт не содержит %q", want)
		}
	}
}

func TestReport_AIPanels(t *testing.T) {
	report := Report([]CheckResult{
		{
			TaskID: "algorithms/020-two-sum", OK: true,
			SolutionText: "4/4", TemplateText: "0/4",
			AI: &AIReview{OK: true, Summary: "Всё согласовано"},
		},
		{
			TaskID: "array/001-bad", OK: false,
			SolutionText: "0/4", TemplateText: "0/4",
			Errors: []string{"🤖 ИИ-ревью [condition]: Условие противоречит тестам"},
			AI: &AIReview{
				OK:      false,
				Summary: "Есть ошибки",
				Problems: []AIProblem{
					{Severity: "error", Area: "condition", Message: "Условие противоречит тестам"},
					{Severity: "warning", Area: "hints", Message: "Подсказка выдаёт решение"},
				},
			},
		},
		{
			TaskID: "other/003-x", OK: true,
			SolutionText: "2/2", TemplateText: "0/2",
			AIError: "llm: connection refused",
		},
	})
	for _, want := range []string{
		"🤖 ИИ-ревью: ✅ Всё согласовано",
		"❌ **[condition]** Условие противоречит тестам",
		"⚠️ **[hints]** Подсказка выдаёт решение",
		"⚠️ не выполнено (ошибка LLM: llm: connection refused)",
		"семантическое ИИ-ревью",
	} {
		if !strings.Contains(report, want) {
			t.Errorf("отчёт не содержит %q:\n%s", want, report)
		}
	}
}
