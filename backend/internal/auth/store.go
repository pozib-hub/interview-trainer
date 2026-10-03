package auth

import (
	"context"
	"time"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type UserStore interface {
	CreateAnonymous(ctx context.Context) (domain.User, error)
	FindByLogin(ctx context.Context, login string) (domain.User, error)
	Register(ctx context.Context, userID, login, passwordHash string) (domain.User, error)
}

type SessionStore interface {
	Create(ctx context.Context, userID string, ttl time.Duration) (token string, err error)
	FindUser(ctx context.Context, token string) (domain.User, error)
	Delete(ctx context.Context, token string) error
}
