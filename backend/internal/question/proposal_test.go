package question

import (
	"context"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func newTestTree(t *testing.T) (*Scanner, string) {
	t.Helper()
	root := t.TempDir()
	write := func(rel, content string) {
		abs := filepath.Join(root, rel)
		if err := os.MkdirAll(filepath.Dir(abs), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(abs, []byte(content), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	write("frontend/meta.json", `{"title":"Frontend","order":1}`)
	write("frontend/javascript/meta.json", `{"title":"JavaScript","order":1}`)
	write("frontend/javascript/chapters/001-basics.md", "# Основы\n\n## Что такое var?\n\nОтвет.\n")
	write("hr/meta.json", `{"title":"HR","order":4}`)
	write("hr/chapters/001-about-me.md", "# О себе\n\n## Расскажите о себе?\n\nОтвет.\n")
	return NewScanner(root), root
}

func TestProposalValidatePayload(t *testing.T) {
	scanner, _ := newTestTree(t)
	index := scanner.Index()

	good := llmPayload{
		Direction:  "frontend",
		Technology: "frontend/javascript",
		Chapter:    "001-basics",
		Question:   "Что такое let?",
		Answer:     "Блочная переменная.",
	}
	if errs := validatePayload(index, good); len(errs) > 0 {
		t.Fatalf("good payload errors: %v", errs)
	}

	bad := llmPayload{Direction: "frontend", Question: "Что такое let?", Answer: "x"}
	if errs := validatePayload(index, bad); len(errs) == 0 {
		t.Fatal("expected error: no technology for frontend")
	}

	dup := llmPayload{
		Direction:  "frontend",
		Technology: "frontend/javascript",
		Chapter:    "001-basics",
		Question:   "Что такое VAR?",
		Answer:     "Ответ.",
	}
	if errs := validatePayload(index, dup); len(errs) == 0 {
		t.Fatal("expected duplicate error")
	}

	headings := llmPayload{
		Direction:  "frontend",
		Technology: "frontend/javascript",
		Chapter:    "001-basics",
		Question:   "Что такое const?",
		Answer:     "## Константа\nОтвет.",
	}
	if errs := validatePayload(index, headings); len(errs) == 0 {
		t.Fatal("expected forbidden heading error")
	}

	codeOK := llmPayload{
		Direction:  "frontend",
		Technology: "frontend/javascript",
		Chapter:    "001-basics",
		Question:   "Что такое const?",
		Answer:     "Константа.\n\n```ts\n// ## не заголовок\nconst x = 1;\n```\n",
	}
	if errs := validatePayload(index, codeOK); len(errs) > 0 {
		t.Fatalf("code block payload errors: %v", errs)
	}

	newTechNoTitle := llmPayload{Direction: "frontend", Technology: "vue", Question: "Что такое Vue?", Answer: "Фреймворк."}
	if errs := validatePayload(index, newTechNoTitle); len(errs) == 0 {
		t.Fatal("expected technologyTitle required error")
	}

	hr := llmPayload{Direction: "hr", Chapter: "001-about-me", Question: "Кем видите себя через год?", Answer: "Ответ."}
	if errs := validatePayload(index, hr); len(errs) > 0 {
		t.Fatalf("hr payload errors: %v", errs)
	}
}

func TestProposalDryRunMock(t *testing.T) {
	scanner, _ := newTestTree(t)
	svc := &ProposalService{
		Scanner:    scanner,
		BaseBranch: "main",
		DryRun:     true,
		Mock:       true,
		MaxRetries: 1,
	}

	res, err := svc.Propose(context.Background(), ProposalRequest{
		Question:   "Что такое замыкание?",
		UserAnswer: "Функция с запомненным окружением.",
		Direction:  "frontend",
	})
	if err != nil {
		t.Fatalf("Propose: %v", err)
	}
	if !res.DryRun {
		t.Fatal("expected dry run")
	}
	if res.PRURL != "" {
		t.Fatalf("dry run must not create PR, got %q", res.PRURL)
	}
	if !strings.HasPrefix(res.Branch, "question/") {
		t.Fatalf("branch = %q", res.Branch)
	}
	if res.Question != "Что такое замыкание?" {
		t.Fatalf("question = %q", res.Question)
	}
	if res.Answer != "Функция с запомненным окружением." {
		t.Fatalf("answer = %q", res.Answer)
	}
	if !strings.HasPrefix(res.File, "frontend/") || !strings.HasSuffix(res.File, ".md") {
		t.Fatalf("file = %q", res.File)
	}
}

func TestProposalEmptyQuestion(t *testing.T) {
	scanner, _ := newTestTree(t)
	svc := &ProposalService{Scanner: scanner, Mock: true, DryRun: true}
	if _, err := svc.Propose(context.Background(), ProposalRequest{}); err == nil {
		t.Fatal("expected error for empty question")
	}
}
