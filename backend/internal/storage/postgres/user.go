package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type UserRepo struct {
	db QueryExecer
}

func NewUserRepo(db QueryExecer) *UserRepo {
	return &UserRepo{db: db}
}

func scanUser(row pgx.Row) (domain.User, error) {
	var u domain.User
	var login, hash *string
	err := row.Scan(&u.ID, &login, &hash, &u.IsAnonymous)
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

func (r *UserRepo) CreateAnonymous(ctx context.Context) (domain.User, error) {
	return scanUser(r.db.QueryRow(ctx,
		`INSERT INTO users (is_anonymous) VALUES (true) RETURNING id, login, password_hash, is_anonymous`))
}

func (r *UserRepo) FindByLogin(ctx context.Context, login string) (domain.User, error) {
	return scanUser(r.db.QueryRow(ctx,
		`SELECT id, login, password_hash, is_anonymous FROM users WHERE login = $1`, login))
}

func (r *UserRepo) FindByID(ctx context.Context, id string) (domain.User, error) {
	return scanUser(r.db.QueryRow(ctx,
		`SELECT id, login, password_hash, is_anonymous FROM users WHERE id = $1`, id))
}

func (r *UserRepo) Register(ctx context.Context, userID, login, passwordHash string) (domain.User, error) {
	return scanUser(r.db.QueryRow(ctx,
		`UPDATE users SET login = $2, password_hash = $3, is_anonymous = false
		 WHERE id = $1 AND is_anonymous
		 RETURNING id, login, password_hash, is_anonymous`,
		userID, login, passwordHash))
}

func (r *UserRepo) Delete(ctx context.Context, userID string) error {
	_, err := r.db.Exec(ctx, `DELETE FROM users WHERE id = $1`, userID)
	return err
}

// DeleteStaleAnonymous удаляет анонимных пользователей без сессий старше
// olderThan. app_state, user_questions и llm_jobs удаляются каскадом.
func (r *UserRepo) DeleteStaleAnonymous(ctx context.Context, olderThan time.Duration) (int64, error) {
	tag, err := r.db.Exec(ctx, `
		DELETE FROM users
		WHERE is_anonymous
		  AND created_at < now() - $1::interval
		  AND NOT EXISTS (SELECT 1 FROM sessions s WHERE s.user_id = users.id)`,
		olderThan.String())
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}
