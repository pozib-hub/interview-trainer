package review

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
			ID: "algorithms/014-foo", Topic: "algorithms", Slug: "foo",
			Title: "Пары с суммой", Difficulty: "easy", Tags: []string{"algorithms"},
			Language: "typescript",
		},
		Condition: "Верни пары индексов.",
		Template:  "export function foo() {}",
		Solution:  "export function foo(a: number[]) { return a; }",
		Hints:     []string{"хеш-таблица"},
		TestFile:  "import { test } from 'vitest';",
	}
}

func TestAsk_MockPassed(t *testing.T) {
	s := &Service{Tasks: &fakeTasks{task: sampleTask()}, Run: &fakeRunner{result: domain.RunResult{Total: 4, Failed: 0}}, Mock: true}
	res, err := s.Ask(context.Background(), Request{TaskID: "algorithms/014-foo", Code: "x"})
	if err != nil {
		t.Fatal(err)
	}
	if res.Verdict != "hire" {
		t.Errorf("verdict = %q, хочет hire", res.Verdict)
	}
	if len(res.Strengths) == 0 || len(res.Questions) == 0 {
		t.Error("мок-ревью должно содержать сильные стороны и вопросы")
	}
}

func TestAsk_MockFailed(t *testing.T) {
	s := &Service{Tasks: &fakeTasks{task: sampleTask()}, Run: &fakeRunner{result: domain.RunResult{Total: 3, Failed: 2}}, Mock: true}
	res, err := s.Ask(context.Background(), Request{TaskID: "algorithms/014-foo", Code: "x"})
	if err != nil {
		t.Fatal(err)
	}
	if res.Verdict != "no-hire" {
		t.Errorf("непройденные тесты должны давать no-hire, получено %q", res.Verdict)
	}
}

func TestAsk_TaskNotFound(t *testing.T) {
	s := &Service{Tasks: &fakeTasks{task: sampleTask()}, Run: &fakeRunner{}, Mock: true}
	if _, err := s.Ask(context.Background(), Request{TaskID: "no/such"}); err == nil {
		t.Error("несуществующая задача должна давать ошибку")
	}
}

func TestVerdictLabel(t *testing.T) {
	if got := VerdictLabel("strong-hire"); got != "сильный кандидат" {
		t.Errorf("VerdictLabel(strong-hire) = %q", got)
	}
	if got := VerdictLabel("hire"); got != "наём" {
		t.Errorf("VerdictLabel(hire) = %q", got)
	}
}

func TestBuildUserPrompt(t *testing.T) {
	run := domain.RunResult{Total: 4, Failed: 0}
	prompt := buildUserPrompt(sampleTask(), "export function foo(a) { return a; }", run)
	for _, want := range []string{
		"# Задача: Пары с суммой",
		"# Код кандидата",
		"# Результат запуска тестов",
		"Все тесты пройдены: 4 из 4",
		"# Эталонное решение",
	} {
		if !strings.Contains(prompt, want) {
			t.Errorf("промпт не содержит %q", want)
		}
	}
}
