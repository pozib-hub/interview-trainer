package proposal

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"
)

// NextTaskNumber находит следующий свободный трёхзначный номер в теме.
func NextTaskNumber(tasksRoot, topic string) string {
	entries, err := os.ReadDir(filepath.Join(tasksRoot, topic))
	if err != nil {
		return "001"
	}
	max := 0
	numRe := regexp.MustCompile(`^(\d{3,})-`)
	for _, e := range entries {
		if m := numRe.FindStringSubmatch(e.Name()); m != nil {
			if n, err := strconv.Atoi(m[1]); err == nil && n > max {
				max = n
			}
		}
	}
	return fmt.Sprintf("%03d", max+1)
}

// BuildFileContents детерминированно собирает 6 файлов задачи из JSON LLM.
func BuildFileContents(t *GeneratedTask) TaskFiles {
	meta := map[string]any{
		"title":      t.Title,
		"difficulty": t.Difficulty,
		"tags":       t.Tags,
		"language":   t.Language,
		"exports":    t.Exports,
	}
	metaJSON, _ := json.MarshalIndent(meta, "", "  ")

	parts := []string{"# " + t.Title, "", strings.TrimSpace(t.Condition)}
	if len(t.Examples) > 0 {
		parts = append(parts, "", "## Примеры")
		for _, ex := range t.Examples {
			if s := strings.TrimSpace(ex); s != "" {
				parts = append(parts, "", s)
			}
		}
	}
	if len(t.Constraints) > 0 {
		parts = append(parts, "", "## Ограничения")
		for _, c := range t.Constraints {
			if s := strings.TrimSpace(c); s != "" {
				parts = append(parts, "- "+s)
			}
		}
	}
	if t.Source != nil && t.Source.URL != "" {
		name := t.Source.Name
		if name == "" {
			name = "ссылка"
		}
		parts = append(parts, "", fmt.Sprintf("> Источник: [%s](%s)", name, t.Source.URL))
	}
	condition := strings.Join(parts, "\n")
	if !strings.HasSuffix(condition, "\n") {
		condition += "\n"
	}

	hints := make([]string, 0, len(t.Hints))
	for i, h := range t.Hints {
		hints = append(hints, fmt.Sprintf("## Подсказка %d\n%s", i+1, strings.TrimSpace(h)))
	}

	return TaskFiles{
		MetaJSON:  string(metaJSON) + "\n",
		Condition: condition,
		Template:  ensureTrailingNewline(strings.TrimSpace(t.TemplateCode)),
		Solution:  ensureTrailingNewline(strings.TrimSpace(t.SolutionCode)),
		Hints:     strings.Join(hints, "\n\n") + "\n",
		Test:      ensureTrailingNewline(strings.TrimSpace(t.TestCode)),
	}
}

func ensureTrailingNewline(s string) string {
	if strings.HasSuffix(s, "\n") {
		return s
	}
	return s + "\n"
}
