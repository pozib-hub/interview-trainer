package proposal

import (
	"fmt"
	"net/url"
	"os"
	"path/filepath"
	"regexp"
	"strings"
)

var (
	kebabRe    = regexp.MustCompile(`^[a-z][a-z0-9-]*$`)
	difficulty = map[string]bool{"easy": true, "medium": true, "hard": true}
)

// ValidateTask проверяет сгенерированную задачу. Возвращает список ошибок
// (пустой = валидна). Список ошибок отправляется обратно в LLM для исправления.
func ValidateTask(t *GeneratedTask, allowedTopics []string, tasksRoot string) []string {
	var errors []string
	if t == nil {
		return []string{"Ожидается JSON-объект."}
	}

	// topic
	if !kebabRe.MatchString(t.Topic) {
		errors = append(errors, fmt.Sprintf("topic должен быть kebab-case (получено %q).", t.Topic))
	} else if !contains(allowedTopics, t.Topic) {
		errors = append(errors, fmt.Sprintf("topic %q не входит в список разрешённых категорий: %s.", t.Topic, strings.Join(allowedTopics, ", ")))
	}

	// slug
	if !kebabRe.MatchString(t.Slug) || len(t.Slug) < 2 || len(t.Slug) > 60 {
		errors = append(errors, fmt.Sprintf("slug должен быть kebab-case строкой 2–60 символов (получено %q).", t.Slug))
	} else if tasksRoot != "" && slugExists(tasksRoot, t.Topic, t.Slug) {
		errors = append(errors, fmt.Sprintf("slug %q уже существует в категории %q — выбери уникальный slug.", t.Slug, t.Topic))
	}

	// title
	if len([]rune(t.Title)) < 3 || len([]rune(t.Title)) > 120 {
		errors = append(errors, "title должен быть строкой 3–120 символов.")
	}

	// difficulty
	if !difficulty[t.Difficulty] {
		errors = append(errors, fmt.Sprintf("difficulty должен быть easy|medium|hard (получено %q).", t.Difficulty))
	}

	// tags
	if len(t.Tags) < 1 || len(t.Tags) > 8 {
		errors = append(errors, "tags должен быть непустым массивом (1–8 элементов).")
	} else {
		for _, tag := range t.Tags {
			if !kebabRe.MatchString(tag) {
				errors = append(errors, fmt.Sprintf("тег %q не kebab-case.", tag))
			}
		}
		if t.Tags[0] != t.Topic {
			errors = append(errors, fmt.Sprintf("Первый тег должен совпадать с topic (%s), получено %s.", t.Topic, t.Tags[0]))
		}
	}

	// language
	if t.Language != "typescript" {
		errors = append(errors, fmt.Sprintf("language должен быть \"typescript\" (получено %q).", t.Language))
	}

	// exports
	if len(t.Exports) != 1 || t.Exports[0] == "" {
		errors = append(errors, "exports должен содержать ровно одно непустое имя функции.")
	}

	// examples / constraints
	for _, f := range []struct {
		name  string
		items []string
	}{{"examples", t.Examples}, {"constraints", t.Constraints}} {
		for _, item := range f.items {
			if strings.TrimSpace(item) == "" {
				errors = append(errors, fmt.Sprintf("каждый элемент %s должен быть непустой строкой.", f.name))
				break
			}
		}
	}

	// код
	for _, f := range []struct{ name, val string }{
		{"condition", t.Condition},
		{"templateCode", t.TemplateCode},
		{"solutionCode", t.SolutionCode},
		{"testCode", t.TestCode},
	} {
		if len(strings.TrimSpace(f.val)) < 10 {
			errors = append(errors, fmt.Sprintf("%s должен быть непустой строкой (мин. 10 символов).", f.name))
		}
	}

	if len(t.Exports) == 1 && t.Exports[0] != "" {
		exportRe := regexp.MustCompile(`export(\s+const|\s+function|\s+async\s+function|\s+class)?\s+` + regexp.QuoteMeta(t.Exports[0]) + `\b`)
		if !exportRe.MatchString(t.SolutionCode) {
			errors = append(errors, fmt.Sprintf("solutionCode не содержит `export %s`.", t.Exports[0]))
		}
		if !exportRe.MatchString(t.TemplateCode) {
			errors = append(errors, fmt.Sprintf("templateCode не содержит `export %s`.", t.Exports[0]))
		}
	}
	if !strings.Contains(t.TestCode, `from "../solution"`) && !strings.Contains(t.TestCode, `from '../solution'`) {
		errors = append(errors, `testCode должен импортировать решение из "../solution".`)
	}
	testImportRe := regexp.MustCompile(`import\s*\{[^}]*\btest\b[^}]*\}\s*from\s*["']vitest["']`)
	if !testImportRe.MatchString(t.TestCode) {
		errors = append(errors, "testCode должен использовать `import { test, expect } from \"vitest\"`.")
	}
	if strings.Contains(t.TestCode, "describe(") {
		errors = append(errors, "testCode не должен использовать describe (используй test).")
	}
	if strings.Contains(t.SolutionCode, "console.log") {
		errors = append(errors, "solutionCode не должен содержать console.log.")
	}

	// hints
	if len(t.Hints) < 1 {
		errors = append(errors, "hints должен быть непустым массивом строк.")
	} else {
		for _, h := range t.Hints {
			if len(strings.TrimSpace(h)) < 5 {
				errors = append(errors, "Каждая подсказка должна быть строкой мин. 5 символов.")
				break
			}
		}
	}

	// source (опционально)
	if t.Source != nil {
		if t.Source.Name == "" || t.Source.URL == "" {
			errors = append(errors, "source.name и source.url обязательны, если source задан.")
		} else if _, err := url.ParseRequestURI(t.Source.URL); err != nil {
			errors = append(errors, fmt.Sprintf("source.url некорректен: %s", t.Source.URL))
		}
	}

	return errors
}

func contains(list []string, s string) bool {
	for _, item := range list {
		if item == s {
			return true
		}
	}
	return false
}

// slugExists проверяет, занят ли slug в категории (с любым номером).
func slugExists(tasksRoot, topic, slug string) bool {
	dir := filepath.Join(tasksRoot, topic)
	entries, err := os.ReadDir(dir)
	if err != nil {
		return false
	}
	numRe := regexp.MustCompile(`^\d{3,}-(.+)$`)
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		if m := numRe.FindStringSubmatch(e.Name()); m != nil && m[1] == slug {
			return true
		}
	}
	return false
}
