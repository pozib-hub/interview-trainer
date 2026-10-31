package proposal

import (
	"embed"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

//go:embed prompts/*
var promptFS embed.FS

// Reference-задачи для few-shot grounding (Pattern 1, хорошо оформленные).
var referenceTasks = [][2]string{
	{"sorts", "001-bubble-sort"},
	{"algorithms", "010-fibonacci"},
}

func readPrompt(name string) string {
	b, err := promptFS.ReadFile("prompts/" + name)
	if err != nil {
		return ""
	}
	return string(b)
}

// DiscoverTopics возвращает список тем (каталогов) в tasks/.
func DiscoverTopics(tasksRoot string) []string {
	entries, err := os.ReadDir(tasksRoot)
	if err != nil {
		return nil
	}
	var topics []string
	for _, e := range entries {
		if e.IsDir() {
			topics = append(topics, e.Name())
		}
	}
	return topics
}

func buildCategoriesSection(tasksRoot string, topics []string, taskCounts map[string]int) string {
	var sb strings.Builder
	sb.WriteString("# Разрешённые категории (topic)\n\n")
	sb.WriteString("Выбери ОДНУ категорию из списка ниже. НЕ придумывай новые категории.\n\n")
	for _, t := range topics {
		count := taskCounts[t]
		examples := referenceSlugsFor(tasksRoot, t)
		if examples != "" {
			fmt.Fprintf(&sb, "- `%s` — %d задач (примеры: %s)\n", t, count, examples)
		} else {
			fmt.Fprintf(&sb, "- `%s` — %d задач\n", t, count)
		}
	}
	sb.WriteString("\nЕсли ни одна категория не подходит по смыслу — выбери `other`.\n")
	return sb.String()
}

func referenceSlugsFor(tasksRoot, topic string) string {
	entries, err := os.ReadDir(filepath.Join(tasksRoot, topic))
	if err != nil {
		return ""
	}
	var slugs []string
	for _, e := range entries {
		if e.IsDir() && len(slugs) < 2 {
			slugs = append(slugs, e.Name())
		}
	}
	return strings.Join(slugs, ", ")
}

func buildReferenceSection(tasksRoot string) string {
	var sb strings.Builder
	sb.WriteString("# Reference-примеры реальных задач\n\n")
	sb.WriteString("Изучи структуру этих задач и следуй их стилю.\n\n")
	for _, parts := range referenceTasks {
		dir := filepath.Join(append([]string{tasksRoot}, parts[0], parts[1])...)
		if _, err := os.Stat(filepath.Join(dir, "meta.json")); err != nil {
			continue
		}
		fmt.Fprintf(&sb, "## %s/%s\n\n", parts[0], parts[1])
		writeFencedFile(&sb, filepath.Join(dir, "meta.json"), "meta.json")
		writeFencedFile(&sb, filepath.Join(dir, "template.ts"), "template.ts")
		writeFencedFile(&sb, filepath.Join(dir, "solution.ts"), "solution.ts")
		writeFencedFile(&sb, filepath.Join(dir, "tests", "test.ts"), "tests/test.ts")
		if hints, err := os.ReadFile(filepath.Join(dir, "hints.md")); err == nil {
			sb.WriteString("```hints.md\n")
			sb.Write(hints)
			sb.WriteString("\n```\n\n")
		}
	}
	return sb.String()
}

func writeFencedFile(sb *strings.Builder, path, name string) {
	b, err := os.ReadFile(path)
	if err != nil {
		return
	}
	fmt.Fprintf(sb, "```%s\n%s\n```\n\n", name, strings.TrimSpace(string(b)))
}

// BuildSystemMessage собирает системное сообщение: правила + формат + категории + референсы + схема.
func BuildSystemMessage(tasksRoot string, taskCounts map[string]int) string {
	parts := []string{
		readPrompt("system-prompt.md"),
		"",
		readPrompt("project-format.md"),
		"",
		buildCategoriesSection(tasksRoot, DiscoverTopics(tasksRoot), taskCounts),
		"",
		buildReferenceSection(tasksRoot),
		"",
		"# JSON Schema (строго соблюдай структуру)\n\n```json",
		readPrompt("task-schema.json"),
		"```",
	}
	return strings.Join(parts, "\n")
}

// BuildUserMessage собирает пользовательское сообщение из данных формы.
func BuildUserMessage(in Input) string {
	var sb strings.Builder
	sb.WriteString("# Входные данные\n\n")
	if in.Title != "" {
		fmt.Fprintf(&sb, "Заголовок: %s\n\n", in.Title)
	}
	if in.SourceURL != "" {
		fmt.Fprintf(&sb, "## URL источника: %s\n", in.SourceURL)
		sb.WriteString("(контент не получаем — используй описание задачи ниже; URL сохрани в source.url)\n\n")
	}
	sb.WriteString("## Описание задачи от пользователя\n")
	if in.Description != "" {
		sb.WriteString(in.Description)
	} else {
		sb.WriteString("(пусто)")
	}
	sb.WriteString("\n")
	if in.UserSolution != "" {
		// 4 обратных апострофа: решение пользователя может содержать ``` и
		// «закрыть» обычный фенс (prompt injection в системный промпт).
		sb.WriteString("\n## Решение пользователя (проверь и оформи как solutionCode)\n````ts\n")
		sb.WriteString(in.UserSolution)
		sb.WriteString("\n````\n")
	}
	if in.Notes != "" {
		sb.WriteString("\n## Дополнительные заметки\n")
		sb.WriteString(in.Notes)
		sb.WriteString("\n")
	}
	sb.WriteString("\n# Задача\n")
	sb.WriteString("Верни только JSON по переданной JSON Schema. Не добавляй пояснений вне JSON.\n")
	return sb.String()
}

// BuildValidationFeedback формирует сообщение обратной связи при ошибках валидации.
func BuildValidationFeedback(errors []string, task *GeneratedTask) string {
	var sb strings.Builder
	sb.WriteString("Твой предыдущий ответ содержит ошибки валидации. Исправь их и верни обновлённый JSON.\n\n")
	sb.WriteString("## Ошибки:\n")
	for _, e := range errors {
		sb.WriteString("- " + e + "\n")
	}
	sb.WriteString("\nВерни ИСПРАВЛЕННЫЙ JSON по той же JSON Schema. Только JSON, без пояснений.\n")
	return sb.String()
}

// PRBody собирает markdown-описание PR с превью файлов.
func PRBody(res *Result) string {
	var sb strings.Builder
	fmt.Fprintf(&sb, "## Сгенерированная задача: `%s`\n\n", res.TaskID)
	fmt.Fprintf(&sb, "**Заголовок:** %s  \n", res.Title)
	fmt.Fprintf(&sb, "**Категория:** `%s` · **Сложность:** `%s`\n\n", res.Topic, res.Slug)
	selfCheck := "❌ не пройдена"
	if res.SelfCheck.Passed {
		selfCheck = fmt.Sprintf("✅ пройдена (%d тестов)", res.SelfCheck.Total)
	}
	fmt.Fprintf(&sb, "**Самопроверка (vitest):** %s\n\n", selfCheck)
	sb.WriteString("Сгенерировано AI из формы в приложении. Проверьте корректность перед merge.\n\n")
	fold(&sb, "meta.json", "json", res.Files.MetaJSON)
	fold(&sb, "condition.md", "md", res.Files.Condition)
	fold(&sb, "template.ts", "ts", res.Files.Template)
	fold(&sb, "solution.ts", "ts", res.Files.Solution)
	fold(&sb, "tests/test.ts", "ts", res.Files.Test)
	fold(&sb, "hints.md", "md", res.Files.Hints)
	return sb.String()
}

func fold(sb *strings.Builder, name, lang, content string) {
	fmt.Fprintf(sb, "<details><summary>%s</summary>\n\n```%s\n%s```\n</details>\n\n", name, lang, content)
}
