package question

import (
	"fmt"
	"regexp"
	"strings"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

var (
	chapterTitleRe = regexp.MustCompile(`(?m)^#\s+(.+)$`)
	questionHeadRe = regexp.MustCompile(`^##\s+`)
)

func isFence(line string) bool {
	return strings.HasPrefix(strings.TrimLeft(line, " \t"), "```")
}

// ParseChapterMarkdown разбирает markdown-файл главы.
// Первый `#` — название главы, каждый `## ` вне код-блоков — вопрос,
// текст до первого вопроса отбрасывается.
func ParseChapterMarkdown(relDir, fileName, raw string) domain.QuestionChapter {
	chapterID := relDir + "/" + strings.TrimSuffix(fileName, ".md")
	title := fileName
	if m := chapterTitleRe.FindStringSubmatch(raw); m != nil {
		title = strings.TrimSpace(m[1])
	}

	questions := []domain.QuestionEntry{}
	for _, segment := range SplitByQuestionHeadings(raw) {
		trimmed := strings.TrimSpace(segment)
		if trimmed == "" {
			continue
		}
		var q, a string
		if nl := strings.IndexByte(trimmed, '\n'); nl == -1 {
			q = trimmed
		} else {
			q = trimmed[:nl]
			a = strings.TrimSpace(trimmed[nl+1:])
		}
		q = strings.TrimSpace(q)
		if q == "" {
			continue
		}
		questions = append(questions, domain.QuestionEntry{
			ID:       fmt.Sprintf("%s/%03d", chapterID, len(questions)+1),
			Question: q,
			Answer:   a,
		})
	}

	return domain.QuestionChapter{ID: chapterID, Title: title, Questions: questions}
}

// SplitByQuestionHeadings делит markdown на сегменты по заголовкам `## ...`
// вне блоков кода. Первый сегмент (до первого вопроса) отбрасывается.
func SplitByQuestionHeadings(raw string) []string {
	segments := []string{}
	var current strings.Builder
	inCode := false

	for _, line := range strings.Split(raw, "\n") {
		if isFence(line) {
			inCode = !inCode
			current.WriteString(line)
			current.WriteString("\n")
			continue
		}
		if !inCode && questionHeadRe.MatchString(line) {
			segments = append(segments, current.String())
			current.Reset()
			current.WriteString(strings.TrimPrefix(line, "## "))
			current.WriteString("\n")
			continue
		}
		current.WriteString(line)
		current.WriteString("\n")
	}
	segments = append(segments, current.String())

	if len(segments) > 0 {
		return segments[1:]
	}
	return segments
}
