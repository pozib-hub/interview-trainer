package storage

import (
	"context"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type StateRepository interface {
	Get(ctx context.Context, userID string) (domain.AppData, error)
	Save(ctx context.Context, userID string, data domain.AppData) error
	Patch(ctx context.Context, userID string, apply func(current domain.AppData) domain.AppData) (domain.AppData, error)
}

type UserRepository interface {
	CreateAnonymous(ctx context.Context) (domain.User, error)
	FindByLogin(ctx context.Context, login string) (domain.User, error)
	Register(ctx context.Context, userID, login, passwordHash string) (domain.User, error)
	Delete(ctx context.Context, userID string) error
	// DeleteStaleAnonymous удаляет анонимных пользователей без активных
	// сессий старше olderThan (сервисные данные удаляются каскадом).
	DeleteStaleAnonymous(ctx context.Context, olderThan time.Duration) (int64, error)
}

type SessionRepository interface {
	Create(ctx context.Context, userID string, ttl time.Duration) (token string, err error)
	FindUser(ctx context.Context, token string) (domain.User, error)
	Delete(ctx context.Context, token string) error
	// DeleteExpired чистит истёкшие сессии (иначе таблица растёт бесконечно).
	DeleteExpired(ctx context.Context) (int64, error)
}

type UserQuestionRepository interface {
	List(ctx context.Context, userID string) ([]domain.UserQuestion, error)
	Create(ctx context.Context, userID string, question, answer, category string) (domain.UserQuestion, error)
	Update(ctx context.Context, id, userID, question, answer, category string) (domain.UserQuestion, error)
	Delete(ctx context.Context, id, userID string) (bool, error)
	TransferAll(ctx context.Context, fromUserID, toUserID string) error
}
