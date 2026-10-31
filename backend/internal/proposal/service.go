package proposal

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"os"
	"path/filepath"
	"regexp"
	"strings"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

// ErrInvalidInput — ошибка данных формы (400 в API).
var ErrInvalidInput = errors.New("неверные данные формы")

// TaskRunner — минимальный интерфейс vitest-раннера (реализация *runner.VitestRunner).
type TaskRunner interface {
	Run(ctx context.Context, task domain.TaskFull, userCode string) domain.RunResult
}

// Options — конфигурация сервиса предложений.
type Options struct {
	TasksRoot  string
	Runner     TaskRunner
	LLM        *LLMClient
	LLMMock    bool
	GitHub     *GitHubClient
	DryRun     bool // не ходить в GitHub, вернуть локальный результат
	BaseBranch string
	Log        *slog.Logger
}

// Service оркестрирует: форма → LLM (с retry по ошибкам валидации) → сборка
// файлов → самопроверка через vitest → ветка + draft-PR на GitHub.
type Service struct {
	Options
}

func NewService(opts Options) *Service {
	if opts.Log == nil {
		opts.Log = slog.Default()
	}
	return &Service{Options: opts}
}

// ValidateInput проверяет данные формы.
func (s *Service) ValidateInput(in Input) error {
	if strings.TrimSpace(in.Description) == "" {
		return fmt.Errorf("%w: описание задачи обязательно", ErrInvalidInput)
	}
	if len(in.Description) > 20000 {
		return fmt.Errorf("%w: описание слишком длинное (макс. 20000 символов)", ErrInvalidInput)
	}
	if len(in.UserSolution) > 50000 || len(in.Notes) > 5000 || len(in.Title) > 200 || len(in.SourceURL) > 2000 {
		return fmt.Errorf("%w: превышен размер одного из полей формы", ErrInvalidInput)
	}
	return nil
}

// Propose выполняет весь пайплайн генерации задачи.
func (s *Service) Propose(ctx context.Context, in Input) (*Result, error) {
	if err := s.ValidateInput(in); err != nil {
		return nil, err
	}

	topics := DiscoverTopics(s.TasksRoot)
	if len(topics) == 0 {
		return nil, fmt.Errorf("в tasks/ не найдено ни одной категории")
	}
	taskCounts := s.topicCounts()

	// ── LLM + валидация с retry ────────────────────────────────────────────
	system := BuildSystemMessage(s.TasksRoot, taskCounts)
	messages := []llmMessage{
		{Role: "system", Content: system},
		{Role: "user", Content: BuildUserMessage(in)},
	}

	const validationRetries = 2
	var task *GeneratedTask
	var lastErrors []string

	for attempt := 0; attempt <= validationRetries; attempt++ {
		var raw string
		var err error
		if s.LLMMock {
			raw, err = (&MockLLM{}).Chat(ctx, messages)
		} else {
			raw, err = s.LLM.Chat(ctx, messages)
		}
		if err != nil {
			return nil, ClassifyLLMError(err)
		}

		data, err := ParseJSONContent(raw)
		if err != nil {
			lastErrors = []string{err.Error()}
		} else {
			task = &GeneratedTask{}
			if err := json.Unmarshal(data, task); err != nil {
				lastErrors = []string{fmt.Sprintf("невалидный JSON: %v", err)}
				task = nil
			}
		}

		if task != nil {
			lastErrors = ValidateTask(task, topics, s.TasksRoot)
			if len(lastErrors) == 0 {
				break
			}
		}

		if attempt >= validationRetries {
			return nil, &LLMError{
				Code:    CodeValidation,
				Message: fmt.Sprintf("ИИ вернул некорректную задачу после %d попыток — попробуйте переформулировать запрос", attempt+1),
			}
		}
		s.Log.Warn("proposal validation retry", "attempt", attempt+1, "errors", lastErrors)
		messages = append(messages,
			llmMessage{Role: "assistant", Content: raw},
			llmMessage{Role: "user", Content: BuildValidationFeedback(lastErrors, task)},
		)
		task = nil
	}

	// ── Сборка файлов и самопроверка ───────────────────────────────────────
	num := NextTaskNumber(s.TasksRoot, task.Topic)
	taskID := task.Topic + "/" + num + "-" + task.Slug
	files := BuildFileContents(task)

	res := &Result{
		TaskID: taskID,
		Topic:  task.Topic,
		Slug:   task.Slug,
		Title:  task.Title,
		Files:  files,
	}
	res.SelfCheck = s.selfCheck(ctx, taskID, files)

	// ── Ветка + PR ────────────────────────────────────────────────────────
	branch := "task/" + strings.ReplaceAll(taskID, "/", "-")
	res.Branch = branch

	fileMap := map[string]string{
		filepath.Join("backend", "tasks", task.Topic, num+"-"+task.Slug, "meta.json"):        files.MetaJSON,
		filepath.Join("backend", "tasks", task.Topic, num+"-"+task.Slug, "condition.md"):     files.Condition,
		filepath.Join("backend", "tasks", task.Topic, num+"-"+task.Slug, "template.ts"):      files.Template,
		filepath.Join("backend", "tasks", task.Topic, num+"-"+task.Slug, "solution.ts"):      files.Solution,
		filepath.Join("backend", "tasks", task.Topic, num+"-"+task.Slug, "hints.md"):         files.Hints,
		filepath.Join("backend", "tasks", task.Topic, num+"-"+task.Slug, "tests", "test.ts"): files.Test,
	}

	if s.DryRun {
		res.DryRun = true
		res.PRURL = "dry-run://" + branch
		s.Log.Info("proposal dry-run", "taskId", taskID, "selfCheckPassed", res.SelfCheck.Passed)
		return res, nil
	}

	prURL, err := s.GitHub.CreateBranchAndPR(ctx, branch, s.BaseBranch, fileMap,
		"Задача: "+task.Title, PRBody(res))
	if err != nil {
		return nil, fmt.Errorf("создание pull request: %w", err)
	}
	res.PRURL = prURL
	s.Log.Info("proposal PR created", "taskId", taskID, "pr", prURL)
	return res, nil
}

// selfCheck прогоняет эталонное решение сгенерированной задачи через vitest-раннер.
func (s *Service) selfCheck(ctx context.Context, taskID string, files TaskFiles) SelfCheck {
	if s.Runner == nil {
		return SelfCheck{}
	}
	task := domain.TaskFull{
		TaskSummary: domain.TaskSummary{ID: taskID, Language: domain.LanguageTypeScript},
		TestFile:    files.Test,
	}
	result := s.Runner.Run(ctx, task, files.Solution)
	return SelfCheck{
		Passed:     result.Passed,
		Total:      result.Total,
		Failed:     result.Failed,
		DurationMs: result.DurationMs,
		Stderr:     result.Stderr,
	}
}

func (s *Service) topicCounts() map[string]int {
	counts := make(map[string]int)
	entries, err := os.ReadDir(s.TasksRoot)
	if err != nil {
		return counts
	}
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		taskEntries, err := os.ReadDir(filepath.Join(s.TasksRoot, e.Name()))
		if err != nil {
			continue
		}
		numRe := regexp.MustCompile(`^\d{3,}-`)
		for _, te := range taskEntries {
			if te.IsDir() && numRe.MatchString(te.Name()) {
				counts[e.Name()]++
			}
		}
	}
	return counts
}
