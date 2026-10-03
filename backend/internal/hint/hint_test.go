package hint

import (
	"context"
	"strings"
	"testing"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type fakeTasks struct{ task domain.TaskFull }

func (f *fakeTasks) GetTask(id string) (domain.TaskFull, bool) {
	return f.task, f.task.ID == id
}

type fakeRunner struct{ result domain.RunResult }

func (f *fakeRunner) Run(ctx context.Context, task domain.TaskFull, code string) domain.RunResult {
	return f.result
}

func sampleTask() domain.TaskFull {
	return domain.TaskFull{
		TaskSummary: domain.TaskSummary{
			ID: "algorithms/010-fibonacci", Topic: "algorithms", Slug: "fibonacci",
			Title: "Фибоначчи", Difficulty: "easy", Tags: []string{"algorithms"},
			Language: "typescript",
		},
		Condition: "Верни n-е число Фибоначчи.",
		Template:  "export function fib(n: number): number { return undefined as any; }",
		Solution:  "export function fib(n: number): number { return n <= 1 ? n : fib(n - 1) + fib(n - 2); }",
		Hints:     []string{"рекурсия", "мемоизация"},
		TestFile:  "import { test } from 'vitest';",
	}
}

func TestAsk_MockEscalates(t *testing.T) {
	s := &Service{Tasks: &fakeTasks{task: sampleTask()}, Run: &fakeRunner{}, Mock: true}

	r1, err := s.Ask(context.Background(), Request{TaskID: "algorithms/010-fibonacci", Code: "x"})
	if err != nil {
		t.Fatal(err)
	}
	r2, err := s.Ask(context.Background(), Request{
		TaskID: "algorithms/010-fibonacci", Code: "x",
		PreviousHints: []string{r1.Hint},
	})
	if err != nil {
		t.Fatal(err)
	}
	if r1.Hint == r2.Hint {
		t.Error("вторая подсказка не должна повторять первую")
	}
	if !strings.Contains(r1.Hint, "#1") || !strings.Contains(r2.Hint, "#2") {
		t.Errorf("мок должен нумеровать подсказки: %q / %q", r1.Hint, r2.Hint)
	}
}

func TestAsk_TaskNotFound(t *testing.T) {
	s := &Service{Tasks: &fakeTasks{task: sampleTask()}, Run: &fakeRunner{}, Mock: true}
	if _, err := s.Ask(context.Background(), Request{TaskID: "no/such"}); err == nil {
		t.Error("несуществующая задача должна давать ошибку")
	}
}

func TestRunSummary(t *testing.T) {
	cases := []struct {
		name string
		run  domain.RunResult
		want string
	}{
		{"все прошли", domain.RunResult{Total: 4, Failed: 0}, "Все тесты пройдены: 4 из 4."},
		{"ничего не запустилось", domain.RunResult{Total: 0, Stderr: "boom"}, "Тесты не запустились"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := RunSummary(tc.run)
			if !strings.Contains(got, tc.want) {
				t.Errorf("RunSummary = %q, хочет %q", got, tc.want)
			}
		})
	}

	run := domain.RunResult{
		Total: 3, Failed: 2,
		Assertions: []domain.TestAssertion{
			{Name: "базовый", Passed: true},
			{Name: "крайний", Passed: false, Message: "AssertionError: expected 5\nto be 6"},
			{Name: "ноль", Passed: false, Message: "AssertionError: boom"},
		},
	}
	got := RunSummary(run)
	for _, want := range []string{"Пройдено 1 из 3", "«крайний»: AssertionError: expected 5", "«ноль»: AssertionError: boom"} {
		if !strings.Contains(got, want) {
			t.Errorf("RunSummary не содержит %q: %s", want, got)
		}
	}
}

func TestBuildUserPrompt(t *testing.T) {
	task := sampleTask()
	run := domain.RunResult{Total: 2, Failed: 1, Assertions: []domain.TestAssertion{
		{Name: "базовый", Passed: false, Message: "AssertionError: x"},
	}}
	prompt := buildUserPrompt(task, "export function fib(n) { return 0; }", run, []string{"подумай о рекурсии"})
	for _, want := range []string{
		"# Задача: Фибоначчи",
		"Код пользователя",
		"return 0",
		"Пройдено 1 из 2",
		"«базовый»: AssertionError: x",
		"Эталонное решение",
		"НИКОГДА не выдавай",
		"1. подумай о рекурсии",
		"Дай следующую подсказку",
	} {
		if !strings.Contains(prompt, want) {
			t.Errorf("промпт не содержит %q", want)
		}
	}
}
