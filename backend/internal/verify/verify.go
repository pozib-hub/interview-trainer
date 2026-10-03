// Package verify проверяет задачи из PR: структура + реальный прогон
// решения и шаблона через vitest-раннер (тот же, что в бэкенде приложения).
package verify

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/runner"
)

// TaskSource — источник задач (реализация *scanner.Scanner).
type TaskSource interface {
	GetTask(id string) (domain.TaskFull, bool)
}

// Checker проверяет задачи.
type Checker struct {
	Source  TaskSource
	Runner  *runner.VitestRunner
	Timeout time.Duration
}

// oralTaskAllowlist — «устные» задачи: их шаблон проходит тесты by design
// (задача сводится к пояснению ответа, а не к реализации). Для них проверка
// «шаблон должен проваливаться» пропускается.
var oralTaskAllowlist = map[string]bool{
	"my/001-1":           true,
	"my/002-arr-to-obj":  true,
	"react/001-1":        true,
	"react/002-2":        true,
	"this/007-15":        true,
	"this/012-4":         true,
	"this/010-2":         true,
	"companies/001-1":    true,
	"companies/009-umschool": true,
}

type CheckResult struct {
	TaskID string
	OK     bool
	Errors []string
	// Детали прогонов.
	SolutionTotal int
	SolutionText  string
	TemplateTotal int
	TemplateText  string
	OralTask      bool
}

func NewChecker(source TaskSource, r *runner.VitestRunner, timeout time.Duration) *Checker {
	return &Checker{Source: source, Runner: r, Timeout: timeout}
}

// CheckAll проверяет задачи по списку ID и возвращает результаты.
func (c *Checker) CheckAll(ctx context.Context, ids []string) []CheckResult {
	results := make([]CheckResult, 0, len(ids))
	for _, id := range ids {
		results = append(results, c.check(ctx, id))
	}
	return results
}

func (c *Checker) check(ctx context.Context, id string) CheckResult {
	res := CheckResult{TaskID: id, OK: true}

	task, ok := c.Source.GetTask(id)
	if !ok {
		res.OK = false
		res.Errors = append(res.Errors, "задача не найдена сканером (проверьте структуру каталога и meta.json)")
		return res
	}

	// ── Структура и метаданные ─────────────────────────────────────────────
	if task.Title == "" {
		res.Errors = append(res.Errors, "meta.json: пустой title")
	}
	if task.Difficulty != domain.DifficultyEasy && task.Difficulty != domain.DifficultyMedium && task.Difficulty != domain.DifficultyHard {
		res.Errors = append(res.Errors, fmt.Sprintf("meta.json: difficulty должен быть easy|medium|hard (получено %q)", string(task.Difficulty)))
	}
	switch task.Language {
	case domain.LanguageTypeScript, domain.LanguageTypeScriptReact, domain.LanguageJavaScript:
	default:
		res.Errors = append(res.Errors, fmt.Sprintf("meta.json: неизвестный language %q", string(task.Language)))
	}
	if len(task.Tags) == 0 {
		res.Errors = append(res.Errors, "meta.json: пустой tags")
	}
	if strings.TrimSpace(task.Condition) == "" {
		res.Errors = append(res.Errors, "condition.md пуст")
	}
	if len(task.Hints) == 0 {
		res.Errors = append(res.Errors, "hints.md: нет ни одной подсказки")
	}
	if strings.TrimSpace(task.TestFile) == "" {
		res.Errors = append(res.Errors, "тесты отсутствуют (tests/test.ts)")
	}
	if strings.TrimSpace(task.Template) == "" {
		res.Errors = append(res.Errors, "template.ts пуст")
	}

	// ── Эталонное решение должно проходить все тесты ──────────────────────
	sol := c.runTask(ctx, task, task.Solution)
	res.SolutionTotal = sol.Total
	if sol.Total == 0 {
		res.Errors = append(res.Errors, "эталонное решение: тесты не запустились (ошибка компиляции?)\n"+firstLines(sol.Stderr, 6))
	} else if !sol.Passed {
		res.Errors = append(res.Errors, fmt.Sprintf("эталонное решение провалило %d из %d тестов", sol.Failed, sol.Total))
		for _, a := range sol.Assertions {
			if !a.Passed {
				res.Errors = append(res.Errors, fmt.Sprintf("  ✗ %s: %s", a.Name, firstLine(a.Message)))
			}
		}
	}

	// ── Шаблон должен запускаться и НЕ проходить тесты ────────────────────
	tmpl := c.runTask(ctx, task, task.Template)
	res.TemplateTotal = tmpl.Total
	if tmpl.Total == 0 {
		res.Errors = append(res.Errors, "шаблон: тесты не запустились (вероятно, синтаксическая ошибка в template.ts)\n"+firstLines(tmpl.Stderr, 6))
	} else if tmpl.Passed && !oralTaskAllowlist[id] {
		res.Errors = append(res.Errors, fmt.Sprintf("шаблон проходит все %d тестов — задача решается заглушкой без реализации", tmpl.Total))
	}

	res.OK = len(res.Errors) == 0
	res.SolutionText = fmt.Sprintf("%d/%d", sol.Total-sol.Failed, sol.Total)
	res.TemplateText = fmt.Sprintf("%d/%d", tmpl.Total-tmpl.Failed, tmpl.Total)
	res.OralTask = oralTaskAllowlist[id]
	return res
}

func (c *Checker) runTask(ctx context.Context, task domain.TaskFull, code string) domain.RunResult {
	runCtx, cancel := context.WithTimeout(ctx, c.Timeout)
	defer cancel()
	return c.Runner.Run(runCtx, task, code)
}

// Report собирает markdown-отчёт для комментария в PR.
func Report(results []CheckResult) string {
	if len(results) == 0 {
		return "🤖 Изменённые задачи не найдены — проверять нечего."
	}

	allOK := true
	for _, r := range results {
		allOK = allOK && r.OK
	}

	var sb strings.Builder
	if allOK {
		fmt.Fprintf(&sb, "## ✅ Проверка задач пройдена\n\n")
	} else {
		fmt.Fprintf(&sb, "## ❌ Проверка задач не пройдена\n\n")
	}
	fmt.Fprintf(&sb, "Проверено автоматически: структура файлов, метаданные, эталонное решение и шаблон (vitest).\n\n")

	for _, r := range results {
		if r.OK {
			fmt.Fprintf(&sb, "### ✅ `%s`\n\n", r.TaskID)
			fmt.Fprintf(&sb, "- эталонное решение: %s тестов\n", r.SolutionText)
			if r.OralTask {
				fmt.Fprintf(&sb, "- шаблон: %s тестов (устная задача — шаблон равен решению by design)\n\n", r.TemplateText)
			} else {
				fmt.Fprintf(&sb, "- шаблон: %s тестов (должен проваливаться)\n\n", r.TemplateText)
			}
			continue
		}
		fmt.Fprintf(&sb, "### ❌ `%s`\n\n", r.TaskID)
		for _, e := range r.Errors {
			fmt.Fprintf(&sb, "- %s\n", e)
		}
		sb.WriteString("\n")
	}
	return sb.String()
}

func firstLine(s string) string {
	if i := strings.IndexByte(s, '\n'); i > 0 {
		return strings.TrimSpace(s[:i])
	}
	return strings.TrimSpace(s)
}

func firstLines(s string, n int) string {
	if s == "" {
		return ""
	}
	lines := strings.Split(strings.TrimRight(s, "\n"), "\n")
	if len(lines) > n {
		lines = append(lines[:n], "…")
	}
	return "```\n" + strings.Join(lines, "\n") + "\n```"
}
