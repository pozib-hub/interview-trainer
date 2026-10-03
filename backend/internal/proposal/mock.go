package proposal

import (
	"context"
	"encoding/json"
)

// MockLLM возвращает заранее заготовленную валидную задачу.
// Используется в dev-окружении без доступа к внешнему LLM (LLM_MOCK=true).
type MockLLM struct {
	Calls    int
	FirstBad bool // если true — первый ответ невалиден (для тестов retry-логики)
}

func (m *MockLLM) Chat(ctx context.Context, messages []llmMessage) (string, error) {
	m.Calls++
	var task *GeneratedTask
	if m.FirstBad && m.Calls == 1 {
		task = &GeneratedTask{Title: "плохой ответ"}
	} else {
		task = mockTask()
	}
	b, err := json.Marshal(task)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

// mockTask — простая задача «сумма цифр числа», отсутствующая в репозитории.
func mockTask() *GeneratedTask {
	return &GeneratedTask{
		Title:      "Сумма цифр числа",
		Topic:      "algorithms",
		Slug:       "digit-sum",
		Difficulty: "easy",
		Tags:       []string{"algorithms", "math"},
		Language:   "typescript",
		Exports:    []string{"digitSum"},
		Condition:  "Дано целое неотрицательное число. Верните сумму его цифр.",
		Examples: []string{
			"digitSum(12345) => 15",
			"digitSum(0) => 0",
		},
		Constraints: []string{},
		TemplateCode: `export function digitSum(n: number): number {
  // TODO: реализуйте
  return undefined as any;
}`,
		SolutionCode: `export function digitSum(n: number): number {
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}`,
		TestCode: `import { test, expect } from "vitest";
import { digitSum } from "../solution";

test("сумма цифр", () => {
  expect(digitSum(12345)).toBe(15);
});

test("одна цифра", () => {
  expect(digitSum(7)).toBe(7);
});

test("ноль", () => {
  expect(digitSum(0)).toBe(0);
});`,
		Hints: []string{
			"Разбирайте число на цифры через остаток от деления на 10.",
			"Не забудьте про случай нуля.",
		},
		Source: nil,
	}
}
