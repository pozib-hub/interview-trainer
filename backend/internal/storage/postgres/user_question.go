package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type UserQuestionRepo struct {
	db QueryExecer
}

func NewUserQuestionRepo(db QueryExecer) *UserQuestionRepo {
	return &UserQuestionRepo{db: db}
}

func scanUserQuestion(row interface{ Scan(dest ...any) error }) (domain.UserQuestion, error) {
	var q domain.UserQuestion
	var createdAt, updatedAt time.Time
	err := row.Scan(&q.ID, &q.UserID, &q.Question, &q.Answer, &q.Category, &createdAt, &updatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.UserQuestion{}, ErrNotFound
	}
	if err != nil {
		return domain.UserQuestion{}, err
	}
	q.CreatedAt = createdAt.UnixMilli()
	q.UpdatedAt = updatedAt.UnixMilli()
	return q, nil
}

func (r *UserQuestionRepo) List(ctx context.Context, userID string) ([]domain.UserQuestion, error) {
	rows, err := r.db.Query(ctx,
		`SELECT id, user_id, question, answer, category, created_at, updated_at
		 FROM user_questions WHERE user_id = $1 ORDER BY created_at DESC, id`, userID)
	if err != nil {
		return nil, fmt.Errorf("list user questions: %w", err)
	}
	defer rows.Close()

	items := []domain.UserQuestion{}
	for rows.Next() {
		q, err := scanUserQuestion(rows)
		if err != nil {
			return nil, fmt.Errorf("scan user question: %w", err)
		}
		items = append(items, q)
	}
	return items, rows.Err()
}

func (r *UserQuestionRepo) Create(ctx context.Context, userID string, question, answer, category string) (domain.UserQuestion, error) {
	q, err := scanUserQuestion(r.db.QueryRow(ctx,
		`INSERT INTO user_questions (user_id, question, answer, category)
		 VALUES ($1, $2, $3, $4)
		 RETURNING id, user_id, question, answer, category, created_at, updated_at`,
		userID, question, answer, category))
	if err != nil {
		return domain.UserQuestion{}, fmt.Errorf("create user question: %w", err)
	}
	return q, nil
}

func (r *UserQuestionRepo) Update(ctx context.Context, id, userID, question, answer, category string) (domain.UserQuestion, error) {
	q, err := scanUserQuestion(r.db.QueryRow(ctx,
		`UPDATE user_questions SET question = $3, answer = $4, category = $5, updated_at = now()
		 WHERE id = $1 AND user_id = $2
		 RETURNING id, user_id, question, answer, category, created_at, updated_at`,
		id, userID, question, answer, category))
	if err != nil {
		return domain.UserQuestion{}, fmt.Errorf("update user question: %w", err)
	}
	return q, nil
}

func (r *UserQuestionRepo) Delete(ctx context.Context, id, userID string) (bool, error) {
	tag, err := r.db.Exec(ctx,
		`DELETE FROM user_questions WHERE id = $1 AND user_id = $2`, id, userID)
	if err != nil {
		return false, fmt.Errorf("delete user question: %w", err)
	}
	return tag.RowsAffected() > 0, nil
}

func (r *UserQuestionRepo) TransferAll(ctx context.Context, fromUserID, toUserID string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE user_questions SET user_id = $2, updated_at = now() WHERE user_id = $1`,
		fromUserID, toUserID)
	if err != nil {
		return fmt.Errorf("transfer user questions: %w", err)
	}
	return nil
}
