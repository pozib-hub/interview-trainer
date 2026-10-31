package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/pozib-hub/interview-trainer-v2/backend/internal/domain"
)

type JobRepo struct {
	db QueryExecer
}

func NewJobRepo(db QueryExecer) *JobRepo {
	return &JobRepo{db: db}
}

func scanJob(row pgx.Row) (domain.Job, error) {
	var j domain.Job
	var request json.RawMessage
	var result []byte
	var errText *string
	var createdAt, updatedAt time.Time
	err := row.Scan(&j.ID, &j.UserID, &j.Kind, &j.Status, &request, &result, &errText, &createdAt, &updatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.Job{}, ErrNotFound
	}
	if err != nil {
		return domain.Job{}, err
	}
	if result != nil {
		j.Result = json.RawMessage(result)
	}
	if errText != nil {
		j.Error = *errText
	}
	j.CreatedAt = createdAt.UnixMilli()
	j.UpdatedAt = updatedAt.UnixMilli()
	return j, nil
}

func (r *JobRepo) Create(ctx context.Context, userID string, kind domain.JobKind, request any) (domain.Job, error) {
	raw, err := json.Marshal(request)
	if err != nil {
		return domain.Job{}, err
	}
	return scanJob(r.db.QueryRow(ctx,
		`INSERT INTO llm_jobs (user_id, kind, request)
		 VALUES ($1, $2, $3)
		 RETURNING id, user_id, kind, status, request, result, error, created_at, updated_at`,
		userID, kind, raw))
}

func (r *JobRepo) Get(ctx context.Context, id, userID string) (domain.Job, error) {
	return scanJob(r.db.QueryRow(ctx,
		`SELECT id, user_id, kind, status, request, result, error, created_at, updated_at
		 FROM llm_jobs WHERE id = $1 AND user_id = $2`, id, userID))
}

func (r *JobRepo) SetRunning(ctx context.Context, id string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE llm_jobs SET status = 'running', updated_at = now()
		 WHERE id = $1 AND status = 'pending'`, id)
	return err
}

func (r *JobRepo) SetResult(ctx context.Context, id string, result any) error {
	raw, err := json.Marshal(result)
	if err != nil {
		return err
	}
	_, err = r.db.Exec(ctx,
		`UPDATE llm_jobs SET status = 'done', result = $2, error = NULL, updated_at = now()
		 WHERE id = $1`, id, raw)
	return err
}

func (r *JobRepo) SetError(ctx context.Context, id, errMsg string) error {
	_, err := r.db.Exec(ctx,
		`UPDATE llm_jobs SET status = 'failed', error = $2, updated_at = now()
		 WHERE id = $1`, id, errMsg)
	return err
}

func (r *JobRepo) FailAllPending(ctx context.Context, reason string) (int64, error) {
	tag, err := r.db.Exec(ctx,
		`UPDATE llm_jobs SET status = 'failed', error = $1, updated_at = now()
		 WHERE status IN ('pending', 'running')`, reason)
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}

// DeleteOlderThan удаляет завершённые задачи старше cutoff (ретеншн).
func (r *JobRepo) DeleteOlderThan(ctx context.Context, olderThan time.Duration) (int64, error) {
	tag, err := r.db.Exec(ctx,
		`DELETE FROM llm_jobs WHERE created_at < now() - $1::interval AND status IN ('done', 'failed')`,
		olderThan.String())
	if err != nil {
		return 0, err
	}
	return tag.RowsAffected(), nil
}
