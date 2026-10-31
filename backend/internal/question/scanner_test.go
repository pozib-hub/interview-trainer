package question

import (
	"os"
	"path/filepath"
	"testing"
)

func TestSplitByQuestionHeadings(t *testing.T) {
	raw := "# Глава\n\nВступление.\n\n## Первый вопрос?\n\nОтвет 1.\n\n## Второй вопрос?\n\nОтвет 2 с кодом:\n\n```ts\n// ## не вопрос\nconst x = 1;\n```\n"
	segments := SplitByQuestionHeadings(raw)
	if len(segments) != 2 {
		t.Fatalf("segments = %d, want 2", len(segments))
	}
	if got := firstLine(segments[0]); got != "Первый вопрос?" {
		t.Errorf("segment[0] first line = %q", got)
	}
	if got := firstLine(segments[1]); got != "Второй вопрос?" {
		t.Errorf("segment[1] first line = %q", got)
	}
}

func TestParseChapterMarkdown(t *testing.T) {
	raw := "# Асинхронность\n\n## Что такое event loop?\n\nEvent loop — механизм.\n\n## Чем микрозадачи отличаются?\n\nМикрозадачи — колбэки промисов.\n"
	ch := ParseChapterMarkdown("frontend/javascript", "003-async-event-loop.md", raw)

	if ch.ID != "frontend/javascript/003-async-event-loop" {
		t.Fatalf("ID = %q", ch.ID)
	}
	if ch.Title != "Асинхронность" {
		t.Fatalf("Title = %q", ch.Title)
	}
	if len(ch.Questions) != 2 {
		t.Fatalf("questions = %d, want 2", len(ch.Questions))
	}
	if ch.Questions[0].ID != "frontend/javascript/003-async-event-loop/001" {
		t.Errorf("q[0].ID = %q", ch.Questions[0].ID)
	}
	if ch.Questions[0].Question != "Что такое event loop?" {
		t.Errorf("q[0].Question = %q", ch.Questions[0].Question)
	}
	if ch.Questions[1].Answer != "Микрозадачи — колбэки промисов." {
		t.Errorf("q[1].Answer = %q", ch.Questions[1].Answer)
	}
}

func TestScannerIndex(t *testing.T) {
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

	scanner := NewScanner(root)
	index := scanner.Index()

	if len(index.Directions) != 2 {
		t.Fatalf("directions = %d, want 2", len(index.Directions))
	}
	frontend := index.Directions[0]
	if frontend.ID != "frontend" || len(frontend.Technologies) != 1 {
		t.Fatalf("frontend = %+v", frontend)
	}
	if got := len(frontend.Technologies[0].Chapters[0].Questions); got != 1 {
		t.Errorf("tech questions = %d", got)
	}
	hr := index.Directions[1]
	if len(hr.Technologies) != 0 || len(hr.Chapters) != 1 {
		t.Fatalf("hr = %+v", hr)
	}
	if hr.Chapters[0].Questions[0].ID != "hr/001-about-me/001" {
		t.Errorf("hr q id = %q", hr.Chapters[0].Questions[0].ID)
	}
}

func firstLine(s string) string {
	for _, line := range splitLines(s) {
		if line != "" {
			return line
		}
	}
	return ""
}

func splitLines(s string) []string {
	var lines []string
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] == '\n' {
			lines = append(lines, s[start:i])
			start = i + 1
		}
	}
	lines = append(lines, s[start:])
	return lines
}
