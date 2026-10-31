package question

import (
	"context"
	"fmt"
	"strings"
	"unicode/utf8"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

// UserQuestionStore — хранилище собственных вопросов (postgres.UserQuestionRepo).
type UserQuestionStore interface {
	List(ctx context.Context, userID string) ([]domain.UserQuestion, error)
	Create(ctx context.Context, userID string, question, answer, category string) (domain.UserQuestion, error)
	Update(ctx context.Context, id, userID, question, answer, category string) (domain.UserQuestion, error)
	Delete(ctx context.Context, id, userID string) (bool, error)
}

// UserQuestionService — CRUD собственных вопросов пользователя.
type UserQuestionService struct {
	Store UserQuestionStore
}

const (
	maxUserQuestionLen = 2000
	maxUserAnswerLen   = 20000
	maxCategoryLen     = 200
)

func validateDraft(question, answer, category string) error {
	question = strings.TrimSpace(question)
	if question == "" {
		return fmt.Errorf("вопрос не может быть пустым")
	}
	if utf8.RuneCountInString(question) > maxUserQuestionLen {
		return fmt.Errorf("вопрос слишком длинный (макс. %d символов)", maxUserQuestionLen)
	}
	if utf8.RuneCountInString(answer) > maxUserAnswerLen {
		return fmt.Errorf("ответ слишком длинный (макс. %d символов)", maxUserAnswerLen)
	}
	if len(category) > maxCategoryLen {
		return fmt.Errorf("категория слишком длинная")
	}
	if strings.Contains(question, "\n#") || strings.HasPrefix(question, "#") {
		return fmt.Errorf("в тексте вопроса запрещены markdown-заголовки")
	}
	if answer != "" && strings.Contains(answer, "\n## ") {
		return fmt.Errorf("в ответе запрещены заголовки ## — они зарезервированы для вопросов")
	}
	return nil
}

func (s *UserQuestionService) List(ctx context.Context, userID string) ([]domain.UserQuestion, error) {
	return s.Store.List(ctx, userID)
}

func (s *UserQuestionService) Create(ctx context.Context, userID, question, answer, category string) (domain.UserQuestion, error) {
	if err := validateDraft(question, answer, category); err != nil {
		return domain.UserQuestion{}, err
	}
	return s.Store.Create(ctx, userID, strings.TrimSpace(question), strings.TrimSpace(answer), category)
}

func (s *UserQuestionService) Update(ctx context.Context, id, userID, question, answer, category string) (domain.UserQuestion, error) {
	if err := validateDraft(question, answer, category); err != nil {
		return domain.UserQuestion{}, err
	}
	return s.Store.Update(ctx, id, userID, strings.TrimSpace(question), strings.TrimSpace(answer), category)
}

func (s *UserQuestionService) Delete(ctx context.Context, id, userID string) error {
	ok, err := s.Store.Delete(ctx, id, userID)
	if err != nil {
		return err
	}
	if !ok {
		return domain.ErrNotFound
	}
	return nil
}
