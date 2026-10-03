package proposal

import (
	"encoding/json"
	"os"
	"path/filepath"
	"strings"
	"testing"
	"time"
)

var mockTopics = []string{"algorithms", "array", "other", "sorts"}

func TestValidateTask_MockValid(t *testing.T) {
	task := mockTask()
	if errs := ValidateTask(task, mockTopics, ""); len(errs) != 0 {
		t.Fatalf("мок-задача должна быть валидна, ошибки: %v", errs)
	}
}

func TestValidateTask_Errors(t *testing.T) {
	task := mockTask()
	task.Topic = "not-a-topic"
	task.Tags = []string{"wrong-topic"}
	task.Slug = "Bad Slug!"
	task.Exports = nil
	errs := ValidateTask(task, mockTopics, "")
	joined := strings.Join(errs, "\n")
	for _, want := range []string{"не входит в список разрешённых", "slug должен быть kebab-case", "Первый тег должен совпадать", "exports должен содержать ровно одно"} {
		if !strings.Contains(joined, want) {
			t.Errorf("ожидалась ошибка %q, получено: %s", want, joined)
		}
	}
}

func TestValidateTask_TestCodeContract(t *testing.T) {
	task := mockTask()
	task.TestCode = `import { describe } from "vitest";
import { digitSum } from "./wrong-path";
describe("x", () => {});`
	errs := ValidateTask(task, mockTopics, "")
	joined := strings.Join(errs, "\n")
	if !strings.Contains(joined, "../solution") {
		t.Errorf("должна быть ошибка импорта ../solution: %s", joined)
	}
	if !strings.Contains(joined, "describe") {
		t.Errorf("должна быть ошибка describe: %s", joined)
	}
}

func TestValidateTask_SlugExists(t *testing.T) {
	dir := t.TempDir()
	if err := os.MkdirAll(filepath.Join(dir, "algorithms", "001-digit-sum"), 0o755); err != nil {
		t.Fatal(err)
	}
	errs := ValidateTask(mockTask(), mockTopics, dir)
	if len(errs) == 0 || !strings.Contains(errs[0], "уже существует") {
		t.Fatalf("ожидалась ошибка занятого slug, получено: %v", errs)
	}
}

func TestBuildFileContents(t *testing.T) {
	task := mockTask()
	task.Examples = []string{"digitSum(12) => 3", " "}
	task.Constraints = []string{"0 <= n <= 10^9"}
	files := BuildFileContents(task)

	var meta map[string]any
	if err := json.Unmarshal([]byte(files.MetaJSON), &meta); err != nil {
		t.Fatalf("meta.json невалиден: %v", err)
	}
	if meta["title"] != task.Title || meta["language"] != "typescript" {
		t.Errorf("meta.json не совпадает: %s", files.MetaJSON)
	}

	if !strings.HasPrefix(files.Condition, "# "+task.Title) {
		t.Errorf("condition должен начинаться с заголовка: %q", files.Condition[:40])
	}
	if !strings.Contains(files.Condition, "## Примеры") || !strings.Contains(files.Condition, "digitSum(12) => 3") {
		t.Error("condition должен содержать непустые примеры")
	}
	if !strings.Contains(files.Condition, "## Ограничения") || !strings.Contains(files.Condition, "0 <= n <= 10^9") {
		t.Error("condition должен содержать ограничения")
	}
	if strings.Count(files.Hints, "## Подсказка") != 2 {
		t.Errorf("hints должен содержать 2 подсказки: %s", files.Hints)
	}
	for _, content := range []string{files.Template, files.Solution, files.Test} {
		if !strings.HasSuffix(content, "\n") {
			t.Error("файлы должны заканчиваться переводом строки")
		}
	}
}

func TestNextTaskNumber(t *testing.T) {
	dir := t.TempDir()
	if err := os.MkdirAll(filepath.Join(dir, "algorithms", "009-foo"), 0o755); err != nil {
		t.Fatal(err)
	}
	if err := os.MkdirAll(filepath.Join(dir, "algorithms", "010-bar"), 0o755); err != nil {
		t.Fatal(err)
	}
	if got := NextTaskNumber(dir, "algorithms"); got != "011" {
		t.Errorf("NextTaskNumber = %q, хочу 011", got)
	}
	if got := NextTaskNumber(dir, "new-topic"); got != "001" {
		t.Errorf("NextTaskNumber для новой темы = %q, хочу 001", got)
	}
}

func TestParseJSONContent(t *testing.T) {
	cases := []struct {
		name, in string
		wantErr  bool
	}{
		{"plain", `{"a":1}`, false},
		{"fenced", "```json\n{\"a\":2}\n```", false},
		{"prose", "Вот ответ:\n{\"a\":3}\nГотово.", false},
		{"invalid", "не json вообще", true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			data, err := ParseJSONContent(tc.in)
			if tc.wantErr != (err != nil) {
				t.Fatalf("ParseJSONContent(%q) err=%v, wantErr=%v", tc.in, err, tc.wantErr)
			}
			if err == nil {
				var m map[string]any
				if err := json.Unmarshal(data, &m); err != nil {
					t.Fatalf("результат не JSON: %v", err)
				}
			}
		})
	}
}

func TestBuildUserMessage(t *testing.T) {
	msg := BuildUserMessage(Input{
		Title:       "Двухсумма",
		SourceURL:   "https://leetcode.com/problems/two-sum/",
		Description: "Найти индексы двух чисел, дающих target",
		UserSolution: "export function twoSum() {}",
		Notes:        "нужен O(n)",
	})
	for _, want := range []string{"Заголовок: Двухсумма", "URL источника", "Описание задачи", "Решение пользователя", "Дополнительные заметки"} {
		if !strings.Contains(msg, want) {
			t.Errorf("user message не содержит %q", want)
		}
	}
}

func TestBuildSystemMessage_ContainsCategoriesAndSchema(t *testing.T) {
	dir := t.TempDir()
	for _, topic := range mockTopics {
		if err := os.MkdirAll(filepath.Join(dir, topic), 0o755); err != nil {
			t.Fatal(err)
		}
	}
	msg := BuildSystemMessage(dir, map[string]int{"algorithms": 10})
	for _, want := range []string{"Разрешённые категории", "algorithms", "JSON Schema", "Критические правила"} {
		if !strings.Contains(msg, want) {
			t.Errorf("system message не содержит %q", want)
		}
	}
}

func TestPRBody(t *testing.T) {
	res := &Result{
		TaskID: "algorithms/220-digit-sum",
		Title:  "Сумма цифр",
		Topic:  "algorithms",
		Slug:   "digit-sum",
		Files:  BuildFileContents(mockTask()),
		SelfCheck: SelfCheck{Passed: true, Total: 3},
	}
	body := PRBody(res)
	for _, want := range []string{"algorithms/220-digit-sum", "✅ пройдена (3 тестов)", "<details><summary>meta.json</summary>", "<details><summary>solution.ts</summary>"} {
		if !strings.Contains(body, want) {
			t.Errorf("PR body не содержит %q", want)
		}
	}
}

func TestLLMClient_TrimsBaseURL(t *testing.T) {
	c := NewLLMClient("https://api.example.com/v1///", "model", "key", time.Second, 2)
	if c.BaseURL != "https://api.example.com/v1" {
		t.Errorf("BaseURL не обрезан: %q", c.BaseURL)
	}
	if c.Model != "model" {
		t.Errorf("Model не сохранён: %q", c.Model)
	}
}

func TestValidateInput(t *testing.T) {
	s := NewService(Options{})
	if err := s.ValidateInput(Input{}); err == nil || !strings.Contains(err.Error(), "обязательно") {
		t.Errorf("пустое описание должно давать ошибку валидации, получено: %v", err)
	}
	if err := s.ValidateInput(Input{Description: "задача"}); err != nil {
		t.Errorf("валидный ввод не должен давать ошибку: %v", err)
	}
}
