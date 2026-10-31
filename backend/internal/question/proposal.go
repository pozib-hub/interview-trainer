package question

import (
	"context"
	crand "crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"unicode/utf8"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/proposal"
)

// GitHubPR — работа с GitHub (реализация *proposal.GitHubClient).
type GitHubPR interface {
	GetFileContent(ctx context.Context, path, ref string) (string, error)
	CreateBranchAndPR(ctx context.Context, branch, baseBranch string, files map[string]string, title, body string) (string, error)
}

// Лимиты полей формы «Предложить вопрос».
const (
	maxUserQuestionLen = 2000
	maxUserAnswerLen   = 20000
)

// ProposalService оформляет вопрос через LLM (выбирает направление,
// технологию и главу, пишет полный ответ) и создаёт draft Pull Request
// в общий сборник.
type ProposalService struct {
	LLM        LLMChat
	GitHub     GitHubPR
	Scanner    *Scanner
	BaseBranch string
	DryRun     bool
	Mock       bool
	MaxRetries int
}

// ProposalRequest — данные формы «Предложить вопрос».
type ProposalRequest struct {
	Question   string `json:"question"`
	UserAnswer string `json:"userAnswer"`
	Direction  string `json:"direction"`
	Technology string `json:"technology"`
	Notes      string `json:"notes"`
}

// ProposalResult — итог: оформленный вопрос и PR.
type ProposalResult struct {
	PRURL         string `json:"prUrl"`
	Branch        string `json:"branch"`
	File          string `json:"file"`
	DryRun        bool   `json:"dryRun"`
	Direction     string `json:"direction"`
	Technology    string `json:"technology"`
	Chapter       string `json:"chapter"`
	ChapterTitle  string `json:"chapterTitle"`
	Question      string `json:"question"`
	Answer        string `json:"answer"`
	NewTechnology bool   `json:"newTechnology"`
	NewChapter    bool   `json:"newChapter"`

	fileContent     string
	technologyTitle string
	categoryPath    string
}

func (r ProposalResult) CategoryPath() string { return r.categoryPath }

// llmPayload — JSON-схема ответа LLM (как в workflow-генераторе).
type llmPayload struct {
	Direction       string `json:"direction"`
	Technology      string `json:"technology"`
	TechnologyTitle string `json:"technologyTitle"`
	Chapter         string `json:"chapter"`
	ChapterTitle    string `json:"chapterTitle"`
	Question        string `json:"question"`
	Answer          string `json:"answer"`
}

func (s *ProposalService) Propose(ctx context.Context, req ProposalRequest) (ProposalResult, error) {
	question := strings.TrimSpace(req.Question)
	userAnswer := strings.TrimSpace(req.UserAnswer)
	if question == "" {
		return ProposalResult{}, fmt.Errorf("текст вопроса обязателен")
	}
	if utf8.RuneCountInString(question) > maxUserQuestionLen {
		return ProposalResult{}, fmt.Errorf("вопрос слишком длинный (макс. %d символов)", maxUserQuestionLen)
	}
	if utf8.RuneCountInString(userAnswer) > maxUserAnswerLen {
		return ProposalResult{}, fmt.Errorf("ответ слишком длинный (макс. %d символов)", maxUserAnswerLen)
	}
	if question == "" && userAnswer == "" {
		return ProposalResult{}, fmt.Errorf("вопрос пуст — нечего оформлять")
	}

	index := s.Scanner.Index()
	if len(index.Directions) == 0 {
		return ProposalResult{}, fmt.Errorf("сборник вопросов пуст")
	}

	var payload llmPayload
	var validationErrs []string
	for attempt := 0; attempt <= s.maxRetries(); attempt++ {
		var err error
		payload, err = s.askLLM(ctx, index, req, validationErrs)
		if err != nil {
			return ProposalResult{}, err
		}
		validationErrs = validatePayload(index, payload)
		if len(validationErrs) == 0 {
			break
		}
	}
	if len(validationErrs) > 0 {
		return ProposalResult{}, fmt.Errorf("ИИ не смог корректно оформить вопрос: %s", strings.Join(validationErrs, "; "))
	}

	res, err := s.buildResult(ctx, index, payload)
	if err != nil {
		return ProposalResult{}, err
	}

	if s.DryRun {
		res.DryRun = true
		return res, nil
	}
	if s.GitHub == nil {
		return ProposalResult{}, fmt.Errorf("GitHub не настроен: задайте GITHUB_TOKEN")
	}

	files := s.prFiles(res)
	prURL, err := s.GitHub.CreateBranchAndPR(ctx, res.Branch, s.BaseBranch, files, prTitle(res.Question), prBody(res))
	if err != nil {
		return ProposalResult{}, err
	}
	res.PRURL = prURL
	return res, nil
}

func (s *ProposalService) maxRetries() int {
	if s.MaxRetries < 0 {
		return 2
	}
	return s.MaxRetries
}

// ─── LLM ────────────────────────────────────────────────────────────────

func (s *ProposalService) askLLM(ctx context.Context, index domain.QuestionsIndex, req ProposalRequest, prevErrors []string) (llmPayload, error) {
	if s.Mock {
		return s.mockPayload(index, req), nil
	}
	if s.LLM == nil {
		return llmPayload{}, fmt.Errorf("LLM не настроен: задайте LLM_API_KEY")
	}

	raw, err := s.LLM.ChatRaw(ctx, buildSystemMessage(index), buildUserMessage(req, prevErrors))
	if err != nil {
		return llmPayload{}, proposal.ClassifyLLMError(err)
	}
	data, err := proposal.ParseJSONContent(raw)
	if err != nil {
		return llmPayload{}, err
	}
	var payload llmPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		return llmPayload{}, fmt.Errorf("разбор ответа LLM: %w", err)
	}
	return payload, nil
}

func (s *ProposalService) mockPayload(index domain.QuestionsIndex, req ProposalRequest) llmPayload {
	d := index.Directions[0]
	if req.Direction != "" {
		for i := range index.Directions {
			if index.Directions[i].ID == req.Direction {
				d = index.Directions[i]
				break
			}
		}
	}
	tech := ""
	if len(d.Technologies) > 0 {
		tech = d.Technologies[0].ID
		if req.Technology != "" {
			for _, t := range d.Technologies {
				if t.ID == req.Direction+"/"+req.Technology || t.ID == req.Technology {
					tech = t.ID
					break
				}
			}
		}
	}
	chapter, title := "", "Новая глава (мок)"
	var chapters []domain.QuestionChapter
	if tech != "" {
		for _, t := range d.Technologies {
			if t.ID == tech {
				chapters = t.Chapters
				break
			}
		}
	} else {
		chapters = d.Chapters
	}
	if len(chapters) > 0 {
		chapter = chapters[0].ID
		title = chapters[0].Title
	}
	answer := req.UserAnswer
	if answer == "" {
		answer = "Мок-ответ: заполните LLM_API_KEY, чтобы ИИ оформил настоящий ответ."
	}
	return llmPayload{
		Direction:    d.ID,
		Technology:   tech,
		Chapter:      chapter,
		ChapterTitle: title,
		Question:     req.Question,
		Answer:       answer,
	}
}

func buildContext(index domain.QuestionsIndex) string {
	lines := []string{"Текущая структура сборника вопросов:"}
	for _, d := range index.Directions {
		lines = append(lines, fmt.Sprintf("- Направление: %s (%s)", d.ID, d.Title))
		if len(d.Technologies) > 0 {
			for _, t := range d.Technologies {
				lines = append(lines, fmt.Sprintf("  - Технология: %s (%s)", t.ID, t.Title))
				for _, c := range t.Chapters {
					lines = append(lines, fmt.Sprintf("    - Глава: %s — %q (%d вопросов)", chapterSlug(c.ID), c.Title, len(c.Questions)))
				}
			}
		} else {
			for _, c := range d.Chapters {
				lines = append(lines, fmt.Sprintf("  - Глава: %s — %q (%d вопросов)", chapterSlug(c.ID), c.Title, len(c.Questions)))
			}
		}
	}
	return strings.Join(lines, "\n")
}

func buildSystemMessage(index domain.QuestionsIndex) string {
	return strings.Join([]string{
		"Ты — технический редактор сборника вопросов для подготовки к собеседованиям.",
		"Твоя задача — оформить один вопрос с ответом по данным формы.",
		"",
		"## Правила формата сборника:",
		"- Структура: направление → технология → главы (markdown-файлы) → вопросы.",
		"- Каждый вопрос — заголовок `## <текст вопроса>` внутри файла главы.",
		"- Название главы — заголовок `# <название>` первой строкой файла.",
		"- В ответах ЗАПРЕЩЕНЫ заголовки `#` и `##` (ломают парсер). Разрешены: ```блоки кода```, `инлайн-код`, **жирный**, списки.",
		"- Язык — русский. Стиль ответа: сначала суть в 1-2 предложениях, потом детали, код-примеры где уместно. 3-7 предложений.",
		"",
		"## Структура ответа (только валидный JSON):",
		"{",
		`  "direction": "frontend|backend|devops|hr",`,
		`  "technology": "kebab-case slug или пустая строка для hr",`,
		`  "technologyTitle": "человекочитаемое название — только если создаёшь НОВУЮ технологию, иначе пусто",`,
		`  "chapter": "существующий slug главы или kebab-case slug новой (например 005-memory)",`,
		`  "chapterTitle": "название главы — нужно только если главы нет или создаётся новая, иначе пусто",`,
		`  "question": "текст вопроса (обычно заканчивается на ?)",`,
		`  "answer": "ответ в markdown без заголовков #/##",`,
		"}",
		"",
		"## Правила выбора:",
		"- Направление — только из существующих в контексте ниже.",
		"- Технология — существующая или новая (для новой обязателен technologyTitle). Для направлений без технологий (hr) — пустая строка.",
		"- Глава — существующая по смыслу или новая (для новой: chapter = NNN-slug, chapterTitle обязателен).",
		"- НЕ дублируй существующие вопросы — изучи контекст.",
		"",
		"## Контекст:",
		buildContext(index),
	}, "\n")
}

func buildUserMessage(req ProposalRequest, prevErrors []string) string {
	lines := []string{"## Данные из формы:", ""}
	if req.Direction != "" {
		lines = append(lines, "Направление (пожелание пользователя): "+req.Direction)
	}
	if req.Technology != "" {
		lines = append(lines, "Технология (пожелание пользователя): "+req.Technology)
	}
	lines = append(lines, "Вопрос: "+strings.TrimSpace(req.Question))
	if req.UserAnswer != "" {
		lines = append(lines, "Ответ пользователя (используй как основу, дополни и оформи): "+strings.TrimSpace(req.UserAnswer))
	}
	if req.Notes != "" {
		lines = append(lines, "Заметки: "+strings.TrimSpace(req.Notes))
	}
	if len(prevErrors) > 0 {
		lines = append(lines, "", "## Ошибки предыдущей попытки (исправь их):")
		for _, e := range prevErrors {
			lines = append(lines, "- "+e)
		}
	}
	lines = append(lines, "", "Верни JSON по схеме. Только JSON, без пояснений.")
	return strings.Join(lines, "\n")
}

// ─── Валидация ──────────────────────────────────────────────────────────

var slugRe = regexp.MustCompile(`^[a-z0-9]+(?:-[a-z0-9]+)*$`)

func validatePayload(index domain.QuestionsIndex, p llmPayload) []string {
	errs := []string{}

	if p.Direction == "" {
		errs = append(errs, "direction не задан")
	}
	var direction *domain.QuestionsDirection
	var tech *domain.QuestionsTechnology
	for i := range index.Directions {
		if index.Directions[i].ID == p.Direction {
			direction = &index.Directions[i]
			break
		}
	}
	if direction == nil {
		if p.Direction != "" {
			errs = append(errs, fmt.Sprintf("направление %q не существует", p.Direction))
		}
		return errs
	}

	if p.Technology != "" {
		full := p.Direction + "/" + p.Technology
		if strings.HasPrefix(p.Technology, p.Direction+"/") {
			full = p.Technology
		}
		for i := range direction.Technologies {
			if direction.Technologies[i].ID == full {
				tech = &direction.Technologies[i]
				p.Technology = full
				break
			}
		}
		if tech == nil {
			if !slugRe.MatchString(p.Technology) {
				errs = append(errs, fmt.Sprintf("новая технология %q должна быть kebab-case", p.Technology))
			}
			if strings.TrimSpace(p.TechnologyTitle) == "" {
				errs = append(errs, "для новой технологии обязателен technologyTitle")
			}
			p.Technology = full
		}
	} else if len(direction.Technologies) > 0 {
		errs = append(errs, fmt.Sprintf("направление %q требует технологию (одну из существующих или новую)", p.Direction))
	}

	q := strings.TrimSpace(p.Question)
	if q == "" {
		errs = append(errs, "question пуст")
		p.Question = q
	}
	if strings.TrimSpace(p.Answer) == "" {
		errs = append(errs, "answer пуст")
	}
	if strings.HasPrefix(q, "#") {
		errs = append(errs, "вопрос не должен быть markdown-заголовком")
	}
	if hasForbiddenHeadings(p.Answer) {
		errs = append(errs, "в ответе есть заголовки #/## — они зарезервированы для структуры сборника")
	}

	chSlug := chapterSlug(p.Chapter)
	if chSlug != "" && !slugRe.MatchString(chSlug) {
		errs = append(errs, fmt.Sprintf("chapter %q должна быть kebab-case (например 003-async-event-loop)", chSlug))
	}

	chapters := directionChapters(tech, direction)
	chapterFound := false
	for _, c := range chapters {
		if chSlug != "" && chapterSlug(c.ID) == chSlug {
			chapterFound = true
			break
		}
	}
	if chSlug != "" && !chapterFound && strings.TrimSpace(p.ChapterTitle) == "" {
		errs = append(errs, "для новой главы обязателен chapterTitle")
	}

	if q != "" && (tech != nil || len(directionChapters(tech, direction)) > 0) {
		normalized := normalizeQuestion(q)
		for _, c := range directionChapters(tech, direction) {
			for _, existing := range c.Questions {
				if normalizeQuestion(existing.Question) == normalized {
					errs = append(errs, fmt.Sprintf("вопрос уже существует в главе %q", c.Title))
				}
			}
		}
	}

	return errs
}

var codeFenceRe = regexp.MustCompile("(?s)```.*?```")

func hasForbiddenHeadings(answer string) bool {
	outside := codeFenceRe.ReplaceAllString(answer, "")
	return regexp.MustCompile(`(?m)^#{1,2}\s`).MatchString(outside)
}

func normalizeQuestion(q string) string {
	s := strings.ToLower(strings.TrimSpace(q))
	s = regexp.MustCompile(`[?!.,;:«»"'()]+`).ReplaceAllString(s, "")
	return strings.Join(strings.Fields(s), " ")
}

func chapterSlug(chapterID string) string {
	if i := strings.LastIndex(chapterID, "/"); i != -1 {
		return chapterID[i+1:]
	}
	return chapterID
}

// ─── Сборка результата ───────────────────────────────────────────────────

func (s *ProposalService) buildResult(ctx context.Context, index domain.QuestionsIndex, p llmPayload) (ProposalResult, error) {
	var direction *domain.QuestionsDirection
	for i := range index.Directions {
		if index.Directions[i].ID == p.Direction {
			direction = &index.Directions[i]
			break
		}
	}
	if direction == nil {
		return ProposalResult{}, fmt.Errorf("направление %q не найдено", p.Direction)
	}

	var tech *domain.QuestionsTechnology
	category := p.Direction
	if p.Technology != "" {
		full := p.Technology
		if !strings.Contains(full, "/") {
			full = p.Direction + "/" + full
		}
		category = full
		for i := range direction.Technologies {
			if direction.Technologies[i].ID == full {
				tech = &direction.Technologies[i]
				break
			}
		}
	}

	chapters := directionChapters(tech, direction)
	chSlug := chapterSlug(p.Chapter)
	chapterID := chSlug
	newChapter := true
	for _, c := range chapters {
		if chSlug != "" && chapterSlug(c.ID) == chSlug {
			chapterID = c.ID
			newChapter = false
			break
		}
	}

	filePath := category + "/chapters/" + chapterSlug(chapterID) + ".md"
	var content string
	if !newChapter {
		raw, err := s.readChapter(ctx, filePath)
		if err != nil {
			return ProposalResult{}, err
		}
		content = appendQuestion(raw, p.Question, p.Answer)
	} else {
		slug := p.Chapter
		if !regexp.MustCompile(`^\d{3}-`).MatchString(slug) {
			num := len(chapters) + 1
			for _, c := range chapters {
				var n int
				if _, err := fmt.Sscanf(chapterSlug(c.ID), "%3d", &n); err == nil && n >= num {
					num = n + 1
				}
			}
			slug = fmt.Sprintf("%03d-%s", num, slugify(firstNonEmptyStr(p.ChapterTitle, p.Chapter)))
		}
		filePath = category + "/chapters/" + slug + ".md"
		chapterID = slug
		content = newChapterContent(firstNonEmptyStr(p.ChapterTitle, slug), p.Question, p.Answer)
	}

	newTech := tech == nil && p.Technology != ""
	branch := "question/" + category + "-" + randomSuffix()

	return ProposalResult{
		Branch:          branch,
		File:            filePath,
		Direction:       p.Direction,
		Technology:      p.Technology,
		Chapter:         chapterID,
		ChapterTitle:    firstNonEmptyStr(p.ChapterTitle, chapterTitleOf(chapters, chapterID)),
		Question:        p.Question,
		Answer:          p.Answer,
		NewTechnology:   newTech,
		NewChapter:      newChapter,
		fileContent:     content,
		technologyTitle: p.TechnologyTitle,
		categoryPath:    category,
	}, nil
}

func chapterTitleOf(chapters []domain.QuestionChapter, chapterID string) string {
	for _, c := range chapters {
		if c.ID == chapterID || chapterSlug(c.ID) == chapterID {
			return c.Title
		}
	}
	return ""
}

func (s *ProposalService) prFiles(res ProposalResult) map[string]string {
	files := map[string]string{
		"backend/questions/" + res.File: res.fileContent,
	}
	if res.NewTechnology && res.technologyTitle != "" {
		meta := fmt.Sprintf("{\n  \"title\": %q,\n  \"description\": \"\",\n  \"order\": 99\n}\n", res.technologyTitle)
		files["backend/questions/"+res.CategoryPath()+"/meta.json"] = meta
	}
	return files
}

func (s *ProposalService) readChapter(ctx context.Context, filePath string) (string, error) {
	if !s.DryRun && s.GitHub != nil {
		if raw, err := s.GitHub.GetFileContent(ctx, "backend/questions/"+filePath, s.BaseBranch); err == nil {
			return raw, nil
		}
	}
	if raw, err := os.ReadFile(filepath.Join(s.Scanner.root, filePath)); err == nil {
		return string(raw), nil
	}
	return "", fmt.Errorf("не удалось прочитать главу %s (репозиторий и диск)", filePath)
}

func appendQuestion(raw, question, answer string) string {
	return strings.TrimRight(raw, "\n \t") + "\n\n## " + question + "\n\n" + strings.TrimSpace(answer) + "\n"
}

func newChapterContent(title, question, answer string) string {
	return "# " + title + "\n\n## " + question + "\n\n" + strings.TrimSpace(answer) + "\n"
}

func directionChapters(tech *domain.QuestionsTechnology, direction *domain.QuestionsDirection) []domain.QuestionChapter {
	if tech != nil {
		return tech.Chapters
	}
	return direction.Chapters
}

func prTitle(question string) string {
	return "Вопрос: " + truncateRunes(question, 60)
}

func prBody(res ProposalResult) string {
	var b strings.Builder
	b.WriteString("Вопрос оформлен ИИ из формы приложения и готов к ревью.\n\n")
	b.WriteString("**Направление:** `" + res.Direction + "`")
	if res.Technology != "" {
		b.WriteString(" · **Технология:** `" + res.Technology + "`")
	}
	b.WriteString(" · **Глава:** `" + res.Chapter + "`")
	if res.NewChapter {
		b.WriteString(" (новая)")
	}
	b.WriteString("\n\n")
	b.WriteString("<details><summary>Вопрос</summary>\n\n" + res.Question + "\n\n</details>\n\n")
	b.WriteString("<details><summary>Ответ</summary>\n\n" + res.Answer + "\n\n</details>\n")
	return b.String()
}

func randomSuffix() string {
	buf := make([]byte, 4)
	if _, err := crand.Read(buf); err != nil {
		return "0000"
	}
	return hex.EncodeToString(buf)
}

func utf8Len(s string) int {
	n := 0
	for range s {
		n++
	}
	return n
}

func truncateRunes(s string, n int) string {
	if utf8Len(s) <= n {
		return s
	}
	r := []rune(s)
	return strings.TrimSpace(string(r[:n])) + "…"
}

func firstNonEmptyStr(a, b string) string {
	if strings.TrimSpace(a) != "" {
		return a
	}
	return b
}

var translit = map[rune]string{
	'а': "a", 'б': "b", 'в': "v", 'г': "g", 'д': "d", 'е': "e", 'ё': "e", 'ж': "zh",
	'з': "z", 'и': "i", 'й': "i", 'к': "k", 'л': "l", 'м': "m", 'н': "n", 'о': "o",
	'п': "p", 'р': "r", 'с': "s", 'т': "t", 'у': "u", 'ф': "f", 'х': "h", 'ц': "ts",
	'ч': "ch", 'ш': "sh", 'щ': "sch", 'ъ': "", 'ы': "y", 'ь': "", 'э': "e", 'ю': "yu",
	'я': "ya",
}

var nonSlugRe = regexp.MustCompile(`[^a-z0-9-]+`)

func slugify(title string) string {
	var b strings.Builder
	for _, r := range strings.ToLower(title) {
		switch {
		case r >= 'a' && r <= 'z', r >= '0' && r <= '9':
			b.WriteRune(r)
		case r == ' ', r == '_', r == '-':
			b.WriteByte('-')
		default:
			if t, ok := translit[r]; ok {
				b.WriteString(t)
			}
		}
	}
	slug := nonSlugRe.ReplaceAllString(b.String(), "-")
	for strings.Contains(slug, "--") {
		slug = strings.ReplaceAll(slug, "--", "-")
	}
	return strings.Trim(slug, "-")
}
