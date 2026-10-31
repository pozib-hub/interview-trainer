package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/auth"
	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type SessionRepo struct {
	db QueryExecer
}

func NewSessionRepo(db QueryExecer) *SessionRepo {
	return &SessionRepo{db: db}
}

func (r *SessionRepo) Create(ctx context.Context, userID string, ttl time.Duration) (string, error) {
	token, err := auth.NewSessionToken()
	if err != nil {
		return "", err
	}
	_, err = r.db.Exec(ctx,
		`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES ($1, $2, $3)`,
		auth.HashToken(token), userID, time.Now().Add(ttl))
	if err != nil {
		return "", err
	}
	return token, nil
}

func (r *SessionRepo) FindUser(ctx context.Context, token string) (domain.User, error) {
	var u domain.User
	var login, hash *string
	err := r.db.QueryRow(ctx,
		`SELECT u.id, u.login, u.password_hash, u.is_anonymous
		 FROM sessions s JOIN users u ON u.id = s.user_id
		 WHERE s.token_hash = $1 AND s.expires_at > now()`,
		auth.HashToken(token)).Scan(&u.ID, &login, &hash, &u.IsAnonymous)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.User{}, ErrNotFound
	}
	if err != nil {
		return domain.User{}, err
	}
	if login != nil {
		u.Login = *login
	}
	if hash != nil {
		u.PasswordHash = *hash
	}
	return u, nil
}

func (r *SessionRepo) Delete(ctx context.Context, token string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM sessions WHERE token_hash = $1`, auth.HashToken(token))
	return err
}

func (r *SessionRepo) DeleteExpired(ctx context.Context) (int64, error) {
	tag, err := r.db.Exec(ctx, `DELETE FROM sessions WHERE expires_at < now()`)
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}
